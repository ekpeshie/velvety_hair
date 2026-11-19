import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PRODUCTS } from '../data/products';
import { navigate } from '../lib/router';
import { ProductImage } from './ProductCard';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

/*
 * Every unit in one sideways rail. The current unit sits in the middle and its
 * neighbours peek in, faded. Swipe, scroll sideways, use the arrows or click a
 * neighbour: when the rail comes to rest, the page (and its URL) becomes that unit.
 */

const SETTLE_MS = 140;
const pad = (n: number) => String(n).padStart(2, '0');
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ProductRail({ slug }: { slug: string }) {
  const railRef = useRef<HTMLUListElement>(null);
  const settle = useRef<number>();
  const slugRef = useRef(slug);
  const mounted = useRef(false);
  const index = Math.max(0, PRODUCTS.findIndex((p) => p.slug === slug));
  const [live, setLive] = useState(index);

  slugRef.current = slug;

  const slides = () => Array.from(railRef.current?.children ?? []) as HTMLElement[];

  const nearest = () => {
    const rail = railRef.current;
    if (!rail) return 0;
    const centre = rail.scrollLeft + rail.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    slides().forEach((el, i) => {
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - centre);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    return best;
  };

  const goTo = (i: number, smooth = true) => {
    const rail = railRef.current;
    const el = slides()[i];
    if (!rail || !el) return;
    rail.scrollTo({
      left: el.offsetLeft + el.offsetWidth / 2 - rail.clientWidth / 2,
      behavior: smooth && !reducedMotion() ? 'smooth' : 'auto',
    });
  };

  // Follow the URL: jump on first paint, glide when a link elsewhere changes the unit.
  useLayoutEffect(() => {
    setLive(index);
    if (nearest() !== index) goTo(index, mounted.current);
    mounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs only when the unit changes
  }, [index]);

  useEffect(() => () => window.clearTimeout(settle.current), []);

  const onScroll = () => {
    setLive(nearest());
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const next = PRODUCTS[nearest()];
      if (next && next.slug !== slugRef.current) navigate(`/product/${next.slug}`, { replace: true, keepScroll: true });
    }, SETTLE_MS);
  };

  const prev = PRODUCTS[live - 1];
  const next = PRODUCTS[live + 1];

  return (
    <div className="rail-wrap">
      <ul ref={railRef} className="rail" onScroll={onScroll} tabIndex={0} aria-label="All units. Scroll sideways to browse.">
        {PRODUCTS.map((p, i) => (
          <li
            key={p.slug}
            className={`rail-slide ${i === live ? 'is-active' : ''}`}
            aria-hidden={i !== live}
            onClick={i === live ? undefined : () => goTo(i)}
          >
            <ProductImage product={p} eager={i === index} />
            {p.badge && <span className={`badge ${p.badge === 'New in' ? 'badge-solid' : 'badge-outline'}`}>{p.badge}</span>}
          </li>
        ))}
      </ul>

      <div className="rail-controls">
        <p className="rail-count" aria-hidden="true">
          <span>{pad(live + 1)}</span> / {pad(PRODUCTS.length)}
        </p>
        <div className="rail-arrows">
          <button className="icon-btn icon-btn-line" onClick={() => goTo(live - 1)} disabled={!prev} aria-label={prev ? `Previous unit: ${prev.name}` : 'Previous unit'}>
            <ChevronLeftIcon size={20} />
          </button>
          <button className="icon-btn icon-btn-line" onClick={() => goTo(live + 1)} disabled={!next} aria-label={next ? `Next unit: ${next.name}` : 'Next unit'}>
            <ChevronRightIcon size={20} />
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Unit {index + 1} of {PRODUCTS.length}: {PRODUCTS[index]?.name}
      </p>
    </div>
  );
}
