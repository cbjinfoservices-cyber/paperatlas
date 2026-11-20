import { baseDict } from '@/i18n/dict';
import { b2bDict } from '@/i18n/dict.b2b';
import { candidatDict } from '@/i18n/dict.candidat';
import { candidatsDict } from '@/i18n/dict.candidats';
import { recrutementDict } from '@/i18n/dict.recrutement';
import { navMenuDict } from '@/i18n/dict.navmenu';
import { cmapsDict } from '@/i18n/dict.cmaps';
import { offresDict } from '@/i18n/dict.offres';
import { devisDict } from '@/i18n/dict.devis';
import { suiviDict } from '@/i18n/dict.suivi';
import { adminDict } from '@/i18n/dict.admin';
import { contactDict } from '@/i18n/dict.contact';
import { demandesDict } from '@/i18n/dict.demandes';
import { guichetsDict } from '@/i18n/dict.guichets';
import { marcheDict } from '@/i18n/dict.marche';
import { legalDict } from '@/i18n/dict.legal';
import { tradePageDict } from '@/i18n/dict.trade';
import { tradePlaceDict } from '@/i18n/dict.tradePlace';
import { worldDict } from '@/i18n/dict.world';
import { walkDict } from '@/i18n/dict.walk';
import { relectureDict } from '@/i18n/dict.relecture';
import { clePosee, enregistrerPosees, type DatesPose } from './adminPariteMemory';

/**
 * L'égalité des clés entre les trois langues, fichier par fichier.
 *
 * Un texte manquant ne se voit pas à l'écran : le site retombe silencieusement
 * sur l'anglais, et un écran arabe se met à parler anglais au milieu d'une
 * phrase. Le seul endroit où le trou est visible, c'est la liste des clés — le
 * français sert de référence, et tout ce qu'il nomme doit exister en arabe et
 * en anglais.
 *
 * Le contrôle vit ici, dans la console, et se lit sur les dictionnaires
 * réellement embarqués par le site : il ne vérifie pas un fichier séparé qui
 * pourrait diverger de ce qui s'affiche.
 */

/** Les trois langues relues ; le français est la référence, jamais l'inverse. */
type TroisLangues = Record<'fr' | 'ar' | 'en', Record<string, string>>;

type EntreeParite = {
  /** Le nom du fichier tel qu'un relecteur l'ouvrirait. */
  fichier: string;
  dictionnaires: TroisLangues;
};

/**
 * Les vingt et un fichiers de textes du site, dans l'ordre où les réunit
 * `dict.ts`. Chacun se compare à lui-même : une clé peut très bien manquer en
 * anglais dans `dict.offres.ts` et exister ailleurs, ce qui ne la sauve pas.
 */
const FICHIERS: EntreeParite[] = [
  { fichier: 'dict.ts', dictionnaires: baseDict },
  { fichier: 'dict.walk.ts', dictionnaires: walkDict },
  { fichier: 'dict.candidat.ts', dictionnaires: candidatDict },
  { fichier: 'dict.candidats.ts', dictionnaires: candidatsDict },
  { fichier: 'dict.recrutement.ts', dictionnaires: recrutementDict },
  { fichier: 'dict.b2b.ts', dictionnaires: b2bDict },
  { fichier: 'dict.marche.ts', dictionnaires: marcheDict },
  { fichier: 'dict.world.ts', dictionnaires: worldDict },
  { fichier: 'dict.navmenu.ts', dictionnaires: navMenuDict },
  { fichier: 'dict.cmaps.ts', dictionnaires: cmapsDict },
  { fichier: 'dict.offres.ts', dictionnaires: offresDict },
  { fichier: 'dict.devis.ts', dictionnaires: devisDict },
  { fichier: 'dict.suivi.ts', dictionnaires: suiviDict },
  { fichier: 'dict.admin.ts', dictionnaires: adminDict },
  { fichier: 'dict.contact.ts', dictionnaires: contactDict },
  { fichier: 'dict.demandes.ts', dictionnaires: demandesDict },
  { fichier: 'dict.guichets.ts', dictionnaires: guichetsDict },
  { fichier: 'dict.legal.ts', dictionnaires: legalDict },
  { fichier: 'dict.trade.ts', dictionnaires: tradePageDict },
  { fichier: 'dict.tradePlace.ts', dictionnaires: tradePlaceDict },
  { fichier: 'dict.relecture.ts', dictionnaires: relectureDict },
];

/** Ce qu'un fichier porte, langue par langue, et ce qui manque de chaque côté. */
export type PariteFichier = {
  fichier: string;
  /** Le nombre de clés françaises : la mesure sur laquelle se lit l'écart. */
  reference: number;
  ar: number;
  en: number;
  /** Les clés nommées en français, absentes en arabe. */
  manqueAr: string[];
  /** Les clés nommées en français, absentes en anglais. */
  manqueEn: string[];
  /** Les clés qui n'existent qu'en arabe, sans équivalent français. */
  seulAr: string[];
  /** Les clés qui n'existent qu'en anglais, sans équivalent français. */
  seulEn: string[];
  /** Le texte français de chaque clé, pour la feuille de traduction du CSV. */
  textesFr: Record<string, string>;
};

/**
 * Le relevé complet : un fichier par entrée, plus les trois totaux dont
 * l'en-tête du panneau a besoin.
 */
export type PariteReleve = {
  fichiers: PariteFichier[];
  /** Les fichiers qui n'ont aucun écart : ni manque, ni clé orpheline. */
  accords: number;
  total: number;
  manqueAr: number;
  manqueEn: number;
  /** Les clés orphelines, toutes langues confondues. */
  orphelines: number;
};

/** Ce qui manque en arabe et en anglais, pour un fichier donné. */
function relever(entree: EntreeParite): PariteFichier {
  const { fr, ar, en } = entree.dictionnaires;
  const clesFr = Object.keys(fr);
  const clesAr = Object.keys(ar);
  const clesEn = Object.keys(en);
  const enAr = new Set(clesAr);
  const enEn = new Set(clesEn);
  const enFr = new Set(clesFr);

  return {
    fichier: entree.fichier,
    reference: clesFr.length,
    ar: clesAr.length,
    en: clesEn.length,
    manqueAr: clesFr.filter((cle) => !enAr.has(cle)).sort((a, b) => a.localeCompare(b)),
    manqueEn: clesFr.filter((cle) => !enEn.has(cle)).sort((a, b) => a.localeCompare(b)),
    seulAr: clesAr.filter((cle) => !enFr.has(cle)).sort((a, b) => a.localeCompare(b)),
    seulEn: clesEn.filter((cle) => !enFr.has(cle)).sort((a, b) => a.localeCompare(b)),
    /* Le texte français accompagne la clé jusqu'au CSV : le relecteur traduit
       ce qu'il lit, pas un nom de clé nu. */
    textesFr: fr,
  };
}

/** Vrai quand un fichier ne montre aucun écart, dans un sens comme dans l'autre. */
export function fichierAccorde(f: PariteFichier): boolean {
  return f.manqueAr.length === 0 && f.manqueEn.length === 0
    && f.seulAr.length === 0
    && f.seulEn.length === 0;
}

/**
 * Le relevé entier, calculé une fois par affichage : les dictionnaires sont
 * déjà en mémoire, il n'y a rien à demander au réseau.
 *
 * L'ordre met les fichiers en écart devant, les plus incomplets d'abord : le
 * relecteur ouvre le panneau sur le travail, pas sur les fichiers déjà justes.
 */
export function releveParite(): PariteReleve {
  const fichiers = FICHIERS.map(relever);
  fichiers.sort((a, b) => {
    const ecartA = a.manqueAr.length + a.manqueEn.length + a.seulAr.length + a.seulEn.length;
    const ecartB = b.manqueAr.length + b.manqueEn.length + b.seulAr.length + b.seulEn.length;
    if (ecartA !== ecartB) return ecartB - ecartA;
    return a.fichier.localeCompare(b.fichier);
  });

  return {
    fichiers,
    accords: fichiers.filter(fichierAccorde).length,
    total: fichiers.length,
    manqueAr: fichiers.reduce((n, f) => n + f.manqueAr.length, 0),
    manqueEn: fichiers.reduce((n, f) => n + f.manqueEn.length, 0),
    orphelines: fichiers.reduce((n, f) => n + f.seulAr.length + f.seulEn.length, 0),
  };
}

/**
 * Le relevé en texte brut, une ligne par fichier en écart : collé dans un
 * message, il garde les noms de clés intacts, sans tableau ni pièce jointe.
 *
 * Les fichiers déjà justes ne sont pas repris — le relecteur qui reçoit ce
 * texte n'a pas besoin de vingt lignes qui disent « rien à faire » ; le total
 * en tête rappelle combien ils sont.
 */
export function pariteTexte(): string {
  const releve = releveParite();
  const lignes: string[] = [
    'PaperAtlas · parité des clés FR / AR / EN',
    `${releve.manqueAr} clé(s) manquante(s) en arabe · ${releve.manqueEn} en anglais · `
      + `${releve.orphelines} clé(s) sans équivalent français`,
    `${releve.accords} fichier(s) d’accord sur ${releve.total}`,
    '',
  ];

  const enEcart = releve.fichiers.filter((f) => !fichierAccorde(f));

  if (enEcart.length === 0) {
    lignes.push('Aucun fichier en écart : les trois langues portent la même liste de clés.');
    return lignes.join('\n');
  }

  enEcart.forEach((f) => {
    lignes.push(`${f.fichier} — FR ${f.reference} · AR ${f.ar} · EN ${f.en}`);
    if (f.manqueAr.length > 0) lignes.push(`  manquent en arabe (${f.manqueAr.length}) : ${f.manqueAr.join(', ')}`);
    if (f.manqueEn.length > 0) lignes.push(`  manquent en anglais (${f.manqueEn.length}) : ${f.manqueEn.join(', ')}`);
    if (f.seulAr.length > 0) lignes.push(`  en arabe seulement (${f.seulAr.length}) : ${f.seulAr.join(', ')}`);
    if (f.seulEn.length > 0) lignes.push(`  en anglais seulement (${f.seulEn.length}) : ${f.seulEn.join(', ')}`);
    lignes.push('');
  });

  return lignes.join('\n');
}

/**
 * Copie le relevé dans le presse-papiers. Un navigateur qui refuse (page non
 * sécurisée, permission fermée) retombe sur une zone de texte : le geste
 * répond vrai ou faux, il ne laisse jamais l'écran sans réponse.
 */
async function copierTexte(texte: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texte);
      return true;
    }
  } catch {
    /* Le presse-papiers est fermé : le repli ci-dessous essaie encore. */
  }
  try {
    const zone = document.createElement('textarea');
    zone.value = texte;
    zone.setAttribute('readonly', 'true');
    zone.style.position = 'fixed';
    zone.style.top = '-1000px';
    zone.style.opacity = '0';
    document.body.appendChild(zone);
    zone.select();
    const parti = document.execCommand('copy');
    zone.remove();
    return parti;
  } catch {
    return false;
  }
}

/**
 * Copie le relevé dans le presse-papiers. Un navigateur qui refuse (page non
 * sécurisée, permission fermée) retombe sur une zone de texte : le geste
 * répond vrai ou faux, il ne laisse jamais l'écran sans réponse.
 */
export async function copierParite(): Promise<boolean> {
  return copierTexte(pariteTexte());
}

/* ---- le resserrement, porté par une adresse ---- */

/**
 * L'adresse du relevé déjà resserré sur un fichier, et sur la famille de clés
 * de l'écran quand elle est nommée. C'est la même porte que la pastille de
 * pose — mais écrite, donc copiable : un relecteur l'ouvre d'un clic, sans
 * traverser les vingt et un fichiers pour retrouver le sien.
 */
export function urlReleveFichier(fichier: string, prefixes: string[] = []): string {
  const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
  const params = new URLSearchParams({ parite: fichier });
  const familles = prefixes.map((fam) => fam.trim()).filter(Boolean);
  if (familles.length > 0) params.set('fam', familles.join(','));
  /* Ce qui reste à poser part avec l'adresse : le relecteur qui reçoit le lien
     sait sur quoi il met les pieds avant de l'ouvrir, et le relevé le rappelle
     en tête du resserrement. */
  const reste = restePoseFichier(fichier, familles)?.reste ?? 0;
  if (reste > 0) params.set('reste', String(reste));
  return `${base}/admin?${params.toString()}`;
}

/**
 * Le nombre de clés en écart d'un fichier : celles qui manquent d'un côté et
 * celles qui n'existent que d'un autre. Quand une famille de clés est nommée,
 * le compte se refait sur elle seule — un fichier creusé ailleurs n'est pas
 * creusé là où le relecteur travaille.
 */
export function clesEnEcart(f: PariteFichier, prefixes: string[] = []): number {
  const garde = (cle: string) => prefixes.length === 0
    || prefixes.some((prefixe) => cle.startsWith(prefixe));
  return f.manqueAr.filter(garde).length
    + f.manqueEn.filter(garde).length
    + f.seulAr.filter(garde).length
    + f.seulEn.filter(garde).length;
}

/**
 * Le rangement par clés en écart, les fichiers les plus creusés en tête : le
 * relecteur ouvre sur celui qui pèse le plus, et les fichiers d'un même poids
 * gardent l'ordre de leur nom.
 */
export function trierParEcart(
  fichiers: PariteFichier[],
  prefixes: string[] = [],
): PariteFichier[] {
  return [...fichiers].sort((a, b) => {
    const ecartA = clesEnEcart(a, prefixes);
    const ecartB = clesEnEcart(b, prefixes);
    if (ecartA !== ecartB) return ecartB - ecartA;
    return a.fichier.localeCompare(b.fichier);
  });
}

/**
 * Combien de fichiers portent encore un écart dans le périmètre lu : le
 * chiffre que le jeton du tri annonce à côté du poids du premier, pour que le
 * relecteur sache combien de fichiers ont du travail et pas seulement lequel
 * pèse le plus.
 */
export function fichiersEnEcart(
  fichiers: PariteFichier[],
  prefixes: string[] = [],
): number {
  return fichiers.filter((f) => clesEnEcart(f, prefixes) > 0).length;
}

/** Le poids du fichier qui ouvre le rangement : le chiffre que le jeton dit
 *  à côté de son nom, avant même qu'on le clique. */
export function ecartEnTete(
  fichiers: PariteFichier[],
  prefixes: string[] = [],
): number {
  return fichiers.reduce((plus, f) => Math.max(plus, clesEnEcart(f, prefixes)), 0);
}

/**
 * Le nom du fichier qui ouvre le rangement : à poids égal, celui dont le nom
 * vient en premier — exactement celui que `trierParEcart` mettrait en tête.
 * Le jeton du tri le dit à côté de son chiffre, si bien que le relecteur sait
 * lequel est le plus creusé sans dérouler la liste.
 */
export function fichierEnTete(
  fichiers: PariteFichier[],
  prefixes: string[] = [],
): string {
  let tete = '';
  let plus = 0;
  fichiers.forEach((f) => {
    const ecart = clesEnEcart(f, prefixes);
    if (ecart > plus || (ecart === plus && ecart > 0 && (tete === '' || f.fichier < tete))) {
      plus = ecart;
      tete = f.fichier;
    }
  });
  return tete;
}

/** Le geste du jeton : l'adresse du relevé resserré part dans le presse-papiers. */
export async function copierLienReleve(
  fichier: string,
  prefixes: string[] = [],
): Promise<boolean> {
  return copierTexte(urlReleveFichier(fichier, prefixes));
}

/* ---- le relevé rempli, revenu du relecteur ---- */

/**
 * Une traduction rendue par le relecteur : son fichier, sa langue, le nom
 * exact de la clé et le texte qu'il a écrit en face. La colonne peut revenir
 * vide — la clé est alors nommée, mais pas encore traduite.
 */
export type TraductionRendue = {
  fichier: string;
  langue: 'ar' | 'en';
  cle: string;
  /** Le texte français que le relecteur avait en face de la clé. */
  texteFr: string;
  /** Ce qu'il a écrit, vide tant que la clé n'est pas traduite. */
  traduction: string;
};

/** Le séparateur d'un CSV : celui que la feuille emploie vraiment. */
function separateurCsv(ligne: string): string {
  const virgules = (ligne.match(/,/g) ?? []).length;
  const pointsVirgules = (ligne.match(/;/g) ?? []).length;
  return pointsVirgules >= virgules ? ';' : ',';
}

/**
 * Découpe un CSV en cellules, guillemets compris : un tableur qui enregistre
 * une cellule entre guillemets ne doit pas couper la ligne au mauvais endroit,
 * et un guillemet doublé reste un guillemet.
 */
function decouperCsv(texte: string, sep: string): string[][] {
  const source = texte.replace(/^\uFEFF/, '');
  const lignes: string[][] = [];
  let ligne: string[] = [];
  let celluleCourante = '';
  let entreGuillemets = false;

  for (let i = 0; i < source.length; i += 1) {
    const caractere = source[i];
    if (entreGuillemets) {
      if (caractere === '"') {
        if (source[i + 1] === '"') {
          celluleCourante += '"';
          i += 1;
        } else {
          entreGuillemets = false;
        }
      } else {
        celluleCourante += caractere;
      }
      continue;
    }
    if (caractere === '"') {
      entreGuillemets = true;
    } else if (caractere === sep) {
      ligne.push(celluleCourante);
      celluleCourante = '';
    } else if (caractere === '\n') {
      ligne.push(celluleCourante);
      lignes.push(ligne);
      ligne = [];
      celluleCourante = '';
    } else if (caractere !== '\r') {
      celluleCourante += caractere;
    }
  }
  ligne.push(celluleCourante);
  lignes.push(ligne);
  return lignes;
}

/**
 * Lit le CSV revenu du relecteur : il ne regarde que la feuille « À compléter,
 * clé par clé », celle où chaque ligne nomme un fichier, une langue, une clé
 * et la traduction écrite en face. Les autres feuilles du fichier ne portent
 * pas de clé et ne disent donc rien ici.
 *
 * Une liste vide veut dire « ce fichier n'est pas un relevé de parité » :
 * l'écran le dit au lieu d'afficher un tableau vide qui ferait croire à un
 * relevé complet.
 */
export function lireRetourParite(texte: string): TraductionRendue[] {
  const source = (texte || '').replace(/^\uFEFF/, '');
  if (!source.trim()) return [];
  const repere = source
    .split(/\r?\n/)
    .find((ligne) => /langue/i.test(ligne) && /cl[ée]/i.test(ligne)) ?? source.slice(0, 400);
  const lignes = decouperCsv(source, separateurCsv(repere));

  const entete = lignes.findIndex((cellules) => {
    const titres = cellules.map((cellule) => cellule.trim().toLowerCase());
    return titres.includes('langue') && (titres.includes('clé') || titres.includes('cle'));
  });
  if (entete < 0) return [];

  const titres = lignes[entete].map((cellule) => cellule.trim().toLowerCase());
  const colFichier = titres.indexOf('fichier');
  const colLangue = titres.indexOf('langue');
  const colCle = titres.includes('clé') ? titres.indexOf('clé') : titres.indexOf('cle');
  const colFr = titres.findIndex((titre) => titre.startsWith('texte'));
  const colTrad = titres.findIndex(
    (titre) => titre.includes('compl') || titre.includes('traduction'),
  );

  const rendues: TraductionRendue[] = [];
  for (let i = entete + 1; i < lignes.length; i += 1) {
    const cellules = lignes[i];
    if (!cellules) continue;
    const cle = (cellules[colCle] ?? '').trim();
    if (!cle) continue;
    const langueBrute = (cellules[colLangue] ?? '').trim().toLowerCase();
    const langue: 'ar' | 'en' | null = langueBrute.startsWith('ar')
      ? 'ar'
      : langueBrute.startsWith('en')
        ? 'en'
        : null;
    if (!langue) continue;
    const valeur = colTrad >= 0 ? cellules[colTrad] ?? '' : cellules[cellules.length - 1] ?? '';
    rendues.push({
      fichier: (cellules[colFichier] ?? '').trim() || '—',
      langue,
      cle,
      texteFr: colFr >= 0 ? (cellules[colFr] ?? '').trim() : '',
      traduction: valeur.trim(),
    });
  }
  return rendues;
}

/**
 * Une clé rendue par le relecteur, relue à la lumière du site d'aujourd'hui :
 * `posee` dit que la clé existe désormais dans la langue visée. Une clé posée
 * depuis n'attend plus rien, même si le relecteur l'avait laissée vide — et
 * une traduction rendue pour une clé déjà posée n'a plus à être recopiée.
 */
export type TraductionMarquee = TraductionRendue & { posee: boolean };

/** Le dictionnaire d'un fichier, retrouvé par son nom : c'est lui qui dit si
 *  une clé rendue par le relecteur a été posée depuis. */
function dictionnairesDuFichier(fichier: string): TroisLangues | null {
  const trouve = FICHIERS.find((entree) => entree.fichier === fichier);
  return trouve ? trouve.dictionnaires : null;
}

/**
 * Marque, dans le relevé importé, les clés que le site porte déjà : la parité
 * se relit sur les dictionnaires embarqués, pas sur une photographie figée du
 * fichier revenu. Une clé posée entre-temps sort donc du travail restant.
 */
export function marquerPosees(retour: TraductionRendue[]): TraductionMarquee[] {
  const lus = new Map<string, TroisLangues | null>();

  return retour.map((entree) => {
    if (!lus.has(entree.fichier)) {
      lus.set(entree.fichier, dictionnairesDuFichier(entree.fichier));
    }
    const dictionnaires = lus.get(entree.fichier) ?? null;
    const langue = dictionnaires ? dictionnaires[entree.langue] : null;
    const posee = Boolean(langue && Object.prototype.hasOwnProperty.call(langue, entree.cle));
    return { ...entree, posee };
  });
}

/**
 * Le relevé importé rangé par fichier : celui qui demande le plus de clés
 * ouvre la liste, puis les suivants — deux fichiers d'un même poids suivant
 * l'ordre de leur nom. Les lignes d'un même fichier restent ensemble, dans
 * l'ordre où le relecteur les a rendues : le travail se relit fichier par
 * fichier, pas au hasard des clés, et le plus creusé ne se cherche plus.
 */
export function grouperRetourParFichier(
  entrees: TraductionMarquee[],
): Array<{ fichier: string; entrees: TraductionMarquee[] }> {
  const groupes = new Map<string, TraductionMarquee[]>();
  entrees.forEach((entree) => {
    const liste = groupes.get(entree.fichier);
    if (liste) liste.push(entree);
    else groupes.set(entree.fichier, [entree]);
  });

  return Array.from(groupes.entries())
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([fichier, liste]) => ({ fichier, entrees: liste }));
}

/**
 * Ce qu'il reste vraiment à faire : une clé que le site porte déjà n'attend
 * plus rien, et une clé vide sans traduction est le travail du second passage.
 */
export function resteACompleter(entrees: TraductionMarquee[]): TraductionMarquee[] {
  return entrees.filter((entree) => !entree.posee && entree.traduction === '');
}

/**
 * Le relevé rempli en texte : le fichier et la langue en tête de groupe, puis
 * chaque clé avec la traduction rendue — les clés encore vides sont dites
 * telles quelles, pour qu'aucune ne disparaisse du compte.
 */
export function pariteRetourTexte(retour: TraductionRendue[]): string {
  const rendues = retour.filter((entree) => entree.traduction !== '');
  const vides = retour.length - rendues.length;
  const lignes: string[] = [
    'PaperAtlas · relevé rempli par le relecteur',
    `${rendues.length} clé(s) rendues${vides > 0 ? ` · ${vides} encore vide(s)` : ''}`,
    '',
  ];

  if (retour.length === 0) {
    lignes.push('Aucune clé à compléter dans ce fichier.');
    return lignes.join('\n');
  }

  const groupes = new Map<string, TraductionRendue[]>();
  retour.forEach((entree) => {
    const cle = `${entree.fichier}|${entree.langue}`;
    const liste = groupes.get(cle) ?? [];
    liste.push(entree);
    groupes.set(cle, liste);
  });

  groupes.forEach((entrees, cle) => {
    const [fichier, langue] = cle.split('|');
    lignes.push(`${fichier} · ${langue === 'ar' ? 'arabe' : 'anglais'}`);
    entrees.forEach((entree) => {
      lignes.push(
        `  ${entree.cle} = ${entree.traduction ? `« ${entree.traduction} »` : '(vide)'}`,
      );
    });
    lignes.push('');
  });

  return lignes.join('\n');
}

/** Le geste du bouton : le relevé rempli part en texte, prêt à être recopié. */
export async function copierRetourParite(retour: TraductionRendue[]): Promise<boolean> {
  return copierTexte(pariteRetourTexte(retour));
}

/**
 * Le fichier qui ouvre l'écart, et la langue qui y manque le plus. Le compte
 * additionne les clés manquantes et les clés orphelines : un fichier où
 * l'arabe seul est en cause ne se lit pas comme un fichier où les deux côtés
 * sont creusés.
 */
export type TeteEcart = {
  fichier: string;
  langue: 'ar' | 'en' | 'both';
  /** Le nombre de clés du côté qui pèse le plus. */
  n: number;
};

/** La tête d'écart du relevé, ou null quand les trois langues s'accordent. */
export function pariteTeteEcart(releve: PariteReleve = releveParite()): TeteEcart | null {
  let tete: PariteFichier | null = null;
  let plus = 0;

  for (const f of releve.fichiers) {
    const total = f.manqueAr.length + f.manqueEn.length + f.seulAr.length + f.seulEn.length;
    if (total > plus) {
      plus = total;
      tete = f;
    }
  }

  if (tete === null || plus === 0) return null;

  const coteAr = tete.manqueAr.length + tete.seulAr.length;
  const coteEn = tete.manqueEn.length + tete.seulEn.length;
  const langue: TeteEcart['langue'] = coteAr === coteEn ? 'both' : coteAr > coteEn ? 'ar' : 'en';
  const n = langue === 'ar'
    ? tete.manqueAr.length
    : langue === 'en'
      ? tete.manqueEn.length
      : Math.max(tete.manqueAr.length, tete.manqueEn.length);

  return { fichier: tete.fichier, langue, n };
}

/* ---- le reste de pose d'un écran, lu sur ses propres textes ---- */

/**
 * Ce qu'un écran donné porte encore à poser : ses clés françaises, et celles
 * qui manquent d'un côté ou de l'autre. Une clé absente en arabe et en anglais
 * compte pour deux traductions — c'est le travail, pas la ligne.
 */
export type RestePose = {
  /** Le fichier de textes que l'écran traverse. */
  fichier: string;
  /** Les traductions encore à poser, toutes langues confondues. */
  reste: number;
  /** Les clés retenues : la mesure sur laquelle le reste se lit. */
  reference: number;
};

/**
 * Le reste de pose d'un fichier — ou d'une famille de clés dans ce fichier,
 * quand l'écran n'en traverse qu'une part : la fiche d'une annonce ne porte
 * pas tout `dict.ts`, elle porte ses clés `ann.`.
 *
 * Un fichier inconnu rend `null` plutôt qu'un zéro : un écran qui ne se relit
 * pas ici n'a rien à annoncer, et un zéro ferait croire que tout est posé.
 */
export function restePoseFichier(fichier: string, prefixes: string[] = []): RestePose | null {
  const entree = FICHIERS.find((item) => item.fichier === fichier);
  if (!entree) return null;
  const garde = (cle: string) => prefixes.length === 0
    || prefixes.some((prefixe) => cle.startsWith(prefixe));
  const cles = Object.keys(entree.dictionnaires.fr).filter(garde);
  const manquees = (langue: Record<string, string>) => cles.filter(
    (cle) => !Object.prototype.hasOwnProperty.call(langue, cle),
  ).length;

  return {
    fichier,
    reste: manquees(entree.dictionnaires.ar) + manquees(entree.dictionnaires.en),
    reference: cles.length,
  };
}

/* ---- le relevé emporté en CSV, pour le confier à un relecteur ---- */

/**
 * Le nombre de clés à compléter, toutes langues confondues : c'est le chiffre
 * que le nom du fichier porte, comme les classeurs de la console.
 */
export function clesACompleter(releve: PariteReleve = releveParite()): number {
  return releve.fichiers.reduce((n, f) => n + f.manqueAr.length + f.manqueEn.length, 0);
}

/**
 * Le nom du fichier : il dit ce qu'il porte et combien de clés attendent une
 * traduction. Deux relevés successifs ne se confondent donc plus dans un
 * dossier de téléchargements, et le premier passage se range à côté du second.
 */
export function nomFichierParite(manque: number): string {
  return `paperatlas-parite-cles-${manque}.csv`;
}

/** Une cellule de CSV : toujours citée, guillemets intérieurs doublés. */
function cellule(valeur: string | number): string {
  return `"${String(valeur).replace(/"/g, '""')}"`;
}

/**
 * Le relevé entier en CSV : une ligne par fichier de textes, avec ses trois
 * comptes et, dans des colonnes distinctes, les noms exacts des clés qui
 * manquent d'un côté et celles qui n'existent que d'un autre.
 *
 * Les clés sont séparées par une espace, jamais par un point-virgule : la
 * cellule reste lisible telle quelle quand le relecteur l'ouvre dans un
 * tableur, et chaque nom se recopie d'un seul geste. Une ligne de total ferme
 * la feuille, avec les trois chiffres de l'en-tête du panneau.
 */
export function pariteCsv(releve: PariteReleve = releveParite()): string {
  const lignes: string[] = [];

  lignes.push(
    [
      'Fichier',
      'Statut',
      'Clés FR',
      'Clés AR',
      'Clés EN',
      'Manquantes en arabe',
      'Manquantes en anglais',
      'En arabe seulement',
      'En anglais seulement',
      'Écart total',
      'À compléter',
    ]
      .map(cellule)
      .join(';'),
  );

  releve.fichiers.forEach((f) => {
    const juste = fichierAccorde(f);
    lignes.push(
      [
        f.fichier,
        juste ? 'D’accord' : 'En écart',
        f.reference,
        f.ar,
        f.en,
        f.manqueAr.join(' '),
        f.manqueEn.join(' '),
        f.seulAr.join(' '),
        f.seulEn.join(' '),
        f.manqueAr.length + f.manqueEn.length + f.seulAr.length + f.seulEn.length,
        /* La colonne du relecteur : vide par construction, elle attend la
           traduction une fois les clés lues. */
        '',
      ]
        .map(cellule)
        .join(';'),
    );
  });

  /* La ligne de rappel : quel fichier ouvre l'écart, et de quel côté il manque
     le plus de clés. Elle se lit avant le total, sans reparcourir la feuille. */
  const tete = pariteTeteEcart(releve);
  lignes.push(
    [
      'Rappel',
      tete
        ? `En tête d’écart : ${tete.fichier} — ${
          tete.langue === 'ar'
            ? 'l’arabe'
            : tete.langue === 'en'
              ? 'l’anglais'
              : 'les deux langues'
        } (${tete.n} clé(s) de ce côté)`
        : 'Aucun fichier en écart : les trois langues portent la même liste de clés.',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]
      .map(cellule)
      .join(';'),
  );

  lignes.push(
    [
      'Total',
      `${releve.accords} fichier(s) d’accord sur ${releve.total}`,
      '',
      '',
      '',
      releve.manqueAr,
      releve.manqueEn,
      '',
      '',
      releve.orphelines,
      '',
    ]
      .map(cellule)
      .join(';'),
  );

  /* La feuille de traduction : une ligne par clé manquante, son fichier, sa
     langue, son nom exact, le texte français en face — puis la colonne vide
     où le relecteur écrit la traduction. C'est cette feuille qui se remplit,
     l'une après l'autre, et qui revient à la console. */
  const aCompleter: Array<[string, string, string, string]> = [];
  releve.fichiers.forEach((f) => {
    f.manqueAr.forEach((cle) => {
      aCompleter.push([f.fichier, 'AR', cle, f.textesFr[cle] ?? '']);
    });
    f.manqueEn.forEach((cle) => {
      aCompleter.push([f.fichier, 'EN', cle, f.textesFr[cle] ?? '']);
    });
  });

  lignes.push('');
  lignes.push(['À compléter, clé par clé'].map(cellule).join(';'));
  lignes.push(['Fichier', 'Langue', 'Clé', 'Texte français', 'À compléter'].map(cellule).join(';'));

  if (aCompleter.length === 0) {
    lignes.push(['', '', '', 'Aucune clé manquante', ''].map(cellule).join(';'));
  } else {
    aCompleter.forEach((entree) => {
      lignes.push([...entree, ''].map(cellule).join(';'));
    });
  }

  /* Un BOM, pour que le tableur lise les accents dès l'ouverture. */
  return `\uFEFF${lignes.join('\r\n')}\r\n`;
}

/** Un CSV qui part de la console : un fichier, sans quitter l'écran. */
function telechargerContenu(contenu: string, nom: string): void {
  const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nom;
  lien.rel = 'noopener';
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Le geste du bouton : un fichier, téléchargé sans quitter la console. */
export function telechargerPariteCsv(): void {
  const releve = releveParite();
  telechargerContenu(pariteCsv(releve), nomFichierParite(clesACompleter(releve)));
}

/* ---- le second passage : les seules clés encore vides ---- */

/**
 * Le fichier du second passage : il ne porte que ce qui reste à écrire, et
 * son nom dit combien — comme les classeurs de la console, qui portent leur
 * compte dans leur nom. Deux passages successifs ne se confondent donc pas
 * dans un dossier de téléchargements.
 */
export function nomFichierReste(reste: number): string {
  return `paperatlas-parite-restant-${reste}.csv`;
}

/**
 * Le CSV du second passage : une ligne par clé encore vide du relevé importé,
 * c'est-à-dire ni posée depuis, ni déjà traduite par le relecteur. Le fichier
 * a exactement la forme de la feuille « À compléter, clé par clé » : il se
 * remplit de la même façon et revient par la même porte.
 */
export function pariteResteCsv(entrees: TraductionMarquee[]): string {
  const reste = resteACompleter(entrees);
  const posees = entrees.filter((entree) => entree.posee).length;
  const lignes: string[] = [];

  lignes.push(['Fichier', 'Langue', 'Clé', 'Texte français', 'À compléter'].map(cellule).join(';'));

  if (reste.length === 0) {
    lignes.push(
      ['', '', '', 'Aucune clé vide : le relevé est complet', ''].map(cellule).join(';'),
    );
  } else {
    reste.forEach((entree) => {
      lignes.push(
        [
          entree.fichier,
          entree.langue === 'ar' ? 'AR' : 'EN',
          entree.cle,
          entree.texteFr,
          '',
        ]
          .map(cellule)
          .join(';'),
      );
    });
  }

  lignes.push('');
  lignes.push(
    [
      'Rappel',
      `${reste.length} clé(s) encore vide(s) sur ${entrees.length} relue(s)`,
      `${posees} déjà posée(s) depuis`,
      '',
      '',
    ]
      .map(cellule)
      .join(';'),
  );

  return `\uFEFF${lignes.join('\r\n')}\r\n`;
}

/** Le geste du second passage : un fichier réduit aux clés encore vides. */
export function telechargerPariteResteCsv(entrees: TraductionMarquee[]): void {
  const reste = resteACompleter(entrees);
  telechargerContenu(pariteResteCsv(entrees), nomFichierReste(reste.length));
}

/* ---- les traductions rendues, emportées en CSV ---- */

/**
 * Les clés que le relecteur a traduites et que le site ne porte pas encore :
 * le travail qui se recopie tout de suite, sans passer par la copie de texte.
 */
export function traduitesARecopier(entrees: TraductionMarquee[]): TraductionMarquee[] {
  return entrees.filter((entree) => !entree.posee && entree.traduction !== '');
}

/** Le nom du fichier : il porte le nombre de traductions qu'il emmène. */
export function nomFichierTraduites(n: number): string {
  return `paperatlas-parite-traduites-${n}.csv`;
}

/**
 * Le CSV des seules traductions rendues et pas encore posées : une ligne par
 * clé, avec le texte français en face de ce que le relecteur a écrit. Il part
 * tel quel vers la personne qui pose les clés — la copie de texte n'a plus à
 * passer par un message.
 */
export function pariteTraduitesCsv(entrees: TraductionMarquee[]): string {
  const liste = traduitesARecopier(entrees);
  const posees = entrees.filter((entree) => entree.posee).length;
  const vides = entrees.filter((entree) => !entree.posee && entree.traduction === '').length;
  const lignes: string[] = [];

  lignes.push(
    ['Fichier', 'Langue', 'Clé', 'Texte français', 'Traduction rendue']
      .map(cellule)
      .join(';'),
  );

  if (liste.length === 0) {
    lignes.push(
      ['', '', '', 'Aucune traduction à recopier', ''].map(cellule).join(';'),
    );
  } else {
    liste.forEach((entree) => {
      lignes.push(
        [
          entree.fichier,
          entree.langue === 'ar' ? 'AR' : 'EN',
          entree.cle,
          entree.texteFr,
          entree.traduction,
        ]
          .map(cellule)
          .join(';'),
      );
    });
  }

  lignes.push('');
  lignes.push(
    [
      'Rappel',
      `${liste.length} clé(s) traduite(s) à recopier sur ${entrees.length} relue(s)`,
      `${vides} encore vide(s)`,
      `${posees} déjà posée(s) depuis`,
      '',
    ]
      .map(cellule)
      .join(';'),
  );

  return `\uFEFF${lignes.join('\r\n')}\r\n`;
}

/** Le geste du jeton : un fichier réduit aux traductions à recopier. */
export function telechargerPariteTraduitesCsv(entrees: TraductionMarquee[]): void {
  const liste = traduitesARecopier(entrees);
  telechargerContenu(pariteTraduitesCsv(entrees), nomFichierTraduites(liste.length));
}

/* ---- le relevé importé, re-téléchargé tel qu’il est à l’écran ---- */

/**
 * Le nom du fichier du relevé importé, tel qu’il se lit à l’écran après les
 * gommages : le nombre de lignes qu’il porte, celui des traductions déjà
 * posées, puis celui des lignes rappelées pendant la visite. Deux relevés
 * d’une même journée — l’un après un effacement, l’autre après un rappel — ne
 * se confondent donc pas dans un dossier de téléchargements, et le nom dit à
 * lui seul ce qui s’est passé.
 */
export function nomFichierReleve(lignes: number, posees: number, rappelees: number): string {
  return `paperatlas-parite-releve-${Math.max(0, Math.round(lignes))}`
    + `-posees-${Math.max(0, Math.round(posees))}`
    + `-rappelees-${Math.max(0, Math.round(rappelees))}.csv`;
}

/**
 * Le jour où la console a vu cette clé posée, quand elle l’a vu : une clé
 * encore à poser n’en a pas, et une clé posée avant la première visite non
 * plus. Une date manquante se lit donc comme « jour inconnu », jamais comme
 * aujourd’hui.
 */
export function datePosee(entree: TraductionMarquee, datesPose: DatesPose): string {
  if (!entree.posee) return '';
  return datesPose[clePosee(entree.fichier, entree.langue, entree.cle)] ?? '';
}

/** Combien de lignes du relevé portent un jour connu : le chiffre que le
 *  jeton du tri annonce avant d’être cliqué. */
export function nombreDatees(
  entrees: TraductionMarquee[],
  datesPose: DatesPose,
): number {
  return entrees.filter((entree) => datePosee(entree, datesPose) !== '').length;
}

/** Le nombre de jours entre un jour de calendrier et aujourd’hui : la mesure
 *  qu’un tableur attend, sans heure ni fuseau. */
function joursDepuis(jour: string, now: Date): number {
  const [annee, mois, quantieme] = jour.split('-').map(Number);
  const alors = Date.UTC(annee, mois - 1, quantieme);
  const aujourdhui = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((aujourdhui - alors) / 86_400_000));
}

/**
 * L’âge d’une pose, en jours : le nombre de jours écoulés depuis le jour où la
 * console a vu la clé posée pour la première fois. Une clé encore à poser, ou
 * dont le jour n’est pas connu, laisse la cellule vide — un âge inventé
 * fausserait le tri du tableur.
 */
export function agePosee(
  entree: TraductionMarquee,
  datesPose: DatesPose = {},
  now: Date = new Date(),
): string {
  const jour = datePosee(entree, datesPose);
  return jour ? String(joursDepuis(jour, now)) : '';
}

/**
 * L’âge de la plus ancienne pose connue de la liste : le chiffre que le tri
 * « À revoir en premier » annonce en tête du relevé. Il ne paraît que si la
 * liste porte vraiment un jour — un chiffre sans mesure ne dirait rien.
 */
export function agePlusAnciennePose(
  entrees: TraductionMarquee[],
  datesPose: DatesPose = {},
  now: Date = new Date(),
): number | null {
  let plusAncien = '';
  entrees.forEach((entree) => {
    const jour = datePosee(entree, datesPose);
    if (jour && (plusAncien === '' || jour < plusAncien)) plusAncien = jour;
  });
  return plusAncien === '' ? null : joursDepuis(plusAncien, now);
}

/**
 * L’âge de la plus jeune pose connue de la liste : le pendant du tri « À
 * revoir en premier », pour les traductions qui viennent d’être posées. Il ne
 * paraît que si la liste porte vraiment un jour.
 */
export function agePlusJeunePose(
  entrees: TraductionMarquee[],
  datesPose: DatesPose = {},
  now: Date = new Date(),
): number | null {
  let plusRecent = '';
  entrees.forEach((entree) => {
    const jour = datePosee(entree, datesPose);
    if (jour && (plusRecent === '' || jour > plusRecent)) plusRecent = jour;
  });
  return plusRecent === '' ? null : joursDepuis(plusRecent, now);
}

/**
 * Le relevé rangé par âge de pose, les plus jeunes d’abord : les traductions
 * posées le plus récemment ouvrent la liste. Les jours inconnus ferment la
 * liste, et les poses d’un même jour gardent l’ordre du fichier.
 */
export function trierParAgeJeune(
  entrees: TraductionMarquee[],
  datesPose: DatesPose = {},
  now: Date = new Date(),
): TraductionMarquee[] {
  const ageDe = (entree: TraductionMarquee) => {
    const age = agePosee(entree, datesPose, now);
    return age === '' ? null : Number(age);
  };

  return [...entrees].sort((a, b) => {
    const ageA = ageDe(a);
    const ageB = ageDe(b);
    if (ageA === ageB) return 0;
    if (ageA === null) return 1;
    if (ageB === null) return -1;
    return ageA - ageB;
  });
}

/**
 * Le relevé rangé par date de pose : les traductions les plus récentes en
 * tête, puis celles dont le jour n’est pas connu — dans l’ordre du fichier,
 * qui ne se défait pas. Une clé encore à poser ferme la liste plutôt que de
 * se ranger sous une date inventée, et les lignes d’un même jour gardent
 * l’ordre où le relecteur les a rendues.
 */
export function trierParPose(
  entrees: TraductionMarquee[],
  datesPose: DatesPose = {},
): TraductionMarquee[] {
  return [...entrees].sort((a, b) => {
    const jourA = datePosee(a, datesPose);
    const jourB = datePosee(b, datesPose);
    if (jourA === jourB) return 0;
    if (!jourA) return 1;
    if (!jourB) return -1;
    return jourB.localeCompare(jourA);
  });
}

/**
 * Le relevé rangé pour la relecture : les traductions posées il y a le plus
 * longtemps remontent en tête, parce que ce sont elles qui attendent un
 * second regard depuis le plus de jours. Les jours inconnus ferment la liste,
 * et les lignes d’un même jour gardent l’ordre où le relecteur les a rendues.
 */
export function trierParPoseAncien(
  entrees: TraductionMarquee[],
  datesPose: DatesPose = {},
): TraductionMarquee[] {
  return [...entrees].sort((a, b) => {
    const jourA = datePosee(a, datesPose);
    const jourB = datePosee(b, datesPose);
    if (jourA === jourB) return 0;
    if (!jourA) return 1;
    if (!jourB) return -1;
    return jourA.localeCompare(jourB);
  });
}

/**
 * Le relevé importé, tel qu’il demeure à l’écran : une ligne par clé encore
 * là, avec son état et la traduction rendue. La feuille garde la forme de
 * celle du relecteur — fichier, langue, clé, texte français, traduction —,
 * donc elle se relit par la même porte si besoin.
 *
 * La colonne « Posée le » date chaque traduction recopiée : le jour où la
 * console a vu la clé posée pour la première fois, retenu sur cet appareil.
 * La suivante en donne l’âge en jours, pour trier la relecture dans un
 * tableur sans recalculer de dates. Une clé encore à poser laisse les deux
 * cellules vides, plutôt qu’une date ou un âge qui ne voudraient rien dire.
 */
export function releveCsv(
  entrees: TraductionMarquee[],
  rappelees = 0,
  datesPose: DatesPose = {},
  now: Date = new Date(),
): string {
  const posees = entrees.filter((entree) => entree.posee).length;
  const rendues = entrees.filter((entree) => !entree.posee && entree.traduction !== '').length;
  /* Les clés posées qui portent une date : ce que la colonne « posée le »
     peut réellement dater, et ce qui reste sans jour connu. */
  const datees = entrees.filter(
    (entree) => entree.posee
      && datesPose[clePosee(entree.fichier, entree.langue, entree.cle)],
  ).length;
  /* Les lignes qui portent aussi un âge : le compte que la ligne de rappel
     annonce, pour que le tableur se vérifie à l’ouverture. */
  const agees = entrees.filter((entree) => agePosee(entree, datesPose, now) !== '').length;
  const lignes: string[] = [];

  lignes.push(
    [
      'Fichier',
      'Langue',
      'Clé',
      'Texte français',
      'Traduction rendue',
      'État',
      'Posée le',
      'Âge de la pose (jours)',
    ]
      .map(cellule)
      .join(';'),
  );

  if (entrees.length === 0) {
    lignes.push(
      ['', '', '', 'Le relevé est vide', '', '', '', ''].map(cellule).join(';'),
    );
  } else {
    entrees.forEach((entree) => {
      lignes.push(
        [
          entree.fichier,
          entree.langue === 'ar' ? 'AR' : 'EN',
          entree.cle,
          entree.texteFr,
          entree.traduction,
          entree.posee ? 'posée' : 'à poser',
          /* La date de pose, une ligne à la fois : une traduction recopiée
             dit le jour où la console l’a vue posée pour la première fois.
             Une clé encore à poser laisse la cellule vide. */
          datePosee(entree, datesPose),
          /* L’âge qui en découle, en jours : la colonne sur laquelle un
             tableur range la relecture sans recalculer de dates. */
          agePosee(entree, datesPose, now),
        ]
          .map(cellule)
          .join(';'),
      );
    });
  }

  /* La ligne de rappel : ce que le relevé porte, ce qui a été rappelé pendant
     la visite, ce qui se recopie et ce qui est déjà posé — le même compte que
     le nom du fichier, lisible à l’intérieur. */
  lignes.push('');
  lignes.push(
    [
      'Rappel',
      `${entrees.length} ligne(s) dans le relevé`,
      `${Math.max(0, Math.round(rappelees))} rappelée(s) pendant la visite`,
      `${rendues} traduite(s) à recopier`,
      `${posees} déjà posée(s)`,
      `${datees} datée(s) dans la colonne « Posée le »`,
      `${agees} avec un âge de pose`,
    ]
      .map(cellule)
      .join(';'),
  );
  lignes.push(
    [
      'Date',
      'Posée le : le jour où la console a vu la clé posée pour la première fois, '
        + 'retenu sur cet appareil. Une clé posée avant la première visite garde le jour de cette lecture.',
      'Âge de la pose : le nombre de jours écoulés depuis ce jour, '
        + 'pour trier la relecture dans un tableur. Une clé sans jour connu laisse la cellule vide.',
      '',
      '',
      '',
      '',
      '',
    ]
      .map(cellule)
      .join(';'),
  );

  return `\uFEFF${lignes.join('\r\n')}\r\n`;
}

/**
 * Le geste du jeton : le relevé tel qu’il se lit, ses lignes, ses posées et
 * ses rappelées dans son nom, et chaque traduction posée datée du jour où la
 * console l’a vue posée.
 */
export function telechargerReleveCsv(entrees: TraductionMarquee[], rappelees = 0): void {
  /* Le carnet se complète au moment de l’export : une clé posée sans date
     prend celle d’aujourd’hui, une date déjà notée ne se réécrit pas. */
  const datesPose = enregistrerPosees(entrees);
  const posees = entrees.filter((entree) => entree.posee).length;
  telechargerContenu(
    releveCsv(entrees, rappelees, datesPose),
    nomFichierReleve(entrees.length, posees, rappelees),
  );
}