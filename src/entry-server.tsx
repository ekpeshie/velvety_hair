import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { RouterProvider } from './lib/router';
import { CartProvider } from './store/cart';
import { CurrencyProvider } from './lib/currency';

/*
 * Build-time rendering (see scripts/prerender.mjs). Turns one page of the app into
 * HTML so search engines and link previews see real content, not an empty shell.
 * Prices render in naira; the browser switches to the shopper's currency on load.
 */
export function render(path: string) {
  return renderToString(
    <StrictMode>
      <RouterProvider initialPath={path}>
        <CurrencyProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </CurrencyProvider>
      </RouterProvider>
    </StrictMode>,
  );
}

export { metaFor, publicPaths, headTags, SITE_URL } from './lib/seo';
