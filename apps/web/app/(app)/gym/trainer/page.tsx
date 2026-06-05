"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { generatePlan } from "@/lib/ai";

export default function TrainerMembersPage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const [selected, setSelected] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const { data: members } = useQuery({
    queryKey: ["trainer-members"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("users").select("id, full_name, phone").eq("gym_id", me?.gym_id).eq("role", "member");
      // Get profiles + streaks
      const ids = (data ?? []).map((m) => m.id);
      const { data: profiles } = await sb.from("member_profiles").select("user_id, goal, weight_kg, height_cm, age, activity_level").in("user_id", ids);
      const { data: streaks } = await sb.from("member_streaks").select("member_id, current_streak, total_points").in("member_id", ids);
      const { data: plans } = await sb.from("fitness_plans").select("member_id, week_number, is_active").in("member_id", ids).eq("is_active", true);
      const pMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));
      const sMap = Object.fromEntries((streaks ?? []).map((s) => [s.member_id, s]));
      const plMap = Object.fromEntries((plans ?? []).map((p) => [p.member_id, p]));
      return (data ?? []).map((m) => ({ ...m, profile: pMap[m.id], streak: sMap[m.id], plan: plMap[m.id] }));
    },
  });

  const generateForMember = async (member: any) => {
    if (!member.profile) return alert("A'zo profilini to'ldirmagan");
    setGenerating(true);
    const p = member.profile;
    const result = await generatePlan({ age: p.age ?? 25, gender: "male", height_cm: p.height_cm ?? 175, weight_kg: p.weight_kg ?? 80, goal: p.goal ?? "health", activity_level: p.activity_level ?? "moderate" });
    if (result) {
      const user = await getUser();
      const now = new Date();
      const week = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000);
      await sb.from("fitness_plans").update({ is_active: false }).eq("member_id", member.id).eq("is_active", true);
      await sb.from("fitness_plans").insert({ member_id: member.id, trainer_id: user!.id, generated_by: "trainer", week_number: week, starts_at: now.toISOString().split("T")[0], ends_at: new Date(now.getTime() + 6 * 86400000).toISOString().split("T")[0], workouts: result.workouts ?? [], nutrition: result.nutrition ?? {}, ai_model: "llama-3.3-70b", is_active: true });
      qc.invalidateQueries({ queryKey: ["trainer-members"] });
    }
    setGenerating(false);
    setSelected(null);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">👥 A'zolarim</h1>
        <p className="text-muted text-xs font-mono mt-1">NAZORAT VA PLAN TUZISH</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {(members ?? []).map((m: any) => (
          <Card key={m.id} className={`cursor-pointer transition-colors ${selected?.id === m.id ? "border-accent-border" : "hover:border-accent-border/30"}`} onClick={() => setSelected(m)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">{m.full_name?.[0]}</div>
                  <div>
                    <p className="text-sm font-medium text-vtext">{m.full_name}</p>
                    <p className="text-[10px] text-muted font-mono">{m.profile?.goal ?? "noaniq"} · {m.streak?.current_streak ?? 0}🔥</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-accent font-mono text-sm font-bold">{m.streak?.total_points ?? 0}⚡</p>
                  <p className="text-[10px] text-muted">{m.plan ? `Hafta ${m.plan.week_number}` : "Plan yo'q"}</p>
                </div>
              </div>
              {m.profile && (
                <div className="grid grid-cols-4 gap-1 text-[10px] text-muted">
                  <span>{m.profile.age} yosh</span>
                  <span>{m.profile.weight_kg}kg</span>
                  <span>{m.profile.height_cm}cm</span>
                  <span>{m.profile.activity_level}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected member panel */}
      {selected && (
        <Card className="border-accent-border/40">
          <CardHeader>
            <CardTitle className="text-base">{selected.full_name} — Trener boshqaruvi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-bg rounded-lg p-2"><p className="text-accent font-bold">{selected.streak?.current_streak ?? 0}</p><p className="text-[10px] text-muted">Streak</p></div>
              <div className="bg-bg rounded-lg p-2"><p className="text-accent font-bold">{selected.streak?.total_points ?? 0}</p><p className="text-[10px] text-muted">Kuch</p></div>
              <div className="bg-bg rounded-lg p-2"><p className="text-accent font-bold">{selected.plan ? "Bor" : "Yo'q"}</p><p className="text-[10px] text-muted">Plan</p></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => generateForMember(selected)} disabled={generating} className="flex-1">
                {generating ? "AI yozmoqda..." : "🤖 AI Plan yaratish"}
              </Button>
              <Button variant="outline" onClick={() => setSelected(null)} className="flex-1">Yopish</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(members ?? []).length === 0 && (
        <Card><CardContent className="p-8 text-center text-muted text-sm">Gym owner sizni gymga qo'shishi kerak</CardContent></Card>
      )}
    </div>
  );
}
