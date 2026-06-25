"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store/auth";
import { Building2, Save } from "lucide-react";

export default function GymProfilePage() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ name: "", city: "", phone: "", address: "", capacity: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?.gym_id) return;
    (async () => {
      const { data } = await getSupabase().from("gyms").select("name, city, phone, address, capacity, description").eq("id", user.gym_id).single();
      if (data) setForm({ name: data.name || "", city: data.city || "", phone: data.phone || "", address: data.address || "", capacity: data.capacity?.toString() || "", description: data.description || "" });
    })();
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.gym_id) return;
    setSaving(true);
    await getSupabase().from("gyms").update({ ...form, capacity: Number(form.capacity) || null }).eq("id", user.gym_id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields: { key: keyof typeof form; label: string; placeholder: string; required?: boolean; type?: string; textarea?: boolean }[] = [
    { key: "name", label: "Gym nomi", placeholder: "PowerFit", required: true },
    { key: "city", label: "Shahar", placeholder: "Toshkent", required: true },
    { key: "phone", label: "Telefon", placeholder: "+998901234567" },
    { key: "address", label: "Manzil", placeholder: "To'liq manzil" },
    { key: "capacity", label: "Sig'im", placeholder: "50", type: "number" },
    { key: "description", label: "Tavsif", placeholder: "Gym haqida...", textarea: true },
  ];

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6 animate-fadeUp">
      <div className="flex items-center gap-3 mb-5">
        <Building2 className="text-accent" size={22} />
        <h1 className="font-display font-bold text-lg">Gym profili</h1>
      </div>

      <form onSubmit={save} className="bg-card border border-border rounded-[var(--radius)] p-4 md:p-5 space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs text-muted mb-1 block">{f.label} {f.required && "*"}</label>
            {f.textarea ? (
              <textarea value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} rows={3} className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent resize-none" />
            ) : (
              <input type={f.type || "text"} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} required={f.required} className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
            )}
          </div>
        ))}
        <button type="submit" disabled={saving} className="w-full py-2.5 bg-accent text-bg rounded-[var(--radius-sm)] text-sm font-medium press disabled:opacity-50 flex items-center justify-center gap-2">
          <Save size={15} />{saving ? "Saqlanmoqda..." : saved ? "Saqlandi ✓" : "Saqlash"}
        </button>
      </form>
    </div>
  );
}
