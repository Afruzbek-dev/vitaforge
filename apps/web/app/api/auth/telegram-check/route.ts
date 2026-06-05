import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";

export async function GET(req: NextRequest) {
  const authId = req.nextUrl.searchParams.get("auth_id");
  if (!authId) return NextResponse.json({ success: false });

  // Check if this auth_id has been completed (stored in telegram_sessions metadata)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions?username=eq.auth_${authId}&select=user_id,telegram_id`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  const sessions = await res.json();

  if (!sessions?.length || !sessions[0].user_id) return NextResponse.json({ success: false });

  const userId = sessions[0].user_id;
  const telegramId = sessions[0].telegram_id;

  // Get user
  const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  const users = await userRes.json();

  // Login
  const email = `tg${telegramId}@zenfit.app`;
  const password = `tg_${telegramId}_${process.env.TELEGRAM_BOT_TOKEN?.slice(0, 8)}`;
  const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const login = await loginRes.json();

  // Clean up auth_id
  await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions?username=eq.auth_${authId}`, {
    method: "PATCH",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ username: sessions[0].telegram_id.toString() }),
  });

  return NextResponse.json({ success: true, access_token: login.access_token, user: users?.[0] ?? { id: userId, role: "member" } });
}
