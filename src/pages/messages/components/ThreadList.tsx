import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import {
  enSommeil,
  isUnread,
  partnerOf,
  replyGapLabel,
  shortWhen,
  type ConversationRow,
  type ThreadSort,
} from '@/lib/messaging';
import { REGIONS_MONDE, regionMondeDe, type RegionMondeKey } from '@/lib/worldRegions';
import AireCopyProfile from '@/components/feature/AireCopyProfile';
import ThreadAire from './ThreadAire';

type Props = {
  rows: ConversationRow[];
  activeId: string;
  meId: string;
  loading: boolean;
  /** Le rythme de chaque fil, en millisecondes : l'écart moyen entre un
   *  message et celui qui lui répond. Absent tant que la lecture n'a pas
   *  rendu, ou pour un fil qui n'a pas encore connu de réponse. */
  replyPace: Record<string, number>;
  /** L'ordre retenu : « par aire » range les fils sous le nom de chacune. */
  sort: ThreadSort;
  onPick: (id: string) => void;
  /** Puts a read thread back in the unread pile. */
  onMarkUnread: (id: string) => void;
  /** Le pays de chaque interlocuteur, lu une fois pour toute la liste : il
   *  donne son aire à la ligne du fil. */
  paysById: Record<string, string>;
  /** L'aire sur laquelle la boîte est resserrée, "" quand elle montre tout. */
  aire: RegionMondeKey | '';
  /** Resserrer la boîte sur les fils de la même aire. */
  onPickAire: (key: RegionMondeKey) => void;
};

/** Un groupe de fils sous le nom d'une aire du monde — ou sous celui des
 *  interlocuteurs dont l'aire reste inconnue, qui ferment toujours la marche. */
type Groupe = { cle: string; libelle: string; rows: ConversationRow[] };

export default function ThreadList({
  rows, activeId, meId, loading, replyPace, sort, onPick, onMarkUnread,
  paysById, aire, onPickAire,
}: Props) {
  const { t, lang } = useLang();
  const locale = localeFor(lang);
  /* Le fil que les flèches du clavier mettent en avant : -1 tant qu'aucun ne
     l'est, et la liste elle-même prend le focus pour ce geste. */
  const [keyed, setKeyed] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const idsKey = rows.map((row) => row.id).join(',');

  /* Les fils rangés sous le nom de chaque aire du monde, dans l'ordre des
     aires. Un interlocuteur dont le pays n'est pas connu ne disparaît pas :
     il ferme la liste, sous son propre titre. */
  const groupes = useMemo<Groupe[]>(() => {
    if (sort !== 'aire') return [];
    const seaux = new Map<string, Groupe>();
    REGIONS_MONDE.forEach((region) => {
      seaux.set(region.key, {
        cle: region.key,
        libelle: t(`worldRegion.${region.key}`),
        rows: [],
      });
    });
    const sansAire: Groupe = {
      cle: 'sans-aire',
      libelle: t('msg.aireGroupNone'),
      rows: [],
    };
    rows.forEach((row) => {
      const pays = paysById[partnerOf(row, meId).id] ?? '';
      const region = regionMondeDe(pays);
      const seau = region ? seaux.get(region.key) : sansAire;
      (seau ?? sansAire).rows.push(row);
    });
    const remplis = REGIONS_MONDE
      .map((region) => seaux.get(region.key))
      .filter((groupe): groupe is Groupe => Boolean(groupe) && (groupe as Groupe).rows.length > 0);
    return sansAire.rows.length > 0 ? [...remplis, sansAire] : remplis;
  }, [sort, rows, paysById, meId, t]);

  /* L'ordre que le clavier parcourt : la liste telle qu'elle s'affiche, groupes
     compris — les flèches ne sautent jamais un fil que l'œil voit. */
  const ordonnees = useMemo(
    () => (sort === 'aire' ? groupes.flatMap((groupe) => groupe.rows) : rows),
    [sort, groupes, rows],
  );
  const rangDe = useMemo(() => {
    const map = new Map<string, number>();
    ordonnees.forEach((row, index) => map.set(row.id, index));
    return map;
  }, [ordonnees]);

  /* Une liste qui se resserre ne garde pas un fil qui n'existe plus. */
  useEffect(() => {
    setKeyed(-1);
  }, [idsKey, sort]);

  /* Le fil mis en avant reste sous les yeux : la liste défile juste assez
     pour le garder dans le cadre. */
  useEffect(() => {
    if (keyed < 0) return;
    listRef.current?.querySelector('.is-keyed')?.scrollIntoView({ block: 'nearest' });
  }, [keyed]);

  /**
   * Le même geste que les autres listes du site : les flèches parcourent les
   * fils (le geste boucle d'un bout à l'autre), Entrée ouvre la conversation
   * mise en avant, Échap rend la liste au repos. La touche n'est jamais volée
   * au bouton « marquer comme non lue » qui vit dans la même ligne.
   */
  const onKey = (event: KeyboardEvent<HTMLUListElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.msg-unread-btn')) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (ordonnees.length === 0) return;
      event.preventDefault();
      setKeyed((current) => {
        if (event.key === 'ArrowDown') return current < ordonnees.length - 1 ? current + 1 : 0;
        return current > 0 ? current - 1 : ordonnees.length - 1;
      });
      return;
    }
    if (event.key === 'Enter') {
      const chosen = ordonnees[keyed];
      if (!chosen) return;
      event.preventDefault();
      onPick(chosen.id);
      return;
    }
    if (event.key === 'Escape') setKeyed(-1);
  };

  if (loading) {
    return (
      <p className="msg-side-note">
        <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
        {t('msg.loading')}
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="msg-side-empty">
        <i className="ri-chat-off-line" aria-hidden="true"></i>
        <p>{t('msg.empty')}</p>
        <small>{t('msg.emptyHint')}</small>
      </div>
    );
  }

  /** Une ligne de fil : son nom, sa nature, son aperçu, son rythme, puis son
   *  aire et le geste de copie, chacun avec son propre appui. */
  const ligne = (row: ConversationRow) => {
    const other = partnerOf(row, meId);
    const unread = isUnread(row, meId);
    const canMark = !unread && row.id !== activeId;
    const pays = paysById[other.id] ?? '';
    const region = regionMondeDe(pays);
    const rang = rangDe.get(row.id) ?? 0;
    return (
      <li
        key={row.id}
        className={`msg-thread-item${unread ? ' is-unread' : ''}${rang === keyed ? ' is-keyed' : ''}`}
      >
        {/* La ligne d'un fil n'est plus un seul bouton : l'aire et le geste
            de copie vivent sous lui, chacun avec son propre appui — un
            bouton dans un bouton n'est ni lisible ni cliquable. */}
        <div className={`msg-thread${row.id === activeId ? ' is-on' : ''}${unread ? ' is-unread' : ''}`}>
        <button
          type="button"
          className="msg-thread-hit"
          onClick={() => onPick(row.id)}
          aria-current={row.id === activeId ? 'true' : undefined}
        >
          <span className="msg-avatar" aria-hidden="true">
            {(other.nom || '?').trim().charAt(0).toUpperCase()}
          </span>
          <span className="msg-thread-body">
            <span className="msg-thread-top">
              <b>{other.nom || t('msg.freeThread')}</b>
              <time dateTime={row.last_at}>{shortWhen(row.last_at, locale)}</time>
            </span>
            {/* La nature du fil, sur chaque ligne : venue d’une candidature
                (avec l’offre en clair), ou ouverte librement. Deux teintes
                différentes, deux icônes différentes, et la phrase qui
                explique la nature au survol. */}
            <span
              className={`msg-thread-tag${row.kind === 'candidature' ? ' is-app' : ' is-free'}`}
              title={row.kind === 'candidature' ? t('msg.kindAppHint') : t('msg.kindFreeHint')}
            >
              <i
                className={row.kind === 'candidature' ? 'ri-briefcase-line' : 'ri-chat-3-line'}
                aria-hidden="true"
              ></i>
              {row.kind === 'candidature' ? (row.sujet || t('msg.kindApp')) : t('msg.kindFree')}
            </span>
            <span className="msg-thread-last">{row.last_message || t('msg.emptyThread')}</span>
            {replyPace[row.id] ? (
              <span
                className="msg-thread-pace"
                data-slow={enSommeil(replyPace[row.id]) ? 'yes' : 'no'}
                title={t('msg.replyAvgHint')}
              >
                <i className="ri-time-line" aria-hidden="true"></i>
                {replyGapLabel(replyPace[row.id], t)}
              </span>
            ) : null}
          </span>
        </button>

        {/* L'aire de l'interlocuteur, sous son nom : elle situe le fil dans
            le monde arabe, et sert de porte pour ne garder que les fils de
            cette aire. Le geste de copie se tient à côté, sans ouvrir la
            conversation. */}
        {region && (
          <div className="msg-thread-aire-row">
            <ThreadAire
              region={region}
              active={aire === region.key}
              onPick={() => onPickAire(region.key)}
            />
            <AireCopyProfile
              pays={pays}
              nom={other.nom || t('msg.freeThread')}
              kind="fil"
              className="msg-thread-copy"
            />
          </div>
        )}
        </div>

        {unread ? (
          <span className="msg-dot" aria-label={t('msg.unreadOne')} title={t('msg.unreadOne')} />
        ) : canMark ? (
          <button
            type="button"
            className="msg-unread-btn"
            onClick={() => onMarkUnread(row.id)}
            title={t('msg.markUnread')}
            aria-label={`${t('msg.markUnread')} · ${other.nom || t('msg.freeThread')}`}
          >
            <i className="ri-mail-unread-line" aria-hidden="true"></i>
          </button>
        ) : (
          <span className="msg-thread-slot" aria-hidden="true" />
        )}
      </li>
    );
  };

  return (
    <>
      <p className="msg-keyhint">
        <i className="ri-arrow-up-down-line" aria-hidden="true"></i>
        {t('msg.keyhint')}
      </p>
      <ul
        className="msg-threads"
        ref={listRef}
        tabIndex={0}
        aria-label={t('msg.inbox')}
        onKeyDown={onKey}
      >
      {sort === 'aire' ? (
        groupes.map((groupe) => (
          <Fragment key={groupe.cle}>
            {/* Le nom de l'aire, une fois, au-dessus de ses fils : la liste se
                lit comme les aires du monde, et le compte dit son poids. */}
            <li className="msg-aire-group">
              <i className="ri-map-2-line" aria-hidden="true"></i>
              <b>{groupe.libelle}</b>
              <span>
                {groupe.rows.length === 1
                  ? t('msg.aireGroupOne')
                  : t('msg.aireGroupCount').replace('{n}', String(groupe.rows.length))}
              </span>
            </li>
            {groupe.rows.map((row) => ligne(row))}
          </Fragment>
        ))
      ) : (
        rows.map((row) => ligne(row))
      )}
      </ul>
    </>
  );
}

export function MessagesEmptyPane() {
  const { t } = useLang();
  return (
    <div className="msg-pane-empty">
      <i className="ri-chat-3-line" aria-hidden="true"></i>
      <h2>{t('msg.pick')}</h2>
      <p>{t('msg.pickHint')}</p>
      <Link to="/emplois" className="ghost-btn">
        {t('acct.applyShortcut')}
        <i className="ri-arrow-right-line" aria-hidden="true"></i>
      </Link>
    </div>
  );
}