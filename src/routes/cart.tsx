import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { cart, useCart } from "@/lib/cart";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-4xl text-brand-brown">Your basket is empty</h1>
        <p className="mt-4 text-muted-foreground">Begin your ritual with one of our handcrafted formulas.</p>
        <Link to="/shop" className="inline-block mt-8 bg-brand-brown text-brand-cream font-wordmark text-xs px-7 py-4 hover:bg-brand-gold transition">
          Shop the apothecary
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12">
      <div className="md:col-span-2">
        <h1 className="font-display text-4xl text-brand-brown mb-8">Your basket</h1>
        <ul className="divide-y divide-border">
          {items.map((i) => (
            <li key={i.id} className="py-6 flex gap-4">
              {i.image ? <img src={i.image} alt={i.name} className="h-24 w-24 object-cover" /> : <div className="h-24 w-24 bg-brand-tan/40" />}
              <div className="flex-1">
                <div className="font-display text-lg text-brand-brown">{i.name}</div>
                {i.size && <div className="text-xs text-muted-foreground">{i.size}</div>}
                <div className="mt-3 flex items-center gap-3">
                  <button onClick={() => cart.setQty(i.id, i.quantity - 1)} className="p-1 border border-border"><Minus className="h-3 w-3" /></button>
                  <span className="text-sm w-6 text-center">{i.quantity}</span>
                  <button onClick={() => cart.setQty(i.id, i.quantity + 1)} className="p-1 border border-border"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-brand-brown">{inr(i.price * i.quantity)}</div>
                <button onClick={() => cart.remove(i.id)} className="mt-3 text-muted-foreground hover:text-brand-red"><X className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="bg-kraft border border-border p-8 h-fit">
        <div className="font-wordmark text-[10px] text-brand-gold mb-4">Summary</div>
        <div className="flex justify-between text-sm py-2"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
        <div className="flex justify-between text-sm py-2 text-muted-foreground"><span>Shipping</span><span>Calculated next</span></div>
        <Link to="/checkout" className="block text-center mt-6 bg-brand-brown text-brand-cream font-wordmark text-xs px-6 py-4 hover:bg-brand-gold transition">
          Checkout
        </Link>
        <Link to="/shop" className="block text-center mt-3 text-xs text-brand-gold hover:text-brand-brown">Continue shopping</Link>
      </aside>
    </div>
  );
}