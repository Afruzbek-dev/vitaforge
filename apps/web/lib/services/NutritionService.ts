import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export interface FoodLogEntry {
  id?: string;
  food_name: string;
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at?: string;
}

export interface DailyNutritionSummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  entries: number;
}

export class NutritionService {
  /**
   * Logs a new food entry for the current user.
   */
  static async logFood(entry: FoodLogEntry): Promise<FoodLogEntry> {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const sb = getSupabase();
    const { data, error } = await sb
      .from("food_logs")
      .insert({
        ...entry,
        member_id: user.id,
        logged_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to log food: ${error.message}`);
    return data;
  }

  /**
   * Retrieves the food log for a specific date (defaults to today).
   */
  static async getLogForDate(date?: string): Promise<FoodLogEntry[]> {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    
    const target = date ?? new Date().toISOString().split("T")[0];
    const sb = getSupabase();
    
    const { data, error } = await sb
      .from("food_logs")
      .select("*")
      .eq("member_id", user.id)
      .gte("logged_at", `${target}T00:00:00`)
      .lte("logged_at", `${target}T23:59:59`)
      .order("logged_at", { ascending: true });

    if (error) throw new Error(`Failed to fetch food logs: ${error.message}`);
    return data ?? [];
  }

  /**
   * Searches for foods in the database.
   */
  static async searchFoods(query: string) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("uzbek_foods")
      .select("*")
      .or(`name_uz.ilike.%${query}%,name_ru.ilike.%${query}%`)
      .limit(20);

    if (error) throw new Error(`Search failed: ${error.message}`);
    return data ?? [];
  }

  /**
   * Returns a summary of today's nutrition.
   */
  static async getTodaySummary(): Promise<DailyNutritionSummary> {
    const logs = await this.getLogForDate();
    
    const summary = logs.reduce((acc, r) => ({
      total_calories: acc.total_calories + (r.calories || 0),
      total_protein: acc.total_protein + (r.protein_g || 0),
      total_carbs: acc.total_carbs + (r.carbs_g || 0),
      total_fat: acc.total_fat + (r.fat_g || 0),
      entries: acc.entries + 1
    }), { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, entries: 0 });

    return summary;
  }

  /**
   * Parses natural language into a food log entry using DB or AI fallback.
   */
  static async parseFoodText(text: string) {
    const sb = getSupabase();
    // 1. Try DB lookup first
    const { data } = await sb
      .from("uzbek_foods")
      .select("*")
      .or(`name_uz.ilike.%${text}%,aliases.cs.{${text.toLowerCase()}}`)
      .limit(1)
      .single();

    if (data) {
      const serving = data.serving_size_g || 100;
      const mult = serving / 100;
      return {
        food_name: data.name_uz,
        quantity_g: serving,
        calories: Math.round(data.calories_per_100g * mult),
        protein_g: Math.round(data.protein_g * mult),
        carbs_g: Math.round(data.carbs_g * mult),
        fat_g: Math.round(data.fat_g * mult),
        confidence: 0.9
      };
    }

    // 2. Fallback to AI
    const { parseFood } = await import("@/lib/ai");
    return await parseFood(text);
  }
}
