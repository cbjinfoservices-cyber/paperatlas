import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import PaysBadge from '@/components/feature/PaysBadge';
import { nomRegion } from '@/lib/regionLabels';
import { supabase } from '@/lib/supabase';
import './premium-directory.css';

type DirectoryCompany = {
  id: string;
  nom: string;
  metier: string;
  pays: string;
  wilaya: string;
  commune: string | null;
  description: string | null;
  mise_en_avant_jusqu_a: string | null;
  created_at: string;
};

type Props = {
  country?: string;
  region?: string;
  trade?: string;
  query?: string;
  onCountChange?: (count: number) => void;
};

const TRADE_TO_PROFILE: Record<string, string> = {
  impression: 'imprimerie',
  edition: 'edition',
  librairie: 'librairie',
  faconnage: 'faconnage',
  communication: 'agence',
  fournisseurs: 'fournisseur',
};

function normalized(value: string) {
  return value.trim().toLocaleLowerCase();
}

export default function PremiumDirectory({
  country = '',
  region = '',
  trade = '',
  query = '',
  onCountChange,
}: Props) {
  const { t, lang } = useLang();
  const [rows, setRows] = useState<DirectoryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setFailed(false);
      const { data, error } = await supabase
        .from('paperatlas_entreprises')
        .select('id,nom,metier,pays,wilaya,commune,description,mise_en_avant_jusqu_a,created_at')
        .eq('publie', true)
        .order('mise_en_avant_jusqu_a', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (!alive) return;
      if (error) {
        console.error('public-business-list-load-failed', error.message);
        setFailed(true);
      } else {
        setRows((data ?? []) as DirectoryCompany[]);
      }
      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = normalized(query);
    const wantedTrade = TRADE_TO_PROFILE[trade] ?? '';
    return rows
      .filter((row) =>
        (!country || row.pays === country)
        && (!region || normalized(row.wilaya) === normalized(region))
        && (!wantedTrade || row.metier === wantedTrade)
        && (!needle || normalized(`${row.nom} ${row.metier} ${row.commune ?? ''} ${row.wilaya} ${row.description ?? ''}`).includes(needle)),
      )
      .sort((a, b) => {
        const aFeatured = Boolean(a.mise_en_avant_jusqu_a && new Date(a.mise_en_avant_jusqu_a).getTime() > Date.now());
        const bFeatured = Boolean(b.mise_en_avant_jusqu_a && new Date(b.mise_en_avant_jusqu_a).getTime() > Date.now());
        return Number(bFeatured) - Number(aFeatured)
          || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [country, region, rows, trade, query]);

  useEffect(() => {
    onCountChange?.(filtered.length);
  }, [filtered.length, onCountChange]);

  if (loading) {
    return <p className="auth-note premium-directory-status">{t('dir.listing.directoryLoading')}</p>;
  }
  if (failed) {
    return <p className="form-msg err premium-directory-status">{t('dir.listing.directoryError')}</p>;
  }
  if (filtered.length === 0) return null;

  return (
    <section className="premium-directory" aria-labelledby="premium-directory-title">
      <div className="premium-directory-heading">
        <div>
          <p className="stamp">{t('dir.listing.directoryStamp')}</p>
          <h2 id="premium-directory-title">{t('dir.listing.directoryTitle')}</h2>
        </div>
        <span className="premium-directory-count">{filtered.length}</span>
      </div>
      <div className="premium-directory-grid">
        {filtered.map((row) => {
          const featured = Boolean(
            row.mise_en_avant_jusqu_a
            && new Date(row.mise_en_avant_jusqu_a).getTime() > Date.now(),
          );
          return (
            <Link
              className={`premium-directory-card${featured ? ' is-featured' : ''}`}
              to={`/annuaire/entreprise/${row.id}`}
              key={row.id}
            >
              <span className="premium-directory-card-top">
                <span className="premium-directory-trade">{t(`opt.${row.metier}`)}</span>
                {featured && <span className="premium-directory-featured"><i className="ri-star-fill" aria-hidden="true"></i>{t('dir.listing.featured')}</span>}
              </span>
              <strong>{row.nom}</strong>
              <span className="premium-directory-place">
                {row.commune ? `${row.commune} · ` : ''}{nomRegion(row.wilaya, lang)}
                <PaysBadge code={row.pays} />
              </span>
              {row.description && <span className="premium-directory-description">{row.description}</span>}
              <span className="premium-directory-open">
                {t('dir.listing.openProfile')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
