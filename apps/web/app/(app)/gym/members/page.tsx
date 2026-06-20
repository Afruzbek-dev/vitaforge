"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import Link from "next/link";

type Filter = "all" | "risk" | "active" | "new";

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const sb = getSupabase();

  const { data } = useQuery({
    queryKey: ["gym-members-table"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      if (!me?.gym_id) return { members: [], riskCount: 0 };
      const { data: members } = await sb.from("users").select("id, full_name, phone, created_at").eq("gym_id", me.gym_id).eq("role", "member");
      const ids = (members ?? []).map((m) => m.id);
      if (!ids.length) return { members: [], riskCount: 0 };
      const { data: streaks } = await sb.from("member_streaks").select("member_id, current_streak, total_points, last_activity").in("member_id", ids);
      const sMap = Object.fromEntries((streaks ?? []).map((s) => [s.member_id, s]));
      const now = Date.now();
      const result = (members ?? []).map((m) => {
        const s = sMap[m.id];
        const daysAgo = s?.last_activity ? Math.floor((now - new Date(s.last_activity).getTime()) / 86400000) : 999;
        const isNew = (now - new Date(m.created_at).getTime()) < 7 * 86400000;
        const status: "risk" | "active" | "new" = daysAgo >= 7 ? "risk" : isNew ? "new" : "active";
        return { ...m, streak: s?.current_streak ?? 0, points: s?.total_points ?? 0, days_ago: daysAgo, status };
      });
      // Risk first, then active, then new
      result.sort((a, b) => (a.status === "risk" ? 0 : a.status === "active" ? 1 : 2) - (b.status === "risk" ? 0 : b.status === "active" ? 1 : 2));
      return { members: result, riskCount: result.filter((m) => m.status === "risk").length };
    },
  });

  const members = (data?.members ?? [])
    .filter((m) => filter === "all" || m.status === filter)
    .filter((m) => !search || m.full_name?.toLowerCase().includes(search.toLowerCase()) || m.phone?.includes(search));

  const riskCount = data?.riskCount ?? 0;

  const statusBadge = (s: string) => s === "risk" ? "bg-vred/10 text-vred" : s === "active" ? "bg-vgreen/10 text-vgreen" : "bg-accent/10 text-accent";
  const statusLabel = (s: string) => s === "risk" ? "Risk" : s === "active" ? "Faol" : "Yangi";

  return (
    <div className="max-w-5xl space-y-5 animate-fadeUp">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display font-bold text-[21px] text-vtext">A'zolar</h1>
          <p className="text-[12px] text-muted">{data?.members.length ?? 0} ta a'zo · {riskCount} tasi diqqat talab qiladi</p>
        </div>
        <Link href="/gym/invite"><Button size="sm">+ Yangi a'zo</Button></Link>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ism yoki telefon bo'yicha qidirish..." className="pl-9" />
        </div>
        {[
          { id: "risk" as Filter, label: `Risk · ${riskCount}`, active: riskCount > 0 },
          { id: "active" as Filter, label: "Faol", active: false },
          { id: "new" as Filter, label: "Yangi", active: false },
        ].map((f) => (
          <Button key={f.id} variant={filter === f.id ? "default" : "secondary"} size="sm"
            onClick={() => setFilter(filter === f.id ? "all" : f.id)}
            className={`text-xs ${filter === f.id && f.id === "risk" ? "bg-vred text-white" : ""}`}>
            {f.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted text-sm">A'zo topilmadi</p>
              <Link href="/gym/invite"><Button size="sm" className="mt-3">+ Birinchi a'zo</Button></Link>
            </div>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[9px] font-mono text-muted tracking-[1px] border-b border-border">
                  <th className="text-left py-3 px-4">A'ZO</th>
                  <th className="text-left py-3 px-2">STREAK</th>
                  <th className="text-left py-3 px-2">TO'LOV</th>
                  <th className="text-left py-3 px-2">HOLAT</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m: any) => {
                  const initials = m.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) ?? "?";
                  return (
                    <tr key={m.id} className="border-b border-[#15151f] hover:bg-[#0d0d16] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${m.status === "risk" ? "bg-vred/15 text-vred" : "bg-accent/10 text-accent"}`}>{initials}</div>
                          <span className="text-vtext font-medium">{m.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={m.streak > 0 ? "text-accent" : "text-muted"}>
                          {m.streak > 0 ? "🔥" : ""} {m.streak} kun
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted">
                        {m.days_ago < 999 ? (m.days_ago === 0 ? "Bugun" : `${m.days_ago} kun oldin`) : "—"}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded ${statusBadge(m.status)}`}>{statusLabel(m.status)}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/gym/members/${m.id}`}>
                          <span className="text-[10px] text-vblue font-mono cursor-pointer hover:underline">
                            {m.status === "risk" ? "Xabar →" : "Ko'rish →"}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
