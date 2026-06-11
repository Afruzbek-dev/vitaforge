"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";

// Realtime subscription — gym dashboard attendance yangilanishi
export function useRealtimeAttendance(gymId: string | null) {
  const qc = useQueryClient();
  const sb = getSupabase();

  useEffect(() => {
    if (!gymId) return;
    const channel = sb.channel(`attendance-${gymId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "attendance", filter: `gym_id=eq.${gymId}` }, () => {
        qc.invalidateQueries({ queryKey: ["attendance"] });
        qc.invalidateQueries({ queryKey: ["gym-crm-stats"] });
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [gymId]);
}

// Realtime — leaderboard yangilanishi
export function useRealtimeLeaderboard() {
  const qc = useQueryClient();
  const sb = getSupabase();

  useEffect(() => {
    const channel = sb.channel("streaks")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "member_streaks" }, () => {
        qc.invalidateQueries({ queryKey: ["leaderboard"] });
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, []);
}
