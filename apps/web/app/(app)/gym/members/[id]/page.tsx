"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { getRetentionSuggestions } from "@/lib/retention-ai";
import Link from "next/link";

const TABS = [
  { id: "overview", label: "Umumiy" },
  { id: "food", label: "Ovqat" },
  { id: "attendance", label: "Davomat" },
  { id: "photos", label: "Fotolar" },
  { id: "plans", label: "Planlar" },
];

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sb = getSupabase();
  const [tab, setTab] = useState("overview");
  const [msg, setMsg] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["crm-member", id],
    queryFn: async () => {
      const { data: user } = await sb.from("users").select("*").eq("id", id).single();
      const { data: profile } = await sb.from("member_profiles").select("*").eq("user_id", id).single();
      const { data: streak } = await sb.from("member_streaks").select("*").eq("member_id", id).single();
      const { data: food } = await sb.from("food_logs").select("food_name, calories, logged_at, meal_type").eq("member_id", id).order("logged_at", { ascending: false }).limit(30);
      const { data: attendance } = await sb.from("attendance").select("checked_in_at").eq("member_id", id).order("checked_in_at", { ascending: false }).limit(30);
      const { data: photos } = await sb.from("progress_photos").select("taken_at, ai_score, photo_type, week_number").eq("member_id", id).order("taken_at", { ascending: false }).limit(12);
      const { data: plans } = await sb.from("fitness_plans").select("week_number, is_active, created_at, generated_by, nutrition").eq("member_id", id).order("created_at", { ascending: false }).limit(5);
      return { user, profile, streak, food: food ?? [], attendance: attendance ?? [], photos: photos ?? [], plans: plans ?? [] };
    },
  });

  if (isLoading || !data?.user) return <div className="text-muted animate-pulse p-4">Yuklanmoqda...</div>;
  const { user: m, profile, streak, food, attendance, photos, plans } = data;

  const risk = !streak?.last_activity ? "unknown" : (new Date().getTime() - new Date(streak.last_activity).getTime()) / 86400000 > 7 ? "high" : (streak?.current_streak ?? 0) < 3 ? "medium" : "low";

  return (
    <div className="max-w-3xl space-y-4 animate-fadeUp">
      <Link href="/gym/members"><Button variant="ghost" size="sm">← Orqaga</Button></Link>

      {/* Header */}
      <Card className="border-accent-border/30">
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-lg ${risk === "high" ? "bg-vred/20 text-vred" : risk === "medium" ? "bg-accent/20 text-accent" : "bg-vgreen/20 text-vgreen"}`}>
            {m.full_name?.[0]}
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-lg text-vtext">{m.full_name}</p>
            <p className="text-muted text-xs">{m.phone ?? ""} · {profile?.goal ?? "Maqsad belgilanmagan"}</p>
          </div>
          <span className={`text-[10px] font-mono px-2 py-1 rounded-full ${risk === "high" ? "bg-vred/10 text-vred" : risk === "medium" ? "bg-accent/10 text-accent" : "bg-vgreen/10 text-vgreen"}`}>
            {risk === "high" ? "⚠️ XAVF" : risk === "medium" ? "⚡ O'RTA" : "✅ YAXSHI"}
          </span>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { l: "Streak", v: streak?.current_streak ?? 0, u: "kun" },
          { l: "Kuch", v: streak?.total_points ?? 0, u: "⚡" },
          { l: "Davomat", v: attendance.length, u: "/30 kun" },
          { l: "Rekord", v: streak?.longest_streak ?? 0, u: "kun" },
        ].map((s) => (
          <Card key={s.l}><CardContent className="p-2 text-center"><p className="font-display font-bold text-lg text-accent">{s.v}</p><p className="text-[9px] text-muted">{s.l} {s.u}</p></CardContent></Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Button key={t.id} variant={tab === t.id ? "default" : "secondary"} size="sm" onClick={() => setTab(t.id)} className="text-xs shrink-0">{t.label}</Button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <Card><CardContent className="p-4 space-y-2 text-sm">
          {[["Yosh", profile?.age], ["Bo'y", profile?.height_cm ? `${profile.height_cm} cm` : null], ["Vazn", profile?.weight_kg ? `${profile.weight_kg} kg` : null], ["Faollik", profile?.activity_level], ["Qo'shilgan", new Date(m.created_at).toLocaleDateString()]].filter(([, v]) => v).map(([k, v]) => (
            <div key={k as string} className="flex justify-between"><span className="text-muted">{k}</span><span className="text-vtext">{v}</span></div>
          ))}
          {(streak?.badges ?? []).length > 0 && (
            <div className="pt-2 border-t border-border"><p className="text-muted text-xs mb-1">Badges:</p><div className="flex flex-wrap gap-1">{streak.badges.map((b: string) => <span key={b} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{b}</span>)}</div></div>
          )}
        </CardContent></Card>
      )}

      {tab === "food" && (
        <Card><CardContent className="p-4">
          {food.length === 0 ? <p className="text-muted text-sm">Ma'lumot yo'q</p> : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {food.map((f: any, i: number) => (
                <div key={i} className="flex justify-between text-xs border-b border-border/50 py-1.5">
                  <span className="text-vtext">{f.food_name} <span className="text-muted">({f.meal_type})</span></span>
                  <span className="text-accent font-mono">{Math.round(f.calories ?? 0)} kkal</span>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      )}

      {tab === "attendance" && (
        <Card><CardContent className="p-4">
          {attendance.length === 0 ? <p className="text-muted text-sm">Davomat yo'q</p> : (
            <div className="grid grid-cols-7 gap-1">
              {attendance.slice(0, 28).map((a: any, i: number) => (
                <div key={i} className="w-full aspect-square rounded bg-vgreen/20 flex items-center justify-center text-[8px] text-vgreen">
                  {new Date(a.checked_in_at).getDate()}
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      )}

      {tab === "photos" && (
        <Card><CardContent className="p-4">
          {photos.length === 0 ? <p className="text-muted text-sm">Foto yo'q</p> : (
            <div className="space-y-2">
              {photos.map((p: any, i: number) => (
                <div key={i} className="flex justify-between text-sm border-b border-border/50 py-1.5">
                  <span className="text-vtext">Hafta {p.week_number} · {p.photo_type}</span>
                  <span className="text-accent font-mono">{p.ai_score ? `⭐${p.ai_score}` : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      )}

      {tab === "plans" && (
        <Card><CardContent className="p-4">
          {plans.length === 0 ? <p className="text-muted text-sm">Plan yo'q</p> : (
            <div className="space-y-2">
              {plans.map((p: any, i: number) => (
                <div key={i} className="flex justify-between text-sm border-b border-border/50 py-1.5">
                  <span className="text-vtext">Hafta {p.week_number} <span className="text-muted text-xs">({p.generated_by})</span></span>
                  <span className={`text-xs font-mono ${p.is_active ? "text-accent" : "text-muted"}`}>{p.is_active ? "FAOL" : "O'tgan"}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      )}

      {/* AI Retention Suggestions */}
      {(() => {
        const daysAgo = data?.streak?.last_activity ? Math.floor((Date.now() - new Date(data.streak.last_activity).getTime()) / 86400000) : 999;
        const suggestions = getRetentionSuggestions({
          full_name: data?.user?.full_name ?? "",
          days_ago: daysAgo,
          streak: data?.streak?.current_streak ?? 0,
          points: data?.streak?.total_points ?? 0,
          goal: data?.profile?.goal,
        });
        if (!suggestions.length) return null;
        return (
          <Card className="border-accent-border/20">
            <CardContent className="p-4">
              <p className="font-mono text-[9px] text-accent tracking-[1.5px] mb-3">🤖 AI TAVSIYALAR</p>
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${s.priority === "high" ? "border-vred/30 bg-vred/5" : s.priority === "medium" ? "border-accent-border/30 bg-accent/5" : "border-border"}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-medium text-vtext">{s.title}</p>
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${s.priority === "high" ? "bg-vred/10 text-vred" : s.priority === "medium" ? "bg-accent/10 text-accent" : "bg-surface text-muted"}`}>{s.priority}</span>
                    </div>
                    <p className="text-[11px] text-muted mb-1">{s.reason}</p>
                    <p className="text-[10px] text-[#9999ad] mb-1.5">{s.description}</p>
                    <details className="mb-2">
                      <summary className="text-[10px] text-vblue cursor-pointer">Qanday oldini olish?</summary>
                      <p className="text-[10px] text-muted mt-1 pl-2 border-l border-border">{s.prevention}</p>
                    </details>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => setMsg(s.message)}>📋 Nusxalash</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Send message */}
      <Card><CardContent className="p-3">
        <div className="flex gap-2">
          <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Telegram xabar yuborish..." className="text-sm" />
          <Button size="sm" disabled={!msg.trim()}>Yuborish</Button>
        </div>
      </CardContent></Card>
    </div>
  );
}
