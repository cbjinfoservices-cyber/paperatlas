/**
 * Le filtre « en sommeil seulement » de la messagerie de la console laisse une
 * trace sur l'appareil : une revue commencée un jour se retrouve telle quelle
 * à la visite suivante, sans avoir à reposer le jeton.
 *
 * Gardé sur l'appareil seulement : c'est une commodité de lecture, pas un fait
 * du dossier. Un stockage refusé ramène simplement la liste entière.
 */
import { REGIONS_MONDE } from '@/lib/worldRegions';

const CLE = 'paperatlas:admin-sleep-only';

/** Le filtre était-il allumé lors de la dernière visite ? */
export function readSleepOnly(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CLE) === 'yes';
  } catch {
    return false;
  }
}

/** Retient l'état du jeton, pour la prochaine ouverture de la console. */
export function saveSleepOnly(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE, value ? 'yes' : 'no');
  } catch {
    /* Stockage refusé : le filtre reste juste, il ne laisse pas de trace. */
  }
}

/**
 * L'en-tête de tri « revue » de la messagerie suit la même mémoire : une
 * revue commencée un jour se retrouve dans le même ordre à la visite
 * suivante, sans avoir à reposer le tri. Le classeur lit ce même choix.
 */
const CLE_REVUE = 'paperatlas:admin-revue-tri';

/** Le tri « revue » était-il posé lors de la dernière visite ? */
export function readRevueFirst(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CLE_REVUE) === 'yes';
  } catch {
    return false;
  }
}

/** Retient le tri « revue », pour la prochaine ouverture de la console. */
export function saveRevueFirst(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_REVUE, value ? 'yes' : 'no');
  } catch {
    /* Stockage refusé : le tri reste juste, il ne laisse pas de trace. */
  }
}

/**
 * Le second en-tête de tri, « après relance », laisse la même trace : les
 * deux tris s'excluent, aussi une seule valeur ne peut être active à la fois
 * et la dernière posée est celle qu'on retrouve.
 */
const CLE_APRES = 'paperatlas:admin-apres-tri';

/** Le tri « après relance » était-il posé lors de la dernière visite ? */
export function readApresFirst(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CLE_APRES) === 'yes';
  } catch {
    return false;
  }
}

/** Retient le tri « après relance », pour la prochaine ouverture. */
export function saveApresFirst(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_APRES, value ? 'yes' : 'no');
  } catch {
    /* Stockage refusé : le tri reste juste, il ne laisse pas de trace. */
  }
}

/**
 * L'ordre « par aire » de la messagerie suit la même mémoire que les deux
 * autres tris : la liste se rouvre groupée sous les aires du monde, sans
 * avoir à reposer le choix. Les trois ordres s'excluent — un seul parle à la
 * fois —, et le dernier posé est celui qu'on retrouve.
 */
const CLE_AIRE = 'paperatlas:admin-aire-tri';

/** L'ordre « par aire » était-il posé lors de la dernière visite ? */
export function readAireFirst(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CLE_AIRE) === 'yes';
  } catch {
    return false;
  }
}

/** Retient l'ordre « par aire », pour la prochaine ouverture de la console. */
export function saveAireFirst(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_AIRE, value ? 'yes' : 'no');
  } catch {
    /* Stockage refusé : le tri reste juste, il ne laisse pas de trace. */
  }
}

/**
 * L'ordre « relevé le plus récent » suit la même mémoire : les aires dont le
 * relevé vient de quitter la boîte se retrouvent en tête à la visite
 * suivante, sans avoir à reposer le tri. Les quatre ordres s'excluent.
 */
const CLE_RECENT = 'paperatlas:admin-recent-tri';

/** Le tri « relevé le plus récent » était-il posé à la dernière visite ? */
export function readRecentFirst(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CLE_RECENT) === 'yes';
  } catch {
    return false;
  }
}

/** Retient le tri « relevé le plus récent », pour la prochaine ouverture. */
export function saveRecentFirst(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_RECENT, value ? 'yes' : 'no');
  } catch {
    /* Stockage refusé : le tri reste juste, il ne laisse pas de trace. */
  }
}

/**
 * L'ordre « aire jamais relevée d'abord » suit la même mémoire : les fils des
 * aires qu'aucun relevé n'a encore emportées se retrouvent en tête à la visite
 * suivante, sans avoir à reposer le tri. Les cinq ordres s'excluent — un seul
 * parle à la fois —, et le dernier posé est celui qu'on retrouve.
 */
const CLE_JAMAIS = 'paperatlas:admin-jamais-tri';

/** Le tri « aire jamais relevée d'abord » était-il posé à la dernière visite ? */
export function readJamaisFirst(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CLE_JAMAIS) === 'yes';
  } catch {
    return false;
  }
}

/** Retient le tri « aire jamais relevée d'abord », pour la prochaine ouverture. */
export function saveJamaisFirst(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_JAMAIS, value ? 'yes' : 'no');
  } catch {
    /* Stockage refusé : le tri reste juste, il ne laisse pas de trace. */
  }
}

/**
 * L'ordre « relevé le plus ancien d'abord » suit la même mémoire : les aires
 * dont le relevé attend depuis le plus longtemps se retrouvent en tête à la
 * visite suivante, sans avoir à reposer le tri. Les six ordres s'excluent —
 * un seul parle à la fois —, et le dernier posé est celui qu'on retrouve.
 */
const CLE_ANCIEN = 'paperatlas:admin-ancien-tri';

/** Le tri « relevé le plus ancien d'abord » était-il posé à la dernière visite ? */
export function readAncienFirst(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CLE_ANCIEN) === 'yes';
  } catch {
    return false;
  }
}

/** Retient le tri « relevé le plus ancien d'abord », pour la prochaine ouverture. */
export function saveAncienFirst(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_ANCIEN, value ? 'yes' : 'no');
  } catch {
    /* Stockage refusé : le tri reste juste, il ne laisse pas de trace. */
  }
}

/**
 * L'ordre « gomme la plus récente d'abord » suit la même mémoire : les aires
 * rendues vierges le plus récemment se retrouvent en tête à la visite
 * suivante, sans avoir à reposer le tri. Les sept ordres s'excluent — un seul
 * parle à la fois —, et le dernier posé est celui qu'on retrouve.
 */
const CLE_GOMME = 'paperatlas:admin-gomme-tri';

/** Le tri « gomme la plus récente d'abord » était-il posé à la dernière visite ? */
export function readGommeFirst(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CLE_GOMME) === 'yes';
  } catch {
    return false;
  }
}

/** Retient le tri « gomme la plus récente d'abord », pour la prochaine ouverture. */
export function saveGommeFirst(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_GOMME, value ? 'yes' : 'no');
  } catch {
    /* Stockage refusé : le tri reste juste, il ne laisse pas de trace. */
  }
}

/**
 * L'ordre inverse, « gomme la plus ancienne d'abord », suit la même mémoire :
 * les aires rendues vierges il y a le plus longtemps se retrouvent en tête à
 * la visite suivante, sans avoir à reposer le tri. Les huit ordres s'excluent
 * — un seul parle à la fois —, et le dernier posé est celui qu'on retrouve.
 */
const CLE_GOMME_ANCIENNE = 'paperatlas:admin-gomme-ancienne-tri';

/** Le tri « gomme la plus ancienne d'abord » était-il posé à la dernière visite ? */
export function readGommeAncienneFirst(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CLE_GOMME_ANCIENNE) === 'yes';
  } catch {
    return false;
  }
}

/** Retient le tri « gomme la plus ancienne d'abord », pour la prochaine ouverture. */
export function saveGommeAncienneFirst(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_GOMME_ANCIENNE, value ? 'yes' : 'no');
  } catch {
    /* Stockage refusé : le tri reste juste, il ne laisse pas de trace. */
  }
}

/**
 * Le sens de la ligne des aires parties laisse la même trace : la ligne se
 * rouvre dans le sens où la lecture s'est arrêtée, et le classeur des abonnés
 * le reprend dans sa synthèse — deux exports du même jour, faits avant et
 * après un retournement, ne se lisent donc plus pareil.
 */
const CLE_GOMME_HORS_ANCIENNE = 'paperatlas:admin-gomme-hors-ancienne';

/** La ligne des aires parties était-elle retournée à la dernière visite ? */
export function readGommeHorsAncienne(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CLE_GOMME_HORS_ANCIENNE) === 'yes';
  } catch {
    return false;
  }
}

/** Retient le sens de la ligne des aires parties, pour la prochaine visite. */
export function saveGommeHorsAncienne(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_GOMME_HORS_ANCIENNE, value ? 'yes' : 'no');
  } catch {
    /* Stockage refusé : le sens reste vrai le temps de la visite. */
  }
}

/**
 * L'aire retenue dans la messagerie laisse la même trace : la boîte se rouvre
 * resserrée là où la lecture s'est arrêtée, sans avoir à rappuyer sur le titre
 * de l'aire. Une aire qu'aucune aire du monde ne porte est ignorée.
 */
const CLE_AIRE_RETENUE = 'paperatlas:admin-aire-retenue';

/** L'aire retenue lors de la dernière visite, "" quand la boîte montrait tout. */
export function readAireKept(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = (window.localStorage.getItem(CLE_AIRE_RETENUE) ?? '').trim();
    return REGIONS_MONDE.some((region) => region.key === raw) ? raw : '';
  } catch {
    return '';
  }
}

/** Retient l'aire sur laquelle la boîte est resserrée, pour la visite suivante. */
export function saveAireKept(value: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (value) {
      window.localStorage.setItem(CLE_AIRE_RETENUE, value);
    } else {
      window.localStorage.removeItem(CLE_AIRE_RETENUE);
    }
  } catch {
    /* Stockage refusé : l'aire reste retenue le temps de la visite. */
  }
}

/**
 * Les aires sur lesquelles la boîte est resserrée laissent la même trace : le
 * classeur des abonnés lit cette mémoire pour dire, dans sa synthèse, le jour
 * du dernier relevé de chacune. Un resserrement vidé s'oublie plutôt que de
 * laisser une liste morte derrière lui.
 */
const CLE_AIRES_TIGHT = 'paperatlas:admin-aires-tight';

/** Les aires resserrées lors de la dernière visite, dans l'ordre des aires du
 *  monde — la liste est vide quand la boîte montrait tout. */
export function readAiresTight(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CLE_AIRES_TIGHT);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const posees = parsed.filter(
      (key): key is string => typeof key === 'string' && REGIONS_MONDE.some((r) => r.key === key),
    );
    return REGIONS_MONDE.map((region) => region.key).filter((key) => posees.includes(key));
  } catch {
    return [];
  }
}

/** Retient les aires resserrées, ou les oublie quand la boîte est rendue
 *  entière — la mémoire ne garde jamais une liste vide écrite. */
export function saveAiresTight(keys: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const gardees = REGIONS_MONDE
      .map((region) => region.key)
      .filter((key) => keys.includes(key));
    if (gardees.length > 0) {
      window.localStorage.setItem(CLE_AIRES_TIGHT, JSON.stringify(gardees));
    } else {
      window.localStorage.removeItem(CLE_AIRES_TIGHT);
    }
  } catch {
    /* Stockage refusé : le resserrement reste vrai le temps de la visite. */
  }
}

/**
 * Le jeton « après relance seulement » de la messagerie suit la même mémoire
 * que le filtre en sommeil : une revue commencée un jour se retrouve réduite
 * de la même façon à la visite suivante. Une petite gomme, dans le jeton,
 * rend la liste entière et retient ce geste-là.
 */
const CLE_APRES_SEUL = 'paperatlas:admin-apres-seul';

/** Le jeton « après relance seulement » était-il posé lors de la dernière visite ? */
export function readApresOnly(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CLE_APRES_SEUL) === 'yes';
  } catch {
    return false;
  }
}

/** Retient l'état du jeton, pour la prochaine ouverture de la console. */
export function saveApresOnly(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_APRES_SEUL, value ? 'yes' : 'no');
  } catch {
    /* Stockage refusé : le jeton reste juste, il ne laisse pas de trace. */
  }
}