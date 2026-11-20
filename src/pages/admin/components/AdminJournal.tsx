import { useEffect, useMemo, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { supabase } from '@/lib/supabase';
import { enSommeil, replyGapLabel } from '@/lib/messaging';
import { dureeEnMots, resumerVisite, type RevueJournalRow } from './adminClientsXlsx';
import { oublierRevus, readOuverture, readOuvertures, readRevus } from './adminReviewMemory';
import { nombre, type AdminConversation, type AdminOverview } from './adminTypes';

type Props = {
  data: AdminOverview;
  /** Ouvre le fil dans la messagerie : la ligne du journal ramène au travail
   *  plutôt que de le recopier. */
  onOpenThread: (conversationId: string) => void;
};

/** Une ligne du journal à l'écran : ce que le classeur écrit, plus
 *  l'identifiant du fil pour pouvoir l'ouvrir d'un clic. */
type Ligne = RevueJournalRow & { id: string };

/**
 * Le journal de la revue, lu dans la console : les fils dormants ouverts
 * pendant la visite, dans l'ordre des ouvertures, avec l'heure, les minutes
 * depuis la première ouverture, le délai de réponse et le dernier message.
 *
 * Il se lit sur la même mémoire de session que la messagerie et que l'onglet
 * du classeur : ce que l'écran montre, le fichier le dit, et la durée de la
 * visite se lit ici sans rien télécharger.
 */
export default function AdminJournal({ data, onOpenThread }: Props) {
  const { t, lang } = useLang();
  const [paces, setPaces] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  /* Les repères de session : relus au montage, effacés par la gomme. */
  const [revus, setRevus] = useState<string[]>(() => readRevus());
  const [ouvertures, setOuvertures] = useState<Record<string, string>>(() =>
    readOuvertures(),
  );

  const idsKey = data.conversations.map((row) => row.id).join(',');

  useEffect(() => {
    if (!idsKey) {
      setPaces({});
      setReady(true);
      return undefined;
    }
    let alive = true;
    setReady(false);
    const load = async () => {
      try {
        const { data: answer, error: failure } = await supabase.functions.invoke(
          'admin-console',
          { body: { action: 'paces', conversationIds: idsKey.split(',') } },
        );
        const payload = answer as { ok?: boolean; paces?: Record<string, number> } | null;
        if (failure || !payload?.ok) return;
        if (alive) setPaces(payload.paces ?? {});
      } catch {
        /* Le rythme n'est qu'une aide : le journal reste lisible sans lui. */
      } finally {
        if (alive) setReady(true);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [idsKey]);

  /* Le nom et l'adresse de chaque compte, par identifiant : la colonne
     « Compte » du journal les reprend tels quels, sans ouvrir la fiche. */
  const nomsParId = useMemo(() => {
    const map = new Map<string, string>();
    data.comptes.forEach((row) => {
      const nom = row.organisme || row.nom || '';
      if (row.id && nom) map.set(row.id, nom);
    });
    data.abonnements.forEach((row) => {
      const nom = row.entreprise || '';
      if (row.artisan_id && nom && !map.has(row.artisan_id)) map.set(row.artisan_id, nom);
    });
    return map;
  }, [data.comptes, data.abonnements]);

  const mailsParId = useMemo(() => {
    const map = new Map<string, string>();
    data.comptes.forEach((row) => {
      const mail = (row.email || '').trim();
      if (row.id && mail) map.set(row.id, mail);
    });
    data.abonnements.forEach((row) => {
      const mail = (row.email || '').trim();
      if (row.artisan_id && mail && !map.has(row.artisan_id)) map.set(row.artisan_id, mail);
    });
    return map;
  }, [data.comptes, data.abonnements]);

  const nomDuFil = (row: AdminConversation) => {
    const noms: string[] = [];
    [row.user_a, row.user_b].forEach((id) => {
      if (!id) return;
      const nom = nomsParId.get(id) || '';
      if (nom && !noms.includes(nom)) noms.push(nom);
    });
    return noms.join(' · ');
  };

  const mailDuFil = (row: AdminConversation) => {
    const mails: string[] = [];
    [row.user_a, row.user_b].forEach((id) => {
      if (!id) return;
      const mail = mailsParId.get(id) || '';
      if (mail && !mails.includes(mail)) mails.push(mail);
    });
    return mails.join(' · ');
  };

  /* Le journal suit l'ordre des ouvertures : il se lit comme la revue s'est
     faite, pas comme la liste se range. Une ligne sans instant lisible ferme
     la marche plutôt que de fausser l'heure. */
  const lignes = useMemo(() => {
    if (!ready) return [] as Ligne[];
    const out: Ligne[] = [];
    revus.forEach((id) => {
      const row = data.conversations.find((entry) => entry.id === id);
      if (!row || !enSommeil(paces[row.id])) return;
      out.push({
        id: row.id,
        nom: [row.nom_a, row.nom_b].filter(Boolean).join(' ↔ ') || row.sujet || '—',
        compte: nomDuFil(row),
        mail: mailDuFil(row),
        ouvertAt: ouvertures[id] || readOuverture(id),
        gap: paces[row.id] ?? 0,
        lastAt: row.last_at ?? null,
      });
    });
    return out.sort((a, b) => {
      const aStamp = new Date(a.ouvertAt).getTime();
      const bStamp = new Date(b.ouvertAt).getTime();
      const aOk = Number.isFinite(aStamp);
      const bOk = Number.isFinite(bStamp);
      if (!aOk && !bOk) return 0;
      if (!aOk) return 1;
      if (!bOk) return -1;
      return aStamp - bStamp;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, revus, ouvertures, data.conversations, paces, nomsParId, mailsParId]);

  /* Les bornes de la visite et la colonne des minutes partent de la même
     mesure : le bas du journal ne peut pas contredire ses lignes. */
  const visite = resumerVisite(lignes);
  const heureLabel = new Intl.DateTimeFormat(localeFor(lang), {
    hour: '2-digit',
    minute: '2-digit',
  });
  const momentLabel = new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const heureDe = (stamp: string | null) => {
    if (!stamp) return '';
    const value = new Date(stamp);
    if (!Number.isFinite(value.getTime())) return '';
    return heureLabel.format(value);
  };
  const momentDe = (stamp: string | null) => {
    if (!stamp) return '';
    const value = new Date(stamp);
    if (!Number.isFinite(value.getTime())) return '';
    return momentLabel.format(value);
  };
  const minutesDepuisDebut = (stamp: string) => {
    if (!stamp || visite.debut === null) return '';
    const value = new Date(stamp).getTime();
    if (!Number.isFinite(value)) return '';
    return String(Math.max(0, Math.round((value - visite.debut) / 60000)));
  };

  const effacer = () => {
    setRevus(oublierRevus());
    setOuvertures({});
  };

  return (
    <section className="admin-card admin-journal">
      <div className="admin-card-head">
        <div>
          <p className="admin-stamp">{t('ad.journal.stamp')}</p>
          <p className="admin-sub">{t('ad.journal.sub')}</p>
        </div>
        <div className="admin-tools">
          {lignes.length > 0 && (
            <button
              type="button"
              className="admin-btn"
              data-tone="accent"
              title={t('ad.journal.clearHint')}
              onClick={effacer}
            >
              <i className="ri-eraser-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ad.journal.clear')}</span>
            </button>
          )}
        </div>
      </div>

      {!ready ? (
        <p className="admin-loading">
          <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
          {t('ad.journal.stamp')}
        </p>
      ) : lignes.length === 0 ? (
        <p className="admin-empty">
          <i className="ri-file-list-2-line" aria-hidden="true"></i>
          {t('ad.journal.empty')}
        </p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table admin-journal-table">
              <thead>
                <tr>
                  <th scope="col">{t('ad.xls.reviewJournalN')}</th>
                  <th scope="col">{t('ad.xls.reviewJournalThread')}</th>
                  <th scope="col">{t('ad.xls.reviewJournalCompte')}</th>
                  <th scope="col">{t('ad.xls.reviewJournalTime')}</th>
                  <th scope="col">{t('ad.xls.reviewJournalSince')}</th>
                  <th scope="col">{t('ad.xls.reviewJournalGap')}</th>
                  <th scope="col">{t('ad.xls.reviewJournalLast')}</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((row, index) => (
                  <tr key={row.id}>
                    <td className="admin-num">{index + 1}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-journal-thread"
                        title={t('ad.journal.openHint')}
                        aria-label={`${t('ad.journal.openHint')} · ${row.nom}`}
                        onClick={() => onOpenThread(row.id)}
                      >
                        <i className="ri-chat-3-line" aria-hidden="true"></i>
                        <span className="admin-journal-thread-name">{row.nom}</span>
                        <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
                      </button>
                    </td>
                    <td>
                      <span className="admin-journal-compte">{row.compte || '—'}</span>
                      {row.mail && <span className="admin-mail">{row.mail}</span>}
                    </td>
                    <td className="admin-num">{heureDe(row.ouvertAt) || '—'}</td>
                    <td className="admin-num">{minutesDepuisDebut(row.ouvertAt) || '0'}</td>
                    <td>{replyGapLabel(row.gap, t) || '—'}</td>
                    <td className="admin-num">{momentDe(row.lastAt) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Le bas du journal : la visite elle-même, sur les mêmes bornes que
              la colonne des minutes et que la synthèse du classeur. */}
          <div className="admin-revue-visite">
            <div className="admin-revue-visite-facts">
              <span className="admin-revue-visite-fact">
                <span className="admin-revue-visite-key">
                  {t('ad.xls.reviewJournalReviewed')}
                </span>
                <span className="admin-revue-visite-val">{nombre(visite.relus)}</span>
              </span>
              <span className="admin-revue-visite-fact">
                <span className="admin-revue-visite-key">
                  {t('ad.xls.reviewJournalFirstOpen')}
                </span>
                <span className="admin-revue-visite-val">
                  {visite.debut === null
                    ? '—'
                    : heureDe(new Date(visite.debut).toISOString()) || '—'}
                </span>
              </span>
              <span className="admin-revue-visite-fact">
                <span className="admin-revue-visite-key">
                  {t('ad.xls.reviewJournalLastOpen')}
                </span>
                <span className="admin-revue-visite-val">
                  {visite.fin === null
                    ? '—'
                    : heureDe(new Date(visite.fin).toISOString()) || '—'}
                </span>
              </span>
              <span className="admin-revue-visite-fact">
                <span className="admin-revue-visite-key">
                  {t('ad.xls.reviewJournalSpan')}
                </span>
                <span className="admin-revue-visite-val">
                  {dureeEnMots(visite.minutes, t) || '—'}
                </span>
              </span>
            </div>
          </div>
        </>
      )}

      <p className="admin-muted admin-journal-note">{t('ad.journal.note')}</p>
    </section>
  );
}