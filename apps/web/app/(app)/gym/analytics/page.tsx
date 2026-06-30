"use client";

export default function OwnerAnalyticsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="font-display font-bold text-xl">Analytics</div>
          <div className="text-[#52526a] text-xs mt-0.5">FitZone Gym · Oxirgi 6 oy</div>
        </div>
        <button className="font-body text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer bg-transparent border border-[#2a2a3a] text-[#EEEEE8] hover:bg-[#1a1a26]">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <div className="bg-surface border border-border rounded-xl px-[18px] py-4 border-l-2 border-l-accent">
          <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">MRR</div>
          <div className="font-display font-bold text-[22px]">$6,240</div>
          <div className="text-[11px] text-[#1D9E75] mt-1 font-mono">↑ 9.3%</div>
        </div>
        <div className="bg-surface border border-border rounded-xl px-[18px] py-4 border-l-2 border-l-accent">
          <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">O'RTACHA LTV</div>
          <div className="font-display font-bold text-[22px]">$184</div>
          <div className="text-[11px] text-[#1D9E75] mt-1 font-mono">↑ 4.1%</div>
        </div>
        <div className="bg-surface border border-border rounded-xl px-[18px] py-4 border-l-2 border-l-[#E24B4A]">
          <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">CHURN (OYLIK)</div>
          <div className="font-display font-bold text-[22px]">4.1%</div>
          <div className="text-[11px] text-[#E24B4A] mt-1 font-mono">↑ 0.6%</div>
        </div>
        <div className="bg-surface border border-border rounded-xl px-[18px] py-4 border-l-2 border-l-accent">
          <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">AI SARFI</div>
          <div className="font-display font-bold text-[22px]">$31</div>
          <div className="text-[11px] text-[#1D9E75] mt-1 font-mono">Bu oy</div>
        </div>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="bg-surface border border-border rounded-xl p-[18px]">
          <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-3.5 uppercase">
            DAROMAD DINAMIKASI · 6 OY
          </div>
          <div className="flex items-end gap-2 h-[110px] mb-2">
            <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "40%" }}></div>
            <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "52%" }}></div>
            <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "48%" }}></div>
            <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "60%" }}></div>
            <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "68%" }}></div>
            <div className="flex-1 bg-accent rounded-t-[3px]" style={{ height: "88%" }}></div>
          </div>
          <div className="flex gap-2">
            <span className="flex-1 text-center text-[9px] text-[#52526a]">Yan</span>
            <span className="flex-1 text-center text-[9px] text-[#52526a]">Fev</span>
            <span className="flex-1 text-center text-[9px] text-[#52526a]">Mar</span>
            <span className="flex-1 text-center text-[9px] text-[#52526a]">Apr</span>
            <span className="flex-1 text-center text-[9px] text-[#52526a]">May</span>
            <span className="flex-1 text-center text-[9px] text-[#52526a]">Iyun</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-[18px]">
          <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-3.5 uppercase">
            A'ZOLAR O'SISHI · 6 OY
          </div>
          <div className="flex items-end gap-2 h-[110px] mb-2">
            <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "50%" }}></div>
            <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "55%" }}></div>
            <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "62%" }}></div>
            <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "70%" }}></div>
            <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "80%" }}></div>
            <div className="flex-1 bg-accent rounded-t-[3px]" style={{ height: "95%" }}></div>
          </div>
          <div className="flex gap-2">
            <span className="flex-1 text-center text-[9px] text-[#52526a]">Yan</span>
            <span className="flex-1 text-center text-[9px] text-[#52526a]">Fev</span>
            <span className="flex-1 text-center text-[9px] text-[#52526a]">Mar</span>
            <span className="flex-1 text-center text-[9px] text-[#52526a]">Apr</span>
            <span className="flex-1 text-center text-[9px] text-[#52526a]">May</span>
            <span className="flex-1 text-center text-[9px] text-[#52526a]">Iyun</span>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-[18px] mt-4">
        <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-3.5 uppercase">
          FAOLLIK TAQSIMOTI
        </div>
        <div className="flex items-center justify-between py-[9px] border-b border-[#1a1a26] text-xs">
          <div className="flex items-center gap-2 cursor-default">🏠 Bosh sahifa ochilishi</div>
          <span className="font-mono text-accent">38%</span>
        </div>
        <div className="flex items-center justify-between py-[9px] border-b border-[#1a1a26] text-xs">
          <div className="flex items-center gap-2 cursor-default">💪 Plan bajarilishi</div>
          <span className="font-mono text-accent">27%</span>
        </div>
        <div className="flex items-center justify-between py-[9px] border-b border-[#1a1a26] text-xs">
          <div className="flex items-center gap-2 cursor-default">🥗 Ovqat yozish</div>
          <span className="font-mono text-accent">21%</span>
        </div>
        <div className="flex items-center justify-between py-[9px] text-xs border-none">
          <div className="flex items-center gap-2 cursor-default">🤖 AI Trener bilan suhbat</div>
          <span className="font-mono text-accent">14%</span>
        </div>
      </div>
    </div>
  );
}
