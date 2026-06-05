"use client";
import { useEffect, useRef } from "react";

interface Props {
  botName: string;
  onAuth: (user: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string; auth_date: number; hash: string }) => void;
}

export default function TelegramLoginButton({ botName, onAuth }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Global callback
    (window as any).onTelegramAuth = (user: any) => onAuth(user);

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    if (ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(script);
    }

    return () => { delete (window as any).onTelegramAuth; };
  }, [botName, onAuth]);

  return <div ref={ref} className="flex justify-center" />;
}
