"use client";
import { Panel } from "@/components/vf";

export default function TrainerSchedule() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Jadval</h1>
          <p className="text-muted text-xs mt-1">Bu hafta</p>
        </div>
        <button className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2">
          + Bo'sh vaqt qo'shish
        </button>
      </div>
      <Panel>
         <div className="space-y-2">
            {[
              { day: "Dushanba", sessions: 6 },
              { day: "Seshanba", sessions: 8, active: true },
              { day: "Chorshanba", sessions: 5 },
              { day: "Payshanba", sessions: 7 },
            ].map((d, i) => (
              <div key={i} className={`flex justify-between items-center py-3 border-b border-[#15151f] text-xs ${d.active ? 'text-accent font-medium bg-[rgba(232,255,71,0.04)] px-3 -mx-3 rounded-lg border-transparent' : 'text-vtext'}`}>
                 <span>{d.day}</span>
                 <span className="font-mono text-muted">{d.sessions} seans</span>
              </div>
            ))}
         </div>
      </Panel>
    </div>
  );
}