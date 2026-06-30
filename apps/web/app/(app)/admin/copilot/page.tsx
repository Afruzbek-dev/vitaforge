"use client";
import { Panel, InsightCard } from "@/components/vf";
export default function AdminCopilot() {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-2">🤖 AI Copilot</h1>
      <div className="grid grid-cols-[1.3fr_1fr] gap-4 flex-1 min-h-0">
        <Panel className="flex flex-col h-[600px] p-0 overflow-hidden">
          <div className="flex-1 p-4"><div className="text-vtext text-xs">AI Chat System Overview</div></div>
        </Panel>
        <div className="space-y-4 overflow-y-auto h-[600px] pr-1">
          <InsightCard warn title="Anomal sarf" body="PowerFit Samarqand" />
        </div>
      </div>
    </div>
  );
}