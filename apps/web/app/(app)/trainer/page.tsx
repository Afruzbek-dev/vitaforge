"use client";
import { KpiCard, Panel, Pill, InsightCard } from "@/components/vf";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export default function TrainerToday() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trainer", "today"],
    queryFn: async () => {
      const res = await api.trainer.today();
      return res.data;
    }
  });

  const addSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await api.trainer.addSession();
      return res.data;
    },
    onSuccess: () => {
      toast("Seans qo'shildi!", "success");
      queryClient.invalidateQueries({ queryKey: ["trainer", "today"] });
    },
    onError: () => {
      toast("Xatolik yuz berdi", "error");
    }
  });

  if (isLoading) return <div className="text-vtext">Yuklanmoqda...</div>;
  if (isError || !data) return <div className="text-vred">Xatolik yuz berdi</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Bugun, Coach Aziz 👋</h1>
          <p className="text-muted text-xs mt-1">Dushanba · {data.sessions?.length || 0} seans</p>
        </div>
        <button 
          onClick={() => addSessionMutation.mutate()}
          disabled={addSessionMutation.isPending}
          className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2 disabled:opacity-50"
        >
          {addSessionMutation.isPending ? "Qo'shilmoqda..." : "+ Seans qo'shish"}
        </button>
      </div>

      <InsightCard 
        warn 
        title="🤖 AI Copilot" 
        body="Madina bilan bog'lanish vaqti keldi (3 kun checkin yo'q). Bugun unga dam olish tavsiya etiladi." 
      />

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="BUGUNGI SEANSLAR">
          <div className="space-y-2">
            {data.sessions?.map((s: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-[#15151f] text-xs">
                 <div className="flex gap-4 items-center">
                   <span className="font-mono text-accent">{s.time}</span>
                   <span className="text-vtext">{s.name} · <span className="text-[#8888a0]">{s.workout}</span></span>
                 </div>
                 <Pill variant={s.status as any}>{s.status === 'risk' ? '3 kun yo\'q' : 'keldi'}</Pill>
              </div>
            ))}
            {(!data.sessions || data.sessions.length === 0) && <div className="text-muted text-xs py-2">Seanslar yo'q</div>}
          </div>
        </Panel>

        <div className="space-y-4">
          <KpiCard label="FAOL MIJOZLAR" value={data.activeClients?.toString()} />
          <KpiCard label="O'RTACHA ADHERENCE" value={`${data.avgAdherence}%`} />
        </div>
      </div>
    </div>
  );
}