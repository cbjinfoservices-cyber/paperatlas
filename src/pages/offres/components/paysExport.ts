import { csvText, saveCsv } from '@/lib/csv';
import { saveWorkbook, type XlsxCell } from '@/lib/xlsx';
import { localeFor } from '@/i18n/localize';
import { lienPrix } from '@/hooks/usePrixPays';
import { grouper, type TarifMarche } from '@/lib/tarif';
import type { EnvoiPays } from '@/lib/paysCopiesMemory';
import { plans, prixPlan } from './plans';
import { feuilleRappels, type LigneRappelExport } from './paysRappelExport';

/**
 * Les deux fichiers que la feuille des tarifs peut confier : le tableau
 * complet des marchés, et la tournée de relance avec ses rappels. Le calcul
 * des colonnes vit ici plutôt que dans la feuille, pour que le composant
 * garde la seule mise en écran.
 */

type Traducteur = (key: string) => string;

/** Un jour entier, pour compter le temps écoulé d'une date à l'autre. */
const JOUR_MS = 86400000;

/** Les jours entiers écoulés depuis une date, comptés de minuit à minuit. */
export function joursDepuisIso(iso: string): number {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 0;
  const now = new Date();
  const depart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const aujourdhui = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.max(0, Math.round((aujourdhui - depart) / JOUR_MS));
}

/** Le jour et l'heure d'une date, dans la langue de la page. */
export function jourHeureTexte(iso: string, lang: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(localeFor(lang), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

/** Le premier fichier : le tableau tel qu'il se lit à l'écran, avec son tri et
 *  son filtre écrits dans le nom de fichier. */
export function exporterTarifsPays({
  lignes,
  noms,
  t,
  lang,
  pays,
  tri,
  filtre,
}: {
  lignes: TarifMarche[];
  noms: Map<string, string>;
  t: Traducteur;
  lang: string;
  pays: string;
  tri: string;
  filtre: string;
}): void {
  const lines: string[][] = [
    [
      t('ofs.csvCode'),
      t('ofs.colMarket'),
      ...plans.map((plan) => t(plan.name)),
      t('ofs.csvEco'),
      t('ofs.colCoef'),
      t('ofs.csvFloor'),
      t('ofs.csvLink'),
    ],
    ...lignes.map((row) => [
      row.code,
      noms.get(row.code) ?? row.code,
      ...plans.map((plan) => prixPlan(plan, row.code)),
      row.economieAnnuelle,
      `${Math.round(row.coef * 100)} %`,
      row.plancher ? t('ofs.csvYes') : '',
      lienPrix(row.code, lang),
    ]),
  ];
  const day = new Date().toISOString().slice(0, 10);
  const triSlug =
    tri === 'economie' ? 'tri-economie' : tri === 'servis' ? 'tri-servis' : 'tri-catalogue';
  const filtreSlug =
    filtre === 'plancher'
      ? '-plancher'
      : filtre === 'hors'
        ? '-hors-fourchette'
        : filtre === 'oublies'
          ? '-oublies'
          : filtre === 'relances'
            ? '-deja-relances'
            : filtre === 'rappels'
              ? '-deja-rappeles'
              : filtre === 'retards'
                ? '-rappels-retard'
                : '';
  saveCsv(
    `paperatlas-tarifs-pays-${pays}-${day}-${triSlug}${filtreSlug}.csv`,
    csvText(lines),
  );
}

/** Le second fichier : la tournée à faire, son seuil et son total, puis les
 *  rappels déjà faits et depuis combien de jours ils datent. */
export function exporterRelancePays({
  listeRelance,
  copies,
  parCode,
  noms,
  relances,
  rappels,
  delaiRappel,
  auteur,
  lienRelance,
  nomChoisi,
  pays,
  seuil,
  totalRelanceDzd,
  rappelsTous,
  rappelsManques,
  seuilRappelManque,
  seuilUrgence,
  /** Le nom du marché le plus urgent, vide quand aucun rappel ne dépasse le
   *  seuil d'urgence. */
  urgentNom,
  /** Son retard en jours, compté au-delà du délai de rappel. */
  urgentJours,
  t,
  lang,
}: {
  listeRelance: string[];
  copies: Record<string, EnvoiPays>;
  parCode: Map<string, TarifMarche>;
  noms: Map<string, string>;
  relances: Record<string, string>;
  rappels: Record<string, string>;
  delaiRappel: number;
  auteur: string;
  lienRelance: string;
  nomChoisi: string;
  pays: string;
  seuil: number;
  totalRelanceDzd: number;
  rappelsTous: TarifMarche[];
  /** Les marchés relancés depuis plus de trois semaines et toujours sans
   *  second contact : le classeur les marque sur la feuille des rappels, et
   *  compte combien ils sont dans la feuille « Seuil et total ». */
  rappelsManques: string[];
  /** Le seuil, en jours, au-delà duquel un rappel est dit manqué. */
  seuilRappelManque: number;
  /** Le seuil au-delà duquel un retard de rappel est dit urgent : la colonne
   *  « urgent » de la feuille des rappels se compte sur lui. */
  seuilUrgence: number;
  /** Le nom du marché le plus urgent, vide quand aucun rappel ne dépasse le
   *  seuil d'urgence. */
  urgentNom: string;
  /** Son retard en jours, compté au-delà du délai de rappel. */
  urgentJours: number;
  t: Traducteur;
  lang: string;
}): void {
  const jourHeure = (iso: string) => jourHeureTexte(iso, lang);
  const joursDepuis = (iso: string) => joursDepuisIso(iso);

  /* La première feuille se trie sur la colonne « relancé le » : les marchés
     déjà relancés passent devant, le contact le plus récent en tête, puis
     ceux qui n'ont encore rien reçu. */
  const listeTriee = [...listeRelance].sort((a, b) => {
    const temps = (code: string) => {
      const marque = relances[code];
      if (!marque) return 0;
      const valeur = new Date(marque).getTime();
      return Number.isNaN(valeur) ? 0 : valeur;
    };
    const da = temps(a);
    const db = temps(b);
    if (da > 0 && db > 0) return db - da;
    if (da > 0) return -1;
    if (db > 0) return 1;
    return 0;
  });
  const lignesRelance: XlsxCell[][] = [
    [
      t('ofs.csvCode'),
      t('ofs.colMarket'),
      t('ofs.csvYear'),
      t('ofs.csvYearDzd'),
      t('ofs.relanceCsvDays'),
      t('ofs.relanceCsvLast'),
      t('ofs.relanceCsvMarked'),
      t('ofs.relanceCsvBy'),
      t('ofs.relanceCsvRappelLate'),
      t('ofs.csvLink'),
      t('ofs.relanceCsvReply'),
    ],
    ...listeTriee.map((code) => {
      const envoi = copies[code];
      const tarif = parCode.get(code);
      return [
        code,
        noms.get(code) ?? code,
        tarif?.montantAnnuel ?? '',
        tarif?.montantAnnuelDzd ?? 0,
        envoi ? joursDepuis(envoi.at) : 0,
        envoi ? jourHeure(envoi.at) : '',
        relances[code] ? jourHeure(relances[code]) : '',
        relances[code] ? auteur.trim() : '',
        relances[code] && !rappels[code] && joursDepuis(relances[code]) >= delaiRappel
          ? t('ofs.relanceCsvRappelLateVal').replace(
              '{n}',
              String(joursDepuis(relances[code]) - delaiRappel),
            )
          : '',
        lienPrix(code, lang),
        '',
      ];
    }),
    [
      '',
      t('ofs.relanceCsvTotalRow').replace('{n}', String(listeRelance.length)),
      '',
      totalRelanceDzd,
      '',
      '',
      '',
      '',
      '',
      '',
    ],
  ];
  const etabli = new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'long' }).format(
    new Date(),
  );
  /* Le second contact déjà fait part sur sa propre feuille, le plus récent en
     tête : les rappels qui commencent eux aussi à dater portent leur propre
     compte de jours. */
  /* Les rappels déjà faits, le plus récent en tête ; puis les rappels
     manqués — relancés depuis plus de trois semaines et toujours sans second
     contact —, le plus ancien en tête. La même feuille porte donc les deux
     lectures : ce qui a été fait, et ce qui a été laissé filer, chaque ligne
     manquée datée par ses jours écoulés depuis la relance. */
  const lignesRappels: LigneRappelExport[] = [
    ...[...rappelsTous]
      .sort(
        (a, b) => new Date(rappels[b.code]).getTime() - new Date(rappels[a.code]).getTime(),
      )
      .map((row) => ({
        code: row.code,
        nom: noms.get(row.code) ?? row.code,
        tarif: row.montantAnnuel,
        relance: relances[row.code] ? jourHeure(relances[row.code]) : '',
        rappel: jourHeure(rappels[row.code]),
        jours: relances[row.code]
          ? Math.max(0, joursDepuis(relances[row.code]) - joursDepuis(rappels[row.code]))
          : 0,
        depuisRappel: joursDepuis(rappels[row.code]),
        /* Le retard du second contact sur le délai choisi : zéro quand il est
           arrivé à temps, sinon les jours qui dépassent — la colonne se trie
           pour repérer les rappels les plus tardifs. */
        retard: relances[row.code]
          ? Math.max(
              0,
              joursDepuis(relances[row.code]) -
                joursDepuis(rappels[row.code]) -
                delaiRappel,
            )
          : 0,
        manque: false,
        depuisRelance: relances[row.code] ? joursDepuis(relances[row.code]) : 0,
        auteur: auteur.trim(),
        /* Le rappel dépasse le seuil d'urgence choisi : la colonne « urgent » le
           marque, pour que le tableur remonte d'un tri les seconds contacts les
           plus urgents. */
        urgent:
          relances[row.code] !== undefined &&
          Math.max(
            0,
            joursDepuis(relances[row.code]) -
              joursDepuis(rappels[row.code]) -
              delaiRappel,
          ) >= seuilUrgence,
        lien: lienPrix(row.code, lang),
      })),
    ...rappelsManques
      .filter((code) => !rappels[code] && relances[code])
      .sort((a, b) => joursDepuis(relances[b]) - joursDepuis(relances[a]))
      .map((code) => {
        const row = parCode.get(code);
        const jours = joursDepuis(relances[code]);
        return {
          code,
          nom: noms.get(code) ?? code,
          tarif: row?.montantAnnuel ?? '',
          relance: relances[code] ? jourHeure(relances[code]) : '',
          rappel: '',
          jours: 0,
          depuisRappel: 0,
          retard: Math.max(0, jours - delaiRappel),
          manque: true,
          depuisRelance: jours,
          auteur: '',
          urgent: jours - delaiRappel >= seuilUrgence,
          lien: lienPrix(code, lang),
        };
      }),
  ];
  const meta: XlsxCell[][] = [
    [t('ofs.relanceCsvMetaHead')],
    [],
    [
      t('ofs.relanceCsvThreshold'),
      t('ofs.relanceCsvThresholdVal').replace('{n}', String(seuil)),
    ],
    [t('ofs.relanceCsvCount'), listeRelance.length],
    [t('ofs.relanceCsvTotalLab'), totalRelanceDzd],
    [t('ofs.relanceCsvCountry'), `${nomChoisi} (${pays})`],
    [t('ofs.relanceCsvBuilt'), etabli],
    [t('ofs.relanceCsvLinkLab'), { text: lienRelance, url: lienRelance }],
    [t('ofs.rappelCsvCount'), rappelsTous.length],
    [],
    [t('ofs.relanceCsvNote')],
    [t('ofs.relanceCsvMarkedHint')],
    [t('ofs.relanceCsvByHint')],
    [t('ofs.relanceCsvSortHint')],
    [t('ofs.relanceCsvReplyHint')],
    [t('ofs.relanceCsvRappelLateHint')],
    [t('ofs.relanceCsvUrgenceLab').replace('{n}', String(seuilUrgence))],
    [
      t('ofs.relanceCsvUrgentLab'),
      urgentNom
        ? t('ofs.relanceCsvUrgentVal')
            .replace('{pays}', urgentNom)
            .replace('{n}', String(urgentJours))
        : t('ofs.relanceCsvUrgentNone'),
    ],
    /* Le compte des rappels manqués vient juste après le marché le plus
       urgent : les deux se lisent ensemble, et l'on sait combien de seconds
       contacts ont été laissés filer sans ouvrir la feuille des rappels. */
    [
      t('ofs.rappelManqueCsvLab').replace('{n}', String(seuilRappelManque)),
      rappelsManques.length > 0
        ? t('ofs.rappelManqueCsvVal').replace('{n}', String(rappelsManques.length))
        : t('ofs.rappelManqueCsvNone'),
    ],
    [t('ofs.rappelManqueCsvHint').replace('{n}', String(seuilRappelManque))],
    [t('ofs.rappelCsvHint')],
    [t('ofs.relanceCsvUrgentHint')],
  ];
  const day = new Date().toISOString().slice(0, 10);
  saveWorkbook(`paperatlas-relance-pays-${pays}-${day}-${seuil}j.xlsx`, [
    {
      name: t('ofs.relanceCsvSheetRows'),
      rows: lignesRelance,
      widths: [7, 22, 16, 16, 13, 22, 18, 22, 22, 34, 26],
    },
    {
      name: t('ofs.relanceCsvSheetMeta'),
      rows: meta,
      widths: [38, 40],
    },
    {
      name: t('ofs.rappelCsvSheet'),
      rows: feuilleRappels(lignesRappels, t),
      widths: [7, 22, 16, 18, 18, 16, 18, 14, 11, 14, 18, 20, 34, 26],
    },
  ]);
}