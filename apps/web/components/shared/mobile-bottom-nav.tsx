"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MOBILE_NAV = [
  { id: "home", icon: "🏠", label: "Bosh", href: "/dashboard" }, 
  { id: "plan", icon: "💪", label: "Plan", href: "/dashboard/plan" },
  { id: "food", icon: "🥗", label: "Ovqat", href: "/dashboard/food" }, 
  { id: "top", icon: "🏆", label: "Top", href: "/dashboard/top" },
  { id: "profile", icon: "👤", label: "Profil", href: "/dashboard/profile" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  
  return (
    <nav className="flex border-t border-[var(--surface3)] bg-[rgba(13,13,22,0.97)] backdrop-blur-md shrink-0 pb-safe">
      {MOBILE_NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.id} href={item.href} className="flex-1 flex flex-col items-center gap-0.5 py-2 pb-2.5 text-[8px] cursor-pointer transition-colors" style={{ color: active ? 'var(--accent)' : 'var(--muted)' }}>
            <span className="text-[16px]">{item.icon}</span>{item.label}
          </Link>
        );
      })}
    </nav>
  );
}
