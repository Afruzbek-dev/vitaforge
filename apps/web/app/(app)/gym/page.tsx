"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { KpiCard, Panel, Pill, Avatar, InsightCard, BarChart } from "@/components/vf";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export default function OwnerDashboard() {
  const { toast } = useToast();
  
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => api.users.me() });
  const { data: membersRes, isLoading: membersLoading } = useQuery({ queryKey: ["gym", "members"], queryFn: () => api.gym.members() });
  const { data: churnRes } = useQuery({ queryKey: ["gym", "churnRisk"], queryFn: () => api.gym.churnRisk() });
  const { data: retentionRes } = useQuery({ queryKey: ["gym", "retention"], queryFn: () => api.gym.retention() });
  const { data: leaderboardRes } = useQuery({ queryKey: ["leaderboard"], queryFn: () => api.leaderboard.get() });

  const members = membersRes?.data || [];
  const churnList = churnRes?.data || [];
  const retention = retentionRes?.data || { mrr: 0, ltv: 0, active_users: 0, churn_rate: 0 };
  const leaderboard = leaderboardRes?.data || [];

  const activityData = [
    { name: "Du", val: 58 },
    { name: "Se", val: 72 },
    { name: "Ch", val: 65 },
    { name: "Pa", val: 88 },
    { name: "Ju", val: 80 },
    { name: "Sh", val: 75 },
    { name: "Ya", val: 70 },
  ];

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">
            Xush kelibsiz, {user?.full_name?.split(" ")[0] || "Botir"} 👋
          </h1>
          <p className="text-muted text-xs mt-1">FitZone Gym · Yunusobod, Toshkent</p>
        </div>
        <Pill variant="ok">PRO TARIF</Pill>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard label="RETENTION" value={`${Math.round(100 - (retention.churn_rate || 4.1))}%`} delta="↑ 12%" />
        <KpiCard label="JAMI A'ZOLAR" value={members.length || 214} delta="+18 yangi" />
        <KpiCard label="CHURN RISK" value={churnList.length || 9} delta="↓ kuzatuv kerak" warn />
        <KpiCard label="FAOL BUGUN" value={retention.active_users || 87} delta="41% DAU" />
      </div>

      {churnList.length > 0 && (
        <InsightCard 
          warn 
          title="🤖 AI Copilot" 
          body={`${churnList.length} ta a'zo xavfli holatda (oxirgi 7 kunda umuman kelmagan). Ular bilan bog'lanish tavsiya etiladi: ${churnList.slice(0,3).map((c: { full_name: string }) => c.full_name.split(" ")[0]).join(", ")}.`} 
          action="XABAR YUBORISH"
          onAction={async () => {
            try {
              for (const c of churnList) {
                await api.gym.sendMessage({ userId: c.id, message: "Sizni zalda kutyapmiz! Qaytishingiz uchun 10% chegirma taqdim etamiz." });
              }
              toast("Xavf ostidagi barcha mijozlarga xabar yuborildi.", "success");
            } catch (e) {
              toast("Xabar yuborishda xatolik yuz berdi.", "error");
            }
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="space-y-4">
          <Panel title="HAFTALIK FAOLLIK">
            <BarChart data={activityData} dataKey="val" height={160} />
          </Panel>

          <Panel title="SO'NGGI A'ZOLAR">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[300px]">
                <thead>
                  <tr>
                    <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">A'ZO</th>
                    <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">REJA</th>
                    <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">HOLAT</th>
                  </tr>
                </thead>
                <tbody>
                  {membersLoading ? (
                    <tr><td colSpan={3} className="py-4 text-center text-xs text-muted">Yuklanmoqda...</td></tr>
                  ) : members.slice(0, 4).map((m: { id: string; full_name: string; goal?: string; churn_risk?: boolean }) => (
                    <tr key={m.id} className="hover:bg-surface2/50 transition-colors">
                      <td className="py-2.5 border-b border-[#15151f] text-xs">
                        <Link href={`/gym/members/${m.id}`} className="hover:text-accent transition-colors flex items-center gap-2">
                          <Avatar initials={m.full_name.substring(0,2).toUpperCase()} size="sm" />
                          {m.full_name}
                        </Link>
                      </td>
                      <td className="py-2.5 border-b border-[#15151f] text-xs text-[#8888a0]">{m.goal || "Oziq-ovqat"}</td>
                      <td className="py-2.5 border-b border-[#15151f] text-xs">
                        <Pill variant={m.churn_risk ? "risk" : "ok"}>{m.churn_risk ? "xavf" : "faol"}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="CHURN OGOHLANTIRISH">
            <div className="space-y-2">
              {churnList.slice(0, 4).map((c: { full_name: string; churn_probability: number }, i: number) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#15151f] text-xs">
                  <span className="text-vtext">{c.full_name}</span>
                  <Pill variant="risk">xavf ({Math.round(c.churn_probability * 100)}%)</Pill>
                </div>
              ))}
              {churnList.length === 0 && <div className="text-xs text-muted py-2">Xavf ostida mijozlar yo'q</div>}
            </div>
          </Panel>

          <Panel title="HAFTALIK TOP (LEADERBOARD)">
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((m: { full_name: string; total_points: number }, i: number) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#15151f] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}`}
                    </span>
                    <span className="text-vtext">{m.full_name}</span>
                  </div>
                  <span className="text-muted font-mono">{m.total_points}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}