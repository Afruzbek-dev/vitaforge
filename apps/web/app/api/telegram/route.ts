import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const GROQ_KEY = process.env.NEXT_PUBLIC_AI_API_KEY ?? process.env.NEXT_PUBLIC_GROQ_API_KEY ?? "";
const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMsg(chatId: number, text: string) {
  await fetch(`${TG}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }) });
}

async function aiResponse(text: string): Promise<string> {
  const res = await fetch("https://api.bluesminds.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: "Sen ZenFit AI fitness trener. O'zbek tilida qisqa javob ber." }, { role: "user", content: text }], max_tokens: 500 }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Xatolik yuz berdi";
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const msg = body.message;
  if (!msg?.chat?.id || !msg?.text) return NextResponse.json({ ok: true });

  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start" || text.startsWith("/start ")) {
    // Check if auth flow
    const param = text.split(" ")[1] ?? "";
    if (param.startsWith("auth_")) {
      const authId = param;
      const tgId = msg.from?.id;
      const firstName = msg.from?.first_name ?? "";
      const lastName = msg.from?.last_name ?? "";
      const fullName = `${firstName} ${lastName}`.trim();
      const tgUsername = msg.from?.username ?? "";

      // Create or get user in Supabase
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
      const BOT = process.env.TELEGRAM_BOT_TOKEN ?? "";

      // Check if user exists
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions?telegram_id=eq.${tgId}&select=user_id`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      });
      const existing = await checkRes.json();

      let userId: string;
      if (existing?.length > 0 && existing[0].user_id) {
        userId = existing[0].user_id;
        // Update with auth_id for polling
        await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions?telegram_id=eq.${tgId}`, {
          method: "PATCH",
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ username: authId }),
        });
      } else {
        // Create account
        const email = `tg${tgId}@zenfit.app`;
        const password = `tg_${tgId}_${BOT.slice(0, 8)}`;
        const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
          method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, data: { full_name: fullName, role: "member" } }),
        });
        const signup = await signupRes.json();
        userId = signup?.user?.id ?? "";
        // Save session with auth_id
        await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions`, {
          method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ user_id: userId, telegram_id: tgId, chat_id: chatId, username: authId }),
        });
      }

      await sendMsg(chatId, "✅ *Tasdiqlandi!*\n\nBrauzerga qayting — avtomatik kirish bo'ladi.");
      return NextResponse.json({ ok: true });
    }

    // Normal /start
    const webAppUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "https://vitaforge-afruzbeks-projects.vercel.app";
    await fetch(`${TG}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      chat_id: chatId,
      text: "🏋️ *ZenFit AI* ga xush kelibsiz!\n\n📱 Web App ni ochish uchun pastdagi tugmani bosing.\n\nBuyruqlar:\n/food <ovqat> — Kaloriya\n/ask <savol> — AI trener",
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: [[{ text: "📱 ZenFit ochish", web_app: { url: webAppUrl } }]] },
    }) });
  } else if (text.startsWith("/food ")) {
    const answer = await aiResponse(`'${text.slice(6)}' ovqatining kaloriyasi, proteini, yog'i va karbohidratini qisqa ayt.`);
    await sendMsg(chatId, `🥗 ${answer}`);
  } else if (text.startsWith("/ask ")) {
    const answer = await aiResponse(text.slice(5));
    await sendMsg(chatId, answer);
  } else if (text === "/plan") {
    await sendMsg(chatId, "📋 Plan ko'rish uchun web app dan foydalaning.\n\nHaftalik plan AI tomonidan yaratiladi — savollar asosida.");
  } else if (text === "/streak") {
    await sendMsg(chatId, "🔥 Streak va kuch ko'rish uchun web app dan foydalaning.");
  } else {
    const answer = await aiResponse(text);
    await sendMsg(chatId, answer);
  }

  return NextResponse.json({ ok: true });
}

// Webhook setup endpoint
export async function GET() {
  const url = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL ?? "localhost:3000";
  const webhookUrl = `https://${url}/api/telegram`;
  const res = await fetch(`${TG}/setWebhook`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: webhookUrl }) });
  const data = await res.json();
  return NextResponse.json({ webhook: webhookUrl, result: data });
}
