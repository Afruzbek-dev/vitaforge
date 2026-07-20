"use client";
import { GymService } from "@/lib/services/GymService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { Panel, ProgressBar } from "@/components/features";

export default function Challenge() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: challengeRes, isLoading, isError } = useQuery({ 
    queryKey: ["gym", "challenge"], 
    queryFn: () => GymService.getChallenge() 
  });

  const createMutation = useMutation({
    mutationFn: () => GymService.createChallenge({ title: "Yangi challenge" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym", "challenge"] });
      toast("Yangi challenge muvaffaqiyatli yaratildi", "success");
    },
    onError: () => toast("Xatolik yuz berdi", "error")
  });

  if (isLoading) return <div className="p-4 text-muted">Yuklanmoqda...</div>;
  if (isError) return <div className="p-4 text-red-500">Xatolik yuz berdi</div>;

  const challenge = (challengeRes as any);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Challenge & Gamifikatsiya</h1>
        </div>
        <button 
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="bg-accent text-bg font-semibold text-xs px-4 py-2.5 rounded-[9px] hover:opacity-90 disabled:opacity-50"
        >
          {createMutation.isPending ? "Yaratilmoqda..." : "+ Yangi challenge"}
        </button>
      </div>

      <Panel title="JORIY CHALLENGE">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[14px] font-bold text-vtext">{challenge?.title}</div>
          <div className="font-mono text-[10px] text-muted">{challenge?.days_passed}/{challenge?.total_days} kun</div>
        </div>
        <ProgressBar value={challenge?.progress || 0} />
        <div className="mt-3 text-xs text-[#8888a0]">
          Qatnashuvchilar: <span className="text-accent">{challenge?.participants} a'zo</span>
        </div>
      </Panel>
    </div>
  );
}
