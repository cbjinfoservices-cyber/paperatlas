import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomPays } from '@/lib/pays';
import { fichesDesPays, type RegionMonde } from '@/lib/worldRegions';
import {
  AIRE_CARTE_PARAM,
  AIRES_MONDE_PARAM,
} from '@/lib/worldRegions';
import {
  clearAireFicheCopies,
  markAireFicheCopied,
} from '@/lib/aireCarteMemory';
import { jourCopie } from '@/lib/jourCopie';
import useAireFicheCount from '@/hooks/useAireFicheCount';
import CopyTextButton from '@/components/feature/CopyTextButton';

type Props = {
  /** L’aire où se tient la fiche : son nom, ses pays, ses fiches. */
  region: RegionMonde;
  /** Le libellé du geste, déjà traduit. */
  label: string;
  /** Le début du survol, déjà traduit et rempli du nom et de l’aire. */
  hintLead: string;
  /** La première ligne du message, déjà construite. */
  line: string;
  className?: string;
};

/**
 * Le geste court de l’aire, posé sur la fiche d’un atelier comme sur celle
 * d’une plume. Il n’emporte que le nom de l’aire et ses fiches — deux lignes,
 * sans rang ni adresse de vue Carte —, nomme au survol les pays de l’aire un à
 * un pour mesurer le message avant de le coller, et tient sous lui le compte
 * des copies de cette aire-là, comme la rangée d’un pays tient le sien.
 *
 * Ce compte est une porte : il rouvre la note des aires du monde resserrée sur
 * cette aire. Sa petite gomme, à côté, n’efface que ce chiffre — le carnet des
 * aires, le cadrage et les autres comptes restent intacts.
 */
export default function AireCopyShort({
  region, label, hintLead, line, className = 'pro-aire-copy',
}: Props) {
  const { t, lang } = useLang();
  const { compte, setCompte } = useAireFicheCount(region.key);
  /* La gomme du seul compte : le premier appui l’arme, le second efface.
     Laissée sans confirmation, elle se désarme d’elle-même. */
  const [gomme, setGomme] = useState(false);

  useEffect(() => {
    if (!gomme) return;
    const timer = window.setTimeout(() => setGomme(false), 5000);
    return () => window.clearTimeout(timer);
  }, [gomme]);

  const unit = t('cmaps.airesChipFiles');
  /* Les pays de l’aire, le plus fourni d’abord et les ex æquo tranchés par le
     nom : le survol du geste les nomme un à un, dans l’ordre du message. */
  const paysTxt = region.pays
    .map((code) => ({ code, files: fichesDesPays([code]), nom: nomPays(code, lang) }))
    .sort((a, b) => b.files - a.files || a.nom.localeCompare(b.nom, lang))
    .map(({ files, nom }) => t('cmaps.aireCopyCountryRow')
      .replace('{pays}', nom)
      .replace('{files}', String(files))
      .replace('{unit}', unit))
    .join(' · ');

  const hint = `${hintLead} · ${t('cmaps.aireCopyCountries').replace('{list}', paysTxt)}`;
  const date = jourCopie(compte.last, lang);
  const regionNom = t(`worldRegion.${region.key}`);
  /* La note des aires du monde, resserrée sur cette aire : le compte y mène
     d’un clic, pour relire le relevé au lieu de rester un chiffre. */
  const noteTo = `/annuaire?view=map&${AIRES_MONDE_PARAM}=${region.key}`
    + `&${AIRE_CARTE_PARAM}=${region.key}#cmaps`;

  const gommer = () => {
    if (!gomme) {
      setGomme(true);
      return;
    }
    setCompte(clearAireFicheCopies(region.key));
    setGomme(false);
  };

  return (
    <div className="pro-aire-row">
      <CopyTextButton
        label={label}
        hint={hint}
        className={className}
        onCopied={() => setCompte(markAireFicheCopied(region.key))}
        build={() => [
          line,
          t('cmaps.aireCopyRow')
            .replace('{region}', regionNom)
            .replace('{files}', String(fichesDesPays(region.pays)))
            .replace('{unit}', unit),
        ].join('\n')}
      />
      {/* Le petit compte de l’aire : combien de fois elle est partie d’une
          fiche, et le jour de la dernière — il n’apparaît qu’une fois le
          geste servi, pour ne pas annoncer un zéro. */}
      {compte.count > 0 && (
        <>
          <Link
            className="pro-aire-count pro-aire-count--door"
            to={noteTo}
            title={`${t('cmaps.aireCopyCountHint')
              .replace('{region}', regionNom)
              .replace('{date}', date)} · ${t('cmaps.aireCopyCountOpen')}`}
          >
            <i className="ri-file-copy-line" aria-hidden="true"></i>
            <b>{compte.count}</b>
            <span className="pro-aire-count-lab">{t('cmaps.aireCopyCount')}</span>
            <em className="pro-aire-count-last">
              {t('cmaps.aireFrameCopiesLast').replace('{date}', date)}
            </em>
            <i className="ri-arrow-right-up-line pro-aire-count-go" aria-hidden="true"></i>
          </Link>
          {/* La petite gomme du seul compte : ce chiffre repart de zéro, le
              carnet des aires reste tel quel. */}
          <button
            type="button"
            className={`pro-aire-count-erase${gomme ? ' is-armed' : ''}`}
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
        </>
      )}
    </div>
  );
}