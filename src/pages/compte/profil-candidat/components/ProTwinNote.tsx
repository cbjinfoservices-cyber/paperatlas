import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { supabase } from '@/lib/supabase';

/** Accents, case and double spaces must not hide the same surname. */
const fold = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

type Twin = { organisme: string; wilaya: string };

type Props = {
  /** The candidate's own name, as stored on this account. */
  nom: string;
  /** Wilaya, when known: a second guard against a same-name stranger. */
  wilaya: string;
};

/**
 * The same person can hold a business account and a candidate profile — one to
 * publish listings, one to look for work. This note says so plainly, so nobody
 * wonders why their print shop's listings are missing from this page.
 *
 * The match is made on the public member board (names are already public there),
 * on the full name, and on the wilaya when both sides declare one.
 */
export default function ProTwinNote({ nom, wilaya }: Props) {
  const { t } = useLang();
  const [twin, setTwin] = useState<Twin | null>(null);

  useEffect(() => {
    const needle = fold(nom ?? '');
    if (needle.length < 3) {
      setTwin(null);
      return undefined;
    }

    let alive = true;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('paperatlas_membres')
          .select('id, nom, organisme, wilaya')
          .eq('role', 'pro')
          .ilike('nom', String(nom).trim())
          .limit(5);
        if (error || !alive) return;

        const mine = fold(wilaya ?? '');
        const found = (data ?? []).find((row) => {
          const theirs = fold(String((row as { wilaya?: string | null }).wilaya ?? ''));
          return !mine || !theirs || theirs === mine;
        }) as { organisme?: string | null; wilaya?: string | null } | undefined;

        if (!alive) return;
        setTwin(
          found
            ? { organisme: (found.organisme ?? '').trim(), wilaya: (found.wilaya ?? '').trim() }
            : null,
        );
      } catch {
        /* A courtesy note: never a blocker, never an error message. */
      }
    };

    void load();
    return () => {
      alive = false;
    };
  }, [nom, wilaya]);

  if (!twin) return null;

  return (
    <section className="pro-card cprof-twin">
      <h2 className="pro-h">
        <i className="ri-store-2-line" aria-hidden="true"></i>
        {t('twin.title')}
      </h2>
      <p className="auth-note">
        {twin.organisme && <strong>{twin.organisme}</strong>}
        {twin.organisme ? ' · ' : ''}
        {t('twin.text')}
      </p>
      <Link to="/compte" className="ghost-link">
        {t('twin.cta')}
        <i className="ri-arrow-right-line" aria-hidden="true"></i>
      </Link>
    </section>
  );
}