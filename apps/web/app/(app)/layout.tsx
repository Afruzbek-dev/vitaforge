"use client";
import { useEffect } from "react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { api, SUPABASE_MODE } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { isTelegramWebApp, getTelegramInitData, expandWebApp } from "@/lib/telegram";
import Sidebar from "@/components/shared/sidebar";
import { Home, Dumbbell, Utensils, Trophy, Bot, BarChart3, Users, Wallet, CalendarCheck, Settings, Package, Download, MoreHorizontal, UserPlus, Target, User, ClipboardList } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (user) {
      if (user.role === "member" && pathname.startsWith("/gym")) router.replace("/dashboard");
      else if ((user.role === "gym_owner" || user.role === "trainer" || user.role === "admin") && pathname.startsWith("/dashboard")) router.replace("/gym");
      else if (user.role === "gym_owner" && !user.gym_id && !pathname.startsWith("/gym-onboarding")) router.replace("/gym-onboarding");
      return;
    }
    (async () => {
      try {
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

        const storedUser = localStorage.getItem("zenfit_user");
        const storedToken = localStorage.getItem("access_token");
        if (storedUser && storedToken) {
          const cached = JSON.parse(storedUser);
          setAuth(cached, storedToken);
          return;
        }

        if (SUPABASE_MODE) {
          const session = await getSession();
          if (!session) { router.push("/login"); return; }
        }

        const me = await api.users.me();
        const userData = me?.data ?? me;
        if (!userData.plan) userData.plan = "free";
        localStorage.setItem("zenfit_user", JSON.stringify(userData));
        setAuth(userData, "session");

        if (userData.role === "member" && !pathname.startsWith("/onboarding") && !pathname.includes("/settings")) {
          try {
            const os = await api.onboarding.status();
            if (!os?.data?.onboarding_done) { router.replace("/onboarding"); return; }
          } catch {}
        }
        if (userData.role === "gym_owner" && !userData.gym_id && !pathname.startsWith("/gym-onboarding")) {
          router.replace("/gym-onboarding"); return;
        }
        if (userData.role === "member" && pathname.startsWith("/gym")) router.replace("/dashboard");
        else if ((userData.role === "gym_owner" || userData.role === "trainer" || userData.role === "admin") && pathname.startsWith("/dashboard")) router.replace("/gym");
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
      <main className="flex-1 p-4 md:p-6 overflow-y-auto max-h-screen pb-28 md:pb-6 safe-top">{children}</main>
    </div>
  );
}

function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const memberLinks = [
    { href: "/dashboard", icon: Home, label: "Bosh" },
    { href: "/dashboard/plan", icon: ClipboardList, label: "Plan" },
    { href: "/dashboard/food", icon: Utensils, label: "Ovqat" },
    { href: "/dashboard/chat", icon: Bot, label: "AI" },
    { href: "/dashboard/profile", icon: User, label: "Profil" },
  ];
  const ownerMain = [
    { href: "/gym", icon: BarChart3, label: "Asosiy" },
    { href: "/gym/members", icon: Users, label: "A'zolar" },
    { href: "/gym/payments", icon: Wallet, label: "To'lovlar" },
    { href: "/gym/analytics", icon: BarChart3, label: "Analitika" },
  ];
  const ownerMore = [
    { href: "/gym/attendance", icon: CalendarCheck, label: "Davomat" },
    { href: "/gym/leaderboard", icon: Trophy, label: "Reyting" },
    { href: "/gym/challenges", icon: Target, label: "Challenge" },
    { href: "/gym/inventory", icon: Package, label: "Inventar" },
    { href: "/gym/invite", icon: UserPlus, label: "Qo'shish" },
    { href: "/gym/import", icon: Download, label: "Import" },
    { href: "/gym/settings", icon: Settings, label: "Sozlamalar" },
  ];
  const links = role === "member" ? memberLinks : ownerMain;
  return (
    <>
      {showMore && role !== "member" && (
        <div className="md:hidden fixed inset-0 z-[60]" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-bg/60" />
          <div className="absolute bottom-16 left-2 right-2 glass border border-border rounded-2xl p-4 animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <p className="text-[10px] font-mono text-muted mb-3">KO&apos;PROQ</p>
            <div className="grid grid-cols-4 gap-3">
              {ownerMore.map((l) => {
                const Icon = l.icon;
                return (
                  <Link key={l.href} href={l.href} onClick={() => setShowMore(false)} className="flex flex-col items-center gap-1 py-2 press">
                    <Icon size={20} className="text-muted" />
                    <span className="text-[9px] text-muted">{l.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d16]/95 backdrop-blur-md border-t border-[#1a1a26] safe-bottom">
        <div className="flex justify-around">
          {links.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link 
                key={l.href} 
                href={l.href} 
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-0 press transition-colors ${active ? "text-accent" : "text-[#52526a]"}`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[9px] font-mono tracking-wide">{l.label}</span>
              </Link>
            );
          })}
          {role !== "member" && (
            <button 
              onClick={() => setShowMore(!showMore)} 
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-0 press transition-colors ${showMore ? "text-accent" : "text-[#52526a]"}`}
            >
              <MoreHorizontal size={22} strokeWidth={showMore ? 2.5 : 2} />
              <span className="text-[9px] font-mono tracking-wide">Ko&apos;proq</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
