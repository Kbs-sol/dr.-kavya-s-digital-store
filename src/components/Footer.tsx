import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/contact.functions";
import { toast } from "sonner";

export function Footer() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await subscribe({ data: { email } });
      toast.success("Welcome to the family.");
      setEmail("");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not subscribe");
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="bg-brand-brown text-brand-cream mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="font-display italic text-3xl text-brand-cream">Dr. Kavya's</div>
          <div className="font-wordmark text-[10px] text-brand-tan mt-1">Hair &amp; Skin Care</div>
          <p className="mt-6 max-w-md text-brand-cream/80 leading-relaxed">
            Healing naturally — handcrafted Ayurvedic remedies from a doctor's kitchen
            to your home. 100% Herbal · Paraben-Free · Vegan · Handmade in small batches.
          </p>
          <form onSubmit={onSubmit} className="mt-8 flex max-w-sm gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 bg-transparent border-b border-brand-tan/60 px-1 py-2 text-sm placeholder:text-brand-cream/40 focus:outline-none focus:border-brand-cream"
            />
            <button
              disabled={loading}
              className="font-wordmark text-[10px] border border-brand-tan/60 px-4 py-2 hover:bg-brand-cream hover:text-brand-brown transition"
            >
              {loading ? "..." : "Subscribe"}
            </button>
          </form>
        </div>
        <div>
          <h4 className="font-wordmark text-[11px] text-brand-tan mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-brand-cream/80">
            <li><Link to="/shop">All products</Link></li>
            <li><Link to="/shop" search={{ category: "hair" } as any}>Hair</Link></li>
            <li><Link to="/shop" search={{ category: "skin" } as any}>Skin</Link></li>
            <li><Link to="/shop" search={{ category: "body" } as any}>Body</Link></li>
            <li><Link to="/shop" search={{ category: "gifting" } as any}>Gifting</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-wordmark text-[11px] text-brand-tan mb-4">Brand</h4>
          <ul className="space-y-2 text-sm text-brand-cream/80">
            <li><Link to="/story">Our Story</Link></li>
            <li><Link to="/ingredients">Ingredients</Link></li>
            <li><Link to="/journal">Journal</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/track">Track Order</Link></li>
            <li><Link to="/quiz">Hair &amp; Skin Quiz</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
          <a
            href="https://www.instagram.com/kavyas_hairandskincare/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm text-brand-cream/80 hover:text-brand-cream"
          >
            <Instagram className="h-4 w-4" /> @kavyas_hairandskincare
          </a>
        </div>
      </div>
      <div className="border-t border-brand-cream/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between text-xs text-brand-cream/60 gap-2">
          <div>© {new Date().getFullYear()} Dr. Kavya's Hair &amp; Skin Care. Made in Vizag.</div>
          <div className="flex gap-6 font-wordmark text-[10px]">
            <span>FSSAI · Cosmetic Reg.</span>
            <Link to="/contact">Shipping &amp; Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}