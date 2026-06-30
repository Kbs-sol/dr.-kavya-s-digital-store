import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { getFaqs } from "@/lib/site.functions";
import { Section } from "@/components/Section";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";

/* ── Static geo-targeted FAQs shown alongside DB FAQs ── */
const GEO_FAQS = [
  /* ── Products ── */
  {
    category: "Products",
    question: "What is Dr. Kavya's Hair Fall Control Mask?",
    answer: "Dr. Kavya's Hair Fall Control Mask is a 100% herbal Ayurvedic powder containing Bhringraj, Amla, Brahmi, Hibiscus and Fenugreek. It is handcrafted in Visakhapatnam by Dr. Kavya Reddy — a practicing dentist. The mask is designed to strengthen hair from the root, reduce hair fall and nourish the scalp. Many customers report visibly reduced hair fall with regular weekly use.",
  },
  {
    category: "Products",
    question: "Are Dr. Kavya's products safe for coloured or chemically treated hair?",
    answer: "Yes — all our formulas are 100% herbal with no sulfates, silicones or synthetic chemicals. They are gentle enough for chemically treated or coloured hair. However, as with any new product, do a 24-hour patch test before first use. If you have a specific scalp condition or allergy, consult a dermatologist.",
  },
  {
    category: "Products",
    question: "What is Nalugu Pindi?",
    answer: "Nalugu Pindi (నలుగు పిండి) is a traditional Telugu bath powder made from green gram, turmeric, rose, sandalwood and herbs. It has been used for generations in Andhra Pradesh as a soap-free cleanser that gently exfoliates, brightens skin and leaves a natural fragrance. Our Nalugu Pindi Bath Powder revives this authentic ritual in a convenient 200g pack.",
  },
  {
    category: "Products",
    question: "Do you add any chemicals or preservatives?",
    answer: "Absolutely not. Our products contain zero synthetic preservatives, parabens, sulfates, silicones, artificial fragrances or colorants. We use only sun-dried, stone-ground herbs that are their own natural preservatives. Each batch is made fresh weekly in small quantities to maintain potency.",
  },
  /* ── Usage ── */
  {
    category: "How to Use",
    question: "How do I use the Hair Fall Control Mask?",
    answer: "Mix 2 tablespoons of the powder with warm water or yogurt to form a smooth paste. Apply evenly along the scalp and hair lengths. Leave on for 30–45 minutes. Rinse thoroughly with a mild shampoo. Use once a week for best results. Consistent weekly use over 6–8 weeks shows the most visible improvement.",
  },
  {
    category: "How to Use",
    question: "How do I use the Multi-Action Face Pack?",
    answer: "Mix 1 teaspoon of powder with rose water, raw milk or plain water. Apply evenly on a cleansed face, avoiding the eye area. Leave for 15 minutes until it starts to dry. Rinse with cool water and moisturise. Use 2–3 times a week. Do not use on active breakouts or open wounds.",
  },
  {
    category: "How to Use",
    question: "How do I use the Nalugu Pindi Bath Powder?",
    answer: "Take 2 tablespoons in a small bowl. Mix with water, curd or milk to form a paste. Massage all over damp body skin in gentle circular motions. Rinse thoroughly. Use 2–3 times a week instead of soap. It leaves skin visibly softer and lightly scented.",
  },
  /* ── Shipping ── */
  {
    category: "Shipping & Delivery",
    question: "Do you ship to Visakhapatnam and Vijayawada?",
    answer: "Yes, of course — Vizag and Vijayawada are our home markets. Delivery within Andhra Pradesh typically takes 2–4 business days. Orders above ₹699 ship free. Below ₹699, a flat fee of ₹79 applies.",
  },
  {
    category: "Shipping & Delivery",
    question: "Can I order from Dubai, Singapore or the USA?",
    answer: "Currently we ship within India only. However, many of our NRI customers have their family or friends receive orders at an Indian address and forward them internationally. If you're in Hyderabad, Bengaluru or any Indian city, we deliver pan-India.",
  },
  {
    category: "Shipping & Delivery",
    question: "How long does delivery take?",
    answer: "Within Andhra Pradesh (Vizag, Vijayawada, Hyderabad): 2–4 business days. Rest of India (metros): 3–5 business days. Tier-2 and Tier-3 cities: 5–7 business days. All orders receive a tracking number via email once shipped.",
  },
  {
    category: "Shipping & Delivery",
    question: "Is there free shipping?",
    answer: "Yes! Orders above ₹699 ship completely free across India. Below that, a flat rate of ₹79 is charged. You can easily reach free shipping by adding our Combo packs or ordering 2–3 items.",
  },
  /* ── Payments ── */
  {
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept all major payment methods through Razorpay: UPI (PhonePe, GPay, BHIM), Debit Cards, Credit Cards, Net Banking and major wallets. All payments are 100% secure. We do not offer Cash on Delivery — all orders are prepaid.",
  },
  {
    category: "Payments",
    question: "Why are all orders prepaid? No Cash on Delivery?",
    answer: "All our products are made fresh in small batches. Prepaid-only allows us to keep our prices fair for everyone and reduce waste from undelivered COD orders. We use Razorpay's secure checkout — UPI payment takes 15 seconds.",
  },
  /* ── Trust & Returns ── */
  {
    category: "Returns & Trust",
    question: "What is your return policy?",
    answer: "Due to the hygiene and perishable nature of cosmetic products, we cannot accept returns or exchanges on opened products. If you receive a damaged or incorrect item, please WhatsApp us within 48 hours at +91 77802 11653 with a photo and we will make it right.",
  },
  {
    category: "Returns & Trust",
    question: "Are your products dermatologist tested?",
    answer: "Our products are formulated by Dr. Kavya Reddy using traditional Ayurvedic recipes trusted for generations. While they are not independently dermatologist-tested, we always recommend a 24-hour patch test before first use, especially for sensitive skin.",
  },
  /* ── Brand ── */
  {
    category: "About the Brand",
    question: "Who is Dr. Kavya Reddy?",
    answer: "Dr. Kavya Reddy is a practicing dentist based in Visakhapatnam, Andhra Pradesh. She started Dr. Kavya's Hair & Skin Care after experiencing hair fall herself and finding that her mother's traditional herbal remedies worked better than any commercial product. She still formulates and oversees every batch personally.",
  },
  {
    category: "About the Brand",
    question: "Where are the products made?",
    answer: "All products are handcrafted in Visakhapatnam (Vizag), Andhra Pradesh, India. We source herbs from trusted farms in Andhra Pradesh and Telangana. Each batch is made fresh in our kitchen, sun-dried and stone-ground in small quantities.",
  },
];

const faqSchema = (items: Array<{question: string; answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Dr. Kavya's Hair & Skin Care | Shipping, Ingredients, Usage" },
      {
        name: "description",
        content: "Answers to all your questions about Dr. Kavya's Ayurvedic hair and skin care — ingredients, how to use, shipping to Vizag and pan-India, returns, payments and more.",
      },
      { property: "og:title", content: "FAQ — Dr. Kavya's Hair & Skin Care" },
      { property: "og:url", content: "https://drkavyas.in/faq" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(faqSchema(GEO_FAQS)),
      },
    ],
    links: [{ rel: "canonical", href: "https://drkavyas.in/faq" }],
  }),
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["faqs"],
      queryFn: () => getFaqs(),
    });
  },
  component: FaqPage,
});

function FaqPage() {
  const [search, setSearch] = useState("");
  return (
    <>
      <Section
        eyebrow="Help Centre"
        title="Questions,"
        italic="answered honestly."
        subtitle="Everything you need to know about our products, ingredients, shipping and returns."
      >
        {/* Search */}
        <div className="max-w-xl mx-auto mb-12 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search questions…"
            className="form-input pl-12 py-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* DB FAQs */}
        <Suspense fallback={<div className="h-20" />}>
          <DbFaqs search={search} />
        </Suspense>

        {/* Geo/static FAQs */}
        <StaticFaqs search={search} />

        {/* CTA */}
        <div className="mt-16 text-center bg-kraft border border-border p-10">
          <div className="font-wordmark text-[9px] text-brand-gold mb-3">Still have questions?</div>
          <h2 className="font-display text-2xl text-brand-brown mb-4">
            We're a small team — we actually reply.
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/917780211653?text=Hi%2C%20I%20have%20a%20question%20about%20Dr.%20Kavya's%20products"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              WhatsApp us
            </a>
            <Link to="/contact" className="btn-ghost">Send a message</Link>
          </div>
        </div>
      </Section>
    </>
  );
}

function DbFaqs({ search }: { search: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ["faqs"],
    queryFn: () => getFaqs(),
  });
  const filtered = data.filter((f: any) =>
    !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
  );
  if (filtered.length === 0) return null;
  const groups = filtered.reduce((acc: Record<string, any[]>, f: any) => {
    const k = f.category || "General";
    (acc[k] ||= []).push(f);
    return acc;
  }, {});
  return (
    <>
      {Object.entries(groups).map(([cat, items]) => (
        <FaqGroup key={cat} category={cat} items={items} />
      ))}
    </>
  );
}

function StaticFaqs({ search }: { search: string }) {
  const filtered = GEO_FAQS.filter((f) =>
    !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
  );
  if (filtered.length === 0 && search) return null;
  const groups = filtered.reduce((acc: Record<string, typeof GEO_FAQS>, f) => {
    (acc[f.category] ||= []).push(f);
    return acc;
  }, {});
  return (
    <>
      {Object.entries(groups).map(([cat, items]) => (
        <FaqGroup key={cat} category={cat} items={items} />
      ))}
    </>
  );
}

function FaqGroup({ category, items }: { category: string; items: any[] }) {
  return (
    <div className="max-w-3xl mx-auto mb-10">
      <div className="font-wordmark text-[9px] text-brand-gold mb-4 flex items-center gap-3">
        <span className="inline-block w-8 h-px bg-brand-gold/40" />
        {category}
      </div>
      <div className="divide-y divide-border border-y border-border">
        {items.map((f: any) => <FaqRow key={f.id ?? f.question} f={f} />)}
      </div>
    </div>
  );
}

function FaqRow({ f }: { f: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left py-5 flex items-start justify-between gap-6"
        aria-expanded={open}
      >
        <span className="font-display text-lg text-brand-brown group-hover:text-brand-gold transition leading-snug">
          {f.question}
        </span>
        <span className="shrink-0 mt-0.5">
          {open
            ? <ChevronUp className="h-5 w-5 text-brand-gold" />
            : <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-brand-gold transition" />
          }
        </span>
      </button>
      {open && (
        <div className="pb-6 text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {f.answer}
        </div>
      )}
    </div>
  );
}
