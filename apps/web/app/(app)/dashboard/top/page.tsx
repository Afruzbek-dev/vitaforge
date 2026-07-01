"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Top() {
  const { data: leaderboard, isLoading, isError } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => api.leaderboard.get()
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => api.users.me()
  });

  if (isLoading) return <div className="p-4 text-center text-muted mt-10">Yuklanmoqda...</div>;
  if (isError) return <div className="p-4 text-center text-vred mt-10">Ma'lumotlarni yuklashda xatolik yuz berdi.</div>;

  const getPositionIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return (index + 1).toString();
  };

  const defaultMock = [
    { name: "Nilufar Mirzaeva", score: 3120 },
    { name: "Kamola Voxidova", score: 2890 },
    { name: "Siz", score: 2340, active: true },
    { name: "Doniyor Raxmonov", score: 1950 }
  ];

  const items = leaderboard?.items || leaderboard || defaultMock;

  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[17px] text-vtext">Haftalik reyting</h1>
      <div className="bg-surface border border-border rounded-[13px] overflow-hidden">
        {items.map((m: any, i: number) => {
          const isActive = m.active || (user?.id && m.userId === user.id) || m.name === "Siz" || m.name === user?.name;
          return (
            <div key={i} className={`flex justify-between items-center p-3.5 border-b border-[#15151f] ${isActive ? 'bg-[rgba(232,255,71,0.04)]' : ''}`}>
               <div className="flex items-center gap-3">
                 <span className="w-5 text-center text-sm">{m.pos || getPositionIcon(i)}</span>
                 <span className={`text-[13px] ${isActive ? 'text-accent font-semibold' : 'text-vtext'}`}>{m.name}</span>
               </div>
               <span className="font-mono text-[10px] text-muted">{m.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}