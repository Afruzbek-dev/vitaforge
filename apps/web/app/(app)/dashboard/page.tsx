"use client";
import Link from "next/link";
import { ProgressBar, InsightCard } from "@/components/vf";

export default function MobileHome() {
  return (
    <div className="space-y-4 pb-4">
      <div className="mb-4 mt-2">
        <div className="font-mono text-[8px] tracking-widest text-muted uppercase mb-1">DUSHANBA · 14 IYUN</div>
        <h1 className="font-display font-bold text-[17px] text-vtext">Salom, Jasur 👋</h1>
      </div>

      <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-3.5">
        <div className="text-center mb-3">
          <div className="font-mono text-[10px] text-muted tracking-widest uppercase">BUGUNGI CHECKIN</div>
        </div>
        <button className="w-full bg-accent text-bg font-semibold text-[13px] py-3 rounded-xl shadow-[0_0_18px_rgba(232,255,71,0.25)]">
          Zalga keldim 🎯
        </button>
      </div>

      <div className="bg-surface border border-border rounded-[13px] p-3.5">
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-[10px] text-muted tracking-widest uppercase">KALORIYA</span>
          <span className="font-mono text-[10px] text-vtext">1200 / 2400 kcal</span>
        </div>
        <ProgressBar value={50} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/dashboard/food" className="bg-surface border border-border rounded-[13px] p-3.5 flex flex-col items-center justify-center gap-2">
          <span className="text-lg">🥗</span>
          <span className="text-[11px] text-vtext font-medium">Ovqat yozish</span>
        </Link>
        <Link href="/dashboard/profile" className="bg-surface border border-border rounded-[13px] p-3.5 flex flex-col items-center justify-center gap-2">
          <span className="text-lg">📸</span>
          <span className="text-[11px] text-vtext font-medium">Surat qo'shish</span>
        </Link>
      </div>

      <InsightCard 
        title="🤖 AI Tavsiya" 
        body="Kechagi mashqdan so'ng mushaklarda toliqish bo'lishi mumkin. Bugun faqat kardio qilishni tavsiya qilaman." 
      />
    </div>
  );
}