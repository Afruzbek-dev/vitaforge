/**
 * VitaForge AI - Phase 3: Churn Accuracy Test Seed
 * Run this script to populate your local/staging Supabase with 15 test members
 * representing different risk profiles to validate the Churn Engine.
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Uses service key to bypass RLS
);

const GYM_ID = "00000000-0000-0000-0000-000000000001"; // Replace with your test gym ID

// 15 Test profiles mapping exactly to the 5 factors
// 1. Frequency (35)
// 2. Streak (25)
// 3. Payment (20)
// 4. AI usage (10)
// 5. Challenges (10)
const TEST_MEMBERS = [
  // --- LOW RISK (0-39) ---
  { name: "Faol Botir", phone: "+998901111111", attended_recently: true, streak: 12, payment: "confirmed", ai_used: true, challenge_active: true, expectedRisk: "Low" },
  { name: "Yangi a'zo (Kecha kelgan)", phone: "+998902222222", attended_recently: true, streak: 1, payment: "confirmed", ai_used: false, challenge_active: false, expectedRisk: "Low" }, // risk: 10 + 10 = 20
  
  // --- MEDIUM RISK (40-69) ---
  { name: "To'lovi tugagan lekin kelib turadi", phone: "+998903333333", attended_recently: true, streak: 5, payment: "overdue", ai_used: true, challenge_active: true, expectedRisk: "Medium" }, // risk: 20
  { name: "Kam keladigan (Streak buzilgan)", phone: "+998904444444", attended_recently: true, streak: 0, payment: "confirmed", ai_used: false, challenge_active: false, expectedRisk: "Medium" }, // risk: 25 + 10 + 10 = 45
  { name: "Streak bor, lekin 7 kundan beri yo'q", phone: "+998905555555", attended_recently: false, streak: 8, payment: "confirmed", ai_used: true, challenge_active: true, expectedRisk: "Medium" }, // risk: 35
  
  // --- HIGH RISK (70+) ---
  { name: "Uzoq qochgan (Ghost)", phone: "+998906666666", attended_recently: false, streak: 0, payment: "confirmed", ai_used: false, challenge_active: false, expectedRisk: "High" }, // risk: 35 + 25 + 10 + 10 = 80
  { name: "To'lamay ketgan", phone: "+998907777777", attended_recently: false, streak: 0, payment: "overdue", ai_used: false, challenge_active: false, expectedRisk: "High" }, // risk: 35 + 25 + 20 + 10 + 10 = 100
];

async function seed() {
  console.log("🌱 Seeding test members for Churn Engine validation...");
  
  for (const t of TEST_MEMBERS) {
    // 1. Create auth user
    const { data: authUser, error: authErr } = await sb.auth.admin.createUser({
      email: `${t.phone.replace("+", "")}@test.com`,
      password: "password123",
      email_confirm: true,
      user_metadata: { full_name: t.name, role: "member" }
    });

    if (authErr) {
      console.error(`Error creating ${t.name}:`, authErr.message);
      continue;
    }

    const userId = authUser.user.id;

    // 2. Assign to gym
    await sb.from("users").update({ gym_id: GYM_ID, phone: t.phone }).eq("id", userId);

    // 3. Insert fake attendance
    if (t.attended_recently) {
      await sb.from("attendance").insert({
        member_id: userId,
        gym_id: GYM_ID,
        checked_in_at: new Date().toISOString() // today
      });
    }

    // 4. Insert Streak
    await sb.from("member_streaks").insert({
      member_id: userId,
      current_streak: t.streak,
      longest_streak: Math.max(t.streak, 5),
      total_points: t.streak * 10
    });

    // 5. Insert Payment
    await sb.from("payments").insert({
      member_id: userId,
      gym_id: GYM_ID,
      amount: 400000,
      currency: "UZS",
      status: t.payment,
      type: "monthly",
      created_at: new Date(Date.now() - 15 * 86400000).toISOString()
    });

    console.log(`✅ Seeded: ${t.name} (Expected: ${t.expectedRisk})`);
  }
  
  console.log("🎉 Seeding complete! Run the Churn Cron to validate scores.");
}

seed();
