import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("site_content").select("key,value");
  if (error) throw new Error(error.message);
  const map: Record<string, any> = {};
  (data ?? []).forEach((r) => (map[r.key] = r.value));
  return map;
});

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("categories").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getProducts = createServerFn({ method: "GET" })
  .inputValidator((d: { categorySlug?: string; featured?: boolean } | undefined) => d ?? {})
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("products")
      .select("*, category:categories(name,slug)")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (data.featured) q = q.eq("featured", true);
    const { data: products, error } = await q;
    if (error) throw new Error(error.message);
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
    const { data: product, error } = await sb
      .from("products")
      .select("*, category:categories(name,slug), images:product_images(url,sort_order)")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
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
  const { data, error } = await sb
    .from("blog_posts")
    .select("slug,title,excerpt,cover_image,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: post, error } = await sb
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return post;
  });

export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string; subtotal: number }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
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
    let q = sb
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (data.featured) q = q.eq("featured", true);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("faqs")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const q = data.q.trim();
    if (!q) return [];
    const { data: rows, error } = await sb
      .from("products")
      .select("*, category:categories(name,slug)")
      .eq("published", true)
      .or(
        `name.ilike.%${q}%,tagline.ilike.%${q}%,short_description.ilike.%${q}%,ingredients.ilike.%${q}%`,
      )
      .limit(40);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((d: { orderRef: string; email: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
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