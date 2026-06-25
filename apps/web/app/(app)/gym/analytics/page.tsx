"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingDown, TrendingUp, Users, AlertTriangle, Activity, DollarSign } from "lucide-react";
import Link from "next/link";

type Period = "week" | "month";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const sb = getSupabase();

  const { data } = useQuery({
    queryKey: ["gym-analytics", period],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const gid = me?.gym_id;
      if (!gid) return null;

      const days = period === "week" ? 7 : 30;
      const ago = new Date(Date.now() - days * 86400000).toISOString();

      // All members
      const { data: allM } = await sb.from("users").select("id, full_name, phone, created_at").eq("gym_id", gid).eq("role", "member");
      const total = allM?.length ?? 0;

      // Attendance in period
      const { data: attData } = await sb.from("attendance").select("member_id, checked_in_at").eq("gym_id", gid).gte("checked_in_at", ago);

      // Streaks
      const ids = (allM ?? []).map((m) => m.id);
      const { data: streaks } = await sb.from("member_streaks").select("member_id, current_streak, total_points, last_activity").in("member_id", ids.length ? ids : ["_"]);
      const sMap = Object.fromEntries((streaks ?? []).map((s) => [s.member_id, s]));

      // Payments
      const { data: payments } = await sb.from("payments").select("amount, created_at").eq("gym_id", gid).gte("created_at", ago).eq("status", "confirmed");

      // --- Build charts ---

      // Daily attendance chart
      const attChart: { day: string; count: number; revenue: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const dayStr = d.toISOString().split("T")[0];
        const label = days <= 7 ? ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"][d.getDay()] : `${d.getDate()}/${d.getMonth() + 1}`;
        const count = (attData ?? []).filter((a) => a.checked_in_at?.split("T")[0] === dayStr).length;
        const rev = (payments ?? []).filter((p) => p.created_at?.split("T")[0] === dayStr).reduce((s, p) => s + (Number(p.amount) || 0), 0);
        attChart.push({ day: label, count, revenue: rev });
      }

      // Retention curve — what % of members were active in each bucket
      const now = Date.now();
      const retentionCurve = [7, 14, 21, 30, 60, 90].map((d) => {
        const cutoff = new Date(now - d * 86400000).toISOString();
        const activeInPeriod = new Set((attData ?? []).filter((a) => a.checked_in_at >= cutoff).map((a) => a.member_id)).size;
        return { label: `${d}d`, pct: total > 0 ? Math.round((activeInPeriod / total) * 100) : 0 };
      });

      // Churn rate over time (per day, what % of members haven't been active 7+ days)
      const churnChart: { day: string; rate: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const dayStr = d.toISOString().split("T")[0];
        const label = days <= 7 ? ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"][d.getDay()] : `${d.getDate()}`;
        const sevenBefore = new Date(d.getTime() - 7 * 86400000).toISOString();
        const activeSet = new Set((attData ?? []).filter((a) => a.checked_in_at >= sevenBefore && a.checked_in_at <= d.toISOString()).map((a) => a.member_id));
        const churned = total - activeSet.size;
        churnChart.push({ day: label, rate: total > 0 ? Math.round((churned / total) * 100) : 0 });
      }

      // Member growth (new members per day)
      const growthChart: { day: string; newMembers: number; cumulative: number }[] = [];
      let cum = 0;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const dayStr = d.toISOString().split("T")[0];
        const label = days <= 7 ? ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"][d.getDay()] : `${d.getDate()}`;
        const newCount = (allM ?? []).filter((m) => m.created_at?.split("T")[0] === dayStr).length;
        cum += newCount;
        growthChart.push({ day: label, newMembers: newCount, cumulative: cum });
      }

      // Revenue total
      const totalRevenue = (payments ?? []).reduce((s, p) => s + (Number(p.amount) || 0), 0);

      // Active/Passive users with AI reasons
      const memberAnalysis = (allM ?? []).map((m) => {
        const s = sMap[m.id];
        const lastAct = s?.last_activity ? new Date(s.last_activity) : null;
        const daysAgo = lastAct ? Math.floor((now - lastAct.getTime()) / 86400000) : 999;
        const visits = (attData ?? []).filter((a) => a.member_id === m.id).length;

        let risk: "low" | "medium" | "high" = "low";
        let reason = "Faol a'zo";
        if (daysAgo >= 14) { risk = "high"; reason = `${daysAgo} kun kelmadi`; }
        else if (daysAgo >= 7) { risk = "medium"; reason = `${daysAgo} kun kelmadi`; }
        else if (visits <= 1 && daysAgo >= 3) { risk = "medium"; reason = "Kam tashrif buyuradi"; }

        return { ...m, daysAgo, visits, risk, reason, streak: s?.current_streak ?? 0, points: s?.total_points ?? 0 };
      }).sort((a, b) => b.daysAgo - a.daysAgo);

      const activeMembers = memberAnalysis.filter((m) => m.risk === "low").sort((a, b) => b.visits - a.visits).slice(0, 5);
      const passiveMembers = memberAnalysis.filter((m) => m.risk !== "low").slice(0, 8);

      const currentChurn = total > 0 ? Math.round(((total - new Set((attData ?? []).map((a) => a.member_id)).size) / total) * 100) : 0;

      return { total, attChart, retentionCurve, churnChart, growthChart, totalRevenue, activeMembers, passiveMembers, currentChurn, memberAnalysis };
    },
  });

  if (!data) return <div className="text-muted animate-pulse p-4">Yuklanmoqda...</div>;

  const chartTooltipStyle = { background: "#13131c", border: "1px solid #1e1e2c", borderRadius: 10, fontSize: 11 };
  const riskColor = (r: string) => r === "high" ? "text-vred" : r === "medium" ? "text-[#ffa726]" : "text-vgreen";
  const riskBg = (r: string) => r === "high" ? "bg-vred/10" : r === "medium" ? "bg-[#ffa726]/10" : "bg-vgreen/10";

  return (
    <div className="max-w-6xl space-y-6 animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-vtext">Analitika</h1>
          <p className="text-[11px] text-muted">{data.total} a'zo asosida tahlil</p>
        </div>
        <div className="flex gap-1.5 bg-card border border-border rounded-lg p-0.5">
          {(["week", "month"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`text-[11px] font-mono px-3 py-1.5 rounded-md transition-colors ${period === p ? "bg-accent text-[#07070a] font-bold" : "text-muted hover:text-vtext"}`}>
              {p === "week" ? "Hafta" : "Oy"}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="card-hover">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-vred/10 flex items-center justify-center"><TrendingDown size={16} className="text-vred" /></div>
            <div>
              <p className="font-display font-bold text-xl text-vtext">{data.currentChurn}%</p>
              <p className="text-[9px] font-mono text-muted">CHURN RATE</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-vgreen/10 flex items-center justify-center"><Activity size={16} className="text-vgreen" /></div>
            <div>
              <p className="font-display font-bold text-xl text-vtext">{data.retentionCurve[0]?.pct ?? 0}%</p>
              <p className="text-[9px] font-mono text-muted">RETENTION 7D</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-vblue/10 flex items-center justify-center"><Users size={16} className="text-vblue" /></div>
            <div>
              <p className="font-display font-bold text-xl text-vtext">{data.total}</p>
              <p className="text-[9px] font-mono text-muted">JAMI A'ZOLAR</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center"><DollarSign size={16} className="text-accent" /></div>
            <div>
              <p className="font-display font-bold text-xl text-vtext">{data.totalRevenue ? `${(data.totalRevenue / 1000).toFixed(0)}k` : "0"}</p>
              <p className="text-[9px] font-mono text-muted">DAROMAD</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 1: Churn + Revenue */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-[10px] font-mono text-muted tracking-wider mb-4">CHURN RATE DINAMIKASI</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.churnChart}>
                  <CartesianGrid stroke="#1e1e2c" strokeDasharray="3 3" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#52526a" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#52526a" }} unit="%" />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="rate" stroke="#ff5252" strokeWidth={2} dot={false} name="Churn %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-[10px] font-mono text-muted tracking-wider mb-4">DAROMAD TRENDI</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.attChart}>
                  <CartesianGrid stroke="#1e1e2c" strokeDasharray="3 3" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#52526a" }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="revenue" fill="#5299ff" radius={[4, 4, 0, 0]} name="Daromad" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2: Retention curve + Member growth */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-[10px] font-mono text-muted tracking-wider mb-4">RETENTION CURVE</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.retentionCurve}>
                  <defs>
                    <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4dffb4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4dffb4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e1e2c" strokeDasharray="3 3" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#52526a" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#52526a" }} unit="%" />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area type="monotone" dataKey="pct" stroke="#4dffb4" strokeWidth={2} fill="url(#retGrad)" name="Retention %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-[10px] font-mono text-muted tracking-wider mb-4">A'ZOLAR O'SISHI</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.growthChart}>
                  <defs>
                    <linearGradient id="growGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e8ff47" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#e8ff47" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e1e2c" strokeDasharray="3 3" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#52526a" }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area type="monotone" dataKey="cumulative" stroke="#e8ff47" strokeWidth={2} fill="url(#growGrad)" name="Jami yangi" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active/Passive members with AI analysis */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Passive — churn risk */}
        <Card className="border-[var(--red)]/15">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={14} className="text-vred" />
              <p className="text-[10px] font-mono text-vred tracking-wider">PASSIV A'ZOLAR — AI TAHLIL</p>
            </div>
            {data.passiveMembers.length === 0 ? <p className="text-muted text-xs">Hamma faol</p> : (
              <div className="space-y-2.5">
                {data.passiveMembers.map((m: any) => (
                  <Link key={m.id} href={`/gym/members/${m.id}`} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 press">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${m.risk === "high" ? "bg-[var(--red)]" : "bg-[#ffa726]"}`} />
                      <div>
                        <p className="text-xs text-vtext">{m.full_name}</p>
                        <p className={`text-[9px] font-mono ${riskColor(m.risk)}`}>{m.reason}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${riskBg(m.risk)} ${riskColor(m.risk)}`}>
                      {m.risk === "high" ? "Yuqori" : "O'rta"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active users */}
        <Card className="border-[var(--green)]/15">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-vgreen" />
              <p className="text-[10px] font-mono text-vgreen tracking-wider">ENG FAOL A'ZOLAR</p>
            </div>
            {data.activeMembers.length === 0 ? <p className="text-muted text-xs">Ma'lumot yo'q</p> : (
              <div className="space-y-2.5">
                {data.activeMembers.map((m: any, i: number) => (
                  <Link key={m.id} href={`/gym/members/${m.id}`} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 press">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-muted w-4">{i + 1}.</span>
                      <div>
                        <p className="text-xs text-vtext">{m.full_name}</p>
                        <p className="text-[9px] font-mono text-vgreen">{m.visits} tashrif · {m.streak} kun streak</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-accent">{m.points?.toLocaleString()} ball</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
