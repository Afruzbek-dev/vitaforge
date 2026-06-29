"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store/auth";
import { 
  Building2, Users, Wallet, TrendingUp, TrendingDown, 
  Search, Plus, Edit, Trash2, ShieldAlert, CheckCircle, 
  MapPin, Phone, CreditCard, ChevronRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const sb = getSupabase();

  const [activeTab, setActiveTab] = useState<"dashboard" | "gyms">("dashboard");
  const [stats, setStats] = useState({ gyms: 0, members: 0, trainers: 0, revenue: 0, overdueAlerts: 0 });
  const [gyms, setGyms] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);

  // Search & Filter state for gyms
  const [gymSearch, setGymSearch] = useState("");
  const [gymFilter, setGymFilter] = useState<"all" | "basic" | "pro" | "enterprise">("all");

  // Gym Modal state
  const [isGymModalOpen, setIsGymModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentGymId, setCurrentGymId] = useState<string | null>(null);
  const [gymForm, setGymForm] = useState({
    name: "",
    owner_id: "",
    address: "",
    phone: "",
    logo_url: "",
    subscription_plan: "basic"
  });

  // Fetch all admin data
  const fetchData = async () => {
    if (user?.role !== "admin") return;

    try {
      // 1. Gyms count
      const { data: gymData, error: gymErr } = await sb.from("gyms").select("*").is("deleted_at", null);
      const activeGyms = gymData || [];

      // 2. Members count
      const { count: totalMembers } = await sb.from("users").select("*", { count: "exact", head: true }).eq("role", "member");

      // 3. Trainers count
      const { count: totalTrainers } = await sb.from("users").select("*", { count: "exact", head: true }).eq("role", "trainer");

      // 4. Load all users (for gym owner selection)
      const { data: owners } = await sb.from("users").select("id, full_name, email, role").or("role.eq.gym_owner,role.eq.admin");

      // 5. Recent signups (last 5)
      const { data: signups } = await sb.from("users").select("*").order("created_at", { ascending: false }).limit(5);

      // 6. Overdue Payments alerts
      const { data: overduePay } = await sb.from("payments")
        .select("*, users(name, phone)")
        .eq("status", "overdue")
        .order("due_date", { ascending: true });

      // 7. Confirmed revenue (last 30 days)
      const ago30 = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data: payHistory } = await sb.from("payments")
        .select("amount, paid_date, currency")
        .eq("status", "confirmed")
        .gte("paid_date", ago30);

      // Calculate total revenue (UZS as baseline, assume amount values)
      const totalRev = (payHistory || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

      // Generate 30 days revenue chart data
      const revChart: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const dayKey = d.toISOString().split("T")[0];
        revChart[dayKey] = 0;
      }
      (payHistory || []).forEach((p) => {
        if (p.paid_date) {
          const day = p.paid_date.split("T")[0];
          if (revChart[day] !== undefined) {
            revChart[day] += Number(p.amount || 0);
          }
        }
      });
      const chartArr = Object.entries(revChart).map(([date, amount]) => {
        const dayLabel = date.split("-").slice(1).join("/"); // MM/DD
        return { name: dayLabel, revenue: amount };
      });

      setStats({
        gyms: activeGyms.length,
        members: totalMembers || 0,
        trainers: totalTrainers || 0,
        revenue: totalRev,
        overdueAlerts: overduePay?.length || 0
      });
      setGyms(activeGyms);
      setUsersList(owners || []);
      setRecentSignups(signups || []);
      setSystemAlerts(overduePay || []);
      setRevenueHistory(chartArr);

    } catch (err) {
      console.error("Error loading admin dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (user?.role !== "admin") return null;

  // Filter gyms
  const filteredGyms = gyms.filter((g) => {
    const matchSearch = g.name?.toLowerCase().includes(gymSearch.toLowerCase()) ||
                        g.address?.toLowerCase().includes(gymSearch.toLowerCase());
    const matchFilter = gymFilter === "all" || g.subscription_plan === gymFilter;
    return matchSearch && matchFilter;
  });

  // Open Gym Modal for Add
  const handleOpenAdd = () => {
    setModalMode("add");
    setCurrentGymId(null);
    setGymForm({
      name: "",
      owner_id: usersList[0]?.id || "",
      address: "",
      phone: "",
      logo_url: "",
      subscription_plan: "basic"
    });
    setIsGymModalOpen(true);
  };

  // Open Gym Modal for Edit
  const handleOpenEdit = (g: any) => {
    setModalMode("edit");
    setCurrentGymId(g.id);
    setGymForm({
      name: g.name || "",
      owner_id: g.owner_id || "",
      address: g.address || "",
      phone: g.phone || "",
      logo_url: g.logo_url || "",
      subscription_plan: g.subscription_plan || "basic"
    });
    setIsGymModalOpen(true);
  };

  // Save/Update Gym
  const handleSaveGym = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = gymForm.name.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
      if (modalMode === "add") {
        const { data, error } = await sb.from("gyms").insert({
          ...gymForm,
          slug
        }).select();
        if (error) throw error;
        // link user if owner_id exists
        if (gymForm.owner_id && data?.[0]) {
          await sb.from("users").update({ gym_id: data[0].id }).eq("id", gymForm.owner_id);
        }
      } else if (modalMode === "edit" && currentGymId) {
        const { error } = await sb.from("gyms").update({
          ...gymForm,
          slug
        }).eq("id", currentGymId);
        if (error) throw error;
        if (gymForm.owner_id) {
          await sb.from("users").update({ gym_id: currentGymId }).eq("id", gymForm.owner_id);
        }
      }
      setIsGymModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Xatolik yuz berdi: " + (err as any).message);
    }
  };

  // Delete Gym
  const handleDeleteGym = async (id: string) => {
    if (!confirm("Haqiqatan ham ushbu zalni o'chirmoqchimisiz?")) return;
    try {
      // Soft delete setting deleted_at
      const { error } = await sb.from("gyms").update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert("Xatolik yuz berdi: " + (err as any).message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeUp text-[#F9FAFB]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#2D2D3D] pb-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#9CA3AF] font-mono">Boshqaruv</p>
          <h1 className="font-display font-bold text-2xl tracking-tight">Tizim Administratori</h1>
        </div>
        <div className="flex bg-[#1A1A24] border border-[#2D2D3D] p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "dashboard" ? "bg-[#6366F1] text-white" : "text-[#9CA3AF] hover:text-white"}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("gyms")} 
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "gyms" ? "bg-[#6366F1] text-white" : "text-[#9CA3AF] hover:text-white"}`}
          >
            Zallar Boshqaruvi
          </button>
        </div>
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fadeIn">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Jami Zallar", value: stats.gyms, icon: Building2, color: "text-[#6366F1] border-l-[#6366F1]" },
              { label: "Jami A'zolar", value: stats.members, icon: Users, color: "text-[#3B82F6] border-l-[#3B82F6]" },
              { label: "Jami Trenerlar", value: stats.trainers, icon: Users, color: "text-[#10B981] border-l-[#10B981]" },
              { label: "Oylik Tushum (so'm)", value: stats.revenue.toLocaleString(), icon: Wallet, color: "text-[#F59E0B] border-l-[#F59E0B]" },
              { label: "Muddati O'tgan", value: stats.overdueAlerts, icon: ShieldAlert, color: "text-[#EF4444] border-l-[#EF4444]", alert: stats.overdueAlerts > 0 },
            ].map((c) => (
              <Card key={c.label} className={`bg-[#1A1A24] border border-[#2D2D3D] border-l-4 ${c.color} rounded-2xl`}>
                <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
                  <div className="flex items-center justify-between">
                    <c.icon size={18} className={c.color.split(" ")[0]} />
                    {c.alert && <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />}
                  </div>
                  <div className="mt-2">
                    <p className="text-xl font-bold font-display tracking-tight text-white">{c.value}</p>
                    <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider mt-0.5">{c.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="bg-[#1A1A24] border border-[#2D2D3D] lg:col-span-2 rounded-2xl">
              <CardContent className="p-5">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">KIRIM ANALITIKASI</p>
                  <h3 className="text-lg font-bold text-white mt-1">Oxirgi 30 kunlik tushum</h3>
                </div>
                <div className="h-56">
                  {revenueHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueHistory} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#1A1A24", borderColor: "#2D2D3D", borderRadius: 12, color: "#F9FAFB" }}
                          itemStyle={{ color: "#6366F1" }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-[#9CA3AF]">Ma'lumot topilmadi</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card className="bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl">
              <CardContent className="p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={16} className="text-[#EF4444]" /> Muddati O'tgan to'lovlar
                  </h3>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {systemAlerts.map((a) => (
                    <div key={a.id} className="p-3 bg-[#22222F]/50 border border-[#2D2D3D] rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-[#F9FAFB]">{a.users?.name || "Noma'lum"}</span>
                        <span className="text-[#EF4444]">{Number(a.amount).toLocaleString()} {a.currency}</span>
                      </div>
                      <div className="flex justify-between text-[#9CA3AF] text-[10px]">
                        <span>Tugash muddati: {new Date(a.due_date).toLocaleDateString()}</span>
                        <span className="bg-[#EF4444]/10 text-[#EF4444] px-1.5 py-0.5 rounded font-bold font-mono">OVERDUE</span>
                      </div>
                    </div>
                  ))}
                  {systemAlerts.length === 0 && (
                    <div className="text-center text-xs text-[#9CA3AF] py-8">Muddati o'tgan to'lovlar yo'q</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Signups */}
          <Card className="bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Oxirgi ro'yxatdan o'tganlar</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#2D2D3D] text-[#9CA3AF] font-bold">
                      <th className="pb-3">Ism</th>
                      <th className="pb-3">Email / Telefon</th>
                      <th className="pb-3">Rol</th>
                      <th className="pb-3">Zal UUID</th>
                      <th className="pb-3">Qo'shilgan sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSignups.map((u) => (
                      <tr key={u.id} className="border-b border-[#2D2D3D]/30 text-white/90 hover:bg-[#22222F]/30 transition">
                        <td className="py-3 font-semibold">{u.name || u.full_name || "Noma'lum"}</td>
                        <td className="py-3">{u.email || u.phone || "Kiritilmagan"}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-[#EF4444]/10 text-[#EF4444]' : u.role === 'gym_owner' ? 'bg-[#6366F1]/10 text-[#6366F1]' : u.role === 'trainer' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#10B981]/10 text-[#10B981]'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-[10px] text-[#9CA3AF] truncate max-w-[120px]">{u.gym_id || "Ulanmagan"}</td>
                        <td className="py-3 text-[#9CA3AF]">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "gyms" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <Input 
                  value={gymSearch} 
                  onChange={(e) => setGymSearch(e.target.value)} 
                  placeholder="Zal nomi yoki manzil..." 
                  className="pl-10 rounded-xl bg-[#1A1A24] border-[#2D2D3D] text-white placeholder-[#9CA3AF]/45 focus:border-[#6366F1]"
                />
              </div>
              <select 
                value={gymFilter} 
                onChange={(e) => setGymFilter(e.target.value as any)}
                className="rounded-xl bg-[#1A1A24] border border-[#2D2D3D] text-xs font-semibold px-4 text-[#F9FAFB] h-10 outline-none focus:border-[#6366F1]"
              >
                <option value="all">Barcha tariflar</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <Button onClick={handleOpenAdd} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl w-full sm:w-auto font-bold h-10">
              <Plus size={16} className="mr-1.5 inline" /> Yangi Zal
            </Button>
          </div>

          {/* Gyms list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGyms.map((g) => {
              const owner = usersList.find(u => u.id === g.owner_id);
              return (
                <Card key={g.id} className="bg-[#1A1A24] border border-[#2D2D3D] rounded-2xl overflow-hidden hover:border-[#6366F1]/30 transition shadow-lg">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] font-bold text-lg shrink-0">
                        {g.logo_url ? <img src={g.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" /> : g.name?.[0] || "?"}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-base text-white truncate">{g.name}</h4>
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${g.subscription_plan === 'enterprise' ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20' : g.subscription_plan === 'pro' ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20' : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20'}`}>
                          {g.subscription_plan} plan
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[#9CA3AF]">
                      {g.address && <p className="flex items-center gap-2"><MapPin size={14} className="shrink-0" /> {g.address}</p>}
                      {g.phone && <p className="flex items-center gap-2"><Phone size={14} className="shrink-0" /> {g.phone}</p>}
                      <p className="flex items-center gap-2">
                        <Users size={14} className="shrink-0" /> Owner: <span className="text-[#F9FAFB] font-semibold">{owner?.full_name || "Biriktirilmagan"}</span>
                      </p>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-[#2D2D3D]/30">
                      <Button onClick={() => handleOpenEdit(g)} variant="secondary" size="sm" className="flex-1 bg-[#22222F] text-white border-[#2D2D3D] hover:bg-[#2D2D3D] rounded-xl gap-1">
                        <Edit size={12} /> Tahrirlash
                      </Button>
                      <Button onClick={() => handleDeleteGym(g.id)} variant="destructive" size="sm" className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 hover:bg-[#EF4444] hover:text-white rounded-xl gap-1">
                        <Trash2 size={12} /> O'chirish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredGyms.length === 0 && (
              <div className="col-span-full text-center py-12 text-[#9CA3AF] text-sm">Zallar topilmadi</div>
            )}
          </div>
        </div>
      )}

      {/* Gym Add/Edit Modal */}
      {isGymModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1A1A24] border border-[#2D2D3D] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 relative animate-scaleIn">
            <button 
              onClick={() => setIsGymModalOpen(false)} 
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white transition"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              {modalMode === "add" ? "Yangi zal qo'shish" : "Zalni tahrirlash"}
            </h3>
            <form onSubmit={handleSaveGym} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="gname" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Zal Nomi</Label>
                <Input 
                  id="gname"
                  required
                  value={gymForm.name}
                  onChange={(e) => setGymForm(p => ({ ...p, name: e.target.value }))}
                  className="rounded-xl bg-[#22222F] border-[#2D2D3D] text-white focus:border-[#6366F1]"
                  placeholder="Zalning to'liq nomi"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gowner" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Boshqaruvchi (Owner)</Label>
                <select 
                  id="gowner"
                  value={gymForm.owner_id}
                  onChange={(e) => setGymForm(p => ({ ...p, owner_id: e.target.value }))}
                  className="flex h-11 w-full rounded-xl border border-[#2D2D3D] bg-[#22222F] px-3.5 text-sm text-[#F9FAFB] outline-none focus:border-[#6366F1]"
                >
                  <option value="">Zal egasini tanlang</option>
                  {usersList.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gaddress" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Manzil</Label>
                <Input 
                  id="gaddress"
                  value={gymForm.address}
                  onChange={(e) => setGymForm(p => ({ ...p, address: e.target.value }))}
                  className="rounded-xl bg-[#22222F] border-[#2D2D3D] text-white focus:border-[#6366F1]"
                  placeholder="Zal joylashgan manzil"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gphone" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Telefon</Label>
                <Input 
                  id="gphone"
                  value={gymForm.phone}
                  onChange={(e) => setGymForm(p => ({ ...p, phone: e.target.value }))}
                  className="rounded-xl bg-[#22222F] border-[#2D2D3D] text-white focus:border-[#6366F1]"
                  placeholder="+998..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gplan" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Tarif Rejasi</Label>
                <select 
                  id="gplan"
                  value={gymForm.subscription_plan}
                  onChange={(e) => setGymForm(p => ({ ...p, subscription_plan: e.target.value }))}
                  className="flex h-11 w-full rounded-xl border border-[#2D2D3D] bg-[#22222F] px-3.5 text-sm text-[#F9FAFB] outline-none focus:border-[#6366F1]"
                >
                  <option value="basic">Basic (Starter)</option>
                  <option value="pro">Pro (Ko'p zallar)</option>
                  <option value="enterprise">Enterprise (Katta zanjirlar)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  onClick={() => setIsGymModalOpen(false)}
                  variant="secondary"
                  className="flex-1 bg-[#22222F] text-white border-[#2D2D3D] hover:bg-[#2D2D3D] rounded-xl"
                >
                  Bekor qilish
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-bold"
                >
                  {modalMode === "add" ? "Qo'shish" : "Saqlash"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
