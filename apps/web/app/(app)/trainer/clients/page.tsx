"use client";
import { Panel, Pill } from "@/components/vf";

export default function TrainerClients() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Mijozlarim</h1>
          <p className="text-muted text-xs mt-1">22 ta faol mijoz</p>
        </div>
      </div>
      <Panel>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">MIJOZ</th>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">ADHERENCE</th>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border text-right">HOLAT</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Jasur Toshmatov", adh: 81, status: "ok" },
              { name: "Dilnoza Karimova", adh: 42, status: "risk" },
              { name: "Otabek Rustamov", adh: 88, status: "ok" },
              { name: "Madina Yuldasheva", adh: 30, status: "risk" },
            ].map((m, i) => (
              <tr key={i} className="hover:bg-surface2/50 transition-colors">
                <td className="py-2.5 border-b border-[#15151f] text-xs text-vtext font-medium">{m.name}</td>
                <td className={`py-2.5 border-b border-[#15151f] text-xs font-mono ${m.adh >= 50 ? 'text-accent' : 'text-vred'}`}>{m.adh}%</td>
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