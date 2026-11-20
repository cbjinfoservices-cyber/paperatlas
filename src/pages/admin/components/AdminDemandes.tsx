import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { supabase } from '@/lib/supabase';
import { jour } from './adminTypes';
import { downloadDemandesCsv, type PeriodeDemandes } from './adminDemandesCsv';
import { ecranDemande } from './adminDemandesEcran';
import { readFiltreDemandes, saveFiltreDemandes } from './adminDemandesMemory';
import AdminDemandeReponse from './AdminDemandeReponse';
import AdminDemandesSemaines from './AdminDemandesSemaines';
import './admin-demandes.css';

/** Une demande reçue par le formulaire de contact, réduite à ce que la console
 *  affiche : qui a écrit, sur quel sujet, et ce que le message disait. */
type DemandeForm = {
  id: number;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  sujet: string;
  profil: string;
  organisation: string;
  message: string;
  traitee: boolean;
  created_at: string;
};

/** Un sujet et ses deux chiffres : reçues sur la période, et restant à traiter. */
type Tally = { sujet: string; n: number; reste: number };

const PERIODES: PeriodeDemandes[] = ['mois', 'jours30', 'tout'];

/**
 * Les demandes reçues, comptées par sujet, sur la période choisie. Le chiffre
 * se lit avant le détail : savoir que « Devis » pèse deux fois plus que
 * « Inscription » se voit d'un coup d'œil, sans ouvrir un seul message.
 *
 * Chaque ligne se referme d'un geste : « traitée » sort la demande de la file
 * sans effacer le message, et la remet si l'on s'est trompé. Le classeur, lui,
 * emporte toute la période pour le secrétariat.
 */
export default function AdminDemandes() {
  const { t, lang } = useLang();
  /* La console rouvre dans l'état où on l'a laissée : la période et le jeton
     « file à traiter » sont relus depuis l'appareil. */
  const garde = useMemo(() => readFiltreDemandes(), []);
  const [periode, setPeriode] = useState<PeriodeDemandes>(garde.periode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [aTraiter, setATraiter] = useState(0);
  const [traitees, setTraitees] = useState(0);
  const [parSujet, setParSujet] = useState<Tally[]>([]);
  const [rows, setRows] = useState<DemandeForm[]>([]);
  /* La file seule : le jeton ne cache rien, il resserre la liste et le
     compteur sur ce qui attend encore une réponse. */
  const [todoOnly, setTodoOnly] = useState(garde.todoOnly);
  const [busy, setBusy] = useState<number | null>(null);
  /* La demande dont on prépare la réponse, ouverte au-dessus de la console. */
  const [reponse, setReponse] = useState<DemandeForm | null>(null);
  const [exporting, setExporting] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setNote('');
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke('admin-console', {
        body: { action: 'demandes-form', periode },
      });
      const payload = answer as
        | {
            ok?: boolean;
            total?: number;
            aTraiter?: number;
            traitees?: number;
            parSujet?: Tally[];
            rows?: DemandeForm[];
          }
        | null;
      if (failure || !payload?.ok) {
        setError(t('adm.error'));
        return;
      }
      setTotal(payload.total ?? 0);
      setATraiter(payload.aTraiter ?? 0);
      setTraitees(payload.traitees ?? 0);
      setParSujet(payload.parSujet ?? []);
      setRows(payload.rows ?? []);
    } catch {
      setError(t('adm.error'));
    } finally {
      setLoading(false);
    }
  }, [periode, t]);

  useEffect(() => {
    void load();
  }, [load]);

  /* Chaque clic sur la période ou sur la file laisse une trace : la prochaine
     visite retrouve le même cadrage, sans rien décocher. */
  useEffect(() => {
    saveFiltreDemandes({ periode, todoOnly });
  }, [periode, todoOnly]);

  /* Les sujets arrivent par identifiant — stable d'une langue à l'autre — et
     se lisent ici dans la langue de la console. Une valeur inconnue, venue
     d'un ancien envoi, garde son texte tel quel. */
  const SUJETS = ['devis', 'inscription', 'soustraitance'];
  const nomSujet = (sujet: string) => {
    if (!sujet) return t('adm.noSubject');
    return SUJETS.includes(sujet) ? t(`cf.subject.${sujet}`) : sujet;
  };

  /* Le chiffre lu sur chaque carte : les demandes reçues, ou celles qui
     restent à traiter quand le jeton de la file est allumé. */
  const mesure = (ligne: Tally) => (todoOnly ? ligne.reste : ligne.n);

  /* Le plus gros sujet donne l'échelle des barres : chaque part se lit par
     rapport à lui, jamais à un total qui changerait à chaque envoi. */
  const plus = useMemo(
    () =>
      parSujet.reduce(
        (haut, ligne) => Math.max(haut, todoOnly ? ligne.reste : ligne.n),
        0,
      ),
    [parSujet, todoOnly],
  );

  const baseAffichee = todoOnly ? aTraiter : total;
  const visibles = todoOnly ? rows.filter((row) => !row.traitee) : rows;

  /* Le geste de la ligne : elle sort de la file, ou y rentre. Le serveur décide
     de l'état enregistré, la console ne fait que le suivre — jamais l'inverse. */
  const basculer = async (row: DemandeForm) => {
    const cible = !row.traitee;
    setBusy(row.id);
    setNote('');
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke('admin-console', {
        body: { action: 'demande-etat', id: row.id, traitee: cible },
      });
      const payload = answer as
        | { ok?: boolean; demande?: { id: number; traitee: boolean } }
        | null;
      if (failure || !payload?.ok || !payload.demande) {
        setNote(t('adm.markError'));
        return;
      }
      const etat = Boolean(payload.demande.traitee);
      setRows((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, traitee: etat } : item)),
      );
      setATraiter((n) => Math.max(0, n + (etat ? -1 : 1)));
      setTraitees((n) => Math.max(0, n + (etat ? 1 : -1)));
      setParSujet((prev) =>
        prev.map((ligne) =>
          ligne.sujet === row.sujet
            ? { ...ligne, reste: Math.max(0, ligne.reste + (etat ? -1 : 1)) }
            : ligne,
        ),
      );
    } catch {
      setNote(t('adm.markError'));
    } finally {
      setBusy(null);
    }
  };

  /* Le classeur reprend la période entière, pas les seules lignes affichées :
     le secrétariat doit pouvoir tout reprendre depuis le début. */
  const exporter = async () => {
    setExporting(true);
    setNote('');
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke('admin-console', {
        body: { action: 'demandes-export', periode },
      });
      const payload = answer as { ok?: boolean; rows?: DemandeForm[] } | null;
      if (failure || !payload?.ok || !payload.rows) {
        setNote(t('adm.csvError'));
        return;
      }
      downloadDemandesCsv({
        rows: payload.rows,
        periode,
        lang,
        t,
        nomSujet,
      });
    } catch {
      setNote(t('adm.csvError'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="admin-card admin-demandes">
      <div className="admin-card-head">
        <div>
          <p className="admin-stamp">{t('adm.stamp')}</p>
          <p className="admin-sub">{t('adm.sub')}</p>
        </div>
        <div className="admin-tools">
          <button type="button" className="admin-btn" onClick={() => void load()}>
            <i className="ri-refresh-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('adm.refresh')}</span>
          </button>
          <button
            type="button"
            className="admin-btn"
            data-tone="accent"
            disabled={exporting || total === 0}
            title={t('adm.csvHint')}
            onClick={() => void exporter()}
          >
            <i
              className={exporting ? 'ri-loader-4-line is-spin' : 'ri-file-text-line'}
              aria-hidden="true"
            ></i>
            <span className="whitespace-nowrap">
              {exporting ? t('adm.csvBusy') : t('adm.csv')}
            </span>
            <b className="admin-focus-count">{total}</b>
          </button>
        </div>
      </div>

      {/* La période borne le compteur et le classeur : les deux lisent la même
          fenêtre, jamais l'une en mois et l'autre depuis toujours. */}
      <div className="admin-demandes-filters">
        <div className="admin-demandes-filter-group">
          <span className="admin-demandes-filter-label">{t('adm.periodLabel')}</span>
          <div className="admin-chips" role="group" aria-label={t('adm.periodLabel')}>
            {PERIODES.map((valeur) => (
              <button
                key={valeur}
                type="button"
                className="admin-chip"
                data-on={periode === valeur ? 'yes' : 'no'}
                aria-pressed={periode === valeur}
                onClick={() => setPeriode(valeur)}
              >
                {t(`adm.period.${valeur}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="admin-demandes-filter-group">
          <button
            type="button"
            className="admin-chip"
            data-tone="warn"
            data-on={todoOnly ? 'yes' : 'no'}
            aria-pressed={todoOnly}
            title={t('adm.todoHint')}
            onClick={() => setTodoOnly((valeur) => !valeur)}
          >
            <i className="ri-inbox-unarchive-line" aria-hidden="true"></i>
            {t('adm.todoChip')}
            <b>{aTraiter}</b>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="admin-loading">
          <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
          {t('adm.loading')}
        </p>
      ) : error ? (
        <div className="admin-empty">
          <p>{error}</p>
          <button type="button" className="admin-btn" onClick={() => void load()}>
            <i className="ri-refresh-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('adm.retry')}</span>
          </button>
        </div>
      ) : (
        <>
          <div className="admin-stats">
            <div className="admin-stat">
              <b>{baseAffichee}</b>
              <span>{t('adm.total')}</span>
            </div>
            <div className="admin-stat" data-tone="accent">
              <b>{aTraiter}</b>
              <span>{t('adm.todoCount')}</span>
            </div>
            <div className="admin-stat" data-tone="ok">
              <b>{traitees}</b>
              <span>{t('adm.doneCount')}</span>
            </div>
          </div>

          {/* Sous le compteur, le rythme : huit semaines de barres et le mois
              en cours comparé au précédent. */}
          <AdminDemandesSemaines />

          {parSujet.length === 0 ? (
            <p className="admin-empty">
              <i className="ri-inbox-line" aria-hidden="true"></i>
              {t('adm.none')}
            </p>
          ) : (
            <ul className="admin-demandes-tally">
              {parSujet.map((ligne) => {
                const valeur = mesure(ligne);
                const part = plus > 0 ? Math.round((valeur / plus) * 100) : 0;
                const share = baseAffichee > 0 ? Math.round((valeur / baseAffichee) * 100) : 0;
                return (
                  <li key={ligne.sujet || 'sans'} className="admin-demandes-tally-row">
                    <span className="admin-demandes-tally-head">
                      <span className="admin-demandes-tally-name">{nomSujet(ligne.sujet)}</span>
                      <span className="admin-demandes-tally-n">
                        {valeur}
                        <small>{share}%</small>
                      </span>
                    </span>
                    <span
                      className="admin-demandes-bar"
                      role="img"
                      aria-label={`${nomSujet(ligne.sujet)} · ${valeur} · ${share}%`}
                    >
                      <span className="admin-demandes-bar-fill" style={{ width: `${part}%` }}></span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {note && (
            <p className="admin-note" data-ok="no" role="status">
              <i className="ri-error-warning-line" aria-hidden="true"></i>
              {note}
            </p>
          )}

          <div className="admin-demandes-recent-head">
            <h3 className="admin-demandes-recent">{t('adm.recent')}</h3>
            <span className="admin-demandes-recent-note">{t('adm.recentNote')}</span>
          </div>

          {visibles.length === 0 ? (
            <p className="admin-empty">
              <i className={todoOnly ? 'ri-check-double-line' : 'ri-inbox-line'} aria-hidden="true"></i>
              {todoOnly ? t('adm.noneTodo') : t('adm.none')}
            </p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table admin-table-cards admin-demandes-table">
                <thead>
                  <tr>
                    <th scope="col">{t('adm.colDate')}</th>
                    <th scope="col">{t('adm.colName')}</th>
                    <th scope="col">{t('adm.colSubject')}</th>
                    <th scope="col">{t('adm.colMessage')}</th>
                    <th scope="col">{t('adm.colEtat')}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((row) => {
                    const working = busy === row.id;
                    /* La porte du guichet qui a produit la demande : le
                       secrétariat retrouve la page du visiteur d'un clic,
                       dans un autre onglet, sans la retaper. */
                    const ecran = ecranDemande(row.sujet);
                    return (
                      <tr key={row.id} data-done={row.traitee ? 'yes' : 'no'}>
                        <td className="admin-num" data-label={t('adm.colDate')}>{jour(row.created_at, lang)}</td>
                        <td>
                          <span className="admin-journal-compte">{row.nom || '—'}</span>
                          {row.email && <span className="admin-mail">{row.email}</span>}
                          {row.organisation && (
                            <span className="admin-mail">{row.organisation}</span>
                          )}
                        </td>
                        <td data-label={t('adm.colSubject')}>
                          <span className="admin-sujet-chip">{nomSujet(row.sujet)}</span>
                          <Link
                            className="admin-demandes-open"
                            to={ecran}
                            target="_blank"
                            rel="noreferrer"
                            title={`${t('ad.suivi.rlOpenHint')} · ${ecran}`}
                          >
                            <i className="ri-external-link-line" aria-hidden="true"></i>
                            <span className="whitespace-nowrap">{t('ad.suivi.rlOpen')}</span>
                          </Link>
                        </td>
                        <td data-label={t('adm.colMessage')}>
                          <span className="admin-demandes-msg">{row.message || '—'}</span>
                        </td>
                        <td data-label={t('adm.colEtat')}>
                          <div className="admin-demandes-etat">
                            <span
                              className="admin-sujet-state"
                              data-done={row.traitee ? 'yes' : 'no'}
                            >
                              {row.traitee ? t('adm.done') : t('adm.todo')}
                            </span>
                            <button
                              type="button"
                              className="admin-demandes-reply"
                              disabled={!row.email}
                              title={row.email ? t('adm.replyHint') : t('adm.reply.noEmail')}
                              aria-label={t('adm.reply')}
                              onClick={() => setReponse(row)}
                            >
                              <i className="ri-reply-line" aria-hidden="true"></i>
                            </button>
                            <button
                              type="button"
                              className="admin-demandes-mark"
                              data-done={row.traitee ? 'yes' : 'no'}
                              disabled={working}
                              title={
                                row.traitee ? t('adm.markTodoHint') : t('adm.markDoneHint')
                              }
                              aria-label={
                                row.traitee ? t('adm.markTodoHint') : t('adm.markDoneHint')
                              }
                              onClick={() => void basculer(row)}
                            >
                              <i
                                className={
                                  working
                                    ? 'ri-loader-4-line is-spin'
                                    : row.traitee
                                      ? 'ri-arrow-go-back-line'
                                      : 'ri-check-line'
                                }
                                aria-hidden="true"
                              ></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {reponse && (
        <AdminDemandeReponse
          nom={reponse.nom}
          email={reponse.email}
          organisation={reponse.organisation}
          sujet={reponse.sujet}
          sujetLabel={nomSujet(reponse.sujet)}
          message={reponse.message}
          created_at={reponse.created_at}
          onClose={() => setReponse(null)}
        />
      )}

      <p className="admin-muted admin-journal-note">{t('adm.note')}</p>
    </section>
  );
}