"use client";
import { GymService } from "@/lib/services/GymService";
import { useQuery } from "@tanstack/react-query";
import { KpiCard, Panel, ChartBars } from "@/components/features";
import { useToast } from "@/components/ui/toast";

export default function Analytics() {
  const { toast } = useToast();
  
  const { data: summaryRes, isLoading: summaryLoading, isError: summaryError } = useQuery({ queryKey: ["gym", "analyticsSummary"], queryFn: () => GymService.getAnalyticsSummary() });
  const { data: revenueRes, isLoading: revenueLoading, isError: revenueError } = useQuery({ queryKey: ["gym", "revenueDynamics"], queryFn: () => GymService.getRevenueDynamics() });
  const { data: growthRes, isLoading: growthLoading, isError: growthError } = useQuery({ queryKey: ["gym", "memberGrowth"], queryFn: () => GymService.getMemberGrowth() });
  const { data: activityRes, isLoading: activityLoading, isError: activityError } = useQuery({ queryKey: ["gym", "activityDistribution"], queryFn: () => GymService.getActivityDistribution() });

  const summary = summaryRes;
  const revenue = (revenueRes as any) || [];
  const growth = (growthRes as any) || [];
  const activity = (activityRes as any) || [];

  if (summaryLoading || revenueLoading || growthLoading || activityLoading) return <div className="p-4 text-muted">Yuklanmoqda...</div>;
  if (summaryError || revenueError || growthError || activityError) return <div className="p-4 text-red-500">Xatolik yuz berdi</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Analytics</h1>
          <p className="text-muted text-xs mt-1">FitZone Gym · Oxirgi 6 oy</p>
        </div>
        <button 
          onClick={() => toast("Hisobot CSV formatida yuklab olindi", "success")}
          className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3.5">
        <KpiCard label="MRR" value={`$${summary?.mrr || 0}`} delta={summary?.mrr_delta || ""} />
        <KpiCard label="O'RTACHA LTV" value={`$${summary?.ltv || 0}`} delta={summary?.ltv_delta || ""} />
        <KpiCard label="CHURN OYLIK" value={summary?.churn_rate || "0%"} delta={summary?.churn_delta || ""} warn />
        <KpiCard label="AI SARFI" value={`$${summary?.ai_spend || 0}`} delta="Bu oy" />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="DAROMAD DINAMIKASI">
          <ChartBars data={revenue} height={150} />
        </Panel>
        <Panel title="A'ZOLAR O'SISHI">
          <ChartBars data={growth} height={150} />
        </Panel>
      </div>
      
      <Panel title="FAOLLIK TAQSIMOTI">
        <div className="space-y-4">
           {activity.map((d: any) => (
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
