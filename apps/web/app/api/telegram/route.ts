import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const GROQ_KEY = process.env.NEXT_PUBLIC_AI_API_KEY ?? process.env.NEXT_PUBLIC_GROQ_API_KEY ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;
const APP_URL = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "https://vitaforge-pi.vercel.app";

async function sendMsg(chatId: number, text: string, markup?: any) {
  await fetch(`${TG}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown", ...(markup ? { reply_markup: markup } : {}) }) });
}

async function aiResponse(text: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: "Sen ZenFit AI fitness trener. O'zbek tilida qisqa, foydali javob ber. Kaloriya so'ralsa aniq raqam ayt." }, { role: "user", content: text }], max_tokens: 500 }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Xatolik yuz berdi";
}

async function getUserByTgId(tgId: number) {
  if (!SUPABASE_KEY) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions?telegram_id=eq.${tgId}&select=user_id`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  const data = await res.json();
  return data?.[0]?.user_id ?? null;
}

async function getStreak(userId: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/member_streaks?member_id=eq.${userId}&select=current_streak,total_points,longest_streak`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  const data = await res.json();
  return data?.[0] ?? { current_streak: 0, total_points: 0, longest_streak: 0 };
}

async function getPlan(userId: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/fitness_plans?member_id=eq.${userId}&is_active=eq.true&select=nutrition,workouts,week_number&order=created_at.desc&limit=1`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  const data = await res.json();
  return data?.[0] ?? null;
}

// Mini App button (goes to dashboard, not landing)
const appBtn = { inline_keyboard: [[{ text: "📱 ZenFit ochish", web_app: { url: `${APP_URL}/dashboard` } }]] };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const msg = body.message;
  if (!msg?.chat?.id || !msg?.text) return NextResponse.json({ ok: true });

  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const tgId = msg.from?.id;
  const firstName = msg.from?.first_name ?? "";

  // ─── /start ────────────────────────────────────────────
  if (text === "/start" || text.startsWith("/start ")) {
    const param = text.split(" ")[1] ?? "";

    // Auth flow
    if (param.startsWith("auth_")) {
      const fullName = `${firstName} ${msg.from?.last_name ?? ""}`.trim();
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions?telegram_id=eq.${tgId}&select=user_id`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
      const existing = await checkRes.json();
      if (existing?.length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions?telegram_id=eq.${tgId}`, { method: "PATCH", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ username: param }) });
      } else {
        const email = `tg${tgId}@zenfit.app`;
        const password = `tg_${tgId}_${BOT_TOKEN.slice(0, 8)}`;
        const signup = await (await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password, data: { full_name: fullName, role: "member" } }) })).json();
        if (signup?.user?.id) await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions`, { method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ user_id: signup.user.id, telegram_id: tgId, chat_id: chatId, username: param }) });
      }
      await sendMsg(chatId, "✅ *Tasdiqlandi!* Brauzerga qayting yoki ilovani oching 👇", appBtn);
      return NextResponse.json({ ok: true });
    }

    // Normal start
    await sendMsg(chatId, `🏋️ *ZenFit AI* ga xush kelibsiz, ${firstName}!\n\n📋 /plan — Haftalik plan\n🥗 /food <ovqat> — Kaloriya\n🔥 /streak — Streak holati\n🏆 /top — Leaderboard\n🤖 /ask <savol> — AI trener\n❓ /help — Yordam\n\n📱 Ilovani ochish uchun 👇`, appBtn);
    return NextResponse.json({ ok: true });
  }

  // ─── /plan ─────────────────────────────────────────────
  if (text === "/plan") {
    const userId = await getUserByTgId(tgId);
    if (!userId) { await sendMsg(chatId, "❌ Avval ilovadan ro'yxatdan o'ting", appBtn); return NextResponse.json({ ok: true }); }
    const plan = await getPlan(userId);
    if (!plan) { await sendMsg(chatId, "📋 Hali plan yo'q. Ilovadan AI plan yarating 👇", appBtn); return NextResponse.json({ ok: true }); }
    const n = plan.nutrition ?? {};
    const workouts = plan.workouts ?? [];
    const today = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"][new Date().getDay()];
    const todayW = workouts.find((w: any) => w.day === today);
    let msg2 = `📋 *Hafta ${plan.week_number} plani*\n\n🥗 Kunlik: ${n.daily_calories ?? "?"} kkal\nProtein: ${n.protein_g ?? "?"}g | Karbo: ${n.carbs_g ?? "?"}g | Yog': ${n.fat_g ?? "?"}g\n\n`;
    if (todayW) {
      msg2 += `💪 *Bugun (${today}):* ${todayW.type}\n`;
      (todayW.exercises ?? []).slice(0, 4).forEach((e: any) => { msg2 += `• ${e.name} — ${e.sets}×${e.reps}\n`; });
    } else { msg2 += `😴 Bugun dam olish kuni`; }
    await sendMsg(chatId, msg2, appBtn);
    return NextResponse.json({ ok: true });
  }

  // ─── /streak ───────────────────────────────────────────
  if (text === "/streak") {
    const userId = await getUserByTgId(tgId);
    if (!userId) { await sendMsg(chatId, "❌ Avval ro'yxatdan o'ting", appBtn); return NextResponse.json({ ok: true }); }
    const s = await getStreak(userId);
    const fire = "🔥".repeat(Math.min(Math.ceil(s.current_streak / 7), 5));
    await sendMsg(chatId, `${fire || "💤"} *Streak: ${s.current_streak} kun*\n\n🏆 Rekord: ${s.longest_streak} kun\n⚡ Kuch: ${s.total_points} ball\n\n${s.current_streak >= 7 ? "Zo'r! Davom eting! 🚀" : "Har kuni mashq — streak oshadi!"}`);
    return NextResponse.json({ ok: true });
  }

  // ─── /top ──────────────────────────────────────────────
  if (text === "/top" || text === "/leaderboard") {
    if (!SUPABASE_KEY) { await sendMsg(chatId, "❌ Xizmat mavjud emas"); return NextResponse.json({ ok: true }); }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/member_streaks?select=member_id,total_points&order=total_points.desc&limit=5`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    const top = await res.json();
    const ids = (top ?? []).map((t: any) => t.member_id);
    let names: Record<string, string> = {};
    if (ids.length) {
      const ur = await fetch(`${SUPABASE_URL}/rest/v1/users?id=in.(${ids.join(",")})&select=id,full_name`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
      const users = await ur.json();
      names = Object.fromEntries((users ?? []).map((u: any) => [u.id, u.full_name]));
    }
    const medals = ["🥇", "🥈", "🥉", "4.", "5."];
    let msg2 = "🏆 *Top 5 Reyting*\n\n";
    (top ?? []).forEach((t: any, i: number) => { msg2 += `${medals[i]} ${names[t.member_id] ?? "?"} — ${t.total_points} ⚡\n`; });
    await sendMsg(chatId, msg2 || "Hali reyting yo'q");
    return NextResponse.json({ ok: true });
  }

  // ─── /food ─────────────────────────────────────────────
  if (text.startsWith("/food ")) {
    const food = text.slice(6).trim();
    const answer = await aiResponse(`'${food}' ovqatining kaloriyasi, proteini, yog'i va karbohidratini qisqa ayt. Faqat raqamlar.`);
    await sendMsg(chatId, `🥗 *${food}*\n\n${answer}`);
    return NextResponse.json({ ok: true });
  }

  // ─── /ask ──────────────────────────────────────────────
  if (text.startsWith("/ask ")) {
    const answer = await aiResponse(text.slice(5));
    await sendMsg(chatId, answer);
    return NextResponse.json({ ok: true });
  }

  // ─── /help ─────────────────────────────────────────────
  if (text === "/help") {
    await sendMsg(chatId, "🤖 *ZenFit Bot buyruqlari:*\n\n📋 /plan — Bugungi mashq plani\n🥗 /food <ovqat> — Kaloriya hisoblash\n🔥 /streak — Streak va ball\n🏆 /top — Leaderboard\n🤖 /ask <savol> — AI trener\n📱 /app — Ilovani ochish\n❓ /help — Ushbu yordam");
    return NextResponse.json({ ok: true });
  }

  // ─── /app ──────────────────────────────────────────────
  if (text === "/app") {
    await sendMsg(chatId, "📱 ZenFit ilovasini ochish 👇", appBtn);
    return NextResponse.json({ ok: true });
  }

  // ─── Default: AI javob ─────────────────────────────────
  const answer = await aiResponse(text);
  await sendMsg(chatId, answer);
  return NextResponse.json({ ok: true });
}

// GET: webhook setup
export async function GET() {
  const url = `${APP_URL}/api/telegram`;
  const res = await fetch(`${TG}/setWebhook`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
  return NextResponse.json(await res.json());
}
