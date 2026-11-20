import type { Lang } from './dict';

export const LANG_KEY = 'paperatlas-lang';
export const LANGS: Lang[] = ['fr', 'ar', 'en'];

export function isLang(value: string | null | undefined): value is Lang {
  return value === 'fr' || value === 'ar' || value === 'en';
}

/** The language the visitor left with last time. Storage can be blocked, so it never throws. */
export function readStoredLang(): Lang | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    return isLang(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function storeLang(lang: Lang) {
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* private mode: the choice then only lasts for this visit */
  }
}

/** A shared link carries ?lang=xx, so a colleague lands in the language it was sent in. */
export function langFromUrl(): Lang | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('lang');
    return isLang(fromQuery) ? fromQuery : null;
  } catch {
    return null;
  }
}

/**
 * Whether the browser itself asks for Arabic.
 *
 * A visitor whose browser is set to Arabic should not land on a French page
 * they cannot read: the site therefore opens in Arabic, right-to-left, on the
 * first visit. Everything else keeps French as its entry point — this is an
 * Algerian directory, French is its usual language.
 *
 * The preference list is read in order: the first language the visitor really
 * speaks decides. A browser set to « ar-DZ, fr-FR » gets Arabic, while
 * « en-GB, ar » gets French — the language put first is the one that counts,
 * not the last fallback in the list.
 */
function browserWantsArabic(): boolean {
  if (typeof navigator === 'undefined') return false;
  const list =
    Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];
  for (const tag of list) {
    if (!tag) continue;
    /* « ar », « ar-DZ », « ar-MA » : the region does not matter, the language does. */
    const base = tag.toLowerCase().split('-')[0];
    if (base === 'ar') return true;
    /* A readable first choice closes the question: this visitor reads French
       or English, so French stays — later entries must not override it. */
    if (base === 'fr' || base === 'en') return false;
  }
  return false;
}

/**
 * Shared link first, then the remembered choice, then what the browser asks for
 * — Arabic for an Arabic-speaking visitor, French for everybody else.
 */
export function resolveLang(): Lang {
  return langFromUrl() ?? readStoredLang() ?? (browserWantsArabic() ? 'ar' : 'fr');
}

/**
 * Applies lang + dir on <html>. Called before React mounts so a returning visitor
 * gets the Arabic layout straight away instead of a French flash.
 */
export function applyDocumentLang(lang: Lang) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
}