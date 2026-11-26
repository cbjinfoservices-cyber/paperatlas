import type { Dict } from './dict';

/** Everything the online subscription quote says: the composer, the figure it
 *  builds, and the request that leaves with it. Kept in its own file so the
 *  pricing copy stays readable. */

const fr: Dict = {
  'dv.stamp': 'Devis d’abonnement',
  'dv.title': 'Composez votre abonnement, lisez le montant avant de l’envoyer',
  'dv.sub': 'Trois réglages suffisent : la durée, le nombre d’établissements et le marché. Le montant de cette durée se recalcule à chaque geste, et la demande part avec lui déjà écrit.',
  'dv.pageTitle': 'Votre devis d’abonnement en ligne',
  'dv.pageLede': 'Composez le besoin, lisez le montant, puis envoyez la demande : un référent la reprend et confirme le devis.',

  'dv.formule': 'Formule',
  'dv.duree': 'Durée',
  'dv.dureeRetenue': 'Durée retenue',
  'dv.dureeMissing': 'Durée non enregistrée',
  'dv.dureeMissingHint': 'Ce dossier a été ouvert avant que la durée retenue soit conservée : elle manque ici, mais le devis reste valable.',
  'dv.lastNoDuree': '{n} sans durée',
  'dv.lastNoDureeHint': 'Dossiers de cette bande ouverts avant que la durée retenue soit conservée : elle n’y est pas écrite, mais chaque devis reste valable.',
  'dv.months': 'mois',
  'dv.perDuree': 'pour la durée',
  'dv.totalDuree': 'Montant de la durée',
  'dv.parMoisDur': 'Soit par mois',
  'dv.prixPlein': 'Au prix du mois, sans la remise',
  'dv.sites': 'Établissements',
  'dv.sitesHint': 'Un compte, plusieurs sites : chaque établissement au-delà du premier est facturé au tarif réduit.',
  'dv.sitesAria': 'Nombre d’établissements',
  'dv.moins': 'Retirer un établissement',
  'dv.plus': 'Ajouter un établissement',
  'dv.marche': 'Marché',
  'dv.rythme': 'Facturation',
  'dv.month': 'Au mois',
  'dv.year': 'À l’année',
  'dv.perMonth': 'par mois',
  'dv.perYear': 'par an',

  'dv.quoteStamp': 'Le montant',
  'dv.quoteTitle': 'Votre devis, ligne par ligne',
  'dv.forfait': 'Forfait',
  'dv.forfaitInclus': 'établissement inclus',
  'dv.forfaitInclusMany': 'établissements inclus',
  'dv.sitesSup': 'Établissements supplémentaires',
  'dv.mensuel': 'Total mensuel',
  'dv.annuel': 'Total annuel',
  'dv.annuelPlain': 'Sans la remise annuelle',
  'dv.saving': 'Vous économisez',
  'dv.free': 'Gratuit',
  'dv.freeNote': 'L’Annuaire reste gratuit, quel que soit le nombre d’établissements.',
  'dv.offre': '20 % de remise',
  'dv.indicative': 'Estimation indicative : le devis est confirmé par un référent avant toute facturation.',
  'dv.parSite': 'Soit par établissement et par mois',
  'dv.fParSite': 'Prix par établissement et par mois',
  'dv.origine': 'soit',

  'dv.requestStamp': 'Envoyer la demande',
  'dv.requestTitle': 'Recevoir ce devis par écrit',
  'dv.name': 'Nom et prénom',
  'dv.namePh': 'Amina Belkacem',
  'dv.email': 'E-mail',
  'dv.emailPh': 'vous@exemple.com',
  'dv.org': 'Structure',
  'dv.orgPh': 'Imprimerie El Manar',
  'dv.phone': 'Téléphone',
  'dv.start': 'Mise en route souhaitée',
  'dv.startHint': 'La date à laquelle l’abonnement devrait démarrer — elle est rappelée sur le récapitulatif imprimé.',
  'dv.msg': 'Précisions',
  'dv.msgPh': 'Sites concernés, échéance souhaitée, contraintes de facturation…',
  'dv.send': 'Demander ce devis',
  'dv.sending': 'Envoi…',
  'dv.reset': 'Composer un autre devis',
  'dv.length': 'caractères',
  'dv.ok': 'La demande est partie avec votre montant. Le récapitulatif du devis vient d’être envoyé à votre adresse.',
  'dv.okNoMail': 'Le devis est enregistré avec le montant ci-dessous. Le récapitulatif n’a pas pu partir par e-mail : conservez la référence, elle suit votre dossier.',
  'dv.okHint': 'Un référent reprend la demande et confirme le montant avant toute facturation.',
  'dv.ref': 'Référence',
  'dv.errName': 'Un nom et un e-mail sont nécessaires pour répondre à la demande.',
  'dv.errLong': 'Le message dépasse 500 caractères.',
  'dv.errSend': 'La demande n’a pas pu partir. Réessayez dans un instant.',
  'dv.errNet': 'Connexion impossible. Vérifiez votre réseau, puis réessayez.',
  'dv.required': 'Champ nécessaire',

  'dv.ctaCard': 'Demander un devis',
  'dv.ctaCardTip': 'Composer le devis d’une structure, montant affiché avant l’envoi',
  'dv.toComposer': 'Composer le devis',
  'dv.acctTitle': 'Devis d’abonnement',
  'dv.acctSub': 'Ajoutez des établissements ou changez de formule : le montant se recalcule ici, avant l’envoi.',
  'dv.errCompte': 'Le devis ne se calcule pas pour le moment.',

  'dv.listTitle': 'Devis envoyés',
  'dv.listSub': 'Chaque devis composé avec ce compte, son montant et son état — le récapitulatif part aussi par e-mail.',
  'dv.listEmpty': 'Aucun devis envoyé pour le moment. Composez-en un juste au-dessus : il apparaîtra ici avec sa référence.',
  'dv.listError': 'Les devis envoyés ne se chargent pas pour le moment.',
  'dv.listRetry': 'Réessayer',
  'dv.listLoading': 'Chargement des devis…',
  'dv.listCount': 'devis envoyés',
  /* Le compte des dossiers qui circulent déjà, à côté de celui des devis. */
  'dv.listSharedCount': 'déjà partagés',
  'dv.listSharedHint': 'Dossiers de cette liste déjà transmis à un collègue par leur adresse — hors dossiers rendus, comptés à part',
  /* Le jour du partage le plus récent, à côté du compteur de l’en-tête. */
  'dv.listSharedLast': 'dernier le {date}',
  /* La pastille « rétablies » de l’en-tête, juste à côté de celle des partages. */
  'dv.listRestoredCount': 'rétablies',
  'dv.listRestoredHint': 'Dossiers de cette liste revenus après un retrait — cliquez pour ne voir qu’eux',
  /* Au-delà d’une dizaine de dossiers rendus, la pastille se replie : elle ouvre
     la liste des retours, et le reste attend derrière son propre « Voir tout ». */
  'dv.listRestoredFoldHint': 'Ouvrir les dossiers rendus, un par un — au-delà de dix, la liste se replie',
  /* La pastille des dossiers rendus se partage comme celle des partages de la
     bande des Offres : un clic, et le collègue ouvre ces mêmes lignes. */
  'dv.listRestoredCopy': 'Copier le lien des dossiers rendus',
  'dv.listRestoredCopyHint': 'Copier l’adresse de la liste ouverte sur les dossiers revenus après un retrait',
  'dv.listSites': 'établissements',
  'dv.listSentOn': 'Envoyé le',
  'dv.listCompose': 'Composer un devis',
  'dv.listNote': 'L’état est mis à jour par le référent qui suit le dossier.',
  'dv.listKey': 'Flèches haut et bas pour choisir un devis · Entrée ouvre sa page de suivi · Échap rend la liste au repos.',
  'dv.keyWalk': '{n} devis parcourus au clavier',
  'dv.keyWalkOpen': 'Rouvrir le dernier devis mis en avant : {ref}',
  'dv.keyOpened': '{n} dossiers ouverts depuis la fiche rouverte',
  'dv.keyOpenedHint': 'Compte les dossiers ouverts depuis que la fiche {ref} a été rappelée au clavier : chaque dossier compte une fois, même s’il est rouvert.',
  'dv.keyOpenedCopy': 'Copier ce compte',
  'dv.keyOpenedCopyHint': 'Copier la fiche rappelée {ref} et les dossiers ouverts depuis, un par ligne, en texte prêt à coller dans un message.',
  'dv.keyOpenedCopyHead': 'Fiche rappelée {ref} — {n} dossiers ouverts depuis :',
  'dv.sumTitle': 'Vos devis en un coup d’œil',
  'dv.sumReceived': 'devis reçus',
  'dv.sumReview': 'en étude',
  'dv.sumConfirmed': 'confirmés',
  'dv.sumExpired': 'expirés',
  'dv.sumLate': 'en retard',
  'dv.sumLateHint': 'Devis reçus sans réponse depuis sept jours — cliquez pour ne voir qu’eux',
  'dv.sumNever': 'jamais repris',
  'dv.sumNeverHint': 'Devis qu’aucun récapitulatif groupé n’a encore repris — cliquez pour ne voir qu’eux et ouvrir l’envoi groupé de ceux qui sont en retard',
  'dv.sumBulkOnly': 'Voir seulement les devis déjà repris dans un groupé',
  'dv.sumBulkOnlyOff': 'Revenir à tous les devis',
  'dv.sumBulkOnlyHint': 'Ne garde que les devis déjà partis dans un récapitulatif groupé',
  'dv.sumGroup': 'déjà repris',
  'dv.sumGroupHint': 'Devis déjà partis dans un récapitulatif groupé — cliquez pour ne voir qu’eux',
  'dv.sumBulkNone': 'Aucun devis de cette lecture n’est encore parti dans un groupé.',
  'dv.sumBulkNeverOnly': 'Voir seulement les devis jamais repris dans un groupé',
  'dv.sumBulkNeverOnlyOff': 'Revenir aux devis jamais repris',
  'dv.sumBulkNeverOnlyHint': 'Ne garde que les devis qu’aucun récapitulatif groupé n’a encore repris — et ouvre l’envoi groupé de ceux qui sont en retard',
  'dv.sumBulkNeverNone': 'Tous les devis de cette lecture sont déjà partis dans un groupé.',
  'dv.sumBulkNeverBulk': 'Ces devis n’ont jamais été repris dans un groupé : l’envoi groupé en coche {n}.',
  'dv.sumLastBulk': 'Dernier récapitulatif groupé le {date} — {n} devis',
  'dv.sumLastBulkHint': 'Le dernier envoi groupé qui reprenait des devis de cette liste',
  'dv.st.recu': 'Reçu',
  'dv.st.en_etude': 'En étude',
  'dv.st.confirme': 'Confirmé',
  'dv.st.expire': 'Expiré',
  'dv.filterAll': 'Tous',
  'dv.filterAria': 'Filtrer les devis par état',
  'dv.filterNone': 'Aucun devis dans cet état pour le moment. Choisissez « Tous » pour revoir la liste entière.',
  'dv.filterLate': 'En retard',
  'dv.filterLateHint': 'Devis reçus sans réponse depuis sept jours',
  'dv.filterLateNone': 'Aucun devis en retard : tout ce qui a été reçu a eu sa réponse, ou a déjà été tranché.',
  'dv.filterLateOff': 'Revoir tous les devis',
  /* Une sixième pastille : les dossiers déjà confiés à un collègue. */
  'dv.filterShared': 'Déjà partagés',
  'dv.filterSharedHint': 'Ne garder que les dossiers déjà transmis à un collègue',
  'dv.filterSharedNone': 'Aucun dossier de cette lecture n’a encore été transmis à un collègue.',
  'dv.filterSharedOff': 'Revoir tous les devis',
  /* Une septième pastille, à côté des dossiers partagés : ceux qui ont été
     rétablis après un retrait, pour ne voir que ce qui est vraiment revenu. */
  'dv.filterRestored': 'Rétablies',
  'dv.filterRestoredHint': 'Ne garder que les dossiers dont la marque a été rétablie après un retrait',
  'dv.filterRestoredNone': 'Aucun dossier de cette lecture n’a encore été rétabli.',
  'dv.filterRestoredOff': 'Revoir tous les devis',
  /* La huitième pastille, à la suite des deux autres lectures : les dossiers
     munis de leur adresse mais jamais transmis — ni partagés, ni rendus. */
  'dv.filterAddressed': 'Seulement adressés',
  'dv.filterAddressedHint': 'Ne garder que les dossiers munis de leur adresse mais jamais transmis à un collègue, hors dossiers partagés et rendus',
  'dv.filterAddressedNone': 'Aucun dossier de cette lecture n’est seulement adressé : tous ont circulé ou sont revenus.',
  'dv.filterAddressedOff': 'Revoir tous les devis',
  /* La pastille des dossiers qui dorment : seulement adressés, et jamais
     transmis depuis plus d’une semaine. */
  'dv.filterDormant': 'Endormis',
  'dv.filterDormantHint': 'Ne garder que les dossiers seulement adressés depuis plus de sept jours — jamais transmis, jamais revenus',
  'dv.filterDormantNone': 'Aucun dossier ne dort : aucun dossier seulement adressé n’attend depuis plus de sept jours.',
  'dv.filterDormantOff': 'Revoir tous les devis',
  /* La pastille des endormis dont le devis est déjà confirmé : parmi ceux qui
     dorment, ceux qui attendent pour rien — le devis est prêt. */
  'dv.filterDormantConfirmed': 'Endormis confirmés',
  'dv.filterDormantConfirmedHint': 'Ne garder que les dossiers qui dorment alors que leur devis est déjà confirmé — le devis est prêt, il n’a jamais circulé',
  'dv.filterDormantConfirmedNone': 'Aucun dossier endormi n’a de devis confirmé : rien ne dort avec un devis déjà tranché.',
  'dv.filterDormantConfirmedOff': 'Revoir tous les devis',
  /* La pastille des dossiers sans durée : ceux ouverts avant que la durée
     retenue soit conservée. Un clic les garde seuls, comme les autres
     lectures de la liste. */
  'dv.filterNoDuree': 'Sans durée',
  'dv.filterNoDureeHint': 'Ne garder que les dossiers dont la durée n’a pas été enregistrée — ouverts avant que la durée retenue soit conservée, le devis reste valable',
  'dv.filterNoDureeNone': 'Aucun dossier de cette lecture n’a de durée manquante : tous portent leur durée retenue.',
  'dv.filterNoDureeOff': 'Revoir tous les devis',
  /* La même lecture arrive par une adresse partagée : la ligne nomme ce que le
     collègue a sous les yeux. */
  'dv.sharedNoDureeNote': 'Lien partagé : lecture « Sans durée » — {n} dossiers affichés',
  /* Le compteur des durées héritées, dans la bande des Offres : les dossiers
     dont la durée ne correspond pas à celle retenue sur cet appareil. */
  'dv.lastRythmeDiff': '{n} durées héritées',
  'dv.lastRythmeDiffHint': 'Dossiers de ce rappel dont la durée ne correspond pas au rythme retenu sur cet appareil ({duree}) — leur durée vient d’un réglage plus ancien',
  /* Le compteur « sans durée » de la bande est aussi une porte : un clic ouvre
     la liste réduite à ces seuls dossiers. */
  'dv.lastNoDureeFilterHint': 'Ouvrir la liste réduite aux dossiers dont la durée manque — ceux ouverts avant que la durée retenue soit conservée',
  /* La lecture « sans durée » se copie depuis la bande : le compte, puis chaque
     dossier avec son adresse, prêt à coller dans un message. */
  'dv.lastNoDureeCopy': 'Copier cette lecture',
  'dv.lastNoDureeCopyHint': 'Copie le compte des dossiers sans durée et l’adresse de chacun, prêts à coller dans un message à un collègue.',
  'dv.lastNoDureeCopyLead': 'Dossiers sans durée : {n} sur {total}',
  'dv.lastNoDureeCopyRow': '{ref} — {lien}',
  'dv.lastNoDureeCopyNote': 'Ces dossiers ont été ouverts avant que la durée retenue soit conservée : elle n’y est pas écrite, mais chaque devis reste valable. Chaque ligne porte l’adresse de son dossier.',
  /* La lecture exacte : le jeton « héritée · 6 mois » d’une ligne ouvre la
     liste réduite aux dossiers écrits sur cette durée-là. */
  'dv.filterDureeExact': 'Durée · {n} mois',
  'dv.filterDureeExactHint': 'Ne garder que les dossiers écrits sur cette durée-là — {n} mois, telle qu’elle est écrite dans le dossier',
  'dv.filterDureeExactNone': 'Aucun dossier de cette lecture n’est écrit sur {n} mois.',
  'dv.filterDureeExactOff': 'Revoir tous les devis',
  'dv.sharedDureeNote': 'Lien partagé : lecture « Durée · {n} mois » — {m} dossiers affichés',
  /* Le jeton d’une ligne est une porte : sa bulle dit où il mène. */
  'dv.rowRythmeHeriteDoorHint': 'Ouvrir la liste réduite aux dossiers écrits sur cette durée-là — {n} mois',
  /* La lecture des durées héritées se copie depuis son compteur, comme celle
     des dossiers sans durée : le compte, puis le rythme exact de chaque ligne. */
  'dv.lastRythmeDiffCopy': 'Copier cette lecture',
  'dv.lastRythmeDiffCopyHint': 'Copie le compte des durées héritées, puis chaque dossier avec le nombre de mois qui l’a produit et l’adresse qui l’ouvre, prêts à coller dans un message à un collègue.',
  'dv.lastRythmeDiffCopyLead': 'Durées héritées : {n} sur {total}',
  'dv.lastRythmeDiffCopyRow': '{ref} · {mois} mois — {lien}',
  'dv.lastRythmeDiffCopyNote': 'Ces dossiers portent une durée qui ne correspond plus au rythme retenu sur cet appareil ({duree}) : elle vient d’un réglage plus ancien. Chaque ligne porte le nombre de mois écrit à l’envoi et l’adresse de son dossier.',
  /* Le compteur des durées héritées est une porte à son tour : un clic ouvre la
     liste réduite à ces seuls dossiers. */
  'dv.lastRythmeDiffFilterHint': 'Ouvrir la liste réduite aux dossiers dont la durée vient d’un réglage plus ancien — ceux qui ne correspondent pas au rythme retenu sur cet appareil',
  'dv.filterRythme': 'Durées héritées',
  'dv.filterRythmeHint': 'Ne garder que les dossiers dont la durée ne correspond pas au rythme retenu sur cet appareil — elle vient d’un réglage plus ancien',
  'dv.filterRythmeNone': 'Aucun dossier de cette lecture n’a de durée héritée : toutes correspondent au rythme retenu sur cet appareil.',
  'dv.filterRythmeOff': 'Revoir tous les devis',
  'dv.sharedRythmeNote': 'Lien partagé : lecture « Durées héritées » — {n} dossiers affichés',
  /* Le rythme exact qui a produit la durée, sur la ligne du dossier : le
     nombre de mois écrit au moment de l’envoi, et le rythme que l’appareil
     retient aujourd’hui — la ligne dit d’où vient l’écart. */
  'dv.rowRythmeHerite': 'héritée · {n} mois',
  'dv.rowRythmeHeriteHint': 'Cette durée a été écrite pour {n} mois, alors que cet appareil retient aujourd’hui {duree} ({m} mois) — elle vient d’un réglage plus ancien.',
  /* L’ordre de lecture « partagé récemment » : un tri, pas un filtre. */
  'dv.sortRecent': 'Partagé récemment',
  'dv.sortRecentHint': 'Remonter les dossiers qui viennent de circuler, du partage le plus récent au plus ancien',
  /* L’ordre « ouverture récente » : les dossiers consultés en dernier d’abord. */
  'dv.sortOpened': 'Ouverture récente',
  'dv.sortOpenedHint': 'Remonter les dossiers consultés en dernier, du plus récent au plus ancien — les dossiers jamais ouverts gardent leur place à la suite',
  'dv.sortOpenedCopy': 'Copier cet ordre',
  'dv.sortOpenedCopyHint': 'Copie les dossiers dans l’ordre « ouverture récente », chacun avec sa date de visite, en texte prêt à coller dans un message.',
  'dv.sortOpenedCopyHead': 'Ouverture récente · {n} dossiers :',
  'dv.sortOpenedCopyNever': 'jamais ouvert',

  'dv.resend': 'Renvoyer le récapitulatif',
  'dv.resending': 'Envoi…',
  'dv.resendOk': 'Le récapitulatif vient de repartir à votre adresse.',
  'dv.resendErr': 'L’envoi n’a pas pu partir. Réessayez dans un instant.',
  'dv.follow': 'Suivre ce dossier',
  'dv.followHint': 'Ouvrir la page de suivi avec cette référence déjà remplie',
  'dv.relanceOn': 'Rappel envoyé le',
  'dv.recapGroupOn': 'Récapitulatif groupé le',
  'dv.recapGroupHint': 'Dernier envoi groupé qui reprenait ce devis',
  'dv.recapGroupCol': 'Récapitulatif groupé le',
  /* Une colonne de plus dans le classeur : l'adresse de chaque dossier, pour
     rouvrir une ligne seule depuis la feuille. */
  'dv.csvLinkCol': 'Adresse du dossier',
  /* Une colonne de plus dans l’onglet « Devis » : ce que chaque dossier est
     devenu — partagé, rendu après un retrait, ou seulement adressé. */
  'dv.csvShareStateCol': 'Situation du dossier',
  'dv.csvShareStateShared': 'Partagé à un collègue',
  'dv.csvShareStateRestored': 'Rendu après un retrait',
  'dv.csvShareStateAddressed': 'Seulement adressé',
  /* Le dossier déjà transmis à un collègue porte cette marque après son
     adresse. Elle nomme le partage du lot entier, pour que personne ne prenne
     cette date pour celle de ce seul dossier. */
  'dv.csvSharedMark': 'dernier partage du lot : {date}',
  /* Une colonne de plus : la trace des marques retirées, pour qu'une feuille
     relue plus tard dise encore qu'un dossier a circulé. */
  'dv.csvForgotCol': 'Ligne oubliée',
  'dv.csvForgotMark': 'marque retirée le {date} · partagé le {shared}',
  /* Le pendant de la colonne des retraits : le jour où la marque est revenue,
     avec le jour où le dossier avait été partagé. */
  'dv.csvRestoredMark': 'marque rétablie le {date} · partagé le {shared}',
  /* La pastille de la ligne : le dossier circule déjà, sans ouvrir le classeur. */
  'dv.rowSharedOn': 'partagé le {date}',
  'dv.rowSharedHint': 'Ce dossier a déjà été transmis à un collègue par son adresse',
  /* Le pendant de la pastille du partage : un dossier revenu après un retrait
     dit, sur sa propre ligne, le jour de son retour. */
  'dv.rowRestoredOn': 'rendu le {date}',
  'dv.rowRestoredHint': 'Ce dossier est revenu après un retrait — le jour de son retour est écrit dans le classeur, dossier par dossier',
  /* La dernière visite du dossier, à voix basse sur sa ligne : le tri
     « ouverture récente » se vérifie sans ouvrir le dossier. */
  'dv.rowOpenedOn': 'ouvert le {date}',
  'dv.rowOpenedHint': 'La dernière fois que ce dossier a été consulté — la même date que le tri « ouverture récente »',
  /* Une seule porte pour effacer ces marques, compte par compte. */
  'dv.forgetShares': 'Oublier les partages',
  'dv.forgetSharesHint': 'Effacer les marques de partage de ce compte, sans toucher au reste des réglages',
  'dv.forgetSharesText': 'Effacer les {n} marques de partage de ce compte ? Les adresses des dossiers restent intactes : seules les pastilles « partagé le … » disparaissent. Le classeur en garde la trace, avec le jour de chaque retrait.',
  'dv.forgetSharesYes': 'Oublier ces marques',
  'dv.forgetSharesNo': 'Annuler',
  'dv.forgetSharesOk': 'Les marques de partage de ce compte sont effacées.',
  /* Effacer la marque d’un seul dossier, depuis sa propre ligne. */
  'dv.rowForgetShare': 'Oublier',
  'dv.rowForgetShareHint': 'Effacer la marque de partage de ce dossier, sans toucher aux autres',
  'dv.rowForgetShareOk': 'La marque de partage de ce dossier est effacée.',
  /* Remettre une marque effacée, avec son jour de partage d’origine. */
  'dv.rowRestoreShare': 'Rétablir',
  'dv.rowRestoreShareHint': 'Remettre la marque de ce dossier, avec le jour où il avait été partagé',
  'dv.rowRestoreShareOk': 'La marque de partage de ce dossier est rétablie, avec son jour d’origine.',
  'dv.restoreShares': 'Rétablir {n} marques',
  'dv.restoreSharesHint': 'Remettre les marques effacées, chacune avec le jour où son dossier avait été partagé',
  /* La ventilation de la synthèse en trois situations qui s'additionnent au
     total : partagé, rendu, seulement adressé. */
  'dv.csvSynthSituation': 'Situation des dossiers',
  'dv.csvSynthSituationTotal': 'Total des situations',
  /* La synthèse dit, à côté du total, combien de dossiers circulent déjà. */
  'dv.csvSynthShared': 'dont déjà partagés à un collègue (hors dossiers rendus)',
  /* Parmi ces dossiers qui circulent, ceux dont le devis est confirmé. */
  'dv.csvSynthSharedConfirmed': 'dont devis confirmés et déjà partagés',
  /* La face opposée du même compte : les confirmés qu'aucune adresse n'a encore
     portés, donc ce qui reste à confier à un collègue. */
  'dv.csvSynthConfirmedToShare': 'dont devis confirmés restant à partager',
  /* Le jour du partage le plus récent du lot exporté, nommé dans la synthèse. */
  'dv.csvSynthLastShare': 'Dernier partage du lot exporté',
  /* Le lien de retour de la Synthèse : la feuille rouvre la liste réduite aux
     dossiers rendus, sans que le lecteur ait à refaire les filtres. */
  'dv.csvRestoredList': 'Ouvrir la liste réduite aux dossiers rendus',
  /* Les deux gestes sur les marques, côte à côte dans la synthèse. */
  'dv.csvSynthForgot': 'dont marques retirées',
  'dv.csvSynthRestored': 'dont dossiers rendus après un retrait',
  /* La feuille ne se contente pas de compter : elle nomme les marques
     retirées, une ligne par dossier, avec leurs deux jours. */
  'dv.csvSynthForgotRefs': 'Marques retirées, dossier par dossier ({n})',
  'dv.csvSharedOnCol': 'Partagé le',
  'dv.csvForgotOnCol': 'Marque retirée le',
  /* La feuille nomme aussi les marques rétablies, avec le jour de leur retour. */
  'dv.csvSynthRestoredRefs': 'Marques rétablies, dossier par dossier ({n})',
  'dv.csvRestoredOnCol': 'Marque rétablie le',
  /* Le délai écoulé depuis chaque rétablissement, dans la même ligne : à côté
     du jour du retour, la feuille dit aussi combien de temps il porte. */
  'dv.csvRestoredAgoCol': 'Délai depuis le retour',
  'dv.csvRestoredAgo': 'depuis {n} j',
  /* Replier la bulle de l’en-tête quand les marques dépassent quelques lignes. */
  'dv.markSeeAll': 'Voir tout ({n})',
  'dv.markSeeLess': 'Réduire',
  /* La Synthèse compare les deux gestes du lot sur une seule ligne : ce qui a
     été retiré, ce qui est revenu, et ce qui reste encore à rendre. */
  'dv.sumMarksCompare': '{n} marques retirées · {r} rétablies — {k} restent à rendre',
  'dv.sumMarksCompareHint': 'Ce que le lot a retiré, ce qu’il a rendu, et ce qui attend encore d’être rétabli',
  /* Le jour du dernier rétablissement, posé à côté de la ligne de comparaison :
     le geste se date sans ouvrir le classeur. */
  'dv.sumMarksRestoredOn': 'dernier rétablissement le {date}',
  /* La date est une porte : un clic ouvre la bulle sur les dossiers rendus,
     chacun avec son jour de retour et le délai écoulé depuis. */
  'dv.sumMarksRestoredHint': 'Ouvrir les dossiers rendus, chacun avec le jour de son retour',
  'dv.sumMarksRestoredHead': '{n} marques rétablies, dossier par dossier',
  'dv.lastRestoredOn': 'rétablie le {date}',
  'dv.lastRestoredAgo': 'depuis {n} j',
  /* La Synthèse du classeur date le dernier retour, comme l’écran. */
  'dv.csvSynthLastRestored': 'Dernier rétablissement du lot exporté',
  'dv.lastBulkTitle': 'Devis sans réponse depuis sept jours',
  'dv.lastBulkText': '{n} devis attendent votre réponse. Un seul e-mail les reprend tous, avec leur référence et leur montant.',
  'dv.lastBulkSend': 'Envoyer le récapitulatif groupé',
  'dv.lastBulkSending': 'Envoi…',
  'dv.lastBulkOk': 'Récapitulatif groupé de {n} devis envoyé à votre adresse.',
  'dv.lastBulkErr': 'L’envoi groupé n’a pas pu partir. Réessayez dans un instant.',
  'dv.lastBulkResend': 'Renvoyer le récapitulatif',
  'dv.lastBulkRecent': 'Déjà parti le {date} — ce nouvel envoi le remplacera.',
  'dv.lastBulkNever': '{n} de ces devis n’ont jamais été repris dans un groupé.',
  /* La face opposée du même compteur : ceux qu’un groupé a déjà emportés. */
  'dv.lastBulkGroup': '{n} de ces devis sont déjà partis dans un groupé.',
  'dv.lastBulkNeverSee': 'Voir les devis jamais repris dans un groupé',
  'dv.lastGroupSee': 'Voir les devis déjà repris dans un groupé',
  'dv.shareCta': 'Copier le lien',
  'dv.shareHint': 'Copier l’adresse de cette lecture, à envoyer à un collègue',
  /* Un lien partagé arrive avec sa lecture : la ligne dit combien de devis le
     collègue a sous les yeux, pour qu’il sache ce qu’il regarde. */
  'dv.sharedNote': 'Lien partagé : {n} devis affichés dans cette lecture',
  'dv.sharedNoteOff': 'Masquer ce rappel',
  /* Un seul dossier confié à un collègue : la ligne dit le devis et le partage. */
  'dv.sharedRefNote': 'Lien partagé : un seul devis affiché, {ref}',
  'dv.sharedRefNone': 'Ce lien désignait le devis {ref}, qui n’est pas dans cette liste.',
  'dv.sharedRefSeeAll': 'Revoir toute la liste',
  /* La lecture « déjà partagés » arrive avec le lien : la ligne nomme la lecture. */
  'dv.sharedSharedNote': 'Lien partagé : lecture « Déjà partagés » — {n} dossiers affichés',
  /* La lecture « seulement adressés » arrive avec son lien, comme les deux
     autres : la ligne nomme ce que le collègue a sous les yeux. */
  'dv.sharedAddressedNote': 'Lien partagé : lecture « Seulement adressés » — {n} dossiers affichés',
  /* La lecture des dossiers endormis arrive avec son adresse, comme les trois
     autres : la ligne nomme ce que le collègue a sous les yeux. */
  'dv.sharedDormantNote': 'Lien partagé : lecture « Endormis » — {n} dossiers affichés',
  /* La lecture des endormis confirmés arrive avec son adresse, comme les
     quatre autres : la ligne nomme ce que le collègue a sous les yeux. */
  'dv.sharedDormantConfirmedNote': 'Lien partagé : lecture « Endormis confirmés » — {n} dossiers affichés',
  /* L'onglet « Devis » du classeur se lit du retour le plus récent au plus
     ancien : la Synthèse le dit, pour qu'une feuille relue plus tard sache
     dans quel ordre ses lignes sont écrites. */
  'dv.csvSortNote': 'Onglet « Devis » : les dossiers rendus d’abord, du retour le plus récent au plus ancien, puis les autres dans l’ordre de la liste',
  'dv.rowShare': 'Copier le lien',
  'dv.rowShareHint': 'Copier l’adresse de cette lecture réduite au devis {ref}, à envoyer à un collègue',
  /* Un seul dossier copié depuis sa ligne rendue : son adresse de suivi. */
  'dv.rowCopyFollow': 'Copier le lien',
  'dv.rowCopyFollowHint': 'Copier l’adresse de suivi du dossier {ref}, à envoyer à un collègue',
  /* La bande des Offres se partage comme la liste : la face « jamais repris »
     s’envoie d’un clic, sans que le collègue ait à refaire les filtres. */
  'dv.lastBulkShare': 'Copier le lien de cette lecture',
  'dv.lastShareOne': 'Copier le lien de ce devis',
  /* La lecture « déjà partagés » se copie depuis la bande, sans ouvrir la liste. */
  'dv.lastSharedCopy': 'Copier le lien des partages',
  'dv.lastSharedCopyHint': 'Copier l’adresse de la liste ouverte sur les dossiers déjà transmis à un collègue, hors dossiers rendus — les mêmes lignes que le compteur',
  /* Le rappel de la bande des Offres : les dossiers qui circulent déjà. */
  /* La pastille des partages ne compte plus les dossiers revenus : ceux-là ont
     leur propre pastille, donc les deux nombres ne se recoupent jamais. */
  'dv.lastSharedHint': 'Dossiers de ce rappel déjà transmis à un collègue — hors dossiers rendus, comptés à part',
  /* Le même rappel, du côté du retour : les dossiers rendus après un retrait,
     avec le jour du dernier rétablissement. */
  'dv.lastRestoredHint': 'Dossiers de ce rappel revenus après un retrait — comptés à part des dossiers déjà partagés, et la date dit quand le dernier est revenu',
  'dv.lastRestoredSee': 'Voir les dossiers rendus',
  /* La pastille des dossiers rendus est aussi une porte : un clic ouvre la
     liste réduite à ces seuls dossiers, donc les mêmes lignes que le compteur. */
  'dv.lastRestoredPillHint': 'Ouvrir la liste réduite aux dossiers revenus après un retrait — les mêmes lignes que ce compteur',
  /* Le troisième compte de la bande : les dossiers munis de leur adresse mais
     jamais transmis, à côté des partagés et des rendus. */
  'dv.listAddressedCount': 'seulement adressés',
  'dv.lastAddressedHint': 'Dossiers de ce rappel munis de leur adresse mais jamais transmis à un collègue — hors dossiers partagés et rendus, comptés à part',
  /* La troisième pastille se partage comme les deux autres : son adresse
     emporte la lecture des dossiers seulement adressés, sans ouvrir la liste. */
  /* Le jour du dernier dossier resté seulement adressé, à côté du compteur :
     le nombre dit combien, la date dit quand le dernier est entré dans le lot. */
  'dv.listAddressedLast': 'dernier le {date}',
  /* La troisième pastille de la bande est aussi une porte : un clic ouvre la
     liste réduite à ces seuls dossiers, donc les mêmes lignes que le compteur. */
  'dv.lastAddressedPillHint': 'Ouvrir la liste réduite aux dossiers seulement adressés — munis de leur adresse mais jamais transmis, les mêmes lignes que ce compteur',
  /* La même pastille, dans l'en-tête de la liste : elle aussi ouvre sa lecture. */
  'dv.listAddressedHint': 'Dossiers de cette liste munis de leur adresse mais jamais transmis — cliquez pour ne voir qu’eux',
  /* La même pastille, dans la Synthèse de l'écran : le compteur y entre aussi,
     et la cellule est un lien direct vers cette lecture — la Synthèse devient
     une porte, comme l'en-tête. */
  'dv.sumAddressed': 'seulement adressés',
  'dv.sumAddressedHint': 'Dossiers munis de leur adresse mais jamais transmis — ouvrez la liste réduite à ces seuls dossiers',
  'dv.sumAddressedSee': 'Ouvrir la liste réduite aux dossiers seulement adressés',
  /* Le lien des dossiers endormis se copie depuis la pastille de l'en-tête,
     comme celui des dossiers rendus. */
  'dv.listDormantCopy': 'Copier le lien des endormis',
  'dv.listDormantCopyHint': 'Copier l’adresse de la liste ouverte sur les dossiers seulement adressés depuis plus de sept jours',
  /* Depuis quand le plus ancien attend : la date est posée à côté du lien
     copié, pour que l'attente la plus longue se lise sans ouvrir la liste. */
  'dv.listDormantOldest': 'le plus ancien depuis le {date}',
  'dv.listDormantOldestHint': 'Le plus ancien des dossiers seulement adressés attend depuis cette date',
  /* La ligne des dossiers qui dorment, dans la Synthèse à l'écran : elle ouvre
     directement la lecture réduite à ces seuls dossiers. */
  'dv.sumDormant': '{n} dossiers dorment depuis plus de sept jours — seulement adressés, jamais transmis',
  'dv.sumDormantHint': 'Ouvrir la liste réduite à ces seuls dossiers endormis',
  /* Parmi les dossiers qui dorment, ceux dont le devis est déjà confirmé :
     le nombre dit combien attendent pour rien, à côté de la date. */
  'dv.sumDormantConfirmed': 'dont {n} devis confirmés',
  'dv.sumDormantConfirmedHint': 'Dossiers endormis dont le devis est déjà confirmé — ceux qui attendent peut-être le plus',
  /* Le nombre dit combien, et il est aussi une porte : un clic ouvre la liste
     réduite à ces seuls dossiers — le devis est prêt, l'envoi manque. */
  'dv.sumDormantConfirmedOpen': 'Ouvrir la liste réduite aux endormis confirmés — ceux qui dorment avec un devis déjà prêt',
  /* Le classeur nomme ces dossiers un par un, sous leur compte. */
  'dv.csvSynthDormantConfirmedRefs': 'Endormis confirmés, dossier par dossier ({n})',
  /* Le lien des endormis se copie depuis la ligne de la Synthèse, comme depuis
     la pastille de l'en-tête. */
  'dv.sumDormantCopy': 'Copier le lien',
  'dv.sumDormantCopyHint': 'Copier l’adresse de la liste ouverte sur les dossiers endormis',
  /* La date du plus ancien endormi, dans l'en-tête, est une porte : un clic
     ouvre la liste réduite à ces seuls dossiers. */
  'dv.listDormantOldestOpen': 'Ouvrir la liste réduite aux dossiers endormis',
  /* Le même lien se copie depuis la bande des Offres, à côté de celui des
     dossiers seulement adressés. */
  'dv.lastDormantCopy': 'Copier le lien des endormis',
  'dv.lastDormantCopyHint': 'Copier l’adresse de la liste ouverte sur les dossiers seulement adressés depuis plus de sept jours — les mêmes lignes que le compteur',
  /* La pastille des endormis confirmés, juste à côté de celle des endormis :
     parmi ceux qui dorment, ceux dont le devis est déjà confirmé. */
  'dv.listDormantConfirmedCount': 'endormis confirmés',
  'dv.lastDormantConfirmedPillHint': 'Ouvrir la liste réduite aux endormis confirmés — ceux qui dorment alors que leur devis est déjà confirmé',
  'dv.lastDormantConfirmedCopy': 'Copier le lien des endormis confirmés',
  'dv.lastDormantConfirmedCopyHint': 'Copier l’adresse de la liste ouverte sur les dossiers qui dorment avec un devis déjà confirmé — les mêmes lignes que le compteur',
  /* La pastille des dossiers endormis dans la bande des Offres : elle compte
     ces dossiers et ouvre leur lecture, comme celle des seulement adressés. */
  'dv.listDormantCount': 'endormis',
  /* Le montant cumulé des devis encore endormis, posé à côté de leur compteur :
     ce qui dort se lit alors aussi en valeur, et non seulement en nombre. */
  'dv.listDormantAmountHint': 'Montant cumulé des devis encore endormis',
  /* Le montant cumulé des endormis confirmés, posé à côté de leur pastille :
     parmi ceux qui dorment, ce que pèsent les devis déjà prêts. */
  'dv.listDormantConfirmedAmountHint': 'Montant cumulé des devis endormis dont l’offre est déjà confirmée',
  /* La même comparaison que dans la Synthèse, portée par la pastille de
     l'en-tête : ce que pèsent les devis prêts, rapporté à l'attente entière. */
  'dv.listDormantConfirmedCompareHint': 'Ce que pèsent ces devis, rapporté au montant de tous les endormis',
  /* Et la part qu'ils représentent, en pourcentage : le rapport brut se lit
     d'un coup d'œil, le pourcentage dit la proportion. */
  'dv.listDormantConfirmedShareHint': 'Part du montant des endormis que représentent les devis déjà confirmés',
  /* Et le temps qu’ils portent : leur délai moyen, posé à côté de leur
     compteur sur la bande des Offres. */
  'dv.listDormantConfirmedAvg': 'en moyenne {n} j',
  /* Le délai moyen ramené à celui de tous les endormis, comme les montants
     le sont déjà : la moyenne des confirmés ne se lit plus seule. */
  'dv.sumDormantConfirmedAvgOf': '{a} j sur {b} j',
  'dv.listDormantConfirmedAvgCompareHint': 'Délai moyen des devis déjà prêts, rapporté à celui de tous les endormis — les deux moyennes se lisent sur la même horloge',
  /* Le nombre de marchés que mêle la pastille des endormis confirmés, comme
     celle des endormis : le compteur dit combien dorment avec un devis prêt,
     ce jeton dit sur combien de devises. */
  'dv.listDormantConfirmedDevisesHint': 'Ce lot de confirmés mêle plusieurs marchés — chaque devise garde son total, aucun montant n’est additionné',
  'dv.lastDormantPillHint': 'Ouvrir la liste réduite aux dossiers endormis — seulement adressés depuis plus de sept jours, jamais transmis',
  /* La Synthèse entière se copie avec la lecture ouverte : le collègue ouvre
     le même écran, la même lecture, sans refaire un seul clic. */
  'dv.sumCopy': 'Copier le lien de la Synthèse',
  'dv.sumCopyHint': 'Copier l’adresse de cette Synthèse, avec la lecture ouverte, à envoyer à un collègue',
  /* La Synthèse nomme les dossiers seulement adressés qui dorment depuis plus
     d'une semaine : ce qui n'a jamais circulé et attend encore. */
  'dv.csvSynthDormant': 'dont seulement adressés depuis plus de sept jours',
  /* La ligne des dossiers qui dorment est une porte : la Synthèse l’ouvre sur
     la liste réduite à ces seuls dossiers, sans refaire les filtres. */
  'dv.csvDormantList': 'Ouvrir la liste réduite aux dossiers endormis',
  /* La ligne des endormis dont le devis est déjà confirmé : le classeur dit
     combien ils sont, et porte la même adresse copiable que la ligne
     au-dessus — le collègue ouvre ces seuls dossiers. */
  'dv.csvSynthDormantConfirmed': 'dont devis confirmés parmi les endormis',
  /* La feuille ne dit pas seulement combien ils sont : elle nomme aussi depuis
     combien de temps ces dossiers dorment en moyenne, à côté de leur compte. */
  'dv.csvSynthDormantConfirmedAgoAvg': 'Délai moyen des endormis confirmés',
  /* La Synthèse ne dit pas seulement combien ils sont : elle compare leur
     montant à celui de tous les endormis — ce que pèsent les devis déjà prêts,
     rapporté à ce que pèse l’attente entière. */
  'dv.csvSynthDormantConfirmedAmount': 'Montant des endormis confirmés, sur celui de tous les endormis',
  'dv.sumDormantConfirmedAmountOf': '{a} sur {b}',
  'dv.sumDormantConfirmedShareHint': 'Part de l’attente qui est déjà prête à partir',
  /* Le pourcentage que représente le montant des confirmés, à côté du rapport
     brut dans la Synthèse du classeur. */
  'dv.csvSynthDormantConfirmedShare': 'Part du montant des endormis déjà confirmée',
  'dv.csvDormantConfirmedList': 'Ouvrir la liste réduite aux endormis confirmés',
  /* Le montant cumulé des devis encore endormis, avec sa devise, juste sous
     leur compte : la Synthèse ne dit pas seulement combien dorment, mais ce
     qu’ils pèsent ensemble. */
  'dv.csvSynthDormantAmount': 'Montant cumulé des devis encore endormis',
  /* Un lot qui mêle plusieurs marchés ne s’additionne pas : sous le montant
     total, chaque devise dit la place que ses dossiers tiennent dans le lot. */
  'dv.csvSynthDormantByDevise': 'Part des endormis par devise, en dossiers',
  /* Le nombre de marchés que mêle le lot endormi, nommé juste avant sa
     répartition : la feuille dit sur combien de devises elle déroule. */
  'dv.csvSynthDormantDevises': 'Nombre de marchés du lot endormi',
  'dv.csvSynthDormantByDeviseLine': 'dont {devise}',
  /* Le nombre de devis que chaque marché porte dans le lot endormi, posé à
     côté de sa part de l'attente : « 3 devis · 40 % ». */
  'dv.csvSynthDormantByDeviseCount': '{n} devis',
  /* La part de l’attente totale que portent les endormis, à côté de leur
     compteur : le nombre dit combien dorment, le pourcentage dit ce qu’ils
     pèsent dans l’ensemble des devis. */
  'dv.listDormantShareHint': 'Part de l’attente totale que représentent les devis encore endormis',
  /* Le délai moyen du lot endormi, posé à côté de sa part de l’attente : le
     pourcentage dit ce qu’il pèse, la moyenne dit depuis combien de temps ces
     dossiers attendent — lue sur les mêmes lignes que leur compteur. */
  'dv.listDormantAvg': 'en moyenne {n} j',
  'dv.listDormantAvgHint': 'Délai moyen des devis encore endormis — lu sur les mêmes lignes que leur compteur, comme celui des endormis confirmés',
  /* Le délai moyen du lot endormi rapporté à celui de toute la liste : la
     Synthèse à l’écran compare les deux moyennes, comme elle compare déjà les
     montants, et sur la même horloge. */
  'dv.sumDormantAvgOf': '{a} j sur {b} j',
  'dv.sumDormantAvgCompareHint': 'Délai moyen des devis encore endormis, rapporté à celui de toute la liste de devis — les deux moyennes se lisent sur les mêmes lignes et la même horloge',
  /* Les deux parts de l'attente, l'une rapportée à l'autre sur la bande des
     Offres : celle des devis prêts et celle de tout le lot endormi, prises sur
     le même tout — « 18 % sur 32 % ». */
  'dv.sumDormantShareOf': '{a} sur {b}',
  'dv.listDormantConfirmedShareOfHint': 'Part des devis déjà prêts rapportée à celle de tout le lot endormi, toutes deux lues sur l’ensemble des devis',
  /* La répartition par devise quand la lecture mêle plusieurs marchés : chaque
     devise dit ce qu'elle pèse et la place de ses dossiers dans le lot. */
  'dv.sumDormantByDeviseHint': 'Répartition des devis encore endormis par devise — chaque marché garde son total, la part se compte en dossiers',
  /* Le marché qui attend le plus longtemps, à côté du nombre de marchés : la
     Synthèse le nomme d’un coup d’œil, sans jamais additionner deux devises. */
  'dv.sumDormantMarketsLongest': 'le plus long : {devise} {n} j',
  'dv.sumDormantMarketsLongestHint': 'Le marché dont le délai moyen est le plus long — lu sur ses propres dossiers, avec la même horloge que les autres marchés',
  /* Chaque jeton de la répartition se copie : son marché, ses devis, sa part de
     l’attente et son délai moyen, dans une seule ligne. */
  'dv.sumDormantDeviseCopyHint': 'Copier le détail du marché {devise} : nombre de devis, part de l’attente et délai moyen',
  /* L’ordre des jetons de la répartition : par montant, ou par délai moyen
     croissant — le marché qui attend le plus se lit alors en dernier. */
  'dv.sumDeviseSortAmount': 'Par montant',
  'dv.sumDeviseSortAvg': 'Par délai',
  'dv.sumDeviseSortAmountHint': 'Revenir à l’ordre par montant, le plus lourd d’abord',
  'dv.sumDeviseSortAvgHint': 'Trier les marchés par délai moyen croissant — le marché qui attend le plus se lit en dernier',
  /* Tous les marchés d'un seul geste : un marché par ligne, prêt à coller dans
     un message de synthèse. */
  'dv.sumDeviseCopyAll': 'Copier tous les marchés',
  'dv.sumDeviseCopyAllHint': 'Copier d’un seul clic la ligne entière des marchés répartis — un marché par ligne, avec ses devis, sa part de l’attente et son délai moyen, prêts à coller dans un message',
  /* L'ordre suivi par les lignes de marché du classeur, quand il n'est pas
     celui du montant. */
  'dv.csvDeviseOrder': 'Lignes de marché : triées par délai moyen croissant, comme à l’écran — le marché qui attend le plus se lit en dernier',
  /* La part déjà prête de chaque marché, sous la ligne des endormis confirmés :
     parmi les dossiers endormis d'une devise, ceux dont le devis est tranché.
     La part se rapporte à ce marché-là, jamais au lot entier. */
  'dv.sumDormantConfirmedByDeviseHint': 'Part déjà prête de chaque marché parmi les endormis confirmés — la part se rapporte aux dossiers endormis de cette devise',
  'dv.sumDormantConfirmedByDevisePart': 'part de ce marché déjà prête',
  /* Le nombre de marchés que mêle la pastille des endormis de l'en-tête : le
     compteur dit combien dorment, ce jeton dit sur combien de marchés. */
  'dv.listDormantDevises': '{n} marchés',
  'dv.listDormantDevisesHint': 'Ce lot mêle plusieurs marchés — chaque devise garde son total, aucun montant n’est additionné',
  /* Le classeur dit la répartition des endormis confirmés par devise, dans leur
     propre bloc, quand le lot en mêle plusieurs. */
  'dv.csvSynthDormantConfirmedByDevise': 'Part des endormis confirmés par devise, en dossiers',
  /* Le nombre de marchés que le lot confirmé mêle, nommé juste avant sa
     répartition : la feuille dit sur combien de devises elle déroule. */
  'dv.csvSynthDormantConfirmedDevises': 'Nombre de marchés du lot confirmé',
  /* Et le délai moyen de ces devis prêts, rapporté à celui de tous les
     endormis : la comparaison de temps, juste sous celle des montants. */
  'dv.csvSynthDormantConfirmedAgoCompare': 'Délai moyen des endormis confirmés, sur celui de tous les endormis',
  /* Le classeur compare le nombre d'endormis confirmés à celui de tous les
     endormis, comme il compare déjà leurs montants. */
  'dv.csvSynthDormantConfirmedCount': 'Endormis confirmés, sur tous les endormis',
  'dv.sumDormantConfirmedCountOf': '{a} sur {b} dossiers',
  /* La Synthèse du classeur ferme la lecture des retours sur leur délai moyen. */
  'dv.csvSynthRestoredAgoAvg': 'Délai moyen depuis le retour du lot',
  'dv.csvRestoredAgoAvg': 'en moyenne {n} j',
  'dv.lastAddressedCopy': 'Copier le lien des dossiers adressés',
  'dv.lastAddressedCopyHint': 'Copier l’adresse de la liste ouverte sur les dossiers seulement adressés — munis de leur adresse mais jamais transmis, les mêmes lignes que le compteur',
  /* La lecture « seulement adressés » se copie depuis son compteur, comme
     celle des dossiers sans durée : le compte, puis chaque dossier nommé avec
     l’adresse qui l’ouvre. */
  'dv.lastAddressedCountCopy': 'Copier cette lecture',
  'dv.lastAddressedCountCopyHint': 'Copie le compte des dossiers seulement adressés et l’adresse de chacun, prêts à coller dans un message à un collègue.',
  'dv.lastAddressedCopyLead': 'Dossiers seulement adressés : {n} sur {total}',
  'dv.lastAddressedCountCopyRow': '{ref} — {lien}',
  'dv.lastAddressedCountCopyNote': 'Ces dossiers portent leur adresse mais n’ont jamais été transmis à un collègue : ni partagés, ni rendus. Chaque ligne porte l’adresse qui ouvre son dossier.',
  /* Le rappel des marques retirées, dans la bande, à côté du compteur. */
  'dv.lastForgotOne': '{n} marque retirée',
  'dv.lastForgotMany': '{n} marques retirées',
  /* Chaque marque retirée porte, dans la bulle, le jour de son retrait et le
     délai écoulé depuis : le geste se situe sans ouvrir le classeur. */
  'dv.lastForgotOn': 'retirée le {date}',
  'dv.lastForgotAgo': 'depuis {n} j',
  /* Le rappel des marques retirées dans l’en-tête de la liste, à côté du
     compteur : le même mot que sur la bande des Offres. */
  'dv.listForgotHint': 'Dossiers de cette liste dont la marque de partage a été retirée — « Rétablir » les remet, chacun avec son jour d’origine',
  'dv.lastForgotHint': 'Dossiers de ce rappel dont la marque de partage a été retirée — « Rétablir » les remet, chacun avec son jour d’origine',
  /* Le geste inverse, sur les mêmes dossiers : retirer leur marque d’un clic. */
  'dv.lastForgetOne': '{n} partage à oublier',
  'dv.lastForgetMany': '{n} partages à oublier',
  'dv.lastForgetHint': 'Dossiers de ce rappel déjà transmis à un collègue — « Oublier » retire leurs marques, sans toucher au reste du compte',
  /* L'ordre « partagé récemment » se choisit aussi depuis la bande : les deux
     lectures s'ouvrent alors dans le même ordre. */
  'dv.lastSortOn': 'Ordre « partagé récemment » actif : la bande et la liste s’ouvrent dans cet ordre',
  'dv.lastSortOff': 'Ouvrir la bande et la liste dans l’ordre « partagé récemment »',
  'dv.notifiedOn': 'Dernier message d’état',
  'dv.notifiedNone': 'Aucun message d’état envoyé',
  'dv.lastStamp': 'Votre dernier devis',
  'dv.lastRef': 'Référence',
  'dv.lastSee': 'Le voir dans mon compte',
  'dv.lastFollow': 'Suivre ce dossier',
  'dv.lastOpen': 'Ouvrir le suivi du devis {ref}',
  'dv.lastHide': 'Masquer ce rappel',
  'dv.lastFilterAria': 'Choisir l’état du devis affiché',
  'dv.lastNone': 'Aucun devis dans cet état. Choisissez « Tous » pour revoir le dernier devis.',
  'dv.lastRelance': 'Un rappel part automatiquement si le devis reste sans réponse au bout de sept jours.',
  'dv.lastRelanceHint': 'Le dernier rappel envoyé pour ce devis',
  'dv.csvFilterLabel': 'État filtré',
  /* La lecture voyage avec le classeur : la Synthèse nomme celle qui était
     ouverte à l’export, pour qu’une feuille relue plus tard dise ce qu’elle
     garde — et non seulement combien de lignes. */
  'dv.csvReading': 'Lecture ouverte',
  'dv.csvReadingRestored': 'Rétablies — dossiers revenus après un retrait',
  'dv.csvReadingShared': 'Déjà partagés — dossiers transmis à un collègue',
  /* La troisième lecture entre dans la Synthèse comme les deux autres : la
     feuille dit qu'elle ne garde que les dossiers seulement adressés. */
  'dv.csvReadingAddressed': 'Seulement adressés — dossiers munis de leur adresse mais jamais transmis',
  /* La quatrième lecture entre dans la Synthèse comme les trois autres. */
  'dv.csvReadingDormant': 'Endormis — dossiers seulement adressés depuis plus de sept jours',
  /* La cinquième lecture entre dans la Synthèse comme les quatre autres. */
  'dv.csvReadingDormantConfirmed': 'Endormis confirmés — dossiers qui dorment avec un devis déjà confirmé',
  'dv.csvDays': 'Jours depuis l’envoi',
  'dv.csvNote': 'Export des devis filtrés depuis « Mon compte », tel qu’ils sont affichés à l’écran.',
  'dv.csvSynthTitle': 'Feuille 2 — Synthèse : les devis par état',
  'dv.csvSynthState': 'État',
  'dv.csvSynthCount': 'Nombre de devis',
  'dv.csvSynthShare': 'Part de l’export',
  'dv.csvSynthTotal': 'Total exporté',
  'dv.csvSynthNote': 'La synthèse ne compte que les devis écrits dans l’onglet « Devis », dans l’état où ils sont aujourd’hui.',
  'dv.csvSynthLate': 'dont en retard',
  'dv.csvSynthBulk': 'dont déjà repris dans un récapitulatif groupé',
  'dv.csvSynthBulkNever': 'dont jamais repris dans un groupé',
  'dv.csvSynthRefsTitle': 'Références parties dans ce groupé ({n})',
  'dv.csvLate': 'En retard',
  'dv.csvYes': 'Oui',
  'dv.csvNo': 'Non',
  'dv.xlsxCta': 'Exporter en Excel',
  'dv.xlsxDone': 'Classeur téléchargé',
  /* Ce que compte le bouton d'export : les devis affichés, donc les lignes que
     le classeur emportera. */
  'dv.xlsxCountUnit': 'devis',
  'dv.bulkTitle': 'Envoi groupé des devis en retard',
  'dv.bulkHint': 'Un seul e-mail reprend les devis cochés, avec leur référence et leur montant.',
  'dv.bulkAll': 'Tout sélectionner',
  'dv.bulkNone': 'Tout désélectionner',
  'dv.bulkSelected': 'sélectionnés',
  'dv.bulkPickOne': 'Sélectionner le devis {ref}',
  'dv.bulkSend': 'Envoyer le récapitulatif groupé',
  'dv.bulkSending': 'Envoi…',
  'dv.bulkOk': 'Un récapitulatif groupé de {n} devis vient de partir à votre adresse.',
  'dv.bulkErr': 'L’envoi groupé n’a pas pu partir. Réessayez dans un instant.',
  'dv.bulkXlsxCta': 'Exporter en Excel le groupé',
  'dv.bulkXlsxScope': 'Les {n} devis du groupé du {date}',
  'dv.bulkXlsxNote': 'Le classeur ne contient que les devis de ce groupé, avec le jour où ils sont partis.',
  'dv.remindLate': 'Ce devis attend votre réponse depuis {days} jours. Un rappel part automatiquement après sept jours, sauf si vous répondez avant.',
  'dv.remindSent': 'Un rappel vous a été envoyé le {date}, et le devis attend toujours votre réponse.',
  'dv.remindOpen': 'Ouvrir le dossier',

  'dv.fFormula': 'Formule',
  'dv.fDuree': 'Durée',
  'dv.fTotal': 'Montant de la durée',
  'dv.fParMois': 'Équivalent par mois',
  'dv.fPlein': 'Au prix du mois, sans la remise',
  'dv.fSites': 'Établissements',
  'dv.fMarche': 'Marché',
  'dv.fRythme': 'Facturation',
  'dv.fForfait': 'Base de la durée',
  'dv.fSitesSup': 'Établissements supplémentaires',
  'dv.fMensuel': 'Total mensuel',
  'dv.fAnnuel': 'Total annuel',
  'dv.fEconomie': 'de remise annuelle',

  'dv.p2': 'Prix d’un établissement, puis tarif réduit pour chacun des suivants.',
  'dv.p3': 'Un forfait de structure, puis un tarif réduit par établissement.',
  'dv.p1': 'Aucun montant : l’inscription reste libre.',
};

const ar: Dict = {
  'dv.stamp': 'عرض سعر الاشتراك',
  'dv.title': 'كوّن اشتراكك، واقرأ المبلغ قبل إرساله',
  'dv.sub': 'ثلاثة خيارات تكفي: المدة، وعدد المؤسسات، والسوق. يُعاد حساب مبلغ هذه المدة عند كل تغيير، ويُرسل الطلب والمبلغ مكتوب فيه.',
  'dv.pageTitle': 'عرض سعر اشتراكك على الإنترنت',
  'dv.pageLede': 'كوّن احتياجك، واقرأ المبلغ، ثم أرسل الطلب: يتولاه مرافق ويؤكد عرض السعر.',

  'dv.formule': 'الصيغة',
  'dv.duree': 'المدة',
  'dv.dureeRetenue': 'المدة المعتمدة',
  'dv.dureeMissing': 'المدة غير مسجّلة',
  'dv.dureeMissingHint': 'فُتح هذا الملف قبل حفظ المدة المعتمدة، فهي ناقصة هنا، أما عرض السعر فيبقى صالحًا.',
  'dv.lastNoDuree': '{n} دون مدة',
  'dv.lastNoDureeHint': 'ملفات في هذا الشريط فُتحت قبل حفظ المدة المعتمدة: المدة غير مكتوبة فيها، لكن كل عرض سعر يبقى صالحًا.',
  'dv.months': 'أشهر',
  'dv.perDuree': 'للمدة',
  'dv.totalDuree': 'مبلغ المدة',
  'dv.parMoisDur': 'أي شهريًا',
  'dv.prixPlein': 'بسعر الشهر دون التخفيض',
  'dv.sites': 'المؤسسات',
  'dv.sitesHint': 'حساب واحد وعدة مواقع: كل مؤسسة بعد الأولى تُحسب بسعر مخفّض.',
  'dv.sitesAria': 'عدد المؤسسات',
  'dv.moins': 'إزالة مؤسسة',
  'dv.plus': 'إضافة مؤسسة',
  'dv.marche': 'السوق',
  'dv.rythme': 'الفاتورة',
  'dv.month': 'شهريًا',
  'dv.year': 'سنويًا',
  'dv.perMonth': 'في الشهر',
  'dv.perYear': 'في السنة',

  'dv.quoteStamp': 'المبلغ',
  'dv.quoteTitle': 'عرض سعرك، سطرًا بسطر',
  'dv.forfait': 'الرسم الأساسي',
  'dv.forfaitInclus': 'مؤسسة مشمولة',
  'dv.forfaitInclusMany': 'مؤسسات مشمولة',
  'dv.sitesSup': 'مؤسسات إضافية',
  'dv.mensuel': 'المجموع الشهري',
  'dv.annuel': 'المجموع السنوي',
  'dv.annuelPlain': 'دون الخصم السنوي',
  'dv.saving': 'توفّر',
  'dv.free': 'مجانًا',
  'dv.freeNote': 'يبقى الدليل مجانيًا مهما كان عدد المؤسسات.',
  'dv.offre': 'خصم ٢٠٪',
  'dv.indicative': 'تقدير إرشادي: يؤكد المرافق عرض السعر قبل أي فاتورة.',
  'dv.parSite': 'أي لكل مؤسسة في الشهر',
  'dv.fParSite': 'سعر المؤسسة الواحدة في الشهر',
  'dv.origine': 'أي',

  'dv.requestStamp': 'إرسال الطلب',
  'dv.requestTitle': 'استلم هذا العرض مكتوبًا',
  'dv.name': 'الاسم الكامل',
  'dv.namePh': 'أمينة بلقاسم',
  'dv.email': 'البريد الإلكتروني',
  'dv.emailPh': 'you@example.com',
  'dv.org': 'المؤسسة',
  'dv.orgPh': 'مطبعة المنار',
  'dv.phone': 'الهاتف',
  'dv.start': 'تاريخ بدء الاشتراك المطلوب',
  'dv.startHint': 'التاريخ الذي يُفترض أن يبدأ فيه الاشتراك — يُذكر في الملخص المطبوع.',
  'dv.msg': 'توضيحات',
  'dv.msgPh': 'المواقع المعنية، الأجل المطلوب، قيود الفاتورة…',
  'dv.send': 'اطلب هذا العرض',
  'dv.sending': 'جارٍ الإرسال…',
  'dv.reset': 'تكوين عرض آخر',
  'dv.length': 'حرفًا',
  'dv.ok': 'أُرسل الطلب ومعه مبلغك، وتم إرسال ملخص عرض السعر إلى بريدك.',
  'dv.okNoMail': 'تم تسجيل عرض السعر بالمبلغ أدناه. تعذّر إرسال الملخص بالبريد الآن: احتفظ بالمرجع، فهو يتبع ملفك.',
  'dv.okHint': 'يتولى مرافق الطلب ويؤكد المبلغ قبل أي فاتورة.',
  'dv.ref': 'المرجع',
  'dv.errName': 'يلزم اسم وبريد إلكتروني للرد على الطلب.',
  'dv.errLong': 'الرسالة تتجاوز ٥٠٠ حرف.',
  'dv.errSend': 'لم يُرسل الطلب. أعد المحاولة بعد لحظة.',
  'dv.errNet': 'تعذّر الاتصال. تحقق من الشبكة ثم أعد المحاولة.',
  'dv.required': 'حقل مطلوب',

  'dv.ctaCard': 'اطلب عرض سعر',
  'dv.ctaCardTip': 'تكوين عرض سعر لمؤسسة، والمبلغ معروض قبل الإرسال',
  'dv.toComposer': 'تكوين عرض السعر',
  'dv.acctTitle': 'عرض سعر الاشتراك',
  'dv.acctSub': 'أضف مؤسسات أو غيّر الصيغة: يُعاد حساب المبلغ هنا قبل الإرسال.',
  'dv.errCompte': 'لا يُحسب العرض الآن.',

  'dv.listTitle': 'العروض المرسلة',
  'dv.listSub': 'كل عرض سعر كوّنته بهذا الحساب، ومبلغه وحالته — ويُرسل الملخص بالبريد أيضًا.',
  'dv.listEmpty': 'لا يوجد عرض مُرسل بعد. كوّن واحدًا أعلاه وسيظهر هنا بمرجعه.',
  'dv.listError': 'لا تُحمّل العروض المرسلة الآن.',
  'dv.listRetry': 'إعادة المحاولة',
  'dv.listLoading': 'جارٍ تحميل العروض…',
  'dv.listCount': 'عروض مرسلة',
  'dv.listSharedCount': 'شوركت سابقًا',
  'dv.listSharedHint': 'ملفات هذه القائمة التي سبق إرسالها إلى زميل بعنوانها — دون الملفات التي أُعيدت، فهي محسوبة على حدة',
  'dv.listSharedLast': 'آخرها في {date}',
  'dv.listRestoredCount': 'أُعيدت',
  'dv.listRestoredHint': 'ملفات هذه القائمة التي عادت بعد إزالة — اضغط لعرضها وحدها',
  'dv.listRestoredFoldHint': 'فتح الملفات التي أُعيدت واحدًا واحدًا — وفوق العشرة تنطوي القائمة',
  'dv.listRestoredCopy': 'نسخ رابط الملفات التي أُعيدت',
  'dv.listRestoredCopyHint': 'نسخ عنوان القائمة المفتوحة على الملفات التي عادت بعد إزالة',
  'dv.listSites': 'مؤسسات',
  'dv.listSentOn': 'أُرسل في',
  'dv.listCompose': 'تكوين عرض سعر',
  'dv.listNote': 'يحدّث المرافق الذي يتابع الملف هذه الحالة.',
  'dv.listKey': 'السهمان أعلى وأسفل لاختيار عرض · Enter يفتح صفحة تتبعه · Esc يترك القائمة في وضع الراحة.',
  'dv.keyWalk': '{n} عرضًا جرى تصفّحه بلوحة المفاتيح',
  'dv.keyWalkOpen': 'إعادة فتح آخر عرض أُبرز: {ref}',
  'dv.keyOpened': '{n} ملفًا فُتح منذ استعادة البطاقة',
  'dv.keyOpenedHint': 'يعدّ الملفات المفتوحة منذ استعادة البطاقة {ref} بلوحة المفاتيح: كل ملف يُحسب مرة واحدة حتى لو أُعيد فتحه.',
  'dv.keyOpenedCopy': 'انسخ هذا العدد',
  'dv.keyOpenedCopyHint': 'ينسخ البطاقة المستعادة {ref} والملفات المفتوحة منذ ذلك الحين، ملفًا في كل سطر، في نص جاهز للصق في رسالة.',
  'dv.keyOpenedCopyHead': 'البطاقة المستعادة {ref} — {n} ملفًا فُتح منذ ذلك الحين:',
  'dv.sumTitle': 'عروضك في لمحة',
  'dv.sumReceived': 'عروض مستلمة',
  'dv.sumReview': 'قيد الدراسة',
  'dv.sumConfirmed': 'مؤكدة',
  'dv.sumExpired': 'منتهية',
  'dv.sumLate': 'متأخرة',
  'dv.sumLateHint': 'عروض مستلمة دون رد منذ سبعة أيام — اضغط لعرضها وحدها',
  'dv.sumNever': 'لم يضمّها ملخص',
  'dv.sumNeverHint': 'عروض لم يضمّها أي ملخص جماعي بعد — اضغط لعرضها وحدها وفتح الإرسال الجماعي للمتأخرة منها',
  'dv.sumBulkOnly': 'عرض العروض التي ضمّها ملخص جماعي فقط',
  'dv.sumBulkOnlyOff': 'العودة إلى كل العروض',
  'dv.sumBulkOnlyHint': 'يبقي فقط العروض التي أُرسلت سابقًا في ملخص جماعي',
  'dv.sumGroup': 'ضمّها ملخص',
  'dv.sumGroupHint': 'عروض أُرسلت سابقًا في ملخص جماعي — اضغط لعرضها وحدها',
  'dv.sumBulkNone': 'لا يوجد في هذه القراءة عرض أُرسل سابقًا في ملخص جماعي.',
  'dv.sumBulkNeverOnly': 'عرض العروض التي لم يضمّها أي ملخص جماعي فقط',
  'dv.sumBulkNeverOnlyOff': 'العودة إلى العروض غير المشمولة',
  'dv.sumBulkNeverOnlyHint': 'يبقي فقط العروض التي لم يضمّها أي ملخص جماعي بعد — ويفتح الإرسال الجماعي للمتأخرة منها',
  'dv.sumBulkNeverNone': 'كل عروض هذه القراءة أُرسلت سابقًا في ملخص جماعي.',
  'dv.sumBulkNeverBulk': 'هذه العروض لم يضمّها أي ملخص جماعي: الإرسال الجماعي يحدد {n} منها.',
  'dv.sumLastBulk': 'آخر ملخص جماعي في {date} — {n} عروض',
  'dv.sumLastBulkHint': 'آخر إرسال جماعي كان يضمّ عروضًا من هذه القائمة',
  'dv.st.recu': 'مستلم',
  'dv.st.en_etude': 'قيد الدراسة',
  'dv.st.confirme': 'مؤكد',
  'dv.st.expire': 'منتهٍ',
  'dv.filterAll': 'الكل',
  'dv.filterAria': 'تصفية العروض حسب الحالة',
  'dv.filterNone': 'لا يوجد عرض في هذه الحالة الآن. اختر «الكل» لعرض القائمة كاملة.',
  'dv.filterLate': 'متأخرة',
  'dv.filterLateHint': 'عروض مستلمة دون رد منذ سبعة أيام',
  'dv.filterLateNone': 'لا يوجد عرض متأخر: كل ما استُلم حصل على رد أو تم البتّ فيه.',
  'dv.filterLateOff': 'عرض كل العروض',
  'dv.filterShared': 'شوركت سابقًا',
  'dv.filterSharedHint': 'إبقاء الملفات التي سبق إرسالها إلى زميل فقط',
  'dv.filterSharedNone': 'لا يوجد في هذه القراءة ملف أُرسل إلى زميل بعد.',
  'dv.filterSharedOff': 'عرض كل العروض',
  'dv.filterRestored': 'أُعيدت',
  'dv.filterRestoredHint': 'إبقاء الملفات التي أُعيدت علامتها بعد الإزالة فقط',
  'dv.filterRestoredNone': 'لا يوجد في هذه القراءة ملف أُعيد بعد.',
  'dv.filterRestoredOff': 'عرض كل العروض',
  'dv.filterAddressed': 'عُنوِن فقط',
  'dv.filterAddressedHint': 'إبقاء الملفات التي لها عنوانها ولم تُرسل إلى زميل قط، دون المشوركة والتي أُعيدت',
  'dv.filterAddressedNone': 'لا يوجد في هذه القراءة ملف مُعنون فقط: كلها شوركت أو عادت.',
  'dv.filterAddressedOff': 'عرض كل العروض',
  'dv.filterDormant': 'راكدة',
  'dv.filterDormantHint': 'إبقاء الملفات المُعنونة فقط منذ أكثر من سبعة أيام — لم تُرسل ولم تعد',
  'dv.filterDormantNone': 'لا يوجد ملف راكد: لا ملف مُعنون فقط ينتظر منذ أكثر من سبعة أيام.',
  'dv.filterDormantOff': 'عرض كل العروض',
  'dv.filterDormantConfirmed': 'راكدة مؤكدة',
  'dv.filterDormantConfirmedHint': 'إبقاء الملفات الراكدة التي عرضها مؤكد سابقًا فقط — العرض جاهز ولم يُرسل قط',
  'dv.filterDormantConfirmedNone': 'لا يوجد ملف راكد بعرض مؤكد: لا شيء ينتظر بعرض محسوم.',
  'dv.filterDormantConfirmedOff': 'عرض كل العروض',
  'dv.filterNoDuree': 'دون مدة',
  'dv.filterNoDureeHint': 'إبقاء الملفات التي لم تُسجَّل مدتها فقط — فُتحت قبل حفظ المدة المعتمدة، وعرض السعر يبقى صالحًا',
  'dv.filterNoDureeNone': 'لا يوجد في هذه القراءة ملف ناقص المدة: كلها تحمل مدتها المعتمدة.',
  'dv.filterNoDureeOff': 'عرض كل العروض',
  'dv.sharedNoDureeNote': 'رابط مُشارَك: قراءة «دون مدة» — {n} ملفًا معروضًا',
  'dv.lastRythmeDiff': '{n} مدد موروثة',
  'dv.lastRythmeDiffHint': 'ملفات هذا التذكير التي لا تطابق مدتها الإيقاع المحفوظ على هذا الجهاز ({duree}) — مدة هذه الملفات قديمة',
  'dv.lastNoDureeFilterHint': 'فتح القائمة مقصورة على الملفات الناقصة المدة — التي فُتحت قبل حفظ المدة المعتمدة',
  'dv.lastNoDureeCopy': 'انسخ هذه القراءة',
  'dv.lastNoDureeCopyHint': 'ينسخ عدد الملفات دون مدة وعنوان كل واحد منها، جاهزًا للصق في رسالة إلى زميل.',
  'dv.lastNoDureeCopyLead': 'ملفات دون مدة: {n} من {total}',
  'dv.lastNoDureeCopyRow': '{ref} — {lien}',
  'dv.lastNoDureeCopyNote': 'فُتحت هذه الملفات قبل حفظ المدة المعتمدة: المدة غير مكتوبة فيها، لكن كل عرض سعر يبقى صالحًا. كل سطر يحمل عنوان ملفه.',
  'dv.filterDureeExact': 'المدة · {n} أشهر',
  'dv.filterDureeExactHint': 'إبقاء الملفات المكتوبة على هذه المدة وحدها — {n} أشهر كما هي مكتوبة في الملف',
  'dv.filterDureeExactNone': 'لا يوجد في هذه القراءة ملف مكتوب على {n} أشهر.',
  'dv.filterDureeExactOff': 'عرض كل العروض',
  'dv.sharedDureeNote': 'رابط مُشارَك: قراءة «المدة · {n} أشهر» — {m} ملفًا معروضًا',
  'dv.rowRythmeHeriteDoorHint': 'فتح القائمة مقصورة على الملفات المكتوبة على هذه المدة — {n} أشهر',
  'dv.lastRythmeDiffCopy': 'انسخ هذه القراءة',
  'dv.lastRythmeDiffCopyHint': 'ينسخ عدد المدد الموروثة، ثم كل ملف مع عدد الأشهر التي أنتجتها والعنوان الذي يفتحه، جاهزًا للصق في رسالة إلى زميل.',
  'dv.lastRythmeDiffCopyLead': 'مدد موروثة: {n} من {total}',
  'dv.lastRythmeDiffCopyRow': '{ref} · {mois} أشهر — {lien}',
  'dv.lastRythmeDiffCopyNote': 'تحمل هذه الملفات مدة لم تعد تطابق الإيقاع المحفوظ على هذا الجهاز ({duree}): فهي من إعداد أقدم. كل سطر يحمل عدد الأشهر المكتوبة عند الإرسال وعنوان ملفه.',
  'dv.lastRythmeDiffFilterHint': 'فتح القائمة مقصورة على الملفات التي جاءت مدتها من إعداد أقدم — التي لا تطابق الإيقاع المحفوظ على هذا الجهاز',
  'dv.filterRythme': 'مدد موروثة',
  'dv.filterRythmeHint': 'إبقاء الملفات التي لا تطابق مدتها الإيقاع المحفوظ على هذا الجهاز فقط — مدة هذه الملفات من إعداد أقدم',
  'dv.filterRythmeNone': 'لا يوجد في هذه القراءة ملف بمدة موروثة: كلها تطابق الإيقاع المحفوظ على هذا الجهاز.',
  'dv.filterRythmeOff': 'عرض كل العروض',
  'dv.sharedRythmeNote': 'رابط مُشارَك: قراءة «مدد موروثة» — {n} ملفًا معروضًا',
  'dv.rowRythmeHerite': 'موروثة · {n} أشهر',
  'dv.rowRythmeHeriteHint': 'كُتبت هذه المدة على {n} أشهر، بينما يحتفظ هذا الجهاز اليوم بـ {duree} ({m} أشهر) — فهي من إعداد أقدم.',
  'dv.sortRecent': 'شورك حديثًا',
  'dv.sortRecentHint': 'رفع الملفات التي دُرّجت حديثًا، من أحدث مشاركة إلى أقدمها',
  'dv.sortOpened': 'فُتح حديثًا',
  'dv.sortOpenedHint': 'رفع الملفات التي فُتحت آخر مرة أولًا، من الأحدث إلى الأقدم — والملفات التي لم تُفتح تحفظ مكانها في الآخر',
  'dv.sortOpenedCopy': 'انسخ هذا الترتيب',
  'dv.sortOpenedCopyHint': 'ينسخ الملفات بترتيب «فُتح حديثًا»، كل ملف مع تاريخ زيارته، في نص جاهز للصق في رسالة.',
  'dv.sortOpenedCopyHead': 'فُتح حديثًا · {n} ملفًا:',
  'dv.sortOpenedCopyNever': 'لم يُفتح قط',

  'dv.resend': 'إعادة إرسال الملخص',
  'dv.resending': 'جارٍ الإرسال…',
  'dv.resendOk': 'أُعيد إرسال الملخص إلى بريدك.',
  'dv.resendErr': 'لم يُرسل. أعد المحاولة بعد لحظة.',
  'dv.follow': 'تابع هذا الملف',
  'dv.followHint': 'افتح صفحة التتبع وهذا المرجع مكتوب فيها',
  'dv.relanceOn': 'أُرسل التذكير في',
  'dv.recapGroupOn': 'ملخص جماعي في',
  'dv.recapGroupHint': 'آخر إرسال جماعي كان يضمّ هذا العرض',
  'dv.recapGroupCol': 'الملخص الجماعي بتاريخ',
  'dv.csvLinkCol': 'عنوان العرض',
  'dv.csvShareStateCol': 'حالة الملف',
  'dv.csvShareStateShared': 'شورك مع زميل',
  'dv.csvShareStateRestored': 'أُعيد بعد إزالة',
  'dv.csvShareStateAddressed': 'عُنوِن فقط',
  'dv.csvSharedMark': 'آخر مشاركة في الدفعة: {date}',
  'dv.csvForgotCol': 'سطر أُزيلت علامته',
  'dv.csvForgotMark': 'أُزيلت العلامة في {date} · شورك في {shared}',
  'dv.csvRestoredMark': 'أُعيدت العلامة في {date} · شورك في {shared}',
  'dv.rowSharedOn': 'شورك في {date}',
  'dv.rowSharedHint': 'سبق أن أُرسل هذا الملف إلى زميل بعنوانه',
  'dv.rowRestoredOn': 'أُعيد في {date}',
  'dv.rowRestoredHint': 'عاد هذا الملف بعد إزالة — ويُكتب يوم إرجاعه في الملف، ملفًا بملف',
  'dv.rowOpenedOn': 'فُتح في {date}',
  'dv.rowOpenedHint': 'آخر مرة فُتح فيها هذا الملف — وهو التاريخ نفسه الذي يعتمده ترتيب «فُتح حديثًا»',
  'dv.forgetShares': 'محو المشاركات',
  'dv.forgetSharesHint': 'محو علامات المشاركة لهذا الحساب دون المساس ببقية الإعدادات',
  'dv.forgetSharesText': 'محو {n} علامة مشاركة لهذا الحساب؟ تبقى عناوين الملفات كما هي، وتختفي وحدها شارات «شورك في…». ويحفظ الملف أثر ذلك بعمود «سطر أُزيلت علامته» مع يوم كل إزالة.',
  'dv.forgetSharesYes': 'امحُ هذه العلامات',
  'dv.forgetSharesNo': 'إلغاء',
  'dv.forgetSharesOk': 'تم محو علامات المشاركة لهذا الحساب.',
  'dv.rowForgetShare': 'محو',
  'dv.rowForgetShareHint': 'محو علامة مشاركة هذا الملف دون المساس بالبقية',
  'dv.rowForgetShareOk': 'تم محو علامة مشاركة هذا الملف.',
  'dv.rowRestoreShare': 'إرجاع',
  'dv.rowRestoreShareHint': 'إرجاع علامة هذا الملف مع يوم مشاركته الأصلي',
  'dv.rowRestoreShareOk': 'أُعيدت علامة مشاركة هذا الملف بتاريخها الأصلي.',
  'dv.restoreShares': 'إرجاع {n} علامات',
  'dv.restoreSharesHint': 'إرجاع العلامات الممحوة، كل واحدة بتاريخ مشاركة ملفها الأصلي',
  'dv.csvSynthSituation': 'حالة الملفات',
  'dv.csvSynthSituationTotal': 'مجموع الحالات',
  'dv.csvSynthShared': 'منها ما شورك مع زميل (دون الملفات التي أُعيدت)',
  'dv.csvSynthSharedConfirmed': 'منها عروض مؤكدة شوركت سابقًا',
  'dv.csvSynthConfirmedToShare': 'منها عروض مؤكدة لم تُشارك بعد',
  'dv.csvSynthLastShare': 'آخر مشاركة في الدفعة المصدّرة',
  'dv.csvRestoredList': 'فتح القائمة مقصورة على الملفات التي أُعيدت',
  'dv.csvSynthForgot': 'منها علامات أُزيلت',
  'dv.csvSynthRestored': 'منها ملفات عادت بعد إزالة',
  'dv.csvSynthForgotRefs': 'العلامات المزالة، ملفًا بملف ({n})',
  'dv.csvSharedOnCol': 'شورك في',
  'dv.csvForgotOnCol': 'أُزيلت العلامة في',
  'dv.csvSynthRestoredRefs': 'العلامات المُعادة، ملفًا بملف ({n})',
  'dv.csvRestoredOnCol': 'أُعيدت العلامة في',
  'dv.csvRestoredAgoCol': 'المدة منذ الإرجاع',
  'dv.csvRestoredAgo': 'منذ {n} يوم',
  'dv.markSeeAll': 'عرض الكل ({n})',
  'dv.markSeeLess': 'تقليص',
  'dv.sumMarksCompare': '{n} علامات أُزيلت · {r} أُعيدت — {k} بانتظار الإرجاع',
  'dv.sumMarksCompareHint': 'ما أزالت الدفعة علاماته، وما أعادته، وما ينتظر الإرجاع بعد',
  'dv.sumMarksRestoredOn': 'آخر إرجاع في {date}',
  'dv.sumMarksRestoredHint': 'افتح الملفات التي أُعيدت، كل واحد بيوم إرجاعه',
  'dv.sumMarksRestoredHead': '{n} علامات أُعيدت، ملفًا بملف',
  'dv.lastRestoredOn': 'أُعيدت في {date}',
  'dv.lastRestoredAgo': 'منذ {n} يوم',
  'dv.csvSynthLastRestored': 'آخر إرجاع في الدفعة المصدّرة',
  'dv.lastBulkTitle': 'عروض دون رد منذ سبعة أيام',
  'dv.lastBulkText': '{n} عروض تنتظر ردّك. رسالة واحدة تجمعها كلها بمرجعها ومبلغها.',
  'dv.lastBulkSend': 'إرسال الملخص الجماعي',
  'dv.lastBulkSending': 'جارٍ الإرسال…',
  'dv.lastBulkOk': 'أُرسل ملخص جماعي لـ {n} عروض إلى بريدك.',
  'dv.lastBulkErr': 'لم يُرسل الملخص الجماعي. أعد المحاولة بعد لحظة.',
  'dv.lastBulkResend': 'إعادة إرسال الملخص',
  'dv.lastBulkRecent': 'أُرسل سابقًا في {date} — هذا الإرسال سيحلّ محله.',
  'dv.lastBulkNever': '{n} من هذه العروض لم يضمّها أي ملخص جماعي بعد.',
  'dv.lastBulkGroup': '{n} من هذه العروض أُرسلت سابقًا في ملخص جماعي.',
  'dv.lastBulkNeverSee': 'عرض العروض التي لم يضمّها أي ملخص جماعي',
  'dv.lastGroupSee': 'عرض العروض التي ضمّها ملخص جماعي',
  'dv.shareCta': 'نسخ الرابط',
  'dv.shareHint': 'نسخ عنوان هذه القراءة لإرساله إلى زميل',
  'dv.sharedNote': 'رابط مُشارَك: {n} عرضًا معروضًا في هذه القراءة',
  'dv.sharedNoteOff': 'إخفاء هذا التذكير',
  'dv.sharedRefNote': 'رابط مُشارَك: عرض واحد معروض، {ref}',
  'dv.sharedRefNone': 'كان هذا الرابط يشير إلى العرض {ref}، وهو ليس في هذه القائمة.',
  'dv.sharedRefSeeAll': 'عرض القائمة كاملة',
  'dv.sharedSharedNote': 'رابط مُشارَك: قراءة «شوركت سابقًا» — {n} ملفًا معروضًا',
  'dv.sharedAddressedNote': 'رابط مُشارَك: قراءة «عُنوِن فقط» — {n} ملفًا معروضًا',
  'dv.sharedDormantNote': 'رابط مُشارَك: قراءة «راكدة» — {n} ملفًا معروضًا',
  'dv.sharedDormantConfirmedNote': 'رابط مُشارَك: قراءة «راكدة مؤكدة» — {n} ملفًا معروضًا',
  'dv.csvSortNote': 'ورقة «العروض»: الملفات التي أُعيدت أولًا، من أحدث إرجاع إلى أقدمه، ثم البقية بترتيب القائمة',
  'dv.rowShare': 'نسخ الرابط',
  'dv.rowShareHint': 'نسخ عنوان هذه القراءة مقصورة على العرض {ref}، لإرساله إلى زميل',
  'dv.rowCopyFollow': 'نسخ الرابط',
  'dv.rowCopyFollowHint': 'نسخ عنوان تتبع الملف {ref}، لإرساله إلى زميل',
  'dv.lastBulkShare': 'نسخ رابط هذه القراءة',
  'dv.lastShareOne': 'نسخ رابط هذا العرض',
  'dv.lastSharedCopy': 'نسخ رابط المشاركات',
  'dv.lastSharedCopyHint': 'نسخ عنوان القائمة المفتوحة على الملفات التي سبق إرسالها إلى زميل، دون الملفات التي أُعيدت — السطور نفسها التي يعدّها المؤشر',
  'dv.lastSharedHint': 'ملفات هذا التذكير التي سبق إرسالها إلى زميل — دون الملفات التي أُعيدت، فهي محسوبة على حدة',
  'dv.lastRestoredHint': 'ملفات هذا التذكير التي عادت بعد إزالة — محسوبة على حدة عن الملفات المشوركة، والتاريخ يقول متى عاد آخرها',
  'dv.lastRestoredSee': 'عرض الملفات التي أُعيدت',
  'dv.lastRestoredPillHint': 'فتح القائمة مقصورة على الملفات التي عادت بعد إزالة — السطور نفسها التي يعدّها المؤشر',
  'dv.listAddressedCount': 'عُنوِن فقط',
  'dv.lastAddressedHint': 'ملفات هذا التذكير التي لها عنوانها ولم تُرسل إلى زميل قط — دون الملفات المشوركة والتي أُعيدت، فهي محسوبة على حدة',
  'dv.listAddressedLast': 'آخرها في {date}',
  'dv.lastAddressedPillHint': 'فتح القائمة مقصورة على الملفات المُعنونة فقط — لها عنوانها ولم تُرسل قط، وهي السطور نفسها التي يعدّها المؤشر',
  'dv.listAddressedHint': 'ملفات هذه القائمة التي لها عنوانها ولم تُرسل قط — اضغط لعرضها وحدها',
  'dv.sumAddressed': 'عُنوِن فقط',
  'dv.sumAddressedHint': 'ملفات لها عنوانها ولم تُرسل قط — افتح القائمة مقصورة على هذه الملفات',
  'dv.sumAddressedSee': 'فتح القائمة مقصورة على الملفات المُعنونة فقط',
  'dv.listDormantCopy': 'نسخ رابط الملفات الراكدة',
  'dv.listDormantCopyHint': 'نسخ عنوان القائمة المفتوحة على الملفات المُعنونة فقط منذ أكثر من سبعة أيام',
  'dv.listDormantOldest': 'أقدمها ينتظر منذ {date}',
  'dv.listDormantOldestHint': 'أقدم الملفات المُعنونة فقط ينتظر منذ هذا التاريخ',
  'dv.sumDormant': '{n} ملفات راكدة منذ أكثر من سبعة أيام — مُعنونة فقط ولم تُرسل قط',
  'dv.sumDormantHint': 'فتح القائمة مقصورة على هذه الملفات الراكدة وحدها',
  'dv.sumDormantConfirmed': 'منها {n} عرضًا مؤكدًا',
  'dv.sumDormantConfirmedHint': 'ملفات راكدة عرضها مؤكد سابقًا — أطول انتظارًا على الأرجح',
  'dv.sumDormantConfirmedOpen': 'فتح القائمة مقصورة على الراكدة المؤكدة — ما ينتظر بعرض جاهز',
  'dv.csvSynthDormantConfirmedRefs': 'الراكدة المؤكدة، ملفًا بملف ({n})',
  'dv.sumDormantCopy': 'نسخ الرابط',
  'dv.sumDormantCopyHint': 'نسخ عنوان القائمة المفتوحة على الملفات الراكدة',
  'dv.listDormantOldestOpen': 'فتح القائمة مقصورة على الملفات الراكدة',
  'dv.lastDormantCopy': 'نسخ رابط الملفات الراكدة',
  'dv.lastDormantCopyHint': 'نسخ عنوان القائمة المفتوحة على الملفات المُعنونة فقط منذ أكثر من سبعة أيام — السطور نفسها التي يعدّها المؤشر',
  'dv.listDormantConfirmedCount': 'راكدة مؤكدة',
  'dv.lastDormantConfirmedPillHint': 'فتح القائمة مقصورة على الملفات الراكدة المؤكدة — ما ينتظر وعرضه مؤكد سابقًا',
  'dv.lastDormantConfirmedCopy': 'نسخ رابط الملفات الراكدة المؤكدة',
  'dv.lastDormantConfirmedCopyHint': 'نسخ عنوان القائمة المفتوحة على الملفات الراكدة التي عرضها مؤكد سابقًا — السطور نفسها التي يعدّها المؤشر',
  'dv.listDormantCount': 'راكدة',
  'dv.listDormantAmountHint': 'المبلغ التراكمي للعروض الراكدة',
  'dv.listDormantConfirmedAmountHint': 'المبلغ التراكمي للعروض الراكدة المؤكدة',
  'dv.listDormantConfirmedCompareHint': 'ما تزنه هذه العروض مقارنة بمبلغ كل الملفات الراكدة',
  'dv.listDormantConfirmedShareHint': 'حصة المبلغ الراكد التي تمثلها العروض المؤكدة',
  'dv.listDormantConfirmedAvg': 'في المتوسط {n} يوم',
  'dv.sumDormantConfirmedAvgOf': '{a} يوم من {b} يوم',
  'dv.listDormantConfirmedAvgCompareHint': 'المدة المتوسطة للعروض الجاهزة، منسوبة إلى المدة المتوسطة لكل الملفات الراكدة — المتوسطان يُقرآن على المنوال نفسه',
  'dv.listDormantConfirmedDevisesHint': 'هذه الدفعة من المؤكدة تخلط عدة أسواق — كل عملة تحفظ مجموعها، ولا يُجمع أي مبلغ',
  'dv.lastDormantPillHint': 'فتح القائمة مقصورة على الملفات الراكدة — مُعنونة فقط منذ أكثر من سبعة أيام ولم تُرسل قط',
  'dv.sumCopy': 'نسخ رابط الملخص',
  'dv.sumCopyHint': 'نسخ عنوان هذا الملخص مع القراءة المفتوحة، لإرساله إلى زميل',
  'dv.csvSynthDormant': 'منها مُعنونة فقط منذ أكثر من سبعة أيام',
  'dv.csvDormantList': 'فتح القائمة مقصورة على الملفات الراكدة',
  'dv.csvSynthDormantConfirmed': 'منها عروض مؤكدة بين الملفات الراكدة',
  'dv.csvSynthDormantConfirmedAgoAvg': 'المدة المتوسطة للراكدة المؤكدة',
  'dv.csvSynthDormantConfirmedAmount': 'مبلغ الراكدة المؤكدة من مبلغ كل الملفات الراكدة',
  'dv.sumDormantConfirmedAmountOf': '{a} من {b}',
  'dv.sumDormantConfirmedShareHint': 'حصة الانتظار الجاهزة للمغادرة',
  'dv.csvSynthDormantConfirmedShare': 'حصة المبلغ الراكد المؤكد',
  'dv.csvDormantConfirmedList': 'فتح القائمة مقصورة على الملفات الراكدة المؤكدة',
  'dv.csvSynthDormantAmount': 'المبلغ التراكمي للعروض الراكدة',
  'dv.csvSynthDormantByDevise': 'حصة الملفات الراكدة حسب العملة، بعدد الملفات',
  'dv.csvSynthDormantDevises': 'عدد أسواق الدفعة الراكدة',
  'dv.csvSynthDormantByDeviseLine': 'منها {devise}',
  'dv.csvSynthDormantByDeviseCount': '{n} عرضًا',
  'dv.listDormantShareHint': 'حصة الانتظار الكلي التي تمثلها العروض الراكدة',
  'dv.listDormantAvg': 'في المتوسط {n} يوم',
  'dv.listDormantAvgHint': 'المدة المتوسطة للعروض الراكدة — تُقرأ من السطور نفسها التي يعدّها المؤشر، مثل المدة المتوسطة للراكدة المؤكدة',
  'dv.sumDormantAvgOf': '{a} يوم من {b} يوم',
  'dv.sumDormantAvgCompareHint': 'المدة المتوسطة للعروض الراكدة منسوبة إلى المدة المتوسطة لكل العروض في القائمة — يُقرأ المتوسطان من السطور نفسها وعلى المنوال نفسه',
  'dv.sumDormantShareOf': '{a} من {b}',
  'dv.listDormantConfirmedShareOfHint': 'حصة العروض الجاهزة منسوبة إلى حصة كل الملفات الراكدة، وكلتاهما من مجموع العروض',
  'dv.sumDormantByDeviseHint': 'توزيع العروض الراكدة حسب العملة — كل سوق يحفظ مجموعه، والحصة تُحسب بعدد الملفات',
  'dv.sumDormantMarketsLongest': 'أطولها: {devise} {n} يوم',
  'dv.sumDormantMarketsLongestHint': 'السوق ذو أطول مدة متوسطة — تُقرأ من ملفاته وحدها وعلى المنوال نفسه',
  'dv.sumDormantDeviseCopyHint': 'نسخ تفصيل سوق {devise}: عدد العروض وحصة الانتظار والمدة المتوسطة',
  'dv.sumDeviseSortAmount': 'حسب المبلغ',
  'dv.sumDeviseSortAvg': 'حسب المدة',
  'dv.sumDeviseSortAmountHint': 'العودة إلى الترتيب حسب المبلغ، الأثقل أولًا',
  'dv.sumDeviseSortAvgHint': 'ترتيب الأسواق حسب المدة المتوسطة تصاعديًا — الأطول انتظارًا يأتي أخيرًا',
  'dv.sumDeviseCopyAll': 'نسخ كل الأسواق',
  'dv.sumDeviseCopyAllHint': 'نسخ سطور الأسواق الموزّعة كلها بضغطة واحدة — سوق في كل سطر، بعدد عروضه وحصته من الانتظار ومدته المتوسطة، جاهزة للصق في رسالة',
  'dv.csvDeviseOrder': 'سطور الأسواق: مرتبة حسب المدة المتوسطة تصاعديًا كما على الشاشة — الأطول انتظارًا يأتي أخيرًا',
  'dv.sumDormantConfirmedByDeviseHint': 'الحصة الجاهزة من كل سوق بين الراكدة المؤكدة — تُنسب الحصة إلى الملفات الراكدة بهذه العملة',
  'dv.sumDormantConfirmedByDevisePart': 'حصة هذا السوق الجاهزة',
  'dv.listDormantDevises': '{n} أسواق',
  'dv.listDormantDevisesHint': 'هذه الدفعة تخلط عدة أسواق — كل عملة تحفظ مجموعها، ولا يُجمع أي مبلغ',
  'dv.csvSynthDormantConfirmedByDevise': 'حصة الراكدة المؤكدة حسب العملة، بعدد الملفات',
  'dv.csvSynthDormantConfirmedDevises': 'عدد أسواق الدفعة المؤكدة',
  'dv.csvSynthDormantConfirmedAgoCompare': 'المدة المتوسطة للراكدة المؤكدة من المدة المتوسطة لكل الملفات الراكدة',
  'dv.csvSynthDormantConfirmedCount': 'الراكدة المؤكدة من كل الملفات الراكدة',
  'dv.sumDormantConfirmedCountOf': '{a} من {b} ملفًا',
  'dv.csvSynthRestoredAgoAvg': 'المدة المتوسطة منذ الإرجاع في الدفعة',
  'dv.csvRestoredAgoAvg': 'في المتوسط {n} يوم',
  'dv.lastAddressedCopy': 'نسخ رابط الملفات المُعنونة',
  'dv.lastAddressedCopyHint': 'نسخ عنوان القائمة المفتوحة على الملفات المُعنونة فقط — لها عنوانها ولم تُرسل قط، وهي السطور نفسها التي يعدّها المؤشر',
  'dv.lastAddressedCountCopy': 'انسخ هذه القراءة',
  'dv.lastAddressedCountCopyHint': 'ينسخ عدد الملفات المُعنونة فقط وعنوان كل واحد منها، جاهزًا للصق في رسالة إلى زميل.',
  'dv.lastAddressedCopyLead': 'ملفات مُعنونة فقط: {n} من {total}',
  'dv.lastAddressedCountCopyRow': '{ref} — {lien}',
  'dv.lastAddressedCountCopyNote': 'هذه الملفات لها عنوانها ولم تُرسل إلى زميل قط: لا مشوركة ولا مُعادة. كل سطر يحمل العنوان الذي يفتح ملفه.',
  'dv.lastForgotOne': 'علامة واحدة أُزيلت',
  'dv.lastForgotMany': '{n} علامات أُزيلت',
  'dv.lastForgotOn': 'أُزيلت في {date}',
  'dv.lastForgotAgo': 'منذ {n} يوم',
  'dv.listForgotHint': 'ملفات هذه القائمة التي أُزيلت علامة مشاركتها — «إرجاع» يعيدها كل واحدة بتاريخها الأصلي',
  'dv.lastForgotHint': 'ملفات هذا التذكير التي أُزيلت علامة مشاركتها — «إرجاع» يعيدها كل واحدة بتاريخها الأصلي',
  'dv.lastForgetOne': 'مشاركة واحدة للمحو',
  'dv.lastForgetMany': '{n} مشاركات للمحو',
  'dv.lastForgetHint': 'ملفات هذا التذكير التي سبق إرسالها إلى زميل — «محو» يزيل علاماتها دون المساس ببقية الحساب',
  'dv.lastSortOn': 'ترتيب «شورك حديثًا» مفعّل: الشريط والقائمة يُفتحان بالترتيب نفسه',
  'dv.lastSortOff': 'فتح الشريط والقائمة بترتيب «شورك حديثًا»',
  'dv.notifiedOn': 'آخر رسالة حالة',
  'dv.notifiedNone': 'لم تُرسل رسالة حالة بعد',
  'dv.lastStamp': 'آخر عرض لك',
  'dv.lastRef': 'المرجع',
  'dv.lastSee': 'عرضه في حسابي',
  'dv.lastFollow': 'تابع هذا الملف',
  'dv.lastOpen': 'افتح تتبع العرض {ref}',
  'dv.lastHide': 'إخفاء هذا التذكير',
  'dv.lastFilterAria': 'اختيار حالة العرض المعروض',
  'dv.lastNone': 'لا يوجد عرض في هذه الحالة. اختر «الكل» لعرض آخر عرض.',
  'dv.lastRelance': 'يُرسل تذكير تلقائيًا إن بقي العرض دون رد بعد سبعة أيام.',
  'dv.lastRelanceHint': 'آخر تذكير أُرسل لهذا العرض',
  'dv.csvFilterLabel': 'الحالة المصفّاة',
  'dv.csvReading': 'القراءة المفتوحة',
  'dv.csvReadingRestored': 'أُعيدت — ملفات عادت بعد إزالة',
  'dv.csvReadingShared': 'شوركت سابقًا — ملفات أُرسلت إلى زميل',
  'dv.csvReadingAddressed': 'عُنوِن فقط — ملفات لها عنوانها ولم تُرسل قط',
  'dv.csvReadingDormant': 'راكدة — ملفات مُعنونة فقط منذ أكثر من سبعة أيام',
  'dv.csvReadingDormantConfirmed': 'راكدة مؤكدة — ملفات راكدة بعرض مؤكد سابقًا',
  'dv.csvDays': 'أيام منذ الإرسال',
  'dv.csvNote': 'تصدير العروض المصفّاة من «حسابي» كما تظهر على الشاشة.',
  'dv.csvSynthTitle': 'الورقة 2 — الملخص: العروض حسب الحالة',
  'dv.csvSynthState': 'الحالة',
  'dv.csvSynthCount': 'عدد العروض',
  'dv.csvSynthShare': 'حصة التصدير',
  'dv.csvSynthTotal': 'مجموع المُصدَّر',
  'dv.csvSynthNote': 'يحسب الملخص فقط العروض المكتوبة في ورقة «العروض»، بحالتها اليوم.',
  'dv.csvSynthLate': 'منها متأخرة',
  'dv.csvSynthBulk': 'منها ما ضمّه ملخص جماعي سابق',
  'dv.csvSynthBulkNever': 'منها ما لم يضمّه أي ملخص جماعي',
  'dv.csvSynthRefsTitle': 'المراجع المرسلة في هذا الملخص ({n})',
  'dv.csvLate': 'متأخر',
  'dv.csvYes': 'نعم',
  'dv.csvNo': 'لا',
  'dv.xlsxCta': 'تصدير إلى Excel',
  'dv.xlsxDone': 'تم تنزيل الملف',
  'dv.xlsxCountUnit': 'عروض',
  'dv.bulkTitle': 'إرسال جماعي للعروض المتأخرة',
  'dv.bulkHint': 'بريد واحد يجمع العروض المحددة بمرجعها ومبلغها.',
  'dv.bulkAll': 'تحديد الكل',
  'dv.bulkNone': 'إلغاء التحديد',
  'dv.bulkSelected': 'محدد',
  'dv.bulkPickOne': 'تحديد العرض {ref}',
  'dv.bulkSend': 'إرسال الملخص الجماعي',
  'dv.bulkSending': 'جارٍ الإرسال…',
  'dv.bulkOk': 'أُرسل ملخص جماعي لـ {n} عروض إلى بريدك.',
  'dv.bulkErr': 'لم يُرسل الملخص الجماعي. أعد المحاولة بعد لحظة.',
  'dv.bulkXlsxCta': 'تصدير الملخص الجماعي إلى Excel',
  'dv.bulkXlsxScope': '{n} عروض من ملخص {date} الجماعي',
  'dv.bulkXlsxNote': 'لا يحوي الملف إلا عروض هذا الملخص الجماعي، مع يوم إرسالها.',
  'dv.remindLate': 'هذا العرض ينتظر ردّك منذ {days} يومًا. يُرسل تذكير تلقائيًا بعد سبعة أيام، إلا إذا رددت قبل ذلك.',
  'dv.remindSent': 'أُرسل إليك تذكير في {date}، والعرض ما زال ينتظر ردّك.',
  'dv.remindOpen': 'افتح الملف',

  'dv.fFormula': 'الصيغة',
  'dv.fDuree': 'المدة',
  'dv.fTotal': 'مبلغ المدة',
  'dv.fParMois': 'ما يعادله شهريًا',
  'dv.fPlein': 'بسعر الشهر دون التخفيض',
  'dv.fSites': 'المؤسسات',
  'dv.fMarche': 'السوق',
  'dv.fRythme': 'الفاتورة',
  'dv.fForfait': 'أساس المدة',
  'dv.fSitesSup': 'مؤسسات إضافية',
  'dv.fMensuel': 'المجموع الشهري',
  'dv.fAnnuel': 'المجموع السنوي',
  'dv.fEconomie': 'خصم سنوي',

  'dv.p1': 'دون مبلغ: التسجيل يبقى حرًا.',
  'dv.p2': 'سعر مؤسسة واحدة، ثم سعر مخفّض لكل مؤسسة تالية.',
  'dv.p3': 'رسم للمؤسسة، ثم سعر مخفّض لكل مؤسسة تابعة.',
};

const en: Dict = {
  'dv.stamp': 'Subscription quote',
  'dv.title': 'Build your subscription, read the amount before sending it',
  'dv.sub': 'Three settings are enough: the length, the number of establishments and the market. The amount of that length is recalculated on every move, and the request leaves with it already written in.',
  'dv.pageTitle': 'Your subscription quote, online',
  'dv.pageLede': 'Build the need, read the amount, then send the request: a contact picks it up and confirms the quote.',

  'dv.formule': 'Plan',
  'dv.duree': 'Length',
  'dv.dureeRetenue': 'Length retained',
  'dv.dureeMissing': 'Length not recorded',
  'dv.dureeMissingHint': 'This file was opened before the retained length was kept: it is missing here, but the quote still stands.',
  'dv.lastNoDuree': '{n} without a length',
  'dv.lastNoDureeHint': 'Files in this strip opened before the retained length was kept: it is not written there, but every quote still stands.',
  'dv.months': 'months',
  'dv.perDuree': 'for the length',
  'dv.totalDuree': 'Amount for the length',
  'dv.parMoisDur': 'That is, per month',
  'dv.prixPlein': 'At the monthly price, without the discount',
  'dv.sites': 'Establishments',
  'dv.sitesHint': 'One account, several sites: every establishment past the first is billed at the reduced rate.',
  'dv.sitesAria': 'Number of establishments',
  'dv.moins': 'Remove an establishment',
  'dv.plus': 'Add an establishment',
  'dv.marche': 'Market',
  'dv.rythme': 'Billing',
  'dv.month': 'Monthly',
  'dv.year': 'Yearly',
  'dv.perMonth': 'per month',
  'dv.perYear': 'per year',

  'dv.quoteStamp': 'The amount',
  'dv.quoteTitle': 'Your quote, line by line',
  'dv.forfait': 'Base plan',
  'dv.forfaitInclus': 'establishment included',
  'dv.forfaitInclusMany': 'establishments included',
  'dv.sitesSup': 'Additional establishments',
  'dv.mensuel': 'Monthly total',
  'dv.annuel': 'Yearly total',
  'dv.annuelPlain': 'Without the annual discount',
  'dv.saving': 'You save',
  'dv.free': 'Free',
  'dv.freeNote': 'The Directory stays free, whatever the number of establishments.',
  'dv.offre': '20% discount',
  'dv.indicative': 'Indicative estimate: the quote is confirmed by a contact before any billing.',
  'dv.parSite': 'Per establishment, per month',
  'dv.fParSite': 'Price per establishment, per month',
  'dv.origine': 'i.e.',

  'dv.requestStamp': 'Send the request',
  'dv.requestTitle': 'Receive this quote in writing',
  'dv.name': 'Full name',
  'dv.namePh': 'Amina Belkacem',
  'dv.email': 'Email',
  'dv.emailPh': 'you@example.com',
  'dv.org': 'Organisation',
  'dv.orgPh': 'El Manar Printing',
  'dv.phone': 'Phone',
  'dv.start': 'Desired start date',
  'dv.startHint': 'The date the subscription should start — it is repeated on the printed summary.',
  'dv.msg': 'Details',
  'dv.msgPh': 'Sites concerned, target date, billing constraints…',
  'dv.send': 'Request this quote',
  'dv.sending': 'Sending…',
  'dv.reset': 'Build another quote',
  'dv.length': 'characters',
  'dv.ok': 'The request left with your amount, and the quote summary has just been emailed to you.',
  'dv.okNoMail': 'The quote is saved with the amount below. The summary could not be emailed right now: keep the reference, it follows your file.',
  'dv.okHint': 'A contact picks the request up and confirms the amount before any billing.',
  'dv.ref': 'Reference',
  'dv.errName': 'A name and an email are needed to answer the request.',
  'dv.errLong': 'The message is over 500 characters.',
  'dv.errSend': 'The request could not leave. Try again in a moment.',
  'dv.errNet': 'Connection failed. Check your network, then try again.',
  'dv.required': 'Required field',

  'dv.ctaCard': 'Request a quote',
  'dv.ctaCardTip': 'Build a structure quote, with the amount shown before sending',
  'dv.toComposer': 'Build the quote',
  'dv.acctTitle': 'Subscription quote',
  'dv.acctSub': 'Add establishments or change plan: the amount is recalculated here, before sending.',
  'dv.errCompte': 'The quote cannot be computed right now.',

  'dv.listTitle': 'Sent quotes',
  'dv.listSub': 'Every quote built with this account, its amount and its state — the summary is emailed too.',
  'dv.listEmpty': 'No quote sent yet. Build one just above: it will appear here with its reference.',
  'dv.listError': 'The sent quotes cannot be loaded right now.',
  'dv.listRetry': 'Try again',
  'dv.listLoading': 'Loading quotes…',
  'dv.listCount': 'quotes sent',
  'dv.listSharedCount': 'already shared',
  'dv.listSharedHint': 'Dossiers of this list already handed to a colleague by their address — outside the restored ones, counted apart',
  'dv.listSharedLast': 'last on {date}',
  /* The « restored » pill of the head, just beside the shared counter. */
  'dv.listRestoredCount': 'restored',
  'dv.listRestoredHint': 'Dossiers of this list that came back after an erasure — click to see only those',
  'dv.listRestoredFoldHint': 'Open the restored dossiers one by one — past ten, the list folds',
  /* The restored pill is shared like the shares one on the « Offres » strip:
     one click, and the colleague opens those very lines. */
  'dv.listRestoredCopy': 'Copy the restored dossiers link',
  'dv.listRestoredCopyHint': 'Copy the address of the list opened on the dossiers that came back after an erasure',
  'dv.listSites': 'establishments',
  'dv.listSentOn': 'Sent on',
  'dv.listCompose': 'Build a quote',
  'dv.listNote': 'The state is updated by the contact following the file.',
  'dv.listKey': 'Up and down arrows to pick a quote · Enter opens its tracking page · Escape puts the list back at rest.',
  'dv.keyWalk': '{n} quotes walked with the keyboard',
  'dv.keyWalkOpen': 'Reopen the last highlighted quote: {ref}',
  'dv.keyOpened': '{n} dossiers opened since the reopened card',
  'dv.keyOpenedHint': 'Counts the dossiers opened since card {ref} was recalled with the keyboard: each dossier counts once, even when reopened.',
  'dv.keyOpenedCopy': 'Copy this count',
  'dv.keyOpenedCopyHint': 'Copy the recalled card {ref} and the dossiers opened since, one per line, as text ready to paste into a message.',
  'dv.keyOpenedCopyHead': 'Recalled card {ref} — {n} dossiers opened since:',
  'dv.sumTitle': 'Your quotes at a glance',
  'dv.sumReceived': 'quotes received',
  'dv.sumReview': 'under review',
  'dv.sumConfirmed': 'confirmed',
  'dv.sumExpired': 'expired',
  'dv.sumLate': 'overdue',
  'dv.sumLateHint': 'Quotes received with no reply for seven days — click to see only those',
  'dv.sumNever': 'never in a group',
  'dv.sumNeverHint': 'Quotes no group summary has ever carried — click to see only those and open the group send of the overdue ones',
  'dv.sumBulkOnly': 'Show only quotes already in a group summary',
  'dv.sumBulkOnlyOff': 'Back to all quotes',
  'dv.sumBulkOnlyHint': 'Keeps only the quotes a group summary has already carried',
  'dv.sumGroup': 'already in a group',
  'dv.sumGroupHint': 'Quotes already sent in a group summary — click to see only those',
  'dv.sumBulkNone': 'No quote in this reading has gone out in a group summary yet.',
  'dv.sumBulkNeverOnly': 'Show only quotes never in a group summary',
  'dv.sumBulkNeverOnlyOff': 'Back to quotes never in a group',
  'dv.sumBulkNeverOnlyHint': 'Keeps only the quotes no group summary has ever carried — and opens the group send of the overdue ones',
  'dv.sumBulkNeverNone': 'Every quote in this reading has already gone out in a group summary.',
  'dv.sumBulkNeverBulk': 'These quotes have never been carried in a group summary: the group send ticks {n} of them.',
  'dv.sumLastBulk': 'Last group summary on {date} — {n} quotes',
  'dv.sumLastBulkHint': 'The last group send that carried quotes from this list',
  'dv.st.recu': 'Received',
  'dv.st.en_etude': 'Under review',
  'dv.st.confirme': 'Confirmed',
  'dv.st.expire': 'Expired',
  'dv.filterAll': 'All',
  'dv.filterAria': 'Filter quotes by state',
  'dv.filterNone': 'No quote in this state right now. Choose “All” to see the whole list.',
  'dv.filterLate': 'Overdue',
  'dv.filterLateHint': 'Quotes received with no reply for seven days',
  'dv.filterLateNone': 'No overdue quote: everything received has been answered or already settled.',
  'dv.filterLateOff': 'See all quotes',
  'dv.filterShared': 'Already shared',
  'dv.filterSharedHint': 'Keep only the dossiers already handed to a colleague',
  'dv.filterSharedNone': 'No dossier in this reading has been handed to a colleague yet.',
  'dv.filterSharedOff': 'See all quotes',
  /* A seventh chip, beside the shared dossiers: the ones whose mark came back
     after an erasure, so only what really returned is on screen. */
  'dv.filterRestored': 'Restored',
  'dv.filterRestoredHint': 'Keep only the dossiers whose mark was restored after an erasure',
  'dv.filterRestoredNone': 'No dossier in this reading has been restored yet.',
  'dv.filterRestoredOff': 'See all quotes',
  /* The eighth chip, following the two other readings: dossiers carrying their
     address but never handed over — neither shared nor restored. */
  'dv.filterAddressed': 'Addressed only',
  'dv.filterAddressedHint': 'Keep only the dossiers carrying their address but never handed to a colleague, outside the shared and restored ones',
  'dv.filterAddressedNone': 'No dossier in this reading is addressed only: they have all circulated or come back.',
  'dv.filterAddressedOff': 'See all quotes',
  /* The pill of the dossiers that sleep: addressed only, never handed over for
     over a week. */
  'dv.filterDormant': 'Dormant',
  'dv.filterDormantHint': 'Keep only the dossiers addressed only for over seven days — never handed over, never restored',
  'dv.filterDormantNone': 'No dormant dossier: no addressed-only dossier has been waiting for over seven days.',
  'dv.filterDormantOff': 'See all quotes',
  /* The pill of the dormant dossiers whose quote is already confirmed: among
     those asleep, the ones waiting for nothing — the quote is ready. */
  'dv.filterDormantConfirmed': 'Dormant confirmed',
  'dv.filterDormantConfirmedHint': 'Keep only the dossiers that sleep while their quote is already confirmed — the quote is ready, it has never circulated',
  'dv.filterDormantConfirmedNone': 'No dormant dossier carries a confirmed quote: nothing sleeps with a quote already settled.',
  'dv.filterDormantConfirmedOff': 'See all quotes',
  /* The pill of the dossiers without a length: opened before the retained
     length was kept. One click keeps them alone, like the other readings. */
  'dv.filterNoDuree': 'No length',
  'dv.filterNoDureeHint': 'Keep only the dossiers whose length was not recorded — opened before the retained length was kept, the quote still stands',
  'dv.filterNoDureeNone': 'No dossier in this reading is missing its length: every one carries its retained length.',
  'dv.filterNoDureeOff': 'See all quotes',
  /* The same reading arrives through a shared address: the line names what the
     colleague has on screen. */
  'dv.sharedNoDureeNote': 'Shared link: “No length” reading — {n} dossiers shown',
  /* The inherited lengths counter, on the « Offres » strip: the dossiers whose
     length does not match the one kept on this device. */
  'dv.lastRythmeDiff': '{n} inherited lengths',
  'dv.lastRythmeDiffHint': 'Dossiers in this note whose length does not match the rhythm kept on this device ({duree}) — their length comes from an older setting',
  /* The “no length” counter of the strip is a door too: one click opens the
     list narrowed to those very dossiers. */
  'dv.lastNoDureeFilterHint': 'Open the list narrowed to the dossiers missing their length — those opened before the retained length was kept',
  /* The “no length” reading is copied from the strip: the count, then each
     dossier with its address, ready to paste into a message. */
  'dv.lastNoDureeCopy': 'Copy this reading',
  'dv.lastNoDureeCopyHint': 'Copies the count of dossiers without a length and the address of each one, ready to paste into a message to a colleague.',
  'dv.lastNoDureeCopyLead': 'Dossiers without a length: {n} of {total}',
  'dv.lastNoDureeCopyRow': '{ref} — {lien}',
  'dv.lastNoDureeCopyNote': 'These dossiers were opened before the retained length was kept: it is not written there, but every quote still stands. Each line carries the address of its dossier.',
  /* The exact reading: the “inherited · 6 months” token of a line opens the list
     narrowed to the dossiers written for that very length. */
  'dv.filterDureeExact': 'Length · {n} months',
  'dv.filterDureeExactHint': 'Keep only the dossiers written for that very length — {n} months, as written in the dossier',
  'dv.filterDureeExactNone': 'No dossier in this reading is written for {n} months.',
  'dv.filterDureeExactOff': 'See all quotes',
  'dv.sharedDureeNote': 'Shared link: “Length · {n} months” reading — {m} dossiers shown',
  /* The token of a line is a door: its bubble says where it leads. */
  'dv.rowRythmeHeriteDoorHint': 'Open the list narrowed to the dossiers written for that very length — {n} months',
  /* The inherited lengths reading is copied from its counter, like the one
     without a length: the count, then the exact rhythm of each line. */
  'dv.lastRythmeDiffCopy': 'Copy this reading',
  'dv.lastRythmeDiffCopyHint': 'Copies the count of inherited lengths, then each dossier with the number of months that produced it and the address that opens it, ready to paste into a message to a colleague.',
  'dv.lastRythmeDiffCopyLead': 'Inherited lengths: {n} of {total}',
  'dv.lastRythmeDiffCopyRow': '{ref} · {mois} months — {lien}',
  'dv.lastRythmeDiffCopyNote': 'These dossiers carry a length that no longer matches the rhythm kept on this device ({duree}): it comes from an older setting. Each line carries the number of months written at send time and the address of its dossier.',
  /* The inherited lengths counter is a door too: one click opens the list
     narrowed to those very dossiers. */
  'dv.lastRythmeDiffFilterHint': 'Open the list narrowed to the dossiers whose length comes from an older setting — those that do not match the rhythm kept on this device',
  'dv.filterRythme': 'Inherited lengths',
  'dv.filterRythmeHint': 'Keep only the dossiers whose length does not match the rhythm kept on this device — it comes from an older setting',
  'dv.filterRythmeNone': 'No dossier in this reading has an inherited length: all of them match the rhythm kept on this device.',
  'dv.filterRythmeOff': 'See all quotes',
  'dv.sharedRythmeNote': 'Shared link: “Inherited lengths” reading — {n} dossiers shown',
  /* The exact rhythm that produced the length, on the dossier line: the number
     of months written at send time, and the rhythm this device keeps today. */
  'dv.rowRythmeHerite': 'inherited · {n} months',
  'dv.rowRythmeHeriteHint': 'This length was written for {n} months, while this device now keeps {duree} ({m} months) — it comes from an older setting.',
  'dv.sortRecent': 'Recently shared',
  'dv.sortRecentHint': 'Bring the dossiers that have just circulated to the top, newest share first',
  /* The “recently opened” order: last-viewed dossiers first. */
  'dv.sortOpened': 'Recently opened',
  'dv.sortOpenedHint': 'Bring the last-viewed dossiers to the top, newest visit first — dossiers never opened keep their place after them',
  'dv.sortOpenedCopy': 'Copy this order',
  'dv.sortOpenedCopyHint': 'Copies the dossiers in the “recently opened” order, each with its visit date, as text ready to paste into a message.',
  'dv.sortOpenedCopyHead': 'Recently opened · {n} dossiers:',
  'dv.sortOpenedCopyNever': 'never opened',

  'dv.resend': 'Resend the summary',
  'dv.resending': 'Sending…',
  'dv.resendOk': 'The summary has just been sent again to your address.',
  'dv.resendErr': 'It could not be sent. Try again in a moment.',
  'dv.follow': 'Follow this file',
  'dv.followHint': 'Open the tracking page with this reference already filled in',
  'dv.relanceOn': 'Reminder sent on',
  'dv.recapGroupOn': 'Group summary on',
  'dv.recapGroupHint': 'The last group send that carried this quote',
  'dv.recapGroupCol': 'Group summary sent on',
  'dv.csvLinkCol': 'Quote address',
  /* One more column in the « Devis » tab: what each dossier became — shared,
     restored after an erasure, or only addressed. */
  'dv.csvShareStateCol': 'Dossier situation',
  'dv.csvShareStateShared': 'Shared with a colleague',
  'dv.csvShareStateRestored': 'Restored after an erasure',
  'dv.csvShareStateAddressed': 'Addressed only',
  'dv.csvSharedMark': 'last share of the lot: {date}',
  /* One more column: the trace of the marks taken off, so a sheet read later
     still says that a dossier circulated. */
  'dv.csvForgotCol': 'Forgotten line',
  'dv.csvForgotMark': 'mark removed on {date} · shared on {shared}',
  /* The mirror of the erasure column: the day the mark came back, with the day
     the dossier had been shared. */
  'dv.csvRestoredMark': 'mark restored on {date} · shared on {shared}',
  'dv.rowSharedOn': 'shared on {date}',
  'dv.rowSharedHint': 'This dossier has already been handed to a colleague by its address',
  /* The mirror of the share badge: a dossier that came back after an erasure
     says, on its own line, the day it returned. */
  'dv.rowRestoredOn': 'restored on {date}',
  'dv.rowRestoredHint': 'This dossier came back after an erasure — the day it returned is written in the workbook, dossier by dossier',
  /* The last visit of the dossier, quietly on its line. */
  'dv.rowOpenedOn': 'opened on {date}',
  'dv.rowOpenedHint': 'The last time this dossier was consulted — the very date the “recently opened” order uses',
  'dv.forgetShares': 'Forget the shares',
  'dv.forgetSharesHint': 'Erase this account’s share marks, without touching the other settings',
  'dv.forgetSharesText': 'Erase the {n} share marks of this account? The dossier addresses stay whole: only the “shared on …” badges disappear. The workbook keeps the trace, with the day of each removal.',
  'dv.forgetSharesYes': 'Forget these marks',
  'dv.forgetSharesNo': 'Cancel',
  'dv.forgetSharesOk': 'This account’s share marks are erased.',
  'dv.rowForgetShare': 'Forget',
  'dv.rowForgetShareHint': 'Erase this dossier’s share mark, without touching the others',
  'dv.rowForgetShareOk': 'This dossier’s share mark is erased.',
  'dv.rowRestoreShare': 'Restore',
  'dv.rowRestoreShareHint': 'Put this dossier’s mark back, with the day it had been shared',
  'dv.rowRestoreShareOk': 'This dossier’s share mark is restored, with its original day.',
  'dv.restoreShares': 'Restore {n} marks',
  'dv.restoreSharesHint': 'Put the erased marks back, each with the day its dossier had been shared',
  /* The summary split into three situations that add up to the total: shared,
     restored, addressed only. */
  'dv.csvSynthSituation': 'Dossier situation',
  'dv.csvSynthSituationTotal': 'Total of situations',
  'dv.csvSynthShared': 'of which already shared with a colleague (outside restored dossiers)',
  /* Among those circulating dossiers, the ones whose quote is confirmed. */
  'dv.csvSynthSharedConfirmed': 'of which confirmed quotes already shared',
  'dv.csvSynthConfirmedToShare': 'of which confirmed quotes still to share',
  /* The day of the most recent share of the exported lot, named in the summary. */
  'dv.csvSynthLastShare': 'Last share of the exported lot',
  /* The return link of the summary: the sheet reopens the list narrowed to the
     restored dossiers, so no filter has to be set again. */
  'dv.csvRestoredList': 'Open the list narrowed to the restored dossiers',
  'dv.csvSynthForgot': 'of which marks taken off',
  'dv.csvSynthRestored': 'of which dossiers restored after an erasure',
  /* The sheet does not only count: it names the marks taken off, one line per
     dossier, with both of their days. */
  'dv.csvSynthForgotRefs': 'Marks taken off, dossier by dossier ({n})',
  'dv.csvSharedOnCol': 'Shared on',
  'dv.csvForgotOnCol': 'Mark taken off on',
  'dv.csvSynthRestoredRefs': 'Marks restored, dossier by dossier ({n})',
  'dv.csvRestoredOnCol': 'Mark restored on',
  'dv.csvRestoredAgoCol': 'Time since restore',
  'dv.csvRestoredAgo': 'for {n} d',
  'dv.markSeeAll': 'See all ({n})',
  'dv.markSeeLess': 'Show less',
  /* The summary compares both gestures of the lot on one line: what was taken
     off, what came back, and what still waits to be given back. */
  'dv.sumMarksCompare': '{n} marks taken off · {r} restored — {k} still to give back',
  'dv.sumMarksCompareHint': 'What the lot took off, what it gave back, and what still waits to be restored',
  /* The day of the last restoration, set beside the comparison line: the
     gesture is dated without opening the workbook. */
  'dv.sumMarksRestoredOn': 'last restored on {date}',
  /* The date is a door: one click opens the bubble on the restored dossiers,
     each with the day it came back and the time elapsed since. */
  'dv.sumMarksRestoredHint': 'Open the restored dossiers, each with the day it came back',
  'dv.sumMarksRestoredHead': '{n} marks restored, dossier by dossier',
  'dv.lastRestoredOn': 'restored on {date}',
  'dv.lastRestoredAgo': 'for {n} d',
  /* The workbook summary dates the last restoration, like the screen does. */
  'dv.csvSynthLastRestored': 'Last restoration of the exported lot',
  'dv.lastBulkTitle': 'Quotes unanswered for seven days',
  'dv.lastBulkText': '{n} quotes are waiting for your reply. One single email gathers them all, with their reference and amount.',
  'dv.lastBulkSend': 'Send the group summary',
  'dv.lastBulkSending': 'Sending…',
  'dv.lastBulkOk': 'A group summary of {n} quotes has been sent to your address.',
  'dv.lastBulkErr': 'The group summary could not be sent. Try again in a moment.',
  'dv.lastBulkResend': 'Resend the summary',
  'dv.lastBulkRecent': 'Already sent on {date} — this new send will replace it.',
  'dv.lastBulkNever': '{n} of these quotes have never been carried in a group summary.',
  'dv.lastBulkGroup': '{n} of these quotes have already gone out in a group summary.',
  'dv.lastBulkNeverSee': 'See the quotes never carried in a group',
  'dv.lastGroupSee': 'See the quotes already carried in a group',
  'dv.shareCta': 'Copy the link',
  'dv.shareHint': 'Copy the address of this reading, to send it to a colleague',
  'dv.sharedNote': 'Shared link: {n} quotes shown in this reading',
  'dv.sharedNoteOff': 'Hide this reminder',
  'dv.sharedRefNote': 'Shared link: a single quote shown, {ref}',
  'dv.sharedRefNone': 'That link pointed at quote {ref}, which is not in this list.',
  'dv.sharedRefSeeAll': 'See the whole list again',
  /* The “already shared” reading arrives with the link: the line names it. */
  'dv.sharedSharedNote': 'Shared link: “Already shared” reading — {n} dossiers shown',
  'dv.sharedAddressedNote': 'Shared link: “Addressed only” reading — {n} dossiers shown',
  'dv.sharedDormantNote': 'Shared link: “Dormant” reading — {n} dossiers shown',
  'dv.sharedDormantConfirmedNote': 'Shared link: “Dormant confirmed” reading — {n} dossiers shown',
  'dv.csvSortNote': '“Devis” tab: restored dossiers first, most recent return on top, then the others in the order of the list',
  'dv.rowShare': 'Copy the link',
  'dv.rowShareHint': 'Copy the address of this reading narrowed to quote {ref}, to send it to a colleague',
  /* One single dossier copied from its restored line: its tracking address. */
  'dv.rowCopyFollow': 'Copy the link',
  'dv.rowCopyFollowHint': 'Copy the tracking address of dossier {ref}, to send it to a colleague',
  'dv.lastBulkShare': 'Copy the link to this reading',
  'dv.lastShareOne': 'Copy this quote’s link',
  /* The “already shared” reading is copied from the strip, without the list. */
  'dv.lastSharedCopy': 'Copy the shares link',
  'dv.lastSharedCopyHint': 'Copy the address of the list opened on the dossiers already handed to a colleague, outside the restored ones — the very lines the counter counts',
  /* The reminder on the « Offres » strip: the dossiers already circulating. */
  /* The share pill no longer counts the dossiers that came back: those have
     their own pill, so the two numbers never overlap. */
  'dv.lastSharedHint': 'Dossiers in this note already handed to a colleague — outside the restored ones, counted apart',
  'dv.lastRestoredHint': 'Dossiers in this note that came back after an erasure — counted apart from the already shared ones, and the date says when the last one returned',
  'dv.lastRestoredSee': 'See the restored dossiers',
  /* The restored pill is a door too: one click opens the list narrowed to those
     very dossiers, hence the very lines the counter counts. */
  'dv.lastRestoredPillHint': 'Open the list narrowed to the dossiers that came back after an erasure — the very lines this counter counts',
  /* The third count of the strip: dossiers carrying their address but never
     handed over, beside the shared and the restored ones. */
  'dv.listAddressedCount': 'addressed only',
  'dv.lastAddressedHint': 'Dossiers in this note that carry their address but were never handed to a colleague — outside the shared and restored ones, counted apart',
  /* The third pill is shared like the other two: its address carries the
     addressed-only reading, without opening the list. */
  'dv.listAddressedLast': 'last on {date}',
  'dv.lastAddressedPillHint': 'Open the list narrowed to the addressed-only dossiers — carrying their address but never handed over, the very lines this counter counts',
  /* The same pill, in the head of the list: it opens that reading too. */
  'dv.listAddressedHint': 'Dossiers of this list carrying their address but never handed over — click to see only those',
  /* The same pill, in the on-screen summary: the counter enters it too, and the
     cell is a direct link to that reading — the summary becomes a door. */
  'dv.sumAddressed': 'addressed only',
  'dv.sumAddressedHint': 'Dossiers carrying their address but never handed over — open the list narrowed to those very dossiers',
  'dv.sumAddressedSee': 'Open the list narrowed to the addressed-only dossiers',
  /* The dormant link is copied from the head pill, like the restored one. */
  'dv.listDormantCopy': 'Copy the dormant link',
  'dv.listDormantCopyHint': 'Copy the address of the list opened on the dossiers addressed only for over seven days',
  'dv.listDormantOldest': 'oldest waiting since {date}',
  'dv.listDormantOldestHint': 'The oldest of the addressed-only dossiers has been waiting since that day',
  'dv.sumDormant': '{n} dossiers asleep for over seven days — addressed only, never handed over',
  'dv.sumDormantHint': 'Open the list narrowed to those very dormant dossiers',
  /* Among the dossiers that sleep, the ones whose quote is already confirmed:
     the count says how many wait for nothing, beside the date. */
  'dv.sumDormantConfirmed': 'of which {n} confirmed quotes',
  'dv.sumDormantConfirmedHint': 'Dormant dossiers whose quote is already confirmed — the ones waiting perhaps the most',
  /* The count says how many, and is a door too: one click opens the list
     narrowed to those very dossiers — the quote is ready, the send is missing. */
  'dv.sumDormantConfirmedOpen': 'Open the list narrowed to the dormant confirmed dossiers — the ones asleep with a quote already ready',
  /* The workbook names those dossiers one by one, under their count. */
  'dv.csvSynthDormantConfirmedRefs': 'Dormant confirmed, dossier by dossier ({n})',
  /* The dormant link is copied from the summary line, as from the head pill. */
  'dv.sumDormantCopy': 'Copy the link',
  'dv.sumDormantCopyHint': 'Copy the address of the list opened on the dormant dossiers',
  /* The oldest dormant date, in the head, is a door: one click opens the list
     narrowed to those very dossiers. */
  'dv.listDormantOldestOpen': 'Open the list narrowed to the dormant dossiers',
  'dv.lastDormantCopy': 'Copy the dormant link',
  'dv.lastDormantCopyHint': 'Copy the address of the list opened on the dossiers addressed only for over seven days — the very lines the counter counts',
  /* The dormant confirmed pill, right beside the dormant one: among the dossiers
     asleep, the ones whose quote is already confirmed. */
  'dv.listDormantConfirmedCount': 'dormant confirmed',
  'dv.lastDormantConfirmedPillHint': 'Open the list narrowed to the dormant confirmed dossiers — the ones asleep while their quote is already confirmed',
  'dv.lastDormantConfirmedCopy': 'Copy the dormant confirmed link',
  'dv.lastDormantConfirmedCopyHint': 'Copy the address of the list opened on the dossiers asleep with an already confirmed quote — the very lines the counter counts',
  'dv.listDormantCount': 'dormant',
  /* The cumulated amount of the still dormant quotes, set beside their count. */
  'dv.listDormantAmountHint': 'Cumulated amount of the still dormant quotes',
  /* The cumulated amount of the dormant confirmed ones, set beside their pill:
     among the sleeping dossiers, what the already ready quotes weigh. */
  'dv.listDormantConfirmedAmountHint': 'Cumulated amount of the dormant quotes whose offer is already confirmed',
  /* The same comparison as in the summary, carried by the header pill: what
     the ready quotes weigh, set against the whole wait. */
  'dv.listDormantConfirmedCompareHint': 'What these quotes weigh, set against the amount of all the dormant ones',
  /* And the share they represent: the raw ratio reads at a glance, the
     percentage says the proportion. */
  'dv.listDormantConfirmedShareHint': 'Share of the dormant amount that the already confirmed quotes represent',
  'dv.listDormantConfirmedAvg': 'on average {n} d',
  /* The average delay set against the whole dormant one, exactly as the
     amounts already are: the confirmed average no longer reads alone. */
  'dv.sumDormantConfirmedAvgOf': '{a} d out of {b} d',
  'dv.listDormantConfirmedAvgCompareHint': 'Average delay of the already ready quotes, set against all the dormant ones — both averages read on the same clock',
  /* The number of markets the dormant confirmed pill mixes, like the dormant
     one: the count says how many sleep with a ready quote, this token says on
     how many currencies. */
  'dv.listDormantConfirmedDevisesHint': 'This lot of confirmed ones mixes several markets — each currency keeps its total, no amount is ever summed across them',
  'dv.lastDormantPillHint': 'Open the list narrowed to the dormant dossiers — addressed only for over seven days, never handed over',
  'dv.sumCopy': 'Copy the summary link',
  'dv.sumCopyHint': 'Copy the address of this summary, with the reading open, to send it to a colleague',
  /* The summary names the addressed-only dossiers asleep for over a week: what
     has never circulated and is still waiting. */
  'dv.csvSynthDormant': 'of which addressed only for over seven days',
  /* The dormant line is a door: the summary opens it on the list narrowed to
     those very dossiers. */
  'dv.csvDormantList': 'Open the list narrowed to the dormant dossiers',
  /* The line of the dormant dossiers whose quote is already confirmed: the
     workbook says how many they are, and carries the same copyable address as
     the line above — the colleague opens those very dossiers. */
  'dv.csvSynthDormantConfirmed': 'of which confirmed quotes among the dormant ones',
  /* The sheet does not only say how many: it names how long these dossiers
     have been asleep on average, beside their count. */
  'dv.csvSynthDormantConfirmedAgoAvg': 'Average delay of the dormant confirmed ones',
  /* The summary does not only count them: it weighs the confirmed amount
     against the whole dormant one. */
  'dv.csvSynthDormantConfirmedAmount': 'Amount of the confirmed dormant ones, out of all the dormant ones',
  'dv.sumDormantConfirmedAmountOf': '{a} out of {b}',
  'dv.sumDormantConfirmedShareHint': 'Share of the wait already ready to leave',
  /* The percentage the confirmed amount represents, beside the raw ratio in
     the workbook summary. */
  'dv.csvSynthDormantConfirmedShare': 'Share of the dormant amount already confirmed',
  'dv.csvDormantConfirmedList': 'Open the list narrowed to the dormant confirmed dossiers',
  /* The cumulated amount of the still dormant quotes, with its currency, just
     under their count. */
  'dv.csvSynthDormantAmount': 'Cumulated amount of the still dormant quotes',
  /* A lot mixing several markets is never summed: under the total, each
     currency says the place its dossiers hold in the lot. */
  'dv.csvSynthDormantByDevise': 'Share of the dormant files per currency, in dossiers',
  /* The number of markets the dormant lot mixes, named just before its split:
     the sheet says on how many currencies it unfolds. */
  'dv.csvSynthDormantDevises': 'Number of markets in the dormant lot',
  'dv.csvSynthDormantByDeviseLine': 'of which {devise}',
  /* The number of quotes each market carries in the dormant lot, set beside its
     share of the wait: “3 quotes · 40 %”. */
  'dv.csvSynthDormantByDeviseCount': '{n} quotes',
  /* The share of the whole wait the dormant ones carry, beside their count. */
  'dv.listDormantShareHint': 'Share of the whole wait that the still dormant quotes represent',
  /* The average delay of the dormant lot, set beside its share of the wait:
     the percentage says what it weighs, the average says how long those
     dossiers have been waiting — read on the same rows as their counter. */
  'dv.listDormantAvg': 'on average {n} d',
  'dv.listDormantAvgHint': 'Average delay of the still dormant quotes — read on the same rows as their counter, like the dormant confirmed one',
  /* The dormant lot average set against the whole quote list: the on-screen
     summary compares both averages, as it already compares amounts. */
  'dv.sumDormantAvgOf': '{a} d out of {b} d',
  'dv.sumDormantAvgCompareHint': 'Average delay of the still dormant quotes, set against the whole quote list — both averages read on the same rows and the same clock',
  /* The two shares of the wait, one set against the other on the « Offres »
     strip: the ready quotes and the whole dormant lot, taken on the same whole. */
  'dv.sumDormantShareOf': '{a} out of {b}',
  'dv.listDormantConfirmedShareOfHint': 'Share of the already ready quotes, set against the share of the whole dormant lot — both read on the whole quote list',
  /* The split per currency when the reading mixes several markets: each
     currency says what it weighs and the place of its dossiers in the lot. */
  'dv.sumDormantByDeviseHint': 'Split of the still dormant quotes per currency — each market keeps its total, the share is counted in dossiers',
  /* The market waiting the longest, beside the number of markets: the summary
     names it at a glance, never summing two currencies. */
  'dv.sumDormantMarketsLongest': 'longest: {devise} {n} d',
  'dv.sumDormantMarketsLongestHint': 'The market with the longest average delay — read on its own dossiers, on the same clock as the other markets',
  /* Each token of the split copies itself: its market, its quotes, its share of
     the wait and its average delay, on a single line. */
  'dv.sumDormantDeviseCopyHint': 'Copy the detail of market {devise}: number of quotes, share of the wait and average delay',
  /* The order of the split tokens: by amount, or by ascending average delay —
     the market waiting the longest then reads last. */
  'dv.sumDeviseSortAmount': 'By amount',
  'dv.sumDeviseSortAvg': 'By delay',
  'dv.sumDeviseSortAmountHint': 'Back to the amount order, heaviest first',
  'dv.sumDeviseSortAvgHint': 'Sort the markets by ascending average delay — the one waiting the longest reads last',
  /* Every market in one gesture: one market per line, ready to paste into a
     summary message. */
  'dv.sumDeviseCopyAll': 'Copy all markets',
  'dv.sumDeviseCopyAllHint': 'Copy the whole line of split markets in one click — one market per line, with its quotes, its share of the wait and its average delay, ready to paste into a message',
  /* The order followed by the workbook market lines, when it is not the amount
     one. */
  'dv.csvDeviseOrder': 'Market lines: sorted by ascending average delay, as on screen — the market waiting the longest reads last',
  /* The already ready share of each market, under the dormant confirmed line:
     among the dormant dossiers of one currency, the ones whose quote is
     settled. The share relates to that market, never to the whole lot. */
  'dv.sumDormantConfirmedByDeviseHint': 'Already ready share of each market among the dormant confirmed ones — the share relates to the dormant dossiers of that currency',
  'dv.sumDormantConfirmedByDevisePart': 'share of this market already ready',
  /* The number of markets the header dormant pill mixes. */
  'dv.listDormantDevises': '{n} markets',
  'dv.listDormantDevisesHint': 'This lot mixes several markets — each currency keeps its total, no amount is ever summed across them',
  /* The workbook states the dormant confirmed split per currency, in their own
     block, when the lot mixes several. */
  'dv.csvSynthDormantConfirmedByDevise': 'Share of the dormant confirmed files per currency, in dossiers',
  /* The number of markets the confirmed lot mixes, named just before its
     split: the sheet says on how many currencies it unfolds. */
  'dv.csvSynthDormantConfirmedDevises': 'Number of markets in the confirmed lot',
  /* And its average delay, set against the whole dormant one: the delay
     comparison, right under the amount one. */
  'dv.csvSynthDormantConfirmedAgoCompare': 'Average delay of the dormant confirmed ones, out of all the dormant ones',
  /* The workbook compares the dormant confirmed count to the whole dormant
     count, as it already compares their amounts. */
  'dv.csvSynthDormantConfirmedCount': 'Dormant confirmed, out of all the dormant ones',
  'dv.sumDormantConfirmedCountOf': '{a} out of {b} dossiers',
  'dv.csvSynthRestoredAgoAvg': 'Average time since restore of the lot',
  'dv.csvRestoredAgoAvg': 'on average {n} d',
  'dv.lastAddressedCopy': 'Copy the addressed dossiers link',
  'dv.lastAddressedCopyHint': 'Copy the address of the list opened on the addressed-only dossiers — carrying their address but never handed over, the very lines the counter counts',
  /* The “addressed only” reading is copied from its counter, like the one
     without a length: the count, then each dossier with its opening address. */
  'dv.lastAddressedCountCopy': 'Copy this reading',
  'dv.lastAddressedCountCopyHint': 'Copies the count of the addressed-only dossiers and the address of each one, ready to paste into a message to a colleague.',
  'dv.lastAddressedCopyLead': 'Addressed-only dossiers: {n} of {total}',
  'dv.lastAddressedCountCopyRow': '{ref} — {lien}',
  'dv.lastAddressedCountCopyNote': 'These dossiers carry their address but were never handed to a colleague: neither shared nor restored. Each line carries the address that opens its dossier.',
  /* The reminder of the marks taken off, on the strip, beside the counter. */
  'dv.lastForgotOne': '{n} mark taken off',
  'dv.lastForgotMany': '{n} marks taken off',
  /* Each mark taken off carries, in the bubble, the day of its removal and the
     time elapsed since: the gesture is placed without opening the workbook. */
  'dv.lastForgotOn': 'taken off on {date}',
  'dv.lastForgotAgo': 'for {n} d',
  'dv.listForgotHint': 'Dossiers of this list whose share mark was taken off — “Restore” puts them back, each with its original day',
  'dv.lastForgotHint': 'Dossiers in this note whose share mark was taken off — “Restore” puts them back, each with its original day',
  'dv.lastForgetOne': '{n} share to forget',
  'dv.lastForgetMany': '{n} shares to forget',
  'dv.lastForgetHint': 'Dossiers in this note already handed to a colleague — “Forget” takes their marks off, without touching the rest of the account',
  /* The “recently shared” order can be chosen from the strip too: both
     readings then open in the same order. */
  'dv.lastSortOn': '“Recently shared” order on: the strip and the list open in that order',
  'dv.lastSortOff': 'Open the strip and the list in the “recently shared” order',
  'dv.notifiedOn': 'Last status message',
  'dv.notifiedNone': 'No status message sent yet',
  'dv.lastStamp': 'Your latest quote',
  'dv.lastRef': 'Reference',
  'dv.lastSee': 'See it in my account',
  'dv.lastFollow': 'Follow this file',
  'dv.lastOpen': 'Open the tracking of quote {ref}',
  'dv.lastHide': 'Hide this note',
  'dv.lastFilterAria': 'Choose the state of the quote shown',
  'dv.lastNone': 'No quote in this state. Choose “All” to see the latest quote.',
  'dv.lastRelance': 'A reminder goes out automatically if the quote stays unanswered after seven days.',
  'dv.lastRelanceHint': 'The last reminder sent for this quote',
  'dv.csvFilterLabel': 'Filtered state',
  'dv.csvReading': 'Reading opened',
  'dv.csvReadingRestored': 'Restored — dossiers that came back after an erasure',
  'dv.csvReadingShared': 'Already shared — dossiers handed to a colleague',
  /* The third reading enters the summary like the other two: the sheet says it
     only holds the addressed-only dossiers. */
  'dv.csvReadingAddressed': 'Addressed only — dossiers carrying their address but never handed over',
  'dv.csvReadingDormant': 'Dormant — dossiers addressed only for over seven days',
  'dv.csvReadingDormantConfirmed': 'Dormant confirmed — dossiers asleep with a quote already confirmed',
  'dv.csvDays': 'Days since sending',
  'dv.csvNote': 'Export of the filtered quotes from “My account”, exactly as shown on screen.',
  'dv.csvSynthTitle': 'Sheet 2 — Summary: quotes by state',
  'dv.csvSynthState': 'State',
  'dv.csvSynthCount': 'Number of quotes',
  'dv.csvSynthShare': 'Share of the export',
  'dv.csvSynthTotal': 'Total exported',
  'dv.csvSynthNote': 'The summary counts only the quotes written in the “Devis” tab, in the state they are in today.',
  'dv.csvSynthLate': 'of which overdue',
  'dv.csvSynthBulk': 'of which already in a group summary',
  'dv.csvSynthBulkNever': 'of which never in a group summary',
  'dv.csvSynthRefsTitle': 'References sent in this group send ({n})',
  'dv.csvLate': 'Overdue',
  'dv.csvYes': 'Yes',
  'dv.csvNo': 'No',
  'dv.xlsxCta': 'Export to Excel',
  'dv.xlsxDone': 'Workbook downloaded',
  'dv.xlsxCountUnit': 'quotes',
  'dv.bulkTitle': 'Group send of the overdue quotes',
  'dv.bulkHint': 'One single email gathers the ticked quotes, with their reference and amount.',
  'dv.bulkAll': 'Select all',
  'dv.bulkNone': 'Clear selection',
  'dv.bulkSelected': 'selected',
  'dv.bulkPickOne': 'Select quote {ref}',
  'dv.bulkSend': 'Send the group summary',
  'dv.bulkSending': 'Sending…',
  'dv.bulkOk': 'A group summary of {n} quotes has just been sent to your address.',
  'dv.bulkErr': 'The group summary could not be sent. Try again in a moment.',
  'dv.bulkXlsxCta': 'Export the group send to Excel',
  'dv.bulkXlsxScope': 'The {n} quotes of the group send of {date}',
  'dv.bulkXlsxNote': 'The workbook holds only the quotes of that group send, with the day they left.',
  'dv.remindLate': 'This quote has been waiting for your reply for {days} days. A reminder goes out automatically after seven days, unless you answer before.',
  'dv.remindSent': 'A reminder was sent to you on {date}, and the quote is still waiting for your reply.',
  'dv.remindOpen': 'Open the file',

  'dv.fFormula': 'Plan',
  'dv.fDuree': 'Length',
  'dv.fTotal': 'Amount for the length',
  'dv.fParMois': 'Monthly equivalent',
  'dv.fPlein': 'At the monthly price, without the discount',
  'dv.fSites': 'Establishments',
  'dv.fMarche': 'Market',
  'dv.fRythme': 'Billing',
  'dv.fForfait': 'Base for the length',
  'dv.fSitesSup': 'Additional establishments',
  'dv.fMensuel': 'Monthly total',
  'dv.fAnnuel': 'Yearly total',
  'dv.fEconomie': 'annual discount',

  'dv.p1': 'No amount: signing up stays open.',
  'dv.p2': 'One establishment at full price, then a reduced rate for each one after it.',
  'dv.p3': 'A structure plan, then a reduced rate for each attached establishment.',
};

export const devisDict: Record<'fr' | 'ar' | 'en', Dict> = { fr, ar, en };