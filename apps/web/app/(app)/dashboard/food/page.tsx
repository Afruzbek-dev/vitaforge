"use client";
export default function Food() {
  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[17px] text-vtext">Ovqat kundaligi</h1>
      <div className="bg-surface border border-border rounded-[13px] p-3.5">
         <input type="text" placeholder="Nima yedingiz?" className="w-full bg-surface2 border border-border rounded-xl p-3 text-xs text-vtext outline-none" />
      </div>
      <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-3.5 flex justify-between items-center">
         <div>
            <div className="text-[13px] text-vtext font-semibold">O'zbek oshi</div>
            <div className="text-[10px] font-mono text-muted">540 kcal</div>
         </div>
         <button className="w-8 h-8 rounded-lg bg-accent text-bg flex items-center justify-center font-bold">+</button>
      </div>
    </div>
  );
}