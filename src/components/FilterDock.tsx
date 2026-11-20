import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { TEXTURES } from '../data/products';
import { useMoney } from '../lib/currency';
import {
  COLOURS,
  LACES,
  LENGTH_BANDS,
  PRICE_BANDS,
  lengthsIn,
  swatchFor,
  toggle,
  type BandId,
  type Filters,
  type Sort,
} from '../lib/filters';
import { ClearIcon, LaceIcon, LengthIcon, MoreIcon, PriceIcon, RedoIcon, SortIcon, TextureGlyph, UndoIcon } from './FilterIcons';

/*
 * The filter dock on the shop page.
 *
 * A dark bar sits at the bottom: undo / redo, the filter categories, and "more".
 * Picking a category slides a white panel up from beneath it. Some options open a
 * further panel (Length -> a band -> exact lengths). The panel on top is the one in
 * focus; the one under it is muted (tone, grey icons, flat, sunk a little), and
 * anything further down tucks away to a sliver. Escape or the cross closes the top panel.
 */

type Level = 'texture' | 'length' | `band:${BandId}` | 'lace' | 'colour' | 'price' | 'more';
type Category = Exclude<Level, `band:${string}`>;

type Option = {
  key: string;
  label: string;
  icon: ReactNode;
  pressed?: boolean;
  /** opens another panel on top instead of toggling */
  opens?: Level;
  /** small number shown on the option, e.g. how many lengths are picked inside a band */
  badge?: number;
  onPick: () => void;
};

const shortLace = (l: string) => l.replace(' HD ', ' ');
/** Layers under the one in focus are inert: not clickable or focusable. (React 18 has no typed prop.) */
const inertIf = (on: boolean) => (on ? ({ inert: '' } as Record<string, string>) : {});
const shortColour = (c: string) => c.replace(' brown', '');

export function FilterDock({
  filters,
  onChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearAll,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearAll: () => void;
}) {
  const money = useMoney();
  const [stack, setStack] = useState<Level[]>([]);
  const dockRef = useRef<HTMLDivElement>(null);
  const openers = useRef<(HTMLElement | null)[]>([]);
  const f = filters;
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch });

  /** Open a panel on top of the first `keep` panels (0 = straight from the bar). */
  const open = (level: Level, from: HTMLElement | null, keep: number) => {
    setStack((s) => {
      const base = s.slice(0, keep);
      openers.current = [...openers.current.slice(0, keep), from];
      return [...base, level];
    });
  };
  const close = (depth = 1) => {
    const opener = openers.current[stack.length - depth];
    setStack((s) => s.slice(0, Math.max(0, s.length - depth)));
    opener?.focus({ preventScroll: true });
  };

  // Escape closes the top panel; a click outside the dock closes them all.
  useEffect(() => {
    if (!stack.length) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onDown = (e: PointerEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) setStack([]);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  });

  // Move focus into a panel when it opens (keyboard users land on its first option).
  const prevDepth = useRef(0);
  useEffect(() => {
    if (stack.length > prevDepth.current) {
      dockRef.current?.querySelector<HTMLElement>(`[data-depth="0"] .dock-opt`)?.focus({ preventScroll: true });
    }
    prevDepth.current = stack.length;
  }, [stack.length]);

  const priceLabel = (b: (typeof PRICE_BANDS)[number]) =>
    b.min === 0 ? `Under ${money(b.max + 1)}` : b.max === Infinity ? `${money(b.min)}+` : `${money(b.min)}–${money(b.max + 1)}`;

  const optionsFor = (level: Level): Option[] => {
    if (level === 'texture')
      return TEXTURES.map((t) => ({
        key: t.id,
        label: t.label,
        icon: <TextureGlyph texture={t.id} />,
        pressed: f.texture.includes(t.id),
        onPick: () => set({ texture: toggle(f.texture, t.id) }),
      }));
    if (level === 'length')
      return LENGTH_BANDS.map((b) => {
        const inBand = lengthsIn(b.id);
        const picked = inBand.filter((l) => f.length.includes(l)).length;
        return {
          key: b.id,
          label: b.label,
          icon: (
            <span className="dock-num">
              {inBand[0]}–{inBand[inBand.length - 1]}″
            </span>
          ),
          pressed: picked > 0,
          badge: picked || undefined,
          opens: `band:${b.id}` as Level,
          onPick: () => {},
        };
      });
    if (level.startsWith('band:')) {
      const inBand = lengthsIn(level.slice(5) as BandId);
      const all = inBand.every((l) => f.length.includes(l));
      return [
        {
          key: 'all',
          label: 'All',
          icon: <LengthIcon />,
          pressed: all,
          onPick: () => set({ length: all ? f.length.filter((l) => !inBand.includes(l)) : [...new Set([...f.length, ...inBand])] }),
        },
        ...inBand.map((l) => ({
          key: String(l),
          label: 'inch',
          icon: <span className="dock-num is-lg">{l}″</span>,
          pressed: f.length.includes(l),
          onPick: () => set({ length: toggle(f.length, l) }),
        })),
      ];
    }
    if (level === 'lace')
      return LACES.map((l) => ({
        key: l,
        label: shortLace(l),
        icon: <LaceIcon />,
        pressed: f.lace.includes(l),
        onPick: () => set({ lace: toggle(f.lace, l) }),
      }));
    if (level === 'colour')
      return COLOURS.map((c) => ({
        key: c,
        label: shortColour(c),
        icon: <span className="dock-swatch" style={{ '--swatch': swatchFor(c) } as CSSProperties} />,
        pressed: f.colour.includes(c),
        onPick: () => set({ colour: toggle(f.colour, c) }),
      }));
    if (level === 'price')
      return PRICE_BANDS.map((b) => ({
        key: b.id,
        label: priceLabel(b),
        icon: <PriceIcon />,
        pressed: f.price.includes(b.id),
        onPick: () => set({ price: toggle(f.price, b.id) }),
      }));
    // more: sort order
    const sorts: [Sort, string][] = [
      ['featured', 'Featured'],
      ['low', 'Price up'],
      ['high', 'Price down'],
    ];
    return [
      ...sorts.map(([id, label]) => ({
        key: id,
        label,
        icon: <SortIcon />,
        pressed: f.sort === id,
        onPick: () => set({ sort: id }),
      })),
    ];
  };

  const titleFor = (level: Level) =>
    level.startsWith('band:')
      ? `${LENGTH_BANDS.find((b) => b.id === level.slice(5))!.label} lengths`
      : { texture: 'Texture', length: 'Length', lace: 'Lace', colour: 'Colour', price: 'Price', more: 'Sort and more' }[level as Category];

  const colourTab =
    f.colour.length === 1 ? (
      <span className="dock-swatch" style={{ '--swatch': swatchFor(f.colour[0]) } as CSSProperties} />
    ) : (
      <span className="dock-swatch is-ring" />
    );

  const CATS: { id: Category; label: string; icon: ReactNode; count: number }[] = [
    { id: 'texture', label: 'Texture', icon: <TextureGlyph texture={f.texture.length === 1 ? f.texture[0] : 'any'} />, count: f.texture.length },
    { id: 'length', label: 'Length', icon: <LengthIcon />, count: f.length.length },
    { id: 'lace', label: 'Lace', icon: <LaceIcon />, count: f.lace.length },
    { id: 'colour', label: 'Colour', icon: colourTab, count: f.colour.length },
    { id: 'price', label: 'Price', icon: <PriceIcon />, count: f.price.length },
  ];

  const depthOf = (i: number) => stack.length - i; // 0 = the layer in focus
  const root = stack[0];

  return (
    <div className="dock" ref={dockRef}>
      <div className={`dock-stack ${stack.length > 1 ? 'is-deep' : ''}`}>
        {/* panels, newest on top */}
        <div className="dock-panels">
        {[...stack]
          .map((level, i) => ({ level, i }))
          .reverse()
          .map(({ level, i }) => {
            const depth = depthOf(i + 1);
            const opts = optionsFor(level);
            return (
              <div
                key={level}
                className="dock-layer dock-panel"
                data-depth={Math.min(depth, 2)}
                role="group"
                aria-label={titleFor(level)}
                {...inertIf(depth > 0)}
              >
                <div className="dock-opts">
                  {opts.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      className={`dock-opt ${o.pressed ? 'is-on' : ''}`}
                      aria-pressed={o.opens ? undefined : !!o.pressed}
                      aria-expanded={o.opens ? stack.includes(o.opens) : undefined}
                      onClick={(e) => (o.opens ? open(o.opens, e.currentTarget, i + 1) : o.onPick())}
                    >
                      <span className="dock-icon">{o.icon}</span>
                      <span className="dock-label">{o.label}</span>
                      {o.badge ? <span className="dock-badge">{o.badge}</span> : null}
                    </button>
                  ))}
                </div>
                <span className="dock-sep" aria-hidden="true" />
                {level === 'more' && (
                  <button type="button" className="dock-text-btn" onClick={onClearAll}>
                    Clear all
                  </button>
                )}
                <button type="button" className="dock-icon-btn" onClick={() => close()} aria-label={`Close ${titleFor(level).toLowerCase()}`}>
                  <ClearIcon />
                </button>
              </div>
            );
          })}
        </div>

        {/* the bar */}
        <div className="dock-layer dock-bar" data-depth={Math.min(depthOf(0), 2)} {...inertIf(stack.length > 1)}>
          {/* on phones this only shows once there is something to undo, to leave room for the categories */}
          <div className={`dock-history ${canUndo || canRedo ? '' : 'is-idle'}`}>
            <button type="button" className="dock-icon-btn" onClick={onUndo} disabled={!canUndo} aria-label="Undo last filter change">
              <UndoIcon />
            </button>
            <button type="button" className="dock-icon-btn" onClick={onRedo} disabled={!canRedo} aria-label="Redo filter change">
              <RedoIcon />
            </button>
          </div>
          <span className={`dock-sep ${canUndo || canRedo ? '' : 'is-idle'}`} aria-hidden="true" />
          <div className="dock-cats" role="toolbar" aria-label="Filter units">
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`dock-tab ${root === c.id ? 'is-open' : ''}`}
                aria-expanded={root === c.id}
                onClick={(e) => (root === c.id ? setStack([]) : open(c.id, e.currentTarget, 0))}
              >
                <span className="dock-icon">{c.icon}</span>
                <span className="dock-label">{c.label}</span>
                {c.count > 0 && (
                  <span className="dock-badge" aria-label={`${c.count} selected`}>
                    {c.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <span className="dock-sep" aria-hidden="true" />
          <button
            type="button"
            className={`dock-icon-btn dock-more ${root === 'more' ? 'is-open' : ''}`}
            aria-expanded={root === 'more'}
            aria-label="Sort and more"
            onClick={(e) => (root === 'more' ? setStack([]) : open('more', e.currentTarget, 0))}
          >
            <MoreIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
