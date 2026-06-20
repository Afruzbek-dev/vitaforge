"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatWithAI } from "@/lib/ai";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

interface Message { role: "user" | "assistant"; content: string; }

const PROMPTS = ["Osh necha kkal?", "Squat texnikasi", "Bugungi plan", "Motivatsiya!"];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const endRef = useRef<HTMLDivElement>(null);
  const sb = getSupabase();

  // Load chat history
  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (!user) return;
      // Get latest session
      const { data } = await sb.from("chat_messages").select("session_id").eq("member_id", user.id).order("created_at", { ascending: false }).limit(1).single();
      const sid = data?.session_id ?? crypto.randomUUID();
      setSessionId(sid);
      // Load messages
      const { data: msgs } = await sb.from("chat_messages").select("role,content").eq("session_id", sid).order("created_at", { ascending: true });
      if (msgs && msgs.length > 0) {
        setMessages(msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
      } else {
        setMessages([{ role: "assistant", content: "Salom! Men ZenFit AI treneringizman 💪\nOvqat, mashq yoki motivatsiya haqida so'rang." }]);
      }
    })();
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const saveMsg = async (role: string, content: string) => {
    const user = await getUser();
    if (!user || !sessionId) return;
    await sb.from("chat_messages").insert({ member_id: user.id, session_id: sessionId, role, content });
  };

  const send = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || loading) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg }]);
    await saveMsg("user", msg);
    setLoading(true);

    try {
      const history = messages.slice(-10).concat([{ role: "user", content: msg }]).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
      const response = await chatWithAI(history);
      setMessages((p) => [...p, { role: "assistant", content: response }]);
      await saveMsg("assistant", response);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Xatolik yuz berdi. Qayta urinib ko'ring." }]);
    }
    setLoading(false);
  };

  const newSession = () => { setSessionId(crypto.randomUUID()); setMessages([{ role: "assistant", content: "Yangi suhbat boshlandi! Nima so'raysiz? 💪" }]); };

  return (
    <div className="max-w-lg md:max-w-2xl mx-auto h-[calc(100vh-6rem)] md:h-[calc(100vh-3rem)] flex flex-col animate-fadeUp">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-vtext">🤖 AI Trener</h1>
          <p className="text-muted text-[10px] font-mono mt-0.5">GROQ · LLAMA 3.3</p>
        </div>
        <Button variant="ghost" size="sm" onClick={newSession} className="text-xs">+ Yangi</Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-accent text-bg font-medium rounded-br-sm" : "bg-card border border-border text-vtext rounded-bl-sm"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5">{[0, 1, 2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}</div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-1.5 flex-wrap mb-2">
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
