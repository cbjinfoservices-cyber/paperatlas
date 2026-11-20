import type { Lang } from '@/i18n/dict';

/**
 * Les données structurées que Google lit, écrites une fois pour tout le site.
 *
 * Rien n'y est inventé : l'organisation, ses deux noms, ses trois langues et
 * la recherche de l'annuaire sont des faits visibles sur les pages. Une valeur
 * qui ne se lit pas à l'écran n'a pas sa place ici — un balisage qui promet
 * plus que la page ne dit se retourne contre elle.
 */

/** Le signe de la maison : la même image que l'onglet et le partage. */
const LOGO_URL =
  'https://public.readdy.ai/ai/img_res/edited_cd70c41b8e1a93ec1ff2f345b9556bab_a56d7c3c.jpg';

/** L'adresse absolue d'un chemin du site, préfixe de publication compris. */
export function absoluteUrl(path: string): string {
  const base = (typeof __BASE_PATH__ === 'string' ? __BASE_PATH__ : '').replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}${base}${clean}`;
}

/** Un titre porteur de balises — l'accueil en pose — se lit en texte pour un moteur. */
export function plainText(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ORG_TEXT: Record<Lang, string> = {
  fr: 'PaperAtlas réunit les imprimeries, les éditeurs, les façonniers et les libraires des 22 pays arabes : annuaire, demandes de devis, sous-traitance et annonces.',
  ar: 'يجمع PaperAtlas المطابع ودور النشر ووحدات التجهيز والمكتبات في ٢٢ دولة عربية: دليل، طلبات عروض أسعار، مناولة وإعلانات.',
  en: 'PaperAtlas brings together printers, publishers, finishing houses and bookshops across the 22 Arab countries: directory, quote requests, subcontracting and classifieds.',
};

const WEBSITE_NAME: Record<Lang, string> = {
  fr: 'PaperAtlas',
  ar: 'PaperAtlas',
  en: 'PaperAtlas',
};

/** La maison : deux noms, un seul éditeur, trois langues de publication. */
export function organizationLd(lang: Lang) {
  return {
    '@type': 'Organization',
    '@id': `${absoluteUrl('/')}#organisation`,
    name: 'PaperAtlas',
    alternateName: 'Arabe World',
    url: absoluteUrl('/'),
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
    },
    description: ORG_TEXT[lang],
    knowsLanguage: ['fr', 'ar', 'en'],
  };
}

/**
 * Le site lui-même, avec sa recherche : `/annuaire?q=` existe vraiment et
 * répond, la barre de recherche des résultats ne fait pas semblant.
 */
export function websiteLd(lang: Lang) {
  const home = absoluteUrl('/');
  return {
    '@type': 'WebSite',
    '@id': `${home}#site`,
    url: home,
    name: WEBSITE_NAME[lang],
    alternateName: 'Arabe World',
    inLanguage: ['fr', 'ar', 'en'],
    publisher: { '@id': `${home}#organisation` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl('/annuaire')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export type Crumb = {
  name: string;
  /** Le chemin tel qu'il se visite, sans préfixe de publication. */
  path: string;
};

/** Le fil d'Ariane d'une liste : accueil, annuaire, puis le type et le pays lus. */
export function breadcrumbLd(crumbs: Crumb[]) {
  const page = absoluteUrl(crumbs[crumbs.length - 1]?.path ?? '/');
  return {
    '@type': 'BreadcrumbList',
    '@id': `${page}#fil`,
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: plainText(crumb.name),
      item: absoluteUrl(crumb.path),
    })),
  };
}

type CollectionArgs = {
  path: string;
  name: string;
  description: string;
  lang: Lang;
  crumbs: Crumb[];
};

/**
 * La page d'une liste — l'annuaire, entier ou resserré sur un type et un pays.
 *
 * Elle se déclare comme une collection, se rattache au site, et emporte son
 * fil : c'est ce que Google affiche en tête du résultat, et ce qui distingue
 * « Imprimeries en Algérie » de l'annuaire entier.
 */
export function collectionLd({ path, name, description, lang, crumbs }: CollectionArgs) {
  const url = absoluteUrl(path);
  const fil = breadcrumbLd(crumbs);
  return {
    '@type': 'CollectionPage',
    '@id': `${url}#page`,
    url,
    name: plainText(name),
    description: plainText(description),
    inLanguage: lang,
    isPartOf: { '@id': `${absoluteUrl('/')}#site` },
    breadcrumb: { '@id': fil['@id'] },
  };
}