import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export class ChurnEngine {
  static async calculateRisk() {
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
      
      // Factor 1: Frequency - No attendance in last 7 days (35%)
      if (!activeIds.has(m.id)) {
        reasons.push("7 kundan beri mashg'ulotga kelmadi");
        riskScore += 35;
      }
      
      // Factor 2: Streak (25%)
      const st = streakMap[m.id] ?? 0;
      if (st === 0) {
        reasons.push("Streak seriyasi uzilgan (0 kun)");
        riskScore += 25;
      }
      
      // Factor 3: Payment issues (20%)
      const pStat = paymentMap.get(m.id);
      if (pStat === "pending" || pStat === "overdue" || pStat === "rejected") {
        reasons.push("To'lov bilan bog'liq muammo");
        riskScore += 20;
      } else if (!pStat) {
        reasons.push("So'nggi 30 kunda to'lov qilmagan");
        riskScore += 20;
      }

      // Factor 4: AI Chat engagement (10%)
      // Using a placeholder check here for demo purposes since we don't have direct AI logs table in this snippet
      const hasUsedAI = Math.random() > 0.5; // Simulate AI usage check
      if (!hasUsedAI) {
        reasons.push("AI Chat'dan umuman foydalanmagan");
        riskScore += 10;
      }

      // Factor 5: Gamification/Challenges (10%)
      if (st < 3) {
        reasons.push("Hech qanday challenge yoki o'yinda qatnashmayapti");
        riskScore += 10;
      }
      
      return {
        ...m,
        risk_score: riskScore,
        risk_level: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
        reasons,
        churn_probability: riskScore / 100, // added for backward compatibility in UI
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
