"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Panel({ title, children, action, className }: { title?: React.ReactNode; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-surface border border-border rounded-[14px] px-[20px] py-[18px]", className)}>
      {title && (
        <div className="flex justify-between items-center font-mono text-[10px] text-muted tracking-[1px] mb-[14px]">
          <span>{title}</span>
          {action && <span className="cursor-pointer text-accent">{action}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
