import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/i18n/LangProvider';
import { annonces } from '@/mocks/annonces';
import { emplois } from '@/mocks/emplois';
import type { DepositKind } from '@/pages/deposer/components/useDepositForm';

/** Le titre le plus court d'une liste, pour servir de repère d'écriture. */
const shortestOf = (titles: string[]) => titles
  .map((title) => (title || '').trim())
  .filter(Boolean)
  .reduce((shortest, title) => (shortest === '' || title.length < shortest.length ? title : shortest), '');

/**
 * Combien de lignes sont déjà publiées sous une rubrique donnée, sur le
 * tableau de sa famille, et quel titre y est le plus court. Le compte
 * additionne le stock de référence affiché par le tableau et les dépôts
 * validés en base — c'est exactement le nombre de cartes que le visiteur
 * retrouvera en ouvrant la porte filtrée. Le titre le plus court se lit sur
 * les mêmes lignes : il donne le ton de la rubrique avant d'écrire le sien.
 */
export function useRubriqueCount(kind: DepositKind, rubrique: string) {
  const { lang } = useLang();

  /* Le stock de référence, lu sans serveur : la ligne s'affiche tout de suite,
     même quand la requête traîne. */
  const referenceTitles = useMemo(() => {
    if (!rubrique) return [];
    if (kind === 'annonce') {
      return annonces
        .filter((a) => a.cat === rubrique)
        .map((a) => a.title[lang] ?? a.title.fr);
    }
    return emplois
      .filter((j) => j.contract === rubrique)
      .map((j) => j.title[lang] ?? j.title.fr);
  }, [kind, rubrique, lang]);

  const reference = referenceTitles.length;

  const [publishedTitles, setPublishedTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!rubrique) {
      setPublishedTitles([]);
      return;
    }
    let alive = true;
    setLoading(true);

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('paperatlas_annonces')
          .select('titre')
          .eq('kind', kind)
          .eq('statut', 'publie')
          .eq('rubrique', rubrique)
          .limit(1000);
        if (!alive) return;
        if (error) {
          setPublishedTitles([]);
          return;
        }
        setPublishedTitles((data ?? []).map((row) => String(row.titre ?? '')));
      } catch {
        if (alive) setPublishedTitles([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    void load();
    return () => {
      alive = false;
    };
  }, [kind, rubrique]);

  /** Le titre le plus court de la rubrique, dépôts de référence et publiés mêlés. */
  const shortest = useMemo(
    () => shortestOf([...referenceTitles, ...publishedTitles]),
    [referenceTitles, publishedTitles],
  );

  return { count: reference + publishedTitles.length, loading, shortest };
}