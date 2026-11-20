/**
 * Les trois profils du pied de page, et leur adresse.
 *
 * Une pastille sans `href` reste un repère : elle garde sa marque, mais elle
 * n'ouvre rien et ne promet rien. Dès qu'une adresse est écrite ici, la même
 * pastille redevient un lien — sans toucher au pied de page ni au style, qui
 * savent déjà distinguer les deux états.
 *
 * Il n'y a donc qu'une ligne à compléter le jour où une page existe.
 */
export type SocialKey = 'linkedin' | 'facebook' | 'instagram';

export type SocialProfile = {
  key: SocialKey;
  /** Le nom de la plateforme, tel qu'il se lit dans l'infobulle. */
  label: string;
  /** Le signe Remix de la marque. */
  icon: string;
  /** L'adresse du profil. Absente tant que la page n'est pas ouverte. */
  href?: string;
};

export const SOCIAL_PROFILES: SocialProfile[] = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: 'ri-linkedin-line',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: 'ri-facebook-line',
    href: 'https://www.facebook.com/people/PAPER-ATLAS-DZ',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: 'ri-instagram-line',
  },
];