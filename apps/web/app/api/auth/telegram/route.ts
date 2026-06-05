import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = "8990371331";
const CLIENT_SECRET = "tFXzm3PXldKrz9xisjRooFedSR5tDj7Dzj1awwiTAihLSmGX9uceQg";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

// Decode JWT without verification (we trust Telegram's OIDC)
function decodeJwt(token: string) {
  const payload = token.split(".")[1];
  return JSON.parse(Buffer.from(payload, "base64url").toString());
}

export async function POST(req: NextRequest) {
  const { id_token, user: clientUser } = await req.json();

  let tgId: number;
  let fullName: string;
  let username: string;
  let phone: string | null = null;

  if (id_token) {
    // OIDC flow — decode id_token
    const claims = decodeJwt(id_token);
    tgId = claims.id ?? parseInt(claims.sub);
    fullName = claims.name ?? "";
    username = claims.preferred_username ?? "";
    phone = claims.phone_number ?? null;
  } else if (clientUser) {
    // Fallback — direct user data
    tgId = clientUser.id;
    fullName = `${clientUser.first_name ?? ""} ${clientUser.last_name ?? ""}`.trim();
    username = clientUser.username ?? "";
  } else {
    return NextResponse.json({ error: "No auth data" }, { status: 400 });
  }

  // Check existing telegram session
  const sessRes = await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions?telegram_id=eq.${tgId}&select=user_id`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  const sessions = await sessRes.json();

  let userId: string | null = null;

  if (sessions?.length > 0 && sessions[0].user_id) {
    userId = sessions[0].user_id;
  } else {
    // Create new Supabase user
    const email = `tg${tgId}@zenfit.app`;
    const password = `tg_${tgId}_${BOT_TOKEN.slice(0, 8)}`;
    const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, data: { full_name: fullName, role: "member" } }),
    });
    const signup = await signupRes.json();
    userId = signup?.user?.id ?? null;

    if (userId) {
      // Update phone if available
      if (phone) {
        await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
          method: "PATCH",
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ phone, telegram_id: tgId }),
        });
      }
      // Create telegram session
      await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ user_id: userId, telegram_id: tgId, chat_id: tgId, username }),
      });
    }
  }

  // Sign in to get access token
  const email = `tg${tgId}@zenfit.app`;
  const password = `tg_${tgId}_${BOT_TOKEN.slice(0, 8)}`;
  const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const login = await loginRes.json();

  // Get user data
  let user = null;
  if (userId) {
    const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    const users = await userRes.json();
    user = users?.[0] ?? { id: userId, full_name: fullName, role: "member", telegram_id: tgId };
  }

  return NextResponse.json({ success: true, access_token: login.access_token, user });
}
