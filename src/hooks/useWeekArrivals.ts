import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

/** Seven days: the beat inside the thirty-day window, not a second threshold. */
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
/** The bar lives on every page: one count is enough for a few minutes. */
const TTL_MS = 5 * 60 * 1000;

let cache: { count: number; at: number } | null = null;

const cached = () => (cache && Date.now() - cache.at < TTL_MS ? cache.count : null);

/**
 * How many candidates registered during the last seven days. Member cards are
 * readable by signed-in members only, so a visitor with no account simply sees
 * no badge rather than a misleading zero-forced count.
 */
export function useWeekArrivals(): number {
  const { session } = useAuth();
  const [count, setCount] = useState<number>(() => cached() ?? 0);

  useEffect(() => {
    let alive = true;
    if (!session) {
      setCount(0);
      return undefined;
    }
    const known = cached();
    if (known !== null) {
      setCount(known);
      return undefined;
    }
    void (async () => {
      try {
        const since = new Date(Date.now() - WEEK_MS).toISOString();
        const { count: found, error } = await supabase
          .from('paperatlas_membres')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'candidat')
          .gte('created_at', since);
        if (error) throw error;
        const value = found ?? 0;
        cache = { count: value, at: Date.now() };
        if (alive) setCount(value);
      } catch {
        if (alive) setCount(0);
      }
    })();
    return () => {
      alive = false;
    };
  }, [session]);

  return count;
}