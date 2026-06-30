"use client";
import { Panel, ChartBars } from "@/components/vf";
export default function AdminAiUsage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">AI Usage</h1>
      <Panel title="KUNLIK AI CHAQIRUVLARI">
        <ChartBars data={[{ label: "Du", value: 1200 }, { label: "Juma", value: 2500, peak: true }]} height={120} />
      </Panel>
    </div>
  );
}