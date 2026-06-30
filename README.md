# 🌿 Dr. Kavya's Hair & Skin Care — E-Commerce Website

A full-featured Ayurvedic D2C e-commerce store built for Dr. Kavya Reddy, Visakhapatnam.

## 🌐 Live URLs
- **Production:** https://drkavyas.in (deploy to Cloudflare Pages)
- **Preview:** https://3000-ihdp1bnatha99y98rrmkk-0e616f0a.sandbox.novita.ai (sandbox dev)

## ✅ Completed Features

### Storefront
- **Homepage** — Hero with social proof, trust bar, 4 pillar USPs, featured products, founder story, ingredients showcase, testimonials, process steps, newsletter signup
- **Shop** — Category filter (Hair/Skin/Body/Combos/Gifting), product grid, SEO title
- **Product Pages** — Image gallery with zoom, quantity picker, add-to-cart, Google Shopping JSON-LD schema with pricing, reviews, shipping details, return policy
- **Cart** — Persistent cart (localStorage), item quantities, subtotal
- **Checkout** — Shipping address, coupon code, Razorpay payment (UPI/Cards/NetBanking)
- **Order Confirmation** — Post-payment thank you with order summary
- **Order Tracker** — Track by order number + email
- **Hair Quiz** — Product recommendation quiz
- **Ingredients** — Encyclopedia of herbs used
- **Journal/Blog** — SEO-optimised blog posts
- **FAQ** — 15+ geo-targeted Q&As (Vizag, Vijayawada, NRI) with FAQPage JSON-LD schema
- **Contact** — Contact form with Supabase storage
- **Story** — Founder story page

### Authentication (Magic Links)
- **No passwords** — Magic link email login only
- **Google OAuth** — One-click Google sign-in
- **Auto account creation** — No separate signup step
- **Admin role-gating** — Admin pages restricted to `role='admin'`

### Admin Dashboard (`/admin`)
- **Dashboard** — Revenue, orders, pending count stats
- **Products CRUD** — Add/edit/delete products with Cloudinary image upload
- **Orders** — View all orders, update status, add tracking URLs
- **Reviews** — Approve/reject customer reviews
- **Testimonials** — Manage social proof
- **Categories** — Product category management
- **Coupons** — Discount codes (percent or flat)
- **Blog** — Write and publish journal posts
- **FAQs** — Add FAQ items with grouping
- **Messages** — View contact form submissions
- **Site Content** — CMS-style editing of announcement bar, hero text, shipping settings

### Analytics & Marketing
- **Google Tag Manager** (GTM) — Single tag manager for all tracking
- **Google Analytics 4** (GA4) — Pageviews, events, ecommerce tracking
- **Meta Pixel** — Facebook/Instagram ad retargeting
- **Microsoft Clarity** — Heatmaps + session recordings
- **WhatsApp FAB** — Floating chat button (bottom-right)

### SEO
- **Organization JSON-LD** — Brand, location, contact info
- **LocalBusiness JSON-LD** — Google Maps integration
- **Product JSON-LD** — Google Shopping rich snippets
- **FAQPage JSON-LD** — FAQ feature snippets in search
- **Dynamic Sitemap** — `/sitemap.xml` with product + blog URLs
- **Geo-targeted content** — Vizag, Vijayawada, Hyderabad, NRI keywords
- **robots.txt** — Proper crawl rules

## 🔧 Tech Stack
- **Frontend:** React 19 + TanStack Start + TanStack Router
- **Styling:** Tailwind CSS v4 + custom brand tokens
- **Database:** Supabase (PostgreSQL + Auth)
- **Payments:** Razorpay (prepaid only)
- **Images:** Cloudinary (auto-WebP optimization)
- **Email:** Resend
- **Deployment:** Cloudflare Pages (edge SSR)

## 🚀 Quick Setup

### 1. Clone & Install
```bash
git clone https://github.com/Kbs-sol/drkavyas.git
cd drkavyas
npm install
```

### 2. Create `.env` file
```bash
cp .env.example .env  # or create manually
```
Add all required secrets (see SYSTEM_LITERACY.md for full list).

### 3. Run migrations in Supabase SQL Editor
Execute all files in `supabase/migrations/` in order.

### 4. Start dev server
```bash
npm run dev
```

### 5. Deploy to Cloudflare Pages
```bash
npm run build
# Then push to GitHub → Cloudflare Pages auto-deploys
```

## 🔑 Required Environment Variables
See `SYSTEM_LITERACY.md` for the complete list of Cloudflare Secrets to configure.

## 📋 System Literacy
For full setup documentation see **[SYSTEM_LITERACY.md](./SYSTEM_LITERACY.md)** — covers:
- All Cloudflare Secrets needed
- Supabase setup + migrations
- Admin credentials
- Razorpay test mode
- Cloudinary upload preset setup
- Google Merchant Center product feed
- Meta Pixel + CAPI setup
- Deployment guide

## 🛒 Test the Store
1. Visit `/shop` to browse products
2. Add items to cart
3. Visit `/checkout`
4. Use coupon code `KAVYALOVE15` for 15% off
5. Pay via Razorpay test mode

## 📱 Brand Colors
| Token | Hex | Usage |
|---|---|---|
| `brand-brown` | `#3D2F1A` | Primary text, CTAs |
| `brand-gold` | `#8A6D3B` | Accents, eyebrows |
| `brand-green` | `#5E7142` | Botanical accents |
| `brand-cream` | `#F5EAD7` | Button text |
| `brand-tan` | `#D4B483` | Borders, dividers |
| `brand-red` | `#C2462E` | Cart badge, alerts |

---
*Built with ❤️ for Dr. Kavya Reddy — Visakhapatnam, Andhra Pradesh*
