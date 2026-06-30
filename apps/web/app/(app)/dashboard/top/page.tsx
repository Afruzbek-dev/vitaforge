"use client";
export default function Top() {
  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[17px] text-vtext">Haftalik reyting</h1>
      <div className="bg-surface border border-border rounded-[13px] overflow-hidden">
        {[
          { name: "Nilufar Mirzaeva", pos: "🥇", score: 3120 },
          { name: "Kamola Voxidova", pos: "🥈", score: 2890 },
          { name: "Siz", pos: "🥉", score: 2340, active: true },
          { name: "Doniyor Raxmonov", pos: "4", score: 1950 }
        ].map((m, i) => (
          <div key={i} className={`flex justify-between items-center p-3.5 border-b border-[#15151f] ${m.active ? 'bg-[rgba(232,255,71,0.04)]' : ''}`}>
             <div className="flex items-center gap-3">
               <span className="w-5 text-center text-sm">{m.pos}</span>
               <span className={`text-[13px] ${m.active ? 'text-accent font-semibold' : 'text-vtext'}`}>{m.name}</span>
             </div>
             <span className="font-mono text-[10px] text-muted">{m.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}