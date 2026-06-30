"use client";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaDown?: boolean;
  warn?: boolean;
}

export default function KpiCard({ label, value, delta, deltaDown, warn }: KpiCardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl px-5 py-4 ${
        warn ? "border-l-2 border-l-vred" : "border-l-2 border-l-accent"
      }`}
    >
      <div className="font-mono text-[10px] tracking-widest text-muted mb-2 uppercase">
        {label}
      </div>
      <div className="font-display font-bold text-[22px] text-vtext">{value}</div>
      {delta && (
        <div
          className={`text-[11px] font-mono mt-1 ${
            deltaDown ? "text-vred" : "text-vgreen"
          }`}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
