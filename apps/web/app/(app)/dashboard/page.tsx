"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import Link from "next/link";

const C = { card: "#13131c", border: "#1e1e2c", accent: "#e8ff47", text: "#efefeb", muted: "#52526a", red: "#ff5252", green: "#4dffb4", aDim: "#e8ff4712", aBd: "#e8ff4735" };

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: api.users.stats });
  const { data: plan } = useQuery({ queryKey: ["plan"], queryFn: api.plans.current, retry: false });
  const { data: rank } = useQuery({ queryKey: ["rank"], queryFn: api.leaderboard.myRank });
  const s = stats?.data;
  const p = plan?.data ?? plan;

  return (
    <div style={{ maxWidth: 800, animation: "fadeUp .4s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: C.text, marginBottom: 4 }}>
          Salom, {user?.full_name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: C.muted, fontSize: 13, fontFamily: "JetBrains Mono, monospace", letterSpacing: 1 }}>
          HAFTA 23 · IYUN 2025
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "STREAK", value: `${s?.current_streak ?? 0}`, unit: "kun 🔥", color: C.accent },
          { label: "BALL", value: s?.total_points ?? 0, unit: "⭐", color: C.accent },
          { label: "REYTING", value: rank?.data?.rank ? `#${rank.data.rank}` : "—", unit: "🏆", color: C.green },
          { label: "TASHRIF", value: s?.total_attendance ?? 0, unit: "📅", color: C.muted },
        ].map((c) => (
          <div key={c.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 14px", borderLeft: `3px solid ${c.color}` }}>
            <div style={{ color: C.muted, fontSize: 9, fontFamily: "JetBrains Mono, monospace", letterSpacing: 2, marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, color: c.color }}>{c.value}</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{c.unit}</div>
          </div>
        ))}
      </div>

      {/* Plan preview */}
      {p && (
        <div style={{ background: C.card, border: `1px solid ${C.aBd}`, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ color: C.accent, fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: 2, marginBottom: 4 }}>BU HAFTANING PLANI</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16 }}>AI tomonidan yaratilgan</div>
            </div>
            <Link href="/dashboard/plan" style={{ background: C.aDim, border: `1px solid ${C.aBd}`, color: C.accent, padding: "6px 14px", borderRadius: 8, fontSize: 12, textDecoration: "none" }}>
              Batafsil →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              { l: "Kaloriya", v: p.nutrition?.daily_calories, u: "kkal" },
              { l: "Protein", v: p.nutrition?.protein_g, u: "g" },
              { l: "Karbohidrat", v: p.nutrition?.carbs_g, u: "g" },
              { l: "Mashq", v: p.workouts?.length, u: "kun" },
            ].map((n) => (
              <div key={n.l} style={{ background: "#07070a", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: C.accent }}>{n.v}</div>
                <div style={{ color: C.muted, fontSize: 10 }}>{n.l} ({n.u})</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {s?.badges?.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ color: C.muted, fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: 2, marginBottom: 10 }}>YUTUQLAR</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {s.badges.map((b: string) => (
              <span key={b} style={{ background: C.aDim, border: `1px solid ${C.aBd}`, color: C.accent, fontSize: 11, padding: "4px 12px", borderRadius: 20, fontFamily: "JetBrains Mono, monospace" }}>{b}</span>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {[
          { href: "/dashboard/food", label: "Ovqat qo'shish", icon: "🥗", desc: "AI parse + kuzatuv" },
          { href: "/dashboard/photos", label: "Foto yuklash", icon: "📸", desc: "AI progress tahlili" },
          { href: "/dashboard/chat", label: "AI bilan gaplash", icon: "🤖", desc: "24/7 shaxsiy trener" },
          { href: "/dashboard/plan", label: "Planini ko'rish", icon: "📋", desc: "Haftalik dastur" },
        ].map((l) => (
          <Link key={l.href} href={l.href} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px", textDecoration: "none", display: "block", transition: "border-color .2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.aBd)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{l.icon}</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 3 }}>{l.label}</div>
            <div style={{ color: C.muted, fontSize: 11 }}>{l.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
