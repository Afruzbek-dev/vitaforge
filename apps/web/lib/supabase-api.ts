// Direct Supabase data layer — now refactored as a facade over deep domain services
import { AuthService } from "./services/AuthService";
import { UserService } from "./services/UserService";
import { OnboardingService } from "./services/OnboardingService";
import { FitnessPlanService } from "./services/FitnessPlanService";
import { NutritionService } from "./services/NutritionService";
import { ProgressPhotoService } from "./services/ProgressPhotoService";
import { GymService } from "./services/GymService";
import { LeaderboardService } from "./services/LeaderboardService";
import { NotificationService } from "./services/NotificationService";

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
};
