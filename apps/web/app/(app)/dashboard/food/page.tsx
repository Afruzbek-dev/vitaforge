"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">🥗 Ovqat Tracker</h1>
        <p className="text-muted text-sm font-mono mt-1">BUGUNGI KUZATUV</p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { l: "Kaloriya", v: Math.round(summary.total_calories) },
            { l: "Protein", v: `${Math.round(summary.total_protein)}g` },
            { l: "Karbo", v: `${Math.round(summary.total_carbs)}g` },
            { l: "Yog'", v: `${Math.round(summary.total_fat)}g` },
          ].map((s) => (
            <Card key={s.l} className="border-l-2 border-l-accent">
              <CardContent className="p-3 text-center">
                <p className="font-display font-bold text-xl text-accent">{s.v}</p>
                <p className="text-muted text-xs">{s.l}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Parse input */}
      <Card>
        <CardHeader><CardTitle className="text-base">Ovqat qo'shish</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && input.trim() && parse.mutate(input)}
              placeholder="Masalan: bir piyola osh, 2 ta tuxum..." />
            <Button onClick={() => input.trim() && parse.mutate(input)} disabled={parse.isPending}>
              {parse.isPending ? "..." : "Parse"}
            </Button>
          </div>
          {parse.data?.data && (
            <div className="bg-accent/5 border border-accent-border rounded-lg p-4 space-y-2">
              <p className="font-bold text-sm">{parse.data.data.food_name}</p>
              <p className="text-muted text-sm">
                {parse.data.data.calories} kkal · P:{parse.data.data.protein_g}g · K:{parse.data.data.carbs_g}g · Y:{parse.data.data.fat_g}g
              </p>
              <div className="flex gap-2 items-center">
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}
                  className="h-8 rounded-md border border-border bg-surface px-2 text-xs text-vtext">
                  <option value="breakfast">Nonushta</option>
                  <option value="lunch">Tushlik</option>
                  <option value="dinner">Kechki</option>
                  <option value="snack">Snack</option>
                </select>
                <Button size="sm" onClick={() => logFood.mutate({ ...parse.data.data, meal_type: mealType, raw_input: input, ai_parsed: true })}
                  disabled={logFood.isPending}>
                  {logFood.isPending ? "..." : "✓ Qo'shish"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log */}
      <Card>
        <CardHeader><CardTitle className="text-base">Bugungi ovqatlar</CardTitle></CardHeader>
        <CardContent>
          {logs.length === 0 ? <p className="text-muted text-sm">Hali hech narsa qo'shilmagan</p> : (
            <ul className="space-y-2">
              {logs.map((l: any) => (
                <li key={l.id} className="flex justify-between text-sm border-b border-border pb-2">
                  <span>{l.food_name} <span className="text-muted text-xs">({l.meal_type})</span></span>
                  <span className="text-accent font-mono">{l.calories} kkal</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
