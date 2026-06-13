"use client";
import { useEffect, useRef } from "react";

interface Props {
  onAuth: (user: any) => void;
  botName?: string;
}

export default function TelegramLoginButton({ onAuth, botName = "zenfituzbot" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set global callback
    (window as any).onTelegramAuth = (user: any) => onAuth(user);

    // Create widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?23";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    if (ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(script);
    }

    return () => { delete (window as any).onTelegramAuth; };
  }, [botName, onAuth]);

  return <div ref={ref} className="flex justify-center my-2" />;
}
