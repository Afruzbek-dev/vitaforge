"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";

const memberLinks = [
  { group: "ASOSIY", items: [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/dashboard/today", label: "Bugun", icon: "✅" },
    { href: "/dashboard/plan", label: "Plan", icon: "📋" },
  ]},
  { group: "KUZATUV", items: [
    { href: "/dashboard/food", label: "Ovqat", icon: "🥗" },
    { href: "/dashboard/chat", label: "AI Coach", icon: "🤖" },
    { href: "/dashboard/photos", label: "Progress", icon: "📸" },
  ]},
  { group: "BOSHQA", items: [
    { href: "/dashboard/invitations", label: "Takliflar", icon: "📩" },
    { href: "/dashboard/settings", label: "Sozlamalar", icon: "⚙️" },
  ]},
];

const ownerLinks = [
  { group: "KUNDALIK ISH", items: [
    { href: "/gym", label: "Dashboard", icon: "▣" },
    { href: "/gym/members", label: "A'zolar", icon: "◷", badge: "" },
    { href: "/gym/finance", label: "Moliya", icon: "◈" },
  ]},
  { group: "BOSHQARISH", items: [
    { href: "/gym/analytics", label: "Analitika", icon: "◫" },
    { href: "/gym/leaderboard", label: "Reyting", icon: "◎" },
    { href: "/gym/retention", label: "Retention", icon: "◐" },
    { href: "/gym/attendance", label: "Davomat", icon: "◷" },
  ]},
  { group: "SOZLASH", items: [
    { href: "/gym/inventory", label: "Inventar", icon: "▤" },
    { href: "/gym/import", label: "Import", icon: "↓" },
    { href: "/gym/invite", label: "Qo'shish", icon: "+" },
    { href: "/gym/groups", label: "Guruhlar", icon: "⊞" },
    { href: "/gym/settings", label: "Sozlamalar", icon: "⚙" },
  ]},
];

const trainerLinks = [
  { group: "ISH", items: [
    { href: "/gym", label: "Dashboard", icon: "▣" },
    { href: "/gym/trainer", label: "A'zolarim", icon: "◷" },
    { href: "/gym/attendance", label: "Davomat", icon: "◷" },
    { href: "/gym/leaderboard", label: "Reyting", icon: "◎" },
  ]},
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const groups = role === "member" ? memberLinks : role === "trainer" ? trainerLinks : ownerLinks;

  const logout = () => { localStorage.removeItem("access_token"); localStorage.removeItem("zenfit_user"); clearAuth(); router.push("/login"); };

  return (
    <aside className="w-[220px] bg-[#0a0a12] border-r border-border flex flex-col py-5 px-3 shrink-0 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2.5 mb-4">
        <div className="w-7 h-7 rounded-[7px] bg-accent flex items-center justify-center font-display font-bold text-[13px] text-bg">Z</div>
        <span className="font-display font-bold text-[14px] text-vtext">ZenFit</span>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 space-y-1">
        {groups.map((g) => (
          <div key={g.group}>
            <p className="font-mono text-[9px] tracking-[2px] text-[#45455a] px-2.5 mt-4 mb-2">{g.group}</p>
            {g.items.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href}
                  className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-[13px] mb-[1px] transition-colors ${active ? "bg-accent/[0.09] text-accent font-medium" : "text-[#9999ad] hover:bg-[#13131c] hover:text-[#c8c8d8]"}`}>
                  <span className="w-4 text-center text-[13px] shrink-0">{l.icon}</span>
                  <span className="flex-1">{l.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1a1a26] pt-3 mt-2">
        <button onClick={logout} className="flex items-center gap-2.5 px-2.5 py-2 text-[12px] text-[#6a6a80] hover:text-vred transition-colors w-full">
          <span>🚪</span> Chiqish
        </button>
      </div>
    </aside>
  );
}
