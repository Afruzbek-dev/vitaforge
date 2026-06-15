"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { LEAGUES, getLevel, UNIT } from "@/lib/gamification";

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<"all" | "league" | string>("all");
  const [league, setLeague] = useState("all");
  const sb = getSupabase();

  // Get groups for filter
  const { data: groups } = useQuery({
    queryKey: ["lb-groups"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      if (!me?.gym_id) return [];
      const { data } = await sb.from("groups").select("id, name, goal").eq("gym_id", me.gym_id).eq("is_active", true);
      return data ?? [];
    },
  });

  const { data } = useQuery({
    queryKey: ["leaderboard", filter, league],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      if (!me?.gym_id) return { entries: [], myRank: null };

      let memberIds: string[] = [];

      if (filter !== "all" && filter !== "league") {
        // Filter by group
        const { data: gm } = await sb.from("group_members").select("member_id").eq("group_id", filter);
        memberIds = (gm ?? []).map((g) => g.member_id);
        if (!memberIds.length) return { entries: [], myRank: null };
      } else {
        const { data: members } = await sb.from("users").select("id").eq("gym_id", me.gym_id).eq("role", "member");
        memberIds = (members ?? []).map((m) => m.id);
      }

      const { data: streaks } = await sb.from("member_streaks").select("member_id, total_points, current_streak").in("member_id", memberIds);
      const { data: users } = await sb.from("users").select("id, full_name").in("id", memberIds);
      const nameMap = Object.fromEntries((users ?? []).map((u) => [u.id, u.full_name]));

      // If league filter
      let filtered = streaks ?? [];
      if (filter === "league" && league !== "all") {
        const { data: profiles } = await sb.from("member_profiles").select("user_id, goal").in("user_id", memberIds);
        const goalMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.goal]));
        filtered = filtered.filter((s) => goalMap[s.member_id] === league);
      }

      filtered.sort((a, b) => b.total_points - a.total_points);
      const entries = filtered.map((s, i) => ({ rank: i + 1, ...s, full_name: nameMap[s.member_id], level: getLevel(s.total_points) }));
      const myRank = entries.find((e) => e.member_id === user!.id);
      return { entries: entries.slice(0, 30), myRank };
    },
  });

  const entries = data?.entries ?? [];
  const myRank = data?.myRank;

  return (
    <div className="max-w-3xl space-y-5 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">🏆 Kuchlar Maydoni</h1>
        <p className="text-muted text-xs font-mono mt-1">GURUH VA LIGA BO'YICHA REYTING</p>
      </div>

      {/* Filter: All / Groups / Leagues */}
      <div className="space-y-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <Button variant={filter === "all" ? "default" : "secondary"} size="sm" onClick={() => setFilter("all")} className="text-xs shrink-0">🏆 Barchasi</Button>
          <Button variant={filter === "league" ? "default" : "secondary"} size="sm" onClick={() => setFilter("league")} className="text-xs shrink-0">🎯 Liga</Button>
          {(groups ?? []).map((g: any) => (
            <Button key={g.id} variant={filter === g.id ? "default" : "secondary"} size="sm" onClick={() => setFilter(g.id)} className="text-xs shrink-0">
              👥 {g.name}
            </Button>
          ))}
        </div>

        {/* League sub-filter */}
        {filter === "league" && (
          <div className="flex gap-1.5 overflow-x-auto">
            <Button variant={league === "all" ? "default" : "secondary"} size="sm" onClick={() => setLeague("all")} className="text-[10px] shrink-0">Barchasi</Button>
            {LEAGUES.map((l) => (
              <Button key={l.id} variant={league === l.id ? "default" : "secondary"} size="sm" onClick={() => setLeague(l.id)} className="text-[10px] shrink-0">
                {l.emoji} {l.name.split(" ")[0]}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* My position */}
      {myRank && (
        <Card className="border-accent-border/40 bg-accent/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: `${myRank.level.color}20` }}>{myRank.level.emoji}</div>
            <div className="flex-1">
              <p className="font-display font-bold" style={{ color: myRank.level.color }}>{myRank.level.name}</p>
              <p className="text-muted text-xs">#{myRank.rank} · {UNIT.emoji} {myRank.total_points} Kuch · 🔥{myRank.current_streak}d</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      {entries.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted text-sm">Bu guruh/ligada hali a'zo yo'q</CardContent></Card>
      ) : (
        <div className="space-y-1.5">
          {entries.map((e: any) => {
            const medals = ["", "🥇", "🥈", "🥉"];
            const isTop3 = e.rank <= 3;
            return (
              <Card key={e.member_id} className={isTop3 ? "border-accent-border/30" : ""}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm ${isTop3 ? "bg-accent text-bg" : "bg-surface text-muted"}`}>
                    {isTop3 ? medals[e.rank] : e.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-vtext truncate">{e.full_name}</p>
                    <p className="text-[10px] text-muted">{e.level.emoji} {e.level.name} · 🔥{e.current_streak}d</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-sm text-accent">{e.total_points.toLocaleString()}</p>
                    <p className="text-[9px] text-muted">{UNIT.emoji}</p>
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
