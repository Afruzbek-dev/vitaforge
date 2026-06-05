"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Kamida 6 ta belgi"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.auth.login(data.email, data.password);
      const token = res.data?.access_token ?? "session";
      localStorage.setItem("access_token", token);
      const me = await api.users.me();
      const user = me?.data ?? me;
      setAuth(user, token);
      router.push(user.role === "member" ? "/dashboard" : "/gym");
    } catch (e: any) {
      setError("root", { message: e.message ?? "Email yoki parol noto'g'ri" });
    }
  };

  return (
    <Card className="w-full border-accent-border/30">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Kirish</CardTitle>
        <CardDescription>Email va parolingiz bilan kiring</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@example.com" {...register("email")} />
            {errors.email && <p className="text-vred text-xs">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Parol</Label>
            <Input id="password" type="password" placeholder="••••••" {...register("password")} />
            {errors.password && <p className="text-vred text-xs">{errors.password.message}</p>}
          </div>
          {errors.root && (
            <div className="bg-vred/10 border border-vred/20 rounded-lg p-3 text-vred text-sm">
              {errors.root.message}
            </div>
          )}
          <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
            {isSubmitting ? "Kirish..." : "Kirish →"}
          </Button>
          <p className="text-center text-sm text-muted">
            Hisobingiz yo'qmi?{" "}
            <Link href="/register" className="text-accent hover:underline">Ro'yxatdan o'ting</Link>
          </p>
          <p className="text-center text-xs text-muted">
            <Link href="/reset-password" className="hover:text-accent transition">Parolni unutdim</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
