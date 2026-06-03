"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: api.users.stats });
  const { data: plan } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const { data: rank } = useQuery({ queryKey: ["rank"], queryFn: api.leaderboard.myRank, retry: false });
  const s = stats?.data;
  const p = plan?.data ?? plan;

  return (
    <div className="max-w-4xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">Salom, {user?.full_name?.split(" ")[0] ?? "A'zo"} 👋</h1>
        <p className="text-muted text-sm font-mono mt-1">DASHBOARD</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Streak", value: `${s?.current_streak ?? 0}`, icon: "🔥" },
          { label: "Ball", value: `${s?.total_points ?? 0}`, icon: "⭐" },
          { label: "Reyting", value: rank?.data?.rank ? `#${rank.data.rank}` : "—", icon: "🏆" },
          { label: "Tashrif", value: `${s?.total_attendance ?? 0}`, icon: "📅" },
        ].map((c) => (
          <Card key={c.label} className="border-l-2 border-l-accent">
            <CardContent className="p-4">
              <p className="text-muted text-xs font-mono uppercase tracking-wider">{c.label}</p>
              <p className="font-display font-bold text-2xl text-accent mt-1">{c.value}</p>
              <p className="text-xs text-muted">{c.icon}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan */}
      <Card className={p ? "border-accent-border/40" : ""}>
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
            <div className="text-center py-6">
              <p className="text-muted text-sm mb-3">Hali plan yo'q</p>
              <Link href="/dashboard/plan"><Button size="sm">Plan yaratish</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: "/dashboard/food", label: "Ovqat qo'shish", icon: "🥗", desc: "AI parse" },
          { href: "/dashboard/photos", label: "Foto yuklash", icon: "📸", desc: "AI tahlil" },
          { href: "/dashboard/chat", label: "AI Chat", icon: "🤖", desc: "24/7 trener" },
          { href: "/dashboard/plan", label: "Plan", icon: "📋", desc: "Haftalik dastur" },
        ].map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="hover:border-accent-border/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4">
                <span className="text-xl">{l.icon}</span>
                <p className="font-display font-bold text-sm mt-2">{l.label}</p>
                <p className="text-muted text-xs">{l.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
