"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLevel, UNIT, getLeague } from "@/lib/gamification";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import Link from "next/link";

function ProgressRing({ progress, size = 64, stroke = 5 }: { progress: number; size?: number; stroke?: number }) {
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
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const sb = getSupabase();
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: api.users.stats });
  const { data: plan } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const s = stats?.data;
  const p = plan?.data ?? plan;
  const level = getLevel(s?.total_points ?? 0);
  const league = getLeague((user as any)?.goal ?? "health");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech";

  // Checkin
  const checkin = useMutation({
    mutationFn: async () => {
      const u = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", u!.id).single();
      if (me?.gym_id) await sb.from("attendance").insert({ member_id: u!.id, gym_id: me.gym_id, source: "app" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stats"] }),
  });

  // Today's calories
  const { data: todayFood } = useQuery({
    queryKey: ["food-today-cal"],
    queryFn: async () => {
      const u = await getUser();
      const today = new Date().toISOString().split("T")[0];
      const { data } = await sb.from("food_logs").select("calories").eq("member_id", u!.id).gte("logged_at", `${today}T00:00:00`);
      return (data ?? []).reduce((a, b) => a + (Number(b.calories) || 0), 0);
    },
  });

  const targetCal = p?.nutrition?.daily_calories ?? 2000;
  const calPct = Math.min(100, Math.round(((todayFood ?? 0) / targetCal) * 100));

  return (
    <div className="max-w-lg md:max-w-4xl mx-auto space-y-4 animate-fadeUp pb-20 md:pb-4">
      {/* Top bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center font-display font-bold text-[11px] text-bg md:hidden">Z</div>
          <div>
            <p className="text-[11px] text-muted">{greeting}</p>
            <p className="font-display font-bold text-[17px] text-vtext">Salom, {user?.full_name?.split(" ")[0]} 👋</p>
          </div>
        </div>
        <Link href="/dashboard/settings"><span className="text-lg">⚙️</span></Link>
      </div>

      {/* Checkin CTA */}
      <Card className="border-accent-border/30 bg-accent/[0.03] press card-hover">
        <CardContent className="p-4 text-center" onClick={() => !checkin.isSuccess && checkin.mutate()}>
          {checkin.isSuccess ? (
            <><p className="text-vgreen text-xs font-mono">✅ CHECKIN QILINDI!</p><p className="text-muted text-[10px] mt-1">Bugungi mashqni bajarib kuch oling</p></>
          ) : (
            <><p className="text-accent text-[10px] font-mono tracking-wider mb-1.5">BUGUN HALI CHECKIN QILMADINGIZ</p>
            <Button size="sm" disabled={checkin.isPending} className="press">{checkin.isPending ? "..." : "📍 Gym ga keldim"}</Button></>
          )}
        </CardContent>
      </Card>

      {/* MD grid: level left + calories right */}
      <div className="grid grid-cols-2 gap-3">
        {/* Level */}
        <Card className="card-hover">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="relative shrink-0">
              <ProgressRing progress={level.progress} size={48} stroke={4} />
              <div className="absolute inset-0 flex items-center justify-center text-[14px]">{level.emoji}</div>
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-[12px] truncate" style={{ color: level.color }}>{level.name}</p>
              <p className="text-[9px] text-muted">{UNIT.emoji} {s?.total_points ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Calories */}
        <Card className="card-hover">
          <CardContent className="p-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] text-muted font-mono">KALORIYA</span>
              <span className="text-[10px] font-mono"><b className="text-accent">{todayFood ?? 0}</b><span className="text-muted"> / {targetCal}</span></span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${calPct}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: "🔥", value: s?.current_streak ?? 0, label: "Streak" },
          { icon: "📅", value: s?.total_attendance ?? 0, label: "Tashrif" },
          { icon: league.emoji, value: league.name.split(" ")[0], label: "Liga" },
        ].map((c) => (
          <Card key={c.label} className="card-hover">
            <CardContent className="p-2.5 text-center">
              <p className="text-[14px]">{c.icon}</p>
              <p className="font-display font-bold text-[13px] text-accent mt-0.5">{c.value}</p>
              <p className="text-[8px] text-muted">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { href: "/dashboard/food", icon: "🥗", label: "Ovqat qo'shish", sub: "+5⚡" },
          { href: "/dashboard/photos", icon: "📸", label: "Foto yuklash", sub: "+20⚡" },
          { href: "/dashboard/plan", icon: "📋", label: "Mashq plani", sub: "AI" },
          { href: "/dashboard/chat", icon: "🤖", label: "AI Coach", sub: "24/7" },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="press card-hover h-full">
              <CardContent className="p-3 flex items-center gap-3">
                <span className="text-xl">{a.icon}</span>
                <div>
                  <p className="text-[11px] font-medium text-vtext">{a.label}</p>
                  <p className="text-[9px] text-accent font-mono">{a.sub}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Plan preview (desktop) */}
      {p && (
        <Card className="hidden md:block card-hover border-accent-border/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-mono text-accent">HAFTALIK PLAN</p>
                <p className="text-sm text-vtext mt-1">{p.nutrition?.daily_calories} kkal · {p.nutrition?.protein_g}g protein · {p.workouts?.length} kun mashq</p>
              </div>
              <Link href="/dashboard/plan"><Button variant="outline" size="sm" className="text-xs">Batafsil →</Button></Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
