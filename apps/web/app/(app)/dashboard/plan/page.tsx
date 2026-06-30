"use client";
import { InsightCard } from "@/components/vf";

export default function Plan() {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="font-display font-bold text-[17px] text-vtext">Mashq rejasi</h1>
        <p className="text-xs text-muted mt-1">3-hafta · Kuch dasturi</p>
      </div>
      
      <div className="flex justify-between items-center px-2 py-3 bg-surface rounded-[13px] mb-4">
        {['D', 'S', 'C', 'P', 'J', 'S', 'Y'].map((day, i) => (
          <div key={i} className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-mono ${i === 3 ? 'ring-2 ring-[rgba(232,255,71,0.4)] text-accent' : i < 3 ? 'bg-accent text-bg' : 'text-muted'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {[
          { name: "Squat", sets: "4 to'plam × 12 marta" },
          { name: "Bench press", sets: "4 to'plam × 10 marta" },
          { name: "Deadlift", sets: "3 to'plam × 8 marta" }
        ].map((ex, i) => (
          <div key={i} className="bg-surface border border-border rounded-[13px] p-3.5">
            <h3 className="text-vtext font-semibold text-[13px] mb-1">{ex.name}</h3>
            <p className="text-xs text-[#8888a0]">{ex.sets}</p>
          </div>
        ))}
      </div>

      <button className="w-full bg-accent text-bg font-semibold text-[13px] py-3 rounded-xl shadow-[0_0_18px_rgba(232,255,71,0.25)] mt-4">
        Mashqni tugatish ✅
      </button>
    </div>
  );
}