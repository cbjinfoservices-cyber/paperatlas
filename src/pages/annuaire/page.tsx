import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useReveal } from '@/hooks/useReveal';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { useSeo } from '@/hooks/useSeo';
import { useJsonLd } from '@/hooks/useJsonLd';
import { collectionLd, type Crumb } from '@/lib/structuredData';
import { useFichesPubliees } from '@/hooks/useFichesPubliees';
import { useGeo, haversineKm } from '@/hooks/useGeo';
import { useShortlist } from '@/hooks/useShortlist';
import { readDirMemory, saveDirMemory, clearDirMemory } from '@/hooks/useDirMemory';
import { notePaysWalk, noteRegionWalk, noteTradeWalk } from '@/lib/regionWalk';
import { readAuteurMemory, saveAuteurMemory, clearAuteurMemory } from '@/hooks/useAuteurMemory';
import { entreprises, capacityScore, formuleDe } from '@/mocks/entreprises';
import { isNewcomer } from '@/lib/newcomers';
import { facEmptyTitle } from '@/lib/faconnage';
import { emptyPlaceLine, emptyPlaceTitle } from '@/lib/emptyPlace';
import { decadeLabel, decadeOf, decadeRank, decadesLabel, parseDecades, premierePublication, toggleDecade } from '@/lib/generation';
import { isWithinDays } from '@/lib/freshness';
import { monthKey, monthLong } from '@/lib/dates';
import { paysArabes, paysDe, tallyPays, nomPays } from '@/lib/pays';
import { motDivision } from '@/lib/division';
import { specialitesDe } from '@/lib/specialites';
import { paysDeSlug, phrasePays, slugDeTrade, slugPays, tradeDeSlug } from '@/lib/tradePages';
import { graphiesRegion, nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';
import { localeFor } from '@/i18n/localize';
import { nomDemoCherchable } from '@/lib/nomsDemo';
import { auteurs, genres, type Genre } from '@/mocks/auteurs';
import PaysTally from '@/components/feature/PaysTally';
import FilterBar from './components/FilterBar';
import DirectoryExplore from './components/DirectoryExplore';
import TradeAuthorsBridge from './components/TradeAuthorsBridge';
import TradeHotRegion from './components/TradeHotRegion';
import TradeMissingCountries from './components/TradeMissingCountries';
import TradeNeighbourMissing from './components/TradeNeighbourMissing';
import ScopeLine from './components/ScopeLine';
import DirTrail from './components/DirTrail';
import TypeReminder from '@/components/feature/TypeReminder';
import RegionReminder from '@/components/feature/RegionReminder';
import { othersLine, othersWhere } from '@/lib/typeOthers';
import DirectoryTools, { RADII, SORT_LABEL, type SortKey } from './components/DirectoryTools';
import AuthorTools, { AUTHOR_SORTS, AUTHOR_SORT_LABEL, type AuthorSort } from './components/AuthorTools';
import BizCard from './components/BizCard';
import PremiumDirectory from './components/PremiumDirectory';
import AuthorCard from './components/AuthorCard';
import DirectoryMap from './components/DirectoryMap';
import CountryMaps from './components/CountryMaps';
import CountryMapAreas from './components/CountryMapAreas';
import WorldFamiliesBand from './components/WorldFamiliesBand';
import GridTally from './components/GridTally';
import GenreTally from './components/GenreTally';
import GenerationTally from './components/GenerationTally';
import GenerationBlock from './components/GenerationBlock';
import WeekPulse from './components/WeekPulse';
import MapLegend from './components/MapLegend';
import CompareTray from './components/CompareTray';
import ShareView from './components/ShareView';
import MyDossiers from './components/MyDossiers';
import ExportMenu from './components/ExportMenu';
import FicheFinder from './components/FicheFinder';
import AuteurFinder from './components/AuteurFinder';
import LatestBoard from '@/pages/home/components/LatestBoard';
import WorldRecall from '@/components/feature/WorldRecall';
import { ancreFamille } from '@/lib/worldFamilies';
import { AIRE_CARTE_PARAM, paysDeCarteAire } from '@/lib/worldRegions';

type Mode = 'entreprises' | 'auteurs';
const SORTS: SortKey[] = ['pertinence', 'newest', 'first', 'generation', 'rating', 'capacity', 'etabs', 'distance', 'name'];
const FILTER_KEYS = ['q', 'pays', 'wilaya', 'trade', 'spec', 'genre', 'sort', 'radius', 'view', 'fresh', 'month', 'open', 'shown', 'insti', 'via'];

/** Nine profiles per batch: one clean row of three, nothing poured at once. */
const PAGE_SIZE = 9;

export default function Annuaire() {
  const { t, lang } = useLang();
  const locale = localeFor(lang);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { slug, payslug } = useParams();
  /* Une page par type d'établissement — /annuaire/imprimeries — et par type et
     pays — /annuaire/imprimeries/algerie. L'adresse porte les deux. */
  const slugTrade = tradeDeSlug(slug ?? '');
  const slugPaysCode = paysDeSlug(payslug ?? '');
  const [activePin, setActivePin] = useState<string | null>(null);
  const [publicBusinessCount, setPublicBusinessCount] = useState(0);
  const [recall, setRecall] = useState('');
  const restored = useRef(false);
  const auteurRestored = useRef(false);
  /* La rubrique du haut : lue une fois au premier passage, gardée ensuite. */
  const kindRestored = useRef(false);
  const kindSwitch = useRef(false);
  const geo = useGeo();
  /* The deposits published on the boards, counted per country: the country
     cards add them to their own sheets. */
  const { depots: depotsPays } = useFichesPubliees();
  const shortlist = useShortlist(params.get('kind') === 'auteurs' ? 'auteurs' : 'entreprises');
  useReveal();
  useScrollRestore('/annuaire');

  const mode: Mode = params.get('kind') === 'auteurs' ? 'auteurs' : 'entreprises';
  const view = mode === 'entreprises' && params.get('view') === 'map' ? 'map' : 'list';
  /* Le cadre d'aire de la grande carte : une aire lue dans l'adresse élargit le
     cadrage à ses pays, et les régions du pays se lisent dans le voisinage qui
     donne son sens à son activité — et à ses manques. */
  const framePays = paysDeCarteAire(params.get(AIRE_CARTE_PARAM));
  const q = params.get('q') ?? '';
  /* Le pays vient de l'adresse quand elle en porte un, sinon du filtre. */
  const pays = params.get('pays') || slugPaysCode || '';
  const wilaya = params.get('wilaya') ?? '';
  /* Le type vient de l'adresse de la page quand elle en porte un, sinon du
     filtre : une page dédiée garde son type même sans paramètre. */
  const trade = slugTrade || params.get('trade') || '';
  /* Le second niveau de précision, lu seulement à l'intérieur de son métier. */
  const specParam = params.get('spec') ?? '';
  const spec = specParam.startsWith(`${trade}.`) ? specParam : '';
  const genre = params.get('genre') ?? '';
  /* Le titre de la page suit le type et le lieu lus : « Imprimeries en
     Algérie » quand un type et un pays sont retenus, « … dans le monde
     arabe » sinon. C'est aussi ce que Google lit dans l'onglet et le partage. */
  const placeLabel = pays ? phrasePays(pays, lang) : t('tradePage.placeAll');
  const typeLabel = spec ? t(`spec.${spec}`) : trade ? t(`tradePlural.${trade}`) : '';
  /* L'adresse de la page telle qu'elle se visite : le type et le pays vivent
     dans le chemin, jamais dans les filtres. Une liste resserrée par un tri ou
     une recherche reste donc la même page pour un moteur, avec la même adresse
     de référence. */
  const seoPath = trade
    ? `/annuaire/${slugDeTrade(trade)}${pays && slugPays(pays) ? `/${slugPays(pays)}` : ''}`
    : '/annuaire';
  const seoName = trade ? `${typeLabel} ${placeLabel}` : t('dir.title');
  const seoDesc = trade
    ? t('tradePage.desc').replace('{label}', typeLabel).replace('{place}', placeLabel)
    : t('dir.sub');
  useSeo({
    page: 'annuaire',
    path: seoPath,
    title: trade ? `${typeLabel} ${placeLabel} — PaperAtlas` : undefined,
    description: trade ? seoDesc : undefined,
    keywords: trade ? `${typeLabel} ${placeLabel}, ${t('dir.typeLab')}` : undefined,
  });
  /* Le fil de la page : accueil, annuaire, puis le type et le pays lus. Il suit
     le chemin réel — un type sans pays n'invente pas une étape, et l'annuaire
     entier n'en porte que deux. Écrit une seule fois, il sert deux fois : au
     balisage que lisent les moteurs, et au fil que lit le visiteur, en haut de
     l'en-tête. Les deux ne peuvent donc pas se contredire. */
  const trailCrumbs: Crumb[] = [
    { name: t('siteMap.home'), path: '/' },
    { name: t('siteMap.directory'), path: '/annuaire' },
    ...(trade
      ? [{ name: typeLabel, path: `/annuaire/${slugDeTrade(trade)}` }]
      : []),
    ...(trade && pays && slugPays(pays)
      ? [{ name: `${typeLabel} ${placeLabel}`, path: seoPath }]
      : []),
    /* La région ferme le chemin, juste avant les résultats : la page resserrée
       sur une wilaya se remonte comme les autres, et le dernier cran nomme le
       lieu où l'on se tient. */
    ...(wilaya
      ? [
          {
            name: nomRegion(wilaya, lang),
            path: `${seoPath}?wilaya=${encodeURIComponent(wilaya)}`,
          },
        ]
      : []),
  ];
  /* Le chemin réellement visité, région comprise : c'est lui que la page
     déclare aux moteurs, quand l'adresse de référence reste le type et le pays
     — un filtre n'est pas une seconde page. */
  const trailPath = wilaya
    ? `${seoPath}?wilaya=${encodeURIComponent(wilaya)}`
    : seoPath;
  useJsonLd('annuaire-jsonld', {
    '@context': 'https://schema.org',
    '@graph': [
      collectionLd({
        path: trailPath,
        name: seoName,
        description: seoDesc,
        lang,
        crumbs: trailCrumbs,
      }),
    ],
  });
  /* The generations (decades) the list is narrowed to — one, or two read side
     by side — carried by the address as their first years. */
  const openYear = params.get('open') ?? '';
  const openDecades = parseDecades(openYear);
  const openLabel = decadesLabel(openDecades);
  /* Two windows on the same pulse: the week is inside the month, never beside
     it. `fresh=week` comes from the results-line counter, `fresh=1` from the
     « new arrivals » filter and from the links of the rest of the site. */
  const freshParam = params.get('fresh') ?? '';
  const freshMode: 'week' | 'month' | 'none' = freshParam === 'week'
    ? 'week'
    : freshParam === '1' ? 'month' : 'none';
  const onlyNew = freshMode === 'month';
  const onlyWeek = freshMode === 'week';
  /** Only the structures carrying the Institutions badge on their card. */
  const onlyInsti = params.get('insti') === '1';
  /** YYYY-MM bucket picked from a bar of the six-month sparkline. */
  const month = params.get('month') ?? '';
  /** Profile the visitor clicked a sparkline bar from, offered as a way back. */
  const from = params.get('from') ?? '';
  /* La porte franchie depuis la page Arabe World : elle laisse une trace dans
     l'adresse, pour que l'annuaire dise d'où l'on vient — et jamais sur la
     fiche d'un atelier, qui a sa propre mémoire de retour. */
  const viaWorld = params.get('via') === 'world';
  const returnBiz = from ? entreprises.find((e) => e.id === from) ?? null : null;
  const rawSort = params.get('sort') ?? 'pertinence';
  const sort: SortKey = SORTS.includes(rawSort as SortKey) ? (rawSort as SortKey) : 'pertinence';
  /** The author list has its own orders, carried by the same `sort` key, so the
      address always says how the list is read. */
  const auteurSort: AuthorSort = AUTHOR_SORTS.includes(rawSort as AuthorSort)
    ? (rawSort as AuthorSort)
    : 'pertinence';
  const distanceReady = Boolean(geo.point);
  const effectiveSort: SortKey = sort === 'distance' && !distanceReady ? 'pertinence' : sort;

  const rawRadius = Number(params.get('radius'));
  const radiusFromUrl = RADII.includes(rawRadius) ? rawRadius : null;
  const radius = distanceReady ? radiusFromUrl : null;

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    /* Any change to a filter rewinds the list to its first batch; the batch
       count itself is the only key allowed to survive. */
    if (key !== 'shown') next.delete('shown');
    setParams(next, { replace: true });
  };

  const setFilter = (key: 'pays' | 'wilaya' | 'trade' | 'genre' | 'open', value: string) => {
    /* Une page de type et de pays porte le pays dans son adresse : en choisir
       un autre doit changer l'adresse, pas seulement le filtre. */
    if (key === 'pays' && payslug) {
      const next = new URLSearchParams(params);
      next.delete('pays');
      next.delete('wilaya');
      next.delete('shown');
      const path = trade
        ? `/annuaire/${slugDeTrade(trade)}${value && slugPays(value) ? `/${slugPays(value)}` : ''}`
        : '/annuaire';
      if (!trade && value) next.set('pays', value);
      const query = next.toString();
      navigate(query ? `${path}?${query}` : path, { replace: true });
      setActivePin(null);
      return;
    }
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    /* A region only makes sense inside its own country: changing the country
       drops the previous region instead of filtering on a place that is gone. */
    if (key === 'pays') next.delete('wilaya');
    /* Two generations are read as two blocks: the order follows the pick by
       itself, so the second decade opens its own block without a detour. */
    if (key === 'open' && parseDecades(value).length >= 2) next.set('sort', 'generation');
    next.delete('shown');
    setParams(next, { replace: true });
    setActivePin(null);
  };

  /**
   * Le type et sa précision, choisis dans le même menu. Sur une page dédiée,
   * choisir un autre type emmène sur sa page et rendre le type ramène à
   * l'annuaire entier ; ailleurs, les deux restent dans l'adresse. Le pays, la
   * région et la recherche suivent sans être perdus.
   */
  const pickType = (nextTrade: string, nextSpec: string) => {
    const next = new URLSearchParams(params);
    next.delete('shown');
    if (nextSpec) next.set('spec', nextSpec);
    else next.delete('spec');
    if (!nextTrade) saveDirMemory({ trade: '' });
    if (slugTrade || payslug) {
      next.delete('trade');
      /* Le pays reste dans l'adresse tant qu'un type est ouvert ; rendre le
         type ramène à l'annuaire entier, le pays garde sa place. */
      next.delete('pays');
      const paysSlug = pays && slugPays(pays) ? `/${slugPays(pays)}` : '';
      if (nextTrade && nextTrade === slugTrade && paysSlug) {
        setParams(next, { replace: true });
      } else if (nextTrade) {
        const path = `/annuaire/${slugDeTrade(nextTrade)}${paysSlug}`;
        const query = next.toString();
        navigate(query ? `${path}?${query}` : path);
      } else {
        if (pays) next.set('pays', pays);
        const query = next.toString();
        navigate(query ? `/annuaire?${query}` : '/annuaire');
      }
      setActivePin(null);
      return;
    }
    if (nextTrade) next.set('trade', nextTrade);
    else next.delete('trade');
    setParams(next, { replace: true });
    setActivePin(null);
  };

  /**
   * Picking a second generation switches the list to its block order by
   * itself: two decades are meant to be read as two blocks, never scattered.
   */
  const handleOpen = (value: string) => {
    setFilter('open', value);
    const twoGenerations = parseDecades(value).length >= 2;
    if (!twoGenerations) return;
    if (mode === 'auteurs') saveAuteurMemory({ sort: 'generation', open: value });
    else saveDirMemory({ sort: 'generation', open: value });
  };

  /* A country code read under a decade: the generation and the country land
     together, so the list shows that decade inside that one country. Clicking
     the code of the country already applied hands the country back. */
  const pickGenerationPays = (decade: string, code: string) => {
    const next = new URLSearchParams(params);
    next.set('open', decade);
    next.delete('wilaya');
    next.delete('shown');
    /* Sur une page de type et de pays, le pays vit dans l'adresse : le
       changer y change de page au lieu de filtrer deux fois. */
    if (payslug) {
      next.delete('pays');
      const country = pays === code ? '' : code;
      const path = trade && country
        ? `/annuaire/${slugDeTrade(trade)}/${slugPays(country)}`
        : country ? '/annuaire' : `/annuaire/${slugDeTrade(trade)}`;
      if (!trade && country) next.set('pays', country);
      const query = next.toString();
      navigate(query ? `${path}?${query}` : path, { replace: true });
      setActivePin(null);
      return;
    }
    if (pays === code) next.delete('pays');
    else next.set('pays', code);
    setParams(next, { replace: true });
    setActivePin(null);
  };

  /* The region and the country it belongs to land together, so a place picked
     from the grouped list never filters on a namesake elsewhere. */
  const setRegion = (region: string, code: string) => {
    /* Une page de type et de pays tient son pays de l'adresse : la région
       d'un autre pays y emmène, au lieu de filtrer sous un pays qui ment. */
    if (payslug) {
      const next = new URLSearchParams(params);
      next.delete('pays');
      next.delete('shown');
      if (region) next.set('wilaya', region);
      else next.delete('wilaya');
      const country = code || slugPaysCode;
      const path = trade && country
        ? `/annuaire/${slugDeTrade(trade)}/${slugPays(country)}`
        : '/annuaire';
      if (!trade && country) next.set('pays', country);
      const query = next.toString();
      navigate(query ? `${path}?${query}` : path, { replace: true });
      setActivePin(null);
      return;
    }
    const next = new URLSearchParams(params);
    if (code) next.set('pays', code);
    else next.delete('pays');
    if (region) next.set('wilaya', region);
    else next.delete('wilaya');
    next.delete('shown');
    setParams(next, { replace: true });
    setActivePin(null);
  };

  /** The week counter on the results line opens the seven-day view, and a
      second click hands the whole pool back. */
  const toggleWeek = () => {
    setParam('fresh', onlyWeek ? '' : 'week');
    setActivePin(null);
  };

  const pickRadius = (km: number | null) => {
    const next = new URLSearchParams(params);
    next.delete('shown');
    if (km) next.set('radius', String(km));
    else next.delete('radius');
    if (km) next.set('sort', 'distance');
    else if (next.get('sort') === 'distance') next.delete('sort');
    setParams(next, { replace: true });
    setActivePin(null);
    saveDirMemory({ sort: km ? 'distance' : 'pertinence' });
  };

  /** Only react to a fresh permission prompt, never to a restored position. */
  const prevGeo = useRef(geo.status);
  useEffect(() => {
    const prev = prevGeo.current;
    prevGeo.current = geo.status;
    if (prev !== 'asking') return;
    const next = new URLSearchParams(params);
    if (geo.status === 'ready') {
      next.set('sort', 'distance');
      setParams(next, { replace: true });
      return;
    }
    if (geo.status === 'denied' || geo.status === 'error' || geo.status === 'unsupported') {
      next.delete('sort');
      next.delete('radius');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.status]);

  /** Sort is part of the remembered search, so it is stored on user action. */
  const pickSort = (next: SortKey) => {
    setParam('sort', next === 'pertinence' ? '' : next);
    saveDirMemory({ sort: next });
  };

  /** The author order follows the same rule: in the link first, then on the device. */
  const pickAuthorSort = (next: AuthorSort) => {
    setParam('sort', next === 'pertinence' ? '' : next);
    saveAuteurMemory({ sort: next });
  };

  const toggleNear = () => {
    if (geo.status === 'ready') {
      geo.reset();
      const next = new URLSearchParams(params);
      next.delete('radius');
      if (next.get('sort') === 'distance') next.delete('sort');
      setParams(next, { replace: true });
      saveDirMemory({ sort: 'pertinence' });
      return;
    }
    geo.request();
  };

  const switchMode = (next: Mode) => {
    /* La rubrique choisie du doigt est retenue : le tableau se rouvrira sur ce
       bord-là, comme il se rouvre sur son tri. */
    saveDirMemory({ kind: next });
    const p = new URLSearchParams();
    if (next === 'auteurs') p.set('kind', 'auteurs');
    if (q) p.set('q', q);
    if (pays) p.set('pays', pays);
    if (wilaya) p.set('wilaya', wilaya);
    if (next === 'auteurs' && genre) p.set('genre', genre);
    if (next === 'entreprises' && trade) p.set('trade', trade);
    if (next === 'auteurs' && auteurSort !== 'pertinence') p.set('sort', auteurSort);
    if (next === 'entreprises' && sort !== 'pertinence') p.set('sort', sort);
    if (slugTrade) {
      /* On quitte la page d'un type : son adresse ne décrit plus la liste. */
      p.delete('trade');
      const query = p.toString();
      navigate(query ? `/annuaire?${query}` : '/annuaire', { replace: true });
    } else {
      setParams(p, { replace: true });
    }
    setActivePin(null);
    setRecall('');
    geo.reset();
  };

  /**
   * La rubrique du haut du tableau — Entreprises ou Auteurs — reste sur
   * l'appareil, exactement comme le tri : on rouvre le tableau sur le bord
   * qu'on lisait. Une adresse qui porte déjà une rubrique, un type ou un pays
   * décrit une autre liste, et l'emporte toujours.
   */
  useEffect(() => {
    if (kindRestored.current) return;
    kindRestored.current = true;
    if (params.get('kind') || slugTrade || payslug) return;
    const explicit = Array.from(params.keys()).some((key) => key !== 'list');
    if (explicit) return;
    if (readDirMemory().kind !== 'auteurs') return;
    /* La bascule est notée : la recherche d'ateliers ne se rejoue pas sous
       une liste de plumes. */
    kindSwitch.current = true;
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('kind', 'auteurs');
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** La rubrique lue est gardée à chaque bascule, jamais par une adresse. */
  /**
   * Reopen the directory where the visitor left it: last wilaya, and last radius
   * when a position is still available. An explicit (or shared) URL always wins.
   */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    /* Une bascule vers les plumes vient d'être demandée : la liste d'ateliers
       n'a pas à se rejouer par-dessus. */
    if (kindSwitch.current) return;
    /* The author list has its own memory, replayed by the effect below. */
    if (mode === 'auteurs') return;
    if (params.get('list')) return;
    const memory = readDirMemory();
    const hasPosition = Boolean(geo.point);
    const keepWilaya = !params.get('wilaya') && Boolean(memory.wilaya);
    const keepRadius = !params.get('radius') && Boolean(memory.radius) && hasPosition;
    const keepSort = !params.get('sort') && memory.sort !== 'pertinence'
      && (memory.sort !== 'distance' || hasPosition);
    const keepView = !params.get('view') && memory.view === 'map';
    /* The chosen generation is part of the search: a decade reopened with the
       rest, so the visitor lands on the same ten years they left. */
    const keepOpen = !params.get('open') && Boolean(memory.open);
    /* Le métier fait partie de la recherche retenue : il revient avec la
       région et l'ouverture, sans écraser une adresse qui le porte déjà. */
    const keepTrade = !slugTrade && !params.get('trade') && Boolean(memory.trade);
    /* Les pastilles de rubrique de la barre reviennent avec le reste : les
       nouveaux arrivés et les institutions sont des choix, pas des hasards. */
    const keepFresh = !params.get('fresh') && memory.fresh;
    const keepInsti = !params.get('insti') && memory.insti;
    if (!keepWilaya && !keepRadius && !keepSort && !keepView && !keepOpen && !keepTrade
      && !keepFresh && !keepInsti) return;
    const parts: string[] = [];
    if (keepTrade) parts.push(t(`tradePlural.${memory.trade}`));
    if (keepFresh) parts.push(t('dir.fresh'));
    if (keepInsti) parts.push(t('dir.insti'));
    if (keepWilaya) parts.push(memory.wilaya);
    if (keepRadius && memory.radius) parts.push(`${memory.radius} km`);
    if (keepOpen) parts.push(`${t('dir.openLabel')} ${decadesLabel(parseDecades(memory.open))}`);
    if (keepSort) parts.push(t(SORT_LABEL[memory.sort]));
    if (keepView) parts.push(t('dir.map'));
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (keepTrade) next.set('trade', memory.trade);
      if (keepFresh) next.set('fresh', '1');
      if (keepInsti) next.set('insti', '1');
      if (keepWilaya) next.set('wilaya', memory.wilaya);
      if (keepRadius && memory.radius) next.set('radius', String(memory.radius));
      if (keepOpen) next.set('open', memory.open);
      if (keepSort) next.set('sort', memory.sort);
      else if (keepRadius && !next.get('sort')) next.set('sort', 'distance');
      if (keepView) next.set('view', 'map');
      return next;
    }, { replace: true });
    setRecall(parts.join(' · '));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restored.current || mode !== 'entreprises') return;
    /* Une page dédiée à un type n'écrit pas dans la mémoire : l'annuaire
       entier doit rester ouvert quand on le rouvre. */
    if (slugTrade) return;
    saveDirMemory({ wilaya, open: openYear, trade, fresh: onlyNew, insti: onlyInsti });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wilaya, openYear, trade, mode, slugTrade, onlyNew, onlyInsti]);

  /**
   * Reopen the author list where it was left: its country, its region, its
   * genre and its order. An explicit (or shared) address always wins over the
   * device memory.
   */
  useEffect(() => {
    if (auteurRestored.current) return;
    auteurRestored.current = true;
    if (mode !== 'auteurs') return;
    const memory = readAuteurMemory();
    const keepPays = !params.get('pays') && Boolean(memory.pays);
    const keepWilaya = !params.get('wilaya') && Boolean(memory.wilaya);
    const keepGenre = !params.get('genre') && Boolean(memory.genre);
    const keepSort = !params.get('sort') && memory.sort !== 'pertinence';
    const keepOpen = !params.get('open') && Boolean(memory.open);
    if (!keepPays && !keepWilaya && !keepGenre && !keepSort && !keepOpen) return;
    const parts: string[] = [];
    if (keepPays) parts.push(nomPays(memory.pays, lang));
    if (keepWilaya) parts.push(nomRegion(memory.wilaya, lang));
    if (keepGenre) parts.push(t(`genre.${memory.genre}`));
    if (keepOpen) parts.push(`${t('gen.pubLabel')} ${decadesLabel(parseDecades(memory.open))}`);
    if (keepSort) parts.push(t(AUTHOR_SORT_LABEL[memory.sort]));
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (keepPays) next.set('pays', memory.pays);
      if (keepWilaya) next.set('wilaya', memory.wilaya);
      if (keepGenre) next.set('genre', memory.genre);
      if (keepOpen) next.set('open', memory.open);
      if (keepSort) next.set('sort', memory.sort);
      return next;
    }, { replace: true });
    setRecall(parts.join(' · '));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Every author filter lands on the device as well, never in place of the link. */
  useEffect(() => {
    if (!auteurRestored.current || mode !== 'auteurs') return;
    saveAuteurMemory({ pays, wilaya, genre, open: openYear });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pays, wilaya, genre, openYear, mode]);

  /**
   * Les régions et les pays traversés sont notés au passage : la fiche d'un
   * atelier — comme celle d'une annonce ou d'une offre — pourra dire combien
   * de lieux ont été ouverts, et rouvrir le dernier. Un pays se traverse sans
   * région : il se note donc même quand aucune région n'est choisie.
   */
  useEffect(() => {
    if (!restored.current || mode !== 'entreprises') return;
    if (pays) notePaysWalk(pays);
    /* Le métier se traverse sans lieu : il se note à part, même quand aucune
       région n'est choisie. */
    if (trade) noteTradeWalk(trade);
    if (!wilaya) return;
    noteRegionWalk(pays, wilaya);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wilaya, pays, trade, mode]);

  useEffect(() => {
    if (!restored.current || mode !== 'entreprises') return;
    if (!distanceReady && radiusFromUrl === null) return;
    saveDirMemory({ radius: radiusFromUrl });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusFromUrl, distanceReady, mode]);

  const switchView = (next: 'list' | 'map') => {
    const p = new URLSearchParams(params);
    if (next === 'map') p.set('view', 'map');
    else p.delete('view');
    setParams(p, { replace: true });
    saveDirMemory({ view: next });
  };

  /** Keep the shortlist id list inside the URL so a copied link reopens the same selection. */
  const listParam = params.get('list') ?? '';
  const idsKey = shortlist.ids.join(',');
  const syncedList = useRef('');

  useEffect(() => {
    if (listParam === idsKey) {
      syncedList.current = idsKey;
      return;
    }
    if (listParam && syncedList.current !== listParam) {
      syncedList.current = listParam;
      shortlist.replace(listParam.split(',').map((v) => v.trim()).filter(Boolean));
      return;
    }
    syncedList.current = idsKey;
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (idsKey) next.set('list', idsKey);
      else next.delete('list');
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listParam, idsKey]);

  const needle = q.trim().toLowerCase();

  const distances = useMemo(() => {
    const map = new Map<string, number>();
    if (!geo.point) return map;
    entreprises.forEach((e) => map.set(e.id, haversineKm(geo.point as { lat: number; lng: number }, { lat: e.lat, lng: e.lng })));
    return map;
  }, [geo.point]);

  const bizPool = useMemo(() => entreprises.filter((e) => {
    if (trade && e.trade !== trade) return false;
    /* Le second niveau de précision, lu sur ce que la fiche déclare. */
    if (spec && !specialitesDe(e).includes(spec)) return false;
    if (month && monthKey(e.joined) !== month) return false;
    if (radius) {
      const km = distances.get(e.id);
      if (typeof km !== 'number' || km > radius) return false;
    }
    if (!needle) return true;
    const hay = [nomDemoCherchable(e.name), e.wilaya, graphiesRegion(e.wilaya).join(' '), e.commune, e.blurb.fr, e.blurb.ar, e.blurb.en ?? '', ...e.services.map((s) => `${s.fr} ${s.ar} ${s.en ?? ''}`)]
      .join(' ').toLowerCase();
    return hay.includes(needle);
  }), [needle, trade, spec, month, radius, distances]);

  /* The country filter is applied on top of that pool, so the counter above
     the board can still show where the whole selection comes from. */
  const bizFiltered = useMemo(
    () => (pays ? bizPool.filter((e) => paysDe(e) === pays) : bizPool),
    [bizPool, pays],
  );

  /* The pill counts what the list will really show: the country already
     applied, and the region on top of it. A chip that ignored the region
     promised sheets the reader would never see. */
  const scopeFiltered = useMemo(
    () => (wilaya ? bizFiltered.filter((e) => e.wilaya === wilaya) : bizFiltered),
    [bizFiltered, wilaya],
  );

  /** Announced on the pill so visitors know what the filter holds before clicking. */
  const freshCount = useMemo(() => scopeFiltered.filter((e) => isNewcomer(e.id)).length, [scopeFiltered]);

  /** The same seven-day beat as the candidate list, on the same filtered pool. */
  const weekCount = useMemo(
    () => scopeFiltered.filter((e) => isWithinDays(e.joined, 7)).length,
    [scopeFiltered],
  );

  /** Les dates d'inscription du périmètre lu : le pouls des sept semaines. */
  const weekPulseDates = useMemo(() => bizFiltered.map((e) => e.joined), [bizFiltered]);

  /** Announced on the institutions pill, so the filter says what it holds. */
  const instiCount = useMemo(
    () => scopeFiltered.filter((e) => formuleDe(e) === 'institutions').length,
    [scopeFiltered],
  );

  /** Structures that declare at least one site: the ground the park order reads. */
  const etabsParkCount = useMemo(
    () => scopeFiltered.filter((e) => (e.etablissements ?? 0) > 0).length,
    [scopeFiltered],
  );

  /** Finishing workshops the country and the region already chosen hold: the
      chip in the filter row carries this figure, so it says exactly what the
      reader will see once the trade is switched on — no national total standing
      in for a scope that no longer holds it. */
  const facCount = useMemo(
    () => entreprises.filter((e) => e.trade === 'faconnage'
      && (!pays || paysDe(e) === pays)
      && (!wilaya || e.wilaya === wilaya)).length,
    [pays, wilaya],
  );

  /** Combien d'ateliers de chaque métier répondent dans le pays et la région
      déjà retenus. La liste « Métier » les annonce à côté de leur nom : un
      choix se fait sur ce qu'on verra, jamais sur un total national que la
      région a déjà écarté. */
  const tradeTally = useMemo(() => {
    const counts: Record<string, number> = {};
    entreprises.forEach((e) => {
      if (pays && paysDe(e) !== pays) return;
      if (wilaya && e.wilaya !== wilaya) return;
      counts[e.trade] = (counts[e.trade] ?? 0) + 1;
    });
    return counts;
  }, [pays, wilaya]);

  /** Le total du périmètre, écrit à côté de « Tous les métiers ». */
  const tradeTotal = useMemo(
    () => Object.values(tradeTally).reduce((sum, n) => sum + n, 0),
    [tradeTally],
  );

  /** Combien d'ateliers de ce type chaque pays tient : la rangée « Par pays »
      d'une page de type, le plus fourni d'abord. */
  const tradePaysTally = useMemo(
    () => (trade ? tallyPays(entreprises.filter((e) => e.trade === trade)) : []),
    [trade],
  );

  /** Combien d'ateliers de chaque spécialité répondent dans le pays et la
      région déjà retenus : le second niveau du menu annonce un chiffre réel,
      jamais un total national que la région a déjà écarté. */
  const specTally = useMemo(() => {
    const counts: Record<string, number> = {};
    entreprises.forEach((e) => {
      if (pays && paysDe(e) !== pays) return;
      if (wilaya && e.wilaya !== wilaya) return;
      specialitesDe(e).forEach((key) => {
        counts[key] = (counts[key] ?? 0) + 1;
      });
    });
    return counts;
  }, [pays, wilaya]);

  /** Combien d'ateliers du métier choisi répondent dans le pays et la région
      déjà retenus. Zéro, et la rangée de filtres le dit avant la page vide. */
  const tradeCount = useMemo(
    () => (trade ? entreprises.filter((e) => e.trade === trade
      && (!pays || paysDe(e) === pays)
      && (!wilaya || e.wilaya === wilaya)).length : -1),
    [trade, pays, wilaya],
  );

  const bizBase = useMemo(() => {
    let base = bizFiltered;
    if (onlyWeek) base = base.filter((e) => isWithinDays(e.joined, 7));
    else if (onlyNew) base = base.filter((e) => isNewcomer(e.id));
    /* The institution pill narrows on top of the other filters, never instead
       of them: a country and a plan can be read together. */
    if (onlyInsti) base = base.filter((e) => formuleDe(e) === 'institutions');
    return base;
  }, [bizFiltered, onlyNew, onlyWeek, onlyInsti]);

  const wilayaCounts = useMemo(() => {
    const map = new Map<string, number>();
    bizBase.forEach((e) => map.set(e.wilaya, (map.get(e.wilaya) ?? 0) + 1));
    return Array.from(map.entries())
      .map(([w, count]) => ({ wilaya: w, count }))
      .sort((a, b) => b.count - a.count || a.wilaya.localeCompare(b.wilaya, 'fr'));
  }, [bizBase]);

  const bizList = useMemo(() => {
    const decades = parseDecades(openYear);
    const list = bizBase.filter((e) => (!wilaya || e.wilaya === wilaya)
      && (decades.length === 0 || decades.includes(decadeOf(e.since))));
    if (effectiveSort === 'distance' && geo.point) {
      list.sort((a, b) => (distances.get(a.id) ?? 0) - (distances.get(b.id) ?? 0));
    } else if (effectiveSort === 'newest') {
      list.sort((a, b) => b.joined.localeCompare(a.joined) || a.name.localeCompare(b.name, 'fr'));
    } else if (effectiveSort === 'first') {
      /* Read by seniority: the workshop that opened first heads the list. */
      list.sort((a, b) => a.since - b.since || a.name.localeCompare(b.name, 'fr'));
    } else if (effectiveSort === 'generation') {
      /* Two decades read as two blocks: the generations in the order they were
         picked, and each block read by name, so the second one starts on a
         clean break instead of a continuation of the first. */
      list.sort((a, b) => {
        const rankA = decadeRank(decadeOf(a.since), decades);
        const rankB = decadeRank(decadeOf(b.since), decades);
        if (rankA !== rankB) return rankA - rankB;
        if (decadeOf(a.since) !== decadeOf(b.since)) return decadeOf(a.since) - decadeOf(b.since);
        return a.name.localeCompare(b.name, 'fr');
      });
    } else if (effectiveSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    } else if (effectiveSort === 'capacity') {
      list.sort((a, b) => capacityScore(b) - capacityScore(a));
    } else if (effectiveSort === 'etabs') {
      /* Read by the size of the park: the structures gathering the most
         establishments first. A single workshop carries none, so it falls to
         the end of the list, read by name among its peers. */
      list.sort((a, b) => (b.etablissements ?? 0) - (a.etablissements ?? 0)
        || a.name.localeCompare(b.name, 'fr'));
    } else if (effectiveSort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    }
    return list;
  }, [bizBase, wilaya, openYear, effectiveSort, distances, geo.point]);

  /* The search and the region narrow the pens; the genre is applied on top,
     so the genre counters can still count the whole of that selection. */
  const authorSearchPool = useMemo(() => auteurs.filter((a) => {
    if (wilaya && a.wilaya !== wilaya) return false;
    if (!needle) return true;
    const hay = [
      nomDemoCherchable(a.name), a.wilaya, graphiesRegion(a.wilaya).join(' '), a.commune, a.bio.fr, a.bio.ar, a.bio.en ?? '',
      ...a.books.map((b) => `${b.title.fr} ${b.title.ar} ${b.title.en ?? ''} ${b.publisher}`),
      ...a.services.map((s) => `${s.fr} ${s.ar} ${s.en ?? ''}`),
    ].join(' ').toLowerCase();
    return hay.includes(needle);
  }), [needle, wilaya]);

  const authorPool = useMemo(
    () => (genre ? authorSearchPool.filter((a) => a.genres.includes(genre as Genre)) : authorSearchPool),
    [authorSearchPool, genre],
  );

  /* The pens the country filter keeps: the ground both the list and the
     generation counters are read on, before either narrows it further. */
  const authorBase = useMemo(
    () => (pays ? authorPool.filter((a) => paysDe(a) === pays) : authorPool),
    [authorPool, pays],
  );

  const authorList = useMemo(() => {
    /* A generation reads as the decade of the first publication: the same
       gesture as the opening decade on a workshop sheet. Two decades can be
       read at once, so two generations sit side by side in the list. */
    const decades = parseDecades(openYear);
    const base = decades.length
      ? authorBase.filter((a) => decades.includes(decadeOf(premierePublication(a))))
      : authorBase;
    const list = [...base];
    const latestYear = (a: (typeof list)[number]) => a.books.reduce((max, b) => Math.max(max, b.year), 0);
    /* The earliest book of each pen: the « first publication » order reads the
       list by seniority, the oldest imprint first. */
    const firstYear = (a: (typeof list)[number]) => premierePublication(a);
    if (auteurSort === 'books') {
      list.sort((a, b) => b.books.length - a.books.length || a.name.localeCompare(b.name, 'fr'));
    } else if (auteurSort === 'recent') {
      list.sort((a, b) => latestYear(b) - latestYear(a) || a.name.localeCompare(b.name, 'fr'));
    } else if (auteurSort === 'first') {
      list.sort((a, b) => firstYear(a) - firstYear(b) || a.name.localeCompare(b.name, 'fr'));
    } else if (auteurSort === 'generation') {
      /* The same two blocks as the workshop side: each generation held
         together, the pens of one decade no longer scattered among the next. */
      list.sort((a, b) => {
        const rankA = decadeRank(decadeOf(firstYear(a)), decades);
        const rankB = decadeRank(decadeOf(firstYear(b)), decades);
        if (rankA !== rankB) return rankA - rankB;
        if (decadeOf(firstYear(a)) !== decadeOf(firstYear(b))) {
          return decadeOf(firstYear(a)) - decadeOf(firstYear(b));
        }
        return a.name.localeCompare(b.name, 'fr');
      });
    } else if (auteurSort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    }
    return list;
  }, [authorBase, openYear, auteurSort]);

  /** How many pens of the selection write each genre, fullest first. The genre
      filter itself stays out of the count, so a picked genre never hides the
      others. */
  /* The ground the genre counters are read on: every pen the other filters
     leave, so the bar can say how many profiles it actually counted. */
  const genreBase = useMemo(
    () => (pays ? authorSearchPool.filter((a) => paysDe(a) === pays) : authorSearchPool),
    [authorSearchPool, pays],
  );

  const genreTally = useMemo(() => {
    const counts = new Map<Genre, number>();
    genreBase.forEach((a) => {
      a.genres.forEach((g) => counts.set(g, (counts.get(g) ?? 0) + 1));
    });
    return genres
      .map((g) => ({ genre: g, count: counts.get(g) ?? 0 }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre, 'fr'));
  }, [genreBase]);

  /** Le nombre d'autres métiers que le pays et la région déjà retenus tiennent
      encore : la ligne sous la pastille les annonce et rouvre la recherche. */
  const otherTradeCount = useMemo(
    () => (trade
      ? Object.entries(tradeTally).filter(([key, n]) => key !== trade && n > 0).length
      : 0),
    [trade, tradeTally],
  );

  /** Les autres genres de la même sélection, comptés comme la barre des
      genres : le genre retenu ne se compte pas lui-même. */
  const otherGenreCount = useMemo(
    () => (genre ? genreTally.filter((row) => row.genre !== genre).length : 0),
    [genre, genreTally],
  );

  /* The ground the generation counters are read on: the profiles the other
     filters leave, the picked decade itself kept out of the count. */
  const bizGenBase = useMemo(
    () => (wilaya ? bizBase.filter((e) => e.wilaya === wilaya) : bizBase),
    [bizBase, wilaya],
  );

  const genBase = useMemo<{ since: number; pays?: string | null; books?: { year: number }[] }[]>(
    () => (mode === 'auteurs' ? authorBase : bizGenBase),
    [mode, authorBase, bizGenBase],
  );

  /* Each decade, and inside it where its workshops actually stand: the country
     split is read under the counter, never on another screen. */
  const genTally = useMemo(() => {
    const map = new Map<number, Map<string, number>>();
    genBase.forEach((row) => {
      const start = decadeOf(mode === 'auteurs' ? premierePublication(row) : row.since);
      const byPays = map.get(start) ?? new Map<string, number>();
      const code = paysDe(row);
      byPays.set(code, (byPays.get(code) ?? 0) + 1);
      map.set(start, byPays);
    });
    return Array.from(map.entries())
      .map(([decade, byPays]) => {
        const parts = Array.from(byPays.entries())
          .map(([code, count]) => ({ code, count }))
          .sort((a, b) => b.count - a.count
            || nomPays(a.code, lang).localeCompare(nomPays(b.code, lang), 'fr'))
          .map(({ code, count }) => ({ key: code, label: code, count, title: nomPays(code, lang) }));
        return { decade, count: parts.reduce((sum, part) => sum + part.count, 0), parts };
      })
      .sort((a, b) => b.count - a.count || b.decade - a.decade);
  }, [genBase, mode, lang]);

  /* The decades the menu offers, in chronological order, each with the number
     of sheets it holds: the generations the selection actually has, plus the
     ones already applied so a shared link never shows an empty field. */
  const decadeOptions = useMemo(() => {
    const counts = new Map<number, number>();
    genTally.forEach((row) => counts.set(row.decade, row.count));
    const set = new Set<number>(counts.keys());
    parseDecades(openYear).forEach((decade) => set.add(decade));
    return Array.from(set)
      .sort((a, b) => a - b)
      .map((decade) => ({ decade, count: counts.get(decade) ?? 0 }));
  }, [genTally, openYear]);

  /* How many sheets of the listed selection each generation holds: the badge
     above the cards speaks per decade, so two generations read two figures. */
  const decadeCounts = useMemo(() => {
    const counts = new Map<number, number>();
    if (mode === 'auteurs') {
      authorList.forEach((a) => {
        const decade = decadeOf(premierePublication(a));
        counts.set(decade, (counts.get(decade) ?? 0) + 1);
      });
    } else {
      bizList.forEach((e) => {
        const decade = decadeOf(e.since);
        counts.set(decade, (counts.get(decade) ?? 0) + 1);
      });
    }
    return counts;
  }, [mode, authorList, bizList]);

  /* How many sheets come from each country, read on the piles the other
     filters leave — the country filter itself stays out of the count. */
  const tallyPool = useMemo(() => {
    if (mode === 'auteurs') return authorPool;
    let pool = bizPool;
    if (onlyWeek) pool = pool.filter((e) => isWithinDays(e.joined, 7));
    else if (onlyNew) pool = pool.filter((e) => isNewcomer(e.id));
    if (onlyInsti) pool = pool.filter((e) => formuleDe(e) === 'institutions');
    return pool;
  }, [mode, authorPool, bizPool, onlyNew, onlyWeek, onlyInsti]);

  const tally = useMemo(() => tallyPays(tallyPool), [tallyPool]);
  const tallyTotal = useMemo(() => tally.reduce((sum, row) => sum + row.count, 0), [tally]);

  /* The pin carries its own freshness so the map can ring the establishments
     registered this week, without a second pass over the dates. */
  const pins = useMemo(
    () => bizList.map((e) => ({
      id: e.id,
      name: e.name,
      lat: e.lat,
      lng: e.lng,
      week: isWithinDays(e.joined, 7),
      pays: paysDe(e),
      wilaya: e.wilaya,
    })),
    [bizList],
  );
  const activeBiz = bizList.find((e) => e.id === activePin) ?? null;
  const list = mode === 'auteurs' ? authorList : bizList;

  /* Le pays entier sous la même recherche, le même type et la même
     génération, région comprise : c'est le dénominateur de la part que la
     région tient, et ce que rend la porte « Tout ce pays » du rappel. */
  const countryCount = useMemo(() => {
    const decades = parseDecades(openYear);
    if (mode === 'auteurs') {
      const base = decades.length
        ? authorBase.filter((a) => decades.includes(decadeOf(premierePublication(a))))
        : authorBase;
      return base.length;
    }
    return bizBase.filter((e) => decades.length === 0 || decades.includes(decadeOf(e.since))).length;
  }, [mode, authorBase, bizBase, openYear]);

  /** How far the current selection spreads: its regions, counted once each. */
  const listRegions = useMemo(
    () => new Set(list.map((row) => row.wilaya).filter(Boolean)).size,
    [list],
  );

  /* How wide the board actually reaches in the country on screen: the 58
     wilayas of Algeria, or that country's own governorates, regions or
     emirates — the same word the counters above the cards use. */
  const regionSpread = useMemo(
    () => new Set(entreprises.filter((e) => !pays || paysDe(e) === pays).map((e) => e.wilaya)).size,
    [pays],
  );

  /* How many sheets are on screen is part of the address: coming back from a
     profile, or reloading, reopens the same view instead of the whole stock. */
  const rawShown = Number(params.get('shown'));
  const shown = Number.isFinite(rawShown) && rawShown >= PAGE_SIZE ? Math.floor(rawShown) : PAGE_SIZE;

  /* Two generations read in the block order cut the grid in two: each decade
     opens on its own intertitle, and its cards never mix with the other. */
  const blockMode = openDecades.length >= 2
    && (mode === 'auteurs' ? auteurSort === 'generation' : effectiveSort === 'generation');

  const authorBlocks = useMemo(
    () => (blockMode && mode === 'auteurs'
      ? openDecades
        .map((decade) => ({
          decade,
          rows: authorList
            .filter((a) => decadeOf(premierePublication(a)) === decade)
            .slice(0, shown),
        }))
        .filter((block) => block.rows.length > 0)
      : []),
    [blockMode, mode, openDecades, authorList, shown],
  );

  const bizBlocks = useMemo(
    () => (blockMode && mode === 'entreprises'
      ? openDecades
        .map((decade) => ({
          decade,
          rows: bizList
            .filter((e) => decadeOf(e.since) === decade)
            .slice(0, shown),
        }))
        .filter((block) => block.rows.length > 0)
      : []),
    [blockMode, mode, openDecades, bizList, shown],
  );

  /* Each block carries its own batch, so the second generation is never pushed
     off the screen by the first one's batch. */
  const blocks = mode === 'auteurs' ? authorBlocks : bizBlocks;
  const blockShown = blocks.length > 0
    ? blocks.reduce((sum, block) => sum + block.rows.length, 0)
    : 0;

  const visibleBiz = useMemo(() => bizList.slice(0, shown), [bizList, shown]);
  const visiblePeople = useMemo(() => authorList.slice(0, shown), [authorList, shown]);
  const shownCount = blockShown > 0
    ? blockShown
    : mode === 'auteurs' ? visiblePeople.length : visibleBiz.length;
  const remaining = Math.max(list.length - shownCount, 0);

  const showMore = () => {
    const next = new URLSearchParams(params);
    next.set('shown', String(Math.min(shown + PAGE_SIZE, list.length)));
    setParams(next, { replace: true });
  };

  /** One click and the whole remaining stock is on screen. */
  const showAll = () => {
    const next = new URLSearchParams(params);
    next.set('shown', String(list.length));
    setParams(next, { replace: true });
  };

  /** Expanded list: fold it back to its first row, then land on the results line. */
  const expanded = shown > PAGE_SIZE;
  const collapse = () => {
    const next = new URLSearchParams(params);
    next.delete('shown');
    setParams(next, { replace: true });
    document.getElementById('board-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* The empty state of the finishing chip has its own title and its own two
     gestures: it is read as a scope, not as a generic blank page. */
  const facEmpty = mode === 'entreprises' && trade === 'faconnage';

  /** L'état vide nomme le lieu qu'on vient d'écarter — « aucune fiche à
      Oran » — au lieu d'une phrase générale qui ne dit pas où l'on a
      cherché. Sans lieu retenu, la phrase générale reste, et elle dit vrai. */
  /* Combien de plumes le lieu retenu tient, à lui seul : le pays et la région,
     sans la recherche, le genre ni la décennie. Un lieu qui n'en tient plus
     aucune est la raison du vide ; un lieu qui en tient encore ne l'est pas,
     et la phrase générale revient, qui dit vrai. */
  const authorPlaceHolds = useMemo(
    () => auteurs.filter((a) => (!wilaya || a.wilaya === wilaya) && (!pays || paysDe(a) === pays)).length,
    [wilaya, pays],
  );

  /* Dans la liste des plumes, le lieu se nomme avec les mots de la liste :
     « aucun auteur à Oran », et non « aucun profil ». Il ne se dit que
     lorsque la région — ou le pays — ne tient plus rien. */
  const emptyPlace = mode === 'auteurs'
    ? (authorPlaceHolds === 0
      ? emptyPlaceLine(lang, t, wilaya, pays, 'dir.emptyPlaceAuteur')
      : '')
    : emptyPlaceTitle(lang, t, wilaya, pays);

  /** Widen one step only: the region steps aside, the country and the trade
      stay exactly where they are. */
  const clearRegion = () => {
    const next = new URLSearchParams(params);
    next.delete('wilaya');
    next.delete('shown');
    setParams(next, { replace: true });
    setActivePin(null);
  };

  /**
   * « Tout rendre » : les filtres rangés derrière la porte s'effacent d'un seul
   * geste — recherche, pays, région, ouverture, pastilles, mois —, sans toucher
   * au type lu : c'est lui la rubrique du tableau, pas un filtre en attente.
   * Le tri ne bouge que s'il lisait le parc, puisque cette bascule-là est
   * rangée derrière la porte avec le reste.
   */
  const clearFolded = () => {
    const next = new URLSearchParams(params);
    ['q', 'pays', 'wilaya', 'open', 'fresh', 'month', 'insti', 'shown'].forEach((key) => {
      next.delete(key);
    });
    const byPark = next.get('sort') === 'etabs';
    if (byPark) next.delete('sort');
    /* Sur une page de type et de pays, le pays vit dans l'adresse : y rendre
       les filtres rend le pays, jamais le type. */
    if (slugTrade || payslug) {
      const path = slugTrade ? `/annuaire/${slugDeTrade(slugTrade)}` : '/annuaire';
      const query = next.toString();
      navigate(query ? `${path}?${query}` : path, { replace: true });
    } else {
      setParams(next, { replace: true });
    }
    setActivePin(null);
    setRecall('');
    if (mode === 'auteurs') saveAuteurMemory({ pays: '', wilaya: '', open: '' });
    else saveDirMemory({
      wilaya: '', open: '', fresh: false, insti: false, sort: byPark ? 'pertinence' : sort,
    });
  };

  const resetAll = () => {
    const next = new URLSearchParams(params);
    FILTER_KEYS.forEach((key) => next.delete(key));
    if (slugTrade) {
      /* La remise à zéro rend aussi le type : on revient à l'annuaire entier. */
      const query = next.toString();
      navigate(query ? `/annuaire?${query}` : '/annuaire', { replace: true });
    } else {
      setParams(next, { replace: true });
    }
    setActivePin(null);
    setRecall('');
    clearDirMemory();
    clearAuteurMemory();
    /* La remise à zéro rend la recherche, pas la rubrique lue : le bord du
       tableau reste celui qu'on avait choisi. */
    saveDirMemory({ kind: mode });
    geo.reset();
  };

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-hero">
          {/* Le chemin de la page, montré et non seulement déclaré : arrivé
              depuis un résultat de recherche, le lecteur voit où il se tient
              et par où remonter. */}
          {mode === 'entreprises' && (trade || wilaya) && <DirTrail crumbs={trailCrumbs} />}
          <p className="stamp">{mode === 'auteurs' ? t('dir.authorsStamp') : t('dir.stamp')}</p>
          {mode === 'entreprises' && trade ? (
            /* Le titre suit le type lu : « Imprimeries en Algérie », « Impression
               offset en Algérie », « … dans le monde arabe ». */
            <h1 className="page-h1">
              {typeLabel} <em className="accent">{placeLabel}</em>
            </h1>
          ) : (
            <h1 className="page-h1" dangerouslySetInnerHTML={{ __html: mode === 'auteurs' ? t('dir.authorsTitle') : t('dir.title') }} />
          )}
          <p className="lede">
            {mode === 'entreprises' && trade
              ? t('tradePage.desc').replace('{label}', typeLabel).replace('{place}', placeLabel)
              : mode === 'auteurs' ? t('dir.authorsSub') : t('dir.sub')}
          </p>
          {/* Le paragraphe propre au type : ce que ce métier fait, dit une
              fois, pour le lecteur comme pour le moteur de recherche. */}
          {mode === 'entreprises' && trade && (
            <p className="dir-trade-intro">{t(`tradePage.intro.${trade}`)}</p>
          )}
          {/* La phrase du pays : ce que le métier fait, le paragraphe ci-dessus
              le dit ; où il se tient dans ce pays-là, c'est cette phrase —
              propre à la page /annuaire/<type>/<pays>, jamais répétée ailleurs. */}
          {mode === 'entreprises' && trade && pays && (
            <p className="dir-trade-place">
              <i className="ri-map-pin-2-line" aria-hidden="true"></i>
              <span>{t(`tradePlace.${pays}`)}</span>
            </p>
          )}
          {/* Le manque à l'échelle d'une région du monde : sur la page d'un
              pays, les voisins de la même aire où le même métier n'a aucun
              atelier — chacun ouvrant sa page, le métier déjà lu. */}
          {mode === 'entreprises' && trade && pays && (
            <TradeNeighbourMissing trade={trade} pays={pays} />
          )}
          {/* Sous le titre, les pays où le métier manque : la page dit ce que
              le type tient, cette ligne dit ce qu'il ne tient pas — et chaque
              nom ouvre sa page de pays, le métier déjà lu. */}
          {mode === 'entreprises' && trade && (
            <TradeMissingCountries trade={trade} />
          )}
        </section>

        <section className="dir-body board-body">
          {/* D'où l'on arrive : les six familles d'Arabe World ouvrent chacune
              une page de type, puis une page de type et de pays. La ligne le
              dit une fois, avec la phrase de la page lue — le métier seul,
              ou le métier dans son pays — et le chemin du retour. Sur une page
              de type, ce chemin est nommé : il ramène à la carte de la famille
              dont la visite est partie, pas seulement à la page. */}
          {viaWorld && mode === 'entreprises' && (
            <WorldRecall
              typeLabel={trade ? t(`tradePlural.${trade}`) : ''}
              subject={trade
                ? `${typeLabel}${pays ? ` ${phrasePays(pays, lang)}` : ''} · ${t(pays ? 'world.viaCountryText' : 'world.viaTradeText')}`
                : ''}
              familyLabel={trade ? t(`tradePlural.${trade}`) : ''}
              familyTo={trade ? `/arabe-world#${ancreFamille(trade)}` : ''}
            />
          )}

          <FilterBar
            lead={(
              <div className="dir-tools">
                <div className="segmented" role="group" aria-label={t('dir.stamp')}>
                  <button type="button" className={mode === 'entreprises' ? 'is-on' : ''} aria-pressed={mode === 'entreprises'} onClick={() => switchMode('entreprises')}>
                    <i className="ri-building-4-line" aria-hidden="true"></i>{t('dir.kindBiz')}
                  </button>
                  <button type="button" className={mode === 'auteurs' ? 'is-on' : ''} aria-pressed={mode === 'auteurs'} onClick={() => switchMode('auteurs')}>
                    <i className="ri-quill-pen-line" aria-hidden="true"></i>{t('dir.kindAuthors')}
                  </button>
                </div>

                {mode === 'entreprises' && (
                  <div className="segmented" role="group" aria-label={t('dir.map')}>
                    <button type="button" className={view === 'list' ? 'is-on' : ''} aria-pressed={view === 'list'} onClick={() => switchView('list')}>
                      <i className="ri-list-check-2" aria-hidden="true"></i>{t('dir.list')}
                    </button>
                    <button type="button" className={view === 'map' ? 'is-on' : ''} aria-pressed={view === 'map'} onClick={() => switchView('map')}>
                      <i className="ri-map-2-line" aria-hidden="true"></i>{t('dir.map')}
                    </button>
                  </div>
                )}
              </div>
            )}
            panel={(
              <>
                {mode === 'auteurs' ? <AuteurFinder /> : view === 'list' ? <FicheFinder /> : null}

                {list.length > 0 && !(mode === 'entreprises' && view === 'map') && (
                  <GridTally
                    files={list.length}
                    regions={listRegions}
                    paysTotal={paysArabes.length}
                    kind={mode === 'auteurs' ? 'auteurs' : 'biz'}
                  />
                )}

                {mode === 'auteurs' && list.length > 0 && (
                  <GenreTally
                    counts={genreTally}
                    total={genreBase.length}
                    active={genre}
                    onPick={(g) => setFilter('genre', g)}
                  />
                )}

                {mode === 'entreprises' ? (
                  <DirectoryTools
                    sort={effectiveSort}
                    onSort={pickSort}
                    geoStatus={geo.status}
                    distanceReady={distanceReady}
                    radius={radius}
                    radiusFromUrl={radiusFromUrl}
                    onRadius={pickRadius}
                  />
                ) : (
                  <AuthorTools sort={auteurSort} onSort={pickAuthorSort} />
                )}

                {mode === 'entreprises' && (
                  <div className="arrival-brief" aria-live="polite">
                    <i className="ri-pulse-line" aria-hidden="true"></i>
                    <span>
                      {weekCount === 0 && freshCount === 0 ? (
                        t('trend.calm')
                      ) : (
                        <>
                          <strong>+{weekCount}</strong> {t('trend.week')}
                          <em>·</em>
                          <strong>+{freshCount}</strong> {t('trend.month')}
                        </>
                      )}
                    </span>
                    <WeekPulse dates={weekPulseDates} />
                  </div>
                )}

                {list.length > 0 && genTally.length > 0 && (mode === 'auteurs' || view === 'list') && (
                  <GenerationTally
                    counts={genTally}
                    total={genBase.length}
                    totalWord={t(mode === 'auteurs' ? 'gtally.profiles' : 'gtally.files')}
                    active={openYear}
                    activeKeys={openDecades.map(String)}
                    activePays={openYear ? pays : ''}
                    onPick={(decade) => setFilter('open', toggleDecade(openYear, decade))}
                    onPickPays={pickGenerationPays}
                  />
                )}

                <ScopeLine wilaya={wilaya} pays={pays} regionInScope={false} />

                {/* Les portes du catalogue — les types, puis les pays d'un
                    type, puis les pays du périmètre — se rangent ici, dans le
                    même dépliant : la page n'a plus qu'une seule porte
                    au-dessus des fiches. */}
                {mode === 'entreprises' && (
                  <DirectoryExplore
                    embedded
                    trade={trade}
                    tradeCounts={tradeTally}
                    typeCountries={tradePaysTally}
                    pays={pays}
                    wilaya={wilaya}
                    paysCounts={tally}
                    paysTotal={tallyTotal}
                    onPickPays={(code) => setFilter('pays', code)}
                    showPays={view === 'list'}
                  />
                )}
              </>
            )}
            count={mode === 'entreprises' && view === 'map' ? bizList.length : list.length}
            countWord={t(
              mode === 'auteurs'
                ? (list.length === 1 ? 'dir.authorResultOne' : 'dir.authorsResults')
                : (list.length === 1 ? 'dir.resultOne' : 'dir.results'),
            )}
            geoStatus={geo.status}
            distanceReady={distanceReady}
            onNear={toggleNear}
            mode={mode}
            q={q}
            onQ={(v) => setParam('q', v)}
            pays={pays}
            onPays={(v) => setFilter('pays', v)}
            wilaya={wilaya}
            onRegion={setRegion}
            trade={trade}
            onTrade={(v) => pickType(v, '')}
            spec={spec}
            specCounts={specTally}
            onType={pickType}
            genre={genre}
            onGenre={(v) => setFilter('genre', v)}
            facCount={facCount}
            tradeCount={tradeCount}
            tradeCounts={tradeTally}
            tradeTotal={tradeTotal}
            open={openYear}
            onOpen={handleOpen}
            decades={decadeOptions}
            fresh={onlyNew}
            freshCount={freshCount}
            insti={onlyInsti}
            instiCount={instiCount}
            onInsti={(v) => {
              setParam('insti', v ? '1' : '');
              setActivePin(null);
            }}
            etabsSort={effectiveSort === 'etabs'}
            etabsSortCount={etabsParkCount}
            onEtabsSort={(v) => {
              pickSort(v ? 'etabs' : 'pertinence');
              setActivePin(null);
            }}
            weekActive={onlyWeek}
            month={month}
            onClearFolded={clearFolded}
            onClearRegion={clearRegion}
            onFresh={(v) => {
              setParam('fresh', v ? '1' : '');
              setActivePin(null);
            }}
            onReset={resetAll}
          />

          {/* Le pont entre le métier et les plumes : la page Écrivains mène à
              l'onglet Auteurs, et l'onglet Auteurs ramène à la page du métier,
              pays et région gardés d'un bord à l'autre. */}
          {mode === 'entreprises' && trade === 'ecrivain' && (
            <TradeAuthorsBridge mode="entreprises" pays={pays} wilaya={wilaya} />
          )}
          {mode === 'auteurs' && (
            <TradeAuthorsBridge mode="auteurs" pays={pays} wilaya={wilaya} />
          )}

          {/* La région la plus active du type dans ce pays, avec la carte du
              pays déjà resserrée sur elle : la page dit où le métier bat. */}
          {mode === 'entreprises' && trade && pays && (
            <TradeHotRegion trade={trade} pays={pays} />
          )}

          {recall && (
            <div className="dir-recall">
              <i className="ri-history-line" aria-hidden="true"></i>
              <span className="dir-recall-txt">
                {t('mem.restored')} <strong>{recall}</strong>
              </span>
              <button type="button" className="dir-recall-forget" onClick={resetAll}>
                {t('mem.forget')}
              </button>
              <button
                type="button"
                className="dir-recall-x"
                onClick={() => setRecall('')}
                aria-label={t('cmp.close')}
              >
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            </div>
          )}

          {returnBiz && (
            <Link className="dir-return" to={`/entreprise/${returnBiz.id}`}>
              <i className="ri-arrow-left-line" aria-hidden="true"></i>
              <span>{t('dir.returnTo')} <strong>{returnBiz.name}</strong></span>
            </Link>
          )}

          {/* Le type retenu, rappelé juste au-dessus des résultats : le même
              chiffre que la liste, et la croix qui le rend sans toucher au
              pays, à la région ni à la génération. */}
          {((mode === 'entreprises' && trade) || (mode === 'auteurs' && genre)) && (
            <TypeReminder
              label={t(mode === 'auteurs' ? 'dir.genre' : 'dir.typeLab')}
              value={mode === 'auteurs'
                ? t(`genre.${genre}`)
                : spec ? t(`spec.${spec}`) : t(`tradePlural.${trade}`)}
              count={list.length}
              word={t(mode === 'auteurs' ? 'dir.authorsResults' : 'dir.results')}
              onClear={() => (mode === 'auteurs' ? setFilter('genre', '') : pickType(spec ? trade : '', ''))}
              othersCount={mode === 'auteurs' ? otherGenreCount : otherTradeCount}
              othersText={othersLine(
                t,
                mode === 'auteurs' ? 'genres' : 'trades',
                mode === 'auteurs' ? otherGenreCount : otherTradeCount,
                othersWhere(wilaya, pays),
              )}
              onOthers={() => (mode === 'auteurs' ? setFilter('genre', '') : pickType('', ''))}
            />
          )}

          {/* La région lue, rappelée comme sur les trois autres tableaux, avec
              la part du pays qu'elle représente et la porte du pays entier :
              les quatre listes se lisent d'un seul tenant. */}
          {wilaya && (mode === 'auteurs' || view === 'list') && (
            <RegionReminder
              label={motDivision(pays, lang)}
              value={nomRegion(wilaya, lang)}
              count={list.length}
              word={t(
                mode === 'auteurs'
                  ? (list.length === 1 ? 'dir.authorResultOne' : 'dir.authorsResults')
                  : (list.length === 1 ? 'dir.resultOne' : 'dir.results'),
              )}
              sharePercent={countryCount ? (list.length / countryCount) * 100 : undefined}
              total={countryCount}
              onClear={clearRegion}
              onAllCountry={clearRegion}
            />
          )}

          <div className="dir-meta" id="board-results" tabIndex={-1} aria-live="polite">
            <span className="dir-count">
              {mode === 'entreprises' && view === 'map' ? (
                <><strong>{bizList.length}</strong> {bizList.length === 1 ? t('dir.resultOne') : t('dir.results')}</>
              ) : (
                <>
                  {shownCount < list.length ? (
                    <><strong>{shownCount}</strong> {t('dir.of')} <strong>{list.length}</strong></>
                  ) : (
                    <strong>{list.length}</strong>
                  )}{' '}
                  {list.length === 1
                    ? t(mode === 'auteurs' ? 'dir.authorResultOne' : 'dir.resultOne')
                    : t(mode === 'auteurs' ? 'dir.authorsResults' : 'dir.results')}
                </>
              )}
              {mode === 'entreprises' && radius ? ` · ${radius} km` : ''}
              {mode === 'entreprises' && month ? ` · ${monthLong(month, locale)}` : ''}
              {openLabel && (
                <>
                  {` · ${t(mode === 'auteurs' ? 'gen.pubLabel' : 'dir.openLabel')} ${openLabel}`}{' '}
                  <button
                    type="button"
                    className="dir-week-chip"
                    title={t('gen.clearHint')}
                    onClick={() => setFilter('open', '')}
                  >
                    <i className="ri-close-circle-line" aria-hidden="true"></i>
                    {t('gen.clear')}
                  </button>
                </>
              )}
              {mode === 'entreprises' && (weekCount > 0 || onlyWeek) && (
                <>
                  {' '}
                  <button
                    type="button"
                    className={`dir-week-chip${onlyWeek ? ' is-on' : ''}`}
                    aria-pressed={onlyWeek}
                    title={t('dir.weekHint')}
                    onClick={toggleWeek}
                  >
                    <i className={onlyWeek ? 'ri-checkbox-circle-line' : 'ri-flashlight-line'} aria-hidden="true"></i>
                    +{weekCount} {t('dir.weekShort')}
                  </button>
                </>
              )}
            </span>
            <div className="dir-meta-right">
              <span className="dir-trust-line">
                {mode === 'auteurs'
                  ? <><i className="ri-bookmark-line" aria-hidden="true"></i>{t('dir.compareHint')}</>
                  : <><i className="ri-shield-check-line" aria-hidden="true"></i>{t('dir.trust')}</>}
              </span>
              <ShareView />
              <MyDossiers />
              <ExportMenu
                mode={mode}
                biz={bizList}
                people={authorList}
                pays={pays}
                wilaya={wilaya}
                radius={mode === 'entreprises' ? radius : null}
                openYear={openLabel}
                sortLabel={t(mode === 'auteurs' ? AUTHOR_SORT_LABEL[auteurSort] : SORT_LABEL[effectiveSort])}
              />
            </div>
          </div>









          {mode === 'entreprises' && view === 'list' && (
            <PremiumDirectory
              country={pays}
              region={wilaya}
              trade={trade}
              query={q}
              onCountChange={setPublicBusinessCount}
            />
          )}

          {list.length === 0
          && !(mode === 'entreprises' && view === 'list' && publicBusinessCount > 0) ? (
            <div className={`dir-empty${facEmpty ? ' dir-empty--fac' : ''}`}>
              <i className={facEmpty ? 'ri-scissors-cut-line' : 'ri-file-search-line'} aria-hidden="true"></i>
              {facEmpty ? (
                <>
                  {/* The perimeter that gave nothing, named: the trade kept and
                      the place searched, written in the language being read. */}
                  <p className="dir-empty-title">{facEmptyTitle(lang, t, wilaya, pays)}</p>
                  <p className="dir-empty-hint">{t('dir.facEmptyHint')}</p>
                  <div className="dir-empty-acts">
                    {wilaya && (
                      <button
                        type="button"
                        className="cta cta-ghost"
                        title={t('dir.facEmptyRegionHint')}
                        onClick={clearRegion}
                      >
                        <i className="ri-map-pin-line" aria-hidden="true"></i>
                        {t('dir.facEmptyRegion')}
                      </button>
                    )}
                    <button type="button" className="cta" onClick={resetAll}>
                      {t('dir.facEmptyReset')}{' '}
                      <i className="ri-restart-line" aria-hidden="true"></i>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    {emptyPlace || (mode === 'auteurs'
                      ? t('dir.authorsEmpty')
                      : pays && pays !== 'DZ'
                        ? t('pays.empty')
                        : onlyInsti
                          ? t('dir.instiEmpty')
                          : onlyWeek
                            ? t('dir.weekEmpty')
                            : onlyNew
                              ? t('dir.freshEmpty')
                              : radius
                                ? t('radius.empty')
                                : t('dir.empty'))}
                  </p>
                  <div className="dir-empty-acts">
                    {wilaya && (
                      <button
                        type="button"
                        className="cta cta-ghost"
                        title={t('board.widenRegionHint')}
                        onClick={clearRegion}
                      >
                        <i className="ri-map-pin-line" aria-hidden="true"></i>
                        {t('board.widenRegion')}
                      </button>
                    )}
                  <button type="button" className="cta" onClick={resetAll}>
                    {t('dir.reset')}{' '}
                    <i className="ri-restart-line" aria-hidden="true"></i>
                  </button>
                  </div>
                </>
              )}
            </div>
          ) : mode === 'entreprises' && view === 'map' ? (
            <>
            <div className="map-wrap">
              <DirectoryMap pins={pins} activeId={activeBiz?.id ?? null} onSelect={setActivePin} framePays={framePays} />
              <div className="map-overlay">
                <span className="map-count"><strong>{pins.length}</strong> {t('dir.mapCount')}</span>
                {pins.some((pin) => pin.week) && (
                  <span className="map-week-note">
                    <i className="ri-flashlight-line" aria-hidden="true"></i>{t('dir.mapWeek')}
                  </span>
                )}
                <span className="map-hint"><i className="ri-cursor-line" aria-hidden="true"></i>{t('dir.mapHint')}</span>
              </div>
              <div className="map-side">
                <CountryMapAreas pays={pays} trade={trade} />
                <PaysTally
                  className="is-map"
                  counts={tally}
                  total={tallyTotal}
                  active={pays}
                  onPick={(code) => setFilter('pays', code)}
                />
                <MapLegend items={wilayaCounts} total={bizList.length} active={wilaya} pays={pays} onPick={(w) => setFilter('wilaya', w)} />
              </div>
              {activeBiz && (
                <Link to={`/entreprise/${activeBiz.id}`} className="map-card">
                  <img src={activeBiz.photos[0]} alt={activeBiz.name} title={`${activeBiz.name} ${nomRegion(activeBiz.wilaya, lang)}`} width={1200} height={900} />
                  <div>
                    <span className="stamp">{t(`trade.${activeBiz.trade}`)}</span>
                    <h3>{activeBiz.name}</h3>
                    <p><i className="ri-map-pin-line" aria-hidden="true"></i>{nomCommune(activeBiz.commune, lang)} · {nomRegion(activeBiz.wilaya, lang)}</p>
                  </div>
                  <i className="ri-arrow-right-line map-card-arrow" aria-hidden="true"></i>
                </Link>
              )}
            </div>
            <CountryMaps
              pins={pins}
              depots={depotsPays}
              active={pays}
              activeRegion={wilaya}
              trade={trade}
              onPick={(code) => {
                setFilter('pays', code);
                setActivePin(null);
              }}
              onPickRegion={(code, region) => {
                /* The country and its region land together, and a second click
                   on the same counter hands the region back to the country. */
                setRegion(region, code);
                setActivePin(null);
              }}
            />

            {/* Sous la carte du monde, ses huit familles : chaque porte ouvre
                la page du type, comptée sur le pays que la carte lit — son
                meilleur atelier dans ce pays au survol —, sans repasser par
                la barre de filtres. */}
            <WorldFamiliesBand active={trade} pays={pays} />
            </>
          ) : mode === 'auteurs' ? (
            authorBlocks.length > 0 ? (
              <div className="dir-genblocks">
                {authorBlocks.map((block, b) => (
                  <section className="dir-genblock-wrap" key={block.decade} aria-label={decadeLabel(block.decade)}>
                    <GenerationBlock
                      label={t('gen.pubLabel')}
                      decade={decadeLabel(block.decade)}
                      count={decadeCounts.get(block.decade) ?? block.rows.length}
                      word={t('gtally.profiles')}
                      position={b + 1}
                      total={authorBlocks.length}
                    />
                    <div className="biz-grid">
                      {block.rows.map((item, i) => <AuthorCard key={item.id} item={item} index={i} decades={openDecades} />)}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="biz-grid">
                {visiblePeople.map((item, i) => <AuthorCard key={item.id} item={item} index={i} decades={openDecades} />)}
              </div>
            )
          ) : bizBlocks.length > 0 ? (
            <div className="dir-genblocks">
              {bizBlocks.map((block, b) => (
                <section className="dir-genblock-wrap" key={block.decade} aria-label={decadeLabel(block.decade)}>
                  <GenerationBlock
                    label={t('dir.openLabel')}
                    decade={decadeLabel(block.decade)}
                    count={decadeCounts.get(block.decade) ?? block.rows.length}
                    word={t('gtally.files')}
                    position={b + 1}
                    total={bizBlocks.length}
                  />
                  <div className="biz-grid">
                    {block.rows.map((item, i) => (
                      <BizCard key={item.id} item={item} index={i} distanceKm={distances.get(item.id)} decades={openDecades} focusSpec={spec} boardTrade={trade} boardRegion={wilaya} boardPays={pays} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="biz-grid">
              {visibleBiz.map((item, i) => (
                <BizCard key={item.id} item={item} index={i} distanceKm={distances.get(item.id)} decades={openDecades} focusSpec={spec} boardTrade={trade} boardRegion={wilaya} boardPays={pays} />
              ))}
            </div>
          )}

          {(remaining > 0 || expanded) && !(mode === 'entreprises' && view === 'map') && (
            <div className="board-more">
              <div className="board-more-actions">
                {remaining > 0 && (
                  <button type="button" className="board-more-btn" onClick={showMore}>
                    <i className="ri-add-line" aria-hidden="true"></i>
                    {t('dir.loadMore')}
                    <span className="board-more-chip">+{remaining}</span>
                  </button>
                )}
                {remaining > 0 && (
                  <button type="button" className="board-more-all" onClick={showAll}>
                    <i className="ri-expand-vertical-line" aria-hidden="true"></i>
                    {t('dir.showAll')}
                  </button>
                )}
                {expanded && (
                  <button type="button" className="board-more-collapse" onClick={collapse}>
                    <i className="ri-collapse-vertical-line" aria-hidden="true"></i>
                    {t('dir.collapse')}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="dir-map-strip">
            <span><i className="ri-map-pin-2-line" aria-hidden="true"></i>{regionSpread} {motDivision(pays, lang, 'plur')}</span>
            <span><i className="ri-community-line" aria-hidden="true"></i>{entreprises.length} {t('dir.results')}</span>
            <span><i className="ri-quill-pen-line" aria-hidden="true"></i>{auteurs.length} {t('dir.authorsResults')}</span>
            {mode === 'entreprises' && view === 'list' && (
              <button type="button" className="dir-map-strip-cta" onClick={() => switchView('map')}>
                {t('dir.map')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </button>
            )}
          </div>

          <div className="dir-quote" data-reveal>
            <div>
              <h2>{t('dir.quoteTitle')}</h2>
              <p>{t('dir.quoteText')}</p>
            </div>
            <Link to="/demande-b2b" className="cta">{t('dir.quoteCta')} <i className="ri-arrow-right-line" aria-hidden="true"></i></Link>
          </div>
        </section>
      </main>
      <LatestBoard />
      <CompareTray kind={mode} />
      <Footer />
    </>
  );
}