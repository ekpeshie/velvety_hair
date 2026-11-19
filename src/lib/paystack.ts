/*
 * Paystack inline checkout.
 * Set VITE_PAYSTACK_PUBLIC_KEY in .env (pk_test_... while testing).
 * Without a key the store runs in demo mode: orders are confirmed on screen and no payment is taken.
 *
 * After the popup says "paid", verifyPayment() asks our server (api/verify.ts) to confirm it with
 * Paystack using the SECRET key, and to check the amount against our own prices. The secret key
 * lives only in the server's environment variables, never in this app.
 */
import type { CartLine } from '../store/cart';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

export const PAYSTACK_KEY: string | undefined = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || undefined;

function loadScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load Paystack'));
    document.head.appendChild(s);
  });
}

export async function payWithPaystack(opts: {
  email: string;
  amountNaira: number;
  reference: string;
  phone: string;
  name: string;
  /** shown on the transaction in the Paystack dashboard */
  details: { items: string; delivery: string; address: string; notes: string };
}): Promise<'paid' | 'closed'> {
  if (!PAYSTACK_KEY) throw new Error('No Paystack key set');
  await loadScript();
  return new Promise((resolve) => {
    const handler = window.PaystackPop!.setup({
      key: PAYSTACK_KEY,
      email: opts.email,
      amount: Math.round(opts.amountNaira * 100), // kobo
      currency: 'NGN',
      ref: opts.reference,
      metadata: {
        custom_fields: [
          { display_name: 'Name', variable_name: 'name', value: opts.name },
          { display_name: 'Phone', variable_name: 'phone', value: opts.phone },
          { display_name: 'Items', variable_name: 'items', value: opts.details.items },
          { display_name: 'Delivery', variable_name: 'delivery', value: opts.details.delivery },
          { display_name: 'Address', variable_name: 'address', value: opts.details.address || 'Studio pickup' },
          { display_name: 'Notes', variable_name: 'notes', value: opts.details.notes || 'None' },
        ],
      },
      callback: () => resolve('paid'),
      onClose: () => resolve('closed'),
    });
    handler.openIframe();
  });
}

export type Verified = { status: 'paid'; reference: string; amount: number; paidAt: string | null; channel: string; test: boolean };

/** Ask our server to confirm the payment with Paystack. Throws with a customer-facing message if it cannot. */
export async function verifyPayment(reference: string, lines: CartLine[], delivery: string): Promise<Verified> {
  let res: Response;
  try {
    res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reference, lines: lines.map(({ slug, length, qty }) => ({ slug, length, qty })), delivery }),
    });
  } catch {
    throw new Error('connection');
  }
  const data = await res.json().catch(() => null);
  if (res.ok && data?.status === 'paid') return data as Verified;
  throw new Error(data?.status ?? 'error');
}
