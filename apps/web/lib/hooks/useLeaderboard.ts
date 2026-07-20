
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const user = await getUser();
      if (!user) throw new Error("Unauthorized");
      const sb = getSupabase();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user.id).single();
      const { data } = await sb.from("member_streaks").select("member_id,total_points,current_streak,badges").order("total_points", { ascending: false }).limit(10);
      if (!data) return [];
      const ids = data.map((s) => s.member_id);
      const { data: users } = await sb.from("users").select("id,full_name").in("id", ids);
      const nameMap = Object.fromEntries((users ?? []).map((u) => [u.id, u.full_name]));
      return data.map((s, i) => ({
        rank: i + 1,
        member_id: s.member_id,
        full_name: nameMap[s.member_id] ?? "?",
        points: s.total_points,
        streak: s.current_streak,
        badges: s.badges
      }));
    }
  });
}

export function useMyRank() {
  return useQuery({
    queryKey: ["leaderboard", "my-rank"],
    queryFn: async () => {
      const user = await getUser();
      if (!user) throw new Error("Unauthorized");
      const sb = getSupabase();
      const { data } = await sb.from("member_streaks").select("member_id,total_points").order("total_points", { ascending: false });
      const idx = (data ?? []).findIndex((s) => s.member_id === user.id);
      return { rank: idx >= 0 ? idx + 1 : null, points: data?.[idx]?.total_points ?? 0 };
    }
  });
}
