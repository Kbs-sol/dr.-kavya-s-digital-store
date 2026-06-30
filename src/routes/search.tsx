import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { searchProducts } from "@/lib/site.functions";
import { Section } from "@/components/Section";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search · Dr. Kavya's" }] }),
  component: SearchPage,
});

function SearchPage() {
  const run = useServerFn(searchProducts);
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setRows([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await run({ data: { q } });
        setRows(r);
      } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q, run]);

  return (
    <Section eyebrow="Search" title="Find your " italic="remedy.">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Try ‘hair fall’, ‘bhringraj’, ‘face pack’…"
        className="w-full max-w-2xl border-b border-border bg-transparent py-4 text-2xl font-display text-brand-brown placeholder:text-brand-gold/50 focus:outline-none focus:border-brand-brown"
      />
      <div className="mt-12">
        {loading && <div className="text-sm text-muted-foreground">Searching…</div>}
        {!loading && q && rows.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No matches. <Link to="/shop" className="underline">Browse all products</Link>.
          </div>
        )}
        {rows.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {rows.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </Section>
  );
}