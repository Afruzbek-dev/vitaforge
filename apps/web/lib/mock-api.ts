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
  },
  leaderboard: {
    get: async () => { await delay(); return ok(DEMO_LEADERBOARD); },
    myRank: async () => { await delay(100); return ok({ rank: 3, points: 340 }); },
  },
  notifications: {
    list: async () => { await delay(); return ok(DEMO_NOTIFICATIONS); },
    markRead: async () => { await delay(200); return ok(null); },
  },
};
