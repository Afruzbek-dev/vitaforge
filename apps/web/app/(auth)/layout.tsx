export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden">
      {/* ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,255,71,0.06) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: "-20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(82,153,255,0.05) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#1e1e2c 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.4 }} />
      </div>

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
