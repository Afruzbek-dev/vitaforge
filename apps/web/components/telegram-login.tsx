"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  onAuth: (data: any) => void;
  botName?: string;
}

export default function TelegramLoginButton({ onAuth, botName = "zenfituzbot" }: Props) {
  const [waiting, setWaiting] = useState(false);

  const handleClick = () => {
    setWaiting(true);
    const authId = Math.random().toString(36).slice(2, 10);
    localStorage.setItem("tg_auth_id", authId);

    // Bot ga yo'naltirish — user tasdiqlaydi
    window.open(`https://t.me/${botName}?start=auth_${authId}`, "_blank");

    // Poll — bot auth qilganda tekshirish
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/telegram-check?auth_id=${authId}`);
        const data = await res.json();
        if (data.success && data.user) {
          clearInterval(interval);
          setWaiting(false);
          onAuth(data);
        }
      } catch {}
    }, 2500);

    setTimeout(() => { clearInterval(interval); setWaiting(false); }, 90000);
  };

  return (
    <Button variant="outline" type="button" onClick={handleClick} disabled={waiting} className="w-full gap-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#29B6F6"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.534.26l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/></svg>
      {waiting ? "Telegram da tasdiqlang..." : "Telegram orqali kirish"}
    </Button>
  );
}
