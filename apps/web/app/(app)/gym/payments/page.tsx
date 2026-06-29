"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store/auth";
import { getUser } from "@/lib/auth";
import { 
  CheckCircle, XCircle, Clock, Image, X, Send, 
  DollarSign, Calendar, FileText, Filter, AlertTriangle, 
  User, Check, ChevronRight, Ban, UserCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "pending" | "submitted" | "confirmed" | "overdue" | "rejected";

export default function AdminPaymentsPage() {
  const { user } = useAuthStore();
  const sb = getSupabase();
  
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [preview, setPreview] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  
  // New Payment Request Form
  const [reqForm, setReqForm] = useState({
    member_id: "",
    amount: "",
    currency: "UZS",
    type: "monthly",
    due_date: "",
    note: ""
  });

  // Rejection state
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const currentUser = await getUser();
    if (!currentUser) return;
    
    // Get gym_id
    const { data: me } = await sb.from("users").select("gym_id").eq("id", currentUser.id).single();
    if (!me?.gym_id) {
      setLoading(false);
      return;
    }
    const gid = me.gym_id;

    // Check overdue payments and update database dynamically on mount
    const nowStr = new Date().toISOString();
    await sb.from("payments")
      .update({ status: "overdue" })
      .eq("gym_id", gid)
      .eq("status", "pending")
      .lt("due_date", nowStr);

    // Fetch payments
    const { data: payData } = await sb.from("payments")
      .select(`
        *,
        member:users!payments_member_id_fkey(id, name, full_name, phone, avatar_url)
      `)
      .eq("gym_id", gid)
      .order("created_at", { ascending: false });

    // Fetch members for payment requests dropdown
    const { data: membersList } = await sb.from("members")
      .select(`
        id,
        user:users!members_user_id_fkey(id, name, full_name, phone)
      `)
      .eq("gym_id", gid);

    const mappedMembers = (membersList || []).map((m: any) => ({
      id: m.user?.id,
      name: m.user?.name || m.user?.full_name || "Noma'lum",
      phone: m.user?.phone || ""
    }));

    setPayments(payData || []);
    setMembers(mappedMembers);
    setLoading(false);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.member_id || !reqForm.amount || !reqForm.due_date) return;
    setLoading(true);

    try {
      const currentUser = await getUser();
      const { data: me } = await sb.from("users").select("gym_id").eq("id", currentUser!.id).single();
      
      const { error } = await sb.from("payments").insert({
        member_id: reqForm.member_id,
        gym_id: me!.gym_id,
        amount: Number(reqForm.amount),
        currency: reqForm.currency,
        type: reqForm.type,
        due_date: new Date(reqForm.due_date).toISOString(),
        status: "pending"
      });

      if (error) throw error;

      // Send Telegram notification simulated via notifications table
      await sb.from("notifications").insert({
        user_id: reqForm.member_id,
        title: "Kutilayotgan To'lov",
        body: `Sizga ${Number(reqForm.amount).toLocaleString()} ${reqForm.currency} miqdorida yangi to'lov hisobi yuborildi.`,
        type: "plan_ready"
      });

      setShowRequestForm(false);
      setReqForm({
        member_id: "",
        amount: "",
        currency: "UZS",
        type: "monthly",
        due_date: "",
        note: ""
      });
      loadData();
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (payment: any) => {
    setLoading(true);
    try {
      const currentUser = await getUser();
      // Update payment
      await sb.from("payments")
        .update({ 
          status: "confirmed", 
          paid_date: new Date().toISOString(),
          confirmed_by: currentUser!.id
        })
        .eq("id", payment.id);

      // Automatically extend the membership
      const days = payment.type === "annual" ? 365 : payment.type === "monthly" ? 30 : 1;
      const { data: memberProfile } = await sb.from("members").select("id, end_date").eq("user_id", payment.member_id).single();
      if (memberProfile) {
        let baseDate = new Date();
        if (memberProfile.end_date) {
          const end = new Date(memberProfile.end_date);
          if (end > baseDate) baseDate = end;
        }
        baseDate.setDate(baseDate.getDate() + days);

        await sb.from("members")
          .update({ end_date: baseDate.toISOString(), status: "active" })
          .eq("id", memberProfile.id);
      }

      loadData();
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReject = (id: string) => {
    setRejectingPaymentId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPaymentId) return;
    setLoading(true);
    try {
      await sb.from("payments")
        .update({ status: "rejected" })
        .eq("id", rejectingPaymentId);

      // Send rejection notification
      const p = payments.find(x => x.id === rejectingPaymentId);
      if (p) {
        await sb.from("notifications").insert({
          user_id: p.member_id,
          title: "To'lov Rad Etildi",
          body: `To'lovingiz rad etildi. Sabab: ${rejectReason || "Chek xato yuklangan."}`,
          type: "churn_alert"
        });
      }

      setRejectModalOpen(false);
      setRejectingPaymentId(null);
      loadData();
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (payment: any) => {
    try {
      await sb.from("notifications").insert({
        user_id: payment.member_id,
        title: "Muddati o'tgan to'lov",
        body: `Sizning to'lovingiz muddati o'tgan. Iltimos, ${Number(payment.amount).toLocaleString()} ${payment.currency} to'lovni tasdiqlang.`,
        type: "streak_reminder"
      });
      alert("Eslatma a'zoga Telegram orqali yuborildi!");
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "confirmed":
        return "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20";
      case "pending":
        return "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20";
      case "submitted":
        return "bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/20";
      case "overdue":
        return "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20";
      case "rejected":
        return "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30";
      default:
        return "bg-[#9CA3AF]/10 text-[#9CA3AF]";
    }
  };

  const getStatusLabel = (status: Status) => {
    switch (status) {
      case "confirmed": return "Tasdiqlangan";
      case "pending": return "Kutilmoqda";
      case "submitted": return "Yuborilgan";
      case "overdue": return "Muddati o'tgan";
      case "rejected": return "Rad etilgan";
      default: return status;
    }
  };

  const filteredPayments = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeUp text-[#F9FAFB]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#2D2D3D] pb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="text-[#6366F1]" size={24} />
          <div>
            <p className="text-xs uppercase tracking-wider text-[#9CA3AF] font-mono">Boshqaruv</p>
            <h1 className="font-display font-bold text-2xl tracking-tight">Klub To'lovlari</h1>
          </div>
        </div>
        {user?.role === "gym_owner" && (
          <Button onClick={() => setShowRequestForm(!showRequestForm)} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-bold h-10">
            <Send size={16} className="mr-1.5 inline" /> To'lov so'rash
          </Button>
        )}
      </div>

      {/* Payment request form */}
      {showRequestForm && (
        <Card className="bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl max-w-xl mx-auto">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">A'zoga to'lov hisobi yuborish</h2>
              <button onClick={() => setShowRequestForm(false)} className="text-[#9CA3AF] hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="req_member" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">A'zo tanlash</Label>
                <select 
                  id="req_member"
                  required
                  value={reqForm.member_id} 
                  onChange={(e) => setReqForm({ ...reqForm, member_id: e.target.value })} 
                  className="flex h-11 w-full rounded-xl border border-[#2D2D3D] bg-[#22222F] px-3.5 text-sm text-[#F9FAFB] outline-none focus:border-[#6366F1]"
                >
                  <option value="">A'zoni tanlang</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="req_amount" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Summa</Label>
                  <Input 
                    id="req_amount"
                    type="number" 
                    required
                    value={reqForm.amount} 
                    onChange={(e) => setReqForm({ ...reqForm, amount: e.target.value })}
                    className="rounded-xl bg-[#22222F] border-[#2D2D3D]"
                    placeholder="150000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="req_curr" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Valyuta</Label>
                  <select 
                    id="req_curr"
                    value={reqForm.currency} 
                    onChange={(e) => setReqForm({ ...reqForm, currency: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-[#2D2D3D] bg-[#22222F] px-3.5 text-sm text-[#F9FAFB] outline-none focus:border-[#6366F1]"
                  >
                    <option value="UZS">UZS (so'm)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="req_type" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Tarif turi</Label>
                  <select 
                    id="req_type"
                    value={reqForm.type} 
                    onChange={(e) => setReqForm({ ...reqForm, type: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-[#2D2D3D] bg-[#22222F] px-3.5 text-sm text-[#F9FAFB] outline-none focus:border-[#6366F1]"
                  >
                    <option value="monthly">Oylik a'zolik</option>
                    <option value="annual">Yillik a'zolik</option>
                    <option value="drop-in">Kunlik kirish</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="req_due" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">To'lash muddati</Label>
                  <Input 
                    id="req_due"
                    type="date" 
                    required
                    value={reqForm.due_date} 
                    onChange={(e) => setReqForm({ ...reqForm, due_date: e.target.value })}
                    className="rounded-xl bg-[#22222F] border-[#2D2D3D]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowRequestForm(false)} variant="secondary" className="flex-1 rounded-xl bg-[#22222F] text-white border-[#2D2D3D]">
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-bold">
                  Hisob yuborish
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { label: "Barchasi", value: "all" },
          { label: "Kutilmoqda", value: "pending" },
          { label: "Yuborilgan", value: "submitted" },
          { label: "Tasdiqlangan", value: "confirmed" },
          { label: "Muddati o'tgan", value: "overdue" },
          { label: "Rad etilgan", value: "rejected" }
        ].map((f) => (
          <button 
            key={f.value} 
            onClick={() => setFilter(f.value as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${filter === f.value ? "bg-[#6366F1] text-white" : "bg-[#1A1A24] border border-[#2D2D3D] text-[#9CA3AF] hover:text-white"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
        {filteredPayments.map((p) => (
          <Card key={p.id} className="bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl overflow-hidden hover:border-[#6366F1]/30 transition shadow-lg flex flex-col justify-between">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusBadge(p.status)}`}>
                  {getStatusLabel(p.status)}
                </span>
                <span className="text-[10px] text-[#9CA3AF] font-mono">{new Date(p.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1] font-bold shrink-0">
                  {p.member?.avatar_url ? <img src={p.member.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-xl" /> : <User size={18} />}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{p.member?.name || p.member?.full_name || "Noma'lum"}</h4>
                  <p className="text-[10px] text-[#9CA3AF] font-mono">{p.member?.phone || "—"}</p>
                </div>
              </div>

              <div className="space-y-1.5 bg-[#22222F]/40 p-3 rounded-xl border border-[#2D2D3D]/50 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Summa:</span>
                  <span className="text-white font-bold font-mono">{Number(p.amount).toLocaleString()} {p.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Tarif turi:</span>
                  <span className="text-white font-semibold capitalize">{p.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">To'lash muddati:</span>
                  <span className="text-white font-semibold">{new Date(p.due_date).toLocaleDateString()}</span>
                </div>
              </div>

              {p.status === "submitted" && p.receipt_url && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setPreview(p.receipt_url)}
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-[#2D2D3D] text-[#9CA3AF] rounded-xl text-xs gap-1.5 h-9"
                  >
                    <Image size={14} /> Chekni ko'rish
                  </Button>
                </div>
              )}
            </CardContent>

            <div className="p-4 bg-[#22222F]/30 border-t border-[#2D2D3D]/20 flex gap-2">
              {p.status === "submitted" && (
                <>
                  <Button 
                    onClick={() => handleConfirm(p)}
                    className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold py-2 rounded-xl gap-1 h-9"
                  >
                    <Check size={14} /> Tasdiqlash
                  </Button>
                  <Button 
                    onClick={() => handleOpenReject(p.id)}
                    variant="destructive"
                    className="flex-1 bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white text-xs font-bold py-2 rounded-xl gap-1 h-9"
                  >
                    <Ban size={14} /> Rad etish
                  </Button>
                </>
              )}
              {p.status === "overdue" && (
                <Button 
                  onClick={() => handleSendReminder(p)}
                  className="w-full bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white text-xs font-bold py-2 rounded-xl gap-1.5 h-9"
                >
                  <AlertTriangle size={14} /> Eslatma yuborish
                </Button>
              )}
              {p.status === "pending" && (
                <div className="w-full text-center text-[10px] text-[#9CA3AF] py-1 font-semibold font-mono uppercase tracking-wider">
                  Mijoz to'lovini kutilmoqda...
                </div>
              )}
              {p.status === "confirmed" && (
                <div className="w-full text-center text-[10px] text-[#10B981] py-1 font-semibold font-mono uppercase tracking-wider flex items-center justify-center gap-1">
                  <CheckCircle size={12} /> Tasdiqlangan
                </div>
              )}
              {p.status === "rejected" && (
                <div className="w-full text-center text-[10px] text-[#EF4444] py-1 font-semibold font-mono uppercase tracking-wider flex items-center justify-center gap-1">
                  <XCircle size={12} /> Rad etilgan
                </div>
              )}
            </div>
          </Card>
        ))}

        {filteredPayments.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#9CA3AF] text-sm">To'lovlar topilmadi</div>
        )}
      </div>

      {/* Chek preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-md w-full max-h-[80vh] bg-[#1A1A24] border border-[#2D2D3D] p-2 rounded-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 bg-black/40 p-1.5 rounded-lg"><X size={18} /></button>
            <img src={preview} alt="To'lov cheki" className="w-full h-auto rounded-xl object-contain max-h-[75vh]" />
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1A1A24] border border-[#2D2D3D] w-full max-w-sm rounded-2xl p-6 relative animate-scaleIn">
            <button onClick={() => setRejectModalOpen(false)} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1.5">
              <Ban size={18} className="text-[#EF4444]" /> To'lovni rad etish
            </h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="rej_reason" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Rad etish sababi</Label>
                <textarea 
                  id="rej_reason"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-xl border border-[#2D2D3D] bg-[#22222F] px-3.5 py-2.5 text-sm text-white placeholder-[#9CA3AF]/45 outline-none focus:border-[#EF4444]"
                  placeholder="Misol: Rasm noaniq yoki to'lov summasi mos emas..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setRejectModalOpen(false)} variant="secondary" className="flex-1 rounded-xl bg-[#22222F] text-white border-[#2D2D3D]">
                  Bekor qilish
                </Button>
                <Button type="submit" className="flex-1 bg-[#EF4444] hover:bg-[#D32F2F] text-white rounded-xl font-bold">
                  Rad etish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
