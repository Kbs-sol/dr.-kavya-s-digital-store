import { createFileRoute } from "@tanstack/react-router";
import storyImg from "@/assets/story.jpg";
import { Section } from "@/components/Section";

export const Route = createFileRoute("/story")({ component: Story });

function Story() {
  return (
    <>
      <section className="bg-kraft border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="font-wordmark text-[10px] text-brand-gold">Our Story</div>
          <h1 className="font-display text-5xl md:text-6xl text-brand-brown mt-4 leading-[1.05]">
            A doctor, her mother, and a <em className="text-brand-green">kitchen full of herbs.</em>
          </h1>
        </div>
      </section>
      <img src={storyImg} alt="Dr. Kavya" width={1280} height={1600} loading="lazy" className="w-full max-h-[70vh] object-cover" />
      <Section>
        <div className="max-w-2xl mx-auto space-y-6 text-foreground/85 leading-relaxed text-lg">
          <p>
            I am Dr. Kavya Reddy — a practicing dentist in Visakhapatnam, and the daughter of a
            woman who has been making her own remedies since long before "clean beauty" was
            a phrase anyone used.
          </p>
          <p>
            Dr. Kavya's began the year my own hair-fall would not stop. I had tried every
            commercial brand on every shelf. None of them worked. So I went home, sat with my
            mother, and we began grinding the bhringraj, hibiscus and methi the way her
            mother had taught her.
          </p>
          <p>
            Within months my hair came back — and so did the friends and patients asking what
            I was using. We started packing a few pouches a week from the kitchen table. Today
            we still make every batch by hand, the same way, in the same kitchen.
          </p>
          <p className="font-display italic text-xl text-brand-brown">
            "If we wouldn't put it on our own scalp and skin, it doesn't go in a Dr. Kavya's pouch."
          </p>
        </div>
      </Section>
    </>
  );
}