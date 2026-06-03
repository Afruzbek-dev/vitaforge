"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const { data } = useQuery({ queryKey: ["gym", "members"], queryFn: api.gym.members });
  const members = (data?.data ?? []).filter((m: any) => m.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl space-y-6 animate-fadeUp">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-vtext">👥 A'zolar</h1>
          <p className="text-muted text-sm font-mono mt-1">{members.length} TA A'ZO</p>
        </div>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="w-48" />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs font-mono uppercase">
                <th className="text-left p-4">Ism</th>
                <th className="text-left p-4">Telefon</th>
                <th className="text-left p-4">Maqsad</th>
                <th className="text-left p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m: any) => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="p-4 font-medium text-vtext">{m.full_name}</td>
                  <td className="p-4 text-muted">{m.phone ?? "—"}</td>
                  <td className="p-4 text-muted">{m.goal ?? "—"}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${m.onboarding_done ? "bg-vgreen/10 text-vgreen border border-vgreen/20" : "bg-accent/10 text-accent border border-accent-border"}`}>
                      {m.onboarding_done ? "FAOL" : "KUTILMOQDA"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/gym/members/${m.id}`}><Button variant="ghost" size="sm">Ko'rish →</Button></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && <p className="text-muted text-sm text-center py-8">A'zo topilmadi</p>}
        </CardContent>
      </Card>
    </div>
  );
}
