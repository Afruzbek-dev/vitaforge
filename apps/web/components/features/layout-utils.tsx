"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function RowBetween({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex justify-between items-center", className)}>
      {children}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-[1px] bg-surface3 my-[14px]", className)} />;
}

export function RiskRow({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between py-[9px] border-b border-surface3 text-[12px] text-vtext",
        onClick ? "cursor-pointer" : "",
        className
      )}
    >
      {children}
    </div>
  );
}

export function MonoLabel({ children, color, className }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <div 
      className={cn("font-mono text-[10px] tracking-[1.5px] mb-[6px]", !color && "text-muted", className)}
      style={color ? { color } : undefined}
    >
      {children}
    </div>
  );
}
