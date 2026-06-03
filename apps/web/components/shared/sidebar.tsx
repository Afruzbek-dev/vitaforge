"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";

const memberLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/plan", label: "Plan", icon: "📋" },
  { href: "/dashboard/food", label: "Ovqat", icon: "🥗" },
  { href: "/dashboard/photos", label: "Fotolar", icon: "📸" },
  { href: "/dashboard/chat", label: "AI Chat", icon: "🤖" },
];
const ownerLinks = [
  { href: "/gym", label: "Dashboard", icon: "📊" },
  { href: "/gym/members", label: "A'zolar", icon: "👥" },
  { href: "/gym/invite", label: "Qo'shish", icon: "➕" },
  { href: "/gym/groups", label: "Guruhlar", icon: "🎯" },
  { href: "/gym/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/gym/analytics", label: "Analitika", icon: "📈" },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const links = role === "member" ? memberLinks : ownerLinks;

  const logout = () => { localStorage.removeItem("access_token"); clearAuth(); router.push("/login"); };

  return (
    <aside className="w-56 bg-surface border-r border-border flex flex-col py-5 px-3 shrink-0 min-h-screen">
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center font-display font-bold text-sm text-bg">V</div>
        <span className="font-display font-bold text-base text-vtext">VitaForge</span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-accent/10 border border-accent-border text-accent font-medium" : "text-muted hover:text-vtext hover:bg-surface border border-transparent"}`}>
              <span className="text-base">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>

      <Button variant="ghost" onClick={logout} className="justify-start text-muted">
        🚪 Chiqish
      </Button>
    </aside>
  );
}
