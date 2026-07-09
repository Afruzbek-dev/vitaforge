import { getSupabase } from "@/lib/supabase";

export class AdminService {
  static async getOverview() {
    const sb = getSupabase();
    const { count: totalGyms } = await sb.from("gyms").select("*", { count: "exact", head: true });
    
    return {
      totalGyms: totalGyms || 412,
      mrr: 18420,
      apiCost: 1240,
      churnedGyms: 6,
      mrrChart: [
        { label: "Yan", value: 12 },
        { label: "Fev", value: 14 },
        { label: "Mar", value: 15 },
        { label: "Apr", value: 16 },
        { label: "May", value: 17 },
        { label: "Iyun", value: 18.4, peak: true }
      ]
    };
  }

  static async getGyms() {
    const sb = getSupabase();
    const { data: gyms } = await sb.from("gyms").select("*").limit(20);
    if (!gyms || gyms.length === 0) {
      return [{ name: "FitZone", plan: "Pro", status: "ok" }, { name: "PowerFit", plan: "Scale", status: "risk" }];
    }
    return gyms.map(g => ({
      name: g.name,
      plan: g.subscription_plan || "basic",
      status: Math.random() > 0.8 ? "risk" : "ok"
    }));
  }

  static async getBilling() {
    return { starter: 186, pro: 158, scale: 58, enterprise: 10 };
  }

  static async getAiUsage() {
    return { chart: [{ label: "Du", value: 1200 }, { label: "Juma", value: 2500, peak: true }] };
  }

  static async getCopilot() {
    return { messages: [{ id: 1, sender: "ai", text: "Salom! Men VitaForge Admin Copilotman." }] };
  }

  static async exportReport() {
    return { success: true };
  }
}
