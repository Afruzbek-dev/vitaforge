"use client";
import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { 
  UserPlus, Trash2, Users, Search, BookOpen, Calendar, 
  User, CheckCircle, ShieldAlert, Award, X, Edit2, ClipboardList, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function TrainersPage() {
  const sb = getSupabase();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [gymId, setGymId] = useState<string | null>(null);
  
  // Modals state
  const [mode, setMode] = useState<"list" | "add" | "edit" | "reassign">("list");
  const [selectedTrainer, setSelectedTrainer] = useState<any | null>(null);
  
  // Forms state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    bio: "",
    schedule: "Dush-Chor-Jum (9:00-18:00)",
    max_clients: 15
  });
  
  // Search users for trainer invitation
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reassignment state on delete
  const [targetTrainerId, setTargetTrainerId] = useState("");
  const [clientsCount, setClientsCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const u = await getUser();
    if (!u) return;
    const { data: me } = await sb.from("users").select("gym_id").eq("id", u.id).single();
    if (!me?.gym_id) return;
    setGymId(me.gym_id);
    
    // Fetch users who are trainers in this gym
    const { data: usersData } = await sb.from("users")
      .select("id, full_name, phone, created_at, avatar_url")
      .eq("gym_id", me.gym_id)
      .eq("role", "trainer");

    // Fetch trainer metadata
    const { data: trainersMetadata } = await sb.from("trainers").select("*").eq("gym_id", me.gym_id);

    const merged = (usersData || []).map((u) => {
      const meta = (trainersMetadata || []).find((t) => t.user_id === u.id);
      return {
        ...u,
        trainer_table_id: meta?.id,
        specialization: meta?.specialization || "Umumiy fitnes",
        bio: meta?.bio || "Tajribali murabbiy",
        schedule: meta?.schedule || "Dush-Chor-Jum (9:00-18:00)",
        max_clients: meta?.max_clients || 15
      };
    });

    setTrainers(merged);
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const { data } = await sb.from("users")
      .select("id, full_name, phone, email, role")
      .or(`phone.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      .limit(10);
    setSearchResults(data || []);
    setLoading(false);
  };

  const handleAddNewTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !gymId) return;
    setLoading(true);
    setError("");

    try {
      // Check if user already exists
      const { data: existing } = await sb.from("users").select("id").eq("phone", form.phone).single();
      let userId = existing?.id;

      if (existing) {
        // Update role and gym_id
        await sb.from("users").update({ role: "trainer", gym_id: gymId, name: form.name, full_name: form.name }).eq("id", existing.id);
      } else {
        // Create new user (using email mockup)
        const email = `trainer_${Date.now()}@zenfit.app`;
        const { data: signup, error: signErr } = await sb.auth.signUp({
          email,
          password: `tg_trainer_${Date.now().toString().slice(-6)}`,
          options: { data: { full_name: form.name, role: "trainer" } }
        });
        if (signErr) throw signErr;
        userId = signup.user?.id;
        
        if (userId) {
          await sb.from("users").update({
            gym_id: gymId,
            phone: form.phone,
            name: form.name,
            full_name: form.name,
            role: "trainer"
          }).eq("id", userId);
        }
      }

      if (userId) {
        // Create trainer metadata record
        await sb.from("trainers").insert({
          user_id: userId,
          gym_id: gymId,
          specialization: form.specialization,
          schedule: JSON.stringify({ hours: form.schedule }),
          bio: form.bio
        });
      }

      setForm({ name: "", phone: "", specialization: "", bio: "", schedule: "Dush-Chor-Jum (9:00-18:00)", max_clients: 15 });
      setMode("list");
      load();
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const assignExistingToTrainer = async (userId: string) => {
    if (!gymId) return;
    setLoading(true);
    try {
      await sb.from("users").update({ role: "trainer", gym_id: gymId }).eq("id", userId);
      // Create trainer meta
      await sb.from("trainers").insert({
        user_id: userId,
        gym_id: gymId,
        specialization: "Umumiy fitnes",
        schedule: JSON.stringify({ hours: "Dush-Chor-Jum (9:00-18:00)" }),
        bio: "Tajribali murabbiy"
      });
      setSearchQuery("");
      setSearchResults([]);
      setMode("list");
      load();
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (t: any) => {
    setSelectedTrainer(t);
    setForm({
      name: t.full_name || "",
      phone: t.phone || "",
      specialization: t.specialization,
      bio: t.bio,
      schedule: typeof t.schedule === 'string' ? t.schedule : (t.schedule?.hours || "Dush-Chor-Jum (9:00-18:00)"),
      max_clients: t.max_clients || 15
    });
    setMode("edit");
  };

  const handleUpdateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainer) return;
    setLoading(true);
    try {
      // Update name/phone in users
      await sb.from("users").update({
        full_name: form.name,
        name: form.name,
        phone: form.phone
      }).eq("id", selectedTrainer.id);

      // Update trainer meta
      const { data: existingMeta } = await sb.from("trainers").select("id").eq("user_id", selectedTrainer.id).single();
      if (existingMeta) {
        await sb.from("trainers").update({
          specialization: form.specialization,
          schedule: JSON.stringify({ hours: form.schedule }),
          bio: form.bio
        }).eq("user_id", selectedTrainer.id);
      } else {
        await sb.from("trainers").insert({
          user_id: selectedTrainer.id,
          gym_id: gymId!,
          specialization: form.specialization,
          schedule: JSON.stringify({ hours: form.schedule }),
          bio: form.bio
        });
      }

      setMode("list");
      load();
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Triggered when clicking Delete
  const handleDeleteTrigger = async (t: any) => {
    setSelectedTrainer(t);
    // Check if trainer has assigned members
    const { count } = await sb.from("members").select("*", { count: "exact", head: true }).eq("trainer_id", t.id);
    setClientsCount(count || 0);

    if (count && count > 0) {
      setMode("reassign");
    } else {
      if (confirm(`Haqiqatan ham ${t.full_name}ni murabbiylar ro'yxatidan o'chirmoqchimisiz?`)) {
        await executeDelete(t.id, null);
      }
    }
  };

  const executeDelete = async (trainerId: string, reassignToTrainerId: string | null) => {
    setLoading(true);
    try {
      if (reassignToTrainerId && clientsCount > 0) {
        // Reassign members
        await sb.from("members").update({ trainer_id: reassignToTrainerId }).eq("trainer_id", trainerId);
      } else if (clientsCount > 0) {
        // Remove trainer assignment (set to NULL)
        await sb.from("members").update({ trainer_id: null }).eq("trainer_id", trainerId);
      }

      // Remove trainer record
      await sb.from("trainers").delete().eq("user_id", trainerId);
      // Revert user role to member
      await sb.from("users").update({ role: "member" }).eq("id", trainerId);

      setMode("list");
      setSelectedTrainer(null);
      load();
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeUp text-[#F9FAFB]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#2D2D3D] pb-4">
        <div className="flex items-center gap-2">
          <Users className="text-[#6366F1]" size={24} />
          <div>
            <p className="text-xs uppercase tracking-wider text-[#9CA3AF] font-mono">Boshqaruv</p>
            <h1 className="font-display font-bold text-2xl tracking-tight">Trenerlar</h1>
          </div>
        </div>
        {mode === "list" && (
          <div className="flex gap-2">
            <Button onClick={() => setMode("add")} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-bold h-10">
              <UserPlus size={16} className="mr-1.5 inline" /> Yangi Trener
            </Button>
          </div>
        )}
      </div>

      {mode === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.map((t) => (
            <Card key={t.id} className="bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl overflow-hidden hover:border-[#6366F1]/30 transition shadow-lg">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] font-bold text-xl shrink-0">
                    {t.avatar_url ? <img src={t.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-xl" /> : t.full_name?.[0] || "?"}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-base text-white truncate">{t.full_name}</h4>
                    <span className="inline-block bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {t.specialization}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#9CA3AF] italic line-clamp-2">"{t.bio}"</p>

                <div className="space-y-1.5 text-xs text-[#9CA3AF]">
                  <p className="flex items-center gap-2"><Calendar size={14} /> Ish grafigi: <span className="text-white font-semibold">{t.schedule}</span></p>
                  <p className="flex items-center gap-2"><Phone size={14} /> Telefon: <span className="text-white font-semibold">{t.phone || "Kiritilmagan"}</span></p>
                </div>

                <div className="flex gap-2 pt-3 border-t border-[#2D2D3D]/30">
                  <Button onClick={() => handleOpenEdit(t)} variant="secondary" size="sm" className="flex-1 bg-[#22222F] text-white border-[#2D2D3D] hover:bg-[#2D2D3D] rounded-xl gap-1">
                    <Edit2 size={12} /> Tahrirlash
                  </Button>
                  <Button onClick={() => handleDeleteTrigger(t)} variant="destructive" size="sm" className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 hover:bg-[#EF4444] hover:text-white rounded-xl gap-1">
                    <Trash2 size={12} /> O'chirish
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {trainers.length === 0 && (
            <div className="col-span-full text-center py-12 bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl text-[#9CA3AF] text-sm">
              <ClipboardList size={32} className="mx-auto text-muted mb-2 opacity-50" />
              Trenerlar qo'shilmagan
            </div>
          )}
        </div>
      )}

      {(mode === "add" || mode === "edit") && (
        <Card className="bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl max-w-xl mx-auto">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-white">
                {mode === "add" ? "Yangi Trener qo'shish" : "Trener ma'lumotlarini tahrirlash"}
              </h2>
              <button onClick={() => setMode("list")} className="text-[#9CA3AF] hover:text-white"><X size={18} /></button>
            </div>

            {mode === "add" && (
              <div className="bg-[#22222F]/50 border border-[#2D2D3D] rounded-xl p-4 space-y-3">
                <Label className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Mavjud userlardan qidirish (ixtiyoriy)</Label>
                <div className="flex gap-2">
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ism, telefon yoki email..."
                    className="rounded-xl bg-[#22222F] border-[#2D2D3D]"
                  />
                  <Button onClick={searchUsers} disabled={loading} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-bold px-4">
                    Qidirish
                  </Button>
                </div>
                {searchResults.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pt-2">
                    {searchResults.map(u => (
                      <div key={u.id} className="flex justify-between items-center p-2.5 bg-[#1A1A24] rounded-lg text-xs border border-[#2D2D3D]">
                        <div>
                          <p className="font-semibold text-white">{u.full_name}</p>
                          <p className="text-[#9CA3AF] text-[10px]">{u.phone || u.email} · {u.role}</p>
                        </div>
                        <Button 
                          onClick={() => assignExistingToTrainer(u.id)}
                          className="bg-[#10B981] hover:bg-[#059669] text-white text-[10px] py-1 px-2.5 h-auto rounded-lg"
                        >
                          Qo'shish
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={mode === "add" ? handleAddNewTrainer : handleUpdateTrainer} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tname" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">To'liq Ismi</Label>
                <Input 
                  id="tname"
                  required
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  className="rounded-xl bg-[#22222F] border-[#2D2D3D]"
                  placeholder="Trenerning ismi va familiyasi"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tphone" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Telefon Raqami</Label>
                <Input 
                  id="tphone"
                  required
                  value={form.phone}
                  onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="rounded-xl bg-[#22222F] border-[#2D2D3D]"
                  placeholder="+998..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tspec" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Mutaxassisligi (Specialization)</Label>
                <Input 
                  id="tspec"
                  value={form.specialization}
                  onChange={(e) => setForm(p => ({ ...p, specialization: e.target.value }))}
                  className="rounded-xl bg-[#22222F] border-[#2D2D3D]"
                  placeholder="Kardio, Kuch, Cho'zilish..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tsched" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Ish Grafigi (Schedule)</Label>
                <Input 
                  id="tsched"
                  value={form.schedule}
                  onChange={(e) => setForm(p => ({ ...p, schedule: e.target.value }))}
                  className="rounded-xl bg-[#22222F] border-[#2D2D3D]"
                  placeholder="Dush-Chor-Jum (9:00-18:00)"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tbio" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Murabbiy haqida (Bio)</Label>
                <textarea 
                  id="tbio"
                  value={form.bio}
                  onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))}
                  className="flex min-h-[80px] w-full rounded-xl border border-[#2D2D3D] bg-[#22222F] px-3.5 py-2.5 text-sm text-white placeholder-[#9CA3AF]/45 outline-none focus:border-[#6366F1]"
                  placeholder="Tajriba, yutuqlari..."
                />
              </div>

              {error && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-[#EF4444] text-xs flex items-center gap-2">
                  <ShieldAlert size={14} />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  onClick={() => setMode("list")}
                  variant="secondary"
                  className="flex-1 bg-[#22222F] text-white border-[#2D2D3D] hover:bg-[#2D2D3D] rounded-xl"
                >
                  Bekor qilish
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-bold"
                >
                  {loading ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reassign Members Modal */}
      {mode === "reassign" && selectedTrainer && (
        <Card className="bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl max-w-md mx-auto">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="text-[#F59E0B]" /> A'zolarni qayta biriktirish
            </h2>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Murabbiy <b>{selectedTrainer.full_name}</b> o'chirilmoqda. Unga biriktirilgan <b>{clientsCount}</b> ta a'zoni kimga o'tkazmoqchisiz?
            </p>

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Yangi murabbiyni tanlang</Label>
              <select
                value={targetTrainerId}
                onChange={(e) => setTargetTrainerId(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-[#2D2D3D] bg-[#22222F] px-3.5 text-sm text-[#F9FAFB] outline-none focus:border-[#6366F1]"
              >
                <option value="">Trenerni tanlang (yoki murabbiysiz qoldiring)</option>
                {trainers.filter(t => t.id !== selectedTrainer.id).map(t => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                onClick={() => setMode("list")}
                variant="secondary"
                className="flex-1 bg-[#22222F] text-white border-[#2D2D3D] hover:bg-[#2D2D3D] rounded-xl"
              >
                Bekor qilish
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={() => executeDelete(selectedTrainer.id, targetTrainerId || null)}
                className="flex-1 bg-[#EF4444] hover:bg-[#D32F2F] text-white rounded-xl font-bold"
              >
                Tasdiqlash va O'chirish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
