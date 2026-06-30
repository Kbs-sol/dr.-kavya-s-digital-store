import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { trackOrder } from "@/lib/site.functions";
import { Section } from "@/components/Section";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Order · Dr. Kavya's" },
      { name: "description", content: "Look up your Dr. Kavya's order status with your order ID and email." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const track = useServerFn(trackOrder);
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const r = await track({ data: { orderRef: ref, email } });
      if (!r.ok) setErr(r.error);
      else setResult(r);
    } catch (e: any) {
      setErr(e?.message ?? "Could not look up order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section eyebrow="Order status" title="Track your " italic="package.">
      <div className="max-w-xl mx-auto">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="font-wordmark text-[10px] text-brand-gold">Order ID or Number</label>
            <input value={ref} onChange={(e) => setRef(e.target.value)} required
              className="mt-1 w-full border border-border bg-card px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="font-wordmark text-[10px] text-brand-gold">Email used at checkout</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="mt-1 w-full border border-border bg-card px-4 py-3 text-sm" />
          </div>
          <button disabled={loading}
            className="bg-brand-brown text-brand-cream font-wordmark text-xs px-7 py-3 hover:bg-brand-gold transition disabled:opacity-50">
            {loading ? "Looking up…" : "Track Order"}
          </button>
        </form>
        {err && <p className="mt-6 text-sm text-brand-red">{err}</p>}
        {result?.order && (
          <div className="mt-10 border border-border bg-card p-6">
            <div className="font-wordmark text-[10px] text-brand-gold">Order {result.order.order_number}</div>
            <div className="mt-2 font-display text-2xl text-brand-brown capitalize">{result.order.status}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Placed {new Date(result.order.created_at).toLocaleDateString()} · {inr(result.order.total)}
            </div>
            {result.order.tracking_url && (
              <a href={result.order.tracking_url} target="_blank" rel="noreferrer"
                className="mt-4 inline-block font-wordmark text-[10px] text-brand-brown border-b border-brand-brown/40">
                Open carrier tracking →
              </a>
            )}
            <ul className="mt-6 divide-y divide-border text-sm">
              {result.items.map((it: any, i: number) => (
                <li key={i} className="py-2 flex justify-between">
                  <span>{it.name} {it.size ? `(${it.size})` : ""} × {it.quantity}</span>
                  <span>{inr(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}