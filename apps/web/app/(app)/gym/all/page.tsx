"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Building2, CheckCircle, XCircle, Users, Dumbbell, Clock } from "lucide-react";

export default function AllGymsPage() {
  const [gyms, setGyms] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const sb = getSupabase();
    const { data } = await sb.from("gyms").select("*, users!gyms_owner_fk(full_name, email, phone)").order("created_at", { ascending: false });
    if (!data) { setGyms([]); return; }
    // Load member/trainer counts
    const enriched = await Promise.all(data.map(async (g: any) => {
      const [members, trainers] = await Promise.all([
        sb.from("users").select("id", { count: "exact", head: true }).eq("gym_id", g.id).eq("role", "member"),
        sb.from("users").select("id", { count: "exact", head: true }).eq("gym_id", g.id).eq("role", "trainer"),
      ]);
      return { ...g, member_count: members.count || 0, trainer_count: trainers.count || 0 };
    }));
    setGyms(enriched);
  };

  const updateStatus = async (id: string, status: string) => {
    await getSupabase().from("gyms").update({ status }).eq("id", id);
    setGyms((g) => g.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const filtered = filter === "all" ? gyms : gyms.filter((g) => g.status === filter);

  return (
    <div className="max-w-full animate-fadeUp space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-lg">Gymlar</h1>
        <span className="text-xs text-muted">{gyms.length} ta</span>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {[{ v: "all", l: "Barchasi" }, { v: "pending", l: "Kutmoqda" }, { v: "approved", l: "Tasdiqlangan" }, { v: "rejected", l: "Rad" }].map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === f.v ? "bg-accent text-bg" : "bg-surface border border-border text-muted"}`}>{f.l}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((g) => (
          <div key={g.id} className="bg-card border border-border rounded-[var(--radius)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Building2 size={18} className="text-accent shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{g.name}</p>
                  <p className="text-[11px] text-muted">{g.city} · {g.address || ""}</p>
                </div>
              </div>
              {g.status === "pending" ? (
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => updateStatus(g.id, "approved")} className="p-1.5 rounded-md bg-vgreen/20 text-vgreen hover:bg-vgreen/30 press"><CheckCircle size={16} /></button>
                  <button onClick={() => updateStatus(g.id, "rejected")} className="p-1.5 rounded-md bg-vred/20 text-vred hover:bg-vred/30 press"><XCircle size={16} /></button>
                </div>
              ) : (
                <span className={`text-[10px] font-medium ${g.status === "approved" ? "text-vgreen" : "text-vred"}`}>{g.status === "approved" ? "Aktiv" : "Rad"}</span>
              )}
            </div>
            {/* Owner info */}
            <div className="bg-surface rounded-[var(--radius-sm)] p-2.5 text-[11px]">
              <p className="text-muted mb-1">Owner:</p>
              <p className="font-medium">{g.users?.full_name || "Noma'lum"}</p>
              <p className="text-muted">{g.users?.email || ""} {g.users?.phone ? `· ${g.users.phone}` : ""}</p>
              {g.phone && <p className="text-muted">Gym tel: {g.phone}</p>}
            </div>
            {/* Stats */}
            <div className="flex gap-4 text-[11px] text-muted">
              <span className="flex items-center gap-1"><Users size={12} />{g.member_count} a'zo</span>
              <span className="flex items-center gap-1"><Dumbbell size={12} />{g.trainer_count} trener</span>
              <span className="flex items-center gap-1"><Clock size={12} />{new Date(g.updated_at || g.created_at).toLocaleDateString("uz")}</span>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center text-muted text-sm py-8">Gymlar topilmadi</p>}
    </div>
  );
}
