"use client";
import { KpiCard, Panel, Pill, InsightCard } from "@/components/vf";

export default function TrainerToday() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Bugun, Coach Aziz 👋</h1>
          <p className="text-muted text-xs mt-1">Dushanba · 6 seans, 2 ta qoldi</p>
        </div>
        <button className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2">
          + Seans qo'shish
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
            {[
              { time: "14:00", name: "Jasur", workout: "Kuch", status: "ok" },
              { time: "15:30", name: "Madina", workout: "Cardio", status: "risk" },
              { time: "17:00", name: "Otabek", workout: "Yelka", status: "ok" },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-[#15151f] text-xs">
                 <div className="flex gap-4 items-center">
                   <span className="font-mono text-accent">{s.time}</span>
                   <span className="text-vtext">{s.name} · <span className="text-[#8888a0]">{s.workout}</span></span>
                 </div>
                 <Pill variant={s.status as any}>{s.status === 'risk' ? '3 kun yo\'q' : 'keldi'}</Pill>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <KpiCard label="FAOL MIJOZLAR" value="22" />
          <KpiCard label="O'RTACHA ADHERENCE" value="81%" />
        </div>
      </div>
    </div>
  );
}