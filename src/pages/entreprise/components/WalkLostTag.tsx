import { useId } from 'react';
import { useLang } from '@/i18n/LangProvider';

type Props = {
  /** Combien de profils de la liste ont une porte vide : leur région ou leur
      métier n'ouvre plus aucune fiche dans l'annuaire. */
  lost: number;
  /** Sur quelles portes le compte s'appuie : combien de profils tombent par la
      région, combien par le métier. Un profil peut tomber par les deux. */
  by?: { region: number; trade: number };
};

/**
 * Le compte des profils à porte vide, posé à côté du jeton des carnets.
 *
 * Il vit à part du jeton parce qu'il ne dépend pas de lui : même quand aucun
 * carnet ne porte de porte vide, le vivier peut tenir des profils dont la
 * région ou le métier n'ouvre plus rien. Le chiffre se lit donc seul, discret,
 * et suit la lecture en cours — il ne resserre rien.
 *
 * Au survol, un petit panneau dit sur quelles portes le chiffre s'appuie :
 * la région, le métier, ou les deux, chacune sur sa ligne.
 */
export default function WalkLostTag({ lost, by }: Props) {
  const { t } = useLang();
  const hintId = `walk-lost-hint-${useId().replace(/:/g, '')}`;
  if (lost <= 0) return null;

  const rows: string[] = [];
  if (by && by.region > 0) {
    rows.push(
      by.region === 1
        ? t('pro.walkLostByRegionOne')
        : t('pro.walkLostByRegion').replace('{n}', String(by.region)),
    );
  }
  if (by && by.trade > 0) {
    rows.push(
      by.trade === 1
        ? t('pro.walkLostByTradeOne')
        : t('pro.walkLostByTrade').replace('{n}', String(by.trade)),
    );
  }

  return (
    <span className="dist-walk-tag-lost" tabIndex={0} aria-describedby={hintId}>
      <i className="ri-door-closed-line" aria-hidden="true"></i>
      <span>
        {t(lost === 1 ? 'pro.walkLostOne' : 'pro.walkLostMany').replace('{n}', String(lost))}
      </span>
      <span id={hintId} className="dist-walk-lost-hint">
        <span className="dist-walk-tag-hint-row">{t('pro.walkLostHint')}</span>
        {rows.map((row) => (
          <span key={row} className="dist-walk-tag-hint-row">{row}</span>
        ))}
      </span>
    </span>
  );
}