"use client";
import { useEffect, useRef } from "react";

interface Props {
  onAuth: (data: any) => void;
  botName?: string;
}

const CLIENT_ID = "8990371331";

export default function TelegramLoginButton({ onAuth }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Telegram Login SDK
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-login.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (!(window as any).Telegram?.Login) return;
      (window as any).Telegram.Login.init({ client_id: CLIENT_ID, request_access: ["write"] }, (data: any) => {
        if (data.error) return;
        onAuth(data);
      });
    };

    return () => { script.remove(); };
  }, []);

  const handleClick = () => {
    if ((window as any).Telegram?.Login) {
      (window as any).Telegram.Login.auth({ client_id: CLIENT_ID, request_access: ["write"] }, (data: any) => {
        if (data && !data.error) onAuth(data);
      });
    }
  };

  return (
    <button onClick={handleClick} type="button"
      className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-surface text-vtext text-sm font-medium hover:border-accent-border transition">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#29B6F6"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.534.26l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/></svg>
      Telegram orqali kirish
    </button>
  );
}
