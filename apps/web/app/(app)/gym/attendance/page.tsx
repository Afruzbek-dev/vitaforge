"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export default function AttendancePage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const today = new Date().toISOString().split("T")[0];

  const { data: members } = useQuery({
    queryKey: ["gym", "members-attendance"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("users").select("id, full_name").eq("gym_id", me?.gym_id).eq("role", "member");
      return data ?? [];
    },
  });

  const { data: todayAttendance } = useQuery({
    queryKey: ["attendance", today],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("attendance").select("member_id").eq("gym_id", me?.gym_id).gte("checked_in_at", `${today}T00:00:00`).lte("checked_in_at", `${today}T23:59:59`);
      return new Set((data ?? []).map((a) => a.member_id));
    },
  });

  const markAttendance = useMutation({
    mutationFn: async (memberId: string) => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      await sb.from("attendance").insert({ member_id: memberId, gym_id: me?.gym_id, source: "manual" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });

  const attended = todayAttendance ?? new Set();

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">📅 Davomat</h1>
        <p className="text-muted text-sm font-mono mt-1">{today} · BUGUNGI KUN</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Bugun kelganlar ({attended.size}/{(members ?? []).length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {(members ?? []).map((m: any) => {
            const present = attended.has(m.id);
            return (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent-border/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${present ? "bg-vgreen/20 text-vgreen" : "bg-surface text-muted"}`}>
                    {present ? "✓" : m.full_name?.[0]}
                  </div>
                  <span className={`text-sm ${present ? "text-vtext" : "text-muted"}`}>{m.full_name}</span>
                </div>
                {present ? (
                  <span className="text-xs font-mono text-vgreen">KELDI ✓</span>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => markAttendance.mutate(m.id)} disabled={markAttendance.isPending}>
                    Belgilash
                  </Button>
                )}
              </div>
            );
          })}
          {(members ?? []).length === 0 && <p className="text-muted text-sm text-center py-4">Hali a'zo yo'q</p>}
        </CardContent>
      </Card>
    </div>
  );
}
