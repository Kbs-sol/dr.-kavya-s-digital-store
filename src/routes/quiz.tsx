import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { getProducts } from "@/lib/site.functions";
import { Section } from "@/components/Section";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Hair & Skin Quiz · Dr. Kavya's" },
      { name: "description", content: "Answer three quick questions and we'll match you with the right herbal remedies." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({ queryKey: ["products"], queryFn: () => getProducts() });
  },
  component: QuizPage,
});

const concerns = [
  { id: "hairfall", label: "Hair Fall", keywords: ["hair fall", "fall"] },
  { id: "regrowth", label: "Regrowth", keywords: ["regrowth", "severe hair fall"] },
  { id: "dandruff", label: "Dandruff / Itchy Scalp", keywords: ["dandruff", "scalp"] },
  { id: "greying", label: "Premature Greying", keywords: ["greying", "bhringraj"] },
  { id: "tan", label: "Sun Tan / Dullness", keywords: ["tan", "dull"] },
  { id: "acne", label: "Acne / Pigmentation", keywords: ["acne", "pigmentation"] },
  { id: "glow", label: "Skin Glow", keywords: ["glow"] },
  { id: "body", label: "Body Care", keywords: ["body", "bath"] },
];

function QuizPage() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [age, setAge] = useState<string>("");
  const [routine, setRoutine] = useState<string>("");

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <Section eyebrow="Personalised" title="Find your " italic="remedy in 30 seconds.">
      {step === 0 && (
        <div className="max-w-2xl">
          <p className="text-muted-foreground mb-6">What would you like to work on? Pick all that apply.</p>
          <div className="flex flex-wrap gap-3">
            {concerns.map((c) => (
              <button key={c.id} onClick={() => toggle(c.id)}
                className={`px-5 py-3 border text-sm font-wordmark transition ${
                  picked.includes(c.id)
                    ? "bg-brand-brown text-brand-cream border-brand-brown"
                    : "border-border hover:border-brand-brown"
                }`}>
                {c.label}
              </button>
            ))}
          </div>
          <button disabled={picked.length === 0} onClick={() => setStep(1)}
            className="mt-10 bg-brand-brown text-brand-cream font-wordmark text-xs px-7 py-3 hover:bg-brand-gold transition disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
      {step === 1 && (
        <div className="max-w-2xl space-y-8">
          <div>
            <p className="font-display text-xl text-brand-brown mb-4">Your age group</p>
            <div className="flex flex-wrap gap-3">
              {["Under 20", "20–30", "30–45", "45+"].map((a) => (
                <button key={a} onClick={() => setAge(a)}
                  className={`px-5 py-3 border text-sm font-wordmark ${
                    age === a ? "bg-brand-brown text-brand-cream border-brand-brown" : "border-border"
                  }`}>{a}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-display text-xl text-brand-brown mb-4">How often do you currently use natural remedies?</p>
            <div className="flex flex-wrap gap-3">
              {["Never", "Sometimes", "Weekly", "Daily"].map((a) => (
                <button key={a} onClick={() => setRoutine(a)}
                  className={`px-5 py-3 border text-sm font-wordmark ${
                    routine === a ? "bg-brand-brown text-brand-cream border-brand-brown" : "border-border"
                  }`}>{a}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="font-wordmark text-xs px-7 py-3 border border-border">← Back</button>
            <button disabled={!age || !routine} onClick={() => setStep(2)}
              className="bg-brand-brown text-brand-cream font-wordmark text-xs px-7 py-3 hover:bg-brand-gold transition disabled:opacity-40">
              See my matches →
            </button>
          </div>
        </div>
      )}
      {step === 2 && (
        <Suspense fallback={<div className="h-40" />}>
          <Results picked={picked} />
        </Suspense>
      )}
    </Section>
  );
}

function Results({ picked }: { picked: string[] }) {
  const { data } = useSuspenseQuery({ queryKey: ["products"], queryFn: () => getProducts() });
  const keywords = concerns.filter((c) => picked.includes(c.id)).flatMap((c) => c.keywords);
  const haystack = (p: any) =>
    `${p.name} ${p.tagline ?? ""} ${p.short_description ?? ""} ${(p.badges ?? []).join(" ")}`.toLowerCase();
  const scored = data
    .map((p: any) => ({ p, score: keywords.reduce((s, k) => s + (haystack(p).includes(k) ? 1 : 0), 0) }))
    .sort((a: any, b: any) => b.score - a.score);
  const top = scored.filter((s: any) => s.score > 0).slice(0, 4).map((s: any) => s.p);
  const list = top.length > 0 ? top : data.slice(0, 4);
  return (
    <div>
      <p className="font-display text-2xl text-brand-brown mb-2">Your personalised routine</p>
      <p className="text-sm text-muted-foreground mb-10">
        Hand-matched from mom's small batches based on what you told us.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {list.map((p: any) => <ProductCard key={p.id} p={p} />)}
      </div>
      <div className="mt-10">
        <Link to="/shop" className="font-wordmark text-[11px] text-brand-brown border-b border-brand-brown/40">
          Or explore the full shop →
        </Link>
      </div>
    </div>
  );
}