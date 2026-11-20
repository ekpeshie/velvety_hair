import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { PRODUCTS, TEXTURES, fromPrice } from '../data/products';
import { Link } from '../lib/router';
import { asset } from '../lib/format';
import { useMoney } from '../lib/currency';
import { ProductImage } from './ProductCard';
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from './Icons';

/*
 * The home page hero. It opens on the campaign photo, then the photo shrinks into
 * the first place of a line-up of every unit, and the line-up steps through them.
 *
 * intro  -> campaign photo, full stage, for INTRO_MS (click or "Enter" skips)
 * morph  -> the photo flies into the first card while the rest of the line-up arrives
 * lineup -> one unit in the spotlight at a time, advancing every STEP_MS
 *
 * The intro plays once per page load, not every time you come back to Home.
 */

const INTRO_MS = 3200;
// The campaign model wears this unit, so its card shows the campaign photo and the
// intro lands on it exactly. It must be the first unit in PRODUCTS.
const COVER = { slug: 'body-wave', src: 'images/campaign-hero.jpg' };
const CAMPAIGN_ALT = 'Model in a cocoa dress wearing glossy brown body wave hair, with the velvety. HAIRS logo';
const MORPH_MS = 1000;
const STEP_MS = 3200;
const SETTLE_MS = 140;
const EASE = 'cubic-bezier(0.7, 0, 0.2, 1)';

const pad = (n: number) => String(n).padStart(2, '0');
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const noteFor = (id: string) => TEXTURES.find((t) => t.id === id)?.label ?? '';

let introPlayed = false;

type Phase = 'intro' | 'morph' | 'lineup';

export function HeroStage() {
  const money = useMoney();
  const stageRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);
  const settle = useRef<number>();

  const [phase, setPhase] = useState<Phase>(() => (introPlayed ? 'lineup' : 'intro'));
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(() => reducedMotion());
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);

  const cards = () => Array.from(rowRef.current?.children ?? []) as HTMLElement[];

  const scrollToCard = (i: number, smooth = true) => {
    const row = rowRef.current;
    const el = cards()[i];
    if (!row || !el) return;
    row.scrollTo({
      left: el.offsetLeft + el.offsetWidth / 2 - row.clientWidth / 2,
      behavior: smooth && !reducedMotion() ? 'smooth' : 'auto',
    });
  };

  const nearest = () => {
    const row = rowRef.current;
    if (!row) return 0;
    const centre = row.scrollLeft + row.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    cards().forEach((el, i) => {
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - centre);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    return best;
  };

  const go = (i: number) => {
    const n = (i + PRODUCTS.length) % PRODUCTS.length;
    setActive(n);
    scrollToCard(n);
  };

  // Shrink the campaign photo into the first card. The photo always fills the
  // stage height and sits centred, so scaling it to the card's height and
  // clipping it to the card's width lands exactly on the card's cover crop.
  const startMorph = () => {
    if (phase !== 'intro') return;
    introPlayed = true;
    const stage = stageRef.current;
    const intro = introRef.current;
    const first = cards()[0]?.querySelector<HTMLElement>('.stage-card-media');
    if (!stage || !intro || !first || reducedMotion() || !intro.animate) {
      setPhase('lineup');
      return;
    }
    scrollToCard(0, false);
    const s = stage.getBoundingClientRect();
    const c = first.getBoundingClientRect();
    const scale = c.height / s.height;
    const x = c.left - s.left;
    const y = c.top - s.top;
    const tx = x + c.width / 2 - (s.width / 2) * scale;
    const ty = y + c.height / 2 - (s.height / 2) * scale;
    const side = (s.width - c.width / scale) / 2;
    const radius = parseFloat(getComputedStyle(first).borderTopLeftRadius) / scale;

    setPhase('morph');
    const anim = intro.animate(
      [
        { transform: 'translate(0, 0) scale(1)', clipPath: 'inset(0px 0px 0px 0px round 0px)' },
        { transform: `translate(${tx}px, ${ty}px) scale(${scale})`, clipPath: `inset(0px ${side}px 0px ${side}px round ${radius}px)` },
      ],
      { duration: MORPH_MS, easing: EASE, fill: 'forwards' },
    );
    // The card underneath shows the same photo with the same crop, so a quick dissolve hides the swap.
    const fadeOut = intro.animate([{ opacity: 1 }, { opacity: 1, offset: 0.78 }, { opacity: 0 }], { duration: MORPH_MS, fill: 'forwards' });
    const fadeIn = first.animate([{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1 }], { duration: MORPH_MS, fill: 'both' });
    anim.onfinish = () => {
      setPhase('lineup');
      fadeOut.cancel();
      fadeIn.cancel();
    };
  };

  // Intro timer.
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = window.setTimeout(startMorph, INTRO_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startMorph reads fresh refs
  }, [phase]);

  // Coming back to Home: line the row up on the first unit without animating.
  useLayoutEffect(() => {
    if (phase === 'lineup') scrollToCard(active, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- first paint only
  }, []);

  // Pause when the tab is in the background.
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Autoplay: step to the next unit. Any change of unit restarts the clock.
  const holding = paused || hovering || focused || touching || hidden;
  useEffect(() => {
    if (phase !== 'lineup' || holding) return;
    const t = window.setTimeout(() => go(active + 1), STEP_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- go is stable in effect
  }, [phase, holding, active]);

  useEffect(() => () => window.clearTimeout(settle.current), []);

  // A hand-driven scroll picks whichever card comes to rest in the middle.
  const onScroll = () => {
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const n = nearest();
      setActive((a) => (a === n ? a : n));
    }, SETTLE_MS);
  };

  const onRowKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = Math.min(PRODUCTS.length - 1, Math.max(0, active + (e.key === 'ArrowRight' ? 1 : -1)));
    go(n);
    cards()[n]?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
  };

  // Keyboard focus inside the line-up holds it still; the controls do not, so Play works.
  const product = PRODUCTS[active];
  const autoplaying = phase === 'lineup' && !holding;

  return (
    <section
      ref={stageRef}
      className={`stage is-${phase}`}
      aria-roledescription="carousel"
      aria-label="The Signature Collection"
      onFocus={(e) => setFocused(e.target.matches(':focus-visible') && !e.target.closest('.stage-controls'))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
    >
      {phase !== 'lineup' && (
        <div ref={introRef} className="stage-intro" onClick={startMorph}>
          <img
            src={asset('images/campaign-hero.jpg')}
            alt={CAMPAIGN_ALT}
            width="1400"
            height="1400"
            fetchPriority="high"
          />
          {phase === 'intro' && (
            <>
              <button
                type="button"
                className="btn btn-on-dark stage-enter"
                onClick={(e) => {
                  e.stopPropagation();
                  startMorph();
                }}
              >
                Enter the collection
              </button>
              <span className="stage-timer" style={{ animationDuration: `${INTRO_MS}ms` }} aria-hidden="true" />
            </>
          )}
        </div>
      )}

      <div className="stage-head wrap">
        <h1 className="stage-title">Hair that feels like velvet.</h1>
      </div>

      <ul
        ref={rowRef}
        className="stage-row"
        onScroll={onScroll}
        onKeyDown={onRowKey}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onTouchStart={() => setTouching(true)}
        onTouchEnd={() => setTouching(false)}
        aria-label={`${PRODUCTS.length} units`}
      >
        {PRODUCTS.map((p, i) => (
          <li key={p.slug} className={`stage-card ${i === active ? 'is-active' : ''}`} style={{ ['--i' as string]: i }}>
            <Link
              to={`/product/${p.slug}`}
              aria-current={i === active ? 'true' : undefined}
              aria-label={`${p.name}, ${noteFor(p.texture).toLowerCase()}, from ${money(fromPrice(p))}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => {
                setActive(i);
                scrollToCard(i);
              }}
            >
              <span className="stage-card-media">
                {p.slug === COVER.slug ? (
                  <img src={asset(COVER.src)} alt="" width="1400" height="1400" />
                ) : (
                  <ProductImage product={p} eager={i < 3} />
                )}
              </span>
              <span className="stage-card-label" aria-hidden="true">
                <span>{p.name}</span>
                <span className="stage-card-price">{money(fromPrice(p))}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="stage-foot wrap">
        <div className="stage-info" aria-live={autoplaying ? 'off' : 'polite'} aria-atomic="true">
          <div className="stage-count">
            Unit <span>{pad(active + 1)}</span> / {pad(PRODUCTS.length)}
          </div>
          <h2 className="stage-name">{product.name}</h2>
          <p className="stage-meta">
            {noteFor(product.texture)} · {product.lace} · from {money(fromPrice(product))}
          </p>
        </div>
        <div className="stage-actions">
          <Link to={`/product/${product.slug}`} className="btn btn-primary">
            Shop the {product.name}
          </Link>
          <div className="stage-controls">
            <button type="button" className="icon-btn stage-btn" onClick={() => go(active - 1)} aria-label="Previous unit">
              <ChevronLeftIcon size={20} />
            </button>
            <button
              type="button"
              className="icon-btn stage-btn"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'Play the line-up' : 'Pause the line-up'}
            >
              {paused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
            </button>
            <button type="button" className="icon-btn stage-btn" onClick={() => go(active + 1)} aria-label="Next unit">
              <ChevronRightIcon size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
