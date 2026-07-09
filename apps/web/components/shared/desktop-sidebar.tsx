"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import ThemeToggle from "./theme-toggle";

const DESKTOP_NAV: Record<"gym_owner" | "trainer" | "superadmin", { id: string; icon: string; label: string; href: string }[]> = {
  gym_owner: [
    { id: "dashboard", icon: "📊", label: "Dashboard", href: "/gym" }, 
    { id: "members", icon: "👥", label: "A'zolar", href: "/gym/members" },
    { id: "analytics", icon: "📈", label: "Analytics", href: "/gym/analytics" }, 
    { id: "challenge", icon: "🎯", label: "Challenge", href: "/gym/challenge" },
    { id: "copilot", icon: "🤖", label: "AI Copilot", href: "/gym/copilot" }, 
    { id: "messages", icon: "📣", label: "Xabar yuborish", href: "/gym/messages" },
    { id: "settings", icon: "⚙️", label: "Sozlamalar", href: "/gym/settings" },
  ],
  trainer: [
    { id: "today", icon: "📅", label: "Bugun", href: "/trainer" }, 
    { id: "clients", icon: "👥", label: "Mijozlarim", href: "/trainer/clients" },
    { id: "schedule", icon: "🗓️", label: "Jadval", href: "/trainer/schedule" }, 
    { id: "analytics", icon: "📈", label: "Analytics", href: "/trainer/analytics" },
    { id: "copilot", icon: "🤖", label: "AI Copilot", href: "/trainer/copilot" }, 
    { id: "settings", icon: "⚙️", label: "Sozlamalar", href: "/trainer/settings" },
  ],
  superadmin: [
    { id: "overview", icon: "📊", label: "Platforma", href: "/admin" }, 
    { id: "gyms", icon: "🏢", label: "Zallar", href: "/admin/gyms" },
    { id: "billing", icon: "💳", label: "Billing", href: "/admin/billing" }, 
    { id: "aiusage", icon: "🧠", label: "AI Usage", href: "/admin/ai-usage" },
    { id: "copilot", icon: "🤖", label: "AI Copilot", href: "/admin/copilot" }, 
    { id: "settings", icon: "⚙️", label: "Sozlamalar", href: "/admin/settings" },
  ],
};

const PLAN_CARD: Record<"gym_owner" | "trainer" | "superadmin", { label: string; value: string }> = {
  gym_owner: { label: "JORIY REJA", value: "Pro · $69/oy" },
  trainer: { label: "DARAJA", value: "👑 Daraja 4 · Professional" },
  superadmin: { label: "PLATFORMA", value: "412 gym · $18.4k MRR" },
};

export function DesktopSidebar({ role }: { role: "gym_owner" | "trainer" | "superadmin" }) {
  const pathname = usePathname();
  const nav = DESKTOP_NAV[role];
  const plan = PLAN_CARD[role];

  const { data: churnRes } = useQuery({
    queryKey: ["gym", "churnRisk"],
    queryFn: () => api.gym.churnRisk(),
    refetchInterval: 30000,
    enabled: role === "gym_owner",
  });
  const churnCount = churnRes?.data?.count || churnRes?.data?.at_risk_members?.length || 0;

  return (
    <aside className="w-[220px] bg-sidebar border-r border-border p-5 flex flex-col shrink-0 min-h-screen">
      <div className="flex items-center gap-2.5 mb-5 px-1">
        <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center font-display font-black text-bg text-[13px]">V</div>
        <span className="font-display font-bold text-[14px] text-vtext">VitaForge</span>
      </div>
      <div className="font-mono text-[9px] tracking-widest text-muted mb-4 px-1 uppercase">{role}</div>
      <nav className="flex flex-col gap-0.5">
        {nav.map((item) => {
          const active = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/gym" && item.href !== "/trainer" && item.href !== "/admin");
          return (
            <Link key={item.id} href={item.href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${active ? "text-accent bg-[var(--accent-dim)] font-medium" : "text-muted hover:text-vtext hover:bg-surface2"}`}>
              <span className="w-4 text-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.id === "members" && role === "gym_owner" && churnCount > 0 && (
                <span className="bg-vred text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                  {churnCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="flex-1" />
      <div className="h-[1px] bg-[var(--surface3)] my-3.5" />
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs text-muted font-medium">Rejim</span>
        <ThemeToggle />
      </div>
      <div className="bg-surface2 border border-border rounded-[10px] p-3">
        <div className="font-mono text-[9px] text-muted tracking-widest mb-1">{plan.label}</div>
        <div className="text-[12px] font-semibold text-accent">{plan.value}</div>
      </div>
    </aside>
  );
}
