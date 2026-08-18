"""
Eco Service — har kuni ertalab (Toshkent vaqti bilan) o'tgan kunning
arizalar bo'yicha rasmiy PDF hisobotini Telegram'ga yuboradi.

Hisobotda, oddiy statistikadan tashqari, "Muammolar" bo'limi bor —
u hozirgi vaqtda javobsiz qolgan arizalarni, sekin javob berilgan
manbalarni va o'rtacha javob berish vaqtini o'zi tahlil qilib topadi.

Alohida cron jadvali kerak emas — notify_telegram.py bilan bir xil
tez-tez ishga tushiriladigan workflow ichida chaqiriladi. Skript o'zi
"hozir hisobot vaqtimi va bugun allaqachon yuborilganmi" tekshiradi,
shuning uchun boshqa har bir ishga tushirishda darhol chiqib ketadi.

Kerakli muhit o'zgaruvchilari notify_telegram.py bilan bir xil.
"""

import json
import os
import tempfile
from datetime import timedelta, datetime, timezone

from google.cloud import firestore
from google.oauth2 import service_account

from report_common import TASHKENT, aggregate_range, analyze_problems, build_report_pdf, send_pdf_document

REPORT_HOUR = 9  # ertalab soat 9:00 (Toshkent) atrofida yuboriladi
REPORT_WINDOW_MINUTES = 10  # shu oraliqda "hali bugun yuborilmagan" bo'lsa yuboradi

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

    total, by_status, by_source = aggregate_range(db, yesterday_start_utc, yesterday_end_utc)

    date_label = yesterday_start_tashkent.strftime("%d.%m.%Y")
    problems = analyze_problems(db, now_tashkent)

    pdf_path = os.path.join(tempfile.gettempdir(), f"kunlik-hisobot-{today_str}.pdf")
    build_report_pdf("Kunlik hisobot", date_label, total, by_status, by_source, problems, pdf_path)

    caption_lines = [
        f"📊 <b>Kunlik hisobot — {date_label}</b>",
        f"Jami arizalar: {total}",
    ]
    if problems:
        caption_lines.append(f"⚠️ {len(problems)} ta e'tibor talab qiladigan holat topildi. Batafsili — PDF'da.")
    else:
        caption_lines.append("✅ Muammo topilmadi.")
    caption = "\n".join(caption_lines)

    umumiy_topic = topics.get("umumiy")
    resp = send_pdf_document(bot_token, group_id, umumiy_topic, pdf_path, caption)
    os.remove(pdf_path)

    if resp.status_code == 200:
        log_ref.set({"lastSentDate": today_str}, merge=True)
        print(f"Kunlik hisobot (PDF) yuborildi ({total} ta ariza, {len(problems)} ta muammo).")
    else:
        print(f"XATO: hisobot yuborilmadi: {resp.status_code} {resp.text}")


if __name__ == "__main__":
    main()
