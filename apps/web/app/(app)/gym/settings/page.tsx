"use client";
import { GymService } from "@/lib/services/GymService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Panel } from "@/components/vf";
import { useToast } from "@/components/ui/toast";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settingsRes, isLoading, isError } = useQuery({ 
    queryKey: ["gym", "settings"], 
    queryFn: () => GymService.getSettings() 
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => GymService.updateSettings({ ...(settingsRes as any), ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym", "settings"] });
      toast("Sozlamalar saqlandi", "success");
    },
    onError: () => toast("Xatolik yuz berdi", "error")
  });

  if (isLoading) return <div className="p-4 text-muted">Yuklanmoqda...</div>;
  if (isError) return <div className="p-4 text-red-500">Xatolik yuz berdi</div>;

  const settings = (settingsRes as any);

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Sozlamalar</h1>
      
      <Panel title="GYM PROFILI">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-muted">Gym Nomi</span>
             <div className="flex items-center gap-4">
               <span className="text-xs text-vtext font-medium">{settings?.name}</span>
               <span 
                 onClick={() => toast("Nomni tahrirlash formasi ochiladi", "success")}
                 className="text-[10px] text-accent cursor-pointer"
               >
                 Tahrirlash
               </span>
             </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-muted">Manzil</span>
             <div className="flex items-center gap-4">
               <span className="text-xs text-vtext font-medium">{settings?.location}</span>
               <span 
                 onClick={() => toast("Manzilni tahrirlash formasi ochiladi", "success")}
                 className="text-[10px] text-accent cursor-pointer"
               >
                 Tahrirlash
               </span>
             </div>
          </div>
        </div>
      </Panel>

      <Panel title="BILDIRISHNOMALAR">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-vtext">Churn xavfi haqida ogohlantirish (AI)</span>
             <div 
               onClick={() => updateMutation.mutate({ churn_alerts: !settings?.churn_alerts })}
               className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${settings?.churn_alerts ? 'bg-accent' : 'bg-[#2a2a3a]'}`}
             >
               <div className={`w-4 h-4 rounded-full bg-bg absolute top-0.5 transition-transform ${settings?.churn_alerts ? 'right-0.5' : 'left-0.5'}`}></div>
             </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-vtext">Haftalik hisobot (Telegram)</span>
             <div 
               onClick={() => updateMutation.mutate({ weekly_reports: !settings?.weekly_reports })}
               className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${settings?.weekly_reports ? 'bg-accent' : 'bg-[#2a2a3a]'}`}
             >
               <div className={`w-4 h-4 rounded-full bg-bg absolute top-0.5 transition-transform ${settings?.weekly_reports ? 'right-0.5' : 'left-0.5'}`}></div>
             </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
