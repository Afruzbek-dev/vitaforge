"use client";
import { CopilotService } from "@/lib/services/CopilotService";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Panel, InsightCard } from "@/components/features";
import { useToast } from "@/components/ui/toast";

export default function Copilot() {
  const [msg, setMsg] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: msgsRes, isLoading, isError } = useQuery({ 
    queryKey: ["gym", "copilotMessages"], 
    queryFn: () => CopilotService.getMessages("gym") 
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => CopilotService.sendMessage("gym", text),
    onSuccess: (newMsg: any) => {
      queryClient.setQueryData(["gym", "copilotMessages"], (old: any) => {
        return { ...old, data: [...((old as any) || []), newMsg] };
      });
      setMsg("");
    },
    onError: () => toast("Xabar yuborishda xatolik", "error")
  });

  if (isLoading) return <div className="p-4 text-muted">Yuklanmoqda...</div>;
  if (isError) return <div className="p-4 text-red-500">Xatolik yuz berdi</div>;

  const messages = (msgsRes as any) || [];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-2">🤖 AI Copilot</h1>
      
      <div className="grid grid-cols-[1.3fr_1fr] gap-4 flex-1 min-h-0">
        <Panel className="flex flex-col h-[600px] p-0 overflow-hidden">
          <div className="p-4 border-b border-border bg-[#0d0d16] z-10 flex justify-between items-center">
            <span className="font-bold text-[13px] text-vtext">Copilot Chat</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
            {messages.map((m: { id: string; sender: "user" | "ai"; text: string }) => (
              m.sender === 'ai' ? (
                <div key={m.id} className="flex flex-col self-start max-w-[80%] bg-surface2 border border-border rounded-[12px_12px_12px_4px] p-3 text-[12px] text-vtext">
                  {m.text}
                </div>
              ) : (
                <div key={m.id} className="flex flex-col self-end max-w-[80%] ml-auto bg-accent text-bg font-medium rounded-[12px_12px_4px_12px] p-3 text-[12px]">
                  {m.text}
                </div>
              )
            ))}
          </div>
          <div className="p-3 border-t border-border bg-[#0d0d16]">
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && msg.trim()) sendMutation.mutate(msg); }}
                  placeholder="Xabar yozing..." 
                  className="flex-1 bg-surface2 border border-border rounded-[9px] px-3.5 py-2.5 text-xs text-vtext outline-none" 
                />
                <button 
                  onClick={() => msg.trim() && sendMutation.mutate(msg)}
                  disabled={sendMutation.isPending || !msg.trim()}
                  className="bg-accent text-bg px-4 rounded-[9px] font-semibold disabled:opacity-50"
                >
                  {sendMutation.isPending ? "..." : "Yuborish"}
                </button>
             </div>
          </div>
        </Panel>

        <div className="space-y-4 overflow-y-auto h-[600px] pr-1">
          <InsightCard warn title="Churn Xavfi (3)" body="Doniyor, Sevara, Aziz oxirgi 7 kunda kelmadi. Ular 'Pro' tarifida, daromad yo'qotilishi xavfi bor." action="XABAR YUBORISH" onAction={() => toast("Xabar yuborildi", "success")} />
          <InsightCard title="Seshanba passivligi" body="Odatda seshanba kunlari tashriflar 20% ga kamayadi. Shu kuni maxsus mini-musobaqa o'tkazishni tavsiya qilaman." action="KO'RISH" onAction={() => toast("Musobaqa yaratildi", "success")} />
          <InsightCard title="Pro tarifiga o'tish" body="5 ta Starter a'zosi deyarli har kuni kelmoqda. Ularga Pro tarifni taklif qilsangiz, konversiya ehtimoli yuqori." action="RO'YXATNI KO'RISH" onAction={() => toast("Ro'yxat ochildi", "success")} />
        </div>
      </div>
    </div>
  );
}
