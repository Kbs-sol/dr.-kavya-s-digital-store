import { Link } from "@tanstack/react-router";
import { inr } from "@/lib/format";
import { cart } from "@/lib/cart";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function ProductCard({ p }: { p: any }) {
  const mrp = p.compare_at_price ? Number(p.compare_at_price) : 0;
  const price = Number(p.price);
  const pct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

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
    toast.success(`${p.name} added to cart`);
  }

  return (
    <Link
      to="/product/$slug"
      params={{ slug: p.slug }}
      className="group block"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {p.cover_image ? (
          <img
            src={p.cover_image}
            alt={p.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-brand-tan/40" />
        )}
        {p.badges?.[0] && (
          <span className="absolute top-3 left-3 bg-brand-cream text-brand-brown text-[10px] font-wordmark px-2 py-1">
            {p.badges[0]}
          </span>
        )}
        {pct > 0 && (
          <span className="absolute top-3 right-3 bg-brand-red text-brand-cream text-[10px] font-wordmark px-2 py-1">
            {pct}% OFF
          </span>
        )}
        <button
          type="button"
          onClick={quickAdd}
          className="absolute bottom-0 left-0 right-0 bg-brand-brown text-brand-cream text-[11px] font-wordmark tracking-widest uppercase py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
          aria-label={`Add ${p.name} to cart`}
        >
          <Plus className="h-3.5 w-3.5" /> Add to Cart
        </button>
      </div>
      <div className="mt-4 space-y-1">
        <div className="font-wordmark text-[10px] text-brand-gold">
          {p.category?.name ?? ""}
        </div>
        <h3 className="font-display text-lg text-brand-brown leading-tight">{p.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{p.tagline}</p>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-medium text-brand-brown">{inr(p.price)}</span>
          {pct > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {inr(p.compare_at_price)}
            </span>
          )}
          {p.size && (
            <span className="text-xs text-muted-foreground ml-auto">{p.size}</span>
          )}
        </div>
      </div>
    </Link>
  );
}