"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { POINTS } from "@/lib/gamification";
import { Sparkles, Trophy, Flame, Check } from "lucide-react";

export default function TodayPage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [foodDone, setFoodDone] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [awardedPoints, setAwardedPoints] = useState(0);

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stats"] });
      const pts = POINTS.daily_workout + (foodDone ? POINTS.food_log : 0);
      setAwardedPoints(pts);
      setShowPointsModal(true);
    },
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
      {showPointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#07070a]/80 backdrop-blur-md" onClick={() => setShowPointsModal(false)} />
          <div className="relative bg-[#13131c] border border-[#e8ff47]/20 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-scaleIn">
            <div className="w-16 h-16 rounded-full bg-[#e8ff47]/10 border border-[#e8ff47]/30 flex items-center justify-center text-[#e8ff47] mx-auto mb-4 animate-bounce">
              <Trophy size={32} />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Ajoyib natija!</h3>
            <p className="text-sm text-[#6b6b80] mb-6">Bugungi mashg'ulot muvaffaqiyatli saqlandi va sizga quvvat ballari taqdim etildi.</p>
            
            <div className="bg-[#07070a] border border-[#1e1e2c] rounded-xl p-4 mb-6 flex items-center justify-center gap-2">
              <span className="font-mono text-2xl font-black text-[#e8ff47]">+{awardedPoints}</span>
              <span className="text-[#e8ff47] font-semibold text-sm">⚡ KUCH</span>
            </div>

            <Button onClick={() => setShowPointsModal(false)} className="w-full bg-[#e8ff47] text-[#07070a] hover:bg-[#d6eb3b] font-bold">
              Davom etish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
