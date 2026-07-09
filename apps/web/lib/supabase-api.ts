// Direct Supabase data layer — now refactored as a facade over deep domain services
import { mockApi } from "./mock-api";
import { AuthService } from "./services/AuthService";
import { UserService } from "./services/UserService";
import { OnboardingService } from "./services/OnboardingService";
import { FitnessPlanService } from "./services/FitnessPlanService";
import { NutritionService } from "./services/NutritionService";
import { ProgressPhotoService } from "./services/ProgressPhotoService";
import { GymService } from "./services/GymService";
import { LeaderboardService } from "./services/LeaderboardService";
import { NotificationService } from "./services/NotificationService";
import { TrainerService } from "./services/TrainerService";
import { AdminService } from "./services/AdminService";

export const supabaseApi = {
  auth: {
    login: async (email: string, password: string) => await AuthService.login(email, password),
    register: async (body: any) => await AuthService.register(body),
    logout: async () => await AuthService.logout(),
  },

  users: {
    me: async () => await UserService.getMe(),
    stats: async () => {
      const data = await UserService.getStats();
      return { data };
    },
    update: async (body: any) => await UserService.updateMe(body),
  },

  onboarding: {
    status: async () => {
      const data = await OnboardingService.getStatus();
      return { data };
    },
    saveProfile: async (body: any) => {
      const data = await OnboardingService.saveProfile(body);
      return { data };
    },
  },

  plans: {
    current: async () => {
      const data = await FitnessPlanService.getCurrentPlan();
      return { data };
    },
    history: async () => {
      const data = await FitnessPlanService.getPlanHistory();
      return { data };
    },
    generate: async () => {
      const data = await FitnessPlanService.generatePlan();
      return { data };
    },
  },

  food: {
    log: async (body: any) => {
      const { confidence, ...cleanBody } = body;
      const data = await NutritionService.logFood(cleanBody);
      return { data };
    },
    getLog: async (date?: string) => {
      const data = await NutritionService.getLogForDate(date);
      return { data };
    },
    search: async (q: string) => {
      const data = await NutritionService.searchFoods(q);
      return { data };
    },
    summary: async () => {
      const data = await NutritionService.getTodaySummary();
      return { data };
    },
    parse: async (text: string) => {
      const data = await NutritionService.parseFoodText(text);
      return { data };
    },
  },

  photos: {
    upload: async (formData: FormData) => {
      const data = await ProgressPhotoService.uploadPhoto(formData);
      return { data };
    },
    history: async () => {
      const data = await ProgressPhotoService.getHistory();
      return { data };
    },
    compare: async (week1: number, week2: number) => {
      const data = await ProgressPhotoService.compareWeeks(week1, week2);
      return { data };
    },
  },

  gym: {
    members: async () => {
      const data = await GymService.getMembers();
      return { data };
    },
    member: async (id: string) => {
      const data = await GymService.getMemberDetails(id);
      return { data };
    },
    retention: async () => {
      const data = await GymService.getRetentionAnalytics();
      return { data };
    },
    churnRisk: async () => {
      const data = await GymService.getDeepChurnAnalysis();
      return { data };
    },
    analyticsSummary: async () => { const data = await GymService.getAnalyticsSummary(); return { data }; },
    revenueDynamics: async () => { const data = await GymService.getRevenueDynamics(); return { data }; },
    memberGrowth: async () => { const data = await GymService.getMemberGrowth(); return { data }; },
    activityDistribution: async () => { const data = await GymService.getActivityDistribution(); return { data }; },
    challenge: async () => { const data = await GymService.getChallenge(); return { data }; },
    createChallenge: async (body: any) => { const data = await GymService.createChallenge(body); return { data }; },
    copilotMessages: async () => { const data = await GymService.getCopilotMessages(); return { data }; },
    sendCopilotMessage: async (msg: string) => { const data = await GymService.sendCopilotMessage(msg); return { data }; },
    settings: async () => { const data = await GymService.getSettings(); return { data }; },
    updateSettings: async (body: any) => { const data = await GymService.updateSettings(body); return { data }; },
    sendMessage: async (body: any) => { const data = await GymService.sendMessage(body); return { data }; },
    checkIn: async (memberId: string) => { const data = await GymService.checkIn(memberId); return { data }; },
  },

  leaderboard: {
    get: async () => {
      const data = await LeaderboardService.getTopUsers();
      return { data };
    },
    myRank: async () => {
      const data = await LeaderboardService.getMyRank();
      return { data };
    },
  },

  notifications: {
    list: async () => {
      const data = await NotificationService.getList();
      return { data };
    },
    markRead: async (id: string) => await NotificationService.markAsRead(id),
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
  },
};
