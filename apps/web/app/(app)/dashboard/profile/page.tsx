"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { getLevel, BADGES, UNIT } from "@/lib/gamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { 
  User, Shield, Bell, Globe, Moon, Sun, 
  HelpCircle, LogOut, Pencil, Save, Phone, 
  Mail, Calendar, Activity, Flame, ChevronRight, Check
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const sb = getSupabase();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [attendanceCount, setAttendanceCount] = useState(0);

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  // Settings state
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("uz");
  const [notifications, setNotifications] = useState({ payments: true, reminders: true, news: false });

  // Logout modal
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u) return;

      const [{ data: p }, { data: s }, { data: m }, { count: ac }] = await Promise.all([
        sb.from("users").select("*").eq("id", u.id).single(),
        sb.from("member_streaks").select("*").eq("member_id", u.id).single(),
        sb.from("memberships").select("*").eq("member_id", u.id).order("created_at", { ascending: false }).limit(1).single(),
        sb.from("attendance").select("*", { count: "exact", head: true }).eq("member_id", u.id)
      ]);

      setProfile(p);
      setStreak(s);
      setMembership(m);
      setAttendanceCount(ac ?? 0);
      setEditForm({ name: p?.full_name ?? "", phone: p?.phone ?? "", email: p?.email ?? "" });

      // Settings
      if (p?.settings) {
        if (p.settings.theme) setTheme(p.settings.theme);
        if (p.settings.language) setLang(p.settings.language);
        if (p.settings.notifications) setNotifications(p.settings.notifications);
      }

      setLoading(false);
    })();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    const u = await getUser();
    const { error } = await sb.from("users").update({
      full_name: editForm.name,
      phone: editForm.phone,
      email: editForm.email
    }).eq("id", u!.id);

    if (error) {
      toast("Xatolik yuz berdi", "error");
    } else {
      toast("Profil saqlandi", "success");
      setProfile({ ...profile, full_name: editForm.name, phone: editForm.phone, email: editForm.email });
      setEditMode(false);
    }
    setSaving(false);
  };

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('zenfit_theme', newTheme);
    saveSettings({ theme: newTheme });
  };

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('zenfit_lang', newLang);
    saveSettings({ language: newLang });
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    const newNotifs = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifs);
    saveSettings({ notifications: newNotifs });
  };

  const saveSettings = async (updates: any) => {
    const u = await getUser();
    const currentSettings = profile?.settings ?? {};
    await sb.from("users").update({
      settings: { ...currentSettings, ...updates }
    }).eq("id", u!.id);
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.removeItem("zenfit_user");
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-muted">Yuklanmoqda...</div>;

  const daysActive = profile?.created_at ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000) : 0;
  const level = getLevel(streak?.total_points ?? 0);
  const earnedBadges = (streak?.badges ?? []) as string[];
  const userBadges = BADGES.filter((b) => earnedBadges.includes(b.id));

  return (
    <div className="max-w-md md:max-w-2xl mx-auto space-y-6 animate-fadeUp pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 bg-surface p-5 rounded-2xl border border-border shadow-sm">
        <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-3xl font-display font-bold shadow-md shrink-0">
          {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-xl text-vtext truncate">{profile?.full_name ?? "Foydalanuvchi"}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={
              user?.role === "member" ? "default" : 
              user?.role === "trainer" ? "success" : 
              user?.role === "gym_owner" ? "warning" : "danger"
            } className="capitalize">
              {user?.role.replace("_", " ")}
            </Badge>
            {profile?.gym_id && <span className="text-sm text-muted truncate">{profile?.gym_id}</span>}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border shadow-sm">
          <CardContent className="p-3 text-center flex flex-col items-center justify-center">
            <Calendar size={18} className="text-muted mb-1" />
            <p className="font-display font-bold text-lg text-vtext">{daysActive}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider">Kun</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-3 text-center flex flex-col items-center justify-center">
            <Activity size={18} className="text-blue-500 mb-1" />
            <p className="font-display font-bold text-lg text-vtext">{attendanceCount}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider">Mashq</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm bg-gradient-to-br from-surface to-orange-500/5">
          <CardContent className="p-3 text-center flex flex-col items-center justify-center">
            <Flame size={18} className="text-orange-500 mb-1" />
            <p className="font-display font-bold text-lg text-orange-500">{streak?.current_streak ?? 0}</p>
            <p className="text-[10px] text-orange-500/80 uppercase tracking-wider">Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Level & Badges (Preserved from old page) */}
      <Card className="border-accent-border/30 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <Shield size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted font-medium">Joriy daraja</p>
              <h3 className="font-display font-bold text-xl text-vtext">{level.name}</h3>
            </div>
            <div className="text-right">
              <p className="font-mono text-accent font-bold text-lg">{streak?.total_points ?? 0} <span className="text-xs">XP</span></p>
            </div>
          </div>
          {userBadges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
              {userBadges.map((b) => (
                <div key={b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface2 border border-border text-xs" title={b.description}>
                  <span className="text-base">{b.emoji}</span>
                  <span className="font-medium text-vtext">{b.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2"><User size={18} className="text-accent" /> Shaxsiy ma'lumotlar</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setEditMode(!editMode)} className="h-8 w-8 text-muted">
            <Pencil size={16} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editMode ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User size={16} className="text-muted" />
                <span className="text-vtext">{profile?.full_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-muted" />
                <span className="text-vtext">{profile?.phone || "Kiritilmagan"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-muted" />
                <span className="text-vtext">{profile?.email || "Kiritilmagan"}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <Label>Ism familiya</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Telefon raqam</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="rounded-xl" />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full rounded-xl mt-2">
                <Save size={16} className="mr-2" /> Saqlash
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Membership (if applicable) */}
      {membership && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><Activity size={18} className="text-accent" /> Obuna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-muted text-sm">Tur</span>
              <Badge variant="info" className="capitalize">{membership.membership_type}</Badge>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-muted text-sm">Boshlanish</span>
              <span className="text-sm text-vtext font-medium">{membership.start_date}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted text-sm">Tugash</span>
              <span className="text-sm text-vtext font-medium">{membership.end_date}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Theme */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Moon size={16} className="text-muted" /> Mavzu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex p-1 bg-surface2 rounded-xl border border-border">
              <button 
                onClick={() => handleThemeChange("light")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${theme === "light" ? "bg-white text-black shadow-sm" : "text-muted hover:text-vtext"}`}
              >
                <Sun size={16} /> Yorug'
              </button>
              <button 
                onClick={() => handleThemeChange("dark")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${theme === "dark" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-vtext"}`}
              >
                <Moon size={16} /> Qorong'u
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Globe size={16} className="text-muted" /> Til</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex p-1 bg-surface2 rounded-xl border border-border">
              {["uz", "ru", "en"].map((l) => (
                <button 
                  key={l}
                  onClick={() => handleLangChange(l)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition uppercase ${lang === l ? "bg-accent text-white shadow-sm" : "text-muted hover:text-vtext"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-sm sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Bell size={16} className="text-muted" /> Bildirishnomalar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "payments", label: "To'lov eslatmalari" },
              { id: "reminders", label: "Mashq eslatmalari" },
              { id: "news", label: "Yangiliklar va aksiyalar" }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 last:pb-0">
                <span className="text-sm text-vtext">{item.label}</span>
                <button 
                  onClick={() => toggleNotif(item.id as keyof typeof notifications)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${notifications[item.id as keyof typeof notifications] ? "bg-accent" : "bg-surface2 border border-border"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications[item.id as keyof typeof notifications] ? "translate-x-5.5 left-0.5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Support & Logout */}
      <div className="space-y-3 pt-4 border-t border-border">
        <Button variant="outline" className="w-full justify-start rounded-xl h-12 bg-surface">
          <HelpCircle size={18} className="mr-3 text-muted" />
          Yordam va qoidalar
          <ChevronRight size={16} className="ml-auto text-muted" />
        </Button>
        
        <Button variant="outline" className="w-full justify-start rounded-xl h-12 bg-surface border-vred/30 text-vred hover:bg-vred/10 hover:text-vred" onClick={() => setLogoutOpen(true)}>
          <LogOut size={18} className="mr-3" />
          Tizimdan chiqish
        </Button>
      </div>

      <ConfirmDialog 
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Tizimdan chiqish"
        description="Haqiqatan ham profilingizdan chiqmoqchimisiz?"
        confirmText="Chiqish"
        variant="danger"
      />
    </div>
  );
}
