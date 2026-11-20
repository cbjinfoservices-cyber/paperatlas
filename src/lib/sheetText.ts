/**
 * Le texte d'une fiche d'annonce ou d'offre, prêt à coller dans un e-mail.
 *
 * Il dit d'abord ce que la fiche annonce, puis les deux adresses qui y mènent :
 * celle de la fiche elle-même, et celle du tableau d'où l'on vient — avec son
 * étendue, le nombre de lignes qu'il tient, et la lettre où l'on se tenait,
 * pour que le destinataire s'ouvre au même point de la liste rangée par nom.
 */
export type SheetTextParts = {
  /** Les lignes propres à la fiche : intitulé, vendeur, prix, lieu… */
  lines: string[];
  /** Le libellé de l'adresse de la fiche — « Adresse de l'annonce ». */
  sheetLabel: string;
  /** L'adresse de la fiche, telle qu'elle se lit dans la barre. */
  sheetUrl: string;
  /** Le libellé de l'adresse du tableau — « Tableau des annonces ». */
  boardLabel: string;
  /** L'adresse du tableau, périmètre et ordre de lecture compris. */
  boardUrl: string;
  /** Le libellé de l'étendue — « Lignes du tableau ». */
  rowsLabel?: string;
  /** Combien de lignes le tableau tient ; zéro ou absent, la phrase se tait. */
  rows?: number;
  /** La phrase qui nomme le point — « Point du tableau : lettre {letter} ». */
  letterLabel: string;
  /** La lettre d'où l'on vient ; vide quand le tableau ne se lit pas par nom. */
  letter: string;
};

export function buildSheetText({
  lines, sheetLabel, sheetUrl, boardLabel, boardUrl, rowsLabel, rows, letterLabel, letter,
}: SheetTextParts): string {
  const out = [...lines.filter((line) => line.trim())];
  out.push(`${sheetLabel} : ${sheetUrl}`);
  out.push(`${boardLabel} : ${boardUrl}`);
  /* L'étendue de la liste, avant d'y entrer : le destinataire sait à quoi
     s'attendre au lieu de découvrir un tableau de trois ou de trois cents
     lignes. Un tableau vide ne se compte pas. */
  if (rowsLabel && rows && rows > 0) out.push(`${rowsLabel} : ${rows}`);
  /* La lettre ne se dit que si elle désigne un point : sans ordre
     alphabétique, la phrase mentirait sur la liste. */
  if (letter) out.push(letterLabel.replace('{letter}', letter));
  return out.join('\n');
}