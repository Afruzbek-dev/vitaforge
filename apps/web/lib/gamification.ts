// ═══ VitaForge Gamification System ═══
// Birlik: Kuch ⚡

export const UNIT = { name: "Kuch", emoji: "⚡" };

// Kunlik harakatlar uchun kuch ballari
export const POINTS = {
  daily_workout: 10,      // Mashg'ulot bajarish
  food_log: 5,            // Ovqat yozish
  photo_upload: 20,       // Progress foto
  streak_bonus_7: 50,     // 7 kunlik streak
  streak_bonus_30: 200,   // 30 kunlik streak
  streak_bonus_100: 1000, // 100 kunlik streak
  attendance: 8,          // Gym ga kelish
  chat_interaction: 2,    // AI bilan gaplashish
};

// Level system — har bir level uchun kerakli kuch
export const LEVELS = [
  { name: "Shogird", emoji: "🥋", min: 0, color: "#52526a" },
  { name: "Kurashchi", emoji: "⚔️", min: 100, color: "#5299ff" },
  { name: "Polvon", emoji: "🦁", min: 500, color: "#4dffb4" },
  { name: "Alp", emoji: "🏔️", min: 1500, color: "#e8ff47" },
  { name: "Bahodir", emoji: "🛡️", min: 4000, color: "#ff9f43" },
  { name: "Sohibqiron", emoji: "👑", min: 10000, color: "#ff5252" },
];

// Badges — maxsus yutuqlar
export const BADGES = [
  { id: "temir_iroda", name: "Temir Iroda", emoji: "🔩", description: "7 kun ketma-ket mashq qilish", condition: "7_day_streak" },
  { id: "tong_jangchisi", name: "Tong Jangchisi", emoji: "🌅", description: "5 marta erta (6:00 gacha) gym ga kelish", condition: "early_bird_5" },
  { id: "100_kunlik_galaba", name: "100 Kunlik G'alaba", emoji: "💯", description: "100 kun streak", condition: "100_day_streak" },
  { id: "afsona_polvon", name: "Afsona Polvon", emoji: "🏆", description: "10,000 kuch to'plash (Sohibqiron level)", condition: "level_sohibqiron" },
  { id: "birinchi_qadam", name: "Birinchi Qadam", emoji: "👣", description: "Birinchi mashg'ulotni bajarish", condition: "first_workout" },
  { id: "oziq_nazoratchi", name: "Oziq Nazoratchi", emoji: "🥗", description: "7 kun ketma-ket ovqat yozish", condition: "food_log_7" },
  { id: "kuch_portlashi", name: "Kuch Portlashi", emoji: "💥", description: "1 kunda 50+ kuch olish", condition: "daily_50" },
  { id: "guruh_yulduz", name: "Guruh Yulduzi", emoji: "⭐", description: "Guruh leaderboard da #1 bo'lish", condition: "group_leader" },
];

// Helper: kuch asosida levelni aniqlash
export function getLevel(points: number) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (points >= level.min) current = level;
    else break;
  }
  const idx = LEVELS.indexOf(current);
  const next = LEVELS[idx + 1];
  const progress = next ? Math.min(((points - current.min) / (next.min - current.min)) * 100, 100) : 100;
  return { ...current, index: idx, next, progress: Math.round(progress) };
}

// Helper: earned badges
export function getEarnedBadges(streak: number, totalPoints: number, badges: string[]): typeof BADGES {
  return BADGES.filter((b) => badges.includes(b.id));
}

// Helper: check new badges
export function checkNewBadges(streak: number, totalPoints: number, dailyPoints: number, existingBadges: string[]): string[] {
  const newBadges: string[] = [];
  if (streak >= 7 && !existingBadges.includes("temir_iroda")) newBadges.push("temir_iroda");
  if (streak >= 100 && !existingBadges.includes("100_kunlik_galaba")) newBadges.push("100_kunlik_galaba");
  if (totalPoints >= 10000 && !existingBadges.includes("afsona_polvon")) newBadges.push("afsona_polvon");
  if (dailyPoints >= 50 && !existingBadges.includes("kuch_portlashi")) newBadges.push("kuch_portlashi");
  if (totalPoints > 0 && !existingBadges.includes("birinchi_qadam")) newBadges.push("birinchi_qadam");
  return newBadges;
}
