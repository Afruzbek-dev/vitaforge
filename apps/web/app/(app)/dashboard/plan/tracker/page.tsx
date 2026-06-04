"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

export default function TrackerPage() {
  const { data } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const plan = data?.data ?? data;
  const [completed, setCompleted] = useState<Record<string, Set<number>>>({});
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay();
    return DAYS[d === 0 ? 6 : d - 1];
  });

  const toggle = (day: string, idx: number) => {
    setCompleted((prev) => {
      const s = new Set(prev[day] ?? []);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return { ...prev, [day]: s };
    });
  };

  if (!plan) return (
    <div className="max-w-3xl animate-fadeUp">
      <h1 className="font-display font-bold text-2xl text-vtext mb-4">📅 Haftalik Tracker</h1>
      <Card><CardContent className="p-8 text-center"><p className="text-muted">Avval plan yarating</p><Link href="/dashboard/plan"><Button className="mt-3">Plan yaratish</Button></Link></CardContent></Card>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">📅 Haftalik Tracker</h1>
          <p className="text-muted text-sm font-mono mt-1">HAFTA {plan.week_number}</p>
        </div>
        <Link href="/dashboard/plan"><Button variant="outline" size="sm">Plan →</Button></Link>
      </div>

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {DAYS.map((day) => {
          const workout = plan.workouts?.find((w: any) => w.day === day);
          const total = workout?.exercises?.length ?? 0;
          const done = completed[day]?.size ?? 0;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const isToday = day === selectedDay;
          return (
            <button key={day} onClick={() => setSelectedDay(day)}
              className={`shrink-0 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${isToday ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:border-accent-border"}`}>
              <p className="font-bold">{day.slice(0, 2)}</p>
              {total > 0 && <p className="mt-0.5">{pct}%</p>}
              {!workout || workout.type === "rest" ? <p className="mt-0.5 text-muted">dam</p> : null}
            </button>
          );
        })}
      </div>

      {/* Selected day workout */}
      {(() => {
        const workout = plan.workouts?.find((w: any) => w.day === selectedDay);
        if (!workout || workout.type === "rest") return (
          <Card><CardContent className="p-6 text-center"><p className="text-2xl mb-2">😴</p><p className="text-muted text-sm">Dam olish kuni</p></CardContent></Card>
        );
        const total = workout.exercises?.length ?? 0;
        const done = completed[selectedDay]?.size ?? 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <Card className="border-accent-border/30">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{selectedDay} · {workout.type} · {workout.duration_min}'</CardTitle>
                <span className="text-accent font-mono text-sm font-bold">{pct}%</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-border rounded-full overflow-hidden mt-2">
                <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {workout.exercises?.map((ex: any, i: number) => {
                const isDone = completed[selectedDay]?.has(i);
                return (
                  <button key={i} onClick={() => toggle(selectedDay, i)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${isDone ? "border-vgreen/40 bg-vgreen/5" : "border-border hover:border-accent-border/40"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${isDone ? "bg-vgreen text-bg" : "bg-surface text-muted"}`}>
                        {isDone ? "✓" : i + 1}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isDone ? "text-vgreen line-through" : "text-vtext"}`}>{ex.name}</p>
                        {ex.notes && <p className="text-xs text-muted">{ex.notes}</p>}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-accent">{ex.sets}×{ex.reps}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        );
      })()}

      {/* Weekly overview */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Haftalik umumiy progress</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day) => {
              const workout = plan.workouts?.find((w: any) => w.day === day);
              const total = workout?.exercises?.length ?? 0;
              const done = completed[day]?.size ?? 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : -1;
              return (
                <div key={day} className="text-center">
                  <p className="text-xs text-muted font-mono mb-1">{day.slice(0, 2)}</p>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${pct === 100 ? "bg-vgreen text-bg" : pct > 0 ? "bg-accent/20 text-accent" : pct === -1 ? "bg-surface text-muted" : "bg-border text-muted"}`}>
                    {pct === -1 ? "—" : `${pct}%`}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
