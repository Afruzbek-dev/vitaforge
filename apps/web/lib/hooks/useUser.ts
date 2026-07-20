
import { useQuery, useMutation } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = await getUser();
      if (!user) throw new Error("Not authenticated");
      const sb = getSupabase();
      const { data } = await sb.from("users").select("*").eq("id", user.id).single();
      return data ?? { id: user.id, role: user.user_metadata?.role ?? "member", full_name: user.user_metadata?.full_name, gym_id: null };
    }
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ["user", "stats"],
    queryFn: async () => {
      const user = await getUser();
      if (!user) return { current_streak: 0, longest_streak: 0, total_points: 0, badges: [], total_attendance: 0 };
      const sb = getSupabase();
      const { data: streak } = await sb.from("member_streaks").select("*").eq("member_id", user.id).single();
      const { count } = await sb.from("attendance").select("*", { count: "exact", head: true }).eq("member_id", user.id);
      return {
        current_streak: streak?.current_streak ?? 0,
        longest_streak: streak?.longest_streak ?? 0,
        total_points: streak?.total_points ?? 0,
        badges: streak?.badges ?? [],
        total_attendance: count ?? 0
      };
    }
  });
}
