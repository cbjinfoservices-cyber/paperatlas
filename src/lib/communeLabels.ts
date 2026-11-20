import type { Lang } from '@/i18n/dict';
import { nomRegion } from '@/lib/regionLabels';

/**
 * The communes the board writes in its sheets, in the three reading languages.
 * The French spelling stays the canonical key — it is what the data hold and
 * what a search compares — so switching language only changes the label.
 *
 * A commune that carries the name of its region (« Sétif », « Oran »,
 * « Constantine ») is not repeated here: it is read through the region table,
 * which already knows it.
 */
const TABLE = `
Es Sénia|السانيا|Es Senia
Bab Ezzouar|باب الزوار|Bab Ezzouar
Boufarik|بوفاريك|Boufarik
Bougara|بوقرة|Bougara
Alger Centre|الجزائر الوسطى|Algiers Centre
El Bouni|البوني|El Bouni
Hussein Dey|حسين داي|Hussein Dey
El Khroub|الخروب|El Khroub
Draâ Ben Khedda|ذراع بن خدة|Draa Ben Khedda
Hydra|حيدرة|Hydra
Ath Yenni|آث يني|Ath Yenni
El Kantara|القنطرة|El Kantara
Aïn Touta|عين التوتة|Ain Touta
Charguia II|الشرقية الثانية|Charguia II
Nasr City|مدينة نصر|Nasr City
La Marsa|المرسى|La Marsa
Zamalek|الزمالك|Zamalek
Batna Centre|باتنة الوسطى|Batna Centre
Mansourah|المنصورة|Mansourah
Oran Centre|وهران الوسطى|Oran Centre
Sétif Centre|سطيف الوسطى|Setif Centre
Maarif|المعاريف|Maarif
Al Quoz|القوز|Al Quoz
El Manar|المنار|El Manar
Gauthier|غوتييه|Gauthier
Badaro|بدارو|Badaro
Rouiba|الرويبة|Rouiba
Kouba|القبة|Kouba
Bab El Oued|باب الوادي|Bab El Oued
El Harrach|الحراش|El Harrach
Bir Mourad Raïs|بئر مراد رايس|Bir Mourad Rais
Birkhadem|بئر خادم|Birkhadem
El Biar|الأبيار|El Biar
Sidi M'Hamed|سيدي امحمد|Sidi M'Hamed
Dély Ibrahim|دالي إبراهيم|Dely Ibrahim
Ben Aknoun|بن عكنون|Ben Aknoun
Chéraga|الشراقة|Cheraga
Draria|الدرارية|Draria
Baraki|براقي|Baraki
Bordj El Kiffan|برج الكيفان|Bordj El Kiffan
Réghaïa|رغاية|Reghaia
Aïn Benian|عين البنيان|Ain Benian
Zéralda|زرالدة|Zeralda
Bir El Djir|بئر الجير|Bir El Djir
Aïn El Turk|عين الترك|Ain El Turk
Sidi Chami|سيدي الشحمي|Sidi Chami
Arzew|أرزيو|Arzew
Aïn Smara|عين السمارة|Ain Smara
Didouche Mourad|ديدوش مراد|Didouche Mourad
Hamma Bouziane|حامة بوزيان|Hamma Bouziane
El Eulma|العلمة|El Eulma
Aïn Oulmene|عين ولمان|Ain Oulmene
El Hadjar|الحجار|El Hadjar
Sidi Amar|سيدي عمار|Sidi Amar
Blida Centre|البليدة الوسطى|Blida Centre
Ouled Yaïch|أولاد يعيش|Ouled Yaich
Barika|بريكة|Barika
Merouana|مروانة|Merouana
Tlemcen Centre|تلمسان الوسطى|Tlemcen Centre
Chetouane|شتوان|Chetouane
Akbou|أقبو|Akbou
Kherrata|خراطة|Kherrata
Tizi Ouzou Centre|تيزي وزو الوسطى|Tizi Ouzou Centre
Azazga|عزازقة|Azazga
Ghardaïa Centre|غرداية الوسطى|Ghardaia Centre
Metlili|متليلي|Metlili
Ouargla Centre|ورقلة الوسطى|Ouargla Centre
Hassi Messaoud|حاسي مسعود|Hassi Messaoud
Mostaganem Centre|مستغانم الوسطى|Mostaganem Centre
Aïn Tédeles|عين تادلس|Ain Tedeles
Skikda Centre|سكيكدة الوسطى|Skikda Centre
Collo|القليعة|Collo
Azzaba|عزابة|Azzaba
Tunis Centre|تونس الوسطى|Tunis Centre
La Soukra|السكرة|La Soukra
El Menzah|المنزه|El Menzah
Le Bardo|باردو|Le Bardo
Le Kram|الكرم|Le Kram
Carthage|قرطاج|Carthage
Sidi Bou Saïd|سيدي بوسعيد|Sidi Bou Said
Ben Arous|بن عروس|Ben Arous
Hammamet|الحمامات|Hammamet
Sousse Centre|سوسة الوسطى|Sousse Centre
Sfax Centre|صفاقس الوسطى|Sfax Centre
Djerba|جربة|Djerba
Houmt Souk|حومة السوق|Houmt Souk
Zarzis|جرجيس|Zarzis
Beyrouth Centre|بيروت الوسطى|Beirut Centre
Hamra|الحمرا|Hamra
Verdun|فردان|Verdun
Achrafieh|الأشرفية|Achrafieh
Sin el-Fil|سن الفيل|Sin el Fil
Dekwaneh|الدكوانة|Dekwaneh
Bourj Hammoud|برج حمود|Bourj Hammoud
Hazmieh|الحازمية|Hazmieh
Antélias|أنطلياس|Antelias
Jounieh|جونيه|Jounieh
Byblos|جبيل|Byblos
Jbeil|جبيل|Jbeil
Zahlé|زحلة|Zahle
Saïda|صيدا|Saida
Tyr|صور|Tyre
Héliopolis|مصر الجديدة|Heliopolis
Maadi|المعادي|Maadi
Mohandessin|المهندسين|Mohandessin
Dokki|الدقي|Dokki
Garden City|جاردن سيتي|Garden City
Centre-ville du Caire|وسط البلد|Downtown Cairo
Choubra|شبرا|Shubra
Shubra|شبرا|Shubra
Aïn Chams|عين شمس|Ain Shams
Ain Shams|عين شمس|Ain Shams
6 Octobre|٦ أكتوبر|6th of October
Sheikh Zayed|الشيخ زايد|Sheikh Zayed
El Haram|الهرم|El Haram
Fayçal|فيصل|Faisal
Faisal|فيصل|Faisal
Imbaba|إمبابة|Imbaba
Sidi Gaber|سيدي جابر|Sidi Gaber
Smouha|سموحة|Smouha
Montazah|المنتزه|Montazah
Agami|العجمي|Agami
Al Olaya|العليا|Al Olaya
Al Malaz|الملز|Al Malaz
Al Sulaimaniyah|السليمانية|Al Sulaimaniyah
Al Hamra|الحمراء|Al Hamra
Al Rawdah|الروضة|Al Rawdah
Al Nakheel|النخيل|Al Nakheel
Al Aziziyah|العزيزية|Al Aziziyah
Al Chara'i|الشرائع|Al Shara'i
Djeddah|جدة|Jeddah
Jeddah|جدة|Jeddah
Al Balad|البلد|Al Balad
Al Khobar|الخبر|Al Khobar
Dammam|الدمام|Dammam
Médine Centre|المدينة المنورة الوسطى|Medina Centre
`;

type Noms = { ar: string; en: string };

/**
 * A spelling stripped down to what actually tells two names apart: accents
 * dropped, punctuation levelled to a space, case ignored. A user typing
 * « Setif Centre » or « Bab-Ezzouar » must still find the name the board
 * spells « Sétif Centre » or « Bab Ezzouar ».
 */
export function cleDouce(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, ' ')
    .trim()
    .toLowerCase();
}

const NOMS = new Map<string, Noms>();
const NOMS_FLOUS = new Map<string, Noms>();

TABLE.trim().split('\n').forEach((line) => {
  const [fr, ar, en] = line.split('|');
  const key = (fr ?? '').trim();
  if (!key) return;
  const row = { ar: (ar ?? '').trim() || key, en: (en ?? '').trim() || key };
  NOMS.set(key, row);
  NOMS_FLOUS.set(cleDouce(key), row);
});

/**
 * A commune as it is written in the language being read. The exact spelling is
 * tried first, then the accent- and case-free one, and the region table is
 * asked last, so a commune named after its region (« Béjaïa », « Ghardaïa »)
 * is read like the region instead of falling back to the Latin spelling.
 */
export function nomCommune(commune: string | null | undefined, lang: Lang | string): string {
  const key = (commune ?? '').trim();
  if (!key) return '';
  const row = NOMS.get(key) ?? NOMS_FLOUS.get(cleDouce(key));
  if (row) {
    if (lang === 'ar') return row.ar || key;
    if (lang === 'en') return row.en || key;
    return key;
  }
  return nomRegion(key, lang);
}