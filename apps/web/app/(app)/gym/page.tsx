"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";

const C = { card: "#13131c", border: "#1e1e2c", accent: "#e8ff47", text: "#efefeb", muted: "#52526a", red: "#ff5252", green: "#4dffb4", aDim: "#e8ff4712", aBd: "#e8ff4735", surface: "#0e0e14" };

const MEMBERS_MOCK = [
  { name: "Sardor A.", goal: "Chidamlilik", streak: 21, score: 94, trend: "+7%", risk: false },
  { name: "Jasur T.", goal: "Vazn yo'qotish", streak: 14, score: 87, trend: "+4%", risk: false },
  { name: "Doniyor U.", goal: "Mushak", streak: 9, score: 78, trend: "+3%", risk: false },
  { name: "Nilufar K.", goal: "Mushak o'stirish", streak: 7, score: 72, trend: "+2%", risk: false },
  { name: "Mohira B.", goal: "Sog'lom turmush", streak: 3, score: 61, trend: "-1%", risk: true },
];

export default function GymPage() {
  const { data: retention } = useQuery({ queryKey: ["gym", "retention"], queryFn: api.gym.retention });
  const [expanded, setExpanded] = useState<string | null>(null);
  const r = retention?.data;

  return (
    <div style={{ maxWidth: 800, animation: "fadeUp .4s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: C.text, marginBottom: 4 }}>SmartFit Tashkent</h1>
        <p style={{ color: C.muted, fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: 1 }}>IYUN 2025 · 5 FAOL A'ZO</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { l: "RETENTION", v: `${r?.retention_rate ?? 78}%`, d: "↑ +12% o'tgan oy", c: C.accent },
          { l: "AVG STREAK", v: "10.8", d: "↑ +3 kun", c: C.accent },
          { l: "CHURN RISK", v: "1 kishi", d: "Mohira B.", c: C.red },
          { l: "AVG SCORE", v: "78.4", d: "↑ +5.2 ball", c: C.green },
        ].map((k) => (
          <div key={k.l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px", borderLeft: `3px solid ${k.c}` }}>
            <div style={{ color: C.muted, fontSize: 9, fontFamily: "JetBrains Mono, monospace", letterSpacing: 2, marginBottom: 6 }}>{k.l}</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: k.c, marginBottom: 3 }}>{k.v}</div>
            <div style={{ fontSize: 10, color: k.c === C.red ? C.red : C.accent }}>{k.d}</div>
          </div>
        ))}
      </div>

      {/* AI Churn Alert */}
      <div style={{ background: `rgba(255,82,82,0.06)`, border: `1px solid rgba(255,82,82,0.25)`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ color: C.red, fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: 2, marginBottom: 4 }}>AI CHURN OGOHLANTIRISH</div>
            <p style={{ color: C.text, fontSize: 13, lineHeight: 1.6 }}>
              <strong>Mohira B.</strong> 3 kun kelmadi. Progress foto yuklamadi. Streak: 3 kun.
              Tavsiya: personal xabar yuboring + planini soddalashtiring.
            </p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ color: C.muted, fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: 2 }}>A'ZOLAR</div>
          <Link href="/gym/members" style={{ color: C.accent, fontSize: 12, textDecoration: "none" }}>Barchasi →</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MEMBERS_MOCK.map((m) => (
            <div key={m.name} onClick={() => setExpanded(expanded === m.name ? null : m.name)}
              style={{ background: C.card, border: `1px solid ${expanded === m.name ? C.aBd : m.risk ? "rgba(255,82,82,0.3)" : C.border}`, borderRadius: 12, padding: "13px 14px", cursor: "pointer", transition: "border-color .2s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: m.risk ? "rgba(255,82,82,0.15)" : C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: m.risk ? C.red : C.accent }}>
                    {m.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{m.name}</div>
                    <div style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>{m.goal} · {m.streak} kun streak 🔥</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 18, color: m.score >= 80 ? C.accent : m.score >= 65 ? "#5299ff" : C.red }}>{m.score}</div>
                  <div style={{ fontSize: 10, color: m.risk ? C.red : C.muted }}>{m.risk ? "⚠️ Risk" : "✓ Faol"}</div>
                </div>
              </div>
              {expanded === m.name && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {[
                    { l: "Trend", v: m.trend, c: m.trend[0] === "+" ? C.accent : C.red },
                    { l: "Score", v: m.score, c: C.text },
                    { l: "Holat", v: m.risk ? "Xavfli" : "Yaxshi", c: m.risk ? C.red : C.green },
                  ].map((d) => (
                    <div key={d.l} style={{ background: "#07070a", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                      <div style={{ color: C.muted, fontSize: 9, fontFamily: "JetBrains Mono, monospace", marginBottom: 3 }}>{d.l}</div>
                      <div style={{ color: d.c, fontWeight: 700, fontSize: 14 }}>{d.v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px" }}>
        <div style={{ color: C.muted, fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: 2, marginBottom: 14 }}>HAFTALIK FAOLLIK</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {[55, 75, 65, 95, 85, 80, 78].map((h, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", height: `${h}%`, background: i === 6 ? C.accent : "#1a1a26", borderRadius: "3px 3px 0 0", transition: "background .2s" }} />
              <span style={{ color: C.muted, fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}>{["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
