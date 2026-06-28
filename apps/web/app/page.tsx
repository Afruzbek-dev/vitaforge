"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Salad,
  BarChart3,
  Zap,
  Bot,
  TrendingUp,
  CheckCircle,
  Menu,
  X,
  Flame,
  Utensils,
  ArrowRight,
  Plus,
  Award,
  Users,
  ShieldAlert,
  LineChart,
  UserMinus,
  UserPlus,
  BellRing,
  Target,
  Dumbbell
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "coach" | "analytics">("dashboard");
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);

  const mockQuestions = [
    { q: "Ozish uchun kunlik oqsil miqdori qancha?", a: "Tana vazningizning har bir kg uchun 1.6g - 2.0g oqsil tavsiya etiladi. Siz uchun taxminan 120-140g." },
    { q: "Gym'dan keyin nima yegan ma'qul?", a: "Tez hazm bo'luvchi uglevodlar va oqsil. Masalan: tovuq go'shti guruch bilan yoki oqsil kokteyli banan bilan." },
    { q: "Bugun mashqni o'tkazib yuborsam nima bo'ladi?", a: "Hech qisi yo'q! Dam olish ham tiklanish uchun muhim. Ertaga davom ettiramiz va streak'ni yo'qotmaymiz." }
  ];

  const handleChatQuestion = (q: string, a: string) => {
    setChatQuestion(q);
    setLoadingResponse(true);
    setTimeout(() => {
      setChatResponse(a);
      setLoadingResponse(false);
    }, 600);
  };

  return (
    <div className="bg-[#07070a] text-[#efefeb] font-body min-h-screen relative overflow-x-hidden selection:bg-[#d5ff45]/30 selection:text-[#d5ff45]">
      {/* Background Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.07] pointer-events-none -z-10" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(213,255,69,0.08)_0%,transparent_70%)] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(82,153,255,0.07)_0%,transparent_70%)] pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1e1e2c] bg-[#07070a]/80 backdrop-blur-md transition-all duration-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#d5ff45] flex items-center justify-center font-display font-extrabold text-[#07070a] transition-transform duration-300 group-hover:scale-105 shadow-[0_0_15px_rgba(213,255,69,0.3)]">
              Z
            </div>
            <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">ZenFit</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6b6b80]">
            <a href="#features" className="hover:text-white transition duration-200">Xizmatlar</a>
            <a href="#demo" className="hover:text-white transition duration-200">Demo</a>
            <a href="#retention" className="hover:text-white transition duration-200">Retention</a>
            <a href="#pricing" className="hover:text-white transition duration-200">Narxlar</a>
            <a href="#faq" className="hover:text-white transition duration-200">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-[#6b6b80] hover:text-white transition duration-200">Kirish</Link>
            <Link href="/register" className="bg-[#d5ff45] text-[#07070a] text-sm font-bold px-6 py-3 rounded-xl hover:bg-[#c8f03a] hover:shadow-[0_0_20px_rgba(213,255,69,0.25)] transition duration-300 press">
              Bepul boshlash →
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#13131c] transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1e1e2c] bg-[#07070a] px-6 py-6 space-y-4 animate-fadeIn">
            <nav className="flex flex-col gap-4 text-base font-semibold">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">Xizmatlar</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">Demo</a>
              <a href="#retention" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">Retention</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">Narxlar</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">FAQ</a>
            </nav>
            <div className="h-[1px] bg-[#1e1e2c] w-full my-4" />
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 rounded-xl border border-[#1e1e2c] text-sm font-medium hover:bg-[#13131c] transition">Kirish</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-3.5 rounded-xl bg-[#d5ff45] text-[#07070a] text-base font-bold hover:bg-[#c8f03a] transition">Bepul boshlash →</Link>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════ */}
      {/* HERO — AI Gym Management */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-28 pb-20 text-center relative">
        <div className="inline-flex items-center gap-2 bg-[#d5ff45]/10 border border-[#d5ff45]/20 rounded-full px-4 py-1.5 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#d5ff45] animate-pulse" />
          <span className="text-[#d5ff45] text-[10px] md:text-xs font-mono font-bold tracking-wider uppercase">AI BILAN GYM BOSHQARUVI</span>
        </div>

        <h1 className="font-display font-extrabold text-[clamp(2.2rem,7vw,4.5rem)] leading-[1.05] tracking-tight mb-6 max-w-4xl mx-auto">
          A'ZOLARINGIZ KETIB QOLISHINI <br className="hidden md:block"/>
          <span className="bg-gradient-to-r from-[#d5ff45] via-[#b5ff47] to-[#4dffb4] bg-clip-text text-transparent">AI OLDINDAN AYTADI</span>
        </h1>

        <p className="text-[#6b6b80] text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          Churn prediction, retention analytics va shaxsiy AI trener — gym egalarining a'zolarni saqlab qolish va daromadni oshirish uchun yagona platforma.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/register" className="w-full sm:w-auto bg-[#d5ff45] text-[#07070a] font-extrabold px-10 py-5 rounded-2xl text-lg hover:bg-[#c8f03a] hover:shadow-[0_0_30px_rgba(213,255,69,0.35)] transition-all duration-300 press text-center shadow-[0_0_20px_rgba(213,255,69,0.15)]">
            Bepul boshlash →
          </Link>
          <a href="#demo" className="w-full sm:w-auto border border-[#1e1e2c] bg-[#0e0e14] text-[#efefeb] px-10 py-5 rounded-2xl text-lg hover:border-[#d5ff45]/30 hover:bg-[#13131c] transition-all duration-200 text-center">
            Interaktiv demo
          </a>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: "37%", label: "Churn kamayishi", icon: UserMinus },
            { value: "2.4x", label: "Retention o'sishi", icon: TrendingUp },
            { value: "24/7", label: "AI Coach xizmati", icon: Bot },
            { value: "200+", label: "O'zbek taomlari DB", icon: Salad },
          ].map((s) => (
            <div key={s.label} className="border border-[#1e1e2c] bg-[#0e0e14]/50 rounded-2xl p-4 md:p-5 text-center">
              <s.icon size={18} className="text-[#d5ff45] mx-auto mb-2" />
              <p className="font-display font-black text-xl md:text-2xl text-[#d5ff45] tracking-tight">{s.value}</p>
              <p className="text-[#6b6b80] text-[10px] md:text-xs mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* FEATURES — Bento Grid */}
      {/* ═══════════════════════════════════════════════════ */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 relative border-t border-[#1e1e2c]">
        <div className="text-center mb-16">
          <p className="text-[#d5ff45] text-xs font-mono font-bold tracking-widest mb-3 uppercase">ASOSIY IMKONIYATLAR</p>
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">Gym boshqaruvini AI bilan kuchlashtiring</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Churn Prediction — Large */}
          <div className="bg-[#0e0e14] border border-[#1e1e2c] rounded-3xl p-8 hover:border-[#d5ff45]/20 transition duration-300 group flex flex-col justify-between md:col-span-2">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#ff5252]/10 flex items-center justify-center text-[#ff5252] mb-6">
                <ShieldAlert size={24} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3 text-white">AI Churn Prediction</h3>
              <p className="text-[#6b6b80] text-sm leading-relaxed mb-6">
                A'zolaringiz qachon zalga kelishni to'xtatishi mumkinligini AI oldindan bashorat qiladi. Faollik darajasi, to'lov tarixi va davomiylik ma'lumotlari asosida xavf darajasini aniqlaydi — siz esa vaqtida choralar ko'rasiz.
              </p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {["Xavf darajasi reytingi", "Avtomatik ogohlantirish", "Qayta jalb strategiyasi"].map((item) => (
                <span key={item} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 font-medium text-white/80">{item}</span>
              ))}
            </div>
          </div>

          {/* Card 2: Retention Analytics */}
          <div className="bg-[#0e0e14] border border-[#1e1e2c] rounded-3xl p-8 hover:border-[#d5ff45]/20 transition duration-300 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#5299ff]/10 flex items-center justify-center text-[#5299ff] mb-6">
                <LineChart size={24} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3 text-white">Retention Analytics</h3>
              <p className="text-[#6b6b80] text-sm leading-relaxed mb-6">
                Haftalik, oylik va yillik retention ko'rsatkichlari. Qaysi vaqtda a'zolar eng ko'p ketishini ko'ring va qayta jalb qilish strategiyangizni tuzing.
              </p>
            </div>
            <span className="text-xs text-[#5299ff] font-bold flex items-center gap-1">Real-vaqt dashboard <ArrowRight size={14} /></span>
          </div>

          {/* Card 3: AI Coach for Members */}
          <div className="bg-[#0e0e14] border border-[#1e1e2c] rounded-3xl p-8 hover:border-[#d5ff45]/20 transition duration-300 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#d5ff45]/10 flex items-center justify-center text-[#d5ff45] mb-6">
                <Bot size={24} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3 text-white">24/7 AI Murabbiy</h3>
              <p className="text-[#6b6b80] text-sm leading-relaxed mb-6">
                Har bir a'zoga shaxsiy AI trener. Mashq rejasi, ovqat kaloriyasi va motivatsiya — treneringiz band bo'lsa ham AI doimo tayyor.
              </p>
            </div>
            <div className="h-1 bg-[#1e1e2c] rounded-full overflow-hidden w-full">
              <div className="h-full bg-[#d5ff45] rounded-full animate-pulse" style={{ width: "85%" }} />
            </div>
          </div>

          {/* Card 4: Milliy Taomlar + Streak — Large */}
          <div className="bg-[#0e0e14] border border-[#1e1e2c] rounded-3xl p-8 hover:border-[#d5ff45]/20 transition duration-300 group flex flex-col justify-between md:col-span-2">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#4dffb4]/10 flex items-center justify-center text-[#4dffb4] mb-6">
                <Salad size={24} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3 text-white">Milliy Taomlar DB + O'yinlashtirish</h3>
              <p className="text-[#6b6b80] text-sm leading-relaxed mb-6">
                Palov, somsa, manti — 200 dan ortiq O'zbek milliy taomlarining kaloriya va makronutrient bazasi. Streak, ball va daraja tizimi orqali a'zolarni faol saqlang va churn'ni kamaytiring.
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                {["200+ taomlar", "Streak sistema", "Leaderboard", "Gamification"].map((c) => (
                  <span key={c} className="text-[10px] font-mono bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white/80">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* RETENTION SECTION — Why Us */}
      {/* ═══════════════════════════════════════════════════ */}
      <section id="retention" className="max-w-6xl mx-auto px-6 py-16 relative">
        <div className="border border-[#1e1e2c] bg-gradient-to-br from-[#0e0e14] to-[#07070a] rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="text-[#d5ff45] text-xs font-mono font-bold tracking-widest uppercase">NIMA UCHUN ZENFIT?</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white">A'zolaringizni saqlab qolish — daromadingizni oshirish</h2>
            <p className="text-[#6b6b80] text-sm md:text-base leading-relaxed">
              Yangi a'zo jalb qilish mavjud a'zoni saqlab qolishdan 5-7 baravar qimmat. ZenFit AI sizga churn'ni oldindan aniqlash va avtomatik qayta jalb qilish imkonini beradi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "AI Churn Prediction", desc: "Har bir a'zoning ketish ehtimolini foizda ko'rsatadi." },
                { title: "Avtomatik Ogohlantirish", desc: "Xavfli a'zolar haqida Telegram va panel orqali bildirishnoma." },
                { title: "Streak & Gamification", desc: "Ball, daraja va leaderboard orqali a'zolarni faol saqlash." },
                { title: "Gym Egasi Dashboard", desc: "Daromad, churn rate, retention va a'zo faolligi real-vaqtda." },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Plus size={16} className="text-[#d5ff45] mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-[#6b6b80] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Churn Risk Demo Widget */}
          <div className="flex-1 w-full lg:max-w-[400px] bg-[#13131c] border border-[#1e1e2c] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#d5ff45]/10 rounded-full blur-2xl pointer-events-none" />
            <h4 className="font-display font-bold text-base mb-5 text-white">⚠️ Churn Xavfi (AI Bashorat)</h4>

            <div className="space-y-3.5">
              {[
                { name: "Sardor Aliyev", risk: 82, status: "Yuqori xavf", color: "#ff5252", bg: "bg-[#ff5252]" },
                { name: "Dilnoza Karimova", risk: 45, status: "O'rtacha xavf", color: "#ffa726", bg: "bg-[#ffa726]" },
                { name: "Jasur Otaboyev", risk: 12, status: "Past xavf", color: "#4dffb4", bg: "bg-[#4dffb4]" },
                { name: "Malika Sobirova", risk: 67, status: "Yuqori xavf", color: "#ff5252", bg: "bg-[#ff5252]" },
              ].map((user, i) => (
                <div key={i} className={`p-3 rounded-xl border transition duration-200 ${user.risk > 60 ? "border-[#ff5252]/30 bg-[#ff5252]/5" : "border-[#1e1e2c] bg-[#0c0c12]"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <span className="text-[10px] font-mono font-bold" style={{ color: user.color }}>{user.risk}% xavf</span>
                  </div>
                  <div className="h-1.5 bg-[#1e1e2c] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${user.bg}`} style={{ width: `${user.risk}%` }} />
                  </div>
                  <p className="text-[10px] mt-1.5" style={{ color: user.color }}>{user.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* INTERACTIVE DEMO — App Mockup */}
      {/* ═══════════════════════════════════════════════════ */}
      <section id="demo" className="max-w-6xl mx-auto px-6 py-16 border-t border-[#1e1e2c]">
        <div className="text-center mb-12">
          <p className="text-[#d5ff45] text-xs font-mono font-bold tracking-widest mb-3 uppercase">INTERAKTIV DEMO</p>
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">Platformani sinab ko'ring</h2>
        </div>

        <div className="border border-[#1e1e2c] bg-[#0e0e14] rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex border-b border-[#1e1e2c] bg-[#0c0c12] p-2 gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === "dashboard" ? "bg-[#d5ff45]/10 text-[#d5ff45] border border-[#d5ff45]/20" : "text-[#6b6b80] hover:text-white"}`}
            >
              <ClipboardList size={14} /> A'zo paneli
            </button>
            <button
              onClick={() => setActiveTab("coach")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === "coach" ? "bg-[#d5ff45]/10 text-[#d5ff45] border border-[#d5ff45]/20" : "text-[#6b6b80] hover:text-white"}`}
            >
              <Bot size={14} /> AI Coach Chat
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === "analytics" ? "bg-[#d5ff45]/10 text-[#d5ff45] border border-[#d5ff45]/20" : "text-[#6b6b80] hover:text-white"}`}
            >
              <BarChart3 size={14} /> Gym Analytics
            </button>
          </div>

          <div className="p-6 md:p-10 bg-[#13131c]/40 min-h-[380px]">
            {activeTab === "dashboard" && (
              <div className="animate-fadeIn space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <span className="text-[10px] text-[#6b6b80] font-mono">A'ZO PROFILI,</span>
                    <h4 className="font-display font-bold text-xl text-white">Sardor Aliyev</h4>
                  </div>
                  <div className="flex items-center gap-2 bg-[#d5ff45]/10 border border-[#d5ff45]/20 rounded-full px-4 py-1.5 text-xs text-[#d5ff45]">
                    <Flame size={14} className="fill-[#d5ff45]" />
                    <span className="font-mono font-bold">12 KUN STREAK ⚡</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Calorie widget */}
                  <div className="border border-[#1e1e2c] bg-[#13131c] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg width="110" height="110" className="progress-ring">
                        <circle cx="55" cy="55" r="48" fill="none" stroke="#1e1e2c" strokeWidth="6" />
                        <circle cx="55" cy="55" r="48" fill="none" stroke="#d5ff45" strokeWidth="6" strokeLinecap="round" strokeDasharray="301" strokeDashoffset="80" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Utensils size={18} className="text-[#d5ff45] mb-1" />
                        <span className="font-display font-black text-lg">1,720</span>
                        <span className="text-[9px] text-[#6b6b80]">/ 2,400 kkal</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6b6b80] mt-3">Bugungi kaloriya</p>
                  </div>

                  {/* Macros widget */}
                  <div className="border border-[#1e1e2c] bg-[#13131c] rounded-2xl p-6 flex flex-col justify-center space-y-4">
                    {[
                      { label: "Protein (Oqsil)", val: "124g / 160g", pct: 77, color: "bg-[#5299ff]" },
                      { label: "Uglevodlar", val: "205g / 260g", pct: 78, color: "bg-[#d5ff45]" },
                      { label: "Yog'lar", val: "58g / 80g", pct: 72, color: "bg-[#4dffb4]" },
                    ].map((m) => (
                      <div key={m.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#6b6b80] font-medium">{m.label}</span>
                          <span className="text-white font-mono font-bold">{m.val}</span>
                        </div>
                        <div className="h-2 bg-[#1e1e2c] rounded-full overflow-hidden">
                          <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Level */}
                  <div className="border border-[#1e1e2c] bg-[#13131c] rounded-2xl p-6 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#d5ff45]/10 flex items-center justify-center text-[#d5ff45] border border-[#d5ff45]/20">
                        <Award size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6b6b80]">DARAJA</span>
                        <h5 className="text-base font-bold text-white">Sohibqiron (Lvl 5)</h5>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#1e1e2c] space-y-1">
                      <div className="flex justify-between text-xs text-[#6b6b80]">
                        <span>Keyingi daraja:</span>
                        <span className="text-[#d5ff45] font-mono">140 ⚡ ball</span>
                      </div>
                      <div className="h-1.5 bg-[#1e1e2c] rounded-full overflow-hidden">
                        <div className="h-full bg-[#d5ff45] rounded-full" style={{ width: "70%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "coach" && (
              <div className="animate-fadeIn space-y-4 max-w-xl mx-auto">
                <div className="flex items-center gap-2.5 border-b border-[#1e1e2c] pb-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#ffa726]/10 border border-[#ffa726]/30 flex items-center justify-center text-[#ffa726]">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Coach (ZenFit Trener)</h4>
                    <p className="text-[9px] text-[#4dffb4] font-mono">● 24/7 ONLINE</p>
                  </div>
                </div>

                <div className="space-y-3 min-h-[160px] bg-[#0c0c12] rounded-xl p-4 border border-[#1e1e2c] max-h-[220px] overflow-y-auto">
                  <div className="flex justify-start">
                    <div className="bg-[#13131c] border border-[#1e1e2c] px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-xs text-[#efefeb] max-w-[85%] leading-relaxed">
                      Salom! Men sizning shaxsiy murabbiyingizman. Mashqlar, ratsion yoki milliy taomlar kaloriyasi haqida so'rang.
                    </div>
                  </div>

                  {chatQuestion && (
                    <div className="flex justify-end">
                      <div className="bg-[#d5ff45] text-[#07070a] px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-xs font-semibold max-w-[85%]">
                        {chatQuestion}
                      </div>
                    </div>
                  )}

                  {loadingResponse && (
                    <div className="flex justify-start">
                      <div className="bg-[#13131c] border border-[#1e1e2c] px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-xs text-[#6b6b80] flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[#6b6b80] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#6b6b80] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#6b6b80] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}

                  {chatResponse && !loadingResponse && (
                    <div className="flex justify-start">
                      <div className="bg-[#13131c] border border-[#1e1e2c] px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-xs text-[#efefeb] max-w-[85%] leading-relaxed">
                        {chatResponse}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-[#6b6b80] font-mono">TAVSIYA ETILADIGAN SAVOLLAR:</p>
                  <div className="flex flex-wrap gap-2">
                    {mockQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChatQuestion(q.q, q.a)}
                        className="text-[11px] font-medium text-[#efefeb]/80 border border-[#1e1e2c] bg-[#13131c]/60 px-3.5 py-2 rounded-xl hover:border-[#d5ff45]/30 hover:text-white transition duration-150 text-left"
                      >
                        {q.q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="animate-fadeIn space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Oylik A'zo Retention</h4>
                    <p className="text-xs text-[#6b6b80]">Oxirgi 6 oylik trend</p>
                  </div>
                  <span className="text-xs text-[#4dffb4] font-mono font-bold bg-[#4dffb4]/10 border border-[#4dffb4]/20 px-3 py-1 rounded-lg">Retention: 78% ↑</span>
                </div>

                <div className="flex items-end justify-between h-44 gap-3 pt-6 border-b border-[#1e1e2c] px-2">
                  {[
                    { month: "Yan", val: 62, color: "bg-[#1e1e2c]" },
                    { month: "Fev", val: 65, color: "bg-[#1e1e2c]" },
                    { month: "Mar", val: 71, color: "bg-[#d5ff45]/60" },
                    { month: "Apr", val: 74, color: "bg-[#d5ff45]/70" },
                    { month: "May", val: 76, color: "bg-[#d5ff45]/80" },
                    { month: "Iyun", val: 78, color: "bg-[#d5ff45] shadow-[0_0_15px_rgba(213,255,69,0.25)]" },
                  ].map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="relative w-full flex justify-center">
                        <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#13131c] border border-[#1e1e2c] text-[10px] text-white px-1.5 py-0.5 rounded font-mono">
                          {d.val}%
                        </span>
                      </div>
                      <div className={`w-full rounded-t-lg transition-all duration-500 ${d.color}`} style={{ height: `${d.val}%` }} />
                      <span className="text-[10px] text-[#6b6b80] mt-1 font-medium">{d.month}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  {[
                    { label: "Jami a'zolar", value: "342", change: "+28" },
                    { label: "Faol a'zolar", value: "267", change: "+15" },
                    { label: "Churn rate", value: "4.2%", change: "-1.8%" },
                  ].map((stat) => (
                    <div key={stat.label} className="border border-[#1e1e2c] bg-[#13131c] rounded-xl p-3 text-center">
                      <p className="text-[10px] text-[#6b6b80] mb-1">{stat.label}</p>
                      <p className="font-display font-bold text-lg text-white">{stat.value}</p>
                      <p className="text-[10px] text-[#4dffb4] font-mono">{stat.change}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* PRICING */}
      {/* ═══════════════════════════════════════════════════ */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 relative border-t border-[#1e1e2c]">
        <div className="text-center mb-16">
          <p className="text-[#d5ff45] text-xs font-mono font-bold tracking-widest mb-3 uppercase">TARIFLAR</p>
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">Gym ingiz uchun to'g'ri tarif</h2>
          <p className="text-[#6b6b80] text-sm mt-2">Barcha tariflarda ilk 3 oy bepul sinov muddati</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Free", price: "$0", unit: "abadiy", desc: "Yakka sportchilar uchun.", features: ["5 AI chat/kun", "1 AI plan/oy", "Ovqat kaloriya tracker", "Streak va darajalar"], featured: false },
            { name: "Starter", price: "$39", unit: "/oy", desc: "Kichik gym va studiyalar uchun.", features: ["100 tagacha a'zo", "20 AI chat/kun", "Haftalik plan", "A'zo faolligi monitoring", "1 trener akkounti"], featured: false },
            { name: "Pro", price: "$69", unit: "/oy", desc: "O'suvchi gym va professional klublar.", features: ["500 tagacha a'zo", "Cheksiz AI Coach", "AI Churn prediction", "5 trener akkounti", "Retention dashboard", "Haftalik hisobot"], featured: true },
            { name: "Scale", price: "$149", unit: "/oy", desc: "Katta brend va fitnes zanjirlari.", features: ["Cheksiz a'zolar", "White-label brending", "API integratsiyalar", "Custom AI o'qitish", "24/7 Premium yordam"], featured: false },
          ].map((p) => (
            <div key={p.name} className={`rounded-2xl p-6 border flex flex-col justify-between transition-all duration-300 relative ${p.featured ? "bg-gradient-to-b from-[#13131c] to-[#0e0e14] border-[#d5ff45]/50 shadow-lg shadow-[#d5ff45]/5 hover:scale-[1.02]" : "bg-[#0e0e14] border-[#1e1e2c] hover:border-[#6b6b80]/30"}`}>
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold bg-[#d5ff45] text-[#07070a] rounded-full px-3 py-1 uppercase shadow-[0_0_10px_rgba(213,255,69,0.2)]">
                  TAVSIYA ETILADI
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <p className="text-[#6b6b80] text-[10px] font-mono tracking-widest uppercase mb-1">{p.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-3xl text-white">{p.price}</span>
                    <span className="text-[#6b6b80] text-xs font-mono">{p.unit}</span>
                  </div>
                  <p className="text-[#6b6b80] text-xs min-h-[32px] mt-2">{p.desc}</p>
                </div>

                <div className="h-[1px] bg-[#1e1e2c]" />

                <ul className="space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="text-xs text-[#efefeb]/95 flex gap-2 leading-relaxed">
                      <CheckCircle size={13} className="text-[#d5ff45] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/register"
                  className={`block text-center py-3.5 rounded-xl text-sm font-bold transition duration-200 ${p.featured ? "bg-[#d5ff45] text-[#07070a] hover:bg-[#c8f03a] shadow-md shadow-[#d5ff45]/10" : "border border-[#1e1e2c] text-white hover:border-[#d5ff45]/30 hover:bg-[#13131c]"}`}
                >
                  {p.name === "Free" ? "Bepul boshlash" : "Tanlash →"}
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[#6b6b80] text-xs mt-8">Kredit karta so'ralmaydi. Istalgan vaqtda bekor qilish mumkin.</p>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* FAQ */}
      {/* ═══════════════════════════════════════════════════ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 relative border-t border-[#1e1e2c]">
        <div className="text-center mb-16">
          <p className="text-[#d5ff45] text-xs font-mono font-bold tracking-widest mb-3 uppercase">FAQ</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white">Tez-tez so'raladigan savollar</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: "AI churn prediction qanday ishlaydi?", a: "AI tizimi a'zoning davomiylik tarixi, mashg'ulotlarga qatnashish chastotasi, to'lov muntazamligi va streak faolligini tahlil qilib, har bir a'zoning keyingi 30 kun ichida ketish ehtimolini foizda bashorat qiladi." },
            { q: "ZenFit qaysi gym lar uchun mos?", a: "Kichik fitness studiyalardan tortib katta gym zanjirlarigacha — a'zolarini saqlab qolish va daromadini oshirmoqchi bo'lgan barcha gym egalariga mos. Yakka sportchilar ham bepul rejimdan foydalanishi mumkin." },
            { q: "AI Coach a'zolarga qanday yordam beradi?", a: "Har bir a'zo shaxsiy AI trener oladi. U mashq rejasi tuzadi, 200+ milliy taom kaloriyasini hisoblaydi, motivatsiya beradi va savollariga 24/7 javob beradi." },
            { q: "Telegram orqali ishlash mumkinmi?", a: "Ha! A'zolar @zenfituzbot orqali mashqlarni yozish, ovqat tracking va AI trener bilan gaplashishni to'g'ridan-to'g'ri Telegram Mini App'da bajarishlari mumkin." },
            { q: "Bepul rejim qanday ishlaydi?", a: "Bepul rejim abadiy ishlaydi: kuniga 5 ta AI chat, oyiga 1 ta mashq rejasi, ovqat tracker va streak tizimi. Gym egasi sifatida esa Starter yoki Pro tarifni tanlash tavsiya etiladi." },
          ].map((faq, index) => (
            <details key={index} className="group bg-[#0e0e14] border border-[#1e1e2c] rounded-2xl transition duration-200">
              <summary className="flex justify-between items-center p-5 cursor-pointer text-sm font-semibold text-white select-none list-none [&::-webkit-details-marker]:hidden">
                <span>{faq.q}</span>
                <span className="w-6 h-6 rounded-lg bg-[#13131c] flex items-center justify-center text-[#d5ff45] group-open:rotate-45 transition-transform duration-200">
                  <Plus size={14} />
                </span>
              </summary>
              <p className="px-5 pb-5 text-[#6b6b80] text-sm leading-relaxed border-t border-[#1e1e2c]/50 pt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* CTA Banner */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center relative border-t border-[#1e1e2c]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#d5ff45]/5 blur-3xl pointer-events-none rounded-full" />
        <h2 className="font-display font-bold text-3xl md:text-5xl mb-4 text-white">A'zolaringizni saqlab qoling</h2>
        <p className="text-[#6b6b80] text-base mb-10 max-w-md mx-auto">AI churn prediction va retention analytics bilan gym boshqaruvingizni keyingi bosqichga olib chiqing.</p>
        <Link href="/register" className="bg-[#d5ff45] text-[#07070a] font-extrabold px-12 py-5 rounded-2xl text-lg inline-block hover:bg-[#c8f03a] hover:shadow-[0_0_30px_rgba(213,255,69,0.35)] transition-all duration-300 press shadow-[0_0_20px_rgba(213,255,69,0.15)]">
          Bepul boshlash →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2c] bg-[#0c0c12] px-6 py-12 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#d5ff45] flex items-center justify-center font-bold text-[#07070a] text-xs">Z</div>
            <span className="font-display font-black text-sm tracking-tight text-white">ZenFit AI</span>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-[#6b6b80] justify-center">
            <a href="#features" className="hover:text-white transition">Xizmatlar</a>
            <a href="#retention" className="hover:text-white transition">Retention</a>
            <a href="#pricing" className="hover:text-white transition">Narxlar</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
            <Link href="/login" className="hover:text-white transition">Kirish</Link>
            <Link href="/register" className="hover:text-white transition">Ro'yxatdan o'tish</Link>
          </div>
          <p className="text-[#6b6b80] text-xs font-mono">© 2026 ZenFit. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
