import { useEffect } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { seoMeta, type SeoPage } from '@/i18n/seo';
import type { Lang } from '@/i18n/dict';

const ALT_LANGS: Lang[] = ['fr', 'ar', 'en'];

/**
 * Arabic is written once but read from Algiers to Casablanca: the same address
 * serves every Arabic-speaking search, so it is declared under the Maghreb
 * regions as well as the bare language. Search engines then answer an Arabic
 * query with this page instead of falling back on the French entry.
 */
const AR_VARIANTS = ['ar-DZ', 'ar-MA', 'ar-TN'];

const OG_LOCALE: Record<Lang, string> = {
  fr: 'fr_DZ',
  ar: 'ar_DZ',
  en: 'en_GB',
};

/**
 * L'image de partage, la même que celle de l'onglet de départ : une photo
 * d'atelier qui dit le métier mieux qu'un logo. Une page peut la remplacer
 * quand elle en a une plus juste — la fiche d'un atelier, celle d'une annonce.
 */
const OG_IMAGE =
  'https://readdy.ai/api/search-image?query=Sunlit%20letterpress%20workshop%20interior%20with%20a%20printer%20in%20a%20work%20apron%20examining%20freshly%20bound%20hardcover%20books%20on%20a%20wooden%20worktable%2C%20stacks%20of%20printed%20sheets%20and%20offset%20presses%20in%20the%20warm%20background%2C%20soft%20golden%20window%20light%2C%20muted%20earth%20tones%2C%20editorial%20documentary%20photography%20with%20shallow%20depth%20of%20field&width=1920&height=1080&seq=paperatlas-hero-press-hall&orientation=landscape';

type SeoProps = {
  page: SeoPage;
  /** Route path, without the deployment base — e.g. "/annuaire". */
  path: string;
  title?: string;
  description?: string;
  keywords?: string;
  /** L'image du partage, quand la page en porte une plus juste que celle du site. */
  image?: string;
};

function upsertMeta(key: string, attr: 'name' | 'property', content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertAlternate(hreflang: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${hreflang}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Writes the language-specific head for the current page: title, description,
 * Open Graph tags, canonical URL and one hreflang alternate per language.
 * Each page owns its entry, so switching language rewrites — never duplicates —
 * the same tags.
 */
export function useSeo({ page, path, title, description, keywords, image }: SeoProps) {
  const { lang } = useLang();

  useEffect(() => {
    const entry = seoMeta[page][lang];
    const finalTitle = title || entry.title;
    const finalDescription = description || entry.description;
    const finalKeywords = keywords || entry.keywords;

    const base = __BASE_PATH__.replace(/\/$/, '');
    const clean = path.startsWith('/') ? path : `/${path}`;
    const url = `${window.location.origin}${base}${clean}`;

    document.title = finalTitle;
    upsertMeta('description', 'name', finalDescription);
    upsertMeta('keywords', 'name', finalKeywords);
    upsertMeta('og:title', 'property', finalTitle);
    upsertMeta('og:description', 'property', finalDescription);
    upsertMeta('og:url', 'property', url);
    upsertMeta('og:locale', 'property', OG_LOCALE[lang]);
    upsertMeta('og:type', 'property', 'website');
    upsertMeta('og:site_name', 'property', 'PaperAtlas');
    upsertMeta('og:image', 'property', image || OG_IMAGE);
    upsertMeta('og:image:alt', 'property', finalTitle);
    upsertMeta('twitter:card', 'name', 'summary_large_image');
    upsertMeta('twitter:title', 'name', finalTitle);
    upsertMeta('twitter:description', 'name', finalDescription);
    upsertMeta('twitter:image', 'name', image || OG_IMAGE);
    upsertMeta('twitter:image:alt', 'name', finalTitle);

    upsertCanonical(url);
    ALT_LANGS.forEach((code) => {
      upsertAlternate(code, `${url}?lang=${code}`);
    });
    /* The Arabic variants all point at the very same Arabic page: one text, read
       by every Arabic-speaking visitor, never a second copy to maintain. */
    AR_VARIANTS.forEach((code) => {
      upsertAlternate(code, `${url}?lang=ar`);
    });
    upsertAlternate('x-default', url);
  }, [page, path, title, description, keywords, image, lang]);
}