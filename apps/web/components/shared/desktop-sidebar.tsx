"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BarChart3, Target, Bot, MessageSquare,
  Settings, Calendar, CalendarDays, Shield, Building, CreditCard, Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard, members: Users, analytics: BarChart3,
  challenge: Target, copilot: Bot, messages: MessageSquare,
  settings: Settings, today: Calendar, clients: Users,
  schedule: CalendarDays, overview: LayoutDashboard, gyms: Building,
  billing: CreditCard, aiusage: Brain,
};

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const NAV: Record<string, { label: string; plan: { label: string; name: string }; items: NavItem[] }> = {
  gym_owner: {
    label: "GYM OWNER",
    plan: { label: "JORIY REJA", name: "Pro · $69/oy" },
    items: [
      { id: "dashboard", label: "Dashboard", href: "/gym" },
      { id: "members", label: "A'zolar", href: "/gym/members" },
      { id: "analytics", label: "Analytics", href: "/gym/analytics" },
      { id: "challenge", label: "Challenge", href: "/gym/challenge" },
      { id: "copilot", label: "AI Copilot", href: "/gym/copilot" },
      { id: "messages", label: "Xabar yuborish", href: "/gym/messages" },
      { id: "settings", label: "Sozlamalar", href: "/gym/settings" },
    ],
  },
  trainer: {
    label: "TRAINER",
    plan: { label: "DARAJA", name: "👑 Daraja 4 · Professional" },
    items: [
      { id: "today", label: "Bugun", href: "/trainer" },
      { id: "clients", label: "Mijozlarim", href: "/trainer/clients" },
      { id: "schedule", label: "Jadval", href: "/trainer/schedule" },
      { id: "analytics", label: "Analytics", href: "/trainer/analytics" },
      { id: "copilot", label: "AI Copilot", href: "/trainer/copilot" },
      { id: "settings", label: "Sozlamalar", href: "/trainer/settings" },
    ],
  },
  superadmin: {
    label: "SUPER ADMIN",
    plan: { label: "PLATFORMA", name: "412 gym · $18.4k MRR" },
    items: [
      { id: "overview", label: "Platforma", href: "/admin" },
      { id: "gyms", label: "Zallar", href: "/admin/gyms" },
      { id: "billing", label: "Billing", href: "/admin/billing" },
      { id: "aiusage", label: "AI Usage", href: "/admin/ai-usage" },
      { id: "copilot", label: "AI Copilot", href: "/admin/copilot" },
      { id: "settings", label: "Sozlamalar", href: "/admin/settings" },
    ],
  },
};

export default function DesktopSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const config = NAV[role] ?? NAV.gym_owner;

  return (
    <aside className="w-[220px] bg-[#0a0a12] border-r border-border flex flex-col px-4 py-5 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div className="w-7 h-7 bg-accent rounded-[7px] flex items-center justify-center font-display font-black text-[13px] text-bg">
          V
        </div>
        <span className="font-display font-bold text-[14px] text-vtext">VitaForge</span>
      </div>

      {/* Role badge */}
      <div className="font-mono text-[9px] tracking-widest text-muted mb-4 px-1">
        {config.label}
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {config.items.map((item) => {
          const Icon = ICON_MAP[item.id] || LayoutDashboard;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150",
                isActive
                  ? "bg-[rgba(232,255,71,0.08)] text-accent font-medium"
                  : "text-[#8888a0] hover:bg-surface2 hover:text-[#c8c8d8]"
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-[#1a1a26] my-3.5" />

      {/* Plan card */}
      <div className="bg-surface2 border border-border rounded-[10px] p-3">
        <div className="font-mono text-[9px] text-muted tracking-widest mb-1">
          {config.plan.label}
        </div>
        <div className="text-[12px] font-semibold text-accent">{config.plan.name}</div>
      </div>
    </aside>
  );
}
