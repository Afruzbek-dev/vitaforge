"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatWithAI } from "@/lib/ai";

interface Message { role: "user" | "assistant"; content: string; }

const PROMPTS = ["Osh necha kkal?", "Squat texnikasi", "Bugungi plan", "Motivatsiya!"];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Salom! Men ZenFit AI treneringizman 💪\nOvqat, mashq yoki motivatsiya haqida so'rang." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: msg };
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    try {
      const history = [...messages.slice(1), userMsg].map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
      const response = await chatWithAI(history);
      setMessages((p) => [...p, { role: "assistant", content: response }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Xatolik yuz berdi. Qayta urinib ko'ring." }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl h-[calc(100vh-3rem)] flex flex-col animate-fadeUp">
      <div className="mb-4">
        <h1 className="font-display font-bold text-2xl text-vtext">🤖 AI Trener</h1>
        <p className="text-muted text-xs font-mono mt-1">GROQ · LLAMA 3.3 · REAL-TIME</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-accent text-bg font-medium rounded-br-sm"
                : "bg-card border border-border text-vtext rounded-bl-sm"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-1.5 flex-wrap mb-3">
        {PROMPTS.map((p) => (
          <Button key={p} variant="secondary" size="sm" onClick={() => send(p)} className="text-xs" disabled={loading}>{p}</Button>
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
