"""
Eco Service — har kuni ertalab (Toshkent vaqti bilan) o'tgan kunning
arizalar bo'yicha qisqacha hisobotini Telegram'ga yuboradi.

Alohida cron jadvali kerak emas — notify_telegram.py bilan bir xil
tez-tez ishga tushiriladigan workflow ichida chaqiriladi. Skript o'zi
"hozir hisobot vaqtimi va bugun allaqachon yuborilganmi" tekshiradi,
shuning uchun boshqa har bir ishga tushirishda darhol chiqib ketadi.

Kerakli muhit o'zgaruvchilari notify_telegram.py bilan bir xil.
"""

import json
import os
from datetime import datetime, timedelta, timezone

import requests
from google.cloud import firestore
from google.oauth2 import service_account

from notify_telegram import SOURCE_LABELS

TASHKENT = timezone(timedelta(hours=5))
REPORT_HOUR = 9  # ertalab soat 9:00 (Toshkent) atrofida yuboriladi
REPORT_WINDOW_MINUTES = 10  # shu oraliqda "hali bugun yuborilmagan" bo'lsa yuboradi

STATUS_LABELS = {
    "yangi": "Yangi",
    "bog_langan": "Bog'lanildi",
    "bajarildi": "Bajarildi",
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

    now_tashkent = datetime.now(TASHKENT)
    in_window = (
        now_tashkent.hour == REPORT_HOUR
        and now_tashkent.minute < REPORT_WINDOW_MINUTES
    )
    if not in_window:
        print(f"Hisobot vaqti emas (hozir Toshkentda {now_tashkent.strftime('%H:%M')}).")
        return

    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
    group_id = os.environ["TELEGRAM_GROUP_ID"]
    topics = json.loads(os.environ["TELEGRAM_TOPICS_JSON"])
    creds_info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"])
    credentials = service_account.Credentials.from_service_account_info(creds_info)
    db = firestore.Client(credentials=credentials, project=creds_info["project_id"])

    today_str = now_tashkent.strftime("%Y-%m-%d")
    log_ref = db.collection("settings").document("dailyReportLog")
    log_snapshot = log_ref.get()
    if log_snapshot.exists and log_snapshot.to_dict().get("lastSentDate") == today_str:
        print("Bugungi hisobot allaqachon yuborilgan.")
        return

    yesterday_start_tashkent = (now_tashkent - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_end_tashkent = yesterday_start_tashkent + timedelta(days=1)
    yesterday_start_utc = yesterday_start_tashkent.astimezone(timezone.utc)
    yesterday_end_utc = yesterday_end_tashkent.astimezone(timezone.utc)

    docs = list(
        db.collection("submissions")
        .where("createdAt", ">=", yesterday_start_utc)
        .where("createdAt", "<", yesterday_end_utc)
        .stream()
    )

    total = len(docs)
    by_status = {"yangi": 0, "bog_langan": 0, "bajarildi": 0}
    by_source = {}
    for doc in docs:
        d = doc.to_dict()
        status = d.get("status", "yangi")
        by_status[status] = by_status.get(status, 0) + 1
        source = d.get("source", "boshqa")
        by_source[source] = by_source.get(source, 0) + 1

    date_label = yesterday_start_tashkent.strftime("%d.%m.%Y")

    if total == 0:
        message = f"📊 <b>Kunlik hisobot — {date_label}</b>\nKecha hech qanday ariza kelmadi."
    else:
        top_source = max(by_source, key=by_source.get) if by_source else None
        top_source_label = SOURCE_LABELS.get(top_source, top_source) if top_source else "—"

        lines = [
            f"📊 <b>Kunlik hisobot — {date_label}</b>",
            f"Jami arizalar: {total}",
            f"🆕 Yangi: {by_status.get('yangi', 0)}",
            f"📞 Bog'lanildi: {by_status.get('bog_langan', 0)}",
            f"✅ Bajarildi: {by_status.get('bajarildi', 0)}",
            f"📍 Eng ko'p bo'lim: {top_source_label}",
        ]
        message = "\n".join(lines)

    payload = {
        "chat_id": group_id,
        "text": message,
        "parse_mode": "HTML",
    }
    umumiy_topic = topics.get("umumiy")
    if umumiy_topic:
        payload["message_thread_id"] = umumiy_topic

    resp = requests.post(
        f"https://api.telegram.org/bot{bot_token}/sendMessage",
        json=payload,
        timeout=15,
    )

    if resp.status_code == 200:
        log_ref.set({"lastSentDate": today_str}, merge=True)
        print(f"Kunlik hisobot yuborildi ({total} ta ariza).")
    else:
        print(f"XATO: hisobot yuborilmadi: {resp.status_code} {resp.text}")


if __name__ == "__main__":
    main()
