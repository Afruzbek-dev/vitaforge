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

export default function GymSettingsPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const sb = getSupabase();
  const [gym, setGym] = useState<any>(null);
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [gymName, setGymName] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u) return;
      const { data: me } = await sb.from("users").select("gym_id").eq("id", u.id).single();
      if (me?.gym_id) {
        const { data: g } = await sb.from("gyms").select("*").eq("id", me.gym_id).single();
        setGym(g);
        setGymName(g?.name ?? "");
        setCity(g?.city ?? "");
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const u = await getUser();
    await sb.from("users").update({ full_name: fullName }).eq("id", u!.id);
    if (gym) await sb.from("gyms").update({ name: gymName, city }).eq("id", gym.id);
    setSaving(false);
  };

  const logout = async () => { await signOut(); localStorage.removeItem("access_token"); clearAuth(); router.push("/login"); };

  return (
    <div className="max-w-2xl space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">⚙️ Sozlamalar</h1>
        <p className="text-muted text-sm font-mono mt-1">GYM VA HISOB</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">🏋️ Gym ma'lumotlari</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Gym nomi</Label>
            <Input value={gymName} onChange={(e) => setGymName(e.target.value)} placeholder="SmartFit Tashkent" />
          </div>
          <div className="space-y-2">
            <Label>Shahar</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Tashkent" />
          </div>
          {gym && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg rounded-lg p-3"><p className="text-muted text-xs">Plan</p><p className="text-accent font-mono">{gym.plan}</p></div>
              <div className="bg-bg rounded-lg p-3"><p className="text-muted text-xs">Slug</p><p className="text-vtext font-mono">{gym.slug}</p></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">👤 Shaxsiy</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ism</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <Button onClick={save} disabled={saving}>{saving ? "Saqlanmoqda..." : "💾 Saqlash"}</Button>
        </CardContent>
      </Card>

      <Button variant="destructive" onClick={logout} className="w-full">🚪 Chiqish</Button>
    </div>
  );
}
