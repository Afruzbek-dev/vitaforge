"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { generatePlan } from "@/lib/ai";

const GOALS = [
  { value: "weight_loss", label: "Vazn yo'qotish", icon: "📉", desc: "Ortiqcha kg dan xalos bo'lish" },
  { value: "muscle_gain", label: "Mushak olish", icon: "💪", desc: "Kuch va massa oshirish" },
  { value: "endurance", label: "Chidamlilik", icon: "🏃", desc: "Stamina va energiya" },
  { value: "health", label: "Sog'lom turmush", icon: "❤️", desc: "Umumiy yaxshi his qilish" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const sb = getSupabase();
  const [step, setStep] = useState(0); // 0: goal, 1: weight, 2: generating
  const [goal, setGoal] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    setStep(2);
    setLoading(true);
    const user = await getUser();
    if (!user) return;

    // Save minimal profile
    const { data: existing } = await sb.from("member_profiles").select("id").eq("user_id", user.id).single();
    const profileData = { goal, weight_kg: parseFloat(weight), age: 25, gender: "male", height_cm: 175, activity_level: "moderate", onboarding_done: true };
    if (existing) await sb.from("member_profiles").update(profileData).eq("user_id", user.id);
    else await sb.from("member_profiles").insert({ ...profileData, user_id: user.id });

    // Generate AI plan instantly
    try {
      const plan = await generatePlan({ age: 25, gender: "male", height_cm: 175, weight_kg: parseFloat(weight), goal, activity_level: "moderate" });
      if (plan) {
        const now = new Date();
        const week = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000);
        await sb.from("fitness_plans").insert({
          member_id: user.id, generated_by: "ai", week_number: week,
          starts_at: now.toISOString().split("T")[0],
          ends_at: new Date(now.getTime() + 6 * 86400000).toISOString().split("T")[0],
          workouts: plan.workouts ?? [], nutrition: plan.nutrition ?? {},
          ai_model: "llama-3.3-70b", is_active: true,
        });
      }
    } catch {}

    // Create streak record
    await sb.from("member_streaks").upsert({ member_id: user.id, current_streak: 0, longest_streak: 0, total_points: 0 }, { onConflict: "member_id" });

    router.push("/dashboard");
  };

  // Step 2: Generating
  if (step === 2) return (
    <div className="max-w-md mx-auto text-center py-20 animate-fadeUp">
      <div className="flex justify-center gap-2 mb-6">
        {[0, 1, 2, 3].map((i) => <div key={i} className="w-3 h-3 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}
      </div>
      <h2 className="font-display font-bold text-2xl text-vtext mb-3">AI plan tayyorlayapti...</h2>
      <p className="text-muted text-sm">Sizga mos shaxsiy dastur yaratilmoqda</p>
      <p className="text-accent text-xs font-mono mt-4">⚡ 10 soniya...</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto animate-fadeUp">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        <div className={`h-1 flex-1 rounded-full ${step >= 0 ? "bg-accent" : "bg-border"}`} />
        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-accent" : "bg-border"}`} />
      </div>

      {/* Step 0: Goal */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-vtext mb-2">Maqsadingiz nima?</h1>
            <p className="text-muted text-sm">Bitta tanlang — AI shunga mos plan yaratadi</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((g) => (
              <button key={g.value} onClick={() => { setGoal(g.value); setStep(1); }}
                className="p-4 rounded-xl border border-border text-left transition-all hover:border-accent hover:bg-accent/5 active:scale-95">
                <span className="text-2xl">{g.icon}</span>
                <p className="font-display font-bold text-sm mt-2 text-vtext">{g.label}</p>
                <p className="text-muted text-xs mt-0.5">{g.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Weight */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-vtext mb-2">Vaznigiz qancha?</h1>
            <p className="text-muted text-sm">AI aniq kaloriya hisoblashi uchun</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-baseline gap-2">
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="80"
                className="w-24 text-center text-2xl font-display font-bold h-14" autoFocus />
              <span className="text-muted text-lg">kg</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">← Orqaga</Button>
            <Button onClick={finish} disabled={!weight || loading} className="flex-1">
              🤖 Plan olish →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
