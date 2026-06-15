// ═══ ZenFit Gamification — O'zbek Kuch Darajalari ═══

export const UNIT = { name: "Kuch", emoji: "⚡" };

export const POINTS = {
  daily_workout: 10,
  food_log: 5,
  photo_upload: 20,
  streak_bonus_7: 50,
  streak_bonus_30: 200,
  streak_bonus_100: 1000,
  attendance: 8,
  chat_interaction: 2,
};

export const LEVELS = [
  { name: "Navkar", emoji: "🗡️", min: 0, color: "#52526a", desc: "Yo'lning boshlanishi" },
  { name: "Askar", emoji: "⚔️", min: 500, color: "#5299ff", desc: "Intizom shakllanmoqda" },
  { name: "Bahodir", emoji: "🛡️", min: 1500, color: "#4dffb4", desc: "Kuch va iroda sinovdan o'tgan" },
  { name: "Alp", emoji: "🏹", min: 3000, color: "#ff9f43", desc: "Eng kuchli jangchilar nomi" },
  { name: "Qo'mondon", emoji: "🦅", min: 5000, color: "#e8ff47", desc: "Boshqalarni ilhomlantirasan" },
  { name: "Manguberdi", emoji: "⚔️", min: 8000, color: "#ff5252", desc: "Matonat va jasorat timsoli" },
  { name: "Sohibqiron", emoji: "👑", min: 12000, color: "#ffd700", desc: "Intizom va buyuklik cho'qqisi" },
  { name: "Turon Afsonasi", emoji: "🦅", min: 20000, color: "#e8ff47", desc: "ZenFit elitasi. Juda kam yetadi." },
];

export const BADGES = [
  { id: "manguberdi_ruhi", name: "Manguberdi Ruhi", emoji: "⚔️", description: "30 kunlik streak", condition: "30_day_streak" },
  { id: "temuriy_intizom", name: "Temuriy Intizom", emoji: "👑", description: "100 ta mashg'ulot bajarish", condition: "100_workouts" },
  { id: "alp_jasorati", name: "Alp Jasorati", emoji: "🏹", description: "50 ta gym check-in", condition: "50_checkins" },
  { id: "tomaris_matonati", name: "To'maris Matonati", emoji: "🛡️", description: "90 kunlik intizom", condition: "90_day_streak" },
  { id: "ulugbek_donishmandligi", name: "Ulug'bek Donishmandligi", emoji: "⭐", description: "Nutrition maqsadini 30 kun bajarish", condition: "nutrition_30" },
  { id: "temir_tana", name: "Temir Tana", emoji: "💪", description: "7 kunlik streak", condition: "7_day_streak" },
  { id: "birinchi_qadam", name: "Birinchi Qadam", emoji: "👣", description: "Birinchi mashg'ulot", condition: "first_workout" },
  { id: "kuch_portlashi", name: "Kuch Portlashi", emoji: "💥", description: "1 kunda 50+ kuch olish", condition: "daily_50" },
  { id: "turon_afsonasi", name: "Turon Afsonasi", emoji: "🦅", description: "20000+ kuch (eng yuqori daraja)", condition: "level_turon" },
];

export function getLevel(points: number) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (points >= level.min) current = level;
    else break;
  }
  const idx = LEVELS.indexOf(current);
  const next = LEVELS[idx + 1];
  const progress = next ? Math.min(Math.round(((points - current.min) / (next.min - current.min)) * 100), 100) : 100;
  return { ...current, index: idx, next, progress, pointsToNext: next ? next.min - points : 0 };
}

export function checkNewBadges(streak: number, totalPoints: number, dailyPoints: number, totalWorkouts: number, totalCheckins: number, existingBadges: string[]): string[] {
  const n: string[] = [];
  if (totalPoints > 0 && !existingBadges.includes("birinchi_qadam")) n.push("birinchi_qadam");
  if (streak >= 7 && !existingBadges.includes("temir_tana")) n.push("temir_tana");
  if (streak >= 30 && !existingBadges.includes("manguberdi_ruhi")) n.push("manguberdi_ruhi");
  if (streak >= 90 && !existingBadges.includes("tomaris_matonati")) n.push("tomaris_matonati");
  if (totalWorkouts >= 100 && !existingBadges.includes("temuriy_intizom")) n.push("temuriy_intizom");
  if (totalCheckins >= 50 && !existingBadges.includes("alp_jasorati")) n.push("alp_jasorati");
  if (dailyPoints >= 50 && !existingBadges.includes("kuch_portlashi")) n.push("kuch_portlashi");
  if (totalPoints >= 20000 && !existingBadges.includes("turon_afsonasi")) n.push("turon_afsonasi");
  return n;
}
