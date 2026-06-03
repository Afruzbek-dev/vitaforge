"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message { role: "user" | "assistant"; content: string; }

const RESPONSES: Record<string, string> = {
  default: "Savolingiz uchun rahmat! Fitness, ovqatlanish yoki motivatsiya haqida gapiraylik. 💪",
  ovqat: "Kuniga 2400 kkal:\n• Nonushta: 2 tuxum + non (390 kkal, P:22g)\n• Tushlik: shurpa + guruch (480 kkal, P:23g)\n• Kechki: tovuq + sabzavot (350 kkal, P:46g)\n\nProtein: 180g/kun. 🥗",
  vazn: "Vazn yo'qotish:\n✓ Kalori defitsiti: −300 kkal/kun\n✓ Protein: 2g/kg\n✓ Kardio: 3x hafta\n✓ Uyqu: 7–8 soat\n\nMaqsad: −0.5kg/hafta 📉",
  mushak: "Mushak olish:\n✓ Surplus: +300 kkal/kun\n✓ Protein: 2.2g/kg\n✓ Kuch: 4x hafta\n✓ Uyqu: 8 soat\n\nO'sish uxlayotganda bo'ladi! 💪",
  plan: "Sizning plan optimal:\n• Du/Pa/Ju: Kuch mashqlari\n• Se: Kardio\n• Sh: Active recovery\n• Ch/Ya: Dam\n\nMashq 20%, ovqat 80% ta'sir qiladi. 📋",
};

function getResponse(msg: string): string {
  const l = msg.toLowerCase();
  if (l.includes("ovqat") || l.includes("kkal") || l.includes("osh")) return RESPONSES.ovqat;
  if (l.includes("vazn") || l.includes("oriq")) return RESPONSES.vazn;
  if (l.includes("mushak") || l.includes("kuch")) return RESPONSES.mushak;
  if (l.includes("plan") || l.includes("mashq")) return RESPONSES.plan;
  return RESPONSES.default;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Salom! Men VitaForge AI treneringizman 💪\nOvqat, mashq yoki motivatsiya haqida so'rang." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || loading) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg }]);
    setLoading(true);
    const response = getResponse(msg);
    setMessages((p) => [...p, { role: "assistant", content: "" }]);
    let i = 0;
    const iv = setInterval(() => {
      i += 4;
      setMessages((p) => { const u = [...p]; u[u.length - 1] = { role: "assistant", content: response.slice(0, i) }; return u; });
      if (i >= response.length) { clearInterval(iv); setMessages((p) => { const u = [...p]; u[u.length - 1] = { role: "assistant", content: response }; return u; }); setLoading(false); }
    }, 20);
  };

  return (
    <div className="max-w-2xl h-[calc(100vh-3rem)] flex flex-col animate-fadeUp">
      <div className="mb-4">
        <h1 className="font-display font-bold text-2xl text-vtext">🤖 AI Trener</h1>
        <p className="text-muted text-xs font-mono mt-1">OVQAT · MASHQ · MOTIVATSIYA · 24/7</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-accent text-bg font-medium rounded-br-sm"
                : "bg-card border border-border text-vtext rounded-bl-sm"
            }`}>
              {m.content || <span className="animate-pulse text-muted">▌</span>}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex gap-1.5 flex-wrap mb-3">
        {["Osh necha kkal?", "Squat texnikasi", "Plan ko'rsat", "Motivatsiya!"].map((p) => (
          <Button key={p} variant="secondary" size="sm" onClick={() => send(p)} className="text-xs">{p}</Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Savol yozing..." disabled={loading} />
        <Button onClick={() => send()} disabled={loading || !input.trim()} size="icon">↑</Button>
      </div>
    </div>
  );
}
