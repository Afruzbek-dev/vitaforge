import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";

// Validate Telegram initData
function validateInitData(initData: string): Record<string, string> | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  params.delete("hash");
  const sorted = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join("\n");
  const secret = createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
  const computed = createHmac("sha256", secret).update(sorted).digest("hex");
  if (computed !== hash) return null;
  const user = params.get("user");
  return user ? JSON.parse(user) : null;
}

export async function POST(req: NextRequest) {
  const { initData } = await req.json();
  if (!initData) return NextResponse.json({ error: "No initData" }, { status: 400 });

  const tgUser = validateInitData(initData);
  if (!tgUser) return NextResponse.json({ error: "Invalid initData" }, { status: 401 });

  const telegramId = (tgUser as any).id;
  const fullName = `${(tgUser as any).first_name ?? ""} ${(tgUser as any).last_name ?? ""}`.trim();

  // Check if telegram user already linked
  const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions?telegram_id=eq.${telegramId}&select=user_id`, {
    headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
  });
  const sessions = await sbRes.json();

  if (sessions?.length > 0 && sessions[0].user_id) {
    // User exists — get their data
    const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${sessions[0].user_id}&select=*`, {
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const users = await userRes.json();
    return NextResponse.json({ success: true, user: users?.[0] ?? null, telegram_id: telegramId });
  }

  // New telegram user — create account via Supabase Auth
  const email = `tg${telegramId}@zenfit.app`;
  const password = `tg_${telegramId}_${BOT_TOKEN.slice(0, 8)}`;

  // Try sign up
  const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: SUPABASE_SERVICE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, data: { full_name: fullName, role: "member" } }),
  });
  const signup = await signupRes.json();
  const userId = signup?.user?.id ?? signup?.id;

  if (userId) {
    // Link telegram
    await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions`, {
      method: "POST",
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ user_id: userId, telegram_id: telegramId, chat_id: telegramId, username: (tgUser as any).username ?? "" }),
    });
  }

  // Sign in to get token
  const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_SERVICE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const login = await loginRes.json();

  return NextResponse.json({ success: true, access_token: login.access_token, user: { id: userId, full_name: fullName, role: "member", telegram_id: telegramId } });
}
