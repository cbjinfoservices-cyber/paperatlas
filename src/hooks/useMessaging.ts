import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import {
  CANDIDATURE_COLUMNS,
  CONVERSATION_COLUMNS,
  MESSAGE_COLUMNS,
  isUnread,
  markCandidaturesSeen,
  replyPaceByConversation,
  SEEN_COLUMNS,
  statusChangeUnseen,
  type Candidature,
  type ConversationRow,
  type MessageRow,
  type SeenMark,
} from '@/lib/messaging';

const CHANNEL_SEED = Math.random().toString(36).slice(2, 8);

/** Every thread I take part in, newest activity first, refreshed live. */
export function useConversations() {
  const { user } = useAuth();
  const meId = user?.id ?? '';
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!meId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setError('');
    try {
      const { data, error: queryError } = await supabase
        .from('paperatlas_conversations')
        .select(CONVERSATION_COLUMNS)
        .or(`user_a.eq.${meId},user_b.eq.${meId}`)
        .order('last_at', { ascending: false })
        .limit(120);
      if (queryError) throw queryError;
      setRows((data ?? []) as ConversationRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [meId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!meId) return undefined;
    const channel = supabase
      .channel(`conversations-${meId}-${CHANNEL_SEED}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'paperatlas_conversations' },
        () => {
          void reload();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [meId, reload]);

  const unread = useMemo(() => rows.filter((row) => isUnread(row, meId)).length, [rows, meId]);

  return { rows, loading, error, reload, unread };
}

/** Live unread badge for the navigation. */
export function useUnreadCount() {
  const { user } = useAuth();
  const { unread } = useConversations();
  return user ? unread : 0;
}

/**
 * Le rythme de chaque fil, lu sur les messages de tous les fils affichés.
 *
 * Une seule requête, la même règle de mesure que l'en-tête d'une
 * conversation : la liste peut ainsi dire d'un coup d'œil quels échanges
 * dorment, sans qu'il faille les ouvrir un par un. Une lecture qui échoue
 * laisse simplement la pastille absente — la liste reste utilisable.
 */
export function useReplyPace(conversationIds: string[]) {
  const [gaps, setGaps] = useState<Record<string, number>>({});
  const key = conversationIds.filter(Boolean).join(',');

  useEffect(() => {
    if (!key) {
      setGaps({});
      return undefined;
    }
    let alive = true;
    const load = async () => {
      try {
        const ids = key.split(',');
        const { data, error: queryError } = await supabase
          .from('paperatlas_messages')
          .select(MESSAGE_COLUMNS)
          .in('conversation_id', ids)
          .order('created_at', { ascending: true })
          .limit(3000);
        if (queryError) throw queryError;
        if (alive) setGaps(replyPaceByConversation((data ?? []) as MessageRow[]));
      } catch {
        if (alive) setGaps({});
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [key]);

  return gaps;
}

/** The messages of one thread, appended as they arrive. */
export function useThread(conversationId: string) {
  const { user } = useAuth();
  const meId = user?.id ?? '';
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const seen = useRef<Set<string>>(new Set());

  const reload = useCallback(async () => {
    if (!conversationId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: queryError } = await supabase
        .from('paperatlas_messages')
        .select(MESSAGE_COLUMNS)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(300);
      if (queryError) throw queryError;
      const list = (data ?? []) as MessageRow[];
      seen.current = new Set(list.map((row) => row.id));
      setRows(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!conversationId) return undefined;
    const channel = supabase
      .channel(`thread-${conversationId}-${CHANNEL_SEED}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'paperatlas_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const next = payload.new as MessageRow;
          if (!next?.id || seen.current.has(next.id)) return;
          seen.current.add(next.id);
          setRows((prev) => [...prev, next]);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const send = useCallback(
    async (body: string) => {
      const corps = body.trim();
      if (!corps || !conversationId || !meId) return false;
      const { error: insertError } = await supabase.from('paperatlas_messages').insert({
        conversation_id: conversationId,
        sender_id: meId,
        corps,
      });
      if (insertError) {
        setError(insertError.message);
        return false;
      }
      await supabase
        .from('paperatlas_conversations')
        .update({ last_message: corps.slice(0, 160), last_at: new Date().toISOString() })
        .eq('id', conversationId);
      /* The realtime echo fills the list; this only covers a slow socket. */
      const { data } = await supabase
        .from('paperatlas_messages')
        .select(MESSAGE_COLUMNS)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1);
      const latest = (data ?? [])[0] as MessageRow | undefined;
      if (latest && !seen.current.has(latest.id)) {
        seen.current.add(latest.id);
        setRows((prev) => [...prev, latest]);
      }
      return true;
    },
    [conversationId, meId],
  );

  return { rows, loading, error, reload, send, meId };
}

/** Applications I sent — and, for an employer, the ones I received. */
export function useApplications() {
  const { user } = useAuth();
  const meId = user?.id ?? '';
  const [rows, setRows] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!meId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: queryError } = await supabase
        .from('paperatlas_candidatures')
        .select(CANDIDATURE_COLUMNS)
        .or(`user_id.eq.${meId},entreprise_user_id.eq.${meId}`)
        .order('created_at', { ascending: false })
        .limit(120);
      if (queryError) throw queryError;
      const loaded = (data ?? []) as Candidature[];
      /* The application row carries no country of its own: it is read from the
         candidate profile, so the employer's counter can say where the pile
         comes from. A candidate with no country on file reads as Algerian, as
         everywhere else on the site. */
      const ids = Array.from(new Set(loaded.map((row) => row.user_id).filter(Boolean)));
      const paysById = new Map<string, string | null>();
      if (ids.length > 0) {
        try {
          const { data: members } = await supabase
            .from('paperatlas_membres')
            .select('id, pays')
            .in('id', ids);
          ((members ?? []) as { id: string; pays: string | null }[]).forEach((member) => {
            paysById.set(member.id, member.pays ?? null);
          });
        } catch {
          /* The profiles are only a reading aid: the board still loads without them. */
        }
      }
      setRows(loaded.map((row) => ({
        ...row,
        candidat_pays: paysById.get(row.user_id) ?? null,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [meId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const sent = useMemo(() => rows.filter((row) => row.user_id === meId), [rows, meId]);
  const received = useMemo(() => rows.filter((row) => row.entreprise_user_id === meId), [rows, meId]);

  const setStatut = useCallback(
    async (id: string, statut: Candidature['statut'], note?: string) => {
      /* Bumping updated_at is what brings the candidate's badge back after a
         second decision on the same file. */
      const moved = new Date().toISOString();
      /* L'accusé de réception ne se déduit plus de l'ouverture du dossier :
         il porte la date du courriel réellement parti au candidat, écrite par
         la fonction d'envoi. Le changement de statut n'y touche pas. */
      const patch: Record<string, unknown> = { statut, updated_at: moved };
      /* A shortlist may carry a word for the candidate; it is cleared when the
         employer shortlists again without writing one. */
      if (typeof note === 'string') patch.note_employeur = note.trim() || null;
      const { error: updateError } = await supabase
        .from('paperatlas_candidatures')
        .update(patch)
        .eq('id', id);
      if (updateError) return false;
      setRows((prev) => prev.map((row) => (
        row.id === id
          ? {
            ...row,
            statut,
            updated_at: moved,
            note_employeur: typeof note === 'string' ? (note.trim() || null) : row.note_employeur,
          }
          : row
      )));
      return true;
    },
    [rows],
  );

  return { rows, sent, received, loading, error, reload, setStatut, meId };
}

type AppFlag = {
  id: string;
  user_id: string;
  entreprise_user_id: string | null;
  statut: Candidature['statut'];
  updated_at: string;
};

const APP_FLAG_COLUMNS = 'id, user_id, entreprise_user_id, statut, updated_at';

/**
 * What the navigation badge counts: new applications waiting on an employer,
 * plus decisions (shortlisted / declined) the candidate has not opened yet.
 */
export function useUnreadApplications() {
  const { user } = useAuth();
  const meId = user?.id ?? '';
  const [rows, setRows] = useState<AppFlag[]>([]);
  const [seen, setSeen] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(Boolean(meId));

  const reload = useCallback(async () => {
    if (!meId) {
      setRows([]);
      setSeen({});
      setLoading(false);
      return;
    }
    try {
      const [apps, marks] = await Promise.all([
        supabase
          .from('paperatlas_candidatures')
          .select(APP_FLAG_COLUMNS)
          .or(`user_id.eq.${meId},entreprise_user_id.eq.${meId}`)
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('paperatlas_candidature_vues')
          .select(SEEN_COLUMNS)
          .eq('user_id', meId)
          .limit(300),
      ]);
      if (apps.error) throw apps.error;
      setRows((apps.data ?? []) as AppFlag[]);
      const marks_: Record<string, string> = {};
      ((marks.data ?? []) as SeenMark[]).forEach((mark) => {
        marks_[mark.candidature_id] = mark.seen_at;
      });
      setSeen(marks_);
    } catch {
      setRows([]);
      setSeen({});
    } finally {
      setLoading(false);
    }
  }, [meId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!meId) return undefined;
    const channel = supabase
      .channel(`candidatures-${meId}-${CHANNEL_SEED}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'paperatlas_candidatures' },
        () => {
          void reload();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [meId, reload]);

  const received = useMemo(
    () => rows.filter((row) => row.entreprise_user_id === meId && row.statut === 'envoyee').length,
    [rows, meId],
  );

  const unseenIds = useMemo(
    () => rows
      .filter((row) => row.user_id === meId && statusChangeUnseen(row.statut, row.updated_at, seen[row.id]))
      .map((row) => row.id),
    [rows, meId, seen],
  );

  const markSeen = useCallback(
    async (ids: string[]) => {
      if (!meId || ids.length === 0) return;
      await markCandidaturesSeen(meId, ids);
      await reload();
    },
    [meId, reload],
  );

  return {
    unread: received + unseenIds.length,
    received,
    settled: unseenIds.length,
    unseenIds,
    markSeen,
    loading,
    reload,
  };
}