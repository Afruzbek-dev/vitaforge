"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function PlanPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const generate = useMutation({ mutationFn: api.plans.generate, onSuccess: () => setTimeout(() => qc.invalidateQueries({ queryKey: ["plan"] }), 2000) });
  const plan = data?.data ?? data;

  if (isLoading) return <div className="animate-pulse text-gray-400 p-4">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📋 Haftalik Plan</h1>
        <button onClick={() => generate.mutate()} disabled={generate.isPending}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
          {generate.isPending ? "Yaratilmoqda..." : "🤖 Yangi plan"}
        </button>
      </div>

      {generate.isSuccess && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">✅ Plan tayyorlanmoqda...</div>}

      {plan && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-3">🥗 Kunlik Nutrition</h2>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: "Kaloriya", value: plan.nutrition?.daily_calories, unit: "kkal" },
                { label: "Protein", value: plan.nutrition?.protein_g, unit: "g" },
                { label: "Karbohidrat", value: plan.nutrition?.carbs_g, unit: "g" },
                { label: "Yog'", value: plan.nutrition?.fat_g, unit: "g" },
              ].map((n) => (
                <div key={n.label} className="bg-indigo-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-indigo-600">{n.value}</div>
                  <div className="text-xs text-gray-500">{n.label} ({n.unit})</div>
                </div>
              ))}
            </div>
            {plan.nutrition?.uzbek_foods_suggested?.length > 0 && (
              <p className="text-sm text-gray-500 mt-3">💡 Tavsiya: {plan.nutrition.uzbek_foods_suggested.join(", ")}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-3">💪 Mashg'ulotlar</h2>
            <div className="space-y-3">
              {plan.workouts?.map((w: any, i: number) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{w.day}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${w.type === "rest" ? "bg-gray-100 text-gray-500" : "bg-indigo-100 text-indigo-700"}`}>
                      {w.type} {w.duration_min > 0 ? `· ${w.duration_min} min` : ""}
                    </span>
                  </div>
                  {w.exercises?.length > 0 && (
                    <ul className="text-sm text-gray-600 space-y-0.5">
                      {w.exercises.map((e: any, j: number) => <li key={j}>• {e.name} — {e.sets}×{e.reps}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
