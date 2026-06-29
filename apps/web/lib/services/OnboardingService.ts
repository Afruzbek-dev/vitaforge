import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export class OnboardingService {
  static async getStatus() {
    const user = await getUser();
    if (!user) return { onboarding_done: false, has_profile: false };
    
    const sb = getSupabase();
    const { data } = await sb.from("member_profiles").select("onboarding_done").eq("user_id", user.id).single();
    
    return {
      onboarding_done: data?.onboarding_done ?? false,
      has_profile: !!data
    };
  }

  static async saveProfile(body: any) {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");
    
    const sb = getSupabase();
    const { data: existing } = await sb.from("member_profiles").select("id").eq("user_id", user.id).single();
    
    if (existing) {
      await sb.from("member_profiles").update({ ...body, onboarding_done: true }).eq("user_id", user.id);
    } else {
      await sb.from("member_profiles").insert({ ...body, user_id: user.id, onboarding_done: true });
    }
    
    return { onboarding_done: true };
  }
}
