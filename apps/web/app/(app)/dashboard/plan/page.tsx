"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { generatePlan } from "@/lib/ai";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Progress Ring Component ─────────────────────────────
function ProgressRing({ value, max, size = 120, color = "var(--accent)", label }: { value: number; max: number; size?: number; color?: string; label: string }) {
  const pct = Math.min(value / max, 1);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="progress-ring">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="font-display font-bold text-lg text-vtext">{value}</span>
        <span className="text-[10px] text-muted">/{max}</span>
      </div>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

// ─── Macro Bar ───────────────────────────────────────────
function MacroBar({ label, value, max, color, unit = "g" }: { label: string; value: number; max: number; color: string; unit?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="text-vtext font-mono">{value}/{max}{unit}</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Questions (same as before, abbreviated) ─────────────
const QUESTIONS = [
  { id: "basics", title: "👤 Shaxsiy", fields: [
    { key: "age", label: "Yosh", type: "number", placeholder: "25" },
    { key: "gender", label: "Jins", type: "select", options: [{ v: "male", l: "Erkak" }, { v: "female", l: "Ayol" }] },
    { key: "height_cm", label: "Bo'y (cm)", type: "number", placeholder: "178" },
    { key: "weight_kg", label: "Vazn (kg)", type: "number", placeholder: "82" },
    { key: "job_type", label: "Kasbi", type: "select", options: [{ v: "office", l: "O'troq" }, { v: "moderate", l: "O'rtacha" }, { v: "physical", l: "Jismoniy" }] },
  ]},
  { id: "goal", title: "🎯 Maqsad", fields: [
    { key: "goal", label: "Maqsad", type: "select", options: [{ v: "weight_loss", l: "Ozish" }, { v: "muscle_gain", l: "Mushak" }, { v: "endurance", l: "Chidamlilik" }, { v: "health", l: "Sog'lom" }] },
    { key: "experience", label: "Tajriba", type: "select", options: [{ v: "beginner", l: "Boshlang'ich" }, { v: "intermediate", l: "O'rtacha" }, { v: "advanced", l: "Tajribali" }] },
    { key: "workout_days", label: "Hafta/kun", type: "select", options: [{ v: "3", l: "3" }, { v: "4", l: "4" }, { v: "5", l: "5" }, { v: "6", l: "6" }] },
  ]},
  { id: "nutrition", title: "🥗 Ovqat", fields: [
    { key: "meals_per_day", label: "Ovqat/kun", type: "select", options: [{ v: "3", l: "3" }, { v: "4", l: "4" }, { v: "5", l: "5+" }] },
    { key: "activity_level", label: "Faollik", type: "select", options: [{ v: "sedentary", l: "Kam" }, { v: "light", l: "Engil" }, { v: "moderate", l: "O'rtacha" }, { v: "active", l: "Faol" }] },
    { key: "allergies", label: "Allergiya", type: "text", placeholder: "Yo'q / laktoza..." },
  ]},
];

export default function PlanPage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const [mode, setMode] = useState<"view" | "questions" | "generating" | "addFood">("view");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [todayFood, setTodayFood] = useState<any[]>([]);
  const [foodInput, setFoodInput] = useState("");
  const [addingFood, setAddingFood] = useState(false);
  const [weekProgress, setWeekProgress] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const plan = data?.data ?? data;

  // Load today's food logs
  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u) return;
      const today = new Date().toISOString().split("T")[0];
      const { data: logs } = await sb.from("food_logs").select("*").eq("member_id", u.id).gte("created_at", today + "T00:00:00").order("created_at", { ascending: false });
      setTodayFood(logs ?? []);
      // Week progress (last 7 days calorie totals)
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      const { data: weekLogs } = await sb.from("food_logs").select("calories, created_at").eq("member_id", u.id).gte("created_at", weekAgo + "T00:00:00");
      if (weekLogs) {
        const daily: Record<string, number> = {};
        weekLogs.forEach((l: any) => { const d = l.created_at.split("T")[0]; daily[d] = (daily[d] ?? 0) + (l.calories ?? 0); });
        const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().split("T")[0]; return daily[d] ?? 0; });
        setWeekProgress(last7);
      }
    })();
  }, [mode]);

  const todayCal = todayFood.reduce((s, f) => s + (f.calories ?? 0), 0);
  const todayProtein = todayFood.reduce((s, f) => s + (f.protein ?? 0), 0);
  const todayCarbs = todayFood.reduce((s, f) => s + (f.carbs ?? 0), 0);
  const todayFat = todayFood.reduce((s, f) => s + (f.fat ?? 0), 0);
  const targetCal = plan?.nutrition?.daily_calories ?? 2200;
  const targetProtein = plan?.nutrition?.protein_g ?? 150;
  const targetCarbs = plan?.nutrition?.carbs_g ?? 250;
  const targetFat = plan?.nutrition?.fat_g ?? 70;

  const addFood = async () => {
    if (!foodInput.trim()) return;
    setAddingFood(true);
    const u = await getUser();
    if (!u) { setAddingFood(false); return; }
    // Simple AI food estimation via edge — fallback to manual
    let cal = 300, pro = 20, carb = 40, fat = 10;
    try {
      const res = await fetch("/api/telegram", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "estimate_food", food: foodInput }) });
      const d = await res.json();
      if (d.calories) { cal = d.calories; pro = d.protein ?? 20; carb = d.carbs ?? 40; fat = d.fat ?? 10; }
    } catch {}
    await sb.from("food_logs").insert({ member_id: u.id, food_name: foodInput, calories: cal, protein: pro, carbs: carb, fat: fat });
    setTodayFood((p) => [{ food_name: foodInput, calories: cal, protein: pro, carbs: carb, fat: fat }, ...p]);
    setFoodInput("");
    setAddingFood(false);
    setMode("view");
  };

  const updateField = (key: string, value: string) => setAnswers((p) => ({ ...p, [key]: value }));
  const currentQ = QUESTIONS[step];

  const generate = async () => {
    setMode("generating");
    setError(null);
    try {
      const user = await getUser();
      const result = await generatePlan({ age: +(answers.age || 25), gender: answers.gender || "male", height_cm: +(answers.height_cm || 175), weight_kg: +(answers.weight_kg || 80), goal: answers.goal || "muscle_gain", activity_level: answers.activity_level || "moderate", ...answers } as any);
      if (!result) { setError("AI javob bermadi"); setMode("questions"); return; }
      const now = new Date();
      const week = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000);
      await sb.from("fitness_plans").update({ is_active: false }).eq("member_id", user!.id).eq("is_active", true);
      await sb.from("fitness_plans").insert({ member_id: user!.id, generated_by: "ai", week_number: week, starts_at: now.toISOString().split("T")[0], ends_at: new Date(now.getTime() + 6 * 86400000).toISOString().split("T")[0], workouts: result.workouts ?? [], nutrition: result.nutrition ?? {}, ai_model: "llama-3.3-70b-versatile", ai_prompt_version: "v2.0", is_active: true, notes: JSON.stringify(answers) });
      qc.invalidateQueries({ queryKey: ["plan"] });
      setMode("view");
    } catch (e) { setError("Xatolik: " + (e as any)?.message); setMode("questions"); }
  };

  // ─── QUESTIONS ─────────────────────────────────────────
  if (mode === "questions") return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeUp">
      <div className="flex justify-between text-xs text-muted font-mono mb-2">
        <span>{step + 1}/{QUESTIONS.length}</span>
        <span>{currentQ.title}</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
      </div>
      {error && (
        <div className="bg-vred/10 border border-vred/20 text-vred rounded-xl p-4 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}
      <Card className="border-accent-border/30">
        <CardHeader><CardTitle className="text-lg">{currentQ.title}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {currentQ.fields.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              {(f.type === "number" || f.type === "text") && <Input type={f.type === "number" ? "number" : "text"} value={answers[f.key] ?? ""} onChange={(e) => updateField(f.key, e.target.value)} placeholder={f.placeholder} className="min-h-[44px]" />}
              {f.type === "select" && (
                <div className="grid grid-cols-2 gap-2">
                  {f.options!.map((opt) => (
                    <button key={opt.v} onClick={() => updateField(f.key, opt.v)} className={`p-2.5 rounded-lg border text-sm min-h-[44px] press ${answers[f.key] === opt.v ? "border-accent bg-accent/5 text-accent" : "border-border text-muted"}`}>{opt.l}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1 min-h-[44px]">← Orqaga</Button>}
            {step < QUESTIONS.length - 1 ? <Button onClick={() => setStep(step + 1)} className="flex-1 min-h-[44px]">Keyingi →</Button> : <Button onClick={generate} className="flex-1 min-h-[44px]">🤖 AI Plan</Button>}
          </div>
        </CardContent>
      </Card>
      <Button variant="ghost" onClick={() => setMode("view")} className="w-full min-h-[44px] text-muted">Bekor</Button>
    </div>
  );

  if (mode === "generating") return (
    <div className="max-w-md mx-auto text-center py-20 animate-fadeUp">
      <div className="flex justify-center gap-2 mb-6">
        {[0, 1, 2, 3].map((i) => <div key={i} className="w-3 h-3 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}
      </div>
      <h2 className="font-display font-bold text-xl text-vtext mb-2">AI plan yaratmoqda...</h2>
      <p className="text-muted text-sm">BMR → TDEE → Makro → Mashq → Ratsion</p>
    </div>
  );

  // ─── ADD FOOD ──────────────────────────────────────────
  if (mode === "addFood") return (
    <div className="max-w-md mx-auto space-y-4 animate-fadeUp">
      <h2 className="font-display font-bold text-xl text-vtext">🍽️ Ovqat qo'shish</h2>
      <p className="text-muted text-xs">AI ovqatni tanib, kaloriya/makro hisoblaydi</p>
      <Input value={foodInput} onChange={(e) => setFoodInput(e.target.value)} placeholder="Masalan: osh 1 porsiya, non, salat..." className="min-h-[44px]" />
      <div className="flex gap-2">
        <Button onClick={addFood} disabled={addingFood || !foodInput.trim()} className="flex-1 min-h-[44px]">{addingFood ? "⏳ Hisoblanmoqda..." : "➕ Qo'shish"}</Button>
        <Button variant="secondary" onClick={() => setMode("view")} className="min-h-[44px]">Bekor</Button>
      </div>
    </div>
  );

  // ─── VIEW MODE ─────────────────────────────────────────
  if (isLoading) return <div className="text-muted animate-pulse p-4">Yuklanmoqda...</div>;

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">📋 Plan & Kaloriya</h1>
          <p className="text-muted text-sm font-mono mt-1">KUNLIK TRACKER</p>
        </div>
        <Button onClick={() => { setStep(0); setError(null); setMode("questions"); }} className="min-h-[44px]">🤖 Yangi plan</Button>
      </div>

      {/* Calorie Progress Ring + Macros */}
      <Card className="border-accent-border/30">
        <CardContent className="p-5">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="relative">
              <ProgressRing value={todayCal} max={targetCal} size={130} label="kkal" />
            </div>
            <div className="flex-1 min-w-[180px] space-y-3">
              <MacroBar label="🥩 Protein" value={todayProtein} max={targetProtein} color="var(--blue)" />
              <MacroBar label="🍚 Karbohidrat" value={todayCarbs} max={targetCarbs} color="var(--accent)" />
              <MacroBar label="🥑 Yog'" value={todayFat} max={targetFat} color="var(--green)" />
            </div>
          </div>
          <Button onClick={() => setMode("addFood")} className="w-full mt-4 min-h-[44px]">🍽️ Ovqat qo'shish (AI)</Button>
        </CardContent>
      </Card>

      {/* Today's food log */}
      {todayFood.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">📝 Bugungi ovqatlar</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {todayFood.slice(0, 5).map((f, i) => (
              <div key={i} className="flex justify-between items-center bg-bg rounded-lg p-3 text-sm">
                <span className="text-vtext">{f.food_name}</span>
                <span className="text-muted font-mono text-xs">{f.calories} kkal</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weekly progress chart (simple bar) */}
      {weekProgress.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">📊 Haftalik kaloriya</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-24">
              {weekProgress.map((v, i) => {
                const h = targetCal > 0 ? Math.min((v / targetCal) * 100, 100) : 0;
                const day = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"][(new Date(Date.now() - (6 - i) * 86400000).getDay() + 6) % 7];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t" style={{ height: `${h}%`, background: v >= targetCal * 0.8 ? "var(--accent)" : "var(--border)", minHeight: v > 0 ? "4px" : "0" }} />
                    <span className="text-[9px] text-muted">{day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-muted mt-2">
              <span>Maqsad: {targetCal} kkal/kun</span>
              <span className="text-accent">{weekProgress.filter((v) => v >= targetCal * 0.8).length}/7 kun ✓</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Workout Plan */}
      {plan?.workouts?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">💪 Haftalik mashg'ulot</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {plan.workouts.map((w: any, i: number) => (
              <div key={i} className="border border-border rounded-lg p-3 card-hover">
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-sm text-vtext">{w.day}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${w.type === "rest" ? "bg-surface text-muted" : "bg-accent/10 text-accent border border-accent-border"}`}>
                    {w.type}{w.duration_min > 0 ? ` · ${w.duration_min}'` : ""}
                  </span>
                </div>
                {w.exercises?.length > 0 && (
                  <ul className="mt-2 text-sm text-muted space-y-1">
                    {w.exercises.slice(0, 4).map((e: any, j: number) => (
                      <li key={j} className="flex justify-between"><span>• {e.name}</span><span className="text-accent font-mono text-xs">{e.sets}×{e.reps}</span></li>
                    ))}
                    {w.exercises.length > 4 && <li className="text-xs text-muted">+{w.exercises.length - 4} ta mashq</li>}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No plan state */}
      {!plan && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-muted text-sm mb-4">AI sizga shaxsiy plan yaratadi — 3 ta savol, 30 soniya</p>
            <Button onClick={() => { setStep(0); setError(null); setMode("questions"); }} className="min-h-[44px]">Boshlash →</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
