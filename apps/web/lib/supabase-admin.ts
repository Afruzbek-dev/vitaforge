import { createClient } from "@supabase/supabase-js";

// Admin client — faqat server-side (API routes)
// HECH QACHON frontendga chiqmasin
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}
