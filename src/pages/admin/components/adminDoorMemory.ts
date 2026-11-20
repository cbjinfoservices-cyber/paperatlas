/**
 * Les portes du suivi déjà empruntées depuis cet appareil.
 *
 * Une ligne de « Ce qu'il reste à faire » peut mener à un écran ; savoir si
 * l'on y est déjà allé distingue ce qui reste à ouvrir de ce qui est déjà
 * ouvert. La mémoire vit sur le poste, comme les autres souvenirs de la
 * console : aucune table, aucun compte, seulement ce que ce navigateur a
 * réellement fait.
 *
 * La clef est l'adresse de la porte, telle que le plan la nomme — jamais le
 * libellé de la ligne : renommer une phrase ne perd donc pas la visite.
 */

const CLE = 'paperatlas.admin.door.vues';

/** Le carnet des visites rendues : combien de fois la gomme a oublié une
 *  porte depuis cet appareil, le jour du dernier oubli, et chaque geste
 *  retenu avec l'écran qu'il a rendu et son jour. */
const CLE_OUBLIS = 'paperatlas.admin.door.oublis';

export type PortesVues = Record<string, string>;

/** Une visite rendue : la porte oubliée, l'écran qu'elle ouvrait, et le jour
 *  du geste. C'est cette ligne-là qui part en CSV. */
export type OubliPorte = { lien: string; ecran: string; date: string };

export type PortesOublis = {
  total: number;
  dernier: string | null;
  journal: OubliPorte[];
};

/** Les écrans dont tous les gestes ont déjà été retirés de cet appareil :
 *  une fois vidés, ils ne figurent plus au journal, et le CSV ne peut donc
 *  les nommer que s'ils sont retenus ici. */
const CLE_VIDES = 'paperatlas.admin.door.ecrans.vides';

/** Le jour de chaque vidage, à côté du nom de son écran : le jeton de
 *  relecture nomme ainsi l'écran vidé le plus récemment, sans deviner l'ordre
 *  d'une liste que deux gestes du même jour pourraient brouiller. */
const CLE_VIDES_DATES = 'paperatlas.admin.door.ecrans.vides.dates';

/** Les écrans qu'un appui sur leur nom a retenus dans le dépli, avec le jour
 *  de leur dernier geste au moment de l'appui : la ligne du CSV dit où le
 *  geste a servi, et sur quoi il portait. */
const CLE_APPUIS = 'paperatlas.admin.door.ecrans.appuis';

export type EcranAppuye = { ecran: string; date: string };

/** Les écrans retirés du carnet par un second appui sur leur nom, avec le
 *  jour du retrait : l'intitulé du tri dit ainsi combien d'écrans ont quitté
 *  le carnet par ce geste-là, et pas par la petite gomme de leur ligne. */
const CLE_RETIRES_NOM = 'paperatlas.admin.door.ecrans.retires.nom';

/** Chaque retrait par nom, dans l'ordre des gestes — sans doublon : un même
 *  écran retiré plusieurs fois garde ici toutes ses dates, pour que le CSV
 *  compte les retraits successifs qu'il a subis depuis cet appareil. */
const CLE_RETIRES_HIST = 'paperatlas.admin.door.ecrans.retires.hist';

/** Les écrans déjà retirés par leur nom puis revenus au carnet : le jour du
 *  retrait et celui du retour, pour que le jeton du dépli les nomme sans
 *  deviner l'ordre d'une liste que deux gestes du même jour brouilleraient. */
const CLE_RETOURS = 'paperatlas.admin.door.ecrans.retours';

/** Chaque retour au carnet, dans l'ordre des gestes — sans doublon : un même
 *  écran revenu plusieurs fois garde ici toutes ses dates, pour que le survol
 *  d'un écran revenu dise combien de fois il a été retiré puis ramené, et que
 *  le CSV range les retours sous leur mois. */
const CLE_RETOURS_HIST = 'paperatlas.admin.door.ecrans.retours.hist';

export type EcranRetireNom = { ecran: string; date: string };

export type EcranRetour = { ecran: string; retire: string; retour: string };

/** Le carnet vide : rien n'a encore été rendu sur cet appareil. */
function carnetVide(): PortesOublis {
  return { total: 0, dernier: null, journal: [] };
}

/** Les écrans vidés, relus sur cet appareil — jamais en base. */
export function readEcransVides(): string[] {
  try {
    const brut = window.localStorage.getItem(CLE_VIDES);
    if (!brut) return [];
    const lu: unknown = JSON.parse(brut);
    if (!Array.isArray(lu)) return [];
    return lu.filter((nom): nom is string => typeof nom === 'string' && nom.length > 0);
  } catch {
    return [];
  }
}

/** La liste écrite, ou effacée quand elle se vide. */
function ecrireEcransVides(noms: string[]): void {
  try {
    if (noms.length === 0) {
      window.localStorage.removeItem(CLE_VIDES);
    } else {
      window.localStorage.setItem(CLE_VIDES, JSON.stringify(noms));
    }
  } catch {
    /* Un navigateur qui refuse le stockage laisse l'écran se relire le temps
       de la visite : la liste repart de sa mémoire au rechargement. */
  }
}

/** Le jour de chaque vidage, relu sur cet appareil — jamais en base. */
function readVidesDates(): Record<string, string> {
  try {
    const brut = window.localStorage.getItem(CLE_VIDES_DATES);
    if (!brut) return {};
    const lu: unknown = JSON.parse(brut);
    if (!lu || typeof lu !== 'object') return {};
    const table: Record<string, string> = {};
    Object.entries(lu as Record<string, unknown>).forEach(([nom, date]) => {
      if (typeof date !== 'string') return;
      const jourDuGeste = new Date(date);
      if (Number.isNaN(jourDuGeste.getTime())) return;
      table[nom] = jourDuGeste.toISOString();
    });
    return table;
  } catch {
    return {};
  }
}

/** Les jours écrits, ou effacés quand la table se vide. */
function ecrireVidesDates(table: Record<string, string>): void {
  try {
    if (Object.keys(table).length === 0) {
      window.localStorage.removeItem(CLE_VIDES_DATES);
    } else {
      window.localStorage.setItem(CLE_VIDES_DATES, JSON.stringify(table));
    }
  } catch {
    /* Un navigateur qui refuse le stockage laisse l'écran se relire le temps
       de la visite : la date repart de sa mémoire au rechargement. */
  }
}

/** Un écran dont le dernier geste vient de partir entre dans la liste. */
function marquerEcranVide(nom: string): void {
  if (!nom) return;
  const avant = readEcransVides();
  if (avant.includes(nom)) return;
  ecrireEcransVides([...avant, nom]);
  const dates = readVidesDates();
  dates[nom] = new Date().toISOString();
  ecrireVidesDates(dates);
}

/** Un écran qui reçoit un geste sort de la liste : il n'est plus vidé. */
function demarquerEcranVide(nom: string): void {
  if (!nom) return;
  const avant = readEcransVides();
  if (avant.includes(nom)) ecrireEcransVides(avant.filter((item) => item !== nom));
  const dates = readVidesDates();
  if (dates[nom]) {
    delete dates[nom];
    ecrireVidesDates(dates);
  }
  /* Un écran qui retrouve un geste n'a plus été retiré par son nom : il sort
     aussi de cette liste-là, pour que l'intitulé du tri ne compte pas deux
     fois le même écran. */
  demarquerEcranRetireNom(nom);
}

/**
 * L'écran vidé le plus récemment, avec le jour de son vidage.
 *
 * Le jeton de relecture le nomme au survol : le geste le plus frais de la
 * petite gomme d'un écran se lit ainsi sans ouvrir la liste, et un écran
 * jamais vidé ne s'invente pas. Quand un enregistrement plus ancien ne porte
 * pas de date, le dernier entré fait foi, plutôt qu'un écran choisi au hasard.
 */
export function readEcranVideRecent(): EcranAppuye | null {
  const noms = readEcransVides();
  if (noms.length === 0) return null;
  const dates = readVidesDates();
  const entrees = noms.map((nom) => ({ ecran: nom, date: dates[nom] ?? '' }));
  return entrees.reduce((garde, courant) => {
    const tempsGarde = garde.date ? new Date(garde.date).getTime() : 0;
    const tempsCourant = courant.date ? new Date(courant.date).getTime() : 0;
    if (tempsCourant > tempsGarde) return courant;
    if (tempsCourant === tempsGarde && tempsCourant === 0) return courant;
    return garde;
  });
}

/** Les écrans retenus par un appui sur leur nom, relus sur cet appareil. */
export function readEcransAppuyes(): EcranAppuye[] {
  try {
    const brut = window.localStorage.getItem(CLE_APPUIS);
    if (!brut) return [];
    const lu: unknown = JSON.parse(brut);
    if (!Array.isArray(lu)) return [];
    return lu.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const geste = item as Record<string, unknown>;
      if (typeof geste.ecran !== 'string' || !geste.ecran) return [];
      if (typeof geste.date !== 'string') return [];
      const date = new Date(geste.date);
      if (Number.isNaN(date.getTime())) return [];
      return [{ ecran: geste.ecran, date: date.toISOString() }];
    });
  } catch {
    return [];
  }
}

/**
 * Un appui sur le nom d'un écran, retenu avec le jour de son dernier geste.
 *
 * L'appui ne retire rien : il ne garde qu'une trace de ce qu'il a servi à
 * lire, pour que le CSV du carnet dise aussi où le geste a été employé.
 */
/** Les écrans retirés du carnet par un second appui sur leur nom. */
export function readEcransRetiresNom(): EcranRetireNom[] {
  try {
    const brut = window.localStorage.getItem(CLE_RETIRES_NOM);
    if (!brut) return [];
    const lu: unknown = JSON.parse(brut);
    if (!Array.isArray(lu)) return [];
    return lu.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const geste = item as Record<string, unknown>;
      if (typeof geste.ecran !== 'string' || !geste.ecran) return [];
      if (typeof geste.date !== 'string') return [];
      const date = new Date(geste.date);
      if (Number.isNaN(date.getTime())) return [];
      return [{ ecran: geste.ecran, date: date.toISOString() }];
    });
  } catch {
    return [];
  }
}

/** Chaque retrait par nom, relu sur cet appareil — jamais en base.
 *
 * Une entrée par geste, dans l'ordre où les retraits se sont succédé : deux
 * retraits du même écran laissent deux traces, ce qui permet de compter les
 * retraits successifs subis et d'écarter le premier du dernier.
 */
export function readEcransRetiresHist(): EcranRetireNom[] {
  try {
    const brut = window.localStorage.getItem(CLE_RETIRES_HIST);
    if (!brut) return [];
    const lu: unknown = JSON.parse(brut);
    if (!Array.isArray(lu)) return [];
    return lu.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const geste = item as Record<string, unknown>;
      if (typeof geste.ecran !== 'string' || !geste.ecran) return [];
      if (typeof geste.date !== 'string') return [];
      const date = new Date(geste.date);
      if (Number.isNaN(date.getTime())) return [];
      return [{ ecran: geste.ecran, date: date.toISOString() }];
    });
  } catch {
    return [];
  }
}

/** Les écrans déjà retirés par leur nom puis revenus au carnet, relus ici. */
export function readEcransRetours(): EcranRetour[] {
  try {
    const brut = window.localStorage.getItem(CLE_RETOURS);
    if (!brut) return [];
    const lu: unknown = JSON.parse(brut);
    if (!Array.isArray(lu)) return [];
    return lu.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const geste = item as Record<string, unknown>;
      if (typeof geste.ecran !== 'string' || !geste.ecran) return [];
      if (typeof geste.retire !== 'string' || typeof geste.retour !== 'string') return [];
      const retire = new Date(geste.retire);
      const retour = new Date(geste.retour);
      if (Number.isNaN(retire.getTime()) || Number.isNaN(retour.getTime())) return [];
      return [
        { ecran: geste.ecran, retire: retire.toISOString(), retour: retour.toISOString() },
      ];
    });
  } catch {
    return [];
  }
}

/** Chaque retour au carnet, relu sur cet appareil — jamais en base.
 *
 * Une entrée par geste, dans l'ordre où les retours se sont succédé : deux
 * retours du même écran laissent deux traces, ce qui permet de dire combien
 * de fois un écran revenu a été retiré puis ramené, et de ranger ces gestes
 * sous leur mois dans le CSV.
 */
export function readEcransRetoursHist(): EcranRetour[] {
  try {
    const brut = window.localStorage.getItem(CLE_RETOURS_HIST);
    if (!brut) return [];
    const lu: unknown = JSON.parse(brut);
    if (!Array.isArray(lu)) return [];
    return lu.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const geste = item as Record<string, unknown>;
      if (typeof geste.ecran !== 'string' || !geste.ecran) return [];
      if (typeof geste.retire !== 'string' || typeof geste.retour !== 'string') return [];
      const retire = new Date(geste.retire);
      const retour = new Date(geste.retour);
      if (Number.isNaN(retire.getTime()) || Number.isNaN(retour.getTime())) return [];
      return [
        { ecran: geste.ecran, retire: retire.toISOString(), retour: retour.toISOString() },
      ];
    });
  } catch {
    return [];
  }
}

/**
 * Un écran retiré par son nom reçoit un nouveau geste : il revient au carnet.
 *
 * Le retour garde son propre jour, à côté de celui du retrait : le jeton du
 * dépli les nomme ainsi, et un second retour d'un même écran repose la date
 * plutôt que d'ajouter une ligne de plus.
 */
function markEcranRetour(
  ecran: string,
  retire: string,
  at: string = new Date().toISOString(),
): EcranRetour[] {
  if (!ecran) return readEcransRetours();
  const date = new Date(at);
  const jour = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  const avant = readEcransRetours().filter((item) => item.ecran !== ecran);
  const apres = [...avant, { ecran, retire, retour: jour }];
  try {
    window.localStorage.setItem(CLE_RETOURS, JSON.stringify(apres));
    window.localStorage.setItem(
      CLE_RETOURS_HIST,
      JSON.stringify([...readEcransRetoursHist(), { ecran, retire, retour: jour }]),
    );
  } catch {
    /* Un navigateur qui refuse le stockage laisse l'écran se relire le temps
       de la visite : le retour repart de sa mémoire au rechargement. */
  }
  return apres;
}

/**
 * Un second appui sur le nom d'un écran, retenu avec le jour du retrait.
 *
 * Le geste vide l'écran de ses gestes ; il laisse ici sa trace, pour que
 * l'intitulé du tri dise combien d'écrans ont quitté le carnet par ce chemin.
 * Un écran déjà noté garde une seule ligne, datée de son dernier retrait, et
 * chaque geste s'ajoute à l'historique pour que le CSV les compte un à un.
 */
export function markEcranRetireNom(
  ecran: string,
  at: string = new Date().toISOString(),
): EcranRetireNom[] {
  if (!ecran) return readEcransRetiresNom();
  const date = new Date(at);
  const jour = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  const avant = readEcransRetiresNom().filter((item) => item.ecran !== ecran);
  const apres = [...avant, { ecran, date: jour }];
  try {
    window.localStorage.setItem(CLE_RETIRES_NOM, JSON.stringify(apres));
    window.localStorage.setItem(
      CLE_RETIRES_HIST,
      JSON.stringify([...readEcransRetiresHist(), { ecran, date: jour }]),
    );
  } catch {
    /* Un navigateur qui refuse le stockage laisse l'écran se relire le temps
       de la visite : la ligne repart de sa mémoire au rechargement. */
  }
  return apres;
}

/** Un écran qui retrouve un geste ne compte plus parmi les retirés par nom. */
function demarquerEcranRetireNom(nom: string): void {
  if (!nom) return;
  const avant = readEcransRetiresNom();
  if (!avant.some((item) => item.ecran === nom)) return;
  const apres = avant.filter((item) => item.ecran !== nom);
  try {
    if (apres.length === 0) window.localStorage.removeItem(CLE_RETIRES_NOM);
    else window.localStorage.setItem(CLE_RETIRES_NOM, JSON.stringify(apres));
  } catch {
    /* Un navigateur qui refuse le stockage laisse la liste telle quelle
       jusqu'au rechargement. */
  }
}

export function markEcranAppuye(
  ecran: string,
  dernier: string,
): EcranAppuye[] {
  if (!ecran) return readEcransAppuyes();
  const date = new Date(dernier);
  const jourDuGeste = Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
  const avant = readEcransAppuyes().filter((item) => item.ecran !== ecran);
  const apres = [...avant, { ecran, date: jourDuGeste }];
  try {
    window.localStorage.setItem(CLE_APPUIS, JSON.stringify(apres));
  } catch {
    /* Un navigateur qui refuse le stockage laisse l'écran se relire le temps
       de la visite : la ligne repart de sa mémoire au rechargement. */
  }
  return apres;
}

/** Les oublis relus, si l'enregistrement se lit encore comme un carnet. */
export function readOublisPortes(): PortesOublis {
  try {
    const brut = window.localStorage.getItem(CLE_OUBLIS);
    if (!brut) return carnetVide();
    const lu: unknown = JSON.parse(brut);
    if (!lu || typeof lu !== 'object') return carnetVide();
    const table = lu as Record<string, unknown>;
    /* Chaque geste retenu se relit avec son écran et son jour : un
       enregistrement écrit avant le journal n'en porte aucun, et le carnet
       repart alors du compte seul, sans inventer de lignes. */
    const journal: OubliPorte[] = Array.isArray(table.journal)
      ? table.journal.flatMap((item) => {
          if (!item || typeof item !== 'object') return [];
          const geste = item as Record<string, unknown>;
          if (typeof geste.lien !== 'string' || !geste.lien) return [];
          if (typeof geste.date !== 'string') return [];
          const date = new Date(geste.date);
          if (Number.isNaN(date.getTime())) return [];
          return [
            {
              lien: geste.lien,
              ecran: typeof geste.ecran === 'string' && geste.ecran ? geste.ecran : geste.lien,
              date: date.toISOString(),
            },
          ];
        })
      : [];
    const compte =
      typeof table.total === 'number' && table.total > 0 ? Math.floor(table.total) : 0;
    const dernier =
      typeof table.dernier === 'string' && !Number.isNaN(new Date(table.dernier).getTime())
        ? table.dernier
        : null;
    return {
      total: Math.max(compte, journal.length),
      dernier,
      journal,
    };
  } catch {
    return carnetVide();
  }
}

/** Une ou plusieurs visites de plus : le carnet avance des seules visites
 *  réellement rendues, et le jour se repose sur le dernier geste. */
function markOublis(
  gestes: OubliPorte[],
  at: string = new Date().toISOString(),
): PortesOublis {
  const avant = readOublisPortes();
  if (gestes.length === 0) return avant;
  const date = new Date(at);
  const jour = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  const apres: PortesOublis = {
    total: avant.total + gestes.length,
    dernier: jour,
    journal: [...avant.journal, ...gestes.map((geste) => ({ ...geste, date: geste.date || jour }))],
  };
  try {
    window.localStorage.setItem(CLE_OUBLIS, JSON.stringify(apres));
  } catch {
    /* Un navigateur qui refuse le stockage laisse l'écran se relire le temps
       de la visite : le compte repart de la mémoire au rechargement. */
  }
  /* Un écran qui reçoit un geste n'est plus un écran vidé : il ressort de la
     liste, pour que le CSV ne le nomme pas à tort. S'il avait été retiré par
     son nom, ce geste le ramène au carnet : le retour se date ici, avant que
     le retrait ne s'efface. */
  gestes.forEach((geste) => {
    const nom = geste.ecran || geste.lien;
    const parti = readEcransRetiresNom().find((item) => item.ecran === nom);
    if (parti) markEcranRetour(nom, parti.date);
    demarquerEcranVide(nom);
  });
  return apres;
}

/**
 * Rendre le carnet à zéro, sans toucher aux visites retenues.
 *
 * La petite gomme posée sur le compte des oublis n'efface aucune visite de
 * porte : les repères « déjà empruntée » restent tels quels, et le plan avec
 * eux. Seul le carnet du poste — le compte, le jour du dernier oubli et les
 * lignes qui partent en CSV — repart vierge.
 */
export function clearOublisPortes(): PortesOublis {
  const vide = carnetVide();
  try {
    window.localStorage.removeItem(CLE_OUBLIS);
    /* Le carnet repart vierge : la liste des écrans vidés s'oublie avec lui,
       sinon elle nommerait des gestes que le carnet ne compte plus. */
    window.localStorage.removeItem(CLE_VIDES);
    window.localStorage.removeItem(CLE_VIDES_DATES);
    window.localStorage.removeItem(CLE_APPUIS);
    window.localStorage.removeItem(CLE_RETIRES_NOM);
    window.localStorage.removeItem(CLE_RETIRES_HIST);
    window.localStorage.removeItem(CLE_RETOURS);
    window.localStorage.removeItem(CLE_RETOURS_HIST);
  } catch {
    /* Un navigateur qui refuse le stockage laisse l'écran à zéro jusqu'au
       rechargement, sans mentir sur ce qu'il retient. */
  }
  return vide;
}

/**
 * Retirer un seul geste du carnet, sur cet appareil seulement.
 *
 * La petite gomme posée sur une ligne du carnet n'efface rien d'autre : le
 * compte recule d'une visite, le jour du dernier oubli se repose sur le geste
 * le plus récent qui reste, et les visites retenues par l'appareil — les
 * repères « déjà empruntée » — ne bougent pas plus que le plan.
 */
export function removeOubliPorte(lien: string, date: string): PortesOublis {
  const avant = readOublisPortes();
  let retire = false;
  let ecranRetire = '';
  const journal = avant.journal.filter((geste) => {
    if (retire) return true;
    if (geste.lien !== lien || geste.date !== date) return true;
    retire = true;
    ecranRetire = geste.ecran || geste.lien;
    return false;
  });
  /* Le geste n'était pas au carnet : rien n'a été retiré, et le chiffre ne
     recule pas pour un oubli que la gomme n'a pas fait. */
  if (!retire) return avant;
  const total = Math.max(0, avant.total - 1);
  const dernier = journal.length > 0 ? journal[journal.length - 1].date : null;
  const apres: PortesOublis = { total, dernier, journal };
  /* Le dernier geste d'un écran : l'écran entre dans la liste de ceux dont
     tous les gestes ont déjà été retirés de cet appareil. Un écran qui garde
     encore un geste en sort. */
  if (ecranRetire) {
    const reste = journal.some((geste) => (geste.ecran || geste.lien) === ecranRetire);
    if (reste) demarquerEcranVide(ecranRetire);
    else marquerEcranVide(ecranRetire);
  }
  try {
    if (total === 0 && journal.length === 0) {
      window.localStorage.removeItem(CLE_OUBLIS);
    } else {
      window.localStorage.setItem(CLE_OUBLIS, JSON.stringify(apres));
    }
  } catch {
    /* Un navigateur qui refuse le stockage laisse l'écran se relire le temps
       de la visite : le carnet repart de sa mémoire au rechargement. */
  }
  return apres;
}

/** Les portes lues, si l'enregistrement se lit encore comme une table. */
export function readPortesVues(): PortesVues {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return {};
    const lu: unknown = JSON.parse(brut);
    if (!lu || typeof lu !== 'object') return {};
    const table: PortesVues = {};
    Object.entries(lu as Record<string, unknown>).forEach(([lien, date]) => {
      if (typeof date !== 'string') return;
      const jour = new Date(date);
      if (Number.isNaN(jour.getTime())) return;
      table[lien] = jour.toISOString();
    });
    return table;
  } catch {
    return {};
  }
}

/**
 * Une porte réellement empruntée : son adresse est datée, et la table entière
 * est rendue pour que l'écran se relise aussitôt, sans rouvrir le stockage.
 */
export function markPorteVue(lien: string, at: string = new Date().toISOString()): PortesVues {
  const table = readPortesVues();
  const date = new Date(at);
  table[lien] = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  try {
    window.localStorage.setItem(CLE, JSON.stringify(table));
  } catch {
    /* Un navigateur qui refuse le stockage laisse la visite en cours se
       souvenir : le repère s'efface au rechargement, sans mentir. */
  }
  return table;
}

/** La visite d'une porte, si elle a un jour été retenue. */
export function readPorteVue(lien: string, table: PortesVues = readPortesVues()): string | null {
  return table[lien] ?? null;
}

/**
 * Oublier la visite d'une seule porte, sur cet appareil seulement.
 *
 * La petite gomme posée sur le repère « déjà empruntée » ne touche que cette
 * porte-là : les autres visites restent, et rien n'est jamais écrit au serveur.
 * La table relue est rendue pour que l'écran se relise aussitôt.
 */
export function clearPorteVue(lien: string, ecran: string = ''): PortesVues {
  const table = readPortesVues();
  /* Rien n'était retenu : la gomme ne compte pas un oubli qu'elle n'a pas
     fait, et le carnet reste au chiffre qu'il dit. */
  if (!table[lien]) return table;
  const vuLe = table[lien];
  delete table[lien];
  try {
    window.localStorage.setItem(CLE, JSON.stringify(table));
  } catch {
    /* Un navigateur qui refuse le stockage laisse l'écran se relire le temps
       de la visite : le repère revient au rechargement, sans mentir. */
  }
  /* La visite réellement rendue entre dans le carnet des oublis, avec l'écran
     qu'elle ouvrait et le jour du geste : le CSV s'y lira ligne à ligne. */
  markOublis([{ lien, ecran: ecran || lien, date: new Date().toISOString() }]);
  return table;
}

/**
 * Oublier les visites d'un seul chantier, sur cet appareil.
 *
 * La petite gomme posée sous le rappel d'un chantier ne rend que les portes
 * de ce chantier-là — la sienne et celles de ses modules —, jamais celles des
 * autres. Le carnet des oublis n'avance que du nombre de visites réellement
 * effacées : une porte jamais visitée ne fait pas monter le chiffre.
 */
export function clearPortesVues(
  liens: string[],
  ecrans: Record<string, string> = {},
): PortesVues {
  const table = readPortesVues();
  const gestes: OubliPorte[] = [];
  liens.forEach((lien) => {
    if (!table[lien]) return;
    delete table[lien];
    gestes.push({
      lien,
      ecran: ecrans[lien] || lien,
      date: new Date().toISOString(),
    });
  });
  if (gestes.length === 0) return table;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(table));
  } catch {
    /* Un navigateur qui refuse le stockage laisse l'écran se relire le temps
       de la visite : les repères reviennent au rechargement, sans mentir. */
  }
  markOublis(gestes);
  return table;
}