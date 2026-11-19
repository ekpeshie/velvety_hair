import { Link } from '../lib/router';

const CARE = [
  { title: 'Wash cool, wash gentle', body: 'Every 7 to 10 wears, or sooner if you use a lot of product. Cool water, a sulphate-free shampoo and conditioner. Squeeze the water through; never rub or twist.' },
  { title: 'Detangle from the ends', body: 'Use a wide-tooth comb or your fingers. Start at the ends and work up to the lace in small sections, holding the hair above where you comb.' },
  { title: 'Dry on a stand', body: 'Pat with a microfibre towel, then air-dry on a wig stand so the cap keeps its shape. Curly and wavy units: scrunch in a leave-in and let the pattern set.' },
  { title: 'Keep heat moderate', body: 'Use a heat protectant and stay under 180°C. Heat on wavy textures will loosen the pattern; a wash and air-dry brings it back.' },
  { title: 'Rest it on silk', body: 'Sleep in a silk or satin bonnet, or take the unit off and keep it on a stand. Friction from cotton is what causes tangles.' },
  { title: 'Look after the lace', body: 'Remove adhesive with a proper remover, never by pulling. Clean the lace gently with a soft brush so it stays clear and flat.' },
];

const FAQ = [
  { q: 'Which length should I choose?', a: 'Lengths are measured straight, from the top of the head to the ends. Waves and curls sit shorter than their stated length when worn. If you are between two lengths, pick the longer one: you can always trim.' },
  { q: 'What is the difference between a frontal and a closure?', a: 'A 13×4 frontal has lace across the whole hairline, so you can part it anywhere and wear it pulled back. A 5×5 or 4×4 closure covers a smaller area, is easier to install and is a good first unit.' },
  { q: 'Can I colour or bleach my unit?', a: 'Yes, it is 100% human hair. For big changes like bleaching we recommend a professional colourist, and a deep condition afterwards.' },
  { q: 'How long will my unit last?', a: 'It depends on how often you wear it and how you care for it. Follow our care guide and wear it in rotation to get the longest life from it.' },
  { q: 'Do you install?', a: 'Yes. Send us a message on Instagram to book a slot. (Sample answer: add your booking details here.)' },
  { q: 'Delivery and returns', a: 'Lagos dispatch takes 1 to 2 working days and nationwide courier 2 to 5. Unworn units with the lace uncut can be returned within 7 days. (Sample policy: replace with your own.)' },
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
