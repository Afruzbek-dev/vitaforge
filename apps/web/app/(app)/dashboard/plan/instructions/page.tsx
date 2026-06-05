"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { chatWithAI } from "@/lib/ai";

export default function InstructionsPage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const [generating, setGenerating] = useState<string | null>(null);

  const { data: planData } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const plan = planData?.data ?? planData;

  const { data: instructions } = useQuery({
    queryKey: ["plan-instructions", plan?.id],
    queryFn: async () => {
      if (!plan?.id) return [];
      const { data } = await sb.from("plan_instructions").select("*").eq("plan_id", plan.id).order("day").order("exercise_index");
      return data ?? [];
    },
    enabled: !!plan?.id,
  });

  const generateInstruction = async (day: string, exIdx: number, exName: string) => {
    setGenerating(`${day}-${exIdx}`);
    const user = await getUser();
    const response = await chatWithAI([{ role: "user", content: `"${exName}" mashqini qanday to'g'ri bajarish kerak? Qisqa, aniq texnik ko'rsatma ber. 3-4 qadam. O'zbek tilida.` }]);
    await sb.from("plan_instructions").upsert({
      plan_id: plan.id, day, exercise_index: exIdx,
      instruction_type: "ai_generated", content: response,
      created_by: user!.id, ai_generated: true,
    }, { onConflict: "plan_id,day,exercise_index" });
    qc.invalidateQueries({ queryKey: ["plan-instructions"] });
    setGenerating(null);
  };

  const getInstruction = (day: string, idx: number) =>
    (instructions ?? []).find((i: any) => i.day === day && i.exercise_index === idx);

  if (!plan) return (
    <div className="max-w-3xl animate-fadeUp">
      <h1 className="font-display font-bold text-2xl text-vtext mb-4">📖 Mashq Ko'rsatmalari</h1>
      <Card><CardContent className="p-8 text-center text-muted text-sm">Avval plan yarating</CardContent></Card>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">📖 Mashq Ko'rsatmalari</h1>
        <p className="text-muted text-xs font-mono mt-1">HAR BIR MASHQ UCHUN TEXNIK YO'RIQNOMA</p>
      </div>

      {plan.workouts?.filter((w: any) => w.type !== "rest").map((w: any) => (
        <Card key={w.day}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{w.day} · {w.type}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {w.exercises?.map((ex: any, idx: number) => {
              const instr = getInstruction(w.day, idx);
              const isGenerating = generating === `${w.day}-${idx}`;
              return (
                <div key={idx} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-vtext">{ex.name}</span>
                    <span className="text-xs font-mono text-accent">{ex.sets}×{ex.reps}</span>
                  </div>
                  {instr ? (
                    <div className="bg-accent/5 border border-accent-border/30 rounded-md p-2.5 mt-2">
                      <p className="text-xs text-muted whitespace-pre-wrap">{instr.content}</p>
                      <p className="text-[9px] text-accent font-mono mt-1">{instr.ai_generated ? "🤖 AI" : "✍️ Manual"}</p>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="mt-2 text-xs"
                      onClick={() => generateInstruction(w.day, idx, ex.name)} disabled={isGenerating}>
                      {isGenerating ? "AI yozmoqda..." : "🤖 Ko'rsatma yaratish"}
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
