"use client";

import { useState } from "react";
import { MobileNav } from "@/components/shared/mobile-nav";
import { AICopilotSheet } from "@/components/shared/ai-copilot-sheet";
import { AICopilotContext } from "./ai-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <AICopilotContext.Provider value={{ openAi: () => setIsAiOpen(true) }}>
      <div className="flex flex-col h-[100dvh] bg-bg overflow-hidden relative text-white">
        <div className="flex items-center justify-between px-[14px] pt-[6px] pb-[10px] shrink-0">
          <div className="flex items-center gap-[6px]">
            <div className="w-[18px] h-[18px] bg-[#E8FF47] rounded-[5px] flex items-center justify-center font-display font-black text-[9px] text-[#080810]">
              V
            </div>
            <div className="font-display font-bold text-[11px]">VitaForge</div>
          </div>
          <button
            className="text-[14px] relative"
            onClick={() => setIsAiOpen(true)}
          >
            ⚙️
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-[14px] no-scrollbar">
          {children}
        </div>

        <MobileNav />
        <AICopilotSheet isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      </div>
    </AICopilotContext.Provider>
  );
}
