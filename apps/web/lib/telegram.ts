// Telegram Mini App utilities
// Web App ichida Telegram WebApp API bilan ishlash

export function isTelegramWebApp(): boolean {
  return typeof window !== "undefined" && !!(window as any).Telegram?.WebApp;
}

export function getTelegramWebApp() {
  if (!isTelegramWebApp()) return null;
  return (window as any).Telegram.WebApp;
}

export function getTelegramUser() {
  const wa = getTelegramWebApp();
  if (!wa?.initDataUnsafe?.user) return null;
  return wa.initDataUnsafe.user as { id: number; first_name: string; last_name?: string; username?: string; };
}

export function getTelegramInitData(): string | null {
  const wa = getTelegramWebApp();
  return wa?.initData ?? null;
}

// Telegram WebApp UI helpers
export function expandWebApp() { getTelegramWebApp()?.expand(); }
export function closeWebApp() { getTelegramWebApp()?.close(); }
export function hapticFeedback(type: "impact" | "notification" | "selection" = "impact") {
  const wa = getTelegramWebApp();
  if (type === "impact") wa?.HapticFeedback?.impactOccurred("medium");
  else if (type === "notification") wa?.HapticFeedback?.notificationOccurred("success");
  else wa?.HapticFeedback?.selectionChanged();
}
