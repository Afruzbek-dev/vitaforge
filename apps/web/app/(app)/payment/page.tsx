"use client";
import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { 
  Upload, CheckCircle, CreditCard, Clock, 
  ArrowRight, ShieldAlert, Image, Calendar, Check, X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "pending" | "submitted" | "confirmed" | "overdue" | "rejected";

export default function PaymentPage() {
  const sb = getSupabase();
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  
  // Data list states
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Pay Modal / Upload states
  const [payingPayment, setPayingPayment] = useState<any | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await getUser();
      if (!user) return;

      // Fetch all payments for this user
      const { data, error: fetchErr } = await sb.from("payments")
        .select(`
          *,
          gym:gyms(name, address)
        `)
        .eq("member_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;

      // Group payments by status
      const pending = (data || []).filter(p => p.status === "pending" || p.status === "overdue" || p.status === "rejected");
      const history = (data || []).filter(p => p.status === "confirmed" || p.status === "submitted");

      setPendingPayments(pending);
      setPaymentHistory(history);
    } catch (err: any) {
      setError(err.message || "To'lovlarni yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingPayment || !file) return;
    setUploading(true);
    setError("");

    try {
      const user = await getUser();
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}_${user?.id}.${ext}`;
      
      // Upload receipt to Storage bucket 'receipts'
      const { error: uploadErr } = await sb.storage.from("receipts").upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = sb.storage.from("receipts").getPublicUrl(path);

      // Update payment record
      const { error: updateErr } = await sb.from("payments")
        .update({
          status: "submitted",
          receipt_url: urlData.publicUrl
        })
        .eq("id", payingPayment.id);

      if (updateErr) throw updateErr;

      setSuccessMessage("To'lov cheki muvaffaqiyatli yuborildi! Admin tasdiqlashini kuting.");
      setPayingPayment(null);
      setFile(null);
      loadPayments();
    } catch (err: any) {
      setError(err.message || "Yuklashda xatolik yuz berdi.");
    } finally {
      setUploading(false);
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
      case "pending": return "To'lash kutilmoqda";
      case "submitted": return "Yuborilgan";
      case "overdue": return "Muddati o'tgan";
      case "rejected": return "Rad etilgan";
      default: return status;
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 animate-fadeUp text-[#F9FAFB] pb-12">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#2D2D3D] pb-3">
        <CreditCard className="text-[#6366F1]" size={22} />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-mono">Hisoblar</p>
          <h1 className="font-display font-bold text-lg">Mening to'lovlarim</h1>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl text-[#10B981] text-xs flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle size={16} /> {successMessage}</span>
          <button onClick={() => setSuccessMessage("")} className="text-[#10B981] hover:text-[#10B981]/80"><X size={14} /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-[#1A1A24] border border-[#2D2D3D] p-1 rounded-xl">
        <button 
          onClick={() => { setActiveTab("pending"); setError(""); }} 
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "pending" ? "bg-[#6366F1] text-white" : "text-[#9CA3AF]"}`}
        >
          Kutilayotganlar ({pendingPayments.length})
        </button>
        <button 
          onClick={() => { setActiveTab("history"); setError(""); }} 
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "history" ? "bg-[#6366F1] text-white" : "text-[#9CA3AF]"}`}
        >
          To'lovlar tarixi ({paymentHistory.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {activeTab === "pending" && (
            <>
              {pendingPayments.map((p) => (
                <Card key={p.id} className="bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl overflow-hidden hover:border-[#6366F1]/30 transition shadow-md">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusBadge(p.status)}`}>
                        {getStatusLabel(p.status)}
                      </span>
                      <span className="text-[10px] text-[#9CA3AF] font-mono flex items-center gap-1"><Calendar size={11} /> {new Date(p.due_date).toLocaleDateString()}</span>
                    </div>

                    <div>
                      <p className="text-xs text-[#9CA3AF]">{p.gym?.name || "Fitness Klub"}</p>
                      <h4 className="font-bold text-lg text-white font-mono mt-0.5">{Number(p.amount).toLocaleString()} {p.currency}</h4>
                      <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold mt-1">Tarif turi: {p.type}</p>
                    </div>

                    {p.status === "rejected" && (
                      <div className="p-2.5 bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-xl text-xs text-[#EF4444]">
                        <b>Rad etish sababi:</b> Chek noaniq yuklangan yoki xatolik mavjud. Qaytadan yuklang.
                      </div>
                    )}

                    <Button 
                      onClick={() => { setError(""); setPayingPayment(p); }}
                      className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white py-2 rounded-xl text-xs font-bold gap-1"
                    >
                      Chek yuklash va To'lash <ArrowRight size={14} />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {pendingPayments.length === 0 && (
                <div className="text-center py-12 bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl text-[#9CA3AF] text-sm">
                  <CheckCircle size={32} className="mx-auto text-[#10B981] mb-2 opacity-80" />
                  Kutilayotgan to'lovlar yo'q
                </div>
              )}
            </>
          )}

          {activeTab === "history" && (
            <>
              {paymentHistory.map((p) => (
                <Card key={p.id} className="bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl overflow-hidden hover:border-[#6366F1]/30 transition shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between gap-2">
                    <div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getStatusBadge(p.status)}`}>
                        {getStatusLabel(p.status)}
                      </span>
                      <h4 className="font-bold text-sm text-white font-mono mt-1">{Number(p.amount).toLocaleString()} {p.currency}</h4>
                      <p className="text-[9px] text-[#9CA3AF]">{p.gym?.name || "Fitness Klub"} · {new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    {p.receipt_url && (
                      <button 
                        onClick={() => setPreview(p.receipt_url)}
                        className="w-8 h-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] hover:bg-[#6366F1]/20 transition"
                      >
                        <Image size={14} />
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
              {paymentHistory.length === 0 && (
                <div className="text-center py-12 bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl text-[#9CA3AF] text-sm">
                  To'lov tarixi bo'sh
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Pay / Upload Sheet Modal */}
      {payingPayment && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1A1A24] border-t border-[#2D2D3D] w-full max-w-md rounded-t-3xl overflow-hidden shadow-2xl p-6 relative animate-slideUp">
            <button 
              onClick={() => { setPayingPayment(null); setFile(null); }}
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white"
            >
              <X size={18} />
            </button>
            
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1.5">
              <CreditCard size={18} className="text-[#6366F1]" /> To'lov chekini yuklash
            </h3>
            <p className="text-xs text-[#9CA3AF] mb-4">
              To'lov miqdori: <b className="text-white font-mono">{Number(payingPayment.amount).toLocaleString()} {payingPayment.currency}</b>
            </p>

            {error && (
              <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-[#EF4444] text-xs flex items-center gap-2 mb-4">
                <ShieldAlert size={14} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUploadReceipt} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Screenshot yoki kvitansiya rasmi</Label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#2D2D3D] rounded-xl cursor-pointer hover:border-[#6366F1]/50 transition-colors bg-[#22222F]/40 p-4 text-center">
                  <Upload size={22} className="text-[#6366F1] mb-2" />
                  <span className="text-xs text-[#F9FAFB] font-semibold truncate max-w-full">
                    {file ? file.name : "Chek faylini tanlang"}
                  </span>
                  <p className="text-[10px] text-[#9CA3AF] mt-1">Format: JPG, PNG</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden" 
                    required 
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  onClick={() => { setPayingPayment(null); setFile(null); }}
                  variant="secondary"
                  className="flex-1 rounded-xl bg-[#22222F] text-white border-[#2D2D3D]"
                >
                  Bekor qilish
                </Button>
                <Button 
                  type="submit" 
                  disabled={uploading || !file}
                  className="flex-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-bold"
                >
                  {uploading ? "Yuklanmoqda..." : "To'lovni tasdiqlash"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chek preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-md w-full max-h-[80vh] bg-[#1A1A24] border border-[#2D2D3D] p-2 rounded-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 bg-black/40 p-1.5 rounded-lg"><X size={18} /></button>
            <img src={preview} alt="To'lov cheki" className="w-full h-auto rounded-xl object-contain max-h-[75vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
