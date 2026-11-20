import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import {
  RELECTURE_LIGNES,
  adresseEcran,
  estRelue,
  fermerResteTournee,
  noterGesteBande,
  readRelecture,
  writeRelecture,
  type RelectureEtat,
  type TourneeCompte,
} from './adminRelectureCore';

/**
 * La frise en miniature, sous le survol d'une pastille de tournée.
 *
 * La pastille dit « 6 / 10 » ; la carte dit lesquels. Elle reprend les dix
 * marques de la frise du panneau, dans le même dessin — pleine, teintée, vide —,
 * nomme le rang par lequel reprendre, puis les rangs qui restent de chaque
 * côté. Elle se lit sur le même carnet que le panneau : les deux ne peuvent
 * pas se contredire.
 *
 * Une marque se laisse survoler : la carte nomme alors l'écran qu'elle
 * représente et son état du moment, pour que la frise ne demande pas de
 * compter les cases ni d'ouvrir la liste. Un clic l'ouvre dans un nouvel
 * onglet : on quitte la page relue, pas l'en-tête — la carte reste sous la
 * souris, la case à cocher est toujours au même endroit au retour.
 */

type Props = {
  /** La tournée dont la carte montre les dix écrans. */
  tour: TourneeCompte;
  /** Le carnet de l'appareil, tel que le panneau le tient à jour. */
  etat: RelectureEtat;
  /** Ce que le geste groupe vient de fermer, et le compte atteint juste
   *  après : la pastille de l'en-tete le dit un instant, meme quand la carte
   *  n'est plus survelee. */
  onClosed?: (n: number, apres: number) => void;
};

export default function AdminRelectureMini({ tour, etat, onClosed }: Props) {
  const { t } = useLang();
  /* La marque sous la souris : son rang, ou rien quand le survol a quitté les
     dix marques. */
  const [survol, setSurvol] = useState<number | null>(null);
  /* Ce que le geste groupé vient de fermer, dit un instant sous la carte : un
     clic qui change plusieurs écrans d'un coup mérite de dire son compte. */
  const [ferme, setFerme] = useState<{ n: number; at: number } | null>(null);
  const minuterie = useRef<number | null>(null);

  useEffect(() => {
    if (!ferme) return undefined;
    if (minuterie.current) window.clearTimeout(minuterie.current);
    minuterie.current = window.setTimeout(() => setFerme(null), 3600);
    return () => {
      if (minuterie.current) window.clearTimeout(minuterie.current);
      minuterie.current = null;
    };
  }, [ferme]);

  useEffect(() => () => {
    if (minuterie.current) window.clearTimeout(minuterie.current);
  }, []);

  const rangs = RELECTURE_LIGNES.filter(
    (ligne) => ligne.n >= tour.de && ligne.n <= tour.a,
  );
  /* Le rang de reprise : le premier écran encore ouvert, d'un côté ou de
     l'autre — celui que la porte du panneau ouvrira. */
  const ouverts = Array.from(
    new Set([...tour.restantsAr, ...tour.restantsEn]),
  ).sort((a, b) => a - b);
  const reprise = ouverts[0] ?? null;

  /* L'état d'un écran, lu sur les deux cases et jamais recompté ailleurs. */
  const etatDe = (n: number) => {
    const ar = estRelue(etat, 'ar', n);
    const en = estRelue(etat, 'en', n);
    if (ar && en) return { cle: 'deux' as const, mot: t('ad.suivi.rlFriseDeux') };
    if (ar || en) return { cle: 'un' as const, mot: t('ad.suivi.rlFriseUn') };
    return { cle: 'rien' as const, mot: t('ad.suivi.rlFriseRien') };
  };

  /* Une phrase de reste, au singulier ou au pluriel : la carte nomme les rangs
     eux-mêmes, comme la feuille de synthèse. */
  const phrase = (restants: number[], vide: string, un: string, plusieurs: string) => {
    if (restants.length === 0) return t(vide);
    const liste = restants.map((n) => String(n).padStart(2, '0')).join(', ');
    return t(restants.length === 1 ? un : plusieurs).replace('{list}', liste);
  };

  /* Le geste de la miniature : fermer d'un coup, des deux côtés, les écrans
     encore ouverts de la tournée. Le carnet s'écrit sans quitter l'en-tête —
     le panneau n'a pas à s'ouvrir —, et le geste se date comme celui de la
     frise, pour que la feuille emportée le trace aussi. */
  const fermerTranche = () => {
    const lu = readRelecture();
    const resultat = fermerResteTournee(lu, tour);
    if (resultat.n === 0) return;
    writeRelecture(resultat.etat);
    noterGesteBande(tour.de, tour.a, true, resultat.n, resultat.apres);
    setFerme({ n: resultat.n, at: Date.now() });
    /* La pastille de l'en-tete reste sous les yeux meme quand la carte se
       referme : elle recoit le compte atteint pour le dire a son tour. */
    onClosed?.(resultat.n, resultat.apres);
  };

  const surveille = survol === null ? null : rangs.find((ligne) => ligne.n === survol) ?? null;
  const dire = surveille
    ? t('ad.relectureMiniSay')
        .replace('{n}', String(surveille.n).padStart(2, '0'))
        .replace('{page}', surveille.page)
        .replace('{etat}', etatDe(surveille.n).mot)
    : t('ad.relectureMiniSayHint');

  return (
    <span
      className="admin-relire-mini"
      onMouseLeave={() => setSurvol(null)}
    >
      <span className="admin-relire-mini-head">
        {t('ad.suivi.rlFriseBandTournee')
          .replace('{n}', String(tour.id))
          .replace('{de}', String(tour.de))
          .replace('{a}', String(tour.a))}
        <b>
          {tour.deux}/{tour.total}
        </b>
      </span>
      <span className="admin-relire-mini-cells">
        {rangs.map((ligne) => {
          const { cle, mot } = etatDe(ligne.n);
          const rang = String(ligne.n).padStart(2, '0');
          /* Le survol d'une marque la nomme : son rang, son écran, son état —
             la même phrase que la ligne de la liste, sans y descendre. Le
             clic, lui, l'ouvre dans un nouvel onglet. */
          const titre = `${rang} · ${ligne.page} — ${mot} · ${t('ad.relectureMiniOpen')}`;
          const adresse = adresseEcran(ligne.n);
          return adresse ? (
            <Link
              className="admin-relire-mini-cell"
              key={ligne.n}
              to={adresse}
              target="_blank"
              rel="noreferrer"
              data-etat={cle}
              data-open={reprise === ligne.n ? 'yes' : 'no'}
              data-survol={survol === ligne.n ? 'yes' : 'no'}
              title={titre}
              aria-label={titre}
              onMouseEnter={() => setSurvol(ligne.n)}
            >
              {rang}
            </Link>
          ) : (
            <span
              className="admin-relire-mini-cell"
              key={ligne.n}
              data-etat={cle}
              data-open={reprise === ligne.n ? 'yes' : 'no'}
              data-survol={survol === ligne.n ? 'yes' : 'no'}
              title={titre}
              onMouseEnter={() => setSurvol(ligne.n)}
            >
              {rang}
            </span>
          );
        })}
      </span>
      {/* Le dire du survol : l'écran représenté et son état du moment. Sans
          survol, la carte rappelle le geste plutôt que de laisser un vide. */}
      <span className="admin-relire-mini-say" data-on={surveille ? 'yes' : 'no'}>
        <i
          className={surveille ? 'ri-focus-3-line' : 'ri-cursor-line'}
          aria-hidden="true"
        ></i>
        <span>{dire}</span>
      </span>
      {/* Le geste groupé : il n'ouvre pas le panneau, il ferme sur place. Il
          se tait quand la tournée est faite des deux côtés, pour ne pas
          proposer un clic qui ne changerait rien. */}
      {ouverts.length > 0 && (
        <button
          type="button"
          className="admin-relire-mini-do"
          title={t('ad.relectureMiniCloseHint').replace('{n}', String(ouverts.length))}
          onClick={fermerTranche}
        >
          <i className="ri-check-double-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">
            {t('ad.relectureMiniClose').replace('{n}', String(ouverts.length))}
          </span>
        </button>
      )}
      {ferme && (
        <span className="admin-relire-mini-flash" role="status">
          <i className="ri-check-double-line" aria-hidden="true"></i>
          <span>{t('ad.relectureMiniClosed').replace('{n}', String(ferme.n))}</span>
        </span>
      )}
      <span className="admin-relire-mini-foot">
        <i className="ri-play-circle-line" aria-hidden="true"></i>
        {reprise === null
          ? t('ad.relectureMiniDone')
          : t('ad.relectureMiniResume').replace('{n}', String(reprise).padStart(2, '0'))}
      </span>
      {/* Les rangs encore ouverts, côté par côté : l'arabe d'abord, le côté par
          lequel la tournée commence, puis l'anglais sur les mêmes écrans. */}
      <span className="admin-relire-mini-remains">
        <span data-cote="ar">
          <b>AR</b>
          {phrase(
            tour.restantsAr,
            'ad.relectureTourneeRestNone',
            'ad.relectureTourneeRestArOne',
            'ad.relectureTourneeRestAr',
          )}
        </span>
        <span data-cote="en">
          <b>EN</b>
          {phrase(
            tour.restantsEn,
            'ad.relectureTourneeRestEnNone',
            'ad.relectureTourneeRestEnOne',
            'ad.relectureTourneeRestEn',
          )}
        </span>
      </span>
    </span>
  );
}