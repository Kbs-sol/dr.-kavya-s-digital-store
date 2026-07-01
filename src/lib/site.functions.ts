import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// ─── Graceful Supabase client factory ─────────────────────────────────────
// Returns null when env vars are absent so server functions can return empty
// data instead of crashing the edge worker.
function publicClient() {
  const URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!URL || !KEY) return null;
  return createClient<Database>(URL, KEY, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

// ─── Server Functions ──────────────────────────────────────────────────────

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  if (!sb) return {};
  const { data } = await sb.from("site_content").select("key,value");
  const map: Record<string, any> = {};
  (data ?? []).forEach((r) => (map[r.key] = r.value));
  return map;
});

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  if (!sb) return [];
  const { data } = await sb.from("categories").select("*").order("sort_order");
  return data ?? [];
});

export const getProducts = createServerFn({ method: "GET" })
  .inputValidator((d: { categorySlug?: string; featured?: boolean } | undefined) => d ?? {})
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return [];
    let q = sb
      .from("products")
      .select("*, category:categories(name,slug)")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (data.featured) q = q.eq("featured", true);
    const { data: products } = await q;
    let list = products ?? [];
    if (data.categorySlug) {
      list = list.filter((p: any) => p.category?.slug === data.categorySlug);
    }
    return list;
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return null;
    const { data: product } = await sb
      .from("products")
      .select("*, category:categories(name,slug), images:product_images(url,sort_order)")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (!product) return null;
    const { data: reviews } = await sb
      .from("reviews")
      .select("*")
      .eq("product_id", product.id)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(8);
    return { ...product, reviews: reviews ?? [] };
  });

export const getBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  if (!sb) return [];
  const { data } = await sb
    .from("blog_posts")
    .select("slug,title,excerpt,cover_image,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return data ?? [];
});

export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return null;
    const { data: post } = await sb
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    return post;
  });

export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string; subtotal: number }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return { ok: false as const, error: "Coupons unavailable" };
    const { data: c } = await sb
      .from("coupons")
      .select("*")
      .eq("code", data.code.toUpperCase())
      .eq("active", true)
      .maybeSingle();
    if (!c) return { ok: false as const, error: "Invalid code" };
    if (c.expires_at && new Date(c.expires_at) < new Date())
      return { ok: false as const, error: "Code expired" };
    if (c.max_uses && c.used_count >= c.max_uses)
      return { ok: false as const, error: "Code limit reached" };
    if (c.min_order && data.subtotal < Number(c.min_order))
      return { ok: false as const, error: `Min order ₹${c.min_order}` };
    const discount =
      c.discount_type === "percent"
        ? Math.round((data.subtotal * Number(c.discount_value)) / 100)
        : Number(c.discount_value);
    return { ok: true as const, code: c.code, discount, description: c.description };
  });

export const getTestimonials = createServerFn({ method: "GET" })
  .inputValidator((d: { featured?: boolean } | undefined) => d ?? {})
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return [];
    let q = sb
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (data.featured) q = q.eq("featured", true);
    const { data: rows } = await q;
    return rows ?? [];
  });

export const getFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  if (!sb) return [];
  const { data } = await sb
    .from("faqs")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
});

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return [];
    const q = data.q.trim();
    if (!q) return [];
    const { data: rows } = await sb
      .from("products")
      .select("*, category:categories(name,slug)")
      .eq("published", true)
      .or(`name.ilike.%${q}%,tagline.ilike.%${q}%,short_description.ilike.%${q}%,ingredients.ilike.%${q}%`)
      .limit(40);
    return rows ?? [];
  });

export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((d: { orderRef: string; email: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return { ok: false as const, error: "Order tracking unavailable" };
    const ref = data.orderRef.trim();
    const email = data.email.trim().toLowerCase();
    if (!ref || !email) return { ok: false as const, error: "Order ID and email required" };
    const isUuid = /^[0-9a-f-]{32,36}$/i.test(ref);
    const col = isUuid ? "id" : "order_number";
    const { data: order } = await sb
      .from("orders")
      .select("id,order_number,email,status,total,tracking_url,created_at,shipping_name,shipping_city,shipping_state")
      .eq(col, ref)
      .maybeSingle();
    if (!order || (order.email ?? "").toLowerCase() !== email) {
      return { ok: false as const, error: "No order found for that ID + email" };
    }
    const { data: items } = await sb
      .from("order_items")
      .select("name,quantity,price,size")
      .eq("order_id", order.id);
    return { ok: true as const, order, items: items ?? [] };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!sb) return { ok: true }; // silently succeed if no Supabase
    await sb
      .from("newsletter_subscribers")
      .upsert({ email: data.email, subscribed: true }, { onConflict: "email" });
    return { ok: true };
  });
