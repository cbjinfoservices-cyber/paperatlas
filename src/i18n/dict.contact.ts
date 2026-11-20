import type { Dict } from './dict';

/** Les mots ajoutés autour du formulaire de contact : le sujet déjà choisi
 *  quand on arrive depuis la page Formules & tarifs, et son rappel dans la
 *  carte de confirmation. Gardé à part pour ne pas alourdir le dictionnaire
 *  principal. */

const fr: Dict = {
  'ofp.contactLink': 'Écrire à l’équipe',
  'ofp.contactLinkHint': 'Le sujet « Devis » y est déjà choisi.',
  'cf.sentSubjectAria': 'Sujet de votre demande',
};

const ar: Dict = {
  'ofp.contactLink': 'اكتب إلى الفريق',
  'ofp.contactLinkHint': 'الموضوع «عرض سعر» مختار سلفًا.',
  'cf.sentSubjectAria': 'موضوع طلبك',
};

const en: Dict = {
  'ofp.contactLink': 'Write to the team',
  'ofp.contactLinkHint': 'The “Quote” subject is already chosen.',
  'cf.sentSubjectAria': 'Subject of your request',
};

export const contactDict: Record<'fr' | 'ar' | 'en', Dict> = { fr, ar, en };