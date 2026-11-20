/**
 * La trace du pas de clavier sur la liste des devis : la fiche rappelée par le
 * compteur, et les dossiers ouverts depuis ce rappel. La mémoire vit le temps
 * de la visite (sessionStorage), parce que la liste quitte l'écran dès qu'un
 * dossier s'ouvre — sans elle, le compteur retomberait à zéro à chaque retour.
 */
const RECALL_KEY = 'paperatlas:devis:walkRecall';
const OPENED_KEY = 'paperatlas:devis:walkOpened';

function lire(cle: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.sessionStorage.getItem(cle) ?? '';
  } catch {
    return '';
  }
}

function ecrire(cle: string, valeur: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (valeur) window.sessionStorage.setItem(cle, valeur);
    else window.sessionStorage.removeItem(cle);
  } catch {
    /* storage unavailable — the counter simply starts over */
  }
}

/** La référence rappelée par le compteur, "" quand aucune fiche n'a été rouverte. */
export function readRecall(): string {
  return lire(RECALL_KEY);
}

/** Les dossiers ouverts depuis ce rappel, dans l'ordre des ouvertures. */
export function readOpened(): string[] {
  const raw = lire(OPENED_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((ref): ref is string => typeof ref === 'string' && ref.length > 0);
  } catch {
    return [];
  }
}

/**
 * Une fiche vient d'être rouverte au clavier : elle devient le point de départ
 * du compteur, et les ouvertures précédentes s'effacent — elles appartenaient
 * à un autre rappel.
 */
export function markRecall(reference: string): void {
  ecrire(RECALL_KEY, reference);
  ecrire(OPENED_KEY, '');
}

/**
 * Un dossier s'ouvre : il entre dans le compte, une seule fois, et seulement
 * si une fiche a été rappelée — sans rappel, il n'y a rien à compter.
 * Rend la liste à jour, pour que l'affichage suive sans rechargement.
 */
export function noteOpened(reference: string): string[] {
  if (!reference || !readRecall()) return readOpened();
  const current = readOpened();
  if (current.includes(reference)) return current;
  const next = [...current, reference];
  ecrire(OPENED_KEY, JSON.stringify(next));
  return next;
}

/** Le rappel et ses ouvertures s'effacent ensemble, quand la visite s'achève. */
export function clearWalk(): void {
  ecrire(RECALL_KEY, '');
  ecrire(OPENED_KEY, '');
}