# Velvety Hairs store: notes for Claude Code

React 18 + TypeScript + Vite. No UI library, no router library, no CSS framework.

## Commands
- `npm run dev`: dev server
- `npm run build`: type-check and build (must pass before you finish)
- `npm run build:preview`: hash-routed build for static previews

## Conventions
- Brand tokens are CSS variables at the top of `src/styles.css`. Use them; do not add raw hex values elsewhere.
- Type: Cormorant Garamond italic 500 for headlines (`.display`, `.h1`, `.h2`), Inter for everything else. The script face lives only in the logo images.
- Look: light and airy (inspired by regrocery.co). Blush-soft page, cocoa (`--cocoa`) for headings, links, prices and product names; espresso for body text. The cocoa footer is the only solid colour block. Product photos sit on `--blush-sunken` tiles with `--radius-tile`. Product cards show photo, name, price and at most a small outlined `.tag`.
- Eyebrow labels: `.eyebrow` (12px, 600, uppercase, wide tracking). Use sparingly: only to name a page above a poetic headline.
- Buttons are pills: `.btn`, `.btn-primary`, `.btn-ghost`. One primary per view.
- Copy voice: warm, short, sentence case. No em-dashes. No exclamation marks.
- Navigation: use `Link` and `navigate` from `src/lib/router.tsx`, never raw `<a href="/...">` for internal links.
- Prices are whole naira numbers. Anything charged (checkout, order, Paystack) is shown in naira with `money()` from `src/lib/format.ts`. Browsing prices (cards, product page, line-up, bag) use `useMoney()` from `src/lib/currency.tsx`, which follows the shopper's chosen currency (NGN, GBP, USD, CAD). Payment is always taken in naira.
- Delivery options and fees live in `deliveryOptions()` in `src/data/products.ts` (Nigeria, or DHL / FedEx / arrange-with-us by zone abroad). The server (`api/_lib/pricing.ts`) prices orders from the same code, so change fees there only.
- Asset URLs go through `asset()` so both build modes work.
- Accessibility: real buttons and labels, 44px touch targets, visible focus, text contrast 4.5:1.

## Not done yet (good next tasks)
- Server-side Paystack verification and order storage (e.g. a Vercel function + database)
- Real product photos and a multi-image gallery on the product page
- Install booking flow
- SEO: per-page meta tags, or move to a framework with server rendering if search traffic matters
