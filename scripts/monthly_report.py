"""
Eco Service — har oyning 1-kuni ertalab (Toshkent vaqti) o'tgan oyning
arizalar bo'yicha PDF hisobotini, o'tgan oyga nisbatan o'sish/pasayish
tendensiyasi bilan birga, Telegram'ga yuboradi.

daily_report.py bilan bir vaqtda, bir xil workflow ichida chaqiriladi.
Kerakli muhit o'zgaruvchilari ham bir xil.
"""

import json
import os
import tempfile
from datetime import datetime, timedelta, timezone

from google.cloud import firestore
from google.oauth2 import service_account

from report_common import TASHKENT, aggregate_range, analyze_problems, build_report_pdf, send_pdf_document, trend_line

REPORT_HOUR = 9
REPORT_WINDOW_MINUTES = 10

UZ_MONTHS = {
    1: "Yanvar", 2: "Fevral", 3: "Mart", 4: "Aprel", 5: "May", 6: "Iyun",
    7: "Iyul", 8: "Avgust", 9: "Sentabr", 10: "Oktabr", 11: "Noyabr", 12: "Dekabr",
}

REQUIRED_VARS = [
    "FIREBASE_SERVICE_ACCOUNT_JSON",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_GROUP_ID",
    "TELEGRAM_TOPICS_JSON",
]


def month_start(dt):
    return dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def prev_month_start(month_start_dt):
    last_day_of_prev_month = month_start_dt - timedelta(days=1)
    return month_start(last_day_of_prev_month)


def main():
    missing = [name for name in REQUIRED_VARS if not os.environ.get(name)]
    if missing:
        print("Sozlanmagan: " + ", ".join(missing) + ". README-TELEGRAM.md qadamlarini bajaring.")
        return

    now_tashkent = datetime.now(TASHKENT)
    in_window = True  # VAQTINCHALIK SINOV — pastda asl holatga qaytariladi
    if not in_window:
        print(f"Oylik hisobot vaqti emas (hozir Toshkentda {now_tashkent.strftime('%d %H:%M')}).")
        return

    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
    group_id = os.environ["TELEGRAM_GROUP_ID"]
    topics = json.loads(os.environ["TELEGRAM_TOPICS_JSON"])
    creds_info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"])
    credentials = service_account.Credentials.from_service_account_info(creds_info)
    db = firestore.Client(credentials=credentials, project=creds_info["project_id"])

    this_month_start = month_start(now_tashkent)
    month_key = this_month_start.strftime("%Y-%m")

    log_ref = db.collection("settings").document("monthlyReportLog")
    log_snapshot = log_ref.get()
    if log_snapshot.exists and log_snapshot.to_dict().get("lastSentMonth") == month_key:
        print("Shu oyning hisoboti allaqachon yuborilgan.")
        return

    last_month_start = prev_month_start(this_month_start)
    prev_prev_month_start = prev_month_start(last_month_start)

    start_utc = last_month_start.astimezone(timezone.utc)
    end_utc = this_month_start.astimezone(timezone.utc)
    prev_start_utc = prev_prev_month_start.astimezone(timezone.utc)
    prev_end_utc = last_month_start.astimezone(timezone.utc)

    total, by_status, by_source = aggregate_range(db, start_utc, end_utc)
    prev_total, _, _ = aggregate_range(db, prev_start_utc, prev_end_utc)

    period_label = f"{UZ_MONTHS[last_month_start.month]} {last_month_start.year}"
    problems = analyze_problems(db, now_tashkent)
    extra = trend_line(total, prev_total)

    pdf_path = os.path.join(tempfile.gettempdir(), f"oylik-hisobot-{month_key}.pdf")
    build_report_pdf("Oylik hisobot", period_label, total, by_status, by_source, problems, pdf_path, extra_line=extra)

    caption_lines = [
        f"🗓 <b>Oylik hisobot — {period_label}</b>",
        f"Jami arizalar: {total}",
    ]
    if extra:
        caption_lines.append(extra)
    caption = "\n".join(caption_lines)

    umumiy_topic = topics.get("umumiy")
    resp = send_pdf_document(bot_token, group_id, umumiy_topic, pdf_path, caption)
    os.remove(pdf_path)

    if resp.status_code == 200:
        log_ref.set({"lastSentMonth": month_key}, merge=True)
        print(f"Oylik hisobot (PDF) yuborildi ({total} ta ariza).")
    else:
        print(f"XATO: hisobot yuborilmadi: {resp.status_code} {resp.text}")


if __name__ == "__main__":
    main()
