"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { useAuthStore } from "@/lib/store/auth";
import { Users, TrendingUp, TrendingDown, CalendarCheck, DollarSign, UserPlus, Bell, Send, BarChart3, UserMinus, ArrowRight } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import Link from "next/link";

import AdminDashboard from "./admin-dashboard";

export default function GymDashboard() {
  const sb = getSupabase();
  const user = useAuthStore((s) => s.user);

  if (user?.role === "admin") return <AdminDashboard />;

  const { data: d } = useQuery({
    queryKey: ["gym-dash"],
    queryFn: async () => {
      const u = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", u!.id).single();
      const gid = me?.gym_id;
      if (!gid) return null;

      const today = new Date().toISOString().split("T")[0];
      const ago7 = new Date(Date.now() - 7 * 86400000).toISOString();
      const ago30 = new Date(Date.now() - 30 * 86400000).toISOString();

      // Total members
      const { count: total } = await sb.from("users").select("*", { count: "exact", head: true }).eq("gym_id", gid).eq("role", "member");

      // Today attendance
      const { count: todayAtt } = await sb.from("attendance").select("*", { count: "exact", head: true }).eq("gym_id", gid).gte("checked_in_at", `${today}T00:00:00`);

      // New today
      const { data: allM } = await sb.from("users").select("id, full_name, created_at").eq("gym_id", gid).eq("role", "member");
      const newToday = (allM ?? []).filter((m) => m.created_at?.split("T")[0] === today).length;

      // Active 30d & churn
      const { data: att30 } = await sb.from("attendance").select("member_id, checked_in_at").eq("gym_id", gid).gte("checked_in_at", ago30);
      const active30 = new Set(att30?.map((a) => a.member_id)).size;
      const churnRate = (total ?? 0) > 0 ? Math.round(((total! - active30) / total!) * 100) : 0;

      // 7-day active set for risk
      const { data: att7 } = await sb.from("attendance").select("member_id").eq("gym_id", gid).gte("checked_in_at", ago7);
      const active7 = new Set(att7?.map((a) => a.member_id));
      const atRisk = (allM ?? []).filter((m) => !active7.has(m.id));

      // Revenue (payments this month)
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: payments } = await sb.from("payments").select("amount").eq("gym_id", gid).gte("created_at", monthStart).eq("status", "confirmed");
      const revenue = (payments ?? []).reduce((s, p) => s + (Number(p.amount) || 0), 0);

      // Weekly chart data (last 7 days attendance count per day)
      const weekChart: { day: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const dayStr = d.toISOString().split("T")[0];
        const dayLabel = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"][d.getDay()];
        const count = (att30 ?? []).filter((a) => a.checked_in_at?.split("T")[0] === dayStr).length;
        weekChart.push({ day: dayLabel, count });
      }

      return { total: total ?? 0, todayAtt: todayAtt ?? 0, newToday, churnRate, revenue, atRisk, weekChart };
    },
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech";

  return (
    <div className="max-w-6xl space-y-6 animate-fadeUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <p className="text-[11px] text-muted font-mono">{greeting}</p>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-vtext">{user?.full_name?.split(" ")[0] ?? "Owner"}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/gym/notify"><Button variant="outline" size="sm" className="gap-1.5"><Bell size={14} /> Xabar</Button></Link>
          <Link href="/gym/invite"><Button size="sm" className="gap-1.5"><UserPlus size={14} /> Yangi a'zo</Button></Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="card-hover border-l-2 border-l-[var(--accent)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <UserPlus size={16} className="text-accent" />
              {d && d.newToday > 0 && <span className="text-[9px] font-mono text-vgreen bg-vgreen/10 px-1.5 py-0.5 rounded">+{d.newToday}</span>}
            </div>
            <p className="font-display font-bold text-2xl text-vtext">{d?.newToday ?? 0}</p>
            <p className="text-[10px] font-mono text-muted mt-0.5">YANGI A'ZOLAR BUGUN</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-2 border-l-[var(--green)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CalendarCheck size={16} className="text-vgreen" />
              <span className="text-[9px] font-mono text-muted">{d && d.total > 0 ? Math.round((d.todayAtt / d.total) * 100) : 0}%</span>
            </div>
            <p className="font-display font-bold text-2xl text-vtext">{d?.todayAtt ?? 0}</p>
            <p className="text-[10px] font-mono text-muted mt-0.5">BUGUNGI DAVOMAT</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-2 border-l-[var(--blue)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={16} className="text-vblue" />
              <TrendingUp size={12} className="text-vgreen" />
            </div>
            <p className="font-display font-bold text-2xl text-vtext">{d?.revenue ? `${(d.revenue / 1000).toFixed(0)}k` : "0"}</p>
            <p className="text-[10px] font-mono text-muted mt-0.5">BU OY DAROMAD (SO'M)</p>
          </CardContent>
        </Card>

        <Card className={`card-hover border-l-2 ${(d?.churnRate ?? 0) > 20 ? "border-l-[var(--red)]" : "border-l-[var(--green)]"}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <UserMinus size={16} className={(d?.churnRate ?? 0) > 20 ? "text-vred" : "text-vgreen"} />
              {(d?.churnRate ?? 0) > 20 ? <TrendingDown size={12} className="text-vred" /> : <TrendingUp size={12} className="text-vgreen" />}
            </div>
            <p className="font-display font-bold text-2xl text-vtext">{d?.churnRate ?? 0}%</p>
            <p className="text-[10px] font-mono text-muted mt-0.5">CHURN RATE (30 KUN)</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Risk panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        {/* Weekly Chart */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-mono text-muted tracking-wider">HAFTALIK DAVOMAT</p>
                <p className="text-vtext text-sm font-medium mt-0.5">{d?.total ?? 0} jami a'zo</p>
              </div>
              <Link href="/gym/analytics" className="text-[10px] text-vblue font-mono flex items-center gap-1">Batafsil <ArrowRight size={10} /></Link>
            </div>
            <div className="h-40">
              {d?.weekChart && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={d.weekChart} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                    <defs>
                      <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--chart-tick)" }} />
                    <Tooltip contentStyle={{ background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 10, fontSize: 12, color: "var(--text)" }} labelStyle={{ color: "var(--muted)" }} />
                    <Area type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} fill="url(#accGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* At risk */}
        <Card className="border-[var(--red)]/15">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono text-vred tracking-wider">CHURN XAVFI</p>
              <span className="text-[10px] font-mono text-vred bg-vred/10 px-1.5 py-0.5 rounded">{d?.atRisk?.length ?? 0}</span>
            </div>
            {(!d || d.atRisk.length === 0) ? (
              <p className="text-muted text-xs">Hamma faol</p>
            ) : (
              <div className="space-y-2">
                {d.atRisk.slice(0, 5).map((m: any) => (
                  <Link key={m.id} href={`/gym/members/${m.id}`} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 press">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)]" />
                      <span className="text-xs text-vtext">{m.full_name}</span>
                    </div>
                    <Send size={12} className="text-muted" />
                  </Link>
                ))}
                {d.atRisk.length > 5 && (
                  <Link href="/gym/retention" className="text-[10px] text-vblue font-mono">+{d.atRisk.length - 5} boshqa</Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-[10px] font-mono text-muted tracking-wider mb-3">TEZ HARAKATLAR</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { href: "/gym/members", icon: Users, label: "A'zolar", desc: `${d?.total ?? 0} ta` },
            { href: "/gym/analytics", icon: BarChart3, label: "Analitika", desc: "Batafsil" },
            { href: "/gym/finance", icon: DollarSign, label: "Moliya", desc: "Hisobot" },
            { href: "/gym/notify", icon: Bell, label: "Xabarnoma", desc: "Yuborish" },
          ].map((a) => (
            <Link key={a.href} href={a.href}>
              <Card className="press card-hover h-full">
                <CardContent className="p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                    <a.icon size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-vtext">{a.label}</p>
                    <p className="text-[9px] text-muted">{a.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
