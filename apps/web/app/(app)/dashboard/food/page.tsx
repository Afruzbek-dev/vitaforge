"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SkeletonCard, SkeletonList } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { 
  ChevronLeft, ChevronRight, Utensils, Coffee, Sun, Moon, 
  Cookie, Plus, Search, Trash2, Check, X
} from "lucide-react";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const MEAL_CONFIG: Record<MealType, { label: string; icon: React.ReactNode }> = {
  breakfast: { label: "Nonushta", icon: <Coffee size={20} /> },
  lunch: { label: "Tushlik", icon: <Sun size={20} /> },
  dinner: { label: "Kechki ovqat", icon: <Moon size={20} /> },
  snack: { label: "Gazak", icon: <Cookie size={20} /> },
};

function RingProgress({ progress, size = 120, stroke = 12, label }: { progress: number; size?: number; stroke?: number; label: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, progress));
  const dashoffset = c - (p / 100) * c;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={r} 
          fill="none" 
          stroke="var(--accent)" 
          strokeWidth={stroke} 
          strokeDasharray={c} 
          strokeDashoffset={dashoffset} 
          strokeLinecap="round" 
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label}
      </div>
    </div>
  );
}

export default function NutritionTrackerPage() {
  const sb = getSupabase();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split("T")[0]);
  
  // Modals state
  const [addFoodMeal, setAddFoodMeal] = useState<MealType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [portion, setPortion] = useState("100");
  const [showCustomFood, setShowCustomFood] = useState(false);

  // Custom food form
  const [customForm, setCustomForm] = useState({ name: "", cal: "", pro: "", car: "", fat: "" });

  const displayDate = new Date(dateStr);
  const isToday = dateStr === new Date().toISOString().split("T")[0];

  const prevDay = () => {
    const d = new Date(displayDate);
    d.setDate(d.getDate() - 1);
    setDateStr(d.toISOString().split("T")[0]);
  };

  const nextDay = () => {
    const d = new Date(displayDate);
    d.setDate(d.getDate() + 1);
    setDateStr(d.toISOString().split("T")[0]);
  };

  const resetToday = () => {
    setDateStr(new Date().toISOString().split("T")[0]);
  };

  // Queries
  const { data: userSettings } = useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const u = await getUser();
      const { data } = await sb.from("users").select("settings").eq("id", u!.id).single();
      return data?.settings ?? {};
    }
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ["nutrition-logs", dateStr],
    queryFn: async () => {
      const u = await getUser();
      const { data } = await sb.from("nutrition_logs").select("*").eq("user_id", u!.id).eq("date", dateStr).order("created_at");
      return data ?? [];
    }
  });

  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ["food-search", searchQuery],
    enabled: searchQuery.length > 1,
    queryFn: async () => {
      const { data } = await sb.from("foods").select("*").ilike("name", `%${searchQuery}%`).limit(20);
      return data ?? [];
    }
  });

  const targetCal = userSettings?.daily_calories ?? 2000;
  const targetPro = userSettings?.daily_protein ?? 120;
  const targetCar = userSettings?.daily_carbs ?? 250;
  const targetFat = userSettings?.daily_fat ?? 60;

  const totals = (logs ?? []).reduce((acc, log) => ({
    cal: acc.cal + Number(log.calories),
    pro: acc.pro + Number(log.protein),
    car: acc.car + Number(log.carbs),
    fat: acc.fat + Number(log.fat),
  }), { cal: 0, pro: 0, car: 0, fat: 0 });

  const addLog = useMutation({
    mutationFn: async (logData: any) => {
      const u = await getUser();
      const { error } = await sb.from("nutrition_logs").insert({ ...logData, user_id: u!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition-logs"] });
      toast("Ovqat qo'shildi", "success");
      setAddFoodMeal(null);
      setSelectedFood(null);
      setSearchQuery("");
      setPortion("100");
    },
    onError: () => toast("Xatolik yuz berdi", "error")
  });

  const deleteLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("nutrition_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition-logs"] });
      toast("O'chirildi", "info");
    }
  });

  const addCustomFood = useMutation({
    mutationFn: async () => {
      const u = await getUser();
      const { data, error } = await sb.from("foods").insert({
        user_id: u!.id,
        name: customForm.name,
        calories_per_100g: Number(customForm.cal),
        protein: Number(customForm.pro),
        carbs: Number(customForm.car),
        fat: Number(customForm.fat),
        is_custom: true
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (newFood) => {
      toast("Yangi ovqat saqlandi", "success");
      setShowCustomFood(false);
      setSelectedFood(newFood);
      setCustomForm({ name: "", cal: "", pro: "", car: "", fat: "" });
    },
    onError: () => toast("Xatolik yuz berdi", "error")
  });

  const handleConfirmFood = () => {
    if (!selectedFood || !addFoodMeal) return;
    const ratio = Number(portion) / 100;
    addLog.mutate({
      date: dateStr,
      meal_type: addFoodMeal,
      food_name: selectedFood.name,
      calories: Math.round(selectedFood.calories_per_100g * ratio),
      protein: Math.round(selectedFood.protein * ratio * 10) / 10,
      carbs: Math.round(selectedFood.carbs * ratio * 10) / 10,
      fat: Math.round(selectedFood.fat * ratio * 10) / 10,
      portion_grams: Number(portion)
    });
  };

  return (
    <div className="max-w-md md:max-w-2xl mx-auto space-y-6 animate-fadeUp pb-24">
      {/* Header & Navigator */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-vtext">Kaloriya</h1>
        <div className="flex items-center gap-2 bg-surface2 rounded-full p-1 border border-border">
          <button onClick={prevDay} className="p-1 rounded-full hover:bg-surface text-muted"><ChevronLeft size={20} /></button>
          <button onClick={resetToday} className="px-3 text-sm font-medium hover:text-accent w-24 text-center">
            {isToday ? "Bugun" : displayDate.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })}
          </button>
          <button onClick={nextDay} disabled={isToday} className="p-1 rounded-full hover:bg-surface text-muted disabled:opacity-30"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Daily Summary */}
      <Card className="overflow-hidden relative bg-gradient-to-br from-surface to-surface2 border-accent-border/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-6">
            <RingProgress 
              progress={(totals.cal / targetCal) * 100}
              label={
                <>
                  <span className="text-2xl font-display font-bold text-vtext leading-none">{Math.round(totals.cal)}</span>
                  <span className="text-xs text-muted mt-1">/ {targetCal}</span>
                  <span className="text-[10px] text-accent font-medium mt-1 uppercase tracking-wider">Kkal</span>
                </>
              }
            />
            <div className="flex-1 space-y-4">
              {[
                { label: "Protein", val: totals.pro, target: targetPro, color: "bg-blue-500" },
                { label: "Karbohidrat", val: totals.car, target: targetCar, color: "bg-green-500" },
                { label: "Yog'", val: totals.fat, target: targetFat, color: "bg-orange-500" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted font-medium">{m.label}</span>
                    <span className="text-vtext">{Math.round(m.val)}g <span className="text-muted/60">/ {m.target}g</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${m.color}`} 
                      style={{ width: `${Math.min(100, (m.val / m.target) * 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals */}
      {loadingLogs ? (
        <SkeletonList count={4} />
      ) : (
        <div className="space-y-4">
          {(Object.keys(MEAL_CONFIG) as MealType[]).map((meal) => {
            const cfg = MEAL_CONFIG[meal];
            const mealLogs = (logs ?? []).filter((l) => l.meal_type === meal);
            const mealCal = mealLogs.reduce((s, l) => s + Number(l.calories), 0);

            return (
              <Card key={meal} className="border-border shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-surface2 text-muted">
                        {cfg.icon}
                      </div>
                      <CardTitle className="text-base">{cfg.label}</CardTitle>
                    </div>
                    <span className="font-mono font-medium text-accent">{Math.round(mealCal)} kkal</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3 mb-3">
                    {mealLogs.length === 0 ? (
                      <p className="text-sm text-muted/60 py-2">Hali ovqat qo'shilmadi</p>
                    ) : (
                      mealLogs.map((l) => (
                        <div key={l.id} className="flex items-center justify-between group">
                          <div>
                            <p className="text-sm font-medium text-vtext">{l.food_name}</p>
                            <p className="text-xs text-muted">
                              {l.portion_grams}g • P:{l.protein} K:{l.carbs} Y:{l.fat}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-vtext">{l.calories}</span>
                            <button onClick={() => deleteLog.mutate(l.id)} className="text-muted hover:text-vred p-1 opacity-0 group-hover:opacity-100 transition">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Button variant="outline" className="w-full border-dashed rounded-xl h-10" onClick={() => setAddFoodMeal(meal)}>
                    <Plus size={16} className="mr-2" /> Qo'shish
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Food Bottom Sheet */}
      <BottomSheet open={!!addFoodMeal} onClose={() => { setAddFoodMeal(null); setSelectedFood(null); }} title="Ovqat qo'shish">
        {!selectedFood ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <Input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10 rounded-xl" 
                placeholder="Qidirish (masalan: tuxum)..."
                autoFocus
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searching ? (
                <p className="text-sm text-muted text-center py-4">Qidirilmoqda...</p>
              ) : searchResults && searchResults.length > 0 ? (
                searchResults.map((f) => (
                  <div 
                    key={f.id} 
                    className="flex justify-between items-center p-3 rounded-xl border border-border hover:border-accent cursor-pointer transition"
                    onClick={() => setSelectedFood(f)}
                  >
                    <div>
                      <p className="font-medium text-sm text-vtext">{f.name}</p>
                      <p className="text-xs text-muted">100g = {f.calories_per_100g} kkal</p>
                    </div>
                    <ChevronRight size={16} className="text-muted" />
                  </div>
                ))
              ) : searchQuery.length > 2 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted mb-3">Hech narsa topilmadi</p>
                  <Button variant="secondary" size="sm" className="rounded-lg" onClick={() => setShowCustomFood(true)}>
                    + Yangi ovqat yaratish
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted text-center py-4">Qidirish uchun matn kiriting</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-vtext">{selectedFood.name}</h3>
                <p className="text-sm text-muted">100g uchun ma'lumotlar</p>
              </div>
              <button onClick={() => setSelectedFood(null)} className="p-2 bg-surface2 rounded-full text-muted"><X size={16}/></button>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-surface2 p-2 rounded-lg border border-border">
                <p className="font-bold text-vtext text-sm">{selectedFood.calories_per_100g}</p>
                <p className="text-muted">Kkal</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg">
                <p className="font-bold text-blue-500 text-sm">{selectedFood.protein}g</p>
                <p className="text-muted">Pro</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 p-2 rounded-lg">
                <p className="font-bold text-green-500 text-sm">{selectedFood.carbs}g</p>
                <p className="text-muted">Karb</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 p-2 rounded-lg">
                <p className="font-bold text-orange-500 text-sm">{selectedFood.fat}g</p>
                <p className="text-muted">Yog'</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Miqdori (gramm)</Label>
              <div className="flex items-center gap-3">
                <Input 
                  type="number" 
                  value={portion} 
                  onChange={(e) => setPortion(e.target.value)} 
                  className="rounded-xl font-mono text-lg h-12" 
                />
                <Button 
                  onClick={handleConfirmFood} 
                  disabled={addLog.isPending || !portion}
                  className="rounded-xl h-12 px-6 w-1/2"
                >
                  {addLog.isPending ? "..." : "Qo'shish"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Custom Food Bottom Sheet */}
      <BottomSheet open={showCustomFood} onClose={() => setShowCustomFood(false)} title="Yangi ovqat qo'shish">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nomi</Label>
            <Input value={customForm.name} onChange={(e) => setCustomForm({...customForm, name: e.target.value})} placeholder="Masalan: Uy qurti" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kaloriya (100g)</Label>
              <Input type="number" value={customForm.cal} onChange={(e) => setCustomForm({...customForm, cal: e.target.value})} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Protein (100g)</Label>
              <Input type="number" value={customForm.pro} onChange={(e) => setCustomForm({...customForm, pro: e.target.value})} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Karbohidrat (100g)</Label>
              <Input type="number" value={customForm.car} onChange={(e) => setCustomForm({...customForm, car: e.target.value})} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Yog' (100g)</Label>
              <Input type="number" value={customForm.fat} onChange={(e) => setCustomForm({...customForm, fat: e.target.value})} className="rounded-xl" />
            </div>
          </div>
          <Button 
            className="w-full rounded-xl mt-4" 
            disabled={!customForm.name || !customForm.cal || addCustomFood.isPending}
            onClick={() => addCustomFood.mutate()}
          >
            Saqlash
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
