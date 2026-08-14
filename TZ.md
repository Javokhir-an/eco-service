# TEXNIK TOPSHIRIQ (TZ)

## Xizmatlar ko'rsatish markazi uchun veb-sayt (katalog + lead-generation)

| | |
|---|---|
| **Hujjat nomi** | Veb-sayt ishlab chiqish bo'yicha texnik topshiriq |
| **Loyiha nomi** | «SERVIS» — xizmatlar agregatori sayti (shablon) |
| **Namuna (referens)** | service-eco.uz |
| **Sayt tili** | O'zbek (lotin) |
| **Hujjat versiyasi** | 1.0 |
| **Sana** | 2026-yil |
| **Buyurtmachi** | ______________ |
| **Ijrochi** | ______________ |

---

## 1. UMUMIY QOIDALAR

### 1.1. Hujjatning maqsadi

Ushbu hujjat ishlab chiqilishi kerak bo'lgan veb-saytga qo'yiladigan barcha talablarni belgilaydi: tuzilishi, funksionali, dizayni, texnik ko'rsatkichlari, topshirish tartibi va qabul qilish mezonlari. Hujjatda yozilmagan ishlar shartnoma doirasiga kirmaydi va alohida kelishiladi.

### 1.2. Atamalar

| Atama | Izohi |
|---|---|
| **Lid (lead)** | Foydalanuvchi qoldirgan ariza — ism va telefon raqami |
| **Landing** | Bitta xizmat bo'yicha konversiyaga yo'naltirilgan sahifa |
| **Mega-menu** | Ko'p ustunli, ierarxik ochiluvchi katalog menyusi |
| **CTA** | Call To Action — harakatga chorlovchi tugma |
| **CMS** | Kontentni boshqarish tizimi (admin panel) |
| **Breadcrumbs** | "Non ushoqlari" — sahifalar zanjiri navigatsiyasi |
| **Core Web Vitals** | Google'ning sayt tezligi va barqarorligi ko'rsatkichlari |
| **Adaptivlik** | Saytning turli ekran o'lchamlariga moslashuvi |

### 1.3. Loyihaning maqsadi

1. Xizmatlarni yagona katalogda taqdim etish.
2. Tashrif buyuruvchini **lidga** aylantirish (qo'ng'iroq yoki ariza).
3. Qidiruv tizimlaridan (Google, Yandex) organik trafik olish.
4. Kompaniyaning ishonchliligini ko'rsatish (kafolat, mutaxassislar, sharhlar).

### 1.4. Loyihaning asosiy KPI'lari

| Ko'rsatkich | Maqsadli qiymat |
|---|---|
| Saytdan lidga konversiya | ≥ 4% |
| PageSpeed Insights (mobil) | ≥ 85 ball |
| PageSpeed Insights (desktop) | ≥ 95 ball |
| Bosh sahifa yuklanish vaqti (4G) | ≤ 2.5 sek |
| Google Search Console'da indekslangan sahifalar | ≥ 90% |

### 1.5. Maqsadli auditoriya

| Segment | Ehtiyoji | Sayt qanday javob beradi |
|---|---|---|
| Jismoniy shaxs (25–55 yosh), shoshilinch muammo | "Hozir usta kerak" | Katta telefon raqami, 1 klikda ariza, "45 daqiqada yetib boramiz" |
| Narxni solishtiruvchi foydalanuvchi | "Qancha turadi?" | Ochiq narxlar jadvali, kalkulyator |
| Yuridik shaxs (B2B) | Doimiy shartnoma | Alohida B2B sahifa, shartnoma va hisob-faktura |
| Takroriy mijoz | Avvalgi ustani topish | Mutaxassislar bo'limi, shaxsiy kabinet (2-bosqich) |

---

## 2. TEXNOLOGIK TALABLAR

### 2.1. Tavsiya etilayotgan variantlar

| Variant | Stek | Afzalligi | Kamchiligi | Kimga mos |
|---|---|---|---|---|
| **A. Statik** | HTML5 + CSS3 + Vanilla JS, Nginx | Eng tez, arzon hosting, xavfsiz | Kontentni dasturchisiz o'zgartirib bo'lmaydi | Faqat shablon/namuna kerak bo'lsa |
| **B. CMS** | WordPress + ACF Pro + custom tema | Buyurtmachi o'zi kontent boshqaradi, tez ishga tushadi | Yangilanish va xavfsizlikni kuzatib turish kerak | Ko'p sahifali katalog, SEO |
| **C. Zamonaviy** | Next.js (App Router) + Tailwind CSS + PostgreSQL/Strapi | Eng tez SPA + SSR/SSG, kengaytiriladigan | Ishlab chiqish qimmatroq, DevOps talab qiladi | Kelajakda mobil ilova/API rejalashtirilsa |

> **Ushbu TZ bo'yicha tavsiya:** shablon bosqichida **A variant** (statik HTML/CSS/JS, komponentlarga bo'lingan tuzilma bilan). Keyinchalik xuddi shu razmetka WordPress temasi yoki Next.js komponentlariga muammosiz ko'chiriladi.

### 2.2. Majburiy texnik talablar

- Semantik HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- CSS: metodologiya — BEM yoki Tailwind CSS. Inline stillar taqiqlanadi (kritik CSS bundan mustasno).
- JavaScript: ES6+, jQuery'siz. Tashqi kutubxonalar minimal (≤ 3 ta).
- Rasm formatlari: **WebP** (asosiy) + JPEG/PNG (fallback), ikonkalar — **SVG**.
- Lazy loading: barcha ekrandan pastdagi rasmlar uchun `loading="lazy"`.
- Kod versiyalash: **Git** (GitHub/GitLab), commit'lar mazmunli xabar bilan.
- Kod izohlari va papka tuzilishi tushunarli bo'lishi shart.

### 2.3. Hosting va domen talablari

- HTTPS majburiy (Let's Encrypt yoki boshqa SSL), HTTP → HTTPS 301-redirekt.
- `www` va `www`siz versiyalardan biri asosiy, ikkinchisi 301-redirekt.
- Gzip/Brotli siqish yoqilgan.
- Statik fayllar uchun brauzer keshi: `Cache-Control: max-age=31536000` (versiyalangan fayllar uchun).
- Kunlik avtomatik zaxira nusxa (backup), kamida 7 kunlik tarix.

### 2.4. Brauzerlar va qurilmalar

| Brauzer | Minimal versiya |
|---|---|
| Chrome / Edge | oxirgi 2 versiya |
| Safari (macOS, iOS) | 15+ |
| Firefox | oxirgi 2 versiya |
| Samsung Internet | oxirgi 2 versiya |

Sinov qurilmalari: iPhone SE (375px), iPhone 14 (390px), Android (360px), iPad (768px), Laptop (1366px), Desktop (1920px).

### 2.5. Adaptivlik (breakpoint'lar)

| Nomi | Kengligi | Kontent maydoni |
|---|---|---|
| Mobile | 320–575px | 100% − 16px padding |
| Mobile L | 576–767px | 100% − 20px padding |
| Tablet | 768–991px | 720px |
| Laptop | 992–1279px | 960px |
| Desktop | 1280–1599px | 1200px |
| Desktop XL | 1600px+ | 1400px |

Yondashuv: **Mobile First**. Gorizontal skroll hech bir kenglikda bo'lmasligi kerak.

---

## 3. SAYT TUZILISHI (SITEMAP)

```
/                                  Bosh sahifa
├── /xizmatlar/                    Barcha xizmatlar katalogi
│   ├── /xizmatlar/{kategoriya}/           Kategoriya sahifasi
│   │   ├── /xizmatlar/{kategoriya}/{xizmat}/      Xizmat sahifasi (landing)
│   │   │   ├── /xizmatlar/{kategoriya}/{xizmat}/{brend}/   Brend sahifasi
├── /narxlar/                      Narxlar jadvali
├── /mutaxassislar/                Mutaxassislar ro'yxati
│   ├── /mutaxassislar/{id}/       Mutaxassis profili
├── /sharhlar/                     Mijozlar sharhlari
├── /aksiyalar/                    Chegirmalar va aksiyalar
├── /biz-haqimizda/                Kompaniya haqida
├── /b2b/                          Yuridik shaxslar uchun
├── /aloqa/                        Kontaktlar + xarita
├── /blog/                         Foydali maqolalar (SEO)
│   ├── /blog/{slug}/
├── /kabinet/                      Shaxsiy kabinet (2-bosqich)
├── /oferta/                       Ommaviy oferta
├── /maxfiylik/                    Maxfiylik siyosati
├── /sitemap/                      HTML sayt xaritasi
├── /404/                          Xatolik sahifasi
```

### 3.1. Katalog ierarxiyasi (namuna)

**3 daraja:** Kategoriya → Xizmat → Brend/Turi

| Kategoriya | Xizmatlar (namuna) | 3-daraja |
|---|---|---|
| Maishiy texnika ta'miri | kir yuvish mashinasi, muzlatgich, konditsioner, mikroto'lqinli pech | Samsung, LG, Bosch, Artel, Indesit... |
| Kompyuter texnikasi | kompyuter, noutbuk, monobloq, printer | Asus, HP, Lenovo, Acer... |
| Raqamli texnika | televizor, telefon, planshet | brendlar bo'yicha |
| Klining | kvartira tozalash, deraza yuvish, gilam tozalash | xona soni bo'yicha |
| Uy ustasi | santexnik, elektrik, "soatlik usta" | ish turi bo'yicha |
| Qurilish va ta'mir | derazalar, pashshaxona to'r, panjara, buyurtma mebel | tur bo'yicha |
| Boshqa xizmatlar | suv yetkazish, chiqindi olib chiqish, dezinfeksiya, tipografiya | — |
| Mutaxassislar | yurist, psixolog, logoped, shifokor | — |

> Shablon uchun kamida **3 ta kategoriya × 3 ta xizmat × 3 ta brend** to'liq to'ldirilgan holda topshiriladi, qolganlari dublikat sifatida generatsiya qilinadi.

---

## 4. BOSH SAHIFA — BLOKLAR BO'YICHA BATAFSIL

### 4.1. Blok 1 — Yuqori panel (top-bar)

- Chapda: joriy shahar (tanlash imkoniyati bilan, dropdown).
- O'rtada: aksiya matni (masalan: "Diagnostika bepul").
- O'ngda: ish vaqti + ijtimoiy tarmoq ikonkalari (Telegram, Instagram, YouTube).
- Mobil versiyada: yashiriladi yoki faqat shahar qoladi.

### 4.2. Blok 2 — Header (shapka)

Elementlar (chapdan o'ngga):

1. **Logotip** (SVG, bosh sahifaga link, `alt` atributi bilan).
2. **"Xizmatlar" tugmasi** — mega-menuni ochadi.
3. **Qidiruv maydoni** — jonli qidiruv (autocomplete), 2 belgidan boshlab natija chiqadi.
4. **Menyu**: Narxlar · Mutaxassislar · Sharhlar · Aksiyalar · Aloqa.
5. **Telefon raqami** — katta shriftda, `tel:` linki bilan bosiladigan.
6. **CTA tugmasi** — «Ariza qoldirish» (asosiy rang bilan ajratilgan).

**Xatti-harakati:**
- Skroll qilganda header yuqorida "yopishib" qoladi (sticky), balandligi qisqaradi.
- Mobil versiyada: logotip + qidiruv ikonkasi + telefon ikonkasi + burger menyu.
- Mobilda ekran pastida doimiy panel: **[Qo'ng'iroq] [Telegram] [Ariza]**.

### 4.3. Blok 3 — Mega-menu (katalog)

- Ochilganda ekranning to'liq kengligini egallaydi, orqa fon qorayadi.
- Chap ustun — kategoriyalar ro'yxati; ustiga kursor kelganda o'ng tarafda shu kategoriyaning xizmatlari chiqadi.
- Har bir xizmat yonida kichik ikonka.
- Klaviatura bilan boshqarish (Tab, Escape) qo'llab-quvvatlanadi.
- Mobil versiyada: to'liq ekranli akkordeon (kategoriya bosilganda ichkariga "kirib boriladi", orqaga tugmasi bilan).

### 4.4. Blok 4 — Hero (bosh ekran)

- **H1 sarlavha:** «Toshkentdagi tekshirilgan mutaxassislar xizmati» (shahar dinamik almashadi).
- **Qism sarlavha:** «100+ xizmat — bir klikda».
- **Afzalliklar ro'yxati** (6 ta, ikonkalar bilan):
  - 50 000+ bajarilgan buyurtma
  - Bir joyda 100+ xizmat
  - Faqat tekshirilgan ustalar
  - Xizmatga 12 oygacha kafolat
  - Sifat nazorati bo'limi
  - O'rtacha baho 4.9★
- **Forma:** «Qo'ng'iroqni buyurtma qilish» — ism, telefon (maska bilan), tugma. Forma ostida: «Qo'ng'iroq 5–15 daqiqada keladi».
- **Fon rasmi** — WebP, mobilda yengilroq versiya (`<picture>` + `srcset`).

### 4.5. Blok 5 — Xizmatlar grid'i

- Kartochkalar to'ri: desktop — 4 ustun, planshet — 3, mobil — 2 (yoki gorizontal skroll).
- Har bir kartochkada:
  - Ikonka/rasm (SVG yoki WebP);
  - Kategoriya nomi (H3);
  - 3 ta eng mashhur ost-xizmat linki;
  - «Barchasi →» linki.
- Kartochka ustiga kursor kelganda: yengil ko'tarilish (`transform: translateY(-4px)`) va soya.
- Butun kartochka bosiladigan bo'lishi kerak.

### 4.6. Blok 6 — «Nega aynan biz» (raqamlangan afzalliklar)

- 9 ta blok, har birida: tartib raqami (01–09), sarlavha, 2–3 qatorli tavsif, aniq raqam.
- Desktopda: 3×3 to'r. Mobilda: gorizontal slayder + «← Barmoq bilan suring →» ishorasi.
- Mazmun namunasi: xizmatlar soni, 45 daqiqada yetib borish, 24/7 sifat nazorati, tekshirilgan ustalar, 12 oy kafolat, ish jarayonining foto/videosi, qulay to'lov, qat'iy narx, yillik buyurtmalar soni.

### 4.7. Blok 7 — Ish jarayoni (4 qadam)

Gorizontal timeline: **Ariza qoldirasiz → Menejer qo'ng'iroq qiladi → Usta yetib keladi → Ishni qabul qilib to'laysiz**. Har bir qadamda ikonka va 1 qatorli izoh.

### 4.8. Blok 8 — Narxlar

- Tab'lar bilan kategoriyalarga bo'lingan jadval: **Xizmat | Narx (so'mdan) | Muddat**.
- Jadval ostida izoh: «Narxlar diagnostikadan keyin aniqlanadi, ustadan qo'shimcha to'lov so'ralmaydi».
- Har bir qatorda «Buyurtma» tugmasi (modalni ochadi, xizmat nomi formaga avtomatik uzatiladi).
- Mobilda jadval kartochkalarga aylanadi.

### 4.9. Blok 9 — Mutaxassislar

- Kartochka: foto (yumaloq yoki 4:5), F.I.SH., mutaxassisligi, ish tajribasi, baholar soni, reyting (yulduzchalar).
- Slayder ko'rinishida, desktopda 4 ta ko'rinadi.
- Kartochka bosilganda — mutaxassis profili sahifasi ochiladi.

### 4.10. Blok 10 — Sharhlar

- Manba belgisi bilan (Google, Telegram, sayt ichidan).
- Kartochkada: avatar/harf, ism, sana, reyting, matn (3 qatordan keyin «to'liq o'qish»).
- Slayder + «Barcha sharhlar» tugmasi.
- Ixtiyoriy: video-sharhlar bloki (YouTube facade — faqat bosilganda yuklanadi).

### 4.11. Blok 11 — Kalkulyator (ixtiyoriy, tavsiya etiladi)

Xizmat turi va parametrlarni tanlash orqali taxminiy narx hisoblanadi. Natija chiqqach — «Aniq narxni bilish» formasi.

### 4.12. Blok 12 — FAQ (savol-javob)

- Akkordeon ko'rinishida 6–10 ta savol.
- **Majburiy:** `FAQPage` schema.org razmetkasi.

### 4.13. Blok 13 — Kontaktlar

- Manzil, telefon(lar), ish vaqti (ish kunlari / dam olish kunlari alohida).
- Xarita (Yandex Maps yoki Google Maps) — **lazy load**, faqat ekranga yaqinlashganda yuklanadi.
- «Qo'ng'iroq qiling» tugmasi.

### 4.14. Blok 14 — Footer

- 4 ustun: xizmat kategoriyalari (linklar bilan), kompaniya haqida, mijozlarga, aloqa.
- Logotip, ijtimoiy tarmoqlar, mobil ilova banner'lari (agar bo'lsa).
- Huquqiy linklar: ommaviy oferta, maxfiylik siyosati, sayt xaritasi.
- Mualliflik huquqi: © 2014–2026.
- Mobilda ustunlar akkordeonga aylanadi.

---

## 5. ICHKI SAHIFALAR

### 5.1. Xizmat sahifasi (asosiy landing shabloni)

Tuzilishi (yuqoridan pastga):

1. Breadcrumbs.
2. H1 + qisqa tavsif + CTA tugma + narx «... so'mdan».
3. «Biz nimalarni ta'mirlaymiz / qanday ishlaymiz» — ikonkali ro'yxat.
4. Nosozliklar / ish turlari jadvali narxlari bilan.
5. Ish bosqichlari.
6. Kafolat sharti bloki.
7. Ushbu yo'nalish ustalari.
8. Shu xizmat bo'yicha sharhlar.
9. FAQ.
10. Ariza formasi.
11. Bog'liq xizmatlar (perelinkovka uchun).

**Har bir xizmat sahifasida kamida 2 ta konversiya nuqtasi** bo'lishi shart (yuqorida va pastda).

### 5.2. Kategoriya sahifasi

Sarlavha, SEO matn (300–600 belgi yuqorida, 1500–3000 belgi pastda), xizmat kartochkalari to'ri, FAQ, forma.

### 5.3. Boshqa sahifalar

| Sahifa | Asosiy elementlar |
|---|---|
| Biz haqimizda | Kompaniya tarixi, raqamlar, jamoa fotolari, sertifikatlar |
| B2B | Yuridik shaxslarga takliflar, shartnoma namunasi, hisob-faktura, alohida forma |
| Aksiyalar | Aksiya kartochkalari, amal qilish muddati, shartlar |
| Sharhlar | Filtrlash (reyting/xizmat bo'yicha), sharh qoldirish formasi (moderatsiya bilan) |
| Blog | Maqolalar ro'yxati + maqola sahifasi (sarlavhalar, rasmlar, o'qish vaqti, ulashish) |
| 404 | Qidiruv, mashhur xizmatlar, bosh sahifaga qaytish tugmasi |

---

## 6. FUNKSIONAL TALABLAR

### 6.1. Formalar

**Sayt bo'ylab formalar ro'yxati:**

| № | Forma | Joylashuvi | Maydonlari |
|---|---|---|---|
| 1 | Tezkor qo'ng'iroq | Hero, header tugmasi | Ism, telefon |
| 2 | Ariza qoldirish (modal) | Butun sayt bo'ylab | Ism, telefon, xizmat (select), izoh |
| 3 | Xizmat buyurtmasi | Narxlar jadvalidan | Ism, telefon, xizmat (avto) |
| 4 | Sharh qoldirish | Sharhlar sahifasi | Ism, reyting, xizmat, matn |
| 5 | B2B murojaat | B2B sahifasi | Tashkilot, F.I.SH., telefon, email, izoh |
| 6 | Kalkulyator natijasi | Kalkulyator bloki | Telefon + hisoblangan parametrlar |

**Barcha formalarga umumiy talablar:**

- Telefon maskasi: `+998 (__) ___-__-__`, faqat to'g'ri raqam qabul qilinadi.
- Real vaqtda validatsiya, xato matni maydon ostida qizil rangda.
- Spam himoyasi: **honeypot** maydon + Google reCAPTCHA v3 (ko'rinmas) + bir IP'dan 1 daqiqada maks. 3 ta yuborish.
- Yuborilgandan keyin: «Rahmat! Menejer 3 daqiqa ichida bog'lanadi» modali.
- Ma'lumotlar yuboriladi: **admin email + Telegram bot + CRM (agar ulansa) + bazaga yozish**.
- Shaxsiy ma'lumotlarni qayta ishlashga rozilik checkbox'i (maxfiylik siyosatiga link bilan).
- Yuborish tugmasi bosilgach — tugma bloklanadi va loader ko'rsatiladi (ikki marta yuborishning oldini olish).

### 6.2. Qidiruv

- Sayt bo'ylab xizmatlar bo'yicha qidiruv, autocomplete.
- Xatoliklarga chidamli (masalan, "kandisioner" → "konditsioner").
- Natija topilmasa: «Topilmadi — bizga qo'ng'iroq qiling» + forma.

### 6.3. Shahar tanlash

- Modalda shaharlar ro'yxati; tanlov `localStorage`da saqlanadi.
- Tanlangan shahar sarlavhalarda, telefon raqamida va kontaktlarda avtomatik almashadi.

### 6.4. Interaktiv elementlar

- Modal oynalar (Escape va fon bosilganda yopiladi, fokus modal ichida ushlab turiladi).
- Slayderlar (touch/swipe qo'llab-quvvatlanadi).
- Akkordeonlar (FAQ, mobil menyu, footer).
- Skroll bo'ylab yengil animatsiyalar (`prefers-reduced-motion` hisobga olinadi).
- «Yuqoriga» tugmasi.

### 6.5. Admin panel (B/C variantlar uchun)

Buyurtmachi mustaqil boshqara olishi kerak: xizmatlar va kategoriyalar, narxlar, mutaxassislar, sharhlar (moderatsiya bilan), aksiyalar, blog, bosh sahifa bloklari matnlari, kontaktlar va telefon raqamlar, SEO-maydonlar (title, description, H1), arizalar jurnali (eksport CSV/Excel).

---

## 7. DIZAYN TALABLARI

### 7.1. Umumiy uslub

Toza, "havodor", ishonch uyg'otuvchi. Ortiqcha bezaksiz. Asosiy urg'u — CTA tugmalari va telefon raqamiga.

### 7.2. Rang palitrasi (shablon uchun)

| Rol | Rang | Qo'llanilishi |
|---|---|---|
| Asosiy (Primary) | `#1B8A5A` (yashil) | Tugmalar, urg'ular, linklar |
| Asosiy — hover | `#146B45` | Tugma bosilganda |
| Ikkilamchi (Accent) | `#FF7A00` (to'q sariq) | Aksiya, chegirma belgilari |
| Matn — asosiy | `#1A1A1A` | Sarlavhalar, asosiy matn |
| Matn — ikkilamchi | `#6B7280` | Izohlar, meta-ma'lumot |
| Fon — asosiy | `#FFFFFF` | Sahifa foni |
| Fon — ikkilamchi | `#F5F7F6` | Bloklarni ajratish |
| Chegara | `#E5E7EB` | Kartochka va input chegaralari |
| Xato | `#DC2626` | Validatsiya xatolari |

> Ranglar buyurtmachi brend-kitobiga qarab o'zgartirilishi mumkin. Kontrast **WCAG AA** (matn uchun 4.5:1) talabiga javob berishi shart.

### 7.3. Tipografika

- Shrift: **Inter** yoki **Manrope** (lotin + kirill + o'zbek harflarini qo'llab-quvvatlaydi), `font-display: swap`, lokal joylashtirilgan (`woff2`).
- O'lchamlar (desktop / mobil):
  - H1 — 48px / 32px, `font-weight: 700`
  - H2 — 36px / 26px, 700
  - H3 — 24px / 20px, 600
  - Asosiy matn — 16px / 16px, 400, `line-height: 1.6`
  - Kichik matn — 14px, 400
- Bir sahifada **faqat bitta H1**.

### 7.4. Grid va oraliqlar

- 12 ustunli grid, gutter 24px.
- Oraliqlar 4px ning karralari: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Bloklar orasidagi vertikal oraliq: desktop 96px, mobil 48px.
- Burchaklar radiusi: kartochkalar 12px, tugmalar 8px, inputlar 8px.

### 7.5. Tugmalar

| Tur | Ko'rinishi | Qayerda |
|---|---|---|
| Primary | To'ldirilgan, asosiy rang, oq matn | Asosiy CTA |
| Secondary | Chegarali, shaffof fon | Ikkilamchi harakat |
| Text | Faqat matn + strelka | «Batafsil →» |

Minimal bosish maydoni mobilda — **44×44px**.

### 7.6. Maketlar

Ijrochi Figma'da kamida quyidagi maketlarni topshiradi: bosh sahifa (desktop 1440px + mobil 375px), kategoriya sahifasi, xizmat sahifasi, kontaktlar, modallar, UI-kit (ranglar, shriftlar, tugmalar, inputlar, kartochkalar).

### 7.7. Kirish imkoniyati (accessibility)

- Barcha rasmlarda mazmunli `alt`.
- Klaviatura bilan to'liq navigatsiya, ko'rinadigan `:focus` holati.
- Interaktiv elementlarda `aria-label`.
- Ranglar kontrasti WCAG 2.1 AA darajasida.

---

## 8. KONTENT TALABLARI

### 8.1. Kimdan nima

| Kontent | Kim tayyorlaydi |
|---|---|
| Matnlar (sotuvchi, SEO) | Ijrochi (kopirayter) / Buyurtmachi — kelishuvga ko'ra |
| Logotip, brend-kitob | Buyurtmachi |
| Xizmatlar ro'yxati va narxlar | Buyurtmachi |
| Mutaxassislar fotolari | Buyurtmachi |
| Ikonkalar va illyustratsiyalar | Ijrochi (litsenziyali yoki original) |
| Yuridik hujjatlar (oferta, maxfiylik) | Buyurtmachi (yurist) |

### 8.2. Shablon uchun kontent

Namuna bosqichida barcha matnlar **realistik "rÑba"** (o'rinbosar matn) bilan to'ldiriladi — «Lorem ipsum» ishlatilmaydi. Fotolar — litsenziyali stok yoki o'rinbosar bloklar.

### 8.3. Matn talablari

- Matn o'zbek tilida, xatosiz, "siz"lab murojaat.
- Bo'rttirilgan va'dalarsiz, aniq raqamlar bilan.
- Har bir xizmat sahifasida kamida 1500 belgi noyob matn.

---

## 9. SEO TALABLARI

### 9.1. Texnik SEO

- Har bir sahifada noyob `<title>` (50–60 belgi) va `<meta name="description">` (140–160 belgi).
- ChPU manzillar: `/xizmatlar/maishiy-texnika/kir-yuvish-mashinasi/` (translit, lotin, `_` emas `-`).
- `robots.txt` va avtomatik yangilanuvchi `sitemap.xml`.
- `canonical` teglari, dublikatlarning oldini olish.
- 301-redirektlar (eski manzillardan, agar bo'lsa).
- 404 sahifasi to'g'ri javob kodi bilan.
- Sahifalash (pagination) bo'lsa — `rel="next/prev"` yoki noyob sahifalar.

### 9.2. Mikro-razmetka (schema.org, JSON-LD)

Majburiy tiplar: `Organization` / `LocalBusiness` (manzil, telefon, ish vaqti, geo), `BreadcrumbList`, `Service`, `AggregateRating` va `Review`, `FAQPage`, `WebSite` + `SearchAction`.

### 9.3. Open Graph va ijtimoiy tarmoqlar

`og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:type`, `twitter:card`. Favicon to'plami: 16, 32, 180 (apple-touch), 192, 512 + `site.webmanifest`.

### 9.4. Ichki perelinkovka

Har bir xizmat sahifasidan kamida 3 ta bog'liq xizmatga link. Footer'da barcha asosiy kategoriyalarga link. HTML sayt xaritasi sahifasi.

---

## 10. TEZLIK VA OPTIMIZATSIYA

| Ko'rsatkich | Talab |
|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5 sek |
| INP (Interaction to Next Paint) | ≤ 200 ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 |
| Bosh sahifa umumiy og'irligi | ≤ 2 MB (rasmlar bilan) |
| Kritik CSS | Inline, ≤ 14 KB |
| So'rovlar soni (bosh sahifa) | ≤ 50 |

Talablar:
- Rasmlar WebP formatida, `srcset` bilan bir necha o'lchamda.
- Har bir `<img>` da `width` va `height` ko'rsatilgan (CLS'ning oldini olish).
- Tashqi skriptlar `defer`/`async` bilan.
- Shriftlar `preload` bilan, lokal joylashtirilgan.
- YouTube/xarita — facade (bosilganda yuklanadi).
- Minifikatsiya: HTML, CSS, JS.

---

## 11. ANALITIKA VA INTEGRATSIYALAR

### 11.1. Majburiy

- **Google Analytics 4** + **Google Tag Manager**.
- **Yandex.Metrika** (webvisor, klik xaritasi, skroll xaritasi yoqilgan).
- **Google Search Console** va **Yandex Webmaster**'ga ulash va tasdiqlash.

### 11.2. Maqsadlar (konversiyalar)

Sozlanishi shart: forma yuborilishi (har bir forma alohida), telefon raqamiga bosilishi, Telegram/WhatsApp tugmasiga bosilishi, kalkulyator ishlatilishi, sahifada 60 soniyadan ortiq turish.

### 11.3. Ixtiyoriy integratsiyalar

- Telegram-bot orqali arizalar xabari.
- CRM (Bitrix24 / amoCRM) bilan API integratsiya.
- Onlayn-chat (Jivo, Telegram widget).
- To'lov tizimlari (Click, Payme) — 2-bosqichda.
- SMS-xabarnoma.

---

## 12. XAVFSIZLIK

- HTTPS va HSTS.
- Barcha kiruvchi ma'lumotlar server tomonida validatsiya va sanitizatsiya qilinadi.
- SQL-in'ektsiya, XSS, CSRF himoyasi.
- Admin panelga kuchli parol + ikki faktorli autentifikatsiya (imkon bo'lsa) + IP bo'yicha cheklov.
- Zaxira nusxa: kunlik, 7 kunlik saqlash.
- Fayl yuklashda tur va hajm cheklovi.
- Xavfsizlik header'lari: `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`.
- Shaxsiy ma'lumotlar O'zbekiston Respublikasining "Shaxsga doir ma'lumotlar to'g'risida"gi qonuni talablariga muvofiq qayta ishlanadi; maxfiylik siyosati saytda joylashtiriladi.

---

## 13. ISHLAB CHIQISH BOSQICHLARI

| № | Bosqich | Natija | Muddat (ish kuni) |
|---|---|---|---|
| 1 | Tahlil va prototip | Sitemap, wireframe (bosh + 2 ta ichki sahifa) | 3 |
| 2 | Dizayn | Figma maketlari + UI-kit | 7 |
| 3 | Verstka | Adaptiv HTML/CSS/JS, barcha shablonlar | 10 |
| 4 | Dasturlash | Formalar, qidiruv, CMS/admin, integratsiyalar | 8 |
| 5 | Kontent to'ldirish | Matnlar, rasmlar, narxlar, SEO-maydonlar | 5 |
| 6 | Testlash | Bug-report bo'yicha tuzatishlar | 4 |
| 7 | Ishga tushirish | Hosting, domen, SSL, analitika, indeksatsiya | 2 |
| | **Jami** | | **≈ 39 ish kuni** |

Har bir bosqich buyurtmachi tomonidan yozma tasdiqlangandan keyin keyingisi boshlanadi. Tasdiqlash muddati — 3 ish kuni; javob bo'lmasa, bosqich tasdiqlangan hisoblanadi.

---

## 14. TESTLASH VA QABUL QILISH MEZONLARI

Sayt quyidagi shartlar bajarilganda qabul qilingan hisoblanadi:

1. Barcha sahifalar TZ'dagi tuzilishga mos ravishda yaratilgan va ishlaydi.
2. Barcha formalar sinovdan o'tgan: ma'lumot email va Telegramga yetib bormoqda.
3. Adaptivlik 320px dan 1920px gacha barcha kengliklarda buzilishsiz.
4. 2.4-banddagi barcha brauzerlarda to'g'ri ko'rinadi.
5. PageSpeed Insights: mobil ≥ 85, desktop ≥ 95.
6. Konsolda JavaScript xatolari yo'q.
7. Barcha ichki linklar ishlaydi (broken link tekshiruvi 0 ta xato).
8. W3C validator: kritik xatolar yo'q.
9. `sitemap.xml`, `robots.txt`, mikro-razmetka mavjud va valid (Google Rich Results Test).
10. Analitika hisoblagichlari ma'lumot yig'moqda, maqsadlar sozlangan.
11. Admin panel ishlaydi, buyurtmachi kontentni o'zgartira oladi.
12. Yo'riqnoma topshirilgan.

**Bug-larni tuzatish muddati:** kritik — 1 ish kuni, o'rtacha — 3 ish kuni.

---

## 15. TOPSHIRILADIGAN MATERIALLAR

1. Saytning to'liq ishlab turgan versiyasi ishchi domenda.
2. Barcha manba kodlari (Git repozitoriy yoki arxiv).
3. Figma maketlari (buyurtmachi hisobiga uzatilgan).
4. Barcha kirish ma'lumotlari: hosting, domen, admin panel, ma'lumotlar bazasi, analitika hisoblari.
5. Admin panel bo'yicha yo'riqnoma (PDF yoki video, o'zbek tilida).
6. Ma'lumotlar bazasi va fayllar zaxira nusxasi.

**Kafolat davri:** ishga tushirilgandan keyin **3 oy** — ijrochi aybi bilan yuzaga kelgan xatolar bepul tuzatiladi. Yangi funksiyalar qo'shish kafolatga kirmaydi.

---

## 16. TZ DOIRASIGA KIRMAYDIGAN ISHLAR

- Kontekst reklama va SEO-targ'ibot (alohida shartnoma).
- Mobil ilova ishlab chiqish.
- Onlayn to'lov qabul qilish (2-bosqich).
- Shaxsiy kabinet to'liq funksionali (2-bosqich).
- Ko'p tillilik (rus/ingliz versiyalari) — alohida kelishiladi.
- Yuridik hujjatlar matnini yozish.
- Professional foto va videosurat.

---

## 17. KELAJAKDAGI KENGAYTMALAR (ROAD MAP)

| Bosqich | Funksiya |
|---|---|
| 2-bosqich | Shaxsiy kabinet: buyurtmalar tarixi, holatini kuzatish, hujjatlar |
| 2-bosqich | Onlayn to'lov (Click, Payme, Uzum nasiya) |
| 3-bosqich | Ustalar uchun mobil ilova / bot (buyurtma taqsimlash) |
| 3-bosqich | Ko'p tillilik: rus, ingliz |
| 3-bosqich | Ustaning real vaqtda kelishini kuzatish (xaritada) |

---

## 18. ILOVA A — FORMA MAYDONLARI SPETSIFIKATSIYASI

| Maydon | Turi | Majburiy | Validatsiya |
|---|---|---|---|
| Ism | text | Ha | 2–50 belgi, faqat harflar, bo'sh joy, `-` |
| Telefon | tel | Ha | `+998 (XX) XXX-XX-XX`, operator kodi tekshiriladi |
| Email | email | Yo'q (B2B'da — ha) | RFC 5322 |
| Xizmat | select | Yo'q | Ro'yxatdan |
| Manzil | text | Yo'q | ≤ 200 belgi |
| Qulay vaqt | select | Yo'q | Ro'yxatdan |
| Izoh | textarea | Yo'q | ≤ 1000 belgi |
| Rozilik | checkbox | Ha | Belgilangan bo'lishi shart |

---

## 19. ILOVA B — TEKSHIRUV RO'YXATI (ISHGA TUSHIRISHDAN OLDIN)

- [ ] Barcha telefon raqamlari to'g'ri va bosiladigan
- [ ] Barcha formalar test qilingan, xat kelmoqda
- [ ] Favicon barcha o'lchamlarda o'rnatilgan
- [ ] 404 sahifasi ishlaydi
- [ ] HTTPS va redirektlar sozlangan
- [ ] `robots.txt` da test rejimi (`Disallow: /`) olib tashlangan
- [ ] `sitemap.xml` yaratilgan va Search Console'ga yuborilgan
- [ ] Analitika hisoblagichlari ishlayapti
- [ ] Barcha rasmlarda `alt` mavjud
- [ ] Har bir sahifada noyob `title` va `description`
- [ ] Mobil versiya barcha qurilmalarda tekshirilgan
- [ ] Kontent xatolarga tekshirilgan
- [ ] Zaxira nusxa sozlangan
- [ ] Kirish ma'lumotlari buyurtmachiga topshirilgan

---

## 20. KELISHUV

| | Buyurtmachi | Ijrochi |
|---|---|---|
| **F.I.SH.** | | |
| **Lavozimi** | | |
| **Imzo** | | |
| **Sana** | | |

> Ushbu texnik topshiriq shartnomaning ajralmas qismi hisoblanadi. Unga o'zgartirishlar faqat ikki tomon imzolagan yozma qo'shimcha kelishuv orqali kiritiladi.
