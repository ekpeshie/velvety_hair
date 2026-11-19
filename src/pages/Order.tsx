import { getOrder } from '../lib/orders';
import { money } from '../lib/format';
import { Link } from '../lib/router';
import { CheckIcon } from '../components/Icons';

export function OrderConfirmed({ id }: { id: string }) {
  const order = getOrder(id);
  return (
    <section className="band band-light page-top">
      <div className="wrap narrow">
        <div className="confirm-mark" aria-hidden="true">
          <CheckIcon size={28} />
        </div>
        <div className="eyebrow">Order {id}</div>
        <h1 className="h1">{order ? `Thank you, ${order.name.split(' ')[0]}.` : 'Thank you.'}</h1>
        {order ? (
          <>
            <p className="lede-dark">
              {order.paid ? 'Your payment went through.' : 'Your order is in (demo mode, no payment taken).'} A receipt goes to {order.email}.
            </p>
            <div className="panel">
              <ul className="summary-lines plain">
                {order.lines.map((l) => (
                  <li key={l.slug + l.length}>
                    <div className="grow">
                      {l.name}, {l.length} inch <span className="muted">× {l.qty}</span>
                    </div>
                    <div>{money(l.total)}</div>
                  </li>
                ))}
              </ul>
              <div className="totals">
                <div className="row-between">
                  <span>{order.delivery}</span>
                  <span>{order.fee ? money(order.fee) : 'Free'}</span>
                </div>
                <div className="row-between total">
                  <span>Total</span>
                  <span>{money(order.total)}</span>
                </div>
              </div>
              <p className="muted small">
                {order.delivery}: {order.deliveryDetail}
                {order.address && <> · {order.address}</>}
              </p>
            </div>
          </>
        ) : (
          <p className="lede-dark">Your order is confirmed. Check your email for the receipt.</p>
        )}
        <Link to="/shop" className="btn btn-primary">
          Keep shopping
        </Link>
      </div>
    </section>
  );
}
