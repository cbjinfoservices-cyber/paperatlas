import { useEffect, useMemo } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { langCode, localize, localeFor } from '@/i18n/localize';
import { useQuoteRef } from '@/hooks/useQuoteRef';
import { readRequester } from '@/hooks/useRequester';
import type { ListKind } from '@/hooks/useShortlist';
import type { Entreprise } from '@/mocks/entreprises';
import type { Auteur } from '@/mocks/auteurs';
import { nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';
import { buildComparisonCsv, downloadCsv } from './comparisonCsv';

type Block = {
  id: string;
  mark: string;
  name: string;
  sub: string;
  rows: { label: string; value: string }[];
};

type Props = {
  kind: ListKind;
  biz: Entreprise[];
  people: Auteur[];
  reference?: string;
  onClose: () => void;
};

/**
 * Paper-style recap of the shortlist, meant to be printed (or saved as PDF)
 * and attached to an e-mail. It paints its own ink colours so it keeps working
 * in dark mode and in the browser's print preview.
 */
export default function ComparePrint({ kind, biz, people, reference: referenceProp, onClose }: Props) {
  const { t, lang } = useLang();
  const fallbackRef = useQuoteRef(kind, kind === 'entreprises' ? biz.map((e) => e.id) : people.map((a) => a.id));
  /** A dossier opened from a shared link keeps the reference it was sent with. */
  const reference = referenceProp || fallbackRef;
  /** Identity of the person who built the dossier, so the sheet reads as a signed document. */
  const requester = useMemo(() => readRequester(), []);

  const exportCsv = () => {
    const csv = buildComparisonCsv({ kind, biz, people, lang, reference, t });
    downloadCsv(`PaperAtlas-comparaison-${reference || 'selection'}.csv`, csv);
  };

  useEffect(() => {
    document.body.classList.add('printing');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('printing');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const blocks = useMemo<Block[]>(() => {
    if (kind === 'entreprises') {
      return biz.map((e) => ({
        id: e.id,
        mark: e.logoMark,
        name: e.name,
        sub: [t(`trade.${e.trade}`), `${nomCommune(e.commune, lang)}, ${nomRegion(e.wilaya, lang)}`].join(' · '),
        rows: [
          { label: t('pro.since'), value: String(e.since) },
          { label: t('pro.staff'), value: String(e.staff) },
          { label: t('pro.rating'), value: `${e.rating.toFixed(1)} (${e.reviews})` },
          { label: t('pro.capacity'), value: localize(e.capacity, lang) },
          { label: t('pro.services'), value: e.services.map((s) => localize(s, lang)).join(' · ') },
          { label: t('pro.certs'), value: e.certs.join(' · ') },
          { label: t('pro.address'), value: e.address },
          { label: t('pro.contact'), value: [e.email, e.phone].filter(Boolean).join(' · ') },
        ],
      }));
    }
    return people.map((a) => ({
      id: a.id,
      mark: a.monogram,
      name: a.name,
      sub: [a.genres.map((g) => t(`genre.${g}`)).join(' · '), `${nomCommune(a.commune, lang)}, ${nomRegion(a.wilaya, lang)}`].join(' · '),
      rows: [
        { label: t('auth.since'), value: String(a.since) },
        { label: t('auth.languages'), value: a.languages.join(' · ') },
        { label: t('auth.works'), value: a.books.map((b) => localize(b.title, lang)).join(' · ') },
        {
          label: t('auth.avail'),
          value: `${t(`auth.status${a.status === 'open' ? 'Open' : a.status === 'project' ? 'Project' : 'Full'}`)} · ${localize(a.availableFrom, lang)}`,
        },
        { label: t('auth.services'), value: a.services.map((s) => localize(s, lang)).join(' · ') },
        { label: t('auth.contact'), value: [a.email, a.phone].filter(Boolean).join(' · ') },
      ],
    }));
  }, [kind, biz, people, lang, t]);

  const dateLabel = useMemo(() => new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date()), [lang]);

  const mailBody = useMemo(() => blocks.map((b, i) => [
    `${i + 1}. ${b.name} — ${b.sub}`,
    ...b.rows.map((r) => `   ${r.label} : ${r.value}`),
  ].join('\n')).join('\n\n'), [blocks]);

  const senderLine = [requester.name, requester.org].filter(Boolean).join(' — ');

  const mailto = `mailto:?subject=${encodeURIComponent(`${t('print.title')} — ${reference} — PaperAtlas`)}&body=${encodeURIComponent(`${t('print.ref')} : ${reference}\n${senderLine ? `${t('print.by')} : ${senderLine}\n` : ''}${t('print.date')} : ${dateLabel}\n\n${mailBody}\n\n${t('print.foot')}`)}`;

  return (
    <div className="print-modal" role="dialog" aria-modal="true" aria-label={t('print.title')}>
      <div className="print-actions">
        <button type="button" className="print-btn" onClick={exportCsv}>
          <i className="ri-file-excel-2-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">{t('csv.cta')}</span>
        </button>
        <a className="print-btn" href={mailto}>
          <i className="ri-mail-send-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">{t('print.email')}</span>
        </a>
        <button type="button" className="print-btn print-btn--solid" onClick={() => window.print()}>
          <i className="ri-printer-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">{t('print.print')}</span>
        </button>
        <button type="button" className="print-btn print-btn--ghost" onClick={onClose} aria-label={t('cmp.close')}>
          <i className="ri-close-line" aria-hidden="true"></i>
        </button>
      </div>

      <article className="print-sheet">
        <header className="print-head">
          <div>
            <p className="print-brand">PaperAtlas<span>{t('dir.stamp')}</span></p>
            <div className="print-headline">
              <h2 className="print-title">{t('print.title')}</h2>
              <span className="print-lang" title={t('lang.doc')} aria-label={t('lang.doc')}>{langCode(lang)}</span>
            </div>
            <p className="print-lede">{t('print.lede')}</p>
          </div>
          <p className="print-meta">
            <span className="print-ref">{t('print.ref')} · <bdi>{reference}</bdi></span>
            {t('print.date')}
            <br />
            {dateLabel}
            <br />
            {blocks.length} {t('print.count')}
          </p>
        </header>

        <div className="print-body">
          {blocks.map((b, i) => (
            <section className="print-entry" key={b.id}>
              <div className="print-entry-head">
                <span className="print-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="print-mark">{b.mark}</span>
                <div>
                  <h3>{b.name}</h3>
                  <p>{b.sub}</p>
                </div>
              </div>
              <dl className="print-dl">
                {b.rows.map((row) => (
                  <div className="print-row" key={`${b.id}-${row.label}`}>
                    <dt>{row.label}</dt>
                    <dd>{row.value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="print-sign">
          <div className="print-sign-cell">
            <span className="print-sign-label">{t('print.by')}</span>
            <strong>{requester.name || '—'}</strong>
            {requester.org && <span>{t('print.org')} · {requester.org}</span>}
            <span>{t('print.date')} <bdi>{dateLabel}</bdi></span>
          </div>
          <div className="print-sign-cell">
            <span className="print-sign-label">{t('print.sign')}</span>
            <span className="print-sign-rule" aria-hidden="true" />
            <span>{t('print.signHint')}</span>
          </div>
        </div>

        <footer className="print-foot">
          <span>{t('print.note')}</span>
          <span>{t('print.foot')}</span>
          <span className="print-foot-ref">{t('print.ref')} : <bdi>{reference}</bdi></span>
        </footer>
      </article>
    </div>
  );
}