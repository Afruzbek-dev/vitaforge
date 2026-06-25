"use client";
import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { UserPlus, Trash2, Users, Search } from "lucide-react";

export default function TrainersPage() {
  const sb = getSupabase();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [mode, setMode] = useState<"new" | "search">("new");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gymId, setGymId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const u = await getUser();
    if (!u) return;
    const { data: me } = await sb.from("users").select("gym_id").eq("id", u.id).single();
    if (!me?.gym_id) return;
    setGymId(me.gym_id);
    const { data } = await sb.from("users").select("id, full_name, phone, created_at").eq("gym_id", me.gym_id).eq("role", "trainer");
    setTrainers(data || []);
  };

  const addTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !name || !gymId) return;
    setLoading(true);
    setError("");
    const { data: existing } = await sb.from("users").select("id").eq("phone", phone).single();
    if (existing) {
      await sb.from("users").update({ role: "trainer", gym_id: gymId }).eq("id", existing.id);
    } else {
      const { error: err } = await sb.from("users").insert({ full_name: name, phone, role: "trainer", gym_id: gymId });
      if (err) { setError(err.message); setLoading(false); return; }
    }
    setPhone(""); setName(""); setLoading(false); load();
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    const { data } = await sb.from("users").select("id, full_name, phone, email, role").or(`phone.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`).limit(10);
    setSearchResults(data || []);
  };

  const assignTrainer = async (userId: string) => {
    if (!gymId) return;
    await sb.from("users").update({ role: "trainer", gym_id: gymId }).eq("id", userId);
    setSearchResults([]); setSearchQuery(""); load();
  };

  const removeTrainer = async (id: string) => {
    await sb.from("users").update({ role: "member" }).eq("id", id);
    load();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 animate-fadeUp">
      <div className="flex items-center gap-3 mb-5">
        <Users className="text-accent" size={22} />
        <h1 className="font-display font-bold text-lg">Trenerlar</h1>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode("new")} className={`px-3 py-1.5 rounded-full text-xs font-medium ${mode === "new" ? "bg-accent text-bg" : "bg-surface border border-border text-muted"}`}>Yangi profil yaratish</button>
        <button onClick={() => setMode("search")} className={`px-3 py-1.5 rounded-full text-xs font-medium ${mode === "search" ? "bg-accent text-bg" : "bg-surface border border-border text-muted"}`}>Mavjud userni qidirish</button>
      </div>

      {mode === "new" ? (
        <form onSubmit={addTrainer} className="bg-card border border-border rounded-[var(--radius)] p-4 mb-5">
          <p className="text-xs text-muted mb-3 font-medium">Yangi trener profili yaratish</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ism" required className="flex-1 px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon" required className="flex-1 px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
            <button type="submit" disabled={loading} className="px-4 py-2 bg-accent text-bg rounded-[var(--radius-sm)] text-sm font-medium press disabled:opacity-50"><UserPlus size={16} /></button>
          </div>
          {error && <p className="text-vred text-xs mt-2">{error}</p>}
        </form>
      ) : (
        <div className="bg-card border border-border rounded-[var(--radius)] p-4 mb-5">
          <p className="text-xs text-muted mb-3 font-medium">Mavjud userni qidirish va trener qilish</p>
          <div className="flex gap-2">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchUsers()} placeholder="Ism, telefon yoki email..." className="flex-1 px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
            <button onClick={searchUsers} className="px-4 py-2 bg-accent text-bg rounded-[var(--radius-sm)] text-sm press"><Search size={16} /></button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
              {searchResults.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-3 py-2 bg-surface rounded-[var(--radius-sm)]">
                  <div className="text-sm"><span className="font-medium">{u.full_name}</span> <span className="text-muted text-xs">· {u.phone || u.email} · {u.role}</span></div>
                  <button onClick={() => assignTrainer(u.id)} className="px-2 py-1 bg-accent text-bg rounded text-[10px] font-medium press">Trener qilish</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {trainers.length === 0 ? (
        <div className="bg-card border border-border rounded-[var(--radius)] p-8 text-center text-muted text-sm">Hali trener qo'shilmagan</div>
      ) : (
        <div className="space-y-2">
          {trainers.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-[var(--radius-sm)] p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">{t.full_name?.[0]}</div>
                <div><p className="text-sm font-medium">{t.full_name}</p><p className="text-[11px] text-muted">{t.phone}</p></div>
              </div>
              <button onClick={() => removeTrainer(t.id)} className="p-2 text-muted hover:text-vred transition-colors press"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
