import { useEffect, useRef } from 'react';
import { getProduct } from '../data/products';
import { lineTotal, useCart } from '../store/cart';
import { money } from '../lib/format';
import { Link, navigate } from '../lib/router';
import { ProductImage } from './ProductCard';
import { CloseIcon, MinusIcon, PlusIcon } from './Icons';

export function CartDrawer() {
  const { open, setOpen, lines, setQty, remove, subtotal, count } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  return (
    <div className={`drawer-wrap ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={() => setOpen(false)} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Your bag">
        <div className="drawer-head">
          <h2 className="drawer-title">Your bag {count > 0 && <span className="muted">({count})</span>}</h2>
          <button ref={closeRef} className="icon-btn" onClick={() => setOpen(false)} aria-label="Close bag" tabIndex={open ? 0 : -1}>
            <CloseIcon />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <p className="serif-lg">Your bag is empty.</p>
            <p className="muted">Start with our signature Body Wave.</p>
            <Link to="/shop" className="btn btn-primary" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              Shop all units
            </Link>
          </div>
        ) : (
          <>
            <ul className="drawer-lines">
              {lines.map((l) => {
                const p = getProduct(l.slug)!;
                return (
                  <li key={l.slug + l.length} className="line">
                    <div className="line-media">
                      <ProductImage product={p} />
                    </div>
                    <div className="line-info">
                      <div className="line-top">
                        <div>
                          <div className="line-name">{p.name}</div>
                          <div className="muted small">
                            {l.length} inch · {p.colour}
                          </div>
                        </div>
                        <div className="price-sm">{money(lineTotal(l))}</div>
                      </div>
                      <div className="line-actions">
                        <div className="qty" role="group" aria-label={`Quantity of ${p.name}`}>
                          <button onClick={() => setQty(l.slug, l.length, l.qty - 1)} aria-label="Decrease quantity" tabIndex={open ? 0 : -1}>
                            <MinusIcon size={16} />
                          </button>
                          <span aria-live="polite">{l.qty}</span>
                          <button onClick={() => setQty(l.slug, l.length, l.qty + 1)} aria-label="Increase quantity" tabIndex={open ? 0 : -1}>
                            <PlusIcon size={16} />
                          </button>
                        </div>
                        <button className="text-btn" onClick={() => remove(l.slug, l.length)} tabIndex={open ? 0 : -1}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="drawer-foot">
              <div className="row-between">
                <span>Subtotal</span>
                <span className="price">{money(subtotal)}</span>
              </div>
              <p className="muted small">Delivery is worked out at checkout.</p>
              <button
                className="btn btn-primary btn-block"
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  setOpen(false);
                  navigate('/checkout');
                }}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
