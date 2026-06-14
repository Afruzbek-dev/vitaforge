// ZenFit — Event Tracking (Aha Moments)
// PostHog yoki Mixpanel qo'shilganda shu funksiyalar ishlatiladi

type EventName =
  | "plan_generated"
  | "first_food_logged"
  | "first_photo_uploaded"
  | "streak_7_reached"
  | "streak_30_reached"
  | "leaderboard_viewed"
  | "challenge_joined"
  | "referral_shared"
  | "onboarding_completed"
  | "workout_completed";

export function trackEvent(event: EventName, props?: Record<string, any>) {
  // 1. Console (dev)
  if (process.env.NODE_ENV === "development") {
    console.log(`[Track] ${event}`, props);
  }

  // 2. PostHog (production — qo'shilganda)
  // if (typeof window !== "undefined" && (window as any).posthog) {
  //   (window as any).posthog.capture(event, props);
  // }

  // 3. Supabase audit_logs (lightweight alternative)
  if (typeof window !== "undefined") {
    fetch("/api/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: event, entity: "event", payload: { ...props, timestamp: new Date().toISOString() } }),
    }).catch(() => {});
  }
}

// Aha moment milestones
export const AHA_MOMENTS = {
  PLAN_GENERATED: "plan_generated",       // Birinchi plan = "wow"
  FIRST_FOOD: "first_food_logged",        // Ovqat tracking boshladi
  FIRST_PHOTO: "first_photo_uploaded",    // Progress commitment
  STREAK_7: "streak_7_reached",           // Habit formed
  LEADERBOARD: "leaderboard_viewed",      // Competition hissi
} as const;
