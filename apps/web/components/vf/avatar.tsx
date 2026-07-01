"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ initials, size = "sm", className }: { initials: string; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <div
      className={cn(
        "bg-[rgba(232,255,71,0.12)] text-accent inline-flex items-center justify-center font-display font-bold shrink-0",
        size === "lg" ? "w-12 h-12 rounded-[14px] text-[17px]" :
        size === "md" ? "w-9 h-9 rounded-lg text-[14px]" :
        "w-[26px] h-[26px] rounded-lg text-[11px]",
        className
      )}
    >
      {initials}
    </div>
  );
}
