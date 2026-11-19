import { Link } from '../lib/router';

export function NotFound() {
  return (
    <section className="band band-light page-top">
      <div className="wrap narrow center">
        <div className="eyebrow">Not found</div>
        <h1 className="h1">This page has slipped away.</h1>
        <p className="lede-dark">The link may be old, or the unit may have sold out.</p>
        <Link to="/shop" className="btn btn-primary">
          Shop all units
        </Link>
      </div>
    </section>
  );
}
