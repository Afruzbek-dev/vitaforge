"use client";
import { CopilotService } from "@/lib/services/CopilotService";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";

export default function Chat() {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading, isError } = useQuery({
    queryKey: ["chatMessages"],
    queryFn: () => CopilotService.getMessages("gym") // assuming this is the endpoint
  });

  const sendMessageMutation = useMutation({
    mutationFn: (msg: string) => CopilotService.sendMessage("gym", msg),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
    },
    onError: () => {
      toast("Xabar yuborishda xatolik yuz berdi.", "error");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  const msgs = (messages as any)?.items || messages || [];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -mx-4 px-4 pt-2">
       <h1 className="font-display font-bold text-[17px] text-vtext mb-4">🤖 AI Chat</h1>
       
       <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {isLoading && <div className="text-center text-muted text-xs mt-4">Yuklanmoqda...</div>}
          {isError && <div className="text-center text-vred text-xs mt-4">Xatolik yuz berdi.</div>}
          
          {!isLoading && !isError && msgs.map((m: any, i: number) => (
             <div 
               key={i} 
               className={`max-w-[85%] p-3 text-[12px] text-vtext ${m.role === 'user' ? 'self-end bg-accent/10 border border-accent/20 rounded-[12px_12px_4px_12px] ml-auto' : 'self-start bg-surface border border-border rounded-[12px_12px_12px_4px]'}`}
             >
                {m.content || m.message}
             </div>
          ))}
       </div>
       
       <form onSubmit={handleSubmit} className="pt-3 border-t border-[#1a1a26] flex gap-2">
          <input 
            type="text" 
            placeholder="Savol yozing..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sendMessageMutation.isPending}
            className="flex-1 bg-surface border border-border rounded-xl px-3 text-xs text-vtext outline-none disabled:opacity-50" 
          />
          <button 
            type="submit" 
            disabled={sendMessageMutation.isPending || !message.trim()}
            className="bg-accent text-bg w-10 h-10 rounded-xl flex items-center justify-center font-bold disabled:opacity-50"
          >
            ↑
          </button>
       </form>
    </div>
  );
}