"""
Eco Service — "Yangi" holatida uzoq vaqt turib qolgan (hali bog'lanilmagan)
arizalar uchun Telegram'ga eslatma yuboradi.

GitHub Actions orqali notify_telegram.py bilan bir vaqtda ishga tushiriladi.
Kerakli muhit o'zgaruvchilari notify_telegram.py bilan bir xil.
"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone

import requests
from google.cloud import firestore
from google.oauth2 import service_account

from notify_telegram import (
    SERVICE_LABELS,
    get_page_label,
    infer_service_from_page,
    escape_html,
)

STALE_MINUTES = 45

REQUIRED_VARS = [
    "FIREBASE_SERVICE_ACCOUNT_JSON",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_GROUP_ID",
    "TELEGRAM_TOPICS_JSON",
]


def main():
    missing = [name for name in REQUIRED_VARS if not os.environ.get(name)]
    if missing:
        print("Sozlanmagan: " + ", ".join(missing) + ". README-TELEGRAM.md qadamlarini bajaring.")
        return

    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
    group_id = os.environ["TELEGRAM_GROUP_ID"]
    topics = json.loads(os.environ["TELEGRAM_TOPICS_JSON"])
    creds_info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"])
    credentials = service_account.Credentials.from_service_account_info(creds_info)
    db = firestore.Client(credentials=credentials, project=creds_info["project_id"])

    cutoff = datetime.now(timezone.utc) - timedelta(minutes=STALE_MINUTES)

    docs = list(db.collection("submissions").where("status", "==", "yangi").stream())
    stale = [
        doc for doc in docs
        if not doc.to_dict().get("reminded")
        and doc.to_dict().get("createdAt")
        and doc.to_dict()["createdAt"] < cutoff
    ]

    if not stale:
        print("Eslatma kerak bo'lgan ariza yo'q.")
        return

    print(f"{len(stale)} ta unutilgan ariza topildi.")

    for doc in stale:
        data = doc.to_dict()
        service_key = data.get("service") or infer_service_from_page(data.get("page", ""))
        topic_id = topics.get(service_key) or topics.get("umumiy")

        name = data.get("name") or data.get("organization") or "—"
        phone = data.get("phone", "—")
        service_label = SERVICE_LABELS.get(service_key, service_key or "—")
        page = get_page_label(data.get("page", ""))

        minutes_ago = int((datetime.now(timezone.utc) - data["createdAt"]).total_seconds() // 60)

        message = "\n".join([
            "⚠️ <b>Eslatma: hali bog'lanilmagan!</b>",
            f"Bu ariza {minutes_ago} daqiqadan beri javobsiz turibdi.",
            f"👤 Ism: {escape_html(name)}",
            f"📞 Telefon: {escape_html(phone)}",
            f"🛠 Xizmat: {escape_html(service_label)}",
            f"🔗 Sahifa: {escape_html(page)}",
        ])

        payload = {
            "chat_id": group_id,
            "text": message,
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [[
                    {"text": "Bog'landim 📞", "callback_data": "st:bog_langan:" + doc.id},
                    {"text": "Bajarildi ✅", "callback_data": "st:bajarildi:" + doc.id},
                ]]
            },
        }
        if topic_id:
            payload["message_thread_id"] = topic_id

        resp = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json=payload,
            timeout=15,
        )

        if resp.status_code == 200:
            doc.reference.update({"reminded": True})
            print(f"  [OK] {doc.id}: eslatma yuborildi ({minutes_ago} daqiqa)")
        else:
            print(f"  [XATO] {doc.id}: {resp.status_code} {resp.text}", file=sys.stderr)


if __name__ == "__main__":
    main()
