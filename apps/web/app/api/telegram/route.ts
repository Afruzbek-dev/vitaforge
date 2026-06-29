import { NextRequest, NextResponse } from "next/server";
import { TelegramBotService } from "@/lib/services/TelegramBotService";

const APP_URL = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "https://zenfit.vercel.app";
const appBtn = { inline_keyboard: [[{ text: "📱 ZenFit ochish", web_app: { url: `${APP_URL}/dashboard` } }]] };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const msg = body.message;
  if (!msg?.chat?.id || !msg?.text) return NextResponse.json({ ok: true });

  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const tgId = msg.from?.id;
  const firstName = msg.from?.first_name ?? "";
  const lastName = msg.from?.last_name ?? "";

  try {
    // ─── /start ────────────────────────────────────────────
    if (text === "/start" || text.startsWith("/start ")) {
      const param = text.split(" ")[1] ?? "";

      if (param.startsWith("auth_")) {
        await TelegramBotService.registerUser(tgId, chatId, firstName, lastName, param);
        await TelegramBotService.sendMessage(chatId, "✅ *Tasdiqlandi!* Brauzerga qayting yoki ilovani oching 👇", appBtn);
        return NextResponse.json({ ok: true });
      }

      const existingUserId = await TelegramBotService.getUserIdByTelegramId(tgId);
      if (existingUserId) {
        const user = await TelegramBotService.getUserProfile(existingUserId);
        const name = user?.full_name ?? firstName;
        const streak = await TelegramBotService.getStreak(existingUserId);
        await TelegramBotService.sendMessage(chatId, `🏋️ Qaytganingizdan xursandmiz, *${name}*! 💪\n\n🔥 Streak: ${streak.current_streak} kun\n⚡ Ball: ${streak.total_points}\n\n📋 /plan — Haftalik plan\n🤖 /ask <savol> — AI trener\n\n📱 Ilovani ochish 👇`, appBtn);
        return NextResponse.json({ ok: true });
      }

      await TelegramBotService.sendMessage(chatId, `🏋️ *ZenFit AI* ga xush kelibsiz, ${firstName}!\n\n📋 /plan — Haftalik plan\n🥗 /food <ovqat> — Kaloriya\n🔥 /streak — Streak holati\n🏆 /top — Leaderboard\n🤖 /ask <savol> — AI trener\n👤 /profile — Profilim\n⚙️ /settings — Sozlamalar\n❓ /help — Yordam\n\n📱 Ilovani ochish uchun 👇`, appBtn);
      return NextResponse.json({ ok: true });
    }

    // ─── /plan ─────────────────────────────────────────────
    if (text === "/plan") {
      const userId = await TelegramBotService.getUserIdByTelegramId(tgId);
      if (!userId) { await TelegramBotService.sendMessage(chatId, "❌ Avval ilovadan ro'yxatdan o'ting", appBtn); return NextResponse.json({ ok: true }); }
      
      const plan = await TelegramBotService.getActivePlan(userId);
      if (!plan) { await TelegramBotService.sendMessage(chatId, "📋 Hali plan yo'q. Ilovadan AI plan yarating 👇", appBtn); return NextResponse.json({ ok: true }); }
      
      const n = plan.nutrition ?? {};
      const workouts = plan.workouts ?? [];
      const today = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"][new Date().getDay()];
      const todayW = workouts.find((w: any) => w.day === today);
      
      let msg2 = `📋 *Hafta ${plan.week_number} plani*\n\n🥗 Kunlik: ${n.daily_calories ?? "?"} kkal\nProtein: ${n.protein_g ?? "?"}g | Karbo: ${n.carbs_g ?? "?"}g | Yog': ${n.fat_g ?? "?"}g\n\n`;
      if (todayW) {
        msg2 += `💪 *Bugun (${today}):* ${todayW.type}\n`;
        (todayW.exercises ?? []).slice(0, 4).forEach((e: any) => { msg2 += `• ${e.name} — ${e.sets}×${e.reps}\n`; });
      } else { 
        msg2 += `😴 Bugun dam olish kuni`; 
      }
      
      await TelegramBotService.sendMessage(chatId, msg2, appBtn);
      return NextResponse.json({ ok: true });
    }

    // ─── /streak ───────────────────────────────────────────
    if (text === "/streak") {
      const userId = await TelegramBotService.getUserIdByTelegramId(tgId);
      if (!userId) { await TelegramBotService.sendMessage(chatId, "❌ Avval ro'yxatdan o'ting", appBtn); return NextResponse.json({ ok: true }); }
      
      const s = await TelegramBotService.getStreak(userId);
      const fire = "🔥".repeat(Math.min(Math.ceil(s.current_streak / 7), 5));
      await TelegramBotService.sendMessage(chatId, `${fire || "💤"} *Streak: ${s.current_streak} kun*\n\n🏆 Rekord: ${s.longest_streak} kun\n⚡ Kuch: ${s.total_points} ball\n\n${s.current_streak >= 7 ? "Zo'r! Davom eting! 🚀" : "Har kuni mashq — streak oshadi!"}`);
      return NextResponse.json({ ok: true });
    }

    // ─── /top ──────────────────────────────────────────────
    if (text === "/top" || text === "/leaderboard") {
      const top = await TelegramBotService.getTopLeaderboard(5);
      const medals = ["🥇", "🥈", "🥉", "4.", "5."];
      let msg2 = "🏆 *Top 5 Reyting*\n\n";
      top.forEach((t: any, i: number) => { 
        msg2 += `${medals[i]} ${t.full_name} — ${t.total_points} ⚡\n`; 
      });
      await TelegramBotService.sendMessage(chatId, msg2 || "Hali reyting yo'q");
      return NextResponse.json({ ok: true });
    }

    // ─── /food ─────────────────────────────────────────────
    if (text.startsWith("/food ")) {
      const food = text.slice(6).trim();
      const answer = await TelegramBotService.getAIResponse(`'${food}' ovqatining kaloriyasi, proteini, yog'i va karbohidratini qisqa ayt. Faqat raqamlar.`);
      await TelegramBotService.sendMessage(chatId, `🥗 *${food}*\n\n${answer}`);
      return NextResponse.json({ ok: true });
    }

    // ─── /ask ──────────────────────────────────────────────
    if (text.startsWith("/ask ")) {
      const answer = await TelegramBotService.getAIResponse(text.slice(5));
      await TelegramBotService.sendMessage(chatId, answer);
      return NextResponse.json({ ok: true });
    }

    // ─── /profile ──────────────────────────────────────────
    if (text === "/profile") {
      const userId = await TelegramBotService.getUserIdByTelegramId(tgId);
      if (!userId) { await TelegramBotService.sendMessage(chatId, "❌ Avval ro'yxatdan o'ting", appBtn); return NextResponse.json({ ok: true }); }
      
      const u = await TelegramBotService.getUserProfile(userId);
      const streak = await TelegramBotService.getStreak(userId);
      
      if (u) {
        const joined = new Date(u.created_at).toLocaleDateString("uz-UZ");
        await TelegramBotService.sendMessage(chatId, `👤 *Profil*\n\n📛 Ism: ${u.full_name}\n🎭 Rol: ${u.role === "member" ? "A'zo" : u.role === "gym_owner" ? "Gym Egasi" : u.role}\n📅 Qo'shilgan: ${joined}\n🔥 Streak: ${streak.current_streak} kun\n⚡ Ball: ${streak.total_points}`, appBtn);
      } else {
        await TelegramBotService.sendMessage(chatId, "❌ Profil topilmadi", appBtn);
      }
      return NextResponse.json({ ok: true });
    }

    // ─── /settings ─────────────────────────────────────────
    if (text === "/settings") {
      const settingsBtn = { inline_keyboard: [[{ text: "⚙️ Sozlamalarni ochish", web_app: { url: `${APP_URL}/dashboard/settings` } }]] };
      await TelegramBotService.sendMessage(chatId, "⚙️ Sozlamalarni Mini App orqali o'zgartiring 👇", settingsBtn);
      return NextResponse.json({ ok: true });
    }

    // ─── /help ─────────────────────────────────────────────
    if (text === "/help") {
      await TelegramBotService.sendMessage(chatId, "🤖 *ZenFit Bot buyruqlari:*\n\n📋 /plan — Bugungi mashq plani\n🥗 /food <ovqat> — Kaloriya hisoblash\n🔥 /streak — Streak va ball\n🏆 /top — Leaderboard\n🤖 /ask <savol> — AI trener\n👤 /profile — Profil ma'lumotlari\n⚙️ /settings — Sozlamalar\n📱 /app — Ilovani ochish\n❓ /help — Ushbu yordam");
      return NextResponse.json({ ok: true });
    }

    // ─── /app ──────────────────────────────────────────────
    if (text === "/app") {
      await TelegramBotService.sendMessage(chatId, "📱 ZenFit ilovasini ochish 👇", appBtn);
      return NextResponse.json({ ok: true });
    }

    // ─── Default: AI javob ─────────────────────────────────
    const answer = await TelegramBotService.getAIResponse(text);
    await TelegramBotService.sendMessage(chatId, answer);
    
  } catch (error) {
    console.error("Telegram handler error:", error);
    await TelegramBotService.sendMessage(chatId, "⚠️ Xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.");
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const url = `${APP_URL}/api/telegram`;
  const webhookData = await TelegramBotService.setupWebhook(url);
  return NextResponse.json({ ...webhookData, commands_set: true, menu_button_set: true });
}
