"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { POINTS } from "@/lib/gamification";

export default function TodayPage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [foodDone, setFoodDone] = useState(false);

  const { data: planData } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const plan = planData?.data ?? planData;

  const dayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
  const todayIdx = new Date().getDay();
  const todayName = dayNames[todayIdx];
  const todayWorkout = plan?.workouts?.find((w: any) => w.day === todayName || w.day?.toLowerCase() === todayName.toLowerCase());

  const saveProgress = useMutation({
    mutationFn: async () => {
      const user = await getUser();
      // Award points for workout
      const { data: streak } = await sb.from("member_streaks").select("*").eq("member_id", user!.id).single();
      const currentPoints = streak?.total_points ?? 0;
      const newPoints = currentPoints + POINTS.daily_workout + (foodDone ? POINTS.food_log : 0);
      const currentStreak = streak?.current_streak ?? 0;
      const lastActivity = streak?.last_activity;
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const newStreak = lastActivity === yesterday ? currentStreak + 1 : lastActivity === today ? currentStreak : 1;

      if (streak) {
        await sb.from("member_streaks").update({
          total_points: newPoints,
          current_streak: newStreak,
          longest_streak: Math.max(streak.longest_streak ?? 0, newStreak),
          last_activity: today,
        }).eq("member_id", user!.id);
      } else {
        await sb.from("member_streaks").insert({
          member_id: user!.id, total_points: newPoints, current_streak: 1, longest_streak: 1, last_activity: today,
        });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stats"] }); alert("✅ Bugungi mashg'ulot saqlandi! +" + (POINTS.daily_workout + (foodDone ? POINTS.food_log : 0)) + " ⚡ Kuch"); },
  });

  const toggleExercise = (idx: number) => {
    setCompleted((prev) => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">📅 Bugungi mashg'ulot</h1>
        <p className="text-muted text-sm font-mono mt-1">{todayName.toUpperCase()} · {new Date().toLocaleDateString()}</p>
      </div>

      {!todayWorkout ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-3">😴</p>
            <p className="text-muted text-sm">Bugun dam olish kuni yoki plan yo'q</p>
            <p className="text-accent text-xs font-mono mt-2">Plan sahifasida yangi plan yarating</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-accent-border/30">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">💪 {todayWorkout.type} · {todayWorkout.duration_min} daqiqa</CardTitle>
                <span className="text-xs font-mono text-accent">{completed.size}/{todayWorkout.exercises?.length ?? 0} bajarildi</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayWorkout.exercises?.map((ex: any, i: number) => (
                <button key={i} onClick={() => toggleExercise(i)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${completed.has(i) ? "border-vgreen/40 bg-vgreen/5" : "border-border hover:border-accent-border/40"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${completed.has(i) ? "bg-vgreen text-bg" : "bg-surface text-muted"}`}>
                      {completed.has(i) ? "✓" : i + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${completed.has(i) ? "text-vgreen line-through" : "text-vtext"}`}>{ex.name}</p>
                      {ex.notes && <p className="text-xs text-muted">{ex.notes}</p>}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-accent">{ex.sets}×{ex.reps}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Food compliance */}
          <Card>
            <CardHeader><CardTitle className="text-base">🥗 Ovqat ratsioniga amal qildingizmi?</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button variant={foodDone ? "default" : "secondary"} onClick={() => setFoodDone(true)} className="flex-1">
                  ✅ Ha, amal qildim
                </Button>
                <Button variant={!foodDone ? "outline" : "secondary"} onClick={() => setFoodDone(false)} className="flex-1">
                  ❌ Bugun buzildi
                </Button>
              </div>
              {plan?.nutrition?.meal_plan && (
                <div className="mt-3 space-y-1 text-xs text-muted">
                  {Object.entries(plan.nutrition.meal_plan).map(([k, v]) => (
                    <p key={k}>{k === "breakfast" ? "🌅" : k === "lunch" ? "☀️" : k === "dinner" ? "🌙" : "⚡"} {v as string}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save */}
          <Button onClick={() => saveProgress.mutate()} disabled={saveProgress.isPending || completed.size === 0}
            className="w-full" size="lg">
            {saveProgress.isPending ? "Saqlanmoqda..." : `✓ Bugungi natijani saqlash (+${POINTS.daily_workout + (foodDone ? POINTS.food_log : 0)} ⚡)`}
          </Button>
        </>
      )}
    </div>
  );
}
