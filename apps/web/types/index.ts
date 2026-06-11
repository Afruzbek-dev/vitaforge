export type UserRole = 'gym_owner' | 'trainer' | 'member' | 'admin'

export interface User {
  id: string; full_name: string; role: UserRole
  gym_id: string | null; avatar_url: string | null; is_active: boolean
}
export interface Exercise {
  name: string; sets: number; reps: string; rest_sec: number; notes: string
}
export interface WorkoutDay {
  day: string; type: 'strength'|'cardio'|'rest'|'active_recovery'
  duration_min: number; exercises: Exercise[]
}
export interface Nutrition {
  daily_calories: number; protein_g: number; carbs_g: number; fat_g: number
  meal_timing: string; uzbek_foods_suggested: string[]; avoid: string[]
}
export interface FitnessPlan {
  id: string; week_number: number; starts_at: string; ends_at: string
  workouts: WorkoutDay[]; nutrition: Nutrition; weekly_goal: string
  motivation: string; generated_by: 'ai'|'trainer'|'hybrid'; is_active: boolean
}
export interface FoodLog {
  id: string; meal_type: string; food_name: string
  quantity_g: number|null; calories: number|null
  protein_g: number|null; carbs_g: number|null; fat_g: number|null; logged_at: string
}
export interface UzbekFood {
  id: string; name_uz: string; name_ru: string
  calories_per_100g: number; protein_g: number; carbs_g: number
  fat_g: number; serving_size_g: number; category: string
}
export interface ProgressPhoto {
  id: string; photo_type: string; taken_at: string; week_number: number
  ai_score: number|null; url: string; analyzed_at: string|null
  ai_analysis: { score: number; body_composition: string; visible_changes: string[]
    areas_to_improve: string[]; encouragement: string; next_week_focus: string } | null
}
export interface MemberStreak {
  current_streak: number; longest_streak: number; total_points: number
  badges: string[]; last_activity: string
}
export interface LeaderboardEntry { user_id: string; name: string; points: number; rank?: number }
export interface RetentionStats {
  retention_rate: number; active_members: number; total_members: number; period_days: number
}
export interface GymMember { id: string; full_name: string; role: UserRole; streak?: MemberStreak }
export interface ApiResponse<T> { success: boolean; data: T; meta?: Record<string,unknown> }
