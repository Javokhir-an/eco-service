# Telegram guruhga avtomatik ariza xabarnomasi

Yangi arizalar saytdan kelganda, Telegram guruhingizning tegishli mavzusiga
(topic) avtomatik xabar yuboriladi. Karta yoki to'lov shart emas — GitHub
Actions har 3 daqiqada tekshirib turadi.

## 1-qadam: Bot yaratish

1. Telegram'da **@BotFather** ni toping va suhbat boshlang.
2. `/newbot` buyrug'ini yuboring.
3. Bot uchun ism kiriting (masalan `Eco Service Arizalar`).
4. Bot uchun username kiriting — `bot` bilan tugashi shart (masalan `ecoservice_arizalar_bot`).
5. BotFather sizga **token** beradi (masalan `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`) — buni saqlab qo'ying, hech kimga bermang.

## 2-qadam: Guruh yaratish va mavzularni (topics) yoqish

1. Telegram'da yangi guruh yarating (masalan "Eco Service — Arizalar").
2. Guruh sozlamalariga (Edit) kiring → **"Topics"** ni yoqing (Forum rejimi).
3. Har bir xizmat uchun alohida mavzu (topic) yarating:
   - Kompyuter va noutbuk
   - Tarmoq
   - Dasturiy ta'minot
   - Ma'lumot tiklash
   - Printer
   - B2B
   - Umumiy (xizmat turi ko'rsatilmagan arizalar uchun)

## 3-qadam: Botni guruhga qo'shish

1. Guruh a'zolariga botingizni qo'shing (username orqali qidiring).
2. Botni **admin** qiling, kamida quyidagi ruxsatlarni bering: xabar yuborish, mavzularni boshqarish.

## 4-qadam: Guruh va mavzu ID'larini olish

1. Guruhda (istalgan mavzuda) botga biror matn yozib yuboring (masalan "salom").
2. Brauzerda quyidagi manzilni oching (`<TOKEN>` o'rniga o'z tokeningizni qo'ying):
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Javobda `"chat":{"id":-1001234567890,...}` ko'rinishida guruh ID'sini topasiz — bu **TELEGRAM_GROUP_ID**.
4. Har bir mavzuda alohida test xabar yozib, yana shu manzilni qayta oching — har bir xabarda `"message_thread_id": N` ko'rinadi. Shu raqam o'sha mavzuning ID'si.
5. Barcha mavzu ID'larini yozib oling, masalan:

```json
{
  "kompyuter": 2,
  "tarmoq": 4,
  "dasturiy": 6,
  "malumot": 8,
  "printer": 10,
  "b2b": 12,
  "umumiy": 14
}
```

> Eslatma: "Umumiy" mavzusi — Telegram'da guruh yaratilganda avtomatik hosil bo'ladigan birinchi mavzu bo'lishi mumkin, uning ID'si odatda ko'rsatilmaydi (getUpdates'da chiqmasligi mumkin). Agar shunday bo'lsa, "Umumiy" uchun ham alohida yangi mavzu yarating va uning ID'sini oling.

## 5-qadam: Firebase xizmat hisobi kalitini olish

1. https://console.firebase.google.com → loyihangiz (`service-eco`) → ⚙️ **Project settings**
2. **"Service accounts"** tabiga o'ting
3. **"Generate new private key"** tugmasini bosing → **"Generate key"**
4. JSON fayl yuklab olinadi — bu faylni oching, butun matnini nusxalang (keyingi qadamda kerak bo'ladi)

⚠️ **Bu fayl juda maxfiy** — u orqali butun bazangizga to'liq kirish mumkin. Uni hech qayerga (chatga, ochiq joyga) yubormang, faqat GitHub Secrets'ga joylashtiring (keyingi qadam).

## 6-qadam: GitHub Secrets qo'shish

1. GitHub'da repozitoriyingizga o'ting: https://github.com/Javokhir-an/eco-service
2. **Settings** → chap menyudan **Secrets and variables** → **Actions**
3. **"New repository secret"** tugmasi orqali quyidagi 4 ta secret'ni birma-bir qo'shing:

| Nomi | Qiymati |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | 5-qadamda yuklab olingan JSON faylning **butun matni** |
| `TELEGRAM_BOT_TOKEN` | 1-qadamda BotFather bergan token |
| `TELEGRAM_GROUP_ID` | 4-qadamda topilgan guruh ID (masalan `-1001234567890`) |
| `TELEGRAM_TOPICS_JSON` | 4-qadamdagi JSON xarita (bir qatorda, masalan `{"kompyuter":2,"tarmoq":4,"dasturiy":6,"malumot":8,"printer":10,"b2b":12,"umumiy":14}`) |

## 7-qadam: Sinab ko'rish

1. GitHub repozitoriyda **Actions** tabiga o'ting.
2. Chap tomondan **"Telegram'ga yangi arizalarni yuborish"** workflow'ni tanlang.
3. **"Run workflow"** tugmasi orqali qo'lda ishga tushiring.
4. Bir necha soniyadan so'ng natijani ko'ring — muvaffaqiyatli bo'lsa, saytda test ariza qoldirib ko'ring va u Telegram guruhingizga tushishini kuzating (maksimal 3 daqiqa kutish kerak bo'lishi mumkin, chunki avtomatik tekshiruv shu oraliqda ishlaydi).
