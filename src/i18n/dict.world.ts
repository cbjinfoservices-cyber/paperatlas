import type { Dict } from './dict';

/**
 * La petite page « Arabe World ».
 *
 * Elle ne vend rien : elle dit d'où viennent les deux noms du réseau et
 * pourquoi le site se lit en trois langues. Les mots y sont donc des phrases,
 * pas des étiquettes — et l'arabe n'y est pas une traduction du français :
 * c'est le même propos, écrit pour être lu droit.
 */

const fr: Dict = {
  'world.stamp': 'La maison et ses deux noms',
  'world.title': 'PaperAtlas et<br><span class="accent">Arabe World</span>.',
  'world.lede': 'Une seule maison, deux noms qui se répondent : PaperAtlas pour le papier et les métiers, Arabe World pour le monde arabe qui les fait vivre. La barre les porte en haut, le pied de page les reprend en bas.',

  'world.nameTitle': 'Deux marques, un même atelier',
  'world.nameText': 'Le cachet dit le papier ; l’emblème aux étoiles dit l’étendue. Aucune des deux ne remplace l’autre : l’une nomme le métier, l’autre nomme le territoire où il travaille. C’est pourquoi elles voyagent ensemble, du premier écran jusqu’au dernier lien.',

  'world.b1t': 'Le cachet',
  'world.b1p': 'L’atelier, la presse, le papier : le geste du métier, celui qu’on reconnaît d’un coup d’œil.',
  'world.b2t': 'L’emblème',
  'world.b2p': 'Les étoiles géométriques et le globe : l’étendue du monde arabe, d’un bout à l’autre de la carte.',

  'world.langTitle': 'Pourquoi le site parle trois langues',
  'world.langText': 'Un livre se lit dans une langue, s’imprime dans une autre, et se commande parfois dans une troisième. Le site dit donc la même chose en trois, sans passer par une traduction posée sur une traduction.',

  'world.l1t': 'العربية',
  'world.l1p': 'La langue de lecture de la région : la demande, l’annuaire et le devis s’écrivent d’abord en arabe, avec le sens de lecture qui va avec.',
  'world.l2t': 'Français',
  'world.l2p': 'La langue de travail du Maghreb, où le réseau a commencé : beaucoup d’ateliers pensent, chiffrent et facturent en français.',
  'world.l3t': 'English',
  'world.l3p': 'La langue des partenaires hors région : fournisseurs, organisations et presses qui travaillent avec l’étranger.',

  'world.langNote': 'Le choix se garde d’une visite à l’autre et suit l’adresse : un lien partagé se rouvre dans la langue où on l’a lu.',

  'world.netTitle': 'Ce que le réseau tient ensemble',
  'world.netText': 'Un annuaire, deux guichets de demande, des annonces et des emplois : rien hors du réseau, et rien de deux fois entre deux langues.',

  'world.n1n': '22',
  'world.n1t': 'pays arabes',
  'world.n1p': 'De l’Atlantique au Golfe, atelier par atelier, sur une seule carte.',
  'world.n2n': '6',
  'world.n2t': 'métiers',
  'world.n2p': 'Impression, édition, librairie, façonnage, communication, fournisseurs.',
  'world.n3n': '3',
  'world.n3t': 'langues',
  'world.n3p': 'Arabe, français, anglais — écrites, pas traduites à la machine.',

  'world.famTitle': 'Les six familles, une par une',
  'world.famText': 'Chaque famille a sa page : le compte dit combien d’ateliers la portent aujourd’hui, et la porte ouvre la page de ce métier dans l’annuaire — sans repasser par les filtres. Sous elle, les deux pays qui tiennent le plus d’ateliers de cette famille ouvrent leurs pages les plus fournies : de quoi voir où le métier respire, du premier au second.',
  'world.famOne': 'atelier',
  'world.famMany': 'ateliers',
  'world.famOpen': 'Ouvrir l’annuaire filtré',
  'world.famPlaceTitle': 'Une des pages les plus fournies en ateliers',
  'world.famShare': '{p} % du métier',
  'world.famShareTitle': 'Les deux pays les plus fournis réunissent {c} ateliers sur {n}, soit {p} % du métier — {k} pays en tout.',
  'world.famShareNextTitle': 'Ouvrir {label} — {n} {u} de plus : le pays suivant de cette famille.',
  'world.famShareAllTitle': 'Ouvrir {label} — les {k} pays de la famille, un par un.',
  'world.viaTradeText': 'La page de ce métier — ses ateliers, pays après pays, sans repasser par les filtres.',
  'world.viaCountryText': 'Ce métier dans ce pays — les ateliers, et la région où il bat le plus.',
  'world.viaLabel': 'Vous venez d’Arabe World',
  'world.viaText': 'Deux marques, un même atelier — et trois langues pour le dire.',
  'world.viaAnnonces': 'Le tableau des annonces — les deux marques, et les trois langues du réseau.',
  'world.viaEmplois': 'Le tableau des emplois — les deux marques, et les trois langues du réseau.',
  'world.viaOffres': 'Les formules — trois paliers, et le prix lu dans le pays où l’on travaille.',
  'world.viaPlan': 'Le plan du site — toutes les pages, une par une, sans repasser par les filtres.',
  'world.viaGuichets': 'Les deux guichets — le grand tirage et la sous-traitance, les marchés publics —, dits dans les trois langues.',
  'world.viaLink': 'Relire la page',
  'world.viaClose': 'Masquer ce rappel',
  'world.backToFamily': 'Retour à la famille des {family}',

  'world.whereTitle': 'Par où entrer',
  'world.whereText': 'Six portes suffisent à faire le tour : le réseau, les annonces, les emplois, les guichets, les formules, et le plan du site.',
  'world.seeDirectory': 'L’annuaire et la carte',
  'world.seeAnnonces': 'Le tableau des annonces',
  'world.seeEmplois': 'Le tableau des emplois',
  'world.seeRequests': 'Les deux guichets',
  'world.seeOffers': 'Les formules et les prix',
  'world.seePlan': 'Le plan du site',

  'world.ctaTitle': 'Votre atelier dans le réseau ?',
  'world.ctaText': 'Une fiche gratuite, lisible en arabe, en français et en anglais — la même, sans copie à tenir à jour.',
  'world.ctaBtn': 'Ouvrir l’annuaire',

  'world.seoTitle': 'Arabe World : le réseau et ses trois langues | PaperAtlas',
  'world.seoDesc': 'PaperAtlas et Arabe World : une maison, deux noms. Pourquoi le site des métiers du livre s’écrit en arabe, en français et en anglais, et ce que le réseau réunit dans 22 pays arabes.',
};

const ar: Dict = {
  'world.stamp': 'البيت واسمان',
  'world.title': 'PaperAtlas و<br><span class="accent">العالم العربي</span>.',
  'world.lede': 'بيت واحد واسمان يتقابلان: PaperAtlas للورق والمهن، والعالم العربي للفضاء الذي يُحييها. تحملهما الشريط العلوي، ويعيدهما التذييل في الأسفل.',

  'world.nameTitle': 'علامتان وورشة واحدة',
  'world.nameText': 'الخاتم يقول الورق، والشعار النجمي يقول الاتساع. لا تحلّ إحداهما محلّ الأخرى: الأولى تسمّي المهنة، والثانية تسمّي الأرض التي تعمل فيها. لذلك تسافران معًا، من أول شاشة إلى آخر رابط.',

  'world.b1t': 'الخاتم',
  'world.b1p': 'الورشة والمطبعة والورق: حركة اليد التي تُعرَف من نظرة واحدة.',
  'world.b2t': 'الشعار',
  'world.b2p': 'نجوم هندسية وكرة أرضية: اتساع العالم العربي من طرف الخريطة إلى طرفها.',

  'world.langTitle': 'لماذا يتحدث الموقع ثلاث لغات',
  'world.langText': 'الكتاب يُقرأ بلغة، ويُطبع بلغة، ويُطلب أحيانًا بلغة ثالثة. يقول الموقع الشيء نفسه في الثلاث، دون ترجمة موضوعة فوق ترجمة.',

  'world.l1t': 'العربية',
  'world.l1p': 'لغة القراءة الأولى في المنطقة: الطلب والدليل وعرض السعر تُكتب بالعربية أولًا، ومعها اتجاه القراءة.',
  'world.l2t': 'الفرنسية',
  'world.l2p': 'لغة العمل في المغرب العربي حيث بدأت الشبكة: ورشات كثيرة تفكّر وتحسب وتُفوتر بالفرنسية.',
  'world.l3t': 'الإنجليزية',
  'world.l3p': 'لغة الشركاء خارج المنطقة: المورّدون والهيئات والمطابع التي تعمل مع الخارج.',

  'world.langNote': 'يُحفظ الاختيار من زيارة إلى أخرى ويتبع العنوان: الرابط المُشارَك يُفتح باللغة التي قُرئ بها.',

  'world.netTitle': 'ما تجمعه الشبكة',
  'world.netText': 'دليل واحد، وشبّاكا طلب، وإعلانات ووظائف: لا شيء خارج الشبكة، ولا شيء مكرّر بين لغة وأخرى.',

  'world.n1n': '٢٢',
  'world.n1t': 'دولة عربية',
  'world.n1p': 'من الأطلسي إلى الخليج، ورشةً ورشة، على خريطة واحدة.',
  'world.n2n': '٦',
  'world.n2t': 'مهن',
  'world.n2p': 'طباعة، نشر، مكتبات، تجهيز، اتصال، موردون.',
  'world.n3n': '٣',
  'world.n3t': 'لغات',
  'world.n3p': 'عربية وفرنسية وإنجليزية — مكتوبة، لا مترجمة آليًا.',

  'world.famTitle': 'العائلات الست، واحدة واحدة',
  'world.famText': 'لكل عائلة صفحتها: العدد يقول كم ورشة تحملها اليوم، والباب يفتح صفحة هذه المهنة في الدليل — دون المرور بالمرشّحات. وتحته، البلدان الأكثر حملًا لورشات هذه العائلة يفتحان صفحتيهما الأكثر وفرة: لترى أين يتنفّس العمل، من الأول إلى الثاني.',
  'world.famOne': 'ورشة',
  'world.famMany': 'ورشات',
  'world.famOpen': 'افتح الدليل المُصفّى',
  'world.famPlaceTitle': 'من أكثر الصفحات وفرة بالورشات',
  'world.famShare': '{p} % من المهنة',
  'world.famShareTitle': 'أكثر بلدين وفرة يجمعان {c} ورشة من أصل {n}، أي {p} % من المهنة — و{k} بلدًا في المجموع.',
  'world.famShareNextTitle': 'افتح {label} — {n} {u} إضافية: البلد التالي في هذه العائلة.',
  'world.famShareAllTitle': 'افتح {label} — بلدان العائلة الـ{k}، واحدًا واحدًا.',
  'world.viaTradeText': 'صفحة هذه المهنة — ورشاتها، بلدًا بعد بلد، دون المرور بالمرشّحات.',
  'world.viaCountryText': 'هذه المهنة في هذا البلد — الورشات، والمنطقة التي تنبض فيها أكثر.',
  'world.viaLabel': 'أتيت من العالم العربي',
  'world.viaText': 'علامتان وورشة واحدة — وثلاث لغات تقولها.',
  'world.viaAnnonces': 'لوحة الإعلانات — العلامتان، ولغات الشبكة الثلاث.',
  'world.viaEmplois': 'لوحة الوظائف — العلامتان، ولغات الشبكة الثلاث.',
  'world.viaOffres': 'الصيغ — ثلاث درجات، والسعر يُقرأ بعملة البلد الذي تعمل فيه.',
  'world.viaPlan': 'خريطة الموقع — كل الصفحات، واحدة واحدة، دون المرور بالمرشّحات.',
  'world.viaGuichets': 'الشبّاكان — الطبعة الكبيرة والمناولة، والصفقات العمومية — يُقالان باللغات الثلاث.',
  'world.viaLink': 'أعد قراءة الصفحة',
  'world.viaClose': 'إخفاء هذا التذكير',
  'world.backToFamily': 'العودة إلى عائلة {family}',

  'world.whereTitle': 'من أين تبدأ',
  'world.whereText': 'ستة أبواب تكفي للدوران: الشبكة، والإعلانات، والوظائف، والشبابيك، والصيغ، وخريطة الموقع.',
  'world.seeDirectory': 'الدليل والخريطة',
  'world.seeAnnonces': 'لوحة الإعلانات',
  'world.seeEmplois': 'لوحة الوظائف',
  'world.seeRequests': 'الشبّاكان',
  'world.seeOffers': 'الصيغ والأسعار',
  'world.seePlan': 'خريطة الموقع',

  'world.ctaTitle': 'ورشتك في الشبكة؟',
  'world.ctaText': 'بطاقة مجانية، تُقرأ بالعربية والفرنسية والإنجليزية — نسخة واحدة، دون نسخ تُحفظ كلغة كلغة.',
  'world.ctaBtn': 'افتح الدليل',

  'world.seoTitle': 'العالم العربي: الشبكة ولغاتها الثلاث | PaperAtlas',
  'world.seoDesc': 'PaperAtlas والعالم العربي: بيت واحد واسمان. لماذا يُكتب موقع مهن الكتاب بالعربية والفرنسية والإنجليزية، وما تجمعه الشبكة في ٢٢ دولة عربية.',
};

const en: Dict = {
  'world.stamp': 'The house and its two names',
  'world.title': 'PaperAtlas and<br><span class="accent">Arabe World</span>.',
  'world.lede': 'One house, two names that answer each other: PaperAtlas for paper and the trades, Arabe World for the Arab region that keeps them alive. The bar carries them at the top, the footer picks them up at the bottom.',

  'world.nameTitle': 'Two marks, one workshop',
  'world.nameText': 'The seal speaks of paper; the star emblem speaks of reach. Neither replaces the other: one names the trade, the other names the ground it works on. That is why they travel together, from the first screen to the last link.',

  'world.b1t': 'The seal',
  'world.b1p': 'The workshop, the press, the paper: the gesture of the trade, recognised at a glance.',
  'world.b2t': 'The emblem',
  'world.b2p': 'Geometric stars and a globe: the reach of the Arab world, from one edge of the map to the other.',

  'world.langTitle': 'Why the site speaks three languages',
  'world.langText': 'A book is read in one language, printed in another, and sometimes ordered in a third. The site therefore says the same thing in three, without a translation laid over a translation.',

  'world.l1t': 'العربية',
  'world.l1p': 'The reading language of the region: the request, the directory and the quote are written in Arabic first, reading direction included.',
  'world.l2t': 'French',
  'world.l2p': 'The working language of the Maghreb, where the network began: many workshops think, price and invoice in French.',
  'world.l3t': 'English',
  'world.l3p': 'The language of partners outside the region: suppliers, organisations and presses working with the wider world.',

  'world.langNote': 'The choice is remembered between visits and follows the address: a shared link reopens in the language it was read in.',

  'world.netTitle': 'What the network holds together',
  'world.netText': 'One directory, two request counters, listings and jobs: nothing outside the network, and nothing twice between two languages.',

  'world.n1n': '22',
  'world.n1t': 'Arab countries',
  'world.n1p': 'From the Atlantic to the Gulf, workshop by workshop, on a single map.',
  'world.n2n': '6',
  'world.n2t': 'trades',
  'world.n2p': 'Printing, publishing, bookselling, finishing, communication, suppliers.',
  'world.n3n': '3',
  'world.n3t': 'languages',
  'world.n3p': 'Arabic, French, English — written, not machine-translated.',

  'world.famTitle': 'The six families, one by one',
  'world.famText': 'Each family has its page: the count says how many workshops carry it today, and the door opens that trade’s page in the directory — with no filters to set again. Beneath it, the two countries holding the most workshops of that family open their fullest pages: enough to see where the trade breathes, from the first to the second.',
  'world.famOne': 'workshop',
  'world.famMany': 'workshops',
  'world.famOpen': 'Open the filtered directory',
  'world.famPlaceTitle': 'One of the pages with the most workshops',
  'world.famShare': '{p} % of the trade',
  'world.famShareTitle': 'The two fullest countries hold {c} workshops out of {n}, i.e. {p} % of the trade — {k} countries in all.',
  'world.famShareNextTitle': 'Open {label} — {n} more {u}: the next country of this family.',
  'world.famShareAllTitle': 'Open {label} — the {k} countries of the family, one by one.',
  'world.viaTradeText': 'This trade’s page — its workshops, country after country, with no filters to set again.',
  'world.viaCountryText': 'This trade in this country — the workshops, and the region where it beats hardest.',
  'world.viaLabel': 'You came from Arabe World',
  'world.viaText': 'Two marks, one workshop — and three languages to say it.',
  'world.viaAnnonces': 'The listings board — the two marks, and the network’s three languages.',
  'world.viaEmplois': 'The jobs board — the two marks, and the network’s three languages.',
  'world.viaOffres': 'The plans — three tiers, and the price read in the country you work in.',
  'world.viaPlan': 'The site map — every page, one by one, without going back through the filters.',
  'world.viaGuichets': 'The two counters — the long run and subcontracting, the public tenders — said in all three languages.',
  'world.viaLink': 'Re-read the page',
  'world.viaClose': 'Hide this reminder',
  'world.backToFamily': 'Back to {family} on Arabe World',

  'world.whereTitle': 'Where to begin',
  'world.whereText': 'Six doors are enough to go round: the network, the listings, the jobs, the counters, the plans, and the site map.',
  'world.seeDirectory': 'The directory and the map',
  'world.seeAnnonces': 'The listings board',
  'world.seeEmplois': 'The jobs board',
  'world.seeRequests': 'The two counters',
  'world.seeOffers': 'Plans and pricing',
  'world.seePlan': 'The site map',

  'world.ctaTitle': 'Your workshop in the network?',
  'world.ctaText': 'A free profile, readable in Arabic, French and English — one sheet, with no copies to keep in step.',
  'world.ctaBtn': 'Open the directory',

  'world.seoTitle': 'Arabe World: the network and its three languages | PaperAtlas',
  'world.seoDesc': 'PaperAtlas and Arabe World: one house, two names. Why the book trades site is written in Arabic, French and English, and what the network gathers across 22 Arab countries.',
};

export const worldDict: Record<'fr' | 'ar' | 'en', Dict> = { fr, ar, en };