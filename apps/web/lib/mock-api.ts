// Mock API — haqiqiy backend o'rniga ishlaydi
// NEXT_PUBLIC_DEMO_MODE=true bo'lsa shu ishlatiladi

import {
  DEMO_USERS, DEMO_STATS, DEMO_PLAN, DEMO_FOOD_LOGS,
  DEMO_FOOD_SUMMARY, DEMO_PHOTOS, DEMO_LEADERBOARD,
  DEMO_GYM_MEMBERS, DEMO_RETENTION, DEMO_CHURN, DEMO_NOTIFICATIONS,
} from "./mock-data";

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function ok<T>(data: T) { return { success: true, data }; }

export const mockApi = {
  auth: {
    login: async (email: string) => {
      await delay();
      const user = email.includes("owner") ? DEMO_USERS.gym_owner : DEMO_USERS.member;
      return ok({ access_token: "demo-token", refresh_token: "demo-refresh", expires_in: 3600, user });
    },
    register: async () => { await delay(); return ok({ user_id: "new-demo", email: "demo@test.com" }); },
    logout: async () => { await delay(); return ok(null); },
  },
  users: {
    me: async () => { await delay(100); return DEMO_USERS.member; },
    stats: async () => { await delay(); return ok(DEMO_STATS); },
    update: async (data: any) => { await delay(); return ok({ ...DEMO_USERS.member, ...data }); },
  },
  onboarding: {
    status: async () => { await delay(100); return ok({ onboarding_done: true, has_profile: true }); },
    saveProfile: async () => { await delay(600); return ok({ onboarding_done: true }); },
  },
  plans: {
    current: async () => { await delay(); return ok(DEMO_PLAN); },
    history: async () => { await delay(); return ok([DEMO_PLAN]); },
    generate: async () => {
      await delay(1500);
      return ok({ job_id: "demo-job-1", message: "Plan tayyorlanmoqda..." });
    },
  },
  food: {
    log: async (data: any) => {
      await delay(300);
      return ok({ id: `f${Date.now()}`, member_id: "demo-member-1", logged_at: new Date().toISOString(), ...data });
    },
    getLog: async () => { await delay(); return ok(DEMO_FOOD_LOGS); },
    search: async (q: string) => {
      await delay(200);
      const foods = [
        { id: "uf1", name_uz: "Osh (palov)", calories_per_100g: 180, protein_g: 5.2, carbs_g: 25, fat_g: 7, serving_size_g: 350 },
        { id: "uf2", name_uz: "Shurpa", calories_per_100g: 65, protein_g: 4.5, carbs_g: 5, fat_g: 3, serving_size_g: 400 },
        { id: "uf3", name_uz: "Manti", calories_per_100g: 195, protein_g: 9.8, carbs_g: 22, fat_g: 8, serving_size_g: 200 },
        { id: "uf4", name_uz: "Tuxum (qaynatilgan)", calories_per_100g: 155, protein_g: 13, carbs_g: 1.1, fat_g: 11, serving_size_g: 60 },
        { id: "uf5", name_uz: "Tovuq go'shti", calories_per_100g: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, serving_size_g: 150 },
      ].filter((f) => f.name_uz.toLowerCase().includes(q.toLowerCase()));
      return ok(foods);
    },
    summary: async () => { await delay(); return ok(DEMO_FOOD_SUMMARY); },
    parse: async (text: string) => {
      await delay(800);
      // Simple mock parse
      const map: Record<string, any> = {
        "osh": { food_name: "Osh (palov)", quantity_g: 350, calories: 630, protein_g: 18, carbs_g: 87, fat_g: 24, confidence: 0.92 },
        "tuxum": { food_name: "Tuxum (qaynatilgan)", quantity_g: 60, calories: 93, protein_g: 7.8, carbs_g: 0.7, fat_g: 6.6, confidence: 0.95 },
        "shurpa": { food_name: "Shurpa", quantity_g: 400, calories: 260, protein_g: 18, carbs_g: 20, fat_g: 12, confidence: 0.88 },
        "tovuq": { food_name: "Tovuq go'shti", quantity_g: 150, calories: 247, protein_g: 46.5, carbs_g: 0, fat_g: 5.4, confidence: 0.9 },
      };
      const key = Object.keys(map).find((k) => text.toLowerCase().includes(k));
      return ok(key ? map[key] : { food_name: text, quantity_g: 100, calories: 150, protein_g: 8, carbs_g: 18, fat_g: 5, confidence: 0.5 });
    },
  },
  photos: {
    upload: async () => { await delay(1200); return ok({ photo_id: `p${Date.now()}`, message: "Foto yuklanmoqda..." }); },
    history: async () => { await delay(); return ok(DEMO_PHOTOS); },
    compare: async () => { await delay(); return ok({ week_19: DEMO_PHOTOS[0], week_23: DEMO_PHOTOS[2] }); },
  },
  gym: {
    members: async () => { await delay(); return ok(DEMO_GYM_MEMBERS); },
    member: async (id: string) => {
      await delay();
      const m = DEMO_GYM_MEMBERS.find((x) => x.id === id) ?? DEMO_GYM_MEMBERS[0];
      return ok({ ...m, profile: { age: 26, goal: m.goal, weight_kg: 82, height_cm: 178 }, streak: { current: 7, total_points: 340, badges: ["7_day_streak"] } });
    },
    retention: async () => { await delay(); return ok(DEMO_RETENTION); },
    churnRisk: async () => { await delay(); return ok(DEMO_CHURN); },
    analyticsSummary: async () => { await delay(); return ok({ mrr: 6240, mrr_delta: "↑ 9.3%", ltv: 184, ltv_delta: "↑ 4.1%", churn_rate: "4.1%", churn_delta: "↑ 0.6%", ai_spend: 31 }); },
    revenueDynamics: async () => { await delay(); return ok([ { label: "Yan", value: 4100 }, { label: "Fev", value: 4800 }, { label: "Mar", value: 5200 }, { label: "Apr", value: 5600 }, { label: "May", value: 5900 }, { label: "Iyun", value: 6240, peak: true } ]); },
    memberGrowth: async () => { await delay(); return ok([ { label: "Yan", value: 120 }, { label: "Fev", value: 145 }, { label: "Mar", value: 168 }, { label: "Apr", value: 189 }, { label: "May", value: 202 }, { label: "Iyun", value: 214, peak: true } ]); },
    activityDistribution: async () => { await delay(); return ok([ { name: "3+ marta keluvchilar (Haftasiga)", pct: "42%" }, { name: "1-2 marta keluvchilar", pct: "38%" }, { name: "Xavf ostida (0 marta)", pct: "15%" }, { name: "Muzlatilgan", pct: "5%" } ]); },
    challenge: async () => { await delay(); return ok({ title: "30 kunlik temir — Iyun marafoni", days_passed: 18, total_days: 30, progress: 60, participants: 64 }); },
    createChallenge: async () => { await delay(500); return ok({ success: true }); },
    copilotMessages: async () => { await delay(); return ok([ { id: 1, sender: 'ai', text: "Salom, Botir! Men VitaForge AI. Gymingiz bo'yicha qanday ma'lumot kerak?" }, { id: 2, sender: 'user', text: "Kechagi kun bo'yicha kimlar xavf ostida?" }, { id: 3, sender: 'ai', text: "Oxirgi 7 kunda 3 ta a'zo umuman kelmadi: Doniyor, Sevara, Aziz. Ularga avtomatik SMS yuboraymi?" } ]); },
    sendCopilotMessage: async (msg: string) => { await delay(500); return ok({ id: Date.now(), sender: 'user', text: msg }); },
    settings: async () => { await delay(); return ok({ name: "FitZone Gym", location: "Yunusobod, Toshkent", churn_alerts: true, weekly_reports: true }); },
    updateSettings: async (data: any) => { await delay(500); return ok(data); },
    sendMessage: async () => { await delay(500); return ok({ success: true }); },
    checkIn: async () => { await delay(500); return ok({ success: true, streak: 8, points: 350 }); },
  },
  leaderboard: {
    get: async () => { await delay(); return ok(DEMO_LEADERBOARD); },
    myRank: async () => { await delay(100); return ok({ rank: 3, points: 340 }); },
  },
  notifications: {
    list: async () => { await delay(); return ok(DEMO_NOTIFICATIONS); },
    markRead: async () => { await delay(200); return ok(null); },
  },
  trainer: {
    today: async () => { await delay(); return ok({ sessions: [{ time: "14:00", name: "Jasur", workout: "Kuch", status: "ok" }, { time: "15:30", name: "Madina", workout: "Cardio", status: "risk" }, { time: "17:00", name: "Otabek", workout: "Yelka", status: "ok" }], activeClients: 22, avgAdherence: 81 }); },
    clients: async () => { await delay(); return ok([{ id: 1, name: "Jasur Toshmatov", adh: 81, status: "ok" }, { id: 2, name: "Dilnoza Karimova", adh: 42, status: "risk" }, { id: 3, name: "Otabek Rustamov", adh: 88, status: "ok" }, { id: 4, name: "Madina Yuldasheva", adh: 30, status: "risk" }]); },
    schedule: async () => { await delay(); return ok([{ day: "Dushanba", sessions: 6 }, { day: "Seshanba", sessions: 8, active: true }, { day: "Chorshanba", sessions: 5 }, { day: "Payshanba", sessions: 7 }]); },
    analytics: async () => { await delay(); return ok({ totalSessions: 96, avgAdherence: 81, riskClients: 2, revenue: 1840 }); },
    copilot: async () => { await delay(); return ok({ messages: [{ id: 1, sender: "ai", text: "Salom, Coach Aziz! Madina Yuldashevada oxirgi kunlarda charchoq alomatlari sezilmoqda." }] }); },
    sendMessage: async (data: any) => { await delay(500); return ok({ id: Date.now(), sender: 'user', text: data.message }); },
    addSession: async () => { await delay(500); return ok({ success: true }); }
  },
  admin: {
    overview: async () => { await delay(); return ok({ totalGyms: 412, mrr: 18420, apiCost: 1240, churnedGyms: 6, mrrChart: [{ label: "Yan", value: 12 }, { label: "Fev", value: 14 }, { label: "Mar", value: 15 }, { label: "Apr", value: 16 }, { label: "May", value: 17 }, { label: "Iyun", value: 18.4, peak: true }] }); },
    gyms: async () => { await delay(); return ok([{ name: "FitZone", plan: "Pro", status: "ok" }, { name: "PowerFit", plan: "Scale", status: "risk" }]); },
    billing: async () => { await delay(); return ok({ starter: 186, pro: 158, scale: 58, enterprise: 10 }); },
    aiUsage: async () => { await delay(); return ok({ chart: [{ label: "Du", value: 1200 }, { label: "Juma", value: 2500, peak: true }] }); },
    copilot: async () => { await delay(); return ok({ messages: [{ id: 1, sender: "ai", text: "Salom! Men VitaForge Admin Copilotman." }] }); },
    exportReport: async () => { await delay(1000); return ok({ success: true }); }
  }
};
