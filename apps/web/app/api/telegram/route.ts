import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY ?? process.env.GROQ_API_KEY ?? "";
const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMsg(chatId: number, text: string) {
  await fetch(`${TG}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }) });
}

async function aiResponse(text: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: "Sen ZenFit AI fitness trener. O'zbek tilida qisqa javob ber." }, { role: "user", content: text }], max_tokens: 500 }),
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

  if (text === "/start") {
    await sendMsg(chatId, "🏋️ *ZenFit AI* ga xush kelibsiz!\n\n/food <ovqat> — Kaloriya\n/ask <savol> — AI trener\n/plan — Plan haqida\n/streak — Streak");
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
