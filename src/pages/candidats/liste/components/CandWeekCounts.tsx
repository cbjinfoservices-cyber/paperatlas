import WeekPulse from '@/pages/annuaire/components/WeekPulse';

type FreshMode = 'none' | 'week' | 'month';

type Props = {
  /** Combien d'inscriptions la semaine et le mois tiennent dans le périmètre. */
  week: number;
  month: number;
  /** La fenêtre allumée : rien, la semaine dans le mois, ou le mois. */
  mode: FreshMode;
  onPick: (mode: FreshMode) => void;
  /** Les dates d'inscription du périmètre lu : le pouls suit les mêmes fiches. */
  dates: string[];
  weekLabel: string;
  monthLabel: string;
  weekHint: string;
  monthHint: string;
};

/**
 * Le premier segment de la ligne de compteurs du vivier : les deux fenêtres
 * d'arrivée — la semaine, le mois — qui sont aussi des boutons, puis le pouls
 * des sept semaines. Il occupe exactement la place que la phrase des dépôts
 * tient sur les annonces et les emplois, pour que les quatre listes se lisent
 * de la même façon.
 */
export default function CandWeekCounts({
  week,
  month,
  mode,
  onPick,
  dates,
  weekLabel,
  monthLabel,
  weekHint,
  monthHint,
}: Props) {
  return (
    <div className="cand-week-counts" aria-live="polite">
      <span className="cand-count-fresh">
        <button
          type="button"
          className={`cand-fresh${mode === 'week' ? ' is-on' : ''}`}
          onClick={() => onPick(mode === 'week' ? 'none' : 'week')}
          aria-pressed={mode === 'week'}
          title={weekHint}
        >
          <i className={mode === 'week' ? 'ri-checkbox-circle-line' : 'ri-flashlight-line'} aria-hidden="true"></i>
          <span className="cand-fresh-label">{weekLabel}</span>
          <strong>{week}</strong>
        </button>
        <button
          type="button"
          className={`cand-fresh${mode === 'month' ? ' is-on' : ''}`}
          onClick={() => onPick(mode === 'month' ? 'none' : 'month')}
          aria-pressed={mode === 'month'}
          title={monthHint}
        >
          <i className={mode === 'month' ? 'ri-checkbox-circle-line' : 'ri-sparkling-line'} aria-hidden="true"></i>
          <span className="cand-fresh-label">{monthLabel}</span>
          <strong>{month}</strong>
        </button>
      </span>
      <WeekPulse dates={dates} />
    </div>
  );
}