import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listOrders, listAllProducts, listContactMessages, listAllReviews } from "@/lib/admin.functions";
import { AdminPage } from "@/components/admin/AdminPage";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: () => listOrders() });
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: () => listAllProducts() });
  const messages = useQuery({ queryKey: ["admin", "messages"], queryFn: () => listContactMessages() });
  const reviews = useQuery({ queryKey: ["admin", "reviews"], queryFn: () => listAllReviews() });

  const revenue = (orders.data ?? []).filter((o: any) => o.status === "paid" || o.status === "shipped" || o.status === "delivered").reduce((s: number, o: any) => s + Number(o.total), 0);
  const pending = (orders.data ?? []).filter((o: any) => o.status === "pending").length;

  const tiles = [
    { l: "Revenue (paid+)", v: inr(revenue) },
    { l: "Orders", v: (orders.data ?? []).length },
    { l: "Pending", v: pending },
    { l: "Products", v: (products.data ?? []).length },
    { l: "Reviews", v: (reviews.data ?? []).length },
    { l: "Messages", v: (messages.data ?? []).length },
  ];

  return (
    <AdminPage title="Dashboard">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <div key={t.l} className="border border-border p-6 bg-card">
            <div className="font-wordmark text-[10px] text-brand-gold">{t.l}</div>
            <div className="font-display text-3xl text-brand-brown mt-2">{t.v}</div>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}