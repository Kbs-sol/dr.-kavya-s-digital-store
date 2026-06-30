import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listContactMessages } from "@/lib/admin.functions";
import { AdminPage, adminTable, adminTd, adminTh } from "@/components/admin/AdminPage";

export const Route = createFileRoute("/admin/messages")({ component: MessagesAdmin });

function MessagesAdmin() {
  const { data = [] } = useQuery({ queryKey: ["admin", "messages"], queryFn: () => listContactMessages() });
  return (
    <AdminPage title="Messages">
      <table className={adminTable}>
        <thead><tr><th className={adminTh}>Date</th><th className={adminTh}>Name</th><th className={adminTh}>Email</th><th className={adminTh}>Subject</th><th className={adminTh}>Message</th></tr></thead>
        <tbody>
          {data.map((m: any) => (
            <tr key={m.id}>
              <td className={adminTd}>{new Date(m.created_at).toLocaleDateString()}</td>
              <td className={adminTd}>{m.name}</td>
              <td className={adminTd}>{m.email}<div className="text-xs text-muted-foreground">{m.phone}</div></td>
              <td className={adminTd}>{m.subject}</td>
              <td className={adminTd}>{m.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminPage>
  );
}