import { cn } from "@/lib/utils";

type PillVariant = "ok" | "risk" | "new" | "mid";

const variants: Record<PillVariant, string> = {
  ok: "bg-[rgba(93,202,165,0.12)] text-[#5DCAA5]",
  risk: "bg-[rgba(255,107,107,0.12)] text-[#FF6B6B]",
  new: "bg-[rgba(56,142,222,0.12)] text-[#7BB6E8]",
  mid: "bg-[rgba(232,197,71,0.12)] text-[#E8C547]",
};

interface PillProps {
  variant: PillVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Pill({ variant, children, className }: PillProps) {
  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-[10px] font-mono inline-block",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
