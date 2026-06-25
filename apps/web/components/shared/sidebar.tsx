"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { LayoutDashboard, Users, Wallet, BarChart3, Trophy, Megaphone, Package, Download, Settings, LogOut, Dumbbell, Utensils, Bot, Camera, Mail, CalendarCheck, Target, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const memberLinks = [
  { group: "ASOSIY", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/today", label: "Bugun", icon: CalendarCheck },
    { href: "/dashboard/plan", label: "Plan", icon: Dumbbell },
  ]},
  { group: "KUZATUV", items: [
    { href: "/dashboard/food", label: "Ovqat", icon: Utensils },
    { href: "/dashboard/chat", label: "AI Coach", icon: Bot },
    { href: "/dashboard/photos", label: "Progress", icon: Camera },
  ]},
  { group: "BOSHQA", items: [
    { href: "/dashboard/challenges", label: "Challenge", icon: Target },
    { href: "/dashboard/invitations", label: "Takliflar", icon: Mail },
    { href: "/dashboard/settings", label: "Sozlamalar", icon: Settings },
  ]},
];

const ownerLinks = [
  { group: "KUNDALIK ISH", items: [
    { href: "/gym", label: "Dashboard", icon: LayoutDashboard },
    { href: "/gym/members", label: "A'zolar", icon: Users },
    { href: "/gym/finance", label: "Moliya", icon: Wallet },
  ]},
  { group: "BOSHQARISH", items: [
    { href: "/gym/analytics", label: "Analitika", icon: BarChart3 },
    { href: "/gym/leaderboard", label: "Reyting", icon: Trophy },
    { href: "/gym/challenges", label: "Challenge", icon: Target },
    { href: "/gym/notify", label: "Xabar", icon: Megaphone },
  ]},
  { group: "SOZLASH", items: [
    { href: "/gym/inventory", label: "Inventar", icon: Package },
    { href: "/gym/import", label: "Import", icon: Download },
    { href: "/gym/settings", label: "Sozlamalar", icon: Settings },
  ]},
];

const trainerLinks = [
  { group: "ISH", items: [
    { href: "/gym", label: "Dashboard", icon: LayoutDashboard },
    { href: "/gym/trainer", label: "A'zolarim", icon: Users },
    { href: "/gym/leaderboard", label: "Reyting", icon: Trophy },
  ]},
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { theme, toggle } = useTheme();
  const groups = role === "member" ? memberLinks : role === "trainer" ? trainerLinks : ownerLinks;

  const logout = () => { localStorage.removeItem("access_token"); localStorage.removeItem("zenfit_user"); clearAuth(); router.push("/login"); };

  return (
    <aside className="w-[220px] bg-[#0a0a12] border-r border-border flex flex-col py-5 px-3 shrink-0 min-h-screen">
      <div className="flex items-center gap-2.5 px-2.5 mb-4">
        <div className="w-7 h-7 rounded-[7px] bg-accent flex items-center justify-center font-display font-bold text-[13px] text-bg">V</div>
        <span className="font-display font-bold text-[14px] text-vtext">VitaForge</span>
      </div>

      <nav className="flex-1 space-y-1">
        {groups.map((g) => (
          <div key={g.group}>
            <p className="font-mono text-[9px] tracking-[2px] text-muted px-2.5 mt-4 mb-2">{g.group}</p>
            {g.items.map((l) => {
              const active = pathname === l.href;
              const Icon = l.icon;
              return (
                <Link key={l.href} href={l.href}
                  className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-[13px] mb-[1px] transition-colors ${
                    active
                      ? "bg-accent/[0.09] text-accent font-medium"
                      : "text-muted hover:bg-card hover:text-vtext"
                  }`}
                >
                  <Icon size={15} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
                  <span className="flex-1">{l.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border pt-3 mt-2">
        <button onClick={toggle} className="flex items-center gap-2.5 px-2.5 py-2 text-[12px] text-muted hover:text-accent transition-colors w-full mb-1">
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button onClick={logout} className="flex items-center gap-2.5 px-2.5 py-2 text-[12px] text-muted hover:text-vred transition-colors w-full">
          <LogOut size={14} /> Chiqish
        </button>
      </div>
    </aside>
  );
}
