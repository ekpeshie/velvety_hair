/*
 * GET /api/rates  (Vercel function)
 *
 * Exchange rates for showing prices in other currencies: how many pounds, US dollars and
 * Canadian dollars one naira buys. Payments are always taken in naira, so these are only
 * for display. Cached at Vercel's edge for 12 hours.
 *
 * Source: ExchangeRate-API open access (no key needed; attribution shown at checkout).
 */

const SOURCE = 'https://open.er-api.com/v6/latest/NGN';

export async function GET(): Promise<Response> {
  try {
    const res = await fetch(SOURCE);
    const data = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
    const r = data.rates;
    if (data.result !== 'success' || !r?.GBP || !r.USD || !r.CAD) throw new Error('bad data');
    return new Response(JSON.stringify({ base: 'NGN', rates: { GBP: r.GBP, USD: r.USD, CAD: r.CAD }, updated: data.time_last_update_utc ?? null }), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=3600, s-maxage=43200, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Rates unavailable' }), {
      status: 502,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }
}
