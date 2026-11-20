/** Les sections de la console, dans l'ordre de la barre : la même liste sert
 *  aux onglets de la page et à ceux que la fiche d'un compte reprend. */
export type AdminSection =
  | 'clients'
  | 'paiements'
  | 'annonces'
  | 'demandes'
  | 'messages'
  | 'journal'
  | 'suivi'
  | 'params';

/** Un onglet de la console : son icône, son libellé et son compte, quand il
 *  en a un. */
export type AdminTab = {
  key: AdminSection;
  label: string;
  icon: string;
  count: number | null;
};

/** Un abonnement tel qu'il est enregistré dans la table `abonnements`. */
export type AdminAbonnement = {
  id: number | string;
  artisan_id: string | null;
  entreprise: string;
  email: string | null;
  metier: string | null;
  ville: string | null;
  offre: string;
  statut: string;
  montant_mensuel: number | string | null;
  canal_paiement: string | null;
  date_debut: string | null;
  date_echeance: string | null;
  created_at: string;
};

/** Un compte de la plateforme, réduit à ce que la console affiche. */
export type AdminCompte = {
  id: string;
  email: string | null;
  nom: string | null;
  organisme: string | null;
  metier: string | null;
  wilaya: string | null;
  telephone?: string | null;
  pays: string | null;
  formule: string | null;
  etablissements: number | null;
  role: string | null;
  /** L'instant où le rôle a été écrit depuis la console : il date la
   *  promotion, quand la colonne est renseignée. Une promotion plus ancienne
   *  que cette note n'a pas de date. */
  role_changed_at?: string | null;
  created_at: string;
};

/** Un compte réduit à ce qu'il faut pour ouvrir sa fiche depuis un fil de la
 *  messagerie : son identifiant, son adresse, le nom qu'on lit à l'écran, et
 *  le pays qui donne son aire du monde à la liste des fils. */
export type AdminCompteRef = {
  id: string;
  email: string | null;
  nom: string;
  /** Le pays lu sur la fiche du compte : il situe l'interlocuteur dans une
   *  aire du monde, sans ouvrir son dossier. */
  pays?: string | null;
};

/** Un dépôt (annonce ou offre d'emploi) et son état de relecture. */
export type AdminAnnonce = {
  id: string;
  kind: string | null;
  rubrique: string | null;
  titre: string;
  organisation: string | null;
  budget: string | null;
  wilaya: string | null;
  pays: string | null;
  email: string | null;
  telephone: string | null;
  statut: string;
  created_at: string;
};

/** Une conversation, telle que la liste de gauche la montre. */
export type AdminConversation = {
  id: string;
  kind: string | null;
  sujet: string | null;
  nom_a: string | null;
  nom_b: string | null;
  user_a: string | null;
  user_b: string | null;
  last_message: string | null;
  last_at: string | null;
  created_at: string;
};

export type AdminMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  corps: string;
  created_at: string;
};

export type AdminMembre = { id: string; email: string | null; nom: string | null };

/** Une demande B2B envoyée par un compte, telle que la fiche la relit. */
export type AdminDemandeB2b = {
  id: string;
  reference: string | null;
  dest_name: string | null;
  nom: string | null;
  email: string | null;
  organisme: string | null;
  quantite: string | null;
  delai: string | null;
  budget: string | null;
  message: string | null;
  statut: string | null;
  created_at: string;
};

/** Une demande B2B est encore à traiter tant que son état ne dit pas
 *  « traitée » : c'est le seul état qui ferme la ligne, et il vient du serveur. */
export function demandeB2bATraiter(row: AdminDemandeB2b): boolean {
  return (row.statut || '').trim().toLowerCase() !== 'traitee';
}

/** Les demandes d'un compte encore à traiter, la plus ancienne en tête : la
 *  fiche les compte et les lit dans l'ordre où elles attendent, jamais dans
 *  l'ordre où elles sont arrivées à l'écran. */
export function demandesB2bATraiter(rows: AdminDemandeB2b[]): AdminDemandeB2b[] {
  return triDemandesParAnciennete(rows.filter(demandeB2bATraiter));
}

/** Le tri de la fiche : à traiter d'abord, puis la plus ancienne en tête. Une
 *  date manquante ferme la marche plutôt que de fausser le rang. */
export function triDemandesParAnciennete(rows: AdminDemandeB2b[]): AdminDemandeB2b[] {
  const stamp = (iso?: string | null) => {
    if (!iso) return Number.POSITIVE_INFINITY;
    const value = new Date(iso).getTime();
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
  };
  return [...rows].sort((a, b) => {
    const aReste = demandeB2bATraiter(a);
    const bReste = demandeB2bATraiter(b);
    if (aReste !== bReste) return aReste ? -1 : 1;
    return stamp(a.created_at) - stamp(b.created_at);
  });
}

/** Ce que la fiche d'un compte ramène : les dépôts et les demandes qui lui
 *  sont rattachés, sur son identifiant comme sur son adresse. */
export type AdminCompteFiche = {
  compte: AdminCompte | null;
  abonnements: AdminAbonnement[];
  annonces: AdminAnnonce[];
  demandes: AdminDemandeB2b[];
};

/** Un état est « fermé » dès qu'il parle d'arrêt, quelle que soit sa graphie. */
export const estFerme = (statut: string) =>
  /resil|annul|suspend|expir|inactif|cancel/.test(statut);

/** L'ordre retenu pour le tableau des abonnés : celui de la table, l'échéance
 *  la plus urgente en tête, la plus lointaine en tête, le nombre de relectures
 *  longues, le nombre de dépôts arrivés après la relance, ou le nombre de fils
 *  en sommeil — le compte le plus chargé d'abord, ou l'inverse. */
export type AdminTri =
  | 'none'
  | 'due'
  | 'dueDesc'
  | 'late'
  | 'lateDesc'
  | 'apres'
  | 'apresDesc'
  | 'sleep'
  | 'sleepDesc';

/** L'essai se reconnaît au mot, jamais à sa position. */
export const estEssai = (statut: string) => /essai|trial|freemium/.test(statut);

/** Le seuil des échéances proches, en jours. */
export const JOURS_ECHEANCE_PROCHE = 30;

/** Le seuil d'une relecture qui traîne, en jours. */
export const JOURS_RELECTURE_LONGUE = 7;

/** Ce que compte un compte : ses dépôts publiés, refusés, le reste encore en
 *  relecture, et parmi ceux-là ceux qui attendent depuis plus de sept jours.
 *  Quatre chiffres lus sur les mêmes lignes. */
export type AdminDepotsCompte = {
  publies: number;
  refuses: number;
  attente: number;
  /** Les relectures qui traînent — comprises dans `attente`, jamais en plus. */
  longues: number;
};

/** Les compteurs de dépôts, rangés par adresse de compte — la seule clé que
 *  les dépôts et les abonnements ont en commun. */
export function depotsParEmail(annonces: AdminAnnonce[]): Map<string, AdminDepotsCompte> {
  const map = new Map<string, AdminDepotsCompte>();
  annonces.forEach((row) => {
    const cle = (row.email || '').trim().toLowerCase();
    if (!cle) return;
    const compte = map.get(cle) ?? { publies: 0, refuses: 0, attente: 0, longues: 0 };
    const etat = (row.statut || '').trim().toLowerCase();
    if (etat === 'publie') compte.publies += 1;
    else if (etat === 'refuse') compte.refuses += 1;
    else {
      compte.attente += 1;
      if (relectureLongue(row.statut, row.created_at)) compte.longues += 1;
    }
    map.set(cle, compte);
  });
  return map;
}

/** Un dépôt est encore en relecture tant qu'il n'a reçu ni publication ni
 *  refus : c'est le seul état qui attend une réponse. */
export const enRelecture = (statut?: string | null) => {
  const etat = (statut || '').trim().toLowerCase();
  return etat !== 'publie' && etat !== 'refuse';
};

/** L'âge d'une date passée, en jours — croissant avec le temps écoulé.
 *  `joursAvant` compte vers l'avenir ; cette lecture compte vers le passé. */
export function ageJours(iso?: string | null): number | null {
  const jours = joursAvant(iso);
  return jours === null ? null : -jours;
}

/** Un dépôt attend depuis plus de sept jours sans être ni publié ni refusé :
 *  c'est une relecture qui traîne, et le déposant mérite une réponse. */
export function relectureLongue(
  statut?: string | null,
  createdAt?: string | null,
): boolean {
  if (!enRelecture(statut)) return false;
  const age = ageJours(createdAt);
  return age !== null && age > JOURS_RELECTURE_LONGUE;
}

/** Les dépôts d'un compte encore en relecture longue, le plus ancien en tête.
 *  La fiche, le classeur et l'onglet « Annonces » lisent tous cette même
 *  liste : le chiffre d'un endroit ne peut pas contredire l'autre. */
export function relecturesLonguesDe(
  annonces: AdminAnnonce[],
  email?: string | null,
): AdminAnnonce[] {
  const cle = (email || '').trim().toLowerCase();
  if (!cle) return [];
  const longues = annonces.filter(
    (row) =>
      (row.email || '').trim().toLowerCase() === cle &&
      relectureLongue(row.statut, row.created_at),
  );
  return triParRelecture(longues);
}

/** Le tri par ancienneté de relecture : les dépôts encore en attente d'abord,
 *  le plus ancien en tête, puis ceux qui ont déjà reçu une réponse. Une date
 *  manquante ferme toujours la marche plutôt que de fausser le rang. */
export function triParRelecture(rows: AdminAnnonce[]): AdminAnnonce[] {
  const stamp = (iso?: string | null) => {
    if (!iso) return Number.POSITIVE_INFINITY;
    const value = new Date(iso).getTime();
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
  };
  return [...rows].sort((a, b) => {
    const aAttente = enRelecture(a.statut);
    const bAttente = enRelecture(b.statut);
    if (aAttente !== bAttente) return aAttente ? -1 : 1;
    return stamp(a.created_at) - stamp(b.created_at);
  });
}

/** Une échéance est proche quand elle tombe à moins de trente jours — le
 *  dépassement compte aussi : une échéance passée demande plus encore. */
export function echeanceProche(iso?: string | null): boolean {
  const jours = joursAvant(iso);
  return jours !== null && jours < JOURS_ECHEANCE_PROCHE;
}

/** Un jour, en millisecondes. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Les jours qui séparent aujourd'hui d'une échéance — négatif quand elle est
 * passée, nul le jour même. La date est lue comme un jour de calendrier, sans
 * heure : une échéance écrite « 2026-11-07 » ne bascule pas d'un jour selon le
 * fuseau du lecteur.
 */
export function joursAvant(iso?: string | null): number | null {
  if (!iso) return null;
  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const cible = parts
    ? Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(iso).getTime();
  if (!Number.isFinite(cible)) return null;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((cible - today) / DAY_MS);
}

export type AdminParametres = {
  id?: number;
  essai_jours: number | null;
  suivi_appel_heures: number | null;
  updated_by: string | null;
  updated_at: string | null;
};

export type AdminOverview = {
  abonnements: AdminAbonnement[];
  comptes: AdminCompte[];
  annonces: AdminAnnonce[];
  conversations: AdminConversation[];
  parametres: AdminParametres | null;
  /** Les demandes encore dans la file : le compte s'affiche sur l'onglet
   *  « Demandes » sans ouvrir la section. */
  demandesEnAttente?: number;
};

/**
 * La seule adresse autorisée à ouvrir la console. Le serveur tient la même
 * liste : cette constante ne sert qu'à ne pas afficher un écran vide à un
 * visiteur qui n'a rien à y faire.
 */
export const ADMIN_EMAIL = 'cbj.infoservices@gmail.com';

export const isAdminEmail = (email?: string | null) =>
  (email ?? '').trim().toLowerCase() === ADMIN_EMAIL;

/** Six mois, en jours : au-delà, un rôle administrateur mérite d'être relu. */
export const JOURS_PROMOTION_A_RELIRE = 183;

/** Un compte peut ouvrir la console quand son rôle le dit, ou quand il porte
 *  l'adresse d'administration : la table, le classeur et la fiche lisent cette
 *  même règle, sans la recopier. */
export const estAdminCompte = (email?: string | null, role?: string | null) =>
  isAdminEmail(email) || (role ?? '').trim().toLowerCase() === 'admin';

/** Une promotion qui demande une relecture : administrateur depuis plus de six
 *  mois. Null quand le geste n'est pas daté — une ancienneté ne s'invente pas. */
export function promotionARelire(
  row: AdminCompte | null | undefined,
): { jours: number; mois: number } | null {
  if (!row || !estAdminCompte(row.email, row.role)) return null;
  const age = ageJours(row.role_changed_at);
  if (age === null || age <= JOURS_PROMOTION_A_RELIRE) return null;
  return { jours: age, mois: Math.floor(age / 30) };
}

/** Le sens du tri par promotion : la plus ancienne en tête, ou la plus
 *  récente. */
export type AdminTriPromo = 'old' | 'recent';

/** Le tri de la table des comptes par date de promotion : les promotions
 *  datées d'abord, la plus ancienne en tête (ou la plus récente), puis les
 *  comptes dont la date reste à noter, puis les comptes ordinaires — un
 *  compte sans rôle n'a pas de promotion à ranger. Deux comptes de même rang
 *  se départagent par leur nom, pour que l'ordre ne dépende pas de l'arrivée
 *  des lignes. La table, le classeur et la pastille de la fiche lisent cette
 *  seule règle. */
export function triParPromotion(rows: AdminCompte[], sens: AdminTriPromo): AdminCompte[] {
  const stamp = (row: AdminCompte) => {
    const value = new Date(row.role_changed_at || '').getTime();
    return Number.isFinite(value) ? value : null;
  };
  const rang = (row: AdminCompte) => {
    if (stamp(row) !== null) return 0;
    return estAdminCompte(row.email, row.role) ? 1 : 2;
  };
  return [...rows].sort((a, b) => {
    const ecart = rang(a) - rang(b);
    if (ecart !== 0) return ecart;
    if (rang(a) === 0) {
      const sa = stamp(a) ?? 0;
      const sb = stamp(b) ?? 0;
      if (sa !== sb) return sens === 'old' ? sa - sb : sb - sa;
    }
    return (a.organisme || a.nom || '').localeCompare(b.organisme || b.nom || '');
  });
}

/** « 12500 » → « 12 500 » : le même espacement que les montants du site. */
export function nombre(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '—';
  return new Intl.NumberFormat('fr-FR').format(num);
}

/** Ce que devient une échéance proche, dite en jours : « dans 12 j », ou
 *  « échue depuis 3 j » quand le jour est passé. */
export function echeanceEnMots(
  iso: string | null | undefined,
  t: (key: string) => string,
): string {
  const jours = joursAvant(iso);
  if (jours === null) return '';
  if (jours < 0) return t('ad.clients.duePast').replace('{n}', String(-jours));
  if (jours === 0) return t('ad.clients.dueToday');
  return t('ad.clients.dueIn').replace('{n}', String(jours));
}

/** Une date courte, dans la langue de lecture. */
export function jour(iso: string | null | undefined, lang: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : lang === 'en' ? 'en-GB' : 'fr-FR', {
    dateStyle: 'medium',
  }).format(date);
}

/**
 * Une date et son heure, dans la langue de lecture.
 *
 * Une lecture d'état ne se date pas au jour : deux vérifications du même
 * après-midi ne se confondent pas. L'heure suit donc la date, sans secondes —
 * ce que la console retient s'arrête à la minute.
 */
export function jourHeure(iso: string | null | undefined, lang: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : lang === 'en' ? 'en-GB' : 'fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}