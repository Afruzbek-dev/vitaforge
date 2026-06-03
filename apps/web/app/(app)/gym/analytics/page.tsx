"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  const { data: retention } = useQuery({ queryKey: ["gym", "retention"], queryFn: api.gym.retention });
  const { data: churn } = useQuery({ queryKey: ["gym", "churn"], queryFn: api.gym.churnRisk });
  const r = retention?.data;
  const atRisk = churn?.data?.at_risk_members ?? [];

  return (
    <div className="max-w-4xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">📊 Analitika</h1>
        <p className="text-muted text-sm font-mono mt-1">RETENTION VA CHURN</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "JAMI", v: r?.total_members ?? 0, c: "text-vtext" },
          { l: "FAOL", v: r?.active_last_30_days ?? 0, c: "text-vgreen" },
          { l: "CHURN XAVFI", v: churn?.data?.count ?? 0, c: "text-vred" },
        ].map((k) => (
          <Card key={k.l}>
            <CardContent className="p-5 text-center">
              <p className={`font-display font-bold text-4xl ${k.c}`}>{k.v}</p>
              <p className="text-muted text-xs font-mono mt-2">{k.l}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Retention bar */}
      {r && (
        <Card>
          <CardHeader><CardTitle className="text-base">Retention (30 kun)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-vgreen">Faol: {r.active_last_30_days}</span>
              <span className="text-muted">Faolsiz: {r.total_members - r.active_last_30_days}</span>
            </div>
            <div className="h-3 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${r.retention_rate}%` }} />
            </div>
            <p className="text-center font-display font-bold text-xl text-accent">{r.retention_rate}% retention</p>
          </CardContent>
        </Card>
      )}

      {/* At risk */}
      {atRisk.length > 0 && (
        <Card className="border-vred/20">
          <CardHeader><CardTitle className="text-base text-vred">⚠️ Churn xavfi</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {atRisk.map((m: any) => (
                <li key={m.id} className="flex justify-between text-sm border-b border-border/50 pb-2">
                  <span className="text-vtext">{m.full_name}</span>
                  <a href={`/gym/members/${m.id}`} className="text-accent text-xs hover:underline">Ko'rish →</a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
