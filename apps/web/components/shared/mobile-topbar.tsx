"use client";
import { LogOut } from "lucide-react";
import ThemeToggle from "./theme-toggle";

export function MobileTopBar({ onAction }: { onAction: () => void }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-1.5 pb-2.5 shrink-0 bg-bg border-b border-border">
      <div className="flex items-center gap-1.5">
        <div className="w-[18px] h-[18px] bg-accent rounded-[5px] flex items-center justify-center font-display font-black text-[9px] text-bg">V</div>
        <span className="font-display font-bold text-[11px] text-vtext">VitaForge</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button 
          onClick={onAction} 
          className="bg-[var(--accent-dim)] border border-[var(--accent-border)] rounded-[9px] w-[30px] h-[30px] flex items-center justify-center text-[14px] cursor-pointer relative"
        >
          🤖<span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>
      </div>
    </div>
  );
}
