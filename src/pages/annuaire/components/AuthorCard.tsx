import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localize } from '@/i18n/localize';
import { nomPays, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { decadeLabel, decadeOf, premierePublication } from '@/lib/generation';
import { useShortlist } from '@/hooks/useShortlist';
import { useWriteToWorkshop } from '@/hooks/useWriteToWorkshop';
import { nomDemo } from '@/lib/nomsDemo';
import { nomCommune } from '@/lib/communeLabels';
import type { Auteur } from '@/mocks/auteurs';
import CopyTextButton from '@/components/feature/CopyTextButton';
import AireFicheCount from '@/components/feature/AireFicheCount';
import { markAireCarteCopied, markAireFicheCopied } from '@/lib/aireCarteMemory';
import { AIRE_CARTE_PARAM, AIRES_MONDE_PARAM, fichesDesPays, regionMondeDe, regionMondeLabelKey } from '@/lib/worldRegions';
import { paysDeAireTexte } from '@/lib/airePaysTexte';
import './biz-card.css';

export default function AuthorCard({ item, index, decades = [] }: { item: Auteur; index: number; decades?: number[] }) {
  const { t, lang } = useLang();
  const { has, toggle } = useShortlist('auteurs');
  const selected = has(item.id);
  /* Le même geste que sur la carte d'un atelier : on écrit à l'auteur sans
     quitter l'annuaire, et le fil s'ouvre dans la messagerie, déjà prêt.
     Aucun compte n'est inventé : sans compte ouvert, la carte le dit. */
  const { writeState, writeToAuthor } = useWriteToWorkshop();
  const statusKey = item.status === 'open' ? 'Open' : item.status === 'project' ? 'Project' : 'Full';
  const latest = item.books[0];
  const country = nomPays(paysDe(item), lang);
  /* The generation of the pen, read on the card itself: the decade of the
     first publication — the earliest book, or the year the pen started. */
  const generation = decadeLabel(decadeOf(premierePublication(item)));
  /* The place of the pen among the generations being read: 1/2 or 2/2, so a
     profile of the other decade is signalled on its own card. */
  const genIndex = decades.indexOf(decadeOf(premierePublication(item)));
  const genOrdinal = decades.length > 1 && genIndex >= 0 ? `${genIndex + 1}/${decades.length}` : '';
  const genTitle = `${t('gen.pubLabel')} · ${generation}${genOrdinal ? ` · ${t('gen.pairCounter')} ${genOrdinal}` : ''}`;
  /* La plume se nomme dans la langue de la page, comme l'atelier. */
  const nom = nomDemo(item.name, lang);
  /* L’aire où écrit la plume : la carte l’annonce en deux lignes, comme la
     fiche — son nom et ses fiches, sans rang ni adresse de vue Carte. */
  const airePlume = regionMondeDe(paysDe(item));
  const airePlumeNom = airePlume ? t(regionMondeLabelKey(airePlume)) : '';
  /* Les pays de l'aire, nommés un à un au survol du geste, comme sur la fiche
     d'un atelier : le message se mesure avant d'être collé. */
  const airePlumePays = airePlume
    ? paysDeAireTexte(airePlume, lang, t, t('cmaps.airesChipFiles'))
    : '';
  /* La note des aires du monde resserrée sur cette aire : le petit compte du
     pied y mène d'un clic, sans passer par la fiche. */
  const aireNote = airePlume
    ? `/annuaire?view=map&${AIRES_MONDE_PARAM}=${airePlume.key}&${AIRE_CARTE_PARAM}=${airePlume.key}#cmaps`
    : '';
  /* La liste d'où l'on vient voyage avec la carte : la fiche pourra rendre le
     pays entier sans rendre la région qui resserrait la liste. */
  const { search } = useLocation();
  const carried = new URLSearchParams(search);
  const keep = new URLSearchParams();
  ['pays', 'wilaya', 'genre', 'sort', 'open'].forEach((key) => {
    const value = carried.get(key);
    if (value) keep.set(key, value);
  });
  const kept = keep.toString();
  const to = `/auteur/${item.id}${kept ? `?${kept}` : ''}`;

  return (
    <Link to={to} className="biz-card author-card" style={{ ['--i' as string]: index % 3 }}>
      <div className="author-top">
        <img className="author-portrait" src={item.portrait} alt={`${nom} — ${t(`genre.${item.genres[0]}`)}`} title={`${nom} · ${item.wilaya}`} width={800} height={800} />
        <div className="author-ident">
          <h3>{nom}</h3>
          <p className="biz-place"><i className="ri-map-pin-line" aria-hidden="true"></i>{nomCommune(item.commune, lang)} · {nomRegion(item.wilaya, lang)}
            <span className="biz-pays"><i className="ri-global-line" aria-hidden="true"></i>{country}</span>
          </p>
          <div className="author-flags">
            <span className="auth-avail" data-state={item.status}>
              <i className="ri-calendar-check-line" aria-hidden="true"></i>{t(`auth.status${statusKey}`)}
            </span>
            <span className={`author-gen${genOrdinal && genIndex > 0 ? ' is-other' : ''}`} title={genTitle}>
              <i className="ri-calendar-event-line" aria-hidden="true"></i>
              <span>{t('gen.pubLabel')}</span>
              <b>{generation}</b>
              {genOrdinal && <em className="author-gen-n">{genOrdinal}</em>}
            </span>
          </div>
        </div>
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

      <ul className="biz-serv">
        {item.genres.map((g) => <li key={g}>{t(`genre.${g}`)}</li>)}
      </ul>

      {latest && (
        <p className="author-latest">
          <i className="ri-book-2-line" aria-hidden="true"></i>
          <span>{localize(latest.title, lang)}</span>
          <em>{latest.year}</em>
        </p>
      )}

      <div className="biz-foot">
        <span className="biz-rate"><i className="ri-quill-pen-line" aria-hidden="true"></i>{item.books.length} {t('auth.worksCount')}</span>
        {/* Le geste court de l’aire, le même que sur la fiche d’un atelier :
            deux lignes, le nom de l’aire où écrit la plume et ses fiches — et
            le compte des copies de cette aire à côté. Le clic n’ouvre pas la
            fiche, le geste s’arrête à la copie. */}
        {airePlume && (
          <span
            className="biz-aire"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <CopyTextButton
              label={t('cmaps.plumeAireCopy')}
              hint={`${t('cmaps.plumeAireCopyHint')
                .replace('{plume}', nom)
                .replace('{region}', airePlumeNom)}${airePlumePays ? ` · ${airePlumePays}` : ''}`}
              className="biz-aire-copy"
              onCopied={() => {
                markAireFicheCopied(airePlume.key);
                /* Le geste part d'une carte, non d'une fiche : la rangée d'un
                   pays tient ce compte à part, à côté des copies courtes. */
                markAireCarteCopied(airePlume.key, paysDe(item));
              }}
              build={() => [
                t('cmaps.plumeAireCopyLine').replace('{plume}', nom),
                t('cmaps.aireCopyRow')
                  .replace('{region}', airePlumeNom)
                  .replace('{files}', String(fichesDesPays(airePlume.pays)))
                  .replace('{unit}', t('cmaps.airesChipFiles')),
              ].join('\n')}
            />
            <AireFicheCount aire={airePlume.key} regionNom={airePlumeNom} noteTo={aireNote} />
          </span>
        )}
        <button
          type="button"
          className="biz-write"
          title={t('auth.writeHint')}
          disabled={writeState === 'busy'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void writeToAuthor(item.id, item.name);
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
            ? t('auth.writeNoneShort')
            : writeState === 'self'
              ? t('auth.writeSelfShort')
              : t('auth.writeErrorShort')}
        </p>
      )}
    </Link>
  );
}