"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ClipboardList, 
  Salad, 
  BarChart3, 
  Zap, 
  Bot, 
  Smartphone, 
  TrendingUp, 
  CheckCircle, 
  Menu, 
  X, 
  Flame, 
  Utensils, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  ChevronRight,
  ShieldCheck,
  Award
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
    <div className="bg-[#07070a] text-[#efefeb] font-body min-h-screen relative overflow-x-hidden selection:bg-[#e8ff47]/30 selection:text-[#e8ff47]">
      {/* Ambient decorative glowing backdrops */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(232,255,71,0.08)_0%,transparent_70%)] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(82,153,255,0.06)_0%,transparent_70%)] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-1/3 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(77,255,180,0.06)_0%,transparent_70%)] pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1e1e2c] bg-[#07070a]/85 backdrop-blur-xl transition-all duration-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#e8ff47] flex items-center justify-center font-display font-extrabold text-[#07070a] transition-transform duration-300 group-hover:scale-105 shadow-[0_0_15px_rgba(232,255,71,0.3)]">
              V
            </div>
            <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">ZenFit</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6b6b80]">
            <a href="#features" className="hover:text-white transition duration-200">Xizmatlar</a>
            <a href="#pricing" className="hover:text-white transition duration-200">Narxlar</a>
            <a href="#demo" className="hover:text-white transition duration-200">Interaktiv Demo</a>
            <a href="#faq" className="hover:text-white transition duration-200">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-[#6b6b80] hover:text-white transition duration-200">Kirish</Link>
            <Link href="/register" className="bg-[#e8ff47] text-[#07070a] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#d6eb3b] hover:shadow-[0_0_20px_rgba(232,255,71,0.25)] transition duration-300 press">
              Boshlash →
            </Link>
          </div>

          {/* Hamburger button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#13131c] transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1e1e2c] bg-[#07070a] px-6 py-6 space-y-4 animate-fadeIn">
            <nav className="flex flex-col gap-4 text-base font-semibold">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">Xizmatlar</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">Narxlar</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">Interaktiv Demo</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">FAQ</a>
            </nav>
            <div className="h-[1px] bg-[#1e1e2c] w-full my-4" />
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 rounded-xl border border-[#1e1e2c] text-sm font-medium hover:bg-[#13131c] transition">Kirish</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 rounded-xl bg-[#e8ff47] text-[#07070a] text-sm font-bold hover:bg-[#d6eb3b] transition">Boshlash →</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20 text-center relative">
        <div className="inline-flex items-center gap-2 bg-[#e8ff47]/10 border border-[#e8ff47]/20 rounded-full px-4 py-1.5 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#e8ff47] animate-pulse" />
          <span className="text-[#e8ff47] text-[10px] md:text-xs font-mono font-bold tracking-wider uppercase">200+ FAOL SPORTCHILAR UZB</span>
        </div>
        
        <h1 className="font-display font-extrabold text-[clamp(2.5rem,7.5vw,4.8rem)] leading-[1.05] tracking-tight mb-6 max-w-4xl mx-auto">
          HAQIQIY <span className="bg-gradient-to-r from-[#e8ff47] via-[#b5ff47] to-[#4dffb4] bg-clip-text text-transparent">SALOHIYATINGIZNI</span><br className="hidden sm:block" /> OCHISH VAQTI KELDI
        </h1>
        
        <p className="text-[#6b6b80] text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Har bir a'zoga shaxsiy AI trener va dietolog. Professional mashq planlari, milliy taomlar kaloriyasini hisoblash va real-vaqtda rivojlanish tahlili.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/register" className="w-full sm:w-auto bg-[#e8ff47] text-[#07070a] font-bold px-8 py-4 rounded-xl text-base hover:bg-[#d6eb3b] hover:shadow-[0_0_25px_rgba(232,255,71,0.3)] transition-all duration-300 press text-center">
            Bepul boshlash →
          </Link>
          <a href="#demo" className="w-full sm:w-auto border border-[#1e1e2c] bg-[#0e0e14] text-[#efefeb] px-8 py-4 rounded-xl text-base hover:border-[#e8ff47]/30 hover:bg-[#13131c] transition-all duration-200 text-center">
            Interaktiv demo
          </a>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto border border-[#1e1e2c] bg-[#0e0e14]/50 backdrop-blur rounded-2xl p-6 md:p-8 shadow-xl">
          {[
            { value: "93%", label: "Natijaga erishganlar" },
            { value: "650+", label: "Sportchilar soni" },
            { value: "3.2x", label: "Yuqori motivatsiya" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display font-black text-2xl md:text-3xl lg:text-4xl text-[#e8ff47] tracking-tight">{s.value}</p>
              <p className="text-[#6b6b80] text-[10px] md:text-xs mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive App Mockup Section */}
      <section id="demo" className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <p className="text-[#e8ff47] text-xs font-mono font-bold tracking-widest mb-3 uppercase">ILOVADAN NAMUNA</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl">ZenFit qanday ishlaydi?</h2>
          <p className="text-[#6b6b80] text-sm mt-2">Quyidagi tablarni bosing va funksiyalarni interaktiv tarzda sinab ko'ring</p>
        </div>

        {/* Mockup Container */}
        <div className="border border-[#1e1e2c] bg-[#0e0e14] rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
          {/* Header tabs */}
          <div className="flex border-b border-[#1e1e2c] bg-[#0c0c12] p-2 gap-1.5 overflow-x-auto">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === "dashboard" ? "bg-[#e8ff47]/10 text-[#e8ff47] border border-[#e8ff47]/20" : "text-[#6b6b80] hover:text-white"}`}
            >
              <ClipboardList size={14} /> Asosiy Panel
            </button>
            <button 
              onClick={() => setActiveTab("coach")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === "coach" ? "bg-[#e8ff47]/10 text-[#e8ff47] border border-[#e8ff47]/20" : "text-[#6b6b80] hover:text-white"}`}
            >
              <Bot size={14} /> Shaxsiy AI Trener
            </button>
            <button 
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === "analytics" ? "bg-[#e8ff47]/10 text-[#e8ff47] border border-[#e8ff47]/20" : "text-[#6b6b80] hover:text-white"}`}
            >
              <BarChart3 size={14} /> Grafik & Tahlil
            </button>
          </div>

          {/* Tab content wrapper */}
          <div className="p-4 md:p-8 bg-[#13131c]/40 min-h-[380px]">
            {activeTab === "dashboard" && (
              <div className="animate-fadeIn space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-[#6b6b80] font-mono">XAYRLI TONG,</span>
                    <h4 className="font-display font-bold text-lg text-white">Sardor</h4>
                  </div>
                  <div className="flex items-center gap-2 bg-[#e8ff47]/10 border border-[#e8ff47]/20 rounded-full px-3 py-1 text-xs text-[#e8ff47]">
                    <Flame size={13} className="fill-[#e8ff47]" />
                    <span className="font-mono font-bold">7 KUN STREAK</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Calorie ring */}
                  <div className="border border-[#1e1e2c] bg-[#13131c] rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg width="100" height="100" className="progress-ring">
                        <circle cx="50" cy="50" r="43" fill="none" stroke="#1e1e2c" strokeWidth="6" />
                        <circle cx="50" cy="50" r="43" fill="none" stroke="#e8ff47" strokeWidth="6" strokeLinecap="round" strokeDasharray="270" strokeDashoffset="60" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Utensils size={18} className="text-[#e8ff47] mb-0.5" />
                        <span className="font-display font-black text-base">1650</span>
                        <span className="text-[9px] text-[#6b6b80]">/ 2200 kkal</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6b6b80] mt-3">Bugungi kaloriya miqdori</p>
                  </div>

                  {/* Macros progress */}
                  <div className="border border-[#1e1e2c] bg-[#13131c] rounded-2xl p-5 flex flex-col justify-center space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#6b6b80] font-medium">Protein (Oqsil)</span>
                        <span className="text-white font-mono font-bold">110g / 150g</span>
                      </div>
                      <div className="h-2 bg-[#1e1e2c] rounded-full overflow-hidden">
                        <div className="h-full bg-[#5299ff] rounded-full" style={{ width: "73%" }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#6b6b80] font-medium">Uglevodlar</span>
                        <span className="text-white font-mono font-bold">180g / 240g</span>
                      </div>
                      <div className="h-2 bg-[#1e1e2c] rounded-full overflow-hidden">
                        <div className="h-full bg-[#e8ff47] rounded-full" style={{ width: "75%" }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#6b6b80] font-medium">Yog'lar</span>
                        <span className="text-white font-mono font-bold">52g / 70g</span>
                      </div>
                      <div className="h-2 bg-[#1e1e2c] rounded-full overflow-hidden">
                        <div className="h-full bg-[#4dffb4] rounded-full" style={{ width: "74%" }} />
                      </div>
                    </div>
                  </div>

                  {/* Level & Points status */}
                  <div className="border border-[#1e1e2c] bg-[#13131c] rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#e8ff47]/10 flex items-center justify-center text-[#e8ff47] border border-[#e8ff47]/20">
                        <Award size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6b6b80]">DARANGIZ</span>
                        <h5 className="text-sm font-bold text-white">Sohibqiron (Lvl 5)</h5>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-[#1e1e2c] space-y-1">
                      <div className="flex justify-between text-xs text-[#6b6b80]">
                        <span>Keyingi darajaga:</span>
                        <span className="text-[#e8ff47] font-mono">180 ⚡</span>
                      </div>
                      <div className="h-1.5 bg-[#1e1e2c] rounded-full overflow-hidden">
                        <div className="h-full bg-[#e8ff47] rounded-full" style={{ width: "65%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "coach" && (
              <div className="animate-fadeIn space-y-4 max-w-xl mx-auto">
                <div className="flex items-center gap-2.5 border-b border-[#1e1e2c] pb-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#ffa726]/10 border border-[#ffa726]/30 flex items-center justify-center text-[#ffa726]">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Coach (ZenFit Trener)</h4>
                    <p className="text-[9px] text-[#4dffb4] font-mono">● 24/7 ONLINE</p>
                  </div>
                </div>

                {/* Chat window */}
                <div className="space-y-3 min-h-[160px] bg-[#0c0c12] rounded-xl p-4 border border-[#1e1e2c] max-h-[220px] overflow-y-auto">
                  <div className="flex justify-start">
                    <div className="bg-[#13131c] border border-[#1e1e2c] px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-xs text-[#efefeb] max-w-[85%] leading-relaxed">
                      Salom! Men sizning shaxsiy murabbiyingizman. Mashqlar, ratsion yoki O'zbek milliy taomlari kaloriyasi haqida so'rang.
                    </div>
                  </div>

                  {chatQuestion && (
                    <div className="flex justify-end">
                      <div className="bg-[#e8ff47] text-[#07070a] px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-xs font-semibold max-w-[85%]">
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

                {/* Suggestions */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-[#6b6b80] font-mono">SO'RASH MUMKIN BO'LGAN SAVOLLAR:</p>
                  <div className="flex flex-wrap gap-2">
                    {mockQuestions.map((q, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleChatQuestion(q.q, q.a)}
                        className="text-[11px] font-medium text-[#efefeb]/80 border border-[#1e1e2c] bg-[#13131c]/60 px-3 py-1.5 rounded-lg hover:border-[#e8ff47]/30 hover:text-white transition duration-150 text-left"
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
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Haftalik Kaloriya Sarfi</h4>
                    <p className="text-xs text-[#6b6b80]">Oxirgi 7 kunlik ko'rsatkich</p>
                  </div>
                  <span className="text-xs text-[#e8ff47] font-mono font-bold bg-[#e8ff47]/10 border border-[#e8ff47]/20 px-3 py-1 rounded-lg">Maqsad: 2200 kkal/kun</span>
                </div>

                {/* Bar chart mockup */}
                <div className="flex items-end justify-between h-40 gap-3 pt-6 border-b border-[#1e1e2c] px-2">
                  {[
                    { day: "Dush", val: 1980, color: "bg-[#1e1e2c]" },
                    { day: "Sesh", val: 2150, color: "bg-[#1e1e2c]" },
                    { day: "Chor", val: 2300, color: "bg-[#e8ff47] shadow-[0_0_15px_rgba(232,255,71,0.25)]" },
                    { day: "Pay", val: 1850, color: "bg-[#1e1e2c]" },
                    { day: "Jum", val: 2250, color: "bg-[#e8ff47] shadow-[0_0_15px_rgba(232,255,71,0.25)]" },
                    { day: "Shan", val: 2400, color: "bg-[#e8ff47] shadow-[0_0_15px_rgba(232,255,71,0.25)]" },
                    { day: "Yak", val: 2050, color: "bg-[#1e1e2c]" }
                  ].map((d, i) => {
                    const heightPct = Math.min((d.val / 2400) * 100, 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="relative w-full flex justify-center">
                          <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#13131c] border border-[#1e1e2c] text-[10px] text-white px-1.5 py-0.5 rounded font-mono">
                            {d.val}
                          </span>
                        </div>
                        <div className={`w-full rounded-t-lg transition-all duration-500 ${d.color}`} style={{ height: `${heightPct}%` }} />
                        <span className="text-[10px] text-[#6b6b80] mt-1 font-medium">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 relative">
        <div className="text-center mb-16">
          <p className="text-[#e8ff47] text-xs font-mono font-bold tracking-widest mb-3 uppercase">KUCHLI XIZMATLAR</p>
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">Sizning natijangiz uchun hamma narsa tayyor</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { 
              icon: ClipboardList, 
              title: "AI Shaxsiy Mashq Plani", 
              desc: "Maqsadlaringizga moslashtirilgan haftalik trenirovka rejasi. Har bir mashqning video yoki matn ko'rinishidagi tushuntirishlari.",
              items: ["Maqsadga qarab haftalik yuklama", "Murakkablik darajasini tanlash", "Kunlik bajarganlik hisoboti"]
            },
            { 
              icon: Salad, 
              title: "O'zbek Milliy Taomlar Tracker", 
              desc: "Osh, manti, kabob kabi 200 dan ortiq mahalliy taomlarimizning to'liq kaloriya va makronutrientlar bazasi va AI yordamida tezkor hisoblash.",
              items: ["O'zbekiston milliy taomlar DB", "AI yordamida gramm o'lchami", "Haftalik oziqlanish tahlillari"]
            },
            { 
              icon: BarChart3, 
              title: "Aqlli Analytics (Gym Panel)", 
              desc: "Rivojlanishingiz va faolligingizni grafiklar yordamida tahlil qiling. Streak system orqali doimiy tarzda faol bo'lib turing.",
              items: ["Faollik darajasi ko'rsatkichlari", "Maqsadlarga yetishish foizi", "Balllar to'plash va reytinglar"]
            },
          ].map((s) => (
            <div key={s.title} className="bg-[#0e0e14] border border-[#1e1e2c] rounded-2xl p-6 hover:border-[#e8ff47]/30 transition duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#e8ff47]/10 flex items-center justify-center text-[#e8ff47] mb-6 group-hover:scale-105 transition-transform duration-300">
                  <s.icon size={24} />
                </div>
                <h3 className="font-display font-bold text-lg mb-4 text-white group-hover:text-[#e8ff47] transition">{s.title}</h3>
                <p className="text-[#6b6b80] text-sm leading-relaxed mb-6">{s.desc}</p>
              </div>
              <ul className="space-y-2.5 pt-4 border-t border-[#1e1e2c]/50">
                {s.items.map((item) => (
                  <li key={item} className="text-[#efefeb]/80 text-xs flex gap-2">
                    <CheckCircle size={14} className="text-[#e8ff47] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Gamification / Why Us Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 relative">
        <div className="border border-[#1e1e2c] bg-gradient-to-br from-[#0e0e14] to-[#07070a] rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="text-[#e8ff47] text-xs font-mono font-bold tracking-widest uppercase">AFZALLIKLARIMIZ</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white">Nima uchun odamlar ZenFit yordamida tezroq natijaga erishishadi?</h2>
            <p className="text-[#6b6b80] text-sm md:text-base leading-relaxed">
              Biz shunchaki kaloriya hisoblaydigan ilova emasmiz. Biz o'yinlashtirish (gamification) va AI texnologiyalaridan foydalanib, sizga fitnessni kundalik odatga aylantirishga yordam beramiz.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Streak & O'yinlashtirish", desc: "Ballar to'plang, shogird darajasidan Sohibqiron darajasigacha ko'tariling." },
                { title: "24/7 AI Murabbiy", desc: "Sizga real vaqtda javob beruvchi va daldalovchi ovozsiz yordamchi." },
                { title: "Telegram Mini App", desc: "Sessiyani ochib, mashqlarni Telegram orqali ham to'g'ridan-to'g'ri boshqarish." },
                { title: "Gym Egalari uchun Panel", desc: "A'zolaringiz qachon ketib qolishi mumkinligini oldindan aniqlovchi AI model." },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Plus size={16} className="text-[#e8ff47] mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-[#6b6b80] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full lg:max-w-[400px] bg-[#13131c] border border-[#1e1e2c] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#e8ff47]/10 rounded-full blur-2xl pointer-events-none" />
            <h4 className="font-display font-bold text-base mb-4 text-white">🏆 Reyting (Top Sportchilar)</h4>
            
            <div className="space-y-3.5">
              {[
                { name: "Jasur Otaboyev", level: "Sohibqiron (Lvl 5)", points: "1,240 ⚡", active: true },
                { name: "Alisher Qodirov", level: "Dev (Lvl 4)", points: "980 ⚡", active: false },
                { name: "Malika Sobirova", level: "Botir (Lvl 3)", points: "810 ⚡", active: false },
                { name: "Shaxzod Xanov", level: "Pahlavon (Lvl 3)", points: "790 ⚡", active: false }
              ].map((user, i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl border transition duration-200 ${user.active ? "border-[#e8ff47]/40 bg-[#e8ff47]/5" : "border-transparent bg-[#0c0c12]"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#6b6b80]">#{i+1}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-[10px] text-[#6b6b80]">{user.level}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#e8ff47]">{user.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 relative">
        <div className="text-center mb-16">
          <p className="text-[#e8ff47] text-xs font-mono font-bold tracking-widest mb-3 uppercase">TARIFLAR</p>
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">Cheklovlarsiz maqsad sari boring</h2>
          <p className="text-[#6b6b80] text-sm mt-2">Barcha tariflarda ilk 3 oy bepul sinov muddati mavjud</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Free", price: "$0", unit: "abadiy", desc: "Ilovani mustaqil boshlovchi a'zolar uchun.", features: ["5 AI chat/kun", "1 AI plan/oy", "Ovqat kaloriya tracker", "Streak va darajalar tizimi"], featured: false },
            { name: "Starter", price: "$39", unit: "/oy", desc: "Kichikroq fitnes studiyalari uchun.", features: ["100 tagacha faol a'zo", "20 AI chat/kun", "Haftalik yangilanadigan plan", "AI Progress foto tahlili", "1 ta trener akkounti"], featured: false },
            { name: "Pro", price: "$69", unit: "/oy", desc: "Kengayayotgan gym va professional klublar uchun.", features: ["500 tagacha faol a'zo", "Cheksiz AI Coach foydalanish", "AI Churn prediction (ketish tahlili)", "5 ta trener akkounti", "Haftalik oziqlanish hisoboti"], featured: true },
            { name: "Scale", price: "$149", unit: "/oy", desc: "Katta brend va premium fitnes zanjirlari uchun.", features: ["Cheksiz a'zolar soni", "White-label ilova brendi", "API integratsiyalar", "Z uchun Custom AI o'qitish", "24/7 Premium yordam"], featured: false },
          ].map((p) => (
            <div key={p.name} className={`rounded-2xl p-6 border flex flex-col justify-between transition-all duration-300 relative ${p.featured ? "bg-gradient-to-b from-[#13131c] to-[#0e0e14] border-[#e8ff47]/50 shadow-lg shadow-[#e8ff47]/5 hover:scale-[1.02]" : "bg-[#0e0e14] border-[#1e1e2c] hover:border-[#6b6b80]/30"}`}>
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold bg-[#e8ff47] text-[#07070a] rounded-full px-3 py-1 uppercase shadow-[0_0_10px_rgba(232,255,71,0.2)]">
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
                      <CheckCircle size={13} className="text-[#e8ff47] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link 
                  href="/register" 
                  className={`block text-center py-3 rounded-xl text-xs font-bold transition duration-200 ${p.featured ? "bg-[#e8ff47] text-[#07070a] hover:bg-[#d6eb3b] shadow-md shadow-[#e8ff47]/10" : "border border-[#1e1e2c] text-white hover:border-[#e8ff47]/30 hover:bg-[#13131c]"}`}
                >
                  {p.name === "Free" ? "Hozir Boshlash" : "Tarifni Tanlash →"}
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[#6b6b80] text-xs mt-8">Barcha tariflarda kredit karta so'ralmaydi. Istalgan vaqtda bekor qilish mumkin.</p>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 relative">
        <div className="text-center mb-16">
          <p className="text-[#e8ff47] text-xs font-mono font-bold tracking-widest mb-3 uppercase">FAQ</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white">Tez-tez so'raladigan savollar</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: "ZenFit qaysi zallar va shaxslar uchun mos keladi?", a: "Platformamiz o'z natijasini yaxshilamoqchi bo'lgan havaskor sportchilar, mijozlari bilan faol aloqa o'rnatmoqchi bo'lgan murabbiylar hamda zal monitoringi va retention (mijozlarni saqlab qolish) tizimini o'rnatmoqchi bo'lgan gym egalari uchun mos." },
            { q: "AI plans va ovqat kaloriyasini qanday hisoblaydi?", a: "Siz profilingiz va yoshingiz, vazningizni kiritganingizdan so'ng, AI sizning kunlik ehtiyojingizni (BMR/TDEE) aniqlaydi. Yozgan taomlaringizni tahlil qilib, kaloriya, protein va boshqa makronutrientlarni soniyalar ichida chiqaradi." },
            { q: "O'zbekiston milliy taomlari bazasi qanchalik aniq?", a: "Bizning ma'lumotlar bazamizda 200 dan ortiq mahalliy taomlarimiz (palov, somsa, sho'rva, manti) mavjud va O'rta Osiyo oshpazlik o'lchamlari bo'yicha kaloriyalar optimallashtirilgan." },
            { q: "Telegram orqali qanday ulanish mumkin?", a: "Ro'yxatdan o'tganingizdan keyin @zenfituzbot ga ulanasiz va barcha mashg'ulotlar, suv va ovqat yozish ishlarini to'g'ridan-to'g'ri Telegram Mini App orqali bajarasiz." },
            { q: "Bepul rejimda qanday cheklovlar bor?", a: "Bepul rejim abadiy ishlaydi va kuniga 5 tagacha AI trener bilan suhbat, oyiga 1 marotaba yangi mashq rejasi va streak/ovqat trackerini taklif qiladi." },
          ].map((faq, index) => (
            <details key={index} className="group bg-[#0e0e14] border border-[#1e1e2c] rounded-2xl transition duration-200">
              <summary className="flex justify-between items-center p-5 cursor-pointer text-sm font-semibold text-white select-none list-none [&::-webkit-details-marker]:hidden">
                <span>{faq.q}</span>
                <span className="w-6 h-6 rounded-lg bg-[#13131c] flex items-center justify-center text-[#e8ff47] group-open:rotate-45 transition-transform duration-200">
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

      {/* Action Banner */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center relative border-t border-[#1e1e2c]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#e8ff47]/5 blur-3xl pointer-events-none rounded-full" />
        <h2 className="font-display font-bold text-3xl md:text-5xl mb-4 text-white">Sog'lom hayotni bugundan boshlang</h2>
        <p className="text-[#6b6b80] text-base mb-8 max-w-md mx-auto">AI yordamida tezkor natija, o'yin elementlari va to'liq tahlillar zali.</p>
        <Link href="/register" className="bg-[#e8ff47] text-[#07070a] font-bold px-10 py-4.5 rounded-xl text-base inline-block hover:bg-[#d6eb3b] hover:shadow-[0_0_30px_rgba(232,255,71,0.35)] transition-all duration-300 press">
          Bepul boshlash →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2c] bg-[#0c0c12] px-6 py-12 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#e8ff47] flex items-center justify-center font-bold text-[#07070a] text-xs">V</div>
            <span className="font-display font-black text-sm tracking-tight text-white">ZenFit AI</span>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-[#6b6b80] justify-center">
            <a href="#features" className="hover:text-white transition">Xizmatlar</a>
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

