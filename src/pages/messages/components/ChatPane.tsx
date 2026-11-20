import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import BrandSeal from '@/components/feature/BrandSeal';
import AireCopyProfile from '@/components/feature/AireCopyProfile';
import useMemberPays from '@/hooks/useMemberPays';
import { enSommeil, markConversationRead, origineFiche, partnerOf, replyGapLabel, shortWhen, timeOf, type ConversationRow } from '@/lib/messaging';
import { useThread } from '@/hooks/useMessaging';

type Props = {
  conversation: ConversationRow;
  meId: string;
  onBack: () => void;
};

/** Messages are grouped by day, so a long thread still reads like a logbook. */
function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function ChatPane({ conversation, meId, onBack }: Props) {
  const { t, lang } = useLang();
  const locale = localeFor(lang);
  const { rows, loading, error, reload, send } = useThread(conversation.id);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  /* La recherche dans le fil lui-même : un long échange se relit sans défiler
     des écrans entiers pour retrouver une phrase. */
  const [find, setFind] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  const firstHitRef = useRef<HTMLDivElement | null>(null);

  const other = partnerOf(conversation, meId);
  /* Le pays de l'interlocuteur, lu sur son profil public : il situe le fil
     dans une aire du monde, et donne son mot au geste de copie posé à côté
     de son nom. */
  const otherPays = useMemberPays(other.id);
  /* Le genre de fiche qui a ouvert le fil, lu une fois : un atelier et un
     auteur ne se disent pas avec les mêmes mots. */
  const origine = origineFiche(conversation);

  /* Les deux mêmes pastilles que la liste des conversations, portées sur
     l'en-tête : la date du dernier message et la nature du fil. L'échange est
     daté sans avoir à descendre dans le fil, même quand il est long.
     La date vient du fil lui-même dès qu'il est chargé : un message qui arrive
     pendant la lecture remet la pastille à jour sans quitter la page. */
  const lastStamp = useMemo(() => {
    let best = conversation.last_at;
    let bestMs = new Date(best).getTime();
    rows.forEach((row) => {
      const ms = new Date(row.created_at).getTime();
      if (Number.isFinite(ms) && (!Number.isFinite(bestMs) || ms > bestMs)) {
        best = row.created_at;
        bestMs = ms;
      }
    });
    return best;
  }, [rows, conversation.last_at]);
  const lastIso = timeOf(lastStamp);
  const lastWhen = lastIso ? shortWhen(lastIso, locale) : '';
  const lastFull = lastIso
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(lastIso))
    : '';

  /* La première ligne du fil remonte elle aussi dans l'en-tête : les deux
     dates se lisent alors comme une période — le jour où l'échange s'est
     ouvert, celui de sa dernière reprise — sans descendre dans le fil. */
  const firstStamp = useMemo(() => {
    let best = conversation.created_at || conversation.last_at;
    let bestMs = new Date(best).getTime();
    rows.forEach((row) => {
      const ms = new Date(row.created_at).getTime();
      if (Number.isFinite(ms) && (!Number.isFinite(bestMs) || ms < bestMs)) {
        best = row.created_at;
        bestMs = ms;
      }
    });
    return best;
  }, [rows, conversation.created_at, conversation.last_at]);
  const firstIso = timeOf(firstStamp);
  const firstWhen = firstIso ? shortWhen(firstIso, locale) : '';
  const firstFull = firstIso
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(firstIso))
    : '';

  /* La durée de l'échange, en jours entiers : posée entre les deux dates, elle
     se lit d'un coup d'œil, sans compter les jours de calendrier un par un.
     Deux messages du même jour ne font pas une durée — la pastille le dit. */
  const spanDays = useMemo(() => {
    if (!firstIso || !lastIso) return null;
    const start = new Date(firstIso).getTime();
    const end = new Date(lastIso).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return Math.max(Math.floor((end - start) / 86400000), 0);
  }, [firstIso, lastIso]);

  /* Le délai de réponse, mesuré sur le fil lui-même : chaque fois que la parole
     change de camp, l'écart entre le message et celui qui lui répond compte.
     Les messages envoyés d'affilée ne sont pas des réponses — ils ne pèsent
     donc pas dans la moyenne, qui dit le rythme réel de l'échange. */
  const replyGap = useMemo(() => {
    if (rows.length < 2) return null;
    let total = 0;
    let count = 0;
    for (let i = 1; i < rows.length; i += 1) {
      const previous = rows[i - 1];
      const current = rows[i];
      if (previous.sender_id === current.sender_id) continue;
      const from = new Date(previous.created_at).getTime();
      const to = new Date(current.created_at).getTime();
      if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) continue;
      total += to - from;
      count += 1;
    }
    return count > 0 ? total / count : null;
  }, [rows]);

  /* La même durée, dite dans l'unité qui se lit — la formulation est partagée
     avec la liste des conversations, pour que les deux lisent le même rythme. */
  const replyLabel = replyGapLabel(replyGap, t);
  /* Le même repère que la liste des conversations : au-delà d'un jour de
     réponse, le fil dort — et l'en-tête le dit, comme la ligne qui l'ouvre. */
  const dort = enSommeil(replyGap);
  useEffect(() => {
    setDraft('');
    setSendError('');
    setFind('');
    void markConversationRead(conversation, meId);
  }, [conversation, meId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [rows.length]);

  const dayLabel = (iso: string) => {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (dayKey(iso) === dayKey(today.toISOString())) return t('msg.today');
    if (dayKey(iso) === dayKey(yesterday.toISOString())) return t('msg.yesterday');
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
  };

  /* La phrase cherchée, lue dans le texte des messages de ce fil seulement. */
  const needle = find.trim().toLowerCase();
  const found = useMemo(
    () => (needle ? rows.filter((row) => row.corps.toLowerCase().includes(needle)) : rows),
    [rows, needle],
  );
  const firstHitId = needle && found.length > 0 ? found[0].id : '';

  /* La première réponse de la recherche se place au milieu de la vue : on ne
     cherche plus à la main dans ce qui reste affiché. */
  useEffect(() => {
    if (needle) firstHitRef.current?.scrollIntoView({ block: 'center' });
  }, [needle, firstHitId]);

  /** La phrase est marquée dans la bulle, pour que l'œil la trouve d'un coup. */
  const markPhrase = (text: string) => {
    if (!needle) return text;
    const lower = text.toLowerCase();
    const parts: { hit: boolean; text: string }[] = [];
    let from = 0;
    let at = lower.indexOf(needle);
    while (at !== -1) {
      if (at > from) parts.push({ hit: false, text: text.slice(from, at) });
      parts.push({ hit: true, text: text.slice(at, at + needle.length) });
      from = at + needle.length;
      at = lower.indexOf(needle, from);
    }
    if (from < text.length) parts.push({ hit: false, text: text.slice(from) });
    if (parts.length === 0) return text;
    return parts.map((part, index) => (
      part.hit
        ? <mark key={index} className="msg-mark">{part.text}</mark>
        : <span key={index}>{part.text}</span>
    ));
  };

  const grouped = useMemo(() => {
    const out: { key: string; label: string; items: typeof rows }[] = [];
    found.forEach((row) => {
      const key = dayKey(row.created_at);
      const last = out[out.length - 1];
      if (last && last.key === key) last.items.push(row);
      else out.push({ key, label: dayLabel(row.created_at), items: [row] });
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found, lang]);

  const submit = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setSendError('');
    const ok = await send(body);
    setSending(false);
    if (ok) {
      setDraft('');
      void markConversationRead(conversation, meId);
    } else {
      setSendError(t('msg.sendError'));
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <section className="msg-pane" aria-label={other.nom || t('msg.title').replace(/<[^>]+>/g, '')}>
      <header className="msg-head">
        <button type="button" className="msg-back" onClick={onBack} aria-label={t('msg.back')}>
          <i className="ri-arrow-left-line" aria-hidden="true"></i>
        </button>
        <span className="msg-avatar msg-avatar--lg" aria-hidden="true">
          {(other.nom || '?').trim().charAt(0).toUpperCase()}
        </span>
        <div className="msg-head-id">
          <span className="msg-head-name">
            <b>{other.nom || t('msg.freeThread')}</b>
            <BrandSeal className="msg-head-seal" />
          </span>
          {/* Le geste « Copier l'aire », à côté du nom de l'interlocuteur :
              le même bouton que sur les fiches, qui n'emporte que l'aire où
              il se tient, avec son compte et sa petite gomme. */}
          {otherPays && (
            <AireCopyProfile
              pays={otherPays}
              nom={other.nom || t('msg.freeThread')}
              kind="fil"
              className="msg-head-aire"
            />
          )}
          {conversation.sujet && (
            conversation.offre_id ? (
              <Link to={`/emplois/${conversation.offre_id}`} className="msg-head-sub">
                {t('msg.aboutOffer')} · {conversation.sujet}
              </Link>
            ) : (
              <span className="msg-head-sub">{conversation.sujet}</span>
            )
          )}
          <span className="msg-head-meta">
            {/* La même nature que sur la ligne de la liste : un fil de
                candidature suit un dossier, un fil libre s’est ouvert sans
                candidature. La pastille le dit, et le titre le détaille. */}
            <span
              className={`msg-pill ${conversation.kind === 'candidature' ? 'msg-pill--tag' : 'msg-pill--free'}`}
              title={conversation.kind === 'candidature' ? t('msg.kindAppHint') : t('msg.kindFreeHint')}
            >
              <i
                className={conversation.kind === 'candidature' ? 'ri-briefcase-line' : 'ri-chat-3-line'}
                aria-hidden="true"
              ></i>
              {conversation.kind === 'candidature' ? t('msg.kindApp') : t('msg.kindFree')}
            </span>
            {/* D’où le fil est né : un fil libre commencé depuis la fiche d’un
                atelier le dit ici, sans avoir à le deviner. */}
            {origine && (
              <span
                className="msg-pill msg-pill--origin"
                title={origine === 'auteur' ? t('msg.originAuteurHint') : t('msg.originFicheHint')}
              >
                <i className={origine === 'auteur' ? 'ri-quill-pen-line' : 'ri-store-2-line'} aria-hidden="true"></i>
                {origine === 'auteur' ? t('msg.originAuteur') : t('msg.originFiche')}
              </span>
            )}
            {firstWhen && firstIso !== lastIso && (
              <time
                className="msg-pill msg-pill--date msg-pill--first"
                dateTime={firstIso}
                title={firstFull}
                aria-label={`${t('msg.firstActivity')} · ${firstFull || firstWhen}`}
              >
                <i className="ri-history-line" aria-hidden="true"></i>
                {firstWhen}
              </time>
            )}
            {spanDays !== null && firstIso !== lastIso && (
              <span className="msg-pill msg-pill--span" title={t('msg.spanHint')}>
                <i className="ri-arrow-left-right-line" aria-hidden="true"></i>
                {spanDays === 0
                  ? t('msg.spanSame')
                  : spanDays === 1
                    ? t('msg.spanOne')
                    : t('msg.spanDays').replace('{n}', String(spanDays))}
              </span>
            )}
            {replyLabel && (
              <span
                className={`msg-pill msg-pill--reply${dort ? ' is-sleep' : ''}`}
                data-slow={dort ? 'yes' : 'no'}
                title={dort ? t('msg.sleepingHint') : t('msg.replyAvgHint')}
              >
                <i className={dort ? 'ri-moon-line' : 'ri-time-line'} aria-hidden="true"></i>
                {dort ? `${t('msg.sleepingOne')} · ${replyLabel}` : replyLabel}
              </span>
            )}
            {lastWhen && (
              <time
                className="msg-pill msg-pill--date"
                dateTime={lastIso}
                title={lastFull}
                aria-label={`${t('msg.lastActivity')} · ${lastFull || lastWhen}`}
              >
                <i className="ri-calendar-event-line" aria-hidden="true"></i>
                {lastWhen}
              </time>
            )}
          </span>
        </div>
      </header>

      {/* La recherche du fil ouvert : elle répond dans l'échange lui-même,
          avec le compte des messages qui portent la phrase, et se retire d'un
          geste. Au-delà de quelques écrans, c'est le seul moyen de relire. */}
      <div className="msg-find">
        <i className="ri-search-line" aria-hidden="true"></i>
        <input
          type="search"
          className="msg-find-input"
          value={find}
          onChange={(event) => setFind(event.target.value)}
          placeholder={t('msg.findPh')}
          aria-label={t('msg.findLabel')}
          title={t('msg.findHint')}
          autoComplete="off"
          maxLength={80}
        />
        {needle && (
          <span className="msg-find-count" aria-live="polite">
            {found.length === 0
              ? t('msg.findNone')
              : `${found.length === 1
                ? t('msg.findOne')
                : t('msg.findCount').replace('{n}', String(found.length))} · ${t('msg.findTotal').replace('{n}', String(rows.length))}`}
          </span>
        )}
        {find && (
          <button
            type="button"
            className="msg-find-clear"
            onClick={() => setFind('')}
            aria-label={t('msg.findClear')}
            title={t('msg.findClear')}
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        )}
      </div>

      <div className="msg-stream">
        {loading && (
          <p className="msg-side-note">
            <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
            {t('msg.loading')}
          </p>
        )}

        {error && !loading && (
          <div className="board-error">
            <i className="ri-plug-line" aria-hidden="true"></i>
            <p>{t('msg.error')}</p>
            <button type="button" className="ghost-btn" onClick={() => void reload()}>
              <i className="ri-refresh-line" aria-hidden="true"></i>
              {t('msg.retry')}
            </button>
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <p className="msg-side-note">{t('msg.emptyThread')}</p>
        )}

        {/* La recherche ne répond rien : le fil le dit, et propose de l'effacer,
            plutôt que de laisser un silence sous le champ. */}
        {!loading && !error && rows.length > 0 && needle && found.length === 0 && (
          <p className="msg-side-note msg-find-empty">
            <i className="ri-search-line" aria-hidden="true"></i>
            {t('msg.findNone')}
            <button type="button" className="link-btn" onClick={() => setFind('')}>
              {t('msg.findClear')}
            </button>
          </p>
        )}

        {grouped.map((group) => (
          <div key={group.key} className="msg-day">
            <span className="msg-day-label">{group.label}</span>
            {group.items.map((row) => {
              const mine = row.sender_id === meId;
              return (
                <div
                  key={row.id}
                  ref={row.id === firstHitId ? firstHitRef : undefined}
                  className={`msg-bubble-row${mine ? ' is-mine' : ''}`}
                >
                  <div className="msg-bubble">
                    <p>{markPhrase(row.corps)}</p>
                    <time dateTime={row.created_at}>
                      {new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(row.created_at))}
                    </time>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="msg-composer">
        <label className="fld-aux" htmlFor="msg-draft">{t('msg.composer')}</label>
        <textarea
          id="msg-draft"
          className="msg-input"
          rows={2}
          maxLength={1500}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('msg.composerPh')}
        />
        <button type="button" className="cta msg-send" onClick={submit} disabled={!draft.trim() || sending}>
          {!sending && t('msg.send')}
          <i className={sending ? 'ri-loader-4-line is-spin' : 'ri-send-plane-line'} aria-hidden="true"></i>
        </button>
        {sendError && <p className="form-msg err msg-composer-err">{sendError}</p>}
        <p className="msg-hint">{t('msg.hint')}</p>
      </div>
    </section>
  );
}