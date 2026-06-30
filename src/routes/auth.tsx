import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Mail, CheckCircle, ArrowLeft, Loader } from "lucide-react";

export const Route = createFileRoute("/auth")({ component: Auth });

/* ──────────────────────────────────────────────────────────
   Magic Link only authentication
   No passwords — email link = secure, frictionless login
   ────────────────────────────────────────────────────────── */
function Auth() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  /* Handle magic-link callback after user clicks email link */
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        nav({ to: "/account" });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
          shouldCreateUser: true, // auto-creates account on first login
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/account`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="min-h-screen bg-kraft flex items-center justify-center px-6 py-16">
      {/* Background botanical decoration */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233D2F1A' fill-opacity='1'%3E%3Cpath d='M30 30c0-11-9-20-20-20S-10 19-10 30 -1 50 10 50s20-9 20-20zm0 0c0 11 9 20 20 20s20-9 20-20-9-20-20-20-20 9-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-card border border-border p-10 shadow-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <Logo />
          </div>

          {!sent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-display text-2xl text-brand-brown mb-2">
                  Sign in or create account
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter your email and we'll send a secure magic link — no password needed.
                </p>
              </div>

              {/* Google OAuth */}
              <button
                onClick={googleSignIn}
                className="w-full flex items-center justify-center gap-3 border border-border py-3.5 text-sm font-wordmark text-[10px] hover:border-brand-brown hover:bg-brand-brown/4 transition mb-5 group"
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.038l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.583c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.583 9 3.583z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-4 text-[10px] font-wordmark text-muted-foreground">or continue with email</span>
                </div>
              </div>

              {/* Magic link form */}
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    required
                    type="email"
                    placeholder="your@email.com"
                    className="form-input pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                <button
                  disabled={loading || !email.trim()}
                  className="btn-primary w-full gap-2 btn-shimmer"
                  type="submit"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-brand-cream/30 border-t-brand-cream rounded-full animate-spin" />
                      Sending link…
                    </>
                  ) : (
                    <>Send Magic Link</>
                  )}
                </button>
              </form>

              {/* Trust copy */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-[10px] text-muted-foreground">
                  ✓ No password required &nbsp;·&nbsp; ✓ One-click login &nbsp;·&nbsp; ✓ Secure
                </p>
                <p className="text-[10px] text-muted-foreground">
                  New here? An account is created automatically on first login.
                </p>
              </div>

              {/* Back link */}
              <div className="mt-6 text-center">
                <Link to="/" className="inline-flex items-center gap-1 text-[10px] font-wordmark text-brand-gold hover:text-brand-brown transition">
                  <ArrowLeft className="h-3 w-3" />
                  Back to site
                </Link>
              </div>
            </>
          ) : (
            /* ── Sent confirmation state ── */
            <div className="text-center py-4">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 bg-brand-green/10 border border-brand-green/25 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-brand-green" />
                </div>
              </div>
              <h2 className="font-display text-2xl text-brand-brown mb-3">
                Check your inbox
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-sm mx-auto">
                We've sent a magic link to{" "}
                <span className="font-medium text-brand-brown">{email}</span>.
                Click the link in the email to sign in — it expires in 1 hour.
              </p>
              <div className="bg-brand-cream/60 border border-border p-4 text-xs text-muted-foreground leading-relaxed mb-6">
                <strong className="text-brand-brown">Can't find it?</strong> Check your spam or
                promotions folder. Or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-brand-gold hover:text-brand-brown underline underline-offset-2 transition"
                >
                  try a different email
                </button>
                .
              </div>
              <Link to="/" className="inline-flex items-center gap-1 text-[10px] font-wordmark text-brand-gold hover:text-brand-brown transition">
                <ArrowLeft className="h-3 w-3" />
                Back to site
              </Link>
            </div>
          )}
        </div>

        {/* Tagline below card */}
        <p className="text-center mt-6 font-hand text-brand-gold text-lg opacity-70">
          Pure care, pure trust.
        </p>
      </div>
    </div>
  );
}
