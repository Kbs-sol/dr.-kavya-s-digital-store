import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { getProductBySlug } from "@/lib/site.functions";
import { inr } from "@/lib/format";
import { cart } from "@/lib/cart";
import { toast } from "sonner";
import {
  Star, ShieldCheck, Leaf, Truck, Plus, Minus,
  CheckCircle, ChevronDown, ChevronUp, ArrowLeft, Share2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Buy ${params.slug.replace(/-/g, " ")} — Dr. Kavya's Hair & Skin Care` },
      { name: "robots", content: "index, follow" },
    ],
  }),
  loader: async ({ params, context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["product", params.slug],
      queryFn: () => getProductBySlug({ data: { slug: params.slug } }),
    });
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductBody slug={slug} />
    </Suspense>
  );
}

function ProductBody({ slug }: { slug: string }) {
  const { data: product } = useSuspenseQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-brand-brown mb-4">Product not found</h1>
        <Link to="/shop" className="btn-ghost">← Back to Shop</Link>
      </div>
    );
  }

  const price      = Number(product.price);
  const compareAt  = product.compare_at_price ? Number(product.compare_at_price) : 0;
  const savings    = compareAt > price ? compareAt - price : 0;
  const pct        = compareAt > price ? Math.round((savings / compareAt) * 100) : 0;
  const inStock    = (product.stock ?? 0) > 0;
  const images     = [product.cover_image, ...(product.images?.map((i: any) => i.url) ?? [])].filter(Boolean);
  const avgRating  = Number(product.rating ?? 5).toFixed(1);
  const reviewCount = product.review_count ?? product.reviews?.length ?? 0;

  /* ── Product JSON-LD (Google Shopping) ── */
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://drkavyas.in/product/${product.slug}`,
    name: product.name,
    description: product.short_description || product.description,
    image: images,
    sku: product.id,
    mpn: product.slug,
    brand: {
      "@type": "Brand",
      name: "Dr. Kavya's",
    },
    manufacturer: {
      "@type": "Organization",
      name: "Dr. Kavya's Hair & Skin Care",
      url: "https://drkavyas.in",
    },
    category: product.category?.name ?? "Hair & Skin Care",
    offers: {
      "@type": "Offer",
      url: `https://drkavyas.in/product/${product.slug}`,
      priceCurrency: "INR",
      price: price.toFixed(2),
      priceValidUntil: new Date(Date.now() + 90 * 86400 * 1000).toISOString().split("T")[0],
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Dr. Kavya's Hair & Skin Care",
        url: "https://drkavyas.in",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "79",
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 7,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        merchantReturnDays: 0,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
      review: (product.reviews ?? []).slice(0, 3).map((r: any) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.author_name },
        reviewRating: {
          "@type": "Rating",
          ratingValue: String(r.rating),
          bestRating: "5",
          worstRating: "1",
        },
        reviewBody: r.body,
        datePublished: r.created_at?.split("T")[0],
      })),
    }),
  };

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-2 text-[10px] font-wordmark text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand-brown transition">Home</Link>
        <span>›</span>
        <Link to="/shop" className="hover:text-brand-brown transition">Shop</Link>
        {product.category && (
          <>
            <span>›</span>
            <Link to="/shop" search={{ category: product.category.slug }} className="hover:text-brand-brown transition">
              {product.category.name}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-brand-brown">{product.name}</span>
      </nav>

      {/* Main product layout */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* LEFT: Images */}
          <ImageGallery images={images} name={product.name} />

          {/* RIGHT: Info */}
          <div className="space-y-7">
            {/* Category + badges */}
            <div className="flex flex-wrap gap-2 items-center">
              {product.category && (
                <span className="font-wordmark text-[9px] text-brand-gold">
                  {product.category.name.toUpperCase()}
                </span>
              )}
              {(product.badges ?? []).map((b: string) => (
                <span key={b} className={`badge-herb ${b === "Bestseller" ? "badge-bestseller" : b === "Doctor Formulated" ? "badge-doctor" : ""}`}>
                  {b}
                </span>
              ))}
            </div>

            {/* Name + tagline */}
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-brand-brown leading-tight">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="mt-3 text-lg text-muted-foreground leading-snug">{product.tagline}</p>
              )}
            </div>

            {/* Stars */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Number(avgRating)} />
                <span className="text-sm text-muted-foreground">
                  {avgRating} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-3xl text-brand-brown">{inr(price)}</span>
              {compareAt > price && (
                <span className="text-lg text-muted-foreground line-through">{inr(compareAt)}</span>
              )}
              {pct > 0 && (
                <span className="badge-herb badge-sale font-bold">Save {pct}%</span>
              )}
              {product.size && (
                <span className="text-sm text-muted-foreground border border-border px-2 py-1">{product.size}</span>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-[15px] text-foreground/75 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Add to cart */}
            <AddToCartBlock product={product} inStock={inStock} price={price} />

            {/* Trust signals */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { Icon: Truck, text: "Free delivery above ₹699" },
                { Icon: ShieldCheck, text: "Secure Razorpay checkout" },
                { Icon: Leaf, text: "100% Herbal · No chemicals" },
                { Icon: CheckCircle, text: "Doctor formulated formula" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-brand-green shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Product details accordion */}
            <ProductAccordion product={product} />
          </div>
        </div>

        {/* Reviews section */}
        {(product.reviews?.length ?? 0) > 0 && (
          <ReviewsSection product={product} />
        )}

        {/* Write review form */}
        <WriteReviewForm productId={product.id} />
      </div>
    </>
  );
}

/* ── Image Gallery ── */
function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const src = images[active] ?? "";

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square overflow-hidden bg-muted cursor-zoom-in"
        onClick={() => setZoomed(!zoomed)}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className={`h-full w-full object-cover transition-transform duration-300 ${zoomed ? "scale-150" : "scale-100"}`}
            fetchPriority="high"
          />
        ) : (
          <div className="h-full w-full bg-brand-tan/30 flex items-center justify-center">
            <Leaf className="h-12 w-12 text-brand-tan" />
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-brand-brown/70 text-brand-cream font-wordmark text-[9px] px-2 py-1">
            {active + 1}/{images.length}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.slice(0, 6).map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 overflow-hidden border-2 transition ${
                i === active ? "border-brand-brown" : "border-transparent hover:border-brand-tan"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Add to Cart block ── */
function AddToCartBlock({ product, inStock, price }: { product: any; inStock: boolean; price: number }) {
  const [qty, setQty] = useState(1);

  function addToCart() {
    cart.add({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price,
      image: product.cover_image ?? "",
      size: product.size ?? null,
    }, qty);
    toast.success(`${product.name} added to cart`);
    /* Fire Meta Pixel AddToCart event */
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddToCart", {
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: price * qty,
        currency: "INR",
      });
    }
    /* GA4 event */
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "add_to_cart", {
        currency: "INR",
        value: price * qty,
        items: [{ item_id: product.id, item_name: product.name, price, quantity: qty }],
      });
    }
  }

  return (
    <div className="space-y-4">
      {inStock ? (
        <>
          {/* Quantity selector */}
          <div className="flex items-center gap-0">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-10 border border-border flex items-center justify-center hover:bg-brand-brown/5 transition"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="w-14 h-10 border-y border-border flex items-center justify-center font-medium text-brand-brown">
              {qty}
            </div>
            <button
              onClick={() => setQty((q) => Math.min(product.stock ?? 99, q + 1))}
              className="w-10 h-10 border border-border flex items-center justify-center hover:bg-brand-brown/5 transition"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="ml-4 text-xs text-muted-foreground">
              {product.stock < 10 ? (
                <span className="text-brand-red font-medium">Only {product.stock} left</span>
              ) : (
                "In stock"
              )}
            </span>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={addToCart}
            className="btn-primary btn-shimmer w-full py-4 text-sm justify-center"
          >
            Add to Cart — {inr(price * qty)}
          </button>

          {/* Direct checkout */}
          <Link
            to="/checkout"
            onClick={addToCart}
            className="btn-ghost w-full justify-center text-center py-3.5"
          >
            Buy Now
          </Link>
        </>
      ) : (
        <div className="bg-muted border border-border px-6 py-4 text-sm text-center text-muted-foreground">
          Currently out of stock — check back soon or{" "}
          <a href="https://wa.me/917780211653" className="text-brand-gold underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            WhatsApp us
          </a>
        </div>
      )}
    </div>
  );
}

/* ── Product Info Accordion ── */
function ProductAccordion({ product }: { product: any }) {
  const sections = [
    { t: "Full Description", content: product.description },
    { t: "Ingredients", content: product.ingredients },
    { t: "How to Use", content: product.how_to_use },
    {
      t: "Shipping & Returns",
      content: `Free shipping on orders above ₹699. Standard delivery ₹79. Delivery within 3–7 business days across India. As a hygiene policy, opened cosmetic products cannot be returned or exchanged.`,
    },
  ].filter((s) => s.content);

  return (
    <div className="border-t border-border">
      {sections.map((s) => <AccordionRow key={s.t} title={s.t} content={s.content!} />)}
    </div>
  );
}

function AccordionRow({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-left group"
        aria-expanded={open}
      >
        <span className="font-wordmark text-[10px] text-brand-brown group-hover:text-brand-gold transition">
          {title}
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="pb-5 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {content}
        </div>
      )}
    </div>
  );
}

/* ── Star Rating ── */
function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(value) ? "fill-brand-mustard text-brand-mustard" : "text-muted"}`}
        />
      ))}
    </div>
  );
}

/* ── Reviews Section ── */
function ReviewsSection({ product }: { product: any }) {
  const avg = Number(product.rating ?? 5);
  const count = product.review_count ?? product.reviews?.length ?? 0;
  return (
    <section className="mt-16 pt-10 border-t border-border" aria-label="Customer Reviews">
      <div className="mb-8">
        <div className="font-wordmark text-[9px] text-brand-gold mb-3">Customer Reviews</div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-display text-5xl text-brand-brown">{avg.toFixed(1)}</div>
            <StarRating value={avg} />
            <div className="text-xs text-muted-foreground mt-1">{count} reviews</div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {(product.reviews ?? []).map((r: any) => (
          <article key={r.id} className="testimonial-card">
            <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
              <div>
                <div className="font-medium text-brand-brown text-sm">{r.author_name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                </div>
              </div>
              <StarRating value={r.rating} />
            </div>
            {r.title && <h3 className="font-medium text-sm text-brand-brown mb-2">{r.title}</h3>}
            {r.body && <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{r.body}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── Write Review Form ── */
function WriteReviewForm({ productId }: { productId: string }) {
  const [form, setForm] = useState({ author_name: "", rating: 5, title: "", body: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user?.id ?? null,
        author_name: form.author_name,
        rating: form.rating,
        title: form.title,
        body: form.body,
        approved: false,
      });
      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 border-t border-border pt-8">
      {!open && !done && (
        <button onClick={() => setOpen(true)} className="btn-ghost text-[10px]">
          Write a review
        </button>
      )}
      {open && !done && (
        <form onSubmit={submit} className="max-w-lg space-y-4">
          <div className="font-wordmark text-[10px] text-brand-gold mb-4">Leave a Review</div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Your Name *</label>
            <input required className="form-input" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="Priya S." />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Rating *</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}>
                  <Star className={`h-6 w-6 transition ${s <= form.rating ? "fill-brand-mustard text-brand-mustard" : "text-border hover:text-brand-tan"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Headline (optional)</label>
            <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Changed my hair in 2 weeks!" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Your experience *</label>
            <textarea required className="form-input" rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Tell us about your results…" />
          </div>
          <div className="flex gap-3">
            <button disabled={loading} className="btn-primary" type="submit">
              {loading ? "Submitting…" : "Submit Review"}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
          <p className="text-[10px] text-muted-foreground">Reviews are approved within 24 hours.</p>
        </form>
      )}
      {done && (
        <div className="flex items-center gap-3 text-brand-green">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm">Thank you! Your review is pending approval.</span>
        </div>
      )}
    </div>
  );
}

/* ── Skeleton ── */
function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="space-y-4">
        <div className="h-3 bg-muted w-24 rounded" />
        <div className="h-10 bg-muted w-3/4 rounded" />
        <div className="h-4 bg-muted w-1/2 rounded" />
        <div className="h-8 bg-muted w-28 rounded" />
        <div className="h-12 bg-muted rounded" />
      </div>
    </div>
  );
}
