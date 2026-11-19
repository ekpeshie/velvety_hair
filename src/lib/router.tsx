import { createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

/*
 * A tiny router with two modes.
 *
 * - "path" (default): normal URLs like /shop and /product/body-wave.
 *   Your host must rewrite every path to index.html (see vercel.json / public/_redirects).
 * - "hash": used for the hosted preview, where only plain #names survive.
 *   /shop -> #shop, /product/body-wave -> #p-body-wave, / -> (empty).
 *
 * Build the preview with VITE_ROUTER=hash.
 */

const MODE: 'path' | 'hash' = import.meta.env.VITE_ROUTER === 'hash' ? 'hash' : 'path';

function toHash(path: string) {
  if (path === '/' || path === '') return '';
  const product = path.match(/^\/product\/([\w-]+)/);
  if (product) return 'p-' + product[1];
  const order = path.match(/^\/order\/([\w-]+)/);
  if (order) return 'order-' + order[1];
  return path.replace(/^\//, '').replace(/\//g, '-');
}

function fromHash(hash: string) {
  const h = hash.replace(/^#/, '');
  if (!h) return '/';
  if (h.startsWith('p-')) return '/product/' + h.slice(2);
  if (h.startsWith('order-')) return '/order/' + h.slice(6);
  if (h.startsWith('shop-')) return '/shop/' + h.slice(5);
  return '/' + h;
}

function currentPath() {
  return MODE === 'hash' ? fromHash(window.location.hash) : window.location.pathname;
}

export function hrefFor(path: string) {
  return MODE === 'hash' ? '#' + toHash(path) : path;
}

/**
 * Go to a path. `replace` swaps the current history entry instead of adding one
 * (so Back skips it), and `keepScroll` leaves the page where it is.
 */
export function navigate(path: string, opts: { replace?: boolean; keepScroll?: boolean } = {}) {
  const url = MODE === 'hash' ? (toHash(path) ? '#' + toHash(path) : window.location.pathname + window.location.search) : path;
  if (opts.replace) history.replaceState(null, '', url);
  else if (MODE === 'hash' && toHash(path)) window.location.hash = toHash(path);
  else history.pushState(null, '', url);
  window.dispatchEvent(new Event('routechange'));
  if (!opts.keepScroll) window.scrollTo({ top: 0 });
}

const RouteContext = createContext('/');

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const update = () => setPath(currentPath());
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);
    window.addEventListener('routechange', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('hashchange', update);
      window.removeEventListener('routechange', update);
    };
  }, []);
  return <RouteContext.Provider value={path}>{children}</RouteContext.Provider>;
}

export const usePath = () => useContext(RouteContext);

/** Match "/product/:slug" style patterns. Returns params or null. */
export function match(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={hrefFor(to)} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
