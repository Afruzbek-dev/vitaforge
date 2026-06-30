export default function TopPage() {
  return (
    <div className="animate-fadeIn pb-4">
      <div className="font-mono text-[8px] tracking-[1px] text-muted pt-[4px]">HAFTALIK REYTING</div>
      
      <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-[14px] mt-[8px] flex items-center gap-[10px]">
        <div className="w-[26px] h-[26px] rounded-[8px] bg-[#E8FF47] text-[#080810] flex items-center justify-center font-display font-bold text-[10px] shrink-0">
          #3
        </div>
        <div className="flex-1">
          <div className="text-[12px] font-semibold font-display">Siz</div>
          <div className="text-[10px] text-[#8888a0]">2,340 ball</div>
        </div>
      </div>

      <div className="m-card mt-[9px] flex items-center gap-[10px]">
        <span className="text-[16px]">🥇</span>
        <div className="w-[26px] h-[26px] rounded-[8px] bg-[rgba(232,255,71,0.12)] text-[#E8FF47] flex items-center justify-center font-display font-bold text-[10px] shrink-0">
          NM
        </div>
        <div className="flex-1 text-[12px] font-medium">Nilufar M.</div>
        <span className="font-mono text-[11px] text-muted">3,120</span>
      </div>

      <div className="m-card mt-[9px] flex items-center gap-[10px]">
        <span className="text-[16px]">🥈</span>
        <div className="w-[26px] h-[26px] rounded-[8px] bg-[rgba(107,174,234,0.12)] text-[#6BAEEA] flex items-center justify-center font-display font-bold text-[10px] shrink-0">
          KS
        </div>
        <div className="flex-1 text-[12px] font-medium">Kamola S.</div>
        <span className="font-mono text-[11px] text-muted">2,890</span>
      </div>

      <div className="m-card mt-[9px] flex items-center gap-[10px]">
        <span className="text-[16px]">🥉</span>
        <div className="w-[26px] h-[26px] rounded-[8px] bg-[rgba(232,255,71,0.12)] text-[#E8FF47] flex items-center justify-center font-display font-bold text-[10px] shrink-0">
          JT
        </div>
        <div className="flex-1 text-[12px] font-semibold font-display">Siz</div>
        <span className="font-mono text-[11px] text-[#E8FF47]">2,340</span>
      </div>
    </div>
  );
}
