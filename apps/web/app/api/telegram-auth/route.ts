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
  const { initData, register, name, phone, role } = await req.json();
  if (!initData) return NextResponse.json({ error: "No initData" }, { status: 400 });

  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  let tgUser = validateInitData(initData);
  
  // Fallback for DEMO_MODE or missing BOT_TOKEN testing
  if (!tgUser && isDemo) {
    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    tgUser = userStr ? JSON.parse(userStr) : { id: 12345, first_name: "Demo", username: "demo_user" };
  }
  
  if (!tgUser) return NextResponse.json({ error: "Invalid initData" }, { status: 401 });

  const telegramId = (tgUser as any).id;
  const fullName = name || `${(tgUser as any).first_name ?? ""} ${(tgUser as any).last_name ?? ""}`.trim();
  const username = (tgUser as any).username ?? "";

  if (isDemo) {
    return NextResponse.json({ 
      success: true, 
      access_token: "demo-token", 
      user: { id: "demo-member-1", full_name: fullName, role: role || "member", telegram_id: telegramId } 
    });
  }

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
    
    // Login to get token
    const email = `tg${telegramId}@zenfit.app`;
    const password = `tg_${telegramId}_${BOT_TOKEN.slice(0, 8)}`;
    const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: SUPABASE_SERVICE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const login = await loginRes.json();

    return NextResponse.json({ success: true, access_token: login.access_token, user: users?.[0] ?? null, telegram_id: telegramId });
  }

  // If user does not exist and registration data is not provided yet
  if (!register) {
    return NextResponse.json({ success: false, register_required: true, telegram_id: telegramId, name: fullName, username });
  }

  // Registering new user
  const email = `tg${telegramId}@zenfit.app`;
  const password = `tg_${telegramId}_${BOT_TOKEN.slice(0, 8)}`;
  const userRole = role || "member";

  // Try sign up
  const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: SUPABASE_SERVICE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, data: { full_name: fullName, role: userRole } }),
  });
  const signup = await signupRes.json();
  const userId = signup?.user?.id ?? signup?.id;

  if (userId) {
    // Update user profile table with phone, name, role
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName, full_name: fullName, phone, role: userRole, telegram_id: telegramId }),
    });

    // Auto-create gym for gym_owner
    if (userRole === "gym_owner") {
      const slug = fullName.toLowerCase().replace(/\s+/g, "-").slice(0, 20) + "-gym";
      const gymInsertRes = await fetch(`${SUPABASE_URL}/rest/v1/gyms`, {
        method: "POST",
        headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify({ name: `${fullName} Gym`, slug, owner_id: userId, subscription_plan: 'basic' }),
      });
      const gymsCreated = await gymInsertRes.json();
      if (gymsCreated?.length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
          method: "PATCH",
          headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ gym_id: gymsCreated[0].id }),
        });
      }
    }

    // Link telegram
    await fetch(`${SUPABASE_URL}/rest/v1/telegram_sessions`, {
      method: "POST",
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ user_id: userId, telegram_id: telegramId, chat_id: telegramId, username }),
    });
  }

  // Sign in to get token
  const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_SERVICE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const login = await loginRes.json();

  return NextResponse.json({ success: true, access_token: login.access_token, user: { id: userId, name: fullName, full_name: fullName, phone, role: userRole, telegram_id: telegramId } });
}
