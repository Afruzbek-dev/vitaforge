"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Phone, CheckCircle, ShieldAlert, Award } from "lucide-react";

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
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
          notificationOccurred: (type: "error" | "success" | "warning") => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}

export default function TelegramAutoAuth() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [status, setStatus] = useState<"idle" | "loading" | "register_form" | "done">("idle");
  const [regData, setRegData] = useState({
    telegram_id: "",
    name: "",
    username: "",
    phone: "",
    role: "member"
  });
  const [error, setError] = useState("");

  const triggerHaptic = (style: "light" | "medium" | "heavy" = "medium") => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
    } catch {}
  };

  const triggerNotif = (type: "success" | "error" | "warning") => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
    } catch {}
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) return;

    // Expand Mini App
    try {
      tg.ready();
      tg.expand();
    } catch {}

    // Already logged in locally
    const existingToken = localStorage.getItem("access_token");
    const existingUser = localStorage.getItem("zenfit_user");
    if (existingToken && existingUser) {
      try {
        const user = JSON.parse(existingUser);
        setAuth(user, existingToken);
        router.push(user.role === "member" ? "/dashboard" : "/gym");
        return;
      } catch {}
    }

    // Auto login check
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
          setStatus("done");
          triggerNotif("success");
          router.push(data.user?.role === "member" ? "/dashboard" : "/gym");
        } else if (data.register_required) {
          setRegData({
            telegram_id: data.telegram_id || "",
            name: data.name || "",
            username: data.username || "",
            phone: "",
            role: "member"
          });
          setStatus("register_form");
        } else {
          setStatus("idle");
        }
      })
      .catch(() => setStatus("idle"));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic("heavy");
    if (!regData.name || !regData.phone) {
      setError("Iltimos, ism va telefon raqamingizni kiriting.");
      triggerNotif("error");
      return;
    }

    setError("");
    setStatus("loading");

    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData || "";

    try {
      const res = await fetch("/api/telegram-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData,
          register: true,
          name: regData.name,
          phone: regData.phone,
          role: regData.role
        }),
      });

      const data = await res.json();
      if (data.success && data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("zenfit_user", JSON.stringify(data.user));
        setAuth(data.user, data.access_token);
        setStatus("done");
        triggerNotif("success");
        router.push(data.user?.role === "member" ? "/dashboard" : "/gym");
      } else {
        setError(data.error || "Ro'yxatdan o'tishda xatolik.");
        setStatus("register_form");
        triggerNotif("error");
      }
    } catch {
      setError("Server bilan aloqa uzildi.");
      setStatus("register_form");
      triggerNotif("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0F0F14] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#6366F1] flex items-center justify-center font-bold text-white text-2xl mx-auto animate-bounce shadow-lg shadow-[#6366F1]/30">
            Z
          </div>
          <p className="text-[#9CA3AF] text-sm font-medium animate-pulse">ZenFit yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (status === "register_form") {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0F0F14] overflow-y-auto px-6 py-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] mx-auto shadow-sm">
              <Award size={24} />
            </div>
            <h2 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Xush kelibsiz!</h2>
            <p className="text-[#9CA3AF] text-xs uppercase tracking-wider font-semibold">ZenFit-da ro'yxatdan o'tish</p>
          </div>

          <form onSubmit={handleRegister} className="bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-semibold">To'liq ism</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#9CA3AF]"><User size={16} /></span>
                <Input
                  id="name"
                  type="text"
                  required
                  value={regData.name}
                  onChange={(e) => setRegData(p => ({ ...p, name: e.target.value }))}
                  className="pl-10 rounded-xl bg-[#22222F] border-[#2D2D3D] text-[#F9FAFB] placeholder-[#9CA3AF]/45 focus:border-[#6366F1] focus:ring-0"
                  placeholder="Ism va familiyangiz"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-semibold">Telefon raqam</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#9CA3AF]"><Phone size={16} /></span>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={regData.phone}
                  onChange={(e) => setRegData(p => ({ ...p, phone: e.target.value }))}
                  className="pl-10 rounded-xl bg-[#22222F] border-[#2D2D3D] text-[#F9FAFB] placeholder-[#9CA3AF]/45 focus:border-[#6366F1] focus:ring-0"
                  placeholder="+998 90 123 45 67"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-[#9CA3AF] font-semibold">Tizimdagi rolingiz</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "member", label: "Zal a'zosi" },
                  { value: "trainer", label: "Trener" },
                  { value: "gym_owner", label: "Zal egasi" },
                  { value: "admin", label: "Administrator" }
                ].map((roleOpt) => (
                  <button
                    key={roleOpt.value}
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setRegData(p => ({ ...p, role: roleOpt.value }));
                    }}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all text-center ${regData.role === roleOpt.value ? "border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]" : "border-[#2D2D3D] bg-[#22222F] text-[#9CA3AF] hover:border-[#6366F1]/30"}`}
                  >
                    {roleOpt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-[#EF4444] text-xs flex items-center gap-2">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white py-3 rounded-xl font-bold transition shadow-lg shadow-[#6366F1]/20">
              Boshlash <CheckCircle size={16} className="ml-2 inline" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
