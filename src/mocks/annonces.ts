export type AnnonceCat = 'materiel' | 'papier' | 'service' | 'recherche';

export type Annonce = {
  id: string;
  cat: AnnonceCat;
  title: { fr: string; ar: string; en: string };
  body: { fr: string; ar: string; en: string };
  seller: string;
  commune: string;
  wilaya: string;
  /** Le point de la commune de la marchandise : il sert à mesurer le trajet
   *  du visiteur jusqu'à la machine, comme sur le tableau des offres. */
  lat?: number;
  lng?: number;
  /** ISO country code; empty means Algeria, the board's home. */
  pays?: string;
  price: string;
  posted: string;
  contact: string;
  phone: string;
  /** Les vues de la marchandise ; une annonce déposée peut n'en avoir aucune. */
  photos?: string[];
  hot?: boolean;
};

export const annonceCats: AnnonceCat[] = ['materiel', 'papier', 'service', 'recherche'];

const demoAnnonces: Annonce[] = [
  {
    id: 'ann-001',
    cat: 'materiel',
    title: {
      fr: 'Heidelberg Speedmaster SM 74-4, 2007, révisée',
      ar: 'هايدلبرغ سبيدماستر SM 74-4، 2007، مُصانة',
      en: 'Heidelberg Speedmaster SM 74-4, 2007, serviced',
    },
    body: {
      fr: 'Offset quadri 52 × 74, 78 millions de feuilles au compteur, rouleaux et groupes révisés en 2025. Livrée avec un jeu de plaques et le manuel technique. Départ sur remorque depuis Oran.',
      ar: 'أوفست رباعي ٥٢ × ٧٤، ٧٨ مليون ورقة على العداد، أسطوانات ومجموعات مُصانة في ٢٠٢٥. تُسلَّم مع طقم ألواح ودليل فني. الشحن من وهران.',
      en: 'Four-colour 52 × 74 offset, 78 million impressions on the counter, rollers and units serviced in 2025. Delivered with a set of plates and the technical manual. Loaded on trailer from Oran.',
    },
    seller: 'Imprimerie El Wiam',
    commune: 'Es Sénia',
    wilaya: 'Oran',
    lat: 35.6467,
    lng: -0.6239,
    price: '6 800 000 DA',
    posted: '2026-10-27',
    contact: 'atelier@elwiam-print.dz',
    phone: '+213 41 55 12 08',
    photos: [
      'https://readdy.ai/api/search-image?query=Four%20colour%20sheet%20fed%20offset%20press%20in%20a%20clean%20printing%20workshop%2C%20warm%20neutral%20walls%2C%20soft%20daylight%20from%20high%20windows%2C%20documentary%20photography%2C%20high%20detail%2C%20calm%20industrial%20scene&width=1200&height=900&seq=annonce-001a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Freshly%20printed%20four%20colour%20sheets%20fanned%20on%20the%20delivery%20pile%20of%20a%20press%2C%20warm%20workshop%20light%2C%20soft%20shadows%2C%20documentary%20photography%2C%20high%20detail%2C%20quiet%20atmosphere&width=1200&height=900&seq=annonce-001b&orientation=landscape',
    ],
    hot: true,
  },
  {
    id: 'ann-002',
    cat: 'materiel',
    title: {
      fr: 'Massicot Polar 115 X programmable',
      ar: 'مقص بولار 115 X قابل للبرمجة',
      en: 'Polar 115 X programmable guillotine',
    },
    body: {
      fr: 'Massicot hydraulique 115 cm, programme couleur, butée motorisée et cellule de sécurité neuve. Idéal façonnage de tirages moyens. Accessible en atelier à Bab Ezzouar.',
      ar: 'مقص هيدروليكي ١١٥ سم، برنامج ملوّن، مصدّ محرّك وخزانة أمان جديدة. مناسب لتجهيز الطبعات المتوسطة. متاح في الورشة بباب الزوار.',
      en: '115 cm hydraulic guillotine, colour programme, motorised back gauge and a new safety light curtain. Suits medium-run finishing. Available for inspection in Bab Ezzouar.',
    },
    seller: 'Façonnage Nedjm',
    commune: 'Bab Ezzouar',
    wilaya: 'Alger',
    lat: 36.7361,
    lng: 3.1836,
    price: '2 400 000 DA',
    posted: '2026-10-25',
    contact: 'contact@faconnage-nedjm.dz',
    phone: '+213 21 24 71 33',
    photos: [
      'https://readdy.ai/api/search-image?query=Hydraulic%20paper%20guillotine%20in%20a%20finishing%20workshop%20with%20a%20stack%20of%20paper%20aligned%20on%20the%20bed%2C%20warm%20neutral%20background%2C%20soft%20daylight%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=annonce-002a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Operator%20hand%20setting%20the%20programme%20on%20a%20guillotine%20control%20panel%2C%20warm%20workshop%20light%2C%20shallow%20depth%20of%20field%2C%20documentary%20photography%2C%20high%20detail%2C%20calm%20scene&width=1200&height=900&seq=annonce-002b&orientation=landscape',
    ],
  },
  {
    id: 'ann-003',
    cat: 'papier',
    title: {
      fr: 'Rame bouffant 80 g, 12 palettes disponibles',
      ar: 'ورق بوفان ٨٠ غرام، ١٢ منصة متوفرة',
      en: '80 g bookwove, 12 pallets available',
    },
    body: {
      fr: 'Papier bouffant 80 g, 70 × 100, norme FSC, stock déstocké après arrêt d’un marché public. 12 palettes de 500 feuilles, prix dégressif au-delà de 5 palettes.',
      ar: 'ورق بوفان ٨٠ غرام، ٧٠ × ١٠٠، معيار FSC، مخزون فائض بعد إلغاء صفقة عمومية. ١٢ منصة من ٥٠٠ ورقة، سعر تنازلي فوق ٥ منصات.',
      en: '80 g bookwove paper, 70 × 100, FSC certified, surplus stock after a public contract was cancelled. Twelve 500-sheet pallets, price drops above five pallets.',
    },
    seller: 'Papeterie du Chélif',
    commune: 'Boufarik',
    wilaya: 'Blida',
    lat: 36.5744,
    lng: 3.0906,
    price: '96 000 DA / palette',
    posted: '2026-10-24',
    contact: 'ventes@papeterie-chelef.dz',
    phone: '+213 25 43 18 90',
    photos: [
      'https://readdy.ai/api/search-image?query=Wrapped%20pallets%20of%20bookwove%20printing%20paper%20stacked%20in%20a%20warehouse%2C%20warm%20sand%20coloured%20walls%2C%20soft%20natural%20light%2C%20documentary%20photography%2C%20clean%20composition%2C%20high%20detail&width=1200&height=900&seq=annonce-003a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Wrapped%20reams%20of%20cream%20printing%20paper%20stacked%20on%20a%20wooden%20pallet%20with%20kraft%20paper%20and%20labels%2C%20warm%20neutral%20background%2C%20soft%20light%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=annonce-003b&orientation=landscape',
    ],
  },
  {
    id: 'ann-004',
    cat: 'materiel',
    title: {
      fr: 'CTP Agfa Avalon N8-30 avec développeuse',
      ar: 'جهاز CTP أغفا أفالون N8-30 مع وحدة التظهير',
      en: 'Agfa Avalon N8-30 CTP with processor',
    },
    body: {
      fr: 'Sortie de plaques 30 mJ, 1 200 plaques/mois d’usage, développeuse incluse et contrat de maintenance transférable. Vendue pour passage au numérique.',
      ar: 'إخراج ألواح ٣٠ ملي جول، استعمال ١٢٠٠ لوح شهريًا، وحدة تظهير مرفقة وعقد صيانة قابل للتحويل. للبيع بسبب الانتقال إلى الرقمي.',
      en: '30 mJ plate output, around 1,200 plates a month of use, processor included and a transferable maintenance contract. Sold as the workshop moves to digital.',
    },
    seller: 'Imprimerie Tafat',
    commune: 'Bougara',
    wilaya: 'Blida',
    lat: 36.5417,
    lng: 3.0833,
    price: '1 950 000 DA',
    posted: '2026-10-22',
    contact: 'direction@tafat-print.dz',
    phone: '+213 25 39 44 12',
    photos: [
      'https://readdy.ai/api/search-image?query=Computer%20to%20plate%20machine%20beside%20a%20rack%20of%20aluminium%20printing%20plates%20in%20a%20prepress%20room%2C%20warm%20grey%20walls%2C%20cool%20light%20on%20the%20metal%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=annonce-004a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Rows%20of%20exposed%20aluminium%20offset%20plates%20standing%20in%20a%20prepress%20rack%2C%20warm%20workshop%20background%2C%20soft%20directional%20light%2C%20documentary%20photography%2C%20high%20detail%2C%20quiet%20room&width=1200&height=900&seq=annonce-004b&orientation=landscape',
    ],
  },
  {
    id: 'ann-005',
    cat: 'recherche',
    title: {
      fr: 'Recherche relieuse dos carré collé pour sous-traitance',
      ar: 'نبحث عن آلة تجليد بالظهر الملصوق للمناولة',
      en: 'Looking for a perfect-binding line for subcontracting',
    },
    body: {
      fr: 'Pour 8 000 dos carrés collés en 15 jours, format A5, couverture quadri avec rabats. Nous fournissons les cahiers et les couvertures. Facturation à la pièce souhaitée.',
      ar: 'لـ ٨٠٠٠ نسخة مجلّدة بالظهر الملصوق في ١٥ يومًا، مقاس A5، غلاف رباعي مع طوّات. نوفّر الكراسات والأغلفة. نفضّل الفوترة بالوحدة.',
      en: 'For 8,000 perfect-bound copies in 15 days, A5 format, four-colour cover with flaps. We supply the sections and the covers. Per-unit invoicing preferred.',
    },
    seller: 'Éditions Sarraz',
    commune: 'Sétif',
    wilaya: 'Sétif',
    lat: 36.1911,
    lng: 5.4137,
    price: 'À négocier',
    posted: '2026-10-26',
    contact: 'production@editions-sarraz.dz',
    phone: '+213 36 62 09 77',
    photos: [
      'https://readdy.ai/api/search-image?query=Perfect%20binding%20line%20in%20a%20bookbinding%20workshop%20with%20stacks%20of%20folded%20signatures%20waiting%20beside%20the%20machine%2C%20warm%20neutral%20walls%2C%20soft%20daylight%2C%20documentary%20photography&width=1200&height=900&seq=annonce-005a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Perfectly%20bound%20paperbacks%20stacked%20in%20neat%20piles%20on%20a%20wooden%20worktable%2C%20warm%20workshop%20light%2C%20shallow%20depth%20of%20field%2C%20documentary%20photography%2C%20high%20detail%2C%20clean%20scene&width=1200&height=900&seq=annonce-005b&orientation=landscape',
    ],
    hot: true,
  },
  {
    id: 'ann-006',
    cat: 'recherche',
    title: {
      fr: 'Cherche 12 palettes de recyclé 120 g pour albums jeunesse',
      ar: 'نبحث عن ١٢ منصة ورق معاد تدويره ١٢٠ غرام لألبومات الأطفال',
      en: 'Seeking 12 pallets of 120 g recycled stock for children’s albums',
    },
    body: {
      fr: 'Commande ferme de 9 000 albums, besoin de papier recyclé 120 g certifié, livraison avant le 20 novembre. Facture au nom de la maison d’édition, paiement à 30 jours.',
      ar: 'طلبية مؤكدة لـ ٩٠٠٠ ألبوم، حاجة إلى ورق معاد تدويره ١٢٠ غرام معتمد، التسليم قبل ٢٠ نوفمبر. الفاتورة باسم دار النشر، الدفع خلال ٣٠ يومًا.',
      en: 'Firm order of 9,000 albums, need certified 120 g recycled paper, delivered before 20 November. Invoice in the publishing house’s name, payment at 30 days.',
    },
    seller: 'Éditions Barzakh',
    commune: 'Alger Centre',
    wilaya: 'Alger',
    lat: 36.7754,
    lng: 3.0589,
    price: 'Budget 1,4 M DA',
    posted: '2026-10-23',
    contact: 'fabrication@barzakh-editions.dz',
    phone: '+213 21 44 90 15',
    photos: [
      'https://readdy.ai/api/search-image?query=Pallets%20of%20recycled%20cream%20paper%20in%20a%20bright%20print%20workshop%2C%20warm%20neutral%20background%2C%20soft%20daylight%2C%20documentary%20photography%2C%20clean%20composition%2C%20high%20detail%2C%20calm%20tone&width=1200&height=900&seq=annonce-006a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Sheet%20of%20recycled%20uncoated%20paper%20held%20up%20against%20a%20warm%20workshop%20window%2C%20fibre%20texture%20visible%2C%20soft%20light%2C%20documentary%20photography%2C%20high%20detail%2C%20simple%20background&width=1200&height=900&seq=annonce-006b&orientation=landscape',
    ],
  },
  {
    id: 'ann-007',
    cat: 'service',
    title: {
      fr: 'Pelliculage mat et brillant, grande laize',
      ar: 'تغليف حراري مطفي ولامع، عرض كبير',
      en: 'Mat and gloss lamination, wide format',
    },
    body: {
      fr: 'Pelliculage à froid jusqu’à 100 × 140, mat, brillant ou soft touch. Délai 48 h pour les commandes de moins de 3 000 feuilles, découpe à la demande.',
      ar: 'تغليف بارد حتى ١٠٠ × ١٤٠، مطفي أو لامع أو ملمس ناعم. الأجل ٤٨ ساعة للطلبات أقل من ٣٠٠٠ ورقة، مع القص عند الطلب.',
      en: 'Cold lamination up to 100 × 140, mat, gloss or soft touch. 48-hour turnaround for orders under 3,000 sheets, cutting on request.',
    },
    seller: 'Atelier Annaba Finition',
    commune: 'El Bouni',
    wilaya: 'Annaba',
    lat: 36.9,
    lng: 7.7333,
    price: '45 DA / m²',
    posted: '2026-10-21',
    contact: 'devis@annaba-finition.dz',
    phone: '+213 38 55 27 41',
    photos: [
      'https://readdy.ai/api/search-image?query=Wide%20format%20lamination%20machine%20in%20a%20finishing%20workshop%20with%20glossy%20sheets%20passing%20through%20rollers%2C%20warm%20neutral%20background%2C%20soft%20daylight%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=annonce-007a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Matte%20laminated%20printed%20sheets%20stacked%20on%20a%20worktable%2C%20calm%20warm%20background%2C%20soft%20directional%20light%2C%20documentary%20photography%2C%20high%20detail%2C%20clean%20composition&width=1200&height=900&seq=annonce-007b&orientation=landscape',
    ],
  },
  {
    id: 'ann-008',
    cat: 'service',
    title: {
      fr: 'Dorure à chaud et gaufrage sur petite série',
      ar: 'تذهيب حراري ونقش على الكميات الصغيرة',
      en: 'Hot foil stamping and embossing for short runs',
    },
    body: {
      fr: 'Dorure à chaud, gaufrage à sec et découpe à la forme pour couvertures et coffrets, à partir de 200 exemplaires. Clichés réalisés en interne sous 3 jours.',
      ar: 'تذهيب حراري، نقش جاف وقص بالشكل للأغلفة والعلب، ابتداءً من ٢٠٠ نسخة. تُنجز القوالب داخليًا في ٣ أيام.',
      en: 'Hot foil stamping, blind embossing and die cutting for covers and slipcases, from 200 copies. Dies made in-house within three days.',
    },
    seller: 'Reliure El Andalous',
    commune: 'Hussein Dey',
    wilaya: 'Alger',
    lat: 36.7375,
    lng: 3.1083,
    price: 'Sur devis',
    posted: '2026-10-20',
    contact: 'atelier@reliure-andalous.dz',
    phone: '+213 21 57 33 62',
    photos: [
      'https://readdy.ai/api/search-image?query=Hot%20foil%20stamping%20press%20with%20a%20gold%20foil%20roll%20and%20a%20dark%20blue%20book%20cover%20on%20the%20bed%2C%20warm%20workshop%20light%2C%20documentary%20photography%2C%20high%20detail%2C%20shallow%20depth%20of%20field&width=1200&height=900&seq=annonce-008a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Embossed%20and%20gold%20foiled%20book%20covers%20arranged%20on%20a%20wooden%20table%2C%20warm%20neutral%20background%2C%20soft%20raking%20light%2C%20documentary%20photography%2C%20high%20detail%2C%20elegant%20calm&width=1200&height=900&seq=annonce-008b&orientation=landscape',
    ],
  },
  {
    id: 'ann-009',
    cat: 'papier',
    title: {
      fr: 'Lot de 3 000 couvertures rigides A4',
      ar: 'دفعة ٣٠٠٠ غلاف مقوّى A4',
      en: 'Lot of 3,000 rigid A4 covers',
    },
    body: {
      fr: 'Carton 2,5 mm pelliculé, dos toilé bleu nuit, coins renforcés. Surplus d’un marché universitaire, vendu par lots de 500. Stock à Constantine.',
      ar: 'كرتون ٢٫٥ مم مغلّف، ظهر قماشي أزرق داكن، زوايا مقوّاة. فائض من صفقة جامعية، يُباع بدفعات من ٥٠٠. المخزون في قسنطينة.',
      en: '2.5 mm laminated board, midnight-blue cloth spine, reinforced corners. Surplus from a university contract, sold in lots of 500. Stock in Constantine.',
    },
    seller: 'Cartonnage Cirta',
    commune: 'El Khroub',
    wilaya: 'Constantine',
    lat: 36.2631,
    lng: 6.6944,
    price: '180 000 DA / lot',
    posted: '2026-10-19',
    contact: 'stock@cartonnage-cirta.dz',
    phone: '+213 31 92 18 44',
    photos: [
      'https://readdy.ai/api/search-image?query=Rigid%20A4%20book%20covers%20with%20navy%20cloth%20spines%20stacked%20in%20a%20cartonnage%20workshop%2C%20warm%20neutral%20walls%2C%20soft%20daylight%2C%20documentary%20photography%2C%20clean%20composition%2C%20high%20detail&width=1200&height=900&seq=annonce-009a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Detail%20of%20a%20reinforced%20cloth%20spine%20and%20laminated%20board%20corner%20on%20a%20hardcover%20book%2C%20warm%20workshop%20background%2C%20soft%20light%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=annonce-009b&orientation=landscape',
    ],
  },
  {
    id: 'ann-010',
    cat: 'materiel',
    title: {
      fr: 'Plieuse-colleuse Bobst Domino 90',
      ar: 'آلة طي ولصق بوبست دومينو ٩٠',
      en: 'Bobst Domino 90 folder-gluer',
    },
    body: {
      fr: 'Plieuse-colleuse pour étuis et boîtes, 1998, entretien suivi, mise en route assurée par notre technicien. Démonstration possible sur rendez-vous.',
      ar: 'آلة طي ولصق للعلب والصناديق، ١٩٩٨، صيانة منتظمة، التشغيل مضمون من طرف تقنينا. إمكانية العرض بموعد.',
      en: 'Folder-gluer for cartons and boxes, 1998, regularly maintained, commissioning handled by our technician. Demonstration available by appointment.',
    },
    seller: 'Emballage Djurdjura',
    commune: 'Draâ Ben Khedda',
    wilaya: 'Tizi Ouzou',
    lat: 36.7333,
    lng: 3.95,
    price: '3 100 000 DA',
    posted: '2026-10-18',
    contact: 'contact@emballage-djurdjura.dz',
    phone: '+213 26 41 55 09',
    photos: [
      'https://readdy.ai/api/search-image?query=Folder%20gluer%20machine%20running%20folded%20cartons%20in%20a%20packaging%20workshop%2C%20warm%20neutral%20walls%2C%20soft%20daylight%2C%20documentary%20photography%2C%20high%20detail%2C%20calm%20industrial%20scene&width=1200&height=900&seq=annonce-010a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Folded%20cardboard%20cartons%20stacked%20and%20banded%20on%20a%20pallet%20in%20a%20packaging%20workshop%2C%20warm%20background%2C%20soft%20light%2C%20documentary%20photography%2C%20clean%20composition%2C%20high%20detail&width=1200&height=900&seq=annonce-010b&orientation=landscape',
    ],
  },
  {
    id: 'ann-011',
    cat: 'materiel',
    title: {
      fr: 'Roland 700 HiPrint 5 couleurs, 2012',
      ar: 'رولاند 700 هاي برنت خمسة ألوان، 2012',
      en: 'Roland 700 HiPrint five-colour, 2012',
    },
    body: {
      fr: 'Offset cinq couleurs avec groupe vernis, 52 millions de feuilles, entretien annuel à jour. Machine visible en production à Sfax, transport organisé avec l’acheteur.',
      ar: 'أوفست خمسة ألوان مع مجموعة ورنيش، ٥٢ مليون ورقة، صيانة سنوية منتظمة. الآلة متاحة للمعاينة في صفاقس، والنقل يُنظّم مع المشتري.',
      en: 'Five-colour offset with a coating unit, 52 million impressions, annual servicing up to date. Machine running in Sfax, transport arranged with the buyer.',
    },
    seller: 'Imprimerie Sfax Offset',
    commune: 'Sfax',
    wilaya: 'Sfax',
    lat: 34.7406,
    lng: 10.7603,
    pays: 'TN',
    price: '310 000 TND',
    posted: '2026-11-04',
    contact: 'vente@sfax-offset.tn',
    phone: '+216 74 22 18 40',
    photos: [
      'https://readdy.ai/api/search-image?query=Five%20colour%20sheet%20fed%20offset%20press%20with%20a%20coating%20unit%20in%20a%20large%20press%20hall%2C%20warm%20neutral%20walls%2C%20soft%20daylight%20from%20tall%20windows%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=annonce-011a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Control%20console%20of%20a%20modern%20five%20colour%20offset%20press%20with%20screens%20and%20ink%20keys%2C%20warm%20press%20hall%20background%2C%20soft%20light%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=annonce-011b&orientation=landscape',
    ],
  },
  {
    id: 'ann-012',
    cat: 'papier',
    title: {
      fr: 'Couche mat 135 g — 9 palettes, arrivage direct',
      ar: 'ورق مطفي ١٣٥ غرام — ٩ منصات، وصول مباشر',
      en: '135 g matte coated — 9 pallets, direct shipment',
    },
    body: {
      fr: 'Couche mat deux faces 135 g, 70 × 100, livraison directe d’un importeur de Casablanca. Prix dégressif à partir de 5 palettes, enlèvement sous 48 heures.',
      ar: 'ورق مطفي الوجهين ١٣٥ غرام، ٧٠ × ١٠٠، تسليم مباشر من مستورد بالدار البيضاء. سعر تنازلي من ٥ منصات، والسحب خلال ٤٨ ساعة.',
      en: 'Two-side matte coated 135 g, 70 × 100, shipped direct from a Casablanca importer. Price drops from five pallets, collection within 48 hours.',
    },
    seller: 'Papeterie Al Boustane',
    commune: 'Casablanca',
    wilaya: 'Casablanca-Settat',
    lat: 33.5731,
    lng: -7.5898,
    pays: 'MA',
    price: '24 800 MAD / palette',
    posted: '2026-11-03',
    contact: 'stock@alboustane-paper.ma',
    phone: '+212 522 41 08 76',
    photos: [
      'https://readdy.ai/api/search-image?query=Pallets%20of%20matte%20coated%20printing%20paper%20wrapped%20in%20kraft%20with%20import%20labels%2C%20warm%20warehouse%20background%2C%20soft%20daylight%2C%20documentary%20photography%2C%20high%20detail%2C%20clean%20scene&width=1200&height=900&seq=annonce-012a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Close%20detail%20of%20a%20matte%20coated%20paper%20surface%20and%20the%20cut%20edge%20of%20a%20paper%20stack%2C%20warm%20neutral%20background%2C%20soft%20raking%20light%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=annonce-012b&orientation=landscape',
    ],
  },
  {
    id: 'ann-013',
    cat: 'service',
    title: {
      fr: 'Reliure dos carré collé, cadence 6 000/heure',
      ar: 'تجليد بالظهر الملصوق، وتيرة ٦٠٠٠ في الساعة',
      en: 'Perfect binding, 6,000 copies an hour',
    },
    body: {
      fr: 'Ligne de reliure complète à Tunis : dos carré collé, rogneuse trois lames, couvertures quadri avec rabats. Reprise de cahiers déjà imprimés, facturation à la pièce.',
      ar: 'خط تجليد كامل في تونس: ظهر ملصوق، آلة قص بثلاث شفرات، أغلفة رباعية مع طوّات. استلام كراسات مطبوعة سلفًا، والفوترة بالوحدة.',
      en: 'Complete binding line in Tunis: perfect binding, three-knife trimmer, four-colour covers with flaps. Takes already-printed sections, per-unit invoicing.',
    },
    seller: 'Atelier Tunis Finition',
    commune: 'Tunis',
    wilaya: 'Tunis',
    lat: 36.8065,
    lng: 10.1815,
    pays: 'TN',
    price: '1,350 TND / 1 000',
    posted: '2026-11-02',
    contact: 'devis@tunis-finition.tn',
    phone: '+216 71 33 92 05',
    photos: [
      'https://readdy.ai/api/search-image?query=Complete%20perfect%20binding%20line%20with%20a%20three%20knife%20trimmer%20in%20a%20Tunis%20finishing%20workshop%2C%20warm%20neutral%20walls%2C%20soft%20daylight%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=annonce-013a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Bound%20books%20coming%20off%20a%20trimmer%20conveyor%20in%20a%20finishing%20workshop%2C%20warm%20background%2C%20slight%20motion%20softness%2C%20documentary%20photography%2C%20high%20detail%2C%20calm%20tone&width=1200&height=900&seq=annonce-013b&orientation=landscape',
    ],
  },
  {
    id: 'ann-014',
    cat: 'recherche',
    title: {
      fr: 'Cherche imprimeur pour 20 000 guides A5, livraison Dubaï',
      ar: 'نبحث عن مطبعة لـ ٢٠٠٠٠ دليل A5، التسليم في دبي',
      en: 'Seeking a printer for 20,000 A5 guides, delivered to Dubai',
    },
    body: {
      fr: 'Guide de 96 pages, quadri, couverture pelliculée mat, reliure piqûre métal. Fichiers prêts, livraison franco Dubaï avant le 15 décembre, paiement à 45 jours.',
      ar: 'دليل من ٩٦ صفحة، رباعي الألوان، غلاف مغلّف مطفي، تجليد بالخياطة المعدنية. الملفات جاهزة، والتسليم franco دبي قبل ١٥ ديسمبر، والدفع خلال ٤٥ يومًا.',
      en: '96-page guide, four-colour, matte laminated cover, saddle-stitched. Print-ready files, delivered free to Dubai before 15 December, payment at 45 days.',
    },
    seller: 'Éditions Al Manar',
    commune: 'Dubaï',
    wilaya: 'Dubaï',
    lat: 25.2048,
    lng: 55.2708,
    pays: 'AE',
    price: 'Budget 46 000 AED',
    posted: '2026-11-01',
    contact: 'fabrication@almanar-editions.ae',
    phone: '+971 4 331 72 90',
    photos: [
      'https://readdy.ai/api/search-image?query=Printing%20plant%20producing%20small%20format%20guides%20with%20stacks%20of%20stitched%20booklets%20on%20a%20pallet%2C%20warm%20neutral%20walls%2C%20soft%20daylight%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=annonce-014a&orientation=landscape',
      'https://readdy.ai/api/search-image?query=A5%20saddle%20stitched%20printed%20guides%20arranged%20in%20a%20fan%20on%20a%20wooden%20table%2C%20warm%20neutral%20background%2C%20soft%20light%2C%20documentary%20photography%2C%20high%20detail%2C%20clean%20composition&width=1200&height=900&seq=annonce-014b&orientation=landscape',
    ],
  },
];

/* Données de démonstration : développement seulement. */
export const annonces: Annonce[] = import.meta.env.DEV ? demoAnnonces : [];