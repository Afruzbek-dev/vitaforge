"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface KpiCardData {
  label: string;
  value: string;
  delta?: string;
  tone?: "default" | "warn" | "good";
  warn?: boolean;
}

export function KpiCard({ label, value, delta, tone, warn, className }: KpiCardData & { className?: string }) {
  const finalTone = tone ?? (warn ? "warn" : "default");

  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl px-[18px] py-[16px] border-l-2",
        finalTone === "warn" ? "border-l-vred" : "border-l-accent",
        className
      )}
    >
      <div className="font-mono text-[10px] text-muted tracking-[1px] mb-2">{label}</div>
      <div className="font-display font-bold text-[22px] text-vtext">{value}</div>
      {delta && (
        <div
          className={cn(
            "font-mono text-[11px] mt-1",
            delta.startsWith("↑") ? "text-vgreen" : delta.startsWith("↓") ? "text-vred" : "text-muted"
          )}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
