import { wilayas as wilayasDZ } from '@/mocks/wilayas';
import { PAYS_DEFAUT } from '@/lib/pays';

/**
 * The second level of every country the board serves: wilayas in Algeria,
 * governorates, regions or emirates elsewhere. One list per country so the
 * wilaya field always opens on the places that belong to the chosen country.
 */
export const regionsParPays: Record<string, string[]> = {
  /* Algeria keeps its 58 wilayas, read from the same file as before. */
  DZ: wilayasDZ,

  SA: [
    'Riyad', 'La Mecque', 'Médine', 'Al-Qasim', 'Ach-Charqiya', 'Asir', 'Tabuk',
    'Haïl', 'Al-Hudud ach-Chamaliya', 'Jizan', 'Najran', 'Al-Baha', 'Al-Jawf',
  ],

  BH: ['Capitale', 'Muharraq', 'Nord', 'Sud'],

  KM: ['Grande Comore', 'Anjouan', 'Mohéli'],

  DJ: ['Djibouti', 'Ali Sabieh', 'Tadjourah', 'Obock', 'Dikhil', 'Arta'],

  EG: [
    'Le Caire', 'Alexandrie', 'Port-Saïd', 'Suez', 'Damiette', 'Dakahleya',
    'Charqia', 'Qalyubia', 'Kafr el-Cheikh', 'Gharbia', 'Menoufia', 'Beheira',
    'Ismaïlia', 'Gizeh', 'Beni Soueif', 'Fayoum', 'Minya', 'Assiout', 'Sohag',
    'Qena', 'Louxor', 'Assouan', 'Mer Rouge', 'Nouvelle-Vallée', 'Matrouh',
    'Sinaï du Nord', 'Sinaï du Sud',
  ],

  AE: [
    'Abou Dabi', 'Dubaï', 'Charjah', 'Ajman', 'Oumm al-Qaiwain',
    'Ras el-Khaïmah', 'Fujaïrah',
  ],

  IQ: [
    'Bagdad', 'Bassora', 'Ninive', 'Erbil', 'Najaf', 'Karbala', 'Anbar',
    'Diyala', 'Babylone', 'Wasit', 'Salaheddine', 'Dhi Qar', 'Maysan',
    'Muthanna', 'Qadisiyya', 'Kirkouk', 'Soulaïmaniya', 'Halabja',
  ],

  JO: [
    'Amman', 'Irbid', 'Zarqa', 'Balqa', 'Mafraq', 'Karak', 'Jerash', 'Madaba',
    'Ajloun', 'Aqaba', "Ma'an", 'Tafilah',
  ],

  KW: ['Capitale', 'Hawalli', 'Farwaniya', 'Mubarak al-Kabir', 'Ahmadi', 'Jahra'],

  LB: [
    'Beyrouth', 'Mont-Liban', 'Nord', 'Akkar', 'Baalbek-Hermel', 'Békaa',
    'Sud', 'Nabatieh',
  ],

  LY: [
    'Tripoli', 'Benghazi', 'Misrata', 'Zawiya', 'Sabha', 'Al-Baïda', 'Derna',
    'Tobrouk', 'Ajdabiya', 'Khoms', 'Tarhouna', 'Gharyan', 'Zwara', 'Marj',
    'Sirte', 'Jufra', 'Wadi al-Shati', 'Ghat', 'Murzuq', 'Kufra', 'Ubari', 'Nalut',
  ],

  MA: [
    'Tanger-Tétouan-Al Hoceïma', 'Oriental', 'Fès-Meknès', 'Rabat-Salé-Kénitra',
    'Béni Mellal-Khénifra', 'Casablanca-Settat', 'Marrakech-Safi',
    'Drâa-Tafilalet', 'Souss-Massa', 'Guelmim-Oued Noun',
    'Laâyoune-Sakia El Hamra', 'Dakhla-Oued Ed-Dahab',
  ],

  MR: [
    'Nouakchott-Nord', 'Nouakchott-Ouest', 'Nouakchott-Sud', 'Adrar', 'Assaba',
    'Brakna', 'Dakhlet Nouadhibou', 'Gorgol', 'Guidimakha', 'Hodh Ech Chargui',
    'Hodh El Gharbi', 'Inchiri', 'Tagant', 'Tiris Zemmour', 'Trarza',
  ],

  OM: [
    'Mascate', 'Dhofar', 'Moussandam', 'Bouraïmi', 'Dakhiliya', 'Nord Batinah',
    'Sud Batinah', 'Nord Charqiya', 'Sud Charqiya', 'Dhahira', 'Wusta',
  ],

  PS: [
    'Jénine', 'Tubas', 'Tulkarem', 'Naplouse', 'Qalqilya', 'Salfit',
    'Ramallah et Al-Bireh', 'Jéricho', 'Jérusalem', 'Bethléem', 'Hébron',
    'Gaza', 'Nord Gaza', 'Deir el-Balah', 'Khan Younès', 'Rafah',
  ],

  QA: [
    'Doha', 'Al Rayyan', 'Al Wakra', 'Al Khor', 'Al Chamal', 'Al Daayen',
    'Umm Salal', 'Al Shahaniya',
  ],

  SO: [
    'Banaadir', 'Awdal', 'Bakool', 'Bari', 'Bay', 'Galguduud', 'Gedo', 'Hiran',
    'Moyen-Jouba', 'Basse-Jouba', 'Mudug', 'Nugaal', 'Sanaag',
    'Moyen-Chébéli', 'Bas-Chébéli', 'Sool', 'Togdheer', 'Woqooyi Galbeed',
  ],

  SD: [
    'Khartoum', 'Al Qadarif', 'Al Jazirah', 'Nil Bleu', 'Nil Blanc', 'Nord',
    'Nord-Kordofan', 'Sud-Kordofan', 'Kordofan de l’Ouest', 'Darfour du Nord',
    'Darfour du Sud', 'Darfour de l’Est', 'Darfour de l’Ouest', 'Darfour central',
    'Kassala', 'Mer Rouge', 'Sennar',
  ],

  SY: [
    'Alep', 'Damas', 'Rif Dimachq', 'Homs', 'Hama', 'Lattaquié', 'Idleb',
    'Deraa', 'As-Suwayda', 'Tartous', 'Raqqa', 'Deir ez-Zor', 'Hassaké', 'Quneitra',
  ],

  TN: [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
    'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
    'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Médenine',
    'Tataouine', 'Gafsa', 'Tozeur', 'Kébili',
  ],

  YE: [
    'Sanaa', 'Sanaa (gouvernorat)', 'Aden', 'Taïz', 'Hadramaout', 'Hodeïda',
    'Ibb', 'Dhamar', 'Hajjah', 'Saada', 'Amran', 'Al Bayda', 'Al Jawf',
    'Al Mahwit', 'Raymah', 'Shabwah', 'Abyan', 'Lahij', 'Al Mahrah', 'Marib',
    'Socotra', 'Dhale',
  ],
};

/**
 * The regions of a country, always a real list: a profile without a country is
 * an Algerian profile, so the field never opens empty.
 */
export function regionsDe(pays?: string | null): string[] {
  return regionsParPays[pays || PAYS_DEFAUT] ?? regionsParPays[PAYS_DEFAUT] ?? [];
}

/**
 * A region already on a profile stays offered even when it no longer belongs to
 * the list of its country — a row saved before a country was changed must not
 * lose its value silently.
 */
export function regionsWith(pays: string | null | undefined, current?: string | null): string[] {
  const list = regionsDe(pays);
  if (!current || list.includes(current)) return list;
  return [current, ...list];
}