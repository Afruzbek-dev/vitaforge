"use client";
import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Upload, CheckCircle, CreditCard, Clock, XCircle } from "lucide-react";

const plans = [
  { id: "starter", name: "Starter", price: "99,000 so'm/oy" },
  { id: "growth", name: "Growth", price: "299,000 so'm/oy" },
  { id: "premium", name: "Premium", price: "499,000 so'm/oy" },
];

interface Payment {
  id: number;
  plan: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  receipt_url: string | null;
}

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Payment[]>([]);
  const [tab, setTab] = useState<"form" | "history">("form");

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    const user = await getUser();
    if (!user) return;
    const { data } = await getSupabase()
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setHistory(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    const sb = getSupabase();
    const user = await getUser();

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}_${user?.id}.${ext}`;
    const { error: uploadErr } = await sb.storage.from("receipts").upload(path, file);
    if (uploadErr) { setError("Fayl yuklanmadi: " + uploadErr.message); setLoading(false); return; }

    const { data: urlData } = sb.storage.from("receipts").getPublicUrl(path);
    const { error: insertErr } = await sb.from("payments").insert({
      user_id: user?.id,
      name: user?.user_metadata?.full_name || "Noma'lum",
      plan: selectedPlan,
      receipt_url: urlData.publicUrl,
    });
    if (insertErr) { setError("Xatolik: " + insertErr.message); setLoading(false); return; }

    setLoading(false);
    setSubmitted(true);
    loadHistory();
  };

  const statusBadge = (s: string) => {
    if (s === "approved") return <span className="inline-flex items-center gap-1 text-[11px] text-vgreen"><CheckCircle size={12} />Tasdiqlangan</span>;
    if (s === "rejected") return <span className="inline-flex items-center gap-1 text-[11px] text-vred"><XCircle size={12} />Rad etilgan</span>;
    return <span className="inline-flex items-center gap-1 text-[11px] text-[#f59e0b]"><Clock size={12} />Kutilmoqda</span>;
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-[var(--radius)] p-8 text-center max-w-md animate-scaleIn">
          <CheckCircle size={48} className="text-vgreen mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl mb-2">To&apos;lov yuborildi!</h2>
          <p className="text-muted text-sm">Admin tasdiqlashini kuting.</p>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={() => { setSubmitted(false); setTab("history"); }} className="text-accent hover:underline text-sm">Tarix</button>
            <a href="/dashboard" className="text-muted hover:underline text-sm">← Dashboard</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-lg animate-fadeUp">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-surface border border-border rounded-[var(--radius-sm)] p-1">
          <button onClick={() => setTab("form")} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${tab === "form" ? "bg-card text-vtext" : "text-muted"}`}>
            To&apos;lov qilish
          </button>
          <button onClick={() => setTab("history")} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${tab === "history" ? "bg-card text-vtext" : "text-muted"}`}>
            Tarix ({history.length})
          </button>
        </div>

        {tab === "form" ? (
          <div className="bg-card border border-border rounded-[var(--radius)] p-6">
            <div className="flex items-center gap-3 mb-5">
              <CreditCard className="text-accent" size={22} />
              <h1 className="font-display font-bold text-lg">To&apos;lov qilish</h1>
            </div>
            {error && <p className="text-vred text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">Tarif</label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map((p) => (
                    <button key={p.id} type="button" onClick={() => setSelectedPlan(p.id)}
                      className={`p-2.5 rounded-[var(--radius-sm)] border text-center text-xs transition-all ${selectedPlan === p.id ? "border-accent bg-accent-dim text-accent" : "border-border hover:border-muted"}`}>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-muted text-[10px] mt-0.5">{p.price}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">To&apos;lov cheki (screenshot)</label>
                <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-border rounded-[var(--radius-sm)] cursor-pointer hover:border-accent/50 transition-colors">
                  <Upload size={20} className="text-muted mb-1.5" />
                  <span className="text-xs text-muted">{file ? file.name : "Screenshot yuklang"}</span>
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" required />
                </label>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-[var(--radius-sm)] bg-accent text-bg font-medium text-sm press disabled:opacity-50">
                {loading ? "Yuklanmoqda..." : "Yuborish"}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="bg-card border border-border rounded-[var(--radius)] p-8 text-center text-muted text-sm">To&apos;lov tarixi bo&apos;sh</div>
            ) : history.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-[var(--radius-sm)] p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium capitalize">{p.plan}</div>
                  <div className="text-[11px] text-muted">{new Date(p.created_at).toLocaleDateString("uz")}</div>
                </div>
                {statusBadge(p.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
