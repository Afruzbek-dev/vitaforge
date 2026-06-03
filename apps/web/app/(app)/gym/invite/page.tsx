"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export default function InvitePage() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const sb = getSupabase();

  const { data } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data: invites } = await sb.from("invitations").select("*").eq("gym_id", me?.gym_id).order("created_at", { ascending: false });
      return invites ?? [];
    },
  });

  const invite = useMutation({
    mutationFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      await sb.from("invitations").insert({
        gym_id: me?.gym_id,
        invited_by: user!.id,
        email: email || null,
        phone: phone || null,
        role: "member",
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invitations"] }); setEmail(""); setPhone(""); },
  });

  const invites = data ?? [];

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">➕ A'zo qo'shish</h1>
        <p className="text-muted text-sm font-mono mt-1">EMAIL YOKI TELEFON ORQALI TAKLIF</p>
      </div>

      <Card className="border-accent-border/30">
        <CardHeader><CardTitle className="text-base">Yangi a'zo taklif qilish</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998901234567" />
            </div>
          </div>
          <Button onClick={() => invite.mutate()} disabled={invite.isPending || (!email && !phone)}>
            {invite.isPending ? "Yuborilmoqda..." : "📩 Taklif yuborish"}
          </Button>
          {invite.isSuccess && <p className="text-vgreen text-sm">✅ Taklif yuborildi!</p>}
        </CardContent>
      </Card>

      {/* Invitations list */}
      <Card>
        <CardHeader><CardTitle className="text-base">Yuborilgan takliflar ({invites.length})</CardTitle></CardHeader>
        <CardContent>
          {invites.length === 0 ? <p className="text-muted text-sm">Hali taklif yuborilmagan</p> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-xs font-mono uppercase">
                  <th className="text-left py-2">Kontakt</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Sana</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-border/50">
                    <td className="py-3 text-vtext">{inv.email || inv.phone}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${inv.status === "accepted" ? "bg-vgreen/10 text-vgreen" : inv.status === "expired" ? "bg-vred/10 text-vred" : "bg-accent/10 text-accent"}`}>
                        {inv.status === "accepted" ? "QABUL" : inv.status === "expired" ? "MUDDATI O'TDI" : "KUTILMOQDA"}
                      </span>
                    </td>
                    <td className="py-3 text-muted">{new Date(inv.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
