import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listAllFaqs, upsertFaq, deleteFaq } from "@/lib/admin.functions";
import {
  AdminPage, adminButton, adminButtonGhost, adminInput, adminLabel,
  adminTable, adminTd, adminTh,
} from "@/components/admin/AdminPage";

export const Route = createFileRoute("/admin/faqs")({ component: FaqsAdmin });

const empty = { question: "", answer: "", category: "General", sort_order: 0, published: true };

function FaqsAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin", "faqs"], queryFn: () => listAllFaqs() });
  const save = useServerFn(upsertFaq);
  const del = useServerFn(deleteFaq);
  const [editing, setEditing] = useState<any | null>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await save({ data: editing });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
    } catch (err: any) { toast.error(err?.message ?? "Failed"); }
  }
  async function onDelete(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
    } catch (err: any) { toast.error(err?.message ?? "Failed"); }
  }

  return (
    <AdminPage title="FAQs"
      action={<button className={adminButton} onClick={() => setEditing({ ...empty })}>+ New</button>}>
      <table className={adminTable}>
        <thead><tr>
          <th className={adminTh}>Question</th>
          <th className={adminTh}>Category</th>
          <th className={adminTh}>Order</th>
          <th className={adminTh}>Published</th>
          <th className={adminTh}></th>
        </tr></thead>
        <tbody>
          {data.map((f: any) => (
            <tr key={f.id}>
              <td className={adminTd}><div className="line-clamp-2 max-w-md">{f.question}</div></td>
              <td className={adminTd}>{f.category}</td>
              <td className={adminTd}>{f.sort_order}</td>
              <td className={adminTd}>{f.published ? "Yes" : "—"}</td>
              <td className={adminTd}>
                <button onClick={() => setEditing(f)} className="text-brand-brown mr-3">Edit</button>
                <button onClick={() => onDelete(f.id)} className="text-brand-red">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setEditing(null)}>
          <form onSubmit={onSave} onClick={(e) => e.stopPropagation()}
            className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded space-y-3">
            <h2 className="font-display text-2xl text-brand-brown">{editing.id ? "Edit FAQ" : "New FAQ"}</h2>
            <label className="block">
              <span className={adminLabel}>Question</span>
              <input required className={adminInput} value={editing.question}
                onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
            </label>
            <label className="block">
              <span className={adminLabel}>Answer</span>
              <textarea required rows={6} className={adminInput} value={editing.answer}
                onChange={(e) => setEditing({ ...editing, answer: e.target.value })} />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label>
                <span className={adminLabel}>Category</span>
                <input className={adminInput} value={editing.category ?? ""}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              </label>
              <label>
                <span className={adminLabel}>Sort order</span>
                <input type="number" className={adminInput} value={editing.sort_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              </label>
              <label className="flex items-center gap-2 text-sm mt-6">
                <input type="checkbox" checked={!!editing.published}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                Published
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={adminButtonGhost} onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className={adminButton}>Save</button>
            </div>
          </form>
        </div>
      )}
    </AdminPage>
  );
}