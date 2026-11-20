import { deviseCode } from '@/lib/pays';

/**
 * The currency tokens a price may already carry: the old dinars written « DA »,
 * and every ISO code of the Arab world. A price written in Algeria but read in
 * Egypt must be re-read in Egyptian pounds, not left with the wrong money.
 */
const CODE_TOKENS = /\b(?:DA|DZD|SAR|BHD|KMF|DJF|EGP|AED|IQD|JOD|KWD|LBP|LYD|MAD|MRU|OMR|QAR|SOS|SDG|SYP|TND|YER)\b/gi;
const HAS_TOKEN = /\b(?:DA|DZD|SAR|BHD|KMF|DJF|EGP|AED|IQD|JOD|KWD|LBP|LYD|MAD|MRU|OMR|QAR|SOS|SDG|SYP|TND|YER)\b/i;

/**
 * A price with the money of its country: « 6 800 000 DZD », « 45 EGP / m² »,
 * « 95 000 SAR + primes ». Phrases without a figure — « Sur devis »,
 * « À négocier » — are left exactly as their author wrote them.
 */
export function prixDevise(prix: string | null | undefined, pays?: string | null): string {
  const raw = (prix || '').trim();
  if (!raw) return '';
  const code = deviseCode(pays);
  if (!/\d/.test(raw)) return raw;
  if (HAS_TOKEN.test(raw)) {
    CODE_TOKENS.lastIndex = 0;
    return raw.replace(CODE_TOKENS, code);
  }
  return `${raw} ${code}`;
}

/** The ISO code of the money a price is read in, for structured data. */
export function deviseDuPrix(pays?: string | null): string {
  return deviseCode(pays);
}