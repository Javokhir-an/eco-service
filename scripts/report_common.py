# -*- coding: utf-8 -*-
"""
daily_report.py, weekly_report.py va monthly_report.py uchun umumiy
funksiyalar: davr bo'yicha statistika yig'ish, rasmiy PDF yaratish va
Telegram'ga hujjat sifatida yuborish.
"""

import os
from datetime import datetime, timedelta, timezone

import requests
from fpdf import FPDF
from fpdf.enums import XPos, YPos

from notify_telegram import SOURCE_LABELS, SERVICE_LABELS, infer_service_from_page
from stale_reminder import STALE_MINUTES

FONT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
TASHKENT = timezone(timedelta(hours=5))


def aggregate_range(db, start_utc, end_utc):
    docs = list(
        db.collection("submissions")
        .where("createdAt", ">=", start_utc)
        .where("createdAt", "<", end_utc)
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

    return total, by_status, by_source


def trend_line(current_total, previous_total):
    if previous_total == 0:
        return None
    pct = (current_total - previous_total) / previous_total * 100
    arrow = "↑" if pct > 0 else ("↓" if pct < 0 else "→")
    return f"O'tgan davrga nisbatan: {arrow} {abs(pct):.0f}% (avval {previous_total} ta edi)"


def build_report_pdf(title, subtitle, total, by_status, by_source, problems, path, extra_line=None):
    pdf = FPDF()
    pdf.add_font("DejaVu", "", os.path.join(FONT_DIR, "DejaVuSans.ttf"))
    pdf.add_font("DejaVu", "B", os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf"))
    pdf.add_page()

    pdf.set_font("DejaVu", "B", 18)
    pdf.cell(0, 12, "ECO SERVICE", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("DejaVu", "", 12)
    pdf.set_text_color(90, 90, 90)
    pdf.cell(0, 8, f"{title} — {subtitle}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_text_color(0, 0, 0)

    if extra_line:
        pdf.set_font("DejaVu", "", 11)
        pdf.set_text_color(40, 90, 170)
        pdf.cell(0, 7, extra_line, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_text_color(0, 0, 0)

    pdf.ln(4)

    pdf.set_font("DejaVu", "B", 13)
    pdf.cell(0, 9, "Umumiy ko'rsatkichlar", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
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
        pdf.cell(40, 8, value, border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(6)

    pdf.set_font("DejaVu", "B", 13)
    pdf.cell(0, 9, "Bo'limlar bo'yicha taqsimot", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    if by_source:
        pdf.set_font("DejaVu", "B", 11)
        pdf.cell(120, 8, "Bo'lim", border=1)
        pdf.cell(30, 8, "Soni", border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("DejaVu", "", 11)
        for source, count in sorted(by_source.items(), key=lambda kv: -kv[1]):
            label = SOURCE_LABELS.get(source, source)
            pdf.cell(120, 8, label, border=1)
            pdf.cell(30, 8, str(count), border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    else:
        pdf.set_font("DejaVu", "", 11)
        pdf.cell(0, 8, "Bu davrda ariza kelmadi.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(6)

    pdf.set_font("DejaVu", "B", 13)
    if problems:
        pdf.set_text_color(180, 40, 40)
    else:
        pdf.set_text_color(40, 130, 60)
    pdf.cell(0, 9, "Muammolar va e'tibor talab qiladigan holatlar", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("DejaVu", "", 11)
    if not problems:
        pdf.cell(0, 8, "Aniqlangan muammo yo'q — hammasi nazoratda.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    else:
        for line in problems:
            pdf.multi_cell(0, 7, "•  " + line, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)

    pdf.set_font("DejaVu", "", 9)
    pdf.set_text_color(140, 140, 140)
    from datetime import datetime, timezone, timedelta
    tashkent = timezone(timedelta(hours=5))
    generated = datetime.now(tashkent).strftime("%d.%m.%Y %H:%M")
    pdf.cell(0, 6, f"Hisobot avtomatik yaratildi: {generated} (Toshkent vaqti)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.output(path)


def analyze_problems(db, now_tashkent):
    """Hozirgi vaqtdagi muammoli holatlarni topadi (davrdan qat'i nazar bir xil)."""
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


def send_pdf_document(bot_token, group_id, topic_id, pdf_path, caption):
    data = {
        "chat_id": group_id,
        "caption": caption,
        "parse_mode": "HTML",
    }
    if topic_id:
        data["message_thread_id"] = topic_id

    with open(pdf_path, "rb") as pdf_file:
        resp = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendDocument",
            data=data,
            files={"document": (os.path.basename(pdf_path), pdf_file, "application/pdf")},
            timeout=30,
        )
    return resp
