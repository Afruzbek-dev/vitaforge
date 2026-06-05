"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    const sb = getSupabase();
    const { error: err } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
    if (err) setError(err.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <Card className="w-full border-accent-border/30">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Parolni tiklash</CardTitle>
        <CardDescription>Email manzilingizga link yuboramiz</CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-vgreen text-sm">✅ Email yuborildi! Pochtangizni tekshiring.</p>
            <Link href="/login"><Button variant="outline" className="w-full">← Login ga qaytish</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            {error && <p className="text-vred text-xs">{error}</p>}
            <Button onClick={submit} disabled={loading || !email} className="w-full">
              {loading ? "Yuborilmoqda..." : "Link yuborish →"}
            </Button>
            <p className="text-center text-sm text-muted">
              <Link href="/login" className="text-accent hover:underline">← Login ga qaytish</Link>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
