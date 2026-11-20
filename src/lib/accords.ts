/**
 * Le nombre commande le mot.
 *
 * Une ligne de la barre ne dit pas « 1 profils d'auteurs » : le libellé se met
 * au singulier quand le compte vaut un. La tournure est écrite ici, une seule
 * fois, et le rang comme la feuille du téléphone la lisent à la même source —
 * il n'y a donc qu'un seul endroit à corriger quand le réseau change.
 */
export function ligneCompte(
  de: number,
  une: string,
  des: string,
  t: (cle: string) => string,
): string {
  return `${de} ${t(de === 1 ? une : des)}`;
}