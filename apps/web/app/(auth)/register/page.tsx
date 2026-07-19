"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/lib/store/auth";
import { AuthService } from "@/lib/services/AuthService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import dynamic from "next/dynamic";

const TelegramLoginButton = dynamic(() => import("@/components/telegram-login"), { ssr: false });

function TelegramLoginBtn() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  return <TelegramLoginButton botName="zenfituzbot" onAuth={async (data) => {
    const res = await fetch("/api/auth/telegram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await res.json();
    if (result.success && result.access_token) { localStorage.setItem("access_token", result.access_token); setAuth(result.user, result.access_token); router.push("/onboarding"); }
  }} />;
}

const schema = z.object({
  full_name: z.string().min(2, "Ism kamida 2 belgi"),
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Kamida 6 ta belgi"),
  role: z.enum(["member", "gym_owner", "trainer"]),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "member" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await AuthService.register(data);
      router.push("/login?registered=1");
    } catch (e: any) {
      setError("root", { message: e.message ?? "Ro'yxatdan o'tishda xatolik" });
    }
  };

  return (
    <Card className="w-full border-accent-border/30">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Ro'yxatdan o'tish</CardTitle>
        <CardDescription>ZenFit AI ga qo'shiling</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Ism Familiya</Label>
            <Input placeholder="Jasur Toshmatov" {...register("full_name")} />
            {errors.full_name && <p className="text-vred text-xs">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="email@example.com" {...register("email")} />
            {errors.email && <p className="text-vred text-xs">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Parol</Label>
            <Input type="password" placeholder="••••••" {...register("password")} />
            {errors.password && <p className="text-vred text-xs">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <select {...register("role")} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-vtext focus:outline-none focus:border-accent-border">
              <option value="member">Gym a'zosi</option>
              <option value="trainer">Trener</option>
              <option value="gym_owner">Gym egasi</option>
            </select>
          </div>
          {errors.root && (
            <div className="bg-vred/10 border border-vred/20 rounded-lg p-3 text-vred text-sm">
              {errors.root.message}
            </div>
          )}
          <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
            {isSubmitting ? "Yaratilmoqda..." : "Ro'yxatdan o'tish →"}
          </Button>
          <p className="text-center text-sm text-muted">
            Hisobingiz bormi?{" "}
            <Link href="/login" className="text-accent hover:underline">Kirish</Link>
          </p>
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted">yoki</span></div>
          </div>
          <TelegramLoginBtn />
        </form>
      </CardContent>
    </Card>
  );
}
