"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  CheckCircle, RefreshCw, AlertTriangle, ShieldAlert, HeartCrack,
  TrendingUp, TrendingDown, MessageCircle, ArrowLeft, DollarSign,
  Users, Bot
} from "lucide-react";

export default function RetentionPage() {
  const sb = getSupabase();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["deep-retention"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const gid = me?.gym_id;
      if (!gid) return { members: [], counts: { all: 0, critical: 0, atRisk: 0, active: 0 } };

      const { data: allMembers } = await sb.from("users").select("id, full_name, created_at, telegram_id, role").eq("gym_id", gid).eq("role", "member");
      const memberIds = (allMembers ?? []).map((m) => m.id);

      const ago7 = new Date(Date.now() - 7 * 86400000).toISOString();
      const ago30 = new Date(Date.now() - 30 * 86400000).toISOString();

      const { data: att } = await sb.from("attendance").select("member_id, checked_in_at").eq("gym_id", gid).gte("checked_in_at", ago30);
      const attMap = new Map<string, Date>();
      (att ?? []).forEach(a => {
        const d = new Date(a.checked_in_at);
        const existing = attMap.get(a.member_id);
        if (!existing || d > existing) attMap.set(a.member_id, d);
      });

      const { data: streaks } = await sb.from("member_streaks").select("member_id, current_streak").in("member_id", memberIds);
      const streakMap = Object.fromEntries((streaks ?? []).map(s => [s.member_id, s.current_streak]));

      const { data: payments } = await sb.from("payments").select("member_id, status").in("member_id", memberIds).gte("created_at", ago30).order("created_at", { ascending: false });
      const payMap = new Map();
      (payments ?? []).forEach(p => { if (!payMap.has(p.member_id)) payMap.set(p.member_id, p.status); });

      const members = (allMembers ?? []).map(m => {
        const reasons: string[] = [];
        let score = 0;
        let pStat = payMap.get(m.id);
        const lastAtt = attMap.get(m.id);
        const daysAgo = lastAtt ? Math.floor((Date.now() - lastAtt.getTime()) / 86400000) : 999;
        const st = streakMap[m.id] ?? 0;

        if (daysAgo >= 30) { score += 60; reasons.push("30 kundan beri qatnashmaydi"); }
        else if (daysAgo >= 14) { score += 50; reasons.push("2 haftadan beri kelmadi"); }
        else if (daysAgo >= 7) { score += 30; reasons.push("1 haftalik tanaffus"); }

        if (st === 0) { score += 20; reasons.push("Streak 0 (uzilgan)"); }

        if (pStat === "overdue" || pStat === "rejected") { score += 50; reasons.push("To'lov muammosi"); }
        else if (!pStat) { score += 30; reasons.push("Joriy oyda faol to'lov yo'q"); }

        let risk = "active";
        if (score >= 80) risk = "critical";
        else if (score >= 40) risk = "at_risk";
        else if (daysAgo <= 2 && score < 30) risk = "active";
        
        return { ...m, riskScore: score, reasons, risk, daysAgo };
      }).sort((a, b) => b.riskScore - a.riskScore);

      const counts = {
        all: members.length,
        critical: members.filter(m => m.risk === "critical").length,
        atRisk: members.filter(m => m.risk === "at_risk").length,
        active: members.filter(m => m.risk === "active").length
      };

      return { members, counts };
    }
  });

  const filtered = useMemo(() => {
    return (data?.members ?? []).filter((m: any) => {
      const matchQ = (m.full_name ?? "").toLowerCase().includes(query.toLowerCase());
      const matchT = tab === "all" || m.risk === tab;
      return matchQ && matchT;
    });
  }, [data, query, tab]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fadeUp pb-24 md:pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/gym" className="w-10 h-10 rounded-2xl bg-surface2 border border-border flex items-center justify-center press shadow-sm">
          <ArrowLeft size={18} className="text-vtext" />
        </Link>
        <div>
          <p className="font-mono text-[10px] tracking-[2px] text-accent uppercase mb-0.5">CHURN ANALYSIS</p>
          <h1 className="font-display font-bold text-2xl tracking-[-0.5px] text-vtext">Mijozlarni ushlab qolish</h1>
        </div>
      </div>

      <p className="text-[12px] text-muted mb-4 max-w-lg leading-relaxed">
        AI tizimi a'zolarning davomati, streaki va to'lovlarini tahlil qilib, ularning ketib qolish xavfini (<span className="text-vred font-bold">Churn Risk</span>) avtomatik hisoblaydi.
      </p>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="bg-surface border border-vred/30 rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm relative">
          <div className="absolute top-2 right-2 text-vred opacity-50"><ShieldAlert size={12} /></div>
          <p className="font-display font-bold text-xl text-vred mt-2">{data?.counts?.critical ?? 0}</p>
          <p className="text-[9px] font-mono text-vred text-center leading-tight uppercase">Jiddiy Xavf</p>
        </div>
        <div className="bg-surface border border-amber-500/30 rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm relative">
          <div className="absolute top-2 right-2 text-amber-400 opacity-50"><AlertTriangle size={12} /></div>
          <p className="font-display font-bold text-xl text-amber-400 mt-2">{data?.counts?.atRisk ?? 0}</p>
          <p className="text-[9px] font-mono text-amber-400 text-center leading-tight uppercase">Xavf ostida</p>
        </div>
        <div className="bg-surface border border-vgreen/30 rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm relative">
          <div className="absolute top-2 right-2 text-vgreen opacity-50"><CheckCircle size={12} /></div>
          <p className="font-display font-bold text-xl text-vgreen mt-2">{data?.counts?.active ?? 0}</p>
          <p className="text-[9px] font-mono text-vgreen text-center leading-tight uppercase">Faol</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm relative">
          <div className="absolute top-2 right-2 text-muted opacity-50"><Users size={12} /></div>
          <p className="font-display font-bold text-xl text-vtext mt-2">{data?.counts?.all ?? 0}</p>
          <p className="text-[9px] font-mono text-muted text-center leading-tight uppercase">Jami a'zolar</p>
        </div>
      </div>

      {/* Action / Filtering */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input 
          placeholder="Ism bo'yicha qidirish..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="bg-surface2 border-border h-11 text-[13px] rounded-xl flex-1"
        />
        <div className="flex gap-1.5 bg-surface2 p-1 rounded-xl overflow-x-auto">
          {[
            { id: "all", label: "Barchasi" },
            { id: "critical", label: "Jiddiy" },
            { id: "at_risk", label: "Xavfda" },
            { id: "active", label: "Faol" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${tab === t.id ? "bg-surface border border-border text-vtext shadow-sm" : "text-muted hover:text-vtext"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted text-sm py-8">Tahlil qilinmoqda...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <Bot size={32} className="text-muted mb-3" />
            <p className="text-sm font-medium text-vtext">Natija topilmadi</p>
            <p className="text-xs text-muted mt-1">Boshqa filter tanlang</p>
          </div>
        ) : (
          filtered.map((m: any) => (
            <Card key={m.id} className={`border ${m.risk === 'critical' ? 'border-vred/40 bg-vred/[0.02]' : m.risk === 'at_risk' ? 'border-amber-500/40 bg-amber-500/[0.02]' : 'border-border bg-surface'} rounded-2xl`}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-display font-bold text-[15px] text-vtext">{m.full_name}</h3>
                    {m.risk === 'critical' && <span className="bg-vred/10 text-vred text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold">Jiddiy Xavf</span>}
                    {m.risk === 'at_risk' && <span className="bg-amber-500/10 text-amber-400 text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold">Xavf</span>}
                  </div>
                  <div className="space-y-1">
                    {m.reasons.length > 0 ? m.reasons.map((r: string, i: number) => (
                      <p key={i} className="text-[10px] text-muted flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-muted" /> {r}
                      </p>
                    )) : (
                      <p className="text-[10px] text-vgreen flex items-center gap-1.5">
                        <CheckCircle size={10} /> Hammasi joyida
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link href={`/gym/members/${m.id}`}>
                    <Button variant="outline" className="h-10 text-[11px] rounded-xl border-border bg-surface2 hover:bg-surface">
                      Profil
                    </Button>
                  </Link>
                  {m.telegram_id && m.risk !== 'active' && (
                    <Button className="h-10 bg-accent text-bg hover:bg-accent/90 rounded-xl text-[11px] font-bold px-4 shadow-[0_0_12px_rgba(213,255,69,0.15)] flex items-center gap-1.5">
                      <MessageCircle size={14} /> Xabar yozish
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
