import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { match, usePath } from './lib/router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductPage } from './pages/Product';
import { Checkout } from './pages/Checkout';
import { OrderConfirmed } from './pages/Order';
import { Care, Faq } from './pages/Info';
import { NotFound } from './pages/NotFound';
import { metaFor, applyHead } from './lib/seo';

function route(path: string): { page: JSX.Element } {
  let m;
  if (path === '/' || path === '') return { page: <Home /> };
  if (path === '/shop') return { page: <Shop /> };
  if ((m = match('/shop/:filter', path))) return { page: <Shop key={m.filter} filter={m.filter} /> };
  if ((m = match('/product/:slug', path)))
    // Keyed so the gallery, length and quantity start fresh for each unit.
    return { page: <ProductPage key={m.slug} slug={m.slug} /> };
  if (path === '/checkout') return { page: <Checkout /> };
  if ((m = match('/order/:id', path))) return { page: <OrderConfirmed id={m.id} /> };
  if (path === '/care') return { page: <Care /> };
  if (path === '/faq') return { page: <Faq /> };
  return { page: <NotFound /> };
}

export default function App() {
  const path = usePath();
  const { page } = route(path);
  // Title, description, canonical, share tags and structured data for this page.
  useEffect(() => applyHead(metaFor(path)), [path]);

  return (
    <>
      <a
        href="#main"
        className="skip"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>{page}</main>
      <Footer />
      <CartDrawer />
      <Analytics />
    </>
  );
}
