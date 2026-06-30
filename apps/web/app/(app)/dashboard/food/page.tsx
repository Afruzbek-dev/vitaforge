export default function FoodPage() {
  return (
    <div className="animate-fadeIn pb-4">
      <div className="font-mono text-[8px] tracking-[1px] text-muted pt-[4px]">OVQAT QO'SHISH</div>
      
      <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-[14px] mt-[8px]">
        <div className="text-[10px] text-[#E8FF47] font-mono mb-[8px]">🤖 NIMA YEDINGIZ?</div>
        <div className="bg-[#13131c] border border-[#2a2a3a] rounded-[10px] py-[10px] px-[12px] text-[12px] text-[#c8c8d8]">
          "bir piyola osh va salat"
        </div>
      </div>

      <div className="bg-surface border border-[rgba(232,255,71,0.3)] rounded-[13px] p-[14px] mt-[9px]">
        <div className="flex justify-between items-center mb-[6px]">
          <span className="text-[13px] font-semibold font-display">O'zbek oshi</span>
          <span className="font-mono text-[12px] text-[#E8FF47]">540 kcal</span>
        </div>
        <div className="text-[10px] text-muted">≈ 300g porsiya</div>
      </div>

      <div className="m-card mt-[9px]">
        <div className="flex justify-between items-center">
          <span className="text-[13px] font-semibold font-display">Ko'k salat</span>
          <span className="font-mono text-[12px] text-[#E8FF47]">45 kcal</span>
        </div>
      </div>

      <button className="w-full bg-[#E8FF47] text-[#080810] font-body font-semibold text-[13px] py-[13px] rounded-[12px] shadow-[0_0_18px_rgba(232,255,71,0.25)] mt-[6px]">
        + Qo'shish (585 kcal)
      </button>
    </div>
  );
}
