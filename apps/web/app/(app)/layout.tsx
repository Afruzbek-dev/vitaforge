"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { api, SUPABASE_MODE } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { isTelegramWebApp, getTelegramInitData, expandWebApp } from "@/lib/telegram";
import Sidebar from "@/components/shared/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (user) {
      if (user.role === "member" && pathname.startsWith("/gym")) router.replace("/dashboard");
      else if ((user.role === "gym_owner" || user.role === "trainer") && pathname.startsWith("/dashboard")) router.replace("/gym");
      return;
    }
    (async () => {
      try {
        // 1. Telegram Mini App auto-login
        if (isTelegramWebApp()) {
          expandWebApp();
          const initData = getTelegramInitData();
          if (initData) {
            const res = await fetch("/api/telegram-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ initData }) });
            const data = await res.json();
            if (data.success && data.user) {
              if (data.access_token) localStorage.setItem("access_token", data.access_token);
              localStorage.setItem("zenfit_user", JSON.stringify(data.user));
              setAuth(data.user, data.access_token ?? "tg-session");
              return;
            }
          }
        }

        // 2. Restore from localStorage (no re-login needed)
        const storedUser = localStorage.getItem("zenfit_user");
        const storedToken = localStorage.getItem("access_token");
        if (storedUser && storedToken) {
          const cached = JSON.parse(storedUser);
          setAuth(cached, storedToken);
          return;
        }

        // 3. Supabase session check
        if (SUPABASE_MODE) {
          const session = await getSession();
          if (!session) { router.push("/login"); return; }
        }

        // 4. Fetch fresh user data
        const me = await api.users.me();
        const userData = me?.data ?? me;
        if (!userData.plan) userData.plan = "free";
        localStorage.setItem("zenfit_user", JSON.stringify(userData));
        setAuth(userData, "session");

        // Onboarding check
        if (userData.role === "member" && !pathname.startsWith("/onboarding") && !pathname.includes("/settings")) {
          try {
            const os = await api.onboarding.status();
            if (!os?.data?.onboarding_done) { router.replace("/onboarding"); return; }
          } catch {}
        }
        if (userData.role === "member" && pathname.startsWith("/gym")) router.replace("/dashboard");
        else if ((userData.role === "gym_owner" || userData.role === "trainer") && pathname.startsWith("/dashboard")) router.replace("/gym");
      } catch { clearAuth(); localStorage.removeItem("zenfit_user"); router.push("/login"); }
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
      <div className="hidden md:block"><Sidebar role={user.role} /></div>
      <MobileNav role={user.role} />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto max-h-screen pb-20 md:pb-6">{children}</main>
    </div>
  );
}

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border safe-bottom">
      <div className="flex justify-around py-2 px-1">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/dashboard" && l.href !== "/gym" && pathname.startsWith(l.href));
          return (
            <a key={l.href} href={l.href} className={`flex flex-col items-center py-1 px-3 rounded-xl press transition-colors ${active ? "text-accent" : "text-muted"}`}>
              <span className="text-[18px]">{l.icon}</span>
              <span className="text-[9px] mt-0.5 font-medium">{l.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
