"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ age: "", gender: "male", height_cm: "", weight_kg: "", goal: "muscle_gain", activity_level: "moderate" });

  const submit = async () => {
    setLoading(true);
    await api.onboarding.saveProfile({ ...form, age: +form.age, height_cm: +form.height_cm, weight_kg: +form.weight_kg });
    router.push("/dashboard");
  };

  const f = (k: string) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Profilingizni to'ldiring</h2>
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Yosh</label>
            <input type="number" value={form.age} onChange={f("age")} className="w-full border rounded-lg px-3 py-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Jins</label>
            <select value={form.gender} onChange={f("gender")} className="w-full border rounded-lg px-3 py-2">
              <option value="male">Erkak</option><option value="female">Ayol</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Bo'y (cm)</label>
            <input type="number" value={form.height_cm} onChange={f("height_cm")} className="w-full border rounded-lg px-3 py-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Vazn (kg)</label>
            <input type="number" value={form.weight_kg} onChange={f("weight_kg")} className="w-full border rounded-lg px-3 py-2" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Maqsad</label>
          <select value={form.goal} onChange={f("goal")} className="w-full border rounded-lg px-3 py-2">
            <option value="weight_loss">Vazn yo'qotish</option><option value="muscle_gain">Mushak olish</option>
            <option value="endurance">Chidamlilik</option><option value="health">Umumiy sog'liq</option>
          </select></div>
        <div><label className="block text-sm font-medium mb-1">Faollik darajasi</label>
          <select value={form.activity_level} onChange={f("activity_level")} className="w-full border rounded-lg px-3 py-2">
            <option value="sedentary">Kam harakatli</option><option value="light">Engil faol</option>
            <option value="moderate">O'rtacha faol</option><option value="active">Faol</option>
            <option value="very_active">Juda faol</option>
          </select></div>
        <button onClick={submit} disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Saqlanmoqda..." : "Davom etish →"}
        </button>
      </div>
    </div>
  );
}
