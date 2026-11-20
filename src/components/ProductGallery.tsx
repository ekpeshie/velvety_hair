import { useEffect, useRef, useState } from 'react';
import { galleryOf, type Product } from '../data/products';
import { asset } from '../lib/format';
import { TextureArt } from './TextureArt';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

/*
 * The photos of one unit: front, sides, back, close-ups. Swipe, use the arrows or
 * the arrow keys, or tap a thumbnail. Other units never appear here.
 * Add angles by listing them in the product's `images` (see src/data/products.ts).
 */

const SETTLE_MS = 120;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ProductGallery({ product }: { product: Product }) {
  const photos = galleryOf(product);
  const trackRef = useRef<HTMLUListElement>(null);
  const settle = useRef<number>();
  const [index, setIndex] = useState(0);

  useEffect(() => () => window.clearTimeout(settle.current), []);

  if (photos.length === 0) {
    return (
      <div className="gallery">
        <div className="gallery-frame">
          <TextureArt texture={product.texture} ground={product.artGround} label={`${product.name} texture artwork`} />
        </div>
      </div>
    );
  }

  const goTo = (i: number) => {
    const track = trackRef.current;
    const n = Math.max(0, Math.min(photos.length - 1, i));
    setIndex(n);
    track?.scrollTo({ left: n * track.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  const onScroll = () => {
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const track = trackRef.current;
      if (track) setIndex(Math.round(track.scrollLeft / track.clientWidth));
    }, SETTLE_MS);
  };

  const many = photos.length > 1;
  const alt = (i: number) => `${product.name} unit, ${product.colour.toLowerCase()}, photo ${i + 1} of ${photos.length}`;

  return (
    <div className="gallery" aria-roledescription={many ? 'carousel' : undefined} aria-label={many ? `${product.name} photos` : undefined}>
      <div className="gallery-frame">
        <ul
          ref={trackRef}
          className="gallery-track"
          onScroll={many ? onScroll : undefined}
          tabIndex={many ? 0 : undefined}
          aria-label={many ? 'Swipe or use the arrow keys to see more angles' : undefined}
          onKeyDown={(e) => {
            if (!many) return;
            if (e.key === 'ArrowRight') goTo(index + 1);
            else if (e.key === 'ArrowLeft') goTo(index - 1);
            else return;
            e.preventDefault();
          }}
        >
          {photos.map((src, i) => (
            <li key={src} className="gallery-slide" aria-hidden={many && i !== index}>
              <img
                src={asset(src)}
                alt={alt(i)}
                style={i === 0 ? { objectPosition: product.imagePosition ?? 'center' } : undefined}
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </li>
          ))}
        </ul>

        {many && (
          <>
            <button type="button" className="icon-btn gallery-arrow is-prev" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous photo">
              <ChevronLeftIcon size={20} />
            </button>
            <button
              type="button"
              className="icon-btn gallery-arrow is-next"
              onClick={() => goTo(index + 1)}
              disabled={index === photos.length - 1}
              aria-label="Next photo"
            >
              <ChevronRightIcon size={20} />
            </button>
            <p className="gallery-count" aria-live="polite">
              {index + 1} / {photos.length}
            </p>
          </>
        )}
      </div>

      {many && (
        <ul className="gallery-thumbs" aria-label="Choose a photo">
          {photos.map((src, i) => (
            <li key={src}>
              <button type="button" className={`gallery-thumb ${i === index ? 'is-active' : ''}`} onClick={() => goTo(i)} aria-label={`Photo ${i + 1}`} aria-current={i === index}>
                <img src={asset(src)} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
