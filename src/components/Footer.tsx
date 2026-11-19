import { useState, type FormEvent } from 'react';
import { Link } from '../lib/router';
import { asset } from '../lib/format';

export function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: send to your email list provider (Mailchimp, Brevo, Kit...)
    setDone(true);
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={asset('images/logo-blush.png')} alt="Velvety Hairs" width="180" height="88" />
          <p className="footer-tag">Soft to the touch. Hard to forget.</p>
        </div>

        <div className="footer-news">
          <h2 className="footer-title">First look at new drops</h2>
          {done ? (
            <p className="muted" role="status">
              You are on the list. We will only write when something new lands.
            </p>
          ) : (
            <form onSubmit={submit} className="news-form">
              <label htmlFor="news-email" className="sr-only">
                Email address
              </label>
              <input id="news-email" type="email" required placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn btn-primary" type="submit">
                Sign up
              </button>
            </form>
          )}
        </div>

        <nav className="footer-links" aria-label="Footer">
          <Link to="/shop">Shop all</Link>
          <Link to="/care">Wig care</Link>
          <Link to="/faq">FAQ</Link>
          <a href="https://instagram.com/" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </nav>
      </div>
      <p className="footer-small">© {new Date().getFullYear()} Velvety Hairs. Sample products and prices shown.</p>
    </footer>
  );
}
