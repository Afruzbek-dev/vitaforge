// ZenFit — AI Retention Suggestions
// A'zoning holati asosida avtomatik tavsiya va xabar taklif qiladi

export interface RetentionSuggestion {
  type: "discount" | "motivation" | "challenge" | "checkin" | "plan";
  priority: "high" | "medium" | "low";
  title: string;
  message: string;
  reason: string;
  description: string; // nima uchun bu darajada, nima sodir bo'lishi mumkin
  prevention: string; // qanday oldini olish
}

export function getRetentionSuggestions(member: {
  full_name: string;
  days_ago: number;
  streak: number;
  points: number;
  goal?: string;
}): RetentionSuggestion[] {
  const name = member.full_name?.split(" ")[0] ?? "A'zo";
  const suggestions: RetentionSuggestion[] = [];

  // ─── CRITICAL: 14+ kun kelmagan ─────────────────────────
  if (member.days_ago >= 14) {
    suggestions.push({
      type: "discount",
      priority: "high",
      title: "🎁 Chegirma taklif qiling",
      message: `Salom ${name}! Sizni sog'indik 😊 Bu hafta maxsus 30% chegirma bilan qaytib keling. Trenereringiz kutmoqda! 💪`,
      reason: `${member.days_ago} kun kelmagan — yo'qotish xavfi yuqori`,
      description: `Bu a'zo ${member.days_ago} kun davomida gym ga tashrif buyurmagan. Statistika bo'yicha 14+ kun kelmagan a'zolarning 72% i qaytib kelmaydi. Ehtimoliy sabablar: motivatsiya yo'qolishi, shaxsiy muammolar, raqobatchi gym ga o'tishi.`,
      prevention: `1) 30% chegirma taklif qiling (qaytish uchun moliyaviy sabab). 2) Shaxsiy trener bilan bogʻlang. 3) Yangi maqsad bering (masalan, do'sti bilan challenge).`,
    });
    suggestions.push({
      type: "checkin",
      priority: "high",
      title: "📞 Shaxsiy qo'ng'iroq",
      message: `${name}, sizning maqsadingiz muhim! Keling, yangi plan tuzamiz — ${member.goal === "weight_loss" ? "vazn yo'qotish" : member.goal === "muscle_gain" ? "mushak olish" : "sog'liq"} yo'lida birgamiz.`,
      reason: "Shaxsiy e'tibor retention ni 3x oshiradi",
      description: `Shaxsiy murojaat — eng samarali retention usuli. Telefon qo'ng'iroq yoki voicemail "siz muhimsiz" xabarini beradi. Oddiy xabardan 3x samaraliroq.`,
      prevention: `Qo'ng'iroq qiling va sabab so'rang. Agar shaxsiy muammo bo'lsa — "muzlatish" taklif qiling. Agar motivatsiya bo'lsa — yangi AI plan + 7 kunlik mini-challenge bering.`,
    });
  }

  // ─── WARNING: 7-13 kun ──────────────────────────────────
  else if (member.days_ago >= 7) {
    suggestions.push({
      type: "motivation",
      priority: "medium",
      title: "🔥 Motivatsiya xabar",
      message: `${name}, ${member.streak > 0 ? `${member.streak} kunlik streak buzilmasin!` : "yangi streak boshlash uchun eng yaxshi kun — bugun!"} 💪 Gym da ko'rishamiz!`,
      reason: `${member.days_ago} kun — streak yo'qolish chegarasida`,
      description: `7-13 kun — "xavfli zona". Bu davrda a'zo hali to'liq qaror qilmagan, lekin har kun qaytmaslik odatga aylanmoqda. Agar hozir chorasi ko'rilmasa, 14 kun ichida "yo'qolgan" toifasiga o'tadi.`,
      prevention: `1) Streak eslatmasi yuboring (yo'qolish xavfi haqida). 2) Challenge ga taklif qiling. 3) Do'sti bilan birga kelish uchun referral bonus bering.`,
    });
    suggestions.push({
      type: "challenge",
      priority: "medium",
      title: "🎯 Challenge ga taklif",
      message: `${name}! Yangi haftalik challenge boshlandi — qatnashing va bonus ⚡ kuch oling! Bugun boshlash uchun eng to'g'ri vaqt 🏆`,
      reason: "Challenge retention ni 40% oshiradi",
      description: `Challenge — qisqa muddatli maqsad. A'zo "hamma qilyapti, men ham" deb his qiladi. Guruh ta'siri + raqobat — qaytish uchun eng kuchli motivator.`,
      prevention: `Oddiy, 7 kunlik challenge yarating: "7 kun ketma-ket keling = 500⚡ bonus". Maqsad realistik bo'lishi muhim.`,
    });
  }

  // ─── EARLY WARNING: 4-6 kun ─────────────────────────────
  else if (member.days_ago >= 4) {
    suggestions.push({
      type: "plan",
      priority: "low",
      title: "📋 Yangi plan taklif qiling",
      message: `${name}, bu haftaning AI plani tayyor! ${member.goal === "weight_loss" ? "Vazn yo'qotish uchun maxsus dastur" : "Sizga mos yangi mashqlar"} kutmoqda. Keling, natijani birga ko'ramiz! 📈`,
      reason: "Yangi plan — qaytib kelish sababi beradi",
      description: `4-6 kun — "erta ogohlantirish". Hali kritik emas, lekin a'zo sekinlashmoqda. Bu odatda: mashq zerikarli bo'lgan, natija ko'rmayotgan, yoki band bo'lgan.`,
      prevention: `1) Yangi AI plan yuboring (yangilik his qilsin). 2) "Bugun faqat 20 daqiqa" degan yengil mashq taklif qiling. 3) Progress fotolarini eslating.`,
    });
  }

  // ─── GOOD STREAK: rag'batlantirish ─────────────────────
  if (member.streak >= 7 && member.days_ago < 3) {
    suggestions.push({
      type: "motivation",
      priority: "low",
      title: "🏆 Tabrik xabar",
      message: `${name}, ${member.streak} kunlik streak — ajoyib! 🔥 Siz ${member.points > 3000 ? "Alp" : member.points > 1500 ? "Bahodir" : "Askar"} darajasiga yaqinlashyapsiz! Davom eting 👑`,
      reason: "Rag'bat — uzoq muddatli faollik uchun",
      description: `Bu a'zo faol va intizomli. ${member.streak} kunlik streak — yuqori engagement ko'rsatkichi. Rag'batlantirish uni yanada kuchliroq bog'laydi.`,
      prevention: `Rag'bat xabar yuboring. Badge'lar haqida eslating. Leaderboard da o'rni haqida xabar bering.`,
    });
  }

  return suggestions;
}

// A'zo darajasiga qarab AI tavsiya
export function getLevelBasedMessage(points: number, name: string): string {
  if (points < 500) return `${name}, siz Navkar darajasiz. Har kuni 1 ta mashq — Askar bo'lishga yetadi! ⚔️`;
  if (points < 1500) return `${name}, Askar darajasi — intizom shakllanmoqda! Bahodir bo'lish uchun davom eting 🛡️`;
  if (points < 3000) return `${name}, Bahodir! Kuch va iroda sinovdan o'tgan. Alp darajasi yaqin 🏹`;
  if (points < 5000) return `${name}, siz Alp! Eng kuchli jangchilar qatoridasz. Qo'mondon darajasiga intiling 🦅`;
  if (points < 8000) return `${name}, Qo'mondon! Boshqalarni ilhomlantiring. Manguberdi oldinda ⚔️`;
  if (points < 12000) return `${name}, Manguberdi darajasi — matonat va jasorat timsoli! Sohibqiron cho'qqisi kutmoqda 👑`;
  return `${name}, Sohibqiron! Intizom va buyuklik cho'qqisi. Siz Turon Afsonasisiz 🦅`;
}
