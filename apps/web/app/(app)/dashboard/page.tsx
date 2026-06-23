"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLevel, UNIT, getLeague, BADGES } from "@/lib/gamification";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Flame, Zap, Calendar, Trophy, Utensils, Dumbbell, Camera, Bot, Target } from "lucide-react";
import Link from "next/link";

function Ring({ progress, size = 56, stroke = 4 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e2c" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8ff47" strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c - (progress/100)*c} strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const sb = getSupabase();
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: api.users.stats });
  const { data: plan } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const s = stats?.data;
  const p = plan?.data ?? plan;
  const level = getLevel(s?.total_points ?? 0);
  const league = getLeague((user as any)?.goal ?? "health");

  // Today calories
  const { data: todayCal } = useQuery({
    queryKey: ["today-cal"],
    queryFn: async () => {
      const u = await getUser();
      const today = new Date().toISOString().split("T")[0];
      const { data } = await sb.from("food_logs").select("calories").eq("member_id", u!.id).gte("logged_at", `${today}T00:00:00`);
      return (data ?? []).reduce((a, b) => a + (Number(b.calories) || 0), 0);
    },
  });

  // Today workout status
  const { data: todayWorkout } = useQuery({
    queryKey: ["today-workout"],
    queryFn: async () => {
      const u = await getUser();
      const today = new Date().toISOString().split("T")[0];
      const { count } = await sb.from("attendance").select("*", { count: "exact", head: true }).eq("member_id", u!.id).gte("checked_in_at", `${today}T00:00:00`);
      return (count ?? 0) > 0;
    },
  });

  // Checkin
  const checkin = useMutation({
    mutationFn: async () => {
      const u = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", u!.id).single();
      if (me?.gym_id) await sb.from("attendance").insert({ member_id: u!.id, gym_id: me.gym_id, source: "app" });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["today-workout"] }); qc.invalidateQueries({ queryKey: ["stats"] }); },
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech";
  const targetCal = p?.nutrition?.daily_calories ?? 2000;
  const calPct = Math.min(100, Math.round(((todayCal ?? 0) / targetCal) * 100));
  const earnedBadges = BADGES.filter((b) => (s?.badges ?? []).includes(b.id));

  return (
    <div className="max-w-lg md:max-w-3xl mx-auto space-y-4 animate-fadeUp pb-20 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted">{greeting}</p>
          <h1 className="font-display font-bold text-lg text-vtext">{user?.full_name?.split(" ")[0] ?? "A'zo"}</h1>
        </div>
        <Link href="/dashboard/settings" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-accent font-bold text-sm press">
          {user?.full_name?.[0] ?? "?"}
        </Link>
      </div>

      {/* Checkin / Today status */}
      {!todayWorkout ? (
        <Card className="border-accent/20 bg-accent/[0.03] press" onClick={() => checkin.mutate()}>
          <CardContent className="p-4 text-center">
            <p className="text-accent text-[10px] font-mono tracking-wider mb-1">BUGUN HALI BELGILANMAGAN</p>
            <Button size="sm" disabled={checkin.isPending}>{checkin.isPending ? "..." : "📍 Gym ga keldim"}</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-vgreen/20 bg-vgreen/[0.03]">
          <CardContent className="p-3 text-center">
            <p className="text-vgreen text-[10px] font-mono">✓ BUGUN BELGILANGAN</p>
          </CardContent>
        </Card>
      )}

      {/* Level + Streak + Calories — compact row */}
      <div className="grid grid-cols-3 gap-2">
        {/* Level */}
        <Card className="card-hover">
          <CardContent className="p-3 flex flex-col items-center">
            <div className="relative mb-1">
              <Ring progress={level.progress} size={44} stroke={3.5} />
              <div className="absolute inset-0 flex items-center justify-center text-[12px]">{level.emoji}</div>
            </div>
            <p className="font-display font-bold text-[10px]" style={{ color: level.color }}>{level.name}</p>
            <p className="text-[8px] text-muted">{s?.total_points ?? 0} {UNIT.emoji}</p>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="card-hover">
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <Flame size={18} className="text-accent mb-1" />
            <p className="font-display font-bold text-lg text-accent">{s?.current_streak ?? 0}</p>
            <p className="text-[8px] text-muted">kun streak</p>
          </CardContent>
        </Card>

        {/* Calories today */}
        <Card className="card-hover">
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <Utensils size={16} className="text-muted mb-1" />
            <p className="font-display font-bold text-sm text-vtext">{todayCal ?? 0}</p>
            <p className="text-[8px] text-muted">/ {targetCal} kkal</p>
            <div className="w-full h-1 bg-border rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${calPct}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's plan preview */}
      {p && (
        <Link href="/dashboard/today">
          <Card className="press card-hover">
            <CardContent className="p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Dumbbell size={18} className="text-accent" /></div>
              <div className="flex-1">
                <p className="text-[10px] font-mono text-accent">BUGUNGI MASHQ</p>
                <p className="text-[12px] text-vtext mt-0.5">{p.workouts?.length ?? 0} kun plan · {p.nutrition?.protein_g ?? 0}g protein</p>
              </div>
              <span className="text-muted text-xs">→</span>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Quick actions — 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { href: "/dashboard/food", icon: Utensils, label: "Ovqat qo'shish", sub: "+5⚡", color: "text-vgreen" },
          { href: "/dashboard/photos", icon: Camera, label: "Progress foto", sub: "+20⚡", color: "text-vblue" },
          { href: "/dashboard/plan", icon: Target, label: "AI Plan", sub: "Haftalik", color: "text-accent" },
          { href: "/dashboard/chat", icon: Bot, label: "AI Coach", sub: "24/7", color: "text-[#ff9f43]" },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="press card-hover h-full">
              <CardContent className="p-3 flex items-center gap-2.5">
                <a.icon size={18} className={a.color} />
                <div>
                  <p className="text-[11px] font-medium text-vtext">{a.label}</p>
                  <p className="text-[9px] text-muted">{a.sub}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 px-2">
        {[
          { icon: Calendar, label: "Tashrif", value: s?.total_attendance ?? 0 },
          { icon: Trophy, label: "Liga", value: league.name.split(" ")[0] },
          { icon: Zap, label: "Ball", value: s?.total_points ?? 0 },
        ].map((st) => (
          <div key={st.label} className="flex items-center gap-1.5 text-[10px] text-muted">
            <st.icon size={12} /> {st.label}: <span className="text-vtext font-medium">{st.value}</span>
          </div>
        ))}
      </div>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <p className="text-[9px] font-mono text-muted mb-2">YUTUQLAR</p>
            <div className="flex flex-wrap gap-1.5">
              {earnedBadges.map((b) => (
                <span key={b.id} className="text-[10px] bg-accent/10 text-accent border border-accent-border px-2 py-0.5 rounded-full">{b.emoji} {b.name}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next level hint */}
      {level.next && (
        <div className="text-center text-[10px] text-muted">
          → {level.next.emoji} <span className="text-vtext">{level.next.name}</span> gacha <span className="text-accent font-mono">{level.pointsToNext}</span> kuch qoldi
        </div>
      )}
    </div>
  );
}
