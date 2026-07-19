"use client";
import { TrainerService } from "@/lib/services/TrainerService";
import { Panel } from "@/components/vf";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";

export default function TrainerSchedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trainer", "schedule"],
    queryFn: async () => {
      const res = await TrainerService.getSchedule();
      return res;
    }
  });

  const addSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await TrainerService.addSession();
      return res;
    },
    onSuccess: () => {
      toast("Vaqt qo'shildi!", "success");
      queryClient.invalidateQueries({ queryKey: ["trainer", "schedule"] });
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
          <h1 className="font-display font-bold text-[20px] text-vtext">Jadval</h1>
          <p className="text-muted text-xs mt-1">Bu hafta</p>
        </div>
        <button 
          onClick={() => addSessionMutation.mutate()}
          disabled={addSessionMutation.isPending}
          className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2 disabled:opacity-50"
        >
          {addSessionMutation.isPending ? "Qo'shilmoqda..." : "+ Bo'sh vaqt qo'shish"}
        </button>
      </div>
      <Panel>
         <div className="space-y-2">
            {data.map((d: any, i: number) => (
              <div key={i} className={`flex justify-between items-center py-3 border-b border-[#15151f] text-xs ${d.active ? 'text-accent font-medium bg-[rgba(232,255,71,0.04)] px-3 -mx-3 rounded-lg border-transparent' : 'text-vtext'}`}>
                 <span>{d.day}</span>
                 <span className="font-mono text-muted">{d.sessions} seans</span>
              </div>
            ))}
            {data.length === 0 && <div className="text-muted text-xs py-2">Jadval bo'sh</div>}
         </div>
      </Panel>
    </div>
  );
}