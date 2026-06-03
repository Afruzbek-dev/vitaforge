"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

const GOAL_OPTIONS = [
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

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("groups").select("*, group_members(count)").eq("gym_id", me?.gym_id).eq("is_active", true).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: members } = useQuery({
    queryKey: ["gym", "members"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("users").select("id,full_name").eq("gym_id", me?.gym_id).eq("role", "member");
      return data ?? [];
    },
  });

  const createGroup = useMutation({
    mutationFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      await sb.from("groups").insert({ gym_id: me?.gym_id, name, goal, created_by: user!.id, color: GOAL_OPTIONS.find((g) => g.value === goal)?.color });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["groups"] }); setName(""); setShowCreate(false); },
  });

  const addMember = useMutation({
    mutationFn: async ({ groupId, memberId }: { groupId: string; memberId: string }) => {
      await sb.from("group_members").upsert({ group_id: groupId, member_id: memberId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });

  return (
    <div className="max-w-4xl space-y-6 animate-fadeUp">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">👥 Guruhlar</h1>
          <p className="text-muted text-sm font-mono mt-1">MAQSAD BO'YICHA BOSHQARISH</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? "Bekor" : "+ Yangi guruh"}</Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-accent-border/40">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <Label>Guruh nomi</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Vazn yo'qotish — yanvar" />
            </div>
            <div className="space-y-2">
              <Label>Maqsad</Label>
              <div className="grid grid-cols-4 gap-2">
                {GOAL_OPTIONS.map((g) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(groups ?? []).map((g: any) => {
          const goalInfo = GOAL_OPTIONS.find((o) => o.value === g.goal);
          const memberCount = g.group_members?.[0]?.count ?? 0;
          return (
            <Card key={g.id} className="hover:border-accent-border/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span>{goalInfo?.icon ?? "👥"}</span> {g.name}
                    </CardTitle>
                    <p className="text-muted text-xs mt-1">{goalInfo?.label ?? g.goal} · {memberCount} a'zo</p>
                  </div>
                  <span className="w-3 h-3 rounded-full" style={{ background: g.color ?? "#e8ff47" }} />
                </div>
              </CardHeader>
              <CardContent>
                {/* Add member dropdown */}
                <div className="flex gap-2">
                  <select className="flex-1 h-8 rounded-md border border-border bg-surface px-2 text-xs text-vtext" id={`add-${g.id}`}>
                    <option value="">A'zo qo'shish...</option>
                    {(members ?? []).map((m: any) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                  </select>
                  <Button variant="secondary" size="sm" onClick={() => {
                    const sel = (document.getElementById(`add-${g.id}`) as HTMLSelectElement)?.value;
                    if (sel) addMember.mutate({ groupId: g.id, memberId: sel });
                  }}>+</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(groups ?? []).length === 0 && !showCreate && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted text-sm mb-3">Hali guruh yo'q. Maqsad bo'yicha guruhlar yarating!</p>
            <Button onClick={() => setShowCreate(true)}>+ Birinchi guruh</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
