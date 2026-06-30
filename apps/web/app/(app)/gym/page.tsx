"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnerDashboardPage() {
  const router = useRouter();

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="font-display font-bold text-xl">Xush kelibsiz, Botir 👋</div>
          <div className="text-[#52526a] text-xs mt-0.5">FitZone Gym · Yunusobod, Toshkent</div>
        </div>
        <div className="bg-accent/10 border border-accent/30 text-accent text-[11px] px-3 py-1 rounded-full font-mono">
          PRO TARIF
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <div className="bg-surface border border-border rounded-xl px-[18px] py-4 border-l-2 border-l-accent">
          <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">RETENTION (30 KUN)</div>
          <div className="font-display font-bold text-[22px]">73%</div>
          <div className="text-[11px] text-[#1D9E75] mt-1 font-mono">↑ 12% o'tgan oydan</div>
        </div>
        <div className="bg-surface border border-border rounded-xl px-[18px] py-4 border-l-2 border-l-accent">
          <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">JAMI A'ZOLAR</div>
          <div className="font-display font-bold text-[22px]">214</div>
          <div className="text-[11px] text-[#1D9E75] mt-1 font-mono">+18 yangi</div>
        </div>
        <div className="bg-surface border border-border rounded-xl px-[18px] py-4 border-l-2 border-l-[#E24B4A]">
          <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">CHURN RISK</div>
          <div className="font-display font-bold text-[22px]">9</div>
          <div className="text-[11px] text-[#E24B4A] mt-1 font-mono">↓ kuzatuv kerak</div>
        </div>
        <div className="bg-surface border border-border rounded-xl px-[18px] py-4 border-l-2 border-l-accent">
          <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">FAOL BUGUN</div>
          <div className="font-display font-bold text-[22px]">87</div>
          <div className="text-[11px] text-[#1D9E75] mt-1 font-mono">41% DAU</div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-3.5 mb-4 border-l-2 border-l-[#E24B4A]">
        <div className="text-xs font-semibold mb-1">🤖 AI Copilot: 3 ta a'zo bugun ayniqsa xavfli holatda</div>
        <div className="text-[11px] text-[#9999ad] leading-[1.55] mb-2">
          Doniyor, Sevara va Aziz — barchasi 5+ kun checkin qilmagan va to'lov muddati yaqinlashmoqda. Birgalikda churn ehtimoli ~68%.
        </div>
        <Link href="/gym/copilot" className="font-mono text-[10px] text-accent cursor-pointer tracking-[0.5px] hover:underline">
          Copilot'da batafsil ko'rish →
        </Link>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <div>
          <div className="bg-surface border border-border rounded-xl p-[18px] mb-4">
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-3.5 flex justify-between items-center uppercase">
              HAFTALIK FAOLLIK
            </div>
            <div className="flex items-end gap-2 h-[110px] mb-2">
              <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "58%" }}></div>
              <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "72%" }}></div>
              <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "65%" }}></div>
              <div className="flex-1 bg-accent rounded-t-[3px]" style={{ height: "88%" }}></div>
              <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "80%" }}></div>
              <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "75%" }}></div>
              <div className="flex-1 bg-[#1a1a26] rounded-t-[3px]" style={{ height: "70%" }}></div>
            </div>
            <div className="flex gap-2">
              <span className="flex-1 text-center text-[9px] text-[#52526a]">Du</span>
              <span className="flex-1 text-center text-[9px] text-[#52526a]">Se</span>
              <span className="flex-1 text-center text-[9px] text-[#52526a]">Ch</span>
              <span className="flex-1 text-center text-[9px] text-[#52526a]">Pa</span>
              <span className="flex-1 text-center text-[9px] text-[#52526a]">Ju</span>
              <span className="flex-1 text-center text-[9px] text-[#52526a]">Sh</span>
              <span className="flex-1 text-center text-[9px] text-[#52526a]">Ya</span>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-[18px]">
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-3.5 flex justify-between items-center uppercase">
              SO'NGGI A'ZOLAR
              <Link href="/gym/members" className="text-accent hover:underline cursor-pointer">
                Hammasi →
              </Link>
            </div>
            <table className="w-full mt-1 text-xs border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-[#52526a] font-mono text-[10px] tracking-[1px] pb-2.5 border-b border-border">A'ZO</th>
                  <th className="text-left text-[#52526a] font-mono text-[10px] tracking-[1px] pb-2.5 border-b border-border">STREAK</th>
                  <th className="text-left text-[#52526a] font-mono text-[10px] tracking-[1px] pb-2.5 border-b border-border">BALL</th>
                  <th className="text-left text-[#52526a] font-mono text-[10px] tracking-[1px] pb-2.5 border-b border-border">HOLAT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="cursor-pointer hover:text-[#F4F5F0] transition-colors group" onClick={() => router.push('/gym/members')}>
                  <td className="py-2.5 pr-2 border-b border-[#15151f]">
                    <span className="w-[26px] h-[26px] rounded-lg bg-accent/10 text-accent inline-flex items-center justify-center font-display font-bold text-[11px] mr-2.5 shrink-0 align-middle">JT</span>
                    Jasur Toshmatov
                  </td>
                  <td className="py-2.5 pr-2 border-b border-[#15151f] font-mono group-hover:text-white">🔥 14 kun</td>
                  <td className="py-2.5 pr-2 border-b border-[#15151f] font-mono text-accent">2,340</td>
                  <td className="py-2.5 pr-2 border-b border-[#15151f]">
                    <span className="px-2.5 py-[3px] rounded-full text-[10px] font-mono bg-[#1D9E75]/10 text-[#5DCAA5]">Faol</span>
                  </td>
                </tr>
                <tr className="cursor-pointer hover:text-[#F4F5F0] transition-colors group" onClick={() => router.push('/gym/members')}>
                  <td className="py-2.5 pr-2 border-b border-[#15151f]">
                    <span className="w-[26px] h-[26px] rounded-lg bg-accent/10 text-accent inline-flex items-center justify-center font-display font-bold text-[11px] mr-2.5 shrink-0 align-middle">NM</span>
                    Nilufar Mirzaeva
                  </td>
                  <td className="py-2.5 pr-2 border-b border-[#15151f] font-mono group-hover:text-white">🔥 7 kun</td>
                  <td className="py-2.5 pr-2 border-b border-[#15151f] font-mono text-accent">1,180</td>
                  <td className="py-2.5 pr-2 border-b border-[#15151f]">
                    <span className="px-2.5 py-[3px] rounded-full text-[10px] font-mono bg-[#1D9E75]/10 text-[#5DCAA5]">Faol</span>
                  </td>
                </tr>
                <tr className="cursor-pointer hover:text-[#F4F5F0] transition-colors group" onClick={() => router.push('/gym/members')}>
                  <td className="py-2.5 pr-2 border-b border-[#15151f]">
                    <span className="w-[26px] h-[26px] rounded-lg bg-accent/10 text-accent inline-flex items-center justify-center font-display font-bold text-[11px] mr-2.5 shrink-0 align-middle">DR</span>
                    Doniyor Raxmonov
                  </td>
                  <td className="py-2.5 pr-2 border-b border-[#15151f] font-mono text-[#E2807F]">0 kun</td>
                  <td className="py-2.5 pr-2 border-b border-[#15151f] font-mono text-accent">340</td>
                  <td className="py-2.5 pr-2 border-b border-[#15151f]">
                    <span className="px-2.5 py-[3px] rounded-full text-[10px] font-mono bg-[#E24B4A]/10 text-[#E2807F]">Risk</span>
                  </td>
                </tr>
                <tr className="cursor-pointer hover:text-[#F4F5F0] transition-colors group" onClick={() => router.push('/gym/members')}>
                  <td className="py-2.5 pr-2 border-b border-[#15151f]">
                    <span className="w-[26px] h-[26px] rounded-lg bg-accent/10 text-accent inline-flex items-center justify-center font-display font-bold text-[11px] mr-2.5 shrink-0 align-middle">MA</span>
                    Mohira Aliyeva
                  </td>
                  <td className="py-2.5 pr-2 border-b border-[#15151f] font-mono group-hover:text-white">🌱 2 kun</td>
                  <td className="py-2.5 pr-2 border-b border-[#15151f] font-mono text-accent">90</td>
                  <td className="py-2.5 pr-2 border-b border-[#15151f]">
                    <span className="px-2.5 py-[3px] rounded-full text-[10px] font-mono bg-[#388EDE]/10 text-[#7BB6E8]">Yangi</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="bg-surface border border-border rounded-xl p-[18px] mb-4">
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-3.5 flex justify-between items-center uppercase">
              ⚠️ CHURN OGOHLANTIRISH
              <Link href="/gym/members" className="text-accent hover:underline cursor-pointer">
                Ko'rish →
              </Link>
            </div>
            
            <div className="flex items-center justify-between py-[9px] border-b border-[#1a1a26] text-xs">
              <div className="flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => router.push('/gym/members')}>
                <span className="w-[6px] h-[6px] rounded-full bg-[#E24B4A]"></span>
                Doniyor R.
              </div>
              <span className="font-mono text-[#E24B4A] text-[11px]">8 kun yo'q</span>
            </div>
            
            <div className="flex items-center justify-between py-[9px] border-b border-[#1a1a26] text-xs">
              <div className="flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => router.push('/gym/members')}>
                <span className="w-[6px] h-[6px] rounded-full bg-[#E24B4A]"></span>
                Sevara Q.
              </div>
              <span className="font-mono text-[#E24B4A] text-[11px]">6 kun yo'q</span>
            </div>
            
            <div className="flex items-center justify-between py-[9px] border-b border-[#1a1a26] text-xs border-none">
              <div className="flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => router.push('/gym/members')}>
                <span className="w-[6px] h-[6px] rounded-full bg-[#E24B4A]"></span>
                Aziz B.
              </div>
              <span className="font-mono text-[#E24B4A] text-[11px]">5 kun yo'q</span>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-[18px]">
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-3.5 flex justify-between items-center uppercase">
              🏆 HAFTALIK TOP
              <Link href="/gym/challenge" className="text-accent hover:underline cursor-pointer">
                Challenge →
              </Link>
            </div>
            
            <div className="flex items-center justify-between py-[9px] border-b border-[#1a1a26] text-xs">
              <div className="flex items-center gap-2 cursor-default text-accent">
                🥇 Jasur T.
              </div>
              <span className="font-mono text-accent text-[11px]">2,340</span>
            </div>
            
            <div className="flex items-center justify-between py-[9px] border-b border-[#1a1a26] text-xs">
              <div className="flex items-center gap-2 cursor-default">
                🥈 Kamola S.
              </div>
              <span className="font-mono text-[#8888a0] text-[11px]">2,110</span>
            </div>
            
            <div className="flex items-center justify-between py-[9px] border-b border-[#1a1a26] text-xs border-none">
              <div className="flex items-center gap-2 cursor-default">
                🥉 Botir N.
              </div>
              <span className="font-mono text-[#8888a0] text-[11px]">1,890</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
