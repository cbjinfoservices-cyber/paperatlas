import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { LISTING_COLUMNS, type ListingKind, type ListingRow } from '@/lib/listings';

type BoardState = {
  rows: ListingRow[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
};

/** Deposits already validated by the team, newest first — what the boards display. */
export function usePublishedListings(kind: ListingKind): BoardState {
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: queryError } = await supabase
        .from('paperatlas_annonces')
        .select(LISTING_COLUMNS)
        .eq('kind', kind)
        .eq('statut', 'publie')
        .order('created_at', { ascending: false })
        .limit(60);
      if (queryError) throw queryError;
      setRows((data ?? []) as ListingRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { rows, loading, error, reload };
}

/** Every deposit of the signed-in account, whatever its review state. */
export function useMyListings(): BoardState {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: queryError } = await supabase
        .from('paperatlas_annonces')
        .select(LISTING_COLUMNS)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (queryError) throw queryError;
      setRows((data ?? []) as ListingRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { rows, loading, error, reload };
}

/** One deposit by id, used when a job sheet is opened on an offer posted from the site. */
export function useListingById(id: string | undefined) {
  const [row, setRow] = useState<ListingRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /* Reference posts use short slugs, not uuids: nothing to query then. */
    const looksLikeUuid = Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-/i.test(id));
    if (!looksLikeUuid) {
      setRow(null);
      setLoading(false);
      return;
    }
    let alive = true;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('paperatlas_annonces')
          .select(LISTING_COLUMNS)
          .eq('id', id as string)
          .maybeSingle();
        if (error) throw error;
        if (alive) setRow((data as ListingRow | null) ?? null);
      } catch {
        if (alive) setRow(null);
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [id]);

  return { row, loading };
}