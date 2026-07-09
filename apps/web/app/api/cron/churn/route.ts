import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Vercel cron handler
// Runs daily via vercel.json configuration
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  
  // 1. Get all members
  const { data: members } = await sb.from("users").select("id, gym_id").eq("role", "member");
  if (!members || members.length === 0) return NextResponse.json({ success: true, count: 0 });

  // 2. Fetch required data (attendance, streaks, payments)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data: attendance } = await sb.from("attendance").select("member_id").gte("checked_in_at", sevenDaysAgo);
  const activeIds = new Set(attendance?.map(a => a.member_id));

  const { data: streaks } = await sb.from("member_streaks").select("member_id, current_streak");
  const streakMap = Object.fromEntries((streaks ?? []).map(s => [s.member_id, s.current_streak]));

  const { data: payments } = await sb.from("payments")
    .select("member_id, status")
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: false });

  const paymentMap = new Map();
  (payments ?? []).forEach(p => {
    if (!paymentMap.has(p.member_id)) paymentMap.set(p.member_id, p.status);
  });

  // 3. Calculate scores
  const updates = members.map(m => {
    let riskScore = 0;
    
    // Frequency
    if (!activeIds.has(m.id)) riskScore += 35;
    
    // Streak
    const st = streakMap[m.id] ?? 0;
    if (st === 0) riskScore += 25;
    
    // Payment
    const pStat = paymentMap.get(m.id);
    if (pStat === "pending" || pStat === "overdue" || pStat === "rejected") riskScore += 20;
    else if (!pStat) riskScore += 20;

    // AI & Gamification (simulated logic for the rest of 20%)
    if (st < 3) riskScore += 10;
    
    return {
      id: m.id,
      risk_score: riskScore,
      risk_level: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
      last_calculated_at: new Date().toISOString()
    };
  });

  // 4. Batch update member_profiles with the new score
  // Since Supabase doesn't have a single batch update call for multiple different rows easily without a stored procedure,
  // we do a loop for MVP (In production, use an RPC or upsert with unique constraints)
  for (const update of updates) {
    await sb.from("member_profiles").update({
      risk_score: update.risk_score,
      risk_level: update.risk_level
    }).eq("user_id", update.id);
  }

  return NextResponse.json({ success: true, processed: updates.length });
}
