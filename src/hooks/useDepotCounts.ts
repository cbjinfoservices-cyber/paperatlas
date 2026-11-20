import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { annonces } from '@/mocks/annonces';
import { emplois } from '@/mocks/emplois';

export type DepotCounts = {
  annonce: number;
  offre: number;
  /**
   * Les candidatures reçues sur les offres de ce compte : `null` quand rien ne
   * peut en être dit — visiteur non connecté, ou lecture refusée par la base.
   * Un zéro ne se devine pas : la pastille s'abstient plutôt que de mentir.
   */
  candidatures: number | null;
};

/**
 * Combien de lignes le tableau tient déjà dans chaque famille : les dépôts
 * validés par l'équipe, plus le stock de référence que les tableaux affichent.
 * C'est le même total que le visiteur voit en ouvrant le tableau — il sait
 * donc, avant d'écrire, dans combien de lignes son dépôt va prendre place.
 *
 * La famille des offres porte en plus les candidatures reçues : un employeur
 * voit, avant de rédiger, ce que la famille fait déjà travailler. La lecture
 * s'arrête à ses propres offres — la base ne livre pas les candidatures des
 * autres, et un visiteur anonyme n'en reçoit aucune.
 */
export function useDepotCounts() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const [counts, setCounts] = useState<DepotCounts>({
    annonce: annonces.length,
    offre: emplois.length,
    candidatures: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const [annonceRows, offreRows, candidatureRows] = await Promise.all([
          supabase
            .from('paperatlas_annonces')
            .select('id', { count: 'exact', head: true })
            .eq('kind', 'annonce')
            .eq('statut', 'publie'),
          supabase
            .from('paperatlas_annonces')
            .select('id', { count: 'exact', head: true })
            .eq('kind', 'offre')
            .eq('statut', 'publie'),
          userId
            ? supabase
              .from('paperatlas_candidatures')
              .select('id', { count: 'exact', head: true })
              .eq('entreprise_user_id', userId)
            : Promise.resolve({ count: null, error: null }),
        ]);
        if (!alive) return;
        setCounts({
          annonce: annonces.length + (annonceRows.error ? 0 : annonceRows.count ?? 0),
          offre: emplois.length + (offreRows.error ? 0 : offreRows.count ?? 0),
          candidatures: candidatureRows.error || candidatureRows.count === null
            ? null
            : candidatureRows.count,
        });
      } catch {
        /* le stock de référence reste affiché, sans les dépôts validés */
      } finally {
        if (alive) setLoading(false);
      }
    };

    void load();
    return () => {
      alive = false;
    };
  }, [userId]);

  return { counts, loading };
}