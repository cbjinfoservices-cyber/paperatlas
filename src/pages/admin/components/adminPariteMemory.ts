/**
 * Les dates de pose retenues par l'appareil.
 *
 * Le relevé importé dit seulement qu'une clé est posée : il ne dit pas quand.
 * La console retient donc le jour où elle a vu la clé posée pour la première
 * fois — c'est la seule date qu'elle puisse affirmer. Une clé déjà posée avant
 * que cet appareil ne l'ait vue garde le jour de sa première lecture, et le
 * relevé l'écrit tel quel plutôt que d'inventer une date passée.
 *
 * Rien n'est envoyé : le carnet tient dans le navigateur, comme les cases de
 * relecture.
 */

const CLE = 'paperatlas.parite.posees.v1';

/** Les dates de pose, rangées par clé : `fichier|langue|clé` → jour ISO. */
export type DatesPose = Record<string, string>;

/** La clé d'une pose : le fichier, la langue et le nom exact de la clé, comme
 *  le relevé les nomme — deux langues du même fichier ne se confondent pas. */
export function clePosee(fichier: string, langue: string, cle: string): string {
  return `${fichier}|${langue}|${cle}`;
}

/**
 * Le carnet tel qu'il est écrit. Une entrée qui n'est pas une date de
 * calendrier est ignorée : un carnet abîmé ne fait pas tomber le relevé, il
 * se relit seulement à partir de ce qu'il porte encore.
 */
export function lireDatesPosee(): DatesPose {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return {};
    const lu = JSON.parse(brut) as unknown;
    if (!lu || typeof lu !== 'object') return {};
    const dates: DatesPose = {};
    Object.entries(lu as Record<string, unknown>).forEach(([cle, valeur]) => {
      if (typeof valeur === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valeur)) dates[cle] = valeur;
    });
    return dates;
  } catch {
    return {};
  }
}

/** Le jour d'aujourd'hui, en date de calendrier : celle qui se trie dans un
 *  tableur, et qui se lit sans dépendre de la langue de la session. */
function jourDuJour(now: Date = new Date()): string {
  const mois = String(now.getMonth() + 1).padStart(2, '0');
  const jour = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${mois}-${jour}`;
}

/** Ce que la mémoire a besoin de savoir d'une ligne du relevé. */
type Pose = {
  fichier: string;
  langue: string;
  cle: string;
  posee: boolean;
};

/**
 * Note le jour des clés posées qui n'ont pas encore de date, et rend le
 * carnet entier — c'est lui que la colonne « posée le » du relevé recopie.
 * Une clé déjà datée garde son jour : la date ne se réécrit pas à chaque
 * export, sinon elle ne daterait plus rien.
 */
export function enregistrerPosees(entrees: Pose[], now: Date = new Date()): DatesPose {
  const dates = lireDatesPosee();
  const aujourdhui = jourDuJour(now);
  let ajout = false;

  entrees.forEach((entree) => {
    if (!entree.posee) return;
    const cle = clePosee(entree.fichier, entree.langue, entree.cle);
    if (dates[cle]) return;
    dates[cle] = aujourdhui;
    ajout = true;
  });

  if (ajout) {
    try {
      window.localStorage.setItem(CLE, JSON.stringify(dates));
    } catch {
      /* Un appareil qui refuse la mémoire laisse la date de la visite :
         l'écran ne s'arrête pas pour un carnet fermé. */
    }
  }

  return dates;
}