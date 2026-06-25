"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Clock, Image, X } from "lucide-react";

type Status = "pending" | "approved" | "rejected";

interface Payment {
  id: number;
  name: string;
  plan: string;
  receipt_url: string | null;
  status: Status;
  created_at: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    const { data } = await getSupabase().from("payments").select("*").order("created_at", { ascending: false });
    setPayments(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: number, status: Status) => {
    await getSupabase().from("payments").update({ status }).eq("id", id);
    setPayments((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
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
      <h1 className="font-display font-bold text-lg mb-4">To&apos;lovlar</h1>

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
        <div className="bg-card border border-border rounded-[var(--radius)] p-8 text-center text-muted text-sm">
          To&apos;lovlar topilmadi
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-[var(--radius-sm)] p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {icon(p.status)}
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-muted">
                    {p.plan} · {new Date(p.created_at).toLocaleDateString("uz")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.receipt_url && (
                  <button onClick={() => setPreview(p.receipt_url)} className="p-1.5 rounded-md hover:bg-surface text-accent" title="Chekni ko'rish">
                    <Image size={16} />
                  </button>
                )}
                {p.status === "pending" ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => updateStatus(p.id, "approved")} className="px-2.5 py-1.5 rounded-md bg-vgreen/20 text-vgreen text-[11px] font-medium hover:bg-vgreen/30 press">
                      Tasdiqlash
                    </button>
                    <button onClick={() => updateStatus(p.id, "rejected")} className="px-2.5 py-1.5 rounded-md bg-vred/20 text-vred text-[11px] font-medium hover:bg-vred/30 press">
                      Rad
                    </button>
                  </div>
                ) : (
                  <span className={`text-[11px] font-medium ${p.status === "approved" ? "text-vgreen" : "text-vred"}`}>
                    {p.status === "approved" ? "✓ Tasdiqlangan" : "✕ Rad"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-md w-full max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white">
              <X size={24} />
            </button>
            <img src={preview} alt="To'lov cheki" className="w-full h-auto rounded-[var(--radius)] object-contain max-h-[75vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
