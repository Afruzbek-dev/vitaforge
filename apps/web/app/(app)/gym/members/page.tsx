"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { 
  Search, UserPlus, Send, CreditCard, Filter, Users, 
  AlertTriangle, UserCheck, CheckCircle, Clock, X, 
  Calendar, Award, MessageSquare, ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FilterType = "all" | "active" | "expiring" | "expired" | "no_trainer";

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
  const [assigningTrainerId, setAssigningTrainerId] = useState<string | null>(null);
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
        user:users!members_user_id_fkey(id, name, full_name, phone, email, avatar_url),
        trainer:users!members_trainer_id_fkey(id, name, full_name)
      `)
      .eq("gym_id", gid);

    if (error) console.error("Error loading members:", error);

    // Get trainers for assignment dropdown
    const { data: trainersList } = await sb.from("users")
      .select("id, full_name, name")
      .eq("gym_id", gid)
      .eq("role", "trainer");

    // Map members to computed status
    const mapped = (membersList || []).map((m: any) => {
      const now = new Date();
      const end = m.end_date ? new Date(m.end_date) : null;
      let calculatedStatus = m.status || "active";
      
      if (end) {
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          calculatedStatus = "expired";
        } else if (diffDays <= 7) {
          calculatedStatus = "expiring";
        }
      }

      return {
        ...m,
        member_name: m.user?.name || m.user?.full_name || "Noma'lum",
        member_phone: m.user?.phone || "—",
        member_email: m.user?.email || "",
        member_avatar: m.user?.avatar_url,
        trainer_name: m.trainer?.name || m.trainer?.full_name || "Biriktirilmagan",
        computedStatus: calculatedStatus
      };
    });

    setMembers(mapped);
    setTrainers(trainersList || []);
  };

  // Bulk Selection toggle
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

  // Bulk Actions
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
      const user = await getUser();
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

  // Filter members
  const filteredMembers = members.filter((m) => {
    const matchSearch = m.member_name.toLowerCase().includes(search.toLowerCase()) || 
                        m.member_phone.includes(search);
    
    if (filter === "all") return matchSearch;
    if (filter === "active") return matchSearch && m.computedStatus === "active";
    if (filter === "expiring") return matchSearch && m.computedStatus === "expiring";
    if (filter === "expired") return matchSearch && m.computedStatus === "expired";
    if (filter === "no_trainer") return matchSearch && (!m.trainer_id);
    return matchSearch;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20";
      case "expiring":
        return "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20";
      case "expired":
        return "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20";
      default:
        return "bg-[#9CA3AF]/10 text-[#9CA3AF] border border-[#2D2D3D]";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Faol";
      case "expiring": return "Yaqinda tugaydi";
      case "expired": return "Tugagan";
      default: return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeUp text-[#F9FAFB]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#2D2D3D] pb-4">
        <div className="flex items-center gap-2">
          <Users className="text-[#6366F1]" size={24} />
          <div>
            <p className="text-xs uppercase tracking-wider text-[#9CA3AF] font-mono">CRM tizimi</p>
            <h1 className="font-display font-bold text-2xl tracking-tight">Klub A'zolari</h1>
          </div>
        </div>
        <Link href="/gym/invite">
          <Button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-bold h-10">
            <UserPlus size={16} className="mr-1.5 inline" /> Taklif yuborish
          </Button>
        </Link>
      </div>

      {/* Bulk actions panel */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-2xl animate-fadeUp">
          <span className="text-xs font-semibold text-[#6366F1]">{selectedIds.length} ta a'zo tanlandi</span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => setIsExtendModalOpen(true)}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg text-xs"
            >
              Uzatish
            </Button>
            <Button 
              size="sm" 
              onClick={() => setAssignModalOpen(true)}
              className="bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs"
            >
              Murabbiy biriktirish
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={handleBulkSendReminder}
              className="bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-lg text-xs"
            >
              Eslatma
            </Button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="A'zo ismi yoki telefon..." 
            className="pl-10 rounded-xl bg-[#1A1A24] border-[#2D2D3D] placeholder-[#9CA3AF]/45 text-white focus:border-[#6366F1]"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {[
            { id: "all", label: "Barchasi" },
            { id: "active", label: "Faol" },
            { id: "expiring", label: "Yaqinda tugaydi" },
            { id: "expired", label: "Muddati o'tgan" },
            { id: "no_trainer", label: "Trenerisiz" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as FilterType)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${filter === f.id ? "bg-[#6366F1] text-white" : "bg-[#1A1A24] border border-[#2D2D3D] text-[#9CA3AF] hover:text-white"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop view table */}
      <Card className="bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl overflow-hidden shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2D2D3D] text-[#9CA3AF] font-bold">
                  <th className="py-4 px-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-[#2D2D3D] bg-[#22222F] text-[#6366F1] focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-3">SPORTCHI</th>
                  <th className="py-4 px-3">PLAN TURI</th>
                  <th className="py-4 px-3">MURABBIY</th>
                  <th className="py-4 px-3">TUGASH SANA</th>
                  <th className="py-4 px-3">STATUS</th>
                  <th className="py-4 px-4 text-right">AMALLAR</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="border-b border-[#2D2D3D]/30 text-white/90 hover:bg-[#22222F]/30 transition">
                    <td className="py-3 px-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(m.id)}
                        onChange={() => toggleSelectOne(m.id)}
                        className="rounded border-[#2D2D3D] bg-[#22222F] text-[#6366F1] focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1] text-[10px] font-bold shrink-0">
                          {m.member_avatar ? <img src={m.member_avatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" /> : m.member_name[0]}
                        </div>
                        <div>
                          <p className="font-semibold">{m.member_name}</p>
                          <p className="text-[10px] text-[#9CA3AF] font-mono">{m.member_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 capitalize font-medium">{m.membership_type || "monthly"}</td>
                    <td className="py-3 px-3 text-[#9CA3AF] font-medium">{m.trainer_name}</td>
                    <td className="py-3 px-3 font-medium">
                      {m.end_date ? new Date(m.end_date).toLocaleDateString() : "Cheksiz"}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadgeClass(m.computedStatus)}`}>
                        {getStatusLabel(m.computedStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button 
                          onClick={() => {
                            setSelectedIds([m.id]);
                            setIsExtendModalOpen(true);
                          }}
                          variant="secondary" 
                          size="sm" 
                          className="bg-[#22222F] text-white border-[#2D2D3D] hover:bg-[#2D2D3D] text-[10px] py-1.5 h-auto rounded-lg"
                        >
                          Muddati uzaytirish
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#9CA3AF]">
                      Zal a'zolari topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Extend Membership Modal */}
      {isExtendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1A1A24] border border-[#2D2D3D] w-full max-w-sm rounded-2xl p-6 relative animate-scaleIn">
            <button onClick={() => setIsExtendModalOpen(false)} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1.5">
              <Calendar size={18} className="text-[#6366F1]" /> A'zolik muddatini uzaytirish
            </h3>
            <p className="text-xs text-[#9CA3AF] mb-4">Tanlangan {selectedIds.length} ta a'zo uchun muddatni qo'shish:</p>
            
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Kunlar soni</Label>
              <select
                value={extendDays}
                onChange={(e) => setExtendDays(Number(e.target.value))}
                className="flex h-11 w-full rounded-xl border border-[#2D2D3D] bg-[#22222F] px-3.5 text-sm text-[#F9FAFB] outline-none focus:border-[#6366F1]"
              >
                <option value={7}>7 kun (Haftalik)</option>
                <option value={30}>30 kun (Bir oylik)</option>
                <option value={90}>90 kun (Uch oylik)</option>
                <option value={365}>365 kun (Yillik)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setIsExtendModalOpen(false)} variant="secondary" className="flex-1 rounded-xl bg-[#22222F] text-white border-[#2D2D3D]">
                Bekor qilish
              </Button>
              <Button onClick={handleBulkExtend} className="flex-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-bold">
                Uzaytirish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Trainer Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1A1A24] border border-[#2D2D3D] w-full max-w-sm rounded-2xl p-6 relative animate-scaleIn">
            <button onClick={() => setAssignModalOpen(false)} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1.5">
              <UserCheck size={18} className="text-[#6366F1]" /> Murabbiy biriktirish
            </h3>
            <p className="text-xs text-[#9CA3AF] mb-4">Tanlangan {selectedIds.length} ta a'zo uchun umumiy murabbiy:</p>

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Trener ro'yxati</Label>
              <select
                value={selectedTrainerForAssign}
                onChange={(e) => setSelectedTrainerForAssign(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-[#2D2D3D] bg-[#22222F] px-3.5 text-sm text-[#F9FAFB] outline-none focus:border-[#6366F1]"
              >
                <option value="">Murabbiyni tanlang</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setAssignModalOpen(false)} variant="secondary" className="flex-1 rounded-xl bg-[#22222F] text-white border-[#2D2D3D]">
                Bekor qilish
              </Button>
              <Button onClick={handleAssignTrainerBulk} className="flex-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-bold">
                Biriktirish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
