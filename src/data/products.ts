/*
 * SAMPLE CATALOGUE. Replace names, prices, specs and photos with your real stock.
 * Prices are in naira and stored as whole numbers.
 * Most photos are free Unsplash demo stand-ins; sources are in public/images/CREDITS.md.
 * A product without `image` shows its texture artwork until you add a photo
 * (drop it in public/images and set `image: 'images/your-photo.jpg'`).
 */

export type Texture = 'straight' | 'body-wave' | 'deep-wave' | 'water-wave' | 'curly' | 'bob';

export type Product = {
  slug: string;
  name: string;
  collection: string;
  texture: Texture;
  lace: string;
  density: string;
  colour: string;
  /** length in inches -> price in naira */
  prices: Record<number, number>;
  defaultLength: number;
  image?: string;
  imagePosition?: string;
  /** background colour for the texture artwork shown until a photo is added */
  artGround?: string;
  badge?: 'New in' | 'Bestseller';
  blurb: string;
  featured?: boolean;
};

export const TEXTURES: { id: Texture; label: string; note: string }[] = [
  { id: 'straight', label: 'Straight', note: 'Sleek, glassy, swings when you move.' },
  { id: 'body-wave', label: 'Body wave', note: 'Soft S-waves with lift at the root.' },
  { id: 'deep-wave', label: 'Deep wave', note: 'Defined ripples that hold their pattern.' },
  { id: 'water-wave', label: 'Water wave', note: 'Wet-look waves, full and bouncy.' },
  { id: 'curly', label: 'Curly', note: 'Springy curls with real volume.' },
  { id: 'bob', label: 'Bobs', note: 'Short, sharp and ready in minutes.' },
];

export const PRODUCTS: Product[] = [
  {
    slug: 'body-wave',
    name: 'Body Wave',
    collection: 'The Signature Collection',
    texture: 'body-wave',
    lace: '13×4 HD frontal',
    density: '200%',
    colour: 'Natural black',
    prices: { 18: 165000, 20: 175000, 22: 185000, 24: 199000, 26: 215000 },
    defaultLength: 22,
    image: 'images/face-wide.jpg',
    imagePosition: 'center 20%',
    badge: 'New in',
    blurb: 'Our signature unit. Soft S-waves, a lace that melts into your skin and a hairline that is already plucked.',
    featured: true,
  },
  {
    slug: 'bone-straight',
    image: 'images/bone-straight.jpg',
    imagePosition: 'center 30%',
    name: 'Bone Straight',
    collection: 'The Signature Collection',
    texture: 'straight',
    lace: '13×4 HD frontal',
    density: '200%',
    colour: 'Natural black',
    prices: { 16: 150000, 20: 172000, 24: 198000, 28: 228000, 30: 245000 },
    defaultLength: 24,
    badge: 'Bestseller',
    blurb: 'Glassy, poker-straight and silky to the ends. Curl it, wave it or wear it sleek.',
    featured: true,
  },
  {
    slug: 'deep-wave',
    image: 'images/deep-wave.jpg',
    imagePosition: 'center 25%',
    name: 'Deep Wave',
    collection: 'The Signature Collection',
    texture: 'deep-wave',
    lace: '13×4 HD frontal',
    density: '180%',
    colour: 'Natural black',
    prices: { 18: 158000, 22: 178000, 26: 205000 },
    defaultLength: 22,
    blurb: 'Defined ripples from root to tip. Wet it, scrunch it and the pattern comes right back.',
    featured: true,
  },
  {
    slug: 'chestnut-body-wave',
    image: 'images/chestnut-body-wave.jpg',
    imagePosition: 'center 25%',
    name: 'Chestnut Body Wave',
    collection: 'The Colour Edit',
    texture: 'body-wave',
    lace: '13×4 HD frontal',
    density: '200%',
    colour: 'Chestnut brown',
    prices: { 20: 189000, 22: 199000, 24: 214000 },
    defaultLength: 22,
    artGround: '#7a3f2c',
    blurb: 'Our body wave in a rich chestnut, toned to glow on deep and warm skin.',
    featured: true,
  },
  {
    slug: 'water-wave',
    image: 'images/water-wave.jpg',
    imagePosition: 'center 30%',
    name: 'Water Wave',
    collection: 'Everyday Closures',
    texture: 'water-wave',
    lace: '5×5 HD closure',
    density: '180%',
    colour: 'Natural black',
    prices: { 16: 118000, 20: 136000, 24: 155000 },
    defaultLength: 20,
    blurb: 'Full, bouncy and beginner-friendly. A closure unit you can install yourself.',
  },
  {
    slug: 'kinky-curly',
    image: 'images/kinky-curly.jpg',
    imagePosition: 'center 30%',
    name: 'Kinky Curly',
    collection: 'Everyday Closures',
    texture: 'curly',
    lace: '5×5 HD closure',
    density: '200%',
    colour: 'Natural black',
    prices: { 14: 112000, 18: 132000, 22: 152000 },
    defaultLength: 18,
    badge: 'Bestseller',
    blurb: 'Springy curls that blend with natural 4A to 4C hair. Volume without the weight.',
  },
  {
    slug: 'sleek-bob',
    image: 'images/sleek-bob.jpg',
    imagePosition: 'center 30%',
    name: 'Sleek Bob',
    collection: 'The Bob Edit',
    texture: 'bob',
    lace: '4×4 HD closure',
    density: '180%',
    colour: 'Natural black',
    prices: { 10: 85000, 12: 95000, 14: 105000 },
    defaultLength: 12,
    blurb: 'A blunt, chin-skimming bob. Glueless, so it goes on in minutes.',
  },
  {
    slug: 'wavy-bob',
    image: 'images/wavy-bob.jpg',
    imagePosition: 'center 30%',
    name: 'Wavy Bob',
    collection: 'The Bob Edit',
    texture: 'bob',
    lace: '4×4 HD closure',
    density: '180%',
    colour: 'Natural black',
    prices: { 10: 89000, 12: 99000, 14: 109000 },
    defaultLength: 12,
    badge: 'New in',
    blurb: 'Loose, lived-in waves cut to the jaw. Soft and polished at once.',
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export const lengthsOf = (p: Product) => Object.keys(p.prices).map(Number).sort((a, b) => a - b);

export const fromPrice = (p: Product) => Math.min(...Object.values(p.prices));

/*
 * Delivery. All fees are in naira, because every payment is taken in naira.
 * SAMPLE fees: set your own. Nigeria gets the local options; every other country
 * gets the international ones, priced by shipping zone.
 */
export type DeliveryOption = {
  id: string;
  label: string;
  detail: string;
  fee: number;
  /** the cost is agreed with the customer later and is not part of this payment */
  arranged?: boolean;
};

const NIGERIA: DeliveryOption[] = [
  { id: 'lagos', label: 'Lagos dispatch', detail: '1 to 2 working days', fee: 3500 },
  { id: 'nationwide', label: 'Nationwide courier', detail: '2 to 5 working days', fee: 7500 },
  { id: 'pickup', label: 'Studio pickup', detail: 'We will message you when it is ready', fee: 0 },
];

export type Zone = 'europe' | 'north-america' | 'world';

/** UK, EU and the rest of Europe. Everything not listed here or in North America is 'world'. */
const EUROPE = new Set(
  'GB IE FR DE NL BE LU ES PT IT AT CH LI DK SE NO FI IS PL CZ SK HU SI HR RO BG GR CY MT EE LV LT MC SM VA AD'.split(' '),
);
const NORTH_AMERICA = new Set(['US', 'CA']);

export const zoneFor = (country: string): Zone => (EUROPE.has(country) ? 'europe' : NORTH_AMERICA.has(country) ? 'north-america' : 'world');

const INTERNATIONAL: { id: string; label: string; detail: string; fees: Record<Zone, number>; arranged?: boolean }[] = [
  { id: 'dhl', label: 'DHL Express', detail: '3 to 6 working days, tracked', fees: { europe: 85000, 'north-america': 95000, world: 110000 } },
  { id: 'fedex', label: 'FedEx International', detail: '4 to 7 working days, tracked', fees: { europe: 80000, 'north-america': 90000, world: 105000 } },
  {
    id: 'arrange',
    label: 'Arrange delivery with us',
    detail: 'We will message you to agree the courier and cost. Delivery is not included in this payment.',
    fees: { europe: 0, 'north-america': 0, world: 0 },
    arranged: true,
  },
];

export function deliveryOptions(country: string): DeliveryOption[] {
  if (country === 'NG') return NIGERIA;
  const zone = zoneFor(country);
  return INTERNATIONAL.map(({ fees, ...o }) => ({ ...o, fee: fees[zone] }));
}
