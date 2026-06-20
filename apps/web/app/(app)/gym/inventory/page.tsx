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

export default function InventoryPage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", category: "equipment", quantity: "1", unit: "dona", purchase_price: "", notes: "" });

  const { data: items } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const gymId = await ensureGym();
      const { data } = await sb.from("inventory_items").select("*").eq("gym_id", gymId).order("name");
      return data ?? [];
    },
  });

  const addItem = useMutation({
    mutationFn: async () => {
      const user = await getUser();
      const gymId = await ensureGym();
      await sb.from("inventory_items").insert({ gym_id: gymId, name: form.name, category: form.category, quantity: parseInt(form.quantity), unit: form.unit, purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null, notes: form.notes, added_by: user!.id });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory"] }); setForm({ name: "", category: "equipment", quantity: "1", unit: "dona", purchase_price: "", notes: "" }); setShowAdd(false); },
  });

  const adjustQty = useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: number }) => {
      const item = (items ?? []).find((i) => i.id === id);
      if (!item) return;
      const newQty = Math.max(0, (item.quantity ?? 0) + delta);
      await sb.from("inventory_items").update({ quantity: newQty, updated_at: new Date().toISOString() }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });

  const lowStock = (items ?? []).filter((i: any) => i.quantity <= (i.low_stock_threshold ?? 5));

  return (
    <div className="max-w-4xl space-y-5 animate-fadeUp">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">📦 Inventar</h1>
          <p className="text-muted text-xs font-mono mt-0.5">{(items ?? []).length} TA JIHOZ</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm">{showAdd ? "Bekor" : "+ Qo'shish"}</Button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <Card className="border-vred/20 bg-vred/5">
          <CardContent className="p-3 flex items-center gap-2">
            <span>⚠️</span>
            <p className="text-xs text-vred">{lowStock.length} ta jihoz kam qolgan: {lowStock.map((i: any) => i.name).join(", ")}</p>
          </CardContent>
        </Card>
      )}

      {/* Add form */}
      {showAdd && (
        <Card className="border-accent-border/30 animate-slideUp">
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Nomi</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Gantel 10kg" /></div>
              <div className="space-y-1"><Label>Kategoriya</Label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-vtext">
                  <option value="equipment">Jihozlar</option><option value="consumable">Sarflanuvchi</option><option value="furniture">Mebel</option><option value="other">Boshqa</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><Label>Miqdor</Label><Input type="number" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Birlik</Label><Input value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} placeholder="dona" /></div>
              <div className="space-y-1"><Label>Narx</Label><Input type="number" value={form.purchase_price} onChange={(e) => setForm((p) => ({ ...p, purchase_price: e.target.value }))} placeholder="so'm" /></div>
            </div>
            <Button onClick={() => addItem.mutate()} disabled={!form.name || addItem.isPending} className="w-full">{addItem.isPending ? "..." : "✓ Saqlash"}</Button>
          </CardContent>
        </Card>
      )}

      {/* Items list */}
      {(items ?? []).length === 0 && !showAdd ? (
        <Card><CardContent className="p-8 text-center"><p className="text-muted text-sm">Hali jihoz yo'q</p><Button size="sm" className="mt-3" onClick={() => setShowAdd(true)}>+ Birinchi jihoz</Button></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {(items ?? []).map((item: any) => {
            const isLow = item.quantity <= (item.low_stock_threshold ?? 5);
            return (
              <Card key={item.id} className={isLow ? "border-vred/20" : ""}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${isLow ? "bg-vred/10 text-vred" : "bg-accent/10 text-accent"}`}>
                    {item.category === "equipment" ? "🏋️" : item.category === "consumable" ? "🧴" : "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-vtext truncate">{item.name}</p>
                    <p className="text-[10px] text-muted">{item.category} {item.purchase_price ? `· ${Number(item.purchase_price).toLocaleString()} so'm` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="secondary" size="sm" className="w-7 h-7 p-0 text-xs" onClick={() => adjustQty.mutate({ id: item.id, delta: -1 })}>−</Button>
                    <span className={`font-mono text-sm font-bold min-w-[2ch] text-center ${isLow ? "text-vred" : "text-vtext"}`}>{item.quantity}</span>
                    <Button variant="secondary" size="sm" className="w-7 h-7 p-0 text-xs" onClick={() => adjustQty.mutate({ id: item.id, delta: 1 })}>+</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
