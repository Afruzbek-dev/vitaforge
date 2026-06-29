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

  static async getChurnRisk() {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    
    const sb = getSupabase();
    const { data: me } = await sb.from("users").select("gym_id").eq("id", user.id).single();
    
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    const { data: recentActive } = await sb
      .from("attendance")
      .select("member_id")
      .eq("gym_id", me?.gym_id)
      .gte("checked_in_at", twoWeeksAgo);
      
    const activeIds = new Set(recentActive?.map((a) => a.member_id));
    
    const { data: allMembers } = await sb
      .from("users")
      .select("id,full_name")
      .eq("gym_id", me?.gym_id)
      .eq("role", "member");
      
    const atRisk = (allMembers ?? []).filter((m) => !activeIds.has(m.id));
    
    return {
      at_risk_members: atRisk,
      count: atRisk.length
    };
  }
}
