// ═══ ZenFit SaaS — Shared TypeScript Types ═══

// ── Auth & Users ──
export type UserRole = "member" | "trainer" | "gym_owner" | "admin";

export interface User {
  id: string;
  telegram_id?: string | null;
  full_name: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  gym_id?: string | null;
  settings?: UserSettings | null;
  created_at?: string;
}

export interface UserSettings {
  daily_calories?: number;
  daily_protein?: number;
  daily_carbs?: number;
  daily_fat?: number;
  language?: "uz" | "ru" | "en";
  theme?: "dark" | "light";
  notifications?: {
    payments?: boolean;
    reminders?: boolean;
    news?: boolean;
  };
}

// ── Gym ──
export type SubscriptionPlan = "basic" | "pro" | "enterprise";

export interface Gym {
  id: string;
  name: string;
  slug?: string;
  owner_id: string;
  address?: string | null;
  phone?: string | null;
  logo_url?: string | null;
  subscription_plan?: SubscriptionPlan;
  created_at?: string;
  deleted_at?: string | null;
}

export interface GymStats {
  totalMembers: number;
  activeTrainers: number;
  monthlyRevenue: number;
  churnRate: number;
  todayAttendance: number;
  newToday: number;
}

// ── Trainers ──
export interface Trainer {
  id: string;
  user_id: string;
  gym_id: string;
  specialization?: string | null;
  schedule?: Record<string, string> | null;
  bio?: string | null;
  max_clients?: number;
  created_at?: string;
  // Joined fields
  user?: User;
}

// ── Members ──
export type MembershipType = "monthly" | "quarterly" | "annual" | "drop-in";
export type MembershipStatus = "active" | "expiring" | "expired" | "frozen";

export interface Member {
  id: string;
  user_id: string;
  gym_id: string;
  trainer_id?: string | null;
  membership_type?: MembershipType;
  start_date?: string;
  end_date?: string;
  status?: MembershipStatus;
  created_at?: string;
  // Joined fields
  user?: User;
}

// ── Payments ──
export type PaymentStatus = "pending" | "submitted" | "confirmed" | "overdue" | "rejected";
export type PaymentType = "monthly" | "annual" | "drop-in" | "quarterly";
export type Currency = "UZS" | "USD";

export interface Payment {
  id: string;
  member_id: string;
  gym_id: string;
  amount: number;
  currency: Currency;
  type: PaymentType;
  status: PaymentStatus;
  due_date?: string | null;
  paid_date?: string | null;
  confirmed_by?: string | null;
  receipt_url?: string | null;
  note?: string | null;
  reject_reason?: string | null;
  created_at?: string;
  // Joined fields
  member?: User;
}

// ── Attendance ──
export interface Attendance {
  id: string;
  member_id: string;
  gym_id: string;
  checked_in_at?: string;
  checked_out_at?: string | null;
  duration_minutes?: number | null;
  source?: "app" | "manual" | "qr";
  created_at?: string;
}

// ── Nutrition ──
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface NutritionLog {
  id: string;
  user_id: string;
  date: string;
  meal_type: MealType;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion_grams?: number;
  created_at?: string;
}

export interface Food {
  id: string;
  user_id?: string | null;
  name: string;
  calories_per_100g: number;
  protein: number;
  carbs: number;
  fat: number;
  is_custom: boolean;
  created_at?: string;
}

export interface DailySummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

// ── Retention & Churn ──
export type RiskLevel = "active" | "recovering" | "at_risk" | "critical" | "lost";

export interface MemberRisk {
  id: string;
  name: string;
  telegramId?: string | null;
  phone?: string | null;
  lastActivity?: string | null;
  currentStreak?: number;
  riskLevel: RiskLevel;
  daysInactive: number;
}

export interface ChurnMetrics {
  churnRate: number;
  churnRateLastMonth: number;
  retentionRate: number;
  atRiskCount: number;
  lostCount: number;
  revenueAtRisk: number;
}

// ── Gamification ──
export interface MemberStreak {
  member_id: string;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  last_activity?: string | null;
  badges: string[];
}

// ── Telegram ──
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramInitData {
  user?: TelegramUser;
  auth_date?: number;
  hash?: string;
  query_id?: string;
}

// ── API Response ──
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ── Component Props ──
export interface NavLink {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: string;
}
