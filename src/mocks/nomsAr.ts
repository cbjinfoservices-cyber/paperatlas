/**
 * Les noms des fiches de démonstration, écrits en arabe.
 *
 * Les ateliers, les plumes et les vendeurs d'annonces sont des contenus de
 * vitrine : leur nom s'écrit dans la langue du visiteur. Le nom latin reste la
 * clé du dictionnaire — il ne change jamais, et sert aussi à la recherche.
 *
 * Une fiche qui n'a pas encore son nom arabe garde le sien : la table tombe
 * alors sur le latin qu'elle connaissait, au lieu d'afficher un vide.
 */
export const nomsDemoAr: Record<string, string> = {
  /* ---- Imprimeries et ateliers d'Algérie ---- */
  'Imprimerie El Bahia': 'مطبعة البهية',
  'Atelier Reliure Blida': 'ورشة تجليد البليدة',
  'Papeterie Djurdjura': 'قرطاسية جرجرة',
  'Aurès Offset': 'أوراس أوفست',
  'Sérigraphie Mansourah': 'سلك سكرين المنصورة',
  'Atelier Dorure M’Zab': 'ورشة تذهيب مزاب',
  'Signalétique El Bouni': 'لافتات البوني',
  'Imprimerie El Wiam': 'مطبعة الوئام',
  'Façonnage Nedjm': 'تجهيز النجم',
  'Papeterie du Chélif': 'قرطاسية الشلف',
  'Imprimerie Tafat': 'مطبعة تافت',
  'Atelier Annaba Finition': 'ورشة عنابة للتشطيب',
  'Reliure El Andalous': 'تجليد الأندلس',
  'Cartonnage Cirta': 'كرتونة سيرتا',
  'Emballage Djurdjura': 'تغليف جرجرة',

  /* ---- Établissements d'une structure (plan Institutions) ---- */
  'Aurès Offset — siège': 'أوراس أوفست — المقر',
  'Aurès Offset Khenchela': 'أوراس أوفست خنشلة',
  'Aurès Offset Biskra': 'أوراس أوفست بسكرة',
  'Atelier Reliure Aurès': 'ورشة تجليد الأوراس',

  /* ---- Édition et librairie ---- */
  'Éditions Barzakh': 'منشورات برزخ',
  'Éditions Sarraz': 'منشورات سراز',
  'Éditions Rihla': 'منشورات رحلة',
  'Éditions Sahariennes': 'المنشورات الصحراوية',
  'Librairie El Hikma': 'مكتبة الحكمة',
  'Librairie El Wiam': 'مكتبة الوئام',
  'Librairie des Sciences': 'مكتبة العلوم',

  /* ---- Les maisons qui signent les livres des plumes du réseau ---- */
  'Éditions Elyzad': 'منشورات إليزاد',
  'Dar Al Ain': 'دار العين',
  'Dar Al Shorouk': 'دار الشروق',
  'Dar Al Saqi': 'دار الساقي',
  'King Fahd Library': 'مكتبة الملك فهد',
  'Auto-édition': 'نشر ذاتي',

  /* ---- Ateliers du monde arabe ---- */
  'Imprimerie El Manar': 'مطبعة المنار',
  'Reliure Sfax Livre': 'تجليد صفاقس للكتاب',
  'Dar Al Nile Press': 'دار النيل للطباعة',
  'Atelier Gizeh Dorure': 'ورشة الجيزة للتذهيب',
  'Riyadh Print House': 'دار الرياض للطباعة',
  'Maktabat Makkah Papier': 'مكتبة مكة للورق',
  'Selma Trabelsi': 'سلمى الطرابلسي',
  'Hoda Abdelrahman': 'هدى عبد الرحمن',
  'Faisal Al-Harbi': 'فيصل الحربي',

  /* ---- Studios, papeterie, textile ---- */
  'Studio Nour Communication': 'استوديو نور للاتصال',
  'Studio Marsa': 'استوديو مرسى',
  'Studio El Amel Photo': 'استوديو الأمل للتصوير',
  'Papeterie du Sahel': 'قرطاسية الساحل',
  'Atelier Textile Djelfa': 'ورشة النسيج بالجلفة',

  /* ---- Bibliothèques et plumes du réseau ---- */
  'Bibliothèque El Moutanabbi': 'مكتبة المتنبي',
  'Médiathèque Ibn Khaldoun': 'مكتبة ابن خلدون الوسائطية',
  'Bibliothèque Al Qalam': 'مكتبة القلم',
  'Bibliothèque Al Nahda': 'مكتبة النهضة',
  'Bibliothèque El Manar': 'مكتبة المنار',
  'Nadia Belkacem — Atelier de plume': 'نادية بلقاسم — ورشة القلم',
  'Salim Haddad — Plume & scénarios': 'سليم حداد — قلم وسيناريوهات',
  'Yasmine Tounsi — Ateliers d’écriture': 'ياسمين التونسي — ورشات الكتابة',
  'Karim Fikri — Récits de marque': 'كريم فكري — حكايات العلامة',
  'Hala Mansour — Écriture & mémoire': 'هالة منصور — كتابة وذاكرة',

  /* ---- Auteurs ---- */
  'Nadia Bensalem': 'نادية بن سالم',
  'Yacine Aït Kaci': 'ياسين آيت قاسي',
  'Leïla Mansouri': 'ليلى منصوري',
  'Brahim Ould Cheikh': 'براهيم ولد الشيخ',
  'Farid Belkacem': 'فريد بلقاسم',
};