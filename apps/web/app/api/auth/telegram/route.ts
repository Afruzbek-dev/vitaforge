import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";

function verifyTelegramLogin(data: Record<string, any>): boolean {
  const { hash, ...rest } = data;
  const sorted = Object.keys(rest).sort().map((k) => `${k}=${rest[k]}`).join("\n");
  const secret = createHmac("sha256", BOT_TOKEN).digest();
  const computed = createHmac("sha256", secret).update(sorted).digest("hex");
  return computed === hash;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!verifyTelegramLogin(body)) return NextResponse.json({ error: "Invalid hash" }, { status: 401 });

  const telegramId = body.id;
  const fullName = `${body.first_name ?? ""} ${body.last_name ?? ""}`.trim();
  const username = body.username ?? "";

  // Check existing session
  const sessRes = await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions?telegram_id=eq.${telegramId}&select=user_id`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  const sessions = await sessRes.json();

  let userId: string | null = null;
  let accessToken: string | null = null;

  if (sessions?.length > 0 && sessions[0].user_id) {
    userId = sessions[0].user_id;
  } else {
    // Create new user
    const email = `tg${telegramId}@zenfit.app`;
    const password = `tg_${telegramId}_${BOT_TOKEN.slice(0, 8)}`;
    const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, data: { full_name: fullName, role: "member" } }),
    });
    const signup = await signupRes.json();
    userId = signup?.user?.id ?? null;

    if (userId) {
      await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ user_id: userId, telegram_id: telegramId, chat_id: telegramId, username }),
      });
    }
  }

  // Sign in
  if (userId) {
    const email = `tg${telegramId}@zenfit.app`;
    const password = `tg_${telegramId}_${BOT_TOKEN.slice(0, 8)}`;
    const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const login = await loginRes.json();
    accessToken = login.access_token ?? null;
  }

  // Get user data
  let user = null;
  if (userId) {
    const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    const users = await userRes.json();
    user = users?.[0] ?? { id: userId, full_name: fullName, role: "member" };
  }

  return NextResponse.json({ success: true, access_token: accessToken, user });
}
