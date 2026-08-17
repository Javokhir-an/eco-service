"""
Eco Service — Telegram xabaridagi "Bog'landim" / "Bajarildi" tugmalari
bosilganini tekshirib:
  1. Tegishli arizaning holatini Firestore'da yangilaydi (admin panelga
     ham bevosita ta'sir qiladi);
  2. Kim bosganini (Telegram ismi/username) aniqlab, arizani
     "Bog'lanilganlar" yoki "Bajarilganlar" mavzusiga qayta yuboradi;
  3. Asl xabarga holat va kim bog'langanini yozib qo'yadi.

GitHub Actions orqali notify_telegram.py bilan bir vaqtda ishga
tushiriladi. Kerakli muhit o'zgaruvchilari notify_telegram.py bilan
bir xil (FIREBASE_SERVICE_ACCOUNT_JSON, TELEGRAM_BOT_TOKEN,
TELEGRAM_GROUP_ID, TELEGRAM_TOPICS_JSON — oxirgisida "bog_langan" va
"bajarildi" kalitlari ham bo'lishi kerak).
"""

import json
import os
import sys

import requests
from google.cloud import firestore
from google.oauth2 import service_account

from notify_telegram import (
    SERVICE_LABELS,
    get_page_label,
    infer_service_from_page,
    escape_html,
)

STATUS_TEXT = {
    "bog_langan": "📞 Bog'lanildi",
    "bajarildi": "✅ Bajarildi",
}

STATUS_HEADING = {
    "bog_langan": "📞 <b>Bog'lanildi</b>",
    "bajarildi": "✅ <b>Bajarildi</b>",
}

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

    resp = requests.get(
        f"https://api.telegram.org/bot{bot_token}/getUpdates",
        params={"timeout": 0},
        timeout=15,
    )
    data = resp.json()
    if not data.get("ok"):
        print("getUpdates xatoligi:", data, file=sys.stderr)
        return

    updates = data.get("result", [])
    if not updates:
        print("Yangi tugma bosilishi yo'q.")
        return

    max_update_id = 0
    handled = 0

    for update in updates:
        max_update_id = max(max_update_id, update["update_id"])
        callback = update.get("callback_query")
        if not callback:
            continue

        parts = (callback.get("data") or "").split(":")
        if len(parts) != 3 or parts[0] != "st" or parts[1] not in STATUS_TEXT:
            continue
        _, status_key, doc_id = parts

        doc_ref = db.collection("submissions").document(doc_id)
        snapshot = doc_ref.get()
        if not snapshot.exists:
            print(f"  [XATO] {doc_id}: hujjat topilmadi", file=sys.stderr)
            answer_callback(bot_token, callback["id"], "Xatolik: ariza topilmadi", alert=True)
            continue

        submission = snapshot.to_dict()
        doc_ref.update({"status": status_key})

        handler = format_handler(callback.get("from", {}))
        answer_callback(bot_token, callback["id"], "Holat yangilandi: " + STATUS_TEXT[status_key])

        edit_message_status_line(bot_token, callback["message"], status_key, handler)
        forward_to_status_topic(bot_token, group_id, topics, status_key, submission, handler)

        handled += 1
        print(f"  [OK] {doc_id} -> {status_key} ({handler})")

    # Qayta ishlangan yangilanishlarni Telegram tomonida "tasdiqlaymiz" —
    # shu offset orqali ular keyingi safar qaytadan qaytarilmaydi.
    requests.get(
        f"https://api.telegram.org/bot{bot_token}/getUpdates",
        params={"offset": max_update_id + 1},
        timeout=15,
    )

    print(f"{handled} ta tugma bosilishi qayta ishlandi.")


def format_handler(user):
    name = (user.get("first_name") or "").strip()
    if user.get("last_name"):
        name = (name + " " + user["last_name"]).strip()
    username = user.get("username")
    if username:
        return (name + " (@" + username + ")").strip() if name else "@" + username
    return name or "Noma'lum foydalanuvchi"


def answer_callback(bot_token, callback_id, text, alert=False):
    requests.post(
        f"https://api.telegram.org/bot{bot_token}/answerCallbackQuery",
        json={"callback_query_id": callback_id, "text": text, "show_alert": alert},
        timeout=15,
    )


def edit_message_status_line(bot_token, message, status_key, handler):
    old_text = message.get("text", "")
    lines = [
        line for line in old_text.split("\n")
        if not line.startswith("📌 Holat:") and not line.startswith("👨‍💼 Kim:")
    ]
    lines.append("📌 Holat: " + STATUS_TEXT[status_key])
    lines.append("👨‍💼 Kim: " + handler)
    new_text = "\n".join(lines)

    requests.post(
        f"https://api.telegram.org/bot{bot_token}/editMessageText",
        json={
            "chat_id": message["chat"]["id"],
            "message_id": message["message_id"],
            "text": new_text,
            "parse_mode": "HTML",
            "reply_markup": message.get("reply_markup"),
        },
        timeout=15,
    )


def forward_to_status_topic(bot_token, group_id, topics, status_key, submission, handler):
    topic_id = topics.get(status_key)
    if not topic_id:
        return

    service_key = submission.get("service") or infer_service_from_page(submission.get("page", ""))
    name = submission.get("name") or submission.get("organization") or "—"
    phone = submission.get("phone", "—")
    service_label = SERVICE_LABELS.get(service_key, service_key or "—")
    page = get_page_label(submission.get("page", ""))

    lines = [
        STATUS_HEADING[status_key],
        f"👤 Ism: {escape_html(name)}",
        f"📞 Telefon: {escape_html(phone)}",
        f"🛠 Xizmat: {escape_html(service_label)}",
        f"🔗 Sahifa: {escape_html(page)}",
        f"👨‍💼 Kim: {escape_html(handler)}",
    ]

    payload = {
        "chat_id": group_id,
        "message_thread_id": topic_id,
        "text": "\n".join(lines),
        "parse_mode": "HTML",
    }
    requests.post(
        f"https://api.telegram.org/bot{bot_token}/sendMessage",
        json=payload,
        timeout=15,
    )


if __name__ == "__main__":
    main()
