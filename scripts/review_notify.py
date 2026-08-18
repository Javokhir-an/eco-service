"""
Eco Service — yangi (kutilmoqda) mijoz sharhlarini Firestore'dan o'qib,
Telegram guruhiga yuboradi. Administrator to'g'ridan-to'g'ri guruhdagi
tugmani bosib sharhni tasdiqlashi yoki rad etishi mumkin (telegram_callbacks.py
"rv:" prefiksli tugmalarni qayta ishlaydi).

notify_telegram.py bilan bir vaqtda, bir xil workflow ichida chaqiriladi.
Kerakli muhit o'zgaruvchilari ham bir xil.
"""

import json
import os
import sys

import requests
from google.cloud import firestore
from google.oauth2 import service_account

from notify_telegram import escape_html

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

    query = (
        db.collection("reviews")
        .where("status", "==", "kutilmoqda")
        .where("notified", "==", False)
        .limit(50)
    )
    docs = list(query.stream())

    if not docs:
        print("Yangi sharh yo'q.")
        return

    print(f"{len(docs)} ta yangi sharh topildi.")

    for doc in docs:
        if not claim_review(db, doc.reference):
            print(f"  [O'TKAZILDI] {doc.id}: boshqa jarayon allaqachon yuborgan")
            continue

        data = doc.to_dict()
        message = build_message(data)

        payload = {
            "chat_id": group_id,
            "text": message,
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [[
                    {"text": "Tasdiqlash ✅", "callback_data": "rv:tasdiqlangan:" + doc.id},
                    {"text": "Rad etish ❌", "callback_data": "rv:rad_etilgan:" + doc.id},
                ]]
            },
        }
        topic_id = topics.get("umumiy")
        if topic_id:
            payload["message_thread_id"] = topic_id

        resp = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json=payload,
            timeout=15,
        )

        if resp.status_code == 200:
            print(f"  [OK] {doc.id}")
        else:
            doc.reference.update({"notified": False})
            print(f"  [XATO] {doc.id}: {resp.status_code} {resp.text}", file=sys.stderr)


def claim_review(db, doc_ref):
    transaction = db.transaction()
    return _claim_in_transaction(transaction, doc_ref)


@firestore.transactional
def _claim_in_transaction(transaction, doc_ref):
    snapshot = doc_ref.get(transaction=transaction)
    if not snapshot.exists:
        return False
    if snapshot.to_dict().get("notified"):
        return False
    transaction.update(doc_ref, {"notified": True})
    return True


def build_message(data):
    name = data.get("name") or "—"
    rating_raw = data.get("rating")
    text = data.get("text") or ""
    service = data.get("service") or ""

    stars = "⭐" * int(rating_raw) if str(rating_raw).isdigit() else str(rating_raw or "—")

    lines = [
        "💬 <b>Yangi sharh — tasdiqlashni kutmoqda</b>",
        f"👤 Ism: {escape_html(name)}",
        f"⭐ Baho: {stars}",
    ]
    if service:
        lines.append(f"🛠 Xizmat: {escape_html(service)}")
    lines.append(f"📝 Matn: {escape_html(text)}")
    return "\n".join(lines)


if __name__ == "__main__":
    main()
