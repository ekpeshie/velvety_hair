import { type Product, fromPrice } from '../data/products';
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
    </article>
  );
}
