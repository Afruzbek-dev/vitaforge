"use client";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { useAuthStore } from "@/lib/store/auth";
import { Users, CalendarCheck, DollarSign, UserPlus, AlertTriangle, MessageCircle, Info } from "lucide-react";
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
      let expiringPayments = 0;
      (payments ?? []).forEach(p => { 
        if (!paymentMap.has(p.member_id)) {
          paymentMap.set(p.member_id, p.status); 
          if(p.status === "pending" || p.status === "overdue") expiringPayments++;
        }
      });

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

      return { isTrainer, total, todayAtt, newToday, churnRate, revenue, atRisk, weekChart, expiringPayments };
    },
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech";
  const dateStr = new Date().toLocaleDateString("uz-UZ", { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex-1 p-[22px_28px] bg-bg overflow-hidden animate-fadeUp">
      
      {/* Topbar */}
      <div className="flex justify-between items-start mb-[22px]">
        <div>
          <h1 className="font-display font-bold text-[21px] text-vtext">
            {greeting}, {user?.full_name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[12px] text-muted mt-[3px]">
            {dateStr} · Bugun {d?.todayAtt ?? 0} ta a'zo tashrif buyurdi
          </p>
        </div>
        {!d?.isTrainer && (
          <Link href="/gym/invite">
            <button className="flex items-center gap-[6px] bg-accent text-bg font-body font-semibold text-[13px] p-[9px_16px] rounded-[9px] hover:opacity-90 transition-opacity">
              + Yangi a'zo
            </button>
          </Link>
        )}
      </div>

      {/* Priority Strip */}
      <div className="flex gap-[10px] mb-[18px] overflow-x-auto pb-2 custom-scrollbar">
        {/* Urgent Action */}
        <Link href="/gym/retention" className="flex-shrink-0">
          <div className="min-w-[230px] bg-vred/5 border border-vred/30 rounded-[12px] p-[13px_15px] flex items-center gap-[11px] cursor-pointer hover:bg-vred/10 transition-colors">
            <span className="text-[20px]">⚠️</span>
            <div>
              <div className="font-display font-bold text-[17px] leading-none text-vtext">{d?.atRisk?.length ?? 0}</div>
              <div className="text-[10px] text-muted mt-[2px]">A'zo risk ostida — tezroq xabar bering</div>
            </div>
          </div>
        </Link>
        
        {/* Warning Action */}
        {!d?.isTrainer && (
          <div className="min-w-[230px] bg-surface border border-border rounded-[12px] p-[13px_15px] flex items-center gap-[11px] cursor-pointer hover:bg-surface2 transition-colors">
            <span className="text-[20px]">💰</span>
            <div>
              <div className="font-display font-bold text-[17px] leading-none text-vtext">{d?.expiringPayments ?? 0}</div>
              <div className="text-[10px] text-muted mt-[2px]">To'lov muddati bugun tugaydi</div>
            </div>
          </div>
        )}

        {/* Good Action */}
        <div className="min-w-[230px] bg-vgreen/5 border border-vgreen/30 rounded-[12px] p-[13px_15px] flex items-center gap-[11px] cursor-pointer hover:bg-vgreen/10 transition-colors">
          <span className="text-[20px]">🎉</span>
          <div>
            <div className="font-display font-bold text-[17px] leading-none text-vtext">{d?.newToday ?? 0}</div>
            <div className="text-[10px] text-muted mt-[2px]">Yangi a'zo bugun qo'shildi</div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px] mb-[18px]">
        {/* KPI Card 1 */}
        <div className="bg-surface border border-border rounded-[12px] p-[14px_16px] border-l-[2px] border-l-accent">
          <div className="font-mono text-[9px] text-muted tracking-[1px] mb-[7px] uppercase">RETENTION (30 KUN)</div>
          <div className="font-display font-bold text-[20px] text-vtext">{100 - (d?.churnRate ?? 0)}%</div>
          <div className="text-[10px] text-vgreen mt-[3px] font-mono">Maqsad sari yaxshi</div>
        </div>
        
        {/* KPI Card 2 */}
        <div className="bg-surface border border-border rounded-[12px] p-[14px_16px] border-l-[2px] border-l-border">
          <div className="font-mono text-[9px] text-muted tracking-[1px] mb-[7px] uppercase">JAMI A'ZOLAR</div>
          <div className="font-display font-bold text-[20px] text-vtext">{d?.total ?? 0}</div>
          <div className="text-[10px] text-vblue mt-[3px] font-mono">+{d?.newToday ?? 0} yangi</div>
        </div>

        {/* KPI Card 3 */}
        {!d?.isTrainer && (
          <div className="bg-surface border border-border rounded-[12px] p-[14px_16px] border-l-[2px] border-l-border">
            <div className="font-mono text-[9px] text-muted tracking-[1px] mb-[7px] uppercase">BU OY DAROMAD</div>
            <div className="font-display font-bold text-[20px] text-vtext">{(d?.revenue ? d.revenue / 1000000 : 0).toFixed(1)}M</div>
            <div className="text-[10px] text-muted mt-[3px] font-mono">so'm</div>
          </div>
        )}
        
        {/* KPI Card 4 */}
        <div className="bg-surface border border-border rounded-[12px] p-[14px_16px] border-l-[2px] border-l-border">
          <div className="font-mono text-[9px] text-muted tracking-[1px] mb-[7px] uppercase">BUGUN FAOL</div>
          <div className="font-display font-bold text-[20px] text-vtext">{d?.todayAtt ?? 0}</div>
          <div className="text-[10px] text-vblue mt-[3px] font-mono">
            {d?.total ? Math.round(((d.todayAtt ?? 0) / d.total) * 100) : 0}% DAU
          </div>
        </div>
      </div>

      {/* Main Panels Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
        
        {/* Left Panel: Activity Feed / Chart */}
        <div className="bg-surface border border-border rounded-[13px] p-[16px_18px] flex flex-col h-[320px]">
          <div className="font-mono text-[9px] text-muted tracking-[1.5px] mb-[12px] flex justify-between uppercase">
            <span>SO'NGGI DAVOMAT TRENDI</span>
            <Link href="/gym/analytics"><span className="text-vblue hover:underline cursor-pointer">Batafsil →</span></Link>
          </div>
          <div className="flex-1 w-full mt-2">
            {d?.weekChart && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.weekChart} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="var(--blue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }} dy={10} />
                  <Tooltip 
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px" }} 
                    itemStyle={{ color: "var(--vtext)", fontFamily: "var(--font-display)", fontWeight: 700 }}
                    labelStyle={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}
                  />
                  <Area type="monotone" dataKey="count" stroke="var(--blue)" strokeWidth={2} fill="url(#chartGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Panel: Risk List */}
        <div className="bg-surface border border-border rounded-[13px] p-[16px_18px] flex flex-col h-[320px]">
          <div className="font-mono text-[9px] text-muted tracking-[1.5px] mb-[12px] flex justify-between uppercase">
            <span className="flex items-center gap-1"><AlertTriangle size={10} /> DIQQAT TALAB QILADI</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {(!d || d.atRisk.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <p className="font-mono text-xs text-vtext">Hammasi joyida.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {d.atRisk.slice(0, 5).map((m: any, i: number) => (
                  <div key={m.id} className="flex items-center justify-between py-[8px] border-b border-[#15151f] last:border-0">
                    <div className="flex items-center gap-[8px]">
                      <div className="w-[6px] h-[6px] rounded-full bg-vred flex-shrink-0" />
                      <span className="text-[12px] text-vtext font-body">{m.full_name}</span>
                    </div>
                    <Link href={`/gym/members/${m.id}`}>
                      <span className="font-mono text-[10px] text-vblue p-[3px_8px] border border-vblue/30 rounded-[6px] hover:bg-vblue/10 transition-colors">
                        Xabar →
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-[24px] relative">
            <div className="bg-vblue/5 border border-dashed border-vblue/30 rounded-[12px] p-[14px_18px] text-[12px] text-[#9fc4e8] leading-[1.6]">
              <b className="text-[#c8e0f8] block mb-1">Muvaffaqiyat formulasi:</b>
              Risk ro'yxatidagi a'zolarga darhol telegramdan xabar yozish Retention foizini +20% ga oshiradi.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
