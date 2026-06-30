import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { upsertCoupon, deleteCoupon } from "@/lib/admin.functions";
import { AdminPage, adminButton, adminButtonGhost, adminInput, adminLabel, adminTable, adminTd, adminTh } from "@/components/admin/AdminPage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/coupons")({ component: CouponsAdmin });

function CouponsAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const upsert = useServerFn(upsertCoupon);
  const del = useServerFn(deleteCoupon);
  const [editing, setEditing] = useState<any | null>(null);

  async function save(f: any) {
    try { await upsert({ data: f }); toast.success("Saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["admin", "coupons"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    try { await del({ data: { id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "coupons"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <AdminPage title="Coupons" action={<button className={adminButton} onClick={() => setEditing({ code: "", discount_type: "percent", discount_value: 10, min_order: 0, active: true })}>+ New</button>}>
      <table className={adminTable}>
        <thead><tr><th className={adminTh}>Code</th><th className={adminTh}>Type</th><th className={adminTh}>Value</th><th className={adminTh}>Min</th><th className={adminTh}>Active</th><th className={adminTh}></th></tr></thead>
        <tbody>
          {data.map((c: any) => (
            <tr key={c.id}>
              <td className={adminTd}>{c.code}</td>
              <td className={adminTd}>{c.discount_type}</td>
              <td className={adminTd}>{c.discount_value}{c.discount_type === "percent" ? "%" : "₹"}</td>
              <td className={adminTd}>{c.min_order ?? "—"}</td>
              <td className={adminTd}>{c.active ? "Yes" : "No"}</td>
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
          <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="bg-card border border-border w-full max-w-md p-8 space-y-3">
            <h2 className="font-display text-2xl text-brand-brown">{editing.id ? "Edit" : "New"} coupon</h2>
            <label><span className={adminLabel}>Code</span><input required className={adminInput} value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} /></label>
            <label><span className={adminLabel}>Description</span><input className={adminInput} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label>
            <label><span className={adminLabel}>Type</span>
              <select className={adminInput} value={editing.discount_type} onChange={(e) => setEditing({ ...editing, discount_type: e.target.value })}>
                <option value="percent">Percent</option><option value="flat">Flat ₹</option>
              </select></label>
            <label><span className={adminLabel}>Value</span><input required type="number" min={0} className={adminInput} value={editing.discount_value} onChange={(e) => setEditing({ ...editing, discount_value: Number(e.target.value) })} /></label>
            <label><span className={adminLabel}>Minimum order</span><input type="number" min={0} className={adminInput} value={editing.min_order ?? 0} onChange={(e) => setEditing({ ...editing, min_order: Number(e.target.value) })} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
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