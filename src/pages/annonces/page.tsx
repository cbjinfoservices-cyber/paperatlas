import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import BoardShare from '@/components/feature/BoardShare';
import CsvExportButton from '@/components/feature/CsvExportButton';
import NewcomerStrip from '@/components/feature/NewcomerStrip';
import PaysTally from '@/components/feature/PaysTally';
import MarchesChips from '@/components/feature/MarchesChips';
import BoardSlimBar from '@/components/feature/BoardSlimBar';
import BoardCountLine from '@/components/feature/BoardCountLine';
import RadiusChips, { RADIUS_STEPS } from '@/components/feature/RadiusChips';
import { isWithinDays } from '@/lib/freshness';
import { useLang } from '@/i18n/LangProvider';
import { localize } from '@/i18n/localize';
import { nomDemoCherchable } from '@/lib/nomsDemo';
import { paysArabes, paysDe, tallyPays } from '@/lib/pays';
import { motDivision } from '@/lib/division';
import RegionSelect from '@/components/feature/RegionSelect';
import { useAuth } from '@/auth/AuthProvider';
import { useGeo, haversineKm } from '@/hooks/useGeo';
import { driveMinutes } from '@/lib/trip';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { annonces, annonceCats, type AnnonceCat } from '@/mocks/annonces';
import { usePublishedListings } from '@/hooks/useListings';
import { toAnnonce } from '@/lib/listings';
import AnnonceCard, { CAT_KEY } from './components/AnnonceCard';
import LetterIndex from '@/components/feature/LetterIndex';
import { buildLetterIndex, readLetter } from '@/lib/letterIndex';
import TypeReminder from '@/components/feature/TypeReminder';
import RegionReminder from '@/components/feature/RegionReminder';
import WorldRecall from '@/components/feature/WorldRecall';
import PoseRestante from '@/components/feature/PoseRestante';
import { nomRegion } from '@/lib/regionLabels';
import { othersLine, othersWhere } from '@/lib/typeOthers';
import { readBoardType, saveBoardType } from '@/lib/boardType';
import { emptyPlaceLine } from '@/lib/emptyPlace';
import { readBoardSort, saveBoardSort } from '@/lib/boardSortMemory';
import { readBoardRadius, saveBoardRadius } from '@/lib/boardRadiusMemory';
import { readBoardPays, saveBoardPays } from '@/lib/boardPaysMemory';
import { readBoardRegion, saveBoardRegion } from '@/lib/boardRegionMemory';
import { buildAnnoncesCsv, downloadAnnoncesCsv } from './components/annoncesCsv';

const FILTER_KEYS = ['q', 'cat', 'pays', 'wilaya', 'sort', 'rayon', 'via', 'lettre'] as const;

/** Nine ads per batch: one clean row of three, nothing dumped at once. */
const PAGE_SIZE = 9;

export default function Annonces() {
  useSeo({ page: 'annonces', path: '/annonces' });
  const { t, lang } = useLang();
  const { session } = useAuth();
  /* La position du visiteur : elle ordonne le tableau par temps de trajet
     quand il le demande, et ne se lit jamais sans son accord. */
  const geo = useGeo();
  useReveal();
  useScrollRestore('/annonces');

  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  /* L'annonce que les flèches du clavier ont mise en avant : -1 tant qu'aucune
     ne l'est, et la frappe suivante efface ce choix. */
  const [actif, setActif] = useState(-1);
  const gridRef = useRef<HTMLDivElement>(null);
  /* La carte que la lettre visait : rendue après le clic, elle se laisse
     rejoindre. */
  const letterJump = useRef<number | null>(null);
  const q = params.get('q') ?? '';
  const rawCat = params.get('cat') ?? '';
  const cat: AnnonceCat | '' = (annonceCats as string[]).includes(rawCat) ? (rawCat as AnnonceCat) : '';
  const wilaya = params.get('wilaya') ?? '';
  /* The country the visitor reads from: every ad without one is Algerian. */
  const pays = params.get('pays') ?? '';
  /* L'ordre de lecture : par rubriques (l'ordre du dépôt), par pays, ou par
     temps de trajet depuis la position du visiteur. */
  const sortMode = params.get('sort') ?? '';
  const byPays = sortMode === 'pays';
  const byTrip = sortMode === 'trip';
  /* Le rangement alphabétique : il ouvre l'index des lettres sous les cartes. */
  const byName = sortMode === 'name';
  /* La lettre d'où l'on vient : elle vit dans l'adresse, pour que le retour
     d'une fiche rende le tableau au même point. */
  const picked = readLetter(params.get('lettre'));
  /* Le rayon lu : une des trois étapes, ou le tableau entier. */
  const rawRayon = Number(params.get('rayon'));
  const rayon = (RADIUS_STEPS as readonly number[]).includes(rawRayon) ? rawRayon : 0;
  /* La porte franchie depuis la page Arabe World laisse sa trace dans
     l'adresse : le tableau dit une fois d'où l'on vient. */
  const viaWorld = params.get('via') === 'world';

  /* Validated deposits from the backend come first, then the reference stock. */
  const { rows, loading, error, reload } = usePublishedListings('annonce');
  const all = useMemo(() => [...rows.map(toAnnonce), ...annonces], [rows]);

  /* La rubrique choisie reste sur l'appareil, comme le tri et le rayon de
     l'annuaire : le tableau se rouvre là où il a été laissé. */
  const typeRestored = useRef(false);
  const typeHydrated = useRef(false);

  useEffect(() => {
    if (typeRestored.current) return;
    typeRestored.current = true;
    /* Une adresse explicite ou partagée l'emporte toujours sur la mémoire —
       sauf la trace du passage depuis Arabe World, qui n'est pas un filtre. */
    const explicit = Array.from(params.keys()).some((key) => key !== 'shown' && key !== 'lang' && key !== 'via');
    if (explicit) return;
    const saved = readBoardType('annonces');
    if (!saved) return;
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('cat', saved);
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Le premier passage ne compte pas : il lirait la rubrique avant que la
     mémoire ne soit rejouée, et l'effacerait. */
  useEffect(() => {
    if (!typeRestored.current) return;
    if (!typeHydrated.current) {
      typeHydrated.current = true;
      return;
    }
    saveBoardType('annonces', cat);
  }, [cat]);

  /* L'ordre de lecture — rubriques, ou pays — est retenu sur l'appareil
     comme la rubrique lue : le tableau se rouvre dans l'ordre où il a été
     laissé. Une adresse explicite l'emporte toujours sur le souvenir. */
  const sortRestored = useRef(false);

  useEffect(() => {
    if (sortRestored.current) return;
    sortRestored.current = true;
    if (params.has('sort')) {
      saveBoardSort('annonces', params.get('sort') === 'pays' || params.get('sort') === 'trip'
        ? (params.get('sort') as 'pays' | 'trip')
        : 'rubrique');
      return;
    }
    const saved = readBoardSort('annonces');
    if (saved !== 'pays' && saved !== 'trip' && saved !== 'name') return;
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('sort', saved);
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Le rayon retenu — « moins de 100 km » — reste sur l'appareil comme le
     tri et la rubrique : le tableau se rouvre au même périmètre, sans qu'on
     ait à le reposer. Une adresse explicite (`?rayon=…`) l'emporte toujours
     sur le souvenir. */
  const radiusRestored = useRef(false);
  const radiusHydrated = useRef(false);

  useEffect(() => {
    if (radiusRestored.current) return;
    radiusRestored.current = true;
    const raw = params.get('rayon');
    if (raw) {
      saveBoardRadius('annonces', Number(raw));
      return;
    }
    const saved = readBoardRadius('annonces');
    if (!saved) return;
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('rayon', String(saved));
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Le premier passage ne compte pas : il lirait le rayon avant que la
     mémoire ne soit rejouée, et l'effacerait. */
  useEffect(() => {
    if (!radiusHydrated.current) {
      radiusHydrated.current = true;
      return;
    }
    saveBoardRadius('annonces', rayon);
  }, [rayon]);

  /* Le pays — et la région qu'il tenait — choisis dans le menu du tableau
     restent sur l'appareil, comme la rubrique : on quitte les annonces
     d'Oran, on revient, et le tableau se rouvre sur cette région au lieu de
     rendre le monde arabe entier. Une adresse explicite l'emporte toujours
     sur le souvenir. */
  const paysRestored = useRef(false);
  const paysHydrated = useRef(false);

  useEffect(() => {
    if (paysRestored.current) return;
    paysRestored.current = true;
    const explicit = Array.from(params.keys()).some((key) => key !== 'shown' && key !== 'lang' && key !== 'via');
    if (explicit) return;
    const saved = readBoardPays('annonces');
    if (!saved) return;
    /* La région ne revient que sous le pays qu'elle habite : jamais seule,
       jamais celle d'un homonyme. */
    const savedRegion = readBoardRegion('annonces', saved);
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('pays', saved);
      if (savedRegion) next.set('wilaya', savedRegion);
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Le premier passage ne compte pas : il lirait le pays avant que la mémoire
     ne soit rejouée, et l'effacerait. */
  useEffect(() => {
    if (!paysRestored.current) return;
    if (!paysHydrated.current) {
      paysHydrated.current = true;
      return;
    }
    saveBoardPays('annonces', pays);
  }, [pays]);

  /* La région retenue suit la même règle que le pays : le premier passage ne
     compte pas — il lirait la région avant que la mémoire ne soit rejouée et
     l'effacerait —, puis chaque changement s'inscrit. Rendre le pays entier
     efface la région, comme la remise à zéro. */
  const regionHydrated = useRef(false);

  useEffect(() => {
    if (!regionHydrated.current) {
      regionHydrated.current = true;
      return;
    }
    saveBoardRegion('annonces', pays, wilaya);
  }, [pays, wilaya]);

  /* The region field names the division the way the chosen country does:
     wilaya, governorate, emirate, municipality or region. */
  const regionLabel = motDivision(pays, lang);

  /* Le pays entier sous la même recherche et la même rubrique, région
     comprise : c'est le dénominateur de la part que la région tient, et ce
     que rend la porte « Tout ce pays » du rappel. */
  const scopeList = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((a) => {
      if (cat && a.cat !== cat) return false;
      if (pays && paysDe(a) !== pays) return false;
      if (!needle) return true;
      const hay = [
        a.title.fr, a.title.ar, a.title.en,
        a.body.fr, a.body.ar, a.body.en,
        a.seller, a.wilaya, a.commune, a.price,
        nomDemoCherchable(a.seller),
      ].join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [all, q, cat, pays]);

  const countryCount = scopeList.length;

  /* Les lignes du périmètre, avant le rayon : c'est ce que chaque pastille
     de rayon compte, et le dénominateur de la pastille « Tout le tableau ». */
  const scoped = useMemo(
    () => (wilaya ? scopeList.filter((a) => a.wilaya === wilaya) : scopeList),
    [scopeList, wilaya],
  );

  /* La distance de chaque ligne lue, mesurée une seule fois : elle ordonne le
     tableau, elle compte les rayons, et elle s'écrit sur les cartes. */
  const kmOf = useMemo(() => {
    const map = new Map<string, number>();
    if (!geo.point) return map;
    const from = geo.point;
    scoped.forEach((a) => {
      if (a.lat === undefined || a.lng === undefined) return;
      map.set(a.id, haversineKm(from, { lat: a.lat, lng: a.lng }));
    });
    return map;
  }, [scoped, geo.point]);

  /** Ce que chaque rayon laisserait du périmètre déjà filtré. */
  const radiusCounts = useMemo(() => {
    const out: Record<number, number> = {};
    RADIUS_STEPS.forEach((step) => {
      out[step] = geo.point
        ? scoped.filter((a) => {
          const km = kmOf.get(a.id);
          return km !== undefined && km <= step;
        }).length
        : 0;
    });
    return out;
  }, [scoped, kmOf, geo.point]);

  /* Le rayon resserre la lecture ; sans position connue, il ne retire rien. */
  const inRadius = useMemo(() => {
    if (!rayon || !geo.point) return scoped;
    return scoped.filter((a) => {
      const km = kmOf.get(a.id);
      return km !== undefined && km <= rayon;
    });
  }, [scoped, rayon, kmOf, geo.point]);

  const list = useMemo(() => {
    if (byTrip && geo.point) {
      /* La marchandise la plus proche en tête ; une annonce sans point connu
         reste en fin de liste plutôt que de disparaître du tableau. */
      return [...inRadius].sort(
        (a, b) => (kmOf.get(a.id) ?? Number.POSITIVE_INFINITY) - (kmOf.get(b.id) ?? Number.POSITIVE_INFINITY),
      );
    }
    if (byName) {
      /* L'ordre alphabétique du titre lu : c'est lui que l'index des lettres
         suit, lettre par lettre. */
      return [...inRadius].sort(
        (a, b) => localize(a.title, lang).localeCompare(localize(b.title, lang), 'fr'),
      );
    }
    if (!byPays) return inRadius;
    /* Country order of the select, then the order they already had inside
       each country: the board reads as one block per country. */
    const rank = new Map(paysArabes.map((p, i) => [p.code, i]));
    return [...inRadius].sort((a, b) => (rank.get(paysDe(a)) ?? 999) - (rank.get(paysDe(b)) ?? 999));
  }, [inRadius, byPays, byTrip, byName, lang, geo.point, kmOf]);

  /** Le trajet de chaque annonce lue : dès que la position est connue, la
      carte dit la distance et la durée, pas seulement l'ordre du tableau. */
  const tripOf = useMemo(() => {
    const map = new Map<string, { km: number; minutes: number }>();
    if (!geo.point) return map;
    list.forEach((a) => {
      const km = kmOf.get(a.id);
      if (km === undefined) return;
      map.set(a.id, { km, minutes: driveMinutes(km) });
    });
    return map;
  }, [geo.point, kmOf, list]);

  /**
   * The country counter reads the search and the rubric, never the country
   * filter itself: picking a country must not erase the map it was picked from.
   */
  const tally = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = all.filter((a) => {
      if (cat && a.cat !== cat) return false;
      if (!needle) return true;
      const hay = [
        a.title.fr, a.title.ar, a.title.en,
        a.body.fr, a.body.ar, a.body.en,
        a.seller, a.wilaya, a.commune, a.price,
        nomDemoCherchable(a.seller),
      ].join(' ').toLowerCase();
      return hay.includes(needle);
    });
    return tallyPays(base);
  }, [all, q, cat]);

  const tallyTotal = useMemo(
    () => tally.reduce((sum, row) => sum + row.count, 0),
    [tally],
  );

  /** Les dépôts du tableau lu, à la semaine et sur les trente derniers jours. */
  const weekCount = useMemo(() => list.filter((a) => isWithinDays(a.posted, 7)).length, [list]);
  const monthCount = useMemo(() => list.filter((a) => isWithinDays(a.posted)).length, [list]);
  /** Les dates de dépôt : le pouls des sept semaines suit le même périmètre. */
  const pulseDates = useMemo(() => list.map((a) => a.posted), [list]);
  /** L'étendue : combien de pays et de régions le tableau tient. */
  const paysTotal = useMemo(() => new Set(list.map((a) => paysDe(a))).size, [list]);
  const regionTotal = useMemo(() => new Set(list.map((a) => a.wilaya)).size, [list]);

  /** Les autres rubriques que ce périmètre tient encore : la ligne sous la
      pastille de type les annonce, et rouvre la recherche sur tout. */
  const otherCats = useMemo(() => {
    if (!cat) return 0;
    const needle = q.trim().toLowerCase();
    const found = new Set<string>();
    all.forEach((a) => {
      if (pays && paysDe(a) !== pays) return;
      if (wilaya && a.wilaya !== wilaya) return;
      if (needle) {
        const hay = [
          a.title.fr, a.title.ar, a.title.en,
          a.body.fr, a.body.ar, a.body.en,
          a.seller, a.wilaya, a.commune, a.price,
        nomDemoCherchable(a.seller),
        ].join(' ').toLowerCase();
        if (!hay.includes(needle)) return;
      }
      if (a.cat !== cat) found.add(a.cat);
    });
    return found.size;
  }, [all, cat, pays, wilaya, q]);

  /** The whole filter set sits in the URL, exactly like the directory. */
  const setFilter = (key: (typeof FILTER_KEYS)[number], value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    /* A region only makes sense inside its own country. */
    if (key === 'pays') next.delete('wilaya');
    /* A filter change rewinds the board to its first batch. */
    next.delete('shown');
    /* Et il efface le point d'une autre lecture : la lettre s'en va avec. */
    next.delete('lettre');
    setParams(next, { replace: true });
    /* L'ordre de lecture choisi ici est celui que le menu retiendra. */
    if (key === 'sort') {
      saveBoardSort(
        'annonces',
        value === 'pays' || value === 'trip' || value === 'name'
          ? (value as 'pays' | 'trip' | 'name')
          : 'rubrique',
      );
    }
    /* Le choix au clavier ne survit pas à un changement de recherche. */
    setActif(-1);
  };

  /* The region and the country it belongs to land together, so a place picked
     from the grouped list never filters on a namesake elsewhere. */
  const setRegion = (region: string, code: string) => {
    const next = new URLSearchParams(params);
    if (code) next.set('pays', code);
    else next.delete('pays');
    if (region) next.set('wilaya', region);
    else next.delete('wilaya');
    next.delete('shown');
    next.delete('lettre');
    setParams(next, { replace: true });
    setActif(-1);
  };

  const reset = () => {
    const next = new URLSearchParams(params);
    FILTER_KEYS.forEach((key) => next.delete(key));
    next.delete('shown');
    setParams(next, { replace: true });
    /* Le tri est du nombre des filtres rendus : la mémoire revient à l'ordre
       des rubriques, comme l'adresse. */
    saveBoardSort('annonces', 'rubrique');
    setActif(-1);
  };

  /**
   * Rend les seuls filtres rangés derrière la porte — le pays, la région,
   * l'ordre de lecture et le rayon — sans toucher à la rubrique lue : la
   * recherche et les pastilles de rubrique restent exactement où elles sont.
   */
  const clearFolded = () => {
    const next = new URLSearchParams(params);
    ['pays', 'wilaya', 'sort', 'rayon'].forEach((key) => next.delete(key));
    next.delete('shown');
    next.delete('lettre');
    setParams(next, { replace: true });
    saveBoardPays('annonces', '');
    saveBoardRegion('annonces', '', '');
    saveBoardRadius('annonces', 0);
    saveBoardSort('annonces', 'rubrique');
    setActif(-1);
  };

  /** Le rayon se choisit d'un geste ; sans position, le geste la demande. */
  const setRayon = (km: number) => {
    setFilter('rayon', km ? String(km) : '');
    if (km && !geo.point) geo.request();
  };

  /**
   * Élargir d'un cran : la région s'efface, le pays, la recherche et la
   * rubrique lue restent exactement où ils sont. C'est la sortie d'une page
   * vide qui nomme le lieu sans rendre tout le tableau.
   */
  const clearRegion = () => {
    const next = new URLSearchParams(params);
    next.delete('wilaya');
    next.delete('shown');
    next.delete('lettre');
    setParams(next, { replace: true });
    saveBoardRegion('annonces', pays, '');
    setActif(-1);
  };

  /** Effacer la position : le rayon qui s'appuyait dessus rend le tableau
      entier, et la mémoire du rayon avec lui. L'ordre par trajet, qui ne
      mesurait plus rien, revient à l'ordre du dépôt. */
  const forgetPosition = () => {
    geo.reset();
    const next = new URLSearchParams(params);
    next.delete('rayon');
    next.delete('shown');
    if (next.get('sort') === 'trip') next.delete('sort');
    setParams(next, { replace: true });
    saveBoardRadius('annonces', 0);
    if (byTrip) saveBoardSort('annonces', 'rubrique');
    setActif(-1);
  };

  /* « Autour de moi » : le même geste que dans l'annuaire — demander la
     position, ou la rendre. Dès qu'elle arrive, le tableau se lit par trajet,
     comme l'annuaire se lit par distance : le geste agit, il ne demande pas
     un second choix. */
  const nearAsked = useRef(false);
  const toggleNear = () => {
    if (geo.point) {
      forgetPosition();
      return;
    }
    nearAsked.current = true;
    geo.request();
  };

  useEffect(() => {
    if (!nearAsked.current) return;
    if (geo.status !== 'ready') return;
    nearAsked.current = false;
    if (byTrip) return;
    setFilter('sort', 'trip');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.status]);

  const dirty = Boolean(q || cat || pays || wilaya || byPays || byTrip || byName || rayon > 0);

  /** L'état vide nomme le lieu qu'on vient d'écarter — « aucune annonce à
      Oran » — au lieu d'une phrase générale qui ne dit pas où l'on a cherché.
      Sans lieu retenu, la phrase générale reste, et elle dit vrai. */
  const emptyPlace = emptyPlaceLine(lang, t, wilaya, pays, 'ann.emptyPlace');

  /* How many ads are on screen is part of the address, so coming back from an
     ad — or reloading — reopens the board exactly as it was left. */
  const rawShown = Number(params.get('shown'));
  const shown = Number.isFinite(rawShown) && rawShown >= PAGE_SIZE ? Math.floor(rawShown) : PAGE_SIZE;
  const visible = useMemo(() => list.slice(0, shown), [list, shown]);
  const remaining = Math.max(list.length - visible.length, 0);

  /** L'index des lettres du tableau rangé par nom : chaque lettre connaît la
      première annonce qu'elle ouvre et le nombre qu'elle tient. */
  const letterIndex = useMemo(
    () => (byName ? buildLetterIndex(list.map((a) => localize(a.title, lang))) : []),
    [list, byName, lang],
  );

  /** Sauter à une lettre : le point choisi s'écrit dans l'adresse, les cartes
      manquantes sont rendues, puis la grille rejoint la première d'entre elles. */
  const jumpToLetter = (letter: string, index: number) => {
    setActif(-1);
    const next = new URLSearchParams(params);
    next.set('lettre', letter);
    const target = Math.min(Math.max(index + 1, PAGE_SIZE), list.length);
    if (target > shown) {
      letterJump.current = index;
      next.set('shown', String(target));
      setParams(next, { replace: true });
      return;
    }
    setParams(next, { replace: true });
    gridRef.current?.children[index]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  /* La ligne mise en avant reste sous les yeux : la grille défile juste assez
     pour la garder dans le cadre, sans que la page ne saute. */
  useEffect(() => {
    if (actif < 0) return;
    gridRef.current?.querySelector('.is-keyed')?.scrollIntoView({ block: 'nearest' });
  }, [actif]);

  /* Une liste qui se resserre ne garde pas une ligne qui n'existe plus. */
  useEffect(() => {
    if (actif >= list.length) setActif(-1);
  }, [actif, list.length]);

  /* Les lignes sont rendues : celle que la lettre visait se laisse rejoindre. */
  useEffect(() => {
    const index = letterJump.current;
    if (index === null) return;
    letterJump.current = null;
    gridRef.current?.children[index]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [shown]);

  /* La lettre de l'adresse, au retour d'une fiche : le tableau se rouvre au même
     point, et non à son premier écran. */
  const letterRestored = useRef(false);
  useEffect(() => {
    if (letterRestored.current) return;
    if (byName === false || list.length === 0) return;
    if (!picked) {
      letterRestored.current = true;
      return;
    }
    const entry = letterIndex.find((row) => row.letter === picked);
    if (!entry) {
      letterRestored.current = true;
      return;
    }
    letterRestored.current = true;
    const target = Math.min(Math.max(entry.index + 1, PAGE_SIZE), list.length);
    if (target > shown) {
      letterJump.current = entry.index;
      const next = new URLSearchParams(params);
      next.set('shown', String(target));
      setParams(next, { replace: true });
      return;
    }
    gridRef.current?.children[entry.index]?.scrollIntoView({ block: 'center' });
  }, [byName, picked, letterIndex, list.length, shown, params, setParams]);

  /** Les flèches choisissent une annonce de la grille, Entrée ouvre sa fiche. */
  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (visible.length === 0) return;
      event.preventDefault();
      setActif((current) => {
        if (event.key === 'ArrowDown') return current < visible.length - 1 ? current + 1 : 0;
        return current > 0 ? current - 1 : visible.length - 1;
      });
      return;
    }
    if (event.key === 'Enter') {
      const chosen = visible[actif];
      if (!chosen) return;
      event.preventDefault();
      const keep = new URLSearchParams();
      /* La région et le pays suivent la fiche, comme le rayon et la lettre :
         elle peut ainsi rendre la liste telle qu'elle a été quittée. */
      ['sort', 'rayon', 'lettre', 'wilaya', 'pays'].forEach((key) => {
        const value = params.get(key);
        if (value) keep.set(key, value);
      });
      /* L'étendue du tableau suit la fiche : son texte copié l'annoncera. */
      if (list.length > 0) keep.set('n', String(list.length));
      const kept = keep.toString();
      navigate(`/annonces/${chosen.id}${kept ? `?${kept}` : ''}`);
      return;
    }
    if (event.key === 'Escape') {
      setFilter('q', '');
    }
  };

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

  /** Expanded board: fold it back to its first row, then land on the results line. */
  const expanded = shown > PAGE_SIZE;
  const collapse = () => {
    const next = new URLSearchParams(params);
    next.delete('shown');
    setParams(next, { replace: true });
    document.getElementById('board-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <a className="skip-link" href="#board-results">{t('dir.skipTo')}</a>
      <Nav variant="page" skip={false} />
      <main className="page-main">
        <section className="dir-hero">
          <p className="stamp">{t('ann.stamp')}</p>
          <h1 className="page-h1" dangerouslySetInnerHTML={{ __html: t('ann.title') }} />
          <p className="lede">{t('ann.sub')}</p>
          {/* Le repère de pose : le tableau des annonces dit son reste sur les
              seules clés `ann.` qu'il traverse. Un clic ouvre le relevé de
              parité déjà resserré sur ce fichier et cette famille. */}
          <PoseRestante
            fichier="dict.ts"
            prefixes={['ann.']}
            vers="/admin?section=suivi&parite=dict.ts&fam=ann."
          />
        </section>

        <section className="dir-body board-body">
          {/* D'où l'on arrive : la porte « Annonces » d'Arabe World ouvre ce
              tableau, et la ligne le dit une fois, avec le retour. */}
          {viaWorld && <WorldRecall subject={t('world.viaAnnonces')} />}

          {/* The same market row as the home page, but here a chip filters this
              very board on its country instead of opening the directory. */}
          <MarchesChips variant="board" board="annonces" active={pays} />

          {/* La rubrique ouvre le tableau, comme le métier ouvre l'annuaire ;
              la recherche, le chiffre des résultats, « Autour de moi » et une
              seule porte tiennent la rangée. Le pays, la région, l'ordre de
              lecture et le rayon se rangent derrière elle. */}
          <BoardSlimBar
            lead={(
              <div className="segmented board-cats" role="group" aria-label={t('ann.allCats')}>
                <button
                  type="button"
                  className={cat === '' ? 'is-on' : ''}
                  aria-pressed={cat === ''}
                  onClick={() => setFilter('cat', '')}
                >
                  <i className="ri-layout-grid-line" aria-hidden="true"></i>
                  {t('ann.allCats')}
                </button>
                {annonceCats.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={cat === c ? 'is-on' : ''}
                    aria-pressed={cat === c}
                    onClick={() => setFilter('cat', c)}
                  >
                    {t(CAT_KEY[c])}
                  </button>
                ))}
              </div>
            )}
            search={(
              <>
                <i className="ri-search-line" aria-hidden="true"></i>
                <input
                  type="search"
                  className="text-sm"
                  value={q}
                  onChange={(e) => setFilter('q', e.target.value)}
                  onKeyDown={onSearchKey}
                  placeholder={t('ann.search')}
                  aria-label={t('ann.search')}
                  autoComplete="off"
                />
              </>
            )}
            count={list.length}
            countWord={t(list.length === 1 ? 'ann.resultOne' : 'ann.results')}
            geoStatus={geo.status}
            distanceReady={Boolean(geo.point)}
            onNear={toggleNear}
            folded={[pays, wilaya, sortMode, rayon ? 'r' : ''].filter(Boolean).length}
            dirty={dirty}
            resetLabel={t('ann.reset')}
            onReset={reset}
            onClearFolded={clearFolded}
            panel={(
              <>
                <div className="filters-panel-grid">
                  <div className="fld">
                    <label htmlFor="ann-pays">{t('pays.label')}</label>
                    <select
                      id="ann-pays"
                      className="text-sm"
                      value={pays}
                      onChange={(e) => setFilter('pays', e.target.value)}
                    >
                      <option value="">{t('pays.all')}</option>
                      {paysArabes.map((p) => (
                        <option key={p.code} value={p.code}>{localize(p.nom, lang)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="fld">
                    <label htmlFor="ann-wilaya">{regionLabel}</label>
                    <RegionSelect
                      id="ann-wilaya"
                      className="text-sm"
                      pays={pays}
                      value={wilaya}
                      onChange={setRegion}
                      allLabel={motDivision(pays, lang, 'tous')}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="ann-sort">{t('sort.label')}</label>
                    <select
                      id="ann-sort"
                      className="text-sm"
                      value={byPays ? 'pays' : byTrip ? 'trip' : byName ? 'name' : ''}
                      onChange={(e) => setFilter('sort', e.target.value)}
                    >
                      <option value="">{t('sort.default')}</option>
                      <option value="name">{t('sort.name')}</option>
                      <option value="trip">{t('sort.trip')}</option>
                      <option value="pays">{t('sort.pays')}</option>
                    </select>
                  </div>
                </div>

                {/* Le rayon autour de la position : quatre pastilles, chacune
                    disant combien de lignes elle laisserait du périmètre lu. */}
                <RadiusChips
                  value={rayon}
                  counts={radiusCounts}
                  total={scoped.length}
                  located={Boolean(geo.point)}
                  asking={geo.status === 'asking'}
                  onPick={setRayon}
                  onLocate={() => geo.request()}
                  onForget={forgetPosition}
                />
              </>
            )}
          />

          {/* Le même geste que dans les recherches de nom : les flèches
              choisissent une annonce, Entrée l'ouvre, Échap efface. */}
          {q.trim().length > 0 && list.length > 0 && (
            <p className="board-keyhint">
              <i className="ri-arrow-up-down-line" aria-hidden="true"></i>
              {t('ann.searchArrows')}
            </p>
          )}

          {/* Le tri par trajet demande une position : la ligne l'annonce et
              propose le geste, au lieu d'ordonner le tableau dans le vide. */}
          {byTrip && (
            <p className="board-trip">
              <i className="ri-navigation-line" aria-hidden="true"></i>
              <span>{geo.point ? t('ann.tripNote') : t('ann.tripHint')}</span>
              {!geo.point && (
                <button
                  type="button"
                  className="board-trip-go"
                  onClick={() => geo.request()}
                  disabled={geo.status === 'asking' || geo.status === 'unsupported'}
                >
                  <i
                    className={geo.status === 'asking' ? 'ri-loader-4-line is-spin' : 'ri-focus-3-line'}
                    aria-hidden="true"
                  ></i>
                  <span className="whitespace-nowrap">
                    {geo.status === 'asking' ? t('near.asking') : t('pro.locate')}
                  </span>
                </button>
              )}
            </p>
          )}

          {error && (
            <div className="board-error">
              <i className="ri-plug-line" aria-hidden="true"></i>
              <p>{t('ann.loadError')}</p>
              <button type="button" className="ghost-btn" onClick={() => void reload()}>
                <i className="ri-refresh-line" aria-hidden="true"></i>
                {t('acct.mine.retry')}
              </button>
            </div>
          )}

          {/* La rubrique retenue, rappelée juste au-dessus des résultats,
              comme le métier dans l'annuaire : le même chiffre que la liste,
              la croix qui la rend et la ligne qui annonce les autres. */}
          {cat && (
            <TypeReminder
              label={t('ann.typeLab')}
              value={t(CAT_KEY[cat])}
              count={list.length}
              word={t(list.length === 1 ? 'ann.resultOne' : 'ann.results')}
              onClear={() => setFilter('cat', '')}
              othersCount={otherCats}
              othersText={othersLine(t, 'cats', otherCats, othersWhere(wilaya, pays, 'ann.othersWhereAll'))}
              onOthers={() => setFilter('cat', '')}
            />
          )}

          {/* La région lue, rappelée juste sous la rubrique, comme le type
              l'est déjà : le chiffre de la liste, sa croix qui rend la région
              sans rendre le pays, et le nom que le pays donne à sa division. */}
          {wilaya && (
            <RegionReminder
              label={regionLabel}
              value={nomRegion(wilaya, lang)}
              count={list.length}
              word={t(list.length === 1 ? 'ann.resultOne' : 'ann.results')}
              sharePercent={countryCount ? (list.length / countryCount) * 100 : undefined}
              total={countryCount}
              onClear={() => setRegion('', pays)}
              onAllCountry={() => setRegion('', pays)}
            />
          )}

          <div className="dir-meta" id="board-results" tabIndex={-1} aria-live="polite">
            <span className="dir-count">
              {visible.length < list.length ? (
                <><strong>{visible.length}</strong> {t('dir.of')} <strong>{list.length}</strong></>
              ) : (
                <strong>{list.length}</strong>
              )}{' '}
              {list.length === 1 ? t('ann.resultOne') : t('ann.results')}
              {loading && <i className="ri-loader-4-line is-spin board-spin" aria-hidden="true"></i>}
            </span>
            <div className="dir-meta-right">
              {session && (
                <Link to="/compte#my-listings" className="share-btn">
                  <i className="ri-file-list-3-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('acct.mine.shortLink')}</span>
                </Link>
              )}
              <BoardShare
                pays={pays}
                wilaya={wilaya}
                sort={sortMode}
                rayon={rayon ? String(rayon) : ''}
                lettre={picked}
              />
              <CsvExportButton
                total={list.length}
                run={() => downloadAnnoncesCsv(buildAnnoncesCsv({ ads: list, pays, wilaya, lang, t }))}
              />
              <Link to="/deposer?type=annonce" className="share-btn">
                <i className="ri-add-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ann.cta')}</span>
              </Link>
              <Link to="/emplois" className="share-btn">
                <i className="ri-briefcase-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('nav.emplois')}</span>
              </Link>
            </div>
          </div>

          <PaysTally
            counts={tally}
            total={tallyTotal}
            active={pays}
            region={wilaya}
            onPick={(code) => setFilter('pays', code === pays ? '' : code)}
            paysSort={{
              active: byPays,
              onToggle: () => setFilter('sort', byPays ? '' : 'pays'),
            }}
          />

          {/* La même ligne de compteurs que l'annuaire : les dépôts de la
              semaine, l'étendue du tableau et le périmètre, sur une bande. */}
          {list.length > 0 && (
            <BoardCountLine
              dates={pulseDates}
              weekCount={weekCount}
              monthCount={monthCount}
              paysTotal={paysTotal}
              regionTotal={regionTotal}
              division={motDivision(pays, lang, 'plur')}
              pays={pays}
              wilaya={wilaya}
              basePath="/annonces"
              weekLabel={t('board.weekDeposits')}
              monthLabel={t('board.monthDeposits')}
              calm={t('board.pulseCalm')}
              paysWord={t('board.paysWord')}
              paysSort={byPays}
              onPaysSort={() => setFilter('sort', byPays ? '' : 'pays')}
            />
          )}

          {list.length === 0 ? (
            <div className="dir-empty">
              <i className="ri-file-search-line" aria-hidden="true"></i>
              <p>{emptyPlace || (rayon ? t('radius.empty') : t('ann.empty'))}</p>
              {/* Un rayon posé garde sa phrase à côté du lieu nommé : la
                  sortie du rayon ne se perd pas sous le nom du lieu. */}
              {rayon && emptyPlace && <p className="dir-empty-hint">{t('radius.empty')}</p>}
              <div className="dir-empty-acts">
                {/* La même sortie que l'annuaire : la région s'efface, le
                    pays, la recherche et la rubrique restent. */}
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
                <button type="button" className="cta" onClick={reset}>
                  {t('ann.reset')} <i className="ri-restart-line" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="board-grid" ref={gridRef}>
                {visible.map((item, i) => (
                  <AnnonceCard
                    key={item.id}
                    item={item}
                    index={i}
                    active={i === actif}
                    trip={tripOf.get(item.id) ?? null}
                    boardRows={list.length}
                  />
                ))}
              </div>
              {/* Sous les cartes rangées par nom : l'index des lettres, comme
                  dans le vivier des candidats — la lettre choisie s'écrit dans
                  l'adresse et revient avec elle. */}
              {byName && (
                <LetterIndex
                  entries={letterIndex}
                  label={t('candlist.letters')}
                  countWord={list.length === 1 ? t('ann.resultOne') : t('ann.results')}
                  picked={picked}
                  onPick={jumpToLetter}
                />
              )}
              {(remaining > 0 || expanded) && (
                <div className="board-more">
                  <div className="board-more-actions">
                    {remaining > 0 && (
                      <button
                        type="button"
                        className="board-more-btn"
                        onClick={showMore}
                      >
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
            </>
          )}

          <div className="dir-quote" data-reveal>
            <div>
              <h2>{t('ann.ctaTitle')}</h2>
              <p>{t('ann.ctaText')}</p>
            </div>
            <Link to="/deposer?type=annonce" className="cta">
              {t('ann.cta')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </div>
        </section>
      </main>
      <NewcomerStrip />
      <Footer />
    </>
  );
}