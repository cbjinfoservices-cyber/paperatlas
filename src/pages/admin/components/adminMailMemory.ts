/**
 * La date du dernier test réellement reçu.
 *
 * Le serveur sait si la clé et le domaine sont posés ; il ne sait pas si un
 * message est arrivé dans une boîte. La seule preuve du domaine vérifié est
 * donc un envoi de test parti d'ici — et cette preuve mérite son jour.
 *
 * Elle vit sur l'appareil, comme les cases de relecture : c'est le poste qui
 * a lancé le test qui s'en souvient, pas la base.
 */

const CLE = 'paperatlas.admin.mail.preuve';

/** La date enregistrée, si elle se lit encore comme une date. */
export function readPreuve(): string | null {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return null;
    const date = new Date(brut);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

/** Un test qui part vraiment : le jour est retenu, et rendu pour l'affichage. */
export function markPreuve(at: string = new Date().toISOString()): string {
  const date = new Date(at);
  const valeur = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  try {
    window.localStorage.setItem(CLE, valeur);
  } catch {
    /* Un navigateur qui refuse le stockage laisse au moins la visite en cours
       se souvenir du test : la carte ne ment pas, elle oublie au rechargement. */
  }
  return valeur;
}

/** Un test qui échoue retire la preuve : on ne date pas un envoi qui n'est
 *  pas parti. */
export function clearPreuve(): void {
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    /* Rien à effacer si rien n'a pu être écrit. */
  }
}

/**
 * La dernière lecture de l'état de l'expéditeur.
 *
 * Le serveur répond à chaque vérification, mais ne dit pas quand on l'a
 * interrogé pour la dernière fois depuis ce poste. C'est donc l'appareil qui
 * s'en souvient : la carte peut alors dater l'état qu'elle affiche, au lieu de
 * laisser croire qu'il vient d'être relu.
 */
const CLE_LECTURE = 'paperatlas.admin.mail.lecture';

/**
 * Le jour où le SMTP d'authentification a été déclaré branché.
 *
 * Ce réglage se fait dans Supabase, et rien côté navigateur ne peut le lire :
 * la carte ne peut donc pas le prouver. Elle retient la déclaration, avec son
 * jour, pour que l'étape ne s'annonce pas faite sur un souvenir sans date.
 */
const CLE_SMTP = 'paperatlas.admin.auth.smtp';

/** La déclaration, si elle se lit encore comme une date. */
export function readSmtp(): string | null {
  try {
    const brut = window.localStorage.getItem(CLE_SMTP);
    if (!brut) return null;
    const date = new Date(brut);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

/** Une déclaration faite : elle est datée et rendue pour l'affichage. */
export function markSmtp(at: string = new Date().toISOString()): string {
  const date = new Date(at);
  const valeur = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  try {
    window.localStorage.setItem(CLE_SMTP, valeur);
  } catch {
    /* Un navigateur qui refuse le stockage laisse la visite en cours s'en
       souvenir : la carte ne ment pas, elle oublie au rechargement. */
  }
  return valeur;
}

/** Une déclaration retirée : l'étape repasse à faire. */
export function clearSmtp(): void {
  try {
    window.localStorage.removeItem(CLE_SMTP);
  } catch {
    /* Rien à effacer si rien n'a pu être écrit. */
  }
}

/**
 * Le jour d'un message d'authentification réellement reçu.
 *
 * Distinct de la preuve du guide : celle-ci prouve le domaine d'envoi des
 * confirmations, celle-là prouve que Supabase Auth passe bien par le SMTP
 * personnalisé — deux chemins différents, deux preuves différentes.
 */
const CLE_AUTH_PREUVE = 'paperatlas.admin.auth.preuve';

export function readAuthPreuve(): string | null {
  try {
    const brut = window.localStorage.getItem(CLE_AUTH_PREUVE);
    if (!brut) return null;
    const date = new Date(brut);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

export function markAuthPreuve(at: string = new Date().toISOString()): string {
  const date = new Date(at);
  const valeur = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  try {
    window.localStorage.setItem(CLE_AUTH_PREUVE, valeur);
  } catch {
    /* Même réserve que pour les autres preuves : la visite en cours suffit. */
  }
  return valeur;
}

export function clearAuthPreuve(): void {
  try {
    window.localStorage.removeItem(CLE_AUTH_PREUVE);
  } catch {
    /* Rien à effacer si rien n'a pu être écrit. */
  }
}

/**
 * Le jour d'un rappel B2B de test réellement parti.
 *
 * Le rappel à l'atelier est écrit par une autre fonction serveur que les
 * confirmations du site : il peut donc tomber alors qu'elles passent. Le test
 * dédié envoie un exemple à l'adresse de l'administration, et la carte en
 * garde le jour — une étape prouvée par un départ réel, pas par une case.
 */
const CLE_B2B = 'paperatlas.admin.auth.b2b';

export function readB2bTest(): string | null {
  try {
    const brut = window.localStorage.getItem(CLE_B2B);
    if (!brut) return null;
    const date = new Date(brut);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

export function markB2bTest(at: string = new Date().toISOString()): string {
  const date = new Date(at);
  const valeur = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  try {
    window.localStorage.setItem(CLE_B2B, valeur);
  } catch {
    /* Même réserve que pour les autres preuves : la visite en cours suffit. */
  }
  return valeur;
}

export function clearB2bTest(): void {
  try {
    window.localStorage.removeItem(CLE_B2B);
  } catch {
    /* Rien à effacer si rien n'a pu être écrit. */
  }
}

/**
 * La date de la dernière copie du relevé des trois hauteurs.
 *
 * Le presse-papiers ne se relit pas : une fois le texte collé ailleurs, le
 * navigateur ne dit plus quand il est parti. C'est donc l'appareil qui s'en
 * souvient, pour que le relevé porte sa date sous lui — sans rouvrir ce qu'il
 * a copié.
 */
const CLE_RELEVE_COPIE = 'paperatlas.admin.mail.releveCopie';

export function readReleveCopie(): string | null {
  try {
    const brut = window.localStorage.getItem(CLE_RELEVE_COPIE);
    if (!brut) return null;
    const date = new Date(brut);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

/** Une copie qui a vraiment réussi : l'instant est retenu et rendu. Une copie
 *  refusée par le navigateur n'est pas datée. */
export function markReleveCopie(at: string = new Date().toISOString()): string {
  const date = new Date(at);
  const valeur = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  try {
    window.localStorage.setItem(CLE_RELEVE_COPIE, valeur);
  } catch {
    /* Un navigateur qui refuse le stockage laisse la visite en cours se
       souvenir de l'heure : la date s'efface au rechargement. */
  }
  return valeur;
}

/**
 * La carte « Expéditeur des e-mails » déjà rejointe depuis cet appareil.
 *
 * Le suivi du projet pose deux portes vers ce même bloc ; savoir qu'on l'a
 * déjà ouvert évite de le chercher une seconde fois. Le jour est retenu, et
 * non un simple drapeau : la porte peut ainsi dater sa visite.
 */
const CLE_EXPEDITEUR_VU = 'paperatlas.admin.mail.expediteurVu';

export function readExpediteurVu(): string | null {
  try {
    const brut = window.localStorage.getItem(CLE_EXPEDITEUR_VU);
    if (!brut) return null;
    const date = new Date(brut);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

export function markExpediteurVu(at: string = new Date().toISOString()): string {
  const date = new Date(at);
  const valeur = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  try {
    window.localStorage.setItem(CLE_EXPEDITEUR_VU, valeur);
  } catch {
    /* Un navigateur qui refuse le stockage laisse la visite en cours se
       souvenir : le repère s'efface au rechargement, sans mentir. */
  }
  return valeur;
}

/** La visite oubliée : le repère « déjà ouverte » s'efface de cet appareil.
 *  Seule la mémoire du poste est effacée — la carte, son état et les preuves
 *  d'envoi restent intacts. */
export function clearExpediteurVu(): void {
  try {
    window.localStorage.removeItem(CLE_EXPEDITEUR_VU);
  } catch {
    /* Rien à effacer si rien n'a pu être écrit. */
  }
}

/** L'instant de la dernière lecture, s'il se lit encore comme une date. */
export function readDerniereLecture(): string | null {
  try {
    const brut = window.localStorage.getItem(CLE_LECTURE);
    if (!brut) return null;
    const date = new Date(brut);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

/** Une lecture qui a vraiment rendu l'état : l'instant est retenu et rendu
 *  pour l'affichage. Une lecture qui échoue n'est pas datée. */
export function markDerniereLecture(at: string = new Date().toISOString()): string {
  const date = new Date(at);
  const valeur = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  try {
    window.localStorage.setItem(CLE_LECTURE, valeur);
  } catch {
    /* Un navigateur qui refuse le stockage laisse au moins la visite en cours
       se souvenir de l'heure : la carte ne ment pas, elle oublie au
       rechargement. */
  }
  return valeur;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * L'âge de la preuve, en jours de calendrier — nul le jour même, croissant
 * avec le temps. La date est lue comme un jour et non comme un instant : une
 * preuve du 11 novembre ne vieillit pas d'un jour selon l'heure du poste.
 *
 * Rien n'est inventé : sans date lisible, l'âge reste inconnu (null), et un
 * appelant ne peut pas afficher « il y a » sur du vide.
 */
export function preuveAgeJours(at?: string | null): number | null {
  if (!at) return null;
  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(at);
  const cible = parts
    ? Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(at).getTime();
  if (!Number.isFinite(cible)) return null;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const jours = Math.round((today - cible) / DAY_MS);
  return jours >= 0 ? jours : 0;
}