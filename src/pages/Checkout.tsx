import { useMemo, useState, type FormEvent } from 'react';
import { deliveryOptions, getProduct, type DeliveryOption } from '../data/products';
import { COUNTRY_CODES, countriesForSelect, countryName } from '../data/countries';
import { lineTotal, useCart } from '../store/cart';
import { money } from '../lib/format';
import { useCurrency } from '../lib/currency';
import { Link, navigate } from '../lib/router';
import { PAYSTACK_KEY, payWithPaystack, verifyPayment } from '../lib/paystack';
import { saveOrder } from '../lib/orders';
import { ProductImage } from '../components/ProductCard';

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

type Form = {
  name: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  city: string;
  state: string;
  region: string;
  postcode: string;
  notes: string;
};

/** A best guess at the shopper's country from their browser language, e.g. en-GB -> GB. */
function guessCountry() {
  const region = (navigator.languages?.[0] ?? navigator.language ?? '').split('-')[1]?.toUpperCase();
  return region && COUNTRY_CODES.includes(region) ? region : 'NG';
}

const empty = (): Form => ({
  name: '',
  email: '',
  phone: '',
  country: guessCountry(),
  address: '',
  city: '',
  state: 'Lagos',
  region: '',
  postcode: '',
  notes: '',
});

const feeText = (d: DeliveryOption) => (d.arranged ? 'Agreed later' : d.fee ? money(d.fee) : 'Free');

function validate(f: Form, delivery: string) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.name.trim().length < 2) e.name = 'Enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email so we can send your receipt.';
  if (f.phone.replace(/\D/g, '').length < (f.country === 'NG' ? 10 : 7)) e.phone = 'Enter a phone number we can call or WhatsApp.';
  if (delivery !== 'pickup') {
    if (f.address.trim().length < 5) e.address = 'Enter your street address.';
    if (f.city.trim().length < 2) e.city = 'Enter your city or area.';
  }
  return e;
}

export function Checkout() {
  const { lines, subtotal, clear } = useCart();
  const { code: currency, convert } = useCurrency();
  const [form, setForm] = useState<Form>(empty);
  const options = deliveryOptions(form.country);
  const [picked, setDelivery] = useState('');
  // Changing country swaps the delivery list; fall back to its first option.
  const delivery = options.some((d) => d.id === picked) ? picked : options[0].id;
  const countries = useMemo(countriesForSelect, []);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [busy, setBusy] = useState<false | 'paying' | 'confirming'>(false);
  const [payError, setPayError] = useState('');

  const option = options.find((d) => d.id === delivery)!;
  const total = subtotal + option.fee;
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  if (lines.length === 0) {
    return (
      <section className="band band-light page-top">
        <div className="wrap narrow center">
          <h1 className="h1">Your bag is empty.</h1>
          <p className="lede-dark">Add a unit to get started.</p>
          <Link to="/shop" className="btn btn-primary">
            Shop all units
          </Link>
        </div>
      </section>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form, delivery);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setBusy('paying');
    setPayError('');
    const reference = 'VH' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    const address =
      delivery === 'pickup'
        ? ''
        : form.country === 'NG'
          ? `${form.address}, ${form.city}, ${form.state}`
          : [form.address, form.city, form.region, form.postcode, countryName(form.country)].map((x) => x.trim()).filter(Boolean).join(', ');
    let paid = false;
    let test = false;
    if (PAYSTACK_KEY) {
      try {
        const result = await payWithPaystack({
          email: form.email,
          amountNaira: total,
          reference,
          phone: form.phone,
          name: form.name,
          details: {
            items: lines.map((l) => `${getProduct(l.slug)!.name} ${l.length} inch x${l.qty}`).join(', '),
            delivery: option.label,
            address,
            notes: form.notes.trim(),
          },
        });
        if (result !== 'paid') {
          setBusy(false);
          setPayError('Payment was not completed. Your bag is saved, so you can try again.');
          return;
        }
      } catch {
        setBusy(false);
        setPayError('We could not reach the payment provider. Check your connection and try again.');
        return;
      }
      setBusy('confirming');
      try {
        const v = await verifyPayment(reference, lines, delivery, form.country);
        paid = true;
        test = v.test;
      } catch {
        // The customer may have been charged, so give them the reference rather than a dead end.
        setBusy(false);
        setPayError(`We could not confirm your payment yet. If you were charged, message us with reference ${reference} and we will sort it out.`);
        return;
      }
    }
    saveOrder({
      id: reference,
      name: form.name,
      email: form.email,
      delivery: option.label,
      deliveryDetail: option.detail,
      address,
      lines: lines.map((l) => ({ ...l, name: getProduct(l.slug)!.name, total: lineTotal(l) })),
      subtotal,
      fee: option.fee,
      total,
      paid,
      test,
    });
    clear();
    navigate(`/order/${reference}`);
  };

  const field = (k: keyof Form, label: string, props: Record<string, unknown> = {}) => (
    <div className={`field ${errors[k] ? 'has-error' : ''}`}>
      <label htmlFor={`f-${k}`}>{label}</label>
      <input id={`f-${k}`} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `e-${k}` : undefined} {...props} />
      {errors[k] && (
        <p id={`e-${k}`} className="error">
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <section className="band band-light page-top">
      <div className="wrap">
        <h1 className="h1">Checkout</h1>
        <form className="checkout" onSubmit={submit} noValidate>
          <div className="checkout-main">
            <fieldset className="panel">
              <legend className="panel-title">Contact</legend>
              {field('name', 'Full name', { autoComplete: 'name' })}
              <div className="field-row">
                {field('email', 'Email', { type: 'email', autoComplete: 'email', inputMode: 'email' })}
                {field('phone', 'Phone (WhatsApp)', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: form.country === 'NG' ? '080...' : 'With country code, e.g. +44...' })}
              </div>
            </fieldset>

            <fieldset className="panel">
              <legend className="panel-title">Delivery</legend>
              <div className="field">
                <label htmlFor="f-country">Country</label>
                <select id="f-country" value={form.country} onChange={set('country')} autoComplete="country">
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="options">
                {options.map((d) => (
                  <label key={d.id} className={`option ${delivery === d.id ? 'is-active' : ''}`}>
                    <input type="radio" name="delivery" value={d.id} checked={delivery === d.id} onChange={() => setDelivery(d.id)} />
                    <span className="option-text">
                      <span className="option-label">{d.label}</span>
                      <span className="muted small">{d.detail}</span>
                    </span>
                    <span className="option-fee">{feeText(d)}</span>
                  </label>
                ))}
              </div>

              {delivery !== 'pickup' && form.country !== 'NG' && (
                <>
                  {field('address', 'Street address', { autoComplete: 'street-address' })}
                  <div className="field-row">
                    {field('city', 'Town or city', { autoComplete: 'address-level2' })}
                    {field('region', 'State, province or county (optional)', { autoComplete: 'address-level1' })}
                  </div>
                  <div className="field-row">
                    {field('postcode', 'Postcode or ZIP (optional)', { autoComplete: 'postal-code' })}
                  </div>
                </>
              )}

              {delivery !== 'pickup' && form.country === 'NG' && (
                <>
                  {field('address', 'Street address', { autoComplete: 'street-address' })}
                  <div className="field-row">
                    {field('city', 'City or area', { autoComplete: 'address-level2' })}
                    <div className="field">
                      <label htmlFor="f-state">State</label>
                      <select id="f-state" value={form.state} onChange={set('state')} autoComplete="address-level1">
                        {STATES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
              <div className="field">
                <label htmlFor="f-notes">
                  Notes <span className="muted">(optional)</span>
                </label>
                <textarea id="f-notes" rows={3} value={form.notes} onChange={set('notes')} placeholder="Landmark, gate code, or styling requests" />
              </div>
            </fieldset>
          </div>

          <aside className="summary panel" aria-label="Order summary">
            <h2 className="panel-title">Your order</h2>
            <ul className="summary-lines">
              {lines.map((l) => {
                const p = getProduct(l.slug)!;
                return (
                  <li key={l.slug + l.length}>
                    <div className="summary-thumb">
                      <ProductImage product={p} />
                      <span className="thumb-qty">{l.qty}</span>
                    </div>
                    <div className="grow">
                      <div className="line-name">{p.name}</div>
                      <div className="muted small">{l.length} inch</div>
                    </div>
                    <div className="price-sm">{money(lineTotal(l))}</div>
                  </li>
                );
              })}
            </ul>
            <div className="totals">
              <div className="row-between">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="row-between">
                <span>{option.label}</span>
                <span>{feeText(option)}</span>
              </div>
              <div className="row-between total">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
              {currency !== 'NGN' && (
                <p className="muted small fx-note">
                  About {new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(convert(total, currency))}. You pay in naira and your
                  bank sets the exact rate. Rates by{' '}
                  <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">
                    Exchange Rate API
                  </a>
                  .
                </p>
              )}
            </div>
            <p className="sr-only" aria-live="polite">
              {busy === 'confirming' ? 'Confirming your payment' : ''}
            </p>
            {payError && (
              <p className="error" role="alert">
                {payError}
              </p>
            )}
            <button className="btn btn-primary btn-block" type="submit" disabled={!!busy}>
              {busy === 'confirming' ? 'Confirming payment…' : busy ? 'Processing…' : PAYSTACK_KEY ? `Pay ${money(total)}` : `Place order · ${money(total)}`}
            </button>
            <p className="muted small center">
              {PAYSTACK_KEY ? 'Secure payment by Paystack. Cards from any country, bank transfer and USSD.' : 'Demo mode: no payment is taken. Add a Paystack key to go live.'}
            </p>
          </aside>
        </form>
      </div>
    </section>
  );
}
