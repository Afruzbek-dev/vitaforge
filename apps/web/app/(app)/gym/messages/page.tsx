"use client";
import { GymService } from "@/lib/services/GymService";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Panel } from "@/components/features";
import { useToast } from "@/components/ui/toast";

export default function Messages() {
  const [msg, setMsg] = useState("");
  const { toast } = useToast();

  const sendMutation = useMutation({
    mutationFn: () => GymService.sendMessage({ text: msg }),
    onSuccess: () => {
      toast("Xabar muvaffaqiyatli yuborildi", "success");
      setMsg("");
    },
    onError: () => toast("Xatolik yuz berdi", "error")
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Xabar yuborish</h1>
        </div>
        <button 
          onClick={() => toast("Yangi kampaniya formasi ochildi", "success")}
          className="bg-accent text-bg font-semibold text-xs px-4 py-2.5 rounded-[9px] hover:opacity-90"
        >
          + Yangi kampaniya
        </button>
      </div>
      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="XABAR YOZISH">
           <textarea 
             value={msg}
             onChange={e => setMsg(e.target.value)}
             className="w-full h-32 bg-surface2 border border-border rounded-xl p-3 text-xs text-vtext outline-none resize-none mb-3" 
             placeholder="Xabar matni..."
           ></textarea>
           <div className="flex justify-between">
              <button 
                onClick={() => setMsg("Hurmatli mijoz, sizni bugungi mashg'ulotga kutib qolamiz!")}
                className="border border-[#2a2a3a] text-vtext text-xs px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-surface2"
              >
                🤖 AI Yordami
              </button>
              <button 
                onClick={() => msg.trim() && sendMutation.mutate()}
                disabled={sendMutation.isPending || !msg.trim()}
                className="bg-accent text-bg font-semibold text-xs px-5 py-2 rounded-lg disabled:opacity-50"
              >
                {sendMutation.isPending ? "Yuborilmoqda..." : "Yuborish"}
              </button>
           </div>
        </Panel>
      </div>
    </div>
  );
}