/**
 * Le brouillon d'un dépôt, gardé sur l'appareil.
 *
 * Un visiteur qui remplit une annonce, s'interrompt et revient le lendemain
 * retrouve le titre et le texte qu'il avait commencés. Rien d'autre n'est retenu
 * : ni les coordonnées, ni le prix — seulement ce qui coûte des mots à écrire.
 *
 * Chaque famille a son propre brouillon : commencer une offre d'emploi ne
 * touche pas au texte d'une annonce. Le brouillon s'efface de lui-même dès que
 * les deux champs sont vides, et dès qu'un dépôt part pour relecture.
 */
export type DepotBrouillon = {
  titre: string;
  description: string;
  /** Date d'enregistrement, pour dire honnêtement l'âge d'un brouillon. */
  savedAt: number;
};

const KEY = 'paperatlas:depot-brouillon';
const REPRIS_KEY = 'paperatlas:depot-reprise';

/**
 * Le signal qu'un brouillon vient d'être écrit ou effacé : les onglets de
 * dépôt s'y abonnent pour porter leur point sans qu'on recharge la page.
 */
export const DEPOT_BROUILLON_EVENT = 'paperatlas:depot-brouillon-change';

function announce(): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new Event(DEPOT_BROUILLON_EVENT));
  } catch {
    /* navigateur sans Event : les onglets se relisent au prochain passage */
  }
}

type Store = Partial<Record<string, DepotBrouillon>>;

function readStore(): Store {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Store;
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  if (typeof window === 'undefined') return;
  try {
    if (Object.keys(store).length === 0) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* stockage indisponible — le brouillon n'est simplement pas gardé */
  }
}

/** Le brouillon de cette famille, ou null quand rien n'a été commencé. */
export function readBrouillon(kind: string): DepotBrouillon | null {
  const found = readStore()[kind];
  if (!found || typeof found !== 'object') return null;
  const titre = typeof found.titre === 'string' ? found.titre : '';
  const description = typeof found.description === 'string' ? found.description : '';
  if (!titre.trim() && !description.trim()) return null;
  return {
    titre,
    description,
    savedAt: typeof found.savedAt === 'number' ? found.savedAt : 0,
  };
}

/** Garde le brouillon ; deux champs vides l'effacent au lieu de le laisser traîner. */
export function saveBrouillon(kind: string, titre: string, description: string): void {
  const store: Store = { ...readStore() };
  if (!titre.trim() && !description.trim()) {
    delete store[kind];
  } else {
    store[kind] = { titre, description, savedAt: Date.now() };
  }
  writeStore(store);
  announce();
}

/** Oublie le brouillon de cette famille — après un envoi, ou sur demande. */
export function clearBrouillon(kind: string): void {
  const store: Store = { ...readStore() };
  const existed = kind in store;
  if (existed) {
    delete store[kind];
    writeStore(store);
  }
  /* Le brouillon disparu, sa reprise n'a plus rien à signaler. */
  clearRepris(kind);
  if (existed) announce();
}

/**
 * La reprise d'un brouillon, gardée le temps de la visite seulement : la
 * mémoire de session s'efface avec l'onglet du navigateur. Elle sert à dire,
 * dans « Mes annonces », que ce dépôt a déjà été rouvert — et qu'il n'y a pas
 * lieu d'en commencer un second.
 */
type ReprisStore = Partial<Record<string, number>>;

function readReprisStore(): ReprisStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(REPRIS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as ReprisStore;
  } catch {
    return {};
  }
}

function writeReprisStore(store: ReprisStore): void {
  if (typeof window === 'undefined') return;
  try {
    if (Object.keys(store).length === 0) window.sessionStorage.removeItem(REPRIS_KEY);
    else window.sessionStorage.setItem(REPRIS_KEY, JSON.stringify(store));
  } catch {
    /* mémoire de session indisponible — la reprise n'est simplement pas notée */
  }
}

/** Note que ce brouillon vient d'être rouvert, pour la durée de la visite. */
export function markRepris(kind: string): void {
  const store: ReprisStore = { ...readReprisStore(), [kind]: Date.now() };
  writeReprisStore(store);
}

/** L'instant où ce brouillon a été rouvert, ou null s'il ne l'a pas été. */
export function readRepris(kind: string): number | null {
  const at = readReprisStore()[kind];
  return typeof at === 'number' && at > 0 ? at : null;
}

/** Oublie la reprise de cette famille. */
export function clearRepris(kind: string): void {
  const store: ReprisStore = { ...readReprisStore() };
  if (!(kind in store)) return;
  delete store[kind];
  writeReprisStore(store);
}