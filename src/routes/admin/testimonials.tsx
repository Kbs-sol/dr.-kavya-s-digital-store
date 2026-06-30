import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  listAllTestimonials,
  upsertTestimonial,
  deleteTestimonial,
} from "@/lib/admin.functions";
import {
  AdminPage,
  adminButton,
  adminButtonGhost,
  adminInput,
  adminLabel,
  adminTable,
  adminTd,
  adminTh,
} from "@/components/admin/AdminPage";

export const Route = createFileRoute("/admin/testimonials")({ component: TestimonialsAdmin });

const empty = {
  name: "",
  location: "",
  rating: 5,
  quote: "",
  product_used: "",
  image_url: "",
  video_url: "",
  before_image_url: "",
  after_image_url: "",
  featured: true,
  published: true,
  sort_order: 0,
};

function TestimonialsAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: () => listAllTestimonials(),
  });
  const save = useServerFn(upsertTestimonial);
  const del = useServerFn(deleteTestimonial);
  const [editing, setEditing] = useState<any | null>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await save({ data: editing });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    }
  }
  async function onDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    }
  }

  return (
    <AdminPage
      title="Testimonials"
      action={
        <button className={adminButton} onClick={() => setEditing({ ...empty })}>
          + New
        </button>
      }
    >
      <p className="text-xs text-muted-foreground mb-4">
        Paste Cloudinary URLs (e.g. <code>https://res.cloudinary.com/.../image/upload/...</code> or{" "}
        <code>.../video/upload/...mp4</code>). Use the before/after pair for transformation results.
      </p>
      <table className={adminTable}>
        <thead>
          <tr>
            <th className={adminTh}>Name</th>
            <th className={adminTh}>Rating</th>
            <th className={adminTh}>Quote</th>
            <th className={adminTh}>Media</th>
            <th className={adminTh}>Featured</th>
            <th className={adminTh}>Published</th>
            <th className={adminTh}></th>
          </tr>
        </thead>
        <tbody>
          {data.map((t: any) => (
            <tr key={t.id}>
              <td className={adminTd}>
                {t.name}
                {t.location ? <div className="text-xs text-muted-foreground">{t.location}</div> : null}
              </td>
              <td className={adminTd}>{t.rating}★</td>
              <td className={adminTd}>
                <div className="line-clamp-2 max-w-md">{t.quote}</div>
              </td>
              <td className={adminTd}>
                <div className="flex gap-1 text-xs">
                  {t.video_url ? <span className="px-1.5 py-0.5 bg-brand-brown text-brand-cream rounded">video</span> : null}
                  {t.image_url ? <span className="px-1.5 py-0.5 bg-brand-tan text-brand-brown rounded">image</span> : null}
                  {t.before_image_url && t.after_image_url ? (
                    <span className="px-1.5 py-0.5 bg-brand-green text-brand-cream rounded">before/after</span>
                  ) : null}
                </div>
              </td>
              <td className={adminTd}>{t.featured ? "Yes" : "—"}</td>
              <td className={adminTd}>{t.published ? "Yes" : "—"}</td>
              <td className={adminTd}>
                <button onClick={() => setEditing(t)} className="text-brand-brown mr-3">
                  Edit
                </button>
                <button onClick={() => onDelete(t.id)} className="text-brand-red">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setEditing(null)}>
          <form
            onSubmit={onSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded space-y-3"
          >
            <h2 className="font-display text-2xl text-brand-brown">
              {editing.id ? "Edit testimonial" : "New testimonial"}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={adminLabel}>Name</span>
                <input required className={adminInput} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </label>
              <label>
                <span className={adminLabel}>Location</span>
                <input className={adminInput} value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
              </label>
              <label>
                <span className={adminLabel}>Rating (1–5)</span>
                <input type="number" min={1} max={5} className={adminInput} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} />
              </label>
              <label>
                <span className={adminLabel}>Product used</span>
                <input className={adminInput} value={editing.product_used ?? ""} onChange={(e) => setEditing({ ...editing, product_used: e.target.value })} />
              </label>
            </div>
            <label className="block">
              <span className={adminLabel}>Quote</span>
              <textarea required rows={4} className={adminInput} value={editing.quote} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} />
            </label>
            <label className="block">
              <span className={adminLabel}>Image URL (Cloudinary)</span>
              <input className={adminInput} placeholder="https://res.cloudinary.com/.../image/upload/..." value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
            </label>
            <label className="block">
              <span className={adminLabel}>Video URL (Cloudinary mp4/webm)</span>
              <input className={adminInput} placeholder="https://res.cloudinary.com/.../video/upload/....mp4" value={editing.video_url ?? ""} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={adminLabel}>Before image URL</span>
                <input className={adminInput} value={editing.before_image_url ?? ""} onChange={(e) => setEditing({ ...editing, before_image_url: e.target.value })} />
              </label>
              <label>
                <span className={adminLabel}>After image URL</span>
                <input className={adminInput} value={editing.after_image_url ?? ""} onChange={(e) => setEditing({ ...editing, after_image_url: e.target.value })} />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                Published
              </label>
              <label>
                <span className={adminLabel}>Sort order</span>
                <input type="number" className={adminInput} value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={adminButtonGhost} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className={adminButton}>Save</button>
            </div>
          </form>
        </div>
      )}
    </AdminPage>
  );
}