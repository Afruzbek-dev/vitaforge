"use client";
import { CopilotService } from "@/lib/services/CopilotService";
import { Panel, InsightCard } from "@/components/vf";
import { useQuery } from "@tanstack/react-query";

export default function AdminCopilot() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "copilot"],
    queryFn: async () => {
      const res = await CopilotService.getMessages("admin");
      return res;
    }
  });

  if (isLoading) return <div className="text-vtext p-4">Yuklanmoqda...</div>;
  if (isError || !data) return <div className="text-vred p-4">Xatolik yuz berdi</div>;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-2">🤖 AI Copilot</h1>
      <div className="grid grid-cols-[1.3fr_1fr] gap-4 flex-1 min-h-0">
        <Panel className="flex flex-col h-[600px] p-0 overflow-hidden">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {(data as any).messages?.map((m: any, i: number) => (
              <div key={i} className="text-vtext text-xs border border-border p-3 bg-surface2 rounded-[12px_12px_12px_4px] self-start max-w-[80%]">
                 {m.text}
              </div>
            ))}
            {(!(data as any).messages || (data as any).messages.length === 0) && <div className="text-vtext text-xs">Xabarlar yo'q</div>}
          </div>
        </Panel>
        <div className="space-y-4 overflow-y-auto h-[600px] pr-1">
          {(data as any).alerts?.map((a: any, i: number) => (
            <InsightCard key={i} warn title={a.title} body={a.body} />
          ))}
          {(!(data as any).alerts || (data as any).alerts.length === 0) && <InsightCard warn title="Anomal sarf" body="PowerFit Samarqand" />}
        </div>
      </div>
    </div>
  );
}