"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLevel, UNIT, getLeague } from "@/lib/gamification";
import Link from "next/link";

function ProgressRing({ progress, size = 80, stroke = 6 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e1e2c" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8ff47" strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: api.users.stats });
  const { data: plan } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const s = stats?.data;
  const p = plan?.data ?? plan;
  const level = getLevel(s?.total_points ?? 0);
  const league = getLeague((user as any)?.goal ?? "health");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech";

  return (
    <div className="max-w-lg md:max-w-2xl mx-auto space-y-5 animate-fadeUp pb-20 md:pb-4">
      {/* Header — greeting + level */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-muted text-xs">{greeting} 👋</p>
          <h1 className="font-display font-bold text-xl text-vtext">{user?.full_name?.split(" ")[0] ?? "A'zo"}</h1>
        </div>
        <Link href="/dashboard/settings">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm press">
            {user?.full_name?.[0] ?? "?"}
          </div>
        </Link>
      </div>

      {/* Level progress card */}
      <Card className="card-hover border-accent-border/20 overflow-hidden">
        <CardContent className="p-5 flex items-center gap-5">
          <div className="relative">
            <ProgressRing progress={level.progress} size={72} stroke={5} />
            <div className="absolute inset-0 flex items-center justify-center text-xl">{level.emoji}</div>
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-base" style={{ color: level.color }}>{level.name}</p>
            <p className="text-muted text-xs mt-0.5">{UNIT.emoji} {s?.total_points ?? 0} Kuch</p>
            {level.next && <p className="text-[10px] text-muted mt-1">→ {level.next.emoji} {level.next.name} ({level.pointsToNext} qoldi)</p>}
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-accent">{s?.current_streak ?? 0}</p>
            <p className="text-[9px] text-muted">🔥 kun</p>
          </div>
        </CardContent>
      </Card>

      {/* Today stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Ball", value: s?.total_points ?? 0, icon: UNIT.emoji },
          { label: "Tashrif", value: s?.total_attendance ?? 0, icon: "📅" },
          { label: "Liga", value: league.name.split(" ")[0], icon: league.emoji },
        ].map((c) => (
          <Card key={c.label} className="card-hover">
            <CardContent className="p-3 text-center">
              <p className="text-lg">{c.icon}</p>
              <p className="font-display font-bold text-sm text-accent mt-0.5">{c.value}</p>
              <p className="text-[9px] text-muted">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan card */}
      <Link href="/dashboard/today">
        <Card className="card-hover border-accent-border/20 press">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-accent tracking-wider">BUGUNGI MASHQ</p>
                {p ? (
                  <p className="text-sm text-vtext mt-1 font-medium">{p.nutrition?.daily_calories ?? "—"} kkal · {p.workouts?.length ?? 0} kun plan</p>
                ) : (
                  <p className="text-sm text-muted mt-1">Plan yarating →</p>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-lg">💪</div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Quick actions grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { href: "/dashboard/today", icon: "✅", label: "Bugun" },
          { href: "/dashboard/food", icon: "🥗", label: "Ovqat" },
          { href: "/dashboard/chat", icon: "🤖", label: "AI" },
          { href: "/dashboard/plan", icon: "📋", label: "Plan" },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <div className="flex flex-col items-center gap-1 py-3 rounded-xl bg-card border border-border press card-hover">
              <span className="text-xl">{a.icon}</span>
              <span className="text-[10px] text-muted">{a.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Badges preview */}
      {(s?.badges?.length ?? 0) > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] font-mono text-muted mb-2">YUTUQLAR</p>
            <div className="flex flex-wrap gap-1.5">
              {(s?.badges ?? []).slice(0, 5).map((b: string) => (
                <span key={b} className="text-xs bg-accent/10 text-accent border border-accent-border px-2 py-0.5 rounded-full">{b}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
