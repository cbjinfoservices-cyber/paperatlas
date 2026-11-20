import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Link } from 'react-router-dom';
import { LangSwitch, useLang } from '@/i18n/LangProvider';
import BrandSeal from '@/components/feature/BrandSeal';
import { PLACE_LABEL, SECTION_BEATS } from '@/lib/chapter';
import LateReminderMute from './LateReminderMute';
import { DirTypeLinks } from './nav/DirTypeMenu';
import NavDoorList, { useBoardMenuItems } from './nav/NavDoorList';
import { BASE } from './nav/navShared';
import { DIRECTORY_TRADES } from '@/lib/tradePages';
import {
  doorsIn, doorsLeftIn, endInSightIn, SHEET_DOOR_SELECTOR, phrasePortesAucune,
  phrasePortesRepliees, phrasePortesRestantes, phrasePortesTotales,
  phrasePortesTrouvees, phraseFamilleDepassee, veilHeightIn,
  phrasePortesRubrique,
} from '@/lib/navDoorsLeft';
import { useSpokenOnce } from '@/hooks/useSpokenOnce';
import { useQuietCount } from '@/hooks/useQuietCount';
import { useRubricCountVoice } from '@/hooks/useRubricCountVoice';
import { useSpokenMark } from '@/hooks/useSpokenMark';
import {
  SHEET_DOOR_GROUPS,
  useSheetSearchDoors,
  fold,
  type SheetSearchDoor,
} from './sheetDoors';

type Props = {
  open: boolean;
  onClose: () => void;
  /** L'accueil porte le chapitre et son compte ; les autres pages, non. */
  home: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  pinnedScrolled: boolean;

  onPlatformPage: boolean;
  onSuiviPage: boolean;
  onDirectoryPage: boolean;
  onAuthorsPage: boolean;
  onCandidatesPage: boolean;
  /* La feuille du pied de page qui ouvre les profils fraîchement arrivés :
     elle a sa propre ligne, et prend la marque à la place de « Candidats ». */
  onNewCandidatesPage: boolean;
  onWorldPage: boolean;
  onDemandesPage: boolean;
  onB2bRequestPage: boolean;
  /* La boîte des demandes du compte : la porte de l'atelier prend la marque
     quand on est dessus, comme les autres portes de la feuille. */
  onB2bInboxPage: boolean;
  onOffresPage: boolean;
  /* Le formulaire de dépôt : la porte du travail prend la marque quand on est
     dessus, exactement comme dans le panneau. */
  onDeposerPage: boolean;
  onMessagesPage: boolean;
  onAccountPages: boolean;

  scope: { auteurs: number; annonces: number; emplois: number };
  hintAuthors: string;
  hintListings: string;
  hintJobs: string;

  justRead: string | null;
  justReadPlace: string | null;
  nothingRead: boolean;
  resetDone: boolean;
  readSections: string[];
  places: string[];
  chapterAllRead: boolean;
  resetLabel: string;
  resetNote: string;
  undoChapter: { sections: string[]; places: string[] } | null;
  onResetChapter: () => void;
  onUndoReset: () => void;

  subInView: boolean;
  facHref: string;
  facWord: string;
  facCompte: number;

  signedIn: boolean;
  offersCandidateDoor: boolean;
  ctaHref: string;
  /* L'ancre des derniers arrivés : locale sur l'accueil et l'annuaire, ramenée
     à l'accueil depuis les autres pages — la même règle que le pied de page. */
  latestHref: string;

  isWorkshop: boolean;
  b2bTodo: number;
  b2bLate: number;
  lateMuted: boolean;
  b2bLateHref: string;
  b2bLateRef: string;
  veryLateLabel: string;
  lateSince: string;
  lateDaysLabel: string;
  recallLabel: string;
  recallSourceIcon: string;
  recallSourceLabel: string;
  muteEndLabel: string;

  memberName: string;
  memberWilaya: string;
  unreadApps: number;
  unreadMsgs: number;
  signingOut: boolean;
  onSignOut: () => void;
};

/**
 * La feuille du téléphone : la même barre, dépliée par le bouton du menu.
 * Elle porte un en-tête qui se ferme d'un doigt, le chapitre resserré sur une
 * seule ligne — il se déplie au besoin — puis deux rubriques nettes, le réseau
 * et le travail, et le compte en dernier.
 */
export default function PhoneSheet({
  open, onClose, home, sheetRef, pinnedScrolled,
  onPlatformPage, onSuiviPage, onDirectoryPage, onAuthorsPage,
  onCandidatesPage, onNewCandidatesPage, onWorldPage, onDemandesPage,
  onB2bRequestPage, onOffresPage,
  onB2bInboxPage,
  onDeposerPage,
  onMessagesPage, onAccountPages,
  scope, hintAuthors, hintListings, hintJobs,
  justRead, justReadPlace, nothingRead, resetDone, readSections, places,
  chapterAllRead, resetLabel, resetNote, undoChapter, onResetChapter, onUndoReset,
  subInView, facHref, facWord, facCompte,
  signedIn, offersCandidateDoor, ctaHref, latestHref,
  isWorkshop, b2bTodo, b2bLate, lateMuted, b2bLateHref, b2bLateRef,
  veryLateLabel, lateSince, lateDaysLabel, recallLabel, recallSourceIcon,
  recallSourceLabel, muteEndLabel,
  memberName, memberWilaya, unreadApps, unreadMsgs, signingOut, onSignOut,
}: Props) {
  const { t } = useLang();
  /* Le chapitre tient sur une ligne : son état (compte, lieux, remise à zéro)
     ne se déplie que sur demande, pour que les portes remontent dans la vue. */
  const [chapterOpen, setChapterOpen] = useState(false);
  /* Les deux tableaux de la feuille, avec leurs rubriques derrière la même
     flèche que dans le panneau : un seul menu, deux surfaces. */
  const boardMenus = useBoardMenuItems({
    annonces: hintListings,
    emplois: hintJobs,
    zeroAnnonces: scope.annonces === 0,
    zeroEmplois: scope.emplois === 0,
  });
  /* Les huit types d'établissement dorment sous la porte de l'annuaire : la
     flèche les ouvre à la demande, et la feuille garde ses portes en vue. */
  const [typesOpen, setTypesOpen] = useState(false);
  /* La recherche de l'en-tête : elle lit les portes de la feuille elle-même,
     pour qu'un nom tape juste au lieu de faire défiler le panneau. */
  const [query, setQuery] = useState('');
  const searchDoors = useSheetSearchDoors({ signedIn, ctaHref });
  const needle = fold(query.trim());
  const searching = needle.length > 0;
  const found = searching
    ? searchDoors.filter((door) => (
      fold(door.label).includes(needle) || fold(door.hint).includes(needle)
    ))
    : [];
  /* Les portes trouvées se rangent sous l'intitulé de leur rubrique : on voit
     d'un œil si la réponse vit dans le réseau, dans le travail ou dans le
     compte, au lieu de lire une liste à plat. */
  const foundGroups = SHEET_DOOR_GROUPS
    .map((group) => ({ ...group, doors: found.filter((door) => door.group === group.id) }))
    .filter((group) => group.doors.length > 0);
  /* Les huit types ne se sèment pas parmi les portes : ils s'ouvrent sous
     l'annuaire, à leur place, et c'est leur nom qui s'accuse. */
  const hitTypes = found.filter((door) => Boolean(door.trade)).map((door) => door.trade as string);
  /* Les portes qu'une recherche laisse enfin dans la liste : la flèche du bas
     ne parle plus seule ce moment-là — son chiffre décrivait une liste que la
     question venait de changer. La phrase attend que la frappe se pose, et ne
     revient que si le compte change : trois lettres de plus sans changer le
     nombre de portes ne répètent pas le même mot. À zéro, rien ici — la
     feuille affiche sa ligne « aucune porte ne répond », déjà annoncée comme
     une zone de statut, et la même chose ne se dit pas deux fois. */
  /* Les portes trouvées qui vivent au-delà du filet de famille : celles que le
     mot de couture des résultats nomme dans sa suite. Le chiffre se relève sur
     les portes réellement rendues, jamais sur une addition écrite à la main, et
     il se tait à zéro — la ligne « aucune porte ne répond » parle déjà.

     La famille dont le filet est franchi est nommée elle aussi : c'est la
     rubrique qui tient le mot de couture dans ses résultats, lue sur
     l'intitulé que la feuille affiche déjà, et non sur un nom recopié ici. La
     phrase dit donc de quelle famille il s'agit avant de compter — « Le réseau
     · 2 portes trouvées au-delà du filet de famille ».

     Quand la recherche ne franchit aucun filet de famille, il n'y a pas de
     famille à nommer : la voix basse dit alors le total des portes trouvées —
     « 3 portes trouvées » —, du même mot que le panneau et à la même source.
     Les deux phrases ne parlent donc jamais ensemble : l'une nomme le filet
     franchi, l'autre compte ce que la question a laissé quand rien n'a été
     franchi. */
  const seamGroup = searching
    ? foundGroups.find((group) => group.doors.some((door) => door.seam))
    : undefined;
  const beyondDoors = searching ? found.filter((door) => door.seam).length : 0;
  const beyondText = seamGroup
    ? phraseFamilleDepassee(t(seamGroup.label), beyondDoors, t)
    : '';
  /* Les deux phrases ne parlent jamais ensemble, et elles se lisent côte à
     côte : celle du filet nomme la famille et compte les portes au-delà,
     l'autre dit le total, avec le même mot pour les portes (« door found » /
     « doors found »). Le choix se fait ici, une seule fois, pour que la feuille
     ne puisse pas dire les deux à la fois ni en oublier une à 320 px. */
  const searchDoorsText = searching && found.length > 0
    ? (beyondText || phrasePortesTrouvees(found.length, t))
    : '';
  const searchDoorsRef = useRef(searchDoorsText);
  searchDoorsRef.current = searchDoorsText;
  const [searchSaid, setSearchSaid] = useState('');
  useEffect(() => {
    if (!open || !searching || found.length === 0) {
      setSearchSaid('');
      return undefined;
    }
    const timer = window.setTimeout(() => {
      const phrase = searchDoorsRef.current;
      if (phrase) setSearchSaid(phrase);
    }, 420);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, searching, found.length, beyondDoors, seamGroup?.id]);
  /* La feuille se referme sur une feuille nette : la recherche et les types
     dépliés ne suivent pas la visite suivante. */
  useEffect(() => {
    if (open) return;
    setQuery('');
    setTypesOpen(false);
    /* Refermée : la rubrique repliée ne suit pas la visite suivante. */
    setFoldedDoors(0);
  }, [open]);
  /* La feuille défile, elle aussi : reste-t-il des portes sous le bord ? Le
     même seuil que le panneau, pour que les deux surfaces répondent au même
     signe — un voile et une flèche quand il y a encore à lire, rien quand
     tout tient. */
  const [hasMore, setHasMore] = useState(false);
  /* La feuille défile-t-elle seulement ? Une liste qui tient tout entière n'a
     pas de bout à annoncer : le repère de fin ne paraît que là où il y a
     vraiment eu un défilement — la même règle que le panneau. */
  const [sheetScrolls, setSheetScrolls] = useState(false);
  /* Combien de portes restent sous le bord ? La flèche du bas ne disait que
     « il y en a » ; elle dit maintenant combien, et le chiffre se relit sur la
     géométrie réelle à chaque mesure — une rubrique ouverte, une recherche,
     une ligne qui se replie en arabe, et il suit. */
  const [doorsLeft, setDoorsLeft] = useState(0);
  /* Combien de portes la feuille tient en tout ? Le repère de fin le nomme à
     côté de son mot, sur la même géométrie que le compte restant : le chiffre
     de la flèche se lit alors à côté du total, comme dans le panneau. */
  const [doorsTotal, setDoorsTotal] = useState(0);
  /* Combien de portes la rubrique du travail tient-elle ? Le chiffre se pose à
     côté de son intitulé, pour lire la rubrique sans la déplier — le même
     compte, à la même place, que dans le panneau. */
  const [workDoorsCount, setWorkDoorsCount] = useState(0);
  /* Les deux autres rubriques portent le même compte, à la même place que
     dans le panneau : le réseau et le compte s'annoncent donc d'un coup d'œil,
     et chaque chiffre se relève sur son bloc à elle. */
  const [netDoorsCount, setNetDoorsCount] = useState(0);
  const [accDoorsCount, setAccDoorsCount] = useState(0);
  /* La dernière rubrique repliée : son occasion, et les portes qu'elle tenait.
     Le compte tombe de leur nombre d'un seul geste ; la flèche dit ce qu'elle
     vient de perdre, comme dans le panneau. */
  const [foldSeq, setFoldSeq] = useState(0);
  const [foldedDoors, setFoldedDoors] = useState(0);
  /* Le pied de la feuille est son plancher : sa hauteur est relevée pour que
     le voile et la flèche du bas se tiennent juste au-dessus de lui, au lieu
     de se poser dessus. */
  const footRef = useRef<HTMLDivElement | null>(null);
  const readSheetMore = () => {
    const node = sheetRef.current;
    if (!node) {
      setHasMore(false);
      setSheetScrolls(false);
      setDoorsLeft(0);
      setDoorsTotal(0);
      setWorkDoorsCount(0);
      setNetDoorsCount(0);
      setAccDoorsCount(0);
      return;
    }
    setSheetScrolls(node.scrollHeight - node.clientHeight > 16);
    /* Le bord visible de la liste s'arrête au plancher : ce qui passe dessous
       a déjà été rencontré, ce qui reste sous lui compte encore. */
    const floor = footRef.current?.offsetHeight ?? 0;
    const band = node.getBoundingClientRect().bottom - floor;
    setDoorsLeft(doorsLeftIn(node, SHEET_DOOR_SELECTOR, band));
    /* Le total, lu sur la même géométrie que le compte restant : c'est lui
       que le repère de fin nomme, à côté de son mot. */
    setDoorsTotal(doorsIn(node, SHEET_DOOR_SELECTOR));
    /* Le compte de la rubrique du travail, relevé sur son bloc à elle : la
       même géométrie que le total, mais bornée à la rubrique. */
    /* Le compte de chaque rubrique, relevé sur son bloc à elle : la même
       géométrie que le total, mais bornée à la rubrique. */
    const groupCount = (name: string) => doorsIn(
      node.querySelector<HTMLElement>(`.nav-sheet-group[data-group="${name}"]`),
      SHEET_DOOR_SELECTOR,
    );
    setWorkDoorsCount(groupCount('work'));
    setNetDoorsCount(groupCount('network'));
    setAccDoorsCount(groupCount('account'));
    /* La règle du panneau, telle quelle : dès que le repère de fin entre dans
       la bande visible, plus rien n'est caché sous le filet du plancher — le
       voile et la flèche s'effacent au lieu de se poser sur lui. Le contrôle
       se fait sur le repère lui-même, et non sur une distance au fond : un
       pied anglais replié sur deux lignes, sur un écran court, ne change donc
       rien à la règle. */
    const endInSight = endInSightIn(node, band);
    setHasMore(!endInSight && node.scrollHeight - node.scrollTop - node.clientHeight > 16);
  };
  useEffect(() => {
    setHasMore(false);
    setSheetScrolls(false);
    setDoorsLeft(0);
    setDoorsTotal(0);
    setNetDoorsCount(0);
    setAccDoorsCount(0);
    if (!open) return undefined;
    const node = sheetRef.current;
    if (!node) return undefined;
    readSheetMore();
    node.addEventListener('scroll', readSheetMore, { passive: true });
    window.addEventListener('resize', readSheetMore);
    return () => {
      node.removeEventListener('scroll', readSheetMore);
      window.removeEventListener('resize', readSheetMore);
    };
  }, [open]);
  /* La feuille change de hauteur dès qu'une rubrique s'ouvre — les huit types,
     le chapitre, une recherche — : la mesure suit chaque rendu, sinon la
     flèche manquerait le jour où la liste s'allonge sous elle. */
  useEffect(() => {
    if (!open) return undefined;
    const id = window.requestAnimationFrame(readSheetMore);
    return () => window.cancelAnimationFrame(id);
  });
  /* Le plancher de la feuille, relevé à chaque changement de sa propre
     hauteur : une phrase de plus dans la sortie de compte, ou le passage de
     l'arabe au français qui déplace une pastille à la ligne, et le voile sait
     tout de suite où s'arrêter. Le relevé est pris avant la première peinture,
     pour que la feuille ne montre jamais une image de flèche sur son pied. */
  useLayoutEffect(() => {
    const node = sheetRef.current;
    const foot = footRef.current;
    if (!open || !node || !foot) {
      node?.style.removeProperty('--sheet-foot');
      return undefined;
    }
    /* Un seul relevé par image : la hauteur du pied et la mise en page qu'elle
       entraîne arrivent ensemble. */
    let pending = 0;
    const read = () => {
      node.style.setProperty('--sheet-foot', `${Math.round(foot.offsetHeight)}px`);
      /* Le voile suit la bande réellement visible — le panneau fait de même :
         sur un écran court, un dégradé de 56 px mangerait le repère de fin et
         la dernière porte au lieu de les éclairer. */
      node.style.setProperty(
        '--nav-veil-h',
        `${veilHeightIn(node.clientHeight - foot.offsetHeight)}px`,
      );
      /* Le plancher ne fait pas que relever le voile : il décide du bord
         visible de la liste, donc du compte que porte la flèche. À 320 px en
         arabe, le pied se replie sur deux lignes — la langue, ses pastilles et
         la sortie de compte ne tiennent plus côte à côte — et le chiffre doit
         suivre dans la même image, sinon il annonce encore des portes que le
         plancher a déjà mangées. */
      if (pending) return;
      pending = window.requestAnimationFrame(() => {
        pending = 0;
        readSheetMore();
      });
    };
    read();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const watch = new ResizeObserver(read);
    watch.observe(foot);
    return () => {
      if (pending) window.cancelAnimationFrame(pending);
      pending = 0;
      watch.disconnect();
      node.style.removeProperty('--sheet-foot');
      node.style.removeProperty('--nav-veil-h');
    };
  }, [open]);
  /* Le nom de la feuille porte le total des portes dès la première image : le
     relevé est pris dans la phase de mise en page, avant la peinture, au lieu
     d'attendre la première mesure qui suit le rendu. Ce qu'on lit en entrant
     dans le menu est donc déjà le vrai total, comme dans le panneau. */
  useLayoutEffect(() => {
    if (!open) return;
    readSheetMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  /* Le clavier du téléphone ne rétrécit pas la page, mais le viewport
     visible : la feuille relève cette hauteur et s'y borne, pour que sa fin
     — la langue, la sortie de compte, la flèche du bas — ne passe pas sous
     les touches. Le relevé suit aussi le défilement du viewport, qu'iOS fait
     glisser en même temps que le clavier monte. */
  useEffect(() => {
    if (!open) return undefined;
    const node = sheetRef.current;
    const vp = window.visualViewport;
    if (!node || !vp) return undefined;
    /* Un seul relevé par image : le glissement du viewport et le clavier
       arrivent souvent ensemble, et rien ne sert de mesurer deux fois la même
       mise en page. */
    let pending = 0;
    const queueRead = () => {
      if (pending) return;
      pending = window.requestAnimationFrame(() => {
        pending = 0;
        readSheetMore();
      });
    };
    const apply = () => {
      node.style.setProperty('--sheet-vh', `${Math.round(vp.height)}px`);
      /* La feuille vient de changer de hauteur : le relevé attend la mise en
         page. Mesuré dans le même souffle, il lirait encore l'ancienne bande
         visible — le clavier ouvert, il ne verrait ni les portes passées sous
         le plancher ni celles qui restent sous son bord, et le repère de fin
         comme la flèche répondraient à une géométrie périmée. */
      queueRead();
    };
    apply();
    vp.addEventListener('resize', apply);
    vp.addEventListener('scroll', apply);
    return () => {
      if (pending) window.cancelAnimationFrame(pending);
      pending = 0;
      vp.removeEventListener('resize', apply);
      vp.removeEventListener('scroll', apply);
      node.style.removeProperty('--sheet-vh');
    };
  }, [open, sheetRef]);
  /* La flèche est une porte de lecture, pas une décoration : elle fait
     descendre la feuille d'un écran sans la refermer. */
  const onSheetScrollHint = () => {
    const node = sheetRef.current;
    if (!node) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollBy({
      top: Math.round(node.clientHeight * 0.84),
      behavior: reduced ? 'auto' : 'smooth',
    });
  };
  /* Le repère de fin de liste se dit une seule fois par ouverture : la phrase
     est déposée dans une zone de statut la première fois qu'il paraît, puis
     elle y reste. Un lecteur d'écran qui remonte la feuille ne l'entend donc
     pas une seconde fois — et chaque nouvelle ouverture a droit à la sienne,
     dans la langue lue. */
  /* Le repère de fin ne dit plus seulement qu'on est au bout : il nomme le
     nombre total de portes de la liste. Le compte restant, lui, reste à la
     flèche du bas — les deux chiffres se lisent ensemble, et aucun ne répète
     l'autre. Même tournure que dans le panneau, lue à la même source. */
  const totalDoorsPhrase = phrasePortesTotales(doorsTotal, t);
  const listEndText = totalDoorsPhrase
    ? `${t('navm.listEnd')} · ${totalDoorsPhrase}`
    : t('navm.listEnd');
  const listEndSaid = useSpokenOnce(
    sheetScrolls && open && doorsTotal > 0,
    listEndText,
    open,
  );
  /* « Chapitre terminé » et la confirmation de remise à zéro se disent de la
     même façon, une seule fois par occasion : la marque visible reste muette,
     et une zone de statut présente mais vide dès l'ouverture porte la phrase.
     L'occasion change de nom à chaque événement, pour qu'aucune confirmation ne
     soit tue — ni répétée à chaque battement. */
  const chapterSaid = useSpokenOnce(
    open && (chapterAllRead || resetDone),
    resetDone ? resetNote : t('navm.chapterDone'),
    `${open}|${chapterAllRead}|${resetDone}`,
  );
  /* Le compte de la flèche, avec son accord : une seule porte ne se dit pas
     comme plusieurs, et la phrase vient de la même source que dans le panneau. */
  const doorsLeftPhrase = phrasePortesRestantes(doorsLeft, t);
  /* Le compte de la rubrique du travail, dit à côté de son intitulé — la même
     phrase que dans le panneau, lue à la même source. */
  const workDoorsPhrase = phrasePortesRubrique(workDoorsCount, t);
  const netDoorsPhrase = phrasePortesRubrique(netDoorsCount, t);
  const accDoorsPhrase = phrasePortesRubrique(accDoorsCount, t);
  /* À zéro, la feuille suit le panneau : le compte s'efface avec la flèche et
     c'est la phrase du bout de liste qui prend le relais — la liste ne tient
     plus rien, et cela se dit au lieu de se taire. */
  const doorsVoice = doorsLeft > 0 ? doorsLeftPhrase : phrasePortesAucune(t);
  /* Les portes que le repli vient d'emporter, dites avec leur accord à côté du
     compte relu — la même tournure que dans le panneau, lue à la même source. */
  const foldedDoorsPhrase = phrasePortesRepliees(foldedDoors, t);
  /** Une rubrique de la feuille s'est repliée : une occasion neuve, à dire. */
  const onSheetFold = (doors: number) => {
    if (doors <= 0) return;
    setFoldedDoors(doors);
    setFoldSeq((n) => n + 1);
  };
  /* Le compte de la flèche, dit à voix basse : la même règle que dans le
     panneau — une tournure nouvelle seulement, jamais chaque pixel de
     défilement, et jamais la première mesure d'une ouverture. */
  const doorsLeftSaid = useQuietCount(open && !searching, doorsLeft, doorsVoice, {
    seq: foldSeq,
    doors: foldedDoors,
    phrase: foldedDoorsPhrase,
  });
  /* Le compte de la rubrique que le repli vient d'alléger, dit à voix basse —
     la même règle que dans le panneau, lue sur la même mesure : replier les
     huit types retire huit portes au réseau, et l'intitulé doit le dire. */
  const rubricSaid = useRubricCountVoice(
    open && !searching,
    [
      { id: 'network', label: t('navm.grpNetwork'), count: netDoorsCount },
      { id: 'work', label: t('navm.grpWork'), count: workDoorsCount },
      { id: 'account', label: t('navm.grpAccount'), count: accDoorsCount },
    ],
    foldSeq,
    (label, count) => `${label} · ${phrasePortesRubrique(count, t)}`,
  );
  /* La flèche des huit types est une rubrique comme une autre : repliée, elle
     emporte ses huit pastilles d'un seul geste. Les portes sont comptées avant
     de les refermer — après, elles ne seraient plus là —, et la flèche du bas
     dit alors ce que la liste vient de perdre, exactement comme dans le
     panneau. */
  const toggleTypes = () => {
    if (!typesOpen) {
      setTypesOpen(true);
      return;
    }
    const block = sheetRef.current?.querySelector<HTMLElement>('#nav-sheet-dir-types');
    const doors = block ? block.querySelectorAll('a.nav-dir-type').length : 0;
    setTypesOpen(false);
    if (doors > 0) onSheetFold(doors);
  };
  /* Le rappel B2B se dit une fois par occasion, et l'occasion est l'attente
     elle-même — la même clé que dans le panneau, donc la feuille rouverte
     après lui ne répète pas la phrase. */
  const b2bLateKey = isWorkshop && b2bLate > 0
    ? `b2b-late:${b2bLate}|${b2bLateRef}`
    : '';
  const b2bLateSaid = useSpokenMark(
    b2bLateKey,
    b2bLate === 1 ? t('navm.b2bLateOne') : `${b2bLate} ${t('navm.b2bLate')}`,
  );
  if (!open) return null;

  /** Une porte trouvée : une page, ou un lieu de la page. */
  const doorRow = (door: SheetSearchDoor) => (door.to ? (
    <Link
      key={door.id}
      to={door.to}
      className="nav-mobile-item"
      onClick={onClose}
    >
      <i className={door.icon} aria-hidden="true"></i>
      <span className="nav-mobile-txt">
        <span>{door.label}</span>
        <small>{door.hint}</small>
      </span>
    </Link>
  ) : (
    <a
      key={door.id}
      href={door.href}
      className="nav-mobile-item"
      onClick={onClose}
    >
      <i className={door.icon} aria-hidden="true"></i>
      <span className="nav-mobile-txt">
        <span>{door.label}</span>
        <small>{door.hint}</small>
      </span>
    </a>
  ));

  /** L'annuaire ouvert, ses huit types sous lui : taper le nom d'un type ne
      laisse pas la flèche fermée, il la trouve déjà dépliée. */
  const typesBlock = () => (
    <div className="nav-sheet-hits" key="nav-sheet-hit-types">
      <div className="nav-door-head nav-sheet-annuaire">
        <Link
          to="/annuaire"
          className="nav-mobile-plain"
          onClick={onClose}
        >
          <i className="ri-building-4-line" aria-hidden="true"></i>
          {t('nav.annuaire')}
        </Link>
        <span className="nav-door-toggle is-open" aria-hidden="true">
          <i className="ri-arrow-up-s-line"></i>
        </span>
      </div>
      <DirTypeLinks variant="sheet" onNavigate={onClose} highlight={hitTypes} />
    </div>
  );

  /** Les portes d'une rubrique, les huit types rendus d'un seul bloc.
   *
   * Le mot de couture du pied de page y est posé au même joint que dans la
   * liste : entre les portes qui ferment la parenté de l'annuaire et celles de
   * la suite du réseau. Une porte trouvée au-delà du filet dit donc à quelle
   * famille elle appartient, au lieu de se lire comme une porte d'annuaire de
   * plus sous le même intitulé de rubrique. Ce n'est pas une porte : il ne
   * prend la place d'aucune et n'entre dans aucun compte. */
  const foundRows = (doors: SheetSearchDoor[]) => {
    const rows: ReactNode[] = [];
    let typesPlaced = false;
    let seamPlaced = false;
    doors.forEach((door) => {
      if (door.trade) {
        if (typesPlaced) return;
        typesPlaced = true;
        rows.push(typesBlock());
        return;
      }
      if (door.seam && !seamPlaced) {
        seamPlaced = true;
        rows.push(
          <span className="nav-hit-seam" key="nav-hit-seam">{t('foot.seam')}</span>,
        );
      }
      rows.push(doorRow(door));
    });
    return rows;
  };

  const beatsRead = readSections.length;
  const beatsTotal = SECTION_BEATS.length;
  const chapterPct = Math.round((beatsRead / beatsTotal) * 100);

  return (
    <div className="nav-mobile nav-sheet" ref={sheetRef}>
      {/* L'en-tête nomme la feuille et la referme : un doigt n'a plus à viser
          le bord de l'écran pour retrouver la page. */}
      <div className="nav-sheet-head">
        {/* Le nom de la feuille porte le total des portes, comme celui du
            panneau ouvert : « Mon espace · 34 portes en tout ». Ce qu'on lit
            en entrant dans le menu dit déjà ce qu'il tient, et le compte
            restant — celui de la flèche — n'est pas répété ici. */}
        <p className="nav-sheet-title">
          <span className="nav-sheet-title-name">{t('navm.menuTitle')}</span>
          {totalDoorsPhrase && (
            <span className="nav-sheet-title-n">{totalDoorsPhrase}</span>
          )}
        </p>
        <button
          type="button"
          className="nav-sheet-close"
          onClick={onClose}
          aria-label={t('navm.close')}
          title={t('navm.close')}
        >
          <i className="ri-close-line" aria-hidden="true"></i>
        </button>
      </div>

      {/* Le premier groupe de la feuille reste fixe sous le haut du panneau
          pendant qu'on parcourt le reste : le suivi et le chapitre ne se
          perdent jamais dans le défilement. */}
      <div className={`nav-mobile-pinned nav-sheet-pinned${pinnedScrolled ? ' is-scrolled' : ''}`}>
        {/* La recherche se tient en tête et reste collée au haut du panneau :
            une porte se retrouve en tapant son nom, sans rien parcourir. */}
        <div className="nav-sheet-search" role="search">
          <i className="ri-search-line" aria-hidden="true"></i>
          <input
            type="search"
            className="text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('navm.sheetSearch')}
            aria-label={t('navm.sheetSearch')}
            autoComplete="off"
          />
          {searching && (
            <button
              type="button"
              className="nav-sheet-search-clear"
              onClick={() => setQuery('')}
              aria-label={t('navm.dirSearchClear')}
              title={t('navm.dirSearchClear')}
            >
              <i className="ri-close-line" aria-hidden="true"></i>
            </button>
          )}
        </div>
        {!searching && (
          <>
        <Link
          to="/suivi"
          className={`nav-mobile-item${onSuiviPage ? ' is-current' : ''}`}
          aria-current={onSuiviPage ? 'page' : undefined}
          onClick={onClose}
        >
          <i className="ri-truck-line" aria-hidden="true"></i>
          <span className="nav-mobile-txt">
            <span>{t('nav.suivi')}</span>
            <small>{t('navm.hintTrack')}</small>
          </span>
          {justRead === 'livraison' && (
            <span
              className="nav-mobile-tick nav-mobile-tick--named"
              role="img"
              aria-label={`${t('navm.readTick')} : ${t('nav.suivi')}`}
            >
              <i className="ri-check-line" aria-hidden="true"></i>
              {t('navm.read')} · {t('nav.suivi')}
            </span>
          )}
        </Link>

        {/* Le chapitre sur une seule ligne : le compte, le filet qui se
            remplit, et la flèche qui ouvre le reste — les lieux lus, la
            remise à zéro et les cinq secondes pour revenir en arrière. */}
        {home && (!nothingRead || resetDone) && (
          <div className={`nav-sheet-chapter${chapterOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="nav-sheet-chapter-sum"
              onClick={() => setChapterOpen((v) => !v)}
              aria-expanded={chapterOpen}
              aria-label={`${t('navm.chapter')} — ${beatsRead}/${beatsTotal} ${t('navm.sectionsRead')}`}
              title={chapterOpen ? t('navm.subClose') : t('navm.chapterToggle')}
            >
              <span className="nav-sheet-chapter-lbl">{t('navm.chapter')}</span>
              <span className="nav-sheet-chapter-track" aria-hidden="true">
                <i style={{ width: `${chapterPct}%` }} />
              </span>
              <span className="nav-sheet-chapter-num">{beatsRead}/{beatsTotal}</span>
              {chapterAllRead && (
                <i className="ri-check-double-line nav-sheet-chapter-done" aria-hidden="true"></i>
              )}
              <i
                className={`nav-sheet-chapter-caret ri-${chapterOpen ? 'arrow-up-s' : 'arrow-down-s'}-line`}
                aria-hidden="true"
              ></i>
            </button>
            {chapterOpen && (
              <div className="nav-sheet-chapter-body">
                {places.length > 0 && (
                  <p className="nav-mobile-places">
                    <i className="ri-bookmark-3-line" aria-hidden="true"></i>
                    <span>
                      {t('navm.placesRead')} ·{' '}
                      {places.map((place) => t(PLACE_LABEL[place])).join(' · ')}
                    </span>
                  </p>
                )}
                {chapterAllRead && (
                  <p className="nav-mobile-done">
                    <i className="ri-check-double-line" aria-hidden="true"></i>
                    {t('navm.chapterDone')}
                  </p>
                )}
                <button type="button" className="nav-mobile-reset" onClick={onResetChapter}>
                  <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                  {resetLabel}
                </button>
                <div className="nav-mobile-reset-undo">
                  <p className="nav-mobile-reset-note">
                    {resetDone ? resetNote : ''}
                  </p>
                  {resetDone && undoChapter && (undoChapter.sections.length > 0 || undoChapter.places.length > 0) && (
                    <button
                      type="button"
                      className="nav-mobile-reset-back"
                      onClick={onUndoReset}
                    >
                      <i className="ri-arrow-go-forward-line" aria-hidden="true"></i>
                      {t('navm.undo')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>

      {/* Les portes trouvées prennent la place des rubriques : la question
          posée est déjà la réponse, et la liste reste courte. */}
      {searching ? (
        found.length === 0 ? (
          <div className="nav-sheet-group">
            <p className="nav-sheet-empty" role="status">
              <i className="ri-search-eye-line" aria-hidden="true"></i>
              {t('navm.sheetSearchEmpty')} « {query.trim()} »
            </p>
          </div>
        ) : foundGroups.map((group) => {
          /* Pendant une recherche, l'intitulé de la rubrique dit combien de
             portes la question y laisse : le compte suit la frappe au lieu de
             décrire la liste d'avant. */
          const foundPhrase = phrasePortesRubrique(group.doors.length, t);
          return (
            <div className="nav-sheet-group" key={group.id}>
              <p className="nav-mobile-group">
                <span className="nav-grp-name">{t(group.label)}</span>
                {foundPhrase && (
                  <span
                    className="nav-grp-count"
                    role="img"
                    aria-label={foundPhrase}
                    title={foundPhrase}
                  >
                    {group.doors.length}
                  </span>
                )}
              </p>
              {foundRows(group.doors)}
            </div>
          );
        })
      ) : (
        <>
      {/* Le réseau d'abord : les portes du public, avec leurs types et leurs
          rubriques derrière la même flèche que dans le panneau. */}
      <div className="nav-sheet-group" data-group="network">
        <p className="nav-mobile-group">
          <span className="nav-grp-name">{t('navm.grpNetwork')}</span>
          {netDoorsPhrase && (
            <span
              className="nav-grp-count"
              role="img"
              aria-label={netDoorsPhrase}
              title={netDoorsPhrase}
            >
              {netDoorsCount}
            </span>
          )}
        </p>
        <div className="nav-door-head nav-sheet-annuaire">
          <Link
            to="/annuaire"
            className={[
              'nav-mobile-plain',
              onDirectoryPage ? 'is-current' : '',
              justReadPlace === 'annuaire' ? 'nav-mobile-tick-host' : '',
            ].filter(Boolean).join(' ')}
            aria-current={onDirectoryPage ? 'page' : undefined}
            onClick={onClose}
          >
            <i className="ri-building-4-line" aria-hidden="true"></i>
            {t('nav.annuaire')}
            {justReadPlace === 'annuaire' && (
              <span
                className="nav-link-tick"
                role="img"
                aria-label={`${t('navm.readTick')} : ${t('nav.annuaire')}`}
              >
                <i className="ri-check-line" aria-hidden="true"></i>
                {t('navm.read')} · {t('nav.annuaire')}
              </span>
            )}
          </Link>
          {/* Les huit types ne s'ouvrent plus d'eux-mêmes : la flèche les
              déplie à la demande, et les rubriques remontent dans la vue. */}
          <button
            type="button"
            className={`nav-door-toggle nav-door-toggle--count${typesOpen ? ' is-open' : ''}`}
            aria-expanded={typesOpen}
            aria-controls="nav-sheet-dir-types"
            aria-label={`${t('nav.annuaire')} — ${typesOpen ? t('navm.subClose') : t('navm.dirOpen')} · ${t('navm.dirTypesCount').replace('{n}', String(DIRECTORY_TRADES.length))}`}
            title={`${typesOpen ? t('navm.subClose') : t('navm.dirOpen')} · ${t('navm.dirTypesCount').replace('{n}', String(DIRECTORY_TRADES.length))}`}
            onClick={toggleTypes}
          >
            <b className="nav-door-toggle-n">{DIRECTORY_TRADES.length}</b>
            <i className={typesOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} aria-hidden="true"></i>
          </button>
        </div>
        {typesOpen && (
          <div id="nav-sheet-dir-types">
            <DirTypeLinks variant="sheet" onNavigate={onClose} />
          </div>
        )}
        {/* Les deux tableaux se rangent juste sous l'annuaire, avant les
            auteurs : les annonces et les emplois mènent d'un cran dans le même
            réseau, et la feuille les lit comme le panneau les lit. */}
        <NavDoorList
          items={boardMenus}
          variant="sheet"
          searchPlaceholder={t('navm.boardSearch')}
          onNavigate={onClose}
          onFold={onSheetFold}
        />
        {/* Le filet de la famille : Annonces et Emplois ferment la parenté de
            l'annuaire, et Auteurs reprend dessous — la même couture que celle
            du panneau, à la même hauteur de la liste. */}
        <span className="nav-sheet-rule" aria-hidden="true"></span>
        {/* Le même mot de couture que le pied de page et le panneau « Plus »,
            au même endroit de la liste : sous le filet, avant les autres lieux
            du réseau. */}
        <span className="nav-sheet-seam">{t('foot.seam')}</span>
        <Link
          to="/annuaire?kind=auteurs"
          className={`nav-mobile-item${onAuthorsPage ? ' is-current' : ''}${scope.auteurs === 0 ? ' is-zero' : ''}`}
          aria-current={onAuthorsPage ? 'page' : undefined}
          onClick={onClose}
        >
          <i className="ri-quill-pen-line" aria-hidden="true"></i>
          <span className="nav-mobile-txt">
            <span>{t('dir.kindAuthors')}</span>
            <small>{hintAuthors}</small>
          </span>
        </Link>
        <Link
          to="/candidats"
          className={`nav-mobile-plain${onCandidatesPage && !onNewCandidatesPage ? ' is-current' : ''}`}
          aria-current={onCandidatesPage && !onNewCandidatesPage ? 'page' : undefined}
          onClick={onClose}
        >
          <i className="ri-user-follow-line" aria-hidden="true"></i>
          {t('candlist.short')}
        </Link>
        {/* La porte du pied de page qui manquait à la feuille : les profils
            fraîchement arrivés se lisent sous les candidats, à leur place dans
            le réseau, et prennent la marque quand on est dessus — c'est la
            même liste, ouverte sur sa part neuve. */}
        <Link
          to="/candidats?fresh=1"
          className={`nav-mobile-plain${onNewCandidatesPage ? ' is-current' : ''}`}
          aria-current={onNewCandidatesPage ? 'page' : undefined}
          onClick={onClose}
        >
          <i className="ri-user-star-line" aria-hidden="true"></i>
          {t('candlist.newLink')}
        </Link>
        {/* La page de la seconde marque, dans le groupe du réseau : elle se
            rejoint ici au clavier et au doigt, à la même hauteur que les
            autres portes, sans descendre jusqu'au pied de page. */}
        <Link
          to="/arabe-world"
          className={`nav-mobile-item${onWorldPage ? ' is-current' : ''}`}
          aria-current={onWorldPage ? 'page' : undefined}
          onClick={onClose}
        >
          <i className="ri-global-line" aria-hidden="true"></i>
          <span className="nav-mobile-txt">
            <span>{t('navm.world')}</span>
            <small>{t('navm.hintWorld')}</small>
          </span>
        </Link>
        {/* Les trois guichets ferment le réseau : ils ne sont plus une rubrique
            du travail, et la feuille les range là où le panneau les range. */}
        <Link
          to="/demandes"
          className={`nav-mobile-item${onDemandesPage ? ' is-current' : ''}`}
          aria-current={onDemandesPage ? 'page' : undefined}
          onClick={onClose}
        >
          <i className="ri-survey-line" aria-hidden="true"></i>
          <span className="nav-mobile-txt">
            <span>{t('nav.demandes')}</span>
            <small>{t('navm.hintDemandes')}</small>
          </span>
        </Link>
      </div>

      {/* Le travail ensuite : le lieu de la page, la demande B2B et les offres.
          Les trois guichets, eux, ont rejoint le réseau avec l'annuaire. */}
      <div className="nav-sheet-group" data-group="work">
        <p className="nav-mobile-group">
          <span className="nav-grp-name">{t('navm.grpWork')}</span>
          {workDoorsPhrase && (
            <span
              className="nav-grp-count"
              role="img"
              aria-label={workDoorsPhrase}
              title={workDoorsPhrase}
            >
              {workDoorsCount}
            </span>
          )}
        </p>
        <a
          className={['nav-mobile-plain', subInView ? 'is-current' : ''].filter(Boolean).join(' ')}
          href={`${BASE}/#soustraitance`}
          aria-current={subInView ? 'location' : undefined}
          onClick={onClose}
        >
          <i className="ri-stack-line" aria-hidden="true"></i>
          {t('foot.sub')}
        </a>
        {/* Le raccourci du lieu, juste sous sa porte : l'annuaire déjà filtré
            sur le façonnage, sans repasser par la carte. */}
        {justReadPlace === 'soustraitance' ? (
          <Link
            to={facHref}
            className="nav-mobile-read"
            aria-label={`${t('navm.readTick')} : ${t('foot.sub')} — ${t(facWord)} ${facCompte}`}
            title={`${t(facWord)} · ${facCompte} ${t('navm.faconActive')}`}
            onClick={onClose}
          >
            <i className="ri-check-line" aria-hidden="true"></i>
            <span>{t('navm.read')} · {t('foot.sub')}</span>
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </Link>
        ) : (
          <Link to={facHref} className="nav-mobile-sub" onClick={onClose}>
            <i className="ri-scissors-cut-line" aria-hidden="true"></i>
            <span>{t(facWord)}</span>
            <span className="nav-sub-count">{facCompte}</span>
            <small>{t('navm.faconActive')}</small>
          </Link>
        )}
        {/* La demande B2B est une porte à part entière maintenant que le
            guichet a rejoint le réseau : elle prend la forme des autres portes
            du travail, et se lit exactement comme dans le panneau. */}
        <Link
          to="/demande-b2b"
          className={`nav-mobile-item${onB2bRequestPage ? ' is-current' : ''}`}
          aria-current={onB2bRequestPage ? 'page' : undefined}
          onClick={onClose}
        >
          <i className="ri-inbox-archive-line" aria-hidden="true"></i>
          <span className="nav-mobile-txt">
            <span>{t('nav.b2b')}</span>
            <small>{t('navm.b2bSub')}</small>
          </span>
        </Link>
        {/* Atelier : les demandes reçues portent un nom à elles, pour ne plus
            se confondre avec le formulaire juste au-dessus. */}
        {isWorkshop && (
          <Link
            to="/compte#demandes-b2b"
            className={`nav-mobile-item nav-sheet-inbox${onB2bInboxPage ? ' is-current' : ''}`}
            aria-current={onB2bInboxPage ? 'page' : undefined}
            onClick={onClose}
          >
            <i className="ri-inbox-line" aria-hidden="true"></i>
            <span className="nav-mobile-txt">
              <span>{t('navm.b2bInbox')}</span>
              <small>{b2bTodo > 0 ? `${b2bTodo} ${t('nav.b2bTodo')}` : t('navm.b2bNone')}</small>
            </span>
            {b2bTodo > 0 && (
              <span className="nav-badge nav-badge--flat">{b2bTodo}</span>
            )}
          </Link>
        )}
        {/* Le même rappel que dans le panneau, sous la porte qu'il concerne —
            et il est la porte : un doigt ouvre la boîte déjà coupée sur les
            demandes qui attendent depuis trop longtemps. */}
        {isWorkshop && b2bLate > 0 && (
          <Link
            to={b2bLateHref}
            className={`nav-mobile-late${lateMuted ? ' is-muted' : ''}`}
            title={b2bLateRef
              ? `${t('navm.b2bLateGo')} · ${b2bLateRef}`
              : t('navm.b2bLateGo')}
            onClick={onClose}
          >
            <i className="ri-time-line" aria-hidden="true"></i>
            <span className="nav-mobile-late-txt">
              <span>
                {b2bLate === 1
                  ? t('navm.b2bLateOne')
                  : `${b2bLate} ${t('navm.b2bLate')}`}
              </span>
              {veryLateLabel && (
                <span className="nav-mobile-late-week">{veryLateLabel}</span>
              )}
              {lateSince && (
                <small>
                  {t('navm.b2bLateSince')} {lateSince}
                  {lateDaysLabel && (
                    <span className="nav-mobile-late-days"> · {lateDaysLabel}</span>
                  )}
                </small>
              )}
              {recallLabel && (
                <small className="nav-mobile-late-recall">
                  {recallSourceIcon && (
                    <span className="nav-late-recall-src" title={recallSourceLabel}>
                      <i className={recallSourceIcon} aria-hidden="true"></i>
                    </span>
                  )}
                  {recallLabel}
                  {muteEndLabel && ` · ${muteEndLabel}`}
                </small>
              )}
            </span>
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </Link>
        )}
        {isWorkshop && b2bLate > 0 && <LateReminderMute surface="sheet" />}
        {/* Le rappel reste une porte : son texte se lit quand on y arrive. Ce
            qu'il ne fait pas, c'est se répéter — la phrase est déposée une
            seule fois par attente, dans une zone de statut. */}
        <p className="nav-end-said" role="status" aria-live="polite">{b2bLateSaid}</p>

        <Link
          to="/offres"
          className={['nav-mobile-plain', justReadPlace === 'offres' || onOffresPage ? 'is-current' : '']
            .filter(Boolean).join(' ')}
          aria-current={onOffresPage ? 'page' : undefined}
          onClick={onClose}
        >
          <i className="ri-price-tag-3-line" aria-hidden="true"></i>
          {t('nav.offres')}
          {justReadPlace === 'offres' && (
            <span
              className="nav-link-tick"
              role="img"
              aria-label={`${t('navm.readTick')} : ${t('nav.offres')}`}
            >
              <i className="ri-check-line" aria-hidden="true"></i>
              {t('navm.read')} · {t('nav.offres')}
            </span>
          )}
        </Link>
        {/* Les deux portes du pied de page qui manquaient au travail : déposer
            une annonce ou une offre, puis les derniers arrivés — avec leurs
            signes du bas de page, pour qu'une même porte se reconnaisse aux
            deux endroits. Le repère du bout de liste les compte comme les
            autres : leur nombre tombe de la géométrie réelle. */}
        <Link
          to="/deposer"
          className={`nav-mobile-item${onDeposerPage ? ' is-current' : ''}`}
          aria-current={onDeposerPage ? 'page' : undefined}
          onClick={onClose}
        >
          <i className="ri-upload-cloud-2-line" aria-hidden="true"></i>
          <span className="nav-mobile-txt">
            <span>{t('foot.deposit')}</span>
            <small>{t('navm.hintDeposit')}</small>
          </span>
        </Link>
        <a
          href={latestHref}
          className="nav-mobile-item"
          onClick={onClose}
        >
          <i className="ri-time-line" aria-hidden="true"></i>
          <span className="nav-mobile-txt">
            <span>{t('foot.latest')}</span>
            <small>{t('navm.hintLatest')}</small>
          </span>
        </a>
        {offersCandidateDoor && (
          <Link to="/compte/inscription/candidat" className="nav-mobile-cand" onClick={onClose}>
            <i className="ri-id-card-line" aria-hidden="true"></i>
            {t('nav.candCta')}
          </Link>
        )}
        {/* La porte de conversion ferme la rubrique du travail : on ne la
            cherche pas en bas de la page. */}
        {!(onAccountPages && !signedIn) && (
          <a className="nav-mobile-plain nav-sheet-join" href={ctaHref} onClick={onClose}>
            <i className="ri-send-plane-line" aria-hidden="true"></i>
            {t('nav.rejoindre')}
          </a>
        )}
      </div>

      {/* Le compte en dernier, sous son propre intitulé. */}
      <div className="nav-sheet-group" data-group="account">
        <p className="nav-mobile-group">
          <span className="nav-grp-name">{t('navm.grpAccount')}</span>
          {accDoorsPhrase && (
            <span
              className="nav-grp-count"
              role="img"
              aria-label={accDoorsPhrase}
              title={accDoorsPhrase}
            >
              {accDoorsCount}
            </span>
          )}
        </p>
        {signedIn && (
          <Link
            to="/messages"
            className={`nav-mobile-plain${onMessagesPage ? ' is-current' : ''}`}
            aria-current={onMessagesPage ? 'page' : undefined}
            onClick={onClose}
          >
            <i className="ri-chat-3-line" aria-hidden="true"></i>
            {t('nav.messages')}
            {unreadMsgs > 0 && (
              <span className="nav-badge nav-badge--flat">
                {unreadMsgs} {t('nav.msgsUnread')}
              </span>
            )}
          </Link>
        )}
        <Link
          to={signedIn ? '/compte#mes-candidatures' : '/compte/connexion'}
          className={signedIn ? 'nav-sheet-member-link' : 'nav-mobile-plain'}
          onClick={onClose}
        >
          {signedIn ? (
            <>
              {/* Le même cachet que dans la barre et l'espace compte, posé
                  devant le nom du membre. */}
              <BrandSeal className="nav-sheet-seal" />
              <span className="nav-mobile-member">
                <b>{memberName || t('nav.compte')}</b>
                {memberWilaya && <small>{memberWilaya}</small>}
                {unreadApps > 0 && (
                  <span className="nav-badge nav-badge--flat">
                    {unreadApps} {t('nav.appsUnread')}
                  </span>
                )}
              </span>
            </>
          ) : (
            <>
              <i className="ri-user-line" aria-hidden="true"></i>
              {t('nav.signin')}
            </>
          )}
        </Link>
        {onAccountPages && !signedIn && (
          <Link to="/compte/inscription" className="nav-mobile-plain" onClick={onClose}>
            <i className="ri-user-add-line" aria-hidden="true"></i>
            {t('nav.signupCta')}
          </Link>
        )}
      </div>
        </>
      )}
      {/* La liste a un bout : quand la feuille défile vraiment, un petit repère
          la ferme, juste au-dessus de son plancher. Il est dans le flux — il ne
          recouvre aucune porte et son arrivée ne fait rien sauter — et il ne
          paraît jamais dans une liste qui tient tout entière. */}
      {sheetScrolls && (
        <p className="nav-sheet-end" aria-hidden="true">
          <i className="ri-check-line" aria-hidden="true"></i>
          <span>{t('navm.listEnd')}</span>
        </p>
      )}
      {/* Le même mot, dit une seule fois, pour qui lit à l'oreille : le repère
          visible est une marque, la phrase ci-dessus est son annonce. */}
      <p className="nav-end-said" role="status" aria-live="polite">{listEndSaid}</p>
      {/* La même zone porte les deux phrases du chapitre : la fin et la remise
          à zéro se disent donc comme le bout de la liste — une fois, dans la
          langue lue, et jamais deux fois pour le même événement. */}
      <p className="nav-end-said" role="status" aria-live="polite">{chapterSaid}</p>
      {/* Le compte de la flèche, dit à voix basse : une tournure nouvelle
          seulement, et une fois le compte posé. */}
      <p className="nav-end-said" role="status" aria-live="polite">{doorsLeftSaid}</p>
      {/* Le compte de la rubrique que le repli vient d'alléger : « Le réseau ·
          12 portes », une fois la mesure posée — jamais un chiffre deviné. */}
      <p className="nav-end-said" role="status" aria-live="polite">{rubricSaid}</p>
      {/* Pendant une recherche, c'est le nombre de portes trouvées qui parle :
          la flèche se tait alors, et son compte ne double plus la phrase. */}
      <p className="nav-end-said" role="status" aria-live="polite">{searchSaid}</p>
      {/* Le pied de la feuille est son plancher, comme celui du panneau : la
          langue et la sortie de compte ne défilent plus avec les portes, elles
          les attendent en bas. Collé au bord, il ne laisse donc plus le voile
          ni la flèche se poser sur lui, et sa hauteur est relevée pour que le
          voile s'arrête juste au-dessus de son filet. Son filet s'accuse dès
          qu'une porte est passée derrière lui, exactement comme le liseré du
          bloc collé : la séparation ne se devine qu'au moment où elle sert. */}
      <div
        className={`nav-sheet-foot${pinnedScrolled ? ' is-scrolled' : ''}`}
        ref={footRef}
      >
        <span className="nav-sheet-foot-lang">
          <i className="ri-translate-2" aria-hidden="true"></i>
          {t('navm.langLabel')}
        </span>
        <LangSwitch compact />
        {signedIn && (
          <button
            type="button"
            className="nav-sheet-foot-out"
            onClick={onSignOut}
            disabled={signingOut}
          >
            <i className="ri-logout-box-r-line" aria-hidden="true"></i>
            <span>{t('acct.signout')}</span>
          </button>
        )}
      </div>
      {/* Des portes restent sous la ligne : le même voile que dans le panneau
          éteint la dernière porte lisible, et la même petite flèche cerclée
          se pose dessus. Elle ne prend aucune place dans la liste — son
          arrivée ne fait pas sauter les dernières portes — et elle s'efface
          dès que le fond de la feuille est en vue. */}
      {hasMore && (
        <button
          type="button"
          className="nav-more-more nav-sheet-more"
          aria-label={doorsLeftPhrase
            ? `${t('navm.moreBelow')} · ${doorsLeftPhrase}`
            : t('navm.moreBelow')}
          title={doorsLeftPhrase
            ? `${t('navm.moreBelow')} · ${doorsLeftPhrase}`
            : t('navm.moreBelow')}
          onClick={onSheetScrollHint}
        >
          {/* Le compte des portes restantes se pose dans la flèche elle-même :
              la flèche dit toujours où l'on va, le chiffre dit ce qui reste
              avant le plancher. Un chiffre, jamais une promesse. */}
          <span aria-hidden="true" className={doorsLeft > 0 ? 'has-n' : undefined}>
            <i className="ri-arrow-down-s-line"></i>
            {doorsLeft > 0 && <b className="nav-more-cue-n">{doorsLeft}</b>}
          </span>
        </button>
      )}
    </div>
  );
}