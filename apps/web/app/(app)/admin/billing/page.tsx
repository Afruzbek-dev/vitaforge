"use client";
import { KpiCard } from "@/components/vf";
export default function AdminBilling() {
  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Billing</h1>
      <div className="grid grid-cols-4 gap-3.5">
         <KpiCard label="STARTER" value="186" />
         <KpiCard label="PRO" value="158" />
         <KpiCard label="SCALE" value="58" />
         <KpiCard label="ENTERPRISE" value="10" />
      </div>
    </div>
  );
}