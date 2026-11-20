import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '@/i18n/dict';
import type { ListingKind, ListingStatut } from '@/lib/listings';
import type {
  SharedFoldAt, SharedLimit, SharedSeparator,
} from '@/pages/compte/components/mineSharedCopy';
import {
  SHARED_FOLD_ATS, SHARED_FOLD_DEFAULT, SHARED_LIMIT_DEFAULT, SHARED_LIMITS,
} from '@/pages/compte/components/mineSharedCopy';

export type MineSort = 'new' | 'old' | 'updated' | 'pays' | 'unread';
/** L'ordre des pastilles du jeton de rubriques : par temps passé dehors, ou
 *  par dépôts. Le choix se garde sur l'appareil, comme les autres réglages
 *  de la ligne. */
export type MineAsideSort = 'ago' | 'n';
export type MineStatus = 'all' | ListingStatut;
/**
 * The window a deposit was posted in: everything, this month, this quarter,
 * and the two closed periods just before them — so a finished month or quarter
 * can be read back on its own.
 */
export type MinePeriod = 'all' | 'month' | 'quarter' | 'prevMonth' | 'prevQuarter';

/** What the owner picked on one tab: state filter, search, wilaya and sort. */
export type MineFilters = {
  status: MineStatus;
  query: string;
  wilaya: string;
  /** Country of the deposits, empty when every country is shown. */
  pays: string;
  sort: MineSort;
  /** The posting window: all history, this month or this quarter. */
  period: MinePeriod;
  /** Show only the deposits that expect the owner (refused, or stuck in review). */
  attention: boolean;
  /** Show only the deposits still needing action after more than a week. */
  stale: boolean;
  /** La rubrique retenue : la liste se resserre sur une seule valeur, et le
   *  choix se garde d'une visite à l'autre comme le tri et les autres filtres. */
  rubrique: string;
  /** Le resserrement sur les autres rubriques d'origine : la valeur qu'on
   *  écarte est gardée ici, et seuls les dépôts hors type d'une autre valeur
   *  restent à l'écran. Vide, la liste garde son étendue. */
  originsRest: string;
  /** D'où ce resserrement a été ouvert : depuis une porte de famille du
   *  rappel hors type, ou depuis la ligne « après la série ». Le repère sous
   *  cette ligne s'en souvient d'une visite à l'autre. */
  originsRestFrom: '' | 'family' | 'end';
};

export type MineMemory = {
  tab: ListingKind;
  byTab: Record<ListingKind, MineFilters>;
  /**
   * Le dernier effacement des rubriques retenues, famille par famille : la
   * gomme laisse un rappel, et ce rappel survit à la visite comme la rubrique
   * elle-même — on retrouve la porte de remise en place en revenant.
   */
  lastErase: MineErase | null;
  /**
   * L'effacement qu'on vient d'oublier, gardé de côté : un oubli se défait
   * d'un clic, et le rappel revient avec sa croix — sans rien remettre à
   * l'écran. Il se garde sur l'appareil comme le rappel lui-même.
   */
  forgottenErase: MineErase | null;
  /** Le compte des fois où l'oubli du dernier effacement a été défait, et le
   *  jour du dernier geste — gardés sur l'appareil, comme le rappel. */
  undoCount: number;
  undoLastAt: string;
  /** Combien de temps le dernier oubli est resté oublié avant d'être défait :
   *  le compte le dit à côté du jour du geste, dans la même écriture. */
  undoLastForgotMs: number;
  /** Les derniers oublis défaits, du plus récent au plus ancien : leur durée
   *  dit si l'annulation traîne, geste après geste. Chacun garde aussi les
   *  rubriques que l'effacement retirait alors — la porte du compte de l'oubli
   *  rouvre ainsi la valeur dont le geste tire la série. */
  undoHeld: MineUndoHeld[];
  /** Les valeurs partagées déjà emportées par la pastille de copie, langue par
   *  langue : la pastille dit combien de relevés sont déjà partis de ce côté,
   *  et le compte se garde sur l'appareil. */
  sharedCopied: Record<Lang, number>;
  /** Le séparateur du relevé compact : la virgule, le point-virgule ou la
   *  barre. Le choix se garde sur l'appareil, comme la langue et les filtres. */
  sharedSep: SharedSeparator;
  /** Combien de fois la ligne courte est déjà partie de cet appareil : le
   *  compte se lit sur la pastille compacte, et se garde d'une visite à
   *  l'autre comme les autres traces du tableau. */
  sharedCompactCopies: number;
  /** La langue vers laquelle la pastille de copie emporte le relevé. Vide,
   *  elle suit le sélecteur de la page ; un choix explicite la fige, et se
   *  garde sur l'appareil. */
  sharedTarget: Lang | '';
  /** La limite sous laquelle l'aperçu mesure la ligne courte : 140, 160 ou
   *  280 caractères. Le choix se garde sur l'appareil, comme le séparateur. */
  sharedLimit: SharedLimit;
  /** La limite sous laquelle la ligne courte est partie la dernière fois :
   *  gardée avec le compte des copies, elle rentre avec lui et repart avec
   *  lui — on sait toujours sous quel seuil la dernière ligne a été mesurée. */
  sharedCompactLimit: SharedLimit | null;
  /** Le dernier séparateur réellement parti avec la ligne courte, et le jour
   *  de cet envoi : le récapitulatif le cite, pour comparer deux envois sans
   *  se fier à sa mémoire. */
  sharedSepLast: SharedSeparator | null;
  sharedSepLastAt: string;
  /** La longueur que faisait la ligne courte au moment de ce dernier envoi :
   *  gardée avec le signe et le jour, elle dit ce que la phrase mesurait
   *  alors — deux envois se comparent par leur signe et par leur taille. */
  sharedSepLastChars: number;
  /** Combien de fois le récapitulatif sous le relevé est déjà parti : le
   *  compte se garde avec ceux de la ligne, d'une visite à l'autre, et se
   *  lit à côté de sa porte de copie. */
  sharedRecapCopies: number;
  /** Le nombre de valeurs au-delà duquel l'aperçu se replie de lui-même :
   *  le relevé s'allonge, la ligne du tableau ne suit pas — le seuil reste
   *  réglable (4, 8 ou 12 valeurs) et se garde sur l'appareil. */
  sharedFoldAt: SharedFoldAt;
  /** Le repli manuel de l’aperçu : tranché à la main, il se garde sur
   *  l’appareil comme celui de la rangée — l’aperçu se rouvre comme on l’a
   *  laissé. Vide, il suit le nombre de valeurs. */
  sharedPreviewFolded: boolean | null;
  /** La rangée des valeurs partagées est-elle repliée ? Le choix se garde
   *  sur l'appareil : la rangée se rouvre comme on l'a laissée, d'une visite
   *  à l'autre, comme les autres choix de la ligne. */
  sharedListFolded: boolean;
  /** Les valeurs que la rangée repliée tient hors de l'écran, chacune avec le
   *  jour où elle en est sortie : la porte hors écran dit combien de temps
   *  chacune est restée dehors, valeur par valeur. Une valeur revenue à
   *  l'écran s'oublie, sans laisser de trace. */
  sharedAsideSince: Record<string, string>;
  /** L'ordre des pastilles des rubriques laissées de côté : par temps passé
   *  dehors, ou par dépôts. Le choix se garde sur l'appareil, comme les
   *  autres réglages de la ligne. */
  asideLeftSort: MineAsideSort;
  /** Combien de fois la petite gomme des replis a servi, et le jour du
   *  dernier geste : le compte se lit à côté d'elle, et se garde sur
   *  l'appareil comme les autres comptes de la ligne. */
  foldsErasedCount: number;
  foldsErasedLastAt: string;
  /** Les mêmes comptes pour les trois autres gommes de la ligne : celle de
   *  la copie en "autre langue", celle de la ligne courte et celle du
   *  récapitulatif. Chacune garde son usage et son jour, sur l'appareil —
   *  toutes les gommes se lisent d'un même geste. */
  otherErasedCount: number;
  otherErasedLastAt: string;
  compactErasedCount: number;
  compactErasedLastAt: string;
  recapErasedCount: number;
  recapErasedLastAt: string;
  /** Ce que chaque gomme a effacé la dernière fois, famille de valeurs par
   *  famille : ses comptes d'annonces et d'offres, lus à côté de son usage. */
  foldsErasedTrace: MineEraseTrace | null;
  otherErasedTrace: MineEraseTrace | null;
  compactErasedTrace: MineEraseTrace | null;
  recapErasedTrace: MineEraseTrace | null;
  /** Combien de fois la petite porte de chaque gomme a été ouverte : le
   *  compte se lit à côté de son usage et de son jour, gomme par gomme, et
   *  se garde sur l'appareil comme les autres comptes de la ligne. */
  eraseDoorOpens: Record<string, number>;
};

/** Ce qu'une gomme a effacé la dernière fois, famille de valeurs par famille :
 *  les annonces et les offres que le geste a rendues ou retirées du compte. */
export type MineEraseTrace = { annonce: number; offre: number };

/** Un geste d'oubli défait : sa durée, et les rubriques que l'effacement
 *  retirait quand il a été annulé. Une valeur vide ne se devine pas : le geste
 *  qui n'a pas laissé de nom garde une rubrique vide. */
export type MineUndoHeld = { ms: number; annonce: string; offre: string };

/** Les rubriques que la gomme vient d'effacer, une valeur par famille, et le
 *  jour du geste — le rappel le cite comme le compte de l'oubli. Le jour de
 *  l'oubli s'y ajoute : le rappel rétabli dit combien de temps il a tenu. */
export type MineErase = { annonce: string; offre: string; at?: string; forgotAt?: string };

const KEY = 'paperatlas:mine-memory';

const SORTS: MineSort[] = ['new', 'old', 'updated', 'pays', 'unread'];
const STATUSES: MineStatus[] = ['all', 'en_attente', 'publie', 'refuse'];
const PERIODS: MinePeriod[] = ['all', 'month', 'quarter', 'prevMonth', 'prevQuarter'];
const LANGS: Lang[] = ['fr', 'ar', 'en'];
const SEPS: SharedSeparator[] = [',', ';', '|'];

/** Les valeurs déjà emportées, relues langue par langue sans deviner. */
function readCopied(value: unknown): Record<Lang, number> {
  const back: Record<Lang, number> = { fr: 0, ar: 0, en: 0 };
  if (!value || typeof value !== 'object') return back;
  const record = value as Record<string, unknown>;
  LANGS.forEach((code) => {
    const n = record[code];
    if (typeof n === 'number' && Number.isFinite(n) && n > 0) back[code] = Math.floor(n);
  });
  return back;
}
/** Les ouvertures de porte déjà comptées, relues sans jamais deviner :
 *  seuls les comptes entiers et positifs restent, gomme par gomme. */
function readOpens(value: unknown): Record<string, number> {
  const back: Record<string, number> = {};
  if (!value || typeof value !== 'object') return back;
  Object.entries(value as Record<string, unknown>).forEach(([key, count]) => {
    const name = key.trim();
    if (!name) return;
    if (typeof count === 'number' && Number.isFinite(count) && count > 0) {
      back[name] = Math.floor(count);
    }
  });
  return back;
}

/** Les valeurs restées hors de la rangée, chacune avec le jour où elle en
 *  est sortie : relues sans jamais deviner, seules les dates écrites restent. */
function readAsideSince(value: unknown): Record<string, string> {
  const back: Record<string, string> = {};
  if (!value || typeof value !== 'object') return back;
  Object.entries(value as Record<string, unknown>).forEach(([key, at]) => {
    const name = key.trim();
    if (name && typeof at === 'string' && at) back[name] = at;
  });
  return back;
}

const KINDS: ListingKind[] = ['annonce', 'offre'];

export const DEFAULT_FILTERS: MineFilters = {
  status: 'all', query: '', wilaya: '', pays: '', sort: 'new', period: 'all',
  attention: false, stale: false, rubrique: '', originsRest: '', originsRestFrom: '',
};

const emptyMemory = (): MineMemory => ({
  tab: 'annonce',
  byTab: { annonce: { ...DEFAULT_FILTERS }, offre: { ...DEFAULT_FILTERS } },
  lastErase: null,
  forgottenErase: null,
  undoCount: 0,
  undoLastAt: '',
  undoLastForgotMs: 0,
  undoHeld: [],
  sharedCopied: { fr: 0, ar: 0, en: 0 },
  sharedSep: ',',
  sharedCompactCopies: 0,
  sharedTarget: '',
  sharedLimit: SHARED_LIMIT_DEFAULT,
  sharedCompactLimit: null,
  sharedSepLast: null,
  sharedSepLastAt: '',
  sharedSepLastChars: 0,
  sharedRecapCopies: 0,
  sharedFoldAt: SHARED_FOLD_DEFAULT,
  sharedPreviewFolded: null,
  sharedListFolded: false,
  sharedAsideSince: {},
  asideLeftSort: 'ago',
  foldsErasedCount: 0,
  foldsErasedLastAt: '',
  otherErasedCount: 0,
  otherErasedLastAt: '',
  compactErasedCount: 0,
  compactErasedLastAt: '',
  recapErasedCount: 0,
  recapErasedLastAt: '',
  foldsErasedTrace: null,
  otherErasedTrace: null,
  compactErasedTrace: null,
  recapErasedTrace: null,
  eraseDoorOpens: {},
});

const storageKey = (userId: string) => `${KEY}:${userId}`;

function readFilters(value: unknown): MineFilters {
  if (!value || typeof value !== 'object') return { ...DEFAULT_FILTERS };
  const record = value as Record<string, unknown>;
  return {
    sort: SORTS.includes(record.sort as MineSort) ? (record.sort as MineSort) : 'new',
    status: STATUSES.includes(record.status as MineStatus) ? (record.status as MineStatus) : 'all',
    query: typeof record.query === 'string' ? record.query : '',
    wilaya: typeof record.wilaya === 'string' ? record.wilaya : '',
    pays: typeof record.pays === 'string' ? record.pays : '',
    period: PERIODS.includes(record.period as MinePeriod)
      ? (record.period as MinePeriod)
      : 'all',
    attention: record.attention === true,
    stale: record.stale === true,
    rubrique: typeof record.rubrique === 'string' ? record.rubrique : '',
    originsRest: typeof record.originsRest === 'string' ? record.originsRest : '',
    originsRestFrom: record.originsRestFrom === 'family' || record.originsRestFrom === 'end'
      ? (record.originsRestFrom as 'family' | 'end')
      : '',
  };
}

function isDefault(memory: MineMemory): boolean {
  if (memory.lastErase || memory.forgottenErase) return false;
  if (memory.undoCount > 0 || memory.undoLastAt || memory.undoLastForgotMs > 0) return false;
  if (memory.undoHeld.length > 0) return false;
  if (LANGS.some((code) => memory.sharedCopied[code] > 0)) return false;
  if (memory.sharedSep !== ',') return false;
  if (memory.sharedCompactCopies > 0) return false;
  if (memory.sharedTarget) return false;
  if (memory.sharedLimit !== SHARED_LIMIT_DEFAULT) return false;
  if (memory.sharedCompactLimit !== null) return false;
  if (memory.sharedSepLast !== null || memory.sharedSepLastAt) return false;
  if (memory.sharedSepLastChars > 0) return false;
  if (memory.sharedRecapCopies > 0) return false;
  if (memory.sharedFoldAt !== SHARED_FOLD_DEFAULT) return false;
  if (memory.sharedPreviewFolded !== null) return false;
  if (memory.sharedListFolded) return false;
  if (Object.keys(memory.sharedAsideSince).length > 0) return false;
  if (memory.asideLeftSort !== 'ago') return false;
  if (memory.foldsErasedCount > 0 || memory.foldsErasedLastAt) return false;
  if (memory.otherErasedCount > 0 || memory.otherErasedLastAt) return false;
  if (memory.compactErasedCount > 0 || memory.compactErasedLastAt) return false;
  if (memory.recapErasedCount > 0 || memory.recapErasedLastAt) return false;
  if (memory.foldsErasedTrace || memory.otherErasedTrace) return false;
  if (memory.compactErasedTrace || memory.recapErasedTrace) return false;
  if (Object.keys(memory.eraseDoorOpens).length > 0) return false;
  if (memory.tab !== 'annonce') return false;
  return KINDS.every((kind) => {
    const filters = memory.byTab[kind];
    return filters.status === 'all' && !filters.query && !filters.wilaya && !filters.pays
      && filters.period === 'all' && !filters.attention && !filters.stale && filters.sort === 'new'
      && !filters.rubrique && !filters.originsRest && !filters.originsRestFrom;
  });
}

/** Ce qu'une gomme a effacé la dernière fois, relu sans jamais deviner :
 *  seuls les comptes réels et positifs restent, famille par famille. */
function readEraseTrace(value: unknown): MineEraseTrace | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const whole = (raw: unknown) => (typeof raw === 'number'
    && Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0);
  const annonce = whole(record.annonce);
  const offre = whole(record.offre);
  return annonce > 0 || offre > 0 ? { annonce, offre } : null;
}

/** Ce qu'une gomme vient d'effacer, mis en forme avant d'être gardé : deux
 *  comptes entiers, famille par famille — ou rien du tout. */
function cleanEraseTrace(trace: MineEraseTrace | null): MineEraseTrace | null {
  if (!trace) return null;
  const annonce = trace.annonce > 0 ? Math.floor(trace.annonce) : 0;
  const offre = trace.offre > 0 ? Math.floor(trace.offre) : 0;
  return annonce > 0 || offre > 0 ? { annonce, offre } : null;
}

/** Le dernier effacement gardé, relu sans jamais deviner une valeur absente. */
function readErase(value: unknown): MineErase | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const annonce = typeof record.annonce === 'string' ? record.annonce : '';
  const offre = typeof record.offre === 'string' ? record.offre : '';
  if (!annonce.trim() && !offre.trim()) return null;
  const at = typeof record.at === 'string' ? record.at : '';
  const forgotAt = typeof record.forgotAt === 'string' ? record.forgotAt : '';
  return { annonce, offre, at, forgotAt };
}

/** Last view of the owner's board, so the account reopens where they left it. */
export function readMineMemory(userId: string): MineMemory {
  const fallback = emptyMemory();
  if (!userId || typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;
    const record = parsed as Record<string, unknown>;
    const byTab = (record.byTab ?? {}) as Record<string, unknown>;
    return {
      tab: KINDS.includes(record.tab as ListingKind) ? (record.tab as ListingKind) : 'annonce',
      byTab: { annonce: readFilters(byTab.annonce), offre: readFilters(byTab.offre) },
      lastErase: readErase(record.lastErase),
      forgottenErase: readErase(record.forgottenErase),
      undoCount: typeof record.undoCount === 'number' && Number.isFinite(record.undoCount) && record.undoCount > 0
        ? Math.floor(record.undoCount)
        : 0,
      undoLastAt: typeof record.undoLastAt === 'string' ? record.undoLastAt : '',
      undoLastForgotMs: typeof record.undoLastForgotMs === 'number'
        && Number.isFinite(record.undoLastForgotMs) && record.undoLastForgotMs > 0
        ? Math.floor(record.undoLastForgotMs)
        : 0,
      /* Les gestes gardés se relisent sans jamais deviner : seules les durées
         réelles et positives restent, et la liste garde ses six derniers
         gestes. Une durée écrite à l'ancienne — un simple nombre, sans les
         rubriques — se relit quand même, avec ses valeurs vides. */
      undoHeld: Array.isArray(record.undoHeld)
        ? record.undoHeld
          .map((value): MineUndoHeld | null => {
            if (typeof value === 'number') {
              return Number.isFinite(value) && value > 0
                ? { ms: Math.floor(value), annonce: '', offre: '' }
                : null;
            }
            if (!value || typeof value !== 'object') return null;
            const entry = value as Record<string, unknown>;
            const ms = typeof entry.ms === 'number' && Number.isFinite(entry.ms) && entry.ms > 0
              ? Math.floor(entry.ms)
              : 0;
            if (!ms) return null;
            return {
              ms,
              annonce: typeof entry.annonce === 'string' ? entry.annonce : '',
              offre: typeof entry.offre === 'string' ? entry.offre : '',
            };
          })
          .filter((entry): entry is MineUndoHeld => entry !== null)
          .slice(0, 6)
        : [],
      sharedCopied: readCopied(record.sharedCopied),
      /* Le séparateur se relit sans jamais deviner : un signe inconnu revient
         à la virgule, et la ligne retrouve son écriture d'origine. */
      sharedSep: SEPS.includes(record.sharedSep as SharedSeparator)
        ? (record.sharedSep as SharedSeparator)
        : ',',
      /* Le compte de la ligne courte se relit sans jamais deviner : un
         nombre entier positif, sinon zéro. */
      sharedCompactCopies: typeof record.sharedCompactCopies === 'number'
        && Number.isFinite(record.sharedCompactCopies) && record.sharedCompactCopies > 0
        ? Math.floor(record.sharedCompactCopies)
        : 0,
      /* La langue retenue se relit sans deviner : une langue connue, sinon
         le sélecteur reprend la main. */
      sharedTarget: LANGS.includes(record.sharedTarget as Lang)
        ? (record.sharedTarget as Lang)
        : '',
      /* La limite de l'aperçu se relit sans deviner : une valeur connue,
         sinon la limite par défaut reprend la main. */
      sharedLimit: SHARED_LIMITS.includes(record.sharedLimit as SharedLimit)
        ? (record.sharedLimit as SharedLimit)
        : SHARED_LIMIT_DEFAULT,
      /* Le seuil de la dernière copie courte se relit sans deviner : un seuil
         connu, sinon aucune copie n'est attestée. */
      sharedCompactLimit: SHARED_LIMITS.includes(record.sharedCompactLimit as SharedLimit)
        ? (record.sharedCompactLimit as SharedLimit)
        : null,
      /* Le dernier séparateur parti se relit sans deviner : un signe connu,
         sinon aucun envoi n'est attesté — et son jour, s'il est écrit. */
      sharedSepLast: SEPS.includes(record.sharedSepLast as SharedSeparator)
        ? (record.sharedSepLast as SharedSeparator)
        : null,
      sharedSepLastAt: typeof record.sharedSepLastAt === 'string'
        ? record.sharedSepLastAt
        : '',
      /* La longueur du dernier envoi se relit sans deviner : un nombre entier
         positif, sinon la longueur n'est pas attestée. */
      sharedSepLastChars: typeof record.sharedSepLastChars === 'number'
        && Number.isFinite(record.sharedSepLastChars) && record.sharedSepLastChars > 0
        ? Math.floor(record.sharedSepLastChars)
        : 0,
      /* Le compte des récapitulatifs copiés se relit sans jamais deviner : un
         nombre entier positif, sinon zéro. */
      sharedRecapCopies: typeof record.sharedRecapCopies === 'number'
        && Number.isFinite(record.sharedRecapCopies) && record.sharedRecapCopies > 0
        ? Math.floor(record.sharedRecapCopies)
        : 0,
      /* Le seuil de repli de l'aperçu se relit sans deviner : une valeur
         connue, sinon le seuil par défaut reprend la main. */
      sharedFoldAt: SHARED_FOLD_ATS.includes(record.sharedFoldAt as SharedFoldAt)
        ? (record.sharedFoldAt as SharedFoldAt)
        : SHARED_FOLD_DEFAULT,
      /* Le repli manuel de l’aperçu se relit sans deviner : seul un vrai oui
         ou un vrai non le fige, tout le reste le rend au nombre de valeurs. */
      sharedPreviewFolded: record.sharedPreviewFolded === true
        ? true
        : record.sharedPreviewFolded === false ? false : null,
      /* Le repli de la rangée se relit sans deviner : seul un vrai oui le
         rouvre replié, tout le reste rend la rangée dépliée. */
      sharedListFolded: record.sharedListFolded === true,
      /* Le jour où chaque valeur est sortie de la rangée se relit sans
         deviner : seules les dates écrites restent, valeur par valeur. */
      sharedAsideSince: readAsideSince(record.sharedAsideSince),
      /* L'ordre des pastilles se relit sans deviner : un ordre connu, sinon
         le temps passé dehors reprend la main par défaut. */
      asideLeftSort: record.asideLeftSort === 'n' ? 'n' : 'ago',
      /* Le compte de la gomme des replis se relit sans deviner : un nombre
         entier positif, et son jour s'il est écrit. */
      foldsErasedCount: typeof record.foldsErasedCount === 'number'
        && Number.isFinite(record.foldsErasedCount) && record.foldsErasedCount > 0
        ? Math.floor(record.foldsErasedCount)
        : 0,
      foldsErasedLastAt: typeof record.foldsErasedLastAt === 'string'
        ? record.foldsErasedLastAt
        : '',
      /* Les comptes des trois autres gommes se relisent sans deviner : un
         nombre entier positif, et leur jour s'il est écrit. */
      otherErasedCount: typeof record.otherErasedCount === 'number'
        && Number.isFinite(record.otherErasedCount) && record.otherErasedCount > 0
        ? Math.floor(record.otherErasedCount)
        : 0,
      otherErasedLastAt: typeof record.otherErasedLastAt === 'string'
        ? record.otherErasedLastAt
        : '',
      compactErasedCount: typeof record.compactErasedCount === 'number'
        && Number.isFinite(record.compactErasedCount) && record.compactErasedCount > 0
        ? Math.floor(record.compactErasedCount)
        : 0,
      compactErasedLastAt: typeof record.compactErasedLastAt === 'string'
        ? record.compactErasedLastAt
        : '',
      recapErasedCount: typeof record.recapErasedCount === 'number'
        && Number.isFinite(record.recapErasedCount) && record.recapErasedCount > 0
        ? Math.floor(record.recapErasedCount)
        : 0,
      recapErasedLastAt: typeof record.recapErasedLastAt === 'string'
        ? record.recapErasedLastAt
        : '',
      /* Ce que chaque gomme a effacé la dernière fois se relit sans deviner :
         seuls les comptes réels restent, famille par famille. */
      foldsErasedTrace: readEraseTrace(record.foldsErasedTrace),
      otherErasedTrace: readEraseTrace(record.otherErasedTrace),
      compactErasedTrace: readEraseTrace(record.compactErasedTrace),
      recapErasedTrace: readEraseTrace(record.recapErasedTrace),
      /* Les ouvertures de porte se relisent sans deviner : seuls les comptes
         entiers et positifs restent, gomme par gomme. */
      eraseDoorOpens: readOpens(record.eraseDoorOpens),
    };
  } catch {
    return fallback;
  }
}

function writeMineMemory(userId: string, memory: MineMemory) {
  if (!userId || typeof window === 'undefined') return;
  try {
    if (isDefault(memory)) window.localStorage.removeItem(storageKey(userId));
    else window.localStorage.setItem(storageKey(userId), JSON.stringify(memory));
  } catch {
    /* storage unavailable — the board simply is not remembered */
  }
}

/**
 * Remembers the tab, filters and sort of the owner's board on this device.
 * Each tab keeps its own view, so switching tabs never mixes two searches.
 */
export function useMineBoardMemory(userId: string | null) {
  const [memory, setMemory] = useState<MineMemory>(emptyMemory);
  const memoryRef = useRef<MineMemory>(memory);
  const userIdRef = useRef<string | null>(userId);

  useEffect(() => {
    userIdRef.current = userId;
    const restored = userId ? readMineMemory(userId) : emptyMemory();
    memoryRef.current = restored;
    setMemory(restored);
  }, [userId]);

  const update = useCallback((patch: (current: MineMemory) => MineMemory) => {
    const next = patch(memoryRef.current);
    memoryRef.current = next;
    setMemory(next);
    if (userIdRef.current) writeMineMemory(userIdRef.current, next);
  }, []);

  const patchFilters = useCallback(
    (patch: Partial<MineFilters>) => {
      update((current) => ({
        ...current,
        byTab: { ...current.byTab, [current.tab]: { ...current.byTab[current.tab], ...patch } },
      }));
    },
    [update],
  );

  const setTab = useCallback(
    (tab: ListingKind) => update((current) => ({ ...current, tab })),
    [update],
  );

  /** Le même geste, mais sur un onglet nommé : une porte peut resserrer la
   *  liste de l'autre famille sans changer d'abord d'onglet. */
  const patchTabFilters = useCallback(
    (kind: ListingKind, patch: Partial<MineFilters>) => {
      update((current) => ({
        ...current,
        byTab: { ...current.byTab, [kind]: { ...current.byTab[kind], ...patch } },
      }));
    },
    [update],
  );

  /** Le dernier effacement se garde (ou s'oublie) d'une visite à l'autre. Le
   *  jour du geste s'y pose : le rappel le cite comme le compte de l'oubli. */
  const setLastErase = useCallback(
    (erase: MineErase | null) => {
      update((current) => ({
        ...current,
        lastErase: erase && (erase.annonce.trim() || erase.offre.trim())
          ? { annonce: erase.annonce, offre: erase.offre, at: erase.at || new Date().toISOString() }
          : null,
      }));
    },
    [update],
  );

  /** L'oubli se garde de côté : sa porte le remet en place d'un clic. Le
   *  moment de l'oubli s'y pose, pour dire ensuite combien de temps il a tenu. */
  const setForgottenErase = useCallback(
    (erase: MineErase | null) => {
      update((current) => ({
        ...current,
        forgottenErase: erase && (erase.annonce.trim() || erase.offre.trim())
          ? {
            annonce: erase.annonce,
            offre: erase.offre,
            at: erase.at,
            forgotAt: new Date().toISOString(),
          }
          : null,
      }));
    },
    [update],
  );

  /** L'oubli défait se compte : une fois de plus, le jour du geste et le temps
   *  que l'oubli a tenu — le petit compte se garde comme le rappel lui-même.
   *  La durée rejoint aussi la liste des derniers gestes, avec les rubriques
   *  que l'effacement retirait : la porte du compte rouvre la valeur du geste
   *  qui tire la série. */
  const noteUndoRestored = useCallback((
    heldMs = 0,
    erase: { annonce: string; offre: string } | null = null,
  ) => {
    const held = heldMs > 0 ? Math.floor(heldMs) : 0;
    update((current) => ({
      ...current,
      undoCount: (current.undoCount || 0) + 1,
      undoLastAt: new Date().toISOString(),
      undoLastForgotMs: held > 0 ? held : current.undoLastForgotMs,
      undoHeld: held > 0
        ? [
          { ms: held, annonce: erase?.annonce ?? '', offre: erase?.offre ?? '' },
          ...(current.undoHeld || []),
        ].slice(0, 6)
        : (current.undoHeld || []),
    }));
  }, [update]);

  /** Une copie du relevé partagé dans une langue : ses valeurs s'ajoutent au
   *  compte de cette langue, gardé sur l'appareil — la pastille dit ensuite
   *  combien de valeurs sont déjà parties de ce côté. */
  const noteSharedCopied = useCallback((lang: Lang, n: number) => {
    const add = n > 0 ? Math.floor(n) : 0;
    if (!add) return;
    update((current) => ({
      ...current,
      sharedCopied: { ...current.sharedCopied, [lang]: (current.sharedCopied[lang] ?? 0) + add },
    }));
  }, [update]);

  /** Le séparateur du relevé compact se choisit et se garde : la ligne
   *  part avec le signe lu sur la pastille, d'une visite à l'autre. */
  const setSharedSep = useCallback((sep: SharedSeparator) => {
    update((current) => ({ ...current, sharedSep: sep }));
  }, [update]);

  /** Une copie de la ligne courte : le compte de la pastille compacte
   *  s'incrémente d'une fois, et le seuil sous lequel elle est partie se
   *  garde avec lui — les deux se relisent ensemble à la visite suivante. */
  const noteSharedCompactCopied = useCallback((limit: SharedLimit) => {
    update((current) => ({
      ...current,
      sharedCompactCopies: (current.sharedCompactCopies || 0) + 1,
      sharedCompactLimit: limit,
    }));
  }, [update]);

  /** Le dernier séparateur réellement parti se garde avec son jour, et la
   *  longueur que la ligne faisait alors : le récapitulatif cite cet envoi,
   *  et deux envois se comparent par leur signe comme par leur taille.
   */
  const noteSharedSepUsed = useCallback((sep: SharedSeparator, chars = 0) => {
    const size = chars > 0 ? Math.floor(chars) : 0;
    update((current) => ({
      ...current,
      sharedSepLast: sep,
      sharedSepLastAt: new Date().toISOString(),
      sharedSepLastChars: size,
    }));
  }, [update]);

  /** Une copie du récapitulatif : le compte s'incrémente d'une fois, gardé
   *  avec ceux de la ligne — la pastille dit ensuite combien de récapitulatifs
   *  sont déjà partis de cet appareil. */
  const noteSharedRecapCopied = useCallback(() => {
    update((current) => ({
      ...current,
      sharedRecapCopies: (current.sharedRecapCopies || 0) + 1,
    }));
  }, [update]);

  /** La langue visée par la pastille de copie se choisit et se garde : vide,
   *  la pastille suit le sélecteur de la page. */
  const setSharedTarget = useCallback((lang: Lang | '') => {
    update((current) => ({ ...current, sharedTarget: lang }));
  }, [update]);

  /** La petite gomme d'une pastille de copie : elle remet à zéro le compte
   *  d'une seule langue, sans toucher aux autres ni au séparateur. Son propre
   *  usage monte d'une fois, avec le jour du geste — les quatre gommes de la
   *  ligne se lisent d'un même geste. */
  const resetSharedCopied = useCallback((lang: Lang, trace: MineEraseTrace | null = null) => {
    update((current) => ({
      ...current,
      sharedCopied: { ...current.sharedCopied, [lang]: 0 },
      otherErasedCount: (current.otherErasedCount || 0) + 1,
      otherErasedLastAt: new Date().toISOString(),
      otherErasedTrace: cleanEraseTrace(trace),
    }));
  }, [update]);

  /** La limite de l'aperçu se choisit et se garde : la ligne courte se mesure
   *  sous le seuil lu sur la pastille, d'une visite à l'autre. */
  const setSharedLimit = useCallback((limit: SharedLimit) => {
    update((current) => ({ ...current, sharedLimit: limit }));
  }, [update]);

  /** Le seuil de repli automatique de l'aperçu se choisit et se garde :
   *  au-delà de ce nombre de valeurs, l'aperçu se range de lui-même. */
  const setSharedFoldAt = useCallback((foldAt: SharedFoldAt) => {
    update((current) => ({ ...current, sharedFoldAt: foldAt }));
  }, [update]);

  /** Le repli manuel de l'aperçu se choisit et se garde : la ligne se rouvre
   *  comme on l'a laissée d'une visite à l'autre, comme la rangée. */
  const setSharedPreviewFolded = useCallback((folded: boolean) => {
    update((current) => ({ ...current, sharedPreviewFolded: folded }));
  }, [update]);

  /** Le repli de la rangée des valeurs se choisit et se garde : la rangée se
   *  rouvre comme on l'a laissée d'une visite à l'autre. */
  const setSharedListFolded = useCallback((folded: boolean) => {
    update((current) => ({ ...current, sharedListFolded: folded }));
  }, [update]);

  /** L'ordre des pastilles des rubriques laissées de côté se choisit et se
   *  garde : le jeton se rouvre dans l'ordre lu la dernière fois. */
  const setAsideLeftSort = useCallback((sort: MineAsideSort) => {
    update((current) => ({ ...current, asideLeftSort: sort }));
  }, [update]);

  /** Les valeurs que la rangée repliée tient hors de l'écran : chacune garde
   *  le jour où elle en est sortie, pour que la porte dise combien de temps
   *  elle est restée dehors — valeur par valeur. Une valeur revenue à l'écran
   *  s'oublie ; rien ne bouge tant que la liste des valeurs ne change pas. */
  const noteSharedAsideSince = useCallback((values: string[]) => {
    update((current) => {
      const next: Record<string, string> = {};
      const now = new Date().toISOString();
      values.forEach((value) => {
        const name = value.trim();
        if (!name) return;
        next[name] = current.sharedAsideSince[name] || now;
      });
      const before = current.sharedAsideSince;
      const keys = Object.keys(next);
      const same = keys.length === Object.keys(before).length
        && keys.every((key) => before[key] === next[key]);
      return same ? current : { ...current, sharedAsideSince: next };
    });
  }, [update]);

  /** La petite gomme des deux replis : l'aperçu et la rangée reviennent à
   *  leur état automatique — l'aperçu suit de nouveau son seuil, la rangée
   *  s'ouvre — sans toucher aux comptes ni aux autres choix de la ligne. Son
   *  propre compte monte d'une fois, avec le jour du geste. */
  const resetSharedFolds = useCallback((trace: MineEraseTrace | null = null) => {
    update((current) => ({
      ...current,
      sharedPreviewFolded: null,
      sharedListFolded: false,
      foldsErasedCount: (current.foldsErasedCount || 0) + 1,
      foldsErasedLastAt: new Date().toISOString(),
      foldsErasedTrace: cleanEraseTrace(trace),
    }));
  }, [update]);

  /** La petite gomme du récapitulatif : elle remet son compte à zéro sans
   *  toucher aux comptes de la ligne ni au seuil retenu. Son propre usage
   *  monte d'une fois, avec le jour du geste. */
  const resetSharedRecapCopies = useCallback((trace: MineEraseTrace | null = null) => {
    update((current) => ({
      ...current,
      sharedRecapCopies: 0,
      recapErasedCount: (current.recapErasedCount || 0) + 1,
      recapErasedLastAt: new Date().toISOString(),
      recapErasedTrace: cleanEraseTrace(trace),
    }));
  }, [update]);

  /** La porte d'une gomme vient d'être ouverte : son compte monte d'une fois,
   *  gardé sur l'appareil à côté de son usage et de son jour — on sait
   *  combien de fois la liste s'est resserrée depuis ce compte-là. */
  const noteEraseDoorOpen = useCallback((id: string) => {
    const key = (id || '').trim();
    if (!key) return;
    update((current) => ({
      ...current,
      eraseDoorOpens: {
        ...current.eraseDoorOpens,
        [key]: (current.eraseDoorOpens[key] ?? 0) + 1,
      },
    }));
  }, [update]);

  /** La petite gomme du compte de la ligne courte : elle le remet à zéro sans
   *  toucher aux comptes des autres langues ni au séparateur. Le seuil de la
   *  dernière copie s'efface avec lui — un compte à zéro n'a plus de seuil. */
  const resetSharedCompactCopies = useCallback((trace: MineEraseTrace | null = null) => {
    update((current) => ({
      ...current,
      sharedCompactCopies: 0,
      sharedCompactLimit: null,
      compactErasedCount: (current.compactErasedCount || 0) + 1,
      compactErasedLastAt: new Date().toISOString(),
      compactErasedTrace: cleanEraseTrace(trace),
    }));
  }, [update]);

  /** La petite gomme du compte : elle remet le compte de l'oubli à zéro et
   *  efface le jour du dernier geste, sans toucher au rappel du tout. */
  const resetUndoCount = useCallback(() => {
    update((current) => ({
      ...current, undoCount: 0, undoLastAt: '', undoLastForgotMs: 0, undoHeld: [],
    }));
  }, [update]);

  return {
    memory,
    patchFilters,
    patchTabFilters,
    setTab,
    setLastErase,
    setForgottenErase,
    noteUndoRestored,
    noteSharedCopied,
    noteSharedCompactCopied,
    noteSharedSepUsed,
    noteSharedRecapCopied,
    resetSharedCopied,
    resetSharedCompactCopies,
    setSharedTarget,
    setSharedSep,
    setSharedLimit,
    setSharedFoldAt,
    setSharedPreviewFolded,
    setSharedListFolded,
    noteSharedAsideSince,
    setAsideLeftSort,
    resetSharedFolds,
    resetSharedRecapCopies,
    resetUndoCount,
    noteEraseDoorOpen,
  };
}