"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const { data } = useQuery({ queryKey: ["gym", "members"], queryFn: api.gym.members });
  const members = (data?.data ?? []).filter((m: any) => m.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">👥 A'zolar</h1>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..."
          className="border rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Ism</th>
              <th className="px-4 py-3 text-left">Maqsad</th>
              <th className="px-4 py-3 text-left">Onboarding</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((m: any) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{m.full_name}</td>
                <td className="px-4 py-3 text-gray-500">{m.goal ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${m.onboarding_done ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {m.onboarding_done ? "✓ Tayyor" : "Kutilmoqda"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/gym/members/${m.id}`} className="text-indigo-600 hover:underline text-xs">Ko'rish →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && <div className="text-center py-8 text-gray-400">A'zo topilmadi</div>}
      </div>
    </div>
  );
}
