"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { api, SUPABASE_MODE } from "@/lib/api";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/shared/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (user) return;
    (async () => {
      try {
        if (SUPABASE_MODE) {
          const session = await getSession();
          if (!session) { router.push("/login"); return; }
        }
        const me = await api.users.me();
        const userData = me?.data ?? me;
        setAuth(userData, "session");
      } catch {
        clearAuth();
        router.push("/login");
      }
    })();
  }, []);

  if (!user) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role={user.role} />
      <main className="flex-1 p-6 overflow-y-auto max-h-screen">{children}</main>
    </div>
  );
}
