/*
 * Keeps the last order in this browser so the confirmation page can show it.
 * Paid orders are confirmed by our server (api/verify.ts) and recorded in the Paystack dashboard.
 */

export type Order = {
  id: string;
  name: string;
  email: string;
  delivery: string;
  deliveryDetail: string;
  address: string;
  lines: { slug: string; name: string; length: number; qty: number; total: number }[];
  subtotal: number;
  fee: number;
  total: number;
  paid: boolean;
  /** paid with Paystack test keys: no real money moved */
  test?: boolean;
};

let memory: Order | null = null;
const KEY = 'velvety-last-order';

export function saveOrder(o: Order) {
  memory = o;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(o));
  } catch {
    /* ignore */
  }
}

export function getOrder(id: string): Order | null {
  if (memory?.id === id) return memory;
  try {
    const o = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Order | null;
    return o?.id === id ? o : null;
  } catch {
    return null;
  }
}
