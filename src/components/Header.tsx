import { useEffect, useState } from 'react';
import { Link, usePath } from '../lib/router';
import { useCart } from '../store/cart';
import { CURRENCIES, useCurrency, type CurrencyCode } from '../lib/currency';
import { asset } from '../lib/format';
import { BagIcon, CloseIcon, MenuIcon } from './Icons';

const NAV = [
  { to: '/shop', label: 'Shop all' },
  { to: '/shop/new', label: 'New in' },
  { to: '/care', label: 'Wig care' },
  { to: '/faq', label: 'FAQ' },
];

export function Header() {
  const { count, setOpen } = useCart();
  const { code, setCode } = useCurrency();
  const path = usePath();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [path]);

  return (
    <>
      <div className="announce">New in: Body Wave, 22 inch. HD lace, ready to wear.</div>
      <header className="header">
        <div className="header-inner">
          <button className="icon-btn menu-btn" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>
            {menu ? <CloseIcon /> : <MenuIcon />}
          </button>
          <Link to="/" className="logo" aria-label="Velvety Hairs home">
            <img src={asset('images/logo-blush.png')} alt="" width="128" height="63" />
          </Link>
          <nav className={`nav ${menu ? 'is-open' : ''}`} aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className={path === n.to ? 'is-active' : ''}>
                {n.label}
              </Link>
            ))}
          </nav>
          <label className="currency">
            <span className="sr-only">Show prices in</span>
            <select value={code} onChange={(e) => setCode(e.target.value as CurrencyCode)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <button className="icon-btn bag-btn" onClick={() => setOpen(true)} aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}>
            <BagIcon />
            {count > 0 && <span className="bag-count">{count}</span>}
          </button>
        </div>
      </header>
    </>
  );
}
