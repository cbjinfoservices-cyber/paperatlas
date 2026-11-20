import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useAuth } from '@/auth/AuthProvider';
import { useSeo } from '@/hooks/useSeo';
import { useJsonLd } from '@/hooks/useJsonLd';
import { useReveal } from '@/hooks/useReveal';
import { supabase } from '@/lib/supabase';
import { openCv } from '@/lib/cv';
import { isWithinDays } from '@/lib/freshness';
import { nomPays, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { pointOfRegion } from '@/lib/regionGeo';
import { formatDistance, haversineKm, useGeo } from '@/hooks/useGeo';
import { MEMBER_COLUMNS, openConversation, type MemberCardRow } from '@/lib/messaging';
import PlaceMap from '@/components/feature/PlaceMap';
import CopyLinkButton from '@/components/feature/CopyLinkButton';
import CopyTextButton from '@/components/feature/CopyTextButton';
import BoardFromCount from '@/components/feature/BoardFromCount';
import TradeShare from '@/pages/candidats/components/TradeShare';
import FicheTrail from '@/components/feature/FicheTrail';
import { breadcrumbLd, type Crumb } from '@/lib/structuredData';
import RegionWalk from '@/pages/entreprise/components/RegionWalk';
import WalkLostTag from '@/pages/entreprise/components/WalkLostTag';
import { RADIUS_STEPS } from '@/lib/boardRadiusMemory';
import './candidat.css';

type State = 'loading' | 'gate' | 'ready' | 'missing' | 'error';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

/**
 * The public sheet of a member, reachable from an application in the employer's
 * account. It shows what the member agreed to publish — never the CV link,
 * which only travels inside an application.
 */
export default function CandidatProfile() {
  const { t, lang } = useLang();
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useSeo({ page: 'compte', path: `/candidats/${id}` });
  useReveal();

  const { session, user, compte, loading: authLoading } = useAuth();
  /* La position du visiteur : elle ne sert qu'à mesurer la distance annoncée
     dans le texte copié, et ne se lit jamais sans son accord. */
  const geo = useGeo();
  const [member, setMember] = useState<MemberCardRow | null>(null);
  const [state, setState] = useState<State>('loading');
  const [opening, setOpening] = useState(false);
  const [failure, setFailure] = useState('');
  /* The CV travels inside an application: only an employer who received one
     from this member may open it from here. It may be a private storage path
     (new rows) or an old public link. */
  const [cvRef, setCvRef] = useState('');

  const load = useCallback(async () => {
    if (!id) {
      setState('missing');
      return;
    }
    /* Member cards are readable by signed-in members only: show the gate
       rather than a misleading « not found » to a visitor with no account. */
    if (!session) {
      setState('gate');
      return;
    }
    setState('loading');
    try {
      const { data, error } = await supabase
        .from('paperatlas_membres')
        .select(`${MEMBER_COLUMNS}, created_at`)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setMember(null);
        setState('missing');
        return;
      }
      setMember(data as MemberCardRow);
      setState('ready');
    } catch {
      setMember(null);
      setState('error');
    }
  }, [id, session]);

  useEffect(() => {
    void load();
  }, [load]);

  /* The exact day the profile landed, written out plainly next to the badge:
     « moins d'un mois » is not enough when you are judging a pool. */
  const joined = useMemo(() => {
    const raw = member?.created_at;
    if (!raw) return '';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ' : lang === 'en' ? 'en-GB' : 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }, [member, lang]);

  const fresh = Boolean(member?.created_at) && isWithinDays(String(member?.created_at));

  const isMe = Boolean(user?.id && member?.id && user.id === member.id);
  const headline = (member?.titre || member?.metier || '').trim();
  /* The country the profile reads from, written in the language being read:
     it heads the place line, exactly like the listing and job sheets. */
  const country = nomPays(member ? paysDe(member) : '', lang);

  /* Le chemin de la fiche, écrit une seule fois : l'accueil, le vivier, puis
     ce profil. Le fil affiché et le balisage lu par les moteurs puisent dans
     la même liste, si bien qu'ils ne peuvent pas se contredire. */
  const filCrumbs: Crumb[] = useMemo(() => [
    { name: t('siteMap.home'), path: '/' },
    { name: t('candlist.short'), path: '/candidats' },
    ...(member ? [{ name: member.nom, path: `/candidats/${member.id}` }] : []),
  ], [member, t]);

  useJsonLd('candidat-jsonld', {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbLd(filCrumbs)],
  });

  /* The list you arrived from is remembered in the address, so one click hands
     back the exact view — same trade, same sort, same « nouveaux » switch —
     instead of the plain list. */
  const keptRaw = params.get('sort');
  const keptSort = keptRaw === 'name' || keptRaw === 'oldest' || keptRaw === 'pays' || keptRaw === 'trip' ? keptRaw : '';
  const keptMetier = params.get('metier') ?? '';
  const keptRawFresh = params.get('fresh');
  const keptFresh = keptRawFresh === 'week' ? 'week' : keptRawFresh === '1' ? '1' : '';
  /* Le rayon du vivier d'où l'on vient : il revient avec la liste, pour que le
     retour rende le périmètre resserré et non le vivier entier. */
  const rawRayon = Number(params.get('rayon'));
  const keptRayon = (RADIUS_STEPS as readonly number[]).includes(rawRayon) ? rawRayon : 0;
  /* La lettre de l'index d'où l'on vient : elle ramène la liste au même point,
     et non à son premier écran. */
  const keptLettre = (params.get('lettre') ?? '').trim().charAt(0).toUpperCase();
  /* La région et le pays d'où l'on vient : le vivier les avait resserrés au
     moment d'ouvrir la fiche, et la fiche les rend d'un geste. */
  const keptPays = (params.get('pays') ?? '').trim();
  const keptWilaya = (params.get('wilaya') ?? '').trim();
  /* La lettre ne se rappelle que dans l'ordre alphabétique : ailleurs, elle ne
     désigne aucun point de la liste. */
  const fromLetter = keptSort === 'name' ? keptLettre : '';
  /* L'étendue du vivier d'où l'on vient : le texte copié l'annonce, pour que
     le destinataire sache à quoi il s'ouvre au lieu de le découvrir. */
  const rawRows = Number(params.get('n'));
  const boardRows = Number.isFinite(rawRows) && rawRows > 0 ? Math.floor(rawRows) : 0;
  /* Combien de profils du vivier d'où l'on vient avaient une porte vide. */
  const rawLost = Number(params.get('l'));
  const boardLost = Number.isFinite(rawLost) && rawLost > 0 ? Math.floor(rawLost) : 0;
  /* Sur quelles portes ce compte s'appuie : le vivier le disait déjà à côté du
     jeton, la fiche le redit à côté de sa plaque. */
  const rawLostRegion = Number(params.get('lr'));
  const lostByRegion = Number.isFinite(rawLostRegion) && rawLostRegion > 0 ? Math.floor(rawLostRegion) : 0;
  const rawLostTrade = Number(params.get('lt'));
  const lostByTrade = Number.isFinite(rawLostTrade) && rawLostTrade > 0 ? Math.floor(rawLostTrade) : 0;
  const viewHref = (trade: string) => {
    const next = new URLSearchParams();
    if (trade) next.set('metier', trade);
    if (keptSort) next.set('sort', keptSort);
    if (keptRayon) next.set('rayon', String(keptRayon));
    /* La lettre ne suit que la lecture qu'elle désignait : un autre métier ne
       la tient pas forcément. */
    if (keptLettre && trade === keptMetier && keptSort === 'name') next.set('lettre', keptLettre);
    /* The « nouveaux » switch only travels back to the plain list: combined
       with a trade it would silently hide most of that trade's profiles. */
    if (!trade && keptFresh) next.set('fresh', keptFresh);
    const query = next.toString();
    return `/candidats${query ? `?${query}` : ''}`;
  };
  const listHref = viewHref(keptMetier);
  const tradeHref = member?.metier ? viewHref(member.metier) : listHref;

  /* Le vivier tel qu'on l'a quitté — et, sans la région, tout son pays : la
     porte d'à côté rend le pays entier sans rendre le lieu d'où l'on vient. */
  const boardHref = (withRegion: boolean) => {
    const next = new URLSearchParams();
    const code = keptPays || (member ? paysDe(member) : '');
    if (code) next.set('pays', code);
    if (withRegion && keptWilaya) next.set('wilaya', keptWilaya);
    if (keptMetier) next.set('metier', keptMetier);
    if (keptSort) next.set('sort', keptSort);
    if (keptRayon) next.set('rayon', String(keptRayon));
    if (fromLetter) next.set('lettre', fromLetter);
    /* La fenêtre d'arrivées ne suit que le vivier entier : avec un métier, elle
       cacherait la plupart des profils de ce métier. */
    if (!keptMetier && keptFresh) next.set('fresh', keptFresh);
    const query = next.toString();
    return `/candidats${query ? `?${query}` : ''}`;
  };
  const regionBackHref = boardHref(true);
  const countryHref = boardHref(false);

  /* La distance jusqu'au centre de la région déclarée : le profil ne donne
     pas de commune, aussi le chiffre est-il annoncé comme une estimation. */
  const kmAway = useMemo(() => {
    if (!member || !geo.point) return null;
    const point = pointOfRegion(member.wilaya, paysDe(member));
    if (!point) return null;
    return haversineKm(geo.point, point);
  }, [member, geo.point]);

  /* Le profil en texte : le nom, le métier, la région et la distance, prêts
     à coller dans un e-mail — puis l'adresse de la fiche. */
  const profileText = useCallback(() => {
    if (!member) return '';
    const lines: string[] = [member.nom];
    if (headline) lines.push(headline);
    if (member.metier) lines.push(`${t('candpub.copyTrade')} : ${member.metier}`);
    const place = [
      member.wilaya ? nomRegion(member.wilaya, lang) : '',
      country,
    ].filter(Boolean).join(', ');
    if (place) lines.push(`${t('candpub.copyRegion')} : ${place}`);
    if (kmAway !== null) {
      lines.push(
        `${t('candpub.copyDistance')} : ${t('candpub.copyEstimate').replace('{km}', formatDistance(kmAway, lang))}`,
      );
    }
    if (typeof window !== 'undefined') {
      const { origin, pathname, search } = window.location;
      lines.push(`${t('candpub.copyProfileLabel')} : ${origin}${pathname}${search}`);
      /* Le vivier d'où l'on vient, resserré : le destinataire de l'e-mail
         ouvre la liste au bon périmètre, pas seulement la fiche. */
      lines.push(`${t('candpub.copyListLabel')} : ${origin}${listHref}`);
      if (boardRows > 0) lines.push(`${t('candpub.copyRows')} : ${boardRows}`);
      /* Les profils à porte vide, juste après le compte du vivier. */
      if (boardLost > 0) lines.push(`${t('candpub.copyLost')} : ${boardLost}`);
      /* La lettre où l'on se tenait, à côté de l'adresse de la liste : le
         destinataire sait aussi à quel point du vivier la liste s'ouvre. */
      if (fromLetter) {
        lines.push(t('candpub.copyLetter').replace('{letter}', fromLetter));
      }
    }
    return lines.join('\n');
  }, [member, headline, t, lang, country, kmAway, listHref, fromLetter, boardRows, boardLost]);

  const memberId = member?.id ?? '';
  const meId = user?.id ?? '';

  useEffect(() => {
    let alive = true;
    if (!meId || !memberId || memberId === meId) {
      setCvRef('');
      return undefined;
    }
    setCvRef('');
    void (async () => {
      try {
        const { data } = await supabase
          .from('paperatlas_candidatures')
          .select('cv_url, cv_path, created_at')
          .eq('user_id', memberId)
          .eq('entreprise_user_id', meId)
          .order('created_at', { ascending: false })
          .limit(10);
        if (!alive) return;
        const rows = (data ?? []) as { cv_url: string | null; cv_path: string | null }[];
        const found = rows.find((row) => row.cv_path || row.cv_url);
        setCvRef((found?.cv_path || found?.cv_url || '').trim());
      } catch {
        if (alive) setCvRef('');
      }
    })();
    return () => {
      alive = false;
    };
  }, [memberId, meId]);

  const downloadCv = async () => {
    if (!cvRef) return;
    setFailure('');
    const opened = await openCv(cvRef);
    if (!opened) setFailure(t('cv.errOpen'));
  };

  const startThread = async () => {
    if (!user || !member) return;
    setOpening(true);
    setFailure('');
    try {
      const conversationId = await openConversation({
        meId: user.id,
        meNom: (compte?.nom || user.email || '').trim(),
        otherId: member.id,
        otherNom: member.nom,
        sujet: t('candpub.threadSubject'),
        kind: 'libre',
      });
      navigate(`/messages?c=${conversationId}`);
    } catch {
      setFailure(t('candpub.errThread'));
    } finally {
      setOpening(false);
    }
  };

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        {state === 'loading' && (
          <section className="dir-hero">
            <p className="acct-loading">
              <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
              {t('candpub.loading')}
            </p>
          </section>
        )}

        {!authLoading && state === 'gate' && (
          <section className="dir-hero cprof-missing">
            <p className="stamp">{t('candpub.stamp')}</p>
            <h1 className="page-h1">{t('candpub.gateTitle')}</h1>
            <p className="lede">{t('candpub.loginText')}</p>
            <div className="acct-actions">
              <Link to="/compte/connexion" className="cta">
                {t('candpub.loginCta')}
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </Link>
              <Link to="/compte/inscription" className="ghost-btn">
                {t('candpub.signup')}
              </Link>
            </div>
          </section>
        )}

        {!authLoading && state === 'loading' && (
          <section className="dir-hero">
            <p className="acct-loading">
              <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
              {t('candpub.loading')}
            </p>
          </section>
        )}

        {(state === 'missing' || state === 'error') && (
          <section className="dir-hero cprof-missing">
            <p className="stamp">{t('candpub.stamp')}</p>
            <h1 className="page-h1">{t(state === 'missing' ? 'candpub.notFound' : 'candpub.error')}</h1>
            <p className="lede">
              {t(state === 'missing' ? 'candpub.notFoundText' : 'candpub.errorText')}
            </p>
            <div className="acct-actions">
              {state === 'error' && (
                <button type="button" className="ghost-btn" onClick={() => void load()}>
                  <i className="ri-refresh-line" aria-hidden="true"></i>
                  {t('candpub.retry')}
                </button>
              )}
              <Link to="/compte" className="ghost-btn">
                <i className="ri-arrow-left-line" aria-hidden="true"></i>
                {t('candpub.back')}
              </Link>
            </div>
          </section>
        )}

        {state === 'ready' && member && (
          <>
            <section className="dir-hero cprof-hero">
              {/* Le chemin de la fiche : le lecteur arrivé d'un résultat de
                  recherche voit où il se tient, et chaque maillon remonte d'un
                  cran — le vivier des candidats, puis l'accueil. */}
              <FicheTrail crumbs={filCrumbs} />
              <p className="stamp">
                {t(member.role === 'candidat' ? 'candpub.stamp' : 'candpub.stampPro')}
              </p>
              <div className="cprof-id">
                <span className="cprof-avatar" aria-hidden="true">{initials(member.nom)}</span>
                <div className="cprof-id-txt">
                  <div className="cprof-name-row">
                    <h1 className="page-h1 cprof-name">{member.nom}</h1>
                    {fresh && <span className="cprof-new">{t('last.new')}</span>}
                  </div>
                  {joined && (
                    <p className="cprof-joined">
                      <i className="ri-calendar-line" aria-hidden="true"></i>
                      {t('candpub.joinedOn')} <strong>{joined}</strong>
                    </p>
                  )}
                  {headline && <p className="cprof-headline">{headline}</p>}
                </div>
              </div>
              <ul className="cprof-chips">
                <li>
                  <i className="ri-global-line" aria-hidden="true"></i>
                  {country}
                </li>
                {member.wilaya && (
                  <li>
                    <i className="ri-map-pin-line" aria-hidden="true"></i>
                    {member.wilaya}
                  </li>
                )}
                {member.metier && (
                  <li className="is-link">
                    <Link to={tradeHref} title={`${t('candpub.sameTrade')} · ${member.metier}`}>
                      <i className="ri-tools-line" aria-hidden="true"></i>
                      {member.metier}
                    </Link>
                  </li>
                )}
                {member.organisme && (
                  <li>
                    <i className="ri-building-2-line" aria-hidden="true"></i>
                    {member.organisme}
                  </li>
                )}
              </ul>
              {/* Le partage emporte le métier et le rayon lus : le profil
                  s'ouvre chez le destinataire dans son contexte, pas seul. */}
              <div className="cprof-share">
                <CopyLinkButton
                  label={t('candpub.share')}
                  className="ad-btn"
                  params={{
                    metier: member.metier ?? '',
                    rayon: keptRayon ? String(keptRayon) : '',
                  }}
                />
                <CopyTextButton
                  build={profileText}
                  label={t('candpub.copyText')}
                  hint={t('candpub.copyTextHint')}
                  className="ad-btn"
                />
                {/* Sans position, la distance manquerait au texte : le geste
                    qui la donne se tient donc à côté, plutôt que de laisser
                    une ligne vide. */}
                {!geo.point && (
                  <button
                    type="button"
                    className="board-trip-go"
                    onClick={() => geo.request()}
                    disabled={geo.status === 'asking' || geo.status === 'unsupported'}
                  >
                    <i
                      className={geo.status === 'asking' ? 'ri-loader-4-line is-spin' : 'ri-focus-3-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">
                      {geo.status === 'asking' ? t('near.asking') : t('pro.locate')}
                    </span>
                  </button>
                )}
                <span className="cprof-share-hint">
                  {keptRayon
                    ? t('candpub.shareHintRadius').replace('{km}', String(keptRayon))
                    : t('candpub.shareHint')}
                </span>
              </div>
            </section>

            <section className="dir-body">
              {/* Le rayon d'où l'on vient, la lettre où l'on se tenait et le
                  métier qui filtrait la liste : trois rappels posés côte à
                  côte, chacun rendant la liste au même point. */}
              {(keptRayon > 0 || fromLetter || Boolean(keptMetier) || Boolean(keptWilaya)
                || boardRows > 0 || boardLost > 0) && (
                <div className="cprof-from-row">
                  {/* La plaque du vivier est aussi une porte : son survol dit de
                      quoi son compte est fait — les lignes, le pays, la région —
                      et son clic rouvre la liste au même périmètre. */}
                  <BoardFromCount
                    rows={boardRows}
                    href={keptWilaya ? regionBackHref : countryHref}
                    pays={keptPays || (member ? paysDe(member) : '')}
                    wilaya={keptWilaya}
                    icon="ri-group-line"
                    className="cprof-from cprof-from-count"
                  />
                  {/* Les profils à porte vide, à côté de la plaque du vivier :
                      le compte se lit à l'écran, et non seulement dans le texte
                      copié — son survol dit sur quelles portes il s'appuie. */}
                  <WalkLostTag lost={boardLost} by={{ region: lostByRegion, trade: lostByTrade }} />
                  {/* La région d'où l'on vient, comme sur la fiche d'un atelier :
                      sa porte rend le vivier resserré, celle d'à côté rend le
                      pays entier — la région seule tombe, le reste tient. */}
                  {keptWilaya && (
                    <p className="cprof-from cprof-from-region">
                      <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                      <span>
                        {t('candpub.fromRegion').replace('{region}', nomRegion(keptWilaya, lang))}
                      </span>
                      <Link to={regionBackHref} className="board-trip-go">
                        <i className="ri-arrow-left-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('candpub.backRegion')}</span>
                      </Link>
                      <Link
                        to={countryHref}
                        className="board-trip-go board-trip-go--all"
                        title={t('candpub.allCountryHint')}
                      >
                        <i className="ri-global-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('tradePage.allCountry')}</span>
                      </Link>
                    </p>
                  )}
                  {keptRayon > 0 && (
                    <p className="cprof-from">
                      <i className="ri-focus-3-line" aria-hidden="true"></i>
                      <span>{t('candpub.fromRadius').replace('{km}', String(keptRayon))}</span>
                      <Link to={listHref} className="board-trip-go">
                        <i className="ri-arrow-left-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('candpub.backRadius')}</span>
                      </Link>
                    </p>
                  )}
                  {fromLetter && (
                    <p className="cprof-from cprof-from-letter">
                      <i className="ri-list-ordered" aria-hidden="true"></i>
                      <span>{t('candpub.fromLetter').replace('{letter}', fromLetter)}</span>
                      {/* La porte ne double celle du rayon que si elle manque :
                          sans rayon, c'est elle qui ramène à la liste. */}
                      {keptRayon === 0 && (
                        <Link to={listHref} className="board-trip-go">
                          <i className="ri-arrow-left-line" aria-hidden="true"></i>
                          <span className="whitespace-nowrap">{t('candpub.backLetter')}</span>
                        </Link>
                      )}
                    </p>
                  )}
                  {/* Le métier qui filtrait le vivier : à côté de la lettre,
                      ce qu'il faut pour revenir à la même sélection. */}
                  {keptMetier && (
                    <p className="cprof-from cprof-from-trade">
                      <i className="ri-tools-line" aria-hidden="true"></i>
                      <span>{t('candpub.fromTrade').replace('{trade}', keptMetier)}</span>
                      {/* La porte ne double celles du rayon et de la lettre
                          que si elles manquent : une seule ramène à la fois. */}
                      {keptRayon === 0 && !fromLetter && (
                        <Link to={listHref} className="board-trip-go">
                          <i className="ri-arrow-left-line" aria-hidden="true"></i>
                          <span className="whitespace-nowrap">{t('candpub.backTrade')}</span>
                        </Link>
                      )}
                    </p>
                  )}
                </div>
              )}
              <div className="cprof-grid">
                <article className="pro-card cprof-main">
                  <h2 className="pro-h">{t('candpub.about')}</h2>
                  <p className="pro-text cprof-bio">
                    {member.bio?.trim() || t('candpub.noBio')}
                  </p>

                  <h2 className="pro-h pro-h--spaced">{t('candpub.details')}</h2>
                  <dl className="cprof-facts">
                    <div>
                      <dt>{t('candpub.roleLabel')}</dt>
                      <dd>{t(member.role === 'candidat' ? 'acct.role.candidat' : 'acct.role.pro')}</dd>
                    </div>
                    {member.metier && (
                      <div>
                        <dt>{t('candpub.trade')}</dt>
                        <dd>
                          <Link to={tradeHref} className="cprof-fact-link">
                            {member.metier}
                            <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
                          </Link>
                        </dd>
                      </div>
                    )}
                    {member.wilaya && (
                      <div>
                        <dt>{t('candpub.wilaya')}</dt>
                        <dd>{member.wilaya}</dd>
                      </div>
                    )}
                    <div>
                      <dt>{t('pays.label')}</dt>
                      <dd className="pro-pays-cell">{country}</dd>
                    </div>
                  </dl>

                  {/* La part du vivier que ce métier tient : le profil est
                      situé dans l'ensemble, pas seulement décrit. */}
                  {member.role === 'candidat' && member.metier && (
                    <TradeShare metier={member.metier} href={tradeHref} />
                  )}

                  <p className="pro-note">
                    <i className="ri-shield-check-line" aria-hidden="true"></i>
                    {cvRef ? t('candpub.cvReady') : t('candpub.cvNote')}
                  </p>
                </article>

                <aside className="pro-card cprof-side">
                  <h2 className="pro-h">{t('candpub.contact')}</h2>

                  {!session && (
                    <>
                      <p className="pro-text cprof-side-text">{t('candpub.loginText')}</p>
                      <div className="cprof-side-actions">
                        <Link to="/compte/connexion" className="cta cprof-cta">
                          {t('candpub.loginCta')}
                          <i className="ri-arrow-right-line" aria-hidden="true"></i>
                        </Link>
                        <Link to="/compte/inscription" className="ghost-btn">
                          {t('candpub.signup')}
                        </Link>
                      </div>
                    </>
                  )}

                  {session && isMe && (
                    <>
                      <p className="pro-text cprof-side-text">{t('candpub.selfText')}</p>
                      <Link to="/compte" className="cta cprof-cta">
                        {t('candpub.selfCta')}
                        <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      </Link>
                    </>
                  )}

                  {session && !isMe && (
                    <>
                      <p className="pro-text cprof-side-text">{t('candpub.contactText')}</p>
                      {cvRef && (
                        <button
                          type="button"
                          className="ghost-btn cprof-cv"
                          title={t('candpub.downloadCvHint')}
                          onClick={() => void downloadCv()}
                        >
                          <i className="ri-download-2-line" aria-hidden="true"></i>
                          {t('candpub.downloadCv')}
                        </button>
                      )}
                      <div className="cprof-side-actions">
                        <button
                          type="button"
                          className="cta cprof-cta"
                          onClick={() => void startThread()}
                          disabled={opening}
                        >
                          {opening ? t('candpub.opening') : t('candpub.write')}
                          <i className="ri-chat-3-line" aria-hidden="true"></i>
                        </button>
                        <Link to="/compte#mes-candidatures" className="ghost-btn">
                          <i className="ri-inbox-archive-line" aria-hidden="true"></i>
                          {t('candpub.backApps')}
                        </Link>
                        <Link to={listHref} className="ghost-btn">
                          <i className="ri-group-line" aria-hidden="true"></i>
                          {t('candlist.all')}
                        </Link>
                        {member.metier && (
                          <Link to={tradeHref} className="ghost-btn">
                            <i className="ri-tools-line" aria-hidden="true"></i>
                            {t('candpub.sameTrade')}
                          </Link>
                        )}
                      </div>
                      {failure && <p className="form-msg err">{failure}</p>}
                    </>
                  )}

                  <p className="cprof-side-note">
                    <i className="ri-information-line" aria-hidden="true"></i>
                    {t('candpub.privacy')}
                  </p>
                </aside>

                {/* Le plan de la région déclarée par le profil : le même que
                    sur la fiche d'une annonce ou d'une offre, avec
                    l'itinéraire. Le profil ne donne pas de commune, aussi le
                    plan est-il cadré sur le centre de sa région. */}
                {member.wilaya && (
                  <div className="cprof-map">
                    <PlaceMap
                      wilaya={member.wilaya}
                      pays={paysDe(member)}
                      entreprise={member.nom}
                      title={t('candpub.mapCard')}
                      note={t('candpub.mapNote')}
                    />
                    {/* Les régions parcourues dans l'annuaire, sous le plan :
                        le même relevé que sur les fiches d'atelier, de plume,
                        d'annonce et d'offre — combien de lieux ont été
                        traversés, et ce que chaque porte tient encore. */}
                    <RegionWalk doorCounts held={boardRows > 0 ? boardRows : undefined} />
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}