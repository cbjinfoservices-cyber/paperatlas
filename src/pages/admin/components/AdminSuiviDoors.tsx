import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { clearExpediteurVu, readExpediteurVu } from './adminMailMemory';
import './admin-suivi-mail.css';

/** Chez Resend, l'écran des domaines : c'est là que le domaine d'envoi se
 *  vérifie, et que la clé se reprend quand il faut la recopier. */
export const RESEND_URL = 'https://resend.com/domains';

/** Une porte ouverte par le plan : son adresse, et le nom de l'écran. */
export type SuiviPorte = { lien: string; ecran: string };

/** Les trois familles d'appareils, telles que le navigateur les dit : la
 *  mémoire de visite vit sur l'appareil, la gomme doit donc dire lequel elle
 *  vient d'oublier. */
const APPAREILS = {
  ordi: 'ad.suivi.appareilOrdi',
  tel: 'ad.suivi.appareilTel',
  tab: 'ad.suivi.appareilTab',
} as const;

type FamilleAppareil = keyof typeof APPAREILS;

/**
 * L'appareil qui tient cette mémoire, lu sur le navigateur.
 *
 * La console ne devine pas : elle se contente de la famille que le poste
 * annonce. Un poste qui ne se nomme pas est lu comme un ordinateur — c'est ce
 * qu'un navigateur de bureau reste quand il se tait.
 */
function familleAppareil(): FamilleAppareil {
  if (typeof navigator === 'undefined') return 'ordi';
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return 'tab';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'tel';
  return 'ordi';
}

/**
 * Le petit repère d'une ligne qui reçoit une porte.
 *
 * Il se pose à côté du nom de la ligne, et son survol nomme l'écran qu'elle
 * ouvre — le nom venant du plan, jamais d'un mot recopié à la main. Une seule
 * pièce sert donc au tableau des modules, au rappel des chantiers, à la liste
 * des points manquants et aux lignes de « Ce qu'il reste à faire ».
 */
export function SuiviDoorFlag({ ecran }: { ecran: string }) {
  const { t } = useLang();
  return (
    <span
      className="suivi-mod-flag"
      title={t('ad.suivi.modDoorScreen').replace('{ecran}', ecran)}
      aria-hidden="true"
    >
      <i className="ri-door-open-line"></i>
    </span>
  );
}

/**
 * Les deux portes du chantier des e-mails, posées côte à côte.
 *
 * Le même bloc sert à plusieurs endroits — sous le compteur des preuves, sous
 * la ligne du chantier, sur la ligne du module et sur les lignes de « Ce qu'il
 * reste à faire » : les portes se retrouvent donc exactement au même endroit
 * dans toutes les vues, plutôt que recopiées avec des mots différents. Les
 * adresses et les noms d'écran viennent du plan ; ce composant ne fait que les
 * rendre.
 *
 * Quand la carte de l'expéditeur a déjà été ouverte depuis cet appareil, les
 * deux portes portent leur petit repère : le bloc n'est plus à chercher, il a
 * déjà été visité — et la visite est datée au survol. Une petite gomme posée
 * sur le repère l'oublie pour cet appareil, sans toucher à la carte ni à son
 * état ; elle dit aussitôt combien de portes viennent d'être rendues, et sur
 * quel appareil.
 */
export default function AdminSuiviDoors({
  portes,
  className = '',
  onVisite,
}: {
  portes: SuiviPorte[];
  /** Une classe posée sur le bloc, pour l'air propre à chaque vue. */
  className?: string;
  /** Une porte réellement empruntée : la console retient laquelle, pour que
   *  la liste de « Ce qu'il reste à faire » distingue ce qui est déjà ouvert
   *  de ce qui reste à ouvrir. */
  onVisite?: (lien: string) => void;
}) {
  const { t, lang } = useLang();
  /* La visite est lue à l'affichage, puis tenue ici : c'est ce que cet appareil
     se rappelle de la carte, pas un état venu du serveur — la gomme doit donc
     pouvoir l'effacer sur place, sans recharger la page. */
  const [vue, setVue] = useState<string | null>(() => readExpediteurVu());
  /* Ce que la gomme vient de rendre, dit sous les portes : le nombre de portes
     et l'appareil qui tenait la mémoire. La phrase s'efface d'elle-même, sans
     laisser de trace au-dessus de la carte. */
  const [oublie, setOublie] = useState('');

  useEffect(() => {
    if (!oublie) return undefined;
    const timer = window.setTimeout(() => setOublie(''), 7000);
    return () => window.clearTimeout(timer);
  }, [oublie]);

  if (portes.length === 0) return null;

  /* Le bloc porte la porte de l'expéditeur et celle de Resend : la gomme les
     rend toutes les deux d'un geste, et le dit avec ce compte-là. */
  const nbPortes = portes.length + 1;

  const vuLe = vue
    ? new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : lang === 'en' ? 'en-GB' : 'fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(vue))
    : '';

  const seen = vue ? (
    <span className="suivi-door-seen" title={t('ad.suivi.doorSeenHint').replace('{date}', vuLe)}>
      <i className="ri-check-double-line" aria-hidden="true"></i>
      <span className="whitespace-nowrap">{t('ad.suivi.doorSeen')}</span>
      {/* La gomme ne tient que la mémoire du poste : la carte, son état et les
          preuves d'envoi restent tels quels. */}
      <button
        type="button"
        className="suivi-door-seen-clear"
        title={t('ad.suivi.doorSeenClearHint')}
        aria-label={t('ad.suivi.doorSeenClear')}
        onClick={() => {
          clearExpediteurVu();
          setVue(null);
          setOublie(
            t('ad.suivi.doorSeenCleared')
              .replace('{n}', String(nbPortes))
              .replace('{appareil}', t(APPAREILS[familleAppareil()])),
          );
        }}
      >
        <i className="ri-eraser-line" aria-hidden="true"></i>
      </button>
    </span>
  ) : null;

  return (
    <span className={`suivi-doors-wrap ${className}`.trim()}>
      <span className="suivi-preuves-doors">
        {portes.map((porte, index) => (
          <span className="suivi-door-cell" key={`${porte.lien}-${index}`}>
            <Link
              to={porte.lien}
              className="suivi-preuves-door"
              title={t('ad.suivi.mailDoorScreen').replace('{ecran}', porte.ecran)}
              onClick={() => {
                /* La porte est empruntée pour de vrai : la console le retient
                   sur cet appareil, et le repère de la ligne s'en souvient. */
                onVisite?.(porte.lien);
              }}
            >
              <i className="ri-mail-send-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ad.suivi.mailGo')}</span>
            </Link>
            {seen}
          </span>
        ))}
        <span className="suivi-door-cell">
          <a
            className="suivi-preuves-door"
            href={RESEND_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={t('ad.suivi.resendGoHint')}
          >
            <i className="ri-external-link-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('ad.suivi.resendGo')}</span>
          </a>
          {seen}
        </span>
      </span>
      {/* Ce que la gomme vient de faire, dit à voix haute une fois : le nombre
          de portes rendues, et l'appareil dont la mémoire a été effacée. */}
      {oublie && (
        <span className="suivi-door-cleared" role="status" aria-live="polite">
          <i className="ri-eraser-line" aria-hidden="true"></i>
          <span>{oublie}</span>
        </span>
      )}
    </span>
  );
}