"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

const GOALS = [
  { value: "weight_loss", label: "Vazn yo'qotish", icon: "📉", color: "#ff5252" },
  { value: "muscle_gain", label: "Mushak olish", icon: "💪", color: "#e8ff47" },
  { value: "endurance", label: "Chidamlilik", icon: "🏃", color: "#5299ff" },
  { value: "health", label: "Umumiy sog'liq", icon: "❤️", color: "#4dffb4" },
];

export default function GroupsPage() {
  const qc = useQueryClient();
  const sb = getSupabase();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("muscle_gain");
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("groups").select("*").eq("gym_id", me?.gym_id).eq("is_active", true).order("created_at", { ascending: false });
      // Get member counts and members per group
      const enriched = await Promise.all((data ?? []).map(async (g) => {
        const { data: gm } = await sb.from("group_members").select("member_id").eq("group_id", g.id);
        const memberIds = (gm ?? []).map((m) => m.member_id);
        let members: any[] = [];
        if (memberIds.length) {
          const { data: users } = await sb.from("users").select("id, full_name").in("id", memberIds);
          members = users ?? [];
        }
        return { ...g, members, count: memberIds.length };
      }));
      return enriched;
    },
  });

  const { data: gymMembers } = useQuery({
    queryKey: ["gym-members-for-groups"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("users").select("id, full_name").eq("gym_id", me?.gym_id).eq("role", "member");
      return data ?? [];
    },
  });

  const createGroup = useMutation({
    mutationFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const color = GOALS.find((g) => g.value === goal)?.color ?? "#e8ff47";
      await sb.from("groups").insert({ gym_id: me?.gym_id, name, goal, created_by: user!.id, color });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["groups"] }); setName(""); setShowCreate(false); },
  });

  const addMember = useMutation({
    mutationFn: async ({ groupId, memberId }: { groupId: string; memberId: string }) => {
      await sb.from("group_members").upsert({ group_id: groupId, member_id: memberId }, { onConflict: "group_id,member_id" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });

  const removeMember = useMutation({
    mutationFn: async ({ groupId, memberId }: { groupId: string; memberId: string }) => {
      await sb.from("group_members").delete().eq("group_id", groupId).eq("member_id", memberId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });

  const deleteGroup = useMutation({
    mutationFn: async (groupId: string) => {
      await sb.from("groups").update({ is_active: false }).eq("id", groupId);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["groups"] }); setOpenGroup(null); },
  });

  return (
    <div className="max-w-4xl space-y-6 animate-fadeUp">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">🎯 Guruhlar</h1>
          <p className="text-muted text-xs font-mono mt-1">MAQSAD BO'YICHA BOSHQARISH</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? "Bekor" : "+ Yangi guruh"}</Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-accent-border/40">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <Label>Guruh nomi</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Vazn yo'qotish — iyun" />
            </div>
            <div className="space-y-2">
              <Label>Maqsad</Label>
              <div className="grid grid-cols-4 gap-2">
                {GOALS.map((g) => (
                  <button key={g.value} onClick={() => setGoal(g.value)}
                    className={`p-3 rounded-lg border text-center transition-colors ${goal === g.value ? "border-accent bg-accent/5" : "border-border hover:border-accent-border"}`}>
                    <span className="text-lg">{g.icon}</span>
                    <p className={`text-xs mt-1 ${goal === g.value ? "text-accent" : "text-muted"}`}>{g.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => createGroup.mutate()} disabled={!name || createGroup.isPending}>
              {createGroup.isPending ? "Yaratilmoqda..." : "✓ Guruh yaratish"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Groups list */}
      {(groups ?? []).length === 0 && !showCreate && (
        <Card><CardContent className="p-8 text-center"><p className="text-muted text-sm mb-3">Hali guruh yo'q</p><Button onClick={() => setShowCreate(true)}>+ Birinchi guruh</Button></CardContent></Card>
      )}

      <div className="space-y-4">
        {(groups ?? []).map((g: any) => {
          const goalInfo = GOALS.find((o) => o.value === g.goal);
          const isOpen = openGroup === g.id;
          const existingIds = new Set(g.members.map((m: any) => m.id));
          const available = (gymMembers ?? []).filter((m) => !existingIds.has(m.id));

          return (
            <Card key={g.id} className={isOpen ? "border-accent-border/50" : ""}>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpenGroup(isOpen ? null : g.id)}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{goalInfo?.icon ?? "👥"}</span>
                    {g.name}
                    <span className="text-xs font-mono text-muted">({g.count} a'zo)</span>
                  </CardTitle>
                  <span className="text-muted text-sm">{isOpen ? "▲" : "▼"}</span>
                </div>
              </CardHeader>

              {isOpen && (
                <CardContent className="space-y-4">
                  {/* Members in group */}
                  <div>
                    <p className="text-xs font-mono text-muted mb-2">A'ZOLAR</p>
                    {g.members.length === 0 ? <p className="text-muted text-sm">Hali a'zo yo'q</p> : (
                      <div className="space-y-1">
                        {g.members.map((m: any) => (
                          <div key={m.id} className="flex items-center justify-between p-2 rounded-lg border border-border/50">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">{m.full_name?.[0]}</div>
                              <span className="text-sm text-vtext">{m.full_name}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-vred text-xs h-6" onClick={() => removeMember.mutate({ groupId: g.id, memberId: m.id })}>✕</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add member */}
                  {available.length > 0 && (
                    <div>
                      <p className="text-xs font-mono text-muted mb-2">QO'SHISH</p>
                      <div className="flex flex-wrap gap-2">
                        {available.map((m) => (
                          <Button key={m.id} variant="outline" size="sm" className="text-xs" onClick={() => addMember.mutate({ groupId: g.id, memberId: m.id })}>
                            + {m.full_name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delete group */}
                  <div className="pt-2 border-t border-border">
                    <Button variant="ghost" size="sm" className="text-vred text-xs" onClick={() => deleteGroup.mutate(g.id)}>
                      🗑 Guruhni o'chirish
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
