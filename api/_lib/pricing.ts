/*
 * Works out what a bag costs from the catalogue, never from prices the browser sends.
 * (Files in api/_lib are helpers, not endpoints: Vercel skips names starting with _.)
 */
import { deliveryOptions, getProduct } from '../../src/data/products.js';
import { COUNTRY_CODES } from '../../src/data/countries.js';

export type PricedOrder = { subtotal: number; fee: number; total: number };

export function priceOrder(lines: unknown, delivery: unknown, country: unknown): PricedOrder | null {
  if (typeof country !== 'string' || !COUNTRY_CODES.includes(country)) return null;
  const option = deliveryOptions(country).find((d) => d.id === delivery);
  if (!option || !Array.isArray(lines) || lines.length === 0 || lines.length > 50) return null;

  let subtotal = 0;
  for (const line of lines as unknown[]) {
    if (!line || typeof line !== 'object') return null;
    const { slug, length, qty } = line as Record<string, unknown>;
    const product = typeof slug === 'string' ? getProduct(slug) : undefined;
    const price = product && typeof length === 'number' ? product.prices[length] : undefined;
    if (!price || typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > 10) return null;
    subtotal += price * qty;
  }
  return { subtotal, fee: option.fee, total: subtotal + option.fee };
}
