import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomRegion } from '@/lib/regionLabels';
import { nomPays } from '@/lib/pays';
import { slugDeTrade } from '@/lib/tradePages';
import { ligneCompte } from '@/lib/accords';
import { paysFiches, regionFiches, tradeFiches } from '@/lib/annuaireDoors';
import CopyTextButton from '@/components/feature/CopyTextButton';
import WalkDeadTag from './WalkDeadTag';
import WalkLostTag from './WalkLostTag';
import {
  clearWalkBook,
  readPaysWalk,
  readRegionWalk,
  readTradeWalk,
  type PaysWalk,
  type RegionStop,
  type RegionWalk as Walk,
  type TradeWalk,
  type WalkBook,
} from '@/lib/regionWalk';
import '@/components/feature/region-walk.css';

type Props = {
  /** En arrivant sur la page, dire à voix basse ce que le relevé rappelle. */
  announceOnMount?: boolean;
  /** Poser le chiffre des carnets en tête du relevé, avant les carnets
      eux-mêmes : sur la page de suivi, il se lit dès l'ouverture. */
  headCount?: boolean;
  /** Poser, sur une fiche, le compte de chaque porte et le repère de porte
      vide — ce que le suivi dit déjà en tête. Le chiffre des carnets, lui,
      reste sous le relevé : la fiche garde son ordre de lecture. */
  doorCounts?: boolean;
  /** Combien de profils la liste tient encore : la ligne des portes vides le
      dit à sa suite, pour relier le parcours au compte des résultats. */
  held?: number;
  /** Combien de profils de la liste ont une porte vide : le jeton le dit à
      côté de lui, sans rien resserrer. */
  lost?: number;
  /** Sur quelles portes ce compte s'appuie : région, métier. */
  lostBy?: { region: number; trade: number };
};

/** La liste d'un lieu, resserrée sur sa région et son pays. */
const hrefOf = (stop: RegionStop) => {
  const params = new URLSearchParams();
  params.set('wilaya', stop.wilaya);
  if (stop.pays) params.set('pays', stop.pays);
  return `/annuaire?${params.toString()}`;
};

/** La liste d'un pays entier. */
const paysHrefOf = (code: string) => `/annuaire?pays=${encodeURIComponent(code)}`;

/** La liste d'un métier : sa page dédiée, ou le filtre du tableau. */
const tradeHrefOf = (trade: string) => {
  const slug = slugDeTrade(trade);
  return slug ? `/annuaire/${slug}` : `/annuaire?trade=${encodeURIComponent(trade)}`;
};

/* Combien de fiches la liste d'un lieu tient encore : c'est ce que la pastille
   annonce au survol, avant d'ouvrir la liste. Le compte vit dans
   `annuaireDoors`, pour que le vivier lise la même source que le relevé. */
/* Les trois carnets du parcours : le chiffre du bas se compte sur eux. */
const BOOKS = 3;

const EMPTY_WALK: Walk = { stops: [], last: null };
const EMPTY_PAYS: PaysWalk = { stops: [], last: null };
const EMPTY_TRADE: TradeWalk = { stops: [], last: null };

/* Le mot que porte chaque gomme, et la phrase qui dit le carnet effacé. */
const WIPE_LABEL: Record<WalkBook, string> = {
  region: 'pro.walkWipeRegion',
  pays: 'pro.walkWipePays',
  trade: 'pro.walkWipeTrade',
};

const WIPED_SAID: Record<WalkBook, string> = {
  region: 'pro.walkRegionWiped',
  pays: 'pro.walkPaysWiped',
  trade: 'pro.walkTradeWiped',
};

const COUNT_KEY: Record<WalkBook, string> = {
  region: 'pro.regionWalk',
  pays: 'pro.paysWalk',
  trade: 'pro.tradeWalk',
};

/* Le nom court d'un carnet, pour le survol du jeton : « régions, métiers ». */
const NAME_KEY: Record<WalkBook, string> = {
  region: 'pro.walkNameRegion',
  pays: 'pro.walkNamePays',
  trade: 'pro.walkNameTrade',
};

/** La page d'où la ligne part : la ligne copiée dit où elle a été prise, pour
    que celui qui la reçoit sache de quelle fiche on lui parle. */
const whereKey = (path: string): string => {
  if (path.startsWith('/suivi')) return 'pro.walkWhereSuivi';
  if (path.startsWith('/entreprise')) return 'pro.walkWhereAtelier';
  if (path.startsWith('/auteur')) return 'pro.walkWhereAuteur';
  if (path.startsWith('/candidats')) {
    return path === '/candidats' ? 'pro.walkWherePool' : 'pro.walkWhereCandidat';
  }
  if (path.startsWith('/annonces')) return 'pro.walkWhereAnnonce';
  if (path.startsWith('/emplois')) return 'pro.walkWhereOffre';
  return 'pro.walkWhereDirectory';
};

/**
 * Le parcours dans l'annuaire, dit sous le plan de la fiche.
 *
 * La fiche est le lieu où l'on s'arrête : la ligne rappelle combien de régions
 * ont été traversées dans le tableau, et rouvre la dernière d'un clic — on
 * revient là où la lecture s'était arrêtée sans repasser par le menu. Les
 * pays ouverts se comptent de la même façon, à côté : un pays se traverse
 * sans région, et l'on y revient plus souvent qu'à l'une de ses villes. Les
 * métiers, eux aussi, se lisent à part : un métier se traverse sans lieu.
 *
 * Sous chaque ligne, les lieux eux-mêmes se lisent en pastilles, le plus
 * récent d'abord : chacune rend sa liste resserrée. La pastille du dernier
 * reste allumée — c'est celle que la porte rouvre.
 *
 * Chaque compteur se tait tant qu'un seul lieu a été vu : un lieu seul ne
 * fait pas un parcours.
 *
 * Sous chaque carnet, une petite gomme efface ce carnet-là, et lui seul : qui
 * efface ses pays garde ses régions. Le geste se fait en deux temps — le
 * premier efface le mot au profit d'une question, le second oublie vraiment.
 * Un parcours se perd d'un clic par inadvertance ; il ne s'efface pas de la
 * même façon.
 *
 * Enfin, parce que la porte change de page, le lieu repris est dit à voix
 * basse avant le départ, dans une zone invisible — et chaque pastille en fait
 * autant, puisque le métier ne s'annonce pas de la même façon qu'une région :
 * il mène à la page de son type, non à une liste resserrée. Sur la page de
 * suivi, où l'on arrive sans savoir ce qu'on y trouvera, le relevé dit de
 * lui-même, en arrivant, combien de lieux il rappelle.
 *
 * Sous les trois carnets, un chiffre ferme le relevé : combien d'entre eux
 * parlent encore. Trois carnets se remplissent à trois rythmes, et l'on veut
 * savoir d'un coup d'œil ce que la fiche peut encore rappeler. Quand un seul
 * carnet parle encore, le chiffre nomme lequel : « 1 » seul ne dit pas ce
 * qu'il rappelle, et le suivi s'ouvre sur ce chiffre-là.
 */
export default function RegionWalk({
  announceOnMount = false,
  headCount = false,
  doorCounts = false,
  held,
  lost = 0,
  lostBy,
}: Props) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  /* La page où la ligne se lit : elle se nomme dans le texte copié. */
  const path = useLocation().pathname;
  const [walk, setWalk] = useState<Walk>(EMPTY_WALK);
  const [paysWalk, setPaysWalk] = useState<PaysWalk>(EMPTY_PAYS);
  const [tradeWalk, setTradeWalk] = useState<TradeWalk>(EMPTY_TRADE);
  /* La gomme qui attend son second geste : ce carnet-là, et lui seul. */
  const [ask, setAsk] = useState<WalkBook | null>(null);
  /* Le jeton du suivi : ne garder que les carnets dont une porte ne mène plus à
     rien, avant d'en ouvrir un. */
  const [onlyDead, setOnlyDead] = useState(false);
  /* Le compte des portes se lit partout où l'on veut savoir ce qu'elles
     tiennent encore : en tête du suivi, et sur les fiches d'annonce et
     d'offre, qui partagent déjà le relevé. */
  const counts = headCount || doorCounts;
  /* La phrase que les lecteurs d'écran prononcent : elle se vide avant d'être
     réécrite, pour qu'un même lieu repris deux fois soit dit deux fois. */
  const [said, setSaid] = useState('');
  const sayTimer = useRef<number | undefined>(undefined);
  const goTimer = useRef<number | undefined>(undefined);
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  /* L'arrivée ne se dit qu'une fois, même si un carnet bouge ensuite. */
  const arrived = useRef(false);

  /* Les carnets vivent sur l'appareil : ils se lisent une fois la fiche ouverte. */
  useEffect(() => {
    setWalk(readRegionWalk());
    setPaysWalk(readPaysWalk());
    setTradeWalk(readTradeWalk());
    return () => {
      window.clearTimeout(sayTimer.current);
      window.clearTimeout(goTimer.current);
    };
  }, []);

  /* La question posée, le curseur se pose sur le geste qui efface : on ne
     laisse pas le visiteur chercher où confirmer. */
  useEffect(() => {
    if (ask) confirmRef.current?.focus();
  }, [ask]);

  const announceThenGo = (message: string, href: string) => {
    setSaid('');
    window.clearTimeout(sayTimer.current);
    window.clearTimeout(goTimer.current);
    sayTimer.current = window.setTimeout(() => setSaid(message), 60);
    goTimer.current = window.setTimeout(() => navigate(href), 420);
  };

  const speak = (message: string) => {
    setSaid('');
    window.clearTimeout(sayTimer.current);
    sayTimer.current = window.setTimeout(() => setSaid(message), 60);
  };

  /* Chaque porte reste, même quand sa liste ne tient plus rien : un lieu
     traversé se nomme, il ne s'efface pas. La pastille dit alors « aucune
     fiche » au lieu de compter zéro. */
  const stops = walk.stops;
  const regionVisible = stops.length >= 2 && !!walk.last;
  const recent = [...stops].reverse();

  const paysStops = paysWalk.stops;
  const paysVisible = paysStops.length >= 2 && !!paysWalk.last;
  const recentPays = [...paysStops].reverse();

  const tradeStops = tradeWalk.stops;
  const tradeVisible = tradeStops.length >= 2 && !!tradeWalk.last;
  const recentTrades = [...tradeStops].reverse();

  /* Combien de carnets parlent encore : un carnet entamé compte, même s'il ne
     paraît pas encore — une seule région ne fait pas une ligne, mais elle est
     bel et bien retenue. */
  const filled = [walk.stops.length, paysWalk.stops.length, tradeWalk.stops.length].filter(
    (n) => n > 0,
  ).length;

  /* Le compte d'une pastille, accordé au nombre qu'elle annonce. Une liste
     vide ne s'écrit pas « 0 fiche » : elle se nomme. */
  const fichesLine = (n: number) => (n === 0
    ? t('pro.walkFicheNone')
    : ligneCompte(n, 'pro.walkFicheOne', 'pro.walkFicheMany', t));

  /* Les portes que le relevé rappelle — la dernière de chaque carnet, puis
     chaque pastille traversée —, et parmi elles celles qui ne mènent plus à
     aucune fiche. Le suivi le dit en tête, avant le premier clic : on sait
     ce qu'on ouvre avant de l'ouvrir. */
  /* Chaque carnet compte ses portes, et celles qui ne mènent plus à rien,
     pour lui seul : le relevé entier en fait la somme, et le relevé resserré
     par le jeton reprend les mêmes comptes sur les seuls carnets qu'il garde.
     La dernière porte d'un carnet paraît aussi parmi ses pastilles — le compte
     la suit, comme la phrase le fait déjà. */
  const regionDoors = regionVisible ? 1 + stops.length : 0;
  const paysDoors = paysVisible ? 1 + paysStops.length : 0;
  const tradeDoors = tradeVisible ? 1 + tradeStops.length : 0;
  const doors = regionDoors + paysDoors + tradeDoors;

  const regionDeadDoors =
    (regionVisible && !!walk.last && regionFiches(walk.last) === 0 ? 1 : 0)
    + stops.filter((stop) => regionFiches(stop) === 0).length;
  const paysDeadDoors =
    (paysVisible && !!paysWalk.last && paysFiches(paysWalk.last) === 0 ? 1 : 0)
    + paysStops.filter((code) => paysFiches(code) === 0).length;
  const tradeDeadDoors =
    (tradeVisible && !!tradeWalk.last && tradeFiches(tradeWalk.last) === 0 ? 1 : 0)
    + tradeStops.filter((code) => tradeFiches(code) === 0).length;
  const deadDoors = regionDeadDoors + paysDeadDoors + tradeDeadDoors;

  /* Le nom de chaque porte vide, avec les mots qu'elle porte elle-même :
     « Rouvrir Oran », « Rouvrir l'Algérie », « Rouvrir l'imprimerie ». Il se
     range carnet par carnet, pour que la ligne copiée puisse ne nommer que les
     carnets que le jeton a retenus. */
  const regionDeadNamed: string[] = [];
  if (regionVisible && walk.last && regionFiches(walk.last) === 0) {
    regionDeadNamed.push(
      t('pro.regionWalkBack').replace('{region}', nomRegion(walk.last.wilaya, lang)),
    );
  }
  stops.forEach((stop) => {
    if (regionFiches(stop) === 0) {
      regionDeadNamed.push(t('pro.regionWalkBack').replace('{region}', nomRegion(stop.wilaya, lang)));
    }
  });

  const paysDeadNamed: string[] = [];
  if (paysVisible && paysWalk.last && paysFiches(paysWalk.last) === 0) {
    paysDeadNamed.push(t('pro.paysWalkBack').replace('{pays}', nomPays(paysWalk.last, lang)));
  }
  paysStops.forEach((code) => {
    if (paysFiches(code) === 0) {
      paysDeadNamed.push(t('pro.paysWalkBack').replace('{pays}', nomPays(code, lang)));
    }
  });

  const tradeDeadNamed: string[] = [];
  if (tradeVisible && tradeWalk.last && tradeFiches(tradeWalk.last) === 0) {
    tradeDeadNamed.push(t('pro.tradeWalkBack').replace('{trade}', t(`trade.${tradeWalk.last}`)));
  }
  tradeStops.forEach((code) => {
    if (tradeFiches(code) === 0) {
      tradeDeadNamed.push(t('pro.tradeWalkBack').replace('{trade}', t(`trade.${code}`)));
    }
  });

  /* Le survol dit ce que le compte ne dit pas : quelle porte, et pourquoi.
     Chacune se nomme une seule fois, la phrase de la liste vide après son nom. */
  const deadDoorsList = Array.from(new Set([
    ...regionDeadNamed,
    ...paysDeadNamed,
    ...tradeDeadNamed,
  ]));

  const deadDoorsTitle = deadDoors > 0
    ? deadDoorsList
      .map((name) => `${name} — ${t('pro.walkGoEmpty')}`)
      .join(' · ')
    : undefined;

  /* Chaque carnet sait s'il porte une porte vide : le jeton du suivi ne garde
     que ceux-là, et les autres restent retenus, simplement hors de vue. */
  const regionDead =
    (regionVisible && !!walk.last && regionFiches(walk.last) === 0)
    || stops.some((stop) => regionFiches(stop) === 0);
  const paysDead =
    (paysVisible && !!paysWalk.last && paysFiches(paysWalk.last) === 0)
    || paysStops.some((code) => paysFiches(code) === 0);
  const tradeDead =
    (tradeVisible && !!tradeWalk.last && tradeFiches(tradeWalk.last) === 0)
    || tradeStops.some((code) => tradeFiches(code) === 0);
  const deadBooks = (regionDead ? 1 : 0) + (paysDead ? 1 : 0) + (tradeDead ? 1 : 0);
  /* Le jeton nomme les carnets qu'il garde, avant le clic : « régions,
     métiers ». Le compte dit combien, le survol dit lesquels. */
  const deadBookNames = ([
    regionDead ? t(NAME_KEY.region) : '',
    paysDead ? t(NAME_KEY.pays) : '',
    tradeDead ? t(NAME_KEY.trade) : '',
  ] as string[]).filter(Boolean).join(', ');
  /* Un carnet effacé pendant que le jeton est posé peut retirer la dernière
     porte vide : le filtre se défait alors de lui-même, plutôt que de laisser
     un relevé vide sous un jeton disparu. */
  const filterDead = onlyDead && deadBooks > 0;

  /* Le relevé resserré : le jeton posé, la ligne copiée ne parle plus que des
     carnets qu'il garde — elle décrit alors ce que le lecteur a sous les yeux,
     et non le relevé entier d'avant le clic. */
  const keptRegion = !filterDead || regionDead;
  const keptPays = !filterDead || paysDead;
  const keptTrade = !filterDead || tradeDead;
  const copiedDoors =
    (keptRegion ? regionDoors : 0) + (keptPays ? paysDoors : 0) + (keptTrade ? tradeDoors : 0);
  const copiedDead =
    (keptRegion ? regionDeadDoors : 0)
    + (keptPays ? paysDeadDoors : 0)
    + (keptTrade ? tradeDeadDoors : 0);
  const copiedNames = Array.from(new Set([
    ...(keptRegion ? regionDeadNamed : []),
    ...(keptPays ? paysDeadNamed : []),
    ...(keptTrade ? tradeDeadNamed : []),
  ]));

  /* La phrase du relevé, accordée à ce qu'elle compte : la même se dit du
     relevé entier comme du relevé resserré, avec leurs chiffres à chacun. */
  const deadSentenceOf = (total: number, dead: number) => {
    if (total === 0) return '';
    if (dead === 0) return t('pro.walkDeadNone');
    if (dead === 1) return t('pro.walkDeadOne').replace('{total}', String(total));
    return t('pro.walkDeadMany')
      .replace('{n}', String(dead))
      .replace('{total}', String(total));
  };

  /* La phrase du relevé, telle qu'elle se lit à l'écran. */
  const deadSentence = deadSentenceOf(doors, deadDoors);

  /* Ce que la ligne donne à copier : d'abord la page et le jour — la ligne
     part souvent dans un message, et son destinataire ne voit ni la fiche ni
     l'écran d'où elle vient —, puis la phrase elle-même, puis chaque porte
     nommée avec son état. Le jour se lit au moment du geste. */
  /* Ce que la liste tient encore, accordé à son nombre. La phrase se pose sous
     la ligne des portes vides : le parcours et le compte des résultats se
     lisent alors d'un même regard, sans changer de page. */
  const heldLine = held === undefined
    ? ''
    : t(held === 1 ? 'pro.walkHeldOne' : 'pro.walkHeldMany').replace('{n}', String(held));

  const deadText = () => {
    if (!deadSentence) return '';
    const day = new Intl.DateTimeFormat(lang, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
    return [
      `${t(whereKey(path))} · ${day}`,
      deadSentenceOf(copiedDoors, copiedDead),
      /* Le jeton posé, le texte dit aussi ce que le relevé resserré ne montre
         plus : qui le lit ailleurs sait quels carnets ont été écartés. */
      ...(filterDead && removedSaid ? [removedSaid] : []),
      ...(heldLine ? [heldLine] : []),
      ...(copiedDead > 0
        ? copiedNames.map((name) => `${name} — ${t('pro.walkGoEmpty')}`)
        : []),
    ].join('\n');
  };

  /* Posé, le jeton dit combien de carnets restent lisibles : le relevé
     resserré ne montre que ceux-là. */
  const keptLine = deadBooks > 0
    ? ligneCompte(deadBooks, 'pro.walkKeptOne', 'pro.walkKeptMany', t)
    : '';

  /* Le survol du jeton : les carnets qu'il garde, nommés avant le clic — et,
     une fois posé, combien d'entre eux restent lisibles. */
  /* Les carnets que le jeton posé a retirés : visibles avant le clic, sans
     porte vide. Le relevé resserré dit aussi ce qu'il ne montre plus. */
  const removedArr = ([
    regionVisible && !regionDead ? t(NAME_KEY.region) : '',
    paysVisible && !paysDead ? t(NAME_KEY.pays) : '',
    tradeVisible && !tradeDead ? t(NAME_KEY.trade) : '',
  ] as string[]).filter(Boolean);
  const removedNames = removedArr.join(', ');
  /* Un seul carnet retiré se dit au singulier : « retiré : le métier ». La
     phrase s'accorde donc au nombre, ici comme dans la voix qui la dit. */
  const removedPhrase = removedNames
    ? t(removedArr.length === 1 ? 'pro.walkRemovedOne' : 'pro.walkRemoved').replace(
      '{names}',
      removedNames,
    )
    : '';
  const removedSaid = removedNames
    ? t(removedArr.length === 1 ? 'pro.walkRemovedSaidOne' : 'pro.walkRemovedSaid').replace(
      '{names}',
      removedNames,
    )
    : '';

  const toggleDead = () => {
    if (filterDead) {
      speak(t('pro.walkLooseSaid'));
    } else {
      speak(
        `${t('pro.walkTightSaid').replace('{kept}', keptLine)}${deadBookNames ? ` ${deadBookNames}.` : ''}${removedSaid ? ` ${removedSaid}` : ''}`,
      );
    }
    setOnlyDead((on) => !on);
  };

  /* Les deux listes du survol du jeton, une fois posé : ce qu'il garde, puis
     ce qu'il écarte. Chacune se lit sur sa ligne, dans le panneau du survol. */
  const keptSolo = deadBooks === 1;
  const keptNames = keptSolo
    ? (regionDead ? t('pro.walkNameRegionOne') : paysDead ? t('pro.walkNamePaysOne') : t('pro.walkNameTradeOne'))
    : deadBookNames;
  const keptHint = keptNames
    ? t(keptSolo ? 'pro.walkHintKeptOne' : 'pro.walkHintKept').replace('{names}', keptNames)
    : keptLine;

  /* Le survol du geste de copie dit ce que le texte emporte, avant le clic :
     la page d'où la ligne part et le jour où elle se lit, puis les portes
     nommées. Faute de ces deux repères, le texte collé dans un message
     surprendrait son destinataire ; ici, il s'annonce. */
  const copyDay = new Intl.DateTimeFormat(lang, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  const copyHint = [
    `${t(whereKey(path))} · ${copyDay}`,
    ...(filterDead && removedSaid ? [removedSaid] : []),
    ...(heldLine ? [heldLine] : []),
    ...(copiedDead > 0
      ? copiedNames.map((name) => `${name} — ${t('pro.walkGoEmpty')}`)
      : []),
    t('pro.walkDeadCopyHint'),
  ].join(' · ');

  /* La petite ligne qui dit combien des portes rappelées ne mènent plus à
     aucune fiche. Elle se pose en tête du suivi, sous le chiffre des carnets,
     et sous le relevé quand celui-ci ferme une fiche — l'atelier, la plume, le
     candidat : les quatre lectures disent la même chose, au même endroit du
     regard. Elle se copie d'un geste, portes nommées et état compris. */
  const deadLine = deadSentence ? (
    <div
      className={`dist-walk-dead${deadDoors === 0 ? ' is-clear' : ''}`}
      title={deadDoorsTitle}
    >
      <i
        className={deadDoors === 0 ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}
        aria-hidden="true"
      ></i>
      <span>{deadSentence}</span>
      {/* Le compte des résultats, posé à la suite des portes : le vivier dit
          d'un même souffle d'où l'on vient et combien de profils y restent. */}
      {heldLine && <span className="dist-walk-dead-held">{heldLine}</span>}
      <CopyTextButton
        className="dist-walk-copy"
        build={deadText}
        label={t('pro.walkDeadCopy')}
        hint={copyHint}
      />
    </div>
  ) : null;

  /* Le carnet qui parle seul, quand les autres se sont tus : son nom se dit
     sous le chiffre, qui reste sans mot de lui-même. */
  const onlyBook = filled !== 1
    ? ''
    : walk.stops.length > 0
      ? 'pro.walkOnlyRegion'
      : paysWalk.stops.length > 0
        ? 'pro.walkOnlyPays'
        : 'pro.walkOnlyTrade';

  /* En arrivant, le relevé dit ce qu'il rappelle : combien de lieux, et de
     métiers. Rien tant qu'aucun carnet n'a de quoi paraître. */
  useEffect(() => {
    if (!announceOnMount || arrived.current) return;
    const parts: string[] = [];
    if (regionVisible) parts.push(t('pro.walkSumRegion').replace('{n}', String(walk.stops.length)));
    if (paysVisible) parts.push(t('pro.walkSumPays').replace('{n}', String(paysWalk.stops.length)));
    if (tradeVisible) parts.push(t('pro.walkSumTrade').replace('{n}', String(tradeWalk.stops.length)));
    if (!parts.length) return;
    arrived.current = true;
    const message = t('pro.walkArriveSaid').replace('{parts}', parts.join(' · '));
    /* La phrase est posée après le montage : une zone d'annonce écrite trop tôt
       n'est pas toujours lue par les lecteurs d'écran. Le minuteur n'est pas
       effacé au changement de dépendance — l'annonce ne doit pas se perdre si
       un compteur se réécrit dans la même seconde. */
    sayTimer.current = window.setTimeout(() => setSaid(message), 420);
  }, [announceOnMount, regionVisible, paysVisible, tradeVisible, walk, paysWalk, tradeWalk, t]);

  /* Le premier geste : la question remplace la gomme, le carnet reste intact. */
  const askWipe = (book: WalkBook) => {
    setAsk(book);
    speak(t('pro.walkWipeOneAsk'));
  };

  /* Le second geste, ou le renoncement : ce carnet-là s'oublie, ou reste. */
  const wipe = (book: WalkBook) => {
    clearWalkBook(book);
    if (book === 'region') setWalk(EMPTY_WALK);
    if (book === 'pays') setPaysWalk(EMPTY_PAYS);
    if (book === 'trade') setTradeWalk(EMPTY_TRADE);
    setAsk(null);
    speak(t(WIPED_SAID[book]));
  };

  const keepWalk = () => {
    setAsk(null);
    speak(t('pro.walkKept'));
  };

  /* La petite gomme d'un carnet, puis sa question. Elle ne touche jamais aux
     autres carnets : chacune ne connaît que le sien. */
  const foot = (book: WalkBook) => {
    if (ask !== book) {
      return (
        <div className="dist-walk-foot">
          <button
            type="button"
            className={`dist-walk-wipe dist-walk-wipe--${book}`}
            onClick={() => askWipe(book)}
            title={t(WIPE_LABEL[book])}
          >
            <i className="ri-eraser-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t(WIPE_LABEL[book])}</span>
          </button>
        </div>
      );
    }
    return (
      <div className="dist-walk-foot">
        <div className="dist-walk-ask" role="group" aria-label={t('pro.walkWipeOneAsk')}>
          <span className="dist-walk-ask-txt">{t('pro.walkWipeOneAsk')}</span>
          <button type="button" className="dist-walk-yes" ref={confirmRef} onClick={() => wipe(book)}>
            <i className="ri-delete-bin-6-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('pro.walkWipeYes')}</span>
          </button>
          <button type="button" className="dist-walk-no" onClick={keepWalk}>
            <span className="whitespace-nowrap">{t('pro.walkWipeNo')}</span>
          </button>
        </div>
      </div>
    );
  };

  if (!regionVisible && !paysVisible && !tradeVisible) {
    /* Un carnet entamé compte même sans ligne : sur la page de suivi, le
       chiffre reste donc seul en tête, pour se lire dès l'ouverture. */
    if (!headCount || filled === 0) {
      /* Aucun carnet à montrer, mais le vivier peut tenir des profils dont la
         porte reste vide : le compte se lit alors seul, dans le même cadre. */
      if (lost > 0) {
        return (
          <div className="dist-walk">
            <div className="dist-walk-tags">
              <WalkLostTag lost={lost} by={lostBy} />
            </div>
            <p className="dist-walk-said" role="status" aria-live="polite" aria-atomic="true">
              {said}
            </p>
          </div>
        );
      }
      /* Le carnet vient d'être effacé, ou la page arrive sans parcours : la
         phrase se dit seule, à qui ne voit pas la ligne disparaître. */
      return (
        <p className="dist-walk-said" role="status" aria-live="polite" aria-atomic="true">
          {said}
        </p>
      );
    }
    return (
      <div className="dist-walk dist-walk--head">
        <div className="dist-walk-top">
          <p className="dist-walk-left dist-walk-left--head" title={t('pro.walkLeftHint')}>
            <i className="ri-booklet-line" aria-hidden="true"></i>
            <span>
              {t('pro.walkLeft')
                .replace('{n}', String(filled))
                .replace('{total}', String(BOOKS))}
            </span>
          </p>
          {onlyBook && <p className="dist-walk-alone">{t(onlyBook)}</p>}
        </div>
        <p className="dist-walk-said" role="status" aria-live="polite" aria-atomic="true">
          {said}
        </p>
      </div>
    );
  }

  const lastRegion = walk.last as RegionStop;
  const region = nomRegion(lastRegion.wilaya, lang);
  const regionHref = hrefOf(lastRegion);

  const openLast = () =>
    announceThenGo(
      t('pro.regionWalkSaid')
        .replace('{region}', region)
        .replace('{n}', String(walk.stops.length)),
      regionHref,
    );

  const lastPays = paysWalk.last as string;
  const paysNom = nomPays(lastPays, lang);
  const paysHref = paysHrefOf(lastPays);

  const openPays = () =>
    announceThenGo(
      t('pro.paysWalkSaid')
        .replace('{pays}', paysNom)
        .replace('{n}', String(paysWalk.stops.length)),
      paysHref,
    );

  const lastTrade = tradeWalk.last as string;
  const tradeNom = t(`trade.${lastTrade}`);
  const tradeHref = tradeHrefOf(lastTrade);

  /* Les trois portes disent, avant le clic, quand leur liste ne tient plus
     rien : la bordure se fait pointillée et l'aiguille d'alerte remplace la
     flèche de retour. Un lieu traversé se nomme, il ne s'efface pas — mais il
     ne promet pas non plus une liste qu'il n'a plus. */
  const regionEmpty = counts && regionFiches(lastRegion) === 0;
  const paysEmpty = counts && paysFiches(lastPays) === 0;
  const tradeEmpty = counts && tradeFiches(lastTrade) === 0;

  const openTrade = () =>
    announceThenGo(
      t('pro.tradeWalkSaid')
        .replace('{trade}', tradeNom)
        .replace('{n}', String(tradeWalk.stops.length)),
      tradeHref,
    );

  /* Une pastille de région ou de pays mène à une liste resserrée ; une
     pastille de métier mène à la page de son type. Les trois le disent à voix
     basse avant de partir, chacune avec ses mots : c'est la destination qui
     change, pas seulement le lieu. */
  const goRegion = (stop: RegionStop) =>
    announceThenGo(
      t('pro.walkRegionGoSaid').replace('{region}', nomRegion(stop.wilaya, lang)),
      hrefOf(stop),
    );

  const goPays = (code: string) =>
    announceThenGo(t('pro.walkPaysGoSaid').replace('{pays}', nomPays(code, lang)), paysHrefOf(code));

  const goTrade = (trade: string) => {
    /* Un métier sans page de type n'a que le tableau filtré : la phrase ne
       promet donc pas une page qui n'existe pas. */
    const message = slugDeTrade(trade)
      ? t('pro.walkTradeGoSaid').replace('{trade}', t(`trade.${trade}`))
      : t('pro.walkTradeGoBoard').replace('{trade}', t(`trade.${trade}`));
    announceThenGo(message, tradeHrefOf(trade));
  };

  const counted = (book: WalkBook) =>
    book === 'region' ? walk.stops.length : book === 'pays' ? paysWalk.stops.length : tradeWalk.stops.length;

  return (
    <div className={`dist-walk${headCount ? ' dist-walk--head' : ''}`}>
      {/* Posé en tête, le chiffre ouvre le relevé au lieu de le fermer :
          c'est la première chose que la page de suivi dit du parcours. */}
      {headCount && (
        <div className="dist-walk-top">
          <p className="dist-walk-left dist-walk-left--head" title={t('pro.walkLeftHint')}>
            <i className="ri-booklet-line" aria-hidden="true"></i>
            <span>
              {t('pro.walkLeft')
                .replace('{n}', String(filled))
                .replace('{total}', String(BOOKS))}
            </span>
          </p>
          {/* Un carnet seul se nomme sous le chiffre : le suivi dit d'emblée
              lequel des trois souvenirs parle encore. */}
          {onlyBook && <p className="dist-walk-alone">{t(onlyBook)}</p>}
        </div>
      )}

      {/* En tête du relevé, avant le premier clic : combien des portes
          rappelées ne mènent plus à aucune fiche. Une ligne calme quand
          toutes mènent encore quelque part. */}
      {headCount && deadLine}

      {/* Le jeton : d'un clic, le relevé ne garde que les carnets dont une
          porte ne mène plus à rien, avant d'en ouvrir un. Les autres carnets
          restent retenus — le jeton les rend d'un second clic. Il se lit en
          tête du suivi et sous le relevé d'une fiche, au même endroit du
          regard ; son survol nomme les carnets qu'il garde. */}
      {headCount && deadBooks > 0 && (
        <WalkDeadTag
          deadBooks={deadBooks}
          on={filterDead}
          kept={keptHint}
          removed={removedPhrase}
          emptyLeft={copiedDead}
          lost={lost}
          lostBy={lostBy}
          hint={t('pro.walkDeadOnlyHint')}
          onToggle={toggleDead}
        />
      )}

      {regionVisible && (!filterDead || regionDead) && (
        <div className="dist-walk-set">
          <p className="dist-walk-line">
            <i className="ri-route-line" aria-hidden="true"></i>
            <span>{t(COUNT_KEY.region).replace('{n}', String(counted('region')))}</span>
            <button
              type="button"
              className={`dist-walk-go${regionEmpty ? ' dist-walk-go--empty' : ''}`}
              onClick={openLast}
              title={`${t('pro.regionWalkHub')} — ${region} · ${regionEmpty ? t('pro.walkGoEmpty') : fichesLine(regionFiches(lastRegion))}`}
            >
              <i className={regionEmpty ? 'ri-error-warning-line' : 'ri-arrow-go-back-line'} aria-hidden="true"></i>
              <span className="whitespace-nowrap">
                {t('pro.regionWalkBack').replace('{region}', region)}
              </span>
              {/* Le chiffre de la dernière liste ouverte, à côté de son nom :
                  la porte dit ce qu'elle rouvre sans attendre le survol. */}
              {counts && (
                <span className="dist-walk-n">
                  <em aria-hidden="true">·</em>
                  <span className="whitespace-nowrap">{fichesLine(regionFiches(lastRegion))}</span>
                </span>
              )}
            </button>
          </p>
          {/* Les régions traversées, la dernière en tête : chaque pastille rend
              sa liste resserrée, sans repasser par le menu des lieux. */}
          <ul className="dist-walk-stops" aria-label={t('pro.regionWalkStops')}>
            {recent.map((stop) => {
              const on = stop.wilaya === lastRegion.wilaya && stop.pays === lastRegion.pays;
              const label = nomRegion(stop.wilaya, lang);
              return (
                <li key={`${stop.pays}:${stop.wilaya}`}>
                  <button
                    type="button"
                    className={`dist-walk-stop${on ? ' is-on' : ''}${counts && regionFiches(stop) === 0 ? ' dist-walk-stop--empty' : ''}`}
                    onClick={() => goRegion(stop)}
                    title={`${t('pro.regionWalkHub')} — ${label} · ${counts && regionFiches(stop) === 0 ? t('pro.walkGoEmpty') : fichesLine(regionFiches(stop))}`}
                    aria-current={on ? 'true' : undefined}
                  >
                    <i className="ri-map-pin-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{label}</span>
                    {/* Le compte de la liste, sur la pastille elle-même : un
                        lieu vide se nomme, il ne s'efface pas. */}
                    {counts && (
                      <span className="dist-walk-stop-n whitespace-nowrap">
                        {fichesLine(regionFiches(stop))}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {foot('region')}
        </div>
      )}

      {paysVisible && (!filterDead || paysDead) && (
        <div className="dist-walk-set dist-walk-set--pays">
          <p className="dist-walk-line">
            <i className="ri-global-line" aria-hidden="true"></i>
            <span>{t(COUNT_KEY.pays).replace('{n}', String(counted('pays')))}</span>
            <button
              type="button"
              className={`dist-walk-go dist-walk-go--pays${paysEmpty ? ' dist-walk-go--empty' : ''}`}
              onClick={openPays}
              title={`${t('pro.paysWalkHub')} — ${paysNom} · ${paysEmpty ? t('pro.walkGoEmpty') : fichesLine(paysFiches(lastPays))}`}
            >
              <i className={paysEmpty ? 'ri-error-warning-line' : 'ri-arrow-go-back-line'} aria-hidden="true"></i>
              <span className="whitespace-nowrap">
                {t('pro.paysWalkBack').replace('{pays}', paysNom)}
              </span>
              {counts && (
                <span className="dist-walk-n">
                  <em aria-hidden="true">·</em>
                  <span className="whitespace-nowrap">{fichesLine(paysFiches(lastPays))}</span>
                </span>
              )}
            </button>
          </p>
          <ul className="dist-walk-stops" aria-label={t('pro.paysWalkStops')}>
            {recentPays.map((code) => {
              const on = code === lastPays;
              return (
                <li key={code}>
                  <button
                    type="button"
                    className={`dist-walk-stop dist-walk-stop--pays${on ? ' is-on' : ''}${counts && paysFiches(code) === 0 ? ' dist-walk-stop--empty' : ''}`}
                    onClick={() => goPays(code)}
                    title={`${t('pro.paysWalkHub')} — ${nomPays(code, lang)} · ${counts && paysFiches(code) === 0 ? t('pro.walkGoEmpty') : fichesLine(paysFiches(code))}`}
                    aria-current={on ? 'true' : undefined}
                  >
                    <i className="ri-global-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{nomPays(code, lang)}</span>
                    {counts && (
                      <span className="dist-walk-stop-n whitespace-nowrap">
                        {fichesLine(paysFiches(code))}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {foot('pays')}
        </div>
      )}

      {tradeVisible && (!filterDead || tradeDead) && (
        <div className="dist-walk-set dist-walk-set--trade">
          <p className="dist-walk-line">
            <i className="ri-briefcase-4-line" aria-hidden="true"></i>
            <span>{t(COUNT_KEY.trade).replace('{n}', String(counted('trade')))}</span>
            <button
              type="button"
              className={`dist-walk-go dist-walk-go--trade${tradeEmpty ? ' dist-walk-go--empty' : ''}`}
              onClick={openTrade}
              title={`${t('pro.tradeWalkHub')} — ${tradeNom} · ${tradeEmpty ? t('pro.walkGoEmpty') : fichesLine(tradeFiches(lastTrade))}`}
            >
              <i className={tradeEmpty ? 'ri-error-warning-line' : 'ri-arrow-go-back-line'} aria-hidden="true"></i>
              <span className="whitespace-nowrap">
                {t('pro.tradeWalkBack').replace('{trade}', tradeNom)}
              </span>
              {counts && (
                <span className="dist-walk-n">
                  <em aria-hidden="true">·</em>
                  <span className="whitespace-nowrap">{fichesLine(tradeFiches(lastTrade))}</span>
                </span>
              )}
            </button>
          </p>
          <ul className="dist-walk-stops" aria-label={t('pro.tradeWalkStops')}>
            {recentTrades.map((code) => {
              const on = code === lastTrade;
              return (
                <li key={code}>
                  <button
                    type="button"
                    className={`dist-walk-stop dist-walk-stop--trade${on ? ' is-on' : ''}${counts && tradeFiches(code) === 0 ? ' dist-walk-stop--empty' : ''}`}
                    onClick={() => goTrade(code)}
                    title={`${t('pro.walkTradeGo').replace('{trade}', t(`trade.${code}`))} · ${counts && tradeFiches(code) === 0 ? t('pro.walkGoEmpty') : fichesLine(tradeFiches(code))}`}
                    aria-current={on ? 'true' : undefined}
                  >
                    <i className="ri-briefcase-4-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t(`trade.${code}`)}</span>
                    {counts && (
                      <span className="dist-walk-stop-n whitespace-nowrap">
                        {fichesLine(tradeFiches(code))}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {foot('trade')}
        </div>
      )}

      {/* Sous les trois carnets, un seul chiffre : combien d'entre eux parlent
          encore, sur les trois. Il remonte en tête sur la page de suivi, et ne
          se dit donc pas deux fois. */}
      {!headCount && (
        <div className="dist-walk-bottom">
          <p className="dist-walk-left" title={t('pro.walkLeftHint')}>
            <i className="ri-booklet-line" aria-hidden="true"></i>
            <span>
              {t('pro.walkLeft')
                .replace('{n}', String(filled))
                .replace('{total}', String(BOOKS))}
            </span>
          </p>
          {/* Le même nom que sur le suivi : un carnet seul se dit sous le
              chiffre, ici comme là. */}
          {onlyBook && <p className="dist-walk-alone">{t(onlyBook)}</p>}
        </div>
      )}

      {/* Sous le relevé d'une fiche — atelier, plume, candidat —, la même
          ligne qu'en tête du suivi : les portes rappelées y sont moins
          nombreuses, et celle qui ne mène plus à rien se dit avant le clic. */}
      {!headCount && deadLine}

      {/* Sous la ligne, le même jeton qu'au suivi : les carnets à porte vide
          se gardent seuls, sans avoir à les chercher dans les trois. */}
      {!headCount && deadBooks > 0 && (
        <WalkDeadTag
          deadBooks={deadBooks}
          on={filterDead}
          kept={keptHint}
          removed={removedPhrase}
          emptyLeft={copiedDead}
          lost={lost}
          lostBy={lostBy}
          hint={t('pro.walkDeadOnlyHint')}
          onToggle={toggleDead}
        />
      )}

      {/* Sans jeton — aucun carnet à porte vide —, le compte du vivier se lit
          seul, à la même place : la liste dit ce qu'elle tient de profils sans
          porte, même quand le parcours n'a rien à resserrer. */}
      {deadBooks === 0 && lost > 0 && (
        <div className="dist-walk-tags">
          <WalkLostTag lost={lost} by={lostBy} />
        </div>
      )}

      {/* Le lieu repris, ou l'arrivée sur la page, dits sans être vus. */}
      <p className="dist-walk-said" role="status" aria-live="polite" aria-atomic="true">
        {said}
      </p>
    </div>
  );
}