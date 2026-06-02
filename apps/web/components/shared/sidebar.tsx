"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";

const C = { surface: "#0e0e14", border: "#1e1e2c", accent: "#e8ff47", text: "#efefeb", muted: "#52526a", aDim: "#e8ff4712", aBd: "#e8ff4735" };

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
  { href: "/gym/analytics", label: "Analitika", icon: "📈" },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const links = role === "member" ? memberLinks : ownerLinks;

  const logout = () => { localStorage.removeItem("access_token"); clearAuth(); router.push("/login"); };

  return (
    <aside style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "20px 12px", flexShrink: 0, minHeight: "100vh" }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, paddingLeft: 4 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, color: "#07070a" }}>V</div>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: C.text }}>VitaForge</span>
        <span style={{ background: C.aDim, color: C.accent, border: `1px solid ${C.aBd}`, fontSize: 8, padding: "2px 6px", borderRadius: 8, fontFamily: "JetBrains Mono, monospace", letterSpacing: 1 }}>DEMO</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 9,
              background: active ? C.aDim : "transparent",
              border: `1px solid ${active ? C.aBd : "transparent"}`,
              color: active ? C.accent : C.muted,
              fontSize: 13, fontWeight: active ? 600 : 400,
              textDecoration: "none", transition: "all .15s",
            }}>
              <span style={{ fontSize: 15 }}>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 9, background: "transparent", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", width: "100%" }}>
        <span>🚪</span> Chiqish
      </button>
    </aside>
  );
}
