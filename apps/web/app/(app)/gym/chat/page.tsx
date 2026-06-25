"use client";
import { useState, useEffect, useRef } from "react";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Send, Users, Sparkles } from "lucide-react";

interface Room { id: string; name: string; type: string; }
interface Msg { id: string; content: string; sender_id: string; created_at: string; sender_name?: string; }

const AI_SUGGESTIONS = [
  "Salom! Bugungi mashqqa tayyormisiz? 💪",
  "3 kun davomida kelmadingiz, yordam kerakmi?",
  "Yangi challenge boshlanmoqda — qo'shilasizmi?",
  "Haftalik natijalaringiz ajoyib! Davom eting 🔥",
];

export default function GymChatPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const sb = getSupabase();

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (user) setUserId(user.id);
      const { data } = await sb.from("chat_rooms").select("*").order("created_at");
      if (data && data.length > 0) {
        setRooms(data);
        setActiveRoom(data[0].id);
      }
    })();
  }, []);

  // Load messages on room change
  useEffect(() => {
    if (!activeRoom) return;
    (async () => {
      const { data } = await sb.from("chat_messages").select("*").eq("room_id", activeRoom).order("created_at");
      setMessages(data || []);
    })();
  }, [activeRoom]);

  // Realtime subscription
  useEffect(() => {
    if (!activeRoom) return;
    const channel = sb.channel(`room-${activeRoom}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${activeRoom}` },
        (payload) => { setMessages((prev) => [...prev, payload.new as Msg]); }
      ).subscribe();
    return () => { sb.removeChannel(channel); };
  }, [activeRoom]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || !activeRoom || !userId) return;
    setInput("");
    await sb.from("chat_messages").insert({ room_id: activeRoom, sender_id: userId, content: msg });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex animate-fadeUp">
      {/* Sidebar - rooms */}
      <div className={`${showSidebar ? "fixed inset-0 z-40 bg-bg" : "hidden"} md:relative md:block w-full md:w-64 border-r border-border flex-shrink-0`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-bold text-sm flex items-center gap-2"><Users size={16} />Guruhlar</h2>
          <button onClick={() => setShowSidebar(false)} className="md:hidden text-muted text-xs">Yopish</button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-3.5rem)]">
          {rooms.map((r) => (
            <button key={r.id} onClick={() => { setActiveRoom(r.id); setShowSidebar(false); }}
              className={`w-full text-left px-4 py-3 border-b border-border/50 text-sm transition-colors ${activeRoom === r.id ? "bg-surface text-accent" : "text-vtext hover:bg-surface/50"}`}>
              <div className="font-medium truncate">{r.name}</div>
              <div className="text-[10px] text-muted capitalize">{r.type}</div>
            </button>
          ))}
          {rooms.length === 0 && <p className="p-4 text-muted text-xs">Guruhlar yo&apos;q</p>}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center gap-3">
          <button onClick={() => setShowSidebar(true)} className="md:hidden text-muted"><Users size={18} /></button>
          <h3 className="font-medium text-sm truncate">{rooms.find((r) => r.id === activeRoom)?.name || "Chat"}</h3>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm ${m.sender_id === userId ? "bg-accent text-bg rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                {m.content}
                <div className={`text-[9px] mt-1 ${m.sender_id === userId ? "text-bg/60" : "text-muted"}`}>
                  {new Date(m.created_at).toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* AI suggestions */}
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto">
          <Sparkles size={14} className="text-accent shrink-0 mt-1" />
          {AI_SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => send(s)} className="px-2.5 py-1 rounded-full bg-surface border border-border text-[11px] text-muted hover:text-accent hover:border-accent/50 whitespace-nowrap shrink-0 transition-colors">
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Xabar yozing..." className="flex-1 px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border focus:border-accent outline-none text-sm" />
          <button onClick={() => send()} disabled={!input.trim()} className="p-2.5 rounded-[var(--radius-sm)] bg-accent text-bg disabled:opacity-40 press">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
