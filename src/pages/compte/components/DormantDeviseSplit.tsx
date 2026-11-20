import { useState } from 'react';
import CopyTextButton from '@/components/feature/CopyTextButton';

/** L'ordre de lecture des jetons : le montant d'ouverture, ou le délai moyen
 *  croissant — le marché qui attend le plus se lit alors en dernier. */
export type DeviseOrdre = 'montant' | 'delai';

/** Une devise du lot, telle que la Synthèse la nomme : ce qu'elle pèse et la
 *  place de ses dossiers. */
type DeviseLine = {
  devise: string;
  montant: string;
  part: string;
  /** Le délai moyen des dossiers de ce marché-là, quand il en porte un : le
   *  marché ne se lit pas seulement en dossiers, mais en temps. */
  avg?: string;
  /** Le même délai, en jours : c'est lui qui ordonne les jetons, quand le
   *  lecteur demande l'ordre par délai moyen croissant. */
  avgDays?: number | null;
  /** Combien de devis ce marché tient : le jeton l'annonce, et la copie du
   *  jeton l'emporte avec le reste de son détail. */
  count?: string;
  /** Ce que la part rapporte exactement, quand elle ne parle pas du lot entier. */
  title?: string;
};

type Props = {
  entries: DeviseLine[];
  hint: string;
  icon: string;
  /** La teinte des endormis confirmés, quand la ligne parle de leurs devis. */
  ready?: boolean;
  /** La mise en page de l'endroit où la répartition se lit : la Synthèse la
   *  pose sous sa ligne, la bande des Offres sous sa pastille. La répartition,
   *  elle, reste exactement la même. */
  layout?: 'summary' | 'strip';
  /** Ce que le délai moyen de chaque marché veut dire, quand il est posé dans
   *  le jeton — la même explication sur les deux écrans. */
  avgHint?: string;
  /** Ce que le bouton de copie de chaque jeton emporte, `{devise}` remplacé par
   *  le marché du jeton : son nombre de devis, sa part et son délai moyen. */
  copyHint?: string;
  /** Les deux libellés de l'ordre des jetons : par montant, ou par délai. */
  sortAmountLabel?: string;
  sortAvgLabel?: string;
  sortAmountHint?: string;
  sortAvgHint?: string;
  /**
   * L'ordre de lecture, quand l'écran qui porte la répartition le tient lui-
   * même : la Synthèse le choisit une fois, et le classeur écrit alors ses
   * lignes de marché dans ce même ordre. Sans cette paire de props, le jeton
   * garde son ordre à lui, comme la bande des Offres.
   */
  order?: DeviseOrdre;
  onOrderChange?: (next: DeviseOrdre) => void;
  /** Le geste qui copie tous les marchés d'un seul clic, dans l'ordre lu. */
  copyAllLabel?: string;
  copyAllHint?: string;
};

/**
 * La ligne qu'un jeton emporte quand il se copie : son marché, ce qu'il pèse,
 * ses devis, sa part de l'attente et son délai moyen. Rien n'est ajouté que le
 * jeton ne montre déjà.
 */
function ligneDe(entry: DeviseLine): string {
  return [entry.devise, entry.montant, entry.count, entry.part, entry.avg]
    .filter((piece) => Boolean(piece && String(piece).trim()))
    .join(' · ');
}

/**
 * La répartition d'un lot endormi par devise, dans la Synthèse : chaque marché
 * garde son total, et sa part se lit dans le même jeton. Une seule devise n'a
 * rien à répartir — la ligne du total suffit alors, et rien ne s'affiche.
 *
 * Les jetons se lisent dans l'ordre du montant, comme la répartition les
 * compose ; un second ordre les range par délai moyen croissant, pour que le
 * marché qui attend le plus longtemps se lise en dernier. Chaque jeton se copie
 * d'un clic, avec tout son détail, et tous ensemble d'un seul geste, pour le
 * collègue qui ne lira pas l'écran.
 */
export default function DormantDeviseSplit({
  entries,
  hint,
  icon,
  ready = false,
  layout = 'summary',
  avgHint,
  copyHint,
  sortAmountLabel,
  sortAvgLabel,
  sortAmountHint,
  sortAvgHint,
  order,
  onOrderChange,
  copyAllLabel,
  copyAllHint,
}: Props) {
  /* L'ordre de lecture des jetons. Le montant reste celui d'ouverture : c'est
     la répartition que le lot a toujours montrée. Quand l'écran qui porte la
     répartition tient cet ordre lui-même, le jeton le suit sans rien garder
     pour lui — le classeur peut alors écrire ses lignes dans le même sens. */
  const [ordreInterne, setOrdreInterne] = useState<DeviseOrdre>('montant');
  const ordre = order ?? ordreInterne;
  const changerOrdre = (next: DeviseOrdre) => {
    if (onOrderChange) onOrderChange(next);
    else setOrdreInterne(next);
  };

  /* Combien de marchés portent vraiment un délai : en dessous de deux, il n'y a
     rien à ranger, et le bouton d'ordre n'aurait rien à comparer. */
  const mesures = entries.filter(
    (entry) => typeof entry.avgDays === 'number' && Number.isFinite(entry.avgDays),
  ).length;

  if (entries.length < 2) return null;

  const triees =
    ordre === 'delai' && mesures > 1
      ? [...entries].sort((a, b) => {
          const aJours =
            typeof a.avgDays === 'number' && Number.isFinite(a.avgDays)
              ? a.avgDays
              : Number.POSITIVE_INFINITY;
          const bJours =
            typeof b.avgDays === 'number' && Number.isFinite(b.avgDays)
              ? b.avgDays
              : Number.POSITIVE_INFINITY;
          if (aJours === bJours) return 0;
          return aJours - bJours;
        })
      : entries;

  const peutTrier = mesures > 1 && Boolean(sortAmountLabel && sortAvgLabel);

  return (
    <span
      className={`dvl-summary-dormant-devises${
        ready ? ' dvl-summary-dormant-confirmed-devises' : ''
      }${layout === 'strip' ? ' dvl-last-devise-split' : ''}`}
      title={hint}
    >
      <i className={icon} aria-hidden="true"></i>
      {triees.map((entry) => (
        <span className="dvl-summary-dormant-devise" key={entry.devise} title={entry.title}>
          <b>{entry.devise}</b>
          <em className="dvl-summary-dormant-devise-amount">{entry.montant}</em>
          {/* Le nombre de devis que ce marché tient : le jeton dit alors
              combien de dossiers, et non seulement ce qu'ils pèsent. */}
          {entry.count && (
            <em className="dvl-summary-dormant-devise-count">{entry.count}</em>
          )}
          <em className="dvl-summary-dormant-devise-part">{entry.part}</em>
          {/* Le délai moyen de ce marché, à côté de sa part : lu sur ses seules
              lignes, avec la même horloge que le compteur du lot. Rien ne
              s'écrit quand ce marché ne porte aucun délai lisible. */}
          {entry.avg && (
            <em className="dvl-summary-dormant-devise-avg" title={avgHint}>
              {entry.avg}
            </em>
          )}
          {/* Le détail du marché se copie depuis le jeton lui-même : ses devis,
              sa part et son délai, dans une seule ligne. */}
          {copyHint && (
            <CopyTextButton
              build={() => ligneDe(entry)}
              label=""
              hint={copyHint.replace('{devise}', entry.devise)}
              className="dvl-devise-copy"
            />
          )}
        </span>
      ))}
      {/* Tous les marchés d'un seul geste : une ligne par marché, dans l'ordre
          lu à l'écran, prête à coller dans un message de synthèse. Ce que la
          copie emporte est exactement ce que les jetons montrent. */}
      {copyAllLabel && (
        <CopyTextButton
          build={() => triees.map(ligneDe).join('\n')}
          label={copyAllLabel}
          hint={copyAllHint ?? copyAllLabel}
          className="dvl-devise-copy-all"
        />
      )}
      {/* L'ordre des jetons, à la fin de la ligne : un clic range les marchés
          par délai moyen croissant, un second les rend à leur ordre de montant. */}
      {peutTrier && (
        <button
          type="button"
          className="dvl-devise-sort"
          data-on={ordre === 'delai' ? 'yes' : 'no'}
          aria-pressed={ordre === 'delai'}
          title={ordre === 'delai' ? sortAmountHint ?? sortAmountLabel : sortAvgHint ?? sortAvgLabel}
          onClick={() => changerOrdre(ordre === 'delai' ? 'montant' : 'delai')}
        >
          <i
            className={ordre === 'delai' ? 'ri-sort-asc' : 'ri-sort-desc'}
            aria-hidden="true"
          ></i>
          <span className="whitespace-nowrap">
            {ordre === 'delai' ? sortAvgLabel : sortAmountLabel}
          </span>
        </button>
      )}
    </span>
  );
}