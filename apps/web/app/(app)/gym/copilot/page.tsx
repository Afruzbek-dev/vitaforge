"use client";
import { Panel, InsightCard } from "@/components/vf";

export default function Copilot() {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-2">🤖 AI Copilot</h1>
      
      <div className="grid grid-cols-[1.3fr_1fr] gap-4 flex-1 min-h-0">
        <Panel className="flex flex-col h-[600px] p-0 overflow-hidden">
          <div className="p-4 border-b border-border bg-[#0d0d16] z-10 flex justify-between items-center">
            <span className="font-bold text-[13px] text-vtext">Copilot Chat</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex flex-col self-start max-w-[80%] bg-surface2 border border-border rounded-[12px_12px_12px_4px] p-3 text-[12px] text-vtext">
              Salom, Botir! Men VitaForge AI. Gymingiz bo'yicha qanday ma'lumot kerak?
            </div>
            <div className="flex flex-col self-end max-w-[80%] ml-auto bg-accent text-bg font-medium rounded-[12px_12px_4px_12px] p-3 text-[12px]">
              Kechagi kun bo'yicha kimlar xavf ostida?
            </div>
            <div className="flex flex-col self-start max-w-[80%] bg-surface2 border border-border rounded-[12px_12px_12px_4px] p-3 text-[12px] text-vtext">
              Oxirgi 7 kunda 3 ta a'zo umuman kelmadi: Doniyor, Sevara, Aziz. Ularga avtomatik SMS yuboraymi?
            </div>
          </div>
          <div className="p-3 border-t border-border bg-[#0d0d16]">
             <div className="flex gap-2">
                <input type="text" placeholder="Xabar yozing..." className="flex-1 bg-surface2 border border-border rounded-[9px] px-3.5 py-2.5 text-xs text-vtext outline-none" />
                <button className="bg-accent text-bg px-4 rounded-[9px] font-semibold">Yuborish</button>
             </div>
          </div>
        </Panel>

        <div className="space-y-4 overflow-y-auto h-[600px] pr-1">
          <InsightCard warn title="Churn Xavfi (3)" body="Doniyor, Sevara, Aziz oxirgi 7 kunda kelmadi. Ular 'Pro' tarifida, daromad yo'qotilishi xavfi bor." action="XABAR YUBORISH" />
          <InsightCard title="Seshanba passivligi" body="Odatda seshanba kunlari tashriflar 20% ga kamayadi. Shu kuni maxsus mini-musobaqa o'tkazishni tavsiya qilaman." action="KO'RISH" />
          <InsightCard title="Pro tarifiga o'tish" body="5 ta Starter a'zosi deyarli har kuni kelmoqda. Ularga Pro tarifni taklif qilsangiz, konversiya ehtimoli yuqori." action="RO'YXATNI KO'RISH" />
        </div>
      </div>
    </div>
  );
}