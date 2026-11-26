import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useLang } from '@/i18n/LangProvider';
import { motDivision } from '@/lib/division';
import { regionsWith } from '@/lib/regions';
import { supabase } from '@/lib/supabase';
import PaysSelect from '@/components/feature/PaysSelect';

type BusinessListing = {
  id: string;
  user_id: string;
  nom: string;
  metier: string;
  pays: string;
  wilaya: string;
  commune: string | null;
  description: string | null;
  telephone_public: string | null;
  email_public: string | null;
  site_web: string | null;
  latitude: number | null;
  longitude: number | null;
  publie: boolean;
};

type Props = { onSaved?: () => void };

/* Les coordonnées restent en texte le temps de la saisie ; vides, la fiche suit sa wilaya. */
type Fields = Omit<BusinessListing, 'id' | 'user_id' | 'latitude' | 'longitude'> & {
  latitude: string;
  longitude: string;
};

const EMPTY_FIELDS: Fields = {
  nom: '',
  metier: '',
  pays: 'DZ',
  wilaya: '',
  commune: '',
  description: '',
  telephone_public: '',
  email_public: '',
  site_web: '',
  latitude: '',
  longitude: '',
  publie: false,
};

function parseCoordinate(value: string, limit: number): number | null | undefined {
  const text = value.trim();
  if (!text) return null;
  const number = Number(text.replace(',', '.'));
  if (!Number.isFinite(number) || Math.abs(number) > limit) return undefined;
  return number;
}

export default function BusinessListingManager({ onSaved }: Props) {
  const { t, lang } = useLang();
  const { user, compte } = useAuth();
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [listingId, setListingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError('');
      const { data, error: loadError } = await supabase
        .from('paperatlas_entreprises')
        .select('id,user_id,nom,metier,pays,wilaya,commune,description,telephone_public,email_public,site_web,latitude,longitude,publie')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!alive) return;
      if (loadError) {
        console.error('business-listing-load-failed', loadError.message);
        setError(t('dir.listing.error'));
      } else if (data) {
        setListingId(data.id);
        setFields({
          nom: data.nom,
          metier: data.metier,
          pays: data.pays,
          wilaya: data.wilaya,
          commune: data.commune ?? '',
          description: data.description ?? '',
          telephone_public: data.telephone_public ?? '',
          email_public: data.email_public ?? '',
          site_web: data.site_web ?? '',
          latitude: data.latitude == null ? '' : String(data.latitude),
          longitude: data.longitude == null ? '' : String(data.longitude),
          publie: data.publie,
        });
      } else {
        setListingId(null);
        setFields({
          ...EMPTY_FIELDS,
          nom: compte?.organisme || compte?.nom || '',
          metier: compte?.metier || '',
          pays: compte?.pays || 'DZ',
          wilaya: compte?.wilaya || '',
          telephone_public: compte?.telephone || '',
        });
      }
      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [user?.id, compte?.organisme, compte?.nom, compte?.metier, compte?.pays, compte?.wilaya, compte?.telephone, t]);

  const update = (key: keyof Fields, value: string | boolean) => {
    setSaved(false);
    setFields((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) return;
    if (!fields.nom.trim() || !fields.metier || !fields.wilaya.trim()) {
      setError(t('dir.listing.required'));
      return;
    }
    const latitude = parseCoordinate(fields.latitude, 90);
    const longitude = parseCoordinate(fields.longitude, 180);
    if (latitude === undefined || longitude === undefined || (latitude === null) !== (longitude === null)) {
      setError(t('dir.listing.coordsInvalid'));
      return;
    }

    setSaving(true);
    setSaved(false);
    setError('');
    const values = {
      nom: fields.nom.trim(),
      metier: fields.metier,
      pays: fields.pays,
      wilaya: fields.wilaya.trim(),
      commune: fields.commune?.trim() || null,
      description: fields.description?.trim() || null,
      telephone_public: fields.telephone_public?.trim() || null,
      email_public: fields.email_public?.trim() || null,
      site_web: fields.site_web?.trim() || null,
      latitude,
      longitude,
      publie: fields.publie,
      updated_at: new Date().toISOString(),
    };
    const result = listingId
      ? await supabase.from('paperatlas_entreprises').update(values).eq('id', listingId).eq('user_id', user.id).select('id').single()
      : await supabase.from('paperatlas_entreprises').insert({ ...values, user_id: user.id }).select('id').single();
    setSaving(false);
    if (result.error) {
      console.error('business-listing-save-failed', result.error.message);
      setError(t('dir.listing.error'));
      return;
    }
    setListingId(result.data.id);
    setSaved(true);
    onSaved?.();
  };

  if (loading) {
    return (
      <section className="pro-card">
        <h2 className="pro-h">{t('dir.listing.title')}</h2>
        <p className="acct-loading">{t('acct.loading')}</p>
      </section>
    );
  }

  return (
    <section className="pro-card" id="fiche-entreprise">
      <h2 className="pro-h">{t('dir.listing.title')}</h2>
      <p className="auth-note">{t('dir.listing.intro')}</p>
      <form className="business-listing-form" onSubmit={submit}>
        <div className="form-grid">
          <div className="fld">
            <label htmlFor="business-name">{t('dir.listing.name')}</label>
            <input id="business-name" value={fields.nom} maxLength={120} required onChange={(event) => update('nom', event.target.value)} />
          </div>
          <div className="fld">
            <label htmlFor="business-trade">{t('dir.listing.trade')}</label>
            <select id="business-trade" value={fields.metier} required onChange={(event) => update('metier', event.target.value)}>
              <option value="">{t('acct.metierAny')}</option>
              {['imprimerie', 'edition', 'librairie', 'faconnage', 'agence', 'fournisseur'].map((trade) => (
                <option key={trade} value={trade}>{t(`opt.${trade}`)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-grid">
          <PaysSelect id="business-country" value={fields.pays} onChange={(country) => update('pays', country)} />
          <div className="fld">
            <label htmlFor="business-region">{motDivision(fields.pays, lang)}</label>
            <select id="business-region" value={fields.wilaya} required onChange={(event) => update('wilaya', event.target.value)}>
              <option value="">{motDivision(fields.pays, lang, 'tous')}</option>
              {regionsWith(fields.pays, fields.wilaya).map((region) => <option key={region} value={region}>{region}</option>)}
            </select>
          </div>
          <div className="fld">
            <label htmlFor="business-city">{t('dir.listing.city')}</label>
            <input id="business-city" value={fields.commune ?? ''} maxLength={100} onChange={(event) => update('commune', event.target.value)} />
          </div>
        </div>
        <div className="form-grid">
          <div className="fld">
            <label htmlFor="business-latitude">{t('dir.listing.latitude')}</label>
            <input id="business-latitude" inputMode="decimal" value={fields.latitude} maxLength={12} onChange={(event) => update('latitude', event.target.value)} />
          </div>
          <div className="fld">
            <label htmlFor="business-longitude">{t('dir.listing.longitude')}</label>
            <input id="business-longitude" inputMode="decimal" value={fields.longitude} maxLength={12} onChange={(event) => update('longitude', event.target.value)} />
          </div>
          <p className="auth-note">{t('dir.listing.coordsHint')}</p>
        </div>
        <div className="fld">
          <label htmlFor="business-description">{t('dir.listing.description')}</label>
          <textarea id="business-description" value={fields.description ?? ''} maxLength={1200} rows={4} onChange={(event) => update('description', event.target.value)} />
        </div>
        <div className="form-grid">
          <div className="fld">
            <label htmlFor="business-phone">{t('dir.listing.phone')}</label>
            <input id="business-phone" type="tel" value={fields.telephone_public ?? ''} maxLength={40} onChange={(event) => update('telephone_public', event.target.value)} />
          </div>
          <div className="fld">
            <label htmlFor="business-email">{t('dir.listing.email')}</label>
            <input id="business-email" type="email" value={fields.email_public ?? ''} maxLength={254} onChange={(event) => update('email_public', event.target.value)} />
          </div>
          <div className="fld">
            <label htmlFor="business-website">{t('dir.listing.website')}</label>
            <input id="business-website" type="url" value={fields.site_web ?? ''} maxLength={300} onChange={(event) => update('site_web', event.target.value)} />
          </div>
        </div>
        <label className="auth-check" htmlFor="business-publish">
          <input id="business-publish" type="checkbox" checked={fields.publie} onChange={(event) => update('publie', event.target.checked)} />
          <span>{t('dir.listing.publish')}</span>
        </label>
        <div className="acct-actions">
          <button type="submit" className="cta" disabled={saving}>
            {saving ? t('acct.saving') : t('dir.listing.save')}
          </button>
          {saved && <span className="form-msg ok">{t('dir.listing.saved')}</span>}
          {error && <span className="form-msg err">{error}</span>}
        </div>
      </form>
    </section>
  );
}
