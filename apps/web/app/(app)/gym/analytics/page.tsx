"use client";
import { KpiCard, Panel, ChartBars } from "@/components/vf";

export default function Analytics() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Analytics</h1>
          <p className="text-muted text-xs mt-1">FitZone Gym · Oxirgi 6 oy</p>
        </div>
        <button className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3.5">
        <KpiCard label="MRR" value="$6,240" delta="↑ 9.3%" />
        <KpiCard label="O'RTACHA LTV" value="$184" delta="↑ 4.1%" />
        <KpiCard label="CHURN OYLIK" value="4.1%" delta="↑ 0.6%" warn />
        <KpiCard label="AI SARFI" value="$31" delta="Bu oy" />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="DAROMAD DINAMIKASI">
          <ChartBars data={[
            { label: "Yan", value: 4100 },
            { label: "Fev", value: 4800 },
            { label: "Mar", value: 5200 },
            { label: "Apr", value: 5600 },
            { label: "May", value: 5900 },
            { label: "Iyun", value: 6240, peak: true },
          ]} height={150} />
        </Panel>
        <Panel title="A'ZOLAR O'SISHI">
          <ChartBars data={[
            { label: "Yan", value: 120 },
            { label: "Fev", value: 145 },
            { label: "Mar", value: 168 },
            { label: "Apr", value: 189 },
            { label: "May", value: 202 },
            { label: "Iyun", value: 214, peak: true },
          ]} height={150} />
        </Panel>
      </div>
      
      <Panel title="FAOLLIK TAQSIMOTI">
        <div className="space-y-4">
           {[
             { name: "3+ marta keluvchilar (Haftasiga)", pct: "42%" },
             { name: "1-2 marta keluvchilar", pct: "38%" },
             { name: "Xavf ostida (0 marta)", pct: "15%" },
             { name: "Muzlatilgan", pct: "5%" },
           ].map(d => (
             <div key={d.name} className="flex justify-between items-center py-2.5 border-b border-[#15151f] text-xs">
               <span className="text-vtext">{d.name}</span>
               <span className="text-muted font-mono">{d.pct}</span>
             </div>
           ))}
        </div>
      </Panel>
    </div>
  );
}