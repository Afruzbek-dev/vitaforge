"use client";
import { UserService } from "@/lib/services/UserService";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { getSession } from "@/lib/auth";
import { isTelegramWebApp, getTelegramInitData, expandWebApp } from "@/lib/telegram";
import { DesktopSidebar } from "@/components/shared/desktop-sidebar";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { MobileTopBar } from "@/components/shared/mobile-topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (user) return;
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

        const session = await getSession();
        if (!session) { router.push("/login"); return; }

        const me = await UserService.getMe();
        const userData = me?.data ?? me;
        if (!(userData as any).plan) (userData as any).plan = "free";
        localStorage.setItem("zenfit_user", JSON.stringify(userData));
        setAuth(userData as any, "session");

      } catch { clearAuth(); localStorage.removeItem("zenfit_user"); router.push("/login"); }
    })();
  }, [pathname]);

  if (!user) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-display font-black text-bg text-lg mx-auto animate-pulse">V</div>
        <p className="text-muted text-xs font-mono">Yuklanmoqda...</p>
      </div>
    </div>
  );

  // Member → mobile layout with bottom nav
  const isMember = user.role === "member";
  // Desktop roles: gym_owner, trainer, superadmin
  const isDesktop = !isMember;

  if (isDesktop) {
    return (
      <div className="flex min-h-screen bg-bg">
        <DesktopSidebar role={user.role as "gym_owner" | "trainer" | "superadmin"} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  // Mobile member layout
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <MobileTopBar onAction={() => router.push("/dashboard/chat")} />

      <main className="flex-1 px-4 py-4 overflow-y-auto pb-safe">
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}
