import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export class TrainerService {
  static async getToday() {
    const user = await getUser();
    const sb = getSupabase();
    
    // As there is no specific sessions table, we count their active plans
    const { data: members } = await sb.from("member_profiles").select("user_id").eq("trainer_id", user?.id);
    const activeClients = members?.length || 0;
    
    return {
      sessions: [], // Real data should come from a schedule/sessions table
      activeClients,
      avgAdherence: 0 // Real adherence requires logging logic
    };
  }

  static async getClients() {
    const user = await getUser();
    const sb = getSupabase();
    
    const { data: members } = await sb.from("member_profiles").select("user_id").eq("trainer_id", user?.id);
    const memberIds = (members ?? []).map(m => m.user_id);
    
    if (memberIds.length === 0) return [];

    const { data: users } = await sb.from("users").select("id, full_name").in("id", memberIds);
    
    return (users ?? []).map(u => ({
      id: u.id,
      name: u.full_name,
      adh: 0, 
      status: "ok"
    }));
  }

  static async getSchedule() {
    return []; // No real schedule table yet
  }

  static async getAnalytics() {
    const user = await getUser();
    const sb = getSupabase();
    
    const { data: members } = await sb.from("member_profiles").select("user_id").eq("trainer_id", user?.id);
    
    return { 
      totalSessions: 0, 
      avgAdherence: 0, 
      riskClients: 0, 
      revenue: 0 
    };
  }

  static async getCopilot() {
    const sb = getSupabase();
    // Assuming you have chat_messages or copilot table, otherwise return empty
    return { messages: [] };
  }

  static async sendMessage(data: any) {
    // Should insert to chat_messages in real implementation
    return { id: Date.now(), sender: 'user', text: data.message };
  }

  static async addSession() {
    return { success: true };
  }
}
