/** Le préfixe de publication, sans sa barre finale. */
export const BASE = __BASE_PATH__.replace(/\/$/, '');

/* La porte du film qui reste dans le rang : son ouverture. « Demandes » n'est
   plus une ancre posée sur un temps du chapitre — elle a désormais sa page, et
   se tient à la même place dans les deux variantes de la barre. */
export const homeLinks = [
  { href: '#overview', p: '0', key: 'nav.plateforme', icon: 'ri-home-5-line' },
];

/* The five beats of the home chapter, in the order Chapter.tsx declares them
   and with the very same numbers: « to » is where each one ends. */
export const HOME_BEATS: Array<{ id: string; to: number }> = [
  { id: 'overview', to: 0.1429 },
  { id: 'besoin', to: 0.3571 },
  { id: 'promesse', to: 0.4286 },
  { id: 'devis', to: 0.7143 },
  { id: 'livraison', to: 1.01 },
];

export type Door = {
  to?: string;
  href?: string;
  key: string;
  icon: string;
  hint: string;
  here?: boolean;
  /* La section vient de lâcher l'écran : la porte garde sa marque un court
     instant, le temps que l'accent s'efface au lieu de couper net. */
  leaving?: boolean;
  /* The film beat this door leads to, so its mark can fade on the way out. */
  beat?: string;
  /* Le lieu de la page (et non un temps du film) : la porte montre la pastille
     « Lu » sans jamais entrer dans le compte 3/3 du chapitre. */
  place?: string;
  /* Le périmètre retenu ne contient rien de ce que la puce annonce : la porte
     prend alors le trait en pointillés, comme les puces de l'annuaire. */
  zero?: boolean;
  /* Un second accès direct, rangé sous la porte qu'il prolonge : le même lieu
     ouvert sur une seule de ses faces. */
  sub?: { to: string; key: string; icon: string; hint: string; count?: number };
};