import { useEffect, useRef, useState } from 'react';
import {
  decadeLabel, decadesLabel, parseDecades, toggleDecade, MAX_DECADES,
} from '@/lib/generation';

export type DecadeOption = {
  /** The first year of the decade, « 1990 ». */
  decade: number;
  /** How many sheets of the current selection belong to it. */
  count: number;
};

type Props = {
  id: string;
  /** The decades already picked, written as first years: « 1990 » or « 1990,2000 ». */
  value: string;
  options: DecadeOption[];
  /** « Toutes les décennies », the row that hands the whole range back. */
  allLabel: string;
  /** The tooltip that teaches the gesture. */
  hint: string;
  /** The line under the list: two at most, the oldest one steps aside. */
  limitHint: string;
  onChange: (value: string) => void;
};

/**
 * The generation field of the filter bar: a small menu that opens the decades
 * the selection actually holds, each one with the number of sheets behind it.
 * One decade narrows the list; a second one joins it, so two generations can be
 * read side by side. A third pick releases the oldest instead of overflowing.
 */
export default function DecadeMenu({
  id, value, options, allLabel, hint, limitHint, onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);
  const picked = parseDecades(value);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const summary = picked.length ? decadesLabel(picked) : allLabel;

  return (
    <div className="decade-menu" ref={box}>
      <button
        id={id}
        type="button"
        className={`decade-menu-btn${picked.length ? ' is-on' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${hint} — ${summary}`}
        title={hint}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span className={`decade-menu-value${picked.length ? '' : ' is-empty'}`}>{summary}</span>
        {picked.length > 0 && (
          <span className="decade-menu-n" aria-hidden="true">
            {picked.length}/{MAX_DECADES}
          </span>
        )}
        <i className={open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} aria-hidden="true"></i>
      </button>

      {open && (
        <div className="decade-menu-panel" role="group" aria-label={hint}>
          <button
            type="button"
            className={`decade-menu-opt decade-menu-all${picked.length ? '' : ' is-on'}`}
            aria-pressed={picked.length === 0}
            onClick={() => onChange('')}
          >
            <span className="decade-menu-opt-label">
              <i className="ri-calendar-close-line" aria-hidden="true"></i>
              {allLabel}
            </span>
          </button>

          {options.map((row) => {
            const on = picked.includes(row.decade);
            return (
              <button
                key={row.decade}
                type="button"
                className={`decade-menu-opt${on ? ' is-on' : ''}`}
                aria-pressed={on}
                title={`${decadeLabel(row.decade)} · ${row.count} — ${hint}`}
                onClick={() => onChange(toggleDecade(value, String(row.decade)))}
              >
                <span className="decade-menu-opt-label">
                  <i className={on ? 'ri-checkbox-fill' : 'ri-checkbox-blank-line'} aria-hidden="true"></i>
                  {decadeLabel(row.decade)}
                </span>
                <span className="decade-menu-count">{row.count}</span>
              </button>
            );
          })}

          <p className="decade-menu-hint">{limitHint}</p>
        </div>
      )}
    </div>
  );
}