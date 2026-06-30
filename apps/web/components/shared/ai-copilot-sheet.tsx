"use client";

import { useState } from "react";

export function AICopilotSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/55 z-40 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={`fixed left-0 right-0 bottom-0 max-h-[88%] bg-[#0b0b13] border-t border-border rounded-t-[22px] z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="w-[36px] h-[4px] bg-[#2a2a3a] rounded-[3px] mx-auto mt-[10px] mb-[6px] shrink-0" />
        <div className="flex items-center justify-between px-4 pb-[10px] pt-1 shrink-0">
          <span className="font-display font-semibold text-[12px]">AI Trener</span>
          <button onClick={onClose} className="text-[14px] text-[#8888a0]">
            ✕
          </button>
        </div>
        <div className="px-4 pb-4 overflow-y-auto">
          <div className="flex items-center gap-2 pb-[10px]">
            <div className="w-6 h-6 rounded-full bg-[rgba(232,255,71,0.12)] flex items-center justify-center text-[13px]">
              🤖
            </div>
            <div>
              <div className="text-[11px] font-semibold">AI Trener</div>
              <div className="text-[8px] text-[#5DCAA5]">● online</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="self-start max-w-[80%] bg-[#13131c] border border-border rounded-[12px_12px_12px_4px] py-[9px] px-[12px] text-[11px] leading-[1.4]">
              Salom! Bugun nima haqida yordam bera olaman?
            </div>
            <div className="self-end max-w-[80%] bg-[#E8FF47] text-[#080810] rounded-[12px_12px_4px_12px] py-[9px] px-[12px] text-[11px] font-medium">
              Osh necha kaloriya?
            </div>
            <div className="self-start max-w-[85%] bg-[#13131c] border border-border rounded-[12px_12px_12px_4px] py-[9px] px-[12px] text-[11px] leading-[1.4]">
              O'rtacha porsiya osh (300g) — taxminan <b className="text-[#E8FF47]">540 kcal</b>. Kunlik normangizning 30% i.
            </div>
          </div>
          <div className="flex gap-[6px] mt-[10px]">
            <input
              type="text"
              placeholder="Xabar yozing..."
              className="flex-1 bg-[#13131c] border border-border rounded-[10px] py-[8px] px-[10px] text-[11px] text-[#EEEEE8] outline-none placeholder:text-muted"
            />
            <button className="w-[32px] h-[32px] bg-[#E8FF47] text-[#080810] rounded-[10px] font-semibold text-[14px] flex items-center justify-center shrink-0">
              ↑
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
