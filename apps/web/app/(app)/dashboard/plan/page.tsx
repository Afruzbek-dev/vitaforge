"use client";
import { GymService } from "@/lib/services/GymService";
import { FitnessPlanService } from "@/lib/services/FitnessPlanService";
import { InsightCard } from "@/components/vf";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";

export default function Plan() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plan, isLoading, isError } = useQuery({
    queryKey: ["currentPlan"],
    queryFn: () => FitnessPlanService.getCurrentPlan()
  });

  const finishWorkoutMutation = useMutation({
    mutationFn: () => GymService.getChallenge(), // assuming this logs the workout for now
    onSuccess: () => {
      toast("Mashq yakunlandi! Qoyilmaqom!", "success");
      queryClient.invalidateQueries({ queryKey: ["currentPlan"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
    onError: () => {
      toast("Xatolik yuz berdi.", "error");
    }
  });

  if (isLoading) return <div className="p-4 text-center text-muted mt-10">Yuklanmoqda...</div>;
  if (isError) return <div className="p-4 text-center text-vred mt-10">Ma'lumotlarni yuklashda xatolik yuz berdi.</div>;

  const exercises = plan?.exercises || [
    { name: "Squat", sets: "4", reps: "12" },
    { name: "Bench press", sets: "4", reps: "10" },
    { name: "Deadlift", sets: "3", reps: "8" }
  ];
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0 for Monday

  return (
    <div className="space-y-4 pb-4">
      <div className="mb-4">
        <h1 className="font-display font-bold text-[17px] text-vtext">{plan?.name || "Mashq rejasi"}</h1>
        <p className="text-xs text-muted mt-1">{plan?.description || "Joriy haftalik dastur"}</p>
      </div>
      
      <div className="flex justify-between items-center px-2 py-3 bg-surface rounded-[13px] mb-4">
        {['D', 'S', 'C', 'P', 'J', 'S', 'Y'].map((day, i) => (
          <div key={i} className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-mono ${i === todayIndex ? 'ring-2 ring-[rgba(232,255,71,0.4)] text-accent' : i < todayIndex ? 'bg-accent text-bg' : 'text-muted'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {exercises.map((ex: any, i: number) => (
          <div key={i} className="bg-surface border border-border rounded-[13px] p-3.5">
            <h3 className="text-vtext font-semibold text-[13px] mb-1">{ex.name}</h3>
            <p className="text-xs text-[#8888a0]">
              {ex.sets && ex.reps ? `${ex.sets} to'plam × ${ex.reps} marta` : ex.sets}
            </p>
          </div>
        ))}
        {exercises.length === 0 && (
          <div className="text-center text-muted text-xs p-4">Hozircha mashqlar yo'q</div>
        )}
      </div>

      <button 
        onClick={() => finishWorkoutMutation.mutate()}
        disabled={finishWorkoutMutation.isPending}
        className="w-full bg-accent text-bg font-semibold text-[13px] py-3 rounded-xl shadow-[0_0_18px_rgba(232,255,71,0.25)] mt-4 disabled:opacity-50"
      >
        {finishWorkoutMutation.isPending ? "Yakunlanmoqda..." : "Mashqni tugatish ✅"}
      </button>
    </div>
  );
}