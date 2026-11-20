import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { langCode, localize } from '@/i18n/localize';
import { useShortlist, type ListKind } from '@/hooks/useShortlist';
import { entreprises, type Entreprise } from '@/mocks/entreprises';
import { auteurs, type Auteur } from '@/mocks/auteurs';
import { paysDe } from '@/lib/pays';
import { motDivision } from '@/lib/division';
import { nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';
import QuoteModal from './QuoteModal';
import ComparePrint from './ComparePrint';
import { buildComparisonCsv, downloadCsv } from './comparisonCsv';
import { useQuoteRef } from '@/hooks/useQuoteRef';
import { saveDossier } from '@/hooks/useDossiers';
import { readRequester } from '@/hooks/useRequester';

type Row<T> = { key: string; label: string; render: (item: T) => ReactNode };

export default function CompareTray({ kind }: { kind: ListKind }) {
  const { t, lang } = useLang();
  const { ids, clear, toggle, max } = useShortlist(kind);
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [requester, setRequester] = useState(() => readRequester());
  const autoOpened = useRef(false);

  /** Drop the whole selection, including the one carried by a shared link. */
  const resetSelection = () => {
    clear();
    setPrintOpen(false);
    setOpen(false);
    if (params.get('list') || params.get('compare') || params.get('ref')) {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('list');
        next.delete('compare');
        next.delete('ref');
        return next;
      }, { replace: true });
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (ids.length === 0) {
      setOpen(false);
      setQuoteOpen(false);
      setPrintOpen(false);
    }
  }, [ids.length]);

  const bizList = kind === 'entreprises'
    ? (ids.map((id) => entreprises.find((e) => e.id === id)).filter(Boolean) as Entreprise[])
    : [];
  const auList = kind === 'auteurs'
    ? (ids.map((id) => auteurs.find((a) => a.id === id)).filter(Boolean) as Auteur[])
    : [];
  const ownRef = useQuoteRef(kind, ids);
  /** A shared dossier keeps the reference it was sent with, even on another device. */
  const reference = params.get('ref') || ownRef;

  useEffect(() => {
    if (open) setRequester(readRequester());
  }, [open]);

  /** A request sent from the panel immediately names its author on the dossier. */
  useEffect(() => {
    if (!quoteOpen) setRequester(readRequester());
  }, [quoteOpen]);

  /** A pasted dossier link lands straight in the comparison, not only in the bar. */
  useEffect(() => {
    if (autoOpened.current) return;
    if (params.get('compare') !== '1' || ids.length === 0) return;
    autoOpened.current = true;
    setOpen(true);
  }, [params, ids.length]);

  const closePanel = () => {
    setOpen(false);
    if (!params.get('compare') && !params.get('ref')) return;
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('compare');
      next.delete('ref');
      return next;
    }, { replace: true });
  };

  /** Any dossier actually used — opened, printed or quoted — joins "Mes dossiers". */
  useEffect(() => {
    if (!reference || ids.length === 0) return;
    if (!open && !printOpen && !quoteOpen) return;
    const names = kind === 'entreprises'
      ? (ids.map((id) => entreprises.find((e) => e.id === id)?.name).filter(Boolean) as string[])
      : (ids.map((id) => auteurs.find((a) => a.id === id)?.name).filter(Boolean) as string[]);
    saveDossier({ ref: reference, kind, ids, names });
  }, [open, printOpen, quoteOpen, reference, ids, kind]);

  if (ids.length === 0) return null;

  const exportCsv = () => {
    const csv = buildComparisonCsv({ kind, biz: bizList, people: auList, lang, reference, t });
    downloadCsv(`PaperAtlas-comparaison-${reference || 'selection'}.csv`, csv);
  };

  const names = kind === 'entreprises'
    ? bizList.map((e) => e.name)
    : auList.map((a) => a.name);

  /* The row is named the way the compared profiles name their division: the
     country’s own word when the whole dossier comes from one country, a
     neutral « region / wilaya » when two countries sit side by side. */
  const comparedPays = Array.from(new Set(
    (kind === 'entreprises' ? bizList : auList).map((row) => paysDe(row)),
  ));
  const divisionLabel = comparedPays.length === 1
    ? motDivision(comparedPays[0], lang)
    : t('csv.division');

  const rows: Row<Entreprise>[] = [
    { key: 'trade', label: t('dir.trade'), render: (e) => t(`trade.${e.trade}`) },
    { key: 'wilaya', label: divisionLabel, render: (e) => `${nomRegion(e.wilaya, lang)} · ${nomCommune(e.commune, lang)}` },
    { key: 'since', label: t('pro.since'), render: (e) => String(e.since) },
    { key: 'staff', label: t('pro.staff'), render: (e) => String(e.staff) },
    { key: 'rating', label: t('pro.rating'), render: (e) => `${e.rating.toFixed(1)} (${e.reviews})` },
    { key: 'capacity', label: t('pro.capacity'), render: (e) => localize(e.capacity, lang) },
    { key: 'services', label: t('pro.services'), render: (e) => e.services.map((s) => localize(s, lang)).slice(0, 3).join(' · ') },
    { key: 'certs', label: t('pro.certs'), render: (e) => e.certs.join(' · ') },
    { key: 'contact', label: t('pro.contact'), render: (e) => <a href={`mailto:${e.email}`}>{e.email}</a> },
  ];

  const authorRows: Row<Auteur>[] = [
    { key: 'genre', label: t('auth.genre'), render: (a) => a.genres.map((g) => t(`genre.${g}`)).join(' · ') },
    { key: 'wilaya', label: divisionLabel, render: (a) => `${nomRegion(a.wilaya, lang)} · ${nomCommune(a.commune, lang)}` },
    { key: 'since', label: t('auth.since'), render: (a) => String(a.since) },
    { key: 'lang', label: t('auth.languages'), render: (a) => a.languages.join(' · ') },
    { key: 'books', label: t('auth.works'), render: (a) => `${a.books.length} ${t('auth.worksCount')} — ${localize(a.books[0].title, lang)}` },
    { key: 'status', label: t('auth.avail'), render: (a) => `${t(`auth.status${a.status === 'open' ? 'Open' : a.status === 'project' ? 'Project' : 'Full'}`)} · ${localize(a.availableFrom, lang)}` },
    { key: 'contact', label: t('auth.contact'), render: (a) => <a href={`mailto:${a.email}`}>{a.email}</a> },
  ];

  const columns = kind === 'entreprises' ? bizList.length : auList.length;
  /** Le nombre de colonnes comparées, lu par la feuille de mesure : le cadre
   *  de la grille se referme sur celui du panneau, jamais au-delà. À trois ou
   *  quatre profils, l'intitulé de la ligne cède un peu de sa largeur pour que
   *  chaque colonne garde la sienne — la mesure tient jusqu'au quatrième. */
  const labelWidth = columns >= 4 ? '68px' : columns === 3 ? '78px' : '86px';
  const tableStyle = { '--cmp-cols': columns, '--cmp-label': labelWidth } as CSSProperties;

  return (
    <>
      <div className="cmp-bar" role="region" aria-label={t('cmp.title')}>
        <span className="cmp-bar-label"><i className="ri-layout-column-line" aria-hidden="true"></i>{t('cmp.bar')}</span>
        <ul className="cmp-chips">
          {names.map((name, i) => (
            <li className="cmp-chip" key={`${name}-${i}`}>
              <span className="cmp-chip-name">{name}</span>
              <button type="button" onClick={() => toggle(ids[i])} aria-label={`${t('cmp.remove')} ${name}`}>
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            </li>
          ))}
        </ul>
        <span className="cmp-bar-count">{ids.length}/{max}</span>
        <div className="cmp-acts">
          <button type="button" className="cmp-go" onClick={() => setOpen(true)}>
            {t('cmp.compare')} <i className="ri-arrow-up-line" aria-hidden="true"></i>
          </button>
          {kind === 'entreprises' && (
            <button type="button" className="cmp-quote" onClick={() => setQuoteOpen(true)}>
              <i className="ri-file-list-3-line" aria-hidden="true"></i>{t('quote.cta')}
            </button>
          )}
          <button type="button" className="cmp-reset" onClick={resetSelection} title={t('cmp.reset')}>
            <i className="ri-eraser-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('cmp.reset')}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="cmp-modal" role="dialog" aria-modal="true" aria-label={t('cmp.title')} onClick={closePanel}>
          <div className="cmp-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cmp-panel-head">
              <div className="cmp-head-title">
                <h2>{t('cmp.title')}</h2>
                {reference && <span className="cmp-ref">{reference}</span>}
                <span className="cmp-lang" title={t('lang.doc')} aria-label={t('lang.doc')}>{langCode(lang)}</span>
                {requester.name && (
                  <span className="cmp-prepared" title={requester.org || undefined}>
                    <i className="ri-user-line" aria-hidden="true"></i>
                    <span className="cmp-prepared-label">{t('cmp.preparedBy')}</span>
                    {requester.name}
                  </span>
                )}
              </div>
              <div className="cmp-head-actions">
                {columns >= 1 && (
                  <button type="button" className="cmp-print" onClick={exportCsv}>
                    <i className="ri-file-excel-2-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t('csv.cta')}</span>
                  </button>
                )}
                {columns >= 2 && (
                  <button type="button" className="cmp-print" onClick={() => setPrintOpen(true)}>
                    <i className="ri-printer-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t('print.cta')}</span>
                  </button>
                )}
                <button type="button" className="cmp-close" onClick={closePanel} aria-label={t('cmp.close')}>
                  <i className="ri-close-line" aria-hidden="true"></i>
                </button>
              </div>
            </div>

            {columns < 2 ? (
              <p className="cmp-hint">{t('cmp.hint')}</p>
            ) : kind === 'entreprises' ? (
              <div className="cmp-table">
                <div className="cmp-row cmp-row--head" style={tableStyle}>
                  <span className="cmp-label" />
                  {bizList.map((e) => (
                    <div className="cmp-colhead" key={e.id}>
                      {/* La première vue de l'atelier, comme la plume montre son
                          portrait : la colonne se reconnaît avant d'être lue. */}
                      <img
                        className="cmp-photo"
                        src={e.photos[0]}
                        alt={`${e.name} · ${t(`trade.${e.trade}`)}`}
                        title={`${e.name} · ${t(`trade.${e.trade}`)}`}
                        width={1200}
                        height={900}
                      />
                      <Link to={`/entreprise/${e.id}`}>{e.name}</Link>
                      <span className="cmp-where">{nomRegion(e.wilaya, lang)}</span>
                    </div>
                  ))}
                </div>
                {rows.map((row) => (
                  <div className="cmp-row" key={row.key} style={tableStyle}>
                    <span className="cmp-label">{row.label}</span>
                    {bizList.map((e) => <span className="cmp-cell" key={`${row.key}-${e.id}`}>{row.render(e)}</span>)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="cmp-table">
                <div className="cmp-row cmp-row--head" style={tableStyle}>
                  <span className="cmp-label" />
                  {auList.map((a) => (
                    <div className="cmp-colhead" key={a.id}>
                      <img className="cmp-portrait" src={a.portrait} alt={a.name} title={a.name} width={800} height={800} />
                      <Link to={`/auteur/${a.id}`}>{a.name}</Link>
                      <span className="cmp-where">{nomRegion(a.wilaya, lang)}</span>
                    </div>
                  ))}
                </div>
                {authorRows.map((row) => (
                  <div className="cmp-row" key={row.key} style={tableStyle}>
                    <span className="cmp-label">{row.label}</span>
                    {auList.map((a) => <span className="cmp-cell" key={`${row.key}-${a.id}`}>{row.render(a)}</span>)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {quoteOpen && kind === 'entreprises' && (
        <QuoteModal items={bizList} reference={reference} onClose={() => setQuoteOpen(false)} />
      )}

      {printOpen && (
        <ComparePrint
          kind={kind}
          biz={bizList}
          people={auList}
          reference={reference}
          onClose={() => setPrintOpen(false)}
        />
      )}
    </>
  );
}