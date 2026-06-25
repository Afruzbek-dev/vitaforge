"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Users, UserCheck } from "lucide-react";

export default function FreeUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await getSupabase().from("users").select("id, full_name, email, phone, created_at").is("gym_id", null).eq("role", "member").order("created_at", { ascending: false });
    setUsers(data || []);
  };

  return (
    <div className="max-w-4xl animate-fadeUp space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-lg">Userlar (gymga azo emas)</h1>
        <span className="text-xs text-muted">{users.length} ta</span>
      </div>

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="bg-card border border-border rounded-[var(--radius-sm)] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">{u.full_name?.[0] || "?"}</div>
              <div>
                <p className="text-sm font-medium">{u.full_name || "Noma'lum"}</p>
                <p className="text-[11px] text-muted">{u.email || u.phone} · {new Date(u.created_at).toLocaleDateString("uz")}</p>
              </div>
            </div>
            <UserCheck size={16} className="text-muted" />
          </div>
        ))}
        {users.length === 0 && <p className="text-center text-muted text-sm py-8">Barcha userlar gymga ulangan</p>}
      </div>
    </div>
  );
}
