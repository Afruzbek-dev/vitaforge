"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Users, Search } from "lucide-react";

export default function AllUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "gym" | "free">("all");
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await getSupabase().from("users").select("id, full_name, email, phone, role, gym_id, created_at, is_active").order("created_at", { ascending: false });
    setUsers(data || []);
  };

  const filtered = users.filter((u) => {
    if (filter === "gym" && !u.gym_id) return false;
    if (filter === "free" && u.gym_id) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.full_name?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q) && !u.phone?.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-full animate-fadeUp space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display font-bold text-lg flex items-center gap-2"><Users size={20} className="text-accent" />Barcha userlar</h1>
        <span className="text-xs text-muted">{filtered.length} / {users.length}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[{ v: "all", l: "Barchasi" }, { v: "gym", l: "Gym a'zo" }, { v: "free", l: "Free" }].map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v as any)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter === f.v ? "bg-accent text-bg" : "bg-surface border border-border text-muted"}`}>{f.l}</button>
        ))}
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ism, email, telefon..." className="pl-8 pr-3 py-1.5 rounded-full bg-surface border border-border text-xs w-48 outline-none focus:border-accent" />
        </div>
      </div>

      <div className="space-y-1.5">
        {filtered.map((u) => (
          <div key={u.id} className="bg-card border border-border rounded-[var(--radius-sm)] p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">{u.full_name?.[0] || "?"}</div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{u.full_name || "Noma'lum"}</p>
                <p className="text-[11px] text-muted truncate">{u.email || u.phone} · {u.role} · {new Date(u.created_at).toLocaleDateString("uz")}</p>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${u.gym_id ? "bg-vgreen/20 text-vgreen" : "bg-muted/20 text-muted"}`}>{u.gym_id ? "Gym" : "Free"}</span>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted text-sm py-8">Userlar topilmadi</p>}
      </div>
    </div>
  );
}
