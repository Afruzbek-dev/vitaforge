"use client";
import { useEffect } from "react";
import { useState } from "react";
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
      <main className="flex-1 p-4 md:p-6 overflow-y-auto max-h-screen pb-24 md:pb-6">{children}</main>
    </div>
  );
}

function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const memberLinks = [
    { href: "/dashboard", icon: "🏠", label: "Asosiy" },
    { href: "/dashboard/today", icon: "✅", label: "Bugun" },
    { href: "/dashboard/chat", icon: "🤖", label: "AI" },
    { href: "/dashboard/settings", icon: "👤", label: "Profil" },
  ];
  const ownerMain = [
    { href: "/gym", icon: "📊", label: "Asosiy" },
    { href: "/gym/members", icon: "👥", label: "A'zolar" },
    { href: "/gym/finance", icon: "💰", label: "Moliya" },
    { href: "/gym/analytics", icon: "📈", label: "Analitika" },
  ];
  const ownerMore = [
    { href: "/gym/attendance", icon: "📅", label: "Davomat" },
    { href: "/gym/retention", icon: "🎯", label: "Retention" },
    { href: "/gym/leaderboard", icon: "🏆", label: "Reyting" },
    { href: "/gym/inventory", icon: "📦", label: "Inventar" },
    { href: "/gym/invite", icon: "➕", label: "Qo'shish" },
    { href: "/gym/import", icon: "📥", label: "Import" },
    { href: "/gym/settings", icon: "⚙️", label: "Sozlamalar" },
  ];
  const links = role === "member" ? memberLinks : ownerMain;
  return (
    <>
      {showMore && role !== "member" && (
        <div className="md:hidden fixed inset-0 z-[60]" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-bg/60" />
          <div className="absolute bottom-16 left-2 right-2 glass border border-border rounded-2xl p-4 animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <p className="text-[10px] font-mono text-muted mb-3">KO'PROQ</p>
            <div className="grid grid-cols-4 gap-3">
              {ownerMore.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setShowMore(false)} className="flex flex-col items-center gap-1 py-2 press">
                  <span className="text-xl">{l.icon}</span>
                  <span className="text-[9px] text-muted">{l.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border safe-bottom">
        <div className="flex justify-around py-2 px-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (<a key={l.href} href={l.href} className={`flex flex-col items-center py-1 px-3 rounded-xl press ${active ? "text-accent" : "text-muted"}`}><span className="text-[18px]">{l.icon}</span><span className="text-[9px] mt-0.5 font-medium">{l.label}</span></a>);
          })}
          {role !== "member" && (
            <button onClick={() => setShowMore(!showMore)} className={`flex flex-col items-center py-1 px-3 rounded-xl press ${showMore ? "text-accent" : "text-muted"}`}><span className="text-[18px]">⋯</span><span className="text-[9px] mt-0.5 font-medium">Ko'proq</span></button>
          )}
        </div>
      </nav>
    </>
  );
}
