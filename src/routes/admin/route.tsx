import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { checkAdmin } from "@/lib/admin.functions";
import { Logo } from "@/components/Logo";
import {
  isMockAdmin,
  mockAdminLogin,
  mockAdminLogout,
  getMockAdminSession,
} from "@/lib/mock-admin";
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Ticket,
  FileText, BookOpen, Star, MessageSquare, HelpCircle,
  Inbox, Eye, EyeOff, LogOut, AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const NAV = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/categories", label: "Categories", Icon: Tag },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { to: "/admin/coupons", label: "Coupons", Icon: Ticket },
  { to: "/admin/content", label: "Site Content", Icon: FileText },
  { to: "/admin/blog", label: "Journal", Icon: BookOpen },
  { to: "/admin/reviews", label: "Reviews", Icon: Star },
  { to: "/admin/testimonials", label: "Testimonials", Icon: MessageSquare },
  { to: "/admin/faqs", label: "FAQs", Icon: HelpCircle },
  { to: "/admin/messages", label: "Messages", Icon: Inbox },
];

/* ── Mock admin login gate ──────────────────────────────────── */
function MockLoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("admin@drkavyas.in");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = mockAdminLogin(email, password);
    if (ok) {
      onSuccess();
    } else {
      setError("Invalid credentials. Try the test credentials below.");
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF5EA] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-border p-10 shadow-sm">
          <div className="text-center mb-8">
            <Logo />
            <div className="mt-4 font-wordmark text-[10px] tracking-widest uppercase text-brand-gold">
              Admin Panel
            </div>
          </div>

          {/* Demo mode notice */}
          <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-6 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-wordmark text-[9px] tracking-wider uppercase text-amber-700 mb-1">Demo Mode</p>
              <p className="text-xs text-amber-600">Supabase not connected. Using local test credentials.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-wordmark text-[9px] tracking-widest uppercase text-foreground/50 block mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border px-3 py-3 text-sm focus:outline-none focus:border-brand-brown bg-transparent"
              />
            </div>
            <div>
              <label className="font-wordmark text-[9px] tracking-widest uppercase text-foreground/50 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="DrKavya@Admin2024"
                  className="w-full border border-border px-3 py-3 text-sm focus:outline-none focus:border-brand-brown bg-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-brown"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-brand-red">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-brown text-brand-cream font-wordmark text-[11px] tracking-widest uppercase py-3.5 hover:bg-brand-gold transition"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border">
            <p className="font-wordmark text-[9px] tracking-widest uppercase text-foreground/40 mb-2">Test Credentials</p>
            <p className="text-xs text-muted-foreground">Email: <code className="text-brand-brown">admin@drkavyas.in</code></p>
            <p className="text-xs text-muted-foreground mt-1">Password: <code className="text-brand-brown">DrKavya@Admin2024</code></p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="font-wordmark text-[9px] tracking-widest uppercase text-foreground/40 hover:text-brand-brown transition">
              ← Back to site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Layout ───────────────────────────────────────────── */
function AdminLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const check = useServerFn(checkAdmin);
  const [ready, setReady] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mockSession = isMock ? getMockAdminSession() : null;

  useEffect(() => {
    // 1. Check if mock admin is already logged in
    if (isMockAdmin()) {
      setIsMock(true);
      setReady(true);
      return;
    }

    // 2. Try Supabase auth
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          // No Supabase user — show mock login gate
          setIsMock(false);
          setReady(false);
          return;
        }
        const r = await check({});
        if (!r.isAdmin) { navigate({ to: "/account" }); return; }
        setIsMock(false);
        setReady(true);
      } catch {
        // Supabase not available — show mock login gate
        setIsMock(false);
        setReady(false);
      }
    })();
  }, [navigate, check]);

  function handleMockSuccess() {
    setIsMock(true);
    setReady(true);
  }

  async function handleLogout() {
    if (isMock) {
      mockAdminLogout();
      setReady(false);
      setIsMock(false);
      return;
    }
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  // Loading spinner
  if (!ready && !isMock) {
    // Show mock login gate (Supabase not connected / no session)
    return <MockLoginGate onSuccess={handleMockSuccess} />;
  }

  const Sidebar = (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-[#1C1409] text-brand-cream flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-brand-brown/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-gold rounded-sm flex items-center justify-center">
            <span className="font-display text-sm text-white">K</span>
          </div>
          <div>
            <div className="font-wordmark text-[9px] tracking-widest uppercase text-brand-gold">Admin</div>
            <div className="font-display text-sm text-brand-cream">Dr. Kavya's</div>
          </div>
        </div>
        {(isMock || mockSession) && (
          <div className="mt-2 text-[9px] font-wordmark text-amber-400 tracking-wider uppercase">Demo Mode</div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, Icon, exact }) => {
          const active = exact ? path === to : path === to || path.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 rounded-sm ${
                active
                  ? "bg-brand-gold/20 text-brand-gold border-l-2 border-brand-gold"
                  : "text-brand-cream/60 hover:text-brand-cream hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="font-wordmark text-[10px] tracking-wider uppercase">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-brand-brown/30 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2 text-[9px] font-wordmark tracking-widest uppercase text-brand-cream/40 hover:text-brand-cream transition px-3 py-2"
        >
          <Eye className="h-3.5 w-3.5" />
          View Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-[9px] font-wordmark tracking-widest uppercase text-brand-red/70 hover:text-brand-red transition px-3 py-2"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col" style={{ height: "100vh", position: "sticky", top: 0 }}>
        {Sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex flex-col w-64">{Sidebar}</div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded"
          >
            <LayoutDashboard className="h-5 w-5" />
          </button>
          <Logo />
          <div />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
