import { csvText, saveCsv } from '@/lib/csv';
import type { XlsxCell, XlsxSheet } from '@/lib/xlsx';
import { localeFor } from '@/i18n/localize';

/** Une ligne du journal des renvois, telle que la fonction serveur la rend :
 *  la date vient du serveur, l'auteur est l'adresse de l'appelant, et le
 *  destinataire celui qui a réellement reçu — ou aurait dû recevoir — le
 *  courriel. */
export type RenvoiAccuse = {
  id: string;
  candidature_id: string;
  destinataire: string;
  auteur: string | null;
  declencheur: string | null;
  candidat_nom: string | null;
  offre_titre: string | null;
  entreprise: string | null;
  statut: string | null;
  motif: string | null;
  sent_at: string;
};

type Args = {
  /** Les lignes que la console affiche, dans l'ordre où elle les lit. */
  rows: RenvoiAccuse[];
  lang: string;
  t: (key: string) => string;
};

/** Une candidature dont l'accusé n'est pas encore parti, telle que la fonction
 *  serveur la rend : la file du renvoi, lue sur le dépôt réel du candidat. */
export type AccuseEnAttente = {
  id: string;
  offre_titre: string | null;
  entreprise: string | null;
  candidat_nom: string | null;
  candidat_email: string | null;
  statut: string | null;
  created_at: string;
};

/** `PaperAtlas-accuses-renvois-2026-11-16.csv` : le journal daté du jour de
 *  l'export, pour qu'une archive se range à côté des autres. */
export function accusesRenvoisCsvFilename(at: Date = new Date()) {
  return `PaperAtlas-accuses-renvois-${at.toISOString().slice(0, 10)}.csv`;
}

/**
 * Le journal des renvois, une ligne par geste : sa date, son auteur, son
 * destinataire, la candidature concernée et son état. Un envoi qui n'est pas
 * parti garde sa ligne, avec son motif — le fichier ne compte pas seulement
 * les succès, il dit aussi ce qui a échoué et pourquoi.
 */
export function buildAccusesRenvoisCsv({ rows, lang, t }: Args): string {
  const locale = localeFor(lang);
  const quand = (iso: string) => {
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return iso;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };
  const stamp = new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date());

  const lines: string[][] = [];
  lines.push([
    t('ad.p.acc.histDate'),
    t('ad.p.acc.histAuthor'),
    t('ad.p.acc.histTo'),
    t('ad.p.acc.candidat'),
    t('ad.p.acc.offre'),
    t('ad.p.acc.histTrigger'),
    t('ad.p.acc.histState'),
    t('ad.p.acc.histReason'),
  ]);

  rows.forEach((row) => {
    lines.push([
      quand(row.sent_at),
      row.auteur || '',
      row.destinataire || '',
      row.candidat_nom || '',
      [row.offre_titre || '', row.entreprise || ''].filter(Boolean).join(' · '),
      t(
        row.declencheur === 'depot' ? 'ad.p.acc.histDepot' : 'ad.p.acc.histRenvoi',
      ),
      t(row.statut === 'envoye' ? 'ad.p.acc.histSent' : 'ad.p.acc.histFailed'),
      row.motif ? t(`ad.p.acc.why.${row.motif}`) : '',
    ]);
  });

  lines.push([]);
  lines.push([t('ad.p.acc.histCsvCount'), String(rows.length)]);
  lines.push([t('dirCsv.exportedOn'), stamp]);

  return csvText(lines);
}

export function downloadAccusesRenvoisCsv(args: Args) {
  saveCsv(accusesRenvoisCsvFilename(), buildAccusesRenvoisCsv(args));
}

/**
 * Le même journal, mais dans un onglet du classeur de la console : une ligne
 * par geste d'envoi, avec sa date, son auteur, son destinataire, la
 * candidature et son état. Un envoi qui n'est pas parti garde sa ligne et son
 * motif — l'onglet ne compte pas seulement les succès.
 */
export function buildRenvoisSheet({ rows, lang, t }: Args): XlsxSheet {
  const locale = localeFor(lang);
  const quand = (iso: string) => {
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return iso;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  const lignes: XlsxCell[][] = [];
  lignes.push(
    [
      t('ad.p.acc.histDate'),
      t('ad.p.acc.histAuthor'),
      t('ad.p.acc.histTo'),
      t('ad.p.acc.candidat'),
      t('ad.p.acc.offre'),
      t('ad.p.acc.histTrigger'),
      t('ad.p.acc.histState'),
      t('ad.p.acc.histReason'),
    ].map(t),
  );

  rows.forEach((row) => {
    lignes.push([
      quand(row.sent_at),
      row.auteur || '',
      row.destinataire || '',
      row.candidat_nom || '',
      [row.offre_titre || '', row.entreprise || ''].filter(Boolean).join(' · '),
      t(row.declencheur === 'depot' ? 'ad.p.acc.histDepot' : 'ad.p.acc.histRenvoi'),
      t(row.statut === 'envoye' ? 'ad.p.acc.histSent' : 'ad.p.acc.histFailed'),
      row.motif ? t(`ad.p.acc.why.${row.motif}`) : '',
    ]);
  });

  if (rows.length === 0) lignes.push([t('ad.xls.renvoisEmpty')]);

  lignes.push([]);
  lignes.push([t('dirCsv.noteTitle')]);
  lignes.push([t('ad.p.acc.histCsvCount'), rows.length]);
  lignes.push([t('ad.xls.renvoisNote')]);

  return {
    name: t('ad.xls.renvoisSheet'),
    rows: lignes,
    widths: [20, 30, 30, 26, 38, 16, 14, 26],
  };
}

/**
 * La file du renvoi, posée dans son propre onglet : une ligne par candidature
 * dont l'accusé n'est pas encore parti, la plus ancienne en tête. L'attente se
 * compte depuis le dépôt réel, et la ligne en retard porte son repère — le
 * fichier se joint alors à un point d'étape sans avoir à rouvrir la console.
 */
export function buildAttenteSheet({
  rows,
  lang,
  t,
}: {
  rows: AccuseEnAttente[];
  lang: string;
  t: (key: string) => string;
}): XlsxSheet {
  const locale = localeFor(lang);
  const jourCourt = (iso: string) => {
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return iso;
    return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(date);
  };
  const joursAttente = (iso: string) => {
    const time = new Date(iso).getTime();
    if (!Number.isFinite(time)) return '';
    return Math.max(0, Math.floor((Date.now() - time) / 86400000));
  };
  /* Une journée pleine : le même seuil que le rappel de la console, pour que
     le fichier et la carte ne disent pas deux choses différentes. */
  const enRetard = (iso: string) => {
    const time = new Date(iso).getTime();
    return Number.isFinite(time) && Date.now() - time > 86400000;
  };

  const lignes: XlsxCell[][] = [];
  lignes.push(
    [
      t('ad.p.acc.candidat'),
      t('ad.p.acc.histTo'),
      t('ad.p.acc.offre'),
      t('ad.p.acc.waitSince'),
      t('ad.xls.ageDays'),
      t('ad.xls.attenteLate'),
    ].map(t),
  );

  /* La plus ancienne d'abord : la file se lit dans l'ordre où elle se traite,
     comme la carte des accusés. */
  const file = rows
    .slice()
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

  file.forEach((row) => {
    lignes.push([
      row.candidat_nom || '—',
      row.candidat_email || '',
      [row.offre_titre || '', row.entreprise || ''].filter(Boolean).join(' · '),
      jourCourt(row.created_at),
      joursAttente(row.created_at),
      enRetard(row.created_at) ? t('ad.p.acc.late') : '',
    ]);
  });

  if (file.length === 0) lignes.push([t('ad.xls.attenteEmpty')]);

  const enRetardCount = file.filter((row) => enRetard(row.created_at)).length;
  lignes.push([]);
  lignes.push([t('dirCsv.noteTitle')]);
  lignes.push([t('ad.xls.attenteCount'), file.length]);
  /* Le rappel se lit sur la même mesure que la carte : au-delà d'une journée,
     la ligne compte, sinon elle se tait plutôt que d'afficher un zéro. */
  if (enRetardCount > 0) lignes.push([t('ad.p.acc.reminderShort'), enRetardCount]);
  lignes.push([t('ad.xls.attenteNote')]);

  return {
    name: t('ad.xls.attenteSheet'),
    rows: lignes,
    widths: [28, 30, 44, 16, 14, 16],
  };
}