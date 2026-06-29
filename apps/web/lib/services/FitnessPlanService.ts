import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export class FitnessPlanService {
  static async getCurrentPlan() {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");
    
    const sb = getSupabase();
    const { data } = await sb
      .from("fitness_plans")
      .select("*")
      .eq("member_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
      
    if (!data) throw new Error("Plan topilmadi");
    return data;
  }

  static async getPlanHistory() {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");
    
    const sb = getSupabase();
    const { data } = await sb
      .from("fitness_plans")
      .select("*")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
      
    return data ?? [];
  }

  static async generatePlan() {
    return { job_id: "pending", message: "Plan yaratish uchun backend kerak" };
  }
}
