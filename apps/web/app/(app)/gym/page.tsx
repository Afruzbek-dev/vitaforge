"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { useAuthStore } from "@/lib/store/auth";
import { Users, TrendingUp, TrendingDown, CalendarCheck, DollarSign, UserPlus, Bell, Send, BarChart3, UserMinus, ArrowRight, AlertTriangle, MessageCircle } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import Link from "next/link";
import AdminDashboard from "./admin-dashboard";

export default function GymDashboard() {
  const sb = getSupabase();
  const user = useAuthStore((s) => s.user);

  if (user?.role === "admin") return <AdminDashboard />;

  const { data: d } = useQuery({
    queryKey: ["gym-dash", user?.id],
    queryFn: async () => {
      const u = await getUser();
      const { data: me } = await sb.from("users").select("gym_id, role").eq("id", u!.id).single();
      const gid = me?.gym_id;
      if (!gid) return null;
      const isTrainer = me?.role === "trainer";

      const today = new Date().toISOString().split("T")[0];
      const ago7 = new Date(Date.now() - 7 * 86400000).toISOString();
      const ago30 = new Date(Date.now() - 30 * 86400000).toISOString();

      // Total members (if trainer, ideally only their students, but for MVP we show gym members or trainer's members)
      let mQuery = sb.from("users").select("id, full_name, created_at").eq("gym_id", gid).eq("role", "member");
      if (isTrainer) mQuery = mQuery.eq("trainer_id", u!.id);
      const { data: allM } = await mQuery;
      const total = allM?.length ?? 0;
      const memberIds = (allM ?? []).map(m => m.id);

      // Today attendance
      let attQ = sb.from("attendance").select("member_id", { count: "exact" }).eq("gym_id", gid).gte("checked_in_at", `${today}T00:00:00`);
      if (isTrainer && memberIds.length > 0) attQ = attQ.in("member_id", memberIds);
      const { data: attData } = await attQ;
      const todayAtt = attData?.length ?? 0;

      // New today
      const newToday = (allM ?? []).filter((m) => m.created_at?.split("T")[0] === today).length;

      // 30d Active
      let att30Q = sb.from("attendance").select("member_id, checked_in_at").eq("gym_id", gid).gte("checked_in_at", ago30);
      if (isTrainer && memberIds.length > 0) att30Q = att30Q.in("member_id", memberIds);
      const { data: att30 } = await att30Q;
      const active30 = new Set(att30?.map((a) => a.member_id)).size;
      const churnRate = total > 0 ? Math.round(((total - active30) / total) * 100) : 0;

      // Weekly chart
      const weekChart: { day: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000);
        const dayStr = date.toISOString().split("T")[0];
        const dayLabel = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"][date.getDay()];
        const count = (att30 ?? []).filter((a) => a.checked_in_at?.split("T")[0] === dayStr).length;
        weekChart.push({ day: dayLabel, count });
      }

      // Deep Churn Risk Calculation
      const { data: recentActive } = await sb.from("attendance").select("member_id").eq("gym_id", gid).gte("checked_in_at", ago7);
      const active7 = new Set(recentActive?.map((a) => a.member_id));
      
      const { data: streaks } = await sb.from("member_streaks").select("member_id, current_streak").in("member_id", memberIds);
      const streakMap = Object.fromEntries((streaks ?? []).map(s => [s.member_id, s.current_streak]));

      const { data: payments } = await sb.from("payments").select("member_id, status").in("member_id", memberIds).gte("created_at", ago30).order("created_at", { ascending: false });
      const paymentMap = new Map();
      (payments ?? []).forEach(p => { if (!paymentMap.has(p.member_id)) paymentMap.set(p.member_id, p.status); });

      const atRisk = (allM ?? []).map(m => {
        const reasons: string[] = [];
        let riskScore = 0;
        if (!active7.has(m.id)) { reasons.push("1 haftadan beri kelmadi"); riskScore += 40; }
        if ((streakMap[m.id] ?? 0) === 0) { reasons.push("Streak seriyasi 0"); riskScore += 20; }
        const pStat = paymentMap.get(m.id);
        if (!isTrainer) {
          if (pStat === "pending" || pStat === "overdue") { reasons.push("To'lov kechikkan"); riskScore += 40; }
          else if (!pStat) { reasons.push("Yangi to'lov yo'q"); riskScore += 30; }
        }
        return { ...m, riskScore, reasons };
      }).filter(m => m.riskScore >= 40).sort((a, b) => b.riskScore - a.riskScore);

      // Revenue (Owner only)
      let revenue = 0;
      if (!isTrainer) {
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { data: pay } = await sb.from("payments").select("amount").eq("gym_id", gid).gte("created_at", monthStart).eq("status", "confirmed");
        revenue = (pay ?? []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
      }

      return { isTrainer, total, todayAtt, newToday, churnRate, revenue, atRisk, weekChart };
    },
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech";

  return (
    <div className="max-w-6xl space-y-4 animate-fadeUp pb-24 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-mono text-[10px] tracking-[2px] text-accent uppercase mb-1.5">{greeting}</p>
          <h1 className="font-display font-bold text-2xl tracking-[-0.5px] text-vtext">
            {user?.full_name?.split(" ")[0] ?? (d?.isTrainer ? "Trener" : "Owner")}
          </h1>
        </div>
        <div className="flex gap-2">
          {!d?.isTrainer && <Link href="/gym/invite"><Button className="bg-accent text-bg hover:bg-accent/90 h-10 w-10 p-0 rounded-2xl shadow-xl flex items-center justify-center"><UserPlus size={18} /></Button></Link>}
        </div>
      </div>

      {/* KPI Cards in quick-grid style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {!d?.isTrainer && (
          <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm relative">
            <div className="absolute top-2 right-2 text-muted opacity-50"><DollarSign size={12} /></div>
            <p className="font-display font-bold text-xl text-vblue mt-2">{d?.revenue ? `${(d.revenue / 1000).toFixed(0)}k` : "0"}</p>
            <p className="text-[9px] font-mono text-muted text-center leading-tight">DAROMAD SO'M</p>
          </div>
        )}

        <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm relative">
          <div className="absolute top-2 right-2 text-muted opacity-50"><CalendarCheck size={12} /></div>
          <p className="font-display font-bold text-xl text-vgreen mt-2">{d?.todayAtt ?? 0}</p>
          <p className="text-[9px] font-mono text-muted text-center leading-tight">BUGUNGI DAVOMAT</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm relative">
          <div className="absolute top-2 right-2 text-muted opacity-50"><UserPlus size={12} /></div>
          <p className="font-display font-bold text-xl text-accent mt-2">+{d?.newToday ?? 0}</p>
          <p className="text-[9px] font-mono text-muted text-center leading-tight">YANGI A'ZOLAR</p>
        </div>

        {!d?.isTrainer && (
          <div className={`bg-surface border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm relative`}>
            <div className="absolute top-2 right-2 text-muted opacity-50"><TrendingDown size={12} /></div>
            <p className={`font-display font-bold text-xl mt-2 ${(d?.churnRate ?? 0) > 20 ? "text-vred" : "text-vtext"}`}>{d?.churnRate ?? 0}%</p>
            <p className="text-[9px] font-mono text-muted text-center leading-tight">CHURN RATE 30d</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        {/* Weekly Chart */}
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-[10px] tracking-[1px] text-muted mb-1 uppercase">Haftalik trend</p>
              <h2 className="font-display font-bold text-lg text-vtext">Davomat</h2>
            </div>
            <Link href="/gym/analytics" className="text-[10px] font-mono text-accent flex items-center gap-1 bg-accent/10 px-2 py-1 rounded">Grafiklar <ArrowRight size={10} /></Link>
          </div>
          <div className="h-40">
            {d?.weekChart && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.weekChart} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                  <Tooltip contentStyle={{ background: "var(--surface2)", border: "none", borderRadius: 8, fontSize: 12, color: "var(--text)" }} labelStyle={{ color: "var(--muted)" }} />
                  <Area type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} fill="url(#accGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Deep Churn Risk Red Flags (Action-First) */}
        <div className="border border-vred/30 bg-vred/[0.04] rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-mono text-[10px] tracking-[1px] text-vred mb-1 uppercase">Diqqat</p>
              <h2 className="font-display font-bold text-lg text-vtext">Xavf zonasi</h2>
            </div>
            <div className="w-8 h-8 rounded-full bg-vred/10 flex items-center justify-center">
              <AlertTriangle size={14} className="text-vred" />
            </div>
          </div>
          
          <p className="text-[11px] text-muted mb-3 leading-relaxed">
            AI orqali davomat, to'lov va streaklar asosida tahlil qilingan, yo'qotilishi mumkin bo'lgan a'zolar.
          </p>

          {(!d || d.atRisk.length === 0) ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <p className="text-[12px] text-vgreen font-medium">Hammasi joyida, xavf yo'q! 🎉</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
              {d.atRisk.slice(0, 5).map((m: any) => (
                <div key={m.id} className="bg-surface2/50 border border-border/50 rounded-xl p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-vtext">{m.full_name}</p>
                    <Link href={`/gym/members/${m.id}`} className="w-7 h-7 bg-surface rounded-lg flex items-center justify-center text-accent press"><MessageCircle size={12} /></Link>
                  </div>
                  <div className="space-y-1">
                    {m.reasons.map((r: string, i: number) => (
                      <p key={i} className="text-[9px] font-mono text-vred bg-vred/10 px-1.5 py-0.5 rounded inline-block mr-1 mb-1">
                        • {r}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              {d.atRisk.length > 5 && (
                <Link href="/gym/retention" className="block text-center w-full bg-surface border border-border text-vtext font-mono text-[10px] p-2 rounded-xl mt-2 press">
                  Barchasini ko'rish ({d.atRisk.length})
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions (Quick Grid) */}
      <div>
        <p className="font-mono text-[10px] tracking-[2px] text-muted uppercase mb-3 mt-2">Qisqa Harakatlar</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { href: "/gym/members", icon: Users, label: "A'zolar bazasi" },
            { href: "/gym/analytics", icon: BarChart3, label: "Tahlillar" },
            { href: "/gym/retention", icon: UserMinus, label: "Churn nazorati" },
            { href: "/gym/notify", icon: Bell, label: "Xabarnoma" },
          ].map((a) => (
            <Link key={a.href} href={a.href}>
              <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-sm press h-full transition-colors active:bg-surface2">
                <a.icon size={18} className="text-accent" />
                <p className="text-[10px] font-medium text-muted text-center leading-tight">{a.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
