"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingService } from "@/lib/services/OnboardingService";
import { FitnessPlanService } from "@/lib/services/FitnessPlanService";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STEPS = ["Asosiy", "Jismoniy", "Maqsad"];

const GOALS = [
  { value: "weight_loss", label: "Vazn yo'qotish", icon: "📉" },
  { value: "muscle_gain", label: "Mushak olish", icon: "💪" },
  { value: "endurance", label: "Chidamlilik", icon: "🏃" },
  { value: "health", label: "Umumiy sog'liq", icon: "❤️" },
];

const ACTIVITY = [
  { value: "sedentary", label: "Kam harakatli" },
  { value: "light", label: "Engil faol" },
  { value: "moderate", label: "O'rtacha" },
  { value: "active", label: "Faol" },
  { value: "very_active", label: "Juda faol" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ age: "", gender: "male", height_cm: "", weight_kg: "", goal: "muscle_gain", activity_level: "moderate", medical_notes: "" });

  const f = (k: string) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const pct = ((step + 1) / STEPS.length) * 100;

  const submit = async () => {
    setLoading(true);
    try {
      await OnboardingService.saveProfile({ ...form, age: +form.age, height_cm: +form.height_cm, weight_kg: +form.weight_kg });
      setStep(3); // Wow moment screen
      try {
        await FitnessPlanService.generatePlan();
      } catch (e) {
        // even if it fails, proceed so user doesn't get stuck
      }
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    } catch { setLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto animate-fadeUp">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted font-mono mb-2">
          <span>QADAM {step + 1}/{STEPS.length}</span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Card className="border-accent-border/30">
        <CardHeader>
          <CardTitle>Profilingizni to'ldiring</CardTitle>
          <CardDescription>AI sizga shaxsiy plan yaratishi uchun</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Yosh</Label>
                  <Input type="number" value={form.age} onChange={f("age")} placeholder="25" />
                </div>
                <div className="space-y-2">
                  <Label>Jins</Label>
                  <select value={form.gender} onChange={f("gender")} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-vtext">
                    <option value="male">Erkak</option>
                    <option value="female">Ayol</option>
                  </select>
                </div>
              </div>
              <Button className="w-full" onClick={() => setStep(1)} disabled={!form.age}>Keyingi →</Button>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Bo'y (cm)</Label>
                  <Input type="number" value={form.height_cm} onChange={f("height_cm")} placeholder="178" />
                </div>
                <div className="space-y-2">
                  <Label>Vazn (kg)</Label>
                  <Input type="number" value={form.weight_kg} onChange={f("weight_kg")} placeholder="82" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Faollik darajasi</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY.map((a) => (
                    <button key={a.value} onClick={() => setForm((p) => ({ ...p, activity_level: a.value }))}
                      className={`p-2 rounded-lg border text-sm text-left transition-colors ${form.activity_level === a.value ? "border-accent bg-accent/5 text-accent" : "border-border text-muted hover:border-accent-border"}`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">← Orqaga</Button>
                <Button onClick={() => setStep(2)} disabled={!form.height_cm || !form.weight_kg} className="flex-1">Keyingi →</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Maqsadingiz</Label>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((g) => (
                    <button key={g.value} onClick={() => setForm((p) => ({ ...p, goal: g.value }))}
                      className={`p-3 rounded-lg border text-left transition-colors ${form.goal === g.value ? "border-accent bg-accent/5" : "border-border hover:border-accent-border"}`}>
                      <span className="text-lg">{g.icon}</span>
                      <p className={`text-sm mt-1 ${form.goal === g.value ? "text-accent font-medium" : "text-muted"}`}>{g.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tibbiy eslatmalar (ixtiyoriy)</Label>
                <Input value={form.medical_notes} onChange={f("medical_notes")} placeholder="Allergiya, jarohat..." />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">← Orqaga</Button>
                <Button onClick={submit} disabled={loading} className="flex-1">
                  {loading ? "Saqlanmoqda..." : "Boshlash 🚀"}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-fadeUp">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-accent text-3xl animate-bounce shadow-[0_0_15px_rgba(213,255,69,0.5)]">
                🧠
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-vtext">AI siz uchun ideal plan tuzmoqda...</h3>
                <p className="text-sm text-muted">Bunga bir necha soniya ketishi mumkin. Iltimos, kuting.</p>
              </div>
              <div className="w-full max-w-xs h-1.5 bg-surface2 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-accent rounded-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] blur-[1px]" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
