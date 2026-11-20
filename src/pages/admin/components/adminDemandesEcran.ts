/**
 * L'écran public qui a produit une demande.
 *
 * Une demande reçue par le formulaire ne s'ouvre pas sur une page à elle :
 * elle vient d'un guichet du site. La console pose donc, sur chaque ligne, la
 * porte de ce guichet — le relecteur ou le secrétariat retrouve la page que le
 * visiteur avait sous les yeux, sans la retaper.
 *
 * Le sujet arrive par identifiant, stable d'une langue à l'autre. Une valeur
 * inconnue, venue d'un ancien envoi, retombe sur les guichets réunis : c'est
 * la page qui présente les trois formulaires, jamais un lien mort.
 */

/** Les sujets connus du formulaire, avec l'écran qu'ils ouvrent. */
const ECRANS: Record<string, string> = {
  devis: '/offres/devis',
  inscription: '/compte/inscription',
  soustraitance: '/demande-b2b',
};

/** La porte des guichets réunis : elle nomme les trois formulaires. */
export const ECRAN_GUICHETS = '/demandes';

/** L'adresse d'une demande, lue sur son sujet ; jamais une adresse inventée. */
export function ecranDemande(sujet: string): string {
  return ECRANS[sujet] ?? ECRAN_GUICHETS;
}