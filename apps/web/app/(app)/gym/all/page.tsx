"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Building2, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AllGymsPage() {
  const [gyms, setGyms] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await getSupabase().from("gyms").select("*, users!gyms_owner_fk(full_name, email)").order("created_at", { ascending: false });
    setGyms(data || []);
  };

  const updateStatus = async (id: string, status: string) => {
    await getSupabase().from("gyms").update({ status }).eq("id", id);
    setGyms((g) => g.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const filtered = filter === "all" ? gyms : gyms.filter((g) => g.status === filter);

  return (
    <div className="max-w-4xl animate-fadeUp space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-lg">Gymlar</h1>
        <span className="text-xs text-muted">{gyms.length} ta</span>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {[{ v: "all", l: "Barchasi" }, { v: "pending", l: "Kutmoqda" }, { v: "approved", l: "Tasdiqlangan" }, { v: "rejected", l: "Rad" }].map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === f.v ? "bg-accent text-bg" : "bg-surface border border-border text-muted"}`}>{f.l}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((g) => (
          <div key={g.id} className="bg-card border border-border rounded-[var(--radius-sm)] p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Building2 size={18} className="text-accent shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{g.name}</p>
                <p className="text-[11px] text-muted">{g.city} · {g.users?.full_name || "Owner noma'lum"} · {g.phone || ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {g.status === "pending" ? (
                <>
                  <button onClick={() => updateStatus(g.id, "approved")} className="p-1.5 rounded-md bg-vgreen/20 text-vgreen hover:bg-vgreen/30 press"><CheckCircle size={16} /></button>
                  <button onClick={() => updateStatus(g.id, "rejected")} className="p-1.5 rounded-md bg-vred/20 text-vred hover:bg-vred/30 press"><XCircle size={16} /></button>
                </>
              ) : (
                <span className={`text-[10px] font-medium flex items-center gap-1 ${g.status === "approved" ? "text-vgreen" : "text-vred"}`}>
                  {g.status === "approved" ? <><CheckCircle size={12} />Aktiv</> : <><XCircle size={12} />Rad</>}
                </span>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted text-sm py-8">Gymlar topilmadi</p>}
      </div>
    </div>
  );
}
