"use client";
import { TrainerService } from "@/lib/services/TrainerService";
import { KpiCard, Panel } from "@/components/vf";
import { useQuery } from "@tanstack/react-query";

export default function TrainerAnalytics() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trainer", "analytics"],
    queryFn: async () => {
      const res = await TrainerService.getAnalytics();
      return res;
    }
  });

  if (isLoading) return <div className="text-vtext">Yuklanmoqda...</div>;
  if (isError || !data) return <div className="text-vred">Xatolik yuz berdi</div>;

  return (
    <div className="space-y-4">
       <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Analytics</h1>
       <div className="grid grid-cols-4 gap-3.5">
          <KpiCard label="JAMI SEANSLAR OY" value={data.totalSessions?.toString() || "0"} delta="↑ 8%" />
          <KpiCard label="O'RTACHA ADHERENCE" value={`${data.avgAdherence || 0}%`} delta="↑ 13%" />
          <KpiCard label="RISK MIJOZLAR" value={data.riskClients?.toString() || "0"} warn />
          <KpiCard label="DAROMAD" value={`$${data.revenue || 0}`} delta="↑ 7%" />
       </div>
    </div>
  );
}
