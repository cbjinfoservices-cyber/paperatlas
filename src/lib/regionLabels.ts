import type { Lang } from '@/i18n/dict';

/**
 * Every region the board serves, written in the three reading languages. The
 * French name stays the canonical key — it is what a filter stores, what a link
 * carries and what the data hold — so switching language only changes the label,
 * never the selection underneath.
 */
const TABLE = `
Alger|الجزائر|Algiers
Chlef|الشلف|Chlef
Laghouat|الأغواط|Laghouat
Oum El Bouaghi|أم البواقي|Oum El Bouaghi
Batna|باتنة|Batna
Béjaïa|بجاية|Béjaïa
Biskra|بسكرة|Biskra
Béchar|بشار|Béchar
Blida|البليدة|Blida
Bouira|البويرة|Bouira
Tamanrasset|تمنراست|Tamanrasset
Tébessa|تبسة|Tébessa
Tlemcen|تلمسان|Tlemcen
Tiaret|تيارت|Tiaret
Tizi Ouzou|تيزي وزو|Tizi Ouzou
Djelfa|الجلفة|Djelfa
Jijel|جيجل|Jijel
Sétif|سطيف|Sétif
Saïda|سعيدة|Saïda
Skikda|سكيكدة|Skikda
Sidi Bel Abbès|سيدي بلعباس|Sidi Bel Abbès
Annaba|عنابة|Annaba
Guelma|قالمة|Guelma
Constantine|قسنطينة|Constantine
Médéa|المدية|Médéa
Mostaganem|مستغانم|Mostaganem
M'Sila|المسيلة|M'Sila
Mascara|معسكر|Mascara
Ouargla|ورقلة|Ouargla
Oran|وهران|Oran
El Bayadh|البيض|El Bayadh
Illizi|إليزي|Illizi
Bordj Bou Arréridj|برج بوعريريج|Bordj Bou Arréridj
Boumerdès|بومرداس|Boumerdès
El Tarf|الطارف|El Tarf
Tindouf|تندوف|Tindouf
Tissemsilt|تيسمسيلت|Tissemsilt
El Oued|الوادي|El Oued
Khenchela|خنشلة|Khenchela
Souk Ahras|سوق أهراس|Souk Ahras
Tipaza|تيبازة|Tipaza
Mila|ميلة|Mila
Aïn Defla|عين الدفلى|Aïn Defla
Naâma|النعامة|Naâma
Aïn Témouchent|عين تموشنت|Aïn Témouchent
Ghardaïa|غرداية|Ghardaïa
Relizane|غليزان|Relizane
Timimoun|تيميمون|Timimoun
Bordj Badji Mokhtar|برج باجي مختار|Bordj Badji Mokhtar
Ouled Djellal|أولاد جلال|Ouled Djellal
Béni Abbès|بني عباس|Béni Abbès
In Salah|عين صالح|In Salah
In Guezzam|عين قزام|In Guezzam
Touggourt|تقرت|Touggourt
Djanet|جانت|Djanet
El M'Ghair|المغير|El M'Ghair
El Meniaa|المنيعة|El Meniaa
Riyad|الرياض|Riyadh
La Mecque|مكة المكرمة|Mecca
Médine|المدينة المنورة|Medina
Al-Qasim|القصيم|Al-Qassim
Ach-Charqiya|الشرقية|Eastern Province
Asir|عسير|Asir
Tabuk|تبوك|Tabuk
Haïl|حائل|Ha'il
Al-Hudud ach-Chamaliya|الحدود الشمالية|Northern Borders
Jizan|جازان|Jazan
Najran|نجران|Najran
Al-Baha|الباحة|Al-Baha
Al-Jawf|الجوف|Al-Jawf
Capitale|العاصمة|Capital
Muharraq|المحرق|Muharraq
Nord|الشمال|North
Sud|الجنوب|South
Grande Comore|القمر الكبرى|Grande Comore
Anjouan|أنجوان|Anjouan
Mohéli|موهيلي|Mohéli
Djibouti|جيبوتي|Djibouti
Ali Sabieh|علي صبيح|Ali Sabieh
Tadjourah|تاجورة|Tadjourah
Obock|أوبوك|Obock
Dikhil|دخيل|Dikhil
Arta|عرتا|Arta
Le Caire|القاهرة|Cairo
Alexandrie|الإسكندرية|Alexandria
Port-Saïd|بورسعيد|Port Said
Suez|السويس|Suez
Damiette|دمياط|Damietta
Dakahleya|الدقهلية|Dakahlia
Charqia|الشرقية|Sharqia
Qalyubia|القليوبية|Qalyubia
Kafr el-Cheikh|كفر الشيخ|Kafr El Sheikh
Gharbia|الغربية|Gharbia
Menoufia|المنوفية|Menoufia
Beheira|البحيرة|Beheira
Ismaïlia|الإسماعيلية|Ismailia
Gizeh|الجيزة|Giza
Beni Soueif|بني سويف|Beni Suef
Fayoum|الفيوم|Fayoum
Minya|المنيا|Minya
Assiout|أسيوط|Asyut
Sohag|سوهاج|Sohag
Qena|قنا|Qena
Louxor|الأقصر|Luxor
Assouan|أسوان|Aswan
Mer Rouge|البحر الأحمر|Red Sea
Nouvelle-Vallée|الوادي الجديد|New Valley
Matrouh|مطروح|Matrouh
Sinaï du Nord|شمال سيناء|North Sinai
Sinaï du Sud|جنوب سيناء|South Sinai
Abou Dabi|أبو ظبي|Abu Dhabi
Dubaï|دبي|Dubai
Charjah|الشارقة|Sharjah
Ajman|عجمان|Ajman
Oumm al-Qaiwain|أم القيوين|Umm Al Quwain
Ras el-Khaïmah|رأس الخيمة|Ras Al Khaimah
Fujaïrah|الفجيرة|Fujairah
Bagdad|بغداد|Baghdad
Bassora|البصرة|Basra
Ninive|نينوى|Nineveh
Erbil|أربيل|Erbil
Najaf|النجف|Najaf
Karbala|كربلاء|Karbala
Anbar|الأنبار|Anbar
Diyala|ديالى|Diyala
Babylone|بابل|Babylon
Wasit|واسط|Wasit
Salaheddine|صلاح الدين|Saladin
Dhi Qar|ذي قار|Dhi Qar
Maysan|ميسان|Maysan
Muthanna|المثنى|Muthanna
Qadisiyya|القادسية|Qadisiyyah
Kirkouk|كركوك|Kirkuk
Soulaïmaniya|السليمانية|Sulaymaniyah
Halabja|حلبجة|Halabja
Amman|عمّان|Amman
Irbid|إربد|Irbid
Zarqa|الزرقاء|Zarqa
Balqa|البلقاء|Balqa
Mafraq|المفرق|Mafraq
Karak|الكرك|Karak
Jerash|جرش|Jerash
Madaba|مادبا|Madaba
Ajloun|عجلون|Ajloun
Aqaba|العقبة|Aqaba
Ma'an|معان|Ma'an
Tafilah|الطفيلة|Tafilah
Hawalli|حولي|Hawalli
Farwaniya|الفروانية|Farwaniya
Mubarak al-Kabir|مبارك الكبير|Mubarak Al-Kabeer
Ahmadi|الأحمدي|Ahmadi
Jahra|الجهراء|Jahra
Beyrouth|بيروت|Beirut
Mont-Liban|جبل لبنان|Mount Lebanon
Akkar|عكار|Akkar
Baalbek-Hermel|بعلبك الهرمل|Baalbek-Hermel
Békaa|البقاع|Bekaa
Nabatieh|النبطية|Nabatieh
Tripoli|طرابلس|Tripoli
Benghazi|بنغازي|Benghazi
Misrata|مصراتة|Misrata
Zawiya|الزاوية|Zawiya
Sabha|سبها|Sabha
Al-Baïda|البيضاء|Al-Bayda
Derna|درنة|Derna
Tobrouk|طبرق|Tobruk
Ajdabiya|أجدابيا|Ajdabiya
Khoms|الخمس|Khoms
Tarhouna|ترهونة|Tarhouna
Gharyan|غريان|Gharyan
Zwara|زوارة|Zuwara
Marj|المرج|Marj
Sirte|سرت|Sirte
Jufra|الجفرة|Jufra
Wadi al-Shati|وادي الشاطئ|Wadi al-Shati
Ghat|غات|Ghat
Murzuq|مرزق|Murzuq
Kufra|الكفرة|Kufra
Ubari|أوباري|Ubari
Nalut|نالوت|Nalut
Tanger-Tétouan-Al Hoceïma|طنجة تطوان الحسيمة|Tangier-Tetouan-Al Hoceima
Oriental|الشرق|Oriental
Fès-Meknès|فاس مكناس|Fès-Meknès
Rabat-Salé-Kénitra|الرباط سلا القنيطرة|Rabat-Salé-Kénitra
Béni Mellal-Khénifra|بني ملال خنيفرة|Béni Mellal-Khénifra
Casablanca-Settat|الدار البيضاء سطات|Casablanca-Settat
Marrakech-Safi|مراكش آسفي|Marrakech-Safi
Drâa-Tafilalet|درعة تافيلالت|Drâa-Tafilalet
Souss-Massa|سوس ماسة|Souss-Massa
Guelmim-Oued Noun|كلميم واد نون|Guelmim-Oued Noun
Laâyoune-Sakia El Hamra|العيون الساقية الحمراء|Laayoune-Sakia El Hamra
Dakhla-Oued Ed-Dahab|الداخلة وادي الذهب|Dakhla-Oued Ed-Dahab
Nouakchott-Nord|نواكشوط الشمالية|Nouakchott-North
Nouakchott-Ouest|نواكشوط الغربية|Nouakchott-West
Nouakchott-Sud|نواكشوط الجنوبية|Nouakchott-South
Adrar|أدرار|Adrar
Assaba|العصابة|Assaba
Brakna|البراكنة|Brakna
Dakhlet Nouadhibou|داخلت نواذيبو|Dakhlet Nouadhibou
Gorgol|كوركول|Gorgol
Guidimakha|كيدي ماغا|Guidimakha
Hodh Ech Chargui|الحوض الشرقي|Hodh Ech Chargui
Hodh El Gharbi|الحوض الغربي|Hodh El Gharbi
Inchiri|إنشيري|Inchiri
Tagant|تكانت|Tagant
Tiris Zemmour|تيرس زمور|Tiris Zemmour
Trarza|ترارزة|Trarza
Mascate|مسقط|Muscat
Dhofar|ظفار|Dhofar
Moussandam|مسندم|Musandam
Bouraïmi|البريمي|Al Buraimi
Dakhiliya|الداخلية|Ad Dakhiliyah
Nord Batinah|شمال الباطنة|North Al Batinah
Sud Batinah|جنوب الباطنة|South Al Batinah
Nord Charqiya|شمال الشرقية|North Ash Sharqiyah
Sud Charqiya|جنوب الشرقية|South Ash Sharqiyah
Dhahira|الظاهرة|Ad Dhahirah
Wusta|الوسطى|Al Wusta
Jénine|جنين|Jenin
Tubas|طوباس|Tubas
Tulkarem|طولكرم|Tulkarm
Naplouse|نابلس|Nablus
Qalqilya|قلقيلية|Qalqilya
Salfit|سلفيت|Salfit
Ramallah et Al-Bireh|رام الله والبيرة|Ramallah and Al-Bireh
Jéricho|أريحا|Jericho
Jérusalem|القدس|Jerusalem
Bethléem|بيت لحم|Bethlehem
Hébron|الخليل|Hebron
Gaza|غزة|Gaza
Nord Gaza|شمال غزة|North Gaza
Deir el-Balah|دير البلح|Deir al-Balah
Khan Younès|خان يونس|Khan Younis
Rafah|رفح|Rafah
Doha|الدوحة|Doha
Al Rayyan|الريان|Al Rayyan
Al Wakra|الوكرة|Al Wakrah
Al Khor|الخور|Al Khor
Al Chamal|الشمال|Al Shamal
Al Daayen|الظعاين|Al Daayen
Umm Salal|أم صلال|Umm Salal
Al Shahaniya|الشحانية|Al Shahaniya
Banaadir|بنادر|Banaadir
Awdal|أودال|Awdal
Bakool|باكول|Bakool
Bari|باري|Bari
Bay|باي|Bay
Galguduud|جلجدود|Galguduud
Gedo|جدو|Gedo
Hiran|هيران|Hiran
Moyen-Jouba|جوبا الوسطى|Middle Juba
Basse-Jouba|جوبا السفلى|Lower Juba
Mudug|مدغ|Mudug
Nugaal|نوغال|Nugaal
Sanaag|سناج|Sanaag
Moyen-Chébéli|شبيلي الوسطى|Middle Shabelle
Bas-Chébéli|شبيلي السفلى|Lower Shabelle
Sool|سول|Sool
Togdheer|توغدير|Togdheer
Woqooyi Galbeed|وقويي جالبيد|Woqooyi Galbeed
Khartoum|الخرطوم|Khartoum
Al Qadarif|القضارف|Al Qadarif
Al Jazirah|الجزيرة|Al Jazirah
Nil Bleu|النيل الأزرق|Blue Nile
Nil Blanc|النيل الأبيض|White Nile
Nord-Kordofan|شمال كردفان|North Kordofan
Sud-Kordofan|جنوب كردفان|South Kordofan
Kordofan de l’Ouest|غرب كردفان|West Kordofan
Darfour du Nord|شمال دارفور|North Darfur
Darfour du Sud|جنوب دارفور|South Darfur
Darfour de l’Est|شرق دارفور|East Darfur
Darfour de l’Ouest|غرب دارفور|West Darfur
Darfour central|وسط دارفور|Central Darfur
Kassala|كسلا|Kassala
Sennar|سنار|Sennar
Alep|حلب|Aleppo
Damas|دمشق|Damascus
Rif Dimachq|ريف دمشق|Rif Dimashq
Homs|حمص|Homs
Hama|حماة|Hama
Lattaquié|اللاذقية|Latakia
Idleb|إدلب|Idlib
Deraa|درعا|Daraa
As-Suwayda|السويداء|As-Suwayda
Tartous|طرطوس|Tartus
Raqqa|الرقة|Raqqa
Deir ez-Zor|دير الزور|Deir ez-Zor
Hassaké|الحسكة|Al-Hasakah
Quneitra|القنيطرة|Quneitra
Tunis|تونس|Tunis
Ariana|أريانة|Ariana
Ben Arous|بن عروس|Ben Arous
Manouba|منوبة|Manouba
Nabeul|نابل|Nabeul
Zaghouan|زغوان|Zaghouan
Bizerte|بنزرت|Bizerte
Béja|باجة|Béja
Jendouba|جندوبة|Jendouba
Le Kef|الكاف|Le Kef
Siliana|سليانة|Siliana
Sousse|سوسة|Sousse
Monastir|المنستير|Monastir
Mahdia|المهدية|Mahdia
Sfax|صفاقس|Sfax
Kairouan|القيروان|Kairouan
Kasserine|القصرين|Kasserine
Sidi Bouzid|سيدي بوزيد|Sidi Bouzid
Gabès|قابس|Gabès
Médenine|مدنين|Médenine
Tataouine|تطاوين|Tataouine
Gafsa|قفصة|Gafsa
Tozeur|توزر|Tozeur
Kébili|قبلي|Kébili
Sanaa|صنعاء|Sanaa
Sanaa (gouvernorat)|صنعاء (المحافظة)|Sanaa (governorate)
Aden|عدن|Aden
Taïz|تعز|Taiz
Hadramaout|حضرموت|Hadhramaut
Hodeïda|الحديدة|Al Hudaydah
Ibb|إب|Ibb
Dhamar|ذمار|Dhamar
Hajjah|حجة|Hajjah
Saada|صعدة|Saada
Amran|عمران|Amran
Al Bayda|البيضاء|Al Bayda
Al Mahwit|المحويت|Al Mahwit
Raymah|ريمة|Raymah
Shabwah|شبوة|Shabwah
Abyan|أبين|Abyan
Lahij|لحج|Lahij
Al Mahrah|المهرة|Al Mahrah
Marib|مأرب|Marib
Socotra|سقطرى|Socotra
Dhale|الضالع|Dhale
`;

type Noms = { ar: string; en: string };

const NOMS = new Map<string, Noms>();
const NOMS_FLOUS = new Map<string, Noms>();

/** A spelling with accents, case and punctuation taken out, for a second try. */
function cleDouce(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, ' ')
    .trim()
    .toLowerCase();
}

TABLE.trim().split('\n').forEach((line) => {
  const [fr, ar, en] = line.split('|');
  const key = (fr ?? '').trim();
  if (!key) return;
  const row = { ar: (ar ?? '').trim() || key, en: (en ?? '').trim() || key };
  NOMS.set(key, row);
  NOMS_FLOUS.set(cleDouce(key), row);
});

/** A region as it is written in the language being read. The exact spelling is
 *  tried first, then the one stripped of accents — « Setif » reads like
 *  « Sétif » — so a name typed without its accents is never left in Latin. */
export function nomRegion(region: string | null | undefined, lang: Lang | string): string {
  const key = (region ?? '').trim();
  if (!key) return '';
  const row = NOMS.get(key) ?? NOMS_FLOUS.get(cleDouce(key));
  if (!row) return key;
  if (lang === 'ar') return row.ar || key;
  if (lang === 'en') return row.en || key;
  return key;
}

/**
 * Every spelling of a region: the canonical French one and its two
 * translations. The search reads all three, so « Dubai » finds « Dubaï ».
 */
export function graphiesRegion(region: string): string[] {
  const row = NOMS.get(region) ?? NOMS_FLOUS.get(cleDouce(region));
  if (!row) return [region];
  return [region, row.ar, row.en];
}