import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional().default(""),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(1).max(2000),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // supabaseAdmin is a no-op when Supabase isn't configured — silently ignore
    await supabaseAdmin.from("contact_messages").insert(data);
    return { ok: true };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) =>
    z.object({ email: z.string().trim().email().max(255) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert({ email: data.email, subscribed: true }, { onConflict: "email" } as any);
    return { ok: true };
  });
