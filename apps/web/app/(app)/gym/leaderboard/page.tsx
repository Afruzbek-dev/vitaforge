"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

const GOALS = [
  { value: "all", label: "Barchasi", icon: "🏆" },
  { value: "weight_loss", label: "Vazn", icon: "📉" },
  { value: "muscle_gain", label: "Mushak", icon: "💪" },
  { value: "endurance", label: "Chidamlilik", icon: "🏃" },
  { value: "health", label: "Sog'liq", icon: "❤️" },
];

const BADGES_MAP: Record<number, { label: string; emoji: string }> = {
  1: { label: "LIDER", emoji: "👑" },
  2: { label: "2-O'RIN", emoji: "🥈" },
  3: { label: "3-O'RIN", emoji: "🥉" },
};

const MOTIVATIONS = [
  "Zo'r natija! Davom eting! 🔥",
  "Streak ni uzmaslik — muvaffaqiyat kaliti!",
  "Raqobat motivatsiya beradi — tepaga intilin!",
];

export default function LeaderboardPage() {
  const [goalFilter, setGoalFilter] = useState("all");
  const sb = getSupabase();

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", goalFilter],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();

      // Get streaks with user info
      let query = sb
        .from("member_streaks")
        .select("member_id, total_points, current_streak, badges")
        .order("total_points", { ascending: false })
        .limit(20);

      const { data: streaks } = await query;
      if (!streaks?.length) return [];

      const ids = streaks.map((s) => s.member_id);
      const { data: users } = await sb.from("users").select("id, full_name").in("id", ids).eq("gym_id", me?.gym_id);

      // If goal filter, get profiles
      let profileMap: Record<string, string> = {};
      if (goalFilter !== "all") {
        const { data: profiles } = await sb.from("member_profiles").select("user_id, goal").in("user_id", ids);
        profiles?.forEach((p) => { profileMap[p.user_id] = p.goal; });
      }

      const nameMap = Object.fromEntries((users ?? []).map((u) => [u.id, u.full_name]));

      return streaks
        .filter((s) => nameMap[s.member_id])
        .filter((s) => goalFilter === "all" || profileMap[s.member_id] === goalFilter)
        .map((s, i) => ({
          rank: i + 1,
          member_id: s.member_id,
          full_name: nameMap[s.member_id] ?? "?",
          points: s.total_points,
          streak: s.current_streak,
          badges: s.badges ?? [],
        }));
    },
  });

  const leaderboard = data ?? [];

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">🏆 Leaderboard</h1>
        <p className="text-muted text-sm font-mono mt-1">MAQSAD BO'YICHA REYTING</p>
      </div>

      {/* Goal filter */}
      <div className="flex gap-2 flex-wrap">
        {GOALS.map((g) => (
          <Button key={g.value} variant={goalFilter === g.value ? "default" : "secondary"} size="sm"
            onClick={() => setGoalFilter(g.value)}>
            {g.icon} {g.label}
          </Button>
        ))}
      </div>

      {/* Motivation banner */}
      <Card className="border-accent-border/30 bg-accent/5">
        <CardContent className="p-4 flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <p className="text-sm text-muted">{MOTIVATIONS[Math.floor(Date.now() / 86400000) % MOTIVATIONS.length]}</p>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      {isLoading ? (
        <div className="text-muted text-sm animate-pulse">Yuklanmoqda...</div>
      ) : leaderboard.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted text-sm">Hali ma'lumot yo'q</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry: any) => {
            const badge = BADGES_MAP[entry.rank];
            const isTop3 = entry.rank <= 3;
            return (
              <Card key={entry.member_id} className={isTop3 ? "border-accent-border/50 bg-accent/5" : ""}>
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-lg ${isTop3 ? "bg-accent text-bg" : "bg-surface text-muted"}`}>
                    {entry.rank}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-vtext">{entry.full_name}</span>
                      {badge && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent-border font-mono">{badge.emoji} {badge.label}</span>}
                    </div>
                    <p className="text-muted text-xs mt-0.5">
                      🔥 {entry.streak} kun streak · {entry.badges.length > 0 && entry.badges.slice(0, 2).join(", ")}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className="font-display font-bold text-xl text-accent">{entry.points.toLocaleString()}</p>
                    <p className="text-muted text-xs font-mono">BALL</p>
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
