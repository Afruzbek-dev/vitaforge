"use client";
import { KpiCard, Panel, LineChart, BarChart, PieChart } from "@/components/vf";

export default function Analytics() {
  const mrrData = [
    { name: "Yan", mrr: 4100 },
    { name: "Fev", mrr: 4800 },
    { name: "Mar", mrr: 5200 },
    { name: "Apr", mrr: 5600 },
    { name: "May", mrr: 5900 },
    { name: "Iyun", mrr: 6240 },
  ];

  const growthData = [
    { name: "Yan", users: 120 },
    { name: "Fev", users: 145 },
    { name: "Mar", users: 168 },
    { name: "Apr", users: 189 },
    { name: "May", users: 202 },
    { name: "Iyun", users: 214 },
  ];

  const distributionData = [
    { name: "3+ marta (Faol)", value: 42 },
    { name: "1-2 marta", value: 38 },
    { name: "Xavf ostida", value: 15, color: "#E24B4A" },
    { name: "Muzlatilgan", value: 5, color: "#F2A623" },
  ];

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Analytics</h1>
          <p className="text-muted text-xs mt-1">FitZone Gym · Oxirgi 6 oy</p>
        </div>
        <button className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2 transition-colors">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard label="MRR" value="$6,240" delta="↑ 9.3%" />
        <KpiCard label="O'RTACHA LTV" value="$184" delta="↑ 4.1%" />
        <KpiCard label="CHURN OYLIK" value="4.1%" delta="↑ 0.6%" warn />
        <KpiCard label="AI SARFI" value="$31" delta="Bu oy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="DAROMAD DINAMIKASI (LINE GRAPH)">
          <LineChart data={mrrData} dataKey="mrr" height={220} />
        </Panel>
        <Panel title="A'ZOLAR O'SISHI (BAR CHART)">
          <BarChart data={growthData} dataKey="users" height={220} />
        </Panel>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="FAOLLIK TAQSIMOTI (PIE CHART)">
          <PieChart data={distributionData} height={260} />
        </Panel>
        <Panel title="FAOLLIK KO'RSATKICHLARI">
          <div className="space-y-4 pt-2">
             {distributionData.map(d => (
               <div key={d.name} className="flex justify-between items-center py-2.5 border-b border-[#15151f] text-xs">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color || 'var(--accent)' }}></div>
                   <span className="text-vtext">{d.name}</span>
                 </div>
                 <span className="text-muted font-mono font-medium">{d.value}%</span>
               </div>
             ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}