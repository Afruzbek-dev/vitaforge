"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function FoodPage() {
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const today = new Date().toISOString().split("T")[0];

  const { data: logData } = useQuery({ queryKey: ["food", "log"], queryFn: () => api.food.getLog(today) });
  const { data: summaryData } = useQuery({ queryKey: ["food", "summary"], queryFn: () => api.food.summary() });
  const parse = useMutation({ mutationFn: (text: string) => api.food.parse(text) });
  const logFood = useMutation({
    mutationFn: api.food.log,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["food"] }); setInput(""); parse.reset(); },
  });

  const logs = logData?.data ?? [];
  const summary = summaryData?.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🥗 Ovqat Tracker</h1>

      {summary && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Kaloriya", value: Math.round(summary.total_calories) },
            { label: "Protein", value: `${Math.round(summary.total_protein)}g` },
            { label: "Karbohidrat", value: `${Math.round(summary.total_carbs)}g` },
            { label: "Yog'", value: `${Math.round(summary.total_fat)}g` },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-xl font-bold text-indigo-600">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="font-semibold">Ovqat qo'shish</h2>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && input.trim() && parse.mutate(input)}
            placeholder="Masalan: bir piyola osh, 2 ta tuxum..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={() => input.trim() && parse.mutate(input)} disabled={parse.isPending}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
            {parse.isPending ? "..." : "Parse"}
          </button>
        </div>
        {parse.data?.data && (
          <div className="bg-indigo-50 rounded-lg p-3 text-sm space-y-2">
            <p className="font-medium">{parse.data.data.food_name}</p>
            <p className="text-gray-600">{parse.data.data.calories} kkal · P:{parse.data.data.protein_g}g · K:{parse.data.data.carbs_g}g · Y:{parse.data.data.fat_g}g</p>
            <div className="flex gap-2 items-center">
              <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="border rounded px-2 py-1 text-xs">
                <option value="breakfast">Nonushta</option>
                <option value="lunch">Tushlik</option>
                <option value="dinner">Kechki ovqat</option>
                <option value="snack">Snack</option>
              </select>
              <button onClick={() => logFood.mutate({ ...parse.data.data, meal_type: mealType, raw_input: input, ai_parsed: true })}
                disabled={logFood.isPending}
                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50">
                {logFood.isPending ? "..." : "✓ Qo'shish"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Bugungi ovqatlar</h2>
        {logs.length === 0 ? <p className="text-gray-400 text-sm">Hali hech narsa qo'shilmagan</p> : (
          <ul className="space-y-2">
            {logs.map((l: any) => (
              <li key={l.id} className="flex justify-between text-sm border-b pb-2">
                <span>{l.food_name} <span className="text-gray-400 text-xs">({l.meal_type})</span></span>
                <span className="text-gray-600">{l.calories} kkal</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
