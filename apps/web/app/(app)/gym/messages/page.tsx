"use client";
import { Panel } from "@/components/vf";

export default function Messages() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Xabar yuborish</h1>
        </div>
        <button className="bg-accent text-bg font-semibold text-xs px-4 py-2.5 rounded-[9px] hover:opacity-90">
          + Yangi kampaniya
        </button>
      </div>
      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="XABAR YOZISH">
           <textarea className="w-full h-32 bg-surface2 border border-border rounded-xl p-3 text-xs text-vtext outline-none resize-none mb-3" placeholder="Xabar matni..."></textarea>
           <div className="flex justify-between">
              <button className="border border-[#2a2a3a] text-vtext text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                🤖 AI Yordami
              </button>
              <button className="bg-accent text-bg font-semibold text-xs px-5 py-2 rounded-lg">
                Yuborish
              </button>
           </div>
        </Panel>
      </div>
    </div>
  );
}