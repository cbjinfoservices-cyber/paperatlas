import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { nomPays } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { supabase } from '@/lib/supabase';
import './components/premium-directory.css';

type BusinessProfile = {
  id: string;
  nom: string;
  metier: string;
  pays: string;
  wilaya: string;
  commune: string | null;
  description: string | null;
  telephone_public: string | null;
  email_public: string | null;
  site_web: string | null;
  mise_en_avant_jusqu_a: string | null;
  publie: boolean;
};

function safeWebsite(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

export default function BusinessProfilePage() {
  const { id = '' } = useParams();
  const { t, lang } = useLang();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setFailed(false);
      const { data, error } = await supabase
        .from('paperatlas_entreprises')
        .select('id,nom,metier,pays,wilaya,commune,description,telephone_public,email_public,site_web,mise_en_avant_jusqu_a,publie')
        .eq('id', id)
        .maybeSingle();
      if (!alive) return;
      if (error) {
        console.error('public-business-profile-load-failed', error.message);
        setFailed(true);
      } else {
        setProfile(data as BusinessProfile | null);
      }
      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [id]);

  useSeo({
    page: 'entreprise',
    path: `/annuaire/entreprise/${id}`,
    title: profile ? `${profile.nom} — PaperAtlas` : undefined,
    description: profile?.description?.slice(0, 158),
  });

  const featured = Boolean(
    profile?.mise_en_avant_jusqu_a
    && new Date(profile.mise_en_avant_jusqu_a).getTime() > Date.now(),
  );
  const website = safeWebsite(profile?.site_web ?? null);
  const phoneLink = profile?.telephone_public?.replace(/[^\d+*#;]/g, '') ?? '';
  const emailLink = profile?.email_public ? `mailto:${encodeURIComponent(profile.email_public)}` : '';

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-body">
          {loading ? (
            <p className="acct-loading">{t('acct.loading')}</p>
          ) : failed ? (
            <p className="form-msg err">{t('dir.listing.profileError')}</p>
          ) : !profile || !profile.publie ? (
            <div className="pro-wrap pro-missing">
              <h1>{t('dir.listing.profileMissing')}</h1>
              <Link to="/annuaire" className="cta">{t('dir.listing.back')}</Link>
            </div>
          ) : (
            <article className="business-public-profile pro-wrap">
              <Link to="/annuaire" className="ghost-link">{t('dir.listing.back')}</Link>
              <p className="stamp">{t(`opt.${profile.metier}`)}</p>
              <h1 className="page-h1">{profile.nom}</h1>
              <p className="business-public-place">
                <i className="ri-map-pin-line" aria-hidden="true"></i>
                {[profile.commune, nomRegion(profile.wilaya, lang), nomPays(profile.pays, lang)].filter(Boolean).join(' · ')}
              </p>
              {featured && <p className="business-public-featured"><i className="ri-star-fill" aria-hidden="true"></i>{t('dir.listing.featured')}</p>}
              {profile.description && <p className="business-public-description">{profile.description}</p>}
              <div className="business-public-contacts">
                {profile.telephone_public && phoneLink && <a className="ghost-btn" href={`tel:${phoneLink}`}>{t('dir.listing.phone')}: {profile.telephone_public}</a>}
                {profile.email_public && emailLink && <a className="ghost-btn" href={emailLink}>{t('dir.listing.email')}: {profile.email_public}</a>}
                {website && <a className="cta" href={website} target="_blank" rel="noopener noreferrer">{t('dir.listing.website')} <i className="ri-external-link-line" aria-hidden="true"></i></a>}
              </div>
            </article>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
