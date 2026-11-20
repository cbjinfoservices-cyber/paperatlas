import { Fragment, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang, LangSwitch } from '@/i18n/LangProvider';
import { useAuth } from '@/auth/AuthProvider';
import { useUnreadApplications, useUnreadCount } from '@/hooks/useMessaging';
import { useB2bStats, useB2bTodo } from '@/hooks/useB2b';
import { useChapterRead } from '@/hooks/useChapterRead';
import { usePlaceRead } from '@/hooks/usePlaceRead';
import { waitingDays } from '@/lib/b2b';
import { daysSinceRecall, onLateRecall, readLateRecall } from '@/lib/b2bLateRecall';
import { onLateMute, readLateMute, readLateMuteEnd, type LateMute, type LateMuteEnd } from '@/lib/b2bLateMute';
import LateReminderMute from './LateReminderMute';
import NavLogo from './NavLogo';
import PhoneSheet from './PhoneSheet';
import Footer from './Footer';
import { PLACE_LABEL, SECTION_BEATS, SECTION_LABEL, SECTION_START } from '@/lib/chapter';
import { dayStamp } from '@/lib/dates';
import { comptePerimetre } from '@/lib/scopeCompte';
import { compteMetiers } from '@/lib/metiersCompte';
import { faconnerieHref, faconnageLabelKey } from '@/lib/faconnage';
import DirTypeMenu, { DirTypeLinks } from './nav/DirTypeMenu';
import NavDoorList, { useBoardMenuItems } from './nav/NavDoorList';
import { ligneCompte } from '@/lib/accords';
import { BASE, HOME_BEATS, homeLinks, type Door } from './nav/navShared';
import { DIRECTORY_TRADES } from '@/lib/tradePages';
import {
  doorsIn, doorsLeftIn, endInSightIn, PANEL_DOOR_SELECTOR, phrasePortesAucune,
  phrasePortesRepliees, phrasePortesRestantes, phrasePortesRubrique, phrasePortesTotales, veilHeightIn,
} from '@/lib/navDoorsLeft';
import { useSpokenOnce } from '@/hooks/useSpokenOnce';
import { useQuietCount } from '@/hooks/useQuietCount';
import { useRubricCountVoice } from '@/hooks/useRubricCountVoice';
import { useSpokenMark } from '@/hooks/useSpokenMark';
import '@/components/feature/nav-badge.css';

/* Le pied de page vit désormais dans son propre fichier : la barre garde son
   export, pour que les pages continuent de lire les deux d'un même geste. */
export { Footer };

/** `skip` is off on the public boards: they open on a deeper « to the results » link. */
export function Nav({ variant = 'home', skip = true }: { variant?: 'home' | 'page'; skip?: boolean }) {
  const { t, lang } = useLang();
  const { session, compte, signOut } = useAuth();
  const { pathname, hash, search } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  /* Every secondary door hides behind one « Plus »: the row keeps four plain
     links and never pushes the call to action off the screen. */
  const [moreOpen, setMoreOpen] = useState(false);
  /* Les huit types d'établissement sont repliés sous la porte de l'annuaire :
     la flèche du panneau les ouvre, comme celle de la feuille. */
  const [typesOpen, setTypesOpen] = useState(false);
  /* The account's small doors — B2B, messages, sign-out — live behind the name. */
  const [acctOpen, setAcctOpen] = useState(false);
  /* Le liseré du premier groupe fixe : tant que rien n'a défilé, il n'y a rien
     à séparer ; dès qu'une entrée passe derrière le bloc collé, le trait
     s'accuse — dans le panneau comme dans la feuille du téléphone. */
  const [morePinnedScrolled, setMorePinnedScrolled] = useState(false);
  /* Reste-t-il des portes sous le bord du panneau ? Le voile et la flèche du
     bas ne paraissent que tant que c'est vrai. */
  const [moreHasMore, setMoreHasMore] = useState(false);
  /* Le panneau défile-t-il seulement ? Une liste qui tient tout entière n'a
     pas de bout à annoncer : le repère de fin ne paraît que là où il y a
     vraiment eu un défilement. */
  const [moreScrolls, setMoreScrolls] = useState(false);
  /* Combien de portes restent sous le bord du panneau ? La flèche du bas le
     disait sans le chiffrer ; elle porte maintenant leur compte, relevé sur la
     géométrie réelle à chaque mesure. */
  const [moreDoorsLeft, setMoreDoorsLeft] = useState(0);
  /* Combien de portes la liste tient en tout ? Le repère de fin le dit à côté
     de son mot : le chiffre de la flèche — ce qu'il reste — se lit alors à
     côté du total, au lieu de flotter seul. Relevé sur la même géométrie que
     le compte restant, pour que les deux ne se contredisent jamais. */
  const [moreDoorsTotal, setMoreDoorsTotal] = useState(0);
  /* Combien de portes la rubrique du travail tient-elle ? Le chiffre se pose à
     côté de son intitulé, pour qu'on lise la rubrique sans la déplier. Il est
     relevé sur le bloc de la rubrique elle-même — pas sur le panneau entier,
     qui en tient bien davantage. */
  const [workDoorsCount, setWorkDoorsCount] = useState(0);
  /* Les deux autres rubriques portent le même compte, à la même place : le
     réseau et le compte s'annoncent donc d'un seul coup d'œil, comme le
     travail. Chaque chiffre se relève sur son bloc à elle, jamais sur le
     panneau entier. */
  const [netDoorsCount, setNetDoorsCount] = useState(0);
  const [accDoorsCount, setAccDoorsCount] = useState(0);
  /* La dernière rubrique repliée : son occasion, et les portes qu'elle tenait.
     Le compte des portes restantes tombe d'autant d'un seul geste ; la flèche
     doit pouvoir dire ce qu'elle vient de perdre. */
  const [foldSeq, setFoldSeq] = useState(0);
  const [foldedDoors, setFoldedDoors] = useState(0);
  /* Le repère de fin de liste se dit une fois par ouverture, jamais à chaque
     remontée : la phrase est déposée dans une zone de statut la première fois
     qu'il paraît, puis elle y reste. */
  /* Le repère de fin ne dit plus seulement qu'on est au bout : il nomme aussi
     le nombre total de portes que la liste tient. Le compte restant, lui,
     reste à la flèche du bas — les deux chiffres se lisent ensemble, et aucun
     des deux ne répète l'autre. */
  const totalDoorsPhrase = phrasePortesTotales(moreDoorsTotal, t);
  const listEndText = totalDoorsPhrase
    ? `${t('navm.listEnd')} · ${totalDoorsPhrase}`
    : t('navm.listEnd');
  const listEndSaid = useSpokenOnce(
    moreOpen && moreScrolls && moreDoorsTotal > 0,
    listEndText,
    moreOpen,
  );
  /* Le compte des portes restantes, avec son accord : la phrase est écrite une
     seule fois, pour la flèche du panneau comme pour celle de la feuille. */
  const moreDoorsLeftPhrase = phrasePortesRestantes(moreDoorsLeft, t);
  /* Le compte de la rubrique du travail, dit à côté de son intitulé — la même
     phrase que dans la feuille, lue à la même source. */
  const workDoorsPhrase = phrasePortesRubrique(workDoorsCount, t);
  const netDoorsPhrase = phrasePortesRubrique(netDoorsCount, t);
  const accDoorsPhrase = phrasePortesRubrique(accDoorsCount, t);
  /* À zéro, la phrase du compte s'efface avec la flèche : c'est celle du bout
     de liste qui prend le relais à voix basse — la liste ne tient plus rien,
     et cela se dit au lieu de se taire. */
  const moreDoorsVoice = moreDoorsLeft > 0
    ? moreDoorsLeftPhrase
    : phrasePortesAucune(t);
  /* Les portes que le repli vient d'emporter, dites avec leur accord à côté du
     compte relu : « encore 3 portes plus bas · 4 portes repliées ». */
  const foldedDoorsPhrase = phrasePortesRepliees(foldedDoors, t);
  /** Une rubrique du panneau s'est repliée : une occasion neuve, à dire. */
  const onPanelFold = (doors: number) => {
    if (doors <= 0) return;
    setFoldedDoors(doors);
    setFoldSeq((n) => n + 1);
  };
  /* Le compte, dit à voix basse : seulement quand il change de tournure — de
     une porte à plusieurs, ou l'inverse — et seulement une fois posé. Un
     défilement qui fait passer le chiffre de 7 à 6 ne dit donc rien, et la
     liste ne devient pas un compteur qu'on écoute. */
  const moreDoorsLeftSaid = useQuietCount(moreOpen, moreDoorsLeft, moreDoorsVoice, {
    seq: foldSeq,
    doors: foldedDoors,
    phrase: foldedDoorsPhrase,
  });
  /* Le compte d'une rubrique, dit à voix basse quand un repli le fait changer :
     replier les huit types retire huit portes au réseau, et la pastille de
     l'intitulé tombe sans que rien ne le dise. La phrase se lit sur la mesure
     d'après le repli, jamais sur une soustraction. */
  const rubricSaid = useRubricCountVoice(
    moreOpen,
    [
      { id: 'network', label: t('navm.grpNetwork'), count: netDoorsCount },
      { id: 'work', label: t('navm.grpWork'), count: workDoorsCount },
      { id: 'account', label: t('navm.grpAccount'), count: accDoorsCount },
    ],
    foldSeq,
    (label, count) => `${label} · ${phrasePortesRubrique(count, t)}`,
  );
  const [sheetPinnedScrolled, setSheetPinnedScrolled] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  /* Le plancher du panneau — la langue et la sortie de compte : sa hauteur est
     relevée pour que le voile et la flèche se tiennent juste au-dessus de lui,
     au lieu de se poser dessus. */
  const moreFootRef = useRef<HTMLDivElement | null>(null);
  const acctMenuRef = useRef<HTMLDivElement | null>(null);
  /* Opening « Plus » from the keyboard drops the focus on the first door. */
  const focusOnOpenRef = useRef(false);
  const acctFocusOnOpenRef = useRef(false);
  /* Hover open: a short dwell before the panel shows, a short grace before it
     folds away — long enough to cross the gap between the button and the list. */
  const hoverOpenTimerRef = useRef<number | null>(null);
  const hoverCloseTimerRef = useRef<number | null>(null);
  const openedByHoverRef = useRef(false);
  /* The account panel opens on the very same dwell: in a bar where « Plus »
     opens on hover, the name cannot expect a click for the same gesture. */
  const acctHoverOpenTimerRef = useRef<number | null>(null);
  const acctHoverCloseTimerRef = useRef<number | null>(null);
  const acctOpenedByHoverRef = useRef(false);
  const acctRef = useRef<HTMLDivElement | null>(null);
  const acctBtnRef = useRef<HTMLButtonElement | null>(null);
  /* A door that leads somewhere on this very page lets the panel it was opened
     from stay on screen a moment, so the trip down the page is not answered by
     a bar that blinks shut under the pointer. */
  const lingerTimerRef = useRef<number | null>(null);
  const lingeringRef = useRef(false);
  const [signingOut, setSigningOut] = useState(false);
  const [scrolled, setScrolled] = useState(variant === 'page');
  const { unread: unreadApps } = useUnreadApplications();
  const unreadMsgs = useUnreadCount();
  /* The workshop inbox count: only a pro account linked to a card can have one. */
  const isWorkshop = Boolean(session) && compte?.role !== 'candidat';
  const b2bTodo = useB2bTodo(isWorkshop);
  /* How many requests have been waiting for days: the panel says it quietly,
     under the door that leads to them — a reminder, not a second badge. */
  const b2bStats = useB2bStats(isWorkshop);
  const b2bLate = b2bStats.late;
  /* Which day the oldest one dates from: the reminder names it under the
     sentence, so a delay is never just a number. Same formatted stamp in the
     panel and in the phone sheet — one wording, one date. */
  const dateLocale = lang === 'ar' ? 'ar-DZ' : lang === 'en' ? 'en-GB' : 'fr-FR';
  const b2bLateSince = b2bStats.lateOldest ? dayStamp(b2bStats.lateOldest, dateLocale) : '';
  /* How long it has actually been sleeping, beside the date: the delay is read
     without anyone having to count the days on a calendar. Read on the same
     stamp as the date, so the two can never contradict each other. */
  const b2bLateDays = waitingDays(b2bStats.lateOldest);
  const b2bLateDaysLabel = b2bLateDays === null
    ? ''
    : b2bLateDays <= 1
      ? t('navm.b2bLateDaysOne')
      : t('navm.b2bLateDays').replace('{n}', String(b2bLateDays));
  /* Past a whole week, the wait is no longer a wait: the reminder says how many
     have crossed that second threshold, right under the first count. */
  const b2bVeryLate = b2bStats.veryLate;
  const b2bVeryLateLabel = b2bVeryLate <= 0
    ? ''
    : b2bVeryLate === 1
      ? t('navm.b2bVeryLateOne')
      : t('navm.b2bVeryLate').replace('{n}', String(b2bVeryLate));
  /* Le rappel en retard se dit une fois par occasion — l'occasion étant
     l'attente elle-même, nommée par son compte et sa plus ancienne demande,
     et non l'ouverture du panneau : la feuille rouverte après le panneau ne
     répète pas la même phrase. Une demande de plus qui prend du retard change
     la clé, et le rappel retrouve la parole. */
  const b2bLateKey = b2bLate > 0
    ? `b2b-late:${b2bLate}|${b2bStats.lateOldestRef || ''}`
    : '';
  const b2bLateSaid = useSpokenMark(
    b2bLateKey,
    b2bLate === 1 ? t('navm.b2bLateOne') : `${b2bLate} ${t('navm.b2bLate')}`,
  );
  /* The trace of the shortcut itself: when the reminder was last taken, and on
     which request. It says whether the door really serves — kept on the device,
     never mixed with the requests. */
  const [lateRecall, setLateRecall] = useState(readLateRecall);
  /* The silence asked for the day: while it holds, the reminder keeps its door
     but lowers its voice, and the line under it carries the trace of the
     deferral instead of another reminder. */
  const [lateMute, setLateMute] = useState<LateMute | null>(readLateMute);
  /* The morning after: the silence ran out on its own, and the day it ended is
     kept so the reminder's trace can say it was lifted — a hush that simply
     vanished would read as « nothing was waiting ». */
  const [lateMuteEnd, setLateMuteEnd] = useState<LateMuteEnd | null>(readLateMuteEnd);
  useEffect(() => onLateMute(() => {
    setLateMute(readLateMute());
    setLateMuteEnd(readLateMuteEnd());
  }), []);
  const lateMuted = Boolean(lateMute);
  const recallDays = daysSinceRecall(lateRecall);
  const recallAgo = recallDays === null
    ? ''
    : recallDays === 0
      ? t('navm.b2bRecallToday')
      : recallDays === 1
        ? t('navm.b2bRecallOne')
        : t('navm.b2bRecallAgo').replace('{n}', String(recallDays));
  /* How much that opening actually moved: the count of requests it flipped to
     « vue », kept with the trace so the shortcut says what it served. */
  const recallSeenLabel =
    lateRecall?.seen && lateRecall.seen > 0
      ? t('navm.b2bRecallSeen').replace('{n}', String(lateRecall.seen))
      : '';
  const recallLabel = recallAgo
    ? `${t('navm.b2bRecallOpen')}${lateRecall?.ref ? ` · ${lateRecall.ref}` : ''} · ${recallAgo}${recallSeenLabel ? ` · ${recallSeenLabel}` : ''}`
    : '';
  /* Which door was taken: the chip of the inbox, a counter of the account
     strip, or the reminder itself. A small pictogram says it right before the
     trace, so a shortcut nobody clicks can be told apart from a chip that does
     the work. An older trace, written before the source was kept, simply
     carries no pictogram rather than a guessed one. */
  const recallSourceIcon =
    lateRecall?.source === 'chip'
      ? 'ri-filter-3-line'
      : lateRecall?.source === 'strip'
        ? 'ri-layout-top-line'
        : lateRecall?.source === 'reminder'
          ? 'ri-notification-3-line'
          : '';
  const recallSourceLabel =
    lateRecall?.source === 'chip'
      ? t('navm.b2bRecallFromChip')
      : lateRecall?.source === 'strip'
        ? t('navm.b2bRecallFromStrip')
        : lateRecall?.source === 'reminder'
          ? t('navm.b2bRecallFromReminder')
          : '';
  /* The silence was lifted the next day: the trace of the shortcut says it, and
     on which day, so a gap in the reminders is never left unexplained. */
  const muteEndDay = lateMuteEnd ? dayStamp(lateMuteEnd.until, dateLocale) : '';
  const muteEndLabel = muteEndDay
    ? t('navm.muteLifted').replace('{date}', muteEndDay)
    : '';
  /* The reminder is a door, not a caption: it lands on the very request it just
     named, reference and all, instead of on a list to search by eye. */
  const b2bLateHref = b2bStats.lateOldestRef
    ? `/compte?b2b=retard&b2bRef=${encodeURIComponent(b2bStats.lateOldestRef)}#demandes-b2b`
    : '/compte?b2b=retard#demandes-b2b';
  /* Home only: the bar starts fully opaque, then steps aside after a beat so the
     film can breathe, and returns on hover or as soon as the page is scrolled. */
  const [hidden, setHidden] = useState(false);
  /* The film tells its story in beats: reading the chapter's progress says
     exactly which one holds the screen, and the bar lights the door that
     leads there — « Demandes » in the row, « Devis » and « Suivi » in « Plus ». */
  const [beat, setBeat] = useState<string | null>(null);
  /* The section that has just let go of the screen: it keeps its mark a beat
     longer, fading, so the end of a chapter never reads as a hard cut. */
  const [fading, setFading] = useState<string | null>(null);
  /* « Sous-traitance » n'est pas un temps du film mais un lieu de la page :
     sa porte du panneau s'allume quand sa section tient réellement l'écran,
     et s'éteint sur le même court fondu — une seule règle pour toutes les
     portes qui mènent quelque part sur cette page. */
  const [subInView, setSubInView] = useState(false);
  const [subFading, setSubFading] = useState(false);
  const subSeenRef = useRef(false);
  const subFadeTimerRef = useRef<number | null>(null);
  /* How many sections of this page have been read, kept on the account so the
     count follows the member from one device to the next — with the device as
     an instant, offline echo of the same truth. */
  const { readSections, markRead, reset: resetChapter, restore: restoreChapter } = useChapterRead(session?.user?.id ?? null);
  /* Le chapitre est-il entièrement lu ? Déclaré ici, avant les effets qui le
     lisent : un relevé du panneau en dépend, et une valeur lue avant sa
     déclaration arrête la page entière avant sa première image. */
  const chapterAllRead = readSections.length >= SECTION_BEATS.length;
  /* The two other places the row can lead to — the offers wall and the
     directory itself — are read too, but they never enter the 3/3 count. */
  const { places, markPlace, reset: resetPlaces, restore: restorePlaces } = usePlaceRead(session?.user?.id ?? null);
  /* The section that has just been read: it carries a small tick in the sheet
     one short beat, so the end of a section is answered, not silent. */
  const [justRead, setJustRead] = useState<string | null>(null);
  /* The place that has just been read: same named pill, on its own row door. */
  const [justReadPlace, setJustReadPlace] = useState<string | null>(null);
  /* « Remettre le chapitre à zéro » answers on the spot: the count drops and a
     short line confirms it, instead of the panel blinking back to 0/3. For a
     few seconds the same line also offers the way back — a mis-click is a
     mis-click, not a lost chapter. */
  const [resetDone, setResetDone] = useState(false);
  /* A reset now clears two memories — the chapter's beats and the row's places
     — so the way back has to carry both, not just the sections. */
  const [undoChapter, setUndoChapter] = useState<{ sections: string[]; places: string[] } | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const prevBeatRef = useRef<string | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  /* The phone sheet obeys the same rules as the two desktop panels: it folds on
     a click outside, on Escape, and it lingers one beat after a door that only
     leads deeper into this very page. */
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const burgerRef = useRef<HTMLButtonElement | null>(null);
  const sheetLingerRef = useRef<number | null>(null);
  /* The sheet ignores the scroll of the very instant it opened: a phone still
     carrying the momentum of the flick would fold it back under the thumb. */
  const sheetGuardRef = useRef(0);
  const hoveringRef = useRef(false);
  const hideTimerRef = useRef<number | null>(null);
  const lastYRef = useRef(0);
  const nearTopRef = useRef(false);
  const onSignupPage = pathname === '/compte/inscription';
  const onSigninPage = pathname === '/compte/connexion';
  const onAccountPages = pathname.startsWith('/compte') && !onSignupPage;
  const ctaHref = `${BASE}/#contact`;
  /* L'ancre des derniers arrivés, avec la règle du pied de page : locale sur
     l'accueil et l'annuaire, ramenée à l'accueil depuis les autres pages. La
     feuille du téléphone la reçoit telle quelle, pour que les deux surfaces
     mènent au même endroit. */
  const latestHref = pathname === '/' || pathname === '/annuaire'
    ? '#derniers'
    : `${BASE}/#derniers`;

  /* The signed-in member is named in the header: name, and wilaya when known. */
  const memberName = (compte?.nom || '').trim()
    || (session?.user?.email ? String(session.user.email).split('@')[0] : '');
  const memberWilaya = (compte?.wilaya || '').trim();
  /* A business account can also be looking for a job: the candidate door stays
     open in the bar, next to the member's own name. */
  const offersCandidateDoor = !session || compte?.role === 'pro';
  /* One dot on the name is enough to say « something landed »; the counts
     themselves are spelled out inside the menu. */
  const accountAlerts = unreadApps + unreadMsgs + (isWorkshop ? b2bTodo : 0);

  /* « Suivi » is a page of its own: the panel carries it everywhere, not only
     on the home page, and a door says where it leads instead of walking down a
     chapter. « Devis » left the bar: it is composed on the offers page now. */
  const sectionDoors: Door[] = [
    {
      to: '/suivi',
      key: 'nav.suivi',
      icon: 'ri-truck-line',
      hint: t('navm.hintTrack'),
      here: pathname.startsWith('/suivi'),
      beat: 'livraison',
    },
  ];

  /* Le périmètre lu dans l'adresse — la région et le pays, les deux clés que
     les trois barres partagent. La puce annonce donc exactement ce que le
     lecteur verra une fois la barre ouverte, jamais un total qui ignore la
     région choisie. */
  const scopeParams = new URLSearchParams(search);
  const scopeRegion = scopeParams.get('wilaya') ?? '';
  const scopePays = scopeParams.get('pays') ?? '';
  const scope = comptePerimetre(scopeRegion, scopePays);
  /* La pastille de façonnage lit le même périmètre que le pied de page : une
     région choisie fait descendre le compte, et l'adresse du lien la garde. */
  const facCompte = compteMetiers(scopeRegion, scopePays).counts.faconnage ?? 0;
  const facWord = faconnageLabelKey(facCompte);
  const facHref = faconnerieHref(scopeRegion, scopePays);
  const hintAuthors = scope.auteurs === 0
    ? t('navm.zeroAuthors')
    : ligneCompte(scope.auteurs, 'navm.hintAuthorsOne', 'navm.hintAuthors', t);
  const hintListings = scope.annonces === 0
    ? t('navm.zeroListings')
    : ligneCompte(scope.annonces, 'navm.hintListingsOne', 'navm.hintListings', t);
  const hintJobs = scope.emplois === 0
    ? t('navm.zeroJobs')
    : ligneCompte(scope.emplois, 'navm.hintJobsOne', 'navm.hintJobs', t);

  /* « Demandes » est une page à part entière : la porte du rang la marque par
     son adresse, et non plus par un temps du film. Déclarée ici, avant les
     listes de portes qui la lisent, pour ne pas être utilisée avant son tour. */
  const onDemandesPage = pathname === '/demandes';

  const networkDoors: Door[] = [
    {
      to: '/annuaire?kind=auteurs',
      key: 'dir.kindAuthors',
      icon: 'ri-quill-pen-line',
      hint: hintAuthors,
      zero: scope.auteurs === 0,
    },
    {
      /* « Candidats » a quitté le rang : il se visite comme le reste du
         réseau, il prend donc sa place dans le premier groupe du panneau.
         La marque lui est rendue dès que la porte voisine est celle qu'on
         lit : deux portes voisines n'allument jamais le même point. */
      to: '/candidats',
      key: 'candlist.short',
      icon: 'ri-user-follow-line',
      hint: t('navm.hintCandidates'),
      here: pathname.startsWith('/candidats') && !search.includes('fresh=1'),
    },
    {
      /* La porte du pied de page qui manquait au panneau : la même liste,
         ouverte sur sa part neuve. Elle prend l'accent quand on est dessus,
         exactement comme dans la feuille du téléphone. */
      to: '/candidats?fresh=1',
      key: 'candlist.newLink',
      icon: 'ri-user-star-line',
      hint: t('navm.hintNewCandidates'),
      here: pathname.startsWith('/candidats') && search.includes('fresh=1'),
    },
    {
      /* « Arabe World » est la seconde marque du réseau : sa page a sa porte
         ici, dans le groupe du réseau, et se rejoint donc au clavier depuis
         n'importe quel écran — pas seulement depuis le pied de page, qui ne
         se visite qu'en fin de lecture. */
      to: '/arabe-world',
      key: 'navm.world',
      icon: 'ri-global-line',
      hint: t('navm.hintWorld'),
      here: pathname.startsWith('/arabe-world'),
    },
    {
      /* « Demandes » rejoint le groupe du réseau : les trois guichets ne sont
         plus une rubrique du travail mais la porte par laquelle le réseau se
         met à parler. Elle garde sa page et son signe, seule sa place change —
         et la feuille du téléphone la range au même endroit. */
      to: '/demandes',
      key: 'nav.demandes',
      icon: 'ri-survey-line',
      hint: t('navm.hintDemandes'),
      here: onDemandesPage,
    },
  ];

  /* Le travail ensuite : le lieu de la page et la demande B2B. « Demandes » et
     « Offres » n'y sont plus — la première a rejoint le réseau, la seconde est
     remontée dans le rang, à côté des guichets. */
  const workDoors: Door[] = [
    {
      /* La sous-traitance est un lieu de la page d'accueil, pas une page :
         la porte garde donc une adresse de section, comme celles du rang,
         et le panneau s'efface un battement après l'avoir ouverte. Le signe
         est celui que le pied de page et la feuille du téléphone lui donnent
         déjà — une seule marque pour une seule porte. */
      href: `${BASE}/#soustraitance`,
      key: 'foot.sub',
      icon: 'ri-stack-line',
      hint: t('navm.hintSub'),
      /* Le signal est celui de la section elle-même, pas d'un temps du
         chapitre : la porte s'accuse tant que la section est sous les yeux. */
      here: subInView,
      leaving: subFading,
      /* La section se souvient d'elle-même comme d'un lieu de la page :
         « Lu · Sous-traitance » une fois visitée, hors du compte 3/3. */
      place: 'soustraitance',
      /* Sous la porte, un second accès direct : le même réseau, mais déjà
         filtré sur le façonnage — le geste qui suit la lecture du lieu. */
      /* Le compte descend ici, sous la porte du lieu : la même phrase que
         sous le raccourci du rang, et le même chiffre. */
      sub: {
        to: facHref,
        key: facWord,
        icon: 'ri-scissors-cut-line',
        hint: t('navm.faconActive'),
        count: facCompte,
      },
    },
    {
      to: '/demande-b2b',
      key: 'nav.b2b',
      icon: 'ri-inbox-archive-line',
      hint: isWorkshop && b2bTodo > 0 ? `${b2bTodo} ${t('nav.b2bTodo')}` : t('navm.hintB2b'),
    },
    {
      /* Les deux portes du pied de page qui manquaient au panneau : déposer
         une annonce ou une offre, puis les derniers arrivés — avec leurs
         signes du bas de page, pour qu'une même porte se reconnaisse aux
         trois surfaces. L'ancre des derniers arrivés suit la règle du lieu :
         locale ici, ramenée à l'accueil depuis les autres pages. */
      to: '/deposer',
      key: 'foot.deposit',
      icon: 'ri-upload-cloud-2-line',
      hint: t('navm.hintDeposit'),
      here: pathname === '/deposer',
    },
    {
      href: latestHref,
      key: 'foot.latest',
      icon: 'ri-time-line',
      hint: t('navm.hintLatest'),
    },
  ];

  /* Les deux tableaux de la barre, avec leurs rubriques : « Annonces » déplie
     ses quatre rubriques, « Emplois » ses quatre contrats. Les deux menues
     partagent le mécanisme du menu des types — même panneau, même flèche,
     même recherche le jour où la liste s'allongera. */
  const boardMenus = useBoardMenuItems({
    annonces: hintListings,
    emplois: hintJobs,
    zeroAnnonces: scope.annonces === 0,
    zeroEmplois: scope.emplois === 0,
  });

  const onSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    setOpen(false);
    setAcctOpen(false);
    navigate('/', { replace: true });
  };

  /* Clicking anywhere else, or Escape, closes whichever panel is open; so does
     any change of page. */
  useEffect(() => {
    if (!moreOpen && !acctOpen) return undefined;
    const onDocDown = (e: MouseEvent) => {
      const node = e.target as Node;
      /* A same-page door keeps its panel alive: it folds a beat later, once
         the page has travelled to the section it just opened. */
      if (node instanceof Element && node.closest('[data-section-door]')) return;
      if (moreOpen && !moreRef.current?.contains(node)) setMoreOpen(false);
      if (acctOpen && !acctRef.current?.contains(node)) setAcctOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMoreOpen(false);
      setAcctOpen(false);
      if (acctOpen) acctBtnRef.current?.focus();
      else moreBtnRef.current?.focus();
    };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen, acctOpen]);

  useEffect(() => {
    setMoreOpen(false);
    setAcctOpen(false);
    setTypesOpen(false);    if (sheetLingerRef.current !== null) {
      window.clearTimeout(sheetLingerRef.current);
      sheetLingerRef.current = null;
    }
    setOpen(false);
  }, [pathname]);

  /* Le panneau se referme : les huit types se replient avec lui, pour que la
     rubrique du réseau se rouvre dans sa forme courte. */
  useEffect(() => {
    if (!moreOpen) setTypesOpen(false);
  }, [moreOpen]);

  useEffect(() => {
    if (variant === 'page') return undefined;
    const header = headerRef.current;

    /* Two delays: a short one so the film breathes straight away, a long one
       while the pointer is clearly heading for the menu. */
    const QUICK = 1500;
    const READ = 6000;

    const clearTimer = () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const arm = (delay = QUICK) => {
      clearTimer();
      hideTimerRef.current = window.setTimeout(() => {
        hideTimerRef.current = null;
        if (!hoveringRef.current && !open && window.scrollY < 24) setHidden(true);
      }, delay);
    };

    const wake = (delay = QUICK) => {
      setHidden(false);
      arm(delay);
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastYRef.current;
      lastYRef.current = y;
      setScrolled(y > 24);
      if (y < 24) {
        wake();
        return;
      }
      clearTimer();
      /* Downwards the bar steps aside so the film keeps the screen; the very
         first upward flick, anywhere on the page, brings it straight back —
         no need to climb all the way to the top. */
      if (delta > 6 && !open && !hoveringRef.current) setHidden(true);
      else setHidden(false);
    };

    /* A hidden bar has no hover target, so a pointer near the top edge brings it
       back — same for a tap on touch screens. Approaching the top edge also
       buys the visitor the longer reading delay. */
    const onPointerNearTop = (e: PointerEvent) => {
      const near = e.clientY < 260;
      if (near) setHidden(false);
      if (near === nearTopRef.current) return;
      nearTopRef.current = near;
      if (hoveringRef.current) return;
      arm(near ? READ : QUICK);
    };

    const onEnter = () => {
      hoveringRef.current = true;
      setHidden(false);
      clearTimer();
    };

    const onLeave = () => {
      hoveringRef.current = false;
      arm(nearTopRef.current ? READ : QUICK);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerNearTop, { passive: true });
    window.addEventListener('pointerdown', onPointerNearTop, { passive: true });
    header?.addEventListener('pointerenter', onEnter);
    header?.addEventListener('pointerleave', onLeave);
    lastYRef.current = window.scrollY;
    onScroll();
    arm();

    return () => {
      clearTimer();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerNearTop);
      window.removeEventListener('pointerdown', onPointerNearTop);
      header?.removeEventListener('pointerenter', onEnter);
      header?.removeEventListener('pointerleave', onLeave);
    };
  }, [variant, open]);

  const renderDoor = (d: Door) => {
    const inner = (
      <>
        <i className={d.icon} aria-hidden="true"></i>
        <span className="nav-more-txt">
          <span className="nav-more-label">{t(d.key)}</span>
          <small>{d.hint}</small>
        </span>
        {/* The same named tick the phone sheet carries: a section just read
            answers on its own door, here as well as there. La pastille d'un
            lieu, elle, ne se pose plus ici : elle prend sa propre ligne et
            devient une porte (voir plus bas). */}
        {d.beat && justRead === d.beat && (
          <span
            className="nav-mobile-tick nav-mobile-tick--named"
            role="img"
            aria-label={`${t('navm.readTick')} : ${t(d.key)}`}
          >
            <i className="ri-check-line" aria-hidden="true"></i>
            {t('navm.read')} · {t(d.key)}
          </span>
        )}
      </>
    );
    /* The section we are already reading keeps the accent, exactly like a door
       in the row: the panel never invites you to open what is under your eyes.
       And when it lets go, it does so on a short fade, not a cut. */
    const cls = [
      'nav-more-item',
      d.here ? 'is-current' : '',
      !d.here && (d.leaving || (d.beat && fading === d.beat)) ? 'is-fading' : '',
      /* Rien dans le périmètre : le trait se fait pointillé, comme sur la puce
         de l'annuaire qui ne trouve rien à montrer. */
      d.zero ? 'is-zero' : '',
    ].filter(Boolean).join(' ');
    const door = d.href ? (
      <a
        href={d.href}
        role="menuitem"
        data-section-door=""
        className={cls}
        aria-current={d.here ? 'location' : undefined}
        onClick={holdPanelsBriefly}
      >
        {inner}
      </a>
    ) : (
      <Link
        to={d.to as string}
        role="menuitem"
        className={cls}
        aria-current={d.here ? 'location' : undefined}
        onClick={() => setMoreOpen(false)}
      >
        {inner}
      </Link>
    );
    /* Le raccourci du lieu se range sous sa porte, décalé d'un cran : on lit
       d'abord le lieu, puis la face qu'on veut en ouvrir.
       Quand le lieu vient d'être lu, c'est ce même raccourci qui porte la
       pastille « Lu · Sous-traitance » : la marque de lecture devient la
       porte de l'annuaire filtré sur le façonnage, au lieu de rester un
       témoin à côté d'une ligne qui répétait la même adresse. Une seule
       ligne, donc, pour un seul endroit — et elle se déclare comme une
       lecture dans le parcours au clavier du panneau. */
    if (!d.sub) return <Fragment key={d.href ?? d.to ?? d.key}>{door}</Fragment>;
    const readAsDoor = Boolean(d.place) && justReadPlace === d.place;
    return (
      <Fragment key={d.href ?? d.to ?? d.key}>
        {door}
        {readAsDoor ? (
          <Link
            to={d.sub.to}
            role="menuitem"
            className="nav-more-read"
            aria-label={`${t('navm.readTick')} : ${t(d.key)} — ${t(d.sub.key)}`}
            title={`${t(d.sub.key)} · ${d.sub.hint}`}
            onClick={() => setMoreOpen(false)}
          >
            <i className="ri-check-line" aria-hidden="true"></i>
            <span>{t('navm.read')} · {t(d.key)}</span>
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </Link>
        ) : (
          <Link
            to={d.sub.to}
            role="menuitem"
            className="nav-more-sub"
            onClick={() => setMoreOpen(false)}
          >
            <i className={d.sub.icon} aria-hidden="true"></i>
            <span>{t(d.sub.key)}</span>
            {/* Le compte d'ateliers, en pastille, dans la porte elle-même :
                le chiffre comme le libellé mènent à l'annuaire déjà filtré,
                sans ouvrir une seconde porte à côté de celle-ci. */}
            {typeof d.sub.count === 'number' && (
              <span className="nav-sub-count">{d.sub.count}</span>
            )}
            <small>{d.sub.hint}</small>
          </Link>
        )}
      </Fragment>
    );
  };

  /* A panel is a real menu: the arrows walk it, Home and End jump to the
     ends, and the walk wraps instead of dead-ending on the last door. */
  const menuItems = (root: HTMLElement | null) => Array.from(
    root?.querySelectorAll<HTMLElement>('[role="menuitem"]') || [],
  );

  const focusItem = (root: HTMLElement | null, index: number) => {
    const items = menuItems(root);
    if (!items.length) return;
    const next = ((index % items.length) + items.length) % items.length;
    items[next]?.focus();
  };

  /* One key handler for both panels: same arrows, same wrap, same exits. The
     root is read at key time, never captured at render time. */
  const onMenuKey = (getRoot: () => HTMLElement | null, close: () => void) =>
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const root = getRoot();
      const items = menuItems(root);
      const current = items.indexOf(document.activeElement as HTMLElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusItem(root, current + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusItem(root, current - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        focusItem(root, 0);
      } else if (e.key === 'End') {
        e.preventDefault();
        focusItem(root, items.length - 1);
      } else if (e.key === 'Tab') {
        /* Le pied n'est pas une porte du menu : la touche Tab y circule sans
           refermer le panneau, pour que la langue et la sortie restent
           atteignables au clavier. Partout ailleurs, Tab referme. */
        const inFoot = (e.target as HTMLElement).closest('.nav-more-foot');
        if (!inFoot) close();
      }
    };

  const onMoreMenuKey = onMenuKey(() => moreMenuRef.current, () => setMoreOpen(false));
  const onAcctMenuKey = onMenuKey(() => acctMenuRef.current, () => setAcctOpen(false));

  useEffect(() => {
    if (!moreOpen || !focusOnOpenRef.current) return;
    focusOnOpenRef.current = false;
    focusItem(moreMenuRef.current, 0);
  }, [moreOpen]);

  useEffect(() => {
    if (!acctOpen || !acctFocusOnOpenRef.current) return;
    acctFocusOnOpenRef.current = false;
    focusItem(acctMenuRef.current, 0);
  }, [acctOpen]);

  /* Le panneau « Plus » dit qu'une entrée est passée derrière son bloc fixe :
     le liseré ne s'accuse qu'à partir du premier pixel de défilement réel.

     Le relevé est pris avant la première peinture : un panneau qui s'ouvre
     déjà plus haut que sa fenêtre — le cas du panneau compact entre 1024 et
     1299 px, surtout une fois les huit types dépliés — montre son voile et sa
     flèche sur la toute première image. Aucune image intermédiaire ne
     présente donc un panneau coupé net, puis voilé un battement plus tard. */
  useLayoutEffect(() => {
    const node = moreMenuRef.current;
    if (!moreOpen || !node) {
      /* Panneau refermé : rien à annoncer, et le prochain ouvert repart d'un
         relevé neuf sur un panneau qui vient d'être monté. */
      setMorePinnedScrolled(false);
      setMoreHasMore(false);
      setMoreScrolls(false);
      setMoreDoorsLeft(0);
      setMoreDoorsTotal(0);
      setWorkDoorsCount(0);
      setNetDoorsCount(0);
      setAccDoorsCount(0);
      /* Refermé : la rubrique repliée ne suit pas la visite suivante. */
      setFoldedDoors(0);
      return undefined;
    }
    /* Le même relevé dit les trois choses : ce qui est passé derrière le bloc
       collé, ce qui attend encore sous le bord du panneau, et la hauteur du
       plancher — le voile et la flèche se posent au-dessus de lui. */
    const read = () => {
      const foot = moreFootRef.current;
      if (foot) node.style.setProperty('--nav-foot', `${foot.offsetHeight}px`);
      setMorePinnedScrolled(node.scrollTop > 4);
      setMoreScrolls(node.scrollHeight - node.clientHeight > 16);
      /* Le bord visible du panneau s'arrête au plancher : ce qui passe dessous
         a déjà été rencontré, ce qui reste sous lui compte encore. */
      const visibleBottom = node.getBoundingClientRect().bottom - (foot?.offsetHeight ?? 0);
      setMoreDoorsLeft(doorsLeftIn(node, PANEL_DOOR_SELECTOR, visibleBottom));
      /* Le total, lu sur la même géométrie : c'est lui que le repère de fin
         nomme, à côté de son mot. */
      setMoreDoorsTotal(doorsIn(node, PANEL_DOOR_SELECTOR));
      /* Le compte de la rubrique du travail, relevé sur son bloc à elle : une
         porte de plus dans la rubrique, un rappel qui paraît, et le chiffre
         posé à côté de l'intitulé suit — sans rien déplier. */
      const groupCount = (name: string) => doorsIn(
        node.querySelector<HTMLElement>(`.nav-more-group[data-group="${name}"]`),
        PANEL_DOOR_SELECTOR,
      );
      setWorkDoorsCount(groupCount('work'));
      setNetDoorsCount(groupCount('network'));
      setAccDoorsCount(groupCount('account'));
      /* Dès que le repère de fin entre dans la bande visible, plus rien n'est
         caché sous le filet : le voile et la flèche n'ont plus rien à annoncer
         et s'effacent, au lieu de se poser sur le repère. Le contrôle vaut
         quelle que soit la hauteur du pied — une ligne, ou deux en anglais. */
      const endInSight = endInSightIn(node, visibleBottom);
      setMoreHasMore(!endInSight && node.scrollHeight - node.scrollTop - node.clientHeight > 16);
      /* Le voile ne prend jamais plus d'un peu moins de la moitié de la bande
         visible : sur un écran court, avec un pied anglais replié sur deux
         lignes et la sourdine du rappel ouverte, un dégradé de 56 px
         mangerait le repère de fin au lieu d'éclairer la dernière porte. */
      node.style.setProperty(
        '--nav-veil-h',
        `${veilHeightIn(node.clientHeight - (foot?.offsetHeight ?? 0))}px`,
      );
    };
    read();
    node.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read);
    /* Une rubrique peut grandir ou maigrir sans défilement ni
       redimensionnement : la recherche d'un tableau laisse moins de portes,
       une rubrique s'ouvre, une ligne se replie. Le compte posé à côté des
       intitulés suit donc les changements de la liste elle-même — une seule
       mesure par image, et rien à recalculer à la main. */
    let pending = 0;
    const ask = () => {
      if (pending) return;
      pending = window.requestAnimationFrame(() => {
        pending = 0;
        read();
      });
    };
    let watchList: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      watchList = new MutationObserver(ask);
      watchList.observe(node, { childList: true, subtree: true, characterData: true });
    }
    /* Le pied peut se replier sur deux lignes — c'est ce qui arrive en arabe
       quand la langue et la sortie de compte ne tiennent plus côte à côte sur
       une seule — et sa hauteur change alors sous le voile, sans qu'aucune
       fenêtre ne bouge. Le relevé suit donc sa propre hauteur : le voile se
       relève d'autant, la flèche avec lui, et rien ne se pose plus sur le
       plancher. Le même observateur couvre le passage d'une langue à l'autre
       et l'arrivée ou le départ de la sortie de compte. */
    const foot = moreFootRef.current;
    let watch: ResizeObserver | null = null;
    if (foot && typeof ResizeObserver !== 'undefined') {
      watch = new ResizeObserver(read);
      watch.observe(foot);
    }
    return () => {
      node.removeEventListener('scroll', read);
      window.removeEventListener('resize', read);
      if (pending) window.cancelAnimationFrame(pending);
      pending = 0;
      watchList?.disconnect();
      watch?.disconnect();
    };
    /* Le panneau change aussi de hauteur sans qu'aucune fenêtre ne bouge : la
       ligne du chapitre terminé, les lieux lus, la confirmation de remise à
       zéro, la seconde semaine du rappel en retard. Sur un écran court — le
       panneau compact entre 1024 et 1299 px —, ces lignes poussent les
       dernières portes sous le plancher ; le relevé doit donc les suivre, au
       lieu d'attendre un défilement ou un redimensionnement. */
  }, [
    moreOpen, typesOpen, b2bLate, b2bVeryLate, lateMuted, session, moreScrolls, foldSeq,
    readSections.length, places.length, resetDone, chapterAllRead,
  ]);

  /* La feuille du téléphone obéit au même signal : les deux surfaces marquent
     la séparation au même moment, pour la même raison. */
  useEffect(() => {
    const node = sheetRef.current;
    setSheetPinnedScrolled(false);
    if (!open || !node) return undefined;
    const read = () => setSheetPinnedScrolled(node.scrollTop > 4);
    read();
    node.addEventListener('scroll', read, { passive: true });
    return () => node.removeEventListener('scroll', read);
  }, [open]);

  /* Where we already are: the matching door in the account menu takes the
     accent, so the menu never pretends to open a page we are standing on. */
  const onAppsPage = pathname === '/compte' && hash === '#mes-candidatures';
  const onB2bPage = pathname === '/compte' && hash === '#demandes-b2b';
  const onMessagesPage = pathname.startsWith('/messages');
  const onComptePage = pathname === '/compte' && !onAppsPage && !onB2bPage;

  /* The phone sheet marks the same door: the board you are already on takes the
     accent, so the sheet never invites you to reopen the page under your feet. */
  const onPlatformPage = pathname === '/';
  /* « Offres » is a place inside the home page, not a page: it only owns the
     highlight once the visitor has actually dropped down to that section. */
  const onOffresHash = hash === '#offres';
  /* The platform door stays lit all over the home page — unless the request beat
     or the offers section is in view, which then take the mark for themselves. */
  const readingBesoin = beat === 'besoin';
  /* Any section of this page currently under the eyes — including « Demandes »,
     whose door sits in the row: « Plus » carries a dot for all of them. */
  const readingSection = SECTION_BEATS.includes(beat || '') || subInView;
  const onHomeTop = onPlatformPage && !onOffresHash && !readingBesoin;
  const onAuthorsPage = pathname === '/annuaire' && search.includes('kind=auteurs');
  /* L'annuaire et toutes ses pages de type gardent la porte allumée. */
  const onDirectoryPage = pathname.startsWith('/annuaire') && !onAuthorsPage;
  /* Le guichet des marchés publics est la même entrée de barre : deux pages,
     un seul usage — la demande adressée aux ateliers. */
  const onB2bRequestPage = pathname.startsWith('/demande-b2b') || pathname.startsWith('/demande-marche');
  const onCandidatesPage = pathname.startsWith('/candidats');
  /* Les profils neufs ont leur propre porte dans la feuille : elle prend la
     marque à la place de « Candidats » quand c'est elle qu'on lit, au lieu
     d'allumer une porte qui ne dit pas la même chose. */
  const onNewCandidatesPage = onCandidatesPage && search.includes('fresh=1');
  /* « Offres » is now a page of its own: the row entry leads to it, and it owns
     the mark while the reader stands on it. */
  const onOffresPage = pathname === '/offres';
  /* « Suivi » is a page of its own now: the sheet and the panel mark it by
     address, not by the beat the film happens to show. */
  const onSuiviPage = pathname.startsWith('/suivi');
  /* Le formulaire de dépôt a sa page : la feuille le marque comme le panneau,
     pour que la même porte prenne l'accent sur les trois surfaces. */
  const onDeposerPage = pathname === '/deposer';

  /* Le panneau « Plus » reprend le fil de la feuille : trois rubriques — le
     réseau, le travail, le compte. Entre 1024 et 1299 px, le rang s'efface et
     les portes qu'il ne peut plus montrer se glissent en tête du réseau :
     la plateforme, puis les formules — qui viennent de remonter dans le rang
     et n'auraient, sans cela, plus aucune porte à cette largeur. Tout le reste
     a désormais sa rubrique ci-dessous. */
  const compactDoors: Door[] = [
    variant === 'home'
      ? { href: '#overview', key: 'nav.plateforme', icon: 'ri-home-5-line', hint: t('navm.hintHome'), here: onHomeTop }
      : { to: '/', key: 'nav.plateforme', icon: 'ri-home-5-line', hint: t('navm.hintHome'), here: onHomeTop },
    /* « Offres » n'existe ici que pour la barre compacte : le bloc qui la
       rend est masqué dès 1300 px, où la porte vit dans le rang. Rien n'est
       donc écrit deux fois à la même largeur. */
    {
      to: '/offres',
      key: 'nav.offres',
      icon: 'ri-price-tag-3-line',
      hint: t('navm.hintOffers'),
      here: onOffresPage,
    },
  ];

  /* « Plus » opens on a dwell of the pointer, and folds away once the pointer
     has truly left the button and its list. A click always wins over the hover. */
  const stopHoverTimers = () => {
    if (hoverOpenTimerRef.current !== null) {
      window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    if (hoverCloseTimerRef.current !== null) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  };

  const openMoreByHover = () => {
    openedByHoverRef.current = true;
    setAcctOpen(false);
    setMoreOpen(true);
  };

  const onMorePointerEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    /* Coming back from the list cancels the pending fold-away. */
    if (hoverCloseTimerRef.current !== null) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
    if (e.pointerType !== 'mouse' || moreOpen) return;
    /* The button is hidden beneath the compact bar: nothing to hover there.
       Le panneau vit désormais dès 1024 px ; en dessous, c'est la feuille. */
    if (window.innerWidth < 1024) return;
    hoverOpenTimerRef.current = window.setTimeout(() => {
      hoverOpenTimerRef.current = null;
      openMoreByHover();
    }, 380);
  };

  const onMorePointerLeave = () => {
    if (hoverOpenTimerRef.current !== null) {
      window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    if (!openedByHoverRef.current) return;
    hoverCloseTimerRef.current = window.setTimeout(() => {
      hoverCloseTimerRef.current = null;
      openedByHoverRef.current = false;
      setMoreOpen(false);
    }, 260);
  };

  /* Same dwell, same grace, same rules as « Plus »: the two panels must feel
     like one mechanism, not two. A click always wins over the hover. */
  const stopAcctHoverTimers = () => {
    if (acctHoverOpenTimerRef.current !== null) {
      window.clearTimeout(acctHoverOpenTimerRef.current);
      acctHoverOpenTimerRef.current = null;
    }
    if (acctHoverCloseTimerRef.current !== null) {
      window.clearTimeout(acctHoverCloseTimerRef.current);
      acctHoverCloseTimerRef.current = null;
    }
  };

  const openAcctByHover = () => {
    acctOpenedByHoverRef.current = true;
    /* One panel at a time: the name and « Plus » never hang side by side. */
    stopHoverTimers();
    openedByHoverRef.current = false;
    setMoreOpen(false);
    setAcctOpen(true);
  };

  const onAcctPointerEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (acctHoverCloseTimerRef.current !== null) {
      window.clearTimeout(acctHoverCloseTimerRef.current);
      acctHoverCloseTimerRef.current = null;
    }
    if (e.pointerType !== 'mouse' || acctOpen) return;
    acctHoverOpenTimerRef.current = window.setTimeout(() => {
      acctHoverOpenTimerRef.current = null;
      openAcctByHover();
    }, 380);
  };

  const onAcctPointerLeave = () => {
    if (acctHoverOpenTimerRef.current !== null) {
      window.clearTimeout(acctHoverOpenTimerRef.current);
      acctHoverOpenTimerRef.current = null;
    }
    if (!acctOpenedByHoverRef.current) return;
    acctHoverCloseTimerRef.current = window.setTimeout(() => {
      acctHoverCloseTimerRef.current = null;
      acctOpenedByHoverRef.current = false;
      setAcctOpen(false);
    }, 260);
  };

  /* A section door clicked from the bar: the panel stays put for a moment
     (~0.9 s), long enough to see where the page lands, then folds by itself. */
  const holdPanelsBriefly = () => {
    if (lingerTimerRef.current !== null) {
      window.clearTimeout(lingerTimerRef.current);
      lingerTimerRef.current = null;
    }
    if (!moreOpen && !acctOpen) return;
    lingeringRef.current = true;
    stopHoverTimers();
    stopAcctHoverTimers();
    openedByHoverRef.current = false;
    acctOpenedByHoverRef.current = false;
    lingerTimerRef.current = window.setTimeout(() => {
      lingerTimerRef.current = null;
      lingeringRef.current = false;
      setMoreOpen(false);
      setAcctOpen(false);
    }, 900);
  };

  /* The sheet closes at once: outside click, Escape, or a door that leaves the
     page. A pending linger is cancelled so it can never shut a new sheet. */
  const closeSheetNow = () => {
    if (sheetLingerRef.current !== null) {
      window.clearTimeout(sheetLingerRef.current);
      sheetLingerRef.current = null;
    }
    setOpen(false);
  };

  const toggleSheet = () => {
    if (open) {
      closeSheetNow();
      return;
    }
    sheetGuardRef.current = Date.now() + 240;
    setOpen(true);
  };

  /* A section of the chapter, walked to from the progress line: the same
     arithmetic the row doors use, so the landing is identical. */
  const jumpToChapterSection = (id: string) => {
    const chapter = document.querySelector<HTMLElement>('.chapter');
    if (!chapter) return;
    const top = chapter.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(0, chapter.offsetHeight - window.innerHeight);
    const start = SECTION_START[id] ?? 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: top + travel * Math.min(start + 0.02, 1),
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  /* The next section the chapter has not shown yet. Once all three have been
     read, the same door walks back to the first one rather than going dead. */
  const nextUnreadSection = SECTION_BEATS.find((s) => !readSections.includes(s))
    || SECTION_BEATS.find((s) => s !== beat)
    || SECTION_BEATS[0];

  const onJumpNext = () => {
    jumpToChapterSection(nextUnreadSection);
    /* The panel holds for its usual beat while the page travels, then folds. */
    holdPanelsBriefly();
  };

  /* La flèche du bas est une porte de lecture, pas une décoration : elle fait
     descendre la liste d'un écran, sans refermer le panneau. */
  const onMoreScrollHint = () => {
    const node = moreMenuRef.current;
    if (!node) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollBy({
      top: Math.round(node.clientHeight * 0.84),
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  /* La flèche des huit types est une rubrique comme une autre : repliée, elle
     emporte ses huit pastilles d'un seul geste. Le compte des portes restantes
     tombe d'autant ; la flèche du bas doit donc dire ce que la liste vient de
     perdre, exactement comme pour une rubrique de tableau. Les portes sont
     comptées avant de les refermer — après, elles ne seraient plus là. */
  const toggleTypes = () => {
    if (!typesOpen) {
      setTypesOpen(true);
      return;
    }
    const block = moreMenuRef.current?.querySelector<HTMLElement>('#nav-more-dir-types');
    const doors = block ? block.querySelectorAll('a.nav-dir-type').length : 0;
    setTypesOpen(false);
    if (doors > 0) onPanelFold(doors);
  };

  /* The named pill of a row place: same accent, same wording as a chapter
     section, so the row speaks one language wherever a door has been read.
     Il est désormais passé à la porte « Annuaire », qui porte elle-même le
     menu des types. */
  const placeTick = (place: string) => (justReadPlace === place ? (
    <span
      className="nav-link-tick"
      role="img"
      aria-label={`${t('navm.readTick')} : ${t(PLACE_LABEL[place])}`}
    >
      <i className="ri-check-line" aria-hidden="true"></i>
      {t('navm.read')} · {t(PLACE_LABEL[place])}
    </span>
  ) : null);

  /* While the sheet is open, a press anywhere else folds it — the burger
     excluded, otherwise a second tap would close then immediately reopen it. */
  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (e: MouseEvent) => {
      const node = e.target as Node;
      if (sheetRef.current?.contains(node)) return;
      if (burgerRef.current?.contains(node)) return;
      closeSheetNow();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      closeSheetNow();
      burgerRef.current?.focus();
    };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  /* The panel belongs to the bar, not to the page: the first pixel of scroll and
     it folds away instead of floating over the content that just moved. Both
     panels obey, and so does the phone sheet, so the bar never keeps a tiroir
     half-open over a page that is already travelling. */
  useEffect(() => {
    if (!moreOpen && !acctOpen && !open) return undefined;
    const onScrollAway = () => {
      /* The click that sent the page down keeps its panel for its own beat. */
      if (lingeringRef.current || sheetLingerRef.current !== null) return;
      /* A sheet that has just opened must not be folded by the scroll momentum
         that was already running when the thumb lifted. */
      if (open && Date.now() < sheetGuardRef.current) return;
      stopHoverTimers();
      stopAcctHoverTimers();
      openedByHoverRef.current = false;
      acctOpenedByHoverRef.current = false;
      setMoreOpen(false);
      setAcctOpen(false);
      closeSheetNow();
    };
    window.addEventListener('scroll', onScrollAway, { passive: true });
    return () => window.removeEventListener('scroll', onScrollAway);
  }, [moreOpen, acctOpen, open]);

  /* Reading a section of the home page lights the door that leads to it. Those
     sections are beats of the film, so the raw progress of the chapter is the
     honest source — the very numbers the beats themselves use. */
  useEffect(() => {
    if (variant !== 'home' || pathname !== '/') {
      setBeat(null);
      return undefined;
    }
    let raf = 0;
    const read = () => {
      raf = 0;
      const chapter = document.querySelector<HTMLElement>('.chapter');
      let next: string | null = null;
      if (chapter) {
        const r = chapter.getBoundingClientRect();
        const travel = r.height - window.innerHeight;
        const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / travel));
        /* Only while the chapter holds the screen: once it is scrolled past,
           the beat is over and no door should stay lit for it. */
        if (r.bottom > 0 && r.top < window.innerHeight) {
          next = HOME_BEATS.find((b) => p < b.to)?.id || 'livraison';
        }
      }
      setBeat((prev) => (prev === next ? prev : next));
    };
    const ask = () => {
      if (raf) return;
      raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', ask);
    return () => {
      window.removeEventListener('scroll', ask);
      window.removeEventListener('resize', ask);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [variant, pathname]);

  /* « Sous-traitance » est un lieu de la page, pas un temps du film : le
     chapitre ne peut donc pas dire qu'on la lit. Sa section parle pour elle,
     et sa porte du panneau prend l'accent exactement comme « Demandes » dans
     le rang — dès qu'elle tient une bonne part de l'écran, puis plus du tout. */
  useEffect(() => {
    if (variant !== 'home' || pathname !== '/') {
      setSubInView(false);
      setSubFading(false);
      subSeenRef.current = false;
      return undefined;
    }
    const node = document.getElementById('soustraitance');
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const watch = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const inside = entry.isIntersecting;
      setSubInView(inside);
      /* Le passage de « lue » à « quittée » se fait sur un fondu : la marque
         s'éteint, elle ne disparaît pas d'un coup. */
      if (!inside && subSeenRef.current) {
        setSubFading(true);
        if (subFadeTimerRef.current !== null) window.clearTimeout(subFadeTimerRef.current);
        subFadeTimerRef.current = window.setTimeout(() => {
          subFadeTimerRef.current = null;
          setSubFading(false);
        }, 260);
      }
      subSeenRef.current = inside;
    }, { threshold: 0.45 });
    /* Le lieu, lui, se marque à son propre seuil : un quart de l'écran suffit,
       comme pour la muraille des offres. Le trait d'accent demande davantage —
       les deux gestes ne mesurent pas la même chose. Marquer une visite ne
       dépend pas du chapitre : la section n'entre jamais dans le compte 3/3.
       Une remise à zéro ne la rallume pas toute seule : l'observateur n'est
       pas reconstruit, et la marque attend le passage suivant. */
    const mark = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry || !entry.isIntersecting) return;
      if (markPlace('soustraitance')) setJustReadPlace('soustraitance');
    }, { threshold: 0.25 });
    watch.observe(node);
    mark.observe(node);
    return () => {
      watch.disconnect();
      mark.disconnect();
    };
  }, [variant, pathname, markPlace]);

  /* A section read once stays read: the count only ever grows, so opening the
     panel never resets the story to zero. The first time one is entered it also
     gets a short tick in the sheet, naming the section it was. */
  useEffect(() => {
    if (!beat || !SECTION_BEATS.includes(beat)) return;
    if (markRead(beat)) setJustRead(beat);
  }, [beat, markRead]);

  /* The tick clears itself: it says « that one, just now », not « that one for
     ever ». Long enough to be seen even when the sheet is reopened. */
  useEffect(() => {
    if (!justRead) return undefined;
    if (tickTimerRef.current !== null) {
      window.clearTimeout(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    tickTimerRef.current = window.setTimeout(() => {
      tickTimerRef.current = null;
      setJustRead(null);
    }, 5200);
    return () => {
      if (tickTimerRef.current !== null) {
        window.clearTimeout(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
  }, [justRead]);

  /* Arriving on the directory is reading it: its door in the row answers once
     with the very same named pill the chapter doors use. A page is a place
     read, not a beat of the film. The mark only comes from an arrival — a
     chapter reset while standing here must not put it back on its own. */
  useEffect(() => {
    if (!pathname.startsWith('/annuaire')) return;
    if (markPlace('annuaire')) setJustReadPlace('annuaire');
  }, [pathname, markPlace]);

  /* The offers wall is a section, not a page: it counts as read when it truly
     holds part of the screen, and its mark stays away until then. */
  useEffect(() => {
    if (variant !== 'home' || places.includes('offres')) return undefined;
    const node = document.getElementById('offres');
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    /* The section must be entered, not merely found on screen: after a reset the
       observer is rebuilt over a section that is already visible. */
    let armed = false;
    const watch = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      /* Still off screen: the next arrival will be a real reading. */
      if (!entry.isIntersecting) {
        armed = true;
        return;
      }
      /* Already under the eyes when the memory was just cleared: that is not a
         reading, it is the same view. The mark waits for the next pass. */
      if (!armed) return;
      if (markPlace('offres')) setJustReadPlace('offres');
      watch.disconnect();
    }, { threshold: 0.25 });
    watch.observe(node);
    return () => watch.disconnect();
  }, [variant, pathname, places, markPlace]);

  /* The place tick lives one short beat, like the section one: it says « that
     one, just now », never « that one for ever ». */
  useEffect(() => {
    if (!justReadPlace) return undefined;
    const timer = window.setTimeout(() => setJustReadPlace(null), 5200);
    return () => window.clearTimeout(timer);
  }, [justReadPlace]);

  /* A trace written elsewhere — the account's « en retard » counter opens the
     very same cut — must reach this bar at once, so the two entries can never
     tell two different stories about the shortcut. */
  useEffect(() => onLateRecall(() => setLateRecall(readLateRecall())), []);

  /* The reset clears both memories at once; the note confirms it and keeps the
     way back open five seconds — the window in which « oops » still means
     something. After that it folds itself, so nothing stale stays in the panel. */
  useEffect(() => {
    if (!resetDone) return undefined;
    const timer = window.setTimeout(() => {
      setResetDone(false);
      setUndoChapter(null);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [resetDone]);

  /** One gesture, two memories: the chapter and the places it lives next to go
      back to blank together, and the undo below brings both back together. */
  const onResetChapter = () => {
    /* The lists are read before they are wiped: they are exactly what
       « Annuler » puts back, on the device and on the account, without
       recomputing anything. */
    setUndoChapter({ sections: readSections, places });
    resetChapter();
    resetPlaces();
    setJustRead(null);
    setJustReadPlace(null);
    setResetDone(true);
  };

  const onUndoReset = () => {
    if (undoChapter) {
      restoreChapter(undoChapter.sections);
      restorePlaces(undoChapter.places);
    }
    setUndoChapter(null);
    setResetDone(false);
  };

  /** Anything to clear? The chapter, the places, or both — the same door says
      which one it is about instead of pretending only the chapter exists. */
  const nothingRead = readSections.length === 0 && places.length === 0;
  const resetLabel = places.length > 0 ? t('navm.resetBoth') : t('navm.reset');
  const resetNote = places.length > 0 ? t('navm.resetBothOk') : t('navm.resetOk');

  /* « Chapitre terminé » et la confirmation de remise à zéro disent la même
     chose de la même façon : la marque visible reste muette, et une seule zone
     de statut porte la phrase, une fois par occasion. L'occasion change de nom
     à chaque événement — l'ouverture, la fin du chapitre, la remise à zéro —
     pour qu'une confirmation ne soit jamais tue, ni dite deux fois. */
  const chapterSaid = useSpokenOnce(
    moreOpen && (chapterAllRead || resetDone),
    resetDone ? resetNote : t('navm.chapterDone'),
    `${moreOpen}|${chapterAllRead}|${resetDone}`,
  );

  /* A section hands the screen over: its door keeps its mark for one short beat
     while the accent drains out, so the end of a chapter never cracks. */
  useEffect(() => {
    const prev = prevBeatRef.current;
    prevBeatRef.current = beat;
    if (!prev || prev === beat) return;
    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (!SECTION_BEATS.includes(prev)) {
      setFading(null);
      return;
    }
    setFading(prev);
    fadeTimerRef.current = window.setTimeout(() => {
      fadeTimerRef.current = null;
      setFading(null);
    }, 260);
  }, [beat]);

  useEffect(() => () => {
    stopHoverTimers();
    stopAcctHoverTimers();
    if (lingerTimerRef.current !== null) {
      window.clearTimeout(lingerTimerRef.current);
      lingerTimerRef.current = null;
    }
    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (sheetLingerRef.current !== null) {
      window.clearTimeout(sheetLingerRef.current);
      sheetLingerRef.current = null;
    }
    if (subFadeTimerRef.current !== null) {
      window.clearTimeout(subFadeTimerRef.current);
      subFadeTimerRef.current = null;
    }
  }, []);

  return (
    <>
      {skip && (
        <a className="skip-link" href="#main-content">{t('a11y.skipContent')}</a>
      )}
      <header
        ref={headerRef}
        className={`nav${scrolled ? ' is-solid' : ''}${hidden ? ' is-hidden' : ''}`}
        onFocusCapture={() => setHidden(false)}
      >
        <NavLogo />
        <nav className="nav-links">
          {variant === 'home' ? (
            <>
              {homeLinks.map((l, i) => {
                /* The opening door is the page itself; the request below it only
                   takes the mark while its beat actually holds the screen. */
                const here = i === 0 ? onHomeTop : readingBesoin;
                /* « Demandes » leaves on a fade when its beat ends. */
                const out = !here && i > 0 && fading === 'besoin';
                /* The row's own section answers like the panel and the sheet do:
                   once « Demandes » has just been read, its label carries the
                   very same pill, so all three sections speak alike. */
                const ticked = i > 0 && justRead === 'besoin';
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    data-progress={l.p}
                    data-section-door=""
                    onClick={holdPanelsBriefly}
                    className={[
                      here ? 'is-current' : out ? 'is-fading' : '',
                      ticked ? 'nav-link-tick-host' : '',
                    ].filter(Boolean).join(' ') || undefined}
                    aria-current={here ? 'location' : undefined}
                  >
                    <i className={l.icon} aria-hidden="true"></i>
                    {t(l.key)}
                    {ticked && (
                      <span
                        className="nav-link-tick"
                        role="img"
                        aria-label={`${t('navm.readTick')} : ${t(l.key)}`}
                      >
                        <i className="ri-check-line" aria-hidden="true"></i>
                        {t('navm.read')} · {t(l.key)}
                      </span>
                    )}
                  </a>
                );
              })}
              {/* Les trois guichets, à la même place que la demande du film
                  occupait : une vraie page, qui dit par où passer. */}
              <Link
                to="/demandes"
                className={onDemandesPage ? 'is-current' : undefined}
                aria-current={onDemandesPage ? 'page' : undefined}
              >
                <i className="ri-survey-line" aria-hidden="true"></i>
                {t('nav.demandes')}
              </Link>
              {/* « Offres » a quitté le panneau pour le rang : les formules
                  se lisent à côté des guichets, comme une seconde entrée
                  du même propos — et non plus une porte cachée. */}
              <Link
                to="/offres"
                className={onOffresPage ? 'is-current' : undefined}
                aria-current={onOffresPage ? 'page' : undefined}
              >
                <i className="ri-price-tag-3-line" aria-hidden="true"></i>
                {t('nav.offres')}
              </Link>
              <DirTypeMenu
                current={onDirectoryPage}
                tick={placeTick('annuaire')}
                suspended={moreOpen || acctOpen}
                onOpen={() => {
                  setAcctOpen(false);
                  setMoreOpen(false);
                }}
              />
            </>
          ) : (
            <>
              <Link
                to="/"
                className={onHomeTop ? 'is-current' : undefined}
                aria-current={onHomeTop ? 'page' : undefined}
              >
                <i className="ri-home-5-line" aria-hidden="true"></i>
                {t('nav.plateforme')}
              </Link>
              {/* La même porte que sur l'accueil : les trois guichets se
                  rejoignent depuis n'importe quelle page. */}
              <Link
                to="/demandes"
                className={onDemandesPage ? 'is-current' : undefined}
                aria-current={onDemandesPage ? 'page' : undefined}
              >
                <i className="ri-survey-line" aria-hidden="true"></i>
                {t('nav.demandes')}
              </Link>
              {/* « Offres » a quitté le panneau pour le rang : les formules
                  se lisent à côté des guichets, comme une seconde entrée
                  du même propos — et non plus une porte cachée. */}
              <Link
                to="/offres"
                className={onOffresPage ? 'is-current' : undefined}
                aria-current={onOffresPage ? 'page' : undefined}
              >
                <i className="ri-price-tag-3-line" aria-hidden="true"></i>
                {t('nav.offres')}
              </Link>
              <DirTypeMenu
                current={onDirectoryPage}
                tick={placeTick('annuaire')}
                suspended={moreOpen || acctOpen}
                onOpen={() => {
                  setAcctOpen(false);
                  setMoreOpen(false);
                }}
              />
            </>
          )}
          <div
            className="nav-more"
            ref={moreRef}
            onPointerEnter={onMorePointerEnter}
            onPointerLeave={onMorePointerLeave}
          >
            <button
              type="button"
              ref={moreBtnRef}
              className={`nav-more-btn${moreOpen ? ' is-open' : ''}`}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => {
                stopHoverTimers();
                openedByHoverRef.current = false;
                setAcctOpen(false);
                setMoreOpen((v) => !v);
              }}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
                e.preventDefault();
                setAcctOpen(false);
                focusOnOpenRef.current = true;
                setMoreOpen(true);
              }}
            >
              <i className="nav-more-ico ri-apps-2-line" aria-hidden="true"></i>
              {t('nav.more')}
              {/* A section of this page is being read: the closed panel keeps a
                  small witness so the mark is not hidden behind the button.
                  Panel open, the same witness becomes a count of the sections
                  already read — the bar keeps its bearings either way. */}
              {readingSection && !moreOpen && (
                <span className="nav-more-dot" aria-hidden="true"></span>
              )}
              {moreOpen && readSections.length > 0 && (
                <span className="nav-more-count" aria-hidden="true">{readSections.length}</span>
              )}
              <i className="ri-arrow-down-s-line nav-more-caret" aria-hidden="true"></i>
            </button>
            {moreOpen && (
              <div
                className="nav-more-menu"
                role="menu"
                /* Le nom du panneau ouvert dit ce qu'il tient, dès la première
                   image : le total est relevé avant la peinture (voir le
                   useLayoutEffect ci-dessus), donc le chiffre qu'on entend en
                   entrant dans le menu est déjà le vrai. Il ne répète pas le
                   compte de la flèche — celui-là dit ce qui reste, celui-ci
                   ce qu'il y avait au départ. */
                aria-label={totalDoorsPhrase ? `${t('nav.more')} · ${totalDoorsPhrase}` : t('nav.more')}
                ref={moreMenuRef}
                onKeyDown={onMoreMenuKey}
              >
                {sectionDoors.length > 0 && (
                  <div className={`nav-more-pinned${morePinnedScrolled ? ' is-scrolled' : ''}`}>
                    {/* One door only: its own label says what it is, so the
                        block no longer repeats itself with a heading. */}
                    {sectionDoors.map(renderDoor)}
                    {/* The chapter count belongs to the home page only: the two
                        doors above now lead to pages of their own. */}
                    {variant === 'home' && (
                    <div className="nav-more-progress">
                      <span className="nav-more-progress-lbl">{t('navm.chapter')}</span>
                      <span className="nav-more-progress-num">
                        {readSections.length}/{SECTION_BEATS.length}
                      </span>
                      {/* The line is a door as well: it walks to the next
                          section of the chapter that has not been read yet. */}
                      <button
                        type="button"
                        role="menuitem"
                        className="nav-more-next"
                        onClick={onJumpNext}
                        aria-label={`${t('navm.chapter')} — ${readSections.length}/${SECTION_BEATS.length} ${t('navm.sectionsRead')} · ${chapterAllRead ? t('navm.jumpDone') : `${t('navm.jumpNext')} : ${t(SECTION_LABEL[nextUnreadSection])}`}`}
                        title={chapterAllRead ? t('navm.jumpDone') : `${t('navm.jumpNext')} — ${t(SECTION_LABEL[nextUnreadSection])}`}
                      >
                        <span
                          className="nav-more-progress-track"
                          aria-hidden="true"
                        >
                          <i style={{ width: `${(readSections.length / SECTION_BEATS.length) * 100}%` }} />
                        </span>
                      </button>
                      {/* The other half of the same memory: the places of the
                          row that have been read. They are not beats, so they
                          are said on their own line — and the reset below
                          clears them in the same gesture. */}
                      {places.length > 0 && (
                        <p className="nav-more-places">
                          <i className="ri-bookmark-3-line" aria-hidden="true"></i>
                          <span>
                            {t('navm.placesRead')} ·{' '}
                            {places.map((place) => t(PLACE_LABEL[place])).join(' · ')}
                          </span>
                        </p>
                      )}
                      {/* The whole chapter has been walked: the panel says it
                          plainly instead of leaving a bare « 3/3 » to decode. */}
                      {/* La fin du chapitre se voit, elle ne se crie plus :
                          la marque reste lisible dans l'ordre du document, et
                          c'est la zone de statut plus bas qui l'annonce une
                          seule fois — exactement comme le repère de fin. */}
                      {chapterAllRead && (
                        <p className="nav-more-done">
                          <i className="ri-check-double-line" aria-hidden="true"></i>
                          {t('navm.chapterDone')}
                        </p>
                      )}
                      {/* The count can be taken back: one small door clears the
                          chapter and the places on this device and on the
                          account together. */}
                      {!nothingRead && (
                        <button
                          type="button"
                          role="menuitem"
                          className="nav-more-reset"
                          onClick={onResetChapter}
                        >
                          <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                          {resetLabel}
                        </button>
                      )}
                      {/* For five seconds the wipe can be undone, with a thin
                          countdown saying how long the door stays open. */}
                      <div className="nav-more-reset-undo">
                        <p className="nav-more-reset-note">
                          {resetDone ? resetNote : ''}
                        </p>
                        {resetDone && undoChapter && (undoChapter.sections.length > 0 || undoChapter.places.length > 0) && (
                          <button
                            type="button"
                            role="menuitem"
                            className="nav-more-reset-back"
                            onClick={onUndoReset}
                          >
                            <i className="ri-arrow-go-forward-line" aria-hidden="true"></i>
                            {t('navm.undo')}
                          </button>
                        )}
                      </div>
                    </div>
                    )}
                    <span className="nav-more-rule" aria-hidden="true"></span>
                  </div>
                )}
                {/* Trois rubriques, les mêmes que dans la feuille : le réseau
                    qu’on visite, le travail qu’on y fait, le compte en dernier.
                    Entre 1024 et 1299 px, le rang s’efface : la seule porte
                    qu’il ne peut plus montrer se glisse en tête du réseau. */}
                <div className="nav-more-group" data-group="network">
                <p className="nav-more-head">
                  {t('navm.grpNetwork')}
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
                <div className="nav-more-compact">
                  {compactDoors.map(renderDoor)}
                </div>
                {/* La porte de l’annuaire et sa flèche : la ligne ouvre
                    l’annuaire entier, la flèche déplie les huit types — repliés
                    d’office, pour que la rubrique tienne dans la vue. */}
                <div className="nav-door-head nav-more-typeshost">
                  <Link
                    to="/annuaire"
                    role="menuitem"
                    className={`nav-more-item${onDirectoryPage || onAuthorsPage ? ' is-current' : ''}`}
                    aria-current={onDirectoryPage || onAuthorsPage ? 'page' : undefined}
                    onClick={() => setMoreOpen(false)}
                  >
                    <i className="ri-building-4-line" aria-hidden="true"></i>
                    <span className="nav-more-txt">
                      <span className="nav-more-label">{t('nav.annuaire')}</span>
                      <small>{t('navm.hintDirectory')}</small>
                    </span>
                    {placeTick('annuaire')}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className={`nav-door-toggle nav-door-toggle--count${typesOpen ? ' is-open' : ''}`}
                    aria-expanded={typesOpen}
                    aria-controls="nav-more-dir-types"
                    aria-label={`${t('nav.annuaire')} — ${typesOpen ? t('navm.subClose') : t('navm.dirOpen')} · ${t('navm.dirTypesCount').replace('{n}', String(DIRECTORY_TRADES.length))}`}
                    title={`${typesOpen ? t('navm.subClose') : t('navm.dirOpen')} · ${t('navm.dirTypesCount').replace('{n}', String(DIRECTORY_TRADES.length))}`}
                    onClick={toggleTypes}
                  >
                    <b className="nav-door-toggle-n">{DIRECTORY_TRADES.length}</b>
                    <i className={typesOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} aria-hidden="true"></i>
                  </button>
                </div>
                {typesOpen && (
                  <div id="nav-more-dir-types">
                    <DirTypeLinks variant="panel" onNavigate={() => setMoreOpen(false)} />
                  </div>
                )}
                {/* Les deux tableaux se rangent sous la porte de l'annuaire,
                    avant les auteurs : le réseau se lit par ce qu'on y trouve,
                    et les annonces comme les emplois y mènent d'un cran. Chacun
                    déplie ses rubriques derrière sa flèche — le même menu que
                    les huit types, au même endroit de la liste. */}
                <NavDoorList
                  items={boardMenus}
                  variant="panel"
                  searchPlaceholder={t('navm.boardSearch')}
                  onNavigate={() => setMoreOpen(false)}
                  onFold={onPanelFold}
                />
                {/* Le filet de la famille : Annonces et Emplois ferment la
                    parenté de l'annuaire, et les autres lieux du réseau
                    reprennent dessous. Discret — il coud les deux tableaux au
                    lieu de les séparer du reste. */}
                <span className="nav-more-rule nav-more-rule--soft" aria-hidden="true"></span>
                {/* Le mot de couture, le même que dans le pied de page et la
                    feuille du téléphone : le filet ci-dessus ne se lit donc
                    pas comme une simple séparation, mais comme le pas vers la
                    suite du réseau. Ce n'est pas une porte — un mot, posé au
                    même endroit des trois surfaces. */}
                <span className="nav-more-seam">{t('foot.seam')}</span>
                {networkDoors.map(renderDoor)}
                </div>
                <span className="nav-more-rule" aria-hidden="true"></span>
                {/* La rubrique du travail et toutes ses portes, dans un même
                    bloc : c'est ce bloc que le compte de l'intitulé mesure.
                    Le chiffre se lit à côté du mot, donc sans déplier la
                    rubrique — il dit ce qu'elle tient, jamais ce qui reste. */}
                <div className="nav-more-group" data-group="work">
                <p className="nav-more-head">
                  {t('navm.grpWork')}
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
                {workDoors.map(renderDoor)}
                {/* La porte de conversion ferme la rubrique du travail : elle
                    est déjà dans la feuille, à la même place. */}
                <a
                  href={ctaHref}
                  role="menuitem"
                  data-section-door=""
                  className="nav-more-item nav-more-join"
                  onClick={holdPanelsBriefly}
                >
                  <i className="ri-send-plane-line" aria-hidden="true"></i>
                  <span className="nav-more-txt">
                    <span className="nav-more-label">{t('nav.rejoindre')}</span>
                    <small>{t('navm.hintJoin')}</small>
                  </span>
                </a>
                {/* A request left waiting for days is said once, under its own
                    door, with the way to it one click away — the panel reminds
                    without turning into a second counter. */}
                {b2bLate > 0 && (
                  <Link
                    to={b2bLateHref}
                    role="menuitem"
                    className={`nav-more-late${lateMuted ? ' is-muted' : ''}`}
                    title={b2bStats.lateOldestRef
                      ? `${t('navm.b2bLateGo')} · ${b2bStats.lateOldestRef}`
                      : t('navm.b2bLateGo')}
                    onClick={() => setMoreOpen(false)}
                  >
                    <i className="ri-time-line" aria-hidden="true"></i>
                    <span className="nav-more-late-txt">
                      <span>
                        {b2bLate === 1
                          ? t('navm.b2bLateOne')
                          : `${b2bLate} ${t('navm.b2bLate')}`}
                      </span>
                      {/* Which day the oldest one dates from, and how long that
                          really is: the count gets a face, and the delay is
                          read without counting the days by hand. */}
                      {/* A second threshold, under the first: how many of them
                          have passed a whole week — a wait and an urgency are
                          no longer read as one number. */}
                      {b2bVeryLateLabel && (
                        <span className="nav-more-late-week">{b2bVeryLateLabel}</span>
                      )}
                      {b2bLateSince && (
                        <small>
                          {t('navm.b2bLateSince')} {b2bLateSince}
                          {b2bLateDaysLabel && (
                            <span className="nav-more-late-days"> · {b2bLateDaysLabel}</span>
                          )}
                        </small>
                      )}
                      {/* Whether this door has ever served: the last time it was
                          taken, and on which request. Quieter than the delay. */}
                      {recallLabel && (
                        <small className="nav-more-late-recall">
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
                {/* Silent for the day, with the trace of the deferral: the
                    same line in the panel as in the sheet. */}
                {b2bLate > 0 && <LateReminderMute surface="panel" />}
                {/* Le rappel est une porte : son texte se lit dans le menu,
                    quand on y arrive. Ce qu'il ne doit pas faire, c'est se
                    répéter — la phrase est donc déposée une seule fois, dans
                    la zone de statut, à la première apparition de cette
                    attente-là, panneau et feuille comprises. */}
                <p className="nav-end-said" role="status" aria-live="polite">{b2bLateSaid}</p>
                </div>
                {/* Le compte en dernier, sous son intitulé, avec son compte de
                    portes comme les deux rubriques du dessus. */}
                <div className="nav-more-group" data-group="account">
                <p className="nav-more-head">
                  {t('navm.grpAccount')}
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
                {session ? (
                  <>
                    <Link
                      to="/messages"
                      role="menuitem"
                      className={`nav-more-item${onMessagesPage ? ' is-current' : ''}`}
                      aria-current={onMessagesPage ? 'page' : undefined}
                      onClick={() => setMoreOpen(false)}
                    >
                      <i className="ri-chat-3-line" aria-hidden="true"></i>
                      <span className="nav-more-txt">
                        <span className="nav-more-label">{t('nav.messages')}</span>
                        <small>
                          {unreadMsgs > 0
                            ? `${unreadMsgs} ${t('nav.msgsUnread')}`
                            : t('navm.msgsNone')}
                        </small>
                      </span>
                    </Link>
                    <Link
                      to="/compte#mes-candidatures"
                      role="menuitem"
                      className={`nav-more-item${onAppsPage ? ' is-current' : ''}`}
                      aria-current={onAppsPage ? 'page' : undefined}
                      onClick={() => setMoreOpen(false)}
                    >
                      <i className="ri-file-user-line" aria-hidden="true"></i>
                      <span className="nav-more-txt">
                        <span className="nav-more-label">{t('navm.apps')}</span>
                        <small>
                          {unreadApps > 0
                            ? `${unreadApps} ${t('nav.appsUnread')}`
                            : memberName || t('nav.compte')}
                        </small>
                      </span>
                    </Link>
                    <Link
                      to="/compte"
                      role="menuitem"
                      className={`nav-more-item${onComptePage ? ' is-current' : ''}`}
                      aria-current={onComptePage ? 'page' : undefined}
                      onClick={() => setMoreOpen(false)}
                    >
                      <i className="ri-user-settings-line" aria-hidden="true"></i>
                      <span className="nav-more-txt">
                        <span className="nav-more-label">{t('nav.compte')}</span>
                        <small>{memberWilaya || session.user?.email || t('navm.hintAccount')}</small>
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/compte/connexion"
                      role="menuitem"
                      className={`nav-more-item${onSigninPage ? ' is-current' : ''}`}
                      aria-current={onSigninPage ? 'page' : undefined}
                      onClick={() => setMoreOpen(false)}
                    >
                      <i className="ri-user-line" aria-hidden="true"></i>
                      <span className="nav-more-txt">
                        <span className="nav-more-label">{t('nav.signin')}</span>
                        <small>{t('navm.hintSignin')}</small>
                      </span>
                    </Link>
                    <Link
                      to="/compte/inscription"
                      role="menuitem"
                      className={`nav-more-item${onSignupPage ? ' is-current' : ''}`}
                      aria-current={onSignupPage ? 'page' : undefined}
                      onClick={() => setMoreOpen(false)}
                    >
                      <i className="ri-user-add-line" aria-hidden="true"></i>
                      <span className="nav-more-txt">
                        <span className="nav-more-label">{t('nav.signupCta')}</span>
                        <small>{t('navm.hintSignup')}</small>
                      </span>
                    </Link>
                  </>
                )}
                </div>
                {/* La liste a un bout : quand le panneau défile vraiment, un
                    petit repère la ferme, juste avant le plancher. Il est dans
                    le flux, donc il ne recouvre aucune porte et son arrivée ne
                    fait rien sauter. */}
                {moreScrolls && (
                  <p className="nav-more-end" aria-hidden="true">
                    <i className="ri-check-line" aria-hidden="true"></i>
                    <span>{t('navm.listEnd')}</span>
                  </p>
                )}
                {/* Le même mot, dit une seule fois par ouverture, pour qui lit
                    à l'oreille : le repère visible est une marque, cette phrase
                    est son annonce. */}
                <p className="nav-end-said" role="status" aria-live="polite">{listEndSaid}</p>
                {/* La même zone, pour les deux phrases du chapitre : la fin et
                    la remise à zéro se disent donc exactement comme le bout de
                    la liste — une fois, dans la langue lue, sans se répéter. */}
                <p className="nav-end-said" role="status" aria-live="polite">{chapterSaid}</p>
                {/* Le compte de la flèche, dit à voix basse : une tournure
                    nouvelle seulement, et une fois le compte posé. */}
                <p className="nav-end-said" role="status" aria-live="polite">{moreDoorsLeftSaid}</p>
                {/* Le compte de la rubrique que le repli vient d'alléger :
                    « Le réseau · 12 portes », une fois la mesure posée. */}
                <p className="nav-end-said" role="status" aria-live="polite">{rubricSaid}</p>
                {/* Le pied du panneau : la langue en cours à gauche, la sortie
                    de compte au bout. Il ne prend pas la voix d'une porte — un
                    rappel, sous un filet, d'un cran plus bas que les rubriques. */}
                <div
                  className={`nav-more-foot${morePinnedScrolled ? ' is-scrolled' : ''}`}
                  ref={moreFootRef}
                >
                  <span className="nav-more-foot-lang">
                    <i className="ri-translate-2" aria-hidden="true"></i>
                    {t('navm.langLabel')}
                  </span>
                  <LangSwitch compact />
                  {session && (
                    <button
                      type="button"
                      role="menuitem"
                      className="nav-more-foot-out"
                      onClick={onSignOut}
                      disabled={signingOut}
                    >
                      <i className="ri-logout-box-r-line" aria-hidden="true"></i>
                      <span>{t('acct.signout')}</span>
                    </button>
                  )}
                </div>
                {/* Des portes restent sous la ligne : un voile au bas du
                    panneau et une petite flèche le disent, et la flèche fait
                    descendre la liste d'un écran. Dès que la fin est en vue,
                    les deux s'effacent. */}
                {moreHasMore && (
                  <button
                    type="button"
                    role="menuitem"
                    className="nav-more-more"
                    aria-label={moreDoorsLeftPhrase
                      ? `${t('navm.moreBelow')} · ${moreDoorsLeftPhrase}`
                      : t('navm.moreBelow')}
                    title={moreDoorsLeftPhrase
                      ? `${t('navm.moreBelow')} · ${moreDoorsLeftPhrase}`
                      : t('navm.moreBelow')}
                    onClick={onMoreScrollHint}
                  >
                    {/* La flèche porte le compte des portes restantes : elle
                        dit toujours où l'on va, le chiffre dit ce qui reste
                        avant le plancher. */}
                    <span aria-hidden="true" className={moreDoorsLeft > 0 ? 'has-n' : undefined}>
                      <i className="ri-arrow-down-s-line"></i>
                      {moreDoorsLeft > 0 && <b className="nav-more-cue-n">{moreDoorsLeft}</b>}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
        <div className="nav-right">
          <LangSwitch />
          {/* The candidate door, always one click away: the board is for
              signed-in members, so the bar must offer the way in — and a
              business account has as much right to a candidate profile. */}
          {offersCandidateDoor && pathname !== '/compte/inscription/candidat' && (
            <Link to="/compte/inscription/candidat" className="nav-cand" title={t('nav.candHint')}>
              {/* La carte du candidat, pas le geste d'inscription : ce signe-là
                  reste à « S'inscrire », qui ouvrirait sinon la même porte. */}
              <i className="ri-id-card-line" aria-hidden="true"></i>
              <span className="nav-cand-txt">{t('nav.candCta')}</span>
            </Link>
          )}
          {session ? (
            <div className="nav-acct" ref={acctRef} onPointerEnter={onAcctPointerEnter} onPointerLeave={onAcctPointerLeave}>
              <button
                type="button"
                ref={acctBtnRef}
                className={`nav-account nav-member${acctOpen ? ' is-open' : ''}`}
                aria-expanded={acctOpen}
                aria-haspopup="menu"
                aria-label={`${memberName || t('nav.compte')} — ${t('navm.openAccount')}`}
                title={memberWilaya ? `${memberName} · ${memberWilaya}` : memberName}
                onClick={() => {
                  stopAcctHoverTimers();
                  acctOpenedByHoverRef.current = false;
                  setMoreOpen(false);
                  setAcctOpen((v) => !v);
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
                  e.preventDefault();
                  stopAcctHoverTimers();
                  acctOpenedByHoverRef.current = false;
                  setMoreOpen(false);
                  acctFocusOnOpenRef.current = true;
                  setAcctOpen(true);
                }}
              >
                <i className="ri-user-star-line" aria-hidden="true"></i>
                <span className="nav-member-txt">
                  <b>{memberName || t('nav.compte')}</b>
                  {memberWilaya && <small>{memberWilaya}</small>}
                </span>
                {accountAlerts > 0 && (
                  <span className="nav-badge" aria-hidden="true">
                    {accountAlerts > 9 ? '9+' : accountAlerts}
                  </span>
                )}
                <i className={acctOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} aria-hidden="true"></i>
              </button>
              {acctOpen && (
                <div
                  className="nav-acct-menu"
                  role="menu"
                  aria-label={t('navm.menuTitle')}
                  ref={acctMenuRef}
                  onKeyDown={onAcctMenuKey}
                >
                  <div className="nav-acct-head">
                    <b>{memberName || t('nav.compte')}</b>
                    <small>{session.user?.email || memberWilaya}</small>
                  </div>
                  <Link
                    to="/compte#mes-candidatures"
                    role="menuitem"
                    className={onAppsPage ? 'is-current' : undefined}
                    aria-current={onAppsPage ? 'page' : undefined}
                    onClick={() => setAcctOpen(false)}
                  >
                    <i className="ri-file-user-line" aria-hidden="true"></i>
                    <span>{t('navm.apps')}</span>
                    {unreadApps > 0 && (
                      <span className="nav-acct-count">{unreadApps > 9 ? '9+' : unreadApps}</span>
                    )}
                  </Link>
                  <Link
                    to="/messages"
                    role="menuitem"
                    className={onMessagesPage ? 'is-current' : undefined}
                    aria-current={onMessagesPage ? 'page' : undefined}
                    onClick={() => setAcctOpen(false)}
                  >
                    <i className="ri-chat-3-line" aria-hidden="true"></i>
                    <span>{t('nav.messages')}</span>
                    <span className="nav-acct-count">{unreadMsgs > 0 ? unreadMsgs : ''}</span>
                  </Link>
                  {isWorkshop && (
                    <Link
                      to="/compte#demandes-b2b"
                      role="menuitem"
                      className={onB2bPage ? 'is-current' : undefined}
                      aria-current={onB2bPage ? 'page' : undefined}
                      onClick={() => setAcctOpen(false)}
                    >
                      {/* La boîte ouverte, quand le dépôt d'une demande garde
                          la boîte fermée : deux portes, deux signes. */}
                      <i className="ri-inbox-line" aria-hidden="true"></i>
                      <span>{t('nav.b2b')}</span>
                      <span className="nav-acct-count">{b2bTodo > 0 ? b2bTodo : ''}</span>
                    </Link>
                  )}
                  <Link
                    to="/compte"
                    role="menuitem"
                    className={onComptePage ? 'is-current' : undefined}
                    aria-current={onComptePage ? 'page' : undefined}
                    onClick={() => setAcctOpen(false)}
                  >
                    <i className="ri-user-settings-line" aria-hidden="true"></i>
                    <span>{t('nav.compte')}</span>
                  </Link>
                  <span className="nav-more-rule" aria-hidden="true"></span>
                  <button
                    type="button"
                    role="menuitem"
                    className="nav-acct-out"
                    onClick={onSignOut}
                    disabled={signingOut}
                  >
                    <i className="ri-logout-box-r-line" aria-hidden="true"></i>
                    <span>{t('acct.signout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : !onSigninPage && (
            <Link to="/compte/connexion" className="nav-account is-plain">
              <i className="ri-user-line" aria-hidden="true"></i>
              <span>{t('nav.signin')}</span>
            </Link>
          )}
          {/* Le bouton « Nous contacter » a quitté le haut de la page : le
              contact se prend par la section qui lui est consacrée et par le
              pied de page. Seul le geste « Créer un compte » reste ici, et
              seulement là où il a du sens — sur les pages d'espace, avant
              connexion. */}
          {onAccountPages && !session && (
            <Link to="/compte/inscription" className="nav-cta">{t('nav.signupCta')}</Link>
          )}
          <button
            type="button"
            className="nav-burger"
            ref={burgerRef}
            aria-label={variant === 'home' && readSections.length > 0
              ? `${t('nav.menu')} — ${readSections.length}/${SECTION_BEATS.length} ${t('navm.sectionsRead')}`
              : t('nav.menu')}
            aria-expanded={open}
            onClick={toggleSheet}
          >
            <i className={open ? 'ri-close-line' : 'ri-menu-line'}></i>
            {/* The same count the panel carries, kept on the burger while the
                sheet is shut: the bar says how far the chapter has been read
                without anything being opened. Before the first section has
                been entered, there is no count to give — so the plain dot
                stands in, instead of a « 0/3 » that would read like a score. */}
            {variant === 'home' && !open && (readSections.length > 0 ? (
              <span className="nav-burger-count" aria-hidden="true">
                {readSections.length}/{SECTION_BEATS.length}
              </span>
            ) : (
              <span className="nav-burger-dot" aria-hidden="true"></span>
            ))}
          </button>
        </div>
      </header>
      <PhoneSheet
        open={open}
        onClose={closeSheetNow}
        home={variant === 'home'}
        sheetRef={sheetRef}
        pinnedScrolled={sheetPinnedScrolled}
        onPlatformPage={onPlatformPage}
        onSuiviPage={onSuiviPage}
        onDirectoryPage={onDirectoryPage}
        onAuthorsPage={onAuthorsPage}
        onCandidatesPage={onCandidatesPage}
        onNewCandidatesPage={onNewCandidatesPage}
        onWorldPage={pathname.startsWith('/arabe-world')}
        onDemandesPage={onDemandesPage}
        onB2bRequestPage={onB2bRequestPage}
        onB2bInboxPage={onB2bPage}
        onOffresPage={onOffresPage}
        onDeposerPage={onDeposerPage}
        onMessagesPage={onMessagesPage}
        onAccountPages={onAccountPages}
        scope={scope}
        hintAuthors={hintAuthors}
        hintListings={hintListings}
        hintJobs={hintJobs}
        justRead={justRead}
        justReadPlace={justReadPlace}
        nothingRead={nothingRead}
        resetDone={resetDone}
        readSections={readSections}
        places={places}
        chapterAllRead={chapterAllRead}
        resetLabel={resetLabel}
        resetNote={resetNote}
        undoChapter={undoChapter}
        onResetChapter={onResetChapter}
        onUndoReset={onUndoReset}
        subInView={subInView}
        facHref={facHref}
        facWord={facWord}
        facCompte={facCompte}
        signedIn={Boolean(session)}
        offersCandidateDoor={offersCandidateDoor}
        ctaHref={ctaHref}
        latestHref={latestHref}
        isWorkshop={isWorkshop}
        b2bTodo={b2bTodo}
        b2bLate={b2bLate}
        lateMuted={lateMuted}
        b2bLateHref={b2bLateHref}
        b2bLateRef={b2bStats.lateOldestRef || ''}
        veryLateLabel={b2bVeryLateLabel}
        lateSince={b2bLateSince}
        lateDaysLabel={b2bLateDaysLabel}
        recallLabel={recallLabel}
        recallSourceIcon={recallSourceIcon}
        recallSourceLabel={recallSourceLabel}
        muteEndLabel={muteEndLabel}
        memberName={memberName}
        memberWilaya={memberWilaya}
        unreadApps={unreadApps}
        unreadMsgs={unreadMsgs}
        signingOut={signingOut}
        onSignOut={onSignOut}
      />
    </>
  );
}