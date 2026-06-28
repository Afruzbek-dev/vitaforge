"use client";

import { useState, useEffect } from "react";
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
  Award,
  Heart,
  Activity,
  Watch,
  Moon,
  Users,
  Compass
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "coach" | "analytics">("dashboard");
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);

  // Wearable simulation states
  const [wearableState, setWearableState] = useState<"rest" | "run" | "strength">("rest");
  const [bpm, setBpm] = useState(72);
  const [kcal, setKcal] = useState(140);
  const [steps, setSteps] = useState(6240);

  // Simple telemetry ticker to simulate live wearable feedback
  useEffect(() => {
    const timer = setInterval(() => {
      if (wearableState === "run") {
        setBpm((p) => Math.min(165, p + Math.floor(Math.random() * 3) - 1));
        setKcal((p) => p + 1);
        setSteps((p) => p + Math.floor(Math.random() * 4) + 1);
      } else if (wearableState === "strength") {
        setBpm((p) => {
          const target = 130;
          if (p < target) return p + 2;
          return p + Math.floor(Math.random() * 3) - 1;
        });
        setKcal((p) => p + (Math.random() > 0.5 ? 1 : 0));
      } else {
        setBpm((p) => {
          const target = 72;
          if (p > target) return p - 1;
          if (p < target) return p + 1;
          return target;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [wearableState]);

  const handleWearableChange = (state: "rest" | "run" | "strength") => {
    setWearableState(state);
    if (state === "run") {
      setBpm(120);
    } else if (state === "strength") {
      setBpm(110);
    } else {
      setBpm(75);
    }
  };

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
      {/* Background Grid Pattern & Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.07] pointer-events-none -z-10" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(232,255,71,0.08)_0%,transparent_70%)] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(82,153,255,0.07)_0%,transparent_70%)] pointer-events-none -z-10" />
      <div className="absolute bottom-[30%] left-10 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(77,255,180,0.06)_0%,transparent_70%)] pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1e1e2c] bg-[#07070a]/80 backdrop-blur-md transition-all duration-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#d5ff45] flex items-center justify-center font-display font-extrabold text-[#07070a] transition-transform duration-300 group-hover:scale-105 shadow-[0_0_15px_rgba(232,255,71,0.3)]">
              V
            </div>
            <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">ZenFit</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6b6b80]">
            <a href="#features" className="hover:text-white transition duration-200">Xizmatlar</a>
            <a href="#wearable" className="hover:text-white transition duration-200">Wearables</a>
            <a href="#demo" className="hover:text-white transition duration-200">Interaktiv Demo</a>
            <a href="#pricing" className="hover:text-white transition duration-200">Narxlar</a>
            <a href="#faq" className="hover:text-white transition duration-200">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-[#6b6b80] hover:text-white transition duration-200">Kirish</Link>
            <Link href="/register" className="bg-[#d5ff45] text-[#07070a] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#d6eb3b] hover:shadow-[0_0_20px_rgba(232,255,71,0.25)] transition duration-300 press">
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
              <a href="#wearable" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">Wearables</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">Interaktiv Demo</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">Narxlar</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-[#6b6b80] hover:text-white transition">FAQ</a>
            </nav>
            <div className="h-[1px] bg-[#1e1e2c] w-full my-4" />
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 rounded-xl border border-[#1e1e2c] text-sm font-medium hover:bg-[#13131c] transition">Kirish</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 rounded-xl bg-[#d5ff45] text-[#07070a] text-sm font-bold hover:bg-[#d6eb3b] transition">Boshlash →</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-16 text-center relative">
        <div className="inline-flex items-center gap-2 bg-[#d5ff45]/10 border border-[#d5ff45]/20 rounded-full px-4 py-1.5 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#d5ff45] animate-pulse" />
          <span className="text-[#d5ff45] text-[10px] md:text-xs font-mono font-bold tracking-wider uppercase">EVOTRACK TELEMETRIYA INTEGRATSIYASI</span>
        </div>
        
        <h1 className="font-display font-extrabold text-[clamp(2.5rem,7.5vw,4.8rem)] leading-[1.05] tracking-tight mb-6 max-w-4xl mx-auto">
          BIOMETRIK MA'LUMOTLAR VA <br className="hidden md:block"/>
          <span className="bg-gradient-to-r from-[#d5ff45] via-[#b5ff47] to-[#4dffb4] bg-clip-text text-transparent">AQLLI AI ANALITIKASI</span>
        </h1>
        
        <p className="text-[#6b6b80] text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Taqiladigan qurilmalar (smartwatch/bands) telemetryasini AI Coach platformasiga bog'lang. Haqiqiy vaqtda yurak urishi, mashq intensivligi va kaloriya sarfini avtomatlashtiring.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/register" className="w-full sm:w-auto bg-[#d5ff45] text-[#07070a] font-bold px-8 py-4 rounded-xl text-base hover:bg-[#d6eb3b] hover:shadow-[0_0_25px_rgba(232,255,71,0.3)] transition-all duration-300 press text-center">
            Ulanish va Boshlash →
          </Link>
          <a href="#wearable" className="w-full sm:w-auto border border-[#1e1e2c] bg-[#0e0e14] text-[#efefeb] px-8 py-4 rounded-xl text-base hover:border-[#d5ff45]/30 hover:bg-[#13131c] transition-all duration-200 text-center">
            Wearable Demo
          </a>
        </div>

        {/* Partner / Gym logo strip */}
        <div className="pt-8 border-t border-[#1e1e2c] max-w-4xl mx-auto">
          <p className="text-[10px] font-mono text-[#6b6b80] uppercase tracking-[0.2em] mb-6">INTEGRATSIYA QILINGAN BRENDLAR</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center justify-items-center opacity-40">
            {["Apple Health", "Wear OS", "Garmin Sync", "Fitbit Live", "Samsung Health"].map((logo) => (
              <span key={logo} className="font-display font-extrabold text-sm md:text-base tracking-wider text-white hover:opacity-100 transition cursor-default">
                {logo.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Smartwatch / Device Integration Section */}
      <section id="wearable" className="max-w-6xl mx-auto px-6 py-20 border-t border-[#1e1e2c]">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Details */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#4dffb4]/10 border border-[#4dffb4]/20 rounded-full px-3 py-1 text-xs text-[#4dffb4]">
              <Watch size={13} />
              <span className="font-mono font-bold tracking-wider uppercase">LIVE SMARTWATCH SYNC</span>
            </div>
            
            <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight text-white">
              Siz harakatdasiz, AI esa tahlil qilmoqda
            </h2>
            
            <p className="text-[#6b6b80] text-sm md:text-base leading-relaxed">
              Smartwatch yoki bilaguzuk datchiklaridan olingan biometrik ma'lumotlar avtomatik ravishda ZenFit AI tizimiga o'tadi. AI mashg'ulot davomiyligi, yurak urish tezligi va metabolik yuklamani aniqlab, haftalik ratsionga real-vaqtda o'zgartirishlar kiritadi.
            </p>

            <div className="space-y-4">
              {[
                { icon: Heart, color: "text-[#ff5252]", t: "Yurak urishi monitoringi", d: "Aerob va anaerob zonalarga qarab yuklamalarni AI avtomatik sozlaydi." },
                { icon: Activity, color: "text-[#d5ff45]", t: "Haqiqiy vaqtda energiya sarfi", d: "Zalga kirganingizda avtomatik ravishda biometrik tracking rejimini ishga tushirish." },
                { icon: Moon, color: "text-[#5299ff]", t: "Uyqu va tiklanish tahlili", d: "Tiklanish darajangizga mos ravishda navbatdagi trenirovka og'irligini rejalashtirish." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl border border-[#1e1e2c] bg-[#0e0e14]/50">
                  <div className={`w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.t}</h4>
                    <p className="text-xs text-[#6b6b80] mt-1 leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smartwatch Simulator Interactive UI */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative p-8 border border-[#1e1e2c] bg-[#0c0c12]/80 backdrop-blur rounded-3xl w-full max-w-sm shadow-2xl">
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#d5ff45]/5 rounded-full blur-2xl pointer-events-none" />
              
              <p className="text-[10px] font-mono text-[#6b6b80] tracking-wider mb-6 text-center">INTEGRATSIYA SIMULATORI</p>
              
              {/* Watch visual shape */}
              <div className="w-60 h-60 rounded-full border-8 border-zinc-800 bg-[#07070a] flex flex-col items-center justify-center relative mx-auto shadow-inner shadow-black/85">
                {/* Watch screen details */}
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-mono text-[#6b6b80]">09:41 AM</span>
                  
                  {/* Pulsing heart block */}
                  <div className="flex items-center justify-center gap-1.5 pt-2">
                    <Heart size={16} className={`fill-red-500 text-red-500 ${wearableState !== "rest" ? "animate-pulse" : ""}`} />
                    <span className="font-display font-black text-2xl tracking-tight text-white">{bpm}</span>
                    <span className="text-[9px] text-[#6b6b80] font-mono">BPM</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 px-4 border-t border-[#1e1e2c] mt-3">
                    <div>
                      <p className="text-[9px] text-[#6b6b80] uppercase">KALORIYA</p>
                      <p className="text-xs font-mono font-bold text-[#d5ff45]">{kcal} kkal</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#6b6b80] uppercase">QADAMLAR</p>
                      <p className="text-xs font-mono font-bold text-white">{steps}</p>
                    </div>
                  </div>

                  <span className="inline-block mt-4 text-[8px] font-mono bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[#4dffb4]">
                    {wearableState === "rest" ? "DAM OLISH" : wearableState === "run" ? "YUGURISH REJIMI" : "KUCH MASHG'ULOTI"}
                  </span>
                </div>
              </div>

              {/* Simulation control triggers */}
              <div className="grid grid-cols-3 gap-2 mt-8">
                {[
                  { id: "rest", label: "Tinch holat" },
                  { id: "run", label: "Kardio" },
                  { id: "strength", label: "Kuch mashq" }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => handleWearableChange(btn.id as any)}
                    className={`py-2 rounded-xl text-[10px] font-bold border transition ${wearableState === btn.id ? "bg-[#d5ff45] border-[#d5ff45] text-[#07070a]" : "bg-[#13131c] border-[#1e1e2c] text-[#6b6b80] hover:text-white"}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-center text-[#6b6b80] mt-4 font-mono">Simulyatorda tugmalarni bosib, biometrik o'zgarishlarni kuzating.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core App Dashboard Mockup (Ported from EvoTrack layout) */}
      <section id="demo" className="max-w-6xl mx-auto px-6 py-16 border-t border-[#1e1e2c]">
        <div className="text-center mb-12">
          <p className="text-[#d5ff45] text-xs font-mono font-bold tracking-widest mb-3 uppercase">ILOVANI SINAB KO'RING</p>
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">Interaktiv Foydalanuvchi Interfeysi</h2>
        </div>

        {/* Tab Selection */}
        <div className="border border-[#1e1e2c] bg-[#0e0e14] rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex border-b border-[#1e1e2c] bg-[#0c0c12] p-2 gap-1.5 overflow-x-auto">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === "dashboard" ? "bg-[#d5ff45]/10 text-[#d5ff45] border border-[#d5ff45]/20" : "text-[#6b6b80] hover:text-white"}`}
            >
              <ClipboardList size={14} /> Bosh sahifa
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
              <BarChart3 size={14} /> Grafiklar & Hisobotlar
            </button>
          </div>

          <div className="p-6 md:p-10 bg-[#13131c]/40 min-h-[380px]">
            {activeTab === "dashboard" && (
              <div className="animate-fadeIn space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <span className="text-[10px] text-[#6b6b80] font-mono">FAOL KUZATUVCHI,</span>
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
                    <p className="text-xs text-[#6b6b80] mt-3">Bugungi kaloriya balansi</p>
                  </div>

                  {/* Macros widget */}
                  <div className="border border-[#1e1e2c] bg-[#13131c] rounded-2xl p-6 flex flex-col justify-center space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#6b6b80] font-medium">Protein (Oqsil)</span>
                        <span className="text-white font-mono font-bold">124g / 160g</span>
                      </div>
                      <div className="h-2 bg-[#1e1e2c] rounded-full overflow-hidden">
                        <div className="h-full bg-[#5299ff] rounded-full" style={{ width: "77%" }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#6b6b80] font-medium">Uglevodlar</span>
                        <span className="text-white font-mono font-bold">205g / 260g</span>
                      </div>
                      <div className="h-2 bg-[#1e1e2c] rounded-full overflow-hidden">
                        <div className="h-full bg-[#d5ff45] rounded-full" style={{ width: "78%" }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#6b6b80] font-medium">Yog'lar</span>
                        <span className="text-white font-mono font-bold">58g / 80g</span>
                      </div>
                      <div className="h-2 bg-[#1e1e2c] rounded-full overflow-hidden">
                        <div className="h-full bg-[#4dffb4] rounded-full" style={{ width: "72%" }} />
                      </div>
                    </div>
                  </div>

                  {/* Gamification Level info */}
                  <div className="border border-[#1e1e2c] bg-[#13131c] rounded-2xl p-6 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#d5ff45]/10 flex items-center justify-center text-[#d5ff45] border border-[#d5ff45]/20">
                        <Award size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6b6b80]">KUCH REYTINGI</span>
                        <h5 className="text-base font-bold text-white">Sohibqiron (Lvl 5)</h5>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-[#1e1e2c] space-y-1">
                      <div className="flex justify-between text-xs text-[#6b6b80]">
                        <span>Keyingi darajaga:</span>
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

                {/* Simulated messages */}
                <div className="space-y-3 min-h-[160px] bg-[#0c0c12] rounded-xl p-4 border border-[#1e1e2c] max-h-[220px] overflow-y-auto">
                  <div className="flex justify-start">
                    <div className="bg-[#13131c] border border-[#1e1e2c] px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-xs text-[#efefeb] max-w-[85%] leading-relaxed">
                      Salom! Men sizning shaxsiy murabbiyingizman. Mashqlar, ratsion yoki O'zbek milliy taomlari kaloriyasi haqida so'rang.
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

                {/* Suggesions */}
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
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Haftalik Kaloriya Sarfi</h4>
                    <p className="text-xs text-[#6b6b80]">Oxirgi 7 kunlik ko'rsatkich</p>
                  </div>
                  <span className="text-xs text-[#d5ff45] font-mono font-bold bg-[#d5ff45]/10 border border-[#d5ff45]/20 px-3 py-1 rounded-lg">Maqsad: 2400 kkal/kun</span>
                </div>

                {/* Custom charts */}
                <div className="flex items-end justify-between h-40 gap-3 pt-6 border-b border-[#1e1e2c] px-2">
                  {[
                    { day: "Dush", val: 1980, color: "bg-[#1e1e2c]" },
                    { day: "Sesh", val: 2150, color: "bg-[#1e1e2c]" },
                    { day: "Chor", val: 2420, color: "bg-[#d5ff45] shadow-[0_0_15px_rgba(232,255,71,0.25)]" },
                    { day: "Pay", val: 1850, color: "bg-[#1e1e2c]" },
                    { day: "Jum", val: 2250, color: "bg-[#1e1e2c]" },
                    { day: "Shan", val: 2500, color: "bg-[#d5ff45] shadow-[0_0_15px_rgba(232,255,71,0.25)]" },
                    { day: "Yak", val: 2050, color: "bg-[#1e1e2c]" }
                  ].map((d, i) => {
                    const heightPct = Math.min((d.val / 2500) * 100, 100);
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

      {/* Advanced Bento Grid Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 relative border-t border-[#1e1e2c]">
        <div className="text-center mb-16">
          <p className="text-[#d5ff45] text-xs font-mono font-bold tracking-widest mb-3 uppercase">IMKONIYATLAR</p>
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">Fitness platformasi kelajagi</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI coaching */}
          <div className="bg-[#0e0e14] border border-[#1e1e2c] rounded-3xl p-8 hover:border-[#d5ff45]/20 transition duration-300 group flex flex-col justify-between md:col-span-2">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#d5ff45]/10 flex items-center justify-center text-[#d5ff45] mb-6">
                <Bot size={24} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3 text-white">24/7 Shaxsiy AI Murabbiy</h3>
              <p className="text-[#6b6b80] text-sm leading-relaxed mb-6">
                Murabbiyingiz har doim aloqada. Taomlar kaloriyasini matn yoki rasm orqali tezda aniqlab beradi, yangi mashq usullari bo'yicha maslahat beradi va o'zingizni sust his qilganingizda motivatsiya ulashadi.
              </p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {["Milliy taomlarni bilish", "Rasm orqali kaloriya", "Haftalik o'zgarish tahlili"].map((item) => (
                <span key={item} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 font-medium text-white/80">{item}</span>
              ))}
            </div>
          </div>

          {/* Card 2: Uzbek food db */}
          <div className="bg-[#0e0e14] border border-[#1e1e2c] rounded-3xl p-8 hover:border-[#d5ff45]/20 transition duration-300 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#4dffb4]/10 flex items-center justify-center text-[#4dffb4] mb-6">
                <Salad size={24} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3 text-white">Milliy Taomlar Bazasi</h3>
              <p className="text-[#6b6b80] text-sm leading-relaxed mb-6">
                Palov, somsa, manti yoki sho'rva? Ularning kaloriyasini internetdan qidirib yurmaysiz. 200 dan ortiq milliy taomlarimizning tayyor energetik ko'rsatkichlari.
              </p>
            </div>
            <span className="text-xs text-[#4dffb4] font-bold flex items-center gap-1">200+ taomlar ro'yxati <ArrowRight size={14} /></span>
          </div>

          {/* Card 3: Gamification */}
          <div className="bg-[#0e0e14] border border-[#1e1e2c] rounded-3xl p-8 hover:border-[#d5ff45]/20 transition duration-300 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#5299ff]/10 flex items-center justify-center text-[#5299ff] mb-6">
                <Zap size={24} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3 text-white">Streak & Levellar</h3>
              <p className="text-[#6b6b80] text-sm leading-relaxed mb-6">
                Mashq qiling va ball to'plang. Doimiy ravishda mashq qiluvchilar streak reytingida yuqorilab boradi. Zalingizdagi boshqa a'zolar bilan sog'lom raqobat.
              </p>
            </div>
            <div className="h-1 bg-[#1e1e2c] rounded-full overflow-hidden w-full">
              <div className="h-full bg-[#5299ff] rounded-full animate-pulse" style={{ width: "80%" }} />
            </div>
          </div>

          {/* Card 4: Multi devices integration */}
          <div className="bg-[#0e0e14] border border-[#1e1e2c] rounded-3xl p-8 hover:border-[#d5ff45]/20 transition duration-300 group flex flex-col justify-between md:col-span-2">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#d5ff45]/10 flex items-center justify-center text-[#d5ff45] mb-6">
                <Watch size={24} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3 text-white">Smartwatch & Wearables</h3>
              <p className="text-[#6b6b80] text-sm leading-relaxed mb-6">
                Yurak urishi ritmi, qadamlar va uyqu sifati monitoringi. Apple Watch, Garmin, Fitbit yoki Wear OS tizimidagi istalgan smartwatch orqali to'g'ridan-to'g'ri integratsiya.
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-xs text-white/50">Yaqin kelajakda:</span>
              <div className="flex gap-2">
                {["Apple Health", "Wear OS", "Garmin"].map((c) => (
                  <span key={c} className="text-[10px] font-mono bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white/80">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gamification / Leaderboard showcase */}
      <section className="max-w-6xl mx-auto px-6 py-16 relative">
        <div className="border border-[#1e1e2c] bg-gradient-to-br from-[#0e0e14] to-[#07070a] rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="text-[#d5ff45] text-xs font-mono font-bold tracking-widest uppercase">AFZALLIKLARIMIZ</span>
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
                  <Plus size={16} className="text-[#d5ff45] mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-[#6b6b80] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full lg:max-w-[400px] bg-[#13131c] border border-[#1e1e2c] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#d5ff45]/10 rounded-full blur-2xl pointer-events-none" />
            <h4 className="font-display font-bold text-base mb-4 text-white">🏆 Reyting (Top Sportchilar)</h4>
            
            <div className="space-y-3.5">
              {[
                { name: "Jasur Otaboyev", level: "Sohibqiron (Lvl 5)", points: "1,240 ⚡", active: true },
                { name: "Alisher Qodirov", level: "Dev (Lvl 4)", points: "980 ⚡", active: false },
                { name: "Malika Sobirova", level: "Botir (Lvl 3)", points: "810 ⚡", active: false },
                { name: "Shaxzod Xanov", level: "Pahlavon (Lvl 3)", points: "790 ⚡", active: false }
              ].map((user, i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl border transition duration-200 ${user.active ? "border-[#d5ff45]/40 bg-[#d5ff45]/5" : "border-transparent bg-[#0c0c12]"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#6b6b80]">#{i+1}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-[10px] text-[#6b6b80]">{user.level}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#d5ff45]">{user.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 relative border-t border-[#1e1e2c]">
        <div className="text-center mb-16">
          <p className="text-[#d5ff45] text-xs font-mono font-bold tracking-widest mb-3 uppercase">TARIFLAR</p>
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
            <div key={p.name} className={`rounded-2xl p-6 border flex flex-col justify-between transition-all duration-300 relative ${p.featured ? "bg-gradient-to-b from-[#13131c] to-[#0e0e14] border-[#d5ff45]/50 shadow-lg shadow-[#d5ff45]/5 hover:scale-[1.02]" : "bg-[#0e0e14] border-[#1e1e2c] hover:border-[#6b6b80]/30"}`}>
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold bg-[#d5ff45] text-[#07070a] rounded-full px-3 py-1 uppercase shadow-[0_0_10px_rgba(232,255,71,0.2)]">
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
                  className={`block text-center py-3 rounded-xl text-xs font-bold transition duration-200 ${p.featured ? "bg-[#d5ff45] text-[#07070a] hover:bg-[#d6eb3b] shadow-md shadow-[#d5ff45]/10" : "border border-[#1e1e2c] text-white hover:border-[#d5ff45]/30 hover:bg-[#13131c]"}`}
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
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 relative border-t border-[#1e1e2c]">
        <div className="text-center mb-16">
          <p className="text-[#d5ff45] text-xs font-mono font-bold tracking-widest mb-3 uppercase">FAQ</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white">Tez-tez so'raladigan savollar</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: "ZenFit qaysi zallar va shaxslar uchun mos keladi?", a: "Platformamiz o'z natijasini yaxshilamoqchi bo'lgan havaskor sportchilar, mijozlari bilan faol aloqa o'rnatmoqchi bo'lgan murabbiylar hamda zal monitoringi va retention (mijozlarni saqlab qolish) tizimini o'rnatmoqchi bo'lgan gym egalari uchun mos." },
            { q: "AI plans va ovqat kaloriyasini qanday hisoblaydi?", a: "Siz profilingiz va yoshingiz, vazningizni kiritganingizdan so'ng, AI sizning kunlik ehtiyojingizni (BMR/TDEE) aniqlaydi. Yozgan taomlaringizni tahlil qilib, kaloriya, protein va boshqa makronutrientlarni soniyalar ichida chiqaradi." },
            { q: "O'zbekiston milliy taomlari bazasi qanchalik aniq?", a: "Bizning ma'lumotlar bazamizda 200 dan ortiq mahalliy taomlarimiz (palov, somsa, sho'rva, manti) va O'rta Osiyo oshpazlik o'lchamlari bo'yicha kaloriyalar optimallashtirilgan." },
            { q: "Telegram orqali qanday ulanish mumkin?", a: "Ro'yxatdan o'tganingizdan keyin @zenfituzbot ga ulanasiz va barcha mashg'ulotlar, suv va ovqat yozish ishlarini to'g'ridan-to'g'ri Telegram Mini App orqali bajarasiz." },
            { q: "Bepul rejimda qanday cheklovlar bor?", a: "Bepul rejim abadiy ishlaydi va kuniga 5 tagacha AI trener bilan suhbat, oyiga 1 marotaba yangi mashq rejasi va streak/ovqat trackerini taklif qiladi." },
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

      {/* Action Banner */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center relative border-t border-[#1e1e2c]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#d5ff45]/5 blur-3xl pointer-events-none rounded-full" />
        <h2 className="font-display font-bold text-3xl md:text-5xl mb-4 text-white">Sog'lom hayotni bugundan boshlang</h2>
        <p className="text-[#6b6b80] text-base mb-8 max-w-md mx-auto">AI yordamida tezkor natija, o'yin elementlari va to'liq tahlillar zali.</p>
        <Link href="/register" className="bg-[#d5ff45] text-[#07070a] font-bold px-10 py-4.5 rounded-xl text-base inline-block hover:bg-[#d6eb3b] hover:shadow-[0_0_30px_rgba(232,255,71,0.35)] transition-all duration-300 press">
          Bepul boshlash →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2c] bg-[#0c0c12] px-6 py-12 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#d5ff45] flex items-center justify-center font-bold text-[#07070a] text-xs">V</div>
            <span className="font-display font-black text-sm tracking-tight text-white">ZenFit AI</span>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-[#6b6b80] justify-center">
            <a href="#features" className="hover:text-white transition">Xizmatlar</a>
            <a href="#wearable" className="hover:text-white transition">Wearables</a>
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
