import { FAQ } from '../data/faq';
import { Link } from '../lib/router';

const CARE = [
  { title: 'Wash cool, wash gentle', body: 'Every 7 to 10 wears, or sooner if you use a lot of product. Cool water, a sulphate-free shampoo and conditioner. Squeeze the water through; never rub or twist.' },
  { title: 'Detangle from the ends', body: 'Use a wide-tooth comb or your fingers. Start at the ends and work up to the lace in small sections, holding the hair above where you comb.' },
  { title: 'Dry on a stand', body: 'Pat with a microfibre towel, then air-dry on a wig stand so the cap keeps its shape. Curly and wavy units: scrunch in a leave-in and let the pattern set.' },
  { title: 'Keep heat moderate', body: 'Use a heat protectant and stay under 180°C. Heat on wavy textures will loosen the pattern; a wash and air-dry brings it back.' },
  { title: 'Rest it on silk', body: 'Sleep in a silk or satin bonnet, or take the unit off and keep it on a stand. Friction from cotton is what causes tangles.' },
  { title: 'Look after the lace', body: 'Remove adhesive with a proper remover, never by pulling. Clean the lace gently with a soft brush so it stays clear and flat.' },
];

export function Care() {
  return (
    <section className="band band-light page-top">
      <div className="wrap">
        <div className="eyebrow">Wig care</div>
        <h1 className="h1">Keep the wave.</h1>
        <p className="lede-dark">Six habits that keep a unit soft, full and tangle-free for longer.</p>
        <ol className="care-list">
          {CARE.map((c, i) => (
            <li key={c.title}>
              <span className="care-num" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h2 className="care-title">{c.title}</h2>
                <p>{c.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link to="/shop" className="btn btn-primary">
          Shop all units
        </Link>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="band band-light page-top">
      <div className="wrap narrow">
        <div className="eyebrow">Help</div>
        <h1 className="h1">Questions, answered.</h1>
        <div className="faq">
          {FAQ.map((f) => (
            <details key={f.q} className="acc">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
