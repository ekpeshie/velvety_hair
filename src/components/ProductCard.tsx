import { useState } from 'react';
import { type Product, fromPrice } from '../data/products';
import { useCart } from '../store/cart';
import { CheckIcon, PlusIcon } from './Icons';
import { Link } from '../lib/router';
import { asset } from '../lib/format';
import { useMoney } from '../lib/currency';
import { TextureArt } from './TextureArt';

export function ProductImage({ product, eager }: { product: Product; eager?: boolean }) {
  return product.image ? (
    <img
      src={asset(product.image)}
      alt={`${product.name} unit, ${product.colour.toLowerCase()}`}
      style={{ objectPosition: product.imagePosition ?? 'center' }}
      loading={eager ? 'eager' : 'lazy'}
    />
  ) : (
    <TextureArt texture={product.texture} ground={product.artGround} label={`${product.name} texture artwork`} />
  );
}

export function ProductCard({ product }: { product: Product }) {
  const money = useMoney();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const length = product.defaultLength;

  const quickAdd = () => {
    add(product.slug, length, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="card">
      <Link to={`/product/${product.slug}`} className="card-link" aria-label={`${product.name}, from ${money(fromPrice(product))}`}>
        <div className="card-media">
          <ProductImage product={product} />
        </div>
        <div className="card-body">
          <h3 className="card-title">{product.name}</h3>
          <p className="price">From {money(fromPrice(product))}</p>
          {product.badge && (
            <div className="tags">
              <span className="tag">{product.badge}</span>
            </div>
          )}
        </div>
      </Link>
      {/* sits over the photo; shows on hover or focus, always on touch screens */}
      <div className="card-add-wrap">
        <button type="button" className={`card-add ${added ? 'is-added' : ''}`} onClick={quickAdd} aria-label={`Add ${product.name}, ${length} inch, to bag`}>
          <span className="card-add-text">{added ? 'Added' : `Add to bag · ${length}″`}</span>
          {added ? <CheckIcon size={20} /> : <PlusIcon size={20} />}
        </button>
        <span className="sr-only" aria-live="polite">
          {added ? `${product.name} added to your bag` : ''}
        </span>
      </div>
    </article>
  );
}
