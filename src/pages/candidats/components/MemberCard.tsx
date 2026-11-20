import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { isWithinDays, relativeSince } from '@/lib/freshness';
import { dayStamp } from '@/lib/dates';
import { nomRegion } from '@/lib/regionLabels';
import PaysBadge from '@/components/feature/PaysBadge';
import AireFicheCount from '@/components/feature/AireFicheCount';
import CopyTextButton from '@/components/feature/CopyTextButton';
import { markAireCarteCopied, markAireFicheCopied } from '@/lib/aireCarteMemory';
import { paysDeAireTexte } from '@/lib/airePaysTexte';
import {
  AIRE_CARTE_PARAM, AIRES_MONDE_PARAM, fichesDesPays, regionMondeDe, regionMondeLabelKey,
} from '@/lib/worldRegions';
import { formatDistance } from '@/hooks/useGeo';
import { formatDuration } from '@/lib/trip';
import type { MemberCardRow } from '@/lib/messaging';

/** The view you came from travels with the card, so the profile can hand it back.
    La région et le pays voyagent aussi : la fiche peut rendre le vivier au pays
    entier sans rendre le lieu d'où l'on vient. */
const CARRIED = ['metier', 'sort', 'fresh', 'rayon', 'lettre', 'pays', 'wilaya'] as const;

const localeOf = (lang: string) => (lang === 'ar' ? 'ar-DZ' : lang === 'en' ? 'en-GB' : 'fr-FR');

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

/** One candidate on the public list: a whole clickable card, like the directory. */
export default function MemberCard({ item, index, active = false, trip = null, boardRows = 0, lostRows = 0, lostBy }: {
  item: MemberCardRow;
  index: number;
  active?: boolean;
  /** Le trajet depuis la position du visiteur : la carte dit alors la distance
      jusqu'au centre de la région et la durée estimée. */
  trip?: { km: number; minutes: number } | null;
  /** Combien de profils le vivier tient : la fiche l'emporte, pour que le
      texte copié annonce l'étendue de la liste avant qu'on l'ouvre. */
  boardRows?: number;
  /** Combien de profils du vivier ont une porte vide : la fiche le redit. */
  lostRows?: number;
  /** Sur quelles portes ce compte s'appuie : la fiche le redit au survol. */
  lostBy?: { region: number; trade: number };
}) {
  const { t, lang } = useLang();
  const { search } = useLocation();
  const carried = new URLSearchParams(search);
  const keep = new URLSearchParams();
  CARRIED.forEach((key) => {
    const value = carried.get(key);
    if (value) keep.set(key, value);
  });
  /* L'étendue du vivier part avec la fiche : le texte copié pourra dire
     combien de profils la liste tient. */
  if (boardRows > 0) keep.set('n', String(boardRows));
  if (lostRows > 0) keep.set('l', String(lostRows));
  /* Le compte des portes vides part avec sa répartition : la fiche nomme la
     région et le métier, au lieu de donner un chiffre seul. */
  if (lostBy && lostBy.region > 0) keep.set('lr', String(lostBy.region));
  if (lostBy && lostBy.trade > 0) keep.set('lt', String(lostBy.trade));
  const kept = keep.toString();
  const to = `/candidats/${item.id}${kept ? `?${kept}` : ''}`;
  const headline = (item.titre || '').trim();
  const bio = (item.bio || '').trim();
  /* Registered less than a month ago: flagged, so a fresh profile is not lost
     in the middle of the pile. */
  const fresh = Boolean(item.created_at) && isWithinDays(String(item.created_at));
  const locale = localeOf(lang);
  /* « inscrit il y a 3 semaines »: the span, not the date, so the pile can be
     read as a timeline without doing the arithmetic on every card. */
  const since = item.created_at ? relativeSince(String(item.created_at), locale) : '';
  const exact = item.created_at ? dayStamp(String(item.created_at), locale) : '';
  /* L’aire où se tient la personne : son compte, posé dans le pied de la carte,
     rouvre la note des aires resserrée sur elle — sans passer par la fiche. */
  const aire = regionMondeDe(item.pays);
  const aireNom = aire ? t(regionMondeLabelKey(aire)) : '';
  /* Les pays de l’aire, nommés un à un au survol du geste, comme sur les
     cartes d’atelier et de plume : le message se mesure avant d’être collé. */
  const airePays = aire
    ? paysDeAireTexte(aire, lang, t, t('cmaps.airesChipFiles'))
    : '';
  const aireNote = aire
    ? `/annuaire?view=map&${AIRES_MONDE_PARAM}=${aire.key}&${AIRE_CARTE_PARAM}=${aire.key}#cmaps`
    : '';

  return (
    <Link to={to} className={`biz-card cand-card${active ? ' is-keyed' : ''}`} style={{ ['--i' as string]: index % 3 }}>
      <div className="biz-body">
        <div className="biz-top">
          <span className="logo-mark cand-mark" aria-hidden="true">{initials(item.nom || '')}</span>
          <div className="cand-ident">
            <div className="cand-name-row">
              <h3 className="cand-name">{item.nom}</h3>
              {fresh && <span className="cand-new">{t('last.new')}</span>}
            </div>
            {headline && <p className="cand-role">{headline}</p>}
            {(item.wilaya || item.pays) && (
              <p className="biz-place">
                <i className="ri-map-pin-line" aria-hidden="true"></i>
                {item.wilaya && <span>{nomRegion(item.wilaya, lang)}</span>}
                <PaysBadge code={item.pays} />
              </p>
            )}
            {trip && (
              <p className="job-trip" title={t('jobd.driveHint')}>
                <i className="ri-navigation-line" aria-hidden="true"></i>
                <b>{formatDistance(trip.km, lang)}</b>
                <span aria-hidden="true">·</span>
                <b>{formatDuration(trip.minutes)}</b>
                <span>{t('jobd.driveTime')}</span>
              </p>
            )}
            {since && (
              <p className="cand-since" title={exact || undefined}>
                <i className="ri-time-line" aria-hidden="true"></i>
                {t('candlist.joinedAgo')} {since}
              </p>
            )}
          </div>
        </div>

        {(item.metier || item.organisme) && (
          <ul className="biz-serv">
            {item.metier && <li>{item.metier}</li>}
            {item.organisme && <li>{item.organisme}</li>}
          </ul>
        )}

        <p className="cand-bio">{bio || t('candlist.noBio')}</p>

        <div className="biz-foot">
          <span className="biz-rate">
            <i className="ri-user-smile-line" aria-hidden="true"></i>
            {t(item.role === 'candidat' ? 'candlist.role' : 'acct.role.pro')}
          </span>
          {/* Le geste court de l’aire, le même que sur les cartes d’atelier et
              de plume : deux lignes, le nom de l’aire où se tient le profil et
              ses fiches. Le clic n’ouvre pas la fiche — la carte reste un
              lien, le geste s’arrête à la copie. */}
          {aire && (
            <span
              className="biz-aire cand-aire"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <CopyTextButton
                label={t('cmaps.atelierAireCopy')}
                hint={`${t('candlist.aireCopyHint')
                  .replace('{nom}', item.nom)
                  .replace('{region}', aireNom)}${airePays ? ` · ${airePays}` : ''}`}
                className="cand-aire-copy"
                onCopied={() => {
                  markAireFicheCopied(aire.key);
                  /* Le geste part d’une carte, non d’une fiche : la rangée d’un
                     pays tient ce compte à part, à côté des copies courtes. */
                  markAireCarteCopied(aire.key, item.pays ?? undefined);
                }}
                build={() => [
                  t('candlist.aireCopyLine').replace('{nom}', item.nom),
                  t('cmaps.aireCopyRow')
                    .replace('{region}', aireNom)
                    .replace('{files}', String(fichesDesPays(aire.pays)))
                    .replace('{unit}', t('cmaps.airesChipFiles')),
                ].join('\n')}
              />
              {/* Le compte des aires partis d’une carte, posé dans le pied : le
                  même chiffre que sur la fiche, et sa porte vers la note des
                  aires — l’aire se rouvre aussi depuis le vivier. */}
              <AireFicheCount aire={aire.key} regionNom={aireNom} noteTo={aireNote} />
            </span>
          )}
          <span className="biz-link">
            {t('candlist.see')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </span>
        </div>
      </div>
    </Link>
  );
}