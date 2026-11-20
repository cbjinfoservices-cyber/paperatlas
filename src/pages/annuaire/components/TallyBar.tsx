import { useState } from 'react';

export type TallyPart = { key: string; label: string; count: number; title?: string };

export type TallyItem = {
  key: string;
  label: string;
  count: number;
  /** The split of that counter, written under its label — one country at a time. */
  parts?: TallyPart[];
};

type Props = {
  /** The name of the bar, e.g. « Les genres dans la sélection ». */
  label: string;
  icon: string;
  /** The tooltip that teaches the gesture, repeated on every counter. */
  hint: string;
  items: TallyItem[];
  /** The counter currently applied as a filter. */
  active: string;
  /** Several counters at once (two generations read side by side). */
  activeKeys?: string[];
  onPick: (key: string) => void;
  /** A part of a counter, picked on its own: the country under a decade. */
  onPickPart?: (itemKey: string, partKey: string) => void;
  /** The part currently applied, so the country code reads as picked. */
  activePart?: string;
  /** How many profiles the line is read on, shown beside its name. */
  total?: number;
  /** The word that names those profiles (« profils », « fiches »). */
  totalWord?: string;
  /** Past this many counters the rest folds behind one pill. */
  foldAt?: number;
  /** The word behind that pill (« genres », « années »). */
  moreWord?: string;
  expandHint?: string;
  fewerLabel?: string;
};

/**
 * One horizontal bar of counters, each one a door: the same gesture as the
 * region counters on the country cards — one click filters, the second clears.
 * When the list grows long, what is left folds behind a single « +n » pill so
 * the bar always stays on one line.
 * A counter that carries a split (a decade and its countries) hands that split
 * its own doors: the label opens the decade, the code beside it opens the same
 * decade *inside* that country — both filters land together.
 */
export default function TallyBar({
  label, icon, hint, items, active, activeKeys, onPick, onPickPart, activePart, total, totalWord,
  foldAt = 6, moreWord = '', expandHint = '', fewerLabel = '',
}: Props) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  /* Two generations at once: every picked counter reads as picked, and a click
     on one of them adds or removes just that one. */
  const multi = Array.isArray(activeKeys);
  const isOn = (key: string) => (multi ? (activeKeys as string[]).includes(key) : active === key);
  /* A click hands the counter back when it is a single choice; when several can
     be read together the menu owns the toggling, so the key is simply passed. */
  const click = (key: string) => (multi ? onPick(key) : onPick(isOn(key) ? '' : key));

  const folded = !open && items.length > foldAt;
  const head = folded ? items.slice(0, foldAt) : items;
  /* The picked counter never hides behind the fold: it stays beside the first
     ones, as a door the visitor can close again. */
  const picked = folded ? items.find((row) => isOn(row.key)) ?? null : null;
  const pickedInHead = !picked || head.some((row) => row.key === picked.key);
  const visible = picked && !pickedInHead ? [...head, picked] : head;
  const hidden = folded ? items.length - visible.length : 0;

  return (
    <div className="genre-tally" title={hint}>
      <span className="genre-tally-lab">
        <i className={icon} aria-hidden="true"></i>
        {label}
        <em className="genre-tally-num">{items.length}</em>
        {typeof total === 'number' && totalWord && (
          <span className="genre-tally-total">{total} {totalWord}</span>
        )}
      </span>
      <ul className="genre-tally-list">
        {visible.map((row) => {
          const on = isOn(row.key);
          const split = row.parts ?? [];
          const hasParts = split.length > 0;
          const headLine = (
            <span className="genre-tally-head">
              <span className="genre-tally-name">{row.label}</span>
              <b>{row.count}</b>
            </span>
          );
          const partsLine = hasParts ? (
            <span className="genre-tally-parts">
              {split.map((part) => {
                const partOn = on && activePart === part.key;
                return onPickPart ? (
                  <button
                    key={part.key}
                    type="button"
                    className={`genre-tally-part${partOn ? ' is-on' : ''}`}
                    aria-pressed={partOn}
                    title={`${part.title ?? part.label} · ${part.count} — ${hint}`}
                    onClick={() => onPickPart(row.key, part.key)}
                  >
                    {part.label}
                    <em>{part.count}</em>
                  </button>
                ) : (
                  <span key={part.key} title={part.title ?? part.label}>
                    {part.label}
                    <em>{part.count}</em>
                  </span>
                );
              })}
            </span>
          ) : null;

          return (
            <li key={row.key} className="genre-tally-item">
              {hasParts && onPickPart ? (
                <div className={`genre-tally-chip has-parts${on ? ' is-on' : ''}`}>
                  <button
                    type="button"
                    className="genre-tally-main"
                    aria-pressed={on}
                    title={`${row.label} · ${row.count} — ${hint}`}
                    onClick={() => click(row.key)}
                  >
                    {headLine}
                  </button>
                  {partsLine}
                </div>
              ) : (
                <button
                  type="button"
                  className={`genre-tally-chip${on ? ' is-on' : ''}${hasParts ? ' has-parts' : ''}`}
                  aria-pressed={on}
                  title={`${row.label} · ${row.count} — ${hint}`}
                  onClick={() => click(row.key)}
                >
                  {headLine}
                  {partsLine}
                </button>
              )}
            </li>
          );
        })}
        {hidden > 0 && (
          <li className="genre-tally-item">
            <button
              type="button"
              className="genre-tally-chip is-more"
              title={expandHint}
              aria-expanded={false}
              onClick={() => setOpen(true)}
            >
              <b>+{hidden}</b>
              <span className="genre-tally-name">{moreWord}</span>
            </button>
          </li>
        )}
        {open && items.length > foldAt && (
          <li className="genre-tally-item">
            <button
              type="button"
              className="genre-tally-chip is-fold"
              title={fewerLabel}
              aria-expanded
              onClick={() => setOpen(false)}
            >
              <i className="ri-subtract-line" aria-hidden="true"></i>
              <span className="genre-tally-name">{fewerLabel}</span>
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}