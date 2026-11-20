import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { additionner, compterDepots, fichesAnnuaire, type DepotPays } from '@/lib/marches';

type Counts = Record<string, number>;

/**
 * How many sheets each country really holds: the directory's workshops and
 * pens, plus the deposits published on the Annonces and Emplois boards. The
 * directory part is known at once, so a chip never reads zero while the boards
 * are still being read; the deposits then land on top of it.
 *
 * A failed request leaves the directory figure in place rather than an error or
 * a zero: the counter still says something true, and the page never waits.
 */
export function useFichesPubliees(): { counts: Counts; depots: Counts; loading: boolean } {
  const [depots, setDepots] = useState<Counts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('paperatlas_annonces')
          .select('kind, pays')
          .eq('statut', 'publie');
        if (error) throw error;
        if (alive) setDepots(compterDepots((data ?? []) as DepotPays[]));
      } catch {
        if (alive) setDepots({});
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const counts = useMemo(() => additionner(fichesAnnuaire(), depots), [depots]);

  return { counts, depots, loading };
}