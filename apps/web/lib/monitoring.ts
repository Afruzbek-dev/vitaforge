// Error monitoring — Sentry alternative (simple error logging)
// Production da Sentry qo'shiladi: npm install @sentry/nextjs

export function reportError(error: unknown, context?: Record<string, any>) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error("[ZenFit Error]", msg, context);

  // Production: Sentry.captureException(error, { extra: context })

  // Log to audit_logs via API (optional)
  if (typeof window !== "undefined" && context?.userId) {
    fetch("/api/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, context, url: window.location.href, timestamp: new Date().toISOString() }),
    }).catch(() => {});
  }
}
