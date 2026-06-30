"use client";
import { Panel } from "@/components/vf";
export default function AdminSettings() {
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Sozlamalar</h1>
      <Panel title="PLATFORMA SOZLAMALARI">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]"><span className="text-xs text-vtext">Gym AI limit warning</span></div>
        </div>
      </Panel>
    </div>
  );
}