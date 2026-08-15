# Admin panelni ishga tushirish (Firebase sozlash)

Admin panel (arizalar, statistika, narxlarni boshqarish) ishlashi uchun bepul Firebase loyihasi kerak. Bir marta, taxminan 10 daqiqada sozlanadi. Kredit karta talab qilinmaydi.

## 1-qadam: Firebase loyihasini yaratish

1. https://console.firebase.google.com manziliga o'ting, Google hisobingiz bilan kiring.
2. **"Add project" / "Create a project"** tugmasini bosing.
3. Loyiha nomini kiriting, masalan `eco-service` — davom eting (Google Analytics so'ralsa, o'chirib qo'yish mumkin, shart emas).
4. Loyiha yaratilishini kuting.

## 2-qadam: Firestore bazasini yoqish

1. Chap menyudan **Build > Firestore Database** ni tanlang.
2. **Create database** tugmasini bosing.
3. **Production mode** ni tanlang (Standart tanlov).
4. Serverlar joylashuvini tanlang (masalan `eur3 (europe-west)` — O'zbekistonga eng yaqinlaridan biri) va **Enable** ni bosing.

## 3-qadam: Kirish tizimini (Authentication) yoqish

1. Chap menyudan **Build > Authentication** ni tanlang, **Get started** ni bosing.
2. **Sign-in method** bo'limida **Email/Password** ni tanlang, yoqing (Enable), saqlang.
3. **Users** bo'limiga o'ting, **Add user** tugmasini bosing.
4. Admin sifatida kirish uchun email va parol kiriting (masalan o'zingizning ish emailingiz). Shu email/parol admin panelga kirish uchun ishlatiladi.

## 4-qadam: Xavfsizlik qoidalarini (Rules) qo'yish

1. **Firestore Database > Rules** bo'limiga o'ting.
2. Loyiha ildizidagi `firestore.rules` faylining butun matnini nusxalab, mavjud matn o'rniga joylashtiring.
3. **Publish** tugmasini bosing.

## 5-qadam: Veb-ilova kalitlarini olish

1. Chap yuqoridagi tishli g'ildirakcha (⚙️) > **Project settings** ga o'ting.
2. **General** bo'limida pastga tushib, **Your apps** qismida **</>** (Web) belgisini bosing.
3. Ilova nomini kiriting (masalan `eco-service-web`), **Register app** ni bosing.
4. Ochilgan `firebaseConfig` obyektidagi qiymatlarni ko'chirib oling — quyidagicha ko'rinadi:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "eco-service-xxxxx.firebaseapp.com",
  projectId: "eco-service-xxxxx",
  storageBucket: "eco-service-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 6-qadam: Loyihaga joylashtirish

`js/firebase-config.js` faylini oching va yuqoridagi qiymatlarni tegishli joylarga qo'ying (`YOUR_API_KEY` va h.k. o'rniga), so'ng saqlang, commit va push qiling.

> **Eslatma:** Firebase'ning `apiKey`'i maxfiy kalit emas — uni ochiq kodda saqlash xavfsiz va Google tomonidan rasman tavsiya etiladi. Haqiqiy himoya 4-qadamda o'rnatilgan Firestore Rules orqali ta'minlanadi (faqat tizimga kirgan admin ma'lumotlarni o'qiy/yozadi).

## 7-qadam: Sinab ko'rish

1. Sayt push qilingandan (GitHub Pages yangilangandan) so'ng, `https://ecoservice.uz/pages/admin-login.html` (yoki joriy domeningiz) manziliga o'ting.
2. 3-qadamda yaratgan email/parol bilan kiring.
3. Dashboard ochilishi kerak — **Statistika**, **Arizalar**, **Narxlar** bo'limlari ko'rinadi.
4. Saytda istalgan formani (masalan bosh sahifadagi "Ariza qoldirish") to'ldirib yuboring — bir necha soniyadan so'ng u admin paneldagi **Arizalar** jadvalida "Bo'lim" ustuni bilan birga paydo bo'lishi kerak.

## Qo'shimcha admin qo'shish

Xuddi shu email/parolni yana bir xodimga berish o'rniga, **Authentication > Users > Add user** orqali har bir xodim uchun alohida hisob yaratish tavsiya etiladi.
