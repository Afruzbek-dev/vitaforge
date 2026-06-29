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
    <div className="max-w-2xl lg:max-w-4xl mx-auto space-y-4 animate-fadeUp pb-24 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-mono text-[10px] tracking-[2px] text-accent uppercase mb-1.5">{greeting}</p>
          <h1 className="font-display font-bold text-2xl tracking-[-0.5px] text-vtext">
            {user?.full_name?.split(" ")[0] ?? "A'zo"}
          </h1>
        </div>
        <Link href="/dashboard/settings" className="w-10 h-10 rounded-2xl bg-surface2 border border-border flex items-center justify-center font-display font-bold text-sm press shadow-xl">
          {user?.full_name?.[0] ?? "?"}
        </Link>
      </div>

      {/* Checkin card */}
      {!todayWorkout ? (
        <Card className="border border-accent/30 bg-accent/[0.04] rounded-2xl p-4 press mb-3" onClick={() => checkin.mutate()}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <MapPin size={18} className="text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-[14px] text-vtext">Bugungi mashg'ulot</p>
                <p className="text-[12px] text-muted">Gymga kelganingizni belgilang</p>
              </div>
            </div>
            <button disabled={checkin.isPending} className="w-full bg-accent text-bg font-body font-semibold text-[13px] text-center p-[13px] rounded-xl shadow-[0_0_18px_rgba(213,255,69,0.25)] transition-opacity disabled:opacity-50">
              {checkin.isPending ? "Belgilanmoqda..." : "Zaldaman, belgiga bosish"}
            </button>
          </div>
        </Card>
      ) : (
        <Card className="border-[var(--green)]/20 bg-[var(--green)]/[0.03] rounded-2xl mb-3">
          <CardContent className="p-4 flex items-center gap-2 justify-center">
            <MapPin size={16} className="text-vgreen" />
            <p className="text-vgreen text-[11px] font-mono tracking-[1px]">BUGUN BELGILANGAN</p>
          </CardContent>
        </Card>
      )}

      {/* Main stats — streak, calories, protein */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm">
          <Flame size={20} className="text-accent" />
          <p className="font-display font-bold text-[18px] text-accent leading-none">{s?.current_streak ?? 0}</p>
          <p className="text-[9px] font-mono text-muted text-center leading-tight">STREAK</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm relative">
          <div className="absolute top-2 right-2 text-muted opacity-50"><Utensils size={10} /></div>
          <Ring progress={calPct} size={36} stroke={3} />
          <p className="font-display font-bold text-[18px] text-vtext leading-none mt-1">{todayCal?.cal ?? 0}</p>
          <p className="text-[9px] font-mono text-muted text-center leading-tight">/ {targetCal} kkal</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm relative">
          <div className="absolute top-2 right-2 text-muted opacity-50"><Zap size={10} /></div>
          <Ring progress={proteinPct} size={36} stroke={3} />
          <p className="font-display font-bold text-[18px] text-vtext leading-none mt-1">{todayCal?.protein ?? 0}g</p>
          <p className="text-[9px] font-mono text-muted text-center leading-tight">/ {targetProtein}g</p>
        </div>
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

      {/* AI Recommendations + Quick actions — side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
