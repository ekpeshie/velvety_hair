/*
 * POST /api/verify  (Vercel function)
 *
 * The Paystack popup only tells the browser a payment went through, and anything in the
 * browser can be faked. This asks Paystack directly, with the SECRET key, and checks the
 * payment matches what the bag should cost at our own prices.
 *
 * Body:    { reference: string, lines: { slug, length, qty }[], delivery: string, country: 'NG' | 'GB' | ... }
 * Replies: 200 { status: 'paid', reference, amount, paidAt, channel, test }
 *          402 { status: 'unpaid', message }    Paystack has no successful payment for this reference
 *          409 { status: 'mismatch', message }  paid, but not the amount this bag costs
 *          400 / 502 / 503 { status: 'error', message }
 *
 * Needs PAYSTACK_SECRET_KEY in the Vercel project's environment variables
 * (sk_test_... for test payments, sk_live_... when live). Never put it in the app.
 */
import { priceOrder } from './_lib/pricing.js';

const json = (status: number, data: Record<string, unknown>) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

type PaystackVerify = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    requested_amount?: number;
    currency: string;
    paid_at: string | null;
    channel: string;
    domain: 'test' | 'live';
  };
};

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return json(503, { status: 'error', message: 'Payments are not set up on the server yet.' });

  let body: { reference?: unknown; lines?: unknown; delivery?: unknown; country?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json(400, { status: 'error', message: 'Bad request.' });
  }

  const reference = typeof body.reference === 'string' && /^[A-Za-z0-9_-]{6,64}$/.test(body.reference) ? body.reference : null;
  const order = priceOrder(body.lines, body.delivery, body.country);
  if (!reference || !order) return json(400, { status: 'error', message: 'Bad request.' });

  let result: PaystackVerify;
  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    result = (await res.json()) as PaystackVerify;
  } catch {
    return json(502, { status: 'error', message: 'Could not reach Paystack.' });
  }

  const tx = result.data;
  if (!result.status || !tx || tx.status !== 'success') {
    return json(402, { status: 'unpaid', message: 'Paystack has no completed payment for this order.' });
  }

  const expectedKobo = order.total * 100;
  const paidKobo = tx.requested_amount ?? tx.amount;
  if (tx.currency !== 'NGN' || paidKobo !== expectedKobo) {
    return json(409, { status: 'mismatch', message: 'The payment amount does not match this order.' });
  }

  return json(200, {
    status: 'paid',
    reference: tx.reference,
    amount: paidKobo / 100,
    paidAt: tx.paid_at,
    channel: tx.channel,
    test: tx.domain === 'test',
  });
}
