"use client";
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PhotosPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoType, setPhotoType] = useState("front");
  const { data } = useQuery({ queryKey: ["photos"], queryFn: api.photos.history });
  const upload = useMutation({
    mutationFn: (file: File) => {
      if (file.size > 1 * 1024 * 1024) throw new Error("Rasm hajmi 1MB dan oshmasin");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("photo_type", photoType);
      return api.photos.upload(fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["photos"] }),
  });
  const photos = data?.data ?? [];

  return (
    <div className="max-w-lg md:max-w-4xl mx-auto space-y-6 animate-fadeUp pb-20 md:pb-4">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">📸 Progress Fotolar</h1>
        <p className="text-muted text-sm font-mono mt-1">AI TAHLILI BILAN</p>
      </div>

      {/* Upload */}
      <Card>
        <CardHeader><CardTitle className="text-base">Foto yuklash</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 items-center">
            <select value={photoType} onChange={(e) => setPhotoType(e.target.value)}
              className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-vtext focus:border-accent-border">
              <option value="front">Old</option>
              <option value="side">Yon</option>
              <option value="back">Orqa</option>
            </select>
            <Button onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
              {upload.isPending ? "Yuklanmoqda..." : "📤 Foto tanlash"}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); }} />
          </div>
          {upload.isSuccess && (
            <p className="text-vgreen text-sm mt-3">✅ Foto yuklandi!</p>
          )}
          {upload.isError && (
            <p className="text-vred text-sm mt-3">❌ {(upload.error as any)?.message ?? "Xatolik"}</p>
          )}
        </CardContent>
      </Card>

      {/* Photo grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((p: any) => (
            <Card key={p.id} className="overflow-hidden">
              {p.url && <img src={p.url} alt={p.photo_type} className="w-full h-48 object-cover" />}
              <CardContent className="p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{p.photo_type} · Hafta {p.week_number}</span>
                  {p.ai_score && <span className="text-accent font-mono font-bold">⭐ {p.ai_score}/10</span>}
                </div>
                {p.ai_analysis?.encouragement && (
                  <p className="text-xs text-muted mt-1">{p.ai_analysis.encouragement}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-3">📸</p>
            <p className="text-muted text-sm">Hali foto yo'q. Birinchi fotoni yuklang!</p>
            <p className="text-accent text-xs font-mono mt-2">+20 ⚡ Kuch</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
