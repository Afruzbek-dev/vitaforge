// ZenFit Plan/Tier Limits
export type PlanTier = "free" | "starter" | "pro" | "network";

export const PLAN_LIMITS: Record<PlanTier, { ai_chat_daily: number; plans_monthly: number; photo_ai: boolean; max_members: number; churn_prediction: boolean; trainers: number }> = {
  free: { ai_chat_daily: 5, plans_monthly: 1, photo_ai: false, max_members: 0, churn_prediction: false, trainers: 0 },
  starter: { ai_chat_daily: 20, plans_monthly: 4, photo_ai: true, max_members: 100, churn_prediction: false, trainers: 1 },
  pro: { ai_chat_daily: 999, plans_monthly: 999, photo_ai: true, max_members: 500, churn_prediction: true, trainers: 5 },
  network: { ai_chat_daily: 999, plans_monthly: 999, photo_ai: true, max_members: 99999, churn_prediction: true, trainers: 999 },
};

export function getPlanLimits(plan?: string) {
  return PLAN_LIMITS[(plan as PlanTier) ?? "free"];
}
