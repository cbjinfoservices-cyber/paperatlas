import type { Bilingual } from './entreprises';
import { marchesAuteurs } from './data/marches';

export type Genre = 'roman' | 'poesie' | 'essai' | 'jeunesse' | 'traduction' | 'theatre' | 'histoire';
export type AuthorStatus = 'open' | 'project' | 'full';

export type Book = {
  title: Bilingual;
  year: number;
  publisher: string;
  genre: Bilingual;
  pages: number;
};

export type Auteur = {
  id: string;
  name: string;
  monogram: string;
  wilaya: string;
  /** ISO code of the Arab country the author works from — « DZ » when absent. */
  pays?: string;
  commune: string;
  lat: number;
  lng: number;
  since: number;
  genres: Genre[];
  bio: Bilingual;
  languages: string[];
  books: Book[];
  status: AuthorStatus;
  availableFrom: Bilingual;
  services: Bilingual[];
  awards: Bilingual[];
  reading: Bilingual;
  portrait: string;
  /** Les autres vues du profil, en plus du portrait : le bureau, la ville. */
  photos?: string[];
  email: string;
  phone: string;
  website: string;
  featured?: boolean;
};

export const genres: Genre[] = ['roman', 'poesie', 'essai', 'jeunesse', 'traduction', 'theatre', 'histoire'];

export const auteurs: Auteur[] = [
  {
    id: 'nadia-bensalem',
    name: 'Nadia Bensalem',
    monogram: 'NB',
    wilaya: 'Alger',
    commune: 'Hydra',
    lat: 36.7441,
    lng: 3.0352,
    since: 2009,
    genres: ['roman', 'essai'],
    bio: {
      fr: 'Romancière et essayiste algéroise, Nadia Bensalem explore la mémoire des villes et les fractures sociales de l’Algérie contemporaine. Après deux recueils remarqués chez Barzakh, elle publie un roman polyphonique sur les quartiers de la baie d’Alger et intervient régulièrement dans les ateliers d’écriture universitaires.',
      ar: 'روائية وباحثة من الجزائر العاصمة، تستكشف ذاكرة المدن والتصدّعات الاجتماعية في الجزائر المعاصرة. بعد مجموعتين لافتتين عند برزخ، تنشر رواية متعددة الأصوات عن أحياء خليج الجزائر، وتشارك بانتظام في ورشات الكتابة الجامعية.',
      en: 'An Algiers novelist and essayist, Nadia Bensalem explores the memory of cities and the social fractures of contemporary Algeria. After two acclaimed collections with Barzakh, she published a polyphonic novel about the neighbourhoods of the bay of Algiers, and regularly leads university writing workshops.',
    },
    languages: ['العربية', 'Français', 'English'],
    books: [
      { title: { fr: 'Les Terrasses de la baie', ar: 'شرفات الخليج', en: 'The Terraces of the Bay' }, year: 2023, publisher: 'Éditions Barzakh', genre: { fr: 'Roman', ar: 'رواية', en: 'Novel' }, pages: 284 },
      { title: { fr: 'Une saison à Bab El Oued', ar: 'فصل في باب الوادي', en: 'A Season in Bab El Oued' }, year: 2019, publisher: 'Éditions Barzakh', genre: { fr: 'Roman', ar: 'رواية', en: 'Novel' }, pages: 216 },
      { title: { fr: 'Carnets de la ville blanche', ar: 'دفاتر المدينة البيضاء', en: 'Notebooks from the White City' }, year: 2016, publisher: 'Éditions Rihla', genre: { fr: 'Essai', ar: 'دراسة', en: 'Essay' }, pages: 148 },
    ],
    status: 'project',
    availableFrom: { fr: 'Janvier 2027', ar: 'جانفي ٢٠٢٧', en: 'January 2027' },
    services: [
      { fr: 'Ateliers d’écriture', ar: 'ورشات الكتابة', en: 'Writing workshops' },
      { fr: 'Préfaces et relectures', ar: 'تقديم ومراجعة', en: 'Forewords and manuscript reviews' },
      { fr: 'Rencontres en librairie', ar: 'لقاءات في المكتبات', en: 'Bookshop events' },
    ],
    awards: [
      { fr: 'Prix du roman algérien 2023', ar: 'جائزة الرواية الجزائرية ٢٠٢٣', en: 'Algerian Novel Prize 2023' },
      { fr: 'Sélection Escale littéraire, Beyrouth', ar: 'اختيار معرض بيروت الأدبي', en: 'Escale littéraire selection, Beirut' },
    ],
    reading: {
      fr: 'On ne quitte jamais vraiment un quartier : on emporte ses escaliers dans la mémoire, et chaque marche nous rappelle d’où l’on vient.',
      ar: 'لا نغادر الحي حقًا: نأخذ سلالمه في الذاكرة، وكل درجة تذكّرنا من أين أتينا.',
      en: 'You never really leave a neighbourhood: you carry its stairways in your memory, and every step reminds you where you come from.',
    },
    portrait: 'https://readdy.ai/api/search-image?query=Editorial%20portrait%20of%20an%20Algerian%20woman%20writer%20in%20her%20forties%20seated%20near%20a%20window%20with%20warm%20afternoon%20light%2C%20simple%20dark%20clothing%2C%20warm%20neutral%20studio%20background%2C%20natural%20expression%2C%20high%20detail%20photography&width=800&height=800&seq=auteur-nadia-01&orientation=squarish',
    photos: [
      'https://readdy.ai/api/search-image?query=Writing%20desk%20by%20a%20window%20in%20an%20Algiers%20apartment%20with%20open%20notebooks%20and%20a%20fountain%20pen%2C%20warm%20afternoon%20light%2C%20terracotta%20wall%2C%20documentary%20photography%2C%20high%20detail%2C%20quiet%20mood&width=1200&height=900&seq=auteur-nadia-bureau&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Terraces%20overlooking%20the%20bay%20of%20Algiers%20at%20golden%20hour%2C%20white%20buildings%20stepping%20down%20the%20hill%2C%20warm%20sky%2C%20quiet%20urban%20scene%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=auteur-nadia-baie&orientation=landscape',
    ],
    email: 'nadia.bensalem@auteurs.dz',
    phone: '+213 21 60 44 12',
    website: 'nadiabensalem.dz',
    featured: true,
  },
  {
    id: 'yacine-ait-kaci',
    name: 'Yacine Aït Kaci',
    monogram: 'YK',
    wilaya: 'Tizi Ouzou',
    commune: 'Ath Yenni',
    lat: 36.7052,
    lng: 4.0571,
    since: 2012,
    genres: ['poesie', 'theatre'],
    bio: {
      fr: 'Poète et dramaturge de langue tamazight et française, Yacine Aït Kaci travaille la parole orale et la scène. Ses textes ont été joués au festival de Tizi Ouzou et traduits en quatre langues, et il anime depuis 2018 un atelier de poésie itinérant dans les lycées de Kabylie.',
      ar: 'شاعر وكاتب مسرحي بالأمازيغية والفرنسية، يعمل على الكلمة المنطوقة والمسرح. عُرضت نصوصه في مهرجان تيزي وزو وتُرجمت إلى أربع لغات، ويدير منذ ٢٠١٨ ورشة شعر متنقلة في ثانويات القبائل.',
      en: 'A poet and playwright writing in Tamazight and French, Yacine Aït Kaci works with the spoken word and the stage. His texts have been performed at the Tizi Ouzou festival and translated into four languages, and since 2018 he has run a travelling poetry workshop in Kabylie secondary schools.',
    },
    languages: ['ⵜⴰⵎⴰⵣⵉⵖⵜ', 'العربية', 'Français'],
    books: [
      { title: { fr: 'Le chant des figuiers', ar: 'أغنية أشجار التين', en: 'The Song of the Fig Trees' }, year: 2024, publisher: 'Éditions Rihla', genre: { fr: 'Poésie', ar: 'شعر', en: 'Poetry' }, pages: 96 },
      { title: { fr: 'Assirem — scène ouverte', ar: 'أسيرم — مسرح مفتوح', en: 'Assirem — Open Stage' }, year: 2021, publisher: 'Éditions Sahariennes', genre: { fr: 'Théâtre', ar: 'مسرح', en: 'Theatre' }, pages: 132 },
      { title: { fr: 'Pierres et voix', ar: 'حجارة وأصوات', en: 'Stones and Voices' }, year: 2017, publisher: 'Auto-édition', genre: { fr: 'Poésie', ar: 'شعر', en: 'Poetry' }, pages: 84 },
    ],
    status: 'open',
    availableFrom: { fr: 'Disponible pour résidences', ar: 'متاح للإقامات', en: 'Available for residencies' },
    services: [
      { fr: 'Lectures publiques', ar: 'قراءات علنية', en: 'Public readings' },
      { fr: 'Résidences d’écriture', ar: 'إقامات الكتابة', en: 'Writing residencies' },
      { fr: 'Traduction tamazight', ar: 'الترجمة الأمازيغية', en: 'Tamazight translation' },
      { fr: 'Ateliers lycées', ar: 'ورشات للثانويات', en: 'Secondary school workshops' },
    ],
    awards: [
      { fr: 'Prix de la jeune poésie amazighe 2021', ar: 'جائزة الشعر الأمازيغي الشاب ٢٠٢١', en: 'Young Amazigh Poetry Prize 2021' },
    ],
    reading: {
      fr: 'Ma langue pousse entre deux pierres, et c’est dans cet écart que le poème apprend à respirer.',
      ar: 'لغتي تنمو بين حجرين، وفي تلك الفجوة يتعلّم النصّ التنفّس.',
      en: 'My language grows between two stones, and it is in that gap that the poem learns to breathe.',
    },
    portrait: 'https://readdy.ai/api/search-image?query=Editorial%20portrait%20of%20a%20young%20Kabyle%20man%20poet%20with%20short%20beard%20and%20a%20wool%20scarf%2C%20standing%20before%20a%20plain%20warm%20terracotta%20background%2C%20soft%20daylight%2C%20high%20detail%20photography&width=800&height=800&seq=auteur-yacine-01&orientation=squarish',
    photos: [
      'https://readdy.ai/api/search-image?query=Handwritten%20poetry%20notebook%20with%20a%20fountain%20pen%20on%20a%20rustic%20wooden%20table%2C%20warm%20daylight%2C%20terracotta%20background%2C%20documentary%20photography%2C%20high%20detail%2C%20simple%20composition&width=1200&height=900&seq=auteur-yacine-cahier&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Stone%20village%20houses%20of%20Kabylie%20on%20a%20hillside%20with%20fig%20trees%2C%20warm%20afternoon%20light%2C%20soft%20haze%2C%20documentary%20photography%2C%20high%20detail%2C%20calm%20landscape&width=1200&height=900&seq=auteur-yacine-village&orientation=landscape',
    ],
    email: 'yacine.aitkaci@auteurs.dz',
    phone: '+213 26 21 88 34',
    website: 'assirem-poemes.dz',
  },
  {
    id: 'leila-mansouri',
    name: 'Leïla Mansouri',
    monogram: 'LM',
    wilaya: 'Constantine',
    commune: 'Constantine',
    lat: 36.3658,
    lng: 6.6187,
    since: 2015,
    genres: ['jeunesse', 'roman'],
    bio: {
      fr: 'Autrice jeunesse et illustratrice, Leïla Mansouri a signé douze albums pour les 6–12 ans, dont la série à succès « Les Aventures de Chira ». Elle collabore avec les éditeurs scolaires pour des collections bilingues et intervient dans les bibliothèques communales.',
      ar: 'كاتبة ورَسّامة لكتب الأطفال، وقّعت اثني عشر ألبومًا للفئة ٦–١٢ سنة، منها سلسلة «مغامرات شيرة» الناجحة، وتتعاون مع ناشري الكتب المدرسية في مجموعات ثنائية اللغة وتنشط في المكتبات البلدية.',
      en: 'A children’s author and illustrator, Leïla Mansouri has signed twelve picture books for ages 6–12, including the bestselling “Chira Adventures” series. She works with educational publishers on bilingual collections and runs sessions in municipal libraries.',
    },
    languages: ['العربية', 'Français'],
    books: [
      { title: { fr: 'Les Aventures de Chira — tome 3', ar: 'مغامرات شيرة — الجزء ٣', en: 'The Chira Adventures — Volume 3' }, year: 2024, publisher: 'Éditions Barzakh', genre: { fr: 'Jeunesse', ar: 'أطفال', en: 'Children' }, pages: 64 },
      { title: { fr: 'Le Jardin de Nana', ar: 'حديقة نانا', en: 'Nana’s Garden' }, year: 2022, publisher: 'Éditions Rihla', genre: { fr: 'Album illustré', ar: 'ألبوم مصوّر', en: 'Picture book' }, pages: 40 },
      { title: { fr: 'Mon cahier d’arabe en images', ar: 'دفتر العربية بالصور', en: 'My Arabic Workbook in Pictures' }, year: 2020, publisher: 'Éditions Sahariennes', genre: { fr: 'Scolaire', ar: 'مدرسي', en: 'School' }, pages: 96 },
    ],
    status: 'open',
    availableFrom: { fr: 'Dès novembre 2026', ar: 'من نوفمبر ٢٠٢٦', en: 'From November 2026' },
    services: [
      { fr: 'Illustration jeunesse', ar: 'رسم كتب الأطفال', en: 'Children’s illustration' },
      { fr: 'Albums bilingues', ar: 'ألبومات ثنائية اللغة', en: 'Bilingual picture books' },
      { fr: 'Animations scolaires', ar: 'تنشيط مدرسي', en: 'School sessions' },
    ],
    awards: [
      { fr: 'Prix du livre jeunesse, Constantine 2022', ar: 'جائزة كتاب الأطفال، قسنطينة ٢٠٢٢', en: 'Constantine Children’s Book Prize 2022' },
      { fr: 'Sélection IBBY 2023', ar: 'اختيار IBBY ٢٠٢٣', en: 'IBBY Selection 2023' },
    ],
    reading: {
      fr: 'Un enfant qui tourne une page ne demande jamais la permission de rêver.',
      ar: 'الطفل الذي يقلّب صفحة لا يستأذن أحدًا كي يحلم.',
      en: 'A child turning a page never asks permission to dream.',
    },
    portrait: 'https://readdy.ai/api/search-image?query=Editorial%20portrait%20of%20an%20Algerian%20woman%20children%20book%20illustrator%20in%20her%20thirties%20holding%20a%20sketchbook%2C%20warm%20cream%20background%2C%20soft%20window%20light%2C%20friendly%20expression%2C%20high%20detail%20photography&width=800&height=800&seq=auteur-leila-01&orientation=squarish',
    photos: [
      'https://readdy.ai/api/search-image?query=Children%20book%20illustration%20sketches%20with%20coloured%20pencils%20on%20a%20bright%20worktable%2C%20warm%20cream%20background%2C%20soft%20daylight%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=auteur-leila-croquis&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Reading%20corner%20in%20a%20municipal%20library%20with%20picture%20books%20displayed%20on%20low%20shelves%2C%20warm%20wood%2C%20soft%20daylight%2C%20documentary%20photography%2C%20high%20detail&width=1200&height=900&seq=auteur-leila-biblio&orientation=landscape',
    ],
    email: 'leila.mansouri@auteurs.dz',
    phone: '+213 31 55 72 19',
    website: 'chira-contes.dz',
  },
  {
    id: 'brahim-ould-cheikh',
    name: 'Brahim Ould Cheikh',
    monogram: 'BC',
    wilaya: 'Adrar',
    commune: 'Timimoun',
    lat: 29.2639,
    lng: 0.2333,
    since: 2004,
    genres: ['histoire', 'poesie'],
    bio: {
      fr: 'Historien du Touat et collecteur de poésie melhoun, Brahim Ould Cheikh a passé quinze ans à enregistrer les récits des oasis. Il publie des ouvrages documentaires et des transcriptions bilingues, et conseille les maisons d’édition sur le patrimoine saharien.',
      ar: 'مؤرخ لتوات وجامع للشعر الملحون، أمضى خمسة عشر عامًا في تسجيل حكايات الواحات. ينشر كتبًا وثائقية ونصوصًا ثنائية اللغة، ويستشير دور النشر في التراث الصحراوي.',
      en: 'A historian of the Touat and a collector of melhoun poetry, Brahim Ould Cheikh spent fifteen years recording the stories of the oases. He publishes documentary works and bilingual transcriptions, and advises publishing houses on Saharan heritage.',
    },
    languages: ['العربية', 'Français', 'Tamazight'],
    books: [
      { title: { fr: 'Mémoire du Touat', ar: 'ذاكرة توات', en: 'Memory of the Touat' }, year: 2021, publisher: 'Éditions Sahariennes', genre: { fr: 'Histoire', ar: 'تاريخ', en: 'History' }, pages: 312 },
      { title: { fr: 'Voix des ksour', ar: 'أصوات القصور', en: 'Voices of the Ksour' }, year: 2018, publisher: 'Éditions Sahariennes', genre: { fr: 'Patrimoine', ar: 'تراث', en: 'Heritage' }, pages: 208 },
      { title: { fr: 'Poèmes du vent', ar: 'قصائد الريح', en: 'Poems of the Wind' }, year: 2014, publisher: 'Auto-édition', genre: { fr: 'Poésie', ar: 'شعر', en: 'Poetry' }, pages: 120 },
    ],
    status: 'full',
    availableFrom: { fr: 'Reprise en mars 2027', ar: 'العودة في مارس ٢٠٢٧', en: 'Back in March 2027' },
    services: [
      { fr: 'Recherche historique', ar: 'بحث تاريخي', en: 'Historical research' },
      { fr: 'Collecte de témoignages', ar: 'جمع الشهادات', en: 'Oral testimony collection' },
      { fr: 'Conseil patrimoine', ar: 'استشارة تراثية', en: 'Heritage consultancy' },
    ],
    awards: [
      { fr: 'Médaille du patrimoine, Adrar 2022', ar: 'وسام التراث، أدرار ٢٠٢٢', en: 'Heritage Medal, Adrar 2022' },
    ],
    reading: {
      fr: 'Un ksar ne se raconte pas avec des dates : il se raconte avec des voix, des palmiers et de l’eau qui cherche son chemin.',
      ar: 'القصر لا يُروى بالتواريخ، بل بالأصوات والنخيل وماء يبحث عن طريقه.',
      en: 'A ksar is not told with dates: it is told with voices, palm trees and water looking for its way.',
    },
    portrait: 'https://readdy.ai/api/search-image?query=Editorial%20portrait%20of%20an%20older%20saharan%20Algerian%20man%20historian%20with%20a%20white%20cheche%20headscarf%2C%20warm%20sand%20coloured%20plain%20background%2C%20soft%20desert%20light%2C%20dignified%20expression%2C%20high%20detail%20photography&width=800&height=800&seq=auteur-brahim-01&orientation=squarish',
    photos: [
      'https://readdy.ai/api/search-image?query=Old%20Arabic%20manuscripts%20and%20notebooks%20spread%20on%20a%20low%20wooden%20table%2C%20warm%20sand%20coloured%20light%2C%20documentary%20photography%2C%20high%20detail%2C%20quiet%20atmosphere&width=1200&height=900&seq=auteur-brahim-manuscrits&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Mud%20brick%20ksar%20with%20a%20palm%20grove%20in%20the%20Touat%20desert%20at%20soft%20morning%20light%2C%20warm%20ochre%20tones%2C%20documentary%20photography%2C%20high%20detail%2C%20calm%20scene&width=1200&height=900&seq=auteur-brahim-ksar&orientation=landscape',
    ],
    email: 'brahim.ouldcheikh@auteurs.dz',
    phone: '+213 49 74 21 06',
    website: 'touat-memoire.dz',
  },
  {
    id: 'farid-belkacem',
    name: 'Farid Belkacem',
    monogram: 'FB',
    wilaya: 'Oran',
    commune: 'Oran',
    lat: 35.7036,
    lng: -0.6493,
    since: 2011,
    genres: ['traduction', 'essai'],
    bio: {
      fr: 'Traducteur littéraire de l’arabe vers le français, Farid Belkacem a fait découvrir en Algérie plusieurs voix du Golfe et du Levant. Il dirige une collection de poche consacrée aux essais traduits et enseigne la traduction à l’université d’Oran.',
      ar: 'مترجم أدبي من العربية إلى الفرنسية، عرّف القارئ الجزائري بأصوات خليجية وشامية عديدة، ويدير مجموعة جيب للدراسات المترجمة ويدرّس الترجمة بجامعة وهران.',
      en: 'A literary translator from Arabic into French, Farid Belkacem has introduced several Gulf and Levantine voices to Algerian readers. He runs a paperback collection devoted to translated essays and teaches translation at the University of Oran.',
    },
    languages: ['العربية', 'Français', 'English'],
    books: [
      { title: { fr: 'Le Livre des marges (trad.)', ar: 'كتاب الهوامش (ترجمة)', en: 'The Book of Margins (trans.)' }, year: 2023, publisher: 'Éditions Barzakh', genre: { fr: 'Essai traduit', ar: 'دراسة مترجمة', en: 'Translated essay' }, pages: 268 },
      { title: { fr: 'Poètes du Golfe, anthologie', ar: 'شعراء الخليج، أنطولوجيا', en: 'Poets of the Gulf, an Anthology' }, year: 2020, publisher: 'Éditions Rihla', genre: { fr: 'Anthologie', ar: 'أنطولوجيا', en: 'Anthology' }, pages: 340 },
    ],
    status: 'project',
    availableFrom: { fr: 'Février 2027', ar: 'فيفري ٢٠٢٧', en: 'February 2027' },
    services: [
      { fr: 'Traduction AR → FR', ar: 'ترجمة من العربية إلى الفرنسية', en: 'AR → FR translation' },
      { fr: 'Révision et post-édition', ar: 'مراجعة وتحرير', en: 'Revision and post-editing' },
      { fr: 'Direction de collection', ar: 'إدارة مجموعة', en: 'Collection editing' },
    ],
    awards: [
      { fr: 'Prix de la traduction, Foire d’Alger 2021', ar: 'جائزة الترجمة، معرض الجزائر ٢٠٢١', en: 'Translation Prize, Algiers Book Fair 2021' },
    ],
    reading: {
      fr: 'Traduire, c’est accepter de vivre un an dans une langue qui n’est pas la sienne pour en rendre une seule phrase juste.',
      ar: 'الترجمة أن تعيش سنة كاملة في لغة ليست لغتك، من أجل جملة واحدة صحيحة.',
      en: 'To translate is to accept living a year in a language that is not yours, in order to get a single sentence right.',
    },
    portrait: 'https://readdy.ai/api/search-image?query=Editorial%20portrait%20of%20an%20Algerian%20man%20translator%20with%20glasses%20in%20his%20fifties%20holding%20a%20book%2C%20warm%20grey%20studio%20background%2C%20soft%20light%2C%20thoughtful%20expression%2C%20high%20detail%20photography&width=800&height=800&seq=auteur-farid-01&orientation=squarish',
    photos: [
      'https://readdy.ai/api/search-image?query=Translation%20desk%20with%20open%20dictionaries%20and%20Arabic%20and%20French%20books%20with%20annotations%20in%20the%20margins%2C%20warm%20grey%20background%2C%20soft%20light%2C%20documentary%20photography&width=1200&height=900&seq=auteur-farid-bureau&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Oran%20seafront%20promenade%20with%20pale%20buildings%20and%20the%20sea%20at%20late%20afternoon%2C%20warm%20light%2C%20calm%20atmosphere%2C%20documentary%20photography%2C%20high%20detail%2C%20wide%20view&width=1200&height=900&seq=auteur-farid-oran&orientation=landscape',
    ],
    email: 'farid.belkacem@auteurs.dz',
    phone: '+213 41 33 90 58',
    website: 'belkacem-traduction.dz',
  },
  ...marchesAuteurs,
];