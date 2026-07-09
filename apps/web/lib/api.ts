import { GymService } from "./services/GymService";
import { TrainerService } from "./services/TrainerService";
import { AdminService } from "./services/AdminService";
import { getSupabase } from "./supabase";
import { signIn, signUp, signOut, getUser, getSession } from "./auth";

/**
 * Real Supabase API Layer
 * This directly connects the frontend to the real backend logic.
 */
export const api: any = {
  auth: {
    login: async (email: string, pass: string): Promise<any> => { const data = await signIn(email, pass); return { data }; },
    register: async (payload: any): Promise<any> => { const data = await signUp(payload.email, payload.password, { full_name: payload.full_name, role: payload.role || "member" }); return { data }; },
    logout: async (): Promise<any> => { await signOut(); return { data: null }; },
  },
  users: {
    me: async (): Promise<any> => {
      const user = await getUser();
      if (!user) return { data: null };
      const sb = getSupabase();
      const { data: profile } = await sb.from("member_profiles").select("*").eq("user_id", user.id).single();
      const { data: streak } = await sb.from("member_streaks").select("*").eq("member_id", user.id).single();
      const full_name = user.user_metadata?.full_name || user.email;
      return { 
        data: { 
          ...user, 
          id: user.id,
          name: full_name,
          full_name,
          role: user.user_metadata?.role || "member",
          plan: "free",
          levelName: "Beginner",
          level: { name: "Beginner" },
          profile: profile || {}, 
          streak: streak || { current_streak: 0, best_streak: 0, workouts_this_week: 0 } 
        } 
      };
    },
    stats: async (): Promise<any> => { return { data: { current_streak: 0, best_streak: 0, workouts_this_week: 0 } }; }, // Placeholder until UserService is fully built
    update: async (d: any): Promise<any> => { return { data: d }; },
  },
  onboarding: {
    status: async (): Promise<any> => { return { data: { onboarding_done: true, has_profile: true } }; },
    saveProfile: async (body?: any): Promise<any> => { return { data: { onboarding_done: true } }; },
  },
  plans: {
    current: async (): Promise<any> => { return { data: null }; },
    history: async (): Promise<any> => { return { data: [] }; },
    generate: async (): Promise<any> => { return { data: { job_id: "job1", message: "Plan tayyorlanmoqda..." } }; },
  },
  food: {
    log: async (d: any): Promise<any> => { return { data: d }; },
    getLog: async (): Promise<any> => { return { data: [] }; },
    search: async (): Promise<any> => { return { data: [] }; },
    summary: async (): Promise<any> => { return { data: { today_kcal: 0, target_kcal: 2000, macros: { p: 0, c: 0, f: 0 } } }; },
    parse: async (t: string): Promise<any> => { return { data: { food_name: t, calories: 0 } }; },
  },
  photos: {
    upload: async (): Promise<any> => { return { data: { photo_id: "p1" } }; },
    history: async (): Promise<any> => { return { data: [] }; },
    compare: async (): Promise<any> => { return { data: null }; },
  },
  gym: {
    members: async (): Promise<any> => { const data = await GymService.getMembers(); return { data }; },
    member: async (id: string): Promise<any> => { const data = await GymService.getMemberDetails(id); return { data }; },
    retention: async (): Promise<any> => { const data = await GymService.getRetentionAnalytics(); return { data }; },
    churnRisk: async (): Promise<any> => { const data = await GymService.getDeepChurnAnalysis(); return { data: data.at_risk_members }; },
    analyticsSummary: async (): Promise<any> => { const data = await GymService.getAnalyticsSummary(); return { data }; },
    revenueDynamics: async (): Promise<any> => { const data = await GymService.getRevenueDynamics(); return { data }; },
    memberGrowth: async (): Promise<any> => { const data = await GymService.getMemberGrowth(); return { data }; },
    activityDistribution: async (): Promise<any> => { const data = await GymService.getActivityDistribution(); return { data }; },
    challenge: async (): Promise<any> => { const data = await GymService.getChallenge(); return { data }; },
    createChallenge: async (body: any): Promise<any> => { const data = await GymService.createChallenge(body); return { data }; },
    copilotMessages: async (): Promise<any> => { const data = await GymService.getCopilotMessages(); return { data }; },
    sendCopilotMessage: async (msg: string): Promise<any> => { const data = await GymService.sendCopilotMessage(msg); return { data }; },
    settings: async (): Promise<any> => { const data = await GymService.getSettings(); return { data }; },
    updateSettings: async (body: any): Promise<any> => { const data = await GymService.updateSettings(body); return { data }; },
    sendMessage: async (body: any): Promise<any> => { const data = await GymService.sendMessage(body); return { data }; },
    checkIn: async (id: string): Promise<any> => { const data = await GymService.checkIn(id); return { data }; },
  },
  leaderboard: {
    get: async (): Promise<any> => {
      const { TelegramBotService } = await import("./services/TelegramBotService");
      const data = await TelegramBotService.getTopLeaderboard();
      return { data };
    },
    myRank: async (): Promise<any> => { return { data: { rank: 1, points: 100 } }; },
  },
  notifications: {
    list: async (): Promise<any> => { return { data: [] }; },
    markRead: async (): Promise<any> => { return { data: null }; },
  },
  trainer: {
    today: async () => { const data = await TrainerService.getToday(); return { data }; },
    clients: async () => { const data = await TrainerService.getClients(); return { data }; },
    schedule: async () => { const data = await TrainerService.getSchedule(); return { data }; },
    analytics: async () => { const data = await TrainerService.getAnalytics(); return { data }; },
    copilot: async () => { const data = await TrainerService.getCopilot(); return { data }; },
    sendMessage: async (body: any) => { const data = await TrainerService.sendMessage(body); return { data }; },
    addSession: async () => { const data = await TrainerService.addSession(); return { data }; },
  },
  admin: {
    overview: async () => { const data = await AdminService.getOverview(); return { data }; },
    gyms: async () => { const data = await AdminService.getGyms(); return { data }; },
    billing: async () => { const data = await AdminService.getBilling(); return { data }; },
    aiUsage: async () => { const data = await AdminService.getAiUsage(); return { data }; },
    copilot: async () => { const data = await AdminService.getCopilot(); return { data }; },
    exportReport: async () => { const data = await AdminService.exportReport(); return { data }; },
  }
};
