/**
 * La mémoire des familles ouvertes depuis cet appareil.
 *
 * La carte du monde compte les familles qui n'ont encore ouvert aucune page
 * depuis l'appareil du lecteur : pour le dire, il faut savoir lesquelles ont
 * été ouvertes. Le souvenir se prend au geste — la porte d'une famille pressée
 * dans la bande sous la carte, ou la pastille d'une famille pressée sur la
 * carte d'un pays —, jamais au hasard d'un survol.
 *
 * Le souvenir tient sur l'appareil (`localStorage`) : il survit à la fermeture
 * de l'onglet, comme le carnet des régions traversées, sans rien demander au
 * serveur. Une famille ouverte une fois reste ouverte pour toujours : le
 * compteur ne redescend jamais, il ne fait que s'éteindre quand il n'a plus
 * rien à annoncer.
 */
export const FAMILLES_EVENT = 'paperatlas:familles-ouvertes';

const KEY = 'paperatlas:familles-ouvertes';

/** Les familles déjà ouvertes depuis cet appareil, dans l'ordre du geste. */
export function readFamillesVues(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is string => typeof row === 'string' && row.length > 0);
  } catch {
    return [];
  }
}

/**
 * Une famille vient d'être ouverte : elle entre au carnet une seule fois, et
 * l'événement prévient la carte restée à l'écran — le compteur de l'en-tête
 * se réactualise au moment du geste, sans attendre un rechargement.
 */
export function markFamilleVue(trade: string): string[] {
  const vues = readFamillesVues();
  const next = trade && !vues.includes(trade) ? [...vues, trade] : vues;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Le stockage peut être refusé : le carnet se tait, rien ne casse. */
  }
  try {
    window.dispatchEvent(new Event(FAMILLES_EVENT));
  } catch {
    /* Un appareil sans événements ne bloque pas la navigation. */
  }
  return next;
}

/**
 * La gomme de la carte : le carnet repart à vide, et le compteur des familles
 * jamais ouvertes retrouve ses huit portes. Aucune page déjà ouverte ne se
 * referme — seule la mémoire de l'appareil s'efface. L'événement prévient la
 * carte restée à l'écran, qui se remet à jour sans rechargement.
 */
export function clearFamillesVues(): string[] {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* Le stockage peut être refusé : rien à effacer, rien ne casse. */
  }
  try {
    window.dispatchEvent(new Event(FAMILLES_EVENT));
  } catch {
    /* Un appareil sans événements ne bloque pas la navigation. */
  }
  return [];
}