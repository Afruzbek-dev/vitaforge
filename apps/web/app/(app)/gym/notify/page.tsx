"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

const BOT_TOKEN = process.env.NEXT_PUBLIC_TG_BOT_TOKEN ?? "";

export default function NotifyPage() {
  const sb = getSupabase();
  const [target, setTarget] = useState("all");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  const send = async () => {
    setSending(true);
    setResult("");
    const user = await getUser();
    const { data: me } = await sb.from("users").select("gym_id, full_name").eq("id", user!.id).single();

    // Get target members with telegram_id
    let q = sb.from("users").select("id, telegram_id, full_name").eq("gym_id", me?.gym_id).eq("role", "member").not("telegram_id", "is", null);

    if (target === "risk") {
      const { data: streaks } = await sb.from("member_streaks").select("member_id").lt("current_streak", 3);
      const riskIds = (streaks ?? []).map((s) => s.member_id);
      if (riskIds.length) q = q.in("id", riskIds);
      else { setResult("Risk guruhida a'zo yo'q"); setSending(false); return; }
    }

    const { data: members } = await q;
    if (!members?.length) { setResult("Telegram ulangan a'zo topilmadi"); setSending(false); return; }

    // Send via bot API
    let sent = 0;
    const text = `📢 *${me?.full_name ?? "Gym"}:*\n\n${message}`;
    for (const m of members) {
      try {
        const res = await fetch(`/api/telegram`, { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: { chat: { id: m.telegram_id }, text: `/notify ${text}`, from: { id: 0 } } }) });
        // Direct TG API call
        await fetch(`https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TG_BOT_TOKEN}/sendMessage`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: m.telegram_id, text, parse_mode: "Markdown" }),
        });
        sent++;
      } catch {}
    }

    setResult(`✅ ${sent}/${members.length} ta a'zoga yuborildi`);
    setSending(false);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">📢 Xabar yuborish</h1>
        <p className="text-muted text-xs font-mono mt-1">TELEGRAM ORQALI BULK NOTIFICATION</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Kimga?</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: "all", l: "Barchasi", icon: "👥" },
              { v: "active", l: "Faol", icon: "✅" },
              { v: "risk", l: "Xavfli", icon: "⚠️" },
            ].map((t) => (
              <button key={t.v} onClick={() => setTarget(t.v)}
                className={`p-3 rounded-lg border text-center text-sm transition ${target === t.v ? "border-accent bg-accent/5 text-accent" : "border-border text-muted"}`}>
                <span className="text-lg">{t.icon}</span>
                <p className="mt-1">{t.l}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Xabar</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Xabar matnini yozing..."
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-vtext resize-none focus:border-accent-border outline-none" />
          <Button onClick={send} disabled={sending || !message.trim()} className="w-full">
            {sending ? "Yuborilmoqda..." : "📩 Yuborish"}
          </Button>
          {result && <p className={`text-sm ${result.startsWith("✅") ? "text-vgreen" : "text-muted"}`}>{result}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
