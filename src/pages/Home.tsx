import { useRef, useState, type KeyboardEvent } from 'react';
import { PRODUCTS, TEXTURES, type Product } from '../data/products';
import { Link } from '../lib/router';
import { asset } from '../lib/format';
import { ProductCard } from '../components/ProductCard';
import { HeroStage } from '../components/HeroStage';

const PROMISES = [
  { title: '100% human hair', body: 'Colour it, curl it, straighten it. It behaves like your own.' },
  { title: 'HD lace that melts', body: 'A fine, skin-toned lace that disappears on deep and warm skin.' },
  { title: 'Ready to wear', body: 'Pre-plucked hairline and bleached knots, install-ready out of the box.' },
];

const TABS: { id: string; label: string; pick: (p: Product) => boolean }[] = [
  { id: 'edit', label: 'The edit', pick: (p) => !!p.featured },
  { id: 'new', label: 'New in', pick: (p) => p.badge === 'New in' },
  { id: 'best', label: 'Bestsellers', pick: (p) => p.badge === 'Bestseller' },
];

/** A photo for each texture word: the first unit of that texture that has one. */
const peekFor = (texture: string) => PRODUCTS.find((p) => p.texture === texture && p.image);

export function Home() {
  const [tab, setTab] = useState(TABS[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = TABS.find((t) => t.id === tab)!;
  const list = PRODUCTS.filter(current.pick).slice(0, 4);

  // Arrow keys move between tabs, as screen-reader users expect.
  const onTabKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + TABS.length) % TABS.length;
    setTab(TABS[n].id);
    tabRefs.current[n]?.focus();
  };

  return (
    <>
      <HeroStage />

      <section className="band band-light" aria-label="Shop the collection">
        <div className="wrap">
          <div className="home-tabs" role="tablist" aria-label="Collections">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`tab-${t.id}`}
                className="home-tab"
                role="tab"
                aria-selected={tab === t.id}
                aria-controls="tab-panel"
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            <div className="grid-products">
              {list.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
          <div className="home-more">
            <Link to="/shop" className="btn btn-ghost">
              Shop all units
            </Link>
          </div>
        </div>
      </section>

      <section className="band band-light band-tight-top textures" aria-labelledby="textures-title">
        <div className="wrap">
          <h2 id="textures-title" className="textures-intro">
            Shop by texture
          </h2>
          <ul className="texture-list">
            {TEXTURES.map((t) => {
              const peek = peekFor(t.id);
              return (
                <li key={t.id}>
                  <Link to={`/shop/${t.id}`} className="texture-link">
                    <span className="texture-word">{t.label}</span>
                    {peek?.image && (
                      <span className="texture-peek" aria-hidden="true">
                        <img src={asset(peek.image)} alt="" loading="lazy" style={{ objectPosition: peek.imagePosition ?? 'center' }} />
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="band band-light band-tight-top" aria-labelledby="story-title">
        <div className="wrap story">
          <div className="story-copy">
            <h2 id="story-title" className="display-md">
              The hair does the talking.
            </h2>
            <ul className="story-list">
              {PROMISES.map((p) => (
                <li key={p.title}>
                  <strong>{p.title}</strong>
                  <span>{p.body}</span>
                </li>
              ))}
            </ul>
            <Link to="/care" className="btn btn-ghost">
              How to care for it
            </Link>
          </div>
          <div className="story-media">
            <img src={asset('images/portrait-crop.jpg')} alt="Close portrait showing the lace hairline and soft brown waves" loading="lazy" />
          </div>
        </div>
      </section>
    </>
  );
}
