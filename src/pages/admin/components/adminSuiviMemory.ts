/**
 * La date du dernier téléchargement de l'archive du plan.
 *
 * Elle vit sur l'appareil, comme la preuve de l'expéditeur : c'est le poste
 * qui a emporté le fichier qui s'en souvient, pas la base. Chaque archive a
 * la sienne — le plan entier d'un côté, chaque chantier de l'autre —, pour
 * qu'un envoi de chantier ne fasse pas croire que le plan entier est parti.
 */

const CLE = 'paperatlas.admin.suivi.telechargements';

/** La clef de mémoire d'une archive : le plan entier, ou un chantier nommé. */
export function cleTelechargement(chantier: string | null = null): string {
  return chantier ? `chantier:${chantier}` : 'plan';
}

/** Tout ce que l'appareil retient, relu au chargement de l'onglet. Une entrée
 *  qui ne se lit plus comme une date est écartée plutôt que devinée. */
function lireTout(): Record<string, string> {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return {};
    const parsed = JSON.parse(brut) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const sortie: Record<string, string> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([cle, valeur]) => {
      if (typeof valeur !== 'string') return;
      const date = new Date(valeur);
      if (!Number.isNaN(date.getTime())) sortie[cle] = date.toISOString();
    });
    return sortie;
  } catch {
    return {};
  }
}

/** Les dates retenues pour chaque archive, telles qu'elles s'affichent. */
export function readTelechargements(): Record<string, string> {
  return lireTout();
}

/** Un téléchargement qui part vraiment : la date est retenue et rendue pour
 *  l'affichage, sans attendre le rechargement de l'onglet. */
export function markTelechargement(
  chantier: string | null = null,
  at: string = new Date().toISOString(),
): string {
  const date = new Date(at);
  const valeur = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  try {
    const tout = lireTout();
    tout[cleTelechargement(chantier)] = valeur;
    window.localStorage.setItem(CLE, JSON.stringify(tout));
  } catch {
    /* Un navigateur qui refuse le stockage laisse au moins la visite en cours
       se souvenir du geste : le bouton l'a déjà annoncé sur place. */
  }
  return valeur;
}

/**
 * La gomme d'une seule archive : elle retire du registre la date de ce
 * chantier-là, et laisse celles des autres en place.
 *
 * Le geste ne touche à aucun fichier déjà téléchargé — il ne retire que ce que
 * le poste se rappelait de cette pièce. Il se demande en deux appuis, comme la
 * gomme de la ligne entière.
 */
export function clearTelechargement(chantier: string | null = null): Record<string, string> {
  const tout = lireTout();
  const cle = cleTelechargement(chantier);
  if (!(cle in tout)) return tout;
  delete tout[cle];
  try {
    window.localStorage.setItem(CLE, JSON.stringify(tout));
  } catch {
    /* Le store refusé laisse le registre affiché se vider quand même : la
       ligne repart vierge pour la visite en cours. */
  }
  return tout;
}

/**
 * Le jour où le cap de 95 % a été franchi.
 *
 * Il vit sur l'appareil, comme la date des archives : c'est le poste qui a vu
 * le seuil passer qui s'en souvient. La date n'est écrite qu'une fois — une
 * visite ultérieure ne la déplace pas, sans quoi le repère daterait la
 * dernière ouverture au lieu du franchissement lui-même.
 */
const CLE_CAP = 'paperatlas.admin.suivi.cap-atteint';

/** La marque de l'oubli : posée par la petite gomme, elle empêche le repère de
 *  se réécrire à la visite suivante — l'appareil se souvient qu'on l'a oublié,
 *  plutôt que de dater la prochaine ouverture. */
const CLE_CAP_OUBLIE = 'paperatlas.admin.suivi.cap-oublie';

/** L'appareil a-t-il déjà oublié ce repère ? */
function capOublie(): boolean {
  try {
    return window.localStorage.getItem(CLE_CAP_OUBLIE) === 'oui';
  } catch {
    return false;
  }
}

/** Le jour retenu, relu au chargement de l'onglet ; null quand rien n'a encore
 *  été daté ou quand la valeur ne se lit plus comme une date. */
export function readCapAtteint(): string | null {
  if (capOublie()) return null;
  try {
    const brut = window.localStorage.getItem(CLE_CAP);
    if (!brut) return null;
    const date = new Date(brut);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Le geste qui pose le repère : la première date vue est gardée, les suivantes
 * ne la remplacent pas. Rend toujours le jour retenu, pour l'affichage.
 */
export function markCapAtteint(at: string = new Date().toISOString()): string {
  if (capOublie()) return '';
  const deja = readCapAtteint();
  if (deja) return deja;
  const date = new Date(at);
  const valeur = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  try {
    window.localStorage.setItem(CLE_CAP, valeur);
  } catch {
    /* Un navigateur qui refuse le stockage laisse au moins la visite en cours
       se souvenir du franchissement : l'écran l'affiche déjà. */
  }
  return valeur;
}

/**
 * La petite gomme du repère daté : elle efface le jour retenu sur cet appareil
 * et y laisse la marque de l'oubli, sans toucher ni au plan ni à son archive —
 * le franchissement du cap, lui, n'est pas effacé : seule sa date s'oublie.
 */
export function clearCapAtteint(): void {
  try {
    window.localStorage.removeItem(CLE_CAP);
    window.localStorage.setItem(CLE_CAP_OUBLIE, 'oui');
  } catch {
    /* Rien à effacer si rien n'a pu être écrit ; l'écran repart sans date. */
  }
}

/**
 * Les modules du tableau déjà atteints depuis cet appareil.
 *
 * La liste du cap fait descendre la page jusqu'à la ligne d'un module : ce
 * poste retient lesquels ont été atteints ainsi, pour que la liste dise d'un
 * coup d'œil combien ont déjà été vus — sans compter à la main, et sans rien
 * écrire en base.
 */
const CLE_MODULES = 'paperatlas.admin.suivi.modules-atteints';

/** Le jour de la dernière descente vers une ligne du tableau. Il vit sur le
 *  même registre que les noms, pour que le compteur du cap dise quand on est
 *  descendu la dernière fois — jamais une date recopiée à côté du compte. */
const CLE_MODULES_LE = 'paperatlas.admin.suivi.modules-atteints-le';

/** Le jour où chaque module-là a été atteint, nom par nom. Le même registre
 *  que la liste des noms : le survol d'une ligne du compteur dit sa propre
 *  date, sans qu'aucune date soit recopiée à côté. */
const CLE_MODULES_DATES = 'paperatlas.admin.suivi.modules-atteints-dates';

/** Les modules retenus, relus au chargement de l'onglet. Une valeur qui ne se
 *  lit plus comme une liste de noms est écartée plutôt que devinée. */
export function readModulesAtteints(): string[] {
  try {
    const brut = window.localStorage.getItem(CLE_MODULES);
    if (!brut) return [];
    const parsed = JSON.parse(brut) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((nom): nom is string => typeof nom === 'string' && nom.length > 0);
  } catch {
    return [];
  }
}

/** Les jours retenus pour chaque module atteint, relus au chargement de
 *  l'onglet. Une valeur qui ne se lit plus comme une date est écartée plutôt
 *  que devinée : une ligne sans date le dit calmement. */
export function readModulesAtteintsDates(): Record<string, string> {
  try {
    const brut = window.localStorage.getItem(CLE_MODULES_DATES);
    if (!brut) return {};
    const parsed = JSON.parse(brut) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const sortie: Record<string, string> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([nom, valeur]) => {
      if (typeof valeur !== 'string') return;
      const date = new Date(valeur);
      if (!Number.isNaN(date.getTime())) sortie[nom] = date.toISOString();
    });
    return sortie;
  } catch {
    return {};
  }
}

/** Le jour de la dernière descente, relu au chargement de l'onglet ; null
 *  quand aucune descente n'a encore été datée, ou quand la valeur ne se lit
 *  plus comme une date. */
export function readModulesAtteintsLe(): string | null {
  try {
    const brut = window.localStorage.getItem(CLE_MODULES_LE);
    if (!brut) return null;
    const date = new Date(brut);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

/** Un module atteint : son nom rejoint la liste, sans doublon, et la date du
 *  geste est retenue sur le même registre. Revenir sur un module déjà compté
 *  reste une descente : la date suit le geste, le compte ne bouge pas. Rend
 *  la liste à jour, pour que l'écran la réaffiche aussitôt. */
export function markModuleAtteint(nom: string): string[] {
  const liste = readModulesAtteints();
  if (!nom) return liste;
  const maintenant = new Date().toISOString();
  try {
    window.localStorage.setItem(CLE_MODULES_LE, maintenant);
  } catch {
    /* Sans stockage, la visite en cours garde au moins le geste à l'écran. */
  }
  /* Le jour du module se pose à sa première descente seulement : revenir sur
     une ligne déjà atteinte reste une descente, mais ne déplace pas le jour
     où elle a été vue pour la première fois. */
  try {
    const dates = readModulesAtteintsDates();
    if (!dates[nom]) {
      dates[nom] = maintenant;
      window.localStorage.setItem(CLE_MODULES_DATES, JSON.stringify(dates));
    }
  } catch {
    /* Sans stockage, la ligne garde au moins son repère visuel. */
  }
  if (liste.includes(nom)) return liste;
  const suivante = [...liste, nom];
  try {
    window.localStorage.setItem(CLE_MODULES, JSON.stringify(suivante));
  } catch {
    /* Un navigateur qui refuse le stockage laisse au moins la visite en cours
       se souvenir du geste : la ligne garde son repère visuel. */
  }
  return suivante;
}

/**
 * La gomme d'une seule ligne du tableau : elle retire un module de la liste
 * des descentes et son jour, sans toucher aux autres lignes ni au plan.
 *
 * Le jour de la dernière descente se relit sur les jours qui restent : un
 * module oublié n'emporte pas la date du parcours entier, mais il ne laisse
 * pas non plus derrière lui une date qui ne nommait que lui. Rend la liste à
 * jour, pour que l'écran la réaffiche aussitôt.
 */
export function clearModuleAtteint(nom: string): string[] {
  const liste = readModulesAtteints();
  if (!nom || !liste.includes(nom)) return liste;
  const suivante = liste.filter((item) => item !== nom);
  try {
    window.localStorage.setItem(CLE_MODULES, JSON.stringify(suivante));
  } catch {
    /* Un navigateur qui refuse le stockage laisse au moins la visite en cours
       oublier la ligne : l'écran la retire déjà. */
  }
  try {
    const dates = readModulesAtteintsDates();
    if (nom in dates) {
      delete dates[nom];
      window.localStorage.setItem(CLE_MODULES_DATES, JSON.stringify(dates));
    }
    /* Le jour de la dernière descente suit les modules qui restent : il ne
       nomme jamais une ligne que la gomme vient d'oublier. */
    const restes = Object.values(readModulesAtteintsDates());
    if (restes.length > 0) {
      const recent = restes.reduce((garde, date) =>
        new Date(date).getTime() > new Date(garde).getTime() ? date : garde,
      );
      window.localStorage.setItem(CLE_MODULES_LE, recent);
    } else {
      window.localStorage.removeItem(CLE_MODULES_LE);
    }
  } catch {
    /* Sans stockage, la ligne garde au moins son départ de la vue. */
  }
  return suivante;
}

/**
 * La petite gomme du compteur du cap : elle oublie les modules atteints sur
 * cet appareil, et la date de la dernière descente avec eux.
 *
 * Le geste ne touche à aucun module du plan : il ne retire que ce que le poste
 * se rappelait des descentes déjà faites. Il se demande en deux appuis, comme
 * les autres gommes de l'onglet.
 */
export function clearModulesAtteints(): string[] {
  try {
    window.localStorage.removeItem(CLE_MODULES);
    window.localStorage.removeItem(CLE_MODULES_LE);
    window.localStorage.removeItem(CLE_MODULES_DATES);
  } catch {
    /* Rien à effacer si rien n'a pu être écrit ; l'écran repart à zéro. */
  }
  return [];
}

/**
 * La gomme de la ligne : elle efface les dates retenues sur l'appareil et rend
 * le registre vidé, pour que l'affichage reparte vierge sans rechargement.
 *
 * Le geste ne touche à aucun fichier déjà téléchargé : il ne retire que ce que
 * le poste se rappelait. Il se demande en deux appuis — un premier arme la
 * gomme, un second l'exécute.
 */
export function clearTelechargements(): Record<string, string> {
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    /* Rien à effacer si rien n'a pu être écrit ; l'écran repart vide. */
  }
  return {};
}