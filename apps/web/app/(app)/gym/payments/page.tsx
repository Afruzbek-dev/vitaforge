"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store/auth";
import { CheckCircle, XCircle, Clock, Image, X, Send } from "lucide-react";

type Status = "pending" | "approved" | "rejected";

interface Payment {
  id: number;
  name: string;
  plan: string;
  receipt_url: string | null;
  status: Status;
  created_at: string;
  user_id?: string;
}

export default function AdminPaymentsPage() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [preview, setPreview] = useState<string | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [reqForm, setReqForm] = useState({ user_id: "", amount: "", note: "" });

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    const sb = getSupabase();
    const { data } = await sb.from("payments").select("*").order("created_at", { ascending: false });
    setPayments(data || []);
    setLoading(false);
    if (user?.role === "gym_owner" && user.gym_id) {
      const { data: m } = await sb.from("users").select("id, full_name, phone").eq("gym_id", user.gym_id).eq("role", "member");
      setMembers(m || []);
    }
  };

  const updateStatus = async (id: number, status: Status) => {
    await getSupabase().from("payments").update({ status }).eq("id", id);
    setPayments((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const sendPaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.user_id || !reqForm.amount) return;
    await getSupabase().from("payment_requests").insert({ user_id: reqForm.user_id, gym_id: user?.gym_id, amount: Number(reqForm.amount), note: reqForm.note, status: "pending" });
    setShowRequest(false);
    setReqForm({ user_id: "", amount: "", note: "" });
    alert("To'lov so'rovi yuborildi!");
  };

  const filtered = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  const icon = (s: string) => {
    if (s === "approved") return <CheckCircle size={15} className="text-vgreen" />;
    if (s === "rejected") return <XCircle size={15} className="text-vred" />;
    return <Clock size={15} className="text-[#f59e0b]" />;
  };

  const filters: { label: string; value: "all" | Status }[] = [
    { label: "Barchasi", value: "all" },
    { label: "Kutilmoqda", value: "pending" },
    { label: "Tasdiqlangan", value: "approved" },
    { label: "Rad etilgan", value: "rejected" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fadeUp">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h1 className="font-display font-bold text-lg">To&apos;lovlar</h1>
        {user?.role === "gym_owner" && (
          <button onClick={() => setShowRequest(!showRequest)} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-bg rounded-[var(--radius-sm)] text-xs font-medium press">
            <Send size={13} /> To'lov so'rash
          </button>
        )}
      </div>

      {/* Payment request form */}
      {showRequest && (
        <form onSubmit={sendPaymentRequest} className="bg-card border border-border rounded-[var(--radius)] p-4 mb-4 space-y-3">
          <p className="text-xs font-medium text-muted">A'zoga to'lov so'rovi yuborish</p>
          <select value={reqForm.user_id} onChange={(e) => setReqForm({ ...reqForm, user_id: e.target.value })} required className="w-full px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-sm">
            <option value="">A'zo tanlang</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.full_name} ({m.phone})</option>)}
          </select>
          <div className="flex gap-2">
            <input type="number" value={reqForm.amount} onChange={(e) => setReqForm({ ...reqForm, amount: e.target.value })} placeholder="Summa (so'm)" required className="flex-1 px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-sm" />
            <input value={reqForm.note} onChange={(e) => setReqForm({ ...reqForm, note: e.target.value })} placeholder="Izoh (ixtiyoriy)" className="flex-1 px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-accent text-bg rounded-[var(--radius-sm)] text-sm font-medium press">Yuborish</button>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === f.value ? "bg-accent text-bg" : "bg-surface border border-border text-muted hover:text-vtext"}`}>
            {f.label}
            {f.value !== "all" && <span className="ml-1 opacity-70">({payments.filter((p) => p.status === f.value).length})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted text-sm">Yuklanmoqda...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-[var(--radius)] p-8 text-center text-muted text-sm">To&apos;lovlar topilmadi</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-[var(--radius-sm)] p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {icon(p.status)}
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-muted">{p.plan} · {new Date(p.created_at).toLocaleDateString("uz")}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.receipt_url && (
                  <button onClick={() => setPreview(p.receipt_url)} className="p-1.5 rounded-md hover:bg-surface text-accent" title="Chekni ko'rish"><Image size={16} /></button>
                )}
                {p.status === "pending" && user?.role === "admin" ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => updateStatus(p.id, "approved")} className="px-2 py-1 rounded-md bg-vgreen/20 text-vgreen text-[10px] font-medium press">Tasdiqlash</button>
                    <button onClick={() => updateStatus(p.id, "rejected")} className="px-2 py-1 rounded-md bg-vred/20 text-vred text-[10px] font-medium press">Rad</button>
                  </div>
                ) : (
                  <span className={`text-[10px] font-medium ${p.status === "approved" ? "text-vgreen" : p.status === "rejected" ? "text-vred" : "text-[#f59e0b]"}`}>
                    {p.status === "approved" ? "✓" : p.status === "rejected" ? "✕" : "⏳"} {p.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-md w-full max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white"><X size={24} /></button>
            <img src={preview} alt="To'lov cheki" className="w-full h-auto rounded-[var(--radius)] object-contain max-h-[75vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
