"use client";
import Link from "next/link";
import { Avatar, Pill, Panel } from "@/components/vf";

export default function MembersList() {
  const members = [
    { id: 1, name: "Jasur Toshmatov", init: "JT", plan: "Pro", streak: "🔥 14 kun", score: 2340, status: "ok" },
    { id: 2, name: "Nilufar Mirzaeva", init: "NM", plan: "Starter", streak: "🔥 7 kun", score: 1180, status: "ok" },
    { id: 3, name: "Doniyor Raxmonov", init: "DR", plan: "Pro", streak: "0 kun", score: 340, status: "risk" },
    { id: 4, name: "Mohira Aliyeva", init: "MA", plan: "Scale", streak: "🌱 2 kun", score: 90, status: "new" },
    { id: 5, name: "Sevara Qosimova", init: "SQ", plan: "Starter", streak: "0 kun", score: 210, status: "risk" },
    { id: 6, name: "Aziz Bekov", init: "AB", plan: "Pro", streak: "0 kun", score: 560, status: "risk" },
    { id: 7, name: "Botir Nematov", init: "BN", plan: "Pro", streak: "🔥 21 kun", score: 1890, status: "ok" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">A'zolar</h1>
          <p className="text-muted text-xs mt-1">214 ta a'zo · 9 tasi xavf ostida</p>
        </div>
        <button className="bg-accent text-bg font-semibold text-xs px-4 py-2.5 rounded-[9px] hover:opacity-90">
          + A'zo qo'shish
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="Ism bo'yicha qidirish..." 
          className="bg-surface2 border border-border rounded-[9px] px-3.5 py-2.5 text-xs text-[#8888a0] w-64 outline-none focus:border-accent"
        />
        <div className="flex gap-1.5 ml-auto">
          {['Barchasi', 'Faol', 'Risk', 'Yangi'].map((chip, i) => (
            <button 
              key={chip} 
              className={`font-mono text-[10px] tracking-wider px-3 py-1.5 rounded-full ${i === 0 ? 'bg-accent text-bg' : 'bg-surface2 border border-border text-[#8888a0]'}`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <Panel>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">A'ZO</th>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">REJA</th>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">STREAK</th>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">BALL</th>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border text-right">HOLAT</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} className="hover:bg-surface2/50 transition-colors">
                <td className="py-2.5 border-b border-[#15151f] text-xs">
                  <Link href={`/gym/members/${m.id}`} className="flex items-center gap-3 w-full">
                    <Avatar initials={m.init} size="sm" />
                    <span className="font-medium text-vtext hover:text-accent transition-colors">{m.name}</span>
                  </Link>
                </td>
                <td className="py-2.5 border-b border-[#15151f] text-xs text-[#8888a0]">{m.plan}</td>
                <td className="py-2.5 border-b border-[#15151f] text-xs text-vtext">{m.streak}</td>
                <td className="py-2.5 border-b border-[#15151f] text-xs text-muted font-mono">{m.score}</td>
                <td className="py-2.5 border-b border-[#15151f] text-xs text-right">
                  <Pill variant={m.status as any}>{m.status}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}