"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("main");

  const tabs = [
    { id: "main", label: "UMUMIY" },
    { id: "pay", label: "TO'LOVLAR" },
    { id: "stats", label: "ANALITIKA" },
    { id: "alerts", label: "BILDIRISHNOMA" },
  ];

  const badges = [
    { icon: "✅", label: "Birinchi qadam", unlocked: true },
    { icon: "🔥", label: "7 kunlik olov", unlocked: true },
    { icon: "🗓️", label: "2 hafta jangchisi", unlocked: true },
    { icon: "🛡️", label: "30 kunlik temir", unlocked: false, hint: "16 kun qoldi" },
    { icon: "🤖", label: "AI do'sti", unlocked: true },
    { icon: "🌅", label: "Tong qahramoni", unlocked: false, hint: "5tadan 2tasi" },
    { icon: "⚖️", label: "Ozish ustasi", unlocked: true },
    { icon: "🏆", label: "Reyting yulduzi", unlocked: false, hint: "Top-3, 4 hafta" },
  ];

  return (
    <div className="animate-fadeIn pb-4 pt-[4px]">
      <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-[18px] text-center">
        <div className="w-[40px] h-[40px] rounded-[8px] mx-auto mb-[8px] bg-[rgba(232,255,71,0.15)] text-[#E8FF47] flex items-center justify-center font-display font-bold text-[14px]">
          JT
        </div>
        <div className="font-display font-bold text-[14px]">Jasur Tashkentov</div>
        <div className="text-[10px] text-[#8888a0] mt-[2px]">Pro reja · Powerhouse Gym</div>
        <div className="inline-flex items-center gap-[4px] mt-[8px] bg-[rgba(232,255,71,0.12)] px-[10px] py-[4px] rounded-full">
          <span className="text-[11px]">👑</span>
          <span className="text-[10px] text-[#E8FF47] font-mono tracking-tight">DARAJA 5 · Usta</span>
        </div>
      </div>

      <div className="flex gap-[6px] py-[10px] overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`font-mono text-[9px] tracking-[1px] px-[12px] py-[7px] rounded-full border shrink-0 transition-colors ${
              activeTab === t.id
                ? "bg-[#E8FF47] text-[#080810] border-[#E8FF47] font-bold"
                : "bg-[#13131c] border-[#1e1e2c] text-[#8888a0]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-1">
        {activeTab === "main" && (
          <div className="animate-fadeIn">
            {/* Streak Card */}
            <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-[14px] mb-[9px]">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-[8px]">
                  <span className="text-[22px]">🔥</span>
                  <div>
                    <div className="text-[14px] font-bold font-display">15</div>
                    <div className="text-[8px] text-[#8888a0]">kunlik streak</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-[#E8FF47] font-mono tracking-tight">REKORD</div>
                  <div className="text-[12px] font-semibold">21</div>
                </div>
              </div>
              <div className="flex justify-between mt-[10px]">
                {["D","S","C","P","J","S","Y"].map((d, i, arr) => (
                  <div key={i} className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-mono shrink-0 ${
                    i < 3 || i > 3 ? "bg-[#E8FF47] text-[#080810] font-bold" : "bg-[#1a1a26] text-muted"
                  } ${i === arr.length - 1 ? "shadow-[0_0_0_2px_rgba(232,255,71,0.4)]" : ""}`}>
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* Next Level */}
            <div className="m-card mb-[9px]">
              <div className="flex justify-between items-center mb-[6px]">
                <span className="font-mono text-[8px] tracking-[1px] text-muted m-0">KEYINGI DARAJAGACHA</span>
                <span className="font-mono text-[10px] text-[#E8FF47]">2340 / 2500</span>
              </div>
              <div className="h-[6px] bg-[#1a1a26] rounded-[4px] overflow-hidden">
                <div className="h-full bg-[#E8FF47] rounded-[4px]" style={{ width: "84%" }} />
              </div>
            </div>

            <div className="font-mono text-[8px] tracking-[1px] text-muted my-[10px]">YUTUQLAR</div>
            <div className="grid grid-cols-4 gap-[7px] mb-[9px]">
              {badges.map((b, i) => (
                <div key={i} className={`bg-surface border border-border rounded-[12px] p-[10px_3px_8px] flex flex-col items-center gap-[3px] text-center ${b.unlocked ? "" : "opacity-40 grayscale"}`}>
                  <span className="text-[17px]">{b.unlocked ? b.icon : "🔒"}</span>
                  <span className={`text-[7px] leading-[1.25] ${b.unlocked ? "text-[#c8c8d8]" : "text-muted"}`}>{b.label}</span>
                </div>
              ))}
            </div>

            <div className="m-card mt-[9px] flex justify-between items-center"><span className="text-[12px]">Maqsad</span><span className="text-[12px]">Vazn yo'qotish</span></div>
            <div className="m-card mt-[9px] flex justify-between items-center"><span className="text-[12px]">Treneri</span><span className="text-[12px]">Coach Aziz</span></div>
            <div className="m-card mt-[9px] flex justify-between items-center"><span className="text-[12px]">A'zo bo'lgan sana</span><span className="text-[12px]">12 fev, 2026</span></div>
            <button className="w-full border border-[#2a2a3a] text-[#EEEEE8] text-[12px] py-[11px] rounded-[12px] mt-[9px] text-center">Profilni tahrirlash</button>
          </div>
        )}

        {activeTab === "pay" && (
          <div className="animate-fadeIn">
            <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-[14px] flex justify-between items-center mb-[9px]">
              <div>
                <div className="text-[12px] font-semibold font-display">Pro reja</div>
                <div className="text-[10px] text-[#8888a0]">Oylik obuna</div>
              </div>
              <span className="font-mono text-[13px] text-[#E8FF47]">$69/oy</span>
            </div>
            <div className="m-card flex justify-between items-center mb-[9px]">
              <span className="text-[11px] text-[#8888a0]">Keyingi to'lov</span>
              <span className="text-[11px]">14 iyul, 2026</span>
            </div>

            <div className="font-mono text-[8px] tracking-[1px] text-muted my-[10px]">TO'LOV TARIXI</div>
            {[
              { date: "14 iyun 2026", status: "To'landi" },
              { date: "14 may 2026", status: "To'landi" },
              { date: "14 apr 2026", status: "To'landi" },
            ].map((p, i) => (
              <div key={i} className="m-card flex justify-between items-center mb-[9px]">
                <span className="text-[11px]">{p.date}</span>
                <div className="bg-[rgba(93,202,165,0.12)] text-[#5DCAA5] font-mono text-[10px] px-[9px] py-[4px] rounded-full">
                  {p.status}
                </div>
              </div>
            ))}
            <button className="w-full border border-[#2a2a3a] text-[#EEEEE8] text-[12px] py-[11px] rounded-[12px] mt-[9px] text-center">To'lov usulini o'zgartirish</button>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="animate-fadeIn">
            <div className="font-mono text-[8px] tracking-[1px] text-muted mb-[10px]">VAZN DINAMIKASI · 6 OY</div>
            <div className="flex items-end gap-[5px] h-[60px] mb-[6px]">
              {[58, 55, 52, 50, 48, 46].map((v, i) => (
                <div key={i} className={`flex-1 rounded-t-[4px] relative ${i === 5 ? "bg-[#E8FF47]" : "bg-[#1a1a26]"}`} style={{ height: `${v}%` }} />
              ))}
            </div>
            <div className="flex gap-[5px]">
              {["Yan","Fev","Mar","Apr","May","Iyun"].map((m, i) => (
                <span key={i} className="flex-1 text-center text-[7px] text-muted font-mono">{m}</span>
              ))}
            </div>

            <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-[14px] mt-[12px] mb-[9px]">
              <div className="text-[11px] text-[#c8c8d8] leading-[1.5]">
                📉 6 oyda <b className="text-[#E8FF47]">-7.2 kg</b>. Maqsadgacha 3.8 kg qoldi.
              </div>
            </div>

            <div className="m-card flex justify-between items-center mb-[9px]">
              <span className="text-[11px]">O'rtacha kunlik kaloriya</span>
              <span className="font-mono text-[11px]">1,790</span>
            </div>
            <div className="m-card flex justify-between items-center mb-[9px]">
              <span className="text-[11px]">Bajarilgan mashqlar</span>
              <span className="font-mono text-[11px]">38 / 42</span>
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="animate-fadeIn flex flex-col gap-[9px]">
            <div className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-[14px]">
              <div className="font-mono text-[11px] text-[#E8FF47] mb-[3px]">BUGUN</div>
              <div className="text-[12px] leading-[1.5]">🔥 15-kun streak! Top 10%dasiz.</div>
            </div>
            <div className="m-card">
              <div className="font-mono text-[11px] text-muted mb-[3px]">KECHA</div>
              <div className="text-[12px] leading-[1.5]">🤖 AI: Bugungi protein normangizga 18g qoldi.</div>
            </div>
            <div className="m-card">
              <div className="font-mono text-[11px] text-muted mb-[3px]">2 KUN OLDIN</div>
              <div className="text-[12px] leading-[1.5]">💪 Coach Aziz yangi haftalik plan yukladi.</div>
            </div>
            <div className="m-card">
              <div className="font-mono text-[11px] text-muted mb-[3px]">5 KUN OLDIN</div>
              <div className="text-[12px] leading-[1.5]">💳 To'lov muvaffaqiyatli amalga oshirildi — $69.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
