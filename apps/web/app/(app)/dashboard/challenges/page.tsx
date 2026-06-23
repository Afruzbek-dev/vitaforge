"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Target } from "lucide-react";

export default function MemberChallengesPage() {
  const qc = useQueryClient();
  const sb = getSupabase();

  const { data } = useQuery({
    queryKey: ["member-challenges"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      if (!me?.gym_id) return [];
      const { data: challenges } = await sb.from("challenges").select("*").eq("gym_id", me.gym_id).eq("is_active", true).order("created_at", { ascending: false });
      const { data: myParts } = await sb.from("challenge_participants").select("challenge_id, current_value").eq("member_id", user!.id);
      const joinedMap = Object.fromEntries((myParts ?? []).map((p) => [p.challenge_id, p]));
      return (challenges ?? []).map((ch) => ({ ...ch, joined: !!joinedMap[ch.id], myValue: joinedMap[ch.id]?.current_value ?? 0 }));
    },
  });

  const join = useMutation({
    mutationFn: async (challengeId: string) => {
      const user = await getUser();
      await sb.from("challenge_participants").insert({ challenge_id: challengeId, member_id: user!.id, current_value: 0 });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member-challenges"] }),
  });

  return (
    <div className="max-w-lg md:max-w-2xl mx-auto space-y-4 animate-fadeUp pb-20 md:pb-4">
      <div className="flex items-center gap-2">
        <Target size={20} className="text-accent" />
        <h1 className="font-display font-bold text-lg text-vtext">Challengelar</h1>
      </div>

      {(!data || data.length === 0) ? (
        <Card><CardContent className="p-8 text-center text-muted text-sm">Hozirda aktiv challenge yo'q</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {data.map((ch: any) => {
            const end = new Date(ch.ends_at).getTime();
            const daysLeft = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
            return (
              <Card key={ch.id} className={ch.joined ? "border-vgreen/20" : "border-accent-border/20"}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-display font-bold text-sm text-vtext">{ch.title}</p>
                      {ch.description && <p className="text-[11px] text-muted mt-0.5">{ch.description}</p>}
                    </div>
                    <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full">{daysLeft} kun</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted mb-3">
                    <span>🏆 {ch.prize_desc || `${ch.bonus_points}⚡`}</span>
                    <span>🎯 Maqsad: {ch.target_value}</span>
                  </div>
                  {ch.joined ? (
                    <div className="flex items-center justify-between bg-vgreen/5 border border-vgreen/20 rounded-lg p-2.5">
                      <span className="text-[11px] text-vgreen">✓ Ishtirok etyapsiz</span>
                      <span className="text-[11px] font-mono text-vtext">{ch.myValue} / {ch.target_value}</span>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full" onClick={() => join.mutate(ch.id)} disabled={join.isPending}>
                      {join.isPending ? "..." : "🙋 Ishtirok etish"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
