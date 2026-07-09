import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export class TrainerService {
  static async getToday() {
    return {
      sessions: [
        { time: "14:00", name: "Jasur", workout: "Kuch", status: "ok" },
        { time: "15:30", name: "Madina", workout: "Cardio", status: "risk" },
        { time: "17:00", name: "Otabek", workout: "Yelka", status: "ok" }
      ],
      activeClients: 22,
      avgAdherence: 81
    };
  }

  static async getClients() {
    const user = await getUser();
    const sb = getSupabase();
    
    // trainer_id is user.id
    const { data: members } = await sb.from("member_profiles").select("user_id").eq("trainer_id", user?.id);
    const memberIds = (members ?? []).map(m => m.user_id);
    
    const { data: users } = await sb.from("users").select("id, full_name").in("id", memberIds);
    
    if (!users || users.length === 0) {
      return [{ id: 1, name: "Jasur Toshmatov", adh: 81, status: "ok" }, { id: 2, name: "Dilnoza Karimova", adh: 42, status: "risk" }];
    }
    return users.map(u => ({
      id: u.id,
      name: u.full_name,
      adh: Math.floor(Math.random() * 50) + 40, // fallback adherence logic
      status: Math.random() > 0.8 ? "risk" : "ok"
    }));
  }

  static async getSchedule() {
    return [
      { day: "Dushanba", sessions: 6 },
      { day: "Seshanba", sessions: 8, active: true },
      { day: "Chorshanba", sessions: 5 },
      { day: "Payshanba", sessions: 7 }
    ];
  }

  static async getAnalytics() {
    return { totalSessions: 96, avgAdherence: 81, riskClients: 2, revenue: 1840 };
  }

  static async getCopilot() {
    return { messages: [{ id: 1, sender: "ai", text: "Salom, Coach! Sizning profilingiz tayyor." }] };
  }

  static async sendMessage(data: any) {
    return { id: Date.now(), sender: 'user', text: data.message };
  }

  static async addSession() {
    return { success: true };
  }
}
