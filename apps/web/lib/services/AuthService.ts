import { signIn, signUp, signOut } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

export class AuthService {
  static async login(email: string, password: string) {
    const data = await signIn(email, password);
    return {
      success: true,
      data: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in
      }
    };
  }

  static async register(body: RegisterPayload) {
    const data = await signUp(body.email, body.password, {
      full_name: body.full_name,
      role: body.role
    });

    if (body.role === "gym_owner" && data.user) {
      const sb = getSupabase();
      const slug = body.full_name.toLowerCase().replace(/\s+/g, "-").slice(0, 20) + "-gym";
      const { data: gym } = await sb
        .from("gyms")
        .insert({ name: `${body.full_name} Gym`, slug, owner_id: data.user.id })
        .select()
        .single();
        
      if (gym) {
        await sb.from("users").update({ gym_id: gym.id }).eq("id", data.user.id);
      }
    }

    return { success: true, data: { user_id: data.user?.id } };
  }

  static async logout() {
    await signOut();
    return { success: true };
  }
}
