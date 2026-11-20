import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { useMyListings } from '@/hooks/useListings';
import {
  useMineBoardMemory, type MineEraseTrace, type MineFilters, type MinePeriod, type MineSort,
} from '@/hooks/useMineMemory';
import { nomPays, PAYS_DEFAUT, paysArabes, paysDe, tallyPays } from '@/lib/pays';
import { motDivision } from '@/lib/division';
import { regionsWith } from '@/lib/regions';
import { nomRegion } from '@/lib/regionLabels';
import { prixDevise } from '@/lib/price';
import PaysSelect from '@/components/feature/PaysSelect';
import RegionSelect from '@/components/feature/RegionSelect';
import PaysTally from '@/components/feature/PaysTally';
import CsvExportButton from '@/components/feature/CsvExportButton';
import CopyLinkButton from '@/components/feature/CopyLinkButton';
import CopyTextButton from '@/components/feature/CopyTextButton';
import PoseRestante from '@/components/feature/PoseRestante';
import { annonceCats, type AnnonceCat } from '@/mocks/annonces';
import { contracts, type Contract } from '@/mocks/emplois';
import { CAT_KEY } from '@/pages/annonces/components/AnnonceCard';
import { CONTRACT_KEY } from '@/pages/emplois/components/JobCard';
import type { ListingKind, ListingRow, ListingStatut } from '@/lib/listings';
import { annonceReferenceFor, referenceFor } from '@/lib/listings';
import { buildMineCsv, downloadMineCsv } from './mineCsv';
import { buildMineSummary } from './mineSummary';
import MineDraftNote from './MineDraftNote';
import MineUndoCount from './MineUndoCount';
import SharedEraseCount from './SharedEraseCount';
import SharedRecap from './SharedRecap';
import {
  LANG_NAME_KEY, NEXT_LANG, SEPARATORS, SHARED_FOLD_ATS, SHARED_LIMITS, SHARED_LIST_FOLD_AT,
  TARGET_LANGS, nextSharedLimit,
  sharedCompactLines, sharedCopyLines, sharedFamilyLines, sharedSidesLine,
} from './mineSharedCopy';
import OffreCandidatureChip from './OffreCandidatureChip';
import { useOffreCandidatures } from '@/hooks/useOffreCandidatures';
import { readBrouillon, clearBrouillon, readRepris, type DepotBrouillon } from '@/lib/depotBrouillon';
import './mine-list.css';
import './mine-shared-counts.css';

const STATUS_KEY: Record<ListingStatut, string> = {
  en_attente: 'acct.mine.pending',
  publie: 'acct.mine.published',
  refuse: 'acct.mine.refused',
};

/* Le nom du tri retenu, lu dans le survol des portes de gomme : ce qu'un
   second clic rendra se dit avec les mêmes mots que le sélecteur de la ligne. */
const SORT_KEY: Record<MineSort, string> = {
  new: 'acct.mine.sortNew',
  old: 'acct.mine.sortOld',
  updated: 'acct.mine.sortUpdated',
  pays: 'pays.sort',
  unread: 'acct.mine.sortUnread',
};

type Tab = ListingKind;

/** A deposit left untouched in the review queue this long is worth flagging. */
const REVIEW_DELAY_MS = 48 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Past this age, a deposit that still needs action is worth calling out. */
const STALE_DELAY_MS = 7 * DAY_MS;
const HOUR_MS = 60 * 60 * 1000;

/** The posting window and the open tab travel in the address, like the country elsewhere. */
const PERIOD_PARAM = 'period';
const TAB_PARAM = 'tab';
/* La rubrique et le pays lus d'une porte extérieure — la fourchette de prix du
   dépôt — voyagent aussi dans l'adresse, sous leurs propres clés : le tableau
   des candidatures, plus bas sur la page, tient déjà « pays ». */
const RUBRIQUE_PARAM = 'mrub';
const MINE_PAYS_PARAM = 'mpays';
const PERIOD_VALUES: MinePeriod[] = ['all', 'month', 'quarter', 'prevMonth', 'prevQuarter'];

/** The window labels, so the copied summary names the period it describes. */
const PERIOD_KEY: Record<MinePeriod, string> = {
  all: 'acct.mine.periodAll',
  month: 'acct.mine.periodMonth',
  quarter: 'acct.mine.periodQuarter',
  prevMonth: 'acct.mine.periodPrevMonth',
  prevQuarter: 'acct.mine.periodPrevQuarter',
};

const stampOf = (iso: string) => {
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? 0 : time;
};

/** First instant of the month a date belongs to. */
const monthFloor = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getTime();

/** First instant of the calendar quarter a date belongs to. */
const quarterFloor = (date: Date) => new Date(
  date.getFullYear(),
  Math.floor(date.getMonth() / 3) * 3,
  1,
).getTime();

type PeriodRange = { start: number; end: number | null };

/**
 * The window a deposit can be read in. An open window — this month, this
 * quarter — has no end; a closed one stops exactly where the current window
 * begins, so a finished month or quarter can be read back on its own.
 */
function periodRange(period: MinePeriod): PeriodRange | null {
  if (period === 'all') return null;
  const now = new Date();
  if (period === 'month') return { start: monthFloor(now), end: null };
  if (period === 'quarter') return { start: quarterFloor(now), end: null };
  if (period === 'prevMonth') {
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { start: first.getTime(), end: monthFloor(now) };
  }
  return {
    start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1).getTime(),
    end: quarterFloor(now),
  };
}

/** A deposit posted inside the chosen window. */
function inRange(iso: string, range: PeriodRange | null) {
  if (!range) return true;
  const at = stampOf(iso);
  return at >= range.start && (range.end === null || at < range.end);
}

/** Refused, or waiting for review longer than 48 h: both need the owner to move. */
function needsAction(row: ListingRow) {
  if (row.statut === 'refuse') return true;
  if (row.statut !== 'en_attente') return false;
  /* Review time counts from the last edit, so a fresh correction is not flagged. */
  const since = Math.max(stampOf(row.created_at), stampOf(row.updated_at));
  return since > 0 && Date.now() - since >= REVIEW_DELAY_MS;
}

/** Une offre en ligne qui n’a reçu aucune candidature depuis deux semaines. */
const CAND_IDLE_MS = 14 * DAY_MS;
/** Au-delà de ce délai de première réponse, une offre est dite lente à répondre. */
const FAST_REPLY_MS = 48 * HOUR_MS;

/** Needs action and has been sitting like that for over a week: the real backlog. */
function isStale(row: ListingRow) {
  if (!needsAction(row)) return false;
  const since = Math.max(stampOf(row.created_at), stampOf(row.updated_at));
  return since > 0 && Date.now() - since >= STALE_DELAY_MS;
}

/**
 * La famille d'une rubrique, lue sur les deux listes du formulaire de dépôt :
 * une annonce se range dans les catégories d'annonce, une offre d'emploi dans
 * les contrats. Une rubrique inconnue ne se range nulle part.
 */
function rubriqueFamily(value: string | null | undefined): ListingKind | null {
  const cle = (value || '').trim();
  if (!cle) return null;
  if ((annonceCats as string[]).includes(cle)) return 'annonce';
  if ((contracts as string[]).includes(cle)) return 'offre';
  return null;
}

/**
 * La rubrique enregistrée vient de l'autre famille : un dépôt ancien déposé
 * avant que le formulaire ne sépare les deux listes porte encore une rubrique
 * qui ne correspond pas à son type. La liste le signale au lieu de laisser
 * passer une valeur que le formulaire d'aujourd'hui ne propose plus.
 */
function rubriqueHorsType(row: ListingRow) {
  const famille = rubriqueFamily(row.rubrique);
  return famille !== null && famille !== row.kind;
}

/** The board the owner sees: state of every deposit, with inline edit and delete. */
export default function MyListings() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { rows, loading, error, reload } = useMyListings();

  /* The board reopens on the tab, filters and sort of the previous visit. */
  const {
    memory,
    patchFilters,
    patchTabFilters,
    setTab: rememberTab,
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
  } = useMineBoardMemory(user?.id ?? null);
  const tab: Tab = memory.tab;
  const {
    status, query, wilaya, pays, sort, period, attention, stale, originsRest, originsRestFrom,
  } = memory.byTab[tab];

  const [params, setParams] = useSearchParams();
  /* A shared address is read once, before the address starts mirroring the board. */
  const linkRead = useRef(false);
  /* La rubrique lue d'une porte extérieure : le tableau se resserre sur elle et
     la liste le dit, plutôt que de laisser chercher la bonne ligne à la main.
     Elle se garde d'une visite à l'autre, onglet par onglet, comme le tri et
     les filtres : la liste rouverte retrouve le même resserrement. */
  const rubPick = (memory.byTab[tab].rubrique || '').trim();

  /**
   * Arriving from a copied link: the window and the tab in the address win over
   * the stored view, so a closed quarter reopens on the board it came from.
   */
  useEffect(() => {
    if (linkRead.current || !user) return;
    linkRead.current = true;
    const rawPeriod = params.get(PERIOD_PARAM) ?? '';
    const rawTab = params.get(TAB_PARAM) ?? '';
    const rawRub = (params.get(RUBRIQUE_PARAM) ?? '').trim();
    const rawPays = (params.get(MINE_PAYS_PARAM) ?? '').trim();
    const nextPeriod = PERIOD_VALUES.includes(rawPeriod as MinePeriod)
      ? (rawPeriod as MinePeriod)
      : null;
    /* L'onglet d'abord : la période, le pays et la rubrique lus ensuite
       s'appliquent au tableau qu'on vient d'ouvrir. */
    if ((rawTab === 'offre' || rawTab === 'annonce') && rawTab !== tab) rememberTab(rawTab);
    if (nextPeriod && nextPeriod !== period) patchFilters({ period: nextPeriod });
    if (rawPays) patchFilters({ pays: rawPays });
    if (rawRub) patchFilters({ rubrique: rawRub });
  }, [user, params, period, tab, pays, patchFilters, rememberTab]);

  /** The address keeps the board, so « copier le lien » reopens the same window. */
  useEffect(() => {
    if (!user) return;
    const next = new URLSearchParams(params);
    if (period === 'all') next.delete(PERIOD_PARAM);
    else next.set(PERIOD_PARAM, period);
    if (tab === 'annonce') next.delete(TAB_PARAM);
    else next.set(TAB_PARAM, tab);
    const rub = rubPick.trim();
    if (rub) next.set(RUBRIQUE_PARAM, rub);
    else next.delete(RUBRIQUE_PARAM);
    if (pays) next.set(MINE_PAYS_PARAM, pays);
    else next.delete(MINE_PAYS_PARAM);
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
  }, [user, period, tab, rubPick, pays, params, setParams]);

  const [editing, setEditing] = useState<string | null>(null);
  /* Le dépôt ouvert depuis un de ses repères : le curseur se pose dans le
     champ visé — le titre d'une offre muette, ou le salaire jamais précisé —
     dès que le formulaire d'édition est à l'écran. */
  const [editFocus, setEditFocus] = useState<{ id: string; field: 'titre' | 'budget' | 'rubrique' } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [failure, setFailure] = useState('');
  const [descLen, setDescLen] = useState(0);
  /* L’aperçu replié : un clic le range quand le relevé compte beaucoup de
     valeurs — la ligne du tableau reste courte, le texte long s’efface. Tant
     qu’on n’a pas tranché à la main, il suit le nombre de valeurs : au-delà
     du seuil réglé, il se replie de lui-même. Le choix tranché à la main se
     garde sur l’appareil, comme celui de la rangée : l’aperçu se rouvre comme
     on l’a laissé d’une visite à l’autre. */
  const previewFoldManual = memory.sharedPreviewFolded;
  /* La rangée des valeurs partagées se replie d’un clic quand elle
     s’allonge : le compte reste visible, et un second clic la rouvre. Le
     choix se garde sur l’appareil — la rangée se rouvre comme on l’a laissée. */
  const sharedListFolded = memory.sharedListFolded;
  /* La porte du compte « hors écran » : la rangée se resserre sur les valeurs
     qu'elle gardait de côté, et sur elles seules, pour les voir sans déplier
     les autres. Ce resserrement ne se garde pas — c'est une lecture. */
  const [sharedAsideOnly, setSharedAsideOnly] = useState(false);
  /* Le signe du bas de la rangée ouvre les deux valeurs les plus lourdes
     ensemble : le resserrement garde leurs deux rubriques, et se retire d'un
     second clic. Comme la porte hors écran, c'est une lecture, pas un choix
     gardé d'une visite à l'autre. */
  const [asidePair, setAsidePair] = useState<string[]>([]);
  /* Le compte des rubriques que les trois plus lourdes laissent hors de la
     liste est une porte : un clic resserre la liste sur elles seules, un
     second clic rend la liste entière. Ce resserrement ne se garde pas —
     c'est une lecture, comme celui des deux et des trois valeurs. */
  const [asideLeft, setAsideLeft] = useState<string[]>([]);
  /* La porte du compte « rubriques hors de la liste » retient les rubriques
     qu'elle a resserrées : le compte les garde au lieu de se vider en se
     resserrant sur elles, et un second clic rend la liste entière. */
  const [asideLeftOut, setAsideLeftOut] = useState<string[] | null>(null);
  /* Les rubriques que la porte du petit compte a déjà ouvertes pendant cette
     lecture : leur compte se lit à côté du temps passé dehors, pour savoir ce
     qui a déjà été vu sans relire les noms. */
  const [asideLeftOutTaken, setAsideLeftOutTaken] = useState<string[]>([]);
  /* Le tri des pastilles de ce jeton : par temps passé dehors, ou par dépôts.
     Le petit signe posé devant elles bascule de l'un à l'autre — le temps se
     lit sans compter, le compte se relit sans mesurer. Le choix se garde sur
     l'appareil, comme les autres réglages de la ligne. */
  const asideLeftSort = memory.asideLeftSort;
  /* La porte d'un compte de gomme garde les filtres qu'elle a effacés : un
     second clic sur la même porte les rend, et la liste reprend l'étendue
     qu'elle avait avant le geste. Une autre porte remplace la première. */
  const [erasedDoor, setErasedDoor] = useState<
    { id: string; kind: Tab; before: MineFilters } | null
  >(null);
  /* Les filtres que la dernière porte de gomme ouverte a rendus, nommés un
     par un : le récapitulatif copié les cite, pour qu'un collègue sache
     quelle étendue la porte a rendue. */
  const [doorFiltersTxt, setDoorFiltersTxt] = useState('');
  /* Country of the deposit being edited: the region list follows it. */
  const [editPays, setEditPays] = useState(PAYS_DEFAUT);
  const [bulkIds, setBulkIds] = useState<string[] | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [quickConfirm, setQuickConfirm] = useState(false);
  /* A row reached from the banner shortcut, highlighted for a few seconds. */
  const [focusId, setFocusId] = useState<string | null>(null);
  /* Reason filter, picked from the grouped refusals. Local: it resets with the tab. */
  const [motifPick, setMotifPick] = useState<string | null>(null);
  /* Les offres qui répondent en plus de 48 h, ouvertes depuis la ligne de
     réactivité : la liste se resserre sur elles, prêtes à recevoir la réponse. */
  const [onlySlow, setOnlySlow] = useState(false);
  /* Les offres sans candidature et sans salaire, resserrées d'un clic : on les
     ouvre l'une après l'autre, le salaire déjà sous le curseur. */
  const [onlyBare, setOnlyBare] = useState(false);
  /* La rubrique corrigée depuis le repère de la ligne : la liste de la bonne
     famille s'ouvre sous le dépôt, sans passer par le formulaire entier. */
  const [rubriqueFor, setRubriqueFor] = useState<string | null>(null);
  const [rubriqueBusy, setRubriqueBusy] = useState('');
  /* Le dernier effacement des rubriques retenues : la gomme laisse un rappel
     discret, avec la porte qui les remet en place — un geste effacé ne coûte
     pas une seconde visite pour retrouver le même resserrement. Il se garde
     sur l'appareil, comme la rubrique retenue elle-même. */
  const lastErase = memory.lastErase;
  /* L'effacement qu'on vient d'oublier : gardé de côté, sa porte le remet
     d'aplomb d'un clic, sans rien remettre à l'écran. */
  const forgottenErase = memory.forgottenErase;
  /* La visite des offres « à compléter » s'enchaîne : après l'enregistrement,
     la suivante s'ouvre d'elle-même, sans repasser par le tableau. La file
     garde les dépôts qui restent à visiter. */
  const [chainIds, setChainIds] = useState<string[]>([]);
  /* La série parcourue : les offres à compléter, ou les dépôts dont la
     rubrique vient de l'autre famille. La file se déroule de la même façon,
     mais le curseur ne se pose pas dans le même champ. */
  const [chainMode, setChainMode] = useState<'bare' | 'rubrique' | null>(null);
  /* Le dépôt que les flèches mettent en avant : -1 tant qu'aucun ne l'est. */
  const [keyed, setKeyed] = useState(-1);
  const listRef = useRef<HTMLUListElement | null>(null);

  /* Le brouillon gardé sur l'appareil, relu à chaque passage sur l'onglet :
     ce qu'on a commencé sans l'envoyer se signale ici plutôt que de dormir. */
  const [draft, setDraft] = useState<DepotBrouillon | null>(null);
  /* L'instant où ce brouillon a été rouvert pendant la visite : la note le
     rappelle, pour qu'un second départ ne soit pas pris en double. */
  const [repris, setRepris] = useState<number | null>(null);
  useEffect(() => {
    setDraft(readBrouillon(tab));
    setRepris(readRepris(tab));
  }, [tab]);

  const location = useLocation();
  const navigate = useNavigate();

  /* Arriving from a board with #my-listings: land right on the deposits. */
  useEffect(() => {
    if (location.hash !== '#my-listings') return;
    document.getElementById('my-listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  /* Les candidatures reçues, offre par offre : lues sur l'onglet des offres
     seulement, et jamais devinées — sans compte, le relevé reste muet. Les
     non lues s'y ajoutent, pour repérer les offres qui attendent une réponse. */
  const cands = useOffreCandidatures(tab === 'offre');

  /**
   * La part des offres qui répondent en moins de 48 h, arrondie : le pendant
   * collectif du délai moyen affiché sur chaque ligne.
   */
  const fastShare = cands && cands.replyRated > 0
    ? Math.round((cands.replyFast / cands.replyRated) * 100)
    : 0;

  /**
   * Les offres déjà mesurées qui répondent en plus de 48 h : le complément de
   * la part rapide, nommé offre par offre pour que la porte mène quelque part.
   * Une offre encore muette n'y figure pas — elle n'a pas de délai à juger.
   */

  const tabList = useMemo(() => rows.filter((row) => row.kind === tab), [rows, tab]);

  const slowOffres = useMemo(
    () => (cands
      ? tabList.filter((row) => (cands.replyAvg[row.id] ?? 0) > FAST_REPLY_MS)
      : []),
    [tabList, cands],
  );
  const slowIds = useMemo(() => new Set(slowOffres.map((row) => row.id)), [slowOffres]);
  const slowCount = cands ? Math.max(0, cands.replyRated - cands.replyFast) : 0;

  /**
   * Les offres qui n'ont jamais reçu de candidature et dont le salaire manque
   * aussi : deux manques qui se corrigent dans la même visite. Le compte ne se
   * lit que sur un relevé réel — sans candidatures lues, rien ne se devine.
   */
  const bareOffres = useMemo(
    () => (cands
      ? tabList.filter((row) => row.kind === 'offre'
        && (cands.counts[row.id] ?? 0) === 0
        && !(row.budget || '').trim())
      : []),
    [tabList, cands],
  );
  const bareIds = useMemo(() => new Set(bareOffres.map((row) => row.id)), [bareOffres]);
  const annonceCount = rows.filter((row) => row.kind === 'annonce').length;
  const offreCount = rows.filter((row) => row.kind === 'offre').length;

  /** Les dépôts de l'onglet dont la rubrique vient de l'autre famille : le
   *  rappel sous le tableau en donne le compte, et chaque ligne porte le sien. */
  const horsType = useMemo(() => tabList.filter(rubriqueHorsType), [tabList]);

  /** La même série, lue sur les deux familles : le rappel au-dessus de la liste
   *  donne le compte de chacune, les annonces et les offres côte à côte. */
  const horsTypeByKind = useMemo(() => ({
    annonce: rows.filter((row) => row.kind === 'annonce' && rubriqueHorsType(row)),
    offre: rows.filter((row) => row.kind === 'offre' && rubriqueHorsType(row)),
  }), [rows]);
  const horsTypeTotal = horsTypeByKind.annonce.length + horsTypeByKind.offre.length;

  /**
   * The chosen window. Everything in the list and in the country counter is
   * read inside it; the tab totals above stay the whole history.
   */
  const periodWindow = useMemo(() => periodRange(period), [period]);

  /** The deposits of the open tab inside the chosen window. */
  const periodList = useMemo(
    () => tabList.filter((row) => inRange(row.created_at, periodWindow)),
    [tabList, periodWindow],
  );

  /** How many deposits each window would show, on the open tab. */
  const windowCounts = useMemo(() => {
    const windows = {
      month: periodRange('month'),
      quarter: periodRange('quarter'),
      prevMonth: periodRange('prevMonth'),
      prevQuarter: periodRange('prevQuarter'),
    };
    const counts = { month: 0, quarter: 0, prevMonth: 0, prevQuarter: 0 };
    (Object.keys(windows) as (keyof typeof windows)[]).forEach((key) => {
      tabList.forEach((row) => {
        if (inRange(row.created_at, windows[key])) counts[key] += 1;
      });
    });
    return counts;
  }, [tabList]);

  /**
   * This month against the month before, on the open tab: the two counts and
   * the move between them, so the direction of deposits reads at a glance.
   */
  const monthCompare = useMemo(() => {
    const now = windowCounts.month;
    const before = windowCounts.prevMonth;
    return { now, before, delta: now - before };
  }, [windowCounts]);

  /** The order of the country select, used when the board is grouped by country. */
  const paysRank = useMemo(
    () => new Map(paysArabes.map((p, index) => [p.code, index])),
    [],
  );

  /** Small tally of the active tab, so the owner sees what still needs attention. */
  const stats = useMemo(() => ({
    en_attente: tabList.filter((row) => row.statut === 'en_attente').length,
    publie: tabList.filter((row) => row.statut === 'publie').length,
    refuse: tabList.filter((row) => row.statut === 'refuse').length,
  }), [tabList]);

  /** Deposits that expect the owner: refused, or stuck in review for over 48 h. */
  const attentionCount = useMemo(() => tabList.filter(needsAction).length, [tabList]);

  /** Where the deposits of the open tab come from: the country counter above them. */
  const paysTally = useMemo(() => tallyPays(periodList), [periodList]);
  const paysTotal = useMemo(
    () => paysTally.reduce((sum, row) => sum + row.count, 0),
    [paysTally],
  );

  /** Both kinds together: the headline of the board, before any tab is opened. */
  const attentionTotal = useMemo(() => rows.filter(needsAction).length, [rows]);

  /** Deposits still waiting on the owner after a full week: the oldest backlog. */
  const staleTotal = useMemo(() => rows.filter(isStale).length, [rows]);

  /** The same backlog inside the open tab, so the chip can filter it. */
  const staleCount = useMemo(() => tabList.filter(isStale).length, [tabList]);

  /** Stale deposits on the other tab, so the chip can lead there. */
  const otherTabStale = useMemo(
    () => rows.filter((row) => row.kind !== tab && isStale(row)).length,
    [rows, tab],
  );

  /** Attention deposits waiting on the other tab, so the shortcut can lead there. */
  const otherTabAttention = useMemo(
    () => rows.filter((row) => row.kind !== tab && needsAction(row)).length,
    [rows, tab],
  );

  /** Both kinds together: how many deposits are already live. */
  const publishedTotal = useMemo(() => rows.filter((row) => row.statut === 'publie').length, [rows]);

  /** Live deposits waiting on the other tab, so the chip can lead there. */
  const otherTabPublished = useMemo(
    () => rows.filter((row) => row.kind !== tab && row.statut === 'publie').length,
    [rows, tab],
  );

  /**
   * Average time a deposit spent in review in this tab, measured on the ones
   * already handled (published or refused): their last update closes the review.
   */
  const avgReview = useMemo(() => {
    const spans = tabList
      .filter((row) => row.statut !== 'en_attente')
      .map((row) => Math.max(stampOf(row.updated_at), stampOf(row.created_at)) - stampOf(row.created_at))
      .filter((span) => span > 0);
    if (!spans.length) return 0;
    return spans.reduce((total, span) => total + span, 0) / spans.length;
  }, [tabList]);

  /** The most recent refusal across both tabs, the one the shortcut opens. */
  const latestRefused = useMemo(() => {
    const refused = rows.filter((row) => row.statut === 'refuse');
    if (!refused.length) return null;
    return refused.reduce((newest, row) => (
      Math.max(stampOf(row.created_at), stampOf(row.updated_at))
      > Math.max(stampOf(newest.created_at), stampOf(newest.updated_at))
        ? row
        : newest
    ));
  }, [rows]);

  /* Bring the row into view once the right tab and the cleared filters render. */
  useEffect(() => {
    if (!focusId) return;
    const scroll = window.setTimeout(() => {
      document.getElementById(`mine-row-${focusId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 70);
    const clear = window.setTimeout(() => setFocusId(null), 4200);
    return () => {
      window.clearTimeout(scroll);
      window.clearTimeout(clear);
    };
  }, [focusId]);

  /* Search and filters only appear once the list gets long enough to need them;
     sorting is useful from the second deposit on. */
  const showTools = tabList.length > 3;
  const showSort = tabList.length > 1;
  const filtering = status !== 'all' || Boolean(query.trim()) || Boolean(wilaya) || Boolean(pays)
    || attention || stale || period !== 'all' || motifPick !== null || onlySlow || onlyBare
    || Boolean(rubPick.trim()) || Boolean(originsRest.trim()) || asidePair.length > 0
    || asideLeft.length > 0;

  /** Every refused deposit of the active tab, ready to go back to review at once. */
  const refusedRows = useMemo(() => tabList.filter((row) => row.statut === 'refuse'), [tabList]);

  /** The refused reasons, most frequent first: what recurs at a glance. */
  const motifGroups = useMemo(() => {
    const tally = new Map<string, number>();
    refusedRows.forEach((row) => {
      const key = (row.motif || '').trim();
      tally.set(key, (tally.get(key) || 0) + 1);
    });
    return Array.from(tally.entries())
      .map(([motif, count]) => ({ motif, count, label: motif || t('acct.mine.motifNone') }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [refusedRows, t]);

  /** Rank of a reason: the more it recurs, the earlier its deposits show up. */
  const motifRank = useMemo(
    () => new Map(motifGroups.map((group, index) => [group.motif, index])),
    [motifGroups],
  );

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rubFiltered = rubPick.trim();
    const matched = tabList.filter((row) => {
      if (onlySlow && !slowIds.has(row.id)) return false;
      if (onlyBare && !bareIds.has(row.id)) return false;
      /* Les deux valeurs les plus lourdes, ouvertes ensemble depuis le bas de
         la rangée : la liste se resserre sur ces deux rubriques, et sur elles
         seules. */
      if (asidePair.length > 0
        && !asidePair.includes((row.rubrique || '').trim())) return false;
      /* Les rubriques que les trois plus lourdes laissent de côté, ouvertes
         depuis leur compte : la liste se resserre sur elles seules. */
      if (asideLeft.length > 0
        && !asideLeft.includes((row.rubrique || '').trim())) return false;
      if (rubFiltered && (row.rubrique || '').trim() !== rubFiltered) return false;
      /* Les autres rubriques d'origine : la valeur qu'on corrige s'écarte, et
         seuls les dépôts hors type d'une autre valeur restent à l'écran. */
      if (originsRest
        && !(rubriqueHorsType(row) && (row.rubrique || '').trim() !== originsRest)) return false;
      if (periodWindow && !inRange(row.created_at, periodWindow)) return false;
      if (attention && !needsAction(row)) return false;
      if (stale && !isStale(row)) return false;
      if (motifPick !== null && (row.motif || '').trim() !== motifPick) return false;
      if (status !== 'all' && row.statut !== status) return false;
      if (wilaya && row.wilaya !== wilaya) return false;
      if (pays && paysDe(row) !== pays) return false;
      if (!needle) return true;
      const haystack = [row.titre, row.description, row.commune, row.wilaya, row.organisation]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
    return matched.sort((a, b) => {
      /* Refusals come first, grouped by how often their reason recurs. */
      const refuseA = a.statut === 'refuse' ? 0 : 1;
      const refuseB = b.statut === 'refuse' ? 0 : 1;
      if (refuseA !== refuseB) return refuseA - refuseB;
      if (a.statut === 'refuse' && b.statut === 'refuse') {
        const rankA = motifRank.get((a.motif || '').trim()) ?? Number.MAX_SAFE_INTEGER;
        const rankB = motifRank.get((b.motif || '').trim()) ?? Number.MAX_SAFE_INTEGER;
        if (rankA !== rankB) return rankA - rankB;
      }
      /* « Qui attend une réponse » : les offres dont les candidatures n'ont
         pas encore été ouvertes remontent, la plus chargée d'abord ; les
         autres gardent l'ordre de dépôt. */
      if (sort === 'unread') {
        const unreadA = cands?.unread[a.id] ?? 0;
        const unreadB = cands?.unread[b.id] ?? 0;
        if (unreadA !== unreadB) return unreadB - unreadA;
      }
      /* Grouped by country: the order of the country select, then the chosen
         order inside each block, so a country reads as one pile. */
      if (sort === 'pays') {
        const gap = (paysRank.get(paysDe(a)) ?? 999) - (paysRank.get(paysDe(b)) ?? 999);
        if (gap !== 0) return gap;
      }
      if (sort === 'old') return stampOf(a.created_at) - stampOf(b.created_at);
      if (sort === 'updated') return stampOf(b.updated_at) - stampOf(a.updated_at);
      return stampOf(b.created_at) - stampOf(a.created_at);
    });
  }, [tabList, status, wilaya, pays, query, sort, attention, stale, motifPick, motifRank, periodWindow, paysRank, cands, onlySlow, slowIds, onlyBare, bareIds, rubPick, originsRest, asidePair, asideLeft]);

  const resetFilters = () => {
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    patchFilters({
      status: 'all', query: '', wilaya: '', pays: '', period: 'all', attention: false, stale: false,
      rubrique: '', originsRest: '', originsRestFrom: '',
    });
  };

  /**
   * La porte de la réactivité : un clic resserre la liste sur les offres qui
   * répondent en plus de 48 h — celles où la réponse est due — et mène droit
   * aux lignes, pas à un tableau à filtrer soi-même.
   */
  const showSlow = () => {
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(true);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /**
   * La porte des offres à compléter : un clic resserre la liste sur celles qui
   * n'ont ni candidature ni salaire, et mène droit aux lignes — chacune ouvre
   * sa modification, le curseur déjà dans le champ du salaire.
   */
  const showBare = () => {
    const next = !onlyBare;
    setMotifPick(null);
    setOnlySlow(false);
    setOnlyBare(next);
    if (!next) return;
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /**
   * La série des rubriques hors type : le premier dépôt s'ouvre, curseur dans
   * sa rubrique, la file des suivants en réserve. La série se corrige d'un
   * seul parcours, sans repasser par le tableau entre deux enregistrements.
   */
  const startRubriqueWalkFor = (kind: ListingKind) => {
    const series = kind === 'annonce' ? horsTypeByKind.annonce : horsTypeByKind.offre;
    const first = series[0];
    if (!first) return;
    setOnlyBare(false);
    setOnlySlow(false);
    setMotifPick(null);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    patchTabFilters(kind, {
      status: 'all', query: '', wilaya: '', pays: '', period: 'all', attention: false, stale: false,
      rubrique: '',
    });
    if (kind !== tab) rememberTab(kind);
    setFocusId(first.id);
    startEdit(first, 'rubrique');
    setChainIds(series.slice(1).map((row) => row.id));
    setChainMode('rubrique');
  };

  /** Le dépôt hors type qui suit celui-ci dans sa propre série. */
  const nextHorsType = (row: ListingRow) => {
    const series = row.kind === 'annonce' ? horsTypeByKind.annonce : horsTypeByKind.offre;
    const at = series.findIndex((item) => item.id === row.id);
    return at >= 0 ? series[at + 1] ?? null : null;
  };

  /** Ce qui reste dans la série après le dépôt ouvert par la porte du suivant :
   *  le compte se lit sous elle, pour savoir combien de visites attendent
   *  encore, sans compter sur la liste. */
  const horsTypeAfter = (row: ListingRow) => {
    const series = row.kind === 'annonce' ? horsTypeByKind.annonce : horsTypeByKind.offre;
    const at = series.findIndex((item) => item.id === row.id);
    return at < 0 ? 0 : Math.max(0, series.length - at - 2);
  };

  /** La porte sous la ligne de série : elle ouvre directement le dépôt suivant
   *  hors type, sans repasser par le premier de la file. */
  const openNextHorsType = (row: ListingRow) => {
    const series = row.kind === 'annonce' ? horsTypeByKind.annonce : horsTypeByKind.offre;
    const at = series.findIndex((item) => item.id === row.id);
    if (at < 0 || at + 1 >= series.length) return;
    const next = series[at + 1];
    setRubriqueFor(null);
    startEdit(next, 'rubrique');
    setChainIds(series.slice(at + 2).map((item) => item.id));
    setChainMode('rubrique');
    setFocusId(next.id);
  };

  /**
   * La porte d'une rubrique d'origine : un clic resserre la liste sur les
   * dépôts de cette seule valeur — tous les « CDI rangés en annonce » — sur
   * l'onglet de leur famille, en effaçant les filtres qui les cacheraient.
   * Le resserrement se garde d'une visite à l'autre, comme le tri et les
   * filtres : un second clic sur la même porte rend la liste entière.
   */
  const openRubriqueOrigin = (kind: ListingKind, value: string) => {
    const cle = value.trim();
    if (!cle) return;
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setFocusId(null);
    setNotice('');
    setFailure('');
    const again = kind === tab && rubPick === cle;
    patchTabFilters(kind, {
      status: 'all', query: '', wilaya: '', pays: '', period: 'all',
      attention: false, stale: false, rubrique: again ? '' : cle, originsRest: '',
    });
    if (kind !== tab) rememberTab(kind);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /**
   * Le jeton de famille de la ligne « après la série » : un clic resserre la
   * liste sur les **autres** rubriques d'origine de cette famille — celles que
   * la série ne corrige pas — sur l'onglet de leur famille, filtres effacés.
   * Un second clic sur le même jeton rend la liste entière. Le resserrement se
   * garde d'une visite à l'autre, comme la rubrique retenue.
   */
  const openOriginsRest = (kind: ListingKind, value: string, from: 'family' | 'end' = 'end') => {
    const cle = value.trim();
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setFocusId(null);
    setNotice('');
    setFailure('');
    const again = kind === tab && originsRest.trim() === cle;
    patchTabFilters(kind, {
      status: 'all', query: '', wilaya: '', pays: '', period: 'all',
      attention: false, stale: false, rubrique: '',
      originsRest: again ? '' : cle,
      originsRestFrom: again ? '' : from,
    });
    if (kind !== tab) rememberTab(kind);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /**
   * La même porte, ouverte depuis une famille du rappel hors type : elle
   *  écarte la rubrique d'origine la plus habitée de cette famille et ne
   *  garde que ses autres valeurs — celles que la série ne corrige pas
   *  d'abord. Un second clic rend la liste entière.
   */
  const openOriginsRestForFamily = (kind: ListingKind) => {
    const top = horsTypeOrigins[kind][0];
    if (!top) return;
    openOriginsRest(kind, top.value, 'family');
  };

  /**
   * La petite gomme du compte de l'oubli : elle remet le compte à zéro et
   *  efface le jour du dernier geste, sans toucher au rappel ni à sa porte.
   */
  const eraseUndoCount = () => {
    resetUndoCount();
    setNotice(t('acct.mine.rubriqueUndoResetDone'));
  };

  /**
   * La porte posée sous le jeton de rubrique : elle ouvre le premier dépôt de
   *  cette rubrique, curseur dans sa rubrique, la suite de la série en
   *  réserve — la correction se fait sans repasser par le tableau.
   */
  const fixFirstOfRubPick = () => {
    const first = rubPickFirstHors;
    if (!first) return;
    setRubriqueFor(null);
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    startEdit(first, 'rubrique');
    const series = first.kind === 'annonce' ? horsTypeByKind.annonce : horsTypeByKind.offre;
    const at = series.findIndex((item) => item.id === first.id);
    setChainIds(at >= 0 ? series.slice(at + 1).map((item) => item.id) : []);
    setChainMode('rubrique');
    setFocusId(first.id);
  };

  /**
   * La croix posée sur la porte du premier dépôt : elle saute au dernier dépôt
   *  de la série, pour corriger en commençant par la fin — la file se déroule
   *  ensuite vers le haut, dépôt par dépôt, sans repasser par le tableau.
   */
  const fixLastOfRubPick = () => {
    const series = rubPickFixSeries;
    const last = series[series.length - 1];
    if (!last) return;
    setRubriqueFor(null);
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    startEdit(last, 'rubrique');
    const at = series.findIndex((item) => item.id === last.id);
    /* La série se remonte : les dépôts qui précèdent celui-ci attendent, du
       plus proche au plus ancien. */
    setChainIds(at > 0 ? series.slice(0, at).reverse().map((item) => item.id) : []);
    setChainMode('rubrique');
    setFocusId(last.id);
  };

  /**
   * La petite gomme du rappel : elle efface la rubrique d'origine retenue sur
   *  les deux familles d'un seul clic, et chaque liste retrouve son étendue.
   */
  const eraseRubriquePicks = () => {
    /* Ce que la gomme efface se garde : la porte du rappel le remettra en
       place, famille par famille. */
    const before = {
      annonce: (memory.byTab.annonce.rubrique || '').trim(),
      offre: (memory.byTab.offre.rubrique || '').trim(),
    };
    if (before.annonce || before.offre) setLastErase(before);
    /* Un nouvel effacement remplace l'ancien : l'oubli gardé n'a plus d'objet. */
    setForgottenErase(null);
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setNotice('');
    setFailure('');
    patchTabFilters('annonce', { rubrique: '' });
    patchTabFilters('offre', { rubrique: '' });
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /**
   * Le second geste de la gomme : elle efface les rubriques retenues des deux
   *  familles et rouvre la liste entière sur l'onglet où le travail attend —
   *  celui qui compte le plus de dépôts à traiter ou hors type.
   */
  const eraseRubriquePicksAndGo = () => {
    const before = {
      annonce: (memory.byTab.annonce.rubrique || '').trim(),
      offre: (memory.byTab.offre.rubrique || '').trim(),
    };
    if (before.annonce || before.offre) setLastErase(before);
    /* Un nouvel effacement remplace l'ancien : l'oubli gardé n'a plus d'objet. */
    setForgottenErase(null);
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setPicked([]);
    setQuickConfirm(false);
    setBulkIds(null);
    setNotice('');
    setFailure('');
    patchTabFilters('annonce', { rubrique: '' });
    patchTabFilters('offre', { rubrique: '' });
    patchTabFilters(workTab, {
      status: 'all', query: '', wilaya: '', pays: '', period: 'all',
      attention: false, stale: false, rubrique: '',
    });
    if (workTab !== tab) rememberTab(workTab);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /**
   * La porte du rappel : elle remet en place les rubriques que la gomme vient
   *  d'effacer, sur les deux familles, sans toucher au pays, à la période ni au
   *  tri — le resserrement retrouvé se défait d'un geste comme il s'est perdu.
   */
  const restoreRubriquePicks = () => {
    if (!lastErase) return;
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setPicked([]);
    setQuickConfirm(false);
    setBulkIds(null);
    setNotice('');
    setFailure('');
    patchTabFilters('annonce', { rubrique: lastErase.annonce });
    patchTabFilters('offre', { rubrique: lastErase.offre });
    setLastErase(null);
    /* Les rubriques sont remises : l'oubli gardé de côté n'a plus d'objet. */
    setForgottenErase(null);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /**
   * La croix du rappel : elle oublie le dernier effacement et retire sa
   *  porte, sans rien remettre en place — les rubriques restent effacées,
   *  seul le rappel s'efface.
   */
  const forgetLastErase = () => {
    /* L'oubli ne perd rien : il se garde de côté, et sa porte le défait. */
    if (lastErase) setForgottenErase(lastErase);
    setLastErase(null);
    setNotice(t('acct.mine.rubriqueRestoreForgot'));
  };

  /**
   * La porte de l'oubli : elle remet le rappel et sa croix en place, pour
   *  revenir sur un oubli d'un seul clic — les rubriques, elles, restent
   *  effacées, et la liste garde son étendue.
   */
  const restoreForgottenErase = () => {
    if (!forgottenErase) return;
    /* Le temps que l'oubli a tenu se mesure avant que le rappel ne revienne
       en place : le compte le dit à côté du jour du geste. */
    const heldFrom = stampOf(forgottenErase.forgotAt ?? '') || stampOf(forgottenErase.at ?? '');
    const held = heldFrom > 0 ? Math.max(0, Date.now() - heldFrom) : 0;
    setLastErase(forgottenErase);
    setForgottenErase(null);
    /* Le geste se compte, avec son jour et les rubriques que l'effacement
       retirait : la porte du compte rouvre la valeur qui tire la série. */
    noteUndoRestored(held, forgottenErase);
    setNotice(t('acct.mine.rubriqueRestoreUndone'));
  };

  /**
   * La rubrique corrigée d'un clic : la valeur choisie dans la bonne famille
   * s'écrit directement, le dépôt repasse en relecture comme après toute
   * modification — sans ouvrir le formulaire entier pour un seul champ.
   */
  const applyRubrique = async (row: ListingRow, value: string) => {
    if (!value) return;
    setRubriqueBusy(row.id);
    setFailure('');
    setNotice('');
    try {
      const { error: updateError } = await supabase
        .from('paperatlas_annonces')
        .update({ rubrique: value, statut: 'en_attente', updated_at: new Date().toISOString() })
        .eq('id', row.id);
      if (updateError) throw updateError;
      setRubriqueFor(null);
      setNotice(t('acct.mine.rubriqueQuickDone'));
      await reload();
    } catch {
      setFailure(t('acct.mine.rubriqueQuickErr'));
    } finally {
      setRubriqueBusy('');
    }
  };

  /** Le brouillon d'un dépôt commencé s'efface sur demande, sans toucher au reste. */
  const eraseDraft = () => {
    clearBrouillon(tab);
    setDraft(null);
    setRepris(null);
    setNotice(t('acct.mine.draftCleared'));
  };

  /**
   * The « à traiter » chip is the filter itself: click to show only what waits on
   * the owner, click again to go back to the whole tab.
   */
  const toggleAttention = () => {
    if (attention) {
      patchFilters({ attention: false });
      return;
    }
    if (attentionTotal === 0) return;
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    /* Nothing to fix here but something on the other tab: land where the work is. */
    if (attentionCount === 0 && otherTabAttention > 0) {
      rememberTab(tab === 'annonce' ? 'offre' : 'annonce');
    }
    /* « À traiter » is a state of its own: keep it from fighting a status chip. */
    patchFilters({ attention: true, status: 'all', stale: false });
  };

  /**
   * The « anciens » chip filters the deposits the owner has let sit for a week:
   * click to keep only those, click again to go back to the whole tab.
   */
  const toggleStale = () => {
    if (stale) {
      patchFilters({ stale: false });
      return;
    }
    if (staleTotal === 0) return;
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    /* Nothing old here but something on the other tab: land where the backlog is. */
    if (staleCount === 0 && otherTabStale > 0) {
      rememberTab(tab === 'annonce' ? 'offre' : 'annonce');
    }
    /* A backlog filter replaces the other filters rather than stacking on them. */
    patchFilters({
      stale: true, attention: false, status: 'all',
    });
  };

  /** Clicking the active counter clears the filter: one control, two states. */
  const pickStatus = (next: ListingStatut) => {
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    patchFilters({ status: status === next ? 'all' : next, attention: false, stale: false });
  };

  /**
   * The « publiés » chip filters the open tab the same way: click to keep only
   * the live deposits, click again to go back to the whole tab.
   */
  const togglePublished = () => {
    if (status === 'publie') {
      patchFilters({ status: 'all' });
      return;
    }
    if (publishedTotal === 0) return;
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    /* Nothing live here but something on the other tab: land where it is. */
    if (stats.publie === 0 && otherTabPublished > 0) {
      rememberTab(tab === 'annonce' ? 'offre' : 'annonce');
    }
    patchFilters({
      status: 'publie', attention: false, stale: false,
    });
  };

  /** Jump straight to the reason of the most recent refusal, whatever the tab. */
  const showLatestRefusal = () => {
    if (!latestRefused) return;
    setEditing(null);
    setConfirmId(null);
    setBulkIds(null);
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setPicked([]);
    setQuickConfirm(false);
    setNotice('');
    setFailure('');
    if (latestRefused.kind !== tab) rememberTab(latestRefused.kind);
    patchFilters({
      status: 'all', query: '', wilaya: '', pays: '', period: 'all', attention: false, stale: false,
    });
    setFocusId(latestRefused.id);
  };

  const switchTab = (next: Tab) => {
    rememberTab(next);
    /* Les resserrements du jeton ne suivent pas la famille : les rubriques
       d’une liste lue ne disent rien de l’autre, et le compte « hors de la
       liste » se remet à zéro plutôt que de lire les rubriques d’à côté. */
    setAsideLeft([]);
    setAsideLeftOut(null);
    setAsideLeftOutTaken([]);
    setAsidePair([]);
    /* Chaque onglet garde sa propre rubrique retenue : celle d'une famille ne
       s'applique jamais à l'autre, et se retrouve au retour. */
    setEditing(null);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setConfirmId(null);
    setBulkIds(null);
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setPicked([]);
    setQuickConfirm(false);
    setFocusId(null);
    setNotice('');
    setFailure('');
  };

  const day = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'medium' }).format(date);
  };

  /** La référence du dépôt, telle qu'elle se cite : le préfixe suit son type. */
  const refOf = (row: ListingRow) =>
    row.kind === 'offre' ? referenceFor(row.id) : annonceReferenceFor(row.id);

  /** Un message de signalement déjà adressé, la référence du dépôt citée :
   *  rien ne part tant que le propriétaire ne l'envoie pas lui-même. */
  const signalHrefOf = (row: ListingRow) => {
    const ref = refOf(row);
    const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
    return `mailto:contact@paperatlas-dz.com?subject=${encodeURIComponent(
      `${t('acct.mine.signalSubject')} · ${ref}`,
    )}&body=${encodeURIComponent(
      t('acct.mine.signalBody')
        .replace('{ref}', ref)
        .replace('{title}', row.titre)
        .replace('{url}', `${base}/compte#my-listings`),
    )}`;
  };

  /** Le recours propre à un dépôt refusé n'est plus un courrier : il ouvre
   *  directement le formulaire d'édition du dépôt, le motif du refus rappelé
   *  en tête. Corriger et renvoyer en relecture se fait d'un seul geste. */
  /** A duration in plain words: « 3 jours », « 5 heures », « moins d’une heure ». */
  const span = (elapsed: number) => {
    if (elapsed < HOUR_MS) return t('acct.mine.lessHour');
    const days = Math.floor(elapsed / DAY_MS);
    if (days >= 1) return `${days} ${t(days > 1 ? 'acct.mine.dayMany' : 'acct.mine.dayOne')}`;
    const hours = Math.max(1, Math.floor(elapsed / HOUR_MS));
    return `${hours} ${t(hours > 1 ? 'acct.mine.hourMany' : 'acct.mine.hourOne')}`;
  };

  /** Depuis combien de temps une valeur nommée reste hors de l'écran : le jour
   *  où elle en est sortie se garde sur l'appareil, et le temps se dit en mots
   *  — « 3 jours », « moins d'une heure ». Une valeur dont le jour n'est pas
   *  encore gardé se tait plutôt que de deviner. */
  const asideAgeOf = (value: string) => {
    const since = stampOf(memory.sharedAsideSince[value] ?? '');
    if (!since) return '';
    return span(Math.max(0, Date.now() - since));
  };

  /** How long a pending deposit has been waiting, in plain words. */
  const reviewAge = (row: ListingRow) => {
    const since = Math.max(stampOf(row.created_at), stampOf(row.updated_at));
    if (!since) return '';
    return span(Date.now() - since);
  };

  /**
   * Depuis combien de jours cette offre n’a plus reçu de candidature. Une offre
   * encore en relecture, ou un relevé muet, ne disent rien : zéro. La date de
   * mise en ligne sert de départ quand aucune candidature n’est jamais arrivée.
   */
  const candIdleDays = (row: ListingRow) => {
    if (!cands || row.kind !== 'offre' || row.statut !== 'publie') return 0;
    const since = cands.lastAt[row.id] || stampOf(row.created_at);
    if (!since) return 0;
    const elapsed = Date.now() - since;
    return elapsed >= CAND_IDLE_MS ? Math.floor(elapsed / DAY_MS) : 0;
  };

  const startEdit = (row: ListingRow, focus: 'titre' | 'budget' | 'rubrique' | null = null) => {
    setRubriqueFor(null);
    setEditing(row.id);
    setConfirmId(null);
    setNotice('');
    setFailure('');
    setDescLen(row.description.length);
    setEditPays(paysDe(row));
    armChain(row);
    if (focus) setEditFocus({ id: row.id, field: focus });
  };

  /**
   * La file des offres à compléter qui suivent celle qu'on ouvre : une offre
   * sans candidature ni salaire garde ses voisines en réserve, pour qu'après
   * l'enregistrement la suivante s'ouvre sans repasser par le tableau.
   */
  function armChain(row: ListingRow) {
    if (bareIds.has(row.id)) {
      const ids = bareOffres.map((item) => item.id);
      const at = ids.indexOf(row.id);
      setChainMode('bare');
      setChainIds(at >= 0 ? ids.slice(at + 1) : []);
      return;
    }
    /* La rubrique enregistrée vient de l'autre famille : la visite enchaîne
       sur les dépôts du même défaut, le curseur dans leur rubrique. */
    if (rubriqueHorsType(row)) {
      const ids = horsType.map((item) => item.id);
      const at = ids.indexOf(row.id);
      setChainMode('rubrique');
      setChainIds(at >= 0 ? ids.slice(at + 1) : []);
      return;
    }
    setChainMode(null);
    setChainIds([]);
  }

  /* Arrivée depuis un repère de la ligne : la page défile jusqu'au champ visé
     et y pose le curseur — le salaire quand c'est lui qui manque, le titre
     quand c'est l'offre entière qui s'est tue, la rubrique quand c'est elle
     qui vient de l'autre famille. */
  useEffect(() => {
    if (!editFocus) return;
    const prefix = editFocus.field === 'titre'
      ? 'min-t'
      : editFocus.field === 'budget' ? 'min-b' : 'min-r';
    const input = document.getElementById(`${prefix}-${editFocus.id}`) as HTMLInputElement | null;
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
      input.classList.add('is-jumped');
      window.setTimeout(() => input.classList.remove('is-jumped'), 1800);
    }
    setEditFocus(null);
  }, [editFocus, editing]);

  const cancelEdit = () => {
    setEditing(null);
    setChainIds([]);
    setChainMode(null);
    setFailure('');
  };

  /**
   * Ce qu'ouvre Entrée sur un dépôt mis en avant : sa fiche publique quand il
   * est en ligne, son formulaire de correction sinon — la ligne ne mène jamais
   * à un bouton déjà pris au clavier.
   */
  const openRow = (row: ListingRow) => {
    if (row.statut === 'publie') {
      navigate(row.kind === 'offre' ? `/emplois/${row.id}` : `/annonces/${row.id}`);
      return;
    }
    startEdit(row);
  };

  /* Une liste qui change de contenu, d'onglet ou de filtre ne garde pas sa mise
     en avant : la ligne désignée n'y est peut-être plus. */
  const rowsKey = list.map((row) => row.id).join(',');
  useEffect(() => {
    setKeyed(-1);
  }, [rowsKey, tab]);

  /* Le dépôt mis en avant reste sous les yeux : la liste défile juste assez
     pour le garder dans le cadre. */
  useEffect(() => {
    if (keyed < 0) return;
    listRef.current?.querySelector('.mine-row.is-keyed')?.scrollIntoView({ block: 'nearest' });
  }, [keyed]);

  /**
   * Le même geste que les autres listes du site : les flèches haut et bas
   * parcourent les dépôts (le geste boucle d'un bout à l'autre), Entrée ouvre
   * celui qui est mis en avant, Échap rend la liste au repos. Les actions de
   * la ligne — modifier, supprimer, signaler — gardent leurs touches à elles.
   */
  const onListKey = (event: KeyboardEvent<HTMLUListElement>) => {
    if (list.length === 0) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setKeyed((current) => {
        if (event.key === 'ArrowDown') return current < list.length - 1 ? current + 1 : 0;
        return current > 0 ? current - 1 : list.length - 1;
      });
      return;
    }
    if (event.key === 'Escape') {
      setKeyed(-1);
      return;
    }
    if (event.key !== 'Enter') return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('button, a, input, textarea, select, label, form')) return;
    const chosen = list[keyed];
    if (!chosen) return;
    event.preventDefault();
    openRow(chosen);
  };

  const onSave = async (event: FormEvent<HTMLFormElement>, row: ListingRow) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const titre = String(data.get('titre') || '').trim();
    const description = String(data.get('description') || '').trim();
    if (!titre || !description) {
      setFailure(t('dep.errRequired'));
      return;
    }
    if (description.length > 500) {
      setFailure(t('dep.errLong'));
      return;
    }

    setBusy(true);
    setFailure('');
    try {
      /* Any edit sends the deposit back for review: it cannot republish itself. */
      const { error: updateError } = await supabase
        .from('paperatlas_annonces')
        .update({
          titre,
          description,
          budget: String(data.get('budget') || '').trim() || null,
          pays: String(data.get('pays') || '').trim() || PAYS_DEFAUT,
          wilaya: String(data.get('wilaya') || '').trim() || null,
          commune: String(data.get('commune') || '').trim() || null,
          rubrique: String(data.get('rubrique') || '').trim() || null,
          statut: 'en_attente',
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      if (updateError) throw updateError;
      const chained = data.get('chain') === '1';
      setEditing(null);
      await reload();
      if (chained) {
        /* La visite continue : l'offre suivante s'ouvre d'elle-même, le
           curseur déjà dans le salaire — le tableau n'est pas rouvert. */
        const nextId = chainIds.find((id) => id !== row.id && rows.some((item) => item.id === id));
        if (nextId) {
          const at = chainIds.indexOf(nextId);
          const rest = chainIds.slice(at + 1);
          const next = rows.find((item) => item.id === nextId);
          setChainIds(rest);
          if (next) {
            setEditing(next.id);
            setEditFocus({
              id: next.id,
              field: chainMode === 'rubrique' ? 'rubrique' : 'budget',
            });
            setDescLen(next.description.length);
            setEditPays(paysDe(next));
            setFocusId(next.id);
          }
          setNotice(rest.length > 0
            ? `${t(chainMode === 'rubrique' ? 'acct.mine.rubriqueChained' : 'acct.mine.chained')} ${t(chainMode === 'rubrique' ? 'acct.mine.rubriqueChainRest' : 'acct.mine.chainRest').replace('{n}', String(rest.length))}`
            : t(chainMode === 'rubrique' ? 'acct.mine.rubriqueChainEnd' : 'acct.mine.chainEnd'));
        } else {
          setChainIds([]);
          setChainMode(null);
          setNotice(t(chainMode === 'rubrique' ? 'acct.mine.rubriqueChainEnd' : 'acct.mine.chainEnd'));
        }
      } else {
        setChainIds([]);
        setChainMode(null);
        setNotice(t('acct.mine.updated'));
        /* The deposit can move once the list is re-sorted: bring the reader
           straight back to the row they just edited. */
        setFocusId(row.id);
      }
    } catch {
      setFailure(t('acct.mine.errSave'));
    } finally {
      setBusy(false);
    }
  };

  const onRepublish = async (row: ListingRow) => {
    setBusy(true);
    setFailure('');
    setNotice('');
    try {
      /* A refused deposit goes back to the review queue, never straight online. */
      const { error: updateError } = await supabase
        .from('paperatlas_annonces')
        .update({ statut: 'en_attente', updated_at: new Date().toISOString() })
        .eq('id', row.id);
      if (updateError) throw updateError;
      setConfirmId(null);
      setNotice(t('acct.mine.republished'));
      await reload();
    } catch {
      setFailure(t('acct.mine.errRepublish'));
    } finally {
      setBusy(false);
    }
  };

  /** The reason that recurs the most: flagged on its chip, unless another ties it. */
  const topMotif = useMemo(() => {
    if (motifGroups.length < 2) return null;
    const [first, second] = motifGroups;
    if (first.count < 2) return null;
    if (second && second.count === first.count) return null;
    return first.motif;
  }, [motifGroups]);

  /* A reason filter that no longer matches any refused deposit clears itself. */
  useEffect(() => {
    if (motifPick === null) return;
    if (!refusedRows.some((row) => (row.motif || '').trim() === motifPick)) setMotifPick(null);
  }, [motifPick, refusedRows]);
  /** The subset the owner ticked by hand, to republish only those. */
  const pickedRows = useMemo(
    () => refusedRows.filter((row) => picked.includes(row.id)),
    [refusedRows, picked],
  );

  const togglePick = (id: string) => {
    setBulkIds(null);
    setPicked((current) => (current.includes(id)
      ? current.filter((value) => value !== id)
      : [...current, id]));
  };

  /** One button, two states: tick every refused deposit, or clear the selection. */
  const togglePickAll = () => {
    setBulkIds(null);
    setPicked(pickedRows.length === refusedRows.length ? [] : refusedRows.map((row) => row.id));
  };

  /** Only the chosen deposits go back to review — never the whole tab by accident. */
  const onRepublishMany = async (ids: string[]) => {
    if (!ids.length) return;
    setBulkBusy(true);
    setFailure('');
    setNotice('');
    try {
      const { error: updateError } = await supabase
        .from('paperatlas_annonces')
        .update({ statut: 'en_attente', updated_at: new Date().toISOString() })
        .in('id', ids);
      if (updateError) throw updateError;
      setBulkIds(null);
      setPicked((current) => current.filter((id) => !ids.includes(id)));
      setQuickConfirm(false);
      setNotice(t('acct.mine.bulkDone'));
      await reload();
    } catch {
      setFailure(t('acct.mine.bulkErr'));
    } finally {
      setBulkBusy(false);
    }
  };

  const onDelete = async (row: ListingRow) => {
    setBusy(true);
    setFailure('');
    try {
      const { error: deleteError } = await supabase
        .from('paperatlas_annonces')
        .delete()
        .eq('id', row.id);
      if (deleteError) throw deleteError;
      setConfirmId(null);
      setNotice(t('acct.mine.deleted'));
      await reload();
    } catch {
      setFailure(t('acct.mine.errDelete'));
    } finally {
      setBusy(false);
    }
  };

  /** Les rubriques d'une famille, telles que le formulaire de dépôt les
   *  propose : la liste s'ouvre sous le repère, sans ouvrir ce formulaire. */
  const optionsFor = (kind: ListingKind) => (kind === 'annonce'
    ? annonceCats.map((c: AnnonceCat) => ({ value: c as string, label: t(CAT_KEY[c]) }))
    : contracts.map((c: Contract) => ({ value: c as string, label: t(CONTRACT_KEY[c]) })));

  const options = optionsFor(tab);

  /** Les dépôts de cet onglet déjà rangés dans chaque rubrique de la famille :
   *  le compte se lit dans la liste de correction, pour choisir la plus juste. */
  const rubriqueTally = useMemo(() => {
    const tally = new Map<string, number>();
    tabList.forEach((row) => {
      const cle = (row.rubrique || '').trim();
      if (cle) tally.set(cle, (tally.get(cle) ?? 0) + 1);
    });
    return tally;
  }, [tabList]);

  /** La rubrique la plus habitée de la famille ouverte : la note sous la liste
   *  la nomme avec son compte, et son jeton se distingue dans la rangée. */
  const rubriqueBest = options.reduce<{ value: string; label: string; n: number }>(
    (best, option) => {
      const n = rubriqueTally.get(option.value) ?? 0;
      return n > best.n ? { value: option.value, label: option.label, n } : best;
    },
    { value: '', label: '', n: 0 },
  );

  /** Le nom d'une rubrique, lu sur les deux familles : la valeur d'un ancien
   *  dépôt peut venir de l'autre, la liste la nomme quand même. */
  const labelOfRubrique = (value: string) => {
    const found = [...optionsFor('annonce'), ...optionsFor('offre')]
      .find((option) => option.value === value);
    return found ? found.label : value;
  };

  /** La rubrique d'origine des dépôts hors type, famille par famille : une
   *  annonce rangée en contrat, ou l'inverse. Le rappel la nomme à côté de
   *  chaque porte, avec son compte, pour voir d'où vient le décalage. */
  const horsTypeOrigins = useMemo(() => {
    const tally = (series: ListingRow[]) => {
      const counts = new Map<string, number>();
      series.forEach((row) => {
        const cle = (row.rubrique || '').trim();
        if (!cle) return;
        counts.set(cle, (counts.get(cle) ?? 0) + 1);
      });
      return Array.from(counts.entries())
        .map(([value, n]) => ({ value, n, label: labelOfRubrique(value) }))
        .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
    };
    return {
      annonce: tally(horsTypeByKind.annonce),
      offre: tally(horsTypeByKind.offre),
    };
  }, [horsTypeByKind, options]);

  /** Les valeurs d'origine qui reviennent dans les deux familles à la fois :
   *  la même valeur range des dépôts d'annonce et d'offre. Son compte se lit
   *  de chaque côté, pour voir ce que la corriger d'une famille laisserait
   *  intacte dans l'autre. */
  const sharedOrigins = useMemo(() => {
    const offreCounts = new Map(horsTypeOrigins.offre.map((origin) => [origin.value, origin.n]));
    return horsTypeOrigins.annonce
      .filter((origin) => offreCounts.has(origin.value))
      .map((origin) => ({
        value: origin.value,
        label: origin.label,
        annonce: origin.n,
        offre: offreCounts.get(origin.value) ?? 0,
      }))
      .sort((a, b) => (b.annonce + b.offre) - (a.annonce + a.offre)
        || a.label.localeCompare(b.label));
  }, [horsTypeOrigins]);

  /** Les valeurs partagées, en mots : le survol les cite avec leurs deux
   *  comptes, famille par famille. */
  const sharedOriginsTxt = sharedOrigins
    .map((origin) => `${origin.label} · ${sharedSidesLine(lang, origin)}`)
    .join(' — ');

  /** La copie groupée des valeurs partagées : toutes les valeurs d'un coup,
   *  une ligne chacune — un relevé prêt à coller dans un message. */
  const sharedCopyAllTxt = sharedCopyLines(lang, sharedOrigins);

  /** Le nom de la famille ouverte, en mots : « annonces » ou « offres ».
   *  La copie d'une seule famille s'en sert pour se nommer. */
  const tabFamily = t(tab === 'annonce'
    ? 'acct.mine.rubriqueFamilyAnnonce'
    : 'acct.mine.rubriqueFamilyOffre');

  /** La copie d'une seule famille : les mêmes valeurs partagées, mais avec le
   *  seul compte de l'onglet ouvert — l'autre côté reste hors du texte. */
  const sharedCopyFamilyTxt = sharedFamilyLines(lang, sharedOrigins, tab);

  /** Le relevé dans l'autre langue : la langue choisie sur la pastille, ou,
   *  à défaut de choix, celle qui suit au sélecteur. Les noms de rubriques
   *  restent tels qu'ils s'affichent ici — un message bilingue se copie sans
   *  quitter la page. */
  const otherLang = memory.sharedTarget || NEXT_LANG[lang];
  const otherLangName = t(LANG_NAME_KEY[otherLang]);
  /* La langue que le sélecteur de la page donnerait, et celle que la pastille
     garde : quand les deux divergent, la pastille le dit — on ne copie jamais
     dans une langue qu'on n'attendait pas. */
  const autoLang = NEXT_LANG[lang];
  const langKeptOff = Boolean(memory.sharedTarget) && memory.sharedTarget !== autoLang;
  const autoLangName = t(LANG_NAME_KEY[autoLang]);
  const sharedCopyOtherTxt = sharedCopyLines(otherLang, sharedOrigins);

  /** Ce que la pastille de copie a déjà emporté dans cette langue : le compte
   *  se garde sur l'appareil, et se lit à côté du nombre prêt à partir. */
  const otherLangTaken = memory.sharedCopied[otherLang] ?? 0;

  /** Le relevé compact : toutes les valeurs sur une seule ligne, séparées par
   *  le signe choisi sur la pastille — le message le plus court qui dit
   *  encore tout. Le choix se garde sur l'appareil. */
  const sharedCopyCompactTxt = sharedCompactLines(lang, sharedOrigins, memory.sharedSep);

  /** La longueur de la ligne qui partira : le lecteur sait d'un chiffre si le
   *  relevé tiendra sur une seule ligne de message. */
  const sharedCompactChars = sharedCopyCompactTxt.length;

  /** La limite retenue, gardée sur l'appareil : l'aperçu dit si la ligne tient
   *  dessous, et de combien de caractères elle la dépasse le cas échéant. */
  const sharedLimit = memory.sharedLimit;
  const sharedFits = sharedCompactChars <= sharedLimit;
  const sharedOver = Math.max(0, sharedCompactChars - sharedLimit);

  /** Le seuil qui suit dans le défilement 140 → 160 → 280 : le petit signe de
   *  l'aperçu y passe d'un seul clic, sans avoir à viser un chiffre. */
  const sharedLimitNext = nextSharedLimit(sharedLimit);

  /** Le seuil sous lequel la ligne courte est partie la dernière fois :
   *  gardé avec le compte des copies, il se lit sur la pastille compacte. */
  const sharedCompactLimitUsed = memory.sharedCompactLimit;

  /** Ce que la pastille compacte a déjà emporté : le compte se garde sur
   *  l'appareil, comme celui de la copie dans l'autre langue. */
  const sharedCompactCopies = memory.sharedCompactCopies || 0;

  /** Le seuil de repli automatique : au-delà de ce nombre de valeurs,
   *  l’aperçu se range de lui-même — le seuil reste réglable. */
  const sharedFoldAt = memory.sharedFoldAt;
  const sharedAutoFolded = sharedOrigins.length > sharedFoldAt;
  const previewFolded = previewFoldManual === null ? sharedAutoFolded : previewFoldManual;

  /** Le repli de l’aperçu se décide d’un clic : il se fige alors du côté
   *  choisi, et ce choix se garde sur l’appareil comme celui de la rangée. */
  const togglePreviewFold = () => setSharedPreviewFolded(!previewFolded);

  /** Ce que le récapitulatif a déjà emporté : son compte se garde avec ceux
   *  de la ligne, et se lit à côté de sa porte de copie. */
  const sharedRecapCopies = memory.sharedRecapCopies || 0;

  /** Le dernier séparateur réellement parti, avec son jour et la longueur
   *  que la ligne faisait alors : le récapitulatif les cite côte à côte,
   *  pour comparer deux envois par leur signe et par leur taille. */
  const sepUsed = memory.sharedSepLast && memory.sharedSepLastAt
    ? {
      sep: memory.sharedSepLast,
      day: day(memory.sharedSepLastAt),
      chars: memory.sharedSepLastChars,
    }
    : null;

  /** Le compte de la gomme des replis, et le jour de son dernier geste : il
   *  se lit à côté d'elle, gardé sur l'appareil comme les autres comptes. */
  const foldsErasedCount = memory.foldsErasedCount || 0;
  const foldsErasedDay = memory.foldsErasedLastAt ? day(memory.foldsErasedLastAt) : '';

  /** Les portes de gomme ouvertes depuis le début, tous comptes confondus :
   *  chaque petite porte garde son compte à part, et la ligne les additionne
   *  pour que la phrase copiée dise l'ampleur du geste sur les quatre gommes. */
  const eraseDoorOpensTotal = Object.values(memory.eraseDoorOpens)
    .reduce((total, opens) => total + (opens > 0 ? opens : 0), 0);

  /** Le compte et le jour des trois autres gommes de la ligne : elles se
   *  lisent comme celle des replis, d'un même geste. */
  const otherErasedCount = memory.otherErasedCount || 0;
  const otherErasedDay = memory.otherErasedLastAt ? day(memory.otherErasedLastAt) : '';
  const compactErasedCount = memory.compactErasedCount || 0;
  const compactErasedDay = memory.compactErasedLastAt ? day(memory.compactErasedLastAt) : '';
  const recapErasedCount = memory.recapErasedCount || 0;
  const recapErasedDay = memory.recapErasedLastAt ? day(memory.recapErasedLastAt) : '';

  /** La date du plus ancien geste de gomme encore en mémoire : parmi les
   *  quatre comptes de la ligne, celui dont le jour gardé est le plus ancien.
   *  Le récapitulatif copié le cite, pour qu'un collègue sache depuis quand la
   *  ligne porte la trace des gestes — un compte à zéro n'atteste rien. */
  const oldestEraseDay = (() => {
    const stamps = [
      foldsErasedCount > 0 ? stampOf(memory.foldsErasedLastAt) : 0,
      otherErasedCount > 0 ? stampOf(memory.otherErasedLastAt) : 0,
      compactErasedCount > 0 ? stampOf(memory.compactErasedLastAt) : 0,
      recapErasedCount > 0 ? stampOf(memory.recapErasedLastAt) : 0,
    ].filter((value) => value > 0);
    if (!stamps.length) return '';
    return day(new Date(Math.min(...stamps)).toISOString());
  })();

  /** Ce que la gomme des replis rendra à l'écran, famille de valeurs par
   *  famille : l'aperçu déplié, et les valeurs que la rangée gardait de
   *  côté, avec leurs comptes d'annonces et d'offres. */
  const foldsAsideValues = sharedListFolded
    ? sharedOrigins.slice(SHARED_LIST_FOLD_AT)
    : [];
  const foldsAsideSides = foldsAsideValues.reduce(
    (total, origin) => ({
      annonce: total.annonce + origin.annonce,
      offre: total.offre + origin.offre,
    }),
    { annonce: 0, offre: 0 },
  );

  /** Le nom des valeurs que la rangée repliée garde hors de l'écran, dans
   *  l'ordre de la rangée : sa porte les nomme en clair, sans attendre le
   *  survol, et le survol reprend la même liste. */
  const foldsAsideNames = foldsAsideValues.map((origin) => origin.label).join(' · ');

  /** Le temps cumulé que les valeurs tenues hors de l'écran y ont déjà passé :
   *  la somme de leurs durées, valeur par valeur. Le bas de la rangée repliée
   *  le dit d'un seul chiffre, sans avoir à lire chaque nom. */
  const asideTotalMs = foldsAsideValues.reduce((total, origin) => {
    const since = stampOf(memory.sharedAsideSince[origin.value] ?? '');
    return since > 0 ? total + Math.max(0, Date.now() - since) : total;
  }, 0);

  /** La valeur qui pèse le plus dans ce temps cumulé : celle restée dehors le
   *  plus longtemps. Elle se nomme à côté du total, pour que le chiffre dise
   *  aussi d'où il vient — sans relire chaque durée, valeur par valeur. Elle
   *  garde son nom et sa valeur : le petit signe posé au bas de la rangée
   *  l'ouvre directement dans la liste, sans passer par la porte de gomme. */
  const asideHeaviest = foldsAsideValues.reduce<{
    value: string; label: string; ms: number; annonce: number; offre: number;
  } | null>(
    (best, origin) => {
      const since = stampOf(memory.sharedAsideSince[origin.value] ?? '');
      if (!since) return best;
      const ms = Math.max(0, Date.now() - since);
      return !best || ms > best.ms
        ? {
          value: origin.value, label: origin.label, ms, annonce: origin.annonce, offre: origin.offre,
        }
        : best;
    },
    null,
  );

  /** La famille où cette valeur tient le plus de dépôts : la porte ouvre
   *  l'onglet qui la porte le plus dense, plutôt que de deviner. */
  const asideHeaviestKind: Tab = asideHeaviest && asideHeaviest.offre > asideHeaviest.annonce
    ? 'offre'
    : 'annonce';

  /** La part que cette valeur prend dans le temps cumulé, arrondie : le
   *  pourcentage se lit sans rapporter deux durées l'une à l'autre. */
  const asideHeaviestPct = asideHeaviest && asideTotalMs > 0
    ? Math.round((asideHeaviest.ms / asideTotalMs) * 100)
    : 0;

  /** Combien de dépôts la porte de la valeur la plus lourde ramènera : le
   *  compte de la famille où elle en tient le plus, lu sur la porte elle-même,
   *  avant le clic. */
  const asideHeaviestDeposits = asideHeaviest
    ? (asideHeaviestKind === 'annonce' ? asideHeaviest.annonce : asideHeaviest.offre)
    : 0;

  /** Les deux valeurs les plus lourdes du temps cumulé hors écran, la plus
   *  lourde en tête : le signe du bas de la rangée les ouvre ensemble, d'un
   *  seul clic. Une valeur sans jour gardé ne se devine pas. */
  const asideHeaviestTwo = useMemo(
    () => foldsAsideValues
      .map((origin) => {
        const since = stampOf(memory.sharedAsideSince[origin.value] ?? '');
        return {
          value: origin.value,
          label: origin.label,
          ms: since > 0 ? Math.max(0, Date.now() - since) : 0,
        };
      })
      .filter((origin) => origin.ms > 0)
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 2),
    [foldsAsideValues, memory.sharedAsideSince],
  );

  /** Leurs noms, tels que la porte et le jeton les citent. */
  const asideHeaviestTwoNames = asideHeaviestTwo.map((origin) => origin.label).join(' · ');

  /** Le temps que les deux valeurs les plus lourdes pèsent ensemble : le jeton
   *  du resserrement l'additionne, pour que le chiffre dise ce que les deux
   *  valeurs tiennent à elles seules, hors de l'écran. */
  const asideTwoMs = asideHeaviestTwo.reduce((total, origin) => total + origin.ms, 0);

  /** Les dépôts que ces deux valeurs tiennent hors de l'écran : la somme de
   *  leurs annonces et de leurs offres, lue sur la rangée repliée. Le
   *  récapitulatif copié le cite, avant que la liste ne se resserre. */
  const asideTwoDeposits = foldsAsideValues.reduce((total, origin) => (
    asideHeaviestTwo.some((two) => two.value === origin.value)
      ? total + origin.annonce + origin.offre
      : total
  ), 0);

  /** La part que ces deux valeurs prennent dans le temps cumulé, arrondie :
   *  le récapitulatif copié la cite, en pourcentage. */
  const asideTwoPct = asideTotalMs > 0 && asideTwoMs > 0
    ? Math.round((asideTwoMs / asideTotalMs) * 100)
    : 0;

  /** Les trois valeurs les plus lourdes du temps cumulé hors écran, la plus
   *  lourde en tête : le troisième signe du bas de la rangée les ouvre
   *  ensemble, d'un seul clic. Une valeur sans jour gardé ne se devine pas. */
  const asideHeaviestThree = useMemo(
    () => foldsAsideValues
      .map((origin) => {
        const since = stampOf(memory.sharedAsideSince[origin.value] ?? '');
        return {
          value: origin.value,
          label: origin.label,
          annonce: origin.annonce,
          offre: origin.offre,
          ms: since > 0 ? Math.max(0, Date.now() - since) : 0,
        };
      })
      .filter((origin) => origin.ms > 0)
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 3),
    [foldsAsideValues, memory.sharedAsideSince],
  );

  /** Leurs noms, tels que le signe et le jeton les citent. */
  const asideHeaviestThreeNames = asideHeaviestThree.map((origin) => origin.label).join(' · ');

  /** Les dépôts que ces trois valeurs ramèneront, famille par famille : le
   *  compte se lit sur le signe lui-même, avant le clic. */
  const asideThreeSides = asideHeaviestThree.reduce(
    (total, origin) => ({
      annonce: total.annonce + origin.annonce,
      offre: total.offre + origin.offre,
    }),
    { annonce: 0, offre: 0 },
  );
  const asideThreeDeposits = asideThreeSides.annonce + asideThreeSides.offre;

  /** Le temps que les trois valeurs les plus lourdes pèsent ensemble : le jeton
   *  du resserrement l'additionne, pour que le chiffre dise ce qu'elles
   *  tiennent à elles seules, hors de l'écran. */
  const asideThreeMs = asideHeaviestThree.reduce((total, origin) => total + origin.ms, 0);

  /** L’ouverture des trois valeurs est-elle en place ? Le signe s’affirme
   *  alors, et un second clic rend la liste entière. */
  const asideTrioOn = asideHeaviestThree.length > 2
    && asideHeaviestThree.every((origin) => asidePair.includes(origin.value));

  /** La plus légère des valeurs que le signe des deux plus lourdes laisse de
   *  côté : son survol la nomme, pour que l'ouverture des deux dise aussi ce
   *  qu'elle écarte. Une valeur sans jour gardé ne se devine pas. */
  const asideTwoLeftLightest = foldsAsideValues.reduce<{ label: string; ms: number } | null>(
    (lightest, origin) => {
      if (asideHeaviestTwo.some((two) => two.value === origin.value)) return lightest;
      const since = stampOf(memory.sharedAsideSince[origin.value] ?? '');
      if (!since) return lightest;
      const ms = Math.max(0, Date.now() - since);
      return !lightest || ms < lightest.ms ? { label: origin.label, ms } : lightest;
    },
    null,
  );

  /** La plus légère des valeurs que le signe des trois plus lourdes laisse de
   *  côté : son survol la nomme, pour que l'ouverture des trois dise aussi ce
   *  qu'elle écarte, comme le fait celui des deux. Une valeur sans jour gardé
   *  ne se devine pas. */
  const asideThreeLeftLightest = foldsAsideValues.reduce<{ label: string; ms: number } | null>(
    (lightest, origin) => {
      if (asideHeaviestThree.some((three) => three.value === origin.value)) return lightest;
      const since = stampOf(memory.sharedAsideSince[origin.value] ?? '');
      if (!since) return lightest;
      const ms = Math.max(0, Date.now() - since);
      return !lightest || ms < lightest.ms ? { label: origin.label, ms } : lightest;
    },
    null,
  );

  /** La part que ces trois valeurs prennent dans le temps cumulé, arrondie :
   *  le jeton du resserrement la cite, en pourcentage. */
  const asideThreePct = asideTotalMs > 0 && asideThreeMs > 0
    ? Math.round((asideThreeMs / asideTotalMs) * 100)
    : 0;

  /** Les rubriques que le signe des trois laisse encore hors de la liste, et
   *  leurs noms : le survol dit le compte à côté de la plus légère, et le
   *  récapitulatif copié les nomme. */
  const asideThreeLeftValues = foldsAsideValues.filter(
    (origin) => !asideHeaviestThree.some((three) => three.value === origin.value),
  );
  const asideThreeLeftCount = asideThreeLeftValues.length;
  const asideThreeLeftNames = asideThreeLeftValues.map((origin) => origin.label).join(' · ');
  /** Les valeurs de ces rubriques, telles que la porte les retient : la liste
   *  se resserre sur elles seules. */
  const asideThreeLeftPicks = asideThreeLeftValues.map((origin) => origin.value);

  /** Le compte de chaque rubrique laissée de côté, le temps qu'elle a déjà
   *  passé hors de l'écran et ce qu'elle tient dans chaque famille : le jeton
   *  du resserrement les porte un par un, jamais un total muet — et chaque
   *  nom est une porte. */
  const asideLeftEach = asideThreeLeftValues.map((origin) => {
    const since = stampOf(memory.sharedAsideSince[origin.value] ?? '');
    const ms = since > 0 ? Math.max(0, Date.now() - since) : 0;
    return {
      value: origin.value,
      label: origin.label,
      annonce: origin.annonce,
      offre: origin.offre,
      n: origin.annonce + origin.offre,
      ms,
      ago: ms > 0 ? span(ms) : '',
    };
  });

  /** L'ordre des pastilles : par temps passé dehors, ou par dépôts. La plus
   *  lourde dehors vient en tête par défaut — c'est elle qu'on corrige
   *  d'abord ; les valeurs dont le jour n'est pas gardé restent en fin de
   *  liste, sans qu'on devine leur durée. */
  const asideLeftOrdered = [...asideLeftEach].sort((a, b) => {
    if (asideLeftSort === 'ago') {
      return (b.ms - a.ms) || (b.n - a.n) || a.label.localeCompare(b.label);
    }
    return (b.n - a.n) || (b.ms - a.ms) || a.label.localeCompare(b.label);
  });

  /** Ce que les rubriques laissées de côté tiennent ensemble : la somme de
   *  leurs dépôts, à côté du temps cumulé qu'elles ont passé dehors. Le jeton
   *  le porte en tête, avant les pastilles. */
  const asideLeftTotalN = asideLeftEach.reduce((total, item) => total + item.n, 0);
  const asideLeftTotalMs = asideLeftEach.reduce((total, item) => total + item.ms, 0);
  const asideLeftTotalAgo = asideLeftTotalMs > 0 ? span(asideLeftTotalMs) : '';

  /** La rubrique restée le plus longtemps dehors : son nom ne se lit pas au
   *  milieu des durées — un petit repère la désigne, pour la repérer sans
   *  lire chaque temps. Une valeur sans jour gardé ne se devine pas. */
  const asideLeftHeaviest = asideLeftEach.reduce<
    { value: string; label: string; n: number; ms: number; ago: string } | null
  >(
    (heaviest, item) => {
      if (item.ms <= 0) return heaviest;
      return !heaviest || item.ms > heaviest.ms ? item : heaviest;
    },
    null,
  );

  /** Le détail des dépôts par rubrique laissée de côté, réuni pour la phrase
   *  copiée : chaque nom porte son compte et le temps qu'il a passé dehors,
   *  jamais un total seul. */
  const asideThreeLeftEachTxt = asideLeftEach
    .map((item) => [
      t('acct.mine.rubriqueSharedAsideLeftEach')
        .replace('{rub}', item.label)
        .replace('{n}', String(item.n)),
      item.ago
        ? t('acct.mine.rubriqueSharedAsideLeftEachAgo').replace('{ago}', item.ago)
        : '',
    ].filter(Boolean).join(' · '))
    .join(' — ');

  /** Les noms des rubriques retenues, lus sur l'état courant : quand une porte
   *  en garde une seule, le jeton la nomme elle seule. */
  const asideLeftNamesShown = asideLeft.map((value) => labelOfRubrique(value)).join(' · ');

  /** Les rubriques restées hors de la liste quand elle est resserrée sur celles
   *  qu’elle avait laissées de côté : leur nom et le temps qu’elles ont déjà
   *  passé dehors, la plus pesante en tête — le petit compte se lit sans
   *  relire chaque durée, et sa plus lourde se nomme d’elle-même. */
  const asideLeftOutValues = useMemo(() => {
    if (asideLeft.length === 0) return [] as { value: string; label: string; ms: number }[];
    const shown = new Set(list.map((row) => row.id));
    /* Les rubriques de l’onglet ouvert, telles qu’elles s’y déposent : une
       valeur retenue d’une autre famille n’y figure pas — le compte se
       remet donc à zéro en changeant d’onglet. */
    const present = new Set<string>();
    periodList.forEach((row) => {
      const cle = (row.rubrique || '').trim();
      if (cle) present.add(cle);
    });
    const values = new Set<string>();
    /* La porte ouverte, ses rubriques sont retenues : elles ne se recalculent
       plus, sinon elles quitteraient le compte qu’elles remplissent. */
    if (asideLeftOut) {
      asideLeftOut.forEach((value) => {
        if (present.has(value)) values.add(value);
      });
    } else {
      periodList.forEach((row) => {
        const cle = (row.rubrique || '').trim();
        if (cle && !shown.has(row.id)) values.add(cle);
      });
    }
    return Array.from(values)
      .map((value) => {
        const since = stampOf(memory.sharedAsideSince[value] ?? '');
        return {
          value,
          label: labelOfRubrique(value),
          ms: since > 0 ? Math.max(0, Date.now() - since) : 0,
        };
      })
      .sort((a, b) => (b.ms - a.ms) || a.label.localeCompare(b.label));
  }, [asideLeft, asideLeftOut, list, periodList, memory.sharedAsideSince, options]);

  /** Le compte des rubriques hors de la liste, et la plus pesante d’entre
   *  elles : le petit compte les nomme dans l’ordre du temps dehors. */
  const asideLeftOutRubriques = asideLeftOutValues.length;
  const asideLeftOutNames = asideLeftOutValues.map((item) => item.label).join(' · ');
  const asideLeftOutHeaviest = asideLeftOutValues.find((item) => item.ms > 0) ?? null;
  const asideLeftOutOn = Boolean(asideLeftOut && asideLeftOut.length > 0);

  /** Les dépôts de cette rubrique restée dehors, lus sur les deux familles :
   *  ceux dont la rubrique vient de l’autre famille passent devant — ce sont
   *  eux qu’il y a à corriger. La porte de la plus pesante ouvre le premier. */
  const asideLeftOutHeavyRows = useMemo(() => {
    const value = asideLeftOutHeaviest?.value ?? '';
    if (!value) return [] as ListingRow[];
    const owned = rows.filter((row) => (row.rubrique || '').trim() === value);
    const hors = owned.filter(rubriqueHorsType);
    return hors.length > 0 ? hors : owned;
  }, [asideLeftOutHeaviest, rows]);

  /** Ce que le petit compte ramènera à l’écran quand on le presse : les
   *  dépôts des rubriques restées dehors, lus dans l’onglet et la période
   *  ouvertes — un compte de rubriques ne dit pas un compte de dépôts, et le
   *  chiffre se lit sur la porte, avant le clic. */
  const asideLeftOutDeposits = useMemo(() => {
    if (asideLeftOutValues.length === 0) return 0;
    const values = new Set(asideLeftOutValues.map((item) => item.value));
    return periodList.filter((row) => values.has((row.rubrique || '').trim())).length;
  }, [asideLeftOutValues, periodList]);

  /** Le compte des dépôts de chaque rubrique restée dehors, lu dans l’onglet
   *  et la période ouvertes : le temps dehors dit, à côté de sa durée, ce que
   *  sa rubrique la plus ancienne ramènera avant le clic. */
  const asideLeftOutCountByValue = useMemo(() => {
    const counts = new Map<string, number>();
    periodList.forEach((row) => {
      const cle = (row.rubrique || '').trim();
      if (!cle) return;
      counts.set(cle, (counts.get(cle) ?? 0) + 1);
    });
    return counts;
  }, [periodList]);

  /** Le temps cumulé que ces rubriques ont passé dehors : la somme de leurs
   *  durées, lue à côté du compte de dépôts — le chiffre dit aussi depuis
   *  combien de temps la porte laisse ce travail de côté. */
  const asideLeftOutTotalMs = asideLeftOutValues.reduce(
    (total, item) => total + (item.ms > 0 ? item.ms : 0),
    0,
  );
  const asideLeftOutAgo = asideLeftOutTotalMs > 0 ? span(asideLeftOutTotalMs) : '';

  /** Les rubriques de ce compte que sa porte a déjà ouvertes : le chiffre se
   *  lit à côté du temps dehors, sans avoir à relire chaque nom. */
  const asideLeftOutOpened = asideLeftOutValues
    .filter((item) => asideLeftOutTaken.includes(item.value)).length;

  /** Les rubriques que la porte de ce compte a déjà ouvertes, nommées : la
   *  pastille « déjà ouvertes » est elle-même une porte, et rouvre ces
   *  rubriques vues sans repasser par le compte. */
  const asideLeftOutTakenValues = asideLeftOutValues
    .filter((item) => asideLeftOutTaken.includes(item.value));
  const asideLeftOutTakenPicks = asideLeftOutTakenValues.map((item) => item.value);
  const asideLeftOutTakenNames = asideLeftOutTakenValues
    .map((item) => item.label).join(' · ');
  /** La liste est-elle resserrée sur ces seules rubriques déjà ouvertes ?
   *  La pastille s’affirme alors, et un second clic rend la liste entière. */
  const asideLeftOutTakenOn = asideLeftOutTakenPicks.length > 0
    && asideLeftOutTakenPicks.length === asideLeft.length
    && asideLeftOutTakenPicks.every((value) => asideLeft.includes(value));

  /** La rubrique restée le plus longtemps de côté : le temps dehors est une
   *  porte, et c’est elle qu’elle ouvre. La plus lourde ne se devine pas — une
   *  valeur dont le jour n’est pas gardé ne se lit pas. */
  const asideLeftOutOldestPick = asideLeftOutValues.find((item) => item.ms > 0) ?? null;
  /** Ce que cette rubrique la plus ancienne dehors ramènera de dépôts : le
   *  compte se lit sur le jeton du temps, avant le clic. */
  const asideLeftOutOldestDeposits = asideLeftOutOldestPick
    ? (asideLeftOutCountByValue.get(asideLeftOutOldestPick.value) ?? 0)
    : 0;
  const asideLeftOutOldestOn = Boolean(
    asideLeftOutOldestPick && asideLeftOut
    && asideLeftOut.length === 1 && asideLeftOut[0] === asideLeftOutOldestPick.value,
  );

  /** La rubrique hors de la liste qui tient le plus de dépôts, sans égard pour
   *  son ancienneté : le jeton « dépôts » est sa porte, et le chiffre qu’il
   *  lance nomme ce qu’elle ramènera. */
  const asideLeftOutFullestPick = useMemo(
    () => asideLeftOutValues.reduce<{ value: string; label: string; n: number } | null>(
      (best, item) => {
        const n = asideLeftOutCountByValue.get(item.value) ?? 0;
        if (n <= 0) return best;
        return !best || n > best.n ? { value: item.value, label: item.label, n } : best;
      },
      null,
    ),
    [asideLeftOutValues, asideLeftOutCountByValue],
  );

  /** La liste est-elle resserrée sur cette seule rubrique la plus fournie ?
   *  Le jeton s’affirme alors, et un second clic rend la liste entière. */
  const asideLeftOutFullestOn = Boolean(
    asideLeftOutFullestPick && asideLeftOut
    && asideLeftOut.length === 1 && asideLeftOut[0] === asideLeftOutFullestPick.value,
  );

  /** Ce que les rubriques déjà ouvertes tiennent encore à corriger : leurs
   *  dépôts, lus dans l’onglet et la période ouvertes — le chiffre se lit dans
   *  la pastille, avant de la rouvrir. */
  const asideLeftOutTakenDeposits = useMemo(() => {
    if (asideLeftOutTakenPicks.length === 0) return 0;
    const values = new Set(asideLeftOutTakenPicks);
    return periodList.filter((row) => values.has((row.rubrique || '').trim())).length;
  }, [asideLeftOutTakenPicks, periodList]);

  /** Le temps cumulé qui reste dehors après la dernière porte ouverte : la
   *  somme des durées des rubriques encore hors de la liste et pas encore
   *  ouvertes — la phrase copiée le cite, pour comparer deux envois. */
  const asideLeftOutRestAgo = useMemo(() => {
    if (asideLeftOutTaken.length === 0) return '';
    const values = new Set<string>();
    periodList.forEach((row) => {
      const cle = (row.rubrique || '').trim();
      if (!cle || asideLeftOutTaken.includes(cle)) return;
      values.add(cle);
    });
    const ms = Array.from(values).reduce((total, value) => {
      const since = stampOf(memory.sharedAsideSince[value] ?? '');
      return since > 0 ? total + Math.max(0, Date.now() - since) : total;
    }, 0);
    return ms > 0 ? span(ms) : '';
  }, [asideLeftOutTaken, periodList, memory.sharedAsideSince]);

  /** Ce qui restera à corriger après la porte de la plus pesante : le premier
   *  dépôt s’ouvre d’un clic, les autres attendent — le récapitulatif copié
   *  le dit à côté du nom de la rubrique, comme la ligne réelle. */
  const asideLeftOutHeavyLeft = Math.max(0, asideLeftOutHeavyRows.length - 1);

  /** La plus lourde des rubriques que les trois laissent de côté : son survol
   *  et le jeton du resserrement la nomment, pour que l’ouverture des trois
   *  dise aussi ce qu’elle écarte de plus pesant. Une valeur sans jour gardé
   *  ne se devine pas. */
  const asideThreeLeftHeaviest = foldsAsideValues.reduce<{ label: string; ms: number } | null>(
    (heaviest, origin) => {
      if (asideHeaviestThree.some((three) => three.value === origin.value)) return heaviest;
      const since = stampOf(memory.sharedAsideSince[origin.value] ?? '');
      if (!since) return heaviest;
      const ms = Math.max(0, Date.now() - since);
      return !heaviest || ms > heaviest.ms ? { label: origin.label, ms } : heaviest;
    },
    null,
  );

  /** Le resserrement sur les rubriques laissées de côté est-il en place ? La
   *  porte s’affirme alors, et sa croix rend la liste entière. */
  const asideLeftOn = asideThreeLeftPicks.length > 0
    && asideThreeLeftPicks.every((value) => asideLeft.includes(value));

  /** L'ouverture des deux valeurs est-elle en place ? Le signe s'affirme
   *  alors, et un second clic rend la liste entière. */
  const asidePairOn = asideHeaviestTwo.length > 1
    && asideHeaviestTwo.every((origin) => asidePair.includes(origin.value));

  /** Les noms des valeurs ouvertes, lus sur les deux familles. */
  const asidePairNames = asidePair.map((value) => labelOfRubrique(value)).join(' · ');

  /** Les dépôts que les valeurs ouvertes tiennent, famille par famille : le
   *  jeton les lit côte à côte, annonces et offres. */
  const asidePairSides = foldsAsideValues.reduce(
    (total, origin) => (asidePair.includes(origin.value)
      ? { annonce: total.annonce + origin.annonce, offre: total.offre + origin.offre }
      : total),
    { annonce: 0, offre: 0 },
  );

  /** Le geste du signe : les deux valeurs les plus lourdes s'ouvrent ensemble,
   *  d'un seul clic — la liste se resserre sur elles deux, prêtes à être
   *  corrigées. Un second clic rend la liste entière. */
  const openAsidePair = () => {
    if (asideHeaviestTwo.length < 2) return;
    if (asidePairOn) {
      setAsidePair([]);
      return;
    }
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setFocusId(null);
    setNotice('');
    setFailure('');
    setAsidePair(asideHeaviestTwo.map((origin) => origin.value));
    setAsideLeft([]);
    setAsideLeftOut(null);
    /* L'onglet ouvert est celui qui tient le plus de dépôts de la plus
       lourde : le travail se lit là où il est le plus dense. */
    if (asideHeaviestKind !== tab) rememberTab(asideHeaviestKind);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** Le geste du troisième signe : les trois valeurs les plus lourdes
   *  s'ouvrent ensemble, d'un seul clic — la liste se resserre sur elles
   *  trois, prêtes à être corrigées. Un second clic rend la liste entière. */
  const openAsideTrio = () => {
    if (asideHeaviestThree.length < 3) return;
    if (asideTrioOn) {
      setAsidePair([]);
      return;
    }
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setFocusId(null);
    setNotice('');
    setFailure('');
    setAsidePair(asideHeaviestThree.map((origin) => origin.value));
    setAsideLeft([]);
    setAsideLeftOut(null);
    /* L'onglet ouvert est celui qui tient le plus de dépôts de la plus
       lourde : le travail se lit là où il est le plus dense. */
    if (asideHeaviestKind !== tab) rememberTab(asideHeaviestKind);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** Le geste de la porte des rubriques laissées de côté : un clic resserre la
   *  liste sur les rubriques que les trois plus lourdes écartent — et sur elles
   *  seules — dans la famille où elles tiennent le plus de dépôts. Un second
   *  clic rend la liste entière. */
  const openAsideLeft = () => {
    if (asideThreeLeftPicks.length === 0) return;
    if (asideLeftOn) {
      setAsideLeft([]);
      return;
    }
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setFocusId(null);
    setNotice('');
    setFailure('');
    setAsidePair([]);
    setAsideLeft(asideThreeLeftPicks);
    setAsideLeftOut(null);
    /* La famille ouverte est celle qui tient le plus de dépôts parmi ces
       rubriques : le travail se lit là où il est le plus dense. */
    const leftSides = foldsAsideValues.reduce(
      (total, origin) => (asideThreeLeftPicks.includes(origin.value)
        ? { annonce: total.annonce + origin.annonce, offre: total.offre + origin.offre }
        : total),
      { annonce: 0, offre: 0 },
    );
    const target: Tab = leftSides.offre > leftSides.annonce ? 'offre' : 'annonce';
    if (target !== tab) rememberTab(target);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** La porte d'une seule rubrique laissée de côté : un clic resserre la
   *  liste sur elle seule, dans la famille qui en tient le plus ; un second
   *  clic la rend aux autres rubriques, sans remonter la rangée. Quand la
   *  famille est nommée — le petit signe de la pastille — la porte ouvre
   *  celle-là, même si l'autre en tient davantage. */
  const openAsideLeftOne = (value: string, side?: Tab) => {
    const cle = value.trim();
    if (!cle) return;
    const alone = asideLeft.length === 1 && asideLeft[0] === cle;
    if (alone && !side) {
      setAsideLeft(asideThreeLeftPicks);
      setAsideLeftOut(null);
      return;
    }
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setFocusId(null);
    setNotice('');
    setFailure('');
    setAsidePair([]);
    setAsideLeft([cle]);
    setAsideLeftOut(null);
    /* La famille ouverte est celle qui tient le plus de dépôts de cette
       rubrique : le travail se lit là où il est le plus dense. */
    const origin = foldsAsideValues.find((item) => item.value === cle);
    const target: Tab = side
      ?? (origin && origin.offre > origin.annonce ? 'offre' : 'annonce');
    if (target !== tab) rememberTab(target);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** La porte du compte « rubriques hors de la liste » : un clic resserre la
   *  liste sur ces rubriques seules — celles que la liste courte laissait
   *  dehors — la plus pesante dehors déjà en tête ; un second clic rend la
   *  liste entière. Le resserrement ne se garde pas : c’est une lecture,
   *  comme celui du repère de la plus lourde. */
  const openAsideLeftOut = () => {
    if (asideLeftOutOn) {
      setAsideLeft([]);
      setAsideLeftOut(null);
      return;
    }
    const picks = asideLeftOutValues.map((item) => item.value);
    if (picks.length === 0) return;
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setFocusId(null);
    setNotice('');
    setFailure('');
    setAsidePair([]);
    setAsideLeft(picks);
    setAsideLeftOut(picks);
    /* Ce que la porte vient d’ouvrir se garde : le compte le dit à côté du
       temps dehors, sans qu’on ait à relire les noms. */
    setAsideLeftOutTaken((current) => Array.from(new Set([...current, ...picks])));
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** La porte des rubriques déjà ouvertes : un clic resserre la liste sur
   *  celles que la porte du compte a déjà vues — et sur elles seules — sans
   *  repasser par le compte ; un second clic rend la liste entière. */
  const openAsideLeftOutTaken = () => {
    if (asideLeftOutTakenPicks.length === 0) return;
    if (asideLeftOutTakenOn) {
      setAsideLeft([]);
      setAsideLeftOut(null);
      return;
    }
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setFocusId(null);
    setNotice('');
    setFailure('');
    setAsidePair([]);
    setAsideLeft(asideLeftOutTakenPicks);
    setAsideLeftOut(asideLeftOutTakenPicks);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** La porte du temps dehors : elle resserre la liste sur la rubrique restée
   *  le plus longtemps de côté — celle que le compte nomme en tête — dans la
   *  famille qui en tient le plus de dépôts. Un second clic rend la liste
   *  entière, sans remonter la rangée. */
  const openAsideLeftOutOldest = () => {
    const top = asideLeftOutOldestPick;
    if (!top) return;
    if (asideLeftOutOldestOn) {
      setAsideLeft([]);
      setAsideLeftOut(null);
      return;
    }
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setFocusId(null);
    setNotice('');
    setFailure('');
    setAsidePair([]);
    setAsideLeft([top.value]);
    setAsideLeftOut([top.value]);
    setAsideLeftOutTaken((current) => (
      current.includes(top.value) ? current : [...current, top.value]
    ));
    /* La famille ouverte est celle qui tient le plus de dépôts de cette
       rubrique : le travail se lit là où il est le plus dense. */
    const nAnnonce = rows.filter((row) => row.kind === 'annonce'
      && (row.rubrique || '').trim() === top.value).length;
    const nOffre = rows.filter((row) => row.kind === 'offre'
      && (row.rubrique || '').trim() === top.value).length;
    const target: Tab = nOffre > nAnnonce ? 'offre' : 'annonce';
    if (target !== tab) rememberTab(target);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** La porte du jeton « dépôts » : elle ouvre la rubrique hors de la liste qui
   *  tient le plus de dépôts — quelle que soit son ancienneté — dans la famille
   *  qui en porte le plus. Un second clic rend la liste entière. */
  const openAsideLeftOutFullest = () => {
    const top = asideLeftOutFullestPick;
    if (!top) return;
    if (asideLeftOutFullestOn) {
      setAsideLeft([]);
      setAsideLeftOut(null);
      return;
    }
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setFocusId(null);
    setNotice('');
    setFailure('');
    setAsidePair([]);
    setAsideLeft([top.value]);
    setAsideLeftOut([top.value]);
    setAsideLeftOutTaken((current) => (
      current.includes(top.value) ? current : [...current, top.value]
    ));
    /* La famille ouverte est celle qui tient le plus de dépôts de cette
       rubrique : le travail se lit là où il est le plus dense. */
    const nAnnonce = rows.filter((row) => row.kind === 'annonce'
      && (row.rubrique || '').trim() === top.value).length;
    const nOffre = rows.filter((row) => row.kind === 'offre'
      && (row.rubrique || '').trim() === top.value).length;
    const target: Tab = nOffre > nAnnonce ? 'offre' : 'annonce';
    if (target !== tab) rememberTab(target);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** La porte de la plus pesante du petit compte : elle resserre la liste sur
   *  cette seule rubrique et ouvre aussitôt son premier dépôt à corriger, le
   *  curseur dans sa rubrique — sans relire chaque durée ni chercher la ligne. */
  const openAsideLeftOutHeavy = () => {
    const top = asideLeftOutHeaviest;
    if (!top) return;
    const first = asideLeftOutHeavyRows[0] ?? null;
    const rest = first
      ? asideLeftOutHeavyRows.filter((row) => row.id !== first.id).map((row) => row.id)
      : [];
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setEditing(null);
    setNotice('');
    setFailure('');
    setAsidePair([]);
    setAsideLeft([top.value]);
    setAsideLeftOut(null);
    /* La famille ouverte est celle du dépôt à corriger : la ligne s’ouvre
       dans son propre onglet, le curseur déjà dans sa rubrique. */
    if (first && first.kind !== tab) rememberTab(first.kind);
    if (first) {
      startEdit(first, 'rubrique');
      setChainIds(rest);
      setChainMode('rubrique');
      setFocusId(first.id);
    } else {
      setChainIds([]);
      setChainMode(null);
      setFocusId(null);
    }
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** Le retour du resserrement : la porte des rubriques laissées de côté rend
   *  l’ouverture des trois valeurs d’un seul clic, sans remonter la rangée. */
  const backAsideLeftToTrio = () => {
    if (asideHeaviestThree.length < 3) return;
    setAsideLeft([]);
    setAsideLeftOut(null);
    setAsidePair(asideHeaviestThree.map((origin) => origin.value));
    if (asideHeaviestKind !== tab) rememberTab(asideHeaviestKind);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** Les valeurs laissées hors de la rangée gardent le jour où elles en sont
   *  sorties : la porte hors écran dira combien de temps chacune est restée
   *  dehors, valeur par valeur. Une valeur revenue à l'écran s'oublie. */
  const foldsAsideKey = foldsAsideValues.map((origin) => origin.value).join('|');
  useEffect(() => {
    noteSharedAsideSince(foldsAsideKey ? foldsAsideKey.split('|') : []);
  }, [foldsAsideKey, noteSharedAsideSince]);

  /** Le poids des valeurs partagées, famille par famille : ce que les gommes
   *  des comptes retirent quand elles remettent leur compte à zéro — leurs
   *  traces se lisent ensuite famille de valeurs par famille. */
  const sharedSidesTotal = sharedOrigins.reduce(
    (total, origin) => ({
      annonce: total.annonce + origin.annonce,
      offre: total.offre + origin.offre,
    }),
    { annonce: 0, offre: 0 },
  );

  /** Les valeurs que la rangée montre : toutes, les trois premières quand elle
   *  est repliée, ou seulement celles qu'elle gardait hors de l'écran quand sa
   *  porte de resserrement est ouverte. */
  const sharedAsideCount = Math.max(0, sharedOrigins.length - SHARED_LIST_FOLD_AT);
  const sharedRowValues = sharedAsideOnly
    ? sharedOrigins.slice(SHARED_LIST_FOLD_AT)
    : sharedListFolded ? sharedOrigins.slice(0, SHARED_LIST_FOLD_AT) : sharedOrigins;

  /** La petite gomme d'une pastille de copie : elle remet à zéro le compte de
   *  l'autre langue, sans toucher aux deux autres ni au séparateur. */
  const eraseSharedTaken = () => {
    resetSharedCopied(otherLang, sharedSidesTotal);
    setNotice(t('acct.mine.rubriqueSharedCopyOtherErased').replace('{lang}', otherLangName));
  };

  /** La petite gomme du compte de la ligne courte : elle le remet à zéro, sans
   *  toucher aux comptes des autres langues ni au séparateur choisi. */
  const eraseSharedCompactTaken = () => {
    resetSharedCompactCopies(sharedSidesTotal);
    setNotice(t('acct.mine.rubriqueSharedCopyCompactErased'));
  };

  /** La petite gomme des deux replis : l'aperçu et la rangée reviennent à
   *  leur état automatique d'un seul geste — l'aperçu suit de nouveau son
   *  seuil, la rangée s'ouvre — sans toucher aux comptes de la ligne. */
  const eraseSharedFolds = () => {
    setSharedAsideOnly(false);
    resetSharedFolds(foldsAsideSides);
    setNotice(t('acct.mine.rubriqueSharedFoldsErased'));
  };

  /** La porte d'un compte de gomme : elle resserre la liste des dépôts sur la
   *  famille dont ce geste a vidé le plus de valeurs — l'onglet de cette
   *  famille s'ouvre, les filtres qui cacheraient ses dépôts s'effacent. Un
   *  compte sans trace ne montre pas de porte : rien à resserrer. */
  const eraseDoorFamily = (trace: MineEraseTrace | null): Tab | null => {
    if (!trace || (trace.annonce <= 0 && trace.offre <= 0)) return null;
    return trace.offre > trace.annonce ? 'offre' : 'annonce';
  };

  /** Ce que la porte d'un compte de gomme resserrera, dit en clair au survol. */
  const eraseDoorTitle = (trace: MineEraseTrace | null) => {
    const target = eraseDoorFamily(trace);
    if (!target || !trace) return '';
    return t('acct.mine.rubriqueSharedEraseDoorHint')
      .replace('{family}', t(target === 'annonce'
        ? 'acct.mine.rubriqueFamilyAnnonce'
        : 'acct.mine.rubriqueFamilyOffre'))
      .replace('{n}', String(target === 'annonce' ? trace.annonce : trace.offre));
  };

  /** Les filtres qu'une liste portait, nommés un par un — l'état, la
   *  recherche, la région, le pays, la période, la rubrique, l'attention, les
   *  anciens, le tri : le survol d'une porte de gomme les cite tous, pour
   *  qu'un second clic ne rende pas une liste qu'on n'attendait pas. */
  const filtersBackTxt = (before: MineFilters) => {
    const parts: string[] = [];
    if (before.status !== 'all') {
      parts.push(t('acct.mine.rubriqueSharedBackStatus')
        .replace('{v}', t(STATUS_KEY[before.status])));
    }
    if (before.query.trim()) {
      parts.push(t('acct.mine.rubriqueSharedBackQuery').replace('{v}', before.query.trim()));
    }
    if (before.wilaya.trim()) {
      parts.push(`${t('pays.region')} ${before.wilaya.trim()}`);
    }
    if (before.pays) {
      parts.push(t('acct.mine.rubriqueSharedBackPays')
        .replace('{v}', nomPays(before.pays, lang)));
    }
    if (before.period !== 'all') {
      parts.push(t('acct.mine.rubriqueSharedBackPeriod')
        .replace('{v}', t(PERIOD_KEY[before.period])));
    }
    if (before.rubrique.trim()) {
      parts.push(t('acct.mine.rubriqueSharedBackRubrique')
        .replace('{v}', labelOfRubrique(before.rubrique.trim())));
    }
    if (before.attention) parts.push(t('acct.mine.rubriqueSharedBackAttention'));
    if (before.stale) parts.push(t('acct.mine.rubriqueSharedBackStale'));
    if (before.sort !== 'new') {
      parts.push(t('acct.mine.rubriqueSharedBackSort')
        .replace('{v}', t(SORT_KEY[before.sort])));
    }
    return parts.join(' · ');
  };

  /** Ce que la porte de ce compte rendra, dit au survol : les filtres qu'elle
   *  a effacés quand elle est ouverte, ceux qu'elle effacera tant qu'elle ne
   *  l'est pas encore — les mêmes mots, avant et après le clic. */
  const eraseDoorBackTitle = (id: string, trace: MineEraseTrace | null) => {
    if (erasedDoor && erasedDoor.id === id) {
      const parts = filtersBackTxt(erasedDoor.before);
      return parts
        ? t('acct.mine.rubriqueSharedEraseDoorBackFilters').replace('{parts}', parts)
        : t('acct.mine.rubriqueSharedEraseDoorBackNone');
    }
    const target = eraseDoorFamily(trace);
    if (!target) return '';
    const parts = filtersBackTxt(memory.byTab[target]);
    return parts
      ? t('acct.mine.rubriqueSharedEraseDoorBackWill').replace('{parts}', parts)
      : t('acct.mine.rubriqueSharedEraseDoorBackWillNone');
  };

  /** Le geste de la porte : la liste revient à la famille que la gomme a
   *  vidée, sans filtre qui la cacherait — et le tableau défile jusqu'à elle. */
  const openErasedFamily = (id: string, trace: MineEraseTrace | null) => {
    const target = eraseDoorFamily(trace);
    if (!target) return;
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setFocusId(null);
    setFailure('');
    /* Second clic sur la même porte : elle rend les filtres qu'elle avait
       effacés, et la liste reprend l'étendue qu'elle avait avant le geste. */
    if (erasedDoor && erasedDoor.id === id) {
      patchTabFilters(erasedDoor.kind, erasedDoor.before);
      if (erasedDoor.kind !== tab) rememberTab(erasedDoor.kind);
      setErasedDoor(null);
      setNotice(t('acct.mine.rubriqueSharedEraseDoorBackDone'));
      window.setTimeout(() => {
        listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return;
    }
    /* Ce que la liste montrait avant le geste se garde : la porte pourra le
       rendre d'un second clic, sans rien retrouver à la main. */
    setErasedDoor({ id, kind: target, before: { ...memory.byTab[target] } });
    /* Ce que cette porte rendra, nommé d'avance : le récapitulatif copié le
       cite, pour qu'un collègue lise l'étendue retrouvée. */
    setDoorFiltersTxt(filtersBackTxt(memory.byTab[target]));
    noteEraseDoorOpen(id);
    patchTabFilters(target, {
      status: 'all', query: '', wilaya: '', pays: '', period: 'all',
      attention: false, stale: false, rubrique: '', originsRest: '', originsRestFrom: '',
    });
    if (target !== tab) rememberTab(target);
    setNotice(t('acct.mine.rubriqueSharedEraseDoorDone').replace(
      '{family}',
      t(target === 'annonce' ? 'acct.mine.rubriqueFamilyAnnonce' : 'acct.mine.rubriqueFamilyOffre'),
    ));
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** La petite gomme du récapitulatif : son seul compte repart de zéro, gardé
   *  avec les autres comptes de la ligne. */
  const eraseSharedRecapTaken = () => {
    resetSharedRecapCopies(sharedSidesTotal);
    setNotice(t('acct.mine.rubriqueSharedRecapErased'));
  };

  /** La moyenne du temps oublié, lue sur les derniers gestes annulés : le
   *  compte de l'oubli dit ainsi si l'annulation traîne, geste après geste. */
  const undoHeldAvg = memory.undoHeld.length > 0
    ? Math.round(
      memory.undoHeld.reduce((total, entry) => total + entry.ms, 0) / memory.undoHeld.length,
    )
    : 0;

  /** Le geste resté le plus longtemps oublié, lu sur les mêmes derniers
   *  gestes que la moyenne : il dit le pire écart, là où la moyenne le lisse. */
  const undoHeldMax = memory.undoHeld.length > 0
    ? Math.max(...memory.undoHeld.map((entry) => entry.ms))
    : 0;

  /** La valeur médiane du temps oublié, lue sur les mêmes derniers gestes :
   *  entre la moyenne et le pire écart, elle dit le geste du milieu — la
   *  moitié des annulations a traîné plus, l'autre moins. */
  const undoHeldMed = memory.undoHeld.length > 2
    ? (() => {
      const sorted = memory.undoHeld.map((entry) => entry.ms).sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 1
        ? sorted[mid]
        : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    })()
    : 0;

  /** L'écart entre la médiane et la moyenne du temps oublié : positif quand
   *  la médiane dépasse la moyenne — un geste tire alors la série vers le
   *  haut ; négatif dans le cas inverse. Zéro, les deux se confondent. */
  const undoHeldGap = undoHeldMed > 0 && undoHeldAvg > 0 ? undoHeldMed - undoHeldAvg : 0;

  /** Le geste qui tire la série : quand l'écart entre la médiane et la moyenne
   *  dépasse un jour, le geste le plus éloigné d'elles se nomme avec sa durée.
   *  Une moyenne plus haute que la médiane, c'est un geste long qui la tire
   *  vers le haut ; une moyenne plus basse, c'est un geste court qui l'allège. */
  const undoPull = (() => {
    if (memory.undoHeld.length < 3 || Math.abs(undoHeldGap) < DAY_MS) return null;
    const sorted = [...memory.undoHeld].sort((a, b) => a.ms - b.ms);
    const up = undoHeldGap < 0;
    const entry = up ? sorted[sorted.length - 1] : sorted[0];
    return { ms: entry.ms, annonce: entry.annonce, offre: entry.offre, up };
  })();

  /** La valeur dont le geste tire la série : la rubrique que l'effacement de ce
   *  geste retirait, lue sur la famille ouverte d'abord — sa porte la rouvre
   *  pour la corriger d'un clic. Un geste sans rubrique gardée ne se devine pas. */
  const undoPullValue = useMemo(() => {
    if (!undoPull) return null;
    const pair: { kind: ListingKind; value: string }[] = [
      { kind: 'annonce', value: (undoPull.annonce || '').trim() },
      { kind: 'offre', value: (undoPull.offre || '').trim() },
    ];
    const filled = pair
      .filter((item) => Boolean(item.value))
      .sort((a, b) => (a.kind === tab ? -1 : b.kind === tab ? 1 : 0));
    const first = filled[0];
    return first ? { kind: first.kind, value: first.value, label: labelOfRubrique(first.value) } : null;
  }, [undoPull, tab, options]);

  /** Ce que la porte du geste qui tire la série ramènera à l'écran : les
   *  dépôts de cette valeur restés hors de la liste en ce moment. Le compte
   *  se lit sur la porte, avant le clic. */
  const undoPullAside = useMemo(() => {
    if (!undoPullValue) return 0;
    const shown = new Set(list.map((row) => row.id));
    return horsTypeByKind[undoPullValue.kind].filter((row) => (
      (row.rubrique || '').trim() === undoPullValue.value && !shown.has(row.id)
    )).length;
  }, [undoPullValue, horsTypeByKind, list]);

  /** Une valeur partagée est-elle retenue sur les deux familles à la fois ?
   *  Son jeton se lit alors comme une porte déjà ouverte. */
  const sharedPicked = (value: string) => (
    (memory.byTab.annonce.rubrique || '').trim() === value
    && (memory.byTab.offre.rubrique || '').trim() === value
  );

  /**
   * La porte d'une valeur partagée : un clic resserre **les deux familles**
   * sur la même valeur d'origine, et ouvre l'onglet qui en tient le plus —
   * une correction d'un côté ne laisse pas l'autre intact par inadvertance.
   * Un second clic rend les deux listes entières.
   */
  const openSharedOrigin = (value: string) => {
    const cle = value.trim();
    if (!cle) return;
    const again = sharedPicked(cle);
    setMotifPick(null);
    setOnlyBare(false);
    setOnlySlow(false);
    setBulkIds(null);
    setQuickConfirm(false);
    setPicked([]);
    setRubriqueFor(null);
    setChainIds([]);
    setChainMode(null);
    setEditing(null);
    setFocusId(null);
    setNotice('');
    setFailure('');
    const clear = {
      status: 'all' as const,
      query: '',
      wilaya: '',
      pays: '',
      period: 'all' as const,
      attention: false,
      stale: false,
      rubrique: again ? '' : cle,
      originsRest: '',
      originsRestFrom: '' as const,
    };
    patchTabFilters('annonce', clear);
    patchTabFilters('offre', clear);
    if (!again) {
      /* L'onglet ouvert est celui qui tient le plus de dépôts de cette
         valeur : le travail se lit là où il est le plus dense. */
      const nAnnonce = horsTypeByKind.annonce.filter(
        (row) => (row.rubrique || '').trim() === cle,
      ).length;
      const nOffre = horsTypeByKind.offre.filter(
        (row) => (row.rubrique || '').trim() === cle,
      ).length;
      const target: Tab = nOffre > nAnnonce ? 'offre' : 'annonce';
      if (target !== tab) rememberTab(target);
    }
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  /** Les dépôts que la porte de famille laisse hors de l'écran : leur rubrique
   *  d'origine est justement celle qu'elle écarte en ouvrant le resserrement. */
  const originsAsideLeft = useMemo(
    () => (originsRest.trim()
      ? horsTypeByKind[tab].filter((row) => (row.rubrique || '').trim() === originsRest.trim()
        && (!periodWindow || inRange(row.created_at, periodWindow))
        && (!pays || paysDe(row) === pays)).length
      : 0),
    [horsTypeByKind, tab, originsRest, periodWindow, pays],
  );

  /** Les valeurs d'origine que le nouveau resserrement laisse encore hors de
   *  l'écran : les rubriques de cette famille dont aucun dépôt ne reste dans
   *  la liste — la valeur écartée en tête, et celles que la période ou le
   *  pays tiennent aussi hors du cadre. */
  const originsStillAside = useMemo(() => {
    if (!originsRest.trim()) return 0;
    const shown = new Set(list.map((row) => row.id));
    const values = new Set<string>();
    horsTypeByKind[tab].forEach((row) => {
      const cle = (row.rubrique || '').trim();
      if (cle && !shown.has(row.id)) values.add(cle);
    });
    return values.size;
  }, [horsTypeByKind, tab, originsRest, list]);

  /** La valeur d'origine restée hors écran la plus lourde : celle qui tient
   *  le plus de dépôts parmi les valeurs que ce resserrement laisse de côté.
   *  Elle se nomme avec son compte, à côté du nombre de valeurs écartées. */
  const originsStillAsideTop = useMemo(() => {
    if (!originsRest.trim()) return null;
    const shown = new Set(list.map((row) => row.id));
    const counts = new Map<string, number>();
    horsTypeByKind[tab].forEach((row) => {
      const cle = (row.rubrique || '').trim();
      if (!cle || shown.has(row.id)) return;
      counts.set(cle, (counts.get(cle) ?? 0) + 1);
    });
    const ranked = Array.from(counts.entries())
      .map(([value, n]) => ({ value, n, label: labelOfRubrique(value) }))
      .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
    return ranked[0] ?? null;
  }, [horsTypeByKind, tab, originsRest, list]);

  /** Ce que la valeur la plus lourde de chaque famille laisserait encore hors
   *  de l'écran une fois ramenée : ses dépôts que la période ou le pays de
   *  cette famille continuent de retenir. Le compte se lit sur la porte
   *  elle-même, avant de la corriger. */
  const familyHeavyStill = useMemo(() => {
    const still = { annonce: 0, offre: 0 };
    (['annonce', 'offre'] as const).forEach((kind) => {
      const top = horsTypeOrigins[kind][0];
      if (!top) return;
      const own = memory.byTab[kind];
      const win = periodRange(own.period);
      const shown = horsTypeByKind[kind].filter((row) => (
        (row.rubrique || '').trim() === top.value
        && inRange(row.created_at, win)
        && (!own.pays || paysDe(row) === own.pays)
      )).length;
      still[kind] = Math.max(0, top.n - shown);
    });
    return still;
  }, [horsTypeOrigins, horsTypeByKind, memory]);

  /** Ce qu'un effacement retirait, famille par famille : le rappel le nomme
   *  avant que sa porte ne remette les rubriques en place. */
  const eraseTxtOf = (erase: { annonce: string; offre: string } | null) => (erase
    ? [
      erase.annonce
        ? `${t('acct.mine.rubriqueFamilyAnnonce')} · ${labelOfRubrique(erase.annonce)}`
        : '',
      erase.offre
        ? `${t('acct.mine.rubriqueFamilyOffre')} · ${labelOfRubrique(erase.offre)}`
        : '',
    ].filter(Boolean).join(' — ')
    : '');
  /** Le dernier effacement, tel que le rappel le cite. */
  const lastEraseTxt = eraseTxtOf(lastErase);
  /** L'effacement oublié, tel que sa porte le cite avant de le rétablir. */
  const forgottenEraseTxt = eraseTxtOf(forgottenErase);

  /** Les dépôts de l'onglet que le jeton de rubrique garde vraiment à l'écran,
   *  période comprise : le chiffre se lit à côté du total de l'onglet. */
  const rubPickShown = useMemo(
    () => (rubPick.trim()
      ? tabList.filter((row) => (row.rubrique || '').trim() === rubPick.trim()
        && (!periodWindow || inRange(row.created_at, periodWindow))).length
      : 0),
    [tabList, rubPick, periodWindow],
  );

  /** Les dépôts hors type que la rubrique retenue laisse hors de la liste :
   *  leur rubrique vient de l'autre famille, et le jeton le dit à côté du
   *  total montré — sans quoi la liste resserrée se lirait sans son manque. */
  const rubPickHorsTypeLeft = useMemo(
    () => (rubPick.trim()
      ? horsType.filter((row) => (row.rubrique || '').trim() !== rubPick.trim()
        && (!periodWindow || inRange(row.created_at, periodWindow))).length
      : 0),
    [horsType, rubPick, periodWindow],
  );

  /** Ce que la croix du jeton rend à la liste : les dépôts que la rubrique
   *  tenait hors d'elle, en gardant le pays et la période lus. Le compte se lit
   *  au survol, avant que le geste ne le fasse. */
  const rubFilterBack = useMemo(
    () => (rubPick.trim()
      ? tabList.filter((row) => (row.rubrique || '').trim() !== rubPick.trim()
        && (!periodWindow || inRange(row.created_at, periodWindow))
        && (!pays || paysDe(row) === pays)).length
      : 0),
    [tabList, rubPick, periodWindow, pays],
  );

  /** Ce qu'une correction retire de la série hors type : un dépôt, quelle que
   *  soit la rubrique choisie dans la bonne famille. Le compte se lit sous la
   *  liste, pour savoir combien il en restera après le geste. */
  const horsTypeLeft = Math.max(0, horsType.length - 1);

  /** Les dépôts hors type que la croix du jeton ramènerait avec le reste de la
   *  liste : ceux dont la rubrique vient de l'autre famille, dans le pays et
   *  la période lus. Leur compte se dit avec celui du reste. */
  const rubFilterBackHors = useMemo(
    () => (rubPick.trim()
      ? horsType.filter((row) => (row.rubrique || '').trim() !== rubPick.trim()
        && (!periodWindow || inRange(row.created_at, periodWindow))
        && (!pays || paysDe(row) === pays)).length
      : 0),
    [horsType, rubPick, periodWindow, pays],
  );

  /** Le premier dépôt hors type rangé dans la rubrique retenue : la porte posée
   *  sous le jeton l'ouvre pour la correction, curseur dans sa rubrique. */
  const rubPickFirstHors = useMemo(
    () => (rubPick.trim()
      ? horsType.find((row) => (row.rubrique || '').trim() === rubPick.trim()) ?? null
      : null),
    [horsType, rubPick],
  );

  /** Toute la série de cette seule rubrique d'origine : le compte sous la porte
   *  se lit sur elle — ce qui reste à corriger après le premier dépôt. */
  const rubPickFixSeries = useMemo(
    () => (rubPick.trim()
      ? horsType.filter((row) => (row.rubrique || '').trim() === rubPick.trim())
      : []),
    [horsType, rubPick],
  );

  /** Ce qui reste dans cette rubrique après le dépôt que la porte ouvre. */
  const rubPickFixLeft = Math.max(0, rubPickFixSeries.length - 1);

  /** Le dernier dépôt de la série : celui que la porte de la fin ouvrira. */
  const rubPickFixLastRow = rubPickFixSeries[rubPickFixSeries.length - 1] ?? null;

  /** Les rubriques d'origine que la série laissera intactes, famille par
   *  famille : les valeurs distinctes autres que celle qu'on corrige. La
   *  rubrique ouverte n'y figure plus, une fois la série remontée. */
  const originsIntactAfter = useMemo(() => {
    const back = { annonce: 0, offre: 0 };
    const pick = rubPick.trim();
    if (!pick) return back;
    (['annonce', 'offre'] as const).forEach((kind) => {
      const values = new Set<string>();
      horsTypeByKind[kind].forEach((row) => {
        const cle = (row.rubrique || '').trim();
        if (cle && cle !== pick) values.add(cle);
      });
      back[kind] = values.size;
    });
    return back;
  }, [horsTypeByKind, rubPick]);

  /** Une rubrique retenue reste-t-elle sur l'une des deux familles ? La petite
   *  gomme du rappel ne se montre que dans ce cas. */
  const rubPicksOn = Boolean((memory.byTab.annonce.rubrique || '').trim()
    || (memory.byTab.offre.rubrique || '').trim());

  /** L'onglet où le travail attend : le plus de dépôts à traiter, refusés ou
   *  hors type compris. Le second geste de la gomme y rouvre la liste. */
  const workTabCounts = useMemo(() => ({
    annonce: rows.filter((row) => row.kind === 'annonce'
      && (needsAction(row) || rubriqueHorsType(row))).length,
    offre: rows.filter((row) => row.kind === 'offre'
      && (needsAction(row) || rubriqueHorsType(row))).length,
  }), [rows]);
  const workTab: Tab = workTabCounts.offre > workTabCounts.annonce ? 'offre' : 'annonce';
  const workTabCount = workTabCounts[workTab];

  /** Ce que la gomme du rappel rend aux deux familles : les dépôts que les
   *  rubriques retenues tenaient hors de leur liste, onglet par onglet. */
  const rubEraserBack = useMemo(() => (['annonce', 'offre'] as const)
    .reduce((total, kind) => {
      const picked = (memory.byTab[kind].rubrique || '').trim();
      if (!picked) return total;
      return total + rows.filter(
        (row) => row.kind === kind && (row.rubrique || '').trim() !== picked,
      ).length;
    }, 0), [rows, memory]);

  /** Ce que la porte du rappel remet à l'écran, famille par famille : les
   *  dépôts que chaque rubrique effacée tenait hors de sa liste. Le compte se
   *  dit avant le geste, pour savoir ce qu'il ramène. */
  const lastEraseBack = useMemo(() => {
    const back = { annonce: 0, offre: 0 };
    if (!lastErase) return back;
    (['annonce', 'offre'] as const).forEach((kind) => {
      const picked = (lastErase[kind] || '').trim();
      if (!picked) return;
      back[kind] = rows.filter(
        (row) => row.kind === kind && (row.rubrique || '').trim() !== picked,
      ).length;
    });
    return back;
  }, [rows, lastErase]);

  /** Ce que la porte de l'oubli remettra sous la main une fois le rappel
   *  rétabli : les dépôts que l'effacement oublié tenait hors de chaque liste,
   *  famille par famille — le même compte que la porte du rappel. */
  const forgottenEraseBack = useMemo(() => {
    const back = { annonce: 0, offre: 0 };
    if (!forgottenErase) return back;
    (['annonce', 'offre'] as const).forEach((kind) => {
      const picked = (forgottenErase[kind] || '').trim();
      if (!picked) return;
      back[kind] = rows.filter(
        (row) => row.kind === kind && (row.rubrique || '').trim() !== picked,
      ).length;
    });
    return back;
  }, [rows, forgottenErase]);

  /** Ce que la porte de l'oubli remettra sous la main, en mots : le compte se
   *  dit au survol et dans la ligne, famille par famille. */
  const forgottenEraseBackTxt = (['annonce', 'offre'] as const)
    .filter((kind) => forgottenEraseBack[kind] > 0)
    .map((kind) => `${t(kind === 'annonce'
      ? 'acct.mine.rubriqueFamilyAnnonce'
      : 'acct.mine.rubriqueFamilyOffre')} · ${forgottenEraseBack[kind]}`)
    .join(' — ');

  /** Le compte du rappel en mots, famille par famille — seulement celles qui
   *  ont une rubrique à remettre en place. */
  const lastEraseBackTxt = (['annonce', 'offre'] as const)
    .filter((kind) => lastEraseBack[kind] > 0)
    .map((kind) => `${t(kind === 'annonce'
      ? 'acct.mine.rubriqueFamilyAnnonce'
      : 'acct.mine.rubriqueFamilyOffre')} · ${lastEraseBack[kind]}`)
    .join(' — ');

  return (
    <section className="pro-card acct-board" id="my-listings">
      <div className="mine-head">
        <div>
          <h2 className="page-h2">{t('acct.mine.title')}</h2>
          <p className="auth-note mine-sub">{t('acct.mine.sub')}</p>
          {/* Le repère de pose de l'espace compte : les clés du formulaire de
              dépôt et de correction (`dep.`), que les deux onglets traversent
              vraiment, puis, sur l'onglet Annonces, celles de la fiche
              d'annonce (`ann.`). Une fois tout posé, les pastilles se taisent.
              Chacune mène au relevé de parité déjà resserré sur son fichier et
              sur sa famille de clés : le chiffre n'est plus une constat, il
              ouvre le travail. */}
          <div className="mine-pose">
            <PoseRestante
              fichier="dict.ts"
              prefixes={['dep.']}
              vers="/admin?section=suivi&parite=dict.ts&fam=dep."
            />
            {tab === 'annonce' && (
              <PoseRestante
                fichier="dict.ts"
                prefixes={['ann.']}
                vers="/admin?section=suivi&parite=dict.ts&fam=ann."
              />
            )}
          </div>
        </div>
        <Link to={tab === 'annonce' ? '/deposer?type=annonce' : '/deposer?type=offre'} className="cta mine-cta">
          <i className="ri-add-line" aria-hidden="true"></i>
          {tab === 'annonce' ? t('acct.mine.emptyCta') : t('acct.mine.emptyCtaOffre')}
        </Link>
        <CsvExportButton
          total={list.length}
          ghost
          run={() => downloadMineCsv(buildMineCsv({ rows: list, lang, t }))}
        />
        <CopyTextButton
          label={t('acct.mine.summaryCopy')}
          hint={t('acct.mine.summaryNote')}
          className="ghost-btn"
          build={() => buildMineSummary({
            lang,
            t,
            annonces: annonceCount,
            offres: offreCount,
            total: rows.length,
            todo: attentionTotal,
            published: publishedTotal,
            stale: staleTotal,
            compare: monthCompare,
            pays: paysTally,
            periodLabel: t(PERIOD_KEY[period]),
            kept: periodList.length,
            scoped: tabList.length,
          })}
        />
      </div>

      {draft && (
        <MineDraftNote
          kind={tab}
          draft={draft}
          age={draft.savedAt ? span(Date.now() - draft.savedAt) : t('acct.mine.lessHour')}
          reprisAge={repris ? span(Date.now() - repris) : null}
          onClear={eraseDraft}
        />
      )}

      <div className="mine-total">
        <p className="mine-total-main">
          <b>{rows.length}</b>
          <span>{t('acct.mine.totalDeposits')}</span>
        </p>
        <div className="mine-total-split" role="group" aria-label={t('acct.mine.title')}>
          <button
            type="button"
            className={tab === 'annonce' ? 'is-on' : ''}
            aria-pressed={tab === 'annonce'}
            onClick={() => switchTab('annonce')}
          >
            <i className="ri-megaphone-line" aria-hidden="true"></i>
            {t('acct.mine.tabAnnonces')}
            <b>{annonceCount}</b>
          </button>
          <button
            type="button"
            className={tab === 'offre' ? 'is-on' : ''}
            aria-pressed={tab === 'offre'}
            onClick={() => switchTab('offre')}
          >
            <i className="ri-briefcase-line" aria-hidden="true"></i>
            {t('acct.mine.tabOffres')}
            <b>{offreCount}</b>
          </button>
        </div>
        <button
          type="button"
          className={`mine-total-todo${attentionTotal > 0 ? ' is-on' : ''}${attention ? ' is-filter' : ''}`}
          aria-pressed={attention}
          disabled={attentionTotal === 0 && !attention}
          onClick={toggleAttention}
          title={t('acct.mine.attentionNote')}
        >
          <i className={attentionTotal > 0 ? 'ri-alarm-warning-line' : 'ri-checkbox-circle-line'} aria-hidden="true"></i>
          <span>{attentionTotal > 0 ? t('acct.mine.totalTodo') : t('acct.mine.totalClear')}</span>
          {attentionTotal > 0 && <b>{attentionTotal}</b>}
          {attention && <i className="ri-close-line" aria-hidden="true"></i>}
        </button>

        {staleTotal > 0 && (
          <button
            type="button"
            className={`mine-total-stale${stale ? ' is-filter' : ''}`}
            aria-pressed={stale}
            onClick={toggleStale}
            title={t('acct.mine.totalOldNote')}
          >
            <i className="ri-history-line" aria-hidden="true"></i>
            {t('acct.mine.totalOld')} <b>{staleTotal}</b>
            {stale && <i className="ri-close-line" aria-hidden="true"></i>}
          </button>
        )}

        <button
          type="button"
          className={`mine-total-done${status === 'publie' ? ' is-filter' : ''}`}
          aria-pressed={status === 'publie'}
          disabled={publishedTotal === 0 && status !== 'publie'}
          onClick={togglePublished}
          title={t('acct.mine.pubFilterNote')}
        >
          <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
          <span>{t('acct.mine.totalPublished')}</span>
          <b>{publishedTotal}</b>
          {status === 'publie' && <i className="ri-close-line" aria-hidden="true"></i>}
        </button>

        {latestRefused && (
          <button
            type="button"
            className="mine-total-lastrefuse"
            onClick={showLatestRefusal}
            title={t('acct.mine.lastRefusalNote')}
          >
            <i className="ri-error-warning-line" aria-hidden="true"></i>
            {t('acct.mine.viewLastRefusal')}
          </button>
        )}

        {refusedRows.length > 0 && (
          <div className="mine-total-quick">
            {quickConfirm ? (
              <>
                <button
                  type="button"
                  className="cta"
                  onClick={() => void onRepublishMany(refusedRows.map((row) => row.id))}
                  disabled={busy || bulkBusy}
                >
                  <i className="ri-check-double-line" aria-hidden="true"></i>
                  {bulkBusy ? t('acct.mine.bulkBusy') : t('acct.mine.bulkConfirm')}
                </button>
                <button type="button" className="link-btn" onClick={() => setQuickConfirm(false)} disabled={bulkBusy}>
                  {t('acct.mine.cancel')}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setQuickConfirm(true)}
                disabled={busy || bulkBusy}
                title={t('acct.mine.bulkHint')}
              >
                <i className="ri-refresh-line" aria-hidden="true"></i>
                {t('acct.mine.republishTab')} <b>{refusedRows.length}</b>
              </button>
            )}
          </div>
        )}
      </div>

      {/* The posting window: the whole history, this month or this quarter.
          It narrows the list and the country counter below it, so the two read
          the same stock instead of two different ones. */}
      {tabList.length > 0 && (
        <div className="mine-period" role="group" aria-label={t('acct.mine.periodLabel')}>
          <span className="mine-period-label">
            <i className="ri-calendar-2-line" aria-hidden="true"></i>
            {t('acct.mine.periodLabel')}
          </span>
          <button
            type="button"
            className={`mine-stat${period === 'all' ? ' is-on' : ''}`}
            aria-pressed={period === 'all'}
            onClick={() => patchFilters({ period: 'all' })}
          >
            <i className="ri-history-line" aria-hidden="true"></i>
            {t('acct.mine.periodAll')}
            <b>{tabList.length}</b>
          </button>
          <button
            type="button"
            className={`mine-stat${period === 'month' ? ' is-on' : ''}`}
            aria-pressed={period === 'month'}
            onClick={() => patchFilters({ period: 'month' })}
          >
            <i className="ri-calendar-event-line" aria-hidden="true"></i>
            {t('acct.mine.periodMonth')}
            <b>{windowCounts.month}</b>
          </button>
          <button
            type="button"
            className={`mine-stat${period === 'quarter' ? ' is-on' : ''}`}
            aria-pressed={period === 'quarter'}
            onClick={() => patchFilters({ period: 'quarter' })}
          >
            <i className="ri-calendar-todo-line" aria-hidden="true"></i>
            {t('acct.mine.periodQuarter')}
            <b>{windowCounts.quarter}</b>
          </button>
          <button
            type="button"
            className={`mine-stat${period === 'prevMonth' ? ' is-on' : ''}`}
            aria-pressed={period === 'prevMonth'}
            onClick={() => patchFilters({ period: 'prevMonth' })}
          >
            <i className="ri-calendar-line" aria-hidden="true"></i>
            {t('acct.mine.periodPrevMonth')}
            <b>{windowCounts.prevMonth}</b>
          </button>
          <button
            type="button"
            className={`mine-stat${period === 'prevQuarter' ? ' is-on' : ''}`}
            aria-pressed={period === 'prevQuarter'}
            onClick={() => patchFilters({ period: 'prevQuarter' })}
          >
            <i className="ri-calendar-check-line" aria-hidden="true"></i>
            {t('acct.mine.periodPrevQuarter')}
            <b>{windowCounts.prevQuarter}</b>
          </button>
          {period !== 'all' && (
            <span className="mine-period-link" title={t('acct.mine.periodShareNote')}>
              <CopyLinkButton label={t('acct.mine.periodShare')} className="mine-period-share" />
            </span>
          )}
          {period !== 'all' && (
            <span className="mine-period-count" title={t('acct.mine.periodNote')}>
              {periodList.length} / {tabList.length}
            </span>
          )}
        </div>
      )}

      {/* The same window one month earlier: the deposit count, and the move between
          the two, so the board says whether the flow is rising or easing off. */}
      {tabList.length > 0 && (monthCompare.now > 0 || monthCompare.before > 0) && (
        <div className="mine-cmp" aria-live="polite" title={t('acct.mine.cmpNote')}>
          <span className="mine-cmp-label">
            <i className="ri-arrow-left-right-line" aria-hidden="true"></i>
            {t('acct.mine.cmpLabel')}
          </span>
          <span className="mine-cmp-cell">
            <small>{t('acct.mine.cmpPrev')}</small>
            <b>{monthCompare.before}</b>
          </span>
          <span className="mine-cmp-cell is-now">
            <small>{t('acct.mine.cmpNow')}</small>
            <b>{monthCompare.now}</b>
          </span>
          <span
            className={`mine-cmp-delta${monthCompare.delta > 0 ? ' is-up' : monthCompare.delta < 0 ? ' is-down' : ' is-flat'}`}
          >
            <i
              className={monthCompare.delta > 0
                ? 'ri-arrow-up-line'
                : monthCompare.delta < 0 ? 'ri-arrow-down-line' : 'ri-subtract-line'}
              aria-hidden="true"
            ></i>
            <b>
              {monthCompare.delta > 0
                ? `+${monthCompare.delta}`
                : monthCompare.delta < 0 ? `\u2212${Math.abs(monthCompare.delta)}` : '\u00b10'}
            </b>
            <span>
              {monthCompare.delta > 0
                ? t('acct.mine.cmpUp')
                : monthCompare.delta < 0 ? t('acct.mine.cmpDown') : t('acct.mine.cmpFlat')}
            </span>
          </span>
        </div>
      )}

      <PaysTally
        counts={paysTally}
        total={paysTotal}
        active={pays}
        onPick={(code) => patchFilters({ pays: code === pays ? '' : code })}
        share={false}
        className="mine-pays"
        paysSort={{
          active: sort === 'pays',
          onToggle: () => patchFilters({ sort: sort === 'pays' ? 'new' : 'pays' }),
        }}
      />

      <div className="mine-stats" role="group" aria-label={t('acct.mine.statsTitle')}>
        <button
          type="button"
          className={`mine-stat${status === 'en_attente' ? ' is-on' : ''}`}
          data-state="en_attente"
          aria-pressed={status === 'en_attente'}
          onClick={() => pickStatus('en_attente')}
          title={t('acct.mine.pending')}
        >
          <i className="ri-time-line" aria-hidden="true"></i>
          {t('acct.mine.pending')}
          <b>{stats.en_attente}</b>
        </button>
        <button
          type="button"
          className={`mine-stat${status === 'publie' ? ' is-on' : ''}`}
          data-state="publie"
          aria-pressed={status === 'publie'}
          onClick={() => pickStatus('publie')}
          title={t('acct.mine.published')}
        >
          <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
          {t('acct.mine.published')}
          <b>{stats.publie}</b>
        </button>
        <button
          type="button"
          className={`mine-stat${status === 'refuse' ? ' is-on' : ''}`}
          data-state="refuse"
          aria-pressed={status === 'refuse'}
          onClick={() => pickStatus('refuse')}
          title={t('acct.mine.refused')}
        >
          <i className="ri-close-circle-line" aria-hidden="true"></i>
          {t('acct.mine.refused')}
          <b>{stats.refuse}</b>
        </button>
        {avgReview > 0 && (
          <p className="mine-avg" title={t('acct.mine.avgReviewNote')}>
            <i className="ri-timer-line" aria-hidden="true"></i>
            {t('acct.mine.avgReview')} <b>{span(avgReview)}</b>
          </p>
        )}
        {status !== 'all' && (
          <button type="button" className="mine-stat mine-stat--clear" onClick={() => patchFilters({ status: 'all' })}>
            <i className="ri-close-line" aria-hidden="true"></i>
            {t('acct.mine.filterAll')}
          </button>
        )}
      </div>

      <div className="segmented mine-tabs" role="group" aria-label={t('acct.mine.title')}>
        <button
          type="button"
          className={tab === 'annonce' ? 'is-on' : ''}
          aria-pressed={tab === 'annonce'}
          onClick={() => switchTab('annonce')}
        >
          <i className="ri-megaphone-line" aria-hidden="true"></i>
          {t('acct.mine.tabAnnonces')}
          <span className="mine-count">{annonceCount}</span>
        </button>
        <button
          type="button"
          className={tab === 'offre' ? 'is-on' : ''}
          aria-pressed={tab === 'offre'}
          onClick={() => switchTab('offre')}
        >
          <i className="ri-briefcase-line" aria-hidden="true"></i>
          {t('acct.mine.tabOffres')}
          <span className="mine-count">{offreCount}</span>
        </button>
      </div>

      {(showTools || showSort) && (
        <div className="mine-tools" title={t('acct.mine.memoryNote')}>
          <div className="mine-sort">
            <i className="ri-sort-desc" aria-hidden="true"></i>
            <select
              value={sort}
              onChange={(event) => patchFilters({ sort: event.target.value as MineSort })}
              aria-label={t('acct.mine.sortLabel')}
            >
              <option value="new">{t('acct.mine.sortNew')}</option>
              <option value="old">{t('acct.mine.sortOld')}</option>
              <option value="updated">{t('acct.mine.sortUpdated')}</option>
              <option value="pays">{t('pays.sort')}</option>
              {/* Le tri propre aux offres : seules les candidatures reçues
                  savent dire laquelle attend encore une réponse. */}
              {tab === 'offre' && (
                <option value="unread">{t('acct.mine.sortUnread')}</option>
              )}
            </select>
          </div>
          {sort === 'unread' && cands && (
            <span className="mine-sort-note" title={t('acct.mine.sortUnreadHint')}>
              <i className="ri-mail-unread-line" aria-hidden="true"></i>
              {cands.unreadTotal > 0
                ? t('acct.mine.sortUnreadNote').replace('{n}', String(cands.unreadTotal))
                : t('acct.mine.sortUnreadNone')}
            </span>
          )}
          {showTools && (<>
          <div className="mine-search">
            <i className="ri-search-line" aria-hidden="true"></i>
            <input
              type="search"
              value={query}
              onChange={(event) => patchFilters({ query: event.target.value })}
              placeholder={t('acct.mine.searchPh')}
              aria-label={t('acct.mine.searchPh')}
            />
            {query && (
              <button type="button" className="mine-search-clear" onClick={() => patchFilters({ query: '' })} aria-label={t('acct.mine.clearFilters')}>
                <i className="ri-close-circle-line" aria-hidden="true"></i>
              </button>
            )}
          </div>
          <div className="mine-wilaya">
            <i className="ri-map-pin-line" aria-hidden="true"></i>
            <RegionSelect
              id="mine-wilaya"
              pays={pays}
              value={wilaya}
              onChange={(region, code) => patchFilters({ wilaya: region, pays: code })}
              allLabel={motDivision(pays, lang, 'tous')}
            />
          </div>
          <p className="mine-tools-count">
            {list.length} / {tabList.length}
          </p>
          </>)}
        </div>
      )}

      {/* La rubrique lue d'une porte extérieure se nomme avant la liste :
          ce qu'on voit n'est jamais une liste muette. */}
      {rubPick.trim() && (
        <p className="mine-rub-filter" title={t('acct.mine.rubFilterHint')}>
          <i className="ri-route-line" aria-hidden="true"></i>
          <span>{t('acct.mine.rubFilter').replace('{rub}', labelOfRubrique(rubPick))}</span>
          <span
            className="mine-rub-filter-n"
            dir="ltr"
            title={t('acct.mine.rubFilterCount').replace('{n}', String(rubPickShown)).replace('{total}', String(tabList.length))}
          >
            <b>{rubPickShown}</b>
            <span aria-hidden="true">/</span>
            {tabList.length}
          </span>
          {/* Ce que la rubrique laisse hors de la liste, et qui ne se verra
              pas : les dépôts hors type dont la rubrique vient de l'autre
              famille. Le chiffre se lit à côté du total montré. */}
          {rubPickHorsTypeLeft > 0 && (
            <span
              className="mine-rub-filter-hors"
              title={t('acct.mine.rubFilterHorsHint').replace('{n}', String(rubPickHorsTypeLeft))}
            >
              <i className="ri-route-line" aria-hidden="true"></i>
              {t('acct.mine.rubFilterHors').replace('{n}', String(rubPickHorsTypeLeft))}
            </span>
          )}
          <button
            type="button"
            className="mine-rub-filter-cross"
            onClick={() => patchFilters({ rubrique: '' })}
            title={[
              t('acct.mine.rubFilterClearCount').replace('{n}', String(rubFilterBack)),
              rubFilterBackHors > 0
                ? t('acct.mine.rubFilterClearHorsCount').replace('{n}', String(rubFilterBackHors))
                : '',
              t('acct.mine.rubFilterClear'),
            ].filter(Boolean).join(' ')}
            aria-label={t('acct.mine.rubFilterClearCount').replace('{n}', String(rubFilterBack))}
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </p>
      )}

      {/* Le resserrement sur les autres rubriques d'origine : ouvert depuis le
          jeton de famille de la ligne « après la série », il se nomme et se
          retire d'un clic — une liste courte ne reste jamais muette. */}
      {originsRest.trim() && (
        <p
          className="mine-rub-filter mine-rub-filter-origins"
          title={t('acct.mine.rubFilterEndIntactDoor')
            .replace('{family}', t(tab === 'annonce'
              ? 'acct.mine.rubriqueFamilyAnnonce'
              : 'acct.mine.rubriqueFamilyOffre'))
            .replace('{n}', String(list.length))
            .concat(` — ${labelOfRubrique(originsRest)}`)}
        >
          <i className="ri-filter-3-line" aria-hidden="true"></i>
          <span>
            {t('acct.mine.rubFilterEndIntactOn')
              .replace('{family}', t(tab === 'annonce'
                ? 'acct.mine.rubriqueFamilyAnnonce'
                : 'acct.mine.rubriqueFamilyOffre'))
              .replace('{n}', String(list.length))}
          </span>
          <span className="mine-rub-filter-n" dir="ltr">
            <b>{list.length}</b>
            <span aria-hidden="true">/</span>
            {tabList.length}
          </span>
          <button
            type="button"
            className="mine-rub-filter-cross"
            onClick={() => patchFilters({ originsRest: '', originsRestFrom: '' })}
            title={`${t('acct.mine.rubFilterEndIntactClear')} ${t('acct.mine.rubFilterEndIntactOff')}`}
            aria-label={t('acct.mine.rubFilterEndIntactClear')}
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </p>
      )}

      {/* Les deux valeurs les plus lourdes, ouvertes ensemble depuis le bas de
          la rangée : elles se nomment, la liste se compte, et sa croix rend la
          liste entière — une liste resserrée n'est jamais muette. */}
      {asidePair.length > 1 && (
        <p
          className="mine-rub-filter mine-rub-filter-pair"
          title={(asidePair.length > 2
            ? t('acct.mine.rubriqueSharedAsideTrioHint')
            : t('acct.mine.rubriqueSharedAsidePairHint'))
            .replace('{names}', asidePairNames)}
        >
          <i className="ri-links-line" aria-hidden="true"></i>
          <span dir="auto">
            {(asidePair.length > 2
              ? t('acct.mine.rubriqueSharedAsideTrio')
              : t('acct.mine.rubriqueSharedAsidePair'))
              .replace('{names}', asidePairNames)}
          </span>
          {/* Ce que ces valeurs tiennent, famille par famille : annonces et
              offres côte à côte, sans quitter le jeton. */}
          {asidePairSides.annonce + asidePairSides.offre > 0 && (
            <span
              className="mine-rub-filter-pair-sides"
              title={t('acct.mine.rubriqueSharedAsidePairSidesHint')
                .replace('{annonce}', String(asidePairSides.annonce))
                .replace('{offre}', String(asidePairSides.offre))}
            >
              <i className="ri-layout-column-line" aria-hidden="true"></i>
              {t('acct.mine.rubriqueSharedAsidePairSides')
                .replace('{annonce}', String(asidePairSides.annonce))
                .replace('{offre}', String(asidePairSides.offre))}
            </span>
          )}
          {/* Le temps que ces valeurs pèsent ensemble, hors de l'écran : le
              jeton additionne leurs durées, sans les relire une à une. Quand
              trois valeurs sont ouvertes, le chiffre les additionne toutes les
              trois. */}
          {(asidePair.length > 2 ? asideThreeMs : asideTwoMs) > 0 && (
            <span
              className="mine-rub-filter-pair-ago"
              title={t(asidePair.length > 2
                ? 'acct.mine.rubriqueSharedAsideTrioAgoHint'
                : 'acct.mine.rubriqueSharedAsidePairAgoHint')
                .replace('{ago}', span(asidePair.length > 2 ? asideThreeMs : asideTwoMs))}
            >
              <i className="ri-time-line" aria-hidden="true"></i>
              {t(asidePair.length > 2
                ? 'acct.mine.rubriqueSharedAsideTrioAgo'
                : 'acct.mine.rubriqueSharedAsidePairAgo')
                .replace('{ago}', span(asidePair.length > 2 ? asideThreeMs : asideTwoMs))}
            </span>
          )}
          {/* La part du temps cumulé que ces trois valeurs pèsent, en
              pourcentage : le jeton la donne à côté de leur temps réuni. */}
          {asidePair.length > 2 && asideThreePct > 0 && (
            <span
              className="mine-rub-filter-pair-share"
              dir="auto"
              title={t('acct.mine.rubriqueSharedAsideTrioShareHint')
                .replace('{pct}', String(asideThreePct))}
            >
              <i className="ri-percent-line" aria-hidden="true"></i>
              {t('acct.mine.rubriqueSharedAsideTrioShare')
                .replace('{pct}', String(asideThreePct))}
            </span>
          )}
          {/* La plus lourde des rubriques que les trois laissent de côté,
              nommée sur le jeton : l’ouverture des trois dit ainsi ce qu’elle
              écarte de plus pesant, sans ouvrir la rangée. */}
          {asidePair.length > 2 && asideThreeLeftHeaviest && (
            <span
              className="mine-rub-filter-pair-leftheavy"
              dir="auto"
              title={t('acct.mine.rubriqueSharedAsideTrioLeftHeaviestHint')
                .replace('{rub}', asideThreeLeftHeaviest.label)}
            >
              <i className="ri-eye-off-line" aria-hidden="true"></i>
              {t('acct.mine.rubriqueSharedAsideTrioLeftHeaviest')
                .replace('{rub}', asideThreeLeftHeaviest.label)}
            </span>
          )}
          {/* Le compte des rubriques laissées hors de la liste est une porte :
              un clic resserre la liste sur elles seules, un second clic la
              rend entière — le chiffre mène quelque part. */}
          {asidePair.length > 2 && asideThreeLeftCount > 0 && (
            <button
              type="button"
              className="mine-rub-filter-pair-leftdoor"
              dir="auto"
              onClick={openAsideLeft}
              title={t('acct.mine.rubriqueSharedAsideLeavesDoorHint')
                .replace('{n}', String(asideThreeLeftCount))
                .replace('{names}', asideThreeLeftNames)}
            >
              <i className="ri-door-open-line" aria-hidden="true"></i>
              {t('acct.mine.rubriqueSharedAsideLeavesDoor')
                .replace('{n}', String(asideThreeLeftCount))}
            </button>
          )}
          <span className="mine-rub-filter-n" dir="ltr">
            <b>{list.length}</b>
            <span aria-hidden="true">/</span>
            {tabList.length}
          </span>
          <button
            type="button"
            className="mine-rub-filter-cross"
            onClick={() => setAsidePair([])}
            title={t('acct.mine.rubriqueSharedAsidePairClear')}
            aria-label={t('acct.mine.rubriqueSharedAsidePairClear')}
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </p>
      )}

      {/* Les rubriques que les trois plus lourdes laissent de côté, ouvertes
          depuis leur compte : elles se nomment, la liste se compte, et sa
          croix rend la liste entière — une liste resserrée n'est jamais
          muette. La porte du retour rouvre les trois valeurs d'un clic. */}
      {asideLeft.length > 0 && (
        <p
          className="mine-rub-filter mine-rub-filter-asideleft"
          title={t('acct.mine.rubriqueSharedAsideLeftHint')
            .replace('{names}', asideLeftNamesShown)}
        >
          <i className="ri-door-open-line" aria-hidden="true"></i>
          <span dir="auto">
            {t('acct.mine.rubriqueSharedAsideLeft').replace('{names}', asideLeftNamesShown)}
          </span>
          {/* Le total en tête du jeton : ce que ces rubriques tiennent ensemble,
              à côté du temps cumulé qu'elles ont passé dehors — un chiffre se
              lit avant de parcourir les pastilles. */}
          {asideLeftTotalN > 0 && (
            <span
              className="mine-rub-filter-asideleft-sum"
              dir="auto"
              title={t('acct.mine.rubriqueSharedAsideLeftSumHint')
                .replace('{n}', String(asideLeftTotalN))
                .replace('{ago}', asideLeftTotalAgo || t('acct.mine.lessHour'))
                .replace('{rubs}', String(asideLeftEach.length))}
            >
              <i className="ri-stack-line" aria-hidden="true"></i>
              {t('acct.mine.rubriqueSharedAsideLeftSum')
                .replace('{n}', String(asideLeftTotalN))}
              {asideLeftTotalAgo && (
                <span
                  className="mine-rub-filter-asideleft-sum-ago"
                  dir="auto"
                  title={t('acct.mine.rubriqueSharedAsideLeftSumAgoHint')
                    .replace('{ago}', asideLeftTotalAgo)}
                >
                  <i className="ri-time-line" aria-hidden="true"></i>
                  {asideLeftTotalAgo}
                </span>
              )}
            </span>
          )}
          {/* Le compte des rubriques restées hors de la liste est une porte :
              un clic resserre la liste sur elles seules — la plus pesante
              dehors déjà nommée — et un second clic la rend entière. */}
          {asideLeftOutRubriques > 0 && (
            <button
              type="button"
              className={`mine-rub-filter-asideleft-out${asideLeftOutOn ? ' is-on' : ''}`}
              dir="auto"
              aria-pressed={asideLeftOutOn}
              onClick={openAsideLeftOut}
              title={[
                asideLeftOutOn
                  ? t('acct.mine.rubriqueSharedAsideLeftOutDoorOn')
                    .replace('{n}', String(asideLeftOutRubriques))
                  : t('acct.mine.rubriqueSharedAsideLeftOutDoor')
                    .replace('{n}', String(asideLeftOutRubriques))
                    .replace('{names}', asideLeftOutNames),
                /* Ce que la porte ramènera, compté avant le clic : le survol
                   ajoute le compte de dépôts au compte de rubriques. */
                asideLeftOutDeposits > 0
                  ? t('acct.mine.rubriqueSharedAsideLeftOutDepositsHint')
                    .replace('{n}', String(asideLeftOutDeposits))
                    .replace('{names}', asideLeftOutNames)
                  : '',
              ].filter(Boolean).join(' ')}
            >
              <i
                className={asideLeftOutOn ? 'ri-door-open-line' : 'ri-eye-off-line'}
                aria-hidden="true"
              ></i>
              {(asideLeftOutRubriques > 1
                ? t('acct.mine.rubriqueSharedAsideLeftOut')
                : t('acct.mine.rubriqueSharedAsideLeftOutOne'))
                .replace('{n}', String(asideLeftOutRubriques))}
            </button>
          )}
          {/* Le compte des dépôts est une porte à part, hors du bouton voisin
              pour rester un vrai bouton : un clic ouvre la rubrique la plus
              fournie hors de la liste, quelle que soit son ancienneté — son
              survol la nomme avant le geste. */}
          {asideLeftOutFullestPick && asideLeftOutDeposits > 0 && (
            <button
              type="button"
              className={`mine-rub-filter-asideleft-out-deps${asideLeftOutFullestOn ? ' is-on' : ''}`}
              dir="auto"
              aria-pressed={asideLeftOutFullestOn}
              onClick={openAsideLeftOutFullest}
              title={[
                asideLeftOutFullestOn
                  ? t('acct.mine.rubriqueSharedAsideLeftOutDepsDoorOn')
                    .replace('{rub}', asideLeftOutFullestPick.label)
                  : t('acct.mine.rubriqueSharedAsideLeftOutDepsDoor')
                    .replace('{rub}', asideLeftOutFullestPick.label)
                    .replace('{n}', String(asideLeftOutFullestPick.n)),
                t('acct.mine.rubriqueSharedAsideLeftOutDepositsHint')
                  .replace('{n}', String(asideLeftOutDeposits))
                  .replace('{names}', asideLeftOutNames),
              ].filter(Boolean).join(' ')}
            >
              <i
                className={asideLeftOutFullestOn ? 'ri-door-open-line' : 'ri-stack-line'}
                aria-hidden="true"
              ></i>
              {t('acct.mine.rubriqueSharedAsideLeftOutDeposits')
                .replace('{n}', String(asideLeftOutDeposits))}
            </button>
          )}
          {/* Les rubriques que la porte du compte a déjà ouvertes sont
              elles-mêmes une porte : un clic rouvre ces rubriques vues, sans
              repasser par le compte — un second clic rend la liste entière. */}
          {asideLeftOutOpened > 0 && (
            <button
              type="button"
              className={`mine-rub-filter-asideleft-out-opened${asideLeftOutTakenOn ? ' is-on' : ''}`}
              dir="auto"
              aria-pressed={asideLeftOutTakenOn}
              onClick={openAsideLeftOutTaken}
              title={[
                asideLeftOutTakenOn
                  ? t('acct.mine.rubriqueSharedAsideLeftOutOpenedDoorOn')
                    .replace('{n}', String(asideLeftOutOpened))
                  : t('acct.mine.rubriqueSharedAsideLeftOutOpenedDoor')
                    .replace('{n}', String(asideLeftOutOpened))
                    .replace('{names}', asideLeftOutTakenNames),
                t('acct.mine.rubriqueSharedAsideLeftOutOpenedHint')
                  .replace('{n}', String(asideLeftOutOpened)),
              ].filter(Boolean).join(' ')}
            >
              <i
                className={asideLeftOutTakenOn ? 'ri-door-open-line' : 'ri-history-line'}
                aria-hidden="true"
              ></i>
              {t('acct.mine.rubriqueSharedAsideLeftOutOpened')
                .replace('{n}', String(asideLeftOutOpened))}
              {/* Ce que ces rubriques déjà vues tiennent encore à corriger : le
                  compte se lit dans la pastille, avant de la rouvrir. */}
              {asideLeftOutTakenDeposits > 0 && (
                <span
                  className="mine-rub-filter-asideleft-out-opened-deps"
                  dir="auto"
                  title={t('acct.mine.rubriqueSharedAsideLeftOutOpenedDepsHint')
                    .replace('{rubs}', String(asideLeftOutOpened))
                    .replace('{n}', String(asideLeftOutTakenDeposits))}
                >
                  {t('acct.mine.rubriqueSharedAsideLeftOutOpenedDeps')
                    .replace('{n}', String(asideLeftOutTakenDeposits))}
                </span>
              )}
            </button>
          )}
          {/* Le temps cumulé que ces rubriques ont passé dehors est une porte :
              un clic resserre la liste sur celle restée le plus longtemps de
              côté — la plus lourde du compte, nommée en tête. */}
          {asideLeftOutRubriques > 0 && asideLeftOutOldestPick && asideLeftOutAgo && (
            <button
              type="button"
              className={`mine-rub-filter-asideleft-out-ago${asideLeftOutOldestOn ? ' is-on' : ''}`}
              dir="auto"
              aria-pressed={asideLeftOutOldestOn}
              onClick={openAsideLeftOutOldest}
              title={[
                asideLeftOutOldestOn
                  ? t('acct.mine.rubriqueSharedAsideLeftOutAgoDoorOn')
                    .replace('{rub}', asideLeftOutOldestPick.label)
                  : t('acct.mine.rubriqueSharedAsideLeftOutAgoDoor')
                    .replace('{rub}', asideLeftOutOldestPick.label)
                    .replace('{ago}', span(asideLeftOutOldestPick.ms)),
                t('acct.mine.rubriqueSharedAsideLeftOutAgoHint')
                  .replace('{ago}', asideLeftOutAgo),
                /* Ce que sa rubrique la plus ancienne ramènera, dit avant le
                   clic : le temps ne se lit plus sans son compte de dépôts. */
                asideLeftOutOldestDeposits > 0
                  ? t('acct.mine.rubriqueSharedAsideLeftOutAgoDepsHint')
                    .replace('{rub}', asideLeftOutOldestPick.label)
                    .replace('{n}', String(asideLeftOutOldestDeposits))
                  : '',
              ].filter(Boolean).join(' ')}
            >
              <i className="ri-time-line" aria-hidden="true"></i>
              {t('acct.mine.rubriqueSharedAsideLeftOutAgo')
                .replace('{ago}', asideLeftOutAgo)}
              {/* Les dépôts que cette rubrique ramènera, posés à côté de sa
                  durée : le compte se lit sur la porte, avant le clic. */}
              {asideLeftOutOldestDeposits > 0 && (
                <span className="mine-rub-filter-asideleft-out-ago-deps" dir="auto">
                  {t('acct.mine.rubriqueSharedAsideLeftOutAgoDeps')
                    .replace('{n}', String(asideLeftOutOldestDeposits))}
                </span>
              )}
            </button>
          )}
          {/* La plus pesante de ces rubriques est une porte : un clic resserre
              la liste sur elle seule et ouvre aussitôt son premier dépôt à
              corriger, curseur dans sa rubrique. Le temps qu’elle a passé
              dehors se lit à côté de son nom. */}
          {asideLeftOutRubriques > 0 && asideLeftOutHeaviest && (
            <button
              type="button"
              className="mine-rub-filter-asideleft-out-heavy"
              dir="auto"
              onClick={openAsideLeftOutHeavy}
              title={[
                t('acct.mine.rubriqueSharedAsideLeftOutTopDoor')
                  .replace('{rub}', asideLeftOutHeaviest.label)
                  .replace('{n}', String(asideLeftOutHeavyRows.length))
                  .replace('{ago}', span(asideLeftOutHeaviest.ms)),
                t('acct.mine.rubriqueSharedAsideLeftOutTopHint')
                  .replace('{rub}', asideLeftOutHeaviest.label)
                  .replace('{ago}', span(asideLeftOutHeaviest.ms)),
              ].join(' ')}
            >
              <i className="ri-fire-line" aria-hidden="true"></i>
              {t('acct.mine.rubriqueSharedAsideLeftOutTop')
                .replace('{rub}', asideLeftOutHeaviest.label)}
              <span className="mine-rub-filter-asideleft-out-top-ago" dir="auto">
                {span(asideLeftOutHeaviest.ms)}
              </span>
              <i
                className="ri-arrow-right-up-line mine-rub-filter-asideleft-out-heavy-go"
                aria-hidden="true"
              ></i>
            </button>
          )}
          {/* Chaque rubrique laissée de côté est une porte : son nom porte ses
              dépôts et le temps qu’elle a passé dehors ; un clic resserre la
              liste sur elle seule. */}
          {/* Le petit signe du tri : les pastilles se rangent par temps passé
              dehors, ou par dépôts — un clic bascule, et le survol dit l'ordre
              lu. Il ne se montre qu'à partir de deux rubriques. */}
          {asideLeftEach.length > 1 && (
            <button
              type="button"
              className="mine-rub-filter-asideleft-sort"
              dir="auto"
              onClick={() => setAsideLeftSort(asideLeftSort === 'ago' ? 'n' : 'ago')}
              title={t('acct.mine.rubriqueSharedAsideLeftSortHint').replace(
                '{sort}',
                t(asideLeftSort === 'ago'
                  ? 'acct.mine.rubriqueSharedAsideLeftSortAgo'
                  : 'acct.mine.rubriqueSharedAsideLeftSortCount'),
              )}
              aria-label={t('acct.mine.rubriqueSharedAsideLeftSortHint').replace(
                '{sort}',
                t(asideLeftSort === 'ago'
                  ? 'acct.mine.rubriqueSharedAsideLeftSortAgo'
                  : 'acct.mine.rubriqueSharedAsideLeftSortCount'),
              )}
            >
              <i
                className={asideLeftSort === 'ago' ? 'ri-time-line' : 'ri-hashtag'}
                aria-hidden="true"
              ></i>
              {t(asideLeftSort === 'ago'
                ? 'acct.mine.rubriqueSharedAsideLeftSortAgo'
                : 'acct.mine.rubriqueSharedAsideLeftSortCount')}
            </button>
          )}
          {asideLeftOrdered.map((item) => {
            const alone = asideLeft.length === 1 && asideLeft[0] === item.value;
            /* La famille que la pastille ouvre d'abord : celle qui tient le
               plus de dépôts de cette rubrique. Quand l'autre en tient aussi,
               le petit signe voisin y ouvre la même rubrique d'un clic. */
            const denseKind: Tab = item.offre > item.annonce ? 'offre' : 'annonce';
            const otherKind: Tab = denseKind === 'annonce' ? 'offre' : 'annonce';
            const otherN = otherKind === 'annonce' ? item.annonce : item.offre;
            const otherFamily = t(otherKind === 'annonce'
              ? 'acct.mine.rubriqueFamilyAnnonce'
              : 'acct.mine.rubriqueFamilyOffre');
            return (
              <span key={item.value} className="mine-rub-filter-asideleft-item">
                <button
                  type="button"
                  className={`mine-rub-filter-asideleft-each${alone ? ' is-on' : ''}${asideLeftHeaviest && item.value === asideLeftHeaviest.value ? ' is-heavy' : ''}`}
                  dir="auto"
                  aria-pressed={alone}
                  onClick={() => openAsideLeftOne(item.value)}
                  title={[
                    alone
                      ? t('acct.mine.rubriqueSharedAsideLeftEachDoorOff')
                        .replace('{rub}', item.label)
                      : t('acct.mine.rubriqueSharedAsideLeftEachDoor')
                        .replace('{rub}', item.label)
                        .replace('{n}', String(item.n)),
                    t('acct.mine.rubriqueSharedAsideLeftEachHint')
                      .replace('{rub}', item.label)
                      .replace('{n}', String(item.n)),
                  ].join(' ')}
                >
                  {t('acct.mine.rubriqueSharedAsideLeftEach')
                    .replace('{rub}', item.label)
                    .replace('{n}', String(item.n))}
                  {/* Le temps que la rubrique a déjà passé hors de l'écran,
                      lu sur sa propre pastille : chaque nom dit son poids. */}
                  {item.ago && (
                    <span
                      className="mine-rub-filter-asideleft-ago"
                      dir="auto"
                      title={t('acct.mine.rubriqueSharedAsideLeftEachAgoHint')
                        .replace('{rub}', item.label)
                        .replace('{ago}', item.ago)}
                    >
                      {t('acct.mine.rubriqueSharedAsideLeftEachAgo').replace('{ago}', item.ago)}
                    </span>
                  )}
                  <i className={alone ? 'ri-check-line' : 'ri-door-open-line'} aria-hidden="true"></i>
                </button>
                {/* Le repère de la plus lourde dehors est une porte : un clic
                    resserre la liste sur cette seule rubrique, dans la
                    famille qui en tient le plus — sans lire chaque durée. */}
                {asideLeftHeaviest && item.value === asideLeftHeaviest.value && (
                  <button
                    type="button"
                    className="mine-rub-filter-asideleft-heavy"
                    dir="auto"
                    aria-pressed={alone}
                    onClick={() => openAsideLeftOne(item.value, denseKind)}
                    title={[
                      alone
                        ? t('acct.mine.rubriqueSharedAsideLeftHeavyDoorOn')
                          .replace('{rub}', item.label)
                        : t('acct.mine.rubriqueSharedAsideLeftHeavyDoor')
                          .replace('{rub}', item.label)
                          .replace('{n}', String(item.n)),
                      t('acct.mine.rubriqueSharedAsideLeftHeavyHint')
                        .replace('{rub}', item.label)
                        .replace('{ago}', item.ago || t('acct.mine.lessHour')),
                    ].join(' ')}
                  >
                    <i className="ri-fire-line" aria-hidden="true"></i>
                    {t('acct.mine.rubriqueSharedAsideLeftHeavy')}
                  </button>
                )}
                {/* La rubrique tient aussi des dépôts dans l'autre famille :
                    le petit signe les ouvre là-bas, sans repasser par le
                    haut de la page ni changer de rubrique à la main. */}
                {otherN > 0 && (
                  <button
                    type="button"
                    className="mine-rub-filter-asideleft-other"
                    dir="auto"
                    onClick={() => openAsideLeftOne(item.value, otherKind)}
                    title={t('acct.mine.rubriqueSharedAsideLeftOtherDoorHint')
                      .replace('{rub}', item.label)
                      .replace('{family}', otherFamily)
                      .replace('{n}', String(otherN))}
                    aria-label={t('acct.mine.rubriqueSharedAsideLeftOtherDoor')
                      .replace('{family}', otherFamily)
                      .replace('{n}', String(otherN))}
                  >
                    <i
                      className={otherKind === 'annonce' ? 'ri-megaphone-line' : 'ri-briefcase-line'}
                      aria-hidden="true"
                    ></i>
                    <b dir="ltr">{otherN}</b>
                    <i className="ri-arrow-right-up-line mine-rub-filter-asideleft-other-go" aria-hidden="true"></i>
                  </button>
                )}
              </span>
            );
          })}
          <span className="mine-rub-filter-n" dir="ltr">
            <b>{list.length}</b>
            <span aria-hidden="true">/</span>
            {tabList.length}
          </span>
          {asideHeaviestThree.length > 2 && (
            <button
              type="button"
              className="mine-rub-filter-asideleft-back"
              dir="auto"
              onClick={backAsideLeftToTrio}
              title={t('acct.mine.rubriqueSharedAsideLeftBackHint')}
            >
              <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
              {t('acct.mine.rubriqueSharedAsideLeftBack')}
            </button>
          )}
          <button
            type="button"
            className="mine-rub-filter-cross"
            onClick={() => { setAsideLeft([]); setAsideLeftOut(null); }}
            title={t('acct.mine.rubriqueSharedAsideLeftClear')}
            aria-label={t('acct.mine.rubriqueSharedAsideLeftClear')}
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </p>
      )}

      {/* La porte posée sous le jeton : quand le resserrement vient d'une
          rubrique d'origine, elle ouvre le premier dépôt de cette rubrique
          pour la correction, curseur déjà dans sa rubrique. */}
      {rubPick.trim() && rubPickFirstHors && (
        <div className="mine-rub-filter-fix">
          <button
            type="button"
            className="mine-rub-filter-fix-main"
            title={[
              t('acct.mine.rubFilterFixFirstHint').replace('{rub}', labelOfRubrique(rubPick)),
              rubPickFixLeft > 0
                ? t('acct.mine.rubFilterFixFirstLeftHint').replace('{n}', String(rubPickFixLeft))
                : t('acct.mine.rubFilterFixFirstLeftEndHint'),
            ].join(' ')}
            onClick={fixFirstOfRubPick}
          >
            <i className="ri-route-line" aria-hidden="true"></i>
            <span>{t('acct.mine.rubFilterFixFirst')}</span>
            {/* Ce qui reste dans cette seule rubrique après le dépôt ouvert :
                le chemin se mesure avant de le prendre. */}
            <span className="mine-rub-filter-fix-rest">
              {rubPickFixLeft > 0
                ? t('acct.mine.rubFilterFixFirstLeft').replace('{n}', String(rubPickFixLeft))
                : t('acct.mine.rubFilterFixFirstLeftEnd')}
            </span>
            {/* Le nom du dépôt que la porte ouvrira, juste après le compte
                restant : on sait ce qu'on ouvre avant de cliquer. */}
            {rubPickFirstHors.titre && (
              <span
                className="mine-rub-filter-fix-name"
                title={`${t('acct.mine.rubFilterFixFirstName')} ${rubPickFirstHors.titre}`}
              >
                « {rubPickFirstHors.titre} »
              </span>
            )}
            <i className="ri-arrow-right-line mine-rub-filter-fix-door" aria-hidden="true"></i>
          </button>
          {/* La croix de la porte : elle saute au dernier dépôt de la série,
              pour la corriger en commençant par la fin — les précédents
              s'ouvrent ensuite d'eux-mêmes, en remontant. */}
          {rubPickFixSeries.length > 1 && (
            <button
              type="button"
              className="mine-rub-filter-fix-last"
              onClick={fixLastOfRubPick}
              title={[
                t('acct.mine.rubFilterFixLastHint')
                  .replace('{title}', rubPickFixSeries[rubPickFixSeries.length - 1].titre),
                t('acct.mine.rubFilterFixLastSumHint')
                  .replace('{n}', String(rubPickFixSeries.length)),
              ].join(' ')}
              aria-label={`${t('acct.mine.rubFilterFixLast')} — ${t('acct.mine.rubFilterFixLastSum').replace('{n}', String(rubPickFixSeries.length))}`}
            >
              <i className="ri-close-line" aria-hidden="true"></i>
              {/* Ce que la croix aura remonté une fois la série terminée :
                  toute la rubrique, du dernier dépôt au premier. */}
              <b dir="ltr">{rubPickFixSeries.length}</b>
            </button>
          )}
        </div>
      )}

      {/* Ce que la porte de la fin annonce sous elle : le nom du dépôt
          qu'elle ouvrira, puis les rubriques d'origine que la série
          laissera intactes, famille par famille. */}
      {((rubPick.trim() && rubPickFixLastRow && rubPickFixSeries.length > 1)
        || (originsRest.trim() && originsRestFrom === 'family')) && (
        <div className="mine-rub-filter-end">
          {rubPick.trim() && rubPickFixLastRow && rubPickFixSeries.length > 1 && (<>
          <button
            type="button"
            className="mine-rub-filter-end-name"
            onClick={fixLastOfRubPick}
            title={t('acct.mine.rubFilterFixLastHint').replace('{title}', rubPickFixLastRow.titre)}
          >
            <i className="ri-skip-back-line" aria-hidden="true"></i>
            <span>{t('acct.mine.rubFilterFixLastName')}</span>
            <b>« {rubPickFixLastRow.titre} »</b>
          </button>
          <p
            className={`mine-rub-filter-end-intact${originsIntactAfter.annonce + originsIntactAfter.offre === 0 ? ' is-end' : ''}`}
            title={t('acct.mine.rubFilterEndIntactHint')}
          >
            <i className="ri-list-check-2" aria-hidden="true"></i>
            {originsIntactAfter.annonce + originsIntactAfter.offre === 0 ? (
              <span>{t('acct.mine.rubFilterEndIntactNone')}</span>
            ) : (
              <>
                <span>{t('acct.mine.rubFilterEndIntact')}</span>
                {(['annonce', 'offre'] as const).map((kind) => {
                  const n = originsIntactAfter[kind];
                  if (n === 0) return null;
                  const family = t(kind === 'annonce'
                    ? 'acct.mine.rubriqueFamilyAnnonce'
                    : 'acct.mine.rubriqueFamilyOffre');
                  const pickedRest = kind === tab && originsRest.trim() === rubPick.trim();
                  return (
                    <button
                      key={kind}
                      type="button"
                      className={`mine-rub-filter-end-family mine-rub-filter-end-family-door${pickedRest ? ' is-on' : ''}`}
                      aria-pressed={pickedRest}
                      title={`${t('acct.mine.rubFilterEndIntactDoor')
                        .replace('{family}', family)
                        .replace('{n}', String(n))} ${pickedRest ? t('acct.mine.rubFilterEndIntactOff') : ''}`}
                      onClick={() => openOriginsRest(kind, rubPick)}
                    >
                      <i
                        className={kind === 'annonce' ? 'ri-megaphone-line' : 'ri-briefcase-line'}
                        aria-hidden="true"
                      ></i>
                      <span>{family}</span>
                      <b dir="ltr">{n}</b>
                    </button>
                  );
                })}
              </>
            )}
          </p>
          </>)}
          {/* Le repère de la ligne « après la série » : le resserrement en
              cours n'est pas venu de la fin de la série, mais d'une porte de
              famille du rappel — et le repère rouvre cette porte d'un clic,
              sans remonter le tableau pour la retrouver. */}
          {originsRest.trim() && originsRestFrom === 'family' && (
            <div className="mine-rub-filter-end-from-row">
            <button
              type="button"
              className="mine-rub-filter-end-from"
              title={[
                t('acct.mine.rubFilterEndFromFamilyDoor').replace(
                  '{family}',
                  t(tab === 'annonce'
                    ? 'acct.mine.rubriqueFamilyAnnonce'
                    : 'acct.mine.rubriqueFamilyOffre'),
                ),
                t('acct.mine.rubFilterEndFromFamilyAsideHint').replace(
                  '{rub}',
                  labelOfRubrique(originsRest),
                ),
                t('acct.mine.rubFilterEndFromFamilyDoorOff'),
                t('acct.mine.rubFilterEndFromFamilyHint'),
              ].join(' ')}
              onClick={() => openOriginsRestForFamily(tab)}
            >
              <i className="ri-filter-3-line" aria-hidden="true"></i>
              <span>
                {t('acct.mine.rubFilterEndFromFamily').replace(
                  '{family}',
                  t(tab === 'annonce'
                    ? 'acct.mine.rubriqueFamilyAnnonce'
                    : 'acct.mine.rubriqueFamilyOffre'),
                )}
              </span>
              {/* La valeur que cette porte écarte, nommée : le repère dit ce
                  qu'il laisse hors du resserrement, pas seulement d'où il vient. */}
              <span
                className="mine-rub-filter-end-from-aside"
                title={t('acct.mine.rubFilterEndFromFamilyAsideHint').replace(
                  '{rub}',
                  labelOfRubrique(originsRest),
                )}
              >
                {t('acct.mine.rubFilterEndFromFamilyAside')
                  .replace('{rub}', labelOfRubrique(originsRest))}
              </span>
              {/* Ce que cette porte laisse hors de l'écran : les dépôts de la
                  valeur écartée, dont le compte se lit avant de la corriger. */}
              {originsAsideLeft > 0 && (
                <span
                  className="mine-rub-filter-end-from-left"
                  title={t('acct.mine.rubFilterEndFromFamilyAsideRestHint')
                    .replace('{n}', String(originsAsideLeft))}
                >
                  <i className="ri-eye-off-line" aria-hidden="true"></i>
                  <b dir="ltr">{originsAsideLeft}</b>
                </span>
              )}
              {/* Ce que ce resserrement laisse encore hors de l'écran, en
                  valeurs d'origine : les rubriques de la famille dont aucun
                  dépôt ne reste dans la liste — la valeur écartée, et celles
                  que la période ou le pays retiennent aussi. */}
              {originsStillAside > 0 && (
                <span
                  className="mine-rub-filter-end-from-still"
                  title={t('acct.mine.rubFilterEndFromStillAsideHint')
                    .replace('{n}', String(originsStillAside))}
                >
                  <i className="ri-stack-line" aria-hidden="true"></i>
                  {originsStillAside === 1
                    ? t('acct.mine.rubFilterEndFromStillAsideOne')
                    : t('acct.mine.rubFilterEndFromStillAside')
                      .replace('{n}', String(originsStillAside))}
                </span>
              )}
              {/* La plus lourde de ces valeurs, nommée avec son compte : le
                  compte est une porte — un clic ramène ses dépôts à l'écran,
                  la liste resserrée sur cette seule valeur. */}
              {originsStillAsideTop && originsStillAsideTop.n > 0 && (
                <button
                  type="button"
                  className={`mine-rub-filter-end-from-heavy mine-rub-filter-end-from-heavy-door${rubPick.trim() === originsStillAsideTop.value ? ' is-on' : ''}`}
                  aria-pressed={rubPick.trim() === originsStillAsideTop.value}
                  onClick={() => openRubriqueOrigin(tab, originsStillAsideTop.value)}
                  title={[
                    t('acct.mine.rubFilterEndFromStillHeavyHint')
                      .replace('{rub}', labelOfRubrique(originsStillAsideTop.value))
                      .replace('{n}', String(originsStillAsideTop.n)),
                    t('acct.mine.rubFilterEndFromStillHeavyDoor')
                      .replace('{rub}', labelOfRubrique(originsStillAsideTop.value)),
                    rubPick.trim() === originsStillAsideTop.value
                      ? t('acct.mine.rubFilterEndIntactOff')
                      : '',
                  ].filter(Boolean).join(' ')}
                >
                  <i className="ri-scales-3-line" aria-hidden="true"></i>
                  {t('acct.mine.rubFilterEndFromStillHeavy')
                    .replace('{rub}', labelOfRubrique(originsStillAsideTop.value))
                    .replace('{n}', String(originsStillAsideTop.n))}
                  <i className="ri-arrow-right-line mine-rub-filter-end-from-heavy-door-i" aria-hidden="true"></i>
                </button>
              )}
              <b dir="ltr">{list.length}</b>
              <i className="ri-arrow-right-line mine-rub-filter-end-from-door" aria-hidden="true"></i>
            </button>
            {/* La porte de la valeur écartée : elle ramène à l'écran les
                dépôts que ce resserrement laissait de côté, tous les
                « CDI » de la famille, prêts à être corrigés. */}
            {originsAsideLeft > 0 && (
              <button
                type="button"
                className={`mine-rub-filter-end-from-aside-door${rubPick.trim() === originsRest.trim() ? ' is-on' : ''}`}
                aria-pressed={rubPick.trim() === originsRest.trim()}
                title={t('acct.mine.rubFilterEndFromAsideDoorHint')
                  .replace('{rub}', labelOfRubrique(originsRest))
                  .replace('{n}', String(originsAsideLeft))}
                onClick={() => openRubriqueOrigin(tab, originsRest)}
              >
                <i className="ri-eye-line" aria-hidden="true"></i>
                <span>
                  {t('acct.mine.rubFilterEndFromAsideDoor')
                    .replace('{rub}', labelOfRubrique(originsRest))}
                </span>
                <b dir="ltr">{originsAsideLeft}</b>
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </button>
            )}
            </div>
          )}
        </div>
      )}

      {notice && <p className="form-msg ok">{notice}</p>}
      {failure && <p className="form-msg err">{failure}</p>}

      {!loading && !error && refusedRows.length > 0 && (
        <div className="mine-bulk">
          <p>
            <i className="ri-refresh-line" aria-hidden="true"></i>
            <span>
              {t('acct.mine.bulkNote')} <b>{refusedRows.length}</b>
            </span>
          </p>
          <div className="mine-bulk-actions">
            {bulkIds ? (
              <>
                <span className="mine-bulk-hint">{t('acct.mine.bulkHint')}</span>
                <button type="button" className="cta" onClick={() => void onRepublishMany(bulkIds)} disabled={bulkBusy || busy}>
                  <i className="ri-check-double-line" aria-hidden="true"></i>
                  {bulkBusy ? t('acct.mine.bulkBusy') : t('acct.mine.bulkConfirm')}
                </button>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setBulkIds(null)}
                  disabled={bulkBusy}
                >
                  {t('acct.mine.cancel')}
                </button>
              </>
            ) : (
              <>
                {pickedRows.length > 0 && (
                  <span className="mine-picked">
                    <i className="ri-checkbox-multiple-line" aria-hidden="true"></i>
                    {t('acct.mine.picked')} <b>{pickedRows.length}</b>
                  </span>
                )}
                {pickedRows.length > 0 && (
                  <button
                    type="button"
                    className="cta"
                    onClick={() => setBulkIds(pickedRows.map((row) => row.id))}
                    disabled={busy || bulkBusy}
                  >
                    <i className="ri-check-double-line" aria-hidden="true"></i>
                    {t('acct.mine.republishPicked')}
                  </button>
                )}
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setBulkIds(refusedRows.map((row) => row.id))}
                  disabled={busy || bulkBusy}
                >
                  <i className="ri-refresh-line" aria-hidden="true"></i>
                  {t('acct.mine.republishAll')}
                </button>
                <button type="button" className="link-btn" onClick={togglePickAll} disabled={busy || bulkBusy}>
                  {pickedRows.length === refusedRows.length ? t('acct.mine.unpickAll') : t('acct.mine.pickAll')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {!loading && !error && refusedRows.length > 1 && (
        <div className="mine-motifs">
          <p className="mine-motifs-head">
            <i className="ri-error-warning-line" aria-hidden="true"></i>
            <span>{t('acct.mine.motifsTitle')}</span>
            <small className="mine-motifs-note">{t('acct.mine.motifsNote')}</small>
          </p>
          <div className="mine-motifs-list">
            {motifGroups.map((group) => (
              <button
                key={group.motif || 'none'}
                type="button"
                className={`mine-motif-chip${motifPick === group.motif ? ' is-on' : ''}${topMotif === group.motif ? ' is-top' : ''}`}
                aria-pressed={motifPick === group.motif}
                onClick={() => setMotifPick(motifPick === group.motif ? null : group.motif)}
                title={group.label}
              >
                <span className="mine-motif-txt">{group.label}</span>
                {topMotif === group.motif && (
                  <span className="mine-motif-top">{t('acct.mine.motifTop')}</span>
                )}
                <b>{group.count}</b>
              </button>
            ))}
            {motifPick !== null && (
              <button type="button" className="mine-motif-clear" onClick={() => setMotifPick(null)}>
                <i className="ri-close-line" aria-hidden="true"></i>
                {t('acct.mine.motifAll')}
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !error && attentionCount > 0 && !attention && (
        <p className="mine-alert">
          <i className="ri-alarm-warning-line" aria-hidden="true"></i>
          <span>
            {t('acct.mine.attentionNote')} <b>{attentionCount}</b>
          </span>
        </p>
      )}

      {/* Les candidatures reçues qu'aucune réponse n'a encore ouvertes : le
          total se lit au-dessus de la liste, les offres concernées portent
          ensuite leur propre jeton d'accent. */}
      {!loading && !error && cands && cands.unreadTotal > 0 && (
        <p className="mine-cand-total" title={t('acct.mine.candUnreadTitle')}>
          <i className="ri-mail-unread-line" aria-hidden="true"></i>
          <span>
            {t('acct.mine.candUnreadTotal')
              .replace('{n}', String(cands.unreadTotal))
              .replace('{offres}', String(cands.unreadOffres))}
          </span>
        </p>
      )}

      {/* Le relevé de réactivité : à côté du délai moyen de chaque offre, la
          part de celles qui répondent en moins de 48 h — le tout dont le
          délai moyen n'est qu'une moyenne. Rien ne s'affiche tant qu'aucune
          offre n'a répondu : la part se lira au premier envoi. */}
      {!loading && !error && tab === 'offre' && cands && cands.replyRated > 0 && (
        <p className="mine-cand-fast" title={t('acct.mine.candFastHint')}>
          <i className="ri-timer-flash-line" aria-hidden="true"></i>
          <span className="mine-cand-fast-txt">
            {t('acct.mine.candFast')
              .replace('{n}', String(cands.replyFast))
              .replace('{offres}', String(cands.replyRated))}
          </span>
          <span className="mine-cand-fast-bar" aria-hidden="true">
            <span className="mine-cand-fast-fill" style={{ width: `${fastShare}%` }}></span>
          </span>
          <b dir="ltr">{fastShare} %</b>
          {slowCount > 0 && (
            <button
              type="button"
              className={`mine-cand-fast-door${onlySlow ? ' is-on' : ''}`}
              aria-pressed={onlySlow}
              onClick={showSlow}
              title={t('acct.mine.candSlowDoorHint')}
            >
              {t('acct.mine.candSlowDoor').replace('{n}', String(slowCount))}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </button>
          )}
        </p>
      )}

      {/* Le filtre ouvert depuis cette ligne : il se nomme, se compte et se
          retire d'un clic, pour qu'une liste courte ne soit jamais une
          liste muette. */}
      {!loading && !error && tab === 'offre' && onlySlow && (
        <p className="mine-cand-slow" aria-live="polite" title={t('acct.mine.candSlowHint')}>
          <i className="ri-timer-line" aria-hidden="true"></i>
          <span>{t('acct.mine.candSlowOn').replace('{n}', String(slowOffres.length))}</span>
          <button type="button" className="mine-cand-slow-clear" onClick={() => setOnlySlow(false)}>
            <i className="ri-close-line" aria-hidden="true"></i>
            {t('acct.mine.filterAll')}
          </button>
        </p>
      )}

      {/* Les offres qui réunissent les deux manques — jamais de candidature,
          pas de salaire non plus : le compte ouvre la liste déjà resserrée sur
          elles, chacune avec sa porte de correction. */}
      {!loading && !error && tab === 'offre' && bareOffres.length > 0 && (
        <button
          type="button"
          className={`mine-bare-alert${onlyBare ? ' is-on' : ''}`}
          aria-pressed={onlyBare}
          onClick={showBare}
          title={onlyBare ? t('acct.mine.bareOff') : t('acct.mine.bareDoor')}
        >
          <i className="ri-eraser-line" aria-hidden="true"></i>
          <span>{t('acct.mine.bareTotal').replace('{n}', String(bareOffres.length))}</span>
          <i className={onlyBare ? 'ri-close-line' : 'ri-arrow-right-line'} aria-hidden="true"></i>
        </button>
      )}

      {/* Le rappel de rubrique : un dépôt dont la rubrique appartient à
          l'autre famille se répare en l'ouvrant, et le compte ouvre la série
          d'un seul parcours — le premier dépôt, puis chacun des suivants. */}
      {!loading && !error && horsTypeTotal > 0 && (
        <div className="mine-rubrique-alert">
          <p className="mine-rubrique-alert-txt" title={t('acct.mine.rubriqueDoor')}>
            <i className="ri-route-line" aria-hidden="true"></i>
            <span>
              {t('acct.mine.rubriqueAlert')} <b>{horsTypeTotal}</b> — {t('acct.mine.rubriqueWalk')}
            </span>
          </p>
          {/* La petite gomme : elle efface la rubrique d'origine retenue sur
              les deux familles d'un clic, et chaque liste retrouve son
              étendue — le compte dit ce qu'elle rend. */}
          {rubPicksOn && (
            <span className="mine-rubrique-eraser-group">
              <button
                type="button"
                className="mine-rubrique-eraser"
                onClick={eraseRubriquePicks}
                title={t('acct.mine.rubriqueEraserHint').replace('{n}', String(rubEraserBack))}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>
                <span>{t('acct.mine.rubriqueEraser')}</span>
              </button>
              {/* Le second geste : effacer les deux rubriques retenues et
                  rouvrir la liste entière sur l'onglet où le travail attend. */}
              <button
                type="button"
                className="mine-rubrique-eraser mine-rubrique-eraser-go"
                onClick={eraseRubriquePicksAndGo}
                title={t('acct.mine.rubriqueEraserGoHint')
                  .replace('{family}', t(workTab === 'annonce'
                    ? 'acct.mine.rubriqueFamilyAnnonce'
                    : 'acct.mine.rubriqueFamilyOffre'))
                  .replace('{n}', String(workTabCount))}
              >
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
                <span>{t('acct.mine.rubriqueEraserGo')}</span>
                <b dir="ltr">{workTabCount}</b>
              </button>
            </span>
          )}
          {/* Le rappel du dernier effacement : ce que la gomme a retiré reste
              sous la main, et sa porte remet les rubriques en place sur les
              deux familles sans toucher au pays, à la période ni au tri. */}
          {lastErase && (
            <span className="mine-rubrique-restore">
              <i className="ri-history-line" aria-hidden="true"></i>
              <span className="mine-rubrique-restore-txt">
                {lastErase.at
                  ? t('acct.mine.rubriqueRestoreNoteDay')
                    .replace('{date}', day(lastErase.at))
                    .replace('{rubs}', lastEraseTxt)
                  : t('acct.mine.rubriqueRestoreNote').replace('{rubs}', lastEraseTxt)}
              </span>
              {/* Le délai écoulé depuis le geste, à côté de sa date : le
                  rappel se lit comme le compte de l'oubli. */}
              {stampOf(lastErase.at ?? '') > 0 && (
                <span
                  className="mine-rubrique-restore-ago"
                  title={t('acct.mine.rubriqueRestoreSinceHint')}
                >
                  {t('acct.mine.rubriqueRestoreSince').replace(
                    '{ago}',
                    span(Date.now() - stampOf(lastErase.at ?? '')),
                  )}
                </span>
              )}
              {/* Ce que la porte rendra à l'écran, famille par famille : le
                  compte se dit avant le geste, pas après. */}
              {lastEraseBackTxt && (
                <span
                  className="mine-rubrique-restore-back"
                  title={t('acct.mine.rubriqueRestoreBackHint').replace('{parts}', lastEraseBackTxt)}
                >
                  {(['annonce', 'offre'] as const).map((kind) => {
                    const n = lastEraseBack[kind];
                    if (n === 0) return null;
                    return (
                      <span key={kind} className="mine-rubrique-restore-family">
                        <i
                          className={kind === 'annonce' ? 'ri-megaphone-line' : 'ri-briefcase-line'}
                          aria-hidden="true"
                        ></i>
                        <span>
                          {t(kind === 'annonce'
                            ? 'acct.mine.rubriqueFamilyAnnonce'
                            : 'acct.mine.rubriqueFamilyOffre')}
                        </span>
                        <b dir="ltr">{n}</b>
                      </span>
                    );
                  })}
                </span>
              )}
              <button
                type="button"
                className="mine-rubrique-restore-door"
                onClick={restoreRubriquePicks}
                title={[
                  t('acct.mine.rubriqueRestoreHint').replace('{rubs}', lastEraseTxt),
                  lastEraseBackTxt
                    ? t('acct.mine.rubriqueRestoreBackHint').replace('{parts}', lastEraseBackTxt)
                    : '',
                ].filter(Boolean).join(' ')}
              >
                <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                {t('acct.mine.rubriqueRestore')}
              </button>
              {/* La petite croix du rappel : elle oublie le dernier effacement
                  et retire sa porte, sans rien remettre en place. */}
              <button
                type="button"
                className="mine-rubrique-restore-forget"
                onClick={forgetLastErase}
                title={t('acct.mine.rubriqueRestoreForgetHint')}
                aria-label={t('acct.mine.rubriqueRestoreForget')}
              >
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            </span>
          )}
          <div
            className="mine-rubrique-alert-doors"
            role="group"
            aria-label={t('acct.mine.rubriqueAlert')}
          >
            {(['annonce', 'offre'] as const).map((kind) => {
              const n = horsTypeByKind[kind].length;
              const origins = horsTypeOrigins[kind];
              /* Ce que la porte laissera à l'écran dans cette famille : les
                 dépôts hors type d'une autre valeur que celle qu'elle écarte. */
              const restDeps = origins[0]
                ? horsTypeByKind[kind].filter(
                  (row) => (row.rubrique || '').trim() !== origins[0].value,
                ).length
                : 0;
              const family = t(kind === 'annonce'
                ? 'acct.mine.rubriqueFamilyAnnonce'
                : 'acct.mine.rubriqueFamilyOffre');
              const originsTxt = origins
                .map((origin) => `${origin.label} ${origin.n}`)
                .join(' · ');
              return (
                <div key={kind} className="mine-rubrique-family">
                  <button
                    type="button"
                    className={`mine-rubrique-family-door${tab === kind ? ' is-on' : ''}`}
                    disabled={n === 0}
                    title={`${t('acct.mine.rubriqueFamilyDoor')
                      .replace('{family}', family)
                      .replace('{n}', String(n))}${originsTxt ? ` ${t('acct.mine.rubriqueFamilyOrigin').replace('{rubs}', originsTxt)}` : ''}`}
                    onClick={() => startRubriqueWalkFor(kind)}
                  >
                    <i
                      className={kind === 'annonce' ? 'ri-megaphone-line' : 'ri-briefcase-line'}
                      aria-hidden="true"
                    ></i>
                    <span>{family}</span>
                    <b>{n}</b>
                  </button>
                  {/* La rubrique d'origine de ces dépôts, juste à côté de la
                      porte : une annonce rangée en contrat, ou l'inverse —
                      le décalage se lit avant d'ouvrir la série. */}
                  {/* Le compte des rubriques d'origine qui restent dans
                      cette famille : le décalage se mesure, famille par
                      famille, avant d'ouvrir la série. */}
                  {origins.length > 0 && (
                    <small
                      className="mine-rubrique-orig-count"
                      title={[
                        t('acct.mine.rubriqueOriginsLeftHint').replace('{family}', family),
                        origins.length > 3
                          ? t('acct.mine.rubriqueOriginsLeftValues').replace('{rubs}', originsTxt)
                          : '',
                      ].filter(Boolean).join(' ')}
                    >
                      <i className="ri-list-check-2" aria-hidden="true"></i>
                      {origins.length === 1
                        ? t('acct.mine.rubriqueOriginsLeftOne')
                        : t('acct.mine.rubriqueOriginsLeft').replace('{n}', String(origins.length))}
                    </small>
                  )}
                  {origins.length > 0 && (
                    <p
                      className="mine-rubrique-family-orig"
                      title={t('acct.mine.rubriqueFamilyOriginHint').replace('{family}', family)}
                    >
                      <i className="ri-corner-down-left-line" aria-hidden="true"></i>
                      {/* Chaque rubrique d'origine est une porte : un clic
                          resserre la liste sur ces dépôts-là, tous les
                          « CDI rangés en annonce » à l'écran. */}
                      <span className="mine-rubrique-orig-list">
                        {origins.map((origin) => {
                          const pickedOrigin = kind === tab && rubPick === origin.value;
                          return (
                            <button
                              key={origin.value}
                              type="button"
                              className={`mine-rubrique-orig-door${pickedOrigin ? ' is-on' : ''}`}
                              aria-pressed={pickedOrigin}
                              title={`${t('acct.mine.rubriqueOriginDoor')
                                .replace('{rub}', origin.label)
                                .replace('{n}', String(origin.n))} ${pickedOrigin ? t('acct.mine.rubriqueOriginDoorOff') : ''}`}
                              onClick={() => openRubriqueOrigin(kind, origin.value)}
                            >
                              <span className="mine-rubrique-orig-label">{origin.label}</span>
                              <b dir="ltr">{origin.n}</b>
                            </button>
                          );
                        })}
                      </span>
                    </p>
                  )}
                  {/* La porte « autres rubriques » de cette famille : elle
                      écarte la valeur la plus habitée et ne garde que les
                      autres origines — le même resserrement que la ligne de
                      la fin, ouvert d'ici. */}
                  {origins.length > 1 && (
                    <button
                      type="button"
                      className={`mine-rubrique-orig-rest${kind === tab && originsRest.trim() === origins[0].value ? ' is-on' : ''}`}
                      aria-pressed={kind === tab && originsRest.trim() === origins[0].value}
                      title={`${t('acct.mine.rubriqueFamilyOrigRestHint')
                        .replace('{family}', family)
                        .replace('{n}', String(origins.length - 1))
                        .replace('{top}', origins[0].label)} ${t('acct.mine.rubriqueFamilyOrigRestDeposits').replace('{n}', String(restDeps))} ${kind === tab && originsRest.trim() === origins[0].value
                        ? t('acct.mine.rubFilterEndIntactOff')
                        : ''}`}
                      onClick={() => openOriginsRestForFamily(kind)}
                    >
                      <i className="ri-filter-3-line" aria-hidden="true"></i>
                      <span>
                        {t('acct.mine.rubriqueFamilyOrigRest').replace('{n}', String(origins.length - 1))}
                      </span>
                      {/* Ce que la porte écarte : la valeur la plus habitée de
                          la famille et son compte, lus à côté des dépôts
                          qu'elle garde — l'écart se mesure avant le clic. */}
                      <span
                        className="mine-rubrique-orig-rest-aside"
                        title={t('acct.mine.rubriqueFamilyOrigRestAsideHint')
                          .replace('{rub}', origins[0].label)
                          .replace('{n}', String(origins[0].n))}
                      >
                        {t('acct.mine.rubriqueFamilyOrigRestAside')
                          .replace('{rub}', origins[0].label)
                          .replace('{n}', String(origins[0].n))}
                      </span>
                      {/* Ce que la valeur la plus lourde laisserait encore
                          hors de l'écran une fois ramenée : la période ou le
                          pays de cette famille retiennent le reste. */}
                      {familyHeavyStill[kind] > 0 && (
                        <span
                          className="mine-rubrique-orig-rest-still"
                          title={t('acct.mine.rubriqueFamilyOrigRestStillHint')
                            .replace('{rub}', origins[0].label)
                            .replace('{n}', String(familyHeavyStill[kind]))}
                        >
                          <i className="ri-eye-off-line" aria-hidden="true"></i>
                          {t('acct.mine.rubriqueFamilyOrigRestStill')
                            .replace('{n}', String(familyHeavyStill[kind]))}
                        </span>
                      )}
                      <span
                        className="mine-rubrique-orig-rest-n"
                        dir="ltr"
                        title={t('acct.mine.rubriqueFamilyOrigRestDeposits').replace('{n}', String(restDeps))}
                      >
                        <i className="ri-file-list-3-line" aria-hidden="true"></i>
                        <b>{restDeps}</b>
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {/* La même valeur d'origine peut ranger des dépôts dans les deux
              familles : elle se signale avec ses deux comptes, pour voir ce
              qu'une correction d'un côté laisserait intact de l'autre. */}
          {sharedOrigins.length > 0 && (
            <p
              className="mine-rubrique-shared"
              title={t('acct.mine.rubriqueSharedHint').replace('{parts}', sharedOriginsTxt)}
            >
              <i className="ri-links-line" aria-hidden="true"></i>
              <span>{t('acct.mine.rubriqueShared')}</span>
              <span className={`mine-rubrique-shared-list${sharedListFolded ? ' is-folded' : ''}`}>
                {sharedRowValues.map((origin) => {
                  const picked = sharedPicked(origin.value);
                  /* Le total des deux familles réunies, posé à côté des deux
                     comptes : le poids de la valeur se lit d'un chiffre. */
                  const together = origin.annonce + origin.offre;
                  return (
                    <span key={origin.value} className="mine-rubrique-shared-pair">
                    <button
                      type="button"
                      className={`mine-rubrique-shared-value${picked ? ' is-on' : ''}`}
                      aria-pressed={picked}
                      onClick={() => openSharedOrigin(origin.value)}
                      title={[
                        t('acct.mine.rubriqueSharedValueHint')
                          .replace('{rub}', origin.label)
                          .replace('{parts}', sharedSidesLine(lang, origin)),
                        t('acct.mine.rubriqueSharedValueDoor')
                          .replace('{rub}', origin.label)
                          .replace('{parts}', sharedSidesLine(lang, origin)),
                        picked ? t('acct.mine.rubriqueSharedValueDoorOff') : '',
                      ].filter(Boolean).join(' ')}
                    >
                      <b>{origin.label}</b>
                      <span className="mine-rubrique-shared-side">
                        <i className="ri-megaphone-line" aria-hidden="true"></i>
                        <span dir="ltr">{origin.annonce}</span>
                      </span>
                      <span className="mine-rubrique-shared-side">
                        <i className="ri-briefcase-line" aria-hidden="true"></i>
                        <span dir="ltr">{origin.offre}</span>
                      </span>
                      <span
                        className="mine-rubrique-shared-total"
                        dir="ltr"
                        title={t('acct.mine.rubriqueSharedTotalHint')
                          .replace('{rub}', origin.label)
                          .replace('{n}', String(together))}
                      >
                        <i className="ri-add-line" aria-hidden="true"></i>
                        <b>{together}</b>
                      </span>
                      <i className="ri-arrow-right-line mine-rubrique-shared-door" aria-hidden="true"></i>
                    </button>
                    </span>
                  );
                })}
                {/* Ce que la rangée repliée garde hors de l’écran : ses
                    valeurs se comptent d’un coup d’œil, et le chiffre est
                    une porte — un clic les ramène toutes. */}
                {sharedListFolded && sharedOrigins.length > SHARED_LIST_FOLD_AT && (
                  <button
                    type="button"
                    className="mine-rubrique-shared-more"
                    onClick={() => {
                      setSharedAsideOnly(false);
                      setSharedListFolded(false);
                    }}
                    title={t('acct.mine.rubriqueSharedListMoreHint').replace(
                      '{n}',
                      String(sharedOrigins.length - SHARED_LIST_FOLD_AT),
                    )}
                  >
                    <i className="ri-add-line" aria-hidden="true"></i>
                    {t('acct.mine.rubriqueSharedListMore')
                      .replace('{n}', String(sharedOrigins.length - SHARED_LIST_FOLD_AT))}
                  </button>
                )}
                {/* Le repli de la rangée : un clic la range quand elle
                    s’allonge, et le compte reste visible même repliée. */}
                {sharedOrigins.length > SHARED_LIST_FOLD_AT && (<>
                  <button
                    type="button"
                    className={`mine-rubrique-shared-fold${sharedListFolded ? ' is-on' : ''}`}
                    aria-expanded={!sharedListFolded}
                    onClick={() => {
                      setSharedAsideOnly(false);
                      setSharedListFolded(!sharedListFolded);
                    }}
                    title={[
                      t('acct.mine.rubriqueSharedListFoldHint'),
                      sharedListFolded && sharedOrigins.length > SHARED_LIST_FOLD_AT
                        ? t('acct.mine.rubriqueSharedListFoldAsideHint')
                          .replace(
                            '{n}',
                            String(sharedOrigins.length - SHARED_LIST_FOLD_AT),
                          )
                          .replace('{names}', foldsAsideNames)
                        : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <i
                      className={sharedListFolded
                        ? 'ri-arrow-down-s-line'
                        : 'ri-arrow-up-s-line'}
                      aria-hidden="true"
                    ></i>
                    {sharedListFolded
                      ? t('acct.mine.rubriqueSharedListUnfold')
                      : t('acct.mine.rubriqueSharedListFold')}
                    <b dir="ltr">{sharedOrigins.length}</b>
                  </button>
                  {/* Ce que la rangée garde hors de l’écran, à côté de son
                      compte total : le chiffre se lit sans compter les valeurs
                      visibles — et il est une porte, qui resserre la rangée
                      sur ces valeurs-là, et sur elles seules. */}
                  {sharedListFolded && sharedAsideCount > 0 && (
                    <button
                      type="button"
                      className={`mine-rubrique-shared-aside-door${sharedAsideOnly ? ' is-on' : ''}`}
                      aria-pressed={sharedAsideOnly}
                      onClick={() => setSharedAsideOnly(!sharedAsideOnly)}
                      title={[
                        (sharedAsideOnly
                          ? t('acct.mine.rubriqueSharedListFoldAsideOnHint')
                          : t('acct.mine.rubriqueSharedListFoldAsideDoorHint'))
                          .replace('{n}', String(sharedAsideCount))
                          .replace('{names}', foldsAsideNames),
                        t('acct.mine.rubriqueSharedAsideDoorAgeHint'),
                      ].join(' ')}
                    >
                      <i
                        className={sharedAsideOnly
                          ? 'ri-contract-left-line'
                          : 'ri-eye-off-line'}
                        aria-hidden="true"
                      ></i>
                      {sharedAsideOnly
                        ? t('acct.mine.rubriqueSharedListFoldAsideOn')
                          .replace('{n}', String(sharedAsideCount))
                        : t('acct.mine.rubriqueSharedListFoldAside')
                          .replace('{n}', String(sharedAsideCount))}
                      {/* Les valeurs que la porte resserre, nommées en clair
                          dans la porte elle-même — sans attendre le survol :
                          on sait ce qu'elle ramène avant de cliquer. */}
                      <span className="mine-rubrique-shared-aside-names">
                        {foldsAsideValues.map((origin, index) => {
                          const age = asideAgeOf(origin.value);
                          return (
                            <span
                              key={origin.value}
                              className="mine-rubrique-shared-aside-name"
                              title={age
                                ? t('acct.mine.rubriqueSharedAsideAgeValue')
                                  .replace('{rub}', origin.label)
                                  .replace('{ago}', age)
                                : origin.label}
                            >
                              {index > 0 && (
                                <span
                                  className="mine-rubrique-shared-aside-dot"
                                  aria-hidden="true"
                                >
                                  ·
                                </span>
                              )}
                              {origin.label}
                              {age && (
                                <b className="mine-rubrique-shared-aside-age" dir="ltr">
                                  {t('acct.mine.rubriqueSharedAsideAgeBadge')
                                    .replace('{ago}', age)}
                                </b>
                              )}
                            </span>
                          );
                        })}
                      </span>
                    </button>
                  )}
                  {/* Le bas de la rangée repliée : le temps cumulé que les
                      valeurs nommées ont déjà passé hors de l'écran, additionné
                      valeur par valeur — un seul chiffre, sans lire les noms. */}
                  {sharedListFolded && asideTotalMs > 0 && (
                    <span
                      className="mine-rubrique-shared-aside-total"
                      title={t('acct.mine.rubriqueSharedAsideTotalHint')}
                    >
                      <i className="ri-time-line" aria-hidden="true"></i>
                      {t('acct.mine.rubriqueSharedAsideTotal')
                        .replace('{ago}', span(asideTotalMs))}
                    </span>
                  )}
                  {/* Quelle valeur pèse le plus dans ce temps cumulé : son nom
                      et sa durée se lisent juste après le total, sans relire
                      chaque valeur nommée au-dessus. */}
                  {sharedListFolded && asideHeaviest && foldsAsideValues.length > 1 && (
                    <span
                      className="mine-rubrique-shared-aside-heavy"
                      title={t('acct.mine.rubriqueSharedAsideHeaviestHint')
                        .replace('{rub}', asideHeaviest.label)
                        .replace('{ago}', span(asideHeaviest.ms))
                        .replace('{total}', span(asideTotalMs))}
                    >
                      <i className="ri-scales-3-line" aria-hidden="true"></i>
                      {t('acct.mine.rubriqueSharedAsideHeaviest')
                        .replace('{rub}', asideHeaviest.label)
                        .replace('{ago}', span(asideHeaviest.ms))}
                      {/* La part de cette valeur dans le temps cumulé, dite en
                          pourcentage : le poids se lit d'un coup d'œil. */}
                      {asideHeaviestPct > 0 && (
                        <b
                          className="mine-rubrique-shared-aside-share"
                          dir="ltr"
                          title={t('acct.mine.rubriqueSharedAsideHeaviestShareHint')
                            .replace('{rub}', asideHeaviest.label)
                            .replace('{pct}', String(asideHeaviestPct))}
                        >
                          {t('acct.mine.rubriqueSharedAsideHeaviestShare')
                            .replace('{pct}', String(asideHeaviestPct))}
                        </b>
                      )}
                    </span>
                  )}
                  {/* Le petit signe du bas de la rangée repliée : il ouvre
                      directement la valeur la plus lourde dans la liste, sans
                      passer par la porte de gomme — la valeur se lit là où
                      elle se corrige. */}
                  {sharedListFolded && asideHeaviest && (
                    <button
                      type="button"
                      className={`mine-rubrique-shared-aside-open${rubPick.trim() === asideHeaviest.value && tab === asideHeaviestKind ? ' is-on' : ''}`}
                      aria-pressed={rubPick.trim() === asideHeaviest.value && tab === asideHeaviestKind}
                      onClick={() => openRubriqueOrigin(asideHeaviestKind, asideHeaviest.value)}
                      title={rubPick.trim() === asideHeaviest.value && tab === asideHeaviestKind
                        ? t('acct.mine.rubriqueSharedAsideHeaviestOpenOn')
                          .replace('{rub}', asideHeaviest.label)
                        : t('acct.mine.rubriqueSharedAsideHeaviestOpenHint')
                          .replace('{rub}', asideHeaviest.label)}
                    >
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      {t('acct.mine.rubriqueSharedAsideHeaviestOpen')}
                      {/* Combien de dépôts cette porte ramènera : le compte se
                          lit sur la porte elle-même, avant le clic. */}
                      {asideHeaviestDeposits > 0 && (
                        <b
                          className="mine-rubrique-shared-aside-open-n"
                          dir="ltr"
                          title={t('acct.mine.rubriqueSharedAsideHeaviestOpenCountHint')
                            .replace('{rub}', asideHeaviest.label)
                            .replace('{n}', String(asideHeaviestDeposits))
                            .replace('{annonce}', String(asideHeaviest.annonce))
                            .replace('{offre}', String(asideHeaviest.offre))}
                        >
                          {t('acct.mine.rubriqueSharedAsideHeaviestOpenCount')
                            .replace('{n}', String(asideHeaviestDeposits))}
                        </b>
                      )}
                    </button>
                  )}
                  {/* Le second signe du bas de la rangée : les deux valeurs les
                      plus lourdes s'ouvrent ensemble, d'un seul clic — la
                      liste se resserre sur elles deux, sans passer par la
                      porte de gomme ni par la porte de la plus lourde. */}
                  {sharedListFolded && asideHeaviestTwo.length > 1 && (
                    <button
                      type="button"
                      className={`mine-rubrique-shared-aside-open mine-rubrique-shared-aside-two${asidePairOn ? ' is-on' : ''}`}
                      aria-pressed={asidePairOn}
                      onClick={openAsidePair}
                      title={(asidePairOn
                        ? t('acct.mine.rubriqueSharedAsideTwoOpenOn')
                          .replace('{names}', asideHeaviestTwoNames)
                        : t('acct.mine.rubriqueSharedAsideTwoOpenHint')
                          .replace('{names}', asideHeaviestTwoNames))
                        .concat(asideTwoLeftLightest
                          ? ` ${t('acct.mine.rubriqueSharedAsideTwoLeftHint')
                            .replace('{rub}', asideTwoLeftLightest.label)}`
                          : '')}
                    >
                      <i
                        className={asidePairOn ? 'ri-close-line' : 'ri-links-line'}
                        aria-hidden="true"
                      ></i>
                      {t('acct.mine.rubriqueSharedAsideTwoOpen')}
                    </button>
                  )}
                  {/* Le troisième signe du bas de la rangée : les trois valeurs
                      les plus lourdes s'ouvrent ensemble, d'un seul clic — le
                      compte des dépôts qu'il ramène se lit sur le signe. */}
                  {sharedListFolded && asideHeaviestThree.length > 2 && (
                    <button
                      type="button"
                      className={`mine-rubrique-shared-aside-open mine-rubrique-shared-aside-three${asideTrioOn ? ' is-on' : ''}`}
                      aria-pressed={asideTrioOn}
                      onClick={openAsideTrio}
                      title={(asideTrioOn
                        ? t('acct.mine.rubriqueSharedAsideThreeOpenOn')
                          .replace('{names}', asideHeaviestThreeNames)
                        : t('acct.mine.rubriqueSharedAsideThreeOpenHint')
                          .replace('{names}', asideHeaviestThreeNames))
                        .concat(asideThreeLeftLightest
                          ? ` ${t('acct.mine.rubriqueSharedAsideThreeLeftHint')
                            .replace('{rub}', asideThreeLeftLightest.label)}`
                          : '')
                        .concat(asideThreeLeftCount > 0
                          ? ` ${t('acct.mine.rubriqueSharedAsideThreeLeftRest')
                            .replace('{n}', String(asideThreeLeftCount))}`
                          : '')
                        /* La liste resserrée sur les rubriques laissées de côté :
                           le signe dit ce que cette lecture tient encore dehors. */
                        .concat(asideLeftOutRubriques > 0
                          ? ` ${t('acct.mine.rubriqueSharedAsideThreeLeftOutHint')
                            .replace('{n}', String(asideLeftOutRubriques))}`
                          : '')}
                    >
                      <i
                        className={asideTrioOn ? 'ri-close-line' : 'ri-stack-line'}
                        aria-hidden="true"
                      ></i>
                      {t('acct.mine.rubriqueSharedAsideThreeOpen')}
                      {/* Combien de dépôts ce signe ramènera : le compte se lit
                          dessus, avant le clic. */}
                      {asideThreeDeposits > 0 && (
                        <b
                          className="mine-rubrique-shared-aside-open-n"
                          dir="ltr"
                          title={t('acct.mine.rubriqueSharedAsideThreeOpenCountHint')
                            .replace('{n}', String(asideThreeDeposits))
                            .replace('{annonce}', String(asideThreeSides.annonce))
                            .replace('{offre}', String(asideThreeSides.offre))}
                        >
                          {t('acct.mine.rubriqueSharedAsideThreeOpenCount')
                            .replace('{n}', String(asideThreeDeposits))}
                        </b>
                      )}
                      {/* Quand la liste est resserrée sur les rubriques laissées
                          de côté, le signe porte le compte de celles qui sont
                          restées dehors — le chiffre ne se lit pas sans lui. */}
                      {asideLeftOn && asideLeftOutRubriques > 0 && (
                        <span
                          className="mine-rubrique-shared-aside-leftout"
                          dir="auto"
                          title={t('acct.mine.rubriqueSharedAsideThreeLeftOutHint')
                            .replace('{n}', String(asideLeftOutRubriques))}
                        >
                          <i className="ri-eye-off-line" aria-hidden="true"></i>
                          {t('acct.mine.rubriqueSharedAsideThreeLeftOut')
                            .replace('{n}', String(asideLeftOutRubriques))}
                        </span>
                      )}
                    </button>
                  )}
                </>)}
              </span>
              {/* La copie d'une seule famille : les mêmes valeurs, mais avec le
                  seul compte de l'onglet ouvert — l'autre côté reste hors du
                  texte, pour un message qui ne parle que d'une famille. */}
              <CopyTextButton
                className="mine-rubrique-shared-copy mine-rubrique-shared-copyfam"
                label={t('acct.mine.rubriqueSharedCopyFamily').replace('{family}', tabFamily)}
                hint={t('acct.mine.rubriqueSharedCopyFamilyHint')
                  .replace('{family}', tabFamily)
                  .replace('{n}', String(sharedOrigins.length))}
                build={() => sharedCopyFamilyTxt}
                trailing={<b dir="ltr">{sharedOrigins.length}</b>}
              />
              {/* La copie est groupée : toutes les valeurs partagées d'un
                  seul clic, une ligne chacune — la rubrique nommée, ses deux
                  comptes et leur somme, prêts à coller. */}
              <CopyTextButton
                className="mine-rubrique-shared-copy mine-rubrique-shared-copyall"
                label={t('acct.mine.rubriqueSharedCopyAll')}
                hint={t('acct.mine.rubriqueSharedCopyAllHint')
                  .replace('{n}', String(sharedOrigins.length))}
                build={() => sharedCopyAllTxt}
                trailing={<b dir="ltr">{sharedOrigins.length}</b>}
              />
              {/* La langue visée par la pastille : trois langues, une seule
                  retenue — sans choix, la pastille suit le sélecteur de la
                  page, et la langue suivie porte sa marque. */}
              <span
                className="mine-rubrique-shared-langs"
                role="group"
                aria-label={t('acct.mine.rubriqueSharedTarget')}
                title={t('acct.mine.rubriqueSharedTargetHint')}
              >
                <i className="ri-global-line" aria-hidden="true"></i>
                {TARGET_LANGS.map((code) => {
                  const on = otherLang === code;
                  const pinned = memory.sharedTarget === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      className={`mine-rubrique-shared-langs-opt${on ? ' is-on' : ''}${on && !pinned ? ' is-auto' : ''}`}
                      aria-pressed={pinned}
                      onClick={() => setSharedTarget(pinned ? '' : code)}
                      title={`${t(LANG_NAME_KEY[code])} — ${pinned
                        ? t('acct.mine.rubriqueSharedTargetPinned')
                        : t('acct.mine.rubriqueSharedTargetPick')}`}
                    >
                      {code.toUpperCase()}
                    </button>
                  );
                })}
              </span>
              {/* Le même relevé dans la langue retenue, les noms de rubriques
                  restant tels qu'ils s'affichent ici — prêt à coller d'un
                  autre côté. */}
              <CopyTextButton
                className="mine-rubrique-shared-copy mine-rubrique-shared-copyother"
                label={t('acct.mine.rubriqueSharedCopyOther').replace('{lang}', otherLangName)}
                hint={t('acct.mine.rubriqueSharedCopyOtherHint')
                  .replace('{lang}', otherLangName)
                  .replace('{n}', String(sharedOrigins.length))}
                build={() => sharedCopyOtherTxt}
                onCopied={() => noteSharedCopied(otherLang, sharedOrigins.length)}
                trailing={(
                  <>
                    <b dir="ltr">{sharedOrigins.length}</b>
                    {otherLangTaken > 0 && (
                      <span
                        className="mine-rubrique-shared-copy-taken"
                        title={t('acct.mine.rubriqueSharedCopyOtherTakenHint')
                          .replace('{lang}', otherLangName)
                          .replace('{n}', String(otherLangTaken))}
                      >
                        {t('acct.mine.rubriqueSharedCopyOtherTaken')
                          .replace('{n}', String(otherLangTaken))}
                      </span>
                    )}
                    {/* La langue retenue se signale quand le sélecteur de la
                        page a changé : la pastille ne suit plus, et le dit. */}
                    {langKeptOff && (
                      <span
                        className="mine-rubrique-shared-copy-kept"
                        title={t('acct.mine.rubriqueSharedCopyKeptHint')
                          .replace('{lang}', otherLangName)
                          .replace('{auto}', autoLangName)}
                      >
                        <i className="ri-lock-line" aria-hidden="true"></i>
                        {t('acct.mine.rubriqueSharedCopyKept')
                          .replace('{lang}', otherLangName)}
                      </span>
                    )}
                  </>
                )}
              />
              {/* La petite gomme de la pastille : elle remet à zéro le compte
                  de cette seule langue, gardé sur l’appareil — les deux autres
                  langues gardent le leur. */}
              {otherLangTaken > 0 && (
                <button
                  type="button"
                  className="mine-rubrique-shared-copy-erase"
                  onClick={eraseSharedTaken}
                  title={t('acct.mine.rubriqueSharedCopyOtherEraseHint')
                    .replace('{lang}', otherLangName)
                    .replace('{n}', String(otherLangTaken))}
                  aria-label={t('acct.mine.rubriqueSharedCopyOtherErase')
                    .replace('{lang}', otherLangName)}
                >
                  <i className="ri-eraser-line" aria-hidden="true"></i>
                </button>
              )}
              {/* Le compte de cette gomme, à côté d’elle — le même jeton que
                  la gomme des replis, pour les lire d’un même geste. */}
              <SharedEraseCount
                count={otherErasedCount}
                day={otherErasedDay}
                lastAt={memory.otherErasedLastAt}
                erased={memory.otherErasedTrace}
                onNarrow={eraseDoorFamily(memory.otherErasedTrace)
                  ? () => openErasedFamily('other', memory.otherErasedTrace)
                  : null}
                narrowTitle={[eraseDoorTitle(memory.otherErasedTrace), eraseDoorBackTitle('other', memory.otherErasedTrace)].filter(Boolean).join(' ')}
                narrowBackTitle={eraseDoorBackTitle('other', memory.otherErasedTrace)}
                narrowActive={erasedDoor?.id === 'other'}
                opens={memory.eraseDoorOpens.other ?? 0}
              />
              {/* Le séparateur du relevé compact : trois signes, un seul
                  retenu — le choix se garde sur l’appareil. */}
              <span
                className="mine-rubrique-shared-sep"
                role="group"
                aria-label={t('acct.mine.rubriqueSharedSep')}
                title={t('acct.mine.rubriqueSharedSepHint')}
              >
                <i className="ri-more-line" aria-hidden="true"></i>
                {SEPARATORS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`mine-rubrique-shared-sep-opt${memory.sharedSep === item.value ? ' is-on' : ''}`}
                    aria-pressed={memory.sharedSep === item.value}
                    onClick={() => setSharedSep(item.value)}
                    title={t(item.key)}
                  >
                    {item.value}
                  </button>
                ))}
              </span>
              {/* La copie compacte : les mêmes valeurs, mais sur une seule
                  ligne, séparées par le signe choisi — pour un message court.
                  Son compte dit combien de fois la ligne est déjà partie. */}
              <CopyTextButton
                className="mine-rubrique-shared-copy mine-rubrique-shared-copycompact"
                label={t('acct.mine.rubriqueSharedCopyCompact')}
                hint={t('acct.mine.rubriqueSharedCopyCompactHint')
                  .replace('{n}', String(sharedOrigins.length))}
                build={() => sharedCopyCompactTxt}
                onCopied={() => {
                  noteSharedCompactCopied(sharedLimit);
                  noteSharedSepUsed(memory.sharedSep, sharedCompactChars);
                }}
                trailing={(
                  <>
                    <b dir="ltr">{sharedOrigins.length}</b>
                    {/* Le compte des copies déjà parties, avec le seuil sous
                        lequel la dernière est partie : les deux se gardent
                        ensemble sur l'appareil. */}
                    {sharedCompactCopies > 0 && (
                      <span
                        className="mine-rubrique-shared-copy-taken"
                        title={t('acct.mine.rubriqueSharedCopyCompactTakenHint')
                          .replace('{n}', String(sharedCompactCopies))}
                      >
                        {t('acct.mine.rubriqueSharedCopyCompactTaken')
                          .replace('{n}', String(sharedCompactCopies))}
                      </span>
                    )}
                    {sharedCompactCopies > 0 && sharedCompactLimitUsed && (
                      <span
                        className="mine-rubrique-shared-copy-lastlimit"
                        title={t('acct.mine.rubriqueSharedCopyCompactLastLimitHint')
                          .replace('{n}', String(sharedCompactLimitUsed))}
                      >
                        <i className="ri-ruler-2-line" aria-hidden="true"></i>
                        {t('acct.mine.rubriqueSharedCopyCompactLastLimit')
                          .replace('{n}', String(sharedCompactLimitUsed))}
                      </span>
                    )}
                  </>
                )}
              />
              {/* La petite gomme du compte de la ligne courte : elle le remet
                  à zéro sans toucher aux comptes des autres langues. */}
              {sharedCompactCopies > 0 && (
                <button
                  type="button"
                  className="mine-rubrique-shared-copy-erase"
                  onClick={eraseSharedCompactTaken}
                  title={t('acct.mine.rubriqueSharedCopyCompactEraseHint')
                    .replace('{n}', String(sharedCompactCopies))}
                  aria-label={t('acct.mine.rubriqueSharedCopyCompactErase')}
                >
                  <i className="ri-eraser-line" aria-hidden="true"></i>
                </button>
              )}
              {/* Le compte de la gomme de la ligne courte, dans la même
                  écriture que les autres. */}
              <SharedEraseCount
                count={compactErasedCount}
                day={compactErasedDay}
                lastAt={memory.compactErasedLastAt}
                erased={memory.compactErasedTrace}
                onNarrow={eraseDoorFamily(memory.compactErasedTrace)
                  ? () => openErasedFamily('compact', memory.compactErasedTrace)
                  : null}
                narrowTitle={[eraseDoorTitle(memory.compactErasedTrace), eraseDoorBackTitle('compact', memory.compactErasedTrace)].filter(Boolean).join(' ')}
                narrowBackTitle={eraseDoorBackTitle('compact', memory.compactErasedTrace)}
                narrowActive={erasedDoor?.id === 'compact'}
                opens={memory.eraseDoorOpens.compact ?? 0}
              />
              {/* L’aperçu : la ligne telle qu’elle partira, séparateur compris,
                  lue avant le clic — rien ne part sans avoir été vu. */}
              <span
                className={`mine-rubrique-shared-preview${previewFolded ? ' is-folded' : ''}`}
                title={t('acct.mine.rubriqueSharedPreviewHint')
                  .replace('{sep}', memory.sharedSep)}
              >
                <i className="ri-eye-line" aria-hidden="true"></i>
                <span className="mine-rubrique-shared-preview-label">
                  {t('acct.mine.rubriqueSharedPreview')}
                </span>
                <b className="mine-rubrique-shared-preview-txt" dir="auto">
                  {sharedCopyCompactTxt}
                </b>
                {/* La longueur de la ligne : le lecteur sait si elle tiendra
                    d'un seul trait dans un message. */}
                <span
                  className="mine-rubrique-shared-preview-chars"
                  dir="ltr"
                  title={t('acct.mine.rubriqueSharedPreviewCharsHint')
                    .replace('{n}', String(sharedCompactChars))}
                >
                  {t('acct.mine.rubriqueSharedPreviewChars')
                    .replace('{n}', String(sharedCompactChars))}
                </span>
                {/* La limite sous laquelle la ligne se mesure : trois seuils,
                    un seul retenu — le choix se garde sur l’appareil. */}
                <span
                  className="mine-rubrique-shared-limit"
                  role="group"
                  aria-label={t('acct.mine.rubriqueSharedLimit')}
                  title={t('acct.mine.rubriqueSharedLimitHint')}
                >
                  <i className="ri-ruler-2-line" aria-hidden="true"></i>
                  {SHARED_LIMITS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`mine-rubrique-shared-limit-opt${sharedLimit === value ? ' is-on' : ''}`}
                      aria-pressed={sharedLimit === value}
                      onClick={() => setSharedLimit(value)}
                      title={t('acct.mine.rubriqueSharedLimitOpt')
                        .replace('{n}', String(value))}
                    >
                      {value}
                    </button>
                  ))}
                </span>
                {/* Le défilement des seuils : un clic passe au suivant —
                    140, 160, 280, puis l'on revient à 140. */}
                <button
                  type="button"
                  className="mine-rubrique-shared-limit-next"
                  onClick={() => setSharedLimit(sharedLimitNext)}
                  title={t('acct.mine.rubriqueSharedLimitNextHint')}
                  aria-label={`${t('acct.mine.rubriqueSharedLimitNext')} — ${sharedLimitNext}`}
                >
                  <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
                  <b dir="ltr">{sharedLimitNext}</b>
                </button>
                {/* Le seuil de repli automatique : au-delà de ce nombre de
                    valeurs, l’aperçu se range de lui-même — le seuil reste
                    réglable, et se garde sur l’appareil. */}
                <span
                  className="mine-rubrique-shared-foldat"
                  role="group"
                  aria-label={t('acct.mine.rubriqueSharedFoldAt')}
                  title={t('acct.mine.rubriqueSharedFoldAtHint')}
                >
                  <i className="ri-contract-up-down-line" aria-hidden="true"></i>
                  {SHARED_FOLD_ATS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`mine-rubrique-shared-foldat-opt${sharedFoldAt === value ? ' is-on' : ''}`}
                      aria-pressed={sharedFoldAt === value}
                      onClick={() => setSharedFoldAt(value)}
                      title={t('acct.mine.rubriqueSharedFoldAtOpt')
                        .replace('{n}', String(value))}
                    >
                      {value}
                    </button>
                  ))}
                </span>
                {/* Le verdict : la ligne tient sous la limite choisie, ou de
                    combien de caractères elle la dépasse. */}
                <span
                  className={`mine-rubrique-shared-preview-fit${sharedFits ? ' is-fits' : ' is-over'}`}
                  title={t('acct.mine.rubriqueSharedPreviewFitHint')
                    .replace('{n}', String(sharedLimit))
                    .replace('{chars}', String(sharedCompactChars))}
                >
                  <i
                    className={sharedFits ? 'ri-check-line' : 'ri-alert-line'}
                    aria-hidden="true"
                  ></i>
                  {sharedFits
                    ? t('acct.mine.rubriqueSharedPreviewFits').replace('{n}', String(sharedLimit))
                    : t('acct.mine.rubriqueSharedPreviewOver')
                      .replace('{over}', String(sharedOver))
                      .replace('{n}', String(sharedLimit))}
                </span>
                {/* L’aperçu replié se dit d’un mot : la ligne garde sa
                    longueur et son seuil, le relevé long reste à un clic. */}
                {previewFolded && (
                  <span className="mine-rubrique-shared-preview-folded">
                    {t(previewFoldManual === null && sharedAutoFolded
                      ? 'acct.mine.rubriqueSharedAutoFolded'
                      : 'acct.mine.rubriqueSharedPreviewFolded')
                      .replace('{n}', String(sharedFoldAt))}
                  </span>
                )}
                {/* Le repli de l’aperçu : un clic range le texte long quand
                    le relevé compte beaucoup de valeurs. */}
                <button
                  type="button"
                  className="mine-rubrique-shared-preview-fold"
                  onClick={togglePreviewFold}
                  aria-expanded={!previewFolded}
                  aria-label={previewFolded
                    ? t('acct.mine.rubriqueSharedPreviewUnfold')
                    : t('acct.mine.rubriqueSharedPreviewFold')}
                  title={[
                    t('acct.mine.rubriqueSharedPreviewFoldHint'),
                    t('acct.mine.rubriqueSharedPreviewFoldGainHint')
                      .replace('{n}', String(sharedCompactChars)),
                  ].join(' ')}
                >
                  <i
                    className={previewFolded ? 'ri-eye-line' : 'ri-eye-off-line'}
                    aria-hidden="true"
                  ></i>
                  {/* Ce que le repli retire à la ligne : la longueur du texte
                      long qui s'efface, en caractères — la hauteur reprise se
                      mesure avant le clic, sans la deviner. */}
                  <b className="mine-rubrique-shared-preview-fold-gain" dir="ltr">
                    {t('acct.mine.rubriqueSharedPreviewFoldGain')
                      .replace('{n}', String(sharedCompactChars))}
                  </b>
                </button>
                {/* La petite gomme des deux replis : un clic rend l'aperçu à
                    son seuil automatique et rouvre la rangée des valeurs. */}
                {(previewFoldManual !== null || sharedListFolded) && (
                  <>
                    {/* Ce que la gomme rendra à l'écran, famille de valeurs
                        par famille : l'aperçu déplié, et les valeurs que la
                        rangée gardait de côté avec leurs deux comptes. */}
                    <span
                      className="mine-rubrique-shared-folds-back"
                      title={t('acct.mine.rubriqueSharedFoldsBackHint')
                        .replace('{preview}', previewFoldManual !== null
                          ? t('acct.mine.rubriqueSharedFoldsBackPreview')
                          : '')
                        .replace('{n}', String(foldsAsideValues.length))
                        .replace('{annonce}', String(foldsAsideSides.annonce))
                        .replace('{offre}', String(foldsAsideSides.offre))}
                    >
                      {previewFoldManual !== null && (
                        <span className="mine-rubrique-shared-folds-back-part">
                          <i className="ri-eye-line" aria-hidden="true"></i>
                          {t('acct.mine.rubriqueSharedFoldsBackPreview')}
                        </span>
                      )}
                      {foldsAsideValues.length > 0 && (
                        <>
                          <span className="mine-rubrique-shared-folds-back-part">
                            <i className="ri-stack-line" aria-hidden="true"></i>
                            {t('acct.mine.rubriqueSharedFoldsBackValues')
                              .replace('{n}', String(foldsAsideValues.length))}
                          </span>
                          {(['annonce', 'offre'] as const).map((kind) => {
                            const n = foldsAsideSides[kind];
                            if (n === 0) return null;
                            return (
                              <span
                                key={kind}
                                className="mine-rubrique-shared-folds-back-side"
                                dir="ltr"
                              >
                                <i
                                  className={kind === 'annonce'
                                    ? 'ri-megaphone-line'
                                    : 'ri-briefcase-line'}
                                  aria-hidden="true"
                                ></i>
                                {n}
                              </span>
                            );
                          })}
                        </>
                      )}
                    </span>
                    <button
                      type="button"
                      className="mine-rubrique-shared-folds-erase"
                      onClick={eraseSharedFolds}
                      title={t('acct.mine.rubriqueSharedFoldsEraseHint')}
                      aria-label={t('acct.mine.rubriqueSharedFoldsErase')}
                    >
                      <i className="ri-eraser-line" aria-hidden="true"></i>
                    </button>
                  </>
                )}
                {/* Le petit compte de la gomme : combien de fois elle a servi,
                    et le jour du dernier geste — il reste sous les yeux même
                    quand plus aucun repli n'est tenu. */}
                <SharedEraseCount
                  className="mine-rubrique-shared-erase-count"
                  count={foldsErasedCount}
                  day={foldsErasedDay}
                  lastAt={memory.foldsErasedLastAt}
                  erased={memory.foldsErasedTrace}
                  onNarrow={eraseDoorFamily(memory.foldsErasedTrace)
                    ? () => openErasedFamily('folds', memory.foldsErasedTrace)
                    : null}
                  narrowTitle={[eraseDoorTitle(memory.foldsErasedTrace), eraseDoorBackTitle('folds', memory.foldsErasedTrace)].filter(Boolean).join(' ')}
                  narrowBackTitle={eraseDoorBackTitle('folds', memory.foldsErasedTrace)}
                  narrowActive={erasedDoor?.id === 'folds'}
                  opens={memory.eraseDoorOpens.folds ?? 0}
                />
              </span>
              {/* La ligne récapitulative : le nombre de valeurs, la longueur de
                  la ligne sous son seuil et les deux comptes de copies,
                  copiable d'un geste — et son propre compte de copies. */}
              <SharedRecap
                values={sharedOrigins.length}
                chars={sharedCompactChars}
                limit={sharedLimit}
                langName={otherLangName}
                otherTaken={otherLangTaken}
                compactTaken={sharedCompactCopies}
                copied={sharedRecapCopies}
                sep={memory.sharedSep}
                sepUsed={sepUsed}
                folded={previewFolded}
                foldAt={sharedFoldAt}
                listFolded={sharedListFolded}
                listFoldAt={SHARED_LIST_FOLD_AT}
                foldsErased={foldsErasedCount}
                foldsErasedDay={foldsErasedDay}
                oldestEraseDay={oldestEraseDay}
                asideAgo={asideTotalMs > 0 ? span(asideTotalMs) : ''}
                asideLongest={asideHeaviest ? asideHeaviest.label : ''}
                asideTwoNames={asideHeaviestTwoNames}
                asideTwoDeposits={asideTwoDeposits}
                asideTwoShare={asideTwoPct}
                asideThreeNames={asideHeaviestThreeNames}
                asideThreeDeposits={asideThreeDeposits}
                asideThreeLeft={asideThreeLeftNames}
                asideThreeShare={asideThreePct}
                asideLeftEach={asideThreeLeftEachTxt}
                asideLeftTotalN={asideLeftTotalN}
                asideLeftTotalAgo={asideLeftTotalAgo}
                asideLeftTotalRubs={asideLeftEach.length}
                asideLeftHeaviest={asideLeftHeaviest?.label ?? ''}
                asideLeftHeaviestAgo={asideLeftHeaviest?.ago ?? ''}
                asideLeftHeavyLeft={asideLeftOutHeavyLeft}
                asideLeftOpened={asideLeftOutOpened}
                asideLeftRestAgo={asideLeftOutRestAgo}
                erasedCount={recapErasedCount}
                erasedDay={recapErasedDay}
                erasedLastAt={memory.recapErasedLastAt}
                erasedOpens={memory.eraseDoorOpens.recap ?? 0}
                doorFilters={doorFiltersTxt}
                doorOpens={eraseDoorOpensTotal}
                eraseNarrow={eraseDoorFamily(memory.recapErasedTrace)
                  ? () => openErasedFamily('recap', memory.recapErasedTrace)
                  : null}
                eraseNarrowTitle={[eraseDoorTitle(memory.recapErasedTrace), eraseDoorBackTitle('recap', memory.recapErasedTrace)].filter(Boolean).join(' ')}
                eraseNarrowBack={eraseDoorBackTitle('recap', memory.recapErasedTrace)}
                eraseNarrowActive={erasedDoor?.id === 'recap'}
                onCopied={noteSharedRecapCopied}
                onReset={eraseSharedRecapTaken}
              />
            </p>
          )}
        </div>
      )}

      {/* L'oubli se défait : ce que la croix du rappel a écarté reste de côté,
          et sa porte remet le rappel — et sa croix — en place d'un clic,
          sans rien remettre à l'écran. */}
      {!loading && !error && !lastErase && forgottenErase && (
        <div className="mine-rubrique-restore-undo">
          <span className="mine-rubrique-restore">
            <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
            <span className="mine-rubrique-restore-txt">
              {t('acct.mine.rubriqueRestoreUndoNote').replace('{rubs}', forgottenEraseTxt)}
            </span>
            {/* Le même délai que le rappel : le geste et son annulation se
                comparent d'un coup d'œil, avec la même écriture. */}
            {stampOf(forgottenErase.at ?? '') > 0 && (
              <span
                className="mine-rubrique-restore-ago"
                title={t('acct.mine.rubriqueRestoreUndoSinceHint')}
              >
                {t('acct.mine.rubriqueRestoreSince').replace(
                  '{ago}',
                  span(Date.now() - stampOf(forgottenErase.at ?? '')),
                )}
              </span>
            )}
            <button
              type="button"
              className="mine-rubrique-restore-door"
              onClick={restoreForgottenErase}
              title={t('acct.mine.rubriqueRestoreUndoHint')}
            >
              <i className="ri-history-line" aria-hidden="true"></i>
              {t('acct.mine.rubriqueRestoreUndo')}
            </button>
          </span>
          {/* Ce que cette porte remettra sous la main une fois le rappel
              rétabli : le compte de la porte du rappel, famille par famille. */}
          {forgottenEraseBackTxt && (
            <p
              className="mine-rubrique-restore-undoback"
              title={[
                t('acct.mine.rubriqueRestoreUndoBackHint'),
                t('acct.mine.rubriqueRestoreBackHint').replace('{parts}', forgottenEraseBackTxt),
              ].join(' ')}
            >
              <i className="ri-hand-heart-line" aria-hidden="true"></i>
              <span>{t('acct.mine.rubriqueRestoreUndoBack')}</span>
              {(['annonce', 'offre'] as const).map((kind) => {
                const n = forgottenEraseBack[kind];
                if (n === 0) return null;
                return (
                  <span key={kind} className="mine-rubrique-restore-family">
                    <i
                      className={kind === 'annonce' ? 'ri-megaphone-line' : 'ri-briefcase-line'}
                      aria-hidden="true"
                    ></i>
                    <span>
                      {t(kind === 'annonce'
                        ? 'acct.mine.rubriqueFamilyAnnonce'
                        : 'acct.mine.rubriqueFamilyOffre')}
                    </span>
                    <b dir="ltr">{n}</b>
                  </span>
                );
              })}
            </p>
          )}
        </div>
      )}

      {/* Le petit compte de l'oubli défait : combien de fois le geste a été
          annulé, le jour du dernier, puis les trois lectures du temps oublié —
          moyenne, médiane, écart — et le geste qui tire la série, dont la
          porte ouvre la valeur qu'il retirait. */}
      {!loading && !error && memory.undoCount > 0 && (
        <MineUndoCount
          count={memory.undoCount}
          lastAt={day(memory.undoLastAt)}
          forgotAgo={memory.undoLastForgotMs > 0 ? span(memory.undoLastForgotMs) : ''}
          heldCount={memory.undoHeld.length}
          avgAgo={undoHeldAvg > 0 ? span(undoHeldAvg) : ''}
          medAgo={undoHeldMed > 0 ? span(undoHeldMed) : ''}
          gapAgo={undoHeldGap !== 0
            ? `${undoHeldGap > 0 ? '+' : '\u2212'}${span(Math.abs(undoHeldGap))}`
            : ''}
          gapUp={undoHeldGap > 0}
          maxAgo={undoHeldMax > 0 ? span(undoHeldMax) : ''}
          pull={undoPull ? {
            ago: span(undoPull.ms),
            up: undoPull.up,
            door: undoPullValue ? {
              label: undoPullValue.label,
              aside: undoPullAside,
              onOpen: () => openRubriqueOrigin(undoPullValue.kind, undoPullValue.value),
            } : null,
          } : null}
          onReset={eraseUndoCount}
        />
      )}

      {loading ? (
        <p className="acct-loading">
          <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
          {t('acct.mine.loading')}
        </p>
      ) : error ? (
        <div className="mine-error">
          <p className="auth-note">{t('acct.mine.loadError')}</p>
          <button type="button" className="ghost-btn" onClick={() => void reload()}>
            <i className="ri-refresh-line" aria-hidden="true"></i>
            {t('acct.mine.retry')}
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="mine-empty">
          <i className={filtering ? 'ri-filter-off-line' : 'ri-file-list-3-line'} aria-hidden="true"></i>
          <p>{filtering ? t('acct.mine.filterEmpty') : t('acct.mine.empty')}</p>
          {filtering ? (
            <button type="button" className="ghost-btn" onClick={resetFilters}>
              {t('acct.mine.clearFilters')}
            </button>
          ) : (
            <Link to={tab === 'annonce' ? '/deposer?type=annonce' : '/deposer?type=offre'} className="ghost-btn">
              {tab === 'annonce' ? t('acct.mine.emptyCta') : t('acct.mine.emptyCtaOffre')}
            </Link>
          )}
        </div>
      ) : (
        <>
        <ul
          className="mine-list"
          ref={listRef}
          tabIndex={0}
          aria-label={t('acct.mine.title')}
          onKeyDown={onListKey}
        >
          {list.map((row, i) => (
            <li
              key={row.id}
              id={`mine-row-${row.id}`}
              aria-current={i === keyed ? 'true' : undefined}
              className={`mine-row${needsAction(row) ? ' is-attention' : ''}${picked.includes(row.id) ? ' is-picked' : ''}${focusId === row.id ? ' is-focus' : ''}${i === keyed ? ' is-keyed' : ''}`}
            >
              <div className="mine-row-top">
                {row.statut === 'refuse' && (
                  <label className="mine-pick" title={t('acct.mine.pickOne')}>
                    <input
                      type="checkbox"
                      checked={picked.includes(row.id)}
                      onChange={() => togglePick(row.id)}
                      aria-label={t('acct.mine.pickOne')}
                    />
                  </label>
                )}
                <span className="mine-badge" data-state={row.statut}>{t(STATUS_KEY[row.statut])}</span>
                {rubriqueHorsType(row) && (
                  <button
                    type="button"
                    className="mine-flag mine-flag-rubrique mine-flag-rubrique-door"
                    title={`${t(
                      row.kind === 'annonce'
                        ? 'acct.mine.rubriqueExpectAnnonce'
                        : 'acct.mine.rubriqueExpectOffre',
                    )} ${t(
                      row.kind === 'annonce'
                        ? 'acct.mine.rubriqueMismatchOffre'
                        : 'acct.mine.rubriqueMismatchAnnonce',
                    )} ${t('acct.mine.rubriquePickHint')}`}
                    aria-expanded={rubriqueFor === row.id}
                    onClick={() => setRubriqueFor(rubriqueFor === row.id ? null : row.id)}
                  >
                    <i className="ri-route-line" aria-hidden="true"></i>
                    {t('acct.mine.rubriqueMismatch')}
                    <i className="ri-arrow-right-line mine-flag-door" aria-hidden="true"></i>
                  </button>
                )}
                {needsAction(row) && (
                  <span className="mine-flag">
                    <i className="ri-alarm-warning-line" aria-hidden="true"></i>
                    {t('acct.mine.attention')}
                  </span>
                )}
                {/* Une offre en ligne qui ne fait plus postuler : le silence se
                    lit sur la ligne, sans ouvrir sa fiche. */}
                {candIdleDays(row) > 0 && !bareIds.has(row.id) && (
                  <button
                    type="button"
                    className="mine-flag mine-flag-idle mine-flag-idle-door"
                    title={t('acct.mine.candIdleEdit')}
                    onClick={() => startEdit(row, 'titre')}
                  >
                    <i className="ri-user-unfollow-line" aria-hidden="true"></i>
                    {t('acct.mine.candIdle')}
                    <i className="ri-arrow-right-line mine-flag-door" aria-hidden="true"></i>
                  </button>
                )}
                {/* Une offre qui n'a jamais reçu de candidature et dont le
                    salaire manque aussi : les deux manques se lisent d'un seul
                    repère, et la porte ouvre la modification, curseur dans le
                    salaire — une seule visite suffit à la corriger. */}
                {tab === 'offre' && !(row.budget || '').trim() && bareIds.has(row.id) && (
                  <button
                    type="button"
                    className="mine-flag mine-flag-bare"
                    title={t('acct.mine.bareTagEdit')}
                    onClick={() => startEdit(row, 'budget')}
                  >
                    <i className="ri-eraser-line" aria-hidden="true"></i>
                    {t('acct.mine.bareTag')}
                    <i className="ri-arrow-right-line mine-flag-door" aria-hidden="true"></i>
                  </button>
                )}
                {/* Une offre dont le salaire n'a jamais été précisé : le
                    manque se lit sur la ligne, et le repère ouvre la
                    modification, curseur déjà dans le champ du salaire. */}
                {tab === 'offre' && !(row.budget || '').trim() && !bareIds.has(row.id) && (
                  <button
                    type="button"
                    className="mine-flag mine-flag-salary"
                    title={t('acct.mine.salaryNoneEdit')}
                    onClick={() => startEdit(row, 'budget')}
                  >
                    <i className="ri-wallet-line" aria-hidden="true"></i>
                    {t('acct.mine.salaryNone')}
                    <i className="ri-arrow-right-line mine-flag-door" aria-hidden="true"></i>
                  </button>
                )}
                <h3 className="mine-title">{row.titre}</h3>
                <span className="mine-date">{t('acct.mine.deposed')} {day(row.created_at)}</span>
              </div>

              {/* La liste des rubriques de la bonne famille, dépliée sous la
                  ligne : choisir en corrige le dépôt d'un clic, sans ouvrir
                  le formulaire entier pour un seul champ. */}
              {rubriqueFor === row.id && (
                <div className="mine-rubrique-pick">
                  <p className="mine-rubrique-pick-head">
                    <i className="ri-route-line" aria-hidden="true"></i>
                    <span>
                      {t(row.kind === 'annonce'
                        ? 'acct.mine.rubriquePickAnnonce'
                        : 'acct.mine.rubriquePickOffre')}
                    </span>
                    <button
                      type="button"
                      className="mine-rubrique-pick-close"
                      onClick={() => setRubriqueFor(null)}
                      aria-label={t('acct.mine.rubriquePickClose')}
                      title={t('acct.mine.rubriquePickClose')}
                    >
                      <i className="ri-close-line" aria-hidden="true"></i>
                    </button>
                  </p>
                  <div className="mine-rubrique-pick-list">
                    {optionsFor(row.kind).map((option) => {
                      const n = rubriqueTally.get(option.value) ?? 0;
                      const best = n > 0 && option.value === rubriqueBest.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`mine-rubrique-opt${best ? ' is-most' : ''}`}
                          disabled={rubriqueBusy === row.id}
                          title={`${t('acct.mine.rubriqueOptHint').replace('{n}', String(n))} ${t('acct.mine.rubriqueOptSeries').replace('{n}', String(horsTypeLeft))}`}
                          onClick={() => void applyRubrique(row, option.value)}
                        >
                          {option.label}
                          <span className={`mine-rubrique-opt-n${n === 0 ? ' is-zero' : ''}`} dir="ltr">{n}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mine-rubrique-pick-note">{t('acct.mine.rubriquePickNote')}</p>
                  {/* Ce que la correction retire de la série : une rubrique
                      choisie, un dépôt de moins à corriger — le compte se lit
                      avant de cliquer, pas après. */}
                  <p
                    className={`mine-rubrique-pick-series${horsTypeLeft === 0 ? ' is-end' : ''}`}
                    title={t('acct.mine.rubriquePickSeriesHint')}
                  >
                    <i className="ri-links-line" aria-hidden="true"></i>
                    <span>
                      {horsTypeLeft === 0
                        ? t('acct.mine.rubriquePickSeriesEnd').replace('{total}', String(horsType.length))
                        : t('acct.mine.rubriquePickSeries')
                          .replace('{n}', String(horsTypeLeft))
                          .replace('{total}', String(horsType.length))}
                    </span>
                  </p>
                  {/* La porte du suivant : elle saute au dépôt hors type
                      d'après, sans repasser par le premier de la file. */}
                  {nextHorsType(row) && (
                    <>
                      <button
                        type="button"
                        className="mine-rubrique-next"
                        title={t('acct.mine.rubriqueNextHint')}
                        onClick={() => openNextHorsType(row)}
                      >
                        <i className="ri-skip-forward-line" aria-hidden="true"></i>
                        <span>{t('acct.mine.rubriqueNext')}</span>
                        <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      </button>
                      {/* Ce qui reste après le dépôt que cette porte ouvre : le
                          compte évite de découvrir la fin de la série en chemin. */}
                      <p
                        className={`mine-rubrique-next-left${horsTypeAfter(row) === 0 ? ' is-end' : ''}`}
                        title={t('acct.mine.rubriqueNextLeftHint')}
                      >
                        <i className="ri-links-line" aria-hidden="true"></i>
                        <span>
                          {horsTypeAfter(row) === 0
                            ? t('acct.mine.rubriqueNextLeftEnd')
                            : t('acct.mine.rubriqueNextLeft')
                              .replace('{n}', String(horsTypeAfter(row)))}
                        </span>
                      </p>
                    </>
                  )}
                  {/* Le compte se lit sous la liste : la rubrique déjà la plus
                      habitée se nomme, avec ses dépôts, pour choisir la plus
                      juste sans deviner. */}
                  <p className="mine-rubrique-pick-tally" title={t('acct.mine.rubriquePickTallyHint')}>
                    <i className="ri-bar-chart-horizontal-line" aria-hidden="true"></i>
                    <span>
                      {rubriqueBest.n > 0
                        ? t('acct.mine.rubriquePickTally')
                          .replace('{rub}', rubriqueBest.label)
                          .replace('{n}', String(rubriqueBest.n))
                        : t('acct.mine.rubriquePickTallyNone')}
                    </span>
                  </p>
                </div>
              )}

              <p className="mine-meta">
                {row.wilaya && (
                  <span>
                    <i className="ri-map-pin-line" aria-hidden="true"></i>
                    {row.commune ? `${row.commune} · ${nomRegion(row.wilaya, lang)}` : nomRegion(row.wilaya, lang)}
                  </span>
                )}
                {row.budget && (
                  <span>
                    <i className="ri-price-tag-3-line" aria-hidden="true"></i>
                    {prixDevise(row.budget, paysDe(row))}
                  </span>
                )}
                <span>
                  <i className="ri-global-line" aria-hidden="true"></i>
                  {nomPays(paysDe(row), lang)}
                </span>
                {row.statut === 'en_attente' && (
                  <span className={`mine-age${needsAction(row) ? ' is-late' : ''}`} title={t('acct.mine.reviewEta')}>
                    <i className="ri-hourglass-line" aria-hidden="true"></i>
                    {t('acct.mine.reviewSince')} {reviewAge(row)}
                  </span>
                )}
              </p>

              {tab === 'offre' && cands && (
                <p className="mine-cand-line">
                  <OffreCandidatureChip
                    offreId={row.id}
                    count={cands.counts[row.id] ?? 0}
                    unread={cands.unread[row.id] ?? 0}
                    replyAvg={cands.replyAvg[row.id] ?? 0}
                    replySeen={cands.replySeen[row.id] ?? 0}
                    published={row.statut === 'publie'}
                  />
                </p>
              )}

              {row.statut === 'refuse' && row.motif && (
                <p className="mine-motif">
                  <i className="ri-error-warning-line" aria-hidden="true"></i>
                  {t('acct.mine.motif')} : {row.motif}
                </p>
              )}

              {editing === row.id ? (
                <form className="mine-edit" onSubmit={(event) => void onSave(event, row)}>
                  {/* Le motif du refus, rappelé en tête du formulaire : on
                      corrige ce qu'on sait être reproché, et la demande de
                      correction ouvre ce formulaire sans autre détour. */}
                  {row.statut === 'refuse' && (
                    <p className="mine-edit-refusal">
                      <i className="ri-error-warning-line" aria-hidden="true"></i>
                      <span>
                        {t('acct.mine.correctHead').replace(
                          '{motif}',
                          (row.motif || '').trim() || t('acct.mine.motifNone'),
                        )}
                      </span>
                      <span className="pro-signal-ref mine-edit-ref">{refOf(row)}</span>
                    </p>
                  )}
                  <div className="fld">
                    <label htmlFor={`min-t-${row.id}`}>{t('dep.titleField')} *</label>
                    <input id={`min-t-${row.id}`} name="titre" defaultValue={row.titre} required />
                  </div>
                  <div className="form-grid">
                    <div className="fld">
                      <label htmlFor={`min-r-${row.id}`}>{t('dep.rubrique')}</label>
                      <select id={`min-r-${row.id}`} name="rubrique" defaultValue={row.rubrique ?? ''}>
                        <option value="">{t('dep.rubriqueAny')}</option>
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {/* La rubrique enregistrée vient de l'autre famille :
                          la liste ne la propose plus, et le dit plutôt que
                          de laisser une case vide sans explication. */}
                      {rubriqueHorsType(row) && (
                        <span className="dep-rubrique-hint mine-rubrique-hint">
                          {t('acct.mine.rubriqueFixHint')}
                        </span>
                      )}
                    </div>
                    <div className="fld">
                      <label htmlFor={`min-b-${row.id}`}>{t('dep.budget')}</label>
                      <input id={`min-b-${row.id}`} name="budget" defaultValue={row.budget ?? ''} placeholder={t('dep.budgetPh')} />
                    </div>
                    <div className="fld">
                      <label htmlFor={`min-p-${row.id}`}>{t('pays.label')}</label>
                      <PaysSelect
                        id={`min-p-${row.id}`}
                        name="pays"
                        value={editPays}
                        onChange={setEditPays}
                      />
                    </div>
                    <div className="fld">
                      <label htmlFor={`min-w-${row.id}`}>{motDivision(editPays, lang)}</label>
                      <select key={editPays} id={`min-w-${row.id}`} name="wilaya" defaultValue={row.wilaya ?? ''}>
                        <option value="">{motDivision(editPays, lang, 'tous')}</option>
                        {regionsWith(editPays, row.wilaya).map((w) => <option key={w} value={w}>{nomRegion(w, lang)}</option>)}
                      </select>
                    </div>
                    <div className="fld">
                      <label htmlFor={`min-c-${row.id}`}>{t('dep.commune')}</label>
                      <input id={`min-c-${row.id}`} name="commune" defaultValue={row.commune ?? ''} placeholder={t('dep.communePh')} />
                    </div>
                  </div>
                  <div className="fld">
                    <label htmlFor={`min-d-${row.id}`}>{t('dep.desc')} * ({descLen}/500)</label>
                    <textarea
                      id={`min-d-${row.id}`}
                      name="description"
                      maxLength={500}
                      required
                      defaultValue={row.description}
                      onChange={(e) => setDescLen(e.target.value.length)}
                    />
                  </div>
                  <p className="mine-review">
                    <i className="ri-information-line" aria-hidden="true"></i>
                    {t('acct.mine.reviewNote')}
                  </p>
                  {/* La file de la visite : elle dit combien de dépôts il
                      reste à corriger, et le bouton enchaîne sans repasser
                      par le tableau. */}
                  {chainIds.length > 0 && (
                    <p
                      className="mine-chain"
                      title={t(chainMode === 'rubrique' ? 'acct.mine.rubriqueChainHint' : 'acct.mine.chainHint')}
                    >
                      <i className="ri-links-line" aria-hidden="true"></i>
                      {t(chainMode === 'rubrique' ? 'acct.mine.rubriqueChainLeft' : 'acct.mine.chainLeft')
                        .replace('{n}', String(chainIds.length))}
                    </p>
                  )}
                  <div className="mine-actions">
                    <button type="submit" className="cta" disabled={busy}>
                      {busy ? t('acct.mine.saving') : t('acct.mine.save')}
                      <i className="ri-check-line" aria-hidden="true"></i>
                    </button>
                    {chainIds.length > 0 && (
                      <button type="submit" name="chain" value="1" className="ghost-btn" disabled={busy}>
                        {t('acct.mine.saveNext')}
                        <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      </button>
                    )}
                    <button type="button" className="ghost-btn" onClick={cancelEdit} disabled={busy}>
                      {t('acct.mine.cancel')}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="mine-body">{row.description}</p>
                  <div className="mine-actions">
                    {row.statut === 'publie' && (
                      <Link to={row.kind === 'offre' ? `/emplois/${row.id}` : `/annonces/${row.id}`} className="ad-btn">
                        <i className="ri-external-link-line" aria-hidden="true"></i>
                        {t('acct.mine.open')}
                      </Link>
                    )}
                    {row.statut === 'refuse' && (
                      <button type="button" className="ad-btn ad-btn--solid" onClick={() => void onRepublish(row)} disabled={busy}>
                        <i className="ri-refresh-line" aria-hidden="true"></i>
                        {t('acct.mine.republish')}
                      </button>
                    )}
                    <button type="button" className="ad-btn" onClick={() => startEdit(row)} disabled={busy}>
                      <i className="ri-pencil-line" aria-hidden="true"></i>
                      {t('acct.mine.edit')}
                    </button>
                    {confirmId === row.id ? (
                      <button type="button" className="mine-danger" onClick={() => void onDelete(row)} disabled={busy}>
                        <i className="ri-alert-line" aria-hidden="true"></i>
                        {t('acct.mine.confirm')}
                      </button>
                    ) : (
                      <button type="button" className="ad-btn" onClick={() => setConfirmId(row.id)} disabled={busy}>
                        <i className="ri-delete-bin-line" aria-hidden="true"></i>
                        {t('acct.mine.delete')}
                      </button>
                    )}
                    {confirmId === row.id && (
                      <button type="button" className="link-btn" onClick={() => setConfirmId(null)}>
                        {t('acct.mine.cancel')}
                      </button>
                    )}
                  </div>
                  {/* Le signalement se lit sous les actions du dépôt, plus
                      discret qu'un bouton : c'est un recours, pas une étape
                      du parcours. Sa référence est déjà citée. Un dépôt
                      refusé reçoit en plus la demande de correction, qui
                      cite le motif du refus. */}
                  <div className="mine-signals">
                    <a
                      className="pro-note pro-signal mine-signal"
                      href={signalHrefOf(row)}
                      title={t('acct.mine.signalHint')}
                    >
                      <i className="ri-flag-line" aria-hidden="true"></i>
                      <span>{t('acct.mine.signal')}</span>
                      <span className="pro-signal-ref">{refOf(row)}</span>
                    </a>
                    {row.statut === 'refuse' && (
                      <button
                        type="button"
                        className="pro-note pro-signal mine-signal mine-signal-correct"
                        title={t('acct.mine.correctHint')}
                        onClick={() => startEdit(row)}
                      >
                        <i className="ri-edit-box-line" aria-hidden="true"></i>
                        <span>{t('acct.mine.correct')}</span>
                        <span className="pro-signal-ref">{refOf(row)}</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        {list.length > 1 && (
          <p className="doss-keyhint mine-keyhint">
            <i className="ri-arrow-up-down-line" aria-hidden="true"></i>
            {t('acct.mine.keyhint')}
          </p>
        )}
        </>
      )}
    </section>
  );
}