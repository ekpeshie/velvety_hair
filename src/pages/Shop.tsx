import { useMemo, useState } from 'react';
import { PRODUCTS, TEXTURES, fromPrice, type Texture } from '../data/products';
import { Link } from '../lib/router';
import { ProductCard } from '../components/ProductCard';

type Sort = 'featured' | 'low' | 'high';

export function Shop({ filter }: { filter?: string }) {
  const [sort, setSort] = useState<Sort>('featured');
  const texture = TEXTURES.find((t) => t.id === filter);
  const isNew = filter === 'new';

  const list = useMemo(() => {
    let l = PRODUCTS.slice();
    if (texture) l = l.filter((p) => p.texture === (texture.id as Texture));
    if (isNew) l = l.filter((p) => p.badge === 'New in');
    if (sort === 'low') l.sort((a, b) => fromPrice(a) - fromPrice(b));
    if (sort === 'high') l.sort((a, b) => fromPrice(b) - fromPrice(a));
    return l;
  }, [texture, isNew, sort]);

  const title = isNew ? 'New in' : texture ? texture.label : 'All units';
  const chips = [{ id: '', label: 'All' }, { id: 'new', label: 'New in' }, ...TEXTURES.map((t) => ({ id: t.id, label: t.label }))];

  return (
    <section className="band band-light page-top">
      <div className="wrap">
        <div className="eyebrow">Shop</div>
        <h1 className="h1">{title}</h1>
        {texture && <p className="lede-dark">{texture.note}</p>}

        <div className="toolbar">
          <nav className="chips scroll-x" aria-label="Filter by texture">
            {chips.map((c) => {
              const active = (filter ?? '') === c.id;
              return (
                <Link key={c.id || 'all'} to={c.id ? `/shop/${c.id}` : '/shop'} className={`chip ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
                  {c.label}
                </Link>
              );
            })}
          </nav>
          <div className="sort">
            <label htmlFor="sort">Sort</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="featured">Featured</option>
              <option value="low">Price, low to high</option>
              <option value="high">Price, high to low</option>
            </select>
          </div>
        </div>

        <p className="muted small count">
          {list.length} {list.length === 1 ? 'unit' : 'units'}
        </p>

        {list.length === 0 ? (
          <div className="empty">
            <p className="serif-lg">Nothing here yet.</p>
            <Link to="/shop" className="btn btn-primary">
              See all units
            </Link>
          </div>
        ) : (
          <div className="grid-products">
            {list.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
