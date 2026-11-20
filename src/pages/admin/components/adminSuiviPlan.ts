/**
 * Le contenu du fichier de pilotage `project_plan.md`, mis en forme pour la
 * console : les mêmes modules, les mêmes poids, les mêmes phases.
 *
 * La source reste le fichier à la racine du projet — ce module en est la
 * lecture structurée, pour que le pourcentage se recalcule tout seul à partir
 * des poids au lieu d'être recopié à la main. Quand le plan change, les deux
 * changent ensemble.
 */

export type SuiviModule = {
  /** Le nom du module, tel qu'il se lit dans le fichier de pilotage. */
  nom: string;
  /** Son poids dans le total : les poids font 100. */
  poids: number;
  /** Son taux d'achèvement, en pourcentage. */
  avancement: number;
};

export type SuiviLivrable = {
  texte: string;
  fait: boolean;
  /** L'écran que cette ligne ouvre, quand elle en ouvre un : la porte est
   *  alors posée à côté de son texte, et le repère se lit sur cette table. */
  lien?: string;
  /** Le nom exact de cet écran, pour le survol du repère. */
  ecran?: string;
};

export type SuiviPhase = {
  numero: number;
  titre: string;
  etat: 'fait' | 'encours' | 'avenir';
  objectif: string;
  livrables: SuiviLivrable[];
};

export type SuiviBlocage = {
  titre: string;
  texte: string;
  /** Le point est-il levé, ou seulement en attente d'une action extérieure ? */
  etat: 'ouvert' | 'attente' | 'leve';
};

export const SUIVI_DATE = '19 novembre 2026';
export const SUIVI_VERSION = 1023;

/** Les treize modules du plan, avec leur poids et leur taux d'achèvement. */
export const SUIVI_MODULES: SuiviModule[] = [
  { nom: 'Identité visuelle, navigation, trois langues', poids: 5, avancement: 100 },
  { nom: 'Annuaire et fiches', poids: 10, avancement: 100 },
  { nom: 'Formules, tarifs et devis', poids: 10, avancement: 95 },
  { nom: 'Demande B2B, emplois, candidatures', poids: 10, avancement: 97 },
  { nom: 'Comptes, authentification, messagerie', poids: 10, avancement: 91 },
  { nom: 'Suivi de dossier et relances', poids: 8, avancement: 91 },
  { nom: 'Formulaire de contact et onglet Demandes', poids: 8, avancement: 100 },
  { nom: 'Console d’administration', poids: 12, avancement: 100 },
  { nom: 'Base de données, RLS, stockage', poids: 8, avancement: 85 },
  { nom: 'E-mails transactionnels au nom de PaperAtlas', poids: 8, avancement: 82 },
  { nom: 'Paiements et abonnements en ligne', poids: 6, avancement: 93 },
  { nom: 'Contenus arabe et anglais, mentions légales', poids: 3, avancement: 85 },
  { nom: 'SEO et publication', poids: 2, avancement: 70 },
];

/** Le pourcentage officiel : la moyenne pondérée des taux d'achèvement. */
export function avancementTotal(modules: SuiviModule[] = SUIVI_MODULES): number {
  const total = modules.reduce((somme, m) => somme + m.poids, 0);
  if (total <= 0) return 0;
  const points = modules.reduce((somme, m) => somme + (m.poids * m.avancement) / 100, 0);
  return Math.round((points / total) * 100);
}

/** Les points acquis par un module, sur son poids. */
export function pointsModule(m: SuiviModule): number {
  return (m.poids * m.avancement) / 100;
}

/** Les points qu'un module laisse encore : ce qu'il reste à reprendre chez lui. */
export function pointsManquants(m: SuiviModule): number {
  return (m.poids * (100 - m.avancement)) / 100;
}

/** Les points manquants sur tout le plan — le complément exact du total acquis. */
export function pointsManquantsTotal(modules: SuiviModule[] = SUIVI_MODULES): number {
  return modules.reduce((somme, m) => somme + pointsManquants(m), 0);
}

/** Les modules qui ne sont pas à 100 %, le plus lourd reste devant. */
export function modulesOuverts(modules: SuiviModule[] = SUIVI_MODULES): SuiviModule[] {
  return modules
    .filter((m) => m.avancement < 100)
    .slice()
    .sort((a, b) => pointsManquants(b) - pointsManquants(a));
}

/**
 * Ce qu'un module ouvert laisse concrètement à faire, en une phrase.
 * Lu sur les livrables du plan : la phrase ne promet rien de plus que lui.
 */
export const SUIVI_MODULE_RESTE: Record<string, string> = {
  'Annuaire et fiches':
    'Derniers réglages de la rangée de filtres, relus dans les trois langues.',
  'Formules, tarifs et devis':
    'Relire les formules et le devis d’abonnement avec les tarifs définitifs.',
  'Demande B2B, emplois, candidatures':
    'Le journal des renvois, son rappel de 24 h et son export sont en place ; reste la relecture des trois langues.',
  'Comptes, authentification, messagerie':
    'Relire l’espace compte et la messagerie après les dernières captures.',
  'Suivi de dossier et relances':
    'Brancher le suivi de dossier sur les relances automatiques.',
  'Base de données, RLS, stockage':
    'Repasser les politiques RLS table par table, et les buckets de stockage.',
  'E-mails transactionnels au nom de PaperAtlas':
    'Clé RESEND_API_KEY et domaine RESEND_FROM_DOMAIN dans Supabase, puis domaine vérifié chez Resend : la console lit désormais cet état au lieu de le supposer.',
  'Paiements et abonnements en ligne':
    'Brancher le prestataire de paiement, puis la facture, la relance d’échéance et la résiliation.',
  'Contenus arabe et anglais, mentions légales':
    'Relecture humaine des versions arabe et anglaise, page par page (liste au §11 du plan).',
  'SEO et publication':
    'Données structurées, sitemap, redirections, puis publication sur le domaine.',
};

export type SuiviChantier = {
  /** Le nom du chantier, tel qu'il se lit dans le rappel sous l'avancement. */
  nom: string;
  /** Les modules dont les points manquants composent ce chantier. */
  modules: string[];
  /** Les phases du plan où se lisent ses livrables encore ouverts. */
  phases: number[];
  /** Ce que ce chantier demande encore, en une phrase. */
  reste: string;
  /** L'écran qui lance le chantier, quand il tient en un geste. */
  lien?: string;
  /** Le nom exact de cet écran, lu au survol des portes qui l'ouvrent.
   *  Écrit ici une fois, plutôt que recopié dans chaque bouton. */
  ecran?: string;
};

/**
 * Les quatre chantiers qui composent la part restante.
 *
 * Ils ne recouvrent rien et ne laissent rien dehors : chaque module ouvert
 * appartient à un seul chantier, et la somme de leurs points manquants redonne
 * exactement le complément du total acquis. Les chiffres ne sont pas recopiés :
 * ils se recalculent sur les poids et les taux ci-dessus.
 */
export const SUIVI_CHANTIERS: SuiviChantier[] = [
  {
    nom: 'Les e-mails au nom de PaperAtlas',
    modules: ['E-mails transactionnels au nom de PaperAtlas'],
    /* Le seul chantier qui se lance d'un clic : le bloc « Expéditeur des
       e-mails » des Paramètres porte l'état réel et le bouton de test. */
    phases: [5],
    reste:
      'Resend : la clé, le domaine vérifié, puis les trois tests réels — confirmation, mot de passe, rappel B2B.',
    lien: '/admin?section=params#expediteur',
    ecran: 'Paramètres › Expéditeur des e-mails',
  },
  {
    nom: 'La finition des parcours publics et du compte',
    modules: [
      'Annuaire et fiches',
      'Formules, tarifs et devis',
      'Demande B2B, emplois, candidatures',
      'Comptes, authentification, messagerie',
      'Suivi de dossier et relances',
    ],
    phases: [1, 2, 3],
    reste: 'Les derniers réglages des cinq parcours déjà en ligne.',
  },
  {
    nom: 'Le socle technique et l’encaissement',
    modules: ['Base de données, RLS, stockage', 'Paiements et abonnements en ligne'],
    phases: [6],
    reste: 'Les politiques RLS une à une, puis le prestataire de paiement.',
  },
  {
    nom: 'Les contenus définitifs et la publication',
    modules: ['Contenus arabe et anglais, mentions légales', 'SEO et publication'],
    phases: [7, 8],
    reste: 'La relecture arabe et anglaise, puis la mise en ligne.',
  },
];

/** Les livrables d'une phase qui ne sont pas encore faits. */
export function livrablesOuverts(phase: SuiviPhase): number {
  return phase.livrables.filter((livrable) => !livrable.fait).length;
}

/**
 * Combien de livrables d'un chantier restent ouverts, lus dans les phases
 * qu'il couvre — et non dans un chiffre recopié à côté du sien.
 */
export function livrablesOuvertsChantier(
  chantier: SuiviChantier,
  phases: SuiviPhase[] = SUIVI_PHASES,
): number {
  return chantier.phases.reduce((somme, numero) => {
    const phase = phases.find((p) => p.numero === numero);
    return somme + (phase ? livrablesOuverts(phase) : 0);
  }, 0);
}

/**
 * Les portes ouvertes sur les lignes du tableau des modules.
 *
 * La table ne se remplit pas à la main : elle se lit sur les chantiers du
 * plan. Un chantier qui porte un lien lègue sa porte — et le nom de l'écran
 * qu'elle ouvre — à chacun de ses modules. Ajouter une porte demain ne
 * demandera donc de toucher qu'au plan.
 */
export type PorteModule = { lien: string; ecran: string };

export function portesModules(
  chantiers: SuiviChantier[] = SUIVI_CHANTIERS,
): Record<string, PorteModule> {
  const table: Record<string, PorteModule> = {};
  chantiers.forEach((chantier) => {
    if (!chantier.lien) return;
    const porte: PorteModule = { lien: chantier.lien, ecran: chantier.ecran ?? chantier.nom };
    chantier.modules.forEach((nom) => {
      table[nom] = porte;
    });
  });
  return table;
}

/**
 * Les portes de toutes les lignes qui en reçoivent une.
 *
 * Le tableau des modules ne suffit plus : le rappel des chantiers porte lui
 * aussi une porte, et son repère doit se lire sur la même source. Modules et
 * chantiers sont donc réunis ici, par leur nom, à partir des seuls chantiers
 * du plan — ajouter un lien demain fera paraître son repère sans retoucher
 * une ligne d'écran.
 */
export function portesLignes(
  chantiers: SuiviChantier[] = SUIVI_CHANTIERS,
): Record<string, PorteModule> {
  const table = portesModules(chantiers);
  chantiers.forEach((chantier) => {
    if (!chantier.lien) return;
    table[chantier.nom] = {
      lien: chantier.lien,
      ecran: chantier.ecran ?? chantier.nom,
    };
  });
  return table;
}

/**
 * Les portes des lignes de « Ce qu'il reste à faire ».
 *
 * Même principe que pour les modules et les chantiers : une ligne qui mène à
 * un écran porte son repère, et la table se lit sur le plan — ici sur les
 * livrables eux-mêmes, qui nomment leur porte quand ils en ont une. Ajouter
 * demain un lien à un livrable fera paraître son repère sans retoucher
 * l'écran du suivi.
 */
export function portesReste(
  livrables: SuiviLivrable[] = SUIVI_RESTE,
): Record<string, PorteModule> {
  const table: Record<string, PorteModule> = {};
  livrables.forEach((livrable) => {
    if (!livrable.lien) return;
    table[livrable.texte] = {
      lien: livrable.lien,
      ecran: livrable.ecran ?? livrable.texte,
    };
  });
  return table;
}

/**
 * Les portes rattachées à leur chantier, lues sur le plan.
 *
 * Une porte oubliée dans le carnet ne dit qu'une adresse ; pour savoir où
 * l'oubli s'est concentré, la même table que les repères de ligne est
 * retournée : la porte d'un chantier, puis celles de ses modules, chacune
 * rendant le nom du chantier qui la tient. Rien n'est écrit à la main ici :
 * ajouter une porte demain la rattachera de la même façon.
 */
export function chantiersParLien(
  chantiers: SuiviChantier[] = SUIVI_CHANTIERS,
): Record<string, string> {
  const portes = portesModules(chantiers);
  const table: Record<string, string> = {};
  chantiers.forEach((chantier) => {
    if (chantier.lien) table[chantier.lien] = chantier.nom;
    chantier.modules.forEach((nom) => {
      const porte = portes[nom];
      if (porte) table[porte.lien] = chantier.nom;
    });
  });
  return table;
}

/** Le chantier qui tient une porte, ou null quand aucun ne la revendique. */
export function chantierDePorte(
  lien: string,
  chantiers: SuiviChantier[] = SUIVI_CHANTIERS,
): string | null {
  return chantiersParLien(chantiers)[lien] ?? null;
}

/** Le cap que le plan vise : 95 % du poids total. */
export const SEUIL_CAP = 95;

/**
 * Les points encore à franchir pour atteindre un cap, lus sur le total acquis.
 *
 * Le chiffre n'est pas recopié à côté du pourcentage : il se déduit des mêmes
 * poids et des mêmes taux, si bien qu'une avance sur un module le fait fondre
 * tout seul. Un cap déjà franchi rend zéro, jamais un nombre négatif.
 */
export function pointsPourFranchir(
  seuil: number = SEUIL_CAP,
  modules: SuiviModule[] = SUIVI_MODULES,
): number {
  const acquis = modules.reduce((somme, m) => somme + pointsModule(m), 0);
  return Math.max(0, seuil - acquis);
}

/**
 * Les modules qu'il faut encore avancer pour franchir le cap, du plus lourd
 * au plus léger.
 *
 * La liste se prend sur les modules ouverts, déjà rangés par points manquants
 * décroissants, et s'arrête dès que la somme atteint ce qu'il reste à
 * franchir : les modules suivants ne sont plus nécessaires pour passer le
 * seuil, et n'y entrent donc pas. Un cap déjà franchi rend une liste vide.
 */
export function modulesAvantCap(
  seuil: number = SEUIL_CAP,
  modules: SuiviModule[] = SUIVI_MODULES,
): SuiviModule[] {
  const reste = pointsPourFranchir(seuil, modules);
  if (reste <= 0) return [];
  const liste: SuiviModule[] = [];
  let cumul = 0;
  modulesOuverts(modules).forEach((module) => {
    if (cumul >= reste) return;
    liste.push(module);
    cumul += pointsManquants(module);
  });
  return liste;
}

/** Ce qu'un chantier rapporte s'il est mené à 100 % : ses points manquants. */
export function gainChantierA100(
  chantier: SuiviChantier,
  modules: SuiviModule[] = SUIVI_MODULES,
): number {
  return pointsManquantsChantier(chantier, modules);
}

/**
 * Le module le plus lourd d'un chantier : celui par qui son reste commence,
 * et donc la ligne du tableau vers laquelle sa ligne du rappel descend.
 */
export function moduleLePlusLourdChantier(
  chantier: SuiviChantier,
  modules: SuiviModule[] = SUIVI_MODULES,
): SuiviModule | null {
  const dedans = chantier.modules.flatMap((nom) =>
    modules.filter((module) => module.nom === nom),
  );
  if (dedans.length === 0) return null;
  return dedans.slice().sort((a, b) => pointsManquants(b) - pointsManquants(a))[0];
}

/**
 * L'ancre d'une ligne du tableau des modules.
 *
 * Le nom du module porte accents et espaces : l'ancre les met à plat une seule
 * fois, pour que la ligne du rappel et la ligne du tableau désignent la même
 * cible sans qu'aucun identifiant soit écrit à la main de deux côtés.
 */
export function ancreModule(nom: string): string {
  const plat = nom
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `suivi-mod-${plat}`;
}

/** Les points manquants d'un chantier, lus sur ses modules. */
export function pointsManquantsChantier(
  chantier: SuiviChantier,
  modules: SuiviModule[] = SUIVI_MODULES,
): number {
  return chantier.modules.reduce((somme, nom) => {
    const module = modules.find((m) => m.nom === nom);
    return somme + (module ? pointsManquants(module) : 0);
  }, 0);
}

/**
 * La clef courte d'un chantier : une porte l'ouvre par son adresse
 * (`?section=suivi&chantier=mail`) sans avoir à recopier son nom entier.
 */
export const CHANTIERS_CLE: Record<string, string> = {
  mail: 'Les e-mails au nom de PaperAtlas',
};

/** Le chantier nommé par une clef d'adresse, ou rien si la clef est inconnue. */
export function chantierParCle(cle: string): string | null {
  return CHANTIERS_CLE[cle.trim().toLowerCase()] ?? null;
}

/**
 * Le chantier qui pèse le plus dans la part restante : par lui le pourcentage
 * monte le plus vite, il se repère d'un coup d'œil — comme la pastille du
 * fichier le plus creusé dans le relevé de parité.
 */
export function chantierLePlusLourd(chantiers: SuiviChantier[] = SUIVI_CHANTIERS): string {
  let nom = '';
  let max = -1;
  chantiers.forEach((chantier) => {
    const pts = pointsManquantsChantier(chantier);
    if (pts > max) {
      max = pts;
      nom = chantier.nom;
    }
  });
  return nom;
}

/** Ce qui reste à faire, dans l'ordre où le plan le nomme. */
export const SUIVI_RESTE: SuiviLivrable[] = [
  { texte: 'La ligne de seuil de l’archive du plan nomme, à côté du compte des modules qui restent, le plus lourd d’entre eux — le seuil se lit par où il commence', fait: true },
  { texte: 'Le rappel porte un petit compteur des chantiers dont l’archive n’est pas encore partie de cet appareil, qui baisse dès qu’une pièce part', fait: true },
  { texte: 'Chaque ligne de la liste des points manquants descend d’un appui jusqu’à sa propre ligne du tableau, comme la liste du cap', fait: true },
  { texte: 'Chaque ligne de la liste dépliée du cap descend d’un appui jusqu’à la ligne de son module dans le tableau', fait: true },
  { texte: 'La ligne de seuil de l’archive du plan dit, à côté de la date du franchissement, le nombre de modules qui restent avant le cap', fait: true },
  { texte: 'Le survol du repère daté du cap dit le nombre de journées écoulées depuis le franchissement', fait: true },
  { texte: 'La liste des modules du cap 95 % s’ouvre d’un appui sur le bloc, pour les téléphones où le survol n’existe pas', fait: true },
  { texte: 'L’archive du plan porte, sur sa ligne de seuil, le jour du franchissement du cap — la pièce jointe se date d’elle-même', fait: true },
  { texte: 'Une petite gomme sur le repère daté du cap l’oublie sur cet appareil, sans toucher au plan ni à son archive', fait: true },
  { texte: 'Le survol du bloc « cap 95 % » dit la liste des modules qui restent avant le seuil, du plus lourd au plus léger', fait: true },
  { texte: 'L’archive du plan entier porte la même ligne de seuil que le classeur des points manquants', fait: true },
  { texte: 'Un petit repère daté se pose le jour où le cap de 95 % est franchi, gardé sur l’appareil', fait: true },
  { texte: 'L’onglet « Suivi » porte un petit bloc « cap 95 % » qui chiffre le gain des e-mails, le reste à franchir et leurs deux portes, sans quitter l’onglet', fait: true },
  { texte: 'Le classeur des points manquants se referme sur une ligne de seuil disant ce que chaque chantier apporte s’il est mené à 100 %', fait: true },
  { texte: 'Chaque chantier du rappel descend d’un geste jusqu’à la ligne de son module le plus lourd', fait: true },
  { texte: 'La ligne de la tranche la plus ancienne de la liste copiée porte son écart au plus chargé, à côté de son délai et de ses écrans gardés', fait: true },
  { texte: 'Le tableau daté se referme sur une ligne de synthèse des écrans gardés par l’ensemble des tranches ouvertes, comme le CSV et la liste copiée', fait: true },
  { texte: 'Le survol de la porte du CSV des tranches ouvertes nomme la tranche qui en garde le plus, pour situer chaque écart de la colonne', fait: true },
  { texte: 'La ligne de la tranche la plus ancienne de la liste copiée nomme les écrans qu’elle garde encore ouverts, à côté de son délai', fait: true },
  { texte: 'Le CSV des tranches ouvertes gagne une colonne « Écart au plus chargé », disant pour chaque tranche combien d’écrans la séparent de la plus chargée', fait: true },
  { texte: 'La liste copiée porte une ligne de synthèse des écrans gardés par l’ensemble des tranches ouvertes, comme la ligne du CSV', fait: true },
  { texte: 'La ligne de total du tableau daté nomme la tranche qui garde le plus d’écrans encore ouverts, comme la pastille de position', fait: true },
  { texte: 'Le CSV des tranches ouvertes porte une ligne de synthèse des écrans gardés par l’ensemble des tranches ouvertes', fait: true },
  { texte: 'La liste copiée porte le compte des tranches déplacées par le tri à côté de la tranche la plus ancienne encore ouverte', fait: true },
  { texte: 'Le survol de la pastille de position nomme la tranche rangée qui garde le plus d’écrans encore ouverts', fait: true },
  { texte: 'Le CSV des tranches ouvertes gagne une colonne « Écrans gardés » à côté de la position', fait: true },
  { texte: 'La liste copiée porte, dans son en-tête, le nom de la tranche la plus ancienne encore ouverte avec son délai', fait: true },
  { texte: 'Le survol de chaque pastille de sens dit le compte des écrans encore ouverts de sa seule tranche, à côté de son sens', fait: true },
  { texte: 'La liste copiée porte, sous la tranche qui ferme le rangement, le nombre d’écrans qu’elle garde encore ouverts', fait: true },
  { texte: 'La ligne de total du CSV des tranches ouvertes dit depuis combien de temps la tranche fermante n’a pas bougé, comme le tableau daté', fait: true },
  { texte: 'Le survol de la pastille de position porte le compte des écrans encore ouverts des tranches qu’elle range, à côté du poids du tri et de ses deux bornes', fait: true },
  { texte: 'La liste copiée en texte porte la date du dernier geste de la tranche qui ferme le rangement, sous son ordre retenu', fait: true },
  { texte: 'La ligne de total du CSV des tranches ouvertes dit le côté qui manque le plus souvent, lue sur la même règle que le tableau daté, et se referme sur la tranche qui ferme', fait: true },
  { texte: 'Le survol du bouton de la liste copiée nomme la tranche qui ferme le rangement, en plus de l’étendue de la position 1 à la dernière', fait: true },
  { texte: 'La ligne de total du tableau daté nomme la tranche qui ferme l’ordre retenu, pour refermer la copie sur son rangement', fait: true },
  { texte: 'L’en-tête de la liste copiée porte le compte des tranches déplacées par le tri, à côté du nombre de tranches ouvertes', fait: true },
  { texte: 'La ligne de total du CSV des tranches ouvertes dit l’étendue du rangement — de la position 1 à la dernière —, comme la ligne de total du tableau daté', fait: true },
  { texte: 'La ligne de tête du tableau daté nomme la tranche qui ouvre l’ordre retenu, à côté du nom de l’ordre et de son poids, comme le CSV', fait: true },
  { texte: 'La liste copiée en texte porte l’étendue du rangement, de la position 1 à la dernière, à côté du compte de tranches ouvertes', fait: true },
  { texte: 'La position de chaque tranche descend jusqu’au tableau daté copié, à côté de son nom, pour que ses quatre colonnes se lisent comme la liste et le CSV', fait: true },
  { texte: 'La ligne de total du tableau daté dit l’étendue du rangement — de la position 1 à la dernière —, en plus du compte d’écrans', fait: true },
  { texte: 'La ligne de tête du CSV des tranches ouvertes nomme la tranche qui ouvre l’ordre retenu, à côté du nom de l’ordre et de son poids', fait: true },
  { texte: 'La ligne de total du CSV des tranches ouvertes dit combien de tranches gardent encore une position, pour refermer le fichier sur son rangement', fait: true },
  { texte: 'Le survol de la pastille de position, dans la tête de frise, nomme la tranche qui ouvre et celle qui ferme l’ordre retenu', fait: true },
  { texte: 'La liste copiée en texte porte la position de chaque tranche à côté de son nom, comme la colonne « Position » du CSV', fait: true },
  { texte: 'La ligne de tête du CSV des tranches ouvertes dit combien de tranches le tri a déplacées, à côté de son nom d’ordre', fait: true },
  { texte: 'Le survol de la gomme dit depuis quand l’ordre « Fin d’abord » était tenu, l’instant du choix gardé sur l’appareil', fait: true },
  { texte: 'La liste copiée en texte porte le même compte de tranches déplacées dans sa ligne d’ordre, sous son en-tête', fait: true },
  { texte: 'La ligne de tête du tableau daté dit l’ordre des tranches ouvertes retenu — ordre du plan ou fin d’abord —, pour qu’une capture du tableau se relise seule', fait: true },
  { texte: 'Le même ordre descend jusqu’aux tranches de la frise elle-même, et pas seulement jusqu’aux pastilles de la tête', fait: true },
  { texte: 'Une petite gomme, au bout des deux pastilles, remet l’ordre des tranches ouvertes à celui du plan d’un seul clic', fait: true },
  { texte: 'Le sous-total du tableau daté compte les écrans déjà fermés de chaque tranche, à côté des écrans encore ouverts — la même symétrie que le CSV des tranches ouvertes', fait: true },
  { texte: 'Le survol de la porte des deux extrêmes donne le compte d’écrans en plus de celui des tranches du bouton, pour lire l’étendue et le poids ensemble', fait: true },
  { texte: 'La tête de frise reçoit un tri des tranches ouvertes — ordre du plan ou fin d’abord —, gardé sur l’appareil d’une visite à l’autre', fait: true },
  { texte: 'Miniature de l’en-tête : la pastille de tournée dit elle-même, un instant, ce que le geste groupé vient de fermer et le compte atteint, sans qu’on ait à survoler la carte', fait: true },
  { texte: 'Chaque tranche de la frise nomme la date de son propre dernier geste, au lieu de dépendre du seul dernier geste global', fait: true },
  { texte: 'Tête de frise : une porte « Oublier les gestes », avec confirmation, pour repartir d’un carnet de gestes vierge sans effacer les cases cochées', fait: true },
  { texte: 'Seconde tournée de relecture — écrans 11 à 20 — posée avec son propre jeton et le même geste de cochage que la première', fait: true },
  { texte: 'En-tête de la console : une pastille de tournée par tranche, chacune disant ses écrans relus et ouvrant sa liste', fait: true },
  { texte: 'CSV et liste copiée en texte : les deux tournées marquées, « Tournée 2 (11–20) » et « T2 »', fait: true },
  { texte: 'Fiche d’atelier passée au fil d’Ariane partagé, et son chemin déclaré aux moteurs sur la même liste', fait: true },
  { texte: 'Journal des renvois d’accusés — date, auteur, destinataire, état — relisible dans la console et exportable en CSV', fait: true },
  { texte: 'Compteur des accusés en attente posé dans l’en-tête de la console, visible depuis tous les onglets, et rappel au-delà de 24 heures', fait: true },
  { texte: 'Les accusés en retard portent leur repère dans la file, et la carte nomme le plus ancien dépôt encore sans accusé', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans du lot réuni de l’année fermée et du trimestre en cours représentent dans tout le carnet', fait: true },
  { texte: 'Le domaine d’envoi interrogé chez Resend depuis la console : vérifié, en attente ou introuvable, avec le jour de la vérification', fait: true },
  { texte: 'Compteur des accusés de réception dans la console — envoyés, en attente, partis aujourd’hui —, puis file des renvois avec leur bouton', fait: true },
  { texte: 'Le survol du jeton « année fermée et trimestre en cours » nomme le délai médian de chaque fenêtre, côte à côte', fait: true },
  { texte: 'Le survol du jeton « mois dernier et trimestre en cours » nomme le délai médian de chaque fenêtre, côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans du lot réuni du mois dernier et du trimestre en cours représentent dans tout le carnet', fait: true },
  { texte: 'Un jeton qui compare l’année fermée et le trimestre en cours ne garde que leurs écrans, chacun portant sa fenêtre, un écran déjà nommé par l’année n’y revenant pas ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton « avant-dernier mois et mois en cours » nomme le délai médian de chaque mois, côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans du lot réuni de l’avant-dernier mois et du mois en cours représentent dans tout le carnet', fait: true },
  { texte: 'Un jeton qui compare le mois dernier et le trimestre en cours ne garde que leurs écrans, chacun portant sa fenêtre, le mois dernier déjà compté dans le trimestre ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton « mois en cours et mois dernier » nomme le délai médian de chaque mois, côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans du lot réuni du mois en cours et du mois dernier représentent dans tout le carnet', fait: true },
  { texte: 'Un jeton qui compare l’avant-dernier mois et le mois en cours ne garde que leurs écrans, chacun portant sa fenêtre, les deux mois ne se recouvrant pas ; il se lève de lui-même quand les deux mois sont vides', fait: true },
  { texte: 'Le survol du jeton « année fermée et mois en cours » nomme l’écran revenu le plus récemment de chaque fenêtre, côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans du lot réuni de l’année fermée et du mois en cours représentent dans tout le carnet', fait: true },
  { texte: 'Un jeton qui compare le mois en cours et le mois dernier ne garde que leurs écrans, chacun portant sa fenêtre, les deux mois ne se recouvrant pas ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton « trimestre fermé et année fermée » nomme le délai médian de chaque fenêtre, côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans du lot réuni du trimestre fermé et de l’année fermée représentent dans tout le carnet', fait: true },
  { texte: 'Un jeton qui compare l’année fermée et le mois en cours ne garde que leurs écrans, chacun portant sa fenêtre, les deux fenêtres ne se recouvrant pas ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton « trimestre fermé et avant-dernier mois » nomme le délai médian de chaque fenêtre, côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du délai médian des retours datés du lot réuni de l’année fermée et de l’avant-dernier mois, sur la même mémoire', fait: true },
  { texte: 'Un jeton qui compare le trimestre fermé et l’année fermée ne garde que leurs écrans, chacun portant sa fenêtre, le trimestre fermé nommé en premier et déjà compté dans l’année ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton « année fermée et avant-dernier mois » nomme le délai le plus court de chaque fenêtre, côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans du lot réuni de l’année fermée et de l’avant-dernier mois représentent dans tout le carnet', fait: true },
  { texte: 'Un jeton qui compare le trimestre fermé et l’avant-dernier mois ne garde que leurs écrans, chacun portant sa fenêtre, l’avant-dernier mois déjà compté dans le trimestre ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton « année fermée et mois dernier » nomme la fenêtre qui revient le plus vite, avec ses deux délais côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans du lot réuni de l’année fermée et du mois dernier représentent dans tout le carnet', fait: true },
  { texte: 'Un jeton qui compare l’année fermée et l’avant-dernier mois ne garde que leurs écrans, chacun portant sa fenêtre, l’avant-dernier mois déjà compté dans l’année ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Un jeton qui compare l’année fermée et le mois dernier ne garde que leurs écrans, chacun portant sa fenêtre, le mois dernier déjà compté dans l’année ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton « avant-dernier mois et trimestre fermé » nomme le délai le plus court de chaque fenêtre, côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans du lot réuni de l’avant-dernier mois et du trimestre fermé représentent dans tout le carnet', fait: true },
  { texte: 'Un jeton qui compare l’avant-dernier mois et le trimestre fermé ne garde que leurs écrans, chacun portant sa fenêtre, l’avant-dernier mois déjà compté dans le trimestre ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton « mois dernier et trimestre fermé » nomme le délai le plus court de chaque fenêtre, côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du délai médian des retours datés du lot réuni du mois dernier et du trimestre fermé, sur la même mémoire', fait: true },
  { texte: 'Un jeton qui compare le mois dernier et le trimestre fermé ne garde que leurs écrans, chacun portant sa fenêtre, le mois dernier déjà compté dans le trimestre ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton « avant-dernier mois et mois dernier » nomme l’écran revenu le plus récemment de chaque mois, côte à côte, chacun avec son jour', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans du lot réuni des deux derniers mois fermés — l’avant-dernier mois et l’année fermée — représentent dans tout le carnet', fait: true },
  { texte: 'Un jeton qui compare l’avant-dernier mois et le mois dernier ne garde que leurs écrans, chacun portant sa fenêtre, les deux mois ne se recouvrant pas ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton « deux derniers mois fermés » nomme le délai le plus court de chaque fenêtre — l’avant-dernier mois et l’année fermée —, côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du délai médian des retours datés du lot réuni des deux fenêtres fermées, sous celle de l’année fermée, sur la même mémoire', fait: true },
  { texte: 'Un jeton « Retours datés des deux derniers mois fermés » ne garde que les écrans de l’avant-dernier mois et de l’année fermée, chacun portant sa fenêtre, l’avant-dernier mois déjà compté dans l’année fermée ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton qui compare l’année fermée et le trimestre fermé nomme l’écran revenu le plus récemment de chaque fenêtre, côte à côte, chacun avec son jour', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du délai médian des retours datés de l’année fermée, à côté de celui du trimestre fermé', fait: true },
  { texte: 'Un jeton qui compare l’année fermée et le trimestre fermé ne garde que leurs écrans, chacun portant sa fenêtre, le trimestre fermé déjà compté dans l’année fermée ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton « Retours datés de l’année fermée » nomme le délai le plus court et le plus long de son lot', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans à retours datés de l’année fermée représentent dans tout le carnet, à côté de celle du trimestre fermé', fait: true },
  { texte: 'Un jeton « Retours datés de l’année fermée » ne garde que les écrans revenus sur les douze mois qui précèdent le mois en cours, le mois courant restant dehors, son survol disant les lignes écartées ; il se lève de lui-même quand plus aucun écran n’y est revenu', fait: true },
  { texte: 'Le survol du jeton qui compare le trimestre fermé et le mois dernier nomme le délai le plus court de chacune des deux fenêtres, côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du délai médian des retours datés du trimestre fermé, à côté de celui du trimestre', fait: true },
  { texte: 'Un jeton qui compare le trimestre fermé et le mois dernier ne garde que leurs écrans, chacun portant sa fenêtre, le mois dernier déjà compté dans le trimestre ; il se lève de lui-même quand les deux fenêtres sont vides', fait: true },
  { texte: 'Le survol du jeton « Retours datés du trimestre fermé » nomme l’écran revenu le plus récemment du lot, avec son jour', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans à retours datés du trimestre fermé représentent dans tout le carnet, à côté de celle du trimestre', fait: true },
  { texte: 'Un jeton « Retours datés du trimestre fermé » ne garde que les écrans revenus sur les trois mois qui précèdent le mois en cours, le mois courant restant dehors, son survol disant les lignes écartées ; il se lève de lui-même quand plus aucun écran n’y est revenu', fait: true },
  { texte: 'Le survol du jeton des deux fenêtres nomme le délai le plus court et le plus long de chacune, côte à côte', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du délai médian des retours datés de l’avant-dernier mois, à côté de celui du mois dernier', fait: true },
  { texte: 'Un jeton « Deux fenêtres fermées » ne garde que les écrans revenus le mois dernier ou l’avant-dernier, chacun avec sa fenêtre, pour comparer les deux périodes sans les mélanger', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans à retours datés de l’avant-dernier mois représentent dans tout le carnet', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans à retours datés du mois dernier représentent dans tout le carnet', fait: true },
  { texte: 'Le survol du jeton « Retours datés de l’avant-dernier mois » nomme le délai le plus court et le plus long de son lot', fait: true },
  { texte: 'Un jeton « Retours datés du mois dernier » ne garde que les écrans revenus dans la fenêtre qui vient de se fermer avec une date, son survol disant les lignes écartées', fait: true },
  { texte: 'Le survol du jeton « Retours datés du trimestre » nomme l’écran le plus récemment revenu du lot, avec son jour', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans à retours datés du trimestre représentent dans tout le carnet', fait: true },
  { texte: 'Un jeton « Retours datés de l’année » ne garde que les écrans revenus sur les douze derniers mois avec une date, son survol disant les lignes écartées', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du délai médian des retours datés du trimestre, à côté de celui du mois', fait: true },
  { texte: 'Le survol du jeton « Retours datés du trimestre » nomme le délai le plus court et le plus long parmi ses écrans', fait: true },
  { texte: 'Un jeton « Retours datés du trimestre » ne garde que les écrans revenus ces trois derniers mois avec une date, son survol disant les lignes écartées', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans à retours datés du mois représentent dans tout le carnet', fait: true },
  { texte: 'Le survol du jeton « Retours datés du mois » nomme le délai le plus court et le plus long parmi ces écrans', fait: true },
  { texte: 'Un jeton « Retours datés du mois » ne garde que les écrans revenus ce mois-ci avec une date, son survol disant les lignes écartées', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du délai médian de la semaine en cours, juste sous celui de tout l’historique', fait: true },
  { texte: 'Le survol du jeton « Retours datés de la semaine » nomme le délai le plus court et le plus long parmi ces écrans', fait: true },
  { texte: 'Un jeton « Retours datés de la semaine » ne garde que les écrans revenus cette semaine avec une date, son survol disant les lignes écartées', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du délai médian des retours datés, à côté de la moyenne du même lot', fait: true },
  { texte: 'Le survol du jeton « Retours datés » dit combien de retours datés plus anciens le dépli laisse de côté, à côté des deux délais', fait: true },
  { texte: 'La petite gomme du dépli compte les écrans que chacun des deux jetons jumeaux retient, pour choisir lequel éteindre', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans à retours datés représentent dans le carnet, juste sous celle des écrans sans date', fait: true },
  { texte: 'Le survol du jeton « Retours datés » nomme le délai le plus court et le plus long parmi ces écrans, avec leur jour de retour', fait: true },
  { texte: 'Un jeton « Retours datés » ne garde que les écrans dont l’historique porte au moins une date de retour, complément du jeton « Aucun retour daté »', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de la part que les écrans sans aucune date de retour représentent dans tout le carnet', fait: true },
  { texte: 'Le survol du jeton « Aucun retour daté » nomme le départ le plus ancien du lot, avec les journées écoulées depuis', fait: true },
  { texte: 'Le survol du jeton des retours de plus de quinze jours nomme la part qu’ils représentent dans tout l’historique des retours datés', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du délai moyen de tout l’historique des retours datés, à côté de celui de la semaine', fait: true },
  { texte: 'Un jeton « Aucun retour daté » ne garde que les écrans dont l’historique ne porte aucune date de retour, son survol disant les lignes écartées', fait: true },
  { texte: 'Le survol du bouton « Visites en CSV » nomme le compte des retours de plus de quinze jours, à côté du délai moyen de la semaine', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du poids des retours de plus de quinze jours dans tout l’historique des retours datés', fait: true },
  { texte: 'Le survol du jeton des deux lots réunis nomme la part qu’ils représentent parmi les écrans partis de la quinzaine', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne des écrans revenus après un départ déjà sorti de la quinzaine, à côté de celle des deux lots réunis', fait: true },
  { texte: 'Le survol du jeton des retours de plus de quinze jours nomme le retour le plus rapide et le plus lent du lot, avec leur délai', fait: true },
  { texte: 'Un jeton « Retours rapides et tardifs confondus » rassemble les deux lots du CSV dans le dépli, en un seul geste', fait: true },
  { texte: 'Un jeton « Retours de plus de quinze jours » ne garde que les écrans revenus après un départ déjà sorti de la quinzaine, son survol disant les lignes écartées', fait: true },
  { texte: 'Le survol du bouton « Visites en CSV » nomme le nombre d’écrans sans aucun retour, à côté du délai moyen de la semaine', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du poids des retours rapides et des retours tardifs réunis, pour lire d’un même chiffre la part de la quinzaine qui revient vite', fait: true },
  { texte: 'Un jeton « Quinzaine sans aucun retour » ne garde que les écrans partis et jamais revenus sur les quinze jours, son survol disant les lignes écartées', fait: true },
  { texte: 'Le survol du jeton des retours rapides nomme le délai le plus court et le plus long parmi ces écrans, avec leur date de départ', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du nombre de retours rapides, à côté de celle des retours tardifs', fait: true },
  { texte: 'Un jeton « Retours rapides de la quinzaine » ne garde que les écrans revenus en sept jours ou moins, son survol disant les lignes écartées', fait: true },
  { texte: 'Le survol du jeton des retours tardifs nomme la part de la quinzaine que ces retours lents représentent, en compte et en pourcentage', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne du nombre de retours tardifs de la quinzaine, à côté de la synthèse des deux semaines', fait: true },
  { texte: 'Un jeton « Repartis quinze jours, revenus en plus de sept jours » ne garde que les retours tardifs de la quinzaine, son survol nommant le plus rapide et le plus lent avec leur délai', fait: true },
  { texte: 'Le survol du jeton des retours tardifs nomme le retour le plus rapide et le plus lent parmi ces écrans, avec leur délai et leur date de départ', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne des écrans revenus cette semaine dont le délai dépasse celui de la quinzaine, pour repérer les retours lents', fait: true },
  { texte: 'Un jeton « Partis cette quinzaine, revenus depuis » ne garde que les écrans revenus dans la semaine après un départ de la quinzaine, son survol disant les lignes écartées', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de synthèse des deux semaines côte à côte — départs, retours et solde —, pour les lire d’un seul tenant', fait: true },
  { texte: 'Le survol du bouton « Visites en CSV » nomme le délai moyen de retour de la semaine en cours, à côté de la période du total cumulé', fait: true },
  { texte: 'Le survol de la petite gomme du dépli nomme combien d’écrans chacun des jetons de la quinzaine retient, pour choisir lequel éteindre', fait: true },
  { texte: 'Un jeton « Partis cette quinzaine, jamais revenus » ne garde que ces écrans, son survol disant les lignes écartées', fait: true },
  { texte: 'Le CSV des visites rendues compte le délai moyen de retour de la semaine en cours, pour comparer les deux semaines de la quinzaine', fait: true },
  { texte: 'Le survol du bouton « Visites en CSV » nomme le nombre d’écrans que le jeton « partis dans la quinzaine puis revenus » retient, pour que le fichier ne parte pas sans qu’on sache ce qu’il garde', fait: true },
  { texte: 'Le CSV des visites rendues compte les écrans partis dans la quinzaine et jamais revenus, pour lire le solde des deux semaines', fait: true },
  { texte: 'Le survol du jeton « Repartis quinze jours et revenus depuis » dit le délai moyen entre le départ et le retour, lu sur les mêmes lignes', fait: true },
  { texte: 'Le survol du bouton « Visites en CSV » nomme la période du total cumulé des repartis — du premier au dernier départ —, pour que le fichier ne parte pas sans que l’on sache de quand à quand il compte', fait: true },
  { texte: 'Un jeton « Repartis quinze jours et revenus depuis » ne garde que les écrans partis dans la quinzaine puis ramenés au carnet, son survol disant les lignes écartées', fait: true },
  { texte: 'Le CSV des visites rendues compte les écrans revenus au carnet entre le huitième et le quinzième jour, sous les départs de la même fenêtre', fait: true },
  { texte: 'Le total cumulé des écrans repartis porte sa propre ligne de période, du premier au dernier départ, à côté de son compte', fait: true },
  { texte: 'Le CSV des visites rendues compte les écrans repartis entre le huitième et le quinzième jour, pour lire la seconde semaine de la quinzaine à part', fait: true },
  { texte: 'Le survol du jeton « Repartis cette quinzaine » dit la part de la semaine en cours dans son compte, pour situer le geste', fait: true },
  { texte: 'Le CSV des visites rendues porte le total cumulé de tous les écrans repartis, à côté de la ligne de la semaine', fait: true },
  { texte: 'Un jeton « Repartis cette quinzaine » ne garde que les écrans partis sur les quinze derniers jours, son survol disant les lignes écartées', fait: true },
  { texte: 'Le CSV des visites rendues compte les écrans repartis de la semaine en cours, jour par jour, du lundi au dimanche', fait: true },
  { texte: 'Un jeton « Repartis hier » ne garde que les écrans dont le dernier retrait tombe la veille, son survol disant les lignes écartées', fait: true },
  { texte: 'Le CSV des visites rendues compte les écrans qui ont quitté le carnet depuis sept jours, y compris ceux qui sont revenus entre-temps', fait: true },
  { texte: 'Le survol du jeton « Repartis la semaine » dit combien de jours se sont écoulés depuis le départ le plus ancien de la semaine', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne des écrans repartis aujourd’hui, à côté de celle du mois en cours', fait: true },
  { texte: 'Le survol du jeton « Repartis aujourd’hui » dit combien de lignes du dépli il écarte de la vue, comme celui des sept jours', fait: true },
  { texte: 'Le survol du jeton « Repartis la semaine » dit combien de jours se sont écoulés depuis le départ le plus récent de la semaine', fait: true },
  { texte: 'Le CSV des visites rendues porte la moyenne des écrans repartis par année, à côté du total des années', fait: true },
  { texte: 'Un jeton « Repartis aujourd’hui » ne garde que les écrans dont le dernier retrait tombe le jour même', fait: true },
  { texte: 'Un jeton « Repartis la semaine » ne garde que les écrans dont le dernier retrait tombe dans la semaine en cours, le survol les nommant un à un', fait: true },
  { texte: 'Le survol du jeton « Repartis ce mois » dit combien de jours séparent son départ le plus ancien du plus récent', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne de synthèse des écrans repartis par année de dernier retrait, posée sous celle des mois', fait: true },
  { texte: 'Le survol du jeton de relecture nomme l’écran dont les gestes ont été retirés le plus récemment, avec le jour de ce vidage', fait: true },
  { texte: 'Le CSV des visites rendues porte une ligne des écrans où l’appui sur le nom a servi, avec le jour du dernier geste de chacun', fait: true },
  { texte: 'Un second appui sur l’intitulé du tri range les écrans du dépli du plus fourni au plus léger, un troisième replie', fait: true },
  { texte: 'Le survol de la gomme des jetons dit, jeton par jeton, combien de gestes chacun retirait de la vue avant de les éteindre', fait: true },
  { texte: 'Le CSV des visites rendues porte le nombre de jetons posés au moment du téléchargement, pour que deux archives du même jour se distinguent', fait: true },
  { texte: 'Le carnet des oublis reçoit un tri des gestes par écran, pour relire les oublis d’un même écran avant d’en retirer un', fait: true },
  { texte: 'Le survol du jeton de chantier dit combien de lignes du carnet il retirerait de la vue, et le jour de leur premier oubli', fait: true },
  { texte: 'Le CSV des visites rendues porte la période de chaque chantier — du premier au dernier oubli, avec l’écart de jours — à côté de son compte', fait: true },
  { texte: 'Le carnet porte un second jeton qui ne garde que les oublis de la semaine en cours, pour relire les gestes récents avant de les effacer', fait: true },
  { texte: 'Le survol du décompte des visites rendues par chantier dit les journées qui séparent son premier oubli de son dernier, lues sur le même carnet', fait: true },
  { texte: 'Le CSV des visites rendues referme son bloc de chantiers sur une ligne comptant ceux qu’au moins deux oublis ont touchés', fait: true },
  { texte: 'Le carnet porte un jeton qui ne garde que les oublis d’un seul chantier, posé avant d’en effacer une ligne', fait: true },
  { texte: 'Chaque ligne du carnet des oublis porte sa petite gomme, qui retire ce seul geste de la mémoire d’appareil sans toucher aux visites retenues', fait: true },
  { texte: 'Le survol du décompte des visites rendues par chantier nomme le jour du dernier oubli de chacun, lu sur le même carnet', fait: true },
  { texte: 'Le CSV des visites rendues emporte le décompte par chantier, en lignes de total posées sous le journal', fait: true },
  { texte: 'Le survol du bouton « Visites en CSV » nomme le jour du plus ancien et du plus récent oubli que le fichier emportera', fait: true },
  { texte: 'Sous le carnet des oublis, un petit décompte des visites rendues par chantier, pour lire où les oublis se sont concentrés', fait: true },
  { texte: 'Le CSV des visites rendues porte une colonne « Chantier » qui rattache chaque porte oubliée à son chantier du plan', fait: true },
  { texte: 'Chaque chantier du rappel porte une petite gomme qui n’oublie que les visites de ses propres portes, sur cet appareil', fait: true },
  { texte: 'Le survol du jeton « déjà empruntées » nomme un à un les écrans qu’il laisse, avant de le poser', fait: true },
  { texte: 'Le nom du fichier texte copié par « Copier ces lignes » porte le compte des visites oubliées sur cet appareil', fait: true },
  { texte: 'Chaque chantier du rappel porte le compte de ses portes déjà empruntées, lu sur la même mémoire d’appareil, le jour de la visite nommé au survol', fait: true },
  { texte: '« Ce qu’il reste à faire » : un second jeton, « déjà empruntées », ne garde que les lignes dont la porte a déjà été visitée', fait: true },
  { texte: 'Sous la liste de « Ce qu’il reste à faire », le compte des visites oubliées depuis cet appareil, avec le jour du dernier oubli', fait: true },
  { texte: 'Sous le relevé : la date de sa dernière copie, relue sur la mémoire de l’appareil sans rouvrir le presse-papiers', fait: true },
  { texte: '« Ce qu’il reste à faire » : un bouton ne copie que les lignes retenues par le jeton, chacune avec le nom de son écran', fait: true },
  { texte: 'Jeton des portes ouvertes : les lignes dont la porte a déjà été empruntée marquées, pour distinguer ce qui reste à ouvrir', fait: true },
  { texte: 'Relevé des trois hauteurs : sa copie nomme la largeur retenue à côté des trois mesures, pour que le chiffre se relise seul', fait: true },
  { texte: 'Gomme du repère « déjà ouverte » : elle dit, juste après le clic, combien de portes viennent d’être rendues et sur quel appareil', fait: true },
  { texte: '« Ce qu’il reste à faire » : un jeton ne garde que les lignes portant une porte ouverte, lues sur la table du plan', fait: true },
  { texte: 'Aperçu du bloc arabe : l’intitulé du relevé des trois hauteurs nomme la largeur retenue, pour que ses chiffres se relisent seuls', fait: true },
  { texte: 'Repère « déjà ouverte » des deux portes : une petite gomme oublie la visite de la carte pour cet appareil, sans toucher à son état', fait: true },
  { texte: 'Repère de porte étendu aux lignes de « Ce qu’il reste à faire », quand leur ligne mène à un écran, lu sur la table du plan', fait: true },
  { texte: 'Aperçu du bloc arabe : le relevé des trois hauteurs côte à côte, 320, 480 et 640 px, chacune avec ses pixels restants', fait: true },
  { texte: 'Les deux portes du chantier e-mails marquées « déjà ouverte » quand la carte de l’expéditeur a été visitée depuis cet appareil', fait: true },
  { texte: 'Repère de porte du plan étendu à toute ligne qui reçoit un lien — modules, chantiers et points manquants', fait: true },
  { texte: 'Aperçu du bloc arabe : la ligne des pixels restant à faire défiler pour atteindre la signature, à la hauteur choisie', fait: true },
  { texte: 'Repère de module : l’écran qu’il ouvre nommé au survol, lu sur le plan', fait: true },
  { texte: 'Les deux portes du chantier des e-mails — expéditeur et Resend — posées au même endroit dans les deux vues', fait: true },
  { texte: 'Aperçu du bloc arabe : une seconde mesure en hauteur — 320, 480 et 640 px — pour juger le défilement du message', fait: true },
  { texte: 'Sous le compteur des preuves, la porte directe vers Resend à côté de celle de l’expéditeur', fait: true },
  { texte: 'Tableau du poids des modules : les lignes qui portent une porte ouverte marquées d’un repère', fait: true },
  { texte: 'Aperçu du bloc arabe comparé à trois largeurs de téléphone — 320, 360 et 390 px — d’une rangée de boutons', fait: true },
  { texte: 'Compteur des preuves d’envoi : la date de chacune nommée au survol, la confirmation, le mot de passe et le rappel B2B', fait: true },
  { texte: 'Porte « Expéditeur des e-mails » posée aussi sur la ligne du module, dans le tableau du poids des modules', fait: true },
  { texte: 'Aperçu du bloc arabe dans un cadre de 320 px, sous les modèles', fait: true },
  { texte: 'Compteur unique des trois preuves — confirmation, mot de passe, rappel B2B — en tête du suivi', fait: true },
  { texte: 'Porte « Expéditeur des e-mails » posée sous la ligne du chantier e-mails', fait: true },
  { texte: 'Bloc de copie unique des cinq valeurs du SMTP, avec son lien direct vers Authentication', fait: true },
  { texte: 'Modèles d’authentification relus en arabe sur téléphone : sens de lecture des blocs isolé', fait: true },
  { texte: 'Rappel B2B ajouté à la liste de contrôle, avec son test dédié', fait: true },
  { texte: 'Clé RESEND_API_KEY et domaine RESEND_FROM_DOMAIN ajoutés dans Supabase', fait: false, lien: '/admin?section=params#expediteur', ecran: 'Paramètres › Expéditeur des e-mails' },
  { texte: 'Domaine vérifié chez Resend, puis test réel reçu', fait: false, lien: '/admin?section=params#expediteur', ecran: 'Paramètres › Expéditeur des e-mails' },
  { texte: 'Écran « Paiements » : abonnements non encaissables signalés', fait: true },
  { texte: 'Écran « Paiements » : filtre par motif, encaissement posé sur la fiche', fait: true },
  { texte: 'Écran « Paiements » : export CSV du tableau, motif filtré dans le nom du fichier', fait: true },
  { texte: 'Fiche d’un compte : la pastille d’encaissement ouvre « Paiements » réduit au compte', fait: true },
  { texte: 'Fiche d’une annonce : lien « Signaler cette annonce », référence citée', fait: true },
  { texte: 'Fiche d’une offre d’emploi : lien « Signaler cette offre », référence citée', fait: true },
  { texte: 'Écran « Paiements » : date du dernier export retenue et relue en tête', fait: true },
  { texte: 'Fiche d’un compte : jeton « à régler » ouvrant « Paiements » resserré', fait: true },
  { texte: 'Fiche d’un atelier : lien « Signaler cette fiche », référence citée', fait: true },
  { texte: 'Écran « Paiements » : mémoire d’export effaçable en deux gestes', fait: true },
  { texte: 'Fiche d’un compte : jeton « encaissables » à côté de « à régler »', fait: true },
  { texte: 'Espace compte : lien « Signaler ce dépôt » sous chaque annonce', fait: true },
  { texte: 'Écran « Paiements » : compteur « exporté cette semaine » au-dessus de l’archive', fait: true },
  { texte: 'Fiche d’un compte : jeton « encaissables » ouvrant « Paiements » trié par montant', fait: true },
  { texte: 'Espace compte : « Demander une correction » sous un dépôt refusé, motif cité', fait: true },
  { texte: 'Écran « Paiements » : montant total de la file lue, affiché près du jeton de tri', fait: true },
  { texte: 'Fiche d’un compte : compteur d’exports de la semaine sous la fiche', fait: true },
  { texte: 'Espace compte : « Demander une correction » ouvrant le formulaire d’édition, motif en tête', fait: true },
  { texte: 'Écran « Paiements » : montant emporté par l’export retenu et relu dans l’archive', fait: true },
  { texte: 'Fiche d’un compte : compteur de la semaine cliquable vers « Paiements »', fait: true },
  { texte: 'Écran « Paiements » : part déjà encaissable dans le jeton de total de la file', fait: true },
  { texte: 'Écran « Paiements » : jeton « montant restant à régler » à côté du total', fait: true },
  { texte: 'Écran « Paiements » : montant emporté cliquable, rouvrant la vue et le motif de l’export', fait: true },
  { texte: 'Écran « Paiements » : historique des sept derniers exports sous la ligne d’archive', fait: true },
  { texte: 'Écran « Paiements » : chaque ligne d’historique rejouable, pas seulement la dernière', fait: true },
  { texte: 'Écran « Paiements » : écart entre le montant emporté et la file du jour sur la ligne d’archive', fait: true },
  { texte: 'Écran « Paiements » : nombre de lignes gagnées ou perdues depuis l’export, à côté de l’écart de montant', fait: true },
  { texte: 'Écran « Paiements » : jeton d’écart cliquable, ouvrant la file sur les lignes arrivées depuis cet export', fait: true },
  { texte: 'Écran « Paiements » : moyenne des montants emportés sous l’historique, avec sa tendance', fait: true },
  { texte: 'Écran « Paiements » : export direct des lignes arrivées depuis le bandeau de différence', fait: true },
  { texte: 'Écran « Paiements » : les exports dont le décompte a bougé portent leur écart dans l’historique', fait: true },
  { texte: 'Écran « Paiements » : deux exports de l’historique comparables entre eux, montant et lignes', fait: true },
  { texte: 'Écran « Paiements » : jeton n’affichant que les exports dont le décompte a bougé', fait: true },
  { texte: 'Écran « Paiements » : comparaison de deux exports exportée en fichier, points côte à côte', fait: true },
  { texte: 'Fiche d’un compte : exports de la semaine lus sur son seul périmètre, avec leur montant moyen', fait: true },
  { texte: 'Fiche d’un compte : montant moyen cliquable, ouvrant la comparaison de deux exports déjà choisis pour le compte', fait: true },
  { texte: 'Écran « Paiements » : troisième feuille de la comparaison, les lignes arrivées entre les deux points', fait: true },
  { texte: 'Écran « Paiements » : export le plus lourd de la semaine signalé dans l’historique, rappelé près de la moyenne', fait: true },
  { texte: 'Écran « Paiements » : pic de la semaine cliquable, rejouant l’export qui l’a produit', fait: true },
  { texte: 'Comparaison de deux exports : colonne « écart de montant » sur la feuille des lignes arrivées', fait: true },
  { texte: 'Fiche d’un compte : pic de son propre périmètre signalé à côté de sa moyenne', fait: true },
  { texte: 'Écran « Paiements » : total apporté par les arrivées cliquable, dépliant leurs montants à l’écran', fait: true },
  { texte: 'Fiche d’un compte : comparaison de deux exports de son périmètre, avec l’écart de montant de ses seules lignes', fait: true },
  { texte: 'Comparaison de deux exports : quatrième feuille, les lignes parties entre les deux points', fait: true },
  { texte: 'Écran « Paiements » : second clic sur le total des arrivées, resserrant la file sur ces lignes', fait: true },
  { texte: 'Fiche d’un compte : montant retiré au périmètre par les lignes parties entre deux exports', fait: true },
  { texte: 'Écran « Paiements » : exports dont le montant a bougé signalés dans l’historique', fait: true },
  { texte: 'Écran « Paiements » : chiffre des lignes parties cliquable, resserrant la file sur celles encore au tableau', fait: true },
  { texte: 'Fiche d’un compte : comparaison de son périmètre exportée en classeur, avec ses lignes parties et leur montant retiré', fait: true },
  { texte: 'Écran « Paiements » : jeton « montants qui ont bougé » à côté de celui des lignes, dans l’historique', fait: true },
  { texte: 'Écran « Paiements » : export CSV direct des lignes parties depuis le bandeau de resserrement', fait: true },
  { texte: 'Fiche d’un compte : lignes parties nommées une à une sous leur montant retiré', fait: true },
  { texte: 'Écran « Paiements » : exports dont l’écart de montant et de lignes partent en sens opposés signalés', fait: true },
  { texte: 'Écran « Paiements » : jeton « sens opposés » ne gardant que ces exports dans l’historique', fait: true },
  { texte: 'Fiche d’un compte : liste des lignes parties téléchargée en CSV', fait: true },
  { texte: 'Fiche d’un compte : lignes parties rangées du montant retiré le plus lourd au plus léger', fait: true },
  { texte: 'Écran « Paiements » : compteur des exports visibles quand un ou plusieurs jetons sont posés', fait: true },
  { texte: 'Écran « Paiements » : bandeau des sens opposés exporté en CSV, avec les deux écarts de chaque export', fait: true },
  { texte: 'Fiche d’un compte : nombre de lignes parties pesant plus de la moitié du montant retiré', fait: true },
  { texte: 'Écran « Paiements » : petite gomme sur le compteur des exports visibles, éteignant les trois jetons d’un geste', fait: true },
  { texte: 'Fiche d’un compte : rappel des lignes majoritaires devenu un jeton resserrant la liste et son CSV', fait: true },
  { texte: 'Classeur de comparaison du compte : la ligne pesant plus de la moitié du retrait y est marquée', fait: true },
  { texte: 'Écran « Paiements » : bouton exportant l’historique filtré par les jetons, dans l’ordre de lecture', fait: true },
  { texte: 'Fiche d’un compte : les lignes parties pesant plus de la moitié du retrait portent un repère dans la liste', fait: true },
  { texte: 'Fiche d’un compte : ligne de synthèse « dont {n} majoritaire(s) » ouvrant le CSV réduit', fait: true },
  { texte: 'Écran « Paiements » : jeton ne gardant que les exports dont le montant a baissé depuis', fait: true },
  { texte: 'Fiche d’un compte : second jeton des lignes parties, sur celles qui se partagent le retrait', fait: true },
  { texte: 'Écran « Paiements » : coût total des exports retenus sous le bouton d’export de l’historique', fait: true },
  { texte: 'Compte propriétaire promu en rôle admin, console lisible sur ce rôle et plus seulement sur l’adresse', fait: true },
  { texte: 'CSV de l’historique filtré terminé par une ligne « coût total », au chiffre de l’écran', fait: true },
  { texte: 'Fiche d’un compte : part du retrait que se partagent les lignes partagées, en pourcentage', fait: true },
  { texte: 'Écran « Paiements » : baisse cumulée portée par le jeton des montants en baisse', fait: true },
  { texte: 'CSV de l’historique filtré terminé par la baisse cumulée, à côté du coût total', fait: true },
  { texte: 'Fiche d’un compte : pourcentage partagé cliquable, resserrant la liste sur ces lignes', fait: true },
  { texte: 'Console : gestion des rôles, un second compte promu administrateur d’un clic', fait: true },
  { texte: 'Liste des clients : repère « administrateur » et compte admin sorti du décompte des établissements', fait: true },
  { texte: 'Écran « Paiements » : baisse cumulée devenue un jeton resserrant l’historique sur les seuls exports en baisse', fait: true },
  { texte: 'CSV de l’historique filtré : date de l’export le plus récent retenu, à côté du coût et de la baisse', fait: true },
  { texte: 'Liste des clients : jeton ne gardant que les comptes administrateurs, posé dans la table des comptes', fait: true },
  { texte: 'Classeur des clients : colonne « Rôle » sur l’onglet des comptes, avec la mention administrateur', fait: true },
  { texte: 'Table des comptes : nombre d’administrateurs existants affiché en tête', fait: true },
  { texte: 'Table des comptes : nombre d’administrateurs cliquable, resserrant la table d’un geste', fait: true },
  { texte: 'Classeur des clients : onglet « Administrateurs », avec la date de promotion de chaque compte', fait: true },
  { texte: 'Paramètres : nombre de comptes promus et date de la dernière promotion, à côté de la gestion des rôles', fait: true },
  { texte: 'Nom du classeur des clients complété du nombre d’administrateurs exportés', fait: true },
  { texte: 'Liste des clients : repère « À relire » sur les promotions de plus de six mois, et jeton pour les isoler', fait: true },
  { texte: 'Feuille « Administrateurs » triée par date de promotion, la plus récente en tête', fait: true },
  { texte: 'Pastille « À relire » cliquable, ouvrant la fiche du compte sur sa ligne de rôle', fait: true },
  { texte: 'Classeur des clients : ligne de synthèse des promotions de plus de six mois, à côté du compte d’administrateurs', fait: true },
  { texte: 'Feuille « Comptes » du classeur : date de promotion à côté de la colonne « Rôle »', fait: true },
  { texte: 'Table des comptes : tri par date de promotion, la plus ancienne en tête, les comptes sans date suivant', fait: true },
  { texte: 'Feuille « Comptes » du classeur : mention « Date non enregistrée » au lieu d’une case vide', fait: true },
  { texte: 'En-tête d’accueil : marque « Arabe World » posée à côté du nom PaperAtlas', fait: true },
  { texte: 'Table des comptes : compteur « promotions sans date » en tête, cliquable comme celui des administrateurs', fait: true },
  { texte: 'Onglet « Suivi du projet » : liste de relecture du §11 avec une case arabe et une case anglais par page, gardées sur l’appareil', fait: true },
  { texte: 'Liste de relecture emportée en CSV d’un bouton, cases de l’appareil comprises et ligne de total, pour la confier à un relecteur', fait: true },
  { texte: 'Liste de relecture copiée en texte brut d’un bouton posé à côté de l’export CSV : les trente écrans dans l’ordre de passage, un par ligne, avec les deux cases, prêts à coller dans un message', fait: true },
  { texte: 'Reçu B2B : les deux pièces jointes nommées dans la langue du visiteur, l’alerte de l’atelier gardant les mots de la maison', fait: true },
  { texte: 'Panneau de relecture : le vocabulaire figé du §11.2 posé sous les yeux du relecteur, dix termes en trois langues', fait: true },
  { texte: 'En-tête de la console : le nombre de pages encore à relire, lu sur le carnet de l’appareil, et la porte qui ouvre la liste', fait: true },
  { texte: 'Panneau de relecture : jeton « Cochées d’un seul côté », qui isole les pages où l’arabe et l’anglais ne s’accordent pas', fait: true },
  { texte: 'Pastilles d’en-tête devenues des portes : chacune ouvre la liste de relecture resserrée sur les pages qui restent à cocher dans sa langue', fait: true },
  { texte: 'En-tête de la console : le compte des pages cochées d’un seul côté, à côté des deux langues, ouvrant la liste resserrée sur elles', fait: true },
  { texte: 'CSV de relecture : colonne « Côté coché » nommant la langue en avance sur chaque page en désaccord, et son compte dans la ligne de total', fait: true },
  { texte: 'Panneau de relecture : le resserrement de langue et le jeton du désaccord retenus d’une visite à l’autre, comme les autres filtres de la console', fait: true },
  { texte: 'Reçus de la demande B2B et de la candidature relus en arabe : sens de lecture, police arabophone, interlettrage retiré, neuf formulations reprises', fait: true },
  { texte: 'Feuille « Administrateurs » triée par promotion, la plus ancienne en tête, comme la table des comptes', fait: true },
  { texte: 'Nom du classeur complété du tri par promotion posé à l’écran', fait: true },
  { texte: 'Rangée glissante : le nombre de filtres restant de chaque côté dit après chaque appui, dans les trois langues', fait: true },
  { texte: 'Rangée glissante : anneau discret sur le champ atteint, visible sans lire la phrase annoncée', fait: true },
  { texte: 'Rangée glissante relue en arabe sur les annonces : gestes inversés au clavier, position relue en valeur absolue, chevrons retournés', fait: true },
  { texte: 'Région lue rappelée au-dessus des résultats des deux tableaux, avec sa croix, comme le type retenu', fait: true },
  { texte: 'Porte « Tout ce pays » du menu portant le nombre de lignes du pays entier', fait: true },
  { texte: 'Région retenue suivant jusqu’aux liens de partage : pays et région écrits au clic, région jamais seule', fait: true },
  { texte: 'Feuille du menu au téléphone : ligne du chapitre repliée derrière sa flèche, la remise à zéro ne déborde plus du panneau', fait: true },
  { texte: 'Feuille du menu : en-tête nommé avec sa porte de fermeture, rubriques « Le réseau », « Travailler », « Votre compte », filets de séparation', fait: true },
  { texte: 'Feuille du menu : la demande B2B rangée sous « Demandes » comme une de ses trois voix, les demandes reçues de l’atelier nommées à part', fait: true },
  { texte: 'Feuille du menu : les huit types d’établissement repliés sous la porte de l’annuaire, ouverts par sa flèche', fait: true },
  { texte: 'Panneau « Plus » de l’ordinateur aligné sur les trois rubriques de la feuille : le réseau, le travail, le compte', fait: true },
  { texte: 'Feuille du menu : champ de recherche en tête, collé au haut du panneau, retrouvant une porte sans défiler', fait: true },
  { texte: 'Recherche de la feuille : le nom d’un type ouvre la porte de l’annuaire et ses huit types, le type trouvé marqué dans sa famille', fait: true },
  { texte: 'Résultats de la recherche rangés sous l’intitulé de leur rubrique : suivi, réseau, travail, compte', fait: true },
  { texte: 'Flèche de l’annuaire portant le nombre de types, dans la feuille comme dans le panneau « Plus »', fait: true },
  { texte: 'Panneau « Plus » élargi : une ligne d’explication par porte, et le menu des types de l’annuaire à la même largeur', fait: true },
  { texte: 'Panneau « Plus » à 360 px, et 336 px sous 1460 px ; le menu des types de l’annuaire suit la même largeur', fait: true },
  { texte: 'Feuille du menu élargie : les huit types d’établissement rangés sur deux colonnes, du bord au bord', fait: true },
  { texte: 'Pied discret du panneau « Plus » : la langue en cours et la sortie de compte, sous leur filet', fait: true },
  { texte: 'Panneau « Plus » porté à 400 px, et 372 px sous 1460 px, le menu des types suivant la même largeur', fait: true },
  { texte: 'Feuille du menu : le nom porte le total des portes, à côté de « Mon espace », relevé avant la première peinture', fait: true },
  { texte: 'Recherche de la feuille : le nombre de portes qu’elle laisse dit à voix basse, une fois la frappe posée ; la flèche se tait sur ce geste', fait: true },
  { texte: 'Feuille relue à 320 px en anglais, huit types dépliés et sourdine ouverte ; panneau « Plus » ouvert sans que liste, flèche et repère de fin se chevauchent ; barre relue à 1280 px et pied arabe replié sans chevauchement', fait: true },
  { texte: 'Feuille relue à 320 px en anglais, huit types dépliés : intitulé et pastille sur une ligne, écart resserré et filet gardant un minimum', fait: true },
  { texte: 'Pied de page replié : chaque accordéon porte le compte des portes de sa colonne, relevé sur la liste elle-même et dit en toutes lettres au lecteur d’écran', fait: true },
  { texte: 'Compte d’une rubrique annoncé à voix basse quand un repli le fait changer, lu sur la mesure d’après le repli et jamais sur une soustraction', fait: true },
  { texte: 'Pied de page replié à 320 px en arabe, les deux comptes de colonnes en place, la pastille au bout de son accordéon dans les deux sens de lecture', fait: true },
  { texte: 'Bouton « tout déplier » portant les deux comptes de colonnes — « 17 portes sur 23 » quand une seule est ouverte —, relevé sur les listes elles-mêmes', fait: true },
  { texte: 'Compte des portes du pied de page annoncé à voix basse quand le bouton global déplie ou replie les deux colonnes d’un geste', fait: true },
  { texte: 'Compte d’une colonne annoncé à voix basse quand son propre accordéon se referme et que sa pastille reparaît, lu sur la liste après le repli', fait: true },
  { texte: 'Pied de page contrôlé à 320 px en arabe, les deux colonnes ouvertes, le filet de famille courant d’un bord à l’autre de la liste', fait: true },
  { texte: 'Bouton global portant, au repos, les portes que le pied de page tient dans son nom accessible — « Tout déplier — 23 portes en tout »', fait: true },
  { texte: 'Gomme du pied de page nommant au survol les deux colonnes que sa mémoire longue efface, lues sur leurs titres', fait: true },
  { texte: 'Pied de page contrôlé à 320 px en anglais, la gomme pressée et sa question ouverte : phrase sur sa rangée, deux gestes partageant la suivante', fait: true },
  { texte: 'Mot de couture posé à la même jointure dans le panneau « Plus » et dans la feuille du téléphone, sous le filet de famille', fait: true },
  { texte: 'Pied de page contrôlé à 320 px en anglais, la gomme pressée, question et deux gestes bornés au cadre', fait: true },
  { texte: 'Mot de couture contrôlé en arabe dans le panneau et la feuille : marge logique au pas du filet, mot aligné du côté de la lecture', fait: true },
  { texte: 'Gomme nommant au survol les portes de la seule colonne retenue ouverte, comptées sur sa liste', fait: true },
  { texte: 'Question de la gomme nommant, quand une colonne est ouverte, la colonne et les portes qu’elle s’apprête à oublier, dites aussi à voix basse', fait: true },
  { texte: 'Bouton global du pied de page nommant au survol la part que la colonne restée fermée garde encore — « Un clic déplie Ailleurs — 6 portes »', fait: true },
  { texte: 'Panneau « Plus » contrôlé à 1024 px en arabe, mot de couture et huit types dépliés : mot au pas du filet, pastilles tenues dans la largeur du panneau', fait: true },
  { texte: 'Bouton global du pied de page nommant au survol les portes des deux colonnes réunies, chacune avec le compte de sa liste', fait: true },
  { texte: 'Mot de couture du pied de page porté dans la recherche de la feuille : une porte trouvée au-delà du filet dit sa famille', fait: true },
  { texte: 'Pied de page contrôlé à 1024 px en arabe, gomme pressée : question nommée bornée au cadre, groupe nommé par la question elle-même', fait: true },
  { texte: 'Mot de couture porté dans la recherche des deux tableaux du panneau « Plus », nommant la famille de chaque pays trouvé', fait: true },
  { texte: 'Portes trouvées au-delà du filet de famille dites à voix basse pendant une recherche, comptées sur les portes rendues', fait: true },
  { texte: 'Bouton global du pied de page portant le compte des deux colonnes dans son nom accessible, au même chiffre que le survol', fait: true },
  { texte: 'Panneau « Plus » contrôlé à 1024 px en arabe, une recherche sur « Algérie » : mot de famille au pas du filet, trait de couture entre les deux familles', fait: true },
  { texte: 'Pied de page relu à 320 px en anglais, les deux colonnes ouvertes : nom accessible du bouton global commençant par son libellé visible', fait: true },
  { texte: 'Voix basse des portes trouvées au-delà du filet de famille étendue à la recherche de la feuille du téléphone', fait: true },
  { texte: 'Recherche du panneau relue à 1024 px en anglais : pas du mot de famille et trait de couture valables dans les trois langues', fait: true },
  { texte: 'Famille dont la recherche vient de dépasser le filet nommée à voix basse dans la feuille, lue sur l’intitulé déjà affiché', fait: true },
  { texte: 'Recherche de la feuille relue à 320 px en arabe : deux familles nommées, pastilles en rembourrage logique tenues dans le cadre', fait: true },
  { texte: 'Recherche du panneau relue à 1024 px en arabe : pas du mot de famille et trait pointillé écrits une seule fois pour les trois langues', fait: true },
  { texte: 'Famille dépassée nommée à voix basse dans le panneau, lue sur son intitulé et à la même source que la feuille', fait: true },
  { texte: 'Recherche de la feuille relue à 320 px en anglais, deux familles nommées : pastilles tenues comme en arabe, en rembourrage logique', fait: true },
  { texte: 'Recherche du panneau relue à 1024 px en français : pas du mot de famille et de son trait posé à la source, lu par les trois langues à toutes les largeurs', fait: true },
  { texte: 'Total des portes trouvées dit à voix basse dans le panneau quand une seule famille répond, la pastille « Tout » hors compte', fait: true },
  { texte: 'Recherche de la feuille contrôlée à 320 px en arabe avec un type trouvé : retrait des pastilles et cadre du compte tenus comme en anglais', fait: true },
  { texte: 'Recherche du panneau relue à 1024 px en français avec deux familles : nom de pastille sur une ligne, compte et repère de régions intacts, nom de famille jamais coupé au milieu d’un mot', fait: true },
  { texte: 'Feuille contrôlée à 320 px en anglais avec un type trouvé : cadre du compte écrit une seule fois pour les trois langues, pastille identique à l’arabe', fait: true },
  { texte: 'Feuille : le total des portes trouvées dit à voix basse quand la recherche ne franchit aucun filet de famille, la famille nommée quand un filet est franchi', fait: true },
  { texte: 'Recherche du panneau relue à 1440 px en anglais avec un pays au nom long : pastille tenue sur une ligne au-delà de 1299 px aussi, compte et repère intacts', fait: true },
  { texte: 'Feuille contrôlée à 320 px en français avec un type trouvé : intitulé et compte sur une seule rangée malgré un nom plus long, cadre commun aux trois langues', fait: true },
  { texte: 'Voix basse de la recherche de la feuille relue en arabe avec un résultat franchissant le filet : même mot pour les portes dans les deux phrases', fait: true },
  { texte: 'Recherche du panneau relue à 1440 px en arabe avec un pays au nom long : pastille tenue sur une ligne, compte et repère de régions intacts, chiffre isolé du sens de lecture', fait: true },
  { texte: 'Feuille contrôlée à 320 px en arabe avec un type trouvé : cadre du compte fixé une fois pour les trois langues, chiffres tabulaires, pastille identique à l’anglaise', fait: true },
  { texte: 'Voix basse du panneau relue en anglais quand la recherche franchit le filet avec une porte au-delà : la famille nommée est celle qui tient les portes, à la même source que la feuille', fait: true },
  { texte: 'Voix basse de la recherche de la feuille relue à 320 px en anglais, deux familles et une porte au-delà : les deux phrases posées côte à côte, jamais ensemble, la famille nommée suivant le filet franchi', fait: true },
  { texte: 'Pastille trouvée du panneau relue à 1440 px en français, nom de pays composé : le trait d’union reste dans le nom et la pastille s’écourte par la fin', fait: true },
  { texte: 'Pastilles comptées du menu : le chiffre isolé du sens de lecture une fois pour toutes, chiffres tabulaires, dans sa propre feuille lue en dernier', fait: true },
  { texte: 'Dépôt : le montant et le téléphone d’une seule largeur de chiffre, libellés et exemples compris, pour qu’un changement de pays ne décale plus la valeur', fait: true },
  { texte: 'Dépôt relu à 320 px en arabe, une région au nom long : le libellé se replie dans le champ, la flèche garde sa place réservée', fait: true },
  { texte: 'Sélecteur de pays des tarifs relu à 360 px en anglais : chiffres d’une avance stable et champ prenant la largeur de sa plaque', fait: true },
  { texte: 'Dépôt relu à 360 px en anglais : type, rubrique, pays et région à la même hauteur minimale et au même interligne, montant et téléphone compris', fait: true },
  { texte: 'Rubriques du tableau d’annonces tenues dans leur pastille : nom le plus long replié dans sa largeur, emblème et chiffres intacts', fait: true },
  { texte: 'Compteur de pays de la carte relu à 320 px en arabe, un nom en deux mots : écart et avance des chiffres communs aux deux sens de lecture', fait: true },
  { texte: 'Contrats du tableau d’emplois relus à 320 px en arabe : emblème non comprimé, pastille cédant en largeur, hauteur et rembourrage communs à la rangée', fait: true },
  { texte: 'Description du dépôt et bouton d’envoi relus à 360 px : le bouton prend la mesure des champs qui le précèdent', fait: true },
  { texte: 'Compteur posé sur la carte mesuré comme celui du tableau à 360 px en arabe : même rembourrage, même écart, même hauteur de ligne', fait: true },
  { texte: 'Barre de comparaison relue à 360 px en arabe, trois pastilles retenues : rembourrage logique et libellé ancré sur la première rangée', fait: true },
  { texte: 'Cartes de droite du dépôt relues à 960 px, la marche vers une colonne : elles prennent la respiration fluide du formulaire', fait: true },
  { texte: 'Compte des portes d’un pays relu à 400 px avec deux chiffres : plancher de 20 px et marge de pastille, comme un compte de tableau', fait: true },
  { texte: 'Cartes de droite du dépôt mesurées au formulaire à toute largeur, au-dessus de la marche des deux colonnes comprises', fait: true },
  { texte: 'Compte des portes d’un pays relu à 460 px avec trois chiffres : boîte mesurée à son contenu, le cadre s’ouvrant au-delà du plancher', fait: true },
  { texte: 'En-tête du panneau de comparaison relu à 360 px en arabe : référence, marque de langue et ligne « préparé par » sur la mesure du panneau', fait: true },
  { texte: 'Grille de comparaison relue à 360 px en anglais avec trois profils : portrait mesuré à sa colonne, intitulé cédant 78 px à trois et 68 px à quatre', fait: true },
  { texte: 'Champs de la fenêtre de devis relus à 360 px en arabe : même mesure que l’en-tête, référence et libellé sans interlettrage, compte du message isolé', fait: true },
  { texte: 'Bloc de signature et pied de la feuille imprimée relus à 360 px en arabe : lignes mesurées au papier, référence écourtée, dates isolées', fait: true },
  { texte: 'Pied de page : total mondial de chaque métier posé à côté de son nom, dans la bande des pages par pays', fait: true },
  { texte: 'Carte du monde : compteur des familles absentes du pays lu, à côté de celui des familles jamais ouvertes', fait: true },
  { texte: 'Carte du monde : le compteur des familles absentes resserre la bande des portes sur ces seules familles, la bande se rendant d’un geste', fait: true },
  { texte: 'Carte d’un pays : le total mondial de la famille rappelé à côté de son compte local, dans la rangée des familles', fait: true },
  { texte: 'Fiche d’un atelier : le jeton « Métier concentré » nomme au survol la part du pays que sa région unique représente', fait: true },
  { texte: 'Fiche d’un atelier : jeton « Métier concentré » quand sa famille n’est tenue que dans une région du pays', fait: true },
  { texte: 'Bande resserrée : le total mondial des familles qu’elle montre posé sous ses portes, le manque lu à l’échelle du répertoire', fait: true },
  { texte: 'Bande resserrée : le survol d’une porte dit dans combien de pays du répertoire sa famille est tenue', fait: true },
  { texte: 'Carte du monde : compteur des pays où le métier lu sur une page de type est absent', fait: true },
  { texte: 'Survol de la ligne des aires menées : la part du pays dans chacune de ces aires, phrase par phrase', fait: true },
  { texte: 'Rangée d’un pays : le même geste d’aire seule sous chaque pastille, pour que les deux notes se lisent pareil', fait: true },
  { texte: 'Copie de l’aire seule : le nombre de pays qu’elle réunit, à côté de sa place dans le monde', fait: true },
  { texte: 'Copie de l’aire seule : le nom de ses pays une ligne chacun avec son rang, sous un intitulé qui les compte', fait: true },
  { texte: 'Rangée d’un pays : petite gomme sur le seul compteur des aires copiées seules, le cadrage restant intact', fait: true },
  { texte: 'Note des aires : le geste d’aire seule posé dans la pastille ajoutée de l’aire du pays, plus aucune aire sans copie', fait: true },
  { texte: 'Survol de la pastille ajoutée : le nombre d’aires de la note déjà copiées seules, pour situer le geste', fait: true },
  { texte: 'Note des aires : la même petite gomme sur le seul compte des aires copiées seules, le cadrage restant intact', fait: true },
  { texte: 'Copie de l’aire seule : le poids de chaque pays de l’aire à côté de son rang, ligne par ligne', fait: true },
  { texte: 'Survol de la gomme des aires seules : le nombre d’aires distinctes qu’elle s’apprête à oublier', fait: true },
  { texte: 'Copie d’une aire : le total des fiches de l’aire posé sous ses pays, pour vérifier la somme collée', fait: true },
  { texte: 'Rangée d’un pays : le compteur des aires seules dit combien des aires de la rangée sont déjà parties seules', fait: true },
  { texte: 'Compteur des tournées d’une page de pays : le survol dit combien des aires de la rangée sont déjà parties dans une tournée', fait: true },
  { texte: 'Sous le total d’une copie d’aire, la part que ce total représente dans les fiches du monde', fait: true },
  { texte: 'Pastille ajoutée de la note : le nombre de ses pays encore jamais copiés seuls, lu sur la mémoire des pays copiés', fait: true },
  { texte: 'Survol de la pastille ajoutée : ses pays jamais copiés seuls nommés un à un, à côté de leur compte', fait: true },
  { texte: 'Rangée d’un pays : le compteur des aires seules porte le chiffre des pays jamais copiés seuls de la rangée', fait: true },
  { texte: 'Note des aires : un geste copiant d’un coup les seules aires dont tous les pays ont déjà été copiés seuls', fait: true },
  { texte: 'En-tête de la carte du monde : geste de copie à côté du compteur d’aires complètes — nom, fiches, rang et adresse de la vue Carte', fait: true },
  { texte: 'Survol du compteur de l’en-tête : le rang de chaque aire complète parmi toutes les aires du monde, la mieux placée d’abord', fait: true },
  { texte: 'Sous la rangée d’un pays : rappel de la même porte vers l’en-tête, la note resserrée sur les aires complètes du pays', fait: true },
  { texte: 'Sous la rangée d’un pays : la porte de l’en-tête se lit enfoncée quand la note est déjà resserrée sur ces aires', fait: true },
  { texte: 'Sous la rangée d’un pays : geste de copie groupé des aires complètes jamais parties, à côté de la porte de l’en-tête', fait: true },
  { texte: 'Près du compteur d’aires complètes de l’en-tête : petit compte des copies de ces aires, avec le jour de la dernière', fait: true },
  { texte: 'Messagerie : sous le tri « relevé le plus récent », la ligne qui compte et nomme les aires jamais relevées fermant la liste', fait: true },
  { texte: 'Messagerie : la gomme des deux chemins annonce, juste après le clic, le nombre de gestes qu’elle vient d’effacer', fait: true },
  { texte: 'Classeur des clients : le tri « relevé le plus récent » nommé dans la synthèse, avec le compte qui ouvre la marche et le nom du fichier', fait: true },
  { texte: 'Messagerie : le survol de la pastille des aires resserrées dit le jour du dernier relevé de chacune', fait: true },
  { texte: 'Messagerie : petite gomme sur la ligne sous le tri des aires jamais relevées, rendant la liste entière d’un geste', fait: true },
  { texte: 'Classeur des clients : le nom du fichier porte le compte des aires jamais relevées, à côté de l’aire qui ouvre la marche', fait: true },
  { texte: 'Classeur des clients : ligne de synthèse des fils que les aires resserrées laissent dans la messagerie, un fil compté une fois', fait: true },
  { texte: 'Classeur des clients : au survol de chaque nom d’aire resserrée, le compte de ses fils dans la boîte', fait: true },
  { texte: 'Classeur des clients : plus ancienne date de relevé d’aire écrite au format jour-mois dans le nom du fichier', fait: true },
  { texte: 'Paiements en ligne des abonnements', fait: false },
  { texte: 'Relecture éditoriale des versions arabe et anglaise', fait: false },
  { texte: 'Mentions légales et politique de confidentialité', fait: true },
  { texte: 'Passe SEO finale et publication sur le domaine', fait: false },
];

/** Les huit phases du plan de développement. */
export const SUIVI_PHASES: SuiviPhase[] = [
  {
    numero: 1,
    titre: 'Socle public et annuaire',
    etat: 'encours',
    objectif: 'Un visiteur trouve un atelier et comprend l’offre.',
    livrables: [
      { texte: 'Accueil, annuaire, fiches', fait: true },
      { texte: 'Marque « Arabe World » posée à côté du nom du site dans l’en-tête d’accueil', fait: true },
      { texte: 'Formules et tarifs', fait: true },
      { texte: 'Trois langues, RTL compris', fait: true },
      { texte: 'Panneau « Plus » : noms des portes à 15 px, et même pas de défilement que la feuille du téléphone (nom à 15 px / interligne 1,28, explication à 12,5 px / 1,34)', fait: true },
      { texte: 'Arabe : libellés des deux surfaces rendus à 14,5 px / interligne 1,35, feuille recalée sur le rythme de 8 px du panneau, pastilles des huit types resserrées pour tenir leur colonne', fait: true },
      { texte: 'Pied de page replié contrôlé à 320 px en arabe : les deux comptes de colonnes en place et la pastille posée au bout de ligne, du côté du « + », sans déplacer le titre', fait: true },
      { texte: 'Bouton « tout déplier » portant les deux comptes — « 17 portes sur 23 » quand une seule colonne est ouverte —, lus sur les listes et non sur une table écrite à la main', fait: true },
      { texte: 'Compte des portes du pied de page annoncé à voix basse après le geste global, une fois les colonnes rangées et la mesure relue', fait: true },
      { texte: 'Compte d’une colonne annoncé à voix basse quand son propre accordéon se referme, la pastille revenue', fait: true },
      { texte: 'Pied de page, deux colonnes ouvertes, contrôlé à 320 px en arabe : le filet de famille court d’un bord à l’autre', fait: true },
      { texte: 'Bouton global disant au repos les portes du pied de page dans son nom accessible', fait: true },
      { texte: 'Gomme du pied de page nommant au survol les deux colonnes effacées ; pied contrôlé à 320 px en anglais, question ouverte', fait: true },
      { texte: 'Mot de couture du pied de page repris dans le panneau « Plus » et dans la feuille, à la même jointure', fait: true },
      { texte: 'Pied contrôlé à 320 px en anglais, gomme pressée : question et deux gestes dans le cadre', fait: true },
      { texte: 'Mot de couture relu en arabe dans les deux surfaces du menu, posé au pas du filet, du côté de la lecture', fait: true },
      { texte: 'Gomme disant au survol les portes de la seule colonne restée ouverte', fait: true },
      { texte: 'Question de la gomme nommant la colonne ouverte et les portes qu’elle va oublier, dans les trois langues, sa rangée entière à 320 px', fait: true },
      { texte: 'Bouton global nommant au survol la part que la colonne fermée garde encore', fait: true },
      { texte: 'Panneau « Plus » contrôlé à 1024 px en arabe, huit types dépliés : mot de couture et pastilles au pas du panneau', fait: true },
      { texte: 'Bouton global nommant au survol les portes des deux colonnes réunies', fait: true },
      { texte: 'Mot de couture porté dans la recherche du menu : la porte trouvée dit sa famille', fait: true },
      { texte: 'Pied de page contrôlé à 1024 px en arabe, gomme pressée, question nommée tenue dans le cadre', fait: true },
      { texte: 'Mot de couture repris dans la recherche des deux tableaux du panneau « Plus » : un pays trouvé dit sa famille', fait: true },
      { texte: 'Recherche des deux tableaux : les portes trouvées au-delà du filet de famille dites à voix basse, une fois la frappe posée', fait: true },
      { texte: 'Bouton global du pied de page nommant les deux colonnes et leurs portes dans son nom accessible', fait: true },
      { texte: 'Panneau « Plus » contrôlé à 1024 px en arabe sur une recherche : mot de famille au pas du filet, deux familles lisibles', fait: true },
      { texte: 'Pied de page à 320 px en anglais, deux colonnes ouvertes : nom accessible du bouton global commençant par son libellé', fait: true },
      { texte: 'Portes trouvées au-delà du filet de famille dites à voix basse dans la recherche de la feuille aussi', fait: true },
      { texte: 'Recherche du panneau relue à 1024 px en anglais : mot de famille au pas du filet, trait de couture entre les deux familles', fait: true },
      { texte: 'Famille dépassée nommée à voix basse pendant la recherche de la feuille', fait: true },
      { texte: 'Recherche de la feuille relue à 320 px en arabe, les deux familles nommées et les pastilles tenues dans le cadre', fait: true },
      { texte: 'Recherche du panneau relue à 1024 px en arabe, les deux familles et leur trait de couture au même pas qu’en anglais', fait: true },
      { texte: 'Famille dépassée nommée à voix basse dans le panneau, à la même source que la feuille', fait: true },
      { texte: 'Recherche de la feuille relue à 320 px en anglais, deux familles nommées, pastilles tenues comme en arabe', fait: true },
      { texte: 'Recherche du panneau relue à 1024 px en français avec deux familles : nom de pastille sur une ligne, compte intact, nom de famille jamais coupé au milieu d’un mot', fait: true },
      { texte: 'Feuille contrôlée à 320 px en anglais avec un type trouvé : cadre du compte commun aux trois langues', fait: true },
      { texte: 'Feuille : total des portes trouvées dit à voix basse quand aucun filet de famille n’est franchi', fait: true },
      { texte: 'Recherche du panneau relue à 1440 px en anglais, pays au nom long : pastille tenue sur une ligne à toutes les largeurs du panneau', fait: true },
      { texte: 'Feuille contrôlée à 320 px en français, type trouvé : intitulé et compte sur une rangée, le filet cédant avant le chiffre', fait: true },
      { texte: 'Voix basse de la recherche de la feuille relue en arabe, résultat au-delà du filet : les deux phrases comptent les portes du même mot', fait: true },
      { texte: 'Voix basse de la recherche de la feuille relue à 320 px en anglais, deux familles et une porte au-delà : deux phrases exclusives posées côte à côte', fait: true },
      { texte: 'Pastille trouvée du panneau relue à 1440 px en français avec un nom de pays composé : trait d’union gardé, nom écourté par la fin', fait: true },
      { texte: 'Pastilles comptées du menu : chiffres isolés du sens de lecture et chiffres tabulaires, une seule règle pour toutes', fait: true },
      { texte: 'Dépôt : montant et téléphone en chiffres tabulaires, libellés et exemples compris', fait: true },
      { texte: 'Dépôt relu à 320 px en arabe, région au nom long : libellé replié dans le champ, flèche intacte', fait: true },
      { texte: 'Sélecteur de pays des tarifs relu à 360 px en anglais : chiffres stables et champ à la largeur de sa plaque', fait: true },
      { texte: 'Dépôt relu à 360 px en anglais : les quatre listes à une seule hauteur et un seul interligne', fait: true },
      { texte: 'Rubriques du tableau d’annonces tenues dans leur pastille, nom le plus long replié dans sa largeur', fait: true },
      { texte: 'Compteur de pays de la carte relu à 320 px en arabe, un nom de pays en deux mots', fait: true },
      { texte: 'Contrats du tableau d’emplois relus à 320 px en arabe, tenus comme les rubriques des annonces', fait: true },
      { texte: 'Gomme des aires seules : le survol annonce les aires distinctes qu’elle va oublier, le cadrage restant', fait: true },
      { texte: 'Copie d’une aire : le total de ses fiches sous ses pays, dans les quatre gestes d’aire seule', fait: true },
      { texte: 'Rangée d’un pays : le compteur des aires seules situe le geste sur les aires de la rangée', fait: true },
      { texte: 'Compteur des tournées d’une page de pays : le survol dit combien des aires de la rangée sont déjà parties dans une tournée', fait: true },
      { texte: 'Copie d’une aire : la part du total dans les fiches du monde, sous le total de ses pays', fait: true },
      { texte: 'Pastille ajoutée de la note : le nombre de ses pays encore jamais copiés seuls', fait: true },
      { texte: 'Survol de la pastille ajoutée : ses pays jamais copiés seuls nommés un à un', fait: true },
      { texte: 'Rangée d’un pays : le compteur des aires seules porte le chiffre des pays jamais copiés seuls', fait: true },
      { texte: 'Note des aires : un geste copiant les aires dont tous les pays ont déjà été copiés seuls', fait: true },
  { texte: 'Légende des aires complètes : le survol dit les fiches qu’elles tiendraient une fois envoyées', fait: true },
  { texte: 'Carte du monde : compteur des aires complètes jamais parties dans l’en-tête, à côté des familles jamais ouvertes', fait: true },
  { texte: 'Note des aires : un clic sur la coche resserre la carte sur cette seule aire complète', fait: true },
  { texte: 'Survol du geste « aires complètes » : les aires restées incomplètes nommées avec les pays qui leur manquent', fait: true },
  { texte: 'Compteur des aires seules d’une page de pays cliquable, ouvrant la note resserrée sur la rangée', fait: true },
  { texte: 'Compteur des tournées de la note : combien d’aires complètes sont déjà parties au moins une fois', fait: true },
  { texte: 'Geste de copie posé à côté du compteur d’aires complètes de l’en-tête : nom, fiches, rang et adresse de la vue Carte', fait: true },
  { texte: 'Survol du compteur de l’en-tête disant le rang de chaque aire complète parmi les aires du monde', fait: true },
  { texte: 'Rangée d’un pays : rappel de la porte de l’en-tête sous la rangée, la note et la rangée se rejoignant d’un clic', fait: true },
      { texte: 'Description du dépôt et bouton d’envoi relus à 360 px, à la même mesure que les champs au-dessus', fait: true },
      { texte: 'Compteur posé sur la carte comparé à celui du tableau à 360 px en arabe, avec un nom de pays en deux mots', fait: true },
      { texte: 'Barre de comparaison relue à 360 px en arabe avec trois pastilles : rembourrage logique, libellé ancré sur la première rangée, gestes gardant la leur', fait: true },
      { texte: 'Cartes de droite du dépôt relues à 960 px, la largeur où la grille devient une colonne : même respiration que le formulaire', fait: true },
      { texte: 'Compte des portes d’un pays relu à 400 px avec deux chiffres, tenu comme un compte de tableau', fait: true },
      { texte: 'Cartes de droite du dépôt mesurées au formulaire à toute largeur, et non plus sous la seule marche', fait: true },
      { texte: 'Compte des portes d’un pays relu à 460 px avec trois chiffres, le cadre s’ouvrant au-delà du plancher', fait: true },
      { texte: 'En-tête du panneau de comparaison relu à 360 px en arabe, chaque bloc sur sa rangée à la mesure du panneau', fait: true },
      { texte: 'Derniers réglages de la rangée de filtres, relus dans les trois langues', fait: false },
      { texte: 'Formules et devis d’abonnement relus avec les tarifs définitifs', fait: false },
    ],
  },
  {
    numero: 2,
    titre: 'Dossiers et demandes',
    etat: 'encours',
    objectif: 'Une demande part et se suit.',
    livrables: [
      { texte: 'Devis d’abonnement, demande B2B', fait: true },
      { texte: 'Offre d’emploi, candidature', fait: true },
      { texte: 'Suivi par référence, e-mails de confirmation', fait: true },
      { texte: 'File des candidatures et accusés de réception terminés', fait: true },
      { texte: 'Accusé de réception compté dans la console et renvoyable d’un bouton quand il n’est pas parti', fait: true },
      { texte: 'Journal des renvois — date, auteur, destinataire — relisible dans la console et exportable en CSV, avec le rappel des accusés en attente depuis plus de 24 heures', fait: true },
      { texte: 'Suivi de dossier branché sur les relances automatiques', fait: false },
    ],
  },
  {
    numero: 3,
    titre: 'Espace compte et messagerie',
    etat: 'encours',
    objectif: 'Chaque structure gère ses annonces, ses devis et ses échanges.',
    livrables: [
      { texte: 'Inscription, connexion, réinitialisation', fait: true },
      { texte: 'Mes annonces, mes devis, ma messagerie', fait: true },
      { texte: 'Profil candidat et CV', fait: true },
      { texte: 'Espace compte et messagerie relus après les dernières captures', fait: false },
    ],
  },
  {
    numero: 4,
    titre: 'Console d’administration',
    etat: 'fait',
    objectif: 'Tout suivre depuis un seul écran.',
    livrables: [
      { texte: 'Clients, annonces, messages, journal', fait: true },
      { texte: 'Demandes : comptage, période, file, réponse, export', fait: true },
      { texte: 'Onglet « Suivi » : avancement du projet lu sur place', fait: true },
      { texte: 'En-tête de la console : compteur des accusés de réception en attente, rappel au-delà de 24 heures', fait: true },
      { texte: 'Table des comptes : compteurs d’administrateurs et de promotions sans date en tête', fait: true },
      { texte: 'Onglet « Paiements » : abonnements non encaissables signalés', fait: true },
    ],
  },
  {
    numero: 5,
    titre: 'E-mails au nom de PaperAtlas',
    etat: 'encours',
    objectif: 'Les confirmations partent de PaperAtlas et non d’une adresse de test.',
    livrables: [
      { texte: 'Expéditeur homogène dans toutes les fonctions serveur', fait: true },
      { texte: 'Écran « Expéditeur des e-mails » dans la console', fait: true },
      { texte: 'Confirmations du devis, de la demande B2B et de la candidature écrites en arabe et en anglais', fait: true },
      { texte: 'Bloc de copie unique des cinq valeurs du SMTP, et lien direct vers l’écran Authentication', fait: true },
      { texte: 'Modèles d’authentification relus en arabe sur téléphone, sens de lecture des blocs isolé', fait: true },
      { texte: 'Rappel B2B dans la liste de contrôle, avec son test dédié', fait: true },
      { texte: 'Domaine d’envoi vérifié chez Resend depuis la console, et non plus supposé sur les seuls secrets', fait: true },
      { texte: 'Clé et domaine ajoutés dans Supabase, domaine vérifié chez Resend', fait: false },
    ],
  },
  {
    numero: 6,
    titre: 'Paiement des abonnements',
    etat: 'avenir',
    objectif: 'Encaisser un abonnement sans intervention manuelle.',
    livrables: [
      { texte: 'État des abonnements lu dans la console, non-encaissables signalés', fait: true },
      { texte: 'Filtre par motif et pastille d’encaissement sur la fiche du compte', fait: true },
      { texte: 'Export CSV du tableau, motif filtré dans le nom du fichier', fait: true },
      { texte: 'Date du dernier export affichée en tête, jeton « à régler » sur la fiche', fait: true },
      { texte: 'Mémoire d’export effaçable, jeton « encaissables » sur la fiche', fait: true },
      { texte: 'Compteur de la semaine, tri par montant, demande de correction des dépôts refusés', fait: true },
      { texte: 'Montant total de la file triée, compteur de la semaine sur la fiche, correction en un geste', fait: true },
      { texte: 'Montant emporté par l’export dans l’archive, part encaissable du total, compteur de la semaine cliquable', fait: true },
      { texte: 'Montant restant à régler dans le jeton de total, archive rejouable d’un clic, sept derniers exports rangés', fait: true },
      { texte: 'Historique rejouable ligne par ligne, écart entre l’export et la file du jour', fait: true },
      { texte: 'Écart de lignes depuis l’export, différence ouverte au clic, moyenne des montants emportés', fait: true },
      { texte: 'Extrait des arrivées exporté depuis le bandeau, décomptes mobiles dans l’historique, comparaison de deux exports entre eux', fait: true },
      { texte: 'Jeton des exports qui ont bougé, comparaison exportée en fichier, périmètre du compte relu dans la fiche', fait: true },
      { texte: 'Moyenne de la fiche cliquable, troisième feuille des lignes arrivées, pic de la semaine dans l’historique', fait: true },
      { texte: 'Pic rejouable d’un clic, écart de montant par arrivée, pic du périmètre dans la fiche', fait: true },
      { texte: 'Total des arrivées cliquable, comparaison de périmètre dans la fiche, feuille des lignes parties', fait: true },
      { texte: 'Total des arrivées resserrant la file, montant retiré par les lignes parties, montants mobiles dans l’historique', fait: true },
      { texte: 'Lignes parties resserrant la file, classeur de comparaison du compte, jeton des montants mobiles', fait: true },
      { texte: 'Extrait CSV des lignes parties, liste des parties dans la fiche, exports à sens opposés signalés', fait: true },
      { texte: 'Jeton « sens opposés » dans l’historique, liste des parties en CSV, parties rangées par montant retiré', fait: true },
      { texte: 'Compteur des exports visibles, CSV des sens opposés, lignes parties pesant plus de la moitié du retrait', fait: true },
      { texte: 'Gomme des trois jetons de l’historique, jeton des lignes majoritaires, marque de la ligne majoritaire au classeur', fait: true },
      { texte: 'Export de l’historique filtré, repère des lignes majoritaires dans la liste, ligne de synthèse ouvrant le CSV réduit', fait: true },
      { texte: 'Jeton des montants en baisse, second jeton des lignes partagées, coût total de l’historique filtré', fait: true },
      { texte: 'Rôle admin en base, coût total dans le CSV filtré, part du retrait partagé, baisse cumulée', fait: true },
      { texte: 'Baisse cumulée dans le CSV filtré, pourcentage partagé cliquable, gestion des rôles dans la console', fait: true },
      { texte: 'Repère administrateur dans la liste des clients, baisse cumulée cliquable, date du dernier export retenu au CSV', fait: true },
      { texte: 'Pastille « À relire » cliquable vers la ligne de rôle, synthèse des promotions anciennes au classeur, date de promotion dans la feuille « Comptes »', fait: true },
      { texte: 'Jeton des administrateurs dans la table des comptes, colonne « Rôle » au classeur, compteur en tête', fait: true },
      { texte: 'Offre branchée au prestataire de paiement', fait: false },
      { texte: 'Facture, relance d’échéance, résiliation', fait: false },
    ],
  },
  {
    numero: 7,
    titre: 'Contenus définitifs, mentions légales, SEO',
    etat: 'encours',
    objectif: 'Publier sur le domaine avec des textes relus.',
    livrables: [
      { texte: 'Mentions légales et politique de confidentialité', fait: true },
      { texte: 'Liens de signalement sur les fiches d’annonce, d’offre, d’atelier et sous chaque dépôt du compte', fait: true },
      { texte: 'Demande de correction ouvrant le formulaire d’édition d’un dépôt refusé, motif en tête', fait: true },
      { texte: 'Relecture arabe et anglais', fait: false },
      { texte: 'Données structurées, sitemap, redirections', fait: false },
    ],
  },
  {
    numero: 8,
    titre: 'Publication',
    etat: 'avenir',
    objectif: 'Mise en ligne et suivi.',
    livrables: [
      { texte: 'Domaine et publication', fait: false },
      { texte: 'Mesure d’audience, sauvegardes, reprise après incident', fait: false },
    ],
  },
];

/** Les points de blocage nommés par le plan, avec leur état réel. */
export const SUIVI_BLOCAGES: SuiviBlocage[] = [
  {
    titre: 'Domaine d’envoi',
    texte:
      'Resend n’a encore ni clé ni domaine vérifié côté Supabase : les confirmations restent bloquées. La console lit désormais l’état réel du domaine chez Resend (« Vérifier chez Resend »), et la procédure est décrite pas à pas au §10 du plan.',
    etat: 'attente',
  },
  {
    titre: 'Paiement',
    texte:
      'Aucun prestataire branché : les abonnements sont suivis, pas encore encaissés. L’onglet « Paiements » dit désormais lesquels sont prêts et ce qui manque aux autres.',
    etat: 'ouvert',
  },
  {
    titre: 'Textes définitifs',
    texte:
      'Les mentions légales et la politique de confidentialité sont écrites ; les versions arabe et anglaise attendent encore une relecture humaine, page par page (§11 du plan).',
    etat: 'leve',
  },
];