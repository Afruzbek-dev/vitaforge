"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { RowBetween } from "./layout-utils";
import { ProgressBar } from "./progress-bar";

export interface Badge { id: string; icon: string; label: string; unlocked: boolean; hint?: string; }
export interface Level { num: number; title: string; icon: string; xp: number; xpMin: number; xpMax: number; }
export interface StreakData { current: number; longest: number; label: string; week?: boolean[]; }
export interface TimeSeriesPoint { label: string; value: number; }

const DAY_LABELS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

export function WeekDots({ week, className }: { week: boolean[]; className?: string }) {
  return (
    <div className={cn("flex gap-[5px] justify-between mt-[10px]", className)}>
      {week.map((done, i) => (
        <div key={i} className={cn(
          "w-[26px] h-[26px] rounded-full flex items-center justify-center text-[8px] font-mono shrink-0",
          done ? "bg-accent text-bg font-bold" : "bg-surface3 text-muted font-normal",
          i === week.length - 1 && !done ? "shadow-[0_0_0_2px_rgba(232,255,71,0.4)]" : ""
        )}>
          {DAY_LABELS[i]}
        </div>
      ))}
    </div>
  );
}

export function StreakCard({ data, className }: { data: StreakData; className?: string }) {
  return (
    <div className={cn("bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.30)] rounded-[13px] px-[16px] py-[14px] mb-[10px]", className)}>
      <RowBetween>
        <div className="flex items-center gap-2">
          <span className="text-[22px]">🔥</span>
          <div>
            <div className="font-display font-bold text-[16px] text-vtext">{data.current}</div>
            <div className="text-[9px] text-[var(--muted)] opacity-70 mt-[1px]">{data.label}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] text-accent">REKORD</div>
          <div className="text-[13px] font-semibold text-vtext">{data.longest}</div>
        </div>
      </RowBetween>
      {data.week && <WeekDots week={data.week} />}
    </div>
  );
}

export function LevelBar({ level, className }: { level: Level; className?: string }) {
  const pct = Math.round(((level.xp - level.xpMin) / (level.xpMax - level.xpMin)) * 100);
  return (
    <div className={cn("bg-surface border border-border rounded-[13px] px-[14px] py-[12px] mb-[10px]", className)}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[18px]">{level.icon}</span>
        <div>
          <div className="font-display font-semibold text-[12px] text-vtext">Daraja {level.num} · {level.title}</div>
          <div className="text-[10px] text-muted font-mono">{level.xp} / {level.xpMax} XP</div>
        </div>
      </div>
      <ProgressBar value={pct} />
    </div>
  );
}

export function BadgeGrid({ badges, columns = 4, className }: { badges: Badge[]; columns?: number; className?: string }) {
  return (
    <div 
      className={cn("grid gap-2 my-2", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {badges.map((badge) => (
        <div key={badge.id} title={badge.unlocked ? "Ochilgan" : badge.hint ?? "Qulflangan"} className={cn(
          "bg-surface2 border border-border rounded-xl pt-[10px] pb-[8px] px-1 flex flex-col items-center gap-[3px] text-center",
          badge.unlocked ? "opacity-100" : "opacity-40 grayscale"
        )}>
          <span className="text-[18px]">{badge.unlocked ? badge.icon : "🔒"}</span>
          <span className="text-[9px] text-muted leading-[1.3]">{badge.label}</span>
          {!badge.unlocked && badge.hint && <span className="text-[8px] text-muted font-mono">{badge.hint}</span>}
        </div>
      ))}
    </div>
  );
}

export function StreakHistogram({ data, className }: { data: TimeSeriesPoint[]; className?: string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className={className}>
      <div className="flex items-end gap-[6px] h-[90px]">
        {data.map((d, i) => (
          <div key={i} className={cn(
            "flex-1 rounded-t-[3px] min-h-[4px]",
            d.value === max ? "bg-accent" : "bg-surface3"
          )} style={{ height: `${max > 0 ? (d.value / max) * 100 : 0}%` }} />
        ))}
      </div>
      <div className="flex gap-[6px] mt-[6px]">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[8px] text-muted font-mono">{d.label}</div>
        ))}
      </div>
    </div>
  );
}
