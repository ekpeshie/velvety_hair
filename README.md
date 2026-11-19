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
2. **Photos.** Put product photos in `public/images/` and set `image: 'images/your-file.jpg'` on each product. Products without a photo show brand texture artwork.
3. **Delivery fees.** Set them in `DELIVERY` in `src/data/products.ts`.
4. **Payments.** Add two environment variables to the Vercel project (Settings, Environment Variables, for Production and Preview), then redeploy:
   - `VITE_PAYSTACK_PUBLIC_KEY`: your Paystack public key (`pk_test_...` while testing, `pk_live_...` when live). Without it, checkout runs in demo mode and takes no money.
   - `PAYSTACK_SECRET_KEY`: your Paystack secret key (`sk_test_...` / `sk_live_...`). Server only; never put it in a `VITE_` variable or in the code.
5. **How payment is checked.** After the Paystack popup says paid, checkout calls `api/verify.ts`, a Vercel function. It asks Paystack, using the secret key, whether that reference really succeeded, and checks the amount against the prices in `src/data/products.ts`. Only then does the customer see a confirmed order. Each payment carries the items, delivery method, address and notes, so every order is visible in the Paystack dashboard. Still to do: store orders in a database, and add a Paystack webhook so a payment is recorded even if the customer closes the page before confirmation.
6. **Newsletter.** Wire the footer form in `src/components/Footer.tsx` to your email tool.
7. **Policies.** Replace the sample delivery and returns text in `src/pages/Product.tsx` and `src/pages/Info.tsx`.
8. **Deploy.** Vercel or Netlify. `vercel.json` and `public/_redirects` already send every path to `index.html`.

## Structure

```
src/
  data/products.ts      catalogue, textures, delivery options
  store/cart.tsx        bag state (React context + localStorage)
  lib/router.tsx        small router (path URLs; hash mode for previews)
  lib/paystack.ts       Paystack inline checkout
  lib/orders.ts         last order for the confirmation page
  components/           Header, Footer, CartDrawer, ProductCard, TextureArt, Icons
  pages/                Home, Shop, Product, Checkout, Order, Info (care + FAQ), NotFound
  styles.css            all styles, brand tokens at the top
api/
  verify.ts             confirms a payment with Paystack (Vercel function)
  _lib/pricing.ts       prices a bag from the catalogue
```

## Preview build

`npm run build:preview` makes a hash-routed build in `dist-preview/` that runs from any folder or static host without rewrites.
