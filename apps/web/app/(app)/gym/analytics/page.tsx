"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
  const { data: retention } = useQuery({ queryKey: ["gym", "retention"], queryFn: api.gym.retention });
  const { data: churn } = useQuery({ queryKey: ["gym", "churn"], queryFn: api.gym.churnRisk });
  const r = retention?.data;
  const atRisk = churn?.data?.at_risk_members ?? [];
  const inactive = r ? r.total_members - r.active_last_30_days : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📊 Analitika</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Jami a'zolar", value: r?.total_members ?? "—", color: "text-gray-800" },
          { label: "Faol (30 kun)", value: r?.active_last_30_days ?? "—", color: "text-green-600" },
          { label: "Churn xavfi", value: churn?.data?.count ?? "—", color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {r && (
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Retention (30 kun)</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-green-600">Faol</span><span className="font-bold">{r.active_last_30_days}</span></div>
            <div className="w-full bg-gray-100 rounded-full h-4">
              <div className="bg-indigo-500 h-4 rounded-full" style={{ width: `${r.retention_rate}%` }} />
            </div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Faolsiz: {inactive}</span><span className="font-bold text-indigo-600">{r.retention_rate}% retention</span></div>
          </div>
        </div>
      )}

      {atRisk.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-3 text-red-600">⚠️ Churn xavfi ostidagi a'zolar</h2>
          <ul className="space-y-2">
            {atRisk.map((m: any) => (
              <li key={m.id} className="flex justify-between text-sm border-b pb-2">
                <span>{m.full_name}</span>
                <a href={`/gym/members/${m.id}`} className="text-indigo-600 hover:underline text-xs">Ko'rish →</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
