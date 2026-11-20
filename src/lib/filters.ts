import { PRODUCTS, TEXTURES, lengthsOf, type Product, type Texture } from '../data/products';

/*
 * Shop filters: what a shopper has picked, and which units match.
 * Every list is "any of": a unit matches Texture if its texture is one of those picked.
 * Empty lists mean "no filter".
 */

export type Sort = 'featured' | 'low' | 'high';

export type Filters = {
  texture: Texture[];
  length: number[];
  lace: string[];
  colour: string[];
  price: string[];
  /** the list on the left: 'all', 'new', 'best' or a collection id */
  view: string;
  sort: Sort;
};

export const EMPTY_FILTERS: Filters = { texture: [], length: [], lace: [], colour: [], price: [], view: 'all', sort: 'featured' };

const slugify = (s: string) => s.toLowerCase().replace(/^the /, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** The list on the left of the shop: quick views, then collections. */
export const VIEWS: { id: string; label: string; group: 'quick' | 'collection'; pick: (p: Product) => boolean }[] = [
  { id: 'all', label: 'All', group: 'quick', pick: () => true },
  { id: 'new', label: 'New in', group: 'quick', pick: (p) => p.badge === 'New in' },
  { id: 'best', label: 'Bestsellers', group: 'quick', pick: (p) => p.badge === 'Bestseller' },
  ...[...new Set(PRODUCTS.map((p) => p.collection))].map((c) => ({
    id: slugify(c),
    label: c,
    group: 'collection' as const,
    pick: (p: Product) => p.collection === c,
  })),
];
export const viewOf = (id: string) => VIEWS.find((v) => v.id === id) ?? VIEWS[0];

/** Length bands, each opening a row of exact lengths. */
export const LENGTH_BANDS = [
  { id: 'short', label: 'Short', min: 0, max: 14 },
  { id: 'medium', label: 'Medium', min: 15, max: 20 },
  { id: 'long', label: 'Long', min: 21, max: 26 },
  { id: 'xlong', label: 'Extra long', min: 27, max: 99 },
] as const;
export type BandId = (typeof LENGTH_BANDS)[number]['id'];

/** Every length any unit comes in, shortest first. */
export const ALL_LENGTHS = [...new Set(PRODUCTS.flatMap(lengthsOf))].sort((a, b) => a - b);
export const lengthsIn = (band: BandId) => {
  const b = LENGTH_BANDS.find((x) => x.id === band)!;
  return ALL_LENGTHS.filter((l) => l >= b.min && l <= b.max);
};

export const LACES = [...new Set(PRODUCTS.map((p) => p.lace))];
export const COLOURS = [...new Set(PRODUCTS.map((p) => p.colour))];

/** Swatch colour for each hair colour (CSS tokens in styles.css). */
export const swatchFor = (colour: string) =>
  ({ 'Natural black': 'var(--swatch-natural-black)', 'Chestnut brown': 'var(--swatch-chestnut)' })[colour] ?? 'var(--caramel)';

/** Price bands in naira. A unit matches if any of its lengths is priced inside the band. */
export const PRICE_BANDS = [
  { id: 'u100', min: 0, max: 99_999 },
  { id: '100-150', min: 100_000, max: 149_999 },
  { id: '150-200', min: 150_000, max: 199_999 },
  { id: '200', min: 200_000, max: Infinity },
] as const;

export function matches(p: Product, f: Filters) {
  if (!viewOf(f.view).pick(p)) return false;
  if (f.texture.length && !f.texture.includes(p.texture)) return false;
  if (f.lace.length && !f.lace.includes(p.lace)) return false;
  if (f.colour.length && !f.colour.includes(p.colour)) return false;
  // Lengths and prices work together: "24 inch under ₦200k" looks at the 24 inch price.
  const lengths = lengthsOf(p).filter((l) => !f.length.length || f.length.includes(l));
  if (!lengths.length) return false;
  if (f.price.length) {
    const bands = PRICE_BANDS.filter((b) => f.price.includes(b.id));
    if (!lengths.some((l) => bands.some((b) => p.prices[l] >= b.min && p.prices[l] <= b.max))) return false;
  }
  return true;
}

export function results(f: Filters) {
  const list = PRODUCTS.filter((p) => matches(p, f));
  const from = (p: Product) => Math.min(...Object.values(p.prices));
  if (f.sort === 'low') list.sort((a, b) => from(a) - from(b));
  if (f.sort === 'high') list.sort((a, b) => from(b) - from(a));
  return list;
}

export const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export const activeCount = (f: Filters) => f.texture.length + f.length.length + f.lace.length + f.colour.length + f.price.length;

export const textureLabel = (t: Texture) => TEXTURES.find((x) => x.id === t)?.label ?? t;

/** Start from a /shop/:filter link, e.g. /shop/curly, /shop/new or /shop/bob-edit. */
export function fromRoute(filter?: string): Filters {
  if (filter && VIEWS.some((v) => v.id === filter)) return { ...EMPTY_FILTERS, view: filter };
  if (TEXTURES.some((t) => t.id === filter)) return { ...EMPTY_FILTERS, texture: [filter as Texture] };
  return EMPTY_FILTERS;
}
