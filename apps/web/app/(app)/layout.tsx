"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { api, SUPABASE_MODE } from "@/lib/api";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/shared/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (user) {
      // Role-based route protection
      if (user.role === "member" && pathname.startsWith("/gym")) {
        router.replace("/dashboard");
      } else if ((user.role === "gym_owner" || user.role === "trainer") && pathname.startsWith("/dashboard")) {
        router.replace("/gym");
      }
      return;
    }
    (async () => {
      try {
        if (SUPABASE_MODE) {
          const session = await getSession();
          if (!session) { router.push("/login"); return; }
        }
        const me = await api.users.me();
        const userData = me?.data ?? me;
        if (!userData.plan) userData.plan = "free";
        setAuth(userData, "session");
        // Redirect based on role
        if (userData.role === "member" && pathname.startsWith("/gym")) router.replace("/dashboard");
        else if ((userData.role === "gym_owner" || userData.role === "trainer") && pathname.startsWith("/dashboard")) router.replace("/gym");
      } catch { clearAuth(); router.push("/login"); }
    })();
  }, [pathname]);

  if (!user) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar role={user.role} />
      </div>
      {/* Mobile bottom nav */}
      <MobileNav role={user.role} />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto max-h-screen pb-20 md:pb-6">{children}</main>
    </div>
  );
}

// ─── Mobile Bottom Nav ───────────────────────────────────────
function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  const memberLinks = [
    { href: "/dashboard", icon: "🏠", label: "Asosiy" },
    { href: "/dashboard/today", icon: "✅", label: "Bugun" },
    { href: "/dashboard/plan/tracker", icon: "📅", label: "Tracker" },
    { href: "/dashboard/chat", icon: "🤖", label: "AI" },
    { href: "/dashboard/settings", icon: "👤", label: "Profil" },
  ];
  const ownerLinks = [
    { href: "/gym", icon: "📊", label: "Asosiy" },
    { href: "/gym/attendance", icon: "📅", label: "Davomat" },
    { href: "/gym/members", icon: "👥", label: "A'zolar" },
    { href: "/gym/leaderboard", icon: "🏆", label: "Top" },
    { href: "/gym/settings", icon: "⚙️", label: "Sozlama" },
  ];
  const links = role === "member" ? memberLinks : ownerLinks;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex justify-around py-1.5 px-1">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/dashboard" && l.href !== "/gym" && pathname.startsWith(l.href));
          return (
            <a key={l.href} href={l.href} className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-colors ${active ? "text-accent" : "text-muted"}`}>
              <span className="text-lg">{l.icon}</span>
              <span className="text-[10px] mt-0.5">{l.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
