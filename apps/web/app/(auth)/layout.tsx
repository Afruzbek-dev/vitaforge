"use client";
import dynamic from "next/dynamic";

const TelegramAutoAuth = dynamic(() => import("@/components/telegram-auto-auth"), { ssr: false });

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative" style={{ background: "#07070a", color: "#efefeb" }}>
      <TelegramAutoAuth />
      <div className="w-full max-w-md p-8 rounded-2xl relative z-10" style={{ background: "#13131c", border: "1px solid #1e1e2c" }}>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#d5ff45", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Host Grotesk', sans-serif", fontWeight: 800, fontSize: 16, color: "#07070a" }}>Z</div>
            <span style={{ fontFamily: "'Host Grotesk', sans-serif", fontWeight: 800, fontSize: 20, color: "#efefeb" }}>ZenFit AI</span>
          </div>
          <p style={{ color: "#52526a", fontSize: 13 }}>AI fitness platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
