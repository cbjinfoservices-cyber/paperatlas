import type { EtatEncaissement } from './adminPaiementsCore';
import type { VuePaiements } from './adminPaiementsCsv';

/**
 * « Exporter le tableau » laisse une trace : la date de la dernière archive
 * produite depuis cet appareil, et ce qu'elle contenait. Elle répond à une
 * seule question, posée en tête de l'écran « Paiements » : l'archive du jour
 * existe-t-elle déjà, ou faut-il la refaire avant de relancer ?
 *
 * Gardée sur l'appareil seulement : c'est un repère de lecture, pas un fait du
 * dossier, et elle ne se mélange jamais aux abonnements eux-mêmes.
 */
const CLE = 'paperatlas:admin-paiements-export';

const MOTIFS: ReadonlyArray<EtatEncaissement> = [
  'pret',
  'essai',
  'sansMontant',
  'sansCanal',
  'manuel',
  'retard',
  'ferme',
];

const VUES: ReadonlyArray<VuePaiements> = ['regler', 'prets', 'all'];

/** Un export passé, tel que la mémoire de l'appareil l'a retenu : sa date,
 *  ce qu'il emportait et ce qu'il pesait. C'est la ligne de l'historique. */
export type ExportPoint = {
  at: string;
  motif: EtatEncaissement | 'all';
  vue: VuePaiements;
  rows: number;
  montant: number;
  /** Les lignes emportées, par leur identifiant : de quoi nommer celles qui
   *  sont arrivées ou parties depuis cet export. Absent sur une mémoire plus
   *  ancienne, qui ne retenait que le décompte — aucune ligne n'est alors
   *  inventée. */
  ids?: string[];
};

/** Combien d'exports l'historique range sous la ligne d'archive. */
const HISTORIQUE_MAX = 7;

export type MemoireExport = {
  /** L'instant de l'export, tel qu'il a été écrit. */
  at: string;
  /** Le motif posé sur la file au moment du clic. */
  motif: EtatEncaissement | 'all';
  /** La vue choisie, quand aucun motif n'était posé. */
  vue: VuePaiements;
  /** Le nombre de lignes emportées dans le fichier. */
  rows: number;
  /** Le montant que ces lignes portaient au moment du clic : la ligne
   *  d'archive dit ainsi ce que l'export emportait, pas seulement combien de
   *  lignes il contenait. */
  montant: number;
  /** Les instants des exports des sept derniers jours, du plus ancien au plus
   *  récent : c'est le compteur « exporté cette semaine » de l'écran. */
  semaine: string[];
  /** Les sept derniers exports, du plus récent au plus ancien, avec pour
   *  chacun sa date, son nombre de lignes et son montant : l'archive se relit
   *  dans le temps, pas seulement à son dernier geste. */
  historique: ExportPoint[];
  /** Les lignes emportées lors du dernier export, par leur identifiant. */
  ids?: string[];
};

/** Sept jours, la fenêtre du compteur de la semaine. */
const SEMAINE_MS = 7 * 24 * 60 * 60 * 1000;
const JOUR_MS = 24 * 60 * 60 * 1000;

/** Les instants lisibles d'une mémoire, sans doublon ni date invalide. */
const instants = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  const vus = new Set<string>();
  value.forEach((item) => {
    if (typeof item !== 'string') return;
    if (!Number.isFinite(new Date(item).getTime())) return;
    vus.add(item);
  });
  return [...vus].sort();
};

/** Les identifiants retenus d'un export, sans doublon ni valeur vide. Un
 *  export vide garde une liste vide, distincte d'une mémoire qui n'en
 *  portait pas du tout. */
const listeIds = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const vus = new Set<string>();
  value.forEach((item) => {
    if (typeof item !== 'string') return;
    const cle = item.trim();
    if (!cle) return;
    vus.add(cle);
  });
  return [...vus].slice(0, 5000);
};

const motifValide = (value: unknown): value is EtatEncaissement | 'all' =>
  value === 'all' || (MOTIFS as ReadonlyArray<unknown>).includes(value);

const vueValide = (value: unknown): value is VuePaiements =>
  (VUES as ReadonlyArray<unknown>).includes(value);

/** Les points d'historique lisibles d'une mémoire, sans date invalide. */
const lirePoints = (value: unknown): ExportPoint[] => {
  if (!Array.isArray(value)) return [];
  const out: ExportPoint[] = [];
  value.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const point = item as Partial<ExportPoint>;
    if (typeof point.at !== 'string') return;
    if (!Number.isFinite(new Date(point.at).getTime())) return;
    const rows = Number(point.rows);
    const montant = Number(point.montant);
    const ids = listeIds(point.ids);
    const retenu: ExportPoint = {
      at: point.at,
      motif: motifValide(point.motif) ? point.motif : 'all',
      vue: vueValide(point.vue) ? point.vue : 'all',
      rows: Number.isFinite(rows) && rows >= 0 ? Math.round(rows) : 0,
      montant: Number.isFinite(montant) && montant > 0 ? Math.round(montant) : 0,
    };
    if (ids) retenu.ids = ids;
    out.push(retenu);
  });
  return out.slice(0, HISTORIQUE_MAX);
};

/** La dernière archive connue de cet appareil, ou null s'il n'y en a pas. */
export function readExportPaiements(): MemoireExport | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CLE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MemoireExport> | null;
    if (!parsed || typeof parsed.at !== 'string') return null;
    if (!Number.isFinite(new Date(parsed.at).getTime())) return null;
    const rows = Number(parsed.rows);
    const montant = Number(parsed.montant);
    const motif = motifValide(parsed.motif) ? parsed.motif : 'all';
    const vue = vueValide(parsed.vue) ? parsed.vue : 'all';
    const ids = listeIds(parsed.ids);
    const dernier: ExportPoint = {
      at: parsed.at,
      motif,
      vue,
      rows: Number.isFinite(rows) && rows >= 0 ? Math.round(rows) : 0,
      montant: Number.isFinite(montant) && montant > 0 ? Math.round(montant) : 0,
    };
    if (ids) dernier.ids = ids;
    /* Une mémoire écrite avant l'historique n'en porte qu'un point : celui du
       dernier export, reconstitué sur les champs déjà connus. Aucune date
       n'est inventée, et aucun montant n'est ajouté après coup. */
    const historique = lirePoints(parsed.historique);
    return {
      ...dernier,
      /* La date du dernier export compte toujours dans la semaine, même si
         une mémoire plus ancienne ne portait pas encore la liste. */
      semaine: instants([parsed.at, ...instants(parsed.semaine)]),
      historique: historique.length > 0 ? historique : [dernier],
    };
  } catch {
    /* Stockage refusé ou contenu illisible : aucune archive n'est connue. */
    return null;
  }
}

/** Note l'archive qui vient de partir, et rend la mémoire retenue. */
export function saveExportPaiements(
  entry: Omit<MemoireExport, 'at' | 'semaine' | 'historique'> & { at?: string },
): MemoireExport {
  const at = entry.at ?? new Date().toISOString();
  const stamp = new Date(at).getTime();
  /* La semaine ne retient que les sept derniers jours : un export d'il y a
     deux mois ne doit pas compter dans « exporté cette semaine ». */
  const semaine = [
    ...instants(readExportPaiements()?.semaine),
    at,
  ]
    .filter((iso) => {
      const time = new Date(iso).getTime();
      return Number.isFinite(time) && Number.isFinite(stamp) && stamp - time <= SEMAINE_MS;
    })
    .slice(-40);
  const montant = Number(entry.montant);
  const chiffre = Number.isFinite(montant) && montant > 0 ? Math.round(montant) : 0;
  const lignes = Math.max(0, Math.round(entry.rows));
  const point: ExportPoint = { at, motif: entry.motif, vue: entry.vue, rows: lignes, montant: chiffre };
  /* Les lignes du fichier, retenues par leur identifiant : la ligne d'archive
     pourra nommer celles qui sont arrivées ou parties depuis. */
  const ids = listeIds(entry.ids);
  if (ids) point.ids = ids;
  /* L'historique range les sept derniers exports, le plus récent devant :
     chaque ligne dit sa date, ce qu'elle emportait et ce qu'elle pesait. */
  const historique = [point, ...(readExportPaiements()?.historique ?? [])].slice(
    0,
    HISTORIQUE_MAX,
  );
  const memoire: MemoireExport = {
    at,
    motif: entry.motif,
    vue: entry.vue,
    rows: lignes,
    montant: chiffre,
    semaine,
    historique,
  };
  if (ids) memoire.ids = ids;
  if (typeof window === 'undefined') return memoire;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(memoire));
  } catch {
    /* Stockage refusé : le fichier est parti, la mémoire ne le retient pas. */
  }
  return memoire;
}

/**
 * Efface la trace de l'export : l'écran repart d'une ligne vierge, comme si
 * aucune archive n'avait jamais été produite depuis cet appareil. Le geste ne
 * touche ni les fichiers déjà téléchargés, ni les abonnements.
 */
export function clearExportPaiements(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    /* Stockage refusé : il n'y avait de toute façon rien à retenir. */
  }
}

/** Combien d'exports dans la semaine écoulée, et depuis combien de jours
 *  remonte le dernier : de quoi repérer un tableau qu'on n'a pas réédité
 *  depuis plusieurs jours. */
export type SemaineExport = {
  count: number;
  /** Les jours entiers depuis le dernier export, ou null sans mémoire. */
  jours: number | null;
};

export function semaineExportPaiements(memoire: MemoireExport | null): SemaineExport {
  if (!memoire) return { count: 0, jours: null };
  const now = Date.now();
  const at = new Date(memoire.at).getTime();
  const jours = Number.isFinite(at) ? Math.max(0, Math.floor((now - at) / JOUR_MS)) : null;
  const count = memoire.semaine.filter((iso) => {
    const time = new Date(iso).getTime();
    return Number.isFinite(time) && now - time <= SEMAINE_MS && now - time >= 0;
  }).length;
  return { count, jours };
}

/** Vrai quand l'archive a été produite le jour même : deux exports le même
 *  jour ne se distinguent pas dans un dossier, celui-ci le dit à l'écran. */
export function exportDuJour(at?: string | null): boolean {
  if (!at) return false;
  const date = new Date(at);
  if (!Number.isFinite(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}