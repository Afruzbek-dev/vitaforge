"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { ensureGym } from "@/lib/ensure-gym";

const CATEGORIES = { income: ["A'zolik to'lov", "Shaxsiy trening", "Boshqa kirim"], expense: ["Ijara", "Ish haqi", "Uskunalar", "Kommunal", "Marketing", "Boshqa chiqim"] };

export default function FinancePage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "income" as "income" | "expense", category: "", amount: "", description: "", payment_method: "cash" });

  const { data } = useQuery({
    queryKey: ["finance"],
    queryFn: async () => {
      const gymId = await ensureGym();
      const { data: txs } = await sb.from("finance_transactions").select("*").eq("gym_id", gymId).order("occurred_at", { ascending: false }).limit(30);
      const income = (txs ?? []).filter((t) => t.type === "income").reduce((a, t) => a + Number(t.amount), 0);
      const expense = (txs ?? []).filter((t) => t.type === "expense").reduce((a, t) => a + Number(t.amount), 0);
      return { transactions: txs ?? [], income, expense, balance: income - expense };
    },
  });

  const addTx = useMutation({
    mutationFn: async () => {
      const user = await getUser();
      const gymId = await ensureGym();
      await sb.from("finance_transactions").insert({ gym_id: gymId, type: form.type, category: form.category || CATEGORIES[form.type][0], amount: parseFloat(form.amount), description: form.description, payment_method: form.payment_method, recorded_by: user!.id });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["finance"] }); setForm({ type: "income", category: "", amount: "", description: "", payment_method: "cash" }); setShowForm(false); },
  });

  const fmt = (n: number) => n.toLocaleString("uz-UZ") + " so'm";

  return (
    <div className="max-w-4xl space-y-5 animate-fadeUp">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">💰 Moliya</h1>
          <p className="text-muted text-xs font-mono mt-0.5">KASSA BALANSI</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">{showForm ? "Bekor" : "+ Yozuv"}</Button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-l-2 border-l-vgreen"><CardContent className="p-4"><p className="text-[9px] font-mono text-muted">KIRIM</p><p className="font-display font-bold text-lg text-vgreen">{fmt(data?.income ?? 0)}</p></CardContent></Card>
        <Card className="border-l-2 border-l-vred"><CardContent className="p-4"><p className="text-[9px] font-mono text-muted">CHIQIM</p><p className="font-display font-bold text-lg text-vred">{fmt(data?.expense ?? 0)}</p></CardContent></Card>
        <Card className="border-l-2 border-l-accent"><CardContent className="p-4"><p className="text-[9px] font-mono text-muted">BALANS</p><p className="font-display font-bold text-lg text-accent">{fmt(data?.balance ?? 0)}</p></CardContent></Card>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="border-accent-border/30 animate-slideUp">
          <CardContent className="p-5 space-y-3">
            <div className="flex gap-2">
              {(["income", "expense"] as const).map((t) => (
                <Button key={t} variant={form.type === t ? "default" : "secondary"} size="sm" onClick={() => setForm((p) => ({ ...p, type: t, category: "" }))} className="text-xs">
                  {t === "income" ? "📥 Kirim" : "📤 Chiqim"}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Summa</Label><Input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="500000" /></div>
              <div className="space-y-1"><Label>Kategoriya</Label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-vtext">
                  {CATEGORIES[form.type].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Izoh</Label><Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Ixtiyoriy" /></div>
              <div className="space-y-1"><Label>To'lov usuli</Label>
                <select value={form.payment_method} onChange={(e) => setForm((p) => ({ ...p, payment_method: e.target.value }))} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-vtext">
                  <option value="cash">Naqd</option><option value="card">Karta</option><option value="click">Click</option><option value="payme">Payme</option>
                </select>
              </div>
            </div>
            <Button onClick={() => addTx.mutate()} disabled={!form.amount || addTx.isPending} className="w-full">{addTx.isPending ? "..." : "✓ Saqlash"}</Button>
          </CardContent>
        </Card>
      )}

      {/* Transactions list */}
      <Card>
        <CardContent className="p-4">
          <p className="text-[10px] font-mono text-muted mb-3">SO'NGGI YOZUVLAR</p>
          {(data?.transactions ?? []).length === 0 ? <p className="text-muted text-sm text-center py-4">Hali yozuv yo'q</p> : (
            <div className="space-y-1.5">
              {(data?.transactions ?? []).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${tx.type === "income" ? "bg-vgreen/10 text-vgreen" : "bg-vred/10 text-vred"}`}>{tx.type === "income" ? "↓" : "↑"}</span>
                    <div>
                      <p className="text-xs text-vtext">{tx.category}</p>
                      <p className="text-[9px] text-muted">{tx.description || tx.payment_method} · {new Date(tx.occurred_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-mono font-bold ${tx.type === "income" ? "text-vgreen" : "text-vred"}`}>{tx.type === "income" ? "+" : "-"}{Number(tx.amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
