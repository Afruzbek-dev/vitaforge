"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLevel, UNIT, BADGES } from "@/lib/gamification";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Flame, Zap, Utensils, Dumbbell, Camera, Bot, Target, MapPin, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

function Ring({ progress, size = 56, stroke = 4 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c - (progress/100)*c} strokeLinecap="round" />
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

  const { data: todayCal } = useQuery({
    queryKey: ["today-cal"],
    queryFn: async () => {
      const u = await getUser();
      const today = new Date().toISOString().split("T")[0];
      const { data } = await sb.from("food_logs").select("calories, protein").eq("member_id", u!.id).gte("logged_at", `${today}T00:00:00`);
      const cal = (data ?? []).reduce((a, b) => a + (Number(b.calories) || 0), 0);
      const protein = (data ?? []).reduce((a, b) => a + (Number(b.protein) || 0), 0);
      return { cal, protein };
    },
  });

  const { data: todayWorkout } = useQuery({
    queryKey: ["today-workout"],
    queryFn: async () => {
      const u = await getUser();
      const today = new Date().toISOString().split("T")[0];
      const { count } = await sb.from("attendance").select("*", { count: "exact", head: true }).eq("member_id", u!.id).gte("checked_in_at", `${today}T00:00:00`);
      return (count ?? 0) > 0;
    },
  });

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
  const targetProtein = p?.nutrition?.protein_g ?? 120;
  const calPct = Math.min(100, Math.round(((todayCal?.cal ?? 0) / targetCal) * 100));
  const proteinPct = Math.min(100, Math.round(((todayCal?.protein ?? 0) / targetProtein) * 100));

  // AI recommendations based on current data
  const recommendations: { text: string; action: string; href: string }[] = [];
  if (!todayWorkout) recommendations.push({ text: "Bugun hali mashq qilmadingiz. Gym'ga boring!", action: "Belgilash", href: "#checkin" });
  if (calPct < 50) recommendations.push({ text: "Kaloriya kam — ovqat qo'shing", action: "Qo'shish", href: "/dashboard/food" });
  if ((s?.current_streak ?? 0) >= 3) recommendations.push({ text: `${s?.current_streak} kunlik streak — davom eting!`, action: "Plan", href: "/dashboard/plan" });
  if (proteinPct < 40) recommendations.push({ text: "Protein kam — tuxum yoki go'sht yeying", action: "Qo'shish", href: "/dashboard/food" });

  return (
    <div className="max-w-lg mx-auto space-y-4 animate-fadeUp pb-24 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted">{greeting}</p>
          <h1 className="font-display font-bold text-xl text-vtext">{user?.full_name?.split(" ")[0] ?? "A'zo"}</h1>
        </div>
        <Link href="/dashboard/settings" className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-accent font-bold text-sm press">
          {user?.full_name?.[0] ?? "?"}
        </Link>
      </div>

      {/* Checkin card */}
      {!todayWorkout ? (
        <Card className="border-accent/20 bg-accent/[0.03] press" onClick={() => checkin.mutate()}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <MapPin size={18} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-vtext">Gym'ga keldim</p>
              <p className="text-[10px] text-muted">Bugungi davomatni belgilang</p>
            </div>
            <Button size="sm" disabled={checkin.isPending}>{checkin.isPending ? "..." : "Belgilash"}</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[var(--green)]/20 bg-[var(--green)]/[0.03]">
          <CardContent className="p-3 flex items-center gap-2 justify-center">
            <MapPin size={14} className="text-vgreen" />
            <p className="text-vgreen text-[11px] font-mono">BUGUN BELGILANGAN</p>
          </CardContent>
        </Card>
      )}

      {/* Main stats — streak, calories, protein */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="card-hover">
          <CardContent className="p-3 flex flex-col items-center">
            <Flame size={18} className="text-accent mb-1.5" />
            <p className="font-display font-bold text-xl text-accent">{s?.current_streak ?? 0}</p>
            <p className="text-[9px] text-muted">kun streak</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-3 flex flex-col items-center">
            <div className="relative mb-1">
              <Ring progress={calPct} size={42} stroke={3} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Utensils size={12} className="text-accent" />
              </div>
            </div>
            <p className="font-display font-bold text-sm text-vtext">{todayCal?.cal ?? 0}</p>
            <p className="text-[9px] text-muted">/ {targetCal} kkal</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-3 flex flex-col items-center">
            <div className="relative mb-1">
              <Ring progress={proteinPct} size={42} stroke={3} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={12} className="text-vgreen" />
              </div>
            </div>
            <p className="font-display font-bold text-sm text-vtext">{todayCal?.protein ?? 0}g</p>
            <p className="text-[9px] text-muted">/ {targetProtein}g protein</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's plan */}
      {p && (
        <Link href="/dashboard/today">
          <Card className="press card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Dumbbell size={18} className="text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-mono text-accent">BUGUNGI MASHQ</p>
                <p className="text-xs text-vtext mt-0.5">{p.workouts?.length ?? 0} kun plan</p>
              </div>
              <ArrowRight size={14} className="text-muted" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles size={14} className="text-accent" />
              <p className="text-[10px] font-mono text-accent tracking-wider">AI TAVSIYALAR</p>
            </div>
            <div className="space-y-2">
              {recommendations.slice(0, 3).map((r, i) => (
                <Link key={i} href={r.href === "#checkin" ? "#" : r.href} onClick={r.href === "#checkin" ? () => checkin.mutate() : undefined}>
                  <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 press">
                    <p className="text-xs text-vtext">{r.text}</p>
                    <span className="text-[9px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">{r.action}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { href: "/dashboard/food", icon: Utensils, label: "Ovqat qo'shish", color: "text-vgreen" },
          { href: "/dashboard/photos", icon: Camera, label: "Progress foto", color: "text-vblue" },
          { href: "/dashboard/plan", icon: Target, label: "AI Plan", color: "text-accent" },
          { href: "/dashboard/chat", icon: Bot, label: "AI Coach", color: "text-[#ffa726]" },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="press card-hover h-full">
              <CardContent className="p-3 flex items-center gap-2.5">
                <a.icon size={16} className={a.color} />
                <p className="text-[11px] font-medium text-vtext">{a.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Level progress */}
      <Card>
        <CardContent className="p-3 flex items-center gap-3">
          <Ring progress={level.progress} size={40} stroke={3} />
          <div className="flex-1">
            <p className="text-xs font-medium text-vtext">{level.name}</p>
            <p className="text-[9px] text-muted">{s?.total_points ?? 0} {UNIT.emoji} ball</p>
          </div>
          {level.next && (
            <div className="text-right">
              <p className="text-[9px] text-muted">Keyingi daraja</p>
              <p className="text-[10px] font-mono text-accent">{level.pointsToNext} ball</p>
            </div>
          )}
          <TrendingUp size={14} className="text-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
