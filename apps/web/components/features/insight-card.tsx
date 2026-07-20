"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type InsightTone = "default" | "warn" | "good";

export interface AiInsight {
  id: string;
  tone: InsightTone;
  title: string;
  body: string;
  actionLabel: string;
  onAction?: () => void;
}

export function InsightCard(props: { 
  insight?: AiInsight; 
  className?: string;
  warn?: boolean;
  title?: string;
  body?: string;
  action?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const tone = props.insight?.tone ?? (props.warn ? "warn" : "default");
  const title = props.insight?.title ?? props.title ?? "";
  const body = props.insight?.body ?? props.body ?? "";
  const actionLabel = props.insight?.actionLabel ?? props.action ?? props.actionLabel ?? "BATAFSIL";
  const onAction = props.insight?.onAction ?? props.onAction;

  return (
    <div
      className={cn(
        "bg-surface border border-border border-l-2 rounded-xl p-[14px] mb-[10px]",
        tone === "warn" ? "border-l-vred" : tone === "good" ? "border-l-vgreen" : "border-l-accent",
        props.className
      )}
    >
      <div className="text-[12px] font-semibold text-vtext mb-1">{title}</div>
      <div className="text-[11px] text-muted leading-[1.6] mb-2">{body}</div>
      <button
        onClick={onAction}
        className="bg-transparent border-none font-mono text-[10px] text-accent cursor-pointer tracking-[0.5px] p-0"
      >
        {actionLabel}
      </button>
    </div>
  );
}
