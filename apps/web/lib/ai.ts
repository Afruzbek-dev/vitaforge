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
const PLAN_SYSTEM = `Sen VitaForge AI — O'zbekiston gym lari uchun professional fitness va nutrition mutaxassisi.
Foydalanuvchi profili asosida SHAXSIY haftalik dastur yaratasan.
Faqat JSON qaytarasan. Markdown yo'q.
JSON: {"summary":"...","workouts":[{"day":"Dushanba","type":"strength|cardio|rest","duration_min":60,"exercises":[{"name":"...","sets":4,"reps":"8-10","rest_sec":90}]}],"nutrition":{"daily_calories":2400,"protein_g":180,"carbs_g":270,"fat_g":70,"uzbek_foods_suggested":["..."],"avoid":["..."]},"weekly_goal":"...","motivation":"..."}`;

export async function generatePlan(profile: { age: number; gender: string; height_cm: number; weight_kg: number; goal: string; activity_level: string }): Promise<any> {
  const prompt = `A'zo: ${profile.age} yosh, ${profile.gender}, ${profile.height_cm}cm, ${profile.weight_kg}kg. Maqsad: ${profile.goal}. Faollik: ${profile.activity_level}. O'zbek ovqatlari va mahalliy madaniyatga mos plan yarat.`;
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
