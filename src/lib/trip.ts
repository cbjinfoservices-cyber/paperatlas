/**
 * Le temps de trajet, approché depuis la distance à vol d'oiseau : le trajet
 * réel suit les rues et non la ligne droite, et la vitesse moyenne dépend de
 * l'échelle — on roule plus vite entre deux wilayas que dans un quartier.
 * Le chiffre est donc annoncé comme une estimation, jamais comme un horaire.
 */
export function driveMinutes(km: number): number {
  const road = km * 1.28;
  const speed = km < 15 ? 26 : km < 80 ? 55 : 82;
  return Math.max(3, Math.round((road / speed) * 60));
}

/** « 45 min », « 1 h », « 2 h 05 » : le même format partout sur le site. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${String(rest).padStart(2, '0')}` : `${hours} h`;
}