"use client";
import { useState } from "react";
import { Avatar, Panel } from "@/components/vf";

export default function Profile() {
  const [tab, setTab] = useState("UMUMIY");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
         <Avatar initials="JT" size="lg" />
         <div>
            <h1 className="font-display font-bold text-[17px] text-vtext">Jasur Toshmatov</h1>
            <div className="mt-1 inline-flex bg-[rgba(232,255,71,0.12)] px-2.5 py-0.5 rounded-full text-[10px] font-mono text-accent">
               👑 DARAJA 4 · Professional
            </div>
         </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
         {['UMUMIY', 'TO\'LOVLAR', 'ANALITIKA', 'BILDIRISHNOMA'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[9px] font-mono tracking-widest ${tab === t ? 'bg-accent text-bg font-bold' : 'bg-surface2 border border-border text-[#8888a0]'}`}>
               {t}
            </button>
         ))}
      </div>

      {tab === 'UMUMIY' && (
        <div className="space-y-4">
          <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-4 text-center">
             <div className="text-2xl mb-1">🔥</div>
             <div className="font-display font-bold text-[24px] text-vtext mb-1">14 kun</div>
             <div className="font-mono text-[10px] text-muted">Rekord: 21 kun</div>
          </div>
        </div>
      )}
      
      {tab === 'TO\'LOVLAR' && (
        <Panel title="TO'LOV TARIXI">
          <div className="text-xs text-muted">Hali to'lovlar mavjud emas</div>
        </Panel>
      )}
    </div>
  );
}