import { csvText, saveCsv } from '@/lib/csv';
import { localeFor } from '@/i18n/localize';

/** Les trois périodes proposées au-dessus du compteur : le mois en cours, les
 *  trente derniers jours, ou tout l'historique. */
export type PeriodeDemandes = 'mois' | 'jours30' | 'tout';

/** Une demande telle que le classeur la reçoit : le sujet déjà posé par le
 *  formulaire, l'état tel qu'il a été coché dans la console. */
export type DemandeExport = {
  id: number;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  sujet: string;
  profil: string;
  organisation: string;
  message: string;
  traitee: boolean;
  created_at: string;
};

type Args = {
  rows: DemandeExport[];
  periode: PeriodeDemandes;
  lang: string;
  t: (key: string) => string;
  nomSujet: (sujet: string) => string;
};

/**
 * Le classeur des demandes, une ligne par message : de quoi confier la file au
 * secrétariat sans lui donner d'accès à la console. L'état part avec chaque
 * ligne, donc une feuille triée sur « Traitée » dit ce qui reste à faire.
 */
export function buildDemandesCsv({ rows, periode, lang, t, nomSujet }: Args): string {
  const lines: string[][] = [];
  lines.push([
    t('adm.csv.date'),
    t('adm.colName'),
    t('adm.csv.email'),
    t('adm.csv.tel'),
    t('adm.csv.org'),
    t('adm.csv.profil'),
    t('adm.colSubject'),
    t('adm.colMessage'),
    t('adm.colEtat'),
  ]);

  const locale = localeFor(lang);
  const horodatage = new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  rows.forEach((row) => {
    const at = new Date(row.created_at);
    lines.push([
      Number.isNaN(at.getTime()) ? '' : horodatage.format(at),
      row.nom ?? '',
      row.email ?? '',
      row.telephone ?? '',
      row.organisation,
      row.profil,
      nomSujet(row.sujet),
      row.message,
      row.traitee ? t('adm.done') : t('adm.todo'),
    ]);
  });

  const jour = new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date());
  lines.push([]);
  lines.push([t('adm.csv.periodLabel'), t(`adm.period.${periode}`)]);
  lines.push([t('adm.csv.rowsLabel'), String(rows.length)]);
  lines.push([t('adm.csv.exportedOn'), jour]);

  return csvText(lines);
}

/** `PaperAtlas-demandes-mois-2026-11-08.csv` — la feuille nomme sa période. */
export function demandesCsvFilename(periode: PeriodeDemandes) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `PaperAtlas-demandes-${periode}-${stamp}.csv`;
}

export function downloadDemandesCsv(args: Args) {
  saveCsv(demandesCsvFilename(args.periode), buildDemandesCsv(args));
}