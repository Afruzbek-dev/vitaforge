import { cn } from "@/lib/utils";

interface ChartBarsProps {
  data: { value: number; label: string; peak?: boolean }[];
  height?: number;
  className?: string;
}

export default function ChartBars({ data, height = 110, className }: ChartBarsProps) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className={cn("", className)}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-t",
              d.peak ? "bg-accent" : "bg-[#1a1a26]"
            )}
            style={{ height: `${(d.value / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[9px] text-muted font-mono">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
