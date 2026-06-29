"use client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { useAuthStore } from "@/lib/store/auth";
import { Users, CalendarCheck, DollarSign, UserPlus, Bell, ArrowRight, AlertTriangle, ArrowUpRight, MessageCircle } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
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

      let mQuery = sb.from("users").select("id, full_name, created_at").eq("gym_id", gid).eq("role", "member");
      if (isTrainer) mQuery = mQuery.eq("trainer_id", u!.id);
      const { data: allM } = await mQuery;
      const total = allM?.length ?? 0;
      const memberIds = (allM ?? []).map(m => m.id);

      let attQ = sb.from("attendance").select("member_id", { count: "exact" }).eq("gym_id", gid).gte("checked_in_at", `${today}T00:00:00`);
      if (isTrainer && memberIds.length > 0) attQ = attQ.in("member_id", memberIds);
      const { data: attData } = await attQ;
      const todayAtt = attData?.length ?? 0;

      const newToday = (allM ?? []).filter((m) => m.created_at?.split("T")[0] === today).length;

      let att30Q = sb.from("attendance").select("member_id, checked_in_at").eq("gym_id", gid).gte("checked_in_at", ago30);
      if (isTrainer && memberIds.length > 0) att30Q = att30Q.in("member_id", memberIds);
      const { data: att30 } = await att30Q;
      const active30 = new Set(att30?.map((a) => a.member_id)).size;
      const churnRate = total > 0 ? Math.round(((total - active30) / total) * 100) : 0;

      const weekChart: { day: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000);
        const dayStr = date.toISOString().split("T")[0];
        const dayLabel = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"][date.getDay()];
        const count = (att30 ?? []).filter((a) => a.checked_in_at?.split("T")[0] === dayStr).length;
        weekChart.push({ day: dayLabel, count });
      }

      // Deep Churn Mock
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
        if ((streakMap[m.id] ?? 0) === 0) { reasons.push("Streak 0"); riskScore += 20; }
        const pStat = paymentMap.get(m.id);
        if (!isTrainer) {
          if (pStat === "pending" || pStat === "overdue") { reasons.push("To'lov kechikkan"); riskScore += 40; }
          else if (!pStat) { reasons.push("Yangi to'lov yo'q"); riskScore += 30; }
        }
        return { ...m, riskScore, reasons };
      }).filter(m => m.riskScore >= 40).sort((a, b) => b.riskScore - a.riskScore);

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
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 pb-24 animate-fadeUp">
      {/* Header */}
      <div className="flex items-end justify-between pb-2 border-b border-white/5">
        <div>
          <p className="font-mono text-[10px] md:text-[11px] tracking-[0.2em] text-[#8e8e9e] uppercase mb-1">
            {greeting}, {d?.isTrainer ? "Trener" : "Owner"}
          </p>
          <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-white">
            {user?.full_name?.split(" ")[0]}
          </h1>
        </div>
        <div className="flex gap-2">
          {!d?.isTrainer && (
            <Link href="/gym/invite">
              <button className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-[#E8FF47] hover:bg-[#d4ee38] text-black flex items-center justify-center transition-transform active:scale-95 shadow-[0_0_20px_rgba(232,255,71,0.2)]">
                <UserPlus size={20} strokeWidth={2.5} />
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Main Stat: Revenue or Total Students */}
        {!d?.isTrainer ? (
          <div className="col-span-2 bento-card glow-hover p-5 md:p-6 flex flex-col justify-between relative group overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#E8FF47] blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[11px] md:text-xs tracking-widest text-[#8e8e9e]">DAROMAD</span>
              <DollarSign size={16} className="text-[#E8FF47]" />
            </div>
            <div>
              <p className="font-display font-black text-4xl md:text-5xl tracking-tighter text-white">
                {d?.revenue ? `${(d.revenue / 1000).toFixed(0)}k` : "0"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center text-[#E8FF47] font-mono text-[10px]">
                  <ArrowUpRight size={12} className="mr-0.5" /> +12%
                </span>
                <span className="text-[#8e8e9e] font-mono text-[10px]">O'TGAN OYGA N.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-2 bento-card glow-hover p-5 md:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[11px] tracking-widest text-[#8e8e9e]">JAMI SHOGIRDLAR</span>
              <Users size={16} className="text-[#E8FF47]" />
            </div>
            <div>
              <p className="font-display font-black text-4xl md:text-5xl tracking-tighter text-white">
                {d?.total ?? 0}
              </p>
            </div>
          </div>
        )}

        {/* Attendance stat */}
        <div className="bento-card glow-hover p-4 md:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] tracking-widest text-[#8e8e9e]">DAVOMAT</span>
            <CalendarCheck size={14} className="text-white/40" />
          </div>
          <div>
            <p className="font-display font-bold text-3xl tracking-tight text-[#E8FF47]">{d?.todayAtt ?? 0}</p>
            <p className="text-[#8e8e9e] font-mono text-[9px] mt-1">BUGUNGI</p>
          </div>
        </div>

        {/* Churn Risk summary (Red only if danger) */}
        {!d?.isTrainer && (
          <div className={`bento-card p-4 md:p-5 flex flex-col justify-between ${(d?.churnRate ?? 0) > 20 ? "danger-hover border-[#FF453A]/20" : "glow-hover"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] tracking-widest text-[#8e8e9e]">CHURN</span>
              <AlertTriangle size={14} className={(d?.churnRate ?? 0) > 20 ? "text-[#FF453A]" : "text-white/40"} />
            </div>
            <div>
              <p className={`font-display font-bold text-3xl tracking-tight ${(d?.churnRate ?? 0) > 20 ? "text-[#FF453A]" : "text-white"}`}>
                {d?.churnRate ?? 0}%
              </p>
              <p className="text-[#8e8e9e] font-mono text-[9px] mt-1">30 KUNLIK</p>
            </div>
          </div>
        )}
        {d?.isTrainer && (
          <div className="bento-card glow-hover p-4 md:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] tracking-widest text-[#8e8e9e]">YANGI</span>
              <UserPlus size={14} className="text-white/40" />
            </div>
            <div>
              <p className="font-display font-bold text-3xl tracking-tight text-[#E8FF47]">+{d?.newToday ?? 0}</p>
              <p className="text-[#8e8e9e] font-mono text-[9px] mt-1">BUGUNGI QO'SHILGAN</p>
            </div>
          </div>
        )}

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bento-card p-5 md:p-6 glow-hover relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E8FF47]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Davomat dinamikasi</h2>
              <p className="font-mono text-[10px] tracking-widest text-[#8e8e9e] mt-1">OXIRGI 7 KUN</p>
            </div>
            <Link href="/gym/analytics">
              <button className="px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-mono hover:bg-white/5 transition-colors">
                Batafsil
              </button>
            </Link>
          </div>
          <div className="h-44 w-full">
            {d?.weekChart && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.weekChart} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="citrusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E8FF47" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#E8FF47" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#8e8e9e", fontFamily: "var(--font-mono)" }} dy={10} />
                  <Tooltip 
                    contentStyle={{ background: "rgba(13,13,22,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(10px)" }} 
                    itemStyle={{ color: "#E8FF47", fontFamily: "var(--font-display)", fontWeight: 700 }}
                    labelStyle={{ color: "#8e8e9e", fontFamily: "var(--font-mono)", fontSize: "10px" }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#E8FF47" strokeWidth={3} fill="url(#citrusGrad)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Risk Zone (Critical only uses red) */}
        <div className="bento-card danger-hover p-5 flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Xavf zonasi</h2>
              <p className="font-mono text-[10px] tracking-widest text-[#FF453A] mt-1 uppercase">CHURN RISK</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FF453A]/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,69,58,0.2)]">
              <AlertTriangle size={14} className="text-[#FF453A]" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {(!d || d.atRisk.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <p className="font-mono text-xs text-white">Hammasi joyida.</p>
                <p className="font-mono text-[10px] text-[#8e8e9e] mt-1">Xavf yo'q.</p>
              </div>
            ) : (
              d.atRisk.slice(0, 5).map((m: any) => (
                <div key={m.id} className="group p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-display font-bold text-sm text-white">{m.full_name}</p>
                    <Link href={`/gym/members/${m.id}`}>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white/10 rounded-lg text-white hover:bg-[#E8FF47] hover:text-black">
                        <MessageCircle size={12} />
                      </button>
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.reasons.map((r: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 rounded font-mono text-[8px] uppercase tracking-wider bg-[#FF453A]/10 text-[#FF453A]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {d && d.atRisk.length > 5 && (
            <div className="pt-3 mt-2 border-t border-white/5">
              <Link href="/gym/retention">
                <Button variant="ghost" className="w-full font-mono text-[10px] tracking-widest text-[#8e8e9e] hover:text-white">
                  BARCHASINI KO'RISH <ArrowRight size={12} className="ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
