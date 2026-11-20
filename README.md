# Velvety Hairs store

An e-commerce storefront for Velvety Hairs, built with React, TypeScript and Vite.

- Home, shop (filter by texture, sort by price), product pages with length-based pricing
- Bag drawer that remembers items in the browser
- Checkout with Nigerian states, delivery options and Paystack payment
- Wig care and FAQ pages
- Brand system: espresso, cocoa, blush and rose-gold; Cormorant Garamond and Inter

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

`npm run dev` serves the shop only. To run the payment check (`api/`) locally too, use `npx vercel dev`.

## Go live checklist

1. **Products.** Edit `src/data/products.ts`. Every name, price, spec and policy there is sample content.
2. **Photos.** Put product photos in `public/images/`. On each product, set `image` to the main photo and list more angles of the same unit (sides, back, close-ups) in `images`, e.g. `images: ['images/body-wave-side.jpg', 'images/body-wave-back.jpg']`. The product page shows them as a swipeable gallery with thumbnails. Products without a photo show brand texture artwork.
3. **Delivery fees.** Set them in `src/data/products.ts`: the Nigeria options, and the DHL and FedEx fees for each zone (UK and Europe, US and Canada, rest of the world). All fees are in naira.
4. **Payments.** Add two environment variables to the Vercel project (Settings, Environment Variables, for Production and Preview), then redeploy:
   - `VITE_PAYSTACK_PUBLIC_KEY`: your Paystack public key (`pk_test_...` while testing, `pk_live_...` when live). Without it, checkout runs in demo mode and takes no money.
   - `PAYSTACK_SECRET_KEY`: your Paystack secret key (`sk_test_...` / `sk_live_...`). Server only; never put it in a `VITE_` variable or in the code.
5. **International shoppers.** A switcher in the header shows prices in naira, pounds, US dollars or Canadian dollars, using daily rates from `api/rates.ts` (ExchangeRate-API, no key needed). Payment is always taken in naira; checkout shows the approximate amount in the shopper's currency. Ask Paystack to enable international cards on your account if it is not already on.
6. **How payment is checked.** After the Paystack popup says paid, checkout calls `api/verify.ts`, a Vercel function. It asks Paystack, using the secret key, whether that reference really succeeded, and checks the amount against the prices in `src/data/products.ts`. Only then does the customer see a confirmed order. Each payment carries the items, delivery method, address and notes, so every order is visible in the Paystack dashboard. Still to do: store orders in a database, and add a Paystack webhook so a payment is recorded even if the customer closes the page before confirmation.
7. **Newsletter.** Wire the footer form in `src/components/Footer.tsx` to your email tool.
8. **Search and sharing.** Every public page is built as real HTML with its own title, description, share image and structured data (`src/lib/seo.ts`), plus `sitemap.xml` and `robots.txt`. Add the site to Google Search Console and submit `https://www.velvetyhairs.store/sitemap.xml`.
9. **Policies.** Replace the sample delivery and returns text in `src/pages/Product.tsx` and `src/pages/Info.tsx`.
10. **Deploy.** Vercel or Netlify. `vercel.json` and `public/_redirects` already send every path to `index.html`.

## Structure

```
src/
  data/products.ts      catalogue, textures, delivery options
  store/cart.tsx        bag state (React context + localStorage)
  lib/router.tsx        small router (path URLs; hash mode for previews)
  lib/paystack.ts       Paystack inline checkout
  lib/orders.ts         last order for the confirmation page
  components/           Header, Footer, CartDrawer, HeroStage, ProductCard, ProductGallery, FilterDock, TextureArt, Icons
  lib/filters.ts        shop filters: options, matching, sorting
  lib/seo.ts            page titles, descriptions, share tags, structured data
  entry-server.tsx      renders a page to HTML at build time
scripts/prerender.mjs   writes each page, sitemap.xml and robots.txt into dist/
  pages/                Home, Shop, Product, Checkout, Order, Info (care + FAQ), NotFound
  styles.css            all styles, brand tokens at the top
api/
  verify.ts             confirms a payment with Paystack (Vercel function)
  rates.ts              daily exchange rates for showing prices abroad
  _lib/pricing.ts       prices a bag from the catalogue
```

## Preview build

`npm run build:preview` makes a hash-routed build in `dist-preview/` that runs from any folder or static host without rewrites.
