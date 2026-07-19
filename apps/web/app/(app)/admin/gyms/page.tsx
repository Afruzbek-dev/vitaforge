"use client";
import { AdminService } from "@/lib/services/AdminService";
import { Panel, Pill } from "@/components/vf";
import { useQuery } from "@tanstack/react-query";

export default function AdminGyms() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "gyms"],
    queryFn: async () => {
      const res = await AdminService.getGyms();
      return res;
    }
  });

  if (isLoading) return <div className="text-vtext">Yuklanmoqda...</div>;
  if (isError || !data) return <div className="text-vred">Xatolik yuz berdi</div>;

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
            {data.map((m: any, i: number) => (
              <tr key={i} className="hover:bg-surface2/50">
                <td className="py-2.5 border-b border-[#15151f] text-xs text-vtext">{m.name}</td>
                <td className="py-2.5 border-b border-[#15151f] text-xs text-[#8888a0]">{m.plan}</td>
                <td className="py-2.5 border-b border-[#15151f] text-xs text-right"><Pill variant={m.status as any}>{m.status}</Pill></td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-muted text-xs">Gymlar yo'q</td></tr>}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}