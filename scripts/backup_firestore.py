"""
Eco Service — har kuni kechasi (Toshkent vaqti bilan) barcha Firestore
ma'lumotlarini (arizalar, sharhlar, narxlar, mutaxassislar, aksiyalar,
blog, sozlamalar) bitta JSON faylga yig'ib, Telegram guruhiga fayl
sifatida yuboradi.

MUHIM: bu fayl mijozlarning ismi/telefon raqami kabi shaxsiy
ma'lumotlarni o'z ichiga oladi — shuning uchun ochiq (public) GitHub
repo'siga EMAS, faqat yopiq Telegram guruhiga yuboriladi.

daily_report.py bilan bir vaqtda, bir xil workflow ichida chaqiriladi.
Kerakli muhit o'zgaruvchilari ham bir xil.
"""

import json
import os
import tempfile
from datetime import datetime, date

import requests
from google.cloud import firestore
from google.oauth2 import service_account

from report_common import TASHKENT

BACKUP_HOUR = 3  # kechasi soat 3:00 (Toshkent) atrofida, tinch vaqtda
BACKUP_WINDOW_MINUTES = 10

COLLECTIONS = [
    "submissions",
    "reviews",
    "prices",
    "specialists",
    "promotions",
    "blogPosts",
    "settings",
]

REQUIRED_VARS = [
    "FIREBASE_SERVICE_ACCOUNT_JSON",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_GROUP_ID",
    "TELEGRAM_TOPICS_JSON",
]


def serialize(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: serialize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [serialize(v) for v in value]
    if hasattr(value, "path"):  # DocumentReference
        return str(value.path)
    return value


def main():
    missing = [name for name in REQUIRED_VARS if not os.environ.get(name)]
    if missing:
        print("Sozlanmagan: " + ", ".join(missing) + ". README-TELEGRAM.md qadamlarini bajaring.")
        return

    now_tashkent = datetime.now(TASHKENT)
    in_window = (
        now_tashkent.hour == BACKUP_HOUR
        and now_tashkent.minute < BACKUP_WINDOW_MINUTES
    )
    if not in_window:
        print(f"Backup vaqti emas (hozir Toshkentda {now_tashkent.strftime('%H:%M')}).")
        return

    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
    group_id = os.environ["TELEGRAM_GROUP_ID"]
    topics = json.loads(os.environ["TELEGRAM_TOPICS_JSON"])
    creds_info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"])
    credentials = service_account.Credentials.from_service_account_info(creds_info)
    db = firestore.Client(credentials=credentials, project=creds_info["project_id"])

    today_str = now_tashkent.strftime("%Y-%m-%d")
    log_ref = db.collection("settings").document("backupLog")
    log_snapshot = log_ref.get()
    if log_snapshot.exists and log_snapshot.to_dict().get("lastBackupDate") == today_str:
        print("Bugungi backup allaqachon yuborilgan.")
        return

    backup = {"generatedAt": now_tashkent.isoformat(), "collections": {}}
    total_docs = 0
    for name in COLLECTIONS:
        docs = list(db.collection(name).stream())
        entries = []
        for doc in docs:
            entry = serialize(doc.to_dict())
            entry["id"] = doc.id
            entries.append(entry)
        backup["collections"][name] = entries
        total_docs += len(docs)

    backup_path = os.path.join(tempfile.gettempdir(), f"eco-service-backup-{today_str}.json")
    with open(backup_path, "w", encoding="utf-8") as f:
        json.dump(backup, f, ensure_ascii=False, indent=2)

    caption = (
        f"🗄 <b>Zaxira nusxa — {now_tashkent.strftime('%d.%m.%Y')}</b>\n"
        f"Jami {total_docs} ta hujjat, {len(COLLECTIONS)} ta to'plamdan (submissions, reviews, prices, "
        f"specialists, promotions, blogPosts, settings)."
    )

    data = {"chat_id": group_id, "caption": caption, "parse_mode": "HTML"}
    umumiy_topic = topics.get("umumiy")
    if umumiy_topic:
        data["message_thread_id"] = umumiy_topic

    with open(backup_path, "rb") as backup_file:
        resp = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendDocument",
            data=data,
            files={"document": (os.path.basename(backup_path), backup_file, "application/json")},
            timeout=30,
        )

    os.remove(backup_path)

    if resp.status_code == 200:
        log_ref.set({"lastBackupDate": today_str}, merge=True)
        print(f"Backup yuborildi ({total_docs} ta hujjat).")
    else:
        print(f"XATO: backup yuborilmadi: {resp.status_code} {resp.text}")


if __name__ == "__main__":
    main()
