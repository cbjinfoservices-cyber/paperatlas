import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import type { RegionMonde } from '@/lib/worldRegions';

/** Le temps d'un appui long : assez pour ne pas partir d'un effleurement,
 *  assez court pour ne pas faire attendre. */
const TENUE_MS = 550;

type Etat = 'idle' | 'ok' | 'err';

type Props = {
  /** L'aire du fil, lue sur le pays de son compte. */
  region: RegionMonde;
  /** Vrai quand la boîte est déjà resserrée sur cette aire. */
  active: boolean;
  /** Ce que le survol annonce : resserrer d'un appui, emporter d'un appui long. */
  hint: string;
  /** Le relevé de cette seule aire, bâti au moment du geste. */
  build: () => string;
  /** L'appui court : resserrer la boîte sur cette aire, ou la rendre entière. */
  onToggle: () => void;
  /** Appelé une fois le texte réellement arrivé au presse-papiers — jamais
   *  quand la copie a échoué, pour qu'aucune date ne se pose à vide. */
  onCopied?: () => void;
};

/**
 * La petite pastille d'aire d'une ligne de fil : un appui resserre la boîte sur
 * cette aire, un appui long emporte son relevé — ses fiches, puis chaque fil
 * avec son interlocuteur et son sujet —, sans passer par l'en-tête du groupe.
 *
 * Le geste long ne vole pas le clic : dès qu'il a copié, le relâchement est
 * avalé, et la pastille dit un instant que le message est prêt à coller.
 */
export default function AireCopyPill({
  region,
  active,
  hint,
  build,
  onToggle,
  onCopied,
}: Props) {
  const { t } = useLang();
  const [etat, setEtat] = useState<Etat>('idle');
  const retour = useRef<number | null>(null);
  const tenue = useRef<number | null>(null);
  const copieLongue = useRef(false);

  useEffect(() => () => {
    if (retour.current) window.clearTimeout(retour.current);
    if (tenue.current) window.clearTimeout(tenue.current);
  }, []);

  const signaler = useCallback((next: Etat) => {
    setEtat(next);
    if (retour.current) window.clearTimeout(retour.current);
    retour.current = window.setTimeout(() => setEtat('idle'), 2400);
  }, []);

  const copier = useCallback(async () => {
    const texte = build();
    if (!texte.trim()) {
      signaler('err');
      return;
    }
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texte);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      try {
        const champ = document.createElement('textarea');
        champ.value = texte;
        champ.setAttribute('readonly', '');
        champ.style.position = 'fixed';
        champ.style.top = '-1000px';
        champ.style.opacity = '0';
        document.body.appendChild(champ);
        champ.select();
        ok = document.execCommand('copy');
        document.body.removeChild(champ);
      } catch {
        ok = false;
      }
    }
    signaler(ok ? 'ok' : 'err');
    if (ok) onCopied?.();
  }, [build, onCopied, signaler]);

  const commencer = () => {
    copieLongue.current = false;
    if (tenue.current) window.clearTimeout(tenue.current);
    tenue.current = window.setTimeout(() => {
      tenue.current = null;
      copieLongue.current = true;
      void copier();
    }, TENUE_MS);
  };

  const arreter = () => {
    if (tenue.current) {
      window.clearTimeout(tenue.current);
      tenue.current = null;
    }
  };

  const icone = etat === 'ok'
    ? 'ri-check-line'
    : etat === 'err'
      ? 'ri-error-warning-line'
      : 'ri-map-2-line';

  return (
    <button
      type="button"
      className="admin-thread-aire admin-thread-aire-btn"
      data-on={active ? 'yes' : 'no'}
      data-copie={etat === 'ok' ? 'yes' : etat === 'err' ? 'err' : 'no'}
      aria-pressed={active}
      title={etat === 'ok' ? t('ad.msg.threadAireCopiedHint') : hint}
      onPointerDown={commencer}
      onPointerUp={arreter}
      onPointerLeave={arreter}
      onPointerCancel={arreter}
      onContextMenu={(event) => event.preventDefault()}
      onClick={() => {
        /* Le relâchement d'un appui long ne resserre rien : la copie a déjà
           parlé, et le clic qui la suit se tait. */
        if (copieLongue.current) {
          copieLongue.current = false;
          return;
        }
        onToggle();
      }}
    >
      <i className={icone} aria-hidden="true"></i>
      {etat === 'ok'
        ? t('share.copied')
        : etat === 'err'
          ? t('share.failed')
          : t(`worldRegion.${region.key}`)}
    </button>
  );
}