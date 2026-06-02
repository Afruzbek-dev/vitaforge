"use client";
import { useState, useRef, useEffect } from "react";
import { DEMO_MODE } from "@/lib/api";

const C = { bg: "#07070a", card: "#13131c", surface: "#0e0e14", border: "#1e1e2c", accent: "#e8ff47", text: "#efefeb", muted: "#52526a", aDim: "#e8ff4712", aBd: "#e8ff4735" };

interface Message { role: "user" | "assistant"; content: string; }

const DEMO_RESPONSES: Record<string, string> = {
  default: "Savolingiz uchun rahmat! Fitness, ovqatlanish yoki motivatsiya haqida gapiraylik. Qanday maqsadingiz bor? 💪",
  ovqat: "Kuniga 2400 kkal iste'mol qiling.\n• Nonushta: 2 tuxum + non (390 kkal, P:22g)\n• Tushlik: shurpa + guruch (480 kkal, P:23g)\n• Kechki: tovuq + sabzavot (350 kkal, P:46g)\n\nProtein: 180g/kun. Suvni ko'proq iching! 🥗",
  vazn: "Vazn yo'qotish formulasi:\n✓ Kalori defitsiti: −300 kkal/kun\n✓ Protein: 2g/kg (siz uchun ~164g)\n✓ Kardio: 3x hafta, 30 daqiqa\n✓ Uyqu: 7–8 soat\n\nSiz uchun maqsad: −0.5kg/hafta. Tez yo'qotish mushak yo'qotish degani! 📉",
  mushak: "Mushak olish strategiyasi:\n✓ Kalori surplus: +300 kkal/kun\n✓ Protein: 2.2g/kg (siz uchun ~180g)\n✓ Kuch mashqlari: 4x hafta\n✓ Progressiv overload: har hafta og'irlikni oshiring\n✓ Uyqu: 8 soat — o'sish uxlayotganda bo'ladi! 💪",
  plan: "Sizning plani optimal tuzilgan:\n• Du/Pa/Ju: Kuch mashqlari (katta mushaklar)\n• Se: Kardio (chidamlilik)\n• Sh: Active recovery (yurish)\n• Ch/Ya: Dam olish\n\nEng muhim: to'g'ri ovqat! Mashq 20%, ovqat 80% ta'sir qiladi. 📋",
  streak: "7 kunlik streak — ajoyib! 🔥\nKeyingi milestone: 14 kun = STREAK badge!\n\nMaslahat: har kuni kamida 5 daqiqa qiling — yurib bo'lsa ham. Zanjirni uzmaslik asosiy qoida. Davom eting! ⚡",
};

function getDemoResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("ovqat") || lower.includes("kkal") || lower.includes("osh") || lower.includes("kaloriya")) return DEMO_RESPONSES.ovqat;
  if (lower.includes("vazn") || lower.includes("oriq") || lower.includes("semiz")) return DEMO_RESPONSES.vazn;
  if (lower.includes("mushak") || lower.includes("kuch")) return DEMO_RESPONSES.mushak;
  if (lower.includes("plan") || lower.includes("mashq") || lower.includes("squat")) return DEMO_RESPONSES.plan;
  if (lower.includes("streak") || lower.includes("ball") || lower.includes("motivat")) return DEMO_RESPONSES.streak;
  return DEMO_RESPONSES.default;
}

const PROMPTS = ["Osh necha kaloriya?", "Squat texnikasi", "Bugungi plan", "Motivatsiya ber!"];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Salom! Men VitaForge AI treneringizman 💪\nOvqat, mashq yoki motivatsiya haqida so'rang." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    const response = getDemoResponse(msg);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    let i = 0;
    const interval = setInterval(() => {
      i += 4;
      setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: response.slice(0, i) }; return u; });
      if (i >= response.length) { clearInterval(interval); setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: response }; return u; }); setLoading(false); }
    }, 20);
  };

  return (
    <div style={{ height: "calc(100vh - 48px)", display: "flex", flexDirection: "column", maxWidth: 700, animation: "fadeUp .4s ease" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#efefeb", marginBottom: 3 }}>AI Trener 🤖</h1>
        <p style={{ color: C.muted, fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: 1 }}>OVQAT · MASHQ · MOTIVATSIYA · 24/7</p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 10, paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%",
              background: m.role === "user" ? C.accent : C.card,
              color: m.role === "user" ? C.bg : C.text,
              border: m.role === "assistant" ? `1px solid ${C.border}` : "none",
              borderRadius: m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
              padding: "10px 14px", fontSize: 13, lineHeight: 1.65,
              fontWeight: m.role === "user" ? 600 : 400,
              whiteSpace: "pre-wrap",
              fontFamily: m.role === "user" ? "DM Sans, sans-serif" : "DM Sans, sans-serif",
            }}>
              {m.content || <span style={{ animation: "blink 1s infinite", opacity: 0.5 }}>▌</span>}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.content === "" && (
          <div style={{ display: "flex", gap: 5, padding: "10px 14px" }}>
            {[0, 1, 2].map((j) => <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted, animation: `blink 1.2s ${j * 0.2}s ease infinite` }} />)}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {PROMPTS.map((p) => (
          <button key={p} onClick={() => send(p)} style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 14, padding: "5px 12px", fontSize: 11, cursor: "pointer" }}>{p}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Savol yozing..." disabled={loading}
          style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 14px", color: C.text, fontSize: 13, outline: "none", fontFamily: "DM Sans, sans-serif" }}
          onFocus={(e) => (e.target.style.borderColor = C.aBd)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          style={{ background: C.accent, color: C.bg, border: "none", borderRadius: 10, padding: "11px 16px", fontSize: 17, cursor: "pointer", opacity: (loading || !input.trim()) ? 0.5 : 1 }}>
          ↑
        </button>
      </div>
    </div>
  );
}
