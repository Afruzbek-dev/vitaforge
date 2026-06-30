"use client";
import { Panel, InsightCard } from "@/components/vf";
export default function TrainerCopilot() {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-2">🤖 AI Copilot</h1>
      <div className="grid grid-cols-[1.3fr_1fr] gap-4 flex-1 min-h-0">
        <Panel className="flex flex-col h-[600px] p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex flex-col self-start max-w-[80%] bg-surface2 border border-border rounded-[12px_12px_12px_4px] p-3 text-[12px] text-vtext">
              Salom, Coach Aziz! Madina Yuldashevada oxirgi kunlarda charchoq alomatlari sezilmoqda. 
            </div>
          </div>
          <div className="p-3 border-t border-border bg-[#0d0d16] flex gap-2">
            <input type="text" placeholder="Javob yozing..." className="flex-1 bg-surface2 border border-border rounded-[9px] px-3.5 py-2.5 text-xs text-vtext outline-none" />
          </div>
        </Panel>
        <div className="space-y-4 overflow-y-auto h-[600px] pr-1">
          <InsightCard warn title="Mijoz faolligi pasaydi" body="Madina 30% adherence'da." action="KO'RISH" />
        </div>
      </div>
    </div>
  );
}