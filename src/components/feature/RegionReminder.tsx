import { useLang } from '@/i18n/LangProvider';

type Props = {
  /** Le nom que le pays donne à sa division : wilaya, gouvernorat, émirat… */
  label: string;
  /** La région réellement lue, déjà écrite dans la langue de la page. */
  value: string;
  /** Combien de lignes la liste tient sous cette région. */
  count: number;
  /** Le mot qui suit le chiffre : « annonces », « offres ». */
  word: string;
  /** La part du vivier du pays que cette région tient, en pourcentage. */
  sharePercent?: number;
  /** Les lignes du pays entier — le dénominateur de cette part, et ce que
      porte la porte « Tout ce pays » posée dessous. */
  total?: number;
  /** Rend la région sans rendre le pays : c'est la porte du pays entier. */
  onClear: () => void;
  /** La porte « Tout ce pays » posée sous le rappel : elle rend la région
      seule, et garde la rubrique comme l'ordre de lecture. */
  onAllCountry?: () => void;
};

/**
 * La région lue, rappelée sur une ligne juste au-dessus des résultats.
 *
 * La barre de filtres porte le choix, les pastilles du pays le disent à leur
 * façon ; cette ligne l'énonce simplement, avec le chiffre que la liste tient
 * vraiment, la part du pays que ce chiffre représente, et le rend d'un clic.
 * Elle se lit comme le rappel du type retenu, avec son trait pointillé : c'est
 * un lieu, pas une rubrique.
 *
 * La croix ne rend que la région — le pays, la rubrique lue et l'ordre de
 * lecture restent exactement où ils sont.
 */
export default function RegionReminder({
  label, value, count, word, sharePercent, total, onClear, onAllCountry,
}: Props) {
  const { t } = useLang();
  /* Une région qui ne tient plus rien garde sa porte : elle se nomme « aucune
     fiche » au lieu de compter zéro, et ne mesure aucune part. */
  const empty = count === 0;
  /* La part ne se dit que si elle se mesure : un pays vide n'a pas de
     pourcentage, et la ligne reste alors la simple lecture du chiffre. */
  const share = !empty && typeof sharePercent === 'number' && Number.isFinite(sharePercent) && total
    ? Math.max(0, Math.min(100, Math.round(sharePercent)))
    : null;
  const shareHint = typeof total === 'number'
    ? t('dir.regionShareHint')
      .replace('{count}', String(count))
      .replace('{total}', String(total))
    : undefined;

  return (
    <div className="dir-type dir-type--place">
      <span className="dir-type-lab">
        <i className="ri-map-pin-2-line" aria-hidden="true"></i>
        {label}
      </span>
      <button
        type="button"
        className={`dir-type-chip${empty ? ' dir-type-chip--empty' : ''}`}
        onClick={onClear}
        title={t('dir.scopeClear')}
        aria-label={`${value} — ${t('dir.scopeClear')}`}
      >
        <span className="dir-type-val">{value}</span>
        {empty ? (
          <span className="dir-type-none">{t('pro.walkFicheNone')}</span>
        ) : (
          <>
            <span className="dir-type-count" aria-hidden="true">{count}</span>
            <span className="dir-type-word">{word}</span>
          </>
        )}
        {/* La part du pays : ce que la région pèse dans le vivier entier, pour
            situer le chiffre au lieu de le lire seul. */}
        {share !== null && (
          <>
            <em className="dir-type-sep" aria-hidden="true">·</em>
            <span className="dir-type-share" title={shareHint}>
              {t('dir.regionShare').replace('{p}', String(share))}
            </span>
          </>
        )}
        <i className="ri-close-line" aria-hidden="true"></i>
      </button>
      {/* La porte du pays entier, écrite sous la pastille : sortir de la
          région sans sortir du pays, en gardant la rubrique lue. */}
      {onAllCountry && (
        <button
          type="button"
          className="dir-type-more dir-type-all"
          onClick={onAllCountry}
          title={t('tradePage.allCountry')}
        >
          <i className="ri-map-2-line" aria-hidden="true"></i>
          <span>{t('tradePage.allCountry')}</span>
          {typeof total === 'number' && (
            total === 0
              ? <span className="dir-type-none">{t('pro.walkFicheNone')}</span>
              : <b className="dir-type-all-n">{total}</b>
          )}
          <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </button>
      )}
    </div>
  );
}