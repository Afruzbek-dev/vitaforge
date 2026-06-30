"use client";
import Link from "next/link";
import { KpiCard, Panel, Pill, Avatar, InsightCard, ChartBars } from "@/components/vf";

export default function OwnerDashboard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Xush kelibsiz, Botir 👋</h1>
          <p className="text-muted text-xs mt-1">FitZone Gym · Yunusobod, Toshkent</p>
        </div>
        <Pill variant="ok">PRO TARIF</Pill>
      </div>

      <div className="grid grid-cols-4 gap-3.5">
        <KpiCard label="RETENTION" value="73%" delta="↑ 12%" />
        <KpiCard label="JAMI A'ZOLAR" value="214" delta="+18 yangi" />
        <KpiCard label="CHURN RISK" value="9" delta="↓ kuzatuv kerak" warn />
        <KpiCard label="FAOL BUGUN" value="87" delta="41% DAU" />
      </div>

      <InsightCard 
        warn 
        title="🤖 AI Copilot" 
        body="3 ta a'zo xavfli holatda (oxirgi 7 kunda umuman kelmagan). Ular bilan bog'lanish tavsiya etiladi: Doniyor, Sevara, Aziz." 
        action="XABAR YUBORISH" 
      />

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="space-y-4">
          <Panel title="HAFTALIK FAOLLIK">
            <ChartBars data={[
              { label: "Du", value: 58 },
              { label: "Se", value: 72 },
              { label: "Ch", value: 65 },
              { label: "Pa", value: 88, peak: true },
              { label: "Ju", value: 80 },
              { label: "Sh", value: 75 },
              { label: "Ya", value: 70 },
            ]} height={120} />
          </Panel>

          <Panel title="SO'NGGI A'ZOLAR">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">A'ZO</th>
                  <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">REJA</th>
                  <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">HOLAT</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, name: "Jasur Toshmatov", plan: "Pro", status: "ok" },
                  { id: 2, name: "Nilufar Mirzaeva", plan: "Starter", status: "ok" },
                  { id: 3, name: "Doniyor Raxmonov", plan: "Pro", status: "risk" },
                  { id: 4, name: "Mohira Aliyeva", plan: "Scale", status: "new" },
                ].map(m => (
                  <tr key={m.id}>
                    <td className="py-2.5 border-b border-[#15151f] text-xs">
                      <Link href={`/gym/members/${m.id}`} className="hover:text-accent transition-colors">
                        {m.name}
                      </Link>
                    </td>
                    <td className="py-2.5 border-b border-[#15151f] text-xs text-[#8888a0]">{m.plan}</td>
                    <td className="py-2.5 border-b border-[#15151f] text-xs">
                      <Pill variant={m.status as "ok"|"risk"|"new"|"mid"}>{m.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="CHURN OGOHLANTIRISH">
            <div className="space-y-2">
              {['Doniyor Raxmonov', 'Sevara Qosimova', 'Aziz Bekov'].map((name, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#15151f] text-xs">
                  <span className="text-vtext">{name}</span>
                  <Pill variant="risk">xavf</Pill>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="HAFTALIK TOP">
            <div className="space-y-2">
              {[
                { name: "Nilufar Mirzaeva", score: 3120, pos: "🥇" },
                { name: "Kamola Voxidova", score: 2890, pos: "🥈" },
                { name: "Siz", score: 2340, pos: "🥉" }
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#15151f] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]">{m.pos}</span>
                    <span className={m.name === "Siz" ? "text-accent font-medium" : "text-vtext"}>{m.name}</span>
                  </div>
                  <span className="text-muted font-mono">{m.score}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}