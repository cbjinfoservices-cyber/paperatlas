/**
 * Le montant cumulé d'un lot de devis, lu sur les mêmes lignes que les
 * compteurs de la liste : ce qui dort se lit alors aussi en valeur, pas
 * seulement en nombre.
 *
 * Les montants sont écrits par le moteur de tarif sous la forme « 12 500 DZD ».
 * On ne recompose donc rien : on lit les chiffres déjà écrits, et on garde la
 * devise qui les accompagne. Un lot qui mêlerait deux marchés n'est jamais
 * additionné en aveugle — chaque devise garde son total, et les totaux se
 * lisent côte à côte.
 */

/** Une ligne de devis, réduite à ce que le cumul a besoin d'y lire. */
type LigneMontant = {
  montant_total?: string | null;
  montant_mensuel?: string | null;
  devise?: string | null;
};

/** Les devises que le site écrit déjà dans ses prix, plus « DA » hérité. */
const DEVISES =
  /\b(DA|DZD|SAR|BHD|KMF|DJF|EGP|AED|IQD|JOD|KWD|LBP|LYD|MAD|MRU|OMR|QAR|SOS|SDG|SYP|TND|YER|EUR|USD|GBP|CAD|CHF)\b/i;

/** « 12500 » → « 12 500 » : le même espacement que les montants du site. */
function grouper(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
}

/**
 * La devise et la valeur d'une ligne, lues dans le montant déjà écrit. Vaut
 * null quand rien n'est lisible : une ligne sans montant ne compte ni en
 * valeur, ni dans une part.
 */
function ligneDevise(row: LigneMontant): { devise: string; valeur: number } | null {
  const brut = (row.montant_total || row.montant_mensuel || '').trim();
  if (!brut || !/\d/.test(brut)) return null;
  const chiffres = brut.replace(/[^\d]/g, '');
  const valeur = Number(chiffres);
  if (!Number.isFinite(valeur) || valeur <= 0) return null;
  const trouve = brut.match(DEVISES)?.[1]?.toUpperCase() ?? '';
  const devise = trouve === 'DA' ? 'DZD' : trouve || (row.devise || '').trim().toUpperCase();
  if (!devise) return null;
  return { devise, valeur };
}

/**
 * La devise d'une ligne, telle que la répartition la nomme : c'est la même clé
 * qui range chaque dossier sous son marché, et qui permet donc de rapporter un
 * délai moyen à un marché précis. Vaut la chaîne vide quand le montant n'est
 * pas lisible — une ligne sans montant ne relève d'aucun marché.
 */
export function deviseDeLigne(row: LigneMontant): string {
  return ligneDevise(row)?.devise ?? '';
}

/**
 * Les totaux du lot, devise par devise. Aucune devise n'est additionnée à une
 * autre : le map garde chaque marché séparé, et c'est lui qui permet aussi de
 * dire une part — un pourcentage ne se calcule jamais entre deux monnaies.
 */
function totauxParDevise(rows: LigneMontant[]): Map<string, number> {
  const totaux = new Map<string, number>();

  rows.forEach((row) => {
    const lu = ligneDevise(row);
    if (!lu) return;
    totaux.set(lu.devise, (totaux.get(lu.devise) ?? 0) + lu.valeur);
  });

  return totaux;
}

/** Une devise du lot : ce qu'elle pèse, combien de dossiers la portent, et la
 *  place que ces dossiers tiennent dans le lot. */
export type DeviseRepartition = {
  devise: string;
  montant: string;
  count: number;
  part: string;
};

/**
 * La répartition du lot par devise, la plus lourde d'abord. La part se compte
 * en dossiers, jamais en montants : additionner un dinar à un euro pour en
 * tirer un pourcentage ne dirait rien. Vaut un tableau vide quand aucune ligne
 * ne porte de montant lisible.
 */
export function repartitionParDevise(rows: LigneMontant[]): DeviseRepartition[] {
  const parDevise = new Map<string, { total: number; count: number }>();

  rows.forEach((row) => {
    const lu = ligneDevise(row);
    if (!lu) return;
    const garde = parDevise.get(lu.devise) ?? { total: 0, count: 0 };
    parDevise.set(lu.devise, { total: garde.total + lu.valeur, count: garde.count + 1 });
  });

  const comptes = [...parDevise.values()].reduce((sum, entry) => sum + entry.count, 0);
  if (comptes <= 0) return [];

  return [...parDevise.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .map(([devise, entry]) => ({
      devise,
      montant: `${grouper(entry.total)} ${devise}`,
      count: entry.count,
      part: `${Math.round((entry.count / comptes) * 100)}\u00a0%`,
    }));
}

/**
 * La répartition d'un lot en dossiers, devise par devise : ce que chaque marché
 * porte, sans jamais additionner deux monnaies.
 */
function dossiersParDevise(rows: LigneMontant[]): Map<string, { total: number; count: number }> {
  const parDevise = new Map<string, { total: number; count: number }>();

  rows.forEach((row) => {
    const lu = ligneDevise(row);
    if (!lu) return;
    const garde = parDevise.get(lu.devise) ?? { total: 0, count: 0 };
    parDevise.set(lu.devise, { total: garde.total + lu.valeur, count: garde.count + 1 });
  });

  return parDevise;
}

/** Une devise du lot endormi : ce que ses devis prêts pèsent, combien de
 *  dossiers ils sont, et la part de ce marché-là qui est déjà prête. */
export type DevisePartPrete = {
  devise: string;
  montant: string;
  prets: number;
  total: number;
  part: string;
};

/**
 * La part déjà prête de chaque marché : parmi les dossiers endormis d'une même
 * devise, ceux dont le devis est confirmé. La part se rapporte au marché lui-
 * même — « 2 sur 5 dossiers de ce marché » — et non au lot entier, parce que
 * c'est la question posée : ce marché-là est-il prêt, ou pas encore ?
 *
 * Un marché sans aucun devis prêt n'est pas nommé : la ligne dit ce qui est
 * prêt, pas ce qui ne l'est pas. Vaut un tableau vide quand rien n'est lisible.
 */
export function partPreteParDevise(
  pretes: LigneMontant[],
  dormantes: LigneMontant[],
): DevisePartPrete[] {
  const endormies = dossiersParDevise(dormantes);
  if (endormies.size === 0) return [];

  const entrees: DevisePartPrete[] = [];

  dossiersParDevise(pretes).forEach((entry, devise) => {
    const marche = endormies.get(devise);
    if (!marche || marche.count <= 0) return;
    entrees.push({
      devise,
      montant: `${grouper(entry.total)} ${devise}`,
      prets: entry.count,
      total: marche.count,
      part: `${Math.round((entry.count / marche.count) * 100)}\u00a0%`,
    });
  });

  return entrees.sort((a, b) => b.total - a.total || b.prets - a.prets);
}

/**
 * Le montant cumulé du lot, écrit avec sa devise : « 125 000 DZD ». Vaut la
 * chaîne vide quand aucune ligne ne porte de montant lisible — un cumul sans
 * montant ne dirait rien, et l'écran n'écrit alors rien du tout.
 */
export function montantCumule(rows: LigneMontant[]): string {
  const totaux = totauxParDevise(rows);
  if (totaux.size === 0) return '';

  return [...totaux.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([devise, total]) => `${grouper(total)} ${devise}`)
    .join(' · ');
}

/**
 * La part que représente un lot dans un autre : « 32 % ». Elle ne s'écrit que
 * si les deux côtés ne parlent que d'une seule devise, et que c'est la même —
 * rapporter des dinars à des euros ne dirait rien. Vaut la chaîne vide dans
 * tous les autres cas, pour que l'écran n'affiche pas un chiffre trompeur.
 */
export function partMontantCumule(
  partRows: LigneMontant[],
  totalRows: LigneMontant[],
): string {
  const part = totauxParDevise(partRows);
  const total = totauxParDevise(totalRows);
  if (part.size !== 1 || total.size !== 1) return '';

  const [entreePart] = [...part.entries()];
  const [entreeTotal] = [...total.entries()];
  if (entreePart[0] !== entreeTotal[0] || entreeTotal[1] <= 0) return '';

  const pourcent = Math.round((entreePart[1] / entreeTotal[1]) * 100);
  if (pourcent <= 0) return '';
  return `${pourcent}\u00a0%`;
}