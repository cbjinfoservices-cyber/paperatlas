/**
 * The « déjà repris dans un groupé » shortcut, remembered per account: a member
 * who narrowed the quote list to the files a grouped recap already carried finds
 * that same reading waiting on the next visit — exactly like the states of the
 * B2B summary. Two members on one browser never share it.
 */
const PREFIX = 'paperatlas.devis.groupOnly';

/** One memory per account: the shortcut follows the account, not the browser. */
export function groupOnlyKey(userId: string) {
  return `${PREFIX}.${userId}`;
}

/** True when the last visit left the list on the group reading. */
export function readGroupOnly(key: string): boolean {
  if (!key) return false;
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

/** Best-effort: a private window must not stop the list from working. */
export function saveGroupOnly(key: string, on: boolean) {
  if (!key) return;
  try {
    if (on) window.localStorage.setItem(key, '1');
    else window.localStorage.removeItem(key);
  } catch {
    /* the reading still works, it just forgets where it was left */
  }
}

/**
 * La lecture « rétablies », retenue par compte comme celle des devis repris
 * dans un groupé : le membre qui a laissé la liste sur les dossiers rendus
 * après un retrait la retrouve à sa prochaine visite. Deux membres sur un même
 * navigateur ne la partagent jamais.
 */
const RESTORED_PREFIX = 'paperatlas.devis.restoredOnly';

/** One memory per account, like the group reading beside it. */
export function restoredOnlyKey(userId: string) {
  return `${RESTORED_PREFIX}.${userId}`;
}

/** True when the last visit left the list on the restored reading. */
export function readRestoredOnly(key: string): boolean {
  if (!key) return false;
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

/** Best-effort, like the group reading: a private window simply forgets. */
export function saveRestoredOnly(key: string, on: boolean) {
  if (!key) return;
  try {
    if (on) window.localStorage.setItem(key, '1');
    else window.localStorage.removeItem(key);
  } catch {
    /* the reading still works, it just forgets where it was left */
  }
}

/**
 * La lecture « Durée · N mois », retenue par compte comme celle des devis
 * repris dans un groupé : le membre qui a laissé la liste réduite aux dossiers
 * écrits sur ce nombre de mois-là la retrouve telle quelle à sa prochaine
 * visite. Deux membres sur un même navigateur ne la partagent jamais.
 */
const DUREE_PREFIX = 'paperatlas.devis.dureeOnly';

/** One memory per account, like the group reading beside it. */
export function dureeOnlyKey(userId: string) {
  return `${DUREE_PREFIX}.${userId}`;
}

/** Le nombre de mois retenu, ou null quand la liste s'ouvre entière. */
export function readDureeOnly(key: string): number | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const mois = Math.round(Number(raw));
    return Number.isFinite(mois) && mois > 0 ? mois : null;
  } catch {
    return null;
  }
}

/** Best-effort, like the group reading: a private window simply forgets. */
export function saveDureeOnly(key: string, mois: number | null) {
  if (!key) return;
  try {
    if (mois !== null && Number.isFinite(mois) && mois > 0) {
      window.localStorage.setItem(key, String(Math.round(mois)));
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    /* the reading still works, it just forgets what was left */
  }
}

/**
 * La lecture « Durées héritées », retenue par compte comme celle de la durée
 * exacte : le membre qui a laissé la liste réduite aux dossiers dont la durée
 * vient d'un réglage plus ancien la retrouve à sa prochaine visite. Deux
 * membres sur un même navigateur ne la partagent jamais.
 */
const RYTHME_PREFIX = 'paperatlas.devis.rythmeOnly';

/** One memory per account, like the exact-length reading beside it. */
export function rythmeOnlyKey(userId: string) {
  return `${RYTHME_PREFIX}.${userId}`;
}

/** True when the last visit left the list on the inherited-lengths reading. */
export function readRythmeOnly(key: string): boolean {
  if (!key) return false;
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

/** Best-effort, like the other readings: a private window simply forgets. */
export function saveRythmeOnly(key: string, on: boolean) {
  if (!key) return;
  try {
    if (on) window.localStorage.setItem(key, '1');
    else window.localStorage.removeItem(key);
  } catch {
    /* the reading still works, it just forgets where it was left */
  }
}

/**
 * L'ordre « partagé récemment », gardé par compte : la liste de « Mon compte »
 * et la bande des Offres lisent la même clé, donc les deux s'ouvrent dans le
 * même ordre. Deux membres sur un navigateur ne le partagent jamais.
 */
const SORT_PREFIX = 'paperatlas.devis.sortRecent';

/** One memory per account, like the group reading beside it. */
export function sortRecentKey(userId: string) {
  return `${SORT_PREFIX}.${userId}`;
}

/** True when the last visit left the list on the « recently shared » order. */
export function readSortRecent(key: string): boolean {
  if (!key) return false;
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

/** Best-effort, like the group reading: a private window simply forgets. */
export function saveSortRecent(key: string, on: boolean) {
  if (!key) return;
  try {
    if (on) window.localStorage.setItem(key, '1');
    else window.localStorage.removeItem(key);
  } catch {
    /* the order still works, it just forgets which one was chosen */
  }
}

/**
 * L'ordre « ouverture récente », gardé par compte comme celui des partages :
 * le membre qui a laissé la liste triée sur ses dernières visites la retrouve
 * à sa prochaine visite, et deux membres sur un navigateur ne le partagent
 * jamais.
 */
const OPEN_SORT_PREFIX = 'paperatlas.devis.sortOpened';

/** One memory per account, like the share order beside it. */
export function sortOpenedKey(userId: string) {
  return `${OPEN_SORT_PREFIX}.${userId}`;
}

/** True when the last visit left the list on the « recently opened » order. */
export function readSortOpened(key: string): boolean {
  if (!key) return false;
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

/** Best-effort, like the share order: a private window simply forgets. */
export function saveSortOpened(key: string, on: boolean) {
  if (!key) return;
  try {
    if (on) window.localStorage.setItem(key, '1');
    else window.localStorage.removeItem(key);
  } catch {
    /* the order still works, it just forgets which one was chosen */
  }
}

/**
 * La dernière ouverture de chaque devis, gardée par compte : la liste peut
 * alors remonter les dossiers consultés en dernier. Une entrée par référence,
 * jamais un historique — seule la visite la plus récente compte.
 */
const OPENED_PREFIX = 'paperatlas.devis.openedAt';

/** One memory per account, like the readings beside it. */
export function openedAtKey(userId: string) {
  return `${OPENED_PREFIX}.${userId}`;
}

/** Les références déjà ouvertes, chacune avec son jour de dernière visite. */
export function readOpenedAt(key: string): Record<string, string> {
  if (!key) return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([reference, at]) => {
      if (!reference || typeof at !== 'string' || !at) return;
      out[reference] = at;
    });
    return out;
  } catch {
    return {};
  }
}

/**
 * Un dossier vient d'être ouvert : son jour de visite est réécrit, et la liste
 * à jour est rendue pour que l'ordre suive sans rechargement. Best-effort : un
 * navigateur privé perd la trace, la liste continue de fonctionner.
 */
export function noteOpenedAt(key: string, reference: string): Record<string, string> {
  if (!key || !reference) return readOpenedAt(key);
  const current = readOpenedAt(key);
  const next = { ...current, [reference]: new Date().toISOString() };
  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* the order still works for this visit, it just is not remembered */
  }
  return next;
}