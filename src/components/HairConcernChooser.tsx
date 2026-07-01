/**
 * HairConcernChooser — Problem-based product selector
 * Slide-up panel with hair concern categories → matching products + expert tips
 * Uses live product data (via useQuery) with rich static fallback
 */
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/site.functions";
import { cart } from "@/lib/cart";
import { toast } from "sonner";
import { X, ShoppingBag, ChevronRight, Leaf } from "lucide-react";

/* ─── Concern definitions ──────────────────────────────────────── */
const CONCERNS = [
  {
    id: "hair-loss",
    icon: "🌿",
    label: "Hair Loss",
    banner: "Reduce Hair Fall",
    sub: "Root-strengthening herbs since centuries",
    searchKey: ["hair fall", "hair loss", "bhringraj", "oil", "scalp"],
    tips: [
      "Bhringraj oil massage 3× a week strengthens follicles and reduces shedding.",
      "Sulfate-free shampoo preserves the scalp barrier — switch today.",
      "Iron & protein deficiency is the #1 hidden cause of hair fall.",
    ],
    viewAll: "/shop?category=hair-fall",
    color: "#3A6B30",
    bg: "rgba(58,107,48,0.08)",
  },
  {
    id: "hair-growth",
    icon: "✨",
    label: "Hair Growth",
    banner: "Boost Hair Growth",
    sub: "Activate dormant follicles with Ayurvedic herbs",
    searchKey: ["growth", "amla", "mask", "hair mask", "serum"],
    tips: [
      "Amla is the single most clinically proven Ayurvedic herb for hair growth.",
      "Scalp massages for 4 min/day increase hair thickness over 24 weeks.",
      "Consistent weekly hair masking feeds the root with nutrients it needs.",
    ],
    viewAll: "/shop?category=hair-growth",
    color: "#B07D2A",
    bg: "rgba(176,125,42,0.08)",
  },
  {
    id: "dandruff",
    icon: "❄️",
    label: "Dandruff",
    banner: "Clear Dandruff",
    sub: "Anti-fungal herbs, zero chemicals",
    searchKey: ["dandruff", "neem", "shikakai", "powder", "bath"],
    tips: [
      "Neem has natural anti-fungal properties — use in oil or powder form weekly.",
      "Hot water inflames the scalp. Switch to cool/lukewarm water rinses.",
      "Avoid silicone-heavy conditioners that trap flakes against the scalp.",
    ],
    viewAll: "/shop?category=dandruff",
    color: "#2C3E6B",
    bg: "rgba(44,62,107,0.07)",
  },
  {
    id: "dry-damage",
    icon: "💧",
    label: "Dry & Damage",
    banner: "Repair Dry & Damaged Hair",
    sub: "Deep conditioning with natural butters & oils",
    searchKey: ["dry", "damage", "conditioning", "mask", "hibiscus", "combo"],
    tips: [
      "Leave-in hair mask overnight before wash day for maximum moisture penetration.",
      "Hibiscus is the Ayurvedic conditioner — slips knots, adds shine naturally.",
      "Trim split ends every 8–10 weeks to stop damage travelling up the shaft.",
    ],
    viewAll: "/shop?category=dry-damaged",
    color: "#A84020",
    bg: "rgba(168,64,32,0.07)",
  },
  {
    id: "oily-scalp",
    icon: "🫧",
    label: "Oily Scalp",
    banner: "Balance Oily Scalp",
    sub: "Regulate sebum with Ayurvedic clays & herbs",
    searchKey: ["oily", "scalp", "powder", "detan", "face pack", "clay"],
    tips: [
      "Over-washing stimulates more oil — wash 2–3× a week max.",
      "Multani Mitti (Fuller's Earth) naturally absorbs excess scalp sebum.",
      "Avoid oil-based heavy serums directly on the scalp when oily.",
    ],
    viewAll: "/shop?category=oily-scalp",
    color: "#556B2F",
    bg: "rgba(85,107,47,0.08)",
  },
] as const;

type ConcernId = (typeof CONCERNS)[number]["id"];

/* ─── Static fallback products (used when Supabase is offline) ─── */
const STATIC_PRODUCTS: Record<ConcernId, Array<{ name: string; slug: string; price: number; image: string; desc: string }>> = {
  "hair-loss": [
    { name: "Ayurvedic Hair Mask", slug: "ayurvedic-hair-mask", price: 349, image: "", desc: "hair-mask" },
    { name: "Bhringraj Hair Oil", slug: "bhringraj-hair-oil", price: 279, image: "", desc: "hair-oil" },
    { name: "Hair Fall Control Powder", slug: "hair-fall-powder", price: 249, image: "", desc: "herbal-powder" },
  ],
  "hair-growth": [
    { name: "Ayurvedic Hair Mask", slug: "ayurvedic-hair-mask", price: 349, image: "", desc: "hair-mask" },
    { name: "Amla Growth Serum", slug: "amla-growth-serum", price: 299, image: "", desc: "serum" },
    { name: "Hair Growth Combo", slug: "hair-growth-combo", price: 599, image: "", desc: "combo" },
  ],
  "dandruff": [
    { name: "Neem Anti-Dandruff Pack", slug: "neem-anti-dandruff", price: 249, image: "", desc: "hair-pack" },
    { name: "Shikakai Hair Powder", slug: "shikakai-hair-powder", price: 199, image: "", desc: "herbal-powder" },
    { name: "Scalp Care Bath Powder", slug: "scalp-bath-powder", price: 229, image: "", desc: "bath-powder" },
  ],
  "dry-damage": [
    { name: "Deep Conditioning Hair Mask", slug: "deep-conditioning-mask", price: 349, image: "", desc: "hair-mask" },
    { name: "Hibiscus Repair Mask", slug: "hibiscus-repair-mask", price: 299, image: "", desc: "hair-mask" },
    { name: "Repair & Shine Combo", slug: "repair-shine-combo", price: 549, image: "", desc: "combo" },
  ],
  "oily-scalp": [
    { name: "Multani Clay Scalp Pack", slug: "multani-scalp-pack", price: 229, image: "", desc: "face-pack" },
    { name: "Detan Face & Scalp Pack", slug: "detan-pack", price: 249, image: "", desc: "face-pack" },
    { name: "Balancing Hair Powder", slug: "balancing-hair-powder", price: 199, image: "", desc: "herbal-powder" },
  ],
};

/* ─── Filter products for a concern ───────────────────────────── */
function filterProducts(allProducts: any[], concern: (typeof CONCERNS)[number]) {
  if (!allProducts?.length) return null;
  const keywords = concern.searchKey;
  const scored = allProducts
    .map((p: any) => {
      const text = `${p.name ?? ""} ${p.tagline ?? ""} ${p.short_description ?? ""} ${p.ingredients ?? ""} ${p.category?.name ?? ""} ${p.category?.slug ?? ""}`.toLowerCase();
      const score = keywords.reduce((s, kw) => s + (text.includes(kw) ? 2 : 0), 0);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.p);

  // If nothing matches, return first 3 products as general recommendation
  return scored.length ? scored : allProducts.slice(0, 3);
}

/* ─── Product card inside the chooser ─────────────────────────── */
function ConcernProductCard({ p, accentColor }: { p: any; accentColor: string }) {
  const price = Number(p.price ?? 0);
  const image = p.cover_image ?? p.image ?? "";
  const slug = p.slug ?? "";
  const name = p.name ?? "Product";
  const desc = p.category?.name ?? p.desc ?? "";

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    cart.add({ id: p.id ?? slug, name, slug, price, image, size: p.size ?? null });
    toast.success(`${name} added to cart ✓`, {
      action: { label: "View Cart", onClick: () => (window.location.href = "/cart") },
    });
  }

  return (
    <Link
      to="/product/$slug"
      params={{ slug }}
      className="block bg-white border border-[#C8A86A]/30 hover:border-[#B07D2A]/60 transition-all duration-200 group"
    >
      <div className="aspect-[4/3] overflow-hidden bg-[#F7EDDA]">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="h-10 w-10 opacity-20" style={{ color: accentColor }} />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="font-display text-sm text-[#1A0F05] leading-snug line-clamp-2">{name}</div>
        {desc && <div className="font-wordmark text-[9px] text-[#7A5230] mt-1 uppercase">{desc}</div>}
        <div className="flex items-center justify-between mt-2.5">
          <span className="font-display text-base font-bold" style={{ color: accentColor }}>
            ₹{price}
          </span>
          <button
            onClick={quickAdd}
            className="flex items-center gap-1.5 text-[10px] font-wordmark tracking-wider uppercase px-3 py-1.5 text-white transition-all duration-200 hover:scale-105"
            style={{ background: accentColor }}
          >
            <ShoppingBag className="h-3 w-3" />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ─── Main component ───────────────────────────────────────────── */
export function HairConcernChooser({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeConcern, setActiveConcern] = useState<ConcernId>("hair-loss");

  // Fetch all products once — graceful no-op when Supabase offline
  const { data: allProducts } = useQuery({
    queryKey: ["products", "all-for-concern"],
    queryFn: () => getProducts({ data: {} }),
    staleTime: 5 * 60 * 1000,
  });

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const concern = CONCERNS.find((c) => c.id === activeConcern)!;
  const liveProducts = allProducts ? filterProducts(allProducts as any[], concern) : null;
  const products = liveProducts ?? STATIC_PRODUCTS[activeConcern].map((p) => ({ ...p, id: p.slug, cover_image: p.image }));

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — slides up from bottom on mobile, right side on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="What's your hair concern?"
        className="fixed z-[70] inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:w-[680px] flex flex-col"
        style={{ maxHeight: "92vh", backgroundColor: "#F7EDDA" }}
      >
        {/* Drag handle (mobile) */}
        <div className="md:hidden w-10 h-1 bg-[#C8A86A] rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#C8A86A]/40 flex-shrink-0 bg-[#2A1A08]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-display text-lg text-[#F8EDD8]">What's your hair concern?</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#F8EDD8]/60 hover:text-[#F8EDD8] transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Concern sidebar */}
          <div className="w-24 md:w-28 flex-shrink-0 bg-[#1A0F05] flex flex-col overflow-y-auto">
            {CONCERNS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConcern(c.id)}
                className={`flex flex-col items-center justify-center gap-1.5 py-4 px-2 text-center transition-all duration-200 border-l-2 ${
                  activeConcern === c.id
                    ? "border-[#B07D2A] bg-[#2A1A08]"
                    : "border-transparent hover:bg-[#2A1A08]/60"
                }`}
              >
                <span className="text-2xl leading-none">{c.icon}</span>
                <span className={`font-wordmark text-[9px] tracking-wide leading-tight ${activeConcern === c.id ? "text-[#E8C07A]" : "text-[#F8EDD8]/50"}`}>
                  {c.label.split(" ").map((w, i) => <span key={i} className="block">{w}</span>)}
                </span>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            {/* Concern banner */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b border-[#C8A86A]/30"
              style={{ background: concern.bg }}
            >
              <span className="text-3xl">{concern.icon}</span>
              <div>
                <div className="font-display text-base" style={{ color: concern.color }}>{concern.banner}</div>
                <div className="font-wordmark text-[9px] text-[#7A5230]">{concern.sub}</div>
              </div>
            </div>

            {/* Product grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {products.map((p: any, i: number) => (
                  <ConcernProductCard
                    key={p.id ?? p.slug ?? i}
                    p={p}
                    accentColor={concern.color}
                  />
                ))}
              </div>

              {/* Expert tips */}
              <div className="mt-5">
                <div className="font-wordmark text-[10px] text-[#B07D2A] tracking-widest uppercase mb-3 flex items-center gap-2">
                  <Leaf className="h-3.5 w-3.5" />
                  Dr. Kavya's Expert Tips
                </div>
                <div className="space-y-2">
                  {concern.tips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex gap-3 bg-white border border-[#C8A86A]/25 p-3"
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                        style={{ background: concern.color }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-xs text-[#3D2010] leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* View all link */}
              <Link
                to={concern.viewAll as any}
                onClick={onClose}
                className="mt-4 flex items-center justify-between w-full border border-[#C8A86A]/40 hover:border-[#B07D2A] px-4 py-3 text-xs font-wordmark tracking-wider text-[#2A1A08] hover:bg-[#2A1A08] hover:text-[#F8EDD8] transition-all duration-200"
              >
                <span>View all {concern.banner} products</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Trigger button ───────────────────────────────────────────── */
export function HairConcernTrigger({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`group flex items-center gap-2 bg-[#2A1A08] text-[#F8EDD8] font-wordmark text-[10px] tracking-widest uppercase px-5 py-3 hover:bg-[#B07D2A] transition-all duration-300 ${className}`}
      >
        <span className="text-base">🌿</span>
        Find My Solution
        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
      </button>
      <HairConcernChooser open={open} onClose={() => setOpen(false)} />
    </>
  );
}
