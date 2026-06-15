"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { ensureGym } from "@/lib/ensure-gym";

export default function InvitePage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const [search, setSearch] = useState("");
  const [found, setFound] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  // Yuborilgan invitelar
  const { data: sentInvites } = useQuery({
    queryKey: ["sent-invites"],
    queryFn: async () => {
      const user = await getUser();
      const { data } = await sb.from("invitations").select("*").eq("invited_by", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Gym a'zolari
  const { data: members } = useQuery({
    queryKey: ["gym-current-members"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      if (!me?.gym_id) return [];
      const { data } = await sb.from("users").select("id, full_name, role").eq("gym_id", me.gym_id).neq("id", user!.id);
      return data ?? [];
    },
  });

  // Qidirish
  const searchUsers = async () => {
    if (!search.trim()) return;
    const user = await getUser();
    const { data } = await sb.from("users").select("id, full_name, gym_id, role").ilike("full_name", `%${search}%`).neq("id", user!.id).limit(10);
    setFound(data ?? []);
  };

  // Invite yuborish
  const sendInvite = useMutation({
    mutationFn: async (targetUser: any) => {
      const user = await getUser();
      const gymId = await ensureGym();
      // Invitation yaratish
      await sb.from("invitations").insert({
        gym_id: gymId,
        invited_by: user!.id,
        email: targetUser.id, // user_id ni email fieldda saqlaymiz (hack, lekin ishlaydi)
        role: "member",
        status: "pending",
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sent-invites"] }); setMessage("✅ Taklif yuborildi!"); setSearch(""); setFound([]); },
    onError: (e: any) => setMessage(`❌ ${e.message}`),
  });

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">➕ A'zo taklif qilish</h1>
        <p className="text-muted text-xs font-mono mt-1">QIDIRISH VA INVITE YUBORISH</p>
      </div>

      {message && (
        <Card className={message.startsWith("✅") ? "border-vgreen/30 bg-vgreen/5" : "border-vred/30 bg-vred/5"}>
          <CardContent className="p-3 text-sm">{message}</CardContent>
        </Card>
      )}

      {/* Qidirish */}
      <Card>
        <CardHeader><CardTitle className="text-base">Foydalanuvchi qidirish</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchUsers()} placeholder="Ism yozing..." />
            <Button onClick={searchUsers} disabled={!search.trim()}>🔍</Button>
          </div>
          {found.length > 0 && (
            <div className="space-y-2">
              {found.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">{u.full_name?.[0]}</div>
                    <div>
                      <p className="text-sm text-vtext">{u.full_name}</p>
                      <p className="text-[10px] text-muted">{u.gym_id ? "Boshqa gym da" : "Erkin"} · {u.role}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => sendInvite.mutate(u)} disabled={!!u.gym_id || sendInvite.isPending}>
                    {u.gym_id ? "Band" : "📩 Taklif"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Yuborilgan takliflar */}
      <Card>
        <CardHeader><CardTitle className="text-base">Yuborilgan takliflar ({(sentInvites ?? []).length})</CardTitle></CardHeader>
        <CardContent>
          {(sentInvites ?? []).length === 0 ? <p className="text-muted text-sm">Hali taklif yuborilmagan</p> : (
            <div className="space-y-2">
              {(sentInvites ?? []).map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg border border-border/50 text-sm">
                  <span className="text-vtext">{inv.email?.slice(0, 8)}...</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${inv.status === "accepted" ? "bg-vgreen/10 text-vgreen" : inv.status === "rejected" ? "bg-vred/10 text-vred" : "bg-accent/10 text-accent"}`}>
                    {inv.status === "accepted" ? "✅ QABUL" : inv.status === "rejected" ? "❌ RAD" : "⏳ KUTILMOQDA"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hozirgi a'zolar */}
      <Card>
        <CardHeader><CardTitle className="text-base">Gym a'zolari ({(members ?? []).length})</CardTitle></CardHeader>
        <CardContent>
          {(members ?? []).length === 0 ? <p className="text-muted text-sm">Hali a'zo yo'q</p> : (
            <div className="space-y-1">
              {(members ?? []).map((m: any) => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg border border-border/30">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${m.role === "trainer" ? "bg-vblue/20 text-vblue" : "bg-vgreen/10 text-vgreen"}`}>{m.full_name?.[0]}</div>
                  <span className="text-sm text-vtext flex-1">{m.full_name}</span>
                  <span className="text-[9px] font-mono text-muted">{m.role}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
