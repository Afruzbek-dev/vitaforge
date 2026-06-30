"use client";

import { useAiCopilot } from "./ai-context";

export default function DashboardHome() {
  const { openAi } = useAiCopilot();

  return (
    <div className="animate-fadeIn pb-4">
      <div className="flex items-center justify-between pt-[4px]">
        <div>
          <div className="font-mono text-[8px] tracking-[1px] text-muted mb-[5px]">XUSH KELIBSIZ</div>
          <h1 className="font-display font-bold text-[17px] leading-[1.2]">Salom, Jasur 👋</h1>
        </div>
        <button 
          onClick={openAi}
          className="w-[30px] h-[30px] rounded-[10px] bg-[rgba(232,255,71,0.12)] border border-[rgba(232,255,71,0.3)] flex items-center justify-center text-[14px] cursor-pointer shrink-0"
        >
          🤖
        </button>
      </div>
      
      <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-[16px] text-center mt-[8px]">
        <div className="text-[11px] text-[#E8FF47] mb-[6px] font-mono tracking-tight">BUGUN HALI CHECKIN QILMADINGIZ</div>
        <button className="w-full bg-[#E8FF47] text-[#080810] font-body font-semibold text-[13px] py-[13px] rounded-[12px] shadow-[0_0_18px_rgba(232,255,71,0.25)]">
          📍 Gym ga keldim
        </button>
      </div>

      <div className="m-card mt-[9px]">
        <div className="flex justify-between items-center mb-[8px]">
          <span className="font-mono text-[8px] tracking-[1px] text-muted m-0">BUGUNGI KALORIYA</span>
          <span className="font-mono text-[11px]">
            <b className="text-[#E8FF47]">340</b>
            <span className="text-muted"> / 1840</span>
          </span>
        </div>
        <div className="h-[6px] bg-[#1a1a26] rounded-[4px] overflow-hidden">
          <div className="h-full bg-[#E8FF47] rounded-[4px]" style={{ width: "18%" }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[8px] mt-[9px]">
        <div className="bg-surface border border-border rounded-[12px] py-[12px] px-[10px] flex flex-col items-center gap-[5px] cursor-pointer">
          <span className="text-[18px]">🥗</span>
          <span className="text-[10px] text-[#c8c8d8] text-center font-medium">Ovqat qo'shish</span>
        </div>
        <div className="bg-surface border border-border rounded-[12px] py-[12px] px-[10px] flex flex-col items-center gap-[5px] cursor-pointer">
          <span className="text-[18px]">📸</span>
          <span className="text-[10px] text-[#c8c8d8] text-center font-medium">Foto yuklash</span>
        </div>
      </div>

      <div 
        onClick={openAi}
        className="bg-surface border border-border border-l-2 border-l-[#E8FF47] rounded-[13px] p-[13px] mt-[9px] cursor-pointer"
      >
        <div className="text-[10px] text-[#E8FF47] font-mono mb-[4px]">🤖 AI TAVSIYASI</div>
        <div className="text-[11px] text-[#c8c8d8] leading-[1.5]">
          Kecha protein normangizdan 22g kam yedingiz. Bugun tushlikka tuxum yoki tovuq ko'shing — Coach Aziz ham shu haqida yozgan edi.
        </div>
      </div>
    </div>
  );
}
