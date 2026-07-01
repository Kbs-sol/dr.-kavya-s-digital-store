import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMyOrder } from "@/lib/orders.functions";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/order/$id")({
  component: OrderPage,
  validateSearch: (s: Record<string, unknown>) => ({ email: typeof s.email === "string" ? s.email : "" }),
});

function OrderPage() {
  const { id } = Route.useParams();
  const { email: emailFromUrl } = Route.useSearch();
  const [email, setEmail] = useState(emailFromUrl);
  const [submitted, setSubmitted] = useState(!!emailFromUrl);
  const { data, isLoading } = useQuery({
    queryKey: ["order", id, email],
    queryFn: () => getMyOrder({ data: { id, email } }),
    enabled: submitted && !!email,
  });

  if (!submitted) {
    return (
      <form
        onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
        className="max-w-md mx-auto px-6 py-16 space-y-4"
      >
        <h1 className="font-display text-3xl text-brand-brown">View your order</h1>
        <p className="text-sm text-muted-foreground">Enter the email used at checkout to view this order.</p>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email" className="w-full bg-transparent border border-border px-3 py-3 text-sm" />
        <button className="w-full bg-brand-brown text-brand-cream font-wordmark text-xs px-6 py-3">View order</button>
      </form>
    );
  }
  if (isLoading) return <div className="max-w-2xl mx-auto p-16 text-center text-muted-foreground">Loading…</div>;
  if (!data) return (
    <div className="max-w-2xl mx-auto p-16 text-center space-y-3">
      <p>Order not found for that email.</p>
      <button onClick={() => setSubmitted(false)} className="font-wordmark text-[11px] text-brand-gold">Try again</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="bg-kraft border border-border p-10 text-center">
        <div className="font-wordmark text-[10px] text-brand-gold">Order received</div>
        <h1 className="font-display text-4xl text-brand-brown mt-3">Thank you, {data.shipping_name.split(" ")[0]}.</h1>
        <p className="text-muted-foreground mt-3">Order <b>{data.order_number}</b> is now with our packers in Visakhapatnam.</p>
      </div>
      <div className="mt-8 border border-border p-6 space-y-2">
        {(data.items as any[]).map((i) => (
          <div key={i.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
            <span>{i.product_name} × {i.quantity}</span>
            <span>{inr(i.line_total)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 font-display text-lg text-brand-brown"><span>Total</span><span>{inr(data.total)}</span></div>
        <div className="text-xs text-muted-foreground">Payment: {String(data.payment_method).toUpperCase()} · Status: {data.status}</div>
      </div>
      <div className="mt-8 text-center"><Link to="/shop" className="font-wordmark text-[11px] text-brand-gold hover:text-brand-brown">Continue shopping →</Link></div>
    </div>
  );
}