# VitaForge / ZenFit — MVP Design & Architecture

## 1. Tizim Ishtirokchilari va Huquqlari

### 1.1. SuperAdmin (Platforma Egasi)
- **Vazifasi:** Butun platformani va biznes ko'rsatkichlarini nazorat qilish.
- **Asosiy qismlari:**
  - Jami zallar va trenerlar faoliyatini monitoring qilish.
  - Tizim orqali aylanayotgan to'lovlar (Platforma foydasi va zallar topayotgan foyda).
  - Tizim qancha mijozni (Churn) saqlab qolgani va qancha sof foyda olib kelayotgani haqida global analitika.

### 1.2. Zal Egasi (Gym Owner CRM)
- **Vazifasi:** Faqat o'ziga tegishli zalni boshqarish va yo'qotilayotgan daromadni (Churn) qaytarish.
- **Asosiy qismlari:**
  - **Davomat (Manual Check-in):** MVP bosqichida mijozlar tashrifini tizimda tezkor belgilash.
  - **AI Churn Prediction (Retention):** Mijozlarning davomat va to'lov xavfini yuqori aniqlikda hisoblaydi va ro'yxatni shakllantiradi.
  - **AI Copilot (Marketing):** Xavf guruhidagi mijozlarga moslashtirilgan PAS/Hormozi uslubidagi matnlarni avtomatik yaratib, Telegram orqali jo'natish imkoniyati.
  - **Trenerlarga biriktirish:** Zal egasi o'zi mijozni trenerga biriktirishi mumkin.

### 1.3. A'zolar va Trenerlar Ekosistemasi (Member & Trainer)
- **Vazifasi:** Mijozni zalga bog'lab turish, Gamification orqali qiziqishni oshirish.
- **Asosiy qismlari (Telegram Bot + Mini App):**
  - **Mini App Gamification:** O'zining "Olov" (Streak) kunlari, ballari, va reytingini ko'rish.
  - **Murabbiyni tanlash:** Mijoz xohlasa tizim orqali o'zi trener tanlab, uning xizmati uchun pul to'lay olishi.
  - **AI Plan va Ovqatlanish (Bonus Feature):** Mijozga umumiy mashg'ulot (Workout) va ovqatlanish/kaloriya nazorati (Diet) plani taqdim etiladi. Mijoz planni qanchalik to'g'ri bajarayotganligi — Churn hisoblash algoritmini yanada aniqlashtiradi va unga Gamification orqali qo'shimcha ballar beradi.

## 2. Arxitektura va Texnologiya steklari
- **Frontend / CRM:** Next.js (App Router), Tailwind CSS (vitaforge-ux-flow.html "Flat Desktop" uslubida).
- **Mini App (Telegram):** Telegram WebApp orqali integratsiya qilingan Next.js sahifalari.
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security orqali SuperAdmin va GymOwner huquqlarini qat'iy ajratish).
- **AI Tizimi:** OpenAI / Gemini orqali mijozlarni qaytarish uchun matn generatsiya qilish va churn ma'lumotlarini tahlil qilish.

## 3. Ma'lumotlar oqimi (Data Flow - Churn modeli)
1. Admin (yoki mijozning o'zi) davomat va kaloriya/mashq rejasini bajarganligini tizimga yozadi.
2. Supabase'dagi Algoritm ushbu chastotani (frequency) va oxirgi to'lov sanasini hisoblab, mijozga **Risk Score** beradi.
3. Agar Score oshib ketsa, mijoz "Qizil zonaga" tushadi.
4. Gym Owner AI Copilot'ni ishga tushirib, bot orqali moslashtirilgan marketing "Offer" yuboradi va uni qaytaradi.
5. SuperAdmin esa bu jarayon orqali qancha qadr-qiymat (Value) yaratilganini umumiy asboblar panelida (Dashboard) kuzatib boradi.
