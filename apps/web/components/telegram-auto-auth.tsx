"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: any;
        themeParams: any;
      };
    };
  }
}

export default function TelegramAutoAuth() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) return;

    // Already logged in
    const existingToken = localStorage.getItem("access_token");
    const existingUser = localStorage.getItem("zenfit_user");
    if (existingToken && existingUser) {
      try {
        const user = JSON.parse(existingUser);
        setAuth(user, existingToken);
        tg.ready();
        tg.expand();
        router.push(user.role === "member" ? "/dashboard" : "/gym");
        return;
      } catch {}
    }

    // Auto login via initData
    setStatus("loading");
    fetch("/api/telegram-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg.initData }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("zenfit_user", JSON.stringify(data.user));
          setAuth(data.user, data.access_token);
          tg.ready();
          tg.expand();
          setStatus("done");
          router.push(data.user?.role === "member" ? "/dashboard" : "/gym");
        } else {
          setStatus("idle");
        }
      })
      .catch(() => setStatus("idle"));
  }, []);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#07070a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#d5ff45] flex items-center justify-center font-bold text-[#07070a] text-xl mx-auto animate-pulse">Z</div>
          <p className="text-[#6b6b80] text-sm">Telegram orqali kirish...</p>
        </div>
      </div>
    );
  }

  return null;
}
