"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { ensureGym } from "@/lib/ensure-gym";

type Step = "upload" | "mapping" | "done";

export default function ImportPage() {
  const sb = getSupabase();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ imported: number; failed: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const FIELDS = ["full_name", "phone", "email", "goal", "gender", "age"];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").map((l) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
      if (lines.length > 1) {
        setHeaders(lines[0]);
        setRows(lines.slice(1, 6)); // Preview 5 rows
        // Auto-map
        const autoMap: Record<string, string> = {};
        const aliases: Record<string, string[]> = { full_name: ["ism", "name", "fio", "familiya"], phone: ["telefon", "phone", "tel", "raqam"], email: ["email", "pochta"], goal: ["maqsad", "goal"], gender: ["jins", "gender"], age: ["yosh", "age"] };
        for (const [field, keys] of Object.entries(aliases)) {
          const match = lines[0].findIndex((h) => keys.some((k) => h.toLowerCase().includes(k)));
          if (match >= 0) autoMap[field] = lines[0][match];
        }
        setMapping(autoMap);
        setStep("mapping");
      }
    };
    reader.readAsText(f);
  };

  const doImport = async () => {
    setLoading(true);
    const user = await getUser();
    const gymId = await ensureGym();
    let imported = 0, failed = 0;

    for (const row of rows) {
      try {
        const data: any = {};
        for (const [field, header] of Object.entries(mapping)) {
          const idx = headers.indexOf(header);
          if (idx >= 0) data[field] = row[idx];
        }
        if (!data.full_name && !data.phone) { failed++; continue; }
        // Check duplicate by phone
        if (data.phone) {
          const { data: existing } = await sb.from("users").select("id").eq("phone", data.phone).single();
          if (existing) { failed++; continue; }
        }
        // Create user via signup
        const email = data.email || `import_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@zenfit.app`;
        const { data: signup } = await sb.auth.signUp({ email, password: `import_${Date.now()}`, options: { data: { full_name: data.full_name, role: "member" } } });
        if (signup?.user?.id) {
          await new Promise((r) => setTimeout(r, 500));
          await sb.from("users").update({ gym_id: gymId, phone: data.phone }).eq("id", signup.user.id);
          imported++;
        } else { failed++; }
      } catch { failed++; }
    }

    // Log import job
    await sb.from("import_jobs").insert({ gym_id: gymId, uploaded_by: user!.id, filename: file?.name, status: "done", total_rows: rows.length, imported_rows: imported, failed_rows: failed, column_mapping: mapping });
    setResult({ imported, failed });
    setStep("done");
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fadeUp">
      <div>
        <h1 className="font-display font-bold text-2xl text-vtext">📥 Import</h1>
        <p className="text-muted text-xs font-mono mt-0.5">ESKI CRM DAN A'ZOLARNI KO'CHIRISH</p>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[{ id: "upload", label: "1. Yuklash" }, { id: "mapping", label: "2. Moslashtirish" }, { id: "done", label: "3. Tayyor" }].map((s) => (
          <div key={s.id} className={`flex-1 h-1.5 rounded-full ${step === s.id ? "bg-accent" : s.id === "done" && step !== "done" ? "bg-border" : "bg-accent/30"}`} />
        ))}
      </div>

      {/* Upload step */}
      {step === "upload" && (
        <Card className="border-accent-border/20">
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-3">📄</p>
            <p className="text-vtext font-medium mb-1">CSV faylni yuklang</p>
            <p className="text-muted text-xs mb-4">Excel yoki CSV fayl. Ustunlar: ism, telefon, email...</p>
            <label className="inline-block">
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
              <span className="bg-accent text-bg font-bold px-6 py-2.5 rounded-xl text-sm cursor-pointer press">📁 Fayl tanlash</span>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Mapping step */}
      {step === "mapping" && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <p className="text-sm font-medium text-vtext">Ustunlarni moslashtiring:</p>
            <div className="space-y-2">
              {FIELDS.map((field) => (
                <div key={field} className="flex items-center gap-3">
                  <span className="text-xs text-muted w-20 font-mono">{field}</span>
                  <span className="text-muted">→</span>
                  <select value={mapping[field] ?? ""} onChange={(e) => setMapping((p) => ({ ...p, [field]: e.target.value }))}
                    className="flex-1 h-8 rounded-md border border-border bg-surface px-2 text-xs text-vtext">
                    <option value="">— Tanlang —</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {/* Preview */}
            <div className="bg-bg rounded-lg p-3 overflow-x-auto">
              <p className="text-[9px] font-mono text-muted mb-2">PREVIEW ({rows.length} qator)</p>
              <table className="text-[10px] text-muted w-full">
                <thead><tr>{headers.map((h) => <th key={h} className="text-left px-1 py-0.5">{h}</th>)}</tr></thead>
                <tbody>{rows.slice(0, 3).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="px-1 py-0.5 text-vtext">{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <Button onClick={doImport} disabled={loading || !mapping.full_name} className="w-full">
              {loading ? "Import qilinmoqda..." : `📥 ${rows.length} ta a'zoni import qilish`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Done step */}
      {step === "done" && result && (
        <Card className="border-vgreen/30">
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-3">✅</p>
            <p className="font-display font-bold text-xl text-vtext mb-2">Import tugallandi!</p>
            <div className="flex justify-center gap-6 mb-4">
              <div><p className="font-bold text-vgreen text-lg">{result.imported}</p><p className="text-xs text-muted">Muvaffaqiyatli</p></div>
              {result.failed > 0 && <div><p className="font-bold text-vred text-lg">{result.failed}</p><p className="text-xs text-muted">Xato</p></div>}
            </div>
            <Button onClick={() => { setStep("upload"); setResult(null); setFile(null); setRows([]); }} variant="outline">Yana import</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
