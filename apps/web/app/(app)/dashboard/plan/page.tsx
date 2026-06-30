export default function PlanPage() {
  return (
    <div className="animate-fadeIn pb-4">
      <div className="flex justify-between items-center pt-[4px] pb-[8px]">
        <div className="font-mono text-[8px] tracking-[1px] text-muted m-0">3-HAFTA PLANI</div>
        <span className="text-[11px] text-[#E8FF47]">🔄</span>
      </div>

      <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-[14px]">
        <div className="text-[10px] text-[#E8FF47] font-mono mb-[4px]">BUGUN · DUSHANBA</div>
        <div className="font-semibold text-[13px] font-display">💪 Kuch mashqi</div>
        <div className="text-[10px] text-[#8888a0]">45 daqiqa · 6 mashq</div>
      </div>

      <div className="m-card mt-[9px] flex justify-between items-center">
        <div>
          <div className="text-[12px] font-medium">Squat</div>
          <div className="text-[10px] text-muted">Dam: 60s</div>
        </div>
        <span className="font-mono text-[12px] text-[#E8FF47]">4×12</span>
      </div>

      <div className="m-card mt-[9px] flex justify-between items-center">
        <div>
          <div className="text-[12px] font-medium">Bench press</div>
          <div className="text-[10px] text-muted">Dam: 90s</div>
        </div>
        <span className="font-mono text-[12px] text-[#E8FF47]">4×10</span>
      </div>

      <div className="m-card mt-[9px] flex justify-between items-center opacity-50">
        <div>
          <div className="text-[12px] font-medium">Deadlift</div>
          <div className="text-[10px] text-muted">Dam: 90s</div>
        </div>
        <span className="font-mono text-[12px]">3×8</span>
      </div>

      <button className="w-full bg-[#E8FF47] text-[#080810] font-body font-semibold text-[13px] py-[13px] rounded-[12px] shadow-[0_0_18px_rgba(232,255,71,0.25)] mt-[6px]">
        ✓ Mashqni tugatdim
      </button>
    </div>
  );
}
