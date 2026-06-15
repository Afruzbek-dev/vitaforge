"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import Link from "next/link";

export default function RetentionPage() {
  const sb = getSupabase();

  const { data } = useQuery({
    queryKey: ["retention-center"],
    queryFn: async () => {
      const user = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", user!.id).single();
      const gid = me?.gym_id;
      if (!gid) return { atRisk: [], lost: [], returning: [] };

      const { data: allMembers } = await sb.from("users").select("id, full_name, created_at").eq("gym_id", gid).eq("role", "member");
      const { data: streaks } = await sb.from("member_streaks").select("member_id, current_streak, last_activity, total_points");
      const streakMap = Object.fromEntries((streaks ?? []).map((s) => [s.member_id, s]));

      const now = Date.now();
      const atRisk: any[] = [];
      const lost: any[] = [];
      const returning: any[] = [];

      for (const m of allMembers ?? []) {
        const s = streakMap[m.id];
        const lastSeen = s?.last_activity ? new Date(s.last_activity).getTime() : 0;
        const daysAgo = Math.floor((now - lastSeen) / 86400000);

        if (daysAgo >= 14) {
          lost.push({ ...m, days_ago: daysAgo, streak: s });
        } else if (daysAgo >= 5) {
          atRisk.push({ ...m, days_ago: daysAgo, streak: s });
        } else if (s && s.current_streak >= 3 && daysAgo <= 2) {
          // Was at risk but came back (streak growing)
          const memberAge = Math.floor((now - new Date(m.created_at).getTime()) / 86400000);
          if (memberAge > 14) returning.push({ ...m, streak: s });
        }
      }

      return { atRisk, lost, returning };
    },
  });

  const Section = ({ title, icon, color, members, emptyText }: any) => (
    <Card className={`border-${color}/20`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <span>{icon}</span> {title} <span className="text-muted font-mono">({members?.length ?? 0})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(!members || members.length === 0) ? (
          <p className="text-muted text-sm py-2">{emptyText}</p>
        ) : (
          <div className="space-y-2">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-${color}/10 text-${color}`}>{m.full_name?.[0]}</div>
                  <div>
                    <p className="text-sm text-vtext">{m.full_name}</p>
                    <p className="text-[10px] text-muted">{m.days_ago ? `${m.days_ago} kun oldin` : `${m.streak?.current_streak ?? 0} kun streak`}</p>
                  </div>
                </div>
                <Link href={`/gym/members/${m.id}`}><Button variant="ghost" size="sm" className="text-xs">Ko'rish</Button></Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-3xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">🎯 Retention Center</h1>
        <p className="text-muted text-xs font-mono mt-1">QAYSI A'ZOLAR XAVFDA?</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-l-2 border-l-[#ff9f43]"><CardContent className="p-3 text-center"><p className="font-display font-bold text-xl text-[#ff9f43]">{data?.atRisk.length ?? 0}</p><p className="text-[9px] text-muted font-mono">XAVFDA</p></CardContent></Card>
        <Card className="border-l-2 border-l-vred"><CardContent className="p-3 text-center"><p className="font-display font-bold text-xl text-vred">{data?.lost.length ?? 0}</p><p className="text-[9px] text-muted font-mono">YO'QOTILGAN</p></CardContent></Card>
        <Card className="border-l-2 border-l-vgreen"><CardContent className="p-3 text-center"><p className="font-display font-bold text-xl text-vgreen">{data?.returning.length ?? 0}</p><p className="text-[9px] text-muted font-mono">QAYTAYOTGAN</p></CardContent></Card>
      </div>

      <Section title="Xavfda (5-13 kun)" icon="⚠️" color="accent" members={data?.atRisk} emptyText="Yaxshi! Hech kim xavfda emas 🎉" />
      <Section title="Yo'qotilgan (14+ kun)" icon="💔" color="vred" members={data?.lost} emptyText="Ajoyib! Hech kim yo'qolmagan" />
      <Section title="Qaytayotgan" icon="🔄" color="vgreen" members={data?.returning} emptyText="Hali qaytayotganlar yo'q" />
    </div>
  );
}
