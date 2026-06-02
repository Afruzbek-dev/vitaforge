// Demo mock data — haqiqiy API o'rniga ishlatiladi

export const DEMO_USERS = {
  member: {
    id: "demo-member-1",
    role: "member",
    full_name: "Jasur Toshmatov",
    gym_id: "demo-gym-1",
    phone: "+998901234567",
    avatar_url: null,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  gym_owner: {
    id: "demo-owner-1",
    role: "gym_owner",
    full_name: "Sardor Yusupov",
    gym_id: "demo-gym-1",
    phone: "+998901111111",
    avatar_url: null,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
};

export const DEMO_STATS = {
  current_streak: 7,
  longest_streak: 14,
  total_points: 340,
  badges: ["7_day_streak", "first_photo", "first_checkin"],
  total_attendance: 23,
};

export const DEMO_PLAN = {
  id: "demo-plan-1",
  member_id: "demo-member-1",
  generated_by: "ai",
  week_number: 23,
  starts_at: "2025-06-02",
  ends_at: "2025-06-08",
  workouts: [
    {
      day: "Dushanba",
      type: "strength",
      duration_min: 60,
      exercises: [
        { name: "Skvat", sets: 4, reps: "8-10", rest_sec: 90, notes: "Tizzalar oyoq barmog'idan chiqmasin" },
        { name: "Bench press", sets: 4, reps: "8-10", rest_sec: 90, notes: "Ko'krak to'liq siqilsin" },
        { name: "Yon tortish (lat pulldown)", sets: 3, reps: "10-12", rest_sec: 60, notes: "" },
      ],
    },
    {
      day: "Seshanba",
      type: "cardio",
      duration_min: 30,
      exercises: [
        { name: "Yugurish (treadmill)", sets: 1, reps: "30 daqiqa", rest_sec: 0, notes: "Yurak urishi 130-150 bpm" },
      ],
    },
    { day: "Chorshanba", type: "rest", duration_min: 0, exercises: [] },
    {
      day: "Payshanba",
      type: "strength",
      duration_min: 55,
      exercises: [
        { name: "Deadlift", sets: 4, reps: "6-8", rest_sec: 120, notes: "Bel to'g'ri tursin" },
        { name: "Dumbbell press (yelka)", sets: 3, reps: "10-12", rest_sec: 60, notes: "" },
        { name: "Bicep curl", sets: 3, reps: "12-15", rest_sec: 45, notes: "" },
      ],
    },
    {
      day: "Juma",
      type: "strength",
      duration_min: 50,
      exercises: [
        { name: "Pull-up", sets: 4, reps: "max", rest_sec: 90, notes: "To'liq kengaytiring" },
        { name: "Tricep dips", sets: 3, reps: "12-15", rest_sec: 60, notes: "" },
        { name: "Plank", sets: 3, reps: "60 sekund", rest_sec: 45, notes: "" },
      ],
    },
    { day: "Shanba", type: "active_recovery", duration_min: 30, exercises: [{ name: "Yurish", sets: 1, reps: "30 daqiqa", rest_sec: 0, notes: "" }] },
    { day: "Yakshanba", type: "rest", duration_min: 0, exercises: [] },
  ],
  nutrition: {
    daily_calories: 2400,
    protein_g: 180,
    carbs_g: 270,
    fat_g: 70,
    meal_timing: "Nonushta 8:00, Tushlik 13:00, Kechki 18:00",
    uzbek_foods_suggested: ["Qaynatilgan tovuq", "Guruch (oz yog'li)", "Tuxum", "Shurpa"],
    avoid: ["Qo'y dumba yog'i ko'p osh", "Somsa", "Gazlangan ichimliklar"],
  },
  ai_model: "claude-sonnet-4-5",
  ai_prompt_version: "v1.2",
  notes: null,
  is_active: true,
  created_at: "2025-06-02T08:00:00Z",
};

export const DEMO_FOOD_LOGS = [
  { id: "f1", member_id: "demo-member-1", logged_at: new Date().toISOString(), meal_type: "breakfast", food_name: "Tuxum (qaynatilgan)", quantity_g: 120, calories: 186, protein_g: 15.6, carbs_g: 1.3, fat_g: 13.2, is_uzbek: true, ai_parsed: true },
  { id: "f2", member_id: "demo-member-1", logged_at: new Date().toISOString(), meal_type: "breakfast", food_name: "Non (bug'doy)", quantity_g: 80, calories: 196, protein_g: 7.2, carbs_g: 38.4, fat_g: 1.6, is_uzbek: true, ai_parsed: false },
  { id: "f3", member_id: "demo-member-1", logged_at: new Date().toISOString(), meal_type: "lunch", food_name: "Shurpa (tovuq)", quantity_g: 400, calories: 220, protein_g: 23.2, carbs_g: 14.0, fat_g: 8.0, is_uzbek: true, ai_parsed: true },
  { id: "f4", member_id: "demo-member-1", logged_at: new Date().toISOString(), meal_type: "lunch", food_name: "Guruch (qaynatilgan)", quantity_g: 200, calories: 260, protein_g: 5.4, carbs_g: 56.0, fat_g: 0.6, is_uzbek: true, ai_parsed: false },
];

export const DEMO_FOOD_SUMMARY = {
  week: 23,
  total_calories: 14250,
  total_protein: 1120,
  total_carbs: 1680,
  total_fat: 420,
  entries: 28,
};

export const DEMO_PHOTOS = [
  {
    id: "p1", member_id: "demo-member-1", photo_type: "front", taken_at: "2025-05-05",
    week_number: 19, ai_score: 6.5, is_private: true, created_at: "2025-05-05T10:00:00Z",
    url: "https://placehold.co/400x500/6366f1/white?text=Hafta+19",
    ai_analysis: { encouragement: "Ajoyib boshlang'ich! Davom eting!", score: 6.5, body_composition: "Yaxshi boshlanish nuqtasi", visible_changes: [], areas_to_improve: ["Qorin mushaklari"], adjustments: [], week_comparison: "Birinchi hafta" },
  },
  {
    id: "p2", member_id: "demo-member-1", photo_type: "front", taken_at: "2025-05-19",
    week_number: 21, ai_score: 7.2, is_private: true, created_at: "2025-05-19T10:00:00Z",
    url: "https://placehold.co/400x500/8b5cf6/white?text=Hafta+21",
    ai_analysis: { encouragement: "2 haftada sezilarli o'zgarish!", score: 7.2, body_composition: "Mushak tonusi yaxshilandi", visible_changes: ["Yelka kenglashdi", "Qorin tekislashdi"], areas_to_improve: ["Oyoq mushaklari"], adjustments: [{ type: "workout", suggestion: "Oyoq kuni qo'shing" }], week_comparison: "19-haftadan +0.7 ball" },
  },
  {
    id: "p3", member_id: "demo-member-1", photo_type: "front", taken_at: "2025-06-02",
    week_number: 23, ai_score: 7.8, is_private: true, created_at: "2025-06-02T10:00:00Z",
    url: "https://placehold.co/400x500/4f46e5/white?text=Hafta+23",
    ai_analysis: { encouragement: "Zo'r progress! Maqsadga yaqinlashyapsiz!", score: 7.8, body_composition: "Mushaklar aniq ko'rinmoqda", visible_changes: ["Bel ingichkalashdi", "Kuch oshdi"], areas_to_improve: ["Kardio davom etsin"], adjustments: [], week_comparison: "21-haftadan +0.6 ball" },
  },
];

export const DEMO_LEADERBOARD = [
  { rank: 1, member_id: "u1", full_name: "Bobur Rahimov", points: 520, streak: 14, badges: ["30_day_streak"] },
  { rank: 2, member_id: "u2", full_name: "Dilnoza Karimova", points: 480, streak: 10, badges: ["7_day_streak"] },
  { rank: 3, member_id: "demo-member-1", full_name: "Jasur Toshmatov", points: 340, streak: 7, badges: ["7_day_streak", "first_photo"] },
  { rank: 4, member_id: "u3", full_name: "Mansur Xoliqov", points: 290, streak: 5, badges: [] },
  { rank: 5, member_id: "u4", full_name: "Zulfiya Nazarova", points: 240, streak: 3, badges: ["first_checkin"] },
];

export const DEMO_GYM_MEMBERS = [
  { id: "demo-member-1", full_name: "Jasur Toshmatov", phone: "+998901234567", goal: "muscle_gain", onboarding_done: true },
  { id: "u1", full_name: "Bobur Rahimov", phone: "+998907654321", goal: "weight_loss", onboarding_done: true },
  { id: "u2", full_name: "Dilnoza Karimova", phone: "+998909876543", goal: "health", onboarding_done: true },
  { id: "u3", full_name: "Mansur Xoliqov", phone: "+998901122334", goal: "muscle_gain", onboarding_done: false },
  { id: "u4", full_name: "Zulfiya Nazarova", phone: "+998905544332", goal: "endurance", onboarding_done: true },
  { id: "u5", full_name: "Sherzod Mirzayev", phone: null, goal: null, onboarding_done: false },
];

export const DEMO_RETENTION = {
  total_members: 6,
  active_last_30_days: 4,
  retention_rate: 66.7,
};

export const DEMO_CHURN = {
  at_risk_members: [
    { id: "u3", full_name: "Mansur Xoliqov" },
    { id: "u5", full_name: "Sherzod Mirzayev" },
  ],
  count: 2,
};

export const DEMO_NOTIFICATIONS = [
  { id: "n1", type: "plan_ready", title: "✅ Yangi plan tayyor!", body: "Bu haftaning fitness va nutrition plani tayyorlandi", data: {}, sent_via: ["push"], read_at: null, created_at: new Date().toISOString() },
  { id: "n2", type: "streak_reminder", title: "🔥 Streak davom etmoqda!", body: "7 kunlik streak! Bugun ham faol bo'ling", data: {}, sent_via: [], read_at: new Date().toISOString(), created_at: new Date(Date.now() - 86400000).toISOString() },
];
