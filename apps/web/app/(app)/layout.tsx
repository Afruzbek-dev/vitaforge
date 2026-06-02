"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { api, DEMO_MODE, SUPABASE_MODE } from "@/lib/api";
import { DEMO_USERS } from "@/lib/mock-data";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/shared/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (user) return;

    if (DEMO_MODE) {
      const token = localStorage.getItem("access_token");
      if (!token) { router.push("/login"); return; }
      // Determine role from stored flag
      const isOwner = localStorage.getItem("demo_role") === "owner";
      setAuth((isOwner ? DEMO_USERS.gym_owner : DEMO_USERS.member) as any, token);
      return;
    }

    // Supabase or backend mode
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
    <div style={{ minHeight: "100vh", background: "#07070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 5 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8ff47", animation: `blink 1.2s ${i * 0.2}s ease infinite` }} />)}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#07070a" }}>
      <Sidebar role={user.role} />
      <main style={{ flex: 1, padding: "24px", overflowY: "auto", maxHeight: "100vh" }}>{children}</main>
    </div>
  );
}
