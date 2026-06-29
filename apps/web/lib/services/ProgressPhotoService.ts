import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export class ProgressPhotoService {
  static async uploadPhoto(formData: FormData) {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");
    
    const file = formData.get("file") as File;
    const photoType = formData.get("photo_type") as string ?? "front";
    
    const now = new Date();
    const week = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000);
    const path = `${user.id}/${now.getFullYear()}-${String(week).padStart(2, "0")}-${photoType}.jpg`;
    
    const sb = getSupabase();
    await sb.storage.from("progress-photos").upload(path, file, { upsert: true });
    
    await sb.from("progress_photos").insert({
      member_id: user.id,
      storage_path: path,
      photo_type: photoType,
      taken_at: now.toISOString().split("T")[0],
      week_number: week
    });
    
    return { photo_id: path, message: "Foto yuklandi" };
  }

  static async getHistory() {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");
    
    const sb = getSupabase();
    const { data: photos } = await sb
      .from("progress_photos")
      .select("*")
      .eq("member_id", user.id)
      .order("taken_at", { ascending: false });
      
    const withUrls = await Promise.all((photos ?? []).map(async (p) => {
      const { data: signed } = await sb.storage.from("progress-photos").createSignedUrl(p.storage_path, 600);
      return { ...p, url: signed?.signedUrl ?? null };
    }));
    
    return withUrls;
  }

  static async compareWeeks(week1: number, week2: number) {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");
    
    const sb = getSupabase();
    const { data } = await sb
      .from("progress_photos")
      .select("*")
      .eq("member_id", user.id)
      .in("week_number", [week1, week2]);
      
    return data ?? [];
  }
}
