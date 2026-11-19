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

## Go live checklist

1. **Products.** Edit `src/data/products.ts`. Every name, price, spec and policy there is sample content.
2. **Photos.** Put product photos in `public/images/` and set `image: 'images/your-file.jpg'` on each product. Products without a photo show brand texture artwork.
3. **Delivery fees.** Set them in `DELIVERY` in `src/data/products.ts`.
4. **Payments.** Copy `.env.example` to `.env` and add your Paystack public key. Without it, checkout runs in demo mode and takes no money.
5. **Verify payments on a server.** Paystack's popup confirms payment in the browser only. Before shipping an order, verify the reference with Paystack's Verify Transaction API from a server or serverless function using your secret key. A Paystack webhook is the robust way to record paid orders.
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
```

## Preview build

`npm run build:preview` makes a hash-routed build in `dist-preview/` that runs from any folder or static host without rewrites.
