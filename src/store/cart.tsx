import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getProduct } from '../data/products';

export type CartLine = { slug: string; length: number; qty: number };

type CartState = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, length: number, qty?: number) => void;
  setQty: (slug: string, length: number, qty: number) => void;
  remove: (slug: string, length: number) => void;
  clear: () => void;
};

const KEY = 'velvety-cart-v1';
const CartContext = createContext<CartState | null>(null);

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    return parsed.filter((l) => getProduct(l.slug)?.prices[l.length]);
  } catch {
    return [];
  }
}

export function lineTotal(l: CartLine) {
  const p = getProduct(l.slug);
  return p ? (p.prices[l.length] ?? 0) * l.qty : 0;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable: the cart still works for this visit */
    }
  }, [lines]);

  const value = useMemo<CartState>(() => {
    const same = (l: CartLine, slug: string, length: number) => l.slug === slug && l.length === length;
    return {
      lines,
      open,
      setOpen,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + lineTotal(l), 0),
      add: (slug, length, qty = 1) =>
        setLines((ls) =>
          ls.some((l) => same(l, slug, length))
            ? ls.map((l) => (same(l, slug, length) ? { ...l, qty: Math.min(l.qty + qty, 10) } : l))
            : [...ls, { slug, length, qty }],
        ),
      setQty: (slug, length, qty) =>
        setLines((ls) =>
          qty <= 0 ? ls.filter((l) => !same(l, slug, length)) : ls.map((l) => (same(l, slug, length) ? { ...l, qty: Math.min(qty, 10) } : l)),
        ),
      remove: (slug, length) => setLines((ls) => ls.filter((l) => !same(l, slug, length))),
      clear: () => setLines([]),
    };
  }, [lines, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
}
