type Local = { fr: string; ar: string; en: string };

export type EmploiDetail = {
  /** Dossier reference quoted by candidates when they apply. */
  ref: string;
  /** ISO date after which the offer is considered closed. */
  validThrough: string;
  experience: Local;
  hours: Local;
  missions: { fr: string[]; ar: string[]; en: string[] };
  profile: Local;
};

export const emploiDetails: Record<string, EmploiDetail> = {
  'job-001': {
    ref: 'EMP-2026-1101',
    validThrough: '2026-12-15',
    experience: { fr: '3 à 5 ans', ar: 'من ٣ إلى ٥ سنوات', en: '3 to 5 years' },
    hours: { fr: '39 h, dimanche au jeudi', ar: '٣٩ ساعة، من الأحد إلى الخميس', en: '39 h, Sunday to Thursday' },
    missions: {
      fr: [
        'Prendre en charge les lancements sur Heidelberg CD 102 en quatre couleurs.',
        'Assurer le calage, la densitométrie et le contrôle des aplats en cours de tirage.',
        'Renseigner la fiche de production et signaler les écarts au chef d’atelier.',
      ],
      ar: [
        'تولي إطلاق الطبعات على هايدلبرغ CD 102 رباعي الألوان.',
        'ضبط التسجيل ومراقبة الكثافة والمساحات الملوّنة أثناء الطباعة.',
        'تعبئة بطاقة الإنتاج وإبلاغ رئيس الورشة بالفوارق.',
      ],
      en: [
        'Take charge of make-readies on a four-colour Heidelberg CD 102.',
        'Handle registration, densitometry and flat-tint control during the run.',
        'Fill in the production sheet and report deviations to the workshop manager.',
      ],
    },
    profile: {
      fr: 'Vous avez au moins trois ans en offset feuille, vous lisez les courbes densitométriques et vous ne validez pas un tirage sans bon à tirer signé.',
      ar: 'لديك ثلاث سنوات على الأقل في الأوفست الورقي، تقرأ منحنيات الكثافة، ولا تعتمد طبعة دون موافقة موقّعة.',
      en: 'You have at least three years on sheet-fed offset, you read densitometry curves and never approve a run without a signed proof.',
    },
  },
  'job-002': {
    ref: 'EMP-2026-1102',
    validThrough: '2026-12-08',
    experience: { fr: '2 ans minimum', ar: 'سنتان على الأقل', en: '2 years minimum' },
    hours: { fr: '39 h, atelier en 2×8', ar: '٣٩ ساعة، ورشة على فترتين', en: '39 h, workshop on two shifts' },
    missions: {
      fr: [
        'Conduire la ligne Bobst dos carré collé et la rogneuse trois lames.',
        'Régler les encollages, contrôler la tenue des cahiers et la coupe finale.',
        'Assurer l’entretien de premier niveau et la propreté du poste.',
      ],
      ar: [
        'تشغيل خط بوبست للتجليد بالظهر الملصوق وآلة القص بثلاث شفرات.',
        'ضبط الغراء ومراقبة تماسك الكراسات والقص النهائي.',
        'ضمان الصيانة الأولية ونظافة المنصب.',
      ],
      en: [
        'Run the Bobst perfect-binding line and the three-knife trimmer.',
        'Set the gluing, check section pull and the final trim.',
        'Carry out first-level maintenance and keep the station clean.',
      ],
    },
    profile: {
      fr: 'Une première expérience en reliure industrielle est attendue. La prime de rendement est trimestrielle et indexée sur le taux de rebut.',
      ar: 'تُتوقع خبرة أولى في التجليد الصناعي. علاوة الإنتاج فصلية ومرتبطة بنسبة الهدر.',
      en: 'Prior experience in industrial binding is expected. The output bonus is quarterly and indexed on the waste rate.',
    },
  },
  'job-003': {
    ref: 'EMP-2026-1103',
    validThrough: '2026-11-30',
    experience: { fr: '2 ans en édition', ar: 'سنتان في النشر', en: '2 years in publishing' },
    hours: { fr: '35 h, télétravail 2 jours', ar: '٣٥ ساعة، عمل عن بعد يومين', en: '35 h, two days remote' },
    missions: {
      fr: [
        'Mettre en page romans et beaux livres sous InDesign, styles et gabarits maison.',
        'Préparer les fichiers pour l’imprimeur : fonds perdus, traits de coupe, profils PDF.',
        'Suivre les épreuves avec les auteurs et corriger les bons à tirer.',
      ],
      ar: [
        'إخراج الروايات والكتب الفنية على InDesign وفق الأنماط والقوالب المعتمدة.',
        'تجهيز الملفات للمطبعة: الهوامش، خطوط القص، وملفات PDF.',
        'متابعة التجارب مع المؤلفين وتصحيح البروفات.',
      ],
      en: [
        'Lay out novels and illustrated books in InDesign, using the house styles and templates.',
        'Prepare print-ready files: bleed, crop marks and the right PDF profile.',
        'Follow proofs with authors and correct the final proofs.',
      ],
    },
    profile: {
      fr: 'Maîtrise d’InDesign et d’Illustrator, sens typographique, et l’envie de travailler sur des textes en français et en arabe.',
      ar: 'إتقان InDesign وIllustrator، حسّ طباعي، والرغبة في العمل على نصوص بالفرنسية والعربية.',
      en: 'Fluent in InDesign and Illustrator, a good typographic eye, and an appetite for working on French and Arabic texts.',
    },
  },
  'job-004': {
    ref: 'EMP-2026-1104',
    validThrough: '2026-12-20',
    experience: { fr: '5 ans en fabrication', ar: '٥ سنوات في الإنتاج', en: '5 years in production' },
    hours: { fr: '40 h, astreinte une semaine sur quatre', ar: '٤٠ ساعة، تناوب أسبوع من كل أربعة', en: '40 h, on call one week in four' },
    missions: {
      fr: [
        'Planifier les lancements et arbitrer les priorités entre ateliers.',
        'Négocier les achats de papier et suivre les façonniers externes.',
        'Tenir les délais, les coûts et le taux de service sur un portefeuille de 40 comptes.',
      ],
      ar: [
        'تخطيط الإنتاج والموازنة بين أولويات الورشات.',
        'التفاوض على شراء الورق ومتابعة وحدات التجهيز الخارجية.',
        'احترام الآجال والتكاليف ونسبة الخدمة على محفظة ٤٠ حسابًا.',
      ],
      en: [
        'Plan production and arbitrate priorities between the workshops.',
        'Negotiate paper purchasing and follow the external finishing partners.',
        'Hold deadlines, costs and service level across a portfolio of 40 accounts.',
      ],
    },
    profile: {
      fr: 'Vous encadrez une équipe d’une dizaine de personnes et vous savez dire non à un lancement qui ne tient pas dans le planning.',
      ar: 'تشرف على فريق من نحو عشرة أشخاص وتعرف كيف ترفض إطلاقًا لا يتسع له الجدول.',
      en: 'You manage a team of about ten and you know how to turn down a job that will not fit the schedule.',
    },
  },
  'job-005': {
    ref: 'EMP-2026-1105',
    validThrough: '2026-12-05',
    experience: { fr: 'Débutant accepté', ar: 'يُقبل المبتدئ', en: 'Beginners welcome' },
    hours: { fr: '39 h, du dimanche au jeudi', ar: '٣٩ ساعة، من الأحد إلى الخميس', en: '39 h, Sunday to Thursday' },
    missions: {
      fr: [
        'Produire les petites séries numériques et les travaux à la demande.',
        'Gérer les consommables, les bacs et le planning de la machine.',
        'Assurer la finition intégrée : coupe, pliage, assemblage.',
      ],
      ar: [
        'إنتاج الكميات الرقمية الصغيرة والأعمال عند الطلب.',
        'إدارة المستلزمات والأدراج وجدول الآلة.',
        'ضمان التجهيز المدمج: القص، الطي، التجميع.',
      ],
      en: [
        'Produce short digital runs and on-demand jobs.',
        'Manage consumables, trays and the machine schedule.',
        'Handle inline finishing: cutting, folding, assembly.',
      ],
    },
    profile: {
      fr: 'Une formation en reprographie ou en arts graphiques est appréciée. La prise de poste est accompagnée pendant deux semaines.',
      ar: 'يُفضّل تكوين في الاستنساخ أو الفنون الطباعية. يخضع الالتحاق بمرافقة أسبوعين.',
      en: 'A background in reprography or graphic arts is a plus. The first two weeks are supervised.',
    },
  },
  'job-006': {
    ref: 'EMP-2026-1106',
    validThrough: '2026-12-18',
    experience: { fr: '3 ans en vente B2B', ar: '٣ سنوات في البيع للمؤسسات', en: '3 years in B2B sales' },
    hours: { fr: '39 h, déplacements régionaux', ar: '٣٩ ساعة، تنقّلات جهوية', en: '39 h, regional travel' },
    missions: {
      fr: [
        'Développer le portefeuille administrations, universités et maisons d’édition sur l’Est.',
        'Construire les devis avec la fabrication et défendre les marges.',
        'Suivre les appels d’offres et les renouvellements de marchés.',
      ],
      ar: [
        'تطوير محفظة الإدارات والجامعات ودور النشر في الشرق.',
        'إعداد العروض مع الإنتاج والدفاع عن هوامش الربح.',
        'متابعة المناقصات وتجديد الصفقات.',
      ],
      en: [
        'Grow the administrations, universities and publishing houses portfolio across the east.',
        'Build quotes with production and defend the margins.',
        'Track tenders and contract renewals.',
      ],
    },
    profile: {
      fr: 'Permis de conduire exigé, véhicule de service fourni. Le variable représente environ un tiers de la rémunération.',
      ar: 'رخصة السياقة مطلوبة، وسيارة الخدمة مقدّمة. يمثّل الجزء المتغيّر نحو ثلث الأجر.',
      en: 'A driving licence is required and a company vehicle is provided. The variable part is about a third of the package.',
    },
  },
  'job-007': {
    ref: 'EMP-2026-1107',
    validThrough: '2026-11-25',
    experience: { fr: 'Stage — étudiant(e)', ar: 'تدريب — طالب/طالبة', en: 'Internship — student' },
    hours: { fr: '30 h, aménageable avec les cours', ar: '٣٠ ساعة، قابلة للتوفيق مع الدراسة', en: '30 h, adjustable around classes' },
    missions: {
      fr: [
        'Relire les épreuves et appliquer les corrections typographiques.',
        'Tenir les plannings de parution et relancer les auteurs.',
        'Préparer les éléments de présentation des nouveautés.',
      ],
      ar: [
        'تدقيق البروفات وتطبيق التصحيحات الطباعية.',
        'متابعة جداول الإصدار وتذكير المؤلفين.',
        'تجهيز عناصر تقديم الإصدارات الجديدة.',
      ],
      en: [
        'Proofread and apply typographic corrections.',
        'Keep publication schedules and chase authors.',
        'Prepare presentation material for new titles.',
      ],
    },
    profile: {
      fr: 'Licence en lettres ou en édition, excellent français écrit, un tuteur dédié pendant les six mois.',
      ar: 'ليسانس في الآداب أو النشر، فرنسية كتابية ممتازة، مع مشرف مخصص طوال الأشهر الستة.',
      en: 'A degree in letters or publishing, excellent written French, and a dedicated mentor for the six months.',
    },
  },
  'job-008': {
    ref: 'EMP-2026-1108',
    validThrough: '2026-12-10',
    experience: { fr: 'Portfolio exigé', ar: 'ملف أعمال مطلوب', en: 'Portfolio required' },
    hours: { fr: 'À la planche, à distance', ar: 'بالصفحة، عن بعد', en: 'Per board, remote' },
    missions: {
      fr: [
        'Illustrer deux albums jeunesse de 32 pages pour la rentrée 2027.',
        'Proposer les recherches de personnages et les planches validées avec la DA.',
        'Livrer les fichiers en couleurs RVB et CMJN selon les gabarits fournis.',
      ],
      ar: [
        'رسم ألبومين للأطفال من ٣٢ صفحة لدخول ٢٠٢٧.',
        'تقديم دراسات الشخصيات واللوحات المعتمدة مع الإدارة الفنية.',
        'تسليم الملفات بصبغتي RVB وCMJN وفق القوالب المقدمة.',
      ],
      en: [
        'Illustrate two 32-page children’s albums for the 2027 season.',
        'Propose character studies and boards approved with the art director.',
        'Deliver files in RGB and CMYK to the supplied templates.',
      ],
    },
    profile: {
      fr: 'Le tarif est à la planche, révisé après la première maquette. Les droits sont cédés pour l’édition imprimée et numérique.',
      ar: 'التسعير باللوحة، ويُراجع بعد النموذج الأول. تُحوَّل الحقوق للنشر الورقي والرقمي.',
      en: 'The rate is per board, reviewed after the first dummy. Rights are assigned for print and digital editions.',
    },
  },
  'job-009': {
    ref: 'EMP-2026-1109',
    validThrough: '2026-11-28',
    experience: { fr: '1 an en façonnage', ar: 'سنة في التجهيز', en: '1 year in finishing' },
    hours: { fr: '39 h, renfort de fin d’année', ar: '٣٩ ساعة، دعم نهاية السنة', en: '39 h, end-of-year cover' },
    missions: {
      fr: [
        'Conduire le massicot Polar, la plieuse et la pelliculeuse.',
        'Contrôler les formats, les plis et la qualité du pelliculage.',
        'Préparer les palettes et les bons de livraison.',
      ],
      ar: [
        'تشغيل مقص بولار وآلة الطي وآلة التغليف الحراري.',
        'مراقبة المقاسات والطيّات وجودة التغليف.',
        'تجهيز المنصات وسندات التسليم.',
      ],
      en: [
        'Run the Polar guillotine, the folder and the laminator.',
        'Check formats, folds and lamination quality.',
        'Prepare pallets and delivery notes.',
      ],
    },
    profile: {
      fr: 'Contrat de six mois pour absorber la charge de fin d’année, avec une vraie possibilité de CDI si le carnet se remplit.',
      ar: 'عقد لستة أشهر لاستيعاب ضغط نهاية السنة، مع إمكانية حقيقية للتثبيت إذا امتلأ دفتر الطلبات.',
      en: 'A six-month contract to absorb the end-of-year peak, with a real chance of a permanent role if the order book fills.',
    },
  },
};