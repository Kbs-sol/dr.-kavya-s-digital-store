import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, ShoppingCart, Star,
  MessageSquare, Tag, FileText, Settings, Users,
  HelpCircle, X, Menu, Image as ImageIcon,
  Upload, Check, AlertTriangle, Loader2, LogOut
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/* ── Sidebar nav items ── */
const nav = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { to: "/admin/reviews", label: "Reviews", Icon: Star },
  { to: "/admin/testimonials", label: "Testimonials", Icon: Users },
  { to: "/admin/categories", label: "Categories", Icon: Tag },
  { to: "/admin/coupons", label: "Coupons", Icon: Tag },
  { to: "/admin/blog", label: "Journal / Blog", Icon: FileText },
  { to: "/admin/faqs", label: "FAQs", Icon: HelpCircle },
  { to: "/admin/messages", label: "Messages", Icon: MessageSquare },
  { to: "/admin/content", label: "Site Content", Icon: Settings },
];

export function AdminPage({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="flex min-h-screen bg-[#1C150F]">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-sidebar z-50 flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:block
        `}
      >
        {/* Logo area */}
        <div className="px-6 py-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
              <span className="font-display text-brand-tan text-sm font-bold italic">DK</span>
            </div>
            <div>
              <div className="font-wordmark text-[10px] text-brand-tan">Dr. Kavya's</div>
              <div className="font-wordmark text-[9px] text-sidebar-foreground/50">Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {nav.map(({ to, label, Icon, exact }) => {
            const active = exact
              ? pathname === to
              : pathname.startsWith(to) && to !== "/admin";
            const isAdminRoot = to === "/admin" && pathname === "/admin";
            const isActive = to === "/admin" ? isAdminRoot : (exact ? pathname === to : pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to as any}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 text-[11px] font-wordmark tracking-wider
                  rounded transition mb-0.5
                  ${isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }
                `}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-[11px] font-wordmark tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition"
          >
            <X className="h-3.5 w-3.5" />
            View site
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-wordmark tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-muted-foreground"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-2xl text-brand-brown">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {action}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </div>
      </main>
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

      /* Use secure_url with auto format + quality transformations */
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
