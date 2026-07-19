import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export class CopilotService {
  static async getMessages(role: string = "gym_owner") {
    const user = await getUser();
    if (!user) return { messages: [], alerts: [] };
    
    const sb = getSupabase();
    // Assuming a chat_messages table exists
    const { data } = await sb
      .from("chat_messages")
      .select("*")
      .eq("member_id", user.id)
      .eq("role", role)
      .order("created_at", { ascending: true });
      
    return {
      messages: data ?? [],
      alerts: []
    };
  }

  static async sendMessage(role: string = "gym_owner", message: string) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    
    const sb = getSupabase();
    
    // Save user message
    const { data: userMsg } = await sb.from("chat_messages").insert({
      member_id: user.id,
      role: "user",
      content: message,
      session_id: "00000000-0000-0000-0000-000000000000" // Fallback session
    }).select().single();
    
    // Here we would call the actual LLM API or edge function to get AI response
    // For now, we just mock the AI response insertion
    const aiResponseText = "Xabaringizni qabul qildim. Sizga qanday yordam bera olaman?";
    
    const { data: aiMsg } = await sb.from("chat_messages").insert({
      member_id: user.id,
      role: "ai",
      content: aiResponseText,
      session_id: "00000000-0000-0000-0000-000000000000"
    }).select().single();
    
    return { success: true, data: [userMsg, aiMsg] };
  }
}
