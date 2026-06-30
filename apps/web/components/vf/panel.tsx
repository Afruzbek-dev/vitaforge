import { cn } from "@/lib/utils";

interface PanelProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Panel({ title, action, children, className }: PanelProps) {
  return (
    <div className={cn("bg-surface border border-border rounded-[14px] px-5 py-[18px]", className)}>
      {title && (
        <div className="font-mono text-[10px] tracking-widest text-muted mb-3.5 flex justify-between items-center uppercase">
          <span>{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
