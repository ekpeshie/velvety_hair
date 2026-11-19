/*
 * Paystack inline checkout.
 * Set VITE_PAYSTACK_PUBLIC_KEY in .env (pk_test_... while testing).
 * Without a key the store runs in demo mode: orders are confirmed on screen and no payment is taken.
 *
 * IMPORTANT: before fulfilling an order, verify the transaction reference on your server
 * with Paystack's Verify Transaction API using your SECRET key. Never put the secret key in this app.
 */

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
        ],
      },
      callback: () => resolve('paid'),
      onClose: () => resolve('closed'),
    });
    handler.openIframe();
  });
}
