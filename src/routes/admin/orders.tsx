import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listOrders, updateOrderStatus } from "@/lib/admin.functions";
import { AdminPage, adminTable, adminTd, adminTh } from "@/components/admin/AdminPage";
import { inr } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin });

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

function OrdersAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin", "orders"], queryFn: () => listOrders() });
  const upd = useServerFn(updateOrderStatus);

  async function change(id: string, status: string) {
    try { await upd({ data: { id, status } }); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin", "orders"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <AdminPage title="Orders">
      <table className={adminTable}>
        <thead><tr><th className={adminTh}>#</th><th className={adminTh}>Customer</th><th className={adminTh}>Total</th><th className={adminTh}>Payment</th><th className={adminTh}>Status</th><th className={adminTh}>Date</th></tr></thead>
        <tbody>
          {data.map((o: any) => (
            <tr key={o.id}>
              <td className={adminTd}>{o.order_number}</td>
              <td className={adminTd}>{o.shipping_name}<div className="text-xs text-muted-foreground">{o.email}</div></td>
              <td className={adminTd}>{inr(o.total)}</td>
              <td className={adminTd}>{o.payment_method}</td>
              <td className={adminTd}>
                <select value={o.status} onChange={(e) => change(o.id, e.target.value)} className="bg-transparent border border-border rounded px-2 py-1 text-xs">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className={adminTd}>{new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminPage>
  );
}