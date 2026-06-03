"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { generatePlan } from "@/lib/ai";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PlanPage() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const sb = getSupabase();

  const { data, isLoading } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const plan = data?.data ?? data;

  const generate = async () => {
    setGenerating(true);
    try {
      const user = await getUser();
      const { data: profile } = await sb.from("member_profiles").select("*").eq("user_id", user!.id).single();

      if (!profile) { alert("Avval onboarding da profilni to'ldiring"); setGenerating(false); return; }

      const result = await generatePlan({
        age: profile.age ?? 25,
        gender: profile.gender ?? "male",
        height_cm: profile.height_cm ?? 175,
        weight_kg: profile.weight_kg ?? 80,
        goal: profile.goal ?? "muscle_gain",
        activity_level: profile.activity_level ?? "moderate",
      });

      if (!result) { alert("AI javob bermadi, qayta urinib ko'ring"); setGenerating(false); return; }

      const now = new Date();
      const week = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000);

      // Deactivate old plans
      await sb.from("fitness_plans").update({ is_active: false }).eq("member_id", user!.id).eq("is_active", true);

      // Save new plan
      await sb.from("fitness_plans").insert({
        member_id: user!.id,
        generated_by: "ai",
        week_number: week,
        starts_at: now.toISOString().split("T")[0],
        ends_at: new Date(now.getTime() + 6 * 86400000).toISOString().split("T")[0],
        workouts: result.workouts ?? [],
        nutrition: result.nutrition ?? {},
        ai_model: "llama-3.3-70b-versatile",
        ai_prompt_version: "v1.0",
        is_active: true,
      });

      qc.invalidateQueries({ queryKey: ["plan"] });
    } catch (e) {
      alert("Xatolik: " + (e as any)?.message);
    }
    setGenerating(false);
  };

  if (isLoading) return <div className="text-muted animate-pulse p-4">Yuklanmoqda...</div>;

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">📋 Haftalik Plan</h1>
          <p className="text-muted text-sm font-mono mt-1">AI TOMONIDAN YARATILGAN</p>
        </div>
        <Button onClick={generate} disabled={generating}>
          {generating ? "⏳ AI yozmoqda..." : "🤖 Yangi plan yaratish"}
        </Button>
      </div>

      {generating && (
        <Card className="border-accent-border/40">
          <CardContent className="p-5 text-center">
            <div className="flex justify-center gap-1.5 mb-3">
              {[0, 1, 2].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
            </div>
            <p className="text-accent text-sm font-medium">AI plan yaratmoqda...</p>
            <p className="text-muted text-xs mt-1">5-10 soniya kutib turing</p>
          </CardContent>
        </Card>
      )}

      {!plan && !generating && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-muted text-sm mb-4">Hali plan yo'q. AI yordamida shaxsiy plan yarating!</p>
            <Button onClick={generate}>🤖 Plan yaratish</Button>
          </CardContent>
        </Card>
      )}

      {plan && (
        <div className="space-y-4">
          {/* Nutrition */}
          <Card className="border-accent-border/30">
            <CardHeader><CardTitle className="text-base">🥗 Kunlik Nutrition</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: "Kaloriya", v: plan.nutrition?.daily_calories, u: "kkal" },
                  { l: "Protein", v: plan.nutrition?.protein_g, u: "g" },
                  { l: "Karbohidrat", v: plan.nutrition?.carbs_g, u: "g" },
                  { l: "Yog'", v: plan.nutrition?.fat_g, u: "g" },
                ].map((n) => (
                  <div key={n.l} className="bg-bg rounded-lg p-3 text-center">
                    <p className="font-display font-bold text-xl text-accent">{n.v ?? "—"}</p>
                    <p className="text-muted text-xs">{n.l} ({n.u})</p>
                  </div>
                ))}
              </div>
              {plan.nutrition?.uzbek_foods_suggested?.length > 0 && (
                <p className="text-sm text-muted mt-3">💡 Tavsiya: {plan.nutrition.uzbek_foods_suggested.join(", ")}</p>
              )}
              {plan.nutrition?.avoid?.length > 0 && (
                <p className="text-sm text-vred/70 mt-1">🚫 Oldini oling: {plan.nutrition.avoid.join(", ")}</p>
              )}
              {plan.nutrition?.meal_plan && (
                <div className="mt-4 space-y-2 border-t border-border pt-3">
                  <p className="text-xs font-mono text-muted uppercase">Ovqatlanish jadvali</p>
                  {Object.entries(plan.nutrition.meal_plan).map(([key, val]) => (
                    <div key={key} className="flex gap-2 text-sm">
                      <span className="text-accent font-mono text-xs w-24 shrink-0">{key === "breakfast" ? "🌅 Nonushta" : key === "lunch" ? "☀️ Tushlik" : key === "dinner" ? "🌙 Kechki" : key === "pre_workout" ? "⚡ Oldin" : "💪 Keyin"}</span>
                      <span className="text-muted">{val as string}</span>
                    </div>
                  ))}
                </div>
              )}
              {plan.nutrition?.water_liters && (
                <p className="text-sm text-vblue mt-2">💧 Suv: {plan.nutrition.water_liters} litr / kun</p>
              )}
            </CardContent>
          </Card>

          {/* Workouts */}
          <Card>
            <CardHeader><CardTitle className="text-base">💪 Mashg'ulotlar</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {plan.workouts?.map((w: any, i: number) => (
                <div key={i} className="border border-border rounded-lg p-4 hover:border-accent-border/40 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-display font-bold text-sm">{w.day}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${w.type === "rest" ? "bg-surface text-muted" : "bg-accent/10 text-accent border border-accent-border"}`}>
                      {w.type} {w.duration_min > 0 ? `· ${w.duration_min} min` : ""}
                    </span>
                  </div>
                  {w.exercises?.length > 0 && (
                    <ul className="text-sm text-muted space-y-1">
                      {w.exercises.map((e: any, j: number) => (
                        <li key={j} className="flex justify-between">
                          <span>• {e.name}</span>
                          <span className="text-accent font-mono text-xs">{e.sets}×{e.reps}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Motivation */}
          {(plan.nutrition as any)?.motivation || (plan as any)?.motivation ? (
            <Card className="border-accent-border/20 bg-accent/5">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-accent">💬 {(plan as any).motivation ?? (plan.nutrition as any)?.motivation}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
