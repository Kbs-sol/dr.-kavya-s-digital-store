import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { checkAdmin } from "@/lib/admin.functions";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const nav = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/coupons", label: "Coupons" },
  { to: "/admin/content", label: "Content" },
  { to: "/admin/blog", label: "Journal" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/testimonials", label: "Testimonials" },
  { to: "/admin/faqs", label: "FAQs" },
  { to: "/admin/messages", label: "Messages" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const check = useServerFn(checkAdmin);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { navigate({ to: "/auth" }); return; }
      try {
        const r = await check({});
        if (!r.isAdmin) { navigate({ to: "/account" }); return; }
        setReady(true);
      } catch { navigate({ to: "/account" }); }
    })();
  }, [navigate, check]);

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 border-r border-border bg-card p-6 hidden md:flex flex-col gap-1">
        <div className="mb-6"><Logo /></div>
        <div className="font-wordmark text-[9px] text-brand-gold mb-2">Admin</div>
        {nav.map((n) => {
          const active = n.exact ? path === n.to : path === n.to || path.startsWith(n.to + "/");
          return (
            <Link key={n.to} to={n.to} className={`px-3 py-2 text-sm rounded ${active ? "bg-brand-brown text-brand-cream" : "hover:bg-muted"}`}>
              {n.label}
            </Link>
          );
        })}
        <div className="mt-auto pt-6 text-xs">
          <Link to="/" className="text-muted-foreground hover:text-brand-brown">← View site</Link>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto"><Outlet /></main>
    </div>
  );
}