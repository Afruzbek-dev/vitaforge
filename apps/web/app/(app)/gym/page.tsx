"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import Link from "next/link";

export default function GymDashboard() {
  const sb = getSupabase();

  const { data } = useQuery({
    queryKey: ["gym-dashboard"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const gid = me?.gym_id;
      if (!gid) return null;

      const { count: total } = await sb.from("users").select("*", { count: "exact", head: true }).eq("gym_id", gid).eq("role", "member");
      const ago7 = new Date(Date.now() - 7 * 86400000).toISOString();
      const ago30 = new Date(Date.now() - 30 * 86400000).toISOString();
      const today = new Date().toISOString().split("T")[0];

      // Today check-ins
      const { count: todayCheckins } = await sb.from("attendance").select("*", { count: "exact", head: true }).eq("gym_id", gid).gte("checked_in_at", `${today}T00:00:00`);

      // Active last 30 days
      const { data: active30 } = await sb.from("attendance").select("member_id").eq("gym_id", gid).gte("checked_in_at", ago30);
      const activeCount = new Set(active30?.map((a) => a.member_id)).size;

      // At risk (7+ kun kelmagan)
      const { data: active7 } = await sb.from("attendance").select("member_id").eq("gym_id", gid).gte("checked_in_at", ago7);
      const active7Set = new Set(active7?.map((a) => a.member_id));
      const { data: allMembers } = await sb.from("users").select("id, full_name").eq("gym_id", gid).eq("role", "member");
      const atRisk = (allMembers ?? []).filter((m) => !active7Set.has(m.id));

      // Streaks
      const { data: streaks } = await sb.from("member_streaks").select("current_streak, total_points, member_id");
      const gymStreaks = streaks?.filter((s) => (allMembers ?? []).some((m) => m.id === s.member_id)) ?? [];
      const avgStreak = gymStreaks.length ? Math.round(gymStreaks.reduce((a, b) => a + b.current_streak, 0) / gymStreaks.length) : 0;

      const retention = (total ?? 0) > 0 ? Math.round((activeCount / (total ?? 1)) * 100) : 0;

      return { total: total ?? 0, todayCheckins: todayCheckins ?? 0, activeCount, atRisk, retention, avgStreak, expected: Math.round((total ?? 0) * 0.6) };
    },
  });

  const d = data;

  return (
    <div className="max-w-4xl space-y-6 animate-fadeUp">
      <h1 className="font-display font-bold text-2xl text-vtext">Bugun nima bo'lyapti?</h1>

      {/* CRITICAL ALERTS */}
      {d && d.atRisk.length > 0 && (
        <Card className="border-vred/30 bg-vred/5">
          <CardContent className="p-4 space-y-2">
            <p className="text-vred text-xs font-mono font-bold">⚠️ DIQQAT</p>
            <p className="text-vtext text-sm font-medium">{d.atRisk.length} ta a'zo 7+ kundan beri kelmagan</p>
            <div className="flex flex-wrap gap-1">
              {d.atRisk.slice(0, 5).map((m: any) => (
                <span key={m.id} className="text-xs bg-vred/10 text-vred px-2 py-0.5 rounded-full">{m.full_name}</span>
              ))}
              {d.atRisk.length > 5 && <span className="text-xs text-muted">+{d.atRisk.length - 5} ta</span>}
            </div>
            <Link href="/gym/retention"><Button size="sm" variant="outline" className="mt-1 text-xs">Retention Center →</Button></Link>
          </CardContent>
        </Card>
      )}

      {/* TODAY OVERVIEW */}
      {d && (
        <Card className="border-accent-border/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted font-mono">BUGUNGI DAVOMAT</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div>
                <p className="font-display font-bold text-4xl text-accent">{d.todayCheckins}</p>
                <p className="text-muted text-xs">Keldi</p>
              </div>
              <div className="text-muted text-sm">/</div>
              <div>
                <p className="font-display font-bold text-2xl text-muted">{d.expected}</p>
                <p className="text-muted text-xs">Kutilgan</p>
              </div>
              <div className="flex-1" />
              <div className="text-right">
                <p className="font-display font-bold text-2xl" style={{ color: d.todayCheckins >= d.expected ? "#4dffb4" : "#e8ff47" }}>
                  {d.expected > 0 ? Math.round((d.todayCheckins / d.expected) * 100) : 0}%
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-border rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(100, d.expected > 0 ? (d.todayCheckins / d.expected) * 100 : 0)}%` }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* GROWTH METRICS */}
      {d && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "A'ZOLAR", value: d.total, icon: "👥" },
            { label: "RETENTION", value: `${d.retention}%`, icon: "📈", color: d.retention > 60 ? "text-vgreen" : "text-vred" },
            { label: "AVG STREAK", value: `${d.avgStreak}d`, icon: "🔥" },
            { label: "AT RISK", value: d.atRisk.length, icon: "⚠️", color: d.atRisk.length > 3 ? "text-vred" : "text-muted" },
          ].map((k) => (
            <Card key={k.label}>
              <CardContent className="p-4 text-center">
                <p className="text-lg">{k.icon}</p>
                <p className={`font-display font-bold text-2xl mt-1 ${k.color ?? "text-accent"}`}>{k.value}</p>
                <p className="text-[9px] font-mono text-muted mt-0.5">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/gym/retention", label: "Retention", icon: "🎯" },
          { href: "/gym/attendance", label: "Davomat", icon: "📅" },
          { href: "/gym/members", label: "A'zolar", icon: "👥" },
          { href: "/gym/analytics", label: "Analitika", icon: "📊" },
        ].map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="hover:border-accent-border/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <span className="text-xl">{l.icon}</span>
                <p className="font-display font-bold text-xs mt-2">{l.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {d && d.total === 0 && (
        <Card className="border-accent-border/20">
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-3">🏋️</p>
            <p className="text-vtext font-medium mb-1">Hali a'zo yo'q</p>
            <p className="text-muted text-sm mb-4">Birinchi a'zoni qo'shib boshlang</p>
            <Link href="/gym/invite"><Button>+ Birinchi a'zo</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
