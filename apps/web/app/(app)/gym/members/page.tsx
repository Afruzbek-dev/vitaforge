"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { Search, UserPlus, X, Calendar, UserCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "active" | "expiring" | "expired" | "no_trainer" | "risk";

export default function MembersPage() {
  const sb = getSupabase();
  const [gymId, setGymId] = useState<string | null>(null);
  
  // Data lists
  const [members, setMembers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  
  // Table UI State
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Actions Modals state
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [extendDays, setExtendDays] = useState(30);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTrainerForAssign, setSelectedTrainerForAssign] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const user = await getUser();
    if (!user) return;
    const { data: me } = await sb.from("users").select("gym_id").eq("id", user.id).single();
    if (!me?.gym_id) return;
    const gid = me.gym_id;
    setGymId(gid);

    // Fetch members with user profile and trainer details
    const { data: membersList, error } = await sb.from("members")
      .select(`
        *,
        user:users!members_user_id_fkey(id, name, full_name, phone, email, avatar_url, telegram_id),
        trainer:users!members_trainer_id_fkey(id, name, full_name)
      `)
      .eq("gym_id", gid);

    if (error) console.error("Error loading members:", error);

    // Get trainers for assignment dropdown
    const { data: trainersList } = await sb.from("users")
      .select("id, full_name, name")
      .eq("gym_id", gid)
      .eq("role", "trainer");

    // Mock risk calculation similar to retention to keep data structure
    const mapped = (membersList || []).map((m: any) => {
      const now = new Date();
      const end = m.end_date ? new Date(m.end_date) : null;
      let calculatedStatus = m.status || "active";
      let diffDays = 999;
      
      if (end) {
        const diffTime = end.getTime() - now.getTime();
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          calculatedStatus = "expired";
        } else if (diffDays <= 7) {
          calculatedStatus = "expiring";
        }
      }

      const risk = diffDays < 0 ? "critical" : diffDays <= 7 ? "at_risk" : "active";

      return {
        ...m,
        member_name: m.user?.name || m.user?.full_name || "Noma'lum",
        member_phone: m.user?.phone || "—",
        member_email: m.user?.email || "",
        member_avatar: m.user?.avatar_url,
        telegram_id: m.user?.telegram_id,
        trainer_name: m.trainer?.name || m.trainer?.full_name || "Biriktirilmagan",
        computedStatus: calculatedStatus,
        risk
      };
    });

    setMembers(mapped);
    setTrainers(trainersList || []);
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map(m => m.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBulkExtend = async () => {
    if (!selectedIds.length) return;
    try {
      for (const memberId of selectedIds) {
        const currentMember = members.find(m => m.id === memberId);
        let baseDate = new Date();
        if (currentMember && currentMember.end_date) {
          const currentEnd = new Date(currentMember.end_date);
          if (currentEnd > baseDate) baseDate = currentEnd;
        }
        baseDate.setDate(baseDate.getDate() + extendDays);
        
        await sb.from("members").update({
          end_date: baseDate.toISOString(),
          status: "active"
        }).eq("id", memberId);
      }
      setIsExtendModalOpen(false);
      setSelectedIds([]);
      load();
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    }
  };

  const handleBulkSendReminder = async () => {
    if (!selectedIds.length) return;
    try {
      for (const memberId of selectedIds) {
        const m = members.find(x => x.id === memberId);
        if (m) {
          await sb.from("notifications").insert({
            user_id: m.user_id,
            title: "ZenFit Eslatma",
            body: "Hurmatli sportchi! ZenFit a'zolik muddatingiz to'lovi va faolligi bo'yicha ma'lumotlarni tekshirib qo'yishingizni so'raymiz.",
            type: "streak_reminder",
            data: JSON.stringify({ action: "payment_reminder" })
          });
        }
      }
      alert("Eslatmalar Telegram orqali yuborildi!");
      setSelectedIds([]);
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    }
  };

  const handleAssignTrainerBulk = async () => {
    if (!selectedIds.length || !selectedTrainerForAssign) return;
    try {
      await sb.from("members")
        .update({ trainer_id: selectedTrainerForAssign })
        .in("id", selectedIds);
      
      setAssignModalOpen(false);
      setSelectedIds([]);
      setSelectedTrainerForAssign("");
      load();
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    }
  };

  // Filtering
  const filteredMembers = members.filter((m) => {
    const matchSearch = m.member_name.toLowerCase().includes(search.toLowerCase()) || m.member_phone.includes(search);
    if (filter === "all") return matchSearch;
    if (filter === "active") return matchSearch && m.computedStatus === "active";
    if (filter === "expiring") return matchSearch && m.computedStatus === "expiring";
    if (filter === "expired") return matchSearch && m.computedStatus === "expired";
    if (filter === "no_trainer") return matchSearch && !m.trainer_id;
    if (filter === "risk") return matchSearch && (m.risk === "critical" || m.risk === "at_risk");
    return matchSearch;
  });

  const getRowClass = (risk: string) => {
    if (risk === "critical") return "bg-vred/5";
    if (risk === "at_risk") return "bg-warning/5";
    return "bg-transparent";
  };

  const riskCount = members.filter(m => m.risk === 'critical' || m.risk === 'at_risk').length;

  return (
    <div className="flex-1 p-[22px_28px] bg-bg overflow-hidden animate-fadeUp pb-24 md:pb-[80px]">
      
      {/* Topbar */}
      <div className="flex justify-between items-start mb-[22px]">
        <div>
          <h1 className="font-display font-bold text-[21px] text-vtext">A'zolar</h1>
          <p className="text-[12px] text-muted mt-[3px]">
            {members.length} ta a'zo · {riskCount} tasi diqqat talab qiladi
          </p>
        </div>
        <Link href="/gym/invite">
          <button className="flex items-center gap-[6px] bg-accent text-bg font-body font-semibold text-[13px] p-[9px_16px] rounded-[9px] hover:opacity-90 transition-opacity">
            + Yangi a'zo
          </button>
        </Link>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-[10px_14px] bg-accent/10 border border-accent/30 rounded-[10px] mb-[16px] animate-fadeUp">
          <span className="text-[12px] font-semibold text-accent">{selectedIds.length} ta a'zo tanlandi</span>
          <div className="flex gap-[8px]">
            <button onClick={() => setIsExtendModalOpen(true)} className="bg-accent text-bg px-[12px] py-[6px] rounded-[6px] text-[11px] font-bold hover:opacity-90">Uzatish</button>
            <button onClick={() => setAssignModalOpen(true)} className="bg-vblue text-bg px-[12px] py-[6px] rounded-[6px] text-[11px] font-bold hover:opacity-90">Murabbiy biriktirish</button>
            <button onClick={handleBulkSendReminder} className="bg-vred/15 border border-vred/30 text-vred hover:bg-vred hover:text-bg px-[12px] py-[6px] rounded-[6px] text-[11px] font-bold transition-colors">Eslatma</button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-[10px] mb-[16px]">
        <div className="flex-1 bg-surface border border-border rounded-[10px] p-[10px_14px] font-mono text-[13px] text-muted flex items-center gap-[8px]">
          <Search size={14} className="text-muted" />
          <input 
            type="text" 
            placeholder="Ism yoki telefon bo'yicha qidirish..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-vtext placeholder-muted"
          />
        </div>
        <div className="flex gap-[6px] overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: "all", label: "Barchasi", c: "bg-surface text-muted" },
            { id: "risk", label: `Risk · ${riskCount}`, c: "bg-vred/15 border-vred/30 text-vred" },
            { id: "active", label: "Faol", c: "bg-surface text-muted" },
            { id: "expiring", label: "Yaqinda", c: "bg-surface text-muted" },
            { id: "expired", label: "Tugagan", c: "bg-surface text-muted" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as FilterType)}
              className={`whitespace-nowrap px-[14px] py-[9px] rounded-[8px] font-mono text-[12px] transition-colors border ${filter === f.id ? "border-accent text-accent bg-accent/5" : "border-border " + f.c}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Panel */}
      <div className="bg-surface border border-border rounded-[13px] p-0 overflow-hidden custom-scrollbar overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_100px] p-[11px_18px] bg-[#13131a] font-mono text-[10px] text-muted tracking-[1px] uppercase items-center">
            <div className="flex justify-center">
              <input 
                type="checkbox" 
                checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded-[4px] border-border bg-surface accent-accent cursor-pointer"
              />
            </div>
            <span>A'ZO</span>
            <span>TRENER</span>
            <span>TUGASH SANA</span>
            <span>HOLAT</span>
            <span></span>
          </div>

          {/* Table Body */}
          {filteredMembers.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <p className="text-[12px] font-medium text-vtext">Natija topilmadi</p>
            </div>
          ) : (
            filteredMembers.map((m: any) => {
              const nameInitial = m.member_name?.substring(0, 2).toUpperCase() || 'MI';
              const isExpired = m.computedStatus === "expired";
              const isExpiring = m.computedStatus === "expiring";
              const dateText = m.end_date ? new Date(m.end_date).toLocaleDateString() : "Cheksiz";
              
              return (
                <div key={m.id} className={`grid grid-cols-[40px_2fr_1fr_1fr_1fr_100px] items-center p-[13px_18px] border-b border-[#15151f] last:border-0 ${getRowClass(m.risk)}`}>
                  <div className="flex justify-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(m.id)}
                      onChange={() => toggleSelectOne(m.id)}
                      className="w-4 h-4 rounded-[4px] border-border bg-surface accent-accent cursor-pointer"
                    />
                  </div>

                  {/* Name Col */}
                  <div className="flex items-center gap-[10px]">
                    <div className="w-[28px] h-[28px] rounded-[8px] bg-accent/15 text-accent flex items-center justify-center font-display font-bold text-[11px] flex-shrink-0">
                      {nameInitial}
                    </div>
                    <div>
                      <span className="text-[13px] text-vtext font-body block">{m.member_name}</span>
                      <span className="text-[10px] text-muted font-mono">{m.member_phone}</span>
                    </div>
                  </div>

                  {/* Trainer */}
                  <span className="font-mono text-[12px] text-muted line-clamp-1">{m.trainer_name}</span>

                  {/* Date */}
                  <span className={`font-mono text-[12px] ${isExpired ? 'text-vred' : isExpiring ? 'text-warning' : 'text-vgreen'}`}>
                    {dateText}
                  </span>

                  {/* Status Badge */}
                  <div>
                    <span className={`text-[11px] px-[8px] py-[3px] rounded-[6px] font-mono w-fit block
                      ${isExpired ? 'bg-vred/10 text-vred' : 
                        isExpiring ? 'bg-warning/10 text-warning' : 
                        'bg-vgreen/10 text-vgreen'}
                    `}>
                      {isExpired ? 'Tugagan' : isExpiring ? 'Yaqinda' : 'Faol'}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="flex gap-[8px] justify-end">
                    <Link href={`/gym/members/${m.user_id || m.id}`}>
                      <span className="font-mono text-[10px] text-vblue p-[3px_8px] border border-vblue/30 rounded-[6px] hover:bg-vblue/10 transition-colors whitespace-nowrap">
                        Profil →
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bulk Extend Modal */}
      {isExtendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border w-full max-w-sm rounded-[16px] p-6 relative animate-scaleIn">
            <button onClick={() => setIsExtendModalOpen(false)} className="absolute top-4 right-4 text-muted hover:text-vtext"><X size={18} /></button>
            <h3 className="text-lg font-bold text-vtext mb-2 flex items-center gap-1.5"><Calendar size={18} className="text-accent" /> A'zolikni uzaytirish</h3>
            <p className="text-xs text-muted mb-4">{selectedIds.length} ta a'zo uchun muddat qancha uzaytirilsin?</p>
            
            <select value={extendDays} onChange={(e) => setExtendDays(Number(e.target.value))} className="w-full h-11 bg-surface2 border border-border rounded-[10px] px-3 text-[13px] text-vtext outline-none focus:border-accent mb-4">
              <option value={7}>7 kun (Haftalik)</option>
              <option value={30}>30 kun (Bir oy)</option>
              <option value={90}>90 kun (Uch oy)</option>
            </select>

            <div className="flex gap-3">
              <button onClick={() => setIsExtendModalOpen(false)} className="flex-1 p-[10px] rounded-[10px] bg-surface2 text-vtext text-[13px] font-bold hover:bg-border">Bekor qilish</button>
              <button onClick={handleBulkExtend} className="flex-1 p-[10px] rounded-[10px] bg-accent text-bg text-[13px] font-bold hover:opacity-90">Uzaytirish</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border w-full max-w-sm rounded-[16px] p-6 relative animate-scaleIn">
            <button onClick={() => setAssignModalOpen(false)} className="absolute top-4 right-4 text-muted hover:text-vtext"><X size={18} /></button>
            <h3 className="text-lg font-bold text-vtext mb-2 flex items-center gap-1.5"><UserCheck size={18} className="text-vblue" /> Murabbiy biriktirish</h3>
            <p className="text-xs text-muted mb-4">{selectedIds.length} ta a'zoga umumiy murabbiy:</p>
            
            <select value={selectedTrainerForAssign} onChange={(e) => setSelectedTrainerForAssign(e.target.value)} className="w-full h-11 bg-surface2 border border-border rounded-[10px] px-3 text-[13px] text-vtext outline-none focus:border-vblue mb-4">
              <option value="">Murabbiyni tanlang</option>
              {trainers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>

            <div className="flex gap-3">
              <button onClick={() => setAssignModalOpen(false)} className="flex-1 p-[10px] rounded-[10px] bg-surface2 text-vtext text-[13px] font-bold hover:bg-border">Bekor qilish</button>
              <button onClick={handleAssignTrainerBulk} className="flex-1 p-[10px] rounded-[10px] bg-vblue text-bg text-[13px] font-bold hover:opacity-90">Biriktirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
