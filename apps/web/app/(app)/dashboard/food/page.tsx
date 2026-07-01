"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export default function Food() {
  const [foodText, setFoodText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: foodLog, isLoading, isError } = useQuery({
    queryKey: ["foodLog"],
    queryFn: () => api.food.getLog()
  });

  const logFoodMutation = useMutation({
    mutationFn: (text: string) => api.food.parse(text),
    onSuccess: () => {
      toast("Ovqat yozildi!", "success");
      setFoodText("");
      queryClient.invalidateQueries({ queryKey: ["foodLog"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
    onError: () => {
      toast("Ovqat yozishda xatolik yuz berdi.", "error");
    }
  });

  if (isLoading) return <div className="p-4 text-center text-muted mt-10">Yuklanmoqda...</div>;
  if (isError) return <div className="p-4 text-center text-vred mt-10">Ma'lumotlarni yuklashda xatolik yuz berdi.</div>;

  const items = foodLog?.items || foodLog || [];

  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-[17px] text-vtext">Ovqat kundaligi</h1>
      <form onSubmit={(e) => { e.preventDefault(); if (foodText.trim()) logFoodMutation.mutate(foodText); }}>
        <div className="bg-surface border border-border rounded-[13px] p-3.5">
           <input 
             type="text" 
             placeholder="Nima yedingiz?" 
             value={foodText}
             onChange={(e) => setFoodText(e.target.value)}
             disabled={logFoodMutation.isPending}
             className="w-full bg-surface2 border border-border rounded-xl p-3 text-xs text-vtext outline-none disabled:opacity-50" 
           />
        </div>
      </form>
      
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item: any, i: number) => (
            <div key={i} className="bg-[rgba(232,255,71,0.04)] border border-[rgba(232,255,71,0.3)] rounded-[13px] p-3.5 flex justify-between items-center">
               <div>
                  <div className="text-[13px] text-vtext font-semibold">{item.name || "Noma'lum ovqat"}</div>
                  <div className="text-[10px] font-mono text-muted">{item.calories || 0} kcal</div>
               </div>
               <div className="text-vgreen text-sm">✅</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted text-xs p-4">Hozircha hech narsa yozilmadi.</div>
      )}
    </div>
  );
}