"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store/auth";
import { Building2, Users, Wallet, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ gyms: 0, activeUsers: 0, contracts: 0, pendingGyms: 0 });

  useEffect(() => {
    if (user?.role !== "admin") return;
    (async () => {
      const sb = getSupabase();
      const [g, u, c, pg] = await Promise.all([
        sb.from("gyms").select("id", { count: "exact", head: true }),
        sb.from("users").select("id", { count: "exact", head: true }).eq("is_active", true),
        sb.from("contracts").select("id", { count: "exact", head: true }).eq("status", "active"),
        sb.from("gyms").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({ gyms: g.count || 0, activeUsers: u.count || 0, contracts: c.count || 0, pendingGyms: pg.count || 0 });
    })();
  }, [user]);

  if (user?.role !== "admin") return null;

  const cards = [
    { label: "Gymlar", value: stats.gyms, icon: Building2, color: "text-accent" },
    { label: "Aktiv Userlar", value: stats.activeUsers, icon: Users, color: "text-vblue" },
    { label: "Kontraktlar", value: stats.contracts, icon: Wallet, color: "text-vgreen" },
    { label: "Tasdiqlash kutmoqda", value: stats.pendingGyms, icon: TrendingUp, color: "text-[#f59e0b]" },
  ];

  return (
    <div className="max-w-4xl animate-fadeUp space-y-6">
      <h1 className="font-display font-bold text-xl">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-[var(--radius)] p-4">
            <c.icon size={18} className={`${c.color} mb-2`} />
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-[11px] text-muted">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
