import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getBlogPosts } from "@/lib/site.functions";
import { Section } from "@/components/Section";

export const Route = createFileRoute("/journal/")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({ queryKey: ["blog"], queryFn: () => getBlogPosts() });
  },
  component: Journal,
});

function Journal() {
  const { data } = useSuspenseQuery({ queryKey: ["blog"], queryFn: () => getBlogPosts() });
  return (
    <Section eyebrow="The Journal" title="Notes from" italic="the apothecary">
      {data.length === 0 ? (
        <p className="text-muted-foreground">No posts yet — check back soon.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-10">
          {data.map((p: any) => (
            <Link key={p.slug} to="/journal/$slug" params={{ slug: p.slug }} className="group">
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                {p.cover_image && <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />}
              </div>
              <h3 className="font-display text-xl text-brand-brown mt-4">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}