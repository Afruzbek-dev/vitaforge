"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLevel, BADGES, UNIT } from "@/lib/gamification";
import Link from "next/link";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: api.users.stats });
  const { data: plan } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const { data: rank } = useQuery({ queryKey: ["rank"], queryFn: api.leaderboard.myRank, retry: false });
  const s = stats?.data;
  const p = plan?.data ?? plan;
  const level = getLevel(s?.total_points ?? 0);
  const earnedBadges = BADGES.filter((b) => (s?.badges ?? []).includes(b.id));

  return (
    <div className="max-w-4xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">Salom, {user?.full_name?.split(" ")[0] ?? "A'zo"} 👋</h1>
        <p className="text-muted text-sm font-mono mt-1">DASHBOARD</p>
      </div>

      {/* Level Card */}
      <Card className="border-accent-border/40 bg-gradient-to-r from-card to-surface">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${level.color}20`, border: `1px solid ${level.color}40` }}>
                {level.emoji}
              </div>
              <div>
                <p className="font-display font-bold text-lg" style={{ color: level.color }}>{level.name}</p>
                <p className="text-muted text-xs font-mono">{UNIT.emoji} {s?.total_points ?? 0} KUCH</p>
              </div>
            </div>
            {level.next && (
              <div className="text-right">
                <p className="text-xs text-muted">Keyingi: {level.next.emoji} {level.next.name}</p>
                <p className="text-xs text-accent font-mono">{level.next.min - (s?.total_points ?? 0)} kuch qoldi</p>
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${level.progress}%`, background: level.color }} />
          </div>
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>{level.name} ({level.min})</span>
            {level.next && <span>{level.next.name} ({level.next.min})</span>}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Streak", value: `${s?.current_streak ?? 0}`, icon: "🔥", sub: "kun" },
          { label: "Kuch", value: `${s?.total_points ?? 0}`, icon: UNIT.emoji, sub: "ball" },
          { label: "Reyting", value: rank?.data?.rank ? `#${rank.data.rank}` : "—", icon: "🏆", sub: "" },
          { label: "Tashrif", value: `${s?.total_attendance ?? 0}`, icon: "📅", sub: "marta" },
        ].map((c) => (
          <Card key={c.label} className="border-l-2 border-l-accent">
            <CardContent className="p-4">
              <p className="text-muted text-xs font-mono uppercase">{c.label}</p>
              <p className="font-display font-bold text-2xl text-accent mt-1">{c.value}</p>
              <p className="text-xs text-muted">{c.icon} {c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Badges */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">🏅 Yutuqlar</CardTitle>
        </CardHeader>
        <CardContent>
          {earnedBadges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map((b) => (
                <div key={b.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent-border">
                  <span>{b.emoji}</span>
                  <span className="text-xs text-accent font-medium">{b.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {BADGES.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border opacity-40">
                  <span>{b.emoji}</span>
                  <span className="text-xs text-muted">{b.name}</span>
                </div>
              ))}
              <p className="text-xs text-muted w-full mt-2">Mashq qilib badge oling!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan */}
      <Card className={p ? "border-accent-border/30" : ""}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">📋 Haftalik Plan</CardTitle>
            <Link href="/dashboard/plan"><Button variant="outline" size="sm">Batafsil →</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          {p ? (
            <div className="grid grid-cols-4 gap-2">
              {[
                { l: "Kaloriya", v: p.nutrition?.daily_calories },
                { l: "Protein", v: `${p.nutrition?.protein_g}g` },
                { l: "Karbo", v: `${p.nutrition?.carbs_g}g` },
                { l: "Mashq", v: `${p.workouts?.length} kun` },
              ].map((n) => (
                <div key={n.l} className="bg-bg rounded-lg p-3 text-center">
                  <p className="font-display font-bold text-lg text-accent">{n.v}</p>
                  <p className="text-muted text-xs">{n.l}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted text-sm mb-3">Hali plan yo'q</p>
              <Link href="/dashboard/plan"><Button size="sm">Plan yaratish</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: "/dashboard/food", label: "Ovqat qo'shish", icon: "🥗", kuch: "+5 ⚡" },
          { href: "/dashboard/photos", label: "Foto yuklash", icon: "📸", kuch: "+20 ⚡" },
          { href: "/dashboard/chat", label: "AI Chat", icon: "🤖", kuch: "+2 ⚡" },
          { href: "/dashboard/plan", label: "Mashg'ulot", icon: "💪", kuch: "+10 ⚡" },
        ].map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="hover:border-accent-border/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <span className="text-xl">{l.icon}</span>
                  <span className="text-xs text-accent font-mono">{l.kuch}</span>
                </div>
                <p className="font-display font-bold text-sm mt-2">{l.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
