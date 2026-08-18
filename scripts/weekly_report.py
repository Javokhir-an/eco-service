"""
Eco Service — har dushanba ertalab (Toshkent vaqti) o'tgan haftaning
arizalar bo'yicha PDF hisobotini, o'tgan haftaga nisbatan o'sish/pasayish
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
        now_tashkent.weekday() == 0  # dushanba
        and now_tashkent.hour == REPORT_HOUR
        and now_tashkent.minute < REPORT_WINDOW_MINUTES
    )
    if not in_window:
        print(f"Haftalik hisobot vaqti emas (hozir Toshkentda {now_tashkent.strftime('%a %H:%M')}).")
        return

    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
    group_id = os.environ["TELEGRAM_GROUP_ID"]
    topics = json.loads(os.environ["TELEGRAM_TOPICS_JSON"])
    creds_info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"])
    credentials = service_account.Credentials.from_service_account_info(creds_info)
    db = firestore.Client(credentials=credentials, project=creds_info["project_id"])

    this_monday = now_tashkent.replace(hour=0, minute=0, second=0, microsecond=0)
    week_key = this_monday.strftime("%Y-W%W")

    log_ref = db.collection("settings").document("weeklyReportLog")
    log_snapshot = log_ref.get()
    if log_snapshot.exists and log_snapshot.to_dict().get("lastSentWeek") == week_key:
        print("Shu haftaning hisoboti allaqachon yuborilgan.")
        return

    last_monday = this_monday - timedelta(days=7)
    prev_monday = last_monday - timedelta(days=7)

    start_utc = last_monday.astimezone(timezone.utc)
    end_utc = this_monday.astimezone(timezone.utc)
    prev_start_utc = prev_monday.astimezone(timezone.utc)
    prev_end_utc = last_monday.astimezone(timezone.utc)

    total, by_status, by_source = aggregate_range(db, start_utc, end_utc)
    prev_total, _, _ = aggregate_range(db, prev_start_utc, prev_end_utc)

    period_label = f"{last_monday.strftime('%d.%m.%Y')} — {(this_monday - timedelta(days=1)).strftime('%d.%m.%Y')}"
    problems = analyze_problems(db, now_tashkent)
    extra = trend_line(total, prev_total)

    pdf_path = os.path.join(tempfile.gettempdir(), f"haftalik-hisobot-{week_key}.pdf")
    build_report_pdf("Haftalik hisobot", period_label, total, by_status, by_source, problems, pdf_path, extra_line=extra)

    caption_lines = [
        f"📈 <b>Haftalik hisobot — {period_label}</b>",
        f"Jami arizalar: {total}",
    ]
    if extra:
        caption_lines.append(extra)
    caption = "\n".join(caption_lines)

    umumiy_topic = topics.get("umumiy")
    resp = send_pdf_document(bot_token, group_id, umumiy_topic, pdf_path, caption)
    os.remove(pdf_path)

    if resp.status_code == 200:
        log_ref.set({"lastSentWeek": week_key}, merge=True)
        print(f"Haftalik hisobot (PDF) yuborildi ({total} ta ariza).")
    else:
        print(f"XATO: hisobot yuborilmadi: {resp.status_code} {resp.text}")


if __name__ == "__main__":
    main()
