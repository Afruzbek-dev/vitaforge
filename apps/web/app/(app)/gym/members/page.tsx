"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import Link from "next/link";

type Filter = "all" | "active" | "risk" | "lost";

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const sb = getSupabase();

  const { data: members } = useQuery({
    queryKey: ["gym-members-crm"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      if (!me?.gym_id) return [];
      const { data } = await sb.from("users").select("id, full_name, phone, created_at").eq("gym_id", me.gym_id).eq("role", "member");
      const { data: profiles } = await sb.from("member_profiles").select("user_id, goal").in("user_id", (data ?? []).map((m) => m.id));
      const { data: streaks } = await sb.from("member_streaks").select("member_id, current_streak, total_points, last_activity").in("member_id", (data ?? []).map((m) => m.id));

      const pMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));
      const sMap = Object.fromEntries((streaks ?? []).map((s) => [s.member_id, s]));
      const now = Date.now();

      return (data ?? []).map((m) => {
        const s = sMap[m.id];
        const lastSeen = s?.last_activity ? new Date(s.last_activity).getTime() : 0;
        const daysAgo = lastSeen ? Math.floor((now - lastSeen) / 86400000) : 999;
        const risk = daysAgo >= 14 ? "lost" : daysAgo >= 5 ? "risk" : "active";
        return { ...m, goal: pMap[m.id]?.goal, streak: s?.current_streak ?? 0, points: s?.total_points ?? 0, days_ago: daysAgo, risk };
      }).sort((a, b) => b.points - a.points);
    },
  });

  const filtered = (members ?? [])
    .filter((m) => filter === "all" || m.risk === filter)
    .filter((m) => !search || m.full_name?.toLowerCase().includes(search.toLowerCase()));

  const FILTERS: { id: Filter; label: string; icon: string }[] = [
    { id: "all", label: "Barchasi", icon: "👥" },
    { id: "active", label: "Faol", icon: "✅" },
    { id: "risk", label: "Xavfda", icon: "⚠️" },
    { id: "lost", label: "Yo'qolgan", icon: "💔" },
  ];

  const riskColor = (r: string) => r === "lost" ? "text-vred" : r === "risk" ? "text-[#ff9f43]" : "text-vgreen";
  const riskBg = (r: string) => r === "lost" ? "bg-vred/10" : r === "risk" ? "bg-[#ff9f43]/10" : "bg-vgreen/10";

  return (
    <div className="max-w-4xl space-y-5 animate-fadeUp">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">👥 A'zolar</h1>
          <p className="text-muted text-xs font-mono mt-0.5">{filtered.length} TA A'ZO</p>
        </div>
        <Link href="/gym/invite"><Button size="sm">+ Qo'shish</Button></Link>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2 flex-wrap">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="w-40" />
        {FILTERS.map((f) => (
          <Button key={f.id} variant={filter === f.id ? "default" : "secondary"} size="sm" onClick={() => setFilter(f.id)} className="text-xs">
            {f.icon} {f.label}
          </Button>
        ))}
      </div>

      {/* Members cards */}
      {filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <p className="text-muted text-sm">A'zo topilmadi</p>
          <Link href="/gym/invite"><Button size="sm" className="mt-3">+ Birinchi a'zo</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((m: any) => (
            <Link key={m.id} href={`/gym/members/${m.id}`}>
              <Card className="hover:border-accent-border/40 transition-colors cursor-pointer">
                <CardContent className="p-3 flex items-center gap-3">
                  {/* Avatar + Risk indicator */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${riskBg(m.risk)} ${riskColor(m.risk)}`}>
                    {m.full_name?.[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-vtext truncate">{m.full_name}</p>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${riskBg(m.risk)} ${riskColor(m.risk)}`}>
                        {m.risk === "lost" ? "YO'Q" : m.risk === "risk" ? "XAVF" : "FAOL"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted">{m.goal ?? "—"} · {m.days_ago < 999 ? `${m.days_ago}d oldin` : "hech qachon"}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 text-center shrink-0">
                    <div>
                      <p className="text-xs font-bold text-accent">{m.streak}</p>
                      <p className="text-[8px] text-muted">🔥</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-vtext">{m.points}</p>
                      <p className="text-[8px] text-muted">⚡</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
