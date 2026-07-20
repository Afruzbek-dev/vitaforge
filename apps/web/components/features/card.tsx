"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  warn?: boolean;
}

export function Card({ children, accent, warn, className, onClick, ...props }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[14px] px-4 py-[14px] mb-[10px] border transition-all",
        onClick ? "cursor-pointer" : "",
        !accent && !warn && "bg-surface border-border",
        accent && "bg-[var(--accent-dim)] border-[var(--accent-border)]",
        warn && "bg-[rgba(226,75,74,0.05)] border-[rgba(226,75,74,0.30)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function MobileCard({ children, accent, warn, className, onClick, ...props }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[13px] px-[14px] py-[13px] mb-[9px] border transition-all",
        onClick ? "cursor-pointer" : "",
        !accent && !warn && "bg-surface border-border",
        accent && "bg-[var(--accent-dim)] border-[var(--accent-border)]",
        warn && "bg-[rgba(226,75,74,0.05)] border-[rgba(226,75,74,0.30)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
