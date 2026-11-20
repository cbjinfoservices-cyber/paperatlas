import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { supabase } from '@/lib/supabase';

type Totals = { trade: number; all: number };

type Props = {
  /** Le métier du profil lu : sans lui, il n'y a pas de part à mesurer. */
  metier: string;
  /** Le vivier déjà filtré sur ce métier : la porte posée sous la part. */
  href: string;
};

/**
 * La part du vivier que le métier du profil représente — et la porte qui ouvre
 * ce métier.
 *
 * Deux comptages seulement — les profils du même métier, et tout le vivier des
 * candidats —, lus à l'ouverture de la fiche. Le profil est ainsi situé dans
 * l'ensemble au lieu d'être lu seul : le métier est rare ou courant, et le
 * chiffre le dit avant tout commentaire.
 *
 * Un comptage qui échoue ne casse rien : la ligne s'efface plutôt que
 * d'afficher un chiffre faux, mais la porte reste — elle, ne dépend d'aucun
 * chiffre.
 */
export default function TradeShare({ metier, href }: Props) {
  const { t } = useLang();
  const [totals, setTotals] = useState<Totals | null>(null);

  useEffect(() => {
    let alive = true;
    if (!metier.trim()) {
      setTotals(null);
      return undefined;
    }
    setTotals(null);
    void (async () => {
      try {
        const [trade, all] = await Promise.all([
          supabase
            .from('paperatlas_membres')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'candidat')
            .eq('metier', metier),
          supabase
            .from('paperatlas_membres')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'candidat'),
        ]);
        if (!alive) return;
        const tradeCount = trade.count ?? 0;
        const allCount = all.count ?? 0;
        if (!tradeCount || !allCount) {
          setTotals(null);
          return;
        }
        setTotals({ trade: tradeCount, all: allCount });
      } catch {
        if (alive) setTotals(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [metier]);

  if (!metier.trim()) return null;

  const pct = totals ? Math.max(1, Math.round((totals.trade / totals.all) * 100)) : 0;
  const line = !totals
    ? ''
    : (totals.trade === 1 ? t('candpub.tradeShareOne') : t('candpub.tradeShare'))
      .replace('{trade}', metier)
      .replace('{n}', String(totals.trade))
      .replace('{total}', String(totals.all))
      .replace('{pct}', String(pct));

  return (
    <section className="cprof-share-of" aria-label={t('candpub.tradeShareLabel')}>
      {totals && (
        <>
          <p className="cprof-share-of-line">
            <i className="ri-pie-chart-line" aria-hidden="true"></i>
            <span>{line}</span>
          </p>
          <span className="cprof-share-of-bar" aria-hidden="true">
            <span style={{ width: `${Math.min(pct, 100)}%` }}></span>
          </span>
        </>
      )}
      {/* La porte du métier : le vivier s'ouvre déjà filtré sur lui, plutôt
          que de laisser le lecteur reposer le filtre à la main. */}
      <Link to={href} className="cprof-share-door">
        <i className="ri-group-line" aria-hidden="true"></i>
        <span>{t('candpub.tradeDoor')}</span>
        <i className="ri-arrow-right-line" aria-hidden="true"></i>
      </Link>
    </section>
  );
}