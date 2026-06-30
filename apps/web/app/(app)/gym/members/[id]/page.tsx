"use client";
import Link from "next/link";
import { use } from "react";
import { Avatar, KpiCard, InsightCard, Panel, Pill } from "@/components/vf";

const MEMBERS_DATA = {
  3: { name: "Doniyor Raxmonov", init: "DR", plan: "Pro", joined: "12 Mar 2026", status: "risk" }
};

export default function MemberDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const data = MEMBERS_DATA[Number(resolvedParams.id) as keyof typeof MEMBERS_DATA] || {
    name: "Jasur Toshmatov", init: "JT", plan: "Pro", joined: "01 Yan 2026", status: "ok"
  };

  return (
    <div className="space-y-6">
      <Link href="/gym/members" className="font-mono text-[10px] text-muted tracking-wider hover:text-accent">
        ← A'zolarga qaytish
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar initials={data.init} size="lg" />
          <div>
            <h1 className="font-display font-bold text-[22px] text-vtext">{data.name}</h1>
            <p className="text-muted text-xs mt-1">{data.plan} · Qo'shilgan: {data.joined}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2">
            Qo'ng'iroq
          </button>
          <button className="bg-accent text-bg font-semibold text-xs px-4 py-2.5 rounded-[9px] hover:opacity-90">
            Xabar yuborish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5">
        <KpiCard label="STREAK" value={data.status === 'risk' ? '0 kun' : '🔥 14'} delta={data.status === 'risk' ? 'yoqotilgan' : 'yaxshi'} warn={data.status === 'risk'} />
        <KpiCard label="BALL" value={data.status === 'risk' ? '340' : '2340'} />
        <KpiCard label="HOLAT" value={data.status === 'risk' ? 'XAVF' : 'FAOL'} warn={data.status === 'risk'} />
        <KpiCard label="DARAJA" value={data.status === 'risk' ? '2' : '4'} />
      </div>

      {data.status === 'risk' && (
        <InsightCard 
          warn 
          title="🤖 AI Tahlili" 
          body="Ushbu a'zoning churn (ketib qolish) ehtimoli 82%. Oxirgi 14 kunda atigi 1 marta keldi. Maxsus taklif bilan bog'lanish tavsiya etiladi." 
        />
      )}

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="FAOLLIK TARIXI">
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#1e1e2c] before:to-transparent">
             <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-[#0d0d16] group-[.is-active]:bg-accent group-[.is-active]:border-accent text-slate-500 group-[.is-active]:text-bg shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                   <div className="w-1.5 h-1.5 bg-current rounded-full" />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-surface2 p-3 rounded-lg border border-border">
                   <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-vtext text-xs">Yelka va Qo'l</div>
                      <time className="font-mono text-[9px] text-muted">Bugun</time>
                   </div>
                   <div className="text-[#8888a0] text-[11px]">45 min · O'tkazib yuborilgan</div>
                </div>
             </div>
          </div>
        </Panel>

        <Panel title="TO'LOV TARIXI">
           <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#15151f] text-xs">
                <div>
                  <div className="text-vtext">May, 2026</div>
                  <div className="text-[10px] text-muted mt-0.5">Pro Tarif · $69</div>
                </div>
                <Pill variant="ok">To'langan</Pill>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#15151f] text-xs">
                <div>
                  <div className="text-vtext">Aprel, 2026</div>
                  <div className="text-[10px] text-muted mt-0.5">Pro Tarif · $69</div>
                </div>
                <Pill variant="ok">To'langan</Pill>
              </div>
           </div>
        </Panel>
      </div>
    </div>
  );
}