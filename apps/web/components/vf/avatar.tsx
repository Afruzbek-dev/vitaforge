import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  size?: "sm" | "lg";
  className?: string;
}

export default function Avatar({ initials, size = "sm", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "bg-[rgba(232,255,71,0.12)] text-accent font-display font-bold flex items-center justify-center shrink-0",
        size === "sm" && "w-[26px] h-[26px] rounded-lg text-[11px]",
        size === "lg" && "w-12 h-12 rounded-[14px] text-[17px]",
        className
      )}
    >
      {initials}
    </div>
  );
}
