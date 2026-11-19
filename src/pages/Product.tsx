import { useState } from 'react';
import { PRODUCTS, TEXTURES, getProduct, lengthsOf, type Product } from '../data/products';
import { Link } from '../lib/router';
import { money } from '../lib/format';
import { useCart } from '../store/cart';
import { ProductCard } from '../components/ProductCard';
import { ProductRail } from '../components/ProductRail';
import { CheckIcon, MinusIcon, PlusIcon } from '../components/Icons';
import { NotFound } from './NotFound';

export function ProductPage({ slug }: { slug: string }) {
  const product = getProduct(slug);
  if (!product) return <NotFound />;

  const texture = TEXTURES.find((t) => t.id === product.texture)!;
  const related = PRODUCTS.filter((p) => p.slug !== product.slug && (p.texture === product.texture || p.collection === product.collection)).slice(0, 4);

  return (
    <>
      <section className="band band-light page-top">
        <div className="wrap">
          <nav className="crumbs small" aria-label="Breadcrumb">
            <Link to="/shop">Shop</Link> <span aria-hidden="true">/</span> <Link to={`/shop/${texture.id}`}>{texture.label}</Link>{' '}
            <span aria-hidden="true">/</span> <span aria-current="page">{product.name}</span>
          </nav>

          <div className="pdp">
            <div className="pdp-stage">
              <ProductRail slug={product.slug} />
            </div>
            {/* keyed so length, quantity and "Added" reset for each unit */}
            <ProductInfo key={product.slug} product={product} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="band band-light band-tight-top" aria-labelledby="related-title">
          <div className="wrap">
            <h2 id="related-title" className="h2 h2-spaced">
              You may also love
            </h2>
            <div className="grid-products">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function ProductInfo({ product }: { product: Product }) {
  const { add, setOpen } = useCart();
  const [length, setLength] = useState(product.defaultLength);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const lengths = lengthsOf(product);
  const price = product.prices[length] ?? product.prices[product.defaultLength];
  const texture = TEXTURES.find((t) => t.id === product.texture)!;

  const addToBag = () => {
    add(product.slug, length, qty);
    setAdded(true);
    setOpen(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="pdp-info">
      <div className="eyebrow">{product.collection}</div>
      <h1 className="display-dark">{product.name}</h1>
      <p className="pdp-price" aria-live="polite">
        {money(price)}
      </p>
      <p className="lede-dark">{product.blurb}</p>

      <fieldset className="lengths">
        <legend>
          Length <span className="muted">· {length} inch</span>
        </legend>
        <div className="pill-row">
          {lengths.map((l) => (
            <label key={l} className={`pill ${l === length ? 'is-active' : ''}`}>
              <input type="radio" name="length" value={l} checked={l === length} onChange={() => setLength(l)} />
              {l}"
            </label>
          ))}
        </div>
      </fieldset>

      <div className="buy-row">
        <div className="qty qty-lg" role="group" aria-label="Quantity">
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">
            <MinusIcon size={18} />
          </button>
          <span aria-live="polite">{qty}</span>
          <button onClick={() => setQty(Math.min(10, qty + 1))} aria-label="Increase quantity">
            <PlusIcon size={18} />
          </button>
        </div>
        <button className="btn btn-primary btn-grow" onClick={addToBag}>
          {added ? (
            <>
              <CheckIcon size={18} /> Added
            </>
          ) : (
            `Add to bag · ${money(price * qty)}`
          )}
        </button>
      </div>

      <dl className="specs">
        <div>
          <dt>Texture</dt>
          <dd>{texture.label}</dd>
        </div>
        <div>
          <dt>Lace</dt>
          <dd>{product.lace}</dd>
        </div>
        <div>
          <dt>Density</dt>
          <dd>{product.density}</dd>
        </div>
        <div>
          <dt>Colour</dt>
          <dd>{product.colour}</dd>
        </div>
        <div>
          <dt>Hair</dt>
          <dd>100% human hair</dd>
        </div>
      </dl>

      <details className="acc">
        <summary>Care</summary>
        <p>Wash in cool water with a sulphate-free shampoo and conditioner. Detangle from the ends up with a wide-tooth comb. Air-dry on a stand and keep heat under 180°C.</p>
      </details>
      <details className="acc">
        <summary>Delivery and returns</summary>
        <p>Lagos dispatch in 1 to 2 working days, nationwide in 2 to 5. Unworn units with the lace uncut can be returned within 7 days. (Sample policy: set your own.)</p>
      </details>
    </div>
  );
}
