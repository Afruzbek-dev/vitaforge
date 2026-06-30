"use client";
import { Panel, Pill } from "@/components/vf";
export default function AdminGyms() {
  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Zallar</h1>
      <Panel>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">GYM</th>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">REJA</th>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border text-right">HOLAT</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "FitZone", plan: "Pro", status: "ok" },
              { name: "PowerFit", plan: "Scale", status: "risk" },
            ].map((m, i) => (
              <tr key={i} className="hover:bg-surface2/50">
                <td className="py-2.5 border-b border-[#15151f] text-xs text-vtext">{m.name}</td>
                <td className="py-2.5 border-b border-[#15151f] text-xs text-[#8888a0]">{m.plan}</td>
                <td className="py-2.5 border-b border-[#15151f] text-xs text-right"><Pill variant={m.status as any}>{m.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}