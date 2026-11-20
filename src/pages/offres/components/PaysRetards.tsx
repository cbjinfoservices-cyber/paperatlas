import { useLang } from '@/i18n/LangProvider';
import CopyTextButton from '@/components/feature/CopyTextButton';
import {
  SEUILS_URGENCE,
  type SeuilUrgencePays,
} from '@/lib/paysRelanceMemory';

type Props = {
  /** Le nombre de marchés relancés au-delà du délai et jamais rappelés. */
  count: number;
  /** Le marché qui attend depuis le plus longtemps, et son attente en jours. */
  plusVieuxNom: string;
  plusVieuxJours: number;
  /** Vrai quand la feuille est déjà réduite à ces seuls marchés. */
  active: boolean;
  onToggle: () => void;
  /** La liste des retards, prête à copier. */
  copyBuild: () => string;
  /** Le seuil au-delà duquel un retard est dit urgent. */
  seuilUrgence: SeuilUrgencePays;
  onSeuilUrgence: (valeur: SeuilUrgencePays) => void;
  /** Combien de retards dépassent ce seuil. */
  urgents: number;
  /** Le rappel le plus urgent, et son retard en jours au-delà du délai. */
  plusUrgentNom: string;
  plusUrgentJours: number;
  /** Vrai quand la feuille est déjà réduite à ces seuls urgents. */
  urgentActive: boolean;
  /** Ouvre ou referme la feuille sur les seuls urgents. */
  onToggleUrgent: () => void;
  /** La liste réduite aux seuls urgents, prête à copier. */
  urgentCopyBuild: () => string;
  /** Le seul rappel le plus urgent, prêt à copier : son nom, son retard en
   *  jours et la date de sa relance — le premier appel à passer, seul. */
  urgentOneCopyBuild: () => string;
};

/**
 * Le compteur des rappels en retard, au bas de la feuille, et le seuil qui dit
 * à partir de quand un retard devient urgent.
 *
 * Le compteur garde ses lignes seules d'un clic, nomme le marché qui attend
 * depuis le plus longtemps et emporte la liste prête à coller. Sous lui, trois
 * seuils — cinq, dix ou vingt jours — disent à partir de quand un retard est
 * urgent : le compteur annonce alors combien le dépassent, et le choix reste
 * sur l'appareil, comme celui de la relance.
 */
export default function PaysRetards({
  count,
  plusVieuxNom,
  plusVieuxJours,
  active,
  onToggle,
  copyBuild,
  seuilUrgence,
  onSeuilUrgence,
  urgents,
  plusUrgentNom,
  plusUrgentJours,
  urgentActive,
  onToggleUrgent,
  urgentCopyBuild,
  urgentOneCopyBuild,
}: Props) {
  const { t } = useLang();
  if (count === 0) return null;

  return (
    <>
      <button
        type="button"
        className={`of-pays-floor-btn is-retard${active ? ' is-on' : ''}`}
        aria-pressed={active}
        title={active ? t('ofs.floorShowAllHint') : t('ofs.rappelLateFilterHint')}
        onClick={onToggle}
      >
        <i
          className={active ? 'ri-filter-off-line' : 'ri-alarm-warning-line'}
          aria-hidden="true"
        ></i>
        <b>{count}</b>
        <span className="whitespace-nowrap">
          {active ? t('ofs.floorShowAll') : t('ofs.rappelLateFilterCta')}
        </span>
        {/* Celui qui attend depuis le plus longtemps : le compteur nomme le
            marché, puis son attente en jours, sans déplier la feuille. */}
        {plusVieuxNom && (
          <em
            className="of-pays-floor-oldest"
            title={t('ofs.rappelLateOldestHint')
              .replace('{pays}', plusVieuxNom)
              .replace('{n}', String(plusVieuxJours))}
          >
            <i className="ri-time-line" aria-hidden="true"></i>
            {t('ofs.rappelLateOldest')
              .replace('{pays}', plusVieuxNom)
              .replace('{n}', String(plusVieuxJours))}
          </em>
        )}
      </button>
      {/* La liste des retards part telle quelle d'un seul clic : le compte,
          chaque marché avec son retard en jours, et l'adresse qui rouvre la
          feuille sur lui. */}
      <CopyTextButton
        build={copyBuild}
        label={t('ofs.rappelLateCopy')}
        hint={t('ofs.rappelLateCopyHint')}
        className="of-pays-retard-copy"
      />
      {/* Sous le compteur, le seuil qui dit ce qu'on appelle urgent : il ne
          change pas le compte, il dit combien le dépassent. */}
      <span
        className="of-pays-urgence"
        role="group"
        aria-label={t('ofs.urgenceLabel')}
      >
        <span className="of-pays-urgence-lab">
          <i className="ri-fire-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">{t('ofs.urgenceLabel')}</span>
        </span>
        {SEUILS_URGENCE.map((valeur) => (
          <button
            key={valeur}
            type="button"
            className={`of-pays-urgence-btn${seuilUrgence === valeur ? ' is-on' : ''}`}
            aria-pressed={seuilUrgence === valeur}
            title={t('ofs.urgenceHint').replace('{n}', String(valeur))}
            onClick={() => onSeuilUrgence(valeur)}
          >
            {t('ofs.urgenceDay').replace('{n}', String(valeur))}
          </button>
        ))}
        {/* Le compte des urgents est aussi une porte : un clic réduit la
            feuille à ces seuls marchés, un second la rend entière — comme le
            compteur des retards juste au-dessus. */}
        {urgents > 0 && (
          <button
            type="button"
            className={`of-pays-urgence-count${urgentActive ? ' is-on' : ''}`}
            aria-pressed={urgentActive}
            title={t('ofs.urgentChipHint').replace('{s}', String(seuilUrgence))}
            onClick={onToggleUrgent}
          >
            <i
              className={urgentActive ? 'ri-filter-off-line' : 'ri-alarm-warning-line'}
              aria-hidden="true"
            ></i>
            <span className="whitespace-nowrap">
              {urgentActive
                ? t('ofs.floorShowAll')
                : t('ofs.urgenceCount').replace('{n}', String(urgents))}
            </span>
          </button>
        )}
        {/* Le rappel qui attend depuis le plus longtemps : le seuil compte, ce
            jeton nomme celui qu'il faut appeler d'abord, avec son retard en
            jours — comme le compteur des retards nomme son plus ancien. */}
        {urgents > 0 && plusUrgentNom && (
          <em
            className="of-pays-urgence-oldest"
            title={t('ofs.urgenceOldestHint')
              .replace('{pays}', plusUrgentNom)
              .replace('{n}', String(plusUrgentJours))}
          >
            <i className="ri-time-line" aria-hidden="true"></i>
            {t('ofs.urgenceOldest')
              .replace('{pays}', plusUrgentNom)
              .replace('{n}', String(plusUrgentJours))}
          </em>
        )}
        <em className="of-pays-urgence-kept">
          <i className="ri-bookmark-3-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">{t('ofs.urgenceKept')}</span>
        </em>
      </span>
      {/* La liste réduite aux seuls urgents part d'un seul clic : le seuil
          choisi dit ce qui est urgent, et le message ne retient que ces
          marchés — le plus en retard en tête. */}
      {urgents > 0 && (
        <CopyTextButton
          build={urgentCopyBuild}
          label={t('ofs.rappelUrgentCopy')}
          hint={t('ofs.rappelUrgentCopyHint').replace('{s}', String(seuilUrgence))}
          className="of-pays-retard-copy is-urgent"
        />
      )}
      {/* Le premier appel seul : quand un seul rappel suffit à la journée, il
          part à part, avec son nom, son retard et sa date de relance — sans
          emporter toute la liste des urgents. */}
      {urgents > 0 && plusUrgentNom && (
        <CopyTextButton
          build={urgentOneCopyBuild}
          label={t('ofs.rappelUrgentOne')}
          hint={t('ofs.rappelUrgentOneHint').replace('{s}', String(seuilUrgence))}
          className="of-pays-retard-copy is-urgent-one"
        />
      )}
    </>
  );
}