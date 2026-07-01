import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Menu, Search, ShoppingBag, User, X, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/shop", label: "Shop", sub: [
    { to: "/shop", label: "All Products" },
    { to: "/shop?category=hair-care", label: "Hair Care" },
    { to: "/shop?category=skin-care", label: "Skin Care" },
    { to: "/quiz", label: "Hair Quiz" },
  ]},
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
  const [scrolled, setScrolled] = useState(false);
  const [announcement, setAnnouncement] = useState("Made in Visakhapatnam · 100% Natural · Free shipping ₹499+");
  const [dropOpen, setDropOpen] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const router = useRouterState();
  const pathname = router.location.pathname;

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); setDropOpen(null); }, [pathname]);

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Scroll detection for glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Announcement from Supabase (fallback to default)
  useEffect(() => {
    supabase
      .from("site_content")
      .select("value")
      .eq("key", "announcement_bar")
      .maybeSingle()
      .then(({ data }: any) => {
        const v = data?.value;
        if (v?.enabled !== false && v?.text) setAnnouncement(v.text);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node)) setDropOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      {announcement && (
        <div className="bg-brand-brown text-brand-cream text-center py-2 px-4">
          <p className="font-wordmark text-[10px] tracking-[0.2em] uppercase">{announcement}</p>
        </div>
      )}

      {/* Main header */}
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-border shadow-sm"
            : "bg-[#FAF5EA]/95 backdrop-blur border-border"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-6">

          {/* Logo */}
          <Logo />

          {/* Desktop nav */}
          <nav ref={dropRef} className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV.map((n) => (
              <div key={n.to} className="relative">
                {n.sub ? (
                  <button
                    onClick={() => setDropOpen(dropOpen === n.label ? null : n.label)}
                    className={`flex items-center gap-1 font-wordmark text-[10px] tracking-[0.15em] uppercase transition hover:text-brand-brown ${
                      pathname.startsWith(n.to) ? "text-brand-brown" : "text-foreground/70"
                    }`}
                  >
                    {n.label}
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${dropOpen === n.label ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <Link
                    to={n.to}
                    activeProps={{ className: "text-brand-brown" }}
                    className="font-wordmark text-[10px] tracking-[0.15em] uppercase text-foreground/70 hover:text-brand-brown transition"
                  >
                    {n.label}
                  </Link>
                )}

                {/* Dropdown */}
                {n.sub && dropOpen === n.label && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-border shadow-xl py-1 z-50">
                    {n.sub.map((s) => (
                      <Link
                        key={s.to}
                        to={s.to as any}
                        onClick={() => setDropOpen(null)}
                        className="block px-4 py-2.5 font-wordmark text-[10px] tracking-wider uppercase text-foreground/70 hover:text-brand-brown hover:bg-brand-cream transition"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              to="/search"
              aria-label="Search"
              className="hidden sm:flex items-center justify-center w-9 h-9 hover:bg-brand-cream rounded-sm transition"
            >
              <Search className="h-4.5 w-4.5 text-foreground/70" />
            </Link>

            <Link
              to="/track"
              className="hidden lg:inline-flex font-wordmark text-[9px] tracking-widest uppercase text-foreground/50 hover:text-brand-brown border border-transparent hover:border-border px-2.5 py-1.5 transition"
            >
              Track Order
            </Link>

            <Link
              to={signedIn ? "/account" : "/auth"}
              aria-label="Account"
              className="hidden sm:flex items-center justify-center w-9 h-9 hover:bg-brand-cream rounded-sm transition"
            >
              <User className="h-4.5 w-4.5 text-foreground/70" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative flex items-center justify-center w-9 h-9 hover:bg-brand-cream rounded-sm transition" aria-label={`Cart (${count} items)`}>
              <ShoppingBag className="h-4.5 w-4.5 text-foreground/70" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 bg-brand-red text-brand-cream text-[9px] font-bold rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center leading-none">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 hover:bg-brand-cream rounded-sm transition"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {open && (
          <div className="md:hidden border-t border-border bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-0.5">
              {NAV.map((n) => (
                <div key={n.to}>
                  <Link
                    to={n.to}
                    className="block py-3 px-2 font-wordmark text-[11px] tracking-[0.18em] uppercase text-foreground/70 hover:text-brand-brown hover:bg-brand-cream transition"
                  >
                    {n.label}
                  </Link>
                  {n.sub && (
                    <div className="pl-4 border-l-2 border-brand-cream ml-2">
                      {n.sub.slice(1).map((s) => (
                        <Link
                          key={s.to}
                          to={s.to as any}
                          className="block py-2 px-2 font-wordmark text-[10px] tracking-wider uppercase text-foreground/50 hover:text-brand-brown transition"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-border flex items-center gap-3">
                <Link to={signedIn ? "/account" : "/auth"} className="flex-1 text-center py-3 bg-brand-brown text-brand-cream font-wordmark text-[10px] tracking-widest uppercase hover:bg-brand-gold transition">
                  {signedIn ? "My Account" : "Sign In"}
                </Link>
                <Link to="/cart" className="flex items-center gap-1.5 px-4 py-3 border border-border font-wordmark text-[10px] tracking-wider uppercase hover:border-brand-brown transition">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Cart {count > 0 && `(${count})`}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
