import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import type { NonNullableClient } from './types';

export function useLocalSession(db: NonNullableClient | null) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(db));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!db) return;
    let active = true;
    const { data: { subscription } } = db.auth.onAuthStateChange((event, next) => {
      if (event === 'INITIAL_SESSION') return;
      setSession(next);
      setError('');
    });
    void db.auth.getSession().then(result => {
      if (!active) return;
      setSession(result.data.session);
      setError(result.error?.message ?? '');
      setLoading(false);
    }).catch((failure: unknown) => {
      if (!active) return;
      setError(failure instanceof Error ? failure.message : 'Lecture de la session impossible.');
      setLoading(false);
    });
    const syncRefresh = (state: typeof AppState.currentState) => {
      if (state === 'active') void db.auth.startAutoRefresh();
      else void db.auth.stopAutoRefresh();
    };
    syncRefresh(AppState.currentState);
    const listener = AppState.addEventListener('change', syncRefresh);
    return () => {
      active = false;
      subscription.unsubscribe();
      listener.remove();
      void db.auth.stopAutoRefresh();
    };
  }, [db]);

  return { session, loading, error };
}
