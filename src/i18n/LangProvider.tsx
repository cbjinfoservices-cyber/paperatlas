import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { dict, type Lang } from './dict';
import { LANGS, applyDocumentLang, resolveLang, storeLang } from './storedLang';

type LangCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (k: string) => string;
  dir: 'ltr' | 'rtl';
};

const LangContext = createContext<LangCtx>({
  lang: 'fr',
  setLang: () => {},
  toggle: () => {},
  t: (k) => dict.fr[k] ?? k,
  dir: 'ltr',
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => resolveLang());

  useEffect(() => {
    applyDocumentLang(lang);
    // The choice is remembered for the next visit, so Arabic comes back on its own.
    storeLang(lang);
  }, [lang]);

  /** Switching language also refreshes ?lang in the address bar, so every copy keeps it. */
  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    storeLang(next);
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('lang') === next) return;
      url.searchParams.set('lang', next);
      window.history.replaceState(window.history.state, '', url.toString());
    } catch {
      /* the address bar is not essential to the switch */
    }
  }, []);

  const value = useMemo<LangCtx>(() => ({
    lang,
    setLang,
    toggle: () => setLang(lang === 'fr' ? 'ar' : lang === 'ar' ? 'en' : 'fr'),
    t: (k: string) => dict[lang][k] ?? dict.fr[k] ?? k,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
  }), [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** Languages exposed to search engines as alternates. */
export const LANGS_ALL = LANGS;

export function LangSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`lang-switch${compact ? ' is-compact' : ''}`} role="group" aria-label="Langue / اللغة / Language">
      <button type="button" className={lang === 'fr' ? 'is-on' : ''} onClick={() => setLang('fr')} aria-pressed={lang === 'fr'}>FR</button>
      <button type="button" className={lang === 'ar' ? 'is-on' : ''} onClick={() => setLang('ar')} aria-pressed={lang === 'ar'}>ع</button>
      <button type="button" className={lang === 'en' ? 'is-on' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button>
    </div>
  );
}