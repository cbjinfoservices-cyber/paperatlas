import {
  RELECTURE_LIGNES,
  RELECTURE_TOTAL,
  compteRelecture,
  estRelue,
  readRelecture,
} from './adminRelectureCore';
import {
  CHANTIERS_CLE,
  SUIVI_BLOCAGES,
  SUIVI_CHANTIERS,
  SUIVI_DATE,
  SUIVI_MODULE_RESTE,
  SUIVI_MODULES,
  SUIVI_PHASES,
  SUIVI_RESTE,
  SUIVI_VERSION,
  SEUIL_CAP,
  avancementTotal,
  gainChantierA100,
  modulesAvantCap,
  modulesOuverts,
  pointsManquants,
  pointsManquantsChantier,
  pointsManquantsTotal,
  pointsModule,
  pointsPourFranchir,
  chantierDePorte,
} from './adminSuiviPlan';
import type { SuiviChantier } from './adminSuiviPlan';
import { jour } from './adminTypes';
import {
  readCapAtteint,
  readModulesAtteints,
  readModulesAtteintsDates,
  readTelechargements,
} from './adminSuiviMemory';
import { preuveAgeJours, readPreuve } from './adminMailMemory';
import {
  readEcransAppuyes,
  readEcransRetiresHist,
  readEcransRetiresNom,
  readEcransRetours,
  readEcransRetoursHist,
  readEcransVides,
  readOublisPortes,
} from './adminDoorMemory';
import type { EcranRetour, OubliPorte, PortesOublis } from './adminDoorMemory';
import type { Lang } from '@/i18n/dict';

/**
 * Le fichier de pilotage, mis à plat en texte.
 *
 * L'onglet « Suivi » le lit à l'écran ; ce module en fait un document qu'on
 * peut archiver à chaque version. Il reprend les mêmes chiffres, dans le même
 * ordre — le pourcentage y est recalculé, jamais recopié.
 */

const ETAT_PHASE = { fait: 'terminée', encours: 'en cours', avenir: 'à venir' } as const;
const ETAT_BLOCAGE = { ouvert: 'ouvert', attente: 'action extérieure', leve: 'levé' } as const;

/** Un libellé complété de points, pour que les colonnes se lisent d'aplomb. */
function colonne(texte: string, largeur: number): string {
  if (texte.length >= largeur) return `${texte} `;
  return `${texte}${' '.repeat(largeur - texte.length)}`;
}

/** Une ligne de séparation, à la largeur du document. */
const REGLE = `\n${'-'.repeat(72)}\n`;

/**
 * Le plan entier, ou un seul chantier quand son nom est donné.
 *
 * L'archive complète reste le document de travail ; l'archive d'un chantier
 * ne garde que ce qui le concerne — ses modules, ses points, ses livrables
 * ouverts —, pour se joindre à un point d'étape sans emporter le reste.
 */
export function planEnTexte(chantier: string | null = null, lang: Lang = 'fr'): string {
  const cible = chantier ? SUIVI_CHANTIERS.find((item) => item.nom === chantier) : null;
  if (cible) return planChantierEnTexte(cible, lang);

  const total = avancementTotal(SUIVI_MODULES);
  const points = SUIVI_MODULES.reduce((somme, module) => somme + pointsModule(module), 0);
  const acheves = SUIVI_MODULES.filter((module) => module.avancement >= 100).length;
  const faits = SUIVI_RESTE.filter((item) => item.fait).length;
  /* La relecture vit sur l'appareil, pas en base : la ligne dit donc ce que
     ce poste a coché au moment du téléchargement, et d'où elle le lit. */
  const relectureEtat = readRelecture();
  const relecture = compteRelecture(relectureEtat);

  const lignes: string[] = [];

  lignes.push('PaperAtlas — Plan et suivi du projet');
  lignes.push(`Mis à jour le ${SUIVI_DATE} · version ${SUIVI_VERSION}`);
  lignes.push(`Fichier généré le ${new Date().toISOString()}`);
  lignes.push('');
  lignes.push(`Avancement officiel : ${total} % (${points.toFixed(2)} points sur 100)`);
  lignes.push(`Modules achevés : ${acheves} / ${SUIVI_MODULES.length}`);
  lignes.push(`Chantiers tenus : ${faits} / ${SUIVI_RESTE.length}`);
  lignes.push(
    `Relecture AR / EN : ${relecture.ar} / ${RELECTURE_TOTAL} pages cochées en arabe · ${relecture.en} / ${RELECTURE_TOTAL} en anglais · ${relecture.deux} relue(s) des deux côtés (carnet de cet appareil, §11)`,
  );
  lignes.push(
    `Part restante : ${100 - total} % — ${pointsManquantsTotal(SUIVI_MODULES).toFixed(2)} points, en quatre chantiers`,
  );

  lignes.push(REGLE);
  lignes.push('1. Le poids de chaque module');
  lignes.push('');
  lignes.push(`${colonne('Module', 48)}${colonne('Poids', 7)}${colonne('Avanc.', 9)}Points`);
  SUIVI_MODULES.forEach((module) => {
    lignes.push(
      `${colonne(module.nom, 48)}${colonne(String(module.poids), 7)}${colonne(
        `${module.avancement} %`,
        9,
      )}${pointsModule(module).toFixed(2)}`,
    );
  });
  lignes.push(
    `${colonne('Total pondéré', 48)}${colonne('100', 7)}${colonne(`${total} %`, 9)}${points.toFixed(2)}`,
  );

  lignes.push(REGLE);
  lignes.push('2. Les points manquants, chantier par chantier');
  lignes.push('');
  SUIVI_CHANTIERS.forEach((chantier) => {
    lignes.push(`${colonne(chantier.nom, 52)}${pointsManquantsChantier(chantier).toFixed(2)}`);
    lignes.push(`  ${chantier.reste}`);
  });
  lignes.push(colonne('Total manquant', 52) + pointsManquantsTotal(SUIVI_MODULES).toFixed(2));

  /* La même ligne de seuil que le classeur des points manquants : ce qui reste
     à franchir pour atteindre le cap, puis ce que chaque chantier apporte s'il
     est mené à 100 %. Les gains se lisent sur les mêmes poids que les lignes
     du dessus, si bien que l'archive ne peut pas les contredire. */
  const resteSeuil = pointsPourFranchir(SEUIL_CAP, SUIVI_MODULES);
  /* Le jour du franchissement, quand cet appareil s'en souvient : la pièce
     jointe se date d'elle-même, sans qu'aucune date soit recopiée à la main.
     La gomme du repère le rend à son tour — l'archive dit alors simplement
     que le cap est franchi, sans jour. */
  const capJour = readCapAtteint();
  const gainsChantiers = SUIVI_CHANTIERS.map(
    (chantier) => `${chantier.nom} +${gainChantierA100(chantier, SUIVI_MODULES).toFixed(2)}`,
  ).join(' · ');
  /* Les modules qui restent avant le cap, lus sur la même liste que le bloc de
     l'onglet : le compte se pose à côté de la date du franchissement, et le
     premier de la liste — le plus lourd — nomme par où le seuil commence. La
     pièce jointe dit donc aussi bien combien de modules il reste que celui
     qui pèse le plus, sans qu'aucun chiffre soit recopié à la main. */
  const modulesSeuil = modulesAvantCap(SEUIL_CAP, SUIVI_MODULES);
  const plusLourdSeuil = modulesSeuil.length > 0 ? modulesSeuil[0].nom : '';
  /* Le jour de la dernière archive partie de cet appareil, lu sur la même
     mémoire que le compteur du rappel : la plus récente des dates retenues,
     qu'il s'agisse du plan entier ou d'un seul chantier. La ligne de seuil
     se date ainsi d'elle-même, sans qu'aucune date soit recopiée à la main. */
  const archivesDates = Object.values(readTelechargements()).filter(Boolean);
  const derniereArchive = archivesDates.length > 0
    ? archivesDates.reduce((recent, date) =>
        new Date(date).getTime() > new Date(recent).getTime() ? date : recent,
      )
    : null;
  const derniereArchivePhrase = derniereArchive
    ? ` · dernière archive partie le ${jour(derniereArchive, lang)}`
    : ' · aucune archive partie depuis cet appareil';
  /* Les modules du tableau déjà descendus depuis cet appareil, comptés sur la
     même mémoire que le compteur du cap et sur la même liste que le tableau
     des poids : un nom que le plan ne porte plus ne compte pas, si bien que
     la ligne ne peut pas annoncer plus de modules qu'il n'en existe. */
  const modulesAtteintsTotal = readModulesAtteints().filter((nom) =>
    SUIVI_MODULES.some((module) => module.nom === nom),
  ).length;
  const modulesAtteintsPhrase =
    modulesAtteintsTotal > 0
      ? ` · ${modulesAtteintsTotal} module(s) descendu(s) depuis cet appareil`
      : ' · aucun module descendu depuis cet appareil';
  /* Le jour de la descente la plus récente, lu sur la mémoire nom par nom —
     la plus récente des dates retenues, jamais une date écrite à côté. Un
     module que le plan ne porte plus ne la date pas : la pièce ne peut pas
     annoncer un parcours qui n'existe pas. */
  const descentesDates = Object.entries(readModulesAtteintsDates())
    .filter(([nom]) => SUIVI_MODULES.some((module) => module.nom === nom))
    .map(([, date]) => date)
    .filter(Boolean);
  const derniereDescente = descentesDates.length > 0
    ? descentesDates.reduce((recent, date) =>
        new Date(date).getTime() > new Date(recent).getTime() ? date : recent,
      )
    : null;
  const derniereDescentePhrase = derniereDescente
    ? ` · dernière descente le ${jour(derniereDescente, lang)}`
    : ' · aucune descente datée';
  lignes.push(
    `Seuil ${SEUIL_CAP} % : ${
      resteSeuil === 0
        ? `cap déjà franchi${capJour ? ` le ${jour(capJour, lang)}` : ''} · ${modulesSeuil.length} module(s) ne restent avant lui`
        : `${resteSeuil.toFixed(2)} point(s) à franchir pour atteindre ${SEUIL_CAP} % · ${modulesSeuil.length} module(s) encore à faire avancer, dont « ${plusLourdSeuil} » en tête`
    }${derniereArchivePhrase}${modulesAtteintsPhrase}${derniereDescentePhrase} · ce que chaque chantier apporte mené à 100 % : ${gainsChantiers}`,
  );

  lignes.push('');
  lignes.push('Le détail, module par module :');
  modulesOuverts(SUIVI_MODULES).forEach((module) => {
    lignes.push(
      `  ${colonne(module.nom, 48)}${colonne(`${100 - module.avancement} %`, 8)}−${pointsManquants(
        module,
      ).toFixed(2)}`,
    );
    const reste = SUIVI_MODULE_RESTE[module.nom];
    if (reste) lignes.push(`    ${reste}`);
  });

  lignes.push(REGLE);
  lignes.push('3. Ce qui reste à faire');
  lignes.push('');
  SUIVI_RESTE.forEach((item) => {
    lignes.push(`${item.fait ? '[x]' : '[ ]'} ${item.texte}`);
  });

  /* L'expéditeur, posé à côté de ses deux points ouverts : l'état de la clé,
     celui du domaine, puis la date de la dernière preuve avec son âge. Une
     preuve datée se juge ; une preuve nue ne dit pas si elle tient encore. */
  const expediteur = etatExpediteur();
  lignes.push('');
  lignes.push('Expéditeur des e-mails');
  lignes.push(
    `  Clé      ${colonne('BREVO_API_KEY', 24)}: ${expediteur.cle ? 'posée' : 'à poser'}`,
  );
  lignes.push(
    `  Domaine  ${colonne('MAIL_FROM_DOMAIN', 24)}: ${
      expediteur.domaine ? 'vérifié et nommé' : 'à vérifier puis à nommer'
    }`,
  );
  lignes.push(`  Preuve   ${lignePreuve(lang)}`);

  /* Le détail page par page, sous la ligne de synthèse : l'archive dit quelles
     pages sont closes dans quelle langue, et ce qu'il faut y surveiller quand
     on les rouvre. Lu sur le même carnet que le panneau de la console. */
  lignes.push(REGLE);
  lignes.push('4. La relecture, page par page');
  lignes.push('');
  lignes.push(
    `Total : ${relecture.ar} / ${RELECTURE_TOTAL} en arabe · ${relecture.en} / ${RELECTURE_TOTAL} en anglais · ${relecture.deux} page(s) close(s) des deux côtés`,
  );
  lignes.push(
    'Les deux cases se lisent [AR] [EN] : cochées sur ce poste, dans le carnet de cet appareil, jamais en base.',
  );
  lignes.push('');
  RELECTURE_LIGNES.forEach((ligne) => {
    const rang = String(ligne.n).padStart(2, '0');
    const ar = estRelue(relectureEtat, 'ar', ligne.n) ? 'x' : ' ';
    const en = estRelue(relectureEtat, 'en', ligne.n) ? 'x' : ' ';
    lignes.push(`[${ar}] [${en}]  ${rang} · ${ligne.page}  —  ${ligne.path}`);
    lignes.push(`            textes : ${ligne.textes}`);
    lignes.push(`            à surveiller : ${ligne.vigilance}`);
  });

  lignes.push(REGLE);
  lignes.push('5. Le plan de développement');
  SUIVI_PHASES.forEach((phase) => {
    lignes.push('');
    lignes.push(
      `Phase ${phase.numero} — ${phase.titre} (${ETAT_PHASE[phase.etat]})`,
    );
    lignes.push(`  Objectif : ${phase.objectif}`);
    phase.livrables.forEach((livrable) => {
      lignes.push(`  ${livrable.fait ? '[x]' : '[ ]'} ${livrable.texte}`);
    });
  });

  lignes.push(REGLE);
  lignes.push('6. Points de blocage');
  lignes.push('');
  SUIVI_BLOCAGES.forEach((blocage) => {
    lignes.push(`- ${blocage.titre} [${ETAT_BLOCAGE[blocage.etat]}]`);
    lignes.push(`  ${blocage.texte}`);
  });

  lignes.push('');
  lignes.push('—');
  lignes.push(
    'Le contenu du plan reste en français : c’est la langue du document de travail.',
  );

  return `${lignes.join('\n')}\n`;
}

/**
 * L'archive d'un seul chantier : ses points, ses modules, ses livrables
 * encore ouverts, et l'expéditeur quand c'est lui qui est en cause.
 *
 * Rien du reste du plan n'y entre : une pièce jointe de point d'étape ne
 * porte pas les trente écrans de relecture ni les huit phases.
 */
function planChantierEnTexte(chantier: SuiviChantier, lang: Lang): string {
  const manquants = pointsManquantsTotal(SUIVI_MODULES);
  const pts = pointsManquantsChantier(chantier);
  const part = manquants > 0 ? Math.round((pts / manquants) * 100) : 0;
  const modules = chantier.modules.flatMap((nom) =>
    SUIVI_MODULES.filter((module) => module.nom === nom),
  );
  const lignes: string[] = [];

  lignes.push('PaperAtlas — Plan et suivi du projet');
  lignes.push(`Chantier : ${chantier.nom}`);
  lignes.push(`Mis à jour le ${SUIVI_DATE} · version ${SUIVI_VERSION}`);
  lignes.push(`Fichier généré le ${new Date().toISOString()}`);

  lignes.push(REGLE);
  lignes.push('1. Le poids du chantier dans ce qui reste');
  lignes.push('');
  lignes.push(colonne('Points manquants du chantier', 48) + pts.toFixed(2));
  lignes.push(colonne('Part restante du projet', 48) + manquants.toFixed(2));
  lignes.push(colonne('Part de ce chantier', 48) + `${part} %`);
  lignes.push('');
  lignes.push(`Ce qu’il demande encore : ${chantier.reste}`);

  lignes.push(REGLE);
  lignes.push('2. Les modules du chantier');
  lignes.push('');
  lignes.push(`${colonne('Module', 48)}${colonne('Poids', 7)}${colonne('Avanc.', 9)}Manquants`);
  modules.forEach((module) => {
    lignes.push(
      `${colonne(module.nom, 48)}${colonne(String(module.poids), 7)}${colonne(
        `${module.avancement} %`,
        9,
      )}${pointsManquants(module).toFixed(2)}`,
    );
  });
  lignes.push(`${colonne('Total du chantier', 48)}${colonne('', 7)}${colonne('', 9)}${pts.toFixed(2)}`);

  lignes.push(REGLE);
  lignes.push('3. Ce que le chantier laisse encore ouvert');
  lignes.push('');
  let ouverts = 0;
  chantier.phases.forEach((numero) => {
    const phase = SUIVI_PHASES.find((item) => item.numero === numero);
    if (!phase) return;
    lignes.push(`Phase ${phase.numero} — ${phase.titre} (${ETAT_PHASE[phase.etat]})`);
    phase.livrables.forEach((livrable) => {
      if (livrable.fait) return;
      ouverts += 1;
      lignes.push(`  [ ] ${livrable.texte}`);
    });
    lignes.push('');
  });
  if (ouverts === 0) {
    lignes.push('  Tous les livrables de ses phases sont faits.');
    lignes.push('');
  }

  /* L'expéditeur n'accompagne que le chantier qui le porte : sa clé, son
     domaine, puis la date de la dernière preuve, écrite dans la langue du
     lecteur. */
  if (modules.some((module) => module.nom.includes('E-mails'))) {
    const expediteur = etatExpediteur();
    lignes.push(REGLE);
    lignes.push('Expéditeur des e-mails');
    lignes.push(
      `  Clé      ${colonne('BREVO_API_KEY', 24)}: ${expediteur.cle ? 'posée' : 'à poser'}`,
    );
    lignes.push(
      `  Domaine  ${colonne('MAIL_FROM_DOMAIN', 24)}: ${
        expediteur.domaine ? 'vérifié et nommé' : 'à vérifier puis à nommer'
      }`,
    );
    lignes.push(`  Preuve   ${lignePreuve(lang)}`);
    /* Par quoi continuer, nommé d'un mot : les trois états se lisent chacun de
       leur côté, cette ligne dit lequel tient le geste suivant — la même phrase
       que l'archive d'un chantier, pour que les deux pièces se lisent pareil. */
    lignes.push(`  Prochaine étape : ${prochaineEtapeExpediteur(expediteur)}`);
  }

  lignes.push(REGLE);
  lignes.push('Le reste du plan n’entre pas dans cette archive : elle ne garde que ce chantier.');

  return `${lignes.join('\n')}\n`;
}

/** Le nom du fichier porte la version : deux archives ne se confondent pas. */
export const NOM_FICHIER_PLAN = `paperatlas-plan-v${SUIVI_VERSION}.txt`;

/** L'archive d'un chantier porte sa clef courte, pour se reconnaître : deux
 *  pièces jointes du même jour ne se confondent pas. */
export function nomFichierPlan(chantier: string | null = null): string {
  if (!chantier) return NOM_FICHIER_PLAN;
  const cle = Object.keys(CHANTIERS_CLE).find((candidate) => CHANTIERS_CLE[candidate] === chantier);
  return cle ? `paperatlas-plan-v${SUIVI_VERSION}-${cle}.txt` : NOM_FICHIER_PLAN;
}

/** Le geste du bouton : un fichier texte, téléchargé sans quitter la console. */
export function telechargerPlan(chantier: string | null = null, lang: Lang = 'fr'): void {
  const blob = new Blob([planEnTexte(chantier, lang)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichierPlan(chantier);
  lien.rel = 'noopener';
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ---- le détail des points manquants, seul, en CSV ---- */

/** Une cellule de CSV : toujours citée, guillemets intérieurs doublés. */
function cellule(valeur: string | number): string {
  return `"${String(valeur).replace(/"/g, '""')}"`;
}

/** Un nombre à la française : virgule décimale, pour un tableur francophone. */
function nombre(valeur: number, decimales = 0): string {
  return valeur.toFixed(decimales).replace('.', ',');
}

/**
 * Le milieu d'un lot de nombres, une fois rangé.
 *
 * Un lot impair donne la valeur du milieu ; un lot pair la moyenne des deux
 * du milieu. Un lot vide ne se divise pas et rend zéro, plutôt qu'un chiffre
 * inventé.
 */
function mediane(valeurs: number[]): number {
  if (valeurs.length === 0) return 0;
  const tri = [...valeurs].sort((a, b) => a - b);
  const milieu = Math.floor(tri.length / 2);
  if (tri.length % 2 === 1) return tri[milieu];
  return (tri[milieu - 1] + tri[milieu]) / 2;
}

/** Le mois d'un geste, dit dans la langue du lecteur — « nov. 2026 ».
 *
 * La ligne du CSV range les retours sous leur mois : les vagues du geste se
 * lisent d'un coup d'œil, d'un mois à l'autre.
 */
function moisDe(date: string, lang: Lang = 'fr'): string {
  const geste = new Date(date);
  if (Number.isNaN(geste.getTime())) return '';
  const locale = lang === 'ar' ? 'ar' : lang === 'en' ? 'en-GB' : 'fr-FR';
  try {
    return geste.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
  } catch {
    return `${geste.getFullYear()}-${String(geste.getMonth() + 1).padStart(2, '0')}`;
  }
}

/** Le jour d'une journée de la semaine, dit dans la langue du lecteur —
 *  « lun. 09 nov. » —, pour la ligne du CSV qui compte les départs un à un.
 *  Les heures n'y entrent pas : deux départs du même jour y tombent ensemble. */
function jourSemaineDe(date: string, lang: Lang = 'fr'): string {
  const geste = new Date(date);
  if (Number.isNaN(geste.getTime())) return '';
  const locale = lang === 'ar' ? 'ar' : lang === 'en' ? 'en-GB' : 'fr-FR';
  try {
    return geste.toLocaleDateString(locale, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return `${geste.getFullYear()}-${String(geste.getMonth() + 1).padStart(2, '0')}-${String(
      geste.getDate(),
    ).padStart(2, '0')}`;
  }
}

/** Le nom du fichier porte la version, comme l'archive du plan. */
export const NOM_FICHIER_MANQUE = `paperatlas-points-manquants-v${SUIVI_VERSION}.csv`;

/**
 * Le seul détail des points manquants, mis à plat pour un tableur.
 *
 * Rien d'autre n'y entre : ni les modules achevés, ni les phases, ni les
 * blocages — seulement ce que le projet laisse à reprendre, module par module,
 * du plus lourd reste au plus léger, avec la phrase qui dit ce qui bloque. Le
 * fichier se joint tel quel à un point d'étape.
 */
export function pointsManquantsCsv(): string {
  const ouverts = modulesOuverts(SUIVI_MODULES);
  const lignes: string[] = [];

  lignes.push(
    [
      'Module',
      'Poids',
      'Avancement (%)',
      'Reste (%)',
      'Points manquants',
      'Ce qu’il reste à faire',
    ]
      .map(cellule)
      .join(';'),
  );

  ouverts.forEach((module) => {
    lignes.push(
      [
        module.nom,
        nombre(module.poids),
        nombre(module.avancement),
        nombre(100 - module.avancement),
        nombre(pointsManquants(module), 2),
        SUIVI_MODULE_RESTE[module.nom] || '',
      ]
        .map(cellule)
        .join(';'),
    );
  });

  lignes.push(
    [
      'Total manquant',
      '',
      '',
      '',
      nombre(pointsManquantsTotal(SUIVI_MODULES), 2),
      `${ouverts.length} module(s) encore ouvert(s) · version ${SUIVI_VERSION}`,
    ]
      .map(cellule)
      .join(';'),
  );

  /* La ligne de seuil, posée sous la synthèse : elle dit ce qui reste à
     franchir pour atteindre le cap, puis ce que chaque chantier apporte s'il
     est mené à 100 %. Les gains se lisent sur les mêmes poids que les lignes
     du dessus, si bien que la ligne ne peut pas les contredire. */
  const resteSeuil = pointsPourFranchir(SEUIL_CAP, SUIVI_MODULES);
  const gainsChantiers = SUIVI_CHANTIERS.map(
    (chantier) => `${chantier.nom} +${nombre(gainChantierA100(chantier, SUIVI_MODULES), 2)}`,
  ).join(' · ');
  /* La même lecture que l'archive du plan : le compte des modules encore
     devant le cap, et le nom du plus lourd d'entre eux — les deux feuilles
     disent la même chose, sur la même liste. */
  const modulesSeuilCsv = modulesAvantCap(SEUIL_CAP, SUIVI_MODULES);
  const plusLourdSeuilCsv = modulesSeuilCsv.length > 0 ? modulesSeuilCsv[0].nom : '';
  /* Le compte des modules descendus depuis cet appareil, lu sur la même
     mémoire que l'archive du plan : les deux pièces disent le même chiffre. */
  const modulesAtteintsCsv = readModulesAtteints().filter((nom) =>
    SUIVI_MODULES.some((module) => module.nom === nom),
  ).length;
  const modulesAtteintsCsvPhrase =
    modulesAtteintsCsv > 0
      ? ` · ${modulesAtteintsCsv} module(s) descendu(s) depuis cet appareil`
      : ' · aucun module descendu depuis cet appareil';
  /* Le jour de la descente la plus récente, lu sur la même mémoire nom par
     nom que l'archive du plan : les deux pièces se datent pareil. */
  const descentesDatesCsv = Object.entries(readModulesAtteintsDates())
    .filter(([nom]) => SUIVI_MODULES.some((module) => module.nom === nom))
    .map(([, date]) => date)
    .filter(Boolean);
  const derniereDescenteCsv = descentesDatesCsv.length > 0
    ? descentesDatesCsv.reduce((recent, date) =>
        new Date(date).getTime() > new Date(recent).getTime() ? date : recent,
      )
    : null;
  const derniereDescenteCsvPhrase = derniereDescenteCsv
    ? ` · dernière descente le ${jour(derniereDescenteCsv, 'fr')}`
    : ' · aucune descente datée';
  lignes.push(
    [
      `Seuil ${SEUIL_CAP} %`,
      '',
      '',
      '',
      nombre(resteSeuil, 2),
      resteSeuil === 0
        ? `cap de ${SEUIL_CAP} % déjà franchi · ${modulesSeuilCsv.length} module(s) ne restent avant lui${modulesAtteintsCsvPhrase}${derniereDescenteCsvPhrase} · ce que chaque chantier apporte mené à 100 % : ${gainsChantiers}`
        : `${nombre(resteSeuil, 2)} point(s) à franchir pour atteindre ${SEUIL_CAP} % · ${modulesSeuilCsv.length} module(s) encore à faire avancer, dont « ${plusLourdSeuilCsv} » en tête${modulesAtteintsCsvPhrase}${derniereDescenteCsvPhrase} · ce que chaque chantier apporte mené à 100 % : ${gainsChantiers}`,
    ]
      .map(cellule)
      .join(';'),
  );

  /* Un BOM, pour que le tableur lise les accents dès l'ouverture. */
  return `\uFEFF${lignes.join('\r\n')}\r\n`;
}

/** Le geste du bouton posé dans le bloc des points manquants. */
export function telechargerPointsManquants(): void {
  const blob = new Blob([pointsManquantsCsv()], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = NOM_FICHIER_MANQUE;
  lien.rel = 'noopener';
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Le nom du fichier porte la version, comme les autres pièces du suivi. */
export const NOM_FICHIER_DESCENDUS = `paperatlas-modules-descendus-v${SUIVI_VERSION}.csv`;

/**
 * Les modules descendus depuis cet appareil, un par ligne avec leur jour.
 *
 * Le fichier se lit sur la même mémoire nom par nom que le compteur du cap et
 * que l'épingle des lignes du tableau : aucun jour n'est recopié à côté, et un
 * module que le plan ne porte plus n'y entre pas — la pièce ne peut pas
 * annoncer une descente vers une ligne qui n'existe pas. Les plus récentes
 * ouvrent la marche ; un module atteint avant que le registre ne note les
 * jours garde sa ligne et le dit calmement.
 */
export function descendusCsv(lang: Lang = 'fr'): string {
  const dates = readModulesAtteintsDates();
  const atteints = readModulesAtteints().filter((nom) =>
    SUIVI_MODULES.some((module) => module.nom === nom),
  );
  const temps = (nom: string) => {
    const date = dates[nom];
    if (!date) return 0;
    const t = new Date(date).getTime();
    return Number.isNaN(t) ? 0 : t;
  };
  const tries = [...atteints].sort(
    (a, b) => temps(b) - temps(a) || a.localeCompare(b, 'fr', { sensitivity: 'base' }),
  );

  const lignes: string[] = [];
  lignes.push(['Module', 'Jour de la descente'].map(cellule).join(';'));
  tries.forEach((nom) => {
    lignes.push(
      [nom, dates[nom] ? jour(dates[nom], lang) : 'jour non daté']
        .map(cellule)
        .join(';'),
    );
  });
  lignes.push(
    [
      'Total',
      `${tries.length} module(s) descendu(s) depuis cet appareil · version ${SUIVI_VERSION}`,
    ]
      .map(cellule)
      .join(';'),
  );

  /* Un BOM, pour que le tableur lise les accents dès l'ouverture. */
  return `\uFEFF${lignes.join('\r\n')}\r\n`;
}

/** Le geste du bouton posé dans le bloc des points manquants. */
export function telechargerDescendus(lang: Lang = 'fr'): void {
  const blob = new Blob([descendusCsv(lang)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = NOM_FICHIER_DESCENDUS;
  lien.rel = 'noopener';
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Le nom du fichier porte la version, comme les autres pièces du suivi. */
export const NOM_FICHIER_OUBLIS = `paperatlas-visites-rendues-v${SUIVI_VERSION}.csv`;

/**
 * Les deux bouts du carnet : le jour du plus ancien oubli et celui du plus
 * récent, lus sur le journal — jamais sur le seul dernier geste. Le survol
 * du bouton les annonce avant le téléchargement, pour que le fichier ne
 * parte pas sans que l'on sache quelle période il couvre.
 */
export function bornesOublis(
  carnet: PortesOublis = readOublisPortes(),
): { ancien: string; recent: string } | null {
  const dates = carnet.journal
    .map((geste) => geste.date)
    .filter((date) => !Number.isNaN(new Date(date).getTime()));
  if (dates.length === 0) {
    if (carnet.dernier && !Number.isNaN(new Date(carnet.dernier).getTime())) {
      return { ancien: carnet.dernier, recent: carnet.dernier };
    }
    return null;
  }
  const tris = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  return { ancien: tris[0], recent: tris[tris.length - 1] };
}

/**
 * Les visites rendues rangées par chantier du plan, la plus fournie en tête.
 *
 * Le nom de chaque chantier est relu sur la table des portes, à partir de la
 * seule adresse : ajouter demain une porte la fera entrer dans le bon chantier
 * sans retoucher ni l'écran ni le fichier. Une porte qu'aucun chantier ne
 * revendique rend le nom vide, plutôt que de se voir attribuer un nom inventé.
 * Le jour du dernier oubli de chaque chantier est lu sur les mêmes gestes, et
 * le premier aussi : l'écart des deux dit en combien de jours les oublis se
 * sont concentrés là.
 */
export type OublisChantier = {
  nom: string;
  n: number;
  premier: string;
  dernier: string;
  /** Les lignes du carnet que ce jeton-là retirerait de la vue : tout ce qui
   *  n'est pas de ce chantier, compté sur le carnet entier. */
  masques: number;
  /** Le jour du premier oubli parmi celles qu'il retire, ou null quand il ne
   *  retire rien — le carnet ne portant que ses propres gestes. */
  premierMasque: string | null;
};

export function oublisParChantier(
  carnet: PortesOublis = readOublisPortes(),
): OublisChantier[] {
  const compte = new Map<string, { n: number; premier: string; dernier: string }>();
  carnet.journal.forEach((geste) => {
    const nom = chantierDePorte(geste.lien) ?? '';
    const jourDuGeste = new Date(geste.date).getTime();
    const courant = compte.get(nom);
    if (!courant) {
      compte.set(nom, { n: 1, premier: geste.date, dernier: geste.date });
      return;
    }
    courant.n += 1;
    if (jourDuGeste < new Date(courant.premier).getTime()) courant.premier = geste.date;
    if (jourDuGeste > new Date(courant.dernier).getTime()) courant.dernier = geste.date;
  });
  const total = carnet.journal.length;
  return [...compte.entries()]
    .map(([nom, valeur]) => {
      /* Les lignes qu'un jeton laisserait hors de la vue, et le premier geste
         de ce lot : la même mémoire, lue par l'autre bout. */
      const restants = carnet.journal.filter(
        (geste) => (chantierDePorte(geste.lien) ?? '') !== nom,
      );
      const plusAncien = restants.reduce<number>((min, geste) => {
        const t = new Date(geste.date).getTime();
        if (Number.isNaN(t)) return min;
        return min === 0 || t < min ? t : min;
      }, 0);
      return {
        nom,
        n: valeur.n,
        premier: valeur.premier,
        dernier: valeur.dernier,
        masques: total - valeur.n,
        premierMasque: plusAncien > 0 ? new Date(plusAncien).toISOString() : null,
      };
    })
    .sort((a, b) => b.n - a.n);
}

/**
 * Les gestes du carnet rangés sous le nom de leur écran, le plus fourni en
 * tête.
 *
 * Chaque écran garde son compte et le jour de son oubli le plus récent : le
 * tri « Par écran » de l'écran dit ainsi, au survol, ce que chaque groupe
 * tient et jusqu'à quand il remonte, sans ouvrir le carnet ligne à ligne. Le
 * nom de l'écran est celui que la porte a laissé au carnet ; une porte sans
 * écran nommé garde son adresse plutôt qu'un nom inventé.
 */
export type OublisEcran = { ecran: string; n: number; premier: string; dernier: string };

export function oublisParEcran(
  carnet: PortesOublis = readOublisPortes(),
): OublisEcran[] {
  const compte = new Map<string, { n: number; premier: string; dernier: string }>();
  carnet.journal.forEach((geste) => {
    const nom = geste.ecran || geste.lien;
    const jourDuGeste = new Date(geste.date).getTime();
    const courant = compte.get(nom);
    if (!courant) {
      compte.set(nom, { n: 1, premier: geste.date, dernier: geste.date });
      return;
    }
    courant.n += 1;
    if (jourDuGeste < new Date(courant.premier).getTime()) courant.premier = geste.date;
    if (jourDuGeste > new Date(courant.dernier).getTime()) courant.dernier = geste.date;
  });
  return [...compte.entries()]
    .map(([ecran, valeur]) => ({
      ecran,
      n: valeur.n,
      premier: valeur.premier,
      dernier: valeur.dernier,
    }))
    .sort(
      (a, b) =>
        b.n - a.n ||
        new Date(b.dernier).getTime() - new Date(a.dernier).getTime() ||
        a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' }),
    );
}

/**
 * Les écrans du carnet dans l’ordre du dépli, tant que l’intitulé n’a pas été
 * appuyé une seconde fois : chacun à la place de son oubli le plus frais.
 *
 * Le tri « Par écran » à l’écran range ainsi, et le rangement du plus fourni
 * vient de la liste déjà comptée. Le CSV compare les deux places sans rien
 * recopier d’un côté ni de l’autre.
 */
export function ordreEcransCarnet(
  carnet: PortesOublis,
  parEcran: OublisEcran[],
): OublisEcran[] {
  const vus = new Set<string>();
  const lignes: OublisEcran[] = [];
  [...carnet.journal].reverse().forEach((geste) => {
    const nom = geste.ecran || geste.lien;
    if (vus.has(nom)) return;
    const ligne = parEcran.find((item) => item.ecran === nom);
    if (!ligne) return;
    vus.add(nom);
    lignes.push(ligne);
  });
  /* Un écran que le journal ne montre plus garde sa place en fin de liste,
     plutôt que de disparaître du compte. */
  parEcran.forEach((ligne) => {
    if (!vus.has(ligne.ecran)) lignes.push(ligne);
  });
  return lignes;
}

/**
 * Les visites rendues, une ligne par porte oubliée.
 *
 * Chaque ligne dit l'écran que la porte ouvrait, le chantier du plan qui la
 * tient et le jour du geste, lus sur le carnet de cet appareil — jamais
 * ressaisis à la main. Le fichier part du dernier oubli au plus ancien, pour
 * se lire dans l'ordre où l'on s'en souvient ; la dernière ligne referme le
 * compte et rappelle la version.
 */
export function oublisPortesCsv(lang: Lang = 'fr', jetons = 0): string {
  const carnet = readOublisPortes();
  const lignes: string[] = [];

  lignes.push(
    ['Écran', 'Adresse de la porte', 'Chantier', 'Jour du geste'].map(cellule).join(';'),
  );

  /* Le journal s'écrit dans l'ordre des gestes ; la lecture remonte au plus
     récent, comme le carnet à l'écran. Le chantier est relu sur le plan à
     partir de la seule adresse : une porte sans chantier connu reste vide,
     plutôt que de se voir attribuer un nom inventé. */
  [...carnet.journal].reverse().forEach((geste) => {
    lignes.push(
      [geste.ecran, geste.lien, chantierDePorte(geste.lien) ?? '', jour(geste.date, lang)]
        .map(cellule)
        .join(';'),
    );
  });

  /* Le décompte par chantier, posé sous le journal : les mêmes chiffres que
     l'écran, lus sur la même table de portes, avec la période de chacun — du
     premier oubli au dernier, et les jours qui les séparent. Une porte hors
     chantier garde sa ligne, sous son propre nom, plutôt que de se voir
     attribuer un chantier qu'elle n'a pas. */
  const semaine = oublisSemaine(carnet);
  if (semaine.length > 0) {
    const temps = semaine
      .map((geste) => new Date(geste.date).getTime())
      .filter((t) => !Number.isNaN(t));
    if (temps.length > 0) {
      const plusAncien = new Date(Math.min(...temps)).toISOString();
      const plusRecent = new Date(Math.max(...temps)).toISOString();
      lignes.push('');
      lignes.push(
        ['Total de la semaine en cours', 'Visites', 'Premier oubli', 'Dernier oubli']
          .map(cellule)
          .join(';'),
      );
      lignes.push(
        [
          'Semaine en cours',
          String(semaine.length),
          jour(plusAncien, lang),
          jour(plusRecent, lang),
        ]
          .map(cellule)
          .join(';'),
      );
    }
  }

  const parChantier = oublisParChantier(carnet);
  if (parChantier.length > 0) {
    lignes.push('');
    lignes.push(
      [
        'Visites rendues par chantier',
        'Visites',
        'Premier oubli',
        'Dernier oubli',
        'Écart (jours)',
      ]
        .map(cellule)
        .join(';'),
    );
    parChantier.forEach((ligne) => {
      lignes.push(
        [
          ligne.nom || 'hors chantier',
          String(ligne.n),
          jour(ligne.premier, lang),
          jour(ligne.dernier, lang),
          String(joursEntre(ligne.premier, ligne.dernier)),
        ]
          .map(cellule)
          .join(';'),
      );
    });
    const somme = parChantier.reduce((total, ligne) => total + ligne.n, 0);
    lignes.push(
      [
        'Total par chantier',
        String(somme),
        '',
        '',
        `${parChantier.length} chantier(s)`,
      ]
        .map(cellule)
        .join(';'),
    );
    /* Où les oublis se sont concentrés : les chantiers touchés au moins deux
       fois, comptés sur les mêmes lignes que le décompte ci-dessus — un
       chantier qu'un seul geste a touché ne dit rien d'une habitude. La ligne
       ferme le bloc, à la même largeur de cinq cellules que les autres. */
    const repetes = parChantier.filter((ligne) => ligne.n >= 2);
    lignes.push(
      [
        'Chantiers touchés par au moins deux oublis',
        String(repetes.length),
        '',
        '',
        `${parChantier.length} chantier(s) au carnet`,
      ]
        .map(cellule)
        .join(';'),
    );
  }

  /* Le compte des gestes rangés par écran, posé sous le bloc des chantiers :
     les mêmes lignes que le tri « Par écran » du carnet, avec le compte de
     chacune et le jour de son oubli le plus récent. Une ligne d'en-tête, une
     ligne par écran, puis le total — la même forme que le bloc ci-dessus,
     pour qu'une archive se relise de haut en bas sans changer d'œil. */
  const parEcran = oublisParEcran(carnet);
  if (parEcran.length > 0) {
    lignes.push('');
    lignes.push(
      ['Gestes rangés par écran', 'Gestes', 'Dernier oubli', 'Écrans'].map(cellule).join(';'),
    );
    parEcran.forEach((ligne) => {
      lignes.push(
        [ligne.ecran, String(ligne.n), jour(ligne.dernier, lang), '']
          .map(cellule)
          .join(';'),
      );
    });
    const sommeEcrans = parEcran.reduce((total, ligne) => total + ligne.n, 0);
    lignes.push(
      [
        'Total par écran',
        String(sommeEcrans),
        '',
        `${parEcran.length} écran(s)`,
      ]
        .map(cellule)
        .join(';'),
    );
    /* Combien d’écrans distincts le carnet demande encore d’ouvrir : le même
       compte que le tri à l’écran, posé sous son bloc pour qu’une archive dise
       d’un coup d’œil combien de groupes restent à relire. */
    lignes.push(
      [
        'Écrans distincts encore à relire',
        String(parEcran.length),
        '',
        `${parEcran.length} écran(s)`,
      ]
        .map(cellule)
        .join(';'),
    );
    /* Ce que chaque écran laisse au carnet, dit sur une seule ligne : le
       compte de chacun, dans l’ordre du tri, puis la somme et le nombre
       d’écrans. Une archive se relit ainsi sans descendre le bloc ligne à
       ligne — les gestes laissés par écran se lisent d’un seul tenant. */
    lignes.push(
      [
        'Gestes laissés par chaque écran',
        String(sommeEcrans),
        '',
        parEcran.map((ligne) => `${ligne.ecran} ${ligne.n}`).join(' · '),
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans qu’un second oubli rend ambigus : ceux qui tiennent encore
       plus d’un geste, comptés sur les mêmes lignes que le dépli — le même
       resserrement que le jeton de relecture à l’écran, gestes compris. */
    const plusieurs = parEcran.filter((ligne) => ligne.n > 1);
    lignes.push(
      [
        'Écrans à plus d’un geste',
        String(plusieurs.length),
        String(plusieurs.reduce((compte, ligne) => compte + ligne.n, 0)),
        plusieurs.length > 0
          ? plusieurs.map((ligne) => `${ligne.ecran} ${ligne.n}`).join(' · ')
          : 'aucun écran à relire',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans qu’aucune relecture ne demande : ceux qui ne tiennent qu’un
       seul geste, posés sous le compte des écrans à relire. Une archive dit
       ainsi, d’un même regard, ce qu’il faut relire et ce qui est déjà
       tranché — lus sur les mêmes lignes que le dépli. */
    const uniques = parEcran.filter((ligne) => ligne.n <= 1);
    lignes.push(
      [
        'Écrans à un seul geste',
        String(uniques.length),
        String(uniques.reduce((compte, ligne) => compte + ligne.n, 0)),
        uniques.length > 0
          ? uniques.map((ligne) => ligne.ecran).join(' · ')
          : 'aucun écran à un seul geste',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La place de chaque écran dans les deux ordres, posée sous les écrans à
       un seul geste : celui du carnet d’abord — le dépli tel qu’il s’ouvre —,
       puis le rangement du plus fourni au plus léger. Une archive dit ainsi
       quelle ligne se déplace, et de combien d’écrans. */
    const ordreCarnet = ordreEcransCarnet(carnet, parEcran);
    const deplaces = ordreCarnet.filter(
      (ligne, rang) => parEcran[rang]?.ecran !== ligne.ecran,
    ).length;
    lignes.push(
      [
        'Place de chaque écran dans les deux ordres',
        String(parEcran.length),
        String(deplaces),
        ordreCarnet
          .map((ligne, rang) => {
            const rangFourni =
              parEcran.findIndex((item) => item.ecran === ligne.ecran) + 1;
            return `${ligne.ecran} — carnet ${rang + 1} · fourni ${rangFourni}`;
          })
          .join(' · '),
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le temps moyen qui sépare le premier geste du dernier, écran par écran,
       posé sous la place de chacun : l'archive dit ainsi combien de journées
       un écran met à se remplir, et le détail donne l'écart de chacun, lu sur
       les mêmes lignes que le dépli. Une moyenne se dit à une décimale, pour
       qu'un demi-jour ne se confonde pas avec le jour entier. */
    const ecarts = parEcran.map((ligne) => joursEntre(ligne.premier, ligne.dernier));
    const moyenne = ecarts.reduce((somme, n) => somme + n, 0) / ecarts.length;
    lignes.push(
      [
        'Écart moyen entre le premier et le dernier geste de chaque écran',
        String(parEcran.length),
        nombre(moyenne, 1),
        parEcran.map((ligne, rang) => `${ligne.ecran} ${ecarts[rang]} j`).join(' · '),
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans qu'on ne relit plus : leur dernier geste remonte à plus de
       sept journées pleines, lus sur les mêmes lignes que le dépli — le même
       resserrement que le jeton « Dernier geste > 7 j » à l'écran, gestes
       compris. Une archive dit ainsi combien d'écrans dorment depuis trop
       longtemps, et lesquels. */
    const maintenant = new Date().toISOString();
    const vieux = parEcran.filter(
      (ligne) => joursEntre(ligne.dernier, maintenant) > 7,
    );
    lignes.push(
      [
        'Écrans dont le dernier geste a plus de sept jours',
        String(vieux.length),
        String(vieux.reduce((compte, ligne) => compte + ligne.n, 0)),
        vieux.length > 0
          ? vieux
              .map(
                (ligne) =>
                  `${ligne.ecran} · ${joursEntre(ligne.dernier, maintenant)} j`,
              )
              .join(' · ')
          : 'aucun écran de plus de sept jours',
      ]
        .map(cellule)
        .join(';'),
    );
  }

  /* Les écrans qu’un retrait a vidés, posés sous le bloc par écran : leurs
     gestes ne figurent plus au journal, et seule la mémoire d’appareil les
     retient. Le CSV les nomme pour que l’archive dise aussi ce qui a quitté
     le carnet, et non seulement ce qui y reste. */
  const vides = readEcransVides();
  if (vides.length > 0) {
    lignes.push('');
    lignes.push(
      ['Écrans dont tous les gestes ont déjà été retirés', 'Écrans', '', 'Ces écrans']
        .map(cellule)
        .join(';'),
    );
    lignes.push(
      [
        'Total des écrans vidés',
        String(vides.length),
        '',
        `${vides.length} écran(s) · ${vides.join(' · ')}`,
      ]
        .map(cellule)
        .join(';'),
    );
  }

  /* Les écrans dont un appui sur le nom a resserré le carnet, posés sous
     les écrans vidés : la ligne dit où le geste a servi, et le jour du dernier
     geste de chacun au moment de l’appui — lu sur la mémoire du poste, jamais
     recopié à côté. Le jour le plus récent ouvre la marche. */
  const appuyes = [...readEcransAppuyes()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  if (appuyes.length > 0) {
    lignes.push('');
    lignes.push(
      ['Écrans où l’appui sur le nom a servi', 'Écrans', '', 'Jour du dernier geste']
        .map(cellule)
        .join(';'),
    );
    lignes.push(
      [
        'Total des écrans retenus par leur nom',
        String(appuyes.length),
        '',
        `${appuyes.length} écran(s) · ${appuyes
          .map((item) => `${item.ecran} — dernier geste le ${jour(item.date, lang)}`)
          .join(' · ')}`,
      ]
        .map(cellule)
        .join(';'),
    );
  }

  /* Les écrans qu'un second appui sur leur nom a retirés du carnet, posés
     sous ceux où l'appui a seulement servi : la ligne nomme chaque écran
     parti par ce chemin, avec le jour de son retrait — lu sur la mémoire du
     poste, jamais recopié à côté. Le retrait le plus récent ouvre la marche. */
  const retiresNom = [...readEcransRetiresNom()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  if (retiresNom.length > 0) {
    lignes.push('');
    lignes.push(
      ['Écrans retirés du carnet par un second appui sur leur nom', 'Écrans', '', 'Jour du retrait']
        .map(cellule)
        .join(';'),
    );
    retiresNom.forEach((item) => {
      lignes.push(
        [item.ecran, '', '', jour(item.date, lang)].map(cellule).join(';'),
      );
    });
    lignes.push(
      [
        'Total des écrans retirés par leur nom',
        String(retiresNom.length),
        '',
        `${retiresNom.length} écran(s) · ${retiresNom
          .map((item) => `${item.ecran} — retiré le ${jour(item.date, lang)}`)
          .join(' · ')}`,
      ]
        .map(cellule)
        .join(';'),
    );
    /* L'écart entre le premier et le dernier retrait par nom, posé sous le
       total : l'archive dit en combien de journées le geste s'est étalé, et
       les deux bouts qui le bornent — lus sur l'historique des retraits, qui
       garde chaque geste, jamais sur la seule liste des écrans. */
    const hist = readEcransRetiresHist();
    const tempsRetraits = (hist.length > 0 ? hist : retiresNom)
      .map((item) => new Date(item.date).getTime())
      .filter((t) => !Number.isNaN(t));
    if (tempsRetraits.length > 0) {
      const premierRetrait = new Date(Math.min(...tempsRetraits)).toISOString();
      const dernierRetrait = new Date(Math.max(...tempsRetraits)).toISOString();
      lignes.push(
        [
          'Écart entre le premier et le dernier retrait par nom',
          String(joursEntre(premierRetrait, dernierRetrait)),
          '',
          `du ${jour(premierRetrait, lang)} au ${jour(dernierRetrait, lang)} · ${retiresNom.length} écran(s)`,
        ]
          .map(cellule)
          .join(';'),
      );
    }
    /* Les retraits successifs subis par chaque écran depuis cet appareil :
       un même écran peut être retiré par son nom plusieurs fois, revenir au
       carnet entre-temps, et repartir. Le compte se lit sur l'historique des
       retraits, un geste par entrée — jamais sur la seule liste des écrans,
       qui n'en garde qu'une trace par nom. */
    const gestesRetrait = hist.length > 0 ? hist : retiresNom;
    const compteRetraits = new Map<string, number>();
    gestesRetrait.forEach((item) => {
      compteRetraits.set(item.ecran, (compteRetraits.get(item.ecran) ?? 0) + 1);
    });
    const retraitsParEcran = [...compteRetraits.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr', { sensitivity: 'base' }),
    );
    lignes.push(
      [
        'Retraits successifs subis par chaque écran',
        String(gestesRetrait.length),
        String(retraitsParEcran.length),
        retraitsParEcran
          .map(([nom, n]) => `${nom} — ${n} retrait(s)`)
          .join(' · '),
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans qui ont quitté le carnet ces sept derniers jours : un écran
       retiré puis revenu entre-temps garde sa ligne — c'est son départ qui
       compte, pas ce qu'il est devenu depuis. Le dernier départ de chacun fait
       foi, lu sur l'historique des retraits, et les retours sont lus sur
       l'historique des retours pour dire combien sont déjà revenus. */
    const maintenantSortie = new Date().toISOString();
    const sortisSemaine = new Map<string, string>();
    gestesRetrait.forEach((item) => {
      if (joursEntre(item.date, maintenantSortie) > 7) return;
      const avant = sortisSemaine.get(item.ecran);
      if (!avant || new Date(item.date).getTime() > new Date(avant).getTime()) {
        sortisSemaine.set(item.ecran, item.date);
      }
    });
    const sortisListe = [...sortisSemaine.entries()].sort(
      (a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime(),
    );
    const retoursSortie = readEcransRetoursHist();
    const retoursSortieListe =
      retoursSortie.length > 0 ? retoursSortie : readEcransRetours();
    const revenusEntreTemps = sortisListe.filter(([nom, depart]) =>
      retoursSortieListe.some(
        (item) =>
          item.ecran === nom &&
          new Date(item.retour).getTime() > new Date(depart).getTime(),
      ),
    ).length;
    lignes.push(
      [
        'Écrans ayant quitté le carnet depuis sept jours',
        String(sortisListe.length),
        `${revenusEntreTemps} revenu(s) entre-temps`,
        sortisListe.length > 0
          ? sortisListe
              .map(([nom, date]) => `${nom} — ${jour(date, lang)}`)
              .join(' · ')
          : 'aucun écran parti depuis sept jours',
      ]
        .map(cellule)
        .join(';'),
    );
  }

  /* Les écrans revenus au carnet, mois par mois : un retour par geste retenu,
     rangé sous son mois, pour que les vagues du geste se lisent d'un coup
     d'œil. Une ligne par mois, du plus récent au plus ancien, puis le total
     qui nomme chaque retour avec son mois. */
  const retoursHist = readEcransRetoursHist();
  const retoursCarnet = retoursHist.length > 0 ? retoursHist : readEcransRetours();
  if (retoursCarnet.length > 0) {
    const parMois = new Map<
      string,
      { cle: string; mois: string; n: number; ecrans: string[] }
    >();
    retoursCarnet.forEach((item) => {
      const cle = item.retour.slice(0, 7);
      const mois = moisDe(item.retour, lang);
      const courant = parMois.get(cle);
      if (!courant) {
        parMois.set(cle, { cle, mois, n: 1, ecrans: [item.ecran] });
        return;
      }
      courant.n += 1;
      if (!courant.ecrans.includes(item.ecran)) courant.ecrans.push(item.ecran);
    });
    const moisTries = [...parMois.values()].sort((a, b) => b.cle.localeCompare(a.cle));
    lignes.push('');
    lignes.push(
      ['Écrans revenus au carnet, par mois', 'Retours', 'Mois', 'Ces retours']
        .map(cellule)
        .join(';'),
    );
    moisTries.forEach((m) => {
      lignes.push(
        [m.mois, String(m.n), '', m.ecrans.join(' · ')].map(cellule).join(';'),
      );
    });
    lignes.push(
      [
        'Total des retours au carnet',
        String(retoursCarnet.length),
        `${moisTries.length} mois`,
        retoursCarnet
          .map((item) => `${item.ecran} — ${moisDe(item.retour, lang)}`)
          .join(' · '),
      ]
        .map(cellule)
        .join(';'),
    );

    /* L'écart de jours entre le dernier retrait et le retour, écran par
       écran : l'archive dit combien de journées un écran a passées hors du
       carnet avant d'y revenir. Le dernier retour de chaque écran fait foi,
       lu sur l'historique des retours — un même écran revenu deux fois n'y
       garde qu'une ligne. */
    const dernierRetourParEcran = new Map<string, EcranRetour>();
    retoursCarnet.forEach((item) => {
      const avant = dernierRetourParEcran.get(item.ecran);
      if (
        !avant ||
        new Date(item.retour).getTime() > new Date(avant.retour).getTime()
      ) {
        dernierRetourParEcran.set(item.ecran, item);
      }
    });
    const ecartsRetour = [...dernierRetourParEcran.values()]
      .map((item) => ({ ...item, jours: joursEntre(item.retire, item.retour) }))
      .sort(
        (a, b) =>
          b.jours - a.jours ||
          a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' }),
      );
    if (ecartsRetour.length > 0) {
      const sommeEcarts = ecartsRetour.reduce((somme, item) => somme + item.jours, 0);
      lignes.push('');
      lignes.push(
        [
          'Écart entre le dernier retrait et le retour, par écran',
          'Jours',
          'Dernier retrait',
          'Retour',
        ]
          .map(cellule)
          .join(';'),
      );
      ecartsRetour.forEach((item) => {
        lignes.push(
          [
            item.ecran,
            String(item.jours),
            jour(item.retire, lang),
            jour(item.retour, lang),
          ]
            .map(cellule)
            .join(';'),
        );
      });
      lignes.push(
        [
          'Total des écarts de retour',
          String(ecartsRetour.length),
          `moyenne ${nombre(sommeEcarts / ecartsRetour.length, 1)} jour(s)`,
          ecartsRetour.map((item) => `${item.ecran} — ${item.jours} j`).join(' · '),
        ]
          .map(cellule)
          .join(';'),
      );
    }
  }

  /* Les écrans revenus puis repartis : ceux qu'un geste avait ramenés au
     carnet et qu'un nouvel appui sur leur nom a vidés depuis. La ligne dit,
     écran par écran, combien de jours chacun est resté au carnet avant de
     repartir — de son retour à son dernier retrait, lus sur les deux
     historiques, jamais devinés sur l'ordre d'une liste. */
  const retoursRepartis = readEcransRetoursHist();
  const retraitsRepartis = readEcransRetiresHist();
  /* Un écran ne garde qu'une ligne : son dernier retour suivi d'un retrait
     fait foi, si bien qu'un même écran revenu puis reparti deux fois ne
     compte pas deux fois les jours qu'il a passés au carnet. */
  const dernierRetourReparti = new Map<string, { retour: string; retrait: string }>();
  (retoursRepartis.length > 0 ? retoursRepartis : readEcransRetours()).forEach(
    (retour) => {
      const apres = retraitsRepartis.filter(
        (item) =>
          item.ecran === retour.ecran &&
          new Date(item.date).getTime() > new Date(retour.retour).getTime(),
      );
      if (apres.length === 0) return;
      const dernier = apres.reduce((garde, courant) =>
        new Date(courant.date).getTime() > new Date(garde.date).getTime()
          ? courant
          : garde,
      );
      const avant = dernierRetourReparti.get(retour.ecran);
      if (
        avant &&
        new Date(retour.retour).getTime() <= new Date(avant.retour).getTime()
      ) {
        return;
      }
      dernierRetourReparti.set(retour.ecran, {
        retour: retour.retour,
        retrait: dernier.date,
      });
    },
  );
  const ecransRepartisCsv = [...dernierRetourReparti.entries()]
    .map(([ecran, item]) => ({
      ecran,
      retour: item.retour,
      retrait: item.retrait,
      jours: joursEntre(item.retour, item.retrait),
    }))
    .sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retrait).getTime() - new Date(a.retrait).getTime() ||
        a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' }),
    );
  if (ecransRepartisCsv.length > 0) {
    const sommeJours = ecransRepartisCsv.reduce(
      (somme, item) => somme + item.jours,
      0,
    );
    lignes.push('');
    lignes.push(
      [
        'Jours passés au carnet avant de repartir, par écran',
        'Jours',
        'Retour',
        'Dernier retrait',
      ]
        .map(cellule)
        .join(';'),
    );
    ecransRepartisCsv.forEach((item) => {
      lignes.push(
        [
          item.ecran,
          String(item.jours),
          jour(item.retour, lang),
          jour(item.retrait, lang),
        ]
          .map(cellule)
          .join(';'),
      );
    });
    lignes.push(
      [
        'Total des jours passés au carnet',
        String(ecransRepartisCsv.length),
        `moyenne ${nombre(sommeJours / ecransRepartisCsv.length, 1)} jour(s)`,
        ecransRepartisCsv.map((item) => `${item.ecran} — ${item.jours} j`).join(' · '),
      ]
        .map(cellule)
        .join(';'),
    );

    /* Les écrans repartis rangés sous le mois de leur dernier retrait : les
       vagues du départ se lisent d'un mois à l'autre, comme les retours au
       carnet se lisent sous le mois de leur retour. Un écran revenu puis
       reparti deux fois n'y garde qu'une ligne — son dernier retrait fait foi,
       sur les mêmes lignes que la section ci-dessus. */
    const parMoisRepartis = new Map<
      string,
      { cle: string; mois: string; n: number; ecrans: string[] }
    >();
    ecransRepartisCsv.forEach((item) => {
      const cle = item.retrait.slice(0, 7);
      const mois = moisDe(item.retrait, lang);
      const courant = parMoisRepartis.get(cle);
      if (!courant) {
        parMoisRepartis.set(cle, { cle, mois, n: 1, ecrans: [item.ecran] });
        return;
      }
      courant.n += 1;
      if (!courant.ecrans.includes(item.ecran)) courant.ecrans.push(item.ecran);
    });
    const moisRepartisTries = [...parMoisRepartis.values()].sort((a, b) =>
      b.cle.localeCompare(a.cle),
    );
    lignes.push('');
    lignes.push(
      ['Écrans repartis, par mois de dernier retrait', 'Écrans', 'Mois', 'Ces écrans']
        .map(cellule)
        .join(';'),
    );
    moisRepartisTries.forEach((m) => {
      lignes.push(
        [m.mois, String(m.n), '', m.ecrans.join(' · ')].map(cellule).join(';'),
      );
    });
    /* Les écrans repartis rangés sous l'année de leur dernier retrait, d'une
       seule ligne posée sous le tableau des mois : la même règle de date que
       les lignes du dessus — le dernier retrait de chaque écran fait foi —, si
       bien que le compte des années ne peut pas contredire celui des mois. */
    const parAnneeRepartis = new Map<string, { n: number; ecrans: string[] }>();
    ecransRepartisCsv.forEach((item) => {
      const cle = item.retrait.slice(0, 4);
      const courant = parAnneeRepartis.get(cle);
      if (!courant) {
        parAnneeRepartis.set(cle, { n: 1, ecrans: [item.ecran] });
        return;
      }
      courant.n += 1;
      if (!courant.ecrans.includes(item.ecran)) courant.ecrans.push(item.ecran);
    });
    const anneesRepartisTriees = [...parAnneeRepartis.entries()].sort((a, b) =>
      b[0].localeCompare(a[0]),
    );
    lignes.push(
      [
        'Écrans repartis, par année de dernier retrait',
        String(ecransRepartisCsv.length),
        `${anneesRepartisTriees.length} année(s) · moyenne ${nombre(
          ecransRepartisCsv.length / anneesRepartisTriees.length,
          1,
        )} écran(s) par année`,
        anneesRepartisTriees
          .map(([annee, valeur]) => `${annee} — ${valeur.n}`)
          .join(' · '),
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le mois en cours, compté à part sous la liste des mois : le récapitulatif
       du mois se lit à côté de ceux des mois précédents, sans avoir à repérer
       sa ligne parmi elles. Les deux se comptent sur les mêmes écrans, si bien
       que le chiffre du mois ne peut pas contredire la ligne de son mois. */
    const maintenant = new Date();
    const repartisCeMois = ecransRepartisCsv.filter((item) =>
      estMoisEnCours(item.retrait, maintenant),
    );
    lignes.push(
      [
        'Dont écrans repartis ce mois-ci',
        String(repartisCeMois.length),
        moisDe(maintenant.toISOString(), lang),
        repartisCeMois.length > 0
          ? repartisCeMois
              .map((item) => `${item.ecran} — ${jour(item.retrait, lang)}`)
              .join(' · ')
          : 'aucun écran reparti ce mois-ci',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le jour même, compté à part sous le mois et juste avant le total :
       la ligne du jour se lit à côté de celle du mois, et les deux se
       comptent sur les mêmes écrans — le chiffre du jour ne peut donc pas
       contredire celui du mois qui le contient. */
    const repartisAujourdhui = ecransRepartisCsv.filter((item) =>
      estJourEnCours(item.retrait, maintenant),
    );
    lignes.push(
      [
        'Dont écrans repartis aujourd’hui',
        String(repartisAujourdhui.length),
        jour(maintenant.toISOString(), lang),
        repartisAujourdhui.length > 0
          ? repartisAujourdhui
              .map((item) => `${item.ecran} — ${jour(item.retrait, lang)}`)
              .join(' · ')
          : 'aucun écran reparti aujourd’hui',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans repartis de la semaine en cours, jour par jour : la ligne
       suit les sept journées du lundi au dimanche, chacune avec son compte et
       les écrans qui y sont partis — lus sur les mêmes écrans que le jeton de
       la semaine, si bien qu'aucun jour ne peut contredire le total. Un jour
       sans départ garde sa ligne et son zéro, pour que la semaine se lise
       d'un bout à l'autre. */
    const debutDeSemaine = debutSemaine(maintenant);
    const joursDeSemaine = Array.from({ length: 7 }, (_, rang) => {
      const jourDuRang = new Date(debutDeSemaine);
      jourDuRang.setDate(debutDeSemaine.getDate() + rang);
      const partis = ecransRepartisCsv.filter((item) =>
        estJourEnCours(item.retrait, jourDuRang),
      );
      return {
        date: jourDuRang.toISOString(),
        n: partis.length,
        ecrans: partis.map((item) => item.ecran),
      };
    });
    const departsSemaine = joursDeSemaine.reduce((somme, item) => somme + item.n, 0);
    lignes.push(
      [
        'Écrans repartis de la semaine en cours, jour par jour',
        String(departsSemaine),
        `${joursDeSemaine.filter((item) => item.n > 0).length} jour(s) avec départ · moyenne ${nombre(
          departsSemaine / joursDeSemaine.length,
          1,
        )} départ(s) par jour`,
        joursDeSemaine
          .map(
            (item) =>
              `${jourSemaineDe(item.date, lang)} — ${item.n}${
                item.ecrans.length > 0 ? ` (${item.ecrans.join(', ')})` : ''
              }`,
          )
          .join(' · '),
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans repartis du huitième au quinzième jour, posés sous la
       semaine : la seconde semaine de la quinzaine se lit à part, sur les
       mêmes écrans que le jeton de la quinzaine — un départ de sept jours
       n'y entre pas, un départ de seize non plus. Un jour sans départ ne
       s'invente pas, et la ligne le dit plutôt que d'afficher un zéro nu. */
    const repartisSecondeSemaine = ecransRepartisCsv.filter((item) => {
      const ecart = joursEntre(item.retrait, maintenant.toISOString());
      return ecart >= 8 && ecart <= 15;
    });
    const joursSecondeSemaine = new Set(
      repartisSecondeSemaine.map((item) => item.retrait.slice(0, 10)),
    ).size;
    lignes.push(
      [
        'Écrans repartis du huitième au quinzième jour',
        String(repartisSecondeSemaine.length),
        repartisSecondeSemaine.length > 0
          ? `seconde semaine de la quinzaine · ${joursSecondeSemaine} jour(s) avec départ`
          : 'aucun départ sur ces jours',
        repartisSecondeSemaine.length > 0
          ? repartisSecondeSemaine
              .map((item) => `${item.ecran} — ${jour(item.retrait, lang)}`)
              .join(' · ')
          : 'aucun écran reparti entre le huitième et le quinzième jour',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans revenus au carnet du huitième au quinzième jour, posés sous
       la ligne des départs de la même fenêtre : les deux semaines de la
       quinzaine se comparent d'un même regard — ce qui est parti, ce qui est
       revenu. Un écran revenu deux fois dans la fenêtre n'y pèse qu'une ligne,
       et son retour le plus récent fait foi, lu sur l'historique des retours. */
    const retoursSecondeSemaine = new Map<string, string>();
    retoursCarnet.forEach((item) => {
      const ecart = joursEntre(item.retour, maintenant.toISOString());
      if (ecart < 8 || ecart > 15) return;
      const avant = retoursSecondeSemaine.get(item.ecran);
      if (!avant || new Date(item.retour).getTime() > new Date(avant).getTime()) {
        retoursSecondeSemaine.set(item.ecran, item.retour);
      }
    });
    const retoursSecondeListe = [...retoursSecondeSemaine.entries()].sort(
      (a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime(),
    );
    lignes.push(
      [
        'Écrans revenus au carnet du huitième au quinzième jour',
        String(retoursSecondeListe.length),
        retoursSecondeListe.length > 0
          ? `seconde semaine de la quinzaine · à comparer aux départs de ces mêmes jours (${repartisSecondeSemaine.length})`
          : 'aucun retour sur ces jours',
        retoursSecondeListe.length > 0
          ? retoursSecondeListe
              .map(([ecran, retour]) => `${ecran} — ${jour(retour, lang)}`)
              .join(' · ')
          : 'aucun écran revenu au carnet entre le huitième et le quinzième jour',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai moyen de retour des écrans revenus cette semaine, posé sous
       les retours de la seconde semaine : les deux semaines de la quinzaine
       se comparent d'un même regard — ce qui revient, et en combien de
       journées. Un écran revenu deux fois dans la fenêtre n'y pèse qu'une
       ligne, son retour le plus récent faisant foi, comme dans la ligne des
       retours au-dessus. */
    const delaisDeRetour = (garde: (retour: EcranRetour) => boolean) => {
      const derniers = new Map<string, EcranRetour>();
      retoursCarnet.forEach((item) => {
        if (!garde(item)) return;
        const avant = derniers.get(item.ecran);
        if (
          !avant ||
          new Date(item.retour).getTime() > new Date(avant.retour).getTime()
        ) {
          derniers.set(item.ecran, item);
        }
      });
      const ecarts = [...derniers.values()].map((item) =>
        joursEntre(item.retire, item.retour),
      );
      const somme = ecarts.reduce((total, n) => total + n, 0);
      return {
        n: ecarts.length,
        moyenne: ecarts.length > 0 ? somme / ecarts.length : 0,
        /* Le milieu du lot, posé à côté de la moyenne : les deux se lisent
           sur les mêmes retours, si bien qu'aucune ligne ne contredit l'autre. */
        mediane: mediane(ecarts),
      };
    };
    const delaiSemaine = delaisDeRetour((item) =>
      estSemaineEnCours(item.retour, maintenant),
    );
    const delaiSecondeSemaine = delaisDeRetour((item) => {
      const ecart = joursEntre(item.retour, maintenant.toISOString());
      return ecart >= 8 && ecart <= 15;
    });
    lignes.push(
      [
        'Délai moyen de retour de la semaine en cours',
        String(delaiSemaine.n),
        delaiSemaine.n > 0
          ? `${nombre(delaiSemaine.moyenne, 1)} jour(s) en moyenne · seconde semaine de la quinzaine : ${
              delaiSecondeSemaine.n > 0
                ? `${nombre(delaiSecondeSemaine.moyenne, 1)} jour(s) sur ${delaiSecondeSemaine.n} retour(s)`
                : 'aucun retour daté'
            }`
          : 'aucun retour daté dans la semaine en cours',
        delaiSemaine.n > 0
          ? `${delaiSemaine.n} écran(s) revenu(s) · à comparer aux ${delaiSecondeSemaine.n} retour(s) du huitième au quinzième jour`
          : 'aucun écran revenu cette semaine',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai moyen de tout l'historique des retours datés, posé juste sous
       celui de la semaine : les deux se comparent d'un même regard — la
       semaine qui court, et tout ce que le carnet a daté. Le dernier retour
       de chaque écran fait foi, comme dans la ligne au-dessus, si bien que
       les deux moyennes se lisent sur la même mémoire. */
    const delaiHist = delaisDeRetour(() => true);
    lignes.push(
      [
        'Délai moyen de tout l’historique des retours datés',
        String(delaiHist.n),
        delaiHist.n > 0
          ? `${nombre(delaiHist.moyenne, 1)} jour(s) en moyenne sur ${delaiHist.n} retour(s) daté(s) de l’historique · à comparer à la semaine en cours : ${
              delaiSemaine.n > 0
                ? `${nombre(delaiSemaine.moyenne, 1)} jour(s) sur ${delaiSemaine.n} retour(s)`
                : 'aucun retour daté cette semaine'
            }`
          : 'aucun retour daté dans l’historique',
        delaiHist.n > 0
          ? `${delaiHist.n} écran(s) revenu(s) au carnet, le dernier retour de chacun faisant foi`
          : 'aucun écran revenu au carnet',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai médian des retours datés, posé juste sous la moyenne : les
       deux se lisent ensemble — la moyenne se laisse tirer par un retour
       très lent, le milieu dit où se tient le lot. Les deux chiffres se
       prennent sur les mêmes retours, le dernier de chaque écran faisant
       foi, et ne peuvent donc pas se contredire. */
    lignes.push(
      [
        'Délai médian des retours datés de tout l’historique',
        String(delaiHist.n),
        delaiHist.n > 0
          ? `${nombre(delaiHist.mediane, 1)} jour(s) au milieu du lot de ${delaiHist.n} retour(s) daté(s) · à comparer à la moyenne de ${nombre(delaiHist.moyenne, 1)} jour(s)`
          : 'aucun retour daté dans l’historique',
        delaiHist.n > 0
          ? `La moitié des retours datés revient en ${nombre(delaiHist.mediane, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu au carnet',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai médian de la semaine en cours, posé juste sous celui de tout
       l’historique : les deux milieux se lisent côte à côte, pris sur le même
       retour le plus récent de chaque écran, si bien qu’aucun des deux ne peut
       contredire l’autre. Un lot vide le dit calmement. */
    lignes.push(
      [
        'Délai médian des retours datés de la semaine en cours',
        String(delaiSemaine.n),
        delaiSemaine.n > 0
          ? `${nombre(delaiSemaine.mediane, 1)} jour(s) au milieu du lot de ${delaiSemaine.n} retour(s) daté(s) · à comparer au milieu de tout l’historique : ${nombre(delaiHist.mediane, 1)} jour(s)`
          : 'aucun retour daté dans la semaine en cours',
        delaiSemaine.n > 0
          ? `La moitié des retours datés de la semaine revient en ${nombre(delaiSemaine.mediane, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu cette semaine',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai médian du mois et celui du trimestre, posés sous celui de la
       semaine : les quatre milieux se lisent côte à côte, tous pris sur le
       retour le plus récent de chaque écran, si bien qu’aucun ne peut
       contredire les autres. Un lot vide le dit calmement. */
    const delaiMois = delaisDeRetour((item) =>
      estMoisEnCours(item.retour, maintenant),
    );
    const delaiMoisDernier = delaisDeRetour((item) =>
      estMoisDernier(item.retour, maintenant),
    );
    const delaiAvantDernierMois = delaisDeRetour((item) =>
      estAvantDernierMois(item.retour, maintenant),
    );
    const depuisTrimestre = new Date(maintenant);
    depuisTrimestre.setMonth(depuisTrimestre.getMonth() - 3);
    depuisTrimestre.setHours(0, 0, 0, 0);
    const delaiTrimestre = delaisDeRetour(
      (item) => new Date(item.retour).getTime() >= depuisTrimestre.getTime(),
    );
    /* Le milieu du trimestre fermé, posé à côté de celui du trimestre : la
       fenêtre écoulée se lit sur les mêmes retours, le dernier de chaque écran
       faisant foi — les deux chiffres ne peuvent donc pas se contredire. */
    const delaiTrimestreFerme = delaisDeRetour((item) =>
      estTrimestreFerme(item.retour, maintenant),
    );
    /* Le milieu de l’année fermée, posé à côté de celui du trimestre fermé :
       la fenêtre des douze mois se lit sur les mêmes retours, le dernier de
       chaque écran faisant foi — les deux chiffres ne peuvent donc pas se
       contredire, et le mois en cours reste dehors de l’un comme de l’autre. */
    const delaiAnneeFermee = delaisDeRetour((item) =>
      estAnneeFermee(item.retour, maintenant),
    );
    /* Le milieu du lot réuni des deux fenêtres fermées — le mois dernier et
       l’avant-dernier —, pris sur les mêmes retours : le dernier de chaque
       écran faisant foi, et les deux mois ne se recouvrant pas, aucun écran
       n’y pèse deux fois. */
    const delaiDeuxFenetres = delaisDeRetour(
      (item) =>
        estMoisDernier(item.retour, maintenant) ||
        estAvantDernierMois(item.retour, maintenant),
    );
    /* Le milieu du lot réuni de l’année fermée et de l’avant-dernier mois,
       pris sur les mêmes retours : le dernier de chaque écran faisant foi, et
       l’avant-dernier mois étant déjà contenu dans l’année, aucun écran n’y
       pèse deux fois. */
    const delaiAnneeFermeeAvantDernierMois = delaisDeRetour(
      (item) =>
        estAnneeFermee(item.retour, maintenant) ||
        estAvantDernierMois(item.retour, maintenant),
    );
    lignes.push(
      [
        'Délai médian des retours datés du mois en cours',
        String(delaiMois.n),
        delaiMois.n > 0
          ? `${nombre(delaiMois.mediane, 1)} jour(s) au milieu du lot de ${delaiMois.n} retour(s) daté(s) · à comparer au milieu de tout l’historique : ${nombre(delaiHist.mediane, 1)} jour(s)`
          : 'aucun retour daté dans le mois en cours',
        delaiMois.n > 0
          ? `La moitié des retours datés du mois revient en ${nombre(delaiMois.mediane, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu ce mois-ci',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai médian du mois dernier, posé juste sous celui du mois en cours :
       deux fenêtres qui se suivent, lues sur les mêmes retours — le dernier de
       chaque écran faisant foi —, si bien qu’aucun milieu ne peut contredire
       l’autre. Un lot vide le dit calmement. */
    lignes.push(
      [
        'Délai médian des retours datés du mois dernier',
        String(delaiMoisDernier.n),
        delaiMoisDernier.n > 0
          ? `${nombre(delaiMoisDernier.mediane, 1)} jour(s) au milieu du lot de ${delaiMoisDernier.n} retour(s) daté(s) · à comparer au milieu du mois en cours : ${nombre(delaiMois.mediane, 1)} jour(s)`
          : 'aucun retour daté le mois dernier',
        delaiMoisDernier.n > 0
          ? `La moitié des retours datés du mois dernier revient en ${nombre(delaiMoisDernier.mediane, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu le mois dernier',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai médian de l’avant-dernier mois, posé juste sous celui du mois
       dernier : la seconde fenêtre fermée se lit à côté de la première, sur
       les mêmes retours — le dernier de chaque écran faisant foi —, si bien
       qu’aucun milieu ne peut contredire l’autre. Un lot vide le dit
       calmement. */
    lignes.push(
      [
        'Délai médian des retours datés de l’avant-dernier mois',
        String(delaiAvantDernierMois.n),
        delaiAvantDernierMois.n > 0
          ? `${nombre(delaiAvantDernierMois.mediane, 1)} jour(s) au milieu du lot de ${delaiAvantDernierMois.n} retour(s) daté(s) · à comparer au milieu du mois dernier : ${nombre(delaiMoisDernier.mediane, 1)} jour(s)`
          : 'aucun retour daté l’avant-dernier mois',
        delaiAvantDernierMois.n > 0
          ? `La moitié des retours datés de l’avant-dernier mois revient en ${nombre(delaiAvantDernierMois.mediane, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu l’avant-dernier mois',
      ]
        .map(cellule)
        .join(';'),
    );
    lignes.push(
      [
        'Délai médian des retours datés du trimestre en cours',
        String(delaiTrimestre.n),
        delaiTrimestre.n > 0
          ? `${nombre(delaiTrimestre.mediane, 1)} jour(s) au milieu du lot de ${delaiTrimestre.n} retour(s) daté(s) · à comparer au milieu du mois : ${nombre(delaiMois.mediane, 1)} jour(s)`
          : 'aucun retour daté ces trois derniers mois',
        delaiTrimestre.n > 0
          ? `La moitié des retours datés du trimestre revient en ${nombre(delaiTrimestre.mediane, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu ces trois derniers mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai médian du trimestre fermé, posé juste sous celui du trimestre :
       les deux milieux se lisent côte à côte, pris sur le même retour le plus
       récent de chaque écran — le mois en cours restant dehors, là où la ligne
       du trimestre le prend encore. Un lot vide le dit calmement. */
    lignes.push(
      [
        'Délai médian des retours datés du trimestre fermé',
        String(delaiTrimestreFerme.n),
        delaiTrimestreFerme.n > 0
          ? `${nombre(delaiTrimestreFerme.mediane, 1)} jour(s) au milieu du lot de ${delaiTrimestreFerme.n} retour(s) daté(s) · à comparer au milieu du trimestre : ${nombre(delaiTrimestre.mediane, 1)} jour(s)`
          : 'aucun retour daté sur les trois mois fermés',
        delaiTrimestreFerme.n > 0
          ? `La moitié des retours datés du trimestre fermé revient en ${nombre(delaiTrimestreFerme.mediane, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu sur les trois mois fermés',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai médian de l’année fermée, posé juste sous celui du trimestre
       fermé : les deux milieux se lisent côte à côte, pris sur le même retour
       le plus récent de chaque écran — le mois en cours restant dehors, là où
       la ligne de l’année le prend encore. Un lot vide le dit calmement. */
    lignes.push(
      [
        'Délai médian des retours datés de l’année fermée',
        String(delaiAnneeFermee.n),
        delaiAnneeFermee.n > 0
          ? `${nombre(delaiAnneeFermee.mediane, 1)} jour(s) au milieu du lot de ${delaiAnneeFermee.n} retour(s) daté(s) · à comparer au milieu du trimestre fermé : ${nombre(delaiTrimestreFerme.mediane, 1)} jour(s)`
          : 'aucun retour daté sur les douze mois fermés',
        delaiAnneeFermee.n > 0
          ? `La moitié des retours datés de l’année fermée revient en ${nombre(delaiAnneeFermee.mediane, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu sur les douze mois fermés',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai médian du lot réuni des deux fenêtres fermées — le mois dernier
       et l’avant-dernier —, posé juste sous celui de l’année fermée : les deux
       milieux se lisent côte à côte, pris sur le même retour le plus récent de
       chaque écran. Un lot vide le dit calmement. */
    lignes.push(
      [
        'Délai médian des retours datés du lot réuni des deux fenêtres fermées',
        String(delaiDeuxFenetres.n),
        delaiDeuxFenetres.n > 0
          ? `${nombre(delaiDeuxFenetres.mediane, 1)} jour(s) au milieu du lot de ${delaiDeuxFenetres.n} retour(s) daté(s) · à comparer au mois dernier : ${nombre(delaiMoisDernier.mediane, 1)} jour(s) · avant-dernier mois : ${nombre(delaiAvantDernierMois.mediane, 1)} jour(s)`
          : 'aucun retour daté sur les deux fenêtres fermées',
        delaiDeuxFenetres.n > 0
          ? `La moitié des retours datés des deux fenêtres fermées revient en ${nombre(delaiDeuxFenetres.mediane, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu sur les deux fenêtres fermées',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le milieu du lot réuni du mois dernier et du trimestre fermé, posé sous
       celui des deux fenêtres fermées : les deux fenêtres se lisent sur les
       mêmes retours — le dernier de chaque écran faisant foi —, et le mois
       dernier, déjà compté dans le trimestre, ne fait peser aucun écran deux
       fois. Un lot vide le dit calmement. */
    const delaiMoisDernierTrimestreFerme = delaisDeRetour(
      (item) =>
        estMoisDernier(item.retour, maintenant) ||
        estTrimestreFerme(item.retour, maintenant),
    );
    lignes.push(
      [
        'Délai médian des retours datés du lot réuni du mois dernier et du trimestre fermé',
        String(delaiMoisDernierTrimestreFerme.n),
        delaiMoisDernierTrimestreFerme.n > 0
          ? `${nombre(delaiMoisDernierTrimestreFerme.mediane, 1)} jour(s) au milieu du lot de ${delaiMoisDernierTrimestreFerme.n} retour(s) daté(s) · à comparer au mois dernier : ${nombre(delaiMoisDernier.mediane, 1)} jour(s) · trimestre fermé : ${nombre(delaiTrimestreFerme.mediane, 1)} jour(s)`
          : 'aucun retour daté sur le mois dernier ni le trimestre fermé',
        delaiMoisDernierTrimestreFerme.n > 0
          ? `La moitié des retours datés du mois dernier et du trimestre fermé revient en ${nombre(delaiMoisDernierTrimestreFerme.mediane, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu sur le mois dernier ni le trimestre fermé',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai médian du lot réuni de l’année fermée et de l’avant-dernier
       mois, posé juste sous celui du mois dernier et du trimestre fermé : le
       milieu se prend sur le même retour le plus récent de chaque écran, si
       bien qu’aucune ligne du fichier ne peut le contredire. Un lot vide le
       dit calmement. */
    lignes.push(
      [
        'Délai médian des retours datés du lot réuni de l’année fermée et de l’avant-dernier mois',
        String(delaiAnneeFermeeAvantDernierMois.n),
        delaiAnneeFermeeAvantDernierMois.n > 0
          ? `${nombre(delaiAnneeFermeeAvantDernierMois.mediane, 1)} jour(s) au milieu du lot de ${delaiAnneeFermeeAvantDernierMois.n} retour(s) daté(s) · à comparer à l’année fermée : ${nombre(delaiAnneeFermee.mediane, 1)} jour(s) · avant-dernier mois : ${nombre(delaiAvantDernierMois.mediane, 1)} jour(s)`
          : 'aucun retour daté sur l’année fermée ni l’avant-dernier mois',
        delaiAnneeFermeeAvantDernierMois.n > 0
          ? `La moitié des retours datés de l’année fermée et de l’avant-dernier mois revient en ${nombre(delaiAnneeFermeeAvantDernierMois.mediane, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu sur l’année fermée ni l’avant-dernier mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans revenus cette semaine dont le délai dépasse celui de la
       quinzaine, posés sous les deux lignes de délais : le retour lent se
       repère d'un même regard, sans comparer les semaines à la main. Le délai
       de la quinzaine se prend sur les mêmes retours datés que les lignes du
       dessus — un écran revenu deux fois n'y pesant qu'une fois, son retour
       le plus récent faisant foi. */
    const retoursQuinzaineDated = delaiSemaine.n + delaiSecondeSemaine.n;
    const delaiQuinzaine =
      retoursQuinzaineDated > 0
        ? (delaiSemaine.moyenne * delaiSemaine.n +
            delaiSecondeSemaine.moyenne * delaiSecondeSemaine.n) /
          retoursQuinzaineDated
        : 0;
    const retoursLentsSemaine = (() => {
      if (retoursQuinzaineDated === 0) return [];
      const derniers = new Map<string, EcranRetour>();
      retoursCarnet.forEach((item) => {
        if (!estSemaineEnCours(item.retour, maintenant)) return;
        const avant = derniers.get(item.ecran);
        if (
          !avant ||
          new Date(item.retour).getTime() > new Date(avant.retour).getTime()
        ) {
          derniers.set(item.ecran, item);
        }
      });
      return [...derniers.values()]
        .map((item) => ({
          ecran: item.ecran,
          retire: item.retire,
          retour: item.retour,
          jours: joursEntre(item.retire, item.retour),
        }))
        .filter((item) => item.jours > delaiQuinzaine)
        .sort(
          (a, b) =>
            b.jours - a.jours ||
            a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' }),
        );
    })();
    lignes.push(
      [
        'Écrans revenus cette semaine dont le délai dépasse celui de la quinzaine',
        String(retoursLentsSemaine.length),
        retoursQuinzaineDated > 0
          ? `délai de la quinzaine : ${nombre(delaiQuinzaine, 1)} jour(s) sur ${retoursQuinzaineDated} retour(s) · ${
              retoursLentsSemaine.length > 0
                ? 'retours plus lents que cette moyenne'
                : 'aucun retour plus lent que cette moyenne'
            }`
          : 'aucun retour daté dans la quinzaine',
        retoursLentsSemaine.length > 0
          ? retoursLentsSemaine
              .map(
                (item) =>
                  `${item.ecran} — ${item.jours} j (parti le ${jour(item.retire, lang)}, revenu le ${jour(item.retour, lang)})`,
              )
              .join(' · ')
          : 'aucun retour plus lent que la moyenne de la quinzaine',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans partis dans la quinzaine que rien n'a ramenés au carnet,
       posés sous les départs et les retours de la même fenêtre : le solde des
       deux semaines se lit d'un même regard — ce qui est parti, ce qui est
       revenu, ce qui manque encore. La fenêtre se compte en journées, comme
       les lignes au-dessus, et se lit sur les mêmes écrans. */
    const partisQuinzaine = ecransRepartisCsv.filter(
      (item) => joursEntre(item.retrait, maintenant.toISOString()) <= 15,
    );
    const jamaisRevenus = partisQuinzaine.filter(
      (item) =>
        !retoursCarnet.some(
          (retour) =>
            retour.ecran === item.ecran &&
            new Date(retour.retour).getTime() > new Date(item.retrait).getTime(),
        ),
    );
    lignes.push(
      [
        'Écrans partis dans la quinzaine et jamais revenus',
        String(jamaisRevenus.length),
        partisQuinzaine.length > 0
          ? `${partisQuinzaine.length - jamaisRevenus.length} revenu(s) sur ${partisQuinzaine.length} départ(s) · solde de la quinzaine`
          : 'aucun départ sur ces jours',
        jamaisRevenus.length > 0
          ? jamaisRevenus
              .map((item) => `${item.ecran} — ${jour(item.retrait, lang)}`)
              .join(' · ')
          : 'aucun écran parti n’attend encore son retour',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La synthèse des deux semaines, posée sous le solde de la quinzaine :
       départs, retours et solde de chaque semaine côte à côte, pour que la
       quinzaine se lise d'un seul tenant — ce qui est parti d'un côté, ce
       qui est revenu de l'autre, et ce qui manque encore. Les deux semaines
       se comptent sur les mêmes lignes que les blocs au-dessus : celle qui
       court jusqu'à sept journées, celle du huitième au quinzième. */
    const departsPremiereSemaine = ecransRepartisCsv.filter(
      (item) => joursEntre(item.retrait, maintenant.toISOString()) < 8,
    ).length;
    const retoursPremiereSemaine = delaiSemaine.n;
    const retoursDerniereSemaine = delaiSecondeSemaine.n;
    const soldePremiereSemaine = departsPremiereSemaine - retoursPremiereSemaine;
    const soldeDerniereSemaine = repartisSecondeSemaine.length - retoursDerniereSemaine;
    const departsQuinzaine = departsPremiereSemaine + repartisSecondeSemaine.length;
    const retoursQuinzaine = retoursPremiereSemaine + retoursDerniereSemaine;
    lignes.push(
      [
        'Synthèse des deux semaines de la quinzaine',
        String(departsQuinzaine),
        `solde ${departsQuinzaine - retoursQuinzaine} · ${retoursQuinzaine} retour(s) sur ${departsQuinzaine} départ(s)`,
        `Première semaine (jours 1 à 7) : ${departsPremiereSemaine} départ(s) · ${retoursPremiereSemaine} retour(s) · solde ${soldePremiereSemaine} — Seconde semaine (jours 8 à 15) : ${repartisSecondeSemaine.length} départ(s) · ${retoursDerniereSemaine} retour(s) · solde ${soldeDerniereSemaine}`,
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le nombre de retours tardifs de la quinzaine, posé sous la synthèse des
       deux semaines : les retours qui ont mis plus de sept journées à revenir,
       comptés sur les mêmes départs de la quinzaine et les mêmes retours datés
       que les lignes au-dessus — le retour le plus récent de chaque écran
       faisant foi, comme dans la ligne des délais. */
    const retoursDatesQuinzaine = partisQuinzaine
      .flatMap((item) => {
        const apres = retoursCarnet
          .filter(
            (retour) =>
              retour.ecran === item.ecran &&
              new Date(retour.retour).getTime() > new Date(item.retrait).getTime(),
          )
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (!retour) return [];
        return [
          {
            ecran: item.ecran,
            retrait: item.retrait,
            retour: retour.retour,
            jours: joursEntre(item.retrait, retour.retour),
          },
        ];
      })
      .sort(
        (a, b) =>
          b.jours - a.jours ||
          a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' }),
      );
    const retoursTardifsQuinzaine = retoursDatesQuinzaine.filter(
      (item) => item.jours > 7,
    );
    lignes.push(
      [
        'Retours tardifs de la quinzaine',
        String(retoursTardifsQuinzaine.length),
        partisQuinzaine.length > 0
          ? `${retoursTardifsQuinzaine.length} sur ${partisQuinzaine.length} départ(s) de la quinzaine · plus de sept journées entre le départ et le retour`
          : 'aucun départ sur ces jours',
        retoursTardifsQuinzaine.length > 0
          ? retoursTardifsQuinzaine
              .map(
                (item) =>
                  `${item.ecran} — ${item.jours} j (parti le ${jour(item.retrait, lang)}, revenu le ${jour(item.retour, lang)})`,
              )
              .join(' · ')
          : 'aucun retour tardif dans la quinzaine',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les retours rapides de la quinzaine, posés juste sous la ligne des
       retours tardifs : les deux se partagent le même lot de retours datés —
       partis dans les quinze derniers jours, revenus en sept journées ou
       moins —, si bien qu'aucune des deux lignes ne peut contredire l'autre.
       Le fichier dit ainsi, d'un même regard, ce qui revient vite et ce qui
       revient lentement. */
    const retoursRapidesQuinzaine = retoursDatesQuinzaine
      .filter((item) => item.jours <= 7)
      .sort(
        (a, b) =>
          a.jours - b.jours ||
          a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' }),
      );
    lignes.push(
      [
        'Retours rapides de la quinzaine',
        String(retoursRapidesQuinzaine.length),
        partisQuinzaine.length > 0
          ? `${retoursRapidesQuinzaine.length} sur ${partisQuinzaine.length} départ(s) de la quinzaine · sept journées ou moins entre le départ et le retour`
          : 'aucun départ sur ces jours',
        retoursRapidesQuinzaine.length > 0
          ? retoursRapidesQuinzaine
              .map(
                (item) =>
                  `${item.ecran} — ${item.jours} j (parti le ${jour(item.retrait, lang)}, revenu le ${jour(item.retour, lang)})`,
              )
              .join(' · ')
          : 'aucun retour rapide dans la quinzaine',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le poids des retours rapides et des retours tardifs réunis, posé sous
       les deux lignes : d'un même chiffre, la part de la quinzaine qui revient
       vite. Les deux lots se prennent sur la même liste de retours datés, si
       bien que leur somme ne peut pas contredire les lignes du dessus. */
    const retoursReunisQuinzaine = retoursDatesQuinzaine.length;
    const partRapideQuinzaine =
      retoursReunisQuinzaine > 0
        ? Math.round(
            (retoursRapidesQuinzaine.length / retoursReunisQuinzaine) * 100,
          )
        : 0;
    const partTardiveQuinzaine =
      retoursReunisQuinzaine > 0 ? 100 - partRapideQuinzaine : 0;
    lignes.push(
      [
        'Retours rapides et tardifs réunis',
        String(retoursReunisQuinzaine),
        retoursReunisQuinzaine > 0
          ? `${retoursRapidesQuinzaine.length} rapide(s) et ${retoursTardifsQuinzaine.length} tardif(s) · ${partRapideQuinzaine} % des retours datés de la quinzaine reviennent vite (sept journées ou moins), ${partTardiveQuinzaine} % plus lentement`
          : 'aucun retour daté dans la quinzaine',
        retoursReunisQuinzaine > 0
          ? retoursDatesQuinzaine
              .map(
                (item) =>
                  `${item.ecran} — ${item.jours} j (parti le ${jour(
                    item.retrait,
                    lang,
                  )}, revenu le ${jour(item.retour, lang)})`,
              )
              .join(' · ')
          : 'aucun retour daté dans la quinzaine',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans revenus après un départ déjà sorti de la quinzaine, posés
       juste sous la ligne des deux lots réunis : la fenêtre des quinze jours
       est passée de l'autre côté, et un retour a suivi ce départ-là. Le retour
       le plus récent de chaque écran fait foi, comme dans les lignes du dessus,
       si bien qu'aucun écran n'y pèse deux fois. */
    const retoursHorsQuinzaine = ecransRepartisCsv
      .filter(
        (item) => joursEntre(item.retrait, maintenant.toISOString()) > 15,
      )
      .flatMap((item) => {
        const apres = retoursCarnet
          .filter(
            (retour) =>
              retour.ecran === item.ecran &&
              new Date(retour.retour).getTime() > new Date(item.retrait).getTime(),
          )
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (!retour) return [];
        return [
          {
            ecran: item.ecran,
            retrait: item.retrait,
            retour: retour.retour,
            jours: joursEntre(item.retrait, retour.retour),
          },
        ];
      })
      .sort(
        (a, b) =>
          b.jours - a.jours ||
          a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' }),
      );
    lignes.push(
      [
        'Écrans revenus après un départ sorti de la quinzaine',
        String(retoursHorsQuinzaine.length),
        retoursHorsQuinzaine.length > 0
          ? `${retoursHorsQuinzaine.length} retour(s) sur un départ de plus de quinze jours · le retour le plus récent de chaque écran fait foi`
          : 'aucun retour après un départ sorti de la quinzaine',
        retoursHorsQuinzaine.length > 0
          ? retoursHorsQuinzaine
              .map(
                (item) =>
                  `${item.ecran} — ${item.jours} j (parti le ${jour(item.retrait, lang)}, revenu le ${jour(item.retour, lang)})`,
              )
              .join(' · ')
          : 'aucun écran revenu après un départ sorti de la quinzaine',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le poids des retours de plus de quinze jours dans tout l'historique des
       retours datés, posé juste sous la ligne qui les compte : le fichier dit
       ainsi quelle part de l'historique revient après la quinzaine, lue sur
       les mêmes écrans et le même retour le plus récent que la ligne du
       dessus — la part ne peut donc pas la contredire. */
    const retoursDatesHist = ecransRepartisCsv.flatMap((item) => {
      const apres = retoursCarnet
        .filter(
          (retour) =>
            retour.ecran === item.ecran &&
            new Date(retour.retour).getTime() > new Date(item.retrait).getTime(),
        )
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour) return [];
      return [
        {
          ecran: item.ecran,
          retrait: item.retrait,
          retour: retour.retour,
          jours: joursEntre(item.retrait, retour.retour),
        },
      ];
    });
    const partHorsQuinzaineHist =
      retoursDatesHist.length > 0
        ? Math.round(
            (retoursHorsQuinzaine.length / retoursDatesHist.length) * 100,
          )
        : 0;
    lignes.push(
      [
        'Retours de plus de quinze jours dans tout l’historique des retours datés',
        String(retoursHorsQuinzaine.length),
        retoursDatesHist.length > 0
          ? `${retoursHorsQuinzaine.length} sur ${retoursDatesHist.length} retour(s) daté(s) de l’historique · ${partHorsQuinzaineHist} % de tout l’historique revient après la quinzaine`
          : 'aucun retour daté dans l’historique',
        retoursHorsQuinzaine.length > 0
          ? retoursHorsQuinzaine
              .map(
                (item) =>
                  `${item.ecran} — ${item.jours} j (parti le ${jour(item.retrait, lang)}, revenu le ${jour(item.retour, lang)})`,
              )
              .join(' · ')
          : 'aucun retour de plus de quinze jours',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans sans aucune date de retour, pesés dans tout le carnet :
       la ligne dit quelle part du carnet n’a jamais daté de retour, lue sur
       les mêmes écrans que le jeton « Aucun retour daté » — aucun écran ne
       peut donc y figurer d’un côté et manquer de l’autre. */
    const ecransSansDate = ecransRepartisCsv.filter(
      (item) => !retoursCarnet.some((retour) => retour.ecran === item.ecran),
    );
    const partSansDate =
      ecransRepartisCsv.length > 0
        ? Math.round((ecransSansDate.length / ecransRepartisCsv.length) * 100)
        : 0;
    lignes.push(
      [
        'Écrans sans aucune date de retour dans tout le carnet',
        String(ecransSansDate.length),
        ecransRepartisCsv.length > 0
          ? `${ecransSansDate.length} sur ${ecransRepartisCsv.length} écran(s) du carnet n’ont jamais daté de retour · ${partSansDate} % du carnet`
          : 'le carnet est vide',
        ecransSansDate.length > 0
          ? ecransSansDate
              .map((item) => `${item.ecran} — ${jour(item.retrait, lang)}`)
              .join(' · ')
          : 'chaque écran du carnet porte une date de retour',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans à retours datés représentent dans tout le
       carnet, posée juste sous celle des écrans sans date : les deux lignes
       se complètent et se lisent sur la même liste d’écrans, si bien que
       l’une ne peut pas contredire l’autre. */
    const ecransAvecDate = ecransRepartisCsv.filter((item) =>
      retoursCarnet.some((retour) => retour.ecran === item.ecran),
    );
    const partAvecDate =
      ecransRepartisCsv.length > 0
        ? Math.round((ecransAvecDate.length / ecransRepartisCsv.length) * 100)
        : 0;
    lignes.push(
      [
        'Écrans à retours datés dans tout le carnet',
        String(ecransAvecDate.length),
        ecransRepartisCsv.length > 0
          ? `${ecransAvecDate.length} sur ${ecransRepartisCsv.length} écran(s) du carnet portent au moins une date de retour · ${partAvecDate} % du carnet`
          : 'le carnet est vide',
        ecransAvecDate.length > 0
          ? ecransAvecDate
              .map((item) => `${item.ecran} — ${jour(item.retrait, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet ne porte de date de retour',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans à retours datés du mois représentent dans tout
       le carnet, posée juste sous celle de tous les retours datés : les deux
       lignes se lisent sur la même liste d’écrans — le retour le plus récent
       de chacun faisant foi —, si bien que l’une ne peut pas contredire
       l’autre. Un carnet vide ne se divise pas, et le dit calmement. */
    const ecransRetoursDatesMoisCsv = ecransRepartisCsv.flatMap((item) => {
      const apres = retoursCarnet
        .filter((retour) => retour.ecran === item.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour || !estMoisEnCours(retour.retour)) return [];
      return [{ ...item, retour: retour.retour }];
    });
    const partRetoursDatesMois =
      ecransRepartisCsv.length > 0
        ? Math.round((ecransRetoursDatesMoisCsv.length / ecransRepartisCsv.length) * 100)
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du mois dans tout le carnet',
        String(ecransRetoursDatesMoisCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesMoisCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus ce mois-ci avec une date · ${partRetoursDatesMois} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesMoisCsv.length > 0
          ? ecransRetoursDatesMoisCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date ce mois-ci',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans à retours datés du mois dernier représentent dans
       tout le carnet, posée juste sous celle du mois en cours : deux fenêtres
       qui se suivent, lues sur la même liste d’écrans — le retour le plus
       récent de chacun faisant foi —, si bien qu’aucune ligne ne peut
       contredire l’autre. Un carnet vide ne se divise pas. */
    const ecransRetoursDatesMoisDernierCsv = ecransRepartisCsv.flatMap((item) => {
      const apres = retoursCarnet
        .filter((retour) => retour.ecran === item.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour || !estMoisDernier(retour.retour)) return [];
      return [{ ...item, retour: retour.retour }];
    });
    const partRetoursDatesMoisDernier =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesMoisDernierCsv.length / ecransRepartisCsv.length) * 100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du mois dernier dans tout le carnet',
        String(ecransRetoursDatesMoisDernierCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesMoisDernierCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus le mois dernier avec une date · ${partRetoursDatesMoisDernier} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesMoisDernierCsv.length > 0
          ? ecransRetoursDatesMoisDernierCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date le mois dernier',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part des écrans à retours datés de l’avant-dernier mois, posée sous
       celle du mois dernier : la seconde fenêtre fermée se lit à côté de la
       première, prise sur les mêmes écrans et le même retour le plus récent.
       Un carnet vide ne se divise pas, et le dit calmement. */
    const ecransRetoursDatesAvantDernierMoisCsv = ecransRepartisCsv.flatMap(
      (item) => {
        const apres = retoursCarnet
          .filter((retour) => retour.ecran === item.ecran)
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (!retour || !estAvantDernierMois(retour.retour)) return [];
        return [{ ...item, retour: retour.retour }];
      },
    );
    const partRetoursDatesAvantDernierMois =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesAvantDernierMoisCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés de l’avant-dernier mois dans tout le carnet',
        String(ecransRetoursDatesAvantDernierMoisCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesAvantDernierMoisCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus l’avant-dernier mois avec une date · ${partRetoursDatesAvantDernierMois} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesAvantDernierMoisCsv.length > 0
          ? ecransRetoursDatesAvantDernierMoisCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date l’avant-dernier mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans du lot réuni des deux derniers mois fermés —
       l’avant-dernier mois et l’année fermée — représentent dans tout le
       carnet, posée juste sous celle de l’avant-dernier mois : la ligne se
       lit sur la même liste d’écrans et le même retour le plus récent que
       les deux fenêtres, si bien qu’elle ne peut pas les contredire. Les
       deux fenêtres se recouvrant, aucun écran n’y pèse deux fois. Un carnet
       vide ne se divise pas, et le dit calmement. */
    const ecransRetoursDatesDeuxMoisFermesCsv = ecransRepartisCsv.flatMap(
      (item) => {
        const apres = retoursCarnet
          .filter((retour) => retour.ecran === item.ecran)
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (
          !retour ||
          (!estAvantDernierMois(retour.retour, maintenant) &&
            !estAnneeFermee(retour.retour, maintenant))
        ) {
          return [];
        }
        return [{ ...item, retour: retour.retour }];
      },
    );
    const partRetoursDatesDeuxMoisFermes =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesDeuxMoisFermesCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du lot réuni des deux derniers mois fermés dans tout le carnet',
        String(ecransRetoursDatesDeuxMoisFermesCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesDeuxMoisFermesCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus sur l’avant-dernier mois ou l’année fermée avec une date · ${partRetoursDatesDeuxMoisFermes} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesDeuxMoisFermesCsv.length > 0
          ? ecransRetoursDatesDeuxMoisFermesCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date sur l’avant-dernier mois ni l’année fermée',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans à retours datés du trimestre représentent dans
       tout le carnet, posée juste sous celle du mois : les deux lignes se
       lisent sur la même liste d’écrans — le retour le plus récent de chacun
       faisant foi —, si bien que l’une ne peut pas contredire l’autre. Un
       carnet vide ne se divise pas, et le dit calmement. */
    const depuisTrimestrePart = new Date(maintenant);
    depuisTrimestrePart.setMonth(depuisTrimestrePart.getMonth() - 3);
    depuisTrimestrePart.setHours(0, 0, 0, 0);
    const ecransRetoursDatesTrimestreCsv = ecransRepartisCsv.flatMap((item) => {
      const apres = retoursCarnet
        .filter((retour) => retour.ecran === item.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour) return [];
      if (new Date(retour.retour).getTime() < depuisTrimestrePart.getTime()) {
        return [];
      }
      return [{ ...item, retour: retour.retour }];
    });
    const partRetoursDatesTrimestre =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesTrimestreCsv.length / ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du trimestre dans tout le carnet',
        String(ecransRetoursDatesTrimestreCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesTrimestreCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus ces trois derniers mois avec une date · ${partRetoursDatesTrimestre} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesTrimestreCsv.length > 0
          ? ecransRetoursDatesTrimestreCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date ces trois derniers mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans à retours datés du trimestre fermé représentent
       dans tout le carnet, posée juste sous celle du trimestre : les deux
       lignes se lisent sur la même liste d’écrans — le retour le plus récent
       de chacun faisant foi —, si bien que l’une ne peut pas contredire
       l’autre. Le mois en cours reste dehors, là où la ligne du trimestre le
       prend encore. Un carnet vide ne se divise pas. */
    const ecransRetoursDatesTrimestreFermeCsv = ecransRepartisCsv.flatMap((item) => {
      const apres = retoursCarnet
        .filter((retour) => retour.ecran === item.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour || !estTrimestreFerme(retour.retour, maintenant)) return [];
      return [{ ...item, retour: retour.retour }];
    });
    const partRetoursDatesTrimestreFerme =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesTrimestreFermeCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du trimestre fermé dans tout le carnet',
        String(ecransRetoursDatesTrimestreFermeCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesTrimestreFermeCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus sur les trois mois fermés avec une date · ${partRetoursDatesTrimestreFerme} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesTrimestreFermeCsv.length > 0
          ? ecransRetoursDatesTrimestreFermeCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date sur les trois mois fermés',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans du lot réuni de l’avant-dernier mois et du
       trimestre fermé représentent dans tout le carnet, posée juste sous celle
       du trimestre fermé : la ligne se lit sur la même liste d’écrans et le
       même retour le plus récent, si bien qu’elle ne peut pas contredire celles
       du dessus. L’avant-dernier mois étant déjà contenu dans le trimestre, un
       écran déjà nommé n’y pèse pas deux fois. Un carnet vide ne se divise
       pas, et le dit calmement. */
    const ecransRetoursDatesAvantDernierMoisTrimestreFermeCsv =
      ecransRepartisCsv.flatMap((item) => {
        const apres = retoursCarnet
          .filter((retour) => retour.ecran === item.ecran)
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (
          !retour ||
          (!estAvantDernierMois(retour.retour, maintenant) &&
            !estTrimestreFerme(retour.retour, maintenant))
        ) {
          return [];
        }
        return [{ ...item, retour: retour.retour }];
      });
    const partRetoursDatesAvantDernierMoisTrimestreFerme =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesAvantDernierMoisTrimestreFermeCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du lot réuni de l’avant-dernier mois et du trimestre fermé dans tout le carnet',
        String(ecransRetoursDatesAvantDernierMoisTrimestreFermeCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesAvantDernierMoisTrimestreFermeCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus sur l’avant-dernier mois ou le trimestre fermé avec une date · ${partRetoursDatesAvantDernierMoisTrimestreFerme} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesAvantDernierMoisTrimestreFermeCsv.length > 0
          ? ecransRetoursDatesAvantDernierMoisTrimestreFermeCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date sur l’avant-dernier mois ni le trimestre fermé',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans à retours datés de l’année fermée représentent
       dans tout le carnet, posée juste sous celle du trimestre fermé : les
       deux lignes se lisent sur la même liste d’écrans — le retour le plus
       récent de chacun faisant foi —, si bien que l’une ne peut pas
       contredire l’autre. Le mois en cours reste dehors, là où la ligne de
       l’année le prend encore. Un carnet vide ne se divise pas. */
    const ecransRetoursDatesAnneeFermeeCsv = ecransRepartisCsv.flatMap((item) => {
      const apres = retoursCarnet
        .filter((retour) => retour.ecran === item.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour || !estAnneeFermee(retour.retour, maintenant)) return [];
      return [{ ...item, retour: retour.retour }];
    });
    const partRetoursDatesAnneeFermee =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesAnneeFermeeCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés de l’année fermée dans tout le carnet',
        String(ecransRetoursDatesAnneeFermeeCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesAnneeFermeeCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus sur les douze mois fermés avec une date · ${partRetoursDatesAnneeFermee} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesAnneeFermeeCsv.length > 0
          ? ecransRetoursDatesAnneeFermeeCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date sur les douze mois fermés',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans que l’année fermée nomme seule, pesés dans tout le carnet :
       ceux dont le retour le plus récent tombe sur les douze mois fermés sans
       tomber dans aucune des fenêtres plus proches de la série — ni le
       trimestre fermé, ni le mois dernier, ni l’avant-dernier mois, ni la
       semaine. La ligne se lit sur la même liste d’écrans que le jeton du
       dépli, si bien qu’elle ne peut pas le contredire. Un carnet vide ne se
       divise pas, et le dit calmement. */
    const ecransRetoursDatesAnneeFermeeSeuleCsv = ecransRetoursDatesAnneeFermeeCsv.filter(
      (item) =>
        !estMoisEnCours(item.retour, maintenant) &&
        !estMoisDernier(item.retour, maintenant) &&
        !estAvantDernierMois(item.retour, maintenant) &&
        !estTrimestreFerme(item.retour, maintenant) &&
        !estSemaineEnCours(item.retour, maintenant),
    );
    const partRetoursDatesAnneeFermeeSeule =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesAnneeFermeeSeuleCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés que l’année fermée nomme seule dans tout le carnet',
        String(ecransRetoursDatesAnneeFermeeSeuleCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesAnneeFermeeSeuleCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet ne sont revenus que sur les douze mois fermés, hors de ses fenêtres plus proches · ${partRetoursDatesAnneeFermeeSeule} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesAnneeFermeeSeuleCsv.length > 0
          ? ecransRetoursDatesAnneeFermeeSeuleCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date que l’année fermée nomme seule',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Ce que le trimestre en cours ajoute seul, posé juste sous la ligne de ce
       que l’année fermée ajoute seule : les deux additions se comparent d’un
       même regard. La ligne se lit sur la même liste d’écrans et le même
       retour le plus récent que le jeton du dépli — ni l’année fermée ni son
       trimestre fermé ne retiennent ces écrans-là —, si bien qu’elle ne peut
       pas la contredire. Un carnet vide ne se divise pas, et le dit
       calmement. */
    const ecransRetoursDatesTrimestreSeuleCsv = ecransRetoursDatesTrimestreCsv.filter(
      (item) =>
        !estAnneeFermee(item.retour, maintenant) &&
        !estTrimestreFerme(item.retour, maintenant),
    );
    const partRetoursDatesTrimestreSeule =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesTrimestreSeuleCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés que le trimestre en cours ajoute seul dans tout le carnet',
        String(ecransRetoursDatesTrimestreSeuleCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesTrimestreSeuleCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus sur ces trois derniers mois, hors de l’année fermée et de son trimestre fermé · ${partRetoursDatesTrimestreSeule} % du carnet · à comparer à ce que l’année fermée ajoute seule (${ecransRetoursDatesAnneeFermeeSeuleCsv.length})`
          : 'le carnet est vide',
        ecransRetoursDatesTrimestreSeuleCsv.length > 0
          ? ecransRetoursDatesTrimestreSeuleCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date que le trimestre en cours ajoute seul',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai médian de ce que le trimestre en cours ajoute seul, posé juste
       sous sa part : le même retour le plus récent de chaque écran fait foi,
       si bien que la ligne ne peut pas contredire celle du dessus. Un lot vide
       le dit calmement, et les deux additions se comparent d’un même regard. */
    const delaisTrimestreSeule = ecransRetoursDatesTrimestreSeuleCsv.map((item) =>
      joursEntre(item.retrait, item.retour),
    );
    const medianeTrimestreSeule = mediane(delaisTrimestreSeule);
    lignes.push(
      [
        'Délai médian des retours datés des écrans que le trimestre en cours ajoute seul',
        String(ecransRetoursDatesTrimestreSeuleCsv.length),
        ecransRetoursDatesTrimestreSeuleCsv.length > 0
          ? `${nombre(medianeTrimestreSeule, 1)} jour(s) au milieu du lot de ${ecransRetoursDatesTrimestreSeuleCsv.length} retour(s) daté(s) · à comparer à ce que l’année fermée ajoute seule (${ecransRetoursDatesAnneeFermeeSeuleCsv.length} écran(s))`
          : 'aucun retour daté sur ces écrans',
        ecransRetoursDatesTrimestreSeuleCsv.length > 0
          ? `La moitié revient en ${nombre(medianeTrimestreSeule, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu avec une date que le trimestre en cours ajoute seul',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans au-delà du milieu réuni représentent dans tout le
       carnet, posée juste sous le milieu du trimestre seul : les deux additions
       — ce que l’année fermée nomme seule et ce que le trimestre en cours
       ajoute seul — sont réunies sur la même liste, dédoublonnée par écran, et
       leur milieu se prend sur le même retour le plus récent de chacun. La
       ligne ne peut donc pas contredire celles du dessus ; un lot vide ne se
       divise pas, et le dit calmement. */
    const ecransDeuxAdditionsCsv: {
      ecran: string;
      retrait: string;
      retour: string;
    }[] = [];
    const vusDeuxAdditions = new Set<string>();
    [
      ...ecransRetoursDatesAnneeFermeeSeuleCsv,
      ...ecransRetoursDatesTrimestreSeuleCsv,
    ].forEach((item) => {
      if (vusDeuxAdditions.has(item.ecran)) return;
      vusDeuxAdditions.add(item.ecran);
      ecransDeuxAdditionsCsv.push(item);
    });
    const medianeDeuxAdditions = mediane(
      ecransDeuxAdditionsCsv.map((item) => joursEntre(item.retrait, item.retour)),
    );
    const ecransAuDelaMilieuReuniCsv = ecransDeuxAdditionsCsv.filter(
      (item) => joursEntre(item.retrait, item.retour) > medianeDeuxAdditions,
    );
    const partAuDelaMilieuReuni =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransAuDelaMilieuReuniCsv.length / ecransRepartisCsv.length) * 100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés des deux additions au-delà du milieu réuni dans tout le carnet',
        String(ecransAuDelaMilieuReuniCsv.length),
        ecransRepartisCsv.length > 0
          ? ecransAuDelaMilieuReuniCsv.length > 0
            ? `${ecransAuDelaMilieuReuniCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet dépassent le milieu du lot réuni des deux additions — ${nombre(medianeDeuxAdditions, 1)} jour(s) sur ${ecransDeuxAdditionsCsv.length} retour(s) daté(s) · ${partAuDelaMilieuReuni} % du carnet · à comparer au milieu du trimestre seul : ${nombre(medianeTrimestreSeule, 1)} jour(s)`
            : `aucun écran des deux additions ne dépasse le milieu du lot réuni — ${nombre(medianeDeuxAdditions, 1)} jour(s) sur ${ecransDeuxAdditionsCsv.length} retour(s) daté(s) · à comparer au milieu du trimestre seul : ${nombre(medianeTrimestreSeule, 1)} jour(s)`
          : 'le carnet est vide',
        ecransAuDelaMilieuReuniCsv.length > 0
          ? ecransAuDelaMilieuReuniCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du carnet, parmi les deux additions, ne dépasse le milieu du lot réuni',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans au-delà du milieu réuni revenus cette semaine, posés juste
       sous leur part : la fenêtre la plus proche se pèse d’un même regard, et
       son milieu se lit à côté de celui du lot réuni — les deux chiffres se
       prennent sur les mêmes lignes, le retour le plus récent de chaque écran
       faisant foi. Un lot vide le dit calmement. */
    const ecransAuDelaMilieuReuniSemaineCsv = ecransAuDelaMilieuReuniCsv.filter(
      (item) => estSemaineEnCours(item.retour, maintenant),
    );
    const medianeAuDelaMilieuReuniSemaine = mediane(
      ecransAuDelaMilieuReuniSemaineCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    lignes.push(
      [
        'Écrans à retours datés des deux additions au-delà du milieu réuni revenus cette semaine',
        String(ecransAuDelaMilieuReuniSemaineCsv.length),
        ecransAuDelaMilieuReuniCsv.length > 0
          ? ecransAuDelaMilieuReuniSemaineCsv.length > 0
            ? `${ecransAuDelaMilieuReuniSemaineCsv.length} sur ${ecransAuDelaMilieuReuniCsv.length} écran(s) au-delà du milieu réuni sont revenus cette semaine · délai médian ${nombre(
                medianeAuDelaMilieuReuniSemaine,
                1,
              )} jour(s) sur ${ecransAuDelaMilieuReuniSemaineCsv.length} retour(s) daté(s) · à comparer au milieu du lot réuni : ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s)`
            : `aucun écran au-delà du milieu réuni n’est revenu cette semaine · à comparer au milieu du lot réuni : ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s)`
          : 'le carnet est vide',
        ecransAuDelaMilieuReuniSemaineCsv.length > 0
          ? ecransAuDelaMilieuReuniSemaineCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran, parmi ceux au-delà du milieu réuni, n’est revenu cette semaine',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le verdict entre la semaine et le lot réuni, posé juste sous la ligne de
       la semaine : les deux milieux se lisent côte à côte, puis la phrase qui
       tranche. Les deux chiffres se prennent sur les mêmes lignes que les deux
       jetons — le retour le plus récent de chaque écran fait foi —, si bien
       qu’aucune ligne du fichier ne peut les contredire. Une semaine vide ne
       se compare pas : elle le dit plutôt que d’inventer un milieu. */
    const verdictSemaineLotReuni =
      ecransAuDelaMilieuReuniSemaineCsv.length === 0
        ? 'la semaine ne retient rien, le lot réuni parle seul'
        : medianeAuDelaMilieuReuniSemaine === medianeDeuxAdditions
          ? 'les deux milieux se valent'
          : medianeAuDelaMilieuReuniSemaine < medianeDeuxAdditions
            ? 'la semaine ramène plus vite'
            : 'le lot réuni ramène plus vite';
    lignes.push(
      [
        'Verdict entre la semaine et le lot réuni',
        String(ecransAuDelaMilieuReuniSemaineCsv.length),
        ecransAuDelaMilieuReuniSemaineCsv.length > 0
          ? `${nombre(
              medianeAuDelaMilieuReuniSemaine,
              1,
            )} jour(s) au milieu de la semaine (${ecransAuDelaMilieuReuniSemaineCsv.length} retour(s) daté(s)) contre ${nombre(
              medianeDeuxAdditions,
              1,
            )} jour(s) pour le lot réuni (${ecransAuDelaMilieuReuniCsv.length} retour(s)) · ${verdictSemaineLotReuni}`
          : `aucun écran de la semaine à comparer · milieu du lot réuni : ${nombre(
              medianeDeuxAdditions,
              1,
            )} jour(s) sur ${ecransAuDelaMilieuReuniCsv.length} retour(s) daté(s)`,
        ecransAuDelaMilieuReuniSemaineCsv.length > 0
          ? ecransAuDelaMilieuReuniSemaineCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran de la semaine au-delà du milieu réuni',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans de la semaine revenus plus vite que le milieu du lot réuni,
       posés juste sous leur part : la ligne reprend la même liste que le jeton
       — le délai de chaque écran de la semaine comparé au milieu du lot réuni
       —, si bien que les deux ne peuvent pas se contredire. Une semaine vide
       le dit calmement, plutôt que d’inventer un lot. */
    const ecransSemainePlusRapideCsv = ecransAuDelaMilieuReuniSemaineCsv.filter(
      (item) => joursEntre(item.retrait, item.retour) < medianeDeuxAdditions,
    );
    const medianeSemainePlusRapide = mediane(
      ecransSemainePlusRapideCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    lignes.push(
      [
        'Écrans à retours datés de la semaine plus rapides que le milieu du lot réuni',
        String(ecransSemainePlusRapideCsv.length),
        ecransAuDelaMilieuReuniSemaineCsv.length === 0
          ? 'la semaine ne retient rien, il n’y a pas de lot à départager'
          : ecransSemainePlusRapideCsv.length > 0
            ? `${ecransSemainePlusRapideCsv.length} sur ${ecransAuDelaMilieuReuniSemaineCsv.length} écran(s) de la semaine reviennent plus vite que le milieu du lot réuni · délai médian ${nombre(
                medianeSemainePlusRapide,
                1,
              )} jour(s) sur ${ecransSemainePlusRapideCsv.length} retour(s) daté(s) · à comparer au milieu du lot réuni : ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s)`
            : `aucun écran de la semaine ne revient plus vite que le milieu du lot réuni — ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s) sur ${ecransDeuxAdditionsCsv.length} retour(s) daté(s)`,
        ecransSemainePlusRapideCsv.length > 0
          ? ecransSemainePlusRapideCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran de la semaine ne devance le milieu du lot réuni',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton réuni : la semaine rapide et le reste du lot réuni
       posés côte à côte, chacun avec son milieu — les mêmes écrans que la
       ligne du dessus, le retour le plus récent de chaque écran faisant foi,
       si bien qu’aucune ligne du fichier ne peut les contredire. Une semaine
       vide ne se divise pas : elle le dit plutôt que d’inventer un milieu. */
    const ecransSemaineRapideReunisCsv = ecransAuDelaMilieuReuniSemaineCsv.filter(
      (item) => joursEntre(item.retrait, item.retour) < medianeDeuxAdditions,
    );
    const vusSemaineRapideReunis = new Set(
      ecransSemaineRapideReunisCsv.map((item) => item.ecran),
    );
    const ecransSemaineResteLotReuniCsv = ecransAuDelaMilieuReuniCsv.filter(
      (item) => !vusSemaineRapideReunis.has(item.ecran),
    );
    const medianeSemaineRapideReunis = mediane(
      ecransSemaineRapideReunisCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    const medianeSemaineResteLotReuni = mediane(
      ecransSemaineResteLotReuniCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    lignes.push(
      [
        'Écrans à retours datés du lot réuni — semaine rapide et reste du lot côte à côte',
        String(ecransAuDelaMilieuReuniCsv.length),
        ecransAuDelaMilieuReuniCsv.length > 0
          ? `semaine rapide : ${ecransSemaineRapideReunisCsv.length} écran(s), milieu ${nombre(
              medianeSemaineRapideReunis,
              1,
            )} jour(s) · reste du lot réuni : ${ecransSemaineResteLotReuniCsv.length} écran(s), milieu ${nombre(
              medianeSemaineResteLotReuni,
              1,
            )} jour(s) · à comparer au milieu du lot réuni : ${nombre(
              medianeDeuxAdditions,
              1,
            )} jour(s)`
          : `aucun écran à réunir · milieu du lot réuni : ${nombre(
              medianeDeuxAdditions,
              1,
            )} jour(s) sur ${ecransDeuxAdditionsCsv.length} retour(s) daté(s)`,
        ecransAuDelaMilieuReuniCsv.length > 0
          ? ecransAuDelaMilieuReuniCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran à réunir',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton du reste du lot réuni, posée juste sous celle du lot
       réuni : ses écrans et son propre milieu se lisent d'un même regard, le
       retour le plus récent de chaque écran faisant foi — si bien qu'aucune
       ligne du fichier ne peut la contredire. Un lot sans reste le dit
       calmement plutôt que d'inventer un milieu. */
    lignes.push(
      [
        'Écrans à retours datés du reste du lot réuni',
        String(ecransSemaineResteLotReuniCsv.length),
        ecransDeuxAdditionsCsv.length > 0
          ? ecransSemaineResteLotReuniCsv.length > 0
            ? `${ecransSemaineResteLotReuniCsv.length} sur ${ecransAuDelaMilieuReuniCsv.length} écran(s) du lot réuni restent une fois la semaine rapide lue · délai médian ${nombre(
                medianeSemaineResteLotReuni,
                1,
              )} jour(s) sur ${ecransSemaineResteLotReuniCsv.length} retour(s) daté(s) · à comparer au milieu du lot réuni : ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s)`
            : `aucun écran du lot réuni ne reste après la semaine rapide · milieu du lot réuni : ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s)`
          : 'le carnet est vide',
        ecransSemaineResteLotReuniCsv.length > 0
          ? ecransSemaineResteLotReuniCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du lot réuni ne reste après la semaine rapide',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton du reste revenu avant le milieu réuni, posée juste sous
       son milieu : parmi les écrans du reste, ceux qui devancent le milieu du
       lot réuni, avec leur propre milieu — les mêmes écrans que la ligne du
       dessus, le retour le plus récent de chaque écran faisant foi, si bien
       qu'aucune ligne du fichier ne peut les contredire. Un reste sans écran
       avant le milieu le dit calmement plutôt que d'inventer un partage. */
    const ecransResteAvantMilieuCsv = ecransSemaineResteLotReuniCsv.filter(
      (item) => joursEntre(item.retrait, item.retour) < medianeDeuxAdditions,
    );
    const medianeResteAvantMilieu = mediane(
      ecransResteAvantMilieuCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    lignes.push(
      [
        'Écrans à retours datés du reste du lot réuni avant le milieu',
        String(ecransResteAvantMilieuCsv.length),
        ecransSemaineResteLotReuniCsv.length === 0
          ? 'aucun écran du reste à partager · le lot réuni se lit seul'
          : ecransResteAvantMilieuCsv.length > 0
            ? `${ecransResteAvantMilieuCsv.length} sur ${ecransSemaineResteLotReuniCsv.length} écran(s) du reste reviennent avant le milieu du lot réuni · délai médian ${nombre(
                medianeResteAvantMilieu,
                1,
              )} jour(s) sur ${ecransResteAvantMilieuCsv.length} retour(s) daté(s) · à comparer au milieu du lot réuni : ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s)`
            : `aucun écran du reste ne revient avant le milieu du lot réuni — ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s)`,
        ecransResteAvantMilieuCsv.length > 0
          ? ecransResteAvantMilieuCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du reste ne devance le milieu du lot réuni',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton réuni du reste, posée juste sous celle du reste avant
       le milieu : ses deux parts et leurs milieux se lisent côte à côte, si
       bien que le partage se juge d’un même regard. Les deux parts se prennent
       sur la même liste que le jeton et que la ligne du dessus — le retour le
       plus récent de chaque écran fait foi —, et un reste vide le dit
       calmement plutôt que d’inventer deux milieux. */
    const ecransResteApresMilieuCsv = ecransSemaineResteLotReuniCsv.filter(
      (item) => joursEntre(item.retrait, item.retour) >= medianeDeuxAdditions,
    );
    const medianeResteApresMilieu = mediane(
      ecransResteApresMilieuCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    lignes.push(
      [
        'Écrans à retours datés du reste réuni — avant et après le milieu côte à côte',
        String(ecransSemaineResteLotReuniCsv.length),
        ecransSemaineResteLotReuniCsv.length === 0
          ? 'aucun écran du reste à réunir · le lot réuni se lit seul'
          : `avant le milieu : ${ecransResteAvantMilieuCsv.length} écran(s), milieu ${nombre(
              medianeResteAvantMilieu,
              1,
            )} jour(s) · après le milieu : ${ecransResteApresMilieuCsv.length} écran(s), milieu ${nombre(
              medianeResteApresMilieu,
              1,
            )} jour(s) · à comparer au milieu du lot réuni : ${nombre(
              medianeDeuxAdditions,
              1,
            )} jour(s)`,
        ecransSemaineResteLotReuniCsv.length > 0
          ? [...ecransResteAvantMilieuCsv, ...ecransResteApresMilieuCsv]
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du reste à réunir',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton du reste revenu après le milieu, posée juste sous son
       milieu : ses écrans et son propre milieu se lisent d'un même regard — le
       complément exact de la part d'avant, pris sur la même liste du reste, si
       bien qu'aucune ligne du fichier ne peut la contredire. Un reste sans
       écran après le milieu le dit calmement plutôt que d'inventer un
       milieu. */
    lignes.push(
      [
        'Écrans à retours datés du reste du lot réuni après le milieu',
        String(ecransResteApresMilieuCsv.length),
        ecransSemaineResteLotReuniCsv.length === 0
          ? 'aucun écran du reste à partager · le lot réuni se lit seul'
          : ecransResteApresMilieuCsv.length > 0
            ? `${ecransResteApresMilieuCsv.length} sur ${ecransSemaineResteLotReuniCsv.length} écran(s) du reste atteignent ou dépassent le milieu du lot réuni · délai médian ${nombre(
                medianeResteApresMilieu,
                1,
              )} jour(s) sur ${ecransResteApresMilieuCsv.length} retour(s) daté(s) · à comparer au milieu du lot réuni : ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s)`
            : `aucun écran du reste n'atteint le milieu du lot réuni — ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s)`,
        ecransResteApresMilieuCsv.length > 0
          ? ecransResteApresMilieuCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du reste n’atteint le milieu du lot réuni',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton qui réunit les trois parts du reste, posée juste sous
       celle du reste après le milieu : l'avant, le milieu exact et l'après se
       lisent côte à côte, chacun avec son compte et son propre milieu. Les
       trois parts se prennent sur la même liste du reste — le retour le plus
       récent de chaque écran fait foi —, si bien qu'aucune ligne du fichier
       ne peut les contredire. Un milieu sans personne le dit calmement plutôt
       que d'inventer un chiffre. */
    const ecransResteMilieuExactCsv = ecransSemaineResteLotReuniCsv.filter(
      (item) => joursEntre(item.retrait, item.retour) === medianeDeuxAdditions,
    );
    const ecransResteApresStrictCsv = ecransSemaineResteLotReuniCsv.filter(
      (item) => joursEntre(item.retrait, item.retour) > medianeDeuxAdditions,
    );
    const medianeResteMilieuExact = mediane(
      ecransResteMilieuExactCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    const medianeResteApresStrict = mediane(
      ecransResteApresStrictCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    /* Le milieu commun des trois parts réunies — l’avant, le milieu exact et
       l’après —, posé à côté de celui du lot réuni : les trois parts se
       prennent sur la même liste du reste, le retour le plus récent de chaque
       écran faisant foi, si bien qu’aucune ligne du fichier ne peut le
       contredire. Un reste vide ne se divise pas, et le dit calmement. */
    const ecransResteTroisPartsCsv = [
      ...ecransResteAvantMilieuCsv,
      ...ecransResteMilieuExactCsv,
      ...ecransResteApresStrictCsv,
    ];
    const medianeResteTroisParts = mediane(
      ecransResteTroisPartsCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    lignes.push(
      [
        'Écrans à retours datés du reste réuni — avant, au milieu et après côte à côte',
        String(ecransSemaineResteLotReuniCsv.length),
        ecransSemaineResteLotReuniCsv.length === 0
          ? 'aucun écran du reste à réunir · le lot réuni se lit seul'
          : [
              `avant le milieu : ${ecransResteAvantMilieuCsv.length} écran(s), milieu ${nombre(
                medianeResteAvantMilieu,
                1,
              )} jour(s)`,
              ecransResteMilieuExactCsv.length > 0
                ? `au milieu : ${ecransResteMilieuExactCsv.length} écran(s), milieu ${nombre(
                    medianeResteMilieuExact,
                    1,
                  )} jour(s)`
                : 'au milieu : aucun écran — rien ne tombe exactement dessus',
              `après le milieu : ${ecransResteApresStrictCsv.length} écran(s), milieu ${nombre(
                medianeResteApresStrict,
                1,
              )} jour(s)`,
              `milieu commun des trois parts réunies : ${nombre(
                medianeResteTroisParts,
                1,
              )} jour(s) sur ${ecransResteTroisPartsCsv.length} retour(s) daté(s)`,
              `à comparer au milieu du lot réuni : ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s)`,
            ].join(' · '),
        ecransSemaineResteLotReuniCsv.length > 0
          ? [
              ...ecransResteAvantMilieuCsv,
              ...ecransResteMilieuExactCsv,
              ...ecransResteApresStrictCsv,
            ]
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du reste à réunir',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton du seul milieu exact, posée juste sous celle des trois
       parts : ses écrans, son propre milieu et sa part du reste se lisent d’un
       même regard. La liste se prend sur celle du reste — le retour le plus
       récent de chaque écran fait foi —, si bien qu’aucune ligne du fichier
       ne peut la contredire. Un milieu sans personne le dit calmement plutôt
       que d’inventer un chiffre. */
    lignes.push(
      [
        'Écrans à retours datés du seul milieu exact du reste',
        String(ecransResteMilieuExactCsv.length),
        ecransSemaineResteLotReuniCsv.length === 0
          ? 'aucun écran du reste à lire · le lot réuni se lit seul'
          : ecransResteMilieuExactCsv.length === 0
            ? `aucun écran du reste ne tombe exactement sur le milieu du lot réuni — ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s)`
            : `${ecransResteMilieuExactCsv.length} sur ${ecransSemaineResteLotReuniCsv.length} écran(s) du reste tombent exactement sur le milieu du lot réuni · délai médian ${nombre(
                medianeResteMilieuExact,
                1,
              )} jour(s) sur ${ecransResteMilieuExactCsv.length} retour(s) daté(s) · à comparer au milieu du lot réuni : ${nombre(
                medianeDeuxAdditions,
                1,
              )} jour(s)`,
        ecransResteMilieuExactCsv.length > 0
          ? ecransResteMilieuExactCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du reste ne tombe exactement sur le milieu du lot réuni',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton qui réunit le reste avant le milieu et le milieu
       exact, posée juste sous celle du seul milieu exact : les deux parts et
       leurs milieux se lisent côte à côte, puis le milieu commun des deux
       parts réunies à côté de celui du lot réuni. Les trois chiffres se
       prennent sur la même liste que le jeton — le retour le plus récent de
       chaque écran fait foi —, si bien qu’aucune ligne du fichier ne peut les
       contredire. */
    const ecransResteAvantMilieuEtMilieuCsv = [
      ...ecransResteAvantMilieuCsv,
      ...ecransResteMilieuExactCsv,
    ];
    const medianeResteAvantMilieuEtMilieu = mediane(
      ecransResteAvantMilieuEtMilieuCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    lignes.push(
      [
        'Écrans à retours datés du reste avant le milieu et au milieu côte à côte',
        String(ecransResteAvantMilieuEtMilieuCsv.length),
        ecransSemaineResteLotReuniCsv.length === 0
          ? 'aucun écran du reste à réunir · le lot réuni se lit seul'
          : `avant le milieu : ${
              ecransResteAvantMilieuCsv.length
            } écran(s), milieu ${nombre(
              medianeResteAvantMilieu,
              1,
            )} jour(s) · au milieu : ${
              ecransResteMilieuExactCsv.length > 0
                ? `${ecransResteMilieuExactCsv.length} écran(s), milieu ${nombre(
                    medianeResteMilieuExact,
                    1,
                  )} jour(s)`
                : 'aucun écran — rien ne tombe exactement dessus'
            } · milieu commun des deux parts réunies : ${nombre(
              medianeResteAvantMilieuEtMilieu,
              1,
            )} jour(s) sur ${
              ecransResteAvantMilieuEtMilieuCsv.length
            } retour(s) daté(s) · à comparer au milieu du lot réuni : ${nombre(
              medianeDeuxAdditions,
              1,
            )} jour(s)`,
        ecransResteAvantMilieuEtMilieuCsv.length > 0
          ? ecransResteAvantMilieuEtMilieuCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du reste ne devance le milieu ni ne tombe dessus',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton de la semaine, posée juste sous celle du reste avant
       le milieu et au milieu : ses écrans, sa part du reste réuni et son
       propre milieu se lisent d’un même regard. La liste se prend sur celle du
       reste avant le milieu — le retour le plus récent de chaque écran fait
       foi —, si bien qu’aucune ligne du fichier ne peut la contredire. Une
       semaine sans écran le dit calmement plutôt que d’inventer un milieu. */
    const ecransResteAvantMilieuSemaineCsv = ecransResteAvantMilieuCsv.filter(
      (item) => estSemaineEnCours(item.retour, maintenant),
    );
    const medianeResteAvantMilieuSemaine = mediane(
      ecransResteAvantMilieuSemaineCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    const partResteAvantMilieuSemaine =
      ecransSemaineResteLotReuniCsv.length > 0
        ? Math.round(
            (ecransResteAvantMilieuSemaineCsv.length /
              ecransSemaineResteLotReuniCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du reste avant le milieu revenus cette semaine',
        String(ecransResteAvantMilieuSemaineCsv.length),
        ecransResteAvantMilieuCsv.length === 0
          ? 'aucun écran du reste avant le milieu · le lot réuni se lit seul'
          : ecransResteAvantMilieuSemaineCsv.length > 0
            ? `${ecransResteAvantMilieuSemaineCsv.length} sur ${ecransResteAvantMilieuCsv.length} écran(s) du reste avant le milieu sont revenus cette semaine · ${partResteAvantMilieuSemaine} % du reste réuni (${ecransSemaineResteLotReuniCsv.length} écran(s)) · délai médian ${nombre(
                medianeResteAvantMilieuSemaine,
                1,
              )} jour(s) sur ${ecransResteAvantMilieuSemaineCsv.length} retour(s) daté(s) · à comparer au milieu du reste avant le milieu : ${nombre(
                medianeResteAvantMilieu,
                1,
              )} jour(s)`
            : `aucun écran du reste avant le milieu n’est revenu cette semaine · délai médian du reste avant le milieu : ${nombre(
                medianeResteAvantMilieu,
                1,
              )} jour(s) sur ${ecransResteAvantMilieuCsv.length} retour(s) daté(s)`,
        ecransResteAvantMilieuSemaineCsv.length > 0
          ? ecransResteAvantMilieuSemaineCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du reste avant le milieu n’est revenu cette semaine',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton du milieu exact resserré sur la semaine, posée juste
       sous celle du reste avant le milieu revenu cette semaine : son compte,
       sa part du reste réuni et son propre milieu se lisent d’un même regard.
       La liste se prend sur celle du seul milieu exact — le retour le plus
       récent de chaque écran fait foi —, si bien qu’aucune ligne du fichier ne
       peut la contredire. Une semaine sans écran du milieu le dit calmement
       plutôt que d’inventer un milieu. */
    const ecransResteMilieuExactSemaineCsv = ecransResteMilieuExactCsv.filter(
      (item) => estSemaineEnCours(item.retour, maintenant),
    );
    const medianeResteMilieuExactSemaine = mediane(
      ecransResteMilieuExactSemaineCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    const partResteMilieuExactSemaine =
      ecransSemaineResteLotReuniCsv.length > 0
        ? Math.round(
            (ecransResteMilieuExactSemaineCsv.length /
              ecransSemaineResteLotReuniCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact du reste revenus cette semaine',
        String(ecransResteMilieuExactSemaineCsv.length),
        ecransResteMilieuExactCsv.length === 0
          ? 'aucun écran du reste ne tombe exactement sur le milieu · le lot réuni se lit seul'
          : ecransResteMilieuExactSemaineCsv.length > 0
            ? `${ecransResteMilieuExactSemaineCsv.length} sur ${ecransResteMilieuExactCsv.length} écran(s) du milieu exact sont revenus cette semaine · ${partResteMilieuExactSemaine} % du reste réuni (${ecransSemaineResteLotReuniCsv.length} écran(s)) · délai médian ${nombre(
                medianeResteMilieuExactSemaine,
                1,
              )} jour(s) sur ${ecransResteMilieuExactSemaineCsv.length} retour(s) daté(s) · à comparer au milieu du milieu exact : ${nombre(
                medianeResteMilieuExact,
                1,
              )} jour(s)`
            : `aucun écran du milieu exact n’est revenu cette semaine · délai médian du milieu exact : ${nombre(
                medianeResteMilieuExact,
                1,
              )} jour(s) sur ${ecransResteMilieuExactCsv.length} retour(s) daté(s)`,
        ecransResteMilieuExactSemaineCsv.length > 0
          ? ecransResteMilieuExactSemaineCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du milieu exact n’est revenu cette semaine',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton du milieu exact revenu ce mois-ci, posée juste sous
       celle de la semaine : son compte, sa part du reste réuni et son propre
       milieu se lisent d’un même regard. La liste se prend sur celle du seul
       milieu exact — le retour le plus récent de chaque écran fait foi —, si
       bien qu’aucune ligne du fichier ne peut la contredire. Un mois sans
       écran du milieu le dit calmement plutôt que d’inventer un milieu. */
    const ecransResteMilieuExactMoisCsv = ecransResteMilieuExactCsv.filter(
      (item) => estMoisEnCours(item.retour, maintenant),
    );
    const medianeResteMilieuExactMois = mediane(
      ecransResteMilieuExactMoisCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    const partResteMilieuExactMois =
      ecransSemaineResteLotReuniCsv.length > 0
        ? Math.round(
            (ecransResteMilieuExactMoisCsv.length /
              ecransSemaineResteLotReuniCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact du reste revenus ce mois-ci',
        String(ecransResteMilieuExactMoisCsv.length),
        ecransResteMilieuExactCsv.length === 0
          ? 'aucun écran du reste ne tombe exactement sur le milieu · le lot réuni se lit seul'
          : ecransResteMilieuExactMoisCsv.length > 0
            ? `${ecransResteMilieuExactMoisCsv.length} sur ${ecransResteMilieuExactCsv.length} écran(s) du milieu exact sont revenus ce mois-ci · ${partResteMilieuExactMois} % du reste réuni (${ecransSemaineResteLotReuniCsv.length} écran(s)) · délai médian ${nombre(
                medianeResteMilieuExactMois,
                1,
              )} jour(s) sur ${ecransResteMilieuExactMoisCsv.length} retour(s) daté(s) · à comparer au milieu du milieu exact : ${nombre(
                medianeResteMilieuExact,
                1,
              )} jour(s)`
            : `aucun écran du milieu exact n’est revenu ce mois-ci · délai médian du milieu exact : ${nombre(
                medianeResteMilieuExact,
                1,
              )} jour(s) sur ${ecransResteMilieuExactCsv.length} retour(s) daté(s)`,
        ecransResteMilieuExactMoisCsv.length > 0
          ? ecransResteMilieuExactMoisCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du milieu exact n’est revenu ce mois-ci',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton du milieu exact resté hors du mois, posée juste sous
       celle du mois : sa part du milieu exact se lit à côté de celle du mois,
       puis son propre milieu à côté de celui du milieu exact. Les deux parts se
       prennent sur la même liste du milieu exact — le retour le plus récent de
       chaque écran fait foi —, si bien qu’aucune ligne du fichier ne peut les
       contredire. Une part vide ne se divise pas, et le dit calmement. */
    const ecransResteMilieuExactHorsMoisSeulCsv = ecransResteMilieuExactCsv.filter(
      (item) => !estMoisEnCours(item.retour, maintenant),
    );
    const medianeResteMilieuExactHorsMoisSeul = mediane(
      ecransResteMilieuExactHorsMoisSeulCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    const ecransMilieuExactPartsDuMois =
      ecransResteMilieuExactMoisCsv.length +
      ecransResteMilieuExactHorsMoisSeulCsv.length;
    const partMoisDuMilieuExact =
      ecransMilieuExactPartsDuMois > 0
        ? Math.round(
            (ecransResteMilieuExactMoisCsv.length / ecransMilieuExactPartsDuMois) * 100,
          )
        : 0;
    const partHorsMoisDuMilieuExact =
      ecransMilieuExactPartsDuMois > 0 ? 100 - partMoisDuMilieuExact : 0;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact du reste restés hors du mois',
        String(ecransResteMilieuExactHorsMoisSeulCsv.length),
        ecransResteMilieuExactCsv.length === 0
          ? 'aucun écran du reste ne tombe exactement sur le milieu · le lot réuni se lit seul'
          : ecransMilieuExactPartsDuMois === 0
            ? `aucun écran du milieu exact n’est revenu ce mois-ci ni resté hors du mois · milieu du milieu exact : ${nombre(
                medianeResteMilieuExact,
                1,
              )} jour(s) sur ${ecransResteMilieuExactCsv.length} retour(s) daté(s)`
            : `${ecransResteMilieuExactHorsMoisSeulCsv.length} sur ${ecransResteMilieuExactCsv.length} écran(s) du milieu exact sont restés hors du mois · part du milieu exact ce mois-ci : ${ecransResteMilieuExactMoisCsv.length} écran(s), ${partMoisDuMilieuExact} % · part restée hors du mois : ${ecransResteMilieuExactHorsMoisSeulCsv.length} écran(s), ${partHorsMoisDuMilieuExact} %${
                ecransResteMilieuExactHorsMoisSeulCsv.length > 0
                  ? ` · délai médian hors du mois ${nombre(
                      medianeResteMilieuExactHorsMoisSeul,
                      1,
                    )} jour(s) sur ${ecransResteMilieuExactHorsMoisSeulCsv.length} retour(s) daté(s) · à comparer au milieu du mois : ${nombre(
                      medianeResteMilieuExactMois,
                      1,
                    )} jour(s)`
                  : ` · aucun retour daté hors du mois · milieu du mois : ${nombre(
                      medianeResteMilieuExactMois,
                      1,
                    )} jour(s)`
              }`,
        ecransResteMilieuExactHorsMoisSeulCsv.length > 0
          ? ecransResteMilieuExactHorsMoisSeulCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du milieu exact n’est resté hors du mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton réuni du milieu exact, posée juste sous celle de la
       semaine : ses deux parts — la semaine d’un côté, le reste hors semaine
       de l’autre — et le milieu commun se lisent côte à côte. Les deux parts
       et le milieu se prennent sur la même liste du milieu exact, le retour
       le plus récent de chaque écran faisant foi, si bien qu’aucune ligne du
       fichier ne peut les contredire. Une part vide ne se divise pas, et le
       dit calmement. */
    const ecransResteMilieuExactHorsSemaineCsv = ecransResteMilieuExactCsv.filter(
      (item) => !estSemaineEnCours(item.retour, maintenant),
    );
    const ecransResteMilieuExactReunisCsv = [
      ...ecransResteMilieuExactSemaineCsv,
      ...ecransResteMilieuExactHorsSemaineCsv,
    ];
    const medianeResteMilieuExactHorsSemaine = mediane(
      ecransResteMilieuExactHorsSemaineCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    const medianeResteMilieuExactReunis = mediane(
      ecransResteMilieuExactReunisCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    lignes.push(
      [
        'Écrans à retours datés du milieu exact réuni — semaine et reste hors semaine côte à côte',
        String(ecransResteMilieuExactCsv.length),
        ecransResteMilieuExactCsv.length === 0
          ? 'aucun écran du reste ne tombe exactement sur le milieu · le lot réuni se lit seul'
          : `semaine : ${ecransResteMilieuExactSemaineCsv.length} écran(s), milieu ${nombre(
              medianeResteMilieuExactSemaine,
              1,
            )} jour(s) · reste hors semaine : ${ecransResteMilieuExactHorsSemaineCsv.length} écran(s), milieu ${nombre(
              medianeResteMilieuExactHorsSemaine,
              1,
            )} jour(s) · milieu commun des deux parts réunies : ${nombre(
              medianeResteMilieuExactReunis,
              1,
            )} jour(s) sur ${ecransResteMilieuExactReunisCsv.length} retour(s) daté(s) · à comparer au milieu du milieu exact : ${nombre(
              medianeResteMilieuExact,
              1,
            )} jour(s)`,
        ecransResteMilieuExactReunisCsv.length > 0
          ? ecransResteMilieuExactReunisCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du reste ne tombe exactement sur le milieu',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans du milieu exact revenus hors de la semaine
       représentent dans les seuls écrans du milieu exact, posée juste sous la
       ligne qui réunit les deux parts : les deux se lisent sur la même liste —
       le retour le plus récent de chaque écran faisant foi —, si bien que la
       part ne peut pas contredire le compte. Un milieu vide ne se divise pas,
       et le dit calmement. */
    const ecransMilieuExactPartsSemaine =
      ecransResteMilieuExactSemaineCsv.length +
      ecransResteMilieuExactHorsSemaineCsv.length;
    const partHorsSemaineDuMilieuExact =
      ecransMilieuExactPartsSemaine > 0
        ? Math.round(
            (ecransResteMilieuExactHorsSemaineCsv.length /
              ecransMilieuExactPartsSemaine) *
              100,
          )
        : 0;
    const partSemaineDuMilieuExact =
      ecransMilieuExactPartsSemaine > 0
        ? 100 - partHorsSemaineDuMilieuExact
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact du reste restés hors de la semaine',
        String(ecransResteMilieuExactHorsSemaineCsv.length),
        ecransResteMilieuExactCsv.length === 0
          ? 'aucun écran du reste ne tombe exactement sur le milieu · le lot réuni se lit seul'
          : ecransMilieuExactPartsSemaine === 0
            ? `aucun écran du milieu exact n’est revenu cette semaine ni resté hors de la semaine · milieu du milieu exact : ${nombre(
                medianeResteMilieuExact,
                1,
              )} jour(s) sur ${ecransResteMilieuExactCsv.length} retour(s) daté(s)`
            : `${ecransResteMilieuExactHorsSemaineCsv.length} sur ${ecransMilieuExactPartsSemaine} écran(s) du milieu exact sont restés hors de la semaine · part du milieu exact cette semaine : ${ecransResteMilieuExactSemaineCsv.length} écran(s), ${partSemaineDuMilieuExact} % · part restée hors de la semaine : ${ecransResteMilieuExactHorsSemaineCsv.length} écran(s), ${partHorsSemaineDuMilieuExact} % · à comparer au milieu de la semaine : ${nombre(
                medianeResteMilieuExactSemaine,
                1,
              )} jour(s) sur ${ecransResteMilieuExactSemaineCsv.length} retour(s) daté(s)`,
        ecransResteMilieuExactHorsSemaineCsv.length > 0
          ? ecransResteMilieuExactHorsSemaineCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du milieu exact n’est resté hors de la semaine',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part des écrans du milieu exact revenus hors du mois, posée juste
       sous celle de la semaine : les deux fenêtres se lisent côte à côte — ce
       que la semaine retient d'un côté, ce que le dehors du mois retient de
       l'autre —, rapportées au même lot du milieu exact. Le retour le plus
       récent de chaque écran fait foi, si bien qu'aucune ligne du fichier ne
       peut contredire les deux parts. Un milieu vide ne se divise pas, et le
       dit calmement. */
    const ecransMilieuExactHorsMoisDeuxFenetresCsv = ecransResteMilieuExactCsv.filter(
      (item) => !estMoisEnCours(item.retour, maintenant),
    );
    const partHorsMoisDeuxFenetres =
      ecransResteMilieuExactCsv.length > 0
        ? Math.round(
            (ecransMilieuExactHorsMoisDeuxFenetresCsv.length /
              ecransResteMilieuExactCsv.length) *
              100,
          )
        : 0;
    const partHorsSemaineDeuxFenetres =
      ecransResteMilieuExactCsv.length > 0
        ? Math.round(
            (ecransResteMilieuExactHorsSemaineCsv.length /
              ecransResteMilieuExactCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact — la part restée hors du mois, les deux fenêtres côte à côte',
        String(ecransMilieuExactHorsMoisDeuxFenetresCsv.length),
        ecransResteMilieuExactCsv.length === 0
          ? 'aucun écran du reste ne tombe exactement sur le milieu · le lot réuni se lit seul'
          : `${ecransMilieuExactHorsMoisDeuxFenetresCsv.length} sur ${ecransResteMilieuExactCsv.length} écran(s) du milieu exact sont revenus hors du mois · les deux fenêtres côte à côte — hors de la semaine : ${ecransResteMilieuExactHorsSemaineCsv.length} écran(s), ${partHorsSemaineDeuxFenetres} % · hors du mois : ${ecransMilieuExactHorsMoisDeuxFenetresCsv.length} écran(s), ${partHorsMoisDeuxFenetres} % · à comparer à la part du mois : ${ecransResteMilieuExactMoisCsv.length} écran(s) · milieu du mois : ${nombre(
            medianeResteMilieuExactMois,
            1,
          )} jour(s)`,
        ecransMilieuExactHorsMoisDeuxFenetresCsv.length > 0
          ? ecransMilieuExactHorsMoisDeuxFenetresCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du milieu exact n’est resté hors du mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part des écrans du milieu exact revenus hors du mois, rapportée au
       carnet entier, posée juste sous celle des deux fenêtres : les deux
       périmètres se lisent d’un même regard — le milieu exact d’un côté, tout
       le carnet de l’autre. La liste est la même que celle du dessus, le
       retour le plus récent de chaque écran faisant foi, si bien qu’aucune
       des deux lignes ne peut contredire l’autre. Un carnet vide ne se divise
       pas, et le dit calmement. */
    const partHorsMoisCarnet =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransMilieuExactHorsMoisDeuxFenetresCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact revenus hors du mois, rapportés au carnet entier',
        String(ecransMilieuExactHorsMoisDeuxFenetresCsv.length),
        ecransRepartisCsv.length === 0
          ? 'le carnet est vide'
          : `${ecransMilieuExactHorsMoisDeuxFenetresCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus hors du mois depuis le milieu exact · ${partHorsMoisCarnet} % du carnet · à comparer au milieu exact : ${partHorsMoisDeuxFenetres} % de ses ${ecransResteMilieuExactCsv.length} écran(s)`,
        ecransMilieuExactHorsMoisDeuxFenetresCsv.length > 0
          ? ecransMilieuExactHorsMoisDeuxFenetresCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du milieu exact n’est revenu hors du mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton réuni du mois, posée juste sous celle de la semaine :
       ses deux parts — le mois d’un côté, le reste hors mois de l’autre — et
       le milieu commun se lisent côte à côte. Les deux parts et le milieu se
       prennent sur la même liste du milieu exact, le retour le plus récent de
       chaque écran faisant foi, si bien qu’aucune ligne du fichier ne peut
       les contredire. Une part vide ne se divise pas, et le dit calmement. */
    const ecransResteMilieuExactHorsMoisCsv = ecransResteMilieuExactCsv.filter(
      (item) => !estMoisEnCours(item.retour, maintenant),
    );
    const ecransResteMilieuExactReunisMoisCsv = [
      ...ecransResteMilieuExactMoisCsv,
      ...ecransResteMilieuExactHorsMoisCsv,
    ];
    const medianeResteMilieuExactHorsMois = mediane(
      ecransResteMilieuExactHorsMoisCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    const medianeResteMilieuExactReunisMois = mediane(
      ecransResteMilieuExactReunisMoisCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    lignes.push(
      [
        'Écrans à retours datés du milieu exact réuni du mois — mois et reste hors mois côte à côte',
        String(ecransResteMilieuExactReunisMoisCsv.length),
        ecransResteMilieuExactCsv.length === 0
          ? 'aucun écran du reste ne tombe exactement sur le milieu · le lot réuni se lit seul'
          : `mois : ${ecransResteMilieuExactMoisCsv.length} écran(s), milieu ${nombre(
              medianeResteMilieuExactMois,
              1,
            )} jour(s) · reste hors mois : ${ecransResteMilieuExactHorsMoisCsv.length} écran(s), milieu ${nombre(
              medianeResteMilieuExactHorsMois,
              1,
            )} jour(s) · milieu commun des deux parts réunies : ${nombre(
              medianeResteMilieuExactReunisMois,
              1,
            )} jour(s) sur ${ecransResteMilieuExactReunisMoisCsv.length} retour(s) daté(s) · à comparer au milieu du milieu exact : ${nombre(
              medianeResteMilieuExact,
              1,
            )} jour(s)`,
        ecransResteMilieuExactReunisMoisCsv.length > 0
          ? ecransResteMilieuExactReunisMoisCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du reste ne tombe exactement sur le milieu',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du milieu exact réuni de la semaine au mois, posée juste sous
       celle du mois : la part de la semaine et celle du mois se lisent côte à
       côte, chacune avec son compte et son milieu. Les deux parts se prennent
       sur la même liste du milieu exact — le retour le plus récent de chaque
       écran fait foi, et un écran de la semaine qui tombe aussi dans le mois
       n’y pèse qu’une fois —, si bien qu’aucune ligne du fichier ne peut les
       contredire. Une part vide ne se divise pas, et le dit calmement. */
    const ecransResteMilieuExactSemaineMoisCsv: {
      ecran: string;
      retrait: string;
      retour: string;
    }[] = [];
    const vusSemaineMois = new Set<string>();
    [
      ...ecransResteMilieuExactSemaineCsv,
      ...ecransResteMilieuExactMoisCsv,
    ].forEach((item) => {
      if (vusSemaineMois.has(item.ecran)) return;
      vusSemaineMois.add(item.ecran);
      ecransResteMilieuExactSemaineMoisCsv.push(item);
    });
    const medianeResteMilieuExactSemaineMois = mediane(
      ecransResteMilieuExactSemaineMoisCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    lignes.push(
      [
        'Écrans à retours datés du milieu exact réuni — semaine et mois côte à côte',
        String(ecransResteMilieuExactSemaineMoisCsv.length),
        ecransResteMilieuExactCsv.length === 0
          ? 'aucun écran du reste ne tombe exactement sur le milieu · le lot réuni se lit seul'
          : ecransResteMilieuExactSemaineMoisCsv.length === 0
            ? `la semaine et le mois ne retiennent aucun écran du milieu exact · milieu du milieu exact : ${nombre(
                medianeResteMilieuExact,
                1,
              )} jour(s) sur ${ecransResteMilieuExactCsv.length} retour(s) daté(s)`
            : `semaine : ${ecransResteMilieuExactSemaineCsv.length} écran(s), milieu ${nombre(
                medianeResteMilieuExactSemaine,
                1,
              )} jour(s) · mois : ${ecransResteMilieuExactMoisCsv.length} écran(s), milieu ${nombre(
                medianeResteMilieuExactMois,
                1,
              )} jour(s) · milieu commun de la semaine et du mois réunis : ${nombre(
                medianeResteMilieuExactSemaineMois,
                1,
              )} jour(s) sur ${ecransResteMilieuExactSemaineMoisCsv.length} retour(s) daté(s) · à comparer au milieu du milieu exact : ${nombre(
                medianeResteMilieuExact,
                1,
              )} jour(s)`,
        ecransResteMilieuExactSemaineMoisCsv.length > 0
          ? ecransResteMilieuExactSemaineMoisCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du milieu exact n’est revenu cette semaine ni ce mois-ci',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne du jeton qui réunit la semaine et le hors du mois, posée juste
       sous celle de la semaine au mois : les trois fenêtres — la semaine, le
       mois et son dehors — se lisent côte à côte, puis le milieu commun des
       deux parts réunies se compare à celui du mois. Un écran de la semaine
       qui tombe aussi hors du mois n’y pèse qu’une fois, et la liste se prend
       sur les mêmes lignes que les deux jetons, si bien qu’aucune ligne du
       fichier ne peut les contredire. Une part vide ne se divise pas, et le
       dit calmement. */
    const ecransResteMilieuExactSemaineHorsMoisCsv: {
      ecran: string;
      retrait: string;
      retour: string;
    }[] = [];
    const vusSemaineHorsMois = new Set<string>();
    [
      ...ecransResteMilieuExactSemaineCsv,
      ...ecransResteMilieuExactHorsMoisCsv,
    ].forEach((item) => {
      if (vusSemaineHorsMois.has(item.ecran)) return;
      vusSemaineHorsMois.add(item.ecran);
      ecransResteMilieuExactSemaineHorsMoisCsv.push(item);
    });
    const medianeResteMilieuExactSemaineHorsMois = mediane(
      ecransResteMilieuExactSemaineHorsMoisCsv.map((item) =>
        joursEntre(item.retrait, item.retour),
      ),
    );
    lignes.push(
      [
        'Écrans à retours datés du milieu exact réunis — semaine, mois et hors du mois côte à côte',
        String(ecransResteMilieuExactSemaineHorsMoisCsv.length),
        ecransResteMilieuExactCsv.length === 0
          ? 'aucun écran du reste ne tombe exactement sur le milieu · le lot réuni se lit seul'
          : ecransResteMilieuExactSemaineHorsMoisCsv.length === 0
            ? `la semaine et le dehors du mois ne retiennent aucun écran du milieu exact · milieu du milieu exact : ${nombre(
                medianeResteMilieuExact,
                1,
              )} jour(s) sur ${ecransResteMilieuExactCsv.length} retour(s) daté(s)`
            : `semaine : ${ecransResteMilieuExactSemaineCsv.length} écran(s), milieu ${nombre(
                medianeResteMilieuExactSemaine,
                1,
              )} jour(s) · mois : ${ecransResteMilieuExactMoisCsv.length} écran(s), milieu ${nombre(
                medianeResteMilieuExactMois,
                1,
              )} jour(s) · reste hors du mois : ${ecransResteMilieuExactHorsMoisCsv.length} écran(s), milieu ${nombre(
                medianeResteMilieuExactHorsMois,
                1,
              )} jour(s) · milieu commun de la semaine et du dehors du mois réunis : ${nombre(
                medianeResteMilieuExactSemaineHorsMois,
                1,
              )} jour(s) sur ${ecransResteMilieuExactSemaineHorsMoisCsv.length} retour(s) daté(s) · à comparer au milieu du mois : ${nombre(
                medianeResteMilieuExactMois,
                1,
              )} jour(s)`,
        ecransResteMilieuExactSemaineHorsMoisCsv.length > 0
          ? ecransResteMilieuExactSemaineHorsMoisCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du milieu exact n’est revenu cette semaine ni resté hors du mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que ces deux fenêtres réunies représentent dans tout le carnet,
       posée juste sous la ligne qui met les trois fenêtres côte à côte : la
       ligne se prend sur la même liste et le même retour le plus récent que le
       jeton, si bien qu’elle ne peut pas le contredire. Un carnet vide ne se
       divise pas, et le dit calmement. */
    const partResteMilieuExactSemaineHorsMoisCarnet =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransResteMilieuExactSemaineHorsMoisCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact réunis — semaine et hors du mois dans tout le carnet',
        String(ecransResteMilieuExactSemaineHorsMoisCsv.length),
        ecransRepartisCsv.length === 0
          ? 'le carnet est vide'
          : `${ecransResteMilieuExactSemaineHorsMoisCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus cette semaine ou sont restés hors du mois, depuis le milieu exact · ${partResteMilieuExactSemaineHorsMoisCarnet} % du carnet · milieu de ces deux parts réunies : ${nombre(
              medianeResteMilieuExactSemaineHorsMois,
              1,
            )} jour(s) sur ${ecransResteMilieuExactSemaineHorsMoisCsv.length} retour(s) daté(s)`,
        ecransResteMilieuExactSemaineHorsMoisCsv.length > 0
          ? ecransResteMilieuExactSemaineHorsMoisCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du carnet n’est revenu cette semaine ni resté hors du mois, depuis le milieu exact',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les deux bouts du jeton réuni, posés juste sous sa part dans tout le
       carnet : le retour le plus rapide et le plus lent des deux parts, chacun
       avec son écran, sa date et son délai. Les deux se prennent sur la même
       liste que le jeton — le retour le plus récent de chaque écran fait foi —,
       si bien qu'aucune ligne du fichier ne peut les contredire. Un lot sans
       retour daté ne nomme personne, et le dit calmement. */
    const ecransSemaineHorsMoisParDelai = [
      ...ecransResteMilieuExactSemaineHorsMoisCsv,
    ].sort(
      (a, b) =>
        joursEntre(a.retrait, a.retour) - joursEntre(b.retrait, b.retour) ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime() ||
        a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' }),
    );
    const boutRapideSemaineHorsMois = ecransSemaineHorsMoisParDelai[0] ?? null;
    const boutLentSemaineHorsMois =
      ecransSemaineHorsMoisParDelai[ecransSemaineHorsMoisParDelai.length - 1] ??
      null;
    const noteDeuxBoutsSemaineHorsMois =
      boutRapideSemaineHorsMois && boutLentSemaineHorsMois
        ? `le plus rapide : « ${boutRapideSemaineHorsMois.ecran} », revenu le ${jour(
            boutRapideSemaineHorsMois.retour,
            lang,
          )} après ${joursEntre(
            boutRapideSemaineHorsMois.retrait,
            boutRapideSemaineHorsMois.retour,
          )} jour(s) · le plus lent : « ${boutLentSemaineHorsMois.ecran} », revenu le ${jour(
            boutLentSemaineHorsMois.retour,
            lang,
          )} après ${joursEntre(
            boutLentSemaineHorsMois.retrait,
            boutLentSemaineHorsMois.retour,
          )} jour(s)${
            boutRapideSemaineHorsMois.ecran === boutLentSemaineHorsMois.ecran
              ? ' · le même écran porte les deux bouts, un seul retour daté'
              : ` · ${Math.max(
                  0,
                  joursEntre(boutLentSemaineHorsMois.retrait, boutLentSemaineHorsMois.retour) -
                    joursEntre(
                      boutRapideSemaineHorsMois.retrait,
                      boutRapideSemaineHorsMois.retour,
                    ),
                )} jour(s) séparent les deux bouts`
          }`
        : 'aucun retour daté parmi les deux parts · le jeton réuni se lit seul';
    lignes.push(
      [
        'Écrans à retours datés du milieu exact réunis — le retour le plus rapide et le plus lent',
        String(ecransResteMilieuExactSemaineHorsMoisCsv.length),
        noteDeuxBoutsSemaineHorsMois,
        ecransResteMilieuExactSemaineHorsMoisCsv.length > 0
          ? ecransSemaineHorsMoisParDelai
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du milieu exact n’est revenu cette semaine ni resté hors du mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne des parts du mois, lue des deux côtés — la semaine d’un côté,
       le dehors du mois de l’autre : chacune dit son compte et la part qu’elle
       porte dans le mois, si bien que les deux parts se lisent face à face sans
       rien recopier. Les deux listes se prennent sur celle du milieu exact, le
       retour le plus récent de chaque écran faisant foi, et un écran de la
       semaine resté hors du mois est nommé des deux côtés plutôt que d’être
       perdu. Un mois vide ne se divise pas, et le dit calmement. */
    const ecransResteMilieuExactSemaineDansMoisCsv =
      ecransResteMilieuExactSemaineCsv.filter((item) =>
        estMoisEnCours(item.retour, maintenant),
      );
    const ecransResteMilieuExactPartsMoisCsv =
      ecransResteMilieuExactMoisCsv.length +
      ecransResteMilieuExactHorsMoisCsv.length;
    const partMoisDeLaSemaineExacte =
      ecransResteMilieuExactPartsMoisCsv > 0
        ? Math.round(
            (ecransResteMilieuExactSemaineDansMoisCsv.length /
              ecransResteMilieuExactPartsMoisCsv) *
              100,
          )
        : 0;
    const partMoisDuDehorsExact =
      ecransResteMilieuExactPartsMoisCsv > 0
        ? Math.round(
            (ecransResteMilieuExactHorsMoisCsv.length /
              ecransResteMilieuExactPartsMoisCsv) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact — parts du mois de la semaine et du dehors côte à côte',
        String(
          ecransResteMilieuExactSemaineDansMoisCsv.length +
            ecransResteMilieuExactHorsMoisCsv.length,
        ),
        ecransResteMilieuExactPartsMoisCsv === 0
          ? `aucun écran du milieu exact n’est revenu ce mois-ci ni resté hors du mois · milieu du milieu exact : ${nombre(
              medianeResteMilieuExact,
              1,
            )} jour(s) sur ${ecransResteMilieuExactCsv.length} retour(s) daté(s)`
          : `part du mois côté semaine : ${ecransResteMilieuExactSemaineDansMoisCsv.length} écran(s), ${partMoisDeLaSemaineExacte} % du mois · part du mois côté dehors : ${ecransResteMilieuExactHorsMoisCsv.length} écran(s), ${partMoisDuDehorsExact} % du mois · les deux parts réunies forment le mois du milieu exact : ${ecransResteMilieuExactPartsMoisCsv} écran(s) · à comparer au milieu du mois : ${nombre(
              medianeResteMilieuExactMois,
              1,
            )} jour(s) sur ${ecransResteMilieuExactMoisCsv.length} retour(s) daté(s)`,
        ecransResteMilieuExactPartsMoisCsv > 0
          ? [
              ...ecransResteMilieuExactSemaineDansMoisCsv,
              ...ecransResteMilieuExactHorsMoisCsv,
            ]
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du milieu exact ne porte de part du mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La ligne des écrans que les deux côtés des parts du mois se partagent :
       revenus cette semaine sans tomber dans le mois, ils portent la part de
       la semaine et celle du dehors à la fois. La liste se prend sur les
       mêmes lignes que la ligne des parts, si bien qu'elle ne peut pas la
       contredire. Un recoupement vide le dit calmement plutôt que d'inventer
       un chiffre. */
    const ecransMilieuExactDeuxCotesPartsMoisCsv =
      ecransResteMilieuExactSemaineCsv.filter(
        (item) => !estMoisEnCours(item.retour, maintenant),
      );
    const partDeuxCotesPartsMois =
      ecransResteMilieuExactPartsMoisCsv > 0
        ? Math.round(
            (ecransMilieuExactDeuxCotesPartsMoisCsv.length /
              ecransResteMilieuExactPartsMoisCsv) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact — ceux qui tombent des deux côtés des parts du mois',
        String(ecransMilieuExactDeuxCotesPartsMoisCsv.length),
        ecransResteMilieuExactCsv.length === 0
          ? 'aucun écran du reste ne tombe exactement sur le milieu · le lot réuni se lit seul'
          : ecransMilieuExactDeuxCotesPartsMoisCsv.length === 0
            ? `aucun écran du milieu exact ne tombe des deux côtés à la fois · chacun des ${ecransResteMilieuExactPartsMoisCsv} écran(s) du mois ne porte qu’une seule part`
            : `${ecransMilieuExactDeuxCotesPartsMoisCsv.length} sur ${ecransResteMilieuExactPartsMoisCsv} écran(s) du mois portent la part de la semaine et celle du dehors à la fois — revenus cette semaine sans tomber dans le mois · ${partDeuxCotesPartsMois} % des parts du mois · ${ecransResteMilieuExactPartsMoisCsv - ecransMilieuExactDeuxCotesPartsMoisCsv.length} écran(s) ne portent qu’une seule part · à comparer au milieu du mois : ${nombre(
                medianeResteMilieuExactMois,
                1,
              )} jour(s) sur ${ecransResteMilieuExactMoisCsv.length} retour(s) daté(s)`,
        ecransMilieuExactDeuxCotesPartsMoisCsv.length > 0
          ? ecransMilieuExactDeuxCotesPartsMoisCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du milieu exact ne tombe des deux côtés à la fois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai moyen des écrans que les deux côtés se partagent, posé juste
       sous la ligne qui les compte : la même liste que le jeton, un écran
       revenu deux fois n'y pesant qu'une fois — un lot vide ne se divise pas,
       et le dit calmement plutôt que d'inventer une moyenne. */
    const delaiMoyenDeuxCotesPartsMois =
      ecransMilieuExactDeuxCotesPartsMoisCsv.length > 0
        ? ecransMilieuExactDeuxCotesPartsMoisCsv.reduce(
            (somme, item) => somme + joursEntre(item.retrait, item.retour),
            0,
          ) / ecransMilieuExactDeuxCotesPartsMoisCsv.length
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact — le délai moyen de ceux qui tombent des deux côtés des parts du mois',
        String(ecransMilieuExactDeuxCotesPartsMoisCsv.length),
        ecransMilieuExactDeuxCotesPartsMoisCsv.length === 0
          ? 'aucun écran du milieu exact ne tombe des deux côtés à la fois · aucune moyenne à poser'
          : `${nombre(
              delaiMoyenDeuxCotesPartsMois,
              1,
            )} jour(s) en moyenne sur ${ecransMilieuExactDeuxCotesPartsMoisCsv.length} retour(s) daté(s) des deux côtés · ${partDeuxCotesPartsMois} % des parts du mois · à comparer aux parts du mois : ${ecransResteMilieuExactPartsMoisCsv} écran(s)`,
        ecransMilieuExactDeuxCotesPartsMoisCsv.length > 0
          ? ecransMilieuExactDeuxCotesPartsMoisCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran des deux côtés ne porte de délai à moyenner',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai moyen des écrans qui ne portent qu'une seule part des parts du
       mois, posé juste sous celui des écrans des deux côtés : les deux lots se
       lisent côte à côte, et l'un est le complément exact de l'autre sur les
       mêmes lignes du milieu exact — le retour le plus récent de chaque écran
       fait foi, si bien qu'aucune des deux moyennes ne peut contredire
       l'autre. Un lot vide ne se divise pas, et le dit calmement. */
    const ecransMilieuExactUneSeulePartCsv = [
      ...ecransResteMilieuExactMoisCsv,
      ...ecransResteMilieuExactHorsMoisCsv.filter(
        (item) => !estSemaineEnCours(item.retour, maintenant),
      ),
    ];
    const delaiMoyenUneSeulePart =
      ecransMilieuExactUneSeulePartCsv.length > 0
        ? ecransMilieuExactUneSeulePartCsv.reduce(
            (somme, item) => somme + joursEntre(item.retrait, item.retour),
            0,
          ) / ecransMilieuExactUneSeulePartCsv.length
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact — le délai moyen de ceux qui ne portent qu’une seule part des parts du mois',
        String(ecransMilieuExactUneSeulePartCsv.length),
        ecransMilieuExactUneSeulePartCsv.length === 0
          ? 'aucun écran du milieu exact ne porte une seule part · chacun tombe des deux côtés à la fois, aucune moyenne à poser'
          : `${nombre(
              delaiMoyenUneSeulePart,
              1,
            )} jour(s) en moyenne sur ${ecransMilieuExactUneSeulePartCsv.length} retour(s) daté(s) d’une seule part · à comparer aux écrans des deux côtés : ${
              ecransMilieuExactDeuxCotesPartsMoisCsv.length > 0
                ? `${ecransMilieuExactDeuxCotesPartsMoisCsv.length} écran(s), ${nombre(
                    delaiMoyenDeuxCotesPartsMois,
                    1,
                  )} jour(s) en moyenne`
                : 'aucun écran des deux côtés'
            } · les deux lots réunis forment les parts du mois : ${ecransResteMilieuExactPartsMoisCsv} écran(s)`,
        ecransMilieuExactUneSeulePartCsv.length > 0
          ? ecransMilieuExactUneSeulePartCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran d’une seule part ne porte de délai à moyenner',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que ces écrans des deux côtés représentent dans tout le carnet,
       posée juste sous la ligne qui les compte : la même liste que le jeton,
       rapportée aux écrans du carnet entier — un carnet vide ne se divise
       pas, et le dit calmement plutôt que d'inventer un pourcentage. */
    const partDeuxCotesCarnet =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransMilieuExactDeuxCotesPartsMoisCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact — la part de ceux qui tombent des deux côtés dans tout le carnet',
        String(ecransMilieuExactDeuxCotesPartsMoisCsv.length),
        ecransRepartisCsv.length === 0
          ? 'le carnet est vide'
          : ecransMilieuExactDeuxCotesPartsMoisCsv.length === 0
            ? `aucun écran du carnet ne tombe des deux côtés des parts du mois · les ${ecransRepartisCsv.length} écran(s) du carnet gardent chacun une seule part`
            : `${ecransMilieuExactDeuxCotesPartsMoisCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet portent la part de la semaine et celle du dehors à la fois — revenus cette semaine sans tomber dans le mois · ${partDeuxCotesCarnet} % du carnet · à comparer aux parts du mois : ${ecransResteMilieuExactPartsMoisCsv} écran(s)`,
        ecransMilieuExactDeuxCotesPartsMoisCsv.length > 0
          ? ecransMilieuExactDeuxCotesPartsMoisCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du carnet ne tombe des deux côtés à la fois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les écrans revenus hors de la semaine en cours, comptés sur tout le
       carnet : le complément exact de ceux revenus cette semaine, pris sur la
       même liste et le même retour le plus récent de chaque écran — les deux
       lignes ne peuvent donc pas se contredire. Un carnet sans retour hors
       semaine le dit calmement, plutôt que d'inventer une part. */
    const ecransRevenusHorsSemaineCarnetCsv = ecransRepartisCsv.filter(
      (item) => !estSemaineEnCours(item.retour, maintenant),
    );
    const partRevenusHorsSemaineCarnet =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRevenusHorsSemaineCarnetCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés revenus hors de la semaine en cours dans tout le carnet',
        String(ecransRevenusHorsSemaineCarnetCsv.length),
        ecransRevenusHorsSemaineCarnetCsv.length > 0
          ? `${ecransRevenusHorsSemaineCarnetCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus hors de la semaine en cours · ${partRevenusHorsSemaineCarnet} % du carnet · à comparer à ceux revenus cette semaine : ${ecransRepartisCsv.length - ecransRevenusHorsSemaineCarnetCsv.length}`
          : `aucun écran du carnet n’est revenu hors de la semaine en cours — les ${ecransRepartisCsv.length} retour(s) daté(s) du carnet tombent tous dans la semaine`,
        ecransRevenusHorsSemaineCarnetCsv.length > 0
          ? ecransRevenusHorsSemaineCarnetCsv
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du carnet n’est revenu hors de la semaine en cours',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les deux bouts de tout le carnet, posés dans le bloc du milieu exact :
       le retour le plus ancien et le plus récent, chacun avec son écran, sa
       date et son délai, puis les journées qui les séparent. La liste se
       prend sur les mêmes écrans que le carnet entier — le retour le plus
       récent de chaque écran fait foi —, si bien qu'aucune ligne du fichier
       ne peut les contredire. Un carnet vide ne nomme personne. */
    const carnetParDate = [...ecransRepartisCsv].sort(
      (a, b) => new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    );
    const boutAncienCarnet = carnetParDate[0] ?? null;
    const boutRecentCarnet = carnetParDate[carnetParDate.length - 1] ?? null;
    lignes.push(
      [
        'Écrans à retours datés de tout le carnet — le retour le plus ancien et le plus récent',
        String(ecransRepartisCsv.length),
        boutAncienCarnet && boutRecentCarnet
          ? `le plus ancien : « ${boutAncienCarnet.ecran} », revenu le ${jour(
              boutAncienCarnet.retour,
              lang,
            )} après ${joursEntre(
              boutAncienCarnet.retrait,
              boutAncienCarnet.retour,
            )} jour(s) · le plus récent : « ${boutRecentCarnet.ecran} », revenu le ${jour(
              boutRecentCarnet.retour,
              lang,
            )} après ${joursEntre(
              boutRecentCarnet.retrait,
              boutRecentCarnet.retour,
            )} jour(s)${
              boutAncienCarnet.ecran === boutRecentCarnet.ecran
                ? ' · le même écran porte les deux bouts, un seul retour daté'
                : ` · ${joursEntre(
                    boutAncienCarnet.retour,
                    boutRecentCarnet.retour,
                  )} jour(s) séparent les deux retours`
            }`
          : 'le carnet est vide, il n’y a pas de bout à nommer',
        ecransRepartisCsv.length > 0
          ? carnetParDate
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran au carnet',
      ]
        .map(cellule)
        .join(';'),
    );
    /* L'écart moyen entre le plus ancien et le plus récent retour du carnet,
       posé juste sous ses deux bouts : la période que l'archive couvre, puis
       ce qu'elle pèse en moyenne d'un retour daté à l'autre — lus sur la même
       liste que les deux bouts, le retour le plus récent de chaque écran
       faisant foi. Un carnet vide ne se divise pas, et le dit calmement. */
    const ecartBoutsCarnet =
      boutAncienCarnet && boutRecentCarnet
        ? joursEntre(boutAncienCarnet.retour, boutRecentCarnet.retour)
        : 0;
    const retoursDatesCarnet = ecransRepartisCsv.length;
    const ecartMoyenBoutsCarnet =
      retoursDatesCarnet > 1 ? ecartBoutsCarnet / (retoursDatesCarnet - 1) : 0;
    lignes.push(
      [
        'Écrans à retours datés de tout le carnet — l’écart moyen entre le plus ancien et le plus récent retour',
        String(retoursDatesCarnet),
        !boutAncienCarnet || !boutRecentCarnet
          ? 'le carnet est vide, il n’y a pas d’écart à mesurer'
          : retoursDatesCarnet <= 1
            ? `un seul retour daté au carnet, le ${jour(
                boutRecentCarnet.retour,
                lang,
              )} : l’écart ne se divise pas`
            : `${ecartBoutsCarnet} jour(s) séparent le plus ancien retour, le ${jour(
                boutAncienCarnet.retour,
                lang,
              )}, du plus récent, le ${jour(
                boutRecentCarnet.retour,
                lang,
              )} · soit ${nombre(
                ecartMoyenBoutsCarnet,
                1,
              )} jour(s) en moyenne entre deux retours datés du carnet sur ${retoursDatesCarnet} retour(s)`,
        retoursDatesCarnet > 0
          ? carnetParDate
              .map(
                (item) =>
                  `${item.ecran} — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran au carnet',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Les deux bouts des seuls écrans du milieu exact, posés sous leurs parts :
       le fichier dit aussi quelle période ce lot couvre, lu sur les mêmes
       lignes que les parts ci-dessus, le retour le plus récent de chaque
       écran faisant foi. Un lot vide le dit calmement. */
    const milieuExactParDate = [...ecransResteMilieuExactCsv].sort(
      (a, b) => new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    );
    const boutAncienMilieuExact = milieuExactParDate[0] ?? null;
    const boutRecentMilieuExact =
      milieuExactParDate[milieuExactParDate.length - 1] ?? null;
    lignes.push(
      [
        'Écrans à retours datés du milieu exact — le retour le plus ancien et le plus récent',
        String(ecransResteMilieuExactCsv.length),
        boutAncienMilieuExact && boutRecentMilieuExact
          ? `le plus ancien : « ${boutAncienMilieuExact.ecran} », revenu le ${jour(
              boutAncienMilieuExact.retour,
              lang,
            )} après ${joursEntre(
              boutAncienMilieuExact.retrait,
              boutAncienMilieuExact.retour,
            )} jour(s) · le plus récent : « ${boutRecentMilieuExact.ecran} », revenu le ${jour(
              boutRecentMilieuExact.retour,
              lang,
            )} après ${joursEntre(
              boutRecentMilieuExact.retrait,
              boutRecentMilieuExact.retour,
            )} jour(s)${
              boutAncienMilieuExact.ecran === boutRecentMilieuExact.ecran
                ? ' · le même écran porte les deux bouts, un seul retour daté'
                : ` · ${joursEntre(
                    boutAncienMilieuExact.retour,
                    boutRecentMilieuExact.retour,
                  )} jour(s) séparent les deux retours`
            }`
          : 'aucun écran du reste ne tombe exactement sur le milieu, il n’y a pas de bout à nommer',
        ecransResteMilieuExactCsv.length > 0
          ? milieuExactParDate
              .map(
                (item) =>
                  `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
              )
              .join(' · ')
          : 'aucun écran du milieu exact',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans du lot réuni du trimestre fermé et de l’année
       fermée représentent dans tout le carnet, posée juste sous celle de
       l’année fermée : la ligne se lit sur la même liste d’écrans et le même
       retour le plus récent que les deux fenêtres, si bien qu’elle ne peut pas
       les contredire. Le trimestre fermé étant déjà contenu dans l’année
       fermée, aucun écran n’y pèse deux fois. Un carnet vide ne se divise
       pas, et le dit calmement. */
    const ecransRetoursDatesTrimestreFermeAnneeFermeCsv = ecransRepartisCsv.flatMap(
      (item) => {
        const apres = retoursCarnet
          .filter((retour) => retour.ecran === item.ecran)
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (
          !retour ||
          (!estTrimestreFerme(retour.retour, maintenant) &&
            !estAnneeFermee(retour.retour, maintenant))
        ) {
          return [];
        }
        return [{ ...item, retour: retour.retour }];
      },
    );
    const partRetoursDatesTrimestreFermeAnneeFerme =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesTrimestreFermeAnneeFermeCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du lot réuni du trimestre fermé et de l’année fermée dans tout le carnet',
        String(ecransRetoursDatesTrimestreFermeAnneeFermeCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesTrimestreFermeAnneeFermeCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus sur le trimestre fermé ou l’année fermée avec une date · ${partRetoursDatesTrimestreFermeAnneeFerme} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesTrimestreFermeAnneeFermeCsv.length > 0
          ? ecransRetoursDatesTrimestreFermeAnneeFermeCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date sur le trimestre fermé ni l’année fermée',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans du lot réuni de l’année fermée et du mois dernier
       représentent dans tout le carnet, posée juste sous celle de l’année
       fermée : la ligne se lit sur la même liste d’écrans et le même retour le
       plus récent que les deux fenêtres, si bien qu’elle ne peut pas les
       contredire. Le mois dernier étant déjà compté dans l’année, aucun écran
       n’y pèse deux fois. Un carnet vide ne se divise pas, et le dit
       calmement. */
    const ecransRetoursDatesAnneeFermeeMoisDernierCsv = ecransRepartisCsv.flatMap(
      (item) => {
        const apres = retoursCarnet
          .filter((retour) => retour.ecran === item.ecran)
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (
          !retour ||
          (!estAnneeFermee(retour.retour, maintenant) &&
            !estMoisDernier(retour.retour, maintenant))
        ) {
          return [];
        }
        return [{ ...item, retour: retour.retour }];
      },
    );
    const partRetoursDatesAnneeFermeeMoisDernier =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesAnneeFermeeMoisDernierCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du lot réuni de l’année fermée et du mois dernier dans tout le carnet',
        String(ecransRetoursDatesAnneeFermeeMoisDernierCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesAnneeFermeeMoisDernierCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus sur l’année fermée ou le mois dernier avec une date · ${partRetoursDatesAnneeFermeeMoisDernier} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesAnneeFermeeMoisDernierCsv.length > 0
          ? ecransRetoursDatesAnneeFermeeMoisDernierCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date sur l’année fermée ni le mois dernier',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans du lot réuni de l’année fermée et de
       l’avant-dernier mois représentent dans tout le carnet, posée juste sous
       celle de l’année fermée : la ligne se lit sur la même liste d’écrans et
       le même retour le plus récent que les deux fenêtres, si bien qu’elle ne
       peut pas les contredire. L’avant-dernier mois étant déjà contenu dans
       l’année, aucun écran n’y pèse deux fois. Un carnet vide ne se divise
       pas, et le dit calmement. */
    const ecransRetoursDatesAnneeFermeeAvantDernierMoisCsv =
      ecransRepartisCsv.flatMap((item) => {
        const apres = retoursCarnet
          .filter((retour) => retour.ecran === item.ecran)
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (
          !retour ||
          (!estAnneeFermee(retour.retour, maintenant) &&
            !estAvantDernierMois(retour.retour, maintenant))
        ) {
          return [];
        }
        return [{ ...item, retour: retour.retour }];
      });
    const partRetoursDatesAnneeFermeeAvantDernierMois =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesAnneeFermeeAvantDernierMoisCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du lot réuni de l’année fermée et de l’avant-dernier mois dans tout le carnet',
        String(ecransRetoursDatesAnneeFermeeAvantDernierMoisCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesAnneeFermeeAvantDernierMoisCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus sur l’année fermée ou l’avant-dernier mois avec une date · ${partRetoursDatesAnneeFermeeAvantDernierMois} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesAnneeFermeeAvantDernierMoisCsv.length > 0
          ? ecransRetoursDatesAnneeFermeeAvantDernierMoisCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date sur l’année fermée ni l’avant-dernier mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans du lot réuni de l’année fermée et du mois en
       cours représentent dans tout le carnet, posée juste sous celle de
       l’année fermée : la ligne se lit sur la même liste d’écrans et le même
       retour le plus récent que les deux fenêtres, si bien qu’elle ne peut pas
       les contredire. Les deux fenêtres ne se recouvrant pas — l’année fermée
       s’arrête la veille du mois courant —, aucun écran n’y pèse deux fois. Un
       carnet vide ne se divise pas, et le dit calmement. */
    const ecransRetoursDatesAnneeFermeeMoisEnCoursCsv = ecransRepartisCsv.flatMap(
      (item) => {
        const apres = retoursCarnet
          .filter((retour) => retour.ecran === item.ecran)
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (
          !retour ||
          (!estAnneeFermee(retour.retour, maintenant) &&
            !estMoisEnCours(retour.retour, maintenant))
        ) {
          return [];
        }
        return [{ ...item, retour: retour.retour }];
      },
    );
    const partRetoursDatesAnneeFermeeMoisEnCours =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesAnneeFermeeMoisEnCoursCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du lot réuni de l’année fermée et du mois en cours dans tout le carnet',
        String(ecransRetoursDatesAnneeFermeeMoisEnCoursCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesAnneeFermeeMoisEnCoursCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus sur l’année fermée ou le mois en cours avec une date · ${partRetoursDatesAnneeFermeeMoisEnCours} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesAnneeFermeeMoisEnCoursCsv.length > 0
          ? ecransRetoursDatesAnneeFermeeMoisEnCoursCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date sur l’année fermée ni le mois en cours',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans du lot réuni du mois en cours et du mois dernier
       représentent dans tout le carnet, posée juste sous celle de l’année
       fermée et du mois en cours : la ligne se lit sur la même liste d’écrans
       et le même retour le plus récent que les deux mois, si bien qu’elle ne
       peut pas les contredire. Les deux mois ne se recouvrant pas, aucun
       écran n’y pèse deux fois. Un carnet vide ne se divise pas, et le dit
       calmement. */
    const ecransRetoursDatesMoisEnCoursMoisDernierCsv = ecransRepartisCsv.flatMap(
      (item) => {
        const apres = retoursCarnet
          .filter((retour) => retour.ecran === item.ecran)
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (
          !retour ||
          (!estMoisEnCours(retour.retour, maintenant) &&
            !estMoisDernier(retour.retour, maintenant))
        ) {
          return [];
        }
        return [{ ...item, retour: retour.retour }];
      },
    );
    const partRetoursDatesMoisEnCoursMoisDernier =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesMoisEnCoursMoisDernierCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du lot réuni du mois en cours et du mois dernier dans tout le carnet',
        String(ecransRetoursDatesMoisEnCoursMoisDernierCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesMoisEnCoursMoisDernierCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus ce mois-ci ou le mois dernier avec une date · ${partRetoursDatesMoisEnCoursMoisDernier} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesMoisEnCoursMoisDernierCsv.length > 0
          ? ecransRetoursDatesMoisEnCoursMoisDernierCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date ce mois-ci ni le mois dernier',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans du lot réuni de l’avant-dernier mois et du mois
       en cours représentent dans tout le carnet, posée juste sous celle du
       mois en cours et du mois dernier : la ligne se lit sur la même liste
       d’écrans et le même retour le plus récent que les deux mois, si bien
       qu’elle ne peut pas les contredire. Les deux mois ne se recouvrant pas,
       aucun écran n’y pèse deux fois. Un carnet vide ne se divise pas, et le
       dit calmement. */
    const ecransRetoursDatesAvantDernierMoisMoisEnCoursCsv = ecransRepartisCsv.flatMap(
      (item) => {
        const apres = retoursCarnet
          .filter((retour) => retour.ecran === item.ecran)
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (
          !retour ||
          (!estAvantDernierMois(retour.retour, maintenant) &&
            !estMoisEnCours(retour.retour, maintenant))
        ) {
          return [];
        }
        return [{ ...item, retour: retour.retour }];
      },
    );
    const partRetoursDatesAvantDernierMoisMoisEnCours =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesAvantDernierMoisMoisEnCoursCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du lot réuni de l’avant-dernier mois et du mois en cours dans tout le carnet',
        String(ecransRetoursDatesAvantDernierMoisMoisEnCoursCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesAvantDernierMoisMoisEnCoursCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus l’avant-dernier mois ou ce mois-ci avec une date · ${partRetoursDatesAvantDernierMoisMoisEnCours} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesAvantDernierMoisMoisEnCoursCsv.length > 0
          ? ecransRetoursDatesAvantDernierMoisMoisEnCoursCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date l’avant-dernier mois ni ce mois-ci',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans du lot réuni du mois dernier et du trimestre en
       cours représentent dans tout le carnet, posée sous celle de
       l’avant-dernier mois et du mois en cours : la ligne se lit sur la même
       liste d’écrans et le même retour le plus récent que les deux fenêtres,
       si bien qu’elle ne peut pas les contredire. Le mois dernier étant déjà
       compté dans le trimestre, aucun écran n’y pèse deux fois. Un carnet
       vide ne se divise pas, et le dit calmement. */
    const ecransRetoursDatesMoisDernierTrimestreCsv = ecransRepartisCsv.flatMap(
      (item) => {
        const apres = retoursCarnet
          .filter((retour) => retour.ecran === item.ecran)
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (!retour) return [];
        const dansTrimestre =
          new Date(retour.retour).getTime() >= depuisTrimestrePart.getTime();
        if (!estMoisDernier(retour.retour, maintenant) && !dansTrimestre) {
          return [];
        }
        return [{ ...item, retour: retour.retour }];
      },
    );
    const partRetoursDatesMoisDernierTrimestre =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesMoisDernierTrimestreCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du lot réuni du mois dernier et du trimestre en cours dans tout le carnet',
        String(ecransRetoursDatesMoisDernierTrimestreCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesMoisDernierTrimestreCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus le mois dernier ou ces trois derniers mois avec une date · ${partRetoursDatesMoisDernierTrimestre} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesMoisDernierTrimestreCsv.length > 0
          ? ecransRetoursDatesMoisDernierTrimestreCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date le mois dernier ni ces trois derniers mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La part que les écrans du lot réuni de l’année fermée et du trimestre
       en cours représentent dans tout le carnet, posée juste sous celle du
       mois dernier et du trimestre en cours : la ligne se lit sur la même
       liste d’écrans et le même retour le plus récent que les deux fenêtres,
       si bien qu’elle ne peut pas les contredire. Le mois en cours restant
       dehors de l’année fermée, aucun écran n’y pèse deux fois ; un carnet
       vide ne se divise pas, et le dit calmement. */
    const ecransRetoursDatesAnneeFermeeTrimestreCsv = ecransRepartisCsv.flatMap(
      (item) => {
        const apres = retoursCarnet
          .filter((retour) => retour.ecran === item.ecran)
          .sort(
            (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
          );
        const retour = apres[0];
        if (!retour) return [];
        const dansTrimestre =
          new Date(retour.retour).getTime() >= depuisTrimestrePart.getTime();
        if (!estAnneeFermee(retour.retour, maintenant) && !dansTrimestre) {
          return [];
        }
        return [{ ...item, retour: retour.retour }];
      },
    );
    const partRetoursDatesAnneeFermeeTrimestre =
      ecransRepartisCsv.length > 0
        ? Math.round(
            (ecransRetoursDatesAnneeFermeeTrimestreCsv.length /
              ecransRepartisCsv.length) *
              100,
          )
        : 0;
    lignes.push(
      [
        'Écrans à retours datés du lot réuni de l’année fermée et du trimestre en cours dans tout le carnet',
        String(ecransRetoursDatesAnneeFermeeTrimestreCsv.length),
        ecransRepartisCsv.length > 0
          ? `${ecransRetoursDatesAnneeFermeeTrimestreCsv.length} sur ${ecransRepartisCsv.length} écran(s) du carnet sont revenus sur l’année fermée ou ces trois derniers mois avec une date · ${partRetoursDatesAnneeFermeeTrimestre} % du carnet`
          : 'le carnet est vide',
        ecransRetoursDatesAnneeFermeeTrimestreCsv.length > 0
          ? ecransRetoursDatesAnneeFermeeTrimestreCsv
              .map((item) => `${item.ecran} — ${jour(item.retour, lang)}`)
              .join(' · ')
          : 'aucun écran du carnet n’est revenu avec une date sur l’année fermée ni ces trois derniers mois',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le délai médian du lot réuni de l’année fermée et du trimestre en cours,
       posé juste sous sa part : le même retour le plus récent de chaque écran
       fait foi, et le mois en cours restant dehors de l’année fermée, aucun
       écran n’y pèse deux fois — la ligne ne peut donc pas contredire celles
       du dessus. Un lot vide le dit calmement. */
    const delaiAnneeFermeeTrimestre = delaisDeRetour((item) => {
      if (estAnneeFermee(item.retour, maintenant)) return true;
      return new Date(item.retour).getTime() >= depuisTrimestrePart.getTime();
    });
    lignes.push(
      [
        'Délai médian des retours datés du lot réuni de l’année fermée et du trimestre en cours',
        String(delaiAnneeFermeeTrimestre.n),
        delaiAnneeFermeeTrimestre.n > 0
          ? `${nombre(delaiAnneeFermeeTrimestre.mediane, 1)} jour(s) au milieu du lot de ${delaiAnneeFermeeTrimestre.n} retour(s) daté(s) · à comparer à l’année fermée : ${nombre(delaiAnneeFermee.mediane, 1)} jour(s) · trimestre en cours : ${nombre(delaiTrimestre.mediane, 1)} jour(s)`
          : 'aucun retour daté sur l’année fermée ni le trimestre en cours',
        delaiAnneeFermeeTrimestre.n > 0
          ? `La moitié des retours datés de l’année fermée et du trimestre en cours revient en ${nombre(delaiAnneeFermeeTrimestre.mediane, 1)} jour(s) ou moins, l’autre moitié au-delà`
          : 'aucun écran revenu sur l’année fermée ni le trimestre en cours',
      ]
        .map(cellule)
        .join(';'),
    );
    /* Le total cumulé de tous les écrans repartis, posé juste sous la ligne de
       la semaine : chaque retour suivi d'un retrait compte pour un départ, si
       bien qu'un écran revenu puis reparti deux fois pèse deux gestes — là où
       la ligne de total par écran n'en garde qu'un. Les deux se comptent sur
       les mêmes historiques, la semaine en tête de ce total. */
    const premierRetourParEcran = new Map<string, number>();
    (retoursRepartis.length > 0 ? retoursRepartis : readEcransRetours()).forEach(
      (retour) => {
        const t = new Date(retour.retour).getTime();
        if (Number.isNaN(t)) return;
        const avant = premierRetourParEcran.get(retour.ecran);
        if (avant === undefined || t < avant) premierRetourParEcran.set(retour.ecran, t);
      },
    );
    const cumulParEcran: {
      ecran: string;
      n: number;
      premier: string;
      dernier: string;
    }[] = [];
    premierRetourParEcran.forEach((depuis, ecran) => {
      const apres = retraitsRepartis.filter(
        (item) => item.ecran === ecran && new Date(item.date).getTime() > depuis,
      );
      if (apres.length === 0) return;
      const dernier = apres.reduce((garde, courant) =>
        new Date(courant.date).getTime() > new Date(garde.date).getTime()
          ? courant
          : garde,
      );
      /* Le premier départ de cet écran, sous le même retour : la période du
         total cumulé se lit de son premier geste à son dernier, écran par
         écran, sur les mêmes lignes que le compte. */
      const premier = apres.reduce((garde, courant) =>
        new Date(courant.date).getTime() < new Date(garde.date).getTime()
          ? courant
          : garde,
      );
      cumulParEcran.push({
        ecran,
        n: apres.length,
        premier: premier.date,
        dernier: dernier.date,
      });
    });
    cumulParEcran.sort(
      (a, b) =>
        b.n - a.n ||
        new Date(b.dernier).getTime() - new Date(a.dernier).getTime() ||
        a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' }),
    );
    const gestesCumules = cumulParEcran.reduce((somme, item) => somme + item.n, 0);
    lignes.push(
      [
        'Total cumulé des écrans repartis',
        String(gestesCumules),
        `${cumulParEcran.length} écran(s) distinct(s)`,
        cumulParEcran.length > 0
          ? cumulParEcran
              .map((item) => `${item.ecran} — ${item.n} départ(s)`)
              .join(' · ')
          : 'aucun départ cumulé',
      ]
        .map(cellule)
        .join(';'),
    );
    /* La période du total cumulé, sur sa propre ligne, à côté de son compte :
       du premier au dernier départ, lus sur les mêmes écrans que la ligne du
       dessus. Un seul départ ne fait aucun écart, et la ligne le dit plutôt
       que d'afficher un zéro nu. */
    const tempsCumules = cumulParEcran
      .flatMap((item) => [
        new Date(item.premier).getTime(),
        new Date(item.dernier).getTime(),
      ])
      .filter((t) => !Number.isNaN(t));
    const premierDepart =
      tempsCumules.length > 0
        ? new Date(Math.min(...tempsCumules)).toISOString()
        : null;
    const dernierDepart =
      tempsCumules.length > 0
        ? new Date(Math.max(...tempsCumules)).toISOString()
        : null;
    lignes.push(
      [
        'Période du total cumulé des repartis',
        premierDepart && dernierDepart
          ? String(joursEntre(premierDepart, dernierDepart))
          : '0',
        premierDepart && dernierDepart
          ? premierDepart === dernierDepart
            ? `le ${jour(premierDepart, lang)} · un seul jour de départ`
            : `du ${jour(premierDepart, lang)} au ${jour(dernierDepart, lang)}`
          : 'aucun départ daté',
        `${cumulParEcran.length} écran(s) distinct(s) · ${gestesCumules} départ(s)`,
      ]
        .map(cellule)
        .join(';'),
    );
    lignes.push(
      [
        'Total des écrans repartis',
        String(ecransRepartisCsv.length),
        `${moisRepartisTries.length} mois`,
        ecransRepartisCsv
          .map((item) => `${item.ecran} — ${moisDe(item.retrait, lang)}`)
          .join(' · '),
      ]
        .map(cellule)
        .join(';'),
    );
  }

  /* Les retours au carnet et les retraits encore en cours, écran par écran :
     le geste se lit des deux côtés à la fois — ce qui est revenu, et ce qui
     manque encore au carnet. Les retours sont comptés sur l'historique des
     retours, un geste par entrée ; les retraits en cours sur la liste des
     écrans qu'un second appui sur leur nom a vidés et que personne n'a encore
     ramenés. Un écran retiré qui n'est jamais revenu garde donc sa ligne, avec
     zéro retour et son retrait en cours. */
  const retoursParEcran = new Map<string, number>();
  retoursCarnet.forEach((item) => {
    retoursParEcran.set(item.ecran, (retoursParEcran.get(item.ecran) ?? 0) + 1);
  });
  const retraitsEnCours = new Map<string, number>();
  retiresNom.forEach((item) => {
    retraitsEnCours.set(item.ecran, (retraitsEnCours.get(item.ecran) ?? 0) + 1);
  });
  const ecransRetoursEtRetraits = [
    ...new Set<string>([...retoursParEcran.keys(), ...retraitsEnCours.keys()]),
  ].sort(
    (a, b) =>
      (retoursParEcran.get(b) ?? 0) - (retoursParEcran.get(a) ?? 0) ||
      (retraitsEnCours.get(b) ?? 0) - (retraitsEnCours.get(a) ?? 0) ||
      a.localeCompare(b, 'fr', { sensitivity: 'base' }),
  );
  if (ecransRetoursEtRetraits.length > 0) {
    const totalRetours = [...retoursParEcran.values()].reduce(
      (somme, n) => somme + n,
      0,
    );
    const totalEnCours = [...retraitsEnCours.values()].reduce(
      (somme, n) => somme + n,
      0,
    );
    lignes.push('');
    lignes.push(
      [
        'Retours au carnet et retraits encore en cours, par écran',
        'Retours',
        'Retraits en cours',
        'Ces écrans',
      ]
        .map(cellule)
        .join(';'),
    );
    ecransRetoursEtRetraits.forEach((nom) => {
      const retours = retoursParEcran.get(nom) ?? 0;
      const encours = retraitsEnCours.get(nom) ?? 0;
      lignes.push(
        [
          nom,
          String(retours),
          String(encours),
          encours > 0 ? 'retrait encore en cours' : 'revenu au carnet',
        ]
          .map(cellule)
          .join(';'),
      );
    });
    lignes.push(
      [
        'Total des retours et des retraits en cours',
        String(totalRetours),
        String(totalEnCours),
        ecransRetoursEtRetraits
          .map((nom) => {
            const retours = retoursParEcran.get(nom) ?? 0;
            const encours = retraitsEnCours.get(nom) ?? 0;
            const bouts = [`${retours} retour(s)`];
            if (encours > 0) bouts.push(`${encours} retrait(s) en cours`);
            return `${nom} — ${bouts.join(' · ')}`;
          })
          .join(' · '),
      ]
        .map(cellule)
        .join(';'),
    );
  }

  /* Le nombre de jetons posés sur le carnet au moment du clic : deux
     archives du même jour, l’une prise avant de resserrer la lecture et
     l’autre après, ne portent plus le même chiffre et se distinguent. */
  const jetonsPoses = Number.isFinite(jetons) && jetons > 0 ? Math.floor(jetons) : 0;
  lignes.push(
    [
      'Jetons posés au téléchargement',
      String(jetonsPoses),
      '',
      jetonsPoses > 0 ? 'le carnet était resserré' : 'carnet entier',
    ]
      .map(cellule)
      .join(';'),
  );
  lignes.push(
    [
      `${carnet.total} visite(s) rendue(s) sur cet appareil`,
      '',
      '',
      carnet.dernier ? `dernier oubli le ${jour(carnet.dernier, lang)}` : 'aucun oubli daté',
    ]
      .map(cellule)
      .join(';'),
  );
  lignes.push(
    [`Carnet de cet appareil · version ${SUIVI_VERSION}`, '', '', ''].map(cellule).join(';'),
  );

  /* Les deux bouts de tout le carnet, reposés à la fin du fichier : la
     dernière ligne referme l'archive sur la période qu'elle couvre — du
     retour le plus ancien au plus récent, lus sur la même liste d'écrans que
     le reste du fichier, le retour le plus récent de chaque écran faisant
     foi. Un carnet vide le dit calmement. */
  const carnetBoutsParDate = [...ecransRepartisCsv].sort(
    (a, b) => new Date(a.retour).getTime() - new Date(b.retour).getTime(),
  );
  const boutAncienCarnetFin = carnetBoutsParDate[0] ?? null;
  const boutRecentCarnetFin =
    carnetBoutsParDate[carnetBoutsParDate.length - 1] ?? null;
  lignes.push(
    [
      'Le retour le plus ancien et le plus récent de tout le carnet',
      String(ecransRepartisCsv.length),
      boutAncienCarnetFin && boutRecentCarnetFin
        ? `le plus ancien : « ${boutAncienCarnetFin.ecran} », revenu le ${jour(
            boutAncienCarnetFin.retour,
            lang,
          )} après ${joursEntre(
            boutAncienCarnetFin.retrait,
            boutAncienCarnetFin.retour,
          )} jour(s) · le plus récent : « ${boutRecentCarnetFin.ecran} », revenu le ${jour(
            boutRecentCarnetFin.retour,
            lang,
          )} après ${joursEntre(
            boutRecentCarnetFin.retrait,
            boutRecentCarnetFin.retour,
          )} jour(s)${
            boutAncienCarnetFin.ecran === boutRecentCarnetFin.ecran
              ? ' · le même écran porte les deux bouts, un seul retour daté'
              : ` · ${joursEntre(
                  boutAncienCarnetFin.retour,
                  boutRecentCarnetFin.retour,
                )} jour(s) séparent les deux retours`
          }`
        : 'le carnet est vide, il n’y a pas de bout à nommer',
      ecransRepartisCsv.length > 0
        ? carnetBoutsParDate
            .map(
              (item) =>
                `${item.ecran} — ${joursEntre(item.retrait, item.retour)} jour(s) — ${jour(item.retour, lang)}`,
            )
            .join(' · ')
        : 'aucun écran au carnet',
    ]
      .map(cellule)
      .join(';'),
  );

  /* Le poids du fichier lu par son autre bout : les blocs qui portent le moins
     de lignes, comptés sur les lignes déjà posées et nommés un à un. Le bloc
     de cette ligne ne s'y compte pas lui-même, et l'intitulé le dit — le bloc
     le plus lourd, lui, se lit au survol du bouton dans la console. Un fichier
     sans bloc le dit calmement plutôt que d'inventer un compte. */
  const blocsFichier = lignes.reduce<{ titre: string; lignes: number }[]>(
    (blocs, ligne, rang) => {
      if (ligne.trim() === '') return blocs;
      const precedentVide = rang === 0 || lignes[rang - 1].trim() === '';
      if (precedentVide) {
        const champ = ligne.match(/^"((?:[^"]|"")*)"/);
        blocs.push({
          titre: champ ? champ[1].replace(/""/g, '"') : ligne.split(';')[0],
          lignes: 1,
        });
        return blocs;
      }
      blocs[blocs.length - 1].lignes += 1;
      return blocs;
    },
    [],
  );
  const lignesDuPlusLeger = blocsFichier.reduce(
    (garde, bloc) => Math.min(garde, bloc.lignes),
    Number.POSITIVE_INFINITY,
  );
  const blocsLesPlusLegers = blocsFichier.filter(
    (bloc) => bloc.lignes === lignesDuPlusLeger,
  );
  lignes.push('');
  lignes.push(
    [
      'Blocs les plus légers du fichier — cette ligne non comprise',
      'Blocs',
      'Lignes par bloc',
      'Ces blocs',
    ]
      .map(cellule)
      .join(';'),
  );
  lignes.push(
    [
      'Les blocs les plus légers du fichier',
      String(blocsLesPlusLegers.length),
      blocsFichier.length > 0 ? String(lignesDuPlusLeger) : '0',
      blocsFichier.length === 0
        ? 'le fichier ne porte aucun bloc avant cette ligne'
        : `${blocsLesPlusLegers.length} sur ${blocsFichier.length} bloc(s) du fichier portent le moins de lignes — ${lignesDuPlusLeger} ligne(s) chacun · à comparer au bloc le plus lourd, nommé au survol du bouton CSV`,
    ]
      .map(cellule)
      .join(';'),
  );

  return `\uFEFF${lignes.join('\r\n')}\r\n`;
}

/** Le geste du bouton posé sous la liste : le carnet des visites rendues. */
/** Un bloc du CSV du carnet : son intitulé, puis ses lignes comptées. */
export type BlocOublisCsv = { titre: string; lignes: number };

/**
 * Les lignes du carnet, comptées bloc par bloc.
 *
 * Le fichier se construit une seule fois ici, puis se relit ligne à ligne :
 * un bloc commence à son intitulé, et se referme sur la ligne vide qui le
 * sépare du suivant. Le compte du survol est donc celui du fichier lui-même —
 * jamais un chiffre écrit à côté, qui pourrait vieillir sans le fichier.
 */
export function blocsOublisCsv(lang: Lang = 'fr', jetons = 0): BlocOublisCsv[] {
  const texte = oublisPortesCsv(lang, jetons).replace(/^\uFEFF/, '');
  const blocs: BlocOublisCsv[] = [];
  let courant: BlocOublisCsv | null = null;
  texte.split(/\r?\n/).forEach((ligne) => {
    if (ligne.trim() === '') {
      courant = null;
      return;
    }
    if (!courant) {
      const premiere = ligne
        .split(';')[0]
        .replace(/^"|"$/g, '')
        .replace(/""/g, '"');
      courant = { titre: premiere, lignes: 0 };
      blocs.push(courant);
    }
    courant.lignes += 1;
  });
  return blocs;
}

/** Le compte du fichier : ses lignes, puis ses blocs, lus sur le même texte. */
export function compteLignesOublisCsv(
  lang: Lang = 'fr',
  jetons = 0,
): { lignes: number; blocs: BlocOublisCsv[] } {
  const blocs = blocsOublisCsv(lang, jetons);
  return {
    lignes: blocs.reduce((somme, bloc) => somme + bloc.lignes, 0),
    blocs,
  };
}

export function telechargerOublisPortes(lang: Lang = 'fr', jetons = 0): void {
  const blob = new Blob([oublisPortesCsv(lang, jetons)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = NOM_FICHIER_OUBLIS;
  lien.rel = 'noopener';
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Le nombre de jours, dit dans la langue du lecteur. */
function ageEnMots(jours: number, lang: Lang = 'fr'): string {
  if (lang === 'ar') {
    if (jours <= 0) return 'اليوم';
    if (jours === 1) return 'قبل يوم واحد';
    return `قبل ${jours} يومًا`;
  }
  if (lang === 'en') {
    if (jours <= 0) return 'today';
    if (jours === 1) return 'a day ago';
    return `${jours} days ago`;
  }
  if (jours <= 0) return 'aujourd’hui';
  if (jours === 1) return 'il y a 1 jour';
  return `il y a ${jours} jours`;
}

/**
 * L'état de la clé et du domaine, lu dans le plan lui-même : les deux points
 * ouverts de la liste ci-dessus portent ces faits. L'archive ne peut donc pas
 * dire « posée » quand le plan dit encore « à poser ».
 */
function etatExpediteur(): { cle: boolean; domaine: boolean } {
  const cle = SUIVI_RESTE.find((item) => item.texte.includes('BREVO_API_KEY'));
  const domaine = SUIVI_RESTE.find((item) => item.texte.includes('Domaine vérifié'));
  return { cle: Boolean(cle?.fait), domaine: Boolean(domaine?.fait) };
}

/**
 * La prochaine étape de l'expéditeur, nommée d'un mot.
 *
 * Les trois états — la clé, le domaine, le test — se lisent chacun de leur
 * côté ; cette ligne dit par quoi continuer, dans l'ordre où le guide les
 * fait. Quand les trois sont tenus, elle ne propose rien et le dit.
 */
function prochaineEtapeExpediteur(exp: { cle: boolean; domaine: boolean }): string {
  if (!exp.cle) return 'poser la clé BREVO_API_KEY dans les secrets Supabase';
  if (!exp.domaine) {
    return 'vérifier le domaine chez Brevo, puis le nommer dans MAIL_FROM_DOMAIN';
  }
  const preuve = readPreuve();
  if (!preuve) return 'envoyer un test et le recevoir — le domaine n’est pas encore prouvé';
  const age = preuveAgeJours(preuve);
  if (age !== null && age > 30) {
    return 'relancer un test et le recevoir — la preuve a plus d’un mois';
  }
  return 'aucune : la clé, le domaine et la preuve sont tenus — relancer un test au-delà d’un mois';
}

/**
 * La dernière preuve, telle qu'elle se lit dans l'archive.
 *
 * Le document reste en français — c'est la langue du travail —, mais la date
 * et son âge s'écrivent dans la langue du lecteur : un mois et un nombre de
 * jours se nomment dans sa langue, pas dans celle du fichier.
 */
function lignePreuve(lang: Lang = 'fr'): string {
  const preuve = readPreuve();
  if (!preuve) return 'aucun test reçu — le domaine n’est pas encore prouvé';
  const age = preuveAgeJours(preuve);
  const date = jour(preuve, lang);
  if (age === null) return `test reçu le ${date}`;
  const vieille = age > 30 ? ' — plus d’un mois, à rafraîchir par un nouveau test' : '';
  return `test reçu le ${date} (${ageEnMots(age, lang)})${vieille}`;
}

/**
 * Les journées qui séparent deux gestes du carnet.
 *
 * La mesure se prend sur les jours, non sur les heures : deux oublis du même
 * jour font zéro journée, et c'est ce que le survol doit dire, sans arrondi
 * trompeur. Une date illisible rend zéro plutôt qu'un écart inventé.
 */
export function joursEntre(depuis: string, jusqu: string): number {
  const a = new Date(depuis);
  const b = new Date(jusqu);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const jourA = Math.floor(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) / 86400000);
  const jourB = Math.floor(Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) / 86400000);
  return Math.abs(jourB - jourA);
}

/**
 * Le lundi à minuit de la semaine qui contient ce jour.
 *
 * La semaine se compte à la française — du lundi au dimanche —, et les heures
 * n'y entrent pas : deux gestes du même jour tombent dans la même semaine,
 * quelle que soit l'heure à laquelle ils ont été faits.
 */
export function debutSemaine(depuis: Date = new Date()): Date {
  const jour = new Date(depuis.getFullYear(), depuis.getMonth(), depuis.getDate());
  const rang = (jour.getDay() + 6) % 7;
  jour.setDate(jour.getDate() - rang);
  return jour;
}

/** Un oubli du carnet est-il tombé dans la semaine en cours ? */
export function estSemaineEnCours(date: string, maintenant: Date = new Date()): boolean {
  const geste = new Date(date);
  if (Number.isNaN(geste.getTime())) return false;
  const debut = debutSemaine(maintenant);
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + 7);
  return geste.getTime() >= debut.getTime() && geste.getTime() < fin.getTime();
}

/**
 * Un geste du carnet est-il tombé dans le mois en cours ?
 *
 * Le mois se compte sur le calendrier du poste, du premier jour au dernier :
 * un départ du 1er et un départ du 30 tombent dans le même mois, et un geste
 * du mois précédent n'y entre pas, quelle que soit l'heure du jour.
 */
/**
 * Un geste du carnet est-il tombé aujourd'hui ?
 *
 * Le jour se compte sur le calendrier du poste, sans les heures : deux gestes
 * du même jour tombent ensemble, quelle que soit l'heure à laquelle ils ont
 * été faits — et un geste d'hier n'y entre pas.
 */
export function estJourEnCours(date: string, maintenant: Date = new Date()): boolean {
  const geste = new Date(date);
  if (Number.isNaN(geste.getTime())) return false;
  return (
    geste.getFullYear() === maintenant.getFullYear() &&
    geste.getMonth() === maintenant.getMonth() &&
    geste.getDate() === maintenant.getDate()
  );
}

/**
 * Un geste du carnet est-il tombé la veille ?
 *
 * La veille se compte sur le calendrier du poste, sans les heures : le jour
 * d'avant, et lui seul — un geste du jour même ou d'il y a deux jours n'y
 * entre pas, quelle que soit l'heure à laquelle il a été fait.
 */
export function estJourVeille(date: string, maintenant: Date = new Date()): boolean {
  const geste = new Date(date);
  if (Number.isNaN(geste.getTime())) return false;
  const veille = new Date(
    maintenant.getFullYear(),
    maintenant.getMonth(),
    maintenant.getDate() - 1,
  );
  return (
    geste.getFullYear() === veille.getFullYear() &&
    geste.getMonth() === veille.getMonth() &&
    geste.getDate() === veille.getDate()
  );
}

/**
 * Un geste du carnet est-il tombé l'avant-veille ?
 *
 * L'avant-veille se compte sur le calendrier du poste, sans les heures : le
 * jour d'avant la veille, et lui seul — un geste du jour même, d'hier ou d'il
 * y a trois jours n'y entre pas, quelle que soit l'heure à laquelle il a été
 * fait.
 */
export function estJourAvantVeille(date: string, maintenant: Date = new Date()): boolean {
  const geste = new Date(date);
  if (Number.isNaN(geste.getTime())) return false;
  const avantVeille = new Date(
    maintenant.getFullYear(),
    maintenant.getMonth(),
    maintenant.getDate() - 2,
  );
  return (
    geste.getFullYear() === avantVeille.getFullYear() &&
    geste.getMonth() === avantVeille.getMonth() &&
    geste.getDate() === avantVeille.getDate()
  );
}

export function estMoisEnCours(date: string, maintenant: Date = new Date()): boolean {
  const geste = new Date(date);
  if (Number.isNaN(geste.getTime())) return false;
  return (
    geste.getFullYear() === maintenant.getFullYear() &&
    geste.getMonth() === maintenant.getMonth()
  );
}

/**
 * Un geste du carnet est-il tombé dans le mois dernier ?
 *
 * La fenêtre qui vient de se fermer : le mois qui précède celui du poste, du
 * premier jour au dernier. Un geste du mois en cours n'y entre pas, et un
 * geste de l'avant-dernier mois non plus — la fenêtre se relit seule, sans
 * dépendre de ce que le mois courant contient déjà.
 */
export function estMoisDernier(date: string, maintenant: Date = new Date()): boolean {
  const geste = new Date(date);
  if (Number.isNaN(geste.getTime())) return false;
  const veille = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
  return (
    geste.getFullYear() === veille.getFullYear() &&
    geste.getMonth() === veille.getMonth()
  );
}

/**
 * Un geste du carnet est-il tombé dans l'avant-dernier mois ?
 *
 * La seconde fenêtre fermée : le mois qui précède celui du mois dernier. Elle
 * ne se confond ni avec le mois en cours ni avec le mois dernier, et son
 * premier jour comme son dernier se lisent sur le calendrier du poste.
 */
export function estAvantDernierMois(
  date: string,
  maintenant: Date = new Date(),
): boolean {
  const geste = new Date(date);
  if (Number.isNaN(geste.getTime())) return false;
  const fenetre = new Date(
    maintenant.getFullYear(),
    maintenant.getMonth() - 2,
    1,
  );
  return (
    geste.getFullYear() === fenetre.getFullYear() &&
    geste.getMonth() === fenetre.getMonth()
  );
}

/**
 * Un geste du carnet est-il tombé dans le trimestre fermé ?
 *
 * Les trois mois qui précèdent le mois en cours, du premier jour du troisième
 * mois écoulé à la veille du mois courant : le mois en cours n'y entre pas,
 * et les trois mois se lisent d'un bloc, sans dépendre de ce que le mois
 * courant contient déjà. Un retour du mois dernier ou de l'avant-dernier y
 * tombe ; un retour de ce mois-ci reste dehors.
 */
export function estTrimestreFerme(
  date: string,
  maintenant: Date = new Date(),
): boolean {
  const geste = new Date(date);
  if (Number.isNaN(geste.getTime())) return false;
  const debut = new Date(maintenant.getFullYear(), maintenant.getMonth() - 3, 1);
  const fin = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  return geste.getTime() >= debut.getTime() && geste.getTime() < fin.getTime();
}

/**
 * Un geste du carnet est-il tombé dans l'année fermée ?
 *
 * Les douze mois qui précèdent le mois en cours, du premier jour du douzième
 * mois écoulé à la veille du mois courant : le mois en cours n'y entre pas, et
 * les douze mois se lisent d'un bloc, sans dépendre de ce qu'il contient déjà.
 * Un retour du trimestre fermé y tombe ; un retour de ce mois-ci reste dehors.
 */
export function estAnneeFermee(
  date: string,
  maintenant: Date = new Date(),
): boolean {
  const geste = new Date(date);
  if (Number.isNaN(geste.getTime())) return false;
  const debut = new Date(maintenant.getFullYear(), maintenant.getMonth() - 12, 1);
  const fin = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  return geste.getTime() >= debut.getTime() && geste.getTime() < fin.getTime();
}

/**
 * Les oublis du carnet tombés dans la semaine en cours, du plus récent au plus
 * ancien : le second jeton du carnet n'en garde pas d'autres, pour relire les
 * gestes récents avant d'en effacer un.
 */
export function oublisSemaine(
  carnet: PortesOublis = readOublisPortes(),
  maintenant: Date = new Date(),
): OubliPorte[] {
  return [...carnet.journal]
    .reverse()
    .filter((geste) => estSemaineEnCours(geste.date, maintenant));
}