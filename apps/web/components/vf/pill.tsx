"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type PillTone = "good" | "bad" | "mid" | "info" | "accent";

export function Pill({ 
  label, 
  tone, 
  className,
  children,
  variant 
}: { 
  label?: React.ReactNode; 
  tone?: PillTone; 
  className?: string;
  children?: React.ReactNode;
  variant?: string;
}) {
  const finalTone = tone ?? (variant ? statusTone(variant) : "good");
  const content = children ?? label;

  return (
    <span
      className={cn(
        "text-[10px] font-mono px-[10px] py-[3px] rounded-full inline-block whitespace-nowrap",
        finalTone === "good" && "text-[#5DCAA5] bg-[rgba(93,202,165,0.12)]",
        finalTone === "bad" && "text-[#E24B4A] bg-[rgba(226,75,74,0.12)]",
        finalTone === "mid" && "text-[#E8C547] bg-[rgba(232,197,71,0.12)]",
        finalTone === "info" && "text-[#7BB6E8] bg-[rgba(56,142,222,0.12)]",
        finalTone === "accent" && "text-bg bg-accent",
        className
      )}
    >
      {content}
    </span>
  );
}

export function statusTone(status: string): PillTone {
  if (status === "active" || status === "ok" || status === "Faol") return "good";
  if (status === "risk" || status === "Risk") return "bad";
  if (status === "new" || status === "Yangi") return "info";
  return "mid";
}
