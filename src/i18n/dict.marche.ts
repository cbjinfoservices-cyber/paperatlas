import type { Dict } from './dict';

/**
 * Le guichet « Marchés publics » : le dépôt d'un dossier d'appel d'offres.
 *
 * Même mécanique que la page B2B — mêmes ateliers, même référence, même
 * serveur — mais le vocabulaire change : on n'y décrit pas une quantité, on y
 * dépose un dossier, avec ses pièces et sa date limite de remise. Les erreurs
 * et l'écran de confirmation sont ceux de la page B2B : rien à redire deux fois.
 */

const fr: Dict = {
  'mar.stamp': 'Marché public',
  'mar.title': 'Un appel d’offres se dépose<br><span class="accent">comme un dossier</span>.',
  'mar.lede': 'Acheteur public, objet du marché, lot, date limite de remise : le dossier s’écrit une fois, part aux ateliers que vous retenez, et chacun le lit avec ses pièces.',
  'mar.back': 'Les deux guichets',
  'mar.backHint': 'Revenir à la page qui présente les deux entrées du réseau.',
  'mar.piecesLabel': 'Les pièces du dossier',
  'mar.piece1': 'Cahier des charges',
  'mar.piece2': 'Bordereau des prix',
  'mar.piece3': 'Pièces administratives',
  'mar.piece4': 'Référence de l’avis',
  'mar.note': 'La référence du dossier commence par B2B- : elle suit le marché comme elle suit un tirage, du dépôt à la réponse.',
  'mar.formTitle': 'Le dossier du marché',
  'mar.formNote': 'Les ateliers sollicités reçoivent le dossier tel quel et répondent depuis leur espace.',
  'mar.acheteur': 'Acheteur public',
  'mar.acheteurPh': 'APC d’Oran · direction des moyens généraux',
  'mar.lot': 'Lot / volume',
  'mar.lotPh': 'Lot unique — 12 000 catalogues A4',
  'mar.limit': 'Date limite de remise',
  'mar.limitPh': '24 novembre, 12 h',
  'mar.montant': 'Montant estimé',
  'mar.montantPh': '2 400 000 DA',
  'mar.msg': 'Objet du marché, référence de l’avis et pièces',
  'mar.msgPh': 'Avis n° 12/2026 — fourniture de 12 000 catalogues A4 quadri. Cahier des charges : 14 pages, bordereau des prix en annexe, pièces administratives jointes.',
  'mar.send': 'Déposer le dossier de marché',
  'mar.picked': 'Ateliers sollicités',
  'mar.asideTitle': 'Ce que le dossier doit contenir',
  'mar.aside1': 'Le cahier des charges, avec le nombre de pages et ses annexes.',
  'mar.aside2': 'Le bordereau des prix, lot par lot si le marché est découpé.',
  'mar.aside3': 'Les pièces administratives demandées par l’acheteur.',
  'mar.aside4': 'La référence de l’avis, pour que la réponse cite le bon marché.',
  'mar.howTitle': 'Après le dépôt',
  'mar.how1': 'Le dossier reçoit sa référence à l’instant de l’envoi.',
  'mar.how2': 'Chaque atelier sollicité le lit dans son espace et répond par devis.',
  'mar.how3': 'Le dossier se suit par sa référence, avec son montant et son parcours.',
  'mar.trust': 'Le dossier part directement aux ateliers, sans intermédiaire ni commission.',
  'mar.linkRun': 'Déposer plutôt un grand tirage ou une sous-traitance',
  'mar.linkRunHint': 'Ouvrir le guichet du grand tirage et de la sous-traitance.',
  'mar.linkTrack': 'Suivre un dossier',
  'mar.seeDirectory': 'Parcourir l’annuaire',

  'acct.b2b.marcheBadge': 'Marché public',
  'acct.b2b.marcheBadgeHint':
    'Déposée depuis la page Marchés publics : le dossier est lu avec son vocabulaire — cahier des charges, bordereau, date limite de remise.',

  /* --- Les deux pièces du dossier --- */
  'mar.piecesTitle': 'Les pièces du dossier',
  'mar.piecesOptional': 'facultatif',
  'mar.pieceCdc': 'Cahier des charges',
  'mar.pieceBordereau': 'Bordereau des prix',
  'mar.pieceHint': 'PDF, {size} au plus',
  'mar.pieceAdd': 'Joindre',
  'mar.pieceRemove': 'Retirer',
  'mar.pieceErrType': 'Seul un PDF peut être joint : reprenez le fichier à la bonne extension.',
  'mar.pieceErrSize': 'Ce PDF dépasse la taille acceptée : allégez-le avant de le joindre.',
  'mar.pieceErrSend': 'La pièce n’a pas pu être déposée. Vérifiez votre connexion, puis réessayez.',
  'mar.piecesNote':
    'Les deux PDF partent dans un espace privé : seul l’atelier sollicité les ouvre, par un lien signé.',
  'mar.okPieces': 'Pièces jointes au dossier : {n}',

  /* --- La boîte de l'atelier --- */
  'acct.b2b.filterMarche': 'Marchés publics',
  'acct.b2b.filterMarcheHint':
    'Ne voir que les dossiers déposés depuis la page Marchés publics, à côté des demandes en attente.',
  'acct.b2b.emptyMarche': 'Aucun marché public dans cette boîte pour l’instant.',
  'acct.b2b.piecesLabel': 'Pièces du dossier',
  'acct.b2b.pieceCdc': 'Cahier des charges (PDF)',
  'acct.b2b.pieceBordereau': 'Bordereau des prix (PDF)',
  'acct.b2b.pieceOpenHint': 'Ouvrir le PDF — le lien ne vaut qu’une heure',

  /* --- Les exports --- */
  'acct.b2b.csvNature': 'Nature',
  'acct.b2b.natureMarche': 'Marché public',
  'acct.b2b.natureTirage': 'Grand tirage',
  'acct.b2b.xlsxSynthMarch': 'Dont marchés publics',
};

const ar: Dict = {
  'mar.stamp': 'صفقة عمومية',
  'mar.title': 'المناقصة تُودَع<br><span class="accent">كملفّ كامل</span>.',
  'mar.lede': 'المشتري العمومي، موضوع الصفقة، الحصة، أجل الإيداع: يُكتب الملف مرة واحدة، ويذهب إلى الورشات التي تختارها، وكل واحدة تقرأه بوثائقه.',
  'mar.back': 'الشبّاكان',
  'mar.backHint': 'العودة إلى الصفحة التي تعرض المدخلين إلى الشبكة.',
  'mar.piecesLabel': 'وثائق الملف',
  'mar.piece1': 'دفتر الشروط',
  'mar.piece2': 'جدول الأسعار',
  'mar.piece3': 'الوثائق الإدارية',
  'mar.piece4': 'مرجع الإعلان',
  'mar.note': 'يبدأ مرجع الملف بـ ‎B2B-‎: يتبع الصفقة كما يتبع الطبعة، من الإيداع إلى الرد.',
  'mar.formTitle': 'ملف الصفقة',
  'mar.formNote': 'تتلقى الورشات المخاطَبة الملف كما هو، وترد من مساحتها.',
  'mar.acheteur': 'المشتري العمومي',
  'mar.acheteurPh': 'بلدية وهران · مديرية الوسائل العامة',
  'mar.lot': 'الحصة / الحجم',
  'mar.lotPh': 'حصة واحدة — ١٢ ألف كتالوغ A4',
  'mar.limit': 'أجل الإيداع',
  'mar.limitPh': '٢٤ نوفمبر، ١٢ ظهرًا',
  'mar.montant': 'المبلغ التقديري',
  'mar.montantPh': '٢٫٤ مليون دج',
  'mar.msg': 'موضوع الصفقة ومرجع الإعلان والوثائق',
  'mar.msgPh': 'إعلان رقم ١٢/٢٠٢٦ — توريد ١٢ ألف كتالوغ A4 رباعي الألوان. دفتر الشروط: ١٤ صفحة، جدول الأسعار في الملحق، الوثائق الإدارية مرفقة.',
  'mar.send': 'أودع ملف الصفقة',
  'mar.picked': 'الورشات المخاطَبة',
  'mar.asideTitle': 'ما يجب أن يتضمنه الملف',
  'mar.aside1': 'دفتر الشروط، مع عدد صفحاته وملاحقه.',
  'mar.aside2': 'جدول الأسعار، حصةً حصة إذا كانت الصفقة مقسّمة.',
  'mar.aside3': 'الوثائق الإدارية التي يطلبها المشتري.',
  'mar.aside4': 'مرجع الإعلان، لتستشهد الإجابة بالصفقة الصحيحة.',
  'mar.howTitle': 'بعد الإيداع',
  'mar.how1': 'يحصل الملف على مرجعه في لحظة الإرسال.',
  'mar.how2': 'تقرأه كل ورشة مخاطَبة في مساحتها وترد بعرض سعر.',
  'mar.how3': 'يُتابع الملف بمرجعه، مع مبلغه ومساره.',
  'mar.trust': 'يذهب الملف مباشرة إلى الورشات، دون وسيط أو عمولة.',
  'mar.linkRun': 'أودع بدلًا من ذلك طبعة كبيرة أو مناولة',
  'mar.linkRunHint': 'افتح شبّاك الطبعة الكبيرة والمناولة.',
  'mar.linkTrack': 'تتبّع ملفًا',
  'mar.seeDirectory': 'تصفّح الدليل',

  'acct.b2b.marcheBadge': 'صفقة عمومية',
  'acct.b2b.marcheBadgeHint':
    'أُودع من صفحة الصفقات العمومية: يُقرأ الملف بمفرداته — دفتر الشروط، الجدول، أجل الإيداع.',

  /* --- وثائق الملف --- */
  'mar.piecesTitle': 'وثائق الملف',
  'mar.piecesOptional': 'اختياري',
  'mar.pieceCdc': 'دفتر الشروط',
  'mar.pieceBordereau': 'جدول الأسعار',
  'mar.pieceHint': 'ملف PDF، {size} على الأكثر',
  'mar.pieceAdd': 'إرفاق',
  'mar.pieceRemove': 'إزالة',
  'mar.pieceErrType': 'لا يُرفَق إلا ملف PDF: أعد اختيار الملف بالامتداد الصحيح.',
  'mar.pieceErrSize': 'هذا الملف يتجاوز الحجم المقبول: خفّفه قبل إرفاقه.',
  'mar.pieceErrSend': 'تعذّر إيداع الوثيقة. تحقّق من الاتصال ثم أعد المحاولة.',
  'mar.piecesNote': 'يُودَع الملفان في فضاء خاص: لا تفتحهما إلا الورشة المخاطَبة، برابط موقّع.',
  'mar.okPieces': 'وثائق مرفقة بالملف: {n}',

  /* --- صندوق الورشة --- */
  'acct.b2b.filterMarche': 'الصفقات العمومية',
  'acct.b2b.filterMarcheHint':
    'لا تُعرَض إلا الملفات المودعة من صفحة الصفقات العمومية، إلى جانب الطلبات المنتظرة.',
  'acct.b2b.emptyMarche': 'لا توجد أي صفقة عمومية في هذا الصندوق حاليًا.',
  'acct.b2b.piecesLabel': 'وثائق الملف',
  'acct.b2b.pieceCdc': 'دفتر الشروط (PDF)',
  'acct.b2b.pieceBordereau': 'جدول الأسعار (PDF)',
  'acct.b2b.pieceOpenHint': 'افتح ملف PDF — الرابط صالح لساعة واحدة فقط',

  /* --- الملفات المصدَّرة --- */
  'acct.b2b.csvNature': 'الطبيعة',
  'acct.b2b.natureMarche': 'صفقة عمومية',
  'acct.b2b.natureTirage': 'طبعة كبيرة',
  'acct.b2b.xlsxSynthMarch': 'منها صفقات عمومية',
};

const en: Dict = {
  'mar.stamp': 'Public tender',
  'mar.title': 'A tender is filed<br><span class="accent">like a dossier</span>.',
  'mar.lede': 'Public buyer, subject, lot, submission deadline: the dossier is written once, goes to the workshops you pick, and each one reads it with its paperwork.',
  'mar.back': 'The two counters',
  'mar.backHint': 'Back to the page presenting the two doorways of the network.',
  'mar.piecesLabel': 'The documents in the dossier',
  'mar.piece1': 'Specifications',
  'mar.piece2': 'Price schedule',
  'mar.piece3': 'Administrative documents',
  'mar.piece4': 'Tender reference',
  'mar.note': 'The dossier reference starts with B2B-: it follows a tender the way it follows a print run, from filing to reply.',
  'mar.formTitle': 'The tender dossier',
  'mar.formNote': 'The workshops you approach receive the dossier as it stands and answer from their own space.',
  'mar.acheteur': 'Public buyer',
  'mar.acheteurPh': 'City of Oran · general services',
  'mar.lot': 'Lot / volume',
  'mar.lotPh': 'Single lot — 12,000 A4 catalogues',
  'mar.limit': 'Submission deadline',
  'mar.limitPh': '24 November, 12 p.m.',
  'mar.montant': 'Estimated amount',
  'mar.montantPh': '2,400,000 DA',
  'mar.msg': 'Subject, tender reference and documents',
  'mar.msgPh': 'Tender 12/2026 — supply of 12,000 four-colour A4 catalogues. Specifications: 14 pages, price schedule attached, administrative documents enclosed.',
  'mar.send': 'File the tender dossier',
  'mar.picked': 'Workshops approached',
  'mar.asideTitle': 'What the dossier must contain',
  'mar.aside1': 'The specifications, with their page count and annexes.',
  'mar.aside2': 'The price schedule, lot by lot when the tender is split.',
  'mar.aside3': 'The administrative documents the buyer asks for.',
  'mar.aside4': 'The tender reference, so the reply cites the right one.',
  'mar.howTitle': 'After filing',
  'mar.how1': 'The dossier receives its reference the moment it is sent.',
  'mar.how2': 'Each workshop approached reads it in its space and answers with a quote.',
  'mar.how3': 'The dossier is followed by its reference, with its amount and journey.',
  'mar.trust': 'The dossier goes straight to the workshops, with no middleman and no commission.',
  'mar.linkRun': 'File a large run or a subcontracting request instead',
  'mar.linkRunHint': 'Open the large-run and subcontracting counter.',
  'mar.linkTrack': 'Track a dossier',
  'mar.seeDirectory': 'Browse the directory',

  'acct.b2b.marcheBadge': 'Public tender',
  'acct.b2b.marcheBadgeHint':
    'Filed from the Public tenders page: the dossier is read in its own vocabulary — specifications, price schedule, submission deadline.',

  /* --- The two documents of the dossier --- */
  'mar.piecesTitle': 'The documents in the dossier',
  'mar.piecesOptional': 'optional',
  'mar.pieceCdc': 'Specifications',
  'mar.pieceBordereau': 'Price schedule',
  'mar.pieceHint': 'PDF, {size} at most',
  'mar.pieceAdd': 'Attach',
  'mar.pieceRemove': 'Remove',
  'mar.pieceErrType': 'Only a PDF can be attached — pick the file again with the right extension.',
  'mar.pieceErrSize': 'This PDF is over the accepted size — lighten it before attaching.',
  'mar.pieceErrSend': 'The document could not be deposited. Check your connection, then try again.',
  'mar.piecesNote':
    'Both PDFs go to a private space: only the workshop you approach opens them, through a signed link.',
  'mar.okPieces': 'Documents attached to the dossier: {n}',

  /* --- The workshop inbox --- */
  'acct.b2b.filterMarche': 'Public tenders',
  'acct.b2b.filterMarcheHint':
    'Show only the dossiers filed from the Public tenders page, next to the waiting requests.',
  'acct.b2b.emptyMarche': 'No public tender in this inbox yet.',
  'acct.b2b.piecesLabel': 'Documents in the dossier',
  'acct.b2b.pieceCdc': 'Specifications (PDF)',
  'acct.b2b.pieceBordereau': 'Price schedule (PDF)',
  'acct.b2b.pieceOpenHint': 'Open the PDF — the link only lasts an hour',

  /* --- The exports --- */
  'acct.b2b.csvNature': 'Nature',
  'acct.b2b.natureMarche': 'Public tender',
  'acct.b2b.natureTirage': 'Large run',
  'acct.b2b.xlsxSynthMarch': 'Of which public tenders',
};

export const marcheDict: Record<'fr' | 'ar' | 'en', Dict> = { fr, ar, en };