import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export class GymService {
  static async getMembers() {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    
    const sb = getSupabase();
    const { data: me } = await sb.from("users").select("gym_id").eq("id", user.id).single();
    
    const { data } = await sb
      .from("users")
      .select("id,full_name,phone,role")
      .eq("gym_id", me?.gym_id)
      .eq("role", "member");
      
    const ids = (data ?? []).map((u) => u.id);
    const { data: profiles } = await sb
      .from("member_profiles")
      .select("user_id,goal,onboarding_done")
      .in("user_id", ids);
      
    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));
    
    return (data ?? []).map((u) => ({
      ...u,
      goal: profileMap[u.id]?.goal ?? null,
      onboarding_done: profileMap[u.id]?.onboarding_done ?? false
    }));
  }

  static async getMemberDetails(id: string) {
    const sb = getSupabase();
    const { data: user } = await sb.from("users").select("*").eq("id", id).single();
    const { data: profile } = await sb.from("member_profiles").select("*").eq("user_id", id).single();
    const { data: streak } = await sb.from("member_streaks").select("*").eq("member_id", id).single();
    
    return {
      ...user,
      profile,
      streak: {
        current: streak?.current_streak ?? 0,
        total_points: streak?.total_points ?? 0,
        badges: streak?.badges ?? []
      }
    };
  }

  static async getRetentionAnalytics() {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    
    const sb = getSupabase();
    const { data: me } = await sb.from("users").select("gym_id").eq("id", user.id).single();
    
    const { count: total } = await sb
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("gym_id", me?.gym_id)
      .eq("role", "member");
      
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: active } = await sb
      .from("attendance")
      .select("member_id")
      .eq("gym_id", me?.gym_id)
      .gte("checked_in_at", thirtyDaysAgo);
      
    const activeCount = new Set(active?.map((a) => a.member_id)).size;
    
    return {
      total_members: total ?? 0,
      active_last_30_days: activeCount,
      retention_rate: total ? Math.round((activeCount / total) * 1000) / 10 : 0
    };
  }

  static async getDeepChurnAnalysis() {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    
    const sb = getSupabase();
    const { data: me } = await sb.from("users").select("gym_id").eq("id", user.id).single();
    if (!me?.gym_id) return { at_risk_members: [], count: 0 };
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    
    // Get all members
    const { data: members } = await sb
      .from("users")
      .select("id, full_name, phone")
      .eq("gym_id", me.gym_id)
      .eq("role", "member");
      
    if (!members || members.length === 0) return { at_risk_members: [], count: 0 };
    
    const memberIds = members.map((m) => m.id);
    
    // Get last 7 days attendance
    const { data: recentActive } = await sb
      .from("attendance")
      .select("member_id")
      .eq("gym_id", me.gym_id)
      .gte("checked_in_at", sevenDaysAgo);
    const activeIds = new Set(recentActive?.map((a) => a.member_id));
    
    // Get streaks
    const { data: streaks } = await sb
      .from("member_streaks")
      .select("member_id, current_streak")
      .in("member_id", memberIds);
    const streakMap = Object.fromEntries((streaks ?? []).map((s) => [s.member_id, s.current_streak]));
    
    // Get last payments (simulated check for unpaid/overdue)
    // We check if they have a pending/rejected payment or lack a confirmed payment in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: payments } = await sb
      .from("payments")
      .select("member_id, status")
      .in("member_id", memberIds)
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false });
      
    const paymentMap = new Map();
    (payments ?? []).forEach(p => {
      if (!paymentMap.has(p.member_id)) paymentMap.set(p.member_id, p.status);
    });

    const atRiskMembers = members.map(m => {
      const reasons: string[] = [];
      let riskScore = 0;
      
      // Rule 1: No attendance in last 7 days
      if (!activeIds.has(m.id)) {
        reasons.push("7 kundan beri mashg'ulotga kelmadi");
        riskScore += 40;
      }
      
      // Rule 2: Lost streak (or zero streak)
      const st = streakMap[m.id] ?? 0;
      if (st === 0) {
        reasons.push("Streak seriyasi uzilgan (0 kun)");
        riskScore += 20;
      }
      
      // Rule 3: Payment issues
      const pStat = paymentMap.get(m.id);
      if (pStat === "pending" || pStat === "overdue" || pStat === "rejected") {
        reasons.push("To'lov bilan bog'liq muammo");
        riskScore += 40;
      } else if (!pStat) {
        reasons.push("So'nggi 30 kunda to'lov qilmagan");
        riskScore += 30;
      }
      
      return {
        ...m,
        risk_score: riskScore,
        risk_level: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
        reasons,
        recommended_action: riskScore >= 70 
          ? "Zudlik bilan qo'ng'iroq qilish va holatni so'rash"
          : riskScore >= 40 
          ? "Telegram orqali eslatma va chegirma yuborish" 
          : "Kuzatishda davom etish"
      };
    }).filter(m => m.risk_score >= 40).sort((a, b) => b.risk_score - a.risk_score);
    
    return {
      at_risk_members: atRiskMembers,
      count: atRiskMembers.length
    };
  }
}
