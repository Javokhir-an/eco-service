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
    "header-cta": "Tepadagi 'Ariza qoldirish' tugmasi",
    "mobile-bar": "Mobil pastki panel",
    "hero-order-form": "Tezkor qo'ng'iroq formasi",
    "pricing-table": "Narxlar jadvalidagi tugma",
    "calculator": "Narx kalkulyatori",
    "service-page-hero": "Sahifa yuqorisidagi tugma",
    "service-page-form": "Sahifa pastidagi forma",
    "category-page-form": "Sahifa pastidagi forma",
    "category-page-card": "Xizmat kartochkasi",
    "aloqa-page-form": "Aloqa formasi",
    "b2b-form": "B2B murojaat formasi",
    "b2b-checklist": "Afzallik kartochkasi",
    "modal-order": "Ariza tugmasi",
    "promo-card": "Aksiya kartochkasi",
}

# Forma "service" maydonini to'ldirmaydi (masalan xizmat sahifasidagi
# qisqa forma) — bunday holda sahifa manzilidan xizmat turini aniqlaymiz.
PAGE_TO_SERVICE = {
    "xizmat-noutbuk-tamirlash.html": "kompyuter",
    "xizmat-kompyuter-yigish.html": "kompyuter",
    "xizmat-monobloq-tamirlash.html": "kompyuter",
    "kategoriya-kompyuter.html": "kompyuter",
    "xizmat-wifi-sozlash.html": "tarmoq",
    "xizmat-server-ornatish.html": "tarmoq",
    "xizmat-video-kuzatuv.html": "tarmoq",
    "kategoriya-tarmoq.html": "tarmoq",
    "xizmat-windows-ornatish.html": "dasturiy",
    "xizmat-virus-tozalash.html": "dasturiy",
    "xizmat-dastur-ornatish.html": "dasturiy",
    "kategoriya-dasturiy.html": "dasturiy",
    "xizmat-hdd-tiklash.html": "malumot",
    "xizmat-flash-tiklash.html": "malumot",
    "xizmat-zaxira-nusxalash.html": "malumot",
    "kategoriya-malumot.html": "malumot",
    "xizmat-printer-tamirlash.html": "printer",
    "xizmat-kartrij-toldirish.html": "printer",
    "xizmat-mfu-xizmat.html": "printer",
    "kategoriya-printer.html": "printer",
    "b2b.html": "b2b",
}

# Telegram xabarida texnik URL o'rniga o'qiladigan sahifa nomini ko'rsatish uchun.
PAGE_LABELS = {
    "": "Bosh sahifa",
    "index.html": "Bosh sahifa",
    "narxlar.html": "Narxlar",
    "mutaxassislar.html": "Mutaxassislar",
    "sharhlar.html": "Sharhlar",
    "aksiyalar.html": "Aksiyalar",
    "aloqa.html": "Aloqa",
    "biz-haqimizda.html": "Biz haqimizda",
    "blog.html": "Blog",
    "b2b.html": "B2B",
    "kategoriya-kompyuter.html": "Kategoriya: Kompyuter va noutbuk",
    "kategoriya-tarmoq.html": "Kategoriya: Tarmoq",
    "kategoriya-dasturiy.html": "Kategoriya: Dasturiy ta'minot",
    "kategoriya-malumot.html": "Kategoriya: Ma'lumotlarni tiklash",
    "kategoriya-printer.html": "Kategoriya: Printer",
    "xizmat-noutbuk-tamirlash.html": "Noutbuk ta'mirlash",
    "xizmat-kompyuter-yigish.html": "Kompyuter yig'ish",
    "xizmat-monobloq-tamirlash.html": "Monobloq ta'mirlash",
    "xizmat-wifi-sozlash.html": "Wi-Fi tarmoq sozlash",
    "xizmat-server-ornatish.html": "Server o'rnatish",
    "xizmat-video-kuzatuv.html": "Video kuzatuv tizimi",
    "xizmat-windows-ornatish.html": "Windows o'rnatish",
    "xizmat-virus-tozalash.html": "Viruslardan tozalash",
    "xizmat-dastur-ornatish.html": "Dastur o'rnatish",
    "xizmat-hdd-tiklash.html": "HDD/SSD dan ma'lumot tiklash",
    "xizmat-flash-tiklash.html": "Flash-kartadan tiklash",
    "xizmat-zaxira-nusxalash.html": "Zaxira nusxalash xizmati",
    "xizmat-printer-tamirlash.html": "Printer ta'mirlash",
    "xizmat-kartrij-toldirish.html": "Kartrij to'ldirish",
    "xizmat-mfu-xizmat.html": "MFU xizmat ko'rsatish",
}


def page_basename(page):
    return page.rstrip("/").rsplit("/", 1)[-1]


def infer_service_from_page(page):
    return PAGE_TO_SERVICE.get(page_basename(page), "")


def get_page_label(page):
    return PAGE_LABELS.get(page_basename(page), page)


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
        # Ikki parallel ishga tushirish (masalan qo'lda va avtomatik signal bir
        # vaqtga to'g'ri kelsa) bitta arizani ikki marta yubormasligi uchun,
        # arizani xabar yuborishdan OLDIN atomik tarzda "egallab olamiz".
        # Boshqa jarayon ulgurib egallab bo'lgan bo'lsa, bu yerda o'tkazib
        # yuboriladi.
        if not claim_submission(db, doc.reference):
            print(f"  [O'TKAZILDI] {doc.id}: boshqa jarayon allaqachon yuborgan")
            continue

        data = doc.to_dict()
        service_key = data.get("service") or infer_service_from_page(data.get("page", ""))
        topic_id = topics.get(service_key) or topics.get("umumiy")

        message = build_message(data, service_key)

        payload = {
            "chat_id": group_id,
            "text": message,
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [[
                    {"text": "Bog'landim 📞", "callback_data": "st:bog_langan:" + doc.id},
                    {"text": "Bajarildi ✅", "callback_data": "st:bajarildi:" + doc.id},
                ]]
            },
        }
        if topic_id:
            payload["message_thread_id"] = topic_id

        resp = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json=payload,
            timeout=15,
        )

        if resp.status_code == 200:
            print(f"  [OK] {doc.id} -> topic {topic_id}")
        else:
            # Yuborish muvaffaqiyatsiz bo'lsa, keyingi ishga tushirishda qayta
            # urinilishi uchun "notified"ni False holatiga qaytaramiz.
            doc.reference.update({"notified": False})
            print(f"  [XATO] {doc.id}: {resp.status_code} {resp.text}", file=sys.stderr)


def claim_submission(db, doc_ref):
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


def build_message(data, service_key=""):
    name = data.get("name") or data.get("organization") or "—"
    phone = data.get("phone", "—")
    service_label = SERVICE_LABELS.get(service_key, service_key or "—")
    source_label = SOURCE_LABELS.get(data.get("source", ""), data.get("source", "—"))
    page = get_page_label(data.get("page", ""))
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
