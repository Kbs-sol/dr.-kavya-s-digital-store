import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { checkAdmin, adminBootstrap } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  const nav = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const checkAdminFn = useServerFn(checkAdmin);
  const bootstrap = useServerFn(adminBootstrap);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { nav({ to: "/auth" }); return; }
      setEmail(data.user.email ?? null);
      try {
        const r = await checkAdminFn({});
        setIsAdmin(!!r.isAdmin);
      } catch {}
    });
  }, [nav, checkAdminFn]);

  async function makeAdmin() {
    try {
      const r = await bootstrap({});
      if (r.ok) { toast.success("You are now an admin."); setIsAdmin(true); }
      else toast.error(r.reason ?? "Not allowed");
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function signOut() { await supabase.auth.signOut(); nav({ to: "/" }); }

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="font-wordmark text-[10px] text-brand-gold">My account</div>
      <h1 className="font-display text-4xl text-brand-brown mt-3">Welcome back.</h1>
      <p className="mt-3 text-muted-foreground">{email}</p>
      <div className="mt-10 grid md:grid-cols-2 gap-4">
        {isAdmin && (
          <Link to="/admin" className="border border-brand-brown p-6 hover:bg-brand-brown hover:text-brand-cream transition">
            <div className="font-wordmark text-[10px] text-brand-gold">Admin</div>
            <div className="font-display text-xl mt-2">Open admin panel →</div>
          </Link>
        )}
        {!isAdmin && (
          <button onClick={makeAdmin} className="border border-border p-6 hover:border-brand-brown text-left">
            <div className="font-wordmark text-[10px] text-brand-gold">First-time setup</div>
            <div className="font-display text-xl mt-2">Claim admin access</div>
            <div className="text-xs text-muted-foreground mt-2">Only works if no admin exists yet.</div>
          </button>
        )}
        <button onClick={signOut} className="border border-border p-6 hover:border-brand-red text-left">
          <div className="font-wordmark text-[10px] text-brand-gold">Session</div>
          <div className="font-display text-xl mt-2">Sign out</div>
        </button>
      </div>
    </div>
  );
}