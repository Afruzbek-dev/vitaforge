// ZenFit — Telegram Persistent Session
// Priority: CloudStorage → localStorage → fallback

const TG = () => typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null;

export async function saveToken(token: string, user: any) {
  // 1. Telegram CloudStorage (cross-device sync)
  const tg = TG();
  if (tg?.CloudStorage) {
    await new Promise<void>((resolve) => { tg.CloudStorage.setItem("zf_token", token, () => resolve()); });
    await new Promise<void>((resolve) => { tg.CloudStorage.setItem("zf_user", JSON.stringify(user), () => resolve()); });
  }
  // 2. localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
    localStorage.setItem("zenfit_user", JSON.stringify(user));
    localStorage.setItem("zf_token_exp", String(Date.now() + 30 * 24 * 60 * 60 * 1000));
  }
}

export async function loadToken(): Promise<{ token: string; user: any } | null> {
  // 1. CloudStorage
  const tg = TG();
  if (tg?.CloudStorage) {
    const token = await new Promise<string | null>((resolve) => { tg.CloudStorage.getItem("zf_token", (_: any, v: string) => resolve(v || null)); });
    const userStr = await new Promise<string | null>((resolve) => { tg.CloudStorage.getItem("zf_user", (_: any, v: string) => resolve(v || null)); });
    if (token && userStr) return { token, user: JSON.parse(userStr) };
  }
  // 2. localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    const userStr = localStorage.getItem("zenfit_user");
    const exp = Number(localStorage.getItem("zf_token_exp") || 0);
    if (token && userStr && Date.now() < exp) return { token, user: JSON.parse(userStr) };
  }
  return null;
}

export async function clearSession() {
  const tg = TG();
  if (tg?.CloudStorage) {
    tg.CloudStorage.removeItem("zf_token", () => {});
    tg.CloudStorage.removeItem("zf_user", () => {});
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("zenfit_user");
    localStorage.removeItem("zf_token_exp");
  }
}
