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
from datetime import datetime, timedelta, timezone

import requests
from fpdf import FPDF
from fpdf.enums import XPos, YPos
from google.cloud import firestore
from google.oauth2 import service_account

from notify_telegram import SOURCE_LABELS, SERVICE_LABELS, get_page_label, infer_service_from_page
from stale_reminder import STALE_MINUTES

TASHKENT = timezone(timedelta(hours=5))
REPORT_HOUR = 13  # VAQTINCHALIK SINOV QIYMATI — pastda qayta 9 ga o'zgartiriladi
REPORT_WINDOW_MINUTES = 30  # VAQTINCHALIK SINOV QIYMATI — pastda qayta 10 ga o'zgartiriladi

STATUS_LABELS = {
    "yangi": "Yangi",
    "bog_langan": "Bog'lanildi",
    "bajarildi": "Bajarildi",
}

FONT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")

REQUIRED_VARS = [
    "FIREBASE_SERVICE_ACCOUNT_JSON",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_GROUP_ID",
    "TELEGRAM_TOPICS_JSON",
]


def build_pdf(date_label, total, by_status, by_source, problems, path):
    pdf = FPDF()
    pdf.add_font("DejaVu", "", os.path.join(FONT_DIR, "DejaVuSans.ttf"))
    pdf.add_font("DejaVu", "B", os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf"))
    pdf.add_page()

    pdf.set_font("DejaVu", "B", 18)
    pdf.cell(0, 12, "ECO SERVICE", ln=True)
    pdf.set_font("DejaVu", "", 12)
    pdf.set_text_color(90, 90, 90)
    pdf.cell(0, 8, f"Kunlik hisobot — {date_label}", ln=True)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(4)

    pdf.set_font("DejaVu", "B", 13)
    pdf.cell(0, 9, "Umumiy ko'rsatkichlar", ln=True)
    pdf.set_font("DejaVu", "", 11)
    rows = [
        ("Jami tushgan arizalar", str(total)),
        ("Yangi (hali ko'rilmagan)", str(by_status.get("yangi", 0))),
        ("Bog'lanildi", str(by_status.get("bog_langan", 0))),
        ("Bajarildi", str(by_status.get("bajarildi", 0))),
    ]
    for label, value in rows:
        pdf.set_font("DejaVu", "", 11)
        pdf.cell(90, 8, label, border=1)
        pdf.set_font("DejaVu", "B", 11)
        pdf.cell(40, 8, value, border=1, ln=True)
    pdf.ln(6)

    pdf.set_font("DejaVu", "B", 13)
    pdf.cell(0, 9, "Bo'limlar bo'yicha taqsimot", ln=True)
    if by_source:
        pdf.set_font("DejaVu", "B", 11)
        pdf.cell(120, 8, "Bo'lim", border=1)
        pdf.cell(30, 8, "Soni", border=1, ln=True)
        pdf.set_font("DejaVu", "", 11)
        for source, count in sorted(by_source.items(), key=lambda kv: -kv[1]):
            label = SOURCE_LABELS.get(source, source)
            pdf.cell(120, 8, label, border=1)
            pdf.cell(30, 8, str(count), border=1, ln=True)
    else:
        pdf.set_font("DejaVu", "", 11)
        pdf.cell(0, 8, "Kecha ariza kelmadi.", ln=True)
    pdf.ln(6)

    pdf.set_font("DejaVu", "B", 13)
    pdf.set_text_color(180, 40, 40) if problems else pdf.set_text_color(40, 130, 60)
    pdf.cell(0, 9, "Muammolar va e'tibor talab qiladigan holatlar", ln=True)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("DejaVu", "", 11)
    if not problems:
        pdf.cell(0, 8, "Aniqlangan muammo yo'q — hammasi nazoratda.", ln=True)
    else:
        for line in problems:
            pdf.multi_cell(0, 7, "•  " + line, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)

    pdf.set_font("DejaVu", "", 9)
    pdf.set_text_color(140, 140, 140)
    generated = datetime.now(TASHKENT).strftime("%d.%m.%Y %H:%M")
    pdf.cell(0, 6, f"Hisobot avtomatik yaratildi: {generated} (Toshkent vaqti)", ln=True)

    pdf.output(path)


def analyze_problems(db, now_tashkent):
    problems = []

    cutoff = now_tashkent.astimezone(timezone.utc) - timedelta(minutes=STALE_MINUTES)
    open_docs = list(db.collection("submissions").where("status", "==", "yangi").stream())

    stale = []
    for doc in open_docs:
        d = doc.to_dict()
        created = d.get("createdAt")
        if created and created < cutoff:
            stale.append((doc.id, d, created))

    if stale:
        problems.append(
            f"Hozirda {len(stale)} ta ariza {STALE_MINUTES} daqiqadan ko'proq javobsiz turibdi."
        )
        stale.sort(key=lambda item: item[2])
        for doc_id, d, created in stale[:5]:
            name = d.get("name") or d.get("organization") or "—"
            service_key = d.get("service") or infer_service_from_page(d.get("page", ""))
            service_label = SERVICE_LABELS.get(service_key, service_key or "—")
            minutes_ago = int((datetime.now(timezone.utc) - created).total_seconds() // 60)
            hours = minutes_ago // 60
            waited = f"{hours} soat {minutes_ago % 60} daqiqa" if hours else f"{minutes_ago} daqiqa"
            problems.append(f"— {name} ({service_label}): {waited} kutmoqda")

    all_recent_docs = list(
        db.collection("submissions")
        .where("createdAt", ">=", now_tashkent.astimezone(timezone.utc) - timedelta(days=7))
        .stream()
    )
    week_totals = {}
    week_open = {}
    for doc in all_recent_docs:
        d = doc.to_dict()
        source = d.get("source", "boshqa")
        week_totals[source] = week_totals.get(source, 0) + 1
        if d.get("status") == "yangi":
            week_open[source] = week_open.get(source, 0) + 1

    for source, total in week_totals.items():
        opened = week_open.get(source, 0)
        if total >= 3 and opened / total >= 0.6:
            label = SOURCE_LABELS.get(source, source)
            problems.append(
                f"\"{label}\" bo'limidan tushgan arizalarning {int(opened / total * 100)}%i "
                f"(so'nggi 7 kunda) hali javobsiz."
            )

    response_times = []
    for doc in all_recent_docs:
        d = doc.to_dict()
        if d.get("status") in ("bog_langan", "bajarildi") and d.get("createdAt") and d.get("statusUpdatedAt"):
            delta = (d["statusUpdatedAt"] - d["createdAt"]).total_seconds() / 60
            if delta >= 0:
                response_times.append(delta)

    if response_times:
        avg_minutes = sum(response_times) / len(response_times)
        if avg_minutes > 60:
            hours = avg_minutes / 60
            problems.append(
                f"So'nggi 7 kunda o'rtacha javob berish vaqti {hours:.1f} soat — bu biroz sekin, tezlashtirish tavsiya etiladi."
            )

    return problems


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
    if False and log_snapshot.exists and log_snapshot.to_dict().get("lastSentDate") == today_str:  # VAQTINCHALIK SINOV: o'chirilgan
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
    problems = analyze_problems(db, now_tashkent)

    pdf_path = os.path.join(tempfile.gettempdir(), f"kunlik-hisobot-{today_str}.pdf")
    build_pdf(date_label, total, by_status, by_source, problems, pdf_path)

    caption_lines = [
        f"📊 <b>Kunlik hisobot — {date_label}</b>",
        f"Jami arizalar: {total}",
    ]
    if problems:
        caption_lines.append(f"⚠️ {len(problems)} ta e'tibor talab qiladigan holat topildi. Batafsili — PDF'da.")
    else:
        caption_lines.append("✅ Muammo topilmadi.")
    caption = "\n".join(caption_lines)

    data = {
        "chat_id": group_id,
        "caption": caption,
        "parse_mode": "HTML",
    }
    umumiy_topic = topics.get("umumiy")
    if umumiy_topic:
        data["message_thread_id"] = umumiy_topic

    with open(pdf_path, "rb") as pdf_file:
        resp = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendDocument",
            data=data,
            files={"document": (os.path.basename(pdf_path), pdf_file, "application/pdf")},
            timeout=30,
        )

    os.remove(pdf_path)

    if resp.status_code == 200:
        log_ref.set({"lastSentDate": today_str}, merge=True)
        print(f"Kunlik hisobot (PDF) yuborildi ({total} ta ariza, {len(problems)} ta muammo).")
    else:
        print(f"XATO: hisobot yuborilmadi: {resp.status_code} {resp.text}")


if __name__ == "__main__":
    main()
