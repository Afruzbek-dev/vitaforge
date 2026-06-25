"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/auth";
import { getSupabase } from "@/lib/supabase";
import { getUser, signOut } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { theme, toggle } = useTheme();
  const sb = getSupabase();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState("uz");
  const [notifications, setNotifications] = useState(true);

  // Password change
  const [showPwd, setShowPwd] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");

  // Delete account
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u) return;
      const { data: usr } = await sb.from("users").select("phone").eq("id", u.id).single();
      const { data: p } = await sb.from("member_profiles").select("bio").eq("user_id", u.id).single();
      if (usr?.phone) setPhone(usr.phone);
      if (p?.bio) setBio(p.bio);
      const savedLang = localStorage.getItem("vf-lang");
      if (savedLang) setLang(savedLang);
      const savedNotif = localStorage.getItem("vf-notifications");
      if (savedNotif === "false") setNotifications(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const u = await getUser();
    if (!u) return;
    await sb.from("users").update({ full_name: fullName, phone }).eq("id", u.id);
    await sb.from("member_profiles").update({ bio }).eq("user_id", u.id);
    setSaving(false);
  };

  const changePassword = async () => {
    if (newPwd.length < 6) { setPwdMsg("Kamida 6 belgi bo'lishi kerak"); return; }
    const { error } = await sb.auth.updateUser({ password: newPwd });
    setPwdMsg(error ? "Xatolik: " + error.message : "✅ Parol yangilandi");
    if (!error) setNewPwd("");
  };

  const toggleNotifications = () => {
    const v = !notifications;
    setNotifications(v);
    localStorage.setItem("vf-notifications", String(v));
  };

  const changeLang = (l: string) => {
    setLang(l);
    localStorage.setItem("vf-lang", l);
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== "O'CHIRISH") return;
    const u = await getUser();
    if (!u) return;
    await sb.from("users").update({ is_deleted: true }).eq("id", u.id);
    await signOut();
    clearAuth();
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const logout = async () => {
    await signOut();
    localStorage.removeItem("access_token");
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fadeUp pb-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">⚙️ Sozlamalar</h1>
        <p className="text-muted text-sm font-mono mt-1">PROFIL VA HISOB</p>
      </div>

      {/* Profile edit */}
      <Card>
        <CardHeader><CardTitle className="text-base">👤 Profil tahrirlash</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ism</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="min-h-[44px]" />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998901234567" className="min-h-[44px]" />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Qisqacha o'zingiz haqida..." className="min-h-[44px]" />
          </div>
          <Button onClick={save} disabled={saving} className="w-full min-h-[44px]">{saving ? "Saqlanmoqda..." : "💾 Saqlash"}</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle className="text-base">🔔 Bildirishnomalar</CardTitle></CardHeader>
        <CardContent>
          <button onClick={toggleNotifications} className="w-full flex items-center justify-between p-3 bg-bg rounded-lg min-h-[44px] press">
            <span className="text-sm text-vtext">Push bildirishnomalar</span>
            <div className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? "bg-accent" : "bg-border"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications ? "right-1" : "left-1"}`} />
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader><CardTitle className="text-base">🌐 Til</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "uz", label: "O'zbek", flag: "🇺🇿" },
              { id: "ru", label: "Русский", flag: "🇷🇺" },
              { id: "en", label: "English", flag: "🇺🇸" },
            ].map((l) => (
              <button key={l.id} onClick={() => changeLang(l.id)}
                className={`p-3 rounded-lg border text-center text-sm transition-colors min-h-[44px] press ${lang === l.id ? "border-accent bg-accent/5 text-accent" : "border-border text-muted"}`}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader><CardTitle className="text-base">🎨 Tema</CardTitle></CardHeader>
        <CardContent>
          <button onClick={toggle} className="w-full flex items-center justify-between p-3 bg-bg rounded-lg min-h-[44px] press">
            <span className="text-sm text-vtext">{theme === "dark" ? "🌙 Qorong'i" : "☀️ Yorug'"}</span>
            <div className={`w-12 h-6 rounded-full transition-colors relative ${theme === "light" ? "bg-accent" : "bg-border"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${theme === "light" ? "right-1" : "left-1"}`} />
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader><CardTitle className="text-base">🔒 Parol o'zgartirish</CardTitle></CardHeader>
        <CardContent>
          {!showPwd ? (
            <Button variant="outline" onClick={() => setShowPwd(true)} className="w-full min-h-[44px]">Parolni o'zgartirish</Button>
          ) : (
            <div className="space-y-3">
              <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Yangi parol (min 6 belgi)" className="min-h-[44px]" />
              {pwdMsg && <p className={`text-xs ${pwdMsg.startsWith("✅") ? "text-vgreen" : "text-vred"}`}>{pwdMsg}</p>}
              <div className="flex gap-2">
                <Button onClick={changePassword} className="flex-1 min-h-[44px]">Saqlash</Button>
                <Button variant="secondary" onClick={() => { setShowPwd(false); setPwdMsg(""); }} className="min-h-[44px]">Bekor</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="outline" onClick={logout} className="w-full min-h-[44px]">🚪 Chiqish</Button>

      {/* Delete account */}
      <Card className="border-vred/20">
        <CardHeader><CardTitle className="text-base text-vred">⚠️ Akkauntni o'chirish</CardTitle></CardHeader>
        <CardContent>
          {!showDelete ? (
            <Button variant="destructive" onClick={() => setShowDelete(true)} className="w-full min-h-[44px]">Akkauntni o'chirish</Button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted">Barcha ma'lumotlaringiz o'chiriladi. Tasdiqlash uchun "O'CHIRISH" yozing:</p>
              <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="O'CHIRISH" className="min-h-[44px]" />
              <div className="flex gap-2">
                <Button variant="destructive" onClick={deleteAccount} disabled={deleteConfirm !== "O'CHIRISH"} className="flex-1 min-h-[44px]">Tasdiqlash</Button>
                <Button variant="secondary" onClick={() => setShowDelete(false)} className="min-h-[44px]">Bekor</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
