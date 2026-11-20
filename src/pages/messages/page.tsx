import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useAuth } from '@/auth/AuthProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { useConversations, useReplyPace } from '@/hooks/useMessaging';
import PoseRestante from '@/components/feature/PoseRestante';
import { useMemberPaysMap } from '@/hooks/useMemberPays';
import { localeFor } from '@/i18n/localize';
import CopyTextButton from '@/components/feature/CopyTextButton';
import { REGIONS_MONDE, fichesDesPays, regionMondeDe, type RegionMondeKey } from '@/lib/worldRegions';
import {
  filterThreads,
  isUnread,
  markConversationUnread,
  partnerOf,
  sleepingCount,
  sortThreads,
  type ThreadKindFilter,
  type ThreadSort,
} from '@/lib/messaging';
import { readMsgMemory, saveMsgMemory } from './components/msgMemory';
import ThreadList, { MessagesEmptyPane } from './components/ThreadList';
import ChatPane from './components/ChatPane';
import NewThread from './components/NewThread';
import './messages.css';

export default function Messages() {
  const { t, lang } = useLang();
  const { session, user, loading: authLoading } = useAuth();
  useSeo({ page: 'compte', path: '/messages' });
  useReveal();

  const [params, setParams] = useSearchParams();
  const activeId = params.get('c') ?? '';
  const { rows, loading, error, reload, unread } = useConversations();
  const meId = user?.id ?? '';
  /* Le rythme de chaque fil, lu une fois pour toute la liste : l'inbox dit
     d'un coup d'œil quels échanges dorment, sans les ouvrir un par un. */
  const replyPace = useReplyPace(rows.map((row) => row.id));
  /* L'ordre de la liste : par défaut l'activité récente, ou le rythme de
     réponse quand on veut voir dormir les fils. Le tri se fait sur le rythme
     déjà lu, donc la liste ne relance aucune lecture en changeant d'ordre. */
  const [sort, setSort] = useState<ThreadSort>('recent');
  /* La nature retenue : tous les fils, ceux venus d’une candidature, ou ceux
     ouverts librement. Elle resserre la liste sans toucher au tri. */
  const [kind, setKind] = useState<ThreadKindFilter>('tout');
  /* La recherche de la boîte : elle lit le nom de l'interlocuteur et le sujet
     du fil, jamais le contenu des messages — un fil se retrouve sans s'ouvrir. */
  const [needle, setNeedle] = useState('');
  /* L'aire sur laquelle la boîte se resserre : "" quand elle montre tous les
     fils. Le geste part de la ligne d'aire d'un fil, dans la liste. */
  const [aire, setAire] = useState<RegionMondeKey | ''>('');
  /* Le pays de chaque interlocuteur, lu une seule fois : il donne son aire à
     chaque fil, et permet de resserrer la boîte sans ouvrir une conversation. */
  const paysById = useMemberPaysMap(rows.map((row) => partnerOf(row, meId).id));
  /* Le tri et le filtre sont retenus par compte : la boîte se rouvre là où la
     lecture s’était arrêtée, et deux comptes sur le même appareil ne se
     prêtent pas leurs réglages. L'attente évite d'écrire l'état d'origine
     avant que la mémoire du compte n'ait été lue. */
  const restoredFor = useRef('');
  useEffect(() => {
    if (!meId || restoredFor.current === meId) return;
    restoredFor.current = meId;
    const memory = readMsgMemory(meId);
    setSort(memory.sort);
    setKind(memory.kind);
  }, [meId]);
  useEffect(() => {
    if (!meId || restoredFor.current !== meId) return;
    saveMsgMemory(meId, { sort, kind });
  }, [meId, sort, kind]);
  const base = useMemo(
    () => sortThreads(filterThreads(rows, kind, meId), sort, replyPace),
    [rows, kind, sort, replyPace, meId],
  );
  /* La liste resserrée sur une aire : l'aire se lit sur le pays de
     l'interlocuteur, jamais sur ce que le fil raconte. Tant que ces pays ne
     sont pas revenus, la boîte garde tous ses fils plutôt que de se vider. */
  const airesConnues = useMemo(
    () => Object.keys(paysById).length > 0,
    [paysById],
  );
  const sorted = useMemo(() => {
    if (!aire || !airesConnues) return base;
    return base.filter(
      (row) => regionMondeDe(paysById[partnerOf(row, meId).id] ?? '')?.key === aire,
    );
  }, [base, aire, airesConnues, paysById, meId]);
  const sleeping = useMemo(() => sleepingCount(rows, replyPace), [rows, replyPace]);
  /* La recherche s'applique après le tri et l'aire : elle resserre ce que la
     boîte montre déjà, elle ne le réordonne pas. */
  const found = useMemo(() => {
    const asked = needle.trim().toLowerCase();
    if (!asked) return sorted;
    return sorted.filter((row) => {
      const nom = partnerOf(row, meId).nom.toLowerCase();
      const sujet = (row.sujet || '').toLowerCase();
      return nom.includes(asked) || sujet.includes(asked);
    });
  }, [sorted, needle, meId]);
  /* Le rappel qui accompagne l'ordre retenu : un ordre, une phrase. */
  const sortHintKey = sort === 'lent'
    ? 'msg.sortSlowHint'
    : sort === 'aire'
      ? 'msg.sortAireHint'
      : 'msg.sortRecentHint';
  const locale = localeFor(lang);
  const [showNew, setShowNew] = useState(false);
  const [note, setNote] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const active = rows.find((row) => row.id === activeId) ?? null;
  /* La nature de ce que la boîte contient : les fils venus d’une candidature,
     et ceux ouverts librement. Deux comptes, lus sur la même liste. */
  const appThreads = useMemo(() => rows.filter((row) => row.kind === 'candidature').length, [rows]);
  const freeThreads = rows.length - appThreads;
  /* Les non-lus, comptés par nature : la pastille du filtre dit d'un coup
     d'œil où sont les réponses en attente, sans ouvrir les fils un par un. */
  const unreadApp = useMemo(
    () => rows.filter((row) => row.kind === 'candidature' && isUnread(row, meId)).length,
    [rows, meId],
  );
  const unreadFree = useMemo(
    () => rows.filter((row) => row.kind !== 'candidature' && isUnread(row, meId)).length,
    [rows, meId],
  );
  /* Une nature retenue puis vidée par la vie de la boîte ne rouvre pas une
     liste vide : la boîte revient à tous les fils, et la mémoire suit. */
  useEffect(() => {
    if (loading || rows.length === 0) return;
    if (kind === 'candidature' && appThreads === 0) setKind('tout');
    if (kind === 'libre' && freeThreads === 0) setKind('tout');
    /* Le filtre des non-lus ne rouvre pas une pile vide : une fois tout lu, la
       boîte revient d'elle-même à tous les fils. */
    if (kind === 'nonlus' && unread === 0) setKind('tout');
  }, [loading, rows.length, kind, appThreads, freeThreads, unread]);

  /* Une aire retenue puis vidée par la vie de la boîte — un fil fermé, un
     interlocuteur parti — ne rouvre pas une liste vide : la boîte revient
     d'elle-même à tous les fils. */
  useEffect(() => {
    if (!aire || !airesConnues || loading || rows.length === 0) return;
    const reste = rows.some(
      (row) => regionMondeDe(paysById[partnerOf(row, meId).id] ?? '')?.key === aire,
    );
    if (!reste) setAire('');
  }, [aire, airesConnues, loading, rows, paysById, meId]);

  /** Sends a read thread back to the unread pile, so it can be handled later. */
  const markUnread = async (id: string) => {
    const row = rows.find((item) => item.id === id);
    if (!row || !meId) return;
    const ok = await markConversationUnread(row, meId);
    await reload();
    setNote({ kind: ok ? 'ok' : 'err', text: ok ? t('msg.markedUnread') : t('msg.markError') });
    window.setTimeout(() => setNote(null), 5000);
  };

  const pick = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('c', id);
    setParams(next, { replace: true });
    setShowNew(false);
    void reload();
  };

  const clearActive = () => {
    const next = new URLSearchParams(params);
    next.delete('c');
    setParams(next, { replace: true });
  };

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-hero">
          <p className="stamp">{t('msg.stamp')}</p>
          <h1 className="page-h1" dangerouslySetInnerHTML={{ __html: t('msg.title') }} />
          <p className="lede">{t('msg.lede')}</p>
          {/* Le repère de pose : les seules clés `msg.` que la boîte
traverse vraiment — les fils, les filtres, les tris et les
              gestes de lecture. Il se tait quand tout est posé. */}
          <PoseRestante fichier="dict.candidat.ts" prefixes={['msg.']} />
        </section>

        <section className="dir-body">
          {authLoading && (
            <p className="acct-loading">
              <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
              {t('acct.loading')}
            </p>
          )}

          {!authLoading && !session && (
            <div className="form-card auth-card msg-gate">
              <i className="ri-chat-3-line" aria-hidden="true"></i>
              <h2 className="page-h2">{t('msg.loginTitle')}</h2>
              <p className="auth-note">{t('msg.loginText')}</p>
              <div className="acct-actions">
                <Link to="/compte/connexion" className="cta">
                  {t('msg.loginCta')}
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
                <Link to="/compte/inscription/candidat" className="ghost-btn">
                  {t('msg.signup')}
                </Link>
              </div>
            </div>
          )}

          {session && (
            <div className={`msg-layout${activeId ? ' is-open' : ''}`}>
              <aside className="msg-side">
                <div className="msg-side-top">
                  <h2 className="pro-h">
                    {t('msg.inbox')}
                    {unread > 0 && <span className="msg-badge">{unread}</span>}
                    {sleeping > 0 && (
                      <span
                        className="msg-badge msg-badge--sleep"
                        title={t('msg.sleepingHint')}
                        aria-label={`${sleeping} ${t(sleeping === 1 ? 'msg.sleepingOne' : 'msg.sleeping')}`}
                      >
                        <i className="ri-moon-line" aria-hidden="true"></i>
                        {sleeping}
                      </span>
                    )}
                  </h2>
                  <button
                    type="button"
                    className={`share-btn${showNew ? ' is-ok' : ''}`}
                    onClick={() => setShowNew((value) => !value)}
                    aria-expanded={showNew}
                  >
                    <i className={showNew ? 'ri-close-line' : 'ri-add-line'} aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{showNew ? t('appl.cancel') : t('msg.new')}</span>
                  </button>
                </div>

                {!showNew && rows.length > 0 && (
                  <p className="msg-kinds" aria-label={t('msg.kindsTitle')}>
                    <span className="msg-kind is-app" title={t('msg.kindAppHint')}>
                      <i className="ri-briefcase-line" aria-hidden="true"></i>
                      <b>{appThreads}</b>
                      <span>{t('msg.kindApp')}</span>
                    </span>
                    <span className="msg-kind is-free" title={t('msg.kindFreeHint')}>
                      <i className="ri-chat-3-line" aria-hidden="true"></i>
                      <b>{freeThreads}</b>
                      <span>{t('msg.kindFree')}</span>
                    </span>
                  </p>
                )}

                {!showNew && rows.length > 0 && (
                  <div className="msg-inbox-search">
                    <i className="ri-search-line" aria-hidden="true"></i>
                    <input
                      type="search"
                      value={needle}
                      onChange={(event) => setNeedle(event.target.value)}
                      placeholder={t('msg.inboxSearchPh')}
                      aria-label={t('msg.inboxSearchLabel')}
                      autoComplete="off"
                    />
                    {needle && (
                      <>
                        <b className="msg-inbox-search-count">
                          {found.length} {t('msg.inboxSearchCount')}
                        </b>
                        <button
                          type="button"
                          className="msg-inbox-search-clear"
                          onClick={() => setNeedle('')}
                          aria-label={t('msg.inboxSearchClear')}
                          title={t('msg.inboxSearchClear')}
                        >
                          <i className="ri-close-line" aria-hidden="true"></i>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {!showNew && rows.length > 1 && (
                  <div className="msg-sort-block">
                    <div className="msg-sort" role="group" aria-label={t('msg.sortLabel')}>
                      <button
                        type="button"
                        className="msg-sort-btn"
                        data-on={sort === 'recent' ? 'yes' : 'no'}
                        aria-pressed={sort === 'recent'}
                        onClick={() => setSort('recent')}
                      >
                        <i className="ri-time-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('msg.sortRecent')}</span>
                      </button>
                      <button
                        type="button"
                        className="msg-sort-btn"
                        data-on={sort === 'lent' ? 'yes' : 'no'}
                        aria-pressed={sort === 'lent'}
                        onClick={() => setSort('lent')}
                      >
                        <i className="ri-moon-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('msg.sortSlow')}</span>
                      </button>
                      {/* Le troisième ordre : les fils rangés sous le nom de
                          chaque aire du monde, plutôt qu'à la suite. */}
                      <button
                        type="button"
                        className="msg-sort-btn"
                        data-on={sort === 'aire' ? 'yes' : 'no'}
                        aria-pressed={sort === 'aire'}
                        title={t('msg.sortAireHint')}
                        onClick={() => setSort('aire')}
                      >
                        <i className="ri-map-2-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('msg.sortAire')}</span>
                      </button>
                    </div>
                    <div className="msg-sort" role="group" aria-label={t('msg.filterLabel')}>
                      <button
                        type="button"
                        className="msg-sort-btn"
                        data-on={kind === 'tout' ? 'yes' : 'no'}
                        aria-pressed={kind === 'tout'}
                        onClick={() => setKind('tout')}
                      >
                        <i className="ri-stack-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('msg.filterAll')}</span>
                        {unread > 0 && (
                          <b className="msg-sort-count" aria-label={`${unread} ${t(unread === 1 ? 'msg.unreadOne' : 'msg.unread')}`}>
                            {unread}
                          </b>
                        )}
                      </button>
                      <button
                        type="button"
                        className="msg-sort-btn"
                        data-on={kind === 'candidature' ? 'yes' : 'no'}
                        aria-pressed={kind === 'candidature'}
                        onClick={() => setKind('candidature')}
                        disabled={appThreads === 0}
                      >
                        <i className="ri-briefcase-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('msg.filterApp')}</span>
                        {unreadApp > 0 && (
                          <b className="msg-sort-count" aria-label={`${unreadApp} ${t(unreadApp === 1 ? 'msg.unreadOne' : 'msg.unread')}`}>
                            {unreadApp}
                          </b>
                        )}
                      </button>
                      <button
                        type="button"
                        className="msg-sort-btn"
                        data-on={kind === 'libre' ? 'yes' : 'no'}
                        aria-pressed={kind === 'libre'}
                        onClick={() => setKind('libre')}
                        disabled={freeThreads === 0}
                      >
                        <i className="ri-chat-3-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('msg.filterFree')}</span>
                        {unreadFree > 0 && (
                          <b className="msg-sort-count" aria-label={`${unreadFree} ${t(unreadFree === 1 ? 'msg.unreadOne' : 'msg.unread')}`}>
                            {unreadFree}
                          </b>
                        )}
                      </button>
                      {/* Les réponses en attente, toutes natures confondues : une
                          seule pastille pour la pile qui compte le plus. */}
                      <button
                        type="button"
                        className="msg-sort-btn"
                        data-on={kind === 'nonlus' ? 'yes' : 'no'}
                        aria-pressed={kind === 'nonlus'}
                        onClick={() => setKind('nonlus')}
                        disabled={unread === 0}
                        title={t('msg.filterUnreadHint')}
                      >
                        <i className="ri-mail-unread-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('msg.filterUnread')}</span>
                        {unread > 0 && (
                          <b className="msg-sort-count" aria-label={`${unread} ${t(unread === 1 ? 'msg.unreadOne' : 'msg.unread')}`}>
                            {unread}
                          </b>
                        )}
                      </button>
                    </div>
                    <p className="msg-sort-hint">{t(sortHintKey)}</p>
                  </div>
                )}

                {note && (
                  <p className={`msg-note${note.kind === 'err' ? ' is-err' : ''}`} role={note.kind === 'err' ? 'alert' : 'status'}>
                    <i className={note.kind === 'err' ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'} aria-hidden="true"></i>
                    {note.text}
                  </p>
                )}

                {/* L'aire retenue, dite en clair au-dessus de la liste : la boîte
                    ne montre que les fils dont l'interlocuteur s'y tient, et
                    le geste pour rendre tous les fils reste sous la main. */}
                {aire && (
                  <p className="msg-aire-tray">
                    {/* La pastille de l'aire retenue est elle-même une porte de
                        copie : d'un geste partent les fils de cette aire et
                        leurs interlocuteurs, une ligne par fil. */}
                    <CopyTextButton
                      className="msg-aire-tray-pill"
                      label={t(`worldRegion.${aire}`)}
                      hint={t('msg.aireTrayCopyHint')
                        .replace('{n}', String(found.length))
                        .replace('{region}', t(`worldRegion.${aire}`))}
                      build={() => {
                        const region = REGIONS_MONDE.find((row) => row.key === aire) ?? null;
                        const files = region ? fichesDesPays(region.pays) : 0;
                        const entete = t('msg.aireTrayCopyLine')
                          .replace('{region}', t(`worldRegion.${aire}`))
                          .replace('{files}', files.toLocaleString(locale))
                          .replace('{unit}', t('cmaps.airesChipFiles'))
                          .replace('{n}', String(found.length));
                        const lignes = found.map((row) => t('msg.aireTrayCopyRow')
                          .replace('{nom}', partnerOf(row, meId).nom || t('msg.freeThread'))
                          .replace('{kind}', row.kind === 'candidature' ? t('msg.kindApp') : t('msg.kindFree')));
                        return [entete, ...lignes].join('\n');
                      }}
                      trailing={(
                        <>
                          <b>{found.length}</b>
                          <span>{t('msg.aireTrayCount')}</span>
                        </>
                      )}
                    />
                    <button type="button" className="link-btn" onClick={() => setAire('')}>
                      {t('msg.aireClear')}
                    </button>
                  </p>
                )}

                {error && (
                  <div className="board-error">
                    <i className="ri-plug-line" aria-hidden="true"></i>
                    <p>{t('msg.error')}</p>
                    <button type="button" className="ghost-btn" onClick={() => void reload()}>
                      <i className="ri-refresh-line" aria-hidden="true"></i>
                      {t('msg.retry')}
                    </button>
                  </div>
                )}

                {showNew ? (
                  <NewThread onOpen={pick} />
                ) : rows.length > 0 && found.length === 0 ? (
                  <div className="msg-side-empty">
                    <i className={needle ? 'ri-search-line' : 'ri-filter-off-line'} aria-hidden="true"></i>
                    <p>{needle ? t('msg.inboxSearchNone') : t('msg.filterNone')}</p>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => {
                        if (needle) {
                          setNeedle('');
                          return;
                        }
                        setKind('tout');
                        setAire('');
                      }}
                    >
                      {needle ? t('msg.inboxSearchClear') : t('msg.filterAll')}
                    </button>
                  </div>
                ) : (
                  <ThreadList
                    rows={found}
                    activeId={activeId}
                    meId={meId}
                    loading={loading}
                    replyPace={replyPace}
                    sort={sort}
                    onPick={pick}
                    onMarkUnread={(id) => void markUnread(id)}
                    paysById={paysById}
                    aire={aire}
                    onPickAire={(key) => setAire((current) => (current === key ? '' : key))}
                  />
                )}
              </aside>

              <div className="msg-main">
                {active ? (
                  <ChatPane conversation={active} meId={meId} onBack={clearActive} />
                ) : (
                  <MessagesEmptyPane />
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}