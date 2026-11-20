import { useLang } from '@/i18n/LangProvider';

type Props = {
  /** What a decade means here: « Ouverture » or « 1re publication ». */
  label: string;
  /** The decade itself, written « 1990–1999 ». */
  decade: string;
  /** How many sheets the whole block holds. */
  count: number;
  /** The word that names them: « fiches » or « profils ». */
  word: string;
  /** Its place among the blocks read at once, starting at one. */
  position: number;
  /** How many blocks the grid is cut into. */
  total: number;
};

/**
 * The intertitle that opens a generation block: the decade is named where its
 * cards actually begin, so two generations never read as one long list.
 */
export default function GenerationBlock({ label, decade, count, word, position, total }: Props) {
  const { t } = useLang();

  return (
    <div className="dir-genblock" title={t('gen.blockHint')}>
      <span className="dir-genblock-pos" aria-hidden="true">{position}/{total}</span>
      <span className="dir-genblock-body">
        <span className="dir-genblock-lab">{label}</span>
        <strong className="dir-genblock-decade">{decade}</strong>
      </span>
      <span className="dir-genblock-count">{count} {word}</span>
      <span className="dir-genblock-rule" aria-hidden="true"></span>
    </div>
  );
}