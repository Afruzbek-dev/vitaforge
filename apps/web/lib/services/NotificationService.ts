import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export class NotificationService {
  static async getList() {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    
    const sb = getSupabase();
    const { data } = await sb
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
      
    return data ?? [];
  }

  static async markAsRead(id: string) {
    const sb = getSupabase();
    await sb
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
      
    return { success: true };
  }
}
