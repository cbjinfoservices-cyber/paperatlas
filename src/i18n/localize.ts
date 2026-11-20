import type { Lang } from './dict';

/** A piece of editorial / business content that exists in several languages. */
export type Localized = { fr: string; ar: string; en?: string };

/**
 * Picks the right string for the current language. English content is still
 * being translated market by market, so it falls back to French rather than
 * showing an empty card.
 */
export function localize(value: Localized, lang: Lang | string): string {
  if (lang === 'ar') return value.ar;
  if (lang === 'en') return value.en ?? value.fr;
  return value.fr;
}

/** Short code stamped on documents so a bilingual dossier says which edition it is. */
export function langCode(lang: Lang | string): string {
  if (lang === 'en') return 'EN';
  if (lang === 'ar') return 'AR';
  return 'FR';
}

/** BCP-47 locale used for numbers, distances and dates. */
export function localeFor(lang: Lang | string): string {
  if (lang === 'ar') return 'ar-DZ';
  if (lang === 'en') return 'en-GB';
  return 'fr-DZ';
}