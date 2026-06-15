"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { getLevel, UNIT } from "@/lib/gamification";

const TIME_FILTERS = [
  { id: "7", label: "7 kun" },
  { id: "30", label: "30 kun" },
  { id: "180", label: "6 oy" },
  { id: "365", label: "1 yil" },
];

export default function LeaderboardPage() {
  const [days, setDays] = useState("30");
  const [groupId, setGroupId] = useState("all");
  const sb = getSupabase();

  const { data: groups } = useQuery({
    queryKey: ["lb-groups"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      if (!me?.gym_id) return [];
      const { data } = await sb.from("groups").select("id, name").eq("gym_id", me.gym_id).eq("is_active", true);
      return data ?? [];
    },
  });

  const { data } = useQuery({
    queryKey: ["leaderboard", days, groupId],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      if (!me?.gym_id) return { entries: [], myRank: null };

      // Determine member IDs
      let memberIds: string[];
      if (groupId !== "all") {
        const { data: gm } = await sb.from("group_members").select("member_id").eq("group_id", groupId);
        memberIds = (gm ?? []).map((g) => g.member_id);
        if (!memberIds.length) return { entries: [], myRank: null };
      } else {
        const { data: members } = await sb.from("users").select("id").eq("gym_id", me.gym_id).eq("role", "member");
        memberIds = (members ?? []).map((m) => m.id);
      }
      if (!memberIds.length) return { entries: [], myRank: null };

      // Get attendance count in time period as score
      const since = new Date(Date.now() - parseInt(days) * 86400000).toISOString();
      const { data: attendance } = await sb.from("attendance").select("member_id").in("member_id", memberIds).gte("checked_in_at", since);

      // Count per member
      const countMap: Record<string, number> = {};
      for (const a of attendance ?? []) { countMap[a.member_id] = (countMap[a.member_id] ?? 0) + 1; }

      // Get streaks for points
      const { data: streaks } = await sb.from("member_streaks").select("member_id, total_points, current_streak").in("member_id", memberIds);
      const streakMap = Object.fromEntries((streaks ?? []).map((s) => [s.member_id, s]));

      // Get names
      const { data: users } = await sb.from("users").select("id, full_name").in("id", memberIds);
      const nameMap = Object.fromEntries((users ?? []).map((u) => [u.id, u.full_name]));

      // Build entries sorted by points
      const entries = memberIds
        .map((id) => ({
          member_id: id,
          full_name: nameMap[id] ?? "?",
          points: streakMap[id]?.total_points ?? 0,
          streak: streakMap[id]?.current_streak ?? 0,
          attendance: countMap[id] ?? 0,
          level: getLevel(streakMap[id]?.total_points ?? 0),
        }))
        .filter((e) => e.points > 0 || e.attendance > 0)
        .sort((a, b) => b.points - a.points)
        .map((e, i) => ({ ...e, rank: i + 1 }));

      const myRank = entries.find((e) => e.member_id === user!.id);
      return { entries: entries.slice(0, 30), myRank };
    },
  });

  const entries = data?.entries ?? [];
  const myRank = data?.myRank;
  const medals = ["", "🥇", "🥈", "🥉"];

  return (
    <div className="max-w-3xl space-y-5 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">🏆 Reyting</h1>
        <p className="text-muted text-xs font-mono mt-1">VAQT VA GURUH BO'YICHA</p>
      </div>

      {/* Time filter */}
      <div className="flex gap-1.5">
        {TIME_FILTERS.map((t) => (
          <Button key={t.id} variant={days === t.id ? "default" : "secondary"} size="sm" onClick={() => setDays(t.id)} className="text-xs">{t.label}</Button>
        ))}
      </div>

      {/* Group filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <Button variant={groupId === "all" ? "default" : "secondary"} size="sm" onClick={() => setGroupId("all")} className="text-xs shrink-0">🏆 Barchasi</Button>
        {(groups ?? []).map((g: any) => (
          <Button key={g.id} variant={groupId === g.id ? "default" : "secondary"} size="sm" onClick={() => setGroupId(g.id)} className="text-xs shrink-0">👥 {g.name}</Button>
        ))}
      </div>

      {/* My position */}
      {myRank && (
        <Card className="border-accent-border/40 bg-accent/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: `${myRank.level.color}20` }}>{myRank.level.emoji}</div>
            <div className="flex-1">
              <p className="font-display font-bold" style={{ color: myRank.level.color }}>{myRank.level.name}</p>
              <p className="text-muted text-xs">#{myRank.rank} · {UNIT.emoji}{myRank.points} · 🔥{myRank.streak}d · 📅{myRank.attendance} tashrif</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {entries.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted text-sm">Hali reyting yo'q</CardContent></Card>
      ) : (
        <div className="space-y-1.5">
          {entries.map((e: any) => (
            <Card key={e.member_id} className={e.rank <= 3 ? "border-accent-border/30" : ""}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm ${e.rank <= 3 ? "bg-accent text-bg" : "bg-surface text-muted"}`}>
                  {e.rank <= 3 ? medals[e.rank] : e.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-vtext truncate">{e.full_name}</p>
                  <p className="text-[10px] text-muted">{e.level.emoji} {e.level.name} · 🔥{e.streak}d · 📅{e.attendance}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-sm text-accent">{e.points.toLocaleString()}</p>
                  <p className="text-[9px] text-muted">{UNIT.emoji} Kuch</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
