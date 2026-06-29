"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  CheckCircle, RefreshCw, AlertTriangle, ShieldAlert, HeartCrack,
  TrendingUp, TrendingDown, MessageCircle, Phone, Tag,
  Users, Search, ArrowLeft, DollarSign,
  type LucideIcon,
} from "lucide-react";

type Risk = "active" | "recovering" | "at_risk" | "critical" | "lost";

const RISK_CONFIG: Record<Risk, { label: string; icon: LucideIcon; color: string; border: string; bg: string }> = {
  active: { label: "Faol", icon: CheckCircle, color: "text-emerald-300", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  recovering: { label: "Qaytayotgan", icon: RefreshCw, color: "text-sky-300", border: "border-sky-500/30", bg: "bg-sky-500/10" },
  at_risk: { label: "Xavfda", icon: AlertTriangle, color: "text-amber-300", border: "border-amber-500/30", bg: "bg-amber-500/10" },
  critical: { label: "Jiddiy", icon: ShieldAlert, color: "text-orange-300", border: "border-orange-500/30", bg: "bg-orange-500/10" },
  lost: { label: "Yo'qotilgan", icon: HeartCrack, color: "text-rose-300", border: "border-rose-500/30", bg: "bg-rose-500/10" },
};

const computeRisk = (streak: { last_activity?: string | null; current_streak?: number } | null, now = Date.now()): Risk => {
  if (!streak?.last_activity) return "critical";
  const daysAgo = Math.floor((now - new Date(streak.last_activity).getTime()) / 86400000);
  if (daysAgo >= 30) return "lost";
  if (daysAgo >= 10) return "critical";
  if (daysAgo >= 5) return "at_risk";
  if (daysAgo <= 1 && (streak.current_streak ?? 0) >= 2) return "recovering";
  return "active";
};

export default function RetentionPage() {
  const sb = getSupabase();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Risk | "all">("all");

  const { data } = useQuery({
    queryKey: ["retention-center"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const gid = me?.gym_id;
      if (!gid) return { members: [] };

      const { data: allMembers } = await sb
        .from("users")
        .select("id, full_name, created_at, telegram_id")
        .eq("gym_id", gid)
        .eq("role", "member");

      const { data: streaks } = await sb
        .from("member_streaks")
        .select("member_id, current_streak, last_activity, total_points");

      const streakMap = Object.fromEntries((streaks ?? []).map((s) => [s.member_id, s]));
      const now = Date.now();

      const members = (allMembers ?? []).map((m: any) => {
        const streak = streakMap[m.id];
        const risk = computeRisk(streak ?? null, now);
        return {
          id: m.id,
          full_name: m.full_name,
          telegram_id: m.telegram_id,
          created_at: m.created_at,
          days_ago: streak?.last_activity ? Math.floor((now - new Date(streak.last_activity).getTime()) / 86400000) : 9999,
          streak,
          risk,
          score: Math.max(0, 100 - (streak?.current_streak ?? 0) * 5 - Math.max(0, (streak?.total_points ?? 0) / 10)),
        };
      });

      return { members };
    },
  });

  const filtered = useMemo(() => {
    const list = data?.members ?? [];
    return list.filter((m: any) => {
      const matchesQuery = (m.full_name ?? "").toLowerCase().includes(query.toLowerCase());
      const matchesTab = tab === "all" || m.risk === tab;
      return matchesQuery && matchesTab;
    });
  }, [data, query, tab]);

  const counts = useMemo(() => {
    const list = data?.members ?? [];
    return list.reduce((acc: any, m: any) => {
      acc[m.risk] = (acc[m.risk] || 0) + 1;
      acc.all += 1;
      return acc;
    }, { active: 0, recovering: 0, at_risk: 0, critical: 0, lost: 0, all: 0 });
  }, [data]);

  const triggerNotification = async (member: any, msg: string) => {
    if (!member.telegram_id) return;
    const user = await getUser();
    const { data: me } = await sb.from("users").select("gym_id, full_name").eq("id", user!.id).single();

    try {
      await sb.from("notifications").insert({
        user_id: member.id,
        gym_id: me?.gym_id,
        type: "retention_alert",
        title: `Retention: ${member.full_name}`,
        body: msg,
      });
      await fetch(`/api/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: member.telegram_id,
          text: `Hi, ${member.full_name}! 💪 Asalomu alaykum, biz sizni sog‘inishni boshladik. Bugun kelishga jur’at eting, kuch va motivatsiya bo‘ladi.`,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const bulkNotify = async () => {
    const targets = ["critical", "at_risk", "lost"] as Risk[];
    const list = (data?.members ?? []).filter((m: any) => targets.includes(m.risk));
    if (!list.length) return;
    const user = await getUser();
    const { data: me } = await sb.from("users").select("gym_id, full_name").eq("id", user!.id).single();
    const now = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

    for (const m of list) {
      const msg = `Asalomu alaykum, ${m.full_name}! Biz sizni ko‘rishdan xursand bo‘lardik. Bugun 5 daqiqa vaqtingizni ajrating — kelishga ikkilanmang 💪`;
      await triggerNotification(m, msg);
    }
    alert(`${list.length} ta a'zoga ogohantirish yuborildi. (${now})`);
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">🎯 Retention Center</h1>
        <p className="text-muted text-xs font-mono mt-1">A'ZOLARNING XAVF DARAJASI</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="border-l-2 border-l-rose-400 card-hover">
          <CardContent className="p-3 flex items-center gap-2">
            <TrendingDown size={20} strokeWidth={1.5} className="text-rose-400" />
            <div>
              <p className="font-display font-bold text-xl text-rose-300">
                {counts.all ? (((counts.lost + counts.critical) / counts.all) * 100).toFixed(1) : "0.0"}%
              </p>
              <p className="text-[9px] text-muted font-mono">CHURN RATE</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-2 border-l-emerald-400 card-hover">
          <CardContent className="p-3 flex items-center gap-2">
            <TrendingUp size={20} strokeWidth={1.5} className="text-emerald-400" />
            <div>
              <p className="font-display font-bold text-xl text-emerald-300">
                {counts.all ? (((counts.active + counts.recovering) / counts.all) * 100).toFixed(1) : "0.0"}%
              </p>
              <p className="text-[9px] text-muted font-mono">RETENTION RATE</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-2 border-l-amber-400 card-hover">
          <CardContent className="p-3 flex items-center gap-2">
            <DollarSign size={20} strokeWidth={1.5} className="text-amber-400" />
            <div>
              <p className="font-display font-bold text-xl text-amber-300">{counts.at_risk + counts.critical}</p>
              <p className="text-[9px] text-muted font-mono">REVENUE AT RISK</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-2 border-l-orange-400 card-hover">
          <CardContent className="p-3 flex items-center gap-2">
            <Users size={20} strokeWidth={1.5} className="text-orange-400" />
            <div>
              <p className="font-display font-bold text-xl text-orange-300">{counts.at_risk + counts.critical}</p>
              <p className="text-[9px] text-muted font-mono">AT-RISK COUNT</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between gap-2">
            <span>A'zolar</span>
            <div className="flex items-center gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Qidirish..."
                className="h-7 w-32 text-[11px] bg-surface border-border"
              />
              <Button size="sm" variant="secondary" onClick={bulkNotify} className="text-[11px] h-7">
                ✉️ Bulk ogohlantirish
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 overflow-x-auto pb-2">
            <button
              onClick={() => setTab("all")}
              className={`px-3 py-1 rounded-full text-[10px] font-mono border transition ${
                tab === "all" ? "border-accent/40 bg-accent/10 text-accent" : "border-border text-muted"
              }`}
            >
              Hammasi ({counts.all})
            </button>
            {(["at_risk", "critical", "recovering", "lost"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTab(r)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono border transition ${
                  tab === r ? `${RISK_CONFIG[r].border} ${RISK_CONFIG[r].bg} ${RISK_CONFIG[r].color}` : "border-border text-muted"
                }`}
              >
                {(() => { const Icon = RISK_CONFIG[r].icon; return <Icon size={14} strokeWidth={1.5} className="inline-block mr-1 -mt-0.5" />; })()}
                {RISK_CONFIG[r].label} ({counts[r] ?? 0})
              </button>
            ))}
          </div>

          <div className="mt-2 space-y-2">
            {!filtered.length ? (
              <p className="text-muted text-xs py-3 text-center">Mos keladigan a'zolar topilmadi.</p>
            ) : (
              filtered.map((m: any) => {
                const cfg = (RISK_CONFIG as any)[m.risk] ?? RISK_CONFIG.active;
                return (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border ${cfg.border} ${cfg.bg} transition`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                        {m.full_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm text-vtext">{m.full_name}</p>
                        <p className="text-[10px] text-muted font-mono">
                          {m.days_ago >= 1000 ? "Hech qachon faollashtmagan" : m.days_ago === 0 ? "Bugun" : `${m.days_ago} kun oldin`}
                          {m.streak?.current_streak ? ` · ${m.streak.current_streak} kun streak` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.border} ${cfg.bg} ${cfg.color}`}>
                        <cfg.icon size={12} strokeWidth={1.5} />
                        {cfg.label}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted hover:text-accent" title="Xabar" onClick={() => {}}>
                        <MessageCircle size={14} strokeWidth={1.5} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted hover:text-emerald-400" title="Qo'ng'iroq" onClick={() => { if (m.phone) window.open(`tel:${m.phone}`); }}>
                        <Phone size={14} strokeWidth={1.5} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted hover:text-amber-400" title="Chegirma" onClick={() => {}}>
                        <Tag size={14} strokeWidth={1.5} />
                      </Button>
                      <Link href={`/gym/members/${m.id}`}>
                        <Button variant="ghost" size="sm" className="text-[11px]">Batafsil</Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Win-Back Campaign */}
      {(() => {
        const lostMembers = (data?.members ?? []).filter((m: any) => m.risk === "lost");
        if (!lostMembers.length) return null;
        return (
          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <HeartCrack size={18} strokeWidth={1.5} className="text-rose-400" />
                Qaytarish kampaniyasi
                <span className="text-[10px] font-mono text-muted ml-auto">{lostMembers.length} ta a'zo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lostMembers.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-lg border border-rose-500/20 bg-rose-500/5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-rose-500/10 text-rose-300">
                      {m.full_name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm text-vtext">{m.full_name}</p>
                      <p className="text-[10px] text-muted font-mono">
                        {m.days_ago >= 1000 ? "Hech qachon" : `${m.days_ago} kun oldin`}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-[11px] h-7 border border-rose-500/30 hover:bg-rose-500/20"
                    onClick={() => triggerNotification(m, `Assalomu alaykum, ${m.full_name}! Sizga maxsus taklif tayyorladik. Qaytib keling — biz kutamiz! 💪`)}
                  >
                    <RefreshCw size={12} strokeWidth={1.5} className="mr-1" />
                    Qayta taklif
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
