"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { api, DEMO_MODE } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { DEMO_USERS } from "@/lib/mock-data";

const C = { bg: "#07070a", card: "#13131c", border: "#1e1e2c", accent: "#e8ff47", text: "#efefeb", muted: "#52526a", surface: "#0e0e14", aDim: "#e8ff4712", aBd: "#e8ff4735" };

const schema = z.object({ email: z.string().email("Email noto'g'ri"), password: z.string().min(1, "Parol kiriting") });
type FormData = z.infer<typeof schema>;

const inputStyle: React.CSSProperties = { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif" };

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, setValue } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.auth.login(data.email, data.password);

      if (DEMO_MODE) {
        localStorage.setItem("access_token", "demo-token");
        const user = data.email.includes("owner") ? DEMO_USERS.gym_owner : DEMO_USERS.member;
        setAuth(user as any, "demo-token");
        router.push(user.role === "member" ? "/dashboard" : "/gym");
      } else {
        const token = res.data?.access_token ?? "token";
        localStorage.setItem("access_token", token);
        const me = await api.users.me();
        const user = me?.data ?? me;
        setAuth(user, token);
        router.push(user.role === "member" ? "/dashboard" : "/gym");
      }
    } catch (e: any) {
      setError("root", { message: e.message ?? "Kirish xatosi" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {DEMO_MODE && (
        <div style={{ background: C.aDim, border: `1px solid ${C.aBd}`, borderRadius: 12, padding: "12px 16px" }}>
          <p style={{ color: C.accent, fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: 2, marginBottom: 10 }}>🎮 DEMO REJIM</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => { setValue("email", "member@demo.uz"); setValue("password", "demo"); }}
              style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "8px", fontSize: 12, cursor: "pointer" }}>
              👤 A'zo sifatida
            </button>
            <button type="button" onClick={() => { setValue("email", "owner@demo.uz"); setValue("password", "demo"); }}
              style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "8px", fontSize: 12, cursor: "pointer" }}>
              🏋️ Gym owner
            </button>
          </div>
        </div>
      )}

      {[
        { name: "email" as const, label: "EMAIL", type: "email" },
        { name: "password" as const, label: "PAROL", type: "password" },
      ].map((f) => (
        <div key={f.name}>
          <label style={{ display: "block", fontSize: 10, color: C.muted, marginBottom: 6, fontFamily: "JetBrains Mono, monospace", letterSpacing: 2 }}>{f.label}</label>
          <input {...register(f.name)} type={f.type} style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = C.aBd)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
          {errors[f.name] && <p style={{ color: "#ff5252", fontSize: 11, marginTop: 4 }}>{errors[f.name]?.message}</p>}
        </div>
      ))}

      {errors.root && <p style={{ color: "#ff5252", fontSize: 12, padding: "8px 12px", background: "rgba(255,82,82,0.08)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: 8 }}>{errors.root.message}</p>}

      <button type="submit" disabled={isSubmitting}
        style={{ width: "100%", background: C.accent, color: C.bg, border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: isSubmitting ? 0.6 : 1, fontFamily: "Syne, sans-serif" }}>
        {isSubmitting ? "Kirish..." : "Kirish →"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13, color: C.muted }}>
        Hisobingiz yo'qmi? <a href="/register" style={{ color: C.accent, textDecoration: "none" }}>Ro'yxatdan o'ting</a>
      </p>
    </form>
  );
}
