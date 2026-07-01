import { Link } from "@tanstack/react-router";
import { inr } from "@/lib/format";
import { cart } from "@/lib/cart";
import { toast } from "sonner";
import { Plus, Star } from "lucide-react";

export function ProductCard({ p, className = "" }: { p: any; className?: string }) {
  const mrp = p.compare_at_price ? Number(p.compare_at_price) : 0;
  const price = Number(p.price);
  const pct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const rating = p.avg_rating ?? 4.8;
  const reviewCount = p.review_count ?? 0;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    cart.add({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price,
      image: p.cover_image ?? "",
      size: p.size ?? null,
    });

    // Fire Meta Pixel event
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddToCart", {
        content_ids: [p.id],
        content_name: p.name,
        content_type: "product",
        value: price,
        currency: "INR",
      });
    }

    // Fire GA4 event
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "add_to_cart", {
        currency: "INR",
        value: price,
        items: [{ item_id: p.id, item_name: p.name, price, quantity: 1 }],
      });
    }

    toast.success(`${p.name} added to cart ✓`, {
      action: { label: "View Cart", onClick: () => (window.location.href = "/cart") },
    });
  }

  return (
    <Link
      to="/product/$slug"
      params={{ slug: p.slug }}
      className={`group block ${className}`}
    >
      {/* Image block */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F5EAD7]/50">
        {p.cover_image ? (
          <img
            src={p.cover_image}
            alt={p.name}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            width={600}
            height={750}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-tan/30 to-brand-cream flex items-center justify-center">
            <span className="text-4xl opacity-40">🌿</span>
          </div>
        )}

        {/* Badges — top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.badges?.[0] && (
            <span className="bg-brand-cream text-brand-brown text-[9px] font-wordmark tracking-wider uppercase px-2.5 py-1 shadow-sm">
              {p.badges[0]}
            </span>
          )}
          {p.featured && !p.badges?.[0] && (
            <span className="bg-brand-green text-brand-cream text-[9px] font-wordmark tracking-wider uppercase px-2.5 py-1">
              Bestseller
            </span>
          )}
        </div>

        {/* Discount badge — top right */}
        {pct > 0 && (
          <span className="absolute top-3 right-3 bg-brand-red text-brand-cream text-[9px] font-wordmark tracking-wider uppercase px-2.5 py-1">
            {pct}% OFF
          </span>
        )}

        {/* Out of stock overlay */}
        {p.stock <= 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="font-wordmark text-[10px] tracking-widest uppercase text-foreground/50 bg-white px-4 py-2">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick add button — slides up on hover */}
        {p.stock > 0 && (
          <button
            type="button"
            onClick={quickAdd}
            className="absolute bottom-0 left-0 right-0 bg-brand-brown text-brand-cream text-[10px] font-wordmark tracking-widest uppercase py-3.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex items-center justify-center gap-2 hover:bg-brand-gold"
            aria-label={`Add ${p.name} to cart`}
          >
            <Plus className="h-3.5 w-3.5 flex-shrink-0" />
            Add to Cart
          </button>
        )}
      </div>

      {/* Info block */}
      <div className="mt-4 space-y-1.5 px-0.5">
        {/* Category */}
        {p.category?.name && (
          <div className="font-wordmark text-[9px] text-brand-gold tracking-[0.2em] uppercase">
            {p.category.name}
          </div>
        )}

        {/* Name */}
        <h3 className="font-display text-xl text-brand-brown leading-tight group-hover:text-brand-gold transition-colors duration-300">
          {p.name}
        </h3>

        {/* Tagline */}
        {p.tagline && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{p.tagline}</p>
        )}

        {/* Stars */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex text-amber-400 text-xs">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-current" : "opacity-30"}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-display text-lg text-brand-brown">{inr(price)}</span>
          {pct > 0 && (
            <span className="text-xs text-muted-foreground line-through">{inr(mrp)}</span>
          )}
          {p.size && (
            <span className="text-xs text-muted-foreground ml-auto font-wordmark tracking-wider">{p.size}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
