"use client";
import { UserService } from "@/lib/services/UserService";
import { GymService } from "@/lib/services/GymService";
import { LeaderboardService } from "@/lib/services/LeaderboardService";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { KpiCard, Panel, Pill, Avatar, InsightCard, BarChart } from "@/components/vf";
import { useToast } from "@/components/ui/toast";

export default function OwnerDashboard() {
  const { toast } = useToast();
  
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => UserService.getMe() });
  const { data: membersRes, isLoading: membersLoading } = useQuery({ queryKey: ["gym", "members"], queryFn: () => GymService.getMembers() });
  const { data: churnRes } = useQuery({ queryKey: ["gym", "churnRisk"], queryFn: () => GymService.getDeepChurnAnalysis() });
  const { data: retentionRes } = useQuery({ queryKey: ["gym", "retention"], queryFn: () => GymService.getRetentionAnalytics() });
  const { data: leaderboardRes } = useQuery({ queryKey: ["leaderboard"], queryFn: () => LeaderboardService.getTopUsers() });

  const members = (membersRes as any) || [];
  const churnList = (churnRes as any) || [];
  const retention = (retentionRes as any) || { mrr: 0, ltv: 0, active_users: 0, churn_rate: 0 };
  const leaderboard = (leaderboardRes as any) || [];

  const activityData: any[] = [];

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">
            Xush kelibsiz, {user?.full_name?.split(" ")[0] || "Egasi"} 👋
          </h1>
          <p className="text-muted text-xs mt-1">Gym · Asosiy panel</p>
        </div>
        <Pill variant="ok">PRO TARIF</Pill>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard label="RETENTION" value={`${Math.round(100 - (retention.churn_rate || 0))}%`} delta="" />
        <KpiCard label="JAMI A'ZOLAR" value={members.length || 0} delta="" />
        <KpiCard label="CHURN RISK" value={churnList.length || 0} delta="" warn />
        <KpiCard label="FAOL BUGUN" value={retention.active_users || 0} delta="" />
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
                await GymService.sendMessage({ userId: c.id, message: "Sizni zalda kutyapmiz! Qaytishingiz uchun 10% chegirma taqdim etamiz." });
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
