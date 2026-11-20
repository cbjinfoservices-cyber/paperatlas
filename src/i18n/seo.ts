import type { Lang } from './dict';

export type SeoPage = 'home' | 'annuaire' | 'annonces' | 'emplois' | 'entreprise' | 'auteur' | 'deposer' | 'b2b' | 'marche' | 'guichets' | 'compte' | 'offres' | 'suivi' | 'legal' | 'privacy' | 'sitemap' | 'world';

type Entry = {
  title: string;
  description: string;
  keywords: string;
};

/**
 * Per-language title / description / keywords for every public page.
 * Kept out of the interface dictionary on purpose: these strings are written
 * for search results, not for the screen. The board began in Algeria and now
 * serves the whole Arab world, so every entry names the reach as well as the
 * trades — a workshop in Cairo or Riyadh has to recognise itself in them.
 */
export const seoMeta: Record<SeoPage, Record<Lang, Entry>> = {
  world: {
    fr: {
      title: 'Arabe World : le réseau et ses trois langues | PaperAtlas',
      description: 'PaperAtlas et Arabe World : une maison, deux noms. Pourquoi le site des métiers du livre s’écrit en arabe, en français et en anglais, et ce que le réseau réunit dans 22 pays arabes.',
      keywords: 'Arabe World, PaperAtlas réseau, trois langues, monde arabe, imprimerie édition',
    },
    ar: {
      title: 'العالم العربي: الشبكة ولغاتها الثلاث | PaperAtlas',
      description: 'PaperAtlas والعالم العربي: بيت واحد واسمان. لماذا يُكتب موقع مهن الكتاب بالعربية والفرنسية والإنجليزية، وما تجمعه الشبكة في ٢٢ دولة عربية.',
      keywords: 'العالم العربي, شبكة PaperAtlas, ثلاث لغات, مطابع, نشر',
    },
    en: {
      title: 'Arabe World: the network and its three languages | PaperAtlas',
      description: 'PaperAtlas and Arabe World: one house, two names. Why the book trades site is written in Arabic, French and English, and what the network gathers across 22 Arab countries.',
      keywords: 'Arabe World, PaperAtlas network, three languages, Arab world, printing publishing',
    },
  },
  sitemap: {
    fr: {
      title: 'Plan du site : pages de type et de pays | PaperAtlas',
      description: 'Toutes les pages de type d’établissement et leurs pages par pays, réunies sur une seule adresse : un lien direct vers chaque page de l’annuaire PaperAtlas, des imprimeries aux bibliothèques.',
      keywords: 'plan du site PaperAtlas, imprimeries par pays, éditeurs par pays, bibliothèques, écrivains',
    },
    ar: {
      title: 'خريطة الموقع: صفحات الأنواع والبلدان | PaperAtlas',
      description: 'كل صفحات أنواع المؤسسات وصفحاتها حسب البلد مجتمعة في عنوان واحد: رابط مباشر إلى كل صفحة في دليل PaperAtlas، من المطابع إلى المكتبات.',
      keywords: 'خريطة موقع PaperAtlas, مطابع حسب البلد, ناشرون, مكتبات, كتّاب',
    },
    en: {
      title: 'Sitemap: type and country pages | PaperAtlas',
      description: 'Every business type page and its country pages, gathered on a single address: a direct link to each page of the PaperAtlas directory, from printers to libraries.',
      keywords: 'PaperAtlas sitemap, printers by country, publishers, libraries, writers',
    },
  },
  legal: {
    fr: {
      title: 'Mentions légales | PaperAtlas',
      description: 'Qui édite PaperAtlas, où le site et les données sont hébergés, à qui appartiennent les contenus publiés par les membres, et comment joindre l’éditeur.',
      keywords: 'mentions légales PaperAtlas, éditeur du site, hébergement, propriété intellectuelle',
    },
    ar: {
      title: 'المعلومات القانونية | PaperAtlas',
      description: 'من ينشر PaperAtlas، وأين يُستضاف الموقع والبيانات، ولمن تعود المحتويات المنشورة من الأعضاء، وكيف يُبلغ الناشر.',
      keywords: 'المعلومات القانونية, ناشر الموقع, الاستضافة, الملكية الفكرية',
    },
    en: {
      title: 'Legal notice | PaperAtlas',
      description: 'Who publishes PaperAtlas, where the site and the data are hosted, who owns the content posted by members, and how to reach the publisher.',
      keywords: 'PaperAtlas legal notice, site publisher, hosting, intellectual property',
    },
  },
  privacy: {
    fr: {
      title: 'Politique de confidentialité | PaperAtlas',
      description: 'Les données que PaperAtlas conserve, pourquoi et pour combien de temps, qui les reçoit, et comment exercer vos droits d’accès, de rectification ou d’effacement.',
      keywords: 'confidentialité PaperAtlas, données personnelles, droits, cookies, conservation',
    },
    ar: {
      title: 'سياسة الخصوصية | PaperAtlas',
      description: 'البيانات التي يحفظها PaperAtlas، ولماذا ولكم من المدة، ومن يتلقاها، وكيف تمارس حقوق الوصول والتصحيح والمحو.',
      keywords: 'خصوصية PaperAtlas, بيانات شخصية, حقوق, كوكيز, حفظ',
    },
    en: {
      title: 'Privacy policy | PaperAtlas',
      description: 'The data PaperAtlas keeps, why and for how long, who receives it, and how to exercise your rights of access, correction or erasure.',
      keywords: 'PaperAtlas privacy, personal data, rights, cookies, retention',
    },
  },
  suivi: {
    fr: {
      title: 'Suivi devis B2B : référence et parcours | PaperAtlas',
      description: 'Saisissez la référence reçue par e-mail — DEV- pour un devis d’abonnement, B2B- pour une demande aux ateliers — et lisez l’état du devis, son montant et son parcours.',
      keywords: 'suivi devis B2B, référence dossier, état demande impression, PaperAtlas',
    },
    ar: {
      title: 'تتبع عروض B2B: المرجع والمسار | PaperAtlas',
      description: 'أدخل المرجع الذي وصلك بالبريد — DEV- لعرض سعر الاشتراك، B2B- للطلب المرسل إلى الورشات — واقرأ حالة العرض ومبلغه ومساره.',
      keywords: 'تتبع عروض B2B, مرجع العرض, حالة الطلب, PaperAtlas',
    },
    en: {
      title: 'B2B quote tracking: reference and journey | PaperAtlas',
      description: 'Enter the reference you received by email — DEV- for a subscription quote, B2B- for a request to workshops — and read the state of the quote, its amount and its journey.',
      keywords: 'B2B quote tracking, file reference, print request status, PaperAtlas',
    },
  },
  home: {
    fr: {
      title: 'PaperAtlas | Imprimerie et édition dans le monde arabe',
      description: 'PaperAtlas réunit les imprimeries, éditeurs, façonniers et libraires des 22 pays arabes : annuaire, demandes de devis, sous-traitance et annonces.',
      keywords: 'imprimerie monde arabe, éditeur, sous-traitance, devis impression, annuaire graphique',
    },
    ar: {
      title: 'PaperAtlas | الطباعة والنشر في العالم العربي',
      description: 'PaperAtlas يجمع المطابع ودور النشر ووحدات التجهيز والمكتبات في ٢٢ دولة عربية: دليل، طلبات عروض، مناولة وإعلانات.',
      keywords: 'مطابع العالم العربي, نشر, مناولة, عرض سعر, دليل الطباعة',
    },
    en: {
      title: 'PaperAtlas | Printing & publishing in the Arab world',
      description: 'PaperAtlas brings together printers, publishers, finishers and bookshops across the 22 Arab countries: directory, quote requests, subcontracting and listings.',
      keywords: 'printing Arab world, publisher, subcontracting, print quote, graphic directory',
    },
  },
  annuaire: {
    fr: {
      title: 'Annuaire des imprimeurs du monde arabe | PaperAtlas',
      description: 'Trouvez un imprimeur, un éditeur ou un façonnier dans 22 pays arabes : filtres par métier, par pays et par région, fiches vérifiées, comparaison et export CSV.',
      keywords: 'annuaire imprimeurs monde arabe, façonniers, éditeurs, carte, pays arabes',
    },
    ar: {
      title: 'دليل المطابع ودور النشر في العالم العربي | PaperAtlas',
      description: 'اعثر على مطبعة أو دار نشر أو وحدة تجهيز في ٢٢ دولة عربية: تصفية حسب المهنة والبلد والمنطقة، بطاقات متحققة، مقارنة وتصدير CSV.',
      keywords: 'دليل المطابع, العالم العربي, ناشرون, وحدات تجهيز, خريطة',
    },
    en: {
      title: 'Directory of printers in the Arab world | PaperAtlas',
      description: 'Find a printer, publisher or finishing house across 22 Arab countries: filters by trade, country and region, verified profiles, comparison and CSV export.',
      keywords: 'printers Arab world directory, finishing, publishers, map, Arab countries',
    },
  },
  annonces: {
    fr: {
      title: 'Petites annonces des métiers du livre | PaperAtlas',
      description: 'Machines d’impression, massicots, papier, façonnage : les petites annonces des ateliers d’Algérie et du monde arabe, avec prix, pays et contact direct.',
      keywords: 'annonces imprimerie, machine offset occasion, massicot, papier monde arabe',
    },
    ar: {
      title: 'إعلانات مهن الكتاب والطباعة | PaperAtlas',
      description: 'آلات طباعة، مقصّات، ورق وتجهيز: إعلانات ورشات الجزائر والعالم العربي مع السعر والبلد والاتصال المباشر.',
      keywords: 'إعلانات مطابع, آلة أوفست, ورق, العالم العربي',
    },
    en: {
      title: 'Print & publishing classifieds | PaperAtlas',
      description: 'Printing machines, guillotines, paper, finishing: classifieds from workshops in Algeria and across the Arab world, with price, country and direct contact.',
      keywords: 'print classifieds, used offset press, guillotine, paper, Arab world',
    },
  },
  emplois: {
    fr: {
      title: 'Offres d’emploi imprimerie & édition | PaperAtlas',
      description: 'Offres d’emploi dans l’imprimerie, l’édition et la librairie dans 22 pays arabes : conducteurs offset, relieurs, maquettistes, chefs de fabrication.',
      keywords: 'emploi imprimerie monde arabe, conducteur offset, relieur, maquettiste',
    },
    ar: {
      title: 'وظائف الطباعة والنشر في العالم العربي | PaperAtlas',
      description: 'وظائف في الطباعة والنشر والمكتبات في ٢٢ دولة عربية: مشغّلو أوفست، مجلّدون، مصممون، ورؤساء إنتاج.',
      keywords: 'وظائف مطابع, العالم العربي, مشغل أوفست, تصميم طباعي',
    },
    en: {
      title: 'Printing & publishing jobs in the Arab world | PaperAtlas',
      description: 'Jobs in printing, publishing and bookselling across 22 Arab countries: offset operators, binders, layout artists and production managers.',
      keywords: 'printing jobs Arab world, offset operator, binder, layout artist',
    },
  },
  deposer: {
    fr: {
      title: 'Déposer une annonce ou une offre d’emploi | PaperAtlas',
      description: 'Ateliers, éditeurs et libraires du monde arabe : déposez gratuitement votre annonce ou votre offre d’emploi. Chaque dépôt est relu avant mise en ligne.',
      keywords: 'déposer annonce imprimerie, publier offre emploi, petite annonce monde arabe',
    },
    ar: {
      title: 'أودع إعلانًا أو عرض عمل | PaperAtlas',
      description: 'ورشات ودور نشر ومكتبات في العالم العربي: أودع إعلانك أو عرض العمل مجانًا. تُراجع كل إيداعة قبل النشر على PaperAtlas.',
      keywords: 'إيداع إعلان مطبعة, نشر عرض عمل, إعلانات العالم العربي',
    },
    en: {
      title: 'Post a listing or a job offer | PaperAtlas',
      description: 'Workshops, publishers and bookshops across the Arab world: post your listing or job offer for free. Every submission is reviewed before it goes live.',
      keywords: 'post print listing, publish job offer, classifieds Arab world',
    },
  },
  b2b: {
    fr: {
      title: 'Demande B2B : devis grand tirage et sous-traitance | PaperAtlas',
      description: 'Décrivez un besoin professionnel une seule fois — grand tirage, façonnage, marché public — et adressez-le aux ateliers d’imprimerie de votre choix, dans 22 pays arabes.',
      keywords: 'demande B2B impression, devis grand tirage, sous-traitance imprimerie, appel d’offres monde arabe',
    },
    ar: {
      title: 'طلب B2B: عروض الطبعة الكبيرة والمناولة | PaperAtlas',
      description: 'اشرح حاجة مهنية مرة واحدة — طبعة كبيرة، تجهيز، صفقة عمومية — وأرسلها إلى المطابع التي تختارها في ٢٢ دولة عربية.',
      keywords: 'طلب B2B طباعة, عرض سعر طبعة كبيرة, مناولة مطابع, مناقصة العالم العربي',
    },
    en: {
      title: 'B2B request: large-run and subcontracting quotes | PaperAtlas',
      description: 'Describe a trade need once — large run, finishing, public tender — and send it to the print workshops of your choice across 22 Arab countries.',
      keywords: 'B2B print request, large run quote, print subcontracting, Arab world tender',
    },
  },
  guichets: {
    fr: {
      title: 'Demandes : tirage, marchés publics | PaperAtlas',
      description: 'Grand tirage ou sous-traitance, marchés publics : deux guichets, un seul besoin écrit une fois. Chaque envoi laisse une référence à suivre.',
      keywords: 'demande grand tirage, sous-traitance imprimerie, marchés publics, PaperAtlas',
    },
    ar: {
      title: 'الطلبات: طبعة كبيرة، صفقات عمومية | PaperAtlas',
      description: 'طبعة كبيرة أو مناولة، صفقات عمومية: شبّاكان وحاجة واحدة تُكتب مرة واحدة. كل إيداع يترك مرجعًا للمتابعة.',
      keywords: 'طلب طبعة كبيرة, مناولة, صفقات عمومية, PaperAtlas',
    },
    en: {
      title: 'Requests: large runs, tenders | PaperAtlas',
      description: 'Large run or subcontracting, public tenders: two counters for one need written once. Every submission leaves a reference to follow.',
      keywords: 'large run request, subcontracting, public tenders, PaperAtlas',
    },
  },
  marche: {
    fr: {
      title: 'Marchés publics : déposer un appel d’offres | PaperAtlas',
      description: 'Acheteur public, cahier des charges, bordereau des prix, date limite de remise : déposez un dossier de marché public une seule fois et adressez-le aux ateliers d’impression que vous retenez.',
      keywords: 'marché public impression, appel d’offres imprimerie, cahier des charges, bordereau des prix',
    },
    ar: {
      title: 'الصفقات العمومية: إيداع مناقصة | PaperAtlas',
      description: 'المشتري العمومي، دفتر الشروط، جدول الأسعار، أجل الإيداع: أودع ملف الصفقة العمومية مرة واحدة وأرسله إلى المطابع التي تختارها.',
      keywords: 'صفقة عمومية طباعة, مناقصة مطابع, دفتر شروط, جدول أسعار',
    },
    en: {
      title: 'Public tenders: file a dossier | PaperAtlas',
      description: 'Public buyer, specifications, price schedule, submission deadline: file a public tender dossier once and send it to the print workshops you choose.',
      keywords: 'public tender printing, print call for bids, specifications, price schedule',
    },
  },
  compte: {
    fr: {
      title: 'Compte PaperAtlas | Inscription et connexion',
      description: 'Ouvrez un compte PaperAtlas ou connectez-vous : vos sélections d’ateliers, vos dossiers de comparaison et vos demandes de devis restent réunis au même endroit.',
      keywords: 'compte PaperAtlas, inscription imprimeur, connexion, espace professionnel',
    },
    ar: {
      title: 'حساب PaperAtlas | التسجيل والدخول',
      description: 'افتح حسابًا في PaperAtlas أو سجّل الدخول: اختياراتك للورشات وملفات المقارنة وطلبات عروض الأسعار في مكان واحد.',
      keywords: 'حساب PaperAtlas, تسجيل مطبعة, دخول, فضاء مهني',
    },
    en: {
      title: 'PaperAtlas account | Sign up and sign in',
      description: 'Open a PaperAtlas account or sign in: your workshop selections, comparison dossiers and quote requests all stay in one place.',
      keywords: 'PaperAtlas account, printer sign up, sign in, pro area',
    },
  },
  entreprise: {
    fr: {
      title: 'Fiche établissement — annuaire PaperAtlas',
      description: 'Coordonnées, catalogue, horaires et certifications d’une imprimerie, maison d’édition ou unité de façonnage référencée par PaperAtlas, pays et région compris.',
      keywords: 'fiche imprimeur, catalogue, certifications, monde arabe',
    },
    ar: {
      title: 'بطاقة مؤسسة — دليل PaperAtlas',
      description: 'بيانات الاتصال والكتالوغ وأوقات العمل والشهادات لمطبعة أو دار نشر أو وحدة تجهيز مدرجة في PaperAtlas، مع البلد والمنطقة.',
      keywords: 'بطاقة مطبعة, كتالوغ, شهادات, العالم العربي',
    },
    en: {
      title: 'Business profile — PaperAtlas directory',
      description: 'Contact details, catalogue, opening hours and certifications of a printer, publishing house or finishing unit listed on PaperAtlas, country and region included.',
      keywords: 'printer profile, catalogue, certifications, Arab world',
    },
  },
  auteur: {
    fr: {
      title: 'Fiche auteur — PaperAtlas',
      description: 'Biographie, ouvrages publiés et disponibilités d’un auteur du monde arabe, avec contact direct et propositions de collaboration.',
      keywords: 'auteur monde arabe, ouvrages, biographie, collaboration',
    },
    ar: {
      title: 'بطاقة مؤلف — PaperAtlas',
      description: 'سيرة وأعمال منشورة وتوفّر مؤلف من العالم العربي، مع اتصال مباشر واقتراحات تعاون.',
      keywords: 'مؤلف عربي, أعمال, سيرة, تعاون',
    },
    en: {
      title: 'Author profile — PaperAtlas',
      description: 'Biography, published works and availability of an author from the Arab world, with direct contact and collaboration proposals.',
      keywords: 'Arab world author, published works, biography, collaboration',
    },
  },
  offres: {
    fr: {
      title: 'Formules & tarifs : Annuaire, Premium | PaperAtlas',
      description: 'Trois formules comparées : annuaire gratuit, Premium à 3 500 DZD par mois lu dans la monnaie du pays, Institutions sur devis. Prix, inclusions et FAQ.',
      keywords: 'formules et tarifs PaperAtlas, tarif annuaire imprimerie, abonnement Premium, devis institutions',
    },
    ar: {
      title: 'الصيغ والأسعار: الدليل وبريميوم | PaperAtlas',
      description: 'ثلاث صيغ مقارنة: دليل مجاني، بريميوم بـ٣ ٥٠٠ دج شهريًا بعملة بلدك، والهيئات حسب الطلب. الأسعار والمشمولات وأسئلة الأسعار.',
      keywords: 'أسعار دليل المطابع, الصيغ والأسعار, اشتراك بريميوم, PaperAtlas',
    },
    en: {
      title: 'Plans & pricing: directory and Premium | PaperAtlas',
      description: 'Three plans side by side: free directory, Premium at 3 500 DZD per month read in your country’s currency, Institutions on quote. Prices, inclusions and FAQ.',
      keywords: 'printer directory pricing, Premium subscription, institutions quote, PaperAtlas',
    },
  },
};