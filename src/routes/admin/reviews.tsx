import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAllReviews, moderateReview } from "@/lib/admin.functions";
import { AdminPage, adminTable, adminTd, adminTh } from "@/components/admin/AdminPage";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({ component: ReviewsAdmin });

function ReviewsAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin", "reviews"], queryFn: () => listAllReviews() });
  const mod = useServerFn(moderateReview);

  async function set(id: string, approved: boolean) {
    try { await mod({ data: { id, approved } }); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin", "reviews"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <AdminPage title="Reviews">
      <table className={adminTable}>
        <thead><tr><th className={adminTh}>Product</th><th className={adminTh}>Author</th><th className={adminTh}>Rating</th><th className={adminTh}>Body</th><th className={adminTh}>Status</th><th className={adminTh}></th></tr></thead>
        <tbody>
          {data.map((r: any) => (
            <tr key={r.id}>
              <td className={adminTd}>{r.product?.name}</td>
              <td className={adminTd}>{r.author_name}</td>
              <td className={adminTd}>{r.rating}★</td>
              <td className={adminTd}>{r.title}<div className="text-xs text-muted-foreground">{r.body}</div></td>
              <td className={adminTd}>{r.approved ? "Approved" : "Pending"}</td>
              <td className={adminTd}>
                {r.approved
                  ? <button onClick={() => set(r.id, false)} className="text-brand-red">Hide</button>
                  : <button onClick={() => set(r.id, true)} className="text-brand-green">Approve</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminPage>
  );
}