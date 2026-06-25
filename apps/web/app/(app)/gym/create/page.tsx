"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle } from "lucide-react";

export default function CreateGymPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", city: "", address: "", phone: "", capacity: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await getSupabase().from("gyms").insert({ ...form, slug, capacity: Number(form.capacity) || null, status: "approved" });
    setLoading(false);
    setDone(true);
    setTimeout(() => router.push("/gym/all"), 1500);
  };

  if (done) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center animate-scaleIn"><CheckCircle size={40} className="text-vgreen mx-auto mb-3" /><p className="font-medium">Gym yaratildi!</p></div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto animate-fadeUp space-y-5">
      <div className="flex items-center gap-3">
        <Building2 className="text-accent" size={22} />
        <h1 className="font-display font-bold text-lg">Yangi Gym yaratish</h1>
      </div>

      <form onSubmit={submit} className="bg-card border border-border rounded-[var(--radius)] p-5 space-y-4">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gym nomi *" required className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
        <div className="grid grid-cols-2 gap-3">
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Shahar" className="px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefon" className="px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
        </div>
        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Manzil" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Sig'im (odam)" className="px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
          <div />
        </div>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tavsif" rows={3} className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent resize-none" />
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-accent text-bg rounded-[var(--radius-sm)] font-medium text-sm press disabled:opacity-50">
          {loading ? "Yaratilmoqda..." : "Yaratish"}
        </button>
      </form>
    </div>
  );
}
