import { useLang } from '@/i18n/LangProvider';
import { paysDe } from '@/lib/pays';
import { regionMondeDe, regionMondeLabelKey } from '@/lib/worldRegions';
import AireCopyShort from '@/components/feature/AireCopyShort';
import '@/pages/entreprise/components/contact-atelier.css';
import './aire-copy-profile.css';

/** La sorte de profil que la carte montre : chacune garde ses mots. */
type Kind = 'atelier' | 'plume' | 'candidat' | 'profil' | 'fil' | 'compte';

const KEYS: Record<Kind, { label: string; hint: string; line: string }> = {
  atelier: {
    label: 'cmaps.atelierAireCopy',
    hint: 'cmaps.atelierAireCopyHint',
    line: 'cmaps.atelierAireCopyLine',
  },
  plume: {
    label: 'cmaps.plumeAireCopy',
    hint: 'cmaps.plumeAireCopyHint',
    line: 'cmaps.plumeAireCopyLine',
  },
  candidat: {
    label: 'cmaps.candAireCopy',
    hint: 'cmaps.candAireCopyHint',
    line: 'cmaps.candAireCopyLine',
  },
  profil: {
    label: 'cmaps.profilAireCopy',
    hint: 'cmaps.profilAireCopyHint',
    line: 'cmaps.profilAireCopyLine',
  },
  fil: {
    label: 'cmaps.filAireCopy',
    hint: 'cmaps.filAireCopyHint',
    line: 'cmaps.filAireCopyLine',
  },
  compte: {
    label: 'cmaps.compteAireCopy',
    hint: 'cmaps.compteAireCopyHint',
    line: 'cmaps.compteAireCopyLine',
  },
};

type Props = {
  /** Le pays du profil : c'est lui qui décide de l'aire du monde. */
  pays?: string | null;
  /** Le nom du profil, déjà lu dans la langue de la page. */
  nom: string;
  /** La sorte de profil, qui donne ses mots au geste. */
  kind?: Kind;
  className?: string;
};

/**
 * Le geste court de l'aire, posé partout où un profil paraît — une fiche
 * d'atelier, une plume, un candidat du vivier, un profil de l'espace compte.
 * Il n'emporte que le nom de l'aire et ses fiches, et tient sous lui le compte
 * des copies de cette aire, avec sa porte et sa petite gomme.
 *
 * Une seule écriture pour tous les profils : les mots changent selon la sorte,
 * jamais le geste.
 */
export default function AireCopyProfile({
  pays, nom, kind = 'profil', className = '',
}: Props) {
  const { t } = useLang();
  const region = regionMondeDe(paysDe({ pays }));
  if (!region) return null;
  const nomLu = nom.trim();
  const keys = KEYS[kind];
  const nommer = (phrase: string) => phrase
    .replace('{atelier}', nomLu)
    .replace('{plume}', nomLu)
    .replace('{nom}', nomLu);
  const hintLead = nommer(t(keys.hint))
    .replace('{region}', t(regionMondeLabelKey(region)));
  const line = nommer(t(keys.line));

  return (
    <div className={className ? `aire-profile-copy ${className}` : 'aire-profile-copy'}>
      <AireCopyShort
        region={region}
        label={t(keys.label)}
        hintLead={hintLead}
        line={line}
      />
    </div>
  );
}