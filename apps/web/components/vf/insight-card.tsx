import { cn } from "@/lib/utils";

interface InsightCardProps {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  warn?: boolean;
  className?: string;
}

export default function InsightCard({ title, body, action, onAction, warn, className }: InsightCardProps) {
  return (
    <div
      className={cn(
        "bg-surface2 border border-border rounded-xl p-3.5",
        warn ? "border-l-2 border-l-vred" : "border-l-2 border-l-accent",
        className
      )}
    >
      <div className="text-[12px] font-semibold text-vtext mb-1">{title}</div>
      <div className="text-[11px] text-[#9999ad] leading-relaxed mb-2">{body}</div>
      {action && (
        <button
          onClick={onAction}
          className="font-mono text-[10px] text-accent tracking-wider hover:underline cursor-pointer"
        >
          {action}
        </button>
      )}
    </div>
  );
}
