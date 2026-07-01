import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useRef, useState } from "react";
import { getProducts, getTestimonials } from "@/lib/site.functions";
import { ProductCard } from "@/components/ProductCard";
import { Testimonials } from "@/components/Testimonials";
import heroImg from "@/assets/hero-flatlay.jpg";
import storyImg from "@/assets/story.jpg";
import { Leaf, Sparkles, ShieldCheck, HeartHandshake, Star, ArrowRight, ChevronRight, Truck, RotateCcw, Lock, Phone } from "lucide-react";

export const Route = createFileRoute("/")(  {
  head: () => ({
    meta: [
      { title: "Dr. Kavya's — Handmade Ayurvedic Hair & Skin Care | Visakhapatnam" },
      { name: "description", content: "Pure Ayurvedic hair & skin care handcrafted in Visakhapatnam by Dr. Kavya Reddy. 100% herbal, no chemicals, no preservatives. Free shipping above ₹499." },
      { name: "keywords", content: "ayurvedic hair care vizag, natural skin care visakhapatnam, nalugu pindi, herbal hair powder, Dr Kavya Reddy" },
    ],
    links: [
      { rel: "canonical", href: "https://drkavyas.in/" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["products", { featured: true }],
      queryFn: () => getProducts({ data: { featured: true } }),
    });
    await context.queryClient.prefetchQuery({
      queryKey: ["testimonials", { featured: true }],
      queryFn: () => getTestimonials({ data: { featured: true } }),
    });
  },
  component: Home,
});

/* ─── Scroll reveal hook ──────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect(); } }, { threshold });
    ob.observe(el);
    return () => ob.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Animated number counter ────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(to / 40);
    const id = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(start);
      if (start >= to) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [visible, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Trust ticker ────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "🌿 100% Herbal Ingredients",
  "🔬 Doctor Formulated",
  "🏭 Small Batch · Handmade",
  "🚚 Free Shipping ₹499+",
  "✨ No Sulphates No Parabens",
  "🌸 Cold-Processed",
  "💚 Cruelty Free",
  "📦 Prepaid Orders Only",
  "🇮🇳 Made in Visakhapatnam",
];

function TrustTicker() {
  return (
    <div className="bg-brand-brown text-brand-cream overflow-hidden py-2.5">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 font-wordmark text-[10px] tracking-widest uppercase mx-6">
            {item} <span className="text-brand-tan/50">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Hero ────────────────────────────────────────────────────── */
function Hero() {
  const { ref, visible } = useReveal(0);

  return (
    <section className="relative overflow-hidden bg-[#FBF6EA]">
      {/* Decorative background grain */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] pointer-events-none" />

      <div ref={ref} className={`max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-0 items-stretch min-h-[88vh] transition-all duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}>

        {/* Left column — copy */}
        <div className="flex flex-col justify-center py-16 md:py-24 md:pr-16 order-2 md:order-1">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-px bg-brand-gold" />
            <span className="font-wordmark text-[10px] text-brand-gold tracking-[0.25em] uppercase">Founded by Dr. Kavya Reddy · Vizag</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-[5.5rem] text-brand-brown leading-[0.9] tracking-tight">
            Roots.
            <br />
            <em className="text-brand-green not-italic">Flowers.</em>
            <br />
            <span className="relative">
              Healing.
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 8" fill="none">
                <path d="M0 6 Q75 0 150 5 Q225 10 300 4" stroke="#8A6D3B" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="mt-8 max-w-[400px] text-base md:text-lg text-foreground/70 leading-relaxed font-sans">
            Handcrafted Ayurvedic remedies made from roots, flowers and herbs.
            No chemicals. No preservatives.{" "}
            <em className="font-hand text-brand-brown text-xl not-italic">Just pure care.</em>
          </p>

          {/* Social proof micro-stats */}
          <div className="mt-8 flex items-center gap-1 flex-wrap">
            <div className="flex -space-x-2 mr-3">
              {["#C2462E", "#8A6D3B", "#5E7142", "#D4B483", "#3D2F1A"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#FBF6EA] flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: c }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <div className="flex text-amber-400 text-xs">{"★★★★★"}</div>
              <p className="font-wordmark text-[9px] text-foreground/60 tracking-wider">1,200+ HAPPY CUSTOMERS</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 bg-brand-brown text-brand-cream font-wordmark text-[11px] tracking-widest uppercase px-8 py-4 hover:bg-brand-gold transition-all duration-300"
            >
              Shop All Products
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 border border-brand-brown/30 text-brand-brown font-wordmark text-[11px] tracking-widest uppercase px-8 py-4 hover:border-brand-brown hover:bg-brand-cream transition-all duration-300"
            >
              Take Hair Quiz
            </Link>
          </div>

          {/* Trust pillars row */}
          <div className="mt-12 flex gap-6 flex-wrap">
            {[
              { label: "Herbal", sub: "100%" },
              { label: "Paraben Free", sub: "Always" },
              { label: "Handmade", sub: "In Vizag" },
            ].map(({ label, sub }) => (
              <div key={label} className="text-center">
                <div className="font-display text-2xl text-brand-brown">{sub}</div>
                <div className="font-wordmark text-[9px] text-foreground/50 tracking-widest uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — image */}
        <div className="relative order-1 md:order-2 min-h-[50vw] md:min-h-0">
          <div className="absolute inset-0">
            <img
              src={heroImg}
              alt="Dr. Kavya's handcrafted Ayurvedic product range laid flat"
              className="w-full h-full object-cover"
              width={1600}
              height={1280}
              loading="eager"
            />
            {/* Overlay gradient for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FBF6EA]/60 via-transparent to-transparent md:hidden" />
          </div>

          {/* Floating credential card */}
          <div className="absolute bottom-8 right-8 bg-brand-cream/95 backdrop-blur border border-brand-tan/40 p-5 shadow-xl max-w-[180px] hidden md:block">
            <div className="font-hand text-2xl text-brand-brown leading-tight">"made by<br/>my mom"</div>
            <div className="font-wordmark text-[9px] text-brand-gold mt-2 tracking-widest">— Small batches, weekly</div>
          </div>

          {/* New arrivals badge */}
          <div className="absolute top-8 left-8 md:left-auto md:right-8 bg-brand-green text-brand-cream font-wordmark text-[9px] tracking-widest uppercase px-3 py-2">
            New: Nalugu Pindi
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Announcement banner (below hero) ───────────────────────── */
function AnnouncementBanner() {
  return (
    <div className="bg-brand-cream border-y border-brand-tan/30 py-3">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-6 md:gap-12">
        {[
          { Icon: Truck, text: "Free delivery above ₹499" },
          { Icon: RotateCcw, text: "Easy returns within 7 days" },
          { Icon: Lock, text: "100% secure checkout" },
          { Icon: Phone, text: "WhatsApp support 9AM–6PM" },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-2 font-wordmark text-[10px] text-foreground/60 tracking-wider uppercase">
            <Icon className="h-3.5 w-3.5 text-brand-green flex-shrink-0" />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Pillars ─────────────────────────────────────────────────── */
function Pillars() {
  const { ref, visible } = useReveal();
  const items = [
    { Icon: Leaf, t: "100% Herbal", d: "Only roots, flowers, leaves and oils — nothing synthetic." },
    { Icon: ShieldCheck, t: "Doctor Vetted", d: "Refined by Dr. Kavya Reddy and trusted by 1,200+ customers." },
    { Icon: Sparkles, t: "Cold-Processed", d: "Sun-dried and stone-ground to retain every active phytonutrient." },
    { Icon: HeartHandshake, t: "Hand-Packed", d: "Each pouch is weighed, sealed and signed by our small Vizag team." },
  ];
  return (
    <section ref={ref} className={`border-b border-border bg-white transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
        {items.map(({ Icon, t, d }) => (
          <div key={t} className="bg-white p-8 flex flex-col gap-3 hover:bg-brand-cream transition-colors duration-300">
            <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center">
              <Icon className="h-5 w-5 text-brand-green" />
            </div>
            <div className="font-wordmark text-[11px] tracking-widest uppercase text-brand-brown mt-2">{t}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Featured Products (with in-page buying) ────────────────── */
function FeaturedProducts() {
  const { data: products = [] } = useSuspenseQuery({
    queryKey: ["products", { featured: true }],
    queryFn: () => getProducts({ data: { featured: true } }),
  });
  const { ref, visible } = useReveal();

  if (!products.length) return null;

  return (
    <section ref={ref} className={`py-20 md:py-28 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-px bg-brand-gold" />
              <span className="font-wordmark text-[10px] text-brand-gold tracking-[0.25em] uppercase">The Apothecary</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-brand-brown leading-tight">
              Shop the Collection
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md">
              Every product handcrafted in small batches from time-tested Ayurvedic recipes.
            </p>
          </div>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 font-wordmark text-[10px] text-brand-brown tracking-widest uppercase border-b border-brand-brown pb-0.5 hover:text-brand-gold hover:border-brand-gold transition"
          >
            View all products
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.slice(0, 8).map((p: any) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-brand-green text-brand-cream font-wordmark text-[11px] tracking-widest uppercase px-10 py-4 hover:bg-brand-brown transition-all duration-300"
          >
            Browse Full Collection
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Story strip ─────────────────────────────────────────────── */
function StoryStrip() {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} className={`bg-brand-brown text-brand-cream overflow-hidden transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-0 items-stretch">
        <div className="py-16 md:py-24 md:pr-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-brand-tan/40" />
            <span className="font-wordmark text-[10px] text-brand-tan/70 tracking-[0.25em] uppercase">Our Story</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            A doctor's daughter,<br />
            <em className="text-brand-tan">her mother's recipes.</em>
          </h2>
          <p className="mt-6 text-brand-cream/70 leading-relaxed max-w-md">
            Dr. Kavya Reddy grew up watching her mother grind herbs, dry roots and blend oils in their Visakhapatnam kitchen.
            After years in medicine, she came back to those roots — literally.
          </p>
          <p className="mt-4 text-brand-cream/70 leading-relaxed max-w-md">
            Every product you order is made in small batches, packed by hand, and shipped within days — not weeks.
          </p>
          <Link
            to="/story"
            className="mt-8 inline-flex items-center gap-2 border border-brand-cream/30 text-brand-cream font-wordmark text-[11px] tracking-widest uppercase px-8 py-4 hover:border-brand-cream hover:bg-brand-cream/10 transition-all duration-300"
          >
            Read Our Story
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="relative min-h-[400px]">
          <img
            src={storyImg}
            alt="Dr. Kavya Reddy in her Visakhapatnam workshop"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

/* ─── Ingredients showcase ────────────────────────────────────── */
const INGREDIENTS = [
  { name: "Bhringraj", benefit: "Hair fall prevention", emoji: "🌿" },
  { name: "Hibiscus", benefit: "Scalp nourishment", emoji: "🌺" },
  { name: "Amla", benefit: "Natural conditioner", emoji: "🫒" },
  { name: "Shikakai", benefit: "Gentle cleansing", emoji: "🌾" },
  { name: "Neem", benefit: "Anti-dandruff", emoji: "🍃" },
  { name: "Turmeric", benefit: "Skin brightening", emoji: "✨" },
];

function IngredientsSection() {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} className={`py-20 md:py-28 bg-[#F5EAD7]/40 border-y border-border transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-6 h-px bg-brand-gold" />
            <span className="font-wordmark text-[10px] text-brand-gold tracking-[0.25em] uppercase">What's Inside</span>
            <span className="w-6 h-px bg-brand-gold" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-brand-brown">Nature's finest, nothing else.</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Every ingredient is sourced from trusted farms across India and processed without heat.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {INGREDIENTS.map(({ name, benefit, emoji }) => (
            <div key={name} className="group bg-white border border-border p-6 text-center hover:border-brand-gold hover:shadow-lg transition-all duration-300 cursor-default">
              <div className="text-3xl mb-3">{emoji}</div>
              <div className="font-display text-lg text-brand-brown mb-1">{name}</div>
              <div className="text-xs text-muted-foreground">{benefit}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/ingredients" className="font-wordmark text-[10px] text-brand-gold tracking-widest uppercase inline-flex items-center gap-2 hover:text-brand-brown transition">
            See all ingredients <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Social proof numbers ────────────────────────────────────── */
function SocialProof() {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} className={`py-16 bg-white border-b border-border transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {[
            { n: 1200, suffix: "+", label: "Happy Customers" },
            { n: 3, suffix: "", label: "Handcrafted Products" },
            { n: 100, suffix: "%", label: "Natural Ingredients" },
            { n: 4, suffix: ".8★", label: "Average Rating" },
          ].map(({ n, suffix, label }) => (
            <div key={label} className="bg-white text-center py-10 px-4">
              <div className="font-display text-4xl md:text-5xl text-brand-brown">
                <Counter to={n} suffix={suffix} />
              </div>
              <div className="font-wordmark text-[10px] text-muted-foreground tracking-widest uppercase mt-2">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ────────────────────────────────────────────── */
function TestimonialsBlock() {
  const { data: testimonials = [] } = useSuspenseQuery({
    queryKey: ["testimonials", { featured: true }],
    queryFn: () => getTestimonials({ data: { featured: true } }),
  });
  const { ref, visible } = useReveal();

  if (!testimonials.length) return null;
  return (
    <section ref={ref} className={`py-20 md:py-28 bg-[#FBF6EA] transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="w-6 h-px bg-brand-gold" />
          <span className="font-wordmark text-[10px] text-brand-gold tracking-[0.25em] uppercase">From Our Customers</span>
          <span className="w-6 h-px bg-brand-gold" />
        </div>
        <h2 className="font-display text-4xl md:text-5xl text-brand-brown text-center mb-14">What people say</h2>
        <Testimonials testimonials={testimonials} />
      </div>
    </section>
  );
}

/* ─── Process ─────────────────────────────────────────────────── */
function Process() {
  const { ref, visible } = useReveal();
  const steps = [
    { n: "01", t: "You order", d: "Browse the collection, pick your products and pay securely via Razorpay." },
    { n: "02", t: "We make it", d: "Your order triggers a fresh batch — made to order, not sitting on a shelf." },
    { n: "03", t: "Hand packed", d: "Each pouch is weighed, labelled and heat-sealed by our Vizag team." },
    { n: "04", t: "Ships to you", d: "Dispatched within 2–3 business days. Tracking link sent via email." },
  ];
  return (
    <section ref={ref} className={`py-20 md:py-28 border-y border-border transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-6 h-px bg-brand-gold" />
            <span className="font-wordmark text-[10px] text-brand-gold tracking-[0.25em] uppercase">How It Works</span>
            <span className="w-6 h-px bg-brand-gold" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-brand-brown">From our kitchen to your doorstep</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-px bg-border">
          {steps.map(({ n, t, d }) => (
            <div key={n} className="bg-white p-8 group hover:bg-brand-cream transition-colors duration-300">
              <div className="font-display text-5xl text-brand-tan/60 group-hover:text-brand-gold transition-colors duration-300">{n}</div>
              <div className="font-wordmark text-[11px] tracking-widest uppercase text-brand-brown mt-4 mb-2">{t}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Instagram CTA ───────────────────────────────────────────── */
function InstagramCTA() {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} className={`py-16 bg-brand-brown text-brand-cream transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="font-hand text-4xl md:text-5xl mb-4">Join our community</div>
        <p className="font-wordmark text-[10px] text-brand-tan/70 tracking-widest uppercase mb-6">
          Follow @drkavyas.in on Instagram for hair care tips, new arrivals & behind the scenes
        </p>
        <a
          href="https://www.instagram.com/drkavyas.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-brand-cream/30 text-brand-cream font-wordmark text-[11px] tracking-widest uppercase px-8 py-4 hover:border-brand-cream hover:bg-brand-cream/10 transition-all duration-300"
        >
          Follow on Instagram
        </a>
      </div>
    </section>
  );
}

/* ─── Newsletter ──────────────────────────────────────────────── */
function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert({ email, subscribed: true }, { onConflict: "email" });
      if (error) throw error;
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  const { ref, visible } = useReveal();

  return (
    <section ref={ref} className={`py-16 bg-[#F5EAD7]/60 border-t border-border transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="w-6 h-px bg-brand-gold" />
          <span className="font-wordmark text-[10px] text-brand-gold tracking-[0.25em] uppercase">Stay In Touch</span>
          <span className="w-6 h-px bg-brand-gold" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-brand-brown mb-3">
          Tips, restocks & early access
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Join 500+ subscribers. No spam — just good hair days.
        </p>
        {state === "done" ? (
          <p className="font-wordmark text-[11px] text-brand-green tracking-widest uppercase">✓ You're on the list! Watch your inbox.</p>
        ) : (
          <form onSubmit={subscribe} className="flex gap-0 max-w-sm mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 border border-border border-r-0 px-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-brown"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="bg-brand-brown text-brand-cream font-wordmark text-[10px] tracking-widest uppercase px-6 py-3 hover:bg-brand-gold transition-colors disabled:opacity-50"
            >
              {state === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}
        {state === "error" && (
          <p className="text-xs text-brand-red mt-2">Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  );
}

/* ─── Promise section ─────────────────────────────────────────── */
function Promise() {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} className={`py-20 bg-[#FFFBF1] border-t border-border transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              title: "Our Promise",
              body: "Every batch is made fresh. If you're ever unhappy with a product, we'll make it right — no questions asked.",
              cta: { label: "Contact us", to: "/contact" },
            },
            {
              title: "Shipping",
              body: "We dispatch within 2–3 business days. Free delivery on orders above ₹499. Tracking link sent via WhatsApp & email.",
              cta: { label: "Track your order", to: "/track" },
            },
            {
              title: "Returns",
              body: "Unopened products can be returned within 7 days of delivery. We cover return shipping for damaged or wrong items.",
              cta: { label: "Return policy", to: "/faq" },
            },
          ].map(({ title, body, cta }) => (
            <div key={title}>
              <div className="w-8 h-px bg-brand-gold mb-5" />
              <h3 className="font-display text-2xl text-brand-brown mb-3">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{body}</p>
              <Link to={cta.to} className="font-wordmark text-[10px] text-brand-gold tracking-widest uppercase inline-flex items-center gap-1 hover:text-brand-brown transition">
                {cta.label} <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── JSON-LD ─────────────────────────────────────────────────── */
function HomeSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://drkavyas.in/#org",
        "name": "Dr. Kavya's Hair & Skin Care",
        "url": "https://drkavyas.in",
        "logo": "https://drkavyas.in/logo.png",
        "sameAs": ["https://www.instagram.com/drkavyas.in/"],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Visakhapatnam",
          "addressRegion": "Andhra Pradesh",
          "addressCountry": "IN",
        },
        "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "availableLanguage": ["Telugu", "English", "Hindi"] },
      },
      {
        "@type": "WebSite",
        "@id": "https://drkavyas.in/#website",
        "url": "https://drkavyas.in",
        "name": "Dr. Kavya's",
        "potentialAction": { "@type": "SearchAction", "target": "https://drkavyas.in/search?q={query}", "query-input": "required name=query" },
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

/* ─── Page ────────────────────────────────────────────────────── */
function Home() {
  return (
    <>
      <HomeSchema />
      <TrustTicker />
      <Hero />
      <AnnouncementBanner />
      <Pillars />
      <Suspense fallback={<div className="h-[600px] bg-white flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>}>
        <FeaturedProducts />
      </Suspense>
      <StoryStrip />
      <IngredientsSection />
      <SocialProof />
      <Suspense fallback={<div className="h-[400px]" />}>
        <TestimonialsBlock />
      </Suspense>
      <Process />
      <InstagramCTA />
      <Newsletter />
      <Promise />
    </>
  );
}
