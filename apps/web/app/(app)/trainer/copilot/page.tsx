"use client";
import { CopilotService } from "@/lib/services/CopilotService";
import { Panel, InsightCard } from "@/components/features";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

export default function TrainerCopilot() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trainer", "copilot"],
    queryFn: async () => {
      const res = await CopilotService.getMessages("trainer");
      return res;
    }
  });

  const sendMsgMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await CopilotService.sendMessage("trainer", message);
      return res;
    },
    onSuccess: () => {
      toast("Xabar yuborildi!", "success");
      setMsg("");
      queryClient.invalidateQueries({ queryKey: ["trainer", "copilot"] });
    },
    onError: () => {
      toast("Xatolik yuz berdi", "error");
    }
  });

  if (isLoading) return <div className="text-vtext p-4">Yuklanmoqda...</div>;
  if (isError || !data) return <div className="text-vred p-4">Xatolik yuz berdi</div>;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-2">🤖 AI Copilot</h1>
      <div className="grid grid-cols-[1.3fr_1fr] gap-4 flex-1 min-h-0">
        <Panel className="flex flex-col h-[600px] p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {data.messages?.map((m: any, i: number) => (
              <div key={i} className={`flex flex-col max-w-[80%] border border-border p-3 text-[12px] text-vtext ${m.sender === 'ai' ? 'self-start bg-surface2 rounded-[12px_12px_12px_4px]' : 'self-end bg-accent/10 rounded-[12px_12px_4px_12px]'}`}>
                {m.text}
              </div>
            ))}
            {(!data.messages || data.messages.length === 0) && <div className="text-muted text-xs">Xabarlar yo'q</div>}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if(msg) sendMsgMutation.mutate(msg); }} className="p-3 border-t border-border bg-[#0d0d16] flex gap-2">
            <input 
              type="text" 
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              disabled={sendMsgMutation.isPending}
              placeholder="Javob yozing..." 
              className="flex-1 bg-surface2 border border-border rounded-[9px] px-3.5 py-2.5 text-xs text-vtext outline-none disabled:opacity-50" 
            />
            <button disabled={!msg || sendMsgMutation.isPending} type="submit" className="px-4 py-2 bg-surface2 border border-border text-vtext text-xs rounded-[9px] disabled:opacity-50 hover:bg-white/5 transition-colors">
               {sendMsgMutation.isPending ? "..." : "Yuborish"}
            </button>
          </form>
        </Panel>
        <div className="space-y-4 overflow-y-auto h-[600px] pr-1">
          <InsightCard warn title="Mijoz faolligi pasaydi" body="Madina 30% adherence'da." action="KO'RISH" />
        </div>
      </div>
    </div>
  );
}