import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { localize } from '@/i18n/localize';
import { paysArabes, paysDe, tallyPays } from '@/lib/pays';
import { motDivision } from '@/lib/division';
import RegionSelect from '@/components/feature/RegionSelect';
import RegionReminder from '@/components/feature/RegionReminder';
import { nomRegion } from '@/lib/regionLabels';
import { useAuth } from '@/auth/AuthProvider';
import { useReveal } from '@/hooks/useReveal';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { useGeo, haversineKm } from '@/hooks/useGeo';
import RadiusChips, { RADIUS_STEPS } from '@/components/feature/RadiusChips';
import { readBoardRadius, saveBoardRadius } from '@/lib/boardRadiusMemory';
import { readVivierSort, saveVivierSort } from '@/lib/vivierSortMemory';
import { pointOfRegion } from '@/lib/regionGeo';
import { driveMinutes } from '@/lib/trip';
import { supabase } from '@/lib/supabase';
import { isWithinDays } from '@/lib/freshness';
import { MEMBER_COLUMNS, type MemberCardRow } from '@/lib/messaging';
import MemberCard from '@/pages/candidats/components/MemberCard';
import StickyStack from '@/components/feature/StickyStack';
import BoardCountLine from '@/components/feature/BoardCountLine';
import CandWeekCounts from './components/CandWeekCounts';
import CopyLinkButton from '@/components/feature/CopyLinkButton';
import PoseRestante from '@/components/feature/PoseRestante';
import BoardShare from '@/components/feature/BoardShare';
import PaysTally from '@/components/feature/PaysTally';
import LetterIndex from '@/components/feature/LetterIndex';
import { buildLetterIndex, readLetter } from '@/lib/letterIndex';
import { emptyPlaceLine } from '@/lib/emptyPlace';
import RegionWalk from '@/pages/entreprise/components/RegionWalk';
import { emptyDoorKinds } from '@/lib/annuaireDoors';
import '@/pages/candidats/liste.css';

type State = 'loading' | 'gate' | 'ready' | 'error';

const FILTER_KEYS = ['q', 'pays', 'wilaya', 'metier', 'sort', 'fresh', 'rayon', 'lettre'] as const;

/** Five ways to walk the list: newest, oldest, A → Z, grouped by country, or
    by travel time from where the visitor stands. */
type SortMode = 'recent' | 'oldest' | 'name' | 'pays' | 'trip';

const SORT_MODES: SortMode[] = ['recent', 'oldest', 'name', 'pays', 'trip'];

const isSortMode = (value: string): value is SortMode =>
  (SORT_MODES as string[]).includes(value);

/** Which arrivals window is on: none, the week inside the month, or the month. */
type FreshMode = 'none' | 'week' | 'month';

const createdMs = (iso?: string | null) => {
  const time = iso ? new Date(iso).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
};

/** Nine profiles per batch: one clean row of three, nothing poured at once. */
const PAGE_SIZE = 9;

/**
 * The public list of members who registered as candidates. Member cards are
 * only readable by signed-in members, so the list shows a door instead of an
 * empty page to a visitor with no account.
 */
export default function CandidatsListe() {
  const { t, lang } = useLang();
  const { session, compte, loading: authLoading } = useAuth();
  /* La position du visiteur : elle mesure le rayon, et ne se lit jamais sans
     son accord. */
  const geo = useGeo();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  /* Le candidat que les flèches du clavier ont mis en avant : -1 tant qu'aucun
     ne l'est, et un changement de filtre efface ce choix. */
  const [actif, setActif] = useState(-1);
  /* La lettre d'où l'on vient : elle vit dans l'adresse, comme le rayon et
     l'ordre de lecture, pour que le retour d'une fiche rouvre la liste au même
     point — et non à son premier écran. */
  const picked = readLetter(params.get('lettre'));
  /* La carte à rejoindre une fois les lignes manquantes rendues : le clic sur
     une lettre charge d'abord ce qu'il faut, puis fait défiler. */
  const letterJump = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState<MemberCardRow[]>([]);
  const [state, setState] = useState<State>('loading');
  useReveal();

  /* The candidate door is for anyone who does not have a candidate account yet:
     a signed-out visitor, and a signed-in business account (a pro publishes
     listings; the candidate profile is a second, separate account). */
  const role = compte?.role ?? null;
  const showJoin = !authLoading && (!session || role === 'pro');
  useScrollRestore('/candidats');

  const load = useCallback(async () => {
    if (!session) {
      setMembers([]);
      setState(authLoading ? 'loading' : 'gate');
      return;
    }
    setState('loading');
    try {
      const { data, error } = await supabase
        .from('paperatlas_membres')
        .select(`${MEMBER_COLUMNS}, created_at`)
        .eq('role', 'candidat')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) throw error;
      setMembers((data ?? []) as MemberCardRow[]);
      setState('ready');
    } catch {
      setMembers([]);
      setState('error');
    }
  }, [session, authLoading]);

  useEffect(() => {
    void load();
  }, [load]);

  const q = params.get('q') ?? '';
  const wilaya = params.get('wilaya') ?? '';
  const metier = params.get('metier') ?? '';
  /* Le rayon lu : une des trois étapes, ou le vivier entier. */
  const rawRayon = Number(params.get('rayon'));
  const rayon = (RADIUS_STEPS as readonly number[]).includes(rawRayon) ? rawRayon : 0;
  /* The country the visitor reads from: a member without one is Algerian. */
  const pays = params.get('pays') ?? '';
  const rawSort = params.get('sort') ?? '';
  /* Walking a trade means looking at peers: seniority first, the people who
     have been around longest at the top — not the newest arrival. */
  const defaultSort: SortMode = metier ? 'oldest' : 'recent';
  const sort: SortMode = isSortMode(rawSort) ? rawSort : defaultSort;
  /* Two windows on the same pulse: the week inside the month. `fresh=1`
     remains the month so every existing link keeps its meaning. */
  const rawFresh = params.get('fresh') ?? '';
  const freshMode: FreshMode = rawFresh === 'week' ? 'week' : rawFresh === '1' ? 'month' : 'none';
  const onlyNew = freshMode !== 'none';

  /* The region field names the division the way the chosen country does. */
  const regionLabel = motDivision(pays, lang);

  const metiers = useMemo(
    () => Array.from(new Set(members.map((m) => m.metier).filter((m): m is string => Boolean(m))))
      .sort((a, b) => a.localeCompare(b, 'fr')),
    [members],
  );

  /* What the search, the wilaya and the trade keep — measured before the
     « this month » switch, so its counter never melts into its own list. */
  /* Le pays entier sous la même recherche et le même métier, région
     comprise : le dénominateur de la part que la région tient dans le vivier. */
  const countryMatched = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return members.filter((m) => {
      if (pays && paysDe(m) !== pays) return false;
      if (metier && m.metier !== metier) return false;
      if (!needle) return true;
      const hay = [m.nom, m.titre, m.metier, m.organisme, m.wilaya, m.bio]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [members, q, pays, metier]);

  const matched = useMemo(
    () => (wilaya ? countryMatched.filter((m) => m.wilaya === wilaya) : countryMatched),
    [countryMatched, wilaya],
  );

  /* Le vivier après la fenêtre d'arrivées : c'est ce que le rayon resserre,
     exactement comme les annonces et les emplois. */
  const scoped = useMemo(() => {
    if (freshMode === 'week') {
      return matched.filter((m) => Boolean(m.created_at) && isWithinDays(String(m.created_at), 7));
    }
    if (freshMode === 'month') {
      return matched.filter((m) => Boolean(m.created_at) && isWithinDays(String(m.created_at)));
    }
    return matched;
  }, [matched, freshMode]);

  /* Le rayon retenu reste sur l'appareil comme le tri et la rubrique des
     autres tableaux : le vivier se rouvre au même périmètre. */
  const radiusRestored = useRef(false);
  const radiusHydrated = useRef(false);

  useEffect(() => {
    if (radiusRestored.current) return;
    radiusRestored.current = true;
    const raw = params.get('rayon');
    if (raw) {
      saveBoardRadius('candidats', Number(raw));
      return;
    }
    const saved = readBoardRadius('candidats');
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
    saveBoardRadius('candidats', rayon);
  }, [rayon]);

  /* L'ordre de lecture du vivier reste sur l'appareil, comme celui des annonces
     et des emplois — « temps de trajet » compris. Une adresse qui dit l'ordre
     l'emporte et l'écrit à son tour ; une adresse muette ne l'efface pas. */
  const sortRestored = useRef(false);

  useEffect(() => {
    if (sortRestored.current) return;
    sortRestored.current = true;
    const raw = params.get('sort') ?? '';
    if (raw) {
      saveVivierSort(isSortMode(raw) ? raw : '');
      return;
    }
    const saved = readVivierSort();
    if (!saved) return;
    /* « plus récent » est déjà l'ordre d'ouverture du vivier entier : il ne
       s'écrit que si un métier, lui, ouvrirait sur l'ancienneté. */
    if (saved === 'recent' && !params.get('metier')) return;
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('sort', saved);
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* La distance de chaque profil, mesurée depuis le centre de sa région —
     elle compte les rayons et s'écrit sur les cartes. */
  const kmOf = useMemo(() => {
    const map = new Map<string, number>();
    if (!geo.point) return map;
    const from = geo.point;
    scoped.forEach((m) => {
      const point = pointOfRegion(m.wilaya, paysDe(m));
      if (!point) return;
      map.set(m.id, haversineKm(from, point));
    });
    return map;
  }, [scoped, geo.point]);

  /** Ce que chaque rayon laisserait du vivier déjà filtré. */
  const radiusCounts = useMemo(() => {
    const out: Record<number, number> = {};
    RADIUS_STEPS.forEach((step) => {
      out[step] = geo.point
        ? scoped.filter((m) => {
          const km = kmOf.get(m.id);
          return km !== undefined && km <= step;
        }).length
        : 0;
    });
    return out;
  }, [scoped, kmOf, geo.point]);

  /* Le rayon resserre la lecture ; sans position connue, il ne retire rien. */
  const inRadius = useMemo(() => {
    if (!rayon || !geo.point) return scoped;
    return scoped.filter((m) => {
      const km = kmOf.get(m.id);
      return km !== undefined && km <= rayon;
    });
  }, [scoped, rayon, kmOf, geo.point]);

  /** Ce que le vivier filtré tient à moins de 50 km : le premier cran du
      rayon, mesuré sur les profils que les autres filtres laissent — pour que
      le geste « resserrer » annonce ce qu'il garderait. */
  const near50 = useMemo(() => {
    if (!geo.point) return 0;
    return scoped.reduce((sum, m) => {
      const km = kmOf.get(m.id);
      return km !== undefined && km <= 50 ? sum + 1 : sum;
    }, 0);
  }, [scoped, kmOf, geo.point]);

  /** L'étage suivant : ce que le second cran du rayon ajouterait, mesuré sur
      les profils que les autres filtres laissent. Il se lit avant d'être
      appliqué, plutôt que de se découvrir après le clic. */
  const near100 = useMemo(() => {
    if (!geo.point) return 0;
    return scoped.reduce((sum, m) => {
      const km = kmOf.get(m.id);
      return km !== undefined && km > 50 && km <= 100 ? sum + 1 : sum;
    }, 0);
  }, [scoped, kmOf, geo.point]);

  /** Le troisième et dernier cran : ce qui reste au-delà de 100 km. Il ferme
      l'échelle — le proche, l'étage suivant, puis le reste — et dit ce qu'un
      rayon laisse hors de vue. */
  const far100 = useMemo(() => {
    if (!geo.point) return 0;
    return scoped.reduce((sum, m) => {
      const km = kmOf.get(m.id);
      return km !== undefined && km > 100 ? sum + 1 : sum;
    }, 0);
  }, [scoped, kmOf, geo.point]);

  /** Le vivier du pays entier, la fenêtre d'arrivées comprise — la même que
      celle que la liste applique, pour que le pourcentage ne mélange pas deux
      périodes. */
  const countryCount = useMemo(() => {
    if (freshMode === 'week') {
      return countryMatched.filter((m) => Boolean(m.created_at) && isWithinDays(String(m.created_at), 7)).length;
    }
    if (freshMode === 'month') {
      return countryMatched.filter((m) => Boolean(m.created_at) && isWithinDays(String(m.created_at))).length;
    }
    return countryMatched.length;
  }, [countryMatched, freshMode]);

  const list = useMemo(() => {
    if (sort === 'trip' && geo.point) {
      /* Le profil le plus proche en tête ; celui dont la région n'est pas
         située reste en fin de liste plutôt que de disparaître. */
      return [...inRadius].sort(
        (a, b) => (kmOf.get(a.id) ?? Number.POSITIVE_INFINITY) - (kmOf.get(b.id) ?? Number.POSITIVE_INFINITY),
      );
    }
    /* Sans position, le tri par trajet ne range rien : le vivier reprend
       l'ordre où il s'ouvre d'habitude. */
    const mode = sort === 'trip' ? defaultSort : sort;
    const rows = [...inRadius];
    if (mode === 'name') {
      rows.sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr'));
    } else if (mode === 'pays') {
      /* Grouped by country: the country order of the select, then the same
         freshness inside each group, so a country reads as one block. */
      const rank = new Map(paysArabes.map((p, i) => [p.code, i]));
      rows.sort((a, b) => {
        const gap = (rank.get(paysDe(a)) ?? 999) - (rank.get(paysDe(b)) ?? 999);
        return gap !== 0 ? gap : createdMs(b.created_at) - createdMs(a.created_at);
      });
    } else if (mode === 'oldest') {
      rows.sort((a, b) => createdMs(a.created_at) - createdMs(b.created_at));
    } else {
      rows.sort((a, b) => createdMs(b.created_at) - createdMs(a.created_at));
    }
    return rows;
  }, [inRadius, sort, defaultSort, geo.point, kmOf]);

  /** Combien de profils de la liste lue ont une porte vide : leur région ou
      leur métier n'ouvre plus aucune fiche dans l'annuaire. Le chiffre se pose
      à côté du jeton et suit la liste, rayon et fenêtre d'arrivées compris. */
  const lostBy = useMemo(() => {
    const out = { total: 0, region: 0, trade: 0 };
    list.forEach((m) => {
      const kinds = emptyDoorKinds({ metier: m.metier, wilaya: m.wilaya, pays: paysDe(m) });
      if (kinds.region) out.region += 1;
      if (kinds.trade) out.trade += 1;
      if (kinds.region || kinds.trade) out.total += 1;
    });
    return out;
  }, [list]);
  const lostDoors = lostBy.total;

  /** Le trajet de chaque profil lu : dès que la position est connue, la carte
      dit la distance et la durée, comme les annonces et les offres. */
  const tripOf = useMemo(() => {
    const map = new Map<string, { km: number; minutes: number }>();
    if (!geo.point) return map;
    list.forEach((m) => {
      const km = kmOf.get(m.id);
      if (km === undefined) return;
      map.set(m.id, { km, minutes: driveMinutes(km) });
    });
    return map;
  }, [geo.point, kmOf, list]);

  /** Filters live in the address, and a change rewinds the list to its first batch. */
  const setFilter = (key: (typeof FILTER_KEYS)[number], value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    /* A region only makes sense inside its own country. */
    if (key === 'pays') next.delete('wilaya');
    next.delete('shown');
    /* Une liste qui change ne garde pas le point d'une autre lecture. */
    next.delete('lettre');
    setParams(next, { replace: true });
    /* L'ordre de lecture choisi ici est celui que le menu retiendra. */
    if (key === 'sort') saveVivierSort(isSortMode(value) ? value : '');
    /* Le choix au clavier ne survit pas à un changement de recherche. */
    setActif(-1);
  };

  /** Le rayon se choisit d'un geste ; sans position, le geste la demande. */
  const setRayon = (km: number) => {
    setFilter('rayon', km ? String(km) : '');
    if (km && !geo.point) geo.request();
  };

  /** Effacer la position : le rayon qui s'appuyait dessus rend le vivier
      entier, et la mémoire du rayon avec lui. */
  const forgetPosition = () => {
    geo.reset();
    setFilter('rayon', '');
    saveBoardRadius('candidats', 0);
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

  /**
   * Élargir d'un cran : la région s'efface, le pays, la recherche et le métier
   * restent exactement où ils sont. C'est la sortie d'une page vide qui nomme
   * le lieu sans rendre tout le vivier — la même que dans l'annuaire, les
   * annonces et les emplois.
   */
  const clearRegion = () => {
    const next = new URLSearchParams(params);
    next.delete('wilaya');
    next.delete('shown');
    next.delete('lettre');
    setParams(next, { replace: true });
    setActif(-1);
  };

  /** Picking a trade enters a « same trade » walk: a « newest » sort would
     break the seniority order, so it is dropped unless A → Z was chosen. */
  const setMetier = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set('metier', value);
    else next.delete('metier');
    if (next.get('sort') === 'recent') next.delete('sort');
    next.delete('shown');
    next.delete('lettre');
    setParams(next, { replace: true });
    /* L'ordre qui s'ouvre alors (l'ancienneté dans un métier, le plus récent
       dans le vivier entier) est celui que la mémoire doit reprendre. */
    saveVivierSort(value ? 'oldest' : 'recent');
    setActif(-1);
  };

  /** One click shows the week, another the month, a third hands the whole
     pool back — each window is measured before it is applied. */
  const setFreshMode = (mode: FreshMode) => {
    const next = new URLSearchParams(params);
    if (freshMode === mode) next.delete('fresh');
    else if (mode === 'week') next.set('fresh', 'week');
    else if (mode === 'month') next.set('fresh', '1');
    else next.delete('fresh');
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
    /* La remise à zéro rend aussi le souvenir du tri et du rayon. */
    saveBoardRadius('candidats', 0);
    saveVivierSort('recent');
    setActif(-1);
  };

  const dirty = Boolean(q || wilaya || metier || pays || onlyNew || sort !== defaultSort || rayon > 0);

  /** L'état vide nomme le lieu qu'on vient d'écarter — « aucun profil à
      Oran » — comme les trois autres tableaux. Mais un lieu ne se nomme que
      s'il ne tient plus rien par lui-même : si une recherche, un métier, une
      fenêtre d'arrivées ou un rayon vident le vivier alors qu'Oran garde
      encore des profils, la phrase générale revient, parce que c'est elle qui
      dit vrai. */
  const placeHolds = useMemo(
    () => members.filter(
      (m) => (!wilaya || m.wilaya === wilaya) && (!pays || paysDe(m) === pays),
    ).length,
    [members, wilaya, pays],
  );
  const emptyPlace = placeHolds === 0
    ? emptyPlaceLine(lang, t, wilaya, pays, 'dir.emptyPlaceAuthor')
    : '';

  /* The two rhythms, counted on the profiles the other filters keep — so the
     numbers never simply repeat the size of the window they describe. */
  const arrivals = useMemo(() => {
    let week = 0;
    let month = 0;
    matched.forEach((m) => {
      if (!m.created_at) return;
      const iso = String(m.created_at);
      if (!isWithinDays(iso)) return;
      month += 1;
      if (isWithinDays(iso, 7)) week += 1;
    });
    return { week, month };
  }, [matched]);

  /** Les dates d'inscription du périmètre lu : le même pouls des sept semaines
      que l'annuaire, les annonces et les emplois — les quatre listes se lisent
      donc de la même façon. */
  const pulseDates = useMemo(
    () => matched
      .map((m) => (m.created_at ? String(m.created_at) : ''))
      .filter((iso) => iso.length > 0),
    [matched],
  );

  /** L'étendue du vivier lu : les pays et les régions que ces fiches couvrent,
      exactement comme la ligne de compteurs des trois autres tableaux. */
  const paysTotal = useMemo(() => new Set(list.map((m) => paysDe(m))).size, [list]);
  const regionTotal = useMemo(() => new Set(list.map((m) => m.wilaya)).size, [list]);

  /* How many profiles are on screen is part of the address, so coming back from
     a profile — or reloading — reopens the same view. */
  const rawShown = Number(params.get('shown'));
  const shown = Number.isFinite(rawShown) && rawShown >= PAGE_SIZE ? Math.floor(rawShown) : PAGE_SIZE;
  const visible = useMemo(() => list.slice(0, shown), [list, shown]);
  const remaining = Math.max(list.length - visible.length, 0);

  /** L'index des lettres de la liste, dans l'ordre où elles se présentent :
      chaque lettre connaît la première carte qu'elle ouvre et le nombre de
      profils qu'elle tient. Il ne se lit que dans l'ordre alphabétique. */
  const letterIndex = useMemo(
    () => (sort === 'name' ? buildLetterIndex(list.map((m) => m.nom)) : []),
    [list, sort],
  );

  /** Sauter à une lettre : le point choisi s'écrit dans l'adresse — il revient
      donc au retour d'une fiche —, les cartes manquantes sont rendues, puis la
      grille défile jusqu'à la première d'entre elles. */
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

  /* Les cartes sont rendues : celle que la lettre visait se laisse rejoindre. */
  useEffect(() => {
    const index = letterJump.current;
    if (index === null) return;
    letterJump.current = null;
    gridRef.current?.children[index]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [shown]);

  /* Un ordre qui n'est plus alphabétique ne garde pas de lettre : elle sort de
     l'adresse avec lui, pour qu'un lien ne promette pas un point perdu. */
  useEffect(() => {
    if (sort === 'name' || !params.get('lettre')) return;
    const next = new URLSearchParams(params);
    next.delete('lettre');
    setParams(next, { replace: true });
  }, [sort, params, setParams]);

  /* La lettre de l'adresse, au retour d'une fiche : la liste rend d'abord les
     cartes qui la portent, puis se pose sur la première d'entre elles. */
  const letterRestored = useRef(false);
  useEffect(() => {
    if (letterRestored.current) return;
    if (state !== 'ready' || sort !== 'name' || list.length === 0) return;
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
  }, [state, sort, picked, letterIndex, list.length, shown, params, setParams]);

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

  /* La carte mise en avant reste sous les yeux : la grille défile juste assez
     pour la garder dans le cadre, sans que la page ne saute. */
  useEffect(() => {
    if (actif < 0) return;
    gridRef.current?.querySelector('.is-keyed')?.scrollIntoView({ block: 'nearest' });
  }, [actif]);

  /* Une liste qui se resserre ne garde pas une ligne qui n'existe plus. */
  useEffect(() => {
    if (actif >= visible.length) setActif(-1);
  }, [actif, visible.length]);

  /** La fiche ouverte au clavier garde la vue d'où l'on vient, comme la carte
      elle-même : le profil peut rendre les mêmes filtres. */
  const ficheDe = (id: string) => {
    const keep = new URLSearchParams();
    ['metier', 'sort', 'fresh', 'rayon', 'lettre', 'pays', 'wilaya'].forEach((key) => {
      const value = params.get(key);
      if (value) keep.set(key, value);
    });
    /* L'étendue du vivier part avec la fiche, comme sur les cartes : le texte
       copié annonce le nombre de profils que la liste tient. */
    if (list.length > 0) keep.set('n', String(list.length));
    if (lostDoors > 0) keep.set('l', String(lostDoors));
    /* Sur quelles portes le compte s'appuie : la fiche le redit au survol, et
       pas seulement le chiffre. */
    if (lostBy.region > 0) keep.set('lr', String(lostBy.region));
    if (lostBy.trade > 0) keep.set('lt', String(lostBy.trade));
    const kept = keep.toString();
    return `/candidats/${id}${kept ? `?${kept}` : ''}`;
  };

  /** Les flèches choisissent un candidat de la grille, Entrée ouvre sa fiche. */
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
      navigate(ficheDe(chosen.id));
      return;
    }
    if (event.key === 'Escape') {
      setFilter('q', '');
    }
  };

  /** Expanded list: fold it back to its first row, then land on the results line. */
  const expanded = shown > PAGE_SIZE;
  const collapse = () => {
    const next = new URLSearchParams(params);
    next.delete('shown');
    setParams(next, { replace: true });
    document.getElementById('board-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /**
   * The country counter reads the search and the trade, never the country
   * filter itself: picking a country must not erase the map it was picked from.
   */
  const tallyBase = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const pool = members.filter((m) => {
      if (metier && m.metier !== metier) return false;
      if (!needle) return true;
      const hay = [m.nom, m.titre, m.metier, m.organisme, m.wilaya, m.bio]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(needle);
    });
    /* The counter follows the same arrivals window as the list it sits above. */
    if (freshMode === 'week') {
      return pool.filter((m) => Boolean(m.created_at) && isWithinDays(String(m.created_at), 7));
    }
    if (freshMode === 'month') {
      return pool.filter((m) => Boolean(m.created_at) && isWithinDays(String(m.created_at)));
    }
    return pool;
  }, [members, q, metier, freshMode]);

  const tally = useMemo(() => tallyPays(tallyBase), [tallyBase]);
  const tallyTotal = useMemo(() => tally.reduce((sum, row) => sum + row.count, 0), [tally]);

  return (
    <>
      <a className="skip-link" href="#board-results">{t('dir.skipTo')}</a>
      <Nav variant="page" skip={false} />
      <main className="page-main">
        <section className="dir-hero">
          <p className="stamp">{t('candlist.stamp')}</p>
          <h1 className="page-h1" dangerouslySetInnerHTML={{ __html: t('candlist.title') }} />
          <p className="lede">{t('candlist.sub')}</p>
          {showJoin && (
            <div className={`cand-join${role === 'pro' ? ' is-pro' : ''}`}>
              <Link to="/compte/inscription/candidat" className="cta">
                {t('candlist.joinCta')}
                <i className="ri-user-add-line" aria-hidden="true"></i>
              </Link>
              {role === 'pro' ? (
                <span className="cand-join-hint">
                  <i className="ri-information-line" aria-hidden="true"></i>
                  {t('candlist.joinProHint')}
                </span>
              ) : (
                <span className="cand-join-hint">{t('candlist.joinHint')}</span>
              )}
            </div>
          )}
          {/* Le repère de pose : le vivier dit son reste avant qu'on ouvre
              une fiche, sur ses propres clés. Un clic ouvre le relevé de
              parité déjà resserré sur ce fichier et cette famille, comme sur
              les annonces et les emplois. Il se tait une fois tout posé. */}
          <PoseRestante
            fichier="dict.candidats.ts"
            prefixes={['candlist.']}
            vers="/admin?section=suivi&parite=dict.candidats.ts&fam=candlist."
          />
        </section>

        {state === 'gate' ? (
          <section className="dir-body cand-gate">
            <div className="pro-card">
              <h2 className="pro-h">{t('candlist.gateTitle')}</h2>
              <p className="auth-note">{t('candlist.gateText')}</p>
              <div className="acct-actions">
                <Link to="/compte/connexion" className="cta">
                  {t('candlist.loginCta')}
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
              </div>
              <p className="cand-gate-note">
                <i className="ri-information-line" aria-hidden="true"></i>
                {t('candlist.gateJoinNote')}
              </p>
            </div>
          </section>
        ) : (
          <section className="dir-body board-body">
            <StickyStack>
            <div className="board-filters cand-filters">
              <div className="fld fld-inline">
                <i className="ri-search-line" aria-hidden="true"></i>
                <input
                  type="search"
                  className="text-sm"
                  value={q}
                  onChange={(e) => setFilter('q', e.target.value)}
                  onKeyDown={onSearchKey}
                  placeholder={t('candlist.search')}
                  aria-label={t('candlist.search')}
                  autoComplete="off"
                />
              </div>
              {/* Le même chiffre que les trois autres tableaux : il se lit dans
                  la rangée, sans rien déplier, et mène droit aux fiches. */}
              <button
                type="button"
                className="filters-count cand-count"
                title={t('dir.countHint')}
                onClick={() => document.getElementById('board-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                <i className="ri-list-check-2" aria-hidden="true"></i>
                <strong>{list.length}</strong>
                <span className="filters-count-word">
                  {t(list.length === 1 ? 'candlist.resultOne' : 'candlist.results')}
                </span>
              </button>
              <div className="fld">
                <label htmlFor="cand-pays">{t('pays.label')}</label>
                <select
                  id="cand-pays"
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
                <label htmlFor="cand-wilaya">{regionLabel}</label>
                <RegionSelect
                  id="cand-wilaya"
                  className="text-sm"
                  pays={pays}
                  value={wilaya}
                  onChange={setRegion}
                  allLabel={motDivision(pays, lang, 'tous')}
                />
              </div>
              <div className="fld">
                <label htmlFor="cand-metier">{t('dir.trade')}</label>
                <select
                  id="cand-metier"
                  className="text-sm"
                  value={metier}
                  onChange={(e) => setMetier(e.target.value)}
                >
                  <option value="">{t('dir.allT')}</option>
                  {metiers.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="fld cand-sort">
                <label htmlFor="cand-sort">{t('sort.label')}</label>
                <select
                  id="cand-sort"
                  className="text-sm"
                  value={sort}
                  /* Le point de départ du tri dépend du métier : « plus récent »
                     quand on lit tout le vivier, « plus ancien » dès qu'un
                     métier est choisi. La remise à zéro s'appuie dessus pour
                     ne compter que ce qui a été réellement posé. */
                  data-default={defaultSort}
                  onChange={(e) => setFilter('sort', e.target.value)}
                >
                  <option value="recent">{t('sort.newest')}</option>
                  <option value="oldest">{t('sort.oldest')}</option>
                  <option value="trip">{t('sort.trip')}</option>
                  <option value="name">{t('sort.name')}</option>
                  <option value="pays">{t('sort.pays')}</option>
                </select>
              </div>
              <button type="button" className="filters-reset" onClick={reset} disabled={!dirty}>
                <i className="ri-restart-line" aria-hidden="true"></i>
                {t('dir.reset')}
              </button>
            </div>
            </StickyStack>

            {/* Le tri par trajet demande une position : la ligne l'annonce et
                propose le geste, au lieu de ranger le vivier dans le vide. */}
            {sort === 'trip' && (
              <p className="board-trip">
                <i className="ri-navigation-line" aria-hidden="true"></i>
                <span>{geo.point ? t('candlist.tripNote') : t('candlist.tripHint')}</span>
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

            {/* Le rayon autour de la position, comme sur les annonces et les
                emplois : les quatre tableaux se lisent de la même façon. */}
            <RadiusChips
              value={rayon}
              counts={radiusCounts}
              total={scoped.length}
              located={Boolean(geo.point)}
              asking={geo.status === 'asking'}
              onPick={setRayon}
              onLocate={() => geo.request()}
              onForget={forgetPosition}
              note={t('radius.originRegion')}
            />

            {/* Le même geste que dans les recherches de nom et sur les
                tableaux : les flèches choisissent un candidat, Entrée l'ouvre,
                Échap efface. */}
            {q.trim().length > 0 && list.length > 0 && (
              <p className="board-keyhint">
                <i className="ri-arrow-up-down-line" aria-hidden="true"></i>
                {t('candlist.searchArrows')}
              </p>
            )}

            {/* La région lue, rappelée juste au-dessus des résultats, comme
                dans les annonces et les emplois : le chiffre du vivier sous
                cette région, sa croix qui rend la région sans rendre le pays,
                et la porte du pays entier juste en dessous. */}
            {wilaya && (
              <RegionReminder
                label={regionLabel}
                value={nomRegion(wilaya, lang)}
                count={list.length}
                word={t('candlist.results')}
                sharePercent={countryCount ? (list.length / countryCount) * 100 : undefined}
                total={countryCount}
                onClear={() => setRegion('', pays)}
                onAllCountry={() => setRegion('', pays)}
              />
            )}

            {/* La même ligne de portes vides que sur les fiches : le vivier
                rappelle le parcours avec le compte de chaque porte. */}
            {state === 'ready' && <RegionWalk doorCounts held={visible.length} lost={lostDoors} lostBy={{ region: lostBy.region, trade: lostBy.trade }} />}

            <div className="dir-meta" id="board-results" tabIndex={-1} aria-live="polite">
              <span className="dir-count">
                {visible.length < list.length ? (
                  <><strong>{visible.length}</strong> {t('dir.of')} <strong>{list.length}</strong></>
                ) : (
                  <strong>{list.length}</strong>
                )}{' '}
                {t('candlist.results')}
                {state === 'loading' && <i className="ri-loader-4-line is-spin board-spin" aria-hidden="true"></i>}
              </span>
              <div className="dir-meta-right">
                {/* Le lien du vivier emporte le pays, la région, l'ordre de
                    lecture et le rayon, comme celui des annonces et des
                    emplois : le destinataire ouvre le même périmètre. */}
                <BoardShare
                  pays={pays}
                  wilaya={wilaya}
                  sort={sort}
                  rayon={rayon ? String(rayon) : ''}
                  lettre={picked}
                />
                {onlyNew && <CopyLinkButton label={t('candlist.shareNew')} />}
                <Link to="/emplois" className="share-btn">
                  <i className="ri-briefcase-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('nav.emplois')}</span>
                </Link>
                <Link to="/annuaire?kind=auteurs" className="share-btn">
                  <i className="ri-quill-pen-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('dir.kindAuthors')}</span>
                </Link>
              </div>
            </div>

            {state === 'ready' && (
              <PaysTally
                counts={tally}
                total={tallyTotal}
                active={pays}
                onPick={(code) => setFilter('pays', code === pays ? '' : code)}
                paysSort={{
                  active: sort === 'pays',
                  onToggle: () => setFilter('sort', sort === 'pays' ? '' : 'pays'),
                }}
              />
            )}

            {/* La même ligne de compteurs que l'annuaire, les annonces et les
                emplois : la semaine (deux compteurs qui filtrent, et son pouls),
                l'étendue du vivier (pays regroupables, régions), puis le
                périmètre — le tout sur une seule bande. */}
            {state === 'ready' && list.length > 0 && (
              <BoardCountLine
                dates={pulseDates}
                weekCount={arrivals.week}
                monthCount={arrivals.month}
                left={
                  onlyNew || arrivals.week > 0 || arrivals.month > 0 ? (
                    <CandWeekCounts
                      week={arrivals.week}
                      month={arrivals.month}
                      mode={freshMode}
                      onPick={setFreshMode}
                      dates={pulseDates}
                      weekLabel={t('candlist.weekFilter')}
                      monthLabel={t('candlist.monthFilter')}
                      weekHint={t('candlist.weekHint')}
                      monthHint={t('candlist.newHint')}
                    />
                  ) : undefined
                }
                paysTotal={paysTotal}
                regionTotal={regionTotal}
                division={motDivision(pays, lang, 'plur')}
                pays={pays}
                wilaya={wilaya}
                basePath="/candidats"
                weekLabel={t('board.weekDeposits')}
                monthLabel={t('board.monthDeposits')}
                calm={t('board.pulseCalm')}
                paysWord={t('board.paysWord')}
                paysSort={sort === 'pays'}
                onPaysSort={() => setFilter('sort', sort === 'pays' ? '' : 'pays')}
              />
            )}

            {state === 'error' ? (
              <div className="board-error">
                <i className="ri-plug-line" aria-hidden="true"></i>
                <p>{t('candlist.error')}</p>
                <button type="button" className="ghost-btn" onClick={() => void load()}>
                  <i className="ri-refresh-line" aria-hidden="true"></i>
                  {t('candlist.retry')}
                </button>
              </div>
            ) : state === 'loading' ? (
              <p className="acct-loading">
                <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
                {t('candlist.loading')}
              </p>
            ) : list.length === 0 ? (
              <div className="dir-empty">
                <i className="ri-file-search-line" aria-hidden="true"></i>
                <p>{emptyPlace || (rayon ? t('radius.empty') : t('candlist.empty'))}</p>
                {/* Un rayon posé garde sa phrase à côté du lieu nommé. */}
                {rayon && emptyPlace && <p className="dir-empty-hint">{t('radius.empty')}</p>}
                <div className="dir-empty-acts">
                  {/* La même sortie que les trois autres tableaux : la région
                      s'efface, le pays, la recherche et le métier restent. */}
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
                    {t('dir.reset')} <i className="ri-restart-line" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="biz-grid" ref={gridRef}>
                  {visible.map((item, i) => (
                    <MemberCard key={item.id} item={item} index={i} active={i === actif} trip={tripOf.get(item.id) ?? null} boardRows={list.length} lostRows={lostDoors} lostBy={{ region: lostBy.region, trade: lostBy.trade }} />
                  ))}
                </div>
                {/* Sous les cartes rangées par nom : l'index des lettres, pour
                    sauter d'un clic au profil cherché dans une longue liste. La
                    lettre choisie s'écrit dans l'adresse, et revient avec elle. */}
                {sort === 'name' && (
                  <LetterIndex
                    entries={letterIndex}
                    label={t('candlist.letters')}
                    countWord={t('candlist.results')}
                    picked={picked}
                    onPick={jumpToLetter}
                  />
                )}
                {/* Sous les cartes rangées par trajet : combien de profils se
                    tiennent à moins de 50 km, et le geste pour resserrer le
                    vivier d'un cran sans repasser par les filtres. */}
                {sort === 'trip' && geo.point && (
                  <p className="board-trip board-near50">
                    <i className="ri-road-map-line" aria-hidden="true"></i>
                    <span>
                      {near50 === 1
                        ? t('candlist.near50One')
                        : t('candlist.near50').replace('{n}', String(near50))}
                    </span>
                    {rayon !== 50 && near50 > 0 && (
                      <button type="button" className="board-trip-go" onClick={() => setRayon(50)}>
                        <i className="ri-focus-3-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('candlist.near50Go')}</span>
                      </button>
                    )}
                  </p>
                )}
                {/* Sous la ligne des 50 km, l'étage suivant : combien de profils
                    se tiennent entre 50 et 100 km, pour situer le cran d'avant
                    de l'appliquer. */}
                {sort === 'trip' && geo.point && near100 > 0 && (
                  <p className="board-trip board-near100">
                    <i className="ri-stack-line" aria-hidden="true"></i>
                    <span>
                      {near100 === 1
                        ? t('candlist.near100One')
                        : t('candlist.near100').replace('{n}', String(near100))}
                    </span>
                    {rayon !== 100 && (
                      <button type="button" className="board-trip-go" onClick={() => setRayon(100)}>
                        <i className="ri-focus-3-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('candlist.near100Go')}</span>
                      </button>
                    )}
                  </p>
                )}
                {/* Le troisième cran, sous celui des 100 km : ce que le vivier
                    garde au-delà, pour fermer l'échelle. */}
                {sort === 'trip' && geo.point && far100 > 0 && (
                  <p className="board-trip board-near100 board-far100">
                    <i className="ri-roadster-line" aria-hidden="true"></i>
                    <span>
                      {far100 === 1
                        ? t('candlist.far100One')
                        : t('candlist.far100').replace('{n}', String(far100))}
                    </span>
                    {rayon > 0 && (
                      <button type="button" className="board-trip-go" onClick={() => setRayon(0)}>
                        <i className="ri-focus-2-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('candlist.far100Go')}</span>
                      </button>
                    )}
                  </p>
                )}
                {(remaining > 0 || expanded) && (
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
              </>
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}