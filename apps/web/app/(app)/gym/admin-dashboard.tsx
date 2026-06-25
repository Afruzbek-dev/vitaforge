"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store/auth";
import { Building2, Users, Wallet, TrendingUp, TrendingDown, Target, Search } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ gyms: 0, activeUsers: 0, contracts: 0, pendingGyms: 0, churnRate: 0, retentionRate: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "gym" | "free">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") return;
    (async () => {
      const sb = getSupabase();
      const [g, u, c, pg, allUsers] = await Promise.all([
        sb.from("gyms").select("id", { count: "exact", head: true }),
        sb.from("users").select("id", { count: "exact", head: true }).eq("is_active", true),
        sb.from("contracts").select("id", { count: "exact", head: true }).eq("status", "active"),
        sb.from("gyms").select("id", { count: "exact", head: true }).eq("status", "pending"),
        sb.from("users").select("id, full_name, email, phone, role, gym_id, created_at, is_active").order("created_at", { ascending: false }).limit(50),
      ]);
      const total = u.count || 1;
      const gymUsers = allUsers.data?.filter((x: any) => x.gym_id) || [];
      const retention = Math.round((gymUsers.length / total) * 100);
      setStats({ gyms: g.count || 0, activeUsers: u.count || 0, contracts: c.count || 0, pendingGyms: pg.count || 0, churnRate: 100 - retention, retentionRate: retention });
      setUsers(allUsers.data || []);
    })();
  }, [user]);

  if (user?.role !== "admin") return null;

  const filtered = users.filter((u) => {
    if (filter === "gym" && !u.gym_id) return false;
    if (filter === "free" && u.gym_id) return false;
    if (search && !u.full_name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const cards = [
    { label: "Gymlar", value: stats.gyms, icon: Building2, color: "text-accent" },
    { label: "Aktiv Userlar", value: stats.activeUsers, icon: Users, color: "text-vblue" },
    { label: "Kontraktlar", value: stats.contracts, icon: Wallet, color: "text-vgreen" },
    { label: "Kutmoqda", value: stats.pendingGyms, icon: TrendingUp, color: "text-[#f59e0b]" },
    { label: "Retention", value: `${stats.retentionRate}%`, icon: TrendingUp, color: "text-vgreen" },
    { label: "Churn", value: `${stats.churnRate}%`, icon: TrendingDown, color: "text-vred" },
  ];

  return (
    <div className="max-w-full animate-fadeUp space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display font-bold text-xl">Admin Dashboard</h1>
        <Link href="/gym/challenges" className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-bg rounded-[var(--radius-sm)] text-xs font-medium press">
          <Target size={14} /> Challenge yaratish
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-[var(--radius)] p-3">
            <c.icon size={16} className={`${c.color} mb-1`} />
            <p className="text-lg font-bold">{c.value}</p>
            <p className="text-[10px] text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Users section */}
      <div className="bg-card border border-border rounded-[var(--radius)] p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h2 className="text-sm font-bold">Barcha userlar</h2>
          <Link href="/gym/users" className="text-xs text-accent">Barchasini ko'rish →</Link>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {[{ v: "all", l: "Barchasi" }, { v: "gym", l: "Gym a'zo" }, { v: "free", l: "Free" }].map((f) => (
            <button key={f.v} onClick={() => setFilter(f.v as any)} className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${filter === f.v ? "bg-accent text-bg" : "bg-surface border border-border text-muted"}`}>{f.l}</button>
          ))}
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="pl-7 pr-2 py-1 rounded-full bg-surface border border-border text-[11px] w-36 outline-none focus:border-accent" />
          </div>
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {filtered.slice(0, 15).map((u) => (
            <div key={u.id} className="flex items-center justify-between px-3 py-2 rounded-md bg-surface/50 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold shrink-0">{u.full_name?.[0] || "?"}</div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{u.full_name || "Noma'lum"}</p>
                  <p className="text-[10px] text-muted truncate">{u.email || u.phone}</p>
                </div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${u.gym_id ? "bg-vgreen/20 text-vgreen" : "bg-muted/20 text-muted"}`}>{u.gym_id ? "Gym" : "Free"}</span>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted text-xs py-4">Topilmadi</p>}
        </div>
      </div>
    </div>
  );
}
