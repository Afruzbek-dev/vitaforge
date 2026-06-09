"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";
import { useState } from "react";

export default function ReferralPage() {
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({
    queryKey: ["referral"],
    queryFn: async () => {
      const res = await fetch(`/api/referral?user_id=${user?.id}`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  const ref = data?.data;

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="max-w-lg space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">🎁 Do'stni taklif qil</h1>
        <p className="text-muted text-xs font-mono mt-1">BONUS OLING</p>
      </div>

      <Card className="border-accent-border/30">
        <CardContent className="p-5 text-center space-y-4">
          <div className="text-4xl">🤝</div>
          <p className="text-vtext text-sm">Do'stingiz qo'shilsa ikkalangiz bonus olasiz!</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg rounded-lg p-3"><p className="text-accent font-display font-bold text-xl">+500⚡</p><p className="text-muted text-xs">Sizga</p></div>
            <div className="bg-bg rounded-lg p-3"><p className="text-vgreen font-display font-bold text-xl">+300⚡</p><p className="text-muted text-xs">Do'stga</p></div>
          </div>
        </CardContent>
      </Card>

      {ref && (
        <Card>
          <CardHeader><CardTitle className="text-base">Sizning linkingiz</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-bg rounded-lg p-3 text-center">
              <p className="font-mono text-accent text-lg font-bold">{ref.code}</p>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full text-xs" onClick={() => copy(ref.link)}>
                {copied ? "✅ Nusxalandi!" : "📋 Telegram link nusxalash"}
              </Button>
              <Button variant="outline" className="w-full text-xs" onClick={() => copy(ref.web_link)}>
                📋 Web link nusxalash
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
