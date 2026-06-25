"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";

interface Payment {
  id: number;
  name: string;
  plan: string;
  receipt_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    const { data } = await getSupabase().from("payments").select("*").order("created_at", { ascending: false });
    setPayments(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: number, status: "approved" | "rejected") => {
    await getSupabase().from("payments").update({ status }).eq("id", id);
    setPayments((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const icon = (s: string) => {
    if (s === "approved") return <CheckCircle size={15} className="text-vgreen" />;
    if (s === "rejected") return <XCircle size={15} className="text-vred" />;
    return <Clock size={15} className="text-[#f59e0b]" />;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fadeUp">
      <h1 className="font-display font-bold text-lg mb-5">To&apos;lovlar</h1>

      {loading ? (
        <p className="text-muted text-sm">Yuklanmoqda...</p>
      ) : payments.length === 0 ? (
        <div className="bg-card border border-border rounded-[var(--radius)] p-8 text-center text-muted text-sm">
          Hozircha to&apos;lovlar yo&apos;q
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-[var(--radius-sm)] p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {icon(p.status)}
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-muted">
                    {p.plan} · {new Date(p.created_at).toLocaleDateString("uz")}
                    {p.receipt_url && (
                      <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 ml-2 text-accent hover:underline">
                        Chek <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {p.status === "pending" ? (
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => updateStatus(p.id, "approved")}
                    className="px-2.5 py-1.5 rounded-md bg-vgreen/20 text-vgreen text-[11px] font-medium hover:bg-vgreen/30 press">
                    Tasdiqlash
                  </button>
                  <button onClick={() => updateStatus(p.id, "rejected")}
                    className="px-2.5 py-1.5 rounded-md bg-vred/20 text-vred text-[11px] font-medium hover:bg-vred/30 press">
                    Rad
                  </button>
                </div>
              ) : (
                <span className={`text-[11px] font-medium ${p.status === "approved" ? "text-vgreen" : "text-vred"}`}>
                  {p.status === "approved" ? "✓ Tasdiqlangan" : "✕ Rad"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
