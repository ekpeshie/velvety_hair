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
          {product.badge && <span className={`badge ${product.badge === 'New in' ? 'badge-solid' : 'badge-outline'}`}>{product.badge}</span>}
        </div>
        <div className="card-body">
          <div className="eyebrow">{product.collection}</div>
          <h3 className="card-title">{product.name}</h3>
          <p className="card-spec">
            {product.lace} · {product.density} · {product.colour}
          </p>
          <p className="price">From {money(fromPrice(product))}</p>
        </div>
      </Link>
    </article>
  );
}
