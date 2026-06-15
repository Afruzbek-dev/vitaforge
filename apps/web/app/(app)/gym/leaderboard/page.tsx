"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { LEAGUES, getLevel, UNIT } from "@/lib/gamification";

export default function LeaderboardPage() {
  const [league, setLeague] = useState("all");
  const sb = getSupabase();

  const { data } = useQuery({
    queryKey: ["leaderboard", league],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      if (!me?.gym_id) return { entries: [], myRank: null, leagueCounts: {} };

      // Get all members with streaks
      const { data: members } = await sb.from("users").select("id, full_name").eq("gym_id", me.gym_id).eq("role", "member");
      const ids = (members ?? []).map((m) => m.id);
      if (!ids.length) return { entries: [], myRank: null, leagueCounts: {} };

      const { data: streaks } = await sb.from("member_streaks").select("member_id, total_points, current_streak").in("member_id", ids);
      const { data: profiles } = await sb.from("member_profiles").select("user_id, goal").in("user_id", ids);

      const nameMap = Object.fromEntries((members ?? []).map((m) => [m.id, m.full_name]));
      const goalMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.goal]));

      // Filter by league
      let filtered = (streaks ?? []).map((s) => ({ ...s, full_name: nameMap[s.member_id], goal: goalMap[s.member_id] }));
      if (league !== "all") filtered = filtered.filter((s) => s.goal === league);

      // Sort by points
      filtered.sort((a, b) => b.total_points - a.total_points);
      const entries = filtered.map((s, i) => ({ rank: i + 1, ...s, level: getLevel(s.total_points) }));
      const myRank = entries.find((e) => e.member_id === user!.id);

      // League counts
      const leagueCounts: Record<string, number> = {};
      for (const p of profiles ?? []) { leagueCounts[p.goal] = (leagueCounts[p.goal] ?? 0) + 1; }

      return { entries: entries.slice(0, 20), myRank, leagueCounts };
    },
  });

  const entries = data?.entries ?? [];
  const myRank = data?.myRank;

  return (
    <div className="max-w-3xl space-y-5 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">🏆 Kuchlar Maydoni</h1>
        <p className="text-muted text-xs font-mono mt-1">MAQSAD LIGALARI BO'YICHA REYTING</p>
      </div>

      {/* League selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <Button variant={league === "all" ? "default" : "secondary"} size="sm" onClick={() => setLeague("all")} className="text-xs shrink-0">🏆 Barchasi</Button>
        {LEAGUES.map((l) => (
          <Button key={l.id} variant={league === l.id ? "default" : "secondary"} size="sm" onClick={() => setLeague(l.id)} className="text-xs shrink-0">
            {l.emoji} {l.name.split(" ")[0]}
          </Button>
        ))}
      </div>

      {/* My position */}
      {myRank && (
        <Card className="border-accent-border/40 bg-accent/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: `${myRank.level.color}20` }}>
              {myRank.level.emoji}
            </div>
            <div className="flex-1">
              <p className="font-display font-bold" style={{ color: myRank.level.color }}>{myRank.level.name}</p>
              <p className="text-muted text-xs">#{myRank.rank} · {UNIT.emoji} {myRank.total_points} Kuch</p>
            </div>
            {myRank.level.next && (
              <div className="text-right text-xs text-muted">
                <p>→ {myRank.level.next.emoji} {myRank.level.next.name}</p>
                <p className="text-accent font-mono">{myRank.level.pointsToNext} qoldi</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      {entries.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted text-sm">Hali ma'lumot yo'q</CardContent></Card>
      ) : (
        <div className="space-y-1.5">
          {entries.map((e: any) => {
            const isTop3 = e.rank <= 3;
            const medals = ["", "🥇", "🥈", "🥉"];
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

      {/* League stats for owner */}
      {data?.leagueCounts && Object.keys(data.leagueCounts).length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Liga taqsimoti</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {LEAGUES.map((l) => (
              <span key={l.id} className="text-xs px-2 py-1 rounded-full border border-border" style={{ color: l.color }}>
                {l.emoji} {data.leagueCounts[l.id] ?? 0}
              </span>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
