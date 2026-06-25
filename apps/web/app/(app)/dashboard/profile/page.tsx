"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { getLevel, BADGES, UNIT } from "@/lib/gamification";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const sb = getSupabase();
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u) return;
      const [{ data: p }, { data: s }, { data: m }, { data: pay }] = await Promise.all([
        sb.from("member_profiles").select("*").eq("user_id", u.id).single(),
        sb.from("member_streaks").select("*").eq("member_id", u.id).single(),
        sb.from("memberships").select("*").eq("member_id", u.id).order("created_at", { ascending: false }).limit(1).single(),
        sb.from("payments").select("*").eq("member_id", u.id).order("created_at", { ascending: false }).limit(5),
      ]);
      setProfile(p);
      setStreak(s);
      setMembership(m);
      setPayments(pay ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-muted animate-pulse p-4">Yuklanmoqda...</div>;

  const level = getLevel(streak?.total_points ?? 0);
  const earnedBadges = (streak?.badges ?? []) as string[];
  const userBadges = BADGES.filter((b) => earnedBadges.includes(b.id));
  const isFreeUser = !user?.gym_id;

  return (
    <div className="max-w-2xl space-y-6 animate-fadeUp pb-8">
      {/* Avatar + Name */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center text-2xl font-display font-bold text-accent">
          {user?.full_name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-vtext">{user?.full_name ?? "Foydalanuvchi"}</h1>
          <p className="text-muted text-sm font-mono">{isFreeUser ? "Free foydalanuvchi" : "Gym a'zosi"}</p>
          {profile?.bio && <p className="text-muted text-xs mt-1">{profile.bio}</p>}
        </div>
      </div>

      {/* Level card */}
      <Card className="border-accent-border/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${level.color}20`, border: `1px solid ${level.color}40` }}>
              {level.emoji}
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-lg" style={{ color: level.color }}>{level.name}</p>
              <p className="text-muted text-xs font-mono">{UNIT.emoji} {streak?.total_points ?? 0} Kuch</p>
              {level.next && (
                <div className="mt-2">
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${level.progress}%`, background: level.color }} />
                  </div>
                  <p className="text-[10px] text-muted mt-1">{level.pointsToNext} kuch kerak → {level.next.name}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-3 text-center">
            <div className="flex-1 bg-bg rounded-lg p-3">
              <p className="font-display font-bold text-xl text-accent">🔥 {streak?.current_streak ?? 0}</p>
              <p className="text-[10px] text-muted">Streak (kun)</p>
            </div>
            <div className="flex-1 bg-bg rounded-lg p-3">
              <p className="font-display font-bold text-xl text-vgreen">{streak?.longest_streak ?? 0}</p>
              <p className="text-[10px] text-muted">Eng uzun</p>
            </div>
            <div className="flex-1 bg-bg rounded-lg p-3">
              <p className="font-display font-bold text-xl text-vblue">{streak?.total_workouts ?? 0}</p>
              <p className="text-[10px] text-muted">Mashqlar</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical stats */}
      {profile && (
        <Card>
          <CardHeader><CardTitle className="text-base">📏 Jismoniy ko'rsatkichlar</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Bo'y", v: profile.height_cm ? `${profile.height_cm} cm` : "—", icon: "📐" },
                { l: "Vazn", v: profile.weight_kg ? `${profile.weight_kg} kg` : "—", icon: "⚖️" },
                { l: "Maqsad", v: profile.goal === "weight_loss" ? "Ozish" : profile.goal === "muscle_gain" ? "Mushak" : profile.goal ?? "—", icon: "🎯" },
                { l: "Yosh", v: profile.age ?? "—", icon: "🎂" },
              ].map((item) => (
                <div key={item.l} className="bg-bg rounded-lg p-3 flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-muted text-[10px]">{item.l}</p>
                    <p className="text-vtext font-medium text-sm">{item.v}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      <Card>
        <CardHeader><CardTitle className="text-base">🏅 Badge'lar ({userBadges.length}/{BADGES.length})</CardTitle></CardHeader>
        <CardContent>
          {userBadges.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {userBadges.map((b) => (
                <div key={b.id} className="bg-bg rounded-lg p-3 text-center">
                  <span className="text-2xl">{b.emoji}</span>
                  <p className="text-[10px] text-vtext mt-1 font-medium">{b.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm text-center py-4">Hali badge yo'q. Mashq qiling va badge'lar yig'ing!</p>
          )}
          {/* Locked badges preview */}
          {userBadges.length < BADGES.length && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[10px] text-muted font-mono mb-2">QOLGAN BADGE'LAR</p>
              <div className="flex flex-wrap gap-2">
                {BADGES.filter((b) => !earnedBadges.includes(b.id)).map((b) => (
                  <div key={b.id} className="opacity-40 bg-bg rounded-lg px-2 py-1 text-[10px] text-muted">
                    {b.emoji} {b.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gym membership */}
      <Card>
        <CardHeader><CardTitle className="text-base">🏋️ Gym a'zolik</CardTitle></CardHeader>
        <CardContent>
          {isFreeUser ? (
            <div className="text-center py-4">
              <p className="text-muted text-sm mb-2">Gymga ulanmagan — Free rejim</p>
              <p className="text-xs text-muted">Mashqlarni track qiling, kaloriya hisoblang, AI Coach'dan foydalaning.</p>
              <p className="text-xs text-accent mt-2">Gym-specific: trener, guruh chat — gym a'zolari uchun</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Holat</span>
                <span className={membership?.status === "active" ? "text-vgreen" : "text-vred"}>
                  {membership?.status === "active" ? "✅ Faol" : "⚠️ " + (membership?.status ?? "Noma'lum")}
                </span>
              </div>
              {membership?.expires_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tugash sanasi</span>
                  <span className="text-vtext">{new Date(membership.expires_at).toLocaleDateString("uz")}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment history */}
      {payments.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">💳 To'lov tarixi</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-bg rounded-lg p-3 text-sm">
                  <div>
                    <p className="text-vtext">{p.amount?.toLocaleString()} so'm</p>
                    <p className="text-[10px] text-muted">{new Date(p.created_at).toLocaleDateString("uz")}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "confirmed" ? "bg-vgreen/10 text-vgreen" : "bg-accent/10 text-accent"}`}>
                    {p.status === "confirmed" ? "✓" : "⏳"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
