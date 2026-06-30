"use client";
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
}