"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import Link from "next/link";

export default function GymDashboard() {
  const sb = getSupabase();

  const { data: stats } = useQuery({
    queryKey: ["gym-crm-stats"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const gid = me?.gym_id;
      if (!gid) return { members: 0, trainers: 0, active: 0, churn_risk: 0, avg_streak: 0 };

      const { count: members } = await sb.from("users").select("*", { count: "exact", head: true }).eq("gym_id", gid).eq("role", "member");
      const { count: trainers } = await sb.from("users").select("*", { count: "exact", head: true }).eq("gym_id", gid).eq("role", "trainer");

      const ago30 = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data: att } = await sb.from("attendance").select("member_id").eq("gym_id", gid).gte("checked_in_at", ago30);
      const active = new Set(att?.map((a) => a.member_id)).size;

      const ago14 = new Date(Date.now() - 14 * 86400000).toISOString();
      const { data: recent } = await sb.from("attendance").select("member_id").eq("gym_id", gid).gte("checked_in_at", ago14);
      const recentIds = new Set(recent?.map((a) => a.member_id));
      const churn_risk = (members ?? 0) - recentIds.size;

      const { data: streaks } = await sb.from("member_streaks").select("current_streak, member_id");
      const gymStreaks = streaks?.filter((s) => recentIds.has(s.member_id)) ?? [];
      const avg_streak = gymStreaks.length ? Math.round(gymStreaks.reduce((a, b) => a + b.current_streak, 0) / gymStreaks.length) : 0;

      return { members: members ?? 0, trainers: trainers ?? 0, active, churn_risk: Math.max(0, churn_risk), avg_streak, retention: members ? Math.round((active / members) * 100) : 0 };
    },
  });

  const { data: recentMembers } = useQuery({
    queryKey: ["gym-recent-members"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const { data } = await sb.from("users").select("id, full_name, role, created_at").eq("gym_id", me?.gym_id).order("created_at", { ascending: false }).limit(8);
      return data ?? [];
    },
  });

  const s = stats ?? { members: 0, trainers: 0, active: 0, churn_risk: 0, avg_streak: 0, retention: 0 };

  return (
    <div className="max-w-5xl space-y-6 animate-fadeUp">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">📊 Gym CRM</h1>
          <p className="text-muted text-xs font-mono mt-1">REAL-TIME ANALYTICS</p>
        </div>
        <div className="flex gap-2">
          <Link href="/gym/invite"><Button size="sm">+ A'zo qo'shish</Button></Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { l: "A'ZOLAR", v: s.members, c: "text-vtext", icon: "👥" },
          { l: "TRENERLAR", v: s.trainers, c: "text-vblue", icon: "💪" },
          { l: "FAOL (30K)", v: s.active, c: "text-vgreen", icon: "✅" },
          { l: "RETENTION", v: `${s.retention}%`, c: "text-accent", icon: "📈" },
          { l: "CHURN XAVF", v: s.churn_risk, c: s.churn_risk > 0 ? "text-vred" : "text-muted", icon: "⚠️" },
          { l: "AVG STREAK", v: `${s.avg_streak}d`, c: "text-accent", icon: "🔥" },
        ].map((k) => (
          <Card key={k.l}>
            <CardContent className="p-3 text-center">
              <p className="text-lg mb-0.5">{k.icon}</p>
              <p className={`font-display font-bold text-xl ${k.c}`}>{k.v}</p>
              <p className="text-muted text-[9px] font-mono">{k.l}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Churn Alert */}
      {s.churn_risk > 0 && (
        <Card className="border-vred/30 bg-vred/5">
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-vred text-sm font-medium">{s.churn_risk} ta a'zo 2 haftadan beri kelmadi</p>
              <p className="text-muted text-xs">Ular bilan bog'laning yoki AI tavsiyasini ko'ring</p>
            </div>
            <Link href="/gym/analytics" className="ml-auto"><Button variant="outline" size="sm">Batafsil</Button></Link>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/gym/attendance", label: "Davomat", icon: "📅", desc: "Bugungi" },
          { href: "/gym/members", label: "A'zolar", icon: "👥", desc: "CRM" },
          { href: "/gym/groups", label: "Guruhlar", icon: "🎯", desc: "Maqsad bo'yicha" },
          { href: "/gym/leaderboard", label: "Leaderboard", icon: "🏆", desc: "Top a'zolar" },
        ].map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="hover:border-accent-border/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <span className="text-xl">{l.icon}</span>
                <p className="font-display font-bold text-sm mt-1">{l.label}</p>
                <p className="text-muted text-xs">{l.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent members + trainers */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">So'nggi qo'shilganlar</CardTitle>
            <Link href="/gym/members"><Button variant="ghost" size="sm">Barchasi →</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(recentMembers ?? []).map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded-lg border border-border/50 hover:border-accent-border/30 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${m.role === "trainer" ? "bg-vblue/20 text-vblue" : "bg-accent/10 text-accent"}`}>
                    {m.full_name?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm text-vtext">{m.full_name}</p>
                    <p className="text-[10px] text-muted font-mono">{m.role === "trainer" ? "TRENER" : "A'ZO"}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted">{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
