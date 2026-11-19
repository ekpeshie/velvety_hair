/*
 * Keeps the last order in this browser so the confirmation page can show it.
 * In production, your server should create and store orders after verifying payment.
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
