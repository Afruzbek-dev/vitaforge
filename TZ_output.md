__VITAFORGE AI__

__TEXNIK TZ__

__MVP tugashiga to'liq roadmap__

*UI xatolari ┬╖ Funksional kamchiliklar ┬╖ Bosqichma\-bosqich ijro rejasi*

Tayyorlangan sana

__9\-iyul, 2026__

Qamrov

__Member Mobile \(Telegram Mini App\) \+ Gym Owner Desktop CRM__

# __Maqsad va qanday o'qish kerak__

Bu hujjat oldingi strategik auditning davomi ΓÇö u "nima uchun" savoliga javob bergan edi, bu esa "qanday va kim" savoliga javob beradi\. Har bir bosqichda ikkita ustun bor: chap tomonda siz shaxsan bajarishingiz kerak bo'lgan qarorlar/tekshiruvlar, o'ng tomonda tech/AI \(Claude Code yordamida\) bajaradigan texnik ish\. Bu ajratish muhim, chunki ko'p muammolar aslida "kod xatosi" emas ΓÇö "qaror qabul qilinmagani" \(masalan, qaysi ekran birinchi ochiladi, qaysi xato xabari qanday matn bo'lishi kerak\) tufayli yuzaga keladi\.

__Qoida__

Har bir bosqich tugagach, natija ko'rinadigan \(demo qilinadigan\) bo'lishi kerak ΓÇö "kod yozildi" emas, "ekranda ishlayapti" darajasida\. Keyingi bosqichga o'tishdan oldin oldingi bosqichni shaxsan sinab ko'ring\.

# __0\-bosqich ΓÇö Diagnostika \(1ΓÇô3 kun\)__

Xatolarni tuzatishdan oldin, ularning to'liq ro'yxati va joylashuvi aniq bo'lishi kerak\. Hozirgi holatda "UI va funksiyalarda xatolar bor" degan umumiy tasvir bor ΓÇö bu bosqich uni aniq, raqamlangan ro'yxatga aylantiradi\.

__SIZ \(Afruzbek\) BAJARASIZ__

__TECH / AI BAJARADI__

- Member mobile va gym owner desktopni ekrandan\-ekranga o'zingiz qo'lda sinab, har bir topilgan xatoni skrinshot bilan yozib boring \(Notion/Google Sheet jadvali yetarli\)
- Har bir xatoga ustuvorlik bering: "pilot boshlanishidan oldin bo'lishi shart" yoki "keyinroq mumkin"
- Qaysi funksiyalar "UI bor, lekin orqasida ishlamaydi" \(mock/fake data\) ekanini alohida belgilang

- Har ikkala kod bazasini \(frontend \+ backend\) statik tahlildan o'tkazish: TypeScript strict mode xatolari, ishlatilmagan import'lar, console error'lar
- Har bir sahifa/route uchun avtomatik smoke\-test skripti yozish \(sahifa ochiladimi, 500\-xato bermaydimi\)
- API endpoint'lar ro'yxatini frontend chaqiruvlari bilan solishtirib, "frontend kutayotgan, lekin backend qaytarmayotgan" maydonlarni topish

Diagnostika natijasi ΓÇö bitta jadval bo'lishi kerak: Xato ΓåÆ Qayerda ΓåÆ Daraja ΓåÆ Sabab \(UI/logic/data\)\. Keyingi bosqichlar shu jadval asosida tuziladi\.

# __Bosqichlar xaritasi__

MVP tugashigacha 5 ta bosqich rejalashtirilgan\. Har biri oldingisiga bog'liq ΓÇö tartibni buzmaslik tavsiya etiladi, chunki keyingi bosqichlar oldingi bosqich barqaror ishlashiga tayanadi\.

- 0\-bosqich ΓÇö Diagnostika \(1ΓÇô3 kun\)
- 1\-bosqich ΓÇö Kritik UI/funksional xatolarni tuzatish \(1ΓÇô2 hafta\)
- 2\-bosqich ΓÇö Yetishmayotgan asosiy funksiyalarni tugallash \(2ΓÇô3 hafta\)
- 3\-bosqich ΓÇö Ma'lumotlar oqimi va churn\-signal aniqligini tekshirish \(1 hafta\)
- 4\-bosqich ΓÇö Pilotga tayyorgarlik: sinov, xavfsizlik, deployment \(1 hafta\)
- 5\-bosqich ΓÇö Pilot davridagi texnik qo'llab\-quvvatlash rejimi \(doimiy\)

# __1\-bosqich ΓÇö Kritik UI/funksional xatolarni tuzatish__

__PHASE 1  Barqarorlik: mavjudni buzmasdan tuzatish__*   ┬╖   1ΓÇô2 hafta*

Bu bosqichda yangi funksiya qo'shilmaydi ΓÇö faqat mavjud narsa to'g'ri ishlashi kerak\. Eng ko'p uchraydigan xato turlari quyida namuna sifatida keltirilgan \(0\-bosqich natijasiga qarab to'liq ro'yxat kengayadi\):

__Muammo__

__Tavsif__

__Daraja__

__Kim tuzatadi__

__Bottom nav holati__

Faol tab rangi/holati sahifa o'tishda to'g'ri yangilanmasligi mumkin

__O'RTA__

Tech \(frontend\)

__Onboarding oqimi__

2 savol ΓåÆ 90 soniyalik AI plan "wow moment" to'liq oxirigacha sinovdan o'tmagan bo'lishi mumkin

__YUQORI__

Tech \+ Siz \(UX tekshiruv\)

__Fake/mock data ekranlari__

Ba'zi dashboard kartalari statik namuna raqamlarni ko'rsatishi mumkin, real API'ga ulanmagan

__KRITIK__

Tech \(backend\+frontend\)

__Form validatsiya xabarlari__

Xato xabarlari ingliz/rus/o'zbek aralash yoki umuman ko'rsatilmasligi mumkin

__O'RTA__

Tech \(frontend\)

__Telegram Mini App auth__

Supabase auth va Telegram initData tekshiruvi orasidagi holat sinxronizatsiyasi

__KRITIK__

Tech \(backend\)

__Desktop sidebar risk badge__

Jonli risk\-badge yangilanishi \(real\-time yoki polling\) ishlamasligi mumkin

__YUQORI__

Tech \(frontend\+backend\)

__SIZ \(Afruzbek\) BAJARASIZ__

__TECH / AI BAJARADI__

- Har bir xato tuzatilgach, shaxsan telefon/brauzerda qo'lda tasdiqlash \(Tech "tuzatdim" deganiga ishonib o'tmaslik\)
- Qaysi xatolar "kutilgan xatti\-harakat" ekanini aniqlash \(masalan, bo'sh holat matni qanday bo'lishi kerak ΓÇö buni Siz belgilaysiz, Tech taxmin qilmaydi\)
- Fake\-data ekranlarining ro'yxatini tasdiqlash ΓÇö qaysi biri pilotdan oldin albatta real bo'lishi kerak

- Har bir bugni alohida branch/commit'da tuzatish, regressiyani oldini olish uchun oldingi funksiyalarni qayta sinash
- Fake/mock data'ni real Supabase so'rovlariga almashtirish, bo'sh holatlar \(empty states\) uchun to'g'ri UI qo'shish
- Auth oqimini \(Telegram initData Γåö Supabase session\) u├ºtan\-uchgacha qayta tekshirish va log qo'shish

# __2\-bosqich ΓÇö Yetishmayotgan asosiy funksiyalarni tugallash__

__PHASE 2  To'liqlik: pilot uchun shart bo'lgan funksiyalar__*   ┬╖   2ΓÇô3 hafta*

Bu bosqichda mahsulot pillars ro'yxatidagi funksiyalar orasida qaysi biri hali "skelet" holatida \(UI bor, logika yo'q yoki qisman\) ekanini tugatish kerak\. Ustuvorlik churn\-signal ishlashiga to'g'ridan\-to'g'ri ta'sir qiluvchi narsalarga beriladi\.

__2\.1 ΓÇö Churn skoring dvigateli \(ustuvor Γäû1\)__

__SIZ \(Afruzbek\) BAJARASIZ__

__TECH / AI BAJARADI__

- Churn'ning bitta operatsion ta'rifini yozib qo'yish \(masalan: 21 kun check\-in yo'q \+ to'lov yangilanmagan = churned\)
- 5 ta faktorning og'irliklarini \(35/25/20/10/10\) qayta ko'rib chiqishga rozilik berish yoki pilotgacha shu holda qoldirishni tasdiqlash

- Skoring dvigatelini ARQ worker sifatida ishlaydigan qilib joylashtirish \(kunlik/soatlik yangilanish\)
- Har bir a'zo uchun risk\-score va "nega" tushuntirishini \(template\-based, LLM erkin matn emas\) generatsiya qilish logikasini yakunlash
- Intervensiya\-natija juftligini saqlaydigan jadval \(interventions table\) qo'shish ΓÇö kelajakdagi ML validatsiyasi uchun zarur

__2\.2 ΓÇö Gym Owner CRM: retention analytics__

__SIZ \(Afruzbek\) BAJARASIZ__

__TECH / AI BAJARADI__

- Owner dashboard'da qaysi metrikalar birinchi ekranda ko'rinishi kerakligini tasdiqlash \(masalan: bugungi kritik\-risk a'zolar soni birinchi\)

- Risk\-badge'li a'zolar ro'yxati sahifasini real ma'lumot bilan to'liq ulash
- "Bitta bosishda aksiya" tugmalarini qo'shish \(SMS yuborish, chegirma taklif qilish\) ΓÇö signal foydali bo'lishi uchun shart

__2\.3 ΓÇö Telegram\-native member tajribasi__

__SIZ \(Afruzbek\) BAJARASIZ__

__TECH / AI BAJARADI__

- Gamifikatsiya nomlanishi \(Quvvat/Qadam/Nishon/Cho'qqi\) barcha ekranlarda izchil ishlatilganini tasdiqlash

- Streak/points/rank/badge check\-in'dan darhol keyin ko'rinishini yakunlash
- Telegram bot orqali kunlik eslatma va haftalik hisobot yuborish logikasini ishga tushirish

__2\.4 ΓÇö To'lov integratsiyasi \(Payme/Click\)__

__SIZ \(Afruzbek\) BAJARASIZ__

__TECH / AI BAJARADI__

- Qaysi to'lov provayderi bilan birinchi pilot gymda ishlash rejalashtirilganini aniqlash \(ikkalasi bir vaqtda shart emas\)

- Tanlangan provayder uchun sandbox integratsiyasini yakunlash va to'lov holatini "plan staleness" faktoriga ulash

# __3\-bosqich ΓÇö Ma'lumotlar oqimi va aniqlik tekshiruvi__

__PHASE 3  Ishonch: signal to'g'ri hisoblanayotganini isbotlash__*   ┬╖   1 hafta*

Bu bosqich kod yozishdan ko'ra tekshirishga qaratilgan ΓÇö chunki noto'g'ri churn signali \(masalan, faol a'zoni "kritik risk" deb ko'rsatish\) ishonchni bir zumda yo'qotadi\.

__SIZ \(Afruzbek\) BAJARASIZ__

__TECH / AI BAJARADI__

- Kamida 10ΓÇô15 ta test\-a'zo profilini qo'lda yaratish \(turli xil: faol, uzoq kelmagan, yangi, to'lovi tugagan\) va har biri uchun kutilgan risk darajasini oldindan yozib qo'yish
- Tizim natijasini o'z kutgan natijangiz bilan solishtirish, nomuvofiqliklarni Tech'ga qaytarish

- Test\-a'zo ma'lumotlarini seed\-script orqali bazaga yuklash
- Skoring natijalarini kutilgan qiymatlar bilan solishtiruvchi avtomatik test to'plamini yozish
- Chetga chiqqan \(edge case\) holatlarni \(masalan, hech qachon kelmagan yangi a'zo\) alohida qoidalar bilan qamrab olish

# __4\-bosqich ΓÇö Pilotga tayyorgarlik__

__PHASE 4  Ishga tushirish: xavfsizlik, barqarorlik, joylashtirish__*   ┬╖   1 hafta*

__SIZ \(Afruzbek\) BAJARASIZ__

__TECH / AI BAJARADI__

- Birinchi pilot gymning real ma'lumotlarini \(a'zolar ro'yxati, to'lov tarixi\) qanday formatda olishni kelishish
- Pilot boshlanish sanasini va "tayyor" mezonlarini \(checklist\) shaxsan tasdiqlash

- Railway \(backend\) \+ Vercel \(frontend\) \+ Cloudflare production muhitini sozlash
- Environment o'zgaruvchilar va maxfiy kalitlarni \(\.env\) xavfsiz saqlash \(audit'da topilgan hardcoded secrets muammosi butunlay yo'qligini qayta tekshirish\)
- Asosiy oqimlar uchun xato monitoringini \(masalan, Sentry yoki oddiy log\-based alert\) ulash
- Ma'lumotlar bazasi zaxira \(backup\) rejasini yoqish

__Pilotdan oldingi yakuniy checklist__

- Barcha 1\-bosqich xatolari yopilgan va shaxsan sinovdan o'tgan
- Fake/mock data ekrani qolmagan
- Churn skoring 3\-bosqich test\-profillarida kutilgan natija bergan
- Kamida 1 ta to'lov provayderi sandbox'da ishlayapti
- Owner CRM'da kamida bitta "aksiya tugmasi" \(masalan SMS\) ishlayapti
- Production muhit \(Railway/Vercel\) ishga tushirilgan va bir marta u├ºtan\-uchgacha sinovdan o'tkazilgan
- Maxfiy kalitlar kod bazasidan tozalangan

# __5\-bosqich ΓÇö Pilot davridagi qo'llab\-quvvatlash rejimi__

__PHASE 5  Doimiy: pilot paytida tezkor javob berish__*   ┬╖   Pilot davomida*

Pilot boshlangach, rejim o'zgaradi ΓÇö endi maqsad yangi funksiya emas, birinchi real foydalanuvchilarning har qanday muammosiga 24ΓÇô48 soat ichida javob berish\.

__SIZ \(Afruzbek\) BAJARASIZ__

__TECH / AI BAJARADI__

- Har hafta gym egasi/trener bilan qisqa qo'ng'iroq ΓÇö nima ishlamayapti, nima tushunarsiz
- Har bir shikoyatni "bug" yoki "kutilmagan xatti\-harakat" sifatida yozib borish
- Intervensiya qilinganini yoki qilinmaganini haftalik shaxsan kuzatish \(bu ma'lumot pilot muvaffaqiyatini isbotlash uchun kritik\)

- Kritik xatolarga 24ΓÇô48 soat ichida tuzatish chiqarish
- Xato monitoringidan kelgan signallarni haftalik ko'rib chiqish
- Pilot ma'lumotlari asosida skoring og'irliklarini birinchi marta real statistik tekshiruvdan o'tkazish \(agar yetarli hodisa to'plangan bo'lsa\)

# __Ustuvorlik tamoyili ΓÇö nizolar yuzaga kelganda__

Agar vaqt yoki resurs cheklangan bo'lsa, quyidagi tartibda ustuvorlik bering \(yuqoridagi pastroqdan muhimroq\):

- 1\. Churn\-signal noto'g'ri ishlashi ΓÇö bu mahsulotning yuragi, hech qachon noto'g'ri bo'lmasligi kerak
- 2\. Auth/login buzilishi ΓÇö foydalanuvchi kira olmasa, hech narsa muhim emas
- 3\. Fake data ko'rinishi ΓÇö ishonchni yo'qotadi, real pilot uchun qabul qilib bo'lmaydi
- 4\. Kosmetik UI xatolari \(rang, joylashuv\) ΓÇö ko'rinadi, lekin funksiyani to'xtatmaydi
- 5\. Yangi funksiya so'rovlari ΓÇö pilotgacha muzlatilgan, faqat 5\-bosqichda qayta ko'rib chiqiladi

__Yakuniy eslatma__

Har bir bosqich oxirida "tugadi" deb hisoblashdan oldin, shaxsan qurilmangizda \(telefon \+ brauzer\) chin foydalanuvchi kabi sinab ko'ring\. Tech tomon "ishlayapti" deyishi kifoya emas ΓÇö sizning tasdig'ingiz har bir bosqichning yakuniy mezoni\.

