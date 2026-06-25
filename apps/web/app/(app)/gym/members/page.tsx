"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Search, UserPlus, Send, CreditCard, Filter, Users, AlertTriangle, UserCheck } from "lucide-react";
import Link from "next/link";

type FilterType = "all" | "risk" | "active" | "new";

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [assigningTrainer, setAssigningTrainer] = useState<string | null>(null);
  const sb = getSupabase();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["gym-members-crm"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      if (!me?.gym_id) return { members: [], trainers: [] };
      const gid = me.gym_id;

      const { data: members } = await sb.from("users").select("id, full_name, phone, created_at").eq("gym_id", gid).eq("role", "member");
      const { data: trainers } = await sb.from("users").select("id, full_name").eq("gym_id", gid).eq("role", "trainer");

      const ids = (members ?? []).map((m) => m.id);
      if (!ids.length) return { members: [], trainers: trainers ?? [] };

      const { data: streaks } = await sb.from("member_streaks").select("member_id, current_streak, last_activity").in("member_id", ids);
      const sMap = Object.fromEntries((streaks ?? []).map((s) => [s.member_id, s]));

      // Memberships for tariff/payment info
      const { data: memberships } = await sb.from("memberships").select("member_id, plan_name, status, end_date").in("member_id", ids);
      const mMap = Object.fromEntries((memberships ?? []).map((m) => [m.member_id, m]));

      // Attendance last entry
      const { data: lastAtt } = await sb.from("attendance").select("member_id, checked_in_at").in("member_id", ids).order("checked_in_at", { ascending: false });
      const attMap: Record<string, string> = {};
      for (const a of lastAtt ?? []) { if (!attMap[a.member_id]) attMap[a.member_id] = a.checked_in_at; }

      const now = Date.now();
      const result = (members ?? []).map((m) => {
        const s = sMap[m.id];
        const ms = mMap[m.id];
        const lastVisit = attMap[m.id] ?? s?.last_activity;
        const daysAgo = lastVisit ? Math.floor((now - new Date(lastVisit).getTime()) / 86400000) : 999;
        const isNew = (now - new Date(m.created_at).getTime()) < 7 * 86400000;

        let risk: "high" | "medium" | "low" = "low";
        if (daysAgo >= 14) risk = "high";
        else if (daysAgo >= 7) risk = "medium";

        const paymentStatus = ms?.status === "active" ? "active" : ms?.status === "expired" ? "expired" : "none";

        return {
          ...m,
          streak: s?.current_streak ?? 0,
          daysAgo,
          risk,
          isNew,
          status: risk === "high" ? "risk" : risk === "medium" ? "risk" : isNew ? "new" : "active",
          tariff: ms?.plan_name ?? "—",
          paymentStatus,
          endDate: ms?.end_date,
          lastVisit,
        };
      }).sort((a, b) => {
        const riskOrder = { high: 0, medium: 1, low: 2 };
        return riskOrder[a.risk] - riskOrder[b.risk];
      });

      return { members: result, trainers: trainers ?? [] };
    },
  });

  const sendNotification = useMutation({
    mutationFn: async ({ memberId, message }: { memberId: string; message: string }) => {
      const user = await getUser();
      await sb.from("notifications").insert({ user_id: memberId, title: "Gym xabari", body: message, type: "gym_message", sender_id: user!.id });
    },
  });

  const assignTrainer = useMutation({
    mutationFn: async ({ memberId, trainerId }: { memberId: string; trainerId: string }) => {
      await sb.from("users").update({ trainer_id: trainerId }).eq("id", memberId);
    },
    onSuccess: () => { setAssigningTrainer(null); qc.invalidateQueries({ queryKey: ["gym-members-crm"] }); },
  });

  const members = (data?.members ?? [])
    .filter((m) => filter === "all" || (filter === "risk" ? m.risk !== "low" : filter === "new" ? m.isNew : m.risk === "low" && !m.isNew))
    .filter((m) => !search || m.full_name?.toLowerCase().includes(search.toLowerCase()) || m.phone?.includes(search));

  const riskCount = (data?.members ?? []).filter((m) => m.risk !== "low").length;

  const riskIndicator = (r: string) => r === "high" ? "bg-[var(--red)]" : r === "medium" ? "bg-[#ffa726]" : "bg-[var(--green)]";
  const payBadge = (s: string) => s === "active" ? "text-vgreen bg-vgreen/10" : s === "expired" ? "text-vred bg-vred/10" : "text-muted bg-card";

  return (
    <div className="max-w-6xl space-y-5 animate-fadeUp">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-xl text-vtext">A'zolar</h1>
          <p className="text-[11px] text-muted">{data?.members.length ?? 0} ta a'zo{riskCount > 0 && <span className="text-vred"> · {riskCount} xavf ostida</span>}</p>
        </div>
        <Link href="/gym/invite"><Button size="sm" className="gap-1.5"><UserPlus size={14} /> Yangi a'zo</Button></Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ism yoki telefon..." className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          {([
            { id: "all" as FilterType, label: "Barchasi", icon: Users },
            { id: "risk" as FilterType, label: `Xavf (${riskCount})`, icon: AlertTriangle },
            { id: "active" as FilterType, label: "Faol", icon: UserCheck },
            { id: "new" as FilterType, label: "Yangi", icon: Filter },
          ]).map((f) => (
            <Button key={f.id} variant={filter === f.id ? "default" : "outline"} size="sm" onClick={() => setFilter(f.id)} className="gap-1 text-xs">
              <f.icon size={12} />{f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {members.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted text-sm">A'zo topilmadi</p>
            </div>
          ) : (
            <table className="w-full text-[12px] min-w-[700px]">
              <thead>
                <tr className="text-[9px] font-mono text-muted tracking-wider border-b border-border">
                  <th className="text-left py-3 px-4">A'ZO</th>
                  <th className="text-left py-3 px-3">TELEFON</th>
                  <th className="text-left py-3 px-3">TARIF</th>
                  <th className="text-left py-3 px-3">TO'LOV</th>
                  <th className="text-left py-3 px-3">OXIRGI TASHRIF</th>
                  <th className="text-left py-3 px-3">XAVF</th>
                  <th className="py-3 px-4 text-right">AMALLAR</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m: any) => {
                  const initials = m.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) ?? "?";
                  return (
                    <tr key={m.id} className="border-b border-border/30 hover:bg-[var(--subtle)] transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/gym/members/${m.id}`} className="flex items-center gap-2.5 press">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${m.risk === "high" ? "bg-vred/15 text-vred" : m.risk === "medium" ? "bg-[#ffa726]/15 text-[#ffa726]" : "bg-accent/10 text-accent"}`}>{initials}</div>
                          <span className="text-vtext font-medium">{m.full_name}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-muted font-mono">{m.phone ?? "—"}</td>
                      <td className="py-3 px-3 text-vtext">{m.tariff}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${payBadge(m.paymentStatus)}`}>
                          {m.paymentStatus === "active" ? "Faol" : m.paymentStatus === "expired" ? "Tugagan" : "—"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted">
                        {m.daysAgo === 0 ? "Bugun" : m.daysAgo < 999 ? `${m.daysAgo} kun oldin` : "—"}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${riskIndicator(m.risk)}`} />
                          <span className={`text-[10px] font-mono ${m.risk === "high" ? "text-vred" : m.risk === "medium" ? "text-[#ffa726]" : "text-vgreen"}`}>
                            {m.risk === "high" ? "Yuqori" : m.risk === "medium" ? "O'rta" : "Past"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => sendNotification.mutate({ memberId: m.id, message: "Sizni gym'da kutmoqdamiz!" })}
                            className="w-7 h-7 rounded-lg bg-vblue/10 flex items-center justify-center press hover:bg-vblue/20 transition-colors"
                            title="Xabar yuborish"
                          >
                            <Send size={12} className="text-vblue" />
                          </button>
                          <button
                            onClick={() => sendNotification.mutate({ memberId: m.id, message: "To'lov muddati yaqinlashmoqda. Iltimos, to'lovni amalga oshiring." })}
                            className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center press hover:bg-accent/20 transition-colors"
                            title="To'lov so'rash"
                          >
                            <CreditCard size={12} className="text-accent" />
                          </button>
                          <button
                            onClick={() => setAssigningTrainer(assigningTrainer === m.id ? null : m.id)}
                            className="w-7 h-7 rounded-lg bg-vgreen/10 flex items-center justify-center press hover:bg-vgreen/20 transition-colors"
                            title="Trener biriktirish"
                          >
                            <UserCheck size={12} className="text-vgreen" />
                          </button>
                        </div>
                        {/* Trainer assign dropdown */}
                        {assigningTrainer === m.id && (data?.trainers?.length ?? 0) > 0 && (
                          <div className="absolute right-4 mt-1 bg-card border border-border rounded-xl p-2 shadow-xl z-10 animate-scaleIn">
                            <p className="text-[9px] font-mono text-muted mb-1.5">TRENER TANLANG</p>
                            {data!.trainers.map((t: any) => (
                              <button key={t.id} onClick={() => assignTrainer.mutate({ memberId: m.id, trainerId: t.id })} className="w-full text-left text-xs text-vtext px-2 py-1.5 rounded hover:bg-accent/10 transition-colors press">
                                {t.full_name}
                              </button>
                            ))}
                          </div>
                        )}
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
