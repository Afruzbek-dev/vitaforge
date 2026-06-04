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
import { getLevel, UNIT } from "@/lib/gamification";

export default function SettingsPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const sb = getSupabase();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u) return;
      const { data: p } = await sb.from("member_profiles").select("*").eq("user_id", u.id).single();
      const { data: s } = await sb.from("member_streaks").select("*").eq("member_id", u.id).single();
      const { data: usr } = await sb.from("users").select("phone").eq("id", u.id).single();
      setProfile(p);
      setStreak(s);
      if (usr?.phone) setPhone(usr.phone);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const u = await getUser();
    await sb.from("users").update({ full_name: fullName, phone }).eq("id", u!.id);
    setSaving(false);
  };

  const logout = async () => {
    await signOut();
    localStorage.removeItem("access_token");
    clearAuth();
    router.push("/login");
  };

  const level = getLevel(streak?.total_points ?? 0);

  return (
    <div className="max-w-2xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">⚙️ Sozlamalar</h1>
        <p className="text-muted text-sm font-mono mt-1">HISOB MA'LUMOTLARI</p>
      </div>

      {/* Level info */}
      <Card className="border-accent-border/30">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${level.color}20`, border: `1px solid ${level.color}40` }}>
            {level.emoji}
          </div>
          <div>
            <p className="font-display font-bold text-lg" style={{ color: level.color }}>{level.name}</p>
            <p className="text-muted text-xs font-mono">{UNIT.emoji} {streak?.total_points ?? 0} Kuch · 🔥 {streak?.current_streak ?? 0} kun streak</p>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle className="text-base">👤 Shaxsiy ma'lumotlar</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ism</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998901234567" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-bg rounded-lg p-3">
              <p className="text-muted text-xs">Email</p>
              <p className="text-vtext">{user?.id?.slice(0, 8) ?? "—"}@...</p>
            </div>
            <div className="bg-bg rounded-lg p-3">
              <p className="text-muted text-xs">Rol</p>
              <p className="text-accent">{user?.role === "member" ? "A'zo" : "Gym Owner"}</p>
            </div>
          </div>
          <Button onClick={save} disabled={saving}>{saving ? "Saqlanmoqda..." : "💾 Saqlash"}</Button>
        </CardContent>
      </Card>

      {/* Physical info */}
      {profile && (
        <Card>
          <CardHeader><CardTitle className="text-base">📏 Jismoniy ko'rsatkichlar</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Yosh", v: profile.age },
                { l: "Bo'y", v: profile.height_cm ? `${profile.height_cm} cm` : "—" },
                { l: "Vazn", v: profile.weight_kg ? `${profile.weight_kg} kg` : "—" },
                { l: "Maqsad", v: profile.goal ?? "—" },
              ].map((item) => (
                <div key={item.l} className="bg-bg rounded-lg p-3">
                  <p className="text-muted text-xs">{item.l}</p>
                  <p className="text-vtext font-medium">{item.v}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logout */}
      <Button variant="destructive" onClick={logout} className="w-full">🚪 Chiqish</Button>
    </div>
  );
}
