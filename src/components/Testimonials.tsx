import { useState } from "react";
import { Section } from "./Section";
import { Star } from "lucide-react";

function Rating({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 text-brand-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5" fill={i < n ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </div>
  );
}

function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden bg-muted select-none"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
      }}
      onTouchMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.touches[0].clientX - r.left;
        setPos(Math.max(0, Math.min(100, (x / r.width) * 100)));
      }}
    >
      <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="absolute top-3 left-3 font-wordmark text-[10px] bg-brand-cream/90 text-brand-brown px-2 py-1">Before</div>
      <div className="absolute top-3 right-3 font-wordmark text-[10px] bg-brand-brown/90 text-brand-cream px-2 py-1">After</div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-brand-cream pointer-events-none" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-brand-cream border border-brand-brown grid place-items-center text-brand-brown text-xs">⇆</div>
      </div>
    </div>
  );
}

function Media({ t }: { t: any }) {
  if (t.before_image_url && t.after_image_url) {
    return <BeforeAfter before={t.before_image_url} after={t.after_image_url} />;
  }
  if (t.video_url) {
    return (
      <video
        src={t.video_url}
        poster={t.image_url ?? undefined}
        controls
        playsInline
        preload="metadata"
        className="w-full aspect-[4/5] object-cover bg-muted"
      />
    );
  }
  if (t.image_url) {
    return <img src={t.image_url} alt={t.name} className="w-full aspect-[4/5] object-cover bg-muted" loading="lazy" />;
  }
  return (
    <div className="w-full aspect-[4/5] bg-kraft grid place-items-center">
      <div className="font-display italic text-6xl text-brand-tan">"</div>
    </div>
  );
}

export function Testimonials({ items, eyebrow = "Real results", title = "Stories from", italic = "our community" }: { items: any[]; eyebrow?: string; title?: string; italic?: string }) {
  if (!items?.length) return null;
  return (
    <Section
      eyebrow={eyebrow}
      title={title}
      italic={italic}
      subtitle="Honest words and before/after results from customers who let our remedies into their daily ritual."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((t) => (
          <article key={t.id} className="bg-card border border-border overflow-hidden flex flex-col">
            <Media t={t} />
            <div className="p-6 flex flex-col gap-3 flex-1">
              <Rating n={t.rating} />
              <p className="font-display italic text-lg text-brand-brown leading-snug">"{t.quote}"</p>
              <div className="mt-auto pt-3 border-t border-border">
                <div className="font-wordmark text-[11px] text-brand-brown">{t.name}</div>
                {(t.location || t.product_used) && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {t.location}
                    {t.location && t.product_used ? " · " : ""}
                    {t.product_used}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}