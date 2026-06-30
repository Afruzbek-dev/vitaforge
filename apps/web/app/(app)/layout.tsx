"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { api, SUPABASE_MODE } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { isTelegramWebApp, getTelegramInitData, expandWebApp } from "@/lib/telegram";
import Sidebar from "@/components/shared/sidebar";
import { Search, Bell, Menu, LayoutGrid } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setAuth, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        if (SUPABASE_MODE) {
          const session = await getSession();
          if (!session) { router.push("/login"); return; }
        }

        const me = await api.users.me();
        const userData = me?.data ?? me;
        if (!userData.plan) userData.plan = "free";
        localStorage.setItem("zenfit_user", JSON.stringify(userData));
        setAuth(userData, "session");

      } catch { clearAuth(); localStorage.removeItem("zenfit_user"); router.push("/login"); }
    })();
  }, [pathname]);

  if (!user) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] md:p-6 md:gap-6 relative">
      {/* Desktop Sidebar Wrapper */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden shrink-0">
        <Sidebar role={user.role} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative bg-white h-full w-[255px] shadow-xl">
            <Sidebar role={user.role} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pr-0 md:pr-2">
        {/* Header */}
        <header className="h-[64px] flex items-center justify-between px-4 md:px-0 mb-4 md:mb-0 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 -ml-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-3">
              <div className="w-7 h-7 flex items-center justify-center">
                <Menu size={20} className="text-gray-800" />
              </div>
              <div className="w-[1px] h-4 bg-gray-300" />
              <h1 className="text-[20px] font-medium text-[#171717]">Actify</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden lg:flex w-[300px] h-[36px] bg-white border border-[#E5E5E5] rounded-md items-center px-3 gap-2">
              <Search size={16} className="text-[#737373]" />
              <input type="text" placeholder="Type to search..." className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#737373]" />
            </div>

            {/* Header Icons */}
            <div className="flex items-center gap-2">
              <button className="w-[36px] h-[36px] bg-white border border-[#E5E5E5] rounded-md flex items-center justify-center text-[#0A0A0A] hover:bg-gray-50">
                <LayoutGrid size={18} />
              </button>
              <button className="w-[36px] h-[36px] bg-white border border-[#E5E5E5] rounded-md flex items-center justify-center text-[#0A0A0A] hover:bg-gray-50">
                <Bell size={18} />
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 ml-2">
              <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}&backgroundColor=2563EB`} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-[14px] font-semibold text-[#0A0A0A] leading-tight">{user.full_name}</span>
                <span className="text-[12px] text-[#0A0A0A] opacity-70 leading-tight">Student</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-safe">
          {children}
        </main>
      </div>
    </div>
  );
}
