"use client";
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function PhotosPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoType, setPhotoType] = useState("front");
  const { data } = useQuery({ queryKey: ["photos"], queryFn: api.photos.history });
  const upload = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("photo_type", photoType);
      return api.photos.upload(fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["photos"] }),
  });
  const photos = data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📸 Progress Fotolar</h1>
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Foto yuklash</h2>
        <div className="flex gap-3 items-center">
          <select value={photoType} onChange={(e) => setPhotoType(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="front">Old</option>
            <option value="side">Yon</option>
            <option value="back">Orqa</option>
          </select>
          <button onClick={() => fileRef.current?.click()} disabled={upload.isPending}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
            {upload.isPending ? "Yuklanmoqda..." : "📤 Foto tanlash"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); }} />
        </div>
        {upload.isSuccess && <p className="text-green-600 text-sm mt-2">✅ Foto yuklandi, AI tahlil qilmoqda...</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((p: any) => (
          <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
            {p.url && <img src={p.url} alt={p.photo_type} className="w-full h-48 object-cover" />}
            <div className="p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{p.photo_type} · Hafta {p.week_number}</span>
                {p.ai_score && <span className="text-indigo-600 font-medium">⭐ {p.ai_score}/10</span>}
              </div>
              {p.ai_analysis?.encouragement && <p className="text-xs text-gray-500 mt-1">{p.ai_analysis.encouragement}</p>}
            </div>
          </div>
        ))}
      </div>
      {photos.length === 0 && <div className="bg-white rounded-xl p-8 text-center shadow-sm text-gray-400">Hali foto yo'q</div>}
    </div>
  );
}
