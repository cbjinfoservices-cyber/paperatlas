/**
 * Les régions parcourues dans l'annuaire, gardées sur l'appareil.
 *
 * Chaque fois qu'un visiteur resserre l'annuaire sur une région, le lieu est
 * inscrit une seule fois dans ce carnet : la fiche d'un atelier peut alors
 * dire combien de régions ont été traversées, et rouvrir la dernière d'un
 * geste — sans que le visiteur ait à retrouver sa place dans le menu.
 *
 * Le carnet est borné : passé deux douzaines de régions, la plus ancienne
 * s'effface. Une région voyage avec son pays, comme dans la mémoire du
 * tableau : deux pays peuvent nommer une même région.
 */
const KEY = 'paperatlas:region-walk';

/* Le carnet des pays : un pays n'a pas besoin d'une région pour être retenu.
   Deux pays peuvent se traverser sous une même région, et l'on revient plus
   souvent au pays qu'à l'une de ses régions. */
const PAYS_KEY = 'paperatlas:pays-walk';

/* Le carnet des métiers : un métier se lit sans lieu, et l'on y revient plus
   souvent qu'à la région où on l'a ouvert. Il se compte donc à part. */
const TRADE_KEY = 'paperatlas:trade-walk';

/** Une région traversée, et le pays qui lui donne son sens. */
export type RegionStop = { pays: string; wilaya: string };

export type RegionWalk = {
  /** Les régions traversées, dans l'ordre où elles ont été ouvertes. */
  stops: RegionStop[];
  /** La dernière d'entre elles : celle que la fiche rouvre. */
  last: RegionStop | null;
};

const EMPTY: RegionWalk = { stops: [], last: null };
const MAX_STOPS = 24;
const MAX_PAYS = 12;

function isStop(value: unknown): value is RegionStop {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return typeof row.wilaya === 'string' && typeof row.pays === 'string';
}

/** Le carnet lu, vide quand rien n'a encore été traversé. */
export function readRegionWalk(): RegionWalk {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY };
    const record = parsed as Record<string, unknown>;
    const stops = Array.isArray(record.stops) ? record.stops.filter(isStop) : [];
    const last = isStop(record.last) ? record.last : stops.length ? stops[stops.length - 1] : null;
    return { stops, last };
  } catch {
    return { ...EMPTY };
  }
}

/**
 * Inscrit une région traversée. Une région déjà vue ne se compte pas deux
 * fois : elle remonte simplement en tête de la dernière visite.
 */
export function noteRegionWalk(pays: string, wilaya: string): void {
  if (typeof window === 'undefined') return;
  const region = wilaya.trim();
  if (!region) return;
  const code = pays.trim();
  const walk = readRegionWalk();
  const rest = walk.stops.filter((stop) => !(stop.wilaya === region && stop.pays === code));
  const stops = [...rest, { pays: code, wilaya: region }].slice(-MAX_STOPS);
  const next: RegionWalk = { stops, last: { pays: code, wilaya: region } };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible — le parcours n'est simplement pas retenu */
  }
}

/** Les pays traversés, dans l'ordre où ils ont été ouverts. */
export type PaysWalk = {
  stops: string[];
  /** Le dernier traversé : celui que la fiche rouvre. */
  last: string | null;
};

const EMPTY_PAYS: PaysWalk = { stops: [], last: null };

function readCodes(record: Record<string, unknown>): string[] {
  return Array.isArray(record.stops)
    ? record.stops.filter((code): code is string => typeof code === 'string' && code.length > 0)
    : [];
}

/** Le carnet des pays, vide quand aucun pays n'a été ouvert. */
export function readPaysWalk(): PaysWalk {
  if (typeof window === 'undefined') return { ...EMPTY_PAYS };
  try {
    const raw = window.localStorage.getItem(PAYS_KEY);
    if (!raw) return { ...EMPTY_PAYS };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY_PAYS };
    const record = parsed as Record<string, unknown>;
    const stops = readCodes(record);
    const last =
      typeof record.last === 'string' && record.last
        ? record.last
        : stops.length
          ? stops[stops.length - 1]
          : null;
    return { stops, last };
  } catch {
    return { ...EMPTY_PAYS };
  }
}

/**
 * Inscrit un pays traversé. Un pays déjà vu ne se compte pas deux fois : il
 * remonte simplement en tête de la dernière visite.
 */
export function notePaysWalk(code: string): void {
  if (typeof window === 'undefined') return;
  const pays = code.trim();
  if (!pays) return;
  const walk = readPaysWalk();
  const rest = walk.stops.filter((stop) => stop !== pays);
  const stops = [...rest, pays].slice(-MAX_PAYS);
  try {
    window.localStorage.setItem(PAYS_KEY, JSON.stringify({ stops, last: pays }));
  } catch {
    /* stockage indisponible — le parcours n'est simplement pas retenu */
  }
}

/** Les métiers traversés, dans l'ordre où ils ont été ouverts. */
export type TradeWalk = {
  stops: string[];
  /** Le dernier traversé : celui que la fiche rouvre. */
  last: string | null;
};

const EMPTY_TRADE: TradeWalk = { stops: [], last: null };
const MAX_TRADE = 12;

/** Le carnet des métiers, vide quand aucun métier n'a été ouvert. */
export function readTradeWalk(): TradeWalk {
  if (typeof window === 'undefined') return { ...EMPTY_TRADE };
  try {
    const raw = window.localStorage.getItem(TRADE_KEY);
    if (!raw) return { ...EMPTY_TRADE };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY_TRADE };
    const record = parsed as Record<string, unknown>;
    const stops = readCodes(record);
    const last =
      typeof record.last === 'string' && record.last
        ? record.last
        : stops.length
          ? stops[stops.length - 1]
          : null;
    return { stops, last };
  } catch {
    return { ...EMPTY_TRADE };
  }
}

/**
 * Inscrit un métier traversé. Un métier déjà vu ne se compte pas deux fois :
 * il remonte simplement en tête de la dernière visite.
 */
export function noteTradeWalk(trade: string): void {
  if (typeof window === 'undefined') return;
  const metier = trade.trim();
  if (!metier) return;
  const walk = readTradeWalk();
  const rest = walk.stops.filter((stop) => stop !== metier);
  const stops = [...rest, metier].slice(-MAX_TRADE);
  try {
    window.localStorage.setItem(TRADE_KEY, JSON.stringify({ stops, last: metier }));
  } catch {
    /* stockage indisponible — le métier n'est simplement pas retenu */
  }
}

/**
 * Efface le carnet de parcours : régions, pays et métiers oublient d'un coup
 * d'où l'on venait. C'est un geste de la fiche, pas un réglage du tableau :
 * les filtres de l'annuaire, eux, ne bougent pas.
 */
export function clearWalk(): void {
  clearWalkBook('region');
  clearWalkBook('pays');
  clearWalkBook('trade');
}

/** Les trois carnets du parcours, chacun effaçable à part. */
export type WalkBook = 'region' | 'pays' | 'trade';

/**
 * Efface un seul carnet, sans toucher aux deux autres.
 *
 * Les trois carnets se lisent ensemble mais ne se valent pas : qui efface les
 * pays veut souvent garder ses régions, et l'inverse. Un seul geste ne doit
 * donc pas emporter tout le parcours.
 */
export function clearWalkBook(book: WalkBook): void {
  if (typeof window === 'undefined') return;
  const key = book === 'region' ? KEY : book === 'pays' ? PAYS_KEY : TRADE_KEY;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* stockage indisponible — rien à effacer */
  }
}