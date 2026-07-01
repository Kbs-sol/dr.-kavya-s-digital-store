import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { getCategories, getProducts } from "@/lib/site.functions";
import { ProductCard } from "@/components/ProductCard";

const search = z.object({ category: z.string().optional() });

export const Route = createFileRoute("/shop/")({
  validateSearch: (s) => search.parse(s),
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: async ({ context, deps }) => {
    await context.queryClient.prefetchQuery({ queryKey: ["categories"], queryFn: () => getCategories() });
    await context.queryClient.prefetchQuery({
      queryKey: ["products", { categorySlug: deps.category }],
      queryFn: () => getProducts({ data: { categorySlug: deps.category } }),
    });
  },
  component: Shop,
});

function Shop() {
  const { category } = Route.useSearch();
  const { data: cats } = useSuspenseQuery({ queryKey: ["categories"], queryFn: () => getCategories() });
  const { data: products } = useSuspenseQuery({
    queryKey: ["products", { categorySlug: category }],
    queryFn: () => getProducts({ data: { categorySlug: category } }),
  });

  return (
    <div className="bg-kraft">
      <div className="max-w-7xl mx-auto px-6 pt-16 md:pt-20 pb-10 border-b border-border">
        <div className="font-wordmark text-[10px] text-brand-gold mb-4">The Apothecary</div>
        <h1 className="font-display text-5xl md:text-6xl text-brand-brown">Shop all <em className="text-brand-green">rituals</em></h1>
        <p className="mt-4 max-w-xl text-muted-foreground">Twelve hand-blended formulas for hair, skin, body and gifting — all 100% herbal, all made fresh in our Visakhapatnam kitchen.</p>
        <div className="mt-8 flex flex-wrap gap-2 font-wordmark text-[10px]">
          <Link to="/shop" className={`px-4 py-2 border ${!category ? "bg-brand-brown text-brand-cream border-brand-brown" : "border-border hover:border-brand-brown"}`}>All</Link>
          {cats.map((c: any) => (
            <Link key={c.id} to="/shop" search={{ category: c.slug }} className={`px-4 py-2 border ${category === c.slug ? "bg-brand-brown text-brand-cream border-brand-brown" : "border-border hover:border-brand-brown"}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-16">
        {products.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">No products in this category yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-14">
            {products.map((p: any) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}