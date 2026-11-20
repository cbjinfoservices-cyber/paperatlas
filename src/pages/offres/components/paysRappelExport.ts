import type { XlsxCell } from '@/lib/xlsx';

/**
 * Une ligne de la feuille des rappels : le marché, la date de son vrai contact
 * (la relance) et celle du second contact (le rappel), les jours écoulés entre
 * les deux, le nom du collègue et l'adresse qui rouvre la feuille sur lui.
 */
export type LigneRappelExport = {
  code: string;
  nom: string;
  /** Le tarif annuel du marché, déjà lu dans sa monnaie. */
  tarif: string;
  /** La date du premier contact, mise en forme dans la langue de la page. */
  relance: string;
  /** La date du rappel, mise en forme dans la langue de la page. */
  rappel: string;
  /** Les jours écoulés entre la relance et le rappel. */
  jours: number;
  /** Les jours écoulés depuis le rappel lui-même : le second contact
   *  commence lui aussi à dater, et le classeur doit le dire. */
  depuisRappel: number;
  /** Le retard du rappel sur le délai choisi : zéro quand le second contact
   *  est arrivé à temps, sinon les jours qui dépassent. La colonne se trie,
   *  pour repérer les seconds contacts les plus tardifs. */
  retard: number;
  /** Vrai quand le rappel a été manqué : marché relancé depuis plus de trois
   *  semaines et toujours sans second contact. La ligne n'a donc pas de date
   *  de rappel, et c'est le temps écoulé depuis la relance qui la date. */
  manque: boolean;
  /** Les jours écoulés depuis la relance, comptés même quand le rappel a été
   *  manqué : la feuille dit donc depuis quand le second contact se fait
   *  attendre, pas seulement sa date de relance. */
  depuisRelance: number;
  /** Vrai quand ce retard dépasse le seuil d'urgence choisi dans la feuille :
   *  la colonne « urgent » le marque, et le tableur se trie dessus pour
   *  remonter d'abord les seconds contacts les plus urgents. */
  urgent: boolean;
  /** Le collègue inscrit sur l'appareil, quand il y en a un. */
  auteur: string;
  lien: string;
};

/**
 * La troisième feuille du classeur : les marchés déjà rappelés, un par ligne,
 * avec la colonne « dernière réponse » laissée vide pour celui qui reçoit le
 * fichier. La première feuille porte la tournée à faire, la seconde son seuil
 * et son total, celle-ci le second contact déjà fait — trois lectures d'un
 * même travail, dans un seul fichier.
 */
export function feuilleRappels(
  lignes: LigneRappelExport[],
  t: (key: string) => string,
): XlsxCell[][] {
  return [
    [
      t('ofs.csvCode'),
      t('ofs.colMarket'),
      t('ofs.csvYear'),
      t('ofs.relanceCsvMarked'),
      t('ofs.rappelCsvMarked'),
      t('ofs.rappelCsvDays'),
      t('ofs.rappelCsvSince'),
      t('ofs.rappelCsvLate'),
      t('ofs.rappelCsvUrgent'),
      t('ofs.rappelCsvManque'),
      t('ofs.rappelCsvSinceRelance'),
      t('ofs.rappelCsvBy'),
      t('ofs.csvLink'),
      t('ofs.relanceCsvReply'),
    ],
    ...lignes.map((ligne) => [
      ligne.code,
      ligne.nom,
      ligne.tarif,
      ligne.relance,
      ligne.rappel,
      ligne.jours,
      ligne.depuisRappel,
      ligne.retard,
      ligne.urgent ? t('ofs.csvYes') : '',
      ligne.manque ? t('ofs.csvYes') : '',
      ligne.depuisRelance,
      ligne.auteur,
      ligne.lien,
      '',
    ]),
  ];
}