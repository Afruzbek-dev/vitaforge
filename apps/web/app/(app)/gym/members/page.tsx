"use client";

import { useState } from "react";

const MEMBERS_LIST = [
  { i: "JT", n: "Jasur Toshmatov", plan: "Pro", streak: "🔥 14 kun", score: 2340, status: "ok", statusL: "Faol", joined: "12 fev, 2026" },
  { i: "NM", n: "Nilufar Mirzaeva", plan: "Starter", streak: "🔥 7 kun", score: 1180, status: "ok", statusL: "Faol", joined: "3 mar, 2026" },
  { i: "DR", n: "Doniyor Raxmonov", plan: "Pro", streak: "0 kun", score: 340, status: "risk", statusL: "Risk", joined: "20 yan, 2026" },
  { i: "MA", n: "Mohira Aliyeva", plan: "Scale", streak: "🌱 2 kun", score: 90, status: "new", statusL: "Yangi", joined: "24 iyun, 2026" },
  { i: "SQ", n: "Sevara Qodirova", plan: "Starter", streak: "0 kun", score: 210, status: "risk", statusL: "Risk", joined: "8 fev, 2026" },
  { i: "AB", n: "Aziz Boltayev", plan: "Pro", streak: "0 kun", score: 560, status: "risk", statusL: "Risk", joined: "15 yan, 2026" },
  { i: "BN", n: "Botir Niyozov", plan: "Pro", streak: "🔥 21 kun", score: 1890, status: "ok", statusL: "Faol", joined: "2 dek, 2025" },
];

export default function OwnerMembersPage() {
  const [selectedMember, setSelectedMember] = useState<typeof MEMBERS_LIST[0] | null>(null);

  if (selectedMember) {
    const risky = selectedMember.status === "risk";
    return (
      <div>
        <span 
          className="font-mono text-[11px] text-[#8888a0] cursor-pointer mb-3.5 inline-block hover:text-accent"
          onClick={() => setSelectedMember(null)}
        >
          ← A'zolarga qaytish
        </span>
        <div className="flex justify-between items-center mb-5">
          <div className="flex gap-3.5 items-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-display font-bold text-[17px] shrink-0">
              {selectedMember.i}
            </div>
            <div>
              <div className="font-display font-bold text-xl">{selectedMember.n}</div>
              <div className="text-[#52526a] text-xs mt-0.5">{selectedMember.plan} reja · a'zo bo'lgan: {selectedMember.joined}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="font-body text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer bg-transparent border border-[#2a2a3a] text-[#EEEEE8] hover:bg-[#1a1a26]">
              📩 Xabar yuborish
            </button>
            <button className="font-body text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer bg-accent text-[#080810] hover:opacity-90 border-none">
              📞 Qo'ng'iroq qilish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3.5 mb-5">
          <div className="bg-surface border border-border rounded-xl px-[18px] py-4 border-l-2 border-l-accent">
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">STREAK</div>
            <div className="font-display font-bold text-[22px]">{selectedMember.streak}</div>
          </div>
          <div className="bg-surface border border-border rounded-xl px-[18px] py-4 border-l-2 border-l-accent">
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">BALL</div>
            <div className="font-display font-bold text-[22px]">{selectedMember.score}</div>
          </div>
          <div className={`bg-surface border border-border rounded-xl px-[18px] py-4 border-l-2 ${risky ? 'border-l-[#E24B4A]' : 'border-l-accent'}`}>
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">HOLAT</div>
            <div className="font-display font-bold text-[15px] mt-1">{selectedMember.statusL}</div>
          </div>
          <div className="bg-surface border border-border rounded-xl px-[18px] py-4 border-l-2 border-l-accent">
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">DARAJA</div>
            <div className="font-display font-bold text-[15px] mt-1">👑 5 · Usta</div>
          </div>
        </div>

        {risky && (
          <div className="bg-surface border border-border rounded-xl p-3.5 mb-4 border-l-2 border-l-[#E24B4A]">
            <div className="text-xs font-semibold mb-1">🤖 AI tahlili: churn ehtimoli yuqori (74%)</div>
            <div className="text-[11px] text-[#9999ad] leading-[1.55] mb-2">
              {selectedMember.n} 8 kundan beri checkin qilmagan, oxirgi 2 haftada AI Trener bilan suhbat ham to'xtagan. O'xshash holatlarda shaxsiy xabar 40% holatda qaytarib kelgan.
            </div>
            <span className="font-mono text-[10px] text-accent cursor-pointer tracking-[0.5px] hover:underline">
              🤖 AI orqali shaxsiy xabar yubor →
            </span>
          </div>
        )}

        <div className="grid grid-cols-[1.4fr_1fr] gap-4">
          <div className="bg-surface border border-border rounded-xl p-[18px]">
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-3.5 uppercase flex justify-between items-center">
              FAOLLIK TARIXI
            </div>
            <div className="flex gap-2.5 py-2.5 border-b border-[#15151f] text-xs">
              <div className="w-[7px] h-[7px] rounded-full bg-[#E2807F] mt-1 shrink-0"></div>
              <div>
                <div className="text-[#52526a] text-[10px] font-mono mb-0.5">8 KUN OLDIN</div>
                Oxirgi checkin — keyin faollik to'xtagan
              </div>
            </div>
            <div className="flex gap-2.5 py-2.5 border-b border-[#15151f] text-xs">
              <div className="w-[7px] h-[7px] rounded-full bg-accent mt-1 shrink-0"></div>
              <div>
                <div className="text-[#52526a] text-[10px] font-mono mb-0.5">16 KUN OLDIN</div>
                "30 kunlik temir" challenge'ga qo'shildi
              </div>
            </div>
            <div className="flex gap-2.5 py-2.5 border-b border-[#15151f] text-xs">
              <div className="w-[7px] h-[7px] rounded-full bg-accent mt-1 shrink-0"></div>
              <div>
                <div className="text-[#52526a] text-[10px] font-mono mb-0.5">22 KUN OLDIN</div>
                AI Trener bilan 4 marta suhbat
              </div>
            </div>
            <div className="flex gap-2.5 py-2.5 text-xs border-none">
              <div className="w-[7px] h-[7px] rounded-full bg-accent mt-1 shrink-0"></div>
              <div>
                <div className="text-[#52526a] text-[10px] font-mono mb-0.5 uppercase">{selectedMember.joined}</div>
                Gym'ga a'zo bo'ldi
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-[18px]">
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-3.5 uppercase">
              TO'LOV TARIXI
            </div>
            <div className="flex justify-between items-center py-[11px] border-b border-[#15151f] text-xs">
              <span>14 iyun 2026</span>
              <span className="px-2.5 py-[3px] rounded-full text-[10px] font-mono bg-[#1D9E75]/10 text-[#5DCAA5]">To'landi</span>
            </div>
            <div className="flex justify-between items-center py-[11px] border-b border-[#15151f] text-xs">
              <span>14 may 2026</span>
              <span className="px-2.5 py-[3px] rounded-full text-[10px] font-mono bg-[#1D9E75]/10 text-[#5DCAA5]">To'landi</span>
            </div>
            <div className="flex justify-between items-center py-[11px] text-xs border-none">
              <span>14 apr 2026</span>
              <span className="px-2.5 py-[3px] rounded-full text-[10px] font-mono bg-[#E8C547]/10 text-[#E8C547]">3 kun kechikkan</span>
            </div>
            
            <div className="h-px bg-[#1a1a26] my-3.5"></div>
            
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">
              YUTUQLAR
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              <div className="bg-[#13131c] border border-border rounded-xl p-2.5 text-center">
                <div className="text-2xl mb-1.5">✅</div>
                <div className="text-[9px] font-semibold mb-0.5 leading-tight">Birinchi qadam</div>
              </div>
              <div className="bg-[#13131c] border border-border rounded-xl p-2.5 text-center">
                <div className="text-2xl mb-1.5">🔥</div>
                <div className="text-[9px] font-semibold mb-0.5 leading-tight">7 kunlik olov</div>
              </div>
              <div className="bg-[#13131c] border border-border rounded-xl p-2.5 text-center opacity-40 grayscale">
                <div className="text-2xl mb-1.5">🔒</div>
                <div className="text-[9px] font-semibold mb-0.5 leading-tight">30 kunlik temir</div>
              </div>
              <div className="bg-[#13131c] border border-border rounded-xl p-2.5 text-center opacity-40 grayscale">
                <div className="text-2xl mb-1.5">🔒</div>
                <div className="text-[9px] font-semibold mb-0.5 leading-tight">Reyting yulduzi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="font-display font-bold text-xl">A'zolar</div>
          <div className="text-[#52526a] text-xs mt-0.5">214 ta a'zo · 9 tasi xavf ostida</div>
        </div>
        <button className="font-body text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer border-none bg-accent text-[#080810]">
          + A'zo qo'shish
        </button>
      </div>

      <div className="flex gap-2.5 items-center mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] bg-[#13131c] border border-border rounded-lg px-3.5 py-2 text-xs text-[#8888a0] flex items-center gap-2">
          🔍 Ism, telefon yoki ID bo'yicha qidirish...
        </div>
        <div className="font-mono text-[10px] tracking-[0.5px] px-3 py-1.5 rounded-full border cursor-pointer bg-accent text-[#080810] border-accent font-semibold">
          Barchasi
        </div>
        <div className="font-mono text-[10px] tracking-[0.5px] px-3 py-1.5 rounded-full border cursor-pointer bg-[#13131c] border-border text-[#8888a0] hover:text-white">
          Faol
        </div>
        <div className="font-mono text-[10px] tracking-[0.5px] px-3 py-1.5 rounded-full border cursor-pointer bg-[#13131c] border-border text-[#8888a0] hover:text-white">
          Risk
        </div>
        <div className="font-mono text-[10px] tracking-[0.5px] px-3 py-1.5 rounded-full border cursor-pointer bg-[#13131c] border-border text-[#8888a0] hover:text-white">
          Yangi
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-[18px]">
        <table className="w-full mt-1 text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[#52526a] font-mono text-[10px] tracking-[1px] pb-2.5 border-b border-border">A'ZO</th>
              <th className="text-left text-[#52526a] font-mono text-[10px] tracking-[1px] pb-2.5 border-b border-border">REJA</th>
              <th className="text-left text-[#52526a] font-mono text-[10px] tracking-[1px] pb-2.5 border-b border-border">STREAK</th>
              <th className="text-left text-[#52526a] font-mono text-[10px] tracking-[1px] pb-2.5 border-b border-border">BALL</th>
              <th className="text-left text-[#52526a] font-mono text-[10px] tracking-[1px] pb-2.5 border-b border-border">HOLAT</th>
              <th className="text-left text-[#52526a] font-mono text-[10px] tracking-[1px] pb-2.5 border-b border-border"></th>
            </tr>
          </thead>
          <tbody>
            {MEMBERS_LIST.map((m, idx) => (
              <tr 
                key={idx} 
                className="cursor-pointer hover:text-[#F4F5F0] transition-colors group"
                onClick={() => setSelectedMember(m)}
              >
                <td className="py-2.5 pr-2 border-b border-[#15151f]">
                  <span className="w-[26px] h-[26px] rounded-lg bg-accent/10 text-accent inline-flex items-center justify-center font-display font-bold text-[11px] mr-2.5 shrink-0 align-middle">
                    {m.i}
                  </span>
                  {m.n}
                </td>
                <td className="py-2.5 pr-2 border-b border-[#15151f] text-[#8888a0] group-hover:text-white">
                  {m.plan}
                </td>
                <td className={`py-2.5 pr-2 border-b border-[#15151f] font-mono ${m.streak === "0 kun" ? "text-[#E2807F]" : "group-hover:text-white"}`}>
                  {m.streak}
                </td>
                <td className="py-2.5 pr-2 border-b border-[#15151f] font-mono text-accent">
                  {m.score}
                </td>
                <td className="py-2.5 pr-2 border-b border-[#15151f]">
                  <span className={`px-2.5 py-[3px] rounded-full text-[10px] font-mono ${
                    m.status === 'ok' ? 'bg-[#1D9E75]/10 text-[#5DCAA5]' :
                    m.status === 'risk' ? 'bg-[#E24B4A]/10 text-[#E2807F]' :
                    'bg-[#388EDE]/10 text-[#7BB6E8]'
                  }`}>
                    {m.statusL}
                  </span>
                </td>
                <td className="py-2.5 pr-2 border-b border-[#15151f] text-[#52526a] group-hover:text-white text-right">
                  →
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
