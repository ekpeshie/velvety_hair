/*
 * Countries we can ship to, as ISO codes. Names come from the browser (Intl.DisplayNames),
 * so there is no long list of names to maintain.
 */
export const COUNTRY_CODES: readonly string[] = (
  'AD AE AG AI AL AM AO AR AT AU AW AZ BA BB BD BE BF BG BH BI BJ BM BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CV CY CZ ' +
  'DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IS IT JM JO JP KE KG ' +
  'KH KM KN KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MK ML MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NZ OM ' +
  'PA PE PG PH PK PL PR PT PY QA RO RS RW SA SC SE SG SI SK SL SM SN SR ST SV SZ TD TG TH TJ TL TN TO TR TT TW TZ UA UG US UY UZ VA VC ' +
  'VE VN VU WS ZA ZM ZW'
).split(' ');

let names: Intl.DisplayNames | null = null;
export function countryName(code: string) {
  try {
    names ??= new Intl.DisplayNames(['en'], { type: 'region' });
    return names.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Nigeria first, then the rest by name. */
export const countriesForSelect = () => [
  { code: 'NG', name: countryName('NG') },
  ...COUNTRY_CODES.filter((c) => c !== 'NG')
    .map((code) => ({ code, name: countryName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name)),
];
