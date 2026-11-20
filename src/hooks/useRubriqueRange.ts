import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { annonces } from '@/mocks/annonces';
import { emplois } from '@/mocks/emplois';
import { deviseCode } from '@/lib/pays';
import type { DepositKind } from '@/pages/deposer/components/useDepositForm';

/** Une fourchette indicative, lue sur les prix d'une rubrique. */
export type RubriqueRange = {
  /** Le plus bas des prix relevés, dans la monnaie du pays. */
  min: number;
  /** Le plus haut des prix relevés. */
  max: number;
  /** La monnaie dans laquelle la fourchette se lit. */
  devise: string;
  /** Sur combien de dépôts de la rubrique elle a été mesurée. */
  count: number;
  /** Combien de ces dépôts viennent des dépôts validés en base. */
  countBase: number;
  /** Combien viennent du stock de référence du tableau. */
  countStock: number;
  /** Le jour du dépôt en base le plus récent, pour dire sa fraîcheur. */
  lastAt: string | null;
  /** Combien de dépôts publiés le tableau filtré ouvrira vraiment : la même
   *  rubrique, le même pays, tous les prix confondus — y compris ceux dont le
   *  montant ne se lit pas, qui restent des lignes du tableau. */
  boardCount: number;
  /** Combien, parmi ces dépôts ouverts, portent un prix lisible — la même
   *  mesure que la fourchette, mais comptée sur toutes les monnaies, pour
   *  distinguer le nombre de lignes du nombre de prix. */
  boardPriced: number;
};

/** Les codes de monnaie qui peuvent déjà figurer dans un prix saisi. */
const CODE_TOKEN = /\b(DA|DZD|SAR|BHD|KMF|DJF|EGP|AED|IQD|JOD|KWD|LBP|LYD|MAD|MRU|OMR|QAR|SOS|SDG|SYP|TND|YER)\b/i;

/** « DA » est l'ancienne écriture du dinar algérien : les deux valent DZD. */
const ALIAS_DEVISE: Record<string, string> = { DA: 'DZD' };

/**
 * Le montant d'un prix écrit à la main : « 6 800 000 DA », « 96 000 DA /
 * palette », « 1,4 M DA », « 85 000 DA + primes ». Les phrases sans chiffre —
 * « Sur devis », « À négocier » — ne disent aucun montant et sont écartées.
 */
function priceValue(raw: string | null | undefined): { value: number; devise: string } | null {
  const text = (raw || '').replace(/[\u00a0\u202f\u2009]/g, ' ').trim();
  if (!text || !/\d/.test(text)) return null;

  const token = text.match(CODE_TOKEN);
  const devise = token ? (ALIAS_DEVISE[token[1].toUpperCase()] ?? token[1].toUpperCase()) : '';

  const figure = text.match(/(\d[\d\s]*(?:[.,]\d+)?)/);
  if (!figure) return null;

  /* Une virgule suivie de trois chiffres sépare les milliers ; ailleurs elle
     ouvre les décimales — « 1,350 TND » vaut 1 350, « 1,4 M » vaut 1,4. */
  const digits = figure[1].replace(/\s/g, '');
  const normalized = /\d,\d{3}\b/.test(digits) ? digits.replace(/,/g, '') : digits.replace(',', '.');
  let value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;

  /* Le « M » qui suit le chiffre vaut un million : « 1,4 M DA ». */
  const after = text.slice((figure.index ?? 0) + figure[0].length);
  if (/^\s*M\b/i.test(after)) value *= 1_000_000;

  return { value, devise };
}

/**
 * La fourchette indicative d'une rubrique, lue sur les prix réellement
 * affichés : le stock de référence du tableau, et les dépôts validés en base —
 * les seuls que le visiteur y trouvera en ouvrant la porte filtrée. Elle suit
 * donc les dépôts réels, sans attendre une refonte du stock de démonstration.
 *
 * Elle ne se dit que dans la monnaie du pays lu, et seulement quand deux
 * dépôts au moins la portent : un chiffre seul ne fait pas une fourchette, et
 * un prix d'une autre monnaie ne s'y compare pas. Une lecture refusée par la
 * base laisse simplement le stock de référence faire la fourchette.
 */
export function useRubriqueRange(
  kind: DepositKind,
  rubrique: string,
  pays: string,
): RubriqueRange | null {
  const cle = (rubrique || '').trim();
  const devise = deviseCode(pays);
  /* Les prix des dépôts validés en base, chacun avec son jour : relus quand la
     rubrique ou le pays changent, jamais devinés quand la lecture échoue. */
  const [valides, setValides] = useState<{ budget: string; at: string }[]>([]);
  /* Le compte du tableau : tous les dépôts publiés de la rubrique dans ce
     pays, que leur prix se lise ou non. */
  const [boardRows, setBoardRows] = useState(0);

  useEffect(() => {
    if (!cle) {
      setValides([]);
      setBoardRows(0);
      return undefined;
    }
    let alive = true;

    const load = async () => {
      try {
        const base = supabase
          .from('paperatlas_annonces')
          .select('budget, created_at')
          .eq('kind', kind)
          .eq('rubrique', cle)
          .eq('statut', 'publie')
          .limit(200);
        const { data, error } = await (pays ? base.eq('pays', pays) : base);
        if (error) throw error;
        if (!alive) return;
        const lignes = (data ?? []) as { budget: string | null; created_at: string | null }[];
        setValides(
          lignes.map((row) => ({
            budget: String(row.budget ?? ''),
            at: String(row.created_at ?? ''),
          })),
        );
        setBoardRows(lignes.length);
      } catch {
        if (alive) {
          setValides([]);
          setBoardRows(0);
        }
      }
    };

    void load();
    return () => {
      alive = false;
    };
  }, [kind, cle, pays]);

  return useMemo(() => {
    if (!cle) return null;

    const reference = kind === 'annonce'
      ? annonces.filter((item) => item.cat === cle).map((item) => item.price)
      : emplois.filter((item) => item.contract === cle).map((item) => item.salary);

    /* Chaque source compte séparément : la fourchette dira sur combien de
       dépôts réels elle s'appuie, et combien viennent du stock de référence. */
    const keep = (raw: string) => {
      const parsed = priceValue(raw);
      if (!parsed) return null;
      if (parsed.devise && parsed.devise !== devise) return null;
      return parsed.value;
    };

    const fromStock = reference
      .map((raw) => keep(raw))
      .filter((value): value is number => value !== null);
    /* Chaque dépôt de la base garde son jour : la fourchette pourra dire de
       quand date le plus récent, plutôt que de laisser croire à un stock figé. */
    const fromBase = valides
      .map((row) => {
        const value = keep(row.budget);
        return value === null ? null : { value, at: row.at };
      })
      .filter((item): item is { value: number; at: string } => item !== null);

    const values = [...fromStock, ...fromBase.map((item) => item.value)];
    if (values.length < 2) return null;

    const lastAt = fromBase.reduce<string | null>((newest, item) => {
      const stamp = Date.parse(item.at);
      if (!Number.isFinite(stamp)) return newest;
      if (!newest) return item.at;
      return stamp > Date.parse(newest) ? item.at : newest;
    }, null);

    /* Les dépôts publiés qui portent un montant, quelle que soit sa monnaie :
       le tableau ouvrira bien ces prix, quand les autres lignes restent des
       lignes sans montant. */
    const boardPriced = valides.filter((row) => priceValue(row.budget) !== null).length;

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      devise,
      count: values.length,
      countBase: fromBase.length,
      countStock: fromStock.length,
      lastAt,
      boardCount: boardRows,
      boardPriced,
    };
  }, [kind, cle, devise, valides, boardRows]);
}