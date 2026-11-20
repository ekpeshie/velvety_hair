import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { money } from './format';

/*
 * Shoppers can browse in pounds, US dollars or Canadian dollars, but every payment is
 * taken in naira (Paystack cannot charge GBP or CAD for a Nigerian business).
 *
 * - useMoney()  formats a naira price in the shopper's chosen currency, for browsing.
 * - money()     (lib/format) always formats naira: use it for anything that is charged.
 *
 * Rates come from /api/rates (refreshed daily). FALLBACK is used until they arrive or
 * if that fails, so prices always show.
 */

export const CURRENCIES = [
  { code: 'NGN', label: '₦ NGN', name: 'Naira' },
  { code: 'GBP', label: '£ GBP', name: 'British pounds' },
  { code: 'USD', label: '$ USD', name: 'US dollars' },
  { code: 'CAD', label: 'CA$ CAD', name: 'Canadian dollars' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];
type Rates = Record<Exclude<CurrencyCode, 'NGN'>, number>;

/** Rough rates (foreign units per 1 naira) used only until live rates load. */
const FALLBACK: Rates = { GBP: 1 / 2000, USD: 1 / 1500, CAD: 1 / 1100 };

const STORE_KEY = 'velvety-currency';
const RATES_KEY = 'velvety-rates-v1';
const DAY = 24 * 60 * 60 * 1000;

const formatters = new Map<string, Intl.NumberFormat>();
const fmt = (code: string) => {
  if (!formatters.has(code)) formatters.set(code, new Intl.NumberFormat('en', { style: 'currency', currency: code, maximumFractionDigits: 0 }));
  return formatters.get(code)!;
};

function guess(): CurrencyCode {
  if (typeof window === 'undefined') return 'NGN'; // build-time render: prices in naira
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (CURRENCIES.some((c) => c.code === saved)) return saved as CurrencyCode;
  } catch {
    /* storage unavailable */
  }
  const region = (navigator.languages?.[0] ?? navigator.language ?? '').split('-')[1]?.toUpperCase();
  if (region === 'GB') return 'GBP';
  if (region === 'US') return 'USD';
  if (region === 'CA') return 'CAD';
  return 'NGN';
}

function cachedRates(): { rates: Rates; at: number } | null {
  try {
    const c = JSON.parse(localStorage.getItem(RATES_KEY) ?? 'null');
    return c && c.rates && typeof c.at === 'number' ? c : null;
  } catch {
    return null;
  }
}

type CurrencyState = {
  code: CurrencyCode;
  setCode: (c: CurrencyCode) => void;
  /** a naira amount in the chosen currency, e.g. "£92" */
  format: (naira: number) => string;
  /** a naira amount in another currency, rounded to whole units */
  convert: (naira: number, to: CurrencyCode) => number;
};

const CurrencyContext = createContext<CurrencyState | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [code, setCodeState] = useState<CurrencyCode>(guess);
  const [rates, setRates] = useState<Rates>(() => cachedRates()?.rates ?? FALLBACK);

  useEffect(() => {
    const cached = cachedRates();
    if (cached && Date.now() - cached.at < DAY) return;
    fetch('/api/rates')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { rates?: Partial<Rates> } | null) => {
        const r = d?.rates;
        if (!r || !(r.GBP! > 0 && r.USD! > 0 && r.CAD! > 0)) return;
        const next = { GBP: r.GBP!, USD: r.USD!, CAD: r.CAD! };
        setRates(next);
        try {
          localStorage.setItem(RATES_KEY, JSON.stringify({ rates: next, at: Date.now() }));
        } catch {
          /* storage unavailable */
        }
      })
      .catch(() => {
        /* keep the fallback rates */
      });
  }, []);

  const setCode = useCallback((c: CurrencyCode) => {
    setCodeState(c);
    try {
      localStorage.setItem(STORE_KEY, c);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<CurrencyState>(() => {
    const convert = (naira: number, to: CurrencyCode) => (to === 'NGN' ? naira : Math.round(naira * rates[to]));
    return {
      code,
      setCode,
      convert,
      format: (naira) => (code === 'NGN' ? money(naira) : fmt(code).format(convert(naira, code))),
    };
  }, [code, rates, setCode]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be inside CurrencyProvider');
  return ctx;
}

/** Format naira prices in the shopper's currency, for browsing. Charges always use money(). */
export const useMoney = () => useCurrency().format;
