import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import type { B2bObjectifEntry, B2bStatut, DemandeB2b } from '@/lib/b2b';
import {
  b2bNeverCsvFilename,
  buildB2bNeverCsv,
  downloadB2bCsv,
  isNeverOpened,
} from './b2bCsv';
import { buildB2bWorkbook, downloadB2bWorkbook } from './b2bXlsx';
import B2bShareLink from './B2bShareLink';
import { devisGroupHref, devisNeverHref } from '@/lib/b2bLinks';
import {
  bulkCountKey,
  bulkKey,
  bulkNeverKey,
  bulkRefsKey,
  readLastBulk,
  readLastBulkCount,
  readLastBulkNever,
  readLastBulkRefs,
} from './devisBulkMemory';
import { readScope, saveScope, scopeKey } from './b2bScopeMemory';

/** Which file was just drawn — the confirmation belongs to that button alone. */
type Drawn = 'all' | 'never' | null;

/** The three states a request can be in, in the order the inbox names them. */
const ETATS: B2bStatut[] = ['nouvelle', 'vue', 'traitee'];

const STATUS_KEY: Record<B2bStatut, string> = {
  nouvelle: 'acct.b2b.statusNouvelle',
  vue: 'acct.b2b.statusVue',
  traitee: 'acct.b2b.statusTraitee',
};

/**
 * One click and the inbox is a workbook: the workshop keeps its commercial
 * follow-up outside the site, with the same rows it sees on screen — one tab
 * per reading, « Demandes » then « Synthèse ».
 *
 * Beside it, a second, shorter door: the requests the reminder never served,
 * alone in a short sheet — the list that gets handed round on a Monday morning
 * without cutting a single column out of the full export first.
 */
export default function B2bCsvExport({
  rows,
  neverRows,
  waitGoalDays = 7,
  accountKey = '',
}: {
  rows: DemandeB2b[];
  /** The reminder's misses, read on the whole loaded inbox, not on the cut. */
  neverRows: DemandeB2b[];
  /** The workshop monthly target — kept in the props so the call site stays one shape. */
  objectif?: number | null;
  /** Every change of that target — same reason, accepted but unused here. */
  objectifHistory?: B2bObjectifEntry[];
  /**
   * The workshop wait threshold, so the sheet flags the very months the strip
   * and the twelve-month table count — one number, three surfaces.
   */
  waitGoalDays?: number;
  /**
   * The account this export belongs to: the scope picked in the summary is
   * remembered under that id, so the next export reopens on the same perimeter.
   */
  accountKey?: string;
}) {
  const { t, lang } = useLang();
  const [drawn, setDrawn] = useState<Drawn>(null);
  /* Which states the « Synthèse » tab counts. The first tab keeps every line;
     this pick only narrows the second one. Read from the account memory, so a
     member finds their own perimeter waiting for them. */
  const scopeStoreKey = accountKey ? scopeKey(accountKey) : '';
  const [statuts, setStatuts] = useState<B2bStatut[]>(() =>
    scopeStoreKey ? readScope(scopeStoreKey) : ETATS,
  );
  const [scopeOpen, setScopeOpen] = useState(false);
  /* The two addresses the « Synthèse » tab writes at its foot, kept here so
     they can be copied straight from the box: the sheet stays the source, this
     only hands the same reading over. Empty when the sheet would write
     nothing — no send, no reading, nothing to copy. */
  const [addresses, setAddresses] = useState({ never: '', group: '' });
  const [linksOpen, setLinksOpen] = useState(false);
  const timer = useRef<number | null>(null);

  /* Read at the very click of the export, and again when the account or the
     language changes: the addresses always carry the reading language. */
  useEffect(() => {
    const never = accountKey ? readLastBulkNever(bulkNeverKey(accountKey)) : null;
    const count = accountKey ? readLastBulkCount(bulkCountKey(accountKey)) : 0;
    setAddresses({
      never: never !== null ? devisNeverHref(lang) : '',
      group: count > 0 ? devisGroupHref(lang) : '',
    });
  }, [accountKey, lang]);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  /* The account can change on the same screen: the remembered scope follows it
     rather than staying on the previous member's perimeter. */
  useEffect(() => {
    if (!scopeStoreKey) return;
    setStatuts(readScope(scopeStoreKey));
  }, [scopeStoreKey]);

  if (rows.length === 0) return null;

  /* The two confirmations share one timer: pressing the other button must not
     leave the first one saying « exported » behind its back. */
  const flash = (which: Drawn) => {
    setDrawn(which);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDrawn(null), 2600);
  };

  const runAll = () => {
    /* The day of the last grouped recap is read at the very click, from the same
       per-account memory the quotes list writes: the sheet and the badges cannot
       name two different days. The number of quotes that send carried is read
       from the same memory, so the date never appears on its own. */
    const lastBulkAt = accountKey ? readLastBulk(bulkKey(accountKey)) : null;
    const lastBulkCount = accountKey ? readLastBulkCount(bulkCountKey(accountKey)) : 0;
    /* And what no grouped recap has ever carried, from the same account memory:
       the summary then says both what left and what is still waiting. */
    const bulkNever = accountKey ? readLastBulkNever(bulkNeverKey(accountKey)) : null;
    /* And the files that very send carried, with the day each left: the summary
       names them under the line instead of only counting them. */
    const lastBulkRefs = accountKey ? readLastBulkRefs(bulkRefsKey(accountKey)) : [];
    downloadB2bWorkbook(
      buildB2bWorkbook({
        rows,
        lang,
        t,
        waitGoalDays,
        statuts,
        lastBulkAt,
        lastBulkCount,
        bulkNever,
        lastBulkRefs,
      }),
    );
    flash('all');
  };

  /* The last ticked state cannot be removed: a summary that counts nothing
     would look like an empty inbox rather than a choice. The pick is written
     down at once, so the next export opens on the very same perimeter. */
  const basculerStatut = (statut: B2bStatut) => {
    const next = statuts.includes(statut)
      ? statuts.length === 1
        ? statuts
        : statuts.filter((entry) => entry !== statut)
      : /* Kept in the inbox order, so the tab always reads the same way. */
        ETATS.filter((entry) => entry === statut || statuts.includes(entry));
    setStatuts(next);
    if (scopeStoreKey) saveScope(scopeStoreKey, next);
  };

  const runNever = () => {
    const csv = buildB2bNeverCsv({ rows: neverRows, lang, t });
    downloadB2bCsv(b2bNeverCsvFilename(), csv);
    flash('never');
  };

  const misses = neverRows.filter(isNeverOpened).length;

  return (
    <>
      {/* The state picker of the summary: a small panel above the export, so the
          second tab can be narrowed without touching the rows exported. */}
      <div className="b2bx">
        <button
          type="button"
          className={`ghost-btn b2bx-toggle${scopeOpen ? ' is-on' : ''}`}
          aria-expanded={scopeOpen}
          aria-controls="b2bx-scope"
          title={t('acct.b2b.xlsxScopePick')}
          onClick={() => setScopeOpen((prev) => !prev)}
        >
          <i className={scopeOpen ? 'ri-filter-fill' : 'ri-filter-3-line'} aria-hidden="true"></i>
          <span className="whitespace-nowrap">{t('acct.b2b.xlsxScopeShort')}</span>
          <b>{statuts.length}</b>
        </button>
        {scopeOpen && (
          <div
            className="b2bx-panel"
            id="b2bx-scope"
            role="group"
            aria-label={t('acct.b2b.xlsxScopePick')}
          >
            <p className="b2bx-lead">{t('acct.b2b.xlsxScopePick')}</p>
            {ETATS.map((key) => {
              const on = statuts.includes(key);
              return (
                <label key={key} className="b2bx-opt" data-on={on ? 'yes' : 'no'}>
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={on && statuts.length === 1}
                    onChange={() => basculerStatut(key)}
                  />
                  <span>{t(STATUS_KEY[key])}</span>
                  <i className={on ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'} aria-hidden="true"></i>
                </label>
              );
            })}
            <p className="b2bx-note">{t('acct.b2b.xlsxScopeHint')}</p>
            <p className="b2bx-note b2bx-note--kept">
              <i className="ri-bookmark-line" aria-hidden="true"></i>
              {t('acct.b2b.xlsxScopeSaved')}
            </p>
          </div>
        )}
      </div>
      <button
        type="button"
        className={`ghost-btn b2br-csv${drawn === 'all' ? ' is-ok' : ''}`}
        onClick={runAll}
        title={t('acct.b2b.xlsxCta')}
        aria-live="polite"
      >
        <i
          className={drawn === 'all' ? 'ri-check-line' : 'ri-file-excel-2-line'}
          aria-hidden="true"
        ></i>
        <span className="whitespace-nowrap">
          {drawn === 'all' ? t('acct.b2b.xlsxDone') : `${t('acct.b2b.xlsxCta')} (${rows.length})`}
        </span>
      </button>
      {/* The addresses the summary writes are also doors of their own: copied
          here, they hand the same reading to a colleague without opening the
          sheet first. Shown only when the sheet would really write one. */}
      {(addresses.never || addresses.group) && (
        <div className="b2bx b2bx--links">
          <button
            type="button"
            className={`ghost-btn b2bx-toggle${linksOpen ? ' is-on' : ''}`}
            aria-expanded={linksOpen}
            aria-controls="b2bx-links"
            title={t('acct.b2b.xlsxLinksHint')}
            onClick={() => setLinksOpen((prev) => !prev)}
          >
            <i className={linksOpen ? 'ri-link-unlink' : 'ri-link'} aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('acct.b2b.xlsxLinksCta')}</span>
          </button>
          {linksOpen && (
            <div
              className="b2bx-panel b2bx-panel--links"
              id="b2bx-links"
              role="group"
              aria-label={t('acct.b2b.xlsxLinksLead')}
            >
              <p className="b2bx-lead">{t('acct.b2b.xlsxLinksLead')}</p>
              {addresses.never && (
                <div className="b2bx-link">
                  <span className="b2bx-link-l">{t('acct.b2b.xlsxLastBulkLink')}</span>
                  <code className="b2bx-link-url">{addresses.never}</code>
                  <B2bShareLink
                    href={addresses.never}
                    label={t('acct.b2b.xlsxLinkCopy')}
                    hint={t('acct.b2b.xlsxLinksHint')}
                    className="b2bx-link-copy"
                  />
                </div>
              )}
              {addresses.group && (
                <div className="b2bx-link">
                  <span className="b2bx-link-l">{t('acct.b2b.xlsxGroupLink')}</span>
                  <code className="b2bx-link-url">{addresses.group}</code>
                  <B2bShareLink
                    href={addresses.group}
                    label={t('acct.b2b.xlsxLinkCopy')}
                    hint={t('acct.b2b.xlsxLinksHint')}
                    className="b2bx-link-copy"
                  />
                </div>
              )}
              <p className="b2bx-note">{t('acct.b2b.xlsxLinksNote')}</p>
            </div>
          )}
        </div>
      )}
      {/* The short sheet: the same predicate as the block of the full export,
          so the two files can never list two different sets of requests. */}
      {misses > 0 && (
        <button
          type="button"
          className={`ghost-btn b2br-csv b2br-csv--never${
            drawn === 'never' ? ' is-ok' : ''
          }`}
          onClick={runNever}
          title={t('acct.b2b.csvNeverCtaHint')}
          aria-live="polite"
        >
          <i
            className={drawn === 'never' ? 'ri-check-line' : 'ri-eye-off-line'}
            aria-hidden="true"
          ></i>
          <span className="whitespace-nowrap">
            {drawn === 'never'
              ? t('acct.b2b.csvNeverDone')
              : `${t('acct.b2b.csvNeverCta')} (${misses})`}
          </span>
        </button>
      )}
    </>
  );
}