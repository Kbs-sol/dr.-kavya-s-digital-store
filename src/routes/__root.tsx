import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";

/* ──────────────────────────────────────────────
   Analytics & Pixel environment helpers
   All values are injected via Cloudflare Secrets
   ────────────────────────────────────────────── */
const GTM_ID        = import.meta.env.VITE_GTM_ID        ?? "";   // e.g. GTM-XXXXXXX
const GA4_ID        = import.meta.env.VITE_GA4_ID        ?? "";   // e.g. G-XXXXXXXXXX
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID ?? "";   // e.g. 1234567890
const CLARITY_ID    = import.meta.env.VITE_CLARITY_ID    ?? "";   // e.g. xxxxxxxxxx

/* ── Organisation JSON-LD ── */
const orgSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://drkavyas.in/#org",
      name: "Dr. Kavya's Hair & Skin Care",
      url: "https://drkavyas.in",
      logo: {
        "@type": "ImageObject",
        url: "https://drkavyas.in/logo-seal.png",
        width: 400,
        height: 400,
      },
      description:
        "Doctor-led, 100% herbal Ayurvedic hair and skin care handcrafted in Visakhapatnam by Dr. Kavya Reddy. Pure roots, flowers and herbs — no chemicals, no preservatives.",
      foundingDate: "2022",
      founder: {
        "@type": "Person",
        name: "Dr. Kavya Reddy",
        jobTitle: "Dentist & Founder",
        sameAs: [
          "https://www.instagram.com/dr.kavya_reddy__/",
          "https://www.instagram.com/kavyas_hairandskincare/",
        ],
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Visakhapatnam",
        addressRegion: "Andhra Pradesh",
        addressCountry: "IN",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+91-7780-211-653",
          contactType: "customer service",
          availableLanguage: ["English", "Telugu"],
        },
      ],
      sameAs: [
        "https://www.instagram.com/kavyas_hairandskincare/",
        "https://www.instagram.com/dr.kavya_reddy__/",
      ],
      areaServed: "IN",
      brand: {
        "@type": "Brand",
        name: "Dr. Kavya's",
        slogan: "Pure hair and skin wellness",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://drkavyas.in/#website",
      url: "https://drkavyas.in",
      name: "Dr. Kavya's Hair & Skin Care",
      publisher: { "@id": "https://drkavyas.in/#org" },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://drkavyas.in/search?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "OnlineStore",
      "@id": "https://drkavyas.in/#store",
      name: "Dr. Kavya's Apothecary",
      url: "https://drkavyas.in/shop",
      currenciesAccepted: "INR",
      paymentAccepted: "Credit Card, Debit Card, UPI, Net Banking",
      priceRange: "₹149 - ₹2499",
      openingHours: "Mo-Su 09:00-21:00",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Visakhapatnam",
        addressRegion: "Andhra Pradesh",
        addressCountry: "IN",
      },
    },
  ],
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-kraft px-6">
      <div className="max-w-md text-center">
        <div className="font-hand text-8xl text-brand-tan mb-4">404</div>
        <h1 className="font-display text-3xl text-brand-brown mb-3">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has moved. Let's get you back to the apothecary.
        </p>
        <Link to="/" className="btn-primary">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-kraft px-6">
      <div className="max-w-md text-center">
        <div className="font-wordmark text-[10px] text-brand-gold mb-4">Something went wrong</div>
        <h1 className="font-display text-2xl text-brand-brown mb-3">
          This page didn't load correctly
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Something went wrong on our end. Please try refreshing or head back home.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-primary"
          >
            Try again
          </button>
          <a href="/" className="btn-ghost">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=5.0" },
      { title: "Dr. Kavya's Hair & Skin Care — Handmade Ayurvedic Apothecary, Visakhapatnam" },
      {
        name: "description",
        content:
          "Doctor-led 100% herbal hair and skin care handcrafted in Visakhapatnam by Dr. Kavya Reddy. Ayurvedic powders for hair fall control, face packs & bath rituals. No chemicals, no preservatives. Shop now, ships pan-India.",
      },
      { name: "keywords", content: "ayurvedic hair care, herbal hair mask visakhapatnam, hair fall control powder, natural face pack, nalugu pindi, Dr Kavya Reddy, handmade skincare andhra pradesh, bhringraj powder, chemical free hair care india" },
      { name: "author", content: "Dr. Kavya Reddy" },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "theme-color", content: "#3D2F1A" },
      { name: "msapplication-TileColor", content: "#3D2F1A" },
      /* ── Open Graph ── */
      { property: "og:site_name", content: "Dr. Kavya's Hair & Skin Care" },
      { property: "og:title", content: "Dr. Kavya's Hair & Skin Care — Handmade Ayurvedic Apothecary" },
      { property: "og:description", content: "Pure hair and skin wellness — 100% herbal, doctor-formulated, handcrafted in Visakhapatnam." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://drkavyas.in" },
      { property: "og:image", content: "https://drkavyas.in/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "en_IN" },
      /* ── Twitter / X ── */
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@kavyas_hairandskincare" },
      { name: "twitter:title", content: "Dr. Kavya's Hair & Skin Care" },
      { name: "twitter:description", content: "100% herbal Ayurvedic care. Doctor-formulated, handcrafted in Vizag." },
      { name: "twitter:image", content: "https://drkavyas.in/og-image.jpg" },
      /* ── Geo tags for local SEO ── */
      { name: "geo.region", content: "IN-AP" },
      { name: "geo.placename", content: "Visakhapatnam, Andhra Pradesh" },
      { name: "geo.position", content: "17.6868;83.2185" },
      { name: "ICBM", content: "17.6868, 83.2185" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://checkout.razorpay.com" },
      { rel: "dns-prefetch", href: "https://connect.facebook.net" },
      { rel: "canonical", href: "https://drkavyas.in/" },
    ],
    scripts: [
      /* ── Google Tag Manager (inline head script) ── */
      ...(GTM_ID ? [{
        children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
      }] : []),
      /* ── Google Analytics 4 (standalone — redundant if GTM is used) ── */
      ...(GA4_ID && !GTM_ID ? [
        { src: `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`, async: true },
        {
          children: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}', { send_page_view: true });`,
        },
      ] : []),
      /* ── Microsoft Clarity ── */
      ...(CLARITY_ID ? [{
        children: `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","${CLARITY_ID}");`,
      }] : []),
      /* ── Meta Pixel (head) ── */
      ...(META_PIXEL_ID ? [{
        children: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`,
      }] : []),
      /* ── Organization JSON-LD structured data ── */
      {
        type: "application/ld+json",
        children: JSON.stringify(orgSchema),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* GTM noscript fallback */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="GTM"
            />
          </noscript>
        )}
        {/* Meta Pixel noscript fallback */}
        {META_PIXEL_ID && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/* ── WhatsApp floating button ── */
function WhatsAppFAB() {
  return (
    <a
      href="https://wa.me/917780211653?text=Hi%2C%20I%27m%20interested%20in%20Dr.%20Kavya%27s%20hair%20and%20skin%20care%20products"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab"
      aria-label="Chat on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.49"/>
      </svg>
    </a>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  const isAuth  = pathname.startsWith("/auth");
  const bare    = isAdmin || isAuth;

  return (
    <QueryClientProvider client={queryClient}>
      {bare ? (
        <Outlet />
      ) : (
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1" id="main-content">
            <Outlet />
          </main>
          <Footer />
          <WhatsAppFAB />
        </div>
      )}
      <Toaster
        theme="light"
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "12px",
            letterSpacing: "0.05em",
            borderRadius: "2px",
          },
        }}
      />
    </QueryClientProvider>
  );
}
