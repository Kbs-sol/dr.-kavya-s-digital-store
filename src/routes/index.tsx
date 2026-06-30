import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { getProducts, getTestimonials } from "@/lib/site.functions";
import { ProductCard } from "@/components/ProductCard";
import { Section } from "@/components/Section";
import { Testimonials } from "@/components/Testimonials";
import heroImg from "@/assets/hero-flatlay.jpg";
import storyImg from "@/assets/story.jpg";
import ingredientsImg from "@/assets/ingredients.jpg";
import {
  Leaf, Sparkles, ShieldCheck, HeartHandshake,
  Truck, RefreshCw, Star, ArrowRight, Instagram
} from "lucide-react";

/* ── Structured Data helpers ── */
const homepageLdJson = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://drkavyas.in/",
  name: "Dr. Kavya's Hair & Skin Care — Handmade Ayurvedic Apothecary",
  description:
    "Shop 100% herbal Ayurvedic hair and skin care handcrafted in Visakhapatnam by Dr. Kavya Reddy. Hair Fall Control Mask, Face Packs, Bath Powder and more.",
  url: "https://drkavyas.in/",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://drkavyas.in/" }],
  },
  mainEntity: {
    "@type": "ItemList",
    name: "Featured Herbal Products",
    description: "Bestselling Ayurvedic hair and skin care products by Dr. Kavya Reddy",
  },
};

const localBusinessLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HealthAndBeautyBusiness"],
  name: "Dr. Kavya's Hair & Skin Care",
  image: "https://drkavyas.in/og-image.jpg",
  "@id": "https://drkavyas.in/#localbiz",
  url: "https://drkavyas.in",
  telephone: "+91-7780-211-653",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Visakhapatnam",
    addressLocality: "Visakhapatnam",
    addressRegion: "Andhra Pradesh",
    postalCode: "530001",
    addressCountry: "IN",
  },
  geo: { "@type": "GeoCoordinates", latitude: 17.6868, longitude: 83.2185 },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "09:00", closes: "21:00" },
  ],
  sameAs: [
    "https://www.instagram.com/kavyas_hairandskincare/",
    "https://www.instagram.com/dr.kavya_reddy__/",
  ],
  priceRange: "₹149 - ₹2499",
  currenciesAccepted: "INR",
  paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking",
  areaServed: { "@type": "Country", name: "India" },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dr. Kavya's Hair & Skin Care — Handmade Ayurvedic Apothecary, Visakhapatnam" },
      {
        name: "description",
        content:
          "Shop 100% herbal Ayurvedic hair and skin care crafted in Visakhapatnam by Dr. Kavya Reddy. Hair Fall Control Mask ₹649, Face Pack ₹449, Nalugu Pindi Bath Powder ₹399. No chemicals, no preservatives. Ships pan-India.",
      },
      { property: "og:title", content: "Dr. Kavya's Hair & Skin Care — Handmade Ayurvedic Apothecary" },
      { property: "og:url", content: "https://drkavyas.in/" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(homepageLdJson) },
      { type: "application/ld+json", children: JSON.stringify(localBusinessLd) },
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

function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Pillars />
      <Suspense fallback={<div className="h-[520px] bg-kraft" />}>
        <Featured />
      </Suspense>
      <StoryStrip />
      <IngredientsSection />
      <Suspense fallback={<div className="h-[420px]" />}>
        <TestimonialsBlock />
      </Suspense>
      <Process />
      <GeoTargetBanner />
      <Promise />
      <NewsletterSection />
    </>
  );
}

/* ─── HERO ─────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="bg-kraft border-b border-border overflow-hidden" aria-label="Hero">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center py-14 md:py-24">
        {/* LEFT: Copy */}
        <div className="fade-in-up">
          <div className="font-wordmark text-[9px] text-brand-gold mb-5 flex items-center gap-2">
            <Star className="h-3 w-3 fill-brand-gold text-brand-gold" />
            Founded by Dr. Kavya Reddy · Visakhapatnam, Andhra Pradesh
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-[5.5rem] text-brand-brown leading-[0.92]">
            Pure hair and<br />
            skin{" "}
            <em className="text-brand-green italic">wellness.</em>
          </h1>
          <p className="mt-7 max-w-md text-[15px] text-foreground/70 leading-relaxed">
            Handcrafted Ayurvedic remedies, made in my mother's kitchen from
            roots, flowers and herbs grown in Andhra Pradesh. No chemicals.
            No preservatives. Just pure care.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/shop" className="btn-primary btn-shimmer">
              Shop the Apothecary
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/story" className="btn-ghost">
              Our Story
            </Link>
          </div>

          {/* Social proof mini stats */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm">
            {[
              { n: "1,000+", l: "Happy customers" },
              { n: "100%", l: "Herbal & natural" },
              { n: "5★", l: "Average rating" },
            ].map(({ n, l }) => (
              <div key={l} className="border-l-2 border-brand-tan pl-3">
                <div className="font-display text-xl text-brand-brown">{n}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Hero image */}
        <div className="relative fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="product-img-wrap">
            <img
              src={heroImg}
              alt="Dr. Kavya's Ayurvedic herbal product range — hair and skin care powders in kraft pouches"
              width={1600}
              height={1280}
              className="w-full object-cover aspect-[5/4] shadow-xl"
              fetchPriority="high"
            />
          </div>
          {/* Handwritten overlay card */}
          <div className="absolute -bottom-5 -left-4 md:-left-8 bg-card border border-border px-5 py-4 shadow-md hidden md:block">
            <div className="font-hand text-2xl text-brand-brown leading-tight">"made by my mom"</div>
            <div className="font-wordmark text-[9px] text-brand-gold mt-1">— small batches, every week</div>
          </div>
          {/* Badge */}
          <div className="absolute top-4 right-4 bg-brand-brown/90 text-brand-cream px-3 py-1.5">
            <div className="font-wordmark text-[9px]">Doctor<br/>Formulated</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── TRUST BAR ─────────────────────────────────────────── */
function TrustBar() {
  const items = [
    "🌿 100% Herbal",
    "🚫 No Chemicals",
    "👩‍⚕️ Doctor Formulated",
    "🏺 Handmade in Vizag",
    "🎁 Ships Pan-India",
    "💌 Free above ₹699",
  ];
  return (
    <div className="bg-brand-brown text-brand-cream/80 overflow-hidden border-b border-brand-brown/50">
      <div className="flex whitespace-nowrap gap-12 py-2.5 px-6 font-wordmark text-[9px] tracking-widest uppercase overflow-x-auto scrollbar-none">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="shrink-0">{item}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── PILLARS ────────────────────────────────────────────── */
function Pillars() {
  const items = [
    { Icon: Leaf, t: "100% Herbal", d: "Only roots, flowers, leaves and oils sourced from trusted Andhra farms. Nothing synthetic, nothing artificial." },
    { Icon: ShieldCheck, t: "Doctor Vetted", d: "Every formula is refined by Dr. Kavya Reddy — a practicing dentist who started this brand to solve her own hair fall." },
    { Icon: Sparkles, t: "Cold-Processed", d: "Sun-dried for 7–10 days and stone-ground in small batches to retain every active phytonutrient." },
    { Icon: HeartHandshake, t: "Hand-Packed", d: "Each pouch is weighed, sealed and tagged by our small Vizag team with a handwritten thank-you note." },
  ];
  return (
    <div className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map(({ Icon, t, d }) => (
          <div key={t} className="flex flex-col items-start gap-3 group">
            <div className="w-10 h-10 bg-brand-green/10 flex items-center justify-center border border-brand-green/20 group-hover:bg-brand-green/20 transition">
              <Icon className="h-4 w-4 text-brand-green" />
            </div>
            <div className="font-wordmark text-[10px] text-brand-brown">{t}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── FEATURED PRODUCTS ──────────────────────────────────── */
function Featured() {
  const { data } = useSuspenseQuery({
    queryKey: ["products", { featured: true }],
    queryFn: () => getProducts({ data: { featured: true } }),
  });
  return (
    <Section
      eyebrow="Bestsellers"
      title="Loved by"
      italic="our community"
      subtitle="From hair-fall control to glow-restoring face packs — these are the rituals our customers reorder, gift and write home about."
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {data.slice(0, 8).map((p: any) => <ProductCard key={p.id} p={p} />)}
      </div>
      <div className="mt-14 text-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 font-wordmark text-[11px] text-brand-brown border-b border-brand-brown/40 pb-1 hover:border-brand-brown transition"
        >
          View the full apothecary
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Section>
  );
}

/* ─── STORY STRIP ────────────────────────────────────────── */
function StoryStrip() {
  return (
    <section className="bg-brand-brown text-brand-cream overflow-hidden" aria-label="Founder Story">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
        <div className="product-img-wrap">
          <img
            src={storyImg}
            alt="Dr. Kavya Reddy — Dentist and founder of Dr. Kavya's Hair & Skin Care, Visakhapatnam"
            width={1280}
            height={1600}
            loading="lazy"
            className="w-full h-full object-cover aspect-[4/5] md:aspect-auto"
          />
        </div>
        <div className="px-8 py-14 md:px-16 md:py-20 flex flex-col justify-center">
          <div className="font-wordmark text-[9px] text-brand-tan mb-6 flex items-center gap-2">
            <span className="inline-block w-8 h-px bg-brand-tan/50" />
            A doctor's story
          </div>
          <h2 className="font-display text-4xl md:text-5xl leading-[1.08]">
            I'm a dentist who couldn't stop her own{" "}
            <em className="text-brand-tan">hair fall.</em>
          </h2>
          <p className="mt-6 leading-relaxed text-brand-cream/75 max-w-md text-[15px]">
            After years of spending on commercial brands that promised everything
            and delivered nothing, I went back to the kitchen where my mother
            used to grind herbs every weekend. That's where Dr. Kavya's was
            born — slow, small-batch, and honest.
          </p>
          <blockquote className="mt-8 quote-block border-brand-tan/40 pl-5">
            <p className="font-display italic text-lg text-brand-cream/85 leading-relaxed">
              "Made by my mom — full of natural roots and flowers. No chemicals.
              No preservatives. Just pure care."
            </p>
          </blockquote>
          <Link
            to="/story"
            className="mt-8 inline-flex items-center gap-2 font-wordmark text-[11px] text-brand-tan border-b border-brand-tan/40 pb-1 self-start hover:text-brand-cream hover:border-brand-cream transition"
          >
            Read the full story
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── INGREDIENTS HIGHLIGHT ──────────────────────────────── */
function IngredientsSection() {
  const herbs = [
    { name: "Bhringraj", aka: "King of Hair Herbs", benefit: "Strengthens roots, reduces hair fall, promotes regrowth" },
    { name: "Amla", aka: "Indian Gooseberry", benefit: "Rich in Vitamin C, nourishes scalp, prevents premature greying" },
    { name: "Hibiscus", aka: "Hair's best friend", benefit: "Conditions hair, reduces dandruff, adds natural shine" },
    { name: "Sandalwood", aka: "Chandan", benefit: "Brightens skin, reduces tan, calms inflammation" },
    { name: "Turmeric", aka: "Haldi", benefit: "Antibacterial, reduces acne, evens skin tone" },
    { name: "Green Gram", aka: "Pesarapappu", benefit: "Gentle exfoliant, removes dead skin, brightens complexion" },
  ];
  return (
    <section className="border-y border-border bg-kraft" aria-label="Key Ingredients">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="font-wordmark text-[9px] text-brand-gold mb-4">
            <span className="divider-botanical"><span>What's inside every pouch</span></span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-brand-brown">
            Ingredients you can <em className="text-brand-green">name.</em>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm text-muted-foreground leading-relaxed">
            No 15-syllable chemicals. Every ingredient in our formulas has been
            used in South Indian homes for generations.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {herbs.map((h) => (
            <article key={h.name} className="ingredient-card">
              <div className="font-display text-xl text-brand-brown mb-1">{h.name}</div>
              <div className="font-wordmark text-[9px] text-brand-gold mb-3">{h.aka}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{h.benefit}</p>
            </article>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/ingredients" className="btn-ghost text-[10px]">
            See all ingredients →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ───────────────────────────────────────── */
function TestimonialsBlock() {
  const { data } = useSuspenseQuery({
    queryKey: ["testimonials", { featured: true }],
    queryFn: () => getTestimonials({ data: { featured: true } }),
  });
  return <Testimonials items={data.slice(0, 6)} />;
}

/* ─── PROCESS ────────────────────────────────────────────── */
function Process() {
  const steps = [
    {
      n: "01", t: "Source",
      d: "Hand-picked roots and flowers from trusted organic farms in Andhra Pradesh and Telangana.",
      icon: "🌿",
    },
    {
      n: "02", t: "Sun-dry",
      d: "Slow-dried over 7–10 days in the open sun to lock in every phytochemical and enzyme.",
      icon: "☀️",
    },
    {
      n: "03", t: "Stone-grind",
      d: "Cold-ground in small batches — never machine-heated — to preserve potency and aroma.",
      icon: "🪨",
    },
    {
      n: "04", t: "Hand-pack",
      d: "Sealed in matte kraft pouches with a handwritten label and personal note from our team.",
      icon: "📦",
    },
  ];
  return (
    <Section
      eyebrow="From kitchen to kraft pouch"
      title="The process you can"
      italic="taste & smell."
      subtitle="We believe knowing how your care is made is part of the ritual itself."
    >
      <div className="grid md:grid-cols-4 gap-8">
        {steps.map((s, i) => (
          <div key={s.n} className="border-t-2 border-brand-gold/40 pt-6 relative" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="text-2xl mb-4">{s.icon}</div>
            <div className="font-display italic text-3xl text-brand-gold mb-1">{s.n}</div>
            <div className="font-wordmark text-[11px] text-brand-brown mb-3">{s.t}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── GEO TARGET BANNER (SEO + local) ────────────────────── */
function GeoTargetBanner() {
  return (
    <section className="bg-brand-green text-white py-10" aria-label="Delivery information">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <Truck className="h-5 w-5 shrink-0 text-white/80" />
            <div>
              <div className="font-wordmark text-[10px] text-white/70 mb-1">Free Delivery</div>
              <p className="text-sm text-white/90 leading-snug">
                Free shipping on orders above ₹699 — Vizag, Vijayawada, Hyderabad and all over India.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <RefreshCw className="h-5 w-5 shrink-0 text-white/80" />
            <div>
              <div className="font-wordmark text-[10px] text-white/70 mb-1">Prepaid Only</div>
              <p className="text-sm text-white/90 leading-snug">
                All orders are prepaid via UPI, Cards or Net Banking through secure Razorpay checkout.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <Instagram className="h-5 w-5 shrink-0 text-white/80" />
            <div>
              <div className="font-wordmark text-[10px] text-white/70 mb-1">Follow our Journey</div>
              <p className="text-sm text-white/90 leading-snug">
                85K+ views on our reels — follow{" "}
                <a
                  href="https://www.instagram.com/kavyas_hairandskincare/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-white transition"
                >
                  @kavyas_hairandskincare
                </a>
                {" "}for tutorials and results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PROMISE ────────────────────────────────────────────── */
function Promise() {
  return (
    <section className="bg-kraft border-t border-border" aria-label="Our Promise">
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="font-wordmark text-[9px] text-brand-gold mb-6">
          <span className="divider-botanical"><span>Our Promise</span></span>
        </div>
        <blockquote>
          <p className="font-display italic text-3xl md:text-[2.6rem] text-brand-brown leading-snug">
            "If we wouldn't put it on our own scalp and skin, it doesn't go
            in a Dr. Kavya's pouch."
          </p>
          <footer className="mt-8 font-hand text-2xl text-brand-green">— Dr. Kavya Reddy</footer>
        </blockquote>
      </div>
    </section>
  );
}

/* ─── NEWSLETTER ─────────────────────────────────────────── */
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.from("newsletter_subscribers").upsert({ email: email.toLowerCase().trim() });
      setDone(true);
    } catch {
      /* silently pass — upsert handles duplicates */
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-brand-brown text-brand-cream border-t border-brand-brown/50" aria-label="Newsletter signup">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="font-wordmark text-[9px] text-brand-tan mb-4">Rituals in your inbox</div>
        <h2 className="font-display text-3xl md:text-4xl mb-4">
          The kitchen diary.
        </h2>
        <p className="text-brand-cream/70 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
          Weekly tips on Ayurvedic hair and skin care, new product launches,
          ingredient spotlights and exclusive first-access offers.
        </p>
        {done ? (
          <div className="font-hand text-2xl text-brand-tan">
            🌿 Welcome to the family!
          </div>
        ) : (
          <form onSubmit={subscribe} className="flex gap-0 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 bg-transparent border border-brand-tan/40 px-4 py-3.5 text-sm text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:border-brand-tan"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              disabled={loading}
              className="bg-brand-tan text-brand-brown font-wordmark text-[10px] px-6 py-3.5 hover:bg-brand-gold hover:text-brand-cream transition disabled:opacity-50 shrink-0"
              type="submit"
            >
              {loading ? "…" : "Subscribe"}
            </button>
          </form>
        )}
        <p className="mt-4 text-[10px] text-brand-cream/40">
          No spam, ever. Unsubscribe any time.
        </p>
      </div>
    </section>
  );
}


