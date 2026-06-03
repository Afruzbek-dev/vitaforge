"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GymPage() {
  const { data: retention } = useQuery({ queryKey: ["gym", "retention"], queryFn: api.gym.retention });
  const { data: churn } = useQuery({ queryKey: ["gym", "churn"], queryFn: api.gym.churnRisk });
  const { data: members } = useQuery({ queryKey: ["gym", "members"], queryFn: api.gym.members });
  const r = retention?.data;
  const atRisk = churn?.data?.at_risk_members ?? [];
  const memberList = members?.data ?? [];

  return (
    <div className="max-w-4xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">🏋️ Gym Dashboard</h1>
        <p className="text-muted text-sm font-mono mt-1">OWNER PANEL</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "JAMI", v: r?.total_members ?? "—", c: "text-vtext" },
          { l: "FAOL (30 KUN)", v: r?.active_last_30_days ?? "—", c: "text-vgreen" },
          { l: "RETENTION", v: r?.retention_rate ? `${r.retention_rate}%` : "—", c: "text-accent" },
        ].map((k) => (
          <Card key={k.l} className="border-l-2 border-l-accent">
            <CardContent className="p-4">
              <p className="text-muted text-xs font-mono">{k.l}</p>
              <p className={`font-display font-bold text-3xl mt-1 ${k.c}`}>{k.v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Churn alert */}
      {atRisk.length > 0 && (
        <Card className="border-vred/30 bg-vred/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-vred">⚠️ Churn xavfi ({atRisk.length} ta a'zo)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {atRisk.map((m: any) => (
                <li key={m.id} className="flex justify-between text-sm items-center">
                  <span className="text-vtext">{m.full_name}</span>
                  <Link href={`/gym/members/${m.id}`}><Button variant="ghost" size="sm">Ko'rish →</Button></Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Members table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">👥 A'zolar ({memberList.length})</CardTitle>
            <Link href="/gym/members"><Button variant="outline" size="sm">Barchasi →</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-xs font-mono uppercase">
                  <th className="text-left py-2">Ism</th>
                  <th className="text-left py-2">Maqsad</th>
                  <th className="text-left py-2">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {memberList.slice(0, 5).map((m: any) => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-surface/50">
                    <td className="py-3 font-medium text-vtext">{m.full_name}</td>
                    <td className="py-3 text-muted">{m.goal ?? "—"}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${m.onboarding_done ? "bg-vgreen/10 text-vgreen border border-vgreen/20" : "bg-accent/10 text-accent border border-accent-border"}`}>
                        {m.onboarding_done ? "FAOL" : "KUTILMOQDA"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link href={`/gym/members/${m.id}`}><Button variant="ghost" size="sm">→</Button></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {memberList.length === 0 && <p className="text-muted text-sm text-center py-6">Hali a'zo yo'q</p>}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/gym/members">
          <Card className="hover:border-accent-border/50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <span className="text-xl">👥</span>
              <p className="font-display font-bold text-sm mt-2">A'zolar ro'yxati</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/gym/analytics">
          <Card className="hover:border-accent-border/50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <span className="text-xl">📊</span>
              <p className="font-display font-bold text-sm mt-2">Analitika</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
