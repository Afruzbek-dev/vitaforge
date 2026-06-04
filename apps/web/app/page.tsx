import Link from "next/link";

const C = { bg: "#07070a", surface: "#0e0e14", card: "#13131c", border: "#1e1e2c", accent: "#e8ff47", text: "#efefeb", muted: "#52526a", red: "#ff5252", green: "#4dffb4", blue: "#5299ff" };

export default function LandingPage() {
  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>
      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-30%", right: "-10%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}07 0%, transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: "0%", left: "-20%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.blue}06 0%, transparent 65%)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.border} 1px, transparent 1px)`, backgroundSize: "40px 40px", opacity: 0.3 }} />
      </div>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", background: `${C.bg}f0`, backdropFilter: "blur(24px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700 }}>Z</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17 }}>ZenFit</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: C.muted, fontSize: 12, fontFamily: "monospace" }}>
            <span style={{ color: C.red }}>●</span> 7 ta joy qoldi
          </span>
          <Link href="/login" style={{ background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 14px", fontSize: 13, textDecoration: "none" }}>Kirish</Link>
          <Link href="/register" style={{ background: C.accent, color: C.bg, borderRadius: 7, padding: "8px 16px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Boshlash →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.accent}12`, border: `1px solid ${C.accent}35`, borderRadius: 20, padding: "5px 14px", marginBottom: 24 }}>
          <span style={{ color: C.accent, fontSize: 11, fontFamily: "monospace", letterSpacing: 2 }}>GYM EGALARI UCHUN · O'ZBEKISTON</span>
        </div>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 6.5vw, 68px)", lineHeight: 1.06, letterSpacing: -2, marginBottom: 20 }}>
          Gym a'zolari <span style={{ color: C.accent }}>3 oy ichida</span><br/>ketib qolishni to'xtatsin.
        </h1>

        <p style={{ color: C.muted, fontSize: "clamp(15px, 2vw, 18px)", maxWidth: 560, lineHeight: 1.75, marginBottom: 16 }}>
          O'rtacha gym <strong style={{ color: C.text }}>har oyda 30–40% a'zosini</strong> yo'qotadi.
          ZenFit har bir a'zoga AI shaxsiy trener va dietolog beradi —
          natijada ular <strong style={{ color: C.accent }}>2.8x uzoqroq</strong> qoladi.
        </p>

        <div style={{ background: `${C.red}10`, border: `1px solid ${C.red}30`, borderRadius: 10, padding: "12px 18px", marginBottom: 32, display: "inline-block" }}>
          <span style={{ color: C.muted, fontSize: 13 }}>💸 100 ta a'zo, 200K so'm/oy, 35% churn → </span>
          <strong style={{ color: C.red }}>Oyiga 7,000,000 so'm yo'qolmoqda</strong>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 48 }}>
          <Link href="/register" style={{ background: C.accent, color: C.bg, borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Bepul pilot boshlash →</Link>
          <Link href="/login" style={{ background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 24px", fontSize: 14, textDecoration: "none" }}>Kirish</Link>
        </div>

        {/* Scarcity bar */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", maxWidth: 420 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: C.muted, fontSize: 12 }}>Pilot dastur joylari</span>
            <span style={{ color: C.accent, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>7/10 qoldi</span>
          </div>
          <div style={{ height: 6, background: C.border, borderRadius: 3 }}>
            <div style={{ height: "100%", width: "30%", background: C.accent, borderRadius: 3 }} />
          </div>
          <p style={{ color: C.muted, fontSize: 11, marginTop: 8 }}>53 ta gym egasi ro'yxatda · Keyingi batch — 30 iyul</p>
        </div>
      </section>

      {/* Problem */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ color: C.red, fontFamily: "monospace", fontSize: 11, letterSpacing: 3, marginBottom: 10 }}>MUAMMO</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 38px)", letterSpacing: -1 }}>Nima uchun a'zolar ketib qoladi?</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {[
            { icon: "😶", title: "Hech kim kuzatmaydi", body: "Trener 50 kishini qo'lda kuzata olmaydi. A'zo o'zini unutilgandek his qiladi.", cost: "−40% retention" },
            { icon: "🥗", title: "Ovqat nazorati yo'q", body: "Mashq qiladi, lekin osh yeydi. Natija ko'rmaydi. 2 oyda umid uzadi.", cost: "−60% result rate" },
            { icon: "😴", title: "Motivatsiya o'chadi", body: "Birinchi hafta yonadi. Ikkinchi haftada sekinlashadi. Uchinchi haftada yo'q.", cost: "−35% active users" },
          ].map((p, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 20px", borderTop: `3px solid ${C.red}` }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{p.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{p.title}</div>
              <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.65, marginBottom: 12 }}>{p.body}</p>
              <div style={{ color: C.red, fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>{p.cost}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ color: C.accent, fontFamily: "monospace", fontSize: 11, letterSpacing: 3, marginBottom: 10 }}>YECHIM</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 38px)", letterSpacing: -1 }}>Har bir a'zo e'tibor olishni his qilsin</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {[
            { icon: "🤖", title: "AI Shaxsiy Trener", body: "Har bir a'zoga individual plan. Yoshi, vazni, maqsadiga qarab." },
            { icon: "🥗", title: "O'zbek Ovqat Tracker", body: "Osh, manti, shurpa — hammasi hisobda. Biz qurdik." },
            { icon: "📸", title: "Progress Foto AI", body: "Haftalik rasm — AI progress baholaydi. Ko'rgan odam qoladi." },
            { icon: "🏆", title: "Gamification", body: "Kuch ⚡ ballari, levellar, badge'lar. O'zbek mentalitetida raqobat." },
            { icon: "📊", title: "Churn Prediction", body: "Kim ketmoqchi — 2 hafta oldin bilasiz. AI signal beradi." },
            { icon: "💬", title: "AI Chat 24/7", body: "Soat 23:00 da savol — javob bor. Trener uxlaydi, AI uxlamaydi." },
          ].map((f, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 18px" }}>
              <span style={{ fontSize: 26 }}>{f.icon}</span>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginTop: 12, marginBottom: 8 }}>{f.title}</div>
              <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.65 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grand Slam Offer */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ background: C.card, border: `2px solid ${C.accent}35`, borderRadius: 20, padding: "36px 32px" }}>
          <p style={{ color: C.accent, fontFamily: "monospace", fontSize: 11, letterSpacing: 3, marginBottom: 10 }}>GRAND SLAM TAKLIF</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(22px, 4vw, 36px)", letterSpacing: -1, marginBottom: 10 }}>
            3 oy bepul. Natija bo'lmasa — hech narsa to'lamaysiz.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "24px 0" }}>
            {[
              "AI Personal Plan Generator", "Uzbek Food Database + Tracker",
              "Progress Photo Analysis", "Gym Leaderboard + Gamification",
              "Gym Owner Dashboard", "Churn Prediction AI",
            ].map((v) => (
              <div key={v} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ color: C.accent }}>✓</span><span>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
            <div>
              <div style={{ color: C.muted, fontSize: 12, textDecoration: "line-through" }}>2,000,000+ so'm/oy qiymat</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 42, color: C.accent }}>$80</span>
                <span style={{ color: C.muted, fontSize: 14 }}>/oy · Cheksiz a'zo</span>
              </div>
              <div style={{ color: C.green, fontSize: 12, marginTop: 4 }}>✓ 3 oy pilot — BEPUL</div>
            </div>
            <Link href="/register" style={{ background: C.accent, color: C.bg, borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Bepul boshlash →</Link>
          </div>

          <div style={{ background: `${C.green}10`, border: `1px solid ${C.green}30`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: C.muted }}>
            🛡️ <strong style={{ color: C.green }}>Kafolat:</strong> 3 oy ishlatdingiz, retention oshmadi — bir tiyin ham to'lamaysiz.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "48px 24px 72px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 40px)", letterSpacing: -1, marginBottom: 8 }}>7 ta joy qoldi.</h2>
        <p style={{ color: C.muted, fontSize: 15, marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>Keyingi batch — 30 iyul. Ro'yxatga kiring.</p>
        <Link href="/register" style={{ background: C.accent, color: C.bg, borderRadius: 12, padding: "16px 40px", fontSize: 16, fontWeight: 700, textDecoration: "none" }}>Bepul 3 oy pilotni boshlash →</Link>
      </section>
    </div>
  );
}
