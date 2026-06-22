"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { POINTS } from "@/lib/gamification";
import Link from "next/link";
import { useState } from "react";

function ProgressRing({ progress, size = 48, stroke = 4 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e1e2c" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e8ff47"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const [foodDone, setFoodDone] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: api.users.stats });
  const { data: planData } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const plan = planData?.data ?? planData;
  const s = stats?.data;
  const userQuery = useQuery({ queryKey: ["me"], queryFn: api.users.me, retry: false });
  const me = userQuery.data?.data ?? userQuery.data;
  const level = { progress: ((s?.total_points ?? 0) % 100), name: "Level", emoji: "🥷" };

  const dayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
  const todayName = dayNames[new Date().getDay()];
  const todayWorkout = plan?.workouts?.find((w: any) => w.day === todayName || w.day?.toLowerCase() === todayName.toLowerCase());

  const saveProgress = useMutation({
    mutationFn: async () => {
      const user = await getUser();
      const { data: streak } = await sb.from("member_streaks").select("*").eq("member_id", user!.id).single();
      const currentPoints = streak?.total_points ?? 0;
      const newPoints = currentPoints + POINTS.daily_workout + (foodDone ? POINTS.food_log : 0);
      const currentStreak = streak?.current_streak ?? 0;
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const lastActivity = streak?.last_activity;
      const newStreak = lastActivity === yesterday ? currentStreak + 1 : lastActivity === today ? currentStreak : 1;
      if (streak) {
        await sb
          .from("member_streaks")
          .update({
            total_points: newPoints,
            current_streak: newStreak,
            longest_streak: Math.max(streak.longest_streak ?? 0, newStreak),
            last_activity: today,
          })
          .eq("member_id", user!.id);
      } else {
        await sb.from("member_streaks").insert({
          member_id: user!.id,
          total_points: newPoints,
          current_streak: 1,
          longest_streak: 1,
          last_activity: today,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["plan"] });
      alert("🎉 Natija saqlandi!");
    },
  });

  const toggle = (idx: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <div className="max-w-lg md:max-w-4xl mx-auto space-y-4 animate-fadeUp pb-24 md:pb-4">
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="font-display font-bold text-xl text-vtext">📅 Bugun</h1>
            <p className="text-muted text-[11px] font-mono">{todayName.toUpperCase()} · {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <Link href="/dashboard/plan">
          <Button variant="outline" size="sm" className="text-[11px]">
            Plan → Batafsil
          </Button>
        </Link>
      </div>

      {todayWorkout && (
        <Card className="border-accent-border/30 bg-accent/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">💪 {todayWorkout.type} · {todayWorkout.duration_min} daqiqa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-[10px] text-muted font-mono">
              {completed.size}/{todayWorkout.exercises?.length ?? 0} bajarildi
            </p>
            <div className="space-y-1.5">
              {todayWorkout.exercises?.map((ex: any, i: number) => {
                const done = completed.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggle(i)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      done ? "border-vgreen/40 bg-vgreen/5" : "border-border hover:border-accent-border/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          done ? "bg-vgreen text-bg" : "bg-surface text-muted"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${done ? "text-vgreen line-through" : "text-vtext"}`}>{ex.name}</p>
                        {ex.notes && <p className="text-[10px] text-muted">{ex.notes}</p>}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-accent">{ex.sets}x{ex.reps}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {plan?.nutrition && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">🥗 Bugungi ovqat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted font-mono mb-2">Maqsad: {plan.nutrition.daily_calories} kkal</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { emoji: "🥚", label: "Protein", value: `${plan.nutrition.protein_g}g` },
                { emoji: "🍚", label: "Carb", value: `${plan.nutrition.carbs_g}g` },
              ].map((item) => (
                <div key={item.label} className="p-2 rounded-lg bg-surface border border-border">
                  <p className="text-[10px] text-muted">{item.label}</p>
                  <p className="text-xs text-vtext font-medium">
                    {item.emoji} {item.value}
                  </p>
                </div>
              ))}
            </div>
            <Button
              variant={foodDone ? "default" : "outline"}
              onClick={() => setFoodDone(!foodDone)}
              className="w-full text-[12px]"
            >
              {foodDone ? "✅ Ovqat ratsioniga amal qildim" : "❕ Ratsionni tasdiqlash"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => saveProgress.mutate()}
        disabled={saveProgress.isPending || (todayWorkout ? completed.size === 0 : false)}
        className="w-full bg-accent text-bg font-bold"
      >
        {saveProgress.isPending ? "Saqlanmoqda..." : "✓ Bugun uchun natijani saqlash"}
      </Button>

      <div className="grid grid-cols-2 gap-2">
        {[
          { href: "/dashboard/plan", icon: "📋", title: "Plan", sub: "AI reja" },
          { href: "/dashboard/food", icon: "🥗", title: "Ovqat", sub: "+5⚡" },
          { href: "/dashboard/photos", icon: "📸", title: "Progress", sub: "+20⚡" },
          { href: "/dashboard/chat", icon: "🤖", title: "AI Coach", sub: "24/7" },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="press card-hover h-full">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <p className="text-[11px] font-medium text-vtext">{a.title}</p>
                    <p className="text-[9px] text-accent font-mono">{a.sub}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
