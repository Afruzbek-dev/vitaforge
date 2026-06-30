"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TrainerTodayPage() {
  const router = useRouter();

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="font-display font-bold text-xl">Bugun, Coach Aziz 👋</div>
          <div className="text-[#52526a] text-xs mt-0.5">Dushanba · 6 seans, 2 ta qoldi</div>
        </div>
        <button className="font-body text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer bg-transparent border border-[#2a2a3a] text-[#EEEEE8] hover:bg-[#1a1a26]">
          + Seans qo'shish
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-3.5 mb-4 border-l-2 border-l-[#E24B4A]">
        <div className="text-xs font-semibold mb-1">🤖 AI Copilot: Madina bilan bog'lanish vaqti keldi</div>
        <div className="text-[11px] text-[#9999ad] leading-[1.55] mb-2">
          3 kundan beri checkin yo'q, oxirgi seansda charchoq belgilari bor edi. Dam olish kuni yoki yengilroq dastur tavsiya qilishni o'ylab ko'ring.
        </div>
        <Link href="/gym/trainer/copilot" className="font-mono text-[10px] text-accent cursor-pointer tracking-[0.5px] hover:underline">
          Copilot bilan xabar tayyorlash →
        </Link>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="bg-surface border border-border rounded-xl p-[18px]">
          <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-3.5 flex justify-between items-center uppercase">
            BUGUNGI SEANSLAR
          </div>
          
          <div className="flex items-center justify-between py-[9px] border-b border-[#1a1a26] text-xs">
            <div className="flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => router.push('/gym/trainer/clients')}>
              14:00 · Jasur Tashkentov — Kuch mashqi
            </div>
            <span className="px-2.5 py-[3px] rounded-full text-[10px] font-mono bg-[#1D9E75]/10 text-[#5DCAA5]">Tayyor</span>
          </div>
          
          <div className="flex items-center justify-between py-[9px] border-b border-[#1a1a26] text-xs">
            <div className="flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => router.push('/gym/trainer/clients')}>
              15:30 · Madina Yusupova — Cardio
            </div>
            <span className="px-2.5 py-[3px] rounded-full text-[10px] font-mono bg-[#E24B4A]/10 text-[#E2807F]">3 kun yo'q</span>
          </div>
          
          <div className="flex items-center justify-between py-[9px] text-xs border-none">
            <div className="flex items-center gap-2 cursor-default">
              17:00 · Otabek Rashidov — Yelka
            </div>
            <span className="px-2.5 py-[3px] rounded-full text-[10px] font-mono bg-[#1D9E75]/10 text-[#5DCAA5]">Tayyor</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-[18px]">
          <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-3.5 flex justify-between items-center uppercase">
            BU OYDAGI NATIJA
          </div>
          <div className="mb-2.5">
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">FAOL MIJOZLAR</div>
            <div className="font-display font-bold text-[22px]">22</div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-[#52526a] tracking-[1px] mb-2 uppercase">O'RTACHA ADHERENCE</div>
            <div className="font-display font-bold text-[22px]">81%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
