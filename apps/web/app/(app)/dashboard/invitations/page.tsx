"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export default function InvitationsPage() {
  const qc = useQueryClient();
  const sb = getSupabase();

  const { data: invites } = useQuery({
    queryKey: ["my-invitations"],
    queryFn: async () => {
      const user = await getUser();
      // email field da user_id saqlangan
      const { data } = await sb.from("invitations").select("*, gyms(name)").eq("email", user!.id).eq("status", "pending");
      return data ?? [];
    },
  });

  const respond = useMutation({
    mutationFn: async ({ id, accept, gymId }: { id: string; accept: boolean; gymId: string }) => {
      const user = await getUser();
      if (accept) {
        // Gymga qo'shilish
        await sb.from("users").update({ gym_id: gymId }).eq("id", user!.id);
        await sb.from("invitations").update({ status: "accepted" }).eq("id", id);
        // localStorage yangilash
        const stored = localStorage.getItem("zenfit_user");
        if (stored) { const u = JSON.parse(stored); u.gym_id = gymId; localStorage.setItem("zenfit_user", JSON.stringify(u)); }
      } else {
        await sb.from("invitations").update({ status: "rejected" }).eq("id", id);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-invitations"] }),
  });

  return (
    <div className="max-w-lg space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">📩 Takliflar</h1>
        <p className="text-muted text-xs font-mono mt-1">GYM GA QO'SHILISH TAKLIFLARI</p>
      </div>

      {(!invites || invites.length === 0) ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-muted text-sm">Hozircha taklif yo'q</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invites.map((inv: any) => (
            <Card key={inv.id} className="border-accent-border/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg">🏋️</div>
                  <div>
                    <p className="text-sm font-medium text-vtext">{(inv.gyms as any)?.name ?? "Gym"}</p>
                    <p className="text-xs text-muted">Sizni gymga taklif qilmoqda</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => respond.mutate({ id: inv.id, accept: true, gymId: inv.gym_id })} disabled={respond.isPending}>
                    ✅ Qabul qilish
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => respond.mutate({ id: inv.id, accept: false, gymId: inv.gym_id })} disabled={respond.isPending}>
                    ❌ Rad etish
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
