"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Building2, MapPin, Phone, Users, FileText, Clock } from "lucide-react";

const STEPS = ["Gym haqida", "Batafsil", "Yuborish"];

export default function GymOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", address: "", phone: "", capacity: "", description: "" });

  const submit = async () => {
    const u = await getUser();
    if (!u) return;
    const sb = getSupabase();
    const slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { data: gym } = await sb.from("gyms").insert({ ...form, slug, capacity: Number(form.capacity) || null, owner_id: u.id, status: "pending" }).select("id").single();
    if (gym) await sb.from("users").update({ gym_id: gym.id, role: "gym_owner" }).eq("id", u.id);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-card border border-border rounded-[var(--radius)] p-8 text-center max-w-md animate-scaleIn">
        <Clock size={40} className="text-[#f59e0b] mx-auto mb-3" />
        <h2 className="font-display font-bold text-lg mb-2">So'rov yuborildi!</h2>
        <p className="text-muted text-sm">Admin sizning gymingizni ko'rib chiqadi va tasdiqlaydi. Bu 24 soat ichida bo'ladi.</p>
        <button onClick={() => router.push("/login")} className="mt-5 px-5 py-2 bg-accent text-bg rounded-[var(--radius-sm)] text-sm font-medium press">OK</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-[var(--radius)] p-6 w-full max-w-md animate-fadeUp">
        <div className="flex items-center gap-3 mb-5">
          <Building2 className="text-accent" size={22} />
          <div>
            <h1 className="font-display font-bold text-lg">Gym ro'yxatdan o'tkazish</h1>
            <p className="text-[11px] text-muted">{STEPS[step]} — {step + 1}/{STEPS.length}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-5">
          {STEPS.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-border"}`} />)}
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Gym nomi *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Masalan: PowerFit" required className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Shahar *</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Toshkent" required className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Telefon</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998901234567" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Manzil</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="To'liq manzil" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Sig'im (nechta odam)</label>
              <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="50" className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Gym haqida</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Qisqacha tavsif..." rows={3} className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm outline-none focus:border-accent resize-none" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 text-sm">
            <p className="text-muted text-xs">Ma'lumotlaringiz:</p>
            <div className="bg-surface rounded-[var(--radius-sm)] p-3 space-y-2">
              <div className="flex items-center gap-2"><Building2 size={14} className="text-accent" /><span>{form.name}</span></div>
              <div className="flex items-center gap-2"><MapPin size={14} className="text-muted" /><span>{form.city} {form.address && `· ${form.address}`}</span></div>
              {form.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-muted" /><span>{form.phone}</span></div>}
              {form.capacity && <div className="flex items-center gap-2"><Users size={14} className="text-muted" /><span>{form.capacity} odam</span></div>}
              {form.description && <div className="flex items-center gap-2"><FileText size={14} className="text-muted" /><span className="text-muted">{form.description}</span></div>}
            </div>
            <p className="text-[11px] text-muted">Yuborilgandan so'ng admin ko'rib chiqadi va tasdiqlaydi.</p>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="flex-1 py-2.5 border border-border rounded-[var(--radius-sm)] text-sm text-muted press">Orqaga</button>}
          {step < 2 ? (
            <button onClick={() => setStep(step + 1)} disabled={step === 0 && !form.name} className="flex-1 py-2.5 bg-accent text-bg rounded-[var(--radius-sm)] text-sm font-medium press disabled:opacity-40">Keyingi</button>
          ) : (
            <button onClick={submit} className="flex-1 py-2.5 bg-accent text-bg rounded-[var(--radius-sm)] text-sm font-medium press">Yuborish</button>
          )}
        </div>
      </div>
    </div>
  );
}
