import { REGIONS_MONDE, type RegionMondeKey } from '@/lib/worldRegions';

/**
 * Les aires du monde déjà cadrées sur la carte d'un pays, gardées sur
 * l'appareil : le compteur posé sous la carte dit combien ont été lues, et le
 * dernier appui se rouvre d'un clic sans repasser par la rangée. L'ordre de
 * pose est conservé, si bien que la dernière aire pressée se relit telle
 * quelle — sans table écrite à la main.
 */
const CLE = 'paperatlas:cmap:aires';

/** Combien de tournées ont été copiées depuis cet appareil, et quand la
 *  dernière est partie : le compteur de la carte s'en souvient sans rien
 *  écrire au compte — une tournée copiée est un message envoyé, pas une
 *  donnée du répertoire. */
const TOURS_CLE = 'paperatlas:cmap:tours';
const TOURS_AT_CLE = 'paperatlas:cmap:toursAt';
/** La dernière aire réellement emportée par une tournée : le survol du compte
 *  la nomme, pour savoir où s'arrête le message sans le coller. */
const TOURS_AIRE_CLE = 'paperatlas:cmap:toursAire';

/** Combien d'aires ont été copiées seules depuis cet appareil, et quand la
 *  dernière est partie : la rangée d'un pays en tient le compte à côté de
 *  celui des tournées — une aire seule copiée est un message envoyé, pas une
 *  donnée du répertoire. */
const SEULES_CLE = 'paperatlas:cmap:seules';
const SEULES_AT_CLE = 'paperatlas:cmap:seulesAt';
const SEULES_AIRE_CLE = 'paperatlas:cmap:seulesAire';
/** Les aires distinctes déjà copiées seules : le survol de la pastille ajoutée
 *  situe le geste en comptant celles de la note qui sont déjà parties — une
 *  aire se compte une fois, même recopiée des jours plus tard. */
const SEULES_AIRES_CLE = 'paperatlas:cmap:seulesAires';
/** Les pays dont l'aire a déjà été copiée seule : la pastille ajoutée de la
 *  note compte ceux d'une aire qui n'ont encore jamais été copiés seuls, sans
 *  confondre deux pays d'une même aire. */
const SEULES_PAYS_CLE = 'paperatlas:cmap:seulesPays';

/** Combien de fois les aires complètes ont été copiées, et quand la dernière
 *  est partie : le petit compte posé près du compteur de l'en-tête s'en
 *  souvient, comme celui des tournées — une copie est un message envoyé, pas
 *  une donnée du répertoire. */
const COMPLETES_CLE = 'paperatlas:cmap:completes';
const COMPLETES_AT_CLE = 'paperatlas:cmap:completesAt';

/** Combien de fois la copie courte — les noms et les fiches — a servi, et quand
 *  la dernière fois : le petit compte posé sous la rangée d'un pays s'en
 *  souvient, comme celui des aires complètes de l'en-tête. */
const COURTES_CLE = 'paperatlas:cmap:courtes';
const COURTES_AT_CLE = 'paperatlas:cmap:courtesAt';

/** Combien de fois l’aire de chaque fiche — un atelier, une plume — a été
 *  copiée depuis cet appareil, et quand la dernière fois : la fiche tient le
 *  compte de son aire seule, sans additionner celles des autres. */
const FICHES_CLE = 'paperatlas:cmap:fichesAires';

/** Combien de fois une aire est partie depuis les cartes de l’annuaire —
 *  atelier comme plume —, et quand la dernière fois : la rangée d’un pays
 *  tient ce compte à côté de celui des copies courtes, pour distinguer les
 *  gestes partis d’une carte de ceux partis d’une fiche. */
const CARTES_CLE = 'paperatlas:cmap:cartes';
const CARTES_AT_CLE = 'paperatlas:cmap:cartesAt';
/** Les pays de chaque aire déjà partis depuis une carte de l’annuaire — un
 *  atelier, une plume, une annonce : le survol du compte posé dans le pied
 *  d’une carte les nomme un à un, pour vérifier ce qui a quitté l’appareil
 *  sans rouvrir chaque fiche. */
const CARTES_PAYS_CLE = 'paperatlas:cmap:cartesPays';
/** Les aires distinctes déjà parties depuis une carte de l’annuaire : le
 *  survol du compte les dénombre et les nomme, au lieu de ne compter que les
 *  pays — une aire se compte une fois, même recopiée depuis trois cartes. */
const CARTES_AIRES_CLE = 'paperatlas:cmap:cartesAires';
/** Le jour de la dernière copie de chaque aire partie d’une carte : le survol
 *  de la pastille des aires des cartes nomme les aires une à une avec leur
 *  jour, si bien que l’on sait ce qui a quitté l’appareil et quand. */
const CARTES_AIRES_AT_CLE = 'paperatlas:cmap:cartesAiresAt';

/** L'annonce posée sur la fenêtre quand le compte des tournées change : la
 *  rangée d'une page de pays et la note des aires lisent la même mémoire, si
 *  bien que le chiffre se relit des deux côtés sans recharger la page. */
export const TOURS_EVENT = 'paperatlas:cmap:tours';

/** Prévient les deux côtés qu'une tournée est partie, ou que le carnet
 *  vient d'être effacé. */
function annoncerTours(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(TOURS_EVENT));
}

export type ToursCopiees = {
  /** Combien de tournées sont parties de cet appareil. */
  count: number;
  /** L'heure de la dernière copie, en millisecondes, ou null. */
  last: number | null;
  /** La dernière aire réellement copiée, "" quand rien n'est parti. */
  aire: RegionMondeKey | '';
};

/** Le compte vide, quand rien n'a encore été copié. */
const AUCUNE_TOUR: ToursCopiees = { count: 0, last: null, aire: '' };

export type AiresSeulesCopiees = {
  /** Combien d'aires ont été copiées seules depuis cet appareil. */
  count: number;
  /** L'heure de la dernière copie, en millisecondes, ou null. */
  last: number | null;
  /** La dernière aire copiée seule, "" quand rien n'est parti. */
  aire: RegionMondeKey | '';
  /** Les aires distinctes déjà parties seules, dans l'ordre des aires du monde. */
  aires: RegionMondeKey[];
  /** Les pays déjà copiés seuls, dans l'ordre où ils sont partis. */
  pays: string[];
};

const AUCUNE_SEULE: AiresSeulesCopiees = { count: 0, last: null, aire: '', aires: [], pays: [] };

export type AiresCompletesCopiees = {
  /** Combien de fois des aires complètes ont été emportées d'un geste. */
  count: number;
  /** L'heure de la dernière copie, en millisecondes, ou null. */
  last: number | null;
};

const AUCUNE_COMPLETE: AiresCompletesCopiees = { count: 0, last: null };

export type AiresCadrees = {
  /** Les aires cadrées au moins une fois, dans l'ordre des aires du monde. */
  aires: RegionMondeKey[];
  /** La dernière aire pressée, "" quand rien n'a encore été cadré. */
  derniere: RegionMondeKey | '';
};

const VIDE: AiresCadrees = { aires: [], derniere: '' };

/** Une clef d'aire réellement portée par la liste des aires du monde. */
function estAire(value: unknown): value is RegionMondeKey {
  return typeof value === 'string' && REGIONS_MONDE.some((region) => region.key === value);
}

/** Les clefs dans l'ordre des aires du monde, sans doublon. */
function ordonner(keys: RegionMondeKey[]): RegionMondeKey[] {
  return REGIONS_MONDE
    .map((region) => region.key)
    .filter((key) => keys.includes(key));
}

/** Les pays lus sur la mémoire : des codes non vides, sans doublon. */
function lePays(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((code): code is string => typeof code === 'string' && code.length > 0);
  } catch {
    return [];
  }
}

/** Les aires cadrées lues sur l'appareil, ou rien quand la mémoire est vide. */
export function readAiresCadrees(): AiresCadrees {
  if (typeof window === 'undefined') return VIDE;
  try {
    const raw = window.localStorage.getItem(CLE);
    if (!raw) return VIDE;
    const parsed = JSON.parse(raw) as { aires?: unknown };
    const posees = Array.isArray(parsed.aires)
      ? parsed.aires.filter(estAire)
      : [];
    if (posees.length === 0) return VIDE;
    return {
      aires: ordonner(posees),
      /* L'ordre de pose est tenu par la mémoire : la dernière entrée est la
         dernière aire pressée, même si elle a été pressée deux fois. */
      derniere: posees[posees.length - 1],
    };
  } catch {
    return VIDE;
  }
}

/**
 * Une aire vient d'être cadrée : elle entre au carnet, remonte en dernière
 * position, et les autres restent comptées.
 */
export function markAireCadree(key: RegionMondeKey): AiresCadrees {
  const courantes = readAiresCadrees();
  const posees: RegionMondeKey[] = [
    ...REGIONS_MONDE
      .map((region) => region.key)
      .filter((autre) => autre !== key && courantes.aires.includes(autre)),
    key,
  ];
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CLE, JSON.stringify({ aires: posees }));
    } catch {
      /* mémoire indisponible — le compte repart simplement de ce qu'on lit */
    }
  }
  return { aires: ordonner(posees), derniere: key };
}

/** La gomme du compteur : le carnet se vide, la carte reste où elle est. */
export function clearAiresCadrees(): AiresCadrees {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(CLE);
      /* Le compte des tournées part avec le cadrage : une carte remise à
         zéro repart d'une tournée vierge, et le compteur des copies avec
         elle, comme celui des feuilles emportées. */
      window.localStorage.removeItem(TOURS_CLE);
      window.localStorage.removeItem(TOURS_AT_CLE);
      window.localStorage.removeItem(TOURS_AIRE_CLE);
      window.localStorage.removeItem(SEULES_CLE);
      window.localStorage.removeItem(SEULES_AT_CLE);
      window.localStorage.removeItem(SEULES_AIRE_CLE);
      window.localStorage.removeItem(SEULES_AIRES_CLE);
      window.localStorage.removeItem(SEULES_PAYS_CLE);
      window.localStorage.removeItem(COMPLETES_CLE);
      window.localStorage.removeItem(COMPLETES_AT_CLE);
      window.localStorage.removeItem(COURTES_CLE);
      window.localStorage.removeItem(COURTES_AT_CLE);
      window.localStorage.removeItem(FICHES_CLE);
      window.localStorage.removeItem(CARTES_CLE);
      window.localStorage.removeItem(CARTES_AT_CLE);
      window.localStorage.removeItem(CARTES_PAYS_CLE);
      window.localStorage.removeItem(CARTES_AIRES_CLE);
      window.localStorage.removeItem(CARTES_AIRES_AT_CLE);
      window.localStorage.removeItem(RELEVES_CLE);
      window.localStorage.removeItem(RELEVES_TOUS_CLE);
      window.localStorage.removeItem(RELEVES_TOUS_AT_CLE);
      window.localStorage.removeItem(RELEVES_TOUS_AIRES_CLE);
      window.localStorage.removeItem(RELEVES_CHEMINS_CLE);
      window.localStorage.removeItem(RELEVES_CHEMINS_AIRES_CLE);
      window.localStorage.removeItem(GOMMES_CLE);
      window.localStorage.removeItem(GOMMES_AT_CLE);
      window.localStorage.removeItem(GOMMES_AIRES_CLE);
      window.localStorage.removeItem(GOMMES_AIRES_AT_CLE);
      window.localStorage.removeItem(GOMMES_FILS_CLE);
      window.localStorage.removeItem(GOMMES_PREMIER_CLE);
    } catch {
      /* mémoire indisponible — rien à effacer */
    }
  }
  /* Le compte des tournées et celui des aires seules sont repartis de zéro :
     les deux côtés les relisent. */
  annoncerTours();
  return VIDE;
}

/** Les tournées copiées depuis l'appareil, lues d'un geste. */
export function readTourCopies(): ToursCopiees {
  if (typeof window === 'undefined') return AUCUNE_TOUR;
  try {
    const rawCount = window.localStorage.getItem(TOURS_CLE);
    const rawStamp = window.localStorage.getItem(TOURS_AT_CLE);
    const rawAire = window.localStorage.getItem(TOURS_AIRE_CLE);
    const compte = rawCount ? Number(rawCount) : 0;
    const stamp = rawStamp ? Number(rawStamp) : 0;
    return {
      count: Number.isFinite(compte) && compte > 0 ? Math.floor(compte) : 0,
      last: Number.isFinite(stamp) && stamp > 0 ? stamp : null,
      aire: estAire(rawAire) ? rawAire : '',
    };
  } catch {
    return AUCUNE_TOUR;
  }
}

/**
 * Une tournée vient d'être copiée : le compte avance d'un cran et l'heure de
 * la dernière est reposée, pour que le compteur se relise sans recharger la
 * page — la date du geste s'écrit au moment du clic, jamais à l'ouverture.
 */
export function markTourCopied(lastAire?: RegionMondeKey): ToursCopiees {
  const courantes = readTourCopies();
  /* La dernière aire emportée est celle du dernier geste : la tournée entière
     donne sa dernière ligne, la tournée d'un pays la sienne. Sans aire
     désignée, la précédente reste — le survol ne se vide pas d'un coup. */
  const aire: RegionMondeKey | '' = estAire(lastAire) ? lastAire : courantes.aire;
  const next: ToursCopiees = { count: courantes.count + 1, last: Date.now(), aire };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(TOURS_CLE, String(next.count));
      window.localStorage.setItem(TOURS_AT_CLE, String(next.last));
      if (next.aire) window.localStorage.setItem(TOURS_AIRE_CLE, next.aire);
    } catch {
      /* mémoire indisponible — le compte repart de ce qu'on lit */
    }
  }
  /* Une tournée vient de partir : le chiffre se relit des deux côtés. */
  annoncerTours();
  return next;
}

/** Les aires copiées seules depuis l'appareil, lues d'un geste. */
export function readAireSeuleCopies(): AiresSeulesCopiees {
  if (typeof window === 'undefined') return AUCUNE_SEULE;
  try {
    const rawCount = window.localStorage.getItem(SEULES_CLE);
    const rawStamp = window.localStorage.getItem(SEULES_AT_CLE);
    const rawAire = window.localStorage.getItem(SEULES_AIRE_CLE);
    const rawListe = window.localStorage.getItem(SEULES_AIRES_CLE);
    const rawPays = window.localStorage.getItem(SEULES_PAYS_CLE);
    const compte = rawCount ? Number(rawCount) : 0;
    const stamp = rawStamp ? Number(rawStamp) : 0;
    let posees: RegionMondeKey[] = [];
    if (rawListe) {
      const parsed = JSON.parse(rawListe) as unknown;
      posees = Array.isArray(parsed) ? ordonner(parsed.filter(estAire)) : [];
    }
    return {
      count: Number.isFinite(compte) && compte > 0 ? Math.floor(compte) : 0,
      last: Number.isFinite(stamp) && stamp > 0 ? stamp : null,
      aire: estAire(rawAire) ? rawAire : '',
      aires: posees,
      pays: lePays(rawPays),
    };
  } catch {
    return AUCUNE_SEULE;
  }
}

/**
 * Une aire vient d'être copiée seule : le compte avance d'un cran et l'heure
 * de la dernière copie est reposée, si bien que la rangée d'un pays relit le
 * chiffre sans recharger la page.
 */
export function markAireSeuleCopied(
  aire?: RegionMondeKey,
  pays?: string,
): AiresSeulesCopiees {
  const courantes = readAireSeuleCopies();
  const derniere: RegionMondeKey | '' = estAire(aire) ? aire : courantes.aire;
  /* Le pays dont l'aire vient d'être copiée seule : il entre au carnet une
     fois seulement, si bien que la pastille ajoutée de la note ne compte
     jamais deux fois le même pays. */
  const paysCopies: string[] = pays && !courantes.pays.includes(pays)
    ? [...courantes.pays, pays]
    : courantes.pays;
  /* L'aire entre au carnet des aires distinctes, une fois seulement : le
     survol de la pastille ajoutée compte celles de la note qui sont parties
     sans compter deux fois la même. */
  const copiees: RegionMondeKey[] = estAire(aire) && !courantes.aires.includes(aire)
    ? [...courantes.aires, aire]
    : courantes.aires;
  const next: AiresSeulesCopiees = {
    count: courantes.count + 1,
    last: Date.now(),
    aire: derniere,
    aires: copiees,
    pays: paysCopies,
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SEULES_CLE, String(next.count));
      window.localStorage.setItem(SEULES_AT_CLE, String(next.last));
      if (next.aire) window.localStorage.setItem(SEULES_AIRE_CLE, next.aire);
      if (copiees.length > 0) {
        window.localStorage.setItem(SEULES_AIRES_CLE, JSON.stringify(copiees));
      }
      if (paysCopies.length > 0) {
        window.localStorage.setItem(SEULES_PAYS_CLE, JSON.stringify(paysCopies));
      }
    } catch {
      /* mémoire indisponible — le compte repart de ce qu'on lit */
    }
  }
  /* Une aire seule vient de partir : la rangée relit son compte. */
  annoncerTours();
  return next;
}

/** Les aires complètes copiées depuis l'appareil : le compte et le jour de
 *  la dernière, lus d'un geste par les deux panneaux. */
export function readAiresCompletesCopies(): AiresCompletesCopiees {
  if (typeof window === 'undefined') return AUCUNE_COMPLETE;
  try {
    const rawCount = window.localStorage.getItem(COMPLETES_CLE);
    const rawStamp = window.localStorage.getItem(COMPLETES_AT_CLE);
    const compte = rawCount ? Number(rawCount) : 0;
    const stamp = rawStamp ? Number(rawStamp) : 0;
    return {
      count: Number.isFinite(compte) && compte > 0 ? Math.floor(compte) : 0,
      last: Number.isFinite(stamp) && stamp > 0 ? stamp : null,
    };
  } catch {
    return AUCUNE_COMPLETE;
  }
}

/**
 * Des aires complètes viennent d'être copiées : le compte avance d'un cran et
 * l'heure de la dernière copie est reposée, si bien que le petit compte de
 * l'en-tête se relit sans recharger la page.
 */
export function markAiresCompletesCopied(): AiresCompletesCopiees {
  const courantes = readAiresCompletesCopies();
  const next: AiresCompletesCopiees = {
    count: courantes.count + 1,
    last: Date.now(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(COMPLETES_CLE, String(next.count));
      window.localStorage.setItem(COMPLETES_AT_CLE, String(next.last));
    } catch {
      /* mémoire indisponible — le compte repart de ce qu'on lit */
    }
  }
  /* Des aires complètes viennent de partir : les deux côtés relisent. */
  annoncerTours();
  return next;
}

/** La copie courte — les noms et les fiches — lue sur l'appareil : le petit
 *  compte posé sous la rangée d'un pays dit combien de fois elle a servi et
 *  le jour de la dernière, comme celui des aires complètes de l'en-tête. */
export function readAiresCourtesCopies(): AiresCompletesCopiees {
  if (typeof window === 'undefined') return AUCUNE_COMPLETE;
  try {
    const rawCount = window.localStorage.getItem(COURTES_CLE);
    const rawStamp = window.localStorage.getItem(COURTES_AT_CLE);
    const compte = rawCount ? Number(rawCount) : 0;
    const stamp = rawStamp ? Number(rawStamp) : 0;
    return {
      count: Number.isFinite(compte) && compte > 0 ? Math.floor(compte) : 0,
      last: Number.isFinite(stamp) && stamp > 0 ? stamp : null,
    };
  } catch {
    return AUCUNE_COMPLETE;
  }
}

/**
 * La copie courte vient de servir : le compte avance d'un cran et l'heure de
 * la dernière est reposée, pour que le petit compte se relise sans recharger
 * la page — la date du geste s'écrit au moment du clic.
 */
export function markAiresCourteCopied(): AiresCompletesCopiees {
  const courantes = readAiresCourtesCopies();
  const next: AiresCompletesCopiees = {
    count: courantes.count + 1,
    last: Date.now(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(COURTES_CLE, String(next.count));
      window.localStorage.setItem(COURTES_AT_CLE, String(next.last));
    } catch {
      /* mémoire indisponible — le compte repart de ce qu'on lit */
    }
  }
  /* Une copie courte vient de partir : les deux panneaux relisent. */
  annoncerTours();
  return next;
}

/** Les comptes d’aires des fiches, lus d’un geste : une entrée par aire, avec
 *  son nombre de copies et le jour de la dernière. Une mémoire illisible
 *  repart d’un carnet vide plutôt que de faire tomber la fiche. */
function litComptesAires(): Record<string, { count: number; last: number }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(FICHES_CLE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const sortie: Record<string, { count: number; last: number }> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
      if (!estAire(key) || !value || typeof value !== 'object') return;
      const row = value as { count?: unknown; last?: unknown };
      const compte = Number(row.count);
      const stamp = Number(row.last);
      if (!Number.isFinite(compte) || compte <= 0) return;
      sortie[key] = {
        count: Math.floor(compte),
        last: Number.isFinite(stamp) && stamp > 0 ? stamp : 0,
      };
    });
    return sortie;
  } catch {
    return {};
  }
}

/** Combien de fois l’aire d’une fiche a été copiée depuis cet appareil, et le
 *  jour de la dernière : le petit compte posé sous le geste le dit. */
export function readAireFicheCopies(aire: RegionMondeKey | ''): AiresCompletesCopiees {
  if (!estAire(aire)) return AUCUNE_COMPLETE;
  const row = litComptesAires()[aire];
  if (!row) return AUCUNE_COMPLETE;
  return { count: row.count, last: row.last > 0 ? row.last : null };
}

/**
 * L’aire d’une fiche vient d’être copiée : le compte de cette aire avance d’un
 * cran et l’heure de la dernière copie est reposée, si bien que la fiche se
 * relit sans recharger la page — les autres aires ne bougent pas.
 */
export function markAireFicheCopied(aire: RegionMondeKey): AiresCompletesCopiees {
  if (!estAire(aire)) return AUCUNE_COMPLETE;
  const tous = litComptesAires();
  const courante = tous[aire];
  const next = {
    count: (courante?.count ?? 0) + 1,
    last: Date.now(),
  };
  tous[aire] = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(FICHES_CLE, JSON.stringify(tous));
    } catch {
      /* mémoire indisponible — le compte repart de ce qu’on lit */
    }
  }
  annoncerTours();
  return { count: next.count, last: next.last };
}

/**
 * La gomme du seul compte d’une aire, sur une fiche : cette aire repart de
 * zéro et les autres gardent le leur — le carnet des aires, le cadrage et les
 * autres comptes restent intacts.
 */
export function clearAireFicheCopies(aire: RegionMondeKey): AiresCompletesCopiees {
  if (!estAire(aire)) return AUCUNE_COMPLETE;
  const tous = litComptesAires();
  if (!tous[aire]) return AUCUNE_COMPLETE;
  delete tous[aire];
  if (typeof window !== 'undefined') {
    try {
      if (Object.keys(tous).length === 0) {
        window.localStorage.removeItem(FICHES_CLE);
      } else {
        window.localStorage.setItem(FICHES_CLE, JSON.stringify(tous));
      }
    } catch {
      /* mémoire indisponible — rien à effacer */
    }
  }
  /* Le compte est reparti de zéro : toutes les fiches de cette aire relisent. */
  annoncerTours();
  return AUCUNE_COMPLETE;
}

/** Les aires copiées depuis les cartes de l’annuaire — atelier comme plume —,
 *  lues d’un geste : le compte et le jour de la dernière, comme celui des
 *  copies courtes posé à côté dans la rangée d’un pays. */
export function readAiresCartesCopies(): AiresCompletesCopiees {
  if (typeof window === 'undefined') return AUCUNE_COMPLETE;
  try {
    const rawCount = window.localStorage.getItem(CARTES_CLE);
    const rawStamp = window.localStorage.getItem(CARTES_AT_CLE);
    const compte = rawCount ? Number(rawCount) : 0;
    const stamp = rawStamp ? Number(rawStamp) : 0;
    return {
      count: Number.isFinite(compte) && compte > 0 ? Math.floor(compte) : 0,
      last: Number.isFinite(stamp) && stamp > 0 ? stamp : null,
    };
  } catch {
    return AUCUNE_COMPLETE;
  }
}

/**
 * Une aire vient d’être copiée depuis une carte de l’annuaire : le compte
 * avance d’un cran et l’heure de la dernière est reposée, pour que la rangée
 * d’un pays relise le chiffre sans recharger la page. Le pays d’où le geste
 * est parti entre au carnet une fois seulement : le survol du compte des
 * cartes les nomme, sans compter deux fois le même.
 */
export function markAireCarteCopied(
  aire?: RegionMondeKey,
  pays?: string,
): AiresCompletesCopiees {
  const courantes = readAiresCartesCopies();
  const next: AiresCompletesCopiees = {
    count: courantes.count + 1,
    last: Date.now(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CARTES_CLE, String(next.count));
      window.localStorage.setItem(CARTES_AT_CLE, String(next.last));
      if (estAire(aire)) {
        const tous = litCartesPays();
        const deja = tous[aire] ?? [];
        if (pays && !deja.includes(pays)) {
          tous[aire] = [...deja, pays];
          window.localStorage.setItem(CARTES_PAYS_CLE, JSON.stringify(tous));
        }
        /* L’aire entre au carnet des aires distinctes, une fois seulement :
           le survol du compte les dénombre sans compter deux fois la même. */
        const aires = litCartesAires();
        if (!aires.includes(aire)) {
          window.localStorage.setItem(
            CARTES_AIRES_CLE,
            JSON.stringify(ordonner([...aires, aire])),
          );
        }
        /* Le jour de la dernière copie de cette aire est reposé : le survol
           de la pastille les nomme une à une, chacune avec sa date. */
        const jours = litCartesAiresAts();
        jours[aire] = Date.now();
        window.localStorage.setItem(CARTES_AIRES_AT_CLE, JSON.stringify(jours));
      }
    } catch {
      /* mémoire indisponible — le compte repart de ce qu’on lit */
    }
  }
  /* Une aire vient de partir d’une carte : les deux côtés relisent. */
  annoncerTours();
  return next;
}

/** Les pays lus au carnet des cartes, par aire : une mémoire illisible repart
 *  d’un carnet vide plutôt que de faire tomber la carte. */
function litCartesPays(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CARTES_PAYS_CLE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const sortie: Record<string, string[]> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
      if (!estAire(key) || !Array.isArray(value)) return;
      const codes = value.filter(
        (code): code is string => typeof code === 'string' && code.length > 0,
      );
      if (codes.length > 0) sortie[key] = codes;
    });
    return sortie;
  } catch {
    return {};
  }
}

/** Les pays d’une aire déjà partis d’une carte, dans l’ordre du geste : le
 *  survol du compte les nomme, pour vérifier ce qui a quitté l’appareil. */
export function readAireCartePays(aire: RegionMondeKey | ''): string[] {
  if (!estAire(aire)) return [];
  return litCartesPays()[aire] ?? [];
}

/** Les aires distinctes lues au carnet des cartes : une mémoire illisible
 *  repart d’un carnet vide plutôt que de faire tomber la carte. */
function litCartesAires(): RegionMondeKey[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CARTES_AIRES_CLE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return ordonner(parsed.filter(estAire));
  } catch {
    return [];
  }
}

/** Les aires distinctes déjà parties d’une carte de l’annuaire, dans l’ordre
 *  des aires du monde : le survol du compte les dénombre et les nomme, pour
 *  vérifier ce qui a quitté l’appareil sans rouvrir une seule fiche. */
export function readAireCartesAires(): RegionMondeKey[] {
  return litCartesAires();
}

/** Les jours de la dernière copie, lus au carnet des cartes : une mémoire
 *  illisible repart d’un carnet vide plutôt que de faire tomber la carte. */
function litCartesAiresAts(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CARTES_AIRES_AT_CLE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const sortie: Record<string, number> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
      if (!estAire(key)) return;
      const stamp = Number(value);
      if (!Number.isFinite(stamp) || stamp <= 0) return;
      sortie[key] = stamp;
    });
    return sortie;
  } catch {
    return {};
  }
}

/** Le jour de la dernière copie de chaque aire partie d’une carte : le survol
 *  de la pastille les nomme une à une, chacune avec sa date, pour vérifier ce
 *  qui a quitté l’appareil et quand. */
export function readAireCartesAiresAts(): Record<string, number> {
  return litCartesAiresAts();
}

/** Le jour du dernier relevé de fils copié depuis la messagerie de la
 *  console, aire par aire : le compte des fils d’une aire dit ainsi quand le
 *  relevé est parti pour la dernière fois, sans le confondre avec les copies
 *  d’une fiche ni d’une carte. */
const RELEVES_CLE = 'paperatlas:cmap:releves';

/** Combien de fois le relevé de toutes les aires est parti depuis l'en-tête de
 *  la messagerie de la console, et le jour de la dernière fois : le petit
 *  compte posé à côté du geste s'en souvient, sans se confondre avec le
 *  relevé d'une seule aire ni avec les copies d'une fiche ou d'une carte. */
const RELEVES_TOUS_CLE = 'paperatlas:cmap:relevesTous';
const RELEVES_TOUS_AT_CLE = 'paperatlas:cmap:relevesTousAt';
/** Les aires distinctes déjà emportées par un relevé d'ensemble : l'en-tête
 *  dit combien d'aires ont quitté la boîte au moins une fois, sans compter
 *  deux fois celle qui revient d'un geste à l'autre. */
const RELEVES_TOUS_AIRES_CLE = 'paperatlas:cmap:relevesTousAires';

/** Les deux chemins d'un relevé d'aire — l'en-tête d'un groupe et l'appui long
 *  sur la pastille d'un fil — comptés séparément : l'en-tête de la messagerie
 *  distingue ce qui est parti d'un groupe de ce qui est parti d'une ligne, au
 *  lieu d'additionner deux gestes qui ne se découvrent pas de la même façon. */
const RELEVES_CHEMINS_CLE = 'paperatlas:cmap:relevesChemins';

/** Le dernier relevé de chaque aire, par chemin : la pastille d'aire d'un fil
 *  dit ainsi, au survol, si son relevé est déjà parti d'un en-tête de groupe ou
 *  d'un appui long sur une ligne — au lieu de ne compter que les gestes de
 *  l'appareil entier. */
const RELEVES_CHEMINS_AIRES_CLE = 'paperatlas:cmap:relevesCheminsAires';

/** D'où un relevé d'aire est parti : l'en-tête de son groupe, ou la pastille
 *  d'aire tenue longue sur une ligne de fil. */
export type CheminReleve = 'entete' | 'ligne';

export type RelevesChemins = {
  /** Les relevés partis de l'en-tête d'un groupe. */
  entetes: number;
  /** Les relevés emportés d'un appui long sur la pastille d'un fil. */
  lignes: number;
};

const AUCUN_CHEMIN: RelevesChemins = { entetes: 0, lignes: 0 };

export type RelevesTousCopies = {
  /** Combien de fois le relevé de toutes les aires est parti. */
  count: number;
  /** L'heure du dernier départ, en millisecondes, ou null. */
  last: number | null;
  /** Les aires distinctes déjà parties d'un relevé d'ensemble, dans l'ordre
   *  des aires du monde. */
  aires: RegionMondeKey[];
};

const AUCUN_RELEVE_TOUS: RelevesTousCopies = { count: 0, last: null, aires: [] };

/** Les jours des relevés lus sur l’appareil : une mémoire illisible repart
 *  d’un carnet vide plutôt que de faire tomber la liste des fils. */
function litReleves(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(RELEVES_CLE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const sortie: Record<string, number> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
      if (!estAire(key)) return;
      const stamp = Number(value);
      if (!Number.isFinite(stamp) || stamp <= 0) return;
      sortie[key] = stamp;
    });
    return sortie;
  } catch {
    return {};
  }
}

/** Le jour du dernier relevé de chaque aire, lu d’un geste : les fils d’une
 *  aire montrent sous leur compte depuis quand le relevé est parti. */
export function readAireRelevesJours(): Record<string, number> {
  return litReleves();
}

/** Les deux chemins du relevé d’aire, lus d’un geste : le nombre de relevés
 *  partis d’un en-tête de groupe et celui des relevés emportés depuis une
 *  ligne de fil. Une mémoire illisible repart d’un compte vide. */
export function readAireRelevesChemins(): RelevesChemins {
  if (typeof window === 'undefined') return AUCUN_CHEMIN;
  try {
    const raw = window.localStorage.getItem(RELEVES_CHEMINS_CLE);
    if (!raw) return AUCUN_CHEMIN;
    const parsed = JSON.parse(raw) as { entetes?: unknown; lignes?: unknown } | null;
    if (!parsed || typeof parsed !== 'object') return AUCUN_CHEMIN;
    const entetes = Number(parsed.entetes);
    const lignes = Number(parsed.lignes);
    return {
      entetes: Number.isFinite(entetes) && entetes > 0 ? Math.floor(entetes) : 0,
      lignes: Number.isFinite(lignes) && lignes > 0 ? Math.floor(lignes) : 0,
    };
  } catch {
    return AUCUN_CHEMIN;
  }
}

/** Un relevé d’aire vient de partir d’un en-tête ou d’une ligne : le compte du
 *  chemin avance d’un cran, l’autre ne bouge pas. */
function compterChemin(chemin: CheminReleve): RelevesChemins {
  const courants = readAireRelevesChemins();
  const next: RelevesChemins = {
    entetes: courants.entetes + (chemin === 'entete' ? 1 : 0),
    lignes: courants.lignes + (chemin === 'ligne' ? 1 : 0),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(RELEVES_CHEMINS_CLE, JSON.stringify(next));
    } catch {
      /* mémoire indisponible — le compte repart de ce qu’on lit */
    }
  }
  return next;
}

/** Le dernier relevé d'une aire, chemin par chemin : l'en-tête de son groupe,
 *  et l'appui long sur la pastille d'une de ses lignes. Une aire jamais
 *  emportée par l'un de ces gestes garde une entrée vide. */
export type ReleveCheminsAire = {
  /** Le jour du dernier relevé parti de l'en-tête du groupe, ou null. */
  entete: number | null;
  /** Le jour du dernier relevé emporté d'une ligne, ou null. */
  ligne: number | null;
};

const AUCUN_CHEMIN_AIRE: ReleveCheminsAire = { entete: null, ligne: null };

/** Les chemins lus sur l'appareil, aire par aire : une mémoire illisible
 *  repart d'un carnet vide plutôt que de faire tomber la messagerie. */
function litCheminsAires(): Record<string, ReleveCheminsAire> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(RELEVES_CHEMINS_AIRES_CLE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const sortie: Record<string, ReleveCheminsAire> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
      if (!estAire(key) || !value || typeof value !== 'object') return;
      const row = value as { entete?: unknown; ligne?: unknown };
      const entete = Number(row.entete);
      const ligne = Number(row.ligne);
      sortie[key] = {
        entete: Number.isFinite(entete) && entete > 0 ? entete : null,
        ligne: Number.isFinite(ligne) && ligne > 0 ? ligne : null,
      };
    });
    return sortie;
  } catch {
    return {};
  }
}

/** Le dernier relevé de chaque aire, par chemin, lu d'un geste : la pastille
 *  d'aire d'un fil s'en sert pour dire d'où son relevé est déjà parti. */
export function readAireRelevesCheminsAires(): Record<string, ReleveCheminsAire> {
  return litCheminsAires();
}

/** Le dernier relevé d'une aire, par chemin : l'en-tête de son groupe et
 *  l'appui long sur une de ses lignes, chacun daté, ou rien. */
export function readAireReleveChemins(aire: RegionMondeKey | ''): ReleveCheminsAire {
  if (!estAire(aire)) return AUCUN_CHEMIN_AIRE;
  return litCheminsAires()[aire] ?? AUCUN_CHEMIN_AIRE;
}

/** Un relevé d'une aire vient de partir par l'un des deux chemins : ce chemin
 *  est daté pour cette aire seule, l'autre reste tel quel. */
function daterCheminAire(aire: RegionMondeKey, chemin: CheminReleve): void {
  if (typeof window === 'undefined') return;
  try {
    const tous = litCheminsAires();
    const courante = tous[aire] ?? AUCUN_CHEMIN_AIRE;
    tous[aire] = {
      entete: chemin === 'entete' ? Date.now() : courante.entete,
      ligne: chemin === 'ligne' ? Date.now() : courante.ligne,
    };
    window.localStorage.setItem(RELEVES_CHEMINS_AIRES_CLE, JSON.stringify(tous));
  } catch {
    /* mémoire indisponible — le survol se contente de ce qu'il lit */
  }
}

/** La gomme des deux chemins : les deux comptes repartent de zéro, sans
 *  toucher aux dates des groupes ni au compte des relevés d’ensemble. */
export function clearAireRelevesChemins(): RelevesChemins {
  if (typeof window !== 'undefined') {
    try {
      /* Seuls les deux comptes s'effacent : les chemins datés de chaque aire
         restent, parce qu'ils disent un fait (ce relevé est déjà parti) et
         non un chiffre de gestes. */
      window.localStorage.removeItem(RELEVES_CHEMINS_CLE);
    } catch {
      /* mémoire indisponible — rien à effacer */
    }
  }
  annoncerTours();
  return AUCUN_CHEMIN;
}

/**
 * Un relevé de fils vient d’être copié depuis la console : le jour de cette
 * aire est reposé, les autres restent tels quels. Le carnet se relit sans
 * recharger la page — la date s’écrit au moment du clic, jamais à l’ouverture.
 */
export function markAireReleveCopied(
  aire: RegionMondeKey,
  /* Le chemin du geste : l’en-tête d’un groupe ou la pastille d’une ligne.
     « aucun » date le relevé sans compter de chemin — le geste d’ensemble a
     son propre compte et ne se confond pas avec les deux autres. */
  chemin: CheminReleve | 'aucun' = 'entete',
): Record<string, number> {
  const tous = litReleves();
  if (!estAire(aire)) return tous;
  tous[aire] = Date.now();
  if (chemin !== 'aucun') {
    compterChemin(chemin);
    /* Le chemin est daté pour cette aire seule : sa pastille pourra dire, au
       survol, si le relevé est déjà parti d'un en-tête ou d'une ligne. */
    daterCheminAire(aire, chemin);
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(RELEVES_CLE, JSON.stringify(tous));
    } catch {
      /* mémoire indisponible — le carnet repart de ce qu’on lit */
    }
  }
  /* Un relevé vient de partir : les deux côtés relisent leur compte. */
  annoncerTours();
  return tous;
}

/** Le compte du relevé de toutes les aires, lu d'un geste : combien de fois il
 *  est parti de cet appareil et le jour de la dernière fois. */
export function readAireRelevesTousCopies(): RelevesTousCopies {
  if (typeof window === 'undefined') return AUCUN_RELEVE_TOUS;
  try {
    const rawCount = window.localStorage.getItem(RELEVES_TOUS_CLE);
    const rawStamp = window.localStorage.getItem(RELEVES_TOUS_AT_CLE);
    const rawAires = window.localStorage.getItem(RELEVES_TOUS_AIRES_CLE);
    const compte = rawCount ? Number(rawCount) : 0;
    const stamp = rawStamp ? Number(rawStamp) : 0;
    let aires: RegionMondeKey[] = [];
    if (rawAires) {
      const parsed = JSON.parse(rawAires) as unknown;
      aires = Array.isArray(parsed) ? ordonner(parsed.filter(estAire)) : [];
    }
    return {
      count: Number.isFinite(compte) && compte > 0 ? Math.floor(compte) : 0,
      last: Number.isFinite(stamp) && stamp > 0 ? stamp : null,
      aires,
    };
  } catch {
    return AUCUN_RELEVE_TOUS;
  }
}

/**
 * Le relevé de toutes les aires vient de partir : le compte avance d'un cran
 * et le jour du dernier départ est reposé, pour que l'en-tête se relise sans
 * recharger la page — la date s'écrit au moment du clic, jamais à l'ouverture.
 */
export function markAireRelevesTousCopied(
  aires: RegionMondeKey[] = [],
): RelevesTousCopies {
  const courantes = readAireRelevesTousCopies();
  /* Les aires emportées entrent au carnet une fois seulement : le compte des
     aires distinctes dit combien ont quitté la boîte, pas combien de gestes
     sont partis. */
  const emportees: RegionMondeKey[] = [...courantes.aires];
  aires.forEach((key) => {
    if (estAire(key) && !emportees.includes(key)) emportees.push(key);
  });
  const next: RelevesTousCopies = {
    count: courantes.count + 1,
    last: Date.now(),
    aires: ordonner(emportees),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(RELEVES_TOUS_CLE, String(next.count));
      window.localStorage.setItem(RELEVES_TOUS_AT_CLE, String(next.last));
      if (next.aires.length > 0) {
        window.localStorage.setItem(RELEVES_TOUS_AIRES_CLE, JSON.stringify(next.aires));
      }
    } catch {
      /* mémoire indisponible — le compte repart de ce qu'on lit */
    }
  }
  annoncerTours();
  return next;
}

/**
 * La gomme du seul compte du relevé d'ensemble : le nombre de gestes et les
 * aires emportées repartent de zéro. Les jours des relevés d'une aire, eux,
 * restent intacts — les en-têtes de groupe continuent de dire leur date.
 */
export function clearAireRelevesTousCopies(): RelevesTousCopies {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(RELEVES_TOUS_CLE);
      window.localStorage.removeItem(RELEVES_TOUS_AT_CLE);
      window.localStorage.removeItem(RELEVES_TOUS_AIRES_CLE);
    } catch {
      /* mémoire indisponible — rien à effacer */
    }
  }
  annoncerTours();
  return AUCUN_RELEVE_TOUS;
}

/**
 * La gomme des relevés d'un groupe d'aires seulement : leur date de relevé
 * s'oublie et leur nom quitte le carnet des aires emportées par un relevé
 * d'ensemble, si bien que la pastille, la synthèse du classeur et le nom du
 * fichier les disent à nouveau jamais relevées. Les autres aires gardent la
 * leur, et le compte des gestes d'ensemble ne bouge pas — le geste ne
 * supprime pas un nombre de relevés, il rend quelques aires vierges.
 */
export function clearAireRelevesJours(aires: string[]): {
  jours: Record<string, number>;
  tous: RelevesTousCopies;
} {
  const cibles = aires.filter(estAire);
  if (typeof window !== 'undefined' && cibles.length > 0) {
    try {
      /* Les dates des aires visées s'effacent, celles des autres restent :
         un carnet vidé s'oublie plutôt que de laisser un objet mort. */
      const jours = litReleves();
      cibles.forEach((key) => {
        delete jours[key];
      });
      if (Object.keys(jours).length === 0) {
        window.localStorage.removeItem(RELEVES_CLE);
      } else {
        window.localStorage.setItem(RELEVES_CLE, JSON.stringify(jours));
      }
      /* Le carnet des aires emportées par un relevé d'ensemble perd ces aires
         seules : le nombre de gestes et le jour du dernier départ restent.
         Sans cela, une aire dirait encore « relevée » par le geste
         d'ensemble alors que sa date vient d'être rendue vierge. */
      const tous = readAireRelevesTousCopies();
      const gardees = tous.aires.filter((key) => !cibles.includes(key));
      if (gardees.length === 0) {
        window.localStorage.removeItem(RELEVES_TOUS_AIRES_CLE);
      } else {
        window.localStorage.setItem(
          RELEVES_TOUS_AIRES_CLE,
          JSON.stringify(gardees),
        );
      }
      /* Les chemins datés de ces aires s'oublient avec leur relevé : la
         pastille d'un fil ne promet pas un geste qui n'a plus de date. */
      const chemins = litCheminsAires();
      let touche = false;
      cibles.forEach((key) => {
        if (!chemins[key]) return;
        delete chemins[key];
        touche = true;
      });
      if (touche) {
        if (Object.keys(chemins).length === 0) {
          window.localStorage.removeItem(RELEVES_CHEMINS_AIRES_CLE);
        } else {
          window.localStorage.setItem(
            RELEVES_CHEMINS_AIRES_CLE,
            JSON.stringify(chemins),
          );
        }
      }
    } catch {
      /* mémoire indisponible — rien à effacer */
    }
  }
  /* Les deux côtés relisent : la pastille, la synthèse et le nom du fichier. */
  annoncerTours();
  return { jours: litReleves(), tous: readAireRelevesTousCopies() };
}

/**
 * Combien de fois la petite gomme des relevés a rendu des aires vierges depuis
 * cet appareil, et le jour de la dernière fois : la pastille des aires relevées
 * aujourd'hui tient ce compte à côté d'elle, si bien qu'un geste d'effacement
 * se relit même quand il n'a plus rien à annoncer. Le total des aires rendues
 * sans date accompagne le nombre de gestes.
 */
const GOMMES_CLE = 'paperatlas:cmap:relevesGommes';
const GOMMES_AT_CLE = 'paperatlas:cmap:relevesGommesAt';
const GOMMES_AIRES_CLE = 'paperatlas:cmap:relevesGommesAires';
/** Le jour du dernier geste de gomme, aire par aire : l'ordre « gomme la plus
 *  récente d'abord » retrouve ce qui vient d'être rendu vierge, et le tri
 *  nomme l'aire qui ouvre sa marche. */
const GOMMES_AIRES_AT_CLE = 'paperatlas:cmap:relevesGommesAiresAt';
/** Les fils réellement emportés par le dernier geste de gomme : la pastille des
 *  aires du jour les compte à côté du nombre de gestes, pour que l'effacement
 *  dise son poids et pas seulement son nombre. */
const GOMMES_FILS_CLE = 'paperatlas:cmap:relevesGommesFils';
/** Le jour du tout premier geste de gomme retenu sur l'appareil : le survol de
 *  la pastille mesure ainsi l'écart entre le premier et le dernier
 *  effacement, au lieu de ne dire que le dernier. */
const GOMMES_PREMIER_CLE = 'paperatlas:cmap:relevesGommesPremier';

export type GommesReleves = {
  /** Combien de fois une gomme a rendu des aires vierges. */
  count: number;
  /** L'heure du dernier geste, en millisecondes, ou null. */
  last: number | null;
  /** Combien d'aires ont été rendues sans date, tous gestes confondus. */
  aires: number;
  /** Les fils que le dernier geste a réellement emportés, lus sur la boîte au
   *  moment du clic : la pastille les compte à côté des gestes. */
  fils: number;
  /** Le jour du premier geste de gomme retenu, en millisecondes, ou null :
   *  l'écart avec le dernier se lit au survol de la pastille. */
  premier: number | null;
};

const AUCUNE_GOMME: GommesReleves = { count: 0, last: null, aires: 0, fils: 0, premier: null };

/** Le compte des gommes, lu d'un geste : combien de gestes, combien d'aires
 *  rendues sans date, et le jour du dernier. Une mémoire illisible repart
 *  d'un compte vide plutôt que de faire tomber la messagerie. */
export function readGommesReleves(): GommesReleves {
  if (typeof window === 'undefined') return AUCUNE_GOMME;
  try {
    const rawCount = window.localStorage.getItem(GOMMES_CLE);
    const rawStamp = window.localStorage.getItem(GOMMES_AT_CLE);
    const rawAires = window.localStorage.getItem(GOMMES_AIRES_CLE);
    const rawFils = window.localStorage.getItem(GOMMES_FILS_CLE);
    const rawPremier = window.localStorage.getItem(GOMMES_PREMIER_CLE);
    const compte = rawCount ? Number(rawCount) : 0;
    const stamp = rawStamp ? Number(rawStamp) : 0;
    const aires = rawAires ? Number(rawAires) : 0;
    const fils = rawFils ? Number(rawFils) : 0;
    const premier = rawPremier ? Number(rawPremier) : 0;
    return {
      count: Number.isFinite(compte) && compte > 0 ? Math.floor(compte) : 0,
      last: Number.isFinite(stamp) && stamp > 0 ? stamp : null,
      aires: Number.isFinite(aires) && aires > 0 ? Math.floor(aires) : 0,
      fils: Number.isFinite(fils) && fils > 0 ? Math.floor(fils) : 0,
      /* Un premier geste sans date retombe sur le dernier connu : la pastille
         ne mesure pas un écart qu'elle ne peut pas dater. */
      premier:
        Number.isFinite(premier) && premier > 0
          ? premier
          : Number.isFinite(stamp) && stamp > 0
            ? stamp
            : null,
    };
  } catch {
    return AUCUNE_GOMME;
  }
}

/**
 * Une gomme vient de rendre des aires vierges : le compte des gestes avance
 * d'un cran, celui des aires rendues sans date s'ajoute, et le jour du dernier
 * geste est reposé — la pastille se relit sans recharger la page. Les aires
 * réellement rendues gardent chacune la date de ce geste, si bien que l'ordre
 * « gomme la plus récente d'abord » retrouve ce qui vient d'être rendu vierge.
 */
export function markGommesReleves(
  aires: number,
  cles: RegionMondeKey[] = [],
  /* Les fils que la boîte portait dans ces aires au moment du clic : le
     dernier geste garde son poids, sans le déduire plus tard d'une boîte qui
     a pu changer. */
  fils = 0,
): GommesReleves {
  const courantes = readGommesReleves();
  const rendues = Number.isFinite(aires) && aires > 0 ? Math.floor(aires) : 0;
  const emportes = Number.isFinite(fils) && fils > 0 ? Math.floor(fils) : 0;
  const next: GommesReleves = {
    count: courantes.count + 1,
    last: Date.now(),
    aires: courantes.aires + rendues,
    fils: emportes,
    /* Le premier geste ne se repose jamais : il garde son jour d'origine, si
       bien que l'écart avec le dernier se mesure d'un geste à l'autre. */
    premier: courantes.premier ?? Date.now(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(GOMMES_CLE, String(next.count));
      window.localStorage.setItem(GOMMES_AT_CLE, String(next.last));
      window.localStorage.setItem(GOMMES_AIRES_CLE, String(next.aires));
      window.localStorage.setItem(GOMMES_PREMIER_CLE, String(next.premier));
      if (next.fils > 0) {
        window.localStorage.setItem(GOMMES_FILS_CLE, String(next.fils));
      } else {
        window.localStorage.removeItem(GOMMES_FILS_CLE);
      }
      /* Les aires visées par le geste gardent chacune leur date : une aire
         rendue vierge une seconde fois prend la date la plus récente. */
      const cibles = cles.filter(estAire);
      if (cibles.length > 0) {
        const jours = litGommesAiresJours();
        cibles.forEach((key) => {
          jours[key] = next.last ?? Date.now();
        });
        window.localStorage.setItem(GOMMES_AIRES_AT_CLE, JSON.stringify(jours));
      }
    } catch {
      /* mémoire indisponible — le compte repart de ce qu'on lit */
    }
  }
  annoncerTours();
  return next;
}

/** Les jours des dernières gommes, lus sur l'appareil : une mémoire illisible
 *  repart d'un carnet vide plutôt que de faire tomber la messagerie. */
function litGommesAiresJours(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(GOMMES_AIRES_AT_CLE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const sortie: Record<string, number> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
      if (!estAire(key)) return;
      const stamp = Number(value);
      if (!Number.isFinite(stamp) || stamp <= 0) return;
      sortie[key] = stamp;
    });
    return sortie;
  } catch {
    return {};
  }
}

/** Le jour du dernier geste de gomme de chaque aire : l'ordre « gomme la plus
 *  récente d'abord » y lit ce qui vient d'être rendu vierge, et son survol
 *  nomme l'aire qui ouvre la marche. */
export function readGommesAiresJours(): Record<string, number> {
  return litGommesAiresJours();
}

/**
 * Le jour de la dernière copie de chaque aire, tous gestes confondus — depuis
 * une fiche comme depuis une carte. La pastille d’une aire le porte sous les
 * yeux, au lieu de le laisser au seul survol : on voit d’un regard ce qui a
 * déjà quitté l’appareil, et quand, sans ouvrir une seule copie.
 */
export function readAiresCopiesJours(): Record<string, number> {
  const jours: Record<string, number> = {};
  /* Les copies parties d’une carte de l’annuaire, aire par aire. */
  const cartes = litCartesAiresAts();
  Object.entries(cartes).forEach(([key, stamp]) => {
    if (!estAire(key) || !Number.isFinite(stamp) || stamp <= 0) return;
    jours[key] = stamp;
  });
  /* Les copies parties d’une fiche — un atelier, une plume, un profil : la
     plus récente des deux l’emporte, sans écraser l’autre geste. */
  const fiches = litComptesAires();
  Object.entries(fiches).forEach(([key, row]) => {
    if (!estAire(key) || !row.last) return;
    jours[key] = Math.max(jours[key] ?? 0, row.last);
  });
  return jours;
}

/** La gomme du seul compte des aires copiées depuis les cartes, sans toucher
 *  au carnet des aires ni aux autres comptes. */
export function clearAiresCartesCopies(): AiresCompletesCopiees {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(CARTES_CLE);
      window.localStorage.removeItem(CARTES_AT_CLE);
      window.localStorage.removeItem(CARTES_PAYS_CLE);
      window.localStorage.removeItem(CARTES_AIRES_CLE);
      window.localStorage.removeItem(CARTES_AIRES_AT_CLE);
    } catch {
      /* mémoire indisponible — rien à effacer */
    }
  }
  annoncerTours();
  return AUCUNE_COMPLETE;
}

/** La gomme du seul compte des copies courtes — les noms et les fiches —,
 *  sans toucher au carnet des aires ni aux autres comptes. */
export function clearAiresCourtesCopies(): AiresCompletesCopiees {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(COURTES_CLE);
      window.localStorage.removeItem(COURTES_AT_CLE);
    } catch {
      /* mémoire indisponible — rien à effacer */
    }
  }
  annoncerTours();
  return AUCUNE_COMPLETE;
}

/** La gomme du seul compte des aires complètes copiées, sans toucher au cadrage. */
export function clearAiresCompletesCopies(): AiresCompletesCopiees {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(COMPLETES_CLE);
      window.localStorage.removeItem(COMPLETES_AT_CLE);
    } catch {
      /* mémoire indisponible — rien à effacer */
    }
  }
  annoncerTours();
  return AUCUNE_COMPLETE;
}

/** La gomme du seul compte des aires copiées seules, sans toucher au cadrage. */
export function clearAireSeuleCopies(): AiresSeulesCopiees {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(SEULES_CLE);
      window.localStorage.removeItem(SEULES_AT_CLE);
      window.localStorage.removeItem(SEULES_AIRE_CLE);
      window.localStorage.removeItem(SEULES_AIRES_CLE);
      window.localStorage.removeItem(SEULES_PAYS_CLE);
      /* Le compte des aires complètes suit celui des aires copiées seules :
         ce sont les mêmes aires qui le nourrissent. */
      window.localStorage.removeItem(COMPLETES_CLE);
      window.localStorage.removeItem(COMPLETES_AT_CLE);
      /* La copie courte nourrit le même carnet : son compte s'efface aussi. */
      window.localStorage.removeItem(COURTES_CLE);
      window.localStorage.removeItem(COURTES_AT_CLE);
      /* Les aires copiées depuis les cartes de l’annuaire suivent le même
         carnet : leur compte repart de zéro avec lui. */
      window.localStorage.removeItem(CARTES_CLE);
      window.localStorage.removeItem(CARTES_AT_CLE);
      window.localStorage.removeItem(CARTES_PAYS_CLE);
      window.localStorage.removeItem(CARTES_AIRES_CLE);
      window.localStorage.removeItem(CARTES_AIRES_AT_CLE);
    } catch {
      /* mémoire indisponible — rien à effacer */
    }
  }
  annoncerTours();
  return AUCUNE_SEULE;
}

/**
 * La gomme du seul compte : les tournées repartent de zéro, la dernière aire
 * emportée s'oublie — mais le cadrage des aires de l'appareil, lui, reste
 * intact. Un compteur remis à neuf, un carnet qui tient.
 */
export function clearTourCopies(): ToursCopiees {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(TOURS_CLE);
      window.localStorage.removeItem(TOURS_AT_CLE);
      window.localStorage.removeItem(TOURS_AIRE_CLE);
    } catch {
      /* mémoire indisponible — rien à effacer */
    }
  }
  /* Le compte est reparti de zéro : les deux côtés le relisent. */
  annoncerTours();
  return AUCUNE_TOUR;
}