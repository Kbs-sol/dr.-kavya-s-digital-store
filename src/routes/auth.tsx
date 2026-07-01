import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Mail, ArrowLeft, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Dr. Kavya's" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` },
    });
  }

  const inputClass =
    "w-full bg-transparent border border-border px-4 py-3.5 text-sm focus:outline-none focus:border-brand-brown transition placeholder:text-foreground/30";

  return (
    <div className="min-h-screen bg-kraft flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 font-wordmark text-[10px] tracking-widest uppercase text-foreground/50 hover:text-brand-brown transition mb-10">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>

        <div className="bg-white border border-border p-10 shadow-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <Logo />
          </div>

          {sent ? (
            /* ── Sent state ── */
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-7 w-7 text-brand-green" />
              </div>
              <h2 className="font-display text-2xl text-brand-brown mb-3">Check your inbox</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                We've sent a magic sign-in link to{" "}
                <strong className="text-brand-brown">{email}</strong>
                . Click the link to sign in — no password needed.
              </p>
              <p className="text-xs text-muted-foreground mb-8">
                Didn't get the email? Check your spam folder, or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-brand-gold hover:text-brand-brown underline"
                >
                  try again
                </button>
                .
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-brand-cream border border-border font-wordmark text-[10px] tracking-widest uppercase px-6 py-3 hover:bg-brand-brown hover:text-brand-cream hover:border-brand-brown transition"
              >
                Continue browsing
              </Link>
            </div>
          ) : (
            /* ── Sign in form ── */
            <>
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl text-brand-brown">Welcome</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Sign in with a magic link — no password required.
                </p>
              </div>

              {/* Google OAuth */}
              <button
                onClick={google}
                className="w-full border border-border py-3.5 text-sm hover:border-brand-brown hover:bg-brand-cream transition flex items-center justify-center gap-3 mb-6 font-wordmark text-[10px] tracking-widest uppercase"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-border" />
                <span className="font-wordmark text-[9px] text-muted-foreground tracking-widest uppercase">or with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="font-wordmark text-[9px] tracking-widest uppercase text-foreground/50 block mb-2">
                    Email address
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-brown text-brand-cream font-wordmark text-[11px] tracking-widest uppercase py-4 hover:bg-brand-gold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-brand-cream/40 border-t-brand-cream rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Send Magic Link
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-xs text-muted-foreground text-center leading-relaxed">
                A sign-in link will be emailed to you. New customers get an account automatically.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
