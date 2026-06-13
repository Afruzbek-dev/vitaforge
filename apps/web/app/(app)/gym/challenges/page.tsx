"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { useAuthStore } from "@/lib/store/auth";

export default function ChallengesPage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const userStore = useAuthStore((s) => s.user);
  const isOwner = userStore?.role === "gym_owner" || userStore?.role === "trainer";
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", target_value: "100", days: "7", prize_desc: "", bonus_points: "200" });

  const { data: challenges } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("challenges").select("*").eq("gym_id", me?.gym_id).order("created_at", { ascending: false });
      // Get participants for each
      const enriched = await Promise.all((data ?? []).map(async (ch) => {
        const { data: parts } = await sb.from("challenge_participants").select("member_id, current_value, joined_at").eq("challenge_id", ch.id);
        const myPart = (parts ?? []).find((p) => p.member_id === user!.id);
        return { ...ch, participants: parts ?? [], my_participation: myPart };
      }));
      return enriched;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const now = new Date();
      await sb.from("challenges").insert({
        gym_id: me?.gym_id, title: form.title, description: form.description,
        metric: "points", target_value: parseInt(form.target_value),
        starts_at: now.toISOString(), ends_at: new Date(now.getTime() + parseInt(form.days) * 86400000).toISOString(),
        prize_desc: form.prize_desc, bonus_points: parseInt(form.bonus_points), created_by: user!.id,
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["challenges"] }); setShowCreate(false); },
  });

  // Member joins challenge (pending approval)
  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const user = await getUser();
      await sb.from("challenge_participants").insert({ challenge_id: challengeId, member_id: user!.id, current_value: 0 });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });

  // Owner removes participant
  const removeParticipant = useMutation({
    mutationFn: async ({ challengeId, memberId }: { challengeId: string; memberId: string }) => {
      await sb.from("challenge_participants").delete().eq("challenge_id", challengeId).eq("member_id", memberId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">🎯 Challenge</h1>
          <p className="text-muted text-xs font-mono mt-1">{isOwner ? "YARATISH VA BOSHQARISH" : "ISHTIROK ETISH"}</p>
        </div>
        {isOwner && <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? "Bekor" : "+ Yangi"}</Button>}
      </div>

      {showCreate && isOwner && (
        <Card className="border-accent-border/40">
          <CardContent className="p-5 space-y-3">
            <div className="space-y-2"><Label>Sarlavha</Label><Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="7 kunlik streak challenge" /></div>
            <div className="space-y-2"><Label>Tavsif</Label><Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="7 kun ketma-ket gym ga keling" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label>Kun</Label><Input type="number" value={form.days} onChange={(e) => setForm((p) => ({ ...p, days: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Maqsad</Label><Input type="number" value={form.target_value} onChange={(e) => setForm((p) => ({ ...p, target_value: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Bonus ⚡</Label><Input type="number" value={form.bonus_points} onChange={(e) => setForm((p) => ({ ...p, bonus_points: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Mukofot</Label><Input value={form.prize_desc} onChange={(e) => setForm((p) => ({ ...p, prize_desc: e.target.value }))} placeholder="Top 3 ga bonus" /></div>
            <Button onClick={() => create.mutate()} disabled={!form.title || create.isPending}>{create.isPending ? "..." : "🎯 Challenge boshlash"}</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {(challenges ?? []).map((ch: any) => {
          const now = Date.now();
          const end = new Date(ch.ends_at).getTime();
          const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
          const active = now < end;
          const joined = !!ch.my_participation;

          return (
            <Card key={ch.id} className={active ? "border-accent-border/30" : "opacity-60"}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display font-bold text-sm text-vtext">{ch.title}</p>
                    <p className="text-muted text-xs mt-0.5">{ch.description}</p>
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${active ? "bg-accent/10 text-accent" : "bg-surface text-muted"}`}>
                    {active ? `${daysLeft} kun` : "Tugadi"}
                  </span>
                </div>

                <div className="flex gap-3 text-xs text-muted">
                  <span>🏆 {ch.prize_desc || `${ch.bonus_points}⚡`}</span>
                  <span>👥 {ch.participants.length} ishtirokchi</span>
                  <span>🎯 Maqsad: {ch.target_value}</span>
                </div>

                {/* Member: Join button */}
                {!isOwner && active && !joined && (
                  <Button size="sm" variant="outline" onClick={() => joinChallenge.mutate(ch.id)} disabled={joinChallenge.isPending}>
                    🙋 Ishtirok etish
                  </Button>
                )}
                {!isOwner && joined && (
                  <div className="bg-vgreen/10 border border-vgreen/20 rounded-lg p-2 text-xs text-vgreen">
                    ✅ Siz ishtirok etyapsiz! Ball: {ch.my_participation.current_value}
                  </div>
                )}

                {/* Owner: See participants + manage */}
                {isOwner && ch.participants.length > 0 && (
                  <div className="border-t border-border pt-2 mt-2">
                    <p className="text-xs font-mono text-muted mb-2">ISHTIROKCHILAR</p>
                    <div className="space-y-1">
                      {ch.participants.map((p: any) => (
                        <ParticipantRow key={p.member_id} participant={p} challengeId={ch.id} onRemove={removeParticipant.mutate} />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {(challenges ?? []).length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted text-sm">{isOwner ? "Hali challenge yo'q" : "Hozirda challenge yo'q"}</CardContent></Card>
        )}
      </div>
    </div>
  );
}

// Participant row component
function ParticipantRow({ participant, challengeId, onRemove }: { participant: any; challengeId: string; onRemove: (d: any) => void }) {
  const sb = getSupabase();
  const { data: user } = useQuery({
    queryKey: ["user", participant.member_id],
    queryFn: async () => { const { data } = await sb.from("users").select("full_name").eq("id", participant.member_id).single(); return data; },
  });
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-vtext">{user?.full_name ?? "..."} <span className="text-muted text-xs">({participant.current_value} ball)</span></span>
      <Button variant="ghost" size="sm" className="text-vred text-xs h-6" onClick={() => onRemove({ challengeId, memberId: participant.member_id })}>✕</Button>
    </div>
  );
}
