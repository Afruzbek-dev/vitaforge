// VitaForge AI Service — Groq (Llama 3.3 70B, bepul)
const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY ?? "";
const BASE = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

async function groqChat(system: string, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: MODEL, messages: [{ role: "system", content: system }, ...messages], max_tokens: 1500, temperature: 0.7 }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Xatolik yuz berdi";
}

// ─── Plan Generation ────────────────────────────────────────
const PLAN_SYSTEM = `Sen VitaForge AI — O'zbekiston uchun professional dietolog + sport trener.

KALORIYA HISOBLASH QOIDASI (Mifflin-St Jeor):
- Erkak BMR = (10 × vazn) + (6.25 × bo'y) − (5 × yosh) + 5
- Ayol BMR = (10 × vazn) + (6.25 × bo'y) − (5 × yosh) − 161
- TDEE = BMR × faollik (sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9)
- Vazn yo'qotish: TDEE − 300-500 kcal
- Mushak olish: TDEE + 200-400 kcal

MAKRONUTRIENT NISBATI:
- Vazn yo'qotish: Oqsil 30-35%, Uglevod 35-40%, Yog' 25-30%
- Mushak olish: Oqsil 25-30%, Uglevod 45-55%, Yog' 20-25%
- Chidamlilik: Oqsil 20-25%, Uglevod 50-55%, Yog' 25-30%

OVQATLANISH JADVALI:
- Nonushta (07-09): 25-30% kaloriya. Kompleks uglevod + oqsil.
- Tushlik (12-14): 30-35% kaloriya. Oqsil + uglevod + tolali oziq.
- Kechki (18-20): 25-30% kaloriya. Ko'proq oqsil, kam uglevod.
- Mashqdan 1.5-2 soat oldin: uglevod + oqsil.
- Mashqdan 30-60 min keyin: oqsil + tezkor uglevod.

MASHQ QOIDALARI:
- Boshlang'ich: Full-body 3 kun/hafta, past intensivlik, texnika o'rganish.
- O'rtacha: 4 kun split, progressiv zo'riqish.
- Yuqori: 5-6 kun, split + kardio.
- Kam vaqt (2-3 kun): Full-body compound harakatlar (squat, deadlift, press).

Faqat JSON qaytarasan. Markdown yo'q.
JSON: {"summary":"2 jumlada umumiy tavsif","workouts":[{"day":"Dushanba","type":"strength|cardio|rest|active_recovery","duration_min":60,"exercises":[{"name":"mashq nomi uzbekcha","sets":4,"reps":"8-10","rest_sec":90,"notes":"texnika eslatmasi"}]}],"nutrition":{"daily_calories":0,"protein_g":0,"carbs_g":0,"fat_g":0,"meal_plan":{"breakfast":"tushuntirish","lunch":"tushuntirish","dinner":"tushuntirish","pre_workout":"tushuntirish","post_workout":"tushuntirish"},"uzbek_foods_suggested":["..."],"avoid":["..."],"water_liters":0},"weekly_goal":"maqsad","motivation":"qisqa motivatsion xabar uzbekcha"}`;

export async function generatePlan(profile: Record<string, any>): Promise<any> {
  const prompt = `A'zo haqida to'liq ma'lumot:
- Yosh: ${profile.age}, Jins: ${profile.gender}, Bo'y: ${profile.height_cm}cm, Vazn: ${profile.weight_kg}kg
- Kasb: ${profile.job_type ?? "noaniq"}, Uyqu: ${profile.sleep_hours ?? 7} soat
- Maqsad: ${profile.goal}, Muddat: ${profile.deadline ?? "3 oy"}
- Tajriba: ${profile.experience ?? "beginner"}
- Kasalliklar: ${profile.diseases ?? "yo'q"}, Allergiya: ${profile.allergies ?? "yo'q"}
- Shikastlanish: ${profile.injuries ?? "yo'q"}, Dorilar: ${profile.medications ?? "yo'q"}
- Ovqatlanish: kuniga ${profile.meals_per_day ?? 3} marta, Yoqtirmaydi: ${profile.disliked_foods ?? "yo'q"}
- Suv: ${profile.water_intake ?? 2} litr/kun, Ishtaha vaqti: ${profile.appetite_time ?? "afternoon"}
- Faollik: ${profile.activity_level}, Haftalik mashq: ${profile.workout_days ?? 4} kun, Seans: ${profile.session_minutes ?? 60} daqiqa
- Joy: ${profile.location ?? "gym"}, Stress: ${profile.stress_level ?? "moderate"}
- Hissiy ovqatlanish: ${profile.emotional_eating ?? "no"}, Iroda: ${profile.willpower ?? "moderate"}
- Motivatsiya: ${profile.motivation ?? "sog'liq"}

Shu ma'lumotlar asosida BMR va TDEE ni hisoblabga qarab to'liq haftalik plan yarat.
O'zbek ovqatlari va mahalliy sport madaniyatiga mos qil.`;

  const text = await groqChat(PLAN_SYSTEM, [{ role: "user", content: prompt }]);
  try {
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// ─── AI Chat ────────────────────────────────────────────────
const CHAT_SYSTEM = `Sen VitaForge AI — O'zbek tilida javob ber. Fitness, ovqatlanish, motivatsiya bo'yicha ekspert.
Qisqa, aniq, foydali javob ber. Agar ovqat so'ralsa, kaloriya va protein ham ayt.
O'zbekiston kontekstida gapir — mahalliy ovqatlar va odatlarni bilasan.
Javobni 3-4 qatordan oshirma.`;

export async function chatWithAI(messages: { role: string; content: string }[]): Promise<string> {
  return groqChat(CHAT_SYSTEM, messages);
}

// ─── Food Parse ─────────────────────────────────────────────
const FOOD_SYSTEM = `Sen O'zbek ovqat nutrition analizchisan. Foydalanuvchi yozgan ovqatni parse qil.
Faqat JSON qaytarasan: {"food_name":"...","quantity_g":350,"calories":630,"protein_g":18,"carbs_g":87,"fat_g":24,"confidence":0.9}`;

export async function parseFood(text: string): Promise<any> {
  const result = await groqChat(FOOD_SYSTEM, [{ role: "user", content: `Parse: ${text}` }]);
  try {
    const cleaned = result.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { food_name: text, quantity_g: null, calories: null, protein_g: null, carbs_g: null, fat_g: null, confidence: 0 };
  }
}
