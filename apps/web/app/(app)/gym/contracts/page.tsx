"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Wallet, Plus, Receipt } from "lucide-react";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [gyms, setGyms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [form, setForm] = useState({ gym_id: "", plan: "standard", price_monthly: "", starts_at: new Date().toISOString().split("T")[0], notes: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const sb = getSupabase();
    const [c, g] = await Promise.all([
      sb.from("contracts").select("*, gyms(name)").order("created_at", { ascending: false }),
      sb.from("gyms").select("id, name").eq("status", "approved"),
    ]);
    setContracts(c.data || []);
    setGyms(g.data || []);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await getSupabase().from("contracts").insert({ ...form, price_monthly: Number(form.price_monthly) });
    setShowForm(false);
    setForm({ gym_id: "", plan: "standard", price_monthly: "", starts_at: new Date().toISOString().split("T")[0], notes: "" });
    load();
  };

  const sendInvoice = async (contractId: string, gymId: string) => {
    setSending(contractId);
    await getSupabase().from("notifications").insert({ gym_id: gymId, type: "invoice", title: "To'lov talab qilinmoqda", message: "Admin to'lov so'radi. Iltimos, to'lovni amalga oshiring.", contract_id: contractId });
    setSending(null);
    alert("Invoice yuborildi!");
  };

  return (
    <div className="max-w-4xl animate-fadeUp space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-lg">Kontraktlar</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-bg rounded-[var(--radius-sm)] text-xs font-medium press">
          <Plus size={14} /> Yangi
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-card border border-border rounded-[var(--radius)] p-4 space-y-3">
          <select value={form.gym_id} onChange={(e) => setForm({ ...form, gym_id: e.target.value })} required className="w-full px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-sm">
            <option value="">Gym tanlang</option>
            {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-sm">
              <option value="starter">Starter</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
            <input type="number" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: e.target.value })} placeholder="Narx (so'm)" required className="px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-sm" />
            <input type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-accent text-bg rounded-[var(--radius-sm)] text-sm font-medium press">Saqlash</button>
        </form>
      )}

      <div className="space-y-2">
        {contracts.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-[var(--radius-sm)] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet size={16} className="text-accent" />
              <div>
                <p className="text-sm font-medium">{c.gyms?.name}</p>
                <p className="text-[11px] text-muted">{c.plan} · {Number(c.price_monthly).toLocaleString()} so'm/oy · {c.starts_at}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => sendInvoice(c.id, c.gym_id)} disabled={sending === c.id} className="px-2 py-1 rounded-md bg-accent/10 text-accent text-[10px] font-medium hover:bg-accent/20 press disabled:opacity-50" title="Invoice yuborish">
                <Receipt size={13} className="inline mr-1" />To'lov talab
              </button>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-vgreen/20 text-vgreen" : "bg-muted/20 text-muted"}`}>{c.status}</span>
            </div>
          </div>
        ))}
        {contracts.length === 0 && <p className="text-center text-muted text-sm py-8">Kontraktlar yo'q</p>}
      </div>
    </div>
  );
}
