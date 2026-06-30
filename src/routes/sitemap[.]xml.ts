import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://drkavyas.in";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().split("T")[0];

        const staticEntries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
          { path: "/shop", changefreq: "daily", priority: "0.9", lastmod: today },
          { path: "/story", changefreq: "monthly", priority: "0.8", lastmod: today },
          { path: "/ingredients", changefreq: "monthly", priority: "0.8", lastmod: today },
          { path: "/journal", changefreq: "weekly", priority: "0.7", lastmod: today },
          { path: "/faq", changefreq: "monthly", priority: "0.8", lastmod: today },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
          { path: "/quiz", changefreq: "monthly", priority: "0.6" },
          { path: "/search", changefreq: "monthly", priority: "0.5" },
          { path: "/track", changefreq: "monthly", priority: "0.4" },
          /* Category landing pages for Google Shopping */
          { path: "/shop?category=hair", changefreq: "daily", priority: "0.9" },
          { path: "/shop?category=skin", changefreq: "daily", priority: "0.8" },
          { path: "/shop?category=body", changefreq: "daily", priority: "0.7" },
          { path: "/shop?category=combos", changefreq: "weekly", priority: "0.7" },
          { path: "/shop?category=gifting", changefreq: "weekly", priority: "0.6" },
        ];

        const entries: SitemapEntry[] = [...staticEntries];

        try {
          const { createClient } = await import("@supabase/supabase-js");
          const url = process.env.SUPABASE_URL;
          const key = process.env.SUPABASE_PUBLISHABLE_KEY;
          if (url && key) {
            const sb = createClient(url, key, {
              auth: { persistSession: false, autoRefreshToken: false },
            });
            /* Products */
            const { data: products } = await sb
              .from("products")
              .select("slug, updated_at")
              .eq("published", true);
            products?.forEach((p: { slug: string; updated_at?: string }) => {
              if (p.slug) {
                entries.push({
                  path: `/product/${p.slug}`,
                  changefreq: "weekly",
                  priority: "0.9",
                  lastmod: p.updated_at?.split("T")[0] ?? today,
                });
              }
            });
            /* Blog posts */
            const { data: posts } = await sb
              .from("blog_posts")
              .select("slug, updated_at")
              .eq("published", true);
            posts?.forEach((p: { slug: string; updated_at?: string }) => {
              if (p.slug) {
                entries.push({
                  path: `/journal/${p.slug}`,
                  changefreq: "monthly",
                  priority: "0.7",
                  lastmod: p.updated_at?.split("T")[0] ?? today,
                });
              }
            });
          }
        } catch {
          // ignore — static entries still ship
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
          `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
            "X-Robots-Tag": "noindex",
          },
        });
      },
    },
  },
});
