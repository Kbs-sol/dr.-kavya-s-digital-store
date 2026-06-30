import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAllBlogPosts, upsertBlogPost, deleteBlogPost } from "@/lib/admin.functions";
import { AdminPage, adminButton, adminButtonGhost, adminInput, adminLabel, adminTable, adminTd, adminTh } from "@/components/admin/AdminPage";
import { slugify } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog")({ component: BlogAdmin });

function BlogAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin", "blog"], queryFn: () => listAllBlogPosts() });
  const upsert = useServerFn(upsertBlogPost);
  const del = useServerFn(deleteBlogPost);
  const [editing, setEditing] = useState<any | null>(null);

  async function save(f: any) {
    try { await upsert({ data: f }); toast.success("Saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["admin", "blog"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    try { await del({ data: { id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "blog"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <AdminPage title="Journal" action={<button className={adminButton} onClick={() => setEditing({ title: "", slug: "", body: "", published: true })}>+ New post</button>}>
      <table className={adminTable}>
        <thead><tr><th className={adminTh}>Title</th><th className={adminTh}>Slug</th><th className={adminTh}>Status</th><th className={adminTh}></th></tr></thead>
        <tbody>
          {data.map((p: any) => (
            <tr key={p.id}>
              <td className={adminTd}>{p.title}</td>
              <td className={adminTd}>{p.slug}</td>
              <td className={adminTd}>{p.published ? "Live" : "Draft"}</td>
              <td className={adminTd}>
                <button onClick={() => setEditing(p)} className="text-brand-gold mr-3">Edit</button>
                <button onClick={() => remove(p.id)} className="text-brand-red">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-6 overflow-auto">
          <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="bg-card border border-border w-full max-w-2xl p-8 space-y-3">
            <h2 className="font-display text-2xl text-brand-brown">{editing.id ? "Edit" : "New"} post</h2>
            <label><span className={adminLabel}>Title</span><input required className={adminInput} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} /></label>
            <label><span className={adminLabel}>Slug</span><input required className={adminInput} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} /></label>
            <label><span className={adminLabel}>Cover image URL</span><input className={adminInput} value={editing.cover_image ?? ""} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} /></label>
            <label><span className={adminLabel}>Excerpt</span><textarea rows={2} className={adminInput} value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></label>
            <label><span className={adminLabel}>Body</span><textarea required rows={10} className={adminInput} value={editing.body ?? ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Published</label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className={adminButtonGhost}>Cancel</button>
              <button className={adminButton}>Save</button>
            </div>
          </form>
        </div>
      )}
    </AdminPage>
  );
}