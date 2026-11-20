import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import {
  SUIVI_BLOCAGES,
  SUIVI_CHANTIERS,
  SUIVI_DATE,
  SUIVI_MODULE_RESTE,
  SUIVI_MODULES,
  SUIVI_PHASES,
  SUIVI_RESTE,
  SUIVI_VERSION,
  SEUIL_CAP,
  ancreModule,
  avancementTotal,
  chantierLePlusLourd,
  livrablesOuvertsChantier,
  moduleLePlusLourdChantier,
  modulesAvantCap,
  modulesOuverts,
  pointsManquants,
  pointsManquantsChantier,
  pointsManquantsTotal,
  pointsModule,
  portesLignes,
  portesReste,
  chantierDePorte,
} from './adminSuiviPlan';
import {
  bornesOublis,
  compteLignesOublisCsv,
  estAnneeFermee,
  estAvantDernierMois,
  estJourAvantVeille,
  estJourEnCours,
  estJourVeille,
  estMoisDernier,
  estMoisEnCours,
  estSemaineEnCours,
  estTrimestreFerme,
  joursEntre,
  oublisParChantier as compteOublisParChantier,
  oublisParEcran as compteOublisParEcran,
  telechargerDescendus,
  telechargerOublisPortes,
  telechargerPlan,
  telechargerPointsManquants,
} from './adminSuiviTexte';
import {
  cleTelechargement,
  clearCapAtteint,
  clearModuleAtteint,
  clearModulesAtteints,
  clearTelechargement,
  clearTelechargements,
  markCapAtteint,
  markModuleAtteint,
  markTelechargement,
  readCapAtteint,
  readModulesAtteints,
  readModulesAtteintsDates,
  readModulesAtteintsLe,
  readTelechargements,
} from './adminSuiviMemory';
import { jour } from './adminTypes';
import AdminRelecture from './AdminRelecture';
import type { RelectureFocus } from './AdminRelecture';
import AdminSuiviDoors, { SuiviDoorFlag } from './AdminSuiviDoors';
import {
  clearOublisPortes,
  clearPortesVues,
  clearPorteVue,
  markEcranAppuye,
  markEcranRetireNom,
  markPorteVue,
  readEcranVideRecent,
  readEcransRetiresHist,
  readEcransRetiresNom,
  readEcransRetours,
  readEcransRetoursHist,
  readOublisPortes,
  readPortesVues,
  removeOubliPorte,
  type PortesOublis,
  type PortesVues,
} from './adminDoorMemory';
import { readAuthPreuve, readB2bTest, readPreuve } from './adminMailMemory';
import './admin-suivi.css';
import './admin-suivi-mail.css';

/** Le module des e-mails : sa ligne du tableau porte la même porte que le
 *  chantier, pour l'ouvrir depuis le poids des modules aussi. */
const MODULE_MAIL = 'E-mails transactionnels au nom de PaperAtlas';

/** L'ancre de la ligne des archives, dans le rappel : le compteur du cap y
 *  descend d'un appui, par le même mécanisme que les lignes du tableau. */
const ANCRE_ARCHIVES = 'suivi-ancre-archives';

/** L'état d'une phase, dit d'un mot et d'une couleur. */
const ETAT_PHASE = {
  fait: { cle: 'ad.suivi.etatFait', icone: 'ri-check-line' },
  encours: { cle: 'ad.suivi.etatEncours', icone: 'ri-loader-4-line' },
  avenir: { cle: 'ad.suivi.etatAvenir', icone: 'ri-time-line' },
} as const;

const ETAT_BLOCAGE = {
  ouvert: { cle: 'ad.suivi.blocOuvert', icone: 'ri-error-warning-line' },
  attente: { cle: 'ad.suivi.blocAttente', icone: 'ri-hourglass-line' },
  leve: { cle: 'ad.suivi.blocLeve', icone: 'ri-check-double-line' },
} as const;

/**
 * L'onglet « Suivi » : le fichier de pilotage du projet, lu depuis la console.
 *
 * Le pourcentage n'est pas recopié, il est calculé : la moyenne pondérée des
 * modules, exactement comme le document à la racine du projet. Un module qui
 * bouge change le total, sans qu'on ait à retoucher un chiffre à la main.
 *
 * Le contenu du plan est écrit en français — c'est la langue du document de
 * travail — et se lit de gauche à droite quel que soit l'affichage de la
 * console autour : un chiffre et une phrase ne se réordonnent pas.
 */
export default function AdminSuivi({
  relectureFocus = null,
  chantierFocus = null,
}: {
  relectureFocus?: RelectureFocus | null;
  /** Le chantier nommé par une porte de l'adresse : le rappel s'ouvre
   *  resserré sur lui, le temps qu'on le lise. */
  chantierFocus?: string | null;
}) {
  const { t, lang } = useLang();
  /* Les trois preuves d'envoi — confirmation, mot de passe, rappel B2B — lues
     sur la mémoire de cet appareil, et réunies en un seul compteur : trois
     gestes de nature différente, un même chiffre pour dire où l'on en est. */
  const preuves = useMemo(
    () => [
      { cle: 'confirmation', date: readPreuve(), label: t('ad.suivi.preuveConf') },
      { cle: 'password', date: readAuthPreuve(), label: t('ad.suivi.preuvePass') },
      { cle: 'b2b', date: readB2bTest(), label: t('ad.suivi.preuveB2b') },
    ],
    [t],
  );
  const preuvesFaites = preuves.filter((preuve) => Boolean(preuve.date)).length;
  /* Le détail de chaque preuve, avec son propre jour : trois lignes dans le
     survol, pour que la pastille dise la date de chacune, et pas seulement la
     plus récente d'entre elles. */
  const preuvesDetail = preuves
    .map((preuve) =>
      preuve.date
        ? t('ad.suivi.preuveAt')
            .replace('{label}', preuve.label)
            .replace('{date}', jour(preuve.date, lang))
        : t('ad.suivi.preuveNoDate').replace('{label}', preuve.label),
    )
    .join('\n');
  const total = avancementTotal(SUIVI_MODULES);
  const points = SUIVI_MODULES.reduce((somme, m) => somme + pointsModule(m), 0);
  /* Ce qui manque n'est pas recopié : c'est le complément exact des points
     acquis, lu module par module puis regroupé en quatre chantiers. */
  const manquants = pointsManquantsTotal(SUIVI_MODULES);
  const partRestante = 100 - total;
  const ouverts = modulesOuverts(SUIVI_MODULES);
  const plusLourd = ouverts.length > 0 ? ouverts[0].nom : '';
  /* Le chantier qui pèse le plus dans la part restante : c'est par lui que le
     pourcentage monte le plus vite, il se repère d'un coup d'œil. */
  const chantierFort = chantierLePlusLourd();
  /* Le cap 95 % : le gain des e-mails, le reste à franchir et leurs deux
     portes. Les chiffres se déduisent des poids du plan — jamais recopiés —,
     et la moyenne pondérée rend déjà le pourcentage, si bien que les points
     acquis se lisent sur le même total. */
  const moduleMail = SUIVI_MODULES.find((m) => m.nom === MODULE_MAIL) ?? null;
  const gainMail = moduleMail ? pointsManquants(moduleMail) : 0;
  const totalApresMail = points + gainMail;
  const resteCap = Math.max(0, SEUIL_CAP - points);
  const resteApresMail = Math.max(0, SEUIL_CAP - totalApresMail);
  /* Les modules qu'il faut encore avancer pour franchir le cap, du plus lourd
     au plus léger : la liste s'arrête dès que la somme des points manquants
     atteint ce qu'il reste à franchir. Elle se dit au survol du bloc, sans
     quitter l'onglet. */
  const modulesCap = modulesAvantCap(SEUIL_CAP, SUIVI_MODULES);
  const capHover =
    resteCap === 0
      ? t('ad.suivi.capHoverDone').replace('{seuil}', String(SEUIL_CAP))
      : [
          t('ad.suivi.capHoverHead')
            .replace('{n}', String(modulesCap.length))
            .replace('{seuil}', String(SEUIL_CAP)),
          ...modulesCap.map((module) =>
            t('ad.suivi.capHoverItem')
              .replace('{module}', module.nom)
              .replace('{pt}', pointsManquants(module).toFixed(2).replace('.', ',')),
          ),
          t('ad.suivi.capHoverFoot').replace(
            '{reste}',
            resteCap.toFixed(2).replace('.', ','),
          ),
        ].join('\n');
  /* Le jour où le cap a été franchi, retenu par cet appareil : le repère ne
     s'écrit qu'une fois, et se relit d'une visite à l'autre. */
  const [capDate, setCapDate] = useState<string | null>(() => readCapAtteint());
  useEffect(() => {
    if (resteCap > 0) return;
    const jourDuCap = markCapAtteint();
    setCapDate((avant) => avant ?? (jourDuCap || null));
  }, [resteCap]);
  /* La liste des modules qui restent avant le cap, dépliée d'un appui : au
     téléphone, le survol n'existe pas, et la liste doit se lire quand même. */
  const [capOuvert, setCapOuvert] = useState(false);
  /* La petite gomme du repère daté se demande en deux appuis, comme celle des
     archives : un premier l'arme, un second oublie la date sur cet appareil. */
  const [capGomme, setCapGomme] = useState(false);
  const oublierCap = () => {
    if (!capGomme) {
      setCapGomme(true);
      return;
    }
    clearCapAtteint();
    setCapDate(null);
    setCapGomme(false);
  };
  /* Les journées écoulées depuis le franchissement, lues sur la date retenue
     par cet appareil : le survol du repère les dit, sans qu'on ait à compter. */
  const capJours = capDate
    ? joursEntre(capDate, new Date().toISOString())
    : 0;
  const acheves = SUIVI_MODULES.filter((m) => m.avancement >= 100).length;
  const faits = SUIVI_RESTE.filter((item) => item.fait).length;
  /* Le fichier vient d'être téléchargé : le bouton le dit un court instant,
     pour que le geste ne reste pas sans réponse. */
  const [telecharge, setTelecharge] = useState(false);
  /* Le détail des points manquants se télécharge seul, et le bouton répond
     sur place, sans effacer la réponse de l'archive du plan. */
  const [manqueEmporte, setManqueEmporte] = useState(false);
  /* La liste des modules descendus part elle aussi seule, depuis le même bloc :
     sa réponse propre ne s'efface pas quand l'autre bouton répond. */
  const [descendusEmporte, setDescendusEmporte] = useState(false);
  /* L'archive du seul chantier resserré se télécharge depuis son rappel, avec
     sa réponse propre : le geste de l'archive entière ne s'efface pas. */
  const [chantierEmporte, setChantierEmporte] = useState(false);
  /* Le rappel resserré sur un seul chantier, quand une porte l'a nommé : il
     s'ouvre sur lui, et le geste qui élargit le rend aux quatre. */
  const [chantierSeul, setChantierSeul] = useState<string | null>(chantierFocus);

  /* La date de chaque archive emportée depuis cet appareil : le bouton dit
     quand la pièce est partie la dernière fois, sans ouvrir le fichier. */
  const [memoire, setMemoire] = useState<Record<string, string>>(() => readTelechargements());
  /* Les pièces encore à joindre, dépliées d'un appui : elles s'y lisent
     numérotées, dans l'ordre où elles partent — la première d'abord. */
  const [archivesOuvertes, setArchivesOuvertes] = useState(false);
  /* La pièce qui vient de partir depuis la liste numérotée : son nom s'affiche
     un instant sous la liste, pour que le geste ne reste pas sans réponse. */
  const [pieceEmportee, setPieceEmportee] = useState<string | null>(null);
  /* Les modules du tableau déjà atteints depuis cet appareil, lus sur la même
     mémoire que les ancres : la liste du cap dit combien ont déjà été vus. */
  const [modulesAtteints, setModulesAtteints] = useState<string[]>(() =>
    readModulesAtteints(),
  );
  /* Le jour de la dernière descente, lu sur la même mémoire que les noms : le
     compteur du cap se date ainsi d'elle-même, sans qu'aucune date soit
     recopiée à côté. */
  const [modulesAtteintsLe, setModulesAtteintsLe] = useState<string | null>(() =>
    readModulesAtteintsLe(),
  );
  /* Le jour de chaque module atteint, nom par nom : le survol d'une ligne du
     compteur dit sa propre date, et la ligne du tableau qui l'a reçue garde
     son repère daté. */
  const [modulesDates, setModulesDates] = useState<Record<string, string>>(() =>
    readModulesAtteintsDates(),
  );
  /* La petite gomme du compteur se demande en deux appuis, comme les autres
     gommes de l'onglet : elle n'oublie que les modules atteints. */
  const [modulesGomme, setModulesGomme] = useState(false);
  const oublierModules = () => {
    if (!modulesGomme) {
      setModulesGomme(true);
      return;
    }
    setModulesAtteints(clearModulesAtteints());
    setModulesAtteintsLe(null);
    setModulesDates({});
    setModulesGomme(false);
  };
  /* La gomme d'une seule ligne du tableau : elle porte le nom du module
     qu'elle oublie, pour que deux lignes ne s'arment jamais ensemble. */
  const [gommeModule, setGommeModule] = useState<string | null>(null);
  const oublierModule = (nom: string) => {
    if (gommeModule !== nom) {
      setGommeModule(nom);
      return;
    }
    setModulesAtteints(clearModuleAtteint(nom));
    setModulesDates(readModulesAtteintsDates());
    setModulesAtteintsLe(readModulesAtteintsLe());
    setGommeModule(null);
  };
  /* La gomme de la ligne se demande en deux appuis : un premier l'arme, un
     second efface ce que l'appareil se rappelle. */
  const [gommeArmee, setGommeArmee] = useState(false);
  /* La gomme d'une seule archive : elle porte le nom du chantier qu'elle
     efface, pour que deux lignes ne s'arment jamais ensemble. */
  const [gommeChantier, setGommeChantier] = useState<string | null>(null);
  const dernierPlan = memoire[cleTelechargement(null)] ?? null;
  const dernierChantier = chantierSeul
    ? memoire[cleTelechargement(chantierSeul)] ?? null
    : null;
  /* Les chantiers dont l'archive n'est jamais partie de cet appareil : le
     compte dit combien de pièces restent encore à joindre, sans ouvrir chaque
     archive une à une. Il suit la mémoire des téléchargements, donc il change
     dès qu'une pièce part. */
  const archivesJamais = SUIVI_CHANTIERS.filter(
    (chantier) => !memoire[cleTelechargement(chantier.nom)],
  );
  /* Le jour de la dernière archive partie de cet appareil, lu sur la même
     mémoire que le compteur : la plus récente des dates retenues, qu'il
     s'agisse du plan entier ou d'un seul chantier. */
  const derniereArchive = useMemo(() => {
    const dates = Object.values(memoire).filter(Boolean);
    if (dates.length === 0) return null;
    return dates.reduce((recent, date) =>
      new Date(date).getTime() > new Date(recent).getTime() ? date : recent,
    );
  }, [memoire]);
  /* Les pièces encore à joindre, numérotées dans l'ordre où elles partent :
     le survol dit laquelle emporter d'abord, sans ouvrir la liste. */
  const archivesJamaisHint =
    archivesJamais.length > 0
      ? t('ad.suivi.archivesJamaisHint').replace(
          '{noms}',
          archivesJamais
            .map((chantier, index) => `${index + 1}. ${chantier.nom}`)
            .join(' · '),
        )
      : t('ad.suivi.archivesJamaisOk');
  /* Les modules de la liste du cap déjà atteints depuis cet appareil, comptés
     sur la même liste que le bloc : le chiffre ne peut pas la contredire. */
  const modulesCapAtteints = modulesCap.filter((module) =>
    modulesAtteints.includes(module.nom),
  );
  const capDescendusHint =
    modulesCapAtteints.length > 0
      ? t('ad.suivi.capDescendusHint').replace(
          '{noms}',
          modulesCapAtteints
            .map((module) => {
              const atteintLe = modulesDates[module.nom];
              return atteintLe
                ? t('ad.suivi.capDescendusHintItem')
                    .replace('{nom}', module.nom)
                    .replace('{date}', jour(atteintLe, lang))
                : t('ad.suivi.capDescendusHintItemSansLe').replace(
                    '{nom}',
                    module.nom,
                  );
            })
            .join('\n'),
        )
      : t('ad.suivi.capDescendusOk');
  /* Le jour de la dernière descente, dit sous le compte : il se lit sur la
     même mémoire, et se tait calmement quand rien n'a encore été daté. */
  const capDescendusLePhrase = modulesAtteintsLe
    ? t('ad.suivi.capDescendusLe').replace(
        '{date}',
        jour(modulesAtteintsLe, lang),
      )
    : t('ad.suivi.capDescendusSansLe');
  /* Ce que la liste du cap garde encore devant elle : les modules qu'aucune
     descente n'a jamais atteints sur cet appareil, comptés sur la même liste
     que le bloc — le chiffre ne peut pas la contredire. */
  const modulesCapJamais = modulesCap.length - modulesCapAtteints.length;
  const capJamaisPhrase =
    modulesCap.length === 0
      ? ''
      : modulesCapJamais > 0
        ? t('ad.suivi.capJamaisLe').replace('{n}', String(modulesCapJamais))
        : t('ad.suivi.capJamaisAucun');
  /* Le survol de chaque ligne du compteur dit le jour où ce module-là a été
     atteint, lu sur le même registre que la liste des noms : la date de la
     ligne ne se confond pas avec celle de la dernière descente. */
  const capJumpTitre = (nom: string) => {
    const atteintLe = modulesDates[nom];
    return atteintLe
      ? t('ad.suivi.capJumpHintAt').replace('{date}', jour(atteintLe, lang))
      : t('ad.suivi.capJumpHint');
  };
  /* Le repère posé sur une ligne du tableau déjà descendue, avec son jour :
     le survol le dit, la ligne garde sa marque d'un coup d'œil. */
  const modVuTitre = (nom: string) => {
    const atteintLe = modulesDates[nom];
    return atteintLe
      ? t('ad.suivi.modVuLe').replace('{date}', jour(atteintLe, lang))
      : t('ad.suivi.modVuSansLe');
  };
  /* Le chantier qui porte chaque module, lu sur le plan lui-même : la ligne du
     tableau reçoit ainsi la date de la dernière archive de son propre
     chantier, sans qu'aucun rapprochement soit écrit à la main. */
  const chantierDesModules = useMemo(() => {
    const table: Record<string, string> = {};
    SUIVI_CHANTIERS.forEach((chantier) => {
      chantier.modules.forEach((nom) => {
        table[nom] = chantier.nom;
      });
    });
    return table;
  }, []);
  /* Le petit repère de l'archive sur la ligne, posé à côté de l'épingle : le
     jour où la dernière pièce du chantier est partie de cet appareil, lu sur
     la même mémoire que le rappel. Un chantier jamais archivé ici ne porte
     rien plutôt que d'afficher un jour inventé. */
  const archiveDeLigne = (nom: string) => {
    const chantierNom = chantierDesModules[nom];
    if (!chantierNom) return null;
    const le = memoire[cleTelechargement(chantierNom)];
    if (!le) return null;
    /* D'un appui, le repère descend jusqu'à la ligne des archives du rappel,
       là où les pièces se joignent — la même ancre que le compteur du cap.
       Le survol dit les deux choses : le jour de la dernière pièce, et le
       geste qui attend. */
    return (
      <a
        className="suivi-mod-archive"
        href={`#${ANCRE_ARCHIVES}`}
        title={t('ad.suivi.modArchiveJump').replace('{date}', jour(le, lang))}
      >
        <i className="ri-archive-line" aria-hidden="true"></i>
        <span className="suivi-mod-archive-date">{jour(le, lang)}</span>
      </a>
    );
  };
  /* Les deux bouts des descentes retenues, lus sur la mémoire nom par nom :
     le survol du bouton CSV dit quelle période le fichier emporte, du plus
     ancien jour de descente au plus récent. Un nom que le plan ne porte plus
     ne date rien — la pièce ne peut pas annoncer une période qui n'existe
     pas. */
  const bornesDescendus = useMemo(() => {
    const dates = Object.entries(modulesDates)
      .filter(([nom]) => SUIVI_MODULES.some((module) => module.nom === nom))
      .map(([, date]) => date)
      .filter((date) => Boolean(date) && !Number.isNaN(new Date(date).getTime()));
    if (dates.length === 0) return null;
    const tris = [...dates].sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
    return { ancien: tris[0], recent: tris[tris.length - 1] };
  }, [modulesDates]);
  const periodeDescendusPhrase = bornesDescendus
    ? bornesDescendus.ancien === bornesDescendus.recent
      ? t('ad.suivi.descendusCsvPeriodeOne').replace(
          '{date}',
          jour(bornesDescendus.recent, lang),
        )
      : t('ad.suivi.descendusCsvPeriode')
          .replace('{ancien}', jour(bornesDescendus.ancien, lang))
          .replace('{recent}', jour(bornesDescendus.recent, lang))
          .replace(
            '{n}',
            String(joursEntre(bornesDescendus.ancien, bornesDescendus.recent)),
          )
    : t('ad.suivi.descendusCsvPeriodeNone');
  const descendusCsvTitre = `${t('ad.suivi.descendusCsvHint')} ${periodeDescendusPhrase}`;
  /* Les modules du bloc encore jamais descendus depuis cet appareil, comptés
     sur la même liste que les lignes du dessous : le chiffre ne peut pas les
     contredire. */
  const modulesJamaisDescendus = ouverts.filter(
    (module) => !modulesAtteints.includes(module.nom),
  );
  const manqueJamaisPhrase =
    modulesJamaisDescendus.length > 0
      ? t('ad.suivi.manqueJamais').replace(
          '{n}',
          String(modulesJamaisDescendus.length),
        )
      : t('ad.suivi.manqueJamaisAucun');
  const manqueJamaisHint =
    modulesJamaisDescendus.length > 0
      ? t('ad.suivi.manqueJamaisHint').replace(
          '{noms}',
          modulesJamaisDescendus
            .map((module) => t('ad.suivi.manqueJamaisHintItem').replace('{nom}', module.nom))
            .join('\n'),
        )
      : t('ad.suivi.manqueJamaisHintOk');
  /* Les portes du plan, lues une fois : la table relie chaque ligne qui en
     reçoit une — module ou chantier — à la porte de son chantier, et au nom de
     l'écran qu'elle ouvre. Rien n'est recopié à la main ici : ajouter une porte
     demain ne touche qu'au plan. */
  const portes = useMemo(() => portesLignes(), []);
  const porteMail = portes[MODULE_MAIL];
  /* Les portes des lignes de « Ce qu'il reste à faire » : elles se lisent sur
     le plan, parmi les livrables eux-mêmes. Une ligne qui mène à un écran
     porte donc son repère, sans un mot écrit ici. */
  const portesResteTable = useMemo(() => portesReste(), []);
  /* Les lignes de cette liste qui portent une porte ouverte, lues sur la même
     table du plan : le jeton posé en tête les isole, et le compte se lit
     dessus plutôt que d’être écrit à côté. */
  const resteAvecPorte = useMemo(
    () => SUIVI_RESTE.filter((item) => Boolean(portesResteTable[item.texte])),
    [portesResteTable],
  );
  /* Le jeton des portes : « portes » ne garde que les lignes qui mènent à un
     écran, « vues » seulement celles dont la porte a déjà été empruntée.
     Les deux s'excluent, et « tout » rend la liste entière. */
  const [resteFiltre, setResteFiltre] = useState<'tout' | 'portes' | 'vues'>('tout');
  /* Les portes déjà empruntées depuis cet appareil, lues sur la mémoire du
     poste : une ligne dont la porte a été ouverte ne se confond plus avec
     celles qui restent à ouvrir. */
  const [vues, setVues] = useState<PortesVues>(() => readPortesVues());
  /* Les visites rendues par la petite gomme, comptées sur cet appareil avec
     le jour du dernier oubli : le carnet se relit sous la liste. */
  const [oublis, setOublis] = useState<PortesOublis>(() => readOublisPortes());
  /* Le jeton du carnet : un chantier retenu ne garde que ses propres oublis
     dans la liste des gestes, le temps d’en effacer une ligne sans se tromper
     de voisin. La chaîne vide désigne les portes qu’aucun chantier ne
     revendique, jamais un chantier nommé par hasard. */
  const [carnetChantier, setCarnetChantier] = useState<string | null>(null);
  /* Le second jeton du carnet : la semaine en cours, pour relire les gestes
     récents avant d’en effacer un. Les deux jetons se lisent ensemble — le
     chantier d’abord, la semaine ensuite —, et aucun ne retire un geste. */
  const [carnetSemaine, setCarnetSemaine] = useState(false);
  /* Le tri des gestes par écran : il ne retire aucun oubli et ne resserre
     rien — il range seulement les lignes du carnet sous le nom de leur écran,
     pour relire les oublis d’un même écran avant d’en retirer un. */
  const [carnetTriEcran, setCarnetTriEcran] = useState(false);
  /* L’écran retenu par un appui sur son nom dans le tri : le carnet ne garde
     que ses gestes, le temps d’en retirer un. La chaîne nulle rend tous les
     écrans, et aucun oubli n’est retiré — c’est une lecture, pas une gomme. */
  const [carnetEcran, setCarnetEcran] = useState<string | null>(null);
  /* Les écrans dépliés un à un sous le tri : chaque écran y montre son compte,
     le jour de son dernier oubli et sa petite gomme de retrait. Le dépli ne
     resserre rien — il range seulement les écrans côte à côte. */
  const [carnetEcransDeplies, setCarnetEcransDeplies] = useState(false);
  /* Le jeton du dépli : il ne garde que les écrans qui tiennent encore plus
     d’un geste — ceux qui demandent une relecture. Il ne retire aucun oubli. */
  const [carnetEcransRelire, setCarnetEcransRelire] = useState(false);
  /* Le second appui sur l’intitulé du tri : les écrans du dépli se rangent du
     plus fourni au plus léger, lus sur les gestes visibles. Le premier appui
     déplie dans l’ordre du carnet, le troisième replie. */
  const [carnetEcransFourni, setCarnetEcransFourni] = useState(false);
  /* Le jeton des écrans oubliés de longue date : il ne garde que ceux dont le
     dernier geste remonte à plus de sept jours, ceux qu'on ne relit plus. Il
     ne retire rien et se lit avec le jeton de relecture. */
  const [carnetEcransVieux, setCarnetEcransVieux] = useState(false);
  /* Le jeton des écrans revenus : il ne garde que ceux qu'un second appui sur
     leur nom avait retirés du carnet, puis qu'un nouveau geste y a ramenés.
     Il ne retire rien et dit le jour de chaque retour. */
  const [carnetEcransRetour, setCarnetEcransRetour] = useState(false);
  /* Le jeton des écrans retirés plus d'une fois : il ne garde que ceux que le
     second appui sur leur nom a vidés au moins deux fois depuis cet appareil.
     Il ne retire aucun oubli et se lit avec les autres jetons du dépli. */
  const [carnetEcransRetiresPlusieurs, setCarnetEcransRetiresPlusieurs] =
    useState(false);
  /* Le jeton des écrans revenus au moins deux fois : il ne garde que ceux que
     le second appui sur leur nom a vidés puis que des gestes ont ramenés deux
     fois ou plus au carnet. Il ne retire aucun oubli. */
  const [carnetEcransRetourDeux, setCarnetEcransRetourDeux] = useState(false);
  /* Le jeton des écrans revenus puis repartis : il ne garde que ceux qu'un
     geste avait ramenés au carnet et qu'un nouvel appui sur leur nom a vidés
     depuis. Il ne retire aucun oubli et dit le jour du dernier retrait. */
  const [carnetEcransRepartis, setCarnetEcransRepartis] = useState(false);
  /* Le jeton des écrans repartis de longue date : il ne garde que ceux dont
     le dernier retrait remonte à plus de sept jours, avec son jour — ceux
     qui ont quitté le carnet et n'y sont pas revenus. Il ne retire rien. */
  const [carnetEcransRepartisVieux, setCarnetEcransRepartisVieux] =
    useState(false);
  /* Le jeton des écrans repartis ce mois : il ne garde que ceux dont le
     dernier retrait tombe dans le mois en cours. Il ne retire rien. */
  const [carnetEcransRepartisMois, setCarnetEcransRepartisMois] =
    useState(false);
  /* Le jeton des écrans repartis cette semaine : il ne garde que ceux dont le
     dernier retrait tombe dans la semaine en cours. Il ne retire rien. */
  const [carnetEcransRepartisSemaine, setCarnetEcransRepartisSemaine] =
    useState(false);
  /* Le jeton des écrans repartis aujourd’hui : il ne garde que ceux dont le
     dernier retrait tombe le jour même. Il ne retire rien. */
  const [carnetEcransRepartisJour, setCarnetEcransRepartisJour] = useState(false);
  /* Le jeton des écrans repartis hier : il ne garde que ceux dont le dernier
     retrait tombe la veille, le jour d'avant et lui seul. Il ne retire rien. */
  const [carnetEcransRepartisHier, setCarnetEcransRepartisHier] = useState(false);
  /* Le jeton des écrans repartis avant-hier : il ne garde que ceux dont le
     dernier retrait tombe l'avant-veille, le jour d'avant la veille et lui
     seul. Il ne retire rien et complète la veille et le jour même. */
  const [carnetEcransRepartisAvantHier, setCarnetEcransRepartisAvantHier] =
    useState(false);
  /* Le jeton des écrans repartis cette quinzaine : il ne garde que ceux dont
     le dernier retrait tombe dans les quinze derniers jours. Il ne retire
     rien, et complète la série du jour même, d'hier et d'avant-hier. */
  const [carnetEcransRepartisQuinzaine, setCarnetEcransRepartisQuinzaine] =
    useState(false);
  /* Le jeton des écrans partis dans la quinzaine puis ramenés au carnet : il
     ne garde que ceux dont le dernier retrait tombe dans les quinze derniers
     jours et qu'un retour a ramenés depuis. Il ne retire aucun oubli. */
  const [carnetEcransRepartisQuinzaineRevenus, setCarnetEcransRepartisQuinzaineRevenus] =
    useState(false);
  /* Le jeton des écrans partis dans la quinzaine que rien n'a ramenés au
     carnet : il ne garde que ceux-là, avec le jour de leur retrait. Il ne
     retire aucun oubli et se lit avec le jeton de la quinzaine. */
  const [carnetEcransRepartisQuinzaineJamais, setCarnetEcransRepartisQuinzaineJamais] =
    useState(false);
  /* Le jeton des écrans partis dans la quinzaine puis revenus dans la
     semaine : il ne garde que ceux dont le retour tombe dans les sept
     derniers jours, le départ restant dans les quinze. Il ne retire rien. */
  const [carnetEcransRepartisQuinzaineSemaine, setCarnetEcransRepartisQuinzaineSemaine] =
    useState(false);
  /* Le jeton des retours tardifs de la quinzaine : il ne garde que les écrans
     partis dans les quinze derniers jours et revenus plus de sept journées
     après leur départ. Il ne retire aucun oubli, et son survol nomme le plus
     rapide et le plus lent, avec leur délai. */
  const [carnetEcransRepartisQuinzaineTardifs, setCarnetEcransRepartisQuinzaineTardifs] =
    useState(false);
  /* Le jeton des retours rapides de la quinzaine : il ne garde que les écrans
     partis dans les quinze derniers jours et revenus en sept journées ou
     moins. Il ne retire aucun oubli, et partage le lot du jeton des retours
     tardifs sans pouvoir le contredire. */
  const [carnetEcransRepartisQuinzaineRapides, setCarnetEcransRepartisQuinzaineRapides] =
    useState(false);
  /* Le jeton de la quinzaine sans aucun retour : il ne garde que les écrans
     partis dans les quinze derniers jours qu’aucun retour n’a jamais ramenés
     au carnet — ni avant ni après ce départ-là. Il ne retire aucun oubli et
     se lit avec le jeton des partis sans retour. */
  /* Le jeton des retours rapides et tardifs confondus : il rassemble en un
     seul geste les deux lots du CSV — les rapides et les tardifs —, lus sur
     la même liste de retours datés de la quinzaine. Il ne retire aucun
     oubli, et son survol nomme chaque écran puis les lignes qu'il écarte. */
  const [
    carnetEcransRepartisQuinzaineReunis,
    setCarnetEcransRepartisQuinzaineReunis,
  ] = useState(false);
  const [
    carnetEcransRepartisQuinzaineSansRetour,
    setCarnetEcransRepartisQuinzaineSansRetour,
  ] = useState(false);
  /* Le jeton des retours de plus de quinze jours : il ne garde que les écrans
     revenus après un départ déjà sorti de la quinzaine — la fenêtre des
     quinze jours est passée de l'autre côté. Il ne retire aucun oubli. */
  const [carnetEcransRepartisHorsQuinzaine, setCarnetEcransRepartisHorsQuinzaine] =
    useState(false);
  /* Le jeton des écrans sans aucune date de retour : il ne garde que ceux dont
     l’historique ne nomme aucun retour, ni avant ni après leur dernier
     retrait. Il ne retire aucun oubli et se lève de lui-même quand plus aucun
     écran n’est dans ce cas. */
  const [carnetEcransAucunRetour, setCarnetEcransAucunRetour] = useState(false);
  /* Le jeton des retours datés : le complément exact du précédent — il ne
     garde que les écrans dont l’historique porte au moins une date de retour.
     Il ne retire aucun oubli et se lève de lui-même quand plus aucun écran
     n’en porte. */
  const [carnetEcransRetoursDates, setCarnetEcransRetoursDates] = useState(false);
  /* Le jeton des retours datés de la semaine : il ne garde que les écrans
     revenus cette semaine avec une date — le retour le plus récent de chacun
     tombant dans la semaine en cours. Il ne retire aucun oubli et se lève de
     lui-même quand plus aucun écran n’est revenu avec une date. */
  const [carnetEcransRetoursDatesSemaine, setCarnetEcransRetoursDatesSemaine] =
    useState(false);
  /* Le jeton des retours datés du mois : il ne garde que les écrans revenus
     ce mois-ci avec une date — le retour le plus récent de chacun tombant dans
     le mois en cours. Il ne retire aucun oubli et se lève de lui-même quand
     plus aucun écran n’est revenu avec une date ce mois-ci. */
  const [carnetEcransRetoursDatesMois, setCarnetEcransRetoursDatesMois] =
    useState(false);
  /* Le jeton des retours datés du mois dernier : il ne garde que les écrans
     revenus dans la fenêtre qui vient de se fermer avec une date — le retour
     le plus récent de chacun tombant dans le mois précédent. Il ne retire
     aucun oubli et se lève de lui-même quand plus aucun écran n’y est revenu. */
  const [
    carnetEcransRetoursDatesMoisDernier,
    setCarnetEcransRetoursDatesMoisDernier,
  ] = useState(false);
  /* Le jeton des retours datés de l’avant-dernier mois : il ne garde que les
     écrans revenus dans la seconde fenêtre fermée avec une date — le retour le
     plus récent de chacun tombant dans le mois d’avant le mois dernier. Il ne
     retire aucun oubli et se lève de lui-même quand plus aucun écran n’y est
     revenu. */
  const [
    carnetEcransRetoursDatesAvantDernierMois,
    setCarnetEcransRetoursDatesAvantDernierMois,
  ] = useState(false);
  /* Le jeton des deux fenêtres fermées : il ne garde que les écrans revenus
     dans l’une ou l’autre — le mois dernier, puis l’avant-dernier —, chacun
     avec la fenêtre qui le tient, pour comparer les deux périodes côte à côte
     sans les mélanger. Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesDeuxFenetres,
    setCarnetEcransRetoursDatesDeuxFenetres,
  ] = useState(false);
  /* Le jeton des retours datés du trimestre : il ne garde que les écrans
     revenus ces trois derniers mois avec une date — le retour le plus récent
     de chacun tombant dans cette fenêtre. Il ne retire aucun oubli et se lève
     de lui-même quand plus aucun écran n’est revenu avec une date. */
  const [carnetEcransRetoursDatesTrimestre, setCarnetEcransRetoursDatesTrimestre] =
    useState(false);
  /* Le jeton des retours datés du trimestre fermé : il ne garde que les
     écrans revenus sur les trois mois qui précèdent le mois en cours — le
     mois courant restant dehors. Il ne retire aucun oubli et se lève de
     lui-même quand plus aucun écran n’y est revenu. */
  const [
    carnetEcransRetoursDatesTrimestreFerme,
    setCarnetEcransRetoursDatesTrimestreFerme,
  ] = useState(false);
  /* Le jeton qui compare le trimestre fermé et le mois dernier : il ne garde
     que leurs écrans, chacun portant la fenêtre qui le tient — le mois
     dernier d’abord, puis le reste du trimestre. Le mois dernier étant déjà
     compté dans le trimestre, aucun écran n’y pèse deux fois. Il ne retire
     aucun oubli. */
  const [
    carnetEcransRetoursDatesTrimestreFermeMoisDernier,
    setCarnetEcransRetoursDatesTrimestreFermeMoisDernier,
  ] = useState(false);
  /* Le jeton des retours datés de l’année : il ne garde que les écrans
     revenus sur les douze derniers mois avec une date — le retour le plus
     récent de chacun tombant dans cette fenêtre. Il ne retire aucun oubli et
     se lève de lui-même quand plus aucun écran n’est revenu avec une date. */
  const [carnetEcransRetoursDatesAnnee, setCarnetEcransRetoursDatesAnnee] =
    useState(false);
  /* Le jeton des retours datés de l’année fermée : il ne garde que les écrans
     revenus sur les douze mois qui précèdent le mois en cours — le mois
     courant restant dehors. Il ne retire aucun oubli et se lève de lui-même
     quand plus aucun écran n’y est revenu. */
  const [carnetEcransRetoursDatesAnneeFermee, setCarnetEcransRetoursDatesAnneeFermee] =
    useState(false);
  /* Le jeton qui compare l’année fermée et le trimestre fermé : il ne garde
     que leurs écrans, chacun portant la fenêtre qui le tient — le trimestre
     fermé d’abord, puis le reste de l’année. Le trimestre étant déjà compté
     dans l’année, aucun écran n’y pèse deux fois. Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreFerme,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreFerme,
  ] = useState(false);
  /* Le jeton des deux derniers mois fermés : il ne garde que les écrans de
     l’avant-dernier mois et de l’année fermée, chacun portant la fenêtre qui
     le tient — l’avant-dernier mois d’abord, puis le reste de l’année.
     L’avant-dernier mois étant déjà compté dans l’année, aucun écran n’y pèse
     deux fois. Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesDeuxMoisFermes,
    setCarnetEcransRetoursDatesDeuxMoisFermes,
  ] = useState(false);
  /* Le jeton qui compare l’avant-dernier mois et le mois dernier : il ne garde
     que leurs écrans, chacun portant la fenêtre qui le tient — le mois dernier
     d’abord, puis l’avant-dernier. Les deux mois ne se recouvrant pas, aucun
     écran n’y pèse deux fois. Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesAvantDernierMoisMoisDernier,
    setCarnetEcransRetoursDatesAvantDernierMoisMoisDernier,
  ] = useState(false);
  /* Le jeton qui compare le mois dernier et le trimestre fermé : il ne garde
     que leurs écrans, chacun portant la fenêtre qui le tient — le mois dernier
     d’abord, puis le reste du trimestre fermé. Le mois dernier étant déjà
     compté dans le trimestre, aucun écran n’y pèse deux fois. Il ne retire
     aucun oubli. */
  const [
    carnetEcransRetoursDatesMoisDernierTrimestreFerme,
    setCarnetEcransRetoursDatesMoisDernierTrimestreFerme,
  ] = useState(false);
  /* Le jeton qui compare l’avant-dernier mois et le trimestre fermé : il ne
     garde que leurs écrans, chacun portant la fenêtre qui le tient —
     l’avant-dernier mois d’abord, puis le reste du trimestre fermé.
     L’avant-dernier mois étant déjà compté dans le trimestre, aucun écran n’y
     pèse deux fois. Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesAvantDernierMoisTrimestreFerme,
    setCarnetEcransRetoursDatesAvantDernierMoisTrimestreFerme,
  ] = useState(false);
  /* Le jeton qui compare l’année fermée et le mois dernier : il ne garde que
     leurs écrans, chacun portant la fenêtre qui le tient — le mois dernier
     d’abord, puis le reste de l’année fermée. Le mois dernier étant déjà
     compté dans l’année, aucun écran n’y pèse deux fois. Il ne retire aucun
     oubli. */
  const [
    carnetEcransRetoursDatesAnneeFermeeMoisDernier,
    setCarnetEcransRetoursDatesAnneeFermeeMoisDernier,
  ] = useState(false);
  /* Le jeton qui compare l’année fermée et l’avant-dernier mois : il ne garde
     que leurs écrans, chacun portant la fenêtre qui le tient — l’avant-dernier
     mois d’abord, puis le reste de l’année fermée. L’avant-dernier mois étant
     déjà compté dans l’année, aucun écran n’y pèse deux fois. Il ne retire
     aucun oubli. */
  const [
    carnetEcransRetoursDatesAnneeFermeeAvantDernierMois,
    setCarnetEcransRetoursDatesAnneeFermeeAvantDernierMois,
  ] = useState(false);
  /* Le jeton qui compare le trimestre fermé et l’avant-dernier mois : il ne
     garde que leurs écrans, chacun portant la fenêtre qui le tient — le
     trimestre fermé d’abord, puis l’avant-dernier mois. L’avant-dernier mois
     étant déjà compté dans le trimestre, un écran déjà nommé n’y revient pas.
     Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesTrimestreFermeAvantDernierMois,
    setCarnetEcransRetoursDatesTrimestreFermeAvantDernierMois,
  ] = useState(false);
  /* Le jeton qui compare le trimestre fermé et l’année fermée : il ne garde
     que leurs écrans, chacun portant la fenêtre qui le tient — le trimestre
     fermé d’abord, puis le reste de l’année fermée. Le trimestre étant déjà
     compté dans l’année, un écran déjà nommé n’y revient pas. Il ne retire
     aucun oubli. */
  const [
    carnetEcransRetoursDatesTrimestreFermeAnneeFerme,
    setCarnetEcransRetoursDatesTrimestreFermeAnneeFerme,
  ] = useState(false);
  /* Le jeton qui compare l’année fermée et le mois en cours : il ne garde que
     leurs écrans, chacun portant la fenêtre qui le tient — le mois en cours
     d’abord, puis le reste de l’année fermée. Les deux fenêtres ne se
     recouvrant pas, aucun écran n’y pèse deux fois. Il ne retire aucun
     oubli. */
  const [
    carnetEcransRetoursDatesAnneeFermeeMoisEnCours,
    setCarnetEcransRetoursDatesAnneeFermeeMoisEnCours,
  ] = useState(false);
  /* Le jeton qui compare le mois en cours et le mois dernier : il ne garde que
     leurs écrans, chacun portant la fenêtre qui le tient — le mois en cours
     d’abord, puis le mois dernier. Les deux mois ne se recouvrant pas, aucun
     écran n’y pèse deux fois. Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesMoisEnCoursMoisDernier,
    setCarnetEcransRetoursDatesMoisEnCoursMoisDernier,
  ] = useState(false);
  /* Le jeton qui compare l’avant-dernier mois et le mois en cours : il ne
     garde que leurs écrans, chacun portant la fenêtre qui le tient —
     l’avant-dernier mois d’abord, puis le mois en cours. Les deux mois ne se
     recouvrant pas, aucun écran n’y pèse deux fois. Il ne retire aucun
     oubli. */
  const [
    carnetEcransRetoursDatesAvantDernierMoisMoisEnCours,
    setCarnetEcransRetoursDatesAvantDernierMoisMoisEnCours,
  ] = useState(false);
  /* Le jeton qui compare le mois dernier et le trimestre en cours : il ne
     garde que leurs écrans, chacun portant la fenêtre qui le tient — le mois
     dernier d’abord, puis le reste du trimestre. Le mois dernier étant déjà
     compté dans le trimestre, aucun écran n’y pèse deux fois. Il ne retire
     aucun oubli. */
  const [
    carnetEcransRetoursDatesMoisDernierTrimestre,
    setCarnetEcransRetoursDatesMoisDernierTrimestre,
  ] = useState(false);
  /* Le jeton qui compare l’année fermée et le trimestre en cours : il ne garde
     que leurs écrans, chacun portant la fenêtre qui le tient — l’année fermée
     d’abord, puis ce que le trimestre y ajoute. Le mois dernier et
     l’avant-dernier tenant dans les deux fenêtres, un écran déjà nommé n’y
     revient pas. Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestre,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestre,
  ] = useState(false);
  /* Le jeton de ce que l’année fermée ajoute seule : les écrans dont le retour
     le plus récent tombe dans l’année fermée et dans aucune autre fenêtre de
     la série — ni le mois en cours, ni le mois dernier, ni l’avant-dernier
     mois, ni le trimestre fermé, ni la semaine. Il ne garde que ce que
     l’année nomme sans le partager avec aucun autre jeton, et ne retire aucun
     oubli. */
  const [
    carnetEcransRetoursDatesAnneeFermeeSeule,
    setCarnetEcransRetoursDatesAnneeFermeeSeule,
  ] = useState(false);
  /* Le jeton jumeau de celui de l’année fermée seule : ce que le trimestre en
     cours nomme et que l’année fermée ne nomme pas — les deux additions se
     lisent alors côte à côte. Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesTrimestreSeule,
    setCarnetEcransRetoursDatesTrimestreSeule,
  ] = useState(false);
  /* Le jeton des deux additions réunies : ce que l’année fermée ajoute seule
     et ce que le trimestre en cours ajoute seul, posés côte à côte pour les
     lire d’un même regard. Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeule,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeule,
  ] = useState(false);
  /* Le jeton qui compare directement les deux milieux : des deux additions
     réunies, il ne garde que les écrans dont le délai dépasse le milieu du
     lot réuni — la ligne de partage se lit alors d’un même regard, sans
     compter les lignes du dépli. Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse,
  ] = useState(false);
  /* Le jeton de la fenêtre la plus proche : parmi les écrans au-delà du milieu
     réuni, il ne garde que ceux dont le retour tombe cette semaine — pour lire
     ce que la fenêtre la plus proche retient du lot, sans compter les lignes
     du dépli à la main. Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine,
  ] = useState(false);
  /* Le jeton qui compare la semaine au lot réuni : il garde les écrans du lot
     revenus cette semaine, puis le reste du lot, chacun portant sa fenêtre —
     le milieu de la semaine se lit alors à côté de celui du lot réuni, et la
     semaine se juge d’un mot. Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis,
  ] = useState(false);
  /* Le jeton de l’avance de la semaine : parmi les écrans du lot au-delà du
     milieu réuni revenus cette semaine, il ne garde que ceux dont le délai
     est plus court que le milieu du lot réuni — la semaine se juge d’un mot.
     Il ne retire aucun oubli. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide,
  ] = useState(false);
  /* Le jeton qui réunit la semaine rapide et le reste du lot réuni : les
     écrans de la semaine revenus plus vite que le milieu d’abord — ils portent
     le nom de la semaine rapide —, puis ce que le lot montre en plus, chacun
     gardant la fenêtre qui le nomme, pour les lire d’un même regard. Il ne
     retire aucun oubli. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis,
  ] = useState(false);
  /* Le jeton du reste du lot réuni : il ne garde que les écrans du lot que la
     semaine rapide ne nomme pas — ce qu’il reste à relire une fois l’avance
     lue. Il ne retire aucun oubli et se lit avec le jeton qu’il complète. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste,
  ] = useState(false);
  /* Le jeton du reste revenu avant le milieu réuni : parmi les écrans du
     reste — ceux que la semaine rapide ne nomme pas —, il ne garde que ceux
     dont le délai est plus court que le milieu du lot réuni. Il ne retire
     aucun oubli et se lève de lui-même quand plus rien n’y répond. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu,
  ] = useState(false);
  /* Le jeton qui réunit le reste avant le milieu et le reste après : les
     écrans du reste revenus plus vite que le milieu d’abord — ils portent le
     nom du reste avant le milieu —, puis ceux qui le dépassent, chacun gardant
     la fenêtre qui le nomme, pour les lire d’un même regard. Il ne retire
     aucun oubli et se lève de lui-même quand le reste est vide. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis,
  ] = useState(false);
  /* Le jeton du reste revenu après le milieu réuni : le complément exact de
     celui d’avant, pris sur la même liste du reste — un écran ne peut pas
     tomber des deux côtés, et aucun ne s’y perd. Il ne retire aucun oubli et
     se lève de lui-même quand plus rien n’y répond. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu,
  ] = useState(false);
  /* Le jeton qui réunit le reste avant, au milieu et après : les trois parts
     du reste lues d’un même regard — celles qui devancent le milieu du lot
     réuni, celles qui tombent dessus, puis celles qui le dépassent. Chaque
     écran ne tient que dans une part, et la liste se prend sur celle du
     reste. Il ne retire aucun oubli et se lève de lui-même quand le reste
     est vide. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis,
  ] = useState(false);
  /* Le jeton du reste revenu exactement au milieu du lot réuni : la seule
     part du milieu, relue à part — les écrans du reste dont le délai tombe
     pile sur le milieu, ni avant ni après. Il ne retire aucun oubli et se
     lève de lui-même quand personne ne tombe dessus. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul,
  ] = useState(false);
  /* Le jeton qui réunit le reste avant le milieu et le milieu exact, sans
     l’après : les deux parts du reste lues d’un même regard, chacune gardant
     la fenêtre qui la nomme. Il ne retire aucun oubli et se lève de lui-même
     quand plus rien ne devance le milieu ni ne tombe dessus. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu,
  ] = useState(false);
  /* Le jeton du reste avant le milieu, resserré sur la semaine : parmi les
     écrans du reste revenus plus vite que le milieu, il ne garde que ceux dont
     le retour tombe cette semaine — la part d’avant lue à la fenêtre la plus
     proche. Il ne retire aucun oubli et se lève de lui-même quand plus rien
     n’y répond. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine,
  ] = useState(false);
  /* Le jeton qui réunit le reste avant le milieu de la semaine et le milieu
     exact : les écrans du reste revenus avant le milieu cette semaine d’abord
     — ils portent le nom de la part d’avant —, puis ceux qui tombent
     exactement sur le milieu du lot réuni, chacun gardant la fenêtre qui le
     nomme. Il ne retire aucun oubli et se lève de lui-même quand plus rien
     n’y répond. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu,
  ] = useState(false);
  /* Le jeton du milieu exact resserré sur la semaine : parmi les écrans du
     reste tombés exactement sur le milieu du lot réuni, il ne garde que ceux
     dont le retour tombe cette semaine — la seule part du milieu, lue à la
     fenêtre la plus proche. Il ne retire aucun oubli et se lève de lui-même
     quand plus rien n’y répond. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine,
  ] = useState(false);
  /* Le jeton qui réunit le milieu exact de la semaine et le reste du milieu
     exact resté hors de la semaine : les écrans du milieu exact revenus cette
     semaine d’abord — ils portent le nom de la part de la semaine —, puis
     ceux du même milieu dont le retour tombe hors de la semaine, chacun
     gardant la fenêtre qui le nomme. L’ensemble forme le milieu exact du lot,
     lu d’un même regard. Il ne retire aucun oubli et se lève de lui-même
     quand personne ne tombe exactement sur le milieu. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste,
  ] = useState(false);
  /* Le jeton du milieu exact resserré sur le mois : parmi les écrans du reste
     tombés exactement sur le milieu du lot réuni, il ne garde que ceux dont
     le retour tombe ce mois-ci — la même part que le jeton de la semaine,
     lue à la fenêtre du mois pour comparer les deux d’un même regard. Il ne
     retire aucun oubli et se lève de lui-même quand plus rien n’y répond. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois,
  ] = useState(false);
  /* Le jeton qui réunit le milieu exact du mois et le reste du milieu exact
     resté hors de la fenêtre : les écrans du milieu exact revenus ce mois-ci
     d’abord — ils portent le nom de la part du mois —, puis ceux du même
     milieu dont le retour tombe hors du mois, chacun gardant la fenêtre qui
     le nomme. L’ensemble forme le milieu exact du lot, lu d’un même regard.
     Il ne retire aucun oubli et se lève de lui-même quand personne ne tombe
     exactement sur le milieu. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste,
  ] = useState(false);
  /* Le jeton du milieu exact revenu hors du mois : parmi les écrans du reste
     tombés exactement sur le milieu du lot réuni, il ne garde que ceux dont le
     retour tombe hors du mois en cours — le complément exact de la part du
     mois, relu à côté d’elle. Il ne retire aucun oubli et se lève de lui-même
     quand plus rien ne reste hors du mois. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois,
  ] = useState(false);
  /* Le jeton qui réunit le milieu exact revenu hors du mois et celui revenu
     cette semaine : les trois fenêtres — la semaine, le mois et son dehors —
     se lisent alors d’un même regard. Il ne retire aucun oubli et se lève de
     lui-même quand plus rien ne tombe ni dans la semaine ni hors du mois. */
  const [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine,
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine,
  ] = useState(false);
  /* Les deux bouts du carnet — le plus ancien oubli et le plus récent —, lus
     sur son journal : le survol du bouton CSV dit quelle période il emporte. */
  const bornesCarnet = useMemo(() => bornesOublis(oublis), [oublis]);
  /* La période que le carnet couvre, dite d'un bout à l'autre : le jour de son
     plus ancien retour puis celui du plus récent, avec les journées qui les
     séparent — le survol du bouton CSV l'annonce avant le téléchargement, pour
     que le fichier ne parte pas sans que l'on sache ce qu'il emporte. Un carnet
     d'une seule journée le dit plutôt que d'inventer un écart. */
  const periodeCarnetPhrase = bornesCarnet
    ? bornesCarnet.ancien === bornesCarnet.recent
      ? t('ad.suivi.doorOublisCsvPeriodeOne').replace(
          '{date}',
          jour(bornesCarnet.recent, lang),
        )
      : t('ad.suivi.doorOublisCsvPeriode')
          .replace('{ancien}', jour(bornesCarnet.ancien, lang))
          .replace('{recent}', jour(bornesCarnet.recent, lang))
          .replace(
            '{n}',
            String(joursEntre(bornesCarnet.ancien, bornesCarnet.recent)),
          )
    : '';
  /* Les visites rendues rangées par chantier du plan, la plus fournie en
     tête : la même adresse est relue sur la table des portes, si bien que le
     décompte suit le plan sans qu'aucun nom soit écrit ici. Une porte qu'aucun
     chantier ne revendique est comptée à part, jamais attribuée au hasard. */
  const oublisParChantier = useMemo(() => compteOublisParChantier(oublis), [oublis]);
  /* Le carnet geste par geste, du plus récent au plus ancien, resserré sur le
     seul chantier que le jeton retient — le compte du carnet, lui, ne bouge
     pas : c’est une lecture, pas un oubli. */
  const journalChantier = useMemo(() => {
    const lignes = [...oublis.journal].reverse();
    if (carnetChantier === null) return lignes;
    return lignes.filter(
      (geste) => (chantierDePorte(geste.lien) ?? '') === carnetChantier,
    );
  }, [oublis, carnetChantier]);
  /* Ce que le jeton de la semaine laisserait, lu sur le carnet entier : son
     compte ne dépend pas du chantier retenu, et ne trompe donc jamais. */
  const journalSemaine = useMemo(
    () =>
      [...oublis.journal]
        .reverse()
        .filter((geste) => estSemaineEnCours(geste.date)),
    [oublis],
  );
  /* Les gestes de l’écran retenu, comptés sur le carnet entier : le jeton
     d’écran dit ainsi ce qu’il retire de la vue, sans dépendre des autres. */
  const journalEcran = useMemo(() => {
    if (carnetEcran === null) return [];
    return [...oublis.journal]
      .reverse()
      .filter((geste) => (geste.ecran || geste.lien) === carnetEcran);
  }, [oublis, carnetEcran]);
  /* Les deux bouts de l’écran retenu : son premier oubli et son dernier, lus
     sur ses seuls gestes. Deux gestes du même jour disent une seule date, sans
     inventer de journée. */
  const ecranBouts = useMemo(() => {
    const temps = journalEcran
      .map((geste) => new Date(geste.date).getTime())
      .filter((t) => !Number.isNaN(t));
    if (temps.length === 0) return null;
    return {
      ancien: new Date(Math.min(...temps)).toISOString(),
      recent: new Date(Math.max(...temps)).toISOString(),
    };
  }, [journalEcran]);
  /* L’écart de l’écran retenu, dit derrière la ligne du carnet resserré : les
     journées qui séparent son premier oubli de son dernier, lues sur la même
     mémoire, jamais écrites à côté. */
  const ecranSpan = ecranBouts
    ? joursEntre(ecranBouts.ancien, ecranBouts.recent) > 0
      ? t('ad.suivi.doorOublisEcranOnSpan')
          .replace(
            '{n}',
            String(joursEntre(ecranBouts.ancien, ecranBouts.recent)),
          )
          .replace('{ancien}', jour(ecranBouts.ancien, lang))
          .replace('{recent}', jour(ecranBouts.recent, lang))
      : t('ad.suivi.doorOublisEcranOnOne').replace(
          '{date}',
          jour(ecranBouts.recent, lang),
        )
    : '';
  /* Les deux bouts de la semaine : son oubli le plus ancien et le plus récent,
     lus sur les seuls gestes que le jeton retient. Deux gestes du même jour
     disent une seule date, sans inventer d’écart. */
  const semaineBouts = useMemo(() => {
    const temps = journalSemaine
      .map((geste) => new Date(geste.date).getTime())
      .filter((t) => !Number.isNaN(t));
    if (temps.length === 0) return null;
    return {
      ancien: new Date(Math.min(...temps)).toISOString(),
      recent: new Date(Math.max(...temps)).toISOString(),
    };
  }, [journalSemaine]);
  /* Les jetons posés sur le carnet, comptés ensemble : le chantier d’abord,
     la semaine ensuite. Aucun ne retire un oubli — ils resserrent la lecture. */
  const jetonsPoses =
    (carnetEcran !== null ? 1 : 0) +
    (carnetChantier !== null ? 1 : 0) +
    (carnetSemaine ? 1 : 0);
  /* Ce que chaque jeton posé retirait de la vue, lu sur le carnet entier :
     le chantier d’un côté, la semaine de l’autre. Le survol de la gomme le
     dit avant de les éteindre, pour que le geste ne s’efface pas à l’aveugle. */
  const jetonsDetail = [
    carnetEcran !== null
      ? t('ad.suivi.doorOublisJetonsItem')
          .replace(
            '{nom}',
            t('ad.suivi.doorOublisEcranItemNom').replace('{ecran}', carnetEcran),
          )
          .replace('{masques}', String(oublis.total - journalEcran.length))
      : '',
    carnetChantier !== null
      ? t('ad.suivi.doorOublisJetonsItem')
          .replace('{nom}', carnetChantier || t('ad.suivi.doorOublisChantierAucun'))
          .replace('{masques}', String(oublis.total - journalChantier.length))
      : '',
    carnetSemaine
      ? t('ad.suivi.doorOublisJetonsItem')
          .replace('{nom}', t('ad.suivi.doorOublisSemaineNom'))
          .replace('{masques}', String(oublis.total - journalSemaine.length))
      : '',
  ]
    .filter(Boolean)
    .join(' · ');
  /* Le carnet resserré par les deux jetons à la fois : le chantier d’abord,
     la semaine ensuite, et rien n’est jamais retiré du carnet. */
  const journalCarnet = useMemo(() => {
    const lignes = [...oublis.journal].reverse().filter((geste) => {
      if (
        carnetChantier !== null &&
        (chantierDePorte(geste.lien) ?? '') !== carnetChantier
      ) {
        return false;
      }
      if (carnetSemaine && !estSemaineEnCours(geste.date)) return false;
      if (carnetEcran !== null && (geste.ecran || geste.lien) !== carnetEcran) {
        return false;
      }
      return true;
    });
    /* Le tri par écran range les gestes sous le nom de leur écran, du plus
       récent au plus ancien dans un même écran : les oublis d’un même écran
       se relisent côte à côte avant d’en retirer un. Le tri ne retire rien. */
    if (!carnetTriEcran) return lignes;
    return lignes.slice().sort((a, b) => {
      const parEcran = a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' });
      if (parEcran !== 0) return parEcran;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [oublis, carnetChantier, carnetSemaine, carnetEcran, carnetTriEcran]);
  /* Les gestes du carnet rangés par écran, lus sur la liste telle qu’elle se
     montre — les deux jetons compris — : le survol du tri « Par écran » dit
     ainsi ce que chaque écran tient et jusqu’à quand il remonte, sans ouvrir
     le carnet ligne à ligne. */
  const ecransCarnet = useMemo(
    () => compteOublisParEcran({ ...oublis, journal: journalCarnet }),
    [oublis, journalCarnet],
  );
  /* Combien de fois chaque écran a été retiré du carnet par son nom depuis cet
     appareil, lu sur l'historique des retraits : le jeton des écrans retirés
     plus d'une fois ne garde que ceux qui y comptent au moins deux gestes. */
  const retraitsPlusieurs = useMemo(() => {
    const compte = new Map<string, number>();
    readEcransRetiresHist().forEach((item) =>
      compte.set(item.ecran, (compte.get(item.ecran) ?? 0) + 1),
    );
    return compte;
  }, [oublis, vues]);
  /* Les écrans déjà retirés par leur nom puis revenus au carnet : ceux que le
     second appui avait vidés et qu'un nouveau geste y a ramenés. Le jour du
     retour est lu sur la mémoire d'appareil, jamais deviné sur l'ordre de la
     liste. Un écran retiré de nouveau n'a plus de geste : il sort de lui-même
     de ces lignes, puisque le dépli ne le montre plus. */
  const ecransRetournes = useMemo(() => {
    const retours = readEcransRetours();
    const hist = readEcransRetoursHist();
    return ecransCarnet.flatMap((ligne) => {
      const retour = retours.find((item) => item.ecran === ligne.ecran);
      if (!retour) return [];
      /* Combien de fois cet écran a été retiré puis ramené, lu sur l'historique
         des retours : un même écran revenu deux fois garde deux gestes. Un
         enregistrement plus ancien, écrit avant l'historique, garde au moins
         un retour — celui que la liste des retours nomme encore. */
      const fois = Math.max(
        1,
        hist.filter((item) => item.ecran === ligne.ecran).length,
      );
      return [{ ...ligne, retour: retour.retour, fois }];
    });
  }, [ecransCarnet, oublis, vues]);
  const ecransRetournesDetail = ecransRetournes
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRetourItemN')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.retour, lang))
        .replace('{n}', String(ligne.fois)),
    )
    .join(' · ');
  /* Les écrans revenus au carnet puis repartis : ceux qu'un geste avait
     ramenés et qu'un nouvel appui sur leur nom a vidés depuis. Le jour de
     leur dernier retrait est lu sur l'historique des retraits, jamais deviné
     sur l'ordre d'une liste. Ces écrans n'ont plus de geste au carnet : le
     jeton les montre hors du dépli ordinaire. */
  const ecransRepartisListe = useMemo(() => {
    const retours = readEcransRetours();
    const hist = readEcransRetiresHist();
    return retours
      .flatMap((retour) => {
        const apres = hist.filter(
          (item) =>
            item.ecran === retour.ecran &&
            new Date(item.date).getTime() > new Date(retour.retour).getTime(),
        );
        if (apres.length === 0) return [];
        const dernier = apres.reduce((garde, courant) =>
          new Date(courant.date).getTime() > new Date(garde.date).getTime()
            ? courant
            : garde,
        );
        return [{ ecran: retour.ecran, date: dernier.date }];
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [oublis, vues]);
  const ecransRepartisDetail = ecransRepartisListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang)),
    )
    .join(' · ');
  /* Les écrans repartis depuis plus de sept journées pleines : le jeton ne
     garde que ceux-là, comptés sur la même liste, avec le jour de leur
     dernier retrait — un départ d'hier n'y entre pas. */
  const ecransRepartisVieuxListe = useMemo(
    () =>
      ecransRepartisListe.filter(
        (ligne) => joursEntre(ligne.date, new Date().toISOString()) > 7,
      ),
    [ecransRepartisListe],
  );
  const ecransRepartisVieuxDetail = ecransRepartisVieuxListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang)),
    )
    .join(' · ');
  /* Les écrans repartis dont le dernier retrait tombe dans le mois en cours :
     le jeton du mois ne garde que ceux-là, comptés sur la même liste, avec le
     jour de leur dernier retrait — un départ du mois précédent n'y entre pas. */
  const ecransRepartisMoisListe = useMemo(
    () =>
      ecransRepartisListe.filter((ligne) => estMoisEnCours(ligne.date)),
    [ecransRepartisListe],
  );
  const ecransRepartisMoisDetail = ecransRepartisMoisListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang)),
    )
    .join(' · ');
  /* Les écrans repartis dont le dernier retrait tombe dans la semaine en
     cours : le jeton de la semaine ne garde que ceux-là, comptés sur la même
     liste, avec le jour de leur dernier retrait — un départ du mois en cours
     mais de la semaine passée n'y entre pas. */
  const ecransRepartisSemaineListe = useMemo(
    () => ecransRepartisListe.filter((ligne) => estSemaineEnCours(ligne.date)),
    [ecransRepartisListe],
  );
  const ecransRepartisSemaineDetail = ecransRepartisSemaineListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang)),
    )
    .join(' · ');
  /* Les écrans repartis dont le dernier retrait tombe aujourd’hui : le jeton
     du jour ne garde que ceux-là, comptés sur la même liste, avec le jour de
     leur dernier retrait — un départ d’hier n’y entre pas. */
  const ecransRepartisJourListe = useMemo(
    () => ecransRepartisListe.filter((ligne) => estJourEnCours(ligne.date)),
    [ecransRepartisListe],
  );
  const ecransRepartisJourDetail = ecransRepartisJourListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang)),
    )
    .join(' · ');
  /* Les écrans repartis dont le dernier retrait tombe la veille : le jeton
     d'hier ne garde que ceux-là, comptés sur la même liste, avec le jour de
     ce retrait — un départ du jour même ou d'il y a deux jours n'y entre pas. */
  const ecransRepartisHierListe = useMemo(
    () => ecransRepartisListe.filter((ligne) => estJourVeille(ligne.date)),
    [ecransRepartisListe],
  );
  const ecransRepartisHierDetail = ecransRepartisHierListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang)),
    )
    .join(' · ');
  /* Les écrans repartis dont le dernier retrait tombe l'avant-veille : le
     jeton d'avant-hier ne garde que ceux-là, comptés sur la même liste, avec
     le jour de ce retrait — un départ du jour même, d'hier ou d'il y a trois
     jours n'y entre pas. */
  const ecransRepartisAvantHierListe = useMemo(
    () => ecransRepartisListe.filter((ligne) => estJourAvantVeille(ligne.date)),
    [ecransRepartisListe],
  );
  const ecransRepartisAvantHierDetail = ecransRepartisAvantHierListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang)),
    )
    .join(' · ');
  /* Les écrans repartis dont le dernier retrait tombe dans les quinze
     derniers jours : le jeton de la quinzaine ne garde que ceux-là, comptés
     sur la même liste, avec le jour de leur dernier retrait — un départ plus
     ancien n'y entre pas. */
  const ecransRepartisQuinzaineListe = useMemo(
    () =>
      ecransRepartisListe.filter(
        (ligne) => joursEntre(ligne.date, new Date().toISOString()) <= 15,
      ),
    [ecransRepartisListe],
  );
  const ecransRepartisQuinzaineDetail = ecransRepartisQuinzaineListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang)),
    )
    .join(' · ');
  /* Les écrans partis dans la quinzaine puis revenus depuis : le dernier
     retrait tombe dans les quinze derniers jours, et un retour le suit, lu sur
     l'historique des retours. Le retour le plus récent fait foi, si bien qu'un
     même écran revenu deux fois ne garde qu'une ligne. */
  const ecransRepartisQuinzaineRevenusListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisQuinzaineListe.flatMap((ligne) => {
      const apres = retours
        .filter(
          (item) =>
            item.ecran === ligne.ecran &&
            new Date(item.retour).getTime() > new Date(ligne.date).getTime(),
        )
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour) return [];
      return [{ ecran: ligne.ecran, date: ligne.date, retour: retour.retour }];
    });
  }, [ecransRepartisQuinzaineListe, oublis, vues]);
  const ecransRepartisQuinzaineRevenusDetail = ecransRepartisQuinzaineRevenusListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang))
        .replace('{retour}', jour(ligne.retour, lang)),
    )
    .join(' · ');
  /* Les écrans partis dans la quinzaine que rien n'a ramenés au carnet : un
     retour ne compte que s'il suit le retrait, lu sur l'historique des
     retours — un retour antérieur ne couvre pas ce départ-là. La liste se
     prend sur celle de la quinzaine, si bien que les deux jetons ne peuvent
     pas se contredire. */
  const ecransRepartisQuinzaineJamaisListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisQuinzaineListe.filter(
      (ligne) =>
        !retours.some(
          (item) =>
            item.ecran === ligne.ecran &&
            new Date(item.retour).getTime() > new Date(ligne.date).getTime(),
        ),
    );
  }, [ecransRepartisQuinzaineListe, oublis, vues]);
  const ecransRepartisQuinzaineJamaisDetail = ecransRepartisQuinzaineJamaisListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisQuinzaineJamaisItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang)),
    )
    .join(' · ');
  /* Les lignes du dépli que le jeton des partis sans retour écarte de la vue,
     lues sur la même liste des écrans repartis : le survol dit ce que l'appui
     retirera de la vue, comme les autres jetons de la quinzaine. */
  const repartisQuinzaineJamaisEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisQuinzaineJamaisListe.length,
  );
  const repartisQuinzaineJamaisEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisEcartes',
  )
    .replace('{n}', String(repartisQuinzaineJamaisEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Les écrans partis dans la quinzaine puis revenus dans la semaine en
     cours : le dernier retrait tombe dans les quinze derniers jours, et un
     retour le suit en tombant dans les sept derniers. Le retour le plus
     récent fait foi, si bien qu'un même écran ne garde qu'une ligne. */
  const ecransRepartisQuinzaineSemaineListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisQuinzaineListe.flatMap((ligne) => {
      const apres = retours
        .filter(
          (item) =>
            item.ecran === ligne.ecran &&
            new Date(item.retour).getTime() > new Date(ligne.date).getTime() &&
            estSemaineEnCours(item.retour),
        )
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour) return [];
      return [{ ecran: ligne.ecran, date: ligne.date, retour: retour.retour }];
    });
  }, [ecransRepartisQuinzaineListe, oublis, vues]);
  const ecransRepartisQuinzaineSemaineDetail = ecransRepartisQuinzaineSemaineListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisQuinzaineSemaineItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang))
        .replace('{retour}', jour(ligne.retour, lang)),
    )
    .join(' · ');
  /* Les retours tardifs de la quinzaine : partis dans les quinze derniers
     jours, revenus plus de sept journées après leur départ. La liste se prend
     sur celle des revenus, si bien que les deux jetons ne peuvent pas se
     contredire ; chaque ligne porte son délai, lu sur ses deux dates. */
  const ecransRepartisQuinzaineTardifsListe = useMemo(
    () =>
      ecransRepartisQuinzaineRevenusListe
        .map((ligne) => ({
          ...ligne,
          jours: joursEntre(ligne.date, ligne.retour),
        }))
        .filter((ligne) => ligne.jours > 7),
    [ecransRepartisQuinzaineRevenusListe],
  );
  const ecransRepartisQuinzaineTardifsDetail = ecransRepartisQuinzaineTardifsListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisQuinzaineTardifsItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang))
        .replace('{retour}', jour(ligne.retour, lang))
        .replace('{n}', String(ligne.jours)),
    )
    .join(' · ');
  /* Les lignes du dépli que ce jeton écarte, lues sur la même liste des
     écrans repartis : le survol dit ce que l'appui retirera de la vue. */
  const repartisQuinzaineTardifsEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisQuinzaineTardifsListe.length,
  );
  const repartisQuinzaineTardifsEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsEcartes',
  )
    .replace('{n}', String(repartisQuinzaineTardifsEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le retour le plus rapide et le plus lent parmi ces écrans, lus sur les
     mêmes lignes que le jeton : leurs deux délais se lisent côte à côte, pour
     que le resserrement se juge avant l'appui. Un lot vide ne nomme personne
     et le dit calmement. */
  const ecranTardifPlusRapide =
    [...ecransRepartisQuinzaineTardifsListe].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const ecranTardifPlusLent =
    [...ecransRepartisQuinzaineTardifsListe].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisQuinzaineTardifsBoutsPhrase =
    ecranTardifPlusRapide && ecranTardifPlusLent
      ? `${t('ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPlusRapide')
          .replace('{ecran}', ecranTardifPlusRapide.ecran)
          .replace('{n}', String(ecranTardifPlusRapide.jours))
          .replace('{date}', jour(ecranTardifPlusRapide.date, lang))} ${t(
          'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPlusLent',
        )
          .replace('{ecran}', ecranTardifPlusLent.ecran)
          .replace('{n}', String(ecranTardifPlusLent.jours))
          .replace('{date}', jour(ecranTardifPlusLent.date, lang))}`
      : t('ad.suivi.doorOublisEcransRepartisQuinzaineTardifsBoutsNone');
  /* La part que ces retours lents représentent dans les retours datés de la
     quinzaine, lue sur les mêmes listes que le jeton : le partage se juge
     avant l'appui, sans compter les lignes du dépli. Un lot sans retour daté
     ne se divise pas, et le dit calmement. */
  const repartisQuinzaineTardifsPartPhrase = (() => {
    const retoursQuinzaine = ecransRepartisQuinzaineRevenusListe.length;
    if (retoursQuinzaine === 0) {
      return t('ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPartNone');
    }
    const part = Math.round(
      (ecransRepartisQuinzaineTardifsListe.length / retoursQuinzaine) * 100,
    );
    return t('ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPart')
      .replace('{n}', String(ecransRepartisQuinzaineTardifsListe.length))
      .replace('{k}', String(retoursQuinzaine))
      .replace('{pct}', String(part));
  })();
  /* Les retours rapides de la quinzaine : partis dans les quinze derniers
     jours et revenus en sept journées ou moins. La liste se prend sur celle
     des revenus, si bien que les deux jetons se partagent le même lot sans
     pouvoir se contredire ; chaque ligne porte son délai, lu sur ses deux
     dates. */
  const ecransRepartisQuinzaineRapidesListe = useMemo(
    () =>
      ecransRepartisQuinzaineRevenusListe
        .map((ligne) => ({
          ...ligne,
          jours: joursEntre(ligne.date, ligne.retour),
        }))
        .filter((ligne) => ligne.jours <= 7),
    [ecransRepartisQuinzaineRevenusListe],
  );
  const ecransRepartisQuinzaineRapidesDetail = ecransRepartisQuinzaineRapidesListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisQuinzaineRapidesItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang))
        .replace('{retour}', jour(ligne.retour, lang))
        .replace('{n}', String(ligne.jours)),
    )
    .join(' · ');
  /* Les lignes du dépli que ce jeton écarte, lues sur la même liste des
     écrans repartis : le survol dit ce que l'appui retirera de la vue. */
  const repartisQuinzaineRapidesEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisQuinzaineRapidesListe.length,
  );
  const repartisQuinzaineRapidesEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesEcartes',
  )
    .replace('{n}', String(repartisQuinzaineRapidesEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le délai le plus court et le plus long parmi ces écrans, lus sur les
     mêmes lignes que le jeton : les deux bouts du lot se lisent côte à côte,
     pour que le resserrement se juge avant l'appui. Un lot vide ne nomme
     personne et le dit calmement. */
  const ecranRapidePlusCourt =
    [...ecransRepartisQuinzaineRapidesListe].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const ecranRapidePlusLong =
    [...ecransRepartisQuinzaineRapidesListe].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisQuinzaineRapidesBoutsPhrase =
    ecranRapidePlusCourt && ecranRapidePlusLong
      ? `${t('ad.suivi.doorOublisEcransRepartisQuinzaineRapidesPlusRapide')
          .replace('{ecran}', ecranRapidePlusCourt.ecran)
          .replace('{n}', String(ecranRapidePlusCourt.jours))
          .replace('{date}', jour(ecranRapidePlusCourt.date, lang))} ${t(
          'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesPlusLent',
        )
          .replace('{ecran}', ecranRapidePlusLong.ecran)
          .replace('{n}', String(ecranRapidePlusLong.jours))
          .replace('{date}', jour(ecranRapidePlusLong.date, lang))}`
      : t('ad.suivi.doorOublisEcransRepartisQuinzaineRapidesBoutsNone');
  /* Les retours rapides et tardifs confondus : le même lot de retours datés
     de la quinzaine, pris par les deux bouts — sept journées ou moins, puis
     plus de sept —, réuni en une seule liste. Les deux lots ne peuvent donc
     pas se contredire, et l'écran n'en perd aucun. */
  const ecransRepartisQuinzaineReunisListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: { ecran: string; date: string; retour: string; jours: number }[] = [];
    [...ecransRepartisQuinzaineRapidesListe, ...ecransRepartisQuinzaineTardifsListe].forEach(
      (ligne) => {
        if (vus.has(ligne.ecran)) return;
        vus.add(ligne.ecran);
        lignes.push(ligne);
      },
    );
    return lignes.sort(
      (a, b) =>
        b.jours - a.jours ||
        a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' }),
    );
  }, [ecransRepartisQuinzaineRapidesListe, ecransRepartisQuinzaineTardifsListe]);
  const ecransRepartisQuinzaineReunisDetail = ecransRepartisQuinzaineReunisListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisQuinzaineReunisItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang))
        .replace('{retour}', jour(ligne.retour, lang))
        .replace('{n}', String(ligne.jours)),
    )
    .join(' · ');
  const repartisQuinzaineReunisEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisQuinzaineReunisListe.length,
  );
  const repartisQuinzaineReunisEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisQuinzaineReunisEcartes',
  )
    .replace('{n}', String(repartisQuinzaineReunisEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* La part que les deux lots réunis représentent parmi les écrans partis de
     la quinzaine, lue sur la même liste de la quinzaine : le resserrement se
     juge avant l'appui, sans compter les lignes du dépli. Un lot sans départ
     ne se divise pas, et le dit calmement. */
  const repartisQuinzaineReunisPartPhrase = (() => {
    const partisQuinzaine = ecransRepartisQuinzaineListe.length;
    if (partisQuinzaine === 0) {
      return t('ad.suivi.doorOublisEcransRepartisQuinzaineReunisPartNone');
    }
    const n = ecransRepartisQuinzaineReunisListe.length;
    return t('ad.suivi.doorOublisEcransRepartisQuinzaineReunisPart')
      .replace('{n}', String(n))
      .replace('{total}', String(partisQuinzaine))
      .replace('{pct}', String(Math.round((n / partisQuinzaine) * 100)));
  })();
  /* Les écrans partis dans la quinzaine qu’aucun retour n’a jamais ramenés :
     aucun retour ne les nomme dans l’historique, ni avant ni après leur
     départ. La liste se prend sur celle de la quinzaine, si bien que le jeton
     ne peut pas contredire les autres. */
  const ecransRepartisQuinzaineSansRetourListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisQuinzaineListe.filter(
      (ligne) => !retours.some((item) => item.ecran === ligne.ecran),
    );
  }, [ecransRepartisQuinzaineListe, oublis, vues]);
  const ecransRepartisQuinzaineSansRetourDetail =
    ecransRepartisQuinzaineSansRetourListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{date}', jour(ligne.date, lang)),
      )
      .join(' · ');
  /* Les lignes du dépli que ce jeton écarte, lues sur la même liste des
     écrans repartis : le survol dit ce que l'appui retirera de la vue. */
  const repartisQuinzaineSansRetourEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisQuinzaineSansRetourListe.length,
  );
  const repartisQuinzaineSansRetourEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourEcartes',
  )
    .replace('{n}', String(repartisQuinzaineSansRetourEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Les retours de plus de quinze jours : le départ est déjà sorti de la
     quinzaine, et un retour l'a suivi depuis. La liste se prend sur celle des
     écrans repartis, et le retour le plus récent de chacun fait foi — si bien
     qu'aucun écran n'y pèse deux fois, et qu'aucun jeton ne peut la
     contredire. */
  const ecransRepartisHorsQuinzaineListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisListe.flatMap((ligne) => {
      if (joursEntre(ligne.date, new Date().toISOString()) <= 15) return [];
      const apres = retours
        .filter(
          (item) =>
            item.ecran === ligne.ecran &&
            new Date(item.retour).getTime() > new Date(ligne.date).getTime(),
        )
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour) return [];
      return [
        {
          ecran: ligne.ecran,
          date: ligne.date,
          retour: retour.retour,
          jours: joursEntre(ligne.date, retour.retour),
        },
      ];
    });
  }, [ecransRepartisListe, oublis, vues]);
  const ecransRepartisHorsQuinzaineDetail = ecransRepartisHorsQuinzaineListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisHorsQuinzaineItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang))
        .replace('{retour}', jour(ligne.retour, lang))
        .replace('{n}', String(ligne.jours)),
    )
    .join(' · ');
  const repartisHorsQuinzaineEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisHorsQuinzaineListe.length,
  );
  const repartisHorsQuinzaineEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisHorsQuinzaineEcartes',
  )
    .replace('{n}', String(repartisHorsQuinzaineEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le retour le plus rapide et le plus lent du lot des retours de plus de
     quinze jours, lus sur les mêmes lignes que le jeton : les deux délais se
     lisent côte à côte, pour que le resserrement se juge avant l'appui. Un
     lot vide ne nomme personne et le dit calmement. */
  const ecranHorsQuinzainePlusRapide =
    [...ecransRepartisHorsQuinzaineListe].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const ecranHorsQuinzainePlusLent =
    [...ecransRepartisHorsQuinzaineListe].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisHorsQuinzaineBoutsPhrase =
    ecranHorsQuinzainePlusRapide && ecranHorsQuinzainePlusLent
      ? `${t('ad.suivi.doorOublisEcransRepartisHorsQuinzainePlusRapide')
          .replace('{ecran}', ecranHorsQuinzainePlusRapide.ecran)
          .replace('{n}', String(ecranHorsQuinzainePlusRapide.jours))
          .replace('{date}', jour(ecranHorsQuinzainePlusRapide.date, lang))} ${t(
          'ad.suivi.doorOublisEcransRepartisHorsQuinzainePlusLent',
        )
          .replace('{ecran}', ecranHorsQuinzainePlusLent.ecran)
          .replace('{n}', String(ecranHorsQuinzainePlusLent.jours))
          .replace('{date}', jour(ecranHorsQuinzainePlusLent.date, lang))}`
      : t('ad.suivi.doorOublisEcransRepartisHorsQuinzaineBoutsNone');
  /* La part que ces retours représentent dans tout l’historique des retours
     datés, lue sur la même mémoire que la ligne du CSV : le retour le plus
     récent de chaque écran fait foi, et un historique sans retour daté ne se
     divise pas. Les deux chiffres ne peuvent donc pas se contredire. */
  const repartisHorsQuinzainePartPhrase = (() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    const total = ecransRepartisListe.filter((ligne) =>
      retours.some(
        (item) =>
          item.ecran === ligne.ecran &&
          new Date(item.retour).getTime() > new Date(ligne.date).getTime(),
      ),
    ).length;
    if (total === 0) {
      return t('ad.suivi.doorOublisEcransRepartisHorsQuinzainePartNone');
    }
    const n = ecransRepartisHorsQuinzaineListe.length;
    return t('ad.suivi.doorOublisEcransRepartisHorsQuinzainePart')
      .replace('{n}', String(n))
      .replace('{total}', String(total))
      .replace('{pct}', String(Math.round((n / total) * 100)));
  })();
  /* Les écrans dont l’historique ne porte aucune date de retour : aucun
     retour ne les nomme, ni avant ni après leur dernier retrait. La liste se
     prend sur celle des écrans repartis, si bien qu’aucun autre jeton ne peut
     la contredire. */
  const ecransRepartisAucunRetourListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisListe.filter(
      (ligne) => !retours.some((item) => item.ecran === ligne.ecran),
    );
  }, [ecransRepartisListe, oublis, vues]);
  const ecransRepartisAucunRetourDetail = ecransRepartisAucunRetourListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransAucunRetourItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang)),
    )
    .join(' · ');
  const repartisAucunRetourEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisAucunRetourListe.length,
  );
  const repartisAucunRetourEcartesPhrase = t(
    'ad.suivi.doorOublisEcransAucunRetourEcartes',
  )
    .replace('{n}', String(repartisAucunRetourEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le départ le plus ancien du lot, lu sur les mêmes lignes que le jeton :
     le survol dit depuis combien de journées il attend, pour que le
     resserrement se juge avant l’appui. Un écran parti le jour même dit zéro
     journée, et un lot vide ne nomme personne. */
  const ecranAucunRetourPlusAncien =
    [...ecransRepartisAucunRetourListe].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )[0] ?? null;
  const repartisAucunRetourPlusAncienPhrase = ecranAucunRetourPlusAncien
    ? t('ad.suivi.doorOublisEcransAucunRetourPlusAncien')
        .replace('{ecran}', ecranAucunRetourPlusAncien.ecran)
        .replace('{date}', jour(ecranAucunRetourPlusAncien.date, lang))
        .replace(
          '{n}',
          String(
            joursEntre(ecranAucunRetourPlusAncien.date, new Date().toISOString()),
          ),
        )
    : t('ad.suivi.doorOublisEcransAucunRetourPlusAncienNone');
  /* Les écrans qui portent au moins une date de retour : le complément exact
     des écrans sans aucune date, pris sur la même liste et le même
     historique — les deux jetons ne peuvent donc pas se contredire. */
  const ecransRepartisRetoursDatesListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisListe.filter((ligne) =>
      retours.some((item) => item.ecran === ligne.ecran),
    );
  }, [ecransRepartisListe, oublis, vues]);
  const ecransRepartisRetoursDatesDetail = ecransRepartisRetoursDatesListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRetoursDatesItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang)),
    )
    .join(' · ');
  const repartisRetoursDatesEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisRetoursDatesListe.length,
  );
  const repartisRetoursDatesEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le délai de chaque écran à retours datés, pris sur son retour le plus
     récent : les deux bouts du lot se lisent côte à côte, pour que le
     resserrement se juge avant l’appui. Un lot vide ne nomme personne. */
  const ecransRetoursDatesDelais = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisRetoursDatesListe.flatMap((ligne) => {
      const apres = retours
        .filter((item) => item.ecran === ligne.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour) return [];
      return [
        {
          ecran: ligne.ecran,
          jours: joursEntre(retour.retire, retour.retour),
          retour: retour.retour,
        },
      ];
    });
  }, [ecransRepartisRetoursDatesListe, oublis, vues]);
  const ecranRetoursDatesPlusCourt =
    [...ecransRetoursDatesDelais].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const ecranRetoursDatesPlusLong =
    [...ecransRetoursDatesDelais].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesBoutsPhrase =
    ecranRetoursDatesPlusCourt && ecranRetoursDatesPlusLong
      ? `${t('ad.suivi.doorOublisEcransRetoursDatesPlusCourt')
          .replace('{ecran}', ecranRetoursDatesPlusCourt.ecran)
          .replace('{n}', String(ecranRetoursDatesPlusCourt.jours))
          .replace('{date}', jour(ecranRetoursDatesPlusCourt.retour, lang))} ${t(
          'ad.suivi.doorOublisEcransRetoursDatesPlusLong',
        )
          .replace('{ecran}', ecranRetoursDatesPlusLong.ecran)
          .replace('{n}', String(ecranRetoursDatesPlusLong.jours))
          .replace('{date}', jour(ecranRetoursDatesPlusLong.retour, lang))}`
      : t('ad.suivi.doorOublisEcransRetoursDatesBoutsNone');
  /* Combien de retours datés le dépli laisse de côté pour ces écrans : il n’en
     montre qu’un par écran — le plus récent —, et les plus anciens restent
     hors de la vue. Compté sur le même historique que les deux délais, si
     bien que le chiffre ne peut pas les contredire. */
  const repartisRetoursDatesPlusAnciens = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    const noms = new Set(ecransRepartisRetoursDatesListe.map((ligne) => ligne.ecran));
    const total = retours.filter((item) => noms.has(item.ecran)).length;
    return { total, ecartes: Math.max(0, total - noms.size) };
  }, [ecransRepartisRetoursDatesListe, oublis, vues]);
  const repartisRetoursDatesPlusAnciensPhrase =
    repartisRetoursDatesPlusAnciens.ecartes > 0
      ? t('ad.suivi.doorOublisEcransRetoursDatesPlusAnciens')
          .replace('{n}', String(repartisRetoursDatesPlusAnciens.ecartes))
          .replace('{total}', String(repartisRetoursDatesPlusAnciens.total))
      : t('ad.suivi.doorOublisEcransRetoursDatesPlusAnciensNone');
  /* Les écrans revenus cette semaine avec une date : le retour le plus récent
     de chacun tombe dans la semaine en cours, lu sur le même historique que
     les délais. Un même écran revenu deux fois n’y garde qu’une ligne. */
  const ecransRepartisRetoursDatesSemaineListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisListe.flatMap((ligne) => {
      const apres = retours
        .filter((item) => item.ecran === ligne.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour || !estSemaineEnCours(retour.retour)) return [];
      return [{ ecran: ligne.ecran, date: ligne.date, retour: retour.retour }];
    });
  }, [ecransRepartisListe, oublis, vues]);
  const ecransRepartisRetoursDatesSemaineDetail = ecransRepartisRetoursDatesSemaineListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang))
        .replace('{retour}', jour(ligne.retour, lang)),
    )
    .join(' · ');
  const repartisRetoursDatesSemaineEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisRetoursDatesSemaineListe.length,
  );
  const repartisRetoursDatesSemaineEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesSemaineEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le délai de chaque écran revenu cette semaine avec une date, pris sur son
     retour : les deux bouts du lot se lisent côte à côte, lus sur les mêmes
     lignes que le jeton et que la ligne du CSV. Un lot vide ne nomme personne
     et le dit calmement. */
  const ecransRetoursDatesSemaineDelais = ecransRepartisRetoursDatesSemaineListe.map(
    (ligne) => ({ ...ligne, jours: joursEntre(ligne.date, ligne.retour) }),
  );
  const ecranSemainePlusCourt =
    [...ecransRetoursDatesSemaineDelais].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const ecranSemainePlusLong =
    [...ecransRetoursDatesSemaineDelais].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesSemaineBoutsPhrase =
    ecranSemainePlusCourt && ecranSemainePlusLong
      ? `${t('ad.suivi.doorOublisEcransRetoursDatesSemainePlusCourt')
          .replace('{ecran}', ecranSemainePlusCourt.ecran)
          .replace('{n}', String(ecranSemainePlusCourt.jours))
          .replace('{date}', jour(ecranSemainePlusCourt.retour, lang))} ${t(
          'ad.suivi.doorOublisEcransRetoursDatesSemainePlusLong',
        )
          .replace('{ecran}', ecranSemainePlusLong.ecran)
          .replace('{n}', String(ecranSemainePlusLong.jours))
          .replace('{date}', jour(ecranSemainePlusLong.retour, lang))}`
      : t('ad.suivi.doorOublisEcransRetoursDatesSemaineBoutsNone');
  /* Les écrans revenus ce mois-ci avec une date : le retour le plus récent de
     chacun tombe dans le mois en cours, lu sur le même historique que les
     autres jetons datés. Un même écran revenu deux fois n’y garde qu’une
     ligne. */
  const ecransRepartisRetoursDatesMoisListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisListe.flatMap((ligne) => {
      const apres = retours
        .filter((item) => item.ecran === ligne.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour || !estMoisEnCours(retour.retour)) return [];
      return [{ ecran: ligne.ecran, date: ligne.date, retour: retour.retour }];
    });
  }, [ecransRepartisListe, oublis, vues]);
  const ecransRepartisRetoursDatesMoisDetail = ecransRepartisRetoursDatesMoisListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{date}', jour(ligne.date, lang))
        .replace('{retour}', jour(ligne.retour, lang)),
    )
    .join(' · ');
  const repartisRetoursDatesMoisEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisRetoursDatesMoisListe.length,
  );
  const repartisRetoursDatesMoisEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesMoisEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesMoisEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le délai de chaque écran revenu ce mois-ci avec une date, pris sur son
     dernier retrait et son retour : les deux bouts du lot se lisent côte à
     côte, lus sur les mêmes lignes que le jeton. Un lot vide ne nomme
     personne et le dit calmement. */
  const ecransRetoursDatesMoisDelais = ecransRepartisRetoursDatesMoisListe.map(
    (ligne) => ({ ...ligne, jours: joursEntre(ligne.date, ligne.retour) }),
  );
  const ecranMoisPlusCourt =
    [...ecransRetoursDatesMoisDelais].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const ecranMoisPlusLong =
    [...ecransRetoursDatesMoisDelais].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesMoisBoutsPhrase =
    ecranMoisPlusCourt && ecranMoisPlusLong
      ? `${t('ad.suivi.doorOublisEcransRetoursDatesMoisPlusCourt')
          .replace('{ecran}', ecranMoisPlusCourt.ecran)
          .replace('{n}', String(ecranMoisPlusCourt.jours))
          .replace('{date}', jour(ecranMoisPlusCourt.retour, lang))} ${t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisPlusLong',
        )
          .replace('{ecran}', ecranMoisPlusLong.ecran)
          .replace('{n}', String(ecranMoisPlusLong.jours))
          .replace('{date}', jour(ecranMoisPlusLong.retour, lang))}`
      : t('ad.suivi.doorOublisEcransRetoursDatesMoisBoutsNone');
  /* Les écrans revenus le mois dernier avec une date : le retour le plus
     récent de chacun tombe dans la fenêtre qui vient de se fermer, lue sur le
     même historique que les autres jetons datés. Un même écran revenu deux
     fois n’y garde qu’une ligne. */
  const ecransRepartisRetoursDatesMoisDernierListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisListe.flatMap((ligne) => {
      const apres = retours
        .filter((item) => item.ecran === ligne.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour || !estMoisDernier(retour.retour)) return [];
      return [{ ecran: ligne.ecran, date: ligne.date, retour: retour.retour }];
    });
  }, [ecransRepartisListe, oublis, vues]);
  const ecransRepartisRetoursDatesMoisDernierDetail =
    ecransRepartisRetoursDatesMoisDernierListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesMoisDernierEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisRetoursDatesMoisDernierListe.length,
  );
  const repartisRetoursDatesMoisDernierEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesMoisDernierEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesMoisDernierEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le délai de chaque écran revenu le mois dernier avec une date, pris sur son
     dernier retrait et son retour : les deux bouts du lot se lisent côte à
     côte, lus sur les mêmes lignes que le jeton. Un lot vide ne nomme personne
     et le dit calmement. */
  const ecransRetoursDatesMoisDernierDelais =
    ecransRepartisRetoursDatesMoisDernierListe.map((ligne) => ({
      ...ligne,
      jours: joursEntre(ligne.date, ligne.retour),
    }));
  const ecranMoisDernierPlusCourt =
    [...ecransRetoursDatesMoisDernierDelais].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const ecranMoisDernierPlusLong =
    [...ecransRetoursDatesMoisDernierDelais].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesMoisDernierBoutsPhrase =
    ecranMoisDernierPlusCourt && ecranMoisDernierPlusLong
      ? `${t('ad.suivi.doorOublisEcransRetoursDatesMoisDernierPlusCourt')
          .replace('{ecran}', ecranMoisDernierPlusCourt.ecran)
          .replace('{n}', String(ecranMoisDernierPlusCourt.jours))
          .replace('{date}', jour(ecranMoisDernierPlusCourt.retour, lang))} ${t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisDernierPlusLong',
        )
          .replace('{ecran}', ecranMoisDernierPlusLong.ecran)
          .replace('{n}', String(ecranMoisDernierPlusLong.jours))
          .replace('{date}', jour(ecranMoisDernierPlusLong.retour, lang))}`
      : t('ad.suivi.doorOublisEcransRetoursDatesMoisDernierBoutsNone');
  /* Les écrans revenus l’avant-dernier mois avec une date : le retour le plus
     récent de chacun tombe dans la seconde fenêtre fermée, lue sur le même
     historique que les autres jetons datés. Un même écran revenu deux fois n’y
     garde qu’une ligne. */
  const ecransRepartisRetoursDatesAvantDernierMoisListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisListe.flatMap((ligne) => {
      const apres = retours
        .filter((item) => item.ecran === ligne.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour || !estAvantDernierMois(retour.retour)) return [];
      return [{ ecran: ligne.ecran, date: ligne.date, retour: retour.retour }];
    });
  }, [ecransRepartisListe, oublis, vues]);
  const ecransRepartisRetoursDatesAvantDernierMoisDetail =
    ecransRepartisRetoursDatesAvantDernierMoisListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAvantDernierMoisEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAvantDernierMoisListe.length,
  );
  const repartisRetoursDatesAvantDernierMoisEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesAvantDernierMoisEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le délai de chaque écran revenu l’avant-dernier mois avec une date, pris
     sur son dernier retrait et son retour : les deux bouts du lot se lisent
     côte à côte, lus sur les mêmes lignes que le jeton. Un lot vide ne nomme
     personne et le dit calmement. */
  const ecransRetoursDatesAvantDernierMoisDelais =
    ecransRepartisRetoursDatesAvantDernierMoisListe.map((ligne) => ({
      ...ligne,
      jours: joursEntre(ligne.date, ligne.retour),
    }));
  const ecranAvantDernierMoisPlusCourt =
    [...ecransRetoursDatesAvantDernierMoisDelais].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const ecranAvantDernierMoisPlusLong =
    [...ecransRetoursDatesAvantDernierMoisDelais].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAvantDernierMoisBoutsPhrase =
    ecranAvantDernierMoisPlusCourt && ecranAvantDernierMoisPlusLong
      ? `${t('ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisPlusCourt')
          .replace('{ecran}', ecranAvantDernierMoisPlusCourt.ecran)
          .replace('{n}', String(ecranAvantDernierMoisPlusCourt.jours))
          .replace('{date}', jour(ecranAvantDernierMoisPlusCourt.retour, lang))} ${t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisPlusLong',
        )
          .replace('{ecran}', ecranAvantDernierMoisPlusLong.ecran)
          .replace('{n}', String(ecranAvantDernierMoisPlusLong.jours))
          .replace('{date}', jour(ecranAvantDernierMoisPlusLong.retour, lang))}`
      : t('ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisBoutsNone');
  /* Les deux fenêtres fermées réunies : les écrans du mois dernier d’abord,
     puis ceux de l’avant-dernier, chacun portant le nom de sa fenêtre. Un même
     écran ne peut pas tomber dans les deux à la fois — son retour le plus
     récent fait foi —, et la liste se prend sur les mêmes lignes que les deux
     jetons, si bien qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesDeuxFenetresListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesMoisDernierListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t('ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresMoisDernier'),
      });
    });
    ecransRepartisRetoursDatesAvantDernierMoisListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t('ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresAvantDernier'),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesMoisDernierListe,
    ecransRepartisRetoursDatesAvantDernierMoisListe,
    t,
  ]);
  const ecransRepartisRetoursDatesDeuxFenetresDetail =
    ecransRepartisRetoursDatesDeuxFenetresListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesDeuxFenetresEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisRetoursDatesDeuxFenetresListe.length,
  );
  const repartisRetoursDatesDeuxFenetresEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesDeuxFenetresEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* La part de chaque fenêtre dans le lot réuni, lue sur les mêmes listes :
     le partage se juge avant l’appui, sans compter les lignes du dépli. */
  const repartisRetoursDatesDeuxFenetresPartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresRepartis',
  )
    .replace(
      '{a}',
      String(ecransRepartisRetoursDatesMoisDernierListe.length),
    )
    .replace(
      '{b}',
      String(ecransRepartisRetoursDatesAvantDernierMoisListe.length),
    )
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesDeuxFenetresListe.length),
    );
  /* Les deux délais de chaque fenêtre — le plus court et le plus long —, lus
     sur les mêmes lignes que les deux jetons et le même historique : les deux
     fenêtres se lisent côte à côte, chacune avec ses deux bouts, pour que la
     comparaison se juge sans ouvrir les listes. Une fenêtre vide ne nomme
     personne et le dit calmement. */
  const deuxFenetresBoutsPhrase =
    ecransRetoursDatesMoisDernierDelais.length === 0 &&
    ecransRetoursDatesAvantDernierMoisDelais.length === 0
      ? t('ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresBoutsNone')
      : [
          ecransRetoursDatesMoisDernierDelais.length === 0
            ? t('ad.suivi.doorOublisEcransRetoursDatesMoisDernierBoutsNone')
            : ecranMoisDernierPlusCourt && ecranMoisDernierPlusLong
              ? t(
                  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresBoutsMoisDernier',
                )
                  .replace('{court}', ecranMoisDernierPlusCourt.ecran)
                  .replace('{jc}', String(ecranMoisDernierPlusCourt.jours))
                  .replace('{dc}', jour(ecranMoisDernierPlusCourt.retour, lang))
                  .replace('{long}', ecranMoisDernierPlusLong.ecran)
                  .replace('{jl}', String(ecranMoisDernierPlusLong.jours))
                  .replace('{dl}', jour(ecranMoisDernierPlusLong.retour, lang))
              : '',
          ecransRetoursDatesAvantDernierMoisDelais.length === 0
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisBoutsNone',
              )
            : ecranAvantDernierMoisPlusCourt && ecranAvantDernierMoisPlusLong
              ? t(
                  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresBoutsAvantDernier',
                )
                  .replace('{court}', ecranAvantDernierMoisPlusCourt.ecran)
                  .replace('{jc}', String(ecranAvantDernierMoisPlusCourt.jours))
                  .replace(
                    '{dc}',
                    jour(ecranAvantDernierMoisPlusCourt.retour, lang),
                  )
                  .replace('{long}', ecranAvantDernierMoisPlusLong.ecran)
                  .replace('{jl}', String(ecranAvantDernierMoisPlusLong.jours))
                  .replace(
                    '{dl}',
                    jour(ecranAvantDernierMoisPlusLong.retour, lang),
                  )
              : '',
        ]
          .filter(Boolean)
          .join(' ');
  /* Les écrans revenus ces trois derniers mois avec une date : le retour le
     plus récent de chacun tombe dans la fenêtre des trois mois, lue sur le
     même historique que les autres jetons datés. Un même écran revenu deux
     fois n’y garde qu’une ligne. */
  const ecransRepartisRetoursDatesTrimestreListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    const depuis = new Date();
    depuis.setMonth(depuis.getMonth() - 3);
    depuis.setHours(0, 0, 0, 0);
    return ecransRepartisListe.flatMap((ligne) => {
      const apres = retours
        .filter((item) => item.ecran === ligne.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour || new Date(retour.retour).getTime() < depuis.getTime()) return [];
      return [{ ecran: ligne.ecran, date: ligne.date, retour: retour.retour }];
    });
  }, [ecransRepartisListe, oublis, vues]);
  /* Les écrans revenus avec une date sur le trimestre fermé : les trois mois
     qui précèdent le mois en cours, le mois courant restant dehors. Le retour
     le plus récent de chacun fait foi, lu sur le même historique que les
     autres jetons datés. Un même écran revenu deux fois n’y garde qu’une
     ligne. */
  const ecransRepartisRetoursDatesTrimestreFermeListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisListe.flatMap((ligne) => {
      const apres = retours
        .filter((item) => item.ecran === ligne.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour || !estTrimestreFerme(retour.retour)) return [];
      return [{ ecran: ligne.ecran, date: ligne.date, retour: retour.retour }];
    });
  }, [ecransRepartisListe, oublis, vues]);
  const ecransRepartisRetoursDatesTrimestreFermeDetail =
    ecransRepartisRetoursDatesTrimestreFermeListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesTrimestreFermeEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesTrimestreFermeListe.length,
  );
  const repartisRetoursDatesTrimestreFermeEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesTrimestreFermeEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* L’écran revenu le plus récemment dans le lot du trimestre fermé, lu sur
     les mêmes lignes que le jeton : son jour se lit avant l’appui. Un lot vide
     ne nomme personne et le dit calmement. */
  const ecranTrimestreFermePlusRecent =
    [...ecransRepartisRetoursDatesTrimestreFermeListe].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesTrimestreFermePlusRecentPhrase =
    ecranTrimestreFermePlusRecent
      ? t('ad.suivi.doorOublisEcransRetoursDatesTrimestreFermePlusRecent')
          .replace('{ecran}', ecranTrimestreFermePlusRecent.ecran)
          .replace('{date}', jour(ecranTrimestreFermePlusRecent.retour, lang))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermePlusRecentNone',
        );
  /* Les écrans du trimestre fermé et du mois dernier réunis : le mois dernier
     d’abord, puis le reste du trimestre, chacun portant le nom de sa fenêtre.
     Le mois dernier étant déjà contenu dans le trimestre, un écran déjà nommé
     n’y revient pas — la liste se prend sur les deux jetons, si bien qu’aucun
     ne peut la contredire. */
  const ecransRepartisRetoursDatesTrimestreFermeMoisDernierListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesMoisDernierListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierFenetreMois',
        ),
      });
    });
    ecransRepartisRetoursDatesTrimestreFermeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierFenetreTrimestre',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesMoisDernierListe,
    ecransRepartisRetoursDatesTrimestreFermeListe,
    t,
  ]);
  const ecransRepartisRetoursDatesTrimestreFermeMoisDernierDetail =
    ecransRepartisRetoursDatesTrimestreFermeMoisDernierListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesTrimestreFermeMoisDernierEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesTrimestreFermeMoisDernierListe.length,
  );
  const repartisRetoursDatesTrimestreFermeMoisDernierEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesTrimestreFermeMoisDernierEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  /* Les deux fenêtres côte à côte, lues sur les mêmes listes que le jeton : le
     partage se juge avant l’appui, sans compter les lignes du dépli. */
  const repartisRetoursDatesTrimestreFermeMoisDernierPartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierRepartis',
  )
    .replace(
      '{a}',
      String(ecransRepartisRetoursDatesTrimestreFermeListe.length),
    )
    .replace(
      '{b}',
      String(ecransRepartisRetoursDatesMoisDernierListe.length),
    )
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesTrimestreFermeMoisDernierListe.length),
    );
  /* Le délai le plus court de chaque fenêtre, côte à côte : le mois dernier et
     le trimestre fermé se comparent sur leurs propres lignes, sans ouvrir les
     listes. Une fenêtre vide garde sa phrase à elle, et deux fenêtres vides le
     disent calmement. */
  const plusCourtDeLot = (
    liste: { ecran: string; date: string; retour: string }[],
  ) =>
    [...liste]
      .map((ligne) => ({
        ...ligne,
        jours: joursEntre(ligne.date, ligne.retour),
      }))
      .sort(
        (a, b) =>
          a.jours - b.jours ||
          new Date(a.retour).getTime() - new Date(b.retour).getTime(),
      )[0] ?? null;
  /* Le milieu d’un lot de délais, lu sur les mêmes lignes que le jeton : un
     lot impair donne le délai du milieu, un lot pair la moyenne des deux du
     milieu — le chiffre ne peut donc pas sortir de la liste. Un lot vide ne
     se divise pas et rend zéro, plutôt qu’un délai inventé. */
  const medianeDeLot = (
    liste: { ecran: string; date: string; retour: string }[],
  ) => {
    const ecarts = liste
      .map((ligne) => joursEntre(ligne.date, ligne.retour))
      .sort((a, b) => a - b);
    if (ecarts.length === 0) return null;
    const milieu = Math.floor(ecarts.length / 2);
    const valeur =
      ecarts.length % 2 === 1
        ? ecarts[milieu]
        : (ecarts[milieu - 1] + ecarts[milieu]) / 2;
    return { n: valeur, k: ecarts.length };
  };
  /* Un délai se dit à une décimale, dans la langue du lecteur : le point
     décimal du calcul devient une virgule en français, et reste un point
     ailleurs. */
  const nombreDecimal = (valeur: number) => {
    const texte = String(Math.round(valeur * 10) / 10);
    return lang === 'fr' ? texte.replace('.', ',') : texte;
  };
  const moisDernierPlusCourtFenetre = plusCourtDeLot(
    ecransRepartisRetoursDatesMoisDernierListe,
  );
  const trimestreFermePlusCourtFenetre = plusCourtDeLot(
    ecransRepartisRetoursDatesTrimestreFermeListe,
  );
  const repartisRetoursDatesTrimestreFermeMoisDernierCourtPhrase =
    !moisDernierPlusCourtFenetre && !trimestreFermePlusCourtFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtNone',
        )
      : [
          moisDernierPlusCourtFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtMois',
              )
                .replace('{ecran}', moisDernierPlusCourtFenetre.ecran)
                .replace('{n}', String(moisDernierPlusCourtFenetre.jours))
                .replace(
                  '{date}',
                  jour(moisDernierPlusCourtFenetre.retour, lang),
                )
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtMoisNone',
              ),
          trimestreFermePlusCourtFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtTrimestre',
              )
                .replace('{ecran}', trimestreFermePlusCourtFenetre.ecran)
                .replace('{n}', String(trimestreFermePlusCourtFenetre.jours))
                .replace(
                  '{date}',
                  jour(trimestreFermePlusCourtFenetre.retour, lang),
                )
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtTrimestreNone',
              ),
        ].join(' ');
  const ecransRepartisRetoursDatesTrimestreDetail =
    ecransRepartisRetoursDatesTrimestreListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesTrimestreEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisRetoursDatesTrimestreListe.length,
  );
  const repartisRetoursDatesTrimestreEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesTrimestreEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesTrimestreEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le délai de chaque écran revenu ces trois derniers mois avec une date,
     pris sur son dernier retrait et son retour : les deux bouts du lot se
     lisent côte à côte, lus sur les mêmes lignes que le jeton. Un lot vide ne
     nomme personne et le dit calmement. */
  const ecransRetoursDatesTrimestreDelais =
    ecransRepartisRetoursDatesTrimestreListe.map((ligne) => ({
      ...ligne,
      jours: joursEntre(ligne.date, ligne.retour),
    }));
  const ecranTrimestrePlusCourt =
    [...ecransRetoursDatesTrimestreDelais].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const ecranTrimestrePlusLong =
    [...ecransRetoursDatesTrimestreDelais].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesTrimestreBoutsPhrase =
    ecranTrimestrePlusCourt && ecranTrimestrePlusLong
      ? `${t('ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusCourt')
          .replace('{ecran}', ecranTrimestrePlusCourt.ecran)
          .replace('{n}', String(ecranTrimestrePlusCourt.jours))
          .replace('{date}', jour(ecranTrimestrePlusCourt.retour, lang))} ${t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusLong',
        )
          .replace('{ecran}', ecranTrimestrePlusLong.ecran)
          .replace('{n}', String(ecranTrimestrePlusLong.jours))
          .replace('{date}', jour(ecranTrimestrePlusLong.retour, lang))}`
      : t('ad.suivi.doorOublisEcransRetoursDatesTrimestreBoutsNone');
  /* L’écran revenu le plus récemment dans le lot du trimestre, lu sur les
     mêmes lignes que le jeton : son jour se lit à côté des deux délais, pour
     que le resserrement se juge avant l’appui. Un lot vide ne nomme personne
     et le dit calmement. */
  const ecranTrimestrePlusRecent =
    [...ecransRepartisRetoursDatesTrimestreListe].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesTrimestrePlusRecentPhrase = ecranTrimestrePlusRecent
    ? t('ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusRecent')
        .replace('{ecran}', ecranTrimestrePlusRecent.ecran)
        .replace('{date}', jour(ecranTrimestrePlusRecent.retour, lang))
    : t('ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusRecentNone');
  /* Les écrans revenus sur les douze derniers mois avec une date : le retour
     le plus récent de chacun tombe dans la fenêtre de l’année, lue sur le même
     historique que les autres jetons datés. Un même écran revenu deux fois
     n’y garde qu’une ligne. */
  const ecransRepartisRetoursDatesAnneeListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    const depuis = new Date();
    depuis.setMonth(depuis.getMonth() - 12);
    depuis.setHours(0, 0, 0, 0);
    return ecransRepartisListe.flatMap((ligne) => {
      const apres = retours
        .filter((item) => item.ecran === ligne.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour || new Date(retour.retour).getTime() < depuis.getTime()) return [];
      return [{ ecran: ligne.ecran, date: ligne.date, retour: retour.retour }];
    });
  }, [ecransRepartisListe, oublis, vues]);
  const ecransRepartisRetoursDatesAnneeDetail =
    ecransRepartisRetoursDatesAnneeListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisRetoursDatesAnneeListe.length,
  );
  const repartisRetoursDatesAnneeEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesAnneeEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le délai de chaque écran revenu sur les douze derniers mois, pris sur son
     dernier retrait et son retour : les deux bouts du lot se lisent côte à
     côte, lus sur les mêmes lignes que le jeton. */
  const ecransRetoursDatesAnneeDelais = ecransRepartisRetoursDatesAnneeListe.map(
    (ligne) => ({ ...ligne, jours: joursEntre(ligne.date, ligne.retour) }),
  );
  const ecranAnneePlusCourt =
    [...ecransRetoursDatesAnneeDelais].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const ecranAnneePlusLong =
    [...ecransRetoursDatesAnneeDelais].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeBoutsPhrase =
    ecranAnneePlusCourt && ecranAnneePlusLong
      ? `${t('ad.suivi.doorOublisEcransRetoursDatesAnneePlusCourt')
          .replace('{ecran}', ecranAnneePlusCourt.ecran)
          .replace('{n}', String(ecranAnneePlusCourt.jours))
          .replace('{date}', jour(ecranAnneePlusCourt.retour, lang))} ${t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneePlusLong',
        )
          .replace('{ecran}', ecranAnneePlusLong.ecran)
          .replace('{n}', String(ecranAnneePlusLong.jours))
          .replace('{date}', jour(ecranAnneePlusLong.retour, lang))}`
      : t('ad.suivi.doorOublisEcransRetoursDatesAnneeBoutsNone');
  /* Les écrans revenus avec une date sur l’année fermée : les douze mois qui
     précèdent le mois en cours, le mois courant restant dehors. Le retour le
     plus récent de chacun fait foi, lu sur le même historique que les autres
     jetons datés. Un même écran revenu deux fois n’y garde qu’une ligne. */
  const ecransRepartisRetoursDatesAnneeFermeeListe = useMemo(() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    return ecransRepartisListe.flatMap((ligne) => {
      const apres = retours
        .filter((item) => item.ecran === ligne.ecran)
        .sort(
          (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
        );
      const retour = apres[0];
      if (!retour || !estAnneeFermee(retour.retour)) return [];
      return [{ ecran: ligne.ecran, date: ligne.date, retour: retour.retour }];
    });
  }, [ecransRepartisListe, oublis, vues]);
  const ecransRepartisRetoursDatesAnneeFermeeDetail =
    ecransRepartisRetoursDatesAnneeFermeeListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAnneeFermeeListe.length,
  );
  const repartisRetoursDatesAnneeFermeeEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesAnneeFermeeEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le délai de chaque écran revenu sur les douze mois fermés, pris sur son
     dernier retrait et son retour : les deux bouts du lot se lisent côte à
     côte, lus sur les mêmes lignes que le jeton. Un lot vide ne nomme personne
     et le dit calmement. */
  const ecransRetoursDatesAnneeFermeeDelais =
    ecransRepartisRetoursDatesAnneeFermeeListe.map((ligne) => ({
      ...ligne,
      jours: joursEntre(ligne.date, ligne.retour),
    }));
  const ecranAnneeFermeePlusCourt =
    [...ecransRetoursDatesAnneeFermeeDelais].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const ecranAnneeFermeePlusLong =
    [...ecransRetoursDatesAnneeFermeeDelais].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeBoutsPhrase =
    ecranAnneeFermeePlusCourt && ecranAnneeFermeePlusLong
      ? `${t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeePlusCourt')
          .replace('{ecran}', ecranAnneeFermeePlusCourt.ecran)
          .replace('{n}', String(ecranAnneeFermeePlusCourt.jours))
          .replace('{date}', jour(ecranAnneeFermeePlusCourt.retour, lang))} ${t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeePlusLong',
        )
          .replace('{ecran}', ecranAnneeFermeePlusLong.ecran)
          .replace('{n}', String(ecranAnneeFermeePlusLong.jours))
          .replace('{date}', jour(ecranAnneeFermeePlusLong.retour, lang))}`
      : t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeBoutsNone');
  /* Les écrans du trimestre fermé et de l’année fermée réunis : le trimestre
     d’abord, puis le reste de l’année, chacun portant le nom de sa fenêtre.
     Le trimestre fermé étant déjà contenu dans l’année fermée, un écran déjà
     nommé n’y revient pas — la liste se prend sur les deux jetons, si bien
     qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreFermeListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesTrimestreFermeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeFenetreTrimestre',
        ),
      });
    });
    ecransRepartisRetoursDatesAnneeFermeeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeFenetreAnnee',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesTrimestreFermeListe,
    ecransRepartisRetoursDatesAnneeFermeeListe,
    t,
  ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreFermeDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreFermeListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreFermeEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAnneeFermeeTrimestreFermeListe.length,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreFermeEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesAnneeFermeeTrimestreFermeEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesAnneeFermeeTrimestreFermePartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRepartis',
  )
    .replace(
      '{a}',
      String(ecransRepartisRetoursDatesAnneeFermeeListe.length),
    )
    .replace(
      '{b}',
      String(ecransRepartisRetoursDatesTrimestreFermeListe.length),
    )
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesAnneeFermeeTrimestreFermeListe.length),
    );
  /* L’écran revenu le plus récemment de chaque fenêtre — le trimestre fermé
     d’un côté, l’année fermée de l’autre —, lu sur les mêmes lignes que le
     jeton : les deux se lisent côte à côte, chacun avec son jour. Une fenêtre
     vide garde sa phrase à elle, et deux fenêtres vides le disent
     calmement. */
  const ecranTrimestreFermePlusRecentFenetre =
    [...ecransRepartisRetoursDatesTrimestreFermeListe].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const ecranAnneeFermeePlusRecentFenetre =
    [...ecransRepartisRetoursDatesAnneeFermeeListe].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreFermeRecentsPhrase = [
    ecranTrimestreFermePlusRecentFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsMois',
        )
          .replace('{ecran}', ecranTrimestreFermePlusRecentFenetre.ecran)
          .replace(
            '{date}',
            jour(ecranTrimestreFermePlusRecentFenetre.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsMoisNone',
        ),
    ecranAnneeFermeePlusRecentFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsAnnee',
        )
          .replace('{ecran}', ecranAnneeFermeePlusRecentFenetre.ecran)
          .replace(
            '{date}',
            jour(ecranAnneeFermeePlusRecentFenetre.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsAnneeNone',
        ),
  ].join(' ');
  /* Le jeton qui compare l’année fermée et le mois en cours : le mois en
     cours d’abord, puis le reste de l’année, chacun portant le nom de sa
     fenêtre. Les deux fenêtres ne se recouvrant pas — l’année fermée s’arrête
     la veille du mois courant —, aucun écran n’y pèse deux fois ; la liste se
     prend sur les deux jetons, si bien qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesAnneeFermeeMoisEnCoursListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesMoisListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursFenetreMoisEnCours',
        ),
      });
    });
    ecransRepartisRetoursDatesAnneeFermeeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursFenetreAnnee',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesMoisListe,
    ecransRepartisRetoursDatesAnneeFermeeListe,
    t,
  ]);
  const ecransRepartisRetoursDatesAnneeFermeeMoisEnCoursDetail =
    ecransRepartisRetoursDatesAnneeFermeeMoisEnCoursListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeMoisEnCoursEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAnneeFermeeMoisEnCoursListe.length,
  );
  const repartisRetoursDatesAnneeFermeeMoisEnCoursEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesAnneeFermeeMoisEnCoursEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesAnneeFermeeMoisEnCoursPartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesMoisListe.length))
    .replace('{b}', String(ecransRepartisRetoursDatesAnneeFermeeListe.length))
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesAnneeFermeeMoisEnCoursListe.length),
    );
  /* L’écran revenu le plus récemment de chaque fenêtre — le mois en cours
     d’un côté, l’année fermée de l’autre —, lu sur les mêmes lignes que le
     jeton : les deux se lisent côte à côte, chacun avec son jour. Une fenêtre
     vide garde sa phrase à elle, et deux fenêtres vides le disent
     calmement. */
  const ecranMoisEnCoursPlusRecentFenetre =
    [...ecransRepartisRetoursDatesMoisListe].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeMoisEnCoursRecentsPhrase = [
    ecranMoisEnCoursPlusRecentFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsMoisEnCours',
        )
          .replace('{ecran}', ecranMoisEnCoursPlusRecentFenetre.ecran)
          .replace(
            '{date}',
            jour(ecranMoisEnCoursPlusRecentFenetre.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsMoisEnCoursNone',
        ),
    ecranAnneeFermeePlusRecentFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsAnnee',
        )
          .replace('{ecran}', ecranAnneeFermeePlusRecentFenetre.ecran)
          .replace(
            '{date}',
            jour(ecranAnneeFermeePlusRecentFenetre.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsAnneeNone',
        ),
  ].join(' ');
  /* Les écrans du mois en cours et du mois dernier réunis : le mois en cours
     d’abord, puis le mois dernier, chacun portant le nom de sa fenêtre. Les
     deux mois ne se recouvrant pas, aucun écran n’y pèse deux fois — la liste
     se prend sur les deux jetons, si bien qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesMoisEnCoursMoisDernierListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesMoisListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierFenetreMoisEnCours',
        ),
      });
    });
    ecransRepartisRetoursDatesMoisDernierListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierFenetreMoisDernier',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesMoisListe,
    ecransRepartisRetoursDatesMoisDernierListe,
    t,
  ]);
  const ecransRepartisRetoursDatesMoisEnCoursMoisDernierDetail =
    ecransRepartisRetoursDatesMoisEnCoursMoisDernierListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesMoisEnCoursMoisDernierEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesMoisEnCoursMoisDernierListe.length,
  );
  const repartisRetoursDatesMoisEnCoursMoisDernierEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesMoisEnCoursMoisDernierEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesMoisEnCoursMoisDernierPartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesMoisListe.length))
    .replace('{b}', String(ecransRepartisRetoursDatesMoisDernierListe.length))
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesMoisEnCoursMoisDernierListe.length),
    );
  /* Les écrans de l’avant-dernier mois et du mois en cours réunis :
     l’avant-dernier mois d’abord, puis le mois en cours, chacun portant le nom
     de sa fenêtre. Les deux mois ne se recouvrant pas — l’avant-dernier s’est
     fermé la veille du mois dernier —, aucun écran n’y pèse deux fois ; la
     liste se prend sur les deux jetons, si bien qu’aucun ne peut la
     contredire. */
  const ecransRepartisRetoursDatesAvantDernierMoisMoisEnCoursListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesAvantDernierMoisListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursFenetreAvantDernier',
        ),
      });
    });
    ecransRepartisRetoursDatesMoisListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursFenetreMoisEnCours',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesAvantDernierMoisListe,
    ecransRepartisRetoursDatesMoisListe,
    t,
  ]);
  /* Le jeton qui compare le mois dernier et le trimestre en cours : le mois
     dernier d’abord, puis le reste du trimestre, chacun portant le nom de sa
     fenêtre. Le mois dernier étant déjà contenu dans le trimestre, un écran
     déjà nommé n’y revient pas — la liste se prend sur les deux jetons, si
     bien qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesMoisDernierTrimestreListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesMoisDernierListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFenetreMoisDernier',
        ),
      });
    });
    ecransRepartisRetoursDatesTrimestreListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFenetreTrimestre',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesMoisDernierListe,
    ecransRepartisRetoursDatesTrimestreListe,
    t,
  ]);
  const ecransRepartisRetoursDatesMoisDernierTrimestreDetail =
    ecransRepartisRetoursDatesMoisDernierTrimestreListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesMoisDernierTrimestreEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesMoisDernierTrimestreListe.length,
  );
  const repartisRetoursDatesMoisDernierTrimestreEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesMoisDernierTrimestreEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesMoisDernierTrimestrePartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesMoisDernierListe.length))
    .replace('{b}', String(ecransRepartisRetoursDatesTrimestreListe.length))
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesMoisDernierTrimestreListe.length),
    );
  const ecransRepartisRetoursDatesAvantDernierMoisMoisEnCoursDetail =
    ecransRepartisRetoursDatesAvantDernierMoisMoisEnCoursListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAvantDernierMoisMoisEnCoursEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAvantDernierMoisMoisEnCoursListe.length,
  );
  const repartisRetoursDatesAvantDernierMoisMoisEnCoursEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesAvantDernierMoisMoisEnCoursEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesAvantDernierMoisMoisEnCoursPartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursRepartis',
  )
    .replace(
      '{a}',
      String(ecransRepartisRetoursDatesAvantDernierMoisListe.length),
    )
    .replace('{b}', String(ecransRepartisRetoursDatesMoisListe.length))
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesAvantDernierMoisMoisEnCoursListe.length),
    );
  /* Les écrans de l’avant-dernier mois et de l’année fermée réunis :
     l’avant-dernier mois d’abord, puis le reste de l’année, chacun portant le
     nom de sa fenêtre. L’avant-dernier mois étant déjà contenu dans l’année,
     un écran déjà nommé n’y revient pas — la liste se prend sur les deux
     jetons, si bien qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesDeuxMoisFermesListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesAvantDernierMoisListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesFenetreMois',
        ),
      });
    });
    ecransRepartisRetoursDatesAnneeFermeeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesFenetreAnnee',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesAvantDernierMoisListe,
    ecransRepartisRetoursDatesAnneeFermeeListe,
    t,
  ]);
  const ecransRepartisRetoursDatesDeuxMoisFermesDetail =
    ecransRepartisRetoursDatesDeuxMoisFermesListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesDeuxMoisFermesEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesDeuxMoisFermesListe.length,
  );
  const repartisRetoursDatesDeuxMoisFermesEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesDeuxMoisFermesEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesDeuxMoisFermesPartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesAnneeFermeeListe.length))
    .replace(
      '{b}',
      String(ecransRepartisRetoursDatesAvantDernierMoisListe.length),
    )
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesDeuxMoisFermesListe.length),
    );
  /* Le délai le plus court de chaque fenêtre du jeton « deux derniers mois
     fermés » — l’avant-dernier mois d’un côté, l’année fermée de l’autre —,
     lu sur les mêmes lignes que lui : les deux se lisent côte à côte, chacun
     avec son jour. Une fenêtre vide garde sa phrase à elle, et deux fenêtres
     vides le disent calmement. */
  const avantDernierMoisPlusCourtFenetre = plusCourtDeLot(
    ecransRepartisRetoursDatesAvantDernierMoisListe,
  );
  const anneeFermeePlusCourtFenetre = plusCourtDeLot(
    ecransRepartisRetoursDatesAnneeFermeeListe,
  );
  const repartisRetoursDatesDeuxMoisFermesCourtPhrase =
    !avantDernierMoisPlusCourtFenetre && !anneeFermeePlusCourtFenetre
      ? t('ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtNone')
      : [
          avantDernierMoisPlusCourtFenetre
            ? t('ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtMois')
                .replace('{ecran}', avantDernierMoisPlusCourtFenetre.ecran)
                .replace('{n}', String(avantDernierMoisPlusCourtFenetre.jours))
                .replace(
                  '{date}',
                  jour(avantDernierMoisPlusCourtFenetre.retour, lang),
                )
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtMoisNone',
              ),
          anneeFermeePlusCourtFenetre
            ? t('ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtAnnee')
                .replace('{ecran}', anneeFermeePlusCourtFenetre.ecran)
                .replace('{n}', String(anneeFermeePlusCourtFenetre.jours))
                .replace(
                  '{date}',
                  jour(anneeFermeePlusCourtFenetre.retour, lang),
                )
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtAnneeNone',
              ),
        ].join(' ');
  /* Le jeton qui compare l’avant-dernier mois et le mois dernier : il ne garde
     que leurs écrans, chacun portant la fenêtre qui le tient — le mois dernier
     d’abord, puis l’avant-dernier. Les deux mois ne se recouvrant pas, aucun
     écran n’y pèse deux fois. */
  const ecransRepartisRetoursDatesAvantDernierMoisMoisDernierListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesMoisDernierListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierFenetreMoisDernier',
        ),
      });
    });
    ecransRepartisRetoursDatesAvantDernierMoisListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierFenetreAvantDernier',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesMoisDernierListe,
    ecransRepartisRetoursDatesAvantDernierMoisListe,
    t,
  ]);
  const ecransRepartisRetoursDatesAvantDernierMoisMoisDernierDetail =
    ecransRepartisRetoursDatesAvantDernierMoisMoisDernierListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAvantDernierMoisMoisDernierEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAvantDernierMoisMoisDernierListe.length,
  );
  const repartisRetoursDatesAvantDernierMoisMoisDernierEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesAvantDernierMoisMoisDernierEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesAvantDernierMoisMoisDernierPartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesMoisDernierListe.length))
    .replace(
      '{b}',
      String(ecransRepartisRetoursDatesAvantDernierMoisListe.length),
    )
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesAvantDernierMoisMoisDernierListe.length),
    );
  /* L’écran revenu le plus récemment de chaque mois — le mois dernier d’un
     côté, l’avant-dernier de l’autre —, lu sur les mêmes lignes que le jeton :
     les deux se lisent côte à côte, chacun avec son jour. Un mois vide garde
     sa phrase à lui, et deux mois vides le disent calmement. */
  const ecranMoisDernierPlusRecentFenetre =
    [...ecransRepartisRetoursDatesMoisDernierListe].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const ecranAvantDernierMoisPlusRecentFenetre =
    [...ecransRepartisRetoursDatesAvantDernierMoisListe].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAvantDernierMoisMoisDernierRecentsPhrase = [
    ecranMoisDernierPlusRecentFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsMoisDernier',
        )
          .replace('{ecran}', ecranMoisDernierPlusRecentFenetre.ecran)
          .replace(
            '{date}',
            jour(ecranMoisDernierPlusRecentFenetre.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsMoisDernierNone',
        ),
    ecranAvantDernierMoisPlusRecentFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsAvantDernier',
        )
          .replace('{ecran}', ecranAvantDernierMoisPlusRecentFenetre.ecran)
          .replace(
            '{date}',
            jour(ecranAvantDernierMoisPlusRecentFenetre.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsAvantDernierNone',
        ),
  ].join(' ');
  /* Le jeton qui compare le mois dernier et le trimestre fermé : le mois
     dernier d’abord, puis le reste du trimestre, chacun portant le nom de sa
     fenêtre. Le mois dernier étant déjà contenu dans le trimestre fermé, un
     écran déjà nommé n’y revient pas — la liste se prend sur les deux jetons,
     si bien qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesMoisDernierTrimestreFermeListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesMoisDernierListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeFenetreMoisDernier',
        ),
      });
    });
    ecransRepartisRetoursDatesTrimestreFermeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeFenetreTrimestre',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesMoisDernierListe,
    ecransRepartisRetoursDatesTrimestreFermeListe,
    t,
  ]);
  const ecransRepartisRetoursDatesMoisDernierTrimestreFermeDetail =
    ecransRepartisRetoursDatesMoisDernierTrimestreFermeListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesMoisDernierTrimestreFermeEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesMoisDernierTrimestreFermeListe.length,
  );
  const repartisRetoursDatesMoisDernierTrimestreFermeEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesMoisDernierTrimestreFermeEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesMoisDernierTrimestreFermePartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesMoisDernierListe.length))
    .replace(
      '{b}',
      String(ecransRepartisRetoursDatesTrimestreFermeListe.length),
    )
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesMoisDernierTrimestreFermeListe.length),
    );
  /* Le délai le plus court de chaque fenêtre du jeton « mois dernier et
     trimestre fermé » — le mois dernier d’un côté, le trimestre fermé de
     l’autre —, lu sur les mêmes lignes que lui : les deux se lisent côte à
     côte, chacun avec son jour. Une fenêtre vide garde sa phrase à elle, et
     deux fenêtres vides le disent calmement. */
  const repartisRetoursDatesMoisDernierTrimestreFermeCourtPhrase =
    !moisDernierPlusCourtFenetre && !trimestreFermePlusCourtFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtNone',
        )
      : [
          moisDernierPlusCourtFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtMois',
              )
                .replace('{ecran}', moisDernierPlusCourtFenetre.ecran)
                .replace('{n}', String(moisDernierPlusCourtFenetre.jours))
                .replace(
                  '{date}',
                  jour(moisDernierPlusCourtFenetre.retour, lang),
                )
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtMoisNone',
              ),
          trimestreFermePlusCourtFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtTrimestre',
              )
                .replace('{ecran}', trimestreFermePlusCourtFenetre.ecran)
                .replace('{n}', String(trimestreFermePlusCourtFenetre.jours))
                .replace(
                  '{date}',
                  jour(trimestreFermePlusCourtFenetre.retour, lang),
                )
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtTrimestreNone',
              ),
        ].join(' ');
  /* Le délai médian de chaque fenêtre du jeton « trimestre fermé et
     avant-dernier mois » — le trimestre fermé d’un côté, l’avant-dernier mois
     de l’autre —, lu sur les mêmes lignes que lui : les deux milieux se lisent
     côte à côte, chacun avec son lot. Une fenêtre vide garde sa phrase à elle,
     et deux fenêtres vides le disent calmement. */
  const trimestreFermeMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesTrimestreFermeListe,
  );
  const avantDernierMoisMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesAvantDernierMoisListe,
  );
  const repartisRetoursDatesTrimestreFermeAvantDernierMoisMedianePhrase =
    !trimestreFermeMedianeFenetre && !avantDernierMoisMedianeFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeNone',
        )
      : [
          trimestreFermeMedianeFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeTrimestre',
              )
                .replace('{n}', nombreDecimal(trimestreFermeMedianeFenetre.n))
                .replace('{k}', String(trimestreFermeMedianeFenetre.k))
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeTrimestreNone',
              ),
          avantDernierMoisMedianeFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeAvantDernier',
              )
                .replace(
                  '{n}',
                  nombreDecimal(avantDernierMoisMedianeFenetre.n),
                )
                .replace('{k}', String(avantDernierMoisMedianeFenetre.k))
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeAvantDernierNone',
              ),
        ].join(' ');
  /* Le délai médian de chaque fenêtre du jeton « trimestre fermé et année
     fermée » — le trimestre fermé d’un côté, l’année fermée de l’autre —, lu
     sur les mêmes lignes que lui : les deux milieux se lisent côte à côte,
     chacun avec son lot. Le trimestre étant déjà compté dans l’année, les deux
     chiffres se prennent sur le retour le plus récent de chaque écran, si bien
     qu’aucun ne peut contredire l’autre. Une fenêtre vide garde sa phrase à
     elle, et deux fenêtres vides le disent calmement. */
  const anneeFermeeMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeListe,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreFermeMedianePhrase =
    !trimestreFermeMedianeFenetre && !anneeFermeeMedianeFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeNone',
        )
      : [
          trimestreFermeMedianeFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeTrimestre',
              )
                .replace('{n}', nombreDecimal(trimestreFermeMedianeFenetre.n))
                .replace('{k}', String(trimestreFermeMedianeFenetre.k))
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeTrimestreNone',
              ),
          anneeFermeeMedianeFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeAnnee',
              )
                .replace('{n}', nombreDecimal(anneeFermeeMedianeFenetre.n))
                .replace('{k}', String(anneeFermeeMedianeFenetre.k))
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeAnneeNone',
              ),
        ].join(' ');
  /* Le délai médian de chaque mois du jeton « mois en cours et mois
     dernier » — le mois en cours d’un côté, le mois dernier de l’autre —, lu
     sur les mêmes lignes que lui : les deux milieux se lisent côte à côte,
     chacun avec son lot. Les deux mois ne se recouvrant pas, les deux chiffres
     se prennent sur le retour le plus récent de chaque écran, si bien
     qu’aucun ne peut contredire l’autre. Un mois vide garde sa phrase à lui,
     et deux mois vides le disent calmement. */
  const moisEnCoursMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesMoisListe,
  );
  const moisDernierMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesMoisDernierListe,
  );
  const repartisRetoursDatesMoisEnCoursMoisDernierMedianePhrase =
    !moisEnCoursMedianeFenetre && !moisDernierMedianeFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeNone',
        )
      : [
          moisEnCoursMedianeFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisEnCours',
              )
                .replace('{n}', nombreDecimal(moisEnCoursMedianeFenetre.n))
                .replace('{k}', String(moisEnCoursMedianeFenetre.k))
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisEnCoursNone',
              ),
          moisDernierMedianeFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisDernier',
              )
                .replace('{n}', nombreDecimal(moisDernierMedianeFenetre.n))
                .replace('{k}', String(moisDernierMedianeFenetre.k))
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisDernierNone',
              ),
        ].join(' ');
  /* Le délai médian de chaque mois du jeton « avant-dernier mois et mois en
     cours » — l’avant-dernier mois d’un côté, le mois en cours de l’autre —,
     lu sur les mêmes lignes que lui : les deux milieux se lisent côte à côte,
     chacun avec son lot. Les deux mois ne se recouvrant pas, les deux chiffres
     se prennent sur le retour le plus récent de chaque écran, si bien
     qu’aucun ne peut contredire l’autre. Un mois vide garde sa phrase à lui,
     et deux mois vides le disent calmement. */
  const repartisRetoursDatesAvantDernierMoisMoisEnCoursMedianePhrase =
    !avantDernierMoisMedianeFenetre && !moisEnCoursMedianeFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeNone',
        )
      : [
          avantDernierMoisMedianeFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeAvantDernier',
              )
                .replace(
                  '{n}',
                  nombreDecimal(avantDernierMoisMedianeFenetre.n),
                )
                .replace('{k}', String(avantDernierMoisMedianeFenetre.k))
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeAvantDernierNone',
              ),
          moisEnCoursMedianeFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeMoisEnCours',
              )
                .replace('{n}', nombreDecimal(moisEnCoursMedianeFenetre.n))
                .replace('{k}', String(moisEnCoursMedianeFenetre.k))
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeMoisEnCoursNone',
              ),
        ].join(' ');
  /* Le délai médian de chaque fenêtre du jeton « mois dernier et trimestre en
     cours » — le mois dernier d’un côté, le trimestre de l’autre —, lu sur les
     mêmes lignes que lui : les deux milieux se lisent côte à côte, chacun avec
     son lot. Le mois dernier étant déjà contenu dans le trimestre, les deux
     chiffres se prennent sur le retour le plus récent de chaque écran, si bien
     qu’aucun ne peut contredire l’autre. Une fenêtre vide garde sa phrase à
     elle, et deux fenêtres vides le disent calmement. */
  const trimestreMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesTrimestreListe,
  );
  const repartisRetoursDatesMoisDernierTrimestreMedianePhrase =
    !moisDernierMedianeFenetre && !trimestreMedianeFenetre
      ? t('ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeNone')
      : [
          moisDernierMedianeFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeMoisDernier',
              )
                .replace('{n}', nombreDecimal(moisDernierMedianeFenetre.n))
                .replace('{k}', String(moisDernierMedianeFenetre.k))
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeMoisDernierNone',
              ),
          trimestreMedianeFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeTrimestre',
              )
                .replace('{n}', nombreDecimal(trimestreMedianeFenetre.n))
                .replace('{k}', String(trimestreMedianeFenetre.k))
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeTrimestreNone',
              ),
        ].join(' ');
  /* Le jeton qui compare l’année fermée et le trimestre en cours : l’année
     fermée d’abord, puis ce que le trimestre y ajoute, chacun portant le nom
     de sa fenêtre. Les deux fenêtres se recouvrant — le mois dernier et
     l’avant-dernier tiennent dans l’année comme dans le trimestre —, un écran
     déjà nommé n’y revient pas ; la liste se prend sur les deux jetons, si
     bien qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesAnneeFermeeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFenetreAnnee',
        ),
      });
    });
    ecransRepartisRetoursDatesTrimestreListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFenetreTrimestre',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesAnneeFermeeListe,
    ecransRepartisRetoursDatesTrimestreListe,
    t,
  ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAnneeFermeeTrimestreListe.length,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesAnneeFermeeTrimestreEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesAnneeFermeeTrimestrePartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesAnneeFermeeListe.length))
    .replace('{b}', String(ecransRepartisRetoursDatesTrimestreListe.length))
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesAnneeFermeeTrimestreListe.length),
    );
  const repartisRetoursDatesAnneeFermeeTrimestreMedianePhrase =
    !anneeFermeeMedianeFenetre && !trimestreMedianeFenetre
      ? t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeNone')
      : [
          anneeFermeeMedianeFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeAnnee',
              )
                .replace('{n}', nombreDecimal(anneeFermeeMedianeFenetre.n))
                .replace('{k}', String(anneeFermeeMedianeFenetre.k))
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeAnneeNone',
              ),
          trimestreMedianeFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeTrimestre',
              )
                .replace('{n}', nombreDecimal(trimestreMedianeFenetre.n))
                .replace('{k}', String(trimestreMedianeFenetre.k))
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeTrimestreNone',
              ),
        ].join(' ');
  /* La fenêtre dont le milieu est le plus court, dite d’un mot : les deux
     milieux sont déjà posés côte à côte, cette phrase tranche entre eux —
     celle qui ramène le plus vite. À égalité, elle le dit plutôt que d’en
     choisir une, et deux fenêtres vides gardent le silence. */
  const repartisRetoursDatesAnneeFermeeTrimestreCourtPhrase = (() => {
    if (!anneeFermeeMedianeFenetre && !trimestreMedianeFenetre) return '';
    if (!trimestreMedianeFenetre) {
      return t(
        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtAnnee',
      ).replace('{n}', nombreDecimal(anneeFermeeMedianeFenetre.n));
    }
    if (!anneeFermeeMedianeFenetre) {
      return t(
        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtTrimestre',
      ).replace('{n}', nombreDecimal(trimestreMedianeFenetre.n));
    }
    if (anneeFermeeMedianeFenetre.n < trimestreMedianeFenetre.n) {
      return t(
        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtAnnee',
      ).replace('{n}', nombreDecimal(anneeFermeeMedianeFenetre.n));
    }
    if (trimestreMedianeFenetre.n < anneeFermeeMedianeFenetre.n) {
      return t(
        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtTrimestre',
      ).replace('{n}', nombreDecimal(trimestreMedianeFenetre.n));
    }
    return t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtEgal',
    ).replace('{n}', nombreDecimal(anneeFermeeMedianeFenetre.n));
  })();
  /* Ce que l’année fermée ajoute seule : les écrans dont le retour le plus
     récent tombe dans l’année fermée et dans aucune autre fenêtre de la
     série. La liste se prend sur celle de l’année fermée, si bien qu’aucun
     jeton ne peut la contredire. */
  const ecransRepartisRetoursDatesAnneeFermeeSeuleListe = useMemo(
    () =>
      ecransRepartisRetoursDatesAnneeFermeeListe.filter(
        (ligne) =>
          !estMoisEnCours(ligne.retour) &&
          !estMoisDernier(ligne.retour) &&
          !estAvantDernierMois(ligne.retour) &&
          !estTrimestreFerme(ligne.retour) &&
          !estSemaineEnCours(ligne.retour),
      ),
    [ecransRepartisRetoursDatesAnneeFermeeListe],
  );
  const ecransRepartisRetoursDatesAnneeFermeeSeuleDetail =
    ecransRepartisRetoursDatesAnneeFermeeSeuleListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeSeuleEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAnneeFermeeSeuleListe.length,
  );
  const repartisRetoursDatesAnneeFermeeSeuleEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesAnneeFermeeSeuleEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesAnneeFermeeSeulePartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesAnneeFermeeListe.length))
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesAnneeFermeeSeuleListe.length),
    );
  /* Le milieu du lot que l’année fermée nomme seule, posé à côté de sa part
     comme sur les autres jetons de la série : le même retour le plus récent de
     chaque écran fait foi, si bien que le chiffre ne peut pas contredire la
     liste. Un lot vide le dit calmement. */
  const anneeFermeeSeuleMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeSeuleListe,
  );
  const repartisRetoursDatesAnneeFermeeSeuleMedianePhrase =
    anneeFermeeSeuleMedianeFenetre
      ? t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleMediane')
          .replace('{n}', nombreDecimal(anneeFermeeSeuleMedianeFenetre.n))
          .replace('{k}', String(anneeFermeeSeuleMedianeFenetre.k))
      : t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleMedianeNone');
  /* Ce que le trimestre en cours ajoute seul, posé à côté de ce que l’année
     fermée ajoute seule : les écrans dont le retour le plus récent tombe dans
     le trimestre et que l’année fermée ne nomme pas — son trimestre fermé y
     étant déjà contenu. La liste se prend sur celle du trimestre, si bien
     qu’aucun jeton ne peut la contredire. */
  const ecransRepartisRetoursDatesTrimestreSeuleListe = useMemo(
    () =>
      ecransRepartisRetoursDatesTrimestreListe.filter(
        (ligne) =>
          !estAnneeFermee(ligne.retour) && !estTrimestreFerme(ligne.retour),
      ),
    [ecransRepartisRetoursDatesTrimestreListe],
  );
  const ecransRepartisRetoursDatesTrimestreSeuleDetail =
    ecransRepartisRetoursDatesTrimestreSeuleListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesTrimestreSeuleEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesTrimestreSeuleListe.length,
  );
  const repartisRetoursDatesTrimestreSeuleEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesTrimestreSeuleEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesTrimestreSeulePartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesTrimestreListe.length))
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesTrimestreSeuleListe.length),
    );
  /* Le milieu du lot que le trimestre en cours nomme seul, posé à côté de sa
     part comme sur les autres jetons de la série : le même retour le plus
     récent de chaque écran fait foi, si bien que le chiffre ne peut pas
     contredire la liste. Un lot vide le dit calmement. */
  const trimestreSeuleMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesTrimestreSeuleListe,
  );
  const repartisRetoursDatesTrimestreSeuleMedianePhrase =
    trimestreSeuleMedianeFenetre
      ? t('ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleMediane')
          .replace('{n}', nombreDecimal(trimestreSeuleMedianeFenetre.n))
          .replace('{k}', String(trimestreSeuleMedianeFenetre.k))
      : t('ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleMedianeNone');
  /* La fenêtre dont le milieu est le plus court entre les deux additions,
     dite d’un mot : l’année fermée seule ou le trimestre en cours seul —
     celle qui ramène le plus vite. À égalité, elle le dit plutôt que d’en
     choisir une, et deux lots vides gardent le silence. */
  const repartisRetoursDatesTrimestreSeuleCourtPhrase = (() => {
    if (!anneeFermeeSeuleMedianeFenetre && !trimestreSeuleMedianeFenetre) return '';
    if (!trimestreSeuleMedianeFenetre) {
      return t('ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtAnnee')
        .replace('{n}', nombreDecimal(anneeFermeeSeuleMedianeFenetre.n));
    }
    if (!anneeFermeeSeuleMedianeFenetre) {
      return t('ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtTrimestre')
        .replace('{n}', nombreDecimal(trimestreSeuleMedianeFenetre.n));
    }
    if (anneeFermeeSeuleMedianeFenetre.n < trimestreSeuleMedianeFenetre.n) {
      return t('ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtAnnee')
        .replace('{n}', nombreDecimal(anneeFermeeSeuleMedianeFenetre.n));
    }
    if (trimestreSeuleMedianeFenetre.n < anneeFermeeSeuleMedianeFenetre.n) {
      return t('ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtTrimestre')
        .replace('{n}', nombreDecimal(trimestreSeuleMedianeFenetre.n));
    }
    return t('ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtEgal')
      .replace('{n}', nombreDecimal(anneeFermeeSeuleMedianeFenetre.n));
  })();
  /* Les deux additions réunies : ce que l’année fermée nomme seule d’abord,
     puis ce que le trimestre en cours ajoute seul, chacun portant le nom de
     la fenêtre qui le tient. La liste se prend sur les deux jetons, si bien
     qu’aucun écran ne s’y perd ni ne s’y compte deux fois. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesAnneeFermeeSeuleListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleFenetreAnnee',
        ),
      });
    });
    ecransRepartisRetoursDatesTrimestreSeuleListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleFenetreTrimestre',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesAnneeFermeeSeuleListe,
    ecransRepartisRetoursDatesTrimestreSeuleListe,
    t,
  ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe.length,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesAnneeFermeeTrimestreSeuleEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  /* La part de chaque addition dans tout le carnet, lue sur les mêmes lignes
     que la liste et posée d’un même tenant : les deux additions se pèsent
     côte à côte, sans compter les lignes du dépli à la main. */
  const repartisRetoursDatesAnneeFermeeTrimestreSeulePartPhrase = (() => {
    const total = ecransRepartisListe.length;
    const part = (valeur: number) =>
      total > 0 ? String(Math.round((valeur / total) * 100)) : '0';
    const a = ecransRepartisRetoursDatesAnneeFermeeSeuleListe.length;
    const b = ecransRepartisRetoursDatesTrimestreSeuleListe.length;
    return t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleRepartis',
    )
      .replace('{a}', String(a))
      .replace('{pa}', part(a))
      .replace('{b}', String(b))
      .replace('{pb}', part(b))
      .replace(
        '{n}',
        String(ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe.length),
      )
      .replace(
        '{pn}',
        part(ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe.length),
      );
  })();
  /* Le jeton qui compare directement les deux milieux : des deux additions
     réunies, il ne garde que les écrans dont le délai dépasse le milieu du lot
     réuni. Le milieu se prend sur la même liste, si bien que le partage ne
     peut pas la contredire ; un lot vide ne se divise pas et le jeton se lève
     de lui-même. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe = useMemo(() => {
     const milieu = medianeDeLot(
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe,
    );
    if (!milieu) return [];
    return ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe
      .map((ligne) => ({
        ...ligne,
        jours: joursEntre(ligne.date, ligne.retour),
      }))
      .filter((ligne) => ligne.jours > milieu.n)
      .sort(
        (a, b) =>
          b.jours - a.jours ||
          a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' }),
      );
  }, [ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe.length,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  /* Les deux bouts du lot au-delà du milieu réuni — le plus rapide et le plus
     lent —, lus sur les mêmes lignes que le jeton : leurs deux délais se
     lisent côte à côte, comme sur les jetons de la quinzaine. Un lot vide ne
     nomme personne et le dit calmement. */
  const ecranDepassePlusRapide =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const ecranDepassePlusLent =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseBoutsPhrase =
    ecranDepassePlusRapide && ecranDepassePlusLent
      ? `${t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepassePlusRapide',
        )
          .replace('{ecran}', ecranDepassePlusRapide.ecran)
          .replace('{n}', String(ecranDepassePlusRapide.jours))
          .replace('{date}', jour(ecranDepassePlusRapide.date, lang))} ${t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepassePlusLent',
        )
          .replace('{ecran}', ecranDepassePlusLent.ecran)
          .replace('{n}', String(ecranDepassePlusLent.jours))
          .replace('{date}', jour(ecranDepassePlusLent.date, lang))}`
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseBoutsNone',
        );
  /* Ce que la fenêtre la plus proche retient du lot : parmi les écrans au-delà
     du milieu réuni, ceux dont le retour tombe dans la semaine en cours. La
     liste se prend sur celle du jeton, si bien qu’elle ne peut pas la
     contredire ; chaque ligne garde son délai, sa fenêtre et ses deux dates. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe =
    useMemo(
      () =>
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe.filter(
          (ligne) => estSemaineEnCours(ligne.retour),
        ),
      [ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe],
    );
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe.length,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  /* L’écran revenu le plus récemment du lot de la semaine, lu sur les mêmes
     lignes que le jeton : son jour se lit avant l’appui, comme sur les jetons
     de l’année fermée. Un lot vide ne nomme personne et le dit calmement. */
  const ecranDepasseSemainePlusRecent =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemainePlusRecentPhrase =
    ecranDepasseSemainePlusRecent
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemainePlusRecent',
        )
          .replace('{ecran}', ecranDepasseSemainePlusRecent.ecran)
          .replace('{date}', jour(ecranDepasseSemainePlusRecent.retour, lang))
          .replace(
            '{n}',
            String(
              joursEntre(
                ecranDepasseSemainePlusRecent.date,
                ecranDepasseSemainePlusRecent.retour,
              ),
            ),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemainePlusRecentNone',
        );
  /* Le jeton qui compare la semaine au lot réuni : les écrans du lot revenus
     cette semaine d’abord — ils portent le nom de la semaine —, puis le reste
     du lot, chacun gardant la fenêtre qui le nomme. La liste se prend sur les
     deux jetons qu’elle réunit, si bien qu’aucun écran n’y pèse deux fois. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisListe =
    useMemo(() => {
      const vus = new Set<string>();
      const lignes: {
        ecran: string;
        date: string;
        retour: string;
        fenetre: string;
        jours: number;
      }[] = [];
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe.forEach(
        (ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push({
            ...ligne,
            fenetre: t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisFenetreSemaine',
            ),
          });
        },
      );
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe.forEach(
        (ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push(ligne);
        },
      );
      return lignes;
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe,
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe,
      t,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisListe
        .length,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* Les deux milieux posés côte à côte — celui de la semaine et celui du lot
     réuni —, puis la phrase qui tranche : les deux chiffres se prennent sur
     les mêmes lignes que la liste, si bien qu’aucun ne peut la contredire. À
     égalité, elle dit que les deux se valent plutôt que d’en choisir un. */
  const semaineDepasseMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe,
  );
  const lotReuniDepasseMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianePhrase =
    (() => {
      if (!semaineDepasseMedianeFenetre && !lotReuniDepasseMedianeFenetre) {
        return t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeNone',
        );
      }
      if (!semaineDepasseMedianeFenetre) {
        return t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeSemaineVide',
        )
          .replace('{m}', nombreDecimal(lotReuniDepasseMedianeFenetre.n))
          .replace('{j}', String(lotReuniDepasseMedianeFenetre.k));
      }
      if (!lotReuniDepasseMedianeFenetre) {
        return t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMediane',
        )
          .replace('{n}', nombreDecimal(semaineDepasseMedianeFenetre.n))
          .replace('{k}', String(semaineDepasseMedianeFenetre.k))
          .replace('{m}', nombreDecimal(semaineDepasseMedianeFenetre.n))
          .replace('{j}', String(semaineDepasseMedianeFenetre.k));
      }
      if (semaineDepasseMedianeFenetre.n < lotReuniDepasseMedianeFenetre.n) {
        return t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMediane',
        )
          .replace('{n}', nombreDecimal(semaineDepasseMedianeFenetre.n))
          .replace('{k}', String(semaineDepasseMedianeFenetre.k))
          .replace('{m}', nombreDecimal(lotReuniDepasseMedianeFenetre.n))
          .replace('{j}', String(lotReuniDepasseMedianeFenetre.k));
      }
      if (lotReuniDepasseMedianeFenetre.n < semaineDepasseMedianeFenetre.n) {
        return t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeLot',
        )
          .replace('{n}', nombreDecimal(semaineDepasseMedianeFenetre.n))
          .replace('{k}', String(semaineDepasseMedianeFenetre.k))
          .replace('{m}', nombreDecimal(lotReuniDepasseMedianeFenetre.n))
          .replace('{j}', String(lotReuniDepasseMedianeFenetre.k));
      }
      return t(
        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeEgal',
      )
        .replace('{n}', nombreDecimal(semaineDepasseMedianeFenetre.n))
        .replace('{k}', String(semaineDepasseMedianeFenetre.k))
        .replace('{j}', String(lotReuniDepasseMedianeFenetre.k));
    })();
  /* L’écran le plus lent de la semaine, lu sur les mêmes lignes que les
     deux milieux : son délai et son jour de retour se lisent avant l’appui,
     comme les deux bouts des jetons de la quinzaine. Un lot vide ne nomme
     personne et le dit calmement. */
  const ecranSemaineDepassePlusLent =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisPlusLentPhrase =
    ecranSemaineDepassePlusLent
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisPlusLent',
        )
          .replace('{ecran}', ecranSemaineDepassePlusLent.ecran)
          .replace('{n}', String(ecranSemaineDepassePlusLent.jours))
          .replace(
            '{date}',
            jour(ecranSemaineDepassePlusLent.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisPlusLentNone',
        );
  /* Ce que la semaine ramène plus vite que le milieu du lot réuni : parmi les
     écrans du lot au-delà du milieu réuni revenus cette semaine, ceux dont le
     délai est plus court que ce milieu. La liste se prend sur celle du jeton
     de la semaine, si bien qu’elle ne peut pas la contredire ; le milieu de
     référence étant celui du lot réuni, les deux lectures s’accordent. Un lot
     vide ne garde rien et le jeton s’éteint de lui-même. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe =
    useMemo(() => {
      if (!lotReuniDepasseMedianeFenetre) return [];
      return ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe
        .filter((ligne) => ligne.jours < lotReuniDepasseMedianeFenetre.n)
        .sort(
          (a, b) =>
            a.jours - b.jours ||
            new Date(a.retour).getTime() - new Date(b.retour).getTime(),
        );
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe,
      lotReuniDepasseMedianeFenetre,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe
        .length,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  /* L’écran le plus rapide de la semaine, lu sur les mêmes lignes que le
     jeton de l’avance : son délai se lit avant l’appui, comme le plus lent du
     comparateur. Un lot vide ne nomme personne et le dit calmement. */
  const ecranSemaineRapidePlusRapide =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapidePlusRapidePhrase =
    ecranSemaineRapidePlusRapide
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapidePlusRapide',
        )
          .replace('{ecran}', ecranSemaineRapidePlusRapide.ecran)
          .replace('{n}', String(ecranSemaineRapidePlusRapide.jours))
          .replace(
            '{date}',
            jour(ecranSemaineRapidePlusRapide.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapidePlusRapideNone',
        );
  /* Le jeton qui réunit la semaine rapide et le reste du lot réuni : les
     écrans de la semaine revenus plus vite que le milieu d’abord — ils portent
     le nom de la semaine rapide —, puis ce que le lot réuni montre en plus,
     chacun gardant la fenêtre qui le nomme. La liste se prend sur les deux
     jetons qu’elle réunit, si bien qu’aucun écran n’y pèse deux fois. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisListe =
    useMemo(() => {
      const vus = new Set<string>();
      const lignes: {
        ecran: string;
        date: string;
        retour: string;
        fenetre: string;
        jours: number;
      }[] = [];
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe.forEach(
        (ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push({
            ...ligne,
            fenetre: t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisFenetreSemaineRapide',
            ),
          });
        },
      );
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisListe.forEach(
        (ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push(ligne);
        },
      );
      return lignes;
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe,
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisListe,
      t,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisEcartes =
    Math.max(
      0,
      ecransRepartisListe.length -
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisListe
          .length,
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* Le reste du lot réuni, une fois la semaine rapide lue : les écrans du lot
     que le jeton de l’avance ne nomme pas. La liste se prend sur les deux
     jetons qu’elle complète, si bien qu’aucun écran n’y pèse deux fois, et
     chacun garde la fenêtre qui le nomme. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe =
    useMemo(() => {
      const vus = new Set(
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe.map(
          (ligne) => ligne.ecran,
        ),
      );
      return ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisListe.filter(
        (ligne) => !vus.has(ligne.ecran),
      );
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe,
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisListe,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteEcartes =
    Math.max(
      0,
      ecransRepartisListe.length -
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe
          .length,
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* Les écrans du reste revenus avant le milieu du lot réuni : la liste se
     prend sur celle du reste, si bien qu’aucun jeton ne peut la contredire,
     et le milieu de référence est celui du lot réuni. Un lot vide ne rend
     rien, plutôt que d’inventer un partage. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe =
    useMemo(() => {
      if (!lotReuniDepasseMedianeFenetre) return [];
      return ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe
        .filter((ligne) => ligne.jours < lotReuniDepasseMedianeFenetre.n)
        .sort(
          (a, b) =>
            a.jours - b.jours ||
            new Date(a.retour).getTime() - new Date(b.retour).getTime(),
        );
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe,
      lotReuniDepasseMedianeFenetre,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEcartes =
    Math.max(
      0,
      ecransRepartisListe.length -
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe
          .length,
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* L’écran le plus rapide du reste, lu sur les mêmes lignes que le jeton du
     reste avant le milieu : son délai et son jour de retour se lisent avant
     l’appui. Le lot vide ne nomme personne et le dit calmement. */
  const ecranSemaineRapideReunisResteAvantMilieuPlusRapide =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe].sort(
      (a, b) =>
        a.jours - b.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuPlusRapidePhrase =
    ecranSemaineRapideReunisResteAvantMilieuPlusRapide
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuPlusRapide',
        )
          .replace(
            '{ecran}',
            ecranSemaineRapideReunisResteAvantMilieuPlusRapide.ecran,
          )
          .replace(
            '{n}',
            String(ecranSemaineRapideReunisResteAvantMilieuPlusRapide.jours),
          )
          .replace(
            '{date}',
            jour(
              ecranSemaineRapideReunisResteAvantMilieuPlusRapide.retour,
              lang,
            ),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuPlusRapideNone',
        );
  /* Les écrans du reste revenus après le milieu du lot réuni : le complément
     exact de ceux d’avant, pris sur la même liste du reste — un écran ne peut
     pas tomber des deux côtés, et aucun ne s’y perd. Un lot vide ne rend
     rien, plutôt que d’inventer un partage. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuListe =
    useMemo(() => {
      if (!lotReuniDepasseMedianeFenetre) return [];
      return ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe
        .filter((ligne) => ligne.jours >= lotReuniDepasseMedianeFenetre.n)
        .sort(
          (a, b) =>
            a.jours - b.jours ||
            new Date(a.retour).getTime() - new Date(b.retour).getTime(),
        );
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe,
      lotReuniDepasseMedianeFenetre,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuEcartes =
    Math.max(
      0,
      ecransRepartisListe.length -
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuListe
          .length,
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* L’écran le plus lent du reste après le milieu, lu sur les mêmes lignes que
     le jeton : son délai et son jour de retour se lisent avant l’appui. Un lot
     vide ne nomme personne et le dit calmement. */
  const ecranSemaineRapideReunisResteApresMilieuPlusLent =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuListe].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuPlusLentPhrase =
    ecranSemaineRapideReunisResteApresMilieuPlusLent
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuPlusLent',
        )
          .replace(
            '{ecran}',
            ecranSemaineRapideReunisResteApresMilieuPlusLent.ecran,
          )
          .replace(
            '{date}',
            jour(ecranSemaineRapideReunisResteApresMilieuPlusLent.retour, lang),
          )
          .replace(
            '{n}',
            String(ecranSemaineRapideReunisResteApresMilieuPlusLent.jours),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuPlusLentNone',
        );
  /* Les écrans du reste dont le délai tombe exactement sur le milieu du lot
     réuni : la part du milieu, celle qui ne devance ni ne dépasse. Elle se
     prend sur la liste du reste, si bien qu’aucun écran ne peut s’y perdre. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuListe =
    useMemo(() => {
      if (!lotReuniDepasseMedianeFenetre) return [];
      return ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe
        .filter((ligne) => ligne.jours === lotReuniDepasseMedianeFenetre.n)
        .sort((a, b) =>
          a.ecran.localeCompare(b.ecran, 'fr', { sensitivity: 'base' }),
        );
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe,
      lotReuniDepasseMedianeFenetre,
    ]);
  /* Les écrans du reste qui dépassent franchement le milieu — et non ceux qui
     l’atteignent : la part du milieu garde les siens, et aucun écran ne pèse
     dans deux parts du jeton réuni. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuStrictListe =
    useMemo(() => {
      if (!lotReuniDepasseMedianeFenetre) return [];
      return ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe
        .filter((ligne) => ligne.jours > lotReuniDepasseMedianeFenetre.n)
        .sort(
          (a, b) =>
            a.jours - b.jours ||
            new Date(a.retour).getTime() - new Date(b.retour).getTime(),
        );
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe,
      lotReuniDepasseMedianeFenetre,
    ]);
  /* Le jeton qui réunit les trois parts du reste : celles d’avant le milieu
     d’abord — elles portent le nom du reste avant le milieu —, puis celles
     qui tombent dessus, puis celles qui le dépassent, chacun gardant sa
     fenêtre, ses deux jours et son délai. La liste se prend sur les parts
     elles-mêmes, si bien qu’aucun écran n’y pèse deux fois. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisListe =
    useMemo(() => {
      const vus = new Set<string>();
      const lignes: {
        ecran: string;
        date: string;
        retour: string;
        fenetre: string;
        jours: number;
      }[] = [];
      const ajouter = (
        liste: {
          ecran: string;
          date: string;
          retour: string;
          fenetre: string;
          jours: number;
        }[],
        fenetre: string,
      ) => {
        liste.forEach((ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push({ ...ligne, fenetre });
        });
      };
      ajouter(
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe,
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisFenetreAvant',
        ),
      );
      ajouter(
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuListe,
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisFenetreMilieu',
        ),
      );
      ajouter(
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuStrictListe,
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisFenetreApres',
        ),
      );
      return lignes;
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe,
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuListe,
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuStrictListe,
      t,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisEcartes =
    Math.max(
      0,
      ecransRepartisListe.length -
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisListe
          .length,
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* Le milieu du lot réuni, posé entre les trois parts : ce qu’il vaut et ce
     que chacune retient. Les trois comptes se prennent sur les mêmes lignes
     que la liste réunie, si bien qu’aucune phrase ne peut la contredire. Un
     lot sans milieu le dit calmement plutôt que d’inventer un chiffre. */
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisMedianePhrase =
    lotReuniDepasseMedianeFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisMediane',
        )
          .replace(
            '{m}',
            nombreDecimal(lotReuniDepasseMedianeFenetre.n),
          )
          .replace(
            '{a}',
            String(
              ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe
                .length,
            ),
          )
          .replace(
            '{b}',
            String(
              ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuListe
                .length,
            ),
          )
          .replace(
            '{c}',
            String(
              ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuStrictListe
                .length,
            ),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisMedianeNone',
        );
  /* L’écran du reste revenu exactement au milieu du lot, lu sur la même liste
     que le jeton réuni : son jour se lit avant l’appui, sans compter les
     lignes du dépli. Un milieu vide ne nomme personne et le dit calmement. */
  const ecranResteMilieuSeulPlusRecent =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuListe].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisPlusRecentPhrase =
    ecranResteMilieuSeulPlusRecent
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisPlusRecent',
        )
          .replace('{ecran}', ecranResteMilieuSeulPlusRecent.ecran)
          .replace('{n}', String(ecranResteMilieuSeulPlusRecent.jours))
          .replace('{date}', jour(ecranResteMilieuSeulPlusRecent.retour, lang))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisPlusRecentNone',
        );
  /* Les écrans du reste revenus exactement au milieu, relus seuls : la liste
     se prend sur la part du milieu du jeton réuni, si bien qu’aucun écran ne
     peut s’y perdre ni y peser deux fois. Chacun garde sa fenêtre, ses deux
     jours et son délai. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe =
    useMemo(
      () =>
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuListe.map(
          (ligne) => ({
            ...ligne,
            fenetre: t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisFenetreMilieu',
            ),
          }),
        ),
      [
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuListe,
        t,
      ],
    );
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulEcartes =
    Math.max(
      0,
      ecransRepartisListe.length -
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
          .length,
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* L’écran du milieu exact qui a mis le plus de temps à y revenir, lu sur la
     même liste que le jeton : son délai se lit avant l’appui, sans compter les
     lignes du dépli. Un milieu vide ne nomme personne et le dit calmement. */
  const ecranResteMilieuSeulPlusLent =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPlusLentPhrase =
    ecranResteMilieuSeulPlusLent
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPlusLent',
        )
          .replace('{ecran}', ecranResteMilieuSeulPlusLent.ecran)
          .replace('{n}', String(ecranResteMilieuSeulPlusLent.jours))
          .replace('{date}', jour(ecranResteMilieuSeulPlusLent.retour, lang))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPlusLentNone',
        );
  /* Les écrans du milieu exact revenus hors du mois en cours, nommés à la
     suite du plus lent : la liste se prend sur les mêmes lignes que le jeton,
     chacun avec la date de son retour, si bien que la phrase ne peut pas le
     contredire. Un lot tout entier revenu dans le mois le dit calmement
     plutôt que de nommer personne. */
  const ecransMilieuSeulHorsMois =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe.filter(
      (ligne) => !estMoisEnCours(ligne.retour),
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPhrase =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
      .length === 0
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisNone',
        )
      : ecransMilieuSeulHorsMois.length === 0
        ? t(
            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisAucun',
          )
        : t(
            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPhrase',
          )
            .replace('{n}', String(ecransMilieuSeulHorsMois.length))
            .replace(
              '{total}',
              String(
                ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
                  .length,
              ),
            )
            .replace(
              '{detail}',
              ecransMilieuSeulHorsMois
                .map((ligne) => `${ligne.ecran} — ${jour(ligne.retour, lang)}`)
                .join(' · '),
            );
  /* Les écrans du milieu exact revenus hors de la semaine en cours, nommés
     juste après ceux restés hors du mois : la liste se prend sur les mêmes
     lignes que le jeton, chacun avec la date de son retour, si bien que la
     phrase ne peut pas le contredire. Un lot tout entier revenu dans la
     semaine le dit calmement plutôt que de nommer personne. */
  const ecransMilieuSeulHorsSemaine =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe.filter(
      (ligne) => !estSemaineEnCours(ligne.retour),
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemainePhrase =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
      .length === 0
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemaineNone',
        )
      : ecransMilieuSeulHorsSemaine.length === 0
        ? t(
            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemaineAucun',
          )
        : t(
            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemaine',
          )
            .replace('{n}', String(ecransMilieuSeulHorsSemaine.length))
            .replace(
              '{total}',
              String(
                ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
                  .length,
              ),
            )
            .replace(
              '{detail}',
              ecransMilieuSeulHorsSemaine
                .map((ligne) => `${ligne.ecran} — ${jour(ligne.retour, lang)}`)
                .join(' · '),
            );
  /* La période que le milieu exact couvre, lue sur la même liste que le jeton :
     son plus ancien retour, son plus récent, et les journées qui les séparent.
     Un lot vide ne couvre rien et le dit calmement plutôt que d'inventer une
     borne. */
  const plusAncienRetourMilieuSeul =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe].sort(
      (a, b) =>
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const plusRecentRetourMilieuSeul =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe].sort(
      (a, b) =>
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriodePhrase =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
      .length === 0 || !plusAncienRetourMilieuSeul || !plusRecentRetourMilieuSeul
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriodeNone',
        )
      : joursEntre(
            plusAncienRetourMilieuSeul.retour,
            plusRecentRetourMilieuSeul.retour,
          ) === 0
        ? t(
            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriodeUnJour',
          ).replace('{ancien}', jour(plusAncienRetourMilieuSeul.retour, lang))
        : t(
            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriode',
          )
            .replace(
              '{ancien}',
              jour(plusAncienRetourMilieuSeul.retour, lang),
            )
            .replace(
              '{recent}',
              jour(plusRecentRetourMilieuSeul.retour, lang),
            )
            .replace(
              '{n}',
              String(
                joursEntre(
                  plusAncienRetourMilieuSeul.retour,
                  plusRecentRetourMilieuSeul.retour,
                ),
              ),
            );
  /* Les deux parts du reste qui devancent le milieu ou tombent dessus, réunies
     sans l’après : celles d’avant d’abord — elles portent le nom du reste avant
     le milieu —, puis celles du milieu exact, chacune gardant sa fenêtre, ses
     deux jours et son délai. La liste se prend sur les parts elles-mêmes, si
     bien qu’aucun écran n’y pèse deux fois. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuListe =
    useMemo(() => {
      const vus = new Set<string>();
      const lignes: {
        ecran: string;
        date: string;
        retour: string;
        fenetre: string;
        jours: number;
      }[] = [];
      const ajouter = (
        liste: {
          ecran: string;
          date: string;
          retour: string;
          fenetre: string;
          jours: number;
        }[],
        fenetre: string,
      ) => {
        liste.forEach((ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push({ ...ligne, fenetre });
        });
      };
      ajouter(
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe,
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisFenetreAvant',
        ),
      );
      ajouter(
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuListe,
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisFenetreMilieu',
        ),
      );
      return lignes;
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe,
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuListe,
      t,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuEcartes =
    Math.max(
      0,
      ecransRepartisListe.length -
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuListe
          .length,
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* Le milieu commun des deux parts réunies — le reste avant le milieu et le
     milieu exact —, lu sur les mêmes lignes que la liste : il se place à côté
     de celui du lot réuni dans le survol, pour que le resserrement se juge
     d’un même regard. Un lot sans retour daté ne nomme aucun milieu. */
  const avantMilieuEtMilieuMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuListe,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuMedianePhrase =
    avantMilieuEtMilieuMedianeFenetre && lotReuniDepasseMedianeFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuMediane',
        )
          .replace('{n}', nombreDecimal(avantMilieuEtMilieuMedianeFenetre.n))
          .replace('{k}', String(avantMilieuEtMilieuMedianeFenetre.k))
          .replace('{l}', nombreDecimal(lotReuniDepasseMedianeFenetre.n))
          .replace('{m}', String(lotReuniDepasseMedianeFenetre.k))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuMedianeNone',
        );
  /* Le reste revenu avant le milieu, resserré sur la semaine en cours : une
     seule part du reste, lue sur les mêmes lignes que le jeton d’avant — si
     bien qu’aucun écran ne peut s’y perdre ni y entrer deux fois. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineListe =
    useMemo(
      () =>
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe
          .filter((ligne) => estSemaineEnCours(ligne.retour))
          .sort(
            (a, b) =>
              a.jours - b.jours ||
              new Date(a.retour).getTime() - new Date(b.retour).getTime(),
          ),
      [
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe,
      ],
    );
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEcartes =
    Math.max(
      0,
      ecransRepartisListe.length -
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineListe
          .length,
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* L’écran du reste revenu avant le milieu cette semaine qui a mis le plus
     de temps à revenir, lu sur les mêmes lignes que le jeton : son jour et son
     délai se lisent avant l’appui, sans compter les lignes du dépli. Un lot
     vide ne nomme personne et le dit calmement. */
  const ecranResteAvantMilieuSemainePlusLent =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineListe].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemainePlusLentPhrase =
    ecranResteAvantMilieuSemainePlusLent
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemainePlusLent',
        )
          .replace('{ecran}', ecranResteAvantMilieuSemainePlusLent.ecran)
          .replace('{n}', String(ecranResteAvantMilieuSemainePlusLent.jours))
          .replace(
            '{date}',
            jour(ecranResteAvantMilieuSemainePlusLent.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemainePlusLentNone',
        );
  /* Le jeton qui réunit le reste avant le milieu de la semaine et le milieu
     exact : la part d’avant lue à la fenêtre la plus proche d’abord — elle
     porte le nom du reste avant le milieu —, puis les écrans qui tombent pile
     sur le milieu du lot réuni, chacun gardant la fenêtre qui le nomme. Un
     écran déjà nommé n’y revient pas, et la liste se prend sur celles des deux
     jetons qu’il réunit. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuListe =
    useMemo(() => {
      const vus = new Set<string>();
      const lignes: {
        ecran: string;
        date: string;
        retour: string;
        fenetre: string;
        jours: number;
      }[] = [];
      const ajouter = (
        liste: {
          ecran: string;
          date: string;
          retour: string;
          fenetre: string;
          jours: number;
        }[],
        fenetre: string,
      ) => {
        liste.forEach((ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push({ ...ligne, fenetre });
        });
      };
      ajouter(
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineListe,
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisFenetreAvant',
        ),
      );
      ajouter(
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe,
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisFenetreMilieu',
        ),
      );
      return lignes;
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineListe,
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe,
      t,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuEcartes =
    Math.max(
      0,
      ecransRepartisListe.length -
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuListe
          .length,
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* Le milieu commun des deux parts réunies — le reste avant le milieu de la
     semaine et le milieu exact —, lu sur les mêmes lignes que la liste : il se
     lit à côté de celui du lot réuni dans le survol, pour que le
     resserrement se juge d’un même regard. Un lot sans retour daté ne nomme
     aucun milieu. */
  const semaineEtMilieuMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuListe,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuMedianePhrase =
    semaineEtMilieuMedianeFenetre && lotReuniDepasseMedianeFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuMediane',
        )
          .replace('{n}', nombreDecimal(semaineEtMilieuMedianeFenetre.n))
          .replace('{k}', String(semaineEtMilieuMedianeFenetre.k))
          .replace('{l}', nombreDecimal(lotReuniDepasseMedianeFenetre.n))
          .replace('{m}', String(lotReuniDepasseMedianeFenetre.k))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuMedianeNone',
        );
  /* Le milieu exact resserré sur la semaine en cours : une seule part du
     reste, lue sur les mêmes lignes que le jeton du milieu exact — si bien
     qu’aucun écran ne peut s’y perdre ni y entrer deux fois. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe =
    useMemo(
      () =>
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
          .filter((ligne) => estSemaineEnCours(ligne.retour))
          .sort(
            (a, b) =>
              a.jours - b.jours ||
              new Date(a.retour).getTime() - new Date(b.retour).getTime(),
          ),
      [
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe,
      ],
    );
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEcartes =
    Math.max(
      0,
      ecransRepartisListe.length -
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe
          .length,
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* L’écran du milieu exact revenu cette semaine qui a mis le plus de temps à
     revenir, lu sur les mêmes lignes que le jeton : son jour et son délai se
     lisent avant l’appui. Un lot vide ne nomme personne et le dit
     calmement. */
  const ecranMilieuSeulSemainePlusLent =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusLentPhrase =
    ecranMilieuSeulSemainePlusLent
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusLent',
        )
          .replace('{ecran}', ecranMilieuSeulSemainePlusLent.ecran)
          .replace('{n}', String(ecranMilieuSeulSemainePlusLent.jours))
          .replace(
            '{date}',
            jour(ecranMilieuSeulSemainePlusLent.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusLentNone',
        );
  /* L’écran du milieu exact revenu cette semaine dont le retour est le plus
     récent, lu sur les mêmes lignes que le jeton : sa date se lit avant
     l’appui. Un lot vide ne nomme personne et le dit calmement. */
  const ecranMilieuSeulSemainePlusRecent =
    [
      ...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe,
    ].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusRecentPhrase =
    ecranMilieuSeulSemainePlusRecent
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusRecent',
        )
          .replace('{ecran}', ecranMilieuSeulSemainePlusRecent.ecran)
          .replace(
            '{date}',
            jour(ecranMilieuSeulSemainePlusRecent.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusRecentNone',
        );
  /* Le jeton qui réunit le milieu exact de la semaine et le reste du milieu
     exact resté hors de la semaine : les écrans revenus cette semaine
     d’abord, puis ceux du même milieu dont le retour tombe hors de la
     semaine. La liste se prend sur celle du milieu exact, si bien qu’aucun
     écran ne s’y perd ni n’y pèse deux fois. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteListe =
    useMemo(() => {
      const vus = new Set<string>();
      const lignes: {
        ecran: string;
        date: string;
        retour: string;
        fenetre: string;
      }[] = [];
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe.forEach(
        (ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push({
            ...ligne,
            fenetre: t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteFenetreSemaine',
            ),
          });
        },
      );
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe.forEach(
        (ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push({
            ...ligne,
            fenetre: t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteFenetreReste',
            ),
          });
        },
      );
      return lignes;
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe,
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe,
      t,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(joursEntre(ligne.date, ligne.retour))),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteEcartes =
    Math.max(
      0,
      ecransRepartisListe.length -
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteListe
          .length,
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* Le milieu commun des deux parts réunies — la semaine et le reste hors
     semaine —, posé à côté de celui du milieu exact : les deux chiffres se
     prennent sur les mêmes lignes que la liste, si bien qu’aucun ne peut la
     contredire. */
  const milieuSeulSemaineEtResteMediane = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteListe,
  );
  const milieuSeulSemaineEtResteMilieu = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteMedianePhrase =
    milieuSeulSemaineEtResteMediane && milieuSeulSemaineEtResteMilieu
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteMediane',
        )
          .replace('{n}', nombreDecimal(milieuSeulSemaineEtResteMediane.n))
          .replace('{k}', String(milieuSeulSemaineEtResteMediane.k))
          .replace(
            '{l}',
            nombreDecimal(milieuSeulSemaineEtResteMilieu.n),
          )
          .replace('{m}', String(milieuSeulSemaineEtResteMilieu.k))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteMedianeNone',
        );
  /* Le milieu exact resserré sur le mois : les écrans du milieu exact dont le
     retour tombe ce mois-ci, lus sur la même liste que le jeton de la semaine
     — la même part, comparée d’une fenêtre à l’autre. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe.filter(
      (ligne) => estMoisEnCours(ligne.retour),
    );
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(joursEntre(ligne.date, ligne.retour))),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          Math.max(
            0,
            ecransRepartisListe.length -
              ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe
                .length,
          ),
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* La semaine et le mois, lus sur la même part : les deux comptes se prennent
     sur la liste du milieu exact, si bien qu’aucun des deux ne peut la
     contredire. Une part vide le dit calmement. */
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisSemaineMoisPhrase =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe.length === 0
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisSemaineMoisNone',
        )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisSemaineMois',
        )
          .replace(
            '{n}',
            String(
              ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe
                .length,
            ),
          )
          .replace(
            '{m}',
            String(
              ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe
                .length,
            ),
          )
          .replace(
            '{total}',
            String(
              ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
                .length,
            ),
          );
  /* L’écran du milieu exact revenu ce mois-ci dont le retour est le plus
     ancien — le premier revenu du mois —, lu sur les mêmes lignes que le
     jeton, si bien que sa date ne peut pas contredire la liste. Un mois sans
     écran du milieu ne nomme personne et le dit calmement. */
  const ecranMilieuSeulMoisPlusTot =
    [
      ...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe,
    ].sort(
      (a, b) => new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisPlusTotPhrase =
    ecranMilieuSeulMoisPlusTot
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisPlusTot',
        )
          .replace('{ecran}', ecranMilieuSeulMoisPlusTot.ecran)
          .replace('{date}', jour(ecranMilieuSeulMoisPlusTot.retour, lang))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisPlusTotNone',
        );
  /* Les écrans du milieu exact dont le retour tombe hors du mois en cours :
     la seconde part du jeton réuni, prise sur la même liste que la première —
     un écran ne peut pas tomber des deux côtés, et aucun ne s’y perd. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe.filter(
      (ligne) => !estMoisEnCours(ligne.retour),
    );
  /* Le jeton qui réunit le milieu exact du mois et le reste du milieu exact
     resté hors de la fenêtre : les écrans revenus ce mois-ci d’abord — ils
     portent le nom de la part du mois —, puis ceux du même milieu dont le
     retour tombe hors du mois. La liste se prend sur celle du milieu exact,
     si bien qu’aucun écran ne s’y perd ni n’y pèse deux fois. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe =
    useMemo(() => {
      const vus = new Set<string>();
      const lignes: {
        ecran: string;
        date: string;
        retour: string;
        fenetre: string;
      }[] = [];
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe.forEach(
        (ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push({
            ...ligne,
            fenetre: t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteFenetreMois',
            ),
          });
        },
      );
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe.forEach(
        (ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push({
            ...ligne,
            fenetre: t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteFenetreReste',
            ),
          });
        },
      );
      return lignes;
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe,
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe,
      t,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(joursEntre(ligne.date, ligne.retour))),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          Math.max(
            0,
            ecransRepartisListe.length -
              ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe
                .length,
          ),
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* Le milieu commun des deux parts réunies — le mois et le reste hors mois —,
     posé à côté de celui du milieu exact du mois : les deux chiffres se
     prennent sur les mêmes lignes que la liste, si bien qu’aucun ne peut la
     contredire. */
  const milieuSeulMoisEtResteMediane = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe,
  );
  const milieuSeulMoisEtResteMilieu = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe,
  );
  /* Le mot de la comparaison, posé entre les deux milieux : le survol du
     jeton réuni du mois dit d’un même regard où se tient le milieu commun par
     rapport à celui de la part du mois. Les deux chiffres se prennent sur les
     mêmes lignes, si bien que le mot ne peut pas les contredire. */
  const milieuSeulMoisEtResteSens =
    milieuSeulMoisEtResteMediane && milieuSeulMoisEtResteMilieu
      ? milieuSeulMoisEtResteMediane.n === milieuSeulMoisEtResteMilieu.n
        ? t(
            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianePareil',
          )
        : milieuSeulMoisEtResteMediane.n > milieuSeulMoisEtResteMilieu.n
          ? t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianePlus',
            )
          : t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianeMoins',
            )
      : '';
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianePhrase =
    milieuSeulMoisEtResteMediane && milieuSeulMoisEtResteMilieu
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMediane',
        )
          .replace('{n}', nombreDecimal(milieuSeulMoisEtResteMediane.n))
          .replace('{k}', String(milieuSeulMoisEtResteMediane.k))
          .replace('{l}', nombreDecimal(milieuSeulMoisEtResteMilieu.n))
          .replace('{m}', String(milieuSeulMoisEtResteMilieu.k))
          .replace('{sens}', milieuSeulMoisEtResteSens)
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianeNone',
        );
  /* Le jeton du milieu exact revenu hors du mois, relu seul à côté de la part
     du mois : ses écrans, sa part du milieu exact et son propre milieu se
     lisent d’un même regard — le complément exact de la part du mois, pris sur
     la même liste du milieu exact, si bien qu’aucun écran ne s’y perd ni n’y
     pèse deux fois. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(joursEntre(ligne.date, ligne.retour))),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          Math.max(
            0,
            ecransRepartisListe.length -
              ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe
                .length,
          ),
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  const milieuSeulHorsMoisMediane = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisMedianePhrase =
    milieuSeulHorsMoisMediane && milieuSeulMoisEtResteMilieu
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisMediane',
        )
          .replace('{n}', nombreDecimal(milieuSeulHorsMoisMediane.n))
          .replace('{k}', String(milieuSeulHorsMoisMediane.k))
          .replace('{l}', nombreDecimal(milieuSeulMoisEtResteMilieu.n))
          .replace('{m}', String(milieuSeulMoisEtResteMilieu.k))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisMedianeNone',
        );
  const ecranMilieuSeulHorsMoisPlusAncien =
    [
      ...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe,
    ].sort(
      (a, b) => new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPlusAncienPhrase =
    ecranMilieuSeulHorsMoisPlusAncien
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPlusAncien',
        )
          .replace('{ecran}', ecranMilieuSeulHorsMoisPlusAncien.ecran)
          .replace(
            '{date}',
            jour(ecranMilieuSeulHorsMoisPlusAncien.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPlusAncienNone',
        );
  /* Le jeton qui réunit le milieu exact revenu hors du mois et celui revenu
     cette semaine : la liste se prend sur celle du milieu exact, si bien
     qu’un écran tombé à la fois dans la semaine et hors du mois n’y pèse
     qu’une fois et porte les deux fenêtres dans son libellé. Les trois
     fenêtres — la semaine, le mois et son dehors — se lisent ensemble. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineListe =
    useMemo(() => {
      const fenetreSemaine = t(
        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineFenetreSemaine',
      );
      const fenetreHorsMois = t(
        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineFenetreHorsMois',
      );
      const vus = new Set<string>();
      const lignes: {
        ecran: string;
        date: string;
        retour: string;
        fenetre: string;
      }[] = [];
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe.forEach(
        (ligne) => {
          const dansSemaine = estSemaineEnCours(ligne.retour);
          const horsMois = !estMoisEnCours(ligne.retour);
          if (!dansSemaine && !horsMois) return;
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          const fenetre =
            dansSemaine && horsMois
              ? `${fenetreHorsMois} · ${fenetreSemaine}`
              : dansSemaine
                ? fenetreSemaine
                : fenetreHorsMois;
          lignes.push({ ...ligne, fenetre });
        },
      );
      return lignes;
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe,
      t,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(joursEntre(ligne.date, ligne.retour))),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          Math.max(
            0,
            ecransRepartisListe.length -
              ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineListe
                .length,
          ),
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* Les deux parts réunies, chacune avec son compte et son propre milieu,
     lues sur la même liste que le jeton : la semaine d’un côté, le dehors du
     mois de l’autre. Le milieu du mois reste celui du jeton du mois, si bien
     que les trois fenêtres se comparent sans qu’aucun chiffre ne bouge. */
  const milieuSeulHorsMoisSemaineSemaine = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe,
  );
  const milieuSeulHorsMoisSemaineMediane = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineListe,
  );
  const texteMilieuDePartHorsMoisSemaine = (
    lot: { n: number; k: number } | null,
  ) =>
    lot
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePartMediane',
        )
          .replace('{n}', nombreDecimal(lot.n))
          .replace('{k}', String(lot.k))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePartMedianeNone',
        );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePartsPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineParts',
    )
      .replace(
        '{a}',
        String(
          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe
            .length,
        ),
      )
      .replace('{b}', texteMilieuDePartHorsMoisSemaine(milieuSeulHorsMoisSemaineSemaine))
      .replace(
        '{c}',
        String(
          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe
            .length,
        ),
      )
      .replace('{d}', texteMilieuDePartHorsMoisSemaine(milieuSeulHorsMoisMediane));
  /* Le mot de la comparaison, posé entre le milieu commun et celui du mois :
     le survol du jeton dit d’un même regard où se tient le milieu des deux
     parts réunies par rapport à celui de la part du mois. */
  const milieuSeulHorsMoisSemaineSens =
    milieuSeulHorsMoisSemaineMediane && milieuSeulMoisEtResteMilieu
      ? milieuSeulHorsMoisSemaineMediane.n === milieuSeulMoisEtResteMilieu.n
        ? t(
            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianePareil',
          )
        : milieuSeulHorsMoisSemaineMediane.n > milieuSeulMoisEtResteMilieu.n
          ? t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianePlus',
            )
          : t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianeMoins',
            )
      : '';
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianePhrase =
    milieuSeulHorsMoisSemaineMediane && milieuSeulMoisEtResteMilieu
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMediane',
        )
          .replace('{n}', nombreDecimal(milieuSeulHorsMoisSemaineMediane.n))
          .replace('{k}', String(milieuSeulHorsMoisSemaineMediane.k))
          .replace('{l}', nombreDecimal(milieuSeulMoisEtResteMilieu.n))
          .replace('{m}', String(milieuSeulMoisEtResteMilieu.k))
          .replace('{sens}', milieuSeulHorsMoisSemaineSens)
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianeNone',
        );
  /* Le retour le plus lent des deux parts réunies — la semaine d’un côté, le
     dehors du mois de l’autre —, lu sur les mêmes lignes que le jeton : son
     écran, son jour et son délai se lisent avant l’appui, sans compter les
     lignes du dépli. Un lot vide ne nomme personne et le dit calmement. */
  const ecranHorsMoisSemainePlusLent =
    [
      ...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineListe,
    ]
      .map((ligne) => ({
        ...ligne,
        jours: joursEntre(ligne.date, ligne.retour),
      }))
      .sort(
        (a, b) =>
          b.jours - a.jours ||
          new Date(b.retour).getTime() - new Date(a.retour).getTime(),
      )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusLentPhrase =
    ecranHorsMoisSemainePlusLent
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusLent',
        )
          .replace('{ecran}', ecranHorsMoisSemainePlusLent.ecran)
          .replace('{date}', jour(ecranHorsMoisSemainePlusLent.retour, lang))
          .replace('{n}', String(ecranHorsMoisSemainePlusLent.jours))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusLentNone',
        );
  /* Le retour le plus rapide des deux parts réunies — la semaine d’un côté,
     le dehors du mois de l’autre —, lu sur les mêmes lignes que le jeton : son
     écran, son jour et son délai se lisent juste avant le plus lent, pour que
     les deux bouts du lot se comparent avant l’appui. Un lot vide ne nomme
     personne et le dit calmement. */
  const ecranHorsMoisSemainePlusRapide =
    [
      ...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineListe,
    ]
      .map((ligne) => ({
        ...ligne,
        jours: joursEntre(ligne.date, ligne.retour),
      }))
      .sort(
        (a, b) =>
          a.jours - b.jours ||
          new Date(a.retour).getTime() - new Date(b.retour).getTime(),
      )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusRapidePhrase =
    ecranHorsMoisSemainePlusRapide
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusRapide',
        )
          .replace('{ecran}', ecranHorsMoisSemainePlusRapide.ecran)
          .replace('{date}', jour(ecranHorsMoisSemainePlusRapide.retour, lang))
          .replace('{n}', String(ecranHorsMoisSemainePlusRapide.jours))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusRapideNone',
        );
  /* L’écran du milieu exact revenu le plus récemment parmi ceux restés hors
     du mois, lu sur les mêmes lignes que le jeton réuni : la part hors mois
     se reconnaît à la fenêtre que chaque ligne porte. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteHorsMoisListe =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe.filter(
      (ligne) =>
        ligne.fenetre ===
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteFenetreReste',
        ),
    );
  const milieuSeulMoisEtRestePlusRecent =
    [
      ...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteHorsMoisListe,
    ].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentPhrase =
    milieuSeulMoisEtRestePlusRecent
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecent',
        )
          .replace('{ecran}', milieuSeulMoisEtRestePlusRecent.ecran)
          .replace(
            '{date}',
            jour(milieuSeulMoisEtRestePlusRecent.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentNone',
        );
  /* L’écran du milieu exact revenu le plus récemment parmi ceux de la part du
     mois — l’autre côté du même jeton —, lu sur les mêmes lignes que lui : la
     part du mois se reconnaît à la fenêtre que chaque ligne porte. Les deux
     côtés se nomment donc côte à côte, celui du mois puis celui du dehors. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMoisListe =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe.filter(
      (ligne) =>
        ligne.fenetre ===
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteFenetreMois',
        ),
    );
  const milieuSeulMoisEtRestePlusRecentMois =
    [
      ...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMoisListe,
    ].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentMoisPhrase =
    milieuSeulMoisEtRestePlusRecentMois
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentMois',
        )
          .replace('{ecran}', milieuSeulMoisEtRestePlusRecentMois.ecran)
          .replace(
            '{date}',
            jour(milieuSeulMoisEtRestePlusRecentMois.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentMoisNone',
        );
  /* Les écrans que les deux côtés du jeton se partagent : revenus cette
     semaine et restés hors du mois. Ils portent la part de la semaine et
     celle du dehors à la fois, sans peser deux fois dans la liste — le
     chiffre se prend sur les mêmes lignes que les deux parts. */
  const ecransMoisEtResteDesDeuxCotes =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe.filter(
      (ligne) => !estMoisEnCours(ligne.retour),
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesPhrase =
    ecransMoisEtResteDesDeuxCotes.length > 0
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotes',
        )
          .replace('{n}', String(ecransMoisEtResteDesDeuxCotes.length))
          .replace(
            '{k}',
            String(
              ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe
                .length,
            ),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesNone',
        );
  /* Les écrans du jeton qui ne portent qu’une seule part : le complément
     exact du recoupement des deux côtés, pris sur la même liste — un écran
     ne peut pas y tomber deux fois, et aucun ne s’y perd. Leurs noms se
     lisent un à un, pour que le survol dise lesquels, et pas seulement
     combien. Un jeton vide ou tout entier des deux côtés le dit calmement. */
  const ecransMoisEtResteUneSeulePart =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe.filter(
      (ligne) => !ecransMoisEtResteDesDeuxCotes.some((item) => item.ecran === ligne.ecran),
    );
  const ecransMoisEtResteUneSeulePartDetail = ecransMoisEtResteUneSeulePart
    .map((ligne) => ligne.ecran)
    .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartPhrase =
    ecransMoisEtResteUneSeulePart.length > 0
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePart',
        )
          .replace('{n}', String(ecransMoisEtResteUneSeulePart.length))
          .replace(
            '{k}',
            String(
              ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe
                .length,
            ),
          )
          .replace('{detail}', ecransMoisEtResteUneSeulePartDetail)
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartNone',
        );
  /* L'écran qui porte une seule part depuis le plus longtemps, lu sur les
     mêmes lignes que le jeton : son retour le plus ancien ouvre la marche, et
     les journées écoulées depuis se comptent sur ce jour-là. Un jeton dont
     chaque écran porte les deux parts ne nomme personne, et le dit. */
  const ecranUneSeulePartPlusAncien =
    [...ecransMoisEtResteUneSeulePart].sort(
      (a, b) => new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartPlusAncienPhrase =
    ecranUneSeulePartPlusAncien
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartPlusAncien',
        )
          .replace('{ecran}', ecranUneSeulePartPlusAncien.ecran)
          .replace(
            '{date}',
            jour(ecranUneSeulePartPlusAncien.retour, lang),
          )
          .replace(
            '{n}',
            String(
              joursEntre(
                ecranUneSeulePartPlusAncien.retour,
                new Date().toISOString(),
              ),
            ),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartPlusAncienNone',
        );
  /* Le délai moyen entre les deux parts réunies, lu sur les mêmes écrans que
     le jeton : leurs deux bouts — le plus court et le plus long — se lisent
     côte à côte, si bien que la moyenne ne peut pas les contredire. Un lot
     sans recoupement ne se divise pas, et le dit calmement. */
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesDelaiPhrase =
    (() => {
      if (ecransMoisEtResteDesDeuxCotes.length === 0) {
        return t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesDelaiNone',
        );
      }
      const delais = ecransMoisEtResteDesDeuxCotes.map((ligne) => ({
        ...ligne,
        jours: joursEntre(ligne.date, ligne.retour),
      }));
      const somme = delais.reduce((total, ligne) => total + ligne.jours, 0);
      const plusCourt = [...delais].sort(
        (a, b) =>
          a.jours - b.jours ||
          new Date(a.retour).getTime() - new Date(b.retour).getTime(),
      )[0];
      const plusLong = [...delais].sort(
        (a, b) =>
          b.jours - a.jours ||
          new Date(b.retour).getTime() - new Date(a.retour).getTime(),
      )[0];
      return t(
        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesDelai',
      )
        .replace('{n}', nombreDecimal(somme / delais.length))
        .replace('{k}', String(delais.length))
        .replace('{court}', plusCourt.ecran)
        .replace('{jc}', String(plusCourt.jours))
        .replace('{long}', plusLong.ecran)
        .replace('{jl}', String(plusLong.jours));
    })();
  /* L’écran du milieu exact revenu le plus anciennement parmi ceux restés hors
     de la semaine, lu sur les mêmes lignes que le jeton réuni : la part hors
     semaine se reconnaît à la fenêtre que chaque ligne porte. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteHorsSemaineListe =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteListe.filter(
      (ligne) =>
        ligne.fenetre ===
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteFenetreReste',
        ),
    );
  const milieuSeulSemaineEtRestePlusAncien =
    [
      ...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteHorsSemaineListe,
    ].sort(
      (a, b) => new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtRestePlusAncienPhrase =
    milieuSeulSemaineEtRestePlusAncien
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtRestePlusAncien',
        )
          .replace('{ecran}', milieuSeulSemaineEtRestePlusAncien.ecran)
          .replace(
            '{date}',
            jour(milieuSeulSemaineEtRestePlusAncien.retour, lang),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtRestePlusAncienNone',
        );
  /* Les deux milieux du lot réuni — celui de la semaine rapide et celui du
     reste —, posés côte à côte dans le survol du jeton qui les tient tous les
     deux. Ils se prennent sur les mêmes lignes que la liste, si bien qu’aucun
     des deux ne peut la contredire ; un lot vide ne nomme rien et le dit. */
  const semaineRapideReunisMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe,
  );
  const resteReunisMedianeFenetre = medianeDeLot(
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe,
  );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisMedianePhrase =
    semaineRapideReunisMedianeFenetre && resteReunisMedianeFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisMediane',
        )
          .replace(
            '{n}',
            nombreDecimal(semaineRapideReunisMedianeFenetre.n),
          )
          .replace('{k}', String(semaineRapideReunisMedianeFenetre.k))
          .replace('{m}', nombreDecimal(resteReunisMedianeFenetre.n))
          .replace('{j}', String(resteReunisMedianeFenetre.k))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisMedianeNone',
        );
  /* Le reste avant le milieu et le reste après réunis : les écrans revenus
     plus vite que le milieu d’abord — ils portent le nom du reste avant le
     milieu —, puis ceux qui le dépassent, chacun gardant la fenêtre qui le
     nomme. La liste se prend sur les deux jetons qu’elle réunit, si bien
     qu’aucun écran n’y pèse deux fois et qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisListe =
    useMemo(() => {
      const vus = new Set<string>();
      const lignes: {
        ecran: string;
        date: string;
        retour: string;
        fenetre: string;
        jours: number;
      }[] = [];
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe.forEach(
        (ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push({
            ...ligne,
            fenetre: t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisFenetreAvant',
            ),
          });
        },
      );
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuListe.forEach(
        (ligne) => {
          if (vus.has(ligne.ecran)) return;
          vus.add(ligne.ecran);
          lignes.push({
            ...ligne,
            fenetre: t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisFenetreApres',
            ),
          });
        },
      );
      return lignes;
    }, [
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe,
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuListe,
      t,
    ]);
  const ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisDetail =
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang))
          .replace('{jours}', String(ligne.jours)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisEcartes =
    Math.max(
      0,
      ecransRepartisListe.length -
        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisListe
          .length,
    );
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisEcartesPhrase =
    t(
      'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes',
    )
      .replace(
        '{n}',
        String(
          repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisEcartes,
        ),
      )
      .replace('{total}', String(ecransRepartisListe.length));
  /* L’écran revenu le plus anciennement du lot, lu sur les mêmes lignes que le
     jeton du reste : son jour et son délai se lisent avant l’appui, comme sur
     les jetons de l’année fermée. Un lot vide ne nomme personne et le dit
     calmement. */
  const ecranSemaineRapideReunisRestePlusAncien =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe].sort(
      (a, b) => new Date(a.retour).getTime() - new Date(b.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusAncienPhrase =
    ecranSemaineRapideReunisRestePlusAncien
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusAncien',
        )
          .replace('{ecran}', ecranSemaineRapideReunisRestePlusAncien.ecran)
          .replace(
            '{date}',
            jour(ecranSemaineRapideReunisRestePlusAncien.retour, lang),
          )
          .replace(
            '{n}',
            String(
              joursEntre(
                ecranSemaineRapideReunisRestePlusAncien.date,
                ecranSemaineRapideReunisRestePlusAncien.retour,
              ),
            ),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusAncienNone',
        );
  /* L’écran le plus lent du reste, lu sur les mêmes lignes que le jeton : son
     délai et son jour de retour se lisent avant l’appui, pour que le
     resserrement se juge d’un même regard. Un lot vide ne nomme personne et
     le dit calmement. */
  const ecranSemaineRapideReunisRestePlusLent =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe].sort(
      (a, b) =>
        b.jours - a.jours ||
        new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusLentPhrase =
    ecranSemaineRapideReunisRestePlusLent
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusLent',
        )
          .replace('{ecran}', ecranSemaineRapideReunisRestePlusLent.ecran)
          .replace(
            '{date}',
            jour(ecranSemaineRapideReunisRestePlusLent.retour, lang),
          )
          .replace('{n}', String(ecranSemaineRapideReunisRestePlusLent.jours))
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusLentNone',
        );
  /* L’écran revenu le plus récemment du lot réuni, lu sur les mêmes lignes que
     le jeton : son jour et son délai se lisent avant l’appui, comme sur les
     jetons de l’année fermée. Un lot vide ne nomme personne et le dit
     calmement. */
  const ecranSemaineRapideReunisPlusRecent =
    [...ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisListe].sort(
      (a, b) => new Date(b.retour).getTime() - new Date(a.retour).getTime(),
    )[0] ?? null;
  const repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisPlusRecentPhrase =
    ecranSemaineRapideReunisPlusRecent
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisPlusRecent',
        )
          .replace('{ecran}', ecranSemaineRapideReunisPlusRecent.ecran)
          .replace(
            '{date}',
            jour(ecranSemaineRapideReunisPlusRecent.retour, lang),
          )
          .replace(
            '{n}',
            String(
              joursEntre(
                ecranSemaineRapideReunisPlusRecent.date,
                ecranSemaineRapideReunisPlusRecent.retour,
              ),
            ),
          )
      : t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisPlusRecentNone',
        );
  /* Le jeton qui compare le trimestre fermé et l’année fermée : le trimestre
     d’abord, puis le reste de l’année, chacun portant le nom de sa fenêtre. Le
     trimestre fermé étant déjà contenu dans l’année fermée, un écran déjà
     nommé n’y revient pas — la liste se prend sur les deux jetons, si bien
     qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesTrimestreFermeAnneeFermeListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesTrimestreFermeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeFenetreTrimestre',
        ),
      });
    });
    ecransRepartisRetoursDatesAnneeFermeeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeFenetreAnnee',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesTrimestreFermeListe,
    ecransRepartisRetoursDatesAnneeFermeeListe,
    t,
  ]);
  const ecransRepartisRetoursDatesTrimestreFermeAnneeFermeDetail =
    ecransRepartisRetoursDatesTrimestreFermeAnneeFermeListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesTrimestreFermeAnneeFermeEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesTrimestreFermeAnneeFermeListe.length,
  );
  const repartisRetoursDatesTrimestreFermeAnneeFermeEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeEcartes',
  )
    .replace('{n}', String(repartisRetoursDatesTrimestreFermeAnneeFermeEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesTrimestreFermeAnneeFermePartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesTrimestreFermeListe.length))
    .replace('{b}', String(ecransRepartisRetoursDatesAnneeFermeeListe.length))
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesTrimestreFermeAnneeFermeListe.length),
    );
  /* Le délai le plus court de chaque fenêtre du jeton « avant-dernier mois et
     trimestre fermé » — l’avant-dernier mois d’un côté, le trimestre fermé de
     l’autre —, lu sur les mêmes lignes que lui : les deux se lisent côte à
     côte, chacun avec son jour. Une fenêtre vide garde sa phrase à elle, et
     deux fenêtres vides le disent calmement. */
  const repartisRetoursDatesAvantDernierMoisTrimestreFermeCourtPhrase =
    !avantDernierMoisPlusCourtFenetre && !trimestreFermePlusCourtFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtNone',
        )
      : [
          avantDernierMoisPlusCourtFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtAvantDernier',
              )
                .replace('{ecran}', avantDernierMoisPlusCourtFenetre.ecran)
                .replace('{n}', String(avantDernierMoisPlusCourtFenetre.jours))
                .replace(
                  '{date}',
                  jour(avantDernierMoisPlusCourtFenetre.retour, lang),
                )
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtAvantDernierNone',
              ),
          trimestreFermePlusCourtFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtTrimestre',
              )
                .replace('{ecran}', trimestreFermePlusCourtFenetre.ecran)
                .replace('{n}', String(trimestreFermePlusCourtFenetre.jours))
                .replace(
                  '{date}',
                  jour(trimestreFermePlusCourtFenetre.retour, lang),
                )
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtTrimestreNone',
              ),
        ].join(' ');
  /* Le jeton qui compare l’avant-dernier mois et le trimestre fermé :
     l’avant-dernier mois d’abord, puis le reste du trimestre, chacun portant
     le nom de sa fenêtre. L’avant-dernier mois étant déjà contenu dans le
     trimestre fermé, un écran déjà nommé n’y revient pas — la liste se prend
     sur les deux jetons, si bien qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesAvantDernierMoisTrimestreFermeListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesAvantDernierMoisListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeFenetreAvantDernier',
        ),
      });
    });
    ecransRepartisRetoursDatesTrimestreFermeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeFenetreTrimestre',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesAvantDernierMoisListe,
    ecransRepartisRetoursDatesTrimestreFermeListe,
    t,
  ]);
  const ecransRepartisRetoursDatesAvantDernierMoisTrimestreFermeDetail =
    ecransRepartisRetoursDatesAvantDernierMoisTrimestreFermeListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAvantDernierMoisTrimestreFermeEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAvantDernierMoisTrimestreFermeListe.length,
  );
  const repartisRetoursDatesAvantDernierMoisTrimestreFermeEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesAvantDernierMoisTrimestreFermeEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesAvantDernierMoisTrimestreFermePartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesAvantDernierMoisListe.length))
    .replace(
      '{b}',
      String(ecransRepartisRetoursDatesTrimestreFermeListe.length),
    )
    .replace(
      '{n}',
      String(
        ecransRepartisRetoursDatesAvantDernierMoisTrimestreFermeListe.length,
      ),
    );
  /* Le jeton qui compare l’année fermée et le mois dernier : le mois dernier
     d’abord, puis le reste de l’année, chacun portant le nom de sa fenêtre. Le
     mois dernier étant déjà contenu dans l’année fermée, un écran déjà nommé
     n’y revient pas — la liste se prend sur les deux jetons, si bien qu’aucun
     ne peut la contredire. */
  const ecransRepartisRetoursDatesAnneeFermeeMoisDernierListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesMoisDernierListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierFenetreMoisDernier',
        ),
      });
    });
    ecransRepartisRetoursDatesAnneeFermeeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierFenetreAnnee',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesMoisDernierListe,
    ecransRepartisRetoursDatesAnneeFermeeListe,
    t,
  ]);
  const ecransRepartisRetoursDatesAnneeFermeeMoisDernierDetail =
    ecransRepartisRetoursDatesAnneeFermeeMoisDernierListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeMoisDernierEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAnneeFermeeMoisDernierListe.length,
  );
  const repartisRetoursDatesAnneeFermeeMoisDernierEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesAnneeFermeeMoisDernierEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesAnneeFermeeMoisDernierPartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesMoisDernierListe.length))
    .replace(
      '{b}',
      String(ecransRepartisRetoursDatesAnneeFermeeListe.length),
    )
    .replace(
      '{n}',
      String(ecransRepartisRetoursDatesAnneeFermeeMoisDernierListe.length),
    );
  /* La fenêtre qui revient le plus vite, nommée à côté de ses deux délais :
     le mois dernier et l’année fermée se comparent sur leurs propres lignes,
     chaque délai pris sur le retour le plus récent du même écran. Une fenêtre
     vide garde sa phrase à elle, et deux fenêtres vides le disent
     calmement. */
  const repartisRetoursDatesAnneeFermeeMoisDernierCourtPhrase = (() => {
    const mois = moisDernierPlusCourtFenetre;
    const annee = anneeFermeePlusCourtFenetre;
    if (!mois && !annee) {
      return t(
        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtNone',
      );
    }
    if (!mois && annee) {
      return t(
        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtOne',
      )
        .replace(
          '{fenetre}',
          t(
            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierFenetreAnnee',
          ),
        )
        .replace('{n}', String(annee.jours));
    }
    if (mois && !annee) {
      return t(
        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtOne',
      )
        .replace(
          '{fenetre}',
          t(
            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierFenetreMoisDernier',
          ),
        )
        .replace('{n}', String(mois.jours));
    }
    if (!mois || !annee) return '';
    if (mois.jours === annee.jours) {
      return t(
        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtTie',
      )
        .replace('{a}', String(mois.jours))
        .replace('{b}', String(annee.jours));
    }
    return t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourt')
      .replace(
        '{fenetre}',
        mois.jours < annee.jours
          ? t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierFenetreMoisDernier',
            )
          : t(
              'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierFenetreAnnee',
            ),
      )
      .replace('{a}', String(mois.jours))
      .replace('{b}', String(annee.jours));
  })();
  /* Le jeton qui compare l’année fermée et l’avant-dernier mois :
     l’avant-dernier mois d’abord, puis le reste de l’année, chacun portant le
     nom de sa fenêtre. L’avant-dernier mois étant déjà contenu dans l’année
     fermée, un écran déjà nommé n’y revient pas — la liste se prend sur les
     deux jetons, si bien qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesAnneeFermeeAvantDernierMoisListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesAvantDernierMoisListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisFenetreAvantDernier',
        ),
      });
    });
    ecransRepartisRetoursDatesAnneeFermeeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisFenetreAnnee',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesAvantDernierMoisListe,
    ecransRepartisRetoursDatesAnneeFermeeListe,
    t,
  ]);
  const ecransRepartisRetoursDatesAnneeFermeeAvantDernierMoisDetail =
    ecransRepartisRetoursDatesAnneeFermeeAvantDernierMoisListe
      .map((ligne) =>
        t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisItem')
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesAnneeFermeeAvantDernierMoisEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesAnneeFermeeAvantDernierMoisListe.length,
  );
  const repartisRetoursDatesAnneeFermeeAvantDernierMoisEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesAnneeFermeeAvantDernierMoisEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesAnneeFermeeAvantDernierMoisPartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisRepartis',
  )
    .replace(
      '{a}',
      String(ecransRepartisRetoursDatesAvantDernierMoisListe.length),
    )
    .replace(
      '{b}',
      String(ecransRepartisRetoursDatesAnneeFermeeListe.length),
    )
    .replace(
      '{n}',
      String(
        ecransRepartisRetoursDatesAnneeFermeeAvantDernierMoisListe.length,
      ),
    );
  /* Le délai le plus court de chaque fenêtre du jeton « année fermée et
     avant-dernier mois » — l’avant-dernier mois d’un côté, l’année fermée de
     l’autre —, lu sur les mêmes lignes que lui : les deux se lisent côte à
     côte, chacun avec son jour. Une fenêtre vide garde sa phrase à elle, et
     deux fenêtres vides le disent calmement. */
  const repartisRetoursDatesAnneeFermeeAvantDernierMoisCourtPhrase =
    !avantDernierMoisPlusCourtFenetre && !anneeFermeePlusCourtFenetre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtNone',
        )
      : [
          avantDernierMoisPlusCourtFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAvantDernier',
              )
                .replace('{ecran}', avantDernierMoisPlusCourtFenetre.ecran)
                .replace('{n}', String(avantDernierMoisPlusCourtFenetre.jours))
                .replace(
                  '{date}',
                  jour(avantDernierMoisPlusCourtFenetre.retour, lang),
                )
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAvantDernierNone',
              ),
          anneeFermeePlusCourtFenetre
            ? t(
                'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAnnee',
              )
                .replace('{ecran}', anneeFermeePlusCourtFenetre.ecran)
                .replace('{n}', String(anneeFermeePlusCourtFenetre.jours))
                .replace(
                  '{date}',
                  jour(anneeFermeePlusCourtFenetre.retour, lang),
                )
            : t(
                'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAnneeNone',
              ),
        ].join(' ');
  /* Le jeton qui compare le trimestre fermé et l’avant-dernier mois : le
     trimestre fermé d’abord, puis l’avant-dernier mois, chacun portant le nom
     de sa fenêtre. L’avant-dernier mois étant déjà contenu dans le trimestre
     fermé, un écran déjà nommé n’y revient pas — la liste se prend sur les
     deux jetons, si bien qu’aucun ne peut la contredire. */
  const ecransRepartisRetoursDatesTrimestreFermeAvantDernierMoisListe = useMemo(() => {
    const vus = new Set<string>();
    const lignes: {
      ecran: string;
      date: string;
      retour: string;
      fenetre: string;
    }[] = [];
    ecransRepartisRetoursDatesTrimestreFermeListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisFenetreTrimestre',
        ),
      });
    });
    ecransRepartisRetoursDatesAvantDernierMoisListe.forEach((ligne) => {
      if (vus.has(ligne.ecran)) return;
      vus.add(ligne.ecran);
      lignes.push({
        ...ligne,
        fenetre: t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisFenetreAvantDernier',
        ),
      });
    });
    return lignes;
  }, [
    ecransRepartisRetoursDatesTrimestreFermeListe,
    ecransRepartisRetoursDatesAvantDernierMoisListe,
    t,
  ]);
  const ecransRepartisRetoursDatesTrimestreFermeAvantDernierMoisDetail =
    ecransRepartisRetoursDatesTrimestreFermeAvantDernierMoisListe
      .map((ligne) =>
        t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisItem',
        )
          .replace('{ecran}', ligne.ecran)
          .replace('{fenetre}', ligne.fenetre)
          .replace('{date}', jour(ligne.date, lang))
          .replace('{retour}', jour(ligne.retour, lang)),
      )
      .join(' · ');
  const repartisRetoursDatesTrimestreFermeAvantDernierMoisEcartes = Math.max(
    0,
    ecransRepartisListe.length -
      ecransRepartisRetoursDatesTrimestreFermeAvantDernierMoisListe.length,
  );
  const repartisRetoursDatesTrimestreFermeAvantDernierMoisEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisEcartes',
  )
    .replace(
      '{n}',
      String(repartisRetoursDatesTrimestreFermeAvantDernierMoisEcartes),
    )
    .replace('{total}', String(ecransRepartisListe.length));
  const repartisRetoursDatesTrimestreFermeAvantDernierMoisPartPhrase = t(
    'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisRepartis',
  )
    .replace('{a}', String(ecransRepartisRetoursDatesTrimestreFermeListe.length))
    .replace(
      '{b}',
      String(ecransRepartisRetoursDatesAvantDernierMoisListe.length),
    )
    .replace(
      '{n}',
      String(
        ecransRepartisRetoursDatesTrimestreFermeAvantDernierMoisListe.length,
      ),
    );
  /* Les lignes du dépli que ce jeton écarte, lues sur la même liste des
     écrans repartis : le survol dit ce que l'appui retirera de la vue. */
  const repartisQuinzaineSemaineEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisQuinzaineSemaineListe.length,
  );
  const repartisQuinzaineSemaineEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineEcartes',
  )
    .replace('{n}', String(repartisQuinzaineSemaineEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le délai moyen de retour de la semaine en cours, lu sur les mêmes
     retours que la ligne du CSV : le dernier retour de chaque écran fait
     foi, et le survol du bouton « Visites en CSV » le nomme à côté de la
     période du total cumulé. Une moyenne se dit à une décimale. */
  const csvSemaineDelaiPhrase = (() => {
    const hist = readEcransRetoursHist();
    const liste = hist.length > 0 ? hist : readEcransRetours();
    const derniers: Record<string, { retire: string; retour: string }> = {};
    liste.forEach((item) => {
      if (!estSemaineEnCours(item.retour)) return;
      const avant = derniers[item.ecran];
      if (
        !avant ||
        new Date(item.retour).getTime() > new Date(avant.retour).getTime()
      ) {
        derniers[item.ecran] = { retire: item.retire, retour: item.retour };
      }
    });
    const ecarts = Object.values(derniers).map((item) =>
      joursEntre(item.retire, item.retour),
    );
    if (ecarts.length === 0) {
      return t('ad.suivi.doorOublisCsvSemaineDelaiNone');
    }
    const moyenne = ecarts.reduce((somme, n) => somme + n, 0) / ecarts.length;
    const arrondi = String(Math.round(moyenne * 10) / 10).replace('.', ',');
    return ecarts.length === 1
      ? t('ad.suivi.doorOublisCsvSemaineDelaiOne').replace('{n}', arrondi)
      : t('ad.suivi.doorOublisCsvSemaineDelai')
          .replace('{n}', arrondi)
          .replace('{k}', String(ecarts.length));
  })();
  /* Les écrans partis qu'aucun retour n'a jamais ramenés, posés à côté du
     délai moyen de la semaine : le survol du bouton « Visites en CSV » dit
     ainsi combien d'écrans attendent encore, sans ouvrir le fichier. */
  const csvSansRetourPhrase = (() => {
    const hist = readEcransRetoursHist();
    const retours = hist.length > 0 ? hist : readEcransRetours();
    const sansRetour = ecransRepartisListe.filter(
      (ligne) => !retours.some((item) => item.ecran === ligne.ecran),
    ).length;
    return sansRetour > 0
      ? t('ad.suivi.doorOublisCsvSansRetour').replace('{n}', String(sansRetour))
      : t('ad.suivi.doorOublisCsvSansRetourNone');
  })();
  /* Les retours de plus de quinze jours, posés à côté du délai moyen de la
     semaine : le survol du bouton « Visites en CSV » dit ainsi combien de
     retours suivent un départ déjà sorti de la quinzaine, lus sur la même
     liste que le jeton, sans ouvrir le fichier. */
  const csvHorsQuinzainePhrase =
    ecransRepartisHorsQuinzaineListe.length > 0
      ? t('ad.suivi.doorOublisCsvHorsQuinzaine').replace(
          '{n}',
          String(ecransRepartisHorsQuinzaineListe.length),
        )
      : t('ad.suivi.doorOublisCsvHorsQuinzaineNone');
  /* Le départ le plus récent de la semaine, lu sur la même liste que le jeton
     de la semaine : le survol dit combien de journées se sont écoulées depuis,
     pour que le geste se juge sans compter les lignes du dépli. Un écran parti
     le jour même dit zéro journée, plutôt qu’un jour arrondi. */
  const ecranRepartiPlusRecentSemaine =
    [...ecransRepartisSemaineListe].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0] ?? null;
  const ecranRepartiPlusRecentSemainePhrase = ecranRepartiPlusRecentSemaine
    ? t('ad.suivi.doorOublisEcransRepartisSemainePlusRecent')
        .replace('{ecran}', ecranRepartiPlusRecentSemaine.ecran)
        .replace('{date}', jour(ecranRepartiPlusRecentSemaine.date, lang))
        .replace(
          '{n}',
          String(joursEntre(ecranRepartiPlusRecentSemaine.date, new Date().toISOString())),
        )
    : t('ad.suivi.doorOublisEcransRepartisSemainePlusRecentNone');
  /* Le départ le plus ancien de la semaine, lu sur la même liste que le jeton
     de la semaine : le survol dit combien de journées se sont écoulées depuis,
     pour que la semaine se lise de son premier départ comme de son dernier.
     Un départ du jour même dit zéro journée, et une semaine sans départ le dit
     calmement plutôt que de nommer un départ qui n’existe pas. */
  const ecranRepartiPlusAncienSemaine =
    [...ecransRepartisSemaineListe].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )[0] ?? null;
  const ecranRepartiPlusAncienSemainePhrase = ecranRepartiPlusAncienSemaine
    ? t('ad.suivi.doorOublisEcransRepartisSemainePlusAncien')
        .replace('{ecran}', ecranRepartiPlusAncienSemaine.ecran)
        .replace('{date}', jour(ecranRepartiPlusAncienSemaine.date, lang))
        .replace(
          '{n}',
          String(
            joursEntre(ecranRepartiPlusAncienSemaine.date, new Date().toISOString()),
          ),
        )
    : t('ad.suivi.doorOublisEcransRepartisSemainePlusAncienNone');
  /* Les deux bouts des écrans repartis ce mois — son départ le plus ancien et
     son plus récent —, lus sur la même liste que le jeton : le survol dit ainsi
     en combien de journées le mois s'est étalé, sans compter les lignes. Deux
     départs du même jour disent une seule date, sans inventer d'écart. */
  const ecransRepartisMoisBouts = useMemo(() => {
    const temps = ecransRepartisMoisListe
      .map((ligne) => new Date(ligne.date).getTime())
      .filter((t) => !Number.isNaN(t));
    if (temps.length === 0) return null;
    return {
      ancien: new Date(Math.min(...temps)).toISOString(),
      recent: new Date(Math.max(...temps)).toISOString(),
    };
  }, [ecransRepartisMoisListe]);
  const ecransRepartisMoisSpanPhrase = ecransRepartisMoisBouts
    ? ecransRepartisMoisBouts.ancien === ecransRepartisMoisBouts.recent
      ? t('ad.suivi.doorOublisEcransRepartisMoisSpanOne').replace(
          '{date}',
          jour(ecransRepartisMoisBouts.recent, lang),
        )
      : t('ad.suivi.doorOublisEcransRepartisMoisSpan')
          .replace(
            '{n}',
            String(
              joursEntre(ecransRepartisMoisBouts.ancien, ecransRepartisMoisBouts.recent),
            ),
          )
          .replace('{ancien}', jour(ecransRepartisMoisBouts.ancien, lang))
          .replace('{recent}', jour(ecransRepartisMoisBouts.recent, lang))
    : '';
  /* L'écran parti depuis le plus longtemps, lu sur la même liste que le jeton :
     le survol du resserrement le nomme avec le jour de son dernier retrait et
     ses journées hors du carnet, pour que le geste se juge sans compter les
     lignes du dépli. Le plus ancien départ fait foi, et un écran jamais parti
     ne s'invente pas. */
  const ecranRepartiPlusAncien =
    [...ecransRepartisVieuxListe].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )[0] ?? null;
  const ecranRepartiPlusAncienPhrase = ecranRepartiPlusAncien
    ? t('ad.suivi.doorOublisEcransRepartisVieuxPlusAncien')
        .replace('{ecran}', ecranRepartiPlusAncien.ecran)
        .replace('{date}', jour(ecranRepartiPlusAncien.date, lang))
        .replace(
          '{n}',
          String(joursEntre(ecranRepartiPlusAncien.date, new Date().toISOString())),
        )
    : t('ad.suivi.doorOublisEcransRepartisVieuxPlusAncienNone');
  /* L'écran parti depuis le plus longtemps ce mois-ci, lu sur la même liste
     que le jeton du mois : le survol du resserrement le nomme avec le jour de
     son dernier retrait et ses journées hors du carnet. Un mois sans départ
     ne s'invente pas, et le plus ancien départ du mois fait foi. */
  const ecranRepartiPlusAncienMois =
    [...ecransRepartisMoisListe].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )[0] ?? null;
  const ecranRepartiPlusAncienMoisPhrase = ecranRepartiPlusAncienMois
    ? t('ad.suivi.doorOublisEcransRepartisMoisPlusAncien')
        .replace('{ecran}', ecranRepartiPlusAncienMois.ecran)
        .replace('{date}', jour(ecranRepartiPlusAncienMois.date, lang))
        .replace(
          '{n}',
          String(joursEntre(ecranRepartiPlusAncienMois.date, new Date().toISOString())),
        )
    : t('ad.suivi.doorOublisEcransRepartisMoisPlusAncienNone');
  /* Les lignes du dépli que le jeton des sept jours écarte de la vue, lues sur
     la liste des écrans repartis : le survol les annonce avant l'appui. */
  const repartisVieuxEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisVieuxListe.length,
  );
  const repartisVieuxEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisVieuxEcartes',
  )
    .replace('{n}', String(repartisVieuxEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Les lignes du dépli que le jeton du jour écarte de la vue, lues sur la
     même liste des écrans repartis : le survol dit ce que l’appui retirera de
     la vue, comme le fait celui des sept jours. Un jour sans départ n’écarte
     aucune ligne, et le dit plutôt que de laisser croire à un resserrement. */
  const repartisJourEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisJourListe.length,
  );
  const repartisJourEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisJourEcartes',
  )
    .replace('{n}', String(repartisJourEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Les lignes du dépli que le jeton d'hier écarte de la vue, lues sur la même
     liste des écrans repartis : le survol dit ce que l'appui retirera de la
     vue, comme celui du jour et celui des sept jours. */
  const repartisHierEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisHierListe.length,
  );
  const repartisHierEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisHierEcartes',
  )
    .replace('{n}', String(repartisHierEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Les lignes du dépli que le jeton d'avant-hier écarte de la vue, lues sur
     la même liste des écrans repartis : le survol dit ce que l'appui retirera
     de la vue, comme celui du jour et celui de la veille. */
  const repartisAvantHierEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisAvantHierListe.length,
  );
  const repartisAvantHierEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisAvantHierEcartes',
  )
    .replace('{n}', String(repartisAvantHierEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Les lignes du dépli que le jeton de la quinzaine écarte de la vue, lues
     sur la même liste des écrans repartis : le survol dit ce que l'appui
     retirera de la vue, comme celui du jour et celui de la veille. */
  const repartisQuinzaineEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisQuinzaineListe.length,
  );
  const repartisQuinzaineEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisQuinzaineEcartes',
  )
    .replace('{n}', String(repartisQuinzaineEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* La part de la semaine en cours dans le compte de la quinzaine, lue sur la
     même liste : elle situe le geste — ce que la quinzaine doit à la semaine
     qui court, et ce qu'elle tient des jours d'avant. Un écran parti il y a
     dix jours compte dans la quinzaine, jamais dans la semaine. */
  const repartisQuinzaineSemainePart = ecransRepartisQuinzaineListe.filter((ligne) =>
    estSemaineEnCours(ligne.date),
  ).length;
  const repartisQuinzaineSemainePhrase =
    repartisQuinzaineSemainePart > 0
      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineSemainePart')
          .replace('{n}', String(repartisQuinzaineSemainePart))
          .replace('{total}', String(ecransRepartisQuinzaineListe.length))
      : t('ad.suivi.doorOublisEcransRepartisQuinzaineSemainePartNone').replace(
          '{total}',
          String(ecransRepartisQuinzaineListe.length),
        );
  /* Les lignes du dépli que le jeton « partis dans la quinzaine puis revenus »
     écarte de la vue, lues sur la même liste des écrans repartis : le survol
     dit ce que l'appui retirera de la vue, comme les jetons du jour et de la
     quinzaine. */
  const repartisQuinzaineRevenusEcartes = Math.max(
    0,
    ecransRepartisListe.length - ecransRepartisQuinzaineRevenusListe.length,
  );
  const repartisQuinzaineRevenusEcartesPhrase = t(
    'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusEcartes',
  )
    .replace('{n}', String(repartisQuinzaineRevenusEcartes))
    .replace('{total}', String(ecransRepartisListe.length));
  /* Le délai moyen entre le départ et le retour, lu sur les mêmes lignes que
     le jeton — chacune porte sa date de retrait et celle de son retour : le
     survol dit ainsi combien de journées un écran met à revenir, sans compter
     les écrans du dépli. Une moyenne se dit à une décimale, pour qu'un
     demi-jour ne se confonde pas avec le jour entier. */
  const repartisQuinzaineRevenusDelaiPhrase = (() => {
    const ecarts = ecransRepartisQuinzaineRevenusListe.map((ligne) =>
      joursEntre(ligne.date, ligne.retour),
    );
    if (ecarts.length === 0) {
      return t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusDelaiNone');
    }
    const moyenne = ecarts.reduce((somme, n) => somme + n, 0) / ecarts.length;
    const arrondi = String(Math.round(moyenne * 10) / 10).replace('.', ',');
    return ecarts.length === 1
      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusDelaiOne').replace(
          '{n}',
          arrondi,
        )
      : t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusDelai')
          .replace('{n}', arrondi)
          .replace('{k}', String(ecarts.length));
  })();
  /* Ce que le jeton « partis dans la quinzaine puis revenus » retient, dit au
     survol du bouton CSV : le fichier ne part pas sans que l'on sache combien
     d'écrans ce jeton-là garde, ni ce qu'ils portent. */
  const csvQuinzaineRevenusPhrase =
    ecransRepartisQuinzaineRevenusListe.length > 0
      ? t('ad.suivi.doorOublisCsvQuinzaineRevenusCount').replace(
          '{n}',
          String(ecransRepartisQuinzaineRevenusListe.length),
        )
      : t('ad.suivi.doorOublisCsvQuinzaineRevenusCountNone');
  /* Le compte des lignes du fichier, bloc par bloc : lu sur le CSV lui-même,
     construit une seule fois puis relu ligne à ligne, si bien que le survol
     ne peut pas annoncer un chiffre que le fichier ne porte pas. Chaque bloc
     garde son intitulé, tel qu’il s’écrit dans le fichier. */
  const csvBlocs = useMemo(
    () => compteLignesOublisCsv(lang, jetonsPoses),
    [lang, jetonsPoses],
  );
  const csvBlocsPhrase =
    csvBlocs.blocs.length > 0
      ? `${t('ad.suivi.doorOublisCsvBlocs')
          .replace('{n}', String(csvBlocs.lignes))
          .replace('{b}', String(csvBlocs.blocs.length))} ${csvBlocs.blocs
          .map((bloc) =>
            t('ad.suivi.doorOublisCsvBlocItem')
              .replace('{titre}', bloc.titre)
              .replace('{n}', String(bloc.lignes)),
          )
          .join(' · ')}`
      : t('ad.suivi.doorOublisCsvBlocsNone');
  /* Le bloc le plus lourd du fichier, lu sur le compte déjà pris plus haut :
     c'est le même relevé, trié par son propre poids, si bien que le nom, son
     compte et le total ne peuvent pas se contredire. Une part en pourcentage
     se prend sur les lignes du fichier, jamais sur un chiffre écrit à côté. */
  const csvBlocLourd = useMemo(() => {
    if (csvBlocs.blocs.length === 0) return null;
    return csvBlocs.blocs.reduce((garde, bloc) =>
      bloc.lignes > garde.lignes ? bloc : garde,
    );
  }, [csvBlocs]);
  const csvBlocLourdPhrase = csvBlocLourd
    ? t('ad.suivi.doorOublisCsvBlocLourd')
        .replace('{titre}', csvBlocLourd.titre)
        .replace('{n}', String(csvBlocLourd.lignes))
        .replace('{total}', String(csvBlocs.lignes))
        .replace(
          '{part}',
          String(
            csvBlocs.lignes > 0
              ? Math.round((csvBlocLourd.lignes / csvBlocs.lignes) * 100)
              : 0,
          ),
        )
    : t('ad.suivi.doorOublisCsvBlocLourdNone');
  /* La période du total cumulé, lue sur les mêmes historiques que le CSV : du
     premier au dernier départ d'un écran revenu au carnet. Le survol du bouton
     « Visites en CSV » la nomme avant que le fichier ne parte, pour que
     l'archive ne s'emporte pas sans que l'on sache de quand à quand elle
     compte. */
  const cumulPeriodePhrase = useMemo(() => {
    const histRetours = readEcransRetoursHist();
    const retours = histRetours.length > 0 ? histRetours : readEcransRetours();
    const retraits = readEcransRetiresHist();
    const premierRetour = new Map<string, number>();
    retours.forEach((retour) => {
      const temps = new Date(retour.retour).getTime();
      if (Number.isNaN(temps)) return;
      const avant = premierRetour.get(retour.ecran);
      if (avant === undefined || temps < avant) premierRetour.set(retour.ecran, temps);
    });
    const temps: number[] = [];
    premierRetour.forEach((depuis, ecran) => {
      retraits.forEach((item) => {
        if (item.ecran !== ecran) return;
        const tempsRetrait = new Date(item.date).getTime();
        if (Number.isNaN(tempsRetrait) || tempsRetrait <= depuis) return;
        temps.push(tempsRetrait);
      });
    });
    if (temps.length === 0) return t('ad.suivi.doorOublisCsvCumulPeriodeNone');
    const premier = new Date(Math.min(...temps)).toISOString();
    const dernier = new Date(Math.max(...temps)).toISOString();
    const ecart = joursEntre(premier, dernier);
    return ecart > 0
      ? t('ad.suivi.doorOublisCsvCumulPeriode')
          .replace('{n}', String(ecart))
          .replace('{ancien}', jour(premier, lang))
          .replace('{recent}', jour(dernier, lang))
      : t('ad.suivi.doorOublisCsvCumulPeriodeOne').replace(
          '{date}',
          jour(dernier, lang),
        );
  }, [oublis, vues, t, lang]);
  /* Le jour du dernier retrait, retrouvé par le nom de l'écran : le dépli
     dit, ligne à ligne, quand l'écran est reparti — et se passe de gomme,
     puisqu'il n'a plus de geste à retirer. */
  const repartisDates = useMemo(() => {
    const table = new Map<string, string>();
    ecransRepartisListe.forEach((ligne) => table.set(ligne.ecran, ligne.date));
    return table;
  }, [ecransRepartisListe]);
  /* Les écrans que le second appui sur leur nom a vidés plus d'une fois : le
     jeton des écrans retirés plusieurs fois ne garde que ceux-là, comptés sur
     les mêmes lignes que le dépli. */
  const ecransRetiresPlusieursListe = useMemo(
    () =>
      ecransCarnet.filter((ligne) => (retraitsPlusieurs.get(ligne.ecran) ?? 0) > 1),
    [ecransCarnet, retraitsPlusieurs],
  );
  const ecransRetiresPlusieursDetail = ecransRetiresPlusieursListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRetiresPlusieursItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{n}', String(retraitsPlusieurs.get(ligne.ecran) ?? 0)),
    )
    .join(' · ');
  /* Les écrans revenus au moins deux fois au carnet : le jeton des retours
     répétés ne garde que ceux-là, comptés sur l'historique des retours — un
     même écran revenu deux fois garde deux gestes. */
  const ecransRetourDeuxListe = useMemo(
    () => ecransRetournes.filter((ligne) => ligne.fois >= 2),
    [ecransRetournes],
  );
  const ecransRetourDeuxDetail = ecransRetourDeuxListe
    .map((ligne) =>
      t('ad.suivi.doorOublisEcransRetourDeuxItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{n}', String(ligne.fois)),
    )
    .join(' · ');
  /* L'écran le plus souvent revenu au carnet, lu sur les mêmes lignes que le
     jeton : le survol du resserrement le nomme avec son compte, pour que le
     geste se juge sans compter les écrans du dépli. */
  const ecranPlusRevenu = useMemo(() => {
    const liste = [...ecransRetournes].sort((a, b) => b.fois - a.fois);
    return liste[0] ?? null;
  }, [ecransRetournes]);
  const ecranPlusRevenuPhrase = ecranPlusRevenu
    ? t('ad.suivi.doorOublisEcransRetourDeuxPlus')
        .replace('{ecran}', ecranPlusRevenu.ecran)
        .replace('{n}', String(ecranPlusRevenu.fois))
    : t('ad.suivi.doorOublisEcransRetourDeuxPlusNone');
  /* L'écran le plus souvent retiré par son nom depuis cet appareil, lu sur
     les mêmes lignes que le jeton : le survol du resserrement le nomme avec
     son compte, pour que le geste se juge sans compter les écrans du dépli. */
  const ecranPlusRetire = useMemo(() => {
    const liste = [...ecransRetiresPlusieursListe].sort(
      (a, b) =>
        (retraitsPlusieurs.get(b.ecran) ?? 0) -
        (retraitsPlusieurs.get(a.ecran) ?? 0),
    );
    const tete = liste[0];
    if (!tete) return null;
    return { ecran: tete.ecran, n: retraitsPlusieurs.get(tete.ecran) ?? 0 };
  }, [ecransRetiresPlusieursListe, retraitsPlusieurs]);
  const ecranPlusRetirePhrase = ecranPlusRetire
    ? t('ad.suivi.doorOublisEcransRetiresPlusieursPlus')
        .replace('{ecran}', ecranPlusRetire.ecran)
        .replace('{n}', String(ecranPlusRetire.n))
    : t('ad.suivi.doorOublisEcransRetiresPlusieursPlusNone');
  /* Les écrans du dépli qui tiennent encore plus d’un geste : le jeton de
     relecture ne garde que ceux-là, ceux qu’un second oubli rend ambigus. */
  const ecransPlusieurs = useMemo(
    () => ecransCarnet.filter((ligne) => ligne.n > 1),
    [ecransCarnet],
  );
  /* Les écrans qu'on ne relit plus : leur dernier geste remonte à plus de sept
     journées pleines. Le jeton des écrans oubliés ne garde que ceux-là, comptés
     sur les mêmes lignes que le dépli — un geste d'hier n'y entre pas. */
  const ecransVieux = useMemo(
    () =>
      ecransCarnet.filter((ligne) =>
        joursEntre(ligne.dernier, new Date().toISOString()) > 7,
      ),
    [ecransCarnet],
  );
  /* Le plus ancien des écrans oubliés : celui dont le dernier geste remonte
     le plus loin. Le survol du jeton le nomme avec ses journées, pour que le
     resserrement se juge sans compter les lignes du dépli. */
  const ecranVieuxPlusAncien =
    [...ecransVieux].sort(
      (a, b) => new Date(a.dernier).getTime() - new Date(b.dernier).getTime(),
    )[0] ?? null;
  const ecranVieuxPlusAncienPhrase = ecranVieuxPlusAncien
    ? t('ad.suivi.doorOublisEcransVieuxPlusAncien')
        .replace('{ecran}', ecranVieuxPlusAncien.ecran)
        .replace(
          '{n}',
          String(joursEntre(ecranVieuxPlusAncien.dernier, new Date().toISOString())),
        )
        .replace('{date}', jour(ecranVieuxPlusAncien.dernier, lang))
    : t('ad.suivi.doorOublisEcransVieuxPlusAncienNone');
  /* L’ordre du dépli tant que l’intitulé n’a pas été appuyé une seconde fois :
     les écrans suivent le carnet, du geste le plus récent au plus ancien —
     chacun à la place de son oubli le plus frais, lu sur les mêmes lignes. */
  const ecransOrdreCarnet = useMemo(() => {
    const vus = new Set<string>();
    const lignes: typeof ecransCarnet = [];
    journalCarnet.forEach((geste) => {
      const nom = geste.ecran || geste.lien;
      if (vus.has(nom)) return;
      const ligne = ecransCarnet.find((item) => item.ecran === nom);
      if (!ligne) return;
      vus.add(nom);
      lignes.push(ligne);
    });
    /* Un écran que le journal ne montre plus garde sa place en fin de liste,
       plutôt que de disparaître du dépli. */
    ecransCarnet.forEach((ligne) => {
      if (!vus.has(ligne.ecran)) lignes.push(ligne);
    });
    return lignes;
  }, [journalCarnet, ecransCarnet]);
  const ecransAffichesBase = carnetEcransFourni ? ecransCarnet : ecransOrdreCarnet;
  /* Les écrans revenus puis repartis n'ont plus de geste au carnet : le dépli
     les montre pourtant, avec le jour de leur dernier retrait et sans petite
     gomme — il n'y a plus rien à retirer. */
  const ecransRepartisAffiches: typeof ecransCarnet = (carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreSeule
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestre
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreListe
    : carnetEcransRetoursDatesAnneeFermeeSeule
    ? ecransRepartisRetoursDatesAnneeFermeeSeuleListe
    : carnetEcransRetoursDatesTrimestreSeule
    ? ecransRepartisRetoursDatesTrimestreSeuleListe
    : carnetEcransRetoursDatesMoisDernierTrimestre
    ? ecransRepartisRetoursDatesMoisDernierTrimestreListe
    : carnetEcransRetoursDatesAvantDernierMoisMoisEnCours
    ? ecransRepartisRetoursDatesAvantDernierMoisMoisEnCoursListe
    : carnetEcransRetoursDatesMoisEnCoursMoisDernier
    ? ecransRepartisRetoursDatesMoisEnCoursMoisDernierListe
    : carnetEcransRetoursDatesDeuxFenetres
    ? ecransRepartisRetoursDatesDeuxFenetresListe
    : carnetEcransRetoursDatesDeuxMoisFermes
    ? ecransRepartisRetoursDatesDeuxMoisFermesListe
    : carnetEcransRetoursDatesMoisDernierTrimestreFerme
    ? ecransRepartisRetoursDatesMoisDernierTrimestreFermeListe
    : carnetEcransRetoursDatesAnneeFermeeMoisDernier
    ? ecransRepartisRetoursDatesAnneeFermeeMoisDernierListe
    : carnetEcransRetoursDatesAnneeFermeeAvantDernierMois
    ? ecransRepartisRetoursDatesAnneeFermeeAvantDernierMoisListe
    : carnetEcransRetoursDatesTrimestreFermeAnneeFerme
    ? ecransRepartisRetoursDatesTrimestreFermeAnneeFermeListe
    : carnetEcransRetoursDatesTrimestreFermeAvantDernierMois
    ? ecransRepartisRetoursDatesTrimestreFermeAvantDernierMoisListe
    : carnetEcransRetoursDatesAvantDernierMoisTrimestreFerme
    ? ecransRepartisRetoursDatesAvantDernierMoisTrimestreFermeListe
    : carnetEcransRetoursDatesAvantDernierMoisMoisDernier
    ? ecransRepartisRetoursDatesAvantDernierMoisMoisDernierListe
    : carnetEcransRetoursDatesAnneeFermeeTrimestreFerme
    ? ecransRepartisRetoursDatesAnneeFermeeTrimestreFermeListe
    : carnetEcransRetoursDatesAnneeFermeeMoisEnCours
    ? ecransRepartisRetoursDatesAnneeFermeeMoisEnCoursListe
    : carnetEcransRetoursDates
    ? ecransRepartisRetoursDatesListe
    : carnetEcransRetoursDatesSemaine
    ? ecransRepartisRetoursDatesSemaineListe
    : carnetEcransRetoursDatesMois
    ? ecransRepartisRetoursDatesMoisListe
    : carnetEcransRetoursDatesMoisDernier
    ? ecransRepartisRetoursDatesMoisDernierListe
    : carnetEcransRetoursDatesAvantDernierMois
    ? ecransRepartisRetoursDatesAvantDernierMoisListe
    : carnetEcransRetoursDatesTrimestreFermeMoisDernier
    ? ecransRepartisRetoursDatesTrimestreFermeMoisDernierListe
    : carnetEcransRetoursDatesTrimestreFerme
    ? ecransRepartisRetoursDatesTrimestreFermeListe
    : carnetEcransRetoursDatesTrimestre
    ? ecransRepartisRetoursDatesTrimestreListe
    : carnetEcransRetoursDatesAnnee
    ? ecransRepartisRetoursDatesAnneeListe
    : carnetEcransRetoursDatesAnneeFermee
    ? ecransRepartisRetoursDatesAnneeFermeeListe
    : carnetEcransAucunRetour
    ? ecransRepartisAucunRetourListe
    : carnetEcransRepartisHorsQuinzaine
    ? ecransRepartisHorsQuinzaineListe
    : carnetEcransRepartisQuinzaineSansRetour
    ? ecransRepartisQuinzaineSansRetourListe
    : carnetEcransRepartisQuinzaineRapides
    ? ecransRepartisQuinzaineRapidesListe
    : carnetEcransRepartisQuinzaineReunis
    ? ecransRepartisQuinzaineReunisListe
    : carnetEcransRepartisQuinzaineTardifs
    ? ecransRepartisQuinzaineTardifsListe
    : carnetEcransRepartisQuinzaineRevenus
    ? ecransRepartisQuinzaineRevenusListe
    : carnetEcransRepartisQuinzaineJamais
      ? ecransRepartisQuinzaineJamaisListe
      : carnetEcransRepartisQuinzaineSemaine
        ? ecransRepartisQuinzaineSemaineListe
    : carnetEcransRepartisJour
    ? ecransRepartisListe.filter((ligne) => estJourEnCours(ligne.date))
    : carnetEcransRepartisHier
      ? ecransRepartisListe.filter((ligne) => estJourVeille(ligne.date))
      : carnetEcransRepartisAvantHier
        ? ecransRepartisListe.filter((ligne) => estJourAvantVeille(ligne.date))
      : carnetEcransRepartisQuinzaine
        ? ecransRepartisListe.filter(
            (ligne) => joursEntre(ligne.date, new Date().toISOString()) <= 15,
          )
      : carnetEcransRepartisSemaine
      ? ecransRepartisListe.filter((ligne) => estSemaineEnCours(ligne.date))
      : carnetEcransRepartisVieux
        ? ecransRepartisListe.filter(
            (ligne) => joursEntre(ligne.date, new Date().toISOString()) > 7,
          )
        : carnetEcransRepartisMois
          ? ecransRepartisListe.filter((ligne) => estMoisEnCours(ligne.date))
          : ecransRepartisListe
  ).map((ligne) => ({
    ecran: ligne.ecran,
    n: 0,
    premier: ligne.date,
    dernier: ligne.date,
  }));
  const ecransAffiches = (carnetEcransRepartis ||
  carnetEcransRepartisVieux ||
  carnetEcransRepartisMois ||
  carnetEcransRepartisSemaine ||
  carnetEcransRepartisJour ||
  carnetEcransRepartisHier ||
  carnetEcransRepartisAvantHier ||
  carnetEcransRepartisQuinzaine ||
  carnetEcransRepartisQuinzaineRevenus ||
  carnetEcransRepartisQuinzaineTardifs ||
  carnetEcransRepartisQuinzaineJamais ||
  carnetEcransRepartisQuinzaineRapides ||
  carnetEcransRepartisQuinzaineReunis ||
  carnetEcransRepartisQuinzaineSansRetour ||
    carnetEcransRepartisHorsQuinzaine ||
    carnetEcransAucunRetour ||
    carnetEcransRetoursDates ||
    carnetEcransRetoursDatesSemaine ||
    carnetEcransRetoursDatesMois ||
    carnetEcransRetoursDatesMoisDernier ||
    carnetEcransRetoursDatesAvantDernierMois ||
    carnetEcransRetoursDatesDeuxFenetres ||
    carnetEcransRetoursDatesTrimestre ||
    carnetEcransRetoursDatesTrimestreFerme ||
    carnetEcransRetoursDatesTrimestreFermeMoisDernier ||
    carnetEcransRetoursDatesAnnee ||
    carnetEcransRetoursDatesAnneeFermee ||
    carnetEcransRetoursDatesDeuxMoisFermes ||
    carnetEcransRetoursDatesMoisDernierTrimestreFerme ||
    carnetEcransRetoursDatesAvantDernierMoisTrimestreFerme ||
    carnetEcransRetoursDatesAnneeFermeeMoisDernier ||
    carnetEcransRetoursDatesAnneeFermeeAvantDernierMois ||
    carnetEcransRetoursDatesTrimestreFermeAvantDernierMois ||
    carnetEcransRetoursDatesAvantDernierMoisMoisDernier ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreFerme ||
    carnetEcransRetoursDatesAnneeFermeeMoisEnCours ||
    carnetEcransRetoursDatesMoisEnCoursMoisDernier ||
    carnetEcransRetoursDatesAvantDernierMoisMoisEnCours ||
    carnetEcransRetoursDatesMoisDernierTrimestre ||
    carnetEcransRetoursDatesAnneeFermeeTrimestre ||
    carnetEcransRetoursDatesAnneeFermeeSeule ||
    carnetEcransRetoursDatesTrimestreSeule ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeule ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine ||
  carnetEcransRepartisQuinzaineSemaine
    ? ecransRepartisAffiches
    : (carnetEcransRelire
        ? ecransAffichesBase.filter((ligne) => ligne.n > 1)
        : ecransAffichesBase
      )
        .filter(
          (ligne) =>
            !carnetEcransVieux ||
            joursEntre(ligne.dernier, new Date().toISOString()) > 7,
        )
    /* Le jeton des retours ne garde que les écrans revenus : ceux qu'un
       second appui avait retirés, et qu'un geste a ramenés au carnet. */
    .filter(
      (ligne) =>
        !carnetEcransRetour ||
        ecransRetournes.some((item) => item.ecran === ligne.ecran),
    )
    /* Le jeton des écrans retirés plus d'une fois ne garde que ceux que le
       second appui sur leur nom a vidés au moins deux fois depuis cet appareil. */
    .filter(
      (ligne) =>
        !carnetEcransRetiresPlusieurs ||
        (retraitsPlusieurs.get(ligne.ecran) ?? 0) > 1,
    )
    /* Le jeton des retours répétés ne garde que les écrans revenus au moins
       deux fois au carnet, comptés sur l'historique des retours. */
    .filter(
      (ligne) =>
        !carnetEcransRetourDeux ||
        ecransRetourDeuxListe.some((item) => item.ecran === ligne.ecran),
    )
  );
  /* Les écrans dont le rang change entre l’ordre du carnet et le rangement
     du plus fourni : deux listes de mêmes écrans, comparées place par place.
     Le survol de l’intitulé dit combien de lignes le second appui déplace. */
  const ecransDeplaces = ecransOrdreCarnet.filter(
    (ligne, rang) => ecransCarnet[rang]?.ecran !== ligne.ecran,
  ).length;
  const ecransDeplacesPhrase =
    ecransDeplaces > 0
      ? t('ad.suivi.doorOublisEcransDeplaces')
          .replace('{n}', String(ecransDeplaces))
          .replace('{total}', String(ecransCarnet.length))
      : t('ad.suivi.doorOublisEcransDeplacesNone').replace(
          '{total}',
          String(ecransCarnet.length),
        );
  /* L’écran vidé le plus récemment, lu sur la mémoire d’appareil : le jeton de
     relecture le nomme au survol, pour que le geste de la petite gomme d’un
     écran se relise sans ouvrir la liste. */
  const ecranVideRecent = useMemo(() => readEcranVideRecent(), [oublis]);
  const ecranVidePhrase = ecranVideRecent
    ? ecranVideRecent.date
      ? t('ad.suivi.doorOublisEcransRelireRecent')
          .replace('{ecran}', ecranVideRecent.ecran)
          .replace('{date}', jour(ecranVideRecent.date, lang))
      : ecranVideRecent.ecran
    : t('ad.suivi.doorOublisEcransRelireRecentNone');
  /* Les écrans retirés du carnet par un second appui sur leur nom, lus sur la
     mémoire d'appareil : l'intitulé du tri dit combien d'écrans ont quitté le
     carnet par ce geste-là, et lesquels, du plus récent au plus ancien. */
  const ecransRetiresNom = useMemo(() => readEcransRetiresNom(), [oublis, vues]);
  const ecransRetiresNomPhrase =
    ecransRetiresNom.length > 0
      ? t('ad.suivi.doorOublisEcransRetiresNom')
          .replace('{n}', String(ecransRetiresNom.length))
          .replace(
            '{list}',
            [...ecransRetiresNom]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((item) => `${item.ecran} · ${jour(item.date, lang)}`)
              .join(' · '),
          )
      : t('ad.suivi.doorOublisEcransRetiresNomNone');
  /* Les retraits successifs, lus sur l'historique d'appareil : chaque geste
     y garde sa propre date, si bien que le survol du CSV dit l'écart entre le
     premier retrait par nom et le dernier, au lieu de le déduire de la seule
     liste des écrans — qui n'en garde qu'une trace par nom. */
  const retraitsHist = useMemo(() => readEcransRetiresHist(), [oublis, vues]);
  const retraitsBouts = useMemo(() => {
    const temps = (retraitsHist.length > 0 ? retraitsHist : ecransRetiresNom)
      .map((item) => new Date(item.date).getTime())
      .filter((t) => !Number.isNaN(t));
    if (temps.length === 0) return null;
    return {
      ancien: new Date(Math.min(...temps)).toISOString(),
      recent: new Date(Math.max(...temps)).toISOString(),
    };
  }, [retraitsHist, ecransRetiresNom]);
  const retraitsEcart = retraitsBouts
    ? joursEntre(retraitsBouts.ancien, retraitsBouts.recent)
    : 0;
  const retraitsSpanPhrase = retraitsBouts
    ? retraitsEcart > 0
      ? t('ad.suivi.doorOublisCsvRetiresSpan')
          .replace('{n}', String(retraitsEcart))
          .replace('{ancien}', jour(retraitsBouts.ancien, lang))
          .replace('{recent}', jour(retraitsBouts.recent, lang))
      : t('ad.suivi.doorOublisCsvRetiresSpanOne').replace(
          '{date}',
          jour(retraitsBouts.recent, lang),
        )
    : t('ad.suivi.doorOublisCsvRetiresSpanNone');
  /* L'écart entre le dernier retrait et le retour, écran par écran, lu sur
     l'historique des retours : le survol du bouton CSV en dit la moyenne,
     pour que le fichier ne parte pas sans que l'on sache ce qu'il porte. Le
     dernier retour de chaque écran fait foi, comme dans la section du CSV. */
  const retourMoyennePhrase = useMemo(() => {
    const hist = readEcransRetoursHist();
    const liste = hist.length > 0 ? hist : readEcransRetours();
    if (liste.length === 0) {
      return t('ad.suivi.doorOublisCsvRetourMoyenneNone');
    }
    const dernierParEcran: Record<string, { retire: string; retour: string }> = {};
    liste.forEach((item) => {
      const avant = dernierParEcran[item.ecran];
      if (
        !avant ||
        new Date(item.retour).getTime() > new Date(avant.retour).getTime()
      ) {
        dernierParEcran[item.ecran] = { retire: item.retire, retour: item.retour };
      }
    });
    const ecarts = Object.values(dernierParEcran).map((item) =>
      joursEntre(item.retire, item.retour),
    );
    if (ecarts.length === 0) {
      return t('ad.suivi.doorOublisCsvRetourMoyenneNone');
    }
    const moyenne = ecarts.reduce((somme, n) => somme + n, 0) / ecarts.length;
    const arrondi = String(Math.round(moyenne * 10) / 10).replace('.', ',');
    return ecarts.length === 1
      ? t('ad.suivi.doorOublisCsvRetourMoyenneOne').replace('{n}', arrondi)
      : t('ad.suivi.doorOublisCsvRetourMoyenne')
          .replace('{n}', arrondi)
          .replace('{k}', String(ecarts.length));
  }, [oublis, vues, t]);
  /* Les jours passés au carnet avant de repartir, écran par écran, lus sur les
     deux historiques — le dernier retour suivi du dernier retrait fait foi,
     comme dans la section du CSV. Le survol du bouton en dit la moyenne, à
     côté de celle des écarts de retour, pour que le fichier ne parte pas sans
     que l’on sache ce qu’il porte. */
  const repartisMoyennePhrase = useMemo(() => {
    const retours = readEcransRetoursHist();
    const retoursListe = retours.length > 0 ? retours : readEcransRetours();
    const retraits = readEcransRetiresHist();
    const dernierParEcran: Record<string, { retour: string; retrait: string }> = {};
    retoursListe.forEach((retour) => {
      const apres = retraits.filter(
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
      const avant = dernierParEcran[retour.ecran];
      if (
        avant &&
        new Date(retour.retour).getTime() <= new Date(avant.retour).getTime()
      ) {
        return;
      }
      dernierParEcran[retour.ecran] = {
        retour: retour.retour,
        retrait: dernier.date,
      };
    });
    const jours = Object.values(dernierParEcran).map((item) =>
      joursEntre(item.retour, item.retrait),
    );
    if (jours.length === 0) {
      return t('ad.suivi.doorOublisCsvRepartisMoyenneNone');
    }
    const moyenne = jours.reduce((somme, n) => somme + n, 0) / jours.length;
    const arrondi = String(Math.round(moyenne * 10) / 10).replace('.', ',');
    return jours.length === 1
      ? t('ad.suivi.doorOublisCsvRepartisMoyenneOne').replace('{n}', arrondi)
      : t('ad.suivi.doorOublisCsvRepartisMoyenne')
          .replace('{n}', arrondi)
          .replace('{k}', String(jours.length));
  }, [oublis, vues, t]);
  /* Le total des écrans repartis de la semaine en cours, lu sur la même liste
     que le jeton de la semaine : le survol du bouton CSV le nomme avant que le
     fichier ne parte, pour que l'archive ne s'emporte pas à l'aveugle. */
  const repartisSemaineTotalPhrase =
    ecransRepartisSemaineListe.length > 0
      ? t('ad.suivi.doorOublisCsvRepartisSemaineTotal').replace(
          '{n}',
          String(ecransRepartisSemaineListe.length),
        )
      : t('ad.suivi.doorOublisCsvRepartisSemaineTotalNone');
  /* Ce que le jeton retient au total, tous écrans confondus : la somme de
     leurs gestes, lue sur les mêmes lignes que le dépli. */
  const gestesPlusieurs = ecransPlusieurs.reduce((somme, ligne) => somme + ligne.n, 0);
  /* Le détail du jeton : les écrans qu’il retient, un à un, avec leur compte
     et leur dernier oubli — lus sur les mêmes lignes que le dépli. */
  const ecransPlusieursDetail = ecransPlusieurs
    .map((ligne) =>
      t('ad.suivi.doorOublisTriEcranItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{n}', String(ligne.n))
        .replace('{date}', jour(ligne.dernier, lang)),
    )
    .join(' · ');
  /* Les écrans que le jeton de relecture écarte du dépli : ceux qui ne
     tiennent qu’un seul geste, avec le compte de gestes qu’ils emportent
     hors de la vue — lus sur les mêmes lignes que le dépli. */
  const ecransEcartes = ecransCarnet.filter((ligne) => ligne.n <= 1);
  const gestesEcartes = ecransEcartes.reduce((somme, ligne) => somme + ligne.n, 0);
  const ecransEcartesDetail = ecransEcartes
    .map((ligne) =>
      t('ad.suivi.doorOublisTriEcranItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{n}', String(ligne.n))
        .replace('{date}', jour(ligne.dernier, lang)),
    )
    .join(' · ');
  /* Ce que le jeton des écrans oubliés retient : leurs gestes à eux tous, et
     le détail de chacun avec le jour de son dernier oubli — lus sur les mêmes
     lignes que le dépli. */
  const gestesVieux = ecransVieux.reduce((somme, ligne) => somme + ligne.n, 0);
  const ecransVieuxDetail = ecransVieux
    .map((ligne) =>
      t('ad.suivi.doorOublisTriEcranItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{n}', String(ligne.n))
        .replace('{date}', jour(ligne.dernier, lang)),
    )
    .join(' · ');
  /* Le détail du survol du tri : un écran par morceau, son compte puis le
     jour de son oubli le plus récent, lus sur les seuls gestes du carnet. */
  const ecransCarnetDetail = ecransCarnet
    .map((ligne) =>
      t('ad.suivi.doorOublisTriEcranItem')
        .replace('{ecran}', ligne.ecran)
        .replace('{n}', String(ligne.n))
        .replace('{date}', jour(ligne.dernier, lang)),
    )
    .join(' · ');
  /* Le compte de chaque écran sur le carnet entier, indépendamment du jeton
     d’écran posé : le survol du nom dit combien de gestes il regroupe au
     carnet, pas seulement ceux qui restent à la vue. */
  const compteParEcran = useMemo(() => {
    const table: Record<string, number> = {};
    compteOublisParEcran(oublis).forEach((ligne) => {
      table[ligne.ecran] = ligne.n;
    });
    return table;
  }, [oublis]);
  /* Le détail du survol : chaque chantier, son compte, le jour de son dernier
     oubli, puis les journées qui séparent son premier oubli de son dernier —
     tout lu sur la même mémoire, jamais écrit à côté. Deux oublis du même jour
     disent zéro journée, plutôt qu’un écart arrondi. */
  const oublisParChantierDetail = oublisParChantier
    .map((ligne) => {
      const jours = joursEntre(ligne.premier, ligne.dernier);
      const ecart =
        jours > 0
          ? t('ad.suivi.doorOublisChantierSpan').replace('{n}', String(jours))
          : t('ad.suivi.doorOublisChantierSpanOne');
      return (
        t('ad.suivi.doorOublisChantierItem')
          .replace('{nom}', ligne.nom || t('ad.suivi.doorOublisChantierAucun'))
          .replace('{n}', String(ligne.n)) +
        ` · ${t('ad.suivi.doorOublisChantierDernier').replace('{date}', jour(ligne.dernier, lang))} · ${ecart}`
      );
    })
    .join(' · ');
  /* Le retour de la copie des lignes retenues : le bouton répond sur place. */
  const [resteCopie, setResteCopie] = useState<'' | 'ok' | 'fail'>('');
  /* Ce que la petite gomme d'une porte vient de rendre, dit sous la liste :
     la visite de cette seule porte, sur cet appareil. */
  const [resteOublie, setResteOublie] = useState('');
  /* Ce que la gomme d'un chantier vient de rendre, dit sous le rappel : les
     portes de ce chantier-là, et elles seules. */
  const [partOublie, setPartOublie] = useState('');
  /* Le carnet des oublis qui vient de partir en CSV : le bouton répond sur
     place, sans effacer la réponse de la copie des lignes. */
  const [oublisEmporte, setOublisEmporte] = useState(false);
  /* Le nombre de lignes retenues par le jeton dont la porte est déjà
     empruntée : le complément dit ce qui reste à ouvrir. */
  const resteVues = resteAvecPorte.filter((item) => {
    const porte = portesResteTable[item.texte];
    return porte ? Boolean(vues[porte.lien]) : false;
  });
  const restePortesVues = resteVues.length;
  /* Les écrans que le jeton « déjà empruntées » laisse, un à un, dans l'ordre
     du plan : le survol les nomme avant de poser le jeton, pour situer le lot. */
  const resteVuesEcrans = resteVues
    .map((item) => portesResteTable[item.texte]?.ecran ?? '')
    .filter((ecran) => Boolean(ecran));
  /* Les portes empruntées de chaque chantier, comptées sur la même mémoire
     d'appareil : la porte du chantier et celles de ses modules, une adresse
     comptée une fois, avec le jour de la visite pour le survol — et la liste
     des adresses, pour que la gomme du chantier sache ce qu'elle rend. */
  const portesChantier = useMemo(() => {
    const table: Record<
      string,
      {
        used: number;
        total: number;
        detail: string[];
        liens: string[];
        ecrans: Record<string, string>;
      }
    > = {};
    SUIVI_CHANTIERS.forEach((chantier) => {
      const ecrans = new Map<string, string>();
      if (chantier.lien) ecrans.set(chantier.lien, chantier.ecran ?? chantier.nom);
      chantier.modules.forEach((nom) => {
        const porte = portes[nom];
        if (porte) ecrans.set(porte.lien, porte.ecran);
      });
      let used = 0;
      const detail: string[] = [];
      const liens: string[] = [];
      /* L'écran de chaque porte visitée, gardé à côté de son adresse : la
         gomme du chantier l'emporte au carnet, pour que le CSV nomme les
         écrans rendus plutôt que des adresses nues. */
      const noms: Record<string, string> = {};
      ecrans.forEach((ecran, lien) => {
        const vuLe = vues[lien] ?? null;
        if (!vuLe) return;
        used += 1;
        detail.push(`${ecran} · ${jour(vuLe, lang)}`);
        liens.push(lien);
        noms[lien] = ecran;
      });
      table[chantier.nom] = { used, total: ecrans.size, detail, liens, ecrans: noms };
    });
    return table;
  }, [portes, vues, lang]);

  /* Une porte empruntée : la mémoire du poste la retient, et la liste se
     relit aussitôt — sans recharger la page ni quitter le suivi. */
  const onVisite = (lien: string) => setVues(markPorteVue(lien));

  useEffect(() => {
    if (!resteCopie) return undefined;
    const timer = window.setTimeout(() => setResteCopie(''), 6000);
    return () => window.clearTimeout(timer);
  }, [resteCopie]);

  useEffect(() => {
    if (!resteOublie) return undefined;
    const timer = window.setTimeout(() => setResteOublie(''), 6000);
    return () => window.clearTimeout(timer);
  }, [resteOublie]);

  useEffect(() => {
    if (!partOublie) return undefined;
    const timer = window.setTimeout(() => setPartOublie(''), 6000);
    return () => window.clearTimeout(timer);
  }, [partOublie]);

  /* Un chantier retenu qui n’a plus aucun geste au carnet rend la liste
     entière : le jeton ne reste pas posé sur une liste vide. */
  useEffect(() => {
    if (carnetChantier === null) return;
    if (journalChantier.length > 0) return;
    setCarnetChantier(null);
  }, [carnetChantier, journalChantier]);

  /* Une semaine retenue qui ne laisse plus aucun geste se lève d’elle-même :
     le carnet ne s’ouvre pas sur une liste vide. */
  useEffect(() => {
    if (!carnetSemaine) return;
    if (journalSemaine.length > 0) return;
    setCarnetSemaine(false);
  }, [carnetSemaine, journalSemaine]);

  /* Un jeton de relecture qui ne retient plus aucun écran se lève de
     lui-même : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRelire) return;
    if (ecransPlusieurs.length > 0) return;
    setCarnetEcransRelire(false);
  }, [carnetEcransRelire, ecransPlusieurs]);

  /* Un jeton d'écrans oubliés qui ne retient plus rien se lève de lui-même :
     le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransVieux) return;
    if (ecransVieux.length > 0) return;
    setCarnetEcransVieux(false);
  }, [carnetEcransVieux, ecransVieux]);

  /* Un jeton de retours qui ne retient plus aucun écran se lève de lui-même :
     le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetour) return;
    if (ecransRetournes.length > 0) return;
    setCarnetEcransRetour(false);
  }, [carnetEcransRetour, ecransRetournes]);

  /* Un jeton des écrans retirés plusieurs fois qui ne retient plus rien se
     lève de lui-même : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetiresPlusieurs) return;
    if (ecransRetiresPlusieursListe.length > 0) return;
    setCarnetEcransRetiresPlusieurs(false);
  }, [carnetEcransRetiresPlusieurs, ecransRetiresPlusieursListe]);

  /* Un jeton des retours répétés qui ne retient plus aucun écran se lève de
     lui-même : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetourDeux) return;
    if (ecransRetourDeuxListe.length > 0) return;
    setCarnetEcransRetourDeux(false);
  }, [carnetEcransRetourDeux, ecransRetourDeuxListe]);

  /* Un jeton des écrans revenus puis repartis qui ne retient plus rien se lève
     de lui-même : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartis) return;
    if (ecransRepartisListe.length > 0) return;
    setCarnetEcransRepartis(false);
    setCarnetEcransRepartisVieux(false);
    setCarnetEcransRepartisMois(false);
    setCarnetEcransRepartisHier(false);
    setCarnetEcransRepartisAvantHier(false);
    setCarnetEcransRepartisQuinzaine(false);
    setCarnetEcransRepartisQuinzaineRevenus(false);
    setCarnetEcransRepartisQuinzaineJamais(false);
    setCarnetEcransRepartisQuinzaineSemaine(false);
    setCarnetEcransRepartisQuinzaineTardifs(false);
    setCarnetEcransRepartisQuinzaineRapides(false);
    setCarnetEcransRepartisQuinzaineSansRetour(false);
    setCarnetEcransRepartisHorsQuinzaine(false);
    setCarnetEcransAucunRetour(false);
    setCarnetEcransRetoursDates(false);
    setCarnetEcransRetoursDatesSemaine(false);
    setCarnetEcransRetoursDatesMois(false);
    setCarnetEcransRetoursDatesMoisDernier(false);
    setCarnetEcransRetoursDatesAvantDernierMois(false);
    setCarnetEcransRetoursDatesDeuxFenetres(false);
    setCarnetEcransRetoursDatesTrimestre(false);
    setCarnetEcransRetoursDatesTrimestreFerme(false);
    setCarnetEcransRetoursDatesTrimestreFermeMoisDernier(false);
    setCarnetEcransRetoursDatesAnnee(false);
    setCarnetEcransRetoursDatesAnneeFermee(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeMoisEnCours(false);
    setCarnetEcransRetoursDatesDeuxMoisFermes(false);
  }, [carnetEcransRepartis, ecransRepartisListe]);

  /* Un jeton des écrans repartis de longue date qui ne retient plus rien se
     lève de lui-même : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisVieux) return;
    if (ecransRepartisVieuxListe.length > 0) return;
    setCarnetEcransRepartisVieux(false);
  }, [carnetEcransRepartisVieux, ecransRepartisVieuxListe]);

  /* Un jeton du mois qui ne retient plus aucun écran se lève de lui-même :
     le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisMois) return;
    if (ecransRepartisMoisListe.length > 0) return;
    setCarnetEcransRepartisMois(false);
  }, [carnetEcransRepartisMois, ecransRepartisMoisListe]);

  /* Un jeton de la semaine qui ne retient plus aucun écran se lève de
     lui-même : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisSemaine) return;
    if (ecransRepartisSemaineListe.length > 0) return;
    setCarnetEcransRepartisSemaine(false);
  }, [carnetEcransRepartisSemaine, ecransRepartisSemaineListe]);

  /* Un jeton du jour qui ne retient plus aucun écran se lève de lui-même : le
     dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisJour) return;
    if (ecransRepartisJourListe.length > 0) return;
    setCarnetEcransRepartisJour(false);
  }, [carnetEcransRepartisJour, ecransRepartisJourListe]);

  /* Un jeton de la veille qui ne retient plus aucun écran se lève de lui-même :
     le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisHier) return;
    if (ecransRepartisHierListe.length > 0) return;
    setCarnetEcransRepartisHier(false);
  }, [carnetEcransRepartisHier, ecransRepartisHierListe]);

  /* Un jeton de l'avant-veille qui ne retient plus aucun écran se lève de
     lui-même : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisAvantHier) return;
    if (ecransRepartisAvantHierListe.length > 0) return;
    setCarnetEcransRepartisAvantHier(false);
    setCarnetEcransRepartisQuinzaine(false);
    setCarnetEcransRepartisQuinzaineRevenus(false);
    setCarnetEcransRepartisQuinzaineJamais(false);
    setCarnetEcransRepartisQuinzaineSemaine(false);
    setCarnetEcransRepartisQuinzaineTardifs(false);
    setCarnetEcransRepartisQuinzaineRapides(false);
    setCarnetEcransRepartisQuinzaineSansRetour(false);
    setCarnetEcransRepartisHorsQuinzaine(false);
  }, [carnetEcransRepartisAvantHier, ecransRepartisAvantHierListe]);

  /* Un jeton de la quinzaine qui ne retient plus aucun écran se lève de
     lui-même : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisQuinzaine) return;
    if (ecransRepartisQuinzaineListe.length > 0) return;
    setCarnetEcransRepartisQuinzaine(false);
    setCarnetEcransRepartisQuinzaineRevenus(false);
    setCarnetEcransRepartisQuinzaineJamais(false);
    setCarnetEcransRepartisQuinzaineSemaine(false);
    setCarnetEcransRepartisQuinzaineTardifs(false);
    setCarnetEcransRepartisQuinzaineRapides(false);
    setCarnetEcransRepartisQuinzaineSansRetour(false);
    setCarnetEcransRepartisHorsQuinzaine(false);
  }, [carnetEcransRepartisQuinzaine, ecransRepartisQuinzaineListe]);

  /* Un jeton des écrans partis dans la quinzaine puis revenus qui ne retient
     plus rien se lève de lui-même : le dépli ne reste pas vide sous un jeton
     sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisQuinzaineRevenus) return;
    if (ecransRepartisQuinzaineRevenusListe.length > 0) return;
    setCarnetEcransRepartisQuinzaineRevenus(false);
    setCarnetEcransRepartisQuinzaineJamais(false);
    setCarnetEcransRepartisQuinzaineSemaine(false);
    setCarnetEcransRepartisQuinzaineTardifs(false);
    setCarnetEcransRepartisQuinzaineRapides(false);
    setCarnetEcransRepartisQuinzaineSansRetour(false);
    setCarnetEcransRepartisHorsQuinzaine(false);
  }, [carnetEcransRepartisQuinzaineRevenus, ecransRepartisQuinzaineRevenusListe]);

  /* Un jeton des partis sans retour qui ne retient plus aucun écran se lève de
     lui-même : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisQuinzaineJamais) return;
    if (ecransRepartisQuinzaineJamaisListe.length > 0) return;
    setCarnetEcransRepartisQuinzaineJamais(false);
    setCarnetEcransRepartisQuinzaineSemaine(false);
    setCarnetEcransRepartisQuinzaineTardifs(false);
    setCarnetEcransRepartisQuinzaineRapides(false);
    setCarnetEcransRepartisQuinzaineSansRetour(false);
    setCarnetEcransRepartisHorsQuinzaine(false);
  }, [carnetEcransRepartisQuinzaineJamais, ecransRepartisQuinzaineJamaisListe]);

  /* Un jeton des écrans partis dans la quinzaine et revenus cette semaine
     qui ne retient plus rien se lève de lui-même : le dépli ne reste pas
     vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisQuinzaineSemaine) return;
    if (ecransRepartisQuinzaineSemaineListe.length > 0) return;
    setCarnetEcransRepartisQuinzaineSemaine(false);
    setCarnetEcransRepartisQuinzaineTardifs(false);
    setCarnetEcransRepartisQuinzaineRapides(false);
    setCarnetEcransRepartisQuinzaineSansRetour(false);
    setCarnetEcransRepartisHorsQuinzaine(false);
  }, [carnetEcransRepartisQuinzaineSemaine, ecransRepartisQuinzaineSemaineListe]);

  /* Un jeton des retours tardifs qui ne retient plus rien se lève de
     lui-même : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisQuinzaineTardifs) return;
    if (ecransRepartisQuinzaineTardifsListe.length > 0) return;
    setCarnetEcransRepartisQuinzaineTardifs(false);
  }, [carnetEcransRepartisQuinzaineTardifs, ecransRepartisQuinzaineTardifsListe]);

  /* Un jeton des retours rapides qui ne retient plus rien se lève de
     lui-même : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisQuinzaineRapides) return;
    if (ecransRepartisQuinzaineRapidesListe.length > 0) return;
    setCarnetEcransRepartisQuinzaineRapides(false);
    setCarnetEcransRepartisQuinzaineSansRetour(false);
    setCarnetEcransRepartisHorsQuinzaine(false);
  }, [carnetEcransRepartisQuinzaineRapides, ecransRepartisQuinzaineRapidesListe]);

  /* Un jeton des deux lots réunis qui ne retient plus aucun écran se lève de
     lui-même : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisQuinzaineReunis) return;
    if (ecransRepartisQuinzaineReunisListe.length > 0) return;
    setCarnetEcransRepartisQuinzaineReunis(false);
  }, [carnetEcransRepartisQuinzaineReunis, ecransRepartisQuinzaineReunisListe]);

  /* Un jeton de la quinzaine sans aucun retour qui ne retient plus aucun
     écran se lève de lui-même : le dépli ne reste pas vide sous un jeton
     sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisQuinzaineSansRetour) return;
    if (ecransRepartisQuinzaineSansRetourListe.length > 0) return;
    setCarnetEcransRepartisQuinzaineSansRetour(false);
  }, [carnetEcransRepartisQuinzaineSansRetour, ecransRepartisQuinzaineSansRetourListe]);

  /* Un jeton des retours de plus de quinze jours qui ne retient plus aucun
     écran se lève de lui-même : le dépli ne reste pas vide sous un jeton
     sans objet. */
  useEffect(() => {
    if (!carnetEcransRepartisHorsQuinzaine) return;
    if (ecransRepartisHorsQuinzaineListe.length > 0) return;
    setCarnetEcransRepartisHorsQuinzaine(false);
  }, [carnetEcransRepartisHorsQuinzaine, ecransRepartisHorsQuinzaineListe]);

  /* Un jeton des écrans sans aucune date de retour qui ne retient plus aucun
     écran se lève de lui-même : le dépli ne reste pas vide sous un jeton
     sans objet. */
  useEffect(() => {
    if (!carnetEcransAucunRetour) return;
    if (ecransRepartisAucunRetourListe.length > 0) return;
    setCarnetEcransAucunRetour(false);
  }, [carnetEcransAucunRetour, ecransRepartisAucunRetourListe]);

  /* Le jeton des retours datés se lève de lui-même quand plus aucun écran
     ne porte de date de retour : le dépli ne reste pas vide sous un jeton
     sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDates) return;
    if (ecransRepartisRetoursDatesListe.length > 0) return;
    setCarnetEcransRetoursDates(false);
  }, [carnetEcransRetoursDates, ecransRepartisRetoursDatesListe]);

  /* Le jeton des retours datés de la semaine se lève de lui-même quand plus
     aucun écran n’est revenu avec une date cette semaine : le dépli ne reste
     pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesSemaine) return;
    if (ecransRepartisRetoursDatesSemaineListe.length > 0) return;
    setCarnetEcransRetoursDatesSemaine(false);
  }, [carnetEcransRetoursDatesSemaine, ecransRepartisRetoursDatesSemaineListe]);

  /* Le jeton des retours datés du mois se lève de lui-même quand plus aucun
     écran n’est revenu avec une date ce mois-ci : le dépli ne reste pas vide
     sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesMois) return;
    if (ecransRepartisRetoursDatesMoisListe.length > 0) return;
    setCarnetEcransRetoursDatesMois(false);
  }, [carnetEcransRetoursDatesMois, ecransRepartisRetoursDatesMoisListe]);

  /* Le jeton des retours datés du mois dernier se lève de lui-même quand plus
     aucun écran n’est revenu avec une date sur cette fenêtre : le dépli ne
     reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesMoisDernier) return;
    if (ecransRepartisRetoursDatesMoisDernierListe.length > 0) return;
    setCarnetEcransRetoursDatesMoisDernier(false);
  }, [
    carnetEcransRetoursDatesMoisDernier,
    ecransRepartisRetoursDatesMoisDernierListe,
  ]);

  /* Le jeton des retours datés de l’avant-dernier mois se lève de lui-même
     quand plus aucun écran n’est revenu avec une date sur cette fenêtre : le
     dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAvantDernierMois) return;
    if (ecransRepartisRetoursDatesAvantDernierMoisListe.length > 0) return;
    setCarnetEcransRetoursDatesAvantDernierMois(false);
  }, [
    carnetEcransRetoursDatesAvantDernierMois,
    ecransRepartisRetoursDatesAvantDernierMoisListe,
  ]);

  /* Le jeton des deux fenêtres fermées se lève de lui-même quand aucune des
     deux ne retient plus d’écran : le dépli ne reste pas vide sous un jeton
     sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesDeuxFenetres) return;
    if (ecransRepartisRetoursDatesDeuxFenetresListe.length > 0) return;
    setCarnetEcransRetoursDatesDeuxFenetres(false);
  }, [
    carnetEcransRetoursDatesDeuxFenetres,
    ecransRepartisRetoursDatesDeuxFenetresListe,
  ]);

  /* Le jeton des retours datés du trimestre se lève de lui-même quand plus
     aucun écran n’est revenu avec une date ces trois derniers mois : le dépli
     ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesTrimestre) return;
    if (ecransRepartisRetoursDatesTrimestreListe.length > 0) return;
    setCarnetEcransRetoursDatesTrimestre(false);
    setCarnetEcransRetoursDatesTrimestreFerme(false);
    setCarnetEcransRetoursDatesAnnee(false);
    setCarnetEcransRetoursDatesAnneeFermee(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeMoisEnCours(false);
    setCarnetEcransRetoursDatesDeuxMoisFermes(false);
  }, [
    carnetEcransRetoursDatesTrimestre,
    ecransRepartisRetoursDatesTrimestreListe,
  ]);

  /* Le jeton du trimestre fermé se lève de lui-même quand plus aucun écran
     n’est revenu avec une date sur les trois mois écoulés : le dépli ne reste
     pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesTrimestreFerme) return;
    if (ecransRepartisRetoursDatesTrimestreFermeListe.length > 0) return;
    setCarnetEcransRetoursDatesTrimestreFerme(false);
    setCarnetEcransRetoursDatesTrimestreFermeMoisDernier(false);
  }, [
    carnetEcransRetoursDatesTrimestreFerme,
    ecransRepartisRetoursDatesTrimestreFermeListe,
  ]);

  /* Le jeton qui compare le trimestre fermé au mois dernier se lève de
     lui-même quand les deux fenêtres n’ont plus aucun écran daté : le dépli ne
     reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesTrimestreFermeMoisDernier) return;
    if (
      ecransRepartisRetoursDatesTrimestreFermeMoisDernierListe.length > 0
    )
      return;
    setCarnetEcransRetoursDatesTrimestreFermeMoisDernier(false);
  }, [
    carnetEcransRetoursDatesTrimestreFermeMoisDernier,
    ecransRepartisRetoursDatesTrimestreFermeMoisDernierListe,
  ]);

  /* Le jeton des retours datés de l’année se lève de lui-même quand plus aucun
     écran n’est revenu avec une date sur les douze derniers mois : le dépli ne
     reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAnnee) return;
    if (ecransRepartisRetoursDatesAnneeListe.length > 0) return;
    setCarnetEcransRetoursDatesAnnee(false);
    setCarnetEcransRetoursDatesAnneeFermee(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeMoisEnCours(false);
    setCarnetEcransRetoursDatesDeuxMoisFermes(false);
  }, [carnetEcransRetoursDatesAnnee, ecransRepartisRetoursDatesAnneeListe]);

  /* Le jeton des retours datés de l’année fermée se lève de lui-même quand
     plus aucun écran n’est revenu avec une date sur les douze mois écoulés :
     le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAnneeFermee) return;
    if (ecransRepartisRetoursDatesAnneeFermeeListe.length > 0) return;
    setCarnetEcransRetoursDatesAnneeFermee(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeMoisEnCours(false);
    setCarnetEcransRetoursDatesDeuxMoisFermes(false);
  }, [
    carnetEcransRetoursDatesAnneeFermee,
    ecransRepartisRetoursDatesAnneeFermeeListe,
  ]);

  /* Le jeton qui compare l’année fermée au trimestre fermé se lève de
     lui-même quand les deux fenêtres n’ont plus aucun écran daté : le dépli ne
     reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAnneeFermeeTrimestreFerme) return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreFermeListe.length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeMoisEnCours(false);
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreFerme,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreFermeListe,
  ]);

  /* Le jeton qui compare l’année fermée au mois en cours se lève de lui-même
     quand les deux fenêtres n’ont plus aucun écran daté : le dépli ne reste
     pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAnneeFermeeMoisEnCours) return;
    if (ecransRepartisRetoursDatesAnneeFermeeMoisEnCoursListe.length > 0) return;
    setCarnetEcransRetoursDatesAnneeFermeeMoisEnCours(false);
  }, [
    carnetEcransRetoursDatesAnneeFermeeMoisEnCours,
    ecransRepartisRetoursDatesAnneeFermeeMoisEnCoursListe,
  ]);

  /* Le jeton qui compare le mois en cours et le mois dernier se lève de
     lui-même quand les deux fenêtres n’ont plus aucun écran daté : le dépli ne
     reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesMoisEnCoursMoisDernier) return;
    if (ecransRepartisRetoursDatesMoisEnCoursMoisDernierListe.length > 0) return;
    setCarnetEcransRetoursDatesMoisEnCoursMoisDernier(false);
  }, [
    carnetEcransRetoursDatesMoisEnCoursMoisDernier,
    ecransRepartisRetoursDatesMoisEnCoursMoisDernierListe,
  ]);

  /* Le jeton qui compare l’avant-dernier mois et le mois en cours se lève de
     lui-même quand les deux mois n’ont plus aucun écran daté : le dépli ne
     reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAvantDernierMoisMoisEnCours) return;
    if (ecransRepartisRetoursDatesAvantDernierMoisMoisEnCoursListe.length > 0) {
      return;
    }
    setCarnetEcransRetoursDatesAvantDernierMoisMoisEnCours(false);
  }, [
    carnetEcransRetoursDatesAvantDernierMoisMoisEnCours,
    ecransRepartisRetoursDatesAvantDernierMoisMoisEnCoursListe,
  ]);

  /* Le jeton qui compare le mois dernier et le trimestre en cours se lève de
     lui-même quand les deux fenêtres n’ont plus aucun écran daté : le dépli ne
     reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesMoisDernierTrimestre) return;
    if (ecransRepartisRetoursDatesMoisDernierTrimestreListe.length > 0) return;
    setCarnetEcransRetoursDatesMoisDernierTrimestre(false);
  }, [
    carnetEcransRetoursDatesMoisDernierTrimestre,
    ecransRepartisRetoursDatesMoisDernierTrimestreListe,
  ]);

  /* Le jeton qui compare l’année fermée au trimestre en cours se lève de
     lui-même quand les deux fenêtres n’ont plus aucun écran daté : le dépli ne
     reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAnneeFermeeTrimestre) return;
    if (ecransRepartisRetoursDatesAnneeFermeeTrimestreListe.length > 0) return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestre(false);
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestre,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreListe,
  ]);

  /* Le jeton de l’année fermée seule se lève de lui-même quand plus aucun
     écran n’est nommé par elle et par aucun autre jeton : le dépli ne reste
     pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAnneeFermeeSeule) return;
    if (ecransRepartisRetoursDatesAnneeFermeeSeuleListe.length > 0) return;
    setCarnetEcransRetoursDatesAnneeFermeeSeule(false);
  }, [
    carnetEcransRetoursDatesAnneeFermeeSeule,
    ecransRepartisRetoursDatesAnneeFermeeSeuleListe,
  ]);

  /* Le jeton de ce que le trimestre en cours ajoute seul se lève de lui-même
     quand il ne nomme plus aucun écran hors de l’année fermée : le dépli ne
     reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesTrimestreSeule) return;
    if (ecransRepartisRetoursDatesTrimestreSeuleListe.length > 0) return;
    setCarnetEcransRetoursDatesTrimestreSeule(false);
  }, [
    carnetEcransRetoursDatesTrimestreSeule,
    ecransRepartisRetoursDatesTrimestreSeuleListe,
  ]);

  /* Le jeton des deux additions réunies se lève de lui-même quand plus aucune
     des deux n’ajoute d’écran seul : le dépli ne reste pas vide sous un jeton
     sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAnneeFermeeTrimestreSeule) return;
    if (ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe.length > 0) return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeule(false);
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeule,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe,
  ]);

  /* Le jeton qui compare les deux milieux se lève de lui-même quand aucun
     écran des deux additions ne dépasse le milieu du lot réuni : le dépli ne
     reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse) return;
    if (ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe.length > 0)
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse(false);
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe,
  ]);

  /* Le jeton de la fenêtre la plus proche se lève de lui-même quand aucun
     écran du lot n’est revenu cette semaine : le dépli ne reste pas vide sous
     un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine) return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul(false);
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe,
  ]);

  /* Le jeton de l’avance de la semaine se lève de lui-même quand aucun écran
     de la semaine ne revient plus vite que le milieu du lot réuni : le dépli
     ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide)
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide(false);
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe,
  ]);

  /* Le jeton qui réunit la semaine rapide et le reste du lot se lève de
     lui-même quand plus aucun écran du lot n’est revenu : le dépli ne reste
     pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisListe,
  ]);

  /* Le jeton du reste du lot réuni se lève de lui-même quand la semaine
     rapide nomme déjà tout le lot : le dépli ne reste pas vide sous un jeton
     sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe,
  ]);

  /* Le jeton du reste revenu avant le milieu réuni se lève de lui-même quand
     plus aucun écran du reste ne devance ce milieu : le dépli ne reste pas
     vide sous un jeton sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe,
  ]);

  /* Le jeton réuni du reste se lève de lui-même quand le reste n’a plus aucun
     écran : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisListe,
  ]);

  /* Le jeton du reste revenu après le milieu se lève de lui-même quand plus
     aucun écran du reste ne le dépasse : le dépli ne reste pas vide sous un
     jeton sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuListe,
  ]);

  /* Le jeton réuni du reste — avant, milieu et après — se lève de lui-même
     quand le reste n’a plus aucun écran : le dépli ne reste pas vide sous un
     jeton sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisListe,
  ]);

  /* Le jeton du milieu exact se lève de lui-même quand plus aucun écran du
     reste ne tombe pile sur le milieu : le dépli ne reste pas vide sous un
     jeton sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe,
  ]);

  /* Le jeton qui réunit le reste avant le milieu et le milieu exact se lève de
     lui-même quand plus rien ne devance le milieu ni ne tombe dessus : le dépli
     ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuListe,
  ]);

  /* Le jeton du reste avant le milieu, resserré sur la semaine, se lève de
     lui-même quand plus aucun écran du reste n’y est revenu cette semaine : le
     dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineListe,
  ]);

  /* Le jeton qui réunit le reste avant le milieu de la semaine et le milieu
     exact se lève de lui-même quand plus rien n’y répond : le dépli ne reste
     pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuListe,
  ]);

  /* Le jeton du milieu exact resserré sur la semaine se lève de lui-même
     quand plus rien n’y répond : le dépli ne reste pas vide sous un jeton
     sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe,
  ]);

  /* Le jeton qui réunit le milieu exact de la semaine et le reste du milieu
     exact se lève de lui-même quand plus aucun écran ne tombe exactement sur
     le milieu : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteListe,
  ]);

  /* Le jeton du milieu exact resserré sur le mois se lève de lui-même quand
     plus rien n’y répond : le dépli ne reste pas vide sous un jeton sans
     objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe,
  ]);

  /* Le jeton qui réunit le milieu exact du mois et le reste hors mois se lève
     de lui-même quand plus aucun écran ne tombe exactement sur le milieu : le
     dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe,
  ]);

  /* Le jeton du milieu exact revenu hors du mois se lève de lui-même quand
     plus rien ne reste hors du mois : le dépli ne reste pas vide sous un jeton
     sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe,
  ]);

  /* Le jeton qui réunit le milieu exact de la semaine et celui resté hors du
     mois se lève de lui-même quand plus rien ne tombe ni dans la semaine ni
     hors du mois : le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (
      !carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine
    )
      return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineListe
        .length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine(
      false,
    );
  }, [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine,
    ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineListe,
  ]);

  /* Le jeton des deux derniers mois fermés se lève de lui-même quand les deux
     fenêtres n’ont plus aucun écran daté : le dépli ne reste pas vide sous un
     jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesDeuxMoisFermes) return;
    if (ecransRepartisRetoursDatesDeuxMoisFermesListe.length > 0) return;
    setCarnetEcransRetoursDatesDeuxMoisFermes(false);
  }, [
    carnetEcransRetoursDatesDeuxMoisFermes,
    ecransRepartisRetoursDatesDeuxMoisFermesListe,
  ]);

  /* Le jeton qui compare l’avant-dernier mois et le mois dernier se lève de
     lui-même quand plus aucun écran n’est revenu sur ces deux mois : le dépli
     ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAvantDernierMoisMoisDernier) return;
    if (ecransRepartisRetoursDatesAvantDernierMoisMoisDernierListe.length > 0)
      return;
    setCarnetEcransRetoursDatesAvantDernierMoisMoisDernier(false);
  }, [
    carnetEcransRetoursDatesAvantDernierMoisMoisDernier,
    ecransRepartisRetoursDatesAvantDernierMoisMoisDernierListe,
  ]);

  /* Le jeton qui compare le mois dernier et le trimestre fermé se lève de
     lui-même quand plus aucun écran n’est revenu sur ces deux fenêtres : le
     dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesMoisDernierTrimestreFerme) return;
    if (ecransRepartisRetoursDatesMoisDernierTrimestreFermeListe.length > 0)
      return;
    setCarnetEcransRetoursDatesMoisDernierTrimestreFerme(false);
  }, [
    carnetEcransRetoursDatesMoisDernierTrimestreFerme,
    ecransRepartisRetoursDatesMoisDernierTrimestreFermeListe,
  ]);

  /* Le jeton qui compare l’avant-dernier mois et le trimestre fermé se lève
     de lui-même quand plus aucun écran n’est revenu sur ces deux fenêtres : le
     dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAvantDernierMoisTrimestreFerme) return;
    if (
      ecransRepartisRetoursDatesAvantDernierMoisTrimestreFermeListe.length > 0
    )
      return;
    setCarnetEcransRetoursDatesAvantDernierMoisTrimestreFerme(false);
  }, [
    carnetEcransRetoursDatesAvantDernierMoisTrimestreFerme,
    ecransRepartisRetoursDatesAvantDernierMoisTrimestreFermeListe,
  ]);

  /* Le jeton qui compare l’année fermée et le mois dernier se lève de lui-même
     quand plus aucun écran n’est revenu sur ces deux fenêtres : le dépli ne
     reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAnneeFermeeMoisDernier) return;
    if (ecransRepartisRetoursDatesAnneeFermeeMoisDernierListe.length > 0) return;
    setCarnetEcransRetoursDatesAnneeFermeeMoisDernier(false);
  }, [
    carnetEcransRetoursDatesAnneeFermeeMoisDernier,
    ecransRepartisRetoursDatesAnneeFermeeMoisDernierListe,
  ]);

  /* Le jeton qui compare l’année fermée et l’avant-dernier mois se lève de
     lui-même quand plus aucun écran n’est revenu sur ces deux fenêtres : le
     dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesAnneeFermeeAvantDernierMois) return;
    if (
      ecransRepartisRetoursDatesAnneeFermeeAvantDernierMoisListe.length > 0
    )
      return;
    setCarnetEcransRetoursDatesAnneeFermeeAvantDernierMois(false);
  }, [
    carnetEcransRetoursDatesAnneeFermeeAvantDernierMois,
    ecransRepartisRetoursDatesAnneeFermeeAvantDernierMoisListe,
  ]);

  /* Le jeton qui compare le trimestre fermé et l’avant-dernier mois se lève
     de lui-même quand plus aucun écran n’est revenu sur ces deux fenêtres :
     le dépli ne reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesTrimestreFermeAvantDernierMois) return;
    if (
      ecransRepartisRetoursDatesTrimestreFermeAvantDernierMoisListe.length > 0
    )
      return;
    setCarnetEcransRetoursDatesTrimestreFermeAvantDernierMois(false);
    setCarnetEcransRetoursDatesTrimestreFermeAnneeFerme(false);
  }, [
    carnetEcransRetoursDatesTrimestreFermeAvantDernierMois,
    ecransRepartisRetoursDatesTrimestreFermeAvantDernierMoisListe,
  ]);

  /* Le jeton qui compare le trimestre fermé et l’année fermée se lève de
     lui-même quand les deux fenêtres n’ont plus aucun écran daté : le dépli ne
     reste pas vide sous un jeton sans objet. */
  useEffect(() => {
    if (!carnetEcransRetoursDatesTrimestreFermeAnneeFerme) return;
    if (
      ecransRepartisRetoursDatesTrimestreFermeAnneeFermeListe.length > 0
    )
      return;
    setCarnetEcransRetoursDatesTrimestreFermeAnneeFerme(false);
  }, [
    carnetEcransRetoursDatesTrimestreFermeAnneeFerme,
    ecransRepartisRetoursDatesTrimestreFermeAnneeFermeListe,
  ]);

  /* Un écran retenu qui ne laisse plus aucun geste se lève de lui-même : le
     carnet ne reste pas resserré sur un écran qui n’a plus rien à montrer. */
  useEffect(() => {
    if (carnetEcran === null) return;
    if (journalEcran.length > 0) return;
    setCarnetEcran(null);
  }, [carnetEcran, journalEcran]);

  useEffect(() => {
    if (!oublisEmporte) return undefined;
    const timer = window.setTimeout(() => setOublisEmporte(false), 4000);
    return () => window.clearTimeout(timer);
  }, [oublisEmporte]);

  useEffect(() => {
    setChantierSeul(chantierFocus ?? null);
  }, [chantierFocus]);

  /* Le rappel est rejoint une fois l'onglet rendu : on arrive sur le chantier
     nommé, pas au début d'une page longue. */
  useEffect(() => {
    if (!chantierFocus) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById('suivi-part')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 240);
    return () => window.clearTimeout(timer);
  }, [chantierFocus]);

  const chantiersVus = chantierSeul
    ? SUIVI_CHANTIERS.filter((chantier) => chantier.nom === chantierSeul)
    : SUIVI_CHANTIERS;

  useEffect(() => {
    if (!telecharge) return undefined;
    const timer = window.setTimeout(() => setTelecharge(false), 4000);
    return () => window.clearTimeout(timer);
  }, [telecharge]);

  useEffect(() => {
    if (!manqueEmporte) return undefined;
    const timer = window.setTimeout(() => setManqueEmporte(false), 4000);
    return () => window.clearTimeout(timer);
  }, [manqueEmporte]);

  useEffect(() => {
    if (!chantierEmporte) return undefined;
    const timer = window.setTimeout(() => setChantierEmporte(false), 4000);
    return () => window.clearTimeout(timer);
  }, [chantierEmporte]);

  /* Une gomme armée qui n'est pas confirmée se désarme d'elle-même : le
     second appui ne reste pas à portée pour un geste distrait. */
  useEffect(() => {
    if (!gommeArmee) return undefined;
    const timer = window.setTimeout(() => setGommeArmee(false), 5000);
    return () => window.clearTimeout(timer);
  }, [gommeArmee]);

  /* Une gomme de chantier armée qui n'est pas confirmée se désarme d'elle-même,
     comme celle de la ligne entière. */
  useEffect(() => {
    if (!gommeChantier) return undefined;
    const timer = window.setTimeout(() => setGommeChantier(null), 5000);
    return () => window.clearTimeout(timer);
  }, [gommeChantier]);

  /* Une gomme du compteur armée qui n'est pas confirmée se désarme d'elle-même,
     comme les autres gommes de l'onglet. */
  useEffect(() => {
    if (!modulesGomme) return undefined;
    const timer = window.setTimeout(() => setModulesGomme(false), 5000);
    return () => window.clearTimeout(timer);
  }, [modulesGomme]);

  /* Une gomme de ligne du tableau armée qui n'est pas confirmée se désarme
     d'elle-même, comme les autres gommes de l'onglet. */
  useEffect(() => {
    if (!gommeModule) return undefined;
    const timer = window.setTimeout(() => setGommeModule(null), 5000);
    return () => window.clearTimeout(timer);
  }, [gommeModule]);

  const onTelecharger = () => {
    try {
      telechargerPlan(null, lang);
      const at = markTelechargement(null);
      setMemoire((prev) => ({ ...prev, [cleTelechargement(null)]: at }));
      setTelecharge(true);
    } catch {
      /* Un navigateur qui refuse le téléchargement laisse l'écran intact. */
      setTelecharge(false);
    }
  };

  const onTelechargerChantier = () => {
    if (!chantierSeul) return;
    try {
      telechargerPlan(chantierSeul, lang);
      const at = markTelechargement(chantierSeul);
      setMemoire((prev) => ({ ...prev, [cleTelechargement(chantierSeul)]: at }));
      setChantierEmporte(true);
    } catch {
      setChantierEmporte(false);
    }
  };

  /* Un appui sur une ligne numérotée emporte la pièce de ce chantier-là, d'un
     même geste : le fichier part, la mémoire du poste le retient, et la ligne
     quitte la liste des pièces encore à joindre. */
  const onTelechargerPiece = (nom: string) => {
    try {
      telechargerPlan(nom, lang);
      const at = markTelechargement(nom);
      setMemoire((prev) => ({ ...prev, [cleTelechargement(nom)]: at }));
      setPieceEmportee(nom);
    } catch {
      setPieceEmportee(null);
    }
  };

  /* Un appui sur un module de la liste du cap le marque comme descendu sur
     cet appareil : le petit compteur du bloc suit la même mémoire. */
  const onDescendreModule = (nom: string) => {
    setModulesAtteints(markModuleAtteint(nom));
    setModulesAtteintsLe(readModulesAtteintsLe());
    setModulesDates(readModulesAtteintsDates());
  };

  /* Les lignes retenues par le jeton, copiées avec le nom de leur écran — et,
     pour celles déjà empruntées, le jour de la visite : le message situe le
     lot avant que le destinataire ne l'ouvre. */
  const onCopierReste = async () => {
    const lignes = resteAvecPorte.map((item) => {
      const porte = portesResteTable[item.texte];
      const vuLe = porte ? vues[porte.lien] ?? null : null;
      return (vuLe ? t('ad.suivi.resteCopyLineUsed') : t('ad.suivi.resteCopyLine'))
        .replace('{texte}', item.texte)
        .replace('{ecran}', porte?.ecran ?? '')
        .replace('{date}', vuLe ? jour(vuLe, lang) : '');
    });
    const texte = [
      /* L'en-tête porte le nom du lot ; quand des visites ont été rendues
         depuis cet appareil, leur compte s'y ajoute, pour que le destinataire
         sache ce qui a été oublié. */
      (oublis.total > 0
        ? t('ad.suivi.resteCopyHeadOublis')
            .replace('{n}', String(resteAvecPorte.length))
            .replace('{oublis}', String(oublis.total))
        : t('ad.suivi.resteCopyHead').replace('{n}', String(resteAvecPorte.length))),
      ...lignes,
    ].join('\n');
    let ok = false;
    try {
      await navigator.clipboard.writeText(texte);
      ok = true;
    } catch {
      /* Un navigateur qui refuse le presse-papiers laisse les lignes lisibles
         à l'écran : la phrase le dit, rien n'est perdu. */
      ok = false;
    }
    setResteCopie(ok ? 'ok' : 'fail');
    /* La copie porte sur ce que le jeton retient : le jeton se pose donc, et
       l'écran montre exactement ce qui vient de partir. */
    if (ok) setResteFiltre('portes');
  };

  /* Le carnet des visites rendues, emporté en CSV : une ligne par porte
     oubliée, avec son écran et le jour du geste. */
  const onTelechargerOublis = () => {
    try {
      telechargerOublisPortes(lang, jetonsPoses);
      setOublisEmporte(true);
    } catch {
      setOublisEmporte(false);
    }
  };

  /* Le retrait d’un seul écran du carnet : ses gestes partent un à un, sur
     le carnet de cet appareil. La petite gomme du dépli et le second appui
     sur son nom font le même geste, et rien d’autre ne bouge — ni les
     visites retenues, ni le plan. */
  const retirerEcranCarnet = (nom: string, parNom = false) => {
    const gestes = oublis.journal.filter(
      (geste) => (geste.ecran || geste.lien) === nom,
    );
    let carnet = oublis;
    gestes.forEach((geste) => {
      carnet = removeOubliPorte(geste.lien, geste.date);
    });
    /* Un second appui sur le nom laisse sa trace, une fois les gestes partis :
       l'intitulé du tri dit combien d'écrans ont quitté le carnet par ce chemin. */
    if (parNom && gestes.length > 0) markEcranRetireNom(nom);
    setOublis(carnet);
    setCarnetEcran(null);
    setResteOublie(
      t('ad.suivi.doorOublisEcranGommeDone')
        .replace('{ecran}', nom)
        .replace('{n}', String(gestes.length)),
    );
  };

  /* La petite gomme du carnet : elle remet le compte et son journal à zéro,
     sans toucher aux visites retenues — les repères de ligne restent. */
  const onGommerOublis = () => {
    setOublis(clearOublisPortes());
    setCarnetEcran(null);
    setCarnetChantier(null);
    setCarnetSemaine(false);
    setCarnetEcransDeplies(false);
    setCarnetEcransFourni(false);
    setCarnetEcransRelire(false);
    setCarnetEcransVieux(false);
    setCarnetEcransRetour(false);
    setCarnetEcransRetiresPlusieurs(false);
    setCarnetEcransRetourDeux(false);
    setCarnetEcransRepartis(false);
    setCarnetEcransRepartisVieux(false);
    setCarnetEcransRepartisMois(false);
    setCarnetEcransRepartisSemaine(false);
    setCarnetEcransRepartisJour(false);
    setCarnetEcransRepartisHier(false);
    setCarnetEcransRepartisAvantHier(false);
    setCarnetEcransRepartisQuinzaine(false);
    setCarnetEcransRepartisQuinzaineRevenus(false);
    setCarnetEcransRepartisQuinzaineJamais(false);
    setCarnetEcransRepartisQuinzaineSemaine(false);
    setCarnetEcransRepartisQuinzaineTardifs(false);
    setCarnetEcransRepartisQuinzaineRapides(false);
    setCarnetEcransRepartisQuinzaineSansRetour(false);
    setCarnetEcransRepartisHorsQuinzaine(false);
    setCarnetEcransAucunRetour(false);
    setCarnetEcransRetoursDates(false);
    setCarnetEcransRepartisQuinzaineReunis(false);
    setCarnetEcransRetoursDatesSemaine(false);
    setCarnetEcransRetoursDatesMois(false);
    setCarnetEcransRetoursDatesMoisDernier(false);
    setCarnetEcransRetoursDatesAvantDernierMois(false);
    setCarnetEcransRetoursDatesDeuxFenetres(false);
    setCarnetEcransRetoursDatesTrimestre(false);
    setCarnetEcransRetoursDatesTrimestreFerme(false);
    setCarnetEcransRetoursDatesTrimestreFermeMoisDernier(false);
    setCarnetEcransRetoursDatesAnnee(false);
    setCarnetEcransRetoursDatesAnneeFermee(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeMoisEnCours(false);
    setCarnetEcransRetoursDatesMoisEnCoursMoisDernier(false);
    setCarnetEcransRetoursDatesAvantDernierMoisMoisEnCours(false);
    setCarnetEcransRetoursDatesMoisDernierTrimestre(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestre(false);
    setCarnetEcransRetoursDatesDeuxMoisFermes(false);
    setCarnetEcransRetoursDatesAvantDernierMoisMoisDernier(false);
    setCarnetEcransRetoursDatesTrimestreFermeAvantDernierMois(false);
    setCarnetEcransRetoursDatesTrimestreFermeAnneeFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeSeule(false);
    setCarnetEcransRetoursDatesTrimestreSeule(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeule(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul(false);
    setResteOublie(t('ad.suivi.doorOublisCleared'));
  };

  /* La gomme des jetons : elle les éteint tous d’un geste et rend la liste
     entière, sans retirer un seul oubli du carnet. */
  const onEteindreJetons = () => {
    const n = jetonsPoses;
    setCarnetEcran(null);
    setCarnetChantier(null);
    setCarnetSemaine(false);
    setCarnetEcransDeplies(false);
    setCarnetEcransFourni(false);
    setCarnetEcransRelire(false);
    setCarnetEcransVieux(false);
    setCarnetEcransRetour(false);
    setCarnetEcransRetiresPlusieurs(false);
    setCarnetEcransRetourDeux(false);
    setCarnetEcransRepartis(false);
    setCarnetEcransRepartisVieux(false);
    setCarnetEcransRepartisMois(false);
    setCarnetEcransRepartisSemaine(false);
    setCarnetEcransRepartisJour(false);
    setCarnetEcransRepartisHier(false);
    setCarnetEcransRepartisAvantHier(false);
    setCarnetEcransRepartisQuinzaine(false);
    setCarnetEcransRepartisQuinzaineRevenus(false);
    setCarnetEcransRepartisQuinzaineJamais(false);
    setCarnetEcransRepartisQuinzaineSemaine(false);
    setCarnetEcransRepartisQuinzaineTardifs(false);
    setCarnetEcransRepartisQuinzaineRapides(false);
    setCarnetEcransRepartisQuinzaineSansRetour(false);
    setCarnetEcransRepartisHorsQuinzaine(false);
    setCarnetEcransAucunRetour(false);
    setCarnetEcransRetoursDates(false);
    setCarnetEcransRepartisQuinzaineReunis(false);
    setCarnetEcransRetoursDatesSemaine(false);
    setCarnetEcransRetoursDatesMois(false);
    setCarnetEcransRetoursDatesMoisDernier(false);
    setCarnetEcransRetoursDatesAvantDernierMois(false);
    setCarnetEcransRetoursDatesDeuxFenetres(false);
    setCarnetEcransRetoursDatesTrimestre(false);
    setCarnetEcransRetoursDatesTrimestreFerme(false);
    setCarnetEcransRetoursDatesTrimestreFermeMoisDernier(false);
    setCarnetEcransRetoursDatesAnnee(false);
    setCarnetEcransRetoursDatesAnneeFermee(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeMoisEnCours(false);
    setCarnetEcransRetoursDatesMoisEnCoursMoisDernier(false);
    setCarnetEcransRetoursDatesAvantDernierMoisMoisEnCours(false);
    setCarnetEcransRetoursDatesMoisDernierTrimestre(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestre(false);
    setCarnetEcransRetoursDatesDeuxMoisFermes(false);
    setCarnetEcransRetoursDatesMoisDernierTrimestreFerme(false);
    setCarnetEcransRetoursDatesAvantDernierMoisTrimestreFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeMoisDernier(false);
    setCarnetEcransRetoursDatesAnneeFermeeAvantDernierMois(false);
    setCarnetEcransRetoursDatesAvantDernierMoisMoisDernier(false);
    setCarnetEcransRetoursDatesTrimestreFermeAvantDernierMois(false);
    setCarnetEcransRetoursDatesTrimestreFermeAnneeFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeSeule(false);
    setCarnetEcransRetoursDatesTrimestreSeule(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeule(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul(false);
    setResteOublie(t('ad.suivi.doorOublisJetonsCleared').replace('{n}', String(n)));
  };

  /* Les jetons du dépli qui resserrent la vue des écrans, comptés ensemble :
     la petite gomme les éteint d'un seul geste et rend tous les écrans. */
  const jetonsDepli =
    (carnetEcransRelire ? 1 : 0) +
    (carnetEcransVieux ? 1 : 0) +
    (carnetEcransRetour ? 1 : 0) +
    (carnetEcransRetiresPlusieurs ? 1 : 0) +
    (carnetEcransRetourDeux ? 1 : 0) +
    (carnetEcransRepartis ||
    carnetEcransRepartisVieux ||
    carnetEcransRepartisMois ||
    carnetEcransRepartisSemaine ||
    carnetEcransRepartisJour ||
    carnetEcransRepartisHier ||
    carnetEcransRepartisAvantHier ||
    carnetEcransRepartisQuinzaine ||
    carnetEcransRepartisQuinzaineRevenus ||
    carnetEcransRepartisQuinzaineTardifs ||
    carnetEcransRepartisQuinzaineJamais ||
    carnetEcransRepartisQuinzaineRapides ||
    carnetEcransRepartisQuinzaineReunis ||
    carnetEcransRepartisQuinzaineSansRetour ||
    carnetEcransRepartisHorsQuinzaine ||
    carnetEcransAucunRetour ||
    carnetEcransRetoursDates ||
    carnetEcransRetoursDatesSemaine ||
    carnetEcransRetoursDatesMois ||
    carnetEcransRetoursDatesMoisDernier ||
    carnetEcransRetoursDatesAvantDernierMois ||
    carnetEcransRetoursDatesDeuxFenetres ||
    carnetEcransRetoursDatesTrimestre ||
    carnetEcransRetoursDatesTrimestreFerme ||
    carnetEcransRetoursDatesTrimestreFermeMoisDernier ||
    carnetEcransRetoursDatesAnnee ||
    carnetEcransRetoursDatesAnneeFermee ||
    carnetEcransRetoursDatesDeuxMoisFermes ||
    carnetEcransRetoursDatesMoisDernierTrimestreFerme ||
    carnetEcransRetoursDatesAvantDernierMoisTrimestreFerme ||
    carnetEcransRetoursDatesAnneeFermeeMoisDernier ||
    carnetEcransRetoursDatesAnneeFermeeAvantDernierMois ||
    carnetEcransRetoursDatesTrimestreFermeAvantDernierMois ||
    carnetEcransRetoursDatesTrimestreFermeAnneeFerme ||
    carnetEcransRetoursDatesAnneeFermeeMoisEnCours ||
    carnetEcransRetoursDatesMoisEnCoursMoisDernier ||
    carnetEcransRetoursDatesAvantDernierMoisMoisEnCours ||
    carnetEcransRetoursDatesMoisDernierTrimestre ||
    carnetEcransRetoursDatesAnneeFermeeTrimestre ||
    carnetEcransRetoursDatesAnneeFermeeSeule ||
    carnetEcransRetoursDatesTrimestreSeule ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeule ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine ||
    carnetEcransRepartisQuinzaineSemaine ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis
      ? 1
      : 0);

  /* Ce que chaque jeton du dépli retient, compté sur sa propre liste : le
     survol de la petite gomme le dit jeton par jeton, pour choisir lequel
     éteindre plutôt que de les perdre tous d'un même geste. Un jeton dont le
     libellé porte déjà son compte n'est pas recompté deux fois. */
  const jetonsDepliDetail = [
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
              .length,
          ),
        )
      : '',
    carnetEcransRelire
      ? t('ad.suivi.doorOublisEcransRelire').replace('{n}', String(ecransPlusieurs.length))
      : '',
    carnetEcransVieux
      ? t('ad.suivi.doorOublisEcransVieux').replace('{n}', String(ecransVieux.length))
      : '',
    carnetEcransRetour
      ? t('ad.suivi.doorOublisEcransRetour').replace('{n}', String(ecransRetournes.length))
      : '',
    carnetEcransRetiresPlusieurs
      ? t('ad.suivi.doorOublisEcransRetiresPlusieurs').replace(
          '{n}',
          String(ecransRetiresPlusieursListe.length),
        )
      : '',
    carnetEcransRetourDeux
      ? t('ad.suivi.doorOublisEcransRetourDeux').replace(
          '{n}',
          String(ecransRetourDeuxListe.length),
        )
      : '',
    carnetEcransRepartis
      ? t('ad.suivi.doorOublisEcransRepartis').replace(
          '{n}',
          String(ecransRepartisListe.length),
        )
      : '',
    carnetEcransRepartisVieux
      ? t('ad.suivi.doorOublisEcransRepartisVieux').replace(
          '{n}',
          String(ecransRepartisVieuxListe.length),
        )
      : '',
    carnetEcransRepartisMois
      ? t('ad.suivi.doorOublisEcransRepartisMois').replace(
          '{n}',
          String(ecransRepartisMoisListe.length),
        )
      : '',
    carnetEcransRepartisSemaine
      ? t('ad.suivi.doorOublisEcransRepartisSemaine').replace(
          '{n}',
          String(ecransRepartisSemaineListe.length),
        )
      : '',
    carnetEcransRepartisJour
      ? t('ad.suivi.doorOublisEcransRepartisJour').replace(
          '{n}',
          String(ecransRepartisJourListe.length),
        )
      : '',
    carnetEcransRepartisHier
      ? t('ad.suivi.doorOublisEcransRepartisHier').replace(
          '{n}',
          String(ecransRepartisHierListe.length),
        )
      : '',
    carnetEcransRepartisAvantHier
      ? t('ad.suivi.doorOublisEcransRepartisAvantHier').replace(
          '{n}',
          String(ecransRepartisAvantHierListe.length),
        )
      : '',
    carnetEcransRepartisQuinzaine
      ? t('ad.suivi.doorOublisEcransRepartisQuinzaine').replace(
          '{n}',
          String(ecransRepartisQuinzaineListe.length),
        )
      : '',
    carnetEcransRepartisQuinzaineRevenus
      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenus').replace(
          '{n}',
          String(ecransRepartisQuinzaineRevenusListe.length),
        )
      : '',
    carnetEcransRepartisQuinzaineJamais
      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineJamais').replace(
          '{n}',
          String(ecransRepartisQuinzaineJamaisListe.length),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeSeule
      ? t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeule').replace(
          '{n}',
          String(ecransRepartisRetoursDatesAnneeFermeeSeuleListe.length),
        )
      : '',
    carnetEcransRetoursDatesTrimestreSeule
      ? t('ad.suivi.doorOublisEcransRetoursDatesTrimestreSeule').replace(
          '{n}',
          String(ecransRepartisRetoursDatesTrimestreSeuleListe.length),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeule
      ? t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeule').replace(
          '{n}',
          String(ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe.length),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuListe
              .length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisListe
              .length,
          ),
        )
      : '',
    carnetEcransRepartisQuinzaineSemaine
      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineSemaine').replace(
          '{n}',
          String(ecransRepartisQuinzaineSemaineListe.length),
        )
      : '',
    carnetEcransRepartisQuinzaineTardifs
      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineTardifs').replace(
          '{n}',
          String(ecransRepartisQuinzaineTardifsListe.length),
        )
      : '',
    carnetEcransRepartisQuinzaineRapides
      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineRapides').replace(
          '{n}',
          String(ecransRepartisQuinzaineRapidesListe.length),
        )
      : '',
    carnetEcransRepartisQuinzaineReunis
      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineReunis').replace(
          '{n}',
          String(ecransRepartisQuinzaineReunisListe.length),
        )
      : '',
    carnetEcransRepartisQuinzaineSansRetour
      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineSansRetour').replace(
          '{n}',
          String(ecransRepartisQuinzaineSansRetourListe.length),
        )
      : '',
    carnetEcransRepartisHorsQuinzaine
      ? t('ad.suivi.doorOublisEcransRepartisHorsQuinzaine').replace(
          '{n}',
          String(ecransRepartisHorsQuinzaineListe.length),
        )
      : '',
    /* Les deux jetons jumeaux — « Aucun retour daté » et « Retours datés » —
       comptés ensemble dès que l’un des deux est posé : les deux chiffres se
       lisent côte à côte, pour choisir lequel éteindre plutôt que de les
       perdre tous d’un même geste. */
    carnetEcransAucunRetour || carnetEcransRetoursDates
      ? t('ad.suivi.doorOublisEcransJumeaux')
          .replace('{a}', String(ecransRepartisAucunRetourListe.length))
          .replace('{b}', String(ecransRepartisRetoursDatesListe.length))
      : '',
    carnetEcransRetoursDatesSemaine
      ? t('ad.suivi.doorOublisEcransRetoursDatesSemaine').replace(
          '{n}',
          String(ecransRepartisRetoursDatesSemaineListe.length),
        )
      : '',
    carnetEcransRetoursDatesMois
      ? t('ad.suivi.doorOublisEcransRetoursDatesMois').replace(
          '{n}',
          String(ecransRepartisRetoursDatesMoisListe.length),
        )
      : '',
    carnetEcransRetoursDatesMoisDernier
      ? t('ad.suivi.doorOublisEcransRetoursDatesMoisDernier').replace(
          '{n}',
          String(ecransRepartisRetoursDatesMoisDernierListe.length),
        )
      : '',
    carnetEcransRetoursDatesAvantDernierMois
      ? t('ad.suivi.doorOublisEcransRetoursDatesAvantDernierMois').replace(
          '{n}',
          String(ecransRepartisRetoursDatesAvantDernierMoisListe.length),
        )
      : '',
    carnetEcransRetoursDatesDeuxFenetres
      ? t('ad.suivi.doorOublisEcransRetoursDatesDeuxFenetres').replace(
          '{n}',
          String(ecransRepartisRetoursDatesDeuxFenetresListe.length),
        )
      : '',
    carnetEcransRetoursDatesTrimestre
      ? t('ad.suivi.doorOublisEcransRetoursDatesTrimestre').replace(
          '{n}',
          String(ecransRepartisRetoursDatesTrimestreListe.length),
        )
      : '',
    carnetEcransRetoursDatesTrimestreFerme
      ? t('ad.suivi.doorOublisEcransRetoursDatesTrimestreFerme').replace(
          '{n}',
          String(ecransRepartisRetoursDatesTrimestreFermeListe.length),
        )
      : '',
    carnetEcransRetoursDatesTrimestreFermeMoisDernier
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernier',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesTrimestreFermeMoisDernierListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnnee
      ? t('ad.suivi.doorOublisEcransRetoursDatesAnnee').replace(
          '{n}',
          String(ecransRepartisRetoursDatesAnneeListe.length),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermee
      ? t('ad.suivi.doorOublisEcransRetoursDatesAnneeFermee').replace(
          '{n}',
          String(ecransRepartisRetoursDatesAnneeFermeeListe.length),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestreFerme
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFerme',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreFermeListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesDeuxMoisFermes
      ? t('ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermes').replace(
          '{n}',
          String(ecransRepartisRetoursDatesDeuxMoisFermesListe.length),
        )
      : '',
    carnetEcransRetoursDatesAvantDernierMoisMoisDernier
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernier',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAvantDernierMoisMoisDernierListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesMoisDernierTrimestreFerme
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFerme',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesMoisDernierTrimestreFermeListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAvantDernierMoisTrimestreFerme
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFerme',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAvantDernierMoisTrimestreFermeListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeMoisDernier
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernier',
        ).replace(
          '{n}',
          String(ecransRepartisRetoursDatesAnneeFermeeMoisDernierListe.length),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeAvantDernierMois
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMois',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeAvantDernierMoisListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesTrimestreFermeAvantDernierMois
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMois',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesTrimestreFermeAvantDernierMoisListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesTrimestreFermeAnneeFerme
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFerme',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesTrimestreFermeAnneeFermeListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeMoisEnCours
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCours',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeMoisEnCoursListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesMoisEnCoursMoisDernier
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernier',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesMoisEnCoursMoisDernierListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAvantDernierMoisMoisEnCours
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCours',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAvantDernierMoisMoisEnCoursListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesMoisDernierTrimestre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestre',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesMoisDernierTrimestreListe.length,
          ),
        )
      : '',
    carnetEcransRetoursDatesAnneeFermeeTrimestre
      ? t(
          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestre',
        ).replace(
          '{n}',
          String(
            ecransRepartisRetoursDatesAnneeFermeeTrimestreListe.length,
          ),
        )
      : '',
  ]
    .filter(Boolean)
    .join(' · ');

  /* Les lignes du dépli que la petite gomme rendra à la vue : le dépli
     resserré sur les écrans repartis ne montre aucune ligne du carnet, elle
     les rend donc toutes ; ailleurs, elle rend celles que les jetons
     écartent. Le survol l’annonce avant l’appui. */
  const lignesRendues =
    carnetEcransRepartis ||
    carnetEcransRepartisVieux ||
    carnetEcransRepartisMois ||
    carnetEcransRepartisSemaine ||
    carnetEcransRepartisJour ||
    carnetEcransRepartisHier ||
    carnetEcransRepartisAvantHier ||
    carnetEcransRepartisQuinzaine ||
    carnetEcransRepartisQuinzaineRevenus ||
    carnetEcransRepartisQuinzaineTardifs ||
    carnetEcransRepartisQuinzaineJamais ||
    carnetEcransRepartisQuinzaineRapides ||
    carnetEcransRepartisQuinzaineReunis ||
    carnetEcransRepartisQuinzaineSansRetour ||
    carnetEcransRepartisHorsQuinzaine ||
    carnetEcransAucunRetour ||
    carnetEcransRetoursDates ||
    carnetEcransRetoursDatesSemaine ||
    carnetEcransRetoursDatesMois ||
    carnetEcransRetoursDatesMoisDernier ||
    carnetEcransRetoursDatesAvantDernierMois ||
    carnetEcransRetoursDatesDeuxFenetres ||
    carnetEcransRetoursDatesTrimestre ||
    carnetEcransRetoursDatesTrimestreFerme ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreFerme ||
    carnetEcransRetoursDatesAnneeFermeeMoisEnCours ||
    carnetEcransRetoursDatesAvantDernierMoisMoisEnCours ||
    carnetEcransRetoursDatesDeuxMoisFermes ||
    carnetEcransRetoursDatesMoisDernierTrimestreFerme ||
    carnetEcransRetoursDatesAvantDernierMoisTrimestreFerme ||
    carnetEcransRetoursDatesAnneeFermeeMoisDernier ||
    carnetEcransRetoursDatesAnneeFermeeAvantDernierMois ||
    carnetEcransRetoursDatesTrimestreFermeAvantDernierMois ||
    carnetEcransRetoursDatesAvantDernierMoisMoisDernier ||
    carnetEcransRetoursDatesAnnee ||
    carnetEcransRetoursDatesAnneeFermeeSeule ||
    carnetEcransRetoursDatesTrimestreSeule ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeule ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis ||
    carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine ||
    carnetEcransRepartisQuinzaineSemaine
      ? ecransCarnet.length
      : Math.max(0, ecransCarnet.length - ecransAffiches.length);

  /* La petite gomme du dépli : elle ne retire aucun oubli — elle éteint les
     seuls jetons qui resserrent la vue et rend les écrans du carnet, tous à
     la fois. Les jetons du carnet, eux, restent posés. */
  const onRendreTousEcrans = () => {
    setCarnetEcransRelire(false);
    setCarnetEcransVieux(false);
    setCarnetEcransRetour(false);
    setCarnetEcransRetiresPlusieurs(false);
    setCarnetEcransRetourDeux(false);
    setCarnetEcransRepartis(false);
    setCarnetEcransRepartisVieux(false);
    setCarnetEcransRepartisMois(false);
    setCarnetEcransRepartisSemaine(false);
    setCarnetEcransRepartisJour(false);
    setCarnetEcransRepartisHier(false);
    setCarnetEcransRepartisAvantHier(false);
    setCarnetEcransRepartisQuinzaine(false);
    setCarnetEcransRepartisQuinzaineRevenus(false);
    setCarnetEcransRepartisQuinzaineJamais(false);
    setCarnetEcransRepartisQuinzaineSemaine(false);
    setCarnetEcransRepartisQuinzaineTardifs(false);
    setCarnetEcransRepartisQuinzaineRapides(false);
    setCarnetEcransRepartisQuinzaineSansRetour(false);
    setCarnetEcransRepartisHorsQuinzaine(false);
    setCarnetEcransAucunRetour(false);
    setCarnetEcransRetoursDates(false);
    setCarnetEcransRepartisQuinzaineReunis(false);
    setCarnetEcransRetoursDatesSemaine(false);
    setCarnetEcransRetoursDatesMois(false);
    setCarnetEcransRetoursDatesMoisDernier(false);
    setCarnetEcransRetoursDatesAvantDernierMois(false);
    setCarnetEcransRetoursDatesDeuxFenetres(false);
    setCarnetEcransRetoursDatesTrimestre(false);
    setCarnetEcransRetoursDatesTrimestreFerme(false);
    setCarnetEcransRetoursDatesAnnee(false);
    setCarnetEcransRetoursDatesAnneeFermee(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeMoisEnCours(false);
    setCarnetEcransRetoursDatesMoisEnCoursMoisDernier(false);
    setCarnetEcransRetoursDatesAvantDernierMoisMoisEnCours(false);
    setCarnetEcransRetoursDatesMoisDernierTrimestre(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestre(false);
    setCarnetEcransRetoursDatesDeuxMoisFermes(false);
    setCarnetEcransRetoursDatesMoisDernierTrimestreFerme(false);
    setCarnetEcransRetoursDatesAvantDernierMoisTrimestreFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeMoisDernier(false);
    setCarnetEcransRetoursDatesAnneeFermeeAvantDernierMois(false);
    setCarnetEcransRetoursDatesAvantDernierMoisMoisDernier(false);
    setCarnetEcransRetoursDatesTrimestreFermeAvantDernierMois(false);
    setCarnetEcransRetoursDatesTrimestreFermeAnneeFerme(false);
    setCarnetEcransRetoursDatesAnneeFermeeSeule(false);
    setCarnetEcransRetoursDatesTrimestreSeule(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeule(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu(false);
    setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul(false);
    setResteOublie(
      t('ad.suivi.doorOublisEcransJetonsCleared')
        .replace('{jetons}', String(jetonsDepli))
        .replace('{n}', String(ecransCarnet.length)),
    );
  };

  const onTelechargerManque = () => {
    try {
      telechargerPointsManquants();
      setManqueEmporte(true);
    } catch {
      setManqueEmporte(false);
    }
  };

  /* Le second CSV du même bloc : les modules descendus, avec leur jour, un par
     ligne — lu sur la même mémoire nom par nom que le compteur du cap. */
  const onTelechargerDescendus = () => {
    try {
      telechargerDescendus(lang);
      setDescendusEmporte(true);
    } catch {
      setDescendusEmporte(false);
    }
  };

  const onGommer = () => {
    if (!gommeArmee) {
      setGommeArmee(true);
      return;
    }
    setMemoire(clearTelechargements());
    setGommeArmee(false);
  };

  const onGommerChantier = () => {
    if (!chantierSeul) return;
    if (gommeChantier !== chantierSeul) {
      setGommeChantier(chantierSeul);
      return;
    }
    setMemoire(clearTelechargement(chantierSeul));
    setGommeChantier(null);
  };

  return (
    <section className="admin-card admin-suivi">
      <div className="admin-card-head">
        <div>
          <p className="admin-stamp">{t('ad.suivi.stamp')}</p>
          <p className="admin-sub">{t('ad.suivi.sub')}</p>
        </div>
        <div className="suivi-head-tools">
          <span className="admin-muted suivi-meta">
            {t('ad.suivi.updated')} {SUIVI_DATE} · {t('ad.suivi.version')} {SUIVI_VERSION}
          </span>
          {/* Les trois preuves d'envoi en un seul compteur, à côté de la
              version : la confirmation, le mot de passe et le rappel B2B. Un
              clic ouvre la carte de l'expéditeur, droit sur son bloc. */}
          <div className="suivi-preuves-col">
            <Link
              to="/admin?section=params#expediteur"
              className="admin-count admin-count-btn suivi-preuves"
              data-tone={preuvesFaites === 3 ? 'ok' : preuvesFaites > 0 ? 'accent' : 'warn'}
              title={`${preuvesDetail}\n${t('ad.suivi.preuvesClick')}`}
            >
              <i
                className={preuvesFaites === 3 ? 'ri-check-double-line' : 'ri-mail-check-line'}
                aria-hidden="true"
              ></i>
              {t('ad.suivi.preuves')
                .replace('{n}', String(preuvesFaites))
                .replace('{total}', String(preuves.length))}
            </Link>
            {/* Les deux portes du même chantier, posées sous le compteur :
                l'écran de l'expéditeur d'un côté, Resend de l'autre — là où le
                domaine se vérifie et où la clé se reprend. Le compteur dit où
                l'on en est, les deux portes disent où aller. */}
            <AdminSuiviDoors
              portes={porteMail ? [porteMail] : []}
              onVisite={onVisite}
            />
          </div>
          {/* Les chantiers dont l'archive n'a jamais été emportée : le chiffre
              se lit en tête du suivi, et l'infobulle nomme les pièces encore
              à joindre. Teinté tant qu'il en reste, apaisé quand tout est
              parti. */}
          <span
            className="admin-count whitespace-nowrap cursor-help"
            data-tone={archivesJamais.length > 0 ? 'warn' : 'ok'}
            title={
              archivesJamais.length > 0
                ? t('ad.suivi.archivesJamaisHint').replace(
                    '{noms}',
                    archivesJamais.map((chantier) => chantier.nom).join(' · '),
                  )
                : t('ad.suivi.archivesJamaisOk')
            }
          >
            <i
              className={
                archivesJamais.length > 0 ? 'ri-inbox-archive-line' : 'ri-check-double-line'
              }
              aria-hidden="true"
            ></i>
            {t('ad.suivi.archivesJamais')
              .replace('{n}', String(archivesJamais.length))
              .replace('{total}', String(SUIVI_CHANTIERS.length))}
          </span>
          {/* La date du dernier téléchargement, à côté du bouton : elle dit
              quand la pièce est partie la dernière fois. */}
          <span
            className="suivi-last"
            title={dernierPlan ? t('ad.suivi.lastHint') : t('ad.suivi.lastNoneHint')}
          >
            <i className="ri-history-line" aria-hidden="true"></i>
            <span>
              {dernierPlan
                ? t('ad.suivi.lastDownload').replace('{date}', jour(dernierPlan, lang))
                : t('ad.suivi.lastNone')}
            </span>
          </span>
          {/* La gomme de la mémoire : elle n'efface aucune pièce déjà partie,
              seulement ce que ce poste se rappelle. Un premier appui l'arme,
              un second exécute ; sans confirmation, elle se désarme seule. */}
          <button
            type="button"
            className="suivi-gomme"
            data-arme={gommeArmee ? 'yes' : 'no'}
            onClick={onGommer}
            title={
              gommeArmee ? t('ad.suivi.lastClearConfirmHint') : t('ad.suivi.lastClearHint')
            }
            aria-label={
              gommeArmee ? t('ad.suivi.lastClearConfirm') : t('ad.suivi.lastClear')
            }
          >
            <i className={gommeArmee ? 'ri-check-double-line' : 'ri-eraser-line'} aria-hidden="true"></i>
            {gommeArmee && (
              <span className="whitespace-nowrap">{t('ad.suivi.lastClearConfirm')}</span>
            )}
          </button>
          <button
            type="button"
            className="admin-btn"
            data-tone="accent"
            title={t('ad.suivi.telechargerHint')}
            onClick={onTelecharger}
          >
            <i
              className={telecharge ? 'ri-check-line' : 'ri-download-2-line'}
              aria-hidden="true"
            ></i>
            <span className="whitespace-nowrap">
              {telecharge ? t('ad.suivi.telecharge') : t('ad.suivi.telecharger')}
            </span>
          </button>
        </div>
      </div>

      {/* Le chiffre officiel, et ce qu'il compte : le total pondéré, les
          modules déjà à 100 %, et la part des chantiers restants tenus. */}
      <div className="suivi-score">
        <div className="suivi-score-main">
          <p className="suivi-score-num">
            {total}
            <small>%</small>
          </p>
          <p className="suivi-score-lbl">{t('ad.suivi.avancement')}</p>
          <span
            className="suivi-score-track"
            role="img"
            aria-label={`${t('ad.suivi.avancement')} · ${total}%`}
          >
            <i style={{ width: `${total}%` }} />
          </span>
        </div>
        <dl className="suivi-score-facts">
          <div>
            <dt>{t('ad.suivi.points')}</dt>
            <dd>{points.toFixed(2)} / 100</dd>
          </div>
          <div>
            <dt>{t('ad.suivi.acheves')}</dt>
            <dd>
              {acheves} / {SUIVI_MODULES.length}
            </dd>
          </div>
          <div>
            <dt>{t('ad.suivi.chantiers')}</dt>
            <dd>
              {faits} / {SUIVI_RESTE.length}
            </dd>
          </div>
        </dl>

        {/* La part restante, posée sous la barre : son chiffre, puis les
            quatre chantiers qui la composent, et le poids de chacun. */}
        <div className="suivi-part" id="suivi-part" dir="ltr">
          <p className="suivi-part-head">
            <span className="suivi-part-num">{partRestante} %</span>
            <span className="suivi-part-lbl">
              {t('ad.suivi.restePart')
                .replace('{pts}', manquants.toFixed(2))
                .replace('{pct}', String(partRestante))}
            </span>
            {/* Le resserrement se dit, et se retire d'un geste : les quatre
                chantiers restent à portée de la même ligne. */}
            {chantierSeul && (
              <button
                type="button"
                className="suivi-part-widen"
                onClick={() => setChantierSeul(null)}
                title={t('ad.suivi.chantierVoirTous')}
              >
                <i className="ri-filter-off-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ad.suivi.chantierVoirTous')}</span>
              </button>
            )}
          </p>
          {/* Le compte des chantiers dont l'archive n'est pas encore partie de
              cet appareil, posé dans le rappel même : c'est ici que les pièces
              se joignent, le chiffre s'y lit sans remonter à l'en-tête. Il
              suit la mémoire des téléchargements, donc il baisse dès qu'une
              pièce part, et son survol nomme celles qui restent. */}
          <p
            className="suivi-part-archives"
            id={ANCRE_ARCHIVES}
            data-etat={archivesJamais.length > 0 ? 'reste' : 'ok'}
            title={archivesJamaisHint}
          >
            <i
              className={
                archivesJamais.length > 0 ? 'ri-inbox-archive-line' : 'ri-check-double-line'
              }
              aria-hidden="true"
            ></i>
            <span>
              {t('ad.suivi.archivesJamais')
                .replace('{n}', String(archivesJamais.length))
                .replace('{total}', String(SUIVI_CHANTIERS.length))}
            </span>
            {/* Le jour de la dernière archive partie, lu sur la même mémoire
                que le compteur : le chiffre dit aussi quand la pièce est
                partie la dernière fois. */}
            <span className="suivi-part-archives-date">
              {derniereArchive
                ? t('ad.suivi.archivesJamaisDerniere').replace(
                    '{date}',
                    jour(derniereArchive, lang),
                  )
                : t('ad.suivi.archivesJamaisAucune')}
            </span>
            {archivesJamais.length > 0 && (
              <button
                type="button"
                className="suivi-part-archives-more"
                aria-expanded={archivesOuvertes}
                title={
                  archivesOuvertes
                    ? t('ad.suivi.archivesJamaisListHide')
                    : t('ad.suivi.archivesJamaisListShow')
                }
                onClick={() => setArchivesOuvertes((ouvert) => !ouvert)}
              >
                <i
                  className={
                    archivesOuvertes ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
                  }
                  aria-hidden="true"
                ></i>
              </button>
            )}
          </p>
          {/* La liste numérotée des pièces encore à joindre : la première
              ligne est celle à emporter d'abord, la seconde ensuite, et
              ainsi de suite jusqu'à la dernière. */}
          {archivesOuvertes && (archivesJamais.length > 0 || pieceEmportee) && (
            <>
              <ol className="suivi-part-archives-list">
                {archivesJamais.map((chantier, index) => (
                  <li key={chantier.nom}>
                    {/* La ligne numérotée est le geste lui-même : un appui
                        emporte l'archive de ce chantier, sans repasser par
                        son en-tête. */}
                    <button
                      type="button"
                      className="suivi-part-archives-line"
                      title={t('ad.suivi.archivesJamaisItemTelecharger')
                        .replace('{n}', String(index + 1))
                        .replace('{nom}', chantier.nom)}
                      onClick={() => onTelechargerPiece(chantier.nom)}
                    >
                      <span className="suivi-part-archives-num">{index + 1}</span>
                      <span className="suivi-part-archives-name">{chantier.nom}</span>
                      <i className="ri-download-2-line" aria-hidden="true"></i>
                    </button>
                  </li>
                ))}
              </ol>
              {pieceEmportee && (
                <p
                  className="suivi-part-archives-flash"
                  data-tone="ok"
                  role="status"
                  aria-live="polite"
                >
                  <i className="ri-check-line" aria-hidden="true"></i>
                  <span>
                    {t('ad.suivi.archivesJamaisPieceOk').replace(
                      '{nom}',
                      pieceEmportee,
                    )}
                  </span>
                </p>
              )}
            </>
          )}
          {/* Le cap 95 %, sans quitter l'onglet : le gain des e-mails, le
              reste à franchir et les deux portes du chantier. Les trois
              chiffres se déduisent du plan, la porte se lit sur sa table. */}
          <div
            className="suivi-cap"
            data-atteint={resteCap === 0 ? 'yes' : 'no'}
            title={capHover}
          >
            <button
              type="button"
              className="suivi-cap-head"
              aria-expanded={capOuvert}
              title={
                capOuvert ? t('ad.suivi.capListHide') : t('ad.suivi.capListShow')
              }
              onClick={() => setCapOuvert((ouvert) => !ouvert)}
            >
              <span className="suivi-cap-tag">
                <i className="ri-flag-2-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">
                  {t('ad.suivi.capTag').replace('{seuil}', String(SEUIL_CAP))}
                </span>
              </span>
              <span className="suivi-cap-num">
                {resteCap.toFixed(2).replace('.', ',')}
                <em>
                  {resteCap > 0 ? t('ad.suivi.capToCross') : t('ad.suivi.capCrossed')}
                </em>
              </span>
              <i
                className={`suivi-cap-caret ${
                  capOuvert ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
                }`}
                aria-hidden="true"
              ></i>
            </button>
            {/* La liste des modules qui restent, ouverte d'un appui : au
                téléphone le survol n'existe pas, la même liste se lit donc
                sous les chiffres, sans quitter l'onglet. */}
            {capOuvert && (
              <div className="suivi-cap-list">
                {resteCap > 0 ? (
                  <>
                    <p className="suivi-cap-list-head">
                      {t('ad.suivi.capHoverHead')
                        .replace('{n}', String(modulesCap.length))
                        .replace('{seuil}', String(SEUIL_CAP))}
                    </p>
                    {/* Le petit compteur des modules déjà descendus depuis cet
                        appareil : il se lit sur la même liste que le bloc. */}
                    <p
                      className="suivi-cap-desc"
                      data-etat={modulesCapAtteints.length > 0 ? 'vu' : 'vide'}
                      title={capDescendusHint}
                    >
                      {/* Le compteur descend lui-même jusqu'à la ligne des
                          archives du rappel, d'un appui, par la même ancre
                          que les lignes du tableau. */}
                      <a
                        className="suivi-cap-desc-jump"
                        href={`#${ANCRE_ARCHIVES}`}
                        title={t('ad.suivi.capDescendusVersArchive')}
                      >
                        <i className="ri-map-pin-line" aria-hidden="true"></i>
                        <span>
                          {t('ad.suivi.capDescendus')
                            .replace('{n}', String(modulesCapAtteints.length))
                            .replace('{total}', String(modulesCap.length))}
                          {capJamaisPhrase}
                          {capDescendusLePhrase}
                        </span>
                      </a>
                      {/* La petite gomme du compteur : elle n'oublie que les
                          modules atteints, et se demande en deux appuis. */}
                      {modulesAtteints.length > 0 && (
                        <button
                          type="button"
                          className="suivi-cap-desc-gomme"
                          data-arme={modulesGomme ? 'yes' : 'no'}
                          title={
                            modulesGomme
                              ? t('ad.suivi.capDescendusOublierConfirmHint')
                              : t('ad.suivi.capDescendusOublierHint')
                          }
                          aria-label={
                            modulesGomme
                              ? t('ad.suivi.capDescendusOublierConfirm')
                              : t('ad.suivi.capDescendusOublier')
                          }
                          onClick={oublierModules}
                        >
                          <i
                            className={
                              modulesGomme ? 'ri-check-double-line' : 'ri-eraser-line'
                            }
                            aria-hidden="true"
                          ></i>
                        </button>
                      )}
                    </p>
                    <ul className="suivi-cap-list-ul">
                      {modulesCap.map((module) => (
                        <li key={module.nom}>
                          <a
                            className="suivi-cap-list-jump"
                            href={`#${ancreModule(module.nom)}`}
                            title={capJumpTitre(module.nom)}
                            onClick={() => onDescendreModule(module.nom)}
                          >
                            <span className="suivi-cap-list-name">{module.nom}</span>
                            <span className="suivi-cap-list-pt">
                              −{pointsManquants(module).toFixed(2).replace('.', ',')}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <p className="suivi-cap-list-foot">
                      {t('ad.suivi.capHoverFoot').replace(
                        '{reste}',
                        resteCap.toFixed(2).replace('.', ','),
                      )}
                    </p>
                  </>
                ) : (
                  <p className="suivi-cap-list-head">
                    {t('ad.suivi.capHoverDone').replace('{seuil}', String(SEUIL_CAP))}
                  </p>
                )}
              </div>
            )}
            <p className="suivi-cap-txt">
              {t('ad.suivi.capMail')
                .replace('{poids}', String(moduleMail?.poids ?? 0))
                .replace('{gain}', gainMail.toFixed(2).replace('.', ','))
                .replace('{total}', totalApresMail.toFixed(2).replace('.', ','))}
            </p>
            <p className="suivi-cap-after">
              {resteApresMail > 0
                ? t('ad.suivi.capAfter')
                    .replace('{reste}', resteApresMail.toFixed(2).replace('.', ','))
                    .replace('{seuil}', String(SEUIL_CAP))
                : t('ad.suivi.capAfterNone').replace('{seuil}', String(SEUIL_CAP))}
            </p>
            {/* Le repère daté, posé le jour du franchissement et gardé sur
                l'appareil : la ligne dit quand le seuil est passé, pas quand
                la console a été rouverte. */}
            {resteCap === 0 && capDate && (
              <p
                className="suivi-cap-reached"
                title={`${t('ad.suivi.capReachedHint').replace(
                  '{date}',
                  jour(capDate, lang),
                )} ${t('ad.suivi.capReachedDays').replace('{n}', String(capJours))}`}
              >
                <i className="ri-award-line" aria-hidden="true"></i>
                <span>
                  {t('ad.suivi.capReached').replace('{date}', jour(capDate, lang))}
                </span>
                {/* La petite gomme du repère : elle n'oublie que cette date,
                    sur cet appareil — le plan, le cap et son archive restent. */}
                <button
                  type="button"
                  className="suivi-cap-gum"
                  data-arme={capGomme ? 'yes' : 'no'}
                  title={
                    capGomme ? t('ad.suivi.capGumConfirmHint') : t('ad.suivi.capGumHint')
                  }
                  aria-label={
                    capGomme ? t('ad.suivi.capGumConfirm') : t('ad.suivi.capGum')
                  }
                  onClick={oublierCap}
                >
                  <i
                    className={capGomme ? 'ri-check-double-line' : 'ri-eraser-line'}
                    aria-hidden="true"
                  ></i>
                  {capGomme && (
                    <span className="whitespace-nowrap">{t('ad.suivi.capGumConfirm')}</span>
                  )}
                </button>
              </p>
            )}
            {porteMail && (
              <AdminSuiviDoors
                portes={[porteMail]}
                className="suivi-cap-doors"
                onVisite={onVisite}
              />
            )}
          </div>
          {chantierSeul && (
            <p className="suivi-part-focus">
              <i className="ri-contract-left-line" aria-hidden="true"></i>
              <span>{t('ad.suivi.chantierResserre')}</span>
              {/* L'archive du plan, réduite à ce chantier : ses points, ses
                  modules et ses livrables ouverts, sans le reste du plan. */}
              <button
                type="button"
                className="suivi-part-archive"
                onClick={onTelechargerChantier}
                title={t('ad.suivi.chantierArchiveHint')}
              >
                <i
                  className={chantierEmporte ? 'ri-check-line' : 'ri-download-2-line'}
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">
                  {chantierEmporte
                    ? t('ad.suivi.chantierArchiveOk')
                    : t('ad.suivi.chantierArchive')}
                </span>
              </button>
              {/* La date de la dernière archive de ce chantier, portée par sa
                  propre gomme : le geste n'efface que cette pièce-là, jamais
                  celle du plan entier ni celle d'un autre chantier. Un premier
                  appui l'arme, un second efface. */}
              {dernierChantier && (
                <button
                  type="button"
                  className="suivi-gomme"
                  data-part="yes"
                  data-arme={gommeChantier === chantierSeul ? 'yes' : 'no'}
                  onClick={onGommerChantier}
                  title={
                    gommeChantier === chantierSeul
                      ? t('ad.suivi.chantierClearConfirmHint')
                      : t('ad.suivi.chantierClearHint').replace(
                          '{date}',
                          jour(dernierChantier, lang),
                        )
                  }
                  aria-label={
                    gommeChantier === chantierSeul
                      ? t('ad.suivi.chantierClearConfirm')
                      : t('ad.suivi.chantierClear')
                  }
                >
                  <i
                    className={
                      gommeChantier === chantierSeul ? 'ri-check-double-line' : 'ri-eraser-line'
                    }
                    aria-hidden="true"
                  ></i>
                  <span className="whitespace-nowrap">
                    {gommeChantier === chantierSeul
                      ? t('ad.suivi.chantierClearConfirm')
                      : t('ad.suivi.lastDownload').replace('{date}', jour(dernierChantier, lang))}
                  </span>
                </button>
              )}
            </p>
          )}
          <ul className="suivi-part-list" data-seul={chantierSeul ? 'yes' : 'no'}>
            {chantiersVus.map((chantier) => {
              const pts = pointsManquantsChantier(chantier);
              /* Les portes de ce chantier déjà empruntées depuis cet appareil,
                 comptées sur la même mémoire que les repères de ligne. */
              const portesEmpruntees = portesChantier[chantier.nom];
              const part = manquants > 0 ? (pts / manquants) * 100 : 0;
              /* Le compte n'est pas écrit à côté du chiffre : il est lu dans
                 les phases que ce chantier couvre, et suit donc le plan. */
              const livOuverts = livrablesOuvertsChantier(chantier);
              /* Le module le plus lourd du chantier : sa ligne du rappel
                 descend jusqu'à la ligne du tableau, d'un seul geste. */
              const cible = moduleLePlusLourdChantier(chantier);
              const ouvLabel =
                livOuverts === 0
                  ? t('ad.suivi.chantierOuvZero')
                  : livOuverts === 1
                    ? t('ad.suivi.chantierOuvOne')
                    : t('ad.suivi.chantierOuv').replace('{n}', String(livOuverts));
              return (
                <li key={chantier.nom} data-lourd={chantier.nom === chantierFort ? 'yes' : 'no'}>
                  <p className="suivi-part-top">
                    <span className="suivi-part-id">
                      {cible ? (
                        <a
                          className="suivi-part-name suivi-part-jump"
                          href={`#${ancreModule(cible.nom)}`}
                          title={t('ad.suivi.chantierJumpHint').replace(
                            '{module}',
                            cible.nom,
                          )}
                          onClick={() => onDescendreModule(cible.nom)}
                        >
                          {chantier.nom}
                        </a>
                      ) : (
                        <span className="suivi-part-name">{chantier.nom}</span>
                      )}
                      {/* Le même repère que sur la ligne du module : ce
                          chantier reçoit une porte, elle se voit ici aussi,
                          lue sur la même table du plan. */}
                      {portes[chantier.nom] && (
                        <SuiviDoorFlag ecran={portes[chantier.nom].ecran} />
                      )}
                      {/* Le chantier qui pèse le plus porte son repère, comme
                          la pastille du fichier le plus creusé au relevé — et
                          ce repère ouvre le rappel resserré sur lui, sans
                          repasser par l'adresse du guide. */}
                      {chantier.nom === chantierFort && (
                        <button
                          type="button"
                          className="suivi-part-tag"
                          data-actif={chantierSeul === chantier.nom ? 'yes' : 'no'}
                          aria-pressed={chantierSeul === chantier.nom}
                          title={t('ad.suivi.chantierFiltrer')}
                          onClick={() =>
                            setChantierSeul(chantierSeul === chantier.nom ? null : chantier.nom)
                          }
                        >
                          <i className="ri-contract-left-line" aria-hidden="true"></i>
                          <span className="whitespace-nowrap">{t('ad.suivi.chantierLourd')}</span>
                        </button>
                      )}
                    </span>
                    <span className="suivi-part-pts">{pts.toFixed(2)}</span>
                  </p>
                  {/* Les deux portes du chantier, posées sous sa ligne : la
                      même paire, au même endroit et dans le même ordre que
                      sous le compteur des preuves. */}
                  {chantier.lien && (
                    <AdminSuiviDoors
                      portes={[
                        { lien: chantier.lien, ecran: chantier.ecran ?? chantier.nom },
                      ]}
                      className="suivi-mail-doors"
                      onVisite={onVisite}
                    />
                  )}
                  <span className="suivi-part-track" aria-hidden="true">
                    <i style={{ width: `${part}%` }} />
                  </span>
                  {/* Le poids du chantier, dit deux fois : ses points sur le
                      total restant, et sa part en pourcentage. Les deux se
                      lisent sur les poids du plan, jamais recopiés. */}
                  <p className="suivi-part-share">
                    <i className="ri-pie-chart-2-line" aria-hidden="true"></i>
                    <span>
                      {t('ad.suivi.chantierPart')
                        .replace('{pts}', pts.toFixed(2))
                        .replace('{total}', manquants.toFixed(2))
                        .replace('{pct}', String(Math.round(part)))}
                    </span>
                  </p>
                  <p className="suivi-part-reste">{chantier.reste}</p>
                  {/* Ce qu'il reste à ouvrir, lu dans les phases du plan. */}
                  <p className="suivi-part-ouv" data-zero={livOuverts === 0 ? 'yes' : 'no'}>
                    <i className="ri-list-check-2" aria-hidden="true"></i>
                    <span>{ouvLabel}</span>
                  </p>
                  {/* Les portes de ce chantier déjà empruntées, comptées sur la
                      mémoire d'appareil : le survol nomme les écrans et le
                      jour de leur visite, sans ouvrir aucune porte. */}
                  {portesEmpruntees && portesEmpruntees.total > 0 && (
                    <p
                      className="suivi-part-vues"
                      data-etat={portesEmpruntees.used > 0 ? 'vu' : 'vide'}
                      title={t('ad.suivi.chantierVuesHint').replace(
                        '{detail}',
                        portesEmpruntees.detail.length > 0
                          ? portesEmpruntees.detail.join(' · ')
                          : t('ad.suivi.chantierVuesAucune'),
                      )}
                    >
                      <i
                        className={
                          portesEmpruntees.used > 0 ? 'ri-check-double-line' : 'ri-door-open-line'
                        }
                        aria-hidden="true"
                      ></i>
                      <span>
                        {portesEmpruntees.used > 0
                          ? t('ad.suivi.chantierVues')
                              .replace('{n}', String(portesEmpruntees.used))
                              .replace('{total}', String(portesEmpruntees.total))
                          : t('ad.suivi.chantierVuesAucune')}
                      </span>
                      {/* La petite gomme du chantier : elle ne rend que les
                          visites de ses propres portes, sur cet appareil —
                          celles des autres chantiers restent, le plan aussi. */}
                      {portesEmpruntees.used > 0 && (
                        <button
                          type="button"
                          className="suivi-part-vues-clear"
                          title={t('ad.suivi.chantierVuesClearHint')
                            .replace('{n}', String(portesEmpruntees.used))
                            .replace('{chantier}', chantier.nom)
                            .replace(
                              '{autres}',
                              String(
                                Math.max(0, Object.keys(vues).length - portesEmpruntees.used),
                              ),
                            )}
                          aria-label={t('ad.suivi.chantierVuesClear')}
                          onClick={() => {
                            setVues(
                              clearPortesVues(
                                portesEmpruntees.liens,
                                portesEmpruntees.ecrans,
                              ),
                            );
                            setOublis(readOublisPortes());
                            setPartOublie(
                              t('ad.suivi.chantierVuesCleared')
                                .replace('{n}', String(portesEmpruntees.used))
                                .replace('{chantier}', chantier.nom),
                            );
                          }}
                        >
                          <i className="ri-eraser-line" aria-hidden="true"></i>
                        </button>
                      )}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          {/* Ce que la gomme d'un chantier vient de rendre, dit sous le
              rappel : les visites de ses seules portes, oubliées ici. */}
          {partOublie && (
            <p className="suivi-reste-copie-flash" data-tone="ok" role="status" aria-live="polite">
              <i className="ri-eraser-line" aria-hidden="true"></i>
              <span>{partOublie}</span>
            </p>
          )}
        </div>
      </div>

      <section className="suivi-block">
        <div className="suivi-block-head">
          <h3 className="suivi-block-title">{t('ad.suivi.modulesTitle')}</h3>
          <span className="admin-muted suivi-block-note">{t('ad.suivi.modulesNote')}</span>
        </div>
        <ul className="suivi-mods" dir="ltr">
          {SUIVI_MODULES.map((module) => (
            <li
              className="suivi-mod"
              id={ancreModule(module.nom)}
              key={module.nom}
              data-plein={module.avancement >= 100 ? 'yes' : 'no'}
              data-vu={modulesAtteints.includes(module.nom) ? 'yes' : 'no'}
            >
              <span className="suivi-mod-name">
                <span className="suivi-mod-title">
                  {module.nom}
                  {/* Le petit repère d'une ligne déjà descendue : il se lit
                      avant la pastille, et son survol dit le jour où la
                      ligne a été atteinte sur cet appareil. */}
                  {modulesAtteints.includes(module.nom) && (
                    <span
                      className="suivi-mod-vu"
                      title={modVuTitre(module.nom)}
                      aria-label={modVuTitre(module.nom)}
                    >
                      <i className="ri-map-pin-2-fill" aria-hidden="true"></i>
                    </span>
                  )}
                  {/* Le jour de la dernière archive partie pour le chantier de
                      cette ligne, posé à côté de l'épingle de descente. */}
                  {archiveDeLigne(module.nom)}
                  {/* La petite gomme de la ligne : elle n'oublie que ce
                      module-là, sans passer par le compteur du cap, et se
                      demande en deux appuis comme les autres gommes. */}
                  {modulesAtteints.includes(module.nom) && (
                    <button
                      type="button"
                      className="suivi-mod-gomme"
                      data-arme={gommeModule === module.nom ? 'yes' : 'no'}
                      title={
                        gommeModule === module.nom
                          ? t('ad.suivi.modOublierConfirmHint')
                          : t('ad.suivi.modOublierHint')
                      }
                      aria-label={
                        gommeModule === module.nom
                          ? t('ad.suivi.modOublierConfirm')
                          : t('ad.suivi.modOublier')
                      }
                      onClick={() => oublierModule(module.nom)}
                    >
                      <i
                        className={
                          gommeModule === module.nom
                            ? 'ri-check-double-line'
                            : 'ri-eraser-line'
                        }
                        aria-hidden="true"
                      ></i>
                    </button>
                  )}
                  {/* Le repère de la ligne : toute ligne qui reçoit une porte
                      le porte, on le voit avant de lire la pastille posée
                      dessous. Son survol nomme l'écran qu'elle ouvre, lu sur
                      le plan. */}
                  {portes[module.nom] && (
                    <SuiviDoorFlag ecran={portes[module.nom].ecran} />
                  )}
                </span>
                {/* La même paire de portes que sur le chantier, posée sous la
                    ligne du module : les deux vues se répondent d'un coup
                    d'œil, sans qu'aucun mot soit recopié. */}
                {portes[module.nom] && (
                  <AdminSuiviDoors
                    portes={[portes[module.nom]]}
                    className="suivi-mail-doors"
                    onVisite={onVisite}
                  />
                )}
              </span>
              <span className="suivi-mod-weight">{module.poids}</span>
              <span className="suivi-mod-track" aria-hidden="true">
                <i style={{ width: `${module.avancement}%` }} />
              </span>
              <span className="suivi-mod-pct">{module.avancement}%</span>
              <span className="suivi-mod-pts">{pointsModule(module).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="suivi-total" dir="ltr">
          <span>{t('ad.suivi.total')}</span>
          <b>{points.toFixed(2)}</b>
        </p>
      </section>

      {/* Ce que le total laisse encore : le complément, module par module,
          du plus lourd reste au plus léger. Chaque ligne dit aussi ce qu'elle
          demande concrètement, pour que le point manquant ne reste pas un
          chiffre. */}
      <section className="suivi-block">
        <div className="suivi-block-head">
          <h3 className="suivi-block-title">{t('ad.suivi.manqueTitle')}</h3>
          <div className="admin-tools">
            <span className="admin-muted suivi-block-note">
              {t('ad.suivi.manqueNote')
                .replace('{n}', String(ouverts.length))
                .replace('{pts}', manquants.toFixed(2))}
            </span>
            {/* Ce détail part seul en CSV, prêt à joindre à un point d'étape :
                ni les phases, ni les blocages ne s'y invitent. */}
            <button
              type="button"
              className="admin-btn"
              title={t('ad.suivi.manqueCsvHint')}
              onClick={onTelechargerManque}
            >
              <i
                className={manqueEmporte ? 'ri-check-line' : 'ri-file-chart-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">
                {manqueEmporte ? t('ad.suivi.manqueCsvOk') : t('ad.suivi.manqueCsv')}
              </span>
            </button>
            {/* Le second CSV du bloc : les modules descendus depuis cet
                appareil, avec leur jour, un par ligne. */}
            <button
              type="button"
              className="admin-btn"
              title={descendusCsvTitre}
              onClick={onTelechargerDescendus}
            >
              <i
                className={descendusEmporte ? 'ri-check-line' : 'ri-map-pin-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">
                {descendusEmporte
                  ? t('ad.suivi.descendusCsvOk')
                  : t('ad.suivi.descendusCsv')}
              </span>
            </button>
          </div>
        </div>
        <ul className="suivi-manque" dir="ltr">
          {ouverts.map((module) => {
            const pts = pointsManquants(module);
            const reste = 100 - module.avancement;
            return (
              <li className="suivi-manque-row" key={module.nom} data-lourd={module.nom === plusLourd ? 'yes' : 'no'}>
                <p className="suivi-manque-top">
                  {/* Le nom du module descend jusqu'à sa propre ligne du
                      tableau, comme les lignes de la liste du cap : la même
                      ancre, le même pointillé, le même survol qui annonce le
                      tableau visé. */}
                  <a
                    className="suivi-manque-jump"
                    href={`#${ancreModule(module.nom)}`}
                    title={t('ad.suivi.capJumpHint')}
                    onClick={() => onDescendreModule(module.nom)}
                  >
                    <span className="suivi-manque-name">{module.nom}</span>
                  </a>
                  {/* Une ligne de cette liste qui reçoit une porte porte aussi
                      son repère : la même table que le tableau des modules. */}
                  {portes[module.nom] && (
                    <SuiviDoorFlag ecran={portes[module.nom].ecran} />
                  )}
                  {module.nom === plusLourd && (
                    <span className="suivi-manque-tag">{t('ad.suivi.manqueLourd')}</span>
                  )}
                  <span className="suivi-manque-pct">{reste} %</span>
                  <span className="suivi-manque-pts">−{pts.toFixed(2)}</span>
                </p>
                <span className="suivi-manque-track" aria-hidden="true">
                  <i style={{ width: `${reste}%` }} />
                </span>
                <p className="suivi-manque-txt">{SUIVI_MODULE_RESTE[module.nom] || ''}</p>
              </li>
            );
          })}
        </ul>
        <p className="suivi-total" dir="ltr">
          <span>{t('ad.suivi.manqueTotal')}</span>
          <b>−{manquants.toFixed(2)}</b>
          {/* Juste à côté du total : combien de lignes de ce bloc n'ont
              jamais été descendues depuis cet appareil. */}
          <span
            className="suivi-total-jamais"
            data-vide={modulesJamaisDescendus.length === 0 ? 'yes' : 'no'}
            title={manqueJamaisHint}
          >
            {manqueJamaisPhrase}
          </span>
        </p>
      </section>

      <section className="suivi-block">
        <div className="suivi-block-head">
          <h3 className="suivi-block-title">{t('ad.suivi.resteTitle')}</h3>
          <div className="admin-tools">
            <span className="admin-muted suivi-block-note">
              {resteFiltre === 'portes'
                ? t('ad.suivi.restePortesShownUsed')
                    .replace('{n}', String(resteAvecPorte.length))
                    .replace('{total}', String(SUIVI_RESTE.length))
                    .replace('{used}', String(restePortesVues))
                : resteFiltre === 'vues'
                  ? t('ad.suivi.resteVuesShown')
                      .replace('{n}', String(restePortesVues))
                      .replace('{total}', String(SUIVI_RESTE.length))
                  : t('ad.suivi.resteNote').replace('{n}', String(SUIVI_RESTE.length - faits))}
            </span>
            {/* La copie des seules lignes retenues par le jeton, chacune avec le
                nom de l'écran qu'elle ouvre : de quoi confier la liste sans
                l'expliquer à côté. */}
            <button
              type="button"
              className="suivi-reste-copie"
              data-on={resteCopie === 'ok' ? 'yes' : 'no'}
              title={
                restePortesVues > 0
                  ? t('ad.suivi.resteCopyHintUsed')
                      .replace('{n}', String(resteAvecPorte.length))
                      .replace('{used}', String(restePortesVues))
                  : t('ad.suivi.resteCopyHint')
              }
              onClick={() => void onCopierReste()}
            >
              <i
                className={resteCopie === 'ok' ? 'ri-check-line' : 'ri-file-copy-2-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">{t('ad.suivi.resteCopy')}</span>
            </button>
            <button
              type="button"
              className="suivi-reste-jeton"
              data-kind="vues"
              data-on={resteFiltre === 'vues' ? 'yes' : 'no'}
              aria-pressed={resteFiltre === 'vues'}
              title={
                restePortesVues > 0
                  ? t('ad.suivi.resteVuesHintDetail')
                      .replace('{n}', String(restePortesVues))
                      .replace('{total}', String(SUIVI_RESTE.length))
                      .replace('{detail}', resteVuesEcrans.join(' · '))
                  : t('ad.suivi.resteVuesHint')
                      .replace('{n}', String(restePortesVues))
                      .replace('{total}', String(SUIVI_RESTE.length))
              }
              onClick={() =>
                setResteFiltre((actif) => (actif === 'vues' ? 'tout' : 'vues'))
              }
            >
              <i className="ri-check-double-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">
                {t('ad.suivi.resteVues').replace('{n}', String(restePortesVues))}
              </span>
            </button>
            {/* Le jeton des portes ouvertes : il ne garde que les lignes qui
                mènent quelque part, lues sur la table du plan — le même
                repère que celui posé à côté de leur texte. */}
            <button
              type="button"
              className="suivi-reste-jeton"
              data-on={resteFiltre === 'portes' ? 'yes' : 'no'}
              aria-pressed={resteFiltre === 'portes'}
              title={t('ad.suivi.restePortesHint')
                .replace('{n}', String(resteAvecPorte.length))
                .replace('{total}', String(SUIVI_RESTE.length))}
              onClick={() =>
                setResteFiltre((actif) => (actif === 'portes' ? 'tout' : 'portes'))
              }
            >
              <i className="ri-door-open-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">
                {t('ad.suivi.restePortes').replace('{n}', String(resteAvecPorte.length))}
              </span>
            </button>
          </div>
        </div>
        <ul className="suivi-reste" dir="ltr">
          {(resteFiltre === 'portes'
            ? resteAvecPorte
            : resteFiltre === 'vues'
              ? resteVues
              : SUIVI_RESTE
          ).map((item) => {
            const porte = portesResteTable[item.texte];
            /* La porte de cette ligne a-t-elle déjà été empruntée depuis cet
               appareil ? Son jour est lu sur la mémoire du poste. */
            const vuLe = porte ? vues[porte.lien] ?? null : null;
            return (
              <li key={item.texte} data-fait={item.fait ? 'yes' : 'no'}>
                <i className={item.fait ? 'ri-checkbox-circle-line' : 'ri-checkbox-blank-circle-line'} aria-hidden="true"></i>
                <span className="suivi-reste-cell">
                  <span className="suivi-reste-txt">
                    {item.texte}
                    {/* Le même repère que sur les modules : la ligne mène à un
                        écran, on le voit avant de lire le texte. */}
                    {porte && <SuiviDoorFlag ecran={porte.ecran} />}
                    {/* Ce que la porte est devenue : empruntée un jour précis,
                        ou encore à ouvrir. Le repère ne se confond donc plus
                        avec celui de la ligne qui n'a pas encore été visitée. */}
                    {porte && (
                      <span
                        className="suivi-reste-etat"
                        data-etat={vuLe ? 'vu' : 'todo'}
                        title={
                          vuLe
                            ? t('ad.suivi.doorUsedHint').replace('{date}', jour(vuLe, lang))
                            : t('ad.suivi.doorTodoHint')
                        }
                      >
                        <i
                          className={vuLe ? 'ri-check-double-line' : 'ri-door-open-line'}
                          aria-hidden="true"
                        ></i>
                        <span className="whitespace-nowrap">
                          {vuLe ? t('ad.suivi.doorUsed') : t('ad.suivi.doorTodo')}
                        </span>
                        {/* La petite gomme du repère : elle n'oublie que la
                            visite de cette porte, sur cet appareil — le
                            plan, les autres portes et la carte restent. */}
                        {vuLe && porte && (
                          <button
                            type="button"
                            className="suivi-reste-etat-clear"
                            title={t('ad.suivi.doorUsedClearHint').replace(
                              '{ecran}',
                              porte.ecran,
                            )}
                            aria-label={t('ad.suivi.doorUsedClear')}
                            onClick={() => {
                              setVues(clearPorteVue(porte.lien, porte.ecran));
                              setOublis(readOublisPortes());
                              setResteOublie(
                                t('ad.suivi.doorUsedCleared').replace('{ecran}', porte.ecran),
                              );
                            }}
                          >
                            <i className="ri-eraser-line" aria-hidden="true"></i>
                          </button>
                        )}
                      </span>
                    )}
                  </span>
                  {/* Et la porte elle-même, sous le texte, dans le même ordre et
                      le même air que partout ailleurs. */}
                  {porte && (
                    <AdminSuiviDoors
                      portes={[porte]}
                      className="suivi-reste-doors"
                      onVisite={onVisite}
                    />
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        {/* Les visites rendues depuis cet appareil, comptées sur le carnet de
            la petite gomme, avec le jour du dernier oubli : ce qui a été
            oublié se relit sous la liste, jamais dans le presse-papiers. */}
        <div
          className="suivi-reste-oublis"
          data-etat={oublis.total > 0 ? 'vu' : 'vide'}
          title={t('ad.suivi.doorOublisHint')}
        >
          <span className="suivi-reste-oublis-compte">
            <i className="ri-eraser-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">
              {t('ad.suivi.doorOublis').replace('{n}', String(oublis.total))}
            </span>
          </span>
          <span className="suivi-reste-oublis-jour">
            {oublis.dernier
              ? t('ad.suivi.doorOublisLast').replace('{date}', jour(oublis.dernier, lang))
              : t('ad.suivi.doorOublisNone')}
          </span>
          {/* Le carnet part en CSV, une ligne par porte oubliée : son écran
              et le jour du geste, lus sur la mémoire du poste. */}
          {oublis.total > 0 && (
            <button
              type="button"
              className="suivi-reste-oublis-csv"
              /* Le survol dit la période du carnet, puis l'écart entre le
                 premier et le dernier retrait par nom : la ligne du CSV des
                 écrans retirés dit ainsi, sans ouvrir le fichier, en combien
                 de journées le geste s'est étalé. */
              title={`${(bornesCarnet && bornesCarnet.ancien !== bornesCarnet.recent
                ? t('ad.suivi.doorOublisCsvHintSpan')
                    .replace('{n}', String(oublis.total))
                    .replace('{ancien}', jour(bornesCarnet.ancien, lang))
                    .replace('{recent}', jour(bornesCarnet.recent, lang))
                : t('ad.suivi.doorOublisCsvHint').replace('{n}', String(oublis.total))
              )} ${periodeCarnetPhrase} ${retraitsSpanPhrase} ${retourMoyennePhrase} ${repartisMoyennePhrase} ${repartisSemaineTotalPhrase} ${cumulPeriodePhrase} ${csvSemaineDelaiPhrase} ${csvSansRetourPhrase} ${csvHorsQuinzainePhrase} ${csvQuinzaineRevenusPhrase} ${csvBlocsPhrase} ${csvBlocLourdPhrase}`}
              onClick={onTelechargerOublis}
            >
              <i
                className={oublisEmporte ? 'ri-check-line' : 'ri-file-chart-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">
                {oublisEmporte ? t('ad.suivi.doorOublisCsvOk') : t('ad.suivi.doorOublisCsv')}
              </span>
            </button>
          )}
          {/* La petite gomme du carnet : le compte, son jour et son journal
              repartent vierges — les visites retenues, elles, ne bougent pas. */}
          {oublis.total > 0 && (
            <button
              type="button"
              className="suivi-reste-oublis-clear"
              title={t('ad.suivi.doorOublisClearHint').replace(
                '{n}',
                String(oublis.total),
              )}
              aria-label={t('ad.suivi.doorOublisClear')}
              onClick={onGommerOublis}
            >
              <i className="ri-eraser-line" aria-hidden="true"></i>
            </button>
          )}
        </div>
        {/* Où les oublis se sont concentrés : les visites du carnet rangées
            par chantier du plan, la plus fournie en tête. Le nom de chaque
            chantier est relu sur la table des portes, jamais recopié. */}
        {oublisParChantier.length > 0 && (
          <p
            className="suivi-reste-oublis-chantiers"
            title={t('ad.suivi.doorOublisParChantierHintDetail').replace(
              '{detail}',
              oublisParChantierDetail,
            )}
          >
            <i className="ri-stack-line" aria-hidden="true"></i>
            <span className="suivi-reste-oublis-chantiers-lbl">
              {t('ad.suivi.doorOublisParChantier')}
            </span>
            {oublisParChantier.map((ligne) => (
              <button
                type="button"
                className="suivi-reste-oublis-chantier"
                key={ligne.nom || 'hors-chantier'}
                data-fort={ligne.n === oublisParChantier[0].n ? 'yes' : 'no'}
                data-on={carnetChantier === ligne.nom ? 'yes' : 'no'}
                aria-pressed={carnetChantier === ligne.nom}
                title={(ligne.masques > 0
                  ? t('ad.suivi.doorOublisChantierTokenHintMasque')
                      .replace('{masques}', String(ligne.masques))
                      .replace(
                        '{premierMasque}',
                        ligne.premierMasque
                          ? jour(ligne.premierMasque, lang)
                          : jour(ligne.premier, lang),
                      )
                  : t('ad.suivi.doorOublisChantierTokenHint')
                )
                  .replace(
                    '{nom}',
                    ligne.nom || t('ad.suivi.doorOublisChantierAucun'),
                  )
                  .replace('{n}', String(ligne.n))
                  .replace('{premier}', jour(ligne.premier, lang))
                  .replace('{dernier}', jour(ligne.dernier, lang))}
                onClick={() =>
                  setCarnetChantier((actif) =>
                    actif === ligne.nom ? null : ligne.nom,
                  )
                }
              >
                {t('ad.suivi.doorOublisChantierItem')
                  .replace(
                    '{nom}',
                    ligne.nom || t('ad.suivi.doorOublisChantierAucun'),
                  )
                  .replace('{n}', String(ligne.n))}
              </button>
            ))}
          </p>
        )}
        {/* Le jeton posé se dit sous le décompte, avec le nombre de gestes
            qu’il laisse au carnet et la sortie qui rend la liste entière. */}
        {carnetChantier !== null && (
          <p className="suivi-reste-oublis-focus">
            <i className="ri-filter-3-line" aria-hidden="true"></i>
            <span>
              {t('ad.suivi.doorOublisChantierOn')
                .replace(
                  '{nom}',
                  carnetChantier || t('ad.suivi.doorOublisChantierAucun'),
                )
                .replace('{n}', String(journalCarnet.length))}
            </span>
            <button
              type="button"
              className="suivi-reste-oublis-focus-clear"
              title={t('ad.suivi.doorOublisChantierClear')}
              aria-label={t('ad.suivi.doorOublisChantierClear')}
              onClick={() => setCarnetChantier(null)}
            >
              <i className="ri-close-line" aria-hidden="true"></i>
            </button>
          </p>
        )}
        {/* Le second jeton du carnet : la semaine en cours. Il ne garde que
            les gestes récents, pour les relire avant d’en effacer un — et il
            compte ceux qu’il laisse parmi ceux que le chantier retient déjà,
            sans jamais retirer un oubli. */}
        {oublis.total > 0 && (
          <p className="suivi-reste-oublis-semaine">
            <button
              type="button"
              className="suivi-reste-oublis-semaine-jeton"
              data-on={carnetSemaine ? 'yes' : 'no'}
              aria-pressed={carnetSemaine}
              title={
                semaineBouts
                  ? semaineBouts.ancien === semaineBouts.recent
                    ? t('ad.suivi.doorOublisSemaineHintBoutsOne')
                        .replace('{n}', String(journalSemaine.length))
                        .replace('{total}', String(oublis.total))
                        .replace('{date}', jour(semaineBouts.recent, lang))
                    : t('ad.suivi.doorOublisSemaineHintBouts')
                        .replace('{n}', String(journalSemaine.length))
                        .replace('{total}', String(oublis.total))
                        .replace('{ancien}', jour(semaineBouts.ancien, lang))
                        .replace('{recent}', jour(semaineBouts.recent, lang))
                  : t('ad.suivi.doorOublisSemaineHint')
                      .replace('{n}', String(journalSemaine.length))
                      .replace('{total}', String(oublis.total))
              }
              onClick={() => setCarnetSemaine((actif) => !actif)}
            >
              <i className="ri-calendar-event-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">
                {t('ad.suivi.doorOublisSemaine').replace(
                  '{n}',
                  String(journalSemaine.length),
                )}
              </span>
            </button>
            {/* Ce que le jeton retient, dit à côté de lui : le carnet resserré
                sur la semaine, et la croix qui rend les gestes plus anciens. */}
            {carnetSemaine ? (
              <span className="suivi-reste-oublis-semaine-on">
                {t('ad.suivi.doorOublisSemaineOn').replace(
                  '{n}',
                  String(journalCarnet.length),
                )}
              </span>
            ) : (
              <span className="suivi-reste-oublis-semaine-note">
                {t('ad.suivi.doorOublisSemaineNote')}
              </span>
            )}
            {carnetSemaine && (
              <button
                type="button"
                className="suivi-reste-oublis-focus-clear"
                title={t('ad.suivi.doorOublisSemaineClear')}
                aria-label={t('ad.suivi.doorOublisSemaineClear')}
                onClick={() => setCarnetSemaine(false)}
              >
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            )}
          </p>
        )}
        {/* Les jetons posés, comptés ensemble : le chantier d’abord, la
            semaine ensuite. La gomme les éteint tous d’un geste — elle ne
            retire aucun oubli, elle rend seulement la liste entière. */}
        {oublis.total > 0 && (
          <p
            className="suivi-reste-oublis-jetons"
            data-on={jetonsPoses > 0 ? 'yes' : 'no'}
            title={
              jetonsPoses > 0
                ? t('ad.suivi.doorOublisJetonsHint').replace('{n}', String(jetonsPoses))
                : t('ad.suivi.doorOublisJetonsNoneHint')
            }
          >
            <i className="ri-filter-3-line" aria-hidden="true"></i>
            <span className="suivi-reste-oublis-jetons-lbl">
              {jetonsPoses > 0
                ? t('ad.suivi.doorOublisJetons').replace('{n}', String(jetonsPoses))
                : t('ad.suivi.doorOublisJetonsNone')}
            </span>
            {jetonsPoses > 0 && (
              <button
                type="button"
                className="suivi-reste-oublis-jetons-clear"
                title={t('ad.suivi.doorOublisJetonsClearHintDetail')
                  .replace('{n}', String(jetonsPoses))
                  .replace('{detail}', jetonsDetail)}
                aria-label={t('ad.suivi.doorOublisJetonsClear')}
                onClick={onEteindreJetons}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>
              </button>
            )}
          </p>
        )}
        {/* Le carnet, geste par geste : chaque oubli nomme son écran, son
            chantier du plan et son jour, du plus récent au plus ancien, et
            porte sa propre petite gomme. Un appui ne retire que ce geste-là
            du carnet — la visite retenue et le plan restent intacts. */}
        {journalCarnet.length > 0 && (
          <div className="suivi-reste-oublis-journal">
            <p className="suivi-reste-oublis-journal-lbl">
              <i className="ri-list-unordered" aria-hidden="true"></i>
              <span>
                {carnetTriEcran ? (
                  /* L’intitulé du tri est un appui : il déplie les écrans un à
                     un sous la liste, chacun avec sa petite gomme de retrait.
                     Le dépli ne range ni ne retire aucun oubli. */
                  <button
                    type="button"
                    className="suivi-reste-oublis-journal-lbl-btn"
                    data-on={carnetEcransDeplies ? 'yes' : 'no'}
                    data-tri={carnetEcransFourni ? 'yes' : 'no'}
                    aria-pressed={carnetEcransDeplies}
                    title={`${(carnetEcransDeplies
                      ? t('ad.suivi.doorOublisEcransReplierHint')
                      : t('ad.suivi.doorOublisEcransDeplierHint')
                    )
                      .replace('{n}', String(ecransCarnet.length))
                      .replace('{total}', String(journalCarnet.length))
                      .replace('{detail}', ecransCarnetDetail)} ${
                      carnetEcransFourni
                        ? t('ad.suivi.doorOublisEcransFourniOnHint')
                        : t('ad.suivi.doorOublisEcransFourniHint')
                    } ${ecransDeplacesPhrase} ${ecransRetiresNomPhrase}`}
                    onClick={() => {
                      /* Un premier appui déplie dans l’ordre du carnet ; un
                         second range les écrans du plus fourni au plus léger ;
                         un troisième replie le dépli. Aucun oubli n’est retiré. */
                      if (!carnetEcransDeplies) {
                        setCarnetEcransDeplies(true);
                        setCarnetEcransFourni(false);
                        return;
                      }
                      if (!carnetEcransFourni) {
                        setCarnetEcransFourni(true);
                        return;
                      }
                      setCarnetEcransDeplies(false);
                      setCarnetEcransFourni(false);
                    }}
                  >
                    {t('ad.suivi.doorOublisJournalTri')}
                    <i
                      className={
                        carnetEcransDeplies ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
                      }
                      aria-hidden="true"
                    ></i>
                  </button>
                ) : (
                  t('ad.suivi.doorOublisJournal')
                )}
              </span>
              {/* Le tri des gestes par écran : il ne retire rien et ne
                  resserre rien — il range les oublis d’un même écran côte à
                  côte, le temps d’en retirer un sans se tromper de voisin. */}
              <button
                type="button"
                className="suivi-reste-oublis-journal-tri"
                data-on={carnetTriEcran ? 'yes' : 'no'}
                aria-pressed={carnetTriEcran}
                title={(carnetTriEcran
                  ? t('ad.suivi.doorOublisTriEcranOffHintDetail')
                  : t('ad.suivi.doorOublisTriEcranHintDetail')
                )
                  .replace('{n}', String(ecransCarnet.length))
                  .replace('{total}', String(journalCarnet.length))
                  .replace('{detail}', ecransCarnetDetail)}
                onClick={() => {
                  if (carnetTriEcran) {
                    setCarnetEcransDeplies(false);
                    setCarnetEcransFourni(false);
                    setCarnetEcransRelire(false);
                    setCarnetEcransVieux(false);
                    setCarnetEcransRetour(false);
                    setCarnetEcransRetiresPlusieurs(false);
                    setCarnetEcransRetourDeux(false);
                    setCarnetEcransRepartis(false);
    setCarnetEcransRepartisVieux(false);
    setCarnetEcransRepartisMois(false);
    setCarnetEcransRepartisSemaine(false);
    setCarnetEcransRepartisJour(false);
    setCarnetEcransRepartisHier(false);
    setCarnetEcransRepartisAvantHier(false);
    setCarnetEcransRepartisQuinzaine(false);
    setCarnetEcransRepartisQuinzaineRevenus(false);
    setCarnetEcransRepartisQuinzaineJamais(false);
    setCarnetEcransRepartisQuinzaineSemaine(false);
    setCarnetEcransRepartisQuinzaineTardifs(false);
    setCarnetEcransRepartisQuinzaineRapides(false);
    setCarnetEcransRepartisQuinzaineSansRetour(false);
    setCarnetEcransRepartisHorsQuinzaine(false);
                  }
                  setCarnetTriEcran(!carnetTriEcran);
                }}
              >
                <i className="ri-sort-asc" aria-hidden="true"></i>
                <span className="whitespace-nowrap">
                  {t('ad.suivi.doorOublisTriEcran')}
                </span>
              </button>
              {/* La petite gomme du tri : elle ne retire aucun oubli — elle
                  rend l’ordre du plus récent au plus ancien d’un seul geste. */}
              {carnetTriEcran && (
                <button
                  type="button"
                  className="suivi-reste-oublis-journal-tri-clear"
                  title={t('ad.suivi.doorOublisTriEcranClearHintDetail')
                    .replace('{n}', String(ecransCarnet.length))
                    .replace('{total}', String(journalCarnet.length))
                    .replace('{detail}', ecransCarnetDetail)}
                  aria-label={t('ad.suivi.doorOublisTriEcranClear')}
                  onClick={() => {
                    setCarnetTriEcran(false);
                    setCarnetEcransDeplies(false);
                    setCarnetEcransFourni(false);
                    setCarnetEcransRelire(false);
                    setCarnetEcransVieux(false);
                    setCarnetEcransRetour(false);
                    setCarnetEcransRetiresPlusieurs(false);
                    setCarnetEcransRetourDeux(false);
                    setCarnetEcransRepartis(false);
    setCarnetEcransRepartisVieux(false);
    setCarnetEcransRepartisMois(false);
    setCarnetEcransRepartisSemaine(false);
    setCarnetEcransRepartisJour(false);
    setCarnetEcransRepartisHier(false);
    setCarnetEcransRepartisAvantHier(false);
    setCarnetEcransRepartisQuinzaine(false);
    setCarnetEcransRepartisQuinzaineRevenus(false);
    setCarnetEcransRepartisQuinzaineJamais(false);
    setCarnetEcransRepartisQuinzaineSemaine(false);
    setCarnetEcransRepartisQuinzaineTardifs(false);
    setCarnetEcransRepartisQuinzaineRapides(false);
    setCarnetEcransRepartisQuinzaineSansRetour(false);
    setCarnetEcransRepartisHorsQuinzaine(false);
                    setResteOublie(
                      t('ad.suivi.doorOublisTriEcranCleared').replace(
                        '{n}',
                        String(Object.keys(compteParEcran).length),
                      ),
                    );
                  }}
                >
                  <i className="ri-eraser-line" aria-hidden="true"></i>
                </button>
              )}
            </p>
            {/* L’écran retenu par un appui sur son nom, dans le tri : le carnet
                ne garde que ses gestes, le temps d’en retirer un, et la croix
                rend tous les écrans sans retirer un seul oubli. */}
            {carnetEcran !== null && (
              <p className="suivi-reste-oublis-focus">
                <i className="ri-filter-3-line" aria-hidden="true"></i>
                <span>
                  {t('ad.suivi.doorOublisEcranOn')
                    .replace('{ecran}', carnetEcran)
                    .replace('{n}', String(journalCarnet.length))}
                  {/* Les deux bouts de l’écran retenu : le jour de son premier
                      oubli, celui de son dernier, et les journées qui les
                      séparent — lus sur ses seuls gestes. */}
                  {ecranSpan && (
                    <span className="suivi-reste-oublis-focus-span">{ecranSpan}</span>
                  )}
                </span>
                <button
                  type="button"
                  className="suivi-reste-oublis-focus-clear"
                  title={t('ad.suivi.doorOublisEcranClear')}
                  aria-label={t('ad.suivi.doorOublisEcranClear')}
                  onClick={() => {
                    const nom = carnetEcran;
                    setCarnetEcran(null);
                    setResteOublie(
                      t('ad.suivi.doorOublisEcranCleared')
                        .replace('{ecran}', nom)
                        .replace('{n}', String(Object.keys(compteParEcran).length)),
                    );
                  }}
                >
                  <i className="ri-close-line" aria-hidden="true"></i>
                </button>
              </p>
            )}
            {/* Les écrans dépliés un à un : chacun son nom, son compte, le jour
                de son dernier oubli et sa petite gomme, qui ne retire que ses
                gestes du carnet — les visites retenues et le plan restent. */}
            {carnetTriEcran && carnetEcransDeplies && ecransCarnet.length > 0 && (
              <>
                {/* Le jeton de relecture, posé en tête du dépli : il ne garde
                    que les écrans qui tiennent encore plus d’un geste, ceux
                    qu’un second oubli rend ambigus. Il ne retire rien. */}
                <p className="suivi-reste-oublis-ecrans-jeton">
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRelire ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRelire}
                    title={`${(carnetEcransRelire
                      ? t('ad.suivi.doorOublisEcransRelireOffHint')
                      : t('ad.suivi.doorOublisEcransRelireHint')
                    )
                      .replace('{n}', String(ecransPlusieurs.length))
                      .replace('{total}', String(ecransCarnet.length))
                      .replace('{gestesPlusieurs}', String(gestesPlusieurs))
                      .replace('{detail}', ecransPlusieursDetail)
                      .replace('{ecartes}', String(ecransEcartes.length))
                      .replace('{gestesEcartes}', String(gestesEcartes))
                      .replace(
                        '{detailEcartes}',
                        ecransEcartesDetail || t('ad.suivi.doorOublisEcransRelireAucun'),
                      )} ${ecranVidePhrase}`}
                    onClick={() => setCarnetEcransRelire((actif) => !actif)}
                  >
                    <i className="ri-filter-3-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRelire').replace(
                        '{n}',
                        String(ecransPlusieurs.length),
                      )}
                    </span>
                  </button>
                  {/* Le jeton des écrans oubliés : il ne garde que ceux dont le
                      dernier geste remonte à plus de sept jours, ceux qu'on ne
                      relit plus. Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransVieux ? 'yes' : 'no'}
                    aria-pressed={carnetEcransVieux}
                    title={`${(carnetEcransVieux
                      ? t('ad.suivi.doorOublisEcransVieuxOffHint')
                      : t('ad.suivi.doorOublisEcransVieuxHint')
                    )
                      .replace('{n}', String(ecransVieux.length))
                      .replace('{total}', String(ecransCarnet.length))
                      .replace('{gestesVieux}', String(gestesVieux))
                      .replace(
                        '{detail}',
                        ecransVieuxDetail || t('ad.suivi.doorOublisEcransVieuxAucun'),
                      )} ${ecranVieuxPlusAncienPhrase}`}
                    onClick={() => setCarnetEcransVieux((actif) => !actif)}
                  >
                    <i className="ri-history-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransVieux').replace(
                        '{n}',
                        String(ecransVieux.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransVieux && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransVieuxOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransCarnet.length))}
                    </span>
                  )}
                  {carnetEcransFourni && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransFourniOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransCarnet.length))}
                    </span>
                  )}
                  {carnetEcransRelire && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRelireOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransCarnet.length))}
                    </span>
                  )}
                  {/* Le jeton des retours : il ne garde que les écrans qu'un
                      second appui sur leur nom avait retirés du carnet, puis
                      qu'un nouveau geste y a ramenés. Il dit le jour de
                      chaque retour, et ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRetour ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRetour}
                    title={(carnetEcransRetour
                      ? t('ad.suivi.doorOublisEcransRetourOffHint')
                      : t('ad.suivi.doorOublisEcransRetourHint')
                    )
                      .replace('{n}', String(ecransRetournes.length))
                      .replace('{total}', String(ecransCarnet.length))
                      .replace(
                        '{detail}',
                        ecransRetournesDetail || t('ad.suivi.doorOublisEcransRetourAucun'),
                      )}
                    onClick={() => setCarnetEcransRetour((actif) => !actif)}
                  >
                    <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRetour').replace(
                        '{n}',
                        String(ecransRetournes.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetour && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRetourOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransCarnet.length))}
                    </span>
                  )}
                  {/* Le jeton des écrans retirés plus d'une fois : il ne garde
                      que ceux que le second appui sur leur nom a vidés au
                      moins deux fois depuis cet appareil. Il ne retire rien. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRetiresPlusieurs ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRetiresPlusieurs}
                    title={`${(carnetEcransRetiresPlusieurs
                      ? t('ad.suivi.doorOublisEcransRetiresPlusieursOffHint')
                      : t('ad.suivi.doorOublisEcransRetiresPlusieursHint')
                    )
                      .replace('{n}', String(ecransRetiresPlusieursListe.length))
                      .replace('{total}', String(ecransCarnet.length))
                      .replace(
                        '{detail}',
                        ecransRetiresPlusieursDetail ||
                          t('ad.suivi.doorOublisEcransRetiresPlusieursAucun'),
                      )} ${ecranPlusRetirePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetiresPlusieurs((actif) => !actif)
                    }
                  >
                    <i className="ri-delete-bin-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRetiresPlusieurs').replace(
                        '{n}',
                        String(ecransRetiresPlusieursListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetiresPlusieurs && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRetiresPlusieursOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransCarnet.length))}
                    </span>
                  )}
                  {/* Le jeton des retours répétés : il ne garde que les écrans
                      revenus au moins deux fois au carnet après un retrait par
                      leur nom. Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRetourDeux ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRetourDeux}
                    title={(carnetEcransRetourDeux
                      ? t('ad.suivi.doorOublisEcransRetourDeuxOffHint')
                      : t('ad.suivi.doorOublisEcransRetourDeuxHint')
                    )
                      .replace('{n}', String(ecransRetourDeuxListe.length))
                      .replace('{total}', String(ecransCarnet.length))
                      .replace(
                        '{detail}',
                        ecransRetourDeuxDetail ||
                          t('ad.suivi.doorOublisEcransRetourDeuxAucun'),
                      ) + ` — ${ecranPlusRevenuPhrase}`}
                    onClick={() => setCarnetEcransRetourDeux((actif) => !actif)}
                  >
                    <i className="ri-arrow-go-back-fill" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRetourDeux').replace(
                        '{n}',
                        String(ecransRetourDeuxListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetourDeux && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRetourDeuxOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransCarnet.length))}
                    </span>
                  )}
                  {/* Le jeton des écrans revenus puis repartis : il ne garde
                      que ceux qu'un geste avait ramenés au carnet et qu'un
                      nouvel appui sur leur nom a vidés depuis, avec le jour de
                      leur dernier retrait. Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartis ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartis}
                    title={(carnetEcransRepartis
                      ? t('ad.suivi.doorOublisEcransRepartisOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisHint')
                    )
                      .replace('{n}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisDetail ||
                          t('ad.suivi.doorOublisEcransRepartisAucun'),
                      )}
                    onClick={() => setCarnetEcransRepartis((actif) => !actif)}
                  >
                    <i className="ri-logout-box-r-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartis').replace(
                        '{n}',
                        String(ecransRepartisListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartis && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisOn').replace(
                        '{n}',
                        String(ecransAffiches.length),
                      )}
                    </span>
                  )}
                  {/* Le jeton des écrans repartis de longue date : il ne garde
                      que ceux dont le dernier retrait remonte à plus de sept
                      journées pleines, avec le jour de ce retrait. Il ne
                      retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisVieux ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisVieux}
                    title={(carnetEcransRepartisVieux
                      ? t('ad.suivi.doorOublisEcransRepartisVieuxOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisVieuxHint')
                    )
                      .replace('{n}', String(ecransRepartisVieuxListe.length))
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisVieuxDetail ||
                          t('ad.suivi.doorOublisEcransRepartisVieuxAucun'),
                      ) + ` ${ecranRepartiPlusAncienPhrase} ${repartisVieuxEcartesPhrase}`}
                    onClick={() => setCarnetEcransRepartisVieux((actif) => !actif)}
                  >
                    <i className="ri-timer-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisVieux').replace(
                        '{n}',
                        String(ecransRepartisVieuxListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisVieux && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisVieuxOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des écrans repartis ce mois : il ne garde que
                      ceux dont le dernier retrait tombe dans le mois en cours,
                      avec le jour de ce retrait. Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisMois ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisMois}
                    title={(carnetEcransRepartisMois
                      ? t('ad.suivi.doorOublisEcransRepartisMoisOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisMoisHint')
                    )
                      .replace('{n}', String(ecransRepartisMoisListe.length))
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisMoisDetail ||
                          t('ad.suivi.doorOublisEcransRepartisMoisAucun'),
                      ) + ` ${ecranRepartiPlusAncienMoisPhrase} ${ecransRepartisMoisSpanPhrase}`}
                    onClick={() => setCarnetEcransRepartisMois((actif) => !actif)}
                  >
                    <i className="ri-calendar-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisMois').replace(
                        '{n}',
                        String(ecransRepartisMoisListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisMois && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisMoisOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des écrans repartis cette semaine : il ne garde
                      que ceux dont le dernier retrait tombe dans la semaine en
                      cours, avec le jour de ce retrait. Il ne retire aucun
                      oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisSemaine ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisSemaine}
                    title={(carnetEcransRepartisSemaine
                      ? t('ad.suivi.doorOublisEcransRepartisSemaineOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisSemaineHint')
                    )
                      .replace('{n}', String(ecransRepartisSemaineListe.length))
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisSemaineDetail ||
                          t('ad.suivi.doorOublisEcransRepartisSemaineAucun'),
                      ) +
                        ` ${ecranRepartiPlusRecentSemainePhrase} ${ecranRepartiPlusAncienSemainePhrase}`}
                    onClick={() => setCarnetEcransRepartisSemaine((actif) => !actif)}
                  >
                    <i className="ri-calendar-check-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisSemaine').replace(
                        '{n}',
                        String(ecransRepartisSemaineListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisSemaine && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisSemaineOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des écrans repartis aujourd’hui : il ne garde que
                      ceux dont le dernier retrait tombe le jour même, avec le
                      jour de ce retrait. Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisJour ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisJour}
                    title={(carnetEcransRepartisJour
                      ? t('ad.suivi.doorOublisEcransRepartisJourOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisJourHint')
                    )
                      .replace('{n}', String(ecransRepartisJourListe.length))
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisJourDetail ||
                          t('ad.suivi.doorOublisEcransRepartisJourAucun'),
                      ) + ` ${repartisJourEcartesPhrase}`}
                    onClick={() => setCarnetEcransRepartisJour((actif) => !actif)}
                  >
                    <i className="ri-sun-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisJour').replace(
                        '{n}',
                        String(ecransRepartisJourListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisJour && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisJourOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des écrans repartis hier : il ne garde que ceux
                      dont le dernier retrait tombe la veille, avec le jour de
                      ce retrait. Il ne retire aucun oubli, et son survol dit
                      combien de lignes il écarte de la vue. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisHier ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisHier}
                    title={(carnetEcransRepartisHier
                      ? t('ad.suivi.doorOublisEcransRepartisHierOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisHierHint')
                    )
                      .replace('{n}', String(ecransRepartisHierListe.length))
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisHierDetail ||
                          t('ad.suivi.doorOublisEcransRepartisHierAucun'),
                      ) + ` ${repartisHierEcartesPhrase}`}
                    onClick={() => setCarnetEcransRepartisHier((actif) => !actif)}
                  >
                    <i className="ri-sun-cloudy-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisHier').replace(
                        '{n}',
                        String(ecransRepartisHierListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisHier && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisHierOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des écrans repartis avant-hier : il ne garde que
                      ceux dont le dernier retrait tombe l'avant-veille, avec
                      le jour de ce retrait. Il complète la veille et le jour
                      même, ne retire aucun oubli, et son survol dit combien de
                      lignes il écarte de la vue. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisAvantHier ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisAvantHier}
                    title={(carnetEcransRepartisAvantHier
                      ? t('ad.suivi.doorOublisEcransRepartisAvantHierOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisAvantHierHint')
                    )
                      .replace('{n}', String(ecransRepartisAvantHierListe.length))
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisAvantHierDetail ||
                          t('ad.suivi.doorOublisEcransRepartisAvantHierAucun'),
                      ) + ` ${repartisAvantHierEcartesPhrase}`}
                    onClick={() => setCarnetEcransRepartisAvantHier((actif) => !actif)}
                  >
                    <i className="ri-arrow-left-double-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisAvantHier').replace(
                        '{n}',
                        String(ecransRepartisAvantHierListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisAvantHier && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisAvantHierOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des écrans repartis cette quinzaine : il ne garde
                      que ceux dont le dernier retrait tombe dans les quinze
                      derniers jours, avec le jour de ce retrait. Il ne retire
                      aucun oubli, et son survol dit combien de lignes il
                      écarte de la vue. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisQuinzaine ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisQuinzaine}
                    title={(carnetEcransRepartisQuinzaine
                      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisQuinzaineHint')
                    )
                      .replace('{n}', String(ecransRepartisQuinzaineListe.length))
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisQuinzaineDetail ||
                          t('ad.suivi.doorOublisEcransRepartisQuinzaineAucun'),
                      ) + ` ${repartisQuinzaineSemainePhrase} ${repartisQuinzaineEcartesPhrase}`}
                    onClick={() => setCarnetEcransRepartisQuinzaine((actif) => !actif)}
                  >
                    <i className="ri-calendar-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaine').replace(
                        '{n}',
                        String(ecransRepartisQuinzaineListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisQuinzaine && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des écrans partis dans la quinzaine puis revenus
                      au carnet : il croise les deux gestes — le dernier retrait
                      tombe dans les quinze derniers jours, et un retour le
                      suit. Il ne retire aucun oubli, et son survol dit combien
                      de lignes il écarte de la vue. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisQuinzaineRevenus ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisQuinzaineRevenus}
                    title={(carnetEcransRepartisQuinzaineRevenus
                      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisQuinzaineRevenusListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisQuinzaineRevenusDetail ||
                          t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusAucun'),
                      ) + ` ${repartisQuinzaineRevenusEcartesPhrase} ${repartisQuinzaineRevenusDelaiPhrase}`}
                    onClick={() =>
                      setCarnetEcransRepartisQuinzaineRevenus((actif) => !actif)
                    }
                  >
                    <i className="ri-calendar-todo-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenus').replace(
                        '{n}',
                        String(ecransRepartisQuinzaineRevenusListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisQuinzaineRevenus && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineRevenusOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des écrans partis dans la quinzaine et jamais
                      revenus : il ne garde que ceux-là, avec le jour de leur
                      retrait, et son survol dit combien de lignes il écarte
                      de la vue. Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisQuinzaineJamais ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisQuinzaineJamais}
                    title={(carnetEcransRepartisQuinzaineJamais
                      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineJamaisOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisQuinzaineJamaisHint')
                    )
                      .replace('{n}', String(ecransRepartisQuinzaineJamaisListe.length))
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisQuinzaineJamaisDetail ||
                          t('ad.suivi.doorOublisEcransRepartisQuinzaineJamaisAucun'),
                      ) + ` ${repartisQuinzaineJamaisEcartesPhrase}`}
                    onClick={() =>
                      setCarnetEcransRepartisQuinzaineJamais((actif) => !actif)
                    }
                  >
                    <i className="ri-logout-box-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineJamais').replace(
                        '{n}',
                        String(ecransRepartisQuinzaineJamaisListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisQuinzaineJamais && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineJamaisOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton de la quinzaine sans aucun retour : il ne garde
                      que les écrans partis dans les quinze derniers jours
                      qu’aucun retour n’a jamais ramenés au carnet, ni avant
                      ni après ce départ. Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisQuinzaineSansRetour ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisQuinzaineSansRetour}
                    title={(carnetEcransRepartisQuinzaineSansRetour
                      ? t(
                          'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourOffHint',
                        )
                      : t('ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisQuinzaineSansRetourListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisQuinzaineSansRetourDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourAucun',
                          ),
                      ) + ` ${repartisQuinzaineSansRetourEcartesPhrase}`}
                    onClick={() =>
                      setCarnetEcransRepartisQuinzaineSansRetour((actif) => !actif)
                    }
                  >
                    <i className="ri-door-closed-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineSansRetour').replace(
                        '{n}',
                        String(ecransRepartisQuinzaineSansRetourListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisQuinzaineSansRetour && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des écrans partis dans la quinzaine puis revenus
                      dans la semaine : il ne garde que ceux dont le retour
                      tombe dans les sept derniers jours, avec leur départ et
                      leur retour datés. Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisQuinzaineSemaine ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisQuinzaineSemaine}
                    title={(carnetEcransRepartisQuinzaineSemaine
                      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineSemaineOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisQuinzaineSemaineHint')
                    )
                      .replace('{n}', String(ecransRepartisQuinzaineSemaineListe.length))
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisQuinzaineSemaineDetail ||
                          t('ad.suivi.doorOublisEcransRepartisQuinzaineSemaineAucun'),
                      ) + ` ${repartisQuinzaineSemaineEcartesPhrase}`}
                    onClick={() =>
                      setCarnetEcransRepartisQuinzaineSemaine((actif) => !actif)
                    }
                  >
                    <i className="ri-arrow-left-right-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineSemaine').replace(
                        '{n}',
                        String(ecransRepartisQuinzaineSemaineListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisQuinzaineSemaine && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineSemaineOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des retours tardifs de la quinzaine : il ne garde
                      que les écrans partis dans les quinze derniers jours et
                      revenus plus de sept journées après leur départ. Son
                      survol nomme le retour le plus rapide et le plus lent,
                      avec leur délai, puis les lignes qu'il écarte de la vue. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisQuinzaineTardifs ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisQuinzaineTardifs}
                    title={(carnetEcransRepartisQuinzaineTardifs
                      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineTardifsOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisQuinzaineTardifsHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisQuinzaineTardifsListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisQuinzaineTardifsDetail ||
                          t('ad.suivi.doorOublisEcransRepartisQuinzaineTardifsAucun'),
                      ) + ` ${repartisQuinzaineTardifsBoutsPhrase} ${repartisQuinzaineTardifsPartPhrase} ${repartisQuinzaineTardifsEcartesPhrase}`}
                    onClick={() =>
                      setCarnetEcransRepartisQuinzaineTardifs((actif) => !actif)
                    }
                  >
                    <i className="ri-timer-flash-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineTardifs').replace(
                        '{n}',
                        String(ecransRepartisQuinzaineTardifsListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisQuinzaineTardifs && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineTardifsOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des retours rapides de la quinzaine : il ne garde
                      que les écrans partis dans les quinze derniers jours et
                      revenus en sept journées ou moins. Il partage le lot du
                      jeton des retours tardifs, si bien que les deux ne
                      peuvent pas se contredire, et ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisQuinzaineRapides ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisQuinzaineRapides}
                    title={(carnetEcransRepartisQuinzaineRapides
                      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineRapidesOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisQuinzaineRapidesHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisQuinzaineRapidesListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisQuinzaineRapidesDetail ||
                          t('ad.suivi.doorOublisEcransRepartisQuinzaineRapidesAucun'),
                      ) + ` ${repartisQuinzaineRapidesBoutsPhrase} ${repartisQuinzaineRapidesEcartesPhrase}`}
                    onClick={() =>
                      setCarnetEcransRepartisQuinzaineRapides((actif) => !actif)
                    }
                  >
                    <i className="ri-timer-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineRapides').replace(
                        '{n}',
                        String(ecransRepartisQuinzaineRapidesListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisQuinzaineRapides && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineRapidesOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des retours rapides et tardifs confondus : il
                      rassemble en un seul geste les deux lots du CSV, lus sur
                      la même liste de retours datés de la quinzaine. Son survol
                      les nomme un à un, puis dit les lignes qu'il écarte. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisQuinzaineReunis ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisQuinzaineReunis}
                    title={(carnetEcransRepartisQuinzaineReunis
                      ? t('ad.suivi.doorOublisEcransRepartisQuinzaineReunisOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisQuinzaineReunisHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisQuinzaineReunisListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisQuinzaineReunisDetail ||
                          t('ad.suivi.doorOublisEcransRepartisQuinzaineReunisAucun'),
                      ) + ` ${repartisQuinzaineReunisEcartesPhrase} ${repartisQuinzaineReunisPartPhrase}`}
                    onClick={() =>
                      setCarnetEcransRepartisQuinzaineReunis((actif) => !actif)
                    }
                  >
                    <i className="ri-stack-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineReunis').replace(
                        '{n}',
                        String(ecransRepartisQuinzaineReunisListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisQuinzaineReunis && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisQuinzaineReunisOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des retours de plus de quinze jours : il ne garde
                      que les écrans revenus après un départ déjà sorti de la
                      quinzaine, avec leurs deux dates et leur délai. Il ne
                      retire aucun oubli et se lève de lui-même quand plus
                      aucun écran n'est dans ce cas. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRepartisHorsQuinzaine ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRepartisHorsQuinzaine}
                    title={(carnetEcransRepartisHorsQuinzaine
                      ? t('ad.suivi.doorOublisEcransRepartisHorsQuinzaineOffHint')
                      : t('ad.suivi.doorOublisEcransRepartisHorsQuinzaineHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisHorsQuinzaineListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisHorsQuinzaineDetail ||
                          t('ad.suivi.doorOublisEcransRepartisHorsQuinzaineAucun'),
                      ) + ` ${repartisHorsQuinzaineBoutsPhrase} ${repartisHorsQuinzainePartPhrase} ${repartisHorsQuinzaineEcartesPhrase}`}
                    onClick={() =>
                      setCarnetEcransRepartisHorsQuinzaine((actif) => !actif)
                    }
                  >
                    <i className="ri-history-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRepartisHorsQuinzaine').replace(
                        '{n}',
                        String(ecransRepartisHorsQuinzaineListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRepartisHorsQuinzaine && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRepartisHorsQuinzaineOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des écrans sans aucune date de retour : il ne
                      garde que ceux dont l’historique ne nomme aucun retour,
                      ni avant ni après leur dernier retrait. Il ne retire
                      aucun oubli et se lève de lui-même quand plus aucun
                      écran n’est dans ce cas. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransAucunRetour ? 'yes' : 'no'}
                    aria-pressed={carnetEcransAucunRetour}
                    title={(carnetEcransAucunRetour
                      ? t('ad.suivi.doorOublisEcransAucunRetourOffHint')
                      : t('ad.suivi.doorOublisEcransAucunRetourHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisAucunRetourListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisAucunRetourDetail ||
                          t('ad.suivi.doorOublisEcransAucunRetourAucun'),
                      ) +
                      ` ${repartisAucunRetourEcartesPhrase} ${repartisAucunRetourPlusAncienPhrase}`}
                    onClick={() => setCarnetEcransAucunRetour((actif) => !actif)}
                  >
                    <i className="ri-calendar-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransAucunRetour').replace(
                        '{n}',
                        String(ecransRepartisAucunRetourListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransAucunRetour && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransAucunRetourOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des retours datés : le complément exact du
                      précédent — il ne garde que les écrans dont l’historique
                      porte au moins une date de retour, lus sur la même liste
                      et le même historique. Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRetoursDates ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRetoursDates}
                    title={(carnetEcransRetoursDates
                      ? t('ad.suivi.doorOublisEcransRetoursDatesOffHint')
                      : t('ad.suivi.doorOublisEcransRetoursDatesHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisRetoursDatesListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesDetail ||
                          t('ad.suivi.doorOublisEcransRetoursDatesAucun'),
                      ) +
                      ` ${repartisRetoursDatesEcartesPhrase}` +
                      ` ${repartisRetoursDatesBoutsPhrase}` +
                      ` ${repartisRetoursDatesPlusAnciensPhrase}`}
                    onClick={() => setCarnetEcransRetoursDates((actif) => !actif)}
                  >
                    <i className="ri-calendar-check-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRetoursDates').replace(
                        '{n}',
                        String(ecransRepartisRetoursDatesListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDates && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRetoursDatesOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des retours datés de la semaine : il ne garde que
                      les écrans revenus cette semaine avec une date, lus sur le
                      même historique que les délais et que la ligne du CSV. Il
                      ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRetoursDatesSemaine ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRetoursDatesSemaine}
                    title={(carnetEcransRetoursDatesSemaine
                      ? t('ad.suivi.doorOublisEcransRetoursDatesSemaineOffHint')
                      : t('ad.suivi.doorOublisEcransRetoursDatesSemaineHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisRetoursDatesSemaineListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesSemaineDetail ||
                          t('ad.suivi.doorOublisEcransRetoursDatesSemaineAucun'),
                      ) +
                      ` ${repartisRetoursDatesSemaineEcartesPhrase}` +
                      ` ${repartisRetoursDatesSemaineBoutsPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesSemaine((actif) => !actif)
                    }
                  >
                    <i className="ri-calendar-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRetoursDatesSemaine').replace(
                        '{n}',
                        String(ecransRepartisRetoursDatesSemaineListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesSemaine && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRetoursDatesSemaineOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des retours datés du mois : il ne garde que les
                      écrans revenus ce mois-ci avec une date, lus sur le même
                      historique que la semaine et que les délais. Il ne retire
                      aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRetoursDatesMois ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRetoursDatesMois}
                    title={(carnetEcransRetoursDatesMois
                      ? t('ad.suivi.doorOublisEcransRetoursDatesMoisOffHint')
                      : t('ad.suivi.doorOublisEcransRetoursDatesMoisHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisRetoursDatesMoisListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesMoisDetail ||
                          t('ad.suivi.doorOublisEcransRetoursDatesMoisAucun'),
                      ) +
                      ` ${repartisRetoursDatesMoisEcartesPhrase}` +
                      ` ${repartisRetoursDatesMoisBoutsPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesMois((actif) => !actif)
                    }
                  >
                    <i className="ri-calendar-event-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRetoursDatesMois').replace(
                        '{n}',
                        String(ecransRepartisRetoursDatesMoisListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesMois && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRetoursDatesMoisOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des retours datés du mois dernier : il ne garde
                      que les écrans revenus dans la fenêtre qui vient de se
                      fermer avec une date, lus sur le même historique que le
                      mois et que les délais. Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRetoursDatesMoisDernier ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRetoursDatesMoisDernier}
                    title={(carnetEcransRetoursDatesMoisDernier
                      ? t('ad.suivi.doorOublisEcransRetoursDatesMoisDernierOffHint')
                      : t('ad.suivi.doorOublisEcransRetoursDatesMoisDernierHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisRetoursDatesMoisDernierListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesMoisDernierDetail ||
                          t('ad.suivi.doorOublisEcransRetoursDatesMoisDernierAucun'),
                      ) +
                      ` ${repartisRetoursDatesMoisDernierEcartesPhrase} ${repartisRetoursDatesMoisDernierBoutsPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesMoisDernier((actif) => !actif)
                    }
                  >
                    <i className="ri-calendar-todo-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRetoursDatesMoisDernier').replace(
                        '{n}',
                        String(ecransRepartisRetoursDatesMoisDernierListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesMoisDernier && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRetoursDatesMoisDernierOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des retours datés de l’avant-dernier mois : il ne
                      garde que les écrans revenus dans la seconde fenêtre fermée
                      avec une date, lus sur le même historique que le mois
                      dernier. Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={
                      carnetEcransRetoursDatesAvantDernierMois ? 'yes' : 'no'
                    }
                    aria-pressed={carnetEcransRetoursDatesAvantDernierMois}
                    title={(carnetEcransRetoursDatesAvantDernierMois
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAvantDernierMoisListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAvantDernierMoisDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAvantDernierMoisEcartesPhrase} ${repartisRetoursDatesAvantDernierMoisBoutsPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAvantDernierMois(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMois',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAvantDernierMoisListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAvantDernierMois && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des deux fenêtres fermées : il réunit les écrans
                      revenus dans l’une ou l’autre — le mois dernier, puis
                      l’avant-dernier —, chacun avec sa fenêtre, pour comparer
                      les deux périodes sans les mélanger. Il ne retire aucun
                      oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={
                      carnetEcransRetoursDatesDeuxFenetres ? 'yes' : 'no'
                    }
                    aria-pressed={carnetEcransRetoursDatesDeuxFenetres}
                    title={(carnetEcransRetoursDatesDeuxFenetres
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresOffHint',
                        )
                      : t('ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresHint')
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesDeuxFenetresListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesDeuxFenetresDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesDeuxFenetresEcartesPhrase} ${repartisRetoursDatesDeuxFenetresPartPhrase} ${deuxFenetresBoutsPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesDeuxFenetres((actif) => !actif)
                    }
                  >
                    <i className="ri-layout-column-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRetoursDatesDeuxFenetres').replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesDeuxFenetresListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesDeuxFenetres && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des retours datés du trimestre : il ne garde que
                      les écrans revenus ces trois derniers mois avec une date,
                      lus sur le même historique que le mois et que les délais.
                      Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={carnetEcransRetoursDatesTrimestre ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRetoursDatesTrimestre}
                    title={(carnetEcransRetoursDatesTrimestre
                      ? t('ad.suivi.doorOublisEcransRetoursDatesTrimestreOffHint')
                      : t('ad.suivi.doorOublisEcransRetoursDatesTrimestreHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisRetoursDatesTrimestreListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesTrimestreDetail ||
                          t('ad.suivi.doorOublisEcransRetoursDatesTrimestreAucun'),
                      ) +
                      ` ${repartisRetoursDatesTrimestreEcartesPhrase} ${repartisRetoursDatesTrimestreBoutsPhrase}` +
                      ` ${repartisRetoursDatesTrimestrePlusRecentPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesTrimestre((actif) => !actif)
                    }
                  >
                    <i className="ri-calendar-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRetoursDatesTrimestre').replace(
                        '{n}',
                        String(ecransRepartisRetoursDatesTrimestreListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesTrimestre && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRetoursDatesTrimestreOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton du trimestre fermé : il ne garde que les écrans
                      revenus avec une date sur les trois mois qui précèdent
                      le mois en cours — le mois courant restant dehors. Il ne
                      retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={
                      carnetEcransRetoursDatesTrimestreFerme ? 'yes' : 'no'
                    }
                    aria-pressed={carnetEcransRetoursDatesTrimestreFerme}
                    title={(carnetEcransRetoursDatesTrimestreFerme
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesTrimestreFermeListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesTrimestreFermeDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesTrimestreFermeEcartesPhrase} ${repartisRetoursDatesTrimestreFermePlusRecentPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesTrimestreFerme(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-schedule-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesTrimestreFerme',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesTrimestreFermeListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesTrimestreFerme && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare le trimestre fermé au mois dernier :
                      leurs écrans réunis, chacun portant sa fenêtre, le mois
                      dernier déjà compté dans le trimestre fermé. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesTrimestreFermeMoisDernier
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesTrimestreFermeMoisDernier
                    }
                    title={(carnetEcransRetoursDatesTrimestreFermeMoisDernier
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesTrimestreFermeMoisDernierListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesTrimestreFermeMoisDernierDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesTrimestreFermeMoisDernierEcartesPhrase} ${repartisRetoursDatesTrimestreFermeMoisDernierPartPhrase} ${repartisRetoursDatesTrimestreFermeMoisDernierCourtPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesTrimestreFermeMoisDernier(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernier',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesTrimestreFermeMoisDernierListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesTrimestreFermeMoisDernier && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des retours datés de l'année : les écrans revenus
                      sur les douze derniers mois avec une date, lus sur le même
                      historique que les autres jetons datés. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={carnetEcransRetoursDatesAnnee ? 'yes' : 'no'}
                    aria-pressed={carnetEcransRetoursDatesAnnee}
                    title={(carnetEcransRetoursDatesAnnee
                      ? t('ad.suivi.doorOublisEcransRetoursDatesAnneeOffHint')
                      : t('ad.suivi.doorOublisEcransRetoursDatesAnneeHint')
                    )
                      .replace(
                        '{n}',
                        String(ecransRepartisRetoursDatesAnneeListe.length),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeDetail ||
                          t('ad.suivi.doorOublisEcransRetoursDatesAnneeAucun'),
                      ) +
                      ` ${repartisRetoursDatesAnneeEcartesPhrase} ${repartisRetoursDatesAnneeBoutsPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnnee((actif) => !actif)
                    }
                  >
                    <i className="ri-calendar-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.doorOublisEcransRetoursDatesAnnee').replace(
                        '{n}',
                        String(ecransRepartisRetoursDatesAnneeListe.length),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnnee && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRetoursDatesAnneeOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des retours datés de l’année fermée : les écrans
                      revenus sur les douze mois qui précèdent le mois en
                      cours, le mois courant restant dehors. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermee ? 'yes' : 'no'
                    }
                    aria-pressed={carnetEcransRetoursDatesAnneeFermee}
                    title={(carnetEcransRetoursDatesAnneeFermee
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeEcartesPhrase} ${repartisRetoursDatesAnneeFermeeBoutsPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermee(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermee',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermee && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare l’année fermée et le trimestre
                      fermé : il ne garde que leurs écrans, chacun portant la
                      fenêtre qui le tient — le trimestre d’abord, puis le
                      reste de l’année. Le trimestre étant déjà compté dans
                      l’année, aucun écran n’y pèse deux fois. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreFerme
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreFerme
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreFerme
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreFermeListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreFermeDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreFermeEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreFermePartPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreFermeRecentsPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreFermeMedianePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreFerme(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-event-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFerme',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreFermeListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreFerme && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des deux derniers mois fermés : il ne garde que
                      les écrans de l’avant-dernier mois et de l’année fermée,
                      chacun portant la fenêtre qui le tient — l’avant-dernier
                      mois d’abord, puis le reste de l’année. L’avant-dernier
                      mois étant déjà compté dans l’année, aucun écran n’y pèse
                      deux fois. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesDeuxMoisFermes ? 'yes' : 'no'
                    }
                    aria-pressed={carnetEcransRetoursDatesDeuxMoisFermes}
                    title={(carnetEcransRetoursDatesDeuxMoisFermes
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesOffHint',
                        )
                      : t('ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesHint')
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesDeuxMoisFermesListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesDeuxMoisFermesDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesDeuxMoisFermesEcartesPhrase} ${repartisRetoursDatesDeuxMoisFermesPartPhrase} ${repartisRetoursDatesDeuxMoisFermesCourtPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesDeuxMoisFermes(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-schedule-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermes',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesDeuxMoisFermesListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesDeuxMoisFermes && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t('ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesOn')
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare l’avant-dernier mois et le mois
                      dernier : il ne garde que leurs écrans, chacun portant la
                      fenêtre qui le tient — le mois dernier d’abord, puis
                      l’avant-dernier. Les deux mois ne se recouvrant pas, aucun
                      écran n’y pèse deux fois. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAvantDernierMoisMoisDernier
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAvantDernierMoisMoisDernier
                    }
                    title={(carnetEcransRetoursDatesAvantDernierMoisMoisDernier
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAvantDernierMoisMoisDernierListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAvantDernierMoisMoisDernierDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAvantDernierMoisMoisDernierEcartesPhrase} ${repartisRetoursDatesAvantDernierMoisMoisDernierPartPhrase} ${repartisRetoursDatesAvantDernierMoisMoisDernierRecentsPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAvantDernierMoisMoisDernier(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernier',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAvantDernierMoisMoisDernierListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAvantDernierMoisMoisDernier && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare le mois dernier et le trimestre
                      fermé : il ne garde que leurs écrans, chacun portant la
                      fenêtre qui le tient — le mois dernier d’abord, puis le
                      reste du trimestre fermé. Le mois dernier étant déjà
                      compté dans le trimestre, aucun écran n’y pèse deux
                      fois. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesMoisDernierTrimestreFerme
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesMoisDernierTrimestreFerme
                    }
                    title={(carnetEcransRetoursDatesMoisDernierTrimestreFerme
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesMoisDernierTrimestreFermeListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesMoisDernierTrimestreFermeDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesMoisDernierTrimestreFermeEcartesPhrase} ${repartisRetoursDatesMoisDernierTrimestreFermePartPhrase} ${repartisRetoursDatesMoisDernierTrimestreFermeCourtPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesMoisDernierTrimestreFerme(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-check-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFerme',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesMoisDernierTrimestreFermeListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesMoisDernierTrimestreFerme && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare l’avant-dernier mois et le trimestre
                      fermé : il ne garde que leurs écrans, chacun portant la
                      fenêtre qui le tient — l’avant-dernier mois d’abord, puis
                      le reste du trimestre fermé. L’avant-dernier mois étant
                      déjà compté dans le trimestre, aucun écran n’y pèse deux
                      fois. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAvantDernierMoisTrimestreFerme
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAvantDernierMoisTrimestreFerme
                    }
                    title={(carnetEcransRetoursDatesAvantDernierMoisTrimestreFerme
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAvantDernierMoisTrimestreFermeListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAvantDernierMoisTrimestreFermeDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAvantDernierMoisTrimestreFermeEcartesPhrase} ${repartisRetoursDatesAvantDernierMoisTrimestreFermePartPhrase} ${repartisRetoursDatesAvantDernierMoisTrimestreFermeCourtPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAvantDernierMoisTrimestreFerme(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-todo-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFerme',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAvantDernierMoisTrimestreFermeListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAvantDernierMoisTrimestreFerme && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare l’année fermée et le mois dernier :
                      il ne garde que leurs écrans, chacun portant la fenêtre
                      qui le tient — le mois dernier d’abord, puis le reste de
                      l’année fermée. Le mois dernier étant déjà compté dans
                      l’année, aucun écran n’y pèse deux fois. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeMoisDernier ? 'yes' : 'no'
                    }
                    aria-pressed={carnetEcransRetoursDatesAnneeFermeeMoisDernier}
                    title={(carnetEcransRetoursDatesAnneeFermeeMoisDernier
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeMoisDernierListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeMoisDernierDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeMoisDernierEcartesPhrase} ${repartisRetoursDatesAnneeFermeeMoisDernierPartPhrase} ${repartisRetoursDatesAnneeFermeeMoisDernierCourtPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeMoisDernier(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernier',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeMoisDernierListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeMoisDernier && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare l’année fermée et l’avant-dernier mois :
                      il ne garde que leurs écrans, chacun portant la fenêtre
                      qui le tient — l’avant-dernier mois d’abord, puis le reste
                      de l’année fermée. L’avant-dernier mois étant déjà compté
                      dans l’année, aucun écran n’y pèse deux fois. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeAvantDernierMois
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeAvantDernierMois
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeAvantDernierMois
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeAvantDernierMoisListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeAvantDernierMoisDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeAvantDernierMoisEcartesPhrase} ${repartisRetoursDatesAnneeFermeeAvantDernierMoisPartPhrase} ${repartisRetoursDatesAnneeFermeeAvantDernierMoisCourtPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeAvantDernierMois(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMois',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeAvantDernierMoisListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeAvantDernierMois && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare le trimestre fermé et l’avant-dernier
                      mois : il ne garde que leurs écrans, chacun portant la
                      fenêtre qui le tient — le trimestre fermé d’abord, puis
                      l’avant-dernier mois. L’avant-dernier mois étant déjà
                      compté dans le trimestre, aucun écran n’y pèse deux fois. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesTrimestreFermeAvantDernierMois
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesTrimestreFermeAvantDernierMois
                    }
                    title={(carnetEcransRetoursDatesTrimestreFermeAvantDernierMois
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesTrimestreFermeAvantDernierMoisListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesTrimestreFermeAvantDernierMoisDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesTrimestreFermeAvantDernierMoisEcartesPhrase} ${repartisRetoursDatesTrimestreFermeAvantDernierMoisPartPhrase} ${repartisRetoursDatesTrimestreFermeAvantDernierMoisMedianePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesTrimestreFermeAvantDernierMois(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMois',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesTrimestreFermeAvantDernierMoisListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesTrimestreFermeAvantDernierMois && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesTrimestreFermeAnneeFerme
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesTrimestreFermeAnneeFerme
                    }
                    title={(carnetEcransRetoursDatesTrimestreFermeAnneeFerme
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesTrimestreFermeAnneeFermeListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesTrimestreFermeAnneeFermeDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesTrimestreFermeAnneeFermeEcartesPhrase} ${repartisRetoursDatesTrimestreFermeAnneeFermePartPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesTrimestreFermeAnneeFerme(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-event-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFerme',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesTrimestreFermeAnneeFermeListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesTrimestreFermeAnneeFerme && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare l’année fermée et le mois en cours :
                      le mois en cours d’abord, puis le reste de l’année, chacun
                      portant la fenêtre qui le tient. Les deux fenêtres ne se
                      recouvrant pas, aucun écran n’y pèse deux fois. Il ne
                      retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeMoisEnCours
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeMoisEnCours
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeMoisEnCours
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeMoisEnCoursListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeMoisEnCoursDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeMoisEnCoursEcartesPhrase} ${repartisRetoursDatesAnneeFermeeMoisEnCoursPartPhrase} ${repartisRetoursDatesAnneeFermeeMoisEnCoursRecentsPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeMoisEnCours(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-todo-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCours',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeMoisEnCoursListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeMoisEnCours && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare le mois en cours et le mois dernier :
                      le mois en cours d’abord, puis le mois dernier, chacun
                      portant la fenêtre qui le tient. Les deux mois ne se
                      recouvrant pas, aucun écran n’y pèse deux fois. Il ne
                      retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesMoisEnCoursMoisDernier
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={carnetEcransRetoursDatesMoisEnCoursMoisDernier}
                    title={(carnetEcransRetoursDatesMoisEnCoursMoisDernier
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesMoisEnCoursMoisDernierListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesMoisEnCoursMoisDernierDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesMoisEnCoursMoisDernierEcartesPhrase} ${repartisRetoursDatesMoisEnCoursMoisDernierPartPhrase} ${repartisRetoursDatesMoisEnCoursMoisDernierMedianePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesMoisEnCoursMoisDernier(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-todo-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernier',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesMoisEnCoursMoisDernierListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesMoisEnCoursMoisDernier && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare l’avant-dernier mois et le mois en
                      cours : l’avant-dernier mois d’abord, puis le mois en
                      cours, chacun portant la fenêtre qui le tient. Les deux
                      mois ne se recouvrant pas, aucun écran n’y pèse deux
                      fois. Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAvantDernierMoisMoisEnCours
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={carnetEcransRetoursDatesAvantDernierMoisMoisEnCours}
                    title={(carnetEcransRetoursDatesAvantDernierMoisMoisEnCours
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAvantDernierMoisMoisEnCoursListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAvantDernierMoisMoisEnCoursDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAvantDernierMoisMoisEnCoursEcartesPhrase} ${repartisRetoursDatesAvantDernierMoisMoisEnCoursPartPhrase} ${repartisRetoursDatesAvantDernierMoisMoisEnCoursMedianePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAvantDernierMoisMoisEnCours(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCours',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAvantDernierMoisMoisEnCoursListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAvantDernierMoisMoisEnCours && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare le mois dernier et le trimestre en
                      cours : le mois dernier d’abord, puis le reste du
                      trimestre, chacun portant le nom de sa fenêtre. Le mois
                      dernier étant déjà compté dans le trimestre, aucun écran
                      n’y pèse deux fois. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesMoisDernierTrimestre
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={carnetEcransRetoursDatesMoisDernierTrimestre}
                    title={(carnetEcransRetoursDatesMoisDernierTrimestre
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesMoisDernierTrimestreListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesMoisDernierTrimestreDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesMoisDernierTrimestreEcartesPhrase} ${repartisRetoursDatesMoisDernierTrimestrePartPhrase} ${repartisRetoursDatesMoisDernierTrimestreMedianePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesMoisDernierTrimestre(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-todo-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestre',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesMoisDernierTrimestreListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesMoisDernierTrimestre && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare l’année fermée et le trimestre en
                      cours : l’année fermée d’abord, puis ce que le trimestre
                      y ajoute, chacun portant le nom de sa fenêtre. Les deux
                      fenêtres se recouvrant, un écran déjà nommé n’y revient
                      pas. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestre
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={carnetEcransRetoursDatesAnneeFermeeTrimestre}
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestre
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestrePartPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreMedianePhrase} ${repartisRetoursDatesAnneeFermeeTrimestreCourtPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestre(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-todo-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestre',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestre && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton de ce que l’année fermée ajoute seule : les
                      écrans qu’elle nomme et qu’aucun autre jeton de la série
                      ne retient — ni le mois en cours, ni le mois dernier, ni
                      l’avant-dernier mois, ni le trimestre fermé, ni la
                      semaine. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeSeule ? 'yes' : 'no'
                    }
                    aria-pressed={carnetEcransRetoursDatesAnneeFermeeSeule}
                    title={(carnetEcransRetoursDatesAnneeFermeeSeule
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeSeuleListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeSeuleDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeSeuleEcartesPhrase} ${repartisRetoursDatesAnneeFermeeSeulePartPhrase} ${repartisRetoursDatesAnneeFermeeSeuleMedianePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeSeule(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-todo-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeule',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeSeuleListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeSeule && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton jumeau de l’année fermée seule : ce que le
                      trimestre en cours nomme et que l’année fermée ne nomme
                      pas. Les deux additions se lisent alors côte à côte. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesTrimestreSeule ? 'yes' : 'no'
                    }
                    aria-pressed={carnetEcransRetoursDatesTrimestreSeule}
                    title={(carnetEcransRetoursDatesTrimestreSeule
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesTrimestreSeuleListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesTrimestreSeuleDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesTrimestreSeuleEcartesPhrase} ${repartisRetoursDatesTrimestreSeulePartPhrase} ${repartisRetoursDatesAnneeFermeeSeuleMedianePhrase} ${repartisRetoursDatesTrimestreSeuleMedianePhrase} ${repartisRetoursDatesTrimestreSeuleCourtPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesTrimestreSeule(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeule',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesTrimestreSeuleListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesTrimestreSeule && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton des deux additions réunies : ce que l’année
                      fermée ajoute seule, puis ce que le trimestre en cours
                      ajoute seul, chacun portant la fenêtre qui le tient. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeule
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeule
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeule
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleHint',
                        )
                    )
                      .replace(
                        '{a}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeSeuleListe.length,
                        ),
                      )
                      .replace(
                        '{b}',
                        String(
                          ecransRepartisRetoursDatesTrimestreSeuleListe.length,
                        ),
                      )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeulePartPhrase} ${repartisRetoursDatesAnneeFermeeSeuleMedianePhrase} ${repartisRetoursDatesTrimestreSeuleMedianePhrase} ${repartisRetoursDatesTrimestreSeuleCourtPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeule(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-check-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeule',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeule && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare directement les deux milieux : des
                      deux additions réunies, il ne garde que les écrans dont
                      le délai dépasse le milieu du lot réuni, pour lire d’un
                      même regard la ligne de partage. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe.length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseBoutsPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-scales-3-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseListe.length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton de la fenêtre la plus proche : parmi les écrans
                      au-delà du milieu réuni, il ne garde que ceux revenus
                      cette semaine, pour lire ce que la semaine en retient. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemainePlusRecentPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-event-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui compare la semaine au lot réuni : les écrans
                      revenus cette semaine passent devant, puis le reste du
                      lot, chacun avec son délai — la semaine se juge d’un mot. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianePhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisPlusLentPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-speed-up-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton de l’avance de la semaine : parmi les écrans du lot
                      revenus cette semaine, ceux qui reviennent plus vite que le
                      milieu du lot réuni — la semaine se juge d’un mot. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianePhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapidePlusRapidePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-timer-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui réunit la semaine rapide et le reste du lot
                      réuni : les écrans de la semaine revenus plus vite que le
                      milieu d’abord, puis ce que le lot montre en plus — pour
                      les lire d’un même regard. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisEcartesPhrase} ${
                        repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisPlusRecentPhrase
                      } ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisMedianePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-rocket-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton du reste du lot réuni : la semaine rapide déjà
                      lue laisse les écrans du lot qu’elle ne nomme pas — pour
                      relire ce qu’il reste du lot sans repasser par l’avance. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusAncienPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-filter-3-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton du reste revenu avant le milieu réuni : parmi les
                      écrans du reste, ceux qui devancent le milieu du lot — pour
                      relire ce qui revient plus vite que lui une fois la semaine
                      rapide lue. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuPlusRapidePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-hourglass-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui réunit le reste avant le milieu et le reste
                      après : les deux parts du reste posées côte à côte, pour
                      les lire d’un même regard sans repasser par l’avance. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusLentPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-contrast-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui réunit le reste avant, au milieu et après :
                      les trois parts posées côte à côte, pour les lire d’un
                      même regard sans repasser par les autres jetons. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisMedianePhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisPlusRecentPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-layout-row-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton du reste revenu après le milieu réuni : le
                      complément de celui d’avant, ses écrans relus seuls. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuPlusLentPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-contrast-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton du milieu exact : seul, il ne garde que les
                      écrans du reste revenus pile sur le milieu du lot réuni,
                      pour les relire seuls. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisPlusRecentPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPlusLentPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemainePhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriodePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-focus-3-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton du reste avant le milieu et du milieu exact :
                      les deux parts lues d’un même regard, l’après laissé
                      dehors. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuMedianePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-layout-column-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton de la part d’avant, resserrée sur la semaine :
                      les écrans du reste revenus avant le milieu dont le
                      retour tombe cette semaine, pour relire cette part-là à
                      la fenêtre la plus proche. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemainePlusLentPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuMedianePhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-check-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusLentPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusRecentPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-focus-3-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisSemaineMoisPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisPlusTotPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteMedianePhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtRestePlusAncienPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-links-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianePhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentMoisPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesDelaiPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartPlusAncienPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-check-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton du milieu exact revenu hors du mois : parmi les
                      écrans du reste tombés pile sur le milieu du lot réuni, il
                      ne garde que ceux dont le retour tombe hors du mois — le
                      complément exact de la part du mois, relu à côté d’elle.
                      Il ne retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisMedianePhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPlusAncienPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-close-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* Le jeton qui réunit le milieu exact de la semaine et celui
                      resté hors du mois : les trois fenêtres — la semaine, le
                      mois et son dehors — se lisent alors ensemble. Il ne
                      retire aucun oubli. */}
                  <button
                    type="button"
                    className="suivi-reste-oublis-ecrans-jeton-btn"
                    data-on={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine
                        ? 'yes'
                        : 'no'
                    }
                    aria-pressed={
                      carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine
                    }
                    title={(carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine
                      ? t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineOffHint',
                        )
                      : t(
                          'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineHint',
                        )
                    )
                      .replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineListe
                            .length,
                        ),
                      )
                      .replace('{total}', String(ecransRepartisListe.length))
                      .replace(
                        '{detail}',
                        ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineDetail ||
                          t(
                            'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineAucun',
                          ),
                      ) +
                      ` ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineEcartesPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePartsPhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianePhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusRapidePhrase} ${repartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusLentPhrase}`}
                    onClick={() =>
                      setCarnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine(
                        (actif) => !actif,
                      )
                    }
                  >
                    <i className="ri-calendar-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine',
                      ).replace(
                        '{n}',
                        String(
                          ecransRepartisRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineListe
                            .length,
                        ),
                      )}
                    </span>
                  </button>
                  {carnetEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine && (
                    <span className="suivi-reste-oublis-ecrans-jeton-on">
                      {t(
                        'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineOn',
                      )
                        .replace('{n}', String(ecransAffiches.length))
                        .replace('{total}', String(ecransRepartisListe.length))}
                    </span>
                  )}
                  {/* La petite gomme du dépli : les jetons posés resserrent la
                      vue des écrans ; elle les éteint tous d'un geste et rend
                      les écrans du carnet, sans retirer un seul oubli. */}
                  {jetonsDepli > 0 && (
                    <button
                      type="button"
                      className="suivi-reste-oublis-jetons-clear"
                      title={`${t('ad.suivi.doorOublisEcransJetonsClearHint')
                        .replace('{n}', String(jetonsDepli))
                        .replace('{total}', String(ecransCarnet.length))} ${
                        lignesRendues > 0
                          ? t('ad.suivi.doorOublisEcransJetonsClearRendues')
                              .replace('{rendues}', String(lignesRendues))
                              .replace('{total}', String(ecransCarnet.length))
                          : t('ad.suivi.doorOublisEcransJetonsClearRenduesNone')
                      }${
                        jetonsDepliDetail
                          ? ` ${t('ad.suivi.doorOublisEcransJetonsClearEach').replace(
                              '{detail}',
                              jetonsDepliDetail,
                            )}`
                          : ''
                      }`}
                      aria-label={t('ad.suivi.doorOublisEcransJetonsClear')}
                      onClick={onRendreTousEcrans}
                    >
                      <i className="ri-eraser-line" aria-hidden="true"></i>
                    </button>
                  )}
                </p>
              <ul className="suivi-reste-oublis-ecrans" dir="ltr">
                {ecransAffiches.map((ligne) => (
                  <li
                    className="suivi-reste-oublis-ecran"
                    key={ligne.ecran}
                    data-on={carnetEcran === ligne.ecran ? 'yes' : 'no'}
                  >
                    <i className="ri-folder-open-line" aria-hidden="true"></i>
                    {/* Le nom de l’écran dit, au survol, combien de jours
                        séparent son premier oubli de son dernier — lus sur les
                        deux bouts de ses seuls gestes. Un appui ne garde que
                        ses gestes, sans repasser par la liste du carnet. */}
                    <button
                      type="button"
                      className="suivi-reste-oublis-ecran-nom"
                      data-btn="yes"
                      data-on={carnetEcran === ligne.ecran ? 'yes' : 'no'}
                      aria-pressed={carnetEcran === ligne.ecran}
                      title={`${
                        joursEntre(ligne.premier, ligne.dernier) > 0
                          ? t('ad.suivi.doorOublisEcranNomHint')
                              .replace('{ecran}', ligne.ecran)
                              .replace(
                                '{n}',
                                String(joursEntre(ligne.premier, ligne.dernier)),
                              )
                              .replace('{premier}', jour(ligne.premier, lang))
                              .replace('{dernier}', jour(ligne.dernier, lang))
                          : t('ad.suivi.doorOublisEcranNomHintOne')
                              .replace('{ecran}', ligne.ecran)
                              .replace('{date}', jour(ligne.dernier, lang))
                      } · ${
                        carnetEcran === ligne.ecran
                          ? t('ad.suivi.doorOublisEcranNomAppuiOff')
                          : t('ad.suivi.doorOublisEcranNomAppui').replace(
                              '{n}',
                              String(compteParEcran[ligne.ecran] ?? ligne.n),
                            )
                      }`}
                      onClick={() => {
                        /* Un premier appui ne garde que les gestes de cet écran
                           et laisse une trace de ce qu’il a servi à lire — le
                           CSV du carnet la nomme avec le jour du dernier geste.
                           Un second appui, sur le nom déjà retenu, retire ses
                           gestes du carnet : le même geste que sa petite gomme,
                           sans passer par elle. */
                        if (carnetEcran === ligne.ecran) {
                          retirerEcranCarnet(ligne.ecran, true);
                          return;
                        }
                        setCarnetEcran(ligne.ecran);
                        markEcranAppuye(ligne.ecran, ligne.dernier);
                      }}
                    >
                      {ligne.ecran}
                    </button>
                    <span className="suivi-reste-oublis-ecran-n">
                      {repartisDates.has(ligne.ecran)
                        ? t('ad.suivi.doorOublisEcranReparti').replace(
                            '{date}',
                            jour(repartisDates.get(ligne.ecran) ?? '', lang),
                          )
                        : t('ad.suivi.doorOublisEcranDeplie').replace(
                            '{n}',
                            String(ligne.n),
                          )}
                    </span>
                    <span className="suivi-reste-oublis-ecran-jour">
                      {jour(ligne.dernier, lang)}
                    </span>
                    {/* Un écran revenu puis reparti n'a plus de geste au
                        carnet : sa ligne se passe de gomme, il n'y a rien à
                        retirer. */}
                    {!repartisDates.has(ligne.ecran) && (
                    <button
                      type="button"
                      className="suivi-reste-oublis-ecran-clear"
                      title={t('ad.suivi.doorOublisEcranGommeHint')
                        .replace('{ecran}', ligne.ecran)
                        .replace('{n}', String(ligne.n))
                        .replace('{premier}', jour(ligne.premier, lang))
                        .replace('{dernier}', jour(ligne.dernier, lang))}
                      aria-label={t('ad.suivi.doorOublisEcranGomme')}
                      onClick={() => {
                        /* La gomme d’un écran retire ses gestes un à un, sur le
                           carnet de cet appareil : les visites retenues et le
                           plan ne bougent pas. */
                        retirerEcranCarnet(ligne.ecran);
                      }}
                    >
                      <i className="ri-eraser-line" aria-hidden="true"></i>
                    </button>
                    )}
                  </li>
                ))}
              </ul>
              </>
            )}
            <ul dir="ltr">
              {journalCarnet.map((geste) => (
                <li className="suivi-reste-oublis-geste" key={`${geste.lien}|${geste.date}`}>
                  <i className="ri-door-open-line" aria-hidden="true"></i>
                  {carnetTriEcran ? (
                    <button
                      type="button"
                      className="suivi-reste-oublis-geste-ecran"
                      data-btn="yes"
                      data-on={
                        (geste.ecran || geste.lien) === carnetEcran ? 'yes' : 'no'
                      }
                      aria-pressed={(geste.ecran || geste.lien) === carnetEcran}
                      title={t('ad.suivi.doorOublisEcranTokenHint')
                        .replace('{ecran}', geste.ecran)
                        .replace(
                          '{n}',
                          String(compteParEcran[geste.ecran || geste.lien] ?? 1),
                        )}
                      onClick={() => {
                        const retenir = carnetEcran !== (geste.ecran || geste.lien);
                        setCarnetEcran((actif) =>
                          actif === (geste.ecran || geste.lien)
                            ? null
                            : geste.ecran || geste.lien,
                        );
                        if (retenir) markEcranAppuye(geste.ecran || geste.lien, geste.date);
                      }}
                    >
                      {geste.ecran}
                    </button>
                  ) : (
                    <span className="suivi-reste-oublis-geste-ecran">{geste.ecran}</span>
                  )}
                  <span className="suivi-reste-oublis-geste-chantier">
                    {chantierDePorte(geste.lien) ?? t('ad.suivi.doorOublisChantierAucun')}
                  </span>
                  <span className="suivi-reste-oublis-geste-jour">
                    {jour(geste.date, lang)}
                  </span>
                  <button
                    type="button"
                    className="suivi-reste-oublis-geste-clear"
                    title={t('ad.suivi.doorOublisLineClearHint')
                      .replace('{ecran}', geste.ecran)
                      .replace('{date}', jour(geste.date, lang))}
                    aria-label={t('ad.suivi.doorOublisLineClear')}
                    onClick={() => {
                      setOublis(removeOubliPorte(geste.lien, geste.date));
                      setResteOublie(
                        t('ad.suivi.doorOublisLineCleared').replace('{ecran}', geste.ecran),
                      );
                    }}
                  >
                    <i className="ri-eraser-line" aria-hidden="true"></i>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Ce que la petite gomme d'une porte vient de rendre, dit sous la
            liste : la visite de cette seule porte, oubliée sur cet appareil. */}
        {resteOublie && (
          <p className="suivi-reste-copie-flash" data-tone="ok" role="status" aria-live="polite">
            <i className="ri-eraser-line" aria-hidden="true"></i>
            <span>{resteOublie}</span>
          </p>
        )}
        {/* Ce que la copie vient de faire, dit sous la liste : les lignes
            retenues sont parties avec le nom de leur écran. */}
        {resteCopie && (
          <p
            className="suivi-reste-copie-flash"
            data-tone={resteCopie === 'ok' ? 'ok' : 'warn'}
            role="status"
            aria-live="polite"
          >
            <i
              className={
                resteCopie === 'ok' ? 'ri-check-double-line' : 'ri-error-warning-line'
              }
              aria-hidden="true"
            ></i>
            <span>
              {resteCopie === 'ok'
                ? t('ad.suivi.resteCopied').replace('{n}', String(resteAvecPorte.length))
                : t('ad.suivi.resteCopyFail')}
            </span>
          </p>
        )}
      </section>

      {/* La liste de relecture du plan, portée ici : trente écrans, une case
          arabe et une case anglais chacun, gardées sur cet appareil. Une
          pastille d'en-tête peut l'ouvrir resserrée sur sa langue. */}
      <AdminRelecture focus={relectureFocus} />

      <section className="suivi-block">
        <div className="suivi-block-head">
          <h3 className="suivi-block-title">{t('ad.suivi.phasesTitle')}</h3>
        </div>
        <ol className="suivi-phases" dir="ltr">
          {SUIVI_PHASES.map((phase) => (
            <li className="suivi-phase" key={phase.numero} data-etat={phase.etat}>
              <span className="suivi-phase-dot" aria-hidden="true">
                <i className={ETAT_PHASE[phase.etat].icone}></i>
              </span>
              <div className="suivi-phase-body">
                <p className="suivi-phase-head">
                  <span className="suivi-phase-n">
                    {t('ad.suivi.phase')} {phase.numero}
                  </span>
                  <b>{phase.titre}</b>
                  <span className="suivi-phase-etat" data-etat={phase.etat}>
                    {t(ETAT_PHASE[phase.etat].cle)}
                  </span>
                </p>
                <p className="suivi-phase-goal">{phase.objectif}</p>
                <ul className="suivi-phase-livs">
                  {phase.livrables.map((liv) => (
                    <li key={liv.texte} data-fait={liv.fait ? 'yes' : 'no'}>
                      <i className={liv.fait ? 'ri-check-line' : 'ri-subtract-line'} aria-hidden="true"></i>
                      {liv.texte}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="suivi-block">
        <div className="suivi-block-head">
          <h3 className="suivi-block-title">{t('ad.suivi.blocagesTitle')}</h3>
        </div>
        <ul className="suivi-blocages" dir="ltr">
          {SUIVI_BLOCAGES.map((bloc) => (
            <li className="suivi-blocage" key={bloc.titre} data-etat={bloc.etat}>
              <p className="suivi-blocage-head">
                <i className={ETAT_BLOCAGE[bloc.etat].icone} aria-hidden="true"></i>
                <b>{bloc.titre}</b>
                <span className="suivi-blocage-etat">{t(ETAT_BLOCAGE[bloc.etat].cle)}</span>
              </p>
              <p className="suivi-blocage-txt">{bloc.texte}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="admin-muted admin-journal-note">{t('ad.suivi.note')}</p>
    </section>
  );
}