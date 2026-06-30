"use client";
import { Panel } from "@/components/vf";

export default function Settings() {
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-display font-bold text-[20px] text-vtext mb-6">Sozlamalar</h1>
      
      <Panel title="GYM PROFILI">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-muted">Gym Nomi</span>
             <div className="flex items-center gap-4">
               <span className="text-xs text-vtext font-medium">FitZone Gym</span>
               <span className="text-[10px] text-accent cursor-pointer">Tahrirlash</span>
             </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-muted">Manzil</span>
             <div className="flex items-center gap-4">
               <span className="text-xs text-vtext font-medium">Yunusobod, Toshkent</span>
               <span className="text-[10px] text-accent cursor-pointer">Tahrirlash</span>
             </div>
          </div>
        </div>
      </Panel>

      <Panel title="BILDIRISHNOMALAR">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-vtext">Churn xavfi haqida ogohlantirish (AI)</span>
             <div className="w-9 h-5 rounded-full bg-accent relative cursor-pointer">
               <div className="w-4 h-4 rounded-full bg-bg absolute right-0.5 top-0.5"></div>
             </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#15151f]">
             <span className="text-xs text-vtext">Haftalik hisobot (Telegram)</span>
             <div className="w-9 h-5 rounded-full bg-accent relative cursor-pointer">
               <div className="w-4 h-4 rounded-full bg-bg absolute right-0.5 top-0.5"></div>
             </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}