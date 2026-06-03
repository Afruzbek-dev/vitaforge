"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

export default function AnalyticsPage() {
  const { data: retention } = useQuery({ queryKey: ["gym", "retention"], queryFn: api.gym.retention });
  const { data: churn } = useQuery({ queryKey: ["gym", "churn"], queryFn: api.gym.churnRisk });
  const sb = getSupabase();

  // Weekly activity data
  const { data: weeklyData } = useQuery({
    queryKey: ["gym", "weekly-activity"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data } = await sb.from("attendance").select("checked_in_at").eq("gym_id", me?.gym_id).gte("checked_in_at", weekAgo);
      // Count per day
      const counts = [0, 0, 0, 0, 0, 0, 0];
      (data ?? []).forEach((a) => { const d = new Date(a.checked_in_at).getDay(); counts[d === 0 ? 6 : d - 1]++; });
      return counts;
    },
  });

  // Goal distribution
  const { data: goalDist } = useQuery({
    queryKey: ["gym", "goal-distribution"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data: members } = await sb.from("users").select("id").eq("gym_id", me?.gym_id).eq("role", "member");
      const ids = (members ?? []).map((m) => m.id);
      if (!ids.length) return [];
      const { data: profiles } = await sb.from("member_profiles").select("goal").in("user_id", ids);
      const dist: Record<string, number> = {};
      (profiles ?? []).forEach((p) => { dist[p.goal ?? "noaniq"] = (dist[p.goal ?? "noaniq"] ?? 0) + 1; });
      return Object.entries(dist).map(([goal, count]) => ({ goal, count }));
    },
  });

  const r = retention?.data;
  const atRisk = churn?.data?.at_risk_members ?? [];
  const weekly = weeklyData ?? [0, 0, 0, 0, 0, 0, 0];
  const maxWeekly = Math.max(...weekly, 1);

  const GOAL_LABELS: Record<string, { label: string; color: string }> = {
    weight_loss: { label: "Vazn yo'qotish", color: "#ff5252" },
    muscle_gain: { label: "Mushak olish", color: "#e8ff47" },
    endurance: { label: "Chidamlilik", color: "#5299ff" },
    health: { label: "Sog'liq", color: "#4dffb4" },
    noaniq: { label: "Noaniq", color: "#52526a" },
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">📊 Analitika</h1>
        <p className="text-muted text-sm font-mono mt-1">HAFTALIK KO'RSATKICHLAR</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "JAMI", v: r?.total_members ?? 0, c: "text-vtext" },
          { l: "FAOL", v: r?.active_last_30_days ?? 0, c: "text-vgreen" },
          { l: "RETENTION", v: r?.retention_rate ? `${r.retention_rate}%` : "—", c: "text-accent" },
          { l: "XAVF", v: atRisk.length, c: "text-vred" },
        ].map((k) => (
          <Card key={k.l}>
            <CardContent className="p-4 text-center">
              <p className={`font-display font-bold text-2xl ${k.c}`}>{k.v}</p>
              <p className="text-muted text-xs font-mono mt-1">{k.l}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Activity Bar Chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Haftalik faollik</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {weekly.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-accent font-mono">{v || ""}</span>
                <div className="w-full rounded-t-sm transition-all" style={{ height: `${(v / maxWeekly) * 100}%`, minHeight: v > 0 ? 8 : 2, background: i === new Date().getDay() - 1 ? "#e8ff47" : "#1e1e2c" }} />
                <span className="text-muted text-xs font-mono">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goal Distribution */}
      <Card>
        <CardHeader><CardTitle className="text-base">Maqsad taqsimoti</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(goalDist ?? []).map((item: any) => {
            const info = GOAL_LABELS[item.goal] ?? GOAL_LABELS.noaniq;
            const total = (goalDist ?? []).reduce((a: number, b: any) => a + b.count, 0);
            const pct = total ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.goal} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-vtext">{info.label}</span>
                  <span className="text-muted font-mono">{item.count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: info.color }} />
                </div>
              </div>
            );
          })}
          {(!goalDist || goalDist.length === 0) && <p className="text-muted text-sm">Ma'lumot yo'q</p>}
        </CardContent>
      </Card>

      {/* Retention trend */}
      <Card>
        <CardHeader><CardTitle className="text-base">Retention</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${r?.retention_rate ?? 0}%` }} />
              </div>
            </div>
            <span className="font-display font-bold text-2xl text-accent">{r?.retention_rate ?? 0}%</span>
          </div>
          <div className="flex justify-between text-xs text-muted mt-2">
            <span>Faol: {r?.active_last_30_days ?? 0}</span>
            <span>Faolsiz: {(r?.total_members ?? 0) - (r?.active_last_30_days ?? 0)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
