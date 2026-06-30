"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, UtensilsCrossed, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "home", label: "Bosh", icon: Home, href: "/dashboard" },
  { id: "plan", label: "Plan", icon: Dumbbell, href: "/dashboard/plan" },
  { id: "food", label: "Ovqat", icon: UtensilsCrossed, href: "/dashboard/food" },
  { id: "top", label: "Top", icon: Trophy, href: "/dashboard/top" },
  { id: "profile", label: "Profil", icon: User, href: "/dashboard/profile" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1a1a26] bg-[rgba(13,13,22,0.97)] backdrop-blur-xl safe-bottom">
      <div className="flex">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center py-2 pb-2.5 transition-colors duration-150",
                isActive ? "text-accent" : "text-muted"
              )}
            >
              <tab.icon size={18} strokeWidth={2} />
              <span className="text-[8px] mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
