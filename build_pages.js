const fs = require('fs');
const path = require('path');

const writeFiles = (baseDir, files) => {
  Object.entries(files).forEach(([file, content]) => {
    const p = path.join(baseDir, file);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  });
};

const ownerBaseDir = path.join(__dirname, 'apps/web/app/(app)/gym');
const ownerFiles2 = {
  'analytics/page.tsx': `"use client";
import { KpiCard, Panel, ChartBars } from "@/components/vf";

export default function Analytics() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Analytics</h1>
          <p className="text-muted text-xs mt-1">FitZone Gym · Oxirgi 6 oy</p>
        </div>
        <button className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3.5">
        <KpiCard label="MRR" value="$6,240" delta="↑ 9.3%" />
        <KpiCard label="O'RTACHA LTV" value="$184" delta="↑ 4.1%" />
        <KpiCard label="CHURN OYLIK" value="4.1%" delta="↑ 0.6%" warn />
        <KpiCard label="AI SARFI" value="$31" delta="Bu oy" />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="DAROMAD DINAMIKASI">
          <ChartBars data={[
            { label: "Yan", value: 4100 },
            { label: "Fev", value: 4800 },
            { label: "Mar", value: 5200 },
            { label: "Apr", value: 5600 },
            { label: "May", value: 5900 },
            { label: "Iyun", value: 6240, peak: true },
          ]} height={150} />
        </Panel>
        <Panel title="A'ZOLAR O'SISHI">
          <ChartBars data={[
            { label: "Yan", value: 120 },
            { label: "Fev", value: 145 },
            { label: "Mar", value: 168 },
            { label: "Apr", value: 189 },
            { label: "May", value: 202 },
            { label: "Iyun", value: 214, peak: true },
          ]} height={150} />
        </Panel>
      </div>
      
      <Panel title="FAOLLIK TAQSIMOTI">
        <div className="space-y-4">
           {[
             { name: "3+ marta keluvchilar (Haftasiga)", pct: "42%" },
             { name: "1-2 marta keluvchilar", pct: "38%" },
             { name: "Xavf ostida (0 marta)", pct: "15%" },
             { name: "Muzlatilgan", pct: "5%" },
           ].map(d => (
             <div key={d.name} className="flex justify-between items-center py-2.5 border-b border-[#15151f] text-xs">
               <span className="text-vtext">{d.name}</span>
               <span className="text-muted font-mono">{d.pct}</span>
             </div>
           ))}
        </div>
      </Panel>
    </div>
  );
}`,
  'challenge/page.tsx': `"use client";
import { Panel, ProgressBar } from "@/components/vf";

export default function Challenge() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Challenge & Gamifikatsiya</h1>
        </div>
        <button className="bg-accent text-bg font-semibold text-xs px-4 py-2.5 rounded-[9px] hover:opacity-90">
          + Yangi challenge
        </button>
      </div>

      <Panel title="JORIY CHALLENGE">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[14px] font-bold text-vtext">30 kunlik temir — Iyun marafoni</div>
          <div className="font-mono text-[10px] text-muted">18/30 kun</div>
        </div>
        <ProgressBar value={60} />
        <div className="mt-3 text-xs text-[#8888a0]">
          Qatnashuvchilar: <span className="text-accent">64 a'zo</span>
        </div>
      </Panel>
    </div>
  );
}`,
  'copilot/page.tsx': `"use client";
import { Panel, InsightCard } from "@/components/vf";

export default function Copilot() {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-2">🤖 AI Copilot</h1>
      
      <div className="grid grid-cols-[1.3fr_1fr] gap-4 flex-1 min-h-0">
        <Panel className="flex flex-col h-[600px] p-0 overflow-hidden">
          <div className="p-4 border-b border-border bg-[#0d0d16] z-10 flex justify-between items-center">
            <span className="font-bold text-[13px] text-vtext">Copilot Chat</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex flex-col self-start max-w-[80%] bg-surface2 border border-border rounded-[12px_12px_12px_4px] p-3 text-[12px] text-vtext">
              Salom, Botir! Men VitaForge AI. Gymingiz bo'yicha qanday ma'lumot kerak?
            </div>
            <div className="flex flex-col self-end max-w-[80%] ml-auto bg-accent text-bg font-medium rounded-[12px_12px_4px_12px] p-3 text-[12px]">
              Kechagi kun bo'yicha kimlar xavf ostida?
            </div>
            <div className="flex flex-col self-start max-w-[80%] bg-surface2 border border-border rounded-[12px_12px_12px_4px] p-3 text-[12px] text-vtext">
              Oxirgi 7 kunda 3 ta a'zo umuman kelmadi: Doniyor, Sevara, Aziz. Ularga avtomatik SMS yuboraymi?
            </div>
          </div>
          <div className="p-3 border-t border-border bg-[#0d0d16]">
             <div className="flex gap-2">
                <input type="text" placeholder="Xabar yozing..." className="flex-1 bg-surface2 border border-border rounded-[9px] px-3.5 py-2.5 text-xs text-vtext outline-none" />
                <button className="bg-accent text-bg px-4 rounded-[9px] font-semibold">Yuborish</button>
             </div>
          </div>
        </Panel>

        <div className="space-y-4 overflow-y-auto h-[600px] pr-1">
          <InsightCard warn title="Churn Xavfi (3)" body="Doniyor, Sevara, Aziz oxirgi 7 kunda kelmadi. Ular 'Pro' tarifida, daromad yo'qotilishi xavfi bor." action="XABAR YUBORISH" />
          <InsightCard title="Seshanba passivligi" body="Odatda seshanba kunlari tashriflar 20% ga kamayadi. Shu kuni maxsus mini-musobaqa o'tkazishni tavsiya qilaman." action="KO'RISH" />
          <InsightCard title="Pro tarifiga o'tish" body="5 ta Starter a'zosi deyarli har kuni kelmoqda. Ularga Pro tarifni taklif qilsangiz, konversiya ehtimoli yuqori." action="RO'YXATNI KO'RISH" />
        </div>
      </div>
    </div>
  );
}`,
  'messages/page.tsx': `"use client";
import { Panel } from "@/components/vf";

export default function Messages() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Xabar yuborish</h1>
        </div>
        <button className="bg-accent text-bg font-semibold text-xs px-4 py-2.5 rounded-[9px] hover:opacity-90">
          + Yangi kampaniya
        </button>
      </div>
      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="XABAR YOZISH">
           <textarea className="w-full h-32 bg-surface2 border border-border rounded-xl p-3 text-xs text-vtext outline-none resize-none mb-3" placeholder="Xabar matni..."></textarea>
           <div className="flex justify-between">
              <button className="border border-[#2a2a3a] text-vtext text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                🤖 AI Yordami
              </button>
              <button className="bg-accent text-bg font-semibold text-xs px-5 py-2 rounded-lg">
                Yuborish
              </button>
           </div>
        </Panel>
      </div>
    </div>
  );
}`,
  'settings/page.tsx': `"use client";
import { Panel } from "@/components/vf";

export default function Settings() {
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Sozlamalar</h1>
      
      <Panel title="GYM PROFILI">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-muted">Gym Nomi</span>
             <div className="flex items-center gap-4">
               <span className="text-xs text-vtext font-medium">FitZone Gym</span>
               <span className="text-[10px] text-accent cursor-pointer">Tahrirlash</span>
             </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-muted">Manzil</span>
             <div className="flex items-center gap-4">
               <span className="text-xs text-vtext font-medium">Yunusobod, Toshkent</span>
               <span className="text-[10px] text-accent cursor-pointer">Tahrirlash</span>
             </div>
          </div>
        </div>
      </Panel>

      <Panel title="BILDIRISHNOMALAR">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-vtext">Churn xavfi haqida ogohlantirish (AI)</span>
             <div className="w-9 h-5 rounded-full bg-accent relative cursor-pointer">
               <div className="w-4 h-4 rounded-full bg-bg absolute right-0.5 top-0.5"></div>
             </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-vtext">Haftalik hisobot (Telegram)</span>
             <div className="w-9 h-5 rounded-full bg-accent relative cursor-pointer">
               <div className="w-4 h-4 rounded-full bg-bg absolute right-0.5 top-0.5"></div>
             </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}`
};

writeFiles(ownerBaseDir, ownerFiles2);

const trainerBaseDir = path.join(__dirname, 'apps/web/app/(app)/trainer');
const trainerFiles = {
  'layout.tsx': `export default function TrainerLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }`,
  'page.tsx': `"use client";
import { KpiCard, Panel, Pill, InsightCard } from "@/components/vf";

export default function TrainerToday() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Bugun, Coach Aziz 👋</h1>
          <p className="text-muted text-xs mt-1">Dushanba · 6 seans, 2 ta qoldi</p>
        </div>
        <button className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2">
          + Seans qo'shish
        </button>
      </div>

      <InsightCard 
        warn 
        title="🤖 AI Copilot" 
        body="Madina bilan bog'lanish vaqti keldi (3 kun checkin yo'q). Bugun unga dam olish tavsiya etiladi." 
      />

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="BUGUNGI SEANSLAR">
          <div className="space-y-2">
            {[
              { time: "14:00", name: "Jasur", workout: "Kuch", status: "ok" },
              { time: "15:30", name: "Madina", workout: "Cardio", status: "risk" },
              { time: "17:00", name: "Otabek", workout: "Yelka", status: "ok" },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-[#15151f] text-xs">
                 <div className="flex gap-4 items-center">
                   <span className="font-mono text-accent">{s.time}</span>
                   <span className="text-vtext">{s.name} · <span className="text-[#8888a0]">{s.workout}</span></span>
                 </div>
                 <Pill variant={s.status as any}>{s.status === 'risk' ? '3 kun yo\\'q' : 'keldi'}</Pill>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <KpiCard label="FAOL MIJOZLAR" value="22" />
          <KpiCard label="O'RTACHA ADHERENCE" value="81%" />
        </div>
      </div>
    </div>
  );
}`,
  'clients/page.tsx': `"use client";
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
                <td className={\`py-2.5 border-b border-[#15151f] text-xs font-mono \${m.adh >= 50 ? 'text-accent' : 'text-vred'}\`}>{m.adh}%</td>
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
}`,
  'schedule/page.tsx': `"use client";
import { Panel } from "@/components/vf";

export default function TrainerSchedule() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Jadval</h1>
          <p className="text-muted text-xs mt-1">Bu hafta</p>
        </div>
        <button className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2">
          + Bo'sh vaqt qo'shish
        </button>
      </div>
      <Panel>
         <div className="space-y-2">
            {[
              { day: "Dushanba", sessions: 6 },
              { day: "Seshanba", sessions: 8, active: true },
              { day: "Chorshanba", sessions: 5 },
              { day: "Payshanba", sessions: 7 },
            ].map((d, i) => (
              <div key={i} className={\`flex justify-between items-center py-3 border-b border-[#15151f] text-xs \${d.active ? 'text-accent font-medium bg-[rgba(232,255,71,0.04)] px-3 -mx-3 rounded-lg border-transparent' : 'text-vtext'}\`}>
                 <span>{d.day}</span>
                 <span className="font-mono text-muted">{d.sessions} seans</span>
              </div>
            ))}
         </div>
      </Panel>
    </div>
  );
}`,
  'analytics/page.tsx': `"use client";
import { KpiCard, ChartBars, Panel } from "@/components/vf";
export default function TrainerAnalytics() {
  return (
    <div className="space-y-4">
       <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Analytics</h1>
       <div className="grid grid-cols-4 gap-3.5">
          <KpiCard label="JAMI SEANSLAR OY" value="96" delta="↑ 8%" />
          <KpiCard label="O'RTACHA ADHERENCE" value="81%" delta="↑ 13%" />
          <KpiCard label="RISK MIJOZLAR" value="2" warn />
          <KpiCard label="DAROMAD" value="$1,840" delta="↑ 7%" />
       </div>
    </div>
  );
}`,
  'copilot/page.tsx': `"use client";
import { Panel, InsightCard } from "@/components/vf";
export default function TrainerCopilot() {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-2">🤖 AI Copilot</h1>
      <div className="grid grid-cols-[1.3fr_1fr] gap-4 flex-1 min-h-0">
        <Panel className="flex flex-col h-[600px] p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex flex-col self-start max-w-[80%] bg-surface2 border border-border rounded-[12px_12px_12px_4px] p-3 text-[12px] text-vtext">
              Salom, Coach Aziz! Madina Yuldashevada oxirgi kunlarda charchoq alomatlari sezilmoqda. 
            </div>
          </div>
          <div className="p-3 border-t border-border bg-[#0d0d16] flex gap-2">
            <input type="text" placeholder="Javob yozing..." className="flex-1 bg-surface2 border border-border rounded-[9px] px-3.5 py-2.5 text-xs text-vtext outline-none" />
          </div>
        </Panel>
        <div className="space-y-4 overflow-y-auto h-[600px] pr-1">
          <InsightCard warn title="Mijoz faolligi pasaydi" body="Madina 30% adherence'da." action="KO'RISH" />
        </div>
      </div>
    </div>
  );
}`,
  'settings/page.tsx': `"use client";
import { Panel } from "@/components/vf";
export default function TrainerSettings() {
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Sozlamalar</h1>
      <Panel title="PROFIL">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-muted">Ism</span>
             <span className="text-xs text-vtext font-medium">Coach Aziz</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}`
};
writeFiles(trainerBaseDir, trainerFiles);

const adminBaseDir = path.join(__dirname, 'apps/web/app/(app)/admin');
const adminFiles = {
  'layout.tsx': `export default function AdminLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }`,
  'page.tsx': `"use client";
import { KpiCard, Panel, InsightCard, ChartBars } from "@/components/vf";

export default function AdminOverview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">Platforma umumiy ko'rinishi</h1>
          <p className="text-muted text-xs mt-1">Barcha gym'lar</p>
        </div>
        <button className="border border-[#2a2a3a] text-vtext text-xs px-4 py-2.5 rounded-[9px] hover:bg-surface2">
          Export hisobot
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3.5">
        <KpiCard label="JAMI GYM" value="412" delta="↑ 8.2%" />
        <KpiCard label="MRR" value="$18,420" delta="↑ 12.5%" />
        <KpiCard label="CLAUDE API COST" value="$1,240" delta="↑ 4.5%" />
        <KpiCard label="CHURNED GYMS" value="6" warn />
      </div>

      <InsightCard 
        warn 
        title="🤖 Anomal AI Sarfi" 
        body="PowerFit Samarqandda AI sarfi keskin oshdi ($210). Bot abuse ehtimoli bor." 
        action="TEKSHIRISH" 
      />

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="MRR O'SISHI">
          <ChartBars data={[
             { label: "Yan", value: 12 },
             { label: "Fev", value: 14 },
             { label: "Mar", value: 15 },
             { label: "Apr", value: 16 },
             { label: "May", value: 17 },
             { label: "Iyun", value: 18.4, peak: true },
          ]} height={120} />
        </Panel>
      </div>
    </div>
  );
}`,
  'gyms/page.tsx': `"use client";
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
}`,
  'billing/page.tsx': `"use client";
import { KpiCard } from "@/components/vf";
export default function AdminBilling() {
  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Billing</h1>
      <div className="grid grid-cols-4 gap-3.5">
         <KpiCard label="STARTER" value="186" />
         <KpiCard label="PRO" value="158" />
         <KpiCard label="SCALE" value="58" />
         <KpiCard label="ENTERPRISE" value="10" />
      </div>
    </div>
  );
}`,
  'ai-usage/page.tsx': `"use client";
import { Panel, ChartBars } from "@/components/vf";
export default function AdminAiUsage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">AI Usage</h1>
      <Panel title="KUNLIK AI CHAQIRUVLARI">
        <ChartBars data={[{ label: "Du", value: 1200 }, { label: "Juma", value: 2500, peak: true }]} height={120} />
      </Panel>
    </div>
  );
}`,
  'copilot/page.tsx': `"use client";
import { Panel, InsightCard } from "@/components/vf";
export default function AdminCopilot() {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-2">🤖 AI Copilot</h1>
      <div className="grid grid-cols-[1.3fr_1fr] gap-4 flex-1 min-h-0">
        <Panel className="flex flex-col h-[600px] p-0 overflow-hidden">
          <div className="flex-1 p-4"><div className="text-vtext text-xs">AI Chat System Overview</div></div>
        </Panel>
        <div className="space-y-4 overflow-y-auto h-[600px] pr-1">
          <InsightCard warn title="Anomal sarf" body="PowerFit Samarqand" />
        </div>
      </div>
    </div>
  );
}`,
  'settings/page.tsx': `"use client";
import { Panel } from "@/components/vf";
export default function AdminSettings() {
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Sozlamalar</h1>
      <Panel title="PLATFORMA SOZLAMALARI">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]"><span className="text-xs text-vtext">Gym AI limit warning</span></div>
        </div>
      </Panel>
    </div>
  );
}`
};
writeFiles(adminBaseDir, adminFiles);

const mobileBaseDir = path.join(__dirname, 'apps/web/app/(app)/dashboard');
const mobileFiles = {
  'layout.tsx': `export default function DashboardLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }`,
  'page.tsx': `"use client";
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
}`,
  'plan/page.tsx': `"use client";
import { InsightCard } from "@/components/vf";

export default function Plan() {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="font-display font-bold text-[17px] text-vtext">Mashq rejasi</h1>
        <p className="text-xs text-muted mt-1">3-hafta · Kuch dasturi</p>
      </div>
      
      <div className="flex justify-between items-center px-2 py-3 bg-surface rounded-[13px] mb-4">
        {['D', 'S', 'C', 'P', 'J', 'S', 'Y'].map((day, i) => (
          <div key={i} className={\`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-mono \${i === 3 ? 'ring-2 ring-[rgba(232,255,71,0.4)] text-accent' : i < 3 ? 'bg-accent text-bg' : 'text-muted'}\`}>
            {day}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {[
          { name: "Squat", sets: "4 to'plam × 12 marta" },
          { name: "Bench press", sets: "4 to'plam × 10 marta" },
          { name: "Deadlift", sets: "3 to'plam × 8 marta" }
        ].map((ex, i) => (
          <div key={i} className="bg-surface border border-border rounded-[13px] p-3.5">
            <h3 className="text-vtext font-semibold text-[13px] mb-1">{ex.name}</h3>
            <p className="text-xs text-[#8888a0]">{ex.sets}</p>
          </div>
        ))}
      </div>

      <button className="w-full bg-accent text-bg font-semibold text-[13px] py-3 rounded-xl shadow-[0_0_18px_rgba(232,255,71,0.25)] mt-4">
        Mashqni tugatish ✅
      </button>
    </div>
  );
}`,
  'food/page.tsx': `"use client";
export default function Food() {
  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[17px] text-vtext">Ovqat kundaligi</h1>
      <div className="bg-surface border border-border rounded-[13px] p-3.5">
         <input type="text" placeholder="Nima yedingiz?" className="w-full bg-surface2 border border-border rounded-xl p-3 text-xs text-vtext outline-none" />
      </div>
      <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-3.5 flex justify-between items-center">
         <div>
            <div className="text-[13px] text-vtext font-semibold">O'zbek oshi</div>
            <div className="text-[10px] font-mono text-muted">540 kcal</div>
         </div>
         <button className="w-8 h-8 rounded-lg bg-accent text-bg flex items-center justify-center font-bold">+</button>
      </div>
    </div>
  );
}`,
  'top/page.tsx': `"use client";
export default function Top() {
  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[17px] text-vtext">Haftalik reyting</h1>
      <div className="bg-surface border border-border rounded-[13px] overflow-hidden">
        {[
          { name: "Nilufar Mirzaeva", pos: "🥇", score: 3120 },
          { name: "Kamola Voxidova", pos: "🥈", score: 2890 },
          { name: "Siz", pos: "🥉", score: 2340, active: true },
          { name: "Doniyor Raxmonov", pos: "4", score: 1950 }
        ].map((m, i) => (
          <div key={i} className={\`flex justify-between items-center p-3.5 border-b border-[#15151f] \${m.active ? 'bg-[rgba(232,255,71,0.04)]' : ''}\`}>
             <div className="flex items-center gap-3">
               <span className="w-5 text-center text-sm">{m.pos}</span>
               <span className={\`text-[13px] \${m.active ? 'text-accent font-semibold' : 'text-vtext'}\`}>{m.name}</span>
             </div>
             <span className="font-mono text-[10px] text-muted">{m.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  'profile/page.tsx': `"use client";
import { useState } from "react";
import { Avatar, Panel } from "@/components/vf";

export default function Profile() {
  const [tab, setTab] = useState("UMUMIY");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
         <Avatar initials="JT" size="lg" />
         <div>
            <h1 className="font-display font-bold text-[17px] text-vtext">Jasur Toshmatov</h1>
            <div className="mt-1 inline-flex bg-[rgba(232,255,71,0.12)] px-2.5 py-0.5 rounded-full text-[10px] font-mono text-accent">
               👑 DARAJA 4 · Professional
            </div>
         </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
         {['UMUMIY', 'TO\\'LOVLAR', 'ANALITIKA', 'BILDIRISHNOMA'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={\`whitespace-nowrap px-3 py-1.5 rounded-full text-[9px] font-mono tracking-widest \${tab === t ? 'bg-accent text-bg font-bold' : 'bg-surface2 border border-border text-[#8888a0]'}\`}>
               {t}
            </button>
         ))}
      </div>

      {tab === 'UMUMIY' && (
        <div className="space-y-4">
          <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-4 text-center">
             <div className="text-2xl mb-1">🔥</div>
             <div className="font-display font-bold text-[24px] text-vtext mb-1">14 kun</div>
             <div className="font-mono text-[10px] text-muted">Rekord: 21 kun</div>
          </div>
        </div>
      )}
      
      {tab === 'TO\\'LOVLAR' && (
        <Panel title="TO'LOV TARIXI">
          <div className="text-xs text-muted">Hali to'lovlar mavjud emas</div>
        </Panel>
      )}
    </div>
  );
}`,
  'chat/page.tsx': `"use client";
export default function Chat() {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -mx-4 px-4 pt-2">
       <h1 className="font-display font-bold text-[17px] text-vtext mb-4">🤖 AI Chat</h1>
       <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          <div className="self-start max-w-[85%] bg-surface border border-border rounded-[12px_12px_12px_4px] p-3 text-[12px] text-vtext">
             Salom, Jasur! Bugungi mashq bo'yicha yordam kerakmi?
          </div>
       </div>
       <div className="pt-3 border-t border-[#1a1a26] flex gap-2">
          <input type="text" placeholder="Savol yozing..." className="flex-1 bg-surface border border-border rounded-xl px-3 text-xs text-vtext outline-none" />
          <button className="bg-accent text-bg w-10 h-10 rounded-xl flex items-center justify-center font-bold">↑</button>
       </div>
    </div>
  );
}`
};
writeFiles(mobileBaseDir, mobileFiles);

console.log('All pages generated.');
