import { useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { nomPays } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import TypePages from './TypePages';
import TypeCountries from './TypeCountries';
import TypeRegions from './TypeRegions';
import PaysTally, { type PaysCount } from '@/components/feature/PaysTally';

type Props = {
  /** Le type lu, "" quand l'annuaire entier se lit. */
  trade: string;
  /** Combien d'ateliers de chaque type le périmètre retenu tient. */
  tradeCounts: Record<string, number>;
  /** Combien d'ateliers du type chaque pays tient. */
  typeCountries: PaysCount[];
  /** Le pays déjà lu. */
  pays: string;
  /** La région retenue, gardée dans les adresses voisines. */
  wilaya: string;
  /** Le compte des pays du périmètre : la rangée « Par pays ». */
  paysCounts: PaysCount[];
  paysTotal: number;
  onPickPays: (code: string) => void;
  /** La carte se lit avec ses propres pastilles : la rangée y serait doublée. */
  showPays: boolean;
  /** Rangée dans le dépliant des filtres : elle perd sa tête et son souvenir,
      et n'affiche plus qu'un intitulé au-dessus des portes. La page n'a alors
      qu'une seule porte au-dessus des fiches. */
  embedded?: boolean;
};

/**
 * Une seule bande pour les portes du catalogue — les types d'établissement,
 * puis les pays d'un type, puis les pays du périmètre. Fermée, elle dit ce
 * qui est lu (« Façonniers · Algérie ») ; un clic ouvre les portes. La page
 * cesse ainsi d'empiler trois rangées avant la première fiche.
 *
 * Les portes restent dans le document même fermées : les adresses de type et
 * de pays sont ce que Google indexe, elles ne doivent pas disparaître de la
 * source quand le dépliant est replié.
 *
 * L'état ouvert ou fermé est gardé pour la visite : un aller-retour vers une
 * fiche ou une autre page du tableau retrouve le dépliant tel qu'on l'avait
 * laissé, au lieu de le replier à chaque retour. Le souvenir ne survit pas à
 * l'onglet : une nouvelle visite part du repli, la page restant calme.
 */
const OPEN_KEY = 'pa.dirExplore.open';

function readOpen(): boolean {
  try {
    return window.sessionStorage.getItem(OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

function saveOpen(next: boolean) {
  try {
    window.sessionStorage.setItem(OPEN_KEY, next ? '1' : '0');
  } catch {
    /* Le stockage peut être refusé : le dépliant fonctionne quand même. */
  }
}
export default function DirectoryExplore({
  trade,
  tradeCounts,
  typeCountries,
  pays,
  wilaya,
  paysCounts,
  paysTotal,
  onPickPays,
  showPays,
  embedded,
}: Props) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(readOpen);

  const summary = [
    trade ? t(`tradePlural.${trade}`) : t('explore.allTypes'),
    pays ? nomPays(pays, lang) : t('explore.allPays'),
    wilaya ? nomRegion(wilaya, lang) : '',
  ].filter(Boolean).join(' · ');

  /* Les portes elles-mêmes : les types, les pays d'un type, les régions de ce
     pays, puis les pays du périmètre. Elles ne changent pas d'une place à
     l'autre — seule la tête qui les coiffe s'efface dans le dépliant. */
  const doors = (
    <div className="dir-explore-body" id="dir-explore-body">
      <TypePages active={trade} counts={tradeCounts} pays={pays} wilaya={wilaya} />
      {trade && (
        <TypeCountries trade={trade} counts={typeCountries} active={pays} wilaya={wilaya} />
      )}
      {/* Les régions du type dans son pays, et la porte « Tout ce pays »
          posée à côté d'elles : ouvrir une région, puis vouloir relire le
          pays entier ne doit pas coûter deux détours. */}
      {trade && pays && (
        <TypeRegions trade={trade} pays={pays} active={wilaya} />
      )}
      {showPays && (
        <PaysTally
          counts={paysCounts}
          total={paysTotal}
          active={pays}
          onPick={onPickPays}
        />
      )}
    </div>
  );

  /* Rangée dans le dépliant des filtres : plus de tête ni de souvenir, un
     simple intitulé, et les portes toujours ouvertes. */
  if (embedded) {
    return (
      <section className="dir-explore is-embedded is-open">
        <p className="dir-explore-cap">
          <i className="ri-compass-3-line" aria-hidden="true"></i>
          <span>{t('explore.label')}</span>
        </p>
        {doors}
      </section>
    );
  }

  return (
    <section className={`dir-explore${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="dir-explore-head"
        aria-expanded={open}
        aria-controls="dir-explore-body"
        onClick={() => setOpen((prev) => {
          const next = !prev;
          saveOpen(next);
          return next;
        })}
      >
        <i className="ri-compass-3-line" aria-hidden="true"></i>
        <span className="dir-explore-lab">{t('explore.label')}</span>
        <span className="dir-explore-sum" title={t('explore.sumHint')}>{summary}</span>
        <span className="dir-explore-act">
          {open ? t('explore.close') : t('explore.open')}
          <i className="ri-arrow-down-s-line" aria-hidden="true"></i>
        </span>
      </button>

      {doors}
    </section>
  );
}