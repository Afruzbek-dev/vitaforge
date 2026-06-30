"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { id: "/dashboard", icon: "🏠", label: "Bosh" },
    { id: "/dashboard/plan", icon: "💪", label: "Plan" },
    { id: "/dashboard/food", icon: "🥗", label: "Ovqat" },
    { id: "/dashboard/top", icon: "🏆", label: "Top" },
    { id: "/dashboard/profile", icon: "👤", label: "Profil" },
  ];

  return (
    <div className="flex border-t border-border bg-surface bg-opacity-95 backdrop-blur shrink-0 safe-bottom">
      {tabs.map((t) => {
        const isActive = pathname === t.id;
        return (
          <Link
            href={t.id}
            key={t.id}
            className={`flex-1 flex flex-col items-center gap-[2px] pt-[8px] pb-[10px] text-[8px] select-none transition-colors duration-150 ${
              isActive ? "text-[#E8FF47]" : "text-muted hover:text-[#c8c8d8]"
            }`}
          >
            <span className="text-[16px] leading-none mb-[2px]">{t.icon}</span>
            <span className="font-display font-medium tracking-tight">{t.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
