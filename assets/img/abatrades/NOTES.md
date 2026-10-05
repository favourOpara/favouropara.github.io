# abatrades.org — first-hand snapshot notes

Captured 2026-10-05 (about 20:56–21:02 UTC) from a cloud container with headless Chromium (Playwright). I did not log in, create accounts or submit forms.

## ⚠️ Read this first: the backend data did not load in this capture

The frontend (`abatrades.org`) loaded. Two hosts the page calls were **blocked by this container's egress policy**, which returned 403 on CONNECT. The site itself did not block them:

- `inspiring-spontaneity-production.up.railway.app` (the site's API: `/api/user-info/`, `/api/categories/`, `/api/products/`, `/api/shops/`, `/api/ads/serve/`, `/api/platform-flags/`, `/api/orders/protection-config/`, `/api/storage/pricing/`, `/api/storage/locations/`)
- `res.cloudinary.com` (images)

As a result, the screenshots show the app's **empty or fallback states**, not what a normal visitor sees:
- The category banner cards on the homepage show gradients only, with no product images.
- The homepage store sections repeat "No stores yet / Be the first store on Abatrades and reach thousands of buyers." six times. **Do not cite this as the real state of the marketplace.**
- On `/buyer-protection`, values that come from the API are blank: the fee, the protection window and the time limits ("has  to reply", "We aim to settle within ").
- The "Top Products by Our Stores" tiles did render images (Construction, Kitchen, Car Accessories, …), so those images are bundled with the frontend.

A capture from an unrestricted network would be needed for representative screenshots.

## Title, meta, headlines

- `<title>`: **Abatrades** (the same on every page captured)
- Meta description: **not shown**. The only meta tags are `charset` and `viewport`. There are no Open Graph or Twitter tags.
- Favicon: `/assets/abatrades-logo-C3DlW3kN.png`
- Homepage headlines/taglines, verbatim:
  - "Shop Nigerian stores"
  - "Stay protected on Abatrades. You can chat with the seller anywhere, but keep payments on Abatrades to remain protected."
  - "Local stores — Every store is run by a real person"
  - "Secure checkout — Safe payments, every order"
  - "Join us.  Own a store.  Get paid."
  - "Your money is safe until your order arrives"
  - "Sell to all of Nigeria. Without leaving your shop."
  - "Start selling on Abatrades"
  - Footer: "Nigeria's marketplace connecting buyers with trusted stores. Discover products, support local businesses, and shop with confidence."
- `/what-is-abatrades` hero: "Sell more. Grow faster. Own your store." / "We handle importation, warehousing, marketing, and logistics for you. Just open your store, track orders from your customers in your account, and get paid."
- `/services` hero: "Warehouse and Logistics" / "We store, pack and deliver. You just sell."
- `/buyer-protection` hero: "Buyer Protection" / "Your money stays with us until the order is in your hands."
- `/join`: "Join Abatrades" / "How would you like to use the platform?" with the options "I'm a Buyer" and "I'm a Seller".

## What it is and who it serves (in the site's words)

- "Nigeria's marketplace connecting buyers with trusted stores." (footer)
- Sellers: "Create your store for free, list products, and reach thousands of buyers. You only pay a commission when something sells." (`/join`)
- Buyers: "Browse storefronts from verified Nigerian stores. See their full catalogue, check reviews, message them directly, and shop with confidence, your payment held in escrow until delivery." (`/what-is-abatrades`)
- Diaspora: "Do you stay in Nigeria or in the diaspora and you want to enjoy the Nigerian wholesale and retail market? We got you covered." (`/what-is-abatrades`)
- Escrow model (homepage, steps 01–04):
  - "01 Pay safely — Your payment is held by Abatrades against your order, not by the store. The store can see your order but cannot touch the money."
  - "02 The store sends it — Follow your order from your orders page. Warehouse orders come with a delivery code that only you have."
  - "03 Confirm it arrived — Check it is what you ordered, then confirm receipt. Only then is the store paid. If you do nothing, the store is paid when your protection window closes."
  - "04 Something wrong? Tell us — Open a dispute from your orders before your protection window closes. The store can answer, and if you cannot agree, Abatrades decides. Refunds go to your bank account."
- Ways to sell (homepage):
  - "01 Open your store — Sign up for free, name your store and add the bank account you want to be paid into. You only pay a commission when something sells."
  - "02 Sell directly — List what you already have, set your own price and delivery fee, and deliver each order yourself. You are paid once the buyer has it."
  - "03 Or dropship — Pick products from our supplier catalogue and add your own amount on top. There is no stock to buy, and the supplier ships straight to your buyer."
  - "04 Or use our warehouse — Send your stock to our warehouse and we store it, pack every order and deliver it for you. Storage is paid monthly."
- Partner: Rafiki (`https://rafiki.com.ng`). "Import from Rafiki — Source products across Africa" (homepage). "Source products from China through Rafiki, ship them to our warehouse, and we handle the rest: storage, packaging, and delivery to your buyers across Nigeria." (`/what-is-abatrades`)

## Navigation

- Desktop header: "Make money / Sell on Abatrades" (`/join`), "Storage & delivery / Warehouse & Logistics" (`/services`), search box "Search products or stores..." with an "Enter" button, "Deliver to / Nigeria", "Want to know more? / Click here" (`/knowledge-base`), "Sign in for deals / Sign In" (`/signin`), "Your Cart" (`/cart`), "Home" (`/browse`)
- Category strip: Bulk Orders · Best Sellers · New Releases · Today's Deals · Top Rated · Flash Sales · Trending Now · Under ₦5,000 · Under ₦20,000 · **Become a Seller**
- Mobile header: logo, "Sign in", cart, search "Search Abatrades", and a horizontally scrolling strip beginning "Become a Seller · Bulk Orders · Best Sellers …"
- Sub-pages (`/what-is-abatrades`, `/premium-plans`, `/buyer-protection`) use a different header: All Categories · Storage & delivery / Warehouse & Logistics · Trending · New Releases · Top Deals · Bulk Orders · Support · How It Works · Own a Store
- Footer columns:
  - MARKETPLACE: Visit Marketplace, Trending Products, New Arrivals, Top Deals, Wholesale
  - FOR SELLERS: Open a Store, Seller Signup, Warehouse & Logistics, Dropshipping, Refer and Earn, Seller Analytics, Premium Plans
  - SUPPORT: How It Works, Help Centre, Buyer Protection, Return and Refund Policy, Delivery Policy, Report an Issue
  - CUSTOMER SERVICE: hello@abatrades.org — "We respond to every enquiry within 48 working hours."
  - COMPANY: About Abatrades, Careers, Privacy Policy, Terms and Conditions
  - "© 2025 Abatrades. All rights reserved."
- Several links go to `/coming-soon?for=…` placeholders: Seller Support, Gift Cards, Customer Reviews, Help Centre, Careers.

## Homepage sections, features and categories

- Category banners: Hair and wigs, Hair care, Fashion, Gaming, Gaming laptops, Kitchen, Car Accessories, Beauty & Wellness, Electronics, Books, Sports & Fitness
- "Top Products by Our Stores" tiles: Construction, Kitchen, Car Accessories, Beauty & Wellness, Fashion, Electronics, Books, Sports & Fitness
- Side link panels: Own a Store, Warehouse & Logistics, Import from Rafiki, Seller Support, Advertise with Us, Partner Program, Refer & Earn, Gift Cards / Premium Stores, Flash Sales, Bulk Orders, How It Works, Buyer Protection, Track My Order, New Arrivals, Top Brands, Return Policy, Customer Reviews
- Seller pitch: "A store that looks like yours — Open a store in minutes. With Premium you design it yourself, with your own logo, banner and pages, and your store carries the verified tick." · "Your products beside every store" · "Buyers keep finding you — Trending stores, picks made for each buyer and sponsored spots keep stores and products moving in front of shoppers all day."
- "Today's highlight — Electronics on sale — Televisions, appliances, phones and gadgets from stores across Nigeria."
- A floating "? Try me" button appears (its purpose is not stated in the visible text).
- Cookie banner: "We remember what you look at on this device so we can show you stores and products you will like." with the buttons "No thanks" and "Accept". I clicked "No thanks" before capturing.
- Premium features (`/what-is-abatrades`): Importation, Warehousing, Logistics, Search Optimisation, Storage Discounts, Design Flexibility, Ad-Light Storefront, Verification Badge. "No plugins, no hidden fees."
- `/premium-plans`: "Premium is a monthly plan for stores, with extra tools and lower fees. Sign in to your seller account to see the plans." Prices are **not shown** without signing in.

## Numbers and stats shown (verbatim, with location)

- Homepage strip: "Under ₦5,000", "Under ₦20,000" (price filters)
- Homepage empty state: "reach thousands of buyers" (repeated)
- Footer: "within 48 working hours"
- `/services`: "Same day — dispatch on orders confirmed before 2 PM" · "Nationwide — delivery to every major city in Nigeria" · "Live — tracking for you and your buyers" · "Insured — storage while your goods are with us" · "Four stops from signing up to getting paid."
- `/buyer-protection`: "Six points, from the moment you pay to the moment the store is paid." · "Four kinds of problem." The actual time and fee values were blank in this capture (see the warning above).
- `/what-is-abatrades` contains **illustrative mock-up cards**, not real metrics: "Anime Store 1.2k visits Fashion · 230 items", "TechNaija 890 visits Electronics · 85 items", "Lagos Glam 3.4k visits Beauty · 140 items", "NEW ORDER Hoodie XL, ₦18,500 Payment confirmed", "Everything Gadgets … THIS WEEK ₦240k ↑ 18% revenue", "Sneakers · ₦32,000", "Zara Lagos Fashion · 230 items". **Do not present these as real traction numbers.**

## Tech hints

- Frontend: a **React** single-page app built with **Vite**. The HTML is an empty `<div id="root"></div>` loading `/assets/index-XXNoCjv4.js` (hashed Vite asset names). The bundle contains `react-dom`/`createRoot`, React Router, Redux, axios, Bootstrap 5 CSS/JS (`--bs-*` variables) and react-toastify. The main bundle is about 468 KB, with about 144 lazy-loaded chunks.
- Backend API: `https://inspiring-spontaneity-production.up.railway.app/api/...`, hosted on **Railway**. The URL style (`/api/categories/` with trailing slashes) is consistent with Django REST Framework, but I could **not confirm** this, because the host was blocked from this container. No `server`/`x-powered-by` header from it was observed.
- Frontend hosting: **Railway** (`x-railway-edge`, `x-railway-request-id`, `x-hikari-trace`) behind **Cloudflare** (`server: cloudflare`, `cf-ray`, `cf-cache-status: DYNAMIC`, NEL/report-to).
- Images: Cloudinary (`res.cloudinary.com`), which is referenced 75 times in the bundle.
- Payments: the frontend bundle text names **Monnify** ("Card payment through Monnify…", "Pay … with Monnify"), plus "Monnify, or Paystack for older orders, not PayScrow" and an escrow payment option. The visible public pages captured do not name a payment provider.
- Analytics: none detected. Requests went only to abatrades.org, fonts.googleapis.com, the Railway API and Cloudinary. There was no GA, GTM, Sentry, PostHog, Hotjar or Clarity.
- Fonts: Google Fonts (Nunito, plus a large "Extended font library for store builder" set: Playfair Display, Montserrat, Pacifico, …). The rendered body font is the system-ui stack.

### Response headers: `curl -sSI https://abatrades.org/`

```
HTTP/2 200
date: Mon, 05 Oct 2026 21:00:11 GMT
content-type: text/html; charset=utf-8
report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=…"}]}
last-modified: Mon, 05 Oct 2026 09:17:29 GMT
server: cloudflare
vary: Accept-Encoding
x-railway-request-id: tOtr6pbKQymX1Gfq7fhULg
nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
x-hikari-trace: jfk1.57w5
x-railway-edge: jfk1
cf-cache-status: DYNAMIC
cf-ray: a45f5ab858808538-EWR
alt-svc: h3=":443"; ma=86400
```

`www.abatrades.org` also returns 200 with the same headers. It serves directly, with no redirect to the apex.

### Security headers on the HTML response

| Header | Present? |
|---|---|
| Strict-Transport-Security | **absent** |
| Content-Security-Policy | **absent** |
| X-Frame-Options | **absent** |
| X-Content-Type-Options | **absent** |
| Referrer-Policy | **absent** |
| Permissions-Policy | **absent** |

### TLS certificate

**Not determinable from this container.** Outbound HTTPS here is re-terminated by the environment's egress proxy, so `openssl s_client` returns the proxy's certificate (`issuer=O = Anthropic, CN = Egress Gateway SDS Issuing CA (production)`), not the site's real one. Re-check from an unproxied network.

## Brand colours (computed from the rendered page)

- Primary orange (Become a Seller button, "Read about buyer protection" button): `rgb(249,115,22)` = **#F97316**
- Dark orange (mobile header background and link text): `rgb(194,65,12)` = **#C2410C**. Deeper accents use `rgb(154,52,18)` = #9A3412.
- Logo blue: about **#3D7BF4** (dominant opaque colour in the logo PNG)
- Light-blue secondary button ("Open a store"): bg `rgb(186,230,253)` = #BAE6FD, text `rgb(12,42,71)` = #0C2A47
- Body text: `rgb(33,53,71)` = #213547 on a white background
- The CSS custom properties are Bootstrap defaults (`--bs-primary: #0d6efd`, …) and react-toastify. There are no custom brand variables.

## Logo files (publicly served, downloaded)

- `logo.png` ← `https://abatrades.org/assets/abatrades-logo-C3DlW3kN.png` (500×500, favicon / header mark, blue)
- `logo-large.png` ← `https://abatrades.org/assets/abatrades-large-logo-CU7DyDI3.png` (500×237)
- `logo-other.png` ← `https://abatrades.org/assets/abatrades-logo-other-BIqSh3Wd.png` (500×160)

## Screenshot files

All are above-the-fold captures. Desktop is 1440×900 @2x, downscaled to 1600 px wide. Mobile is 390×844 @3x (isMobile, hasTouch), downscaled to 600 px wide. JPEG quality is 82. Each capture waited for networkidle plus 2.5 s, and the cookie banner was dismissed.

| File | URL | Size |
|---|---|---|
| home-desktop.jpg | https://abatrades.org/ | 119 KB |
| home-mobile.jpg | https://abatrades.org/ | 66 KB |
| what-is-abatrades-desktop.jpg | https://abatrades.org/what-is-abatrades | 123 KB |
| what-is-abatrades-mobile.jpg | https://abatrades.org/what-is-abatrades | 72 KB |
| services-desktop.jpg | https://abatrades.org/services | 121 KB |
| services-mobile.jpg | https://abatrades.org/services | 80 KB |
| buyer-protection-desktop.jpg | https://abatrades.org/buyer-protection | 102 KB |
| buyer-protection-mobile.jpg | https://abatrades.org/buyer-protection | 78 KB |
| join-desktop.jpg | https://abatrades.org/join | 33 KB |
| join-mobile.jpg | https://abatrades.org/join | 39 KB |
| home-full.jpg | https://abatrades.org/ (full page, 1440 wide @1x, cropped to 6000 px of 6596) | 482 KB (quality 70; at quality 82 it was 607 KB) |

Not kept: `/browse` rendered pixel-identical to the homepage on desktop (the "Home" nav link points to `/browse`), so I dropped it as a duplicate. `/premium-plans` only shows a sign-in prompt, so I did not screenshot it.
