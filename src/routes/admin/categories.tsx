import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { upsertCategory, deleteCategory } from "@/lib/admin.functions";
import { getCategories } from "@/lib/site.functions";
import { AdminPage, adminButton, adminButtonGhost, adminInput, adminLabel, adminTable, adminTd, adminTh } from "@/components/admin/AdminPage";
import { slugify } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({ component: CategoriesAdmin });

function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["categories"], queryFn: () => getCategories() });
  const upsert = useServerFn(upsertCategory);
  const del = useServerFn(deleteCategory);
  const [editing, setEditing] = useState<any | null>(null);

  async function save(f: any) {
    try { await upsert({ data: f }); toast.success("Saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["categories"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    try { await del({ data: { id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["categories"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <AdminPage title="Categories" action={<button className={adminButton} onClick={() => setEditing({ name: "", slug: "", sort_order: 0 })}>+ New</button>}>
      <table className={adminTable}>
        <thead><tr><th className={adminTh}>Name</th><th className={adminTh}>Slug</th><th className={adminTh}>Sort</th><th className={adminTh}></th></tr></thead>
        <tbody>
          {data.map((c: any) => (
            <tr key={c.id}>
              <td className={adminTd}>{c.name}</td>
              <td className={adminTd}>{c.slug}</td>
              <td className={adminTd}>{c.sort_order}</td>
              <td className={adminTd}>
                <button onClick={() => setEditing(c)} className="text-brand-gold mr-3">Edit</button>
                <button onClick={() => remove(c.id)} className="text-brand-red">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-6">
          <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="bg-card border border-border w-full max-w-md p-8 space-y-4">
            <h2 className="font-display text-2xl text-brand-brown">{editing.id ? "Edit" : "New"} category</h2>
            <label><span className={adminLabel}>Name</span><input required className={adminInput} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.slug || slugify(e.target.value) })} /></label>
            <label><span className={adminLabel}>Slug</span><input required className={adminInput} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} /></label>
            <label><span className={adminLabel}>Description</span><textarea className={adminInput} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label>
            <label><span className={adminLabel}>Sort order</span><input type="number" className={adminInput} value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className={adminButtonGhost}>Cancel</button>
              <button className={adminButton}>Save</button>
            </div>
          </form>
        </div>
      )}
    </AdminPage>
  );
}