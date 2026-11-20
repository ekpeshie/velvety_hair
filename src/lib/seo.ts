import { PRODUCTS, TEXTURES, fromPrice, galleryOf, getProduct, lengthsOf } from '../data/products';
import { VIEWS, viewOf } from './filters';
import { match } from './router';
import { FAQ } from '../data/faq';

/*
 * Search and sharing details for each page: title, description, canonical address,
 * share image and structured data (schema.org JSON-LD).
 *
 * Used twice: at build time, to write a real HTML file for every public page
 * (scripts/prerender.mjs), and in the browser, to update the head as people move around.
 */

export const SITE_URL = 'https://www.velvetyhairs.store';
export const SITE_NAME = 'Velvety Hairs';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const BRAND_DESC = 'Premium human-hair wigs with HD lace, pre-plucked and ready to wear. Delivered across Nigeria and worldwide.';

export type PageMeta = {
  title: string;
  description: string;
  path: string;
  image: string;
  imageAlt: string;
  type: 'website' | 'product';
  noindex?: boolean;
  jsonLd: Record<string, unknown>[];
};

const abs = (p: string) => `${SITE_URL}/${p.replace(/^\//, '')}`;
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: abs('icon-512.png'),
};

const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
};

const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
});

function base(path: string, title: string, description: string, extra: Partial<PageMeta> = {}): PageMeta {
  return { title, description, path, image: DEFAULT_IMAGE, imageAlt: 'Velvety Hairs: hair that feels like velvet', type: 'website', jsonLd: [], ...extra };
}

export function metaFor(path: string): PageMeta {
  const clean = path.replace(/\/+$/, '') || '/';

  if (clean === '/')
    return base('/', `${SITE_NAME} | Premium human-hair wigs with HD lace`, BRAND_DESC, { jsonLd: [organization, website] });

  if (clean === '/shop')
    return base(
      '/shop',
      `Shop human-hair wigs | ${SITE_NAME}`,
      `Browse every Velvety Hairs unit: straight, body wave, deep wave, water wave, curly and bob wigs with HD lace. Prices from ${naira(Math.min(...PRODUCTS.map(fromPrice)))}.`,
      { jsonLd: [breadcrumbs([{ name: 'Shop', path: '/shop' }])] },
    );

  let m = match('/shop/:filter', clean);
  if (m) {
    const texture = TEXTURES.find((t) => t.id === m!.filter);
    const view = VIEWS.find((v) => v.id === m!.filter);
    if (texture || view) {
      const name = texture ? `${texture.label} wigs` : view!.id === 'new' ? 'New in' : view!.id === 'best' ? 'Bestsellers' : view!.label;
      const units = PRODUCTS.filter((p) => (texture ? p.texture === texture.id : viewOf(view!.id).pick(p)));
      const desc = texture
        ? `${texture.note} Shop ${texture.label.toLowerCase()} human-hair wigs with HD lace from ${SITE_NAME}.`
        : `${name} at ${SITE_NAME}: ${units.map((u) => u.name).join(', ')}. Human-hair wigs with HD lace, ready to wear.`;
      return base(clean, `${name} | ${SITE_NAME}`, desc, {
        jsonLd: [breadcrumbs([{ name: 'Shop', path: '/shop' }, { name, path: clean }])],
      });
    }
  }

  m = match('/product/:slug', clean);
  const p = m && getProduct(m.slug);
  if (p) {
    const prices = Object.values(p.prices);
    const photos = galleryOf(p).map(abs);
    const texture = TEXTURES.find((t) => t.id === p.texture)!;
    const lengths = lengthsOf(p);
    return {
      title: `${p.name} wig, ${p.lace}, ${p.density} | ${SITE_NAME}`,
      description: `${p.blurb} ${p.colour}, ${lengths[0]} to ${lengths[lengths.length - 1]} inch, from ${naira(fromPrice(p))}.`,
      path: clean,
      image: photos[0] ?? DEFAULT_IMAGE,
      imageAlt: `${p.name} unit, ${p.colour.toLowerCase()}`,
      type: 'product',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: `${p.name} human-hair wig`,
          description: p.blurb,
          image: photos,
          sku: p.slug,
          brand: { '@type': 'Brand', name: SITE_NAME },
          category: `Wigs > ${texture.label}`,
          color: p.colour,
          material: '100% human hair',
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'NGN',
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: prices.length,
            availability: 'https://schema.org/InStock',
            url: abs(clean),
          },
        },
        breadcrumbs([
          { name: 'Shop', path: '/shop' },
          { name: texture.label, path: `/shop/${texture.id}` },
          { name: p.name, path: clean },
        ]),
      ],
    };
  }

  if (clean === '/care')
    return base(
      '/care',
      `Wig care guide: keep your unit soft and full | ${SITE_NAME}`,
      'Six habits that keep a human-hair wig soft, full and tangle-free for longer: washing, detangling, heat and storage.',
    );

  if (clean === '/faq')
    return base('/faq', `Questions about our wigs, delivery and payment | ${SITE_NAME}`, 'Lengths, lace types, colouring, delivery in Nigeria and abroad, paying from outside Nigeria, and returns.', {
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        },
      ],
    });

  // Checkout, order pages and anything unknown: usable, but kept out of search.
  const title = clean === '/checkout' ? 'Checkout' : clean.startsWith('/order/') ? 'Order confirmed' : 'Page not found';
  return base(clean, `${title} | ${SITE_NAME}`, BRAND_DESC, { noindex: true });
}

/** Every page worth a search listing, for prerendering and the sitemap. */
export function publicPaths(): string[] {
  return [
    '/',
    '/shop',
    ...VIEWS.filter((v) => v.id !== 'all').map((v) => `/shop/${v.id}`),
    ...TEXTURES.map((t) => `/shop/${t.id}`),
    ...PRODUCTS.map((p) => `/product/${p.slug}`),
    '/care',
    '/faq',
  ];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The <head> tags for a page, as HTML. */
export function headTags(m: PageMeta): string {
  const url = abs(m.path === '/' ? '' : m.path);
  return [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    m.noindex ? `<meta name="robots" content="noindex" />` : '',
    `<meta property="og:type" content="${m.type === 'product' ? 'product' : 'website'}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${esc(m.image)}" />`,
    m.image === DEFAULT_IMAGE ? `<meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />` : '',
    `<meta property="og:image:alt" content="${esc(m.imageAlt)}" />`,
    `<meta property="og:locale" content="en_NG" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${esc(m.image)}" />`,
    ...m.jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ]
    .filter(Boolean)
    .join('\n    ');
}

/** In the browser: bring the head in line with the page being shown. */
export function applyHead(m: PageMeta) {
  const url = abs(m.path === '/' ? '' : m.path);
  const upsert = (tag: 'meta' | 'link', attr: string, key: string, valueAttr: string, value: string) => {
    let el = document.head.querySelector(`${tag}[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement(tag);
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute(valueAttr, value);
  };
  const named = (key: string, value: string) => upsert('meta', 'name', key, 'content', value);
  const prop = (key: string, value: string) => upsert('meta', 'property', key, 'content', value);

  document.title = m.title;
  named('description', m.description);
  upsert('link', 'rel', 'canonical', 'href', url);
  if (m.noindex) named('robots', 'noindex');
  else document.head.querySelector('meta[name="robots"]')?.remove();
  prop('og:title', m.title);
  prop('og:description', m.description);
  prop('og:url', url);
  prop('og:image', m.image);
  named('twitter:title', m.title);
  named('twitter:description', m.description);
  named('twitter:image', m.image);

  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((el) => el.remove());
  for (const j of m.jsonLd) {
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(j);
    document.head.appendChild(el);
  }
}
