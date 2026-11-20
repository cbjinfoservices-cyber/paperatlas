import { replyGapLabel } from '@/lib/messaging';
import { ageJours, nombre, relectureLongue, type AdminAnnonce } from './adminTypes';

/** Le fil tel que le récapitulatif le nomme : il n'a besoin ni de la date du
 *  dernier message, ni des marques de lecture. */
export type FilsRecap = {
  id: string;
  nom_a: string | null;
  nom_b: string | null;
  sujet: string | null;
};

export type RecapArgs = {
  /** Le nom du compte, tel que la ligne ou la fiche l'écrit. */
  titre: string;
  /** Les fils qui dorment pour ce compte, dans n'importe quel ordre : le
   *  récapitulatif les range lui-même du plus lent au plus vif. */
  fils: FilsRecap[];
  /** Le rythme de chaque fil, lu une seule fois pour toute la console. */
  pace: Record<string, number>;
  /** Les dépôts du compte : le récapitulatif n'y garde que les relectures
   *  longues, nommées une à une. */
  annonces: AdminAnnonce[];
  t: (key: string) => string;
};

/** Le délai moyen d'un fil, quand il a un rythme. */
const rythmeDe = (row: FilsRecap, pace: Record<string, number>) => {
  const value = pace[row.id];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

/**
 * Le récapitulatif des priorités d'un compte, prêt à coller dans un message :
 * les fils qui dorment d'abord, le plus lent en tête, puis les relectures
 * longues nommées avec leur attente.
 *
 * Une seule fonction pour la fiche et pour la ligne du tableau : ce qui se
 * colle depuis la liste est exactement ce que la fiche aurait copié. Rien de
 * plus que ce que les deux endroits montrent déjà.
 */
export function recapPriorites({ titre, fils, pace, annonces, t }: RecapArgs): string {
  const lignes: string[] = [`${t('ad.f.priorites')} — ${titre}`];

  const dormants = [...fils].sort((a, b) => {
    const ecart = (rythmeDe(b, pace) ?? -1) - (rythmeDe(a, pace) ?? -1);
    return ecart;
  });

  if (dormants.length > 0) {
    lignes.push(`${dormants.length} ${t('ad.f.sleepThreads')}`);
    dormants.forEach((row) => {
      const noms = [row.nom_a, row.nom_b].filter(Boolean).join(' ↔ ') || row.sujet || '—';
      const rythme = replyGapLabel(rythmeDe(row, pace), t);
      lignes.push(`• ${rythme ? `${noms} · ${rythme}` : noms}`);
    });
  } else {
    lignes.push(t('ad.f.sleepThreadsNone'));
  }

  const longues = annonces
    .filter((row) => relectureLongue(row.statut, row.created_at))
    .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
  if (longues.length > 0) {
    lignes.push(t('ad.f.prioLateLine').replace('{n}', nombre(longues.length)));
    longues.slice(0, 12).forEach((row) => {
      const age = ageJours(row.created_at) ?? 0;
      lignes.push(`• ${row.titre} · ${t('ad.f.depotSince').replace('{n}', String(age))}`);
    });
  } else {
    lignes.push(t('ad.f.prioLateNone'));
  }

  return lignes.join('\n');
}