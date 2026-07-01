"use client";
import Link from "next/link";
import { ProgressBar, InsightCard } from "@/components/vf";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export default function MobileHome() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading, isError: isUserError } = useQuery({
    queryKey: ["user"],
    queryFn: () => api.users.me()
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: () => api.users.stats()
  });

  const checkinMutation = useMutation({
    mutationFn: () => api.gym.challenge(),
    onSuccess: () => {
      toast("Zalga kelganingiz tasdiqlandi! 🎯", "success");
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
    onError: () => {
      toast("Xatolik yuz berdi.", "error");
    }
  });

  if (isUserLoading || isStatsLoading) {
    return <div className="p-4 text-center text-muted mt-10">Yuklanmoqda...</div>;
  }
  
  if (isUserError) {
    return <div className="p-4 text-center text-vred mt-10">Ma'lumotlarni yuklashda xatolik yuz berdi.</div>;
  }

  const caloriesConsumed = stats?.calories?.consumed || 1200;
  const caloriesGoal = stats?.calories?.goal || 2400;
  const progress = caloriesGoal > 0 ? (caloriesConsumed / caloriesGoal) * 100 : 0;
  const todayDate = new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase();

  return (
    <div className="space-y-4 pb-4">
      <div className="mb-4 mt-2">
        <div className="font-mono text-[8px] tracking-widest text-muted uppercase mb-1">{todayDate}</div>
        <h1 className="font-display font-bold text-[17px] text-vtext">Salom, {user?.name || "Jasur"} 👋</h1>
      </div>

      <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-3.5">
        <div className="text-center mb-3">
          <div className="font-mono text-[10px] text-muted tracking-widest uppercase">BUGUNGI CHECKIN</div>
        </div>
        <button 
          onClick={() => checkinMutation.mutate()}
          disabled={checkinMutation.isPending}
          className="w-full bg-accent text-bg font-semibold text-[13px] py-3 rounded-xl shadow-[0_0_18px_rgba(232,255,71,0.25)] disabled:opacity-50"
        >
          {checkinMutation.isPending ? "Tasdiqlanmoqda..." : "Zalga keldim 🎯"}
        </button>
      </div>

      <div className="bg-surface border border-border rounded-[13px] p-3.5">
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-[10px] text-muted tracking-widest uppercase">KALORIYA</span>
          <span className="font-mono text-[10px] text-vtext">{caloriesConsumed} / {caloriesGoal} kcal</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/dashboard/food" className="bg-surface border border-border rounded-[13px] p-3.5 flex flex-col items-center justify-center gap-2">
          <span className="text-lg">🥗</span>
          <span className="text-[11px] text-vtext font-medium">Ovqat yozish</span>
        </Link>
        <Link href="/dashboard/profile" className="bg-surface border border-border rounded-[13px] p-3.5 flex flex-col items-center justify-center gap-2">
          <span className="text-lg">📸</span>
          <span className="text-[11px] text-vtext font-medium">Surat qo'shish</span>
        </Link>
      </div>

      <InsightCard 
        title="🤖 AI Tavsiya" 
        body="Kechagi mashqdan so'ng mushaklarda toliqish bo'lishi mumkin. Bugun faqat kardio qilishni tavsiya qilaman." 
      />
    </div>
  );
}