import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/quiz", label: "Hair Quiz" },
  { to: "/story", label: "Our Story" },
  { to: "/ingredients", label: "Ingredients" },
  { to: "/journal", label: "Journal" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [announcement, setAnnouncement] = useState<string>("Made in India · 100% Natural · made by mom");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("value")
      .eq("key", "announcement_bar")
      .maybeSingle()
      .then(({ data }: any) => {
        const v = data?.value;
        if (v && v.enabled !== false && v.text) setAnnouncement(v.text);
      });
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      {announcement && (
        <div className="bg-brand-brown text-brand-cream text-[11px]">
          <div className="max-w-7xl mx-auto px-6 py-2 text-center font-wordmark tracking-widest uppercase">
            {announcement}
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 font-wordmark text-[11px] text-foreground/80">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeProps={{ className: "text-brand-brown" }} className="hover:text-brand-brown transition">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/search" aria-label="Search" className="hidden sm:inline-flex">
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/track" className="hidden md:inline-flex font-wordmark text-[10px] text-foreground/70 hover:text-brand-brown">
            Track Order
          </Link>
          <Link to={signedIn ? "/account" : "/auth"} aria-label="Account" className="hidden sm:inline-flex">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/cart" className="relative" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 bg-brand-red text-brand-cream text-[10px] font-medium rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="px-6 py-4 flex flex-col gap-4 font-wordmark text-xs">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
            <Link to="/search" onClick={() => setOpen(false)}>Search</Link>
            <Link to="/track" onClick={() => setOpen(false)}>Track Order</Link>
            <Link to={signedIn ? "/account" : "/auth"} onClick={() => setOpen(false)}>
              {signedIn ? "Account" : "Sign in"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}