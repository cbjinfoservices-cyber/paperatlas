import { useEffect, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { useAuth } from '@/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { openConversation, type MemberCard } from '@/lib/messaging';

const COLUMNS = 'id, nom, organisme, metier, wilaya, role';

/** `%` and commas would break the PostgREST filter, so they are stripped. */
function cleanQuery(raw: string) {
  return raw.replace(/[%(),]/g, ' ').trim();
}

export default function NewThread({ onOpen }: { onOpen: (id: string) => void }) {
  const { t } = useLang();
  const { compte, user } = useAuth();
  const meId = user?.id ?? '';
  const meNom = (compte?.nom || compte?.organisme || user?.email || '').trim();

  const [q, setQ] = useState('');
  const [rows, setRows] = useState<MemberCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!meId) return undefined;
    let alive = true;
    const needle = cleanQuery(q);
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        let query = supabase.from('paperatlas_membres').select(COLUMNS).neq('id', meId).limit(12);
        if (needle) query = query.or(`nom.ilike.%${needle}%,organisme.ilike.%${needle}%,wilaya.ilike.%${needle}%`);
        const { data, error: queryError } = await query.order('nom', { ascending: true });
        if (queryError) throw queryError;
        if (alive) setRows((data ?? []) as MemberCard[]);
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'error');
          setRows([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }, needle ? 260 : 0);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [q, meId]);

  const start = async (member: MemberCard) => {
    if (!meId) return;
    setBusyId(member.id);
    setError('');
    try {
      const id = await openConversation({
        meId,
        meNom: meNom || t('msg.you'),
        otherId: member.id,
        otherNom: member.nom,
        sujet: '',
        kind: 'libre',
      });
      onOpen(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="msg-new">
      <h2 className="msg-new-title">
        <i className="ri-user-add-line" aria-hidden="true"></i>
        {t('msg.newTitle')}
      </h2>
      <div className="fld fld-inline msg-search">
        <i className="ri-search-line" aria-hidden="true"></i>
        <input
          type="search"
          className="text-sm"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('msg.searchPh')}
          aria-label={t('msg.search')}
        />
      </div>

      {loading && (
        <p className="msg-side-note">
          <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
          {t('msg.loading')}
        </p>
      )}

      {!loading && rows.length === 0 && <p className="msg-side-note">{t('msg.searchEmpty')}</p>}

      <ul className="msg-members">
        {rows.map((member) => (
          <li key={member.id}>
            <span className="msg-avatar" aria-hidden="true">
              {(member.nom || '?').trim().charAt(0).toUpperCase()}
            </span>
            <span className="msg-member-id">
              <b>{member.nom}</b>
              <small>
                {[member.organisme, member.wilaya].filter(Boolean).join(' · ') || t(`acct.role.${member.role === 'candidat' ? 'candidat' : 'pro'}`)}
              </small>
            </span>
            <button type="button" className="share-btn" onClick={() => void start(member)} disabled={busyId === member.id}>
              {busyId === member.id ? t('msg.starting') : t('msg.start')}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </button>
          </li>
        ))}
      </ul>

      {error && <p className="form-msg err">{error}</p>}
    </div>
  );
}