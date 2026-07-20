"use client";
import { UserService } from "@/lib/services/UserService";
import { NotificationService } from "@/lib/services/NotificationService";
import { useState } from "react";
import { Avatar, Panel } from "@/components/features";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const [tab, setTab] = useState("UMUMIY");

  const { data: user, isLoading: isUserLoading, isError: isUserError } = useQuery({
    queryKey: ["user"],
    queryFn: () => UserService.getMe()
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: () => UserService.getStats()
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationService.getList()
  });

  if (isUserLoading || isStatsLoading) return <div className="p-4 text-center text-muted mt-10">Yuklanmoqda...</div>;
  if (isUserError) return <div className="p-4 text-center text-vred mt-10">Ma'lumotlarni yuklashda xatolik yuz berdi.</div>;

  const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0,2).toUpperCase() : "U";
  const streak = stats?.current_streak || 0;
  const bestStreak = stats?.longest_streak || 0;
  const level = user?.level || 1;
  const levelName = user?.levelName || "Boshlang'ich";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
         <Avatar initials={initials} size="lg" />
         <div>
            <h1 className="font-display font-bold text-[17px] text-vtext">{user?.name || user?.full_name || "Foydalanuvchi"}</h1>
            <div className="mt-1 inline-flex bg-[rgba(232,255,71,0.12)] px-2.5 py-0.5 rounded-full text-[10px] font-mono text-accent uppercase">
               👑 DARAJA {level} · {levelName}
            </div>
         </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
         {['UMUMIY', 'TO\'LOVLAR', 'ANALITIKA', 'BILDIRISHNOMA'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[9px] font-mono tracking-widest ${tab === t ? 'bg-accent text-bg font-bold' : 'bg-surface2 border border-border text-[#8888a0]'}`}>
               {t}
            </button>
         ))}
      </div>

      {tab === 'UMUMIY' && (
        <div className="space-y-4">
          <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-4 text-center">
             <div className="text-2xl mb-1">🔥</div>
             <div className="font-display font-bold text-[24px] text-vtext mb-1">{streak} kun</div>
             <div className="font-mono text-[10px] text-muted">Rekord: {bestStreak} kun</div>
          </div>
        </div>
      )}
      
      {tab === 'TO\'LOVLAR' && (
        <Panel title="TO'LOV TARIXI">
          <div className="text-xs text-muted">Hali to'lovlar mavjud emas</div>
        </Panel>
      )}

      {tab === 'ANALITIKA' && (
        <Panel title="ANALITIKA">
          <div className="text-xs text-muted">Ma'lumot yetarli emas</div>
        </Panel>
      )}

      {tab === 'BILDIRISHNOMA' && (
        <div className="space-y-2">
          {(notifications as any)?.items?.length > 0 ? (notifications as any).items.map((n: any, i: number) => (
             <div key={i} className="bg-surface border border-border rounded-[13px] p-3.5">
                <div className="text-[12px] text-vtext">{n.message || n.title}</div>
             </div>
          )) : (
             <div className="text-center text-muted text-xs p-4">Bildirishnomalar yo'q</div>
          )}
        </div>
      )}
    </div>
  );
}