import { createFileRoute } from "@tanstack/react-router";
import ingredientsImg from "@/assets/ingredients.jpg";
import { Section } from "@/components/Section";

const list = [
  { n: "Bhringraj", d: "The 'king of hair' — stimulates roots and slows greying." },
  { n: "Hibiscus", d: "Conditions, restores shine and strengthens the cuticle." },
  { n: "Amla", d: "Vitamin-C rich; deep nourishment and natural pigment." },
  { n: "Neem", d: "Antimicrobial; calms scalp and clears stubborn dandruff." },
  { n: "Fenugreek", d: "Soothes scalp and adds bounce and softness." },
  { n: "Turmeric", d: "Brightens, evens tone, and quiets inflammation." },
  { n: "Sandalwood", d: "Cools skin, fades blemishes and pigmentation." },
  { n: "Rose petals", d: "Hydrates, tones and lifts dull complexions." },
];

export const Route = createFileRoute("/ingredients")({ component: Ingredients });

function Ingredients() {
  return (
    <>
      <section className="bg-kraft border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="font-wordmark text-[10px] text-brand-gold">Ingredients</div>
          <h1 className="font-display text-5xl md:text-6xl text-brand-brown mt-4">Eight botanicals. <em className="text-brand-green">Nothing else.</em></h1>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">Every Dr. Kavya's formula is a blend of these eight plant ingredients — sourced from trusted Andhra farms and dried in the sun.</p>
        </div>
      </section>
      <img src={ingredientsImg} alt="Botanical ingredients" width={1600} height={1024} loading="lazy" className="w-full" />
      <Section>
        <div className="grid md:grid-cols-2 gap-8">
          {list.map((i) => (
            <div key={i.n} className="border-t border-brand-gold/40 pt-4">
              <div className="font-display text-2xl text-brand-brown italic">{i.n}</div>
              <p className="mt-2 text-muted-foreground">{i.d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}