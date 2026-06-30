# 🌿 Dr. Kavya's Hair & Skin Care — System Literacy File
**Last updated:** 2026-06-30  
**Version:** 1.0  
**Author:** AI Developer Sandbox Build

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Cloudflare Secrets (Required Variables)](#cloudflare-secrets)
4. [Supabase Setup](#supabase-setup)
5. [Admin Dashboard](#admin-dashboard)
6. [Test Credentials](#test-credentials)
7. [Authentication](#authentication)
8. [Payment — Razorpay](#payment--razorpay)
9. [Images — Cloudinary](#images--cloudinary)
10. [Email — Resend / Brevo / MailerSend](#email)
11. [Analytics Setup](#analytics-setup)
12. [Meta Pixel & CAPI](#meta-pixel--capi)
13. [Google Merchant Center & Shopping](#google-merchant-center--shopping)
14. [SEO Architecture](#seo-architecture)
15. [Deployment to Cloudflare Pages](#deployment-to-cloudflare-pages)
16. [Database Schema](#database-schema)
17. [Codebase Structure](#codebase-structure)
18. [Frequently Asked Dev Questions](#frequently-asked-dev-questions)

---

## Project Overview

**Brand:** Dr. Kavya's Hair & Skin Care  
**Founder:** Dr. Kavya Reddy (Dentist · Visakhapatnam)  
**Domain:** `drkavyas.in` (to be configured)  
**Platform:** Cloudflare Pages (SSR via TanStack Start + Nitro)  
**Database:** Supabase (PostgreSQL + Auth + Row-Level Security)  
**Payments:** Razorpay (prepaid only — no COD)  
**Images:** Cloudinary (auto-optimised CDN delivery)  
**Email:** Resend (transactional) — or Brevo/MailerSend as fallback  
**Auth:** Supabase Magic Links (no passwords) + Google OAuth  

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + TanStack Start + TanStack Router |
| CSS | Tailwind CSS v4 |
| UI components | Radix UI (headless) + custom Sonner toasts |
| SSR / bundler | Vite 8 + Nitro (TanStack Start) |
| Deployment | Cloudflare Pages (edge SSR) |
| Database | Supabase (PostgreSQL, RLS, Auth) |
| Auth | Supabase Magic Link + Google OAuth |
| Payments | Razorpay (INR, UPI + cards) |
| Image CDN | Cloudinary (auto-optimize, WebP) |
| Email | Resend API |
| Analytics | Google Analytics 4 + Google Tag Manager |
| Pixel | Meta Pixel + Conversions API (CAPI) |
| Behaviour | Microsoft Clarity |
| SEO | JSON-LD structured data, sitemap, FAQPage schema |
| Reviews | Custom in-app (linked to Google Merchant Center schema) |

---

## Cloudflare Secrets

Set these in **Cloudflare Dashboard → Pages → Settings → Environment Variables → Production (Encrypted)**  
Also add to `.env` for local development (never commit this file).

### Required Secrets

```bash
# ── Supabase ────────────────────────────────────────
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_XXXXXX
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # SERVER ONLY — never expose client-side

# ── Razorpay ────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# ── Resend (email) ──────────────────────────────────
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXX

# ── Cloudinary ──────────────────────────────────────
# (Client-side — use VITE_ prefix)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=drkavyas_products  # Create unsigned preset in Cloudinary dashboard

# ── Analytics (client-side — use VITE_ prefix) ──────
VITE_GTM_ID=GTM-XXXXXXX
VITE_GA4_ID=G-XXXXXXXXXX
VITE_META_PIXEL_ID=1234567890123456
VITE_CLARITY_ID=xxxxxxxxxx

# ── Meta CAPI (server-side) ─────────────────────────
META_CAPI_ACCESS_TOKEN=your_capi_access_token_here
META_PIXEL_ID=1234567890123456  # Same as VITE_ version

# ── Google Merchant Center ──────────────────────────
# No code secret needed — feed is automatic via sitemap + schema
VITE_GOOGLE_MERCHANT_ID=your_merchant_id  # Used for merchant product IDs in schema

# ── Google Review Widget ─────────────────────────────
VITE_GOOGLE_PLACE_ID=ChIJxxxxxxxxxxxxxxxx  # Your Google Business Place ID

# ── Site config ─────────────────────────────────────
VITE_SITE_URL=https://drkavyas.in
```

### How to add secrets to Cloudflare Pages

1. Go to **Cloudflare Dashboard → Workers & Pages → drkavyas**
2. Click **Settings → Environment Variables**
3. Click **+ Add variable**
4. Set **Type** to **Secret** (encrypted)
5. Paste the value, click **Save**
6. Redeploy for changes to take effect

---

## Supabase Setup

### Step 1 — Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `drkavyas`, region: `ap-south-1` (Mumbai — closest to India)
3. Save your **Project URL** and **anon/publishable key** and **service_role key**

### Step 2 — Run Migrations
In the Supabase SQL Editor, run all files in order:
```
supabase/migrations/20260630171110_*.sql  → Core schema + seed data
supabase/migrations/20260630171131_*.sql  → Testimonials + FAQs
supabase/migrations/20260630173823_*.sql  → Additional tables
supabase/migrations/20260630173846_*.sql  → Policies
supabase/migrations/20260630174128_*.sql  → Functions
supabase/migrations/20260630175757_*.sql  → Final setup
```

### Step 3 — Auth Configuration
In Supabase Dashboard → **Authentication → Settings**:

- **Email provider**: Enabled
- **Email confirmations**: Disabled (magic links auto-confirm)
- **Magic Link**: Enabled ✅
- **Google OAuth**: Enable + paste Client ID + Secret from Google Cloud Console
  - Authorized redirect URI: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
- **Site URL**: `https://drkavyas.in`
- **Redirect URLs** (allowed): `https://drkavyas.in/**`

### Step 4 — Create Admin User
After running migrations, set yourself as admin:
```sql
-- Run in Supabase SQL Editor after signing up via magic link
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your-admin-email@example.com';
```

---

## Admin Dashboard

**URL:** `https://drkavyas.in/admin`  
**Access:** Restricted to users with `role = 'admin'` in `user_roles` table.

### Admin Sections

| Page | URL | What you can do |
|---|---|---|
| **Dashboard** | `/admin` | Revenue, order count, pending stats |
| **Products** | `/admin/products` | Add/edit/delete products, upload Cloudinary images |
| **Orders** | `/admin/orders` | View all orders, update status (packed/shipped/delivered), add tracking URL |
| **Reviews** | `/admin/reviews` | Approve/reject customer reviews |
| **Testimonials** | `/admin/testimonials` | Add/edit Instagram/WhatsApp testimonials |
| **Categories** | `/admin/categories` | Manage product categories |
| **Coupons** | `/admin/coupons` | Create discount codes (flat or %) |
| **Blog/Journal** | `/admin/blog` | Write and publish blog posts |
| **FAQs** | `/admin/faqs` | Add/edit FAQ items with categories |
| **Messages** | `/admin/messages` | Read and respond to contact form submissions |
| **Site Content** | `/admin/content` | Edit announcement bar, hero text, trust badges, contact info, shipping settings |

---

## Test Credentials

### Admin Access (Development)
```
Email:    admin@drkavyas.in
Password: (magic link — use real email for testing)
Role:     admin
```
To assign admin role to a test email:
```sql
-- Supabase SQL Editor
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@drkavyas.in'
ON CONFLICT DO NOTHING;
```

### Razorpay Test Mode
```
Test Key ID:      rzp_test_XXXXXXXXXXXXXXXX  (from Razorpay dashboard)
Test Key Secret:  (from Razorpay dashboard)
Test UPI:         success@razorpay (always succeeds)
Test Card:        4111 1111 1111 1111 | CVV: any 3 digits | Expiry: any future date
```

### First-order Coupon (pre-seeded)
```
Code:     KAVYALOVE15
Discount: 15% off
Min:      No minimum
```

---

## Authentication

### Magic Link Flow (Primary)
1. User enters email on `/auth`
2. Supabase sends magic link email (expires in 1 hour)
3. User clicks link → redirected to `/account`
4. New users: account auto-created (no separate signup needed)

### Google OAuth (Secondary)
1. User clicks "Continue with Google" on `/auth`
2. Google OAuth popup/redirect
3. Returns to `/account`

### No Passwords
This site intentionally uses **no password authentication**. All logins are via magic links or Google. This reduces account security risks and support burden.

---

## Payment — Razorpay

### Flow
1. Customer fills checkout form → clicks "Place order"
2. Server creates `order` in Supabase (status: `pending`)
3. Server calls Razorpay `POST /v1/orders` → gets `razorpay_order_id`
4. Razorpay checkout opens in browser
5. Customer pays via UPI/card/netbanking
6. Razorpay calls our handler with `razorpay_payment_id` + signature
7. Server verifies HMAC signature
8. Order status updated to `paid` in Supabase
9. Stock decremented
10. Confirmation email sent via Resend

### Order Numbers
Format: `DK{YY}{MM}{4-digit random}` → e.g. `DK2607-4821`

### Razorpay Dashboard Setup
1. Sign up at [razorpay.com](https://razorpay.com)
2. Get API Key (test) from Settings → API Keys
3. Enable UPI, Cards, Net Banking
4. Set Webhook for payment verification (optional but recommended):
   - URL: `https://drkavyas.in/api/razorpay/webhook`
   - Event: `payment.captured`

---

## Images — Cloudinary

### Setup
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier)
2. Dashboard → Settings → Upload Presets
3. Create **unsigned** preset named `drkavyas_products`
   - Mode: Unsigned
   - Folder: `drkavyas`
   - Eager transforms: `q_auto,f_auto,w_800`
   - Max file size: 10MB

### URL Transformation
All uploaded product images automatically get:
```
https://res.cloudinary.com/{CLOUD_NAME}/image/upload/q_auto,f_auto,w_800/drkavyas/...
```
- `q_auto` — automatic quality optimization
- `f_auto` — WebP for modern browsers, fallback to JPG
- `w_800` — max 800px wide for product listings

### Admin Usage
In the admin products panel, click **Upload Image** → drag file or click to select → Cloudinary URL auto-fills.

---

## Email

### Primary: Resend
1. Sign up at [resend.com](https://resend.com)
2. Add domain `drkavyas.in` → verify DNS
3. Get API key → set `RESEND_API_KEY` in Cloudflare Secrets
4. "From" address: `Dr. Kavya's <orders@drkavyas.in>`

### Email Templates (auto-sent)
| Trigger | Template |
|---|---|
| Order placed + paid | Order confirmation with items, total, tracking note |
| Shipment update | Tracking URL notification |
| Magic link | Auto-handled by Supabase Auth |

### Alternative: Brevo (Sendinblue)
If Resend free tier exhausted (100 emails/day), switch to Brevo:
1. Sign up at [brevo.com](https://brevo.com)
2. Get SMTP or API key
3. Update `sendEmail()` in `src/lib/orders.functions.ts`

---

## Analytics Setup

### Google Analytics 4
1. Go to [analytics.google.com](https://analytics.google.com) → New property
2. Platform: Web, URL: `drkavyas.in`
3. Get **Measurement ID** (format: `G-XXXXXXXXXX`)
4. Set `VITE_GA4_ID` in Cloudflare Secrets

### Google Tag Manager
1. Go to [tagmanager.google.com](https://tagmanager.google.com) → New account
2. Container: Web → Get **Container ID** (format: `GTM-XXXXXXX`)
3. Set `VITE_GTM_ID` in Cloudflare Secrets
4. GTM auto-loads GA4, Meta Pixel events, and all other tags
5. In GTM, create triggers for:
   - Purchase (thank you page)
   - Add to Cart
   - Begin Checkout
   - Page View (automatic)

### Microsoft Clarity
1. Go to [clarity.microsoft.com](https://clarity.microsoft.com) → New project
2. Get **Project ID** (10-character code)
3. Set `VITE_CLARITY_ID` in Cloudflare Secrets
4. Clarity shows heatmaps, session recordings, rage clicks

---

## Meta Pixel & CAPI

### Pixel Setup
1. Go to [Meta Business Manager](https://business.facebook.com) → Events Manager
2. Create a Pixel → get **Pixel ID**
3. Set `VITE_META_PIXEL_ID` in Cloudflare Secrets

### Events Fired
| Event | Trigger |
|---|---|
| `PageView` | Every page load (auto) |
| `AddToCart` | Product "Add to Cart" click |
| `InitiateCheckout` | Checkout page load |
| `Purchase` | After Razorpay payment verified |
| `ViewContent` | Product page view |

### Conversions API (CAPI — Server-Side)
For iOS 14+ privacy compliance, also send events server-side:
1. Get CAPI Access Token from Meta Events Manager
2. Set `META_CAPI_ACCESS_TOKEN` in Cloudflare Secrets
3. Add server-side event calls in `orders.functions.ts` after payment verification

### Instagram Shop + WhatsApp Catalog
1. Upload `DrKavyas_WhatsApp_Catalog.csv` to Meta Commerce Manager
2. Connect Instagram Shopping
3. Tag products in Reels + Stories

---

## Google Merchant Center & Shopping

### Setup
1. Go to [merchants.google.com](https://merchants.google.com) → Create account
2. Verify domain `drkavyas.in` via DNS TXT record
3. Business info: Dr. Kavya's, INR, India

### Product Feed
- Automatic via Google to crawl your structured data (JSON-LD `Product` schema on each product page)
- OR submit XML feed: `https://drkavyas.in/sitemap.xml` (contains product URLs)
- OR use Google Merchant Center Feed via spreadsheet

### Google Shopping Tab
Each product page has a complete `Product` JSON-LD block with:
- `name`, `description`, `image`, `sku`, `brand`
- `offers.priceCurrency` = INR, `offers.price`
- `offers.availability` = InStock/OutOfStock
- `offers.shippingDetails` (rate ₹79, 3–7 days)
- `offers.hasMerchantReturnPolicy`
- `aggregateRating` + individual `review` objects

Google crawls this automatically within 2–4 weeks of launch.

### Product Review Feed
To show ★★★★★ in Google Shopping:
1. Export reviews from Supabase: `SELECT * FROM reviews WHERE approved=true`
2. Format as [Google Product Reviews Feed XML](https://support.google.com/merchants/answer/7562052)
3. Submit via Merchant Center → Product Reviews → Upload

---

## SEO Architecture

### Page-level Meta Tags
Every route sets its own `title`, `description`, `og:title`, `canonical` via TanStack Router's `head()`.

### Structured Data
| Page | Schema Type |
|---|---|
| All pages | `Organization`, `WebSite`, `OnlineStore` |
| Homepage | `WebPage`, `LocalBusiness` |
| Product pages | `Product` with `Offer`, `AggregateRating`, `Review` |
| FAQ page | `FAQPage` with 15+ geo-targeted Q&As |
| Blog posts | `BlogPosting`, `BreadcrumbList` |
| Shop page | `ItemList` |

### Geo-Targeted Keywords Covered
- Visakhapatnam / Vizag hair care
- Vijayawada Ayurvedic products
- Hyderabad herbal hair mask
- Telugu bath powder / Nalugu Pindi
- Chemical free hair care India
- Bhringraj powder buy online
- Dr Kavya Reddy hair products

### Sitemap
Auto-generated at `https://drkavyas.in/sitemap.xml` including:
- All static pages
- All published product URLs
- All published blog post URLs
- Category filter pages for Google Shopping

---

## Deployment to Cloudflare Pages

### First Deployment
1. Connect GitHub repo `Kbs-sol/drkavyas` to Cloudflare Pages
2. Build command: `npm run build`
3. Build output: `.output/public`
4. Node version: 20
5. Add all environment variables (see Cloudflare Secrets section above)
6. Deploy!

### Environment Variables for Build
Cloudflare needs these **at build time** (marked as Plain, not Secret):
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_GTM_ID
VITE_GA4_ID
VITE_META_PIXEL_ID
VITE_CLARITY_ID
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
VITE_SITE_URL
```

These are **server-side only** (Encrypted Secrets):
```
SUPABASE_SERVICE_ROLE_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RESEND_API_KEY
META_CAPI_ACCESS_TOKEN
```

### Custom Domain
1. Cloudflare Pages → Custom domain → `drkavyas.in`
2. Update nameservers to Cloudflare (or add CNAME if already on CF)
3. SSL auto-provisioned by Cloudflare

---

## Database Schema

### Core Tables

```
profiles          → User profile (name, phone, email)
user_roles        → admin | customer roles
categories        → Hair Care, Skin Care, Body Care, Combos, Gifting
products          → All product data (pricing, images, stock, badges)
product_images    → Additional gallery images per product
reviews           → Customer product reviews (with approval)
testimonials      → Curated social proof (Instagram/WhatsApp)
addresses         → Saved shipping addresses
coupons           → Discount codes (percent or flat)
orders            → Order header with Razorpay IDs
order_items       → Line items per order
blog_posts        → Journal/blog content
site_content      → Key-value JSON for CMS-style editable content
contact_messages  → Contact form submissions
newsletter_subs   → Email newsletter subscribers
faqs              → FAQ items with category grouping
```

### Key `site_content` Keys (editable via Admin → Site Content)
```json
{
  "announcement_bar":   {"enabled": true, "text": "Free shipping above ₹699 · Made in Vizag"},
  "home_hero":          {"title": "...", "subtitle": "...", "cta_primary": "..."},
  "trust_badges":       ["100% Herbal", "Paraben-Free", ...],
  "founder":            {"name": "Dr. Kavya Reddy", "quote": "...", "image": "..."},
  "contact":            {"email": "hello@drkavyas.in", "phone": "...", "whatsapp": "..."},
  "shipping_settings":  {"flat_rate": 79, "free_above": 699}
}
```

---

## Codebase Structure

```
webapp/
├── src/
│   ├── routes/
│   │   ├── __root.tsx          ← Root layout, GTM, Meta Pixel, JSON-LD, WhatsApp FAB
│   │   ├── index.tsx           ← Homepage (Hero, Products, Story, Testimonials, Newsletter)
│   │   ├── shop/index.tsx      ← Product listing with category filters
│   │   ├── product.$slug.tsx   ← Product detail (Google Shopping schema, reviews, add to cart)
│   │   ├── cart.tsx            ← Cart page
│   │   ├── checkout.tsx        ← Checkout + Razorpay flow
│   │   ├── auth.tsx            ← Magic link auth (no passwords)
│   │   ├── account.tsx         ← Account + order history
│   │   ├── story.tsx           ← About/founder story
│   │   ├── ingredients.tsx     ← Ingredients encyclopedia
│   │   ├── journal/            ← Blog index + post detail
│   │   ├── faq.tsx             ← FAQ with 15+ geo-targeted Q&As + FAQPage schema
│   │   ├── contact.tsx         ← Contact form
│   │   ├── quiz.tsx            ← Hair type quiz
│   │   ├── track.tsx           ← Order tracker
│   │   ├── search.tsx          ← Product search
│   │   ├── order.$id.tsx       ← Order confirmation
│   │   ├── sitemap[.]xml.ts    ← Dynamic sitemap
│   │   └── admin/              ← Admin dashboard (auth-gated)
│   │       ├── index.tsx       ← Dashboard stats
│   │       ├── products.tsx    ← Product CRUD + Cloudinary
│   │       ├── orders.tsx      ← Order management
│   │       ├── reviews.tsx     ← Review approval
│   │       ├── testimonials.tsx
│   │       ├── categories.tsx
│   │       ├── coupons.tsx
│   │       ├── blog.tsx
│   │       ├── faqs.tsx
│   │       ├── messages.tsx
│   │       └── content.tsx     ← CMS: edit site_content JSON
│   ├── components/
│   │   ├── Header.tsx          ← Sticky header, mobile menu, cart badge
│   │   ├── Footer.tsx          ← Footer with links + newsletter
│   │   ├── Logo.tsx            ← Brand logo component
│   │   ├── ProductCard.tsx     ← Product grid card with quick-add
│   │   ├── Section.tsx         ← Reusable section wrapper
│   │   ├── Testimonials.tsx    ← Testimonial grid
│   │   └── admin/AdminPage.tsx ← Admin shell + sidebar + CloudinaryUpload
│   ├── lib/
│   │   ├── site.functions.ts   ← Public data fetching (products, FAQs, blog)
│   │   ├── admin.functions.ts  ← Admin-only CRUD server functions
│   │   ├── orders.functions.ts ← Order placement + Razorpay + email
│   │   ├── cart.ts             ← Client-side cart store (localStorage)
│   │   └── format.ts           ← INR formatter, slugify
│   ├── integrations/
│   │   ├── supabase/client.ts  ← Browser Supabase client
│   │   └── supabase/client.server.ts ← Server Supabase admin client
│   ├── assets/                 ← Static images (hero, story, ingredients)
│   └── styles.css              ← Full brand design system (Tailwind + CSS vars)
├── supabase/
│   └── migrations/             ← SQL migration files (run in Supabase SQL Editor)
├── public/
│   ├── robots.txt              ← SEO robot instructions
│   └── llms.txt                ← AI crawler guidance
├── SYSTEM_LITERACY.md          ← This file!
├── .env                        ← Local secrets (NEVER commit)
├── vite.config.ts              ← Build config (TanStack Start + Cloudflare)
└── package.json                ← Dependencies
```

---

## Frequently Asked Dev Questions

### Q: How do I add a new product?
A: Admin → Products → "New Product" → fill form → upload image via Cloudinary → Save. Products are immediately live if "Published" is ticked.

### Q: How do I change the announcement bar?
A: Admin → Site Content → Edit the `announcement_bar` JSON key. Set `enabled: true` and change `text`.

### Q: How do I update shipping cost?
A: Admin → Site Content → Edit `shipping_settings` JSON key:
```json
{"flat_rate": 79, "free_above": 699}
```

### Q: How do I mark an order as shipped?
A: Admin → Orders → Click edit on the order → Change status to "shipped" → Paste the courier tracking URL → Save. Customer will see it on `/track`.

### Q: How do I create a discount code?
A: Admin → Coupons → New Coupon → Set code (e.g. `DIWALI20`), type (percent/flat), value, min order, expiry.

### Q: How do I approve a customer review?
A: Admin → Reviews → Click the ✓ button on a pending review. Approved reviews show on product pages and feed Google Shopping rich snippets.

### Q: How do I change the Meta Pixel ID?
A: Cloudflare Pages → Settings → Environment Variables → Edit `VITE_META_PIXEL_ID`. Redeploy.

### Q: How does Google automatically find products for Google Shopping?
A: Every product page has a `<script type="application/ld+json">` with `@type: Product` + price + availability. Google's Shopping crawler reads this. After submitting your domain to Google Search Console + Merchant Center, products appear in Shopping within 2–4 weeks.

### Q: Can I add more languages (Telugu)?
A: Currently English only. To add Telugu support, update the `lang` attribute in `__root.tsx` and add `hreflang` meta tags. Translate the key marketing copy in each route's head meta.

---

*This system literacy file should be updated whenever major features are added or changed.*
