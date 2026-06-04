import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-bg text-vtext font-body min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-bg/90 backdrop-blur-xl border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-display font-bold text-bg">Z</div>
          <span className="font-display font-bold text-lg">ZenFit</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted">
          <a href="#features" className="hover:text-vtext transition">Xizmatlar</a>
          <a href="#pricing" className="hover:text-vtext transition">Narxlar</a>
          <a href="#about" className="hover:text-vtext transition">Haqida</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted hover:text-vtext transition hidden sm:block">Kirish</Link>
          <Link href="/register" className="bg-accent text-bg text-sm font-bold px-4 py-2 rounded-lg hover:bg-accent/90 transition">Boshlash →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-accent text-xs font-mono tracking-wider">200+ FAOL A'ZOLAR</span>
        </div>
        <h1 className="font-display font-bold text-[clamp(36px,7vw,72px)] leading-[1.05] tracking-tight mb-6">
          HAQIQIY <span className="text-accent">SALOHIYATINGIZNI</span><br className="hidden sm:block" /> OCHING
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Har bir gym a'zosiga AI shaxsiy trener va dietolog. Professional plan, ovqat kuzatuv, va real-time progress tracking.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/register" className="bg-accent text-bg font-bold px-8 py-3.5 rounded-xl text-base hover:bg-accent/90 transition shadow-lg shadow-accent/20">
            Bepul boshlash →
          </Link>
          <Link href="/pricing" className="border border-border text-vtext px-8 py-3.5 rounded-xl text-base hover:border-accent/40 transition">
            Narxlarni ko'rish
          </Link>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { value: "59%", label: "Natijaga erishdi" },
            { value: "620+", label: "Sportchilar" },
            { value: "2.8x", label: "Ko'proq qoldi" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display font-bold text-2xl md:text-3xl text-accent">{s.value}</p>
              <p className="text-muted text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-accent text-xs font-mono tracking-widest mb-3">XIZMATLAR</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl">Sizga kerak bo'lgan hamma narsa</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "📋", title: "AI Shaxsiy Plan", items: ["Maqsadga asoslangan haftalik plan", "Mashq + Ovqat ratsion", "Kunlik tracker"] },
            { icon: "🥗", title: "O'zbek Ovqat Tracker", items: ["200+ mahalliy ovqat DB", "AI bilan kaloriya hisoblash", "Haftalik nutrition hisobot"] },
            { icon: "📊", title: "Smart Analytics", items: ["Gym retention dashboard", "Churn prediction AI", "Real-time member faollik"] },
          ].map((s) => (
            <div key={s.title} className="bg-card border border-border rounded-2xl p-6 hover:border-accent/30 transition group">
              <span className="text-3xl">{s.icon}</span>
              <h3 className="font-display font-bold text-base mt-4 mb-3 group-hover:text-accent transition">{s.title}</h3>
              <ul className="space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="text-muted text-sm flex gap-2"><span className="text-accent">✓</span>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-accent text-xs font-mono tracking-widest mb-3">AFZALLIKLAR</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl">Nima uchun ZenFit?</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: "⚡ Kuch System", desc: "Gamification: balllar, levellar (Shogird → Sohibqiron), badge'lar. A'zolar raqobat qiladi." },
            { title: "🤖 AI 24/7", desc: "Real AI trener. Ovqat parse, plan yaratish, motivatsiya — bir soniyada javob beradi." },
            { title: "📱 Mobile-first", desc: "Telegram Mini App yoki web — istalgan qurilmada ishlaydi. Tez va qulay." },
            { title: "📈 Gym Owner Panel", desc: "Retention, churn prediction, a'zolar boshqaruvi — bitta dashboard da." },
          ].map((w) => (
            <div key={w.title} className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display font-bold text-base mb-2">{w.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-accent text-xs font-mono tracking-widest mb-3">NARXLAR</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl">Maqsadingizga mos plan</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { name: "Free", price: "$0", unit: "abadiy", desc: "Sinab ko'rish", features: ["5 AI chat/kun", "1 plan/oy", "Ovqat tracker", "Streak system"], featured: false },
            { name: "Starter", price: "$49", unit: "/oy", desc: "Kichik gym", features: ["100 a'zo", "20 AI chat/kun", "Haftalik plan", "Progress foto AI", "1 trener"], featured: false },
            { name: "Pro", price: "$99", unit: "/oy", desc: "O'suvchi gym", features: ["500 a'zo", "Cheksiz AI", "Churn prediction", "5 trener", "Haftalik hisobot"], featured: true },
            { name: "Network", price: "$249", unit: "/oy", desc: "Korporativ", features: ["Cheksiz a'zo", "White-label", "API kirish", "Custom AI", "24/7 support"], featured: false },
          ].map((p) => (
            <div key={p.name} className={`rounded-2xl p-6 border ${p.featured ? "bg-accent/5 border-accent/40" : "bg-card border-border"} relative`}>
              {p.featured && <span className="absolute top-4 right-4 text-[9px] font-mono bg-accent/20 text-accent border border-accent/30 rounded-full px-2 py-0.5">TAVSIYA</span>}
              <p className="text-muted text-[10px] font-mono tracking-widest mb-1">{p.name.toUpperCase()}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`font-display font-bold text-3xl ${p.featured ? "text-accent" : ""}`}>{p.price}</span>
                <span className="text-muted text-xs">{p.unit}</span>
              </div>
              <p className="text-muted text-xs mb-4">{p.desc}</p>
              <div className="h-px bg-border mb-4" />
              <ul className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="text-xs text-muted flex gap-2"><span className="text-vgreen">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/register" className={`block text-center py-2.5 rounded-lg text-xs font-bold transition ${p.featured ? "bg-accent text-bg" : "border border-border text-vtext hover:border-accent/40"}`}>
                {p.name === "Free" ? "Boshlash" : "Tanlash →"}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-muted text-xs mt-6">💡 Barcha tariflar 3 oy bepul pilot bilan. Kredit karta kerak emas.</p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl">Ko'p beriladigan savollar</h2>
        </div>
        <div className="space-y-3">
          {[
            { q: "Bu kim uchun?", a: "Gym egalar, trenerlar va gym a'zolari uchun. Retention muammosini AI bilan hal qilamiz." },
            { q: "Qanday ishlaydi?", a: "Gym owner a'zolarini qo'shadi, har bir a'zo AI dan shaxsiy plan oladi, progress kuzatiladi." },
            { q: "Bepul versiya bormi?", a: "Ha! Free plan da AI chat (5/kun), 1 plan/oy, ovqat tracker va streak bor." },
            { q: "O'zbek ovqatlari bormi?", a: "Ha, 200+ mahalliy ovqat (osh, shurpa, manti, kabob...) bazamizda bor." },
            { q: "Qanday boshlash mumkin?", a: "Register → Profil to'ldirish → AI plan olish. 2 daqiqada tayyor." },
          ].map((faq) => (
            <details key={faq.q} className="group bg-card border border-border rounded-xl">
              <summary className="flex justify-between items-center p-4 cursor-pointer text-sm font-medium">
                {faq.q}
                <span className="text-accent group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="px-4 pb-4 text-muted text-sm">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center px-6 py-20 border-t border-border">
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">Bugun boshlang</h2>
        <p className="text-muted text-base mb-8 max-w-md mx-auto">AI bilan kuchaytirilgan fitness tajriba. Bepul pilot 3 oy.</p>
        <Link href="/register" className="bg-accent text-bg font-bold px-10 py-4 rounded-xl text-base inline-block hover:bg-accent/90 transition shadow-lg shadow-accent/20">
          Bepul boshlash →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center font-bold text-bg text-xs">Z</div>
          <span className="font-display font-bold text-sm">ZenFit</span>
        </div>
        <p className="text-muted text-xs">© 2025 ZenFit. Barcha huquqlar himoyalangan.</p>
      </footer>
    </div>
  );
}
