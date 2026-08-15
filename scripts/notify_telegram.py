"""
Eco Service — yangi arizalarni Firestore'dan o'qib, Telegram guruhining
tegishli mavzusiga (topic) yuboradi.

GitHub Actions orqali har necha daqiqada ishga tushiriladi (bepul, kartasiz).
Kerakli muhit o'zgaruvchilari (GitHub Secrets orqali beriladi):
  - FIREBASE_SERVICE_ACCOUNT_JSON — Firebase xizmat hisobi kaliti (butun JSON matni)
  - TELEGRAM_BOT_TOKEN           — @BotFather bergan token
  - TELEGRAM_GROUP_ID            — guruhning chat_id raqami (masalan -1001234567890)
  - TELEGRAM_TOPICS_JSON         — {"kompyuter": 2, "tarmoq": 3, ..., "umumiy": 1} ko'rinishidagi xarita
"""

import json
import os
import sys

import requests
from google.cloud import firestore
from google.oauth2 import service_account

SERVICE_LABELS = {
    "kompyuter": "Kompyuter va noutbuk",
    "tarmoq": "Tarmoq va server",
    "dasturiy": "Dasturiy ta'minot",
    "malumot": "Ma'lumotlarni tiklash",
    "printer": "Printer va ofis texnikasi",
    "b2b": "Biznes uchun IT (B2B)",
}

SOURCE_LABELS = {
    "header-cta": "Header tugmasi",
    "mobile-bar": "Mobil pastki panel",
    "hero-order-form": "Bosh sahifa formasi",
    "pricing-table": "Narxlar jadvali",
    "calculator": "Kalkulyator",
    "service-page-hero": "Xizmat sahifasi (yuqori CTA)",
    "service-page-form": "Xizmat sahifasi formasi",
    "category-page-form": "Kategoriya sahifasi formasi",
    "aloqa-page-form": "Aloqa sahifasi",
    "b2b-form": "B2B murojaat",
    "modal-order": "Ariza modali (umumiy)",
}


REQUIRED_VARS = [
    "FIREBASE_SERVICE_ACCOUNT_JSON",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_GROUP_ID",
    "TELEGRAM_TOPICS_JSON",
]


def main():
    # Sozlamalar hali GitHub Secrets'ga qo'shilmagan bo'lishi mumkin (masalan,
    # birinchi marta ishga tushirilganda) — bu holatda muvaffaqiyatli chiqamiz,
    # xato sifatida emas, aks holda har safar xato xabarnomasi kelaveradi.
    missing = [name for name in REQUIRED_VARS if not os.environ.get(name)]
    if missing:
        print("Sozlanmagan: " + ", ".join(missing) + ". README-TELEGRAM.md qadamlarini bajaring.")
        return

    service_account_json = os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"]
    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
    group_id = os.environ["TELEGRAM_GROUP_ID"]
    topics = json.loads(os.environ["TELEGRAM_TOPICS_JSON"])

    creds_info = json.loads(service_account_json)
    credentials = service_account.Credentials.from_service_account_info(creds_info)
    db = firestore.Client(credentials=credentials, project=creds_info["project_id"])

    query = db.collection("submissions").where("notified", "==", False).limit(50)
    docs = list(query.stream())

    if not docs:
        print("Yangi ariza yo'q.")
        return

    print(f"{len(docs)} ta yangi ariza topildi.")

    for doc in docs:
        data = doc.to_dict()
        service_key = data.get("service", "")
        topic_id = topics.get(service_key) or topics.get("umumiy")

        message = build_message(data)

        payload = {
            "chat_id": group_id,
            "text": message,
            "parse_mode": "HTML",
        }
        if topic_id:
            payload["message_thread_id"] = topic_id

        resp = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json=payload,
            timeout=15,
        )

        if resp.status_code == 200:
            doc.reference.update({"notified": True})
            print(f"  [OK] {doc.id} -> topic {topic_id}")
        else:
            print(f"  [XATO] {doc.id}: {resp.status_code} {resp.text}", file=sys.stderr)


def build_message(data):
    name = data.get("name") or data.get("organization") or "—"
    phone = data.get("phone", "—")
    service_key = data.get("service", "")
    service_label = SERVICE_LABELS.get(service_key, service_key or "—")
    source_label = SOURCE_LABELS.get(data.get("source", ""), data.get("source", "—"))
    page = data.get("page", "—")
    message_text = data.get("message", "")

    lines = [
        "🆕 <b>Yangi ariza</b>",
        f"👤 Ism: {escape_html(name)}",
        f"📞 Telefon: {escape_html(phone)}",
        f"🛠 Xizmat: {escape_html(service_label)}",
        f"📍 Bo'lim: {escape_html(source_label)}",
        f"🔗 Sahifa: {escape_html(page)}",
    ]
    if message_text:
        lines.append(f"💬 Izoh: {escape_html(message_text)}")
    return "\n".join(lines)


def escape_html(text):
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


if __name__ == "__main__":
    main()
