import { useEffect } from 'react';
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
import { getProduct } from './data/products';

function route(path: string): { page: JSX.Element; title: string } {
  let m;
  if (path === '/' || path === '') return { page: <Home />, title: 'Premium human-hair wigs' };
  if (path === '/shop') return { page: <Shop />, title: 'Shop all units' };
  if ((m = match('/shop/:filter', path))) return { page: <Shop key={m.filter} filter={m.filter} />, title: 'Shop' };
  if ((m = match('/product/:slug', path)))
    // No key: the product rail stays mounted while you scroll from unit to unit.
    return { page: <ProductPage slug={m.slug} />, title: getProduct(m.slug)?.name ?? 'Not found' };
  if (path === '/checkout') return { page: <Checkout />, title: 'Checkout' };
  if ((m = match('/order/:id', path))) return { page: <OrderConfirmed id={m.id} />, title: 'Order confirmed' };
  if (path === '/care') return { page: <Care />, title: 'Wig care' };
  if (path === '/faq') return { page: <Faq />, title: 'FAQ' };
  return { page: <NotFound />, title: 'Not found' };
}

export default function App() {
  const path = usePath();
  const { page, title } = route(path);
  useEffect(() => {
    document.title = `${title} · Velvety Hairs`;
  }, [title]);

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
    </>
  );
}
