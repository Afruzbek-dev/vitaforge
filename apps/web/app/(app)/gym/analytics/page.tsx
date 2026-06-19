"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import Link from "next/link";

const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

export default function AnalyticsPage() {
  const sb = getSupabase();

  const { data } = useQuery({
    queryKey: ["gym-analytics-full"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const gid = me?.gym_id;
      if (!gid) return null;

      const { count: total } = await sb.from("users").select("*", { count: "exact", head: true }).eq("gym_id", gid).eq("role", "member");
      const ago30 = new Date(Date.now() - 30 * 86400000).toISOString();
      const ago7 = new Date(Date.now() - 7 * 86400000).toISOString();
      const today = new Date().toISOString().split("T")[0];

      // Active 30d
      const { data: att30 } = await sb.from("attendance").select("member_id").eq("gym_id", gid).gte("checked_in_at", ago30);
      const active30 = new Set(att30?.map((a) => a.member_id)).size;
      const retention = (total ?? 0) > 0 ? Math.round((active30 / (total ?? 1)) * 100) : 0;

      // Today
      const { count: todayCount } = await sb.from("attendance").select("*", { count: "exact", head: true }).eq("gym_id", gid).gte("checked_in_at", `${today}T00:00:00`);
      const dau = (total ?? 0) > 0 ? Math.round(((todayCount ?? 0) / (total ?? 1)) * 100) : 0;

      // Churn risk (7+ days no show)
      const { data: att7 } = await sb.from("attendance").select("member_id").eq("gym_id", gid).gte("checked_in_at", ago7);
      const active7 = new Set(att7?.map((a) => a.member_id));
      const { data: allMembers } = await sb.from("users").select("id, full_name, created_at").eq("gym_id", gid).eq("role", "member");
      const { data: streaks } = await sb.from("member_streaks").select("member_id, current_streak, total_points, last_activity").in("member_id", (allMembers ?? []).map((m) => m.id));
      const streakMap = Object.fromEntries((streaks ?? []).map((s) => [s.member_id, s]));

      const atRisk = (allMembers ?? []).filter((m) => !active7.has(m.id)).map((m) => {
        const s = streakMap[m.id];
        const daysAgo = s?.last_activity ? Math.floor((Date.now() - new Date(s.last_activity).getTime()) / 86400000) : 99;
        return { ...m, days_ago: daysAgo };
      }).sort((a, b) => b.days_ago - a.days_ago).slice(0, 5);

      // Weekly activity (7 days)
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      const { data: weekAtt } = await sb.from("attendance").select("checked_in_at").eq("gym_id", gid).gte("checked_in_at", weekAgo.toISOString());
      const weekCounts = [0, 0, 0, 0, 0, 0, 0];
      for (const a of weekAtt ?? []) {
        const d = new Date(a.checked_in_at).getDay();
        weekCounts[d === 0 ? 6 : d - 1]++;
      }
      const maxWeek = Math.max(...weekCounts, 1);

      // Top members
      const top = (allMembers ?? []).map((m) => ({ ...m, ...(streakMap[m.id] ?? { current_streak: 0, total_points: 0 }) }))
        .sort((a, b) => (b.total_points ?? 0) - (a.total_points ?? 0)).slice(0, 4);

      // New this month
      const newThisMonth = (allMembers ?? []).filter((m) => new Date(m.created_at).getTime() > Date.now() - 30 * 86400000).length;

      return { total: total ?? 0, retention, todayCount: todayCount ?? 0, dau, churnCount: atRisk.length, atRisk, weekCounts, maxWeek, top, newThisMonth, allMembers: allMembers ?? [], streakMap };
    },
  });

  if (!data) return <div className="text-muted animate-pulse p-4">Yuklanmoqda...</div>;

  return (
    <div className="max-w-5xl space-y-5 animate-fadeUp">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "RETENTION (30 KUN)", value: `${data.retention}%`, sub: data.retention > 60 ? "↑ yaxshi" : "↓ yaxshilash kerak", color: data.retention > 60 ? "border-vgreen/40" : "border-vred/40" },
          { label: "JAMI A'ZOLAR", value: data.total, sub: `+${data.newThisMonth} yangi`, color: "border-accent/40" },
          { label: "CHURN RISK", value: data.churnCount, sub: "↓ kuzatuv kerak", color: data.churnCount > 3 ? "border-vred/40" : "border-border" },
          { label: "FAOL BUGUN", value: data.todayCount, sub: `${data.dau}% DAU`, color: "border-accent/40" },
        ].map((k) => (
          <Card key={k.label} className={`${k.color} border-l-2`}>
            <CardContent className="p-4">
              <p className="text-[9px] font-mono text-muted tracking-wider">{k.label}</p>
              <p className="font-display font-bold text-3xl text-vtext mt-1">{k.value}</p>
              <p className="text-[10px] text-muted mt-0.5">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Weekly chart */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-5">
              <p className="text-[10px] font-mono text-muted tracking-wider mb-4">HAFTALIK FAOLLIK</p>
              <div className="flex items-end gap-2 h-32">
                {data.weekCounts.map((v, i) => {
                  const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full rounded-sm transition-all" style={{ height: `${(v / data.maxWeek) * 100}%`, minHeight: v > 0 ? 8 : 4, background: isToday ? "#e8ff47" : "#1e1e2c" }} />
                      <span className="text-[9px] font-mono text-muted">{DAYS[i]}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Members table */}
          <Card className="mt-4">
            <CardContent className="p-5">
              <p className="text-[10px] font-mono text-muted tracking-wider mb-3">SO'NGGI A'ZOLAR</p>
              <table className="w-full text-sm">
                <thead><tr className="text-[9px] text-muted font-mono">
                  <th className="text-left py-1">A'ZO</th><th className="text-left">STREAK</th><th className="text-left">BALL</th><th className="text-left">HOLAT</th>
                </tr></thead>
                <tbody>
                  {data.allMembers.slice(0, 6).map((m: any) => {
                    const s = data.streakMap[m.id];
                    const streak = s?.current_streak ?? 0;
                    const points = s?.total_points ?? 0;
                    const daysAgo = s?.last_activity ? Math.floor((Date.now() - new Date(s.last_activity).getTime()) / 86400000) : 99;
                    const status = daysAgo < 3 ? "Faol" : daysAgo < 7 ? "Yangi" : "Risk";
                    const statusColor = status === "Faol" ? "bg-vgreen/10 text-vgreen" : status === "Risk" ? "bg-vred/10 text-vred" : "bg-accent/10 text-accent";
                    const initials = m.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) ?? "?";
                    return (
                      <tr key={m.id} className="border-t border-border/30">
                        <td className="py-2.5 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">{initials}</div>
                          <span className="text-vtext text-xs">{m.full_name}</span>
                        </td>
                        <td className="text-xs text-muted">🔥 {streak} kun</td>
                        <td className="text-xs text-vtext font-mono">{points.toLocaleString()}</td>
                        <td><span className={`text-[9px] px-1.5 py-0.5 rounded ${statusColor}`}>{status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Churn alert */}
          <Card className="border-vred/20">
            <CardContent className="p-4">
              <p className="text-[10px] font-mono text-vred tracking-wider mb-3">⚠ CHURN OGOHLANTIRISH</p>
              {data.atRisk.length === 0 ? <p className="text-muted text-xs">Xavfda hech kim yo'q ✅</p> : (
                <div className="space-y-2.5">
                  {data.atRisk.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-vred" />
                        <span className="text-xs text-vtext">{m.full_name?.split(" ").map((n: string) => n[0] + n.slice(1, 2)).join(". ") + "."}</span>
                      </div>
                      <span className="text-[10px] text-vred font-mono">{m.days_ago} kun yo'q</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top leaderboard */}
          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] font-mono text-muted tracking-wider mb-3">🏆 HAFTALIK TOP</p>
              <div className="space-y-2.5">
                {data.top.map((m: any, i: number) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div key={m.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{i < 3 ? medals[i] : `${i + 1}.`}</span>
                        <span className="text-xs text-vtext">{m.full_name?.split(" ")[0] + " " + (m.full_name?.split(" ")[1]?.[0] ?? "") + "."}</span>
                      </div>
                      <span className="text-xs text-accent font-mono font-bold">{(m.total_points ?? 0).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
