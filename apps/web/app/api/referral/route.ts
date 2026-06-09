import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";

async function sbFetch(path: string, opts: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...opts, headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation", ...opts.headers } });
}

// Generate referral code from user ID
function genCode(userId: string) { return createHash("md5").update(userId).digest("hex").slice(0, 6).toUpperCase(); }

// GET: get my referral link
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "No user_id" }, { status: 400 });
  const code = genCode(userId);
  const botName = "zenfituzbot";
  return NextResponse.json({
    success: true,
    data: { code, link: `https://t.me/${botName}?start=ref_${code}`, web_link: `${req.nextUrl.origin}/register?ref=${code}`, bonus: 500, friend_bonus: 300 },
  });
}

// POST: activate referral
export async function POST(req: NextRequest) {
  const { code, referred_id } = await req.json();
  if (!code || !referred_id) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  // Find referrer by checking all users
  const res = await sbFetch("users?select=id&limit=100");
  const users = await res.json();
  let referrerId: string | null = null;
  for (const u of users ?? []) {
    if (genCode(u.id) === code.toUpperCase()) { referrerId = u.id; break; }
  }
  if (!referrerId || referrerId === referred_id) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  // Check duplicate
  const dupRes = await sbFetch(`referrals?referred_id=eq.${referred_id}&select=id`);
  const dups = await dupRes.json();
  if (dups?.length > 0) return NextResponse.json({ error: "Already used" }, { status: 400 });

  // Create referral
  await sbFetch("referrals", { method: "POST", body: JSON.stringify({ referrer_id: referrerId, referred_id, status: "active" }) });

  // Award points to both
  const bonus = async (uid: string, pts: number) => {
    const r = await sbFetch(`member_streaks?member_id=eq.${uid}&select=total_points`);
    const s = await r.json();
    const current = s?.[0]?.total_points ?? 0;
    await sbFetch(`member_streaks?member_id=eq.${uid}`, { method: "PATCH", body: JSON.stringify({ total_points: current + pts }) });
  };
  await bonus(referrerId, 500);
  await bonus(referred_id, 300);

  return NextResponse.json({ success: true, message: "Referral activated! +300 ⚡" });
}
