"use client";
import { AdminService } from "@/lib/services/AdminService";
import { KpiCard, Panel, InsightCard, ChartBars } from "@/components/vf";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";

export default function AdminOverview() {
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const res = await AdminService.getOverview();
      return res;
    }
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const res = await AdminService.exportReport();
      return res;
    },
    onSuccess: () => {
      toast("Hisobot export qilindi", "success");
    },
    onError: () => {
      toast("Xatolik yuz berdi", "error");
    }
  });

  if (isLoading) return <div className="text-vtext">Yuklanmoqda...</div>;
  if (isError || !data) return <div className="text-vred">Xatolik yuz berdi</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Platforma umumiy ko'rinishi</h1>
          <p className="text-muted text-xs mt-1">Barcha gym'lar</p>
        </div>
        <button 
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
          className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2 disabled:opacity-50"
        >
          {exportMutation.isPending ? "Export qilinmoqda..." : "Export hisobot"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3.5">
        <KpiCard label="JAMI GYM" value={data.totalGyms?.toString()} delta="↑ 8.2%" />
        <KpiCard label="MRR" value={`$${data.mrr}`} delta="↑ 12.5%" />
        <KpiCard label="CLAUDE API COST" value={`$${data.apiCost}`} delta="↑ 4.5%" />
        <KpiCard label="CHURNED GYMS" value={data.churnedGyms?.toString()} warn />
      </div>

      <InsightCard 
        warn 
        title="🤖 Anomal AI Sarfi" 
        body="PowerFit Samarqandda AI sarfi keskin oshdi ($210). Bot abuse ehtimoli bor." 
        action="TEKSHIRISH" 
      />

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="MRR O'SISHI">
          <ChartBars data={data.mrrChart || []} height={120} />
        </Panel>
      </div>
    </div>
  );
}