"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({ queryKey: ["gym", "member", id], queryFn: () => api.gym.member(id) });
  const m = data?.data;

  if (isLoading) return <div className="text-muted animate-pulse p-4">Yuklanmoqda...</div>;
  if (!m) return <div className="text-vred p-4">A'zo topilmadi</div>;

  return (
    <div className="max-w-2xl space-y-6 animate-fadeUp">
      <div className="flex items-center gap-3">
        <Link href="/gym/members"><Button variant="ghost" size="sm">← Orqaga</Button></Link>
        <h1 className="font-display font-bold text-xl text-vtext">{m.full_name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Profil</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[["Yosh", m.profile?.age], ["Maqsad", m.profile?.goal], ["Vazn", m.profile?.weight_kg ? `${m.profile.weight_kg} kg` : null], ["Bo'y", m.profile?.height_cm ? `${m.profile.height_cm} cm` : null]]
              .filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} className="flex justify-between">
                  <span className="text-muted">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Faollik</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Streak</span>
              <span className="text-accent font-bold">{m.streak?.current ?? 0} kun</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Ball</span>
              <span className="text-accent font-bold">{m.streak?.total_points ?? 0}</span>
            </div>
            {m.streak?.badges?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {m.streak.badges.map((b: string) => (
                  <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent-border font-mono">{b}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
