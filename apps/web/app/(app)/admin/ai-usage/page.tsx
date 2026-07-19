"use client";
import { AdminService } from "@/lib/services/AdminService";
import { Panel, ChartBars } from "@/components/vf";
import { useQuery } from "@tanstack/react-query";

export default function AdminAiUsage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "aiUsage"],
    queryFn: async () => {
      const res = await AdminService.getAiUsage();
      return res;
    }
  });

  if (isLoading) return <div className="text-vtext">Yuklanmoqda...</div>;
  if (isError || !data) return <div className="text-vred">Xatolik yuz berdi</div>;

  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">AI Usage</h1>
      <Panel title="KUNLIK AI CHAQIRUVLARI">
        <ChartBars data={data.chart || []} height={120} />
      </Panel>
    </div>
  );
}