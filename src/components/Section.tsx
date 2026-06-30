import { cn } from "@/lib/utils";

export function Section({
  eyebrow,
  title,
  italic,
  subtitle,
  className,
  children,
}: {
  eyebrow?: string;
  title?: string;
  italic?: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={cn("max-w-7xl mx-auto px-6 py-20 md:py-28", className)}>
      {(eyebrow || title) && (
        <div className="max-w-2xl mb-12">
          {eyebrow && (
            <div className="font-wordmark text-[10px] text-brand-gold mb-4">
              {eyebrow}
            </div>
          )}
          {title && (
            <h2 className="font-display text-4xl md:text-5xl text-brand-brown leading-[1.1]">
              {title}{" "}
              {italic && <em className="text-brand-green">{italic}</em>}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 text-muted-foreground max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}