import {
  AlertTriangle, Check, Loader2, Upload,
} from "lucide-react";
import { useState } from "react";

/**
 * AdminPage — thin wrapper used by every admin sub-page.
 * Provides the page title bar + scrollable content area only.
 * The sidebar lives exclusively in src/routes/admin/route.tsx so
 * there is NO duplicate sidebar rendered here.
 */
export function AdminPage({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-full">
      {/* ── Top bar ── */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-10">
        <h1 className="font-display text-2xl text-brand-brown">{title}</h1>
        {action && <div className="flex items-center gap-3">{action}</div>}
      </div>

      {/* ── Page content ── */}
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   CLOUDINARY UPLOAD WIDGET
   Env vars: VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET
   ───────────────────────────────────────────────────────── */
const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "drkavyas_products";

export function CloudinaryUpload({
  onUrl,
  label = "Upload Image",
  hint,
}: {
  onUrl: (url: string) => void;
  label?: string;
  hint?: string;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [preview, setPreview] = useState<string>("");

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!CLOUD_NAME) {
      alert("Set VITE_CLOUDINARY_CLOUD_NAME in Cloudflare Secrets");
      return;
    }

    setStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "drkavyas");
      formData.append("quality", "auto");
      formData.append("fetch_format", "auto");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const url = data.secure_url.replace(
        "/upload/",
        "/upload/q_auto,f_auto,w_800/"
      );
      setPreview(url);
      setStatus("done");
      onUrl(url);
    } catch (e: any) {
      console.error("Cloudinary upload failed", e);
      setStatus("error");
    }
  }

  return (
    <div className="space-y-2">
      <label className={adminLabel}>{label}</label>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      <div className="flex items-center gap-3">
        <label className="cursor-pointer flex items-center gap-2 border border-dashed border-brand-tan px-4 py-2.5 text-xs text-muted-foreground hover:border-brand-brown hover:text-brand-brown transition">
          {status === "uploading" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
          ) : status === "done" ? (
            <><Check className="h-4 w-4 text-brand-green" /> Uploaded</>
          ) : status === "error" ? (
            <><AlertTriangle className="h-4 w-4 text-brand-red" /> Retry upload</>
          ) : (
            <><Upload className="h-4 w-4" /> Choose image (JPG/PNG/WebP)</>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={upload}
          />
        </label>
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-16 h-16 object-cover border border-border"
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SHARED STYLE TOKENS
   ───────────────────────────────────────────────────────── */
export const adminInput        = "w-full bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown/20 transition";
export const adminLabel        = "block text-[10px] font-wordmark text-brand-gold mb-1 uppercase tracking-widest";
export const adminButton       = "inline-flex items-center gap-1.5 bg-brand-brown text-brand-cream font-wordmark text-[10px] tracking-widest uppercase px-5 py-2.5 hover:bg-brand-gold transition";
export const adminButtonGhost  = "inline-flex items-center gap-1.5 border border-border font-wordmark text-[10px] tracking-widest uppercase px-5 py-2.5 hover:border-brand-brown transition";
export const adminButtonDanger = "inline-flex items-center gap-1.5 bg-brand-red/10 text-brand-red border border-brand-red/30 font-wordmark text-[10px] tracking-widest uppercase px-4 py-2 hover:bg-brand-red hover:text-white transition";
export const adminTable        = "w-full text-sm";
export const adminTh           = "text-left px-4 py-3 font-wordmark text-[9px] text-brand-gold bg-muted border-b border-border";
export const adminTd           = "px-4 py-3 border-b border-border";
