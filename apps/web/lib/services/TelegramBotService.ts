import { getSupabaseAdmin } from "@/lib/supabase-admin";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const GROQ_KEY = process.env.NEXT_PUBLIC_AI_API_KEY ?? process.env.NEXT_PUBLIC_GROQ_API_KEY ?? "";
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export class TelegramBotService {
  /**
   * Yuborilgan xabarni Telegram foydalanuvchisiga etkazadi
   */
  static async sendMessage(chatId: number, text: string, markup?: any) {
    await fetch(`${TG_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        ...(markup ? { reply_markup: markup } : {})
      })
    });
  }

  /**
   * AI yordamida javob qaytaradi
   */
  static async getAIResponse(text: string): Promise<string> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${GROQ_KEY}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        model: "llama-3.3-70b-versatile", 
        messages: [
          { role: "system", content: "Sen ZenFit AI fitness trener. O'zbek tilida qisqa, foydali javob ber. Kaloriya so'ralsa aniq raqam ayt." }, 
          { role: "user", content: text }
        ], 
        max_tokens: 500 
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "Xatolik yuz berdi";
  }

  /**
   * Telegram ID orqali tizimdagi user_id ni topadi
   */
  static async getUserIdByTelegramId(tgId: number): Promise<string | null> {
    const sb = getSupabaseAdmin();
    const { data } = await sb.from("telegram_sessions").select("user_id").eq("telegram_id", tgId).single();
    return data?.user_id ?? null;
  }

  /**
   * Telegram foydalanuvchisini ro'yxatdan o'tkazadi
   */
  static async registerUser(tgId: number, chatId: number, firstName: string, lastName: string, usernameParam: string) {
    const sb = getSupabaseAdmin();
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Check if session already exists
    const { data: existing } = await sb.from("telegram_sessions").select("user_id").eq("telegram_id", tgId);
    
    if (existing && existing.length > 0) {
      await sb.from("telegram_sessions").update({ username: usernameParam }).eq("telegram_id", tgId);
      return;
    }

    const email = `tg${tgId}@zenfit.app`;
    const password = `tg_${tgId}_${BOT_TOKEN.slice(0, 8)}`;

    const { data: signup } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "member" }
    });

    if (signup?.user?.id) {
      await sb.from("telegram_sessions").insert({
        user_id: signup.user.id,
        telegram_id: tgId,
        chat_id: chatId,
        username: usernameParam
      });
    }
  }

  static async getStreak(userId: string) {
    const sb = getSupabaseAdmin();
    const { data } = await sb.from("member_streaks").select("current_streak,total_points,longest_streak").eq("member_id", userId).single();
    return data ?? { current_streak: 0, total_points: 0, longest_streak: 0 };
  }

  static async getActivePlan(userId: string) {
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("fitness_plans")
      .select("nutrition,workouts,week_number")
      .eq("member_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    return data;
  }

  static async getUserProfile(userId: string) {
    const sb = getSupabaseAdmin();
    const { data } = await sb.from("users").select("full_name,role,created_at").eq("id", userId).single();
    return data;
  }

  static async getTopLeaderboard(limit = 5) {
    const sb = getSupabaseAdmin();
    const { data: top } = await sb
      .from("member_streaks")
      .select("member_id,total_points")
      .order("total_points", { ascending: false })
      .limit(limit);
      
    if (!top || top.length === 0) return [];

    const ids = top.map((t: any) => t.member_id);
    const { data: users } = await sb.from("users").select("id,full_name").in("id", ids);
    const names = Object.fromEntries((users ?? []).map((u: any) => [u.id, u.full_name]));

    return top.map((t: any) => ({
      ...t,
      full_name: names[t.member_id] ?? "?"
    }));
  }

  static async setupWebhook(url: string) {
    const webhookRes = await fetch(`${TG_API}/setWebhook`, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ url }) 
    });
    const webhookData = await webhookRes.json();

    await fetch(`${TG_API}/setMyCommands`, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commands: [
        { command: "start", description: "🏋️ Boshlash" },
        { command: "plan", description: "📋 Bugungi mashq rejasi" },
        { command: "food", description: "🥗 Ovqat kaloriyasi" },
        { command: "streak", description: "🔥 Streak holati" },
        { command: "top", description: "🏆 Reyting (Leaderboard)" },
        { command: "ask", description: "🤖 AI trenerga savol" },
        { command: "profile", description: "👤 Profil ma'lumotlari" },
        { command: "app", description: "📱 Mini App ochish" },
        { command: "help", description: "❓ Yordam" },
      ] }) 
    });

    await fetch(`${TG_API}/setChatMenuButton`, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        menu_button: { 
          type: "web_app", 
          text: "📱 ZenFit", 
          web_app: { url: `${url.replace("/api/telegram", "")}/dashboard` } 
        } 
      }) 
    });

    return webhookData;
  }
}
