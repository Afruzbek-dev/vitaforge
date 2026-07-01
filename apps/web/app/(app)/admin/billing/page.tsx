"use client";
import { KpiCard } from "@/components/vf";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function AdminBilling() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "billing"],
    queryFn: async () => {
      const res = await api.admin.billing();
      return res.data;
    }
  });

  if (isLoading) return <div className="text-vtext">Yuklanmoqda...</div>;
  if (isError || !data) return <div className="text-vred">Xatolik yuz berdi</div>;

  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Billing</h1>
      <div className="grid grid-cols-4 gap-3.5">
         <KpiCard label="STARTER" value={data.starter?.toString()} />
         <KpiCard label="PRO" value={data.pro?.toString()} />
         <KpiCard label="SCALE" value={data.scale?.toString()} />
         <KpiCard label="ENTERPRISE" value={data.enterprise?.toString()} />
      </div>
    </div>
  );
}