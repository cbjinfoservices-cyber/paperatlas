import { dict, type Lang } from '@/i18n/dict';

/** La langue qui suit dans le sélecteur : « l'autre langue » d'un relevé
 *  partagé. Le français laisse l'arabe, l'arabe l'anglais, l'anglais le
 *  français — un tour complet, jamais deux fois la même. */
export const NEXT_LANG: Record<Lang, Lang> = { fr: 'ar', ar: 'en', en: 'fr' };

/** Le nom de chaque langue, lu dans la langue affichée : la pastille de copie
 *  dit toujours vers quelle langue elle emporte le relevé. */
export const LANG_NAME_KEY: Record<Lang, string> = {
  fr: 'acct.mine.langNameFr',
  ar: 'acct.mine.langNameAr',
  en: 'acct.mine.langNameEn',
};

/** Les trois langues proposées au choix de la pastille « Copier en … » : une
 *  seule est retenue, et son choix se garde sur l'appareil. */
export const TARGET_LANGS: Lang[] = ['fr', 'ar', 'en'];

/** Une valeur d'origine partagée : son nom tel qu'il s'affiche, et ses deux
 *  comptes, famille par famille. */
export type SharedOriginCopy = { label: string; annonce: number; offre: number };

/** Une clef du dictionnaire, lue dans la langue visée sans changer la page. */
const tr = (lang: Lang, key: string) => dict[lang][key] ?? dict.fr[key] ?? key;

/** Le nom d'une famille, dans la langue visée. */
const familyName = (lang: Lang, kind: 'annonce' | 'offre') => tr(
  lang,
  kind === 'annonce' ? 'acct.mine.rubriqueFamilyAnnonce' : 'acct.mine.rubriqueFamilyOffre',
);

/** Un compte de famille, en mots : « annonces · 2 ». */
const sideText = (lang: Lang, kind: 'annonce' | 'offre', n: number) => tr(
  lang,
  'acct.mine.rubriqueSharedSide',
)
  .replace('{family}', familyName(lang, kind))
  .replace('{n}', String(n));

/** Les deux côtés d'une valeur partagée, dans la langue visée. */
export function sharedSidesLine(lang: Lang, origin: SharedOriginCopy): string {
  return [
    sideText(lang, 'annonce', origin.annonce),
    sideText(lang, 'offre', origin.offre),
  ].join(' / ');
}

/** Une valeur partagée écrite pour un message : la rubrique telle qu'elle
 *  s'affiche, ses deux comptes et leur somme. */
export function sharedCopyLine(lang: Lang, origin: SharedOriginCopy): string {
  return tr(lang, 'acct.mine.rubriqueSharedCopyText')
    .replace('{rub}', origin.label)
    .replace('{parts}', sharedSidesLine(lang, origin))
    .replace('{n}', String(origin.annonce + origin.offre));
}

/** Le relevé groupé : toutes les valeurs partagées d'un coup, une ligne
 *  chacune, dans la langue visée. Les noms de rubriques ne sont jamais
 *  retraduits : ils restent tels qu'ils s'affichent sur la page. */
export function sharedCopyLines(lang: Lang, origins: SharedOriginCopy[]): string {
  return origins.map((origin) => sharedCopyLine(lang, origin)).join('\n');
}

/** Une valeur partagée en abrégé : la rubrique, ses deux comptes et leur
 *  somme sur une seule ligne courte — la brique du relevé compact. */
export function sharedCompactLine(lang: Lang, origin: SharedOriginCopy): string {
  return tr(lang, 'acct.mine.rubriqueSharedCopyCompactLine')
    .replace('{rub}', origin.label)
    .replace('{annonce}', String(origin.annonce))
    .replace('{offre}', String(origin.offre))
    .replace('{n}', String(origin.annonce + origin.offre));
}

/** Le séparateur du relevé compact : la virgule par défaut, le point-virgule
 *  quand le message mêle déjà des virgules, la barre quand la ligne doit se
 *  lire d'un seul trait. Le choix se garde sur l'appareil. */
export type SharedSeparator = ',' | ';' | '|';

/** Les trois séparateurs proposés, dans l'ordre de la pastille. La clé du
 *  dictionnaire nomme chacun, et le signe s'affiche tel quel. */
export const SEPARATORS: { value: SharedSeparator; key: string }[] = [
  { value: ',', key: 'acct.mine.rubriqueSharedSepComma' },
  { value: ';', key: 'acct.mine.rubriqueSharedSepSemi' },
  { value: '|', key: 'acct.mine.rubriqueSharedSepBar' },
];

/** Le séparateur tel qu'il s'écrit entre deux valeurs : une espace de chaque
 *  côté, comme dans la ligne qui part. */
export const sepJoin = (sep: SharedSeparator) => ` ${sep} `;

/** Les limites sous lesquelles l'aperçu mesure la ligne courte : une ligne de
 *  texto, un commentaire, ou un message un peu plus large. Le choix se garde
 *  sur l'appareil, comme le séparateur. */
export type SharedLimit = 140 | 160 | 280;

export const SHARED_LIMITS: SharedLimit[] = [140, 160, 280];

/** La limite retenue par défaut : la plus courante pour un message court. */
export const SHARED_LIMIT_DEFAULT: SharedLimit = 160;

/** Le nombre de valeurs au-delà duquel l’aperçu se replie de lui-même : un
 *  relevé qui s’allonge ne tient plus la ligne du tableau. Le seuil reste
 *  réglable, et se garde sur l’appareil. */
export type SharedFoldAt = 4 | 8 | 12;

export const SHARED_FOLD_ATS: SharedFoldAt[] = [4, 8, 12];

/** Le seuil de repli retenu par défaut : huit valeurs. */
export const SHARED_FOLD_DEFAULT: SharedFoldAt = 8;

/** Le nombre de valeurs gardées à l’écran quand la rangée se replie : le
 *  compte, lui, ne disparaît jamais. */
export const SHARED_LIST_FOLD_AT = 3;

/** Le seuil qui suit dans le défilement : 140, puis 160, puis 280, et l’on
 *  revient à 140. La petite flèche de l’aperçu s’en sert pour faire passer
 *  d’un seuil au suivant d’un seul clic, sans viser un chiffre. */
export function nextSharedLimit(limit: SharedLimit): SharedLimit {
  const at = SHARED_LIMITS.indexOf(limit);
  return SHARED_LIMITS[(at + 1) % SHARED_LIMITS.length] ?? SHARED_LIMIT_DEFAULT;
}

/** Le relevé compact : toutes les valeurs partagées sur une seule ligne,
 *  séparées par le signe choisi — un message court, prêt à coller. */
export function sharedCompactLines(
  lang: Lang,
  origins: SharedOriginCopy[],
  sep: SharedSeparator = ',',
): string {
  return origins.map((origin) => sharedCompactLine(lang, origin)).join(sepJoin(sep));
}

/** Le relevé d'une seule famille : la rubrique, le compte de cette famille
 *  seulement — l'autre côté reste hors du texte. */
export function sharedFamilyLines(
  lang: Lang,
  origins: SharedOriginCopy[],
  kind: 'annonce' | 'offre',
): string {
  return origins
    .map((origin) => tr(lang, 'acct.mine.rubriqueSharedCopyFamilyText')
      .replace('{rub}', origin.label)
      .replace('{family}', familyName(lang, kind))
      .replace('{n}', String(kind === 'annonce' ? origin.annonce : origin.offre)))
    .join('\n');
}