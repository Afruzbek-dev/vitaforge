/*
  API Layer — 3 mode:
  1. DEMO_MODE=true → mock data (hech narsa kerak emas)
  2. SUPABASE_MODE=true → Supabase direct (faqat Supabase keys kerak)
  3. default → FastAPI backend (to'liq stack)
*/

import { mockApi } from "./mock-api";
import { supabaseApi } from "./supabase-api";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const SUPABASE_MODE = process.env.NEXT_PUBLIC_SUPABASE_MODE === "true";

// FastAPI backend API (for production with full stack)
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
  return json;
}

const backendApi = {
  auth: {
    login: (email: string, password: string) => request<any>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (data: any) => request<any>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    logout: () => request<any>("/auth/logout", { method: "POST" }),
  },
  users: {
    me: () => request<any>("/users/me"),
    stats: () => request<any>("/users/me/stats"),
    update: (data: any) => request<any>("/users/me", { method: "PUT", body: JSON.stringify(data) }),
  },
  onboarding: {
    status: () => request<any>("/onboarding/status"),
    saveProfile: (data: any) => request<any>("/onboarding/profile", { method: "POST", body: JSON.stringify(data) }),
  },
  plans: {
    current: () => request<any>("/plans/current"),
    history: () => request<any>("/plans/history"),
    generate: () => request<any>("/plans/generate", { method: "POST", body: JSON.stringify({}) }),
  },
  food: {
    log: (data: any) => request<any>("/food/log", { method: "POST", body: JSON.stringify(data) }),
    getLog: (date?: string) => request<any>(`/food/log${date ? `?date=${date}` : ""}`),
    search: (q: string) => request<any>(`/food/search?q=${encodeURIComponent(q)}`),
    summary: (week?: number) => request<any>(`/food/summary${week ? `?week=${week}` : ""}`),
    parse: (text: string) => request<any>("/food/parse", { method: "POST", body: JSON.stringify({ text }) }),
  },
  photos: {
    upload: (formData: FormData) => { const token = getToken(); return fetch(`${BASE}/photos/upload`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData }).then((r) => r.json()); },
    history: () => request<any>("/photos/history"),
    compare: (w1: number, w2: number) => request<any>(`/photos/compare?week1=${w1}&week2=${w2}`),
  },
  gym: {
    members: () => request<any>("/gym/members"),
    member: (id: string) => request<any>(`/gym/members/${id}`),
    retention: () => request<any>("/gym/analytics/retention"),
    churnRisk: () => request<any>("/gym/analytics/churn-risk"),
    analyticsSummary: () => request<any>("/gym/analytics/summary"),
    revenueDynamics: () => request<any>("/gym/analytics/revenue"),
    memberGrowth: () => request<any>("/gym/analytics/growth"),
    activityDistribution: () => request<any>("/gym/analytics/activity"),
    challenge: () => request<any>("/gym/challenge"),
    createChallenge: (data: any) => request<any>("/gym/challenge", { method: "POST", body: JSON.stringify(data) }),
    copilotMessages: () => request<any>("/gym/copilot/messages"),
    sendCopilotMessage: (msg: string) => request<any>("/gym/copilot/messages", { method: "POST", body: JSON.stringify({ message: msg }) }),
    settings: () => request<any>("/gym/settings"),
    updateSettings: (data: any) => request<any>("/gym/settings", { method: "PUT", body: JSON.stringify(data) }),
    sendMessage: (data: any) => request<any>("/gym/messages", { method: "POST", body: JSON.stringify(data) }),
    checkIn: (memberId: string) => request<any>(`/gym/members/${memberId}/check-in`, { method: "POST" }),
  },
  leaderboard: {
    get: () => request<any>("/leaderboard"),
    myRank: () => request<any>("/leaderboard/my-rank"),
  },
  notifications: {
    list: () => request<any>("/notifications"),
    markRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: "PUT" }),
  },
  trainer: {
    today: () => request<any>("/trainer/today"),
    clients: () => request<any>("/trainer/clients"),
    schedule: () => request<any>("/trainer/schedule"),
    analytics: () => request<any>("/trainer/analytics"),
    copilot: () => request<any>("/trainer/copilot"),
    sendMessage: (data: any) => request<any>("/trainer/copilot", { method: "POST", body: JSON.stringify(data) }),
    addSession: () => request<any>("/trainer/schedule", { method: "POST" }),
  },
  admin: {
    overview: () => request<any>("/admin/overview"),
    gyms: () => request<any>("/admin/gyms"),
    billing: () => request<any>("/admin/billing"),
    aiUsage: () => request<any>("/admin/ai-usage"),
    copilot: () => request<any>("/admin/copilot"),
    exportReport: () => request<any>("/admin/export", { method: "POST" }),
  }
};

// Priority: DEMO > SUPABASE > BACKEND
export const api: typeof backendApi = (DEMO_MODE ? mockApi : SUPABASE_MODE ? supabaseApi : backendApi) as any;
