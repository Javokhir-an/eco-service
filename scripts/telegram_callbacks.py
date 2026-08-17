"""
Eco Service — Telegram xabaridagi "Bog'landim" / "Bajarildi" tugmalari
bosilganini tekshirib, tegishli arizaning holatini Firestore'da
yangilaydi va xabarni tahrirlaydi.

GitHub Actions orqali notify_telegram.py bilan bir vaqtda, har necha
daqiqada ishga tushiriladi. Kerakli muhit o'zgaruvchilari
notify_telegram.py bilan bir xil (FIREBASE_SERVICE_ACCOUNT_JSON,
TELEGRAM_BOT_TOKEN).
"""

import json
import os
import sys

import requests
from google.cloud import firestore
from google.oauth2 import service_account

STATUS_TEXT = {
    "bog_langan": "📞 Bog'lanildi",
    "bajarildi": "✅ Bajarildi",
}

REQUIRED_VARS = ["FIREBASE_SERVICE_ACCOUNT_JSON", "TELEGRAM_BOT_TOKEN"]


def main():
    missing = [name for name in REQUIRED_VARS if not os.environ.get(name)]
    if missing:
        print("Sozlanmagan: " + ", ".join(missing) + ". README-TELEGRAM.md qadamlarini bajaring.")
        return

    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
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

        try:
            db.collection("submissions").document(doc_id).update({"status": status_key})
        except Exception as exc:  # noqa: BLE001 — kutilmagan holatlarda ham keyingi yangilanishlarga davom etamiz
            print(f"  [XATO] {doc_id}: {exc}", file=sys.stderr)
            requests.post(
                f"https://api.telegram.org/bot{bot_token}/answerCallbackQuery",
                json={"callback_query_id": callback["id"], "text": "Xatolik: holat yangilanmadi", "show_alert": True},
                timeout=15,
            )
            continue

        requests.post(
            f"https://api.telegram.org/bot{bot_token}/answerCallbackQuery",
            json={"callback_query_id": callback["id"], "text": "Holat yangilandi: " + STATUS_TEXT[status_key]},
            timeout=15,
        )

        edit_message_status_line(bot_token, callback["message"], status_key)

        handled += 1
        print(f"  [OK] {doc_id} -> {status_key}")

    # Qayta ishlangan yangilanishlarni Telegram tomonida "tasdiqlaymiz" —
    # shu offset orqali ular keyingi safar qaytadan qaytarilmaydi.
    requests.get(
        f"https://api.telegram.org/bot{bot_token}/getUpdates",
        params={"offset": max_update_id + 1},
        timeout=15,
    )

    print(f"{handled} ta tugma bosilishi qayta ishlandi.")


def edit_message_status_line(bot_token, message, status_key):
    old_text = message.get("text", "")
    lines = [line for line in old_text.split("\n") if not line.startswith("📌 Holat:")]
    lines.append("📌 Holat: " + STATUS_TEXT[status_key])
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


if __name__ == "__main__":
    main()
