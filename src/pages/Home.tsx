import { PRODUCTS, TEXTURES } from '../data/products';
import { Link } from '../lib/router';
import { asset } from '../lib/format';
import { ProductCard } from '../components/ProductCard';
import { TextureArt } from '../components/TextureArt';
import { ArrowIcon } from '../components/Icons';
import { HeroStage } from '../components/HeroStage';

const PROMISES = [
  { title: '100% human hair', body: 'Colour it, curl it, straighten it. It behaves like your own because it is real hair.' },
  { title: 'HD lace that melts', body: 'A fine, skin-toned lace that disappears on deep and warm skin.' },
  { title: 'Ready to wear', body: 'Pre-plucked hairline and bleached knots, so it is install-ready out of the box.' },
];

export function Home() {
  const featured = PRODUCTS.filter((p) => p.featured);
  return (
    <>
      <HeroStage />

      <section className="band band-light" aria-labelledby="textures-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Find your texture</div>
              <h2 id="textures-title" className="h2">Shop by texture</h2>
            </div>
            <Link to="/shop" className="link-arrow">
              Shop all <ArrowIcon size={18} />
            </Link>
          </div>
          <div className="texture-row scroll-x">
            {TEXTURES.map((t) => (
              <Link key={t.id} to={`/shop/${t.id}`} className="texture-tile">
                <div className="texture-media">
                  <TextureArt texture={t.id} label="" />
                </div>
                <div className="texture-name">{t.label}</div>
                <div className="muted small">{t.note}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-light band-tight-top" aria-labelledby="featured-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Loved right now</div>
              <h2 id="featured-title" className="h2">The edit</h2>
            </div>
          </div>
          <div className="grid-products">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="band band-cocoa" aria-labelledby="promise-title">
        <div className="wrap promise">
          <div>
            <div className="eyebrow accent">Soft power</div>
            <h2 id="promise-title" className="display-md">
              The hair does the talking.
            </h2>
          </div>
          <ul className="promise-list">
            {PROMISES.map((p) => (
              <li key={p.title}>
                <h3 className="promise-title">{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band-dark lookbook" aria-label="Lookbook">
        <div className="lookbook-media">
          <img src={asset('images/face-wide.jpg')} alt="Close portrait showing the lace hairline and soft waves" loading="lazy" />
        </div>
        <div className="wrap lookbook-copy">
          <p className="display-md">Soft to the touch. Hard to forget.</p>
          <Link to="/care" className="btn btn-ghost">
            How to keep the wave
          </Link>
        </div>
      </section>
    </>
  );
}
