import type { Dict } from './dict';

/**
 * Les rares clés de la console admin et de la relecture qui servent aussi hors
 * de la console (titre du lien admin, libellés d'annonces, repère de pose).
 * Elles restent dans le dictionnaire principal ; les dictionnaires admin et
 * relecture complets ne sont chargés qu'à l'ouverture de la console.
 */
export const adminSharedDict: Record<'fr' | 'ar' | 'en', Dict> = {
  fr: {
    'ad.title': 'Administration du site',
    'ad.ann.kind': 'Type',
    'ad.ann.kindOffre': 'Offre',
    'ad.ann.kindAnnonce': 'Annonce',
    'parPose.badge': '{n} traduction(s) encore à poser',
    'parPose.hint':
      'Repère de pose : {n} traduction(s) encore à poser sur les {cles} clé(s) de {fichier}. Il s’efface quand tout est posé.',
    'parPose.open':
      'Un clic ouvre le relevé de parité, déjà resserré sur ce fichier.',
  },
  ar: {
    'ad.title': 'إدارة الموقع',
    'ad.ann.kind': 'النوع',
    'ad.ann.kindOffre': 'عرض',
    'ad.ann.kindAnnonce': 'إعلان',
    'parPose.badge': '{n} ترجمة لا تزال بحاجة إلى وضع',
    'parPose.hint':
      'مؤشر الوضع: {n} ترجمة لا تزال بحاجة إلى وضع بين {cles} مفتاحًا في {fichier}. يختفي حين يُوضع كل شيء.',
    'parPose.open': 'نقرة واحدة تفتح بيان الترجمة، محصورًا في هذا الملف.',
  },
  en: {
    'ad.title': 'Site administration',
    'ad.ann.kind': 'Type',
    'ad.ann.kindOffre': 'Offer',
    'ad.ann.kindAnnonce': 'Listing',
    'parPose.badge': '{n} translation(s) still to place',
    'parPose.hint':
      'Placement marker: {n} translation(s) still to place across the {cles} key(s) of {fichier}. It disappears once everything is placed.',
    'parPose.open':
      'One click opens the parity report, already narrowed to this file.',
  },
};
