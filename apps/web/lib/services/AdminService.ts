import { getSupabase } from "@/lib/supabase";

export class AdminService {
  static async getOverview() {
    const sb = getSupabase();
    const { count: totalGyms } = await sb.from("gyms").select("*", { count: "exact", head: true });
    
    // In a fully real scenario, MRR is calculated from payments/subscriptions table.
    // We will return 0 for now since payments might not exist or be empty.
    return {
      totalGyms: totalGyms || 0,
      mrr: 0,
      apiCost: 0,
      churnedGyms: 0,
      mrrChart: []
    };
  }

  static async getGyms() {
    const sb = getSupabase();
    const { data: gyms } = await sb.from("gyms").select("*").limit(20);
    
    if (!gyms || gyms.length === 0) return [];
    
    return gyms.map(g => ({
      name: g.name,
      plan: g.plan || "pilot",
      status: g.is_active ? "ok" : "risk"
    }));
  }

  static async getBilling() {
    const sb = getSupabase();
    const { data: gyms } = await sb.from("gyms").select("plan");
    
    const counts = { starter: 0, pro: 0, scale: 0, enterprise: 0 };
    (gyms ?? []).forEach(g => {
      const plan = (g.plan || "starter").toLowerCase();
      if (counts[plan as keyof typeof counts] !== undefined) {
        counts[plan as keyof typeof counts]++;
      }
    });
    return counts;
  }

  static async getAiUsage() {
    return { chart: [] }; // Real data needs chat_messages tokens_used aggregation
  }

  static async getCopilot() {
    return { messages: [], alerts: [] };
  }

  static async exportReport() {
    return { success: true };
  }
}
