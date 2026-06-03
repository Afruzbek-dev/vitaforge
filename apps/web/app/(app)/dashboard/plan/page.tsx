"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { generatePlan } from "@/lib/ai";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Savollar (dietolog_sport_trener asosida) ────────────────
const QUESTIONS = [
  {
    id: "basics",
    title: "👤 Shaxsiy ma'lumotlar",
    fields: [
      { key: "age", label: "Yosh", type: "number", placeholder: "25" },
      { key: "gender", label: "Jins", type: "select", options: [{ v: "male", l: "Erkak" }, { v: "female", l: "Ayol" }] },
      { key: "height_cm", label: "Bo'y (cm)", type: "number", placeholder: "178" },
      { key: "weight_kg", label: "Vazn (kg)", type: "number", placeholder: "82" },
      { key: "job_type", label: "Kasbi", type: "select", options: [{ v: "office", l: "O'troq (ofis)" }, { v: "moderate", l: "O'rtacha (yurish-turish)" }, { v: "physical", l: "Jismoniy mehnat" }] },
      { key: "sleep_hours", label: "Uyqu (soat/kecha)", type: "number", placeholder: "7" },
    ],
  },
  {
    id: "goal",
    title: "🎯 Maqsad va motivatsiya",
    fields: [
      { key: "goal", label: "Asosiy maqsad", type: "select", options: [{ v: "weight_loss", l: "Vazn yo'qotish" }, { v: "muscle_gain", l: "Mushak olish" }, { v: "endurance", l: "Chidamlilik" }, { v: "health", l: "Sog'lom turmush" }, { v: "cutting", l: "Kesish (cutting)" }] },
      { key: "deadline", label: "Qachongacha erishmoqchi?", type: "select", options: [{ v: "1month", l: "1 oy" }, { v: "3months", l: "3 oy" }, { v: "6months", l: "6 oy" }, { v: "1year", l: "1 yil" }] },
      { key: "experience", label: "Sport tajribasi", type: "select", options: [{ v: "beginner", l: "Boshlang'ich (0-6 oy)" }, { v: "intermediate", l: "O'rtacha (6 oy - 2 yil)" }, { v: "advanced", l: "Tajribali (2+ yil)" }] },
      { key: "motivation", label: "Nima sababdan boshlayapsiz?", type: "text", placeholder: "Sog'liq uchun, ko'rinish uchun..." },
    ],
  },
  {
    id: "health",
    title: "❤️ Sog'liq holati",
    fields: [
      { key: "diseases", label: "Surunkali kasalliklar", type: "text", placeholder: "Yo'q / diabet / qon bosimi..." },
      { key: "allergies", label: "Allergiya / toqatsizlik", type: "text", placeholder: "Yo'q / laktoza / gluten..." },
      { key: "injuries", label: "Shikastlanish / operatsiya", type: "text", placeholder: "Yo'q / tizza shikast..." },
      { key: "medications", label: "Dori qabul qilyapsizmi?", type: "text", placeholder: "Yo'q / ..." },
    ],
  },
  {
    id: "nutrition",
    title: "🥗 Ovqatlanish odatlari",
    fields: [
      { key: "meals_per_day", label: "Kuniga necha marta ovqatlanasiz?", type: "select", options: [{ v: "2", l: "2 marta" }, { v: "3", l: "3 marta" }, { v: "4", l: "4 marta" }, { v: "5", l: "5+ marta" }] },
      { key: "disliked_foods", label: "Yoqtirmaydigan / yeya olmaydigan taomlar", type: "text", placeholder: "Baliq, sut..." },
      { key: "water_intake", label: "Suv iste'moli (litr/kun)", type: "number", placeholder: "2" },
      { key: "appetite_time", label: "Eng ko'p ishtaha vaqti", type: "select", options: [{ v: "morning", l: "Ertalab" }, { v: "afternoon", l: "Tushda" }, { v: "evening", l: "Kechqurun" }] },
    ],
  },
  {
    id: "workout",
    title: "💪 Sport va mashg'ulot",
    fields: [
      { key: "activity_level", label: "Faollik darajasi", type: "select", options: [{ v: "sedentary", l: "Kam harakatli" }, { v: "light", l: "1-3 kun/hafta" }, { v: "moderate", l: "3-5 kun/hafta" }, { v: "active", l: "6-7 kun/hafta" }, { v: "very_active", l: "Juda faol (sportchi)" }] },
      { key: "workout_days", label: "Haftada necha kun mashq qila olasiz?", type: "select", options: [{ v: "2", l: "2 kun" }, { v: "3", l: "3 kun" }, { v: "4", l: "4 kun" }, { v: "5", l: "5 kun" }, { v: "6", l: "6 kun" }] },
      { key: "session_minutes", label: "Bir seans necha daqiqa?", type: "select", options: [{ v: "30", l: "30 daqiqa" }, { v: "45", l: "45 daqiqa" }, { v: "60", l: "60 daqiqa" }, { v: "90", l: "90 daqiqa" }] },
      { key: "location", label: "Qayerda mashq qilasiz?", type: "select", options: [{ v: "gym", l: "Sport zali" }, { v: "home", l: "Uyda" }, { v: "outdoor", l: "Tashqarida" }] },
    ],
  },
  {
    id: "psychology",
    title: "🧠 Psixologik holat",
    fields: [
      { key: "stress_level", label: "Stress darajasi", type: "select", options: [{ v: "low", l: "Past" }, { v: "moderate", l: "O'rtacha" }, { v: "high", l: "Yuqori" }] },
      { key: "emotional_eating", label: "Hissiy ovqatlanish bo'ladimi?", type: "select", options: [{ v: "no", l: "Yo'q" }, { v: "sometimes", l: "Ba'zan" }, { v: "often", l: "Tez-tez" }] },
      { key: "willpower", label: "Iroda kuchi", type: "select", options: [{ v: "low", l: "Past" }, { v: "moderate", l: "O'rtacha" }, { v: "high", l: "Yuqori" }] },
    ],
  },
];

export default function PlanPage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const [mode, setMode] = useState<"view" | "questions" | "generating" | "result">("view");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState<string>("");

  const { data, isLoading } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const plan = data?.data ?? data;

  const updateField = (key: string, value: string) => setAnswers((p) => ({ ...p, [key]: value }));
  const pct = ((step + 1) / QUESTIONS.length) * 100;
  const currentQ = QUESTIONS[step];

  const canNext = () => {
    const required = currentQ.fields.filter((f) => f.type !== "text");
    return required.every((f) => answers[f.key]);
  };

  const generate = async () => {
    setMode("generating");
    try {
      const user = await getUser();
      const result = await generatePlan({
        age: +(answers.age || 25),
        gender: answers.gender || "male",
        height_cm: +(answers.height_cm || 175),
        weight_kg: +(answers.weight_kg || 80),
        goal: answers.goal || "muscle_gain",
        activity_level: answers.activity_level || "moderate",
        ...answers, // pass all answers for richer AI context
      } as any);

      if (!result) { alert("AI javob bermadi"); setMode("questions"); return; }

      const now = new Date();
      const week = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000);
      await sb.from("fitness_plans").update({ is_active: false }).eq("member_id", user!.id).eq("is_active", true);
      await sb.from("fitness_plans").insert({
        member_id: user!.id, generated_by: "ai", week_number: week,
        starts_at: now.toISOString().split("T")[0],
        ends_at: new Date(now.getTime() + 6 * 86400000).toISOString().split("T")[0],
        workouts: result.workouts ?? [], nutrition: result.nutrition ?? {},
        ai_model: "llama-3.3-70b-versatile", ai_prompt_version: "v2.0", is_active: true,
        notes: JSON.stringify(answers),
      });

      setAnalysis(result.summary || "");
      qc.invalidateQueries({ queryKey: ["plan"] });
      setMode("view");
    } catch (e) { alert("Xatolik: " + (e as any)?.message); setMode("questions"); }
  };

  // ─── QUESTIONS MODE ────────────────────────────────────
  if (mode === "questions") return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeUp">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-muted font-mono mb-2">
          <span>{step + 1}/{QUESTIONS.length}</span>
          <span>{currentQ.title}</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Card className="border-accent-border/30">
        <CardHeader>
          <CardTitle className="text-lg">{currentQ.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQ.fields.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              {f.type === "number" && (
                <Input type="number" value={answers[f.key] ?? ""} onChange={(e) => updateField(f.key, e.target.value)} placeholder={f.placeholder} />
              )}
              {f.type === "text" && (
                <Input value={answers[f.key] ?? ""} onChange={(e) => updateField(f.key, e.target.value)} placeholder={f.placeholder} />
              )}
              {f.type === "select" && (
                <div className="grid grid-cols-2 gap-2">
                  {f.options!.map((opt) => (
                    <button key={opt.v} onClick={() => updateField(f.key, opt.v)}
                      className={`p-2.5 rounded-lg border text-sm text-left transition-colors ${answers[f.key] === opt.v ? "border-accent bg-accent/5 text-accent font-medium" : "border-border text-muted hover:border-accent-border"}`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">← Orqaga</Button>}
            {step < QUESTIONS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="flex-1">Keyingi →</Button>
            ) : (
              <Button onClick={generate} className="flex-1">🤖 AI Plan yaratish</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Button variant="ghost" onClick={() => setMode("view")} className="w-full text-muted">Bekor qilish</Button>
    </div>
  );

  // ─── GENERATING MODE ───────────────────────────────────
  if (mode === "generating") return (
    <div className="max-w-md mx-auto text-center py-20 animate-fadeUp">
      <div className="flex justify-center gap-2 mb-6">
        {[0, 1, 2, 3].map((i) => <div key={i} className="w-3 h-3 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}
      </div>
      <h2 className="font-display font-bold text-xl text-vtext mb-2">AI plan yaratmoqda...</h2>
      <p className="text-muted text-sm">Javoblaringiz tahlil qilinmoqda</p>
      <p className="text-accent text-xs font-mono mt-4">BMR → TDEE → Makro → Mashq → Ratsion</p>
    </div>
  );

  // ─── VIEW MODE ─────────────────────────────────────────
  if (isLoading) return <div className="text-muted animate-pulse p-4">Yuklanmoqda...</div>;

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">📋 Haftalik Plan</h1>
          <p className="text-muted text-sm font-mono mt-1">AI DIETOLOG + TRENER</p>
        </div>
        <Button onClick={() => { setStep(0); setMode("questions"); }}>🤖 Yangi plan</Button>
      </div>

      {!plan ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-muted text-sm mb-2">AI sizga shaxsiy plan yaratadi</p>
            <p className="text-muted text-xs mb-4">6 ta savol → Tahlil → Plan</p>
            <Button onClick={() => { setStep(0); setMode("questions"); }}>Boshlash →</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Nutrition */}
          <Card className="border-accent-border/30">
            <CardHeader><CardTitle className="text-base">🥗 Kunlik Nutrition</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 mb-4">
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

              {/* Meal plan */}
              {plan.nutrition?.meal_plan && (
                <div className="space-y-2 border-t border-border pt-3 mb-3">
                  <p className="text-xs font-mono text-muted uppercase">Ovqatlanish jadvali</p>
                  {Object.entries(plan.nutrition.meal_plan).map(([key, val]) => (
                    <div key={key} className="flex gap-2 text-sm">
                      <span className="text-accent font-mono text-xs w-24 shrink-0">
                        {key === "breakfast" ? "🌅 07-09" : key === "lunch" ? "☀️ 12-14" : key === "dinner" ? "🌙 18-20" : key === "pre_workout" ? "⚡ Oldin" : "💪 Keyin"}
                      </span>
                      <span className="text-muted">{val as string}</span>
                    </div>
                  ))}
                </div>
              )}

              {plan.nutrition?.uzbek_foods_suggested?.length > 0 && (
                <p className="text-sm text-muted">💡 {plan.nutrition.uzbek_foods_suggested.join(", ")}</p>
              )}
              {plan.nutrition?.avoid?.length > 0 && (
                <p className="text-sm text-vred/70 mt-1">🚫 {plan.nutrition.avoid.join(", ")}</p>
              )}
              {plan.nutrition?.water_liters && (
                <p className="text-sm text-vblue mt-1">💧 Suv: {plan.nutrition.water_liters} litr/kun</p>
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
                      {w.type} {w.duration_min > 0 ? `· ${w.duration_min}'` : ""}
                    </span>
                  </div>
                  {w.exercises?.length > 0 && (
                    <ul className="text-sm text-muted space-y-1">
                      {w.exercises.map((e: any, j: number) => (
                        <li key={j} className="flex justify-between">
                          <span>• {e.name} {e.notes ? <span className="text-xs text-muted/60">({e.notes})</span> : ""}</span>
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
          {(plan as any)?.motivation && (
            <Card className="border-accent-border/20 bg-accent/5">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-accent">💬 {(plan as any).motivation}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
