import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLang } from '@/i18n/LangProvider';
import { localeFor, localize } from '@/i18n/localize';
import { nomPays, paysArabes } from '@/lib/pays';
import { centrePays } from '@/lib/paysCarte';
import { nomRegion } from '@/lib/regionLabels';
import { famillesDuPays, paysSansTrade, regionActive } from '@/lib/tradeCountries';
import { slugDeTrade, slugPays } from '@/lib/tradePages';
import { entreprises, capacityScore } from '@/mocks/entreprises';
import { auteurs, genres as GENRES, type Genre } from '@/mocks/auteurs';
import CopyTextButton from '@/components/feature/CopyTextButton';
import { barreDePartTexte } from '@/lib/shareBar';
import { jourCopie as jourCopieDate } from '@/lib/jourCopie';
import { useFamillesVues } from '@/hooks/useFamillesVues';
import { clearFamillesVues, markFamilleVue } from '@/lib/familyMemory';
import { ANNUAIRE_FAMILLES, FAM_ABSENT_PARAM, SANS_METIER_PARAM } from '@/lib/worldFamilies';
import {
  TOURS_EVENT,
  clearAireSeuleCopies,
  clearAiresCadrees,
  clearTourCopies,
  markAireSeuleCopied,
  markAiresCompletesCopied,
  markAiresCourteCopied,
  readAireSeuleCopies,
  readAiresCadrees,
  readAiresCompletesCopies,
  readAiresCopiesJours,
  readTourCopies,
  type AiresCompletesCopiees,
  type AiresSeulesCopiees,
  type ToursCopiees,
} from '@/lib/aireCarteMemory';
import {
  AIRE_CARTE_PARAM,
  AIRE_SEULE_PARAM,
  AIRES_MONDE_PARAM,
  AIRES_TRI_PARAM,
  REGIONS_MONDE,
  aireDeLien,
  airesDeLien,
  airesParPoidsDeLien,
  fichesDesPays,
  paysDesAires,
  regionMondeDe,
  regionMondeLabelKey,
  type RegionMondeKey,
} from '@/lib/worldRegions';
import TrioCsvButton from './TrioCsvButton';
import AiresCompleteLegend from './AiresCompleteLegend';
import {
  clearExportedCodes,
  markCopiedSheet,
  markExportedCodes,
  readCopiedCount,
  readExportedAt,
  readExportedCodes,
  readExportedWeek,
  readLastExportAt,
} from './cmapsCsvMemory';
import type { TrioCountry } from './cmapsTrioCsv';
import type { MapPin } from './DirectoryMap';
import './country-maps.css';

export type PaysPin = MapPin & { pays?: string; wilaya?: string };

type Props = {
  /** Every geolocated profile, each one knowing its country and region. */
  pins: PaysPin[];
  /** The country currently filtered, "" when the whole world arab is shown. */
  active: string;
  /** The region currently filtered, so its counter can read as selected. */
  activeRegion?: string;
  /** Picking a country filters the board on it. */
  onPick: (code: string) => void;
  /**
   * Le métier lu sur une page de type : la carte dit alors dans combien de
   * pays du monde arabe ce métier n'a aucun atelier — le manque se lit à
   * l'échelle de la carte, pas seulement dans le pays ouvert.
   */
  trade?: string;
  /** Picking a region filters the board on its country and its region at once. */
  onPickRegion: (code: string, region: string) => void;
  /**
   * The deposits published on the Annonces and Emplois boards, counted on the
   * country they declare. They land on top of the directory's own sheets, so a
   * card says how much its market really holds, not only what the directory lists.
   */
  depots?: Record<string, number>;
};

/** How many regions a card spells out before folding the rest into a « +n ». */
const TOP_REGIONS = 3;

/**
 * L'atelier le mieux noté de chaque pays, lu sur tout le répertoire — jamais
 * sur la sélection filtrée : la carte d'un pays nomme son meilleur atelier
 * même quand les filtres en cours en écartent la fiche.
 */
const MEILLEUR_PAR_PAYS: Record<string, { id: string; name: string; rating: number; reviews: number; trade: string; wilaya: string }> = (() => {
  const best: Record<string, { id: string; name: string; rating: number; reviews: number; trade: string; wilaya: string }> = {};
  entreprises.forEach((fiche) => {
    const code = fiche.pays || 'DZ';
    const row = best[code];
    if (!row || fiche.rating > row.rating || (fiche.rating === row.rating && fiche.reviews > row.reviews)) {
      best[code] = {
        id: fiche.id,
        name: fiche.name,
        rating: fiche.rating,
        reviews: fiche.reviews,
        trade: fiche.trade,
        wilaya: fiche.wilaya,
      };
    }
  });
  return best;
})();

/** How the 22 cards are ordered; « activity » is the default. */
type Tri = 'activite' | 'regions' | 'nom';

/** Une fiche d'atelier, réduite à ce qu'une carte de pays en dit. */
type MeilleureFiche = { id: string; name: string; rating: number; reviews: number; wilaya: string };

/**
 * Le meilleur atelier de chaque famille dans chaque pays : la ligne d'une
 * famille ne se contente plus de dire où elle tient son monde, elle nomme
 * aussi sa meilleure fiche — « DZ|impression » a la sienne, « DZ|librairie »
 * la sienne. Lu sur tout le répertoire, jamais sur la sélection filtrée.
 */
const MEILLEURE_FICHE: Record<string, MeilleureFiche> = (() => {
  const best: Record<string, MeilleureFiche> = {};
  entreprises.forEach((fiche) => {
    const key = `${fiche.pays || 'DZ'}|${fiche.trade}`;
    const row = best[key];
    if (!row || fiche.rating > row.rating || (fiche.rating === row.rating && fiche.reviews > row.reviews)) {
      best[key] = {
        id: fiche.id,
        name: fiche.name,
        rating: fiche.rating,
        reviews: fiche.reviews,
        wilaya: fiche.wilaya,
      };
    }
  });
  return best;
})();

/**
 * Les régions où chaque famille tient son monde, pays par pays — lues sur
 * tout le répertoire. Une famille qui n'occupe qu'une seule région est un
 * métier concentré : la carte du pays la marque d'un trait pointillé, pour
 * que cela se voie d'un œil sans lire chaque compte.
 */
const REGIONS_FAMILLE: Record<string, Set<string>> = (() => {
  const map: Record<string, Set<string>> = {};
  entreprises.forEach((fiche) => {
    const key = `${fiche.pays || 'DZ'}|${fiche.trade}`;
    const where = (fiche.wilaya || fiche.commune || '').trim();
    const set = map[key] ?? new Set<string>();
    if (where) set.add(where);
    map[key] = set;
  });
  return map;
})();

/**
 * Combien de fois chaque famille se tient dans tout le répertoire : le compte
 * local d'une carte de pays se lit contre ce total mondial, au lieu de
 * flotter seul. Lu sur tout le répertoire, jamais sur la sélection filtrée.
 */
const MONDE_FAMILLE: Record<string, number> = (() => {
  const counts: Record<string, number> = {};
  entreprises.forEach((fiche) => {
    counts[fiche.trade] = (counts[fiche.trade] ?? 0) + 1;
  });
  return counts;
})();

/**
 * La région unique où une famille est tenue dans un pays, ou null quand elle
 * en occupe plusieurs — c'est cette réponse-là qui décide du trait pointillé.
 */
function regionUnique(code: string, trade: string): string | null {
  const set = REGIONS_FAMILLE[`${code}|${trade}`];
  if (!set || set.size !== 1) return null;
  return Array.from(set)[0];
}

/** Une plume, réduite à ce qu'une carte de pays en dit. */
type MeilleurePlume = { id: string; name: string; awards: number; books: number; wilaya: string };

/**
 * La plume la plus primée de chaque genre littéraire, dans chaque pays : les
 * plumes n'ont pas de note de lecteurs, la carte les classe donc aux
 * distinctions — les ouvrages publiés tranchant les ex æquo. Lu sur tout le
 * répertoire, jamais sur la sélection filtrée.
 */
const MEILLEURE_PLUME: Record<string, MeilleurePlume> = (() => {
  const best: Record<string, MeilleurePlume> = {};
  auteurs.forEach((plume) => {
    const code = plume.pays || 'DZ';
    const awards = plume.awards.length;
    const books = plume.books.length;
    plume.genres.forEach((genre) => {
      const key = `${code}|${genre}`;
      const row = best[key];
      if (!row || awards > row.awards || (awards === row.awards && books > row.books)) {
        best[key] = { id: plume.id, name: plume.name, awards, books, wilaya: plume.wilaya };
      }
    });
  });
  return best;
})();

/** Une bibliothèque, réduite à ce qu'une carte de pays en dit. */
type BibRegion = { id: string; name: string; volume: number; rating: number };

/**
 * La bibliothèque la mieux fournie de chaque région : son fonds, lu sur tout le
 * répertoire. Une région de la carte ne se contente donc pas de compter ses
 * fiches, elle nomme la bibliothèque qui y tient le plus de volumes — le fonds
 * tranchant les ex æquo, puis la note. Lu sur tout le répertoire, jamais sur la
 * sélection filtrée.
 */
const MEILLEURE_BIB: Record<string, BibRegion> = (() => {
  const best: Record<string, BibRegion> = {};
  entreprises.forEach((fiche) => {
    if (fiche.trade !== 'bibliotheque') return;
    const where = (fiche.wilaya || '').trim();
    if (!where) return;
    const key = `${fiche.pays || 'DZ'}|${where}`;
    const volume = capacityScore(fiche);
    const row = best[key];
    if (!row || volume > row.volume || (volume === row.volume && fiche.rating > row.rating)) {
      best[key] = { id: fiche.id, name: fiche.name, volume, rating: fiche.rating };
    }
  });
  return best;
})();

/** Une librairie, réduite à ce qu'une carte de pays en dit. */
type LibRegion = { id: string; name: string; refs: number; rating: number };

/**
 * La librairie au plus large fonds de chaque région, lue sur tout le
 * répertoire : à côté de la bibliothèque, la carte nomme la librairie au plus
 * gros fonds de la région — son nombre de références, puis sa note tranchant
 * les ex æquo. Jamais lu sur la sélection filtrée.
 */
const MEILLEURE_LIB: Record<string, LibRegion> = (() => {
  const best: Record<string, LibRegion> = {};
  entreprises.forEach((fiche) => {
    if (fiche.trade !== 'librairie') return;
    const where = (fiche.wilaya || '').trim();
    if (!where) return;
    const key = `${fiche.pays || 'DZ'}|${where}`;
    const refs = capacityScore(fiche);
    const row = best[key];
    if (!row || refs > row.refs || (refs === row.refs && fiche.rating > row.rating)) {
      best[key] = { id: fiche.id, name: fiche.name, refs, rating: fiche.rating };
    }
  });
  return best;
})();

/** Une maison d'édition, réduite à ce qu'une carte de pays en dit. */
type EdRegion = { id: string; name: string; titles: number; rating: number };

/**
 * Le nombre de titres qu'une maison publie par an, lu au tout début de la
 * capacité déclarée (« 14 titres / an · 45 000 exemplaires » donne 14) : c'est
 * le catalogue qui classe les maisons, pas le tirage.
 */
function titresParAn(capacityFr: string): number {
  const first = capacityFr.match(/\d[\d\s\u00a0]*/);
  if (!first) return 0;
  const value = Number(first[0].replace(/[\s\u00a0]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

/**
 * La maison d'édition au plus gros catalogue de chaque région, lue sur tout le
 * répertoire : à côté de la bibliothèque et de la librairie, la carte nomme la
 * maison qui publie le plus de titres dans l'année — sa note tranchant les ex
 * æquo. Jamais lu sur la sélection filtrée.
 */
const MEILLEURE_EDITION: Record<string, EdRegion> = (() => {
  const best: Record<string, EdRegion> = {};
  entreprises.forEach((fiche) => {
    if (fiche.trade !== 'edition') return;
    const where = (fiche.wilaya || '').trim();
    if (!where) return;
    const key = `${fiche.pays || 'DZ'}|${where}`;
    const titles = titresParAn(fiche.capacity.fr);
    const row = best[key];
    if (!row || titles > row.titles || (titles === row.titles && fiche.rating > row.rating)) {
      best[key] = { id: fiche.id, name: fiche.name, titles, rating: fiche.rating };
    }
  });
  return best;
})();

/**
 * La région où les trois fonds réunis pèsent le plus : le fonds de la
 * bibliothèque, les références de la librairie et les titres de la maison
 * d'édition s'additionnent région par région, et la carte nomme la région qui
 * arrive en tête. Lu sur tout le répertoire, jamais sur la sélection filtrée.
 */
type TrioRegion = { wilaya: string; volume: number; refs: number; titles: number; total: number };

const TRIO_RANKING: Record<string, TrioRegion[]> = (() => {
  const parRegion: Record<string, TrioRegion> = {};
  const verser = (cle: string, champ: 'volume' | 'refs' | 'titles', valeur: number) => {
    const [code, ...reste] = cle.split('|');
    const wilaya = reste.join('|');
    if (!code || !wilaya) return;
    const k = `${code}|${wilaya}`;
    const row = parRegion[k] ?? { wilaya, volume: 0, refs: 0, titles: 0, total: 0 };
    row[champ] += valeur;
    row.total += valeur;
    parRegion[k] = row;
  };
  Object.entries(MEILLEURE_BIB).forEach(([cle, bib]) => verser(cle, 'volume', bib.volume));
  Object.entries(MEILLEURE_LIB).forEach(([cle, lib]) => verser(cle, 'refs', lib.refs));
  Object.entries(MEILLEURE_EDITION).forEach(([cle, ed]) => verser(cle, 'titles', ed.titles));
  /* Toutes les régions d'un pays, la plus large d'abord : la carte nomme la
     gagnante, puis laisse comparer les suivantes au lieu de n'en garder
     qu'une. Le nom tranche les ex æquo. */
  const parPays: Record<string, TrioRegion[]> = {};
  Object.entries(parRegion).forEach(([cle, row]) => {
    const code = cle.split('|')[0];
    const liste = parPays[code] ?? [];
    liste.push(row);
    parPays[code] = liste;
  });
  Object.values(parPays).forEach((rows) => {
    rows.sort((a, b) => b.total - a.total || a.wilaya.localeCompare(b.wilaya, 'fr'));
  });
  return parPays;
})();

/** La région gagnante de chaque pays : la première du classement. */
const MEILLEUR_TRIO: Record<string, TrioRegion> = (() => {
  const best: Record<string, TrioRegion> = {};
  Object.entries(TRIO_RANKING).forEach(([code, rows]) => {
    if (rows.length > 0) best[code] = rows[0];
  });
  return best;
})();

/** Le fonds d'une bibliothèque, groupé à la française : 68 000 se lit d'un œil. */
function espacer(n: number): string {
  return n > 0 ? n.toLocaleString('fr-FR') : '';
}

type PlumeRow = {
  genre: Genre;
  /** Les plumes du genre dans tout le pays, toutes régions confondues. */
  count: number;
  /** Les régions où ce genre est réellement tenu. */
  regions: number;
  /** Ces mêmes régions, nommées : la carte s'ouvre resserrée dessus. */
  zones: string[];
  plume: MeilleurePlume;
};

/** Les genres littéraires tenus dans un pays, la plume d'abord. */
function plumesDuPays(code: string): PlumeRow[] {
  const counts = new Map<Genre, number>();
  const areas = new Map<Genre, Set<string>>();
  auteurs.forEach((plume) => {
    if ((plume.pays || 'DZ') !== code) return;
    const where = (plume.wilaya || '').trim();
    plume.genres.forEach((genre) => {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
      if (!where) return;
      const set = areas.get(genre) ?? new Set<string>();
      set.add(where);
      areas.set(genre, set);
    });
  });
  const rows: PlumeRow[] = [];
  counts.forEach((count, genre) => {
    const plume = MEILLEURE_PLUME[`${code}|${genre}`];
    const zones = Array.from(areas.get(genre) ?? []);
    if (plume) rows.push({ genre, count, regions: zones.length, zones, plume });
  });
  return rows.sort((a, b) => b.count - a.count || GENRES.indexOf(a.genre) - GENRES.indexOf(b.genre));
}

const TRI_KEY = 'paperatlas:cmaps:tri';

/** The name of the order in the address, so a shared link reopens it. */
const TRI_PARAM = 'cmaps';

/** The countries whose regions are unfolded, also carried by the address. */
const OPEN_PARAM = 'cmapsOpen';

/**
 * Les régions sur lesquelles la carte d'un pays s'ouvre resserrée : le renvoi
 * d'un genre les écrit dans le lien, et la carte les marque puis cadre sa
 * toile dessus. Sans genre, le paramètre est absent et rien n'est resserré.
 */
const ZONES_PARAM = 'cmapsZones';

/**
 * Le genre dont les plumes sont épinglées sur la carte : le lien d'un genre
 * l'écrit dans l'adresse, et la carte du pays marque ses plumes d'un signe
 * distinct — le genre se lit sur le terrain, pas seulement en nombre.
 */
const GENRE_PARAM = 'cmapsGenre';

/**
 * Le resserrement sur les seules aires où le pays lu pèse le plus lourd :
 * le compteur posé sous la note l'écrit dans l'adresse, si bien qu'un lien
 * copié rouvre la même grille — les aires retenues, elles, restent écrites
 * à côté et reviennent d'un second appui.
 */
const AIRES_MENE_PARAM = 'cmapsMene';

/**
 * Le temps écoulé depuis le dernier export, dit en clair : « à l'instant »,
 * puis les minutes, les heures, les jours — au-delà d'un mois, la date prend
 * le relais, parce qu'un « il y a 47 jours » ne se lit plus.
 */
function tempsDepuis(stamp: number, lang: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - stamp) / 60000));
  const format = new Intl.RelativeTimeFormat(localeFor(lang), { numeric: 'auto' });
  if (minutes < 1) return format.format(0, 'minute');
  if (minutes < 60) return format.format(-minutes, 'minute');
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return format.format(-heures, 'hour');
  const jours = Math.floor(heures / 24);
  if (jours < 31) return format.format(-jours, 'day');
  const date = new Date(stamp);
  return new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'medium' }).format(date);
}

/**
 * Le jour d'un export, dit courtement : « 8 nov. » — le mois suffit, l'année
 * n'ajoute rien à un départ de feuille lu sur une carte.
 */
function dateJour(stamp: number, lang: string): string {
  return new Intl.DateTimeFormat(localeFor(lang), { day: 'numeric', month: 'short' })
    .format(new Date(stamp));
}

function triDeLien(raw: string | null): Tri | null {
  return raw === 'activite' || raw === 'regions' || raw === 'nom' ? raw : null;
}

function lireTri(): Tri {
  if (typeof window === 'undefined') return 'activite';
  try {
    const raw = window.localStorage.getItem(TRI_KEY);
    return raw === 'regions' || raw === 'nom' ? raw : 'activite';
  } catch {
    return 'activite';
  }
}

function ecrireTri(tri: Tri): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TRI_KEY, tri);
  } catch {
    /* storage unavailable — the choice simply is not remembered */
  }
}

/**
 * One small interactive map per country: the workshop's own territory, with its
 * geolocated profiles pinned on it. Every card is a real map — it can be dragged
 * and zoomed — so a country reads the same way as the big map above, at the size
 * of a card. Empty countries keep their map: the shape of the area is already
 * an invitation to register there.
 */
function CountryCanvas({ code, pins, focus = [], pens = [] }: { code: string; pins: PaysPin[]; focus?: PaysPin[]; pens?: PaysPin[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  /* The map is built once per country and per set of pins: a parent re-render
     hands over a new array each time, which must not tear the map down. */
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const pinsKey = pins.map((pin) => pin.id).join(',');
  /* Les fiches des régions que la carte doit cadrer : un genre les nomme, et
     la toile se resserre dessus sans perdre les autres épingles. */
  const focusRef = useRef(focus);
  focusRef.current = focus;
  const focusKey = focus.map((pin) => pin.id).join(',');
  /* Les plumes du genre lu, épinglées d'un losange : elles se posent sur les
     pastilles rondes des fiches, sans les effacer. */
  const pensRef = useRef(pens);
  pensRef.current = pens;
  const pensKey = pens.map((pin) => pin.id).join(',');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const current = pinsRef.current;

    const frame = centrePays(code);
    const map = L.map(host, {
      center: [frame.lat, frame.lng],
      zoom: frame.zoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      keyboard: false,
      dragging: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

    const markers = current.map((pin) =>
      L.marker([pin.lat, pin.lng], {
        title: pin.name,
        interactive: false,
        icon: L.divIcon({
          className: `cmap-pin${pin.week ? ' is-week' : ''}`,
          html: '<span></span>',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        }),
      }).addTo(map),
    );

    /* Les plumes du genre entrent dans le cadre : la carte se resserre sur
       elles comme sur les fiches des régions désignées. */
    pensRef.current.forEach((pin) => {
      L.marker([pin.lat, pin.lng], {
        title: pin.name,
        interactive: false,
        zIndexOffset: 400,
        icon: L.divIcon({
          className: 'cmap-pin cmap-pin--pen',
          html: '<span></span>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
      }).addTo(map);
    });

    const base = focusRef.current.length > 0 ? focusRef.current : current;
    const cible = [...base, ...pensRef.current];
    if (cible.length > 0) {
      const bounds = L.latLngBounds(cible.map((pin) => [pin.lat, pin.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [26, 26], maxZoom: 9 });
    }

    const resize = window.setTimeout(() => map.invalidateSize(), 180);

    return () => {
      window.clearTimeout(resize);
      map.remove();
    };
  }, [code, pinsKey, focusKey, pensKey]);

  return <div ref={hostRef} className="cmap-canvas" role="presentation" />;
}

/** How many sheets of a country come from each of its regions, fullest first. */
function tallyRegions(pins: PaysPin[]) {
  const counts = new Map<string, number>();
  pins.forEach((pin) => {
    const region = (pin.wilaya || '').trim();
    if (!region) return;
    counts.set(region, (counts.get(region) ?? 0) + 1);
  });
  return Array.from(counts, ([wilaya, count]) => ({ wilaya, count }))
    .sort((a, b) => b.count - a.count || a.wilaya.localeCompare(b.wilaya, 'fr'));
}

export default function CountryMaps({
  pins,
  active,
  activeRegion = '',
  onPick,
  onPickRegion,
  depots = {},
  trade = '',
}: Props) {
  const { t, lang } = useLang();
  const [params, setParams] = useSearchParams();
  /* Le chemin lu, pour que la porte d'une aire ouvre la vue Carte de la page
     où l'on se tient — une page de type garde son type dans son adresse. */
  const location = useLocation();
  /* Les familles déjà ouvertes depuis cet appareil : la carte dit combien
     n'ont encore ouvert aucune page, et le dit sur ce que la visite a
     réellement pressé — jamais sur un survol. */
  const famillesVues = useFamillesVues();
  const [mounted, setMounted] = useState(false);
  /* The order lives in the link first: a colleague who opens the shared address
     lands on the same classification. The device memory is only the fallback
     when the address carries no order yet. */
  const [memoTri, setMemoTri] = useState<Tri>('activite');
  const tri: Tri = triDeLien(params.get(TRI_PARAM)) ?? memoTri;
  /* Regions beyond the first three, opened country by country. The open list
     lives in the address, so a copied link reopens the very same cards. */
  const deplies = (params.get(OPEN_PARAM) ?? '').split(',').map((code) => code.trim()).filter(Boolean);
  /* Les régions qu'un genre a désignées : la carte du pays les marque et se
     cadre dessus, pour lire le genre sur son terrain au lieu d'un seul coup
     d'œil national. */
  const zonesLien = (params.get(ZONES_PARAM) ?? '').split(',').map((w) => w.trim()).filter(Boolean);
  const zonesKey = zonesLien.join('|');
  /* Le genre dont les plumes se lisent sur le terrain : absent du lien, la
     carte reste aux seules fiches du répertoire. */
  const genreParam = params.get(GENRE_PARAM) ?? '';
  const genreLien: Genre | null = (GENRES as readonly string[]).includes(genreParam)
    ? (genreParam as Genre)
    : null;
  /* Les aires du monde sur lesquelles la carte s'ouvre resserrée : le compteur
     des régions d'une page de pays les écrit dans l'adresse, et la grille se
     range sur les pays de ces aires — ceux où le métier manque comme leurs
     voisins, puisque c'est le voisinage qui donne son sens au manque. */
  const airesLien = airesDeLien(params.get(AIRES_MONDE_PARAM));
  const airesKey = airesLien.join('|');
  /* L'aire sur laquelle une pastille de la note a resserré la carte : elle
     s'ajoute aux aires retenues sans les effacer, si bien qu'un second appui
     les rend toutes. Une clef qu'aucune aire retenue ne porte est ignorée. */
  /* La note se lit dans l'ordre du monde, ou de la plus lourde à la plus
     légère quand la petite bascule a été pressée. */
  const airesParPoids = airesParPoidsDeLien(params.get(AIRES_TRI_PARAM));
  /* L'aire du pays lu : sur la note, elle porte le même repère que sur la
     rangée de sa page quand le tri de poids la fait descendre — les deux
     rangées se lisent ainsi de la même façon. */
  const sienneNote = active ? regionMondeDe(active)?.key ?? '' : '';
  /* Le pays lu hors des aires retenues : sa propre aire n'a aucune pastille
     dans la note. Elle s'y ajoute pourtant, repérée comme sur sa page quand
     le tri la déplace, et une ligne dit où elle se tient dans le monde. */
  const sienneHors = active && sienneNote && !airesLien.includes(sienneNote as RegionMondeKey)
    ? REGIONS_MONDE.find((region) => region.key === sienneNote) ?? null
    : null;
  /* Les aires jamais cadrées depuis cet appareil : le compteur de la note
     dit ce qui reste à parcourir, et les ouvre d'un geste — sans repasser
     par une page de pays. La mémoire est relue à l'ouverture, comme celle
     des feuilles emportées. */
  const [airesCadreesIci, setAiresCadreesIci] = useState<RegionMondeKey[]>([]);
  /* Le compte des tournées copiées depuis cet appareil, lu sur la même mémoire
     que la rangée d'une page de pays : le chiffre se lit des deux côtés. */
  const [toursNote, setToursNote] = useState<ToursCopiees>({ count: 0, last: null, aire: '' });
  /* Le compte des aires copiées seules, lu sur la même mémoire que la rangée
     d'une page de pays : la note le relit à côté des tournées, et sa gomme
     n'efface que ce chiffre-là. */
  const [seulesNote, setSeulesNote] = useState<AiresSeulesCopiees>({
    count: 0, last: null, aire: '', aires: [], pays: [],
  });
  /* Combien de fois les aires complètes ont été copiées depuis cet appareil :
     le petit compte posé près du compteur de l'en-tête le dit, comme celui
     des tournées, et le jour de la dernière copie avec lui. */
  const [completesNote, setCompletesNote] = useState<AiresCompletesCopiees>({
    count: 0, last: null,
  });
  /* Le cadrage écrit dans l'adresse : la rangée d'une page de pays vient d'en
     poser un, le carnet de l'appareil est relu — le compteur suit le geste
     sans attendre un rechargement. */
  const aireCadreeLien = params.get(AIRE_CARTE_PARAM) ?? '';

  useEffect(() => {
    setAiresCadreesIci(readAiresCadrees().aires);
  }, [aireCadreeLien]);

  /* Le compte suit les deux gestes de copie : la rangée d'une page de pays et
     la note préviennent la fenêtre, si bien que le chiffre se relit sans
     recharger la page. */
  /* Le jour de la dernière copie de chaque aire, tous gestes confondus : la
     pastille de la note le porte sous les yeux, au lieu de le laisser au
     seul survol. */
  const [airesJours, setAiresJours] = useState<Record<string, number>>({});

  useEffect(() => {
    const relire = () => {
      setToursNote(readTourCopies());
      setSeulesNote(readAireSeuleCopies());
      setCompletesNote(readAiresCompletesCopies());
      setAiresJours(readAiresCopiesJours());
    };
    relire();
    window.addEventListener(TOURS_EVENT, relire);
    return () => window.removeEventListener(TOURS_EVENT, relire);
  }, [aireCadreeLien]);

  /* La gomme du compteur : le premier appui l'arme, le second efface la
     mémoire de cadrage de l'appareil — les cinq aires redeviennent jamais
     cadrées, et la note repart d'une tournée vierge. Laissée sans
     confirmation, elle se désarme d'elle-même au bout de cinq secondes. */
  const [airesGomme, setAiresGomme] = useState(false);

  useEffect(() => {
    if (!airesGomme) return;
    const timer = window.setTimeout(() => setAiresGomme(false), 5000);
    return () => window.clearTimeout(timer);
  }, [airesGomme]);

  /* La gomme de l'en-tête de la note des aires : le premier appui l'arme, le
     second rend d'un geste toutes les aires resserrées — les vingt-deux
     cartes reviennent, l'aire pressée et l'ordre de poids s'effacent.
     Laissée sans confirmation, elle se désarme d'elle-même. */
  const [noteGomme, setNoteGomme] = useState(false);

  useEffect(() => {
    if (!noteGomme) return;
    const timer = window.setTimeout(() => setNoteGomme(false), 5000);
    return () => window.clearTimeout(timer);
  }, [noteGomme]);

  /* La gomme du seul compte des tournées : elle n'efface pas la mémoire de
     cadrage — le compte repart de zéro, les aires restent cadrées. Laissée
     sans confirmation, elle se désarme d'elle-même au bout de cinq secondes,
     comme celle du cadrage et des familles. */
  const [toursGomme, setToursGomme] = useState(false);

  useEffect(() => {
    if (!toursGomme) return;
    const timer = window.setTimeout(() => setToursGomme(false), 5000);
    return () => window.clearTimeout(timer);
  }, [toursGomme]);

  /* La gomme du seul compte des aires copiées seules : elle n'efface pas le
     cadrage — le chiffre repart de zéro, les aires restent cadrées. Laissée
     sans confirmation, elle se désarme d'elle-même au bout de cinq secondes. */
  const [seulesGomme, setSeulesGomme] = useState(false);

  useEffect(() => {
    if (!seulesGomme) return;
    const timer = window.setTimeout(() => setSeulesGomme(false), 5000);
    return () => window.clearTimeout(timer);
  }, [seulesGomme]);

  /** Le compte des tournées seulement : le carnet de cadrage reste tel quel. */
  const gommerTours = () => {
    if (!toursGomme) {
      setToursGomme(true);
      return;
    }
    setToursNote(clearTourCopies());
    setToursGomme(false);
  };

  /** La gomme du seul compte des aires seules : un premier appui l'arme, le
      second remet ce compte à zéro — le cadrage des aires reste intact. */
  const gommerSeules = () => {
    if (!seulesGomme) {
      setSeulesGomme(true);
      return;
    }
    setSeulesNote(clearAireSeuleCopies());
    setSeulesGomme(false);
  };

  /** La gomme des aires cadrées : un premier appui demande confirmation, le
      second efface — le compteur repart alors de cinq aires à parcourir. */
  const gommerAiresCadrees = () => {
    if (!airesGomme) {
      setAiresGomme(true);
      return;
    }
    setAiresCadreesIci(clearAiresCadrees().aires);
    setAiresGomme(false);
  };

  /* La dernière aire réellement emportée par une tournée : le survol du
     compte la nomme, pour lire où s'arrête le message sans le coller. */
  const derniereAireTour = toursNote.aire
    ? REGIONS_MONDE.find((region) => region.key === toursNote.aire) ?? null
    : null;

  /* Le jour de la dernière tournée copiée, pour la note des aires : l'année ne
     s'écrit que si le geste n'appartient pas à l'année en cours. */
  const dateTours = toursNote.last
    ? new Intl.DateTimeFormat(localeFor(lang), {
      day: 'numeric',
      month: 'short',
      ...(new Date(toursNote.last).getFullYear() === new Date().getFullYear()
        ? {}
        : { year: 'numeric' }),
    }).format(new Date(toursNote.last))
    : '';

  /* Le jour de la dernière aire copiée seule, dit avec les mêmes mots que la
     rangée d'une page de pays — l'année ne s'écrit que si le geste n'appartient
     pas à l'année en cours. */
  const dateSeules = seulesNote.last
    ? new Intl.DateTimeFormat(localeFor(lang), {
      day: 'numeric',
      month: 'short',
      ...(new Date(seulesNote.last).getFullYear() === new Date().getFullYear()
        ? {}
        : { year: 'numeric' }),
    }).format(new Date(seulesNote.last))
    : '';

  /* Le jour de la dernière copie d'aires complètes, dit avec les mêmes mots
     que les deux autres comptes — l'année ne s'écrit que si le geste
     n'appartient pas à l'année en cours. */
  const dateCompletes = completesNote.last
    ? new Intl.DateTimeFormat(localeFor(lang), {
      day: 'numeric',
      month: 'short',
      ...(new Date(completesNote.last).getFullYear() === new Date().getFullYear()
        ? {}
        : { year: 'numeric' }),
    }).format(new Date(completesNote.last))
    : '';

  /* La dernière aire copiée seule, nommée au survol du compte. */
  const derniereAireSeule = seulesNote.aire
    ? REGIONS_MONDE.find((region) => region.key === seulesNote.aire) ?? null
    : null;

  const jamaisCadrees = REGIONS_MONDE
    .filter((region) => !airesCadreesIci.includes(region.key))
    .map((region) => region.key);
  /* Les noms des aires jamais cadrées, lus dans le même ordre que les
     pastilles : le survol les nomme au lieu de n'en donner que le compte. */
  const jamaisNoms = REGIONS_MONDE
    .filter((region) => jamaisCadrees.includes(region.key))
    .map((region) => t(regionMondeLabelKey(region)));
  /* La carte est déjà ouverte sur ces seules aires : un second appui rend
     celles qui étaient en cours. */
  const jamaisSeules = jamaisCadrees.length > 0
    && airesLien.length === jamaisCadrees.length
    && jamaisCadrees.every((key) => airesLien.includes(key));
  const aireSeule = aireDeLien(params.get(AIRE_SEULE_PARAM));
  const aireSeuleKey = airesLien.includes(aireSeule as RegionMondeKey) ? aireSeule : '';
  /* La carte reste-t-elle cadrée sur l'aire du pays : la pastille ajoutée se
     lit alors comme enfoncée, tant que le cadre tient — et se relâche d'un
     second appui. */
  const sienneCadree = Boolean(sienneNote) && aireSeuleKey === sienneNote;
  /* La pastille de l'aire du pays reste au bout de la note tant que cette
     aire est hors des aires retenues, ou tant que la carte reste cadrée
     dessus : elle ne quitte pas sa place au moment où l'on s'en sert. */
  const siennePuce = active && sienneNote && (sienneHors !== null || sienneCadree)
    ? REGIONS_MONDE.find((region) => region.key === sienneNote) ?? null
    : null;
  /* Les aires retenues où le pays lu devance tous les autres pays, la plus
     lourde en tête et les ex æquo tranchés par le nom : le compteur posé sous
     la note les nomme, et son appui resserre la carte sur elles seules. */
  const airesOuPaysMeneCles: RegionMondeKey[] = active
    ? REGIONS_MONDE
      .filter((region) => airesLien.includes(region.key) && region.pays.includes(active))
      .filter((region) => {
        const filesPays = fichesDesPays([active]);
        const nomLu = nomPays(active, lang);
        return region.pays.every((code) => code === active
          || filesPays > fichesDesPays([code])
          || (filesPays === fichesDesPays([code])
            && nomLu.localeCompare(nomPays(code, lang), 'fr') <= 0));
      })
      .map((region) => region.key)
    : [];
  const meneSeuls = params.get(AIRES_MENE_PARAM) === '1' && airesOuPaysMeneCles.length > 0;
  /* Les aires réellement montrées : la seule pressée, celles où le pays pèse
     le plus lourd, ou toutes celles que le compteur d'une page de pays a
     retenues. */
  const airesActives: RegionMondeKey[] = aireSeuleKey
    ? [aireSeuleKey]
    : meneSeuls
      ? airesOuPaysMeneCles
      : airesLien;
  const paysAires = new Set(paysDesAires(airesActives));
  /* Les aires nommées une à une, avec le nombre de leurs pays : le survol de
     la note dit d'où la grille est resserrée. */
  const airesNoms = REGIONS_MONDE
    .filter((region) => airesLien.includes(region.key))
    .map((region) => `${t(regionMondeLabelKey(region))} (${region.pays.length})`)
    .join(' · ');
  const gridRef = useRef<HTMLDivElement>(null);

  /* Les pays dont la feuille a déjà été emportée : le compteur de l'en-tête les
     nomme en nombre, pour savoir combien de feuilles ont déjà quitté la carte. */
  const [exportes, setExportes] = useState<string[]>([]);
  /* L'heure du dernier départ de feuille : la carte dit depuis combien de
     temps rien n'a été emporté, plutôt que de laisser le compteur seul. */
  const [lastExportAt, setLastExportAt] = useState<number | null>(null);
  /* L'heure de départ de chaque pays : la carte garde ainsi les seules
     feuilles parties aujourd'hui, sans confondre un export d'hier. */
  const [exportesAt, setExportesAt] = useState<Record<string, number>>({});
  /* Combien de feuilles ont été copiées, et non seulement téléchargées : le
     compteur de l'en-tête le dit à côté du total. */
  const [copies, setCopies] = useState(0);
  /* Une horloge de la section, relue chaque minute : le temps écoulé avance
     sous les yeux du lecteur au lieu de se figer à l'ouverture. */
  const [horloge, setHorloge] = useState(() => Date.now());
  /* Le compteur ouvre la liste des pays déjà emportés, et sa gomme remet le
     compte à zéro — le chiffre se vérifie au lieu de se croire. */
  const [csvOuvert, setCsvOuvert] = useState(false);
  /* La lecture du bloc : toutes les cartes, celles déjà emportées, celles qui
     restent à emporter, ou celles parties aujourd'hui. Un second clic rend la
     grille entière. */
  const [csvScope, setCsvScope] = useState<'' | 'done' | 'todo' | 'today' | 'week'>('');

  useEffect(() => {
    setExportes(readExportedCodes());
    setExportesAt(readExportedAt());
    setLastExportAt(readLastExportAt());
    setCopies(readCopiedCount());
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setHorloge(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  /** Une feuille vient de partir : ses pays entrent au compteur, une fois chacun. */
  const noterExport = (codes: string[]) => {
    setExportes(markExportedCodes(codes));
    /* Les heures de départ sont relues dans la même mémoire : la lecture du
       jour suit le téléchargement qui vient d'avoir lieu. */
    setExportesAt(readExportedAt());
    /* L'heure est relue dans la même mémoire : le compteur dit alors depuis
       quand la dernière feuille a quitté la carte. */
    setLastExportAt(readLastExportAt());
    setHorloge(Date.now());
  };

  /** La gomme du compteur : la mémoire s'efface, la carte repart au large. */
  const effacerExportes = () => {
    setExportes(clearExportedCodes());
    setExportesAt({});
    /* Le compte des copies repart avec la mémoire des feuilles : repartir de
       zéro efface aussi ce que la carte avait recopié. */
    setCopies(0);
    /* L'heure part avec les codes : plus aucune feuille n'a quitté cette carte,
       donc plus aucun temps écoulé ne s'écrit. */
    setLastExportAt(null);
    setCsvScope('');
    setCsvOuvert(false);
  };

  /* The chosen order survives the visit: a reader who sorts by activity finds
     the same order next time instead of the alphabetical one coming back. */
  useEffect(() => {
    setMemoTri(lireTri());
  }, []);

  /* Twenty-two maps is a lot of tiles: they are only built once the section is
     really on screen, then kept for the rest of the visit. */
  useEffect(() => {
    const host = gridRef.current;
    if (!host || mounted) return;
    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setMounted(true);
        observer.disconnect();
      }
    }, { rootMargin: '240px' });
    observer.observe(host);
    return () => observer.disconnect();
  }, [mounted]);

  /* Arriving from a company sheet through « see the country map »: the visitor
     asked for this block by name, so the section comes into view by itself. */
  useEffect(() => {
    if (!mounted || window.location.hash !== '#cmaps') return;
    const timer = window.setTimeout(() => {
      document.getElementById('cmaps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 260);
    return () => window.clearTimeout(timer);
  }, [mounted]);

  /* Une carte resserrée sur les régions d'un genre vient d'un renvoi de fiche
     d'auteur : la carte du pays concerné se met en avant d'elle-même. */
  useEffect(() => {
    if (!mounted || zonesLien.length === 0) return;
    const timer = window.setTimeout(() => {
      document.getElementById('cmaps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 260);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, zonesKey]);

  /* Le compteur des régions d'une page de pays vient d'être pressé : la grille
     resserrée sur ces aires se met sous les yeux, plutôt que de changer plus
     bas sans le dire. */
  useEffect(() => {
    if (!mounted || airesLien.length === 0) return;
    const timer = window.setTimeout(() => {
      document.getElementById('cmaps-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, airesKey]);

  /* Les plumes du genre lu, dans le pays ouvert : la carte les épingle d'un
     losange pour les voir sur le terrain, pas seulement en nombre. */
  const penPins = useMemo<PaysPin[]>(() => {
    if (!genreLien || !active) return [];
    return auteurs
      .filter((plume) => (plume.pays || 'DZ') === active && plume.genres.includes(genreLien))
      .map((plume) => ({
        id: `pen-${plume.id}`,
        name: plume.name,
        lat: plume.lat,
        lng: plume.lng,
        pays: plume.pays || 'DZ',
        wilaya: plume.wilaya,
      }));
  }, [genreLien, active]);

  const cards = useMemo(() => {
    const byPays = new Map<string, PaysPin[]>();
    pins.forEach((pin) => {
      const code = pin.pays || 'DZ';
      const list = byPays.get(code) ?? [];
      list.push(pin);
      byPays.set(code, list);
    });
    const locale = lang === 'ar' ? 'ar' : lang === 'en' ? 'en' : 'fr';
    const rows = paysArabes.map((pays) => {
      const countryPins = byPays.get(pays.code) ?? [];
      const regions = tallyRegions(countryPins);
      /* Les familles du pays, bibliothèques et écrivains compris : la carte
         annonce ses comptes comme elle annonce ses régions. */
      const familles = famillesDuPays(pays.code);
      /* The deposits are counted here, not on a separate screen: the card is
         the only place where a market is compared with its neighbours. */
      const depotsPays = depots[pays.code] ?? 0;
      return {
        pays,
        nom: localize(pays.nom, lang),
        pins: countryPins,
        regions,
        familles,
        best: MEILLEUR_PAR_PAYS[pays.code] ?? null,
        pens: plumesDuPays(pays.code),
        count: countryPins.length,
        depots: depotsPays,
        total: countryPins.length + depotsPays,
        regionsCount: regions.length,
      };
    });
    return rows.sort((a, b) => {
      /* A country nobody has joined yet never pushes a stocked one aside: the
         alphabetical key closes every tie, so the grid never reshuffles. */
      const parNom = a.nom.localeCompare(b.nom, locale);
      if (tri === 'nom') return parNom;
      if (tri === 'regions') return b.regionsCount - a.regionsCount || b.total - a.total || parNom;
      return b.total - a.total || b.regionsCount - a.regionsCount || parNom;
    });
  }, [pins, tri, lang, depots]);

  /* Le nom de chaque pays, lu dans les cartes déjà bâties : la liste du
     compteur nomme les pays au lieu de n'en donner que le code. */
  const nomsPays = useMemo(() => {
    const map = new Map<string, string>();
    cards.forEach(({ pays, nom }) => map.set(pays.code, nom));
    return map;
  }, [cards]);

  /* Les pays dont la feuille est partie aujourd'hui, relus à chaque minute :
     passé minuit, un export d'hier sort de la lecture du jour sans qu'on ait
     à recharger la page. */
  const exportesJour = useMemo(() => {
    const now = new Date(horloge);
    return Object.entries(exportesAt)
      .filter(([, stamp]) => {
        const date = new Date(stamp);
        return date.getFullYear() === now.getFullYear()
          && date.getMonth() === now.getMonth()
          && date.getDate() === now.getDate();
      })
      .map(([code]) => code);
  }, [exportesAt, horloge]);

  /* Les pays partis cette semaine, relus à la même horloge : le panneau pose
     la semaine sous le jour, dans le même esprit que la ligne du jour. */
  const exportesSemaine = useMemo(() => readExportedWeek(horloge), [horloge]);

  /* Une lecture du jour qui n'a plus rien à montrer — minuit passé, gomme
     pressée — revient à la grille entière plutôt que de laisser une zone
     vide sans raison. */
  useEffect(() => {
    if (csvScope === 'today' && exportesJour.length === 0) setCsvScope('');
  }, [csvScope, exportesJour.length]);

  /* La même chose pour la semaine : une lecture qui n'a plus rien à montrer
     rend la grille entière plutôt que de la laisser vide sans raison. */
  useEffect(() => {
    if (csvScope === 'week' && exportesSemaine.length === 0) setCsvScope('');
  }, [csvScope, exportesSemaine.length]);

  /* La grille montrée : toutes les cartes, celles déjà emportées en CSV,
     celles qui restent à emporter, ou celles parties aujourd'hui — de quoi
     retrouver d'un coup d'œil le départ du jour. */
  const cartesVises = csvScope === 'done'
    ? cards.filter((card) => exportes.includes(card.pays.code))
    : csvScope === 'todo'
      ? cards.filter((card) => !exportes.includes(card.pays.code))
      : csvScope === 'today'
        ? cards.filter((card) => exportesJour.includes(card.pays.code))
        : csvScope === 'week'
          ? cards.filter((card) => exportesSemaine.includes(card.pays.code))
          : cards;
  const resteAEmporter = cards.filter((card) => !exportes.includes(card.pays.code)).length;

  /* Les familles qui n'ont encore rien ouvert depuis cet appareil, nommées
     dans l'ordre de la bande sous la carte : le compte se lit sur la même
     liste que les portes, il ne peut donc pas en oublier une. */
  const famillesJamais = ANNUAIRE_FAMILLES.filter((row) => !famillesVues.includes(row.trade));

  /* Les familles absentes du pays lu : la carte dit, à côté de celles qui
     n'ont encore rien ouvert, ce que le pays qu'elle lit ne tient pas du tout.
     Le compte se lit sur la même liste que les portes, il ne peut donc pas
     en oublier une. Hors pays lu, la question ne se pose pas et la pastille
     se tait. */
  const famillesDuPaysLu = active ? famillesDuPays(active) : [];
  const famillesAbsentes = active
    ? ANNUAIRE_FAMILLES.filter(
      (row) => !famillesDuPaysLu.some((famille) => famille.trade === row.trade),
    )
    : [];

  /* Les familles absentes du pays lu, resserrées dans la bande des portes :
     l'état vit dans l'adresse, pour que la bande lise la même chose que le
     compteur et qu'un lien copié rouvre la même vue. */
  const absentsSeuls = params.get(FAM_ABSENT_PARAM) === '1';

  /* Le métier lu sur une page de type, et les pays de la carte où il n'a
     aucun atelier : le compteur de l'en-tête les nomme en nombre, et son
     survol les cite un par un. Lu sur tout le répertoire, jamais sur la
     sélection filtrée — c'est le monde qui manque, non la vue en cours. */
  const paysSansMetier = useMemo(() => paysSansTrade(trade), [trade]);
  const metierLabel = trade ? t(`tradePlural.${trade}`) : '';

  /* La grille resserrée sur les seuls pays où le métier manque : la clef vit
     dans l'adresse, la grille et le compteur lisent donc la même. Sans pays
     manquant, il n'y a rien à resserrer et les vingt-deux cartes reviennent. */
  const sansMetier = new Set(paysSansMetier);
  const sansMetierSeuls = params.get(SANS_METIER_PARAM) === '1'
    && Boolean(trade) && paysSansMetier.length > 0;
  const cartesGrille = (sansMetierSeuls
    ? cartesVises.filter((card) => sansMetier.has(card.pays.code))
    : cartesVises)
    .filter((card) => paysAires.size === 0 || paysAires.has(card.pays.code));

  /* Le total des fiches que ces pays tiennent, toutes familles confondues :
     lu sur ces pays-là, jamais sur la grille filtrée en cours — c'est le
     manque du métier qui se mesure, non la vue qu'on vient d'y poser. */
  const filesSansMetier = useMemo(
    () => cards
      .filter((card) => paysSansMetier.includes(card.pays.code))
      .reduce((sum, card) => sum + card.total, 0),
    [cards, paysSansMetier],
  );

  /* Le total des fiches que les aires resserrées tiennent, toutes familles
     confondues : le manque se lit contre le répertoire entier, à l'échelle de
     l'aire, au lieu de rester une grille de cartes vides. */
  const filesAires = airesActives.length === 0
    ? 0
    : fichesDesPays(paysDesAires(airesActives));

  /* Les aires retenues, une à une : leur nom, les fiches qu'elles tiennent
     toutes familles confondues, les pays qui y sont privés du métier — et
     ceux qui le tiennent, pour lire le manque contre l'activité réelle de
     l'aire au lieu d'un compte de vide. La pastille porte les fiches, son
     survol nomme les deux versants, et la copie part aire par aire. */
  const airesRows = REGIONS_MONDE
    .filter((region) => airesLien.includes(region.key))
    .map((region) => {
      const dedans = cards.filter((card) => region.pays.includes(card.pays.code));
      const manquants = dedans
        .filter((card) => sansMetier.has(card.pays.code))
        .map((card) => card.pays.code);
      const tenus = trade
        ? region.pays.filter((code) => !sansMetier.has(code))
        : [];
      /* Les fiches de l'aire, et la part du pays lu dedans : le pays se
         situe dans le voisinage qu'il touche, la note le dit aire par
         aire au lieu de le laisser sans échelle. */
      const filesIci = fichesDesPays(region.pays);
      const paysPart = active && region.pays.includes(active) && filesIci > 0
        ? Math.round((fichesDesPays([active]) / filesIci) * 100)
        : null;
      /* Le rang du pays lu parmi les pays de l'aire, la plus lourde en tête,
         les ex æquo tranchés par le nom : sa part se lit avec sa place, si
         bien que le pays se situe dans l'aire au lieu de flotter seul. */
      const paysRang = active && region.pays.includes(active)
        ? [...region.pays]
          .map((code) => ({ code, files: fichesDesPays([code]) }))
          .sort((a, b) => b.files - a.files || nomPays(a.code, lang).localeCompare(nomPays(b.code, lang), lang))
          .findIndex((row) => row.code === active) + 1
        : null;
      return {
        key: region.key,
        label: t(regionMondeLabelKey(region)),
        files: filesIci,
        /* Tous ses pays déjà copiés seuls : la pastille de la note porte le
           même repère que celle de la rangée d'une page de pays, si bien que
           les deux rangées se lisent exactement pareil. */
        complete: region.pays.every((code) => seulesNote.pays.includes(code)),
        paysPart,
        paysRang,
        pays: region.pays.length,
        manquants,
        manquantsNoms: manquants.map((code) => nomPays(code, lang)),
        tenus: tenus.length,
        tenusNoms: tenus.map((code) => nomPays(code, lang)),
      };
    });

  /* Les aires de la note déjà copiées seules : le survol de la pastille
     ajoutée situe le geste — combien des aires retenues sont déjà parties,
     sur combien. Une aire se compte une fois, même recopiée. */
  const seulesDansNote = airesRows
    .filter((row) => seulesNote.aires.includes(row.key)).length;

  /* Les aires de la note dont tous les pays ont déjà été copiés seuls : le
     geste posé plus bas les emporte d'un coup, sans en choisir une — un
     relevé complet se vérifie avant de partir. */
  const airesCompletes = airesRows.filter((row) => row.complete);
  /* Les fiches que ces aires complètes tiendraient une fois envoyées : la
     légende les dit au survol, pour mesurer le geste avant de le presser. */
  const fichesCompletesNote = airesCompletes
    .reduce((sum, row) => sum + row.files, 0);
  /* Les aires du monde dont tous les pays ont déjà été copiés seuls, et
     celles qui ne sont jamais parties seules : le compteur de l’en-tête les
     dit à côté des familles jamais ouvertes, et son clic resserre la carte
     sur elles seules — ce qui est complet mais jamais parti se lit avant
     d’ouvrir une seule carte. */
  const airesCompletesMonde = REGIONS_MONDE
    .filter((region) => region.pays.every((code) => seulesNote.pays.includes(code)));
  const airesCompletesMondeJamais = airesCompletesMonde
    .filter((region) => !seulesNote.aires.includes(region.key));
  const completesMondeNoms = airesCompletesMondeJamais
    .map((region) => t(regionMondeLabelKey(region)))
    .join(' · ');
  const fichesCompletesMondeJamais = airesCompletesMondeJamais
    .reduce((sum, region) => sum + fichesDesPays(region.pays), 0);
  /* La grille est déjà resserrée sur ces aires, même en partie : la porte
     d'une page de pays n'en pose qu'une part, et le compteur se lit alors
     enfoncé au lieu de promettre un geste déjà fait. */
  const completesMondeEnfonce = airesCompletesMondeJamais.length > 0
    && airesLien.length > 0
    && airesLien.every((key) => airesCompletesMondeJamais
      .some((region) => region.key === key));
  /* Les aires complètes de la rangée, nommées une à une : la coche de la note
     les dit toutes au survol, si bien que le repère se lit sur la rangée
     entière au lieu de ne nommer que sa pastille. */
  const completesNomsRangee = airesCompletes.map((row) => row.label).join(' · ');
  const completesCocheTxt = airesCompletes.length > 0
    ? `${t('cmaps.aireFrameCompleteRowHint')
      .replace('{n}', String(airesCompletes.length))
      .replace('{names}', completesNomsRangee)} — ${t('cmaps.aireFrameCompleteHint')}`
    : '';

  /* Les aires de la note restées incomplètes : celles dont un pays au moins
     n'a jamais été copié seul. Le survol du geste les nomme une à une, avec
     les pays qui leur manquent, pour savoir ce qu'il reste à envoyer avant
     de presser le bouton. */
  const airesIncompletes = airesRows
    .filter((row) => !airesCompletes.some((complete) => complete.key === row.key))
    .map((row) => {
      const region = REGIONS_MONDE.find((aire) => aire.key === row.key);
      const manquants = region
        ? region.pays.filter((code) => !seulesNote.pays.includes(code))
        : [];
      /* Le rang de chaque pays dans son aire, la plus lourde en tête et les
         ex æquo tranchés par le nom : le survol de la petite ligne dit par
         quel pays commencer au lieu de nommer le manque sans ordre. */
      const ordre = region
        ? [...region.pays]
          .map((code) => ({ code, files: fichesDesPays([code]) }))
          .sort((a, b) => b.files - a.files
            || nomPays(a.code, lang).localeCompare(nomPays(b.code, lang), lang))
        : [];
      const noms = manquants.map((code) => {
        const rang = ordre.findIndex((pays) => pays.code === code) + 1;
        const nom = nomPays(code, lang);
        return rang === 1
          ? t('cmaps.airesCompletesMissingRankFirst')
            .replace('{pays}', nom)
            .replace('{n}', String(region?.pays.length ?? 0))
          : t('cmaps.airesCompletesMissingRank')
            .replace('{pays}', nom)
            .replace('{rang}', String(rang))
            .replace('{n}', String(region?.pays.length ?? 0));
      });
      return {
        key: row.key,
        label: row.label,
        noms,
      };
    });

  /** Le survol du geste des aires complètes : les aires restées incomplètes,
      une à une, avec les pays qui leur manquent — le geste ne promet pas un
      relevé entier quand une part reste à envoyer. */
  const incompletesTxt = airesIncompletes.length === 0
    ? t('cmaps.airesCompletesIncompleteNone')
    : t('cmaps.airesCompletesIncompleteHint')
      .replace('{n}', String(airesIncompletes.length))
      .replace('{list}', airesIncompletes
        .map((row) => t('cmaps.airesCompletesIncompleteRow')
          .replace('{region}', row.label)
          .replace('{pays}', row.noms.join(' · ') || '—'))
        .join(' · '));

  /* Les pays qui manquent encore, toutes aires incomplètes réunies : la
     petite ligne posée sous le geste des aires complètes les compte d'un
     seul chiffre, au lieu de laisser le survol seul le dire. */
  const paysManquantsCompletes = airesIncompletes
    .reduce((sum, row) => sum + row.noms.length, 0);

  /* Les aires complètes déjà parties au moins une fois : le compteur des
     tournées de la note le dit à côté de son propre compte, si bien que le
     relevé complet se vérifie sans ouvrir une seule pastille. */
  const completesParties = airesCompletes
    .filter((row) => seulesNote.aires.includes(row.key)).length;
  /* Les aires complètes qui n'ont pas encore été copiées seules : le
     compteur posé sous la note les compte, et sa porte de copie les emporte
     d'un geste — ce qui est complet mais jamais parti se lit d'un chiffre. */
  const airesCompletesNonSeules = airesCompletes
    .filter((row) => !seulesNote.aires.includes(row.key));
  /* Les fiches que ces aires tiendraient une fois envoyées, toutes réunies :
     le survol du compteur dit ce que le geste emporterait, au lieu de
     laisser le chiffre sans poids. */
  const fichesCompletesNonSeules = airesCompletesNonSeules
    .reduce((sum, row) => sum + row.files, 0);
  const completesPartiesTxt = airesCompletes.length > 0
    ? t('cmaps.aireFrameCompletesTours')
      .replace('{n}', String(completesParties))
      .replace('{total}', String(airesCompletes.length))
    : '';

  /* Les aires retenues où le pays lu pèse le plus lourd — celles où il
     devance tous les autres pays : le petit compteur posé sous la note les
     compte et les nomme au survol. */
  const airesOuPaysMene = airesRows.filter((row) => row.paysRang === 1);

  /* Les aires retenues où le pays arrive juste derrière : la meilleure place
     qu'il tient sans être en tête, la plus proche voisine d'abord. Quand il ne
     devance aucun pays, c'est cette liste-là que le geste de copie emporte —
     le message dit alors où le pays se situe au lieu de rester sans réponse. */
  const derriereRang = airesRows.reduce(
    (min, row) => (row.paysRang !== null && row.paysRang > 1 && (min === 0 || row.paysRang < min)
      ? row.paysRang
      : min),
    0,
  );
  const airesOuPaysDerriere = derriereRang === 0
    ? []
    : [...airesRows]
      .filter((row) => row.paysRang === derriereRang && row.paysPart !== null)
      .sort((a, b) => (b.paysPart ?? 0) - (a.paysPart ?? 0)
        || a.label.localeCompare(b.label, lang));

  /* Le total des fiches que les aires retenues tiennent toutes ensemble : la
     base de la petite barre de part, pour que chaque aire se compare aux
     autres d'un regard — la plus lourde se repère avant d'être pressée. */
  const filesNote = airesRows.reduce((sum, row) => sum + row.files, 0);

  /* Le rang de chaque aire et sa part exacte : la plus lourde en tête, les
     ex æquo tranchés par le nom. La barre de part le dit au survol, si bien
     que la part se lit avec la place qu'elle occupe dans la note. */
  const ordreAires = [...airesRows]
    .sort((a, b) => b.files - a.files || a.label.localeCompare(b.label, lang));
  const rangAire = (key: RegionMondeKey): number => ordreAires.findIndex((row) => row.key === key) + 1;
  const partAire = (files: number): number => (filesNote > 0 ? Math.round((files / filesNote) * 100) : 0);
  /* La part exacte, au dixième : la barre n'en dessine qu'un arrondi, et son
     survol donne le chiffre qui la vérifie avant d'être cité — la même
     mesure que la barre des pastilles d'une page de pays. */
  const partAireExacte = (files: number): string => (filesNote > 0
    ? new Intl.NumberFormat(localeFor(lang), { maximumFractionDigits: 1 })
      .format((files / filesNote) * 100)
    : '0');
  /* Le rang d'une aire parmi celles retenues, dit mot pour mot comme le survol
     de sa barre le dit : les trois copies de la note parlent alors la même
     échelle sur une même aire, et se comparent d'un regard. */
  const rangAireTxt = (key: RegionMondeKey): string => t('cmaps.airesChipRank')
    .replace('{rang}', String(rangAire(key)))
    .replace('{n}', String(airesRows.length));

  /* Les pastilles réellement montrées : la bascule de poids range la plus
     lourde d'abord, l'absence garde l'ordre des aires du monde. Les copies
     suivent le même ordre, si bien que le texte et l'écran se lisent côte à
     côte. */
  const airesMontrees = airesParPoids ? ordreAires : airesRows;
  /* Les pastilles de la rangée : l'aire du pays, quand elle est déjà écrite
     au bout de la note, n'y revient pas une seconde fois. */
  const airesPucees = siennePuce
    ? airesMontrees.filter((row) => row.key !== siennePuce.key)
    : airesMontrees;

  /* Le rang de l'aire du pays lu parmi toutes les aires du monde, la plus
     lourde en tête et les ex æquo tranchés par le nom : la ligne posée sous
     la note dit où le pays se tient, même quand aucune aire retenue ne le
     porte. Sa part du monde se lit du même chiffre. */
  const ordreMonde = [...REGIONS_MONDE].sort((a, b) => fichesDesPays(b.pays) - fichesDesPays(a.pays)
    || t(regionMondeLabelKey(a)).localeCompare(t(regionMondeLabelKey(b)), lang));
  const sienneRangMonde = siennePuce
    ? ordreMonde.findIndex((region) => region.key === siennePuce.key) + 1
    : 0;
  const fichesMondeAires = REGIONS_MONDE
    .reduce((sum, region) => sum + fichesDesPays(region.pays), 0);
  const siennePartMonde = sienneHors && fichesMondeAires > 0
    ? Math.round((fichesDesPays(sienneHors.pays) / fichesMondeAires) * 100)
    : 0;
  /* Le rang d'une aire parmi toutes celles du monde : la copie de l'aire seule
     emporte sa place avec son poids, comme la copie de l'aire du pays. */
  const rangMondeAire = (key: RegionMondeKey): number =>
    ordreMonde.findIndex((region) => region.key === key) + 1;
  /* Les aires complètes jamais parties, rangées par place dans le monde : le
     survol de l'en-tête dit par laquelle commencer, la mieux placée d'abord,
     et la copie posée à côté emporte le même ordre — l'écran et le message
     lisent les aires de la même façon. */
  const completesMondeRangs = [...airesCompletesMondeJamais]
    .map((region) => ({
      key: region.key,
      label: t(regionMondeLabelKey(region)),
      files: fichesDesPays(region.pays),
      pays: region.pays.length,
      rang: rangMondeAire(region.key),
    }))
    .sort((a, b) => a.rang - b.rang);
  const completesMondeRangsTxt = completesMondeRangs
    .map((row) => t('cmaps.airesCompletesHeadRank')
      .replace('{region}', row.label)
      .replace('{rang}', String(row.rang))
      .replace('{n}', String(REGIONS_MONDE.length)))
    .join(' · ');
  /* Le rang du pays lu parmi les pays de son aire, la plus lourde en tête et
     les ex æquo tranchés par le nom : la pastille enfoncée le dit à côté de
     son poids, sans quitter la note. */
  const siennePaysRang = siennePuce && active
    ? [...siennePuce.pays]
      .map((code) => ({ code, files: fichesDesPays([code]) }))
      .sort((a, b) => b.files - a.files
        || nomPays(a.code, lang).localeCompare(nomPays(b.code, lang), lang))
      .findIndex((row) => row.code === active) + 1
    : 0;
  /* Les pays de l'aire ajoutée qui n'ont encore jamais été copiés seuls :
     la pastille dit combien il en reste, au lieu de laisser le geste sans
     prise sur ce qui reste à envoyer. */
  const siennePaysJamais = siennePuce
    ? siennePuce.pays.filter((code) => !seulesNote.pays.includes(code))
    : [];
  /* L'aire ajoutée de la note est complète quand tous ses pays ont déjà été
     copiés seuls : elle porte alors le même repère que ses voisines, si bien
     que la pastille ajoutée ne se lit pas autrement. */
  const sienneComplete = siennePuce
    ? siennePuce.pays.every((code) => seulesNote.pays.includes(code))
    : false;
  /* Les pays de l'aire ajoutée jamais copiés seuls, nommés un à un : le
     survol de la pastille dit lesquels restent à envoyer, au lieu de n'en
     donner que le compte. */
  const siennePaysJamaisTxt = siennePuce && siennePaysJamais.length > 0
    ? t('cmaps.airesHomeChipPaysNeverNames')
      .replace('{n}', String(siennePaysJamais.length))
      .replace('{total}', String(siennePuce.pays.length))
      .replace('{names}', siennePaysJamais.map((code) => nomPays(code, lang)).join(' · '))
    : '';
  const siennePaysTxt = active && siennePuce && siennePaysRang > 0
    ? t('cmaps.airesHomeCountryRank')
      .replace('{pays}', nomPays(active, lang))
      .replace('{rang}', String(siennePaysRang))
      .replace('{n}', String(siennePuce.pays.length))
      .replace('{files}', String(fichesDesPays([active])))
      .replace('{unit}', t('cmaps.airesChipFiles'))
    : '';

  /** La petite bascule de la note : un appui range les pastilles de la plus
      lourde à la plus légère, un second appui rend l'ordre du monde. */
  const basculerTriAires = () => {
    const versPoids = !airesParPoids;
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      if (versPoids) suivant.set(AIRES_TRI_PARAM, 'poids');
      else suivant.delete(AIRES_TRI_PARAM);
      return suivant;
    }, { replace: true });
  };

  /** La note des aires : un appui rend les vingt-deux cartes, sans fermer une
      seule fiche. */
  const rendreAires = () => {
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      suivant.delete(AIRES_MONDE_PARAM);
      suivant.delete(AIRE_SEULE_PARAM);
      suivant.delete(AIRES_TRI_PARAM);
      suivant.delete(AIRES_MENE_PARAM);
      return suivant;
    }, { replace: true });
  };

  /** La petite gomme de l'en-tête de la note : le premier appui l'arme, le
      second rend toutes les aires resserrées d'un seul geste. */
  const gommerNoteAires = () => {
    if (!noteGomme) {
      setNoteGomme(true);
      return;
    }
    rendreAires();
    setNoteGomme(false);
  };

  /** Le compteur des aires où le pays pèse le plus lourd : un appui resserre
      la carte sur elles seules, un second appui rend toutes les aires
      retenues. La grille vient d'elle-même sous les yeux, plutôt que de
      changer plus bas sans le dire. */
  const basculerAiresMene = () => {
    if (airesOuPaysMeneCles.length === 0) return;
    const versAires = !meneSeuls;
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      if (versAires) {
        suivant.set(AIRES_MENE_PARAM, '1');
        suivant.delete(AIRE_SEULE_PARAM);
      } else {
        suivant.delete(AIRES_MENE_PARAM);
      }
      return suivant;
    }, { replace: true });
    if (!versAires) return;
    window.setTimeout(() => {
      document.getElementById('cmaps-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
  };

  /** La date d'une pastille est une porte : elle rouvre la note des aires
      resserrée sur cette seule aire, et l'amène sous les yeux — ce qui a déjà
      quitté l'appareil se mesure d'un geste, sans chercher l'aire. */
  const ouvrirNoteAireSeule = (key: RegionMondeKey) => {
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      suivant.set(AIRES_MONDE_PARAM, key);
      suivant.delete(AIRE_SEULE_PARAM);
      suivant.delete(AIRES_MENE_PARAM);
      suivant.delete(AIRES_TRI_PARAM);
      return suivant;
    }, { replace: true });
    window.setTimeout(() => {
      document.getElementById('cmaps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
  };

  /** Une pastille d'aire : un appui resserre la carte sur elle seule, un
      second appui rend toutes les aires retenues — aucune ne se perd, elles
      restent écrites dans l'adresse à côté de l'aire pressée. */
  const basculerAire = (key: RegionMondeKey) => {
    if (!airesLien.includes(key)) return;
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      if (aireSeuleKey === key) suivant.delete(AIRE_SEULE_PARAM);
      else suivant.set(AIRE_SEULE_PARAM, key);
      return suivant;
    }, { replace: true });
    window.setTimeout(() => {
      document.getElementById('cmaps-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
  };

  /** La pastille de l'aire du pays, quand elle reste hors des aires
      retenues : un appui l'ajoute aux aires retenues et cadre la carte sur
      elle seule — le pays se relit dans son propre voisinage, même quand
      aucune aire n'était encore écrite dans l'adresse. */
  const cadrerSienneHors = () => {
    if (!sienneNote) return;
    /* La carte est déjà cadrée sur l'aire du pays : un nouvel appui la
       relâche, et l'aire reste écrite parmi celles retenues — la pastille
       cesse de se lire enfoncée. */
    if (sienneCadree) {
      setParams((prev) => {
        const suivant = new URLSearchParams(prev);
        suivant.delete(AIRE_SEULE_PARAM);
        return suivant;
      }, { replace: true });
      return;
    }
    const key = sienneHors ? sienneHors.key : sienneNote;
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      const retenues = airesDeLien(suivant.get(AIRES_MONDE_PARAM));
      const apres = retenues.includes(key) ? retenues : [...retenues, key];
      suivant.set(AIRES_MONDE_PARAM, apres.join(','));
      suivant.set(AIRE_SEULE_PARAM, key);
      suivant.delete(AIRES_MENE_PARAM);
      return suivant;
    }, { replace: true });
    window.setTimeout(() => {
      document.getElementById('cmaps-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
  };

  /** La porte d'une aire : la vue Carte de la page en cours, la grande carte
      déjà cadrée sur cette aire — ses régions se lisent dans le voisinage de
      leurs pays, sans reposer le cadre à la main. */
  const carteDeAire = (key: RegionMondeKey): string => {
    const suivant = new URLSearchParams(params);
    suivant.set('view', 'map');
    suivant.set(AIRE_CARTE_PARAM, key);
    return `${location.pathname}?${suivant.toString()}#board-results`;
  };

  /** L'adresse complète de la vue Carte d'une aire : le geste d'aire seule
      l'emporte, si bien que le lien se rouvre d'un clic depuis un message. */
  const carteAbsolueDeAire = (key: RegionMondeKey): string => {
    const base = typeof window === 'undefined'
      ? ''
      : `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
    return `${base}${carteDeAire(key)}`;
  };

  /** Les pays d'une aire, le plus lourd d'abord et les ex æquo tranchés par
      le nom, chacun avec son rang : le survol du geste d'aire seule les
      nomme un à un, au lieu de n'en donner que le compte. */
  const paysRangsTxt = (codes: readonly string[]): string => [...codes]
    .map((code) => ({ code, files: fichesDesPays([code]) }))
    .sort((a, b) => b.files - a.files
      || nomPays(a.code, lang).localeCompare(nomPays(b.code, lang), lang))
    .map((row, index) => t(index === 0 ? 'cmaps.airesAloneCountryRankFirst' : 'cmaps.airesAloneCountryRank')
      .replace('{pays}', nomPays(row.code, lang))
      .replace('{rang}', String(index + 1)))
    .join(' · ');

  /** Les pays d'une aire, une ligne chacun avec son rang, le plus lourd
      d'abord et les ex æquo tranchés par le nom : la copie de l'aire seule
      les emporte un à un, si bien que le message garde ses pays une fois
      collé — le survol, lui, les dit d'une seule phrase. */
  const paysLignesTxt = (codes: readonly string[]): string[] => [...codes]
    .map((code) => ({ code, files: fichesDesPays([code]) }))
    .sort((a, b) => b.files - a.files
      || nomPays(a.code, lang).localeCompare(nomPays(b.code, lang), lang))
    .map((row, index) => t(index === 0 ? 'cmaps.airesAloneCountryRowFirst' : 'cmaps.airesAloneCountryRow')
      .replace('{pays}', nomPays(row.code, lang))
      .replace('{rang}', String(index + 1))
      .replace('{n}', String(codes.length))
      /* Le poids du pays, à côté de son rang : le message collé dit ce que
         chaque pays pèse dans l'aire, sans rouvrir la carte. */
      .replace('{files}', String(row.files))
      .replace('{unit}', t('cmaps.airesChipFiles')));

  /** La gomme d'une aire : elle retire la seule aire pressée du resserrement,
      et les autres restent — les vingt-deux pays ne reviennent pas pour
      autant. La dernière aire partie, la note se tait d'elle-même. */
  const retirerAire = (key: RegionMondeKey) => {
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      const restants = airesDeLien(suivant.get(AIRES_MONDE_PARAM)).filter((cle) => cle !== key);
      if (restants.length > 0) suivant.set(AIRES_MONDE_PARAM, restants.join(','));
      else {
        suivant.delete(AIRES_MONDE_PARAM);
        suivant.delete(AIRES_TRI_PARAM);
      }
      if (suivant.get(AIRE_SEULE_PARAM) === key) suivant.delete(AIRE_SEULE_PARAM);
      return suivant;
    }, { replace: true });
  };

  /** Le compteur des pays sans le métier : un appui resserre la grille sur ces
      pays seuls, un second appui rend les vingt-deux cartes. La grille vient
      d'elle-même sous les yeux, plutôt que de changer plus bas sans le dire. */
  const basculerSansMetier = () => {
    if (!trade || paysSansMetier.length === 0) return;
    const versResserre = !sansMetierSeuls;
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      if (versResserre) suivant.set(SANS_METIER_PARAM, '1');
      else suivant.delete(SANS_METIER_PARAM);
      return suivant;
    }, { replace: true });
    if (!versResserre) return;
    window.setTimeout(() => {
      document.getElementById('cmaps-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
  };

  /** Le compteur des aires jamais cadrées : un appui ouvre ces aires seules
      sur la carte, un second appui rend les aires en cours. La grille vient
      d'elle-même sous les yeux, plutôt que de changer plus bas sans le dire. */
  const ouvrirJamaisCadrees = () => {
    if (jamaisCadrees.length === 0) return;
    const versAires = !jamaisSeules;
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      if (versAires) {
        suivant.set(AIRES_MONDE_PARAM, jamaisCadrees.join(','));
        suivant.delete(AIRE_SEULE_PARAM);
        suivant.delete(AIRES_MENE_PARAM);
      } else {
        suivant.delete(AIRES_MONDE_PARAM);
        suivant.delete(AIRE_SEULE_PARAM);
        suivant.delete(AIRES_MENE_PARAM);
      }
      return suivant;
    }, { replace: true });
    if (!versAires) return;
    window.setTimeout(() => {
      document.getElementById('cmaps-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
  };

  /** Le compteur des aires complètes jamais parties : un appui resserre la
      grille sur ces aires seules, un second appui rend les vingt-deux pays.
      La grille vient d'elle-même sous les yeux, plutôt que de changer plus
      bas sans le dire. */
  const ouvrirCompletesMonde = () => {
    if (airesCompletesMondeJamais.length === 0) return;
    const versAires = !completesMondeEnfonce;
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      if (versAires) {
        suivant.set(AIRES_MONDE_PARAM, airesCompletesMondeJamais
          .map((region) => region.key)
          .join(','));
        suivant.delete(AIRE_SEULE_PARAM);
        suivant.delete(AIRES_MENE_PARAM);
        suivant.delete(AIRES_TRI_PARAM);
      } else {
        suivant.delete(AIRES_MONDE_PARAM);
        suivant.delete(AIRE_SEULE_PARAM);
        suivant.delete(AIRES_MENE_PARAM);
      }
      return suivant;
    }, { replace: true });
    if (!versAires) return;
    window.setTimeout(() => {
      document.getElementById('cmaps-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
  };

  /** Le compteur des familles absentes : un appui resserre la bande des portes
      sur elles seules, un second appui rend les huit portes. La bande vient
      d'elle-même sous les yeux, plutôt que de changer plus bas sans le dire. */
  const basculerAbsentes = () => {
    /* Aucune famille absente : il n'y a rien à resserrer, la bande reprend
       simplement ses huit portes. */
    if (famillesAbsentes.length === 0) {
      if (!absentsSeuls) return;
      setParams((prev) => {
        const suivant = new URLSearchParams(prev);
        suivant.delete(FAM_ABSENT_PARAM);
        return suivant;
      }, { replace: true });
      return;
    }
    const versResserre = !absentsSeuls;
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      if (versResserre) suivant.set(FAM_ABSENT_PARAM, '1');
      else suivant.delete(FAM_ABSENT_PARAM);
      return suivant;
    }, { replace: true });
    if (!versResserre) return;
    window.setTimeout(() => {
      document.getElementById('fam-band')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
  };

  /* La gomme des familles ouvertes : le premier appui arme la gomme, le
     second efface la mémoire — sans jamais toucher aux pages du site.
     Laissée sans confirmation, elle se désarme d'elle-même au bout de cinq
     secondes, comme celle des feuilles emportées. */
  const [famGomme, setFamGomme] = useState(false);

  useEffect(() => {
    if (!famGomme) return;
    const timer = window.setTimeout(() => setFamGomme(false), 5000);
    return () => window.clearTimeout(timer);
  }, [famGomme]);

  /** La gomme des familles : un premier appui demande confirmation, le second
      efface. Le compteur de l'en-tête repart alors à huit portes à joindre. */
  const gommerFamilles = () => {
    if (!famGomme) {
      setFamGomme(true);
      return;
    }
    clearFamillesVues();
    setFamGomme(false);
  };

  /* Le détail par maison de chaque pays, prêt pour le tableur : la feuille
     garde le pays dans sa propre colonne, si bien que plusieurs pays
     enregistrés se collent dans le même fichier et se comparent côte à côte. */
  const countriesTrio = useMemo<TrioCountry[]>(
    () =>
      cards
        .map(({ pays, nom }) => ({
          code: pays.code,
          nom,
          rows: (TRIO_RANKING[pays.code] ?? []).slice(0, 3),
        }))
        .filter((country) => country.rows.length > 0),
    [cards],
  );

  const choisirTri = (next: Tri) => {
    setMemoTri(next);
    ecrireTri(next);
    /* The order is written in the address on every pick, so the view can be
       copied or shared and lands exactly as it is read here. */
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      suivant.set(TRI_PARAM, next);
      return suivant;
    }, { replace: true });
  };

  const basculerDeplie = (code: string) => {
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      const ouverts = (suivant.get(OPEN_PARAM) ?? '').split(',').filter(Boolean);
      const apres = ouverts.includes(code) ? ouverts.filter((c) => c !== code) : [...ouverts, code];
      if (apres.length > 0) suivant.set(OPEN_PARAM, apres.join(','));
      else suivant.delete(OPEN_PARAM);
      return suivant;
    }, { replace: true });
  };

  return (
    <section className="cmaps" id="cmaps" aria-labelledby="cmaps-title">
      <div className="cmaps-head">
        <div className="cmaps-head-txt">
          <h2 id="cmaps-title" className="cmaps-title">
            <i className="ri-earth-line" aria-hidden="true"></i>
            {t('cmaps.title')}
          </h2>
          <p className="cmaps-sub">{t('cmaps.sub')}</p>
        </div>
        <div className="cmaps-head-tools">
          {/* Le métier lu sur une page de type, absent de combien de pays de
              la carte : posé en tête de l'en-tête, il dit le manque du métier
              à l'échelle du monde arabe avant qu'on n'ouvre une carte. */}
          {trade && (
            <button
              type="button"
              className={`cmaps-tradeabsent${paysSansMetier.length === 0 ? ' is-done' : ''}${sansMetierSeuls ? ' is-on' : ''}`}
              aria-pressed={sansMetierSeuls}
              title={paysSansMetier.length === 0
                ? t('cmaps.tradeAbsentNoneHint').replace('{label}', metierLabel)
                : sansMetierSeuls
                  ? t('cmaps.tradeAbsentPicked')
                  : `${t('cmaps.tradeAbsentHint').replace('{label}', metierLabel)} ${paysSansMetier.map((code) => nomPays(code, lang)).join(' · ')} — ${t('cmaps.tradeAbsentPick')}`}
              onClick={basculerSansMetier}
            >
              <i
                className={paysSansMetier.length === 0 ? 'ri-checkbox-circle-line' : 'ri-building-4-line'}
                aria-hidden="true"
              ></i>
              {paysSansMetier.length === 0 ? (
                <span className="cmaps-tradeabsent-label">{t('cmaps.tradeAbsentNone')}</span>
              ) : (
                <>
                  <span className="cmaps-tradeabsent-label">{t('cmaps.tradeAbsent')}</span>
                  <b>{paysSansMetier.length}</b>
                  <em>/ {paysArabes.length}</em>
                </>
              )}
            </button>
          )}
          {/* Les familles que le pays lu ne tient pas du tout : posées à côté
              des familles jamais ouvertes, elles disent le manque du pays
              avant qu'on n'ouvre sa carte. */}
          {active && (
            <button
              type="button"
              className={`cmaps-famabsent${famillesAbsentes.length === 0 ? ' is-done' : ''}${absentsSeuls && famillesAbsentes.length > 0 ? ' is-on' : ''}`}
              aria-pressed={absentsSeuls && famillesAbsentes.length > 0}
              title={famillesAbsentes.length === 0
                ? t('cmaps.famAbsentNoneHint').replace('{place}', nomPays(active, lang))
                : absentsSeuls
                  ? t('cmaps.famAbsentPicked')
                  : `${t('cmaps.famAbsentHint')} ${famillesAbsentes.map((row) => t(`tradePlural.${row.trade}`)).join(' · ')} — ${t('cmaps.famAbsentPick')}`}
              onClick={basculerAbsentes}
            >
              <i
                className={famillesAbsentes.length === 0 ? 'ri-checkbox-circle-line' : 'ri-door-lock-line'}
                aria-hidden="true"
              ></i>
              {famillesAbsentes.length === 0 ? (
                <span className="cmaps-famabsent-label">
                  {t('cmaps.famAbsentNone').replace('{place}', nomPays(active, lang))}
                </span>
              ) : (
                <>
                  <span className="cmaps-famabsent-label">{t('cmaps.famAbsent')}</span>
                  <b>{famillesAbsentes.length}</b>
                  <em>/ {ANNUAIRE_FAMILLES.length}</em>
                </>
              )}
            </button>
          )}
          {/* Combien de familles n'ont encore ouvert aucune page depuis cet
              appareil : la carte dit ce qui reste à joindre, et se tait
              calmement quand les huit ont été traversées. */}
          <span
            className={`cmaps-famleft${famillesJamais.length === 0 ? ' is-done' : ''}`}
            title={famillesJamais.length === 0
              ? t('cmaps.famLeftNoneHint')
              : `${t('cmaps.famLeftHint')} ${famillesJamais.map((row) => t(`tradePlural.${row.trade}`)).join(' · ')}`}
          >
            <i
              className={famillesJamais.length === 0 ? 'ri-door-open-line' : 'ri-door-closed-line'}
              aria-hidden="true"
            ></i>
            {famillesJamais.length === 0 ? (
              <span className="cmaps-famleft-label">{t('cmaps.famLeftNone')}</span>
            ) : (
              <>
                <span className="cmaps-famleft-label">{t('cmaps.famLeft')}</span>
                <b>{famillesJamais.length}</b>
                <em>/ {ANNUAIRE_FAMILLES.length}</em>
              </>
            )}
          </span>
          {/* Les aires complètes du monde jamais parties seules : posé à côté
              des familles jamais ouvertes, le compteur dit ce qui est complet
              mais jamais parti, et le resserre d'un clic — la grille se range
              alors sur ces seules aires. */}
          {airesCompletesMonde.length > 0 && (
            <>
            {airesCompletesMondeJamais.length > 0 ? (
              <button
                type="button"
                className={`cmaps-completesleft${completesMondeEnfonce ? ' is-on' : ''}`}
                aria-pressed={completesMondeEnfonce}
                title={`${t('cmaps.airesCompletesHeadHint')
                  .replace('{n}', String(airesCompletesMondeJamais.length))
                  .replace('{total}', String(airesCompletesMonde.length))
                  .replace('{names}', completesMondeNoms)
                  .replace('{files}', String(fichesCompletesMondeJamais))
                  .replace('{unit}', t('cmaps.airesChipFiles'))} · ${t('cmaps.airesCompletesHeadRanksLead')} · ${completesMondeRangsTxt} · ${completesMondeEnfonce
                  ? t('cmaps.airesCompletesHeadPicked')
                  : t('cmaps.airesCompletesHeadOpen')
                    .replace('{n}', String(airesCompletesMondeJamais.length))
                    .replace('{names}', completesMondeNoms)}`}
                aria-label={`${t('cmaps.airesCompletesHeadHint')
                  .replace('{n}', String(airesCompletesMondeJamais.length))
                  .replace('{total}', String(airesCompletesMonde.length))
                  .replace('{names}', completesMondeNoms)
                  .replace('{files}', String(fichesCompletesMondeJamais))
                  .replace('{unit}', t('cmaps.airesChipFiles'))} · ${t('cmaps.airesCompletesHeadRanksLead')} · ${completesMondeRangsTxt} · ${completesMondeEnfonce
                  ? t('cmaps.airesCompletesHeadPicked')
                  : t('cmaps.airesCompletesHeadOpen')
                    .replace('{n}', String(airesCompletesMondeJamais.length))
                    .replace('{names}', completesMondeNoms)}`}
                onClick={ouvrirCompletesMonde}
              >
                <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
                <span className="cmaps-completesleft-label">
                  {t('cmaps.airesCompletesHead')}
                </span>
                <b>{airesCompletesMondeJamais.length}</b>
                <em>/ {airesCompletesMonde.length}</em>
              </button>
            ) : (
              <span
                className="cmaps-completesleft is-done"
                title={t('cmaps.airesCompletesHeadNoneHint')}
              >
                <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
                <span className="cmaps-completesleft-label">
                  {t('cmaps.airesCompletesHeadNone')}
                </span>
              </span>
            )}
            {/* Le geste de copie posé à côté du compteur : ces aires
                complètes partent d’un coup — leur nom, leurs fiches, leur
                rang parmi les aires du monde et l’adresse de leur vue Carte
                —, dans l’ordre de leur place dans le monde. */}
            {airesCompletesMondeJamais.length > 0 && (
              <CopyTextButton
                label={t('cmaps.airesCompletesHeadCopy')}
                hint={t('cmaps.airesCompletesHeadCopyHint')
                  .replace('{n}', String(airesCompletesMondeJamais.length))
                  .replace('{total}', String(airesCompletesMonde.length))}
                className="cmaps-sansnote-copy cmaps-completescopy"
                build={() => [
                  t('cmaps.airesCompletesHeadCopyLine')
                    .replace('{n}', String(airesCompletesMondeJamais.length))
                    .replace('{total}', String(airesCompletesMonde.length)),
                  t('cmaps.airesCompletesCopyAll'),
                  `${t('cmaps.airesCompletesHeadRanksLead')} · ${REGIONS_MONDE.length}`,
                  ...completesMondeRangs.map((row) => t('cmaps.airesCompletesCopyRow')
                    .replace('{region}', row.label)
                    .replace('{files}', String(row.files))
                    .replace('{unit}', t('cmaps.airesChipFiles'))
                    .replace('{rang}', t('cmaps.aireFrameCopyHomeRank')
                      .replace('{rang}', String(row.rang))
                      .replace('{n}', String(REGIONS_MONDE.length)))),
                  ...completesMondeRangs.map((row) => t('cmaps.airesAloneCopyMap')
                    .replace('{url}', carteAbsolueDeAire(row.key))),
                ].join('\n')}
                onCopied={() => markAiresCompletesCopied()}
              />
            )}
            {/* Combien de fois ces aires complètes ont été copiées, et le jour
                de la dernière : posé à côté du compteur, le chiffre se relit
                comme celui des tournées, sans rouvrir une seule pastille. */}
            {completesNote.count > 0 && (
              <span
                className="cmaps-aires-completes-copies"
                title={`${t('cmaps.aireFrameCompletesCopiesHint')
                  .replace('{date}', dateCompletes)} · ${t('cmaps.aireFrameCompletesCopiesGestures')}`}
              >
                <i className="ri-file-copy-2-line" aria-hidden="true"></i>
                <b>{completesNote.count}</b>
                <span className="cmaps-aires-completes-copies-label">
                  {t('cmaps.aireFrameCompletesCopiesCount')}
                </span>
                <em className="cmaps-aires-completes-copies-last">
                  {t('cmaps.aireFrameCopiesLast').replace('{date}', dateCompletes)}
                </em>
              </span>
            )}
            </>
          )}
          {/* La gomme des familles ouvertes : posée à côté du compteur, elle
              n'efface rien au premier appui — elle demande confirmation, puis
              repart d'un carnet vide. */}
          {famillesVues.length > 0 && (
            <button
              type="button"
              className={`cmaps-famclear${famGomme ? ' is-armed' : ''}`}
              aria-pressed={famGomme}
              title={famGomme ? t('cmaps.famClearConfirmHint') : t('cmaps.famClearHint')}
              aria-label={famGomme ? t('cmaps.famClearConfirmHint') : t('cmaps.famClearHint')}
              onClick={gommerFamilles}
            >
              <i className="ri-eraser-line" aria-hidden="true"></i>
              {famGomme && (
                <span className="cmaps-famclear-ask whitespace-nowrap">
                  {t('cmaps.famClearConfirm')}
                </span>
              )}
            </button>
          )}
          <label className="cmaps-sort" title={t('cmaps.sortShare')}>
            <i className="ri-sort-desc" aria-hidden="true"></i>
            <span className="cmaps-sort-label">{t('cmaps.sort')}</span>
            <span className="cmaps-sort-field">
              <select
                value={tri}
                onChange={(event) => choisirTri(event.target.value as Tri)}
                aria-label={t('cmaps.sort')}
              >
                <option value="activite">{t('cmaps.sortActivity')}</option>
                <option value="regions">{t('cmaps.sortRegions')}</option>
                <option value="nom">{t('cmaps.sortName')}</option>
              </select>
              <i className="ri-arrow-down-s-line" aria-hidden="true"></i>
            </span>
          </label>
          {/* Le détail par maison de tous les pays d'un coup : une seule feuille
              où chaque pays garde sa colonne, pour les comparer côte à côte
              dans le tableur au lieu de les ouvrir un par un. */}
          <TrioCsvButton
            countries={countriesTrio}
            label={t('cmaps.trioCsvAll')}
            hint={t('cmaps.trioCsvAllHint')}
            className="cmaps-csv"
            onExported={noterExport}
          />
          {/* Combien de feuilles ont déjà été emportées : le compteur suit les
              téléchargements de la visite et ceux d'avant, sans redemander le
              compte — une feuille partie reste partie. Il s'ouvre d'un clic
              pour relire les pays, et sa gomme remet le compte à zéro. */}
          {exportes.length > 0 && (
            <span className="cmaps-csvwrap">
              <button
                type="button"
                className={`cmaps-csvcount${csvOuvert ? ' is-open' : ''}`}
                title={t('cmaps.csvCountOpenHint')}
                aria-expanded={csvOuvert}
                aria-controls="cmaps-csv-list"
                onClick={() => setCsvOuvert((prev) => !prev)}
              >
                <i className="ri-file-excel-2-line" aria-hidden="true"></i>
                <b>{exportes.length}</b>
                <span>{t('cmaps.csvCount')}</span>
                {/* Combien de ces feuilles ont été copiées plutôt que
                    téléchargées : le constat se lit à côté du total, sans
                    ouvrir le panneau. */}
                {copies > 0 && (
                  <em className="cmaps-csvcount-copied" title={t('cmaps.csvCopiedHint')}>
                    · {copies} {t('cmaps.csvCopied')}
                  </em>
                )}
                <i
                  className={csvOuvert ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                  aria-hidden="true"
                ></i>
              </button>
              {/* Les pays déjà emportés, nommés un par un, et la gomme qui
                  repart de zéro — les fichiers déjà téléchargés, eux, ne
                  bougent pas. */}
              {csvOuvert && (
                <div className="cmaps-csvpanel" id="cmaps-csv-list">
                  <p className="cmaps-csvpanel-lead">
                    <i className="ri-list-check" aria-hidden="true"></i>
                    <span>{t('cmaps.csvList')}</span>
                  </p>
                  <ul className="cmaps-csvpanel-list">
                    {exportes.map((code) => (
                      <li key={code}>
                        <i className="ri-file-excel-2-line" aria-hidden="true"></i>
                        <span>{nomsPays.get(code) ?? code}</span>
                      </li>
                    ))}
                  </ul>
                  {/* Le départ du jour, juste sous les pays : la ligne dit
                      combien sont partis aujourd'hui — et elle part avec la
                      liste copiée, pour que le message porte le même compte. */}
                  <p className="cmaps-csvpanel-today" title={t('cmaps.csvTodayLineHint')}>
                    <i className="ri-sun-line" aria-hidden="true"></i>
                    <span>
                      {t('cmaps.csvTodayLine').replace('{n}', String(exportesJour.length))}
                    </span>
                    {exportesJour.length > 0 && (
                      <em>
                        {exportesJour
                          .map((code) => nomsPays.get(code) ?? code)
                          .join(' · ')}
                      </em>
                    )}
                  </p>
                  {/* La semaine, dans le même esprit que le jour : les pays
                      dont la feuille est partie depuis lundi, nommés sous
                      leur compte — et la ligne part avec la liste copiée. */}
                  {exportesSemaine.length > 0 ? (
                    <button
                      type="button"
                      className="cmaps-csvpanel-today cmaps-csvpanel-week cmaps-csvpanel-weekbtn"
                      aria-pressed={csvScope === 'week'}
                      title={`${t('cmaps.csvWeekLineHint')} ${t('cmaps.csvWeekLineClick')}`}
                      onClick={() => setCsvScope(csvScope === 'week' ? '' : 'week')}
                    >
                      <i className="ri-calendar-2-line" aria-hidden="true"></i>
                      <span>
                        {t('cmaps.csvWeekLine').replace('{n}', String(exportesSemaine.length))}
                      </span>
                      <em>
                        {exportesSemaine
                          .map((code) => nomsPays.get(code) ?? code)
                          .join(' · ')}
                      </em>
                    </button>
                  ) : (
                    <p className="cmaps-csvpanel-today cmaps-csvpanel-week" title={t('cmaps.csvWeekLineHint')}>
                      <i className="ri-calendar-2-line" aria-hidden="true"></i>
                      <span>
                        {t('cmaps.csvWeekLine').replace('{n}', String(exportesSemaine.length))}
                      </span>
                    </p>
                  )}
                  {/* Le départ du jour se copie seul, quand il y a lieu : le
                      message n'emporte alors que les pays partis aujourd'hui,
                      sans la liste entière. */}
                  {exportesJour.length > 0 && (
                    <CopyTextButton
                      label={t('cmaps.csvCopyToday')}
                      hint={t('cmaps.csvCopyTodayHint')}
                      className="cmaps-csvcopy cmaps-csvcopy--today"
                      build={() => [
                        t('cmaps.csvTodayLine').replace('{n}', String(exportesJour.length)),
                        ...exportesJour.map((code) => `- ${nomsPays.get(code) ?? code}`),
                      ].join('\n')}
                      /* Une feuille copiée n'est pas seulement téléchargée :
                         le compteur le dit à côté du total. */
                      onCopied={() => setCopies(markCopiedSheet())}
                    />
                  )}
                  {/* La liste se joint à un message : elle se copie en texte,
                      un pays par ligne, la ligne du jour comprise — le
                      collègue sait ce qui est déjà parti, et ce qui vient de
                      partir, sans ouvrir la carte. */}
                  <CopyTextButton
                    label={t('cmaps.csvCopyList')}
                    hint={t('cmaps.csvCopyListHint')}
                    className="cmaps-csvcopy"
                    build={() => [
                      `${t('cmaps.csvList')} · ${exportes.length}`,
                      t('cmaps.csvTodayLine').replace('{n}', String(exportesJour.length)),
                      t('cmaps.csvWeekLine').replace('{n}', String(exportesSemaine.length)),
                      ...exportes.map((code) => `- ${nomsPays.get(code) ?? code}`),
                    ].join('\n')}
                    onCopied={() => setCopies(markCopiedSheet())}
                  />
                  {/* Annoncer le seul compte des copies à un collègue : le
                      chiffre se colle tel quel, avec le total exporté à côté
                      pour que le rapport entre les deux se lise d'un coup. */}
                  {copies > 0 && (
                    <CopyTextButton
                      label={t('cmaps.csvCopyCopied')}
                      hint={t('cmaps.csvCopyCopiedHint')}
                      className="cmaps-csvcopy cmaps-csvcopy--copies"
                      build={() => [
                        t('cmaps.csvCopiedLine').replace('{n}', String(copies)),
                        `${t('cmaps.csvCount')} · ${exportes.length}`,
                      ].join('\n')}
                    />
                  )}
                  <div className="cmaps-csvpanel-foot">
                    <button
                      type="button"
                      className="cmaps-csvpanel-clear"
                      title={t('cmaps.csvClearHint')}
                      onClick={effacerExportes}
                    >
                      <i className="ri-eraser-line" aria-hidden="true"></i>
                      <span className="whitespace-nowrap">{t('cmaps.csvClear')}</span>
                    </button>
                    <button
                      type="button"
                      className="cmaps-csvpanel-close"
                      title={t('cmaps.csvListHint')}
                      aria-label={t('cmaps.csvListHint')}
                      onClick={() => setCsvOuvert(false)}
                    >
                      <i className="ri-close-line" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              )}
            </span>
          )}
          {/* La lecture de la grille : tout, ce qui est déjà parti, ou ce qui
              reste à emporter — le compteur ne dit plus seulement combien,
              il ouvre la carte sur ces pays-là. */}
          {exportes.length > 0 && (
            <div className="cmaps-csvscope" role="group" aria-label={t('cmaps.csvFilterAll')}>
              <button
                type="button"
                className="cmaps-csvscope-btn"
                aria-pressed={csvScope === ''}
                title={t('cmaps.csvFilterAllHint')}
                onClick={() => setCsvScope('')}
              >
                <span className="whitespace-nowrap">{t('cmaps.csvFilterAll')}</span>
              </button>
              <button
                type="button"
                className="cmaps-csvscope-btn"
                aria-pressed={csvScope === 'done'}
                title={t('cmaps.csvFilterDoneHint')}
                onClick={() => setCsvScope(csvScope === 'done' ? '' : 'done')}
              >
                <i className="ri-file-excel-2-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('cmaps.csvFilterDone')}</span>
                <b>{exportes.length}</b>
              </button>
              {/* Le départ du jour, à côté des feuilles déjà parties : la
                  grille se resserre sur les pays exportés aujourd'hui, puis
                  s'élargit d'un second clic. */}
              {exportesJour.length > 0 && (
                <button
                  type="button"
                  className="cmaps-csvscope-btn"
                  aria-pressed={csvScope === 'today'}
                  title={t('cmaps.csvFilterTodayHint')}
                  onClick={() => setCsvScope(csvScope === 'today' ? '' : 'today')}
                >
                  <i className="ri-sun-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('cmaps.csvFilterToday')}</span>
                  <b>{exportesJour.length}</b>
                </button>
              )}
              {/* La semaine, à côté du jour : la grille se resserre sur les
                  pays partis depuis lundi, comme la ligne du panneau le fait
                  déjà d'un clic. */}
              {exportesSemaine.length > 0 && (
                <button
                  type="button"
                  className="cmaps-csvscope-btn"
                  aria-pressed={csvScope === 'week'}
                  title={t('cmaps.csvFilterWeekHint')}
                  onClick={() => setCsvScope(csvScope === 'week' ? '' : 'week')}
                >
                  <i className="ri-calendar-2-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('cmaps.csvFilterWeek')}</span>
                  <b>{exportesSemaine.length}</b>
                </button>
              )}
              <button
                type="button"
                className="cmaps-csvscope-btn"
                aria-pressed={csvScope === 'todo'}
                title={t('cmaps.csvFilterTodoHint')}
                onClick={() => setCsvScope(csvScope === 'todo' ? '' : 'todo')}
              >
                <i className="ri-download-2-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('cmaps.csvFilterTodo')}</span>
                <b>{resteAEmporter}</b>
              </button>
            </div>
          )}
          {/* Depuis combien de temps rien n'a été emporté : posé à côté du
              filtre, il dit l'ancienneté du dernier export avant qu'on ne
              rouvre une carte. */}
          {lastExportAt !== null && (
            <span className="cmaps-csvago" title={t('cmaps.csvAgoHint')}>
              <i className="ri-history-line" aria-hidden="true"></i>
              <span>{t('cmaps.csvAgo').replace('{ago}', tempsDepuis(lastExportAt, lang, horloge))}</span>
            </span>
          )}
        </div>
      </div>

      {/* La grille resserrée sur les pays sans le métier le dit, et se rend
          d'un geste : le manque se lit, puis s'efface au lieu de rester une
          vue sans sortie. */}
      {sansMetierSeuls && (
        <p className="cmaps-sansnote" role="status">
          <i className="ri-filter-3-line" aria-hidden="true"></i>
          <span>
            {t('cmaps.tradeAbsentNarrow')
              .replace('{n}', String(paysSansMetier.length))
              .replace('{label}', metierLabel)}
          </span>
          {/* Ce que ces pays tiennent tout de même, toutes familles
              confondues : le manque se lit contre le répertoire entier, au
              lieu de rester une grille de cartes vides. */}
          <span className="cmaps-sansnote-files" title={t('cmaps.tradeAbsentFilesHint')}>
            <i className="ri-file-list-3-line" aria-hidden="true"></i>
            <b>{filesSansMetier}</b>
            <span>{t('cmaps.tradeAbsentFiles')}</span>
          </span>
          <button
            type="button"
            className="cmaps-sansnote-off"
            title={t('cmaps.tradeAbsentRestoreHint')}
            onClick={basculerSansMetier}
          >
            <i className="ri-refresh-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('cmaps.tradeAbsentRestore')}</span>
          </button>
          {/* Les adresses de ces pays, prêtes à coller dans un document : le
              collègue retrouve chaque page de pays, le métier déjà lu, sans
              reconstruire un seul lien. */}
          <CopyTextButton
            label={t('cmaps.tradeAbsentCopyLinks')}
            hint={t('cmaps.tradeAbsentCopyLinksHint').replace('{label}', metierLabel)}
            className="cmaps-sansnote-copy"
            build={() => {
              const base = typeof window === 'undefined'
                ? ''
                : `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
              return [
                t('cmaps.tradeAbsentCopyLinksLine')
                  .replace('{label}', metierLabel)
                  .replace('{n}', String(paysSansMetier.length)),
                ...paysSansMetier
                  .filter((code) => slugPays(code))
                  .map((code) => `${base}/annuaire/${slugDeTrade(trade)}/${slugPays(code)}`),
              ].join('\n');
            }}
          />
        </p>
      )}

      {/* La carte resserrée sur les aires du monde le dit, et se rend d'un
          geste : le manque se lit à l'échelle de l'aire, puis s'efface au lieu
          de rester une vue sans sortie. */}
      {airesLien.length > 0 && (
        <div
          className="cmaps-sansnote cmaps-airesnote"
          role="status"
          title={`${airesNoms} — ${t('cmaps.airesRestoreHint')}`}
        >
          <i className="ri-focus-3-line" aria-hidden="true"></i>
          <span>
            {t('cmaps.airesNarrow')
              .replace('{n}', String(airesActives.length))
              .replace('{pays}', String(cartesGrille.length))}
          </span>
          {/* La petite gomme de l'en-tête : elle rend d'un geste toutes les
              aires resserrées — les vingt-deux cartes reviennent, aucune
              fiche ne se ferme. Le premier appui l'arme, le second efface. */}
          <button
            type="button"
            className={`cmaps-airesnote-erase${noteGomme ? ' is-armed' : ''}`}
            aria-pressed={noteGomme}
            title={noteGomme
              ? t('cmaps.airesNoteEraseConfirmHint')
              : `${t('cmaps.airesNoteEraseCount')
                .replace('{n}', String(airesRows.length))
                .replace('{files}', String(filesNote))
                .replace('{unit}', t('cmaps.airesChipFiles'))} · ${t('cmaps.airesNoteEraseHint')}`}
            aria-label={noteGomme
              ? t('cmaps.airesNoteEraseConfirmHint')
              : t('cmaps.airesNoteEraseCount')
                .replace('{n}', String(airesRows.length))
                .replace('{files}', String(filesNote))
                .replace('{unit}', t('cmaps.airesChipFiles'))}
            onClick={gommerNoteAires}
          >
            <i className="ri-eraser-line" aria-hidden="true"></i>
            {noteGomme && (
              <span className="whitespace-nowrap">{t('cmaps.airesNeverClearConfirm')}</span>
            )}
          </button>
          {/* Chaque aire retenue portée par sa propre pastille : son nom et le
              nombre de fiches qu'elle tient, toutes familles confondues — le
              Maghreb et le golfe se comparent d'un regard. La pastille
              s'appuie : un appui resserre la carte sur cette seule aire, un
              second appui rend toutes les aires retenues. Sa gomme, à côté du
              nom, retire l'aire du resserrement sans rendre les vingt-deux
              pays. Le survol nomme les pays de l'aire où le métier n'a aucun
              atelier. */}
          <ul className="cmaps-aires-chips">
            {airesPucees.map((row) => {
              const seule = aireSeuleKey === row.key;
              /* L'aire complète : le même repère que la pastille de sa
                 rangée sur une page de pays, pour que les deux se lisent
                 exactement pareil. */
              const complete = row.complete;
              /* L'aire du pays lu, et le repère qui la suit quand le tri de
                 poids l'a fait descendre : l'anneau et l'épingle de sa propre
                 page, pour que les deux rangées se lisent pareil. */
              const sienne = Boolean(active) && row.key === sienneNote;
              const deplacee = airesParPoids && sienne && rangAire(row.key) > 1;
              /* La part de l'aire dans les fiches de la note : la barre la
                 dessine, et le survol la dit en clair — la plus lourde se
                 voit sans lire les chiffres. */
              const part = partAire(row.files);
              const rang = rangAire(row.key);
              /* La part de l'aire dans les pays du monde : le survol la situe
                 elle-même, à côté de son poids dans les fiches de la note. */
              const partMonde = paysArabes.length > 0
                ? Math.round((row.pays / paysArabes.length) * 100)
                : 0;
              /* Le jour de la dernière copie de cette aire, tous gestes
                 confondus : la pastille le porte elle-même, au lieu de le
                 laisser au seul survol. */
              const dateAire = jourCopieDate(airesJours[row.key] ?? null, lang);
              /* Le survol dit les deux versants de l'aire : ses pays où le
                 métier est tenu, puis ceux qui en sont privés — le manque se
                 lit contre l'activité, pas contre un vide sans échelle. */
              const tenus = trade
                ? `${t('cmaps.airesChipHeld').replace('{n}', String(row.tenus))}${row.tenusNoms.length > 0 ? ` (${row.tenusNoms.join(' · ')})` : ''}`
                : '';
              /* La part du pays lu dans cette aire : le survol la nomme, pour
                 que le pays se situe dans le voisinage sans quitter la note. */
              const paysPartTxt = row.paysPart !== null && active
                ? (row.paysRang !== null
                  ? t('cmaps.airesChipCountryRank')
                    .replace('{pays}', nomPays(active, lang))
                    .replace('{rang}', String(row.paysRang))
                    .replace('{n}', String(row.pays))
                    .replace('{pct}', String(row.paysPart))
                  : t('cmaps.airesChipCountryShare')
                    .replace('{pays}', nomPays(active, lang))
                    .replace('{pct}', String(row.paysPart)))
                : '';
              const survol = `${row.label} · ${row.pays} ${t('cmaps.airesChipCountries')} · ${t('cmaps.airesChipWorld').replace('{n}', String(row.pays)).replace('{total}', String(paysArabes.length)).replace('{pct}', String(partMonde))} · ${row.files} ${t('cmaps.airesChipFiles')} · ${t('cmaps.airesChipShare').replace('{pct}', String(part))}${dateAire ? ` · ${t('cmaps.airesChipLastCopy').replace('{date}', dateAire)}` : ''}${paysPartTxt ? ` · ${paysPartTxt}` : ''}${tenus ? ` · ${tenus}` : ''}${row.manquantsNoms.length > 0
                ? ` — ${t('cmaps.airesChipMissing')} ${row.manquantsNoms.join(' · ')}`
                : ` — ${t('cmaps.airesChipNone')}`}`;
              return (
                <li key={row.key} className="cmaps-aire-item">
                  <span className={`cmaps-aire-chip${seule ? ' is-on' : ''}${sienne ? ' is-home' : ''}${deplacee ? ' is-moved' : ''}${complete ? ' is-complete' : ''}`}>
                    <button
                      type="button"
                      className="cmaps-aire-pick"
                      aria-pressed={seule}
                      title={`${deplacee ? `${t('cmaps.aireFrameHomeMoved')} · ` : ''}${survol}${complete ? ` — ${t('cmaps.aireFrameComplete')}` : ''} — ${seule ? t('cmaps.airesChipPicked') : t('cmaps.airesChipPick')}`}
                      onClick={() => basculerAire(row.key)}
                    >
                      <i className="ri-map-2-line" aria-hidden="true"></i>
                      <span className="cmaps-aire-chip-name">{row.label}</span>
                      <b>{row.files}</b>
                      <em>{t('cmaps.airesChipFiles')}</em>
                      {/* Le repère d'aire complète : le même signe que la
                          pastille de sa rangée, pour retrouver d'un regard
                          une aire dont tous les pays sont déjà partis. */}
                      {complete && (
                        <button
                          type="button"
                          className="cmaps-aire-complete"
                          aria-pressed={seule}
                          title={`${t('cmaps.aireFrameComplete')} · ${completesCocheTxt} — ${seule ? t('cmaps.airesChipPicked') : t('cmaps.aireCompletePick')}`}
                          aria-label={`${t('cmaps.aireFrameComplete')} · ${completesCocheTxt} — ${seule ? t('cmaps.airesChipPicked') : t('cmaps.aireCompletePick')}`}
                          onClick={() => basculerAire(row.key)}
                        >
                          <i className="ri-checkbox-circle-fill" aria-hidden="true"></i>
                        </button>
                      )}
                      {/* L'épingle de l'aire du pays : le même signe que la
                          rangée d'une page de pays quand le tri la déplace. */}
                      {deplacee && (
                        <i className="ri-map-pin-2-fill cmaps-aire-moved" aria-hidden="true"></i>
                      )}
                      {/* La part du pays lu dans les fiches de l'aire, posée
                          au bout de la pastille : le pays se lit dans son
                          voisinage, aire par aire. */}
                      {row.paysPart !== null && active && (
                        <span className="cmaps-aire-country" title={paysPartTxt}>
                          {row.paysPart}%
                        </span>
                      )}
                    </button>
                    {/* Le jour de la dernière copie de l'aire, à côté du corps
                        de la pastille : un appui rouvre la note resserrée sur
                        cette seule aire — la date elle-même est la porte. */}
                    {dateAire && (
                      <button
                        type="button"
                        className="cmaps-aire-date"
                        title={`${t('cmaps.airesChipDateDoor').replace('{region}', row.label)} · ${t('cmaps.airesChipLastCopy').replace('{date}', dateAire)}`}
                        aria-label={t('cmaps.airesChipDateDoor').replace('{region}', row.label)}
                        onClick={() => ouvrirNoteAireSeule(row.key)}
                      >
                        <i className="ri-time-line" aria-hidden="true"></i>
                        {dateAire}
                        <i className="ri-arrow-right-up-line cmaps-aire-date-go" aria-hidden="true"></i>
                      </button>
                    )}
                    {/* La petite barre de part est devenue un geste : sa
                        largeur dit le poids de l'aire dans les fiches de la
                        note, et un appui dessus resserre la carte sur elle
                        seule — la plus lourde se repère et se presse d'un
                        même mouvement. */}
                    <button
                      type="button"
                      className="cmaps-aire-bar"
                      aria-pressed={seule}
                      /* Le survol dit la part de l'aire, son rang, puis le
                         rang et la part du pays lu côte à côte — les deux
                         chiffres du pays se lisent d'une même phrase. */
                      title={`${t('cmaps.airesBarMeasure')
                        .replace('{files}', String(row.files))
                        .replace('{total}', String(filesNote))
                        .replace('{unit}', t('cmaps.airesChipFiles'))
                        .replace('{pct}', partAireExacte(row.files))} · ${t('cmaps.airesBarPick').replace('{region}', row.label)} · ${t('cmaps.airesChipShare').replace('{pct}', String(part))} · ${t('cmaps.airesChipRank').replace('{rang}', String(rang)).replace('{n}', String(airesRows.length))}${row.paysRang !== null && row.paysPart !== null && active
                        ? ` · ${t('cmaps.airesBarCountry')
                          .replace('{pays}', nomPays(active, lang))
                          .replace('{rang}', String(row.paysRang))
                          .replace('{n}', String(row.pays))
                          .replace('{pct}', String(row.paysPart))}`
                        : ''}`}
                      aria-label={`${t('cmaps.airesBarPick').replace('{region}', row.label)} · ${t('cmaps.airesChipRank').replace('{rang}', String(rang)).replace('{n}', String(airesRows.length))}`}
                      onClick={() => basculerAire(row.key)}
                    >
                      <span
                        className={`cmaps-aire-share${seule ? ' is-on' : ''}`}
                        aria-hidden="true"
                      >
                        <span
                          className="cmaps-aire-share-fill"
                          style={{ width: `${part}%` }}
                        ></span>
                      </span>
                    </button>
                    {/* Le geste de l'aire seule, à côté de la pastille : cette
                        aire, son nom, sa place parmi les aires du monde et son
                        poids — sans la moindre autre aire. */}
                    <CopyTextButton
                      label={t('cmaps.airesAloneCopy')}
                      hint={`${t('cmaps.airesAloneCopyHint').replace('{region}', row.label)} · ${t('cmaps.airesAloneCountriesRank')
                        .replace('{n}', String(row.pays))
                        .replace('{ranks}', paysRangsTxt(REGIONS_MONDE.find((region) => region.key === row.key)?.pays ?? []))}`}
                      className="cmaps-aire-alone"
                      onCopied={() => setSeulesNote(markAireSeuleCopied(row.key, active))}
                      build={() => {
                        const unit = t('cmaps.airesChipFiles');
                        const pct = fichesMondeAires > 0
                          ? Math.round((row.files / fichesMondeAires) * 100)
                          : 0;
                        return [
                          t('cmaps.airesAloneCopyLine').replace('{region}', row.label),
                          `${t('cmaps.aireFrameCopyHomeRank')
                            .replace('{rang}', String(rangMondeAire(row.key)))
                            .replace('{n}', String(REGIONS_MONDE.length))} · ${t('cmaps.aireFrameCopyHomeCountries')
                            .replace('{n}', String(row.pays))}`,
                          t('cmaps.aireFrameCopyHomeWeight')
                            .replace('{files}', String(row.files))
                            .replace('{unit}', unit)
                            .replace('{pct}', String(pct))
                            .replace('{bar}', barreDePartTexte(pct)),
                          /* Les pays de l'aire, une ligne chacun avec son
                             rang : une fois le message collé, ils ne se
                             perdent pas. */
                          t('cmaps.airesAloneCountriesHead')
                            .replace('{n}', String(row.pays)),
                          ...paysLignesTxt(REGIONS_MONDE.find((region) => region.key === row.key)?.pays ?? []),
                          /* Le total des fiches de l'aire, sous ses pays : la
                             somme du message collé s'y vérifie. */
                          t('cmaps.airesAloneCountriesTotal')
                            .replace('{files}', String(row.files))
                            .replace('{unit}', unit),
                          /* La part de ce total dans les fiches du monde,
                             posée sous ses pays : le message collé se
                             vérifie aussi à l'échelle du monde. */
                          t('cmaps.airesAloneTotalWorld').replace('{pct}', String(pct)),
                          /* L'adresse de la vue Carte, prête à coller : le
                             cadre se rouvre d'un clic au lieu de se reposer
                             à la main. */
                          t('cmaps.airesAloneCopyMap').replace('{url}', carteAbsolueDeAire(row.key)),
                        ].join('\n');
                      }}
                    />
                    {/* La porte de l'aire : la vue Carte s'ouvre déjà cadrée
                        sur elle, ses régions lues dans le voisinage de leurs
                        pays — le cadre se rouvre au lieu de se reposer. */}
                    <Link
                      className="cmaps-aire-map"
                      to={carteDeAire(row.key)}
                      title={t('cmaps.airesChipMapHint').replace('{region}', row.label)}
                      aria-label={t('cmaps.airesChipMapHint').replace('{region}', row.label)}
                      onClick={() => {
                        /* La carte cadrée vient sous les yeux, plutôt que de
                           changer plus haut sans le dire. */
                        window.setTimeout(() => {
                          document.getElementById('board-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 220);
                      }}
                    >
                      <i className="ri-road-map-line" aria-hidden="true"></i>
                    </Link>
                    {/* La gomme de l'aire : elle ne retire qu'elle, et les
                        autres aires retenues restent — le resserrement se
                        resserre au lieu de se rendre d'un coup. */}
                    <button
                      type="button"
                      className="cmaps-aire-wipe"
                      title={t('cmaps.airesChipWipe').replace('{region}', row.label)}
                      aria-label={t('cmaps.airesChipWipe').replace('{region}', row.label)}
                      onClick={() => retirerAire(row.key)}
                    >
                      <i className="ri-close-line" aria-hidden="true"></i>
                    </button>
                  </span>
                </li>
              );
            })}
            {/* Le pays lu n'est dans aucune aire retenue : sa propre aire
                s'ajoute au bout de la note, épinglée et entourée comme sur
                sa page quand le tri de poids la déplace — elle se retrouve
                sans la lire. */}
            {siennePuce && (
              <li key={siennePuce.key} className="cmaps-aire-item">
                <span className={`cmaps-aire-chip is-home is-moved${sienneCadree ? ' is-on' : ''}${sienneComplete ? ' is-complete' : ''}`}>
                  {/* La pastille se presse : elle ajoute l'aire du pays aux
                      aires retenues et cadre la carte sur elle seule, même
                      quand l'aire restait hors des aires retenues. */}
                  <button
                    type="button"
                    className="cmaps-aire-home-static"
                    aria-pressed={sienneCadree}
                    title={`${t('cmaps.airesHomeChip')
                      .replace('{rang}', String(sienneRangMonde))
                      .replace('{n}', String(REGIONS_MONDE.length))}${siennePaysTxt ? ` · ${siennePaysTxt}` : ''} · ${t('cmaps.airesHomeChipSeules').replace('{n}', String(seulesDansNote)).replace('{total}', String(airesRows.length))}${siennePaysJamaisTxt ? ` · ${siennePaysJamaisTxt}` : ''} — ${sienneCadree
                      ? t('cmaps.airesHomeOutsideOn')
                      : `${t('cmaps.airesHomeOutsideHint')} ${t('cmaps.airesHomeOutsidePick')}`}`}
                    aria-label={`${t('cmaps.airesHomeChip')
                      .replace('{rang}', String(sienneRangMonde))
                      .replace('{n}', String(REGIONS_MONDE.length))}${siennePaysTxt ? ` · ${siennePaysTxt}` : ''} · ${t('cmaps.airesHomeChipSeules').replace('{n}', String(seulesDansNote)).replace('{total}', String(airesRows.length))}${siennePaysJamaisTxt ? ` · ${siennePaysJamaisTxt}` : ''} — ${sienneCadree
                      ? t('cmaps.airesHomeOutsideOn')
                      : t('cmaps.airesHomeOutsidePick')}`}
                    onClick={cadrerSienneHors}
                  >
                    <i className="ri-map-2-line" aria-hidden="true"></i>
                    <span className="cmaps-aire-chip-name">
                      {t(regionMondeLabelKey(siennePuce))}
                    </span>
                    <b>{fichesDesPays(siennePuce.pays)}</b>
                    <em>{t('cmaps.airesChipFiles')}</em>
                    {/* Le repère d'aire complète : la pastille ajoutée le
                        porte comme ses voisines, pour que la rangée se lise
                        d'un seul tenant. */}
                    {sienneComplete && (
                      <span
                        className="cmaps-aire-complete"
                        title={`${t('cmaps.aireFrameComplete')} · ${completesCocheTxt}`}
                        aria-label={`${t('cmaps.aireFrameComplete')} · ${completesCocheTxt}`}
                      >
                        <i className="ri-checkbox-circle-fill" aria-hidden="true"></i>
                      </span>
                    )}
                    {/* Les pays de cette aire encore jamais copiés seuls :
                        le chiffre dit ce qui reste à envoyer, à côté du
                        poids de l'aire. */}
                    {siennePaysJamais.length > 0 && (
                      <span
                        className="cmaps-aire-never"
                        title={siennePaysJamaisTxt
                          || t('cmaps.airesHomeChipPaysNever')
                            .replace('{n}', String(siennePaysJamais.length))
                            .replace('{total}', String(siennePuce.pays.length))}
                      >
                        <i className="ri-global-line" aria-hidden="true"></i>
                        {siennePaysJamais.length}
                      </span>
                    )}
                    <i className="ri-map-pin-2-fill cmaps-aire-moved" aria-hidden="true"></i>
                    <i
                      className={sienneCadree ? 'ri-checkbox-circle-line cmaps-aire-home-go' : 'ri-focus-3-line cmaps-aire-home-go'}
                      aria-hidden="true"
                    ></i>
                  </button>
                  {/* Le jour de la dernière copie de l'aire ajoutée est une
                      porte lui aussi : il rouvre la note resserrée sur cette
                      seule aire, comme sur les pastilles voisines. */}
                  {jourCopieDate(airesJours[siennePuce.key] ?? null, lang) && (
                    <button
                      type="button"
                      className="cmaps-aire-date"
                      title={`${t('cmaps.airesChipDateDoor').replace('{region}', t(regionMondeLabelKey(siennePuce)))} · ${t('cmaps.airesChipLastCopy').replace('{date}', jourCopieDate(airesJours[siennePuce.key] ?? null, lang))}`}
                      aria-label={t('cmaps.airesChipDateDoor').replace('{region}', t(regionMondeLabelKey(siennePuce)))}
                      onClick={() => ouvrirNoteAireSeule(siennePuce.key)}
                    >
                      <i className="ri-time-line" aria-hidden="true"></i>
                      {jourCopieDate(airesJours[siennePuce.key] ?? null, lang)}
                      <i className="ri-arrow-right-up-line cmaps-aire-date-go" aria-hidden="true"></i>
                    </button>
                  )}
                  {/* Le geste de l'aire seule, posé dans la pastille ajoutée :
                      l'aire du pays s'emporte elle aussi, sans la moindre
                      autre aire — la note n'a plus aucune aire sans copie. */}
                  <CopyTextButton
                    label={t('cmaps.airesAloneCopy')}
                    hint={`${t('cmaps.airesAloneCopyHint').replace('{region}', t(regionMondeLabelKey(siennePuce)))} · ${t('cmaps.airesAloneCountriesRank')
                      .replace('{n}', String(siennePuce.pays.length))
                      .replace('{ranks}', paysRangsTxt(siennePuce.pays))}`}
                    className="cmaps-aire-alone"
                    onCopied={() => setSeulesNote(markAireSeuleCopied(siennePuce.key, active))}
                    build={() => {
                      const unit = t('cmaps.airesChipFiles');
                      const files = fichesDesPays(siennePuce.pays);
                      const pct = fichesMondeAires > 0
                        ? Math.round((files / fichesMondeAires) * 100)
                        : 0;
                      const label = t(regionMondeLabelKey(siennePuce));
                      return [
                        t('cmaps.airesAloneCopyLine').replace('{region}', label),
                        `${t('cmaps.aireFrameCopyHomeRank')
                          .replace('{rang}', String(sienneRangMonde))
                          .replace('{n}', String(REGIONS_MONDE.length))} · ${t('cmaps.aireFrameCopyHomeCountries')
                          .replace('{n}', String(siennePuce.pays.length))}`,
                        t('cmaps.aireFrameCopyHomeWeight')
                          .replace('{files}', String(files))
                          .replace('{unit}', unit)
                          .replace('{pct}', String(pct))
                          .replace('{bar}', barreDePartTexte(pct)),
                        /* Les pays de l'aire, une ligne chacun avec son
                           rang : une fois le message collé, ils ne se
                           perdent pas. */
                        t('cmaps.airesAloneCountriesHead')
                          .replace('{n}', String(siennePuce.pays.length)),
                        ...paysLignesTxt(siennePuce.pays),
                        /* Le total des fiches de l'aire, sous ses pays :
                           la pastille ajoutée se lit comme ses voisines. */
                        t('cmaps.airesAloneCountriesTotal')
                          .replace('{files}', String(files))
                          .replace('{unit}', unit),
                        /* La part de ce total dans les fiches du monde : la
                           pastille ajoutée se lit comme ses voisines. */
                        t('cmaps.airesAloneTotalWorld').replace('{pct}', String(pct)),
                        t('cmaps.airesAloneCopyMap')
                          .replace('{url}', carteAbsolueDeAire(siennePuce.key)),
                      ].join('\n');
                    }}
                  />
                </span>
              </li>
            )}
          </ul>
          {/* Sous la rangée de la note, la même légende que sur une page de
              pays : le trait affermi et la coche y sont expliqués une seule
              fois, avec l'échantillon d'une pastille complète. */}
          {airesCompletes.length > 0 && (
            <AiresCompleteLegend
              count={airesCompletes.length}
              total={airesRows.length}
              sample={airesCompletes[0].label}
              names={completesNomsRangee}
              files={fichesCompletesNote}
            />
          )}
          {/* Où le pays se tient, quand sa propre aire reste hors des aires
              retenues : une ligne dit sa place parmi les aires du monde et
              son poids, sans passer par le survol. */}
          {sienneHors && (
            <span className="cmaps-aires-homeout" title={t('cmaps.airesHomeOutsideHint')}>
              <i className="ri-map-pin-2-fill" aria-hidden="true"></i>
              {t('cmaps.airesHomeOutside')
                .replace('{region}', t(regionMondeLabelKey(sienneHors)))
                .replace('{rang}', String(sienneRangMonde))
                .replace('{n}', String(REGIONS_MONDE.length))
                .replace('{files}', String(fichesDesPays(sienneHors.pays)))
                .replace('{unit}', t('cmaps.airesChipFiles'))
                .replace('{pct}', String(siennePartMonde))}
            </span>
          )}
          {/* Ce que ces aires tiennent tout de même, toutes familles
              confondues : le manque se lit contre le répertoire entier. */}
          <span className="cmaps-sansnote-files" title={t('cmaps.airesFilesHint')}>
            <i className="ri-file-list-3-line" aria-hidden="true"></i>
            <b>{filesAires}</b>
            <span>{t('cmaps.airesFiles')}</span>
          </span>
          <button
            type="button"
            className="cmaps-sansnote-off"
            title={t('cmaps.airesRestoreHint')}
            onClick={rendreAires}
          >
            <i className="ri-refresh-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('cmaps.airesRestore')}</span>
          </button>
          {/* Les aires jamais cadrées depuis cet appareil : posé à côté de la
              bascule, le compteur dit ce qui reste à parcourir, et les ouvre
              d'un geste — la carte se resserre alors sur elles seules. */}
          {jamaisCadrees.length > 0 ? (
            <button
              type="button"
              className={`cmaps-aires-never${jamaisSeules ? ' is-on' : ''}`}
              aria-pressed={jamaisSeules}
              title={jamaisSeules
                ? t('cmaps.airesNeverPicked')
                : `${t('cmaps.airesNeverHint')} ${jamaisNoms.join(' · ')}`}
              onClick={ouvrirJamaisCadrees}
            >
              <i className="ri-focus-3-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('cmaps.airesNever')}</span>
              <b>{jamaisCadrees.length}</b>
              <em>/ {REGIONS_MONDE.length}</em>
            </button>
          ) : (
            <span className="cmaps-aires-never is-done" title={t('cmaps.airesNeverNoneHint')}>
              <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('cmaps.airesNeverNone')}</span>
            </span>
          )}
          {/* La gomme du compteur : posée à côté des aires jamais cadrées,
              elle n'efface rien au premier appui — elle demande confirmation,
              puis rend le carnet vierge et la tournée repart de zéro. */}
          {airesCadreesIci.length > 0 && (
            <button
              type="button"
              className={`cmaps-aires-erase${airesGomme ? ' is-armed' : ''}`}
              aria-pressed={airesGomme}
              title={airesGomme ? t('cmaps.airesNeverClearConfirmHint') : t('cmaps.airesNeverClearHint')}
              aria-label={airesGomme ? t('cmaps.airesNeverClearConfirmHint') : t('cmaps.airesNeverClearHint')}
              onClick={gommerAiresCadrees}
            >
              <i className="ri-eraser-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">
                {airesGomme ? t('cmaps.airesNeverClearConfirm') : t('cmaps.airesNeverClear')}
              </span>
            </button>
          )}
          {/* Le compte des tournées copiées depuis cet appareil : posé à côté
              des aires jamais cadrées, il dit le même chiffre que la rangée
              d'une page de pays, et le jour de la dernière copie. La gomme du
              cadrage le remet à zéro avec le carnet. */}
          {toursNote.count > 0 && (
            <>
              <span
                className="cmaps-aires-tours"
                title={`${t('cmaps.aireFrameCopiesCountHint').replace('{date}', dateTours)}${derniereAireTour
                  ? ` · ${t('cmaps.aireFrameCopiesLastAire').replace('{region}', t(regionMondeLabelKey(derniereAireTour)))}`
                  : ''}${completesPartiesTxt ? ` · ${completesPartiesTxt}` : ''}`}
              >
                <i className="ri-file-copy-2-line" aria-hidden="true"></i>
                <b>{toursNote.count}</b>
                <span className="cmaps-aires-tours-label">{t('cmaps.aireFrameCopiesCount')}</span>
                <em className="cmaps-aires-tours-last">
                  {t('cmaps.aireFrameCopiesLast').replace('{date}', dateTours)}
                </em>
              </span>
              {/* La gomme du seul compte : posée à côté du chiffre, elle
                  n'efface pas le cadrage — le compte repart de zéro, les
                  aires restent cadrées. Le premier appui l'arme. */}
              <button
                type="button"
                className={`cmaps-aires-tours-erase${toursGomme ? ' is-armed' : ''}`}
                aria-pressed={toursGomme}
                title={toursGomme
                  ? t('cmaps.aireFrameCopiesClearConfirmHint')
                  : `${t('cmaps.aireFrameCopiesClearCount').replace('{n}', String(toursNote.count))} · ${t('cmaps.aireFrameCopiesClearHint')}`}
                aria-label={toursGomme
                  ? t('cmaps.aireFrameCopiesClearConfirmHint')
                  : `${t('cmaps.aireFrameCopiesClearCount').replace('{n}', String(toursNote.count))} · ${t('cmaps.aireFrameCopiesClearHint')}`}
                onClick={gommerTours}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>
                {toursGomme && (
                  <span className="whitespace-nowrap">
                    {t('cmaps.airesNeverClearConfirm')}
                  </span>
                )}
              </button>
            </>
          )}
          {/* Le compte des aires copiées seules, posé à côté de celui des
              tournées : le chiffre de la rangée d'une page de pays se relit
              ici, sur la même mémoire, et le survol nomme la dernière aire
              partie seule. Sa petite gomme ne remet à zéro que ce compte —
              le cadrage des aires, lui, reste tel quel. */}
          {seulesNote.count > 0 && (
            <>
              <span
                className="cmaps-aires-seules"
                title={`${t('cmaps.aireFrameAloneCountHint').replace('{date}', dateSeules)}${derniereAireSeule
                  ? ` · ${t('cmaps.aireFrameCopiesLastAire').replace('{region}', t(regionMondeLabelKey(derniereAireSeule)))}`
                  : ''}`}
              >
                <i className="ri-file-copy-line" aria-hidden="true"></i>
                <b>{seulesNote.count}</b>
                <span className="cmaps-aires-seules-label">
                  {t('cmaps.aireFrameAloneCount')}
                </span>
                <em className="cmaps-aires-seules-last">
                  {t('cmaps.aireFrameCopiesLast').replace('{date}', dateSeules)}
                </em>
              </span>
              <button
                type="button"
                className={`cmaps-aires-seules-erase${seulesGomme ? ' is-armed' : ''}`}
                aria-pressed={seulesGomme}
                title={seulesGomme
                  ? t('cmaps.aireFrameSeulesClearConfirmHint')
                  : `${t('cmaps.aireFrameSeulesClearDistinct').replace('{n}', String(seulesNote.aires.length))} · ${t('cmaps.aireFrameSeulesClearHint')}`}
                aria-label={seulesGomme
                  ? t('cmaps.aireFrameSeulesClearConfirmHint')
                  : `${t('cmaps.aireFrameSeulesClearDistinct').replace('{n}', String(seulesNote.aires.length))} · ${t('cmaps.aireFrameSeulesClearHint')}`}
                onClick={gommerSeules}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>
                {seulesGomme && (
                  <span className="whitespace-nowrap">
                    {t('cmaps.airesNeverClearConfirm')}
                  </span>
                )}
              </button>
            </>
          )}
          {/* La petite bascule de la note : un appui range les pastilles de
              la plus lourde à la plus légère, un second appui rend l'ordre
              des aires du monde. */}
          <button
            type="button"
            className={`cmaps-aires-sort${airesParPoids ? ' is-on' : ''}`}
            aria-pressed={airesParPoids}
            title={airesParPoids ? t('cmaps.airesSortOn') : t('cmaps.airesSortHint')}
            onClick={basculerTriAires}
          >
            <i className={airesParPoids ? 'ri-sort-desc' : 'ri-list-check'} aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('cmaps.airesSort')}</span>
          </button>
          {/* La note entière se copie en texte : les aires retenues, leurs
              fiches, les pays où le métier tient et ceux qui en sont privés,
              et l'aire pressée marquée — un point d'étape fidèle à l'écran,
              sans repasser par la carte. */}
          <CopyTextButton
            label={t('cmaps.airesCopyNote')}
            hint={t('cmaps.airesCopyNoteHint')}
            className="cmaps-sansnote-copy cmaps-sansnote-copy--note"
            build={() => {
              const lignes = [
                t('cmaps.airesCopyNoteLine')
                  .replace('{n}', String(airesActives.length))
                  .replace('{pays}', String(cartesGrille.length)),
              ];
              if (metierLabel) {
                lignes.push(t('cmaps.airesCopyNoteTrade').replace('{label}', metierLabel));
              }
              airesMontrees.forEach((row) => {
                /* La barre de part, reprise en texte : la note copiée se lit
                   à côté de l'écran, et se compare à la copie courte. */
                const barre = t('cmaps.airesCopyBar')
                  .replace('{bar}', barreDePartTexte(partAire(row.files)))
                  .replace('{pct}', String(partAire(row.files)));
                const parts = [`- ${row.label} · ${row.files} ${t('cmaps.airesChipFiles')} · ${barre} · ${rangAireTxt(row.key)}`];
                if (trade) parts.push(t('cmaps.airesChipHeld').replace('{n}', String(row.tenus)));
                /* La part du pays lu dans l'aire, reprise en texte : la note
                   copiée situe le pays comme l'écran le fait. */
                if (row.paysPart !== null && active) {
                  /* Le rang du pays, puis sa part : la note copiée dit
                     exactement ce que le survol de la barre dit. */
                  parts.push(row.paysRang !== null
                    ? t('cmaps.airesCopyNoteCountryRank')
                      .replace('{pays}', nomPays(active, lang))
                      .replace('{rang}', String(row.paysRang))
                      .replace('{n}', String(row.pays))
                      .replace('{pct}', String(row.paysPart))
                    : t('cmaps.airesCopyNoteCountry')
                      .replace('{pays}', nomPays(active, lang))
                      .replace('{pct}', String(row.paysPart)));
                }
                parts.push(row.manquantsNoms.length > 0
                  ? `${t('cmaps.airesChipMissing')} ${row.manquantsNoms.join(', ')}`
                  : t('cmaps.airesChipNone'));
                if (aireSeuleKey === row.key) parts.push(t('cmaps.airesCopyNotePicked'));
                lignes.push(parts.join(' · '));
              });
              return lignes.join('\n');
            }}
          />
          {/* Les adresses des pays sans le métier, aire par aire : le collègue
              colle des liens entiers dans un document, sans reconstruire une
              seule adresse. */}
          <CopyTextButton
            label={t('cmaps.airesCopyLinks')}
            hint={t('cmaps.airesCopyLinksHint').replace('{label}', metierLabel)}
            className="cmaps-sansnote-copy"
            build={() => {
              const base = typeof window === 'undefined'
                ? ''
                : `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
              return [
                t('cmaps.airesCopyLinksLine')
                  .replace('{label}', metierLabel)
                  .replace('{n}', String(airesRows.length)),
                ...airesMontrees.flatMap((row) => [
                  `${row.label} · ${row.files} ${t('cmaps.airesChipFiles')}`,
                  ...row.manquants
                    .filter((code) => slugPays(code))
                    .map((code) => `${base}/annuaire/${slugDeTrade(trade)}/${slugPays(code)}`),
                ]),
              ].join('\n');
            }}
          />
          {/* Le geste court : les aires et leurs comptes seulement, sans un
              seul pays — un message de deux lignes pour annoncer l'échelle
              des aires, sans coller le relevé entier. */}
          <CopyTextButton
            label={t('cmaps.airesCopyShort')}
            hint={t('cmaps.airesCopyShortHint')}
            className="cmaps-sansnote-copy cmaps-sansnote-copy--short"
            build={() => [
              t('cmaps.airesCopyShortLine').replace('{n}', String(airesRows.length)),
              ...airesMontrees.map((row) => `- ${row.label} · ${row.files} ${t('cmaps.airesChipFiles')} · ${t('cmaps.airesCopyBar')
                .replace('{bar}', barreDePartTexte(partAire(row.files)))
                .replace('{pct}', String(partAire(row.files)))} · ${rangAireTxt(row.key)}`),
            ].join('\n')}
          />
          {/* La copie courte portée jusqu'à la note, à côté de « Copier les
              aires », pour les seules aires complètes retenues : leur nom et
              leurs fiches, une ligne par aire — un message de deux lignes qui
              annonce ce qui est déjà prêt à partir. */}
          {airesCompletes.length > 0 && (
            <CopyTextButton
              label={t('cmaps.airesCompletesShort')}
              hint={`${t('cmaps.airesCompletesShortHint')
                .replace('{n}', String(airesCompletes.length))
                .replace('{total}', String(airesRows.length))} · ${t('cmaps.aireFrameCompleteCopyShortRows')
                .replace('{list}', airesCompletes
                  .map((row) => t('cmaps.aireFrameCompleteCopyShortRow')
                    .replace('{region}', row.label)
                    .replace('{files}', String(row.files))
                    .replace('{unit}', t('cmaps.airesChipFiles')))
                  .join(' · '))}`}
              className="cmaps-sansnote-copy cmaps-sansnote-copy--short cmaps-sansnote-copy--names"
              onCopied={() => markAiresCourteCopied()}
              build={() => [
                t('cmaps.airesCompletesShortLine')
                  .replace('{n}', String(airesCompletes.length))
                  .replace('{total}', String(airesRows.length)),
                ...airesCompletes.map((row) => t('cmaps.aireFrameCompleteCopyShortRow')
                  .replace('{region}', row.label)
                  .replace('{files}', String(row.files))
                  .replace('{unit}', t('cmaps.airesChipFiles'))),
              ].join('\n')}
            />
          )}
          {/* Le geste des aires complètes : d'un coup, les seules aires de la
              note dont tous les pays ont déjà été copiés seuls — aucune à
              choisir, aucune à vérifier avant d'envoyer. */}
          {airesCompletes.length > 0 && (
            <CopyTextButton
              label={t('cmaps.airesCompletesCopy')}
              hint={`${t('cmaps.airesCompletesCopyHint')
                .replace('{n}', String(airesCompletes.length))
                .replace('{total}', String(airesRows.length))} · ${incompletesTxt}`}
              className="cmaps-sansnote-copy cmaps-sansnote-copy--completes"
              build={() => [
                t('cmaps.airesCompletesCopyLine')
                  .replace('{n}', String(airesCompletes.length))
                  .replace('{total}', String(airesRows.length)),
                t('cmaps.airesCompletesCopyAll'),
                ...airesCompletes.map((row) => t('cmaps.airesCompletesCopyRow')
                  .replace('{region}', row.label)
                  .replace('{files}', String(row.files))
                  .replace('{unit}', t('cmaps.airesChipFiles'))
                  .replace('{rang}', rangAireTxt(row.key))),
                ...airesCompletes.map((row) => t('cmaps.airesAloneCopyMap')
                  .replace('{url}', carteAbsolueDeAire(row.key))),
              ].join('\n')}
              onCopied={() => markAiresCompletesCopied()}
            />
          )}
          {/* Sous le geste des aires complètes, une petite ligne compte les pays
              qui manquent encore, toutes aires incomplètes réunies : le geste
              ne promet pas un relevé entier sans dire ce qu'il laisse. */}
          {airesCompletes.length > 0 && paysManquantsCompletes > 0 && (
            <span
              className="cmaps-aires-missing"
              title={t('cmaps.airesCompletesMissingHint')
                .replace('{n}', String(paysManquantsCompletes))
                .replace('{aires}', String(airesIncompletes.length))
                .replace('{list}', airesIncompletes
                  .map((row) => t('cmaps.airesCompletesIncompleteRow')
                    .replace('{region}', row.label)
                    .replace('{pays}', row.noms.join(' · ') || '—'))
                  .join(' · '))}
            >
              <i className="ri-global-line" aria-hidden="true"></i>
              <b>{paysManquantsCompletes}</b>
              <span className="cmaps-aires-missing-label">{t('cmaps.airesCompletesMissing')}</span>
            </span>
          )}
          {/* La part du pays lu, aire par aire : la copie emporte la barre
              reprise en texte, si bien que le pays se situe dans chaque aire
              et se compare d'une ligne à l'autre, sans coller la note. */}
          {active && airesRows.some((row) => row.paysPart !== null) && (
            <CopyTextButton
              label={t('cmaps.airesCopyCountry')}
              hint={t('cmaps.airesCopyCountryHint').replace('{pays}', nomPays(active, lang))}
              className="cmaps-sansnote-copy cmaps-sansnote-copy--country"
              build={() => {
                const parts = airesMontrees.filter((row) => row.paysPart !== null);
                /* Les aires où le pays pèse le plus lourd : la copie joint
                   leur classement, pour envoyer le pays dans son voisinage
                   au lieu de sa seule part. */
                const mene = airesOuPaysMene.filter((row) => row.paysPart !== null);
                const lignes = [
                  t('cmaps.airesCopyCountryLine')
                    .replace('{pays}', nomPays(active, lang))
                    .replace('{n}', String(parts.length)),
                  ...parts.map((row) => `- ${row.label} · ${t('cmaps.airesCopyBar')
                    .replace('{bar}', barreDePartTexte(row.paysPart ?? 0))
                    .replace('{pct}', String(row.paysPart ?? 0))} · ${rangAireTxt(row.key)}`),
                  '',
                ];
                if (mene.length > 0) {
                  lignes.push(t('cmaps.airesCopyCountryLeadsLine')
                    .replace('{pays}', nomPays(active, lang))
                    .replace('{n}', String(mene.length))
                    .replace('{total}', String(airesRows.length)));
                  mene.forEach((row) => {
                    lignes.push(`${t('cmaps.airesCopyCountryLeadsRow')
                      .replace('{region}', row.label)
                      .replace('{bar}', barreDePartTexte(row.paysPart ?? 0))
                      .replace('{pct}', String(row.paysPart ?? 0))
                      .replace('{rang}', String(row.paysRang ?? 1))
                      .replace('{n}', String(row.pays))} · ${rangAireTxt(row.key)}`);
                  });
                } else {
                  lignes.push(t('cmaps.airesCopyCountryLeadsNone')
                    .replace('{pays}', nomPays(active, lang)));
                }
                return lignes.join('\n');
              }}
            />
          )}
        </div>
      )}

      {/* Sous la note, un compteur des aires complètes qui n'ont pas encore
          été copiées seules, et sa porte de copie : ce qui est complet mais
          jamais parti se lit d'un chiffre, puis s'emporte d'un geste. */}
      {airesCompletesNonSeules.length > 0 && (
        <div className="cmaps-aires-aenvoyer">
          <span
            className="cmaps-aires-aenvoyer-count"
            title={t('cmaps.airesCompletesLeftHint')
              .replace('{n}', String(airesCompletesNonSeules.length))
              .replace('{total}', String(airesCompletes.length))
              .replace('{names}', airesCompletesNonSeules.map((row) => row.label).join(' · '))
              .replace('{files}', String(fichesCompletesNonSeules))
              .replace('{unit}', t('cmaps.airesChipFiles'))}
          >
            <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
            <b>{airesCompletesNonSeules.length}</b>
            <span className="cmaps-aires-aenvoyer-label">
              {t('cmaps.airesCompletesLeft')}
            </span>
            <em>/ {airesCompletes.length}</em>
          </span>
          <CopyTextButton
            label={t('cmaps.airesCompletesLeftCopy')}
            hint={t('cmaps.airesCompletesLeftCopyHint')
              .replace('{n}', String(airesCompletesNonSeules.length))
              .replace('{total}', String(airesCompletes.length))}
            className="cmaps-sansnote-copy cmaps-sansnote-copy--completes"
            build={() => [
              t('cmaps.airesCompletesLeftCopyLine')
                .replace('{n}', String(airesCompletesNonSeules.length))
                .replace('{total}', String(airesCompletes.length)),
              t('cmaps.airesCompletesCopyAll'),
              ...airesCompletesNonSeules.map((row) => t('cmaps.airesCompletesCopyRow')
                .replace('{region}', row.label)
                .replace('{files}', String(row.files))
                .replace('{unit}', t('cmaps.airesChipFiles'))
                .replace('{rang}', rangAireTxt(row.key))),
              ...airesCompletesNonSeules.map((row) => t('cmaps.airesAloneCopyMap')
                .replace('{url}', carteAbsolueDeAire(row.key))),
            ].join('\n')}
            onCopied={() => markAiresCompletesCopied()}
          />
        </div>
      )}

      {/* Le pays lu dans sa meilleure assise : posé sous la note, le compteur
          dit dans combien d'aires retenues il devance tous les autres pays,
          et les nomme au survol avec leur part — le voisinage se lit sans
          copier une seule tournée. */}
      {airesLien.length > 0 && active && airesRows.length > 0 && (
        <div className="cmaps-aires-mene-wrap">
        <button
          type="button"
          className={`cmaps-aires-mene${airesOuPaysMene.length === 0 ? ' is-none' : ''}${meneSeuls ? ' is-on' : ''}`}
          aria-pressed={meneSeuls}
          aria-disabled={airesOuPaysMene.length === 0}
          title={airesOuPaysMene.length === 0
            /* La plaque se tait sur le geste quand le pays ne devance
               personne : son survol nomme alors les aires où il arrive juste
               derrière, avec sa part et son rang — il dit où le pays se
               situe au lieu de laisser un constat sans voisinage. */
            ? `${t('cmaps.airesCountryLeadsNoneHint').replace('{pays}', nomPays(active, lang))}${airesOuPaysDerriere.length > 0
              ? ` ${t('cmaps.airesBehindLine')
                .replace('{pays}', nomPays(active, lang))
                .replace('{n}', String(airesOuPaysDerriere.length))
                .replace('{total}', String(airesRows.length))} ${airesOuPaysDerriere
                .map((row) => t('cmaps.airesBehindHover')
                  .replace('{region}', row.label)
                  .replace('{pct}', String(row.paysPart ?? 0))
                  .replace('{rang}', String(row.paysRang ?? derriereRang))
                  .replace('{n}', String(row.pays)))
                .join(' · ')}`
              : ''}`
            : `${t('cmaps.airesCountryLeadsHint').replace('{pays}', nomPays(active, lang))} ${airesOuPaysMene
              .map((row) => `${row.label}${row.paysPart !== null ? ` · ${row.paysPart} %` : ''}`)
              .join(' · ')} — ${meneSeuls ? t('cmaps.airesCountryLeadsPicked') : t('cmaps.airesCountryLeadsPick')}`}
          onClick={basculerAiresMene}
        >
          <i
            className={airesOuPaysMene.length === 0 ? 'ri-scales-2-line' : 'ri-scales-3-line'}
            aria-hidden="true"
          ></i>
          {airesOuPaysMene.length === 0 ? (
            <span>{t('cmaps.airesCountryLeadsNone').replace('{pays}', nomPays(active, lang))}</span>
          ) : (
            <>
              <span>{t('cmaps.airesCountryLeads')}</span>
              <b>{airesOuPaysMene.length}</b>
              <em>/ {airesRows.length}</em>
            </>
          )}
        </button>
        {/* Le classement du pays dans son voisinage, copiable : l'aire, sa
            part et le rang du pays, aire par aire — la plaque ne reste plus
            un constat qu'on lit sans pouvoir l'envoyer. */}
        {airesOuPaysMene.length > 0 && (
          <CopyTextButton
            label={t('cmaps.airesMeneCopy')}
            hint={t('cmaps.airesMeneCopyHint').replace('{pays}', nomPays(active, lang))}
            className="cmaps-sansnote-copy cmaps-aires-mene-copy"
            build={() => {
              const mene = airesOuPaysMene.filter((row) => row.paysPart !== null);
              return [
                t('cmaps.airesCopyCountryLeadsLine')
                  .replace('{pays}', nomPays(active, lang))
                  .replace('{n}', String(mene.length))
                  .replace('{total}', String(airesRows.length)),
                ...mene.map((row) => `${t('cmaps.airesCopyCountryLeadsRow')
                  .replace('{region}', row.label)
                  .replace('{bar}', barreDePartTexte(row.paysPart ?? 0))
                  .replace('{pct}', String(row.paysPart ?? 0))
                  .replace('{rang}', String(row.paysRang ?? 1))
                  .replace('{n}', String(row.pays))} · ${rangAireTxt(row.key)}`),
              ].join('\n');
            }}
          />
        )}
        {/* Le pays ne devance aucun autre pays : le geste emporte quand même
            les aires où il arrive juste derrière, aire par aire avec sa part
            et son rang — le voisinage se situe au lieu de rester sans
            réponse, et la copie ne se tait pas là où l'écran se tait. */}
        {airesOuPaysMene.length === 0 && airesOuPaysDerriere.length > 0 && (
          <CopyTextButton
            label={t('cmaps.airesBehindCopy')}
            hint={t('cmaps.airesBehindCopyHint')
              .replace('{pays}', nomPays(active, lang))
              .replace('{rang}', String(derriereRang))
              .replace('{n}', String(airesOuPaysDerriere.length))}
            className="cmaps-sansnote-copy cmaps-aires-mene-copy"
            build={() => [
              t('cmaps.airesCopyCountryLeadsNone').replace('{pays}', nomPays(active, lang)),
              t('cmaps.airesBehindLine')
                .replace('{pays}', nomPays(active, lang))
                .replace('{n}', String(airesOuPaysDerriere.length))
                .replace('{total}', String(airesRows.length)),
              ...airesOuPaysDerriere.map((row) => `${t('cmaps.airesCopyCountryLeadsRow')
                .replace('{region}', row.label)
                .replace('{bar}', barreDePartTexte(row.paysPart ?? 0))
                .replace('{pct}', String(row.paysPart ?? 0))
                .replace('{rang}', String(row.paysRang ?? derriereRang))
                .replace('{n}', String(row.pays))} · ${rangAireTxt(row.key)}`),
            ].join('\n')}
          />
        )}
        </div>
      )}

      {/* Une lecture qui ne trouve aucune carte le dit, plutôt que de laisser
          une grille vide sans explication. */}
      {cartesGrille.length === 0 && (
        <p className="cmaps-csvnone" role="status">
          <i className="ri-filter-off-line" aria-hidden="true"></i>
          <span>{t('cmaps.csvFilterNone')}</span>
          <button type="button" className="cmaps-csvnone-off" onClick={() => setCsvScope('')}>
            <i className="ri-refresh-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('cmaps.csvFilterAll')}</span>
          </button>
        </p>
      )}

      <div className="cmaps-grid" id="cmaps-grid" ref={gridRef}>
        {cartesGrille.map(({ pays, nom, pins: countryPins, regions, familles, best, pens, count, depots: depotsPays, total, regionsCount }) => {
          const rest = regions.slice(TOP_REGIONS);
          const ouvert = deplies.includes(pays.code);
          /* L'aire où se tient le pays : le geste court posé sous la fiche du
             meilleur atelier l'annonce en deux lignes, sans rang ni adresse. */
          const airePaysCarte = regionMondeDe(pays.code);
          const isActive = active === pays.code;
          /* Les régions du genre lu, seulement sur le pays que le lien a
             ouvert : les autres cartes restent au large. */
          const zonesIci = isActive ? new Set(zonesLien) : new Set<string>();
          /* Une carte resserrée montre toutes ses régions plutôt que de
             cacher sous un « +n » celles que le genre vient de désigner. */
          const visibles = ouvert || zonesIci.size > 0 ? regions : regions.slice(0, TOP_REGIONS);
          const focusPins = zonesIci.size > 0
            ? countryPins.filter((pin) => zonesIci.has((pin.wilaya || '').trim()))
            : [];
          /* Les plumes du genre s'ajoutent aux fiches des régions désignées :
             la toile se cadre sur le genre et sur son terrain. */
          const penFocus = isActive ? [...focusPins, ...penPins] : [];
          /* Chaque famille du pays, lue là où elle tient vraiment son monde :
             la ligne nomme la région la plus fournie et ouvre sa carte
             resserrée. Une famille absente du pays ne dit rien. */
          const hotRows = familles
            .map((row) => ({
              trade: row.trade,
              hot: regionActive(row.trade, pays.code),
              fiche: MEILLEURE_FICHE[`${pays.code}|${row.trade}`] ?? null,
            }))
            .filter((row) => row.hot !== null);
          /* La région la plus fournie de la famille de ce meilleur atelier :
             le second lien de la carte, qui ouvre la carte déjà resserrée
             dessus — la fiche se lit, puis le terrain se voit. */
          const bestRegion = best ? regionActive(best.trade, pays.code) : null;
          /* La bibliothèque la mieux fournie de chaque région du pays : la
             carte nomme, région par région, le fonds qui y est le plus gros. */
          const bibRows: Array<{ wilaya: string; bib: BibRegion }> = [];
          regions.forEach((row) => {
            const bib = MEILLEURE_BIB[`${pays.code}|${row.wilaya}`];
            if (bib) bibRows.push({ wilaya: row.wilaya, bib });
          });
          /* La librairie au plus large fonds de chaque région, à côté de la
             bibliothèque : les deux fonds se lisent sur la même carte. */
          const libRows: Array<{ wilaya: string; lib: LibRegion }> = [];
          regions.forEach((row) => {
            const lib = MEILLEURE_LIB[`${pays.code}|${row.wilaya}`];
            if (lib) libRows.push({ wilaya: row.wilaya, lib });
          });
          /* La maison d'édition au plus gros catalogue de chaque région, au
             même rang que les deux autres fonds : le troisième bloc se lit
             sous les deux premiers. */
          const edRows: Array<{ wilaya: string; ed: EdRegion }> = [];
          regions.forEach((row) => {
            const ed = MEILLEURE_EDITION[`${pays.code}|${row.wilaya}`];
            if (ed) edRows.push({ wilaya: row.wilaya, ed });
          });
          /* La région où les trois fonds réunis pèsent le plus : le fonds de
             la bibliothèque, les références de la librairie et les titres de
             la maison s'y additionnent, et la carte nomme la gagnante. */
          const trio = MEILLEUR_TRIO[pays.code] ?? null;
          /* Les trois régions qui pèsent le plus, avec leur total : la carte
             ne nomme plus seulement la gagnante, elle laisse comparer. */
          const trioRangs = (TRIO_RANKING[pays.code] ?? []).slice(0, 3);
          return (
            <article key={pays.code} className={`cmap-card${isActive ? ' is-on' : ''}`}>
              <header className="cmap-head">
                <span className="cmap-head-name">
                  <h3>{nom}</h3>
                  {/* Le jour du dernier départ de feuille, posé sous le nom
                      du pays : une carte dit quand sa feuille est partie la
                      dernière fois, sans ouvrir le panneau. */}
                  {exportesAt[pays.code] && (
                    <em className="cmap-exported" title={t('cmaps.cardExportAtHint')}>
                      <i className="ri-file-excel-2-line" aria-hidden="true"></i>
                      <span>
                        {t('cmaps.cardExportAt').replace('{date}', dateJour(exportesAt[pays.code], lang))}
                      </span>
                    </em>
                  )}
                </span>
                <span className="cmap-count" title={`${count} ${t('cmaps.files')} · ${depotsPays} ${t('cmaps.depots')}`}>
                  <b>{total}</b>
                  {t('cmaps.files')}
                </span>
              </header>

              {/* What part of that figure comes from the boards: the directory
                  lists the workshops, the boards carry the ads and the jobs. */}
              {depotsPays > 0 && (
                <p className="cmap-depots" title={t('cmaps.depotsHint')}>
                  <i className="ri-file-list-3-line" aria-hidden="true"></i>
                  <b>+{depotsPays}</b> {t('cmaps.depots')}
                </p>
              )}

              <div className="cmap-frame">
                {mounted
                  ? (
                    <CountryCanvas
                      code={pays.code}
                      pins={countryPins}
                      focus={penFocus}
                      pens={isActive ? penPins : []}
                    />
                  )
                  : <div className="cmap-canvas cmap-canvas--idle" aria-hidden="true"></div>}
                {total === 0 && mounted && (
                  <p className="cmap-none">{t('cmaps.none')}</p>
                )}
              </div>

              {/* Les plumes du genre lu, épinglées sur la carte : le compteur
                  n'est pas qu'un chiffre, il ouvre la liste resserrée sur ce
                  seul genre — le terrain se voit, puis la liste se lit. */}
              {/* Le raccourci garde la région déjà lue sur la carte : la liste
                  s'ouvre sur ce genre et sur cette région, sans repasser par
                  les filtres ni perdre le terrain qu'on était en train de lire. */}
              {isActive && genreLien && penPins.length > 0 && (
                <div className={`cmap-penpins${activeRegion ? ' is-zone' : ''}`}>
                  <Link
                    className="cmap-penpins-main"
                    to={`/annuaire?kind=auteurs&pays=${pays.code}&genre=${genreLien}${activeRegion ? `&wilaya=${encodeURIComponent(activeRegion)}` : ''}`}
                    title={`${t(`genre.${genreLien}`)} · ${nom}${activeRegion ? ` · ${nomRegion(activeRegion, lang)}` : ''} · ${penPins.length} — ${activeRegion ? t('cmaps.penPinsZoneHint') : t('cmaps.penPinsFilterHint')}`}
                  >
                    <i className="ri-quill-pen-line" aria-hidden="true"></i>
                    <span className="cmap-penpins-dot" aria-hidden="true"></span>
                    <b>{penPins.length}</b>
                    <span className="cmap-penpins-label">
                      {t('cmaps.penPins')} · {t(`genre.${genreLien}`)}
                    </span>
                    {!activeRegion && (
                      <span className="cmap-penpins-filter">{t('cmaps.penPinsFilter')}</span>
                    )}
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </Link>
                  {/* La région gardée se retire d'un clic : le nom redevient un
                      geste, et la liste s'ouvre aux plumes de tout le pays au
                      lieu de laisser le lecteur chercher une sortie. */}
                  {activeRegion && (
                    <Link
                      className="cmap-penpins-zone"
                      to={`/annuaire?kind=auteurs&pays=${pays.code}&genre=${genreLien}`}
                      title={`${nomRegion(activeRegion, lang)} — ${t('cmaps.penPinsZoneClearHint')}`}
                    >
                      <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                      <span className="cmap-penpins-zone-name">{nomRegion(activeRegion, lang)}</span>
                      <i className="ri-close-line cmap-penpins-zone-x" aria-hidden="true"></i>
                    </Link>
                  )}
                </div>
              )}

              {/* Right under the map, the country told region by region: the
                  five sheets of Egypt are not all in Cairo. Each counter is a
                  filter in one gesture — the country and its region together. */}
              {regions.length > 0 && (
                <div className="cmap-regions" title={t('cmaps.regionHint')}>
                  <span className="cmap-regions-label">
                    <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                    {t('cmaps.regions')}
                    {regionsCount > TOP_REGIONS && (
                      <em className="cmap-regions-num">{regionsCount}</em>
                    )}
                  </span>
                  <ul className="cmap-region-list">
                    {visibles.map((row) => {
                      const on = isActive && activeRegion === row.wilaya;
                      const zone = zonesIci.has(row.wilaya);
                      return (
                        <li key={row.wilaya} className="cmap-region-item">
                          <button
                            type="button"
                            className={`cmap-region${on ? ' is-on' : ''}${zone ? ' is-zone' : ''}`}
                            aria-pressed={on}
                            title={`${nomRegion(row.wilaya, lang)} · ${row.count} — ${zone ? `${t('cmaps.zoneMark')} · ` : ''}${t('cmaps.regionHint')}`}
                            onClick={() => onPickRegion(pays.code, on ? '' : row.wilaya)}
                          >
                            <span className="cmap-region-name">{nomRegion(row.wilaya, lang)}</span>
                            <b>{row.count}</b>
                          </button>
                        </li>
                      );
                    })}
                    {rest.length > 0 && zonesIci.size === 0 && (
                      <li className="cmap-region-item">
                        <button
                          type="button"
                          className={`cmap-region cmap-region--more${ouvert ? ' is-open' : ''}`}
                          aria-expanded={ouvert}
                          aria-label={ouvert ? t('cmaps.fewerRegions') : t('cmaps.showRegions')}
                          title={`${ouvertsDescr(rest, lang)} — ${t('cmaps.openShare')}`}
                          onClick={() => basculerDeplie(pays.code)}
                        >
                          {ouvert
                            ? <i className="ri-subtract-line" aria-hidden="true"></i>
                            : <>+{rest.length} {t('cmaps.moreRegions')}</>}
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* La bibliothèque la mieux fournie, région par région : la
                  carte ne se contente pas de dire combien de fiches tient une
                  région, elle nomme le fonds qui y est le plus gros et y
                  mène d'un clic. */}
              {bibRows.length > 0 && (
                <div className="cmap-bibs" title={t('cmaps.bibHint')}>
                  <span className="cmap-bibs-label">
                    <i className="ri-book-2-line" aria-hidden="true"></i>
                    {t('cmaps.bib')}
                  </span>
                  <ul className="cmap-bib-list">
                    {bibRows.map(({ wilaya, bib }) => (
                      <li key={wilaya} className="cmap-bib-item">
                        <Link
                          className="cmap-bib"
                          to={`/entreprise/${bib.id}`}
                          title={`${bib.name} · ${nomRegion(wilaya, lang)}${bib.volume > 0 ? ` · ${espacer(bib.volume)} ${t('cmaps.bibVolumes')}` : ''} — ${t('cmaps.bibHint')}`}
                        >
                          <i className="ri-book-2-line" aria-hidden="true"></i>
                          <span className="cmap-bib-region">{nomRegion(wilaya, lang)}</span>
                          <span className="cmap-bib-name">{bib.name}</span>
                          {bib.volume > 0 && <b>{espacer(bib.volume)}</b>}
                          <i className="ri-arrow-right-line" aria-hidden="true"></i>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* La librairie au plus large fonds, région par région, juste à
                  côté des bibliothèques : la carte nomme le fonds de commerce
                  le plus large de la région et y mène d'un clic. */}
              {libRows.length > 0 && (
                <div className="cmap-bibs cmap-bibs--libs" title={t('cmaps.libHint')}>
                  <span className="cmap-bibs-label">
                    <i className="ri-store-2-line" aria-hidden="true"></i>
                    {t('cmaps.lib')}
                  </span>
                  <ul className="cmap-bib-list">
                    {libRows.map(({ wilaya, lib }) => (
                      <li key={wilaya} className="cmap-bib-item">
                        <Link
                          className="cmap-bib"
                          to={`/entreprise/${lib.id}`}
                          title={`${lib.name} · ${nomRegion(wilaya, lang)}${lib.refs > 0 ? ` · ${espacer(lib.refs)} ${t('cmaps.libRefs')}` : ''} — ${t('cmaps.libHint')}`}
                        >
                          <i className="ri-store-2-line" aria-hidden="true"></i>
                          <span className="cmap-bib-region">{nomRegion(wilaya, lang)}</span>
                          <span className="cmap-bib-name">{lib.name}</span>
                          {lib.refs > 0 && <b>{espacer(lib.refs)}</b>}
                          <i className="ri-arrow-right-line" aria-hidden="true"></i>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* La maison d'édition au plus gros catalogue, région par région,
                  à côté des bibliothèques et des librairies : la carte nomme le
                  troisième fonds de la région et y mène d'un clic. */}
              {edRows.length > 0 && (
                <div className="cmap-bibs cmap-bibs--eds" title={t('cmaps.edHint')}>
                  <span className="cmap-bibs-label">
                    <i className="ri-book-open-line" aria-hidden="true"></i>
                    {t('cmaps.ed')}
                  </span>
                  <ul className="cmap-bib-list">
                    {edRows.map(({ wilaya, ed }) => (
                      <li key={wilaya} className="cmap-bib-item">
                        <Link
                          className="cmap-bib"
                          to={`/entreprise/${ed.id}`}
                          title={`${ed.name} · ${nomRegion(wilaya, lang)}${ed.titles > 0 ? ` · ${ed.titles} ${t('cmaps.edTitles')}` : ''} — ${t('cmaps.edHint')}`}
                        >
                          <i className="ri-book-open-line" aria-hidden="true"></i>
                          <span className="cmap-bib-region">{nomRegion(wilaya, lang)}</span>
                          <span className="cmap-bib-name">{ed.name}</span>
                          {ed.titles > 0 && <b>{ed.titles}</b>}
                          <i className="ri-arrow-right-line" aria-hidden="true"></i>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* La région où les trois fonds réunis pèsent le plus : sous
                  les trois blocs, une ligne nomme la région gagnante, dit ce
                  que chaque maison y apporte, et ouvre ses fiches. */}
              {trio && trio.total > 0 && (
                <div className="cmap-trio" title={t('cmaps.trioHint')}>
                  <span className="cmap-trio-label">
                    <i className="ri-stack-line" aria-hidden="true"></i>
                    {t('cmaps.trio')}
                  </span>
                  <div className="cmap-trio-row">
                    <span className="cmap-trio-region" title={nomRegion(trio.wilaya, lang)}>
                      <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                      {nomRegion(trio.wilaya, lang)}
                    </span>
                    <ul className="cmap-trio-parts">
                      {trio.volume > 0 && (
                        <li title={`${t('cmaps.bib')} · ${espacer(trio.volume)} ${t('cmaps.bibVolumes')}`}>
                          <i className="ri-book-2-line" aria-hidden="true"></i>
                          {espacer(trio.volume)}
                        </li>
                      )}
                      {trio.refs > 0 && (
                        <li title={`${t('cmaps.lib')} · ${espacer(trio.refs)} ${t('cmaps.libRefs')}`}>
                          <i className="ri-store-2-line" aria-hidden="true"></i>
                          {espacer(trio.refs)}
                        </li>
                      )}
                      {trio.titles > 0 && (
                        <li title={`${t('cmaps.ed')} · ${trio.titles} ${t('cmaps.edTitles')}`}>
                          <i className="ri-book-open-line" aria-hidden="true"></i>
                          {trio.titles}
                        </li>
                      )}
                    </ul>
                    <Link
                      className="cmap-trio-files"
                      to={`/annuaire?pays=${pays.code}&wilaya=${encodeURIComponent(trio.wilaya)}`}
                      title={`${nom} · ${nomRegion(trio.wilaya, lang)} — ${t('cmaps.trioFilesHint')}`}
                    >
                      <i className="ri-file-list-3-line" aria-hidden="true"></i>
                      <span>{t('cmaps.trioFiles')}</span>
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    </Link>
                  </div>
                  {/* Les trois régions les plus lourdes, leur rang et leur
                      total : la gagnante reste en tête, les deux suivantes
                      se comparent au lieu de rester invisibles. */}
                  {trioRangs.length > 1 && (
                    <ol className="cmap-trio-rank" title={t('cmaps.trioRankHint')}>
                      {trioRangs.map((row, rang) => (
                        <li key={row.wilaya} className="cmap-trio-rank-item">
                          <Link
                            className="cmap-trio-rank-link"
                            to={`/annuaire?pays=${pays.code}&wilaya=${encodeURIComponent(row.wilaya)}`}
                            title={`${nomRegion(row.wilaya, lang)} · ${espacer(row.total)} — ${t('cmaps.trioFilesHint')}`}
                          >
                            <em>{rang + 1}</em>
                            <span className="cmap-trio-rank-name">{nomRegion(row.wilaya, lang)}</span>
                            <b>{espacer(row.total)}</b>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  )}
                  {/* Le classement des trois régions tenu dans l'adresse : le
                      lien rouvre la même carte resserrée sur ces régions, et
                      le texte se copie sans passer par la carte. */}
                  {trioRangs.length > 0 && (
                    <div className="cmap-trio-actions">
                      <Link
                        className="cmap-trio-map"
                        to={`/annuaire?view=map&pays=${pays.code}&${ZONES_PARAM}=${encodeURIComponent(trioRangs.map((row) => row.wilaya).join(','))}#cmaps`}
                        title={t('cmaps.trioMapHint')}
                      >
                        <i className="ri-focus-3-line" aria-hidden="true"></i>
                        <span>{t('cmaps.trioMap')}</span>
                        <em>{trioRangs.length}</em>
                        <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      </Link>
                      <CopyTextButton
                        label={t('cmaps.trioCopy')}
                        hint={t('cmaps.trioCopyHint')}
                        className="cmap-trio-copy"
                        build={() => [
                          `${nom} · ${t('cmaps.trio')}`,
                          ...trioRangs.map((row, rang) => `${rang + 1}. ${nomRegion(row.wilaya, lang)} — ${espacer(row.total)}`),
                        ].join('\n')}
                      />
                      {/* Le même classement, mais détaillé : chaque région
                          donne le fonds de sa bibliothèque, les références de
                          sa librairie et les titres de sa maison d'édition —
                          le total se vérifie au lieu de se croire. */}
                      <CopyTextButton
                        label={t('cmaps.trioCopyDetail')}
                        hint={t('cmaps.trioCopyDetailHint')}
                        className="cmap-trio-copy cmap-trio-copy--detail"
                        build={() => [
                          `${nom} · ${t('cmaps.trio')}`,
                          ...trioRangs.flatMap((row, rang) => [
                            `${rang + 1}. ${nomRegion(row.wilaya, lang)} — ${espacer(row.total)}`,
                            `   ${t('cmaps.partBib')} ${espacer(row.volume) || '—'} · ${t('cmaps.partLib')} ${espacer(row.refs) || '—'} · ${t('cmaps.partEd')} ${row.titles > 0 ? row.titles : '—'}`,
                          ]),
                        ].join('\n')}
                      />
                      {/* Le même détail, mais dans un tableur : la feuille garde
                          le pays, le rang, la région et les trois fonds, pour
                          être collée à côté de celle d'un autre pays. */}
                      <TrioCsvButton
                        countries={[{ code: pays.code, nom, rows: trioRangs }]}
                        label={t('cmaps.trioCsv')}
                        hint={t('cmaps.trioCsvHint')}
                        className="cmap-trio-copy cmap-trio-copy--csv"
                        code={pays.code}
                        onExported={noterExport}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Les familles du pays, chacune avec son compte : une
                  bibliothèque et une plume se trouvent d'un clic, comme une
                  imprimerie, sans repasser par la barre de filtres. */}
              {familles.length > 0 && (
                <div className="cmap-fams" title={t('cmaps.familiesHint')}>
                  <span className="cmap-fams-label">
                    <i className="ri-apps-2-line" aria-hidden="true"></i>
                    {t('cmaps.families')}
                  </span>
                  <ul className="cmap-fam-list">
                    {familles.map((row) => {
                      /* Une famille tenue dans une seule région du pays : son
                         trait passe en pointillé, et le survol nomme la
                         région — le métier concentré se repère avant d'être
                         ouvert. */
                      const solo = regionUnique(pays.code, row.trade);
                      /* Le compte local posé contre le total mondial de la
                         famille : le chiffre du pays se situe au lieu de se
                         lire seul. */
                      const monde = MONDE_FAMILLE[row.trade] ?? row.count;
                      return (
                        <li key={row.trade} className="cmap-fam-item">
                          <Link
                            className={`cmap-fam${solo ? ' is-solo' : ''}`}
                            to={`/annuaire/${slugDeTrade(row.trade)}/${slugPays(pays.code)}`}
                            title={`${t(`tradePlural.${row.trade}`)} · ${nom} · ${row.count}${solo ? ` — ${t('cmaps.famSingle').replace('{region}', nomRegion(solo, lang))}` : ''} · ${t('cmaps.famWorld').replace('{n}', String(monde))}`}
                            onClick={() => markFamilleVue(row.trade)}
                          >
                            <span className="cmap-fam-name">{t(`tradePlural.${row.trade}`)}</span>
                            <b>{row.count}</b>
                            {monde > row.count && (
                              <em className="cmap-fam-world">/ {monde}</em>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* La région la plus fournie, famille par famille : la carte ne
                  se contente pas de compter les familles, elle dit où chacune
                  tient vraiment son monde. */}
              {hotRows.length > 0 && (
                <div className="cmap-hot" title={t('cmaps.hotHint')}>
                  <span className="cmap-hot-label">
                    <i className="ri-pulse-line" aria-hidden="true"></i>
                    {t('cmaps.hot')}
                  </span>
                  <ul className="cmap-hot-list">
                    {hotRows.map(({ trade, hot, fiche }) => hot && (
                      <li key={trade} className="cmap-hot-item">
                        <Link
                          className="cmap-hot-link"
                          to={`/annuaire/${slugDeTrade(trade)}/${slugPays(pays.code)}?view=map&wilaya=${encodeURIComponent(hot.wilaya)}`}
                          title={`${t(`tradePlural.${trade}`)} · ${nomRegion(hot.wilaya, lang)} · ${hot.count} — ${t('cmaps.hotHint')}`}
                        >
                          <span className="cmap-hot-trade">{t(`tradePlural.${trade}`)}</span>
                          <span className="cmap-hot-region">
                            <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                            {nomRegion(hot.wilaya, lang)}
                          </span>
                          <b>{hot.count}</b>
                        </Link>
                        {/* La meilleure fiche de cette famille, dans ce pays :
                            la ligne nomme son atelier au lieu de s'arrêter au
                            seul meilleur atelier du pays. */}
                        {fiche && (
                          <Link
                            className="cmap-hot-best"
                            to={`/entreprise/${fiche.id}`}
                            title={`${fiche.name} · ${fiche.rating.toFixed(1)} (${fiche.reviews}) · ${nomRegion(fiche.wilaya, lang)} — ${t('cmaps.hotBestHint')}`}
                          >
                            <i className="ri-star-fill" aria-hidden="true"></i>
                            <span className="cmap-hot-best-name">{fiche.name}</span>
                            <b>{fiche.rating.toFixed(1)}</b>
                            <i className="ri-arrow-right-line" aria-hidden="true"></i>
                          </Link>
                        )}
                        {/* Les fiches de cette famille dans cette région, déjà
                            filtrées : la région se nomme, puis sa liste s'ouvre
                            sans repasser par les filtres. */}
                        <Link
                          className="cmap-hot-files"
                          to={`/annuaire/${slugDeTrade(trade)}/${slugPays(pays.code)}?wilaya=${encodeURIComponent(hot.wilaya)}`}
                          title={`${t(`tradePlural.${trade}`)} · ${nomRegion(hot.wilaya, lang)} · ${hot.count} — ${t('cmaps.hotFilesHint')}`}
                        >
                          <i className="ri-file-list-3-line" aria-hidden="true"></i>
                          <span>{t('cmaps.hotFiles')}</span>
                          <em>{hot.count}</em>
                          <i className="ri-arrow-right-line" aria-hidden="true"></i>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* L'atelier le mieux noté du pays : la carte ne dit pas seulement
                  combien elle compte, elle nomme sa meilleure fiche et y mène
                  d'un clic. */}
              {best && (
                <Link
                  className="cmap-best"
                  to={`/entreprise/${best.id}`}
                  title={`${best.name} · ${t(`trade.${best.trade}`)} · ${nomRegion(best.wilaya, lang)} — ${t('cmaps.bestHint')}`}
                >
                  <i className="ri-star-fill" aria-hidden="true"></i>
                  <span className="cmap-best-body">
                    <span className="cmap-best-name">{best.name}</span>
                    <span className="cmap-best-meta">{best.rating.toFixed(1)} <em>({best.reviews})</em></span>
                  </span>
                  <span className="cmap-best-see">{t('cmaps.bestSee')}</span>
                  <i className="ri-arrow-right-line cmap-best-go" aria-hidden="true"></i>
                </Link>
              )}

              {/* Le geste court de l'aire de cette fiche : deux lignes, le nom
                  de l'aire et ses fiches — de quoi annoncer le voisinage de
                  l'atelier sans coller la carte entière. */}
              {best && airePaysCarte && (
                <CopyTextButton
                  label={t('cmaps.atelierAireCopy')}
                  hint={t('cmaps.atelierAireCopyHint')
                    .replace('{atelier}', best.name)
                    .replace('{region}', t(regionMondeLabelKey(airePaysCarte)))}
                  className="cmaps-sansnote-copy cmap-best-aire"
                  build={() => [
                    t('cmaps.atelierAireCopyLine').replace('{atelier}', best.name),
                    t('cmaps.atelierAireCopyRow')
                      .replace('{region}', t(regionMondeLabelKey(airePaysCarte)))
                      .replace('{files}', String(fichesDesPays(airePaysCarte.pays)))
                      .replace('{unit}', t('cmaps.airesChipFiles')),
                  ].join('\n')}
                />
              )}

              {/* Le second lien de la carte : la région où la famille de cet
                  atelier est la plus fournie, la carte du pays s'ouvrant déjà
                  resserrée dessus. */}
              {best && bestRegion && (
                <Link
                  className="cmap-best-region"
                  to={`/annuaire/${slugDeTrade(best.trade)}/${slugPays(pays.code)}?view=map&wilaya=${encodeURIComponent(bestRegion.wilaya)}`}
                  title={`${t(`tradePlural.${best.trade}`)} · ${nomRegion(bestRegion.wilaya, lang)} · ${bestRegion.count} — ${t('cmaps.bestRegionHint')}`}
                >
                  <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                  <span className="cmap-best-region-lab">{t('cmaps.bestRegion')}</span>
                  <span className="cmap-best-region-name">{nomRegion(bestRegion.wilaya, lang)}</span>
                  <b>{bestRegion.count}</b>
                </Link>
              )}

              {/* Les plumes du pays, genre par genre : la carte ne compte pas
                  seulement les auteurs, elle nomme le plus primé de chaque
                  genre et ouvre sa fiche. */}
              {pens.length > 0 && (
                <div className="cmap-pens" title={t('cmaps.pensHint')}>
                  <span className="cmap-pens-label">
                    <i className="ri-quill-pen-line" aria-hidden="true"></i>
                    {t('cmaps.pens')}
                  </span>
                  {zonesIci.size > 0 && (
                    <span className="cmap-pens-narrow" title={t('cmaps.zoneNote')}>
                      <i className="ri-focus-3-line" aria-hidden="true"></i>
                      {genreLien ? `${t(`genre.${genreLien}`)} · ` : ''}
                      {zonesIci.size} {t('cmaps.penRegions')}
                    </span>
                  )}
                  <ul className="cmap-pens-list">
                    {pens.map(({ genre, count, regions: genreRegions, zones, plume }) => (
                      <li key={genre} className="cmap-pens-item">
                        <div className="cmap-pens-row">
                          <span
                            className="cmap-pens-genre"
                            title={`${t(`genre.${genre}`)} · ${count} ${t('cmaps.penAllRegions')} · ${genreRegions} ${t('cmaps.penRegions')}`}
                          >
                            {t(`genre.${genre}`)}
                            {/* Le compte des plumes du genre, toutes régions
                                confondues, ouvre la carte du pays resserrée
                                sur les régions où ce genre est tenu. */}
                            {zones.length > 0 ? (
                              <Link
                                className="cmap-pens-total"
                                to={`/annuaire?view=map&pays=${pays.code}&${ZONES_PARAM}=${encodeURIComponent(zones.join(','))}&${GENRE_PARAM}=${genre}#cmaps`}
                                title={`${t(`genre.${genre}`)} · ${count} ${t('cmaps.penAllRegions')} — ${t('cmaps.penZonesHint')}`}
                              >
                                {count}
                              </Link>
                            ) : (
                              <b className="cmap-pens-total">{count}</b>
                            )}
                            {genreRegions > 0 && (
                              <span className="cmap-pens-areas" title={t('cmaps.penRegions')}>
                                <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                                {genreRegions}
                              </span>
                            )}
                          </span>
                          <Link
                            className="cmap-pens-link"
                            to={`/auteur/${plume.id}`}
                            title={`${plume.name} · ${plume.awards} ${t('cmaps.penAwards')} · ${plume.books} ${t('cmaps.penBooks')} · ${nomRegion(plume.wilaya, lang)} — ${t('cmaps.pensHint')}`}
                          >
                            <i className="ri-award-line" aria-hidden="true"></i>
                            <span className="cmap-pens-name">{plume.name}</span>
                            {plume.awards > 0 && <b>{plume.awards}</b>}
                            <i className="ri-arrow-right-line" aria-hidden="true"></i>
                          </Link>
                        </div>
                        {/* Toutes les plumes de ce genre dans le pays, la liste
                            déjà filtrée : le genre se nomme, puis s'ouvre. */}
                        <Link
                          className="cmap-pens-all"
                          to={`/annuaire?kind=auteurs&pays=${pays.code}&genre=${genre}`}
                          title={`${t(`genre.${genre}`)} · ${nom} · ${count} — ${t('cmaps.penAllHint')}`}
                        >
                          <i className="ri-list-check" aria-hidden="true"></i>
                          <span>{t('cmaps.penAll')}</span>
                          <em>{count}</em>
                          <i className="ri-arrow-right-line" aria-hidden="true"></i>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <footer className="cmap-foot">
                <button
                  type="button"
                  className="cmap-open"
                  aria-pressed={isActive}
                  onClick={() => onPick(isActive ? '' : pays.code)}
                >
                  <i className={isActive ? 'ri-checkbox-circle-line' : 'ri-filter-3-line'} aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{isActive ? t('cmaps.showAll') : t('cmaps.open')}</span>
                </button>
                <span className="cmap-zoom">
                  <i className="ri-drag-move-2-line" aria-hidden="true"></i>
                  {t('cmaps.zoom')}
                </span>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/** The folded regions, listed in the tooltip of the « +n » button. */
function ouvertsDescr(rest: { wilaya: string; count: number }[], lang: string): string {
  return rest.map((row) => `${nomRegion(row.wilaya, lang)} · ${row.count}`).join(' — ');
}