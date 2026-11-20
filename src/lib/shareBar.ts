/**
 * Une petite barre de part, dessinée en texte : dix cases, les pleines à la
 * mesure du pourcentage. Le texte copié se lit alors à côté de l'écran, où la
 * même barre est dessinée par les styles — le point d'étape garde la forme de
 * ce qu'on voit.
 */
export function barreDePartTexte(pct: number, cases = 10): string {
  const total = Math.max(1, Math.round(cases));
  const mesure = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
  const pleines = Math.max(0, Math.min(total, Math.round((mesure / 100) * total)));
  return `${'\u2588'.repeat(pleines)}${'\u2591'.repeat(total - pleines)}`;
}