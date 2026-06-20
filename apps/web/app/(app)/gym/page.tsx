"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { useAuthStore } from "@/lib/store/auth";
import Link from "next/link";

export default function GymDashboard() {
  const sb = getSupabase();
  const user = useAuthStore((s) => s.user);

  const { data: d } = useQuery({
    queryKey: ["gym-dash"],
    queryFn: async () => {
      const u = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", u!.id).single();
      const gid = me?.gym_id;
      if (!gid) return null;
      const { count: total } = await sb.from("users").select("*", { count: "exact", head: true }).eq("gym_id", gid).eq("role", "member");
      const ago30 = new Date(Date.now() - 30 * 86400000).toISOString();
      const ago7 = new Date(Date.now() - 7 * 86400000).toISOString();
      const today = new Date().toISOString().split("T")[0];
      const { data: att30 } = await sb.from("attendance").select("member_id").eq("gym_id", gid).gte("checked_in_at", ago30);
      const active30 = new Set(att30?.map((a) => a.member_id)).size;
      const retention = (total ?? 0) > 0 ? Math.round((active30 / (total ?? 1)) * 100) : 0;
      const { count: todayCount } = await sb.from("attendance").select("*", { count: "exact", head: true }).eq("gym_id", gid).gte("checked_in_at", `${today}T00:00:00`);
      const { data: att7 } = await sb.from("attendance").select("member_id").eq("gym_id", gid).gte("checked_in_at", ago7);
      const active7 = new Set(att7?.map((a) => a.member_id));
      const { data: allM } = await sb.from("users").select("id, full_name, created_at").eq("gym_id", gid).eq("role", "member");
      const atRisk = (allM ?? []).filter((m) => !active7.has(m.id));
      const newToday = (allM ?? []).filter((m) => new Date(m.created_at).toISOString().split("T")[0] === today).length;
      return { total: total ?? 0, retention, todayCount: todayCount ?? 0, dau: (total ?? 0) > 0 ? Math.round(((todayCount ?? 0) / (total ?? 1)) * 100) : 0, atRisk, newToday };
    },
  });

  const days = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
  const dayName = days[new Date().getDay()];

  return (
    <div className="max-w-5xl space-y-5 animate-fadeUp">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display font-bold text-[21px] text-vtext">Xush kelibsiz, {user?.full_name?.split(" ")[0]} 👋</h1>
          <p className="text-[12px] text-muted mt-0.5">{dayName} · Bugun {d?.todayCount ?? 0} ta a'zo kutilmoqda</p>
        </div>
        <Link href="/gym/invite"><Button size="sm">+ Tezkor amal</Button></Link>
      </div>

      {/* Priority strip */}
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {d && d.atRisk.length > 0 && (
          <Link href="/gym/retention" className="shrink-0">
            <div className="min-w-[220px] bg-[#0d0d16] border border-[#e24b4a35] rounded-xl p-3.5 flex items-center gap-3 press card-hover" style={{ background: "rgba(226,75,74,0.04)" }}>
              <span className="text-xl">⚠️</span>
              <div><p className="font-display font-bold text-[17px]">{d.atRisk.length}</p><p className="text-[10px] text-[#8888a0]">A'zo risk ostida — bugun ko'ring</p></div>
            </div>
          </Link>
        )}
        {d && d.newToday > 0 && (
          <div className="shrink-0 min-w-[220px] bg-[#0d0d16] border border-[#1d9e7530] rounded-xl p-3.5 flex items-center gap-3" style={{ background: "rgba(29,158,117,0.04)" }}>
            <span className="text-xl">🎉</span>
            <div><p className="font-display font-bold text-[17px]">{d.newToday}</p><p className="text-[10px] text-[#8888a0]">Yangi a'zo bugun qo'shildi</p></div>
          </div>
        )}
        <div className="shrink-0 min-w-[220px] bg-[#0d0d16] border border-border rounded-xl p-3.5 flex items-center gap-3">
          <span className="text-xl">💰</span>
          <div><p className="font-display font-bold text-[17px]">—</p><p className="text-[10px] text-[#8888a0]">To'lov muddati bugun tugaydi</p></div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "RETENTION (30 KUN)", value: `${d?.retention ?? 0}%`, delta: "↑ yaxshi", accent: true },
          { label: "JAMI A'ZOLAR", value: d?.total ?? 0, delta: "+yangi", accent: false },
          { label: "BU OY SOF FOYDA", value: "—", delta: "so'm", accent: false },
          { label: "FAOL BUGUN", value: d?.todayCount ?? 0, delta: `${d?.dau ?? 0}% DAU`, accent: false },
        ].map((k) => (
          <Card key={k.label} className={k.accent ? "border-l-2 border-l-accent" : "border-l-2 border-l-[#2a2a3a]"}>
            <CardContent className="p-4">
              <p className="font-mono text-[9px] text-muted tracking-[1px]">{k.label}</p>
              <p className="font-display font-bold text-[20px] text-vtext mt-1.5">{k.value}</p>
              <p className="text-[10px] text-vgreen font-mono mt-0.5">{k.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feed + Risk — 2 column */}
      <div className="grid md:grid-cols-[1.5fr_1fr] gap-3.5">
        {/* Activity feed */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between mb-3">
              <p className="font-mono text-[9px] text-muted tracking-[1.5px]">SO'NGGI FAOLLIK</p>
              <Link href="/gym/members" className="text-[10px] text-vblue">Hammasi →</Link>
            </div>
            <div className="space-y-0.5">
              {[
                { time: "Hozir", text: `<b>${d?.todayCount ?? 0} ta</b> a'zo bugun checkin qildi` },
                { time: "—", text: `Jami <b>${d?.total ?? 0}</b> a'zo ro'yxatda` },
                ...(d?.atRisk?.slice(0, 2).map((m: any) => ({ time: "⚠️", text: `<b>${m.full_name}</b> 7+ kun kelmadi` })) ?? []),
              ].map((f, i) => (
                <div key={i} className="flex gap-2.5 py-2 border-b border-[#15151f] last:border-0 text-[12px] items-start">
                  <span className="text-[10px] text-[#45455a] font-mono w-10 shrink-0">{f.time}</span>
                  <span className="text-[#b8b8c8]" dangerouslySetInnerHTML={{ __html: f.text }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk panel */}
        <Card>
          <CardContent className="p-4">
            <p className="font-mono text-[9px] text-muted tracking-[1.5px] mb-3">⚠️ DIQQAT TALAB QILADI</p>
            {(!d || d.atRisk.length === 0) ? <p className="text-muted text-xs">Hamma yaxshi ✅</p> : (
              <div className="space-y-0.5">
                {d.atRisk.slice(0, 5).map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-[#15151f] last:border-0 text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-vred" />
                      <span className="text-vtext">{m.full_name?.split(" ").map((n: string) => n.slice(0, 1)).join("") === m.full_name ? m.full_name : m.full_name?.split(" ")[0] + " " + (m.full_name?.split(" ")[1]?.[0] ?? "") + "."}</span>
                    </div>
                    <Link href={`/gym/members/${m.id}`}>
                      <span className="font-mono text-[10px] text-vblue border border-vblue/30 px-2 py-0.5 rounded-md">Xabar →</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
