// Direct Supabase data layer — no backend API needed
import { getSupabase } from "./supabase";
import { signIn, signUp, signOut, getUser } from "./auth";

function sb() { return getSupabase(); }

export const supabaseApi = {
  auth: {
    login: async (email: string, password: string) => {
      const data = await signIn(email, password);
      return { success: true, data: { access_token: data.session?.access_token, refresh_token: data.session?.refresh_token, expires_in: data.session?.expires_in } };
    },
    register: async (body: { email: string; password: string; full_name: string; role: string }) => {
      const data = await signUp(body.email, body.password, { full_name: body.full_name, role: body.role });
      return { success: true, data: { user_id: data.user?.id } };
    },
    logout: async () => { await signOut(); return { success: true }; },
  },

  users: {
    me: async () => {
      const user = await getUser();
      if (!user) throw new Error("Not authenticated");
      const { data } = await sb().from("users").select("*").eq("id", user.id).single();
      return data ?? { id: user.id, role: user.user_metadata?.role ?? "member", full_name: user.user_metadata?.full_name, gym_id: null };
    },
    stats: async () => {
      const user = await getUser();
      if (!user) return { data: {} };
      const { data: streak } = await sb().from("member_streaks").select("*").eq("member_id", user.id).single();
      const { count } = await sb().from("attendance").select("*", { count: "exact", head: true }).eq("member_id", user.id);
      return { data: { current_streak: streak?.current_streak ?? 0, longest_streak: streak?.longest_streak ?? 0, total_points: streak?.total_points ?? 0, badges: streak?.badges ?? [], total_attendance: count ?? 0 } };
    },
    update: async (body: any) => {
      const user = await getUser();
      const { data } = await sb().from("users").update(body).eq("id", user!.id).select().single();
      return data;
    },
  },

  onboarding: {
    status: async () => {
      const user = await getUser();
      if (!user) return { data: { onboarding_done: false, has_profile: false } };
      const { data } = await sb().from("member_profiles").select("onboarding_done").eq("user_id", user.id).single();
      return { data: { onboarding_done: data?.onboarding_done ?? false, has_profile: !!data } };
    },
    saveProfile: async (body: any) => {
      const user = await getUser();
      const { data: existing } = await sb().from("member_profiles").select("id").eq("user_id", user!.id).single();
      if (existing) {
        await sb().from("member_profiles").update({ ...body, onboarding_done: true }).eq("user_id", user!.id);
      } else {
        await sb().from("member_profiles").insert({ ...body, user_id: user!.id, onboarding_done: true });
      }
      return { data: { onboarding_done: true } };
    },
  },

  plans: {
    current: async () => {
      const user = await getUser();
      const { data } = await sb().from("fitness_plans").select("*").eq("member_id", user!.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).single();
      if (!data) throw new Error("Plan topilmadi");
      return { data };
    },
    history: async () => {
      const user = await getUser();
      const { data } = await sb().from("fitness_plans").select("*").eq("member_id", user!.id).order("created_at", { ascending: false }).limit(10);
      return { data: data ?? [] };
    },
    generate: async () => {
      // Without backend AI — just return a message
      return { data: { job_id: "pending", message: "Plan yaratish uchun backend kerak" } };
    },
  },

  food: {
    log: async (body: any) => {
      const user = await getUser();
      const { data } = await sb().from("food_logs").insert({ ...body, member_id: user!.id }).select().single();
      return { data };
    },
    getLog: async (date?: string) => {
      const user = await getUser();
      let q = sb().from("food_logs").select("*").eq("member_id", user!.id).order("logged_at", { ascending: true });
      if (date) q = q.gte("logged_at", `${date}T00:00:00`).lte("logged_at", `${date}T23:59:59`);
      const { data } = await q;
      return { data: data ?? [] };
    },
    search: async (q: string) => {
      const { data } = await sb().from("uzbek_foods").select("*").or(`name_uz.ilike.%${q}%,name_ru.ilike.%${q}%`).limit(20);
      return { data: data ?? [] };
    },
    summary: async () => {
      const user = await getUser();
      const { data } = await sb().from("food_logs").select("calories,protein_g,carbs_g,fat_g").eq("member_id", user!.id);
      const totals = (data ?? []).reduce((acc, r) => ({
        total_calories: acc.total_calories + (r.calories || 0),
        total_protein: acc.total_protein + (r.protein_g || 0),
        total_carbs: acc.total_carbs + (r.carbs_g || 0),
        total_fat: acc.total_fat + (r.fat_g || 0),
      }), { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 });
      return { data: { ...totals, entries: data?.length ?? 0 } };
    },
    parse: async (text: string) => {
      // Without AI — basic lookup in uzbek_foods
      const { data } = await sb().from("uzbek_foods").select("*").or(`name_uz.ilike.%${text}%,aliases.cs.{${text.toLowerCase()}}`).limit(1).single();
      if (data) {
        const serving = data.serving_size_g || 100;
        const mult = serving / 100;
        return { data: { food_name: data.name_uz, quantity_g: serving, calories: Math.round(data.calories_per_100g * mult), protein_g: Math.round(data.protein_g * mult), carbs_g: Math.round(data.carbs_g * mult), fat_g: Math.round(data.fat_g * mult), confidence: 0.9 } };
      }
      return { data: { food_name: text, quantity_g: 100, calories: null, protein_g: null, carbs_g: null, fat_g: null, confidence: 0.2 } };
    },
  },

  photos: {
    upload: async (formData: FormData) => {
      const user = await getUser();
      const file = formData.get("file") as File;
      const photoType = formData.get("photo_type") as string ?? "front";
      const now = new Date();
      const week = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000);
      const path = `${user!.id}/${now.getFullYear()}-${String(week).padStart(2, "0")}-${photoType}.jpg`;
      await sb().storage.from("progress-photos").upload(path, file, { upsert: true });
      await sb().from("progress_photos").insert({ member_id: user!.id, storage_path: path, photo_type: photoType, taken_at: now.toISOString().split("T")[0], week_number: week });
      return { data: { photo_id: path, message: "Foto yuklandi" } };
    },
    history: async () => {
      const user = await getUser();
      const { data: photos } = await sb().from("progress_photos").select("*").eq("member_id", user!.id).order("taken_at", { ascending: false });
      // Generate signed URLs
      const withUrls = await Promise.all((photos ?? []).map(async (p) => {
        const { data: signed } = await sb().storage.from("progress-photos").createSignedUrl(p.storage_path, 600);
        return { ...p, url: signed?.signedUrl ?? null };
      }));
      return { data: withUrls };
    },
    compare: async (week1: number, week2: number) => {
      const user = await getUser();
      const { data } = await sb().from("progress_photos").select("*").eq("member_id", user!.id).in("week_number", [week1, week2]);
      return { data: data ?? [] };
    },
  },

  gym: {
    members: async () => {
      const user = await getUser();
      const { data: me } = await sb().from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb().from("users").select("id,full_name,phone,role").eq("gym_id", me?.gym_id).eq("role", "member");
      // Get profiles
      const ids = (data ?? []).map((u) => u.id);
      const { data: profiles } = await sb().from("member_profiles").select("user_id,goal,onboarding_done").in("user_id", ids);
      const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));
      return { data: (data ?? []).map((u) => ({ ...u, goal: profileMap[u.id]?.goal ?? null, onboarding_done: profileMap[u.id]?.onboarding_done ?? false })) };
    },
    member: async (id: string) => {
      const { data: user } = await sb().from("users").select("*").eq("id", id).single();
      const { data: profile } = await sb().from("member_profiles").select("*").eq("user_id", id).single();
      const { data: streak } = await sb().from("member_streaks").select("*").eq("member_id", id).single();
      return { data: { ...user, profile, streak: { current: streak?.current_streak ?? 0, total_points: streak?.total_points ?? 0, badges: streak?.badges ?? [] } } };
    },
    retention: async () => {
      const user = await getUser();
      const { data: me } = await sb().from("users").select("gym_id").eq("id", user!.id).single();
      const { count: total } = await sb().from("users").select("*", { count: "exact", head: true }).eq("gym_id", me?.gym_id).eq("role", "member");
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data: active } = await sb().from("attendance").select("member_id").eq("gym_id", me?.gym_id).gte("checked_in_at", thirtyDaysAgo);
      const activeCount = new Set(active?.map((a) => a.member_id)).size;
      return { data: { total_members: total ?? 0, active_last_30_days: activeCount, retention_rate: total ? Math.round((activeCount / total) * 1000) / 10 : 0 } };
    },
    churnRisk: async () => {
      const user = await getUser();
      const { data: me } = await sb().from("users").select("gym_id").eq("id", user!.id).single();
      const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
      const { data: recentActive } = await sb().from("attendance").select("member_id").eq("gym_id", me?.gym_id).gte("checked_in_at", twoWeeksAgo);
      const activeIds = new Set(recentActive?.map((a) => a.member_id));
      const { data: allMembers } = await sb().from("users").select("id,full_name").eq("gym_id", me?.gym_id).eq("role", "member");
      const atRisk = (allMembers ?? []).filter((m) => !activeIds.has(m.id));
      return { data: { at_risk_members: atRisk, count: atRisk.length } };
    },
  },

  leaderboard: {
    get: async () => {
      const user = await getUser();
      const { data: me } = await sb().from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb().from("member_streaks").select("member_id,total_points,current_streak,badges").order("total_points", { ascending: false }).limit(10);
      // Get names
      const ids = (data ?? []).map((s) => s.member_id);
      const { data: users } = await sb().from("users").select("id,full_name").in("id", ids);
      const nameMap = Object.fromEntries((users ?? []).map((u) => [u.id, u.full_name]));
      return { data: (data ?? []).map((s, i) => ({ rank: i + 1, member_id: s.member_id, full_name: nameMap[s.member_id] ?? "?", points: s.total_points, streak: s.current_streak, badges: s.badges })) };
    },
    myRank: async () => {
      const user = await getUser();
      const { data } = await sb().from("member_streaks").select("member_id,total_points").order("total_points", { ascending: false });
      const idx = (data ?? []).findIndex((s) => s.member_id === user!.id);
      return { data: { rank: idx >= 0 ? idx + 1 : null, points: data?.[idx]?.total_points ?? 0 } };
    },
  },

  notifications: {
    list: async () => {
      const user = await getUser();
      const { data } = await sb().from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50);
      return { data: data ?? [] };
    },
    markRead: async (id: string) => {
      await sb().from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
      return { success: true };
    },
  },
};
