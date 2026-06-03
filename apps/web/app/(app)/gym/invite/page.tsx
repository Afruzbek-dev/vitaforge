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
  const [search, setSearch] = useState("");
  const [found, setFound] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searching, setSearching] = useState(false);

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("groups").select("id, name, goal").eq("gym_id", me?.gym_id).eq("is_active", true);
      return data ?? [];
    },
  });

  const { data: members } = useQuery({
    queryKey: ["gym", "members"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("users").select("id, full_name, email:id").eq("gym_id", me?.gym_id).eq("role", "member");
      return data ?? [];
    },
  });

  const searchUser = async () => {
    if (!search.trim()) return;
    setSearching(true);
    setFound(null);
    // Search by email or full_name
    const { data } = await sb.from("users").select("id, full_name, role, gym_id").or(`full_name.ilike.%${search}%`).limit(5);
    setFound(data ?? []);
    setSearching(false);
  };

  const addToGym = useMutation({
    mutationFn: async (userId: string) => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      // Update user's gym_id
      await sb.from("users").update({ gym_id: me?.gym_id }).eq("id", userId);
      // Add to group if selected
      if (selectedGroup) {
        await sb.from("group_members").upsert({ group_id: selectedGroup, member_id: userId });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gym"] }); setSearch(""); setFound(null); },
  });

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">➕ A'zo qo'shish</h1>
        <p className="text-muted text-sm font-mono mt-1">FOYDALANUVCHI QIDIRISH VA QO'SHISH</p>
      </div>

      {/* Search user */}
      <Card className="border-accent-border/30">
        <CardHeader><CardTitle className="text-base">Foydalanuvchi qidirish</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUser()}
              placeholder="Ism yoki username yozing..." />
            <Button onClick={searchUser} disabled={searching || !search.trim()}>
              {searching ? "..." : "🔍 Qidirish"}
            </Button>
          </div>

          {/* Group selection */}
          {(groups ?? []).length > 0 && (
            <div className="space-y-2">
              <Label>Guruhga qo'shish (ixtiyoriy)</Label>
              <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-vtext">
                <option value="">Guruhsiz qo'shish</option>
                {(groups ?? []).map((g: any) => <option key={g.id} value={g.id}>{g.name} ({g.goal})</option>)}
              </select>
            </div>
          )}

          {/* Search results */}
          {found && (
            <div className="space-y-2">
              {found.length === 0 ? (
                <p className="text-muted text-sm">Topilmadi. Foydalanuvchi avval ro'yxatdan o'tishi kerak.</p>
              ) : (
                found.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">{u.full_name?.[0] ?? "?"}</div>
                      <div>
                        <p className="text-sm font-medium text-vtext">{u.full_name}</p>
                        <p className="text-xs text-muted">{u.gym_id ? "Boshqa gymda" : "Erkin"}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addToGym.mutate(u.id)} disabled={addToGym.isPending || !!u.gym_id}>
                      {u.gym_id ? "Band" : "+ Qo'shish"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current members */}
      <Card>
        <CardHeader><CardTitle className="text-base">Hozirgi a'zolar ({(members ?? []).length})</CardTitle></CardHeader>
        <CardContent>
          {(members ?? []).length === 0 ? <p className="text-muted text-sm">Hali a'zo yo'q</p> : (
            <div className="space-y-2">
              {(members ?? []).map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg border border-border/50">
                  <div className="w-7 h-7 rounded-full bg-vgreen/10 flex items-center justify-center text-vgreen text-xs font-bold">{m.full_name?.[0]}</div>
                  <span className="text-sm text-vtext">{m.full_name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
