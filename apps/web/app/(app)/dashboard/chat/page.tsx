"use client";
import { useState, useEffect, useRef } from "react";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Send, MessageCircle } from "lucide-react";

interface Room { id: string; name: string; type: string; }
interface Msg { id: string; content: string; sender_id: string; created_at: string; }

export default function MemberChatPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState("");
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

  useEffect(() => {
    if (!activeRoom) return;
    (async () => {
      const { data } = await sb.from("chat_messages").select("*").eq("room_id", activeRoom).order("created_at");
      setMessages(data || []);
    })();
  }, [activeRoom]);

  // Realtime
  useEffect(() => {
    if (!activeRoom) return;
    const channel = sb.channel(`member-room-${activeRoom}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${activeRoom}` },
        (payload) => { setMessages((prev) => [...prev, payload.new as Msg]); }
      ).subscribe();
    return () => { sb.removeChannel(channel); };
  }, [activeRoom]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !activeRoom || !userId) return;
    const msg = input;
    setInput("");
    await sb.from("chat_messages").insert({ room_id: activeRoom, sender_id: userId, content: msg });
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-6rem)] md:h-[calc(100vh-3rem)] flex flex-col animate-fadeUp">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <MessageCircle className="text-accent" size={20} />
        <h1 className="font-display font-bold text-lg">Chat</h1>
      </div>

      {/* Room tabs */}
      {rooms.length > 1 && (
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
          {rooms.map((r) => (
            <button key={r.id} onClick={() => setActiveRoom(r.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeRoom === r.id ? "bg-accent text-bg" : "bg-surface border border-border text-muted"}`}>
              {r.name}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted text-sm">Xabarlar yo&apos;q</div>
        )}
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

      {/* Input */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Xabar yozing..." className="flex-1 px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border focus:border-accent outline-none text-sm" />
        <button onClick={send} disabled={!input.trim()} className="p-2.5 rounded-[var(--radius-sm)] bg-accent text-bg disabled:opacity-40 press">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
