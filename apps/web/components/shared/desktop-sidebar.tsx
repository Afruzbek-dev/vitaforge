"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  id: string;
  icon: string;
  label: string;
  url: string;
}

interface RoleConfig {
  label: string;
  icon: string;
  plan: { label: string; name: string };
  nav: NavItem[];
}

const ROLES: Record<string, RoleConfig> = {
  owner: {
    label: "Gym Owner",
    icon: "🏢",
    plan: { label: "JORIY REJA", name: "Pro · $69/oy" },
    nav: [
      { id: "dashboard", icon: "📊", label: "Dashboard", url: "/gym" },
      { id: "members", icon: "👥", label: "A'zolar", url: "/gym/members" },
      { id: "analytics", icon: "📈", label: "Analytics", url: "/gym/analytics" },
      { id: "challenge", icon: "🎯", label: "Challenge", url: "/gym/challenge" },
      { id: "copilot", icon: "🤖", label: "AI Copilot", url: "/gym/copilot" },
      { id: "messages", icon: "📣", label: "Xabar yuborish", url: "/gym/messages" },
      { id: "settings", icon: "⚙️", label: "Sozlamalar", url: "/gym/settings" },
    ],
  },
  trainer: {
    label: "Trainer",
    icon: "🏋️",
    plan: { label: "DARAJA", name: "👑 Daraja 4 · Professional" },
    nav: [
      { id: "today", icon: "📅", label: "Bugun", url: "/gym/trainer" },
      { id: "clients", icon: "👥", label: "Mijozlarim", url: "/gym/trainer/clients" },
      { id: "schedule", icon: "🗓️", label: "Jadval", url: "/gym/trainer/schedule" },
      { id: "analytics", icon: "📈", label: "Analytics", url: "/gym/trainer/analytics" },
      { id: "copilot", icon: "🤖", label: "AI Copilot", url: "/gym/trainer/copilot" },
      { id: "settings", icon: "⚙️", label: "Sozlamalar", url: "/gym/trainer/settings" },
    ],
  },
  superadmin: {
    label: "Super Admin",
    icon: "🛡️",
    plan: { label: "PLATFORMA", name: "412 gym · $18.4k MRR" },
    nav: [
      { id: "overview", icon: "📊", label: "Platforma", url: "/admin/overview" },
      { id: "gyms", icon: "🏢", label: "Zallar", url: "/admin/gyms" },
      { id: "billing", icon: "💳", label: "Billing", url: "/admin/billing" },
      { id: "aiusage", icon: "🧠", label: "AI Usage", url: "/admin/ai-usage" },
      { id: "copilot", icon: "🤖", label: "AI Copilot", url: "/admin/copilot" },
      { id: "settings", icon: "⚙️", label: "Sozlamalar", url: "/admin/settings" },
    ],
  },
};

export default function DesktopSidebar({
  role = "owner",
}: {
  role?: "owner" | "trainer" | "superadmin";
}) {
  const pathname = usePathname();
  const config = ROLES[role];

  return (
    <div className="w-[220px] bg-[#0a0a12] border-r border-border p-5 flex-shrink-0 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center font-display font-black text-[#080810] text-sm">
          V
        </div>
        <div className="font-display font-bold text-sm text-[#EEEEE8]">VitaForge</div>
      </div>
      
      <div className="font-mono text-[9px] tracking-[1px] text-[#52526a] mb-4 px-1 uppercase">
        {config.label}
      </div>
      
      <div className="flex flex-col gap-0.5 flex-1">
        {config.nav.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.id}
              href={item.url}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors select-none ${
                isActive
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-[#8888a0] hover:bg-[#13131c] hover:text-[#c8c8d8]"
              }`}
            >
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
      
      <div className="h-px bg-[#1a1a26] my-3.5"></div>
      
      <div className="bg-[#13131c] border border-border rounded-[10px] p-3 mt-2">
        <div className="font-mono text-[9px] text-[#52526a] tracking-[1px] mb-1">
          {config.plan.label}
        </div>
        <div className="text-xs font-semibold text-accent">{config.plan.name}</div>
      </div>
    </div>
  );
}
