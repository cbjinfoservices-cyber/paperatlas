import type { Dict } from './dict';

/**
 * La phrase d'ouverture propre à chaque pays. Elle ne répète pas ce que le
 * métier fait — c'est le rôle du paragraphe de type —, elle dit où la filière
 * se tient dans ce pays-là : ses pôles, ce qui commande, ce qui tire la
 * demande. Elle ouvre chaque page /annuaire/<type>/<pays>, pour le lecteur
 * comme pour le moteur de recherche, qui y lit un contenu unique.
 */
const fr: Dict = {
  'tradePlace.DZ': 'En Algérie, l’activité se lit d’Alger à Oran : la commande publique et le livre scolaire donnent le rythme, et les autres wilayas travaillent souvent avec ces deux pôles.',
  'tradePlace.SA': 'En Arabie saoudite, Riyad et La Mecque concentrent les donneurs d’ordre, entre ministères, universités et grands groupes privés.',
  'tradePlace.BH': 'À Bahreïn, l’activité travaille à l’échelle de Manama : peu de structures, mais un marché qui achète surtout du fini, du scolaire et du hors-série.',
  'tradePlace.KM': 'Aux Comores, la filière se tient à Moroni et dans les îles, portée par l’école, l’administration et de petites structures familiales.',
  'tradePlace.DJ': 'À Djibouti, la position de port franc pèse plus que la taille du marché : on y travaille pour le pays comme pour le commerce régional.',
  'tradePlace.EG': 'En Égypte, Le Caire et Alexandrie forment un pôle complet : le pays produit pour lui-même et pour une bonne part du monde arabe.',
  'tradePlace.AE': 'Aux Émirats arabes unis, Dubaï et Abou Dabi donnent le ton : un marché d’importation exigeant, habitué au haut de gamme et aux délais courts.',
  'tradePlace.IQ': 'En Irak, Bagdad et Erbil tiennent l’essentiel de l’activité, entre commande publique, universités et reconstruction du marché du livre.',
  'tradePlace.JO': 'En Jordanie, Amman réunit l’offre : un marché compact, très tourné vers l’export et vers les organisations internationales.',
  'tradePlace.KW': 'Au Koweït, l’activité se concentre dans la capitale et à Hawalli, portée par les institutions et les concours scolaires.',
  'tradePlace.LB': 'Au Liban, Beyrouth garde la mémoire du métier : maisons anciennes, savoir-faire de la couleur et un réseau tourné vers l’export.',
  'tradePlace.LY': 'En Libye, Tripoli et Benghazi travaillent chacune pour son arrière-pays, dans un marché que la reconstruction remet en mouvement.',
  'tradePlace.MA': 'Au Maroc, Casablanca et Rabat concentrent la commande, tandis que Marrakech et Tanger tirent la demande touristique et éditoriale.',
  'tradePlace.MR': 'En Mauritanie, Nouakchott rassemble presque tout : un marché jeune, porté par l’école, la presse et les institutions.',
  'tradePlace.OM': 'À Oman, Mascate tient l’offre : un marché soigné, où la commande publique et le livre universitaire pèsent lourd.',
  'tradePlace.PS': 'En Palestine, l’activité se répartit entre Ramallah, Gaza et Hébron : petites structures, forte demande scolaire et institutionnelle.',
  'tradePlace.QA': 'Au Qatar, Doha concentre l’essentiel : un marché de projets, où l’événementiel et les institutions donnent le rythme.',
  'tradePlace.SO': 'En Somalie, Mogadiscio rassemble l’essentiel de l’activité, portée par l’école, la presse et les organisations présentes sur place.',
  'tradePlace.SD': 'Au Soudan, Khartoum reste le grand pôle, complété par les villes du Nil : un marché du livre scolaire et universitaire très large.',
  'tradePlace.SY': 'En Syrie, Damas et Alep gardent un savoir-faire ancien : le métier y travaille autant pour l’intérieur que pour la diaspora.',
  'tradePlace.TN': 'En Tunisie, Tunis et Sfax forment un pôle équilibré : le pays exporte son savoir-faire et travaille pour une bonne part du Maghreb.',
  'tradePlace.YE': 'Au Yémen, Sanaa et Aden portent l’activité, dans un marché fragmenté où l’école et l’humanitaire tiennent une place importante.',
};

const ar: Dict = {
  'tradePlace.DZ': 'في الجزائر تُقرأ الحركة من الجزائر العاصمة إلى وهران: الطلب العمومي والكتاب المدرسي يضبطان الإيقاع، وبقية الولايات تعمل غالبًا مع هذين القطبين.',
  'tradePlace.SA': 'في السعودية تتركّز الجهات الطالبة في الرياض ومكة المكرمة، بين الوزارات والجامعات والمجموعات الخاصة الكبرى.',
  'tradePlace.BH': 'في البحرين يعمل السوق على مقياس المنامة: بنى قليلة، لكن سوقًا يشتري بالخصوص الطباعة الفاخرة والمدرسي والأعداد الخاصة.',
  'tradePlace.KM': 'في جزر القمر تنشط المهنة في موروني وفي الجزر، تحملها المدرسة والإدارة وورشات عائلية صغيرة.',
  'tradePlace.DJ': 'في جيبوتي يزن المرفأ الحر أكثر من حجم السوق: العمل موجّه للبلد وللتجارة الإقليمية.',
  'tradePlace.EG': 'في مصر يشكّل القاهرة والإسكندرية قطبًا كاملًا: البلد ينتج لنفسه ولجزء كبير من العالم العربي.',
  'tradePlace.AE': 'في الإمارات تضع دبي وأبو ظبي النبرة: سوق استيراد صارم، معتاد على الجودة العالية والآجال القصيرة.',
  'tradePlace.IQ': 'في العراق تحمل بغداد وأربيل معظم النشاط، بين الطلب العمومي والجامعات وإعادة بناء سوق الكتاب.',
  'tradePlace.JO': 'في الأردن تجمع عمّان العرض: سوق متماسك، متوجّه بقوة إلى التصدير وإلى المنظمات الدولية.',
  'tradePlace.KW': 'في الكويت يتركّز النشاط في العاصمة وحولي، تحمله المؤسسات والمسابقات المدرسية.',
  'tradePlace.LB': 'في لبنان تحفظ بيروت ذاكرة المهنة: دور عريقة، ومعرفة باللون، وشبكة متوجّهة إلى التصدير.',
  'tradePlace.LY': 'في ليبيا تعمل طرابلس وبنغازي كل واحدة لعمقها، في سوق تعيد الإعمار تحريكه.',
  'tradePlace.MA': 'في المغرب تتركّز الطلبات في الدار البيضاء والرباط، بينما يدفع مراكش وطنجة الطلب السياحي والتحريري.',
  'tradePlace.MR': 'في موريتانيا تجمع نواكشوط كل شيء تقريبًا: سوق شاب، تحمله المدرسة والصحافة والمؤسسات.',
  'tradePlace.OM': 'في عُمان تحمل مسقط العرض: سوق متأنّق، يزن فيه الطلب العمومي والكتاب الجامعي.',
  'tradePlace.PS': 'في فلسطين يتوزّع النشاط بين رام الله وغزة والخليل: بنى صغيرة، وطلب مدرسي ومؤسسي قوي.',
  'tradePlace.QA': 'في قطر تتركّز الحركة في الدوحة: سوق مشاريع، حيث تضع الفعاليات والمؤسسات الإيقاع.',
  'tradePlace.SO': 'في الصومال تجمع مقديشو معظم النشاط، تحمله المدرسة والصحافة والمنظمات الحاضرة.',
  'tradePlace.SD': 'في السودان يبقى الخرطوم القطب الكبير، وتكمله مدن النيل: سوق واسع للكتاب المدرسي والجامعي.',
  'tradePlace.SY': 'في سوريا تحفظ دمشق وحلب معرفة قديمة: المهنة تعمل للداخل وللمهجر أيضًا.',
  'tradePlace.TN': 'في تونس يشكّل تونس وصفاقس قطبًا متوازنًا: البلد يصدّر معرفته ويعمل لجزء كبير من المغرب العربي.',
  'tradePlace.YE': 'في اليمن تحمل صنعاء وعدن النشاط، في سوق مجزّأ تحتل فيه المدرسة والعمل الإنساني مكانة مهمة.',
};

const en: Dict = {
  'tradePlace.DZ': 'Algeria’s activity runs from Algiers to Oran: public contracts and school books set the pace, and the other wilayas often work with these two poles.',
  'tradePlace.SA': 'In Saudi Arabia, Riyadh and Mecca concentrate the buyers — ministries, universities and large private groups.',
  'tradePlace.BH': 'Bahrain works at the scale of Manama: few structures, but a market that buys finishing, school books and special issues.',
  'tradePlace.KM': 'In the Comoros, the trade holds in Moroni and on the islands, carried by schools, the administration and small family workshops.',
  'tradePlace.DJ': 'In Djibouti, the free port weighs more than the market’s size: work serves the country and regional trade.',
  'tradePlace.EG': 'In Egypt, Cairo and Alexandria form a complete pole: the country produces for itself and for much of the Arab world.',
  'tradePlace.AE': 'In the United Arab Emirates, Dubai and Abu Dhabi set the tone: a demanding import market, used to premium quality and short lead times.',
  'tradePlace.IQ': 'In Iraq, Baghdad and Erbil carry most of the activity, between public contracts, universities and a book market rebuilding itself.',
  'tradePlace.JO': 'In Jordan, Amman gathers the offer: a compact market, strongly oriented towards export and international organisations.',
  'tradePlace.KW': 'In Kuwait, activity concentrates in the capital and Hawalli, carried by institutions and school competitions.',
  'tradePlace.LB': 'In Lebanon, Beirut keeps the trade’s memory: old houses, a knowledge of colour and a network turned towards export.',
  'tradePlace.LY': 'In Libya, Tripoli and Benghazi each work for their hinterland, in a market that reconstruction is setting in motion again.',
  'tradePlace.MA': 'In Morocco, Casablanca and Rabat concentrate orders, while Marrakech and Tangier drive tourist and editorial demand.',
  'tradePlace.MR': 'In Mauritania, Nouakchott gathers almost everything: a young market, carried by schools, the press and institutions.',
  'tradePlace.OM': 'In Oman, Muscat holds the offer: a careful market, where public contracts and academic books weigh heavily.',
  'tradePlace.PS': 'In Palestine, activity spreads between Ramallah, Gaza and Hebron: small structures, strong school and institutional demand.',
  'tradePlace.QA': 'In Qatar, Doha concentrates the essentials: a project market, where events and institutions set the pace.',
  'tradePlace.SO': 'In Somalia, Mogadishu gathers most of the activity, carried by schools, the press and the organisations on the ground.',
  'tradePlace.SD': 'In Sudan, Khartoum remains the main pole, completed by the Nile cities: a very broad school and academic book market.',
  'tradePlace.SY': 'In Syria, Damascus and Aleppo keep an old know-how: the trade works for the interior as much as for the diaspora.',
  'tradePlace.TN': 'In Tunisia, Tunis and Sfax form a balanced pole: the country exports its know-how and works for much of the Maghreb.',
  'tradePlace.YE': 'In Yemen, Sanaa and Aden carry the activity, in a fragmented market where schools and humanitarian work hold an important place.',
};

export const tradePlaceDict = { fr, ar, en };