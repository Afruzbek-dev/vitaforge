"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function ProgressBar({ value, height = 6, className }: { value: number; height?: number; className?: string }) {
  return (
    <div
      className={cn("bg-surface2 rounded overflow-hidden", className)}
      style={{ height }}
    >
      <div
        className="h-full bg-accent rounded transition-[width] duration-400 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
