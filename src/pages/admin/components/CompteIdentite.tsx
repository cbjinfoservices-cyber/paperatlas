import { useEffect, useRef } from 'react';
import { useLang } from '@/i18n/LangProvider';
import {
  estAdminCompte,
  jour,
  promotionARelire,
  type AdminCompte,
} from './adminTypes';

type Props = {
  compte: AdminCompte | null;
  /** Vrai quand la fiche a été ouverte depuis la pastille « À relire » : le
   *  bloc se place alors de lui-même dans la vue, sur sa ligne de rôle, pour
   *  que la promotion se relise sans chercher. */
  focusRole?: boolean;
};

/**
 * L'identité d'un compte, et son rôle. Le bloc porte la date de promotion et
 * la pastille « À relire » lue sur la même règle que la table des clients :
 * l'ancienneté d'un rôle se lit ici comme là-bas, sans deux vérités.
 *
 * Il se tient à part de la fiche pour rester court et lisible — et parce que
 * c'est ce bloc que la pastille « À relire » vient ouvrir.
 */
export default function CompteIdentite({ compte, focusRole = false }: Props) {
  const { t, lang } = useLang();
  const ref = useRef<HTMLElement | null>(null);
  const admin = estAdminCompte(compte?.email, compte?.role);
  const ancienne = promotionARelire(compte);

  /* La fiche s'ouvre sur sa ligne de rôle : le bloc se place en haut de la
     zone de lecture, sans que le lecteur ait à le chercher plus bas. */
  useEffect(() => {
    if (!focusRole || !compte) return;
    const node = ref.current;
    if (!node) return;
    node.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [focusRole, compte]);

  return (
    <section
      className="admin-sheet-block"
      ref={ref}
      data-focus={focusRole && admin ? 'yes' : 'no'}
      aria-label={t('ad.f.identity')}
    >
      <p className="admin-stamp">{t('ad.f.identity')}</p>
      <dl className="admin-defs">
        <div className="admin-def">
          <dt>{t('ad.f.mail')}</dt>
          <dd>{compte?.email || '—'}</dd>
        </div>
        <div className="admin-def">
          <dt>{t('ad.clients.offre')}</dt>
          <dd>{compte?.formule || '—'}</dd>
        </div>
        {/* Le rôle, à côté de l'offre : la pastille suit la même règle que la
            liste des clients, et la date de promotion la suit. */}
        <div className="admin-def" id="compte-role">
          <dt>{t('ad.f.role')}</dt>
          <dd>
            <span className="admin-badge" data-tone={admin ? 'accent' : 'soft'}>
              <i
                className={admin ? 'ri-shield-user-line' : 'ri-user-line'}
                aria-hidden="true"
              ></i>
              {admin ? t('ad.f.roleAdmin') : t('ad.f.roleOther')}
            </span>
            {ancienne && (
              <span
                className="admin-badge admin-admin-mark"
                data-tone="warn"
                title={t('ad.clients.adminStaleHint')
                  .replace('{n}', String(ancienne.mois))
                  .replace('{date}', jour(compte?.role_changed_at, lang))}
              >
                <i className="ri-time-line" aria-hidden="true"></i>
                {t('ad.clients.adminStaleMark')}
              </span>
            )}
          </dd>
        </div>
        {admin && (
          <div className="admin-def">
            <dt>{t('ad.xls.promotedOn')}</dt>
            <dd>
              {compte?.role_changed_at
                ? jour(compte.role_changed_at, lang)
                : t('ad.p.roles.promotedNoDate')}
            </dd>
          </div>
        )}
        <div className="admin-def">
          <dt>{t('ad.f.phone')}</dt>
          <dd>{compte?.telephone || '—'}</dd>
        </div>
        <div className="admin-def">
          <dt>{t('ad.clients.metier')}</dt>
          <dd>{compte?.metier || '—'}</dd>
        </div>
        <div className="admin-def">
          <dt>{t('ad.clients.ville')}</dt>
          <dd>{[compte?.wilaya, compte?.pays].filter(Boolean).join(' · ') || '—'}</dd>
        </div>
        <div className="admin-def">
          <dt>{t('ad.clients.depuis')}</dt>
          <dd>{jour(compte?.created_at, lang)}</dd>
        </div>
      </dl>
    </section>
  );
}