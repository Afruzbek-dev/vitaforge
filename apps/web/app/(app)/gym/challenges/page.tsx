"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export default function ChallengesPage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", metric: "points", target_value: "100", days: "7", prize_desc: "", bonus_points: "200" });

  const { data: challenges } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("challenges").select("*, challenge_participants(count)").eq("gym_id", me?.gym_id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const now = new Date();
      const ends = new Date(now.getTime() + parseInt(form.days) * 86400000);
      await sb.from("challenges").insert({
        gym_id: me?.gym_id, title: form.title, description: form.description,
        metric: form.metric, target_value: parseInt(form.target_value),
        starts_at: now.toISOString(), ends_at: ends.toISOString(),
        prize_desc: form.prize_desc, bonus_points: parseInt(form.bonus_points),
        created_by: user!.id,
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["challenges"] }); setShowCreate(false); setForm({ title: "", description: "", metric: "points", target_value: "100", days: "7", prize_desc: "", bonus_points: "200" }); },
  });

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">🎯 Challenge</h1>
          <p className="text-muted text-xs font-mono mt-1">A'ZOLARNI RAG'BATLANTIRING</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? "Bekor" : "+ Yangi"}</Button>
      </div>

      {showCreate && (
        <Card className="border-accent-border/40">
          <CardContent className="p-5 space-y-3">
            <div className="space-y-2"><Label>Sarlavha</Label><Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="7 kunlik streak challenge" /></div>
            <div className="space-y-2"><Label>Tavsif</Label><Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="7 kun ketma-ket gym ga keling" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label>Kun</Label><Input type="number" value={form.days} onChange={(e) => setForm((p) => ({ ...p, days: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Maqsad</Label><Input type="number" value={form.target_value} onChange={(e) => setForm((p) => ({ ...p, target_value: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Bonus ⚡</Label><Input type="number" value={form.bonus_points} onChange={(e) => setForm((p) => ({ ...p, bonus_points: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Mukofot</Label><Input value={form.prize_desc} onChange={(e) => setForm((p) => ({ ...p, prize_desc: e.target.value }))} placeholder="Top 3 ga 1000 ⚡ bonus" /></div>
            <Button onClick={() => create.mutate()} disabled={!form.title || create.isPending}>{create.isPending ? "..." : "🎯 Challenge boshlash"}</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {(challenges ?? []).map((ch: any) => {
          const now = Date.now();
          const end = new Date(ch.ends_at).getTime();
          const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
          const active = now < end;
          return (
            <Card key={ch.id} className={active ? "border-accent-border/30" : "opacity-60"}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display font-bold text-sm text-vtext">{ch.title}</p>
                    <p className="text-muted text-xs mt-0.5">{ch.description}</p>
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${active ? "bg-accent/10 text-accent" : "bg-surface text-muted"}`}>
                    {active ? `${daysLeft} kun` : "Tugadi"}
                  </span>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted">
                  <span>🏆 {ch.prize_desc || `${ch.bonus_points}⚡`}</span>
                  <span>👥 {ch.challenge_participants?.[0]?.count ?? 0} ishtirokchi</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(challenges ?? []).length === 0 && !showCreate && (
          <Card><CardContent className="p-8 text-center text-muted text-sm">Hali challenge yo'q</CardContent></Card>
        )}
      </div>
    </div>
  );
}
