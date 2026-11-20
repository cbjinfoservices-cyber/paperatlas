/**
 * Les marchés dont l'adresse est partie depuis la feuille des tarifs, retenus
 * sur l'appareil : la prochaine ouverture de la feuille retrouve la liste
 * « Déjà partis » telle qu'elle a été laissée, avec l'instant du dernier envoi
 * de chaque marché et le nombre de fois où son adresse est repartie.
 *
 * Rien n'est inventé à la relecture : une entrée dont le code est vide, dont la
 * date ne se lit pas ou dont le compte n'est pas un entier positif est écartée.
 * Une valeur abîmée, ou écrite par une version plus ancienne, revient donc à une
 * liste vide plutôt que de faire apparaître un marché qui n'est jamais parti.
 */

export type EnvoiPays = { at: string; n: number };

const CLE = 'paperatlas.pays.copies';

/** Vrai seulement pour une entrée que la feuille sait relire. */
function estEnvoi(valeur: unknown): valeur is EnvoiPays {
  if (!valeur || typeof valeur !== 'object') return false;
  const { at, n } = valeur as { at?: unknown; n?: unknown };
  return (
    typeof at === 'string'
    && at.length > 0
    && !Number.isNaN(new Date(at).getTime())
    && typeof n === 'number'
    && Number.isFinite(n)
    && n > 0
  );
}

/** Les marchés déjà servis, ou rien quand l'appareil n'en garde aucun. */
export function lireCopiesPays(): Record<string, EnvoiPays> {
  if (typeof window === 'undefined') return {};
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return {};
    const parsed: unknown = JSON.parse(brut);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: Record<string, EnvoiPays> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([code, valeur]) => {
      if (!code || !estEnvoi(valeur)) return;
      out[code] = { at: valeur.at, n: Math.round(valeur.n) };
    });
    return out;
  } catch {
    return {};
  }
}

/** Écrit la liste, et l'efface entièrement quand elle est vide. */
export function memoriserCopiesPays(copies: Record<string, EnvoiPays>): void {
  if (typeof window === 'undefined') return;
  try {
    const entries = Object.entries(copies).filter(([, valeur]) => estEnvoi(valeur));
    if (entries.length === 0) window.localStorage.removeItem(CLE);
    else window.localStorage.setItem(CLE, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* stockage indisponible — la liste vit pour cette visite seulement */
  }
}