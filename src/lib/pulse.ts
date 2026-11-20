const DAY_MS = 24 * 60 * 60 * 1000;

export type PulsePoint = { start: string; end: string; count: number };

/**
 * Les dépôts rangés par tranche de sept jours, la plus ancienne à gauche et la
 * semaine en cours à droite. Prend les dates telles quelles : une fiche de
 * l'annuaire comme un dépôt d'annonce ou une offre d'emploi alimentent le même
 * pouls, sans passer par un type de donnée particulier.
 */
export const weeklyBuckets = (dates: string[], count = 7): PulsePoint[] => {
  const today = Date.now();
  const stamps = dates
    .map((iso) => new Date(iso).getTime())
    .filter((time) => !Number.isNaN(time));

  return Array.from({ length: count }, (_, i) => {
    const back = count - 1 - i;
    const end = today - back * 7 * DAY_MS;
    const start = end - 7 * DAY_MS;
    const hits = stamps.filter((time) => time > start && time <= end).length;
    return {
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      count: hits,
    };
  });
};