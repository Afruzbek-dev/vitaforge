import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PLANS = [
  { name: "Free", price: "$0", unit: "abadiy", desc: "Sinab ko'rish uchun", featured: false, features: ["5 AI chat / kun", "1 plan / oy", "Ovqat tracker", "Streak + ball", "—", "—", "—"], cta: "Hozir boshlash", href: "/register" },
  { name: "Starter", price: "$49", unit: "/oy", desc: "Kichik gym lar uchun", featured: false, features: ["20 AI chat / kun", "Haftalik plan", "100 a'zo", "Progress foto + AI", "Leaderboard", "1 trener", "Telegram Mini App"], cta: "Boshlash →", href: "/register" },
  { name: "Pro", price: "$99", unit: "/oy", desc: "O'suvchi gym lar", featured: true, features: ["Cheksiz AI chat", "Cheksiz plan", "500 a'zo", "Churn prediction AI", "5 trener akkaunt", "Haftalik hisobot", "Click/Payme"], cta: "Pro boshlash →", href: "/register" },
  { name: "Network", price: "$249", unit: "/oy", desc: "Ko'p filial, korporativ", featured: false, features: ["Cheksiz hamma", "White-label branding", "Custom domen", "API kirish", "Cheksiz trener", "24/7 priority support", "Custom AI tuning"], cta: "Demo so'rash →", href: "/register" },
];

const COMPARE = [
  { feature: "Maksimal a'zo", free: "1 (o'zi)", starter: "100", pro: "500", network: "Cheksiz" },
  { feature: "AI chat", free: "5/kun", starter: "20/kun", pro: "Cheksiz", network: "Cheksiz" },
  { feature: "AI plan yaratish", free: "1/oy", starter: "4/oy", pro: "Cheksiz", network: "Cheksiz" },
  { feature: "Progress foto AI", free: "✗", starter: "✓", pro: "✓", network: "✓" },
  { feature: "Churn prediction", free: "✗", starter: "✗", pro: "✓", network: "✓" },
  { feature: "Trener akkaunt", free: "✗", starter: "1", pro: "5", network: "Cheksiz" },
  { feature: "White-label", free: "✗", starter: "✗", pro: "✗", network: "✓" },
  { feature: "API", free: "✗", starter: "✗", pro: "✗", network: "✓" },
];

export default function PricingPage() {
  return (
    <div style={{ background: "#07070a", minHeight: "100vh", color: "#efefeb", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #1e1e2c" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#e8ff47", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#07070a" }}>Z</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#efefeb" }}>ZenFit</span>
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/login" style={{ color: "#52526a", fontSize: 13, textDecoration: "none", padding: "7px 14px" }}>Kirish</Link>
          <Link href="/register" style={{ background: "#e8ff47", color: "#07070a", borderRadius: 7, padding: "7px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Boshlash</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ color: "#e8ff47", fontFamily: "monospace", fontSize: 11, letterSpacing: 3, marginBottom: 10 }}>NARXLAR</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", marginBottom: 10 }}>Gym ingiz uchun to'g'ri plan</h1>
          <p style={{ color: "#52526a", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>Barcha tariflar 3 oy bepul pilot bilan boshlanadi. Kredit karta kerak emas.</p>
        </div>

        {/* Plans grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 48 }}>
          {PLANS.map((p) => (
            <div key={p.name} style={{ background: "#13131c", border: p.featured ? "2px solid #e8ff47" : "1px solid #1e1e2c", borderRadius: 16, padding: "24px 20px", position: "relative" }}>
              {p.featured && <span style={{ position: "absolute", top: 12, right: 12, fontSize: 9, background: "#e8ff4720", color: "#e8ff47", border: "1px solid #e8ff4740", borderRadius: 20, padding: "2px 8px", fontFamily: "monospace" }}>TAVSIYA</span>}
              <p style={{ color: "#52526a", fontSize: 10, fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>{p.name.toUpperCase()}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: p.featured ? "#e8ff47" : "#efefeb" }}>{p.price}</span>
                <span style={{ color: "#52526a", fontSize: 12 }}>{p.unit}</span>
              </div>
              <p style={{ color: "#52526a", fontSize: 12, marginBottom: 16 }}>{p.desc}</p>
              <div style={{ height: 1, background: "#1e1e2c", marginBottom: 16 }} />
              <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 20 }}>
                {p.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 12, color: f === "—" ? "#1e1e2c" : "#efefeb", padding: "5px 0", display: "flex", gap: 8 }}>
                    <span style={{ color: f === "—" ? "#1e1e2c" : "#4dffb4" }}>{f === "—" ? "·" : "✓"}</span>{f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", background: p.featured ? "#e8ff47" : "transparent", color: p.featured ? "#07070a" : "#efefeb", border: p.featured ? "none" : "1px solid #1e1e2c" }}>{p.cta}</Link>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div style={{ background: "#13131c", borderRadius: 16, border: "1px solid #1e1e2c", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e2c" }}>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#52526a" }}>Feature</th>
                <th style={{ textAlign: "center", padding: "12px 8px", color: "#52526a" }}>Free</th>
                <th style={{ textAlign: "center", padding: "12px 8px", color: "#52526a" }}>Starter</th>
                <th style={{ textAlign: "center", padding: "12px 8px", color: "#e8ff47" }}>Pro</th>
                <th style={{ textAlign: "center", padding: "12px 8px", color: "#52526a" }}>Network</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.feature} style={{ borderBottom: "1px solid #1e1e2c" }}>
                  <td style={{ padding: "10px 16px", color: "#efefeb" }}>{row.feature}</td>
                  {[row.free, row.starter, row.pro, row.network].map((v, i) => (
                    <td key={i} style={{ textAlign: "center", padding: "10px 8px", color: v === "✓" ? "#4dffb4" : v === "✗" ? "#52526a" : "#efefeb" }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
