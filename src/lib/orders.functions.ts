import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const itemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  image: z.string().max(500).optional().default(""),
  price: z.number().nonnegative(),
  quantity: z.number().int().min(1).max(50),
});

const orderInput = z.object({
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  shipping_name: z.string().min(1).max(120),
  shipping_line1: z.string().min(1).max(200),
  shipping_line2: z.string().max(200).optional().default(""),
  shipping_city: z.string().min(1).max(80),
  shipping_state: z.string().min(1).max(80),
  shipping_pincode: z.string().min(4).max(12),
  payment_method: z.literal("razorpay"),
  coupon_code: z.string().max(40).optional().default(""),
  notes: z.string().max(500).optional().default(""),
  items: z.array(itemSchema).min(1).max(50),
  user_id: z.string().uuid().nullable().optional(),
});

function orderNumber() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const r = Math.floor(Math.random() * 9000 + 1000);
  return `DK${y}${m}${r}`;
}

// ─── Check if Supabase is configured server-side ─────────────────────────────
function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!key || !lovableKey) return; // email is optional
  try {
    await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": key,
      },
      body: JSON.stringify({
        from: "Dr. Kavya's <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });
  } catch (e) {
    console.error("[email]", e);
  }
}

function renderOrderEmail(order: any, items: any[]) {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.product_name} × ${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${i.line_total}</td></tr>`,
    )
    .join("");
  return `<div style="font-family:Georgia,serif;color:#3D2F1A;background:#F5EAD7;padding:32px">
    <h1 style="font-style:italic">Thank you, ${order.shipping_name}.</h1>
    <p>Your Dr. Kavya's order <b>${order.order_number}</b> has been received.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;background:#fff">
      ${rows}
      <tr><td style="padding:8px"><b>Total</b></td><td style="padding:8px;text-align:right"><b>₹${order.total}</b></td></tr>
    </table>
    <p style="margin-top:24px">Payment: ${order.payment_method.toUpperCase()}</p>
    <p>We pack your order with care in Visakhapatnam. You'll hear from us when it ships.</p>
    <p style="font-family:cursive">— Dr. Kavya & team</p>
  </div>`;
}

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => orderInput.parse(d))
  .handler(async ({ data }) => {
    // Guard: if Supabase is not configured, return a friendly error
    if (!isSupabaseConfigured()) {
      return {
        order_id: null,
        order_number: null,
        total: 0,
        razorpay: null,
        error: "Payment system not configured yet. Please contact us via WhatsApp to place your order.",
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Re-fetch authoritative prices server-side
    const ids = data.items.map((i) => i.id);
    const { data: products, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id,name,price,cover_image,stock,published")
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);
    const byId = new Map((products ?? []).map((p: any) => [p.id, p]));

    let subtotal = 0;
    const items = data.items.map((i) => {
      const p: any = byId.get(i.id);
      if (!p || !p.published) throw new Error("Product unavailable");
      if (p.stock < i.quantity) throw new Error(`${p.name} is out of stock`);
      const unit = Number(p.price);
      const line_total = unit * i.quantity;
      subtotal += line_total;
      return {
        product_id: p.id,
        product_name: p.name,
        product_image: p.cover_image,
        unit_price: unit,
        quantity: i.quantity,
        line_total,
      };
    });

    // shipping
    const { data: settings } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "shipping_settings")
      .maybeSingle();
    const flat = Number((settings?.value as any)?.flat_rate ?? 79);
    const shipping_fee = flat;

    // coupon
    let discount = 0;
    let coupon_code: string | null = null;
    if (data.coupon_code) {
      const { data: c } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", data.coupon_code.toUpperCase())
        .eq("active", true)
        .maybeSingle();
      if (c) {
        if (!c.min_order || subtotal >= Number(c.min_order)) {
          discount =
            c.discount_type === "percent"
              ? Math.round((subtotal * Number(c.discount_value)) / 100)
              : Number(c.discount_value);
          coupon_code = c.code;
        }
      }
    }

    const total = Math.max(0, subtotal - discount + shipping_fee);
    const number = orderNumber();

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: number,
        user_id: data.user_id ?? null,
        email: data.email,
        phone: data.phone,
        shipping_name: data.shipping_name,
        shipping_line1: data.shipping_line1,
        shipping_line2: data.shipping_line2,
        shipping_city: data.shipping_city,
        shipping_state: data.shipping_state,
        shipping_pincode: data.shipping_pincode,
        shipping_country: "India",
        subtotal,
        discount,
        shipping_fee,
        total,
        coupon_code,
        payment_method: data.payment_method,
        status: "pending",
        notes: data.notes,
      })
      .select("*")
      .single();
    if (oErr) throw new Error(oErr.message);

    const { error: iErr } = await supabaseAdmin
      .from("order_items")
      .insert(items.map((i) => ({ ...i, order_id: order.id })));
    if (iErr) throw new Error(iErr.message);

    // Razorpay order creation (optional, only if keys set)
    let razorpay: { key_id: string; order_id: string; amount: number } | null = null;
    if (data.payment_method === "razorpay") {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (keyId && secret) {
        // Cloudflare Workers doesn't have Buffer — use btoa instead
        const credentials = `${keyId}:${secret}`;
        const auth = typeof Buffer !== 'undefined'
          ? Buffer.from(credentials).toString("base64")
          : btoa(credentials);
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: Math.round(total * 100),
            currency: "INR",
            receipt: number,
            notes: { order_id: order.id },
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Razorpay: ${res.status} ${text.slice(0, 200)}`);
        }
        const rp: any = await res.json();
        await supabaseAdmin
          .from("orders")
          .update({ razorpay_order_id: rp.id })
          .eq("id", order.id);
        razorpay = { key_id: keyId, order_id: rp.id, amount: rp.amount };
      }
    }

    // Stock is decremented after Razorpay payment verification.

    return {
      order_id: order.id,
      order_number: number,
      total,
      razorpay,
      error: null,
    };
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator((d: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_id: string;
  }) => d)
  .handler(async ({ data }) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay not configured");

    // Use Web Crypto API (works in Cloudflare Workers)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(`${data.razorpay_order_id}|${data.razorpay_payment_id}`);

    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
    const expected = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (expected !== data.razorpay_signature) throw new Error("Invalid signature");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id: data.razorpay_payment_id,
      })
      .eq("id", data.order_id)
      .select("*")
      .single();

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", data.order_id);

    // decrement stock
    if (items) {
      for (const i of items) {
        if (!i.product_id) continue;
        const { data: p } = await supabaseAdmin
          .from("products")
          .select("stock")
          .eq("id", i.product_id)
          .maybeSingle();
        if (p) {
          await supabaseAdmin
            .from("products")
            .update({ stock: Math.max(0, p.stock - i.quantity) })
            .eq("id", i.product_id);
        }
      }
    }

    if (order) {
      void sendEmail(
        order.email,
        `Payment received — order ${order.order_number}`,
        renderOrderEmail(order, items ?? []),
      );
    }
    return { ok: true };
  });

export const getMyOrder = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    // Guard: if no Supabase, return null gracefully
    if (!isSupabaseConfigured()) return null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!order) return null;
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", data.id);
    return { ...order, items: items ?? [] };
  });
