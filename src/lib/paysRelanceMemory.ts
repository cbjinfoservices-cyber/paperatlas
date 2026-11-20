/**
 * Le seuil de relance de la feuille des tarifs, retenu sur l'appareil comme le
 * pays et l'ordre de la feuille : un lecteur qui a choisi de rappeler les
 * marchés oubliés au-delà de quinze jours — ou de soixante — retrouve ce même
 * seuil à sa prochaine visite, au lieu de revenir à trente jours sans l'avoir
 * demandé.
 *
 * Trois seuils existent, et rien d'autre : 15, 30 ou 60 jours. Une valeur écrite
 * par une version plus ancienne, ou abîmée, revient à trente jours plutôt que de
 * laisser la relance dans un seuil que la feuille ne sait pas lire.
 */

export type SeuilRelancePays = 15 | 30 | 60;

/** Les seuils que la feuille sait proposer, dans l'ordre où ils s'affichent. */
export const SEUILS_RELANCE: SeuilRelancePays[] = [15, 30, 60];

/** Le seuil retenu quand rien n'a encore été choisi. */
export const SEUIL_RELANCE_DEFAUT: SeuilRelancePays = 30;

const CLE = 'paperatlas.pays.relance.seuil';

/** Vrai seulement pour les seuils que la feuille sait dérouler. */
export function estSeuilRelance(
  valeur: unknown,
): valeur is SeuilRelancePays {
  return valeur === 15 || valeur === 30 || valeur === 60;
}

/** Le seuil retenu, ou trente jours quand rien n'a encore été choisi. */
export function lireSeuilRelance(): SeuilRelancePays {
  if (typeof window === 'undefined') return SEUIL_RELANCE_DEFAUT;
  try {
    const brut = window.localStorage.getItem(CLE);
    const nombre = brut === null ? Number.NaN : Number(brut);
    return estSeuilRelance(nombre) ? nombre : SEUIL_RELANCE_DEFAUT;
  } catch {
    return SEUIL_RELANCE_DEFAUT;
  }
}

/** Écrit le seuil choisi, sans jamais faire échouer la page si le stockage refuse. */
export function memoriserSeuilRelance(seuil: SeuilRelancePays): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE, String(seuil));
  } catch {
    /* stockage indisponible — le choix n'est simplement pas retenu */
  }
}

/**
 * Les marchés vraiment relancés, et le jour où la relance est partie : un
 * marché marqué « relancé aujourd'hui » depuis sa ligne garde la date de ce
 * geste sur l'appareil, comme le seuil et l'ordre de la feuille. La marque ne
 * se confond donc jamais avec un simple envoi de lien : elle dit qu'un vrai
 * contact a eu lieu, et c'est elle que la relance lit pour ne pas renvoyer
 * deux fois le même message au même marché.
 *
 * Une date abîmée se jette plutôt que de fausser le compte : mieux vaut un
 * marché rendu à l'état oublié qu'une ligne marquée pour toujours.
 */
export type RelancesPays = Record<string, string>;

const CLE_RELANCES = 'paperatlas.pays.relance.faites';

/** Les marchés marqués « relancé », chacun avec la date de son geste. */
export function lireRelancesPays(): RelancesPays {
  if (typeof window === 'undefined') return {};
  try {
    const brut = window.localStorage.getItem(CLE_RELANCES);
    if (!brut) return {};
    const parse = JSON.parse(brut) as unknown;
    if (!parse || typeof parse !== 'object' || Array.isArray(parse)) return {};
    const propre: RelancesPays = {};
    Object.entries(parse as Record<string, unknown>).forEach(([code, valeur]) => {
      if (typeof valeur !== 'string') return;
      if (Number.isNaN(new Date(valeur).getTime())) return;
      propre[code] = valeur;
    });
    return propre;
  } catch {
    return {};
  }
}

/** Écrit les marques de relance, sans jamais faire échouer la page. */
export function memoriserRelancesPays(relances: RelancesPays): void {
  if (typeof window === 'undefined') return;
  try {
    if (Object.keys(relances).length === 0) {
      window.localStorage.removeItem(CLE_RELANCES);
      return;
    }
    window.localStorage.setItem(CLE_RELANCES, JSON.stringify(relances));
  } catch {
    /* stockage indisponible — la marque n'est simplement pas retenue */
  }
}

/**
 * Les marchés déjà rappelés, et le jour du second contact : la marque de
 * rappel se tient à part de celle de relance, pour que le second contact se
 * compte lui aussi au lieu de se confondre avec le premier. Un marché relancé
 * puis rappelé porte donc deux dates, et la feuille sait dire lequel des deux
 * gestes il attend encore.
 *
 * Une date abîmée se jette plutôt que de fausser le compte : mieux vaut un
 * rappel rendu à l'état « à faire » qu'une ligne rappelée pour toujours.
 */
export type RappelsPays = Record<string, string>;

const CLE_RAPPELS = 'paperatlas.pays.relance.rappels';

/** Les marchés marqués « rappelé », chacun avec la date de son second contact. */
export function lireRappelsPays(): RappelsPays {
  if (typeof window === 'undefined') return {};
  try {
    const brut = window.localStorage.getItem(CLE_RAPPELS);
    if (!brut) return {};
    const parse = JSON.parse(brut) as unknown;
    if (!parse || typeof parse !== 'object' || Array.isArray(parse)) return {};
    const propre: RappelsPays = {};
    Object.entries(parse as Record<string, unknown>).forEach(([code, valeur]) => {
      if (typeof valeur !== 'string') return;
      if (Number.isNaN(new Date(valeur).getTime())) return;
      propre[code] = valeur;
    });
    return propre;
  } catch {
    return {};
  }
}

/** Écrit les marques de rappel, sans jamais faire échouer la page. */
export function memoriserRappelsPays(rappels: RappelsPays): void {
  if (typeof window === 'undefined') return;
  try {
    if (Object.keys(rappels).length === 0) {
      window.localStorage.removeItem(CLE_RAPPELS);
      return;
    }
    window.localStorage.setItem(CLE_RAPPELS, JSON.stringify(rappels));
  } catch {
    /* stockage indisponible — la marque n'est simplement pas retenue */
  }
}

/**
 * Le nom du collègue qui mène la tournée sur cet appareil : il s'écrit dans la
 * colonne « relancé par » du classeur, pour que plusieurs personnes se
 * partagent les mêmes marchés sans refaire deux fois le même contact. Le nom
 * reste sur l'appareil, comme le seuil et les marques, et se nettoie de ses
 * espaces superflus.
 */
const CLE_AUTEUR = 'paperatlas.pays.relance.auteur';

/** Le nom retenu, ou une chaîne vide quand rien n'a encore été inscrit. */
export function lireAuteurRelance(): string {
  if (typeof window === 'undefined') return '';
  try {
    const brut = window.localStorage.getItem(CLE_AUTEUR);
    return (brut ?? '').trim().slice(0, 40);
  } catch {
    return '';
  }
}

/** Écrit le nom inscrit, sans jamais faire échouer la page. */
export function memoriserAuteurRelance(nom: string): void {
  if (typeof window === 'undefined') return;
  try {
    const propre = nom.trim().slice(0, 40);
    if (!propre) {
      window.localStorage.removeItem(CLE_AUTEUR);
      return;
    }
    window.localStorage.setItem(CLE_AUTEUR, propre);
  } catch {
    /* stockage indisponible — le nom n'est simplement pas retenu */
  }
}

/**
 * Le délai de rappel : combien de jours après une relance un marché peut être
 * rappelé. Sept, quatorze ou vingt et un jours, retenus sur l'appareil comme
 * le seuil de relance — un collègue qui rappelle à quinze jours retrouve ce
 * même délai à sa prochaine visite, sans avoir à le rechoisir.
 *
 * Une valeur écrite par une version plus ancienne, ou abîmée, revient à sept
 * jours plutôt que de laisser le rappel dans un délai que la feuille ne sait
 * pas lire.
 */
export type DelaiRappelPays = 7 | 14 | 21;

/** Les délais que la feuille sait proposer, dans l'ordre où ils s'affichent. */
export const DELAIS_RAPPEL: DelaiRappelPays[] = [7, 14, 21];

/** Le délai retenu quand rien n'a encore été choisi. */
export const DELAI_RAPPEL_DEFAUT: DelaiRappelPays = 7;

const CLE_RAPPEL = 'paperatlas.pays.relance.rappel';

/** Vrai seulement pour les délais que la feuille sait dérouler. */
export function estDelaiRappel(valeur: unknown): valeur is DelaiRappelPays {
  return valeur === 7 || valeur === 14 || valeur === 21;
}

/** Le délai retenu, ou sept jours quand rien n'a encore été choisi. */
export function lireDelaiRappel(): DelaiRappelPays {
  if (typeof window === 'undefined') return DELAI_RAPPEL_DEFAUT;
  try {
    const brut = window.localStorage.getItem(CLE_RAPPEL);
    const nombre = brut === null ? Number.NaN : Number(brut);
    return estDelaiRappel(nombre) ? nombre : DELAI_RAPPEL_DEFAUT;
  } catch {
    return DELAI_RAPPEL_DEFAUT;
  }
}

/** Écrit le délai choisi, sans jamais faire échouer la page si le stockage refuse. */
export function memoriserDelaiRappel(delai: DelaiRappelPays): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_RAPPEL, String(delai));
  } catch {
    /* stockage indisponible — le choix n'est simplement pas retenu */
  }
}

/**
 * Le seuil d'urgence : à partir de combien de jours de retard un rappel est
 * dit urgent. Cinq, dix ou vingt jours, retenus sur l'appareil comme le seuil
 * de relance — un collègue qui juge urgent au-delà de dix jours retrouve ce
 * même seuil à sa prochaine visite, sans avoir à le rechoisir.
 *
 * Une valeur écrite par une version plus ancienne, ou abîmée, revient à dix
 * jours plutôt que de laisser le compteur dans un seuil qu'il ne sait pas lire.
 */
export type SeuilUrgencePays = 5 | 10 | 20;

/** Les seuils d'urgence que la feuille sait proposer, dans l'ordre affiché. */
export const SEUILS_URGENCE: SeuilUrgencePays[] = [5, 10, 20];

/** Le seuil retenu quand rien n'a encore été choisi. */
export const SEUIL_URGENCE_DEFAUT: SeuilUrgencePays = 10;

const CLE_URGENCE = 'paperatlas.pays.relance.urgence';

/** Vrai seulement pour les seuils d'urgence que la feuille sait dérouler. */
export function estSeuilUrgence(valeur: unknown): valeur is SeuilUrgencePays {
  return valeur === 5 || valeur === 10 || valeur === 20;
}

/** Le seuil retenu, ou dix jours quand rien n'a encore été choisi. */
export function lireSeuilUrgence(): SeuilUrgencePays {
  if (typeof window === 'undefined') return SEUIL_URGENCE_DEFAUT;
  try {
    const brut = window.localStorage.getItem(CLE_URGENCE);
    const nombre = brut === null ? Number.NaN : Number(brut);
    return estSeuilUrgence(nombre) ? nombre : SEUIL_URGENCE_DEFAUT;
  } catch {
    return SEUIL_URGENCE_DEFAUT;
  }
}

/** Écrit le seuil d'urgence choisi, sans jamais faire échouer la page. */
export function memoriserSeuilUrgence(seuil: SeuilUrgencePays): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_URGENCE, String(seuil));
  } catch {
    /* stockage indisponible — le choix n'est simplement pas retenu */
  }
}