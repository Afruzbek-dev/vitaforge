import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CRON_SECRET = process.env.CRON_SECRET ?? "zenfit-cron-2025";

async function sbFetch(path: string, opts: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...opts, headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", ...opts.headers } });
}

async function sendTg(chatId: number, text: string) {
  if (!BOT_TOKEN || !chatId) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

// GET /api/cron — streak reset + reminders
// Call via Vercel Cron or external cron service
export async function GET(req: NextRequest) {
  // Verify cron secret
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== CRON_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // 1. Reset streaks for users who didn't do anything yesterday
  const { data: expired } = await (await sbFetch(`member_streaks?last_activity=lt.${yesterday}&current_streak=gt.0&select=member_id,current_streak`)).json() as any;
  for (const s of expired ?? []) {
    await sbFetch(`member_streaks?member_id=eq.${s.member_id}`, { method: "PATCH", body: JSON.stringify({ current_streak: 0 }) });
  }

  // 2. Send streak reminders (18:00) to users who haven't logged today
  const { data: atRisk } = await (await sbFetch(`member_streaks?last_activity=lt.${today}&current_streak=gt.2&select=member_id,current_streak`)).json() as any;
  const memberIds = (atRisk ?? []).map((s: any) => s.member_id);
  if (memberIds.length) {
    const { data: sessions } = await (await sbFetch(`telegram_sessions?user_id=in.(${memberIds.join(",")})&select=user_id,chat_id`)).json() as any;
    for (const sess of sessions ?? []) {
      const streak = (atRisk ?? []).find((s: any) => s.member_id === sess.user_id);
      await sendTg(sess.chat_id, `🔥 *Streak xavfda!*\n\nSizning ${streak?.current_streak ?? 0} kunlik streak buzilishi mumkin.\nBugun ham mashq qiling! 💪`);
    }
  }

  // 3. Expire memberships
  await sbFetch(`memberships?expires_at=lt.${today}&status=eq.active`, { method: "PATCH", body: JSON.stringify({ status: "expired" }) });

  return NextResponse.json({ success: true, streaks_reset: (expired ?? []).length, reminders_sent: memberIds.length });
}
