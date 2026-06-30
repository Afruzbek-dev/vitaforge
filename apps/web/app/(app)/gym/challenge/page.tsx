"use client";
import { Panel, ProgressBar } from "@/components/vf";

export default function Challenge() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Challenge & Gamifikatsiya</h1>
        </div>
        <button className="bg-accent text-bg font-semibold text-xs px-4 py-2.5 rounded-[9px] hover:opacity-90">
          + Yangi challenge
        </button>
      </div>

      <Panel title="JORIY CHALLENGE">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[14px] font-bold text-vtext">30 kunlik temir — Iyun marafoni</div>
          <div className="font-mono text-[10px] text-muted">18/30 kun</div>
        </div>
        <ProgressBar value={60} />
        <div className="mt-3 text-xs text-[#8888a0]">
          Qatnashuvchilar: <span className="text-accent">64 a'zo</span>
        </div>
      </Panel>
    </div>
  );
}