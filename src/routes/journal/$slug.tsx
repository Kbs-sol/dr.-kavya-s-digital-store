import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getBlogPost } from "@/lib/site.functions";

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.fetchQuery({
      queryKey: ["blog", params.slug],
      queryFn: () => getBlogPost({ data: { slug: params.slug } }),
    });
    if (!d) throw notFound();
  },
  component: Post,
});

function Post() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["blog", slug], queryFn: () => getBlogPost({ data: { slug } }) });
  if (!data) return null;
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <div className="font-wordmark text-[10px] text-brand-gold">Journal</div>
      <h1 className="font-display text-4xl md:text-5xl text-brand-brown mt-4">{data.title}</h1>
      {data.cover_image && <img src={data.cover_image} alt={data.title} className="mt-8 w-full" />}
      <div className="prose prose-lg mt-8 whitespace-pre-line text-foreground/85 leading-relaxed">{data.body}</div>
    </article>
  );
}