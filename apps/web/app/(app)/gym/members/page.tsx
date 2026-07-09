"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Avatar, Pill, Panel } from "@/components/vf";
import { useToast } from "@/components/ui/toast";

export default function MembersList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Barchasi");
  const { toast } = useToast();

  const { data: membersRes, isLoading, isError } = useQuery({ 
    queryKey: ["gym", "members"], 
    queryFn: () => api.gym.members() 
  });

  if (isLoading) return <div className="p-4 text-muted">Yuklanmoqda...</div>;
  if (isError) return <div className="p-4 text-red-500">Xatolik yuz berdi</div>;

  const members = membersRes?.data || [];
  
  const filteredMembers = members.filter((m: { full_name: string; id: string; churn_risk?: boolean }) => {
    if (search && !m.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "Risk" && !m.churn_risk) return false;
    if (filter === "Faol" && m.churn_risk) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[20px] text-vtext">A'zolar</h1>
          <p className="text-muted text-xs mt-1">{members.length} ta a'zo · {members.filter((m:any) => m.churn_risk).length} tasi xavf ostida</p>
        </div>
        <button 
          onClick={() => toast("Yangi a'zo qo'shish formasi ochiladi", "success")}
          className="bg-accent text-bg font-semibold text-xs px-4 py-2.5 rounded-[9px] hover:opacity-90"
        >
          + A'zo qo'shish
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ism bo'yicha qidirish..." 
          className="bg-surface2 border border-border rounded-[9px] px-3.5 py-2.5 text-xs text-[#8888a0] w-64 outline-none focus:border-accent"
        />
        <div className="flex gap-1.5 ml-auto">
          {['Barchasi', 'Faol', 'Risk', 'Yangi'].map((chip) => (
            <button 
              key={chip}
              onClick={() => setFilter(chip)}
              className={`font-mono text-[10px] tracking-wider px-3 py-1.5 rounded-full ${filter === chip ? 'bg-accent text-bg' : 'bg-surface2 border border-border text-[#8888a0]'}`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <Panel>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">A'ZO</th>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">MAQSAD</th>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border">QO'SHILGAN</th>
              <th className="font-mono text-[10px] tracking-widest text-muted uppercase pb-2.5 border-b border-border text-right">HOLAT</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((m: { id: string; full_name: string; goal?: string; joined_at?: string; churn_risk?: boolean; churn_probability?: number }) => (
              <tr key={m.id} className="border-b border-border hover:bg-surface2/50 transition-colors">
                <td className="py-2.5 border-b border-[#15151f] text-xs">
                  <Link href={`/gym/members/${m.id}`} className="flex items-center gap-3 w-full">
                    <Avatar initials={m.full_name.substring(0,2).toUpperCase()} size="sm" />
                    <span className="font-medium text-vtext hover:text-accent transition-colors">{m.full_name}</span>
                  </Link>
                </td>
                <td className="py-2.5 border-b border-[#15151f] text-xs text-[#8888a0]">{m.goal || "Oziq-ovqat"}</td>
                <td className="py-2.5 border-b border-[#15151f] text-xs text-vtext">{new Date(m.joined_at || new Date().toISOString()).toLocaleDateString()}</td>
                <td className="py-2.5 border-b border-[#15151f] text-xs text-right">
                  <Pill variant={m.churn_risk ? "risk" : "ok"}>{m.churn_risk ? "risk" : "ok"}</Pill>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-xs text-muted">A'zolar topilmadi</td></tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}