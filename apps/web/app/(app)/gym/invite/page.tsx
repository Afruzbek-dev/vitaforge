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
  const sb = getSupabase();
  const [mode, setMode] = useState<"create" | "search">("create");
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "member" });
  const [search, setSearch] = useState("");
  const [found, setFound] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const { data: members } = useQuery({
    queryKey: ["gym", "all-members"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("users").select("id, full_name, role, created_at").eq("gym_id", me?.gym_id).neq("id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Create new user and add to gym
  const createUser = useMutation({
    mutationFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      if (!me?.gym_id) throw new Error("Gym topilmadi");

      // Use Supabase Admin to create user (via RPC)
      const { data, error } = await sb.rpc("create_gym_member", {
        p_email: form.email,
        p_password: form.password,
        p_full_name: form.full_name,
        p_gym_id: me.gym_id,
        p_role: form.role,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setMessage(`✅ ${form.full_name} yaratildi! Login: ${form.email} / ${form.password}`);
      setForm({ full_name: "", email: "", password: "", role: "member" });
      qc.invalidateQueries({ queryKey: ["gym"] });
    },
    onError: (e: any) => setMessage(`❌ Xato: ${e.message}`),
  });

  // Search existing users
  const searchUsers = async () => {
    if (!search.trim()) return;
    const { data } = await sb.from("users").select("id, full_name, gym_id, role").ilike("full_name", `%${search}%`).limit(10);
    setFound(data ?? []);
  };

  // Add existing user to gym
  const addToGym = useMutation({
    mutationFn: async (userId: string) => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      await sb.from("users").update({ gym_id: me?.gym_id }).eq("id", userId);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gym"] }); setMessage("✅ A'zo qo'shildi!"); setFound([]); setSearch(""); },
  });

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">➕ A'zo qo'shish</h1>
        <p className="text-muted text-xs font-mono mt-1">YANGI YARATISH YOKI MAVJUD QO'SHISH</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button variant={mode === "create" ? "default" : "secondary"} size="sm" onClick={() => setMode("create")}>Yangi yaratish</Button>
        <Button variant={mode === "search" ? "default" : "secondary"} size="sm" onClick={() => setMode("search")}>Mavjud qidirish</Button>
      </div>

      {message && (
        <Card className={message.startsWith("✅") ? "border-vgreen/30 bg-vgreen/5" : "border-vred/30 bg-vred/5"}>
          <CardContent className="p-3 text-sm">{message}</CardContent>
        </Card>
      )}

      {/* CREATE MODE */}
      {mode === "create" && (
        <Card className="border-accent-border/30">
          <CardHeader><CardTitle className="text-base">Yangi foydalanuvchi yaratish</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Ism</Label>
                <Input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Jasur Toshmatov" />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-vtext">
                  <option value="member">A'zo</option>
                  <option value="trainer">Trener</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email (login uchun)</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="user@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Parol</Label>
              <Input value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Kamida 6 belgi" />
            </div>
            <Button onClick={() => createUser.mutate()} disabled={createUser.isPending || !form.full_name || !form.email || form.password.length < 6} className="w-full">
              {createUser.isPending ? "Yaratilmoqda..." : "👤 Foydalanuvchi yaratish"}
            </Button>
            <p className="text-muted text-xs">Yaratilgan login/parol a'zoga beriladi. U shu bilan kiradi.</p>
          </CardContent>
        </Card>
      )}

      {/* SEARCH MODE */}
      {mode === "search" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Mavjud foydalanuvchi qidirish</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchUsers()} placeholder="Ism yozing..." />
              <Button onClick={searchUsers}>🔍</Button>
            </div>
            {found.length > 0 && (
              <div className="space-y-2">
                {found.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm text-vtext">{u.full_name}</p>
                      <p className="text-xs text-muted">{u.gym_id ? "Boshqa gym da" : "Erkin"}</p>
                    </div>
                    <Button size="sm" onClick={() => addToGym.mutate(u.id)} disabled={!!u.gym_id}>
                      {u.gym_id ? "Band" : "+ Qo'shish"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current members */}
      <Card>
        <CardHeader><CardTitle className="text-base">Gym dagi a'zolar ({(members ?? []).length})</CardTitle></CardHeader>
        <CardContent>
          {(members ?? []).length === 0 ? <p className="text-muted text-sm">Hali a'zo yo'q</p> : (
            <div className="space-y-2">
              {(members ?? []).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${m.role === "trainer" ? "bg-vblue/20 text-vblue" : "bg-accent/10 text-accent"}`}>{m.full_name?.[0]}</div>
                    <span className="text-sm text-vtext">{m.full_name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted">{m.role === "trainer" ? "TRENER" : "A'ZO"}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
