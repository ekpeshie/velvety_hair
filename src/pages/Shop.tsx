import { useState } from 'react';
import { TEXTURES } from '../data/products';
import { useMoney } from '../lib/currency';
import { ProductCard } from '../components/ProductCard';
import { FilterDock } from '../components/FilterDock';
import { EMPTY_FILTERS, PRICE_BANDS, activeCount, fromRoute, results, textureLabel, type Filters } from '../lib/filters';

type History = { past: Filters[]; now: Filters; future: Filters[] };

export function Shop({ filter }: { filter?: string }) {
  const money = useMoney();
  const [h, setH] = useState<History>(() => ({ past: [], now: fromRoute(filter), future: [] }));
  const f = h.now;
  const list = results(f);

  const change = (next: Filters) => setH((x) => ({ past: [...x.past, x.now].slice(-50), now: next, future: [] }));
  const undo = () => setH((x) => (x.past.length ? { past: x.past.slice(0, -1), now: x.past[x.past.length - 1], future: [x.now, ...x.future] } : x));
  const redo = () => setH((x) => (x.future.length ? { past: [...x.past, x.now], now: x.future[0], future: x.future.slice(1) } : x));
  const clearAll = () => change({ ...EMPTY_FILTERS, sort: f.sort });

  const onlyTexture = f.texture.length === 1 && activeCount(f) === 1 ? TEXTURES.find((t) => t.id === f.texture[0]) : undefined;
  const title = f.newOnly && activeCount(f) === 1 ? 'New in' : onlyTexture ? onlyTexture.label : 'All units';

  const priceText = (id: string) => {
    const b = PRICE_BANDS.find((x) => x.id === id)!;
    return b.min === 0 ? `Under ${money(b.max + 1)}` : b.max === Infinity ? `${money(b.min)}+` : `${money(b.min)}–${money(b.max + 1)}`;
  };

  // What is applied, as removable pills above the results.
  const pills: { key: string; label: string; remove: () => void }[] = [
    ...(f.newOnly ? [{ key: 'new', label: 'New in', remove: () => change({ ...f, newOnly: false }) }] : []),
    ...f.texture.map((t) => ({ key: `t-${t}`, label: textureLabel(t), remove: () => change({ ...f, texture: f.texture.filter((x) => x !== t) }) })),
    ...[...f.length].sort((a, b) => a - b).map((l) => ({ key: `l-${l}`, label: `${l}″`, remove: () => change({ ...f, length: f.length.filter((x) => x !== l) }) })),
    ...f.lace.map((l) => ({ key: `la-${l}`, label: l.replace(' HD ', ' '), remove: () => change({ ...f, lace: f.lace.filter((x) => x !== l) }) })),
    ...f.colour.map((c) => ({ key: `c-${c}`, label: c, remove: () => change({ ...f, colour: f.colour.filter((x) => x !== c) }) })),
    ...f.price.map((p) => ({ key: `p-${p}`, label: priceText(p), remove: () => change({ ...f, price: f.price.filter((x) => x !== p) }) })),
  ];

  return (
    <section className="band band-light page-top shop">
      <div className="wrap">
        <h1 className="h1">{title}</h1>
        {onlyTexture && <p className="lede-dark">{onlyTexture.note}</p>}

        <div className="applied">
          <p className="muted small count" aria-live="polite">
            {list.length} {list.length === 1 ? 'unit' : 'units'}
          </p>
          {pills.length > 0 && (
            <ul className="applied-pills" aria-label="Filters in use">
              {pills.map((p) => (
                <li key={p.key}>
                  <button type="button" className="chip chip-x" onClick={p.remove} aria-label={`Remove ${p.label}`}>
                    {p.label} <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className="text-btn" onClick={clearAll}>
                  Clear all
                </button>
              </li>
            </ul>
          )}
        </div>

        {list.length === 0 ? (
          <div className="empty">
            <p className="serif-lg">Nothing matches all of that.</p>
            <p className="muted">Try removing a filter, or undo your last change.</p>
            <button type="button" className="btn btn-ghost" onClick={clearAll}>
              Show all units
            </button>
          </div>
        ) : (
          <div className="grid-products">
            {list.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}

        <FilterDock
          filters={f}
          onChange={change}
          onUndo={undo}
          onRedo={redo}
          canUndo={h.past.length > 0}
          canRedo={h.future.length > 0}
          onClearAll={clearAll}
        />
      </div>
    </section>
  );
}
