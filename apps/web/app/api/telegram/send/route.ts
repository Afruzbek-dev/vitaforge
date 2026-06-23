import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

export async function POST(req: NextRequest) {
  const { chat_id, text } = await req.json();
  if (!chat_id || !text || !BOT_TOKEN) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text, parse_mode: "Markdown" }),
  });
  const data = await res.json();
  return NextResponse.json({ success: data.ok });
}
