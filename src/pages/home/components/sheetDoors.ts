import { useMemo } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { DIRECTORY_TRADES, slugDeTrade } from '@/lib/tradePages';
import { BASE } from './nav/navShared';

/** La rubrique sous laquelle une porte se range, dans la feuille comme dans
    les résultats de sa recherche. */
export type SheetDoorGroup = 'track' | 'network' | 'work' | 'account';

/** L'ordre des rubriques de la feuille, et l'intitulé qui les nomme. */
export const SHEET_DOOR_GROUPS: Array<{ id: SheetDoorGroup; label: string }> = [
  { id: 'track', label: 'navm.sectionQuote' },
  { id: 'network', label: 'navm.grpNetwork' },
  { id: 'work', label: 'navm.grpWork' },
  { id: 'account', label: 'navm.grpAccount' },
];

/** Une porte de la feuille, telle que la recherche la trouve. */
export type SheetSearchDoor = {
  id: string;
  label: string;
  hint: string;
  icon: string;
  /** La rubrique qu'elle prolonge : les résultats se lisent groupés comme la
      feuille elle-même, pour savoir d'un œil où l'on met le doigt. */
  group: SheetDoorGroup;
  /** Une page. */
  to?: string;
  /** Un lieu de la page, ou une ancre. */
  href?: string;
  /** L'un des huit types d'établissement, quand c'en est un : il ne se range
      pas comme une porte ordinaire, mais sous la flèche de l'annuaire. */
  trade?: string;
  /** La porte vit au-delà du filet de famille de la liste — donc après le mot
      de couture du pied de page. La recherche le sait : une porte trouvée
      là-bas dit à quelle suite du réseau elle appartient, au lieu de flotter
      sous un intitulé de rubrique qui ne la distingue pas de l'annuaire. */
  seam?: boolean;
};

/** Accent-blind, case-blind : « Émirats » et « emirats » se rencontrent. */
export function fold(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Toutes les portes que la feuille du téléphone tient, rassemblées pour la
 * recherche de son en-tête.
 *
 * L'index suit la feuille, rubrique par rubrique : le suivi d'abord, le
 * réseau ensuite (la plateforme, l'annuaire et ses huit types, les deux
 * tableaux qui se rangent sous lui, les auteurs, les candidats et leurs
 * profils neufs, la seconde marque et les trois guichets qui ferment le
 * réseau), le travail puis (la sous-traitance, la demande B2B, les offres, le
 * dépôt d'une annonce, les derniers arrivés et le formulaire de contact), le
 * compte en dernier.
 *
 * Les huit types figurent ici alors même que la flèche de l'annuaire les
 * tient repliés : taper « imprimerie » doit ouvrir l'imprimerie, que la
 * feuille les montre ou non. Ils portent leur rubrique — le réseau — et le
 * nom de leur type, pour que la feuille les rende sous l'annuaire ouvert au
 * lieu de les semer parmi les portes.
 */
export function useSheetSearchDoors(opts: {
  signedIn: boolean;
  ctaHref: string;
}): SheetSearchDoor[] {
  const { t } = useLang();
  const { signedIn, ctaHref } = opts;

  return useMemo(() => {
    /* Les huit types d'établissement, à la même adresse que leurs pastilles :
       la page du type, c'est-à-dire l'annuaire déjà filtré. */
    const types: SheetSearchDoor[] = DIRECTORY_TRADES.map(({ trade, icon }) => ({
      id: `type-${trade}`,
      label: t(`tradePlural.${trade}`),
      hint: t('navm.dirTypes'),
      icon,
      group: 'network',
      to: `/annuaire/${slugDeTrade(trade)}`,
      trade,
    }));

    const account: SheetSearchDoor[] = signedIn
      ? [
        {
          id: 'messages',
          label: t('nav.messages'),
          hint: t('navm.hintMessages'),
          icon: 'ri-chat-3-line',
          group: 'account',
          to: '/messages',
        },
        {
          id: 'compte',
          label: t('nav.compte'),
          hint: t('navm.hintAccount'),
          icon: 'ri-user-settings-line',
          group: 'account',
          to: '/compte',
        },
      ]
      : [
        {
          id: 'connexion',
          label: t('nav.signin'),
          hint: t('navm.hintSignin'),
          icon: 'ri-user-line',
          group: 'account',
          to: '/compte/connexion',
        },
        {
          id: 'inscription',
          label: t('nav.signupCta'),
          hint: t('navm.hintSignup'),
          icon: 'ri-user-add-line',
          group: 'account',
          to: '/compte/inscription',
        },
      ];

    return [
      {
        id: 'suivi',
        label: t('nav.suivi'),
        hint: t('navm.hintTrack'),
        icon: 'ri-truck-line',
        group: 'track',
        to: '/suivi',
      },
      {
        id: 'plateforme',
        label: t('nav.plateforme'),
        hint: t('navm.hintHome'),
        icon: 'ri-home-5-line',
        group: 'network',
        href: `${BASE}/#overview`,
      },
      {
        id: 'annuaire',
        label: t('nav.annuaire'),
        hint: t('navm.hintDirectory'),
        icon: 'ri-building-4-line',
        group: 'network',
        to: '/annuaire',
      },
      ...types,
      {
        id: 'annonces',
        label: t('nav.annonces'),
        hint: t('navm.hintListings'),
        icon: 'ri-megaphone-line',
        group: 'network',
        to: '/annonces',
      },
      {
        id: 'emplois',
        label: t('nav.emplois'),
        hint: t('navm.hintJobs'),
        icon: 'ri-briefcase-line',
        group: 'network',
        to: '/emplois',
      },
      {
        id: 'auteurs',
        label: t('dir.kindAuthors'),
        hint: t('navm.hintAuthors'),
        icon: 'ri-quill-pen-line',
        group: 'network',
        to: '/annuaire?kind=auteurs',
        /* Le filet de la famille ferme les deux tableaux juste au-dessus :
           tout ce qui suit appartient à la suite du réseau, et le dit. */
        seam: true,
      },
      {
        id: 'candidats',
        label: t('candlist.short'),
        hint: t('navm.hintCandidates'),
        icon: 'ri-user-follow-line',
        group: 'network',
        to: '/candidats',
        seam: true,
      },
      /* La porte du pied de page qui manquait à la feuille : les profils neufs
         se cherchent sous les candidats, dans la même rubrique. */
      {
        id: 'candidats-nouveaux',
        label: t('candlist.newLink'),
        hint: t('navm.hintNewCandidates'),
        icon: 'ri-user-star-line',
        group: 'network',
        to: '/candidats?fresh=1',
        seam: true,
      },
      {
        id: 'monde',
        label: t('navm.world'),
        hint: t('navm.hintWorld'),
        icon: 'ri-global-line',
        group: 'network',
        to: '/arabe-world',
        seam: true,
      },
      {
        id: 'demandes',
        label: t('nav.demandes'),
        hint: t('navm.hintDemandes'),
        icon: 'ri-survey-line',
        group: 'network',
        to: '/demandes',
        seam: true,
      },
      {
        id: 'soustraitance',
        label: t('foot.sub'),
        hint: t('navm.hintSub'),
        icon: 'ri-stack-line',
        group: 'work',
        href: `${BASE}/#soustraitance`,
      },
      {
        id: 'b2b',
        label: t('nav.b2b'),
        hint: t('navm.hintB2b'),
        icon: 'ri-inbox-archive-line',
        group: 'work',
        to: '/demande-b2b',
      },
      {
        id: 'offres',
        label: t('nav.offres'),
        hint: t('navm.hintOffers'),
        icon: 'ri-price-tag-3-line',
        group: 'work',
        to: '/offres',
      },
      /* Déposer et les derniers arrivés ferment le travail, comme dans le pied
         de page : leurs signes sont ceux du bas de page. */
      {
        id: 'deposer',
        label: t('foot.deposit'),
        hint: t('navm.hintDeposit'),
        icon: 'ri-upload-cloud-2-line',
        group: 'work',
        to: '/deposer',
      },
      {
        id: 'derniers',
        label: t('foot.latest'),
        hint: t('navm.hintLatest'),
        icon: 'ri-time-line',
        group: 'work',
        href: `${BASE}/#derniers`,
      },
      {
        id: 'rejoindre',
        label: t('nav.rejoindre'),
        hint: t('navm.hintJoin'),
        icon: 'ri-send-plane-line',
        group: 'work',
        href: ctaHref,
      },
      ...account,
    ];
  }, [t, signedIn, ctaHref]);
}