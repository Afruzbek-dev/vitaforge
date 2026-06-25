"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Upload, CheckCircle, CreditCard } from "lucide-react";

const plans = [
  { id: "starter", name: "Starter", price: "99,000 so'm/oy" },
  { id: "growth", name: "Growth", price: "299,000 so'm/oy" },
  { id: "premium", name: "Premium", price: "499,000 so'm/oy" },
];

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) return;
    setLoading(true);
    setError("");
    const sb = getSupabase();

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error: uploadErr } = await sb.storage.from("receipts").upload(path, file);
    if (uploadErr) { setError("Fayl yuklanmadi: " + uploadErr.message); setLoading(false); return; }

    const { data: urlData } = sb.storage.from("receipts").getPublicUrl(path);

    const { error: insertErr } = await sb.from("payments").insert({
      name, plan: selectedPlan, receipt_url: urlData.publicUrl,
    });
    if (insertErr) { setError("Xatolik: " + insertErr.message); setLoading(false); return; }

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-[var(--radius)] p-8 text-center max-w-md animate-scaleIn">
          <CheckCircle size={48} className="text-vgreen mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl mb-2">To&apos;lov yuborildi!</h2>
          <p className="text-muted text-sm">Admin tasdiqlashini kuting. Status: <span className="text-[#f59e0b] font-medium">Kutilmoqda</span></p>
          <a href="/dashboard" className="inline-block mt-6 text-accent hover:underline text-sm">← Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-card border border-border rounded-[var(--radius)] p-6 w-full max-w-lg animate-fadeUp">
        <div className="flex items-center gap-3 mb-5">
          <CreditCard className="text-accent" size={22} />
          <h1 className="font-display font-bold text-lg">To&apos;lov qilish</h1>
        </div>

        {error && <p className="text-vred text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1.5">Ismingiz</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border focus:border-accent outline-none text-sm" placeholder="To'liq ism" />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Tarif</label>
            <div className="grid grid-cols-3 gap-2">
              {plans.map((p) => (
                <button key={p.id} type="button" onClick={() => setSelectedPlan(p.id)}
                  className={`p-2.5 rounded-[var(--radius-sm)] border text-center text-xs transition-all ${
                    selectedPlan === p.id ? "border-accent bg-accent-dim text-accent" : "border-border hover:border-muted"
                  }`}>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-muted text-[10px] mt-0.5">{p.price}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">To&apos;lov cheki</label>
            <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-border rounded-[var(--radius-sm)] cursor-pointer hover:border-accent/50 transition-colors">
              <Upload size={20} className="text-muted mb-1.5" />
              <span className="text-xs text-muted">{file ? file.name : "Screenshot yuklang"}</span>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" required />
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-[var(--radius-sm)] bg-accent text-bg font-medium text-sm press disabled:opacity-50">
            {loading ? "Yuklanmoqda..." : "Yuborish"}
          </button>
        </form>
      </div>
    </div>
  );
}
