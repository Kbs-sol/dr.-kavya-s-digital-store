import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { cart, useCart } from "@/lib/cart";
import { inr } from "@/lib/format";
import { placeOrder, verifyRazorpayPayment } from "@/lib/orders.functions";
import { validateCoupon } from "@/lib/site.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: Checkout });

declare global { interface Window { Razorpay: any } }

function loadRazorpay() {
  return new Promise<boolean>((res) => {
    if (window.Razorpay) return res(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.body.appendChild(s);
  });
}

function Checkout() {
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const place = useServerFn(placeOrder);
  const verify = useServerFn(verifyRazorpayPayment);
  const validate = useServerFn(validateCoupon);

  const [form, setForm] = useState({
    email: "", phone: "", shipping_name: "", shipping_line1: "", shipping_line2: "",
    shipping_city: "", shipping_state: "", shipping_pincode: "", notes: "",
  });
  const [payment] = useState<"razorpay">("razorpay");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setForm((f) => ({ ...f, email: f.email || (data.user!.email ?? "") }));
    });
  }, []);

  const shipping = subtotal === 0 ? 0 : 79;
  const total = Math.max(0, subtotal - discount + shipping);

  async function applyCoupon() {
    if (!coupon) return;
    try {
      const r = await validate({ data: { code: coupon, subtotal } });
      if (!r.ok) { toast.error(r.error); setDiscount(0); return; }
      setDiscount(r.discount);
      toast.success(`Saved ${inr(r.discount)}`);
    } catch (e: any) { toast.error(e?.message ?? "Could not apply"); }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const r = await place({
        data: {
          ...form,
          payment_method: payment,
          coupon_code: coupon,
          user_id: user?.id ?? null,
          items: items.map((i) => ({ id: i.id, name: i.name, image: i.image, price: i.price, quantity: i.quantity })),
        },
      });

      if (r.razorpay) {
        const ok = await loadRazorpay();
        if (!ok) throw new Error("Could not load payment script");
        const rp = new window.Razorpay({
          key: r.razorpay.key_id,
          order_id: r.razorpay.order_id,
          amount: r.razorpay.amount,
          currency: "INR",
          name: "Dr. Kavya's",
          description: r.order_number,
          prefill: { email: form.email, contact: form.phone, name: form.shipping_name },
          theme: { color: "#3D2F1A" },
          handler: async (resp: any) => {
            try {
              await verify({ data: { ...resp, order_id: r.order_id } });
              cart.clear();
              navigate({ to: "/order/$id", params: { id: r.order_id } });
            } catch (e: any) { toast.error(e?.message ?? "Verification failed"); }
          },
        });
        rp.open();
      } else {
        toast.error("Online payments are not configured yet. Please try again later.");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Could not place order");
    } finally { setLoading(false); }
  }

  if (items.length === 0) {
    return <div className="max-w-2xl mx-auto px-6 py-24 text-center"><h1 className="font-display text-3xl text-brand-brown">Your basket is empty.</h1></div>;
  }

  const input = "w-full bg-transparent border border-border px-3 py-3 text-sm focus:outline-none focus:border-brand-brown";

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-5 gap-12">
      <form onSubmit={onSubmit} className="md:col-span-3 space-y-8">
        <h1 className="font-display text-4xl text-brand-brown">Checkout</h1>

        <section>
          <h2 className="font-wordmark text-[11px] text-brand-gold mb-4">Contact</h2>
          <div className="grid grid-cols-2 gap-3">
            <input required type="email" placeholder="Email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input required type="tel" placeholder="Phone" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </section>

        <section>
          <h2 className="font-wordmark text-[11px] text-brand-gold mb-4">Shipping address</h2>
          <div className="space-y-3">
            <input required placeholder="Full name" className={input} value={form.shipping_name} onChange={(e) => setForm({ ...form, shipping_name: e.target.value })} />
            <input required placeholder="Address line 1" className={input} value={form.shipping_line1} onChange={(e) => setForm({ ...form, shipping_line1: e.target.value })} />
            <input placeholder="Address line 2 (optional)" className={input} value={form.shipping_line2} onChange={(e) => setForm({ ...form, shipping_line2: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <input required placeholder="City" className={input} value={form.shipping_city} onChange={(e) => setForm({ ...form, shipping_city: e.target.value })} />
              <input required placeholder="State" className={input} value={form.shipping_state} onChange={(e) => setForm({ ...form, shipping_state: e.target.value })} />
              <input required placeholder="Pincode" className={input} value={form.shipping_pincode} onChange={(e) => setForm({ ...form, shipping_pincode: e.target.value })} />
            </div>
            <textarea placeholder="Order notes (optional)" className={input} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </section>

        <section>
          <h2 className="font-wordmark text-[11px] text-brand-gold mb-4">Payment</h2>
          <div className="border border-brand-brown p-4 text-sm">
            Razorpay — UPI · Cards · Net Banking · Wallets
          </div>
        </section>

        <button disabled={loading} className="w-full bg-brand-brown text-brand-cream font-wordmark text-xs px-6 py-4 hover:bg-brand-gold transition disabled:opacity-50">
          {loading ? "Placing order…" : `Place order — ${inr(total)}`}
        </button>
      </form>

      <aside className="md:col-span-2 bg-kraft border border-border p-6 h-fit space-y-4">
        <div className="font-wordmark text-[10px] text-brand-gold">Your order</div>
        <ul className="divide-y divide-border">
          {items.map((i) => (
            <li key={i.id} className="py-3 flex gap-3 text-sm">
              <span className="flex-1">{i.name} <span className="text-muted-foreground">× {i.quantity}</span></span>
              <span>{inr(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input placeholder="Discount code" className="flex-1 bg-transparent border border-border px-3 py-2 text-sm" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
          <button type="button" onClick={applyCoupon} className="px-4 border border-brand-brown font-wordmark text-[10px] hover:bg-brand-brown hover:text-brand-cream">Apply</button>
        </div>
        <div className="space-y-1 text-sm pt-4 border-t border-border">
          <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-brand-green"><span>Discount</span><span>− {inr(discount)}</span></div>}
          <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
          <div className="flex justify-between font-display text-lg text-brand-brown pt-3 border-t border-border mt-3">
            <span>Total</span><span>{inr(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}