"use client";
import { Button } from "@/components/ui/button";

interface Props {
  botName: string;
  onAuth: (user: any) => void;
}

export default function TelegramLoginButton({ botName, onAuth }: Props) {
  // Use bot deep link — user opens bot, bot sends auth code back
  const startAuth = () => {
    const authId = Math.random().toString(36).slice(2, 10);
    localStorage.setItem("tg_auth_id", authId);
    // Open bot with auth parameter
    window.open(`https://t.me/${botName}?start=auth_${authId}`, "_blank");
    // Poll for auth completion
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/telegram-check?auth_id=${authId}`);
        const data = await res.json();
        if (data.success && data.user) {
          clearInterval(interval);
          onAuth(data);
        }
      } catch {}
    }, 2000); // Check every 2 seconds
    // Stop polling after 60 seconds
    setTimeout(() => clearInterval(interval), 60000);
  };

  return (
    <Button variant="outline" onClick={startAuth} className="w-full gap-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.534.26l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/></svg>
      Telegram orqali kirish
    </Button>
  );
}
