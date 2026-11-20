import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import AdminParite from './AdminParite';
import type { PariteFocus } from './AdminParite';
import {
  RELECTURE_LANGUES,
  RELECTURE_AVIS,
  RELECTURE_LIGNES,
  RELECTURE_OUVRIR,
  RELECTURE_TERMES,
  RELECTURE_TOTAL,
  RELECTURE_TOURNEE_1,
  RELECTURE_TOURNEES,
  compteRelecture,
  compteTournee,
  copierRelecture,
  marquerTournee,
  noterGesteBande,
  pagesUnCote,
  premierEcranTournee,
  prochainCoteTournee,
  adresseEcran,
  rangsTournee,
  readRelecture,
  telechargerRelectureCsv,
  tranchesEncoreOuvertes,
  writeRelecture,
  type RelectureEtat,
  type RelectureLangue,
} from './adminRelectureCore';
import { readRelectureFiltre, saveRelectureFiltre } from './adminRelectureFiltre';
import AdminRelectureFrise from './AdminRelectureFrise';
import './admin-relecture-tournee.css';

const ETIQUETTE: Record<RelectureLangue, string> = { ar: 'AR', en: 'EN' };

/**
 * Ce qu'une porte de l'en-tête vient de nommer, et l'instant du clic :
 * une langue seule, ou le désaccord entre les deux.
 */
export type RelectureFocus = {
  langue?: RelectureLangue | null;
  desaccord?: boolean;
  /** Le clic vient d'une pastille de tournée : le resserrement des dix écrans
   *  de cette tournée se pose avec lui — la première par défaut. */
  tournee?: boolean | number;
  /** Le clic vient de la pastille des clés : le panneau de parité se présente. */
  parite?: boolean;
  /** Le fichier de textes nommé par une pastille de pose : le relevé s'ouvre
   *  resserré sur lui, et sur les clés de la famille demandée. */
  fichier?: string | null;
  familles?: string[];
  /** Ce qui restait à poser quand le lien a été copié : le resserrement le
   *  rappelle, pour que le relecteur sache sur quoi il arrive. */
  reste?: number;
  at: number;
};

/**
 * La liste de relecture du plan, portée dans l'onglet « Suivi du projet ».
 *
 * Trente écrans, une case arabe et une case anglais par écran : la relecture se
 * mène ici, page par page, et l'appareil retient ce qui est coché. Rien n'est
 * écrit en base — c'est un carnet de travail, pas une donnée du site —, et le
 * panneau dit lui-même où il range ses cases.
 */
type Props = {
  /**
   * La langue que la pastille d'en-tête vient de nommer : le panneau s'ouvre
   * resserré sur les pages qui restent à cocher de ce côté, et se présente à
   * l'écran au lieu de laisser le relecteur le chercher au bas de l'onglet.
   */
  focus?: RelectureFocus | null;
};

export default function AdminRelecture({ focus = null }: Props) {
  const { t } = useLang();
  const [etat, setEtat] = useState<RelectureEtat>(() => readRelecture());
  /* Le resserrement de langue et le jeton « cochées d'un seul côté » : deux
     filtres qui peuvent se composer, et qui se rejouent à la visite suivante
     comme les autres filtres de la console. */
  const [langueSeule, setLangueSeule] = useState<RelectureLangue | null>(
    () => readRelectureFiltre().langue,
  );
  const [desaccord, setDesaccord] = useState<boolean>(() => readRelectureFiltre().desaccord);
  /* La tournée ouverte : les dix écrans d'une tranche du plan, dans l'ordre,
     l'arabe d'abord puis les mêmes en anglais. Le resserrement n'efface rien
     du carnet — il ne montre qu'une tranche du travail, un second clic rend
     les trente pages, et les tournées se remplacent l'une l'autre. */
  const [tournee, setTournee] = useState<number | null>(null);
  const panneau = useRef<HTMLElement | null>(null);
  /* Le dernier état écrit par le panneau : un geste venu de l'en-tête ne doit
     pas être réécrit par un rendu qui l'aurait déjà lu. */
  const derniereEcriture = useRef<string>(JSON.stringify(readRelecture()));
  /* La ligne de la tournée : une pastille d'en-tête amène l'écran droit sur
     elle, pour que le geste de cochage soit sous les yeux au lieu d'être
     cherché plus bas. */
  const tourneeLigne = useRef<HTMLParagraphElement | null>(null);
  /* L'ancre du relevé de parité : la pastille des clés de l'en-tête ouvre
     l'onglet directement sur lui, sans le chercher sous la liste de relecture. */
  const paritePanneau = useRef<HTMLDivElement | null>(null);
  const focusVu = useRef(0);
  /* Le resserrement du relevé, gardé stable d'un rendu à l'autre : une pastille
     de pose ne le rejoue pas à chaque frappe, et il ne s'efface pas tout seul
     quand le relecteur retire le sien. */
  const pariteFocus = useMemo<PariteFocus | null>(
    () => (focus?.fichier
      ? { fichier: focus.fichier, prefixes: focus.familles ?? [], reste: focus.reste }
      : null),
    [focus],
  );
  /* L'effacement se fait en deux gestes : le premier demande, le second efface. */
  const [confirme, setConfirme] = useState(false);
  /* Le CSV emporte le carnet tel qu'il est au moment du clic : le bouton le dit
     un court instant, pour que le geste ne reste pas sans réponse. */
  const [emporte, setEmporte] = useState(false);
  /* La liste collée répond elle aussi : copiée, ou refusée par le navigateur. */
  const [copie, setCopie] = useState<'non' | 'ok' | 'echec'>('non');
  const minuterie = useRef<number | null>(null);
  const minuterieCsv = useRef<number | null>(null);
  const minuterieCopie = useRef<number | null>(null);

  useEffect(() => {
    /* Le carnet ne s'écrit que s'il a changé : le panneau ne réécrit pas ce
       qu'il vient de lire, sinon un geste venu de l'en-tête se rejouerait en
       boucle. */
    const propre = JSON.stringify(etat);
    if (propre === derniereEcriture.current) return;
    derniereEcriture.current = propre;
    writeRelecture(etat);
  }, [etat]);

  /* Le carnet peut être écrit ailleurs — la miniature de l'en-tête ferme une
     tournée d'un coup sans ouvrir le panneau. L'écran relit alors ce carnet,
     pour que les cases, les comptes et la frise ne racontent pas une version
     plus ancienne que celle de l'en-tête. */
  useEffect(() => {
    const relire = () => {
      const lu = readRelecture();
      derniereEcriture.current = JSON.stringify(lu);
      setEtat((avant) => (JSON.stringify(avant) === JSON.stringify(lu) ? avant : lu));
    };
    window.addEventListener(RELECTURE_AVIS, relire);
    return () => window.removeEventListener(RELECTURE_AVIS, relire);
  }, []);

  /* Le resserrement se retient d'une visite à l'autre : le panneau se rouvre
     dans l'état où il a été laissé, sans re-cliquer les mêmes jetons. */
  useEffect(() => {
    saveRelectureFiltre({ langue: langueSeule, desaccord });
  }, [langueSeule, desaccord]);

  /* La porte de l'en-tête pose ce qu'elle nomme : une langue seule, ou le
     désaccord entre les deux — et amène le panneau à l'écran. Deux clics sur
     la même porte se distinguent par l'instant, pour qu'elle réponde toujours. */
  useEffect(() => {
    if (!focus || focus.at === focusVu.current) return undefined;
    focusVu.current = focus.at;
    setLangueSeule(focus.parite ? null : focus.langue ?? null);
    setDesaccord(focus.parite ? false : focus.desaccord === true);
    /* Une pastille de tournée pose son resserrement avec les autres : un écran
       arrivé par cette porte montre les dix écrans de sa tournée, pas les
       trente. La première tournée reste celle qu'une porte sans rang nomme. */
    setTournee(
      focus.parite
        ? null
        : typeof focus.tournee === 'number'
          ? focus.tournee
          : focus.tournee === true
            ? RELECTURE_TOURNEE_1.id
            : null,
    );
    /* La cible se relit dans la minuterie, après le rendu qu'appelle le
       resserrement : la ligne de la tournée n'existe pas encore au moment où
       l'effet s'exécute, et la viser trop tôt ramènerait au haut du panneau. */
    const timer = window.setTimeout(() => {
      const cible = focus.parite
        ? paritePanneau.current
        : focus.tournee
          ? tourneeLigne.current ?? panneau.current
          : panneau.current;
      cible?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
    return () => window.clearTimeout(timer);
  }, [focus]);

  useEffect(() => {
    if (!emporte) return undefined;
    minuterieCsv.current = window.setTimeout(() => setEmporte(false), 4000);
    return () => {
      if (minuterieCsv.current) window.clearTimeout(minuterieCsv.current);
    };
  }, [emporte]);

  useEffect(() => () => {
    if (minuterie.current) window.clearTimeout(minuterie.current);
    if (minuterieCopie.current) window.clearTimeout(minuterieCopie.current);
  }, []);

  const compte = compteRelecture(etat);
  /* Ce que chaque tournée porte et ce qui lui reste, lu sur le même carnet :
     l'arabe se compte d'abord, l'anglais reprend les mêmes écrans. Les jetons
     comme la ligne de travail puisent à cette seule table. */
  const tournees = RELECTURE_TOURNEES.map((rang) => ({
    tournee: rang,
    compte: compteTournee(etat, rang),
  }));
  const tourneeActive = tournee
    ? tournees.find((entree) => entree.tournee.id === tournee) ?? null
    : null;
  const compteTourneeActive = tourneeActive?.compte ?? null;
  const rangsTourneeActive = tourneeActive ? rangsTournee(tourneeActive.tournee) : null;
  /* Le côté par lequel la tournée continue : l'arabe tant qu'il n'est pas
     complet, puis l'anglais sur les mêmes écrans. Le geste de la ligne coche
     ce côté-là, et la pastille de l'en-tête suit jusqu'au bout. */
  const coteTournee = tourneeActive ? prochainCoteTournee(etat, tourneeActive.tournee) : null;
  const resteDuCote = !compteTourneeActive || !coteTournee
    ? 0
    : coteTournee === 'ar'
      ? compteTourneeActive.resteAr
      : compteTourneeActive.resteEn;
  /* Le premier écran que la tournée n'a pas encore fermé, et son adresse : la
     ligne le propose comme porte, pour enchaîner la relecture sans chercher
     son rang plus bas dans les trente. */
  const premierReste = tourneeActive ? premierEcranTournee(etat, tourneeActive.tournee) : null;
  const reprise = premierReste !== null ? adresseEcran(premierReste) : null;
  /* Les pages où l'arabe et l'anglais ne s'accordent pas. */
  const unCote = pagesUnCote(etat);
  /* La liste réellement affichée : une langue nommée garde ses pages encore à
     cocher, le jeton garde les pages en désaccord, la tournée garde les dix
     premiers écrans, et les trois se composent. */
  const visibles = RELECTURE_LIGNES.filter((ligne) => {
    if (rangsTourneeActive && !rangsTourneeActive.includes(ligne.n)) return false;
    if (langueSeule && etat[langueSeule].includes(ligne.n)) return false;
    if (desaccord && !unCote.includes(ligne.n)) return false;
    return true;
  });
  const resserre = Boolean(langueSeule) || desaccord || tournee;

  /* L'écran qui suit chaque ligne dans la liste telle qu'elle s'affiche : la
     porte « écran suivant » avance d'un cran dans ce qu'on est en train de
     lire, resserrement compris, et s'arrête à la dernière ligne visible. */
  const suivants = new Map<number, number>();
  visibles.forEach((ligne, i) => {
    const apres = visibles[i + 1];
    if (apres) suivants.set(ligne.n, apres.n);
  });

  /* Ce qu'il reste à cocher après chaque ligne, dans la liste affichée : la
     porte l'annonce avec le rang suivant, pour doser l'effort du passage avant
     de l'entamer. Le compte écarte les écrans déjà fermés des deux côtés — un
     rang coché n'est plus un rang à faire —, et ne regarde que ce qui est
     visible : un resserrement sur une tournée dose la tournée, pas les trente
     pages. */
  const restantsApres = new Map<number, number>();
  visibles.forEach((ligne, i) => {
    const restants = visibles
      .slice(i + 1)
      .filter((apres) => !etat.ar.includes(apres.n) || !etat.en.includes(apres.n)).length;
    restantsApres.set(ligne.n, restants);
  });

  const basculer = (langue: RelectureLangue, n: number) => {
    setConfirme(false);
    setEtat((avant) => {
      const pose = avant[langue].includes(n);
      const liste = pose ? avant[langue].filter((rang) => rang !== n) : [...avant[langue], n];
      return { ...avant, [langue]: liste.sort((a, b) => a - b) };
    });
  };

  /* Le geste de la frise : un seul clic ferme l'écran des deux côtés — l'arabe
     et l'anglais ensemble —, un second le rouvre. C'est la façon de finir une
     tournée d'un trait sans descendre jusqu'à la ligne de la liste. Rien
     d'autre ne bouge : les autres rangs gardent leurs cases. */
  const basculerDeux = (n: number) => {
    setConfirme(false);
    setEtat((avant) => {
      const ferme = avant.ar.includes(n) && avant.en.includes(n);
      if (ferme) {
        return {
          ar: avant.ar.filter((rang) => rang !== n),
          en: avant.en.filter((rang) => rang !== n),
        };
      }
      return {
        ar: Array.from(new Set([...avant.ar, n])).sort((a, b) => a - b),
        en: Array.from(new Set([...avant.en, n])).sort((a, b) => a - b),
      };
    });
  };

  /* Le geste d'une tranche entière : les dix écrans d'un coup, dans les deux
     langues. Tant qu'un écran reste ouvert, il les ferme ; une tranche faite
     des deux côtés se rouvre d'un second clic. Rien hors de la tranche ne
     bouge, et les cases déjà cochées ne sont pas écrasées. Le geste se note
     avec son instant : la feuille emportée le trace, daté. */
  const basculerBande = (de: number, a: number) => {
    setConfirme(false);
    const rangs = RELECTURE_LIGNES
      .filter((ligne) => ligne.n >= de && ligne.n <= a)
      .map((ligne) => ligne.n);
    if (rangs.length > 0) {
      const ouverts = rangs.filter((n) => !etat.ar.includes(n) || !etat.en.includes(n));
      const tousFermes = ouverts.length === 0;
      /* Le compte atteint : les écrans déjà fermés des deux côtés restent
         acquis, et le geste leur ajoute — ou leur retire — ceux qu'il vient
         de changer. C'est ce chiffre-là que la feuille date avec le geste. */
      const deuxAvant = compteRelecture(etat).deux;
      /* Les écrans que le geste ne touche pas parce qu'ils étaient déjà
         fermés des deux côtés : le compte à côté des écrans touchés sépare
         un vrai changement d'un simple repassage. */
      const deja = rangs.filter(
        (n) => etat.ar.includes(n) && etat.en.includes(n),
      ).length;
      const apres = tousFermes
        ? Math.max(deuxAvant - rangs.length, 0)
        : Math.min(deuxAvant + ouverts.length, RELECTURE_TOTAL);
      noterGesteBande(
        de,
        a,
        !tousFermes,
        tousFermes ? rangs.length : ouverts.length,
        apres,
        deja,
      );
    }
    setEtat((avant) => {
      if (rangs.length === 0) return avant;
      const tousFermes = rangs.every(
        (n) => avant.ar.includes(n) && avant.en.includes(n),
      );
      if (tousFermes) {
        return {
          ar: avant.ar.filter((n) => !rangs.includes(n)),
          en: avant.en.filter((n) => !rangs.includes(n)),
        };
      }
      const ajouter = (liste: number[]) =>
        Array.from(new Set([...liste, ...rangs])).sort((x, y) => x - y);
      return { ar: ajouter(avant.ar), en: ajouter(avant.en) };
    });
  };

  /* La porte de réouverture des tranches ouvertes : elle rend ouvertes, des
     deux côtés, les cases de toutes les tranches qui gardent encore quelque
     chose à finir. Les tranches faites des deux côtés restent intactes — un
     travail achevé ne se défait pas par un clic de trop. */
  const rouvrirOuvertes = () => {
    const ouvertes = tranchesEncoreOuvertes(etat);
    if (ouvertes.length === 0) return;
    setConfirme(false);
    const rangs = RELECTURE_LIGNES.filter((ligne) =>
      ouvertes.some((tranche) => ligne.n >= tranche.de && ligne.n <= tranche.a),
    ).map((ligne) => ligne.n);
    /* Le geste groupé se date, tranche par tranche : une réouverture d'un seul
       clic doit se relire ensuite dans la carte datée de chaque tranche et
       dans les feuilles emportées, comme un geste de tranche ordinaire — sans
       quoi le carnet ne saurait pas que ces écrans ont été rendus ouverts. */
    const deuxAvant = compteRelecture(etat).deux;
    const fermesRendus = rangs.filter(
      (n) => etat.ar.includes(n) && etat.en.includes(n),
    ).length;
    const apres = Math.max(deuxAvant - fermesRendus, 0);
    /* L'instant du clic, calculé une fois : toutes les tranches rouvertes
       portent la même date à la milliseconde, et le carnet les relit comme un
       seul geste — la frise peut alors dire combien de tranches il a touchées. */
    const instant = new Date().toISOString();
    /* Les tranches se notent de la dernière à la première : le carnet range
       les gestes les plus récents en tête, et la première tranche du plan doit
       rester la première de cette réouverture. */
    [...ouvertes].reverse().forEach((tranche) => {
      const dedans = RELECTURE_LIGNES.filter(
        (ligne) => ligne.n >= tranche.de && ligne.n <= tranche.a,
      );
      /* Ce que le clic a réellement rouvert : les écrans qui portaient au moins
         une case. Une tranche ouverte mais vide ne change pas — elle ne se note
         pas, pour ne pas dater un geste qui n'a rien touché. */
      const touchees = dedans.filter(
        (ligne) => etat.ar.includes(ligne.n) || etat.en.includes(ligne.n),
      ).length;
      const deja = dedans.filter(
        (ligne) => etat.ar.includes(ligne.n) && etat.en.includes(ligne.n),
      ).length;
      if (touchees === 0) return;
      noterGesteBande(tranche.de, tranche.a, false, touchees, apres, deja, instant);
    });
    setEtat((avant) => ({
      ar: avant.ar.filter((n) => !rangs.includes(n)),
      en: avant.en.filter((n) => !rangs.includes(n)),
    }));
  };

  /* Les dix écrans d'une tournée d'un geste, dans la langue où elle se tient :
     l'arabe d'abord, puis les mêmes en anglais. Rien n'est effacé — les rangs
     déjà cochés restent, et les autres écrans du plan ne bougent pas. */
  const cocherTournee = () => {
    if (!tourneeActive) return;
    const cote = prochainCoteTournee(etat, tourneeActive.tournee);
    if (!cote) return;
    setConfirme(false);
    setEtat((avant) => marquerTournee(avant, cote, tourneeActive.tournee));
  };

  /* « Retrouver », en tête de frise : la liste se resserre sur la tournée du
     dernier geste et l'écran descend jusqu'à sa ligne — le geste de cochage
     est alors sous les yeux, au lieu d'être cherché plus bas. */
  const voirTournee = (id: number) => {
    setTournee(id);
    setConfirme(false);
    window.setTimeout(() => {
      const cible = tourneeLigne.current ?? panneau.current;
      cible?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  const effacer = () => {
    if (!confirme) {
      setConfirme(true);
      if (minuterie.current) window.clearTimeout(minuterie.current);
      minuterie.current = window.setTimeout(() => setConfirme(false), 5000);
      return;
    }
    if (minuterie.current) window.clearTimeout(minuterie.current);
    setConfirme(false);
    setEtat({ ar: [], en: [] });
  };

  const emporterCsv = () => {
    try {
      telechargerRelectureCsv();
      setEmporte(true);
    } catch {
      /* Un navigateur qui refuse le téléchargement laisse l'écran intact. */
      setEmporte(false);
    }
  };

  /* La même liste, en texte : les trente lignes partent dans le presse-papiers,
     prêtes à être collées dans un message. */
  const copierListe = async () => {
    const parti = await copierRelecture();
    setCopie(parti ? 'ok' : 'echec');
    if (minuterieCopie.current) window.clearTimeout(minuterieCopie.current);
    minuterieCopie.current = window.setTimeout(() => setCopie('non'), 4000);
  };

  return (
    <section className="suivi-block" ref={panneau}>
      <div className="suivi-block-head">
        <h3 className="suivi-block-title">{t('ad.suivi.rlTitle')}</h3>
        <div className="admin-tools">
          <span className="admin-muted suivi-block-note">
            {t('ad.suivi.rlNote')
              .replace('{done}', String(compte.deux))
              .replace('{n}', String(RELECTURE_TOTAL))}
          </span>
          <button
            type="button"
            className="admin-btn"
            title={t('ad.suivi.rlCsvHint')}
            onClick={emporterCsv}
          >
            <i className={emporte ? 'ri-check-line' : 'ri-file-download-line'} aria-hidden="true"></i>
            <span className="whitespace-nowrap">
              {emporte ? t('ad.suivi.rlCsvOk') : t('ad.suivi.rlCsv')}
            </span>
          </button>
          <button
            type="button"
            className="admin-btn"
            title={t('ad.suivi.rlCopyHint')}
            onClick={copierListe}
          >
            <i
              className={
                copie === 'ok'
                  ? 'ri-check-line'
                  : copie === 'echec'
                    ? 'ri-error-warning-line'
                    : 'ri-file-copy-line'
              }
              aria-hidden="true"
            ></i>
            <span className="whitespace-nowrap">
              {copie === 'ok'
                ? t('ad.suivi.rlCopyOk')
                : copie === 'echec'
                  ? t('ad.suivi.rlCopyFail')
                  : t('ad.suivi.rlCopy')}
            </span>
          </button>
          <button
            type="button"
            className="admin-btn"
            title={t('ad.suivi.rlResetHint')}
            onClick={effacer}
          >
            <i className={confirme ? 'ri-alert-line' : 'ri-eraser-line'} aria-hidden="true"></i>
            <span className="whitespace-nowrap">
              {confirme ? t('ad.suivi.rlResetConfirm') : t('ad.suivi.rlReset')}
            </span>
          </button>
        </div>
      </div>

      {/* Les deux jauges : ce qui est relu dans chaque langue, puis les pages
          qui le sont des deux côtés. */}
      <div className="suivi-rl-jauges" dir="ltr">
        {RELECTURE_LANGUES.map((langue) => {
          const fait = compte[langue];
          const part = RELECTURE_TOTAL > 0 ? (fait / RELECTURE_TOTAL) * 100 : 0;
          return (
            <div className="suivi-rl-jauge" key={langue} data-langue={langue}>
              <p className="suivi-rl-jauge-top">
                <span className="suivi-rl-jauge-name">
                  {t(langue === 'ar' ? 'ad.suivi.rlAr' : 'ad.suivi.rlEn')}
                </span>
                <span className="suivi-rl-jauge-num">
                  {fait} / {RELECTURE_TOTAL}
                </span>
              </p>
              <span className="suivi-rl-track" aria-hidden="true">
                <i style={{ width: `${part}%` }} />
              </span>
            </div>
          );
        })}
        <p className="suivi-rl-deux">{t('ad.suivi.rlBoth').replace('{n}', String(compte.deux))}</p>
      </div>

      {/* Les deux resserrements du panneau : le jeton qui isole les pages
          cochées d'un seul côté — là où l'arabe et l'anglais ne s'accordent
          pas —, et la langue nommée par une pastille d'en-tête. Un second clic
          sur le jeton, ou sur la langue, rend les trente pages. */}
      <div className="suivi-rl-filtres" dir="ltr">
        {/* Un jeton par tournée, dans l'ordre du plan : chacun resserre la
            liste sur ses dix écrans et porte, dans son chiffre, ce qu'il lui
            reste à cocher en arabe. Les deux se remplacent l'un l'autre. */}
        {tournees.map(({ tournee: rang, compte: c }) => {
          /* Le survol nomme les écrans qui restent de chaque côté : d'abord
             l'arabe, le côté par lequel la tournée commence, puis l'anglais,
             qui reprend les mêmes écrans. Le relecteur choisit où reprendre
             sans ouvrir les trente lignes. */
          const listeAr = c.restantsAr.map((n) => String(n).padStart(2, '0')).join(', ');
          const listeEn = c.restantsEn.map((n) => String(n).padStart(2, '0')).join(', ');
          const phraseAr =
            c.restantsAr.length === 0
              ? t('ad.suivi.rlTourneeRestNone')
              : t(
                  c.restantsAr.length === 1
                    ? 'ad.suivi.rlTourneeRestArOne'
                    : 'ad.suivi.rlTourneeRestAr',
                ).replace('{list}', listeAr);
          const phraseEn =
            c.restantsEn.length === 0
              ? t('ad.suivi.rlTourneeRestEnNone')
              : t(
                  c.restantsEn.length === 1
                    ? 'ad.suivi.rlTourneeRestEnOne'
                    : 'ad.suivi.rlTourneeRestEn',
                ).replace('{list}', listeEn);
          return (
            <button
              key={rang.id}
              type="button"
              className="suivi-rl-chip"
              data-on={tournee === rang.id ? 'yes' : 'no'}
              aria-pressed={tournee === rang.id}
              aria-label={`${t(rang.id === 1 ? 'ad.suivi.rlTournee1' : 'ad.suivi.rlTournee2')
                .replace('{de}', String(rang.de))
                .replace('{a}', String(rang.a))} · ${phraseAr} · ${phraseEn}`}
              title={`${t('ad.suivi.rlTourneeHint')
                .replace('{de}', String(rang.de))
                .replace('{a}', String(rang.a))} · ${phraseAr} · ${phraseEn}`}
              onClick={() => setTournee((avant) => (avant === rang.id ? null : rang.id))}
            >
              <i className="ri-route-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">
                {t(rang.id === 1 ? 'ad.suivi.rlTournee1' : 'ad.suivi.rlTournee2')
                  .replace('{de}', String(rang.de))
                  .replace('{a}', String(rang.a))}
              </span>
              <b>{c.resteAr}</b>
            </button>
          );
        })}
        <button
          type="button"
          className="suivi-rl-chip"
          data-on={desaccord ? 'yes' : 'no'}
          aria-pressed={desaccord}
          title={t('ad.suivi.rlOneSideHint')}
          onClick={() => setDesaccord((avant) => !avant)}
        >
          <i className="ri-contrast-drop-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">{t('ad.suivi.rlOneSide')}</span>
          <b>{unCote.length}</b>
        </button>
        {langueSeule && (
          <button
            type="button"
            className="suivi-rl-chip"
            data-on="yes"
            title={t('ad.suivi.rlShowAll')}
            onClick={() => setLangueSeule(null)}
          >
            <span className="suivi-rl-chip-lang" aria-hidden="true">
              {langueSeule.toUpperCase()}
            </span>
            <span className="whitespace-nowrap">
              {t(langueSeule === 'ar' ? 'ad.suivi.rlOnlyAr' : 'ad.suivi.rlOnlyEn')}
            </span>
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        )}
        <span className="suivi-rl-filtres-count">
          {resserre
            ? t('ad.suivi.rlShown')
                .replace('{n}', String(visibles.length))
                .replace('{total}', String(RELECTURE_TOTAL))
            : t('ad.suivi.rlAll').replace('{total}', String(RELECTURE_TOTAL))}
        </span>
        {/* La frise des trente écrans : une marque par écran, rangée en
            tranches, pour voir d'un coup d'œil ce qui est fermé des deux
            côtés, ce qui n'est coché que d'un côté et ce qui reste ouvert.
            Une tournée ouverte efface les autres tranches sans les retirer. */}
        <AdminRelectureFrise
          etat={etat}
          tournee={tournee}
          onBascule={basculerDeux}
          onBasculeBande={basculerBande}
          onVoirTournee={voirTournee}
          onRouvrirOuvertes={rouvrirOuvertes}
        />
        {/* La tournée ouverte dit son ordre : l'arabe d'abord, puis la même
            liste en anglais. Le relecteur sait où il en est de chaque côté
            sans compter les cases, et le geste est posé sur cette ligne. */}
        {tourneeActive && compteTourneeActive && (
          <p className="suivi-rl-tournee" ref={tourneeLigne}>
            <i className="ri-route-line" aria-hidden="true"></i>
            <span>
              {t('ad.suivi.rlFirstTenLine')
                .replace('{de}', String(tourneeActive.tournee.de))
                .replace('{a}', String(tourneeActive.tournee.a))
                .replace('{ar}', String(compteTourneeActive.ar))
                .replace('{en}', String(compteTourneeActive.en))
                .replace('{n}', String(compteTourneeActive.total))}
            </span>
            <b>
              {t('ad.suivi.rlFirstTenDone').replace(
                '{n}',
                String(compteTourneeActive.deux),
              )}
            </b>
            {/* La porte de reprise : le premier écran encore non coché de la
                tournée, ouvert dans un autre onglet — pour enchaîner sans
                chercher son rang dans la liste. Il ne paraît que tant qu'il
                reste quelque chose à fermer. */}
            {premierReste !== null && reprise && (
              <Link
                className="suivi-rl-resume"
                to={reprise}
                target="_blank"
                rel="noreferrer"
                title={t('ad.suivi.rlResumeHint').replace('{n}', String(premierReste))}
              >
                <i className="ri-play-circle-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">
                  {t('ad.suivi.rlResume').replace('{n}', String(premierReste))}
                </span>
              </Link>
            )}
            {/* Le geste de la tournée : il coche ses dix écrans du côté où le
                travail se tient, et se tait une fois les deux côtés faits. */}
            {coteTournee ? (
              <button
                type="button"
                className="suivi-rl-mark"
                title={t('ad.suivi.rlMarkHint').replace('{n}', String(resteDuCote))}
                onClick={cocherTournee}
              >
                <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">
                  {t(coteTournee === 'ar' ? 'ad.suivi.rlMarkAr' : 'ad.suivi.rlMarkEn').replace(
                    '{n}',
                    String(resteDuCote),
                  )}
                </span>
              </button>
            ) : (
              <span className="suivi-rl-marked">
                <i className="ri-check-double-line" aria-hidden="true"></i>
                {t('ad.suivi.rlMarkDone')
                  .replace('{done}', String(compteTourneeActive.deux))
                  .replace('{n}', String(compteTourneeActive.total))}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Le vocabulaire figé du §11.2, sous les yeux du relecteur : le même
          mot doit se lire de la même façon d'une page à l'autre, et le tableau
          évite d'aller le chercher dans le document. Chaque cellule arabe
          porte son propre sens de lecture, pour que la liste reste lisible
          quelle que soit la langue de la console. */}
      <div className="suivi-rl-termes" dir="ltr">
        <div className="suivi-rl-termes-head">
          <h4 className="suivi-rl-termes-title">{t('ad.suivi.rlTermesTitle')}</h4>
          <span className="admin-muted suivi-rl-termes-note">
            {t('ad.suivi.rlTermesNote')}
          </span>
        </div>
        <table className="suivi-rl-termes-table">
          <thead>
            <tr>
              <th scope="col">{t('ad.suivi.rlTermesFr')}</th>
              <th scope="col">{t('ad.suivi.rlTermesAr')}</th>
              <th scope="col">{t('ad.suivi.rlTermesEn')}</th>
            </tr>
          </thead>
          <tbody>
            {RELECTURE_TERMES.map((terme) => (
              <tr key={terme.fr}>
                <td className="suivi-rl-terme-fr">{terme.fr}</td>
                <td className="suivi-rl-terme-ar" lang="ar" dir="rtl">
                  {terme.ar}
                </td>
                <td className="suivi-rl-terme-en">{terme.en}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibles.length === 0 ? (
        <p className="suivi-rl-vide">
          <i
            className={desaccord ? 'ri-check-double-line' : 'ri-checkbox-circle-line'}
            aria-hidden="true"
          ></i>
          <span>
            {tourneeActive && !langueSeule && !desaccord
              ? t('ad.suivi.rlTourneeNone')
                  .replace('{de}', String(tourneeActive.tournee.de))
                  .replace('{a}', String(tourneeActive.tournee.a))
              : desaccord
                ? t('ad.suivi.rlOneSideNone')
                : t(langueSeule === 'en' ? 'ad.suivi.rlOnlyEnNone' : 'ad.suivi.rlOnlyArNone')}
          </span>
        </p>
      ) : (
      <ul className="suivi-rl" dir="ltr">
        {visibles.map((ligne) => {
          /* L'adresse que la ligne ouvre : la fiche d'un atelier, une page de
             type, l'onglet des auteurs. La trentième ligne n'en a pas — elle
             décrit des e-mails — et le panneau le dit au lieu d'inventer. */
          const ouvrir = RELECTURE_OUVRIR[ligne.n];
          /* L'écran suivant dans la liste affichée, et son adresse : après le
             cochage, la relecture avance d'un cran sans revenir au haut du
             panneau. */
          const suivant = suivants.get(ligne.n) ?? null;
          const suivantAdresse = suivant !== null ? adresseEcran(suivant) : null;
          /* Ce qui reste après cette ligne dans la liste affichée : la porte
             l'annonce avec le rang suivant, pour doser le passage. */
          const restants = restantsApres.get(ligne.n) ?? 0;
          const avance = etat.ar.includes(ligne.n) || etat.en.includes(ligne.n);
          return (
          <li
            className="suivi-rl-row"
            key={ligne.n}
            data-deux={
              etat.ar.includes(ligne.n) && etat.en.includes(ligne.n) ? 'yes' : 'no'
            }
          >
            <span className="suivi-rl-n">{String(ligne.n).padStart(2, '0')}</span>
            <div className="suivi-rl-body">
              <p className="suivi-rl-page">{ligne.page}</p>
              <p className="suivi-rl-path">
                <span className="suivi-rl-addr">{ligne.path}</span>
                <span className="suivi-rl-sep" aria-hidden="true">
                  ·
                </span>
                <span className="suivi-rl-src">{ligne.textes}</span>
              </p>
              <p className="suivi-rl-watch">{ligne.vigilance}</p>
              {/* La porte de la ligne : le relecteur ne retape plus l'adresse
                  dans un autre onglet. Un nouvel onglet, pour que la liste
                  reste ouverte derrière lui, la case à cocher au retour. */}
              {ouvrir ? (
                <p className="suivi-rl-open-line">
                  <Link
                    className="suivi-rl-open"
                    to={ouvrir}
                    target="_blank"
                    rel="noreferrer"
                    title={t('ad.suivi.rlOpenHint')}
                  >
                    <i className="ri-external-link-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t('ad.suivi.rlOpen')}</span>
                    <code className="suivi-rl-open-addr">{ouvrir}</code>
                  </Link>
                  {/* La porte d'avance : elle ouvre l'écran suivant de la
                      liste, et prend de la couleur dès que cet écran-ci est
                      coché — c'est là qu'on enchaîne. */}
                  {suivant !== null && suivantAdresse && (
                    <Link
                      className="suivi-rl-next"
                      to={suivantAdresse}
                      target="_blank"
                      rel="noreferrer"
                      data-avance={avance ? 'yes' : 'no'}
                      title={`${t('ad.suivi.rlNextHint').replace('{n}', String(suivant))} · ${t('ad.suivi.rlNextRestHint').replace('{n}', String(restants))}`}
                    >
                      <span className="whitespace-nowrap">
                        {t('ad.suivi.rlNext').replace('{n}', String(suivant))}
                      </span>
                      <b className="suivi-rl-next-rest">
                        {t('ad.suivi.rlNextRest').replace('{n}', String(restants))}
                      </b>
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    </Link>
                  )}
                </p>
              ) : (
                <p className="suivi-rl-offsite">
                  <i className="ri-function-line" aria-hidden="true"></i>
                  <span>{t('ad.suivi.rlOffsite')}</span>
                </p>
              )}
            </div>
            <div className="suivi-rl-boxes">
              {RELECTURE_LANGUES.map((langue) => (
                <label
                  className="suivi-rl-box"
                  key={langue}
                  data-on={etat[langue].includes(ligne.n) ? 'yes' : 'no'}
                  title={t(langue === 'ar' ? 'ad.suivi.rlArHint' : 'ad.suivi.rlEnHint')}
                >
                  <input
                    type="checkbox"
                    className="suivi-rl-check"
                    checked={etat[langue].includes(ligne.n)}
                    onChange={() => basculer(langue, ligne.n)}
                    aria-label={`${ligne.page} · ${t(
                      langue === 'ar' ? 'ad.suivi.rlAr' : 'ad.suivi.rlEn',
                    )}`}
                  />
                  <span className="suivi-rl-etiq" aria-hidden="true">
                    {ETIQUETTE[langue]}
                  </span>
                </label>
              ))}
            </div>
          </li>
          );
        })}
      </ul>
      )}

      {/* Le second contrôle du chantier : les trois langues de chaque fichier
          de textes, clé par clé. La liste de relecture dit ce qui est coché ;
          ce relevé dit ce qui manque vraiment. */}
      <div ref={paritePanneau}>
        <AdminParite focus={focus?.parite ? pariteFocus : null} />
      </div>

      <p className="admin-muted admin-journal-note">{t('ad.suivi.rlKeep')}</p>
    </section>
  );
}