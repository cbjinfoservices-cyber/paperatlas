import { useEffect, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import useAireFicheCount from '@/hooks/useAireFicheCount';
import { jourCopie } from '@/lib/jourCopie';
import { nomPays } from '@/lib/pays';
import { clearAireFicheCopies } from '@/lib/aireCarteMemory';
import { REGIONS_MONDE, regionMondeLabelKey, type RegionMondeKey } from '@/lib/worldRegions';
import './aire-count.css';

type Props = {
  /** L’aire dont on compte les copies depuis une carte. */
  aire: RegionMondeKey;
  /** Le nom de l’aire, déjà lu dans la langue de la page. */
  regionNom: string;
  /** La tenue choisie par la carte qui l’accueille. */
  className?: string;
  /** L’adresse de la note des aires resserrée sur cette aire : quand elle est
      donnée, le compte devient une porte — un appui ouvre la note sans passer
      par la fiche. */
  noteTo?: string;
  /** La petite gomme du seul compte, posée à côté de la porte : elle n’efface
      que ce chiffre, sans toucher au carnet des aires. */
  erasable?: boolean;
};

/**
 * Le compte des copies d’une aire, posé dans le pied d’une carte — un atelier,
 * une plume, une annonce, une offre : le même chiffre que sur la fiche, et le
 * jour de la dernière copie. Il ne paraît qu’une fois l’aire réellement
 * partie, pour ne pas annoncer un zéro. Quand il reçoit une adresse, il
 * s’ouvre d’un clic sur la note des aires resserrée sur cette aire, au lieu de
 * rester un chiffre qu’on lit sans pouvoir l’ouvrir.
 *
 * Son survol nomme les pays de l’aire déjà partis d’une carte, pour vérifier
 * ce qui a quitté l’appareil, et sa petite gomme n’efface que ce chiffre — le
 * carnet des aires, le cadrage et les autres comptes restent intacts.
 */
export default function AireFicheCount({
  aire, regionNom, className = 'aire-count', noteTo = '', erasable = true,
}: Props) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { compte, setCompte, cartesPays, cartesAires, cartesAiresAts }
    = useAireFicheCount(aire);
  /* La gomme du seul compte : le premier appui l’arme, le second efface.
     Laissée sans confirmation, elle se désarme d’elle-même. */
  const [gomme, setGomme] = useState(false);

  useEffect(() => {
    if (!gomme) return;
    const timer = window.setTimeout(() => setGomme(false), 5000);
    return () => window.clearTimeout(timer);
  }, [gomme]);

  if (compte.count <= 0) return null;
  const date = jourCopie(compte.last, lang);
  /* Les pays déjà partis d’une carte, nommés dans la langue lue : le survol
     dit ce qui a quitté l’appareil, sans rouvrir chaque fiche. */
  const paysPartis = cartesPays
    .map((code) => nomPays(code, lang))
    .filter(Boolean)
    .join(' · ');
  /* Les aires distinctes déjà parties d’une carte, nommées dans la langue lue
     et comptées sur le monde : le survol dit combien d’aires ont quitté
     l’appareil, et pas seulement quels pays. */
  const airesParties = cartesAires
    .map((key) => REGIONS_MONDE.find((region) => region.key === key))
    .filter((region): region is (typeof REGIONS_MONDE)[number] => Boolean(region))
    .map((region) => t(regionMondeLabelKey(region)))
    .join(' · ');
  const paysTxt = paysPartis
    ? ` · ${t('cmaps.aireCopyCardPays').replace('{list}', paysPartis)}`
    : '';
  const airesTxt = cartesAires.length > 0
    ? ` · ${t('cmaps.aireCopyCardAires')
      .replace('{n}', String(cartesAires.length))
      .replace('{total}', String(REGIONS_MONDE.length))
      .replace('{list}', airesParties)}`
    : '';
  /* Le jour de la dernière copie de chacune de ces aires, nommées une à une :
     le survol dit non seulement ce qui a quitté l’appareil, mais quand. */
  const airesDates = cartesAires
    .map((key) => REGIONS_MONDE.find((region) => region.key === key) ?? null)
    .filter((region): region is (typeof REGIONS_MONDE)[number] => Boolean(region))
    .map((region) => t('cmaps.aireFrameCartesDatesRow')
      .replace('{region}', t(regionMondeLabelKey(region)))
      .replace('{date}', jourCopie(cartesAiresAts[region.key] ?? null, lang) || '—'))
    .join(' · ');
  const airesDatesTxt = airesDates
    ? ` · ${t('cmaps.aireFrameCartesDates').replace('{list}', airesDates)}`
    : '';
  const title = `${t('cmaps.aireCopyCountHint')
    .replace('{region}', regionNom)
    .replace('{date}', date)}${paysTxt}${airesTxt}${airesDatesTxt}${
    noteTo ? ` · ${t('cmaps.aireCopyCountOpen')}` : ''}`;

  const body = (
    <>
      <i className="ri-file-copy-line" aria-hidden="true"></i>
      <b>{compte.count}</b>
      <span className="aire-count-lab">{t('cmaps.aireCopyCount')}</span>
      <em className="aire-count-last">
        {t('cmaps.aireFrameCopiesLast').replace('{date}', date)}
      </em>
      {noteTo && <i className="ri-arrow-right-up-line aire-count-go" aria-hidden="true"></i>}
    </>
  );

  const gommer = (e: MouseEvent<HTMLButtonElement>) => {
    /* La carte est un lien : la gomme n’ouvre jamais la fiche. */
    e.preventDefault();
    e.stopPropagation();
    if (!gomme) {
      setGomme(true);
      return;
    }
    setCompte(clearAireFicheCopies(aire));
    setGomme(false);
  };

  const door = noteTo ? (
    <button
      type="button"
      className={`${className} is-door`}
      title={title}
      aria-label={`${t('cmaps.aireCopyCount')} · ${t('cmaps.aireCopyCountOpen')}`}
      onClick={(e) => {
        /* La carte est un lien : le geste s’arrête à la note, la fiche ne
           s’ouvre pas au passage. */
        e.preventDefault();
        e.stopPropagation();
        navigate(noteTo);
      }}
    >
      {body}
    </button>
  ) : (
    <span className={className} title={title}>{body}</span>
  );

  if (!erasable) return door;

  return (
    <span className="aire-count-row">
      {door}
      {/* La petite gomme du seul compte : ce chiffre repart de zéro, le
          carnet des aires reste tel quel. */}
      <button
        type="button"
        className={`aire-count-erase${gomme ? ' is-armed' : ''}`}
        aria-pressed={gomme}
        title={gomme
          ? t('cmaps.aireFrameSeulesClearConfirmHint')
          : t('cmaps.aireFrameShortCopiesClearHint')}
        aria-label={gomme
          ? t('cmaps.aireFrameSeulesClearConfirmHint')
          : t('cmaps.aireFrameShortCopiesClearHint')}
        onClick={gommer}
      >
        <i className="ri-eraser-line" aria-hidden="true"></i>
        {gomme && (
          <span className="whitespace-nowrap">{t('cmaps.airesNeverClearConfirm')}</span>
        )}
      </button>
    </span>
  );
}