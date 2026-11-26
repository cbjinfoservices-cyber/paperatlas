import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localize, localeFor } from '@/i18n/localize';
import { dayStamp } from '@/lib/dates';
import { isWithinDays, relativeSince } from '@/lib/freshness';
import { paysDe, nomPays } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import PaysBadge from '@/components/feature/PaysBadge';
import CopyTextButton from '@/components/feature/CopyTextButton';
import AireFicheCount from '@/components/feature/AireFicheCount';
import { markAireCarteCopied, markAireFicheCopied } from '@/lib/aireCarteMemory';
import { AIRE_CARTE_PARAM, AIRES_MONDE_PARAM, fichesDesPays, regionMondeDe, regionMondeLabelKey } from '@/lib/worldRegions';
import { paysDeAireTexte } from '@/lib/airePaysTexte';
import { useShortlist } from '@/hooks/useShortlist';
import { formatDistance } from '@/hooks/useGeo';
import { isNewcomer } from '@/lib/newcomers';
import { decadeLabel, decadeOf } from '@/lib/generation';
import { formuleDe, type Entreprise } from '@/mocks/entreprises';
import { specialitesDe } from '@/lib/specialites';
import { useWriteToWorkshop } from '@/hooks/useWriteToWorkshop';
import BizPhoto from './BizPhoto';
import { nomDemo } from '@/lib/nomsDemo';
import { nomCommune } from '@/lib/communeLabels';
import './biz-card.css';

type Props = {
  item: Entreprise;
  index: number;
  distanceKm?: number;
  decades?: number[];
  /** La précision retenue dans le menu, mise en avant quand elle est lue. */
  focusSpec?: string;
  /** Le métier sur lequel l'annuaire est filtré : la fiche le reçoit, et le
      rappelle à côté de son en-tête, avec la porte qui rouvre ce même type. */
  boardTrade?: string;
  /** La région lue dans l'annuaire : la fiche la rappelle à son tour, et sa
      porte rouvre la liste resserrée sur ce même lieu. */
  boardRegion?: string;
  /** Le pays de cette région : une même région peut exister sous deux pays,
      et la porte doit revenir au bon. */
  boardPays?: string;
};

export default function BizCard({
  item, index, distanceKm, decades = [], focusSpec, boardTrade = '', boardRegion = '', boardPays = '',
}: Props) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { has, toggle } = useShortlist('entreprises');
  const selected = has(item.id);
  /* Le même geste que sur la fiche : on écrit à l'atelier sans la quitter,
     et le fil s'ouvre dans la messagerie, déjà prêt. */
  const { writeState, writeToWorkshop } = useWriteToWorkshop();
  const fresh = isNewcomer(item.id);
  /* Seven days is the other rhythm: a card registered this week says so, one
     between eight and thirty days keeps the softer « Nouveau ». */
  const weekNew = isWithinDays(item.joined, 7);
  const locale = localeFor(lang);
  /* Same coarse span as the candidate cards, so the two pools can be read the
     same way — « inscrit il y a 3 semaines » rather than a bare month. */
  const joinedAgo = relativeSince(item.joined, locale);
  const joinedExact = dayStamp(item.joined, locale);
  /* The generation of the workshop, read on the card like on a pen's card: the
     decade it opened in, so two profiles can be compared without opening them. */
  const generation = decadeLabel(decadeOf(item.since));
  /* When the list is read on two generations, the card says which of the two
     it belongs to — 1/2 or 2/2 — so a sheet of the other decade is signalled
     before the block itself is reached. */
  const genIndex = decades.indexOf(decadeOf(item.since));
  const genOrdinal = decades.length > 1 && genIndex >= 0 ? `${genIndex + 1}/${decades.length}` : '';
  const genTitle = `${t('dir.openLabel')} · ${generation}${genOrdinal ? ` · ${t('gen.pairCounter')} ${genOrdinal}` : ''}`;
  /* A structure on the Institutions plan carries its establishments on the
     card itself: the list can tell an organisation from a single workshop
     without opening the profile. */
  const etabs = formuleDe(item) === 'institutions' ? item.etablissements ?? 0 : 0;
  /* La précision que la fiche déclare, lue à côté de son type : celle du
     filtre quand il y en a un, sinon la première qu'elle annonce. */
  const specs = specialitesDe(item);
  const shownSpec = focusSpec && specs.includes(focusSpec) ? focusSpec : specs[0] ?? '';
  /* Le nom de l'atelier se lit dans la langue de la page : la carte arabe ne
     mélange plus un nom latin au milieu d'une phrase arabe. */
  const nom = nomDemo(item.name, lang);
  /* L'aire où se tient l'atelier : la carte l'annonce en deux lignes, comme la
     fiche — son nom et ses fiches, sans rang ni adresse de vue Carte. */
  const aireAtelier = regionMondeDe(paysDe(item));
  const aireAtelierNom = aireAtelier ? t(regionMondeLabelKey(aireAtelier)) : '';
  /* Les pays de l'aire, nommés un à un au survol du geste, comme sur la fiche :
     le message se mesure avant d'être collé. */
  const aireAtelierPays = aireAtelier
    ? paysDeAireTexte(aireAtelier, lang, t, t('cmaps.airesChipFiles'))
    : '';
  /* La note des aires du monde resserrée sur cette aire : le petit compte du
     pied y mène d'un clic, sans passer par la fiche. */
  const aireNote = aireAtelier
    ? `/annuaire?view=map&${AIRES_MONDE_PARAM}=${aireAtelier.key}&${AIRE_CARTE_PARAM}=${aireAtelier.key}#cmaps`
    : '';
  /* La porte de la fiche garde le métier, la région et le pays lus : la fiche
     saura d'où l'on vient et pourra rendre l'annuaire resserré sur les mêmes
     filtres. */
  const keep = new URLSearchParams();
  if (boardTrade) keep.set('trade', boardTrade);
  if (boardRegion) keep.set('wilaya', boardRegion);
  if (boardPays) keep.set('pays', boardPays);
  const carriedView = keep.toString();
  const to = `/annuaire/entreprise/${item.id}${carriedView ? `?${carriedView}` : ''}`;

  return (
    <Link to={to} className="biz-card" style={{ ['--i' as string]: index % 3 }}>
      <div className="biz-thumb">
        <BizPhoto item={item} alt={`${nom} · ${t(`trade.${item.trade}`)} · ${item.wilaya}`} title={`${nom} · ${t(`trade.${item.trade}`)} ${item.wilaya}`} />

        <span className="biz-tag">{t(`trade.${item.trade}`)}</span>
        {shownSpec && (
          <span className={`biz-spec${focusSpec === shownSpec ? ' is-on' : ''}`}>
            {t(`spec.${shownSpec}`)}
          </span>
        )}
        {weekNew ? (
          <span className="biz-new biz-week">
            <i className="ri-flashlight-line" aria-hidden="true"></i>{t('last.week')}
          </span>
        ) : (
          fresh && <span className="biz-new">{t('last.new')}</span>
        )}
        {item.featured && <span className="biz-featured"><i className="ri-star-fill" aria-hidden="true"></i>{t('dir.featured')}</span>}
        {typeof distanceKm === 'number' && (
          <span className="biz-near">
            <i className="ri-navigation-line" aria-hidden="true"></i>{formatDistance(distanceKm, lang)}
          </span>
        )}
        <button
          type="button"
          className={`biz-cmp${selected ? ' is-on' : ''}`}
          aria-pressed={selected}
          title={selected ? t('cmp.added') : t('cmp.add')}
          aria-label={`${selected ? t('cmp.added') : t('cmp.add')} — ${nom}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(item.id);
          }}
        >
          <i className={selected ? 'ri-bookmark-fill' : 'ri-bookmark-line'} aria-hidden="true"></i>
          <span>{selected ? t('cmp.added') : t('cmp.add')}</span>
        </button>
      </div>
      <div className="biz-body">
        <div className="biz-top">
          <span className="logo-mark">{item.logoMark}</span>
          <div>
            <h3>{nom}</h3>
            <p
              className="biz-place"
              /* Le lieu se dit en clair au survol : la région et le pays,
                 nommés dans la langue lue, au lieu de laisser le lecteur
                 deviner de quel pays le badge parle. */
              title={t('dir.placeHover')
                .replace('{region}', nomRegion(item.wilaya, lang))
                .replace('{pays}', nomPays(paysDe(item), lang))}
            >
              <i className="ri-map-pin-line" aria-hidden="true"></i>{nomCommune(item.commune, lang)} · {nomRegion(item.wilaya, lang)}
              <PaysBadge code={paysDe(item)} />
            </p>
            <div className="biz-flags">
              <p className="biz-since" title={joinedExact || undefined}>
                <i className="ri-calendar-2-line" aria-hidden="true"></i>
                {t('candlist.joinedAgo')} {joinedAgo}
              </p>
              <span className={`author-gen biz-gen${genOrdinal && genIndex > 0 ? ' is-other' : ''}`} title={genTitle}>
                <i className="ri-calendar-event-line" aria-hidden="true"></i>
                <span>{t('dir.openLabel')}</span>
                <b>{generation}</b>
                {genOrdinal && <em className="author-gen-n">{genOrdinal}</em>}
              </span>
              {etabs > 0 && (
                /* The pill is its own door: it opens the workshop's sheet on
                   the establishments figure, not on the first line of the
                   card. It stops the card's own link from firing first. */
                <button
                  type="button"
                  className="biz-etabs"
                  title={`${t('ofi.block')} · ${t('ofb.cardPlanTitle')}`}
                  aria-label={`${nom} — ${etabs} ${etabs > 1 ? t('ofb.etabsMany') : t('ofb.etabsOne')}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/annuaire/entreprise/${item.id}#pro-etabs`);
                  }}
                >
                  <i className="ri-building-4-line" aria-hidden="true"></i>
                  {etabs} {etabs > 1 ? t('ofb.etabsMany') : t('ofb.etabsOne')}
                  <i className="ri-arrow-right-line biz-etabs-go" aria-hidden="true"></i>
                </button>
              )}
            </div>
          </div>
        </div>
        <ul className="biz-serv">
          {item.services.slice(0, 2).map((s) => <li key={s.fr}>{localize(s, lang)}</li>)}
        </ul>
        {/* Straight from the card to the B2B form, this workshop already in the list. */}
        <button
          type="button"
          className="biz-b2b"
          title={`${t('b2b.shopCardCta')} — ${nom}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/demande-b2b?atelier=${item.id}`);
          }}
        >
          <i className="ri-send-plane-line" aria-hidden="true"></i>
          <span>{t('b2b.shopCardCta')}</span>
          <i className="ri-arrow-right-line biz-b2b-go" aria-hidden="true"></i>
        </button>
        <div className="biz-foot">
          {item.reviews > 0 && (
            <span className="biz-rate"><i className="ri-star-fill" aria-hidden="true"></i>{item.rating.toFixed(1)} <em>({item.reviews})</em></span>
          )}
          {/* Le geste court de l'aire : deux lignes, le nom de l'aire où se
              tient l'atelier et ses fiches. Le clic n'ouvre pas la fiche —
              la carte reste un lien, le geste s'arrête là. */}
          {aireAtelier && (
            <span
              className="biz-aire"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <CopyTextButton
                label={t('cmaps.atelierAireCopy')}
                hint={`${t('cmaps.atelierAireCopyHint')
                  .replace('{atelier}', nom)
                  .replace('{region}', aireAtelierNom)}${aireAtelierPays ? ` · ${aireAtelierPays}` : ''}`}
                className="biz-aire-copy"
                onCopied={() => {
                  markAireFicheCopied(aireAtelier.key);
                  /* Le geste part d'une carte, non d'une fiche : la rangée d'un
                     pays tient ce compte à part, à côté des copies courtes. */
                  markAireCarteCopied(aireAtelier.key, paysDe(item));
                }}
                build={() => [
                  t('cmaps.atelierAireCopyLine').replace('{atelier}', nom),
                  t('cmaps.atelierAireCopyRow')
                    .replace('{region}', aireAtelierNom)
                    .replace('{files}', String(fichesDesPays(aireAtelier.pays)))
                    .replace('{unit}', t('cmaps.airesChipFiles')),
                ].join('\n')}
              />
              {/* Le compte des copies de cette aire, dans le pied de la carte :
                  le même chiffre que sur la fiche, et le jour de la dernière —
                  et une porte : il rouvre la note des aires resserrée sur cette
                  aire sans passer par la fiche. */}
              <AireFicheCount aire={aireAtelier.key} regionNom={aireAtelierNom} noteTo={aireNote} />
            </span>
          )}
          {/* Écrire ne remplace pas la demande B2B : c'est une porte plus
              légère, glissée dans le pied de la carte. */}
          <button
            type="button"
            className="biz-write"
            title={t('pro.writeHint')}
            disabled={writeState === 'busy'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void writeToWorkshop(item.id, item.name);
            }}
          >
            <i
              className={writeState === 'busy' ? 'ri-loader-4-line is-spin' : 'ri-chat-3-line'}
              aria-hidden="true"
            ></i>
            <span className="whitespace-nowrap">
              {writeState === 'busy' ? t('pro.writing') : t('pro.writeShort')}
            </span>
          </button>
          <span className="biz-link">{t('dir.view')} <i className="ri-arrow-right-line" aria-hidden="true"></i></span>
        </div>
        {(writeState === 'none' || writeState === 'self' || writeState === 'error') && (
          <p className={`biz-write-note${writeState === 'error' ? ' is-err' : ''}`} role={writeState === 'error' ? 'alert' : undefined}>
            <i
              className={
                writeState === 'none'
                  ? 'ri-information-line'
                  : writeState === 'self'
                    ? 'ri-user-line'
                    : 'ri-error-warning-line'
              }
              aria-hidden="true"
            ></i>
            {writeState === 'none'
              ? t('pro.writeNoneShort')
              : writeState === 'self'
                ? t('pro.writeSelfShort')
                : t('pro.writeErrorShort')}
          </p>
        )}
      </div>
    </Link>
  );
}