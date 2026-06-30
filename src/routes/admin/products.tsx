import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAllProducts, upsertProduct, deleteProduct } from "@/lib/admin.functions";
import { getCategories } from "@/lib/site.functions";
import {
  AdminPage, CloudinaryUpload,
  adminButton, adminButtonGhost, adminButtonDanger,
  adminInput, adminLabel, adminTable, adminTd, adminTh
} from "@/components/admin/AdminPage";
import { inr, slugify } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from "lucide-react";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdmin });

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => listAllProducts(),
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });
  const upsert = useServerFn(upsertProduct);
  const del    = useServerFn(deleteProduct);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await del({ data: { id } });
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  }

  async function togglePublished(p: any) {
    try {
      await upsert({ data: { ...p, published: !p.published } });
      toast.success(p.published ? "Set to Draft" : "Published");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  return (
    <AdminPage
      title="Products"
      action={
        <div className="flex items-center gap-3">
          <input
            placeholder="Search products…"
            className={`${adminInput} w-48`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className={adminButton}
            onClick={() => setEditing({ name: "", slug: "", price: 0, stock: 0, published: true, featured: false, badges: [] })}
          >
            <Plus className="h-3.5 w-3.5" /> New Product
          </button>
        </div>
      }
    >
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { l: "Total", v: products.length },
          { l: "Published", v: products.filter((p: any) => p.published).length },
          { l: "Featured", v: products.filter((p: any) => p.featured).length },
          { l: "Out of stock", v: products.filter((p: any) => p.stock === 0).length },
        ].map((t) => (
          <div key={t.l} className="bg-card border border-border p-4">
            <div className={adminLabel}>{t.l}</div>
            <div className="font-display text-2xl text-brand-brown">{t.v}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
          Loading products…
        </div>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className={adminTable}>
            <thead>
              <tr>
                <th className={adminTh}>Product</th>
                <th className={adminTh}>Category</th>
                <th className={adminTh}>Price</th>
                <th className={adminTh}>Stock</th>
                <th className={adminTh}>Status</th>
                <th className={adminTh}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/30 transition">
                  <td className={adminTd}>
                    <div className="flex items-center gap-3">
                      {p.cover_image && (
                        <img src={p.cover_image} alt={p.name} className="w-10 h-10 object-cover border border-border shrink-0" />
                      )}
                      <div>
                        <div className="font-medium text-brand-brown">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground">{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className={adminTd}>
                    <span className="text-xs">{p.category?.name ?? "—"}</span>
                  </td>
                  <td className={adminTd}>
                    <div className="font-medium">{inr(p.price)}</div>
                    {p.compare_at_price && (
                      <div className="text-xs text-muted-foreground line-through">{inr(p.compare_at_price)}</div>
                    )}
                  </td>
                  <td className={adminTd}>
                    <span className={p.stock === 0 ? "text-brand-red font-medium" : p.stock < 10 ? "text-brand-mustard font-medium" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className={adminTd}>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-wordmark ${p.published ? "bg-brand-green/10 text-brand-green" : "bg-muted text-muted-foreground"}`}>
                        {p.published ? "Live" : "Draft"}
                      </span>
                      {p.featured && (
                        <Star className="h-3.5 w-3.5 text-brand-mustard fill-brand-mustard" />
                      )}
                    </div>
                  </td>
                  <td className={adminTd}>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditing(p)} className="text-brand-gold hover:text-brand-brown transition" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => togglePublished(p)} className="text-muted-foreground hover:text-brand-brown transition" title={p.published ? "Set Draft" : "Publish"}>
                        {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => remove(p.id, p.name)} className="text-brand-red/60 hover:text-brand-red transition" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductForm
          cats={cats}
          initial={editing}
          onSave={async (form: any) => {
            try {
              await upsert({ data: form });
              toast.success("Product saved");
              setEditing(null);
              qc.invalidateQueries({ queryKey: ["admin", "products"] });
              qc.invalidateQueries({ queryKey: ["products"] });
            } catch (e: any) {
              toast.error(e?.message ?? "Save failed");
            }
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </AdminPage>
  );
}

function ProductForm({ cats, initial, onSave, onClose }: any) {
  const [f, setF] = useState({
    id: initial.id,
    category_id: initial.category_id ?? null,
    name: initial.name ?? "",
    slug: initial.slug ?? "",
    tagline: initial.tagline ?? "",
    short_description: initial.short_description ?? "",
    description: initial.description ?? "",
    ingredients: initial.ingredients ?? "",
    how_to_use: initial.how_to_use ?? "",
    price: Number(initial.price ?? 0),
    compare_at_price: initial.compare_at_price ? Number(initial.compare_at_price) : null,
    size: initial.size ?? "",
    stock: Number(initial.stock ?? 0),
    weight_grams: initial.weight_grams ? Number(initial.weight_grams) : null,
    cover_image: initial.cover_image ?? "",
    featured: !!initial.featured,
    published: initial.published ?? true,
    badges: Array.isArray(initial.badges) ? initial.badges.join(", ") : "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...f,
        badges: f.badges
          ? f.badges.split(",").map((b: string) => b.trim()).filter(Boolean)
          : [],
      });
    } finally {
      setSaving(false);
    }
  }

  const inputCls = adminInput + " rounded-none";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 md:p-8 overflow-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border w-full max-w-3xl p-8 space-y-6 my-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <h2 className="font-display text-2xl text-brand-brown">
            {f.id ? "Edit Product" : "New Product"}
          </h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-brand-brown transition">
            <Plus className="h-5 w-5 rotate-45" />
          </button>
        </div>

        {/* Image upload */}
        <div className="space-y-3">
          <CloudinaryUpload
            label="Cover Image"
            hint="Recommended: 800×800px JPG or PNG. Will be auto-optimised via Cloudinary."
            onUrl={(url) => setF({ ...f, cover_image: url })}
          />
          <div>
            <label className={adminLabel}>Or paste image URL</label>
            <input
              className={inputCls}
              value={f.cover_image}
              onChange={(e) => setF({ ...f, cover_image: e.target.value })}
              placeholder="https://res.cloudinary.com/…"
            />
            {f.cover_image && (
              <img src={f.cover_image} alt="Cover preview" className="mt-2 w-24 h-24 object-cover border border-border" />
            )}
          </div>
        </div>

        {/* Name + slug + category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={adminLabel}>Product Name *</label>
            <input
              required
              className={inputCls}
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) })}
              placeholder="Hair Fall Control Mask"
            />
          </div>
          <div>
            <label className={adminLabel}>URL Slug *</label>
            <input
              required
              className={inputCls}
              value={f.slug}
              onChange={(e) => setF({ ...f, slug: slugify(e.target.value) })}
            />
          </div>
          <div>
            <label className={adminLabel}>Category</label>
            <select
              className={inputCls}
              value={f.category_id ?? ""}
              onChange={(e) => setF({ ...f, category_id: e.target.value || null })}
            >
              <option value="">— None —</option>
              {cats.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tagline */}
        <div>
          <label className={adminLabel}>Tagline</label>
          <input
            className={inputCls}
            value={f.tagline}
            onChange={(e) => setF({ ...f, tagline: e.target.value })}
            placeholder="Our hero ritual for thinning hair"
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={adminLabel}>Price (₹) *</label>
            <input required type="number" min={0} step="0.01" className={inputCls} value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} />
          </div>
          <div>
            <label className={adminLabel}>Compare Price (₹)</label>
            <input type="number" min={0} step="0.01" className={inputCls} value={f.compare_at_price ?? ""} onChange={(e) => setF({ ...f, compare_at_price: e.target.value ? Number(e.target.value) : null })} />
          </div>
          <div>
            <label className={adminLabel}>Size</label>
            <input className={inputCls} value={f.size} onChange={(e) => setF({ ...f, size: e.target.value })} placeholder="100g" />
          </div>
          <div>
            <label className={adminLabel}>Stock *</label>
            <input required type="number" min={0} className={inputCls} value={f.stock} onChange={(e) => setF({ ...f, stock: Number(e.target.value) })} />
          </div>
        </div>

        {/* Descriptions */}
        <div>
          <label className={adminLabel}>Short Description (shown in listings)</label>
          <textarea rows={2} className={inputCls} value={f.short_description} onChange={(e) => setF({ ...f, short_description: e.target.value })} />
        </div>
        <div>
          <label className={adminLabel}>Full Description</label>
          <textarea rows={5} className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </div>
        <div>
          <label className={adminLabel}>Ingredients (comma-separated)</label>
          <textarea rows={3} className={inputCls} value={f.ingredients} onChange={(e) => setF({ ...f, ingredients: e.target.value })} placeholder="Bhringraj, Amla, Hibiscus, Methi..." />
        </div>
        <div>
          <label className={adminLabel}>How to Use</label>
          <textarea rows={3} className={inputCls} value={f.how_to_use} onChange={(e) => setF({ ...f, how_to_use: e.target.value })} />
        </div>

        {/* Badges + toggles */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={adminLabel}>Badges (comma-separated)</label>
            <input className={inputCls} value={f.badges} onChange={(e) => setF({ ...f, badges: e.target.value })} placeholder="Bestseller, Doctor Formulated" />
          </div>
          <div className="flex items-center gap-6 pt-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} className="w-4 h-4 accent-brand-brown" />
              <span>Featured</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} className="w-4 h-4 accent-brand-brown" />
              <span>Published</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button type="button" onClick={onClose} className={adminButtonGhost}>Cancel</button>
          <button disabled={saving} className={adminButton}>
            {saving ? "Saving…" : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
