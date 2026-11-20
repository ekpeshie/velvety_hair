/*
 * After `vite build`, write a real HTML file for every public page, with its own
 * title, description, canonical link, share tags and structured data, plus
 * sitemap.xml, robots.txt and app.html (the plain shell for checkout and order pages).
 *
 * Vercel serves /shop/curly from dist/shop/curly.html (cleanUrls in vercel.json).
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const ssr = resolve(root, 'dist-ssr');
const { render, metaFor, publicPaths, headTags, SITE_URL } = await import(pathToFileURL(resolve(ssr, 'entry-server.js')).href);

const template = readFileSync(resolve(dist, 'index.html'), 'utf8');
const HEAD = /<!--seo-->[\s\S]*?<!--\/seo-->/;
if (!HEAD.test(template) || !template.includes('<div id="root"></div>')) throw new Error('index.html is missing the <!--seo--> block or the empty root div');

const page = (path, body) =>
  template.replace(HEAD, `<!--seo-->\n    ${headTags(metaFor(path))}\n    <!--/seo-->`).replace('<div id="root"></div>', `<div id="root">${body}</div>`);

const write = (file, html) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

// The shell for pages that are not prerendered (checkout, orders, unknown links): kept out of search.
write(
  resolve(dist, 'app.html'),
  page('/checkout', '')
    .replace(/<title>[^<]*<\/title>/, '<title>Velvety Hairs</title>')
    // it stands in for many addresses, so it names none of them
    .replace(/\s*<link rel="canonical"[^>]*>/, '')
    .replace(/\s*<meta property="og:url"[^>]*>/, ''),
);

const paths = publicPaths();
for (const path of paths) {
  const file = path === '/' ? resolve(dist, 'index.html') : resolve(dist, `${path.slice(1)}.html`);
  write(file, page(path, render(path)));
}

const today = new Date().toISOString().slice(0, 10);
write(
  resolve(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((p) => `  <url><loc>${SITE_URL}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`,
);
write(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /checkout\nDisallow: /order/\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

rmSync(ssr, { recursive: true, force: true });
console.log(`prerendered ${paths.length} pages, sitemap.xml, robots.txt, app.html`);
