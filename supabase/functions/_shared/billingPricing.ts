export type CurrencyChange = {
  parDinar: number;
  pas: number;
  coef: number;
};

export const CURRENCY_CHANGES: Record<string, CurrencyChange> = {
  DZD: { parDinar: 1, pas: 100, coef: 1 },
  SAR: { parDinar: 0.028, pas: 5, coef: 1 },
  BHD: { parDinar: 0.00281, pas: 1, coef: 1 },
  KMF: { parDinar: 3.4, pas: 100, coef: 0.5 },
  DJF: { parDinar: 1.33, pas: 50, coef: 0.7 },
  EGP: { parDinar: 0.358, pas: 25, coef: 0.45 },
  AED: { parDinar: 0.0274, pas: 5, coef: 1 },
  IQD: { parDinar: 9.78, pas: 500, coef: 0.7 },
  JOD: { parDinar: 0.00529, pas: 1, coef: 1 },
  KWD: { parDinar: 0.00229, pas: 1, coef: 1 },
  LBP: { parDinar: 668, pas: 25000, coef: 0.6 },
  LYD: { parDinar: 0.0362, pas: 1, coef: 1 },
  MAD: { parDinar: 0.0739, pas: 10, coef: 1 },
  MRU: { parDinar: 0.297, pas: 10, coef: 0.5 },
  OMR: { parDinar: 0.00287, pas: 1, coef: 1 },
  QAR: { parDinar: 0.0272, pas: 5, coef: 1 },
  SOS: { parDinar: 4.26, pas: 100, coef: 0.4 },
  SDG: { parDinar: 4.48, pas: 100, coef: 0.4 },
  SYP: { parDinar: 97, pas: 500, coef: 0.35 },
  TND: { parDinar: 0.0235, pas: 5, coef: 0.8 },
  YER: { parDinar: 1.87, pas: 100, coef: 0.35 },
};

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  DZ: 'DZD',
  SA: 'SAR',
  BH: 'BHD',
  KM: 'KMF',
  DJ: 'DJF',
  EG: 'EGP',
  AE: 'AED',
  IQ: 'IQD',
  JO: 'JOD',
  KW: 'KWD',
  LB: 'LBP',
  LY: 'LYD',
  MA: 'MAD',
  MR: 'MRU',
  OM: 'OMR',
  PS: 'JOD',
  QA: 'QAR',
  SO: 'SOS',
  SD: 'SDG',
  SY: 'SYP',
  TN: 'TND',
  YE: 'YER',
};

export const PLAN_AMOUNTS_DZD = {
  mensuel: 1500,
  trimestriel: 4050,
  semestre: 7650,
  annee: 14400,
} as const;

const STRIPE_LOCAL_CURRENCIES = new Set([
  'AED', 'BHD', 'DZD', 'DJF', 'EGP', 'IQD', 'JOD', 'KWD', 'KMF', 'LYD',
  'MAD', 'OMR', 'QAR', 'SAR', 'TND',
]);

// The current PayPal Subscriptions currency reference lists no currencies in
// PaperAtlas's Arab-country price table, so local-currency checkout stays off.
const PAYPAL_LOCAL_CURRENCIES = new Set<string>();

const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF',
  'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
]);

const THREE_DECIMAL_CURRENCIES = new Set(['BHD', 'JOD', 'KWD', 'OMR', 'TND']);

export function currencyForCountry(country: string | null | undefined): string {
  const code = country?.toUpperCase();
  return code ? CURRENCY_BY_COUNTRY[code] ?? '' : 'DZD';
}

export function roundedLocalAmount(amountDzd: number, currency: string): number {
  const change = CURRENCY_CHANGES[currency.toUpperCase()];
  if (!amountDzd || !change) return amountDzd;
  const coefficient = Math.min(1, Math.max(0.35, change.coef));
  const raw = amountDzd * change.parDinar * coefficient;
  return Math.max(change.pas, Math.round(raw / change.pas) * change.pas);
}

export function currencyExponent(currency: string): number {
  const code = currency.toUpperCase();
  if (ZERO_DECIMAL_CURRENCIES.has(code)) return 0;
  if (THREE_DECIMAL_CURRENCIES.has(code)) return 3;
  return 2;
}

export function stripeMinorAmount(amount: number, currency: string): number {
  return Math.round(amount * 10 ** currencyExponent(currency));
}

export function providerSupportsLocalCurrency(provider: 'stripe' | 'paypal', currency: string): boolean {
  const code = currency.toUpperCase();
  return (provider === 'stripe' ? STRIPE_LOCAL_CURRENCIES : PAYPAL_LOCAL_CURRENCIES).has(code);
}
