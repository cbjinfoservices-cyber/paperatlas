import type { Dict } from './dict';

/** Les deux pages légales du site : les mentions légales et la politique de
 *  confidentialité. Le contenu est écrit pour la publication, sans champ
 *  laissé entre crochets : seul ce que l'éditeur a déclaré y figure. */

const fr: Dict = {
  'lg.stamp': 'Informations légales',
  'lg.updated': 'Mise à jour le 20 novembre 2026',
  'lg.m.title': 'Mentions légales',
  'lg.m.lede':
    'Qui édite PaperAtlas, où le site et les données sont hébergés, à qui appartiennent les contenus publiés et comment nous écrire.',
  'lg.m.note':
    'Pour toute question sur ces informations, écrivez à contact@paperatlas.net.',
  'lg.m.s1t': 'Éditeur du site',
  'lg.m.s1b':
    'PaperAtlas est un service d’annuaire et de mise en relation entre les professionnels du livre, de l’impression et de la communication visuelle. Il est édité par CBJ-INFOSERVICES, EURL. Contact : contact@paperatlas.net.',
  'lg.m.s2t': 'Hébergement',
  'lg.m.s2b':
    'Le site est hébergé par IONOS SE, Elgendorfer Str. 57, 56410 Montabaur (Allemagne). La base de données, les fichiers déposés et les traitements serveur sont hébergés chez Supabase, région Irlande (UE). Les e-mails de confirmation et de notification sont remis par Brevo.',
  'lg.m.s3t': 'Objet du site et limites',
  'lg.m.s3b':
    'PaperAtlas met en relation les structures et les ateliers, et suit les demandes comme les devis. La plateforme n’est pas partie aux marchés conclus entre ses membres : elle ne prélève aucune commission sur une transaction, et un montant affiché reste une estimation jusqu’à confirmation par un référent.',
  'lg.m.s4t': 'Propriété intellectuelle',
  'lg.m.s4b':
    'La marque PaperAtlas, la charte graphique, les textes et la structure du site appartiennent à leur éditeur. Toute reproduction ou réutilisation, totale ou partielle, hors usage personnel, demande un accord écrit. Les contenus déposés par les membres restent leur propriété : ils accordent seulement à la plateforme le droit de les afficher et de les diffuser dans le cadre du service.',
  'lg.m.s5t': 'Contenus publiés par les membres',
  'lg.m.s5b':
    'Chaque fiche, annonce, offre d’emploi, demande ou message engage la seule responsabilité de la personne qui le dépose. Les dépôts sont relus avant publication, sans que cette relecture garantisse l’exactitude d’un prix, d’un délai ou d’une disponibilité. Un contenu manifestement illicite peut être retiré sur simple signalement à contact@paperatlas.net.',
  'lg.m.s6t': 'Responsabilité et liens externes',
  'lg.m.s6b':
    'Les informations publiées sur le site sont données de bonne foi et peuvent évoluer sans préavis. L’éditeur ne garantit ni l’exhaustivité des fiches, ni la continuité du service, et ne saurait être tenu responsable d’un dommage indirect lié à l’usage du site. Les liens vers des sites tiers n’engagent pas sa responsabilité éditoriale.',
  'lg.m.s7t': 'Droit applicable et contact',
  'lg.m.s7b':
    'Le site est soumis au droit algérien. En cas de difficulté, une solution amiable est recherchée avant toute action ; à défaut, les juridictions compétentes sont celles du ressort du siège de l’éditeur. Pour toute question relative à ces mentions : contact@paperatlas.net.',

  'lg.c.title': 'Politique de confidentialité',
  'lg.c.lede':
    'Quelles données PaperAtlas conserve, pourquoi, pendant combien de temps, qui les reçoit — et comment les faire corriger ou effacer.',
  'lg.c.note':
    'Cette politique décrit ce que le site fait réellement : elle suit les tables de la base et les services effectivement branchés. À relire si un prestataire change.',
  'lg.c.s1t': 'Responsable du traitement',
  'lg.c.s1b':
    'Le responsable du traitement est l’éditeur de PaperAtlas, CBJ-INFOSERVICES, joignable à contact@paperatlas.net. Les données sont hébergées dans l’espace Supabase du projet, et les e-mails de confirmation partent par Brevo.',
  'lg.c.s2t': 'Données collectées',
  'lg.c.s2b':
    'Compte : nom, adresse e-mail, mot de passe (stocké sous forme chiffrée, jamais en clair), établissement, métier, pays et wilaya, téléphone facultatif. Dépôts : fiches, annonces et offres d’emploi. Dossiers : demandes B2B, devis d’abonnement, candidatures et messages échangés. Formulaires : nom, e-mail, sujet et message. Technique : adresse IP et journaux d’accès, tenus pour la sécurité du service.',
  'lg.c.s3t': 'Pourquoi et sur quelle base',
  'lg.c.s3b':
    'Exécuter le service demandé — compte, dépôt, devis, messagerie — au titre de l’exécution du contrat. Répondre à un message de contact au titre de l’intérêt légitime. Envoyer les confirmations et rappels liés à un dossier, au titre du contrat. Assurer la sécurité et prévenir les abus, au titre de l’intérêt légitime. Conserver les pièces comptables, au titre d’une obligation légale. Aucune donnée n’est vendue, et aucune publicité tierce n’est affichée.',
  'lg.c.s4t': 'Qui reçoit les données',
  'lg.c.s4b':
    'Seule l’équipe de PaperAtlas accède aux données, dans la limite de ce qu’exige le service. Supabase héberge la base, les fichiers et les fonctions serveur ; Brevo remet les e-mails. Ces prestataires agissent sur instruction et n’utilisent pas les données pour leur propre compte. Un atelier destinataire reçoit uniquement le contenu de la demande qui lui est adressée.',
  'lg.c.s5t': 'Durées de conservation',
  'lg.c.s5b':
    'Compte actif : tant qu’il existe, puis douze mois après la dernière connexion. Demandes, devis et candidatures : trois ans après le dernier échange. Journaux techniques : douze mois. Messages de contact : trois ans. Une demande d’effacement est traitée dans le mois ; les pièces comptables déjà émises suivent leur durée légale.',
  'lg.c.s6t': 'Vos droits',
  'lg.c.s6b':
    'Vous pouvez demander l’accès à vos données, leur rectification, leur effacement, la limitation d’un traitement, ou vous y opposer. Écrivez à contact@paperatlas.net depuis l’adresse du compte : la réponse arrive sous trente jours. La suppression d’un compte se demande aussi depuis l’espace compte.',
  'lg.c.s7t': 'Cookies et mémoire de l’appareil',
  'lg.c.s7b':
    'Aucun cookie publicitaire ni traceur tiers n’est posé. Le site retient sur votre appareil la langue choisie, le pays et la région lus, et l’état de quelques listes : ces valeurs restent dans le navigateur, ne sont pas transmises à des tiers et s’effacent avec les données du site. La session de connexion s’appuie sur le stockage sécurisé du navigateur, le temps de la visite.',
  'lg.c.s8t': 'Sécurité',
  'lg.c.s8b':
    'Les échanges sont chiffrés en transit. L’accès aux tables est borné par des règles ligne par ligne, les écritures sensibles passent par des fonctions serveur, et la console d’administration n’ouvre qu’à l’adresse du propriétaire. Les mots de passe ne sont jamais lisibles. En cas d’incident touchant vos données, vous êtes informé dans les meilleurs délais.',

  'lg.contactTitle': 'Une question sur vos données ?',
  'lg.contactText': 'Écrivez-nous : une réponse arrive sous trente jours ouvrés.',
  'lg.contactCta': 'Écrire à l’équipe',
  'lg.back': 'Retour à l’accueil',
  'lg.siblings': 'Voir aussi',

  'foot.legalMentions': 'Mentions légales',
  'foot.legalPrivacy': 'Confidentialité',
};

const ar: Dict = {
  'lg.stamp': 'معلومات قانونية',
  'lg.updated': 'حُدّثت في ٢٠ نوفمبر ٢٠٢٦',
  'lg.m.title': 'المعلومات القانونية',
  'lg.m.lede':
    'من ينشر PaperAtlas، وأين يُستضاف الموقع والبيانات، ولمن تعود المحتويات المنشورة، وكيف تكتب إلينا.',
  'lg.m.note':
    'لأي سؤال حول هذه المعلومات، اكتب إلى contact@paperatlas.net.',
  'lg.m.s1t': 'ناشر الموقع',
  'lg.m.s1b':
    'PaperAtlas خدمة دليل وربط بين مهنيي الكتاب والطباعة والاتصال البصري. ينشره CBJ-INFOSERVICES، شركة ذات مسؤولية محدودة بشريك وحيد (EURL). للاتصال: contact@paperatlas.net.',
  'lg.m.s2t': 'الاستضافة',
  'lg.m.s2b':
    'يُستضاف الموقع لدى IONOS SE، Elgendorfer Str. 57، 56410 Montabaur (ألمانيا). وتُستضاف قاعدة البيانات والملفات المودعة والمعالجة على الخادم لدى Supabase، في منطقة أيرلندا (الاتحاد الأوروبي). وتُسلَّم رسائل التأكيد والإشعار عبر Brevo.',
  'lg.m.s3t': 'موضوع الموقع وحدوده',
  'lg.m.s3b':
    'يربط PaperAtlas المؤسسات بالورشات، ويتابع الطلبات وعروض الأسعار. والمنصة ليست طرفًا في العقود المبرمة بين أعضائها: لا تأخذ أي عمولة على صفقة، والمبلغ المعروض يبقى تقديرًا حتى يؤكده مرافق.',
  'lg.m.s4t': 'الملكية الفكرية',
  'lg.m.s4b':
    'تعود علامة PaperAtlas والهوية البصرية والنصوص وبنية الموقع إلى ناشره. وكل استنساخ أو إعادة استخدام، كليًا أو جزئيًا، خارج الاستخدام الشخصي، يتطلب موافقة مكتوبة. وتبقى المحتويات التي يودعها الأعضاء ملكًا لهم: يمنحون المنصة فقط حق عرضها وبثها في إطار الخدمة.',
  'lg.m.s5t': 'المحتويات المنشورة من الأعضاء',
  'lg.m.s5b':
    'كل بطاقة أو إعلان أو عرض عمل أو طلب أو رسالة تلزم وحدها من أودعها. وتُراجع الإيداعات قبل النشر، دون أن يضمن هذا الرد دقة سعر أو أجل أو توفّر. ويمكن سحب محتوى مخالف للقانون بمجرد إبلاغ عنه إلى contact@paperatlas.net.',
  'lg.m.s6t': 'المسؤولية والروابط الخارجية',
  'lg.m.s6b':
    'تُنشر معلومات الموقع بحسن نية وقد تتغير دون إشعار. ولا يضمن الناشر شمول البطاقات ولا استمرار الخدمة، ولا يسأل عن ضرر غير مباشر ناتج عن استخدام الموقع. والروابط إلى مواقع الغير لا تلزمه بمسؤولية تحريرية.',
  'lg.m.s7t': 'القانون المطبق والاتصال',
  'lg.m.s7b':
    'يخضع الموقع للقانون الجزائري. وفي حال نشوء خلاف يُبحث عن حل ودّي قبل أي دعوى، وإلا فالمحاكم المختصة هي محاكم دائرة مقر الناشر. ولأي سؤال حول هذه المعلومات: contact@paperatlas.net.',

  'lg.c.title': 'سياسة الخصوصية',
  'lg.c.lede':
    'أي بيانات يحفظها PaperAtlas، ولماذا، ولكم من المدة، ومن يتلقاها — وكيف تُصحَّح أو تُمحى.',
  'lg.c.note':
    'تصف هذه السياسة ما يفعله الموقع فعلًا: تتبع جداول قاعدة البيانات والخدمات الموصولة حقًا. يُعاد قراءتها إذا تغيّر مزوّد.',
  'lg.c.s1t': 'المسؤول عن المعالجة',
  'lg.c.s1b':
    'المسؤول عن المعالجة هو ناشر PaperAtlas، CBJ-INFOSERVICES، ويُبلغ به على contact@paperatlas.net. تُستضاف البيانات في مساحة Supabase الخاصة بالمشروع، وتُرسل رسائل التأكيد عبر Brevo.',
  'lg.c.s2t': 'البيانات المجمّعة',
  'lg.c.s2b':
    'الحساب: الاسم والبريد وكلمة المرور (محفوظة مشفّرة، لا تُقرأ أبدًا) والمؤسسة والمهنة والبلد والولاية والهاتف اختياريًا. الإيداعات: البطاقات والإعلانات وعروض العمل. الملفات: طلبات B2B وعروض الاشتراك ومناطق الترشح والرسائل المتبادلة. الاستمارات: الاسم والبريد والموضوع والرسالة. التقنية: عنوان IP وسجلات الوصول، محفوظة لأمن الخدمة.',
  'lg.c.s3t': 'لماذا وعلى أي أساس',
  'lg.c.s3b':
    'تنفيذ الخدمة المطلوبة — حساب، إيداع، عرض سعر، رسائل — أساسه تنفيذ العقد. الرد على رسالة اتصال أساسه المصلحة المشروعة. إرسال التأكيدات والتذكيرات المتصلة بملف أساسه العقد. توفير الأمن ومنع التجاوزات أساسه المصلحة المشروعة. حفظ الوثائق المحاسبية أساسه واجب قانوني. لا تُباع أي بيانات ولا تُعرض أي إعلانات من الغير.',
  'lg.c.s4t': 'من يتلقى البيانات',
  'lg.c.s4b':
    'لا يصل إلى البيانات إلا فريق PaperAtlas، في حدود ما تتطلبه الخدمة. تُستضيف Supabase القاعدة والملفات والدوال، ويُسلّم Brevo الرسائل. يعمل هؤلاء المزوّدون بتعليمات ولا يستخدمون البيانات لحسابهم. ولا تتلقى الورشة المعنية إلا محتوى الطلب الموجّه إليها.',
  'lg.c.s5t': 'مدد الحفظ',
  'lg.c.s5b':
    'الحساب النشط: ما دام قائمًا، ثم اثنا عشر شهرًا بعد آخر دخول. الطلبات وعروض الأسعار والترشحات: ثلاث سنوات بعد آخر تبادل. السجلات التقنية: اثنا عشر شهرًا. رسائل الاتصال: ثلاث سنوات. يُعالج طلب المحو خلال شهر، وتبقى الوثائق المحاسبية الصادرة للمدة القانونية.',
  'lg.c.s6t': 'حقوقك',
  'lg.c.s6b':
    'يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو محوها أو تقييد معالجة أو الاعتراض عليها. اكتب إلى contact@paperatlas.net من بريد الحساب: يصل الرد خلال ثلاثين يومًا. ويمكن طلب حذف الحساب أيضًا من مساحة الحساب.',
  'lg.c.s7t': 'الكوكيز وذاكرة الجهاز',
  'lg.c.s7b':
    'لا تُوضع أي كوكيز إعلانية ولا أي متتبّع من الغير. يحفظ الموقع على جهازك اللغة المختارة والبلد والمنطقة المقروءين وحالة بعض القوائم: تبقى هذه القيم في المتصفح ولا تُنقل إلى الغير وتُمحى مع بيانات الموقع. وتستعمل جلسة الدخول تخزين المتصفح الآمن مدة الزيارة.',
  'lg.c.s8t': 'الأمن',
  'lg.c.s8b':
    'التبادلات مشفّرة أثناء النقل. والوصول إلى الجداول محدود بقواعد لكل سطر، والكتابات الحساسة تمر عبر دوال على الخادم، ولوحة التحكم لا تُفتح إلا بعنوان المالك. وكلمات المرور غير قابلة للقراءة. وفي حال حادث يمسّ بياناتك تُبلَّغ في أقرب وقت.',

  'lg.contactTitle': 'سؤال حول بياناتك؟',
  'lg.contactText': 'اكتب إلينا: يصل الرد خلال ثلاثين يوم عمل.',
  'lg.contactCta': 'اكتب إلى الفريق',
  'lg.back': 'العودة إلى الصفحة الأولى',
  'lg.siblings': 'اقرأ أيضًا',

  'foot.legalMentions': 'المعلومات القانونية',
  'foot.legalPrivacy': 'الخصوصية',
};

const en: Dict = {
  'lg.stamp': 'Legal information',
  'lg.updated': 'Updated on 20 November 2026',
  'lg.m.title': 'Legal notice',
  'lg.m.lede':
    'Who publishes PaperAtlas, where the site and the data are hosted, who owns the published content, and how to write to us.',
  'lg.m.note':
    'For any question about this information, write to contact@paperatlas.net.',
  'lg.m.s1t': 'Publisher of the site',
  'lg.m.s1b':
    'PaperAtlas is a directory and matchmaking service for professionals in books, printing and visual communication. It is published by CBJ-INFOSERVICES, an EURL (single-member limited company). Contact: contact@paperatlas.net.',
  'lg.m.s2t': 'Hosting',
  'lg.m.s2b':
    'The site is hosted by IONOS SE, Elgendorfer Str. 57, 56410 Montabaur (Germany). The database, the uploaded files and the server processing are hosted at Supabase, region Ireland (EU). Confirmation and notification emails are delivered by Brevo.',
  'lg.m.s3t': 'Purpose and limits',
  'lg.m.s3b':
    'PaperAtlas connects structures with workshops, and follows requests as well as quotes. The platform is not a party to the contracts made between its members: it takes no commission on a transaction, and an amount shown remains an estimate until a contact confirms it.',
  'lg.m.s4t': 'Intellectual property',
  'lg.m.s4b':
    'The PaperAtlas brand, the visual identity, the texts and the structure of the site belong to their publisher. Any reproduction or reuse, in whole or in part, beyond personal use, requires written consent. Content posted by members remains their property: they grant the platform only the right to display and distribute it within the service.',
  'lg.m.s5t': 'Content published by members',
  'lg.m.s5b':
    'Every profile, listing, job offer, request or message binds only the person who posts it. Submissions are reviewed before publication, without that review guaranteeing the accuracy of a price, a lead time or an availability. Manifestly unlawful content may be removed on simple report to contact@paperatlas.net.',
  'lg.m.s6t': 'Liability and external links',
  'lg.m.s6b':
    'The information published on the site is given in good faith and may change without notice. The publisher guarantees neither the completeness of the profiles nor the continuity of the service, and cannot be held liable for indirect damage related to the use of the site. Links to third-party sites do not engage its editorial liability.',
  'lg.m.s7t': 'Governing law and contact',
  'lg.m.s7b':
    'The site is governed by Algerian law. In case of difficulty, an amicable solution is sought before any action; failing that, the courts with jurisdiction over the publisher’s registered office have jurisdiction. For any question about this notice: contact@paperatlas.net.',

  'lg.c.title': 'Privacy policy',
  'lg.c.lede':
    'Which data PaperAtlas keeps, why, for how long, who receives it — and how to have it corrected or erased.',
  'lg.c.note':
    'This policy describes what the site actually does: it follows the database tables and the services really connected. Read it again if a provider changes.',
  'lg.c.s1t': 'Data controller',
  'lg.c.s1b':
    'The data controller is the publisher of PaperAtlas, CBJ-INFOSERVICES, reachable at contact@paperatlas.net. Data is hosted in the project’s Supabase space, and confirmation emails leave through Brevo.',
  'lg.c.s2t': 'Data we collect',
  'lg.c.s2b':
    'Account: name, e-mail address, password (stored encrypted, never in clear), organisation, trade, country and wilaya, optional phone. Submissions: profiles, listings and job offers. Files: B2B requests, subscription quotes, applications and exchanged messages. Forms: name, e-mail, subject and message. Technical: IP address and access logs, kept for the security of the service.',
  'lg.c.s3t': 'Why, and on which basis',
  'lg.c.s3b':
    'Perform the requested service — account, submission, quote, messaging — under the performance of the contract. Answer a contact message under legitimate interest. Send the confirmations and reminders attached to a file, under the contract. Keep the service secure and prevent abuse, under legitimate interest. Keep accounting documents, under a legal obligation. No data is sold, and no third-party advertising is displayed.',
  'lg.c.s4t': 'Who receives the data',
  'lg.c.s4b':
    'Only the PaperAtlas team accesses the data, within what the service requires. Supabase hosts the database, the files and the server functions; Brevo delivers the emails. These providers act on instruction and do not use the data for their own account. A recipient workshop receives only the content of the request addressed to it.',
  'lg.c.s5t': 'Retention periods',
  'lg.c.s5b':
    'Active account: for as long as it exists, then twelve months after the last sign-in. Requests, quotes and applications: three years after the last exchange. Technical logs: twelve months. Contact messages: three years. An erasure request is handled within one month; accounting documents already issued follow their legal retention period.',
  'lg.c.s6t': 'Your rights',
  'lg.c.s6b':
    'You may ask for access to your data, its rectification, its erasure, the restriction of a processing, or object to it. Write to contact@paperatlas.net from the account address: the answer arrives within thirty days. Deleting an account can also be requested from the account area.',
  'lg.c.s7t': 'Cookies and device memory',
  'lg.c.s7b':
    'No advertising cookie and no third-party tracker is set. The site keeps on your device the chosen language, the country and region read, and the state of a few lists: these values stay in the browser, are not passed to third parties and clear with the site data. The sign-in session uses the browser’s secure storage, for the length of the visit.',
  'lg.c.s8t': 'Security',
  'lg.c.s8b':
    'Traffic is encrypted in transit. Access to the tables is bounded by row-level rules, sensitive writes go through server functions, and the administration console only opens to the owner’s address. Passwords are never readable. If an incident affects your data, you are informed as soon as possible.',

  'lg.contactTitle': 'A question about your data?',
  'lg.contactText': 'Write to us: an answer arrives within thirty working days.',
  'lg.contactCta': 'Write to the team',
  'lg.back': 'Back to the home page',
  'lg.siblings': 'See also',

  'foot.legalMentions': 'Legal notice',
  'foot.legalPrivacy': 'Privacy',
};

export const legalDict: Record<'fr' | 'ar' | 'en', Dict> = { fr, ar, en };