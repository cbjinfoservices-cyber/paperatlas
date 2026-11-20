/**
 * Les colonnes du pied de page que le visiteur a ouvertes.
 *
 * Sur un téléphone, les groupes de liens se replient derrière un
 * accordéon. Comme le pied de page est redessiné à chaque page, l'ouverture
 * était perdue dès qu'on suivait un lien : elle est gardée pour la session, le
 * temps de la visite, et aussi d'une visite à l'autre — un habitué qui a
 * déplié une colonne la retrouve ouverte, et celle qu'il a refermée reste
 * refermée.
 *
 * La session passe devant la mémoire longue : un geste fait à l'instant ne
 * peut pas être annulé par un choix plus ancien.
 */
const LOCAL_KEY = 'paperatlas.footer.cols';
const SESSION_KEY = 'paperatlas.footer.cols.session';

/** Les deux groupes de liens du pied de page, dans l'ordre où ils se lisent :
 *  la plateforme, puis les métiers et le contact réunis sous un intitulé plus
 *  court. Le bouton « tout déplier / tout replier » les tient tous les deux. */
export const FOOTER_COL_IDS = ['foot-platform', 'foot-elsewhere'];

/** Un geste sur une colonne seule : les autres gardent ce qu'elles étaient. */
const COL_CHANGED = 'paperatlas:footer-cols:changed';
/** Un geste sur toutes les colonnes : chaque accordéon se range d'un coup. */
const ALL_CHANGED = 'paperatlas:footer-cols:all';

function readMap(area: Storage | null, key: string): Record<string, boolean> {
  if (!area) return {};
  try {
    const raw = area.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Record<string, boolean> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([id, value]) => {
      if (value === true || value === false) out[id] = value;
    });
    return out;
  } catch {
    return {};
  }
}

function writeMap(area: Storage | null, key: string, map: Record<string, boolean>) {
  if (!area) return;
  try {
    area.setItem(key, JSON.stringify(map));
  } catch {
    /* Un navigateur qui refuse le stockage laisse simplement la colonne se
       replier : le pied de page reste utilisable. */
  }
}

function areas(): { local: Storage | null; session: Storage | null } {
  try {
    return { local: window.localStorage, session: window.sessionStorage };
  } catch {
    return { local: null, session: null };
  }
}

/** La colonne était-elle ouverte au dernier passage sur le site ? */
export function readFooterCol(listId: string): boolean {
  const { local, session } = areas();
  const thisVisit = readMap(session, SESSION_KEY);
  if (typeof thisVisit[listId] === 'boolean') return thisVisit[listId];
  return readMap(local, LOCAL_KEY)[listId] === true;
}

/** Retient l'état d'une colonne, pour la visite en cours et pour les suivantes. */
export function writeFooterCol(listId: string, open: boolean) {
  const { local, session } = areas();

  const thisVisit = readMap(session, SESSION_KEY);
  thisVisit[listId] = open;
  writeMap(session, SESSION_KEY, thisVisit);

  const remembered = readMap(local, LOCAL_KEY);
  if (open) remembered[listId] = true;
  else delete remembered[listId];
  writeMap(local, LOCAL_KEY, remembered);

  /* Une colonne changée seule : le bouton du pied de page doit relire la
     réponse, sinon il promettrait « tout déplier » alors que deux colonnes
     sur trois sont déjà ouvertes. */
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new Event(COL_CHANGED));
  } catch {
    /* Un navigateur sans CustomEvent laisse simplement le bouton en place. */
  }
}

/** Les deux groupes sont-ils tous dépliés ? */
export function footerColsAllOpen(): boolean {
  return FOOTER_COL_IDS.every((id) => readFooterCol(id));
}

/** Combien des deux groupes sont dépliés : le bouton du pied de page le
 *  dit quand elles ne le sont pas toutes, plutôt que de promettre un geste
 *  global que deux colonnes sur trois ont déjà accompli. */
export function footerColsOpenCount(): number {
  return FOOTER_COL_IDS.filter((id) => readFooterCol(id)).length;
}

/** Déplie ou replie les deux groupes d'un coup, avec la même mémoire que
    chacune prise seule : la visite en cours d'abord, la mémoire longue ensuite. */
export function writeAllFooterCols(open: boolean) {
  FOOTER_COL_IDS.forEach((id) => writeFooterCol(id, open));
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent<boolean>(ALL_CHANGED, { detail: open }));
  } catch {
    /* Rien à faire : les colonnes ont déjà leur état dans le stockage. */
  }
}

/** La petite gomme du pied de page.
 *
 * Elle ne replie pas seulement les deux colonnes : elle efface aussi la
 * mémoire longue, si bien que le pied de page revient à l'état où il s'ouvre
 * pour la première fois — les deux accordéons fermés. C'est le geste de la
 * gomme du carnet de parcours, transposé au bas de page : un pied de page
 * qu'on a déplié un jour ne reste pas déplié pour toujours sans qu'on puisse
 * revenir en arrière.
 *
 * Le repli est annoncé par le même évènement que le bouton global : les deux
 * accordéons se rangent d'un coup, et le bouton relit sa réponse. */
export function resetFooterCols() {
  const { local, session } = areas();
  try {
    local?.removeItem(LOCAL_KEY);
  } catch {
    /* Un stockage refusé laisse simplement la mémoire d'avant en place. */
  }
  try {
    session?.removeItem(SESSION_KEY);
  } catch {
    /* Idem : les colonnes se replient quand même, par l'évènement. */
  }
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent<boolean>(ALL_CHANGED, { detail: false }));
    window.dispatchEvent(new Event(COL_CHANGED));
  } catch {
    /* Sans évènement, le bouton garde son dernier mot : rien n'est cassé. */
  }
}

/** Le nombre de portes relevé sur la liste de chaque colonne.
 *
 * Le bouton « tout déplier » ne compte pas les liens qui paraissent : il lit
 * ce que chaque colonne a réellement relevé sur sa propre liste, transmis ici
 * au moment de la mesure. Une porte ajoutée au pied de page se lit donc dans
 * le bouton comme dans l'accordéon de la colonne, sans qu'on écrive un total à
 * la main — et une seule source, pour que les deux chiffres ne se contredisent
 * jamais. */
const doorsTally: Record<string, number> = {};

/** Un compte de colonne a changé : le bouton global relit le sien. */
const DOORS_CHANGED = 'paperatlas:footer-doors:changed';

/** La colonne annonce combien de portes sa liste tient. */
export function reportFooterColDoors(listId: string, doors: number) {
  const next = Number.isFinite(doors) && doors > 0 ? Math.round(doors) : 0;
  if (doorsTally[listId] === next) return;
  doorsTally[listId] = next;
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new Event(DOORS_CHANGED));
  } catch {
    /* Un navigateur sans évènement laisse simplement le bouton sur son
       dernier chiffre : le pied de page reste utilisable. */
  }
}

/** Les portes du pied de page, en tout et dans les colonnes dépliées.
 *
 * Les deux chiffres du bouton viennent d'ici : le total se lit sur les listes,
 * et la part ouverte sur l'état que chacune retient — un geste sur un seul
 * accordéon change donc la part ouverte sans toucher au total. */
export type FooterDoorTally = {
  total: number;
  open: number;
  /* Les portes de chaque colonne, prises séparément : la gomme n'efface pas
     « les colonnes » en général, elle efface celles qui sont ouvertes, et son
     survol nomme le compte de chacune. */
  byCol: Record<string, number>;
};

export function footerDoorTally(): FooterDoorTally {
  let total = 0;
  let open = 0;
  const byCol: Record<string, number> = {};
  FOOTER_COL_IDS.forEach((id) => {
    const doors = doorsTally[id] ?? 0;
    byCol[id] = doors;
    total += doors;
    if (readFooterCol(id)) open += doors;
  });
  return { total, open, byCol };
}

/** Le bouton écoute les comptes relevés dans les colonnes. */
export function onFooterDoorsChange(handler: () => void) {
  window.addEventListener(DOORS_CHANGED, handler);
  return () => window.removeEventListener(DOORS_CHANGED, handler);
}

/** Chaque accordéon écoute : un geste sur toutes le range sans le redessiner. */
export function onFooterColsAllChange(handler: (open: boolean) => void) {
  const listener = (event: Event) => {
    handler((event as CustomEvent<boolean>).detail === true);
  };
  window.addEventListener(ALL_CHANGED, listener);
  return () => window.removeEventListener(ALL_CHANGED, listener);
}

/** Le bouton suit aussi les gestes faits sur une seule colonne. */
export function onFooterColsChange(handler: () => void) {
  window.addEventListener(COL_CHANGED, handler);
  return () => window.removeEventListener(COL_CHANGED, handler);
}