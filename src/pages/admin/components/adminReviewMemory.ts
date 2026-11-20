/**
 * Les fils dormants déjà relus pendant la visite de la console. Le repère ne
 * survit pas à la visite : une revue commencée se reprend tant que l'onglet
 * vit — y compris après un rechargement — puis s'efface d'elle-même.
 *
 * Gardé dans la session du navigateur seulement : c'est un fil d'Ariane de
 * lecture, pas un fait du dossier. Un stockage refusé rend simplement une
 * revue sans repère.
 */
const CLE = 'paperatlas:admin-revue-sommeil';

/** L'instant d'ouverture de chaque fil relu : le bouton de reprise dit depuis
 *  combien de temps la revue s'est arrêtée là, sans ouvrir le fil. */
const CLE_OUVERTURE = 'paperatlas:admin-revue-ouverture';

/** La borne d'un repère : une revue très longue ne grossit pas sans fin. */
const MAX_REPERES = 400;

/** La liste brute, relue à chaque geste : la session est la seule vérité. */
function lire(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const brut = window.sessionStorage.getItem(CLE);
    if (!brut) return [];
    const parse = JSON.parse(brut);
    if (!Array.isArray(parse)) return [];
    return parse.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

/** Les instants d'ouverture, relus comme le reste : un repère par fil. */
function lireOuvertures(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const brut = window.sessionStorage.getItem(CLE_OUVERTURE);
    if (!brut) return {};
    const parse = JSON.parse(brut);
    if (!parse || typeof parse !== 'object' || Array.isArray(parse)) return {};
    const out: Record<string, string> = {};
    Object.entries(parse as Record<string, unknown>).forEach(([id, value]) => {
      if (!id || typeof value !== 'string') return;
      if (!Number.isFinite(new Date(value).getTime())) return;
      out[id] = value;
    });
    return out;
  } catch {
    return {};
  }
}

/** Les fils marqués comme relus pendant cette visite. */
export function readRevus(): string[] {
  return lire();
}

/** L'instant d'ouverture de chaque fil relu, par identifiant. */
export function readOuvertures(): Record<string, string> {
  return lireOuvertures();
}

/**
 * L'instant où un fil a été ouvert pour la première fois pendant la visite :
 * c'est lui qui date l'arrêt de la revue. Une seconde ouverture ne le déplace
 * pas — revenir sur un fil ne fait pas croire que la revue vient de s'y
 * arrêter.
 */
export function readOuverture(conversationId: string): string {
  if (!conversationId) return '';
  return lireOuvertures()[conversationId] ?? '';
}

/** Marque un fil dormant comme relu ; le second passage ne change rien au
 *  premier instant retenu, pas plus qu'à la liste. */
export function marquerRevu(conversationId: string): string[] {
  const list = lire();
  if (!conversationId) return list;
  const ouvertures = lireOuvertures();
  if (typeof window !== 'undefined') {
    try {
      if (!ouvertures[conversationId]) {
        ouvertures[conversationId] = new Date().toISOString();
        window.sessionStorage.setItem(CLE_OUVERTURE, JSON.stringify(ouvertures));
      }
    } catch {
      /* Stockage refusé : l'instant ne tient pas, la revue reste possible. */
    }
  }
  if (list.includes(conversationId)) return list;
  const next = [...list, conversationId].slice(-MAX_REPERES);
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(CLE, JSON.stringify(next));
    } catch {
      /* Stockage refusé : le repère ne tient pas, la revue reste possible. */
    }
  }
  return next;
}

/** Efface les repères de la revue en cours, sans toucher au filtre ni au fil. */
export function oublierRevus(): string[] {
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.removeItem(CLE);
      window.sessionStorage.removeItem(CLE_OUVERTURE);
    } catch {
      /* Rien à effacer si le stockage est refusé. */
    }
  }
  return [];
}