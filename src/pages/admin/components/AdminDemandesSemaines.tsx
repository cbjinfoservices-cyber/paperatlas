import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { supabase } from '@/lib/supabase';

/** Une semaine et son volume : le lundi qui l'ouvre, et le nombre de demandes. */
type Semaine = { debut: string; n: number };

/**
 * La vue par semaine, sous le compteur : huit barres, une par semaine, et la
 * comparaison du mois en cours avec le précédent. Le compteur dit combien de
 * demandes ont été reçues ; cette vue dit si le rythme monte ou retombe.
 *
 * La fenêtre est fixe, indépendante du filtre de période : elle répond à
 * « est-ce que ça monte ? », pas à « qu'ai-je reçu ce mois-ci ? ».
 */
export default function AdminDemandesSemaines() {
  const { t, lang } = useLang();
  const [semaines, setSemaines] = useState<Semaine[]>([]);
  const [mois, setMois] = useState(0);
  const [precedent, setPrecedent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke('admin-console', {
        body: { action: 'demandes-semaines' },
      });
      const payload = answer as
        | { ok?: boolean; semaines?: Semaine[]; mois?: number; moisPrecedent?: number }
        | null;
      if (failure || !payload?.ok) {
        setError(t('adm.week.error'));
        return;
      }
      setSemaines(payload.semaines ?? []);
      setMois(payload.mois ?? 0);
      setPrecedent(payload.moisPrecedent ?? 0);
    } catch {
      setError(t('adm.week.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  /* La plus haute barre donne l'échelle : chaque semaine se lit par rapport à
     la plus chargée, jamais à un total qui changerait à chaque envoi. */
  const plus = useMemo(
    () => semaines.reduce((haut, semaine) => Math.max(haut, semaine.n), 0),
    [semaines],
  );
  const volume = useMemo(
    () => semaines.reduce((somme, semaine) => somme + semaine.n, 0),
    [semaines],
  );

  const ecart = mois - precedent;
  const pourcentage = precedent > 0 ? Math.round((Math.abs(ecart) / precedent) * 100) : null;

  const format = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : lang === 'en' ? 'en-GB' : 'fr-FR', {
        day: 'numeric',
        month: 'short',
      }),
    [lang],
  );

  const etiquette = (iso: string) => {
    const date = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return iso;
    return format.format(date);
  };

  const etat =
    pourcentage === null
      ? t('adm.week.prevNone')
      : ecart === 0
        ? t('adm.week.flat')
        : t(ecart > 0 ? 'adm.week.up' : 'adm.week.down').replace('{p}', String(pourcentage));

  return (
    <div className="admin-weeks">
      <div className="admin-weeks-head">
        <h3 className="admin-demandes-recent">{t('adm.week.title')}</h3>
        <span className="admin-demandes-recent-note">{t('adm.week.note')}</span>
      </div>

      {loading ? (
        <p className="admin-loading">
          <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
          {t('adm.week.loading')}
        </p>
      ) : error ? (
        <div className="admin-weeks-error">
          <span>{error}</span>
          <button type="button" className="admin-btn" onClick={() => void load()}>
            <i className="ri-refresh-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('adm.retry')}</span>
          </button>
        </div>
      ) : volume === 0 ? (
        <p className="admin-empty">
          <i className="ri-bar-chart-2-line" aria-hidden="true"></i>
          {t('adm.week.none')}
        </p>
      ) : (
        <>
          <div className="admin-weeks-bars">
            {semaines.map((semaine) => {
              const part = plus > 0 ? Math.round((semaine.n / plus) * 100) : 0;
              return (
                <div
                  key={semaine.debut}
                  className="admin-week"
                  data-zero={semaine.n === 0 ? 'yes' : 'no'}
                  title={t('adm.week.week').replace('{date}', etiquette(semaine.debut))}
                  aria-label={`${t('adm.week.week').replace('{date}', etiquette(semaine.debut))} · ${semaine.n}`}
                >
                  <span className="admin-week-n">{semaine.n}</span>
                  <span className="admin-week-track">
                    <span className="admin-week-fill" style={{ height: `${part}%` }}></span>
                  </span>
                  <span className="admin-week-lab">{etiquette(semaine.debut)}</span>
                </div>
              );
            })}
          </div>

          <p
            className="admin-weeks-delta"
            data-tone={ecart > 0 ? 'up' : ecart < 0 ? 'down' : 'flat'}
          >
            <i
              className={
                ecart > 0
                  ? 'ri-arrow-right-up-line'
                  : ecart < 0
                    ? 'ri-arrow-right-down-line'
                    : 'ri-subtract-line'
              }
              aria-hidden="true"
            ></i>
            <span>{t('adm.week.month').replace('{a}', String(mois)).replace('{b}', String(precedent))}</span>
            <b>{etat}</b>
          </p>
        </>
      )}
    </div>
  );
}