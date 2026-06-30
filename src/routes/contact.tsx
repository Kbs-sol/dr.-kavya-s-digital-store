import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContact } from "@/lib/contact.functions";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const submit = useServerFn(submitContact);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await submit({ data: form });
      toast.success("Thank you — we'll be in touch.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (e: any) { toast.error(e?.message ?? "Could not send"); } finally { setLoading(false); }
  }

  const input = "w-full bg-transparent border border-border px-3 py-3 text-sm focus:outline-none focus:border-brand-brown";

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16">
      <div>
        <div className="font-wordmark text-[10px] text-brand-gold">Get in touch</div>
        <h1 className="font-display text-5xl text-brand-brown mt-3">We'd love to hear from you.</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">For orders, partnerships, press or just to share your before-and-after — drop us a line.</p>
        <ul className="mt-10 space-y-4 text-sm">
          <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-brand-green" /> Visakhapatnam &amp; Vijayawada, AP</li>
          <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-brand-green" /> +91 7780 211 653</li>
          <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-brand-green" /> hello@drkavyas.in</li>
        </ul>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <input required placeholder="Your name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input required type="email" placeholder="Email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Phone (optional)" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <input placeholder="Subject" className={input} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <textarea required rows={6} placeholder="Your message" className={input} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <button disabled={loading} className="bg-brand-brown text-brand-cream font-wordmark text-xs px-6 py-4 hover:bg-brand-gold transition disabled:opacity-50">{loading ? "Sending…" : "Send message"}</button>
      </form>
    </div>
  );
}