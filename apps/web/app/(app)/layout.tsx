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
    { href: "/dashboard", icon: "📊" },
    { href: "/dashboard/today", icon: "✅" },
    { href: "/dashboard/food", icon: "🥗" },
    { href: "/dashboard/chat", icon: "🤖" },
    { href: "/dashboard/settings", icon: "⚙️" },
  ];
  const ownerLinks = [
    { href: "/gym", icon: "📊" },
    { href: "/gym/attendance", icon: "📅" },
    { href: "/gym/members", icon: "👥" },
    { href: "/gym/leaderboard", icon: "🏆" },
    { href: "/gym/settings", icon: "⚙️" },
  ];
  const links = role === "member" ? memberLinks : ownerLinks;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border flex justify-around py-2 px-1">
      {links.map((l) => (
        <a key={l.href} href={l.href}
          className={`flex flex-col items-center p-2 rounded-lg text-lg ${pathname === l.href ? "text-accent" : "text-muted"}`}>
          {l.icon}
        </a>
      ))}
    </nav>
  );
}
