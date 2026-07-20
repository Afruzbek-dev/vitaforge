"use client";
import { TrainerService } from "@/lib/services/TrainerService";
import { Panel, Pill } from "@/components/features";
import { useQuery } from "@tanstack/react-query";

export default function TrainerClients() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trainer", "clients"],
    queryFn: async () => {
      const res = await TrainerService.getClients();
      return res;
    }
  });

  if (isLoading) return <div className="text-vtext">Yuklanmoqda...</div>;
  if (isError || !data) return <div className="text-vred">Xatolik yuz berdi</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Mijozlarim</h1>
          <p className="text-muted text-xs mt-1">{data.length} ta faol mijoz</p>
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
            {data.map((m: any, i: number) => (
              <tr key={i} className="hover:bg-surface2/50 transition-colors">
                <td className="py-2.5 border-b border-[#15151f] text-xs text-vtext font-medium">{m.name}</td>
                <td className={`py-2.5 border-b border-[#15151f] text-xs font-mono ${m.adh >= 50 ? 'text-accent' : 'text-vred'}`}>{m.adh}%</td>
                <td className="py-2.5 border-b border-[#15151f] text-xs text-right">
                  <Pill variant={m.status as any}>{m.status}</Pill>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={3} className="py-4 text-center text-muted text-xs">Mijozlar yo'q</td></tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}