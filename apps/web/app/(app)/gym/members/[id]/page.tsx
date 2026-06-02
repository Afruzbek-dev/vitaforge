"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useQuery({ queryKey: ["gym", "member", id], queryFn: () => api.gym.member(id) });
  const m = data?.data;
  if (!m) return <div className="animate-pulse text-gray-400">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/gym/members" className="text-gray-400 hover:text-gray-600">← Orqaga</Link>
        <h1 className="text-2xl font-bold">{m.full_name}</h1>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-3">Profil</h2>
          <dl className="space-y-2 text-sm">
            {[["Yosh", m.profile?.age], ["Maqsad", m.profile?.goal], ["Vazn", m.profile?.weight_kg ? `${m.profile.weight_kg} kg` : null], ["Bo'y", m.profile?.height_cm ? `${m.profile.height_cm} cm` : null]]
              .filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} className="flex justify-between">
                  <dt className="text-gray-500">{k}</dt><dd className="font-medium">{v}</dd>
                </div>
              ))}
          </dl>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-3">Faollik</h2>
          <dl className="space-y-2 text-sm">
            {[["Streak", `${m.streak?.current ?? 0} kun`], ["Jami ball", m.streak?.total_points ?? 0]].map(([k, v]) => (
              <div key={k as string} className="flex justify-between">
                <dt className="text-gray-500">{k}</dt><dd className="font-medium text-indigo-600">{v}</dd>
              </div>
            ))}
          </dl>
          {m.streak?.badges?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {m.streak.badges.map((b: string) => <span key={b} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">{b}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
