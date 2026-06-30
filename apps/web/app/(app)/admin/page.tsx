"use client";
import { KpiCard, Panel, InsightCard, ChartBars } from "@/components/vf";

export default function AdminOverview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Platforma umumiy ko'rinishi</h1>
          <p className="text-muted text-xs mt-1">Barcha gym'lar</p>
        </div>
        <button className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2">
          Export hisobot
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3.5">
        <KpiCard label="JAMI GYM" value="412" delta="↑ 8.2%" />
        <KpiCard label="MRR" value="$18,420" delta="↑ 12.5%" />
        <KpiCard label="CLAUDE API COST" value="$1,240" delta="↑ 4.5%" />
        <KpiCard label="CHURNED GYMS" value="6" warn />
      </div>

      <InsightCard 
        warn 
        title="🤖 Anomal AI Sarfi" 
        body="PowerFit Samarqandda AI sarfi keskin oshdi ($210). Bot abuse ehtimoli bor." 
        action="TEKSHIRISH" 
      />

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="MRR O'SISHI">
          <ChartBars data={[
             { label: "Yan", value: 12 },
             { label: "Fev", value: 14 },
             { label: "Mar", value: 15 },
             { label: "Apr", value: 16 },
             { label: "May", value: 17 },
             { label: "Iyun", value: 18.4, peak: true },
          ]} height={120} />
        </Panel>
      </div>
    </div>
  );
}