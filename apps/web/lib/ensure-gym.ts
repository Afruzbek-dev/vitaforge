import { getSupabase } from "./supabase";
import { getUser } from "./auth";

/**
 * Gym ID ni olish. Agar yo'q bo'lsa — avtomatik yaratadi.
 * Gym owner yoki trainer bo'lsa ishlaydi.
 */
export async function ensureGym(): Promise<string> {
  const sb = getSupabase();
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: me } = await sb.from("users").select("gym_id, full_name").eq("id", user.id).single();

  if (me?.gym_id) return me.gym_id;

  // Gym yo'q — yaratamiz
  const name = me?.full_name ?? "My";
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20) + "-" + Date.now().toString(36).slice(-4);

  const { data: gym, error } = await sb.from("gyms").insert({ name: `${name} Gym`, slug, owner_id: user.id }).select().single();

  if (error || !gym) throw new Error("Gym yaratilmadi: " + (error?.message ?? ""));

  // users.gym_id yangilash
  await sb.from("users").update({ gym_id: gym.id }).eq("id", user.id);

  // localStorage yangilash
  const stored = localStorage.getItem("zenfit_user");
  if (stored) {
    const u = JSON.parse(stored);
    u.gym_id = gym.id;
    localStorage.setItem("zenfit_user", JSON.stringify(u));
  }

  return gym.id;
}
