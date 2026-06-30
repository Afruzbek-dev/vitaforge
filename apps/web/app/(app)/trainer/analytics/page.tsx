"use client";
import { KpiCard, ChartBars, Panel } from "@/components/vf";
export default function TrainerAnalytics() {
  return (
    <div className="space-y-4">
       <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Analytics</h1>
       <div className="grid grid-cols-4 gap-3.5">
          <KpiCard label="JAMI SEANSLAR OY" value="96" delta="↑ 8%" />
          <KpiCard label="O'RTACHA ADHERENCE" value="81%" delta="↑ 13%" />
          <KpiCard label="RISK MIJOZLAR" value="2" warn />
          <KpiCard label="DAROMAD" value="$1,840" delta="↑ 7%" />
       </div>
    </div>
  );
}