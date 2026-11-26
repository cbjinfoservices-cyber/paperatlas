import type { Dict } from './dict';

/** La console d'administration : les clients abonnés, les annonces, la
 *  messagerie et les réglages. Séparée du reste du dictionnaire pour rester
 *  lisible — c'est un espace de travail, pas une page publique. */

const fr: Dict = {
  'ad.stamp': 'Console',
  'ad.title': 'Administration du site',
  'ad.lede': 'Les clients abonnés, les annonces, la messagerie et les réglages — au même endroit, sur les données réelles du site.',
  'ad.back': 'Retour au site',
  'ad.signout': 'Se déconnecter',
  'ad.signedAs': 'Connecté en tant que',
  'ad.loading': 'Chargement de la console…',
  'ad.error': 'La console n’a pas pu charger ses données.',
  'ad.retry': 'Réessayer',
  'ad.refresh': 'Actualiser',
  'ad.denied.title': 'Accès réservé à l’administration',
  'ad.denied.body': 'Cette console s’ouvre uniquement avec le compte du propriétaire du site. Connectez-vous avec l’adresse autorisée.',
  'ad.denied.cta': 'Ouvrir la connexion',
  'ad.tab.clients': 'Clients abonnés',
  'ad.tab.paiements': 'Paiements',
  'ad.tab.annonces': 'Annonces',
  'ad.tab.messages': 'Messagerie',
  'ad.tab.journal': 'Journal de la revue',
  'ad.tab.suivi': 'Suivi du projet',
  'ad.tab.params': 'Paramètres',
  'ad.stat.abo': 'abonnements',
  'ad.stat.actifs': 'actifs',
  'ad.stat.essai': 'en essai',
  'ad.stat.mrr': 'revenu mensuel',
  'ad.stat.comptes': 'comptes',
  'ad.stat.apresRelance': 'comptes après relance',
  'ad.stat.apresRelanceHint':
    'Comptes dont au moins un dépôt est arrivé après la relance préparée, lue sur la mémoire de cet appareil.',
  'ad.stat.silencieux': 'comptes silencieux',
  'ad.stat.annonces': 'annonces',
  'ad.stat.fils': 'fils ouverts',

  'ad.clients.stamp': 'Clients abonnés',
  'ad.clients.sub': 'Chaque abonnement tel qu’il est enregistré : l’offre, le montant, l’échéance et le canal de paiement.',
  'ad.clients.search': 'Rechercher une entreprise, un e-mail, une ville…',
  'ad.clients.allStatus': 'Tous les états',
  'ad.clients.empty': 'Aucun abonnement enregistré pour le moment.',
  'ad.clients.none': 'Aucun abonnement ne correspond à cette recherche.',
  'ad.clients.entreprise': 'Entreprise',
  'ad.clients.offre': 'Offre',
  'ad.clients.statut': 'État',
  'ad.clients.montant': 'Montant / mois',
  'ad.clients.cardMontant': 'Montant',
  'ad.clients.cardSleep': 'Sommeil',
  'ad.clients.cardEtabs': 'Sites',
  'ad.clients.echeance': 'Échéance',
  'ad.clients.canal': 'Paiement',
  'ad.clients.depuis': 'Depuis',
  'ad.clients.comptes': 'Comptes du site',
  'ad.clients.comptesSub': 'Les comptes ouverts, avec leur formule et leurs établissements.',
  'ad.clients.adminMark': 'Administrateur',
  'ad.clients.adminMarkHint':
    'Ce compte peut ouvrir la console d’administration : son rôle le dit, et la console le laisse entrer avec sa propre adresse.',
  'ad.clients.adminNoEtabsHint':
    'Un compte d’administration n’est pas un établissement : cette colonne ne compte rien pour lui.',
  'ad.clients.comptesAdminChip': 'Administrateurs',
  'ad.clients.comptesAdminHint':
    'Ne garder que les comptes qui peuvent ouvrir la console — rôle administrateur ou adresse d’administration ; un second clic rend la liste entière.',
  'ad.clients.comptesAdminEmpty':
    'Aucun compte administrateur dans cette liste : la console reste ouverte au seul compte qui la tient.',
  'ad.clients.comptesAdminCount': '{n} administrateur(s)',
  'ad.clients.comptesAdminCountHint':
    'Le nombre de comptes qui peuvent ouvrir la console, compté sur les mêmes lignes que la table. Un clic resserre la table sur ces seuls comptes, un second la rend entière.',
  'ad.clients.adminStaleMark': 'À relire',
  'ad.clients.adminStaleHint':
    'Promu administrateur il y a {n} mois, le {date} : ce rôle demande une relecture — l’accès est-il toujours voulu ?',
  'ad.clients.adminStaleOpen':
    'Ouvrir la fiche de ce compte sur sa ligne de rôle, pour relire l’ancienneté de la promotion.',
  'ad.clients.adminStaleChip': 'Promotions à relire',
  'ad.clients.adminStaleHintChip':
    'Ne garder que les comptes promus administrateurs depuis plus de six mois ; un second clic rend la table entière.',
  'ad.clients.adminStaleEmpty':
    'Aucune promotion de plus de six mois à relire : les rôles administrateurs sont récents.',
  'ad.clients.adminNoDateChip': 'Promotions sans date',
  'ad.clients.adminNoDateHint':
    'Ne garder que les comptes administrateurs dont la promotion n’a jamais été datée : leur date reste à compléter. Un second clic rend la table entière.',
  'ad.clients.adminNoDateEmpty':
    'Aucune promotion sans date : chaque rôle administrateur porte la date de sa promotion.',
  'ad.clients.adminMarkOpen': 'Ouvrir la fiche sur la ligne de rôle',
  'ad.clients.promoCol': 'Promotion',
  'ad.clients.promoUnknown': 'Sans date',
  'ad.clients.promoUnknownHint':
    'Ce compte a été promu avant que la console ne note les dates : sa date de promotion reste à compléter, elle ne s’invente pas.',
  'ad.clients.sortPromoHint':
    'Trier les comptes par date de promotion, la plus ancienne en tête ; un second clic met la plus récente devant, un troisième rend l’ordre de la table. Les comptes dont la date n’a jamais été notée suivent, puis les comptes ordinaires.',
  'ad.clients.promoOrderOld': 'Promotion la plus ancienne en tête',
  'ad.clients.promoOrderRecent': 'Promotion la plus récente en tête',
  'ad.xls.role': 'Rôle',
  'ad.xls.roleAdmin': 'Administrateur',
  'ad.xls.roleOther': 'Compte ordinaire',
  'ad.xls.promotedOn': 'Date de promotion',
  'ad.xls.promoUnknown': 'Date non enregistrée',
  'ad.xls.promoUnknownNote':
    'La colonne « Date de promotion » porte la mention « Date non enregistrée » pour un compte promu administrateur avant que la console ne note les dates : la case n’est jamais laissée vide, où elle se lirait comme une mesure manquante. Un compte ordinaire garde, lui, une case vide — il n’a pas de promotion.',
  'ad.xls.adminsSheet': 'Administrateurs',
  'ad.xls.adminsSheetEmpty':
    'Aucun compte administrateur : la console reste ouverte au seul compte qui la tient.',
  'ad.xls.adminsSheetCount': 'Comptes administrateurs',
  'ad.xls.adminsSheetOrder':
    'Les comptes sont rangés par date de promotion, la plus ancienne en tête — le même sens que la table des comptes triée par promotion, pour relire les rôles dans un seul ordre ; ceux dont la date n’a pas été notée ferment la marche, par ordre de nom. Quand la table est triée de la plus récente à la plus ancienne, la feuille suit ce sens.',
  'ad.xls.adminsSheetNote':
    'La date de promotion est celle notée au moment du changement de rôle dans la console. Une case vide signale une promotion plus ancienne que cette note : la date n’a pas été inventée.',
  'ad.xls.adminsStaleCount': 'Promotions de plus de six mois',
  'ad.xls.adminsStaleNote':
    'Le compte des promotions de plus de six mois est lu sur la même date que la feuille « Administrateurs » : un rôle ouvert depuis plus de six mois demande une relecture. Une promotion sans date notée n’y entre pas — rien ne permettrait de la dater.',
  'ad.clients.comptesEmpty': 'Aucun compte enregistré.',
  'ad.clients.metier': 'Métier',
  'ad.clients.ville': 'Ville',
  'ad.clients.fiche': 'Fiche',
  'ad.clients.open': 'Ouvrir la fiche',
  'ad.clients.export': 'Exporter en Excel',
  'ad.clients.echeanceChip': 'Échéances < 30 j',
  'ad.clients.echeanceHint': 'Réduire la liste aux abonnements dont l’échéance tombe à moins de trente jours.',
  'ad.clients.echeanceEmpty': 'Aucune échéance dans les trente prochains jours.',
  'ad.clients.reset': 'Tout voir',
  'ad.clients.dueIn': 'dans {n} j',
  'ad.clients.dueToday': 'aujourd’hui',
  'ad.clients.duePast': 'échue depuis {n} j',
  'ad.clients.sortDueHint':
    'Un clic range la liste par échéance, la plus urgente en tête ; un second clic inverse l’ordre.',
  'ad.clients.depots': 'Dépôts',
  'ad.clients.apresCol': 'Après relance',
  'ad.clients.depotNone': 'rien déposé',
  'ad.clients.noPublieChip': 'Sans dépôt publié',
  'ad.clients.noPublieHint': 'Réduire la liste aux comptes dont aucun dépôt n’a encore été publié.',
  'ad.clients.noPublieEmpty': 'Aucun compte sans dépôt publié : tous en ont au moins un.',
  'ad.clients.lateChip': 'Relecture longue',
  'ad.clients.lateHint':
    'Réduire la liste aux comptes dont un dépôt attend une réponse depuis plus de sept jours.',
  'ad.clients.lateEmpty': 'Aucun compte n’attend de réponse depuis plus de sept jours.',
  'ad.clients.comptesLateEmpty': 'Aucun compte n’attend de réponse depuis plus de sept jours.',
  'ad.clients.sortLateHint':
    'Un clic range la liste par nombre de relectures longues, le compte le plus chargé en tête ; un second clic inverse l’ordre.',
  'ad.clients.sortApresHint':
    'Un clic range la liste par nombre de dépôts arrivés après la relance préparée, le compte le plus déposé depuis son message en tête ; un second clic inverse l’ordre.',
  'ad.clients.lateOpenHint':
    'Ouvre l’onglet « Annonces » réduit aux dépôts de ce compte en relecture depuis plus de sept jours.',
  'ad.clients.sleepRow': 'fils en sommeil',
  'ad.clients.sleepRowHint':
    'Conversations de ce compte qui mettent un jour ou plus à répondre : le repère se lit avant d’ouvrir la fiche.',
  'ad.clients.sleepCol': 'Fils dormants',
  'ad.clients.sortSleepHint':
    'Un clic range la liste par nombre de fils en sommeil, le compte le plus silencieux en tête ; un second clic inverse l’ordre.',
  'ad.clients.sleepChip': 'Comptes silencieux',
  'ad.clients.sleepHint':
    'Un clic réduit les deux tables aux comptes dont au moins une conversation met un jour ou plus à répondre ; un second clic les rouvre en entier.',
  'ad.clients.sleepEmpty':
    'Aucun compte n’a de fil en sommeil : toutes les conversations répondent en moins d’un jour.',
  'ad.clients.sleepOpenHint':
    'Ouvre la messagerie de la console sur le fil dormant de ce compte, sans le chercher dans la liste.',
  'ad.clients.relance': 'Préparer une relance',
  'ad.clients.relanceHint':
    'Ouvre le même message pré-rempli que la fiche — les dépôts en attente et la ligne récapitulative — sans ouvrir la fiche.',
  'ad.clients.recap': 'Copier les priorités',
  'ad.clients.recapHint':
    'Copie le récapitulatif des priorités de ce compte — ses fils en sommeil avec leur délai, puis ses relectures longues — sans ouvrir sa fiche.',
  'ad.clients.recentTodayChip': 'Relancé aujourd’hui',
  'ad.clients.recentTodayHint':
    'Réduire la liste aux comptes dont une relance a été préparée aujourd’hui même.',
  'ad.clients.recentWeekChip': 'Relancé cette semaine',
  'ad.clients.recentWeekHint':
    'Réduire la liste aux comptes dont une relance a été préparée ces sept derniers jours, aujourd’hui compris.',
  'ad.clients.recentTodayEmpty': 'Aucune relance préparée aujourd’hui.',
  'ad.clients.recentWeekEmpty': 'Aucune relance préparée ces sept derniers jours.',
  'ad.clients.apresHint':
    'Un clic réduit les deux listes aux comptes dont un dépôt est arrivé après la relance préparée, lue sur la mémoire de cet appareil ; un second clic rend la liste entière.',
  'ad.clients.apresEmpty':
    'Aucun compte n’a de dépôt arrivé après la relance : le message couvre tout ce qui a été déposé.',
  'ad.clients.comptesOrderLate': 'Même ordre : relectures longues',
  'ad.clients.comptesOrderLateDesc': 'Même ordre : relectures longues, inversé',
  'ad.clients.comptesOrderApres': 'Même ordre : après relance',
  'ad.clients.comptesOrderApresDesc': 'Même ordre : après relance, inversé',
  'ad.clients.comptesOrderSleep': 'Même ordre : fils dormants',
  'ad.clients.comptesOrderSleepDesc': 'Même ordre : fils dormants, inversé',
  'ad.clients.comptesOrderHint':
    'La seconde table suit le tri choisi dans la table des abonnements : ce jeton le rappelle, et les comptes se lisent dans le même ordre que les abonnements.',
  'ad.clients.comptesOrderTable': 'Ordre de la table',
  'ad.clients.comptesOrderDetachHint':
    'Détache la seconde table du tri des abonnements et la ramène à l’ordre de la table, sans toucher à l’ordre des abonnements.',
  'ad.clients.comptesOrderAttachHint':
    'Rattache la seconde table au tri des abonnements, pour que les deux listes se lisent dans le même ordre.',

  'ad.pay.stamp': 'Paiements et abonnements',
  'ad.pay.sub':
    'Ce que chaque abonnement doit rapporter, et ce qui l’empêche encore d’être encaissé.',
  'ad.pay.total': 'abonnements suivis',
  'ad.pay.prets': 'encaissables',
  'ad.pay.regler': 'à régler',
  'ad.pay.montantPret': 'revenu encaissable',
  'ad.pay.montantRegler': 'revenu en suspens',
  'ad.pay.filterAll': 'Tous',
  'ad.pay.filterRegler': 'À régler',
  'ad.pay.filterReglerHint':
    'Ne garder que les abonnements qui ne peuvent pas encore être encaissés, l’échéance la plus ancienne en tête.',
  'ad.pay.filterPrets': 'Encaissables',
  'ad.pay.filterPretsHint':
    'Ne garder que les abonnements prélevables en l’état : ouverts, chiffrés, avec un moyen de paiement automatique.',
  'ad.pay.colEntreprise': 'Entreprise',
  'ad.pay.colOffre': 'Offre',
  'ad.pay.colMontant': 'Montant / mois',
  'ad.pay.colEcheance': 'Échéance',
  'ad.pay.colCanal': 'Moyen de paiement',
  'ad.pay.colEtat': 'Encaissement',
  'ad.pay.colFiche': 'Fiche',
  'ad.pay.cardOffre': 'Offre',
  'ad.pay.cardMontant': 'Montant',
  'ad.pay.cardEcheance': 'Échéance',
  'ad.pay.cardCanal': 'Paiement',
  'ad.pay.cardEtat': 'État',
  'ad.pay.open': 'Ouvrir la fiche',
  'ad.pay.empty': 'Aucun abonnement enregistré pour le moment.',
  'ad.pay.emptyRegler':
    'Aucun abonnement en attente : tout ce qui est ouvert est encaissable.',
  'ad.pay.emptyPrets':
    'Aucun abonnement n’est encaissable en l’état : la liste « à régler » dit ce qui manque.',
  'ad.pay.why.pret': 'Prêt à encaisser',
  'ad.pay.why.essai': 'Essai en cours',
  'ad.pay.why.sansMontant': 'Montant non renseigné',
  'ad.pay.why.sansCanal': 'Aucun moyen de paiement',
  'ad.pay.why.manuel': 'Encaissement manuel',
  'ad.pay.why.retard': 'Échéance dépassée',
  'ad.pay.why.ferme': 'Abonnement clos',
  'ad.pay.bannerTitle': 'Le prélèvement automatique n’est pas encore branché',
  'ad.pay.bannerBody':
    'Aucun prestataire de paiement n’est relié au projet : les abonnements sont suivis, pas encore encaissés en ligne. Cet écran lit ce que la base enregistre — l’offre, le montant, l’échéance, le moyen de paiement — et désigne, ligne par ligne, ce qui manque pour qu’un abonnement soit encaissable.',
  'ad.pay.ruleTitle': 'La règle de lecture',
  'ad.pay.ruleBody':
    'Un abonnement est encaissable quand il est ouvert, que son montant est renseigné et qu’un moyen de paiement automatique y est attaché. Tout le reste est signalé avec sa raison, et lu dans cet ordre : abonnement clos, montant vide, moyen de paiement absent ou manuel, essai en cours, échéance dépassée.',
  'ad.pay.note':
    'Les montants sont ceux de la base, hors taxes. Un abonnement clos n’entre ni dans le revenu encaissable ni dans le revenu en suspens.',
  'ad.pay.motifLabel': 'Filtrer par motif',
  'ad.pay.motifHint':
    'Isoler d’un clic les abonnements dont la raison est « {r} » ; un second clic rend la file entière.',
  'ad.pay.motifLegend':
    'Un motif s’isole d’un clic : la liste ne garde que les abonnements qu’il bloque.',
  'ad.pay.motifActive': 'Filtré sur le motif « {r} »',
  'ad.pay.motifClear': 'Tous les motifs',
  'ad.pay.motifEmpty':
    'Aucun abonnement ne porte ce motif : la règle ne le rencontre plus aujourd’hui.',
  'ad.pay.csvCta': 'Exporter le tableau',
  'ad.pay.csvHint':
    'Télécharge la file affichée en CSV ; le nom du fichier reprend le motif ou la vue posés sur la liste, pour l’archiver après une relance.',
  'ad.pay.csvDone': 'Tableau téléchargé',
  'ad.pay.exportLast': 'Dernière archive : {date}',
  'ad.pay.exportWhat': '{what} · {n} ligne(s)',
  'ad.pay.exportAmount': 'montant {n}',
  'ad.pay.exportReplay': 'Refaire cet export',
  'ad.pay.exportReplayHint':
    'Un clic reprend la vue et le motif de cette archive, pour la refaire à l’identique ; une file resserrée sur un compte est d’abord rendue entière.',
  'ad.pay.exportReplayDone': 'Vue et motif rétablis',
  'ad.pay.histTitle': 'Les sept derniers exports',
  'ad.pay.histHint':
    'Les exports les plus récents produits depuis cet appareil, du plus récent au plus ancien, avec leur date, leur nombre de lignes et leur montant : l’archive se relit dans le temps, pas seulement à son dernier geste.',
  'ad.pay.histCount': '{n} export(s) retenu(s)',
  'ad.pay.histRows': '{n} ligne(s)',
  'ad.pay.histNoAmount': 'montant non retenu',
  'ad.pay.histRowHint':
    'Un clic rejoue cet export-là : l’écran reprend la vue et le motif de cette ligne, pas seulement ceux du dernier export.',
  'ad.pay.archiveDeltaUp': '+{n} depuis cet export',
  'ad.pay.archiveDeltaDown': '−{n} depuis cet export',
  'ad.pay.archiveDeltaFlat': 'file inchangée',
  'ad.pay.archiveDeltaHint':
    'Ce que la file porte aujourd’hui à la même vue et au même motif, comparé au montant que cet export emportait : l’écart dit d’un coup d’œil si le tableau a bougé depuis.',
  'ad.pay.archiveDeltaOpenHint':
    'Un clic ouvre la file sur les lignes de cette différence : celles qui sont arrivées depuis cet export, à la même vue et au même motif. Les lignes parties ne peuvent que se compter.',
  'ad.pay.archiveDeltaRowsUp': '+{n} ligne(s)',
  'ad.pay.archiveDeltaRowsDown': '−{n} ligne(s)',
  'ad.pay.archiveDeltaRowsFlat': 'autant de lignes',
  'ad.pay.archiveDeltaRowsHint':
    'Les lignes gagnées ou perdues depuis cet export, à la même vue et au même motif : le décompte dit si le tableau s’est rempli ou vidé, là où le montant ne dit que ce qu’il pèse.',
  'ad.pay.ecartChip': 'Différence de l’export du {date}',
  'ad.pay.ecartArrived': '{n} ligne(s) arrivée(s)',
  'ad.pay.ecartLeft': '{n} partie(s)',
  'ad.pay.ecartNone':
    'Aucune ligne n’est arrivée depuis cet export, à cette vue et à ce motif : le tableau est tel qu’il était.',
  'ad.pay.ecartClear': 'Rendre la file',
  'ad.pay.ecartClearHint':
    'Retire la différence et rend la file entière, à la vue et au motif de l’export : le tableau se relit sans le resserrement.',
  'ad.pay.histAvg': 'Montant moyen {n}',
  'ad.pay.histAvgNote': 'sur {n} export(s) chiffré(s)',
  'ad.pay.histAvgHint':
    'Moyenne des montants emportés par les exports rangés dans l’historique, et tendance entre le plus récent et le plus ancien : les sept exports se lisent comme une suite. Les exports sans montant retenu n’entrent pas dans la moyenne.',
  'ad.pay.histAvgUp': '+{n} sur la période',
  'ad.pay.histAvgDown': '−{n} sur la période',
  'ad.pay.histAvgFlat': 'montants stables',
  'ad.pay.histPeak': 'Pic de la semaine',
  'ad.pay.histPeakHint':
    'L’export qui a emporté le montant le plus haut de la semaine : le pic se lit à côté de la moyenne, sans additionner les sept lignes.',
  'ad.pay.histPeakNote': 'Pic {n} le {date}',
  'ad.pay.histPeakNoteHint':
    'Le plus haut montant emporté par un export de la semaine, et sa date : la moyenne et le pic se lisent ensemble.',
  'ad.pay.histPeakReplayHint':
    'Un clic rejoue l’export du pic : l’écran reprend sa vue et son motif, pour relire la semaine au moment de son sommet.',
  'ad.pay.histMovedUp': '+{n} ligne(s) depuis',
  'ad.pay.histMovedDown': '−{n} ligne(s) depuis',
  'ad.pay.histMovedHint':
    'Le décompte que la file compte aujourd’hui à la vue et au motif de cet export, comparé aux lignes que ce fichier emportait : la ligne qui a bougé se repère parmi les sept sans ouvrir chaque archive.',
  'ad.pay.histMovedOnly': 'Lignes qui ont bougé',
  'ad.pay.histMovedOnlyHint':
    'Un clic ne garde que les exports dont le décompte de lignes diffère de celui que la file compte aujourd’hui, à leur vue et à leur motif : la ligne qui a bougé se retrouve sans balayer les sept. Un second clic rend l’historique entier.',
  'ad.pay.histMovedOnlyEmpty':
    'Aucun export retenu n’a bougé : le tableau compte les mêmes lignes qu’à chaque archive.',
  'ad.pay.histAmountMovedUp': '+{n} de montant depuis',
  'ad.pay.histAmountMovedDown': '−{n} de montant depuis',
  'ad.pay.histAmountMovedHint':
    'Le montant que la file pèse aujourd’hui à la vue et au motif de cet export, comparé à celui que ce fichier emportait : le montant qui a bougé se signale à côté du décompte, sans ouvrir l’archive.',
  'ad.pay.ecartExport': 'Exporter ces lignes',
  'ad.pay.ecartExportHint':
    'Télécharge en CSV les seules lignes de cette différence — celles qui sont arrivées depuis cet export —, sans repasser par la file entière : une pièce jointe, pas un nouvel export du tableau.',
  'ad.pay.ecartExportDone': 'Lignes téléchargées',
  'ad.pay.csvEcart': 'Écart depuis l’export du',
  'ad.pay.cmpOpen': 'Comparer deux exports',
  'ad.pay.cmpOpenHint':
    'Ouvre deux points à choisir dans les sept exports retenus — un départ, une arrivée — pour lire l’écart de montant et de lignes entre les deux, sans passer par la file du jour.',
  'ad.pay.cmpTitle': 'Entre deux exports',
  'ad.pay.cmpClose': 'Fermer',
  'ad.pay.cmpCloseHint': 'Referme la comparaison et rend l’historique à sa seule lecture.',
  'ad.pay.cmpFrom': 'Point de départ',
  'ad.pay.cmpTo': 'Point d’arrivée',
  'ad.pay.cmpHint':
    'Deux archives comparées entre elles : le montant et le décompte de lignes passent du point de départ au point d’arrivée. Rien n’est comparé à la file du jour, et un montant absent d’un des deux exports ne s’invente pas.',
  'ad.pay.cmpAmountUp': '+{n} de montant',
  'ad.pay.cmpAmountDown': '−{n} de montant',
  'ad.pay.cmpAmountFlat': 'montant inchangé',
  'ad.pay.cmpAmountNone': 'montant non comparable',
  'ad.pay.cmpRowsUp': '+{n} ligne(s)',
  'ad.pay.cmpRowsDown': '−{n} ligne(s)',
  'ad.pay.cmpRowsFlat': 'autant de lignes',
  'ad.pay.cmpIds': 'dont {a} arrivée(s) et {p} partie(s)',
  'ad.pay.cmpArrivalsOnly': '{a} arrivée(s)',
  'ad.pay.cmpPartiesToken': 'Parties {n}',
  'ad.pay.cmpPartiesTokenHint':
    'Un clic resserre la file du tableau sur ces lignes parties qui sont encore au tableau, à la vue et au motif courants ; un second clic la rend entière.',
  'ad.pay.cmpPartiesTokenGoneHint':
    'Aucune de ces lignes parties n’est plus au tableau : il n’y a rien à resserrer, le chiffre ne fait que compter.',
  'ad.pay.cmpPartiesNarrowOn': 'File sur ces {n} ligne(s)',
  'ad.pay.cmpPartiesExitHint':
    'Un clic rend la file entière, à la vue et au motif courants.',
  'ad.pay.cmpPartiesNarrowBanner':
    'File resserrée sur {n} ligne(s) partie(s) encore au tableau',
  'ad.pay.cmpPartiesNarrowNote':
    'Le tableau ne montre plus que ces lignes parties-là, à la vue et au motif courants.',
  'ad.pay.cmpPartiesNarrowEmpty':
    'Aucune de ces lignes parties n’entre dans la vue et le motif courants : rien à resserrer ici.',
  'ad.pay.cmpPartiesNarrowExport': 'Exporter ces lignes',
  'ad.pay.cmpPartiesNarrowExportHint':
    'Télécharge en CSV les seules lignes parties que ce resserrement laisse au tableau, à la vue et au motif courants : une pièce jointe, pas un nouvel export de la file.',
  'ad.pay.cmpPartiesNarrowExportDone': 'Lignes téléchargées',
  'ad.pay.histOpposite': 'Sens opposés',
  'ad.pay.histOppositeHint':
    'Cet export a bougé dans deux directions contraires : le décompte de lignes et le montant ne vont pas du même côté. Les deux écarts se lisent ensemble, sinon l’un des deux ferait conclure à tort.',
  'ad.pay.cmpAccount': 'Compte (e-mail)',
  'ad.pay.cmpPartiesDelta': 'Montant retiré',
  'ad.pay.cmpPartiesTotal': 'Total retiré par ces parties',
  'ad.pay.cmpPartiesDeltaNote':
    'Cette feuille liste les lignes du compte présentes au départ et absentes à l’arrivée, retrouvées dans le tableau par leur identifiant. La colonne « Montant retiré » les compte en négatif, pour que la colonne se somme ; une ligne qui n’est plus au tableau ne s’y trouve plus et ne se compte que dans le total des parties.',
  'ad.pay.cmpPartiesMajorMark': 'Pèse plus de la moitié',
  'ad.pay.cmpPartiesMajorMarkYes': '● majoritaire',
  'ad.pay.cmpPartiesMajorCount': 'Dont {n} ligne(s) majoritaire(s)',
  'ad.pay.cmpPartiesMajorMarkNote':
    'La colonne « Pèse plus de la moitié » marque les lignes qui, à elles seules, retirent plus de la moitié du montant retiré de ces parties : le retrait se lit alors sur une ligne au lieu de se répartir. Une ligne sans montant ne se pèse pas et reste sans marque.',
  'ad.pay.histAmountMovedOnly': 'Montants qui ont bougé',
  'ad.pay.histAmountMovedOnlyHint':
    'Un clic ne garde que les exports dont le montant diffère de ce que la file pèse aujourd’hui, à leur vue et à leur motif : le montant qui a bougé se retrouve sans balayer les sept. Un second clic rend l’historique entier.',
  'ad.pay.histAmountMovedOnlyEmpty':
    'Aucun export chiffré n’a bougé : la file pèse le même montant qu’à chaque archive.',
  'ad.pay.histBothMovedEmpty':
    'Aucun export n’a bougé, ni en montant ni en lignes : le tableau est tel qu’à chaque archive.',
  'ad.pay.histOppositeOnly': 'Sens opposés',
  'ad.pay.histOppositeOnlyHint':
    'Un clic ne garde que les exports dont le décompte de lignes et le montant partent en sens contraires, à leur vue et à leur motif : les deux écarts qui se contredisent se retrouvent sans balayer les sept. Un second clic rend l’historique entier.',
  'ad.pay.histOppositeOnlyEmpty':
    'Aucun export ne part en sens contraires : le décompte et le montant vont du même côté dans chaque archive.',
  'ad.pay.histBaisseOnly': 'Montants en baisse',
  'ad.pay.histBaisseOnlyHint':
    'Un clic ne garde que les exports dont le montant a baissé depuis : la file pèse aujourd’hui moins que le fichier, à sa vue et à son motif. Un export sans montant retenu n’entre dans aucune direction — il ne se compare pas. Un second clic rend l’historique entier.',
  'ad.pay.histBaisseOnlyEmpty':
    'Aucun export n’a baissé : la file pèse aujourd’hui autant ou plus que chaque archive.',
  'ad.pay.histFiltersEmpty':
    'Aucun export ne réunit ces filtres à la fois : élargissez-en un pour retrouver l’historique.',
  'ad.pay.histShowing': '{n} sur {m} export(s) visibles',
  'ad.pay.histShowingHint':
    'Le nombre d’exports que les jetons laissent dans l’historique, sur les sept qu’il retient : deux jetons posés ensemble ne gardent que les archives qui remplissent les deux conditions.',
  'ad.pay.histClearHint':
    'Éteint les trois jetons de l’historique d’un seul geste et rend les sept exports entiers : aucun filtre ne reste posé après le clic.',
  'ad.pay.histOppositeExport': 'CSV des sens opposés',
  'ad.pay.histOppositeExportHint':
    'Télécharge en CSV les seuls exports où le décompte de lignes et le montant partent en sens contraires, avec leurs deux écarts côte à côte — ce que l’archive emportait, ce que la file pèse aujourd’hui à sa vue et à son motif.',
  'ad.pay.histOppositeExportDone': 'Exports téléchargés',
  'ad.pay.histFilterExport': 'CSV de l’historique filtré',
  'ad.pay.histFilterExportHint':
    'Télécharge en CSV les seuls exports que les jetons laissent dans l’historique, dans l’ordre où ils se lisent — du plus récent au plus ancien —, avec pour chacun ses lignes et son montant, ce que la file pèse aujourd’hui à sa vue et à son motif, et les deux écarts.',
  'ad.pay.histFilterExportDone': 'Historique téléchargé',
  'ad.pay.histFilterCost': 'Coût total de ces exports {n} · {m} export(s) chiffré(s)',
  'ad.pay.histFilterCostHint':
    'Somme des montants d’origine des exports que les jetons laissent dans l’historique : ce que ces fichiers pesaient au moment du clic. Un export sans montant retenu n’entre pas dans la somme — il ne s’additionne pas —, et le second chiffre dit sur combien d’exports chiffrés elle porte.',
  'ad.pay.histFilterCsvFilters': 'Jetons posés',
  'ad.pay.histFilterCsvCount': 'Exports retenus',
  'ad.pay.histFilterCsvNote':
    'Une ligne par export que les jetons laissent dans l’historique, dans l’ordre de la liste. Les colonnes « aujourd’hui » lisent la file à la vue et au motif de chaque archive ; un export sans montant retenu laisse l’écart de montant vide, il ne se compare pas.',
  'ad.pay.histFilterCsvCost': 'Coût total',
  'ad.pay.histFilterCsvCostNote':
    'Somme des montants d’origine des {n} export(s) chiffré(s) : le même chiffre que le compteur affiché à l’écran, repris en dernière ligne pour qu’une archive se relise sans refaire l’addition.',
  'ad.pay.histFilterCsvCostNone': 'Aucun export chiffré dans cette sélection',
  'ad.pay.histBaisseCumulHint':
    'Baisse cumulée depuis les {n} export(s) retenus : la somme de leurs écarts négatifs, entre ce que la file pèse aujourd’hui et ce que chaque fichier emportait. Un export qui a monté n’entre pas dans la somme.',
  'ad.pay.histBaisseCumulToken': 'Baisse cumulée',
  'ad.pay.histBaisseCumulTokenHint':
    'Un clic resserre l’historique sur les seuls exports en baisse — ceux dont la file pèse aujourd’hui moins que le fichier. Un second clic rend les sept exports entiers.',
  'ad.pay.histFilterCsvBaisse': 'Baisse cumulée',
  'ad.pay.histFilterCsvBaisseNote':
    'Somme des écarts négatifs des {n} export(s) retenus : ce que la file a perdu depuis leurs fichiers. Un export qui a monté n’entre pas dans la somme — il la contredit.',
  'ad.pay.histFilterCsvBaisseNone': 'Aucune baisse dans cette sélection',
  'ad.pay.histFilterCsvLatest': 'Export le plus récent retenu',
  'ad.pay.histFilterCsvLatestNone': 'Aucun export retenu',
  'ad.pay.oppCsvRowsNow': 'Lignes aujourd’hui',
  'ad.pay.oppCsvAmountNow': 'Montant aujourd’hui',
  'ad.pay.oppCsvRowGap': 'Écart de lignes',
  'ad.pay.oppCsvAmountGap': 'Écart de montant',
  'ad.pay.oppCsvCount': 'Exports aux sens opposés',
  'ad.pay.oppCsvNote':
    'Une ligne par export où le décompte de lignes et le montant partent en sens contraires : les deux écarts se lisent ensemble, sinon l’un des deux ferait conclure à tort. Les colonnes « aujourd’hui » lisent la file à la vue et au motif de chaque archive ; un export sans montant retenu laisse l’écart de montant vide, il ne se compare pas.',
  'ad.pay.cmpSame':
    'Choisissez deux exports différents : un même point ne se compare pas à lui-même.',
  'ad.pay.cmpExport': 'Exporter la comparaison',
  'ad.pay.cmpExportHint':
    'Télécharge l’écart entre ces deux exports en trois feuilles : les deux points côte à côte, l’écart de montant et de lignes entre eux, puis — quand les deux exports retenaient leurs lignes — celles qui sont arrivées entre les deux.',
  'ad.pay.cmpExportDone': 'Comparaison téléchargée',
  'ad.pay.cmpColField': 'Repère',
  'ad.pay.cmpDate': 'Date de l’export',
  'ad.pay.colRows': 'Lignes',
  'ad.pay.cmpGapTitle': 'Écart entre les deux exports',
  'ad.pay.cmpSheetPoints': 'Les deux points',
  'ad.pay.cmpArrivalsSheet': 'Lignes arrivées',
  'ad.pay.cmpArrivalsEmpty': 'Aucune ligne n’est arrivée entre ces deux exports.',
  'ad.pay.cmpArrivalsUnknown':
    '{n} ligne(s) arrivée(s) ne sont plus au tableau : elles ne peuvent que se compter.',
  'ad.pay.cmpArrivalsNote':
    'Cette feuille nomme les lignes arrivées entre les deux points, retrouvées dans le tableau par leur identifiant. Elle n’existe que lorsque les deux exports retenaient leurs lignes ; celles qui ont quitté le tableau ne s’y trouvent plus et se comptent seulement.',
  'ad.pay.cmpArrivalDelta': 'Écart de montant',
  'ad.pay.cmpArrivalTotal': 'Total apporté par ces arrivées',
  'ad.pay.cmpArrivalTotalChip': 'Arrivées +{n}',
  'ad.pay.cmpArrivalTotalChipHint':
    'Un clic déplie les lignes arrivées entre les deux exports avec le montant que chacune a apporté : le total se relit sur place, sans ouvrir le classeur.',
  'ad.pay.cmpArrivalNoAmount': 'montant vide',
  'ad.pay.cmpArrivalNarrowHint':
    'Un second clic resserre la file du tableau sur ces seules lignes arrivées, à la vue et au motif courants.',
  'ad.pay.cmpArrivalNarrowOn': 'File sur ces {n} ligne(s)',
  'ad.pay.cmpArrivalNarrowExitHint':
    'Un clic rend la file entière et referme la liste des arrivées.',
  'ad.pay.cmpArrivalNarrowBanner':
    'File resserrée sur {n} ligne(s) arrivée(s) entre les deux points',
  'ad.pay.cmpArrivalNarrowNote':
    'Le tableau ne montre plus qu’elles, à la vue et au motif courants.',
  'ad.pay.cmpArrivalNarrowEmpty':
    'Aucune de ces lignes arrivées n’entre dans la vue et le motif courants : rien à resserrer ici.',
  'ad.pay.cmpPartiesSheet': 'Lignes parties',
  'ad.pay.cmpPartiesEmpty':
    'Aucune ligne n’est partie entre ces deux exports.',
  'ad.pay.cmpPartiesUnknown':
    '{n} ligne(s) partie(s) ne sont plus au tableau : elles ne peuvent que se compter.',
  'ad.pay.cmpPartiesNote':
    'Cette feuille liste les lignes présentes au point de départ et absentes au point d’arrivée, retrouvées dans le tableau par leur identifiant. Elle n’existe que lorsque les deux exports retenaient leurs lignes ; celles qui ont quitté le tableau ne s’y trouvent plus et se comptent seulement.',
  'ad.pay.cmpFilsSheet': 'Fils actifs',
  'ad.pay.cmpFilsSubject': 'Fil',
  'ad.pay.cmpFilsLast': 'Dernier message',
  'ad.pay.cmpFilsAt': 'Dernier message le',
  'ad.pay.cmpFilsPace': 'Délai de réponse',
  'ad.pay.cmpFilsNoLast': '(aucun message)',
  'ad.pay.cmpFilsCount': 'Fils actifs au moment de l’export',
  'ad.pay.cmpFilsUnknown':
    '{n} fil(s) actif(s) n’ont pas pu être nommés : ils ne sont plus au tableau du compte.',
  'ad.pay.cmpFilsNote':
    'Cette feuille nomme les fils actifs que l’onglet d’écart compte : leur sujet, leur dernier message et son jour, et leur délai de réponse. Elle décrit l’état du compte au moment de l’export, et non une différence entre les deux points comparés ; elle n’existe que lorsque les rythmes de réponse avaient été mesurés.',
  'ad.pay.exportNone': 'Aucune archive exportée depuis cet appareil : celle du jour reste à faire.',
  'ad.pay.exportToday': 'L’archive du jour existe',
  'ad.pay.exportMemoHint':
    'Date du dernier export du tableau, retenue sur cet appareil : elle dit d’un coup d’œil si l’archive du jour a déjà été produite.',
  'ad.pay.exportClear': 'Effacer la mémoire',
  'ad.pay.exportClearHint':
    'Efface la date du dernier export retenue sur cet appareil : la ligne d’archive repart vierge, comme s’il n’y avait jamais eu d’export. Les fichiers déjà téléchargés ne bougent pas.',
  'ad.pay.exportClearConfirm': 'Confirmer l’effacement',
  'ad.pay.exportClearConfirmHint':
    'Un second clic efface la mémoire. Un nouvel export la réécrira aussitôt.',
  'ad.pay.exportClearCancel': 'Annuler',
  'ad.pay.exportClearCancelHint': 'Garde la mémoire telle quelle, sans rien effacer.',
  'ad.pay.exportCleared': 'Mémoire effacée',
  'ad.pay.weekLabel': 'Exporté cette semaine',
  'ad.pay.weekToday': 'dernier export aujourd’hui',
  'ad.pay.weekSince': 'dernier export il y a {n} jour(s)',
  'ad.pay.weekNever': 'aucun export connu',
  'ad.pay.weekHint':
    'Compte les exports du tableau produits ces sept derniers jours, et depuis combien de jours remonte le dernier : un tableau qu’on n’a pas réédité depuis plusieurs jours se repère sans lire la date.',
  'ad.pay.sortMontant': 'Trier par montant',
  'ad.pay.sortMontantHint':
    'Classe la file visible du montant le plus haut au plus bas, à égalité sur l’échéance la plus ancienne : encaisser d’abord les abonnements les plus rentables.',
  'ad.pay.focusTriMontant': 'Tri par montant décroissant',
  'ad.pay.focusVueRegler': 'Vue « À régler »',
  'ad.pay.focusVuePrets': 'Vue « Encaissables »',
  'ad.pay.csvFilter': 'Filtre de l’export',
  'ad.pay.focus': 'Réduit au compte {mail}',
  'ad.pay.focusHint':
    'Rend la file entière : tous les abonnements de la console reviennent, avec leurs motifs.',
  'ad.pay.focusClear': 'Voir tous les abonnements',
  'ad.pay.focusEmpty':
    'Ce compte n’a aucun abonnement dans la file : il n’y a rien à encaisser ici.',
  'ad.pay.sortedTotal': 'Total de la file',
  'ad.pay.sortedTotalRows': '{n} ligne(s)',
  'ad.pay.sortedTotalReady': 'dont {n} encaissable',
  'ad.pay.sortedTotalReadyHint':
    'La part déjà encaissable de la file lue : les abonnements ouverts, chiffrés et prélevables qu’elle contient, et leur montant. L’autre montant, à côté, dit ce que la file porte en tout.',
  'ad.pay.sortedTotalDue': 'restant à régler {n}',
  'ad.pay.sortedTotalDueHint':
    'Ce que cette même file laisse en suspens : les abonnements ouverts, chiffrés mais pas encore prélevables — échéance dépassée, moyen de paiement manquant ou manuel, essai en cours — et leur montant. Un abonnement clos n’y entre pas.',
  'ad.pay.sortedTotalHint':
    'Somme des montants des lignes affichées : ce que cette file-là porte, tel qu’elle se lit — motif, vue et tri compris. Le tri ne change pas le total, il change seulement l’ordre dans lequel on encaisse.',

  'ad.xls.synthTitle': 'Synthèse — clients abonnés',
  'ad.xls.state': 'État',
  'ad.xls.count': 'Abonnements',
  'ad.xls.share': 'Part',
  'ad.xls.total': 'Total',
  'ad.xls.nearDue': 'Échéances à moins de 30 jours',
  'ad.xls.num': 'N°',
  'ad.xls.mail': 'E-mail',
  'ad.xls.daysLeft': 'Jours restants',
  'ad.xls.metier': 'Métier',
  'ad.xls.filter': 'Filtre de la liste',
  'ad.xls.filterCount': 'Jetons de filtre posés sur la liste au moment de l’export',
  'ad.xls.headLine':
    'Export du {date} — {chips} posé(s) sur la liste au moment du clic',
  'ad.xls.revueSortActive': 'tri de revue actif dans la messagerie',
  'ad.xls.apresSortActive': 'tri après relance actif dans la messagerie',
  'ad.xls.recentSortActive': 'tri « relevé le plus récent » actif dans la messagerie',
  'ad.xls.apresSortWho': 'ouvre la marche : {n}',
  'ad.xls.order': 'Ordre des lignes',
  'ad.xls.orderNone': 'ordre de la table',
  'ad.xls.orderDue': 'échéance la plus proche en tête',
  'ad.xls.orderDesc': 'échéance la plus lointaine en tête',
  'ad.xls.orderLate': 'compte le plus chargé en relectures longues en tête',
  'ad.xls.orderLateDesc': 'compte le moins chargé en relectures longues en tête',
  'ad.xls.orderApres': 'compte avec le plus de dépôts arrivés après la relance en tête',
  'ad.xls.orderApresDesc': 'compte avec le moins de dépôts arrivés après la relance en tête',
  'ad.xls.orderSleep': 'compte avec le plus de fils en sommeil en tête',
  'ad.xls.orderSleepDesc': 'compte avec le moins de fils en sommeil en tête',
  'ad.xls.noPublie': 'Comptes sans dépôt publié',
  'ad.xls.depotsPublies': 'Dépôts publiés',
  'ad.xls.depotsRefuses': 'Dépôts refusés',
  'ad.xls.relectures': 'Relectures longues',
  'ad.xls.sleepThreads': 'Fils dormants',
  'ad.xls.sleepAccounts': 'Comptes avec au moins un fil dormant',
  'ad.xls.sleepNote': 'La colonne « Fils dormants » compte, pour chaque compte, les conversations qui mettent un jour ou plus à répondre — la même mesure et le même seuil que la pastille de l’écran. Elle reste à zéro quand la mesure des rythmes n’a pas pu être lue : un zéro dit alors « rien de mesuré », pas « tout va bien ».',
  'ad.xls.reviewedThreads': 'Relu pendant la revue',
  'ad.xls.reviewedAccounts': 'Comptes avec un fil dormant relu pendant la revue',
  'ad.xls.reviewedThreadsTotal': 'Fils dormants relus pendant la revue',
  'ad.xls.reviewState': 'Revue en cours',
  'ad.xls.airesJamais': 'Aires jamais relevées encore dans la boîte à l’export',
  'ad.xls.airesJamaisList': 'Ces aires, une à une',
  'ad.xls.jamaisSortActive': 'tri « aire jamais relevée d’abord » actif dans la messagerie',
  'ad.xls.airesJamaisLink':
    'Les deux lignes ci-dessus mènent à la messagerie de la console, resserrée sur ces aires : un clic y ouvre la boîte déjà réduite, sans la chercher.',
  'ad.xls.airesJamaisNote':
    'La ligne « Aires jamais relevées encore dans la boîte » compte, au moment du clic, les aires portées par les conversations de la console qu’aucun relevé n’a encore emportées — ni d’ensemble, ni une à une. Elle se lit sur la même mémoire d’appareil que la pastille de la messagerie : deux exports du même jour, faits avant et après un relevé, ne portent plus le même chiffre.',
  'ad.xls.ancienSortActive': 'tri « relevé le plus ancien d’abord » actif dans la messagerie',
  'ad.xls.gommeSortActive': 'tri « gomme la plus récente d’abord » actif dans la messagerie',
  'ad.xls.gommeAncienneSortActive':
    'tri « gomme la plus ancienne d’abord » actif dans la messagerie',
  'ad.xls.gommeRestantes': 'Aires rendues par la gomme encore dans la boîte',
  'ad.xls.gommeRestantesList': 'Ces aires encore dans la boîte, une à une',
  'ad.xls.gommeRestantesHint':
    '{n} des {total} aires rendues par la gomme se tiennent encore dans la boîte au moment de l’export : le geste se lit sur ce qui reste à voir, comme sur ce qui est parti.',
  'ad.xls.gommeRestantesNote':
    'La ligne « Aires rendues par la gomme encore dans la boîte » compte, au moment du clic, les aires que la petite gomme a rendues vierges et qu’un fil de la boîte porte encore — lues sur la même mémoire d’appareil que la pastille de la messagerie. Elle se pose juste avant la ligne de l’écart, et les noms qui la suivent disent ces aires une à une. Le nom du fichier porte, à côté du poids du geste, le compte de celles qui y restent — « -1-restante » — puis celui de celles qui ont quitté la boîte — « -hors-boite-1 » — : deux exports du même jour, faits avant et après un départ, ne se confondent plus.',
  'ad.xls.gommeHorsSens': 'Sens de la ligne des départs',
  'ad.xls.gommeHorsSensRecent': 'la plus récemment effacée en tête',
  'ad.xls.gommeHorsSensAncien': 'la plus anciennement effacée en tête',
  'ad.xls.gommeHorsSensMois':
    'Les {n} départ(s), par mois d’effacement (le plus récent en tête) : {list} — les vagues du geste se lisent d’un coup.',
  'ad.xls.gommeHorsSensMoisListe': 'Ces départs, par mois d’effacement',
  'ad.xls.gommeHorsSensNote':
    'La ligne « Sens de la ligne des départs » reprend le sens que la ligne des aires parties lisait dans la messagerie au moment du clic, lu sur la même mémoire d’appareil : la plus récemment effacée en tête, ou la plus anciennement quand la ligne était retournée. Deux exports du même jour, faits avant et après un retournement, ne portent donc plus la même phrase ; le survol du bouton qui retourne la ligne dit, lui, combien de départs chaque mois a emportés.',
  'ad.xls.gommeSpan': 'Premier et dernier geste d’effacement',
  'ad.xls.gommeSpanValue': '{premier} → {dernier} · {n} jour(s)',
  'ad.xls.gommeSpanOne': '{date} · un seul geste retenu',
  'ad.xls.gommeSpanNone': 'aucune gomme sur cet appareil',
  'ad.xls.gommeSpanNote':
    'La ligne « Premier et dernier geste d’effacement » lit, sur la mémoire d’appareil de la pastille des gommes, le jour du premier effacement retenu et celui du dernier, avec l’écart de jours qui les sépare. Le premier jour ne se repose jamais : deux exports du même jour, faits avant et après une gomme, ne portent plus le même écart.',
  'ad.xls.airesJour': 'Aires relevées aujourd’hui encore dans la boîte à l’export',
  'ad.xls.airesJourList': 'Ces aires relevées aujourd’hui, une à une',
  'ad.xls.airesJourNote':
    'La ligne « Aires relevées aujourd’hui » compte, au moment de l’export, les aires portées par les conversations de la console dont le relevé de fils porte la date du jour, lue sur la même mémoire d’appareil que la pastille de la messagerie. Elle et les noms qui la suivent mènent à la messagerie de la console, resserrée sur ces aires : le geste de la journée se relit d’un clic, sans chercher la boîte. Deux exports d’une même journée, faits avant et après un relevé, ne portent donc plus le même chiffre. Le tri « relevé le plus ancien d’abord », posé sur la ligne des fils de la messagerie, se nomme dans la ligne « Filtre de la liste » avec le compte qui ouvre sa marche ; son survol dit combien de jours séparent le plus vieux relevé du plus récent. Dans la messagerie, une pastille compte ces mêmes aires et nomme au survol les fils qu’elles ont emportés, un à un ; sa petite gomme efface la date de toutes les aires de la boîte, quel que soit leur jour, et la synthèse les compte alors comme jamais relevées.',
  'ad.xls.airesJourFilsHint':
    'Les {fils} fil(s) emportés par les aires relevées aujourd’hui, un à un : {detail}. Le survol donne le détail fil par fil, comme la pastille de la messagerie.',
  'ad.xls.airesJourAireFilsHint': '{region} · {n} fil(s) emporté(s) — {detail}.',
  'ad.xls.airesJourAireNoThread': '{region} · aucun fil dans la boîte.',
  'ad.xls.airesJourNoThread': 'aucun fil dans la boîte',
  'ad.xls.airesJourFilsNote':
    'Sous la ligne « Aires relevées aujourd’hui », chaque aire emporte le compte de ses fils et, au survol, leurs noms un à un — le même détail que la pastille de la messagerie, lu sur la même mémoire d’appareil. La colonne qui suit chaque nom dit combien de fils cette aire a emportés.',
  'ad.xls.airesTightJour': 'Aires resserrées dans la messagerie — dernier relevé de chacune',
  'ad.xls.airesTightJourList': 'Ces aires et leur dernier relevé',
  'ad.xls.airesTightJourListHint':
    'Chaque aire et la date de son dernier relevé se lisent sur cette ligne, dans l’ordre du monde ; un clic sur la date ouvre la messagerie resserrée sur ces mêmes aires, et chaque aire garde sa propre ligne où sa date s’ouvre sur elle seule.',
  'ad.xls.airesTightJourRow': '{region} · dernier relevé le {date}',
  'ad.xls.airesTightJamaisRow': '{region} · jamais relevée',
  'ad.xls.airesTightOldest': 'Plus ancienne date de relevé parmi ces aires',
  'ad.xls.airesTightOldestNone': 'sans relevé',
  'ad.xls.airesTightOldestNote':
    'La ligne « Plus ancienne date de relevé parmi ces aires » donne, en tête du resserrement, le relevé le plus ancien des aires retenues — ou la mention « sans relevé » quand aucune n’a encore été relevée. Elle mène, comme la ligne des aires, à la messagerie resserrée sur ces mêmes aires : la date se lit et s’ouvre. Sous elle, une porte par aire reprend le nom de l’aire et sa date, et la date elle-même ouvre la boîte resserrée sur cette seule aire. Au survol de chaque nom d’aire, son ancienneté en jours s’ajoute à son compte de fils — « relevée il y a 12 jours » —, pour que le resserrement se juge sans quitter le classeur.',
  'ad.xls.airesTightAgeToday': 'Relevée aujourd’hui.',
  'ad.xls.airesTightAgeDays': 'Relevée il y a {n} jour(s).',
  'ad.xls.airesTightAgeJamais': 'Jamais relevée.',
  'ad.xls.airesTightTodayNote':
    'Le nom du fichier compte aussi, juste après les aires encore sans relevé, celles dont le relevé porte la date du jour — « -releve-aujourdhui-2 » —, pour que deux exports d’une même journée se distinguent par ce qui vient d’être relevé. La petite gomme de la ligne des fils remet à zéro les relevés de ces seules aires : leur date s’oublie, elles quittent le carnet des aires emportées d’ensemble, et la pastille les dit à nouveau jamais relevées — les autres aires de l’appareil et le compte des gestes d’ensemble ne bougent pas.',
  'ad.xls.airesTightFils': 'Fils que les aires resserrées laissent dans la messagerie',
  'ad.xls.airesTightFilsTotalHint':
    'Les aires resserrées laissent ensemble {fils} fil(s) dans la boîte · {n} aire(s) — le poids du resserrement se lit sur cette ligne-là, sans descendre jusqu’au compte des fils.',
  'ad.xls.airesTightFilsHint':
    '{region} · {n} fil(s) dans la boîte — le chiffre se lit au survol, sans ouvrir la messagerie.',
  'ad.xls.airesTightFilsParAireHint':
    '{n} fil(s) au total, aire par aire : {detail} — le poids de chacune se lit ici, sans descendre jusqu’à ses lignes.',
  'ad.xls.airesTightFilsNote':
    'La ligne « Fils que les aires resserrées laissent dans la messagerie » compte, au moment du clic, les fils de la boîte dont un participant se tient dans l’une de ces aires — un fil ne se compte qu’une fois, même si deux aires le nomment. Au survol de chaque nom d’aire, le chiffre de ses propres fils se lit sans ouvrir la messagerie. Le nom du fichier porte, juste après le nombre d’aires, le compte des fils qu’elles laissent ensemble — « aires-2-7-fils » —, puis les fils de chacune, une à une, dans l’ordre du monde — « par-aire-maghreb-4-golfe-3 » —, puis l’ancienneté du plus ancien relevé en jours — « releve-12j » — et la plus ancienne date de relevé au format jour-mois, pour la lire d’un coup dans un dossier de téléchargements. La ligne des aires porte ce même total au survol : le resserrement se pèse sur la ligne elle-même. Son survol donne aussi le détail aire par aire — « Maghreb 4 · Golfe 3 » —, et le nom du fichier compte, juste après la plus ancienne date, les aires encore sans relevé — « -sans-releve-2 ».',
  'ad.xls.airesTightJourNote':
    'La ligne « Aires resserrées dans la messagerie » reprend les aires sur lesquelles la boîte était resserrée au moment du clic, avec le jour de leur dernier relevé de fils lu sur cet appareil — ou la mention « jamais relevée ». Chaque aire se nomme sur sa propre ligne, et ce nom mène à la messagerie resserrée sur cette seule aire. La ligne s’efface quand aucune aire n’était resserrée : la synthèse porte alors une ligne de moins, rien d’autre ne bouge.',
  'ad.xls.reviewJournalSheet': 'Journal de la revue',
  'ad.xls.reviewJournalN': 'N°',
  'ad.xls.reviewJournalThread': 'Fil relu',
  'ad.xls.reviewJournalCompte': 'Compte',
  'ad.xls.reviewJournalMail': 'E-mail du compte',
  'ad.xls.reviewJournalTime': 'Heure d’ouverture',
  'ad.xls.reviewJournalSince': 'Minutes depuis la première ouverture',
  'ad.xls.reviewJournalGap': 'Délai de réponse',
  'ad.xls.reviewJournalLast': 'Dernier message le (heure)',
  'ad.xls.visitLength': 'Durée de la visite',
  'ad.xls.reviewJournalCompteNote':
    'Ce classeur est le journal de la revue réduit à un seul compte : il ouvre une ligne par fil dormant de ce compte relu pendant la visite, dans l’ordre des ouvertures, avec l’heure, les minutes depuis la première ouverture, le délai de réponse et le dernier message. Le bas reprend les bornes de la visite, pour la dater sans ouvrir le classeur entier. Il ne contient que ce que la fiche a pu lire, et s’efface avec la visite.',
  'ad.xls.reviewJournalEmpty': 'Aucun fil dormant n’a été relu pendant cette visite.',
  'ad.xls.reviewJournalSummary': 'Synthèse de la visite',
  'ad.xls.reviewJournalReviewed': 'Fils relus pendant la visite',
  'ad.xls.reviewJournalFirstOpen': 'Première ouverture',
  'ad.xls.reviewJournalLastOpen': 'Dernière ouverture',
  'ad.xls.reviewJournalSpan': 'Écart entre la première et la dernière ouverture',
  'ad.xls.reviewJournalSpanMin': '{n} min',
  'ad.xls.reviewJournalSpanHour': '{h} h {m}',
  'ad.xls.reviewJournalSummaryNote':
    'Le bas du journal dit combien de fils dormants ont été relus pendant la visite et l’écart entre la première et la dernière ouverture : la durée de la visite se lit d’un coup d’œil, sans recouper deux exports. L’écart se mesure sur les ouvertures retenues, il ne dit rien du temps de réponse des fils.',
  'ad.xls.reviewJournalNote':
    'L’onglet « Journal de la revue » ouvre une ligne par fil dormant relu pendant cette visite, dans l’ordre où ils ont été ouverts depuis la messagerie, avec le compte à qui il appartient, leur délai de réponse moyen — la même mesure et le même seuil que la pastille de sommeil — l’heure à laquelle le fil a été ouvert, pour dater la revue à la minute, les minutes écoulées depuis la première ouverture de la visite, pour situer chaque fil dans la revue, et la date et l’heure de leur dernier message — l’attente du fil se compare alors au moment de sa relecture —, avec l’adresse du compte à côté de son nom pour la copier sans ouvrir sa fiche. Il reste vide quand rien n’a été relu, et s’efface avec la visite.',
  'ad.xls.revueNote': 'Le nom du fichier porte l’état de la revue — « revue-3-sur-8 » par exemple — pour distinguer deux exports du même jour sans ouvrir le classeur. La revue se lit sur les fils dormants ouverts depuis la messagerie pendant cette visite. Il porte aussi la durée de la visite — « -duree-42min » par exemple — juste après le nombre de fils relus, pour distinguer deux exports d’une même revue arrêtée plus tard. Il porte aussi le compte qui ouvre la marche du tri actif — « -tete-revue-… » ou « -tete-apres-… » — quand un tri parle dans la messagerie.',
  'ad.xls.revuedNote': 'La colonne « Relu pendant la revue » compte les fils dormants du compte ouverts depuis la messagerie pendant cette visite — la même mémoire de session que le repère « relu » de l’écran. Elle reste à zéro quand rien n’a été relu, et s’efface avec la visite.',
  'ad.xls.lastRelance': 'Dernière relance préparée',
  'ad.xls.relanceNote': 'La colonne « Dernière relance préparée », la colonne « Arrivé après la relance » et les compteurs de relances de la synthèse viennent de la mémoire de cet appareil : ils datent le dernier message ouvert depuis la console, pas un envoi. La colonne « Arrivé après la relance » de l’onglet « Comptes » lit cette même mémoire. La ligne « Comptes sans aucune relance préparée » compte, sur les deux tables, les comptes que le fichier emporte et pour lesquels aucun message n’a été ouvert.',
  'ad.xls.withLate': 'Comptes avec relecture longue',
  'ad.xls.lateRows': 'Dépôts en relecture longue',
  'ad.xls.relancesToday': 'Comptes relancés aujourd’hui',
  'ad.xls.relancesWeek': 'Comptes relancés cette semaine',
  'ad.xls.afterRelanceRows': 'Dépôts arrivés après une relance',
  'ad.xls.afterRelanceLateRows': 'Dont dépôts après relance déjà en relecture longue',
  'ad.xls.afterRelanceAccounts': 'Comptes avec dépôt arrivé après une relance',
  'ad.xls.sansRelance': 'Comptes sans aucune relance préparée',
  'ad.xls.lateCol': 'Relectures longues',
  'ad.xls.lateComptes': '● {n} dépôt(s) en relecture longue',
  'ad.xls.lateRowMark': '● en relecture longue',
  'ad.xls.comptesLateNote': 'L’onglet « Comptes » ouvre, sous chaque compte, une ligne par dépôt encore en relecture longue avec son âge ; la colonne qui les précède n’affiche que les comptes qui en ont encore un.',
  'ad.xls.lateComptesSheet': 'Comptes en relecture longue',
  'ad.xls.lateAccountCount': 'Relectures longues',
  'ad.xls.oldestDepot': 'Plus ancien dépôt',
  'ad.xls.lateComptesSheetEmpty': 'Aucun compte n’a de dépôt en relecture longue.',
  'ad.xls.lateComptesSheetNote': 'L’onglet « Comptes en relecture longue » ouvre une ligne par compte encore en attente, avec le nombre de ses dépôts et le plus ancien d’entre eux — son type, sa date et son âge, et la relance préparée quand elle existe. Ses lignes suivent l’ordre choisi à l’écran : quand la liste est triée par relectures longues, le compte le plus chargé ouvre le fichier. Le titre du plus ancien dépôt ouvre sa ligne dans l’onglet « Annonces » de la console.',
  'ad.xls.lateOnlyNote': 'Ce classeur ne contient que les dépôts d’un seul compte encore en relecture depuis plus de sept jours, avec leur âge et la date de relance préparée ; cette date vient de la mémoire de cet appareil, pas d’un envoi.',
  'ad.xls.afterRelance': 'Arrivé après la relance',
  'ad.xls.afterRelanceYes': '● arrivé après la relance',
  'ad.xls.afterRelanceNo': 'avant la relance',
  'ad.xls.afterRelanceComptes': '● {n} dépôt(s) arrivé(s) après la relance',
  'ad.xls.afterRelanceRank': 'rang {r} / {t}',
  'ad.xls.comptesDetache': 'onglet « Comptes » laissé à l’ordre de la table',
  'ad.xls.comptesPromoOrder': 'onglet « Comptes » trié par promotion, la plus ancienne en tête',
  'ad.xls.comptesPromoOrderRecent':
    'onglet « Comptes » trié par promotion, la plus récente en tête',
  'ad.xls.afterSheet': 'Dépôts après relance',
  'ad.xls.afterSheetEmpty': 'Aucun dépôt de ce compte n’est arrivé après la relance.',
  'ad.xls.afterSheetNote': 'Ce classeur ne contient que les dépôts d’un seul compte datés après la relance préparée ; la date de relance vient de la mémoire de cet appareil, pas d’un envoi. Le bloc « Depuis la relance » reprend le nombre de ces dépôts, ceux qui attendent déjà une réponse depuis plus de sept jours, et le rang du compte parmi ceux qui en ont reçu — la même mesure que la fiche.',
  'ad.xls.afterSheetSummary': 'Depuis la relance',
  'ad.xls.afterSheetLate': 'Dont déjà en relecture longue',
  'ad.xls.afterSheetRank': 'Rang parmi les comptes',
  'ad.xls.lateSheet': 'Relectures longues',
  'ad.xls.lateSheetEmpty': 'Aucun dépôt n’attend de réponse depuis plus de sept jours.',
  'ad.xls.lateNote': 'L’onglet « Relectures longues » ouvre une ligne par dépôt encore sans réponse depuis plus de sept jours, avec son âge, sa date de relance, la pastille « arrivé après la relance » et l’adresse du compte qui l’a déposé. La date de relance vient de la mémoire de cet appareil, comme la colonne « Dernière relance préparée » ; elle reste vide quand aucun message n’a été ouvert. Ses lignes suivent l’ordre choisi à l’écran : triées par dépôts arrivés après la relance, les comptes se suivent de la même façon et chaque compte garde ses dépôts du plus ancien au plus récent.',
  'ad.xls.indentedNote': 'Dans l’onglet « Abonnés », la colonne « Relectures longues » ouvre sous chaque compte une ligne par dépôt encore sans réponse, en retrait, avec son âge, son type et sa date de dépôt. Quand une relance a été préparée pour le compte, une première ligne en retrait rappelle combien de dépôts sont arrivés après elle et le rang du compte parmi ceux qui ont reçu de tels dépôts — la même mesure que la fiche.',
  'ad.xls.accountMail': 'Compte (e-mail)',
  'ad.xls.depot': 'Dépôt',
  'ad.xls.type': 'Type',
  'ad.xls.rubrique': 'Rubrique',
  'ad.xls.postedOn': 'Déposé le',
  'ad.xls.ageDays': 'Âge (jours)',
  'ad.xls.relanceOn': 'Relance préparée le',
  'ad.xls.note': 'Classeur lu sur les lignes de la console : chaque abonnement y garde l’offre, le montant, l’échéance et le canal de paiement affichés à l’écran, avec ses dépôts publiés et refusés.',

  'ad.f.stamp': 'Fiche du compte',
  'ad.f.title': 'Fiche du compte',
  'ad.f.close': 'Fermer',
  'ad.f.loading': 'Chargement de la fiche…',
  'ad.f.err': 'La fiche n’a pas pu être chargée.',
  'ad.f.identity': 'Identité',
  'ad.f.mail': 'E-mail',
  'ad.f.phone': 'Téléphone',
  'ad.f.role': 'Rôle',
  'ad.f.roleAdmin': 'Administrateur',
  'ad.f.roleOther': 'Compte ordinaire',
  'ad.f.abo': 'Abonnements',
  'ad.f.aboEmpty': 'Aucun abonnement rattaché à ce compte.',
  'ad.f.aboPayHint':
    'L’encaissement de cet abonnement, lu avec la même règle que l’écran « Paiements » : ouvert, chiffré et prélevable.',
  'ad.f.aboPayOpenHint':
    'Ouvre l’écran « Paiements » réduit à ce compte, avec la même règle que cette pastille.',
  'ad.f.aboRegler': '{n} à régler',
  'ad.f.aboReglerHint':
    'Ouvre l’écran « Paiements » réduit à ce compte et à cette seule vue : les abonnements qui ne peuvent pas encore être encaissés.',
  'ad.f.aboPrets': '{n} encaissables',
  'ad.f.aboPretsHint':
    'Ouvre l’écran « Paiements » réduit à ce compte et à la vue « Encaissables », déjà triée par montant décroissant : les abonnements ouverts, chiffrés et prélevables en l’état, les plus rentables d’abord.',
  'ad.f.aboNone': 'Abonnements : aucun',
  'ad.f.annonces': 'Dépôts',
  'ad.f.annoncesEmpty': 'Aucun dépôt pour ce compte.',
  'ad.f.publies': 'publiés',
  'ad.f.refuses': 'refusés',
  'ad.f.attente': 'en relecture',
  'ad.f.demandes': 'Demandes B2B',
  'ad.f.demandesEmpty': 'Aucune demande B2B envoyée par ce compte.',
  'ad.f.copy': 'Copier l’adresse et le récapitulatif',
  'ad.f.copyHint':
    'Emporte l’adresse du compte, chaque abonnement avec son montant et son échéance, et le nombre de dépôts publiés, refusés et en relecture longue.',
  'ad.f.depotNone': 'aucun dépôt',
  'ad.f.depotNoneCopy': 'Dépôts : aucun',
  'ad.f.lateCopy': 'en relecture longue',
  'ad.f.lateCopyNone': 'aucune relecture longue',
  'ad.f.depotToday': 'déposé aujourd’hui',
  'ad.f.depotSince': 'en attente depuis {n} j',
  'ad.f.depotSinceHint':
    'Jours écoulés depuis le dépôt : au-delà de sept jours sans réponse, la pastille s’allume.',
  'ad.f.lateLink': 'Voir ses {n} dépôts en relecture longue',
  'ad.f.lateLinkHint':
    'Ouvre l’onglet « Annonces » réduit aux dépôts de ce compte en relecture depuis plus de sept jours.',
  'ad.f.lateSheet': 'Classeur de ses relectures longues',
  'ad.f.lateSheetHint':
    'Télécharge un classeur réduit aux dépôts de ce compte en relecture depuis plus de sept jours, avec leur date, leur âge et la relance préparée.',
  'ad.f.afterRelance': '{n} dépôt(s) arrivé(s) après la relance',
  'ad.f.afterRelanceNone': 'aucun dépôt après la relance',
  'ad.f.afterRelanceRank': 'rang {r} sur {t}',
  'ad.f.afterRelanceRankHint':
    'Rang du compte parmi ceux dont un dépôt est arrivé après leur relance : le premier est celui que le message a le moins couvert.',
  'ad.f.afterRelanceHint':
    'Dépôts de ce compte datés après la préparation du message : la relance ne les couvre pas, ils appellent une lecture à part.',
  'ad.f.afterRelanceList': 'Dépôts arrivés après la relance',
  'ad.f.afterRelanceListLate': 'Dépôts arrivés après la relance, déjà en relecture longue',
  'ad.f.afterRelanceLateFilterHint':
    'Un clic réduit la liste des dépôts arrivés après la relance à ceux qui attendent déjà une réponse depuis plus de sept jours ; un second clic la rouvre en entier.',
  'ad.f.afterRelanceOpen': 'Ouvrir ce dépôt dans l’onglet « Annonces »',
  'ad.f.afterSheet': 'Classeur de ses dépôts après relance',
  'ad.f.afterSheetHint':
    'Télécharge un classeur réduit aux dépôts de ce compte arrivés après la relance, avec leur date, leur âge et leur état.',
  'ad.f.afterRelanceLate':
    'dont {n} en relecture longue',
  'ad.f.afterRelanceLateHint':
    'Parmi les dépôts arrivés après la relance, ceux qui attendent déjà une réponse depuis plus de sept jours : le message ne les a pas couverts et l’attente s’est déjà installée.',
  'ad.f.prioCopy': 'Copier les priorités',
  'ad.f.prioCopyHint':
    'Copie un récapitulatif des fils en sommeil avec leur délai moyen, puis des dépôts en relecture longue avec leur attente — prêt à coller dans un message.',
  'ad.f.prioLateShort': 'dépôts en relecture longue',
  'ad.f.prioLateLine': '{n} dépôt(s) en relecture longue',
  'ad.f.prioLateNone': 'Aucune relecture longue : aucun dépôt n’attend depuis plus de sept jours.',
  'ad.f.relance': 'Préparer une relance',
  'ad.f.relanceHint':
    'Ouvre un message pré-rempli : les dépôts encore en attente avec leur âge, et la ligne récapitulative du compte.',
  'ad.f.lastRelance': 'Dernière relance préparée',
  'ad.f.priorites': 'Priorités',
  'ad.f.weekExport': 'Exporté cette semaine',
  'ad.f.weekExportOpen': 'Ouvrir les paiements pour produire l’export',
  'ad.f.weekExportHint':
    'Compteur des exports du tableau produits ces sept derniers jours, lu sur la mémoire de cet appareil. Un clic ouvre l’écran « Paiements » resserré sur ce compte, pour y produire l’export qui manque.',
  'ad.f.weekScopeTitle': 'Exports de la semaine, sur ce compte',
  'ad.f.weekScopeHint':
    'Les exports de ces sept derniers jours relus sur le seul périmètre de ce compte : ce que ses abonnements pèsent à la vue et au motif de chaque fichier, et le nombre de ses lignes. Seuls les exports qui portaient au moins une de ses lignes sont retenus.',
  'ad.f.weekScopeRows': '{n} ligne(s) du compte',
  'ad.f.weekScopeNone':
    'Aucun export de la semaine ne portait ce compte : rien à relire sur son périmètre.',
  'ad.f.weekScopeNoMemory':
    'Aucun export connu sur cet appareil : la semaine n’a rien à relire pour ce compte.',
  'ad.f.weekScopeAvg': 'Montant moyen {n}',
  'ad.f.weekScopePeak': 'Pic {n} le {date}',
  'ad.f.weekScopePeakHint':
    'L’export où ce compte a pesé le plus lourd dans la semaine, et sa date : le pic se lit à côté de la moyenne. Un seul export chiffré ne fait pas un pic.',
  'ad.f.weekScopePeakOpenHint':
    'Un clic ouvre cet export dans « Paiements », resserré sur ce compte.',
  'ad.f.weekScopeAvgNote': 'sur {n} export(s)',
  'ad.f.weekScopeAvgOpenHint':
    'Un clic ouvre la comparaison de deux exports de la semaine déjà choisis pour ce compte — le plus ancien et le plus récent qui le portaient —, pour lire l’écart de montant et de lignes entre eux.',
  'ad.f.weekScopeAvgHint':
    'Moyenne des montants que ce compte pèse, lue sur les exports de la semaine qui le portaient, à leur vue et à leur motif. Les exports où il ne comptait aucune ligne n’entrent pas dans la moyenne.',
  'ad.f.weekScopeOpen':
    'Ouvrir cet export dans « Paiements », resserré sur ce compte',
  'ad.f.weekScopeCmpTitle': 'Entre deux exports',
  'ad.f.weekScopeCmpFrom': 'Départ',
  'ad.f.weekScopeCmpTo': 'Arrivée',
  'ad.f.weekScopeCmpUp': '+{n} de montant sur ses lignes',
  'ad.f.weekScopeCmpDown': '−{n} de montant sur ses lignes',
  'ad.f.weekScopeCmpFlat': 'montant inchangé',
  'ad.f.weekScopeCmpHint':
    'L’écart n’est calculé que sur les lignes de ce compte, lues à la vue et au motif de chaque export : il ne dit rien du tableau entier.',
  'ad.f.weekScopeCmpOpenHint':
    'Un clic ouvre la comparaison de ces deux exports dans « Paiements », déjà choisis pour ce compte.',
  'ad.f.weekScopeCmpNote':
    'Les deux exports les plus écartés de la semaine qui portaient encore des lignes du compte, avec l’écart de montant de ses seules lignes — pas celui de la file entière.',
  'ad.f.weekScopeCmpParties': 'Parties −{n} sur ses lignes',
  'ad.f.weekScopeCmpPartiesHint':
    'Le montant que les lignes parties entre les deux exports ont retiré au périmètre du compte, retrouvées dans le tableau par leur identifiant.',
  'ad.f.weekScopeCmpPartiesUnknown':
    '{n} ligne(s) partie(s) ne sont plus au tableau : leur montant ne s’y lit plus, et n’entre pas dans le chiffre posé au-dessus.',
  'ad.f.weekScopeCmpPartiesList': 'Les {n} ligne(s) partie(s), une à une',
  'ad.f.weekScopeCmpPartiesListHint':
    'Les lignes parties entre les deux exports, nommées sous le montant qu’elles ont retiré, du plus lourd au plus léger : la fiche se relit sans ouvrir le classeur. Une ligne qui n’est plus au tableau ne s’y trouve pas.',
  'ad.f.weekScopeCmpPartiesTotal': 'total retiré −{n}',
  'ad.f.weekScopeCmpPartiesNoTotal': 'total indisponible',
  'ad.f.weekScopeCmpPartiesNoAmount': 'montant vide',
  'ad.f.weekScopeCmpPartiesMajor':
    'Dont {n} ligne(s) pèsent à elles seules plus de la moitié du montant retiré ({t}).',
  'ad.f.weekScopeCmpPartiesMajorNone':
    'Aucune de ces lignes ne pèse à elle seule plus de la moitié du montant retiré : le retrait se répartit sur plusieurs.',
  'ad.f.weekScopeCmpPartiesMajorHint':
    'Compté sur les lignes nommées dans la liste, pas sur le total des parties : une ligne qui n’est plus au tableau ne s’y pèse pas.',
  'ad.f.weekScopeCmpPartiesMajorOn': 'Liste réduite à ces {n} ligne(s)',
  'ad.f.weekScopeCmpPartiesMajorTokenHint':
    'Un clic resserre la liste des lignes parties sur celles qui pèsent à elles seules plus de la moitié du montant retiré ; un second clic la rend entière. Le fichier suit la liste resserrée.',
  'ad.f.weekScopeCmpPartiesMajorExitHint':
    'Un clic rend la liste entière des lignes parties, dans l’ordre du montant retiré.',
  'ad.f.weekScopeCmpPartiesShare': 'Se partagent le retrait · {n}',
  'ad.f.weekScopeCmpPartiesShareHint':
    'Un clic resserre la liste des lignes parties sur celles qui ne pèsent pas à elles seules plus de la moitié du montant retiré — celles qui se partagent le retrait ; un second clic la rend entière. Le fichier suit la liste resserrée.',
  'ad.f.weekScopeCmpPartiesShareOn': 'Liste réduite à ces {n} ligne(s) partagées',
  'ad.f.weekScopeCmpPartiesShareExitHint':
    'Un clic rend la liste entière des lignes parties, dans l’ordre du montant retiré.',
  'ad.f.weekScopeCmpPartiesShareNote':
    'Les {n} ligne(s) partagée(s) se partagent {p} % du retrait · {s}',
  'ad.f.weekScopeCmpPartiesShareNoteHint':
    'La part du retrait que se partagent les lignes qui ne pèsent pas plus de la moitié à elles seules : leur somme rapportée au montant retiré total, en pourcentage, et ce qu’elles pèsent en clair.',
  'ad.f.weekScopeCmpSheet': 'Classeur de la comparaison',
  'ad.f.weekScopeCmpSheetHint':
    'Télécharge un classeur réduit au périmètre de ce compte : les deux exports avec ce qu’il y pesait, l’écart de montant et de lignes de ses seules lignes, puis celles qui sont parties avec ce que chacune a retiré.',
  'ad.f.weekScopeCmpFils': 'Fils actifs à l’export',
  'ad.f.weekScopeCmpFilsSame':
    'Le même compte se lit aux deux points : il décrit l’état du compte au moment de l’export, il ne se déduit pas de la différence entre les deux archives.',
  'ad.f.weekScopeCmpFilsNote':
    'Les conversations du compte qui répondent en moins d’un jour, comptées au moment où le classeur a été produit : un état du compte, pas une différence entre les deux exports.',
  'ad.f.weekScopeCmpPartiesMajorMark': 'plus de la moitié',
  'ad.f.weekScopeCmpPartiesMajorLine': 'Dont {n} ligne(s) majoritaire(s) — CSV réduit',
  'ad.f.weekScopeCmpPartiesMajorLineHint':
    'Télécharge en CSV les seules lignes qui pèsent à elles seules plus de la moitié du montant retiré, avec ce qu’elles ont retiré et leur propre total : le fichier ne porte que ces lignes-là, sans resserrer la liste à l’écran.',
  'ad.f.weekScopeCmpPartiesCsv': 'CSV des lignes parties',
  'ad.f.weekScopeCmpPartiesCsvHint':
    'Télécharge en CSV la seule liste des lignes parties du compte, telle qu’elle se lit sous le montant retiré — du plus lourd au plus léger —, avec le montant que chacune a retiré et le total sous les lignes. Une ligne qui a quitté le tableau ne s’y nomme pas : elle est comptée sous la liste.',
  'ad.f.revueTitre': 'Revue de ce compte',
  'ad.f.revueFils': '{n} fils relus',
  'ad.f.revueOpenHint':
    'Ouvre la messagerie réduite aux fils en sommeil de ce compte, en mode revue : chaque fil ouvert y marque l’avancement, sans chercher les conversations dans la liste.',
  'ad.f.revueDebut': 'Première ouverture',
  'ad.f.revueFin': 'Dernière ouverture',
  'ad.f.revueEcart': 'Écart',
  'ad.f.revueSheet': 'Journal de la revue de ce compte',
  'ad.f.revueSheetHint':
    'Un clic ouvre le journal de la revue réduit à ce compte, avec l’heure et les minutes de chaque ouverture, le délai de réponse et le dernier message de chaque fil relu.',
  'ad.f.revueNote':
    'Les fils dormants de ce compte relus pendant la visite, avec l’heure de la première et de la dernière ouverture et l’écart entre les deux : la durée de la visite se lit ici, sans ouvrir le classeur. L’écart parle de la revue, pas du temps de réponse des fils.',
  'ad.f.sleepThreads': 'fils en sommeil',
  'ad.f.sleepThreadsHint':
    'Conversations de ce compte qui mettent un jour ou plus à répondre : elles passent devant le reste de la fiche.',
  'ad.f.sleepThreadsNone':
    'Aucun fil en sommeil : toutes les conversations de ce compte répondent en moins d’un jour.',
  'ad.f.allThreads': 'Tous les fils',
  'ad.f.allThreadsOff': 'Dormants seuls',
  'ad.f.allThreadsHint':
    'Ouvre la liste à tous les fils du compte, les actifs compris : chaque ligne porte la même porte vers le fil tel que le compte le voit.',
  'ad.f.allThreadsExitHint':
    'Referme la liste sur les seuls fils en sommeil, ceux qui passent devant le reste de la fiche.',
  'ad.f.actifsThreads': 'fils actifs',
  'ad.f.actifsThreadsHint':
    'Conversations de ce compte qui répondent en moins d’un jour : elles se lisent à côté des dormants, sans ouvrir la liste.',
  'ad.f.sleepOpen': 'Ouvrir le fil dans la messagerie',
  'ad.f.sleepOpenPublic': 'Ouvrir ce fil',
  'ad.f.sleepOpenPublicHint':
    'Ouvre le fil tel que le compte le voit, dans un autre onglet : la fiche reste en place derrière.',
  'ad.f.relanceToday': 'aujourd’hui',
  'ad.f.relanceAgo': 'il y a {n} j',
  'ad.f.relanceSoonHint':
    'Une relance a été préparée il y a moins de trois jours : l’attente n’a sans doute pas changé, vérifiez avant d’en préparer une autre.',

  'ad.r.stamp': 'Relance',
  'ad.r.title': 'Relance pré-remplie',
  'ad.r.lead': 'Le message reprend les dépôts encore en attente et la ligne récapitulative du compte. Retouchez-le avant de l’envoyer ; rien ne part d’ici.',
  'ad.r.field': 'Message',
  'ad.r.subject': 'Vos dépôts en relecture — {n} en attente',
  'ad.r.subjectLabel': 'Objet',
  'ad.r.greet': 'Bonjour,',
  'ad.r.greetNamed': 'Bonjour {nom},',
  'ad.r.intro': 'Nous revenons vers vous au sujet de {n} dépôt(s) encore en relecture :',
  'ad.r.introAccount': 'Nous revenons vers vous au sujet de votre compte :',
  'ad.r.outro': 'Nous restons à votre disposition pour toute précision.',
  'ad.r.sign': 'L’équipe PaperAtlas',
  'ad.r.copy': 'Copier le message',
  'ad.r.copyHint': 'Copie le message tel qu’il est écrit, prêt à coller dans votre logiciel de courrier.',
  'ad.r.mail': 'Ouvrir dans le courrier',
  'ad.r.close': 'Fermer',

  'ad.ann.stamp': 'Annonces et offres',
  'ad.ann.sub': 'Chaque dépôt, dans son état de relecture. Publier met l’annonce sur le tableau ; la remettre en attente la retire.',
  'ad.ann.all': 'Toutes',
  'ad.ann.search': 'Rechercher un titre, une organisation, une ville…',
  'ad.ann.open': 'Ouvrir cet écran',
  'ad.ann.openHint':
    'Ouvre la fiche publique de ce dépôt dans un autre onglet : la liste reste en place derrière.',
  'ad.ann.empty': 'Aucune annonce déposée pour le moment.',
  'ad.ann.none': 'Aucune annonce ne correspond à ces filtres.',
  'ad.ann.publish': 'Publier',
  'ad.ann.wait': 'Remettre en attente',
  'ad.ann.refuse': 'Refuser',
  'ad.ann.busy': 'Enregistrement…',
  'ad.ann.err': 'Le changement d’état a échoué.',
  'ad.ann.kind': 'Type',
  'ad.ann.cardOrg': 'Org.',
  'ad.ann.cardCity': 'Ville',
  'ad.ann.cardBudget': 'Budget',
  'ad.ann.cardKind': 'Nature',
  'ad.ann.cardRubrique': 'Rubrique',
  'ad.ann.kindOffre': 'Offre',
  'ad.ann.kindAnnonce': 'Annonce',
  'ad.ann.cardMail': 'E-mail',
  'ad.ann.cardDate': 'Reçu',
  'ad.ann.aboSoon': 'échéance',
  'ad.ann.aboSoonHint':
    'L’abonnement de ce compte arrive à échéance : relancer avant la coupure.',
  'ad.ann.soonChip': 'Comptes en échéance proche',
  'ad.ann.soonEmpty': 'Aucun dépôt d’un compte en échéance proche.',
  'ad.ann.lateChip': 'Relecture > 7 j',
  'ad.ann.lateHint': 'Dépôts encore en relecture depuis plus de sept jours : ils attendent une réponse.',
  'ad.ann.lateEmpty': 'Aucun dépôt n’attend une réponse depuis plus de sept jours.',
  'ad.ann.lateBadge': 'relecture depuis {n} j',
  'ad.ann.sortLate': 'Ancienneté de relecture',
  'ad.ann.sortLateHint':
    'Range les annonces par ancienneté de relecture : le dépôt qui attend depuis le plus longtemps passe en tête.',
  'ad.ann.focus': 'Relectures longues de {mail}',
  'ad.ann.focusClear': 'Voir toutes les annonces',
  'ad.ann.focusRelance':
    'Relance préparée le {date} · aucune réponse reçue pour l’instant.',
  'ad.ann.relanceBtn': 'Préparer une relance',
  'ad.ann.relanceBtnHint':
    'Ouvre le message pré-rempli de ce compte — dépôts en attente et ligne récapitulative — sans quitter l’onglet.',
  'ad.ann.rowRelance': 'Relance du {date}',
  'ad.ann.rowRelanceHint':
    'Date du dernier message préparé pour ce compte : chaque dépôt dit s’il l’a précédée ou s’il est arrivé après.',
  'ad.ann.rowRelanceBefore': 'ce dépôt l’a précédée',
  'ad.ann.rowRelanceAfter': 'déposé après la relance',
  'ad.ann.focusAfter': '{n} dépôt(s) arrivé(s) après la relance',
  'ad.ann.focusAfterNone': 'aucun dépôt arrivé après la relance',
  'ad.ann.focusAfterHint':
    'Dépôts de ce compte datés après la préparation du message : la relance ne les couvre pas, ils appellent une lecture à part.',
  'ad.ann.focusDepot': 'Dépôt ouvert · {titre}',
  'ad.ann.focusAccountAll': 'Voir tous les dépôts du compte',
  'ad.ann.afterChip': 'Arrivés après la relance',
  'ad.ann.afterChipHint':
    'Ne garder que les dépôts de ce compte entrés après sa relance préparée, ceux que le message ne couvre pas.',
  'ad.ann.afterChipEmpty':
    'Aucun dépôt de ce compte n’est arrivé après la relance : le message couvre tout ce qui a été déposé.',
  'ad.ann.sortAfter': 'Dépôts après la relance',
  'ad.ann.sortAfterHint':
    'Range les dépôts en mettant en tête ceux datés après la préparation du message, ceux que la relance ne couvre pas ; l’ordre choisi reste le même dans les deux groupes.',
  'ad.ann.afterExport': 'Classeur de ces dépôts',
  'ad.ann.afterExportHint':
    'Télécharge un classeur réduit aux dépôts de ce compte arrivés après la relance, avec leur date, leur âge et leur état.',
  'ad.ann.afterExportEmptyHint':
    'Aucun dépôt du compte n’est arrivé après la relance : il n’y a rien à ouvrir.',

  'ad.msg.stamp': 'Messagerie',
  'ad.msg.sub': 'Toutes les conversations de la plateforme : le fil à gauche, les messages à droite.',
  'ad.msg.empty': 'Aucune conversation pour le moment.',
  'ad.msg.none': 'Aucun message dans ce fil.',
  'ad.msg.pick': 'Choisissez une conversation à gauche pour lire le fil.',
  'ad.msg.loading': 'Chargement du fil…',
  'ad.msg.err': 'Le fil n’a pas pu être chargé.',
  'ad.msg.reply': 'Répondre',
  'ad.msg.replyNote': 'La réponse part par e-mail : écrire dans le fil d’un membre reste réservé à ses deux participants.',
  'ad.msg.sleeping': 'en sommeil',
  'ad.msg.sleepHint': 'Conversations qui mettent un jour ou plus à répondre',
  'ad.msg.sleepOnly': 'En sommeil seulement',
  'ad.msg.sleepOnlyHint':
    'Ne garder que les conversations qui mettent un jour ou plus à répondre, le temps d’une revue ; un second clic rouvre toute la liste. Le choix est retenu d’une visite à l’autre.',
  'ad.msg.sleepOnlyOn': 'Revue limitée aux fils en sommeil',
  'ad.msg.sleepNone':
    'Aucun fil en sommeil : toutes ces conversations répondent en moins d’un jour.',
  'ad.msg.openCompte': 'Ouvrir la fiche du compte',
  'ad.msg.openCompteHint':
    'Passe du fil ouvert à la fiche du compte : ses abonnements, ses dépôts et ses priorités, sans repasser par le tableau des abonnés.',
  'ad.msg.openThread': 'Ouvrir ce fil',
  'ad.msg.openThreadHint':
    'Ouvre le fil tel que le compte le voit, dans un autre onglet : la liste de la console reste en place derrière.',
  'ad.msg.reviewed': 'revus',
  'ad.msg.reviewedOne': 'relu',
  'ad.msg.reviewHint':
    'Fils dormants déjà ouverts pendant cette visite : le repère dit où la revue s’est arrêtée. Il s’efface avec la visite.',
  'ad.msg.reviewClearHint':
    'Efface les repères de cette revue ; la liste, le filtre et le fil ouvert restent tels quels.',
  'ad.msg.reviewGaugeHint':
    'Fils dormants déjà relus sur le total des fils dormants que la liste compte : la jauge suit le filtre en sommeil et avance à chaque fil ouvert.',
  'ad.msg.restant': 'restant à relire',
  'ad.msg.restantOnly': 'Restant à relire',
  'ad.msg.restantHint':
    'Ne garder que les fils dormants qui n’ont pas encore été ouverts pendant cette visite ; un second clic rouvre toute la liste. Le jeton suit la revue en cours et ne se retient pas d’une visite à l’autre.',
  'ad.msg.restantOnlyOn': 'Revue limitée aux fils dormants pas encore relus',
  'ad.msg.restantEmpty':
    'Tous les fils dormants ont été relus pendant cette visite : il n’en reste aucun à ouvrir.',
  'ad.msg.restantAllDone': 'Tout est relu',
  'ad.msg.restantNoneHint':
    'Chaque fil dormant a été ouvert pendant cette visite ; les repères s’effacent avec elle.',
  'ad.msg.copyMail': 'Copier l’adresse',
  'ad.msg.participants': 'Participants',
  'ad.msg.count': 'messages',
  'ad.msg.sortLabel': 'Trier',
  'ad.msg.sortReview': 'Revue',
  'ad.msg.sortReviewHint':
    'Un clic met en tête les fils dormants jamais ouverts pendant cette visite, puis les fils dormants déjà relus, puis le reste ; un second clic revient à l’ordre de la liste.',
  'ad.msg.sortApres': 'Après relance',
  'ad.msg.sortApresHint':
    'Un clic met en tête les fils dont le compte a reçu un dépôt après la relance préparée, le plus de dépôts d’abord ; un second clic revient à l’ordre de la liste.',
  'ad.msg.reviewResume': 'Reprendre',
  'ad.msg.reviewResumeLast': 'Revenir au dernier fil relu',
  'ad.msg.reviewResumeHint':
    'Rouvre le dernier fil relu pendant cette visite — ou, quand rien n’a encore été relu, le premier fil dormant restant : la revue reprend là où elle s’est arrêtée.',
  'ad.msg.reviewResumeKeyHint':
    'Les touches N ou J ouvrent le fil suivant sans quitter le clavier, même si le bouton de reprise n’est pas atteint à la souris ; la touche R ramène au dernier fil relu.',
  'ad.msg.reviewResumeBackKeyHint':
    'La touche R ramène au dernier fil relu de la visite, comme un clic sur le bouton de reprise.',
  'ad.msg.reviewResumeProgress': '{done} sur {total}',
  'ad.msg.reviewResumeSince': 'Ouvert {ago}',
  'ad.msg.reviewResumeSinceHint':
    'Un clic sur cette ligne rouvre le dernier fil relu, sans passer par le bouton de reprise.',
  'ad.msg.reviewResumeAgoNow': 'à l’instant',
  'ad.msg.reviewResumeAgoMin': 'il y a {n} min',
  'ad.msg.reviewResumeAgoHour': 'il y a {n} h',
  'ad.msg.reviewResumeAgoDay': 'il y a {n} j',
  'ad.msg.closeKey': 'Refermer',
  'ad.msg.closeKeyName': 'Échap',
  'ad.msg.closeKeyHint':
    'La touche Échap referme le fil ouvert et rend la liste entière au clavier, sans chercher sa ligne.',
  'ad.msg.sortRecapHint':
    'L’ordre de lecture posé dans la liste, rappelé dans la ligne récapitulative à côté des jetons : le tri actif et le compte qui ouvre la marche.',
  'ad.msg.sortRecapBack': 'Revenir à l’ordre de la liste',
  'ad.msg.sortRecapBackHint':
    'Un clic sur le rappel éteint l’ordre posé et rend à la liste son ordre d’origine ; les jetons et le filtre restent tels quels.',
  'ad.msg.filtersHint':
    'Les jetons posés sur la liste, résumés en une ligne : combien ils sont, chaque filtre actif, le nombre de fils qu’il laisse et l’avancement de la revue.',
  'ad.msg.chipOne': '1 jeton',
  'ad.msg.chipMany': '{n} jetons',
  'ad.msg.chipCountHint':
    'Le nombre de jetons posés sur la liste — le même chiffre que la synthèse du classeur au moment de l’export.',
  'ad.msg.clearAll': 'Effacer',
  'ad.msg.listKeyHint':
    'Une fois la carte de la messagerie active — un fil ouvert au clic ou par la touche N ou J — les flèches haut et bas passent au fil précédent ou suivant dans l’ordre affiché, sans la souris.',
  'ad.msg.sortEscHint':
    'La touche Échap referme le fil ouvert et rend la liste entière au clavier. Le rappel se lit dans la barre de tri à côté des flèches, même quand aucun fil n’est ouvert, pour que le geste se découvre avant d’en avoir besoin ; il s’allume dès qu’il y a quelque chose à refermer.',
  'ad.msg.apres': 'après relance',
  'ad.msg.apresOnly': 'Après relance seulement',
  'ad.msg.apresOnlyHint':
    'Ne garder que les fils dont le compte a déposé quelque chose depuis son message de relance, ceux que le message ne couvre pas ; un second clic rouvre toute la liste. Le choix est retenu d’une visite à l’autre, et la petite gomme rend la liste entière.',
  'ad.msg.apresClearHint':
    'Efface les jetons de la liste — sommeil, restant à relire et après relance — pour repartir d’une liste entière. Le geste est retenu d’une visite à l’autre.',
  'ad.msg.apresOnlyOn': 'Revue limitée aux fils dont le compte a déposé depuis la relance',
  'ad.msg.apresEmpty':
    'Aucun fil de la liste n’a de dépôt arrivé après la relance : le message couvre tout ce qui a été déposé.',

  'ad.msg.sortAire': 'Par aire',
  'ad.msg.sortAireHint':
    'Un clic range la liste sous le nom de chaque aire du monde, dans l’ordre des aires ; les interlocuteurs sans aire connue ferment la marche. Un second clic revient à l’ordre de la liste.',
  'ad.msg.sortAireGroups': '{n} aires',
  'ad.msg.sortRecent': 'Relevé le plus récent',
  'ad.msg.sortRecentHint':
    'Un clic met en tête les fils des aires dont le relevé est parti le plus récemment de cet appareil, la plus fraîche d’abord ; les aires jamais relevées et les interlocuteurs sans aire connue ferment la marche. Un second clic revient à l’ordre de la liste.',
  'ad.msg.sortJamais': 'Aire jamais relevée d’abord',
  'ad.msg.sortJamaisHint':
    'Un clic met en tête les fils des aires qu’aucun relevé n’a encore emportées — ni d’ensemble, ni une à une —, dans l’ordre des aires du monde : les aires encore dans la boîte se retrouvent d’un coup. Les aires déjà relevées et les interlocuteurs sans aire connue ferment la marche. Un second clic revient à l’ordre de la liste.',
  'ad.msg.aireGroupNone': 'Sans aire connue',
  'ad.msg.sortAncien': 'Relevé le plus ancien d’abord',
  'ad.msg.sortAncienHint':
    'Un clic met en tête les fils des aires dont le relevé est parti depuis le plus longtemps de cet appareil, la plus ancienne d’abord : ce qui attend depuis le plus longtemps se retrouve d’un coup. Les aires jamais relevées et les interlocuteurs sans aire connue, qui n’ont aucune date, ferment la marche. Un second clic revient à l’ordre de la liste.',
  'ad.msg.sortGomme': 'Gomme la plus récente d’abord',
  'ad.msg.sortGommeHint':
    'Un clic met en tête les fils des aires que la petite gomme vient de rendre vierges, la plus récemment effacée d’abord : ce qui vient d’être rendu se retrouve d’un coup. Les aires jamais rendues et les interlocuteurs sans aire connue, qui n’ont aucune date, ferment la marche. Un second clic revient à l’ordre de la liste.',
  'ad.msg.sortGommeAncienne': 'Gomme la plus ancienne d’abord',
  'ad.msg.sortGommeAncienneHint':
    'Un clic met en tête les fils des aires que la petite gomme a rendues vierges il y a le plus longtemps, la plus anciennement effacée d’abord : ce qui attend d’être remis à neuf se retrouve d’un coup. Les aires jamais rendues et les interlocuteurs sans aire connue, qui n’ont aucune date, ferment la marche. Un second clic revient à l’ordre de la liste.',
  'ad.msg.aireGroupOne': '1 fil',
  'ad.msg.aireGroupCount': '{n} fils',
  'ad.msg.aireGroupTitleHint':
    'Appuyez pour ne garder que les fils de cette aire ; un second appui rend tous les fils.',
  'ad.msg.aireGroupCopy': 'Copier le relevé',
  'ad.msg.aireGroupCopyHint':
    'Copie le relevé des {n} fils de l’aire {region} — l’aire, ses fiches, puis chaque fil avec son interlocuteur — et date la dernière copie.',
  'ad.msg.aireGroupCopyLine': 'Relevé · {region} · {files} {unit} · {n} fils',
  'ad.msg.aireGroupCopyRow': '- {nom} · {sujet}',
  'ad.msg.aireGroupLastCopy': 'Dernière copie · {date}',
  'ad.msg.aireGroupLastCopyHint':
    'Le jour où le relevé de l’aire {region} est parti pour la dernière fois de cet appareil.',
  'ad.msg.aireOn': 'Aire retenue · {n}',
  'ad.msg.aireClear': 'Tous les fils',
  'ad.msg.aireTraySpan': '{pays} pays · {files} {unit}',
  'ad.msg.aireTraySpanHint':
    'L’étendue de l’aire {region} : ses pays et son poids dans le répertoire, posés à côté du compte des fils qu’elle laisse dans la boîte.',
  'ad.msg.threadAireHint':
    '{region} : l’aire de ce fil, lue sur le pays de son compte.',
  'ad.msg.threadAireNarrowHint':
    '{region} : appuyez pour ne garder que les fils de cette aire ; un second appui rend tous les fils.',
  'ad.msg.threadAireHoldHint':
    '{region} : appuyez pour ne garder que les fils de cette aire, un appui long emporte son relevé ; un second appui rend tous les fils.',
  'ad.msg.threadAireCopiedHint':
    'Le relevé de cette aire est copié : prêt à coller dans un message.',
  'ad.msg.aireGroupCountHint':
    '{region} · {pays} pays · {files} {unit} · {n} : l’étendue de l’aire et son poids dans le répertoire, lus avec le compte des fils.',
  'ad.msg.relevesAll': 'Copier tous les relevés',
  'ad.msg.relevesAllHint':
    'Copie les fils de chaque aire de la boîte à la suite — un titre par aire, ses fiches, puis chaque fil avec son interlocuteur —, soit {n} fils sur {a} aires, et date le départ de chaque relevé.',
  'ad.msg.relevesAllCount': 'relevés',
  'ad.msg.relevesAllLast': 'Dernier · {date}',
  'ad.msg.relevesAllCountHint':
    'Combien de fois le relevé de toutes les aires est parti depuis cet appareil, et le jour de la dernière fois ({date}) : le geste d’ensemble se compte à part des relevés d’une seule aire.',
  'ad.msg.relevesAllAires': '{n} aires',
  'ad.msg.relevesAllAiresHint':
    'Les {n} aires déjà emportées au moins une fois par un relevé d’ensemble : {list}.',
  'ad.msg.relevesAllClearHint':
    'Remet le compte des relevés d’ensemble à zéro : les aires comptées s’oublient, les dates des groupes restent.',
  'ad.msg.relevesAllClearHintCount':
    'Efface {n} relevés d’ensemble et {a} aires comptées, sans toucher aux dates des groupes : chaque en-tête d’aire garde son dernier relevé.',
  'ad.msg.airesJamaisWords': 'aires jamais relevées',
  'ad.msg.airesJamaisNone': 'Toutes les aires sont relevées',
  'ad.msg.airesJamaisHint':
    'Les aires encore dans la boîte qu’aucun relevé n’a encore emportées, ni d’ensemble ni une à une : {list}.',
  'ad.msg.airesJamaisNoneHint':
    'Chaque aire de la boîte a déjà quitté la console au moins une fois, d’un relevé d’ensemble ou du relevé d’une aire.',
  'ad.msg.airesJamaisOpenHint':
    '{n} aires jamais relevées : appuyez pour ne garder que les fils de {region}, la première d’entre elles ; appuyez encore pour passer à la suivante. Encore à relever : {list}.',
  'ad.msg.relevesCheminsHint':
    'Les relevés d’une seule aire, séparés selon leur chemin : {h} partis de l’en-tête d’un groupe, {l} emportés d’un appui long sur la pastille d’un fil. Le relevé de toutes les aires garde son propre compte.',
  'ad.msg.relevesCheminsEntete': '{n} en-têtes',
  'ad.msg.relevesCheminsLigne': '{n} lignes',
  'ad.msg.relevesCheminsClearHint':
    'Efface {h} relevés partis d’un en-tête de groupe et {l} emportés d’un appui long sur une ligne, sans toucher aux dates des groupes : chaque en-tête d’aire garde son dernier relevé. Le relevé de toutes les aires garde le sien.',
  'ad.msg.threadAireCheminEntete':
    'Relevé déjà parti depuis un en-tête de groupe · {date}.',
  'ad.msg.threadAireCheminLigne':
    'Relevé déjà parti depuis une ligne, à l’appui long · {date}.',
  'ad.msg.threadAireCheminBoth':
    'Relevé déjà parti depuis un en-tête ({entete}) et depuis une ligne ({ligne}).',
  'ad.msg.threadAireCheminEnsemble':
    'Relevé déjà parti d’un geste d’ensemble · {date}.',
  'ad.msg.threadAireCheminNone': 'Relevé encore jamais parti.',
  'ad.msg.relevesCheminsCleared': '{n} relevés effacés',
  'ad.msg.relevesCheminsClearedHint':
    'Le nombre de gestes que la gomme des deux chemins vient d’effacer — ceux partis d’un en-tête de groupe et ceux emportés d’une ligne —, les dates des groupes restant intactes.',
  'ad.msg.relevesAllCleared': '{n} relevés d’ensemble effacés · {a} aires oubliées',
  'ad.msg.relevesAllClearedHint':
    'Le nombre de gestes et d’aires que la gomme des relevés d’ensemble vient d’effacer : le compte de l’en-tête retombe à zéro, les dates des groupes et les deux chemins restent tels quels.',
  'ad.msg.recentJamaisLine':
    '{n} aires jamais relevées ferment la liste — {list}.',
  'ad.msg.recentJamaisLineNone':
    'Toutes les aires sont déjà relevées : plus aucune ne ferme la liste.',
  'ad.msg.recentJamaisLineHint':
    'L’ordre « relevé le plus récent » met en tête les aires dont le relevé vient de quitter la boîte : celles qu’aucun relevé n’a encore emportées ferment la marche, et se comptent ici.',
  'ad.msg.jamaisLine':
    '{f} fils ouvrent la liste · {a} aires jamais relevées — {list}.',
  'ad.msg.jamaisLineNone':
    'Toutes les aires sont relevées : plus aucun fil ne se tient en tête.',
  'ad.msg.jamaisLineHint':
    'L’ordre « aire jamais relevée d’abord » met en tête les fils des aires qu’aucun relevé n’a encore emportées : leur nombre se lit ici, à côté du compte des aires, puis les aires elles-mêmes dans l’ordre du monde.',
  'ad.msg.airesTightOn': 'Aires du classeur · {n}',
  'ad.msg.airesTightTitle': 'Aires jamais relevées · {n}',
  'ad.msg.airesTightClear': 'Toutes les aires',
  'ad.msg.airesTightGomme': 'Gommer',
  'ad.msg.airesTightGommeHint':
    'Rend toutes les aires du classeur d’un geste : la boîte montre tous ses fils, et le choix retenu par l’appareil reste intact — la visite suivante retrouve les mêmes aires.',
  'ad.msg.airesTightGommeHintCount':
    'Rend les {n} aire(s) du classeur d’un geste — leurs {fils} fil(s) reviennent dans la boîte —, sans toucher au choix retenu par l’appareil : la visite suivante retrouve les mêmes aires.',
  'ad.msg.airesTightHint':
    'La boîte est resserrée sur les aires nommées par le classeur des abonnés — {n} aire(s), dont {jamais} encore jamais relevée(s), et {fils} fil(s) qu’elles laissent dans la boîte, dans l’ordre du monde : {list}. La croix rend tous les fils, sans toucher au choix retenu par l’appareil.',
  'ad.msg.airesTightRelevesGommeHint':
    'Remet à zéro les relevés de ces {n} aire(s) seules — {relevees} d’entre elles portent encore une date, {jamais} n’en ont jamais eu —, sans toucher aux autres aires de l’appareil, ni au resserrement, ni au compte des relevés d’ensemble : la pastille les dit à nouveau jamais relevées, et le classeur les compte comme telles. Les aires rendues vierges, une à une : {list}.',
  'ad.msg.airesTightRelevesGommeHintEmpty':
    'Aucune de ces {n} aire(s) ne porte encore de date de relevé : la gomme n’aurait rien à effacer. Le resserrement et les autres aires de l’appareil restent tels quels.',
  'ad.msg.airesTightRelevesCleared': '{n} aire(s) rendue(s) vierge(s)',
  'ad.msg.airesTightRelevesClearedHint':
    'Le nombre d’aires du classeur dont la date de relevé vient d’être effacée : elles quittent aussi le carnet des aires emportées d’ensemble, les autres aires gardent la leur, et le compte des gestes d’ensemble ne bouge pas.',
  'ad.msg.airesJourWords': 'aires relevées aujourd’hui',
  'ad.msg.airesJourFils': '{n} fil(s) emporté(s)',
  'ad.msg.airesJourAireDetail': '{region} : {fils}',
  'ad.msg.airesJourNoThread': 'aucun fil dans la boîte',
  'ad.msg.airesJourPillHint':
    'Les {n} aires de la boîte dont le relevé de fils porte la date du jour, avec les {fils} fil(s) qu’elles ont emportés, un à un : {detail}. La petite gomme efface la date de toutes les aires de la boîte, quel que soit leur jour.',
  'ad.msg.airesJourGommeHint':
    'Efface la date de relevé des {n} aires de la boîte, quel que soit leur jour — {relevees} d’entre elles en portent encore une —, sans toucher aux aires absentes de la boîte, ni au resserrement, ni au compte des gestes d’ensemble : la synthèse du classeur les compte alors comme jamais relevées.',
  'ad.msg.airesJourCleared': '{n} aire(s) rendue(s) sans date sur {a}',
  'ad.msg.airesJourClearedHint':
    'Le nombre d’aires de la boîte dont la date de relevé vient d’être effacée, sur le total des aires qu’elle porte : elles quittent aussi le carnet des aires emportées d’ensemble, et la synthèse du classeur les compte comme jamais relevées.',
  'ad.msg.gommesTally': '{n} gomme(s) · dernier geste {date}',
  'ad.msg.gommesWords': 'gommes de relevés',
  'ad.msg.gommesLast': 'dernier geste {date}',
  'ad.msg.gommesTallyHint':
    'Depuis cet appareil, la petite gomme des relevés a rendu des aires vierges {n} fois et effacé la date de {aires} aire(s) ; le dernier geste date du {date}. Le compte se tient à côté de la pastille des aires relevées aujourd’hui, et reste visible quand la pastille n’a plus rien à annoncer.',
  'ad.msg.gommesSpan':
    'Du premier geste retenu, le {premier}, au dernier, le {dernier}, {n} jour(s) séparent les gommes de relevés : l’effacement se lit dans le temps, pas seulement à sa dernière date.',
  'ad.msg.gommesFils': '{n} fil(s) de la dernière gomme',
  'ad.msg.gommesFilsHint':
    'Les fils que la boîte portait dans les aires rendues vierges par la dernière gomme — pastille des aires du jour ou ligne des fils — au moment du clic : le geste dit son poids, pas seulement son nombre.',
  'ad.msg.gommesFilsEncore':
    'Sur ces aires, {n} rendue(s) par la gomme sont encore dans la boîte — {list} — : le geste se relit sur ce qui reste à voir.',
  'ad.msg.gommesFilsParties':
    'Sur ces aires, {n} rendue(s) par la gomme ne sont plus dans la boîte — {list} — : le geste se relit aussi sur ce qui a quitté la liste.',
  'ad.msg.gommesEncore': '{n} encore',
  'ad.msg.gommesParties': '{n} partie(s)',
  'ad.msg.gommesSplitBouts':
    'dernière · {recent} {dateRecent} — plus ancienne partie · {vieux} {dateVieux}',
  'ad.msg.gommesSplitBoutsNone':
    'aucune des aires rendues n’est encore partie',
  'ad.msg.gommesSplitBoutsHint':
    'Les deux bouts du partage, posés sur la pastille : l’aire effacée en dernier, et celle qui est partie le plus anciennement — {vieux}, le {dateVieux}. Le partage se lit d’un bout à l’autre sans survol.',
  'ad.msg.gommesSplitBoutsNoneHint':
    'Les aires rendues par la dernière gomme se tiennent toutes encore dans la boîte : aucune n’est partie, il n’y a pas de plus ancienne à nommer.',
  'ad.msg.gommesNoneAreas': 'aucune',
  'ad.msg.gommesSplitHint':
    'Le partage des aires rendues par la dernière gomme, posé sur la pastille pour se lire sans survol : {encore} se tiennent encore dans la boîte — {listeEncore} — et {parties} l’ont quittée — {listeParties}. Les deux chiffres sont lus sur la boîte telle qu’elle se présente, donc ils ne peuvent pas se contredire.',
  'ad.msg.gommeHorsCopy': 'Copier ces aires',
  'ad.msg.gommeHorsCopyHint':
    'Copie la liste des {n} aire(s) rendues par la gomme qui ne sont plus dans la boîte, la plus récemment effacée en tête, chacune avec le jour de son geste — prête à coller dans un message.',
  'ad.msg.gommeHorsCopyHead':
    'Aires rendues par la gomme, sorties de la boîte ({n} sur {total})',
  'ad.msg.recapGommeTete': 'effacée en dernier · {region} · {date}',
  'ad.msg.recapGommeTeteHint':
    'La jauge du tri inverse nomme l’aire que la petite gomme a rendue vierge en dernier, avec le jour de son geste : le geste le plus frais se lit au-dessus de la ligne des aires parties, sans survol.',
  'ad.msg.gommeHorsLine':
    '{n} aire(s) rendues par la gomme ne sont plus dans la boîte, la plus récemment effacée en tête — {list}.',
  'ad.msg.gommeHorsLineNone':
    'Toutes les aires rendues par la gomme se tiennent encore dans la boîte : aucune n’est partie.',
  'ad.msg.gommeHorsLineHint':
    'Sous le tri inverse, les aires que la petite gomme a rendues vierges et que la boîte ne porte plus, la plus récemment effacée en tête, chacune avec le jour de son dernier geste : le geste se relit aussi sur ce qui a quitté la liste, à côté de ce qui y reste.',
  'ad.msg.recapGomme': 'Tri inverse · gomme la plus récente d’abord',
  'ad.msg.recapGommeHint':
    'Posé sur la ligne récapitulative, ce tri range les fils des aires rendues par la petite gomme du plus frais au plus ancien. Un second clic retourne le sens — de la plus anciennement effacée à la plus récemment effacée — sans repasser par la barre de tri. Les aires jamais rendues et les interlocuteurs sans aire connue, qui n’ont aucune date, ferment la marche.',
  'ad.msg.recapGommeSensRecent': 'du plus frais au plus ancien',
  'ad.msg.recapGommeSensAncien': 'de la plus ancienne à la plus récente',
  'ad.msg.recapGommeSpan':
    'Dans ces aires, {n} jour(s) séparent l’aire effacée en dernier — {recent}, le {dateRecent} — de la plus anciennement effacée — {vieux}, le {dateVieux} : le geste se lit d’un bout à l’autre.',
  'ad.msg.gommeHorsLineAncienne':
    '{n} aire(s) rendues par la gomme ne sont plus dans la boîte, la plus anciennement effacée en tête — {list}.',
  'ad.msg.gommeHorsSort': 'Plus ancien d’abord',
  'ad.msg.gommeHorsSortMonths':
    'Les {n} départs, par mois d’effacement (le plus récent en tête) : {list} — les vagues du geste se lisent d’un coup.',
  'ad.msg.gommeHorsSortHint':
    'Un clic retourne la ligne des aires parties : les départs les plus anciens passent en tête, pour les relire dans l’ordre où ils sont arrivés. Un second clic revient à la plus récemment effacée d’abord.',
  'ad.msg.gommeHorsCopyHintAncienne':
    'Copie la liste des {n} aire(s) rendues par la gomme qui ne sont plus dans la boîte, la plus anciennement effacée en tête, chacune avec le jour de son geste — prête à coller dans un message.',
  'ad.msg.gommeLine': '{n} aire(s) rendues par la gomme — {list}.',
  'ad.msg.gommeLineAire': '{region} · {date}',
  'ad.msg.gommeLineHint':
    'Sous l’ordre « gomme la plus récente d’abord », les aires que la petite gomme a rendues vierges, la plus récemment effacée en tête, chacune avec le jour de son geste : ce qui vient d’être rendu se relit sans ouvrir la boîte.',
  'ad.msg.gommeAncienneLine':
    '{n} aire(s) rendues par la gomme, la plus anciennement effacée en tête — {list}.',
  'ad.msg.gommeAncienneLineHint':
    'Sous l’ordre « gomme la plus ancienne d’abord », les aires que la petite gomme a rendues vierges, la plus anciennement effacée en tête, chacune avec le jour de son geste : ce qui attend d’être remis à neuf se relit sans ouvrir la boîte.',
  'ad.msg.sortAncienSpan':
    'Dans la boîte, {n} jour(s) séparent le plus vieux relevé ({vieux}) du plus récent ({recent}).',
  'ad.msg.ancienJaugeLabel': 'Écart de relevé dans la boîte',
  'ad.msg.ancienJaugeSpan': '{n} jour(s) · du {vieux} au {recent}',
  'ad.msg.ancienJaugeHint':
    'La jauge mesure l’écart entre le relevé le plus vieux et le plus récent des aires de la boîte — la même mesure que le survol du tri, lue sans survol. Un seul relevé ne fait pas d’écart, et une boîte sans date n’affiche pas de jauge.',
  'ad.msg.ancienJaugeBouts':
    'Aux deux bouts de cet écart : la plus ancienne est {aireVieux}, relevée le {vieux} ; la plus récente est {aireRecent}, relevée le {recent}.',
  'ad.msg.airesTightAireJour': '{region} · dernier relevé le {date}',
  'ad.msg.airesTightAireJamais': '{region} · jamais relevée',
  'ad.msg.airesTightAireJourFils':
    '{region} · {n} fil(s) dans la boîte · dernier relevé le {date}',
  'ad.msg.airesTightAireJamaisFils':
    '{region} · {n} fil(s) dans la boîte · jamais relevée',
  'ad.msg.airesTightAireJourHint':
    'Chaque aire nommée dans la pastille garde, au survol, le jour de son dernier relevé de fils lu sur cet appareil — ou dit qu’elle n’a encore jamais été relevée.',
  'ad.msg.jamaisLineClearHint':
    'Rend la liste entière d’un geste : la gomme efface les jetons et le resserrement sur une aire, sans toucher à l’ordre de lecture posé.',
  'ad.msg.jamaisLineClearHintCount':
    'Rend la liste entière d’un geste : {chips} jetons et {aires} aires resserrées s’effacent, sans toucher à l’ordre de lecture posé.',
  'ad.msg.vieillesAires': 'relevées il y a plus de 7 j',
  'ad.msg.vieillesAiresOnly': 'Aires relevées il y a plus de 7 j',
  'ad.msg.vieillesAiresOn': 'Aires relevées il y a plus de sept jours',
  'ad.msg.vieillesAiresNone': 'aucune pour l’instant',
  'ad.msg.vieillesAiresEmpty':
    'Aucune aire de la boîte n’a été relevée il y a plus de sept jours : les aires jamais relevées ont leur propre ordre.',
  'ad.msg.vieillesAiresHint':
    '{n} aires dont le dernier relevé de fils date de plus de sept jours — {list} —, et {fils} fils que le jeton laisse dans la liste. Un clic ne garde que leurs fils ; un second clic rouvre toute la liste. Les aires jamais relevées restent dehors.',
  'ad.msg.vieillesAiresFils': '{n} fils',
  'ad.msg.aireHoldNote':
    'Un appui long sur la pastille d’aire d’un fil emporte son relevé ; un appui court ne garde que les fils de cette aire.',
  'ad.msg.aireHoldNoteHint':
    'Le geste se découvre sans survol : l’appui long copie le relevé de l’aire — ses fiches, puis chaque fil avec son interlocuteur —, tandis que l’appui court resserre la boîte sur cette aire.',

  'ad.msg.revueCompte': 'Revue du compte',
  'ad.msg.revueCompteOn': 'Revue limitée au compte {n}',
  'ad.msg.revueCompteHint':
    'La liste est réduite aux fils en sommeil de ce compte, ouvert depuis sa fiche : la revue commence là où la fiche l’a nommée. La croix rend la liste entière, sans effacer les jetons retenus.',
  'ad.msg.revueCompteEmpty':
    'Ce compte n’a aucun fil en sommeil : toutes ses conversations répondent en moins d’un jour.',
  'ad.msg.revueCompteClear': 'Quitter la revue de ce compte',
  'ad.msg.visitLength': 'Durée de la visite',
  'ad.msg.visitLengthHint':
    'L’écart entre la première et la dernière ouverture de la visite en cours — la même mesure que le bas du journal de la revue, lue sur les repères de session.',

  'ad.journal.stamp': 'Journal de la revue',
  'ad.journal.sub':
    'La visite en cours, fil par fil : l’heure de chaque ouverture, les minutes écoulées depuis la première, le délai de réponse et le dernier message — sans télécharger de fichier.',
  'ad.journal.clear': 'Effacer les repères',
  'ad.journal.clearHint':
    'Efface les repères de cette revue : la liste repart d’une visite vierge, comme après la petite gomme de la messagerie.',
  'ad.journal.openHint': 'Ouvrir ce fil dans la messagerie, sans chercher sa ligne',
  'ad.journal.empty':
    'Aucun fil dormant n’a encore été relu pendant cette visite : ouvrez un fil depuis la messagerie, la ligne apparaîtra ici.',
  'ad.journal.note':
    'Ce journal se lit sur la même mémoire de session que la messagerie : une ligne par fil dormant ouvert pendant la visite, dans l’ordre des ouvertures. Il reste vide tant que rien n’a été relu, et s’efface avec la visite. La durée de la visite parle de la revue, pas du temps de réponse des fils.',

  'ad.p.stamp': 'Paramètres du site',
  'ad.p.sub': 'Les réglages d’application tels qu’ils sont enregistrés, et l’accès à cette console.',
  'ad.p.essai': 'Jours d’essai',
  'ad.p.appel': 'Rappel téléphonique (heures)',
  'ad.p.updatedBy': 'Modifié par',
  'ad.p.updatedAt': 'Modifié le',
  'ad.p.none': 'Aucun réglage enregistré : les valeurs par défaut du site s’appliquent.',
  'ad.p.note': 'Ces réglages s’écrivent depuis la console Supabase. Cette page les lit, elle ne les modifie pas.',
  'ad.p.access': 'Adresse autorisée',
  'ad.p.database': 'Base de données',
  'ad.p.databaseVal': 'Supabase — lecture via une fonction serveur',
  'ad.p.roles.stamp': 'Gestion des rôles',
  'ad.p.roles.sub': 'Qui peut ouvrir cette console : les comptes promus administrateurs, et les comptes ordinaires.',
  'ad.p.roles.search': 'Rechercher un compte…',
  'ad.p.roles.role': 'Rôle',
  'ad.p.roles.action': 'Accès à la console',
  'ad.p.roles.admin': 'administrateur',
  'ad.p.roles.other': 'compte ordinaire',
  'ad.p.roles.promote': 'Promouvoir admin',
  'ad.p.roles.demote': 'Retirer l’admin',
  'ad.p.roles.promoteHint':
    'Ouvre la console à ce compte : il pourra y entrer avec sa propre adresse, sans qu’on recopie celle-ci dans les secrets du serveur.',
  'ad.p.roles.demoteHint':
    'Retire l’accès à la console à ce compte : il redevient un compte ordinaire, ses données restent intactes.',
  'ad.p.roles.selfHint':
    'Ce compte est celui qui tient la console : son rôle admin ne peut pas être retiré d’ici, sinon la console se fermerait à lui.',
  'ad.p.roles.me': 'vous',
  'ad.p.roles.err': 'Le rôle n’a pas pu être enregistré.',
  'ad.p.roles.doneAdmin': 'Compte promu administrateur : la console lui est désormais ouverte.',
  'ad.p.roles.doneBack': 'Le compte est redevenu ordinaire : la console lui est fermée.',
  'ad.p.roles.count': '{n} administrateur(s)',
  'ad.p.roles.countHint':
    'Les comptes qui peuvent ouvrir la console : les rôles administrateurs et le compte portant l’adresse d’administration.',
  'ad.p.roles.promoted': '{n} promu(s)',
  'ad.p.roles.promotedHint':
    'Les comptes passés administrateurs depuis cette console, sur les mêmes lignes que la table.',
  'ad.p.roles.lastPromotion': 'Dernière promotion',
  'ad.p.roles.promotedOn': 'promu le',
  'ad.p.roles.promotedNoDate': 'date de promotion non enregistrée',
  'ad.p.roles.empty': 'Aucun compte ne correspond à cette recherche.',
  'ad.p.roles.none': 'Aucun compte enregistré : aucun rôle à gérer pour le moment.',
  'ad.p.roles.note':
    'Le rôle est écrit sur le compte, en base : la console et la fonction serveur le lisent à chaque ouverture. Un compte promu entre avec sa propre adresse — inutile de la recopier dans les secrets de la fonction.',
  'ad.p.mail.stamp': 'Expéditeur des e-mails',
  'ad.p.mail.verify': 'Vérifier chez Brevo',
  'ad.p.mail.verifying': 'Vérification…',
  'ad.p.mail.verified': 'Domaine vérifié',
  'ad.p.mail.pending': 'Domaine en attente',
  'ad.p.mail.unknownDomain': 'Domaine introuvable',
  'ad.p.mail.noKey': 'Clé absente : rien à interroger',
  'ad.p.mail.noDomainSet': 'Aucun domaine dans les secrets',
  'ad.p.mail.verifyErr': 'Brevo n’a pas répondu : l’état du domaine reste inconnu.',
  'ad.p.mail.keyScope':
    'Clé d’envoi seule : Brevo ne laisse pas lire ses domaines. L’état se lit chez Brevo.',
  'ad.p.mail.verifyAt': 'vérifié le {date}',
  'ad.p.mail.verifyHint':
    'Demande à Brevo l’état réel du domaine d’envoi, au lieu de supposer qu’un domaine écrit dans les secrets est un domaine vérifié. Tant qu’il n’est pas vérifié, les accusés de réception ne partent pas.',
  'ad.p.mail.noDomainYet': 'Pas encore vérifié',
  'ad.p.acc.stamp': 'Accusés de réception des candidatures',
  'ad.p.acc.sub': 'Ce que les candidats ont réellement reçu au dépôt, et les accusés qui ne sont pas partis.',
  'ad.p.acc.sent': 'Accusés envoyés · {n}',
  'ad.p.acc.waiting': 'En attente · {n}',
  'ad.p.acc.today': 'Partis aujourd’hui · {n}',
  'ad.p.acc.sentHint':
    'Candidatures dont l’accusé a réellement quitté PaperAtlas, datées par la fonction d’envoi elle-même.',
  'ad.p.acc.waitingHint':
    'Candidatures déposées pour lesquelles aucun accusé n’est parti : le courriel a échoué, ou le domaine d’envoi n’est pas encore vérifié.',
  'ad.p.acc.todayHint': 'Accusés partis depuis minuit, lus sur la même date que les deux autres compteurs.',
  'ad.p.acc.refresh': 'Relire',
  'ad.p.acc.listTitle': 'Les accusés qui ne sont pas partis',
  'ad.p.acc.listHint':
    'le renvoi repart par la même fonction que le dépôt : la date n’est écrite que si le courriel part vraiment.',
  'ad.p.acc.candidat': 'Candidat',
  'ad.p.acc.offre': 'Offre',
  'ad.p.acc.waitSince': 'Déposée le',
  'ad.p.acc.days': '{n} j d’attente',
  'ad.p.acc.send': 'Renvoyer l’accusé',
  'ad.p.acc.sending': 'Envoi…',
  'ad.p.acc.ok': 'Accusé renvoyé à {to} · {date}',
  'ad.p.acc.already': 'Cet accusé était déjà parti le {date} : rien n’a été renvoyé.',
  'ad.p.acc.err': 'L’accusé n’est pas parti.',
  'ad.p.acc.noMail': 'Aucune adresse pour ce candidat : l’accusé ne peut pas partir.',
  'ad.p.acc.fromCompte': 'adresse lue sur le compte',
  'ad.p.acc.empty': 'Aucun accusé en attente : chaque candidature déposée a reçu le sien.',
  'ad.p.acc.none': 'Aucune candidature enregistrée pour le moment.',
  'ad.p.acc.error': 'Les accusés ne se lisent pas pour le moment.',
  'ad.p.acc.note':
    'Le compteur lit la même date que la fiche du candidat, écrite par la fonction d’envoi — jamais la date d’ouverture du dossier. Un renvoi ne réécrit pas une date déjà posée.',
  'ad.p.acc.reminder':
    'Rappel : {n} accusé(s) attendent depuis plus de 24 heures — le plus ancien déposé le {oldest}. La file ci-dessous les traite du plus ancien au plus récent.',
  'ad.p.acc.late': 'plus de 24 h',
  'ad.p.acc.gateReady': 'Accusés : envoi possible',
  'ad.p.acc.gateBlocked': 'Accusés : envoi bloqué',
  'ad.p.acc.gateHint':
    'Lit chez Brevo si le domaine d’envoi est vérifié — le seul fait qui autorise un accusé à partir. Un clic relance la vérification sans quitter la carte.',
  'ad.p.acc.gateNote':
    'Tant que l’expéditeur ou le domaine vérifié chez Brevo manque, aucun accusé ne peut réellement partir : la date reste vide et le motif s’affiche, sans faire semblant. Les secrets se posent dans Supabase → Edge Functions → Secrets, le domaine se vérifie chez Brevo.',
  'ad.p.acc.reminderShort': 'Dont plus de 24 h d’attente',
  'ad.p.acc.histStamp': 'Journal des renvois',
  'ad.p.acc.histSub':
    'Qui a envoyé, à qui, quand — et si le courriel est vraiment parti.',
  'ad.p.acc.histCount': '{n} renvoi(s)',
  'ad.p.acc.histCsv': 'Exporter le journal',
  'ad.p.acc.histCsvHint':
    'Télécharge le journal en CSV : une ligne par geste, avec sa date, son auteur, son destinataire et son état.',
  'ad.p.acc.histCsvCount': 'Lignes du journal',
  'ad.p.acc.histEmpty':
    'Aucun renvoi pour le moment : le journal s’écrit au premier accusé.',
  'ad.p.acc.histDate': 'Date',
  'ad.p.acc.histAuthor': 'Auteur',
  'ad.p.acc.histTo': 'Destinataire',
  'ad.p.acc.histTrigger': 'Déclencheur',
  'ad.p.acc.histDepot': 'au dépôt',
  'ad.p.acc.histRenvoi': 'renvoi manuel',
  'ad.p.acc.histState': 'État',
  'ad.p.acc.histSent': 'parti',
  'ad.p.acc.histFailed': 'non parti',
  'ad.p.acc.why.no-recipient': 'aucune adresse',
  'ad.p.acc.why.email-not-configured': 'envoi non configuré',
  'ad.p.acc.why.email-error': 'refus du service d’envoi',
  'ad.p.acc.bulk': 'Renvoyer les retards · {n}',
  'ad.p.acc.bulkHint':
    'Renvoyer d’un seul geste tous les accusés qui attendent depuis plus de 24 heures, du plus ancien au plus récent : chaque envoi passe par la même fonction que le dépôt, et la date n’est écrite que si le courriel part vraiment.',
  'ad.p.acc.bulkBusy': 'Envoi {n}…',
  'ad.p.acc.bulkDone':
    '{sent} accusé(s) renvoyé(s) · {failed} en échec — le journal des renvois garde chaque geste, réussi ou non.',
  'ad.p.acc.histFailOnly': 'Seuls les échecs · {n}',
  'ad.p.acc.histFailHint':
    'Ne garder que les envois qui ne sont pas partis, pour traiter les échecs d’un coup ; un second clic rend le journal entier.',
  'ad.p.acc.histFailEmpty':
    'Aucun échec dans le journal : chaque geste d’envoi a réellement abouti.',
  'ad.p.acc.histAll': 'Tout le journal',
  'ad.p.acc.motifTitle': 'Échecs par motif',
  'ad.p.acc.motifHint':
    'Un clic ne garde que les envois qui ont échoué pour ce motif ; un second clic rend le journal entier. Le chiffre se lit sur les mêmes lignes que le journal.',
  'ad.p.acc.motifMost': 'Ce qui bloque le plus : {label} · {n}',
  'ad.p.acc.motifMostHint':
    'Le motif qui revient le plus souvent parmi les envois qui ne sont pas partis : il dit d’un coup d’œil ce qui retient le plus d’accusés.',
  'ad.p.acc.motifActive': 'Filtré sur « {label} »',
  'ad.p.acc.motifClear': 'Tous les motifs',
  'ad.p.acc.motifEmpty':
    'Aucun motif à compter : chaque geste d’envoi du journal a abouti.',
  'ad.p.acc.motifOther': 'motif non précisé',
  'ad.p.acc.why.other': 'motif non précisé',
  'ad.accuse.openVerify':
    'ouvrir la vérification du domaine d’envoi chez Brevo',
  'ad.xls.horsTypeSheet': 'Rubriques hors type',
  'ad.xls.horsTypeEmpty':
    'Aucun dépôt hors type au moment de l’export : chaque rubrique appartient à sa famille.',
  'ad.xls.horsTypeCount': 'Dépôts hors type',
  'ad.xls.horsTypeExpected': 'Rubriques attendues',
  'ad.xls.horsTypeRecorded': 'Rubrique enregistrée',
  'ad.xls.horsTypeNote':
    'L’onglet « Rubriques hors type » reprend, au moment du clic, les dépôts dont la rubrique appartient à l’autre famille — une catégorie d’annonce sur une offre d’emploi, ou l’inverse. Chaque ligne donne la rubrique enregistrée et les quatre rubriques attendues pour le type du dépôt : la liste à corriger se joint ainsi à un point d’étape, sans avoir à rouvrir l’onglet « Annonces ». Le bas de l’onglet compte les dépôts et rappelle les deux familles.',
  'ad.xls.attenteSheet': 'Accusés en attente',
  'ad.xls.attenteEmpty':
    'Aucun accusé en attente au moment de l’export : chaque candidature déposée a reçu le sien.',
  'ad.xls.attenteCount': 'Accusés en attente',
  'ad.xls.attenteLate': 'Plus de 24 h',
  'ad.xls.attenteNote':
    'L’onglet « Accusés en attente » reprend la file du renvoi telle qu’elle se tient au moment du clic : une ligne par candidature dont l’accusé n’est pas encore parti, la plus ancienne en tête, avec son attente en jours et le repère « plus de 24 h » sur celles qui dépassent la journée. La file se joint ainsi à un point d’étape, sans avoir à rouvrir la console.',
  'ad.xls.renvoisSheet': 'Journal des renvois',
  'ad.xls.renvoisEmpty': 'Aucun renvoi dans le journal au moment de l’export.',
  'ad.xls.renvoisNote':
    'L’onglet « Journal des renvois » reprend le journal de la console : une ligne par geste d’envoi, avec sa date, son auteur, son destinataire, la candidature et son état. Un envoi qui n’est pas parti garde sa ligne et son motif — le fichier ne compte pas seulement les succès.',
  'ad.accuse.chip': 'Accusés',
  'ad.accuse.waiting': '{n} accusé(s) en attente',
  'ad.accuse.overdue':
    '{n} en attente depuis plus de 24 h · le plus ancien déposé le {date}',
  'ad.accuse.noLate': 'aucun retard de plus de 24 h',
  'ad.accuse.open': 'ouvrir la carte des accusés de réception',
  'ad.accuse.loading': 'Accusés : lecture en cours…',
  'ad.accuse.gateBlocked': 'Accusés : envoi bloqué — rien ne peut partir',
  'ad.accuse.gateReady': 'accusés : envoi possible',
  'ad.ann.rubriqueChip': 'Rubrique hors type',
  'ad.ann.rubriqueChipHint':
    'Ne garder que les dépôts dont la rubrique appartient à l’autre famille — une catégorie d’annonce sur une offre, ou l’inverse. La correction s’ouvre alors sous chaque ligne ; un second clic rend la liste entière.',
  'ad.ann.rubriqueBadge': 'Rubrique hors type',
  'ad.ann.rubriqueBadgeOffre':
    'Cette offre d’emploi porte une rubrique de la famille des annonces.',
  'ad.ann.rubriqueBadgeAnnonce':
    'Cette annonce porte une rubrique de la famille des offres d’emploi.',
  'ad.ann.rubriqueFix': 'Corriger la rubrique',
  'ad.ann.rubriqueFixHint':
    'Choisir une rubrique de la famille du dépôt : elle est écrite telle quelle, sans toucher au titre, au texte ni à l’état de relecture.',
  'ad.ann.rubriqueEmpty':
    'Aucun dépôt hors type : chaque rubrique appartient à sa famille.',
  'ad.ann.rubriqueErr': 'La rubrique n’a pas pu être corrigée.',
  'ad.p.acc.bulkFail': 'Renvoyer les échecs · {n}',
  'ad.p.acc.bulkFailHint':
    'Rejouer d’un seul geste les seuls envois qui ne sont pas partis, sans reprendre la file des retards : chaque tentative passe par la même fonction que le dépôt, et la date n’est écrite que si le courriel part vraiment.',
  'ad.p.acc.bulkFailDone':
    '{sent} réessai(s) parti(s) · {failed} encore en échec — le journal des renvois garde chaque tentative.',
  'ad.p.mail.sub': 'Depuis quelle adresse PaperAtlas écrit, et la preuve qu’un message arrive vraiment.',
  'ad.p.mail.state': 'État',
  'ad.p.mail.ready': 'Prêt à envoyer',
  'ad.p.mail.notReady': 'Domaine à configurer',
  'ad.p.mail.from': 'Adresse d’envoi',
  'ad.p.mail.domain': 'Domaine vérifié',
  'ad.p.mail.reply': 'Adresse de réponse',
  'ad.p.mail.key': 'Clé d’envoi',
  'ad.p.mail.keySet': 'Enregistrée',
  'ad.p.mail.keyMissing': 'Absente',
  'ad.p.mail.check': 'Vérifier',
  'ad.p.mail.checkAt': 'Dernière lecture de l’état : {date}',
  'ad.p.mail.checkNever':
    'Aucune lecture de l’état depuis cet appareil pour l’instant : les faits affichés n’ont pas encore été relus ici.',
  'ad.p.mail.loading': 'Lecture de l’expéditeur…',
  'ad.p.mail.test': 'Envoyer un test',
  'ad.p.mail.testing': 'Envoi…',
  'ad.p.mail.testHint': 'Recevoir un message de vérification à votre adresse.',
  'ad.p.mail.testBlocked': 'La clé ou le domaine d’envoi n’est pas encore configuré.',
  'ad.p.mail.testSent': 'Message de test envoyé à {to}. Vérifiez la boîte de réception.',
  'ad.p.mail.testFail': 'Le message de test n’est pas parti.',
  'ad.p.mail.error': 'L’état de l’expéditeur ne se lit pas pour le moment.',
  'ad.p.mail.note': 'La clé BREVO_API_KEY et le domaine MAIL_FROM_DOMAIN s’ajoutent dans Supabase, rubrique Edge Functions → Secrets ; le domaine doit aussi être vérifié chez Brevo. Une fois les deux en place, toutes les confirmations partent sous le nom PaperAtlas.',
  'ad.p.mail.guideTitle': 'Poser la clé et le domaine, pas à pas',
  'ad.p.mail.guideSub': 'Quatre étapes, dans cet ordre. La carte ne devine rien : elle lit l’état réel des secrets, et le message reçu reste la seule preuve.',
  'ad.p.mail.guideCount': '{n} / {total} étapes en place',
  'ad.p.mail.gFait': 'En place',
  'ad.p.mail.gAfaire': 'À faire',
  'ad.p.mail.g1Title': 'Créer la clé d’envoi chez Brevo',
  'ad.p.mail.g1Text': 'Dans Brevo, rubrique SMTP & API → API Keys, créez une clé qui a le droit d’envoyer. Copiez-la aussitôt : elle ne s’affiche qu’une seule fois.',
  'ad.p.mail.g1Link': 'Ouvrir les clés Brevo',
  'ad.p.mail.g2Title': 'Poser la clé dans Supabase',
  'ad.p.mail.g2Text': 'Dans Supabase, Edge Functions → Secrets, ajoutez BREVO_API_KEY avec la clé copiée. Ce sont les fonctions serveur qui la lisent, jamais le navigateur.',
  'ad.p.mail.g2Link': 'Ouvrir les secrets Supabase',
  'ad.p.mail.g3Title': 'Vérifier le domaine et le nommer',
  'ad.p.mail.g3Text': 'Dans Brevo, ouvrez Settings → Senders, Domains, IPs → Domains, ajoutez votre domaine et posez les enregistrements DNS demandés. Une fois authentifié, ajoutez MAIL_FROM_DOMAIN dans Supabase avec ce même domaine : les envois partiront de noreply@ ce domaine.',
  'ad.p.mail.g3Link': 'Ouvrir Brevo',
  'ad.p.mail.g4Title': 'Envoyer un test et le recevoir',
  'ad.p.mail.g4Text': 'Le bouton « Envoyer un test » écrit à votre adresse. Tant que ce message n’arrive pas, le domaine n’est pas prouvé : la clé et le domaine posés ne suffisent pas.',
  'ad.p.mail.gNote': 'La même procédure est écrite au §10 du plan, avec les enregistrements DNS attendus.',
  'ad.p.auth.stamp': 'E-mails d’inscription et de mot de passe',
  'ad.p.auth.sub': 'Les deux messages de compte ne passent pas par les fonctions du site : c’est Supabase Auth qui les écrit, par le SMTP du projet. Cinq gestes les mettent au nom de PaperAtlas, dont le rappel B2B à l’atelier.',
  'ad.p.auth.count': '{n} / {total} gestes en place',
  'ad.p.auth.done': 'En place',
  'ad.p.auth.todo': 'À faire',
  'ad.p.auth.s1Title': 'Reprendre la clé Resend',
  'ad.p.auth.s1Text': 'La clé créée pour les confirmations sert aussi ici : Resend envoie ces messages comme les autres. Rien de nouveau à créer si la première étape du guide est tenue.',
  'ad.p.auth.s2Title': 'Nommer le domaine d’envoi',
  'ad.p.auth.s2Text': 'Le domaine vérifié chez Resend, posé dans MAIL_FROM_DOMAIN, donne l’adresse noreply@ qui signe ces messages. Un domaine non vérifié fait tomber les e-mails d’authentification dans le spam, ou ne les envoie pas du tout.',
  'ad.p.auth.s3Title': 'Brancher le SMTP d’authentification',
  'ad.p.auth.s3Text': 'Dans Supabase, Authentication → Emails → SMTP Settings, choisissez un SMTP personnalisé et recopiez les valeurs ci-dessous. Supabase cesse alors d’écrire depuis son adresse générique : les confirmations partent de PaperAtlas. Ce réglage vit dans Supabase ; la console ne peut pas le lire, elle retient donc la déclaration.',
  'ad.p.auth.s4Title': 'Recevoir un vrai message d’authentification',
  'ad.p.auth.s4Text': 'Le bouton ci-dessous demande à Supabase un e-mail de réinitialisation pour votre adresse : c’est le seul geste qui prouve que le SMTP porte bien le nom de PaperAtlas. Tant qu’il n’arrive pas, l’étape 3 reste déclarée, jamais prouvée.',
  'ad.p.auth.smtpTitle': 'Les valeurs à recopier, une à une',
  'ad.p.auth.host': 'Hôte',
  'ad.p.auth.port': 'Port',
  'ad.p.auth.user': 'Utilisateur',
  'ad.p.auth.pass': 'Mot de passe',
  'ad.p.auth.from': 'Expéditeur',
  'ad.p.auth.copy': 'Copier',
  'ad.p.auth.smtpPassHint': 'Le mot de passe est la clé Resend elle-même — celle de RESEND_API_KEY. Elle ne se recopie pas à la main : reprenez-la chez Resend au moment du réglage.',
  'ad.p.auth.passValue': 'la clé Resend (RESEND_API_KEY)',
  'ad.p.auth.smtpCopyAll': 'Copier les cinq valeurs',
  'ad.p.auth.smtpCopied': 'Les cinq valeurs sont copiées : collez-les dans Supabase, l’une sous l’autre.',
  'ad.p.auth.smtpCopyFail': 'Le navigateur a refusé la copie ; les valeurs restent à l’écran, à recopier à la main.',
  'ad.p.auth.smtpOpen': 'Ouvrir Authentication',
  'ad.p.auth.smtpOpenHint': 'Supabase → Authentication → Emails → SMTP Settings',
  'ad.p.auth.s5Title': 'Rappel B2B à l’atelier',
  'ad.p.auth.s5Text': 'Le rappel qui relance un atelier sur une demande B2B restée sans réponse part par le même Resend et la même clé, mais par une autre fonction : il peut donc tomber seul. Le test ci-dessous envoie un exemple complet à votre adresse — expéditeur, objet et mise en page — sans écrire à aucun atelier.',
  'ad.p.auth.b2bTest': 'Envoyer un rappel de test',
  'ad.p.auth.b2bTesting': 'Envoi en cours…',
  'ad.p.auth.b2bSent': 'Rappel de test parti vers {to}. Cherchez « Rappel B2B » dans l’objet : la signature doit être PaperAtlas.',
  'ad.p.auth.b2bFail': 'Le rappel de test n’est pas parti.',
  'ad.p.auth.b2bBlocked': 'La clé et le domaine doivent d’abord être posés : le rappel emprunte le même chemin.',
  'ad.p.auth.b2bProofAt': 'Test parti le {date}',
  'ad.p.auth.b2bProofNone': 'Aucun test parti',
  'ad.p.auth.b2bHint': 'Un test réussi date l’étape sur ce poste ; il ne prouve que le départ, pas la réception.',
  'ad.p.auth.b2bUndo': 'Oublier ce test',
  'ad.p.auth.modelsRtl': 'Relu sur téléphone : chaque bloc porte son propre sens de lecture, le lien long se coupe au lieu de déborder, et la signature ne mêle plus arabe et anglais sur une seule ligne.',
  'ad.p.auth.declare': 'Marquer le SMTP comme branché',
  'ad.p.auth.declareHint': 'Après avoir enregistré les cinq valeurs dans Supabase : l’étape se juge sur cette déclaration, datée sur ce poste.',
  'ad.p.auth.undeclare': 'Retirer la déclaration',
  'ad.p.auth.declaredOn': 'Déclaré le {date}',
  'ad.p.auth.notDeclared': 'Pas encore déclaré',
  'ad.p.auth.modelsTitle': 'Les trois langues dans le même modèle',
  'ad.p.auth.modelsSub': 'Supabase envoie un seul modèle par type, à tous les comptes. Ces deux modèles portent donc le français, l’arabe et l’anglais à la suite : chacun lit sa langue, personne ne reçoit une langue qu’il ne lit pas.',
  'ad.p.auth.modelKind': 'Type d’e-mail',
  'ad.p.auth.modelConfirm': 'Confirmation d’inscription',
  'ad.p.auth.modelReset': 'Réinitialisation du mot de passe',
  'ad.p.auth.modelSubject': 'Objet',
  'ad.p.auth.modelBody': 'Corps du message (HTML)',
  'ad.p.auth.copySubject': 'Copier l’objet',
  'ad.p.auth.copyBody': 'Copier le corps',
  'ad.p.auth.modelsWhere': 'Ces deux modèles se collent dans Supabase, Authentication → Emails → Templates : « Confirm signup » et « Reset password ». Le lien {{ .ConfirmationURL }} est rempli par Supabase lui-même ; ne le modifiez pas.',
  'ad.p.auth.previewTitle': 'Aperçu du bloc arabe',
  'ad.p.auth.previewSub': 'Le message tel qu’il se lit sur un téléphone : le sens de lecture, la coupe du lien long et la place de la signature se jugent ici, sans ouvrir de boîte.',
  'ad.p.auth.previewWidth': 'Largeur de l’écran',
  'ad.p.auth.previewWidthHint': 'Trois largeurs de téléphone, pour comparer : 320, 360 et 390 px. La page d’aperçu prend celle que vous choisissez ; le bloc arabe, lui, ne change pas.',
  'ad.p.auth.previewHeight': 'Hauteur de l’écran',
  'ad.p.auth.previewHeightHint': 'Trois hauteurs de la même fenêtre : 320, 480 et 640 px. La largeur juge la coupe des lignes, la hauteur juge le défilement — ce qu’on voit du message avant de faire glisser le doigt.',
  'ad.p.auth.previewNote': 'Rien de cet aperçu ne part : le lien de confirmation y reste un repère immobile, et ce cadre ne sert qu’à la lecture.',
  'ad.p.auth.previewReste': 'À la hauteur de {h} px, il reste {n} px à faire défiler pour atteindre la signature.',
  'ad.p.auth.previewResteZero': 'À la hauteur de {h} px, la signature est déjà visible : rien à faire défiler.',
  'ad.p.auth.previewTally': 'Les trois hauteurs, à {w} px de large',
  'ad.p.auth.previewTallyHint': 'Les trois hauteurs côte à côte, à la largeur retenue, avec ce qu’il reste à faire défiler pour atteindre la signature. Un appui pose cette hauteur sur le cadre, sans rien recharger.',
  'ad.p.auth.previewTallyRest': '{n} px à défiler',
  'ad.p.auth.previewTallyZero': 'signature visible',
  'ad.p.auth.previewTallyPick': 'Poser la hauteur de {h} px sur le cadre d’aperçu, à {w} px de large.',
  'ad.p.auth.previewTallyCopy': 'Copier le relevé',
  'ad.p.auth.previewTallyCopyHint': 'Copie le relevé des trois hauteurs : la largeur retenue part en tête, suivie des trois mesures l’une sous l’autre, avec ce qu’il reste à faire défiler pour chacune.',
  'ad.p.auth.previewTallyCopyHead': 'Relevé des trois hauteurs — {w} px de large',
  'ad.p.auth.previewTallyCopyLine': '- {h} px : {rest}',
  'ad.p.auth.previewTallyCopied': 'Relevé copié — la largeur retenue est nommée avec les trois mesures.',
  'ad.p.auth.previewTallyCopyFail': 'Le navigateur a refusé la copie : le relevé reste lisible à l’écran, à recopier à la main.',
  'ad.p.auth.previewTallyLast': 'Dernière copie du relevé le {date}, retenue par cet appareil.',
  'ad.p.auth.previewTallyNever': 'Le relevé n’a pas encore été copié depuis cet appareil.',
  'ad.p.auth.test': 'Recevoir un e-mail de test',
  'ad.p.auth.testing': 'Demande en cours…',
  'ad.p.auth.testSent': 'Demande envoyée à {to}. Ouvrez la boîte : l’expéditeur doit être PaperAtlas.',
  'ad.p.auth.testFail': 'Supabase n’a pas accepté d’envoyer ce message.',
  'ad.p.auth.testReceived': 'Marquer le message comme reçu',
  'ad.p.auth.proofAt': 'Reçu le {date}',
  'ad.p.auth.proofNone': 'Aucun message reçu',
  'ad.p.auth.proofHint': 'Un clic date la réception du message sur ce poste ; un second clic retire la date.',
  'ad.p.auth.note': 'Tant que ces cinq gestes ne sont pas tenus, les e-mails d’inscription et de mot de passe partent depuis l’adresse générique de Supabase, en anglais.',
  'ad.p.mail.proof': 'Dernière preuve',
  'ad.p.mail.proofAt': 'Test reçu le {date}',
  'ad.p.mail.proofNone': 'Aucun test reçu',
  'ad.p.mail.gDoneOn': 'reçu le {date}',
  'ad.p.mail.gAgeToday': 'aujourd’hui',
  'ad.p.mail.gAgeOne': 'il y a 1 jour',
  'ad.p.mail.gAge': 'il y a {n} jours',
  'ad.p.mail.gAncienne':
    'Cette preuve a plus d’un mois : relancez un test pour la rafraîchir.',
  'ad.p.mail.gToSuivi': 'Suivre ce chantier dans le projet',
  'ad.p.mail.steps': 'Étapes en place {n} / {total}',
  'ad.p.mail.stepsHint':
    'Les étapes du guide déjà tenues, comptées sur l’état réel des secrets et sur le dernier test reçu — lisible sans dérouler les quatre étapes.',
  'ad.p.mail.stepsOpenHint':
    'Ouvrir le guide sur la première étape encore manquante',
  'ad.p.mail.gNext': 'Prochaine étape',
  'ad.f.reply': 'Répondre',
  'ad.f.replyHint': 'Ouvrir un message déjà adressé à l’expéditeur de cette demande.',
  'ad.f.demandeSubject': 'Demande B2B',
  'ad.f.demandesTodo': 'à traiter',
  'ad.f.demandesTodoHint':
    'Ne garder que les demandes encore à traiter, la plus ancienne en tête ; un second clic les rouvre toutes.',
  'ad.f.demandesDone': 'traitées',
  'ad.f.demandesNoneTodo': 'Aucune demande à traiter : toutes ont reçu une réponse.',
  'ad.f.demandesOrderHint':
    'Les demandes à traiter passent devant, la plus ancienne en tête : la file se lit dans l’ordre où elle attend.',

  'ad.suivi.stamp': 'Suivi du projet',
  'ad.suivi.sub':
    'Le fichier de pilotage, lu sur place : le pourcentage officiel, les modules qui le composent, les phases et ce qui bloque encore.',
  'ad.suivi.updated': 'Mis à jour le',
  'ad.suivi.version': 'version',
  'ad.suivi.avancement': 'Avancement officiel',
  'ad.suivi.points': 'Points acquis',
  'ad.suivi.acheves': 'Modules achevés',
  'ad.suivi.chantiers': 'Chantiers tenus',
  'ad.suivi.modulesTitle': 'Le poids de chaque module',
  'ad.suivi.modulesNote': 'Poids et avancement, lus dans le fichier de pilotage',
  'ad.suivi.total': 'Total pondéré',
  'ad.suivi.restePart': 'Il reste {pts} points sur 100 · {pct} % du projet',
  'ad.suivi.manqueTitle': 'Le détail des points manquants',
  'ad.suivi.manqueNote': '{n} module(s) encore ouverts · {pts} points à reprendre',
  'ad.suivi.manqueLourd': 'le plus lourd',
  'ad.suivi.manqueTotal': 'Points manquants',
  'ad.suivi.manqueJamais': ' · {n} module(s) jamais descendu(s) depuis cet appareil',
  'ad.suivi.manqueJamaisAucun': ' · tous ses modules ont été descendus',
  'ad.suivi.manqueJamaisHint':
    'Jamais descendus depuis cet appareil, un par ligne :\n{noms}',
  'ad.suivi.manqueJamaisHintItem': '- {nom}',
  'ad.suivi.manqueJamaisHintOk':
    'Chaque module de ce bloc a déjà été descendu depuis cet appareil.',
  'ad.suivi.manqueCsv': 'Détail en CSV',
  'ad.suivi.manqueCsvOk': 'CSV téléchargé',
  'ad.suivi.manqueCsvHint':
    'Le détail des points manquants seul, prêt à joindre à un point d’étape',
  'ad.suivi.descendusCsv': 'Modules descendus en CSV',
  'ad.suivi.descendusCsvOk': 'CSV téléchargé',
  'ad.suivi.descendusCsvPeriode':
    'Les descentes couvrent la période du {ancien} au {recent} — {n} jour(s) entre la plus ancienne et la plus récente.',
  'ad.suivi.descendusCsvPeriodeOne':
    'Les descentes tiennent en une seule journée, le {date}.',
  'ad.suivi.descendusCsvPeriodeNone':
    'Aucune descente datée depuis cet appareil : le fichier partira sans période.',
  'ad.suivi.descendusCsvHint':
    'Les modules descendus depuis cet appareil, avec leur jour, un par ligne',
  'ad.suivi.chantierOuvOne': '1 livrable encore ouvert dans les phases',
  'ad.suivi.chantierOuv': '{n} livrables encore ouverts dans les phases',
  'ad.suivi.chantierOuvZero': 'Aucun livrable ouvert dans les phases',
  'ad.suivi.chantierPart': '{pts} points sur {total} · {pct} % de la part restante',
  'ad.suivi.chantierLourd': 'le plus lourd',
  'ad.suivi.chantierJumpHint':
    'Descendre jusqu’à la ligne de son module le plus lourd — {module}',
  'ad.suivi.capTag': 'cap {seuil} %',
  'ad.suivi.capToCross': 'restent à franchir',
  'ad.suivi.capCrossed': 'cap franchi',
  'ad.suivi.capMail':
    'Les e-mails pèsent {poids} : menés à 100 %, ils rapportent {gain} point et portent le total à {total} %.',
  'ad.suivi.capAfter':
    'Après eux, il ne reste que {reste} point à franchir pour atteindre {seuil} %.',
  'ad.suivi.capAfterNone': 'Après eux, le cap de {seuil} % est franchi.',
  'ad.suivi.capHoverHead':
    'Les {n} module(s) qui restent avant le cap de {seuil} %, du plus lourd au plus léger :',
  'ad.suivi.capHoverItem': '· {module} — {pt} point(s) à reprendre',
  'ad.suivi.capHoverFoot': 'Il reste {reste} point(s) à franchir en tout.',
  'ad.suivi.capHoverDone':
    'Cap de {seuil} % franchi : aucun module ne reste avant lui.',
  'ad.suivi.capListShow': 'Voir les modules qui restent avant le cap',
  'ad.suivi.capListHide': 'Replier la liste des modules',
  'ad.suivi.capGum': 'Oublier ce repère sur cet appareil',
  'ad.suivi.capGumHint':
    'La petite gomme oublie la date du franchissement sur cet appareil — le plan et son archive ne bougent pas.',
  'ad.suivi.capGumConfirm': 'Oublier',
  'ad.suivi.capGumConfirmHint':
    'Appuyer de nouveau pour oublier cette date sur cet appareil.',
  'ad.suivi.capReached': 'Cap franchi le {date}',
  'ad.suivi.capReachedHint':
    'Le cap de 95 % a été franchi le {date} — date gardée sur cet appareil, non recopiée à la main.',
  'ad.suivi.capReachedDays':
    'Il y a {n} journée(s) écoulée(s) depuis le franchissement.',
  'ad.suivi.capJumpHint':
    'Descendre jusqu’à la ligne de ce module dans le tableau du poids des modules.',
  'ad.suivi.capJumpHintAt':
    'Descendre jusqu’à la ligne de ce module dans le tableau · atteint le {date}.',
  'ad.suivi.capDescendusVersArchive':
    'Descendre jusqu’à la ligne des archives, dans le rappel : c’est là que les pièces se joignent.',
  'ad.suivi.modVuLe':
    'Ligne déjà descendue depuis cet appareil · atteinte le {date}.',
  'ad.suivi.modVuSansLe':
    'Ligne déjà descendue depuis cet appareil · jour de la descente non daté.',
  'ad.suivi.modArchiveLe':
    'Dernière archive de ce chantier partie de cet appareil le {date}.',
  'ad.suivi.modArchiveJump':
    'Dernière archive de ce chantier partie de cet appareil le {date} · un appui descend jusqu’à la ligne des archives, dans le rappel.',
  'ad.suivi.modOublier': 'Oublier cette ligne atteinte',
  'ad.suivi.modOublierHint':
    'Oublie cette seule ligne atteinte sur cet appareil, sans toucher aux autres. Aucun module du plan n’est touché.',
  'ad.suivi.modOublierConfirm': 'Confirmer l’oubli de cette ligne',
  'ad.suivi.modOublierConfirmHint':
    'Un second appui oublie cette ligne-là, et elle seule, sur cet appareil.',
  'ad.suivi.capDescendus': 'Modules déjà descendus {n} / {total}',
  'ad.suivi.capDescendusHint':
    'Déjà descendus depuis cet appareil, un par ligne :\n{noms}',
  'ad.suivi.capDescendusHintItem': '- {nom} · atteint le {date}',
  'ad.suivi.capDescendusHintItemSansLe': '- {nom} · jour non daté',
  'ad.suivi.capDescendusOk':
    'Aucun module de cette liste n’a encore été descendu depuis cet appareil.',
  'ad.suivi.capDescendusLe': ' · dernière descente le {date}',
  'ad.suivi.capDescendusSansLe': ' · aucune descente datée',
  'ad.suivi.capJamaisLe': ' · {n} module(s) de la liste jamais descendu(s)',
  'ad.suivi.capJamaisAucun': ' · tous ses modules ont été descendus',
  'ad.suivi.capDescendusOublier': 'Oublier les modules atteints',
  'ad.suivi.capDescendusOublierHint':
    'Oublie les modules atteints depuis cet appareil et le jour de la dernière descente. Aucun module du plan n’est touché.',
  'ad.suivi.capDescendusOublierConfirm': 'Confirmer l’oubli',
  'ad.suivi.capDescendusOublierConfirmHint':
    'Un second appui oublie les modules atteints sur cet appareil.',
  'ad.suivi.chantierFiltrer': 'Resserrer le rappel sur ce seul chantier',
  'ad.suivi.chantierResserre': 'Resserré sur un seul chantier',
  'ad.suivi.chantierVoirTous': 'Voir les quatre',
  'ad.suivi.chantierArchive': 'Archive de ce chantier',
  'ad.suivi.chantierArchiveHint':
    'Télécharge le plan resserré sur ce seul chantier : ses points, ses modules et ses livrables encore ouverts, sans le reste du document.',
  'ad.suivi.chantierArchiveOk': 'Archive téléchargée',
  'ad.suivi.mailGo': 'Expéditeur des e-mails',
  'ad.suivi.preuves': 'Preuves d’envoi {n} / {total}',
  'ad.suivi.preuvesHint': 'La confirmation, le mot de passe et le rappel B2B : trois messages réellement reçus ou partis depuis cet appareil. Il reste : {list}. Un clic ouvre la carte de l’expéditeur.',
  'ad.suivi.preuvesOk': 'Les trois preuves sont datées sur cet appareil : confirmation, mot de passe et rappel B2B.',
  'ad.suivi.preuveConf': 'la confirmation',
  'ad.suivi.preuvePass': 'le mot de passe',
  'ad.suivi.preuveB2b': 'le rappel B2B',
  'ad.suivi.preuveAt': '{label} · {date}',
  'ad.suivi.preuveNoDate': '{label} · pas encore datée',
  'ad.suivi.preuvesClick': 'Un clic ouvre la carte de l’expéditeur.',
  'ad.suivi.mailGoModuleHint': 'Ouvrir la carte « Expéditeur des e-mails » des Paramètres, sans repasser par les onglets.',
  'ad.suivi.mailDoorHint': 'Ouvrir la carte « Expéditeur des e-mails » des Paramètres, droit sur son bloc.',
  'ad.suivi.resendGo': 'Brevo',
  'ad.suivi.resendGoHint': 'Ouvrir Brevo dans un nouvel onglet : les domaines vérifiés et les clés d’envoi du chantier des e-mails.',
  'ad.suivi.modDoorHint': 'Ce module a une porte ouverte : sa ligne mène à l’écran qui le fait avancer.',
  'ad.suivi.modDoorScreen': 'Cette ligne a une porte ouverte : elle mène à l’écran « {ecran} », lu sur le plan.',
  'ad.suivi.doorSeen': 'déjà ouverte',
  'ad.suivi.doorSeenHint': 'La carte « Expéditeur des e-mails » a déjà été ouverte depuis cet appareil, le {date}.',
  'ad.suivi.doorSeenClear': 'Oublier la visite',
  'ad.suivi.doorSeenClearHint': 'Effacer de cet appareil la visite de la carte « Expéditeur des e-mails » : le repère s’efface, la carte et son état restent intacts.',
  'ad.suivi.doorSeenCleared': '{n} portes rendues sur {appareil} : la carte et son état restent intacts.',
  'ad.suivi.appareilOrdi': 'cet ordinateur',
  'ad.suivi.appareilTel': 'ce téléphone',
  'ad.suivi.appareilTab': 'cette tablette',
  'ad.suivi.restePortes': 'Portes ouvertes · {n}',
  'ad.suivi.restePortesHint': 'Ne garder que les lignes de cette liste qui portent une porte ouverte — {n} sur {total} —, lues sur le plan ; un second clic rend la liste entière.',
  'ad.suivi.restePortesShown': '{n} ligne(s) sur {total}, celles qui portent une porte ouverte',
  'ad.suivi.restePortesShownUsed': '{n} ligne(s) sur {total}, dont {used} porte(s) déjà empruntée(s)',
  'ad.suivi.resteCopy': 'Copier ces lignes',
  'ad.suivi.resteCopyHint': 'Copie seulement les lignes retenues par le jeton des portes ouvertes, chacune suivie du nom de l’écran qu’elle ouvre.',
  'ad.suivi.resteCopyHintUsed': 'Copie les {n} lignes retenues par le jeton des portes ouvertes — dont {used} déjà empruntée(s) —, chacune suivie du nom de l’écran qu’elle ouvre et, pour les portes déjà visitées, du jour de la visite.',
  'ad.suivi.resteCopyHead': 'Ce qu’il reste à faire — portes ouvertes ({n})',
  'ad.suivi.resteCopyHeadOublis':
    'Ce qu’il reste à faire — portes ouvertes ({n}) · {oublis} visite(s) oubliée(s) sur cet appareil',
  'ad.suivi.resteCopyLine': '- {texte} — écran : {ecran}',
  'ad.suivi.resteCopyLineUsed': '- {texte} — écran : {ecran} · déjà empruntée le {date}',
  'ad.suivi.resteCopied': '{n} ligne(s) copiée(s), chacune avec le nom de son écran.',
  'ad.suivi.resteCopyFail': 'Le navigateur a refusé la copie : les lignes restent lisibles à l’écran.',
  'ad.suivi.resteVues': 'Déjà empruntées · {n}',
  'ad.suivi.resteVuesHint': 'Ne garder que les lignes dont la porte a déjà été empruntée depuis cet appareil — {n} sur {total} — ; un second clic rend la liste entière.',
  'ad.suivi.resteVuesHintDetail':
    'Ne garder que les lignes dont la porte a déjà été empruntée depuis cet appareil — {n} sur {total} — : {detail} ; un second clic rend la liste entière.',
  'ad.suivi.resteVuesShown': '{n} ligne(s) sur {total}, celles dont la porte est déjà empruntée',
  'ad.suivi.doorOublis': '{n} visite(s) oubliée(s) sur cet appareil',
  'ad.suivi.doorOublisLast': 'dernier oubli le {date}',
  'ad.suivi.doorOublisNone': 'aucune visite oubliée pour l’instant',
  'ad.suivi.doorOublisHint': 'Les visites de portes rendues depuis cet appareil par la petite gomme du repère « déjà empruntée » : le compte et le jour du dernier oubli sont lus sur le carnet du poste.',
  'ad.suivi.doorOublisCsv': 'Visites en CSV',
  'ad.suivi.doorOublisCsvOk': 'CSV téléchargé',
  'ad.suivi.doorOublisCsvHint':
    'Télécharge le carnet en CSV — une ligne par porte oubliée, avec son écran, son chantier du plan et le jour du geste —, {n} ligne(s) prêtes à joindre.',
  'ad.suivi.doorOublisCsvHintSpan':
    'Télécharge le carnet en CSV — une ligne par porte oubliée, avec son écran, son chantier du plan et le jour du geste —, {n} ligne(s) du {ancien} au {recent}, prêtes à joindre.',
  'ad.suivi.doorOublisCsvPeriode':
    'Le carnet couvre la période du {ancien} au {recent} — {n} jour(s) entre le plus ancien retour et le plus récent.',
  'ad.suivi.doorOublisCsvPeriodeOne':
    'Le carnet ne couvre qu’une seule journée, le {date} : le plus ancien retour et le plus récent tombent le même jour.',
  'ad.suivi.doorOublisCsvBlocs':
    'Le fichier porte {n} ligne(s) en {b} bloc(s), comptés un à un :',
  'ad.suivi.doorOublisCsvBlocItem': '{titre} — {n} ligne(s)',
  'ad.suivi.doorOublisCsvBlocsNone': 'Le fichier est vide : aucun bloc à compter.',
  'ad.suivi.doorOublisCsvBlocLourd':
    'Le bloc le plus lourd du fichier est « {titre} », avec {n} ligne(s) sur les {total} du fichier — {part} % du tout.',
  'ad.suivi.doorOublisCsvBlocLourdNone':
    'Aucun bloc ne porte de ligne : le plus lourd ne se nomme pas.',
  'ad.suivi.doorOublisParChantier': 'Visites rendues par chantier',
  'ad.suivi.doorOublisParChantierHintDetail':
    'Les visites du carnet rangées par chantier du plan, la plus fournie en tête, avec le jour du dernier oubli de chacune et les journées qui séparent son premier oubli de son dernier : {detail} — lues sur la même mémoire d’appareil.',
  'ad.suivi.doorOublisChantierDernier': 'dernier oubli le {date}',
  'ad.suivi.doorOublisChantierSpan': '{n} jour(s) entre le premier et le dernier oubli',
  'ad.suivi.doorOublisChantierSpanOne': 'premier et dernier oubli le même jour',
  'ad.suivi.doorOublisChantierTokenHint':
    'Ne garder dans le carnet que les oublis de « {nom} » — {n} geste(s), du {premier} au {dernier} —, le temps d’en retirer une ligne sans se tromper de voisin ; un second appui rend le carnet entier.',
  'ad.suivi.doorOublisChantierTokenHintMasque':
    'Ne garder dans le carnet que les oublis de « {nom} » — {n} geste(s), du {premier} au {dernier} — : {masques} autre(s) ligne(s) du carnet sortiraient alors de la vue, dont le premier oubli est daté du {premierMasque} ; un second appui rend le carnet entier.',
  'ad.suivi.doorOublisChantierOn': 'Carnet resserré sur « {nom} » — {n} geste(s)',
  'ad.suivi.doorOublisChantierClear': 'Rendre le carnet entier',
  'ad.suivi.doorOublisSemaine': 'Cette semaine · {n}',
  'ad.suivi.doorOublisSemaineHint':
    'Ne garder dans le carnet que les oublis tombés cette semaine — {n} geste(s) sur {total} —, pour relire les gestes récents avant d’en effacer un ; un second appui rend le carnet entier. Le jeton de chantier, s’il est posé, reste tenu : les deux se lisent ensemble.',
  'ad.suivi.doorOublisSemaineOn': 'Semaine en cours — {n} geste(s)',
  'ad.suivi.doorOublisSemaineNote': 'les gestes récents, avant d’en effacer un',
  'ad.suivi.doorOublisSemaineClear': 'Rendre les gestes plus anciens',
  'ad.suivi.doorOublisSemaineHintBouts':
    'Ne garder dans le carnet que les oublis tombés cette semaine — {n} geste(s) sur {total}, du plus ancien le {ancien} au plus récent le {recent} —, pour relire les gestes récents avant d’en effacer un ; un second appui rend le carnet entier. Le jeton de chantier, s’il est posé, reste tenu : les deux se lisent ensemble.',
  'ad.suivi.doorOublisSemaineHintBoutsOne':
    'Ne garder dans le carnet que les oublis tombés cette semaine — {n} geste(s) sur {total}, tous le {date} —, pour relire les gestes récents avant d’en effacer un ; un second appui rend le carnet entier. Le jeton de chantier, s’il est posé, reste tenu : les deux se lisent ensemble.',
  'ad.suivi.doorOublisJetons': '{n} jeton(s) posé(s)',
  'ad.suivi.doorOublisJetonsNone': 'aucun jeton posé',
  'ad.suivi.doorOublisJetonsHint':
    'Les {n} jeton(s) posés sur le carnet — l’écran, le chantier et la semaine —, comptés ensemble : ils resserrent la lecture, sans retirer un seul oubli. La gomme les éteint tous d’un geste.',
  'ad.suivi.doorOublisJetonsNoneHint':
    'Aucun jeton posé sur le carnet : la liste montre tous ses gestes. L’écran, le chantier et la semaine se posent chacun d’un appui, et se lisent ensemble.',
  'ad.suivi.doorOublisJetonsClear': 'Éteindre les jetons',
  'ad.suivi.doorOublisJetonsClearHint':
    'Éteint les {n} jeton(s) posés sur le carnet d’un seul geste et rend la liste entière : aucun oubli n’est retiré, le compte du carnet ne bouge pas.',
  'ad.suivi.doorOublisJetonsCleared':
    '{n} jeton(s) éteint(s) : le carnet montre de nouveau tous ses gestes.',
  'ad.suivi.doorOublisJournal':
    'Le carnet, geste par geste — du plus récent au plus ancien',
  'ad.suivi.doorOublisJournalTri': 'Le carnet, rangé par écran',
  'ad.suivi.doorOublisTriEcran': 'Par écran',
  'ad.suivi.doorOublisTriEcranHint':
    'Range les gestes du carnet sous le nom de leur écran, pour relire les oublis d’un même écran côte à côte avant d’en retirer un ; un second appui rend l’ordre du plus récent au plus ancien. Aucun oubli n’est retiré.',
  'ad.suivi.doorOublisTriEcranOffHint':
    'Le carnet est rangé par écran : un appui rend l’ordre du plus récent au plus ancien, sans retirer aucun oubli.',
  'ad.suivi.doorOublisTriEcranHintDetail':
    'Range les gestes du carnet sous le nom de leur écran — {n} écran(s) sur {total} geste(s), chacun avec le jour de son oubli le plus récent : {detail} —, pour relire les oublis d’un même écran côte à côte avant d’en retirer un ; un second appui rend l’ordre du plus récent au plus ancien. Aucun oubli n’est retiré.',
  'ad.suivi.doorOublisTriEcranOffHintDetail':
    'Le carnet est rangé par écran — {n} écran(s) sur {total} geste(s), chacun avec le jour de son oubli le plus récent : {detail} — ; un appui rend l’ordre du plus récent au plus ancien, sans retirer aucun oubli. La petite gomme le fait aussi d’un seul geste.',
  'ad.suivi.doorOublisTriEcranItem': '{ecran} · {n} geste(s) · dernier le {date}',
  'ad.suivi.doorOublisTriEcranClear': 'Revenir à l’ordre du plus récent',
  'ad.suivi.doorOublisTriEcranClearHint':
    'Rend l’ordre du plus récent au plus ancien d’un seul geste : les {n} écran(s) ne sont plus groupés, aucun oubli n’est retiré, le compte du carnet ne bouge pas.',
  'ad.suivi.doorOublisTriEcranClearHintDetail':
    'Rend l’ordre du plus récent au plus ancien d’un seul geste. Le tri regroupait, écran par écran : {detail}. Aucun oubli n’est retiré, et le carnet se relit d’un seul tenant — ses {n} écran(s) sur {total} geste(s).',
  'ad.suivi.doorOublisEcranItemNom': 'l’écran {ecran}',
  'ad.suivi.doorOublisEcranTokenHint':
    'Ne garder dans le carnet que les gestes de l’écran « {ecran} » — {n} geste(s) sur le carnet —, le temps d’en retirer un sans se tromper de voisin ; un second appui rend tous les écrans. Aucun oubli n’est retiré.',
  'ad.suivi.doorOublisEcranOn': 'Carnet resserré sur l’écran « {ecran} » — {n} geste(s)',
  'ad.suivi.doorOublisEcranOnSpan':
    ' · {n} jour(s) séparent son premier oubli, le {ancien}, de son dernier, le {recent}',
  'ad.suivi.doorOublisEcranOnOne': ' · son premier et son dernier oubli tombent le même jour, le {date}',
  'ad.suivi.doorOublisEcransDeplierHint':
    'Déplie les {n} écran(s) du carnet un à un, sur {total} geste(s) — {detail} —, chacun avec sa petite gomme de retrait, pour retirer les oublis d’un écran sans passer ligne à ligne. Aucun oubli n’est retiré par le dépli.',
  'ad.suivi.doorOublisEcransReplierHint':
    'Les {n} écran(s) du carnet sont dépliés un à un — {detail}. Un appui les replie et rend la liste à ses seules lignes ; aucun oubli n’est retiré.',
  'ad.suivi.doorOublisEcranDeplie': '{n} geste(s)',
  'ad.suivi.doorOublisEcranGomme': 'Retirer les gestes de cet écran',
  'ad.suivi.doorOublisEcranGommeHint':
    'Retirer du carnet les {n} geste(s) de l’écran « {ecran} » — du {premier} au {dernier} —, d’un seul appui : les visites retenues restent sur cet appareil, et le plan ne bouge pas.',
  'ad.suivi.doorOublisEcranGommeDone':
    'Écran « {ecran} » retiré du carnet : ses {n} geste(s) n’y sont plus, les visites retenues restent sur cet appareil, le plan aussi.',
  'ad.suivi.doorOublisEcranNomHint':
    'Écran « {ecran} » · {n} jour(s) séparent son premier oubli, le {premier}, de son dernier, le {dernier}.',
  'ad.suivi.doorOublisEcranNomHintOne':
    'Écran « {ecran} » · son premier et son dernier oubli tombent le même jour, le {date}.',
  'ad.suivi.doorOublisEcranNomAppui':
    'Un appui ne garde que les gestes de cet écran — {n} au carnet —, le temps d’en retirer un sans passer par la liste ; un second appui retire ses gestes du carnet, comme sa petite gomme. Les visites retenues et le plan ne bougent pas.',
  'ad.suivi.doorOublisEcranNomAppuiOff':
    'Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRelire': 'Plus d’un geste · {n}',
  'ad.suivi.doorOublisEcransRelireHint':
    'Ne garder dans le dépli que les écrans qui tiennent encore plus d’un geste — {n} sur {total} écran(s), qui retiennent au total {gestesPlusieurs} geste(s), tous écrans confondus —, ceux qui demandent une relecture : {detail}. Il écarte donc du dépli {ecartes} écran(s), avec leurs {gestesEcartes} geste(s), écran par écran : {detailEcartes}. Un second appui rend tous les écrans ; aucun oubli n’est retiré.',
  'ad.suivi.doorOublisEcransRelireOffHint':
    'Le dépli ne montre que les écrans de plus d’un geste — {n} sur {total} écran(s), qui retiennent au total {gestesPlusieurs} geste(s), tous écrans confondus : {detail}. Il écarte {ecartes} écran(s), avec leurs {gestesEcartes} geste(s) : {detailEcartes}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRelireAucun': 'aucun écran écarté',
  'ad.suivi.doorOublisEcransRelireOn':
    'Dépli resserré sur les écrans de plus d’un geste — {n} sur {total}',
  'ad.suivi.doorOublisEcransRelireRecent':
    'Écran vidé le plus récemment · {ecran} · le {date}',
  'ad.suivi.doorOublisEcransRelireRecentNone': 'aucun écran vidé sur cet appareil',
  'ad.suivi.doorOublisEcransFourniHint':
    'Un second appui range les écrans du plus fourni au plus léger ; un troisième replie le dépli. Aucun oubli n’est retiré.',
  'ad.suivi.doorOublisEcransFourniOnHint':
    'Les écrans sont rangés du plus fourni au plus léger : un appui replie le dépli, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransFourniOn':
    'écrans rangés du plus fourni au plus léger — {n} sur {total}',
  'ad.suivi.doorOublisEcransDeplaces':
    'Entre l’ordre du carnet et le rangement du plus fourni, {n} écran(s) sur {total} changent de place.',
  'ad.suivi.doorOublisEcransDeplacesNone':
    'Les {total} écran(s) gardent la même place dans les deux ordres : le rangement ne déplace aucune ligne.',
  'ad.suivi.doorOublisEcransRetiresNom':
    'Écrans retirés du carnet par un second appui sur leur nom · {n} — {list}. Le geste vide un écran sans passer par sa petite gomme.',
  'ad.suivi.doorOublisEcransRetiresNomNone':
    'Aucun écran n’a encore quitté le carnet par un second appui sur son nom : la petite gomme d’un écran reste le seul chemin.',
  'ad.suivi.doorOublisEcransVieux': 'Dernier geste > 7 j · {n}',
  'ad.suivi.doorOublisEcransVieuxHint':
    'Ne garder dans le dépli que les écrans dont le dernier geste remonte à plus de sept jours — {n} sur {total} écran(s), qui retiennent {gestesVieux} geste(s) : {detail} —, ceux qu’on ne relit plus. Le jeton de relecture, s’il est posé, reste tenu : les deux se lisent ensemble. Un second appui rend tous les écrans ; aucun oubli n’est retiré.',
  'ad.suivi.doorOublisEcransVieuxOffHint':
    'Le dépli ne montre que les écrans dont le dernier geste a plus de sept jours — {n} sur {total} écran(s), qui retiennent {gestesVieux} geste(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransVieuxOn':
    'Dépli resserré sur les écrans de plus de sept jours — {n} sur {total}',
  'ad.suivi.doorOublisEcransVieuxAucun': 'aucun écran de plus de sept jours',
  'ad.suivi.doorOublisEcransVieuxPlusAncien':
    'Le plus ancien est « {ecran} », dont le dernier geste date du {date} — {n} jour(s) sans relecture.',
  'ad.suivi.doorOublisEcransVieuxPlusAncienNone':
    'Aucun écran n’a de dernier geste de plus de sept jours : rien ne dort encore assez longtemps.',
  'ad.suivi.doorOublisEcransRetour': 'Revenus au carnet · {n}',
  'ad.suivi.doorOublisEcransRetourHint':
    'Ne garder dans le dépli que les écrans déjà retirés par un second appui sur leur nom, puis revenus au carnet — {n} sur {total} écran(s) —, avec le jour de leur retour : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetourOffHint':
    'Le dépli ne montre que les écrans revenus au carnet après un retrait par leur nom — {n} sur {total} écran(s), avec le jour de leur retour : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetourOn':
    'Dépli resserré sur les écrans revenus au carnet — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetourAucun': 'aucun écran revenu pour l’instant',
  'ad.suivi.doorOublisEcransRetourItem': '{ecran} · revenu le {date}',
  'ad.suivi.doorOublisEcransRetourItemN': '{ecran} · revenu le {date} · retiré puis ramené {n} fois',
  'ad.suivi.doorOublisEcransRetiresPlusieurs': 'Retirés > 1 · {n}',
  'ad.suivi.doorOublisEcransRetiresPlusieursHint':
    'Ne garder dans le dépli que les écrans retirés du carnet par leur nom plus d’une fois depuis cet appareil — {n} sur {total} écran(s) — : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetiresPlusieursOffHint':
    'Le dépli ne montre que les écrans retirés plus d’une fois par leur nom — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetiresPlusieursOn':
    'Dépli resserré sur les écrans retirés plus d’une fois — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetiresPlusieursAucun': 'aucun écran retiré plus d’une fois',
  'ad.suivi.doorOublisEcransRetiresPlusieursItem': '{ecran} · retiré {n} fois',
  'ad.suivi.doorOublisEcransRetiresPlusieursPlus':
    'Le plus retiré est « {ecran} », retiré {n} fois depuis cet appareil.',
  'ad.suivi.doorOublisEcransRetiresPlusieursPlusNone':
    'Aucun écran n’a été retiré plus d’une fois : il n’y a pas de plus retiré à nommer.',
  'ad.suivi.doorOublisEcransRetourDeux': 'Revenus ≥ 2 · {n}',
  'ad.suivi.doorOublisEcransRetourDeuxHint':
    'Ne garder dans le dépli que les écrans revenus au carnet au moins deux fois après en avoir été retirés par leur nom — {n} sur {total} écran(s) : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetourDeuxOffHint':
    'Le dépli ne montre que les écrans revenus au moins deux fois au carnet — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetourDeuxOn':
    'Dépli resserré sur les écrans revenus au moins deux fois — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetourDeuxAucun': 'aucun écran revenu deux fois',
  'ad.suivi.doorOublisEcransRetourDeuxItem': '{ecran} · revenu {n} fois',
  'ad.suivi.doorOublisEcransRetourDeuxPlus':
    'Le plus revenu est « {ecran} », revenu {n} fois au carnet.',
  'ad.suivi.doorOublisEcransRetourDeuxPlusNone':
    'Aucun écran n’est encore revenu deux fois : il n’y a pas de plus revenu à nommer.',
  'ad.suivi.doorOublisEcransRepartis': 'Revenus puis repartis · {n}',
  'ad.suivi.doorOublisEcransRepartisHint':
    'Ne garder dans le dépli que les écrans revenus au carnet puis retirés de nouveau par leur nom — {n} écran(s), avec le jour de leur dernier retrait : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisOffHint':
    'Le dépli ne montre que les écrans revenus au carnet puis repartis — {n} écran(s), avec le jour de leur dernier retrait : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisOn':
    'Dépli resserré sur les écrans revenus puis repartis — {n} écran(s)',
  'ad.suivi.doorOublisEcransRepartisAucun': 'aucun écran revenu puis reparti',
  'ad.suivi.doorOublisEcransRepartisItem': '{ecran} · retiré de nouveau le {date}',
  'ad.suivi.doorOublisEcransRepartisVieux': 'Repartis > 7 j · {n}',
  'ad.suivi.doorOublisEcransRepartisVieuxHint':
    'Ne garder dans le dépli que les écrans revenus au carnet puis repartis depuis plus de sept jours — {n} sur {total} écran(s) reparti(s), avec le jour de leur dernier retrait : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisVieuxOffHint':
    'Le dépli ne montre que les écrans repartis depuis plus de sept jours — {n} sur {total} écran(s), avec le jour de leur dernier retrait : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisVieuxOn':
    'Dépli resserré sur les écrans repartis depuis plus de sept jours — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisVieuxAucun':
    'aucun écran reparti de plus de sept jours',
  'ad.suivi.doorOublisEcransRepartisVieuxPlusAncien':
    'Le parti depuis le plus longtemps est « {ecran} », retiré le {date} — {n} jour(s) hors du carnet.',
  'ad.suivi.doorOublisEcransRepartisVieuxPlusAncienNone':
    'Aucun écran n’est reparti depuis plus de sept jours : il n’y a pas de plus ancien départ à nommer.',
  'ad.suivi.doorOublisEcransRepartisMois': 'Repartis ce mois · {n}',
  'ad.suivi.doorOublisEcransRepartisMoisHint':
    'Ne garder dans le dépli que les écrans revenus au carnet puis repartis dont le dernier retrait tombe dans le mois en cours — {n} sur {total} écran(s) reparti(s), avec le jour de ce retrait : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisMoisOffHint':
    'Le dépli ne montre que les écrans repartis dont le dernier retrait tombe dans le mois en cours — {n} sur {total} écran(s), avec le jour de ce retrait : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisMoisOn':
    'Dépli resserré sur les écrans repartis ce mois — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisMoisAucun': 'aucun écran reparti ce mois',
  'ad.suivi.doorOublisEcransRepartisMoisPlusAncien':
    'Le parti depuis le plus longtemps ce mois-ci est « {ecran} », retiré le {date} — {n} jour(s) hors du carnet.',
  'ad.suivi.doorOublisEcransRepartisMoisPlusAncienNone':
    'Aucun écran n’est reparti ce mois : il n’y a pas de plus ancien départ à nommer.',
  'ad.suivi.doorOublisEcransRepartisMoisSpan':
    'Entre son départ le plus ancien, le {ancien}, et le plus récent, le {recent}, {n} jour(s) séparent les écrans repartis ce mois.',
  'ad.suivi.doorOublisEcransRepartisMoisSpanOne':
    'Les écrans repartis ce mois sont tous partis le même jour, le {date} : aucun écart de jours ne s’y lit.',
  'ad.suivi.doorOublisEcransRepartisSemaine': 'Repartis la semaine · {n}',
  'ad.suivi.doorOublisEcransRepartisSemaineHint':
    'Ne garder dans le dépli que les écrans revenus au carnet puis repartis dont le dernier retrait tombe dans la semaine en cours — {n} sur {total} écran(s) reparti(s), avec le jour de ce retrait : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisSemaineOffHint':
    'Le dépli ne montre que les écrans repartis dont le dernier retrait tombe dans la semaine en cours — {n} sur {total} écran(s), avec le jour de ce retrait : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisSemaineOn':
    'Dépli resserré sur les écrans repartis cette semaine — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisSemaineAucun': 'aucun écran reparti cette semaine',
  'ad.suivi.doorOublisEcransRepartisSemainePlusRecent':
    'Le départ le plus récent de la semaine est « {ecran} », retiré le {date} — {n} jour(s) écoulé(s).',
  'ad.suivi.doorOublisEcransRepartisSemainePlusRecentNone':
    'Aucun écran n’est reparti cette semaine : il n’y a pas de départ récent à nommer.',
  'ad.suivi.doorOublisEcransRepartisSemainePlusAncien':
    'Le départ le plus ancien de la semaine est « {ecran} », retiré le {date} — {n} jour(s) écoulé(s).',
  'ad.suivi.doorOublisEcransRepartisSemainePlusAncienNone':
    'Aucun écran n’est reparti cette semaine : il n’y a pas de départ ancien à nommer.',
  'ad.suivi.doorOublisEcransRepartisHier': 'Repartis hier · {n}',
  'ad.suivi.doorOublisEcransRepartisAvantHier': 'Repartis avant-hier · {n}',
  'ad.suivi.doorOublisEcransRepartisAvantHierHint':
    'Ne garder dans le dépli que les écrans revenus au carnet puis repartis dont le dernier retrait tombe l’avant-veille — {n} sur {total} écran(s) reparti(s), avec le jour de ce retrait : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisAvantHierOffHint':
    'Le dépli ne montre que les écrans repartis l’avant-veille — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisAvantHierOn':
    'Dépli resserré sur les écrans repartis avant-hier — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisAvantHierAucun': 'aucun écran reparti avant-hier',
  'ad.suivi.doorOublisEcransRepartisAvantHierEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRepartisQuinzaine': 'Repartis cette quinzaine · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineHint':
    'Ne garder dans le dépli que les écrans revenus au carnet puis repartis sur les quinze derniers jours — {n} sur {total} écran(s) reparti(s), avec le jour de ce retrait : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineOffHint':
    'Le dépli ne montre que les écrans repartis sur les quinze derniers jours — {n} sur {total} écran(s), avec le jour de ce retrait : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineOn':
    'Dépli resserré sur les écrans repartis cette quinzaine — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineAucun':
    'aucun écran reparti ces quinze derniers jours',
  'ad.suivi.doorOublisEcransRepartisQuinzaineEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemainePart':
    'Dont {n} écran(s) de la semaine en cours, sur {total} dans la quinzaine.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemainePartNone':
    'Aucun de ces {total} écran(s) n’est parti dans la semaine en cours.',
  'ad.suivi.doorOublisCsvRepartisSemaineTotal':
    'Écrans repartis de la semaine en cours : {n} écran(s), comptés au jour le jour dans le fichier.',
  'ad.suivi.doorOublisCsvRepartisSemaineTotalNone':
    'Écrans repartis de la semaine en cours : aucun départ cette semaine, la ligne du fichier le dit jour par jour.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenus':
    'Repartis quinze jours et revenus depuis · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusHint':
    'Ne garder dans le dépli que les écrans partis dans la quinzaine puis ramenés au carnet depuis — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur dernier retrait et celui de leur retour : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusOffHint':
    'Le dépli ne montre que les écrans partis dans la quinzaine puis revenus au carnet — {n} sur {total} écran(s) reparti(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusOn':
    'Dépli resserré sur les écrans partis dans la quinzaine puis revenus — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusAucun':
    'aucun écran parti dans la quinzaine n’est revenu au carnet',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusItem':
    '{ecran} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusDelai':
    'Délai moyen entre le départ et le retour : {n} jour(s), écran par écran, sur {k} écran(s) revenu(s).',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusDelaiOne':
    'Délai entre le départ et le retour : un seul écran revenu, {n} jour(s) retenu(s) — la moyenne ne dit rien de plus.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusDelaiNone':
    'Délai entre le départ et le retour : aucun retour daté sur ces écrans, le délai ne s’y lit pas encore.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamais':
    'Partis cette quinzaine, jamais revenus · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisHint':
    'Ne garder dans le dépli que les écrans partis dans la quinzaine que rien n’a ramenés au carnet depuis — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur retrait : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisOffHint':
    'Le dépli ne montre que les écrans partis dans la quinzaine et jamais revenus — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisOn':
    'Dépli resserré sur les écrans partis sans retour — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisAucun':
    'aucun écran parti n’attend encore son retour',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisItem':
    '{ecran} · parti le {date} · jamais revenu',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisCsvQuinzaineRevenusCount':
    'Écrans retenus par le jeton « partis dans la quinzaine puis revenus » : {n}, avec leur départ et leur retour.',
  'ad.suivi.doorOublisCsvQuinzaineRevenusCountNone':
    'Écrans retenus par le jeton « partis dans la quinzaine puis revenus » : aucun pour l’instant, le jeton ne retient rien.',
  'ad.suivi.doorOublisCsvCumulPeriode':
    'Période du total cumulé : {n} jour(s) entre le premier départ, le {ancien}, et le dernier, le {recent}.',
  'ad.suivi.doorOublisCsvCumulPeriodeOne':
    'Période du total cumulé : un seul jour de départ retenu, le {date}.',
  'ad.suivi.doorOublisCsvCumulPeriodeNone':
    'Période du total cumulé : aucun départ daté sur cet appareil, la période ne s’y lit pas encore.',
  'ad.suivi.doorOublisCsvSemaineDelai':
    'Délai moyen de retour de la semaine en cours : {n} jour(s) sur {k} retour(s) daté(s).',
  'ad.suivi.doorOublisCsvSemaineDelaiOne':
    'Délai de retour de la semaine en cours : un seul retour daté, {n} jour(s) retenu(s).',
  'ad.suivi.doorOublisCsvSansRetour':
    'Écrans sans aucun retour : {n} écran(s) parti(s) que rien n’a jamais ramenés au carnet.',
  'ad.suivi.doorOublisCsvSansRetourNone':
    'Aucun écran sans retour : tout écran parti a une trace de retour.',
  'ad.suivi.doorOublisCsvHorsQuinzaine':
    'Retours de plus de quinze jours : {n} retour(s) après un départ déjà sorti de la quinzaine, dans tout l’historique des retours datés.',
  'ad.suivi.doorOublisCsvHorsQuinzaineNone':
    'Retours de plus de quinze jours : aucun retour après un départ sorti de la quinzaine.',
  'ad.suivi.doorOublisCsvSemaineDelaiNone':
    'Délai de retour de la semaine en cours : aucun retour daté cette semaine.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaine':
    'Partis cette quinzaine, revenus depuis · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineHint':
    'Ne garder dans le dépli que les écrans partis dans la quinzaine puis revenus au carnet dans la semaine en cours — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur retrait et celui de leur retour : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineOffHint':
    'Le dépli ne montre que les écrans partis dans la quinzaine puis revenus cette semaine — {n} sur {total} écran(s) reparti(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineOn':
    'Dépli resserré sur les écrans partis dans la quinzaine et revenus cette semaine — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineAucun':
    'aucun écran parti dans la quinzaine n’est revenu cette semaine',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineItem':
    '{ecran} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifs':
    'Repartis quinze jours, revenus en plus de sept jours · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsHint':
    'Ne garder dans le dépli que les retours tardifs de la quinzaine — {n} sur {total} écran(s) reparti(s) —, ceux dont le retour suit le départ de plus de sept journées, avec leurs deux dates et leur délai : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsOffHint':
    'Le dépli ne montre que les écrans partis dans la quinzaine et revenus plus de sept jours après — {n} sur {total} écran(s), avec leur délai : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsOn':
    'Dépli resserré sur les retours tardifs de la quinzaine — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsAucun':
    'aucun retour tardif dans la quinzaine',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsItem':
    '{ecran} · parti le {date} · revenu le {retour} · {n} jour(s)',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPlusRapide':
    'Le retour le plus rapide est « {ecran} », revenu en {n} jour(s) après un départ du {date}.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPlusLent':
    'Le plus lent est « {ecran} », revenu en {n} jour(s) après un départ du {date}.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsBoutsNone':
    'Aucun de ces écrans n’a encore de retour tardif : ni le plus rapide ni le plus lent ne s’y nomment.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPart':
    'Ces retours lents font {n} retour(s) sur {k} dans la quinzaine, soit {pct} % des retours datés.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPartNone':
    'Aucun retour daté dans la quinzaine : la part des retours lents ne s’y lit pas.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapides':
    'Retours rapides de la quinzaine · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesHint':
    'Ne garder dans le dépli que les retours rapides de la quinzaine — {n} sur {total} écran(s) reparti(s) —, ceux revenus en sept journées ou moins après leur départ, avec leurs deux dates et leur délai : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesOffHint':
    'Le dépli ne montre que les écrans partis dans la quinzaine et revenus en sept journées ou moins — {n} sur {total} écran(s), avec leur délai : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesOn':
    'Dépli resserré sur les retours rapides de la quinzaine — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesAucun':
    'aucun retour rapide dans la quinzaine',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesItem':
    '{ecran} · parti le {date} · revenu le {retour} · {n} jour(s)',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesPlusRapide':
    'Le retour le plus court est « {ecran} », revenu en {n} jour(s) après un départ du {date}.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesPlusLent':
    'Le plus long est « {ecran} », revenu en {n} jour(s) après un départ du {date}.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesBoutsNone':
    'Aucun de ces écrans n’a encore de retour rapide : ni le plus court ni le plus long ne s’y nomment.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaine':
    'Retours de plus de quinze jours · {n}',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineHint':
    'Ne garder dans le dépli que les retours de plus de quinze jours — {n} sur {total} écran(s) reparti(s) —, ceux revenus après un départ déjà sorti de la quinzaine, avec leurs deux dates et leur délai : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineOffHint':
    'Le dépli ne montre que les écrans revenus après un départ déjà sorti de la quinzaine — {n} sur {total} écran(s), avec leur délai : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineOn':
    'Dépli resserré sur les retours de plus de quinze jours — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineAucun':
    'aucun retour après un départ sorti de la quinzaine',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineItem':
    '{ecran} · parti le {date} · revenu le {retour} · {n} jour(s)',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunis':
    'Retours rapides et tardifs confondus · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisHint':
    'Ne garder dans le dépli que les deux lots de la quinzaine réunis — {n} sur {total} écran(s) reparti(s) —, les retours rapides et les retours tardifs rassemblés en un seul geste, avec leurs deux dates et leur délai : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisOffHint':
    'Le dépli montre les retours rapides et les retours tardifs de la quinzaine réunis — {n} sur {total} écran(s), avec leur délai : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisOn':
    'Dépli resserré sur les deux lots de la quinzaine réunis — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisAucun':
    'aucun retour daté dans la quinzaine, les deux lots sont vides',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisItem':
    '{ecran} · parti le {date} · revenu le {retour} · {n} jour(s)',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisPart':
    'Les deux lots réunis font {n} retour(s) sur {total} écran(s) parti(s) de la quinzaine, soit {pct} % des départs de ces quinze jours.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisPartNone':
    'Aucun écran parti de la quinzaine : la part des deux lots ne se divise pas encore.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzainePlusRapide':
    'Le retour le plus rapide du lot est « {ecran} », revenu en {n} jour(s) après un départ du {date}.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzainePlusLent':
    'Le plus lent est « {ecran} », revenu en {n} jour(s) après un départ du {date}.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineBoutsNone':
    'Aucun de ces écrans n’a encore de retour : ni le plus rapide ni le plus lent ne s’y nomment.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzainePart':
    'Ces retours font {n} sur {total} retour(s) daté(s) de tout l’historique, soit {pct} % des retours datés.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzainePartNone':
    'Aucun retour daté dans l’historique : la part des retours de plus de quinze jours ne se divise pas encore.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetour':
    'Quinzaine sans aucun retour · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourHint':
    'Ne garder dans le dépli que les écrans partis dans la quinzaine qu’aucun retour n’a jamais ramenés — {n} sur {total} écran(s) reparti(s) —, ni avant ni après ce départ, avec le jour de leur retrait : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourOffHint':
    'Le dépli ne montre que les écrans partis dans la quinzaine sans aucun retour au carnet — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourOn':
    'Dépli resserré sur la quinzaine sans aucun retour — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourAucun':
    'aucun écran parti dans la quinzaine n’est sans retour',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourItem':
    '{ecran} · parti le {date} · aucun retour au carnet',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransJumeaux':
    'Jumeaux — « Aucun retour daté » retient {a} écran(s), « Retours datés » en retient {b}',
  'ad.suivi.doorOublisEcransRetoursDatesPlusCourt':
    'Le délai le plus court du lot est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesPlusLong':
    'Le plus long est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesBoutsNone':
    'Aucun retour daté dans ce lot : ni délai court ni délai long ne s’y lisent.',
  'ad.suivi.doorOublisEcransAucunRetour': 'Aucun retour daté · {n}',
  'ad.suivi.doorOublisEcransAucunRetourHint':
    'Ne garder dans le dépli que les écrans dont l’historique ne porte aucune date de retour — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur dernier retrait : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransAucunRetourOffHint':
    'Le dépli ne montre que les écrans dont l’historique ne porte aucune date de retour — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransAucunRetourOn':
    'Dépli resserré sur les écrans sans aucune date de retour — {n} sur {total}',
  'ad.suivi.doorOublisEcransAucunRetourAucun': 'aucun écran sans date de retour',
  'ad.suivi.doorOublisEcransAucunRetourItem':
    '{ecran} · retiré le {date} · aucune date de retour',
  'ad.suivi.doorOublisEcransAucunRetourEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransAucunRetourPlusAncien':
    'Le départ le plus ancien du lot est « {ecran} », parti le {date} : {n} journée(s) écoulées depuis.',
  'ad.suivi.doorOublisEcransAucunRetourPlusAncienNone':
    'Aucun départ dans ce lot : aucune journée ne se compte.',
  'ad.suivi.doorOublisEcransRetoursDates': 'Retours datés · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesHint':
    'Ne garder dans le dépli que les écrans dont l’historique porte au moins une date de retour — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur dernier retrait : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesOffHint':
    'Le dépli ne montre que les écrans qui portent au moins une date de retour — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesOn':
    'Dépli resserré sur les écrans qui portent au moins une date de retour — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAucun':
    'aucun écran ne porte de date de retour',
  'ad.suivi.doorOublisEcransRetoursDatesItem':
    '« {ecran} » — dernier retrait le {date}',
  'ad.suivi.doorOublisEcransRetoursDatesEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesPlusAnciens':
    'Le dépli ne montre qu’un retour par écran : il écarte {n} retour(s) daté(s) plus ancien(s), sur {total} retour(s) daté(s) de ces écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesPlusAnciensNone':
    'Le dépli montre chaque retour daté de ces écrans : aucun retour plus ancien n’est écarté.',
  'ad.suivi.doorOublisEcransRetoursDatesSemaine': 'Retours datés de la semaine · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineHint':
    'Ne garder dans le dépli que les écrans revenus cette semaine avec une date — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur dernier retrait et celui de leur retour : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineOffHint':
    'Le dépli ne montre que les écrans revenus cette semaine avec une date — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineOn':
    'Dépli resserré sur les écrans revenus cette semaine avec une date — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineAucun':
    'aucun écran revenu avec une date cette semaine',
  'ad.suivi.doorOublisEcransRetoursDatesSemainePlusCourt':
    'Le délai le plus court du lot est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesSemainePlusLong':
    'Le plus long est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineBoutsNone':
    'Aucun retour daté dans ce lot : ni délai court ni délai long ne s’y lisent.',
  'ad.suivi.doorOublisEcransRetoursDatesMois': 'Retours datés du mois · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisHint':
    'Ne garder dans le dépli que les écrans revenus ce mois-ci avec une date — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur dernier retrait et celui de leur retour : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisOffHint':
    'Le dépli ne montre que les écrans revenus ce mois-ci avec une date — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisOn':
    'Dépli resserré sur les écrans revenus ce mois-ci avec une date — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisAucun':
    'aucun écran revenu avec une date ce mois-ci',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisPlusCourt':
    'Le délai le plus court du lot est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisPlusLong':
    'Le plus long est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisBoutsNone':
    'Aucun retour daté ce mois-ci : le lot ne nomme personne.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernier':
    'Retours datés du mois dernier · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierHint':
    'Ne garder dans le dépli que les écrans revenus le mois dernier avec une date — {n} sur {total} écran(s) reparti(s), la fenêtre qui vient de se fermer —, avec le jour de leur dernier retrait et celui de leur retour : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierOffHint':
    'Le dépli ne montre que les écrans revenus le mois dernier avec une date — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierOn':
    'Dépli resserré sur les écrans revenus le mois dernier avec une date — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierAucun':
    'aucun écran revenu avec une date le mois dernier',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierPlusCourt':
    'Le délai le plus court du lot est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierPlusLong':
    'Le plus long est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierBoutsNone':
    'Aucun retour daté le mois dernier : le lot ne nomme personne.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMois':
    'Retours datés de l’avant-dernier mois · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisHint':
    'Ne garder dans le dépli que les écrans revenus l’avant-dernier mois avec une date — {n} sur {total} écran(s) reparti(s), la seconde fenêtre fermée —, avec le jour de leur dernier retrait et celui de leur retour : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisOffHint':
    'Le dépli ne montre que les écrans revenus l’avant-dernier mois avec une date — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisOn':
    'Dépli resserré sur les écrans revenus l’avant-dernier mois avec une date — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisAucun':
    'aucun écran revenu avec une date l’avant-dernier mois',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisPlusCourt':
    'Le délai le plus court du lot est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisPlusLong':
    'Le plus long est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisBoutsNone':
    'Cette fenêtre ne porte aucun retour daté : le lot ne nomme ni le plus court ni le plus long.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetres':
    'Deux fenêtres fermées · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresHint':
    'Ne garder dans le dépli que les écrans revenus dans l’une des deux fenêtres fermées — le mois dernier ou l’avant-dernier — {n} sur {total} écran(s) reparti(s) —, avec la fenêtre de chacun, le jour de son dernier retrait et celui de son retour : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresOffHint':
    'Le dépli ne montre que les écrans revenus dans l’une des deux fenêtres fermées — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresOn':
    'Dépli resserré sur les deux fenêtres fermées — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresAucun':
    'aucun écran revenu avec une date sur ces deux fenêtres',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresRepartis':
    'Mois dernier : {a} écran(s) · avant-dernier mois : {b} écran(s) — {n} en tout, aucun écran dans les deux à la fois.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresMoisDernier': 'mois dernier',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresAvantDernier':
    'avant-dernier mois',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestre': 'Retours datés du trimestre · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreHint':
    'Ne garder dans le dépli que les écrans revenus ces trois derniers mois avec une date — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur dernier retrait et celui de leur retour : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreOffHint':
    'Le dépli ne montre que les écrans revenus ces trois derniers mois avec une date — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreOn':
    'Dépli resserré sur les écrans revenus ces trois derniers mois avec une date — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreAucun':
    'aucun écran revenu avec une date ces trois derniers mois',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusCourt':
    'Le délai le plus court du lot est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusLong':
    'Le plus long est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreBoutsNone':
    'Aucun retour daté ces trois derniers mois : le lot ne nomme personne.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusRecent':
    'Le retour le plus récent du lot est « {ecran} », revenu le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusRecentNone':
    'Aucun retour daté ce trimestre : le lot ne nomme personne.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresBoutsMoisDernier':
    'Mois dernier — le plus court « {court} » en {jc} jour(s), revenu le {dc} ; le plus long « {long} » en {jl} jour(s), revenu le {dl}.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresBoutsAvantDernier':
    'Avant-dernier mois — le plus court « {court} » en {jc} jour(s), revenu le {dc} ; le plus long « {long} » en {jl} jour(s), revenu le {dl}.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresBoutsNone':
    'Aucune des deux fenêtres fermées ne porte de retour daté : les deux lots ne nomment personne.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFerme':
    'Retours datés du trimestre fermé · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur les trois mois qui précèdent le mois en cours — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur dernier retrait et celui de leur retour : {detail}. Le mois en cours n’y entre pas. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeOffHint':
    'Le dépli ne montre que les écrans revenus avec une date sur les trois mois fermés — {n} sur {total} écran(s) : {detail}. Le mois en cours reste dehors. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeOn':
    'Dépli resserré sur le trimestre fermé — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAucun':
    'aucun retour daté sur les trois mois fermés',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermePlusRecent':
    'L’écran revenu le plus récemment du lot est « {ecran} », revenu le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermePlusRecentNone':
    'Aucun écran du lot ne porte de date de retour : le trimestre fermé ne nomme personne.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernier':
    'Trimestre fermé et mois dernier · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur le trimestre fermé ou le mois dernier — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. Le mois dernier est déjà compté dans le trimestre fermé : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierOffHint':
    'Le dépli ne montre que les écrans du trimestre fermé et du mois dernier — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierOn':
    'Dépli resserré sur le trimestre fermé et le mois dernier — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierAucun':
    'aucun retour daté sur le trimestre fermé ni le mois dernier',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierRepartis':
    'Trimestre fermé : {a} écran(s) · mois dernier : {b} écran(s) — {n} en tout, le mois dernier étant déjà compté dans le trimestre fermé.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtMois':
    'Mois dernier — le plus court : « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtTrimestre':
    'Trimestre fermé — le plus court : « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtMoisNone':
    'Mois dernier — aucun retour daté : le plus court ne se nomme pas.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtTrimestreNone':
    'Trimestre fermé — aucun retour daté : le plus court ne se nomme pas.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtNone':
    'Aucun retour daté sur les deux fenêtres : le plus court ne se nomme pas.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierFenetreMois':
    'mois dernier',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierFenetreTrimestre':
    'trimestre fermé',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermee':
    'Retours datés de l’année fermée · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeHint':
    'Ne garder dans le dépli que les écrans revenus sur les douze mois qui précèdent le mois en cours avec une date — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur dernier retrait et celui de leur retour : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeOffHint':
    'Le dépli ne montre que les écrans revenus sur les douze mois fermés avec une date — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeOn':
    'Dépli resserré sur les écrans revenus sur les douze mois fermés avec une date — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAucun':
    'aucun écran revenu avec une date sur les douze mois fermés',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeePlusCourt':
    'Le plus court du lot : « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeePlusLong':
    'Le plus long : « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeBoutsNone':
    'Aucun retour daté sur les douze mois fermés : les deux bouts du lot ne se nomment pas.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFerme':
    'Année fermée et trimestre fermé · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur l’année fermée ou le trimestre fermé — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. Le trimestre fermé est déjà compté dans l’année fermée : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeOffHint':
    'Le dépli ne montre que les écrans de l’année fermée et du trimestre fermé — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeOn':
    'Dépli resserré sur l’année fermée et le trimestre fermé — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeAucun':
    'aucun retour daté sur l’année fermée ni le trimestre fermé',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRepartis':
    'Année fermée : {a} écran(s) · trimestre fermé : {b} écran(s) — {n} en tout, le trimestre fermé étant déjà compté dans l’année fermée.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeFenetreAnnee':
    'année fermée',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeFenetreTrimestre':
    'trimestre fermé',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsMois':
    'Trimestre fermé — l’écran revenu le plus récemment : « {ecran} », le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsMoisNone':
    'Trimestre fermé — aucun écran revenu avec une date.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsAnnee':
    'Année fermée — l’écran revenu le plus récemment : « {ecran} », le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsAnneeNone':
    'Année fermée — aucun écran revenu avec une date.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermes':
    'Retours datés des deux derniers mois fermés · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur l’avant-dernier mois fermé ou l’année fermée — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. L’avant-dernier mois est déjà compté dans l’année fermée : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesOffHint':
    'Le dépli ne montre que les écrans de l’avant-dernier mois fermé et de l’année fermée — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesOn':
    'Dépli resserré sur l’avant-dernier mois fermé et l’année fermée — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesAucun':
    'aucun retour daté sur l’avant-dernier mois fermé ni l’année fermée',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesRepartis':
    'Année fermée : {a} écran(s) · avant-dernier mois : {b} écran(s) — {n} en tout, l’avant-dernier mois étant déjà compté dans l’année fermée.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesFenetreMois':
    'avant-dernier mois',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesFenetreAnnee':
    'année fermée',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtMois':
    'Avant-dernier mois — le plus court « {ecran} », revenu en {n} jour(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtMoisNone':
    'Avant-dernier mois — aucun retour daté.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtAnnee':
    'Année fermée — le plus court « {ecran} », revenu en {n} jour(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtAnneeNone':
    'Année fermée — aucun retour daté.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtNone':
    'Aucune des deux fenêtres ne porte de retour daté : les deux lots ne nomment personne.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernier':
    'Retours datés de l’avant-dernier mois et du mois dernier · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur l’avant-dernier mois ou le mois dernier — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. Les deux mois ne se recouvrent pas : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierOffHint':
    'Le dépli ne montre que les écrans de l’avant-dernier mois et du mois dernier — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierOn':
    'Dépli resserré sur l’avant-dernier mois et le mois dernier — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierAucun':
    'aucun retour daté sur l’avant-dernier mois ni le mois dernier',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRepartis':
    'Mois dernier : {a} écran(s) · avant-dernier mois : {b} écran(s) — {n} en tout, aucun écran dans les deux à la fois.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierFenetreMoisDernier':
    'mois dernier',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierFenetreAvantDernier':
    'avant-dernier mois',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsMoisDernier':
    'Mois dernier — l’écran revenu le plus récemment : « {ecran} », le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsMoisDernierNone':
    'Mois dernier — aucun écran revenu avec une date.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsAvantDernier':
    'Avant-dernier mois — l’écran revenu le plus récemment : « {ecran} », le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsAvantDernierNone':
    'Avant-dernier mois — aucun écran revenu avec une date.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFerme':
    'Mois dernier et trimestre fermé · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur le mois dernier ou le trimestre fermé — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. Le mois dernier est déjà compté dans le trimestre fermé : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeOffHint':
    'Le dépli ne montre que les écrans du mois dernier et du trimestre fermé — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeOn':
    'Dépli resserré sur le mois dernier et le trimestre fermé — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeAucun':
    'aucun retour daté sur le mois dernier ni le trimestre fermé',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeRepartis':
    'Mois dernier : {a} écran(s) · trimestre fermé : {b} écran(s) — {n} en tout, le mois dernier étant déjà compté dans le trimestre fermé.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeFenetreMoisDernier':
    'mois dernier',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeFenetreTrimestre':
    'trimestre fermé',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtMois':
    'Mois dernier — le plus court : « {ecran} », revenu en {n} jour(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtMoisNone':
    'Mois dernier — le plus court : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtTrimestre':
    'Trimestre fermé — le plus court : « {ecran} », revenu en {n} jour(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtTrimestreNone':
    'Trimestre fermé — le plus court : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtNone':
    'Le plus court de chaque fenêtre : aucun retour daté sur le mois dernier ni le trimestre fermé.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFerme':
    'Avant-dernier mois et trimestre fermé · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur l’avant-dernier mois ou le trimestre fermé — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. L’avant-dernier mois est déjà compté dans le trimestre fermé : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeOffHint':
    'Le dépli ne montre que les écrans de l’avant-dernier mois et du trimestre fermé — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeOn':
    'Dépli resserré sur l’avant-dernier mois et le trimestre fermé — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeAucun':
    'aucun retour daté sur l’avant-dernier mois ni le trimestre fermé',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeRepartis':
    'Avant-dernier mois : {a} écran(s) · trimestre fermé : {b} écran(s) — {n} en tout, l’avant-dernier mois étant déjà compté dans le trimestre fermé.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeFenetreAvantDernier':
    'avant-dernier mois',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeFenetreTrimestre':
    'trimestre fermé',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtAvantDernier':
    'Avant-dernier mois — le plus court : « {ecran} », revenu en {n} jour(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtAvantDernierNone':
    'Avant-dernier mois — le plus court : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtTrimestre':
    'Trimestre fermé — le plus court : « {ecran} », revenu en {n} jour(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtTrimestreNone':
    'Trimestre fermé — le plus court : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtNone':
    'Le plus court de chaque fenêtre : aucun retour daté sur l’avant-dernier mois ni le trimestre fermé.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeTrimestre':
    'Trimestre fermé — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeTrimestreNone':
    'Trimestre fermé — le milieu du lot : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeAvantDernier':
    'Avant-dernier mois — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeAvantDernierNone':
    'Avant-dernier mois — le milieu du lot : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeNone':
    'Le milieu du lot de chaque fenêtre : aucun retour daté sur le trimestre fermé ni l’avant-dernier mois.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFerme':
    'Trimestre fermé et année fermée · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur le trimestre fermé ou l’année fermée — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. Le trimestre fermé est déjà compté dans l’année fermée : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeOffHint':
    'Le dépli ne montre que les écrans du trimestre fermé et de l’année fermée — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeOn':
    'Dépli resserré sur le trimestre fermé et l’année fermée — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeAucun':
    'aucun retour daté sur le trimestre fermé ni l’année fermée',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeRepartis':
    'Trimestre fermé : {a} écran(s) · année fermée : {b} écran(s) — {n} en tout, le trimestre fermé étant déjà compté dans l’année fermée.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeFenetreTrimestre':
    'trimestre fermé',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeFenetreAnnee':
    'année fermée',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernier':
    'Année fermée et mois dernier · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur l’année fermée ou le mois dernier — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. Le mois dernier est déjà compté dans l’année fermée : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierOffHint':
    'Le dépli ne montre que les écrans de l’année fermée et du mois dernier — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierOn':
    'Dépli resserré sur l’année fermée et le mois dernier — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierAucun':
    'aucun retour daté sur l’année fermée ni le mois dernier',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierRepartis':
    'Mois dernier : {a} écran(s) · année fermée : {b} écran(s) — {n} en tout, le mois dernier étant déjà compté dans l’année fermée.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierFenetreMoisDernier':
    'mois dernier',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierFenetreAnnee':
    'année fermée',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourt':
    'La fenêtre qui revient le plus vite est {fenetre} — mois dernier : {a} jour(s) · année fermée : {b} jour(s), côte à côte.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtTie':
    'Les deux fenêtres reviennent au même rythme — mois dernier : {a} jour(s) · année fermée : {b} jour(s), côte à côte.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtOne':
    'Une seule fenêtre a un retour daté — {fenetre} : {n} jour(s) ; l’autre n’en a aucun.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtNone':
    'Aucune des deux fenêtres n’a de retour daté : la plus rapide ne se nomme pas encore.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeTrimestre':
    'Trimestre fermé — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeTrimestreNone':
    'Trimestre fermé — le milieu du lot : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeAnnee':
    'Année fermée — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeAnneeNone':
    'Année fermée — le milieu du lot : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeNone':
    'Le milieu du lot de chaque fenêtre : aucun retour daté sur le trimestre fermé ni l’année fermée.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCours':
    'Année fermée et mois en cours · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur l’année fermée ou le mois en cours — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. Les deux fenêtres ne se recouvrent pas : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursOffHint':
    'Le dépli ne montre que les écrans de l’année fermée et du mois en cours — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursOn':
    'Dépli resserré sur l’année fermée et le mois en cours — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursAucun':
    'aucun retour daté sur l’année fermée ni le mois en cours',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRepartis':
    'Mois en cours : {a} écran(s) · année fermée : {b} écran(s) — {n} en tout, les deux fenêtres ne se recouvrant pas.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursFenetreMoisEnCours':
    'mois en cours',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursFenetreAnnee':
    'année fermée',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsMoisEnCours':
    'Mois en cours — le plus récent « {ecran} », revenu le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsMoisEnCoursNone':
    'Mois en cours — aucun retour daté.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsAnnee':
    'Année fermée — le plus récent « {ecran} », revenu le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsAnneeNone':
    'Année fermée — aucun retour daté.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernier':
    'Mois en cours et mois dernier · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierHint':
    'Ne garder dans le dépli que les écrans revenus avec une date ce mois-ci ou le mois dernier — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. Les deux mois ne se recouvrent pas : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierOffHint':
    'Le dépli ne montre que les écrans du mois en cours et du mois dernier — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierOn':
    'Dépli resserré sur le mois en cours et le mois dernier — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierAucun':
    'aucun retour daté ce mois-ci ni le mois dernier',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierRepartis':
    'Mois en cours : {a} écran(s) · mois dernier : {b} écran(s) — {n} en tout, les deux mois ne se recouvrant pas.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisEnCours':
    'Mois en cours — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisEnCoursNone':
    'Mois en cours — le milieu du lot : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisDernier':
    'Mois dernier — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisDernierNone':
    'Mois dernier — le milieu du lot : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeNone':
    'Le milieu du lot de chaque mois : aucun retour daté sur le mois en cours ni le mois dernier.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCours':
    'Avant-dernier mois et mois en cours · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursHint':
    'Ne garder dans le dépli que les écrans revenus avec une date l’avant-dernier mois ou ce mois-ci — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. Les deux mois ne se recouvrent pas : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursOffHint':
    'Le dépli ne montre que les écrans de l’avant-dernier mois et du mois en cours — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursOn':
    'Dépli resserré sur l’avant-dernier mois et le mois en cours — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursAucun':
    'aucun retour daté l’avant-dernier mois ni ce mois-ci',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursRepartis':
    'Avant-dernier mois : {a} écran(s) · mois en cours : {b} écran(s) — {n} en tout, les deux mois ne se recouvrant pas.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursFenetreAvantDernier':
    'avant-dernier mois',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursFenetreMoisEnCours':
    'mois en cours',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeNone':
    'Avant-dernier mois et mois en cours — le milieu du lot : aucun retour daté dans l’une ni dans l’autre fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeAvantDernier':
    'Avant-dernier mois — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeAvantDernierNone':
    'Avant-dernier mois — le milieu du lot : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeMoisEnCours':
    'Mois en cours — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeMoisEnCoursNone':
    'Mois en cours — le milieu du lot : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestre':
    'Mois dernier et trimestre en cours · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreHint':
    'Ne garder dans le dépli que les écrans revenus avec une date le mois dernier ou sur le trimestre en cours — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. Le mois dernier est déjà contenu dans le trimestre : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreOffHint':
    'Le dépli ne montre que les écrans du mois dernier et du trimestre en cours — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreOn':
    'Dépli resserré sur le mois dernier et le trimestre en cours — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreAucun':
    'aucun retour daté le mois dernier ni sur le trimestre en cours',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreRepartis':
    'Mois dernier : {a} écran(s) · trimestre en cours : {b} écran(s) — {n} en tout, le mois dernier déjà compté dans le trimestre.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFenetreMoisDernier':
    'mois dernier',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFenetreTrimestre':
    'trimestre en cours',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeNone':
    'Mois dernier et trimestre en cours — le milieu du lot : aucun retour daté dans l’une ni dans l’autre fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeMoisDernier':
    'Mois dernier — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeMoisDernierNone':
    'Mois dernier — le milieu du lot : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeTrimestre':
    'Trimestre en cours — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeTrimestreNone':
    'Trimestre en cours — le milieu du lot : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestre':
    'Année fermée et trimestre en cours · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur l’année fermée ou le trimestre en cours — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. Le mois dernier et l’avant-dernier tiennent dans les deux fenêtres : un écran déjà nommé n’y revient pas. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreOffHint':
    'Le dépli ne montre que les écrans de l’année fermée et du trimestre en cours — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreOn':
    'Dépli resserré sur l’année fermée et le trimestre en cours — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreAucun':
    'aucun retour daté sur l’année fermée ni le trimestre en cours',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreRepartis':
    'Année fermée : {a} écran(s) · trimestre en cours : {b} écran(s) — {n} en tout, un écran déjà nommé par l’année n’y revient pas.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFenetreAnnee':
    'année fermée',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFenetreTrimestre':
    'trimestre en cours',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeNone':
    'Année fermée et trimestre en cours — le milieu du lot : aucun retour daté dans l’une ni dans l’autre fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeAnnee':
    'Année fermée — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeAnneeNone':
    'Année fermée — le milieu du lot : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeTrimestre':
    'Trimestre en cours — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeTrimestreNone':
    'Trimestre en cours — le milieu du lot : aucun retour daté dans cette fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtAnnee':
    'Le milieu le plus court est celui de l’année fermée : {n} jour(s) — c’est elle qui ramène le plus vite.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtTrimestre':
    'Le milieu le plus court est celui du trimestre en cours : {n} jour(s) — c’est lui qui ramène le plus vite.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtEgal':
    'Les deux fenêtres ont le même milieu : {n} jour(s) de part et d’autre — aucune ne tranche.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeule':
    'Année fermée seule · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleHint':
    'Ne garder dans le dépli que les écrans nommés par l’année fermée et par aucun autre jeton de la série — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur dernier retrait et celui de leur retour : {detail}. Ni le mois en cours, ni le mois dernier, ni l’avant-dernier mois, ni le trimestre fermé, ni la semaine ne les nomment : c’est ce que l’année ajoute seule. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleOffHint':
    'Le dépli ne montre que les écrans que l’année fermée nomme seule — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleOn':
    'Dépli resserré sur ce que l’année fermée ajoute seule — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleAucun':
    'aucun écran que l’année fermée nomme seule',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleItem':
    '{ecran} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleRepartis':
    'Année fermée : {a} écran(s) nommé(s), aucun autre jeton de la série ne les retient — {n} en tout, ce que l’année ajoute seule.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleMediane':
    'Année fermée seule — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleMedianeNone':
    'Année fermée seule — aucun retour daté, le milieu du lot ne s’y lit pas.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeule':
    'Trimestre en cours seule · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleHint':
    'Ne garder dans le dépli que les écrans que le trimestre en cours nomme et que l’année fermée ne nomme pas — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur dernier retrait et celui de leur retour : {detail}. Ni l’année fermée ni son trimestre fermé ne les retiennent : c’est ce que le trimestre ajoute seul, à comparer à ce que l’année ajoute seule. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleOffHint':
    'Le dépli ne montre que ce que le trimestre en cours ajoute seul à côté de l’année fermée — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleOn':
    'Dépli resserré sur ce que le trimestre en cours ajoute seul — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleAucun':
    'aucun écran que le trimestre en cours nomme seul',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleItem':
    '{ecran} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleRepartis':
    'Trimestre en cours : {a} écran(s) nommé(s), l’année fermée ne les retient pas — {n} en tout, ce que le trimestre ajoute seul.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleMediane':
    'Trimestre en cours seule — le milieu du lot : {n} jour(s) pour {k} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleMedianeNone':
    'Trimestre en cours seule — aucun retour daté, le milieu du lot ne s’y lit pas.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtAnnee':
    'Le milieu le plus court est celui de l’année fermée seule : {n} jour(s) — c’est elle qui ramène le plus vite.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtTrimestre':
    'Le milieu le plus court est celui du trimestre en cours seul : {n} jour(s) — c’est lui qui ramène le plus vite.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtEgal':
    'Les deux milieux se valent : {n} jour(s) de part et d’autre — aucun des deux ne ramène plus vite que l’autre.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeule':
    'Année fermée et trimestre en cours seules · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleHint':
    'Ne garder dans le dépli que les deux additions côte à côte : les écrans que l’année fermée nomme seule — {a} —, puis ceux que le trimestre en cours ajoute seul — {b} —, chacun portant la fenêtre qui le tient, soit {n} sur {total} écran(s) reparti(s) : {detail}. La liste se prend sur les deux jetons, si bien qu’aucun écran ne s’y perd ni ne s’y compte deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleOffHint':
    'Le dépli montre les deux additions côte à côte — l’année fermée seule, puis le trimestre en cours seul —, {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleOn':
    'Dépli resserré sur les deux additions côte à côte — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleAucun':
    'ni l’année fermée ni le trimestre en cours n’ajoutent d’écran seul',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleRepartis':
    'Année fermée seule : {a} écran(s), {pa} % du carnet · trimestre en cours seule : {b} écran(s), {pb} % du carnet — {n} en tout, {pn} % du carnet, les deux additions côte à côte.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleFenetreAnnee':
    'année fermée seule',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleFenetreTrimestre':
    'trimestre en cours seule',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse':
    'Deux additions au-delà du milieu réuni · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseHint':
    'Ne garder dans le dépli, des deux additions réunies, que les écrans dont le délai dépasse le milieu du lot réuni — {n} sur {total} écran(s) reparti(s) —, chacun portant la fenêtre qui le tient, avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. Le milieu se prend sur les deux additions réunies, si bien que le partage ne peut pas contredire la liste qu’il sépare ; un lot vide ne se divise pas. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseOffHint':
    'Le dépli ne montre, des deux additions, que les écrans plus lents que le milieu du lot réuni — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseOn':
    'Dépli resserré sur les deux additions au-delà du milieu réuni — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseAucun':
    'aucun des deux ajouts ne dépasse le milieu du lot réuni',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour} · {jours} jour(s), au-delà du milieu',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepassePlusRapide':
    'Le retour le plus rapide du lot est « {ecran} », revenu en {n} jour(s) après un départ du {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepassePlusLent':
    'Le plus lent est « {ecran} », revenu en {n} jour(s) après un départ du {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseBoutsNone':
    'Aucun de ces écrans n’a encore de retour daté : ni le plus rapide ni le plus lent ne s’y nomment.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine':
    'Au-delà du milieu réuni, revenus cette semaine · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineHint':
    'Ne garder, parmi les écrans au-delà du milieu du lot réuni, que ceux dont le retour tombe dans la semaine en cours — {n} sur {total} écran(s) reparti(s) —, chacun portant la fenêtre qui le tient, avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. La liste se prend sur celle du jeton « au-delà du milieu réuni », si bien qu’elle ne peut pas la contredire : la fenêtre la plus proche dit ainsi ce qu’elle retient du lot. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineOffHint':
    'Le dépli ne montre, parmi les écrans au-delà du milieu réuni, que ceux revenus cette semaine — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineOn':
    'Dépli resserré sur les écrans au-delà du milieu réuni revenus cette semaine — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineAucun':
    'aucun écran au-delà du milieu réuni n’est revenu cette semaine',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemainePlusRecent':
    'L’écran revenu le plus récemment du lot est « {ecran} », revenu le {date} — {n} jour(s) après son départ.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemainePlusRecentNone':
    'Aucun écran du lot n’est revenu cette semaine : il n’y a pas de retour récent à nommer.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis':
    'Semaine et lot réuni · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisHint':
    'Ne garder dans le dépli que les écrans du lot au-delà du milieu réuni revenus cette semaine, puis le reste de ce lot — {n} sur {total} écran(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. Le milieu de la semaine est posé à côté de celui du lot réuni, si bien que la semaine se juge d’un mot. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisOffHint':
    'Le dépli montre la semaine et le reste du lot réuni — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisOn':
    'Dépli resserré sur la semaine et le lot réuni — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisAucun':
    'aucun écran à comparer pour l’instant',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour} · {jours} jour(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisFenetreSemaine':
    'la semaine en cours',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMediane':
    'La semaine ramène plus vite : {n} jour(s) au milieu de son lot de {k} retour(s) daté(s), contre {m} jour(s) pour le lot réuni ({j} retour(s)).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeLot':
    'Le lot réuni ramène plus vite : {m} jour(s) au milieu de son lot de {j} retour(s) daté(s), contre {n} jour(s) pour la semaine ({k} retour(s)).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeEgal':
    'La semaine et le lot réuni se valent : {n} jour(s) de part et d’autre, sur {k} retour(s) daté(s) pour la semaine et {j} pour le lot.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeSemaineVide':
    'La semaine ne retient aucun écran au-delà du milieu réuni : le lot réuni ramène en {m} jour(s), sur {j} retour(s) daté(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeNone':
    'Ni la semaine ni le lot réuni ne portent de retour daté : rien ne se compare encore.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisPlusLent':
    'L’écran le plus lent de la semaine est « {ecran} », revenu en {n} jour(s) le {date} — c’est lui qui retient le lot.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisPlusLentNone':
    'Aucun écran de la semaine n’est revenu au-delà du milieu réuni : il n’y a pas de plus lent à nommer.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide':
    'La semaine plus vite que le milieu réuni · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideHint':
    'Ne garder, parmi les écrans au-delà du milieu réuni revenus cette semaine, que ceux dont le délai est plus court que le milieu du lot réuni — {n} sur {total} écran(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. Le milieu de référence est celui du lot réuni, si bien que ce jeton ne peut pas le contredire. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideOffHint':
    'Le dépli ne montre que les écrans de la semaine revenus plus vite que le milieu du lot réuni — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideOn':
    'Dépli resserré sur la semaine plus vite que le milieu réuni — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideAucun':
    'aucun écran de la semaine ne revient plus vite que le milieu du lot réuni',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapidePlusRapide':
    'L’écran le plus rapide de la semaine est « {ecran} », revenu en {n} jour(s) le {date} — c’est lui qui devance le plus le milieu réuni.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapidePlusRapideNone':
    'Aucun écran de la semaine ne devance le milieu du lot réuni : il n’y a pas de plus rapide à nommer.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis':
    'Semaine rapide et reste du lot réuni · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisHint':
    'Réunir, dans le dépli, les écrans de la semaine revenus plus vite que le milieu du lot réuni et le reste de ce lot — {n} sur {total} écran(s) reparti(s) —, les plus vifs d’abord, puis les autres, chacun portant sa fenêtre, avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. Aucun écran n’y pèse deux fois, et le jeton de la semaine rapide garde le même lot. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisOffHint':
    'Le dépli ne montre que la semaine rapide et le reste du lot réuni — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisOn':
    'Dépli resserré sur la semaine rapide et le reste du lot réuni — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisAucun':
    'aucun écran de la semaine rapide ni du lot réuni',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisFenetreSemaineRapide':
    'semaine rapide',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisPlusRecent':
    'L’écran revenu le plus récemment du lot est « {ecran} », revenu le {date} — {n} jour(s) après son départ.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisPlusRecentNone':
    'Aucun écran du lot n’a encore daté de retour : le jeton ne nomme personne.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste':
    'Reste du lot réuni · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteHint':
    'Ne garder dans le dépli que les écrans du lot réuni que la semaine rapide ne nomme pas — {n} sur {total} écran(s) reparti(s) —, chacun portant la fenêtre qui le nomme, avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. Aucun écran n’y pèse deux fois, et le jeton de l’avance garde le même lot. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteOffHint':
    'Le dépli ne montre que le reste du lot réuni, la semaine rapide déjà lue — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteOn':
    'Dépli resserré sur le reste du lot réuni — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAucun':
    'aucun écran du lot réuni ne reste après la semaine rapide',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusAncien':
    'L’écran revenu le plus anciennement du lot est « {ecran} », revenu le {date} — {n} jour(s) après son départ.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusAncienNone':
    'Aucun écran du lot n’a encore daté de retour : le jeton ne nomme personne.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu':
    'Reste avant le milieu réuni · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuHint':
    'Ne garder, parmi les écrans du reste du lot réuni, que ceux revenus avant le milieu du lot réuni — {n} sur {total} écran(s) reparti(s) —, chacun portant la fenêtre qui le nomme, avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. Le milieu de référence est celui du lot réuni, si bien que ce jeton ne peut pas le contredire, et sa liste se prend sur celle du reste. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuOffHint':
    'Le dépli ne montre que les écrans du reste revenus avant le milieu du lot réuni — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuOn':
    'Dépli resserré sur le reste revenu avant le milieu réuni — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuAucun':
    'aucun écran du reste ne revient avant le milieu du lot réuni',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuPlusRapide':
    'L’écran le plus rapide du reste est « {ecran} », revenu en {n} jour(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuPlusRapideNone':
    'aucun écran du reste à nommer — le lot est vide',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis':
    'Reste réuni · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisHint':
    'Réunir les deux parts du reste du lot réuni — les écrans revenus avant le milieu, puis ceux qui le dépassent — pour les lire d’un même regard : {n} sur {total} écran(s) reparti(s), chacun portant la fenêtre qui le nomme, avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. Les deux parts se prennent sur la même liste du reste, si bien qu’aucun écran n’y pèse deux fois et qu’aucune ne peut contredire l’autre. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisOffHint':
    'Le dépli montre les deux parts du reste réunies — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisOn':
    'Dépli resserré sur le reste réuni — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisAucun':
    'aucun écran du reste à réunir — le lot est vide',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisFenetreAvant':
    'reste avant le milieu',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisFenetreApres':
    'reste après le milieu',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour} · {jours} jour(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusLent':
    'L’écran le plus lent du reste est « {ecran} », revenu le {date} — {n} jour(s) après son départ.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusLentNone':
    'Aucun écran du reste n’a encore daté de retour : le jeton ne nomme personne.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu':
    'Reste après le milieu réuni · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuHint':
    'Ne garder, parmi les écrans du reste du lot réuni, que ceux revenus après le milieu du lot réuni — {n} sur {total} écran(s) reparti(s) —, chacun portant la fenêtre qui le nomme, avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. La liste se prend sur celle du reste, et son complément — le reste avant le milieu — est déjà posé à côté, si bien qu’aucun écran ne s’y perd et qu’aucune des deux parts ne peut contredire l’autre. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuOffHint':
    'Le dépli ne montre que les écrans du reste revenus après le milieu du lot réuni — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuOn':
    'Dépli resserré sur le reste revenu après le milieu réuni — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuAucun':
    'aucun écran du reste ne revient après le milieu du lot réuni',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuPlusLent':
    'L’écran le plus lent du reste après le milieu est « {ecran} », revenu le {date} — {n} jour(s) après son départ.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis':
    'Reste avant, au milieu et après · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisHint':
    'Réunir, dans le dépli, les trois parts du reste du lot réuni — celles qui devancent le milieu, celles qui tombent dessus, puis celles qui le dépassent —, {n} sur {total} écran(s) reparti(s), chacune portant sa fenêtre, avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. Aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisOffHint':
    'Le dépli montre les trois parts du reste — {n} écran(s) sur {total} reparti(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisOn':
    'Dépli resserré sur les trois parts du reste — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisAucun':
    'aucun écran du reste à réunir — le reste du lot est vide',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisFenetreMilieu':
    'reste au milieu du lot réuni',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisMediane':
    'Le milieu du lot réuni se tient à {m} jour(s) : {a} écran(s) avant, {b} au milieu, {c} après.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisMedianeNone':
    'Le lot réuni ne porte aucun milieu : les trois parts ne se divisent pas.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisPlusRecent':
    'L’écran revenu au milieu exact du lot est « {ecran} », revenu le {date} — {n} jour(s) après son départ.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisPlusRecentNone':
    'Aucun écran du reste ne tombe exactement sur le milieu : personne n’y est nommé.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul':
    'Reste au milieu exact · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHint':
    'Ne garder dans le dépli que les écrans du reste revenus exactement au milieu du lot réuni — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulOffHint':
    'Le dépli ne montre que les écrans du reste revenus exactement au milieu — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulOn':
    'Dépli resserré sur le milieu exact du reste — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulAucun':
    'aucun écran du reste ne tombe exactement sur le milieu du lot réuni',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPlusLent':
    'L’écran du milieu exact qui a mis le plus de temps à y revenir est « {ecran} », revenu le {date} — {n} jour(s) après son départ.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPlusLentNone':
    'aucun écran du milieu exact à nommer — personne ne tombe dessus',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPhrase':
    'Parmi eux, {n} sur {total} sont revenus hors du mois en cours : {detail}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisNone':
    'aucun écran du milieu exact à nommer hors du mois — personne ne tombe dessus',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemaine':
    'Parmi eux, {n} sur {total} sont revenus hors de la semaine en cours : {detail}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemaineAucun':
    'Tous les écrans du milieu exact sont revenus dans la semaine en cours : aucun ne revient hors de sa fenêtre.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemaineNone':
    'aucun écran du milieu exact à nommer hors de la semaine — personne ne tombe dessus',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriode':
    'La période couverte par le milieu exact va du {ancien} au {recent} — {n} jour(s) entre son plus ancien retour et le plus récent.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriodeUnJour':
    'La période couverte par le milieu exact tient dans une seule journée, le {ancien} : son plus ancien retour et son plus récent tombent le même jour.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriodeNone':
    'aucune période à nommer — aucun écran du milieu exact ne porte de retour daté',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu':
    'Reste avant et au milieu · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuHint':
    'Ne garder dans le dépli que les deux parts du reste qui devancent le milieu ou tombent dessus — {n} sur {total} écran(s) reparti(s), l’après laissé dehors —, chacune portant la fenêtre qui la nomme, avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuOffHint':
    'Le dépli ne montre que les écrans du reste revenus avant le milieu ou exactement dessus — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuOn':
    'Dépli resserré sur le reste avant le milieu et dessus — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuAucun':
    'aucun écran du reste ne devance le milieu ni ne tombe dessus',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuMediane':
    'Le milieu commun des deux parts réunies est de {n} jour(s) sur {k} retour(s) daté(s) · celui du lot réuni, à côté : {l} jour(s) sur {m} retour(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuMedianeNone':
    'Aucune des deux parts réunies ne porte de retour daté : aucun milieu n’est nommé, le lot réuni se lit seul.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine':
    'Reste avant le milieu de la semaine · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineHint':
    'Ne garder dans le dépli que les écrans du reste revenus avant le milieu du lot réuni dont le retour tombe cette semaine — {n} sur {total} écran(s) reparti(s) —, chacun avec sa fenêtre, le jour de son dernier retrait, celui de son retour et son délai : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineOffHint':
    'Le dépli ne montre que les écrans du reste revenus avant le milieu cette semaine — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineOn':
    'Dépli resserré sur le reste avant le milieu, revenu cette semaine — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineAucun':
    'aucun écran du reste n’est revenu avant le milieu cette semaine',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemainePlusLent':
    'L’écran du reste revenu avant le milieu cette semaine qui a mis le plus de temps à revenir est « {ecran} », revenu le {date} — {n} jour(s) après son départ.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemainePlusLentNone':
    'Aucun écran du reste n’est revenu avant le milieu cette semaine : aucun écran n’est nommé.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu':
    'Reste avant le milieu de la semaine et au milieu · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuHint':
    'Ne garder dans le dépli que les écrans du reste revenus avant le milieu cette semaine, puis ceux qui tombent exactement sur le milieu du lot réuni — {n} sur {total} écran(s) reparti(s) —, chacun avec la fenêtre qui le nomme, le jour de son dernier retrait, celui de son retour et son délai : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuOffHint':
    'Le dépli ne montre que les écrans du reste revenus avant le milieu cette semaine et ceux du milieu exact — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuOn':
    'Dépli resserré sur le reste avant le milieu de la semaine et le milieu exact — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuAucun':
    'aucun écran du reste n’est revenu avant le milieu cette semaine, et personne ne tombe sur le milieu exact',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuMediane':
    'Le milieu commun des deux parts réunies est de {n} jour(s) sur {k} retour(s) daté(s) · celui du lot réuni, à côté : {l} jour(s) sur {m} retour(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuMedianeNone':
    'Aucune des deux parts réunies ne porte de retour daté : aucun milieu n’est nommé, le lot réuni se lit seul.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine':
    'Reste au milieu exact de la semaine · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineHint':
    'Ne garder dans le dépli que les écrans du reste tombés exactement sur le milieu du lot réuni dont le retour tombe cette semaine — {n} sur {total} écran(s) reparti(s) —, chacun avec la fenêtre qui le nomme, le jour de son dernier retrait, celui de son retour et son délai : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineOffHint':
    'Le dépli ne montre que les écrans du reste tombés exactement sur le milieu, revenus cette semaine — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineOn':
    'Dépli resserré sur le milieu exact, revenu cette semaine — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineAucun':
    'aucun écran du reste n’est tombé exactement sur le milieu et revenu cette semaine',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusLent':
    'Celui qui a mis le plus de temps à revenir est « {ecran} », revenu le {date} — {n} jour(s) après son départ.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusLentNone':
    'Aucun écran du milieu exact n’est revenu cette semaine : il n’y a personne à nommer.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusRecent':
    'Celui qui est revenu le plus récemment est « {ecran} », revenu le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusRecentNone':
    'Aucun écran du milieu exact n’est revenu cette semaine : il n’y a personne à nommer.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste':
    'Milieu exact de la semaine et le reste du milieu exact · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteHint':
    'Ne garder dans le dépli que les écrans du milieu exact du lot réuni : ceux revenus cette semaine d’abord — {n} sur {total} écran(s) —, puis ceux du milieu exact restés hors de la semaine, chacun avec la fenêtre qui le nomme, le jour de son dernier retrait, celui de son retour et son délai : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteOffHint':
    'Le dépli ne montre que le milieu exact du lot réuni, la semaine et le reste hors semaine côte à côte — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteOn':
    'Dépli resserré sur le milieu exact, la semaine et le reste hors semaine — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteAucun':
    'aucun écran du reste ne tombe exactement sur le milieu du lot réuni, ni cette semaine ni hors de la semaine',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteFenetreSemaine':
    'cette semaine',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteFenetreReste':
    'hors de la semaine',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour} · {jours} jour(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteMediane':
    'Le milieu commun des deux parts réunies est de {n} jour(s) sur {k} retour(s) daté(s) · celui du milieu exact, à côté : {l} jour(s) sur {m} retour(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteMedianeNone':
    'Aucune des deux parts réunies ne porte de retour daté : aucun milieu n’est nommé, le milieu exact se lit seul.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtRestePlusAncien':
    'Celui qui est revenu le plus anciennement parmi ceux restés hors de la semaine est « {ecran} », revenu le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtRestePlusAncienNone':
    'Aucun écran du milieu exact n’est resté hors de la semaine : il n’y a personne à nommer.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois':
    'Milieu exact du reste, revenu ce mois-ci · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisHint':
    'Ne garder dans le dépli que les écrans du reste tombés exactement sur le milieu du lot réuni dont le retour tombe ce mois-ci — {n} sur {total} écran(s) reparti(s) —, chacun avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisOffHint':
    'Le dépli ne montre que les écrans du milieu exact revenus ce mois-ci — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisOn':
    'Dépli resserré sur le milieu exact, revenu ce mois-ci — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisAucun':
    'aucun écran du milieu exact n’est revenu ce mois-ci',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisItem':
    '{ecran} · ce mois-ci · parti le {date} · revenu le {retour} · {jours} jour(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisSemaineMois':
    'La semaine en retient {n} sur {total} écran(s) du milieu exact · le mois en retient {m} — la même part se compare d’une fenêtre à l’autre.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisSemaineMoisNone':
    'Aucun écran ne tombe exactement sur le milieu du lot réuni : la semaine et le mois n’ont rien à comparer.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisPlusTot':
    'Celui qui est revenu le plus tôt ce mois-ci est « {ecran} », revenu le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisPlusTotNone':
    'Aucun écran du milieu exact n’est revenu ce mois-ci : il n’y a personne à nommer.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste':
    'Milieu exact du mois et le reste du milieu exact · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteHint':
    'Ne garder dans le dépli que les écrans du milieu exact du lot réuni : ceux revenus ce mois-ci d’abord — {n} sur {total} écran(s) —, puis ceux du milieu exact restés hors du mois, chacun avec la fenêtre qui le nomme, le jour de son dernier retrait, celui de son retour et son délai : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteOffHint':
    'Le dépli ne montre que le milieu exact du lot réuni, le mois et le reste hors mois côte à côte — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteOn':
    'Dépli resserré sur le milieu exact, le mois et le reste hors mois — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteAucun':
    'aucun écran du reste ne tombe exactement sur le milieu du lot réuni, ni ce mois-ci ni hors du mois',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteFenetreMois':
    'ce mois-ci',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteFenetreReste':
    'hors du mois',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour} · {jours} jour(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMediane':
    'Le milieu commun des deux parts réunies est de {n} jour(s) sur {k} retour(s) daté(s) · celui du milieu exact du mois, à côté : {l} jour(s) sur {m} retour(s) · {sens}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianeNone':
    'Aucune des deux parts réunies ne porte de retour daté : aucun milieu n’est nommé, le milieu exact du mois se lit seul.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianePareil':
    'les deux milieux se valent, la comparaison ne départage rien',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianePlus':
    'le milieu commun se tient au-dessus de celui du mois, les deux parts réunies ramènent donc plus lentement',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianeMoins':
    'le milieu commun se tient sous celui du mois, les deux parts réunies ramènent donc plus vite',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois':
    'Milieu exact revenu hors du mois · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisHint':
    'Ne garder dans le dépli que les écrans du milieu exact du lot réuni dont le retour tombe hors du mois en cours — {n} sur {total} écran(s) —, chacun avec le jour de son dernier retrait, celui de son retour et son délai : {detail}. C’est le complément exact de la part du mois, pris sur la même liste du milieu exact : aucun écran ne s’y perd, aucun n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisOffHint':
    'Le dépli ne montre que le milieu exact resté hors du mois — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisOn':
    'Dépli resserré sur le milieu exact revenu hors du mois — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisAucun':
    'aucun écran du milieu exact n’est resté hors du mois en cours',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisItem':
    '{ecran} · parti le {date} · revenu le {retour} · {jours} jour(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisMediane':
    'Le milieu de la part restée hors du mois est de {n} jour(s) sur {k} retour(s) daté(s) · celui de la part du mois, à côté : {l} jour(s) sur {m} retour(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisMedianeNone':
    'Aucun des deux côté du milieu exact ne porte de retour daté : aucun milieu n’est nommé, les deux parts se lisent sans chiffre.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPlusAncien':
    'Celui qui est revenu le plus anciennement hors du mois est « {ecran} », revenu le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPlusAncienNone':
    'Aucun écran du milieu exact n’est resté hors du mois : il n’y a personne à nommer.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine':
    'Milieu exact de la semaine et hors du mois réunis · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineHint':
    'Réunir dans le dépli les écrans du milieu exact revenus cette semaine et ceux restés hors du mois en cours — {n} sur {total} écran(s) —, chacun avec la fenêtre qui le nomme, le jour de son dernier retrait, celui de son retour et son délai : {detail}. Les trois fenêtres se lisent alors d’un même regard : la semaine, le mois, et le dehors du mois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineOffHint':
    'Le dépli montre le milieu exact de la semaine et celui resté hors du mois — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineOn':
    'Dépli resserré sur le milieu exact de la semaine et hors du mois — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineAucun':
    'aucun écran du milieu exact n’est revenu cette semaine ni resté hors du mois',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour} · {jours} jour(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineFenetreSemaine':
    'semaine',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineFenetreHorsMois':
    'hors du mois',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineParts':
    'semaine : {a} écran(s), milieu {b} · reste hors du mois : {c} écran(s), milieu {d}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePartMediane':
    '{n} jour(s) sur {k} retour(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePartMedianeNone':
    'aucun retour daté',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMediane':
    'Le milieu commun des deux parts réunies est de {n} jour(s) sur {k} retour(s) · celui du milieu exact du mois, à côté : {l} jour(s) sur {m} retour(s) · {sens}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianeNone':
    'Aucune des parts réunies ne porte de retour daté : aucun milieu n’est nommé, les trois fenêtres se lisent sans chiffre.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianePareil':
    'les deux milieux se valent, la comparaison ne départage rien',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianePlus':
    'le milieu commun se tient au-dessus de celui du mois, les deux parts réunies ramènent donc plus lentement',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianeMoins':
    'le milieu commun se tient sous celui du mois, les deux parts réunies ramènent donc plus vite',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusLent':
    'Celui qui revient le plus lentement parmi les deux parts réunies est « {ecran} », revenu le {date}, après {n} jour(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusLentNone':
    'Aucune des deux parts réunies ne porte de retour daté : il n’y a personne à nommer.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusRapide':
    'Celui qui revient le plus rapidement parmi les deux parts réunies est « {ecran} », revenu le {date}, après {n} jour(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusRapideNone':
    'Aucune des deux parts réunies ne porte de retour daté : personne ne devance l’autre.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecent':
    'Celui qui est revenu le plus récemment parmi ceux restés hors du mois est « {ecran} », revenu le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentNone':
    'Aucun écran du milieu exact n’est resté hors du mois : il n’y a personne à nommer.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentMois':
    'Celui qui est revenu le plus récemment parmi ceux de la part du mois est « {ecran} », revenu le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentMoisNone':
    'Aucun écran du milieu exact n’est revenu ce mois-ci : il n’y a personne à nommer de ce côté.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotes':
    'Les deux côtés se recoupent sur {n} écran(s) du jeton : revenus cette semaine sans tomber dans le mois, ils portent la part de la semaine et celle du dehors à la fois — {k} écran(s) au total, chacun compté une seule fois.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesNone':
    'Aucun écran ne tombe des deux côtés à la fois : chaque part du jeton se lit seule.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePart':
    'Parmi les {k} écran(s) du jeton, {n} ne portent qu’une seule part — ni la semaine et le dehors ensemble : {detail}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartNone':
    'Chaque écran du jeton porte les deux parts à la fois : aucun ne se lit d’un seul côté.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartPlusAncien':
    'Celui qui porte une seule part depuis le plus longtemps est « {ecran} », revenu le {date} — {n} jour(s) déjà.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartPlusAncienNone':
    'Aucun écran ne porte une seule part : il n’y a personne à nommer.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesDelai':
    'Le délai moyen entre les deux parts réunies est de {n} jour(s) sur {k} écran(s) — le plus court : « {court} », {jc} jour(s) ; le plus long : « {long} », {jl} jour(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesDelaiNone':
    'Les deux parts ne se recoupent sur aucun écran : aucun délai moyen à lire.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisMediane':
    'Le milieu de la semaine rapide est de {n} jour(s) sur {k} retour(s) · celui du reste, à côté : {m} jour(s) sur {j} retour(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisMedianeNone':
    'Ni la semaine rapide ni le reste ne portent de délai : aucun des deux milieux ne se lit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuPlusLentNone':
    'aucun écran du reste après le milieu à nommer — le lot est vide',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierFenetreMoisEnCours':
    'mois en cours',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierFenetreMoisDernier':
    'mois dernier',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMois':
    'Année fermée et avant-dernier mois · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur l’année fermée ou l’avant-dernier mois — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. L’avant-dernier mois est déjà compté dans l’année fermée : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisOffHint':
    'Le dépli ne montre que les écrans de l’année fermée et de l’avant-dernier mois — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisOn':
    'Dépli resserré sur l’année fermée et l’avant-dernier mois — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisAucun':
    'aucun retour daté sur l’année fermée ni l’avant-dernier mois',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisRepartis':
    'Avant-dernier mois : {a} écran(s) · année fermée : {b} écran(s) — {n} en tout, l’avant-dernier mois étant déjà compté dans l’année fermée.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisFenetreAvantDernier':
    'avant-dernier mois',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisFenetreAnnee':
    'année fermée',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAvantDernier':
    'Avant-dernier mois — le plus court « {ecran} », revenu en {n} jour(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAvantDernierNone':
    'Avant-dernier mois — aucun retour daté.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAnnee':
    'Année fermée — le plus court « {ecran} », revenu en {n} jour(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAnneeNone':
    'Année fermée — aucun retour daté.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtNone':
    'Aucune des deux fenêtres ne porte de retour daté : les deux lots ne nomment personne.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMois':
    'Trimestre fermé et avant-dernier mois · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisHint':
    'Ne garder dans le dépli que les écrans revenus avec une date sur le trimestre fermé ou l’avant-dernier mois — {n} sur {total} écran(s) reparti(s) —, chacun portant sa fenêtre, avec le jour de son dernier retrait et celui de son retour : {detail}. L’avant-dernier mois est déjà compté dans le trimestre fermé : aucun écran n’y pèse deux fois. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisOffHint':
    'Le dépli ne montre que les écrans du trimestre fermé et de l’avant-dernier mois — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisOn':
    'Dépli resserré sur le trimestre fermé et l’avant-dernier mois — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisAucun':
    'aucun retour daté sur le trimestre fermé ni l’avant-dernier mois',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisItem':
    '{ecran} · {fenetre} · parti le {date} · revenu le {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisRepartis':
    'Trimestre fermé : {a} écran(s) · avant-dernier mois : {b} écran(s) — {n} en tout, l’avant-dernier mois étant déjà compté dans le trimestre fermé.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisFenetreTrimestre':
    'trimestre fermé',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisFenetreAvantDernier':
    'avant-dernier mois',
  'ad.suivi.doorOublisEcransRetoursDatesAnnee': 'Retours datés de l’année · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeHint':
    'Ne garder dans le dépli que les écrans revenus sur les douze derniers mois avec une date — {n} sur {total} écran(s) reparti(s) —, avec le jour de leur dernier retrait et celui de leur retour : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeOffHint':
    'Le dépli ne montre que les écrans revenus sur les douze derniers mois avec une date — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeOn':
    'Dépli resserré sur les écrans revenus sur les douze derniers mois avec une date — {n} sur {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeAucun':
    'aucun écran revenu avec une date sur les douze derniers mois',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneePlusCourt':
    'Le délai le plus court du lot est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneePlusLong':
    'Le plus long est « {ecran} », revenu en {n} journée(s) le {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeBoutsNone':
    'Aucun retour daté sur les douze derniers mois : le lot ne nomme personne.',
  'ad.suivi.doorOublisEcransRepartisHierHint':
    'Ne garder dans le dépli que les écrans revenus au carnet puis repartis dont le dernier retrait tombe la veille — {n} sur {total} écran(s) reparti(s), avec le jour de ce retrait : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisHierOffHint':
    'Le dépli ne montre que les écrans repartis la veille — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisHierOn':
    'Dépli resserré sur les écrans repartis hier — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisHierAucun': 'aucun écran reparti hier',
  'ad.suivi.doorOublisEcransRepartisHierEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRepartisJour': 'Repartis aujourd’hui · {n}',
  'ad.suivi.doorOublisEcransRepartisJourHint':
    'Ne garder dans le dépli que les écrans revenus au carnet puis repartis dont le dernier retrait tombe aujourd’hui — {n} sur {total} écran(s) reparti(s), avec le jour de ce retrait : {detail}. Il ne retire aucun oubli ; un second appui rend tous les écrans.',
  'ad.suivi.doorOublisEcransRepartisJourOffHint':
    'Le dépli ne montre que les écrans repartis aujourd’hui — {n} sur {total} écran(s) : {detail}. Un appui rend tous les écrans, sans retirer aucun oubli.',
  'ad.suivi.doorOublisEcransRepartisJourOn':
    'Dépli resserré sur les écrans repartis aujourd’hui — {n} sur {total}',
  'ad.suivi.doorOublisEcransRepartisJourAucun': 'aucun écran reparti aujourd’hui',
  'ad.suivi.doorOublisEcransRepartisJourEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransRepartisVieuxEcartes':
    'Il écarte {n} ligne(s) du dépli de la vue, sur {total} écran(s) reparti(s).',
  'ad.suivi.doorOublisEcransJetonsClear': 'Rendre tous les écrans',
  'ad.suivi.doorOublisEcransJetonsClearRendues':
    'Elle rendra {rendues} ligne(s) du dépli à la vue, sur {total} au carnet.',
  'ad.suivi.doorOublisEcransJetonsClearRenduesNone':
    'Toutes les lignes du dépli sont déjà à la vue : elle n’en rendra aucune.',
  'ad.suivi.doorOublisEcransJetonsClearHint':
    'Éteint les {n} jeton(s) du dépli d’un seul geste et rend tous les écrans — {total} au carnet —, sans retirer un seul oubli : le compte, les lignes et les jetons du carnet restent tels quels.',
  'ad.suivi.doorOublisEcransJetonsClearEach':
    'Jeton par jeton, ce que chacun retient : {detail}. La gomme les éteint tous d’un geste ; un second appui sur un seul jeton le lève sans toucher aux autres.',
  'ad.suivi.doorOublisEcransJetonsCleared':
    '{jetons} jeton(s) du dépli éteint(s) : les {n} écran(s) du carnet reviennent, aucun oubli n’est retiré.',
  'ad.suivi.doorOublisCsvRetourMoyenne':
    'Écarts de retour : {n} jour(s) en moyenne, écran par écran, sur {k} écran(s) revenu(s).',
  'ad.suivi.doorOublisCsvRetourMoyenneOne':
    'Écarts de retour : un seul écran revenu, {n} jour(s) retenu(s) — la moyenne ne dit rien de plus.',
  'ad.suivi.doorOublisCsvRetourMoyenneNone':
    'Écarts de retour : aucun retour daté sur cet appareil, la moyenne ne s’y lit pas encore.',
  'ad.suivi.doorOublisCsvRepartisMoyenne':
    'Jours passés au carnet avant de repartir : {n} jour(s) en moyenne, écran par écran, sur {k} écran(s) reparti(s).',
  'ad.suivi.doorOublisCsvRepartisMoyenneOne':
    'Jours passés au carnet avant de repartir : un seul écran reparti, {n} jour(s) retenu(s) — la moyenne ne dit rien de plus.',
  'ad.suivi.doorOublisCsvRepartisMoyenneNone':
    'Jours passés au carnet avant de repartir : aucun départ daté sur cet appareil, la moyenne ne s’y lit pas encore.',
  'ad.suivi.doorOublisEcranReparti': 'retiré de nouveau le {date}',
  'ad.suivi.doorOublisCsvRetiresSpan':
    'Écrans retirés par leur nom : {n} jour(s) séparent le premier retrait, le {ancien}, du dernier, le {recent}.',
  'ad.suivi.doorOublisCsvRetiresSpanOne':
    'Écrans retirés par leur nom : un seul retrait est retenu, le {date} — aucun écart de jours ne s’y lit.',
  'ad.suivi.doorOublisCsvRetiresSpanNone':
    'Écrans retirés par leur nom : aucun retrait retenu sur cet appareil, l’écart ne s’y lit pas encore.',
  'ad.suivi.doorOublisEcranClear': 'Rendre tous les écrans',
  'ad.suivi.doorOublisEcranCleared':
    'Écran « {ecran} » rendu : ses gestes reviennent parmi les {n} écran(s) du carnet, qui garde tous ses gestes.',
  'ad.suivi.doorOublisTriEcranCleared':
    'Ordre du plus récent rendu : les {n} écran(s) ne sont plus groupés, le carnet garde tous ses gestes.',
  'ad.suivi.doorOublisSemaineNom': 'Cette semaine',
  'ad.suivi.doorOublisJetonsItem': '{nom} · {masques} geste(s) hors de la vue',
  'ad.suivi.doorOublisJetonsClearHintDetail':
    'Éteint les {n} jeton(s) posés sur le carnet d’un seul geste et rend la liste entière. Chacun retirait de la vue : {detail}. Aucun oubli n’est retiré, le compte du carnet ne bouge pas.',
  'ad.suivi.doorOublisLineClear': 'Retirer ce geste du carnet',
  'ad.suivi.doorOublisLineClearHint':
    'Retirer du carnet l’oubli de la porte « {ecran} », daté du {date} : la visite retenue reste sur cet appareil, le plan aussi.',
  'ad.suivi.doorOublisLineCleared':
    'Oubli de « {ecran} » retiré du carnet : la visite retenue reste sur cet appareil, le plan aussi.',
  'ad.suivi.doorOublisParChantierHint':
    'Les visites du carnet rangées par chantier du plan, la plus fournie en tête : où les oublis se sont concentrés, lu sur la même mémoire d’appareil.',
  'ad.suivi.doorOublisChantierItem': '{nom} · {n}',
  'ad.suivi.doorOublisChantierAucun': 'hors chantier',
  'ad.suivi.doorOublisClear': 'Rendre le carnet à zéro',
  'ad.suivi.doorOublisClearHint':
    'Remettre le carnet des oublis à zéro — ses {n} visite(s), son dernier jour et ses lignes de CSV —, sans toucher aux visites retenues : les repères « déjà empruntée » et le plan restent tels quels.',
  'ad.suivi.doorOublisCleared':
    'Carnet des oublis rendu à zéro : les visites retenues restent sur cet appareil, le plan aussi.',
  'ad.suivi.chantierVues': '{n} porte(s) empruntée(s) sur {total}',
  'ad.suivi.chantierVuesAucune': 'aucune porte empruntée depuis cet appareil',
  'ad.suivi.chantierVuesHint': 'Les portes de ce chantier déjà empruntées depuis cet appareil : {detail}',
  'ad.suivi.chantierVuesClear': 'Oublier les visites de ce chantier',
  'ad.suivi.chantierVuesClearHint':
    'Effacer de cet appareil les {n} visite(s) des portes de « {chantier} » : leurs repères repassent à ouvrir, {autres} visite(s) d’autres portes restent sur cet appareil, et le plan ne bouge pas.',
  'ad.suivi.chantierVuesCleared':
    '{n} visite(s) du chantier « {chantier} » oubliée(s) sur cet appareil : ses portes repassent à ouvrir.',
  'ad.suivi.doorUsed': 'déjà empruntée',
  'ad.suivi.doorUsedHint': 'Cette porte a déjà été empruntée depuis cet appareil, le {date}.',
  'ad.suivi.doorUsedClear': 'Oublier la visite',
  'ad.suivi.doorUsedClearHint': 'Effacer de cet appareil la visite de la porte « {ecran} » : le repère repasse à ouvrir, le plan et les autres portes restent intacts.',
  'ad.suivi.doorUsedCleared': 'Visite de « {ecran} » oubliée sur cet appareil : la porte repasse à ouvrir.',
  'ad.suivi.doorTodo': 'à ouvrir',
  'ad.suivi.doorTodoHint': 'Cette porte n’a pas encore été empruntée depuis cet appareil : elle reste à ouvrir.',
  'ad.suivi.mailDoorScreen': 'Ouvrir l’écran « {ecran} » des Paramètres, droit sur son bloc.',
  'ad.suivi.resteTitle': 'Ce qui reste à faire',
  'ad.suivi.resteNote': '{n} point(s) encore ouvert(s)',
  'ad.suivi.phasesTitle': 'Le plan de développement',
  'ad.suivi.phase': 'Phase',
  'ad.suivi.etatFait': 'Terminée',
  'ad.suivi.etatEncours': 'En cours',
  'ad.suivi.etatAvenir': 'À venir',
  'ad.suivi.blocagesTitle': 'Points de blocage',
  'ad.suivi.blocOuvert': 'Ouvert',
  'ad.suivi.blocAttente': 'Action extérieure',
  'ad.suivi.blocLeve': 'Levé',
  'ad.suivi.telecharger': 'Télécharger le plan',
  'ad.suivi.telechargerHint':
    'Télécharge le fichier de pilotage en texte, daté de sa version, pour l’archiver à chaque mise à jour.',
  'ad.suivi.telecharge': 'Plan téléchargé',
  'ad.suivi.lastDownload': 'Dernier téléchargement · {date}',
  'ad.suivi.lastNone': 'Jamais téléchargé',
  'ad.suivi.lastHint':
    'Date du dernier téléchargement de cette archive sur cet appareil : elle dit quand la pièce est partie la dernière fois.',
  'ad.suivi.lastNoneHint':
    'Aucune archive téléchargée depuis cet appareil pour l’instant.',
  'ad.suivi.lastClear': 'Effacer la mémoire',
  'ad.suivi.lastClearHint':
    'Efface les dates de téléchargement retenues sur cet appareil ; les fichiers déjà partis ne bougent pas.',
  'ad.suivi.lastClearConfirm': 'Confirmer l’effacement',
  'ad.suivi.lastClearConfirmHint':
    'Un second clic efface la mémoire des téléchargements. Un nouvel envoi la réécrira.',
  'ad.suivi.chantierClear': 'Effacer la date de cette archive',
  'ad.suivi.chantierClearHint':
    'Dernier téléchargement · {date} — cliquer pour effacer la mémoire de cette seule archive.',
  'ad.suivi.chantierClearConfirm': 'Confirmer l’effacement',
  'ad.suivi.chantierClearConfirmHint':
    'Un second clic efface la date de cette archive ; celles des autres archives et les fichiers déjà partis ne bougent pas.',
  'ad.suivi.archivesJamais': 'Archives jamais emportées {n} / {total}',
  'ad.suivi.archivesJamaisHint':
    'Pièces encore à joindre : {noms}',
  'ad.suivi.archivesJamaisOk':
    'Les quatre archives sont déjà parties de cet appareil : plus rien à joindre.',
  'ad.suivi.archivesJamaisDerniere': 'Dernière partie le {date}',
  'ad.suivi.archivesJamaisAucune': 'Aucune archive partie',
  'ad.suivi.archivesJamaisListShow':
    'Voir les pièces encore à joindre, numérotées dans l’ordre où elles partent',
  'ad.suivi.archivesJamaisListHide': 'Replier la liste des pièces à joindre',
  'ad.suivi.archivesJamaisItemHint': 'À joindre en {n} — {nom}',
  'ad.suivi.archivesJamaisItemTelecharger':
    'Télécharger l’archive de « {nom} » — la pièce à joindre en {n}',
  'ad.suivi.archivesJamaisPieceOk':
    'Archive de « {nom} » téléchargée — la pièce quitte la liste des archives à joindre.',
  'ad.p.mail.testOld':
    'La dernière preuve a plus d’un mois : renvoyez un test pour la rafraîchir.',
  'ad.p.mail.testAt':
    'Dernier test reçu le {date} · {age} — envoyer un test pour renouveler la preuve.',
  'ad.p.mail.testOldAt':
    'Dernier test reçu le {date} · {age} — plus d’un mois : renvoyez un test pour la rafraîchir.',
  'ad.suivi.note':
    'Ce panneau lit le fichier de pilotage du projet : le pourcentage est la moyenne pondérée des modules, il se recalcule à chaque mise à jour du document. Le contenu du plan reste en français — c’est la langue du document de travail.',
};

const ar: Dict = {
  'ad.stamp': 'لوحة التحكم',
  'ad.title': 'إدارة الموقع',
  'ad.lede': 'المشتركون والإعلانات والرسائل والإعدادات — في مكان واحد، على بيانات الموقع الحقيقية.',
  'ad.back': 'العودة إلى الموقع',
  'ad.signout': 'تسجيل الخروج',
  'ad.signedAs': 'متصل بصفة',
  'ad.loading': 'جارٍ تحميل لوحة التحكم…',
  'ad.error': 'تعذّر تحميل بيانات لوحة التحكم.',
  'ad.retry': 'إعادة المحاولة',
  'ad.refresh': 'تحديث',
  'ad.denied.title': 'الدخول مقصور على الإدارة',
  'ad.denied.body': 'تُفتح لوحة التحكم بحساب مالك الموقع فقط. سجّل الدخول بالعنوان المسموح.',
  'ad.denied.cta': 'فتح صفحة الدخول',
  'ad.tab.clients': 'مشتركون',
  'ad.tab.paiements': 'الدفع',
  'ad.tab.annonces': 'إعلانات',
  'ad.tab.messages': 'رسائل',
  'ad.tab.journal': 'السجل',
  'ad.tab.suivi': 'المتابعة',
  'ad.tab.params': 'إعدادات',
  'ad.stat.abo': 'اشتراكات',
  'ad.stat.actifs': 'نشطة',
  'ad.stat.essai': 'تجريبية',
  'ad.stat.mrr': 'الإيراد الشهري',
  'ad.stat.comptes': 'حسابات',
  'ad.stat.apresRelance': 'حسابات بعد تذكير',
  'ad.stat.apresRelanceHint':
    'حسابات وصل أحد إيداعاتها على الأقل بعد التذكير المحضّر، المقروء من ذاكرة هذا الجهاز.',
  'ad.stat.silencieux': 'حسابات صامتة',
  'ad.stat.annonces': 'إعلانات',
  'ad.stat.fils': 'محادثات مفتوحة',

  'ad.clients.stamp': 'المشتركون',
  'ad.clients.sub': 'كل اشتراك كما هو مسجّل: الصيغة والمبلغ والأجل ووسيلة الدفع.',
  'ad.clients.search': 'ابحث عن مؤسسة أو بريد أو مدينة…',
  'ad.clients.allStatus': 'كل الحالات',
  'ad.clients.empty': 'لا يوجد اشتراك مسجّل بعد.',
  'ad.clients.none': 'لا اشتراك يطابق هذا البحث.',
  'ad.clients.entreprise': 'المؤسسة',
  'ad.clients.offre': 'الصيغة',
  'ad.clients.statut': 'الحالة',
  'ad.clients.montant': 'المبلغ / شهر',
  'ad.clients.cardMontant': 'المبلغ',
  'ad.clients.cardSleep': 'نائمة',
  'ad.clients.cardEtabs': 'المواقع',
  'ad.clients.echeance': 'الأجل',
  'ad.clients.canal': 'الدفع',
  'ad.clients.depuis': 'منذ',
  'ad.clients.comptes': 'حسابات الموقع',
  'ad.clients.comptesSub': 'الحسابات المفتوحة مع صيغتها وعدد مؤسساتها.',
  'ad.clients.adminMark': 'مسؤول',
  'ad.clients.adminMarkHint':
    'هذا الحساب يستطيع فتح لوحة التحكم: دوره يقول ذلك، واللوحة تفتح له بعنوانه الخاص.',
  'ad.clients.adminNoEtabsHint':
    'حساب الإدارة ليس مؤسسة: هذا العمود لا يحصي شيئًا له.',
  'ad.clients.comptesAdminChip': 'المسؤولون',
  'ad.clients.comptesAdminHint':
    'لا يُبقي إلا الحسابات التي تستطيع فتح لوحة التحكم — بدور المسؤول أو بعنوان الإدارة؛ ونقرة ثانية تعيد القائمة كاملة.',
  'ad.clients.comptesAdminEmpty':
    'لا حساب مسؤول في هذه القائمة: تبقى لوحة التحكم مفتوحة للحساب الذي يديرها وحده.',
  'ad.clients.comptesAdminCount': '{n} مسؤول',
  'ad.clients.comptesAdminCountHint':
    'عدد الحسابات التي تستطيع فتح لوحة التحكم، محسوبًا على أسطر الجدول نفسها. نقرة تُضيِّق الجدول على هذه الحسابات، ونقرة ثانية تعيده كاملًا.',
  'ad.clients.adminStaleMark': 'بحاجة إلى مراجعة',
  'ad.clients.adminStaleHint':
    'رُقّي مسؤولًا منذ {n} شهرًا، في {date}: هذا الدور يستدعي مراجعة — هل ما زال الوصول مرغوبًا؟',
  'ad.clients.adminStaleOpen':
    'فتح بطاقة هذا الحساب على سطر دوره، لقراءة قدم الترقية من جديد.',
  'ad.clients.adminStaleChip': 'ترقيات بحاجة إلى مراجعة',
  'ad.clients.adminStaleHintChip':
    'لا يُبقي إلا الحسابات التي رُقّيت مسؤولة منذ أكثر من ستة أشهر؛ ونقرة ثانية تعيد الجدول كاملًا.',
  'ad.clients.adminStaleEmpty':
    'لا ترقية قديمة أكثر من ستة أشهر بحاجة إلى مراجعة: أدوار المسؤولين حديثة.',
  'ad.clients.adminNoDateChip': 'ترقيات بلا تاريخ',
  'ad.clients.adminNoDateHint':
    'لا يُبقي إلا الحسابات المسؤولة التي لم يُدوَّن تاريخ ترقيتها قط: تاريخها ما زال بحاجة إلى استكمال. ونقرة ثانية تعيد الجدول كاملًا.',
  'ad.clients.adminNoDateEmpty':
    'لا ترقية بلا تاريخ: كل دور مسؤول يحمل تاريخ ترقيته.',
  'ad.clients.adminMarkOpen': 'فتح البطاقة على سطر الدور',
  'ad.clients.promoCol': 'الترقية',
  'ad.clients.promoUnknown': 'بلا تاريخ',
  'ad.clients.promoUnknownHint':
    'رُقّي هذا الحساب قبل أن تدوّن اللوحة التواريخ: تاريخ ترقيته ما زال بحاجة إلى استكمال، ولا يُختلق.',
  'ad.clients.sortPromoHint':
    'ترتيب الحسابات حسب تاريخ الترقية، الأقدم أولًا؛ نقرة ثانية تقدّم الأحدث، ونقرة ثالثة تعيد ترتيب الجدول. أما الحسابات التي لم يُدوَّن تاريخها فتأتي بعدها، ثم الحسابات العادية.',
  'ad.clients.promoOrderOld': 'الترقية الأقدم أولًا',
  'ad.clients.promoOrderRecent': 'الترقية الأحدث أولًا',
  'ad.xls.role': 'الدور',
  'ad.xls.roleAdmin': 'مسؤول',
  'ad.xls.roleOther': 'حساب عادي',
  'ad.xls.promotedOn': 'تاريخ الترقية',
  'ad.xls.promoUnknown': 'تاريخ غير مدوّن',
  'ad.xls.promoUnknownNote':
    'يحمل عمود «تاريخ الترقية» عبارة «تاريخ غير مدوّن» للحساب الذي رُقّي مسؤولًا قبل أن تدوّن اللوحة التواريخ: لا تُترك الخانة فارغة لأن الفراغ يُقرأ قياسًا ناقصًا. أما الحساب العادي فتبقى خانته فارغة لأنه بلا ترقية.',
  'ad.xls.adminsSheet': 'المسؤولون',
  'ad.xls.adminsSheetEmpty': 'لا حساب مسؤول: تبقى لوحة التحكم مفتوحة للحساب الذي يديرها وحده.',
  'ad.xls.adminsSheetCount': 'حسابات المسؤولين',
  'ad.xls.adminsSheetOrder':
    'تُرتَّب الحسابات حسب تاريخ الترقية، الأقدم أولًا — بالاتجاه نفسه الذي يعتمده جدول الحسابات عند الترتيب حسب الترقية، لتُقرأ الأدوار بترتيب واحد؛ أما التي لم يُدوَّن تاريخها فتأتي في المؤخرة، بترتيب الاسم. وحين يُرتَّب الجدول من الأحدث إلى الأقدم، تتبع الورقة هذا الاتجاه.',
  'ad.xls.adminsSheetNote':
    'تاريخ الترقية هو ما دُوِّن لحظة تغيير الدور في اللوحة. الخلية الفارغة تعني ترقية أقدم من هذا التدوين: لم يُختلق التاريخ.',
  'ad.xls.adminsStaleCount': 'ترقيات أقدم من ستة أشهر',
  'ad.xls.adminsStaleNote':
    'عدد الترقيات الأقدم من ستة أشهر يُقرأ على التاريخ نفسه الذي تعتمده ورقة «المسؤولون»: دور مفتوح منذ أكثر من ستة أشهر يستدعي مراجعة. والترقية بلا تاريخ مدوّن لا تدخل فيه — لأنه لا شيء يؤرّخها.',
  'ad.clients.comptesEmpty': 'لا يوجد حساب مسجّل.',
  'ad.clients.metier': 'المهنة',
  'ad.clients.ville': 'المدينة',
  'ad.clients.fiche': 'البطاقة',
  'ad.clients.open': 'فتح البطاقة',
  'ad.clients.export': 'تصدير إلى Excel',
  'ad.clients.echeanceChip': 'آجال أقل من 30 يومًا',
  'ad.clients.echeanceHint': 'حصر القائمة في الاشتراكات التي يحلّ أجلها في أقل من ثلاثين يومًا.',
  'ad.clients.echeanceEmpty': 'لا أجل في الثلاثين يومًا القادمة.',
  'ad.clients.reset': 'عرض الكل',
  'ad.clients.dueIn': 'بعد {n} يومًا',
  'ad.clients.dueToday': 'اليوم',
  'ad.clients.duePast': 'فات منذ {n} يومًا',
  'ad.clients.sortDueHint':
    'نقرة ترتّب القائمة حسب الأجل، الأكثر إلحاحًا أولًا؛ ونقرة ثانية تعكس الترتيب.',
  'ad.clients.depots': 'الإيداعات',
  'ad.clients.apresCol': 'بعد تذكير',
  'ad.clients.depotNone': 'لا إيداع',
  'ad.clients.noPublieChip': 'بدون إيداع منشور',
  'ad.clients.noPublieHint': 'حصر القائمة في الحسابات التي لم يُنشر لها أي إيداع بعد.',
  'ad.clients.noPublieEmpty': 'لا حساب بدون إيداع منشور: كلها لديها إيداع على الأقل.',
  'ad.clients.lateChip': 'مراجعة طويلة',
  'ad.clients.lateHint':
    'حصر القائمة في الحسابات التي ينتظر أحد إيداعاتها ردًا منذ أكثر من سبعة أيام.',
  'ad.clients.lateEmpty': 'لا حساب ينتظر ردًا منذ أكثر من سبعة أيام.',
  'ad.clients.comptesLateEmpty': 'لا حساب ينتظر ردًا منذ أكثر من سبعة أيام.',
  'ad.clients.sortLateHint':
    'نقرة ترتّب القائمة حسب عدد المراجعات الطويلة، الأكثر أولًا؛ ونقرة ثانية تعكس الترتيب.',
  'ad.clients.sortApresHint':
    'نقرة ترتّب القائمة حسب عدد الإيداعات الواصلة بعد التذكير المحضّر، الحساب الأكثر إيداعًا منذ رسالته أولًا؛ ونقرة ثانية تعكس الترتيب.',
  'ad.clients.lateOpenHint':
    'يفتح تبويب «الإعلانات» محصورًا في إيداعات هذا الحساب التي تراوح المراجعة أكثر من سبعة أيام.',
  'ad.clients.sleepRow': 'محادثات نائمة',
  'ad.clients.sleepRowHint':
    'محادثات هذا الحساب التي تحتاج يومًا أو أكثر للرد: يُقرأ المؤشر قبل فتح البطاقة.',
  'ad.clients.sleepCol': 'محادثات نائمة',
  'ad.clients.sortSleepHint':
    'نقرة ترتّب القائمة حسب عدد المحادثات النائمة، الحساب الأكثر صمتًا أولًا؛ ونقرة ثانية تعكس الترتيب.',
  'ad.clients.sleepChip': 'حسابات صامتة',
  'ad.clients.sleepHint':
    'نقرة تحصر الجدولين في الحسابات التي تحتاج إحدى محادثاتها يومًا أو أكثر للرد؛ ونقرة ثانية تفتحهما كاملين.',
  'ad.clients.sleepEmpty':
    'لا حساب له محادثة نائمة: كل المحادثات ترد في أقل من يوم.',
  'ad.clients.sleepOpenHint':
    'يفتح رسائل لوحة التحكم على المحادثة النائمة لهذا الحساب، دون البحث عنها في القائمة.',
  'ad.clients.relance': 'تحضير تذكير',
  'ad.clients.relanceHint':
    'يفتح الرسالة المعبّأة مسبقًا نفسها التي تفتحها البطاقة — الإيداعات المنتظرة وسطر الخلاصة — دون فتح البطاقة.',
  'ad.clients.recap': 'نسخ الأولويات',
  'ad.clients.recapHint':
    'ينسخ خلاصة أولويات هذا الحساب — محادثاته النائمة مع مهلتها، ثم مراجعاته الطويلة — دون فتح بطاقته.',
  'ad.clients.recentTodayChip': 'تم تذكيره اليوم',
  'ad.clients.recentTodayHint': 'حصر القائمة في الحسابات التي حُضّر لها تذكير اليوم نفسه.',
  'ad.clients.recentWeekChip': 'تم تذكيره هذا الأسبوع',
  'ad.clients.recentWeekHint':
    'حصر القائمة في الحسابات التي حُضّر لها تذكير في الأيام السبعة الأخيرة، اليوم مشمولًا.',
  'ad.clients.recentTodayEmpty': 'لم يُحضّر أي تذكير اليوم.',
  'ad.clients.recentWeekEmpty': 'لم يُحضّر أي تذكير في الأيام السبعة الأخيرة.',
  'ad.clients.apresHint':
    'نقرة تحصر القائمتين في الحسابات التي وصل أحد إيداعاتها بعد التذكير المحضّر، المقروء من ذاكرة هذا الجهاز؛ ونقرة ثانية تعيد القائمة كاملة.',
  'ad.clients.apresEmpty':
    'لا حساب له إيداع وصل بعد التذكير: الرسالة تشمل كل ما أُودع.',
  'ad.clients.comptesOrderLate': 'الترتيب نفسه: المراجعات الطويلة',
  'ad.clients.comptesOrderLateDesc': 'الترتيب نفسه: المراجعات الطويلة معكوسًا',
  'ad.clients.comptesOrderApres': 'الترتيب نفسه: الإيداعات بعد التذكير',
  'ad.clients.comptesOrderApresDesc': 'الترتيب نفسه: الإيداعات بعد التذكير معكوسًا',
  'ad.clients.comptesOrderSleep': 'الترتيب نفسه: المحادثات النائمة',
  'ad.clients.comptesOrderSleepDesc': 'الترتيب نفسه: المحادثات النائمة معكوسًا',
  'ad.clients.comptesOrderHint':
    'يتبع الجدول الثاني الترتيب المختار في جدول المشتركين: تُذكّر بهذه الشارة، وتُقرأ الحسابات بالترتيب نفسه.',
  'ad.clients.comptesOrderTable': 'ترتيب الجدول',
  'ad.clients.comptesOrderDetachHint':
    'يفصل الجدول الثاني عن ترتيب المشتركين ويعيده إلى ترتيب الجدول، دون المساس بترتيب المشتركين.',
  'ad.clients.comptesOrderAttachHint':
    'يربط الجدول الثاني بترتيب المشتركين، حتى تُقرأ القائمتان بالترتيب نفسه.',

  'ad.pay.stamp': 'المدفوعات والاشتراكات',
  'ad.pay.sub': 'ما يجب أن يدرّه كل اشتراك، وما يمنعه بعد من التحصيل.',
  'ad.pay.total': 'اشتراكات متابعة',
  'ad.pay.prets': 'قابلة للتحصيل',
  'ad.pay.regler': 'بحاجة إلى تسوية',
  'ad.pay.montantPret': 'إيراد قابل للتحصيل',
  'ad.pay.montantRegler': 'إيراد معلّق',
  'ad.pay.filterAll': 'الكل',
  'ad.pay.filterRegler': 'بحاجة إلى تسوية',
  'ad.pay.filterReglerHint':
    'لا تُبقى إلا الاشتراكات التي لا يمكن تحصيلها بعد، الأقدم أجلًا أولًا.',
  'ad.pay.filterPrets': 'قابلة للتحصيل',
  'ad.pay.filterPretsHint':
    'لا تُبقى إلا الاشتراكات القابلة للخصم كما هي: مفتوحة، بمبلغ محدّد، وبوسيلة دفع آلية.',
  'ad.pay.colEntreprise': 'المؤسسة',
  'ad.pay.colOffre': 'الصيغة',
  'ad.pay.colMontant': 'المبلغ / شهر',
  'ad.pay.colEcheance': 'الأجل',
  'ad.pay.colCanal': 'وسيلة الدفع',
  'ad.pay.colEtat': 'التحصيل',
  'ad.pay.colFiche': 'البطاقة',
  'ad.pay.cardOffre': 'الصيغة',
  'ad.pay.cardMontant': 'المبلغ',
  'ad.pay.cardEcheance': 'الأجل',
  'ad.pay.cardCanal': 'الدفع',
  'ad.pay.cardEtat': 'التحصيل',
  'ad.pay.open': 'فتح البطاقة',
  'ad.pay.empty': 'لا يوجد اشتراك مسجّل بعد.',
  'ad.pay.emptyRegler': 'لا اشتراك في الانتظار: كل ما هو مفتوح قابل للتحصيل.',
  'ad.pay.emptyPrets':
    'لا اشتراك قابل للتحصيل كما هو: قائمة «بحاجة إلى تسوية» تقول ما ينقص.',
  'ad.pay.why.pret': 'جاهز للتحصيل',
  'ad.pay.why.essai': 'تجربة جارية',
  'ad.pay.why.sansMontant': 'المبلغ غير محدّد',
  'ad.pay.why.sansCanal': 'لا وسيلة دفع',
  'ad.pay.why.manuel': 'تحصيل يدوي',
  'ad.pay.why.retard': 'الأجل فات',
  'ad.pay.why.ferme': 'اشتراك مغلق',
  'ad.pay.bannerTitle': 'الخصم الآلي غير موصول بعد',
  'ad.pay.bannerBody':
    'لا مزوّد دفع مرتبط بالمشروع: الاشتراكات متابعة، لكنها لم تُحصَّل بعد عبر الإنترنت. تقرأ هذه الشاشة ما تسجّله القاعدة — الصيغة والمبلغ والأجل ووسيلة الدفع — وتشير، سطرًا بسطر، إلى ما ينقص ليكون الاشتراك قابلًا للتحصيل.',
  'ad.pay.ruleTitle': 'قاعدة القراءة',
  'ad.pay.ruleBody':
    'يكون الاشتراك قابلًا للتحصيل حين يكون مفتوحًا، ومبلغه محدّدًا، ووسيلة دفع آلية مرتبطة به. وكل ما عدا ذلك يُشار إليه بسببه، ويُقرأ بهذا الترتيب: اشتراك مغلق، مبلغ فارغ، وسيلة دفع غائبة أو يدوية، تجربة جارية، أجل فات.',
  'ad.pay.note':
    'المبالغ هي مبالغ القاعدة، دون رسوم. والاشتراك المغلق لا يدخل في الإيراد القابل للتحصيل ولا في الإيراد المعلّق.',
  'ad.pay.motifLabel': 'التصفية حسب السبب',
  'ad.pay.motifHint':
    'عزل الاشتراكات التي سببها «{r}» بنقرة واحدة؛ ونقرة ثانية تعيد الطابور كاملًا.',
  'ad.pay.motifLegend':
    'يُعزل السبب بنقرة واحدة: لا تُبقي القائمة إلا الاشتراكات التي يعطّلها.',
  'ad.pay.motifActive': 'مصفّى حسب السبب «{r}»',
  'ad.pay.motifClear': 'كل الأسباب',
  'ad.pay.motifEmpty': 'لا اشتراك بهذا السبب: القاعدة لم تعُد تصادفه اليوم.',
  'ad.pay.csvCta': 'تصدير الجدول',
  'ad.pay.csvHint':
    'ينزّل الطابور المعروض بصيغة CSV؛ ويحمل اسم الملف السبب أو العرض الموضوع على القائمة، لأرشفته بعد تذكير.',
  'ad.pay.csvDone': 'تم تنزيل الجدول',
  'ad.pay.exportLast': 'آخر أرشيف: {date}',
  'ad.pay.exportWhat': '{what} · {n} سطرًا',
  'ad.pay.exportAmount': 'المبلغ {n}',
  'ad.pay.exportReplay': 'إعادة هذا التصدير',
  'ad.pay.exportReplayHint':
    'نقرة تستعيد عرض هذا الأرشيف وسببه، لإعادته كما هو؛ والطابور المحصور في حساب يُعاد كاملًا أولًا.',
  'ad.pay.exportReplayDone': 'أُعيد العرض والسبب',
  'ad.pay.histTitle': 'آخر سبعة تصديرات',
  'ad.pay.histHint':
    'أحدث التصديرات المنتجة من هذا الجهاز، من الأحدث إلى الأقدم، بتاريخها وعدد أسطرها ومبلغها: يُقرأ الأرشيف في الزمن، لا عند آخر فعل فقط.',
  'ad.pay.histCount': '{n} تصديرًا محفوظًا',
  'ad.pay.histRows': '{n} سطرًا',
  'ad.pay.histNoAmount': 'المبلغ غير محفوظ',
  'ad.pay.histRowHint':
    'نقرة تعيد هذا التصدير بعينه: تستعيد الشاشة عرض هذا السطر وسببه، لا عرض آخر تصدير فقط.',
  'ad.pay.archiveDeltaUp': '+{n} منذ هذا التصدير',
  'ad.pay.archiveDeltaDown': '−{n} منذ هذا التصدير',
  'ad.pay.archiveDeltaFlat': 'الطابور لم يتغيّر',
  'ad.pay.archiveDeltaHint':
    'ما يحمله الطابور اليوم بالعرض والسبب نفسيهما، مقارنةً بالمبلغ الذي حمله هذا التصدير: الفرق يقول بنظرة واحدة هل تحرّك الجدول منذ ذلك الحين.',
  'ad.pay.archiveDeltaOpenHint':
    'نقرة تفتح الطابور على أسطر هذا الفرق: تلك التي وصلت منذ هذا التصدير، بالعرض والسبب نفسيهما. والأسطر المغادرة لا تُحصى فقط.',
  'ad.pay.archiveDeltaRowsUp': '+{n} سطرًا',
  'ad.pay.archiveDeltaRowsDown': '−{n} سطرًا',
  'ad.pay.archiveDeltaRowsFlat': 'الأسطر نفسها',
  'ad.pay.archiveDeltaRowsHint':
    'الأسطر المكتسبة أو المفقودة منذ هذا التصدير، بالعرض والسبب نفسيهما: العدّ يقول هل امتلأ الجدول أم فرغ، بينما المبلغ لا يقول إلا ما يزنه.',
  'ad.pay.ecartChip': 'فرق تصدير {date}',
  'ad.pay.ecartArrived': '{n} سطرًا وصل',
  'ad.pay.ecartLeft': '{n} سطرًا غادر',
  'ad.pay.ecartNone':
    'لم يصل أي سطر منذ هذا التصدير، بهذا العرض وهذا السبب: الجدول كما كان.',
  'ad.pay.ecartClear': 'إعادة الطابور',
  'ad.pay.ecartClearHint':
    'يرفع الفرق ويعيد الطابور كاملًا، بعرض التصدير وسببه: يُقرأ الجدول دون الحصر.',
  'ad.pay.histAvg': 'المتوسط {n}',
  'ad.pay.histAvgNote': 'على {n} تصديرًا بمبلغ',
  'ad.pay.histAvgHint':
    'معدل المبالغ التي حملتها التصديرات المحفوظة في السجل، والاتجاه بين الأحدث والأقدم: تُقرأ التصديرات السبعة كسلسلة. والتصديرات بلا مبلغ محفوظ لا تدخل في المتوسط.',
  'ad.pay.histAvgUp': '+{n} خلال المدة',
  'ad.pay.histAvgDown': '−{n} خلال المدة',
  'ad.pay.histAvgFlat': 'المبالغ مستقرة',
  'ad.pay.histPeak': 'أعلى تصدير في الأسبوع',
  'ad.pay.histPeakHint':
    'التصدير الذي حمل أعلى مبلغ في الأسبوع: يُقرأ الأعلى إلى جانب المتوسط، دون جمع الأسطر السبعة.',
  'ad.pay.histPeakNote': 'الأعلى {n} في {date}',
  'ad.pay.histPeakNoteHint':
    'أعلى مبلغ حمله تصدير في الأسبوع، وتاريخه: يُقرأ المتوسط والأعلى معًا.',
  'ad.pay.histPeakReplayHint':
    'نقرة تعيد تصدير الأعلى: تستعيد الشاشة عرضه وسببه، لقراءة الأسبوع عند ذروته.',
  'ad.pay.histMovedUp': '+{n} سطرًا منذ',
  'ad.pay.histMovedDown': '−{n} سطرًا منذ',
  'ad.pay.histMovedHint':
    'ما يحصيه الطابور اليوم بالعرض والسبب نفسيهما لهذا التصدير، مقارنةً بالأسطر التي حملها الملف: يُلاحَظ السطر الذي تحرّك بين السبعة دون فتح كل أرشيف.',
  'ad.pay.ecartExport': 'تصدير هذه الأسطر',
  'ad.pay.histMovedOnly': 'أسطر تحرّكت',
  'ad.pay.histMovedOnlyHint':
    'نقرة لا تُبقي إلا التصديرات التي يختلف عدد أسطرها عن عدد أسطر الطابور اليوم، بعرضها وسببها: يُعثر على السطر الذي تحرّك دون استعراض السبعة. ونقرة ثانية تعيد السجل كاملًا.',
  'ad.pay.histMovedOnlyEmpty':
    'لم يتحرّك أي تصدير محفوظ: الجدول يحصي الأسطر نفسها كما في كل أرشيف.',
  'ad.pay.histAmountMovedUp': '+{n} في المبلغ منذ',
  'ad.pay.histAmountMovedDown': '−{n} في المبلغ منذ',
  'ad.pay.histAmountMovedHint':
    'ما يزنه الطابور اليوم بالعرض والسبب نفسيهما لهذا التصدير، مقارنةً بما حمله الملف: يُشار إلى المبلغ الذي تحرّك إلى جانب العدّ، دون فتح الأرشيف.',
  'ad.pay.ecartExportHint':
    'ينزّل بصيغة CSV أسطر هذا الفرق وحده — تلك التي وصلت منذ هذا التصدير — دون المرور بالطابور كله: مرفق، لا تصدير جديد للجدول.',
  'ad.pay.ecartExportDone': 'تم تنزيل الأسطر',
  'ad.pay.csvEcart': 'الفرق منذ تصدير',
  'ad.pay.cmpOpen': 'مقارنة تصديرين',
  'ad.pay.cmpOpenHint':
    'يفتح نقطتين للاختيار من بين التصديرات السبعة المحفوظة — بداية ونهاية — لقراءة فرق المبلغ والأسطر بينهما، دون المرور بطابور اليوم.',
  'ad.pay.cmpTitle': 'بين تصديرين',
  'ad.pay.cmpClose': 'إغلاق',
  'ad.pay.cmpCloseHint': 'يغلق المقارنة ويعيد السجل إلى قراءته وحدها.',
  'ad.pay.cmpFrom': 'نقطة البداية',
  'ad.pay.cmpTo': 'نقطة الوصول',
  'ad.pay.cmpHint':
    'أرشيفان يُقارنان ببعضهما: المبلغ وعدد الأسطر ينتقلان من نقطة البداية إلى نقطة الوصول. لا شيء يُقارن بطابور اليوم، ومبلغ غائب في أحد التصديرين لا يُختلق.',
  'ad.pay.cmpAmountUp': '+{n} في المبلغ',
  'ad.pay.cmpAmountDown': '−{n} في المبلغ',
  'ad.pay.cmpAmountFlat': 'المبلغ لم يتغيّر',
  'ad.pay.cmpAmountNone': 'المبلغ غير قابل للمقارنة',
  'ad.pay.cmpRowsUp': '+{n} سطرًا',
  'ad.pay.cmpRowsDown': '−{n} سطرًا',
  'ad.pay.cmpRowsFlat': 'الأسطر نفسها',
  'ad.pay.cmpIds': 'منها {a} وصل و{p} غادر',
  'ad.pay.cmpArrivalsOnly': '{a} وصل',
  'ad.pay.cmpPartiesToken': 'غادر {n}',
  'ad.pay.cmpPartiesTokenHint':
    'نقرة تحصر طابور الجدول في هذه الأسطر المغادرة التي ما زالت في الجدول، بالعرض والسبب الحاليين؛ ونقرة ثانية تعيده كاملًا.',
  'ad.pay.cmpPartiesTokenGoneHint':
    'لا سطر من هذه المغادرات ما زال في الجدول: لا شيء لحصره، والرقم يحصي فقط.',
  'ad.pay.cmpPartiesNarrowOn': 'الطابور على {n} سطرًا',
  'ad.pay.cmpPartiesExitHint':
    'نقرة تعيد الطابور كاملًا، بالعرض والسبب الحاليين.',
  'ad.pay.cmpPartiesNarrowBanner':
    'الطابور محصور في {n} سطرًا غادر وما زال في الجدول',
  'ad.pay.cmpPartiesNarrowNote':
    'لا يُظهر الجدول إلا هذه الأسطر المغادرة، بالعرض والسبب الحاليين.',
  'ad.pay.cmpPartiesNarrowEmpty':
    'لا سطر من هذه المغادرات يدخل في العرض والسبب الحاليين: لا شيء لحصره هنا.',
  'ad.pay.cmpPartiesNarrowExport': 'تصدير هذه الأسطر',
  'ad.pay.cmpPartiesNarrowExportHint':
    'ينزّل بصيغة CSV أسطر المغادرة وحدها التي يتركها هذا الحصر في الجدول، بالعرض والسبب الحاليين: مرفق، لا تصدير جديد للطابور.',
  'ad.pay.cmpPartiesNarrowExportDone': 'تم تنزيل الأسطر',
  'ad.pay.histOpposite': 'اتجاهان متعاكسان',
  'ad.pay.histOppositeHint':
    'تحرّك هذا التصدير في اتجاهين متعاكسين: عدّ الأسطر والمبلغ لا يسيران في الاتجاه نفسه. يُقرأ الفرقان معًا، وإلا لأوقع أحدهما في استنتاج خاطئ.',
  'ad.pay.cmpAccount': 'الحساب (البريد)',
  'ad.pay.cmpPartiesDelta': 'المبلغ المسحوب',
  'ad.pay.cmpPartiesTotal': 'ما سحبته هذه المغادرات',
  'ad.pay.cmpPartiesDeltaNote':
    'تسرد هذه الورقة أسطر الحساب الموجودة عند البداية والغائبة عند الوصول، بعد العثور عليها في الجدول بمعرّفها. ويحصي عمود «المبلغ المسحوب» بالسالب، لتُجمع الأعمدة؛ والسطر الذي لم يعد في الجدول لا يظهر فيها ويُحصى فقط في مجموع المغادرات.',
  'ad.pay.cmpPartiesMajorMark': 'يزن أكثر من النصف',
  'ad.pay.cmpPartiesMajorMarkYes': '● الأكثر وزنًا',
  'ad.pay.cmpPartiesMajorCount': 'منها {n} سطرًا يزن أكثر من النصف',
  'ad.pay.cmpPartiesMajorMarkNote':
    'عمود «يزن أكثر من النصف» يؤشّر الأسطر التي تسحب وحدها أكثر من نصف المبلغ المسحوب لهذه المغادرات: يُقرأ السحب على سطر واحد بدل أن يتوزّع. والسطر بلا مبلغ لا يُوزن ويبقى دون تأشير.',
  'ad.pay.histAmountMovedOnly': 'مبالغ تحرّكت',
  'ad.pay.histAmountMovedOnlyHint':
    'نقرة لا تُبقي إلا التصديرات التي يختلف مبلغها عمّا يزنه الطابور اليوم، بعرضها وسببها: يُعثر على المبلغ الذي تحرّك دون استعراض السبعة. ونقرة ثانية تعيد السجل كاملًا.',
  'ad.pay.histAmountMovedOnlyEmpty':
    'لم يتحرّك أي تصدير بمبلغ: الطابور يزن المبلغ نفسه كما في كل أرشيف.',
  'ad.pay.histBothMovedEmpty':
    'لم يتحرّك أي تصدير، لا في المبلغ ولا في الأسطر: الجدول كما هو في كل أرشيف.',
  'ad.pay.histOppositeOnly': 'اتجاهان متعاكسان',
  'ad.pay.histOppositeOnlyHint':
    'نقرة لا تُبقي إلا التصديرات التي يسير فيها عدّ الأسطر والمبلغ في اتجاهين متعاكسين، بعرضها وسببها: يُعثر على الفرقين المتناقضين دون استعراض السبعة. ونقرة ثانية تعيد السجل كاملًا.',
  'ad.pay.histOppositeOnlyEmpty':
    'لا تصدير يسير في اتجاهين متعاكسين: العدّ والمبلغ يسيران في الاتجاه نفسه في كل أرشيف.',
  'ad.pay.histBaisseOnly': 'مبالغ انخفضت',
  'ad.pay.histBaisseOnlyHint':
    'نقرة لا تُبقي إلا التصديرات التي انخفض مبلغها منذ ذلك الحين: الطابور يزن اليوم أقل مما حمله الملف، بعرضه وسببه. والتصدير بلا مبلغ محفوظ لا يدخل في أي اتجاه — لأنه لا يُقارن. ونقرة ثانية تعيد السجل كاملًا.',
  'ad.pay.histBaisseOnlyEmpty':
    'لم ينخفض أي تصدير: الطابور يزن اليوم ما يزنه كل أرشيف أو أكثر.',
  'ad.pay.histFiltersEmpty':
    'لا تصدير يجمع هذه المرشّحات كلها: وسّع واحدًا منها لتستعيد السجل.',
  'ad.pay.histShowing': '{n} من {m} تصديرًا ظاهر',
  'ad.pay.histShowingHint':
    'عدد التصديرات التي تتركها الشارات في السجل، من السبعة المحفوظة: شارتان موضوعتان معًا لا تُبقيان إلا الأرشيفات التي تحقق الشرطين.',
  'ad.pay.histClearHint':
    'يطفئ شارات السجل الثلاث بفعل واحد ويعيد التصديرات السبعة كاملة: لا يبقى أي مرشّح بعد النقر.',
  'ad.pay.histOppositeExport': 'CSV للاتجاهين المتعاكسين',
  'ad.pay.histOppositeExportHint':
    'ينزّل بصيغة CSV التصديرات وحدها التي يسير فيها عدّ الأسطر والمبلغ في اتجاهين متعاكسين، مع فرقيها جنبًا إلى جنب — ما حمله الأرشيف، وما يزنه الطابور اليوم بعرضه وسببه.',
  'ad.pay.histOppositeExportDone': 'تم تنزيل التصديرات',
  'ad.pay.histFilterExport': 'CSV للسجل المصفّى',
  'ad.pay.histFilterExportHint':
    'ينزّل بصيغة CSV التصديرات وحدها التي تتركها الشارات في السجل، بالترتيب الذي تُقرأ به — من الأحدث إلى الأقدم —، مع أسطر كل تصدير ومبلغه، وما يزنه الطابور اليوم بعرضه وسببه، والفرقين.',
  'ad.pay.histFilterExportDone': 'تم تنزيل السجل',
  'ad.pay.histFilterCost': 'الكلفة الإجمالية لهذه التصديرات {n} · {m} تصديرًا بمبلغ',
  'ad.pay.histFilterCostHint':
    'مجموع المبالغ الأصلية للتصديرات التي تتركها الشارات في السجل: ما كانت تزنه هذه الملفات لحظة النقر. والتصدير بلا مبلغ محفوظ لا يدخل في المجموع — لأنه لا يُجمع —، والرقم الثاني يقول على كم تصديرًا بمبلغ يقع هذا المجموع.',
  'ad.pay.histFilterCsvFilters': 'الشارات الموضوعة',
  'ad.pay.histFilterCsvCount': 'تصديرات محفوظة',
  'ad.pay.histFilterCsvNote':
    'سطر لكل تصدير تتركه الشارات في السجل، بترتيب القائمة. وأعمدة «اليوم» تقرأ الطابور بعرض كل أرشيف وسببه؛ والتصدير بلا مبلغ محفوظ يترك فرق المبلغ فارغًا، لأنه لا يُقارن.',
  'ad.pay.histFilterCsvCost': 'الكلفة الإجمالية',
  'ad.pay.histFilterCsvCostNote':
    'مجموع المبالغ الأصلية لـ {n} تصديرًا بمبلغ: الرقم نفسه الذي يعرضه العدّاد على الشاشة، مكرّرًا في السطر الأخير ليُقرأ الأرشيف دون إعادة الجمع.',
  'ad.pay.histFilterCsvCostNone': 'لا تصدير بمبلغ في هذا الانتقاء',
  'ad.pay.histBaisseCumulHint':
    'الانخفاض المتراكم منذ {n} تصديرًا محفوظًا: مجموع فروقه السالبة بين ما يزنه الطابور اليوم وما حمله كل ملف. والتصدير الذي ارتفع لا يدخل في المجموع.',
  'ad.pay.histBaisseCumulToken': 'الانخفاض المتراكم',
  'ad.pay.histBaisseCumulTokenHint':
    'نقرة تحصر السجل في التصديرات التي انخفض مبلغها فقط — تلك التي يزن الطابور اليوم أقل من الملف. ونقرة ثانية تعيد التصديرات السبعة كاملة.',
  'ad.pay.histFilterCsvBaisse': 'الانخفاض المتراكم',
  'ad.pay.histFilterCsvBaisseNote':
    'مجموع الفروق السالبة لـ {n} تصديرًا محفوظًا: ما خسره الطابور منذ ملفاتها. والتصدير الذي ارتفع لا يدخل في المجموع — لأنه يناقضه.',
  'ad.pay.histFilterCsvBaisseNone': 'لا انخفاض في هذا الانتقاء',
  'ad.pay.histFilterCsvLatest': 'أحدث تصدير محفوظ',
  'ad.pay.histFilterCsvLatestNone': 'لا تصدير محفوظ',
  'ad.pay.oppCsvRowsNow': 'الأسطر اليوم',
  'ad.pay.oppCsvAmountNow': 'المبلغ اليوم',
  'ad.pay.oppCsvRowGap': 'فرق الأسطر',
  'ad.pay.oppCsvAmountGap': 'فرق المبلغ',
  'ad.pay.oppCsvCount': 'تصديرات باتجاهين متعاكسين',
  'ad.pay.oppCsvNote':
    'سطر لكل تصدير يسير فيه عدّ الأسطر والمبلغ في اتجاهين متعاكسين: يُقرأ الفرقان معًا، وإلا لأوقع أحدهما في استنتاج خاطئ. وأعمدة «اليوم» تقرأ الطابور بعرض كل أرشيف وسببه؛ والتصدير بلا مبلغ محفوظ يترك فرق المبلغ فارغًا، لأنه لا يُقارن.',
  'ad.pay.cmpSame': 'اختر تصديرين مختلفين: النقطة نفسها لا تُقارن بنفسها.',
  'ad.pay.cmpExport': 'تصدير المقارنة',
  'ad.pay.cmpExportHint':
    'ينزّل الفرق بين هذين التصديرين في ثلاث أوراق: النقطتان جنبًا إلى جنب، وفرق المبلغ والأسطر بينهما، ثم — حين كان التصديران يحفظان أسطرهما — الأسطر التي وصلت بينهما.',
  'ad.pay.cmpExportDone': 'تم تنزيل المقارنة',
  'ad.pay.cmpColField': 'المؤشر',
  'ad.pay.cmpDate': 'تاريخ التصدير',
  'ad.pay.colRows': 'الأسطر',
  'ad.pay.cmpGapTitle': 'الفرق بين التصديرين',
  'ad.pay.cmpSheetPoints': 'النقطتان',
  'ad.pay.cmpArrivalsSheet': 'أسطر واصلة',
  'ad.pay.cmpArrivalsEmpty': 'لم يصل أي سطر بين هذين التصديرين.',
  'ad.pay.cmpArrivalsUnknown':
    '{n} سطرًا وصل ولم يعد في الجدول: لا يمكن إلا حصره.',
  'ad.pay.cmpArrivalsNote':
    'تسمّي هذه الورقة الأسطر الواصلة بين النقطتين، بعد العثور عليها في الجدول بمعرّفها. ولا توجد إلا حين كان التصديران يحفظان أسطرهما؛ أما التي غادرت الجدول فلا توجد فيها وتُحصى فقط.',
  'ad.pay.cmpArrivalDelta': 'فرق المبلغ',
  'ad.pay.cmpArrivalTotal': 'ما أضافته هذه الوصولات',
  'ad.pay.cmpArrivalTotalChip': 'واردات +{n}',
  'ad.pay.cmpArrivalTotalChipHint':
    'نقرة تكشف الأسطر الواصلة بين التصديرين مع المبلغ الذي أضافه كل واحد منها: يُقرأ المجموع في مكانه، دون فتح المصنّف.',
  'ad.pay.cmpArrivalNoAmount': 'مبلغ فارغ',
  'ad.pay.cmpArrivalNarrowHint':
    'نقرة ثانية تحصر طابور الجدول في هذه الأسطر الواصلة وحدها، بالعرض والسبب الحاليين.',
  'ad.pay.cmpArrivalNarrowOn': 'الطابور على {n} سطرًا',
  'ad.pay.cmpArrivalNarrowExitHint':
    'نقرة تعيد الطابور كاملًا وتغلق قائمة الوصولات.',
  'ad.pay.cmpArrivalNarrowBanner':
    'الطابور محصور في {n} سطرًا وصل بين النقطتين',
  'ad.pay.cmpArrivalNarrowNote':
    'لا يُظهر الجدول إلا هذه الأسطر، بالعرض والسبب الحاليين.',
  'ad.pay.cmpArrivalNarrowEmpty':
    'لا سطر من هذه الوصولات يدخل في العرض والسبب الحاليين: لا شيء لحصره هنا.',
  'ad.pay.cmpPartiesSheet': 'أسطر مغادرة',
  'ad.pay.cmpPartiesEmpty': 'لم يغادر أي سطر بين هذين التصديرين.',
  'ad.pay.cmpPartiesUnknown':
    '{n} سطرًا غادر ولم يعد في الجدول: لا يمكن إلا حصره.',
  'ad.pay.cmpPartiesNote':
    'تسرد هذه الورقة الأسطر الموجودة في نقطة البداية والغائبة في نقطة الوصول، بعد العثور عليها في الجدول بمعرّفها. ولا توجد إلا حين كان التصديران يحفظان أسطرهما؛ أما التي غادرت الجدول فلا توجد فيها وتُحصى فقط.',
  'ad.pay.cmpFilsSheet': 'الخيوط النشطة',
  'ad.pay.cmpFilsSubject': 'الخيط',
  'ad.pay.cmpFilsLast': 'آخر رسالة',
  'ad.pay.cmpFilsAt': 'تاريخ آخر رسالة',
  'ad.pay.cmpFilsPace': 'مدة الرد',
  'ad.pay.cmpFilsNoLast': '(لا رسالة)',
  'ad.pay.cmpFilsCount': 'الخيوط النشطة عند التصدير',
  'ad.pay.cmpFilsUnknown':
    '{n} خيطًا نشطًا تعذّر تسميته: لم يعد في جدول الحساب.',
  'ad.pay.cmpFilsNote':
    'تسمّي هذه الورقة الخيوط النشطة التي يعدّها تبويب الفرق: موضوعها، وآخر رسالة فيها وتاريخها، ومدة الرد. وهي تصف حالة الحساب عند التصدير، لا فرقًا بين النقطتين المقارنتين؛ ولا توجد إلا حين كانت مدد الرد مقيسة.',
  'ad.pay.exportNone': 'لم يُصدَّر أي أرشيف من هذا الجهاز: أرشيف اليوم ما زال مطلوبًا.',
  'ad.pay.exportToday': 'أرشيف اليوم موجود',
  'ad.pay.exportMemoHint':
    'تاريخ آخر تصدير للجدول، محفوظ على هذا الجهاز: يقول بنظرة واحدة هل أُنتج أرشيف اليوم.',
  'ad.pay.exportClear': 'محو الذاكرة',
  'ad.pay.exportClearHint':
    'يمحو تاريخ آخر تصدير المحفوظ على هذا الجهاز: يعود سطر الأرشيف فارغًا، كما لم يكن هناك تصدير قط. والملفات المنزّلة سابقًا لا تتغير.',
  'ad.pay.exportClearConfirm': 'تأكيد المحو',
  'ad.pay.exportClearConfirmHint':
    'نقرة ثانية تمحو الذاكرة. وأي تصدير جديد سيكتبها من جديد فورًا.',
  'ad.pay.exportClearCancel': 'إلغاء',
  'ad.pay.exportClearCancelHint': 'يُبقي الذاكرة كما هي، دون محو شيء.',
  'ad.pay.exportCleared': 'مُحيت الذاكرة',
  'ad.pay.weekLabel': 'صُدّر هذا الأسبوع',
  'ad.pay.weekToday': 'آخر تصدير اليوم',
  'ad.pay.weekSince': 'آخر تصدير قبل {n} يومًا',
  'ad.pay.weekNever': 'لا تصدير معروف',
  'ad.pay.weekHint':
    'يعدّ تصديرات الجدول خلال الأيام السبعة الأخيرة، وكم يومًا مرّ على آخر تصدير: الجدول الذي لم يُعَد تصديره منذ عدة أيام يُلاحَظ دون قراءة التاريخ.',
  'ad.pay.sortMontant': 'الترتيب حسب المبلغ',
  'ad.pay.sortMontantHint':
    'يرتّب الطابور المعروض من أعلى مبلغ إلى أدناه، وعند التساوي الأقدم استحقاقًا أولًا: لتحصيل الاشتراكات الأكثر ربحًا أولًا.',
  'ad.pay.focusTriMontant': 'ترتيب تنازلي حسب المبلغ',
  'ad.pay.focusVueRegler': 'عرض «بحاجة إلى تسوية»',
  'ad.pay.focusVuePrets': 'عرض «قابلة للتحصيل»',
  'ad.pay.csvFilter': 'مرشّح التصدير',
  'ad.pay.focus': 'محصور في الحساب {mail}',
  'ad.pay.focusHint': 'يعيد الطابور كاملًا: تعود كل اشتراكات لوحة التحكم مع أسبابها.',
  'ad.pay.focusClear': 'عرض كل الاشتراكات',
  'ad.pay.focusEmpty': 'لا اشتراك لهذا الحساب في الطابور: لا شيء لتحصيله هنا.',
  'ad.pay.sortedTotal': 'مجموع الطابور',
  'ad.pay.sortedTotalRows': '{n} سطرًا',
  'ad.pay.sortedTotalReady': 'منها {n} قابل للتحصيل',
  'ad.pay.sortedTotalReadyHint':
    'الجزء القابل للتحصيل بعد من الطابور المقروء: الاشتراكات المفتوحة، بمبلغ محدّد، والقابلة للخصم التي يحويها، ومبلغها. والمبلغ الآخر إلى جانبه يقول ما يحمله الطابور كله.',
  'ad.pay.sortedTotalDue': 'متبقٍ للتسوية {n}',
  'ad.pay.sortedTotalDueHint':
    'ما يتركه هذا الطابور نفسه معلّقًا: الاشتراكات المفتوحة، بمبلغ محدّد، لكنها غير قابلة للخصم بعد — أجل فات، أو وسيلة دفع غائبة أو يدوية، أو تجربة جارية — ومبلغها. والاشتراك المغلق لا يدخل فيها.',
  'ad.pay.sortedTotalHint':
    'مجموع مبالغ الأسطر المعروضة: ما يحمله هذا الطابور كما يُقرأ — بالسبب والعرض والترتيب. والترتيب لا يغيّر المجموع، بل يغيّر فقط ترتيب التحصيل.',

  'ad.xls.synthTitle': 'خلاصة — المشتركون',
  'ad.xls.state': 'الحالة',
  'ad.xls.count': 'الاشتراكات',
  'ad.xls.share': 'الحصة',
  'ad.xls.total': 'المجموع',
  'ad.xls.nearDue': 'آجال أقل من 30 يومًا',
  'ad.xls.num': 'الرقم',
  'ad.xls.mail': 'البريد',
  'ad.xls.daysLeft': 'الأيام المتبقية',
  'ad.xls.metier': 'المهنة',
  'ad.xls.filter': 'مرشّح القائمة',
  'ad.xls.filterCount': 'الشارات الموضوعة على القائمة عند التصدير',
  'ad.xls.headLine': 'تصدير بتاريخ {date} — {chips} موضوعة على القائمة لحظة النقر',
  'ad.xls.revueSortActive': 'ترتيب المراجعة مفعّل في الرسائل',
  'ad.xls.apresSortActive': 'ترتيب «بعد تذكير» مفعّل في الرسائل',
  'ad.xls.recentSortActive': 'ترتيب «الأحدث نسخًا» مفعّل في الرسائل',
  'ad.xls.apresSortWho': 'يفتتح الترتيب: {n}',
  'ad.xls.order': 'ترتيب الأسطر',
  'ad.xls.orderNone': 'ترتيب الجدول',
  'ad.xls.orderDue': 'الأجل الأقرب أولًا',
  'ad.xls.orderDesc': 'الأجل الأبعد أولًا',
  'ad.xls.orderLate': 'الحساب الأكثر مراجعات طويلة أولًا',
  'ad.xls.orderLateDesc': 'الحساب الأقل مراجعات طويلة أولًا',
  'ad.xls.orderApres': 'الحساب الأكثر إيداعات وصلت بعد التذكير أولًا',
  'ad.xls.orderApresDesc': 'الحساب الأقل إيداعات وصلت بعد التذكير أولًا',
  'ad.xls.orderSleep': 'الحساب الأكثر محادثات نائمة أولًا',
  'ad.xls.orderSleepDesc': 'الحساب الأقل محادثات نائمة أولًا',
  'ad.xls.noPublie': 'حسابات بدون إيداع منشور',
  'ad.xls.depotsPublies': 'إيداعات منشورة',
  'ad.xls.depotsRefuses': 'إيداعات مرفوضة',
  'ad.xls.relectures': 'مراجعات طويلة',
  'ad.xls.sleepThreads': 'محادثات نائمة',
  'ad.xls.sleepAccounts': 'حسابات بها محادثة نائمة واحدة على الأقل',
  'ad.xls.sleepNote': 'عمود «محادثات نائمة» يحصي، لكل حساب، المحادثات التي تحتاج يومًا أو أكثر للرد — القياس نفسه والحد نفسه الذي تعرضه شارة الشاشة. ويبقى صفرًا حين يتعذّر قراءة إيقاع المحادثات: الصفر يعني حينها «لم يُقس شيء»، لا «كل شيء على ما يرام».',
  'ad.xls.reviewedThreads': 'مقروء أثناء المراجعة',
  'ad.xls.reviewedAccounts': 'حسابات بها محادثة نائمة قُرئت أثناء المراجعة',
  'ad.xls.reviewedThreadsTotal': 'محادثات نائمة قُرئت أثناء المراجعة',
  'ad.xls.reviewState': 'المراجعة الجارية',
  'ad.xls.airesJamais': 'مناطق لم تُنسخ قط وما زالت في الصندوق عند التصدير',
  'ad.xls.airesJamaisList': 'هذه المناطق، واحدة واحدة',
  'ad.xls.jamaisSortActive': 'ترتيب «المنطقة التي لم تُنسخ قط أولًا» مفعّل في الرسائل',
  'ad.xls.airesJamaisLink':
    'السطران أعلاه يقودان إلى رسائل لوحة التحكم محصورة في هذه المناطق: نقرة تفتح الصندوق مطويًا مسبقًا، دون البحث عنه.',
  'ad.xls.airesJamaisNote':
    'سطر «مناطق لم تُنسخ قط وما زالت في الصندوق» يحصي، لحظة النقر، المناطق التي تحملها محادثات لوحة التحكم ولم يخرج نسخها بعد — لا نسخ شامل ولا مفرد. ويُقرأ من ذاكرة الجهاز نفسها التي تعتمدها شارة الرسائل: تصديران في اليوم نفسه، قبل نسخة وبعدها، لم يعودا يحملان الرقم نفسه.',
  'ad.xls.ancienSortActive': 'ترتيب «الأقدم نسخًا أولًا» مفعّل في الرسائل',
  'ad.xls.gommeSortActive': 'ترتيب «الأحدث محوًا أولًا» مفعّل في الرسائل',
  'ad.xls.gommeAncienneSortActive': 'ترتيب «الأقدم محوًا أولًا» مفعّل في الرسائل',
  'ad.xls.gommeRestantes': 'مناطق أعادتها المسحة وما زالت في الصندوق',
  'ad.xls.gommeRestantesList': 'هذه المناطق الباقية في الصندوق، واحدة واحدة',
  'ad.xls.gommeRestantesHint':
    '{n} من {total} منطقة أعادتها المسحة ما زالت في الصندوق عند التصدير: يُقرأ الفعل على ما بقي للعرض، كما على ما غادر.',
  'ad.xls.gommeRestantesNote':
    'سطر «مناطق أعادتها المسحة وما زالت في الصندوق» يحصي، لحظة النقر، المناطق التي أعادتها المسحة الصغيرة وما زال خيط في الصندوق يحملها — مقروءة من ذاكرة الجهاز نفسها التي تعتمدها شارة الرسائل. وهو يقع قبل سطر الفارق مباشرة، والأسماء التي تليه تسمّي هذه المناطق واحدة واحدة. ويحمل اسم الملف، إلى جانب وزن الفعل، عدد ما بقي منها — «-1-restante» — ثم عدد ما غادر الصندوق — «-hors-boite-1» —: فلا يلتبس تصديران في اليوم نفسه، قبل مغادرة منطقة وبعدها.',
  'ad.xls.gommeHorsSens': 'اتجاه سطر المغادرات',
  'ad.xls.gommeHorsSensRecent': 'الأحدث محوًا أولًا',
  'ad.xls.gommeHorsSensAncien': 'الأقدم محوًا أولًا',
  'ad.xls.gommeHorsSensMois':
    'المغادرات {n}، حسب شهر المحو (الأحدث أولًا): {list} — تُقرأ موجات الفعل دفعة واحدة.',
  'ad.xls.gommeHorsSensMoisListe': 'هذه المغادرات، حسب شهر المحو',
  'ad.xls.gommeHorsSensNote':
    'يعيد سطر «اتجاه سطر المغادرات» الاتجاه الذي كان سطر الأراضي المغادرة يقرأه في الرسائل لحظة النقر، مقروءًا من ذاكرة الجهاز نفسها: الأحدث محوًا أولًا، أو الأقدم حين يكون السطر معكوسًا. لذلك لا يحمل تصديران في اليوم نفسه، قبل الانعكاس وبعده، العبارة نفسها؛ أما تحويم الزر الذي يعكس السطر فيقول كم غادرةً حمل كل شهر.',
  'ad.xls.gommeSpan': 'أول فعل محو وآخره',
  'ad.xls.gommeSpanValue': '{premier} → {dernier} · {n} يومًا',
  'ad.xls.gommeSpanOne': '{date} · فعل واحد محفوظ',
  'ad.xls.gommeSpanNone': 'لا مسحة على هذا الجهاز',
  'ad.xls.gommeSpanNote':
    'سطر «أول فعل محو وآخره» يقرأ، من ذاكرة جهاز شارة المسحات، يوم أول محو محفوظ ويوم آخره، مع عدد الأيام الفاصلة. ويوم البداية لا يُعاد وضعه أبدًا: تصديران في اليوم نفسه، قبل مسحة وبعدها، لم يعودا يحملان الفارق نفسه.',
  'ad.xls.airesJourFilsHint':
    'المحادثات {fils} التي أخذتها مناطق نُسخت اليوم، واحدة واحدة: {detail}. والمرور يعطي التفصيل محادثة بمحادثة، كشارة الرسائل.',
  'ad.xls.airesJourAireFilsHint': '{region} · {n} محادثة مأخوذة — {detail}.',
  'ad.xls.airesJourAireNoThread': '{region} · لا محادثة في الصندوق.',
  'ad.xls.airesJourNoThread': 'لا محادثة في الصندوق',
  'ad.xls.airesJourFilsNote':
    'تحت سطر «مناطق نُسخت اليوم»، تحمل كل منطقة عدّ محادثاتها، وعند المرور أسماءها واحدة واحدة — التفصيل نفسه الذي تعرضه شارة الرسائل، مقروءًا من ذاكرة الجهاز نفسها. والعمود الذي يلي كل اسم يقول كم محادثة أخذتها تلك المنطقة.',
  'ad.xls.airesJour': 'مناطق نُسخت اليوم وما زالت في الصندوق عند التصدير',
  'ad.xls.airesJourList': 'هذه المناطق المنسوخة اليوم، واحدة واحدة',
  'ad.xls.airesJourNote':
    'سطر «مناطق نُسخت اليوم» يحصي، لحظة التصدير، المناطق التي تحملها محادثات لوحة التحكم ويحمل نسخ محادثاتها تاريخ اليوم، المقروء من ذاكرة الجهاز نفسها التي تعتمدها شارة الرسائل. وهو والأسماء التي تليه يقودان إلى رسائل لوحة التحكم محصورة في هذه المناطق: يُقرأ فعل اليوم بنقرة، دون البحث عن الصندوق. وبذلك لا يحمل تصديران في اليوم نفسه، قبل نسخة وبعدها، الرقم نفسه. أما ترتيب «الأقدم نسخًا أولًا» الموضوع على سطر المحادثات في الرسائل فيُسمّى في سطر «مرشّح القائمة» مع الحساب الذي يفتتح ترتيبه؛ ويقول عند المرور بمؤشر الفأرة كم يومًا تفصل أقدم نسخ عن أحدثه. وفي الرسائل شارة تحصي هذه المناطق نفسها وتسمّي عند المرور بمؤشر الفأرة المحادثات التي أخذتها، واحدة واحدة؛ وممحاتها الصغيرة تمحو تاريخ كل مناطق الصندوق، أيًا كان يومها، فتحصيها الخلاصة حينها كمناطق لم تُنسخ قط.',
  'ad.xls.airesTightJour': 'مناطق محصورة في الرسائل — آخر نسخ لكل منها',
  'ad.xls.airesTightJourList': 'هذه المناطق وآخر نسخ لها',
  'ad.xls.airesTightJourListHint':
    'تُقرأ كل منطقة وتاريخ آخر نسخ لها على هذا السطر، بترتيب مناطق العالم؛ ونقرة على التاريخ تفتح الرسائل محصورة في هذه المناطق نفسها، ولكل منطقة سطرها الخاص حيث يُفتح تاريخها عليها وحدها.',
  'ad.xls.airesTightJourRow': '{region} · آخر نسخ في {date}',
  'ad.xls.airesTightJamaisRow': '{region} · لم تُنسخ قط',
  'ad.xls.airesTightOldest': 'أقدم تاريخ نسخ بين هذه المناطق',
  'ad.xls.airesTightOldestNone': 'بلا نسخ',
  'ad.xls.airesTightOldestNote':
    'سطر «أقدم تاريخ نسخ بين هذه المناطق» يعطي، في رأس الحصر، أقدم نسخ للمناطق المحفوظة — أو عبارة «بلا نسخ» حين لم تُنسخ أي منها بعد. ويقود، مثل سطر المناطق، إلى الرسائل المحصورة في هذه المناطق نفسها: يُقرأ التاريخ ويُفتح. وعند المرور بمؤشر الفأرة على اسم كل منطقة تُضاف قدم نسخها بالأيام إلى عدّ محادثاتها — «نُسخت قبل 12 يومًا» —، ليُوزن الحصر دون مغادرة المصنّف.',
  'ad.xls.airesTightAgeToday': 'نُسخت اليوم.',
  'ad.xls.airesTightAgeDays': 'نُسخت قبل {n} يومًا.',
  'ad.xls.airesTightAgeJamais': 'لم تُنسخ قط.',
  'ad.xls.airesTightTodayNote':
    'يحصي اسم الملف أيضًا، مباشرة بعد المناطق التي لم تُنسخ بعد، تلك التي يحمل نسخها تاريخ اليوم — « -releve-aujourdhui-2 » —، ليتمايز تصديران في اليوم نفسه بما نُسخ للتوّ. والممحاة الصغيرة في سطر المحادثات تعيد إلى الصفر نسخ هذه المناطق وحدها: يُمحى تاريخها، وتخرج من دفتر المناطق التي نسختها النسخة الشاملة، وتقولها الشارة من جديد لم تُنسخ قط — ولا تتحرك بقية مناطق الجهاز ولا عدّ الأفعال الشاملة.',
  'ad.xls.airesTightFils': 'محادثات تتركها المناطق المحصورة في الرسائل',
  'ad.xls.airesTightFilsTotalHint':
    'المناطق المحصورة تترك معًا {fils} محادثة في الصندوق · {n} منطقة — يُقرأ وزن الحصر على هذا السطر نفسه، دون النزول إلى عدّ المحادثات.',
  'ad.xls.airesTightFilsHint':
    '{region} · {n} محادثة في الصندوق — يُقرأ الرقم عند المرور بالمؤشر، دون فتح الرسائل.',
  'ad.xls.airesTightFilsParAireHint':
    '{n} محادثة في المجموع، منطقة منطقة: {detail} — يُقرأ وزن كل منطقة هنا، دون النزول إلى أسطرها.',
  'ad.xls.airesTightFilsNote':
    'سطر «محادثات تتركها المناطق المحصورة في الرسائل» يحصي، لحظة النقر، محادثات الصندوق التي ينتمي أحد طرفيها إلى إحدى هذه المناطق — والمحادثة لا تُحسب إلا مرة واحدة، حتى لو سمّتها منطقتان. وعند المرور بمؤشر الفأرة على اسم كل منطقة يُقرأ رقم محادثاتها وحدها دون فتح الرسائل. ويحمل اسم الملف، مباشرة بعد عدد المناطق، عدّ المحادثات التي تتركها معًا — «aires-2-7-fils » —، ثم محادثات كل منطقة، واحدة واحدة، بترتيب مناطق العالم — « par-aire-maghreb-4-golfe-3 » —، ثم أقدم تاريخ نسخ بصيغة يوم-شهر، ليُقرأ بنظرة واحدة في مجلد التنزيلات. ويحمل سطر المناطق هذا المجموع نفسه عند المرور بالمؤشر: يُوزن الحصر على السطر نفسه. ويعطي المرور بالمؤشر أيضًا التفصيل منطقة منطقة — « Maghreb 4 · Golfe 3 » —، ويحصي اسم الملف، مباشرة بعد أقدم تاريخ، المناطق التي لم تُنسخ بعد — « -sans-releve-2 ».',
  'ad.xls.airesTightJourNote':
    'سطر «مناطق محصورة في الرسائل» يستعيد المناطق التي كان الصندوق محصورًا فيها لحظة النقر، مع يوم آخر نسخ لمحادثاتها مقروءًا من هذا الجهاز — أو عبارة «لم تُنسخ قط». وتُسمّى كل منطقة في سطرها، ويقود اسمها إلى الرسائل المحصورة في تلك المنطقة وحدها. ويسقط السطر حين لم تكن أي منطقة محصورة: تقل الخلاصة سطرًا واحدًا فقط، ولا يتغير شيء آخر.',
  'ad.xls.reviewJournalSheet': 'سجل المراجعة',
  'ad.xls.reviewJournalN': 'الرقم',
  'ad.xls.reviewJournalThread': 'المحادثة المقروءة',
  'ad.xls.reviewJournalCompte': 'الحساب',
  'ad.xls.reviewJournalMail': 'بريد الحساب',
  'ad.xls.reviewJournalTime': 'ساعة الفتح',
  'ad.xls.reviewJournalSince': 'الدقائق منذ أول فتح',
  'ad.xls.reviewJournalGap': 'مهلة الرد',
  'ad.xls.reviewJournalLast': 'آخر رسالة في (الساعة)',
  'ad.xls.visitLength': 'مدة الزيارة',
  'ad.xls.reviewJournalCompteNote':
    'هذا المصنّف هو سجل المراجعة محصورًا في حساب واحد: يفتح سطرًا لكل محادثة نائمة لهذا الحساب قُرئت خلال الزيارة، بترتيب الفتح، مع الساعة والدقائق منذ أول فتح ومهلة الرد وآخر رسالة. ويعيد أسفله حدود الزيارة لتأريخها دون فتح المصنّف كله. ولا يحوي إلا ما استطاعت البطاقة قراءته، ويُمحى بانتهاء الزيارة.',
  'ad.xls.reviewJournalEmpty': 'لم تُقرأ أي محادثة نائمة خلال هذه الزيارة.',
  'ad.xls.reviewJournalSummary': 'خلاصة الزيارة',
  'ad.xls.reviewJournalReviewed': 'محادثات قُرئت خلال الزيارة',
  'ad.xls.reviewJournalFirstOpen': 'أول فتح',
  'ad.xls.reviewJournalLastOpen': 'آخر فتح',
  'ad.xls.reviewJournalSpan': 'الفرق بين أول فتح وآخر فتح',
  'ad.xls.reviewJournalSpanMin': '{n} دقيقة',
  'ad.xls.reviewJournalSpanHour': '{h} س {m}',
  'ad.xls.reviewJournalSummaryNote':
    'يقول أسفل السجل كم محادثة نائمة قُرئت خلال الزيارة، والفرق بين أول فتح وآخر فتح: تُقرأ مدة الزيارة بنظرة واحدة دون مقارنة تصديرين. والفرق يُقاس على عمليات الفتح المسجّلة، ولا يقول شيئًا عن زمن رد المحادثات.',
  'ad.xls.reviewJournalNote':
    'يفتح تبويب «سجل المراجعة» سطرًا لكل محادثة نائمة قُرئت خلال هذه الزيارة، بالترتيب الذي فُتحت به من الرسائل، مع الحساب الذي تنتمي إليه، ومتوسط مهلة الرد — القياس نفسه والحد نفسه الذي تعرضه شارة النوم — وساعة فتح المحادثة، لتأريخ المراجعة بالدقيقة، والدقائق المنقضية منذ أول فتح في الزيارة، لموقع كل محادثة داخل المراجعة، وتاريخ آخر رسالة فيها وساعتها — لتُقارن مدة انتظار المحادثة بلحظة قراءتها —، مع بريد الحساب إلى جانب اسمه لنسخه دون فتح البطاقة. ويبقى فارغًا إذا لم يُقرأ شيء، ويُمحى بانتهاء الزيارة.',
  'ad.xls.revueNote': 'يحمل اسم الملف حالة المراجعة — «revue-3-sur-8» مثلًا — لتمييز تصديرين في اليوم نفسه دون فتح المصنّف. وتُقرأ المراجعة على المحادثات النائمة التي فُتحت من الرسائل خلال هذه الزيارة. ويحمل أيضًا مدة الزيارة — «-duree-42min» مثلًا — مباشرة بعد عدد المحادثات المقروءة، لتمييز تصديرين لمراجعة واحدة توقفت لاحقًا. ويحمل أيضًا اسم الحساب الذي يفتتح ترتيب الرسائل النشط — «-tete-revue-…» أو «-tete-apres-…» — حين يكون أحد الترتيبين مفعّلًا.',
  'ad.xls.revuedNote': 'عمود «مقروء أثناء المراجعة» يحصي، لكل حساب، المحادثات النائمة التي فُتحت من الرسائل خلال هذه الزيارة — ذاكرة الجلسة نفسها التي يعرضها مؤشر «مقروء» على الشاشة. ويبقى صفرًا إذا لم يُقرأ شيء، ويُمحى بانتهاء الزيارة.',
  'ad.xls.lastRelance': 'آخر تذكير محضّر',
  'ad.xls.relanceNote': 'عمود «آخر تذكير محضّر»، وعمود «وصل بعد التذكير»، وعدّادات التذكيرات في الخلاصة مصدرها ذاكرة هذا الجهاز: يؤرّخان آخر رسالة فُتحت من لوحة التحكم، لا إرسالها. وعمود «وصل بعد التذكير» في تبويب «الحسابات» يُقرأ من الذاكرة نفسها. وسطر «حسابات دون أي تذكير محضّر» يحصي، على الجدولين، الحسابات التي يحملها المصنّف ولم تُفتح لها أي رسالة.',
  'ad.xls.withLate': 'حسابات بها مراجعة طويلة',
  'ad.xls.lateRows': 'إيداعات قيد مراجعة طويلة',
  'ad.xls.relancesToday': 'حسابات تم تذكيرها اليوم',
  'ad.xls.relancesWeek': 'حسابات تم تذكيرها هذا الأسبوع',
  'ad.xls.afterRelanceRows': 'إيداعات وصلت بعد تذكير',
  'ad.xls.afterRelanceLateRows': 'منها إيداعات بعد التذكير قيد مراجعة طويلة',
  'ad.xls.afterRelanceAccounts': 'حسابات بها إيداع وصل بعد تذكير',
  'ad.xls.sansRelance': 'حسابات دون أي تذكير محضّر',
  'ad.xls.lateCol': 'مراجعات طويلة',
  'ad.xls.lateComptes': '● {n} إيداعًا قيد مراجعة طويلة',
  'ad.xls.lateRowMark': '● قيد مراجعة طويلة',
  'ad.xls.comptesLateNote': 'يفتح تبويب «الحسابات» تحت كل حساب سطرًا لكل إيداع لا يزال قيد مراجعة طويلة مع عمره؛ والعمود الذي يسبقه لا يُظهر إلا الحسابات التي لديها واحد بعد.',
  'ad.xls.lateComptesSheet': 'حسابات في مراجعة طويلة',
  'ad.xls.lateAccountCount': 'مراجعات طويلة',
  'ad.xls.oldestDepot': 'أقدم إيداع',
  'ad.xls.lateComptesSheetEmpty': 'لا حساب له إيداع قيد مراجعة طويلة.',
  'ad.xls.lateComptesSheetNote': 'يفتح تبويب «حسابات في مراجعة طويلة» سطرًا لكل حساب ما زال ينتظر، مع عدد إيداعاته وأقدمها — نوعه وتاريخه وعمره، والتذكير المحضّر إن وُجد. وتسير أسطره وفق الترتيب المختار على الشاشة: حين تُرتّب القائمة حسب المراجعات الطويلة، يفتتح الحساب الأكثر تحميلًا المصنّف. عنوان أقدم إيداع يفتح سطره في تبويب «الإعلانات» بلوحة التحكم.',
  'ad.xls.lateOnlyNote': 'هذا المصنّف لا يحوي إلا إيداعات حساب واحد لا تزال قيد مراجعة منذ أكثر من سبعة أيام، مع عمرها وتاريخ التذكير المحضّر؛ وهذا التاريخ مصدره ذاكرة هذا الجهاز لا إرساله.',
  'ad.xls.afterRelance': 'وصل بعد التذكير',
  'ad.xls.afterRelanceYes': '● وصل بعد التذكير',
  'ad.xls.afterRelanceNo': 'قبل التذكير',
  'ad.xls.afterRelanceComptes': '● {n} إيداعًا وصل بعد التذكير',
  'ad.xls.afterRelanceRank': 'الرتبة {r} / {t}',
  'ad.xls.comptesDetache': 'تبويب «الحسابات» على ترتيب الجدول',
  'ad.xls.comptesPromoOrder': 'تبويب «الحسابات» مرتّب حسب الترقية، الأقدم أولًا',
  'ad.xls.comptesPromoOrderRecent': 'تبويب «الحسابات» مرتّب حسب الترقية، الأحدث أولًا',
  'ad.xls.afterSheet': 'إيداعات بعد تذكير',
  'ad.xls.afterSheetEmpty': 'لا إيداع لهذا الحساب وصل بعد التذكير.',
  'ad.xls.afterSheetNote': 'هذا المصنّف لا يحوي إلا إيداعات حساب واحد المؤرّخة بعد التذكير المحضّر، وتاريخ التذكير مصدره ذاكرة هذا الجهاز لا إرساله. وكتلة «منذ التذكير» تعيد عدد هذه الإيداعات، ومنها ما ينتظر ردًا منذ أكثر من سبعة أيام، ورتبة الحساب بين من وصلت لهم مثلها — القياس نفسه الذي تعرضه البطاقة.',
  'ad.xls.afterSheetSummary': 'منذ التذكير',
  'ad.xls.afterSheetLate': 'منها قيد مراجعة طويلة',
  'ad.xls.afterSheetRank': 'الرتبة بين الحسابات',
  'ad.xls.lateSheet': 'مراجعات طويلة',
  'ad.xls.lateSheetEmpty': 'لا إيداع ينتظر ردًا منذ أكثر من سبعة أيام.',
  'ad.xls.lateNote': 'تبويب «مراجعات طويلة» يفتح سطرًا لكل إيداع لا يزال دون رد منذ أكثر من سبعة أيام، مع عمره وتاريخ تذكيره وشارة «وصل بعد التذكير» وبريد الحساب الذي أودعه. تاريخ التذكير مصدره ذاكرة هذا الجهاز، مثل عمود «آخر تذكير محضّر»، ويبقى فارغًا إذا لم تُفتح أي رسالة. وتسير أسطره وفق الترتيب المختار على الشاشة: عند الترتيب حسب الإيداعات الواصلة بعد التذكير، تتبع الحسابات الترتيب نفسه ويحفظ كل حساب إيداعاته من الأقدم إلى الأحدث.',
  'ad.xls.indentedNote': 'في تبويب «المشتركون»، يفتح عمود «مراجعات طويلة» تحت كل حساب سطرًا لكل إيداع لا يزال دون رد، بخط مُزاح، مع عمره ونوعه وتاريخ إيداعه. وإذا حُضّر تذكير للحساب، يسبقه سطر مُزاح يذكّر كم إيداعًا وصل بعده ورتبة الحساب بين من وصلت لهم مثل هذه الإيداعات — القياس نفسه الذي تعرضه البطاقة.',
  'ad.xls.accountMail': 'الحساب (البريد)',
  'ad.xls.depot': 'الإيداع',
  'ad.xls.type': 'النوع',
  'ad.xls.rubrique': 'الرُّكن',
  'ad.xls.postedOn': 'أُودع في',
  'ad.xls.ageDays': 'العمر (أيام)',
  'ad.xls.relanceOn': 'حُضّر التذكير في',
  'ad.xls.note': 'مصنّف مقروء من أسطر لوحة التحكم: كل اشتراك يحفظ الصيغة والمبلغ والأجل ووسيلة الدفع كما تُعرض على الشاشة، مع إيداعاته المنشورة والمرفوضة.',

  'ad.f.stamp': 'بطاقة الحساب',
  'ad.f.title': 'بطاقة الحساب',
  'ad.f.close': 'إغلاق',
  'ad.f.loading': 'جارٍ تحميل البطاقة…',
  'ad.f.err': 'تعذّر تحميل البطاقة.',
  'ad.f.identity': 'الهوية',
  'ad.f.mail': 'البريد',
  'ad.f.phone': 'الهاتف',
  'ad.f.role': 'الدور',
  'ad.f.roleAdmin': 'مسؤول',
  'ad.f.roleOther': 'حساب عادي',
  'ad.f.abo': 'الاشتراكات',
  'ad.f.aboEmpty': 'لا اشتراك مرتبط بهذا الحساب.',
  'ad.f.aboPayHint':
    'تحصيل هذا الاشتراك، مقروءًا بالقاعدة نفسها التي تعتمدها شاشة «المدفوعات»: مفتوح، بمبلغ محدّد، وقابل للخصم.',
  'ad.f.aboPayOpenHint':
    'يفتح شاشة «المدفوعات» محصورة في هذا الحساب، بالقاعدة نفسها التي تعتمدها هذه الشارة.',
  'ad.f.aboRegler': '{n} بحاجة إلى تسوية',
  'ad.f.aboReglerHint':
    'يفتح شاشة «المدفوعات» محصورة في هذا الحساب وفي هذا العرض وحده: الاشتراكات التي لا يمكن تحصيلها بعد.',
  'ad.f.aboPrets': '{n} قابلة للتحصيل',
  'ad.f.aboPretsHint':
    'يفتح شاشة «المدفوعات» محصورة في هذا الحساب وفي عرض «قابلة للتحصيل»، مرتّبة مسبقًا تنازليًا حسب المبلغ: الاشتراكات المفتوحة، بمبلغ محدّد، والقابلة للخصم كما هي، والأكثر ربحًا أولًا.',
  'ad.f.aboNone': 'الاشتراكات: لا شيء',
  'ad.f.annonces': 'الإيداعات',
  'ad.f.annoncesEmpty': 'لا إيداع لهذا الحساب.',
  'ad.f.publies': 'منشورة',
  'ad.f.refuses': 'مرفوضة',
  'ad.f.attente': 'قيد المراجعة',
  'ad.f.demandes': 'طلبات B2B',
  'ad.f.demandesEmpty': 'لا طلب B2B أرسله هذا الحساب.',
  'ad.f.copy': 'نسخ العنوان والخلاصة',
  'ad.f.copyHint': 'ينسخ عنوان الحساب وكل اشتراك بمبلغه وأجله، وعدد الإيداعات المنشورة والمرفوضة وقيد المراجعة الطويلة.',
  'ad.f.depotNone': 'لا إيداع',
  'ad.f.depotNoneCopy': 'الإيداعات: لا شيء',
  'ad.f.lateCopy': 'قيد مراجعة طويلة',
  'ad.f.lateCopyNone': 'لا مراجعة طويلة',
  'ad.f.depotToday': 'مودع اليوم',
  'ad.f.depotSince': 'بانتظار الرد منذ {n} يومًا',
  'ad.f.depotSinceHint':
    'الأيام المنقضية منذ الإيداع: بعد سبعة أيام بلا رد تضيء الشارة.',
  'ad.f.lateLink': 'عرض {n} من إيداعاته قيد المراجعة الطويلة',
  'ad.f.lateLinkHint':
    'يفتح تبويب «الإعلانات» محصورًا في إيداعات هذا الحساب التي تراوح المراجعة أكثر من سبعة أيام.',
  'ad.f.lateSheet': 'مصنّف مراجعاته الطويلة',
  'ad.f.lateSheetHint':
    'ينزّل مصنّفًا محصورًا في إيداعات هذا الحساب التي تراوح المراجعة أكثر من سبعة أيام، بتاريخها وعمرها والتذكير المحضّر.',
  'ad.f.afterRelance': '{n} إيداعًا وصل بعد التذكير',
  'ad.f.afterRelanceNone': 'لا إيداع بعد التذكير',
  'ad.f.afterRelanceRank': 'الرتبة {r} من {t}',
  'ad.f.afterRelanceRankHint':
    'رتبة الحساب بين الحسابات التي وصل أحد إيداعاتها بعد تذكيرها: الأول هو الأقل تغطية برسالته.',
  'ad.f.afterRelanceHint':
    'إيداعات هذا الحساب المؤرّخة بعد تحضير الرسالة: التذكير لا يشملها، وتستدعي قراءة مستقلة.',
  'ad.f.afterRelanceList': 'إيداعات وصلت بعد التذكير',
  'ad.f.afterRelanceListLate': 'إيداعات وصلت بعد التذكير وقيد مراجعة طويلة',
  'ad.f.afterRelanceLateFilterHint':
    'نقرة تحصر قائمة الإيداعات الواصلة بعد التذكير في تلك التي تنتظر ردًا منذ أكثر من سبعة أيام؛ ونقرة ثانية تعيدها كاملة.',
  'ad.f.afterRelanceOpen': 'فتح هذا الإيداع في تبويب «الإعلانات»',
  'ad.f.afterSheet': 'مصنّف إيداعاته بعد التذكير',
  'ad.f.afterSheetHint':
    'ينزّل مصنّفًا محصورًا في إيداعات هذا الحساب التي وصلت بعد التذكير، بتاريخها وعمرها وحالتها.',
  'ad.f.afterRelanceLate':
    'منها {n} قيد مراجعة طويلة',
  'ad.f.afterRelanceLateHint':
    'من الإيداعات الواصلة بعد التذكير، تلك التي تنتظر ردًا منذ أكثر من سبعة أيام: الرسالة لم تشملها والانتظار صار قائمًا فعلًا.',
  'ad.f.prioCopy': 'نسخ الأولويات',
  'ad.f.prioCopyHint':
    'ينسخ خلاصة المحادثات النائمة مع متوسط مهلة الرد، ثم الإيداعات قيد المراجعة الطويلة مع مدة انتظارها — جاهزة للصق في رسالة.',
  'ad.f.prioLateShort': 'إيداعات قيد مراجعة طويلة',
  'ad.f.prioLateLine': '{n} إيداعًا قيد مراجعة طويلة',
  'ad.f.prioLateNone': 'لا مراجعة طويلة: لا إيداع ينتظر منذ أكثر من سبعة أيام.',
  'ad.f.relance': 'تحضير تذكير',
  'ad.f.relanceHint':
    'يفتح رسالة معبّأة مسبقًا: الإيداعات التي تنتظر مع عمرها، وسطر خلاصة الحساب.',
  'ad.f.lastRelance': 'آخر تذكير محضّر',
  'ad.f.priorites': 'الأولويات',
  'ad.f.weekExport': 'صُدّر هذا الأسبوع',
  'ad.f.weekExportOpen': 'فتح المدفوعات لإنتاج التصدير',
  'ad.f.weekExportHint':
    'عدّاد تصديرات الجدول خلال الأيام السبعة الأخيرة، مقروءًا من ذاكرة هذا الجهاز. ونقرة تفتح شاشة «المدفوعات» محصورة في هذا الحساب، لإنتاج التصدير المفقود.',
  'ad.f.weekScopeTitle': 'تصديرات الأسبوع، على هذا الحساب',
  'ad.f.weekScopeHint':
    'تصديرات الأيام السبعة الأخيرة مقروءة على نطاق هذا الحساب وحده: ما تزنه اشتراكاته بالعرض والسبب اللذين يحملهما كل ملف، وعدد أسطره. ولا تُحفظ إلا التصديرات التي حملت سطرًا واحدًا له على الأقل.',
  'ad.f.weekScopeRows': '{n} سطرًا للحساب',
  'ad.f.weekScopeNone':
    'لا تصدير في الأسبوع حمل هذا الحساب: لا شيء لقراءته على نطاقه.',
  'ad.f.weekScopeNoMemory':
    'لا تصدير معروف على هذا الجهاز: لا شيء للأسبوع لقراءته لهذا الحساب.',
  'ad.f.weekScopeAvg': 'المتوسط {n}',
  'ad.f.weekScopePeak': 'الأعلى {n} في {date}',
  'ad.f.weekScopePeakHint':
    'التصدير الذي وزن فيه هذا الحساب أكثر ما وزن في الأسبوع، وتاريخه: يُقرأ الأعلى إلى جانب المتوسط. وتصدير واحد بمبلغ لا يصنع ذروة.',
  'ad.f.weekScopePeakOpenHint':
    'نقرة تفتح هذا التصدير في «المدفوعات»، محصورًا في هذا الحساب.',
  'ad.f.weekScopeAvgNote': 'على {n} تصديرًا',
  'ad.f.weekScopeAvgOpenHint':
    'نقرة تفتح مقارنة تصديرين من تصديرات الأسبوع مختارين مسبقًا لهذا الحساب — الأقدم والأحدث اللذين حملاه —، لقراءة فرق المبلغ والأسطر بينهما.',
  'ad.f.weekScopeAvgHint':
    'معدل المبالغ التي يزنها هذا الحساب، مقروءًا من تصديرات الأسبوع التي حملته، بعرضها وسببها. والتصديرات التي لم يكن فيها أي سطر لا تدخل في المتوسط.',
  'ad.f.weekScopeOpen':
    'فتح هذا التصدير في «المدفوعات»، محصورًا في هذا الحساب',
  'ad.f.weekScopeCmpTitle': 'بين تصديرين',
  'ad.f.weekScopeCmpFrom': 'البداية',
  'ad.f.weekScopeCmpTo': 'الوصول',
  'ad.f.weekScopeCmpUp': '+{n} في مبلغ أسطره',
  'ad.f.weekScopeCmpDown': '−{n} في مبلغ أسطره',
  'ad.f.weekScopeCmpFlat': 'المبلغ لم يتغيّر',
  'ad.f.weekScopeCmpHint':
    'لا يُحسب الفرق إلا على أسطر هذا الحساب، مقروءة بالعرض والسبب اللذين يحملهما كل تصدير: لا يقول شيئًا عن الجدول كله.',
  'ad.f.weekScopeCmpOpenHint':
    'نقرة تفتح مقارنة هذين التصديرين في «المدفوعات»، مختارين مسبقًا لهذا الحساب.',
  'ad.f.weekScopeCmpNote':
    'التصديران الأكثر تباعدًا في الأسبوع واللذان كانا يحملان أسطرًا للحساب، مع فرق مبلغ أسطره وحده — لا مبلغ الطابور كله.',
  'ad.f.weekScopeCmpParties': 'مغادرة −{n} من أسطره',
  'ad.f.weekScopeCmpPartiesHint':
    'المبلغ الذي سحبته الأسطر المغادرة بين التصديرين من نطاق الحساب، بعد العثور عليها في الجدول بمعرّفها.',
  'ad.f.weekScopeCmpPartiesUnknown':
    '{n} سطرًا غادر ولم يعد في الجدول: لا يُقرأ مبلغه بعد، ولا يدخل في الرقم الموضوع أعلاه.',
  'ad.f.weekScopeCmpPartiesList': 'الأسطر المغادرة {n}، واحدًا واحدًا',
  'ad.f.weekScopeCmpPartiesListHint':
    'الأسطر المغادرة بين التصديرين، مسمّاة تحت المبلغ الذي سحبته، من الأثقل إلى الأخفّ: تُقرأ البطاقة دون فتح المصنّف. والسطر الذي لم يعد في الجدول لا يظهر فيها.',
  'ad.f.weekScopeCmpPartiesTotal': 'المجموع المسحوب −{n}',
  'ad.f.weekScopeCmpPartiesNoTotal': 'المجموع غير متاح',
  'ad.f.weekScopeCmpPartiesNoAmount': 'مبلغ فارغ',
  'ad.f.weekScopeCmpPartiesMajor':
    'منها {n} سطرًا يزن وحده أكثر من نصف المبلغ المسحوب ({t}).',
  'ad.f.weekScopeCmpPartiesMajorNone':
    'لا سطر من هذه يزن وحده أكثر من نصف المبلغ المسحوب: السحب موزّع على عدة أسطر.',
  'ad.f.weekScopeCmpPartiesMajorHint':
    'يُحسب على الأسطر المسمّاة في القائمة، لا على مجموع المغادرات: السطر الذي لم يعد في الجدول لا يُوزن فيها.',
  'ad.f.weekScopeCmpPartiesMajorOn': 'القائمة محصورة في {n} سطرًا',
  'ad.f.weekScopeCmpPartiesMajorTokenHint':
    'نقرة تحصر قائمة الأسطر المغادرة في تلك التي تزن وحدها أكثر من نصف المبلغ المسحوب؛ ونقرة ثانية تعيدها كاملة. والملف يتبع القائمة المحصورة.',
  'ad.f.weekScopeCmpPartiesMajorExitHint':
    'نقرة تعيد القائمة الكاملة للأسطر المغادرة، بترتيب المبلغ المسحوب.',
  'ad.f.weekScopeCmpPartiesShare': 'تتقاسم السحب · {n}',
  'ad.f.weekScopeCmpPartiesShareHint':
    'نقرة تحصر قائمة الأسطر المغادرة في تلك التي لا تزن وحدها أكثر من نصف المبلغ المسحوب — التي تتقاسم السحب؛ ونقرة ثانية تعيدها كاملة. والملف يتبع القائمة المحصورة.',
  'ad.f.weekScopeCmpPartiesShareOn': 'القائمة محصورة في {n} سطرًا متقاسمًا',
  'ad.f.weekScopeCmpPartiesShareExitHint':
    'نقرة تعيد القائمة الكاملة للأسطر المغادرة، بترتيب المبلغ المسحوب.',
  'ad.f.weekScopeCmpPartiesShareNote':
    'الأسطر المتقاسم {n} تتقاسم {p} % من السحب · {s}',
  'ad.f.weekScopeCmpPartiesShareNoteHint':
    'حصة السحب التي تتقاسمها الأسطر التي لا تزن وحدها أكثر من النصف: مجموعها منسوبًا إلى المبلغ المسحوب الكلي، بالنسبة المئوية، وما تزنه صريحًا.',
  'ad.f.weekScopeCmpSheet': 'مصنّف المقارنة',
  'ad.f.weekScopeCmpSheetHint':
    'ينزّل مصنّفًا محصورًا في نطاق هذا الحساب: التصديران وما كان يزنه فيهما، وفرق المبلغ والأسطر في أسطره وحده، ثم الأسطر المغادرة وما سحبه كل واحد منها.',
  'ad.f.weekScopeCmpFils': 'الخيوط النشطة عند التصدير',
  'ad.f.weekScopeCmpFilsSame':
    'يُقرأ العدد نفسه في النقطتين: إنه يصف حالة الحساب لحظة التصدير، ولا يُستنتج من الفرق بين الأرشيفين.',
  'ad.f.weekScopeCmpFilsNote':
    'محادثات الحساب التي تُجيب في أقل من يوم، محسوبة في لحظة إنتاج المصنّف: حالة الحساب، لا فرقًا بين التصديرين.',
  'ad.f.weekScopeCmpPartiesMajorMark': 'أكثر من النصف',
  'ad.f.weekScopeCmpPartiesMajorLine': 'منها {n} سطرًا يزن أكثر من النصف — CSV مصغّر',
  'ad.f.weekScopeCmpPartiesMajorLineHint':
    'ينزّل بصيغة CSV الأسطر وحدها التي تزن وحدها أكثر من نصف المبلغ المسحوب، مع ما سحبته ومجموعها الخاص: الملف لا يحمل إلا هذه الأسطر، دون حصر القائمة على الشاشة.',
  'ad.f.weekScopeCmpPartiesCsv': 'CSV للأسطر المغادرة',
  'ad.f.weekScopeCmpPartiesCsvHint':
    'ينزّل بصيغة CSV قائمة الأسطر المغادرة للحساب وحدها، كما تُقرأ تحت المبلغ المسحوب — من الأثقل إلى الأخفّ —، مع المبلغ الذي سحبه كل سطر والمجموع تحت الأسطر. والسطر الذي غادر الجدول لا يُسمّى فيها: يُحصى تحت القائمة.',
  'ad.f.revueTitre': 'مراجعة هذا الحساب',
  'ad.f.revueFils': '{n} محادثات قُرئت',
  'ad.f.revueOpenHint':
    'يفتح الرسائل محصورة في المحادثات النائمة لهذا الحساب، في نمط المراجعة: كل محادثة تُفتح تؤشّر التقدّم، دون البحث عن المحادثات في القائمة.',
  'ad.f.revueDebut': 'أول فتح',
  'ad.f.revueFin': 'آخر فتح',
  'ad.f.revueEcart': 'الفرق',
  'ad.f.revueSheet': 'سجل مراجعة هذا الحساب',
  'ad.f.revueSheetHint':
    'نقرة تفتح سجل المراجعة محصورًا في هذا الحساب، مع ساعة ودقائق كل فتح، ومهلة الرد وآخر رسالة في كل محادثة قُرئت.',
  'ad.f.revueNote':
    'محادثات هذا الحساب النائمة التي قُرئت خلال الزيارة، مع ساعة أول فتح وآخر فتح والفرق بينهما: تُقرأ مدة الزيارة هنا دون فتح المصنّف. والفرق يتحدث عن المراجعة، لا عن زمن رد المحادثات.',
  'ad.f.sleepThreads': 'محادثات نائمة',
  'ad.f.sleepThreadsHint':
    'محادثات هذا الحساب التي تحتاج يومًا أو أكثر للرد: تتقدّم على بقية البطاقة.',
  'ad.f.sleepThreadsNone': 'لا محادثة نائمة: كل محادثات هذا الحساب ترد في أقل من يوم.',
  'ad.f.allThreads': 'كل المحادثات',
  'ad.f.allThreadsOff': 'النائمة وحدها',
  'ad.f.allThreadsHint':
    'يفتح القائمة على كل محادثات الحساب، النشطة منها أيضًا: كل سطر يحمل الباب نفسه إلى المحادثة كما يراها الحساب.',
  'ad.f.allThreadsExitHint':
    'يعيد القائمة إلى المحادثات النائمة وحدها، تلك التي تتقدم على بقية البطاقة.',
  'ad.f.actifsThreads': 'محادثات نشطة',
  'ad.f.actifsThreadsHint':
    'محادثات هذا الحساب التي ترد في أقل من يوم: تُقرأ إلى جانب النائمة، دون فتح القائمة.',
  'ad.f.sleepOpen': 'فتح المحادثة في الرسائل',
  'ad.f.sleepOpenPublic': 'افتح هذه المحادثة',
  'ad.f.sleepOpenPublicHint':
    'تفتح المحادثة كما يراها الحساب في لسان آخر: تبقى البطاقة في مكانها خلفها.',
  'ad.f.relanceToday': 'اليوم',
  'ad.f.relanceAgo': 'منذ {n} يومًا',
  'ad.f.relanceSoonHint':
    'حُضّر تذكير قبل أقل من ثلاثة أيام: الانتظار لم يتغيّر على الأرجح، تحقّق قبل تحضير آخر.',

  'ad.r.stamp': 'تذكير',
  'ad.r.title': 'تذكير معبّأ مسبقًا',
  'ad.r.lead': 'تستعيد الرسالة الإيداعات التي تنتظر وسطر خلاصة الحساب. عدّلها قبل الإرسال؛ لا شيء يُرسل من هنا.',
  'ad.r.field': 'الرسالة',
  'ad.r.subject': 'إيداعاتكم قيد المراجعة — {n} في الانتظار',
  'ad.r.subjectLabel': 'الموضوع',
  'ad.r.greet': 'مرحبًا،',
  'ad.r.greetNamed': 'مرحبًا {nom}،',
  'ad.r.intro': 'نعود إليكم بخصوص {n} إيداعًا لا يزال قيد المراجعة:',
  'ad.r.introAccount': 'نعود إليكم بخصوص حسابكم:',
  'ad.r.outro': 'نبقى رهن إشارتكم لأي توضيح.',
  'ad.r.sign': 'فريق PaperAtlas',
  'ad.r.copy': 'نسخ الرسالة',
  'ad.r.copyHint': 'ينسخ الرسالة كما هي، جاهزة للصق في برنامج البريد.',
  'ad.r.mail': 'فتح في البريد',
  'ad.r.close': 'إغلاق',

  'ad.ann.stamp': 'الإعلانات والعروض',
  'ad.ann.sub': 'كل إيداع وحالته بعد المراجعة. النشر يضع الإعلان في اللوحة، والإعادة إلى الانتظار تسحبه.',
  'ad.ann.all': 'الكل',
  'ad.ann.search': 'ابحث في العنوان أو المؤسسة أو المدينة…',
  'ad.ann.open': 'افتح هذه الشاشة',
  'ad.ann.openHint':
    'تفتح البطاقة العمومية لهذا الإيداع في لسان آخر: تبقى القائمة في مكانها خلفه.',
  'ad.ann.empty': 'لا يوجد إعلان مودع بعد.',
  'ad.ann.none': 'لا إعلان يطابق هذه المعايير.',
  'ad.ann.publish': 'نشر',
  'ad.ann.wait': 'إعادة إلى الانتظار',
  'ad.ann.refuse': 'رفض',
  'ad.ann.busy': 'جارٍ الحفظ…',
  'ad.ann.err': 'فشل تغيير الحالة.',
  'ad.ann.kind': 'النوع',
  'ad.ann.cardOrg': 'المؤسسة',
  'ad.ann.cardCity': 'المدينة',
  'ad.ann.cardBudget': 'الميزانية',
  'ad.ann.cardKind': 'الطبيعة',
  'ad.ann.cardRubrique': 'القسم',
  'ad.ann.kindOffre': 'عرض',
  'ad.ann.kindAnnonce': 'إعلان',
  'ad.ann.cardMail': 'البريد',
  'ad.ann.cardDate': 'التاريخ',
  'ad.ann.aboSoon': 'الأجل',
  'ad.ann.aboSoonHint': 'اشتراك هذا الحساب يقترب من أجله: تذكير قبل الانقطاع.',
  'ad.ann.soonChip': 'حسابات أجلها قريب',
  'ad.ann.soonEmpty': 'لا إيداع من حساب أجلُه قريب.',
  'ad.ann.lateChip': 'مراجعة أكثر من 7 أيام',
  'ad.ann.lateHint': 'إيداعات لا تزال قيد المراجعة منذ أكثر من سبعة أيام: تنتظر ردًا.',
  'ad.ann.lateEmpty': 'لا إيداع ينتظر ردًا منذ أكثر من سبعة أيام.',
  'ad.ann.lateBadge': 'قيد المراجعة منذ {n} يومًا',
  'ad.ann.sortLate': 'قدم المراجعة',
  'ad.ann.sortLateHint': 'ترتيب الإعلانات حسب قدم المراجعة: الإيداع الأطول انتظارًا يأتي أولًا.',
  'ad.ann.focus': 'المراجعات الطويلة لـ {mail}',
  'ad.ann.focusClear': 'عرض كل الإعلانات',
  'ad.ann.focusRelance': 'حُضّر تذكير في {date} · لم يصل أي رد بعد.',
  'ad.ann.relanceBtn': 'تحضير تذكير',
  'ad.ann.relanceBtnHint':
    'يفتح الرسالة المعبّأة مسبقًا لهذا الحساب — الإيداعات المنتظرة وسطر الخلاصة — دون مغادرة التبويب.',
  'ad.ann.rowRelance': 'تذكير بتاريخ {date}',
  'ad.ann.rowRelanceHint':
    'تاريخ آخر رسالة حُضّرت لهذا الحساب: كل إيداع يبيّن هل سبقها أم جاء بعدها.',
  'ad.ann.rowRelanceBefore': 'هذا الإيداع سبقها',
  'ad.ann.rowRelanceAfter': 'أُودع بعد التذكير',
  'ad.ann.focusAfter': '{n} إيداعًا وصل بعد التذكير',
  'ad.ann.focusAfterNone': 'لا إيداع وصل بعد التذكير',
  'ad.ann.focusAfterHint':
    'إيداعات هذا الحساب المؤرّخة بعد تحضير الرسالة: التذكير لا يشملها، وتستدعي قراءة مستقلة.',
  'ad.ann.focusDepot': 'إيداع مفتوح · {titre}',
  'ad.ann.focusAccountAll': 'عرض كل إيداعات الحساب',
  'ad.ann.afterChip': 'وصلت بعد التذكير',
  'ad.ann.afterChipHint':
    'لا يُبقي إلا إيداعات هذا الحساب التي وصلت بعد تذكيره المحضّر، أي ما لا تشمله الرسالة.',
  'ad.ann.afterChipEmpty':
    'لا إيداع لهذا الحساب وصل بعد التذكير: الرسالة تشمل كل ما أُودع.',
  'ad.ann.sortAfter': 'إيداعات بعد التذكير',
  'ad.ann.sortAfterHint':
    'يرتّب الإيداعات فيضع أولًا ما أُرّخ بعد تحضير الرسالة، أي ما لا يشمله التذكير؛ ويبقى الترتيب المختار نفسه داخل المجموعتين.',
  'ad.ann.afterExport': 'مصنّف هذه الإيداعات',
  'ad.ann.afterExportHint':
    'ينزّل مصنّفًا محصورًا في إيداعات هذا الحساب التي وصلت بعد التذكير، بتاريخها وعمرها وحالتها.',
  'ad.ann.afterExportEmptyHint':
    'لا إيداع لهذا الحساب وصل بعد التذكير: لا شيء لفتحه.',

  'ad.msg.stamp': 'الرسائل',
  'ad.msg.sub': 'كل محادثات المنصة: القائمة على اليسار والرسائل على اليمين.',
  'ad.msg.empty': 'لا توجد محادثة بعد.',
  'ad.msg.none': 'لا رسائل في هذه المحادثة.',
  'ad.msg.pick': 'اختر محادثة على اليسار لقراءتها.',
  'ad.msg.loading': 'جارٍ تحميل المحادثة…',
  'ad.msg.err': 'تعذّر تحميل المحادثة.',
  'ad.msg.reply': 'رد',
  'ad.msg.replyNote': 'الرد يخرج بالبريد: الكتابة داخل محادثة عضو تبقى لطرفيها وحدهما.',
  'ad.msg.openCompte': 'فتح بطاقة الحساب',
  'ad.msg.openCompteHint':
    'ينتقل من المحادثة المفتوحة إلى بطاقة الحساب: اشتراكاته وإيداعاته وأولوياته، دون المرور بجدول المشتركين.',
  'ad.msg.openThread': 'افتح هذه المحادثة',
  'ad.msg.openThreadHint':
    'تفتح المحادثة كما يراها الحساب في لسان آخر: تبقى قائمة لوحة التحكم في مكانها خلفها.',
  'ad.msg.reviewed': 'تمت مراجعتها',
  'ad.msg.reviewedOne': 'مقروء',
  'ad.msg.reviewHint':
    'محادثات نائمة فُتحت خلال هذه الزيارة: يبيّن المؤشر أين توقفت المراجعة، ويُمحى بانتهاء الزيارة.',
  'ad.msg.reviewClearHint':
    'يمحو مؤشرات هذه المراجعة؛ وتبقى القائمة والمرشّح والمحادثة المفتوحة كما هي.',
  'ad.msg.reviewGaugeHint':
    'المحادثات النائمة المقروءة من مجموع المحادثات النائمة التي تحصيها القائمة: تتبع المؤشر مرشّح النائمة وتتقدّم مع كل محادثة تُفتح.',
  'ad.msg.restant': 'في انتظار المراجعة',
  'ad.msg.restantOnly': 'الباقي للمراجعة',
  'ad.msg.restantHint':
    'لا يُبقي إلا المحادثات النائمة التي لم تُفتح بعد خلال هذه الزيارة؛ ونقرة ثانية تعيد القائمة كاملة. تتبع الشارة المراجعة الجارية ولا تُحفظ من زيارة إلى أخرى.',
  'ad.msg.restantOnlyOn': 'مراجعة محصورة في المحادثات النائمة غير المقروءة بعد',
  'ad.msg.restantEmpty':
    'رُوجعت كل المحادثات النائمة خلال هذه الزيارة: لم يبقَ أي منها لفتحه.',
  'ad.msg.restantAllDone': 'اكتملت المراجعة',
  'ad.msg.restantNoneHint':
    'فُتحت كل محادثة نائمة خلال هذه الزيارة؛ وتُمحى المؤشرات بانتهائها.',
  'ad.msg.copyMail': 'نسخ العنوان',
  'ad.msg.participants': 'المشاركون',
  'ad.msg.count': 'رسائل',
  'ad.msg.sortLabel': 'ترتيب',
  'ad.msg.sortReview': 'المراجعة',
  'ad.msg.sortReviewHint':
    'نقرة تضع في المقدمة المحادثات النائمة التي لم تُفتح خلال هذه الزيارة، ثم النائمة المقروءة، ثم الباقي؛ ونقرة ثانية تعيد ترتيب القائمة.',
  'ad.msg.sortApres': 'بعد تذكير',
  'ad.msg.apres': 'بعد تذكير',
  'ad.msg.apresOnly': 'بعد التذكير فقط',
  'ad.msg.apresOnlyHint':
    'لا يُبقي إلا المحادثات التي أودع حسابها شيئًا بعد رسالة التذكير، أي ما لا تشمله الرسالة؛ ونقرة ثانية تعيد القائمة كاملة. ويُحفظ الاختيار من زيارة إلى أخرى، والممحاة الصغيرة تعيد القائمة كاملة.',
  'ad.msg.apresClearHint':
    'يمحو شارات القائمة — النائمة، والباقي للمراجعة، وبعد التذكير — للعودة إلى قائمة كاملة. ويُحفظ هذا الفعل من زيارة إلى أخرى.',
  'ad.msg.apresOnlyOn': 'مراجعة محصورة في المحادثات التي أودع حسابها بعد التذكير',
  'ad.msg.apresEmpty':
    'لا محادثة في القائمة لها إيداع وصل بعد التذكير: الرسالة تشمل كل ما أُودع.',
  'ad.msg.sortAire': 'حسب المنطقة',
  'ad.msg.sortAireHint':
    'نقرة ترتّب القائمة تحت اسم كل منطقة من مناطق العالم، بترتيب المناطق؛ ومن لا تُعرف منطقته يغلق القائمة. ونقرة ثانية تعيد ترتيب القائمة.',
  'ad.msg.sortAireGroups': '{n} منطقة',
  'ad.msg.sortRecent': 'الأحدث نسخًا',
  'ad.msg.sortRecentHint':
    'نقرة تقدّم محادثات المناطق التي خرج نسخها من هذا الجهاز حديثًا، الأحدث أولًا؛ أما المناطق التي لم تُنسخ قط والمحادثات بلا منطقة معروفة فتأتي في المؤخرة. ونقرة ثانية تعيد ترتيب القائمة.',
  'ad.msg.sortJamais': 'المنطقة التي لم تُنسخ قط أولًا',
  'ad.msg.sortJamaisHint':
    'نقرة تقدّم محادثات المناطق التي لم يخرج نسخها بعد — لا نسخ شامل ولا مفرد —، بترتيب مناطق العالم: فتظهر مناطق الصندوق دفعة واحدة. أما المناطق المنسوخة والمحادثات بلا منطقة معروفة فتأتي في المؤخرة. ونقرة ثانية تعيد ترتيب القائمة.',
  'ad.msg.aireGroupNone': 'بلا منطقة معروفة',
  'ad.msg.sortAncien': 'الأقدم نسخًا أولًا',
  'ad.msg.sortAncienHint':
    'نقرة تقدّم محادثات المناطق التي انطلق نسخها منذ أطول مدة من هذا الجهاز، الأقدم أولًا: فما ينتظر منذ أطول مدة يظهر دفعة واحدة. أما المناطق التي لم تُنسخ قط والمحادثات بلا منطقة معروفة، فلا تاريخ لها وتأتي في المؤخرة. ونقرة ثانية تعيد ترتيب القائمة.',
  'ad.msg.sortGomme': 'الأحدث محوًا أولًا',
  'ad.msg.sortGommeHint':
    'نقرة تضع في المقدمة محادثات المناطق التي حَوّلها الممحاة الصغير للتوّ إلى مناطق بلا نسخة، الأحدث محوًا أولًا: ما رُدّ للتوّ يُعثر عليه فورًا. والمناطق التي لم تُمحُ قط والمحادثات بلا منطقة معروفة، وهي بلا تاريخ، تغلق الترتيب. ونقرة ثانية تعيد ترتيب القائمة.',
  'ad.msg.sortGommeAncienne': 'الأقدم محوًا أولًا',
  'ad.msg.sortGommeAncienneHint':
    'نقرة تضع في المقدمة محادثات المناطق التي حوّلها الممحاة الصغير إلى مناطق بلا نسخة منذ أطول مدة، الأقدم محوًا أولًا: ما ينتظر التجديد يُعثر عليه فورًا. والمناطق التي لم تُمحُ قط والمحادثات بلا منطقة معروفة، وهي بلا تاريخ، تغلق الترتيب. ونقرة ثانية تعيد ترتيب القائمة.',
  'ad.msg.aireGroupOne': 'محادثة واحدة',
  'ad.msg.aireGroupCount': '{n} محادثة',
  'ad.msg.aireGroupTitleHint':
    'اضغط لتبقي فقط محادثات هذه المنطقة؛ والضغط الثاني يعيد كل المحادثات.',
  'ad.msg.aireGroupCopy': 'نسخ الكشف',
  'ad.msg.aireGroupCopyHint':
    'ينسخ كشف محادثات منطقة {region} — المنطقة وملفاتها، ثم كل محادثة مع طرفها — ويؤرّخ آخر نسخة.',
  'ad.msg.aireGroupCopyLine': 'كشف · {region} · {files} {unit} · {n} محادثة',
  'ad.msg.aireGroupCopyRow': '- {nom} · {sujet}',
  'ad.msg.aireGroupLastCopy': 'آخر نسخ · {date}',
  'ad.msg.aireGroupLastCopyHint':
    'يوم خرج كشف منطقة {region} من هذا الجهاز للمرة الأخيرة.',
  'ad.msg.aireOn': 'المنطقة المحتجزة · {n}',
  'ad.msg.aireClear': 'كل المحادثات',
  'ad.msg.aireTraySpan': '{pays} دولة · {files} {unit}',
  'ad.msg.aireTraySpanHint':
    'امتداد منطقة {region}: بلدانها ووزنها في الدليل، إلى جانب عدد المحادثات التي تتركها في الصندوق.',
  'ad.msg.threadAireHint':
    '{region}: منطقة هذه المحادثة، مقروءة على بلد حسابها.',
  'ad.msg.threadAireNarrowHint':
    '{region}: اضغط لتبقي فقط محادثات هذه المنطقة؛ والضغط الثاني يعيد كل المحادثات.',
  'ad.msg.threadAireHoldHint':
    '{region}: اضغط لتبقي فقط محادثات هذه المنطقة، والضغط المطوّل ينسخ كشفها؛ والضغط الثاني يعيد كل المحادثات.',
  'ad.msg.threadAireCopiedHint':
    'نُسخ كشف هذه المنطقة: جاهز للصق في رسالة.',
  'ad.msg.aireGroupCountHint':
    '{region} · {pays} بلدًا · {files} {unit} · {n} : اتساع المنطقة ووزنها في الدليل، مقروءين مع عدد المحادثات.',
  'ad.msg.relevesAll': 'نسخ كل الكشوف',
  'ad.msg.relevesAllHint':
    'ينسخ محادثات كل منطقة في الصندوق على التوالي — عنوان لكل منطقة، وبطاقاتها، ثم كل محادثة مع طرفها — أي {n} محادثة على {a} مناطق، ويؤرّخ انطلاق كل كشف.',
  'ad.msg.relevesAllCount': 'كشوف',
  'ad.msg.relevesAllLast': 'آخر · {date}',
  'ad.msg.relevesAllCountHint':
    'كم مرة انطلق كشف كل المناطق من هذا الجهاز، ويوم آخر مرة ({date}): الفعل الشامل يُحصى على حدة عن كشوف منطقة واحدة.',
  'ad.msg.relevesAllAires': '{n} مناطق',
  'ad.msg.relevesAllAiresHint':
    'المناطق ({n}) التي خرجت مرة واحدة على الأقل في كشف شامل: {list}.',
  'ad.msg.relevesAllClearHint':
    'يعيد عدّاد الكشوف الشاملة إلى الصفر: تُنسى المناطق المحصاة، وتبقى تواريخ المجموعات.',
  'ad.msg.relevesAllClearHintCount':
    'يمحو {n} كشفًا شاملًا و{a} مناطق محصاة، دون المساس بتواريخ المجموعات: كل عنوان منطقة يحفظ آخر كشف له.',
  'ad.msg.airesJamaisWords': 'مناطق لم تُنسخ قط',
  'ad.msg.airesJamaisNone': 'كل المناطق نُسخت',
  'ad.msg.airesJamaisHint':
    'المناطق التي ما زالت في الصندوق ولم يحملها أي كشف بعد، لا شاملًا ولا واحدة واحدة: {list}.',
  'ad.msg.airesJamaisNoneHint':
    'كل منطقة في الصندوق خرجت من لوحة التحكم مرة واحدة على الأقل، بكشف شامل أو بكشف منطقة واحدة.',
  'ad.msg.airesJamaisOpenHint':
    '{n} مناطق لم تُنسخ قط: اضغط لحصر الصندوق في محادثات {region}، أولها؛ ثم اضغط مرة أخرى للانتقال إلى التالية. ما زال بحاجة إلى كشف: {list}.',
  'ad.msg.relevesCheminsHint':
    'كشوف منطقة واحدة، مفصولة حسب طريقها: {h} انطلقت من عنوان مجموعة، و{l} حُملت بضغط مطوّل على شارة محادثة. أما الكشف الشامل فيحتفظ بعدّاده الخاص.',
  'ad.msg.relevesCheminsEntete': '{n} عناوين',
  'ad.msg.relevesCheminsLigne': '{n} أسطر',
  'ad.msg.relevesCheminsClearHint':
    'يمحو {h} نسخًا خرجت من رأس مجموعة و{l} حُملت بضغطة طويلة على سطر، دون المساس بتواريخ المجموعات: كل رأس منطقة يحفظ آخر نسخة له. ونسخ كل المناطق يحفظ عدّه الخاص.',
  'ad.msg.threadAireCheminEntete':
    'النسخ خرج سابقًا من رأس مجموعة · {date}.',
  'ad.msg.threadAireCheminLigne':
    'النسخ خرج سابقًا من سطر، بضغطة طويلة · {date}.',
  'ad.msg.threadAireCheminBoth':
    'النسخ خرج سابقًا من رأس ({entete}) ومن سطر ({ligne}).',
  'ad.msg.threadAireCheminEnsemble':
    'النسخ خرج سابقًا بفعل جماعي · {date}.',
  'ad.msg.threadAireCheminNone': 'النسخ لم يخرج قط.',
  'ad.msg.relevesCheminsCleared': '{n} نسخة ممحات',
  'ad.msg.relevesCheminsClearedHint':
    'عدد الأفعال التي محتها مِمْحاة المسارين للتو — ما خرج من عنوان مجموعة وما حُمل من سطر —، مع بقاء تواريخ المجموعات كما هي.',
  'ad.msg.relevesAllCleared': '{n} نسخة شاملة ممحات · {a} منطقة منسية',
  'ad.msg.relevesAllClearedHint':
    'عدد الأفعال والمناطق التي محتها مِمْحاة النسخ الشاملة للتو: يعود عدّاد الترويسة إلى الصفر، وتبقى تواريخ المجموعات والمسارَان كما هما.',
  'ad.msg.recentJamaisLine':
    '{n} منطقة لم تُنسخ قط تُغلق القائمة — {list}.',
  'ad.msg.recentJamaisLineNone':
    'كل المناطق نُسخت: لم يبق شيء يُغلق القائمة.',
  'ad.msg.recentJamaisLineHint':
    'ترتيب «الأحدث نسخًا» يقدّم المناطق التي خرج كشفها للتو من الصندوق: وما لم يُحمله أي كشف بعد يأتي في المؤخرة، ويُحصى هنا.',
  'ad.msg.jamaisLine':
    '{f} محادثة تفتتح القائمة · {a} مناطق لم تُنسخ قط — {list}.',
  'ad.msg.jamaisLineNone':
    'كل المناطق نُسخت: لم تبقَ أي محادثة في المقدمة.',
  'ad.msg.jamaisLineHint':
    'ترتيب «المنطقة التي لم تُنسخ قط أولًا» يقدّم محادثات المناطق التي لم يخرج نسخها بعد: يُقرأ عددها هنا إلى جانب عدد المناطق، ثم المناطق نفسها بترتيب مناطق العالم.',
  'ad.msg.airesTightOn': 'مناطق المصنّف · {n}',
  'ad.msg.airesTightTitle': 'مناطق لم تُنسخ قط · {n}',
  'ad.msg.airesTightClear': 'كل المناطق',
  'ad.msg.airesTightGomme': 'مسح',
  'ad.msg.airesTightGommeHint':
    'يعيد كل مناطق المصنّف بفعل واحد: يعرض الصندوق كل محادثاته، ويبقى الاختيار المحفوظ على الجهاز كما هو — فتستعيد الزيارة التالية المناطق نفسها.',
  'ad.msg.airesTightGommeHintCount':
    'يعيد {n} منطقة من المصنّف بفعل واحد — وتعود {fils} محادثة إلى الصندوق — دون المساس بالاختيار المحفوظ على الجهاز: فتستعيد الزيارة التالية المناطق نفسها.',
  'ad.msg.airesTightHint':
    'الصندوق محصور في المناطق التي سمّاها مصنّف المشتركين — {n} منطقة، منها {jamais} لم تُنسخ قط، و{fils} محادثة تتركها في الصندوق، بترتيب مناطق العالم: {list}. والعلامة تعيد كل المحادثات دون المساس بالاختيار المحفوظ على هذا الجهاز.',
  'ad.msg.airesTightRelevesGommeHint':
    'يعيد إلى الصفر نسخ هذه المناطق {n} وحدها — {relevees} منها ما زالت تحمل تاريخًا، و{jamais} لم تحمل تاريخًا قط —، دون المساس ببقية مناطق الجهاز، ولا بالحصر، ولا بعدّ النسخ الشاملة: تقولها الشارة من جديد لم تُنسخ قط، ويحصيها المصنّف كذلك. والمناطق التي أُعيدت بلا نسخ، واحدة واحدة: {list}.',
  'ad.msg.airesTightRelevesGommeHintEmpty':
    'لا منطقة من هذه {n} تحمل بعد تاريخ نسخ: لا شيء للممحاة أن تمحوه. ويبقى الحصر وبقية مناطق الجهاز كما هما.',
  'ad.msg.airesTightRelevesCleared': '{n} منطقة أُعيدت بلا نسخ',
  'ad.msg.airesTightRelevesClearedHint':
    'عدد مناطق المصنّف التي مُحي تاريخ نسخها الآن: تخرج أيضًا من دفتر المناطق التي نسختها النسخة الشاملة، وتبقى لبقية المناطق تواريخها، ولا يتغيّر عدّ الأفعال الشاملة.',
  'ad.msg.airesJourWords': 'مناطق نُسخت اليوم',
  'ad.msg.airesJourFils': '{n} محادثة مأخوذة',
  'ad.msg.airesJourAireDetail': '{region}: {fils}',
  'ad.msg.airesJourNoThread': 'لا محادثة في الصندوق',
  'ad.msg.airesJourPillHint':
    'مناطق الصندوق {n} التي يحمل نسخ محادثاتها تاريخ اليوم، مع {fils} محادثة أخذتها، واحدة واحدة: {detail}. والممحاة الصغيرة تمحو تاريخ كل مناطق الصندوق، أيًا كان يوم نسخها.',
  'ad.msg.airesJourGommeHint':
    'تمحو تاريخ نسخ مناطق الصندوق {n}، أيًا كان يومها — {relevees} منها ما زالت تحمل تاريخًا —، دون المساس بالمناطق الغائبة عن الصندوق، ولا بالحصر، ولا بعدّ الأفعال الشاملة: وتحصيها خلاصة المصنّف حينها كمناطق لم تُنسخ قط.',
  'ad.msg.airesJourCleared': '{n} منطقة صارت بلا تاريخ من {a}',
  'ad.msg.airesJourClearedHint':
    'عدد مناطق الصندوق التي مُحي تاريخ نسخها الآن، من مجموع المناطق التي يحملها: تخرج أيضًا من دفتر المناطق التي نسختها النسخة الشاملة، وتحصيها خلاصة المصنّف كمناطق لم تُنسخ قط.',
  'ad.msg.gommesTally': '{n} مسحة · آخر فعل {date}',
  'ad.msg.gommesWords': 'مسحات نسخ',
  'ad.msg.gommesLast': 'آخر فعل {date}',
  'ad.msg.gommesTallyHint':
    'من هذا الجهاز، أعادت مسحة النسخ الصغيرة مناطق فارغة {n} مرة ومحت تاريخ {aires} منطقة؛ وآخر فعل يعود إلى {date}. يبقى العد إلى جانب شارة مناطق اليوم، ويظل ظاهرًا حين لا يبقى للشارة ما تقوله.',
  'ad.msg.gommesSpan':
    'من الفعل الأول المحفوظ في {premier} إلى الأخير في {dernier}، تفصل {n} يومًا بين مسحات النسخ: يُقرأ المحو في الزمن، لا بتاريخه الأخير وحده.',
  'ad.msg.gommesFils': '{n} محادثة من آخر مسحة',
  'ad.msg.gommesFilsHint':
    'المحادثات التي كان الصندوق يحملها في المناطق التي أعادتها آخر مسحة فارغة — شارة مناطق اليوم أو سطر المحادثات — لحظة النقر: الفعل يقول ثقله، لا عدده فقط.',
  'ad.msg.gommesFilsEncore':
    'من هذه المناطق، {n} أعادتها المسحة وما زالت في الصندوق — {list} —: يُقرأ الفعل على ما بقي للعرض.',
  'ad.msg.gommesFilsParties':
    'من هذه المناطق، {n} أعادتها المسحة ولم تعد في الصندوق — {list} —: يُقرأ الفعل أيضًا على ما غادر القائمة.',
  'ad.msg.gommesEncore': '{n} باقية',
  'ad.msg.gommesParties': '{n} غادرت',
  'ad.msg.gommesSplitBouts':
    'الأخيرة · {recent} {dateRecent} — الأقدم مغادرةً · {vieux} {dateVieux}',
  'ad.msg.gommesSplitBoutsNone': 'لا شيء من الأراضي المُعادة غادر بعد',
  'ad.msg.gommesSplitBoutsHint':
    'طرفا التقسيم، موضوعان على الشارة: الأرض التي مُحيت أخيرًا، وتلك التي غادرت قبل الجميع — {vieux}، في {dateVieux}. يُقرأ التقسيم من طرف إلى طرف دون تحويم.',
  'ad.msg.gommesSplitBoutsNoneHint':
    'كل الأراضي التي أعادتها الممحاة الأخيرة ما زالت في الصندوق: لم يغادر شيء، ولا أقدم لتسميته.',
  'ad.msg.gommesNoneAreas': 'لا شيء',
  'ad.msg.gommesSplitHint':
    'توزيع المناطق التي أعادتها المسحة الأخيرة، موضوعًا على الشارة ليُقرأ دون تمرير: {encore} ما زالت في الصندوق — {listeEncore} — و{parties} غادرته — {listeParties}. يُقرأ الرقمان على الصندوق كما هو معروض، فلا يتناقضان.',
  'ad.msg.gommeHorsCopy': 'نسخ هذه المناطق',
  'ad.msg.gommeHorsCopyHint':
    'ينسخ قائمة المناطق الـ {n} التي أعادتها المسحة ولم تعد في الصندوق، الأحدث محوًا أولًا، ولكل واحدة يوم فعلها — جاهزة للصق في رسالة.',
  'ad.msg.gommeHorsCopyHead':
    'مناطق أعادتها المسحة وغادرت الصندوق ({n} من {total})',
  'ad.msg.recapGommeTete': 'آخر ما مُحي · {region} · {date}',
  'ad.msg.recapGommeTeteHint':
    'يسمّي مقياس الترتيب المعاكس المنطقة التي أعادتها المسحة الصغيرة أخيرًا، مع يوم فعلها: يُقرأ أحدث فعل فوق سطر المناطق المغادرة، دون تمرير.',
  'ad.msg.gommeHorsLine':
    '{n} منطقة أعادتها المسحة لم تعد في الصندوق، الأحدث محوًا أولًا — {list}.',
  'ad.msg.gommeHorsLineNone':
    'كل المناطق التي أعادتها المسحة ما زالت في الصندوق: لم تغادر أي منها.',
  'ad.msg.gommeHorsLineHint':
    'تحت الترتيب المعاكس، المناطق التي أعادتها المسحة الصغيرة ولم يعد الصندوق يحملها، الأحدث محوًا أولًا، ولكل واحدة يوم فعلها الأخير: يُقرأ الفعل أيضًا على ما غادر القائمة، إلى جانب ما بقي فيها.',
  'ad.msg.recapGomme': 'ترتيب معاكس · الأحدث محوًا أولًا',
  'ad.msg.recapGommeHint':
    'موضوعًا على سطر التلخيص، يرتّب هذا الترتيب محادثات المناطق التي أعادتها الممحاة الصغيرة من الأحدث إلى الأقدم. ونقرة ثانية تعكس الاتجاه — من الأقدم محوًا إلى الأحدث — دون العودة إلى شريط الترتيب. والمناطق التي لم تُمحُ قط والمحادثات بلا منطقة معروفة، وهي بلا تاريخ، تغلق الترتيب.',
  'ad.msg.recapGommeSensRecent': 'من الأحدث إلى الأقدم',
  'ad.msg.recapGommeSensAncien': 'من الأقدم إلى الأحدث',
  'ad.msg.recapGommeSpan':
    'في هذه المناطق، {n} يومًا تفصل بين آخر منطقة مُحيت — {recent}، في {dateRecent} — وأقدم منطقة مُحيت — {vieux}، في {dateVieux}: يُقرأ الفعل من طرف إلى طرف.',
  'ad.msg.gommeHorsLineAncienne':
    '{n} منطقة أعادتها المسحة لم تعد في الصندوق، الأقدم محوًا أولًا — {list}.',
  'ad.msg.gommeHorsSort': 'الأقدم أولًا',
  'ad.msg.gommeHorsSortMonths':
    'المغادرات {n}، بحسب شهر المحو (الأحدث أولًا): {list} — تُقرأ موجات الفعل دفعةً واحدة.',
  'ad.msg.gommeHorsSortHint':
    'نقرة تعكس سطر المناطق المغادرة: أقدم المغادرات تتصدّر، لتُقرأ بالترتيب الذي وقعت به. ونقرة ثانية تعيد الأحدث محوًا أولًا.',
  'ad.msg.gommeHorsCopyHintAncienne':
    'ينسخ قائمة {n} منطقة أعادتها المسحة ولم تعد في الصندوق، الأقدم محوًا أولًا، ولكل واحدة يوم فعلها — جاهزة للّصق في رسالة.',
  'ad.msg.gommeLine': '{n} منطقة أعادتها المسحة — {list}.',
  'ad.msg.gommeLineAire': '{region} · {date}',
  'ad.msg.gommeLineHint':
    'تحت ترتيب «الأحدث محوًا أولًا»، المناطق التي أعادتها المسحة الصغيرة فارغة، الأحدث محوًا أولًا، ولكل واحدة يوم فعلها: ما أُعيد للتو يُقرأ دون فتح الصندوق.',
  'ad.msg.gommeAncienneLine':
    '{n} منطقة أعادتها المسحة، الأقدم محوًا أولًا — {list}.',
  'ad.msg.gommeAncienneLineHint':
    'تحت ترتيب «الأقدم محوًا أولًا»، المناطق التي أعادتها المسحة الصغيرة فارغة، الأقدم محوًا أولًا، ولكل واحدة يوم فعلها: ما ينتظر الإعادة يُقرأ دون فتح الصندوق.',
  'ad.msg.sortAncienSpan':
    'في الصندوق، {n} يومًا تفصل أقدم نسخ ({vieux}) عن أحدثه ({recent}).',
  'ad.msg.ancienJaugeLabel': 'فارق النسخ في الصندوق',
  'ad.msg.ancienJaugeSpan': '{n} يومًا · من {vieux} إلى {recent}',
  'ad.msg.ancienJaugeHint':
    'يقيس المقياس الفارق بين أقدم نسخ وأحدثه في مناطق الصندوق — القياس نفسه الذي يقوله ترتيب «الأقدم نسخًا أولًا»، مقروءًا دون مرور. النسخة الواحدة لا تصنع فارقًا، والصندوق بلا تاريخ لا يعرض مقياسًا.',
  'ad.msg.ancienJaugeBouts':
    'طرفا هذا الفارق: الأقدم هي {aireVieux}، نُسخت في {vieux}؛ والأحدث هي {aireRecent}، نُسخت في {recent}.',
  'ad.msg.airesTightAireJour': '{region} · آخر نسخ في {date}',
  'ad.msg.airesTightAireJamais': '{region} · لم تُنسخ قط',
  'ad.msg.airesTightAireJourFils':
    '{region} · {n} محادثة في الصندوق · آخر نسخ في {date}',
  'ad.msg.airesTightAireJamaisFils':
    '{region} · {n} محادثة في الصندوق · لم تُنسخ قط',
  'ad.msg.airesTightAireJourHint':
    'كل منطقة مسماة في الشارة تحمل، عند المرور عليها، يوم آخر نسخ لمحادثاتها مقروءًا من هذا الجهاز — أو تقول إنها لم تُنسخ بعد قط.',
  'ad.msg.jamaisLineClearHint':
    'يعيد القائمة كاملة بفعل واحد: الممحاة تطفئ الشارات والحصر على منطقة، دون المساس بترتيب القراءة الموضوع.',
  'ad.msg.jamaisLineClearHintCount':
    'يعيد القائمة كاملة بفعل واحد: {chips} شارات و{aires} مناطق محصورة تُمحى، دون المساس بترتيب القراءة الموضوع.',
  'ad.msg.vieillesAires': 'نُسخت قبل أكثر من 7 أيام',
  'ad.msg.vieillesAiresOnly': 'مناطق نُسخت قبل أكثر من 7 أيام',
  'ad.msg.vieillesAiresOn': 'مناطق نُسخت قبل أكثر من سبعة أيام',
  'ad.msg.vieillesAiresNone': 'لا شيء الآن',
  'ad.msg.vieillesAiresEmpty':
    'لا منطقة في الصندوق نُسخت قبل أكثر من سبعة أيام: المناطق التي لم تُنسخ قط لها ترتيبها الخاص.',
  'ad.msg.vieillesAiresHint':
    '{n} مناطق يعود آخر نسخ لمحادثاتها إلى أكثر من سبعة أيام — {list} —، و{fils} محادثة تتركها الشارة في القائمة. نقرة لا تُبقي إلا محادثاتها؛ ونقرة ثانية تعيد القائمة كاملة. والمناطق التي لم تُنسخ قط تبقى خارجها.',
  'ad.msg.vieillesAiresFils': '{n} محادثة',
  'ad.msg.aireHoldNote':
    'ضغط مطوّل على شارة منطقة محادثة يحمل كشفها؛ أما الضغط القصير فلا يُبقي إلا محادثات تلك المنطقة.',
  'ad.msg.aireHoldNoteHint':
    'يُكتشف الفعل دون تمرير: الضغط المطوّل ينسخ كشف المنطقة — أوراقها، ثم كل محادثة مع طرفها —، والضغط القصير يُضيِّق الصندوق على تلك المنطقة.',
  'ad.msg.sortApresHint':
    'نقرة تضع في المقدمة المحادثات التي وصل لحسابها إيداع بعد التذكير المحضّر، الأكثر إيداعات أولًا؛ ونقرة ثانية تعيد ترتيب القائمة.',
  'ad.msg.reviewResume': 'استئناف',
  'ad.msg.reviewResumeLast': 'العودة إلى آخر محادثة قُرئت',
  'ad.msg.reviewResumeHint':
    'يعيد فتح آخر محادثة نائمة قُرئت خلال هذه الزيارة — أو أول محادثة نائمة متبقية إن لم يُقرأ شيء بعد: تستأنف المراجعة من حيث توقفت.',
  'ad.msg.reviewResumeKeyHint':
    'المفتاحان N أو J يفتحان المحادثة التالية دون مغادرة لوحة المفاتيح، حتى لو تعذّر الوصول إلى زر الاستئناف بالفأرة؛ والمفتاح R يعيد إلى آخر محادثة قُرئت.',
  'ad.msg.reviewResumeBackKeyHint':
    'المفتاح R يعيد إلى آخر محادثة قُرئت في هذه الزيارة، مثل نقرة على زر الاستئناف.',
  'ad.msg.reviewResumeProgress': '{done} من {total}',
  'ad.msg.reviewResumeSince': 'فُتحت {ago}',
  'ad.msg.reviewResumeSinceHint':
    'نقرة على هذا السطر تعيد فتح آخر محادثة قُرئت، دون المرور بزر الاستئناف.',
  'ad.msg.reviewResumeAgoNow': 'الآن',
  'ad.msg.reviewResumeAgoMin': 'منذ {n} دقيقة',
  'ad.msg.reviewResumeAgoHour': 'منذ {n} ساعة',
  'ad.msg.reviewResumeAgoDay': 'منذ {n} يومًا',
  'ad.msg.closeKey': 'إغلاق',
  'ad.msg.closeKeyName': 'Esc',
  'ad.msg.closeKeyHint':
    'المفتاح Esc يغلق المحادثة المفتوحة ويعيد القائمة كاملة بلوحة المفاتيح، دون البحث عن سطرها.',
  'ad.msg.sortRecapHint':
    'ترتيب القراءة الموضوع في القائمة، مذكورًا في سطر الخلاصة إلى جانب الشارات: الترتيب النشط والحساب الذي يفتتحه.',
  'ad.msg.sortRecapBack': 'العودة إلى ترتيب القائمة',
  'ad.msg.sortRecapBackHint':
    'نقرة على التذكير تُطفئ الترتيب الموضوع وتعيد القائمة إلى ترتيبها الأصلي؛ وتبقى الشارات والمرشّح كما هي.',
  'ad.msg.filtersHint':
    'الشارات الموضوعة على القائمة، مخلّصة في سطر واحد: عددها، وكل مرشّح نشط، وعدد المحادثات التي يبقيها، وتقدّم المراجعة.',
  'ad.msg.chipOne': 'شارة واحدة',
  'ad.msg.chipMany': '{n} شارات',
  'ad.msg.chipCountHint':
    'عدد الشارات الموضوعة على القائمة — وهو الرقم نفسه في خلاصة المصنّف عند التصدير.',
  'ad.msg.clearAll': 'مسح',
  'ad.msg.listKeyHint':
    'حين تكون بطاقة الرسائل نشطة — محادثة مفتوحة بنقرة أو بالمفتاح N أو J — ينقل السهمان أعلى وأسفل إلى المحادثة السابقة أو التالية في الترتيب المعروض، دون فأرة.',
  'ad.msg.sortEscHint':
    'المفتاح Esc يغلق المحادثة المفتوحة ويعيد القائمة كاملة بلوحة المفاتيح. يُذكر التذكير في شريط الترتيب إلى جانب السهمين، حتى إن لم تكن هناك محادثة مفتوحة، ليكتشف المستخدم الفعل قبل أن يحتاجه؛ ويضيء حين يكون هناك ما يُغلق.',
  'ad.msg.sleeping': 'نائمة',
  'ad.msg.sleepHint': 'محادثات تحتاج يومًا أو أكثر للرد',
  'ad.msg.sleepOnly': 'النائمة فقط',
  'ad.msg.sleepOnlyHint':
    'لا يُبقي إلا المحادثات التي تحتاج يومًا أو أكثر للرد، مدة مراجعة؛ ونقرة ثانية تعيد القائمة كاملة. ويُحفظ الاختيار من زيارة إلى أخرى.',
  'ad.msg.sleepOnlyOn': 'مراجعة محصورة في المحادثات النائمة',
  'ad.msg.sleepNone': 'لا محادثة نائمة: كل هذه المحادثات ترد في أقل من يوم.',

  'ad.msg.revueCompte': 'مراجعة الحساب',
  'ad.msg.revueCompteOn': 'مراجعة محصورة في الحساب {n}',
  'ad.msg.revueCompteHint':
    'القائمة محصورة في المحادثات النائمة لهذا الحساب، مفتوحة من بطاقته: تبدأ المراجعة من حيث سمّاها الحساب. والعلامة تعيد القائمة كاملة دون محو الشارات المحفوظة.',
  'ad.msg.revueCompteEmpty':
    'لا محادثة نائمة لهذا الحساب: كل محادثاته ترد في أقل من يوم.',
  'ad.msg.revueCompteClear': 'الخروج من مراجعة هذا الحساب',
  'ad.msg.visitLength': 'مدة الزيارة',
  'ad.msg.visitLengthHint':
    'الفرق بين أول فتح وآخر فتح في الزيارة الجارية — القياس نفسه الذي يعرضه أسفل سجل المراجعة، مقروءًا من مؤشرات الجلسة.',

  'ad.journal.stamp': 'سجل المراجعة',
  'ad.journal.sub':
    'الزيارة الجارية، محادثة بمحادثة: ساعة كل فتح، والدقائق المنقضية منذ الأول، ومهلة الرد وآخر رسالة — دون تنزيل أي ملف.',
  'ad.journal.clear': 'محو المؤشرات',
  'ad.journal.clearHint':
    'يمحو مؤشرات هذه المراجعة: تنطلق القائمة من زيارة جديدة، كما بعد الممحاة الصغيرة في الرسائل.',
  'ad.journal.openHint': 'فتح هذه المحادثة في الرسائل، دون البحث عن سطرها',
  'ad.journal.empty':
    'لم تُقرأ أي محادثة نائمة بعد خلال هذه الزيارة: افتح محادثة من الرسائل وسيظهر سطرها هنا.',
  'ad.journal.note':
    'يُقرأ هذا السجل من ذاكرة الجلسة نفسها التي تقرأ منها الرسائل: سطر لكل محادثة نائمة فُتحت خلال الزيارة، بترتيب الفتح. ويبقى فارغًا ما لم يُقرأ شيء، ويُمحى بانتهاء الزيارة. ومدة الزيارة تتحدث عن المراجعة، لا عن زمن رد المحادثات.',

  'ad.p.stamp': 'إعدادات الموقع',
  'ad.p.sub': 'إعدادات التطبيق كما هي مسجّلة، والوصول إلى هذه اللوحة.',
  'ad.p.essai': 'أيام التجربة',
  'ad.p.appel': 'الاتصال التذكيري (ساعات)',
  'ad.p.updatedBy': 'عدّله',
  'ad.p.updatedAt': 'عُدّل في',
  'ad.p.none': 'لا إعداد مسجّل: تُطبَّق القيم الافتراضية للموقع.',
  'ad.p.note': 'تُكتب هذه الإعدادات من لوحة Supabase. هذه الصفحة تقرأها ولا تعدّلها.',
  'ad.p.access': 'العنوان المسموح',
  'ad.p.database': 'قاعدة البيانات',
  'ad.p.databaseVal': 'Supabase — قراءة عبر دالة على الخادم',
  'ad.p.roles.stamp': 'إدارة الأدوار',
  'ad.p.roles.sub': 'من يستطيع فتح لوحة التحكم: الحسابات المرفوعة إلى إدارة، والحسابات العادية.',
  'ad.p.roles.search': 'ابحث عن حساب…',
  'ad.p.roles.role': 'الدور',
  'ad.p.roles.action': 'الوصول إلى اللوحة',
  'ad.p.roles.admin': 'مسؤول',
  'ad.p.roles.other': 'حساب عادي',
  'ad.p.roles.promote': 'ترقية إلى مسؤول',
  'ad.p.roles.demote': 'سحب صفة المسؤول',
  'ad.p.roles.promoteHint':
    'يفتح لوحة التحكم لهذا الحساب: يدخلها بعنوانه الخاص، دون نسخ هذا العنوان في أسرار الخادم.',
  'ad.p.roles.demoteHint':
    'يسحب وصول هذا الحساب إلى لوحة التحكم: يعود حسابًا عاديًا، وتبقى بياناته سليمة.',
  'ad.p.roles.selfHint':
    'هذا هو الحساب الذي يتولّى اللوحة: لا يمكن سحب صفة المسؤول عنه من هنا، وإلا لأغلقت اللوحة على نفسها.',
  'ad.p.roles.me': 'أنت',
  'ad.p.roles.err': 'تعذّر حفظ الدور.',
  'ad.p.roles.doneAdmin': 'رُفع الحساب إلى مسؤول: اللوحة مفتوحة له الآن.',
  'ad.p.roles.doneBack': 'عاد الحساب عاديًا: اللوحة مغلقة له.',
  'ad.p.roles.count': '{n} مسؤول',
  'ad.p.roles.countHint':
    'الحسابات التي تستطيع فتح لوحة التحكم: الأدوار الإدارية والحساب الذي يحمل عنوان الإدارة.',
  'ad.p.roles.promoted': '{n} مرفوع',
  'ad.p.roles.promotedHint':
    'الحسابات التي رُفعت إلى مسؤول من هذه اللوحة، على الأسطر نفسها التي يعرضها الجدول.',
  'ad.p.roles.lastPromotion': 'آخر ترقية',
  'ad.p.roles.promotedOn': 'رُفع في',
  'ad.p.roles.promotedNoDate': 'تاريخ الترقية غير مسجّل',
  'ad.p.roles.empty': 'لا حساب يطابق هذا البحث.',
  'ad.p.roles.none': 'لا حساب مسجّل: لا دور لإدارته الآن.',
  'ad.p.roles.note':
    'يُكتب الدور على الحساب في القاعدة: تقرأه اللوحة والدالة على الخادم عند كل فتح. والحساب المرفوع يدخل بعنوانه الخاص — لا حاجة إلى نسخه في أسرار الدالة.',
  'ad.p.mail.stamp': 'مرسل الرسائل',
  'ad.p.mail.verify': 'تحقّق لدى Brevo',
  'ad.p.mail.verifying': 'جارٍ التحقق…',
  'ad.p.mail.verified': 'النطاق مُوثَّق',
  'ad.p.mail.pending': 'النطاق في الانتظار',
  'ad.p.mail.unknownDomain': 'النطاق غير موجود',
  'ad.p.mail.noKey': 'المفتاح غائب: لا شيء لاستعلامه',
  'ad.p.mail.noDomainSet': 'لا نطاق في الأسرار',
  'ad.p.mail.verifyErr': 'لم يردّ Brevo: حالة النطاق غير معروفة.',
  'ad.p.mail.keyScope':
    'مفتاح إرسال فقط: Brevo لا يسمح بقراءة نطاقاته. تُقرأ الحالة لدى Brevo.',
  'ad.p.mail.verifyAt': 'وُثّق في {date}',
  'ad.p.mail.verifyHint':
    'يطلب من Brevo حالة نطاق الإرسال الفعلية، بدل افتراض أن نطاقًا مكتوبًا في الأسرار نطاقٌ موثَّق. وما دام غير موثَّق، لا تغادر إشعارات الاستلام.',
  'ad.p.mail.noDomainYet': 'لم يُتحقق بعد',
  'ad.p.acc.stamp': 'إشعارات استلام الترشحات',
  'ad.p.acc.sub': 'ما وصل إلى المترشحين فعلًا عند الإيداع، والإشعارات التي لم تُرسل.',
  'ad.p.acc.sent': 'إشعارات أُرسلت · {n}',
  'ad.p.acc.waiting': 'في الانتظار · {n}',
  'ad.p.acc.today': 'أُرسلت اليوم · {n}',
  'ad.p.acc.sentHint': 'ترشحات غادر إشعارها PaperAtlas فعلًا، بتاريخ تكتبه دالة الإرسال نفسها.',
  'ad.p.acc.waitingHint':
    'ترشحات أُودعت ولم يُرسل لها أي إشعار: فشل البريد، أو النطاق غير موثَّق بعد.',
  'ad.p.acc.todayHint': 'الإشعارات المرسلة منذ منتصف الليل، على التاريخ نفسه الذي تقرأه العدّادات الأخرى.',
  'ad.p.acc.refresh': 'إعادة القراءة',
  'ad.p.acc.listTitle': 'الإشعارات التي لم تُرسل',
  'ad.p.acc.listHint': 'الإعادة تمرّ بالدالة نفسها التي تمرّ بها لحظة الإيداع: لا يُكتب التاريخ إلا إذا غادر البريد فعلًا.',
  'ad.p.acc.candidat': 'المترشح',
  'ad.p.acc.offre': 'العرض',
  'ad.p.acc.waitSince': 'أُودعت في',
  'ad.p.acc.days': '{n} يوم انتظار',
  'ad.p.acc.send': 'إعادة إرسال الإشعار',
  'ad.p.acc.sending': 'جارٍ الإرسال…',
  'ad.p.acc.ok': 'أُعيد إرسال الإشعار إلى {to} · {date}',
  'ad.p.acc.already': 'هذا الإشعار أُرسل سابقًا في {date}: لم يُعَد إرسال شيء.',
  'ad.p.acc.err': 'لم يُرسل الإشعار.',
  'ad.p.acc.noMail': 'لا عنوان لهذا المترشح: لا يمكن للإشعار أن يُرسل.',
  'ad.p.acc.fromCompte': 'العنوان يُقرأ من الحساب',
  'ad.p.acc.empty': 'لا إشعار في الانتظار: كل ترشيح أُودع وصل إليه إشعاره.',
  'ad.p.acc.none': 'لا ترشحات مسجلة حتى الآن.',
  'ad.p.acc.error': 'لا يمكن قراءة الإشعارات الآن.',
  'ad.p.acc.note':
    'يقرأ العدّاد التاريخ نفسه الذي تقرأه بطاقة المترشح، بتاريخ تكتبه دالة الإرسال — لا بتاريخ فتح الملف. والإعادة لا تكتب فوق تاريخ موجود.',
  'ad.p.acc.reminder':
    'تنبيه: {n} إشعارًا ينتظر منذ أكثر من 24 ساعة — أقدمها أُودع في {oldest}. القائمة أدناه تعالجها من الأقدم إلى الأحدث.',
  'ad.p.acc.late': 'أكثر من 24 ساعة',
  'ad.p.acc.gateReady': 'التأكيدات: الإرسال ممكن',
  'ad.p.acc.gateBlocked': 'التأكيدات: الإرسال محجوب',
  'ad.p.acc.gateHint':
    'يقرأ عند Brevo هل نطاق الإرسال موثّق — وهو وحده ما يسمح بخروج التأكيد. نقرة تعيد التحقق دون مغادرة البطاقة.',
  'ad.p.acc.gateNote':
    'ما دام المرسِل أو النطاق الموثّق عند Brevo ناقصًا، لا يمكن لأي تأكيد أن يخرج فعلًا: يبقى التاريخ فارغًا ويظهر السبب، دون تظاهر. تُضاف المفاتيح في Supabase → Edge Functions → Secrets، ويُوثَّق النطاق عند Brevo.',
  'ad.p.acc.reminderShort': 'منها ما ينتظر أكثر من ٢٤ ساعة',
  'ad.p.acc.histStamp': 'سجل الإعادات',
  'ad.p.acc.histSub': 'من أرسل، إلى من، ومتى — وهل غادر البريد فعلًا.',
  'ad.p.acc.histCount': '{n} إعادة',
  'ad.p.acc.histCsv': 'تصدير السجل',
  'ad.p.acc.histCsvHint':
    'ينزّل السجل بصيغة CSV: سطر لكل إجراء، بتاريخه ومرسله ومستلمه وحالته.',
  'ad.p.acc.histCsvCount': 'أسطر السجل',
  'ad.p.acc.histEmpty': 'لا إعادة حتى الآن: يُكتب السجل عند أول إشعار.',
  'ad.p.acc.histDate': 'التاريخ',
  'ad.p.acc.histAuthor': 'المرسل',
  'ad.p.acc.histTo': 'المستلم',
  'ad.p.acc.histTrigger': 'المُطلق',
  'ad.p.acc.histDepot': 'عند الإيداع',
  'ad.p.acc.histRenvoi': 'إعادة يدوية',
  'ad.p.acc.histState': 'الحالة',
  'ad.p.acc.histSent': 'أُرسل',
  'ad.p.acc.histFailed': 'لم يُرسل',
  'ad.p.acc.why.no-recipient': 'لا عنوان',
  'ad.p.acc.why.email-not-configured': 'الإرسال غير مهيأ',
  'ad.p.acc.why.email-error': 'رفض خدمة الإرسال',
  'ad.p.acc.bulk': 'إعادة إرسال المتأخرات · {n}',
  'ad.p.acc.bulkHint':
    'إعادة إرسال كل الإشعارات التي تنتظر منذ أكثر من 24 ساعة بنقرة واحدة، من الأقدم إلى الأحدث: كل إرسال يمرّ بالدالة نفسها التي يمرّ بها الإيداع، ولا يُكتب التاريخ إلا إذا غادر البريد فعلًا.',
  'ad.p.acc.bulkBusy': 'جارٍ الإرسال {n}…',
  'ad.p.acc.bulkDone':
    'أُعيد إرسال {sent} إشعارًا · {failed} في إخفاق — ويسجّل سجل الإعادات كل إجراء، ناجحًا أو لا.',
  'ad.p.acc.histFailOnly': 'الإخفاقات فقط · {n}',
  'ad.p.acc.histFailHint':
    'لا تُبقى إلا الإرسالات التي لم تُرسل، لمعالجة الإخفاقات دفعة واحدة؛ نقرة ثانية تعيد السجل كاملًا.',
  'ad.p.acc.histFailEmpty': 'لا إخفاق في السجل: كل إجراء إرسال تمّ فعلًا.',
  'ad.p.acc.histAll': 'السجل كله',
  'ad.p.acc.motifTitle': 'الإخفاقات حسب السبب',
  'ad.p.acc.motifHint':
    'نقرة لا تُبقي إلا الإرسالات التي أخفقت لهذا السبب؛ نقرة ثانية تعيد السجل كاملًا. والرقم يُقرأ على السطور نفسها التي يقرأها السجل.',
  'ad.p.acc.motifMost': 'الأكثر تعطيلًا: {label} · {n}',
  'ad.p.acc.motifMostHint':
    'السبب الأكثر تكرارًا بين الإرسالات التي لم تخرج: يقول بنظرة واحدة ما يحبس أكبر عدد من التأكيدات.',
  'ad.p.acc.motifActive': 'مُرشَّح على «{label}»',
  'ad.p.acc.motifClear': 'كل الأسباب',
  'ad.p.acc.motifEmpty':
    'لا سبب يُحسب: كل إجراء إرسال في السجل قد تمّ.',
  'ad.p.acc.motifOther': 'سبب غير محدَّد',
  'ad.p.acc.why.other': 'سبب غير محدَّد',
  'ad.accuse.openVerify': 'فتح التحقق من نطاق الإرسال عند Brevo',
  'ad.xls.horsTypeSheet': 'تصنيفات خارج النوع',
  'ad.xls.horsTypeEmpty':
    'لا إيداع خارج النوع عند التصدير: كل تصنيف ينتمي إلى عائلته.',
  'ad.xls.horsTypeCount': 'إيداعات خارج النوع',
  'ad.xls.horsTypeExpected': 'التصنيفات المتوقَّعة',
  'ad.xls.horsTypeRecorded': 'التصنيف المسجَّل',
  'ad.xls.horsTypeNote':
    'ورقة «تصنيفات خارج النوع» تعيد، عند النقر، الإيداعات التي ينتمي تصنيفها إلى العائلة الأخرى — تصنيف إعلان على عرض عمل، أو العكس. كل سطر يعطي التصنيف المسجَّل والتصنيفات الأربعة المتوقَّعة لنوع الإيداع: فتُرفَق قائمة التصحيح بنقطة تقدّم دون فتح تبويب «الإعلانات» من جديد. وأسفل الورقة يُحسب عدد الإيداعات وتُذكر العائلتان.',
  'ad.xls.attenteSheet': 'تأكيدات معلّقة',
  'ad.xls.attenteEmpty': 'لا تأكيد معلّق عند التصدير: كل إيداع وصل تأكيده.',
  'ad.xls.attenteCount': 'تأكيدات معلّقة',
  'ad.xls.attenteLate': 'أكثر من ٢٤ ساعة',
  'ad.xls.attenteNote':
    'ورقة «تأكيدات معلّقة» تعيد ملف الإعادة كما هو عند النقر: سطر لكل ترشّح لم يخرج تأكيده بعد، الأقدم أولًا، مع الانتظار بالأيام وعلامة «أكثر من ٢٤ ساعة» على ما تجاوز يومًا. وهكذا يُرفَق الملف بنقطة تقدّم دون فتح اللوحة من جديد.',
  'ad.xls.renvoisSheet': 'سجل الإعادات',
  'ad.xls.renvoisEmpty': 'لا إعادة في السجل عند التصدير.',
  'ad.xls.renvoisNote':
    'ورقة «سجل الإعادات» تعيد سجل الكونسول: سطر لكل إجراء إرسال، بتاريخه ومرسله ومستلمه والترشيح المستهدف وحالته. والإرسال الذي لم يُرسل يبقى له سطره وسببه — فالملف لا يحسب النجاحات وحدها.',
  'ad.accuse.chip': 'الإشعارات',
  'ad.accuse.waiting': '{n} إشعارًا في الانتظار',
  'ad.accuse.overdue': '{n} ينتظر منذ أكثر من 24 ساعة · أقدمها أُودع في {date}',
  'ad.accuse.noLate': 'لا تأخير يتجاوز 24 ساعة',
  'ad.accuse.open': 'فتح بطاقة إشعارات الاستلام',
  'ad.accuse.loading': 'الإشعارات: جارٍ القراءة…',
  'ad.accuse.gateBlocked': 'التأكيدات: الإرسال محجوب — لا شيء يمكن أن يخرج',
  'ad.accuse.gateReady': 'التأكيدات: الإرسال ممكن',
  'ad.ann.rubriqueChip': 'تصنيف خارج النوع',
  'ad.ann.rubriqueChipHint':
    'لا تُبقِ إلا الإيداعات التي ينتمي تصنيفها إلى العائلة الأخرى — تصنيف إعلان على عرض عمل، أو العكس. يُفتح التصحيح عندئذ تحت كل سطر؛ والضغط مرة ثانية يعيد القائمة كاملة.',
  'ad.ann.rubriqueBadge': 'تصنيف خارج النوع',
  'ad.ann.rubriqueBadgeOffre':
    'عرض العمل هذا يحمل تصنيفًا من عائلة الإعلانات.',
  'ad.ann.rubriqueBadgeAnnonce':
    'هذا الإعلان يحمل تصنيفًا من عائلة عروض العمل.',
  'ad.ann.rubriqueFix': 'تصحيح التصنيف',
  'ad.ann.rubriqueFixHint':
    'اختر تصنيفًا من عائلة الإيداع: يُكتب كما هو، دون المساس بالعنوان ولا بالنص ولا بحالة المراجعة.',
  'ad.ann.rubriqueEmpty': 'لا إيداع خارج النوع: كل تصنيف ينتمي إلى عائلته.',
  'ad.ann.rubriqueErr': 'تعذّر تصحيح التصنيف.',
  'ad.p.acc.bulkFail': 'إعادة إرسال الإخفاقات · {n}',
  'ad.p.acc.bulkFailHint':
    'إعادة المحاولة بضغطة واحدة للإرسالات التي لم تخرج فقط، دون استئناف طابور المتأخرات: كل محاولة تمرّ بالدالة نفسها التي يستعملها الإيداع، ولا يُكتب التاريخ إلا إذا خرج البريد فعلًا.',
  'ad.p.acc.bulkFailDone':
    '{sent} محاولة نجحت · {failed} ما زالت فاشلة — سجل الإعادة يحفظ كل محاولة.',
  'ad.p.mail.sub': 'من أي عنوان يكتب PaperAtlas، وإثبات أن الرسالة تصل فعلًا.',
  'ad.p.mail.state': 'الحالة',
  'ad.p.mail.ready': 'جاهز للإرسال',
  'ad.p.mail.notReady': 'النطاق بحاجة إلى إعداد',
  'ad.p.mail.from': 'عنوان الإرسال',
  'ad.p.mail.domain': 'النطاق المتحقَّق',
  'ad.p.mail.reply': 'عنوان الرد',
  'ad.p.mail.key': 'مفتاح الإرسال',
  'ad.p.mail.keySet': 'محفوظ',
  'ad.p.mail.keyMissing': 'غائب',
  'ad.p.mail.check': 'تحقّق',
  'ad.p.mail.checkAt': 'آخر قراءة للحالة: {date}',
  'ad.p.mail.checkNever':
    'لا قراءة للحالة من هذا الجهاز حتى الآن: الوقائع المعروضة لم تُقرأ بعد هنا.',
  'ad.p.mail.loading': 'جارٍ قراءة المرسل…',
  'ad.p.mail.test': 'إرسال تجربة',
  'ad.p.mail.testing': 'جارٍ الإرسال…',
  'ad.p.mail.testHint': 'استلام رسالة تحقّق على عنوانك.',
  'ad.p.mail.testBlocked': 'المفتاح أو نطاق الإرسال غير مُعدّ بعد.',
  'ad.p.mail.testSent': 'أُرسلت رسالة تجريبية إلى {to}. تحقّق من صندوق الوارد.',
  'ad.p.mail.testFail': 'لم تُرسل الرسالة التجريبية.',
  'ad.p.mail.error': 'لا تُقرأ حالة المرسل الآن.',
  'ad.p.mail.note': 'يُضاف المفتاح BREVO_API_KEY والنطاق MAIL_FROM_DOMAIN في Supabase، قسم Edge Functions ← Secrets، ويجب أيضًا التحقق من النطاق لدى Brevo. بعد ذلك تصدر كل التأكيدات باسم PaperAtlas.',
  'ad.p.mail.guideTitle': 'وضع المفتاح والنطاق، خطوة بخطوة',
  'ad.p.mail.guideSub': 'أربع خطوات بهذا الترتيب. البطاقة لا تخمّن: تقرأ حالة الأسرار الحقيقية، والرسالة الواصلة تبقى الدليل الوحيد.',
  'ad.p.mail.guideCount': '{n} / {total} خطوات في مكانها',
  'ad.p.mail.gFait': 'في مكانها',
  'ad.p.mail.gAfaire': 'بالانتظار',
  'ad.p.mail.g1Title': 'إنشاء مفتاح الإرسال لدى Brevo',
  'ad.p.mail.g1Text': 'في Brevo، قسم SMTP & API ← API Keys، أنشئ مفتاحًا له حق الإرسال. انسخه فورًا: لا يُعرض إلا مرة واحدة.',
  'ad.p.mail.g1Link': 'فتح مفاتيح Brevo',
  'ad.p.mail.g2Title': 'وضع المفتاح في Supabase',
  'ad.p.mail.g2Text': 'في Supabase، Edge Functions ← Secrets، أضف BREVO_API_KEY بالمفتاح المنسوخ. دوالّ الخادم هي التي تقرأه، لا المتصفح.',
  'ad.p.mail.g2Link': 'فتح أسرار Supabase',
  'ad.p.mail.g3Title': 'التحقق من النطاق وتسميته',
  'ad.p.mail.g3Text': 'في Brevo، افتح Settings ← Senders, Domains, IPs ← Domains، وأضف نطاقك ثم ضع سجلات DNS المطلوبة. بعد التوثيق، أضف MAIL_FROM_DOMAIN في Supabase بالنطاق نفسه: تصدر الرسائل من noreply@ ذلك النطاق.',
  'ad.p.mail.g3Link': 'فتح Brevo',
  'ad.p.mail.g4Title': 'إرسال تجربة واستلامها',
  'ad.p.mail.g4Text': 'زر «إرسال تجربة» يكتب إلى عنوانك. وطالما لم تصل هذه الرسالة فالنطاق غير مُثبت: وجود المفتاح والنطاق لا يكفي.',
  'ad.p.mail.gNote': 'الإجراء نفسه مكتوب في §10 من الخطة، مع سجلات DNS المتوقعة.',
  'ad.p.auth.stamp': 'رسائل التسجيل وكلمة المرور',
  'ad.p.auth.sub': 'لا تمرّ رسالتا الحساب عبر دوال الموقع: يكتبهما Supabase Auth عبر SMTP الخاص بالمشروع. خمس خطوات تجعلهما باسم PaperAtlas، منها تنبيه B2B إلى الورشة.',
  'ad.p.auth.count': '{n} / {total} خطوات منجزة',
  'ad.p.auth.done': 'منجزة',
  'ad.p.auth.todo': 'بحاجة إلى تنفيذ',
  'ad.p.auth.s1Title': 'استخدام مفتاح Resend نفسه',
  'ad.p.auth.s1Text': 'المفتاح المُنشأ للتأكيدات يخدم هنا أيضًا: Resend يرسل هذه الرسائل كغيرها. لا شيء جديد تُنشئه إن كانت الخطوة الأولى من الدليل منجزة.',
  'ad.p.auth.s2Title': 'تسمية نطاق الإرسال',
  'ad.p.auth.s2Text': 'النطاق المتحقَّق منه لدى Resend، الموضوع في MAIL_FROM_DOMAIN، يمنح عنوان noreply@ الذي يوقّع هذه الرسائل. والنطاق غير المتحقَّق يُسقط رسائل التسجيل في البريد المزعج أو يمنع إرسالها.',
  'ad.p.auth.s3Title': 'ربط SMTP الخاص بالمصادقة',
  'ad.p.auth.s3Text': 'في Supabase، Authentication ← Emails ← SMTP Settings، اختر SMTP مخصّصًا وانسخ القيم أدناه. عندئذ يتوقف Supabase عن الكتابة من عنوانه العام: تخرج التأكيدات من PaperAtlas. هذا الإعداد يقيم في Supabase، ولا تستطيع اللوحة قراءته، فتحتفظ بالإقرار.',
  'ad.p.auth.s4Title': 'استلام رسالة مصادقة حقيقية',
  'ad.p.auth.s4Text': 'الزر أدناه يطلب من Supabase رسالة إعادة تعيين كلمة المرور إلى عنوانك: وهو الفعل الوحيد الذي يثبت أن SMTP يحمل اسم PaperAtlas. وما دامت لم تصل، تبقى الخطوة الثالثة مُقَرًّا بها لا مُثبَتة.',
  'ad.p.auth.smtpTitle': 'القيم المطلوب نسخها، واحدة واحدة',
  'ad.p.auth.host': 'المضيف',
  'ad.p.auth.port': 'المنفذ',
  'ad.p.auth.user': 'المستخدم',
  'ad.p.auth.pass': 'كلمة المرور',
  'ad.p.auth.from': 'المرسِل',
  'ad.p.auth.copy': 'نسخ',
  'ad.p.auth.smtpPassHint': 'كلمة المرور هي مفتاح Resend نفسه — مفتاح RESEND_API_KEY. لا تُنسخ يدويًا: خُذه من Resend لحظة الإعداد.',
  'ad.p.auth.passValue': 'مفتاح Resend (RESEND_API_KEY)',
  'ad.p.auth.smtpCopyAll': 'نسخ القيم الخمس',
  'ad.p.auth.smtpCopied': 'نُسخت القيم الخمس: ألصقها في Supabase واحدة تحت الأخرى.',
  'ad.p.auth.smtpCopyFail': 'رفض المتصفح النسخ؛ تبقى القيم على الشاشة لتُنسخ يدويًا.',
  'ad.p.auth.smtpOpen': 'فتح Authentication',
  'ad.p.auth.smtpOpenHint': 'Supabase ← Authentication ← Emails ← SMTP Settings',
  'ad.p.auth.s5Title': 'تنبيه B2B إلى الورشة',
  'ad.p.auth.s5Text': 'التنبيه الذي يعيد الورشة إلى طلب B2B بلا جواب يخرج بـ Resend والمفتاح نفسه، لكن من دالة أخرى: قد يتعطّل وحده. الاختبار أدناه يرسل نموذجًا كاملًا إلى عنوانك — المرسِل والموضوع والتنسيق — دون أن يكتب إلى أي ورشة.',
  'ad.p.auth.b2bTest': 'إرسال تنبيه تجريبي',
  'ad.p.auth.b2bTesting': 'الإرسال جارٍ…',
  'ad.p.auth.b2bSent': 'انطلق التنبيه التجريبي إلى {to}. ابحث عن «Rappel B2B» في الموضوع: يجب أن يكون التوقيع PaperAtlas.',
  'ad.p.auth.b2bFail': 'لم ينطلق التنبيه التجريبي.',
  'ad.p.auth.b2bBlocked': 'يجب وضع المفتاح والنطاق أولاً: التنبيه يسلك الطريق نفسه.',
  'ad.p.auth.b2bProofAt': 'انطلق الاختبار في {date}',
  'ad.p.auth.b2bProofNone': 'لم ينطلق أي اختبار',
  'ad.p.auth.b2bHint': 'اختبار ناجح يؤرّخ الخطوة على هذا الجهاز؛ وهو يثبت الانطلاق لا الاستلام.',
  'ad.p.auth.b2bUndo': 'نسيان هذا الاختبار',
  'ad.p.auth.modelsRtl': 'أُعيدت مراجعته على الهاتف: لكل كتلة اتجاه قراءة خاص بها، والرابط الطويل يُقطع بدل أن يفيض، والتوقيع لم يعد يخلط العربية والإنجليزية في سطر واحد.',
  'ad.p.auth.declare': 'إقرار بأن SMTP موصول',
  'ad.p.auth.declareHint': 'بعد حفظ القيم الخمس في Supabase: تُقرأ الخطوة على هذا الإقرار، مؤرَّخًا على هذا الجهاز.',
  'ad.p.auth.undeclare': 'سحب الإقرار',
  'ad.p.auth.declaredOn': 'أُقرّ في {date}',
  'ad.p.auth.notDeclared': 'لم يُقَرّ بعد',
  'ad.p.auth.modelsTitle': 'اللغات الثلاث في القالب نفسه',
  'ad.p.auth.modelsSub': 'يرسل Supabase قالبًا واحدًا لكل نوع، إلى جميع الحسابات. لذلك يحمل هذان القالبان الفرنسية والعربية والإنجليزية تباعًا: يقرأ كلٌّ لغته، ولا يستقبل أحد لغة لا يقرأها.',
  'ad.p.auth.modelKind': 'نوع الرسالة',
  'ad.p.auth.modelConfirm': 'تأكيد التسجيل',
  'ad.p.auth.modelReset': 'إعادة تعيين كلمة المرور',
  'ad.p.auth.modelSubject': 'الموضوع',
  'ad.p.auth.modelBody': 'نص الرسالة (HTML)',
  'ad.p.auth.copySubject': 'نسخ الموضوع',
  'ad.p.auth.copyBody': 'نسخ النص',
  'ad.p.auth.modelsWhere': 'يُلصق هذان القالبان في Supabase، Authentication ← Emails ← Templates: «Confirm signup» و«Reset password». والرابط {{ .ConfirmationURL }} يملؤه Supabase بنفسه؛ لا تغيّره.',
  'ad.p.auth.previewTitle': 'معاينة الكتلة العربية',
  'ad.p.auth.previewSub': 'الرسالة كما تُقرأ على هاتف: اتجاه القراءة وقطع الرابط الطويل وموضع التوقيع تُحكم هنا، دون فتح أي صندوق بريد.',
  'ad.p.auth.previewWidth': 'عرض الشاشة',
  'ad.p.auth.previewWidthHint': 'ثلاثة عروض للهاتف للمقارنة: 320 و360 و390 بكسل. تأخذ صفحة المعاينة العرض الذي تختاره، أما الكتلة العربية فلا تتغير.',
  'ad.p.auth.previewHeight': 'ارتفاع الشاشة',
  'ad.p.auth.previewHeightHint': 'ثلاثة ارتفاعات للنافذة نفسها: 320 و480 و640 بكسل. العرض يحكم قطع الأسطر، والارتفاع يحكم التمرير: ما يُرى من الرسالة قبل تمرير الإصبع.',
  'ad.p.auth.previewNote': 'لا شيء من هذه المعاينة يُرسل: رابط التأكيد يبقى علامة ثابتة، ولا يخدم هذا الإطار إلا القراءة.',
  'ad.p.auth.previewReste': 'عند ارتفاع {h} بكسل، يبقى {n} بكسل للتمرير حتى الوصول إلى التوقيع.',
  'ad.p.auth.previewResteZero': 'عند ارتفاع {h} بكسل، التوقيع ظاهر أصلًا: لا شيء للتمرير.',
  'ad.p.auth.previewTally': 'الارتفاعات الثلاثة، بعرض {w} بكسل',
  'ad.p.auth.previewTallyHint': 'الارتفاعات الثلاثة جنبًا إلى جنب بالعرض المختار، مع ما يبقى للتمرير حتى الوصول إلى التوقيع. نقرة تضع هذا الارتفاع على الإطار، دون إعادة تحميل.',
  'ad.p.auth.previewTallyRest': 'يبقى {n} بكسل للتمرير',
  'ad.p.auth.previewTallyZero': 'التوقيع ظاهر',
  'ad.p.auth.previewTallyPick': 'ضع ارتفاع {h} بكسل على إطار المعاينة، بعرض {w} بكسل.',
  'ad.p.auth.previewTallyCopy': 'نسخ الجرد',
  'ad.p.auth.previewTallyCopyHint': 'ينسخ جرد الارتفاعات الثلاثة: العرض المختار في الصدر، تليه القياسات الثلاثة واحدًا تحت الآخر مع ما يبقى للتمرير عند كل ارتفاع.',
  'ad.p.auth.previewTallyCopyHead': 'جرد الارتفاعات الثلاثة — بعرض {w} بكسل',
  'ad.p.auth.previewTallyCopyLine': '- {h} بكسل: {rest}',
  'ad.p.auth.previewTallyCopied': 'نُسخ الجرد — العرض المختار مذكور مع القياسات الثلاثة.',
  'ad.p.auth.previewTallyCopyFail': 'رفض المتصفح النسخ: يبقى الجرد مقروءًا على الشاشة ليُنسخ يدويًا.',
  'ad.p.auth.previewTallyLast': 'آخر نسخ للجرد في {date}، محفوظ على هذا الجهاز.',
  'ad.p.auth.previewTallyNever': 'لم يُنسخ الجرد بعد من هذا الجهاز.',
  'ad.p.auth.test': 'استلام رسالة تجريبية',
  'ad.p.auth.testing': 'الطلب جارٍ…',
  'ad.p.auth.testSent': 'أُرسل الطلب إلى {to}. افتح صندوق البريد: يجب أن يكون المرسِل PaperAtlas.',
  'ad.p.auth.testFail': 'لم يقبل Supabase إرسال هذه الرسالة.',
  'ad.p.auth.testReceived': 'تعليم الرسالة كمستلَمة',
  'ad.p.auth.proofAt': 'وصلت في {date}',
  'ad.p.auth.proofNone': 'لا رسالة واصلة',
  'ad.p.auth.proofHint': 'نقرة تؤرّخ استلام الرسالة على هذا الجهاز؛ ونقرة ثانية ترفع التاريخ.',
  'ad.p.auth.note': 'ما دامت هذه الخطوات الخمس غير منجزة، تخرج رسائل التسجيل وكلمة المرور من عنوان Supabase العام، بالإنجليزية.',
  'ad.p.mail.proof': 'آخر دليل',
  'ad.p.mail.proofAt': 'تجربة وردت في {date}',
  'ad.p.mail.proofNone': 'لم تُستلم تجربة',
  'ad.p.mail.gDoneOn': 'وردت في {date}',
  'ad.p.mail.gAgeToday': 'اليوم',
  'ad.p.mail.gAgeOne': 'قبل يوم واحد',
  'ad.p.mail.gAge': 'قبل {n} يومًا',
  'ad.p.mail.gAncienne': 'هذا الدليل أقدم من شهر: أعد تجربة لتحديثه.',
  'ad.p.mail.gToSuivi': 'متابعة هذه الورشة في المشروع',
  'ad.p.mail.steps': 'خطوات جاهزة {n} / {total}',
  'ad.p.mail.stepsHint':
    'خطوات الدليل المنجزة فعلًا، محسوبة على حالة الأسرار الحقيقية وعلى آخر تجربة وردت — تُقرأ دون فتح الخطوات الأربع.',
  'ad.p.mail.stepsOpenHint': 'فتح الدليل على أول خطوة ما زالت ناقصة',
  'ad.p.mail.gNext': 'الخطوة التالية',
  'ad.f.reply': 'رد',
  'ad.f.replyHint': 'فتح رسالة موجّهة مسبقًا إلى مرسل هذا الطلب.',
  'ad.f.demandeSubject': 'طلب B2B',
  'ad.f.demandesTodo': 'بحاجة إلى معالجة',
  'ad.f.demandesTodoHint':
    'لا تُبقى إلا الطلبات التي لم تُعالج بعد، الأقدم أولًا؛ ونقرة ثانية تفتحها كلها.',
  'ad.f.demandesDone': 'معالَجة',
  'ad.f.demandesNoneTodo': 'لا طلب بحاجة إلى معالجة: كلها تلقّت ردًا.',
  'ad.f.demandesOrderHint':
    'تتقدّم الطلبات التي لم تُعالج، الأقدم أولًا: تُقرأ الطابور بترتيب انتظارها.',

  'ad.suivi.stamp': 'متابعة المشروع',
  'ad.suivi.sub':
    'ملف قيادة المشروع، مقروءًا في مكانه: النسبة الرسمية، والوحدات التي تكوّنها، والمراحل، وما لا يزال معطّلًا.',
  'ad.suivi.updated': 'حُدّث في',
  'ad.suivi.version': 'الإصدار',
  'ad.suivi.avancement': 'التقدّم الرسمي',
  'ad.suivi.points': 'النقاط المحققة',
  'ad.suivi.acheves': 'وحدات مكتملة',
  'ad.suivi.chantiers': 'ورشات منجزة',
  'ad.suivi.modulesTitle': 'وزن كل وحدة',
  'ad.suivi.modulesNote': 'الوزن والتقدّم، مقروءان من ملف القيادة',
  'ad.suivi.total': 'المجموع المرجّح',
  'ad.suivi.restePart': 'يتبقّى {pts} نقطة من 100 · {pct} % من المشروع',
  'ad.suivi.manqueTitle': 'تفصيل النقاط الناقصة',
  'ad.suivi.manqueNote': '{n} وحدة ما زالت مفتوحة · {pts} نقطة لاستكمالها',
  'ad.suivi.manqueLourd': 'الأثقل',
  'ad.suivi.manqueTotal': 'النقاط الناقصة',
  'ad.suivi.manqueJamais': ' · {n} وحدة لم يُنزل إليها قط من هذا الجهاز',
  'ad.suivi.manqueJamaisAucun': ' · نُزل إلى كل وحداته',
  'ad.suivi.manqueJamaisHint':
    'ما لم يُنزل إليه قط من هذا الجهاز، سطرًا سطرًا:\n{noms}',
  'ad.suivi.manqueJamaisHintItem': '- {nom}',
  'ad.suivi.manqueJamaisHintOk':
    'نُزل من هذا الجهاز إلى كل وحدة في هذه الكتلة.',
  'ad.suivi.manqueCsv': 'التفصيل بصيغة CSV',
  'ad.suivi.manqueCsvOk': 'تم تنزيل الملف',
  'ad.suivi.manqueCsvHint': 'تفصيل النقاط الناقصة وحده، جاهزًا لإرفاقه بتقرير مرحلة',
  'ad.suivi.descendusCsv': 'الوحدات التي نُزل إليها بصيغة CSV',
  'ad.suivi.descendusCsvOk': 'تم تنزيل الملف',
  'ad.suivi.descendusCsvPeriode':
    'تغطي النزولات الفترة من {ancien} إلى {recent} — {n} يومًا بين أقدمها وأحدثها.',
  'ad.suivi.descendusCsvPeriodeOne':
    'تقع النزولات كلها في يوم واحد، {date}.',
  'ad.suivi.descendusCsvPeriodeNone':
    'لا نزول مؤرَّخ من هذا الجهاز: سيرحل الملف دون فترة.',
  'ad.suivi.descendusCsvHint':
    'الوحدات التي نُزل إليها من هذا الجهاز، مع يوم كل واحدة، سطرًا سطرًا',
  'ad.suivi.chantierOuvOne': 'بند واحد ما زال مفتوحًا في المراحل',
  'ad.suivi.chantierOuv': '{n} بنود ما زالت مفتوحة في المراحل',
  'ad.suivi.chantierOuvZero': 'لا بند مفتوح في المراحل',
  'ad.suivi.chantierPart': '{pts} نقطة من {total} · {pct} % من الجزء المتبقي',
  'ad.suivi.chantierLourd': 'الأثقل',
  'ad.suivi.chantierJumpHint': 'النزول إلى سطر أثقل وحداتها — {module}',
  'ad.suivi.capTag': 'سقف {seuil} %',
  'ad.suivi.capToCross': 'تبقّى لعبوره',
  'ad.suivi.capCrossed': 'تم عبور السقف',
  'ad.suivi.capMail':
    'البريد يزن {poids}: إذا بلغ 100 % ربح {gain} نقطة ورفع المجموع إلى {total} %.',
  'ad.suivi.capAfter': 'بعده لا يبقى سوى {reste} نقطة لبلوغ {seuil} %.',
  'ad.suivi.capAfterNone': 'بعده صار سقف {seuil} % معبورًا.',
  'ad.suivi.capHoverHead':
    'الوحدات الـ {n} الباقية قبل سقف {seuil} %، من الأثقل إلى الأخفّ:',
  'ad.suivi.capHoverItem': '· {module} — {pt} نقطة متبقّية',
  'ad.suivi.capHoverFoot': 'يبقى {reste} نقطة لعبوره في المجموع.',
  'ad.suivi.capHoverDone': 'سقف {seuil} % معبور: لا تبقى وحدة قبله.',
  'ad.suivi.capListShow': 'عرض الوحدات المتبقية قبل السقف',
  'ad.suivi.capListHide': 'طيّ قائمة الوحدات',
  'ad.suivi.capGum': 'نسيان هذا الأثر على هذا الجهاز',
  'ad.suivi.capGumHint':
    'الممحاة الصغيرة تنسى تاريخ عبور السقف على هذا الجهاز — الخطة وأرشيفها لا يتغيّران.',
  'ad.suivi.capGumConfirm': 'نسيان',
  'ad.suivi.capGumConfirmHint': 'اضغط مرة أخرى لنسيان هذا التاريخ على هذا الجهاز.',
  'ad.suivi.capReached': 'عُبر السقف في {date}',
  'ad.suivi.capReachedHint':
    'عُبر سقف 95 % في {date} — تاريخ محفوظ على هذا الجهاز، لا منسوخ يدويًا.',
  'ad.suivi.capReachedDays': 'مضت {n} يومًا منذ عبوره.',
  'ad.suivi.capJumpHint': 'النزول إلى سطر هذه الوحدة في جدول أوزان الوحدات.',
  'ad.suivi.capJumpHintAt':
    'النزول إلى سطر هذه الوحدة في الجدول · أُنجز في {date}.',
  'ad.suivi.capDescendusVersArchive':
    'النزول إلى سطر الأرشيفات في التذكير: هناك تُضاف الملفات.',
  'ad.suivi.modVuLe':
    'سطر نُزل إليه من هذا الجهاز · أُنجز في {date}.',
  'ad.suivi.modVuSansLe':
    'سطر نُزل إليه من هذا الجهاز · يوم النزول غير مؤرَّخ.',
  'ad.suivi.modArchiveLe':
    'آخر أرشيف لهذا الورش غادر هذا الجهاز في {date}.',
  'ad.suivi.modArchiveJump':
    'آخر أرشيف لهذا الورش غادر هذا الجهاز في {date} · نقرة تنزل إلى سطر الأرشيفات في التذكير.',
  'ad.suivi.modOublier': 'نسيان هذا السطر الذي نُزل إليه',
  'ad.suivi.modOublierHint':
    'ينسى هذا السطر وحده الذي نُزل إليه من هذا الجهاز، دون مسّ الأسطر الأخرى. لا تُمسّ أي وحدة في الخطة.',
  'ad.suivi.modOublierConfirm': 'تأكيد نسيان هذا السطر',
  'ad.suivi.modOublierConfirmHint':
    'نقرة ثانية تنسى هذا السطر وحده على هذا الجهاز.',
  'ad.suivi.capDescendus': 'الوحدات التي نُزل إليها {n} / {total}',
  'ad.suivi.capDescendusHint':
    'ما نُزل إليه من هذا الجهاز، سطرًا سطرًا:\n{noms}',
  'ad.suivi.capDescendusHintItem': '- {nom} · أُنجز في {date}',
  'ad.suivi.capDescendusHintItemSansLe': '- {nom} · يوم غير مؤرَّخ',
  'ad.suivi.capDescendusOk':
    'لم يُنزل بعد إلى أي وحدة من هذه القائمة من هذا الجهاز.',
  'ad.suivi.capDescendusLe': ' · آخر نزول في {date}',
  'ad.suivi.capDescendusSansLe': ' · لا نزول مؤرَّخ',
  'ad.suivi.capJamaisLe': ' · {n} وحدة من القائمة لم يُنزل إليها قطّ',
  'ad.suivi.capJamaisAucun': ' · نُزل إلى كل وحداتها',
  'ad.suivi.capDescendusOublier': 'نسيان الوحدات التي نُزل إليها',
  'ad.suivi.capDescendusOublierHint':
    'ينسى الوحدات التي نُزل إليها من هذا الجهاز ويوم آخر نزول. لا تُمسّ أي وحدة في الخطة.',
  'ad.suivi.capDescendusOublierConfirm': 'تأكيد النسيان',
  'ad.suivi.capDescendusOublierConfirmHint':
    'نقرة ثانية تنسى الوحدات التي نُزل إليها على هذا الجهاز.',
  'ad.suivi.chantierFiltrer': 'تضييق التذكير على هذه الورشة وحدها',
  'ad.suivi.chantierResserre': 'مضيّق على ورشة واحدة',
  'ad.suivi.chantierVoirTous': 'عرض الأربع',
  'ad.suivi.chantierArchive': 'أرشيف هذه الورشة',
  'ad.suivi.chantierArchiveHint':
    'ينزّل الخطة محصورة في هذه الورشة وحدها: نقاطها ووحداتها وما بقي مفتوحًا من مخرجاتها، دون بقية المستند.',
  'ad.suivi.chantierArchiveOk': 'تم تنزيل الأرشيف',
  'ad.suivi.mailGo': 'مرسل الرسائل',
  'ad.suivi.preuves': 'أدلة الإرسال {n} / {total}',
  'ad.suivi.preuvesHint': 'التأكيد وكلمة المرور وتذكير B2B: ثلاث رسائل وصلت أو انطلقت فعلًا من هذا الجهاز. المتبقّي: {list}. نقرة تفتح بطاقة المرسل.',
  'ad.suivi.preuvesOk': 'الأدلة الثلاثة مؤرَّخة على هذا الجهاز: التأكيد وكلمة المرور وتذكير B2B.',
  'ad.suivi.preuveConf': 'التأكيد',
  'ad.suivi.preuvePass': 'كلمة المرور',
  'ad.suivi.preuveB2b': 'تذكير B2B',
  'ad.suivi.preuveAt': '{label} · {date}',
  'ad.suivi.preuveNoDate': '{label} · بلا تاريخ بعد',
  'ad.suivi.preuvesClick': 'نقرة تفتح بطاقة المرسل.',
  'ad.suivi.mailGoModuleHint': 'فتح بطاقة «مرسل الرسائل» في الإعدادات، دون المرور بالتبويبات.',
  'ad.suivi.mailDoorHint': 'فتح بطاقة «مرسل الرسائل» في الإعدادات، مباشرة على كتلتها.',
  'ad.suivi.resendGo': 'Brevo',
  'ad.suivi.resendGoHint': 'فتح Brevo في تبويب جديد: النطاقات المتحقَّق منها ومفاتيح الإرسال الخاصة بورشة الرسائل.',
  'ad.suivi.modDoorHint': 'لهذه الوحدة بوابة مفتوحة: سطرها يقود إلى الشاشة التي تُقدّمها.',
  'ad.suivi.modDoorScreen': 'لهذا السطر بوابة مفتوحة: يقود إلى شاشة «{ecran}»، مقروءة من الخطة.',
  'ad.suivi.doorSeen': 'مفتوحة سابقًا',
  'ad.suivi.doorSeenHint': 'سبق فتح بطاقة «مرسل الرسائل» من هذا الجهاز في {date}.',
  'ad.suivi.doorSeenClear': 'نسيان الزيارة',
  'ad.suivi.doorSeenClearHint': 'مسح زيارة بطاقة «مرسل الرسائل» من هذا الجهاز: تختفي العلامة، وتبقى البطاقة وحالتها كما هي.',
  'ad.suivi.doorSeenCleared': 'أُعيدت {n} أبواب على {appareil}: تبقى البطاقة وحالتها كما هي.',
  'ad.suivi.appareilOrdi': 'هذا الحاسوب',
  'ad.suivi.appareilTel': 'هذا الهاتف',
  'ad.suivi.appareilTab': 'هذا الجهاز اللوحي',
  'ad.suivi.restePortes': 'أبواب مفتوحة · {n}',
  'ad.suivi.restePortesHint': 'لا يُبقي إلا أسطر هذه القائمة التي تحمل بابًا مفتوحًا — {n} من {total} — مقروءة من الخطة؛ ونقرة ثانية تعيد القائمة كاملة.',
  'ad.suivi.restePortesShown': '{n} سطرًا من {total}، تلك التي تحمل بابًا مفتوحًا',
  'ad.suivi.restePortesShownUsed': '{n} سطرًا من {total}، منها {used} بابًا سُلك سابقًا',
  'ad.suivi.resteCopy': 'نسخ هذه الأسطر',
  'ad.suivi.resteCopyHint': 'ينسخ فقط الأسطر التي يُبقيها زر الأبواب المفتوحة، كل سطر يتبعه اسم الشاشة التي يفتحها.',
  'ad.suivi.resteCopyHintUsed': 'ينسخ الأسطر {n} التي يُبقيها زر الأبواب المفتوحة — منها {used} بابًا سُلك سابقًا —، كل سطر يتبعه اسم الشاشة التي يفتحها ويوم الزيارة للأبواب المسلوكة.',
  'ad.suivi.resteCopyHead': 'ما تبقّى — أبواب مفتوحة ({n})',
  'ad.suivi.resteCopyHeadOublis':
    'ما تبقّى — أبواب مفتوحة ({n}) · {oublis} زيارة منسية على هذا الجهاز',
  'ad.suivi.resteCopyLine': '- {texte} — الشاشة: {ecran}',
  'ad.suivi.resteCopyLineUsed': '- {texte} — الشاشة: {ecran} · سُلك في {date}',
  'ad.suivi.resteCopied': 'نُسخ {n} سطرًا، كل سطر مع اسم شاشته.',
  'ad.suivi.resteCopyFail': 'رفض المتصفح النسخ: تبقى الأسطر مقروءة على الشاشة.',
  'ad.suivi.resteVues': 'سُلكت سابقًا · {n}',
  'ad.suivi.resteVuesHint': 'لا يُبقي إلا الأسطر التي سُلك بابها سابقًا من هذا الجهاز — {n} من {total} —؛ ونقرة ثانية تعيد القائمة كاملة.',
  'ad.suivi.resteVuesHintDetail':
    'لا يُبقي إلا الأسطر التي سُلك بابها سابقًا من هذا الجهاز — {n} من {total} —: {detail}؛ ونقرة ثانية تعيد القائمة كاملة.',
  'ad.suivi.resteVuesShown': '{n} سطرًا من {total}، تلك التي سُلك بابها سابقًا',
  'ad.suivi.doorOublis': '{n} زيارة منسية على هذا الجهاز',
  'ad.suivi.doorOublisLast': 'آخر نسيان في {date}',
  'ad.suivi.doorOublisNone': 'لا زيارة منسية حتى الآن',
  'ad.suivi.doorOublisHint': 'زيارات الأبواب التي أعادتها الممحاة الصغيرة لعلامة «سُلك سابقًا» على هذا الجهاز: يُقرأ العدد ويوم آخر نسيان من دفتر الجهاز.',
  'ad.suivi.doorOublisCsv': 'الزيارات في CSV',
  'ad.suivi.doorOublisCsvOk': 'نُزّل ملف CSV',
  'ad.suivi.doorOublisCsvHint':
    'ينزّل الدفتر بصيغة CSV — سطرًا لكل باب منسي، مع شاشته وورشة الخطة ويوم الفعل —، {n} سطرًا جاهزًا للإرفاق.',
  'ad.suivi.doorOublisCsvHintSpan':
    'ينزّل الدفتر بصيغة CSV — سطرًا لكل باب منسي، مع شاشته وورشة الخطة ويوم الفعل —، {n} سطرًا من {ancien} إلى {recent}، جاهزة للإرفاق.',
  'ad.suivi.doorOublisCsvPeriode':
    'يغطّي الدفتر الفترة من {ancien} إلى {recent} — {n} يومًا بين أقدم عودة وأحدثها.',
  'ad.suivi.doorOublisCsvPeriodeOne':
    'لا يغطّي الدفتر إلا يومًا واحدًا، {date}: أقدم عودة وأحدثها في اليوم نفسه.',
  'ad.suivi.doorOublisCsvBlocs':
    'يحمل الملف {n} سطرًا في {b} كتلة، محسوبة واحدة واحدة:',
  'ad.suivi.doorOublisCsvBlocItem': '{titre} — {n} سطرًا',
  'ad.suivi.doorOublisCsvBlocsNone': 'الملف فارغ: لا كتلة تُحسب.',
  'ad.suivi.doorOublisCsvBlocLourd':
    'أثقل كتلة في الملف هي « {titre} »، بـ {n} سطرًا من أصل {total} في الملف — {part} % من الكل.',
  'ad.suivi.doorOublisCsvBlocLourdNone': 'لا كتلة تحمل سطرًا: الأثقل لا يُسمّى.',
  'ad.suivi.doorOublisParChantier': 'الزيارات المُعادة حسب الورشة',
  'ad.suivi.doorOublisParChantierHintDetail':
    'زيارات الدفتر مرتّبة حسب ورشة الخطة، الأكثر أولًا، مع يوم آخر نسيان لكل ورشة والأيام التي تفصل أول نسيان لها عن آخره: {detail} — مقروءة من ذاكرة الجهاز نفسها.',
  'ad.suivi.doorOublisChantierDernier': 'آخر نسيان في {date}',
  'ad.suivi.doorOublisChantierSpan': '{n} يومًا بين أول نسيان وآخره',
  'ad.suivi.doorOublisChantierSpanOne': 'أول نسيان وآخره في اليوم نفسه',
  'ad.suivi.doorOublisChantierTokenHint':
    'لا يُبقي في الدفتر إلا نسيات «{nom}» — {n} فعلًا، من {premier} إلى {dernier} —، لوقت حذف سطر منها دون الخطأ في جاره؛ ونقرة ثانية تعيد الدفتر كاملًا.',
  'ad.suivi.doorOublisChantierTokenHintMasque':
    'لا يُبقي في الدفتر إلا نسيات «{nom}» — {n} فعلًا، من {premier} إلى {dernier} —: عندئذٍ يخرج من العرض {masques} سطرًا آخر من الدفتر، أولها بتاريخ {premierMasque}؛ ونقرة ثانية تعيد الدفتر كاملًا.',
  'ad.suivi.doorOublisChantierOn': 'الدفتر محصور في «{nom}» — {n} فعلًا',
  'ad.suivi.doorOublisChantierClear': 'إعادة الدفتر كاملًا',
  'ad.suivi.doorOublisSemaine': 'هذا الأسبوع · {n}',
  'ad.suivi.doorOublisSemaineHint':
    'لا يُبقي في الدفتر إلا النسيات الواقعة هذا الأسبوع — {n} فعلًا من {total} —، لإعادة قراءة الأفعال القريبة قبل إزالة أحدها؛ ونقرة ثانية تعيد الدفتر كاملًا. وشارة الورشة، إن كانت موضوعة، تبقى محفوظة: تُقرأ الاثنتان معًا.',
  'ad.suivi.doorOublisSemaineOn': 'الأسبوع الجاري — {n} فعلًا',
  'ad.suivi.doorOublisSemaineNote': 'الأفعال القريبة، قبل إزالة أحدها',
  'ad.suivi.doorOublisSemaineClear': 'إعادة الأفعال الأقدم',
  'ad.suivi.doorOublisSemaineHintBouts':
    'لا تُبقِ في الدفتر إلا الأفعال التي وقعت هذا الأسبوع — {n} فعلًا من {total}، من الأقدم في {ancien} إلى الأحدث في {recent} —، لإعادة قراءة الأفعال القريبة قبل إزالة أحدها؛ ونقرة ثانية تعيد الدفتر كاملًا. وشارة الشغل، إن كانت موضوعة، تبقى قائمة: تُقرأ الشارتان معًا.',
  'ad.suivi.doorOublisSemaineHintBoutsOne':
    'لا تُبقِ في الدفتر إلا الأفعال التي وقعت هذا الأسبوع — {n} فعلًا من {total}، كلها في {date} —، لإعادة قراءة الأفعال القريبة قبل إزالة أحدها؛ ونقرة ثانية تعيد الدفتر كاملًا. وشارة الشغل، إن كانت موضوعة، تبقى قائمة: تُقرأ الشارتان معًا.',
  'ad.suivi.doorOublisJetons': '{n} شارة موضوعة',
  'ad.suivi.doorOublisJetonsNone': 'لا شارة موضوعة',
  'ad.suivi.doorOublisJetonsHint':
    'الشارات الموضوعة على الدفتر — الشاشة والشغل والأسبوع — محسوبة معًا: تُضيّق القراءة دون إزالة أي نسيان. والممحاة تُطفئها كلها بفعل واحد.',
  'ad.suivi.doorOublisJetonsNoneHint':
    'لا شارة موضوعة على الدفتر: تعرض القائمة كل أفعالها. الشاشة والشغل والأسبوع تُوضع كلٌّ بنقرة، وتُقرأ معًا.',
  'ad.suivi.doorOublisJetonsClear': 'إطفاء الشارات',
  'ad.suivi.doorOublisJetonsClearHint':
    'تُطفئ {n} شارة موضوعة على الدفتر بفعل واحد وتعيد القائمة كاملة: لا يُزال أي نسيان، ولا يتغيّر عدد الدفتر.',
  'ad.suivi.doorOublisJetonsCleared':
    'أُطفئت {n} شارة: يعرض الدفتر من جديد كل أفعاله.',
  'ad.suivi.doorOublisJournal': 'الدفتر، فعلًا بفعل — من الأحدث إلى الأقدم',
  'ad.suivi.doorOublisJournalTri': 'الدفتر، مرتّبًا حسب الشاشة',
  'ad.suivi.doorOublisTriEcran': 'حسب الشاشة',
  'ad.suivi.doorOublisTriEcranHint':
    'يرتّب أفعال الدفتر تحت اسم شاشتها، لإعادة قراءة نسيانات الشاشة نفسها جنبًا إلى جنب قبل إزالة أحدها؛ ونقرة ثانية تعيد ترتيب الأحدث إلى الأقدم. لا يُزال أي نسيان.',
  'ad.suivi.doorOublisTriEcranOffHint':
    'الدفتر مرتّب حسب الشاشة: نقرة تعيد ترتيب الأحدث إلى الأقدم، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisTriEcranHintDetail':
    'يرتّب أفعال الدفتر تحت اسم شاشتها — {n} شاشة من {total} فعلًا، ولكل شاشة يوم نسيانها الأحدث: {detail} —، لإعادة قراءة نسيانات الشاشة نفسها جنبًا إلى جنب قبل إزالة أحدها؛ ونقرة ثانية تعيد ترتيب الأحدث إلى الأقدم. لا يُزال أي نسيان.',
  'ad.suivi.doorOublisTriEcranOffHintDetail':
    'الدفتر مرتّب حسب الشاشة — {n} شاشة من {total} فعلًا، ولكل شاشة يوم نسيانها الأحدث: {detail} —؛ نقرة تعيد ترتيب الأحدث إلى الأقدم، دون إزالة أي نسيان. والممحاة الصغيرة تفعل ذلك بنقرة واحدة.',
  'ad.suivi.doorOublisTriEcranItem': '{ecran} · {n} فعل/أفعال · آخرها في {date}',
  'ad.suivi.doorOublisTriEcranClear': 'العودة إلى ترتيب الأحدث',
  'ad.suivi.doorOublisTriEcranClearHint':
    'يعيد ترتيب الأحدث إلى الأقدم بنقرة واحدة: لا تبقى الشاشات الـ{n} مجمّعة، ولا يُزال أي نسيان، ولا يتغيّر عدد الدفتر.',
  'ad.suivi.doorOublisTriEcranClearHintDetail':
    'يعيد ترتيب الأحدث إلى الأقدم بنقرة واحدة. كان الترتيب يجمع، شاشةً شاشة: {detail}. لا يُزال أي نسيان، ويُقرأ الدفتر متّصلًا من جديد — شاشاته الـ{n} على {total} فعلًا.',
  'ad.suivi.doorOublisEcranItemNom': 'الشاشة {ecran}',
  'ad.suivi.doorOublisEcranTokenHint':
    'لا يُبقي في الدفتر إلا أفعال الشاشة «{ecran}» — {n} فعلًا في الدفتر —، ريثما يُزال أحدها دون الخطأ في الجار؛ ونقرة ثانية تعيد كل الشاشات. لا يُزال أي نسيان.',
  'ad.suivi.doorOublisEcranOn': 'الدفتر مضيّق على الشاشة «{ecran}» — {n} فعلًا',
  'ad.suivi.doorOublisEcranOnSpan':
    ' · {n} يومًا تفصل أول نسيان، في {ancien}، عن آخره، في {recent}',
  'ad.suivi.doorOublisEcranOnOne': ' · أول نسيان وآخره يقعان في اليوم نفسه، في {date}',
  'ad.suivi.doorOublisEcransDeplierHint':
    'يفرد شاشات الدفتر الـ{n} واحدة واحدة، على {total} فعلًا — {detail} —، ولكل شاشة ممحاتها الصغيرة، كي تُزال أفعال شاشة دون المرور سطرًا سطرًا. الإفراد لا يزيل أي نسيان.',
  'ad.suivi.doorOublisEcransReplierHint':
    'شاشات الدفتر الـ{n} مفروزة واحدة واحدة — {detail}. نقرة تطويها وتعيد القائمة إلى أسطرها وحدها؛ ولا يُزال أي نسيان.',
  'ad.suivi.doorOublisEcranDeplie': '{n} فعل/أفعال',
  'ad.suivi.doorOublisEcranGomme': 'إزالة أفعال هذه الشاشة',
  'ad.suivi.doorOublisEcranGommeHint':
    'إزالة أفعال الشاشة «{ecran}» من الدفتر — {n} فعلًا، من {premier} إلى {dernier} — بنقرة واحدة: الزيارات المحفوظة تبقى على هذا الجهاز، والخطة لا تتحرك.',
  'ad.suivi.doorOublisEcranGommeDone':
    'أُزيلت الشاشة «{ecran}» من الدفتر: أفعالها الـ{n} لم تبق فيه، والزيارات المحفوظة تبقى على هذا الجهاز، والخطة أيضًا.',
  'ad.suivi.doorOublisEcranNomHint':
    'الشاشة «{ecran}» · {n} يومًا تفصل بين أول نسيان لها، في {premier}، وآخره، في {dernier}.',
  'ad.suivi.doorOublisEcranNomHintOne':
    'الشاشة «{ecran}» · أول نسيان وآخره يقعان في اليوم نفسه، في {date}.',
  'ad.suivi.doorOublisEcranNomAppui':
    'نقرة لا تُبقي إلا أفعال هذه الشاشة — {n} في الدفتر —، ريثما يُزال أحدها دون المرور بالقائمة؛ ونقرة ثانية تُزيل أفعالها من الدفتر، مثل مِمحاتها الصغيرة. الزيارات المحفوظة والخطة لا تتغيّران.',
  'ad.suivi.doorOublisEcranNomAppuiOff':
    'نقرة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRelire': 'أكثر من فعل · {n}',
  'ad.suivi.doorOublisEcransRelireHint':
    'لا يُبقي في العرض إلا الشاشات التي تحمل أكثر من فعل — {n} من {total} شاشة، تحمل في المجموع {gestesPlusieurs} فعلًا، على كل الشاشات —، تلك التي تستدعي إعادة قراءة: {detail}. ولذلك يُخرج من العرض {ecartes} شاشة، مع أفعالها الـ{gestesEcartes}، شاشة بشاشة: {detailEcartes}. ونقرة ثانية تعيد كل الشاشات؛ ولا يُزال أي نسيان.',
  'ad.suivi.doorOublisEcransRelireOffHint':
    'لا يعرض العرض إلا الشاشات التي تحمل أكثر من فعل — {n} من {total} شاشة، تحمل في المجموع {gestesPlusieurs} فعلًا، على كل الشاشات: {detail}. وهو يُخرج {ecartes} شاشة، مع أفعالها الـ{gestesEcartes}: {detailEcartes}. ونقرة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRelireAucun': 'لا شاشة مُخرجة',
  'ad.suivi.doorOublisEcransRelireOn':
    'العرض مضيّق على الشاشات التي تحمل أكثر من فعل — {n} من {total}',
  'ad.suivi.doorOublisEcransRelireRecent':
    'آخر شاشة فُرّغت · {ecran} · في {date}',
  'ad.suivi.doorOublisEcransRelireRecentNone': 'لا شاشة مفرّغة على هذا الجهاز',
  'ad.suivi.doorOublisEcransFourniHint':
    'نقرة ثانية ترتّب شاشات العرض من الأكثر أفعالًا إلى الأخفّ؛ ونقرة ثالثة تطوي العرض. لا يُزال أي نسيان.',
  'ad.suivi.doorOublisEcransFourniOnHint':
    'الشاشات مرتّبة من الأكثر أفعالًا إلى الأخفّ: نقرة تطوي العرض دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransFourniOn':
    'شاشات مرتّبة من الأكثر أفعالًا إلى الأخفّ — {n} من {total}',
  'ad.suivi.doorOublisEcransDeplaces':
    'بين ترتيب الدفتر وترتيب الأكثر أفعالًا، تغيّر {n} شاشة من {total} مكانها.',
  'ad.suivi.doorOublisEcransDeplacesNone':
    'الشاشات الـ{total} تحفظ المكان نفسه في الترتيبين: الترتيب لا ينقل أي سطر.',
  'ad.suivi.doorOublisEcransRetiresNom':
    'شاشات أُخرجت من الدفتر بنقرة ثانية على اسمها · {n} — {list}. الفعل يفرّغ شاشة دون المرور بممحاة سطرها.',
  'ad.suivi.doorOublisEcransRetiresNomNone':
    'لم تخرج أي شاشة من الدفتر بعد بنقرة ثانية على اسمها: ممحاة الشاشة تبقى الطريق الوحيد.',
  'ad.suivi.doorOublisEcransVieux': 'آخر فعل أقدم من ٧ أيام · {n}',
  'ad.suivi.doorOublisEcransVieuxHint':
    'لا يُبقي في العرض إلا الشاشات التي يعود آخر فعلها إلى أكثر من سبعة أيام — {n} من {total} شاشة، تحتفظ بـ{gestesVieux} فعلًا: {detail} —، تلك التي لم نعد نعيد قراءتها. مرشّح إعادة القراءة، إن كان موضوعًا، يبقى ثابتًا: الاثنان يُقرآن معًا. ونقرة ثانية تعيد كل الشاشات؛ ولا يُزال أي نسيان.',
  'ad.suivi.doorOublisEcransVieuxOffHint':
    'لا يعرض العرض إلا الشاشات التي يعود آخر فعلها إلى أكثر من سبعة أيام — {n} من {total} شاشة، تحتفظ بـ{gestesVieux} فعلًا: {detail}. ونقرة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransVieuxOn':
    'العرض مضيّق على شاشات أقدم من سبعة أيام — {n} من {total}',
  'ad.suivi.doorOublisEcransVieuxAucun': 'لا شاشة أقدم من سبعة أيام',
  'ad.suivi.doorOublisEcransVieuxPlusAncien':
    'الأقدم هي « {ecran} »، آخر فعل لها في {date} — {n} يومًا دون مراجعة.',
  'ad.suivi.doorOublisEcransVieuxPlusAncienNone':
    'لا شاشة لها آخر فعل أقدم من سبعة أيام: لا شيء ينام طويلًا بعد.',
  'ad.suivi.doorOublisEcransRetour': 'عائدة إلى الدفتر · {n}',
  'ad.suivi.doorOublisEcransRetourHint':
    'لا يُبقي في العرض إلا الشاشات التي سُحبت سابقًا بنقرة ثانية على اسمها ثم عادت إلى الدفتر — {n} من {total} شاشة —، مع يوم عودتها: {detail}. لا يُسقط أي نسيان؛ ونقرة ثانية تعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetourOffHint':
    'لا يعرض العرض إلا الشاشات العائدة إلى الدفتر بعد سحبها باسمها — {n} من {total} شاشة، مع يوم عودتها: {detail}. نقرة تعيد كل الشاشات، دون إسقاط أي نسيان.',
  'ad.suivi.doorOublisEcransRetourOn':
    'العرض مضيّق على الشاشات العائدة إلى الدفتر — {n} من {total}',
  'ad.suivi.doorOublisEcransRetourAucun': 'لا شاشة عائدة بعد',
  'ad.suivi.doorOublisEcransRetourItem': '{ecran} · عادت في {date}',
  'ad.suivi.doorOublisEcransRetourItemN': '{ecran} · عادت في {date} · أُزيلت ثم أُعيدت {n} مرة',
  'ad.suivi.doorOublisEcransRetiresPlusieurs': 'أُزيلت أكثر من مرة · {n}',
  'ad.suivi.doorOublisEcransRetiresPlusieursHint':
    'لا يُبقي في الطيّ إلا الشاشات التي أُزيلت من الدفتر بالضغط على اسمها أكثر من مرة من هذا الجهاز — {n} من {total} شاشة —: {detail}. لا يحذف أي غياب؛ ونقرة ثانية تعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetiresPlusieursOffHint':
    'الطيّ لا يُظهر إلا الشاشات التي أُزيلت أكثر من مرة باسمها — {n} من {total} شاشة: {detail}. نقرة تعيد كل الشاشات، دون حذف أي غياب.',
  'ad.suivi.doorOublisEcransRetiresPlusieursOn':
    'طيّ مضيّق على الشاشات التي أُزيلت أكثر من مرة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetiresPlusieursAucun': 'لا شاشة أُزيلت أكثر من مرة',
  'ad.suivi.doorOublisEcransRetiresPlusieursItem': '{ecran} · أُزيلت {n} مرة',
  'ad.suivi.doorOublisEcransRetiresPlusieursPlus':
    'الأكثر إزالة هي «{ecran}»، أُزيلت {n} مرة من هذا الجهاز.',
  'ad.suivi.doorOublisEcransRetiresPlusieursPlusNone':
    'لم تُزل أي شاشة أكثر من مرة: لا شاشة أكثر إزالةً لتُسمّى.',
  'ad.suivi.doorOublisEcransRetourDeux': 'عائدة مرتين أو أكثر · {n}',
  'ad.suivi.doorOublisEcransRetourDeuxHint':
    'لا يُبقي في القائمة إلا الشاشات التي عادت إلى الدفتر مرتين على الأقل بعد إزالتها بالضغط على اسمها — {n} من {total} شاشة: {detail}. لا يحذف أي نسيان؛ وضغطة ثانية تعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetourDeuxOffHint':
    'القائمة لا تُظهر إلا الشاشات التي عادت مرتين على الأقل إلى الدفتر — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetourDeuxOn':
    'قائمة مضيّقة على الشاشات العائدة مرتين على الأقل — {n} من {total}',
  'ad.suivi.doorOublisEcransRetourDeuxAucun': 'لا شاشة عادت مرتين',
  'ad.suivi.doorOublisEcransRetourDeuxItem': '{ecran} · عادت {n} مرة',
  'ad.suivi.doorOublisEcransRetourDeuxPlus':
    'الأكثر عودةً هو « {ecran} »، عاد {n} مرة إلى الدفتر.',
  'ad.suivi.doorOublisEcransRetourDeuxPlusNone':
    'لا شاشة عادت مرتين بعد: لا يوجد أكثر عودةً ليُسمّى.',
  'ad.suivi.doorOublisEcransRepartis': 'عادت ثم غادرت · {n}',
  'ad.suivi.doorOublisEcransRepartisHint':
    'لا يُبقي في القائمة إلا الشاشات التي عادت إلى الدفتر ثم أُزيلت مرة أخرى بالضغط على اسمها — {n} شاشة، مع يوم آخر إزالة لها: {detail}. لا يحذف أي نسيان؛ ونقرة ثانية تعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisOffHint':
    'القائمة لا تُظهر إلا الشاشات التي عادت إلى الدفتر ثم غادرته — {n} شاشة، مع يوم آخر إزالة لها: {detail}. نقرة تعيد كل الشاشات، دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisOn':
    'القائمة مضيّقة على الشاشات التي عادت ثم غادرت — {n} شاشة',
  'ad.suivi.doorOublisEcransRepartisAucun': 'لا شاشة عادت ثم غادرت',
  'ad.suivi.doorOublisEcransRepartisItem': '{ecran} · أُزيلت مرة أخرى في {date}',
  'ad.suivi.doorOublisEcransRepartisVieux': 'غادرت منذ أكثر من ٧ أيام · {n}',
  'ad.suivi.doorOublisEcransRepartisVieuxHint':
    'لا يُبقي في القائمة إلا الشاشات التي عادت إلى الدفتر ثم غادرت منذ أكثر من سبعة أيام — {n} من {total} شاشة، مع يوم آخر إزالة لها: {detail}. ولا يحذف أي سجل؛ ونقرة ثانية تعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisVieuxOffHint':
    'القائمة تُظهر الشاشات التي غادرت منذ أكثر من سبعة أيام فقط — {n} من {total} شاشة، مع يوم آخر إزالة لها: {detail}. نقرة تعيد كل الشاشات دون حذف أي سجل.',
  'ad.suivi.doorOublisEcransRepartisVieuxOn':
    'قائمة مضيّقة على الشاشات التي غادرت منذ أكثر من سبعة أيام — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisVieuxAucun': 'لا شاشة غادرت منذ أكثر من سبعة أيام',
  'ad.suivi.doorOublisEcransRepartisVieuxPlusAncien':
    'الأطول غيابًا هي « {ecran} »، أُزيلت في {date} — {n} يومًا خارج الكانوت.',
  'ad.suivi.doorOublisEcransRepartisVieuxPlusAncienNone':
    'لا شاشة غادرت منذ أكثر من سبعة أيام: لا يوجد أقدم مغادرة لتسميتها.',
  'ad.suivi.doorOublisEcransRepartisMois': 'غادرت هذا الشهر · {n}',
  'ad.suivi.doorOublisEcransRepartisMoisHint':
    'لا تُبقي في الفتحة إلا الشاشات التي عادت إلى الكانوت ثم غادرته وكان آخر سحب لها في الشهر الجاري — {n} من {total} شاشة غادرت، مع يوم ذلك السحب: {detail}. لا تحذف أي نسيان؛ ونقرة ثانية تعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisMoisOffHint':
    'لا تُظهر الفتحة إلا الشاشات التي غادرت وكان آخر سحب لها في الشهر الجاري — {n} من {total} شاشة، مع يوم ذلك السحب: {detail}. نقرة واحدة تعيد كل الشاشات، دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisMoisOn':
    'فتحة مضيَّقة على الشاشات التي غادرت هذا الشهر — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisMoisAucun': 'لا شاشة غادرت هذا الشهر',
  'ad.suivi.doorOublisEcransRepartisMoisPlusAncien':
    'أقدم مغادرة هذا الشهر هي «{ecran}»، أُزيلت في {date} — {n} يومًا خارج الكانوت.',
  'ad.suivi.doorOublisEcransRepartisMoisPlusAncienNone':
    'لا شاشة غادرت هذا الشهر: لا يوجد أقدم مغادرة لتسميتها.',
  'ad.suivi.doorOublisEcransRepartisMoisSpan':
    'بين أقدم مغادرة، في {ancien}، وأحدثها، في {recent}، تفصل {n} يومًا بين الشاشات التي غادرت هذا الشهر.',
  'ad.suivi.doorOublisEcransRepartisMoisSpanOne':
    'كل الشاشات التي غادرت هذا الشهر غادرت في اليوم نفسه، {date}: لا فارق أيام يُقرأ هنا.',
  'ad.suivi.doorOublisEcransRepartisSemaine': 'غادرت هذا الأسبوع · {n}',
  'ad.suivi.doorOublisEcransRepartisSemaineHint':
    'لا تُبقي في الفتحة إلا الشاشات التي عادت إلى الكانوت ثم غادرته وكان آخر سحب لها في الأسبوع الجاري — {n} من {total} شاشة غادرت، مع يوم ذلك السحب: {detail}. لا تحذف أي نسيان؛ ونقرة ثانية تعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisSemaineOffHint':
    'لا تُظهر الفتحة إلا الشاشات التي غادرت وكان آخر سحب لها في الأسبوع الجاري — {n} من {total} شاشة، مع يوم ذلك السحب: {detail}. نقرة واحدة تعيد كل الشاشات، دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisSemaineOn':
    'فتحة مضيَّقة على الشاشات التي غادرت هذا الأسبوع — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisSemaineAucun': 'لا شاشة غادرت هذا الأسبوع',
  'ad.suivi.doorOublisEcransRepartisSemainePlusRecent':
    'أحدث مغادرة هذا الأسبوع هي « {ecran} »، في {date} — مضى {n} يومًا.',
  'ad.suivi.doorOublisEcransRepartisSemainePlusRecentNone':
    'لا شاشة غادرت هذا الأسبوع: لا مغادرة حديثة لتسميتها.',
  'ad.suivi.doorOublisEcransRepartisSemainePlusAncien':
    'أقدم مغادرة هذا الأسبوع هي « {ecran} »، أُزيلت في {date} — مضى {n} يومًا.',
  'ad.suivi.doorOublisEcransRepartisSemainePlusAncienNone':
    'لا شاشة غادرت هذا الأسبوع: لا مغادرة قديمة تُذكر.',
  'ad.suivi.doorOublisEcransRepartisHier': 'غادرت أمس · {n}',
  'ad.suivi.doorOublisEcransRepartisAvantHier': 'غادرت قبل أمس · {n}',
  'ad.suivi.doorOublisEcransRepartisAvantHierHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت إلى الدفتر ثم غادرته وكان آخر سحب لها في اليوم السابق للأمس — {n} من {total} شاشة غادرت، مع يوم ذلك السحب: {detail}. لا تحذف أي نسيان؛ ضغطة ثانية تعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisAvantHierOffHint':
    'القائمة لا تُظهر إلا الشاشات التي غادرت قبل أمس — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisAvantHierOn':
    'قائمة مضيّقة على الشاشات التي غادرت قبل أمس — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisAvantHierAucun': 'لا شاشة غادرت قبل أمس',
  'ad.suivi.doorOublisEcransRepartisAvantHierEcartes':
    'تستبعد {n} سطرًا من قائمة العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransRepartisQuinzaine': 'غادرت هذه الخمسة عشر يومًا · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت ثم غادرت خلال الأيام الخمسة عشر الأخيرة — {n} من أصل {total} شاشة غادرت، مع يوم آخر إزالة: {detail}. لا تُزيل أي تسجيل؛ والضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineOffHint':
    'القائمة تعرض فقط الشاشات التي غادرت خلال الأيام الخمسة عشر الأخيرة — {n} من أصل {total} شاشة، مع يوم آخر إزالة: {detail}. الضغط مرة أخرى يعيد كل الشاشات، دون إزالة أي تسجيل.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineOn':
    'قائمة مضيّقة على الشاشات التي غادرت هذه الخمسة عشر يومًا — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineAucun':
    'لا شاشة غادرت خلال الأيام الخمسة عشر الأخيرة',
  'ad.suivi.doorOublisEcransRepartisQuinzaineEcartes':
    'تستبعد {n} سطرًا من قائمة العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemainePart':
    'منها {n} شاشة غادرت هذا الأسبوع، من أصل {total} في الخمسة عشر يومًا.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemainePartNone':
    'لا شاشة من أصل {total} غادرت هذا الأسبوع.',
  'ad.suivi.doorOublisCsvRepartisSemaineTotal':
    'الشاشات التي غادرت هذا الأسبوع: {n} شاشة، محسوبة يومًا بيوم في الملف.',
  'ad.suivi.doorOublisCsvRepartisSemaineTotalNone':
    'الشاشات التي غادرت هذا الأسبوع: لا مغادرة هذا الأسبوع، والسطر في الملف يقوله يومًا بيوم.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenus':
    'غادرت هذه الخمسة عشر يومًا وعادت منذ · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusHint':
    'لا تُبقِ في القائمة إلا الشاشات التي غادرت خلال الخمسة عشر يومًا ثم عادت إلى الدفتر منذ ذلك الحين — {n} من {total} شاشة غادرت —، مع يوم آخر سحب لها ويوم عودتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusOffHint':
    'القائمة لا تُظهر إلا الشاشات التي غادرت خلال الخمسة عشر يومًا ثم عادت إلى الدفتر — {n} من {total} شاشة غادرت: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusOn':
    'القائمة مضيّقة على الشاشات التي غادرت خلال الخمسة عشر يومًا ثم عادت — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusAucun':
    'لا شاشة غادرت خلال الخمسة عشر يومًا وعادت إلى الدفتر',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusItem':
    '{ecran} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusEcartes':
    'يستبعد {n} سطرًا من قائمة العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusDelai':
    'المدة المتوسطة بين المغادرة والعودة: {n} يومًا، شاشة بشاشة، على {k} شاشة عادت.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusDelaiOne':
    'المدة بين المغادرة والعودة: شاشة واحدة عادت، {n} يومًا محفوظة — والمتوسط لا يقول أكثر.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusDelaiNone':
    'المدة بين المغادرة والعودة: لا عودة مؤرخة على هذه الشاشات، والمدة لا تُقرأ بعد.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamais':
    'غادرت في الخمسة عشر يومًا ولم تعد · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisHint':
    'لا تُبقي الفتحة إلا الشاشات التي غادرت في الخمسة عشر يومًا ولم يُعِدها شيء إلى الكانوت — {n} من أصل {total} شاشة غادرت — مع يوم مغادرتها: {detail}. لا تحذف أي نسيان؛ ونقرة ثانية تعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisOffHint':
    'الفتحة لا تعرض إلا الشاشات التي غادرت في الخمسة عشر يومًا ولم تعد — {n} من أصل {total} شاشة: {detail}. نقرة تعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisOn':
    'الفتحة محصورة على الشاشات التي غادرت ولم تعد — {n} من أصل {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisAucun':
    'لا شاشة غادرت تنتظر عودتها بعد',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisItem':
    '{ecran} · غادرت في {date} · لم تعد',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisEcartes':
    'يستبعد {n} سطرًا من الفتحة من العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisCsvQuinzaineRevenusCount':
    'الشاشات التي يبقيها زر «غادرت في الخمسة عشر يومًا ثم عادت»: {n}، مع مغادرتها وعودتها.',
  'ad.suivi.doorOublisCsvQuinzaineRevenusCountNone':
    'الشاشات التي يبقيها زر «غادرت في الخمسة عشر يومًا ثم عادت»: لا شيء الآن، والزر لا يبقي شيئًا.',
  'ad.suivi.doorOublisCsvCumulPeriode':
    'فترة المجموع التراكمي: {n} يومًا بين أول مغادرة في {ancien} وآخرها في {recent}.',
  'ad.suivi.doorOublisCsvCumulPeriodeOne':
    'فترة المجموع التراكمي: يوم مغادرة واحد محفوظ، في {date}.',
  'ad.suivi.doorOublisCsvCumulPeriodeNone':
    'فترة المجموع التراكمي: لا مغادرة مؤرخة على هذا الجهاز، والفترة لا تُقرأ بعد.',
  'ad.suivi.doorOublisCsvSemaineDelai':
    'متوسط مهلة العودة في الأسبوع الجاري: {n} يومًا على {k} عودة مؤرخة.',
  'ad.suivi.doorOublisCsvSemaineDelaiOne':
    'مهلة العودة في الأسبوع الجاري: عودة مؤرخة واحدة، {n} يومًا محفوظة.',
  'ad.suivi.doorOublisCsvSansRetour':
    'شاشات دون أي عودة: {n} شاشة غادرة لم يُعِدها شيء إلى الدفتر.',
  'ad.suivi.doorOublisCsvSansRetourNone':
    'لا شاشة دون عودة: كل شاشة غادرة لها أثر عودة.',
  'ad.suivi.doorOublisCsvHorsQuinzaine':
    'عودات تتجاوز خمسة عشر يومًا: {n} عودة بعد غياب خرج أصلاً من الخمسة عشر يومًا، في كل تاريخ العودات المؤرخة.',
  'ad.suivi.doorOublisCsvHorsQuinzaineNone':
    'عودات تتجاوز خمسة عشر يومًا: لا عودة بعد غياب خرج من الخمسة عشر يومًا.',
  'ad.suivi.doorOublisCsvSemaineDelaiNone':
    'مهلة العودة في الأسبوع الجاري: لا عودة مؤرخة هذا الأسبوع.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaine':
    'غادرت في الخمسة عشر يومًا وعادت منذ · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineHint':
    'لا تُبقِ في القائمة إلا الشاشات التي غادرت في الخمسة عشر يومًا ثم عادت إلى الدفتر خلال الأسبوع الجاري — {n} من {total} شاشة غادرت —، مع يوم سحبها ويوم عودتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineOffHint':
    'لا تعرض القائمة إلا الشاشات التي غادرت في الخمسة عشر يومًا وعادت هذا الأسبوع — {n} من {total} شاشة غادرت: {detail}. الضغط يعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineOn':
    'القائمة محصورة في الشاشات التي غادرت في الخمسة عشر يومًا وعادت هذا الأسبوع — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineAucun':
    'لا شاشة غادرت في الخمسة عشر يومًا عادت هذا الأسبوع',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineItem':
    '{ecran} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineEcartes':
    'تُقصي {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifs':
    'غادرت في الخمسة عشر يومًا، وعادت بعد أكثر من سبعة · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsHint':
    'لا تُبقِ في القائمة إلا العودات المتأخرة للخمسة عشر يومًا — {n} من {total} شاشة غادرة —، تلك التي تعقب عودتها غيابها بأكثر من سبعة أيام، مع تاريخيها ومهلتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsOffHint':
    'لا تُظهر القائمة إلا الشاشات التي غادرت في الخمسة عشر يومًا وعادت بعد أكثر من سبعة أيام — {n} من {total} شاشة، مع مهلتها: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsOn':
    'قائمة محصورة على العودات المتأخرة للخمسة عشر يومًا — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsAucun':
    'لا عودة متأخرة في الخمسة عشر يومًا',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsItem':
    '{ecran} · غادرت في {date} · عادت في {retour} · {n} يومًا',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsEcartes':
    'تُقصي {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPlusRapide':
    'أسرع عودة هي « {ecran} »، عادت بعد {n} يومًا من غياب بدأ في {date}.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPlusLent':
    'أبطأ عودة هي « {ecran} »، عادت بعد {n} يومًا من غياب بدأ في {date}.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsBoutsNone':
    'لا عودة متأخرة بعد لهذه الشاشات: لا تُسمّى الأسرع ولا الأبطأ.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPart':
    'هذه العودات البطيئة تشكّل {n} عودة من {k} في الخمسة عشر يومًا، أي {pct} % من العودات المؤرّخة.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPartNone':
    'لا عودة مؤرّخة في الخمسة عشر يومًا: حصة العودات البطيئة لا تُقرأ.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapides':
    'عودات سريعة في الخمسة عشر يومًا · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesHint':
    'لا تُبقِ في القائمة إلا العودات السريعة للخمسة عشر يومًا — {n} من {total} شاشة غادرة —، تلك التي عادت في سبعة أيام أو أقل بعد غيابها، مع تاريخيها ومهلتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesOffHint':
    'لا تُظهر القائمة إلا الشاشات التي غادرت في الخمسة عشر يومًا وعادت في سبعة أيام أو أقل — {n} من {total} شاشة، مع مهلتها: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesOn':
    'قائمة محصورة على العودات السريعة للخمسة عشر يومًا — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesAucun':
    'لا عودة سريعة في الخمسة عشر يومًا',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesItem':
    '{ecran} · غادرت في {date} · عادت في {retour} · {n} يومًا',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesEcartes':
    'تُقصي {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesPlusRapide':
    'أقصر عودة هي « {ecran} »، عادت بعد {n} يومًا من غياب بدأ في {date}.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesPlusLent':
    'أطول عودة هي « {ecran} »، عادت بعد {n} يومًا من غياب بدأ في {date}.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesBoutsNone':
    'لا عودة سريعة بعد لهذه الشاشات: لا تُسمّى الأقصر ولا الأطول.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaine':
    'عودات بعد أكثر من خمسة عشر يومًا · {n}',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineHint':
    'لا تُبقِ في القائمة إلا العودات التي تجاوزت خمسة عشر يومًا — {n} من {total} شاشة غادرة —، تلك التي عادت بعد غياب خرج أصلاً من الخمسة عشر يومًا، مع تاريخيها ومهلتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineOffHint':
    'لا تُظهر القائمة إلا الشاشات التي عادت بعد غياب خرج أصلاً من الخمسة عشر يومًا — {n} من {total} شاشة، مع مهلتها: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineOn':
    'قائمة محصورة على العودات بعد أكثر من خمسة عشر يومًا — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineAucun':
    'لا عودة بعد غياب خرج من الخمسة عشر يومًا',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineItem':
    '{ecran} · غادرت في {date} · عادت في {retour} · {n} يومًا',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineEcartes':
    'تُقصي {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunis':
    'عودات سريعة ومتأخرة معًا · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisHint':
    'لا تُبقِ في القائمة إلا دفعتي الخمسة عشر يومًا مجتمعتين — {n} من {total} شاشة غادرة —، العودات السريعة والعودات المتأخرة في ضغطة واحدة، مع تاريخيها ومهلتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisOffHint':
    'تعرض القائمة العودات السريعة والمتأخرة للخمسة عشر يومًا مجتمعة — {n} من {total} شاشة، مع مهلتها: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisOn':
    'قائمة محصورة على دفعتي الخمسة عشر يومًا مجتمعتين — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisAucun':
    'لا عودة مؤرّخة في الخمسة عشر يومًا، والدفعتان فارغتان',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisItem':
    '{ecran} · غادرت في {date} · عادت في {retour} · {n} يومًا',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisEcartes':
    'تُقصي {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisPart':
    'الدفعتان المجتمعتان تشكّلان {n} عودة من {total} شاشة غادرة في الخمسة عشر يومًا، أي {pct} % من مغادرات هذه الخمسة عشر يومًا.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisPartNone':
    'لا شاشة غادرة في الخمسة عشر يومًا: حصة الدفعتين لا تُقسم بعد.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzainePlusRapide':
    'أسرع عودة في الدفعة هي « {ecran} »، عادت بعد {n} يومًا من غياب بدأ في {date}.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzainePlusLent':
    'أبطأ عودة هي « {ecran} »، عادت بعد {n} يومًا من غياب بدأ في {date}.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineBoutsNone':
    'لا عودة بعد لهذه الشاشات: لا تُسمّى الأسرع ولا الأبطأ.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzainePart':
    'هذه العودات تشكّل {n} من {total} عودة مؤرّخة في كل التاريخ، أي {pct} % من العودات المؤرّخة.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzainePartNone':
    'لا عودة مؤرّخة في التاريخ: حصة العودات بعد أكثر من خمسة عشر يومًا لا تُقسم بعد.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetour':
    'خمسة عشر يومًا بلا أي عودة · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourHint':
    'لا تُبقِ في القائمة إلا الشاشات التي غادرت في الخمسة عشر يومًا ولم تُعِدها أي عودة قط — {n} من {total} شاشة غادرة —، لا قبل ذلك الغياب ولا بعده، مع تاريخ غيابها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourOffHint':
    'لا تُظهر القائمة إلا الشاشات التي غادرت في الخمسة عشر يومًا بلا أي عودة إلى الدفتر — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourOn':
    'قائمة محصورة على الخمسة عشر يومًا بلا أي عودة — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourAucun':
    'لا شاشة غادرة في الخمسة عشر يومًا بلا عودة',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourItem':
    '{ecran} · غادرت في {date} · بلا أي عودة إلى الدفتر',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourEcartes':
    'تُقصي {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransJumeaux':
    'التوأمان — « بلا أي عودة مؤرّخة » يُبقي {a} شاشة، و« عودة مؤرّخة » يُبقي {b}',
  'ad.suivi.doorOublisEcransRetoursDatesPlusCourt':
    'أقصر مدة في هذه الحزمة « {ecran} »، عادت بعد {n} يومًا في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesPlusLong':
    'أطولها « {ecran} »، عادت بعد {n} يومًا في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesBoutsNone':
    'لا عودة مؤرّخة في هذه الحزمة: لا تُقرأ مدة قصيرة ولا طويلة.',
  'ad.suivi.doorOublisEcransAucunRetour': 'بلا أي عودة مؤرّخة · {n}',
  'ad.suivi.doorOublisEcransAucunRetourHint':
    'لا تُبقِ في القائمة إلا الشاشات التي لا يحمل تاريخها أي تاريخ عودة — {n} من {total} شاشة غادرة —، مع يوم آخر سحب لها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransAucunRetourOffHint':
    'لا تُظهر القائمة إلا الشاشات التي لا يحمل تاريخها أي تاريخ عودة — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransAucunRetourOn':
    'قائمة محصورة على الشاشات بلا أي تاريخ عودة — {n} من {total}',
  'ad.suivi.doorOublisEcransAucunRetourAucun': 'لا شاشة بلا تاريخ عودة',
  'ad.suivi.doorOublisEcransAucunRetourItem':
    '{ecran} · سُحبت في {date} · بلا أي تاريخ عودة',
  'ad.suivi.doorOublisEcransAucunRetourEcartes':
    'تُقصي {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransAucunRetourPlusAncien':
    'أقدم مغادرة في المجموعة هي « {ecran} »، غادرت في {date}: {n} يومًا مضت منذ ذلك الحين.',
  'ad.suivi.doorOublisEcransAucunRetourPlusAncienNone':
    'لا مغادرة في هذه المجموعة: لا يوم يُحسب.',
  'ad.suivi.doorOublisEcransRetoursDates': 'عودة مؤرّخة · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesHint':
    'لا تُبقِ في القائمة إلا الشاشات التي يحمل تاريخها تاريخ عودة واحدًا على الأقل — {n} من {total} شاشة غادرة —، مع يوم آخر سحب لها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesOffHint':
    'لا تعرض القائمة إلا الشاشات التي تحمل تاريخ عودة واحدًا على الأقل — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesOn':
    'قائمة محصورة على الشاشات التي تحمل تاريخ عودة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAucun': 'لا شاشة تحمل تاريخ عودة',
  'ad.suivi.doorOublisEcransRetoursDatesItem': '« {ecran} » — آخر سحب في {date}',
  'ad.suivi.doorOublisEcransRetoursDatesEcartes':
    'تُقصي {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesPlusAnciens':
    'لا يعرض الكشف إلا عودة واحدة لكل شاشة: يُقصي {n} عودة مؤرّخة أقدم، من أصل {total} عودة مؤرّخة لهذه الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesPlusAnciensNone':
    'يعرض الكشف كل عودة مؤرّخة لهذه الشاشات: لا عودة أقدم مُقصاة.',
  'ad.suivi.doorOublisEcransRetoursDatesSemaine': 'عودة مؤرّخة لهذا الأسبوع · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت هذا الأسبوع بتاريخ عودة — {n} من {total} شاشة غادرة —، مع يوم آخر سحب لها ويوم عودتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineOffHint':
    'لا تعرض القائمة إلا الشاشات التي عادت هذا الأسبوع بتاريخ عودة — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineOn':
    'قائمة مضيّقة على الشاشات التي عادت هذا الأسبوع بتاريخ عودة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineAucun':
    'لا شاشة عادت هذا الأسبوع بتاريخ عودة',
  'ad.suivi.doorOublisEcransRetoursDatesSemainePlusCourt':
    'أقصر مدة في هذه الحزمة « {ecran} »، عادت بعد {n} يومًا في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesSemainePlusLong':
    'أطولها « {ecran} »، عادت بعد {n} يومًا في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineBoutsNone':
    'لا عودة مؤرّخة في هذه الحزمة: لا تُقرأ مدة قصيرة ولا طويلة.',
  'ad.suivi.doorOublisEcransRetoursDatesMois': 'عودة مؤرّخة لهذا الشهر · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت هذا الشهر بتاريخ عودة — {n} من {total} شاشة غادرة —، مع يوم آخر سحب لها ويوم عودتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisOffHint':
    'لا تعرض القائمة إلا الشاشات التي عادت هذا الشهر بتاريخ عودة — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisOn':
    'قائمة مضيّقة على الشاشات التي عادت هذا الشهر بتاريخ عودة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisAucun':
    'لا شاشة عادت هذا الشهر بتاريخ عودة',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEcartes':
    'تُبعد {n} سطرًا من قائمة العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisPlusCourt':
    'أقصر أجل في المجموعة هو «{ecran}»، عاد في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisPlusLong':
    'وأطولها هو «{ecran}»، عاد في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisBoutsNone':
    'لا عودة مؤرّخة هذا الشهر: المجموعة لا تسمّي أحدًا.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernier':
    'عودة مؤرّخة الشهر الماضي · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت الشهر الماضي بتاريخ عودة — {n} من {total} شاشة غادرة، أي النافذة التي أُغلقت للتوّ —، مع يوم آخر سحب لها ويوم عودتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierOffHint':
    'لا تعرض القائمة إلا الشاشات التي عادت الشهر الماضي بتاريخ عودة — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierOn':
    'قائمة محصورة على الشاشات التي عادت الشهر الماضي بتاريخ عودة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierAucun':
    'لا شاشة عادت بتاريخ عودة الشهر الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierEcartes':
    'يُخرج {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierPlusCourt':
    'أقصر أجل في المجموعة هو «{ecran}»، عاد في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierPlusLong':
    'وأطولها هو «{ecran}»، عاد في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierBoutsNone':
    'لا عودة مؤرّخة الشهر الماضي: المجموعة لا تسمّي أحدًا.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMois':
    'عودة مؤرّخة الشهر قبل الماضي · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت الشهر قبل الماضي بتاريخ عودة — {n} من {total} شاشة غادرة، أي النافذة الثانية المغلقة —، مع يوم آخر سحب لها ويوم عودتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisOffHint':
    'لا تعرض القائمة إلا الشاشات التي عادت الشهر قبل الماضي بتاريخ عودة — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisOn':
    'قائمة محصورة على الشاشات التي عادت الشهر قبل الماضي بتاريخ عودة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisAucun':
    'لا شاشة عادت بتاريخ عودة الشهر قبل الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisEcartes':
    'يُخرج {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisPlusCourt':
    'أقصر مدة في الدفعة هي «{ecran}»، عادت في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisPlusLong':
    'أطولها «{ecran}»، عادت في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisBoutsNone':
    'هذه النافذة لا تحمل أي عودة مؤرّخة: الدفعة لا تسمّي الأقصر ولا الأطول.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetres':
    'نافذتان مغلقتان · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت في إحدى النافذتين المغلقتين — الشهر الماضي أو الشهر قبل الماضي — {n} من {total} شاشة غادرة —، مع نافذة كل واحدة ويوم آخر سحب لها ويوم عودتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresOffHint':
    'لا تعرض القائمة إلا الشاشات التي عادت في إحدى النافذتين المغلقتين — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresOn':
    'قائمة محصورة على النافذتين المغلقتين — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresAucun':
    'لا شاشة عادت بتاريخ عودة في هاتين النافذتين',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresEcartes':
    'يُخرج {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresRepartis':
    'الشهر الماضي: {a} شاشة · الشهر قبل الماضي: {b} شاشة — {n} في المجموع، ولا شاشة في الاثنين معًا.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresMoisDernier': 'الشهر الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresAvantDernier':
    'الشهر قبل الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestre': 'عودة مؤرّخة لهذا الربع · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت خلال الأشهر الثلاثة الأخيرة بتاريخ عودة — {n} من {total} شاشة غادرة —، مع يوم آخر سحب لها ويوم عودتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreOffHint':
    'لا تعرض القائمة إلا الشاشات التي عادت خلال الأشهر الثلاثة الأخيرة بتاريخ عودة — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreOn':
    'قائمة مضيّقة على الشاشات التي عادت خلال الأشهر الثلاثة الأخيرة بتاريخ عودة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreAucun':
    'لا شاشة عادت خلال الأشهر الثلاثة الأخيرة بتاريخ عودة',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreEcartes':
    'تُبعد {n} سطرًا من قائمة العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusCourt':
    'أقصر أجل في المجموعة هو «{ecran}»، عاد في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusLong':
    'وأطولها هو «{ecran}»، عاد في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreBoutsNone':
    'لا عودة مؤرّخة خلال الأشهر الثلاثة الأخيرة: المجموعة لا تسمّي أحدًا.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusRecent':
    'أحدث عودة في المجموعة هي «{ecran}»، عادت في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusRecentNone':
    'لا عودة مؤرّخة هذا الربع: المجموعة لا تسمّي أحدًا.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresBoutsMoisDernier':
    'الشهر الماضي — الأقصر « {court} » في {jc} يومًا، عاد في {dc}؛ الأطول « {long} » في {jl} يومًا، عاد في {dl}.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresBoutsAvantDernier':
    'الشهر قبل الماضي — الأقصر « {court} » في {jc} يومًا، عاد في {dc}؛ الأطول « {long} » في {jl} يومًا، عاد في {dl}.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresBoutsNone':
    'لا نافذة مغلقة تحمل عودة مؤرّخة: المجموعتان لا تسمّيان أحدًا.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFerme':
    'عودة مؤرّخة في الربع المغلق · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة خلال الأشهر الثلاثة التي تسبق الشهر الجاري — {n} من {total} شاشة غادرة —، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهر الجاري لا يدخل فيها. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeOffHint':
    'القائمة لا تُظهر إلا الشاشات التي عادت بتاريخ عودة خلال الأشهر الثلاثة المغلقة — {n} من {total} شاشة: {detail}. الشهر الجاري يبقى خارجها. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeOn':
    'القائمة مضغوطة على الربع المغلق — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAucun':
    'لا عودة مؤرّخة في الأشهر الثلاثة المغلقة',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermePlusRecent':
    'أحدث شاشة عادت في المجموعة هي «{ecran}»، عادت في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermePlusRecentNone':
    'لا شاشة في المجموعة تحمل تاريخ عودة: الربع المغلق لا يسمّي أحدًا.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernier':
    'الربع المغلق والشهر الماضي · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة في الربع المغلق أو الشهر الماضي — {n} من {total} شاشة غادرة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهر الماضي محسوب أصلًا داخل الربع المغلق، فلا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierOffHint':
    'القائمة لا تُظهر إلا شاشات الربع المغلق والشهر الماضي — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierOn':
    'القائمة مضغوطة على الربع المغلق والشهر الماضي — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierAucun':
    'لا عودة مؤرّخة في الربع المغلق ولا في الشهر الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierRepartis':
    'الربع المغلق: {a} شاشة · الشهر الماضي: {b} شاشة — {n} في المجموع، والشهر الماضي محسوب أصلًا داخل الربع المغلق.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtMois':
    'الشهر الماضي — أقصر أجل: «{ecran}»، عاد في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtTrimestre':
    'الربع المغلق — أقصر أجل: «{ecran}»، عاد في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtMoisNone':
    'الشهر الماضي — لا عودة مؤرّخة: لا يُسمّى أقصر أجل.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtTrimestreNone':
    'الربع المغلق — لا عودة مؤرّخة: لا يُسمّى أقصر أجل.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtNone':
    'لا عودة مؤرّخة في النافذتين: لا يُسمّى أقصر أجل.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierFenetreMois':
    'الشهر الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierFenetreTrimestre':
    'الربع المغلق',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermee':
    'عودة مؤرّخة خلال السنة المغلقة · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت خلال الاثني عشر شهرًا التي تسبق الشهر الجاري بتاريخ عودة — {n} من {total} شاشة غادرة —، مع يوم آخر سحب لها ويوم عودتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeOffHint':
    'لا تعرض القائمة إلا الشاشات التي عادت خلال الاثني عشر شهرًا المغلقة بتاريخ عودة — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeOn':
    'قائمة مضيّقة على الشاشات التي عادت خلال الاثني عشر شهرًا المغلقة بتاريخ عودة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAucun':
    'لا شاشة عادت بتاريخ عودة خلال الاثني عشر شهرًا المغلقة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeEcartes':
    'تُبعد {n} سطرًا من قائمة العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeePlusCourt':
    'الأقصر في الدفعة: « {ecran} »، عادت في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeePlusLong':
    'الأطول: « {ecran} »، عادت في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeBoutsNone':
    'لا عودة مؤرّخة خلال الاثني عشر شهرًا المغلقة: طرفا الدفعة لا يُسمّيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFerme':
    'السنة المغلقة والربع المغلق · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة خلال السنة المغلقة أو الربع المغلق — {n} من {total} شاشة غادرة —، كل واحدة بفترتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الربع المغلق محسوب أصلًا في السنة المغلقة: لا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeOffHint':
    'لا تعرض القائمة إلا شاشات السنة المغلقة والربع المغلق — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeOn':
    'قائمة مضيّقة على السنة المغلقة والربع المغلق — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeAucun':
    'لا عودة مؤرّخة خلال السنة المغلقة ولا الربع المغلق',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeEcartes':
    'تُبعد {n} سطرًا من قائمة العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRepartis':
    'السنة المغلقة: {a} شاشة · الربع المغلق: {b} شاشة — {n} في المجموع، الربع المغلق محسوب أصلًا في السنة المغلقة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeFenetreAnnee':
    'السنة المغلقة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeFenetreTrimestre':
    'الربع المغلق',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsMois':
    'الربع المغلق — آخر شاشة عادت: « {ecran} » بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsMoisNone':
    'الربع المغلق — لا شاشة عادت بتاريخ عودة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsAnnee':
    'السنة المغلقة — آخر شاشة عادت: « {ecran} » بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsAnneeNone':
    'السنة المغلقة — لا شاشة عادت بتاريخ عودة.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermes':
    'عودة مؤرّخة خلال آخر شهرين مغلقين · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة خلال الشهر المغلق قبل الأخير أو السنة المغلقة — {n} من {total} شاشة غادرة —، كل واحدة بفترتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهر قبل الأخير محسوب أصلًا في السنة المغلقة: لا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesOffHint':
    'لا تعرض القائمة إلا شاشات الشهر المغلق قبل الأخير والسنة المغلقة — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesOn':
    'قائمة مضيّقة على الشهر المغلق قبل الأخير والسنة المغلقة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesAucun':
    'لا عودة مؤرّخة خلال الشهر المغلق قبل الأخير ولا السنة المغلقة',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesEcartes':
    'تُبعد {n} سطرًا من قائمة العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesRepartis':
    'السنة المغلقة: {a} شاشة · الشهر قبل الأخير: {b} شاشة — {n} في المجموع، الشهر قبل الأخير محسوب أصلًا في السنة المغلقة.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesFenetreMois':
    'الشهر قبل الأخير',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesFenetreAnnee':
    'السنة المغلقة',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtMois':
    'الشهر قبل الأخير — الأقصر « {ecran} »، عاد في {n} يومًا في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtMoisNone':
    'الشهر قبل الأخير — لا عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtAnnee':
    'السنة المغلقة — الأقصر « {ecran} »، عاد في {n} يومًا في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtAnneeNone':
    'السنة المغلقة — لا عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtNone':
    'لا نافذة من الاثنتين تحمل عودة مؤرّخة: المجموعتان لا تسمّيان أحدًا.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernier':
    'عودة مؤرّخة خلال الشهر قبل الأخير والشهر الماضي · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة خلال الشهر قبل الأخير أو الشهر الماضي — {n} من {total} شاشة غادرة —، كل واحدة بفترتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهران لا يتداخلان: لا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierOffHint':
    'لا تعرض القائمة إلا شاشات الشهر قبل الأخير والشهر الماضي — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierOn':
    'قائمة مضيّقة على الشهر قبل الأخير والشهر الماضي — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierAucun':
    'لا عودة مؤرّخة خلال الشهر قبل الأخير ولا الشهر الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierEcartes':
    'تُبعد {n} سطرًا من قائمة العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRepartis':
    'الشهر الماضي: {a} شاشة · الشهر قبل الأخير: {b} شاشة — {n} في المجموع، ولا شاشة في الشهرين معًا.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierFenetreMoisDernier':
    'الشهر الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierFenetreAvantDernier':
    'الشهر قبل الأخير',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsMoisDernier':
    'الشهر الماضي — آخر شاشة عادت: « {ecran} » بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsMoisDernierNone':
    'الشهر الماضي — لا شاشة عادت بتاريخ عودة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsAvantDernier':
    'الشهر قبل الأخير — آخر شاشة عادت: « {ecran} » بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsAvantDernierNone':
    'الشهر قبل الأخير — لا شاشة عادت بتاريخ عودة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFerme':
    'الشهر الماضي والربع المغلق · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة خلال الشهر الماضي أو الربع المغلق — {n} من {total} شاشة غادرة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهر الماضي محسوب أصلًا داخل الربع المغلق، فلا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeOffHint':
    'القائمة لا تُظهر إلا شاشات الشهر الماضي والربع المغلق — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeOn':
    'القائمة مضغوطة على الشهر الماضي والربع المغلق — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeAucun':
    'لا عودة مؤرّخة خلال الشهر الماضي ولا الربع المغلق',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeRepartis':
    'الشهر الماضي: {a} شاشة · الربع المغلق: {b} شاشة — {n} في المجموع، والشهر الماضي محسوب أصلًا داخل الربع المغلق.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeFenetreMoisDernier':
    'الشهر الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeFenetreTrimestre':
    'الربع المغلق',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtMois':
    'الشهر الماضي — الأقصر: «{ecran}»، عادت في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtMoisNone':
    'الشهر الماضي — الأقصر: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtTrimestre':
    'الربع المغلق — الأقصر: «{ecran}»، عادت في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtTrimestreNone':
    'الربع المغلق — الأقصر: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtNone':
    'الأقصر في كل نافذة: لا عودة مؤرّخة خلال الشهر الماضي ولا الربع المغلق.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFerme':
    'الشهر قبل الماضي والربع المغلق · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة خلال الشهر قبل الماضي أو الربع المغلق — {n} من {total} شاشة غادرة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهر قبل الماضي محسوب أصلًا داخل الربع المغلق، فلا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeOffHint':
    'القائمة لا تُظهر إلا شاشات الشهر قبل الماضي والربع المغلق — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeOn':
    'القائمة مضغوطة على الشهر قبل الماضي والربع المغلق — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeAucun':
    'لا عودة مؤرّخة خلال الشهر قبل الماضي ولا الربع المغلق',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeRepartis':
    'الشهر قبل الماضي: {a} شاشة · الربع المغلق: {b} شاشة — {n} في المجموع، والشهر قبل الماضي محسوب أصلًا داخل الربع المغلق.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeFenetreAvantDernier':
    'الشهر قبل الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeFenetreTrimestre':
    'الربع المغلق',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtAvantDernier':
    'الشهر قبل الماضي — الأقصر: «{ecran}»، عادت في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtAvantDernierNone':
    'الشهر قبل الماضي — الأقصر: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtTrimestre':
    'الربع المغلق — الأقصر: «{ecran}»، عادت في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtTrimestreNone':
    'الربع المغلق — الأقصر: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtNone':
    'الأقصر في كل نافذة: لا عودة مؤرّخة خلال الشهر قبل الماضي ولا الربع المغلق.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeTrimestre':
    'الربع المغلق — وسط المجموعة: {n} يومًا على {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeTrimestreNone':
    'الربع المغلق — وسط المجموعة: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeAvantDernier':
    'الشهر قبل الماضي — وسط المجموعة: {n} يومًا على {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeAvantDernierNone':
    'الشهر قبل الماضي — وسط المجموعة: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeNone':
    'وسط مجموعة كل نافذة: لا عودة مؤرّخة خلال الربع المغلق ولا الشهر قبل الماضي.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFerme':
    'الربع المغلق والسنة المغلقة · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة خلال الربع المغلق أو السنة المغلقة — {n} من {total} شاشة غادرة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الربع المغلق محسوب أصلًا داخل السنة المغلقة، فلا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeOffHint':
    'القائمة لا تُظهر إلا شاشات الربع المغلق والسنة المغلقة — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeOn':
    'القائمة مضغوطة على الربع المغلق والسنة المغلقة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeAucun':
    'لا عودة مؤرّخة خلال الربع المغلق ولا السنة المغلقة',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeRepartis':
    'الربع المغلق: {a} شاشة · السنة المغلقة: {b} شاشة — {n} في المجموع، والربع المغلق محسوب أصلًا داخل السنة المغلقة.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeFenetreTrimestre':
    'الربع المغلق',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeFenetreAnnee':
    'السنة المغلقة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernier':
    'السنة المغلقة والشهر الماضي · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة خلال السنة المغلقة أو الشهر الماضي — {n} من {total} شاشة غادرة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهر الماضي محسوب أصلًا داخل السنة المغلقة، فلا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierOffHint':
    'القائمة لا تُظهر إلا شاشات السنة المغلقة والشهر الماضي — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierOn':
    'القائمة مضغوطة على السنة المغلقة والشهر الماضي — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierAucun':
    'لا عودة مؤرّخة خلال السنة المغلقة ولا الشهر الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierRepartis':
    'الشهر الماضي: {a} شاشة · السنة المغلقة: {b} شاشة — {n} في المجموع، والشهر الماضي محسوب أصلًا داخل السنة المغلقة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierFenetreMoisDernier':
    'الشهر الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierFenetreAnnee':
    'السنة المغلقة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourt':
    'النافذة الأسرع عودة هي {fenetre} — الشهر الماضي: {a} يومًا · السنة المغلقة: {b} يومًا، جنبًا إلى جنب.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtTie':
    'النافذتان تعودان بالوتيرة نفسها — الشهر الماضي: {a} يومًا · السنة المغلقة: {b} يومًا، جنبًا إلى جنب.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtOne':
    'نافذة واحدة فقط لها عودة مؤرّخة — {fenetre}: {n} يومًا؛ والأخرى بلا عودة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtNone':
    'لا نافذة من الاثنتين لها عودة مؤرّخة: الأسرع لا يُسمّى بعد.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeTrimestre':
    'الربع المغلق — وسط المجموعة: {n} يومًا على {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeTrimestreNone':
    'الربع المغلق — وسط المجموعة: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeAnnee':
    'السنة المغلقة — وسط المجموعة: {n} يومًا على {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeAnneeNone':
    'السنة المغلقة — وسط المجموعة: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeNone':
    'وسط مجموعة كل نافذة: لا عودة مؤرّخة خلال الربع المغلق ولا السنة المغلقة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCours':
    'السنة المغلقة والشهر الجاري · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة خلال السنة المغلقة أو الشهر الجاري — {n} من {total} شاشة غادرة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. النافذتان لا تتداخلان: لا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursOffHint':
    'القائمة لا تُظهر إلا شاشات السنة المغلقة والشهر الجاري — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursOn':
    'القائمة مضغوطة على السنة المغلقة والشهر الجاري — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursAucun':
    'لا عودة مؤرّخة خلال السنة المغلقة ولا الشهر الجاري',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRepartis':
    'الشهر الجاري: {a} شاشة · السنة المغلقة: {b} شاشة — {n} في المجموع، والنافذتان لا تتداخلان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursFenetreMoisEnCours':
    'الشهر الجاري',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursFenetreAnnee':
    'السنة المغلقة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsMoisEnCours':
    'الشهر الجاري — الأحدث « {ecran} »، عادت في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsMoisEnCoursNone':
    'الشهر الجاري — لا عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsAnnee':
    'السنة المغلقة — الأحدث « {ecran} »، عادت في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsAnneeNone':
    'السنة المغلقة — لا عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernier':
    'الشهر الجاري والشهر الماضي · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة هذا الشهر أو الشهر الماضي — {n} من {total} شاشة غادرة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهران لا يتداخلان: لا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierOffHint':
    'القائمة لا تُظهر إلا شاشات الشهر الجاري والشهر الماضي — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierOn':
    'القائمة مضغوطة على الشهر الجاري والشهر الماضي — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierAucun':
    'لا عودة مؤرّخة هذا الشهر ولا الشهر الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierRepartis':
    'الشهر الجاري: {a} شاشة · الشهر الماضي: {b} شاشة — {n} في المجموع، والشهران لا يتداخلان.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisEnCours':
    'الشهر الجاري — وسط المجموعة: {n} يومًا على {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisEnCoursNone':
    'الشهر الجاري — وسط المجموعة: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisDernier':
    'الشهر الماضي — وسط المجموعة: {n} يومًا على {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisDernierNone':
    'الشهر الماضي — وسط المجموعة: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeNone':
    'وسط مجموعة كل شهر: لا عودة مؤرّخة خلال الشهر الجاري ولا الشهر الماضي.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCours':
    'الشهر قبل الماضي والشهر الجاري · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة الشهر قبل الماضي أو هذا الشهر — {n} من {total} شاشة غادرة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهران لا يتداخلان: لا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursOffHint':
    'القائمة لا تُظهر إلا شاشات الشهر قبل الماضي والشهر الجاري — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursOn':
    'القائمة مضغوطة على الشهر قبل الماضي والشهر الجاري — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursAucun':
    'لا عودة مؤرّخة الشهر قبل الماضي ولا هذا الشهر',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursRepartis':
    'الشهر قبل الماضي: {a} شاشة · الشهر الجاري: {b} شاشة — {n} في المجموع، والشهران لا يتداخلان.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursFenetreAvantDernier':
    'الشهر قبل الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursFenetreMoisEnCours':
    'الشهر الجاري',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeNone':
    'الشهر قبل الماضي والشهر الجاري — وسط المجموعة: لا عودة مؤرّخة في أيّ من النافذتين.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeAvantDernier':
    'الشهر قبل الماضي — وسط المجموعة: {n} يومًا على {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeAvantDernierNone':
    'الشهر قبل الماضي — وسط المجموعة: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeMoisEnCours':
    'الشهر الجاري — وسط المجموعة: {n} يومًا على {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeMoisEnCoursNone':
    'الشهر الجاري — وسط المجموعة: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestre':
    'الشهر الماضي والربع الجاري · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة الشهر الماضي أو خلال الربع الجاري — {n} من {total} شاشة غادرة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهر الماضي محسوب أصلًا في الربع: لا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreOffHint':
    'القائمة لا تُظهر إلا شاشات الشهر الماضي والربع الجاري — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreOn':
    'القائمة مضغوطة على الشهر الماضي والربع الجاري — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreAucun':
    'لا عودة مؤرّخة الشهر الماضي ولا خلال الربع الجاري',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreRepartis':
    'الشهر الماضي: {a} شاشة · الربع الجاري: {b} شاشة — {n} في المجموع، والشهر الماضي محسوب في الربع.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFenetreMoisDernier':
    'الشهر الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFenetreTrimestre':
    'الربع الجاري',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeNone':
    'الشهر الماضي والربع الجاري — وسط المجموعة: لا عودة مؤرّخة في أيّ من النافذتين.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeMoisDernier':
    'الشهر الماضي — وسط المجموعة: {n} يومًا على {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeMoisDernierNone':
    'الشهر الماضي — وسط المجموعة: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeTrimestre':
    'الربع الجاري — وسط المجموعة: {n} يومًا على {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeTrimestreNone':
    'الربع الجاري — وسط المجموعة: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestre':
    'السنة المغلقة والربع الجاري · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة خلال السنة المغلقة أو الربع الجاري — {n} من {total} شاشة غادرة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهر الماضي والشهر قبل الماضي محسوبان في النافذتين، فلا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreOffHint':
    'القائمة لا تُظهر إلا شاشات السنة المغلقة والربع الجاري — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreOn':
    'القائمة مضغوطة على السنة المغلقة والربع الجاري — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreAucun':
    'لا عودة مؤرّخة خلال السنة المغلقة ولا الربع الجاري',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreRepartis':
    'السنة المغلقة: {a} شاشة · الربع الجاري: {b} شاشة — {n} في المجموع، والشاشة المذكورة في السنة لا تعود مرتين.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFenetreAnnee':
    'السنة المغلقة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFenetreTrimestre':
    'الربع الجاري',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeNone':
    'السنة المغلقة والربع الجاري — وسط المجموعة: لا عودة مؤرّخة في أيّ من النافذتين.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeAnnee':
    'السنة المغلقة — وسط المجموعة: {n} يومًا على {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeAnneeNone':
    'السنة المغلقة — وسط المجموعة: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeTrimestre':
    'الربع الجاري — وسط المجموعة: {n} يومًا على {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeTrimestreNone':
    'الربع الجاري — وسط المجموعة: لا عودة مؤرّخة في هذه النافذة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtAnnee':
    'أقصر وسط هو وسط السنة المغلقة: {n} يومًا — وهي التي تعيد أسرع.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtTrimestre':
    'أقصر وسط هو وسط الربع الجاري: {n} يومًا — وهو الذي يعيد أسرع.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtEgal':
    'للنافذتين الوسط نفسه: {n} يومًا في كل منهما — لا واحدة تحسم.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeule':
    'السنة المغلقة وحدها · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleHint':
    'لا تُبقِ في القائمة إلا الشاشات التي تسمّيها السنة المغلقة ولا تسمّيها أي شارة أخرى من السلسلة — {n} من {total} شاشة غادرة —، مع يوم آخر سحب لها ويوم عودتها: {detail}. لا الشهر الجاري ولا الشهر الماضي ولا الشهر قبل الماضي ولا الربع المغلق ولا الأسبوع يسمّيها: هذا ما تضيفه السنة وحدها. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleOffHint':
    'القائمة لا تُظهر إلا الشاشات التي تسمّيها السنة المغلقة وحدها — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleOn':
    'القائمة مضغوطة على ما تضيفه السنة المغلقة وحدها — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleAucun':
    'لا شاشة تسمّيها السنة المغلقة وحدها',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleItem':
    '{ecran} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleRepartis':
    'السنة المغلقة: {a} شاشة مسمّاة، ولا شارة أخرى من السلسلة تحتفظ بها — {n} في المجموع، وهذا ما تضيفه السنة وحدها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleMediane':
    'السنة المغلقة وحدها — وسط المجموعة: {n} يومًا لـ {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleMedianeNone':
    'السنة المغلقة وحدها — لا عودة مؤرّخة، ووسط المجموعة لا يُقرأ.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeule':
    'الربع الجاري وحده · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleHint':
    'لا تُبقِ في القائمة إلا الشاشات التي يسمّيها الربع الجاري ولا تسمّيها السنة المغلقة — {n} من {total} شاشة غادرة —، مع يوم آخر سحب لها ويوم عودتها: {detail}. لا السنة المغلقة ولا ربعها المغلق يحتفظان بها: هذا ما يضيفه الربع وحده، ليُقارن بما تضيفه السنة وحدها. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleOffHint':
    'القائمة لا تُظهر إلا ما يضيفه الربع الجاري وحده إلى جانب السنة المغلقة — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleOn':
    'القائمة مضغوطة على ما يضيفه الربع الجاري وحده — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleAucun':
    'لا شاشة يسمّيها الربع الجاري وحده',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleItem':
    '{ecran} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleRepartis':
    'الربع الجاري: {a} شاشة مسمّاة، والسنة المغلقة لا تحتفظ بها — {n} في المجموع، وهذا ما يضيفه الربع وحده.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleMediane':
    'الربع الجاري وحده — وسط المجموعة: {n} يومًا لـ {k} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleMedianeNone':
    'الربع الجاري وحده — لا عودة مؤرّخة، ووسط المجموعة لا يُقرأ.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtAnnee':
    'وسط المجموعة الأقصر هو وسط السنة المغلقة وحدها: {n} يومًا — وهي الأسرع إلى العودة.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtTrimestre':
    'وسط المجموعة الأقصر هو وسط الربع الجاري وحده: {n} يومًا — وهو الأسرع إلى العودة.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtEgal':
    'الوسطان متساويان: {n} يومًا في كل منهما — لا أحدهما أسرع من الآخر.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeule':
    'السنة المغلقة والربع الجاري وحدهما · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleHint':
    'لا تُبقِ في القائمة إلا الإضافتين جنبًا إلى جنب: الشاشات التي تسمّيها السنة المغلقة وحدها — {a} —، ثم الشاشات التي يضيفها الربع الجاري وحده — {b} —، وكلٌّ منهما يحمل الشاشة التي تحتفظ به، أي {n} من {total} شاشة غادرة: {detail}. القائمة مأخوذة من الشارتين، فلا تضيع شاشة ولا تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleOffHint':
    'القائمة تُظهر الإضافتين جنبًا إلى جنب — السنة المغلقة وحدها، ثم الربع الجاري وحده —، {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleOn':
    'القائمة مضغوطة على الإضافتين جنبًا إلى جنب — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleAucun':
    'لا السنة المغلقة ولا الربع الجاري يضيف شاشة وحده',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleRepartis':
    'السنة المغلقة وحدها: {a} شاشة، {pa} % من الدفتر · الربع الجاري وحده: {b} شاشة، {pb} % من الدفتر — {n} في المجموع، {pn} % من الدفتر، وهما الإضافتان جنبًا إلى جنب.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleFenetreAnnee':
    'السنة المغلقة وحدها',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleFenetreTrimestre':
    'الربع الجاري وحده',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse':
    'الإضافتان فوق الوسط المجموع · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseHint':
    'لا تُبقِ في القائمة، من الإضافتين المجموعتين، إلا الشاشات التي يتجاوز تأخيرها وسط المجموعة المضافة — {n} من {total} شاشة غادرة —، وكل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها وتأخيرها: {detail}. الوسط مأخوذ من الإضافتين المجموعتين، فلا يمكن للقسمة أن تناقض القائمة التي تفصلها؛ والمجموعة الفارغة لا تُقسم. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseOffHint':
    'القائمة لا تُظهر، من الإضافتين، إلا الشاشات الأبطأ من وسط المجموعة المضافة — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseOn':
    'القائمة مضغوطة على الإضافتين فوق الوسط المجموع — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseAucun':
    'لا إضافة من الإضافتين تتجاوز وسط المجموعة المضافة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour} · {jours} يومًا فوق الوسط',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepassePlusRapide':
    'أسرع عودة في المجموعة هي « {ecran} »، عاد في {n} يومًا بعد مغادرة في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepassePlusLent':
    'الأبطأ هو « {ecran} »، عاد في {n} يومًا بعد مغادرة في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseBoutsNone':
    'لا شاشة من هذه الشاشات لها عودة مؤرّخة بعد: لا الأسرع ولا الأبطأ يُسمّى هنا.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine':
    'فوق الوسط المجموع، عادت هذا الأسبوع · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineHint':
    'لا تُبقِ، من الشاشات فوق وسط المجموعة المضافة، إلا التي تقع عودتها في الأسبوع الجاري — {n} من {total} شاشة غادرة —، وكل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها وتأخيرها: {detail}. القائمة مأخوذة من قائمة شارة «فوق الوسط المجموع»، فلا يمكن أن تناقضها: وهكذا تقول النافذة الأقرب ما تُبقيه من المجموعة. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineOffHint':
    'القائمة لا تُظهر، من الشاشات فوق الوسط المجموع، إلا التي عادت هذا الأسبوع — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineOn':
    'القائمة مضغوطة على الشاشات فوق الوسط المجموع التي عادت هذا الأسبوع — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineAucun':
    'لا شاشة فوق الوسط المجموع عادت هذا الأسبوع',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemainePlusRecent':
    'آخر شاشة عادت في هذه المجموعة هي «{ecran}»، عادت في {date} — بعد {n} يومًا من غيابها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemainePlusRecentNone':
    'لم تعد أي شاشة من المجموعة هذا الأسبوع: لا عودة حديثة تُسمّى.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis':
    'الأسبوع والمجموعة المجتمعة · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisHint':
    'لا تُبقِ في القائمة إلا شاشات المجموعة التي تجاوزت منتصف المجموعة المجتمعة وعادت هذا الأسبوع، ثم بقية تلك المجموعة — {n} من {total} شاشة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. منتصف الأسبوع موضوع إلى جانب منتصف المجموعة المجتمعة، فيُحكم على الأسبوع بكلمة. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisOffHint':
    'القائمة تعرض الأسبوع وبقية المجموعة المجتمعة — {n} من {total} شاشة: {detail}. الضغط يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisOn':
    'القائمة مضغوطة على الأسبوع والمجموعة المجتمعة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisAucun':
    'لا شاشة تُقارن بعد',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour} · {jours} يومًا',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisFenetreSemaine':
    'الأسبوع الجاري',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMediane':
    'الأسبوع يعيد أسرع: {n} يومًا في منتصف مجموعته من {k} عودة مؤرّخة، مقابل {m} يومًا للمجموعة المجتمعة ({j} عودة).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeLot':
    'المجموعة المجتمعة تعيد أسرع: {m} يومًا في منتصف مجموعتها من {j} عودة مؤرّخة، مقابل {n} يومًا للأسبوع ({k} عودة).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeEgal':
    'الأسبوع والمجموعة المجتمعة متساويان: {n} يومًا من الجانبين، على {k} عودة مؤرّخة للأسبوع و{j} للمجموعة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeSemaineVide':
    'الأسبوع لا يحتفظ بأي شاشة تتجاوز منتصف المجموعة المجتمعة: المجموعة تعيد في {m} يومًا، على {j} عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeNone':
    'لا الأسبوع ولا المجموعة المجتمعة تحمل عودة مؤرّخة: لا شيء يُقارن بعد.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisPlusLent':
    'أبطأ شاشة في الأسبوع هي «{ecran}»، عادت في {n} يومًا بتاريخ {date} — وهي التي تُمسك المجموعة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisPlusLentNone':
    'لا شاشة في الأسبوع عادت فوق منتصف المجموعة المجتمعة: لا شيء يُسمّى.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide':
    'الأسبوع أسرع من منتصف المجموعة · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideHint':
    'لا يُبقي، من الشاشات فوق منتصف المجموعة المجتمعة التي عادت هذا الأسبوع، إلا تلك التي أجلها أقصر من منتصف المجموعة المجتمعة — {n} من {total} شاشة —، لكل منها نافذتها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. مرجع المنتصف هو منتصف المجموعة المجتمعة، فلا يمكن أن يخالفه. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideOffHint':
    'الطي لا يُظهر إلا شاشات الأسبوع التي عادت أسرع من منتصف المجموعة المجتمعة — {n} من {total} شاشة: {detail}. ضغطة واحدة تُعيد كل الشاشات، دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideOn':
    'الطي مضغوط على الأسبوع الأسرع من منتصف المجموعة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideAucun':
    'لا شاشة في الأسبوع تعود أسرع من منتصف المجموعة المجتمعة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapidePlusRapide':
    'أسرع شاشة في الأسبوع هي «{ecran}»، عادت في {n} يومًا بتاريخ {date} — وهي التي تسبق منتصف المجموعة المجتمعة بأكبر فارق.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapidePlusRapideNone':
    'لا شاشة في الأسبوع تسبق منتصف المجموعة المجتمعة: لا شيء يُسمّى.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis':
    'الأسبوع السريع وبقية المجموعة المجتمعة · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisHint':
    'يجمع في الطي شاشات الأسبوع التي عادت أسرع من منتصف المجموعة المجتمعة وبقية تلك المجموعة — {n} من {total} شاشة غادرة —، الأسرع أولًا ثم الباقي، لكل واحدة نافذتها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. ولا شاشة تُحسب مرتين، وشارة الأسبوع السريع تحتفظ بالمجموعة نفسها. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisOffHint':
    'الطي لا يُظهر إلا الأسبوع السريع وبقية المجموعة المجتمعة — {n} من {total} شاشة: {detail}. ضغطة واحدة تُعيد كل الشاشات، دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisOn':
    'الطي مضغوط على الأسبوع السريع وبقية المجموعة المجتمعة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisAucun':
    'لا شاشة في الأسبوع السريع ولا في المجموعة المجتمعة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisFenetreSemaineRapide':
    'أسبوع سريع',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisPlusRecent':
    'آخر شاشة عادت في المجموعة هي «{ecran}»، عادت في {date} — بعد {n} يومًا من مغادرتها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisPlusRecentNone':
    'لا شاشة في المجموعة تحمل تاريخ عودة بعد: الشارة لا تسمّي أحدًا.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste':
    'بقية المجموعة المجتمعة · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteHint':
    'لا يُبقي في الطي إلا شاشات المجموعة المجتمعة التي لا يسمّيها الأسبوع السريع — {n} من {total} شاشة غادرة —، لكل واحدة نافذتها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. ولا شاشة تُحسب مرتين، وشارة الأسبوع السريع تحتفظ بالمجموعة نفسها. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteOffHint':
    'الطي لا يُظهر إلا بقية المجموعة المجتمعة، بعد قراءة الأسبوع السريع — {n} من {total} شاشة: {detail}. ضغطة واحدة تُعيد كل الشاشات، دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteOn':
    'الطي مضغوط على بقية المجموعة المجتمعة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAucun':
    'لا شاشة تبقى من المجموعة المجتمعة بعد الأسبوع السريع',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusAncien':
    'أقدم شاشة عادت في المجموعة هي «{ecran}»، عادت في {date} — بعد {n} يومًا من مغادرتها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusAncienNone':
    'لا شاشة في المجموعة تحمل تاريخ عودة بعد: الشارة لا تسمّي أحدًا.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu':
    'البقية قبل المنتصف المجتمعة · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuHint':
    'لا يُبقي، من شاشات بقية المجموعة المجتمعة، إلا تلك التي عادت قبل منتصف المجموعة المجتمعة — {n} من {total} شاشة غادرة —، لكل واحدة نافذتها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. مرجع المنتصف هو منتصف المجموعة المجتمعة، فلا يمكن أن يخالفه، وقائمته مأخوذة من قائمة البقية. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuOffHint':
    'الطي لا يُظهر إلا شاشات البقية التي عادت قبل منتصف المجموعة المجتمعة — {n} من {total} شاشة: {detail}. ضغطة واحدة تُعيد كل الشاشات، دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuOn':
    'الطي مضغوط على البقية التي عادت قبل منتصف المجموعة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuAucun':
    'لا شاشة من البقية تعود قبل منتصف المجموعة المجتمعة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuPlusRapide':
    'أسرع شاشة في البقية هي «{ecran}»، عادت في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuPlusRapideNone':
    'لا شاشة في البقية لتُسمّى — المجموعة فارغة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis':
    'البقية المجتمعة · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisHint':
    'جمع قسمي بقية المجموعة المجتمعة — الشاشات التي عادت قبل المنتصف، ثم التي تجاوزته — لقراءتهما بنظرة واحدة: {n} من {total} شاشة غادرة، لكل واحدة نافذتها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. القسمان مأخوذان من القائمة نفسها للبقية، فلا تثقل شاشة مرتين ولا يناقض أحدهما الآخر. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisOffHint':
    'الطي يعرض قسمي البقية مجتمعين — {n} من {total} شاشة: {detail}. ضغطة واحدة تُعيد كل الشاشات، دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisOn':
    'الطي مضغوط على البقية المجتمعة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisAucun':
    'لا شاشة في البقية لتُجمع — المجموعة فارغة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisFenetreAvant':
    'البقية قبل المنتصف',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisFenetreApres':
    'البقية بعد المنتصف',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour} · {jours} يومًا',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusLent':
    'أبطأ شاشة في البقية هي «{ecran}»، عادت في {date} — بعد {n} يومًا من مغادرتها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusLentNone':
    'لا شاشة في البقية تحمل تاريخ عودة بعد: الشارة لا تسمّي أحدًا.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu':
    'البقية بعد المنتصف المجتمعة · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuHint':
    'لا يُبقي، من شاشات بقية المجموعة المجتمعة، إلا تلك التي عادت بعد منتصف المجموعة المجتمعة — {n} من {total} شاشة غادرة —، لكل واحدة نافذتها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. القائمة مأخوذة من قائمة البقية، وقسمها المقابل — البقية قبل المنتصف — موضوع إلى جانبها، فلا تضيع شاشة ولا يناقض أحدهما الآخر. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuOffHint':
    'الطي لا يُظهر إلا شاشات البقية التي عادت بعد منتصف المجموعة المجتمعة — {n} من {total} شاشة: {detail}. ضغطة واحدة تُعيد كل الشاشات، دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuOn':
    'الطي مضغوط على البقية التي عادت بعد منتصف المجموعة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuAucun':
    'لا شاشة من البقية تعود بعد منتصف المجموعة المجتمعة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuPlusLent':
    'أبطأ شاشة في البقية بعد المنتصف هي «{ecran}»، عادت في {date} — بعد {n} يومًا من مغادرتها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis':
    'البقية قبل المنتصف وعنده وبعده · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisHint':
    'يجمع في الطي الأجزاء الثلاثة لبقية المجموعة المجتمعة — ما يسبق المنتصف، وما يقع عليه، ثم ما يتجاوزه —، {n} من {total} شاشة غادرة، لكل واحدة نافذتها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. ولا شاشة تُحسب مرتين. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisOffHint':
    'يعرض الطي الأجزاء الثلاثة للبقية — {n} من {total} شاشة غادرة: {detail}. ضغطة تُعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisOn':
    'الطي مضيّق على الأجزاء الثلاثة للبقية — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisAucun':
    'لا شاشة في البقية لتُجمع — بقية المجموعة فارغة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisFenetreMilieu':
    'البقية عند منتصف المجموعة المجتمعة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisMediane':
    'منتصف المجموعة المجتمعة عند {m} يومًا: {a} شاشة قبله، {b} عنده، {c} بعده.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisMedianeNone':
    'المجموعة المجتمعة بلا منتصف: الأجزاء الثلاثة لا تنقسم.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisPlusRecent':
    'الشاشة العائدة عند منتصف المجموعة بالضبط هي «{ecran}»، عادت في {date} — بعد {n} يومًا من مغادرتها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisPlusRecentNone':
    'لا شاشة من البقية تقع على المنتصف بالضبط: لا يُسمّى أحد.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul':
    'البقية عند المنتصف بالضبط · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHint':
    'لا يُبقي في الطي إلا الشاشات التي عادت من البقية عند منتصف المجموعة المجتمعة بالضبط — {n} من {total} شاشة غادرة —، لكل واحدة نافذتها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulOffHint':
    'لا يعرض الطي إلا شاشات البقية العائدة عند المنتصف بالضبط — {n} من {total} شاشة: {detail}. ضغطة تُعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulOn':
    'الطي مقتصر على منتصف البقية بالضبط — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulAucun':
    'لا شاشة من البقية تقع على منتصف المجموعة المجتمعة بالضبط',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPlusLent':
    'أبطأ شاشة عند المنتصف بالضبط هي «{ecran}»، عادت في {date} — بعد {n} يومًا من مغادرتها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPlusLentNone':
    'لا شاشة عند المنتصف بالضبط لتُسمّى — لا أحد يقع عليه',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPhrase':
    'من بينها، {n} من {total} عادت خارج الشهر الجاري: {detail}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisNone':
    'لا شاشة عند المنتصف بالضبط لتُسمّى خارج الشهر — لا أحد يقع عليه',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemaine':
    'من بينها، {n} من {total} عادت خارج الأسبوع الجاري: {detail}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemaineAucun':
    'كل شاشات المنتصف بالضبط عادت في الأسبوع الجاري: لا شيء يعود خارج نافذته.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemaineNone':
    'لا شاشة عند المنتصف بالضبط لتُسمّى خارج الأسبوع — لا أحد يقع عليه',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriode':
    'الفترة التي يغطيها المنتصف بالضبط تمتد من {ancien} إلى {recent} — {n} يومًا بين أقدم عودة وأحدثها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriodeUnJour':
    'الفترة التي يغطيها المنتصف بالضبط تقع في يوم واحد، {ancien}: أقدم عودة وأحدثها في اليوم نفسه.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriodeNone':
    'لا فترة تُسمّى — لا شاشة عند المنتصف بالضبط تحمل عودة مؤرخة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu':
    'البقية قبل المنتصف وعنده · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuHint':
    'لا يُبقي في الطي إلا قسمَي البقية اللذين يسبقان المنتصف أو يقعان عليه — {n} من {total} شاشة غادرة، وما بعد المنتصف خارج القائمة —، لكل واحدة نافذتها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuOffHint':
    'لا يعرض الطي إلا شاشات البقية العائدة قبل المنتصف أو عنده بالضبط — {n} من {total} شاشة: {detail}. ضغطة تُعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuOn':
    'الطي مقتصر على البقية قبل المنتصف وعنده — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuAucun':
    'لا شاشة من البقية تسبق المنتصف ولا تقع عليه',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuMediane':
    'المنتصف المشترك للقسمين المجموعين هو {n} يومًا على {k} عودة مؤرَّخة · ومنتصف المجموعة الكاملة إلى جانبه: {l} يومًا على {m} عودة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuMedianeNone':
    'لا يحمل أي من القسمين المجموعين عودة مؤرَّخة: لا يُسمّى منتصف، وتُقرأ المجموعة الكاملة وحدها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine':
    'البقية قبل المنتصف من هذا الأسبوع · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineHint':
    'لا يُبقي في الطي إلا شاشات البقية العائدة قبل منتصف المجموعة والتي تقع عودتها هذا الأسبوع — {n} من {total} شاشة غادرة —، لكل واحدة نافذتها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineOffHint':
    'لا يعرض الطي إلا شاشات البقية العائدة قبل المنتصف هذا الأسبوع — {n} من {total} شاشة: {detail}. ضغطة تُعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineOn':
    'الطي مقتصر على البقية قبل المنتصف، العائدة هذا الأسبوع — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineAucun':
    'لا شاشة من البقية عادت قبل المنتصف هذا الأسبوع',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemainePlusLent':
    'الشاشة من البقية التي عادت قبل المنتصف هذا الأسبوع وأخذت أطول وقت للعودة هي « {ecran} »، عادت في {date} — {n} يومًا بعد مغادرتها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemainePlusLentNone':
    'لا شاشة من البقية عادت قبل المنتصف هذا الأسبوع: لا تُسمّى أي شاشة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu':
    'البقية قبل منتصف الأسبوع وعنده · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuHint':
    'لا يُبقي في الطي إلا شاشات البقية العائدة قبل المنتصف هذا الأسبوع، ثم تلك الواقعة بالضبط على منتصف المجموعة المجتمعة — {n} من {total} شاشة غادرة —، لكل واحدة نافذتها التي تسمّيها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuOffHint':
    'لا يعرض الطي إلا شاشات البقية العائدة قبل المنتصف هذا الأسبوع وشاشات المنتصف بالضبط — {n} من {total} شاشة: {detail}. ضغطة تُعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuOn':
    'الطي مقتصر على البقية قبل منتصف الأسبوع والمنتصف بالضبط — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuAucun':
    'لا شاشة من البقية عادت قبل المنتصف هذا الأسبوع، ولا واحدة تقع على المنتصف بالضبط',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuMediane':
    'المنتصف المشترك للقسمين المجموعين هو {n} يومًا على {k} عودة مؤرَّخة · ومنتصف المجموعة الكاملة إلى جانبه: {l} يومًا على {m} عودة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuMedianeNone':
    'لا يحمل أي من القسمين المجموعين عودة مؤرَّخة: لا يُسمّى منتصف، وتُقرأ المجموعة الكاملة وحدها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine':
    'البقية عند المنتصف بالضبط هذا الأسبوع · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineHint':
    'لا يُبقي في الطي إلا شاشات البقية الواقعة بالضبط على منتصف المجموعة والتي تقع عودتها هذا الأسبوع — {n} من {total} شاشة غادرة —، لكل واحدة نافذتها التي تسمّيها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineOffHint':
    'لا يعرض الطي إلا شاشات البقية الواقعة بالضبط على المنتصف، العائدة هذا الأسبوع — {n} من {total} شاشة: {detail}. ضغطة تُعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineOn':
    'الطي مقتصر على المنتصف بالضبط، العائد هذا الأسبوع — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineAucun':
    'لا شاشة من البقية وقعت بالضبط على المنتصف وعادت هذا الأسبوع',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusLent':
    'أبطأ شاشة في العودة هي «{ecran}»، عادت في {date} — {n} يومًا بعد مغادرتها.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusLentNone':
    'لا شاشة من المنتصف بالضبط عادت هذا الأسبوع: لا أحد يُسمّى.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusRecent':
    'أحدث شاشة عودة هي «{ecran}»، عادت في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusRecentNone':
    'لا شاشة من المنتصف بالضبط عادت هذا الأسبوع: لا أحد يُسمّى.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste':
    'المنتصف بالضبط هذا الأسبوع وبقية المنتصف · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteHint':
    'لا يُبقي في الطي إلا شاشات المنتصف بالضبط في المجموعة الكاملة: أولًا العائدة هذا الأسبوع — {n} من {total} شاشة —، ثم شاشات المنتصف بالضبط الباقية خارج الأسبوع، لكل واحدة نافذتها التي تسمّيها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteOffHint':
    'لا يعرض الطي إلا المنتصف بالضبط في المجموعة الكاملة، الأسبوع والبقية خارجه جنبًا إلى جنب — {n} من {total} شاشة: {detail}. ضغطة تُعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteOn':
    'الطي مقتصر على المنتصف بالضبط، الأسبوع والبقية خارجه — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteAucun':
    'لا شاشة من البقية تقع بالضبط على منتصف المجموعة، لا هذا الأسبوع ولا خارجه',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteFenetreSemaine':
    'هذا الأسبوع',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteFenetreReste':
    'خارج الأسبوع',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour} · {jours} يومًا',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteMediane':
    'المنتصف المشترك للقسمين المجموعين هو {n} يومًا على {k} عودة مؤرَّخة · ومنتصف المنتصف بالضبط إلى جانبه: {l} يومًا على {m} عودة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteMedianeNone':
    'لا يحمل أي من القسمين المجموعين عودة مؤرَّخة: لا يُسمّى منتصف، ويُقرأ المنتصف بالضبط وحده.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtRestePlusAncien':
    'أقدم شاشة عودة بين الباقية خارج الأسبوع هي «{ecran}»، عادت في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtRestePlusAncienNone':
    'لم تبقَ أي شاشة من المنتصف بالضبط خارج الأسبوع: لا أحد يُسمّى.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois':
    'المنتصف بالضبط للبقية، العائد هذا الشهر · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisHint':
    'لا يُبقي في الطي إلا شاشات البقية الواقعة بالضبط على منتصف المجموعة والتي تقع عودتها هذا الشهر — {n} من {total} شاشة غادرة —، لكل واحدة يوم آخر سحب ويوم عودتها وأجلها: {detail}. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisOffHint':
    'لا يعرض الطي إلا شاشات المنتصف بالضبط العائدة هذا الشهر — {n} من {total} شاشة: {detail}. ضغطة تُعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisOn':
    'الطي مقتصر على المنتصف بالضبط، العائد هذا الشهر — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisAucun':
    'لا شاشة من المنتصف بالضبط عادت هذا الشهر',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisItem':
    '{ecran} · هذا الشهر · غادرت في {date} · عادت في {retour} · {jours} يومًا',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisSemaineMois':
    'يُبقي الأسبوع {n} من {total} شاشة في المنتصف بالضبط · ويُبقي الشهر {m} — القسم نفسه يُقارَن من نافذة إلى أخرى.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisSemaineMoisNone':
    'لا شاشة تقع بالضبط على منتصف المجموعة: لا شيء يقارنه الأسبوع بالشهر.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisPlusTot':
    'أقدم شاشة عودة هذا الشهر هي «{ecran}»، عادت في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisPlusTotNone':
    'لا شاشة من المنتصف بالضبط عادت هذا الشهر: لا أحد يُسمّى.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste':
    'المنتصف بالضبط هذا الشهر وبقية المنتصف · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteHint':
    'لا يُبقي في الطي إلا شاشات المنتصف بالضبط في المجموعة الكاملة: أولًا العائدة هذا الشهر — {n} من {total} شاشة —، ثم شاشات المنتصف بالضبط الباقية خارج الشهر، لكل واحدة نافذتها التي تسمّيها ويوم آخر سحب ويوم عودتها وأجلها: {detail}. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteOffHint':
    'لا يعرض الطي إلا المنتصف بالضبط في المجموعة الكاملة، الشهر والبقية خارجه جنبًا إلى جنب — {n} من {total} شاشة: {detail}. ضغطة تُعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteOn':
    'الطي مقتصر على المنتصف بالضبط، الشهر والبقية خارجه — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteAucun':
    'لا شاشة من البقية تقع بالضبط على منتصف المجموعة، لا هذا الشهر ولا خارجه',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteFenetreMois':
    'هذا الشهر',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteFenetreReste':
    'خارج الشهر',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour} · {jours} يومًا',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMediane':
    'المنتصف المشترك للقسمين المجموعين هو {n} يومًا على {k} عودة مؤرَّخة · ومنتصف المنتصف بالضبط لهذا الشهر إلى جانبه: {l} يومًا على {m} عودة · {sens}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianeNone':
    'لا يحمل أي من القسمين المجموعين عودة مؤرَّخة: لا يُسمّى منتصف، ويُقرأ المنتصف بالضبط لهذا الشهر وحده.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianePareil':
    'المنتصفان متساويان، والمقارنة لا تفصل بينهما',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianePlus':
    'المنتصف المشترك أعلى من منتصف الشهر، فالقسمان المجموعان يعودان أبطأ',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianeMoins':
    'المنتصف المشترك أدنى من منتصف الشهر، فالقسمان المجموعان يعودان أسرع',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois':
    'المنتصف بالضبط العائد خارج الشهر · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisHint':
    'لا يُبقي في الطي إلا شاشات المنتصف بالضبط في المجموعة الكاملة التي تقع عودتها خارج الشهر الجاري — {n} من {total} شاشة —، لكل واحدة يوم آخر سحب ويوم عودتها وأجلها: {detail}. وهو المكمّل الدقيق لقسم الشهر، مأخوذًا من القائمة نفسها للمنتصف بالضبط: لا تضيع شاشة ولا تُحسب مرتين. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisOffHint':
    'لا يعرض الطي إلا المنتصف بالضبط الباقي خارج الشهر — {n} من {total} شاشة: {detail}. ضغطة تُعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisOn':
    'الطي مقتصر على المنتصف بالضبط العائد خارج الشهر — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisAucun':
    'لم تبقَ أي شاشة من المنتصف بالضبط خارج الشهر الجاري',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisItem':
    '{ecran} · غادرت في {date} · عادت في {retour} · {jours} يومًا',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisMediane':
    'منتصف القسم الباقي خارج الشهر هو {n} يومًا على {k} عودة مؤرَّخة · ومنتصف قسم الشهر إلى جانبه: {l} يومًا على {m} عودة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisMedianeNone':
    'لا يحمل أي من جانبي المنتصف بالضبط عودة مؤرَّخة: لا يُسمّى منتصف، ويُقرأ القسمان بلا رقم.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPlusAncien':
    'أقدم شاشة عودة خارج الشهر هي «{ecran}»، عادت في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPlusAncienNone':
    'لم تبقَ أي شاشة من المنتصف بالضبط خارج الشهر: لا أحد يُسمّى.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine':
    'المنتصف بالضبط في الأسبوع وخارج الشهر مجموعَين · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineHint':
    'جمع في الطي شاشات المنتصف بالضبط العائدة هذا الأسبوع وتلك الباقية خارج الشهر الجاري — {n} من {total} شاشة —، لكل واحدة نافذتها التي تسمّيها، ويوم آخر سحب، ويوم عودتها، وأجلها: {detail}. فتُقرأ النوافذ الثلاث من نظرة واحدة: الأسبوع، والشهر، وخارج الشهر. ولا يحذف أي نسيان؛ ضغطة ثانية تُعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineOffHint':
    'يعرض الطي المنتصف بالضبط في الأسبوع والمنتصف الباقي خارج الشهر — {n} من {total} شاشة: {detail}. ضغطة تُعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineOn':
    'الطي مقتصر على المنتصف بالضبط في الأسبوع وخارج الشهر — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineAucun':
    'لم تعُد أي شاشة من المنتصف بالضبط هذا الأسبوع ولم تبقَ خارج الشهر',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour} · {jours} يومًا',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineFenetreSemaine':
    'الأسبوع',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineFenetreHorsMois':
    'خارج الشهر',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineParts':
    'الأسبوع: {a} شاشة، المنتصف {b} · الباقي خارج الشهر: {c} شاشة، المنتصف {d}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePartMediane':
    '{n} يومًا على {k} عودة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePartMedianeNone':
    'لا عودة مؤرَّخة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMediane':
    'المنتصف المشترك للقسمين المجموعين هو {n} يومًا على {k} عودة · ومنتصف المنتصف بالضبط في الشهر إلى جانبه: {l} يومًا على {m} عودة · {sens}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianeNone':
    'لا يحمل أي من القسمين المجموعين عودة مؤرَّخة: لا يُسمّى منتصف، وتُقرأ النوافذ الثلاث بلا رقم.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianePareil':
    'المنتصفان متساويان، والمقارنة لا تفصل بينهما',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianePlus':
    'المنتصف المشترك أعلى من منتصف الشهر، فالقسمان المجموعان يعودان أبطأ',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianeMoins':
    'المنتصف المشترك أدنى من منتصف الشهر، فالقسمان المجموعان يعودان أسرع',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusLent':
    'أبطأ شاشة عودة بين القسمين المجموعين هي «{ecran}»، عادت في {date}، بعد {n} يومًا.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusLentNone':
    'لا يحمل أي من القسمين المجموعين عودة مؤرَّخة: لا أحد يُسمّى.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusRapide':
    'أسرع شاشة عودة بين القسمين المجموعين هي «{ecran}»، عادت في {date}، بعد {n} يومًا.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusRapideNone':
    'لا يحمل أي من القسمين المجموعين عودة مؤرَّخة: لا أحد يتقدّم على الآخر.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecent':
    'أحدث شاشة عودة بين الباقية خارج الشهر هي «{ecran}»، عادت في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentNone':
    'لم تبقَ أي شاشة من المنتصف بالضبط خارج الشهر: لا أحد يُسمّى.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentMois':
    'أحدث شاشة عودة بين شاشات قسم الشهر هي «{ecran}»، عادت في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentMoisNone':
    'لم تعُد أي شاشة من المنتصف بالضبط هذا الشهر: لا أحد يُسمّى من هذا الجانب.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotes':
    'تتقاطع الجهتان على {n} شاشة من العلامة: عادت هذا الأسبوع دون أن تقع في الشهر، فتحمل قسم الأسبوع وقسم الخارج معًا — {k} شاشة في المجموع، كل واحدة محسوبة مرة واحدة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesNone':
    'لا شاشة تقع في الجهتين معًا: كل قسم في العلامة يُقرأ وحده.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePart':
    'من بين {k} شاشة في العلامة، {n} تحمل قسمًا واحدًا فقط — لا قسم الأسبوع وقسم الخارج معًا: {detail}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartNone':
    'كل شاشة في العلامة تحمل القسمين معًا: لا واحدة تُقرأ من جهة واحدة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartPlusAncien':
    'أطول شاشة تحمل قسمًا واحدًا هي « {ecran} »، عادت في {date} — منذ {n} يومًا.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartPlusAncienNone':
    'لا شاشة تحمل قسمًا واحدًا: لا أحد يُسمّى.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesDelai':
    'المدّة الوسطى بين الجهتين المُجمَعتين {n} يومًا على {k} شاشة — الأقصر: « {court} »، {jc} يومًا؛ والأطول: « {long} »، {jl} يومًا.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesDelaiNone':
    'لا تتقاطع الجهتان على أي شاشة: لا مدّة وسطى تُقرأ.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisMediane':
    'منتصف الأسبوع السريع {n} يومًا على {k} عودة · ومنتصف البقية إلى جانبه: {m} يومًا على {j} عودة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisMedianeNone':
    'لا الأسبوع السريع ولا البقية تحمل أجلًا: لا منتصف يُقرأ.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuPlusLentNone':
    'لا شاشة في البقية بعد المنتصف لتُسمّى — المجموعة فارغة',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierFenetreMoisEnCours':
    'الشهر الجاري',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierFenetreMoisDernier':
    'الشهر الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMois':
    'السنة المغلقة والشهر قبل الماضي · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة خلال السنة المغلقة أو الشهر قبل الماضي — {n} من {total} شاشة غادرة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهر قبل الماضي محسوب أصلًا داخل السنة المغلقة، فلا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisOffHint':
    'القائمة لا تُظهر إلا شاشات السنة المغلقة والشهر قبل الماضي — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisOn':
    'القائمة مضغوطة على السنة المغلقة والشهر قبل الماضي — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisAucun':
    'لا عودة مؤرّخة خلال السنة المغلقة ولا الشهر قبل الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisRepartis':
    'الشهر قبل الماضي: {a} شاشة · السنة المغلقة: {b} شاشة — {n} في المجموع، والشهر قبل الماضي محسوب أصلًا داخل السنة المغلقة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisFenetreAvantDernier':
    'الشهر قبل الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisFenetreAnnee':
    'السنة المغلقة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAvantDernier':
    'الشهر قبل الماضي — الأقصر « {ecran} »، عاد في {n} يومًا في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAvantDernierNone':
    'الشهر قبل الماضي — لا عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAnnee':
    'السنة المغلقة — الأقصر « {ecran} »، عاد في {n} يومًا في {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAnneeNone':
    'السنة المغلقة — لا عودة مؤرّخة.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtNone':
    'لا نافذة من الاثنتين تحمل عودة مؤرّخة: المجموعتان لا تسمّيان أحدًا.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMois':
    'الثلاثة أشهر المغلقة والشهر قبل الماضي · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت بتاريخ عودة خلال الأشهر الثلاثة المغلقة أو الشهر قبل الماضي — {n} من {total} شاشة غادرة —، كل واحدة تحمل نافذتها، مع يوم آخر سحب لها ويوم عودتها: {detail}. الشهر قبل الماضي محسوب أصلًا داخل الأشهر الثلاثة المغلقة، فلا شاشة تُحسب مرتين. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisOffHint':
    'القائمة لا تُظهر إلا شاشات الأشهر الثلاثة المغلقة والشهر قبل الماضي — {n} من {total} شاشة: {detail}. الضغط مرة أخرى يعيد كل الشاشات دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisOn':
    'القائمة مضغوطة على الأشهر الثلاثة المغلقة والشهر قبل الماضي — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisAucun':
    'لا عودة مؤرّخة خلال الأشهر الثلاثة المغلقة ولا الشهر قبل الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisEcartes':
    'يستبعد {n} سطرًا من القائمة، من أصل {total} شاشة غادرة.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisItem':
    '{ecran} · {fenetre} · غادرت في {date} · عادت في {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisRepartis':
    'الأشهر الثلاثة المغلقة: {a} شاشة · الشهر قبل الماضي: {b} شاشة — {n} في المجموع، والشهر قبل الماضي محسوب أصلًا داخل الأشهر الثلاثة المغلقة.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisFenetreTrimestre':
    'الأشهر الثلاثة المغلقة',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisFenetreAvantDernier':
    'الشهر قبل الماضي',
  'ad.suivi.doorOublisEcransRetoursDatesAnnee': 'عودة مؤرّخة خلال السنة · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت خلال الاثني عشر شهرًا الأخيرة بتاريخ عودة — {n} من {total} شاشة غادرة —، مع يوم آخر سحب لها ويوم عودتها: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeOffHint':
    'لا تعرض القائمة إلا الشاشات التي عادت خلال الاثني عشر شهرًا الأخيرة بتاريخ عودة — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeOn':
    'قائمة مضيّقة على الشاشات التي عادت خلال الاثني عشر شهرًا الأخيرة بتاريخ عودة — {n} من {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeAucun':
    'لا شاشة عادت خلال الاثني عشر شهرًا الأخيرة بتاريخ عودة',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeEcartes':
    'تُبعد {n} سطرًا من قائمة العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneePlusCourt':
    'أقصر أجل في المجموعة هو «{ecran}»، عاد في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneePlusLong':
    'وأطولها هو «{ecran}»، عاد في {n} يومًا بتاريخ {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeBoutsNone':
    'لا عودة مؤرّخة خلال الاثني عشر شهرًا الأخيرة: المجموعة لا تسمّي أحدًا.',
  'ad.suivi.doorOublisEcransRepartisHierHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت إلى الدفتر ثم غادرته مجددًا وكان آخر سحب لها يوم أمس — {n} من {total} شاشة غادرت، مع يوم ذلك السحب: {detail}. لا يُزيل أي نسيان؛ الضغط مرة ثانية يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisHierOffHint':
    'لا تعرض القائمة إلا الشاشات التي غادرت أمس — {n} من {total} شاشة: {detail}. الضغط يعيد كل الشاشات، دون إزالة أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisHierOn':
    'قائمة مضيّقة على الشاشات التي غادرت أمس — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisHierAucun': 'لا شاشة غادرت أمس',
  'ad.suivi.doorOublisEcransRepartisHierEcartes':
    'تُبعد {n} سطرًا من قائمة العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransRepartisJour': 'غادرت اليوم · {n}',
  'ad.suivi.doorOublisEcransRepartisJourHint':
    'لا تُبقِ في القائمة إلا الشاشات التي عادت إلى الدفتر ثم غادرت وكان آخر سحب لها اليوم — {n} من {total} شاشة غادرت، مع يوم ذلك السحب: {detail}. لا تحذف أي نسيان؛ والضغط الثاني يعيد كل الشاشات.',
  'ad.suivi.doorOublisEcransRepartisJourOffHint':
    'القائمة تُظهر فقط الشاشات التي غادرت اليوم — {n} من {total} شاشة: {detail}. ضغطة واحدة تعيد كل الشاشات دون حذف أي نسيان.',
  'ad.suivi.doorOublisEcransRepartisJourOn':
    'القائمة مضيّقة على الشاشات التي غادرت اليوم — {n} من {total}',
  'ad.suivi.doorOublisEcransRepartisJourAucun': 'لا شاشة غادرت اليوم',
  'ad.suivi.doorOublisEcransRepartisJourEcartes':
    'يستبعد {n} سطرًا من كشف الشاشات، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransRepartisVieuxEcartes':
    'يستبعد {n} سطرًا من الفتحة من العرض، من أصل {total} شاشة غادرت.',
  'ad.suivi.doorOublisEcransJetonsClear': 'إعادة كل الشاشات',
  'ad.suivi.doorOublisEcransJetonsClearRendues':
    'ستعيد {rendues} سطرًا من الفتحة إلى العرض، من أصل {total} في الكانوت.',
  'ad.suivi.doorOublisEcransJetonsClearRenduesNone':
    'كل أسطر الفتحة معروضة أصلًا: لن تعيد أي سطر.',
  'ad.suivi.doorOublisEcransJetonsClearHint':
    'تُطفئ {n} علامة في الفتحة بنقرة واحدة وتعيد كل الشاشات — {total} في الكانوت — دون حذف أي نسيان: العدد والأسطر وعلامات الكانوت تبقى كما هي.',
  'ad.suivi.doorOublisEcransJetonsClearEach':
    'علامة بعلامة، ما يُبقيه كل منها: {detail}. الممحاة تُطفئها كلها بنقرة؛ ونقرة ثانية على علامة واحدة ترفعها دون المساس بالأخريات.',
  'ad.suivi.doorOublisEcransJetonsCleared':
    'أُطفئت {jetons} علامة من الفتحة: عادت {n} شاشة من الكانوت، ولم يُحذف أي نسيان.',
  'ad.suivi.doorOublisCsvRetourMoyenne':
    'فروق العودة: {n} يومًا في المتوسط، شاشة بشاشة، على {k} شاشة عادت.',
  'ad.suivi.doorOublisCsvRetourMoyenneOne':
    'فروق العودة: شاشة واحدة عادت، {n} يومًا محسوبًا — لا يقول المتوسط أكثر من ذلك.',
  'ad.suivi.doorOublisCsvRetourMoyenneNone':
    'فروق العودة: لا عودة مؤرّخة على هذا الجهاز، فلا يُقرأ المتوسط بعد.',
  'ad.suivi.doorOublisCsvRepartisMoyenne':
    'الأيام المقضاة في الكانوت قبل المغادرة: {n} يومًا في المتوسط، شاشة بشاشة، على {k} شاشة غادرت.',
  'ad.suivi.doorOublisCsvRepartisMoyenneOne':
    'الأيام المقضاة في الكانوت قبل المغادرة: شاشة واحدة غادرت، {n} يومًا محسوبًا — المتوسط لا يقول أكثر.',
  'ad.suivi.doorOublisCsvRepartisMoyenneNone':
    'الأيام المقضاة في الكانوت قبل المغادرة: لا مغادرة مؤرّخة على هذا الجهاز، فلا يُقرأ المتوسط بعد.',
  'ad.suivi.doorOublisEcranReparti': 'أُزيلت مرة أخرى في {date}',
  'ad.suivi.doorOublisCsvRetiresSpan':
    'الشاشات المسحوبة باسمها: {n} يومًا تفصل أول سحب، في {ancien}، عن آخره، في {recent}.',
  'ad.suivi.doorOublisCsvRetiresSpanOne':
    'الشاشات المسحوبة باسمها: سحب واحد مدوّن، في {date} — لا فارق أيام يُقرأ بعد.',
  'ad.suivi.doorOublisCsvRetiresSpanNone':
    'الشاشات المسحوبة باسمها: لا سحب مدوّن على هذا الجهاز، والفارق لا يُقرأ بعد.',
  'ad.suivi.doorOublisEcranClear': 'إعادة كل الشاشات',
  'ad.suivi.doorOublisEcranCleared':
    'أُعيدت الشاشة «{ecran}»: عادت أفعالها بين شاشات الدفتر الـ{n}، والدفتر يحتفظ بكل أفعاله.',
  'ad.suivi.doorOublisTriEcranCleared':
    'عاد ترتيب الأحدث: لم تبقَ الشاشات الـ{n} مجمّعة، والدفتر يحتفظ بكل أفعاله.',
  'ad.suivi.doorOublisSemaineNom': 'هذا الأسبوع',
  'ad.suivi.doorOublisJetonsItem': '{nom} · {masques} فعل/أفعال خارج العرض',
  'ad.suivi.doorOublisJetonsClearHintDetail':
    'يطفئ {n} شارة موضوعة على الدفتر بنقرة واحدة ويعيد القائمة كاملة. كل واحدة كانت تُخرج من العرض: {detail}. لا يُزال أي نسيان، ولا يتغيّر عدّاد الدفتر.',
  'ad.suivi.doorOublisLineClear': 'إزالة هذا الفعل من الدفتر',
  'ad.suivi.doorOublisLineClearHint':
    'إزالة نسيان باب «{ecran}» المؤرَّخ في {date} من الدفتر: تبقى الزيارة المحفوظة على هذا الجهاز، وتبقى الخطة أيضًا.',
  'ad.suivi.doorOublisLineCleared':
    'أُزيل نسيان «{ecran}» من الدفتر: تبقى الزيارة المحفوظة على هذا الجهاز، وتبقى الخطة أيضًا.',
  'ad.suivi.doorOublisParChantierHint':
    'زيارات الدفتر مرتّبة حسب ورشة الخطة، الأكثر عددًا أوّلًا: حيث تركّز النسيان، تُقرأ من ذاكرة الجهاز نفسها.',
  'ad.suivi.doorOublisChantierItem': '{nom} · {n}',
  'ad.suivi.doorOublisChantierAucun': 'خارج الورش',
  'ad.suivi.doorOublisClear': 'إعادة الدفتر إلى الصفر',
  'ad.suivi.doorOublisClearHint':
    'إعادة دفتر النسيان إلى الصفر — زياراته ({n}) ويومه الأخير وأسطره في CSV —، دون المساس بالزيارات المحفوظة: علامات «سُلك سابقًا» والخطة تبقى كما هي.',
  'ad.suivi.doorOublisCleared':
    'أُعيد دفتر النسيان إلى الصفر: الزيارات المحفوظة تبقى على هذا الجهاز، والخطة أيضًا.',
  'ad.suivi.chantierVues': '{n} بابًا مسلوك من {total}',
  'ad.suivi.chantierVuesAucune': 'لا باب مسلوك من هذا الجهاز',
  'ad.suivi.chantierVuesHint': 'أبواب هذه الورشة المسلوكة سابقًا من هذا الجهاز: {detail}',
  'ad.suivi.chantierVuesClear': 'نسيان زيارات هذه الورشة',
  'ad.suivi.chantierVuesClearHint':
    'مسح {n} زيارة لأبواب «{chantier}» من هذا الجهاز: تعود علاماتها إلى «للفتح»، وتبقى {autres} زيارة لأبواب أخرى على هذا الجهاز، والخطة كما هي.',
  'ad.suivi.chantierVuesCleared':
    'نُسيت {n} زيارة لورشة «{chantier}» على هذا الجهاز: عادت أبوابها إلى «للفتح».',
  'ad.suivi.doorUsed': 'سُلك سابقًا',
  'ad.suivi.doorUsedHint': 'سبق سلك هذا الباب من هذا الجهاز في {date}.',
  'ad.suivi.doorUsedClear': 'نسيان الزيارة',
  'ad.suivi.doorUsedClearHint': 'مسح زيارة باب «{ecran}» من هذا الجهاز: تعود العلامة إلى «للفتح»، وتبقى الخطة والأبواب الأخرى كما هي.',
  'ad.suivi.doorUsedCleared': 'نُسيت زيارة «{ecran}» على هذا الجهاز: عاد الباب إلى «للفتح».',
  'ad.suivi.doorTodo': 'للفتح',
  'ad.suivi.doorTodoHint': 'لم يُسلك هذا الباب بعد من هذا الجهاز: ما زال للفتح.',
  'ad.suivi.mailDoorScreen': 'فتح شاشة «{ecran}» في الإعدادات، مباشرة على كتلتها.',
  'ad.suivi.resteTitle': 'ما تبقّى',
  'ad.suivi.resteNote': '{n} بندًا ما زال مفتوحًا',
  'ad.suivi.phasesTitle': 'خطة التطوير',
  'ad.suivi.phase': 'المرحلة',
  'ad.suivi.etatFait': 'منتهية',
  'ad.suivi.etatEncours': 'جارٍ',
  'ad.suivi.etatAvenir': 'قادمة',
  'ad.suivi.blocagesTitle': 'نقاط التعطيل',
  'ad.suivi.blocOuvert': 'مفتوح',
  'ad.suivi.blocAttente': 'إجراء خارجي',
  'ad.suivi.blocLeve': 'مرفوع',
  'ad.suivi.telecharger': 'تنزيل الخطة',
  'ad.suivi.telechargerHint':
    'ينزّل ملف قيادة المشروع نصًّا، مؤرّخًا بإصداره، لأرشفته عند كل تحديث.',
  'ad.suivi.telecharge': 'تم تنزيل الخطة',
  'ad.suivi.lastDownload': 'آخر تنزيل · {date}',
  'ad.suivi.lastNone': 'لم يُنزَّل بعد',
  'ad.suivi.lastHint':
    'تاريخ آخر تنزيل لهذا الأرشيف على هذا الجهاز: يقول متى غادرت القطعة آخر مرة.',
  'ad.suivi.lastNoneHint': 'لم يُنزَّل أي أرشيف من هذا الجهاز حتى الآن.',
  'ad.suivi.lastClear': 'محو الذاكرة',
  'ad.suivi.lastClearHint':
    'يمحو تواريخ التنزيل المحفوظة على هذا الجهاز؛ والملفات التي غادرت سابقًا لا تتغير.',
  'ad.suivi.lastClearConfirm': 'تأكيد المحو',
  'ad.suivi.lastClearConfirmHint':
    'نقرة ثانية تمحو ذاكرة التنزيلات. وأي إرسال جديد سيكتبها من جديد.',
  'ad.suivi.chantierClear': 'محو تاريخ هذا الأرشيف',
  'ad.suivi.chantierClearHint':
    'آخر تنزيل · {date} — انقر لمحو ذاكرة هذا الأرشيف وحده.',
  'ad.suivi.chantierClearConfirm': 'تأكيد المحو',
  'ad.suivi.chantierClearConfirmHint':
    'نقرة ثانية تمحو تاريخ هذا الأرشيف؛ أما الأرشيفات الأخرى والملفات المنزّلة فلا تتغير.',
  'ad.suivi.archivesJamais': 'أرشيفات لم تُنزَّل قطّ {n} / {total}',
  'ad.suivi.archivesJamaisHint': 'أوراق ما زالت بحاجة إلى الإرفاق: {noms}',
  'ad.suivi.archivesJamaisOk':
    'الأرشيفات الأربعة غادرت هذا الجهاز بالفعل: لم يبق شيء لإرفاقه.',
  'ad.suivi.archivesJamaisDerniere': 'آخر أرشيف غادر في {date}',
  'ad.suivi.archivesJamaisAucune': 'لم يغادر أي أرشيف بعد',
  'ad.suivi.archivesJamaisListShow':
    'عرض الأوراق التي ما زالت بحاجة إلى الإرفاق، مرقّمة بترتيب إرسالها',
  'ad.suivi.archivesJamaisListHide': 'طيّ قائمة الأوراق المطلوب إرفاقها',
  'ad.suivi.archivesJamaisItemHint': 'يُرفَق في المرتبة {n} — {nom}',
  'ad.suivi.archivesJamaisItemTelecharger':
    'تنزيل أرشيف « {nom} » — الورقة المطلوب إرفاقها في المرتبة {n}',
  'ad.suivi.archivesJamaisPieceOk':
    'تم تنزيل أرشيف « {nom} » — الورقة تغادر قائمة الأرشيفات المطلوب إرفاقها.',
  'ad.p.mail.testOld': 'آخر دليل أقدم من شهر: أرسل تجربة جديدة لتحديثه.',
  'ad.p.mail.testAt': 'آخر تجربة وردت في {date} · {age} — أرسل تجربة لتجديد الدليل.',
  'ad.p.mail.testOldAt':
    'آخر تجربة وردت في {date} · {age} — أقدم من شهر: أرسل تجربة جديدة لتحديثها.',
  'ad.suivi.note':
    'يقرأ هذا الجزء ملف قيادة المشروع: النسبة هي المعدّل المرجّح للوحدات، وتُحتسب من جديد عند كل تحديث للمستند. ويبقى نص الخطة بالفرنسية — لغة مستند العمل.',
};

const en: Dict = {
  'ad.stamp': 'Console',
  'ad.title': 'Site administration',
  'ad.lede': 'Subscribers, listings, messaging and settings — in one place, on the site’s real data.',
  'ad.back': 'Back to the site',
  'ad.signout': 'Sign out',
  'ad.signedAs': 'Signed in as',
  'ad.loading': 'Loading the console…',
  'ad.error': 'The console could not load its data.',
  'ad.retry': 'Try again',
  'ad.refresh': 'Refresh',
  'ad.denied.title': 'Administration only',
  'ad.denied.body': 'This console opens with the site owner account only. Sign in with the allowed address.',
  'ad.denied.cta': 'Open the sign-in page',
  'ad.tab.clients': 'Subscribers',
  'ad.tab.paiements': 'Payments',
  'ad.tab.annonces': 'Listings',
  'ad.tab.messages': 'Messaging',
  'ad.tab.journal': 'Review journal',
  'ad.tab.suivi': 'Project tracking',
  'ad.tab.params': 'Settings',
  'ad.stat.abo': 'subscriptions',
  'ad.stat.actifs': 'active',
  'ad.stat.essai': 'on trial',
  'ad.stat.mrr': 'monthly revenue',
  'ad.stat.comptes': 'accounts',
  'ad.stat.apresRelance': 'accounts after follow-up',
  'ad.stat.apresRelanceHint':
    'Accounts with at least one listing that arrived after the prepared follow-up, read from this device’s memory.',
  'ad.stat.silencieux': 'quiet accounts',
  'ad.stat.annonces': 'listings',
  'ad.stat.fils': 'open threads',

  'ad.clients.stamp': 'Subscribers',
  'ad.clients.sub': 'Every subscription as recorded: plan, amount, due date and payment channel.',
  'ad.clients.search': 'Search a company, an e-mail, a city…',
  'ad.clients.allStatus': 'All states',
  'ad.clients.empty': 'No subscription recorded yet.',
  'ad.clients.none': 'No subscription matches this search.',
  'ad.clients.entreprise': 'Company',
  'ad.clients.offre': 'Plan',
  'ad.clients.statut': 'State',
  'ad.clients.montant': 'Amount / month',
  'ad.clients.cardMontant': 'Amount',
  'ad.clients.cardSleep': 'Sleeping',
  'ad.clients.cardEtabs': 'Sites',
  'ad.clients.echeance': 'Due date',
  'ad.clients.canal': 'Payment',
  'ad.clients.depuis': 'Since',
  'ad.clients.comptes': 'Site accounts',
  'ad.clients.comptesSub': 'The accounts opened, with their plan and establishments.',
  'ad.clients.adminMark': 'Administrator',
  'ad.clients.adminMarkHint':
    'This account can open the admin console: its role says so, and the console lets it in with its own address.',
  'ad.clients.adminNoEtabsHint':
    'An administrator account is not an establishment: this column counts nothing for it.',
  'ad.clients.comptesAdminChip': 'Administrators',
  'ad.clients.comptesAdminHint':
    'Keep only the accounts that can open the console — administrator role or admin address; a second click restores the full list.',
  'ad.clients.comptesAdminEmpty':
    'No administrator account in this list: the console stays open to the only account holding it.',
  'ad.clients.comptesAdminCount': '{n} administrator(s)',
  'ad.clients.comptesAdminCountHint':
    'The number of accounts that can open the console, counted on the same rows as the table. One click narrows the table to those accounts, a second restores it.',
  'ad.clients.adminStaleMark': 'To review',
  'ad.clients.adminStaleHint':
    'Promoted administrator {n} months ago, on {date}: this role calls for a review — is the access still wanted?',
  'ad.clients.adminStaleOpen':
    'Open this account’s sheet on its role line, to review how old the promotion is.',
  'ad.clients.adminStaleChip': 'Promotions to review',
  'ad.clients.adminStaleHintChip':
    'Keep only the accounts promoted administrator more than six months ago; a second click restores the whole table.',
  'ad.clients.adminStaleEmpty':
    'No promotion older than six months to review: the administrator roles are recent.',
  'ad.clients.adminNoDateChip': 'Promotions without a date',
  'ad.clients.adminNoDateHint':
    'Keep only the administrator accounts whose promotion was never dated: their date is still to be filled in. A second click restores the whole table.',
  'ad.clients.adminNoDateEmpty':
    'No promotion without a date: every administrator role carries the date of its promotion.',
  'ad.clients.adminMarkOpen': 'Open the profile on the role line',
  'ad.clients.promoCol': 'Promotion',
  'ad.clients.promoUnknown': 'No date',
  'ad.clients.promoUnknownHint':
    'This account was promoted before the console started recording dates: its promotion date is still to be filled in, never invented.',
  'ad.clients.sortPromoHint':
    'Sort the accounts by promotion date, the oldest first; a second click brings the most recent to the front, a third restores table order. Accounts whose date was never recorded follow, then ordinary accounts.',
  'ad.clients.promoOrderOld': 'Oldest promotion first',
  'ad.clients.promoOrderRecent': 'Most recent promotion first',
  'ad.xls.role': 'Role',
  'ad.xls.roleAdmin': 'Administrator',
  'ad.xls.roleOther': 'Ordinary account',
  'ad.xls.promotedOn': 'Promotion date',
  'ad.xls.promoUnknown': 'Date not recorded',
  'ad.xls.promoUnknownNote':
    'The “Promotion date” column carries “Date not recorded” for an account promoted administrator before the console started recording dates: the cell is never left empty, where it would read as a missing measure. An ordinary account keeps an empty cell — it has no promotion.',
  'ad.xls.adminsSheet': 'Administrators',
  'ad.xls.adminsSheetEmpty':
    'No administrator account: the console stays open to the only account holding it.',
  'ad.xls.adminsSheetCount': 'Administrator accounts',
  'ad.xls.adminsSheetOrder':
    'Accounts are sorted by promotion date, oldest first — the same direction as the accounts table sorted by promotion, so roles are re-read in one order; those whose date was never recorded close the list, in name order. When the table is sorted from most recent to oldest, the sheet follows that direction.',
  'ad.xls.adminsSheetNote':
    'The promotion date is the one recorded when the role was changed in the console. An empty cell means a promotion older than that record: the date was not invented.',
  'ad.xls.adminsStaleCount': 'Promotions older than six months',
  'ad.xls.adminsStaleNote':
    'The count of promotions older than six months is read on the same date as the “Administrators” sheet: a role opened more than six months ago calls for a review. A promotion without a recorded date does not enter it — nothing would allow dating it.',
  'ad.clients.comptesEmpty': 'No account recorded.',
  'ad.clients.metier': 'Trade',
  'ad.clients.ville': 'City',
  'ad.clients.fiche': 'Record',
  'ad.clients.open': 'Open the record',
  'ad.clients.export': 'Export to Excel',
  'ad.clients.echeanceChip': 'Due in < 30 days',
  'ad.clients.echeanceHint': 'Narrow the list to subscriptions due within thirty days.',
  'ad.clients.echeanceEmpty': 'Nothing falls due in the next thirty days.',
  'ad.clients.reset': 'Show all',
  'ad.clients.dueIn': 'in {n} d',
  'ad.clients.dueToday': 'today',
  'ad.clients.duePast': 'overdue by {n} d',
  'ad.clients.sortDueHint':
    'One click sorts the list by due date, the most urgent first; a second click reverses the order.',
  'ad.clients.depots': 'Listings',
  'ad.clients.apresCol': 'After follow-up',
  'ad.clients.depotNone': 'none posted',
  'ad.clients.noPublieChip': 'No published listing',
  'ad.clients.noPublieHint': 'Narrow the list to accounts with no published listing yet.',
  'ad.clients.noPublieEmpty': 'No account without a published listing: all have at least one.',
  'ad.clients.lateChip': 'Long review',
  'ad.clients.lateHint':
    'Narrow the list to accounts with a listing waiting for an answer for more than seven days.',
  'ad.clients.lateEmpty': 'No account has been waiting for an answer for more than seven days.',
  'ad.clients.comptesLateEmpty': 'No account has been waiting for an answer for more than seven days.',
  'ad.clients.sortLateHint':
    'One click sorts the list by number of long reviews, the busiest account first; a second click reverses the order.',
  'ad.clients.sortApresHint':
    'One click sorts the list by number of listings that arrived after the prepared follow-up, the account that posted most since its message first; a second click reverses the order.',
  'ad.clients.lateOpenHint':
    'Opens the “Listings” tab narrowed to this account’s deposits in review for more than seven days.',
  'ad.clients.sleepRow': 'sleeping threads',
  'ad.clients.sleepRowHint':
    'Conversations of this account that take a day or more to answer: the marker reads before opening the record.',
  'ad.clients.sleepCol': 'Sleeping threads',
  'ad.clients.sortSleepHint':
    'One click sorts the list by number of sleeping threads, the quietest account first; a second click reverses the order.',
  'ad.clients.sleepChip': 'Quiet accounts',
  'ad.clients.sleepHint':
    'One click narrows both tables to accounts with at least one conversation that takes a day or more to answer; a second click opens them again.',
  'ad.clients.sleepEmpty':
    'No account has a sleeping thread: every conversation answers in under a day.',
  'ad.clients.sleepOpenHint':
    'Opens the console messaging on this account’s sleeping thread, without searching for it in the list.',
  'ad.clients.relance': 'Prepare a follow-up',
  'ad.clients.relanceHint':
    'Opens the same pre-filled message as the record — waiting deposits and the summary line — without opening the record.',
  'ad.clients.recap': 'Copy the priorities',
  'ad.clients.recapHint':
    'Copies this account’s priorities — its sleeping threads with their delay, then its long reviews — without opening the record.',
  'ad.clients.recentTodayChip': 'Followed up today',
  'ad.clients.recentTodayHint':
    'Narrow the list to accounts with a follow-up prepared today.',
  'ad.clients.recentWeekChip': 'Followed up this week',
  'ad.clients.recentWeekHint':
    'Narrow the list to accounts with a follow-up prepared in the last seven days, today included.',
  'ad.clients.recentTodayEmpty': 'No follow-up prepared today.',
  'ad.clients.recentWeekEmpty': 'No follow-up prepared in the last seven days.',
  'ad.clients.apresHint':
    'One click narrows both lists to accounts with a listing that arrived after the prepared follow-up, read from this device’s memory; a second click shows everything again.',
  'ad.clients.apresEmpty':
    'No account has a listing that arrived after the follow-up: the message covers everything posted.',
  'ad.clients.comptesOrderLate': 'Same order: long reviews',
  'ad.clients.comptesOrderLateDesc': 'Same order: long reviews, reversed',
  'ad.clients.comptesOrderApres': 'Same order: after follow-up',
  'ad.clients.comptesOrderApresDesc': 'Same order: after follow-up, reversed',
  'ad.clients.comptesOrderSleep': 'Same order: sleeping threads',
  'ad.clients.comptesOrderSleepDesc': 'Same order: sleeping threads, reversed',
  'ad.clients.comptesOrderHint':
    'The second table follows the sort chosen in the subscribers table: this chip recalls it, and accounts read in the same order as the subscriptions.',
  'ad.clients.comptesOrderTable': 'Table order',
  'ad.clients.comptesOrderDetachHint':
    'Detaches the second table from the subscriptions sort and brings it back to table order, without touching the order of the subscriptions.',
  'ad.clients.comptesOrderAttachHint':
    'Re-attaches the second table to the subscriptions sort, so both lists read in the same order.',

  'ad.pay.stamp': 'Payments and subscriptions',
  'ad.pay.sub':
    'What every subscription should bring in, and what still keeps it from being collected.',
  'ad.pay.total': 'tracked subscriptions',
  'ad.pay.prets': 'collectable',
  'ad.pay.regler': 'to settle',
  'ad.pay.montantPret': 'collectable revenue',
  'ad.pay.montantRegler': 'pending revenue',
  'ad.pay.filterAll': 'All',
  'ad.pay.filterRegler': 'To settle',
  'ad.pay.filterReglerHint':
    'Keep only the subscriptions that cannot be collected yet, the oldest due date first.',
  'ad.pay.filterPrets': 'Collectable',
  'ad.pay.filterPretsHint':
    'Keep only the subscriptions chargeable as they stand: open, priced, with an automatic payment method.',
  'ad.pay.colEntreprise': 'Company',
  'ad.pay.colOffre': 'Plan',
  'ad.pay.colMontant': 'Amount / month',
  'ad.pay.colEcheance': 'Due date',
  'ad.pay.colCanal': 'Payment method',
  'ad.pay.colEtat': 'Collection',
  'ad.pay.colFiche': 'Record',
  'ad.pay.cardOffre': 'Plan',
  'ad.pay.cardMontant': 'Amount',
  'ad.pay.cardEcheance': 'Due',
  'ad.pay.cardCanal': 'Payment',
  'ad.pay.cardEtat': 'State',
  'ad.pay.open': 'Open the record',
  'ad.pay.empty': 'No subscription recorded yet.',
  'ad.pay.emptyRegler': 'Nothing pending: everything open is collectable.',
  'ad.pay.emptyPrets':
    'No subscription is collectable as it stands: the “to settle” list says what is missing.',
  'ad.pay.why.pret': 'Ready to collect',
  'ad.pay.why.essai': 'Trial in progress',
  'ad.pay.why.sansMontant': 'No amount given',
  'ad.pay.why.sansCanal': 'No payment method',
  'ad.pay.why.manuel': 'Manual collection',
  'ad.pay.why.retard': 'Due date passed',
  'ad.pay.why.ferme': 'Subscription closed',
  'ad.pay.bannerTitle': 'Automatic charging is not connected yet',
  'ad.pay.bannerBody':
    'No payment provider is linked to the project: subscriptions are tracked, not yet collected online. This screen reads what the database records — plan, amount, due date, payment method — and names, row by row, what is missing for a subscription to be collectable.',
  'ad.pay.ruleTitle': 'The reading rule',
  'ad.pay.ruleBody':
    'A subscription is collectable when it is open, its amount is given, and an automatic payment method is attached. Everything else is flagged with its reason, read in this order: closed subscription, empty amount, missing or manual payment method, trial in progress, passed due date.',
  'ad.pay.note':
    'Amounts are those of the database, excluding tax. A closed subscription counts neither in collectable revenue nor in pending revenue.',
  'ad.pay.motifLabel': 'Filter by reason',
  'ad.pay.motifHint':
    'Isolate in one click the subscriptions whose reason is “{r}”; a second click opens the whole queue again.',
  'ad.pay.motifLegend':
    'One click isolates a reason: the list keeps only the subscriptions it blocks.',
  'ad.pay.motifActive': 'Filtered on the reason “{r}”',
  'ad.pay.motifClear': 'All reasons',
  'ad.pay.motifEmpty':
    'No subscription carries this reason: the rule no longer meets it today.',
  'ad.pay.csvCta': 'Export the table',
  'ad.pay.csvHint':
    'Downloads the visible queue as CSV; the file name carries the reason or the view set on the list, to archive it after a follow-up.',
  'ad.pay.csvDone': 'Table downloaded',
  'ad.pay.exportLast': 'Last archive: {date}',
  'ad.pay.exportWhat': '{what} · {n} row(s)',
  'ad.pay.exportAmount': 'amount {n}',
  'ad.pay.exportReplay': 'Redo this export',
  'ad.pay.exportReplayHint':
    'One click restores the view and the reason of this archive, to redo it as it was; a queue narrowed to one account is first opened again.',
  'ad.pay.exportReplayDone': 'View and reason restored',
  'ad.pay.histTitle': 'The last seven exports',
  'ad.pay.histHint':
    'The most recent exports produced from this device, newest first, with their date, their row count and their amount: the archive is read over time, not only at its last gesture.',
  'ad.pay.histCount': '{n} export(s) kept',
  'ad.pay.histRows': '{n} row(s)',
  'ad.pay.histNoAmount': 'amount not kept',
  'ad.pay.histRowHint':
    'One click replays that export: the screen restores this row’s view and reason, not only those of the last export.',
  'ad.pay.archiveDeltaUp': '+{n} since this export',
  'ad.pay.archiveDeltaDown': '−{n} since this export',
  'ad.pay.archiveDeltaFlat': 'queue unchanged',
  'ad.pay.archiveDeltaHint':
    'What the queue carries today at the same view and the same reason, compared with the amount this export took: the gap says at a glance whether the table has moved since.',
  'ad.pay.archiveDeltaOpenHint':
    'One click opens the queue on the rows of this difference: those that arrived since this export, at the same view and the same reason. Rows that left can only be counted.',
  'ad.pay.archiveDeltaRowsUp': '+{n} row(s)',
  'ad.pay.archiveDeltaRowsDown': '−{n} row(s)',
  'ad.pay.archiveDeltaRowsFlat': 'same row count',
  'ad.pay.archiveDeltaRowsHint':
    'The rows gained or lost since this export, at the same view and the same reason: the count says whether the table filled up or emptied, where the amount only says what it weighs.',
  'ad.pay.ecartChip': 'Difference of the {date} export',
  'ad.pay.ecartArrived': '{n} row(s) arrived',
  'ad.pay.ecartLeft': '{n} left',
  'ad.pay.ecartNone':
    'No row has arrived since this export, at this view and this reason: the table is as it was.',
  'ad.pay.ecartClear': 'Open the whole queue',
  'ad.pay.ecartClearHint':
    'Removes the difference and opens the whole queue, at the export’s view and reason: the table reads without the narrowing.',
  'ad.pay.histAvg': 'Average amount {n}',
  'ad.pay.histAvgNote': 'over {n} export(s) with an amount',
  'ad.pay.histAvgHint':
    'Average of the amounts taken by the exports kept in the history, and the trend between the most recent and the oldest: the seven exports read as a series. Exports with no amount kept stay out of the average.',
  'ad.pay.histAvgUp': '+{n} over the period',
  'ad.pay.histAvgDown': '−{n} over the period',
  'ad.pay.histAvgFlat': 'amounts steady',
  'ad.pay.histPeak': 'Peak of the week',
  'ad.pay.histPeakHint':
    'The export that took the highest amount of the week: the peak reads next to the average, without adding up the seven rows.',
  'ad.pay.histPeakNote': 'Peak {n} on {date}',
  'ad.pay.histPeakNoteHint':
    'The highest amount taken by an export of the week, and its date: the average and the peak read together.',
  'ad.pay.histPeakReplayHint':
    'One click replays the peak export: the screen restores its view and its reason, to read the week at its highest point.',
  'ad.pay.histMovedUp': '+{n} row(s) since',
  'ad.pay.histMovedDown': '−{n} row(s) since',
  'ad.pay.histMovedHint':
    'What the queue counts today at this export’s view and reason, compared with the rows this file took: the row that moved stands out among the seven without opening each archive.',
  'ad.pay.ecartExport': 'Export these rows',
  'ad.pay.histMovedOnly': 'Rows that moved',
  'ad.pay.histMovedOnlyHint':
    'One click keeps only the exports whose row count differs from what the queue counts today, at their view and their reason: the row that moved is found without scanning the seven. A second click restores the whole history.',
  'ad.pay.histMovedOnlyEmpty':
    'No kept export has moved: the table counts the same rows as in every archive.',
  'ad.pay.histAmountMovedUp': '+{n} in amount since',
  'ad.pay.histAmountMovedDown': '−{n} in amount since',
  'ad.pay.histAmountMovedHint':
    'What the queue weighs today at this export’s view and reason, compared with what this file took: the amount that moved is flagged next to the row count, without opening the archive.',
  'ad.pay.ecartExportHint':
    'Downloads as CSV only the rows of this difference — those that arrived since this export — without going back through the whole queue: an attachment, not a new export of the table.',
  'ad.pay.ecartExportDone': 'Rows downloaded',
  'ad.pay.csvEcart': 'Difference since the export of',
  'ad.pay.cmpOpen': 'Compare two exports',
  'ad.pay.cmpOpenHint':
    'Opens two points to pick among the seven exports kept — a start, an end — to read the amount and row gap between them, without going through today’s queue.',
  'ad.pay.cmpTitle': 'Between two exports',
  'ad.pay.cmpClose': 'Close',
  'ad.pay.cmpCloseHint': 'Closes the comparison and hands the history back to its plain reading.',
  'ad.pay.cmpFrom': 'Start point',
  'ad.pay.cmpTo': 'End point',
  'ad.pay.cmpHint':
    'Two archives compared with each other: the amount and the row count move from the start point to the end point. Nothing is compared with today’s queue, and an amount missing from one of the two exports is not invented.',
  'ad.pay.cmpAmountUp': '+{n} in amount',
  'ad.pay.cmpAmountDown': '−{n} in amount',
  'ad.pay.cmpAmountFlat': 'amount unchanged',
  'ad.pay.cmpAmountNone': 'amount not comparable',
  'ad.pay.cmpRowsUp': '+{n} row(s)',
  'ad.pay.cmpRowsDown': '−{n} row(s)',
  'ad.pay.cmpRowsFlat': 'same row count',
  'ad.pay.cmpIds': 'of which {a} arrived and {p} left',
  'ad.pay.cmpArrivalsOnly': '{a} arrived',
  'ad.pay.cmpPartiesToken': 'Left {n}',
  'ad.pay.cmpPartiesTokenHint':
    'One click narrows the table’s queue to those departed rows still in the table, at the current view and reason; a second click opens it again.',
  'ad.pay.cmpPartiesTokenGoneHint':
    'None of these departed rows is still in the table: there is nothing to narrow, the figure only counts.',
  'ad.pay.cmpPartiesNarrowOn': 'Queue on these {n} row(s)',
  'ad.pay.cmpPartiesExitHint':
    'One click opens the whole queue again, at the current view and reason.',
  'ad.pay.cmpPartiesNarrowBanner':
    'Queue narrowed to {n} departed row(s) still in the table',
  'ad.pay.cmpPartiesNarrowNote':
    'The table now shows only those departed rows, at the current view and reason.',
  'ad.pay.cmpPartiesNarrowEmpty':
    'None of these departed rows falls within the current view and reason: nothing to narrow here.',
  'ad.pay.cmpPartiesNarrowExport': 'Export these rows',
  'ad.pay.cmpPartiesNarrowExportHint':
    'Downloads as CSV only the departed rows this narrowing leaves in the table, at the current view and reason: an attachment, not a new export of the queue.',
  'ad.pay.cmpPartiesNarrowExportDone': 'Rows downloaded',
  'ad.pay.histOpposite': 'Opposite directions',
  'ad.pay.histOppositeHint':
    'This export moved in two opposite directions: the row count and the amount do not go the same way. The two gaps read together, otherwise either one would lead to a wrong conclusion.',
  'ad.pay.cmpAccount': 'Account (e-mail)',
  'ad.pay.cmpPartiesDelta': 'Amount withdrawn',
  'ad.pay.cmpPartiesTotal': 'Withdrawn by these departed rows',
  'ad.pay.cmpPartiesDeltaNote':
    'This sheet lists the account’s rows present at the start and absent at the end, found back in the table by their identifier. The “Amount withdrawn” column counts them negative, so the column sums; a row no longer in the table is not listed and is only counted in the total of departed rows.',
  'ad.pay.cmpPartiesMajorMark': 'Weighs more than half',
  'ad.pay.cmpPartiesMajorMarkYes': '● major row',
  'ad.pay.cmpPartiesMajorCount': 'Of which {n} major row(s)',
  'ad.pay.cmpPartiesMajorMarkNote':
    'The “Weighs more than half” column marks the rows that on their own withdraw more than half of the amount withdrawn by these departed rows: the withdrawal then reads on one row instead of spreading out. A row with no amount is not weighed and stays unmarked.',
  'ad.pay.histAmountMovedOnly': 'Amounts that moved',
  'ad.pay.histAmountMovedOnlyHint':
    'One click keeps only the exports whose amount differs from what the queue weighs today, at their view and their reason: the amount that moved is found without scanning the seven. A second click restores the whole history.',
  'ad.pay.histAmountMovedOnlyEmpty':
    'No priced export has moved: the queue weighs the same amount as in every archive.',
  'ad.pay.histBothMovedEmpty':
    'No export has moved, neither in amount nor in rows: the table is as it is in every archive.',
  'ad.pay.histOppositeOnly': 'Opposite directions',
  'ad.pay.histOppositeOnlyHint':
    'One click keeps only the exports whose row count and amount go in opposite directions, at their view and their reason: the two gaps that contradict each other are found without scanning the seven. A second click restores the whole history.',
  'ad.pay.histOppositeOnlyEmpty':
    'No export goes in opposite directions: the row count and the amount go the same way in every archive.',
  'ad.pay.histBaisseOnly': 'Amounts that dropped',
  'ad.pay.histBaisseOnlyHint':
    'One click keeps only the exports whose amount has dropped since: the queue weighs less today than the file, at its view and its reason. An export with no recorded amount takes no direction — it cannot be compared. A second click restores the whole history.',
  'ad.pay.histBaisseOnlyEmpty':
    'No export has dropped: the queue weighs as much as, or more than, every archive today.',
  'ad.pay.histFiltersEmpty':
    'No export meets all these filters at once: loosen one to get the history back.',
  'ad.pay.histShowing': '{n} of {m} export(s) visible',
  'ad.pay.histShowingHint':
    'How many exports the tokens leave in the history, out of the seven it keeps: two tokens set together keep only the archives that meet both conditions.',
  'ad.pay.histClearHint':
    'Turns the three history tokens off in one gesture and restores all seven exports: no filter stays set after the click.',
  'ad.pay.histOppositeExport': 'CSV of opposite directions',
  'ad.pay.histOppositeExportHint':
    'Downloads as CSV only the exports whose row count and amount go in opposite directions, with both gaps side by side — what the archive took, what the queue weighs today at its view and its reason.',
  'ad.pay.histOppositeExportDone': 'Exports downloaded',
  'ad.pay.histFilterExport': 'CSV of the filtered history',
  'ad.pay.histFilterExportHint':
    'Downloads as CSV only the exports the tokens leave in the history, in the order they are read — most recent first —, with each one’s rows and amount, what the queue weighs today at its view and reason, and both gaps.',
  'ad.pay.histFilterExportDone': 'History downloaded',
  'ad.pay.histFilterCost': 'Total weight of these exports {n} · {m} priced export(s)',
  'ad.pay.histFilterCostHint':
    'The sum of the original amounts of the exports the tokens leave in the history: what those files weighed at the moment of the click. An export with no recorded amount is left out of the sum — it cannot be added — and the second figure says how many priced exports it covers.',
  'ad.pay.histFilterCsvFilters': 'Tokens applied',
  'ad.pay.histFilterCsvCount': 'Exports kept',
  'ad.pay.histFilterCsvNote':
    'One row per export the tokens leave in the history, in list order. The “today” columns read the queue at each archive’s view and reason; an export with no recorded amount leaves the amount gap empty, it cannot be compared.',
  'ad.pay.histFilterCsvCost': 'Total cost',
  'ad.pay.histFilterCsvCostNote':
    'Sum of the original amounts of the {n} priced export(s): the same figure as the counter shown on screen, repeated on the last row so an archive can be read without redoing the addition.',
  'ad.pay.histFilterCsvCostNone': 'No priced export in this selection',
  'ad.pay.histBaisseCumulHint':
    'Cumulative drop across the {n} kept export(s): the sum of their negative gaps, between what the queue weighs today and what each file carried. An export that rose is not counted in the sum.',
  'ad.pay.histBaisseCumulToken': 'Cumulative drop',
  'ad.pay.histBaisseCumulTokenHint':
    'One click narrows the history to the exports that dropped only — those whose queue now weighs less than the file. A second click brings all seven back.',
  'ad.pay.histFilterCsvBaisse': 'Cumulative drop',
  'ad.pay.histFilterCsvBaisseNote':
    'Sum of the negative gaps across the {n} retained export(s): what the queue has lost since those files. An export that went up does not enter the sum — it contradicts it.',
  'ad.pay.histFilterCsvBaisseNone': 'No drop in this selection',
  'ad.pay.histFilterCsvLatest': 'Most recent kept export',
  'ad.pay.histFilterCsvLatestNone': 'No kept export',
  'ad.pay.oppCsvRowsNow': 'Rows today',
  'ad.pay.oppCsvAmountNow': 'Amount today',
  'ad.pay.oppCsvRowGap': 'Row gap',
  'ad.pay.oppCsvAmountGap': 'Amount gap',
  'ad.pay.oppCsvCount': 'Exports in opposite directions',
  'ad.pay.oppCsvNote':
    'One row per export where the row count and the amount go in opposite directions: the two gaps read together, otherwise either one would lead to a wrong conclusion. The “today” columns read the queue at each archive’s view and reason; an export with no amount kept leaves the amount gap empty, it cannot be compared.',
  'ad.pay.cmpSame': 'Pick two different exports: the same point cannot be compared with itself.',
  'ad.pay.cmpExport': 'Export the comparison',
  'ad.pay.cmpExportHint':
    'Downloads the gap between these two exports on three sheets: the two points side by side, the amount and row gap between them, then — when both exports kept their rows — the rows that arrived between them.',
  'ad.pay.cmpExportDone': 'Comparison downloaded',
  'ad.pay.cmpColField': 'Marker',
  'ad.pay.cmpDate': 'Export date',
  'ad.pay.colRows': 'Rows',
  'ad.pay.cmpGapTitle': 'Gap between the two exports',
  'ad.pay.cmpSheetPoints': 'The two points',
  'ad.pay.cmpArrivalsSheet': 'Rows that arrived',
  'ad.pay.cmpArrivalsEmpty': 'No row arrived between these two exports.',
  'ad.pay.cmpArrivalsUnknown':
    '{n} row(s) arrived that are no longer in the table: they can only be counted.',
  'ad.pay.cmpArrivalsNote':
    'This sheet names the rows that arrived between the two points, found back in the table by their identifier. It exists only when both exports kept their rows; those that have left the table are no longer there and are only counted.',
  'ad.pay.cmpArrivalDelta': 'Amount gap',
  'ad.pay.cmpArrivalTotal': 'Brought in by these arrivals',
  'ad.pay.cmpArrivalTotalChip': 'Arrivals +{n}',
  'ad.pay.cmpArrivalTotalChipHint':
    'One click unfolds the rows that arrived between the two exports with the amount each brought: the total is read on the spot, without opening the workbook.',
  'ad.pay.cmpArrivalNoAmount': 'no amount',
  'ad.pay.cmpArrivalNarrowHint':
    'A second click narrows the table’s queue to those arrived rows only, at the current view and reason.',
  'ad.pay.cmpArrivalNarrowOn': 'Queue on these {n} row(s)',
  'ad.pay.cmpArrivalNarrowExitHint':
    'One click opens the whole queue again and closes the arrivals list.',
  'ad.pay.cmpArrivalNarrowBanner':
    'Queue narrowed to {n} row(s) that arrived between the two points',
  'ad.pay.cmpArrivalNarrowNote':
    'The table now shows only those, at the current view and reason.',
  'ad.pay.cmpArrivalNarrowEmpty':
    'None of these arrived rows falls within the current view and reason: nothing to narrow here.',
  'ad.pay.cmpPartiesSheet': 'Rows that left',
  'ad.pay.cmpPartiesEmpty': 'No row left between these two exports.',
  'ad.pay.cmpPartiesUnknown':
    '{n} row(s) left that are no longer in the table: they can only be counted.',
  'ad.pay.cmpPartiesNote':
    'This sheet lists the rows present at the start point and absent at the end point, found back in the table by their identifier. It exists only when both exports kept their rows; those that have left the table are no longer there and are only counted.',
  'ad.pay.cmpFilsSheet': 'Active threads',
  'ad.pay.cmpFilsSubject': 'Thread',
  'ad.pay.cmpFilsLast': 'Last message',
  'ad.pay.cmpFilsAt': 'Last message on',
  'ad.pay.cmpFilsPace': 'Reply delay',
  'ad.pay.cmpFilsNoLast': '(no message)',
  'ad.pay.cmpFilsCount': 'Active threads at export time',
  'ad.pay.cmpFilsUnknown':
    '{n} active thread(s) could not be named: they are no longer in the account table.',
  'ad.pay.cmpFilsNote':
    'This sheet names the active threads the gap tab counts: their subject, their last message and its day, and their reply delay. It describes the account at export time, not a difference between the two compared points; it exists only when reply paces had been measured.',
  'ad.pay.exportNone': 'No archive exported from this device yet: today’s is still to do.',
  'ad.pay.exportToday': 'Today’s archive exists',
  'ad.pay.exportMemoHint':
    'Date of the table’s last export, kept on this device: it tells at a glance whether today’s archive has already been produced.',
  'ad.pay.exportClear': 'Clear the memory',
  'ad.pay.exportClearHint':
    'Clears the last export date kept on this device: the archive line starts blank, as if nothing had ever been exported. Files already downloaded do not move.',
  'ad.pay.exportClearConfirm': 'Confirm the clearing',
  'ad.pay.exportClearConfirmHint':
    'A second click clears the memory. The next export writes it again straight away.',
  'ad.pay.exportClearCancel': 'Cancel',
  'ad.pay.exportClearCancelHint': 'Keeps the memory as it stands, clearing nothing.',
  'ad.pay.exportCleared': 'Memory cleared',
  'ad.pay.weekLabel': 'Exported this week',
  'ad.pay.weekToday': 'last export today',
  'ad.pay.weekSince': 'last export {n} day(s) ago',
  'ad.pay.weekNever': 'no export known',
  'ad.pay.weekHint':
    'Counts the table exports of the last seven days, and how many days ago the last one was: a table not re-exported for several days stands out without reading the date.',
  'ad.pay.sortMontant': 'Sort by amount',
  'ad.pay.sortMontantHint':
    'Orders the visible queue from the highest amount down, ties by oldest due date: collect the most profitable subscriptions first.',
  'ad.pay.focusTriMontant': 'Amount, highest first',
  'ad.pay.focusVueRegler': '“To settle” view',
  'ad.pay.focusVuePrets': '“Collectable” view',
  'ad.pay.csvFilter': 'Export filter',
  'ad.pay.focus': 'Narrowed to {mail}',
  'ad.pay.focusHint':
    'Brings the whole queue back: every subscription of the console returns, with its reasons.',
  'ad.pay.focusClear': 'Show every subscription',
  'ad.pay.focusEmpty':
    'This account has no subscription in the queue: there is nothing to collect here.',
  'ad.pay.sortedTotal': 'Queue total',
  'ad.pay.sortedTotalRows': '{n} row(s)',
  'ad.pay.sortedTotalReady': '{n} already collectable',
  'ad.pay.sortedTotalReadyHint':
    'The already collectable share of the queue read: the open, priced and chargeable subscriptions it holds, and their amount. The other amount, beside it, says what the queue carries in all.',
  'ad.pay.sortedTotalDue': '{n} still to settle',
  'ad.pay.sortedTotalDueHint':
    'What this same queue leaves pending: the open, priced subscriptions that are not chargeable yet — passed due date, missing or manual payment method, trial in progress — and their amount. A closed subscription is left out.',
  'ad.pay.sortedTotalHint':
    'Sum of the amounts of the rows shown: what this queue carries as it reads — reason, view and sort included. Sorting does not change the total, only the order in which it is collected.',

  'ad.xls.synthTitle': 'Summary — subscribers',
  'ad.xls.state': 'State',
  'ad.xls.count': 'Subscriptions',
  'ad.xls.share': 'Share',
  'ad.xls.total': 'Total',
  'ad.xls.nearDue': 'Due within 30 days',
  'ad.xls.num': 'No.',
  'ad.xls.mail': 'E-mail',
  'ad.xls.daysLeft': 'Days left',
  'ad.xls.metier': 'Trade',
  'ad.xls.filter': 'List filter',
  'ad.xls.filterCount': 'Filter chips set on the list at export time',
  'ad.xls.headLine': 'Export of {date} — {chips} set on the list at click time',
  'ad.xls.revueSortActive': 'review sort active in the messaging',
  'ad.xls.apresSortActive': 'after-follow-up sort active in the messaging',
  'ad.xls.recentSortActive': 'most-recently-copied sort active in the messaging',
  'ad.xls.apresSortWho': 'leading the order: {n}',
  'ad.xls.order': 'Row order',
  'ad.xls.orderNone': 'table order',
  'ad.xls.orderDue': 'nearest due date first',
  'ad.xls.orderDesc': 'furthest due date first',
  'ad.xls.orderLate': 'account with the most long reviews first',
  'ad.xls.orderLateDesc': 'account with the fewest long reviews first',
  'ad.xls.orderApres': 'account with the most listings arrived after the follow-up first',
  'ad.xls.orderApresDesc': 'account with the fewest listings arrived after the follow-up first',
  'ad.xls.orderSleep': 'account with the most sleeping threads first',
  'ad.xls.orderSleepDesc': 'account with the fewest sleeping threads first',
  'ad.xls.noPublie': 'Accounts with no published listing',
  'ad.xls.depotsPublies': 'Published listings',
  'ad.xls.depotsRefuses': 'Refused listings',
  'ad.xls.relectures': 'Long reviews',
  'ad.xls.sleepThreads': 'Sleeping threads',
  'ad.xls.sleepAccounts': 'Accounts with at least one sleeping thread',
  'ad.xls.sleepNote': 'The “Sleeping threads” column counts, for each account, the conversations that take a day or more to answer — the same measure and the same threshold as the on-screen badge. It stays at zero when the pacing could not be read: a zero then means “nothing measured”, not “all is well”.',
  'ad.xls.reviewedThreads': 'Reviewed during the review',
  'ad.xls.reviewedAccounts': 'Accounts with a sleeping thread reviewed during the review',
  'ad.xls.reviewedThreadsTotal': 'Sleeping threads reviewed during the review',
  'ad.xls.reviewState': 'Review in progress',
  'ad.xls.airesJamais': 'Areas never extracted still in the box at export',
  'ad.xls.airesJamaisList': 'Those areas, one by one',
  'ad.xls.jamaisSortActive': '“area never extracted first” sort active in the messaging',
  'ad.xls.airesJamaisLink':
    'The two rows above lead to the console messaging, narrowed to those areas: one click opens the box already reduced, without hunting for it.',
  'ad.xls.airesJamaisNote':
    'The “Areas never extracted still in the box” row counts, at click time, the areas carried by the console conversations that no extract has carried yet — neither whole nor one by one. It reads the same device memory as the messaging pill: two exports of the same day, made before and after an extract, no longer carry the same figure.',
  'ad.xls.ancienSortActive': '“oldest extract first” sort active in the messaging',
  'ad.xls.gommeSortActive': '“most recently wiped first” sort active in the messaging',
  'ad.xls.gommeAncienneSortActive': '“most long-ago wiped first” sort active in the messaging',
  'ad.xls.gommeRestantes': 'Areas wiped by the eraser still in the box',
  'ad.xls.gommeRestantesList': 'Those areas still in the box, one by one',
  'ad.xls.gommeRestantesHint':
    '{n} of the {total} area(s) wiped by the eraser are still in the box at export time: the gesture reads on what remains to be seen as on what has left.',
  'ad.xls.gommeRestantesNote':
    'The line “Areas wiped by the eraser still in the box” counts, at click time, the areas the small eraser wiped and that a thread in the box still carries — read on the same device memory as the messaging pill. It sits just before the span line, and the names below it list those areas one by one. The file name carries, next to the weight of the gesture, the count of those still in the box — “-1-restante” — then the count of those that left it — “-hors-boite-1” — so two exports of the same day, before and after a departure, no longer look alike.',
  'ad.xls.gommeHorsSens': 'Direction of the departures line',
  'ad.xls.gommeHorsSensRecent': 'most recently wiped first',
  'ad.xls.gommeHorsSensAncien': 'most anciently wiped first',
  'ad.xls.gommeHorsSensMois':
    'The {n} departure(s), by month of erasure (most recent first): {list} — the waves of the gesture read at a glance.',
  'ad.xls.gommeHorsSensMoisListe': 'These departures, by month of erasure',
  'ad.xls.gommeHorsSensNote':
    'The row “Direction of the departures line” repeats the direction the wiped-areas line was reading in the messaging screen at the moment of the click, read from the same device memory: most recently wiped first, or most anciently when the line was reversed. Two exports of the same day, made before and after a reversal, therefore no longer carry the same sentence; the hover of the button that reverses the line says how many departures each month carried.',
  'ad.xls.gommeSpan': 'First and last erase gesture',
  'ad.xls.gommeSpanValue': '{premier} → {dernier} · {n} day(s)',
  'ad.xls.gommeSpanOne': '{date} · a single gesture kept',
  'ad.xls.gommeSpanNone': 'no erasure on this device',
  'ad.xls.gommeSpanNote':
    'The “First and last erase gesture” row reads, from the same device memory as the erasure pill, the day of the first erasure kept and that of the last, with the day gap between them. The first day is never reset: two exports of the same day, made before and after an erasure, no longer carry the same gap.',
  'ad.xls.airesJourFilsHint':
    'The {fils} thread(s) carried by the areas extracted today, one by one: {detail}. Hovering gives the detail thread by thread, like the messaging pill.',
  'ad.xls.airesJourAireFilsHint': '{region} · {n} thread(s) carried — {detail}.',
  'ad.xls.airesJourAireNoThread': '{region} · no thread in the box.',
  'ad.xls.airesJourNoThread': 'no thread in the box',
  'ad.xls.airesJourFilsNote':
    'Under the “Areas extracted today” line, each area carries the count of its threads and, on hover, their names one by one — the same detail as the messaging pill, read from the same device memory. The column after each name says how many threads that area carried.',
  'ad.xls.airesJour': 'Areas extracted today still in the box at export',
  'ad.xls.airesJourList': 'Those areas extracted today, one by one',
  'ad.xls.airesJourNote':
    'The “Areas extracted today” row counts, at export time, the areas carried by the console conversations whose thread extract carries today’s date, read from the same device memory as the messaging pill. It, and the names below it, lead to the console messaging narrowed to those areas: the day’s gesture reopens in one click, without hunting for the box. Two exports of the same day, made before and after an extract, no longer carry the same figure. The “oldest extract first” sort, set on the messaging thread row, is named in the “List filter” row with the account leading its order, and its hover says how many days separate the oldest extract from the most recent. In messaging, a pill counts those same areas and names on hover the threads they carried, one by one; its small eraser clears the date of every area in the box, whatever its day, and the synthesis then counts them as never extracted.',
  'ad.xls.airesTightJour': 'Areas narrowed in messaging — last extract of each',
  'ad.xls.airesTightJourList': 'Those areas and their last extract',
  'ad.xls.airesTightJourListHint':
    'Each area and the date of its last extract read on this line, in world order; a click on the date opens messaging narrowed to those same areas, and every area keeps its own line where its date opens on that area alone.',
  'ad.xls.airesTightJourRow': '{region} · last extracted on {date}',
  'ad.xls.airesTightJamaisRow': '{region} · never extracted',
  'ad.xls.airesTightOldest': 'Oldest extract date among these areas',
  'ad.xls.airesTightOldestNone': 'no extract',
  'ad.xls.airesTightOldestNote':
    'The “Oldest extract date among these areas” row gives, at the head of the narrowing, the oldest extract of the retained areas — or the words “no extract” when none has been extracted yet. Like the areas row, it opens the messaging narrowed to those same areas: the date reads and opens. Hovering each area name adds its age in days to its thread count — “extracted 12 days ago” —, so the narrowing is judged without leaving the workbook.',
  'ad.xls.airesTightAgeToday': 'Extracted today.',
  'ad.xls.airesTightAgeDays': 'Extracted {n} day(s) ago.',
  'ad.xls.airesTightAgeJamais': 'Never extracted.',
  'ad.xls.airesTightTodayNote':
    'The filename also counts, right after the areas still without an extract, those whose extract carries today’s date — “-releve-aujourdhui-2” —, so two exports from the same day differ by what has just been extracted. The small eraser on the thread line resets the extracts of those areas only: their date is forgotten, they leave the notebook of areas carried by an all-areas extract, and the pill calls them never extracted again — the other areas on this device and the all-areas gesture count do not move.',
  'ad.xls.airesTightFils': 'Threads the narrowed areas leave in messaging',
  'ad.xls.airesTightFilsTotalHint':
    'The narrowed areas leave {fils} thread(s) in the box together · {n} area(s) — the weight of the narrowing reads on that row itself, without scrolling down to the thread count.',
  'ad.xls.airesTightFilsHint':
    '{region} · {n} thread(s) in the box — the figure reads on hover, without opening messaging.',
  'ad.xls.airesTightFilsParAireHint':
    '{n} thread(s) in all, area by area: {detail} — each area’s weight reads here, without descending to its rows.',
  'ad.xls.airesTightFilsNote':
    'The line “Threads the narrowed areas leave in messaging” counts, at the moment of the click, the threads in the box with a participant standing in one of these areas — a thread counts once, even when two areas name it. Hovering each area name shows its own thread count without opening messaging. The filename carries, right after the area count, the number of threads they leave together — “aires-2-7-fils” —, then each area’s own thread count, one by one, in world order — “par-aire-maghreb-4-golfe-3” —, then the oldest extract age in days and the oldest extract date as day-month, so it reads at a glance in a downloads folder. The areas row carries that same total on hover, so the narrowing is weighed on the row itself. Its hover also gives the area-by-area detail — “Maghreb 4 · Golfe 3” —, and the filename counts, right after the oldest date, the areas still without an extract — “-sans-releve-2”.',
  'ad.xls.airesTightJourNote':
    'The “Areas narrowed in messaging” row repeats the areas the box was narrowed to at click time, with the day of their last thread extract read on this device — or the words “never extracted”. Each area is named on its own row, and that name opens the messaging narrowed to that single area. The row disappears when no area was narrowed: the summary then carries one row fewer and nothing else moves.',
  'ad.xls.reviewJournalSheet': 'Review journal',
  'ad.xls.reviewJournalN': 'No.',
  'ad.xls.reviewJournalThread': 'Thread reviewed',
  'ad.xls.reviewJournalCompte': 'Account',
  'ad.xls.reviewJournalMail': 'Account e-mail',
  'ad.xls.reviewJournalTime': 'Opening time',
  'ad.xls.reviewJournalSince': 'Minutes since the first opening',
  'ad.xls.reviewJournalGap': 'Reply delay',
  'ad.xls.reviewJournalLast': 'Last message on (time)',
  'ad.xls.visitLength': 'Length of the visit',
  'ad.xls.reviewJournalCompteNote':
    'This workbook is the review journal narrowed to a single account: it opens one row per sleeping thread of that account reviewed during the visit, in opening order, with the hour, the minutes since the first opening, the reply delay and the last message. The bottom recalls the bounds of the visit, to date it without opening the whole workbook. It holds only what the record could read, and clears with the visit.',
  'ad.xls.reviewJournalEmpty': 'No sleeping thread was reviewed during this visit.',
  'ad.xls.reviewJournalSummary': 'Visit summary',
  'ad.xls.reviewJournalReviewed': 'Threads reviewed during the visit',
  'ad.xls.reviewJournalFirstOpen': 'First opening',
  'ad.xls.reviewJournalLastOpen': 'Last opening',
  'ad.xls.reviewJournalSpan': 'Gap between the first and the last opening',
  'ad.xls.reviewJournalSpanMin': '{n} min',
  'ad.xls.reviewJournalSpanHour': '{h} h {m}',
  'ad.xls.reviewJournalSummaryNote':
    'The bottom of the journal says how many sleeping threads were reviewed during the visit and the gap between the first and the last opening: the length of the visit reads at a glance, without comparing two exports. The gap is measured on the openings kept, it says nothing about the threads’ reply time.',
  'ad.xls.reviewJournalNote':
    'The “Review journal” sheet opens one row per sleeping thread reviewed during this visit, in the order they were opened from the messaging, with the account they belong to, with their average reply delay — the same measure and the same threshold as the sleeping badge — the hour at which the thread was opened, to date the review to the minute, the minutes elapsed since the first opening of the visit, to place each thread inside the review, and the date and hour of their last message — so the thread’s wait compares with the moment it was reviewed —, with the account address next to its name so it can be copied without opening the record. It stays empty when nothing has been reviewed, and clears with the visit.',
  'ad.xls.revueNote': 'The file name carries the review state — “revue-3-sur-8” for example — so two exports from the same day are told apart without opening the workbook. The review counts the sleeping threads opened from the messaging during this visit. It also carries the length of the visit — “-duree-42min” for example — right after the number of threads reviewed, so two exports of the same review stopped later no longer share a name. It also carries the account leading the active messaging sort — “-tete-revue-…” or “-tete-apres-…” — whenever one of the two orders is on.',
  'ad.xls.revuedNote': 'The “Reviewed during the review” column counts, for each account, the sleeping threads opened from the messaging during this visit — the same session memory as the on-screen “reviewed” marker. It stays at zero when nothing has been reviewed, and clears with the visit.',
  'ad.xls.lastRelance': 'Last follow-up prepared',
  'ad.xls.relanceNote': 'The “Last follow-up prepared” column, the “Arrived after the follow-up” column and the follow-up counters in the summary come from this device’s memory: they date the last message opened from the console, not a send. The “Arrived after the follow-up” column of the “Accounts” sheet reads that same memory. The “Accounts with no follow-up prepared” row counts, across both tables, the accounts the file carries for which no message has been opened.',
  'ad.xls.withLate': 'Accounts with a long review',
  'ad.xls.lateRows': 'Listings in long review',
  'ad.xls.relancesToday': 'Accounts followed up today',
  'ad.xls.relancesWeek': 'Accounts followed up this week',
  'ad.xls.afterRelanceRows': 'Listings that arrived after a follow-up',
  'ad.xls.afterRelanceLateRows':
    'Of which listings after a follow-up already in long review',
  'ad.xls.afterRelanceAccounts': 'Accounts with a listing that arrived after a follow-up',
  'ad.xls.sansRelance': 'Accounts with no follow-up prepared',
  'ad.xls.lateCol': 'Long reviews',
  'ad.xls.lateComptes': '● {n} listing(s) in long review',
  'ad.xls.lateRowMark': '● in long review',
  'ad.xls.comptesLateNote': 'The “Accounts” sheet opens, under each account, one row per listing still in long review with its age; the column before it only shows the accounts that still have one.',
  'ad.xls.lateComptesSheet': 'Accounts in long review',
  'ad.xls.lateAccountCount': 'Long reviews',
  'ad.xls.oldestDepot': 'Oldest listing',
  'ad.xls.lateComptesSheetEmpty': 'No account has a listing in long review.',
  'ad.xls.lateComptesSheetNote': 'The “Accounts in long review” sheet opens one row per account still waiting, with the number of its listings and the oldest of them — its type, its date and its age, plus the prepared follow-up when one exists. Its rows follow the order chosen on screen: when the list is sorted by long reviews, the busiest account opens the file. The oldest listing’s title opens its row in the console’s “Listings” tab.',
  'ad.xls.lateOnlyNote': 'This workbook holds only one account’s listings still in review for more than seven days, with their age and the prepared follow-up date; that date comes from this device’s memory, not a send.',
  'ad.xls.afterRelance': 'Arrived after the follow-up',
  'ad.xls.afterRelanceYes': '● arrived after the follow-up',
  'ad.xls.afterRelanceNo': 'before the follow-up',
  'ad.xls.afterRelanceComptes': '● {n} listing(s) arrived after the follow-up',
  'ad.xls.afterRelanceRank': 'rank {r} / {t}',
  'ad.xls.comptesDetache': '“Accounts” sheet left in table order',
  'ad.xls.comptesPromoOrder': '“Accounts” sheet sorted by promotion, oldest first',
  'ad.xls.comptesPromoOrderRecent': '“Accounts” sheet sorted by promotion, most recent first',
  'ad.xls.afterSheet': 'Listings after follow-up',
  'ad.xls.afterSheetEmpty': 'No listing from this account arrived after the follow-up.',
  'ad.xls.afterSheetNote': 'This workbook holds only one account’s listings dated after the prepared follow-up; the follow-up date comes from this device’s memory, not a send. The “Since the follow-up” block recalls how many of them arrived, how many already need an answer for more than seven days, and the account’s rank among those that received such listings — the same measure as the record.',
  'ad.xls.afterSheetSummary': 'Since the follow-up',
  'ad.xls.afterSheetLate': 'Of which already in long review',
  'ad.xls.afterSheetRank': 'Rank among accounts',
  'ad.xls.lateSheet': 'Long reviews',
  'ad.xls.lateSheetEmpty': 'Nothing has been waiting for an answer for more than seven days.',
  'ad.xls.lateNote': 'The “Long reviews” tab opens one row per listing still unanswered for more than seven days, with its age, its follow-up date, the “arrived after the follow-up” marker and the address of the account that posted it. The follow-up date comes from this device’s memory, like the “Last follow-up prepared” column; it stays empty when no message has been opened. Its rows follow the order chosen on screen: sorted by listings arrived after the follow-up, accounts follow the same way and each account keeps its listings from oldest to newest.',
  'ad.xls.indentedNote': 'In the “Subscribers” sheet, the “Long reviews” column opens under each account one row per listing still unanswered, indented, with its age, type and posting date. When a follow-up has been prepared for the account, an indented row comes first and recalls how many listings arrived after it, with the account’s rank among those that received such listings — the same measure as the record.',
  'ad.xls.accountMail': 'Account (e-mail)',
  'ad.xls.depot': 'Listing',
  'ad.xls.type': 'Type',
  'ad.xls.rubrique': 'Section',
  'ad.xls.postedOn': 'Posted on',
  'ad.xls.ageDays': 'Age (days)',
  'ad.xls.relanceOn': 'Follow-up prepared on',
  'ad.xls.note': 'Workbook read from the console rows: every subscription keeps the plan, the amount, the due date and the payment channel shown on screen, with its published and refused listings.',

  'ad.f.stamp': 'Account record',
  'ad.f.title': 'Account record',
  'ad.f.close': 'Close',
  'ad.f.loading': 'Loading the record…',
  'ad.f.err': 'The record could not be loaded.',
  'ad.f.identity': 'Identity',
  'ad.f.mail': 'E-mail',
  'ad.f.phone': 'Phone',
  'ad.f.role': 'Role',
  'ad.f.roleAdmin': 'Administrator',
  'ad.f.roleOther': 'Ordinary account',
  'ad.f.abo': 'Subscriptions',
  'ad.f.aboEmpty': 'No subscription attached to this account.',
  'ad.f.aboPayHint':
    'This subscription’s collection state, read with the same rule as the “Payments” screen: open, priced and chargeable.',
  'ad.f.aboPayOpenHint':
    'Opens the “Payments” screen narrowed to this account, with the same rule as this badge.',
  'ad.f.aboRegler': '{n} to settle',
  'ad.f.aboReglerHint':
    'Opens the “Payments” screen narrowed to this account and to this single view: the subscriptions that cannot be collected yet.',
  'ad.f.aboPrets': '{n} collectable',
  'ad.f.aboPretsHint':
    'Opens the “Payments” screen narrowed to this account and to the “Collectable” view, already sorted by highest amount: the open, priced subscriptions chargeable as they stand, the most profitable first.',
  'ad.f.aboNone': 'Subscriptions: none',
  'ad.f.annonces': 'Listings',
  'ad.f.annoncesEmpty': 'No listing from this account.',
  'ad.f.publies': 'published',
  'ad.f.refuses': 'refused',
  'ad.f.attente': 'in review',
  'ad.f.demandes': 'B2B requests',
  'ad.f.demandesEmpty': 'No B2B request sent by this account.',
  'ad.f.copy': 'Copy the address and summary',
  'ad.f.copyHint':
    'Copies the account address, every subscription with its amount and due date, and the number of published, refused and long-review listings.',
  'ad.f.depotNone': 'no listing',
  'ad.f.depotNoneCopy': 'Listings: none',
  'ad.f.lateCopy': 'in long review',
  'ad.f.lateCopyNone': 'no long review',
  'ad.f.depotToday': 'posted today',
  'ad.f.depotSince': 'waiting {n} d',
  'ad.f.depotSinceHint':
    'Days since the deposit: past seven days without an answer, the badge lights up.',
  'ad.f.lateLink': 'View its {n} listings in long review',
  'ad.f.lateLinkHint':
    'Opens the “Listings” tab narrowed to this account’s deposits in review for more than seven days.',
  'ad.f.lateSheet': 'Workbook of its long reviews',
  'ad.f.lateSheetHint':
    'Downloads a workbook narrowed to this account’s deposits in review for more than seven days, with their date, age and prepared follow-up.',
  'ad.f.afterRelance': '{n} listing(s) arrived after the follow-up',
  'ad.f.afterRelanceNone': 'no listing after the follow-up',
  'ad.f.afterRelanceRank': 'rank {r} of {t}',
  'ad.f.afterRelanceRankHint':
    'Rank of this account among those with a listing that arrived after their follow-up: the first is the one the message covered least.',
  'ad.f.afterRelanceHint':
    'This account’s listings dated after the message was prepared: the follow-up does not cover them, they call for a separate read.',
  'ad.f.afterRelanceList': 'Listings that arrived after the follow-up',
  'ad.f.afterRelanceListLate':
    'Listings that arrived after the follow-up, already in long review',
  'ad.f.afterRelanceLateFilterHint':
    'One click narrows the list of listings that arrived after the follow-up to those already waiting for an answer for more than seven days; a second click opens it again.',
  'ad.f.afterRelanceOpen': 'Open this listing in the “Listings” tab',
  'ad.f.afterSheet': 'Workbook of its listings after follow-up',
  'ad.f.afterSheetHint':
    'Downloads a workbook narrowed to this account’s listings that arrived after the follow-up, with their date, age and state.',
  'ad.f.afterRelanceLate':
    'of which {n} in long review',
  'ad.f.afterRelanceLateHint':
    'Among the listings that arrived after the follow-up, those already waiting for an answer for more than seven days: the message did not cover them and the wait is already running.',
  'ad.f.prioCopy': 'Copy the priorities',
  'ad.f.prioCopyHint':
    'Copies a summary of the sleeping threads with their average delay, then the listings in long review with their wait — ready to paste into a message.',
  'ad.f.prioLateShort': 'listings in long review',
  'ad.f.prioLateLine': '{n} listing(s) in long review',
  'ad.f.prioLateNone': 'No long review: no listing has been waiting for more than seven days.',
  'ad.f.relance': 'Prepare a follow-up',
  'ad.f.relanceHint':
    'Opens a pre-filled message: the deposits still waiting with their age, and the account summary line.',
  'ad.f.lastRelance': 'Last follow-up prepared',
  'ad.f.priorites': 'Priorities',
  'ad.f.weekExport': 'Exported this week',
  'ad.f.weekExportOpen': 'Open payments to produce the export',
  'ad.f.weekExportHint':
    'Count of the table exports made in the last seven days, read from this device’s memory. One click opens the “Payments” screen narrowed to this account, to produce the missing export there.',
  'ad.f.weekScopeTitle': 'This week’s exports, on this account',
  'ad.f.weekScopeHint':
    'The exports of the last seven days, read on this account’s own scope: what its subscriptions weigh at the view and the reason of each file, and how many of its rows. Only the exports that carried at least one of its rows are kept.',
  'ad.f.weekScopeRows': '{n} row(s) of the account',
  'ad.f.weekScopeNone':
    'No export of the week carried this account: nothing to read on its scope.',
  'ad.f.weekScopeNoMemory':
    'No export known on this device: the week has nothing to read for this account.',
  'ad.f.weekScopeAvg': 'Average amount {n}',
  'ad.f.weekScopePeak': 'Peak {n} on {date}',
  'ad.f.weekScopePeakHint':
    'The export in which this account weighed heaviest during the week, and its date: the peak reads next to the average. A single export with an amount does not make a peak.',
  'ad.f.weekScopePeakOpenHint':
    'One click opens that export in “Payments”, narrowed to this account.',
  'ad.f.weekScopeAvgNote': 'over {n} export(s)',
  'ad.f.weekScopeAvgOpenHint':
    'One click opens the comparison of two of the week’s exports already chosen for this account — the oldest and the most recent that carried it — to read the amount and row gap between them.',
  'ad.f.weekScopeAvgHint':
    'Average of the amounts this account weighs, read on the week’s exports that carried it, at their view and their reason. Exports where it counted no row stay out of the average.',
  'ad.f.weekScopeOpen':
    'Open this export in “Payments”, narrowed to this account',
  'ad.f.weekScopeCmpTitle': 'Between two exports',
  'ad.f.weekScopeCmpFrom': 'Start',
  'ad.f.weekScopeCmpTo': 'End',
  'ad.f.weekScopeCmpUp': '+{n} on its own rows',
  'ad.f.weekScopeCmpDown': '−{n} on its own rows',
  'ad.f.weekScopeCmpFlat': 'amount unchanged',
  'ad.f.weekScopeCmpHint':
    'The gap is computed only on this account’s rows, read at each export’s view and reason: it says nothing about the whole table.',
  'ad.f.weekScopeCmpOpenHint':
    'One click opens this comparison in “Payments”, already chosen for this account.',
  'ad.f.weekScopeCmpNote':
    'The two most distant exports of the week that still carried rows of this account, with the amount gap of its own rows — not of the whole queue.',
  'ad.f.weekScopeCmpParties': 'Left −{n} on its rows',
  'ad.f.weekScopeCmpPartiesHint':
    'The amount the rows that left between the two exports took away from the account’s scope, found back in the table by their identifier.',
  'ad.f.weekScopeCmpPartiesUnknown':
    '{n} row(s) left that are no longer in the table: their amount can no longer be read, and is not included in the figure above.',
  'ad.f.weekScopeCmpPartiesList': 'The {n} departed row(s), one by one',
  'ad.f.weekScopeCmpPartiesListHint':
    'The rows that left between the two exports, named under the amount they withdrew, heaviest first: the record reads without opening the workbook. A row no longer in the table is not listed.',
  'ad.f.weekScopeCmpPartiesTotal': 'withdrawn −{n}',
  'ad.f.weekScopeCmpPartiesNoTotal': 'total unavailable',
  'ad.f.weekScopeCmpPartiesNoAmount': 'no amount',
  'ad.f.weekScopeCmpPartiesMajor':
    'Of these, {n} row(s) weigh on their own more than half of the total withdrawn ({t}).',
  'ad.f.weekScopeCmpPartiesMajorNone':
    'None of these rows weighs on its own more than half of the total withdrawn: the withdrawal is spread over several.',
  'ad.f.weekScopeCmpPartiesMajorHint':
    'Counted on the rows named in the list, not on the total of the parties: a row that is no longer in the table is not weighed here.',
  'ad.f.weekScopeCmpPartiesMajorOn': 'List narrowed to these {n} row(s)',
  'ad.f.weekScopeCmpPartiesMajorTokenHint':
    'One click narrows the departed rows list to those that on their own weigh more than half of the amount withdrawn; a second click restores it. The file follows the narrowed list.',
  'ad.f.weekScopeCmpPartiesMajorExitHint':
    'One click restores the full departed rows list, ordered by the amount withdrawn.',
  'ad.f.weekScopeCmpPartiesShare': 'Sharing the withdrawal · {n}',
  'ad.f.weekScopeCmpPartiesShareHint':
    'One click narrows the departed-row list to the rows that do not weigh more than half of the withdrawn amount on their own — the ones sharing the withdrawal; a second click restores it. The file follows the narrowed list.',
  'ad.f.weekScopeCmpPartiesShareOn': 'List narrowed to these {n} shared row(s)',
  'ad.f.weekScopeCmpPartiesShareExitHint':
    'One click restores the full departed rows list, ordered by the amount withdrawn.',
  'ad.f.weekScopeCmpPartiesShareNote':
    'The {n} shared row(s) share {p}% of the withdrawal · {s}',
  'ad.f.weekScopeCmpPartiesShareNoteHint':
    'The share of the withdrawal carried by the rows that do not weigh more than half on their own: their sum against the total withdrawn amount, as a percentage, and what they weigh in plain figures.',
  'ad.f.weekScopeCmpSheet': 'Comparison workbook',
  'ad.f.weekScopeCmpSheetHint':
    'Downloads a workbook narrowed to this account’s perimeter: the two exports with what it weighed in them, the amount and row gap of its own rows, then the rows that left with what each withdrew.',
  'ad.f.weekScopeCmpFils': 'Active threads at export',
  'ad.f.weekScopeCmpFilsSame':
    'The same count is read at both points: it describes the state of the account at export time, and is not derived from the difference between the two archives.',
  'ad.f.weekScopeCmpFilsNote':
    'The account’s conversations that answer in under a day, counted at the moment the workbook was produced: a state of the account, not a difference between the two exports.',
  'ad.f.weekScopeCmpPartiesMajorMark': 'over half',
  'ad.f.weekScopeCmpPartiesMajorLine': '{n} row(s) over half — reduced CSV',
  'ad.f.weekScopeCmpPartiesMajorLineHint':
    'Downloads as CSV only the rows that withdraw more than half the withdrawn amount on their own, with what each withdrew and their own total: the file carries only those rows, without narrowing the list on screen.',
  'ad.f.weekScopeCmpPartiesCsv': 'CSV of the departed rows',
  'ad.f.weekScopeCmpPartiesCsvHint':
    'Downloads as CSV only this account’s list of departed rows, as it reads under the withdrawn amount — heaviest first —, with the amount each withdrew and the total under the rows. A row that has left the table is not named: it is counted under the list.',
  'ad.f.revueTitre': 'This account’s review',
  'ad.f.revueFils': '{n} threads reviewed',
  'ad.f.revueOpenHint':
    'Opens the messaging narrowed to this account’s sleeping threads, in review mode: each thread opened marks the progress, without searching for the conversations in the list.',
  'ad.f.revueDebut': 'First opening',
  'ad.f.revueFin': 'Last opening',
  'ad.f.revueEcart': 'Gap',
  'ad.f.revueSheet': 'This account’s review journal',
  'ad.f.revueSheetHint':
    'One click opens the review journal narrowed to this account, with the hour and the minutes of every opening, the reply delay and the last message of each reviewed thread.',
  'ad.f.revueNote':
    'The sleeping threads of this account reviewed during the visit, with the hour of the first and of the last opening and the gap between them: the length of the visit reads here, without opening the workbook. The gap speaks of the review, not of the threads’ reply time.',
  'ad.f.sleepThreads': 'sleeping threads',
  'ad.f.sleepThreadsHint':
    'This account’s conversations that take a day or more to answer: they come ahead of the rest of the record.',
  'ad.f.sleepThreadsNone':
    'No sleeping thread: every conversation of this account answers in under a day.',
  'ad.f.allThreads': 'All threads',
  'ad.f.allThreadsOff': 'Sleeping only',
  'ad.f.allThreadsHint':
    'Opens the list to every thread of the account, active ones included: each line carries the same door to the thread as the account sees it.',
  'ad.f.allThreadsExitHint':
    'Closes the list back to the sleeping threads only, the ones that come before the rest of the sheet.',
  'ad.f.actifsThreads': 'active threads',
  'ad.f.actifsThreadsHint':
    'This account’s conversations that answer in under a day: they read next to the sleeping ones, without opening the list.',
  'ad.f.sleepOpen': 'Open the thread in the messaging',
  'ad.f.sleepOpenPublic': 'Open this thread',
  'ad.f.sleepOpenPublicHint':
    'Opens the thread as the account sees it, in another tab: the record stays in place behind.',
  'ad.f.relanceToday': 'today',
  'ad.f.relanceAgo': '{n} d ago',
  'ad.f.relanceSoonHint':
    'A follow-up was prepared less than three days ago: the wait has probably not changed, check before preparing another.',

  'ad.r.stamp': 'Follow-up',
  'ad.r.title': 'Pre-filled follow-up',
  'ad.r.lead': 'The message carries the deposits still waiting and the account summary line. Adjust it before sending; nothing leaves from here.',
  'ad.r.field': 'Message',
  'ad.r.subject': 'Your listings in review — {n} waiting',
  'ad.r.subjectLabel': 'Subject',
  'ad.r.greet': 'Hello,',
  'ad.r.greetNamed': 'Hello {nom},',
  'ad.r.intro': 'We are writing about {n} listing(s) still in review:',
  'ad.r.introAccount': 'We are writing about your account:',
  'ad.r.outro': 'We remain available for any further detail.',
  'ad.r.sign': 'The PaperAtlas team',
  'ad.r.copy': 'Copy the message',
  'ad.r.copyHint': 'Copies the message as written, ready to paste into your mail client.',
  'ad.r.mail': 'Open in mail',
  'ad.r.close': 'Close',

  'ad.ann.stamp': 'Listings and offers',
  'ad.ann.cardOrg': 'Org.',
  'ad.ann.cardCity': 'City',
  'ad.ann.cardBudget': 'Budget',
  'ad.ann.cardKind': 'Nature',
  'ad.ann.cardRubrique': 'Section',
  'ad.ann.kindOffre': 'Offer',
  'ad.ann.kindAnnonce': 'Listing',
  'ad.ann.cardMail': 'Email',
  'ad.ann.cardDate': 'Received',
  'ad.ann.sub': 'Every deposit, in its review state. Publishing puts the listing on the board; sending it back to review takes it off.',
  'ad.ann.all': 'All',
  'ad.ann.search': 'Search a title, an organisation, a city…',
  'ad.ann.open': 'Open this screen',
  'ad.ann.openHint':
    'Opens the public page of this listing in another tab: the list stays in place behind it.',
  'ad.ann.empty': 'No listing posted yet.',
  'ad.ann.none': 'No listing matches these filters.',
  'ad.ann.publish': 'Publish',
  'ad.ann.wait': 'Send back to review',
  'ad.ann.refuse': 'Refuse',
  'ad.ann.busy': 'Saving…',
  'ad.ann.err': 'The state change failed.',
  'ad.ann.kind': 'Type',
  'ad.ann.aboSoon': 'due date',
  'ad.ann.aboSoonHint':
    'This account’s subscription is falling due: follow up before the cut.',
  'ad.ann.soonChip': 'Accounts falling due',
  'ad.ann.soonEmpty': 'No listing from an account falling due.',
  'ad.ann.lateChip': 'In review > 7 d',
  'ad.ann.lateHint': 'Deposits still in review for more than seven days: they are waiting for an answer.',
  'ad.ann.lateEmpty': 'Nothing has been waiting for an answer for more than seven days.',
  'ad.ann.lateBadge': 'in review for {n} d',
  'ad.ann.sortLate': 'Review age',
  'ad.ann.sortLateHint':
    'Sorts listings by review age: the deposit that has been waiting the longest comes first.',
  'ad.ann.focus': 'Long reviews for {mail}',
  'ad.ann.focusClear': 'Show every listing',
  'ad.ann.focusRelance': 'Follow-up prepared on {date} · no answer received yet.',
  'ad.ann.relanceBtn': 'Prepare a follow-up',
  'ad.ann.relanceBtnHint':
    'Opens this account’s pre-filled message — waiting deposits and summary line — without leaving the tab.',
  'ad.ann.rowRelance': 'Follow-up on {date}',
  'ad.ann.rowRelanceHint':
    'Date of the last message prepared for this account: each deposit says whether it came before or after.',
  'ad.ann.rowRelanceBefore': 'this deposit came first',
  'ad.ann.rowRelanceAfter': 'posted after the follow-up',
  'ad.ann.focusAfter': '{n} listing(s) arrived after the follow-up',
  'ad.ann.focusAfterNone': 'no listing arrived after the follow-up',
  'ad.ann.focusAfterHint':
    'This account’s listings dated after the message was prepared: the follow-up does not cover them, they call for a separate read.',
  'ad.ann.focusDepot': 'Listing opened · {titre}',
  'ad.ann.focusAccountAll': 'Show every listing of the account',
  'ad.ann.afterChip': 'Arrived after the follow-up',
  'ad.ann.afterChipHint':
    'Keep only this account’s listings that arrived after its prepared follow-up, the ones the message does not cover.',
  'ad.ann.afterChipEmpty':
    'No listing from this account arrived after the follow-up: the message covers everything posted.',
  'ad.ann.sortAfter': 'Listings after the follow-up',
  'ad.ann.sortAfterHint':
    'Sorts the listings with those dated after the message prepared first, the ones the follow-up does not cover; the chosen order holds inside both groups.',
  'ad.ann.afterExport': 'Workbook of these listings',
  'ad.ann.afterExportHint':
    'Downloads a workbook narrowed to this account’s listings that arrived after the follow-up, with their date, age and state.',
  'ad.ann.afterExportEmptyHint':
    'No listing from this account arrived after the follow-up: there is nothing to open.',

  'ad.msg.stamp': 'Messaging',
  'ad.msg.sub': 'Every conversation on the platform: the list on the left, the messages on the right.',
  'ad.msg.empty': 'No conversation yet.',
  'ad.msg.none': 'No message in this thread.',
  'ad.msg.pick': 'Pick a conversation on the left to read the thread.',
  'ad.msg.loading': 'Loading the thread…',
  'ad.msg.err': 'The thread could not be loaded.',
  'ad.msg.reply': 'Reply',
  'ad.msg.replyNote': 'The reply goes by e-mail: writing inside a member’s thread stays reserved to its two participants.',
  'ad.msg.sleeping': 'sleeping',
  'ad.msg.sleepHint': 'Conversations that take a day or more to answer',
  'ad.msg.sleepOnly': 'Sleeping only',
  'ad.msg.sleepOnlyHint':
    'Keep only the conversations that take a day or more to answer, for the length of a review; a second click opens the whole list again. The choice is kept from one visit to the next.',
  'ad.msg.sleepOnlyOn': 'Review narrowed to sleeping threads',
  'ad.msg.sleepNone':
    'No sleeping thread: every one of these conversations answers in under a day.',
  'ad.msg.openCompte': 'Open the account record',
  'ad.msg.openCompteHint':
    'Moves from the open thread to the account record: its subscriptions, deposits and priorities, without going back through the subscribers table.',
  'ad.msg.openThread': 'Open this thread',
  'ad.msg.openThreadHint':
    'Opens the thread as the account sees it, in another tab: the console list stays in place behind.',
  'ad.msg.reviewed': 'reviewed',
  'ad.msg.reviewedOne': 'reviewed',
  'ad.msg.reviewHint':
    'Sleeping threads already opened during this visit: the marker tells where the review stopped. It clears when the visit ends.',
  'ad.msg.reviewClearHint':
    'Clears the markers of this review; the list, the filter and the open thread stay as they are.',
  'ad.msg.reviewGaugeHint':
    'Sleeping threads already reviewed out of the sleeping threads the list counts: the gauge follows the sleeping filter and moves forward with each thread opened.',
  'ad.msg.restant': 'left to review',
  'ad.msg.restantOnly': 'Left to review',
  'ad.msg.restantHint':
    'Keep only the sleeping threads not yet opened during this visit; a second click opens the whole list again. The chip follows the current review and is not kept from one visit to the next.',
  'ad.msg.restantOnlyOn': 'Review narrowed to sleeping threads not yet reviewed',
  'ad.msg.restantEmpty':
    'Every sleeping thread has been reviewed during this visit: none is left to open.',
  'ad.msg.restantAllDone': 'All reviewed',
  'ad.msg.restantNoneHint':
    'Every sleeping thread has been opened during this visit; the markers clear with it.',
  'ad.msg.copyMail': 'Copy the address',
  'ad.msg.participants': 'Participants',
  'ad.msg.count': 'messages',
  'ad.msg.sortLabel': 'Sort',
  'ad.msg.sortReview': 'Review',
  'ad.msg.sortReviewHint':
    'One click puts the sleeping threads never opened during this visit first, then the sleeping threads already reviewed, then the rest; a second click returns to the list order.',
  'ad.msg.sortApres': 'After follow-up',
  'ad.msg.apres': 'after follow-up',
  'ad.msg.apresOnly': 'After follow-up only',
  'ad.msg.apresOnlyHint':
    'Keep only the threads whose account posted something since its follow-up message — the ones the message does not cover; a second click opens the whole list again. The choice is kept from one visit to the next, and the small eraser opens the whole list.',
  'ad.msg.apresClearHint':
    'Clears the list chips — sleeping, left to review and after follow-up — to start again from the whole list. The gesture is kept from one visit to the next.',
  'ad.msg.apresOnlyOn': 'Review narrowed to threads whose account posted since the follow-up',
  'ad.msg.apresEmpty':
    'No thread in the list has a listing that arrived after the follow-up: the message covers everything posted.',
  'ad.msg.sortAire': 'By area',
  'ad.msg.sortAireHint':
    'One click groups the list under the name of each world area, in area order; participants with no known area close the list. A second click returns to the list order.',
  'ad.msg.sortAireGroups': '{n} areas',
  'ad.msg.sortRecent': 'Most recently copied',
  'ad.msg.sortRecentHint':
    'One click puts first the threads of the areas whose extract left this device most recently, freshest first ; areas never copied and unknown areas close the list. A second click returns to the list order.',
  'ad.msg.sortJamais': 'Area never extracted first',
  'ad.msg.sortJamaisHint':
    'One click puts first the threads of the areas no extract has carried yet — neither whole nor one by one —, in the order of the world areas: the areas still in the box come back at once. Areas already extracted and unknown areas close the list. A second click returns to the list order.',
  'ad.msg.aireGroupNone': 'No known area',
  'ad.msg.sortAncien': 'Oldest extract first',
  'ad.msg.sortAncienHint':
    'One click puts first the threads of the areas whose extract left this device longest ago, the oldest first: whatever has waited longest comes back at once. Areas never extracted and threads with no known area, which carry no date, close the list. A second click returns to the list order.',
  'ad.msg.sortGomme': 'Most recently wiped first',
  'ad.msg.sortGommeHint':
    'One click brings up the threads of the areas the small eraser has just wiped, the most recently wiped first: what was just handed back is found at once. Areas never wiped and contacts without a known area, which carry no date, close the order. A second click returns the list to its own order.',
  'ad.msg.sortGommeAncienne': 'Most long-ago wiped first',
  'ad.msg.sortGommeAncienneHint':
    'One click brings up the threads of the areas the small eraser left blank the longest ago, the earliest wiped first: what has waited to be refreshed is found at once. Areas never wiped and contacts without a known area, which carry no date, close the order. A second click returns the list to its own order.',
  'ad.msg.aireGroupOne': '1 thread',
  'ad.msg.aireGroupCount': '{n} threads',
  'ad.msg.aireGroupTitleHint':
    'Press to keep only this area’s threads; a second press hands every thread back.',
  'ad.msg.aireGroupCopy': 'Copy the digest',
  'ad.msg.aireGroupCopyHint':
    'Copies the digest of the {region} area’s {n} threads — the area, its files, then each thread with its participant — and dates the last copy.',
  'ad.msg.aireGroupCopyLine': 'Digest · {region} · {files} {unit} · {n} threads',
  'ad.msg.aireGroupCopyRow': '- {nom} · {sujet}',
  'ad.msg.aireGroupLastCopy': 'Last copy · {date}',
  'ad.msg.aireGroupLastCopyHint':
    'The day the {region} area digest last left this device.',
  'ad.msg.aireOn': 'Area kept · {n}',
  'ad.msg.aireClear': 'All threads',
  'ad.msg.aireTraySpan': '{pays} countries · {files} {unit}',
  'ad.msg.aireTraySpanHint':
    'The reach of the {region} area: its countries and its weight in the directory, set beside the count of threads it leaves in the box.',
  'ad.msg.threadAireHint':
    '{region}: the area of this thread, read from its account’s country.',
  'ad.msg.threadAireNarrowHint':
    '{region}: press to keep only this area’s threads; a second press hands every thread back.',
  'ad.msg.threadAireHoldHint':
    '{region}: press to keep only this area’s threads, a long press copies its digest; a second press hands every thread back.',
  'ad.msg.threadAireCopiedHint':
    'This area’s digest is copied, ready to paste into a message.',
  'ad.msg.aireGroupCountHint':
    '{region} · {pays} countries · {files} {unit} · {n} : the reach of the area and its weight in the directory, read with the thread count.',
  'ad.msg.relevesAll': 'Copy every digest',
  'ad.msg.relevesAllHint':
    'Copies the threads of every area in the box one after another — a heading per area, its records, then each thread with its counterpart — that is {n} threads across {a} areas, and dates each digest.',
  'ad.msg.relevesAllCount': 'digests',
  'ad.msg.relevesAllLast': 'Last · {date}',
  'ad.msg.relevesAllCountHint':
    'How many times the digest of every area has left this device, and the day of the last time ({date}): the whole-box gesture is counted apart from single-area digests.',
  'ad.msg.relevesAllAires': '{n} areas',
  'ad.msg.relevesAllAiresHint':
    'The {n} areas already carried at least once by a whole-box digest: {list}.',
  'ad.msg.relevesAllClearHint':
    'Sets the whole-box digest tally back to zero: the counted areas are forgotten, the groups’ dates stay.',
  'ad.msg.relevesAllClearHintCount':
    'Clears {n} whole-box digests and {a} counted areas, leaving the groups’ dates untouched: every area header keeps its last digest.',
  'ad.msg.airesJamaisWords': 'areas never copied',
  'ad.msg.airesJamaisNone': 'Every area has been copied',
  'ad.msg.airesJamaisHint':
    'The areas still in the box that no digest has carried yet, neither whole-box nor one by one: {list}.',
  'ad.msg.airesJamaisNoneHint':
    'Every area in the box has already left the console at least once, in a whole-box digest or in a single-area digest.',
  'ad.msg.airesJamaisOpenHint':
    '{n} areas never copied: press to keep only the threads of {region}, the first of them; press again for the next one. Still to copy: {list}.',
  'ad.msg.relevesCheminsHint':
    'Single-area digests, split by path: {h} sent from a group header, {l} carried by a long press on a thread pill. The whole-box digest keeps its own tally.',
  'ad.msg.relevesCheminsEntete': '{n} headers',
  'ad.msg.relevesCheminsLigne': '{n} lines',
  'ad.msg.relevesCheminsClearHint':
    'Clears {h} extracts sent from a group header and {l} taken from a long press on a row, without touching the group dates : every area header keeps its last extract. The all-areas extract keeps its own count.',
  'ad.msg.threadAireCheminEntete':
    'Extract already sent from a group header · {date}.',
  'ad.msg.threadAireCheminLigne':
    'Extract already sent from a row, by long press · {date}.',
  'ad.msg.threadAireCheminBoth':
    'Extract already sent from a header ({entete}) and from a row ({ligne}).',
  'ad.msg.threadAireCheminEnsemble':
    'Extract already sent by the all-areas gesture · {date}.',
  'ad.msg.threadAireCheminNone': 'Extract never sent yet.',
  'ad.msg.relevesCheminsCleared': '{n} digests erased',
  'ad.msg.relevesCheminsClearedHint':
    'The number of gestures the two-path eraser has just removed — those sent from a group header and those carried from a line —, with the group dates left untouched.',
  'ad.msg.relevesAllCleared': '{n} whole digests erased · {a} areas forgotten',
  'ad.msg.relevesAllClearedHint':
    'The number of gestures and areas the whole-digest eraser has just removed: the header count falls back to zero, while the group dates and the two paths stay as they were.',
  'ad.msg.recentJamaisLine':
    '{n} areas never copied close the list — {list}.',
  'ad.msg.recentJamaisLineNone':
    'Every area has been copied: nothing closes the list any more.',
  'ad.msg.recentJamaisLineHint':
    'The “most recently copied” order puts first the areas whose digest has just left the box: those no digest has carried yet close the walk, and are counted here.',
  'ad.msg.jamaisLine':
    '{f} threads open the list · {a} areas never extracted — {list}.',
  'ad.msg.jamaisLineNone':
    'Every area has been extracted: no thread stands at the head any more.',
  'ad.msg.jamaisLineHint':
    'The “area never extracted first” order puts the threads of areas no digest has carried yet at the head: their number reads here beside the area count, then the areas themselves in world order.',
  'ad.msg.airesTightOn': 'Workbook areas · {n}',
  'ad.msg.airesTightTitle': 'Areas never extracted · {n}',
  'ad.msg.airesTightClear': 'All areas',
  'ad.msg.airesTightGomme': 'Erase',
  'ad.msg.airesTightGommeHint':
    'Returns every workbook area in one gesture: the box shows all its threads, and the choice kept on this device stays intact — the next visit finds the same areas again.',
  'ad.msg.airesTightGommeHintCount':
    'Returns all {n} workbook area(s) in one gesture — their {fils} thread(s) come back into the box —, without touching the choice kept on this device: the next visit finds the same areas again.',
  'ad.msg.airesTightHint':
    'The box is narrowed to the areas the subscribers workbook named — {n} area(s), {jamais} of them never extracted yet, and {fils} thread(s) they leave in the box, in world order: {list}. The cross gives every thread back, without touching the choice kept on this device.',
  'ad.msg.airesTightRelevesGommeHint':
    'Resets the extracts of these {n} area(s) only — {relevees} of them still carry a date, {jamais} never had one —, without touching the other areas on this device, the narrowing, or the all-areas extract count: the pill calls them never extracted again, and the workbook counts them the same way. The areas made blank again, one by one: {list}.',
  'ad.msg.airesTightRelevesGommeHintEmpty':
    'None of these {n} area(s) carries an extract date yet: the eraser would have nothing to clear. The narrowing and the other areas on this device stay as they are.',
  'ad.msg.airesTightRelevesCleared': '{n} area(s) cleared',
  'ad.msg.airesTightRelevesClearedHint':
    'The number of workbook areas whose extract date has just been erased: they also leave the notebook of areas carried by an all-areas extract, the other areas keep theirs, and the all-areas gesture count does not move.',
  'ad.msg.airesJourWords': 'areas extracted today',
  'ad.msg.airesJourFils': '{n} thread(s) carried',
  'ad.msg.airesJourAireDetail': '{region}: {fils}',
  'ad.msg.airesJourNoThread': 'no thread in the box',
  'ad.msg.airesJourPillHint':
    'The {n} areas in the box whose thread extract carries today’s date, with the {fils} thread(s) they carried, one by one: {detail}. The small eraser clears the date of every area in the box, whatever its day.',
  'ad.msg.airesJourGommeHint':
    'Erases the extract date of the {n} areas in the box, whatever their day — {relevees} of them still carry one —, without touching areas absent from the box, the narrowing, or the all-areas gesture count: the workbook synthesis then counts them as never extracted.',
  'ad.msg.airesJourCleared': '{n} area(s) left without a date out of {a}',
  'ad.msg.airesJourClearedHint':
    'The number of areas in the box whose extract date has just been erased, out of all the areas it carries: they also leave the notebook of areas carried by an all-areas extract, and the workbook synthesis counts them as never extracted.',
  'ad.msg.gommesTally': '{n} erasure(s) · last gesture {date}',
  'ad.msg.gommesWords': 'extract erasures',
  'ad.msg.gommesLast': 'last gesture {date}',
  'ad.msg.gommesTallyHint':
    'From this device, the small extract eraser has left areas blank {n} time(s) and erased the date of {aires} area(s); the last gesture was on {date}. The count sits beside the areas-extracted-today pill and stays visible when the pill has nothing left to report.',
  'ad.msg.gommesSpan':
    'From the first gesture kept, on {premier}, to the last, on {dernier}, {n} day(s) separate the extract erasures: the wiping is read over time, not only on its latest date.',
  'ad.msg.gommesFils': '{n} thread(s) from the last erasure',
  'ad.msg.gommesFilsHint':
    'The threads the box held in the areas the last erasure left blank — areas-extracted-today pill or thread line — at the moment of the click: the gesture states its weight, not just its count.',
  'ad.msg.gommesFilsEncore':
    'Of those areas, {n} wiped by the eraser are still in the box — {list} — so the gesture reads on what is left to see.',
  'ad.msg.gommesFilsParties':
    'Of those areas, {n} wiped by the eraser are no longer in the box — {list} — so the gesture also reads on what has left the list.',
  'ad.msg.gommesEncore': '{n} still in',
  'ad.msg.gommesParties': '{n} gone',
  'ad.msg.gommesSplitBouts':
    'last · {recent} {dateRecent} — oldest gone · {vieux} {dateVieux}',
  'ad.msg.gommesSplitBoutsNone': 'none of the wiped areas has left yet',
  'ad.msg.gommesSplitBoutsHint':
    'The two ends of the split, set on the pill: the area wiped last, and the one that left earliest — {vieux}, on {dateVieux}. The split reads end to end without hovering.',
  'ad.msg.gommesSplitBoutsNoneHint':
    'Every area wiped by the last eraser is still in the box: none has left, so there is no oldest one to name.',
  'ad.msg.gommesNoneAreas': 'none',
  'ad.msg.gommesSplitHint':
    'How the last erasure split the areas it wiped, set on the pill so it reads without hovering: {encore} are still in the box — {listeEncore} — and {parties} have left it — {listeParties}. Both figures are read on the box as it stands, so they cannot contradict each other.',
  'ad.msg.gommeHorsCopy': 'Copy these areas',
  'ad.msg.gommeHorsCopyHint':
    'Copies the list of the {n} area(s) the eraser wiped that are no longer in the box, most recently wiped first, each with the day of its gesture — ready to paste into a message.',
  'ad.msg.gommeHorsCopyHead':
    'Areas wiped by the eraser that left the box ({n} of {total})',
  'ad.msg.recapGommeTete': 'last wiped · {region} · {date}',
  'ad.msg.recapGommeTeteHint':
    'The inverse-sort gauge names the area the small eraser wiped last, with the day of its gesture: the freshest gesture reads above the line of departed areas, without hovering.',
  'ad.msg.gommeHorsLine':
    '{n} area(s) wiped by the eraser are no longer in the box, most recently wiped first — {list}.',
  'ad.msg.gommeHorsLineNone':
    'Every area wiped by the eraser is still in the box: none has left.',
  'ad.msg.gommeHorsLineHint':
    'Under the inverse sort, the areas the small eraser wiped and that the box no longer holds, most recently wiped first, each with the day of its last gesture: the gesture reads on what has left the list as well as on what stays.',
  'ad.msg.recapGomme': 'Inverse sort · most recently wiped first',
  'ad.msg.recapGommeHint':
    'Set on the recap line, this sort orders the threads of the areas the small eraser wiped from the freshest to the oldest. A second click flips the direction — from the longest-ago wiped to the most recently wiped — without going back to the sort bar. Areas never wiped and contacts without a known area, which carry no date, close the order.',
  'ad.msg.recapGommeSensRecent': 'freshest to oldest',
  'ad.msg.recapGommeSensAncien': 'oldest to freshest',
  'ad.msg.recapGommeSpan':
    'Across these areas, {n} day(s) separate the last area wiped — {recent}, on {dateRecent} — from the longest-ago wiped — {vieux}, on {dateVieux}: the gesture reads from one end to the other.',
  'ad.msg.gommeHorsLineAncienne':
    '{n} area(s) wiped by the eraser are no longer in the box, the most long-ago wiped first — {list}.',
  'ad.msg.gommeHorsSort': 'Oldest first',
  'ad.msg.gommeHorsSortMonths':
    '{n} departures, by month wiped (most recent first): {list} — the waves of the gesture read at a glance.',
  'ad.msg.gommeHorsSortHint':
    'A click flips the gone-areas line: the oldest departures come first, so they can be read in the order they happened. A second click returns to the most recently wiped first.',
  'ad.msg.gommeHorsCopyHintAncienne':
    'Copies the list of the {n} area(s) wiped by the eraser that are no longer in the box, the most long-ago wiped first, each with the day of its gesture — ready to paste into a message.',
  'ad.msg.gommeLine': '{n} area(s) wiped by the eraser — {list}.',
  'ad.msg.gommeLineAire': '{region} · {date}',
  'ad.msg.gommeLineHint':
    'Under “most recently wiped first”, the areas the small eraser left blank, the most recently wiped first, each with the day of its gesture: what has just been wiped can be read without opening the box.',
  'ad.msg.gommeAncienneLine':
    '{n} area(s) wiped by the eraser, the most long-ago wiped first — {list}.',
  'ad.msg.gommeAncienneLineHint':
    'Under “most long-ago wiped first”, the areas the small eraser left blank, the most long-ago wiped first, each with the day of its gesture: what waits to be refreshed can be read without opening the box.',
  'ad.msg.sortAncienSpan':
    'In the box, {n} day(s) separate the oldest extract ({vieux}) from the most recent ({recent}).',
  'ad.msg.ancienJaugeLabel': 'Extract gap in the box',
  'ad.msg.ancienJaugeSpan': '{n} day(s) · from {vieux} to {recent}',
  'ad.msg.ancienJaugeHint':
    'The gauge measures the gap between the oldest and the most recent extract of the areas in the box — the same measure as the sort hover, read without hovering. A single extract makes no gap, and a box without a date shows no gauge.',
  'ad.msg.ancienJaugeBouts':
    'At the two ends of that gap: the oldest is {aireVieux}, extracted on {vieux}; the most recent is {aireRecent}, extracted on {recent}.',
  'ad.msg.airesTightAireJour': '{region} · last extracted {date}',
  'ad.msg.airesTightAireJamais': '{region} · never extracted',
  'ad.msg.airesTightAireJourFils':
    '{region} · {n} thread(s) in the box · last extracted {date}',
  'ad.msg.airesTightAireJamaisFils':
    '{region} · {n} thread(s) in the box · never extracted',
  'ad.msg.airesTightAireJourHint':
    'Each area named in the pill keeps, on hover, the day its threads were last extracted, read on this device — or says it has never been extracted yet.',
  'ad.msg.jamaisLineClearHint':
    'Gives the whole list back in one gesture: the eraser clears the chips and the narrowing on one area, without touching the reading order in place.',
  'ad.msg.jamaisLineClearHintCount':
    'Gives the whole list back in one gesture: {chips} chips and {aires} narrowed areas are cleared, without touching the reading order in place.',
  'ad.msg.vieillesAires': 'extracted over 7 days ago',
  'ad.msg.vieillesAiresOnly': 'Areas extracted over 7 days ago',
  'ad.msg.vieillesAiresOn': 'Areas extracted more than seven days ago',
  'ad.msg.vieillesAiresNone': 'none right now',
  'ad.msg.vieillesAiresEmpty':
    'No area in the box was extracted more than seven days ago: areas never extracted have their own order.',
  'ad.msg.vieillesAiresHint':
    '{n} areas whose last thread extract is more than seven days old — {list} — and {fils} threads the token leaves in the list. One click keeps only their threads; a second click gives the whole list back. Areas never extracted stay out.',
  'ad.msg.vieillesAiresFils': '{n} threads',
  'ad.msg.aireHoldNote':
    'A long press on a thread’s area pill carries its digest; a short press keeps only that area’s threads.',
  'ad.msg.aireHoldNoteHint':
    'The gesture is meant to be found without hovering: the long press copies the area’s digest — its pages, then each thread with its contact —, while the short press narrows the box to that area.',
  'ad.msg.sortApresHint':
    'One click puts first the threads whose account received a listing after the prepared follow-up, the most deposits first; a second click returns to the list order.',
  'ad.msg.reviewResume': 'Resume',
  'ad.msg.reviewResumeLast': 'Back to the last reviewed thread',
  'ad.msg.reviewResumeHint':
    'Reopens the last thread reviewed during this visit — or, when nothing has been reviewed yet, the first sleeping thread left: the review resumes where it stopped.',
  'ad.msg.reviewResumeKeyHint':
    'The N or J key opens the next thread without leaving the keyboard, even when the resume button is out of mouse reach; the R key brings you back to the last reviewed thread.',
  'ad.msg.reviewResumeBackKeyHint':
    'The R key reopens the last thread reviewed during this visit, just like a click on the resume button.',
  'ad.msg.reviewResumeProgress': '{done} of {total}',
  'ad.msg.reviewResumeSince': 'Opened {ago}',
  'ad.msg.reviewResumeSinceHint':
    'One click on this line reopens the last reviewed thread, without going through the resume button.',
  'ad.msg.reviewResumeAgoNow': 'just now',
  'ad.msg.reviewResumeAgoMin': '{n} min ago',
  'ad.msg.reviewResumeAgoHour': '{n} h ago',
  'ad.msg.reviewResumeAgoDay': '{n} d ago',
  'ad.msg.closeKey': 'Close',
  'ad.msg.closeKeyName': 'Esc',
  'ad.msg.closeKeyHint':
    'The Escape key closes the open thread and hands the whole list back to the keyboard, without hunting for its row.',
  'ad.msg.sortRecapHint':
    'The reading order set in the list, recalled in the summary line next to the chips: the active sort and the account leading it.',
  'ad.msg.sortRecapBack': 'Back to the list order',
  'ad.msg.sortRecapBackHint':
    'One click on the reminder turns the set order off and gives the list its original order back; the chips and the filter stay as they are.',
  'ad.msg.filtersHint':
    'The chips set on the list, summed up in one line: how many there are, every active filter, how many threads it leaves, and how far the review has gone.',
  'ad.msg.chipOne': '1 chip',
  'ad.msg.chipMany': '{n} chips',
  'ad.msg.chipCountHint':
    'How many chips reduce the list — the same figure as the workbook summary at export time.',
  'ad.msg.clearAll': 'Clear',
  'ad.msg.listKeyHint':
    'Once the messaging card is active — a thread opened by click or with the N or J key — the up and down arrows move to the previous or next thread in the order shown, without the mouse.',
  'ad.msg.sortEscHint':
    'The Escape key closes the open thread and hands the whole list back to the keyboard. The reminder reads in the sort bar next to the arrows, even when no thread is open, so the gesture is discovered before it is needed; it lights up as soon as there is something to close.',

  'ad.msg.revueCompte': 'Account review',
  'ad.msg.revueCompteOn': 'Review narrowed to {n}',
  'ad.msg.revueCompteHint':
    'The list is narrowed to this account’s sleeping threads, opened from its record: the review starts where the record named it. The cross hands the whole list back, without clearing the kept chips.',
  'ad.msg.revueCompteEmpty':
    'This account has no sleeping thread: every one of its conversations answers in under a day.',
  'ad.msg.revueCompteClear': 'Leave this account’s review',
  'ad.msg.visitLength': 'Length of the visit',
  'ad.msg.visitLengthHint':
    'The gap between the first and the last opening of the current visit — the same measure as the bottom of the review journal, read from the session markers.',

  'ad.journal.stamp': 'Review journal',
  'ad.journal.sub':
    'The current visit, thread by thread: the hour of every opening, the minutes elapsed since the first, the reply delay and the last message — without downloading a file.',
  'ad.journal.clear': 'Clear the markers',
  'ad.journal.clearHint':
    'Clears the markers of this review: the list starts again from a fresh visit, as after the small eraser in the messaging.',
  'ad.journal.openHint': 'Open this thread in the messaging, without hunting for its row',
  'ad.journal.empty':
    'No sleeping thread has been reviewed yet during this visit: open a thread from the messaging and its row will appear here.',
  'ad.journal.note':
    'This journal reads from the same session memory as the messaging: one row per sleeping thread opened during the visit, in opening order. It stays empty while nothing has been reviewed, and clears with the visit. The length of the visit speaks of the review, not of the threads’ reply time.',

  'ad.p.stamp': 'Site settings',
  'ad.p.sub': 'The application settings as recorded, and the access to this console.',
  'ad.p.essai': 'Trial days',
  'ad.p.appel': 'Phone follow-up (hours)',
  'ad.p.updatedBy': 'Changed by',
  'ad.p.updatedAt': 'Changed on',
  'ad.p.none': 'No setting recorded: the site defaults apply.',
  'ad.p.note': 'These settings are written from the Supabase dashboard. This page reads them, it does not change them.',
  'ad.p.access': 'Allowed address',
  'ad.p.database': 'Database',
  'ad.p.databaseVal': 'Supabase — read through a server function',
  'ad.p.roles.stamp': 'Role management',
  'ad.p.roles.sub': 'Who can open this console: the accounts promoted to administrator, and the ordinary accounts.',
  'ad.p.roles.search': 'Search an account…',
  'ad.p.roles.role': 'Role',
  'ad.p.roles.action': 'Console access',
  'ad.p.roles.admin': 'administrator',
  'ad.p.roles.other': 'ordinary account',
  'ad.p.roles.promote': 'Promote to admin',
  'ad.p.roles.demote': 'Remove admin',
  'ad.p.roles.promoteHint':
    'Opens the console to this account: it can enter with its own address, without copying it into the server secrets.',
  'ad.p.roles.demoteHint':
    'Removes this account’s access to the console: it becomes an ordinary account again, its data stays untouched.',
  'ad.p.roles.selfHint':
    'This is the account that holds the console: its admin role cannot be removed from here, or the console would lock itself out.',
  'ad.p.roles.me': 'you',
  'ad.p.roles.err': 'The role could not be saved.',
  'ad.p.roles.doneAdmin': 'Account promoted to administrator: the console is now open to it.',
  'ad.p.roles.doneBack': 'The account is ordinary again: the console is closed to it.',
  'ad.p.roles.count': '{n} administrator(s)',
  'ad.p.roles.countHint':
    'The accounts that can open the console: administrator roles and the account holding the admin address.',
  'ad.p.roles.promoted': '{n} promoted',
  'ad.p.roles.promotedHint':
    'The accounts made administrators from this console, on the same rows as the table.',
  'ad.p.roles.lastPromotion': 'Last promotion',
  'ad.p.roles.promotedOn': 'promoted on',
  'ad.p.roles.promotedNoDate': 'promotion date not recorded',
  'ad.p.roles.empty': 'No account matches this search.',
  'ad.p.roles.none': 'No account registered: no role to manage yet.',
  'ad.p.roles.note':
    'The role is written on the account, in the database: the console and the server function read it on every opening. A promoted account enters with its own address — there is no need to copy it into the function secrets.',
  'ad.p.mail.stamp': 'Email sender',
  'ad.p.mail.verify': 'Check with Brevo',
  'ad.p.mail.verifying': 'Checking…',
  'ad.p.mail.verified': 'Domain verified',
  'ad.p.mail.pending': 'Domain pending',
  'ad.p.mail.unknownDomain': 'Domain not found',
  'ad.p.mail.noKey': 'No key: nothing to ask',
  'ad.p.mail.noDomainSet': 'No domain in the secrets',
  'ad.p.mail.verifyErr': 'Brevo did not answer: the domain state stays unknown.',
  'ad.p.mail.keyScope':
    'Send-only key: Brevo does not let it read the domains. Check the state inside Brevo.',
  'ad.p.mail.verifyAt': 'checked on {date}',
  'ad.p.mail.verifyHint':
    'Asks Brevo for the real state of the sending domain, instead of assuming a domain written in the secrets is a verified one. Until it is verified, acknowledgements do not leave.',
  'ad.p.mail.noDomainYet': 'Not checked yet',
  'ad.p.acc.stamp': 'Application acknowledgements',
  'ad.p.acc.sub': 'What candidates really received on deposit, and the acknowledgements that never left.',
  'ad.p.acc.sent': 'Acknowledgements sent · {n}',
  'ad.p.acc.waiting': 'Waiting · {n}',
  'ad.p.acc.today': 'Sent today · {n}',
  'ad.p.acc.sentHint': 'Applications whose acknowledgement really left PaperAtlas, dated by the sending function itself.',
  'ad.p.acc.waitingHint':
    'Applications received with no acknowledgement sent: the email failed, or the sending domain is not verified yet.',
  'ad.p.acc.todayHint': 'Acknowledgements sent since midnight, read on the same date as the other two counters.',
  'ad.p.acc.refresh': 'Read again',
  'ad.p.acc.listTitle': 'The acknowledgements that never left',
  'ad.p.acc.listHint': 'a resend goes out through the same function as the deposit: the date is written only if the email really leaves.',
  'ad.p.acc.candidat': 'Candidate',
  'ad.p.acc.offre': 'Offer',
  'ad.p.acc.waitSince': 'Sent on',
  'ad.p.acc.days': '{n} d waiting',
  'ad.p.acc.send': 'Resend the acknowledgement',
  'ad.p.acc.sending': 'Sending…',
  'ad.p.acc.ok': 'Acknowledgement resent to {to} · {date}',
  'ad.p.acc.already': 'This acknowledgement had already left on {date}: nothing was resent.',
  'ad.p.acc.err': 'The acknowledgement did not leave.',
  'ad.p.acc.noMail': 'No address for this candidate: the acknowledgement cannot leave.',
  'ad.p.acc.fromCompte': 'address read from the account',
  'ad.p.acc.empty': 'No acknowledgement waiting: every application received its own.',
  'ad.p.acc.none': 'No application recorded yet.',
  'ad.p.acc.error': 'The acknowledgements cannot be read right now.',
  'ad.p.acc.note':
    'The counter reads the same date as the candidate file, written by the sending function — never the date the file was opened. A resend never overwrites a date already set.',
  'ad.p.acc.reminder':
    'Reminder: {n} acknowledgement(s) have been waiting for more than 24 hours — the oldest was sent on {oldest}. The queue below handles them oldest first.',
  'ad.p.acc.late': 'over 24 h',
  'ad.p.acc.gateReady': 'Acknowledgements: sending possible',
  'ad.p.acc.gateBlocked': 'Acknowledgements: sending blocked',
  'ad.p.acc.gateHint':
    'Asks Brevo whether the sending domain is verified — the only fact that lets an acknowledgement leave. A click re-runs the check without leaving this card.',
  'ad.p.acc.gateNote':
    'While the sender or the domain verified at Brevo is missing, no acknowledgement can really leave: the date stays empty and the reason shows, without pretending. Secrets go in Supabase → Edge Functions → Secrets; the domain is verified at Brevo.',
  'ad.p.acc.reminderShort': 'Of which waiting over 24 h',
  'ad.p.acc.histStamp': 'Resend log',
  'ad.p.acc.histSub': 'Who sent, to whom, when — and whether the email really left.',
  'ad.p.acc.histCount': '{n} resend(s)',
  'ad.p.acc.histCsv': 'Export the log',
  'ad.p.acc.histCsvHint':
    'Downloads the log as CSV: one row per action, with its date, author, recipient and state.',
  'ad.p.acc.histCsvCount': 'Log rows',
  'ad.p.acc.histEmpty': 'No resend yet: the log is written with the first acknowledgement.',
  'ad.p.acc.histDate': 'Date',
  'ad.p.acc.histAuthor': 'Author',
  'ad.p.acc.histTo': 'Recipient',
  'ad.p.acc.histTrigger': 'Trigger',
  'ad.p.acc.histDepot': 'on deposit',
  'ad.p.acc.histRenvoi': 'manual resend',
  'ad.p.acc.histState': 'State',
  'ad.p.acc.histSent': 'sent',
  'ad.p.acc.histFailed': 'not sent',
  'ad.p.acc.why.no-recipient': 'no address',
  'ad.p.acc.why.email-not-configured': 'sending not configured',
  'ad.p.acc.why.email-error': 'sending service refused',
  'ad.p.acc.bulk': 'Resend the overdue · {n}',
  'ad.p.acc.bulkHint':
    'Resend in one go every acknowledgement that has waited more than 24 hours, oldest first: each send goes through the same function as the deposit, and the date is written only if the email really leaves.',
  'ad.p.acc.bulkBusy': 'Sending {n}…',
  'ad.p.acc.bulkDone':
    '{sent} acknowledgement(s) resent · {failed} failed — the resend log keeps every attempt, successful or not.',
  'ad.p.acc.histFailOnly': 'Failures only · {n}',
  'ad.p.acc.histFailHint':
    'Keep only the sends that never left, so failures can be handled in one pass; a second click restores the whole log.',
  'ad.p.acc.histFailEmpty':
    'No failure in the log: every send attempt really went through.',
  'ad.p.acc.histAll': 'Whole log',
  'ad.p.acc.motifTitle': 'Failures by reason',
  'ad.p.acc.motifHint':
    'One click keeps only the sends that failed for this reason; a second click restores the whole log. The number is read on the same rows as the log.',
  'ad.p.acc.motifMost': 'Blocking the most: {label} · {n}',
  'ad.p.acc.motifMostHint':
    'The reason that comes back most often among the sends that never left: it says at a glance what holds back the most acknowledgements.',
  'ad.p.acc.motifActive': 'Filtered on “{label}”',
  'ad.p.acc.motifClear': 'All reasons',
  'ad.p.acc.motifEmpty':
    'No reason to count: every send in the log really went through.',
  'ad.p.acc.motifOther': 'reason not stated',
  'ad.p.acc.why.other': 'reason not stated',
  'ad.accuse.openVerify': 'open the Brevo sending-domain check',
  'ad.xls.horsTypeSheet': 'Off-type sections',
  'ad.xls.horsTypeEmpty':
    'No off-type deposit at export time: every section belongs to its own family.',
  'ad.xls.horsTypeCount': 'Off-type deposits',
  'ad.xls.horsTypeExpected': 'Expected sections',
  'ad.xls.horsTypeRecorded': 'Recorded section',
  'ad.xls.horsTypeNote':
    'The “Off-type sections” sheet repeats, at click time, the deposits whose section belongs to the other family — a listing category on a job offer, or the reverse. Each row gives the recorded section and the four sections expected for the deposit type: the list to correct can then be attached to a milestone without reopening the “Listings” tab. The foot of the sheet counts the deposits and recalls the two families.',
  'ad.xls.attenteSheet': 'Pending acknowledgements',
  'ad.xls.attenteEmpty':
    'No acknowledgement pending at export time: every deposit got its own.',
  'ad.xls.attenteCount': 'Pending acknowledgements',
  'ad.xls.attenteLate': 'Over 24 h',
  'ad.xls.attenteNote':
    'The “Pending acknowledgements” sheet carries the resend queue exactly as it stands at click time: one line per application whose acknowledgement has not left yet, oldest first, with its waiting time in days and an “Over 24 h” mark on those past a full day. The queue can then be attached to a milestone without reopening the console.',
  'ad.xls.renvoisSheet': 'Resend log',
  'ad.xls.renvoisEmpty': 'No resend in the log at export time.',
  'ad.xls.renvoisNote':
    'The “Resend log” sheet repeats the console log: one row per send, with its date, author, recipient, the application it bore and its state. A send that never left keeps its row and its reason — the file does not count successes only.',
  'ad.accuse.chip': 'Acknowledgements',
  'ad.accuse.waiting': '{n} acknowledgement(s) waiting',
  'ad.accuse.overdue':
    '{n} waiting for more than 24 h · the oldest was sent on {date}',
  'ad.accuse.noLate': 'nothing over 24 h late',
  'ad.accuse.open': 'open the application acknowledgements card',
  'ad.accuse.loading': 'Acknowledgements: reading…',
  'ad.accuse.gateBlocked': 'Acknowledgements: sending blocked — nothing can leave',
  'ad.accuse.gateReady': 'acknowledgements: sending possible',
  'ad.ann.rubriqueChip': 'Off-type section',
  'ad.ann.rubriqueChipHint':
    'Keep only the deposits whose section belongs to the other family — a listing category on a job offer, or the reverse. The correction then opens under each line; a second click restores the whole list.',
  'ad.ann.rubriqueBadge': 'Off-type section',
  'ad.ann.rubriqueBadgeOffre':
    'This job offer carries a section from the listings family.',
  'ad.ann.rubriqueBadgeAnnonce':
    'This listing carries a section from the job-offer family.',
  'ad.ann.rubriqueFix': 'Fix the section',
  'ad.ann.rubriqueFixHint':
    'Pick a section from the deposit’s own family: it is written as is, without touching the title, the text or the review state.',
  'ad.ann.rubriqueEmpty': 'No off-type deposit: every section belongs to its family.',
  'ad.ann.rubriqueErr': 'The section could not be fixed.',
  'ad.p.acc.bulkFail': 'Resend the failures · {n}',
  'ad.p.acc.bulkFailHint':
    'Replay in one gesture only the sends that did not leave, instead of the whole overdue queue: every attempt goes through the same function as the deposit, and the date is written only if the email really leaves.',
  'ad.p.acc.bulkFailDone':
    '{sent} retry(ies) sent · {failed} still failing — the resend log keeps every attempt.',
  'ad.p.mail.sub': 'Which address PaperAtlas writes from, and the proof that a message really arrives.',
  'ad.p.mail.state': 'State',
  'ad.p.mail.ready': 'Ready to send',
  'ad.p.mail.notReady': 'Domain to configure',
  'ad.p.mail.from': 'Sending address',
  'ad.p.mail.domain': 'Verified domain',
  'ad.p.mail.reply': 'Reply address',
  'ad.p.mail.key': 'Sending key',
  'ad.p.mail.keySet': 'Saved',
  'ad.p.mail.keyMissing': 'Missing',
  'ad.p.mail.check': 'Check',
  'ad.p.mail.checkAt': 'Last state read: {date}',
  'ad.p.mail.checkNever':
    'No state read from this device yet: the facts shown have not been re-read here.',
  'ad.p.mail.loading': 'Reading the sender…',
  'ad.p.mail.test': 'Send a test',
  'ad.p.mail.testing': 'Sending…',
  'ad.p.mail.testHint': 'Receive a verification message at your address.',
  'ad.p.mail.testBlocked': 'The key or the sending domain is not configured yet.',
  'ad.p.mail.testSent': 'Test message sent to {to}. Check the inbox.',
  'ad.p.mail.testFail': 'The test message did not leave.',
  'ad.p.mail.error': 'The sender state cannot be read right now.',
  'ad.p.mail.note': 'BREVO_API_KEY and MAIL_FROM_DOMAIN are added in Supabase, under Edge Functions → Secrets; the domain must also be authenticated at Brevo. Once both are in place, every confirmation leaves under the PaperAtlas name.',
  'ad.p.mail.guideTitle': 'Setting the key and the domain, step by step',
  'ad.p.mail.guideSub': 'Four steps, in this order. The card guesses nothing: it reads the real state of the secrets, and a received message remains the only proof.',
  'ad.p.mail.guideCount': '{n} / {total} steps in place',
  'ad.p.mail.gFait': 'In place',
  'ad.p.mail.gAfaire': 'To do',
  'ad.p.mail.g1Title': 'Create the sending key at Brevo',
  'ad.p.mail.g1Text': 'In Brevo, under SMTP & API → API Keys, create a key with sending rights. Copy it right away: it is shown only once.',
  'ad.p.mail.g1Link': 'Open Brevo keys',
  'ad.p.mail.g2Title': 'Put the key into Supabase',
  'ad.p.mail.g2Text': 'In Supabase, Edge Functions → Secrets, add BREVO_API_KEY with the copied key. The server functions read it there, never the browser.',
  'ad.p.mail.g2Link': 'Open Supabase secrets',
  'ad.p.mail.g3Title': 'Verify the domain and name it',
  'ad.p.mail.g3Text': 'In Brevo, open Settings → Senders, Domains, IPs → Domains, add your domain, then set the required DNS records. Once authenticated, add MAIL_FROM_DOMAIN in Supabase with that same domain: messages will leave from noreply@ that domain.',
  'ad.p.mail.g3Link': 'Open Brevo',
  'ad.p.mail.g4Title': 'Send a test and receive it',
  'ad.p.mail.g4Text': 'The “Send a test” button writes to your address. Until that message arrives, the domain is not proven: having the key and the domain in place is not enough.',
  'ad.p.mail.gNote': 'The same procedure is written in §10 of the plan, with the expected DNS records.',
  'ad.p.auth.stamp': 'Sign-up and password emails',
  'ad.p.auth.sub': 'The two account messages do not go through the site functions: Supabase Auth writes them over the project SMTP. Five steps put them under the PaperAtlas name, including the B2B reminder to the workshop.',
  'ad.p.auth.count': '{n} / {total} steps in place',
  'ad.p.auth.done': 'In place',
  'ad.p.auth.todo': 'To do',
  'ad.p.auth.s1Title': 'Reuse the Resend key',
  'ad.p.auth.s1Text': 'The key created for the confirmations works here too: Resend sends these messages like the others. Nothing new to create when the first step of the guide is held.',
  'ad.p.auth.s2Title': 'Name the sending domain',
  'ad.p.auth.s2Text': 'The domain verified at Resend, set in MAIL_FROM_DOMAIN, gives the noreply@ address that signs these messages. An unverified domain sends the authentication emails to spam, or does not send them at all.',
  'ad.p.auth.s3Title': 'Connect the authentication SMTP',
  'ad.p.auth.s3Text': 'In Supabase, Authentication → Emails → SMTP Settings, choose a custom SMTP and copy the values below. Supabase then stops writing from its generic address: confirmations leave from PaperAtlas. This setting lives in Supabase; the console cannot read it, so it keeps the declaration.',
  'ad.p.auth.s4Title': 'Receive a real authentication message',
  'ad.p.auth.s4Text': 'The button below asks Supabase for a password reset email to your address: it is the only gesture that proves the SMTP really carries the PaperAtlas name. Until it arrives, step 3 stays declared, never proven.',
  'ad.p.auth.smtpTitle': 'The values to copy, one by one',
  'ad.p.auth.host': 'Host',
  'ad.p.auth.port': 'Port',
  'ad.p.auth.user': 'User',
  'ad.p.auth.pass': 'Password',
  'ad.p.auth.from': 'Sender',
  'ad.p.auth.copy': 'Copy',
  'ad.p.auth.smtpPassHint': 'The password is the Resend key itself — the one in RESEND_API_KEY. Do not copy it by hand: take it from Resend while setting this up.',
  'ad.p.auth.passValue': 'the Resend key (RESEND_API_KEY)',
  'ad.p.auth.smtpCopyAll': 'Copy the five values',
  'ad.p.auth.smtpCopied': 'The five values are copied: paste them into Supabase, one under the other.',
  'ad.p.auth.smtpCopyFail': 'The browser refused the copy; the values stay on screen to be typed by hand.',
  'ad.p.auth.smtpOpen': 'Open Authentication',
  'ad.p.auth.smtpOpenHint': 'Supabase → Authentication → Emails → SMTP Settings',
  'ad.p.auth.s5Title': 'B2B reminder to the workshop',
  'ad.p.auth.s5Text': 'The reminder that nudges a workshop about an unanswered B2B request leaves through the same Resend and the same key, but from another function: it can fail on its own. The test below sends a full example to your address — sender, subject and layout — without writing to any workshop.',
  'ad.p.auth.b2bTest': 'Send a test reminder',
  'ad.p.auth.b2bTesting': 'Sending…',
  'ad.p.auth.b2bSent': 'Test reminder sent to {to}. Look for “Rappel B2B” in the subject: the signature must read PaperAtlas.',
  'ad.p.auth.b2bFail': 'The test reminder did not go out.',
  'ad.p.auth.b2bBlocked': 'The key and the domain must be set first: the reminder takes the same path.',
  'ad.p.auth.b2bProofAt': 'Test sent on {date}',
  'ad.p.auth.b2bProofNone': 'No test sent',
  'ad.p.auth.b2bHint': 'A successful test dates the step on this device; it proves the departure, not the delivery.',
  'ad.p.auth.b2bUndo': 'Forget this test',
  'ad.p.auth.modelsRtl': 'Checked on a phone: each block carries its own reading direction, the long link wraps instead of overflowing, and the signature no longer mixes Arabic and English on a single line.',
  'ad.p.auth.declare': 'Mark the SMTP as connected',
  'ad.p.auth.declareHint': 'Once the five values are saved in Supabase: the step is judged on this declaration, dated on this device.',
  'ad.p.auth.undeclare': 'Remove the declaration',
  'ad.p.auth.declaredOn': 'Declared on {date}',
  'ad.p.auth.notDeclared': 'Not declared yet',
  'ad.p.auth.modelsTitle': 'Three languages in the same template',
  'ad.p.auth.modelsSub': 'Supabase sends one template per type, to every account. These two templates therefore carry French, Arabic and English in sequence: each person reads their own language, and nobody receives a language they do not read.',
  'ad.p.auth.modelKind': 'Email type',
  'ad.p.auth.modelConfirm': 'Sign-up confirmation',
  'ad.p.auth.modelReset': 'Password reset',
  'ad.p.auth.modelSubject': 'Subject',
  'ad.p.auth.modelBody': 'Message body (HTML)',
  'ad.p.auth.copySubject': 'Copy the subject',
  'ad.p.auth.copyBody': 'Copy the body',
  'ad.p.auth.modelsWhere': 'Both templates go into Supabase, Authentication → Emails → Templates: “Confirm signup” and “Reset password”. The {{ .ConfirmationURL }} link is filled by Supabase itself; do not change it.',
  'ad.p.auth.previewTitle': 'Arabic block preview',
  'ad.p.auth.previewSub': 'The message as it reads on a phone: reading direction, the long link wrapping and the place of the signature are judged here, without opening a mailbox.',
  'ad.p.auth.previewWidth': 'Screen width',
  'ad.p.auth.previewWidthHint': 'Three phone widths to compare: 320, 360 and 390 px. The preview page takes the one you pick; the Arabic block itself does not change.',
  'ad.p.auth.previewHeight': 'Screen height',
  'ad.p.auth.previewHeightHint': 'Three heights of the same window: 320, 480 and 640 px. Width judges line wrapping, height judges scrolling: how much of the message shows before the finger swipes.',
  'ad.p.auth.previewNote': 'Nothing in this preview is sent: the confirmation link stays a still marker, and this frame is only for reading.',
  'ad.p.auth.previewReste': 'At {h} px high, {n} px remain to scroll before reaching the signature.',
  'ad.p.auth.previewResteZero': 'At {h} px high, the signature is already visible: nothing to scroll.',
  'ad.p.auth.previewTally': 'The three heights, at {w} px wide',
  'ad.p.auth.previewTallyHint': 'All three heights side by side at the chosen width, with what remains to scroll to reach the signature. A click sets that height on the frame, without reloading.',
  'ad.p.auth.previewTallyRest': '{n} px to scroll',
  'ad.p.auth.previewTallyZero': 'signature visible',
  'ad.p.auth.previewTallyPick': 'Set the {h} px height on the preview frame, at {w} px wide.',
  'ad.p.auth.previewTallyCopy': 'Copy the tally',
  'ad.p.auth.previewTallyCopyHint': 'Copies the three-height tally: the chosen width comes first, followed by the three measures one below the other, each with what remains to scroll.',
  'ad.p.auth.previewTallyCopyHead': 'Three-height tally — {w} px wide',
  'ad.p.auth.previewTallyCopyLine': '- {h} px: {rest}',
  'ad.p.auth.previewTallyCopied': 'Tally copied — the chosen width is named with the three measures.',
  'ad.p.auth.previewTallyCopyFail': 'The browser refused the copy: the tally stays readable on screen, to copy by hand.',
  'ad.p.auth.previewTallyLast': 'Last tally copy on {date}, kept by this device.',
  'ad.p.auth.previewTallyNever': 'The tally has not been copied from this device yet.',
  'ad.p.auth.test': 'Receive a test email',
  'ad.p.auth.testing': 'Requesting…',
  'ad.p.auth.testSent': 'Request sent to {to}. Open the mailbox: the sender must be PaperAtlas.',
  'ad.p.auth.testFail': 'Supabase did not accept sending this message.',
  'ad.p.auth.testReceived': 'Mark the message as received',
  'ad.p.auth.proofAt': 'Received on {date}',
  'ad.p.auth.proofNone': 'No message received',
  'ad.p.auth.proofHint': 'One click dates the reception on this device; a second click removes the date.',
  'ad.p.auth.note': 'Until these five steps are held, sign-up and password emails leave from the generic Supabase address, in English.',
  'ad.p.mail.proof': 'Last proof',
  'ad.p.mail.proofAt': 'Test received on {date}',
  'ad.p.mail.proofNone': 'No test received',
  'ad.p.mail.gDoneOn': 'received on {date}',
  'ad.p.mail.gAgeToday': 'today',
  'ad.p.mail.gAgeOne': 'a day ago',
  'ad.p.mail.gAge': '{n} days ago',
  'ad.p.mail.gAncienne':
    'This proof is over a month old: run a test again to refresh it.',
  'ad.p.mail.gToSuivi': 'Follow this task in the project',
  'ad.p.mail.steps': 'Steps in place {n} / {total}',
  'ad.p.mail.stepsHint':
    'The guide steps already met, counted on the real state of the secrets and on the last test received — readable without opening the four steps.',
  'ad.p.mail.stepsOpenHint': 'Open the guide on the first step still missing',
  'ad.p.mail.gNext': 'Next step',
  'ad.f.reply': 'Reply',
  'ad.f.replyHint': 'Open a message already addressed to the sender of this request.',
  'ad.f.demandeSubject': 'B2B request',
  'ad.f.demandesTodo': 'to handle',
  'ad.f.demandesTodoHint':
    'Keep only the requests still to handle, the oldest first; a second click opens them all again.',
  'ad.f.demandesDone': 'handled',
  'ad.f.demandesNoneTodo': 'No request to handle: all have received a reply.',
  'ad.f.demandesOrderHint':
    'Requests still to handle come first, the oldest at the top: the queue reads in the order it waits.',

  'ad.suivi.stamp': 'Project tracking',
  'ad.suivi.sub':
    'The steering file, read where it lives: the official percentage, the modules that make it up, the phases and what still blocks.',
  'ad.suivi.updated': 'Updated on',
  'ad.suivi.version': 'version',
  'ad.suivi.avancement': 'Official progress',
  'ad.suivi.points': 'Points earned',
  'ad.suivi.acheves': 'Modules complete',
  'ad.suivi.chantiers': 'Tasks done',
  'ad.suivi.modulesTitle': 'The weight of every module',
  'ad.suivi.modulesNote': 'Weight and progress, read from the steering file',
  'ad.suivi.total': 'Weighted total',
  'ad.suivi.restePart': '{pts} points left out of 100 · {pct}% of the project',
  'ad.suivi.manqueTitle': 'The missing points, in detail',
  'ad.suivi.manqueNote': '{n} module(s) still open · {pts} points to recover',
  'ad.suivi.manqueLourd': 'heaviest',
  'ad.suivi.manqueTotal': 'Missing points',
  'ad.suivi.manqueJamais': ' · {n} module(s) never jumped to from this device',
  'ad.suivi.manqueJamaisAucun': ' · every module here has been jumped to',
  'ad.suivi.manqueJamaisHint':
    'Never jumped to from this device, one per line:\n{noms}',
  'ad.suivi.manqueJamaisHintItem': '- {nom}',
  'ad.suivi.manqueJamaisHintOk':
    'Every module in this block has already been jumped to from this device.',
  'ad.suivi.manqueCsv': 'Detail as CSV',
  'ad.suivi.manqueCsvOk': 'CSV downloaded',
  'ad.suivi.manqueCsvHint':
    'The missing points on their own, ready to attach to a status note',
  'ad.suivi.descendusCsv': 'Jumped modules as CSV',
  'ad.suivi.descendusCsvOk': 'CSV downloaded',
  'ad.suivi.descendusCsvPeriode':
    'The jumps cover the period from {ancien} to {recent} — {n} day(s) between the oldest and the most recent.',
  'ad.suivi.descendusCsvPeriodeOne':
    'All jumps fall on a single day, {date}.',
  'ad.suivi.descendusCsvPeriodeNone':
    'No dated jump from this device: the file will leave without a period.',
  'ad.suivi.descendusCsvHint':
    'The modules jumped to from this device, with their day, one per line',
  'ad.suivi.chantierOuvOne': '1 deliverable still open in the phases',
  'ad.suivi.chantierOuv': '{n} deliverables still open in the phases',
  'ad.suivi.chantierOuvZero': 'No deliverable open in the phases',
  'ad.suivi.chantierPart': '{pts} points out of {total} · {pct}% of the remaining part',
  'ad.suivi.chantierLourd': 'heaviest',
  'ad.suivi.chantierJumpHint':
    'Jump down to the row of its heaviest module — {module}',
  'ad.suivi.capTag': 'target {seuil}%',
  'ad.suivi.capToCross': 'still to cross',
  'ad.suivi.capCrossed': 'target crossed',
  'ad.suivi.capMail':
    'E-mail weighs {poids}: taken to 100%, it adds {gain} point and brings the total to {total}%.',
  'ad.suivi.capAfter':
    'After that, only {reste} point is left to cross {seuil}%.',
  'ad.suivi.capAfterNone': 'After that, the {seuil}% target is crossed.',
  'ad.suivi.capHoverHead':
    'The {n} module(s) still before the {seuil}% target, heaviest first:',
  'ad.suivi.capHoverItem': '· {module} — {pt} point(s) to recover',
  'ad.suivi.capHoverFoot': '{reste} point(s) remain to cross it in total.',
  'ad.suivi.capHoverDone':
    'Target of {seuil}% crossed: no module remains before it.',
  'ad.suivi.capListShow': 'Show the modules left before the target',
  'ad.suivi.capListHide': 'Fold the module list',
  'ad.suivi.capGum': 'Forget this marker on this device',
  'ad.suivi.capGumHint':
    'The small eraser forgets the crossing date on this device — the plan and its archive stay untouched.',
  'ad.suivi.capGumConfirm': 'Forget',
  'ad.suivi.capGumConfirmHint': 'Press again to forget this date on this device.',
  'ad.suivi.capReached': 'Target crossed on {date}',
  'ad.suivi.capReachedHint':
    'The 95% target was crossed on {date} — a date kept on this device, not copied by hand.',
  'ad.suivi.capReachedDays':
    '{n} day(s) have passed since it was crossed.',
  'ad.suivi.capJumpHint':
    'Jump to this module’s row in the module weights table.',
  'ad.suivi.capJumpHintAt':
    'Jump to this module’s row in the table · reached on {date}.',
  'ad.suivi.capDescendusVersArchive':
    'Jump to the archives line in the reminder: that is where the pieces are attached.',
  'ad.suivi.modVuLe':
    'Row already jumped to from this device · reached on {date}.',
  'ad.suivi.modVuSansLe':
    'Row already jumped to from this device · jump day not dated.',
  'ad.suivi.modArchiveLe':
    'Last archive for this workstream left this device on {date}.',
  'ad.suivi.modArchiveJump':
    'Last archive for this workstream left this device on {date} · a press jumps down to the archives line, in the reminder.',
  'ad.suivi.modOublier': 'Forget this reached row',
  'ad.suivi.modOublierHint':
    'Forgets this single row reached on this device, leaving the others in place. No module of the plan is touched.',
  'ad.suivi.modOublierConfirm': 'Confirm forgetting this row',
  'ad.suivi.modOublierConfirmHint':
    'A second press forgets this row alone on this device.',
  'ad.suivi.capDescendus': 'Modules already jumped to {n} / {total}',
  'ad.suivi.capDescendusHint':
    'Already jumped to from this device, one per line:\n{noms}',
  'ad.suivi.capDescendusHintItem': '- {nom} · reached on {date}',
  'ad.suivi.capDescendusHintItemSansLe': '- {nom} · jump day not dated',
  'ad.suivi.capDescendusOk':
    'No module in this list has yet been jumped to from this device.',
  'ad.suivi.capDescendusLe': ' · last jump on {date}',
  'ad.suivi.capDescendusSansLe': ' · no dated jump yet',
  'ad.suivi.capJamaisLe': ' · {n} module(s) in the list never jumped to',
  'ad.suivi.capJamaisAucun': ' · every module in the list has been jumped to',
  'ad.suivi.capDescendusOublier': 'Forget the modules reached',
  'ad.suivi.capDescendusOublierHint':
    'Forgets the modules reached from this device and the day of the last jump. No module of the plan is touched.',
  'ad.suivi.capDescendusOublierConfirm': 'Confirm the forget',
  'ad.suivi.capDescendusOublierConfirmHint':
    'A second press forgets the modules reached on this device.',
  'ad.suivi.chantierFiltrer': 'Narrow the reminder to this job alone',
  'ad.suivi.chantierResserre': 'Narrowed to a single task',
  'ad.suivi.chantierVoirTous': 'Show all four',
  'ad.suivi.chantierArchive': 'Archive for this task',
  'ad.suivi.chantierArchiveHint':
    'Downloads the plan narrowed to this single task: its points, its modules and its still-open deliverables, without the rest of the document.',
  'ad.suivi.chantierArchiveOk': 'Archive downloaded',
  'ad.suivi.mailGo': 'E-mail sender',
  'ad.suivi.preuves': 'Sending proofs {n} / {total}',
  'ad.suivi.preuvesHint': 'Confirmation, password and B2B reminder: three messages actually received or sent from this device. Still open: {list}. A click opens the sender card.',
  'ad.suivi.preuvesOk': 'All three proofs are dated on this device: confirmation, password and B2B reminder.',
  'ad.suivi.preuveConf': 'confirmation',
  'ad.suivi.preuvePass': 'password',
  'ad.suivi.preuveB2b': 'B2B reminder',
  'ad.suivi.preuveAt': '{label} · {date}',
  'ad.suivi.preuveNoDate': '{label} · not dated yet',
  'ad.suivi.preuvesClick': 'A click opens the sender card.',
  'ad.suivi.mailGoModuleHint': 'Open the “E-mail sender” card in Settings, without going back through the tabs.',
  'ad.suivi.mailDoorHint': 'Open the “E-mail sender” card in Settings, straight on its block.',
  'ad.suivi.resendGo': 'Brevo',
  'ad.suivi.resendGoHint': 'Open Brevo in a new tab: the verified domains and sending keys of the e-mail work.',
  'ad.suivi.modDoorHint': 'This module has an open door: its line leads to the screen that moves it forward.',
  'ad.suivi.modDoorScreen': 'This line has an open door: it leads to the “{ecran}” screen, read from the plan.',
  'ad.suivi.doorSeen': 'already opened',
  'ad.suivi.doorSeenHint': 'The “E-mail sender” card has already been opened from this device, on {date}.',
  'ad.suivi.doorSeenClear': 'Forget the visit',
  'ad.suivi.doorSeenClearHint': 'Clear the visit to the “E-mail sender” card from this device: the mark disappears, the card and its state stay as they are.',
  'ad.suivi.doorSeenCleared': '{n} doors cleared on {appareil}: the card and its state stay untouched.',
  'ad.suivi.appareilOrdi': 'this computer',
  'ad.suivi.appareilTel': 'this phone',
  'ad.suivi.appareilTab': 'this tablet',
  'ad.suivi.restePortes': 'Open doors · {n}',
  'ad.suivi.restePortesHint': 'Keep only the lines of this list that carry an open door — {n} of {total} — read from the plan; a second click restores the whole list.',
  'ad.suivi.restePortesShown': '{n} of {total} lines, those carrying an open door',
  'ad.suivi.restePortesShownUsed': '{n} of {total} lines, {used} door(s) already used',
  'ad.suivi.resteCopy': 'Copy these lines',
  'ad.suivi.resteCopyHint': 'Copies only the lines kept by the open-doors chip, each followed by the name of the screen it opens.',
  'ad.suivi.resteCopyHintUsed': 'Copies the {n} lines kept by the open-doors chip — {used} already used —, each followed by the name of the screen it opens and, for doors already visited, the day of the visit.',
  'ad.suivi.resteCopyHead': 'What remains — open doors ({n})',
  'ad.suivi.resteCopyHeadOublis':
    'What remains — open doors ({n}) · {oublis} visit(s) forgotten on this device',
  'ad.suivi.resteCopyLine': '- {texte} — screen: {ecran}',
  'ad.suivi.resteCopyLineUsed': '- {texte} — screen: {ecran} · already used on {date}',
  'ad.suivi.resteCopied': '{n} line(s) copied, each with the name of its screen.',
  'ad.suivi.resteCopyFail': 'The browser refused the copy: the lines stay readable on screen.',
  'ad.suivi.resteVues': 'Already used · {n}',
  'ad.suivi.resteVuesHint': 'Keep only the lines whose door has already been used from this device — {n} of {total} —; a second click restores the whole list.',
  'ad.suivi.resteVuesHintDetail':
    'Keep only the lines whose door has already been used from this device — {n} of {total} —: {detail}; a second click restores the whole list.',
  'ad.suivi.resteVuesShown': '{n} of {total} lines, those whose door is already used',
  'ad.suivi.doorOublis': '{n} visit(s) forgotten on this device',
  'ad.suivi.doorOublisLast': 'last forgotten on {date}',
  'ad.suivi.doorOublisNone': 'no visit forgotten yet',
  'ad.suivi.doorOublisHint': 'Door visits cleared from this device with the small eraser on the “already used” mark: the count and the day of the last forgetting are read from the device notebook.',
  'ad.suivi.doorOublisCsv': 'Visits as CSV',
  'ad.suivi.doorOublisCsvOk': 'CSV downloaded',
  'ad.suivi.doorOublisCsvHint':
    'Downloads the notebook as CSV — one row per forgotten door, with its screen, its plan workstream and the day of the gesture —, {n} row(s) ready to attach.',
  'ad.suivi.doorOublisCsvHintSpan':
    'Downloads the notebook as CSV — one row per forgotten door, with its screen, its plan workstream and the day of the gesture —, {n} row(s) from {ancien} to {recent}, ready to attach.',
  'ad.suivi.doorOublisCsvPeriode':
    'The notebook covers the period from {ancien} to {recent} — {n} day(s) between the oldest return and the newest.',
  'ad.suivi.doorOublisCsvPeriodeOne':
    'The notebook covers a single day, {date}: the oldest and the newest return fall on the same day.',
  'ad.suivi.doorOublisCsvBlocs':
    'The file holds {n} row(s) in {b} block(s), counted one by one:',
  'ad.suivi.doorOublisCsvBlocItem': '{titre} — {n} row(s)',
  'ad.suivi.doorOublisCsvBlocsNone': 'The file is empty: no block to count.',
  'ad.suivi.doorOublisCsvBlocLourd':
    'The heaviest block of the file is “{titre}”, with {n} line(s) out of the {total} in the file — {part} % of the whole.',
  'ad.suivi.doorOublisCsvBlocLourdNone':
    'No block carries a line: the heaviest one cannot be named.',
  'ad.suivi.doorOublisParChantier': 'Visits forgotten per workstream',
  'ad.suivi.doorOublisParChantierHintDetail':
    'The notebook visits grouped by plan workstream, the fullest first, with the day of each one’s last forgetting and the days between its first and its last forgetting: {detail} — read from the same device memory.',
  'ad.suivi.doorOublisChantierDernier': 'last forgotten on {date}',
  'ad.suivi.doorOublisChantierSpan': '{n} day(s) between the first and the last forgetting',
  'ad.suivi.doorOublisChantierSpanOne': 'first and last forgetting on the same day',
  'ad.suivi.doorOublisChantierTokenHint':
    'Keep in the notebook only the forgettings of “{nom}” — {n} gesture(s), from {premier} to {dernier} — long enough to remove one line without picking a neighbour; a second press restores the whole notebook.',
  'ad.suivi.doorOublisChantierTokenHintMasque':
    'Keep only the “{nom}” forgettings in the notebook — {n} gesture(s), from {premier} to {dernier} —: {masques} other notebook line(s) would then leave the view, the first of them dated {premierMasque}; a second press restores the whole notebook.',
  'ad.suivi.doorOublisChantierOn': 'Notebook narrowed to “{nom}” — {n} gesture(s)',
  'ad.suivi.doorOublisChantierClear': 'Restore the whole notebook',
  'ad.suivi.doorOublisSemaine': 'This week · {n}',
  'ad.suivi.doorOublisSemaineHint':
    'Keep only the forgettings that fall in the current week — {n} gesture(s) out of {total} —, to reread the recent gestures before removing one; a second press restores the whole notebook. The workstream token, when set, stays held: both are read together.',
  'ad.suivi.doorOublisSemaineOn': 'Current week — {n} gesture(s)',
  'ad.suivi.doorOublisSemaineNote': 'the recent gestures, before removing one',
  'ad.suivi.doorOublisSemaineClear': 'Restore the older gestures',
  'ad.suivi.doorOublisSemaineHintBouts':
    'Keep only the forgettings that fell this week in the notebook — {n} gesture(s) out of {total}, from the oldest on {ancien} to the most recent on {recent} —, to re-read the recent gestures before removing one; a second press restores the whole notebook. The chantier token, if set, stays held: both read together.',
  'ad.suivi.doorOublisSemaineHintBoutsOne':
    'Keep only the forgettings that fell this week in the notebook — {n} gesture(s) out of {total}, all on {date} —, to re-read the recent gestures before removing one; a second press restores the whole notebook. The chantier token, if set, stays held: both read together.',
  'ad.suivi.doorOublisJetons': '{n} token(s) set',
  'ad.suivi.doorOublisJetonsNone': 'no token set',
  'ad.suivi.doorOublisJetonsHint':
    'The {n} token(s) set on the notebook — screen, chantier and week — counted together: they narrow the reading without removing a single forgetting. The eraser puts them all out in one gesture.',
  'ad.suivi.doorOublisJetonsNoneHint':
    'No token set on the notebook: the list shows all its gestures. The screen, the chantier and the week are each set with one press, and read together.',
  'ad.suivi.doorOublisJetonsClear': 'Put out the tokens',
  'ad.suivi.doorOublisJetonsClearHint':
    'Puts out the {n} token(s) set on the notebook in one gesture and restores the whole list: no forgetting is removed, the notebook count does not move.',
  'ad.suivi.doorOublisJetonsCleared':
    '{n} token(s) put out: the notebook shows all its gestures again.',
  'ad.suivi.doorOublisJournal': 'The notebook, gesture by gesture — newest first',
  'ad.suivi.doorOublisJournalTri': 'The notebook, sorted by screen',
  'ad.suivi.doorOublisTriEcran': 'By screen',
  'ad.suivi.doorOublisTriEcranHint':
    'Sorts the notebook’s gestures under their screen name, so the forgettings of the same screen read side by side before one is removed; a second press restores the newest-first order. No forgetting is removed.',
  'ad.suivi.doorOublisTriEcranOffHint':
    'The notebook is sorted by screen: a press restores the newest-first order, without removing any forgetting.',
  'ad.suivi.doorOublisTriEcranHintDetail':
    'Sorts the notebook’s gestures under their screen name — {n} screen(s) over {total} gesture(s), each with its most recent forgetting: {detail} —, so the forgettings of the same screen read side by side before one is removed; a second press restores the newest-first order. No forgetting is removed.',
  'ad.suivi.doorOublisTriEcranOffHintDetail':
    'The notebook is sorted by screen — {n} screen(s) over {total} gesture(s), each with its most recent forgetting: {detail} —; a press restores the newest-first order, without removing any forgetting. The small eraser does the same in one gesture.',
  'ad.suivi.doorOublisTriEcranItem': '{ecran} · {n} gesture(s) · last on {date}',
  'ad.suivi.doorOublisTriEcranClear': 'Back to newest first',
  'ad.suivi.doorOublisTriEcranClearHint':
    'Restores the newest-first order in one gesture: the {n} screen(s) are no longer grouped, no forgetting is removed, and the notebook count stays the same.',
  'ad.suivi.doorOublisTriEcranClearHintDetail':
    'Restores the newest-first order in one gesture. The sort was grouping, screen by screen: {detail}. No forgetting is removed, and the notebook reads as one run again — its {n} screen(s) over {total} gesture(s).',
  'ad.suivi.doorOublisEcranItemNom': 'the screen {ecran}',
  'ad.suivi.doorOublisEcranTokenHint':
    'Keep only the gestures of the screen “{ecran}” in the notebook — {n} gesture(s) in it — long enough to remove one without picking the wrong neighbour; a second press brings every screen back. No forgetting is removed.',
  'ad.suivi.doorOublisEcranOn': 'Notebook narrowed to the screen “{ecran}” — {n} gesture(s)',
  'ad.suivi.doorOublisEcranOnSpan':
    ' · {n} day(s) separate its first forgetting, on {ancien}, from its last, on {recent}',
  'ad.suivi.doorOublisEcranOnOne': ' · its first and last forgetting fall on the same day, {date}',
  'ad.suivi.doorOublisEcransDeplierHint':
    'Unfolds the notebook’s {n} screen(s) one by one, over {total} gesture(s) — {detail} —, each with its own small eraser, so one screen’s forgettings can be removed without going line by line. The unfold removes nothing.',
  'ad.suivi.doorOublisEcransReplierHint':
    'The notebook’s {n} screen(s) are unfolded one by one — {detail}. One press folds them back and returns the list to its lines alone; no forgetting is removed.',
  'ad.suivi.doorOublisEcranDeplie': '{n} gesture(s)',
  'ad.suivi.doorOublisEcranGomme': 'Remove this screen’s gestures',
  'ad.suivi.doorOublisEcranGommeHint':
    'Remove from the notebook the {n} gesture(s) of the screen “{ecran}” — from {premier} to {dernier} — in a single press: the kept visits stay on this device, and the plan does not move.',
  'ad.suivi.doorOublisEcranGommeDone':
    'Screen “{ecran}” removed from the notebook: its {n} gesture(s) are gone, the kept visits stay on this device, and so does the plan.',
  'ad.suivi.doorOublisEcranNomHint':
    'Screen “{ecran}” · {n} day(s) separate its first forgetting, {premier}, from its last, {dernier}.',
  'ad.suivi.doorOublisEcranNomHintOne':
    'Screen “{ecran}” · its first and last forgetting fall on the same day, {date}.',
  'ad.suivi.doorOublisEcranNomAppui':
    'A tap keeps only this screen’s gestures — {n} in the notebook —, long enough to remove one without going through the list; a second tap removes its gestures from the notebook, like its small eraser. Tracked visits and the plan stay untouched.',
  'ad.suivi.doorOublisEcranNomAppuiOff':
    'A tap brings every screen back, without removing any forgetting.',
  'ad.suivi.doorOublisEcransRelire': 'More than one gesture · {n}',
  'ad.suivi.doorOublisEcransRelireHint':
    'Keep only the expanded screens still holding more than one gesture — {n} of {total} screen(s), holding {gestesPlusieurs} gesture(s) in all, every screen together — the ones that need re-reading: {detail}. It therefore sets aside {ecartes} screen(s), with their {gestesEcartes} gesture(s), screen by screen: {detailEcartes}. A second tap brings every screen back; no forgetting is removed.',
  'ad.suivi.doorOublisEcransRelireOffHint':
    'The expanded list only shows screens with more than one gesture — {n} of {total} screen(s), holding {gestesPlusieurs} gesture(s) in all, every screen together: {detail}. It sets aside {ecartes} screen(s), with their {gestesEcartes} gesture(s): {detailEcartes}. A tap brings every screen back, without removing any forgetting.',
  'ad.suivi.doorOublisEcransRelireAucun': 'no screen set aside',
  'ad.suivi.doorOublisEcransRelireOn':
    'Expanded list narrowed to screens with more than one gesture — {n} of {total}',
  'ad.suivi.doorOublisEcransRelireRecent':
    'Most recently emptied screen · {ecran} · {date}',
  'ad.suivi.doorOublisEcransRelireRecentNone': 'no emptied screen on this device',
  'ad.suivi.doorOublisEcransFourniHint':
    'A second tap sorts the screens from the fullest to the lightest; a third folds the expanded list. No forgetting is removed.',
  'ad.suivi.doorOublisEcransFourniOnHint':
    'The screens are sorted from the fullest to the lightest: a tap folds the expanded list, removing no forgetting.',
  'ad.suivi.doorOublisEcransFourniOn':
    'screens sorted from the fullest to the lightest — {n} of {total}',
  'ad.suivi.doorOublisEcransDeplaces':
    'Between the notebook order and the fullest-first one, {n} of {total} screens change place.',
  'ad.suivi.doorOublisEcransDeplacesNone':
    'All {total} screens keep the same place in both orders: the sort moves no row.',
  'ad.suivi.doorOublisEcransRetiresNom':
    'Screens removed from the notebook by a second press on their name · {n} — {list}. The gesture empties a screen without going through its small eraser.',
  'ad.suivi.doorOublisEcransRetiresNomNone':
    'No screen has yet left the notebook through a second press on its name: a screen’s small eraser is still the only path.',
  'ad.suivi.doorOublisEcransVieux': 'Last gesture > 7 days · {n}',
  'ad.suivi.doorOublisEcransVieuxHint':
    'Keep only the expanded screens whose last gesture is more than seven days old — {n} of {total} screen(s), holding {gestesVieux} gesture(s): {detail} — the ones no longer re-read. The re-read token, if set, stays on: both are read together. A second tap brings every screen back; no forgetting is removed.',
  'ad.suivi.doorOublisEcransVieuxOffHint':
    'The expanded list only shows screens whose last gesture is more than seven days old — {n} of {total} screen(s), holding {gestesVieux} gesture(s): {detail}. A tap brings every screen back, without removing any forgetting.',
  'ad.suivi.doorOublisEcransVieuxOn':
    'Expanded list narrowed to screens older than seven days — {n} of {total}',
  'ad.suivi.doorOublisEcransVieuxAucun': 'no screen older than seven days',
  'ad.suivi.doorOublisEcransVieuxPlusAncien':
    'The oldest is “{ecran}”, whose last gesture dates from {date} — {n} day(s) without a reread.',
  'ad.suivi.doorOublisEcransVieuxPlusAncienNone':
    'No screen has a last gesture older than seven days: nothing has slept long enough yet.',
  'ad.suivi.doorOublisEcransRetour': 'Back in the notebook · {n}',
  'ad.suivi.doorOublisEcransRetourHint':
    'Keep in the expanded list only the screens already removed by a second press on their name and then brought back to the notebook — {n} of {total} screen(s) — with the day of their return: {detail}. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetourOffHint':
    'The expanded list shows only the screens brought back to the notebook after a removal by name — {n} of {total} screen(s), with the day of their return: {detail}. A press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetourOn':
    'Expanded list narrowed to screens back in the notebook — {n} of {total}',
  'ad.suivi.doorOublisEcransRetourAucun': 'no screen back yet',
  'ad.suivi.doorOublisEcransRetourItem': '{ecran} · back on {date}',
  'ad.suivi.doorOublisEcransRetourItemN': '{ecran} · back on {date} · removed then brought back {n} times',
  'ad.suivi.doorOublisEcransRetiresPlusieurs': 'Removed > 1 · {n}',
  'ad.suivi.doorOublisEcransRetiresPlusieursHint':
    'Keep only the screens removed from the notebook by their name more than once from this device — {n} of {total} screen(s): {detail}. It removes no entry; a second click shows every screen again.',
  'ad.suivi.doorOublisEcransRetiresPlusieursOffHint':
    'The fold only shows screens removed more than once by their name — {n} of {total} screen(s): {detail}. A click shows every screen again, without removing any entry.',
  'ad.suivi.doorOublisEcransRetiresPlusieursOn':
    'Fold narrowed to screens removed more than once — {n} of {total}',
  'ad.suivi.doorOublisEcransRetiresPlusieursAucun': 'no screen removed more than once',
  'ad.suivi.doorOublisEcransRetiresPlusieursItem': '{ecran} · removed {n} times',
  'ad.suivi.doorOublisEcransRetiresPlusieursPlus':
    'The most removed is “{ecran}”, removed {n} times from this device.',
  'ad.suivi.doorOublisEcransRetiresPlusieursPlusNone':
    'No screen has been removed more than once: there is no most-removed one to name.',
  'ad.suivi.doorOublisEcransRetourDeux': 'Back twice or more · {n}',
  'ad.suivi.doorOublisEcransRetourDeuxHint':
    'Keep only the screens that came back to the notebook at least twice after being removed by their name — {n} of {total} screen(s): {detail}. It removes no omission; a second press gives every screen back.',
  'ad.suivi.doorOublisEcransRetourDeuxOffHint':
    'The unfold shows only the screens that came back at least twice — {n} of {total} screen(s): {detail}. One press gives every screen back, without removing any omission.',
  'ad.suivi.doorOublisEcransRetourDeuxOn':
    'Unfold narrowed to screens back at least twice — {n} of {total}',
  'ad.suivi.doorOublisEcransRetourDeuxAucun': 'no screen back twice yet',
  'ad.suivi.doorOublisEcransRetourDeuxItem': '{ecran} · back {n} times',
  'ad.suivi.doorOublisEcransRetourDeuxPlus':
    'The most returned is “{ecran}”, back {n} times in the booklet.',
  'ad.suivi.doorOublisEcransRetourDeuxPlusNone':
    'No screen has come back twice yet: there is no most returned to name.',
  'ad.suivi.doorOublisEcransRepartis': 'Back then gone · {n}',
  'ad.suivi.doorOublisEcransRepartisHint':
    'Only keep in the drawer the screens that came back to the booklet and were then removed again by their name — {n} screen(s), with the day of their last removal: {detail}. It removes no forgotten visit; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRepartisOffHint':
    'The drawer only shows the screens that came back to the booklet then left it again — {n} screen(s), with the day of their last removal: {detail}. A press restores every screen, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRepartisOn':
    'Drawer narrowed to the screens that came back then left — {n} screen(s)',
  'ad.suivi.doorOublisEcransRepartisAucun': 'no screen back then gone',
  'ad.suivi.doorOublisEcransRepartisItem': '{ecran} · removed again on {date}',
  'ad.suivi.doorOublisEcransRepartisVieux': 'Gone > 7 d · {n}',
  'ad.suivi.doorOublisEcransRepartisVieuxHint':
    'Keep only the screens that came back to the notebook and left again more than seven days ago — {n} of {total} screen(s), with the day of their last removal: {detail}. It removes no entry; a second click returns every screen.',
  'ad.suivi.doorOublisEcransRepartisVieuxOffHint':
    'The fold shows only the screens gone for more than seven days — {n} of {total} screen(s), with the day of their last removal: {detail}. One click returns every screen, without removing any entry.',
  'ad.suivi.doorOublisEcransRepartisVieuxOn':
    'Fold narrowed to screens gone more than seven days ago — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisVieuxAucun': 'no screen gone more than seven days',
  'ad.suivi.doorOublisEcransRepartisVieuxPlusAncien':
    'The longest gone is “{ecran}”, removed on {date} — {n} day(s) out of the notebook.',
  'ad.suivi.doorOublisEcransRepartisVieuxPlusAncienNone':
    'No screen has been gone for more than seven days: there is no oldest departure to name.',
  'ad.suivi.doorOublisEcransRepartisMois': 'Left this month · {n}',
  'ad.suivi.doorOublisEcransRepartisMoisHint':
    'Keep only the screens that came back to the notebook and then left again with their last removal falling in the current month — {n} of {total} gone screen(s), with the day of that removal: {detail}. It removes no forgetting; a second tap brings every screen back.',
  'ad.suivi.doorOublisEcransRepartisMoisOffHint':
    'The fold only shows the screens that left with their last removal in the current month — {n} of {total} screen(s), with the day of that removal: {detail}. One tap brings every screen back, without removing any forgetting.',
  'ad.suivi.doorOublisEcransRepartisMoisOn':
    'Fold narrowed to the screens that left this month — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisMoisAucun': 'no screen left this month',
  'ad.suivi.doorOublisEcransRepartisMoisPlusAncien':
    'Gone longest this month is “{ecran}”, removed on {date} — {n} day(s) out of the notebook.',
  'ad.suivi.doorOublisEcransRepartisMoisPlusAncienNone':
    'No screen has left this month: there is no oldest departure to name.',
  'ad.suivi.doorOublisEcransRepartisMoisSpan':
    'Between its oldest departure on {ancien} and its newest on {recent}, {n} day(s) separate the screens gone this month.',
  'ad.suivi.doorOublisEcransRepartisMoisSpanOne':
    'Every screen gone this month left on the same day, {date}: no gap of days to read here.',
  'ad.suivi.doorOublisEcransRepartisSemaine': 'Left this week · {n}',
  'ad.suivi.doorOublisEcransRepartisSemaineHint':
    'Keep only the screens that came back to the notebook and then left again with their last removal falling in the current week — {n} of {total} gone screen(s), with the day of that removal: {detail}. It removes no forgetting; a second tap brings every screen back.',
  'ad.suivi.doorOublisEcransRepartisSemaineOffHint':
    'The fold only shows the screens that left with their last removal in the current week — {n} of {total} screen(s), with the day of that removal: {detail}. One tap brings every screen back, without removing any forgetting.',
  'ad.suivi.doorOublisEcransRepartisSemaineOn':
    'Fold narrowed to the screens that left this week — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisSemaineAucun': 'no screen left this week',
  'ad.suivi.doorOublisEcransRepartisSemainePlusRecent':
    'The most recent departure this week is "{ecran}", removed on {date} — {n} day(s) ago.',
  'ad.suivi.doorOublisEcransRepartisSemainePlusRecentNone':
    'No screen has left this week: there is no recent departure to name.',
  'ad.suivi.doorOublisEcransRepartisSemainePlusAncien':
    'The oldest departure this week is “{ecran}”, removed on {date} — {n} day(s) elapsed.',
  'ad.suivi.doorOublisEcransRepartisSemainePlusAncienNone':
    'No screen has left this week: there is no older departure to name.',
  'ad.suivi.doorOublisEcransRepartisHier': 'Left yesterday · {n}',
  'ad.suivi.doorOublisEcransRepartisAvantHier': 'Left the day before yesterday · {n}',
  'ad.suivi.doorOublisEcransRepartisAvantHierHint':
    'Keep only the screens that came back to the notebook then left again, whose last removal falls the day before yesterday — {n} of {total} departed screen(s), with the day of that removal: {detail}. It removes no note; a second tap shows every screen.',
  'ad.suivi.doorOublisEcransRepartisAvantHierOffHint':
    'The list shows only the screens that left the day before yesterday — {n} of {total} screen(s): {detail}. One tap shows every screen, without removing any note.',
  'ad.suivi.doorOublisEcransRepartisAvantHierOn':
    'List narrowed to the screens that left the day before yesterday — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisAvantHierAucun': 'no screen left the day before yesterday',
  'ad.suivi.doorOublisEcransRepartisAvantHierEcartes':
    'It sets aside {n} line(s) of the list, out of {total} departed screen(s).',
  'ad.suivi.doorOublisEcransRepartisQuinzaine': 'Left these fifteen days · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineHint':
    'Keep only the screens that came back then left during the last fifteen days in the list — {n} of {total} departed screen(s), with the day of that removal: {detail}. It removes no record; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineOffHint':
    'The list only shows the screens that left during the last fifteen days — {n} of {total} screen(s), with the day of that removal: {detail}. A press brings every screen back, without removing any record.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineOn':
    'List narrowed to the screens that left these fifteen days — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineAucun':
    'no screen left in the last fifteen days',
  'ad.suivi.doorOublisEcransRepartisQuinzaineEcartes':
    'It sets aside {n} line(s) of the list, out of {total} departed screen(s).',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemainePart':
    'Of these, {n} screen(s) left during the current week, out of {total} in the fortnight.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemainePartNone':
    'None of these {total} screen(s) left during the current week.',
  'ad.suivi.doorOublisCsvRepartisSemaineTotal':
    'Screens that left this week: {n} screen(s), counted day by day in the file.',
  'ad.suivi.doorOublisCsvRepartisSemaineTotalNone':
    'Screens that left this week: no departure this week, and the file line says so day by day.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenus':
    'Left within fifteen days and back since · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusHint':
    'Keep only the screens that left within the fortnight and were brought back to the notebook since — {n} of {total} screen(s) gone —, with the day of their last removal and that of their return: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusOffHint':
    'The list shows only the screens that left within the fortnight and came back to the notebook — {n} of {total} screen(s) gone: {detail}. One press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusOn':
    'List narrowed to the screens that left within the fortnight and came back — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusAucun':
    'no screen that left within the fortnight has come back to the notebook',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusItem':
    '{ecran} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusEcartes':
    'It sets aside {n} line(s) of the list, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusDelai':
    'Average delay between departure and return: {n} day(s), screen by screen, over {k} returned screen(s).',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusDelaiOne':
    'Delay between departure and return: a single returned screen, {n} day(s) kept — the average says nothing more.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRevenusDelaiNone':
    'Delay between departure and return: no dated return on these screens, so the delay cannot be read yet.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamais':
    'Gone this fortnight, never back · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisHint':
    'The fold keeps only the screens that left within the fortnight and that nothing has brought back to the notebook since — {n} out of {total} screen(s) gone — with the day of their departure: {detail}. It removes no forgetting; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisOffHint':
    'The fold shows only the screens that left within the fortnight and never came back — {n} out of {total} screen(s): {detail}. One press brings every screen back, without removing any forgetting.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisOn':
    'Fold narrowed to the screens gone with no return — {n} out of {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisAucun':
    'no screen gone is still waiting to come back',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisItem':
    '{ecran} · gone on {date} · never back',
  'ad.suivi.doorOublisEcransRepartisQuinzaineJamaisEcartes':
    'It keeps {n} fold line(s) out of view, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisCsvQuinzaineRevenusCount':
    'Screens kept by the token “gone within the fortnight and back since”: {n}, with their departure and return.',
  'ad.suivi.doorOublisCsvQuinzaineRevenusCountNone':
    'Screens kept by the token “gone within the fortnight and back since”: none for now, the token keeps nothing.',
  'ad.suivi.doorOublisCsvCumulPeriode':
    'Cumulative total period: {n} day(s) between the first departure, on {ancien}, and the last, on {recent}.',
  'ad.suivi.doorOublisCsvCumulPeriodeOne':
    'Cumulative total period: a single departure day is kept, on {date}.',
  'ad.suivi.doorOublisCsvCumulPeriodeNone':
    'Cumulative total period: no dated departure on this device, so the period cannot be read yet.',
  'ad.suivi.doorOublisCsvSemaineDelai':
    'Average return delay for the current week: {n} day(s) across {k} dated return(s).',
  'ad.suivi.doorOublisCsvSemaineDelaiOne':
    'Return delay for the current week: a single dated return, {n} day(s) kept.',
  'ad.suivi.doorOublisCsvSansRetour':
    'Screens with no return at all: {n} screen(s) gone that nothing has ever brought back to the ledger.',
  'ad.suivi.doorOublisCsvSansRetourNone':
    'No screen without a return: every screen gone has a return on record.',
  'ad.suivi.doorOublisCsvHorsQuinzaine':
    'Returns beyond fifteen days: {n} return(s) after a departure already outside the fifteen days, across the whole history of dated returns.',
  'ad.suivi.doorOublisCsvHorsQuinzaineNone':
    'Returns beyond fifteen days: no return after a departure outside the fifteen days.',
  'ad.suivi.doorOublisCsvSemaineDelaiNone':
    'Return delay for the current week: no dated return this week.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaine':
    'Gone this fortnight, back since · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineHint':
    'Keep only the screens that left within the fortnight and came back to the notebook during the current week — {n} of {total} screen(s) gone —, with the day they left and the day they came back: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineOffHint':
    'The list only shows the screens that left within the fortnight and came back this week — {n} of {total} screen(s) gone: {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineOn':
    'List narrowed to the screens gone within the fortnight and back this week — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineAucun':
    'no screen gone within the fortnight has come back this week',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineItem':
    '{ecran} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSemaineEcartes':
    'It sets aside {n} line(s) of the list, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifs':
    'Gone within fifteen days, back after more than seven · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsHint':
    'Keep only the late returns of the fifteen days — {n} of {total} screen(s) gone — those whose return follows the departure by more than seven days, with both dates and their delay: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsOffHint':
    'The list shows only the screens gone within fifteen days that came back more than seven days later — {n} of {total} screen(s), with their delay: {detail}. One press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsOn':
    'List narrowed to the late returns of the fifteen days — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsAucun':
    'no late return within the fifteen days',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsItem':
    '{ecran} · gone on {date} · back on {retour} · {n} day(s)',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsEcartes':
    'It sets aside {n} line(s) of the list, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPlusRapide':
    'The fastest return is “{ecran}”, back {n} day(s) after a departure on {date}.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPlusLent':
    'The slowest is “{ecran}”, back {n} day(s) after a departure on {date}.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsBoutsNone':
    'None of these screens has a late return yet: neither the fastest nor the slowest can be named.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPart':
    'These slow returns make {n} return(s) out of {k} in the fifteen days, i.e. {pct} % of the dated returns.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineTardifsPartNone':
    'No dated return within the fifteen days: the share of slow returns cannot be read.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapides':
    'Fast returns of the fifteen days · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesHint':
    'Keep only the fast returns of the fifteen days — {n} of {total} screen(s) gone — those back within seven days or less of their departure, with both dates and their delay: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesOffHint':
    'The list shows only the screens gone within fifteen days that came back within seven days or less — {n} of {total} screen(s), with their delay: {detail}. One press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesOn':
    'List narrowed to the fast returns of the fifteen days — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesAucun':
    'no fast return within the fifteen days',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesItem':
    '{ecran} · gone on {date} · back on {retour} · {n} day(s)',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesEcartes':
    'It sets aside {n} line(s) of the list, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesPlusRapide':
    'The shortest return is “{ecran}”, back {n} day(s) after a departure on {date}.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesPlusLent':
    'The longest is “{ecran}”, back {n} day(s) after a departure on {date}.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineRapidesBoutsNone':
    'None of these screens has a fast return yet: neither the shortest nor the longest can be named.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaine':
    'Returns after more than fifteen days · {n}',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineHint':
    'Keep only the returns after more than fifteen days — {n} of {total} screen(s) gone — those back after a departure already outside the fifteen days, with both dates and their delay: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineOffHint':
    'The list shows only the screens back after a departure already outside the fifteen days — {n} of {total} screen(s), with their delay: {detail}. One press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineOn':
    'List narrowed to the returns after more than fifteen days — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineAucun':
    'no return after a departure outside the fifteen days',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineItem':
    '{ecran} · gone on {date} · back on {retour} · {n} day(s)',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineEcartes':
    'It sets aside {n} line(s) of the list, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunis':
    'Fast and late returns together · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisHint':
    'Keep only the two sets of the fifteen days together — {n} of {total} screen(s) gone — the fast returns and the late returns gathered in a single press, with both dates and their delay: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisOffHint':
    'The list shows the fast and late returns of the fifteen days together — {n} of {total} screen(s), with their delay: {detail}. One press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisOn':
    'List narrowed to the two sets of the fifteen days together — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisAucun':
    'no dated return within the fifteen days, both sets are empty',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisItem':
    '{ecran} · gone on {date} · back on {retour} · {n} day(s)',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisEcartes':
    'It sets aside {n} line(s) of the list, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisPart':
    'The two sets together make {n} return(s) out of {total} screen(s) gone in the fifteen days, i.e. {pct} % of the departures of those fifteen days.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineReunisPartNone':
    'No screen gone in the fifteen days: the share of the two sets cannot be divided yet.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzainePlusRapide':
    'The fastest return of the set is “{ecran}”, back {n} day(s) after a departure on {date}.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzainePlusLent':
    'The slowest is “{ecran}”, back {n} day(s) after a departure on {date}.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzaineBoutsNone':
    'None of these screens has a return yet: neither the fastest nor the slowest can be named.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzainePart':
    'These returns make {n} out of {total} dated return(s) across the whole history, i.e. {pct} % of the dated returns.',
  'ad.suivi.doorOublisEcransRepartisHorsQuinzainePartNone':
    'No dated return in the history: the share of the returns after more than fifteen days cannot be divided yet.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetour':
    'Fifteen days with no return at all · {n}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourHint':
    'Keep only the screens gone within the fifteen days that no return has ever brought back — {n} of {total} screen(s) gone —, neither before nor after that departure, with the day of their removal: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourOffHint':
    'The list shows only the screens gone within the fifteen days with no return at all to the ledger — {n} of {total} screen(s): {detail}. One press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourOn':
    'List narrowed to the fifteen days with no return at all — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourAucun':
    'no screen gone within the fifteen days is without any return',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourItem':
    '{ecran} · gone on {date} · no return to the ledger',
  'ad.suivi.doorOublisEcransRepartisQuinzaineSansRetourEcartes':
    'It sets aside {n} line(s) of the list, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransJumeaux':
    'Twins — “No dated return” keeps {a} screen(s), “Dated returns” keeps {b}',
  'ad.suivi.doorOublisEcransRetoursDatesPlusCourt':
    'The shortest delay in the set is “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesPlusLong':
    'The longest is “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesBoutsNone':
    'No dated return in this set: neither a short nor a long delay can be read.',
  'ad.suivi.doorOublisEcransAucunRetour': 'No dated return · {n}',
  'ad.suivi.doorOublisEcransAucunRetourHint':
    'Keep only the screens whose history carries no return date at all — {n} of {total} screen(s) gone —, with the day of their last removal: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransAucunRetourOffHint':
    'The list shows only the screens whose history carries no return date at all — {n} of {total} screen(s): {detail}. One press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransAucunRetourOn':
    'List narrowed to the screens with no return date at all — {n} of {total}',
  'ad.suivi.doorOublisEcransAucunRetourAucun': 'no screen without any return date',
  'ad.suivi.doorOublisEcransAucunRetourItem':
    '{ecran} · removed on {date} · no return date at all',
  'ad.suivi.doorOublisEcransAucunRetourEcartes':
    'It sets aside {n} line(s) of the list, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransAucunRetourPlusAncien':
    'The oldest departure in the lot is “{ecran}”, gone on {date}: {n} day(s) elapsed since.',
  'ad.suivi.doorOublisEcransAucunRetourPlusAncienNone':
    'No departure in this lot: no day to count.',
  'ad.suivi.doorOublisEcransRetoursDates': 'Dated returns · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesHint':
    'Keep only the screens whose history carries at least one return date — {n} of {total} screen(s) gone —, with the day of their last removal: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesOffHint':
    'The list only shows the screens that carry at least one return date — {n} of {total} screen(s): {detail}. A press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRetoursDatesOn':
    'List narrowed to the screens carrying at least one return date — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAucun':
    'no screen carries a return date',
  'ad.suivi.doorOublisEcransRetoursDatesItem':
    '“{ecran}” — last removal on {date}',
  'ad.suivi.doorOublisEcransRetoursDatesEcartes':
    'It sets aside {n} line(s) of the list, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesPlusAnciens':
    'The list shows one return per screen: it sets aside {n} older dated return(s), out of {total} dated return(s) across these screens.',
  'ad.suivi.doorOublisEcransRetoursDatesPlusAnciensNone':
    'The list shows every dated return of these screens: no older return is set aside.',
  'ad.suivi.doorOublisEcransRetoursDatesSemaine': 'Dated returns this week · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineHint':
    'Keep only the screens that came back this week with a date — {n} of {total} screen(s) gone —, with the day of their last removal and that of their return: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineOffHint':
    'The list only shows the screens that came back this week with a date — {n} of {total} screen(s): {detail}. A press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineOn':
    'List narrowed to the screens that came back this week with a date — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineAucun':
    'no screen came back with a date this week',
  'ad.suivi.doorOublisEcransRetoursDatesSemainePlusCourt':
    'The shortest delay in the set is “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesSemainePlusLong':
    'The longest is “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesSemaineBoutsNone':
    'No dated return in this set: neither a short nor a long delay can be read.',
  'ad.suivi.doorOublisEcransRetoursDatesMois': 'Dated returns this month · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisHint':
    'Keep only the screens that came back this month with a date — {n} of {total} screen(s) gone —, with the day of their last removal and that of their return: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisOffHint':
    'The list only shows the screens that came back this month with a date — {n} of {total} screen(s): {detail}. A press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisOn':
    'List narrowed to the screens that came back this month with a date — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisAucun':
    'no screen came back with a date this month',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEcartes':
    'It keeps {n} fold line(s) out of view, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisPlusCourt':
    'The shortest delay in the batch is « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisPlusLong':
    'The longest is « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisBoutsNone':
    'No dated return this month: the batch names no one.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernier':
    'Dated returns last month · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierHint':
    'Keep only the screens that came back last month with a date — {n} of {total} screen(s) gone, the window that has just closed —, with the day of their last removal and that of their return: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierOffHint':
    'The list only shows the screens that came back last month with a date — {n} of {total} screen(s): {detail}. One press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierOn':
    'List narrowed to the screens that came back last month with a date — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierAucun':
    'no screen came back with a date last month',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierEcartes':
    'It sets {n} row(s) of the list aside, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierPlusCourt':
    'The shortest delay in the batch is « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierPlusLong':
    'The longest is « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierBoutsNone':
    'No dated return last month: the batch names no one.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMois':
    'Dated returns the month before last · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisHint':
    'Keep only the screens that came back the month before last with a date — {n} of {total} screen(s) gone, the second closed window —, with the day of their last removal and that of their return: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisOffHint':
    'The list only shows the screens that came back the month before last with a date — {n} of {total} screen(s): {detail}. One press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisOn':
    'List narrowed to the screens that came back the month before last with a date — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisAucun':
    'no screen came back with a date the month before last',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisEcartes':
    'It sets {n} row(s) of the list aside, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisPlusCourt':
    'The shortest delay in the lot is “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisPlusLong':
    'The longest is “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisBoutsNone':
    'This window carries no dated return: the lot names neither the shortest nor the longest.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetres':
    'Two closed windows · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresHint':
    'Keep only the screens that came back in one of the two closed windows — last month or the month before last — {n} of {total} screen(s) gone —, with each one’s window, the day of its last removal and that of its return: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresOffHint':
    'The list only shows the screens that came back in one of the two closed windows — {n} of {total} screen(s): {detail}. One press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresOn':
    'List narrowed to the two closed windows — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresAucun':
    'no screen came back with a date in these two windows',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresEcartes':
    'It sets {n} row(s) of the list aside, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresRepartis':
    'Last month: {a} screen(s) · month before last: {b} screen(s) — {n} in all, no screen in both at once.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresItem':
    '{ecran} · {fenetre} · gone on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresMoisDernier': 'last month',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresAvantDernier':
    'month before last',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestre': 'Dated returns this quarter · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreHint':
    'Keep only the screens that came back over the last three months with a date — {n} of {total} screen(s) gone —, with the day of their last removal and that of their return: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreOffHint':
    'The list only shows the screens that came back over the last three months with a date — {n} of {total} screen(s): {detail}. A press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreOn':
    'List narrowed to the screens that came back over the last three months with a date — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreAucun':
    'no screen came back with a date over the last three months',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreEcartes':
    'It keeps {n} fold line(s) out of view, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusCourt':
    'The shortest delay in the batch is « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusLong':
    'The longest is « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreBoutsNone':
    'No dated return over the last three months: the batch names no one.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusRecent':
    'The most recent return in the batch is “{ecran}”, back on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestrePlusRecentNone':
    'No dated return this quarter: the batch names no one.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresBoutsMoisDernier':
    'Last month — shortest « {court} » in {jc} day(s), back on {dc}; longest « {long} » in {jl} day(s), back on {dl}.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresBoutsAvantDernier':
    'Month before last — shortest « {court} » in {jc} day(s), back on {dc}; longest « {long} » in {jl} day(s), back on {dl}.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxFenetresBoutsNone':
    'Neither closed window holds a dated return: the two batches name no one.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFerme':
    'Dated returns in the closed quarter · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeHint':
    'Keep only the screens that came back with a date over the three months before the current one — {n} of {total} screen(s) gone —, with the day of their last removal and that of their return: {detail}. The current month stays out. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeOffHint':
    'The list shows only the screens that came back with a date over the three closed months — {n} of {total} screen(s): {detail}. The current month stays out. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeOn':
    'List narrowed to the closed quarter — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAucun':
    'no dated return over the three closed months',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeEcartes':
    'It sets {n} line(s) aside from the list, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermePlusRecent':
    'The screen that came back most recently in the batch is “{ecran}”, back on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermePlusRecentNone':
    'No screen in the batch carries a return date: the closed quarter names no one.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernier':
    'Closed quarter and last month · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierHint':
    'Keep only the screens that came back with a date in the closed quarter or last month — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal and that of its return: {detail}. Last month is already counted inside the closed quarter, so no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierOffHint':
    'The fold only shows the screens of the closed quarter and last month — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierOn':
    'Fold narrowed to the closed quarter and last month — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierAucun':
    'no dated return in the closed quarter or last month',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierRepartis':
    'Closed quarter: {a} screen(s) · last month: {b} screen(s) — {n} in all, last month already counted inside the closed quarter.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtMois':
    'Last month — shortest: « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtTrimestre':
    'Closed quarter — shortest: « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtMoisNone':
    'Last month — no dated return: no shortest delay to name.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtTrimestreNone':
    'Closed quarter — no dated return: no shortest delay to name.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierCourtNone':
    'No dated return in either window: no shortest delay to name.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierFenetreMois':
    'last month',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeMoisDernierFenetreTrimestre':
    'closed quarter',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermee':
    'Dated returns in the closed year · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeHint':
    'Keep only the screens that came back over the twelve months before the current month with a date — {n} of {total} screen(s) gone —, with the day of their last removal and that of their return: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeOffHint':
    'The list only shows the screens that came back over the closed twelve months with a date — {n} of {total} screen(s): {detail}. A press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeOn':
    'List narrowed to the screens that came back with a date over the closed twelve months — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAucun':
    'no screen came back with a date over the closed twelve months',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeEcartes':
    'It keeps {n} fold line(s) out of view, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeePlusCourt':
    'The shortest of the lot: “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeePlusLong':
    'The longest: “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeBoutsNone':
    'No dated return over the closed twelve months: the two ends of the lot cannot be named.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFerme':
    'Closed year and closed quarter · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeHint':
    'Keep only the screens that came back with a date over the closed year or the closed quarter — {n} of {total} screen(s) gone —, each carrying its window, with the day of their last removal and that of their return: {detail}. The closed quarter is already counted in the closed year: no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeOffHint':
    'The list only shows the screens of the closed year and the closed quarter — {n} of {total} screen(s): {detail}. A press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeOn':
    'List narrowed to the closed year and the closed quarter — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeAucun':
    'no dated return over the closed year nor the closed quarter',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeEcartes':
    'It keeps {n} fold line(s) out of view, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRepartis':
    'Closed year: {a} screen(s) · closed quarter: {b} screen(s) — {n} in all, the closed quarter already counted in the closed year.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeFenetreAnnee':
    'closed year',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeFenetreTrimestre':
    'closed quarter',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsMois':
    'Closed quarter — the most recently returned screen: “{ecran}”, on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsMoisNone':
    'Closed quarter — no screen came back with a date.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsAnnee':
    'Closed year — the most recently returned screen: “{ecran}”, on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeRecentsAnneeNone':
    'Closed year — no screen came back with a date.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermes':
    'Dated returns over the last two closed months · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesHint':
    'Keep only the screens that came back with a date over the month before last or the closed year — {n} of {total} screen(s) gone —, each carrying its window, with the day of their last removal and that of their return: {detail}. The month before last is already counted in the closed year: no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesOffHint':
    'The list only shows the screens of the month before last and the closed year — {n} of {total} screen(s): {detail}. A press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesOn':
    'List narrowed to the month before last and the closed year — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesAucun':
    'no dated return over the month before last nor the closed year',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesEcartes':
    'It keeps {n} fold line(s) out of view, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesRepartis':
    'Closed year: {a} screen(s) · month before last: {b} screen(s) — {n} in all, the month before last already counted in the closed year.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesFenetreMois':
    'month before last',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesFenetreAnnee':
    'closed year',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtMois':
    'Month before last — shortest « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtMoisNone':
    'Month before last — no dated return.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtAnnee':
    'Closed year — shortest « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtAnneeNone':
    'Closed year — no dated return.',
  'ad.suivi.doorOublisEcransRetoursDatesDeuxMoisFermesCourtNone':
    'Neither of the two windows holds a dated return: the two batches name no one.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernier':
    'Dated returns over the month before last and last month · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierHint':
    'Keep only the screens that came back with a date over the month before last or last month — {n} of {total} screen(s) gone —, each carrying its window, with the day of their last removal and that of their return: {detail}. The two months do not overlap: no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierOffHint':
    'The list only shows the screens of the month before last and last month — {n} of {total} screen(s): {detail}. A press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierOn':
    'List narrowed to the month before last and last month — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierAucun':
    'no dated return over the month before last nor last month',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierEcartes':
    'It keeps {n} fold line(s) out of view, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRepartis':
    'Last month: {a} screen(s) · month before last: {b} screen(s) — {n} in all, no screen in both months at once.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierFenetreMoisDernier':
    'last month',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierFenetreAvantDernier':
    'month before last',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsMoisDernier':
    'Last month — the most recently returned screen: “{ecran}”, on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsMoisDernierNone':
    'Last month — no screen came back with a date.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsAvantDernier':
    'Month before last — the most recently returned screen: “{ecran}”, on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisDernierRecentsAvantDernierNone':
    'Month before last — no screen came back with a date.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFerme':
    'Last month and closed quarter · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeHint':
    'Keep only the screens that came back with a date over last month or the closed quarter — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal and that of its return: {detail}. Last month is already counted inside the closed quarter, so no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeOffHint':
    'The fold only shows the screens of last month and the closed quarter — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeOn':
    'Fold narrowed to last month and the closed quarter — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeAucun':
    'no dated return over last month nor the closed quarter',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeRepartis':
    'Last month: {a} screen(s) · closed quarter: {b} screen(s) — {n} in all, last month already counted inside the closed quarter.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeFenetreMoisDernier':
    'last month',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeFenetreTrimestre':
    'closed quarter',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtMois':
    'Last month — shortest: “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtMoisNone':
    'Last month — shortest: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtTrimestre':
    'Closed quarter — shortest: “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtTrimestreNone':
    'Closed quarter — shortest: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFermeCourtNone':
    'Shortest of each window: no dated return over last month nor the closed quarter.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFerme':
    'Month before last and closed quarter · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeHint':
    'Keep only the screens that came back with a date over the month before last or the closed quarter — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal and that of its return: {detail}. The month before last is already counted inside the closed quarter, so no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeOffHint':
    'The fold only shows the screens of the month before last and the closed quarter — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeOn':
    'Fold narrowed to the month before last and the closed quarter — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeAucun':
    'no dated return over the month before last nor the closed quarter',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeRepartis':
    'Month before last: {a} screen(s) · closed quarter: {b} screen(s) — {n} in all, the month before last already counted inside the closed quarter.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeFenetreAvantDernier':
    'month before last',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeFenetreTrimestre':
    'closed quarter',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtAvantDernier':
    'Month before last — shortest: “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtAvantDernierNone':
    'Month before last — shortest: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtTrimestre':
    'Closed quarter — shortest: “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtTrimestreNone':
    'Closed quarter — shortest: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeCourtNone':
    'Shortest of each window: no dated return over the month before last nor the closed quarter.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeTrimestre':
    'Closed quarter — middle of the lot: {n} day(s) over {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeTrimestreNone':
    'Closed quarter — middle of the lot: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeAvantDernier':
    'Month before last — middle of the lot: {n} day(s) over {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeAvantDernierNone':
    'Month before last — middle of the lot: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisTrimestreFermeMedianeNone':
    'Middle of each window’s lot: no dated return over the closed quarter nor the month before last.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFerme':
    'Closed quarter and closed year · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeHint':
    'Keep only the screens that came back with a date over the closed quarter or the closed year — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal and that of its return: {detail}. The closed quarter is already counted inside the closed year, so no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeOffHint':
    'The fold only shows the screens of the closed quarter and the closed year — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeOn':
    'Fold narrowed to the closed quarter and the closed year — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeAucun':
    'no dated return over the closed quarter nor the closed year',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeRepartis':
    'Closed quarter: {a} screen(s) · closed year: {b} screen(s) — {n} in all, the closed quarter already counted inside the closed year.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeFenetreTrimestre':
    'closed quarter',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAnneeFermeFenetreAnnee':
    'closed year',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernier':
    'Closed year and last month · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierHint':
    'Keep only the screens that came back with a date over the closed year or last month — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal and that of its return: {detail}. Last month is already counted inside the closed year, so no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierOffHint':
    'The fold only shows the screens of the closed year and last month — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierOn':
    'Fold narrowed to the closed year and last month — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierAucun':
    'no dated return over the closed year nor last month',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierRepartis':
    'Last month: {a} screen(s) · closed year: {b} screen(s) — {n} in all, last month already counted inside the closed year.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierFenetreMoisDernier':
    'last month',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierFenetreAnnee':
    'closed year',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourt':
    'The window that comes back fastest is {fenetre} — last month: {a} day(s) · closed year: {b} day(s), side by side.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtTie':
    'Both windows come back at the same pace — last month: {a} day(s) · closed year: {b} day(s), side by side.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtOne':
    'Only one window has a dated return — {fenetre}: {n} day(s); the other has none.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisDernierCourtNone':
    'Neither window has a dated return: the fastest one cannot be named yet.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeTrimestre':
    'Closed quarter — middle of the lot: {n} day(s) over {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeTrimestreNone':
    'Closed quarter — middle of the lot: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeAnnee':
    'Closed year — middle of the lot: {n} day(s) over {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeAnneeNone':
    'Closed year — middle of the lot: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFermeMedianeNone':
    'Middle of each window’s lot: no dated return over the closed quarter nor the closed year.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCours':
    'Closed year and current month · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursHint':
    'Keep only the screens that came back with a date over the closed year or the current month — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal and that of its return: {detail}. The two windows do not overlap: no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursOffHint':
    'The fold only shows the screens of the closed year and the current month — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursOn':
    'Fold narrowed to the closed year and the current month — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursAucun':
    'no dated return over the closed year nor the current month',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRepartis':
    'Current month: {a} screen(s) · closed year: {b} screen(s) — {n} in all, the two windows not overlapping.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursFenetreMoisEnCours':
    'current month',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursFenetreAnnee':
    'closed year',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsMoisEnCours':
    'Current month — the most recent « {ecran} », back on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsMoisEnCoursNone':
    'Current month — no dated return.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsAnnee':
    'Closed year — the most recent « {ecran} », back on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeMoisEnCoursRecentsAnneeNone':
    'Closed year — no dated return.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernier':
    'Current month and last month · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierHint':
    'Keep only the screens that came back with a date this month or last month — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal and that of its return: {detail}. The two months do not overlap: no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierOffHint':
    'The fold only shows the screens of the current month and the last month — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierOn':
    'Fold narrowed to the current month and the last month — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierAucun':
    'no dated return this month nor last month',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierRepartis':
    'Current month: {a} screen(s) · last month: {b} screen(s) — {n} in all, the two months not overlapping.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisEnCours':
    'Current month — middle of the lot: {n} day(s) over {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisEnCoursNone':
    'Current month — middle of the lot: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisDernier':
    'Last month — middle of the lot: {n} day(s) over {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeMoisDernierNone':
    'Last month — middle of the lot: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierMedianeNone':
    'Middle of each month’s lot: no dated return over the current month nor the last month.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCours':
    'Month before last and current month · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursHint':
    'Keep only the screens that came back with a date the month before last or this month — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal and that of its return: {detail}. The two months do not overlap: no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursOffHint':
    'The fold only shows the screens of the month before last and the current month — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursOn':
    'Fold narrowed to the month before last and the current month — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursAucun':
    'no dated return the month before last nor this month',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursRepartis':
    'Month before last: {a} screen(s) · current month: {b} screen(s) — {n} in all, the two months not overlapping.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursFenetreAvantDernier':
    'month before last',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursFenetreMoisEnCours':
    'current month',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeNone':
    'Month before last and current month — middle of the lot: no dated return in either window.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeAvantDernier':
    'Month before last — middle of the lot: {n} day(s) over {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeAvantDernierNone':
    'Month before last — middle of the lot: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeMoisEnCours':
    'Current month — middle of the lot: {n} day(s) over {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAvantDernierMoisMoisEnCoursMedianeMoisEnCoursNone':
    'Current month — middle of the lot: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestre':
    'Last month and current quarter · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreHint':
    'Keep only the screens that came back with a date last month or over the current quarter — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal and that of its return: {detail}. Last month is already contained in the quarter: no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreOffHint':
    'The fold only shows the screens of the last month and the current quarter — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreOn':
    'Fold narrowed to the last month and the current quarter — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreAucun':
    'no dated return last month nor over the current quarter',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreRepartis':
    'Last month: {a} screen(s) · current quarter: {b} screen(s) — {n} in all, the last month already counted in the quarter.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFenetreMoisDernier':
    'last month',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreFenetreTrimestre':
    'current quarter',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeNone':
    'Last month and current quarter — middle of the lot: no dated return in either window.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeMoisDernier':
    'Last month — middle of the lot: {n} day(s) over {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeMoisDernierNone':
    'Last month — middle of the lot: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeTrimestre':
    'Current quarter — middle of the lot: {n} day(s) over {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesMoisDernierTrimestreMedianeTrimestreNone':
    'Current quarter — middle of the lot: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestre':
    'Closed year and current quarter · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreHint':
    'Keep only the screens that came back with a date over the closed year or the current quarter — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal and that of its return: {detail}. The last month and the month before last sit in both windows: a screen already named does not come back twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreOffHint':
    'The fold only shows the screens of the closed year and the current quarter — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreOn':
    'Fold narrowed to the closed year and the current quarter — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreAucun':
    'no dated return over the closed year nor the current quarter',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreRepartis':
    'Closed year: {a} screen(s) · current quarter: {b} screen(s) — {n} in all, a screen already named by the year does not come back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFenetreAnnee':
    'closed year',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreFenetreTrimestre':
    'current quarter',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeNone':
    'Closed year and current quarter — middle of the lot: no dated return in either window.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeAnnee':
    'Closed year — middle of the lot: {n} day(s) over {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeAnneeNone':
    'Closed year — middle of the lot: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeTrimestre':
    'Current quarter — middle of the lot: {n} day(s) over {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreMedianeTrimestreNone':
    'Current quarter — middle of the lot: no dated return in that window.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtAnnee':
    'The shorter middle is the closed year’s: {n} day(s) — it is the one that comes back faster.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtTrimestre':
    'The shorter middle is the current quarter’s: {n} day(s) — it is the one that comes back faster.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreCourtEgal':
    'Both windows share the same middle: {n} day(s) on either side — neither settles it.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeule':
    'Closed year alone · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleHint':
    'Keep only the screens the closed year names and no other token of the series does — {n} of {total} screen(s) gone —, with the day of their last removal and that of their return: {detail}. Neither the current month, nor the last month, nor the month before last, nor the closed quarter, nor the week names them: this is what the year adds alone. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleOffHint':
    'The fold only shows the screens the closed year names alone — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleOn':
    'Fold narrowed to what the closed year adds alone — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleAucun':
    'no screen named by the closed year alone',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleItem':
    '{ecran} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleRepartis':
    'Closed year: {a} screen(s) named, no other token of the series keeps them — {n} in all, what the year adds alone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleMediane':
    'Closed year alone — the middle of the lot: {n} day(s) for {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeSeuleMedianeNone':
    'Closed year alone — no dated return, the middle of the lot cannot be read.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeule':
    'Current quarter alone · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleHint':
    'Keep only the screens the current quarter names and the closed year does not — {n} of {total} screen(s) gone —, with the day of their last removal and that of their return: {detail}. Neither the closed year nor its closed quarter keeps them: this is what the quarter adds alone, to compare with what the year adds alone. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleOffHint':
    'The fold only shows what the current quarter adds alone beside the closed year — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleOn':
    'Fold narrowed to what the current quarter adds alone — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleAucun':
    'no screen named by the current quarter alone',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleItem':
    '{ecran} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleRepartis':
    'Current quarter: {a} screen(s) named, the closed year keeps none of them — {n} in all, what the quarter adds alone.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleMediane':
    'Current quarter alone — the middle of the lot: {n} day(s) for {k} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleMedianeNone':
    'Current quarter alone — no dated return, the middle of the lot cannot be read.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtAnnee':
    'The shortest middle is the closed year alone: {n} day(s) — it is the one that brings screens back fastest.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtTrimestre':
    'The shortest middle is the current quarter alone: {n} day(s) — it is the one that brings screens back fastest.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreSeuleCourtEgal':
    'Both middles are equal: {n} day(s) on each side — neither brings screens back faster than the other.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeule':
    'Closed year and current quarter alone · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleHint':
    'Keep only the two additions side by side: the screens the closed year names alone — {a} —, then those the current quarter adds alone — {b} —, each carrying the window that holds it, that is {n} of {total} screen(s) gone: {detail}. The list is taken from both tokens, so no screen is lost and none is counted twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleOffHint':
    'The fold shows the two additions side by side — the closed year alone, then the current quarter alone —, {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleOn':
    'Fold narrowed to the two additions side by side — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleAucun':
    'neither the closed year nor the current quarter adds a screen alone',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleRepartis':
    'Closed year alone: {a} screen(s), {pa} % of the carnet · current quarter alone: {b} screen(s), {pb} % of the carnet — {n} in all, {pn} % of the carnet, the two additions side by side.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleFenetreAnnee':
    'closed year alone',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleFenetreTrimestre':
    'current quarter alone',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasse':
    'Two additions beyond the joint middle · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseHint':
    'Keep in the fold, of the two additions together, only the screens whose delay exceeds the middle of the joint batch — {n} of {total} screen(s) gone —, each carrying the window that holds it, with the day of its last removal, that of its return and its delay: {detail}. The middle is taken on the two additions together, so the split cannot contradict the list it separates; an empty batch does not divide. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseOffHint':
    'The fold only shows, of the two additions, the screens slower than the middle of the joint batch — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseOn':
    'Fold narrowed to the two additions beyond the joint middle — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseAucun':
    'neither addition exceeds the middle of the joint batch',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour} · {jours} day(s), beyond the middle',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepassePlusRapide':
    'The fastest return in the batch is « {ecran} », back in {n} day(s) after leaving on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepassePlusLent':
    'The slowest is « {ecran} », back in {n} day(s) after leaving on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseBoutsNone':
    'None of these screens has a dated return yet: neither the fastest nor the slowest can be named.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaine':
    'Beyond the joint middle, back this week · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineHint':
    'Keep, among the screens beyond the middle of the joint batch, only those whose return falls in the current week — {n} of {total} screen(s) gone —, each carrying the window that holds it, with the day of its last removal, that of its return and its delay: {detail}. The list is taken from the « beyond the joint middle » token, so it cannot contradict it: the closest window thus says what it keeps of the batch. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineOffHint':
    'The fold only shows, of the screens beyond the joint middle, those back this week — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineOn':
    'Fold narrowed to the screens beyond the joint middle that came back this week — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineAucun':
    'no screen beyond the joint middle came back this week',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemainePlusRecent':
    'The screen that came back most recently in the lot is “{ecran}”, back on {date} — {n} day(s) after it left.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemainePlusRecentNone':
    'No screen of the lot came back this week: there is no recent return to name.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunis':
    'Week and reunited lot · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisHint':
    'Keep only the screens of the lot beyond the reunited midpoint that came back this week, then the rest of that lot — {n} of {total} screen(s) —, each carrying its window, with the day of its last removal and that of its return: {detail}. The week’s midpoint sits beside the reunited lot’s, so the week is judged in a word. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisOffHint':
    'The fold shows the week and the rest of the reunited lot — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisOn':
    'Fold narrowed to the week and the reunited lot — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisAucun':
    'no screen to compare yet',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour} · {jours} day(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisFenetreSemaine':
    'the current week',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMediane':
    'The week brings screens back faster: {n} day(s) at the midpoint of its lot of {k} dated return(s), against {m} day(s) for the reunited lot ({j} return(s)).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeLot':
    'The reunited lot brings screens back faster: {m} day(s) at the midpoint of its lot of {j} dated return(s), against {n} day(s) for the week ({k} return(s)).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeEgal':
    'The week and the reunited lot are level: {n} day(s) on both sides, on {k} dated return(s) for the week and {j} for the lot.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeSemaineVide':
    'The week keeps no screen beyond the reunited midpoint: the reunited lot comes back in {m} day(s), on {j} dated return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisMedianeNone':
    'Neither the week nor the reunited lot carries a dated return: nothing can be compared yet.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisPlusLent':
    'The slowest screen of the week is “{ecran}”, back in {n} day(s) on {date} — it is the one holding the lot back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineReunisPlusLentNone':
    'No screen of the week came back beyond the reunited midpoint: there is no slowest screen to name.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapide':
    'The week faster than the reunited midpoint · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideHint':
    'Keep, among the screens beyond the reunited midpoint that came back this week, only those whose delay is shorter than the midpoint of the reunited lot — {n} of {total} screen(s) —, each carrying its window, with the day of its last removal, the day of its return and its delay: {detail}. The reference midpoint is the one of the reunited lot, so this token cannot contradict it. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideOffHint':
    'The unfolded list shows only the screens of the week that came back faster than the reunited midpoint — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideOn':
    'List narrowed to the week faster than the reunited midpoint — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideAucun':
    'no screen of the week comes back faster than the midpoint of the reunited lot',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapidePlusRapide':
    'The fastest screen of the week is “{ecran}”, back in {n} day(s) on {date} — it leads the reunited midpoint by the widest margin.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapidePlusRapideNone':
    'No screen of the week comes back ahead of the reunited midpoint: there is no fastest screen to name.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunis':
    'Fast week and the rest of the reunited lot · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisHint':
    'Bring together, in the unfolded list, the screens of the week that came back faster than the midpoint of the reunited lot and the rest of that lot — {n} of {total} screen(s) gone —, the fastest first, then the others, each carrying its window, with the day of its last removal, the day of its return and its delay: {detail}. No screen weighs twice, and the fast-week token keeps the same lot. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisOffHint':
    'The unfolded list shows only the fast week and the rest of the reunited lot — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisOn':
    'List narrowed to the fast week and the rest of the reunited lot — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisAucun':
    'no screen of the fast week nor of the reunited lot',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisFenetreSemaineRapide':
    'fast week',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisPlusRecent':
    'The most recently returned screen of the lot is “{ecran}”, back on {date} — {n} day(s) after it left.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisPlusRecentNone':
    'No screen of the lot has dated its return yet: the token names no one.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisReste':
    'Rest of the reunited lot · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteHint':
    'Keep in the unfolded list only the screens of the reunited lot that the fast week does not name — {n} of {total} screen(s) gone —, each carrying the window that names it, with the day of its last removal, the day of its return and its delay: {detail}. No screen weighs twice, and the fast-week token keeps the same lot. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteOffHint':
    'The unfolded list shows only the rest of the reunited lot, once the fast week is read — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteOn':
    'List narrowed to the rest of the reunited lot — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAucun':
    'no screen of the reunited lot is left once the fast week is read',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusAncien':
    'The most anciently returned screen of the lot is “{ecran}”, back on {date} — {n} day(s) after it left.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusAncienNone':
    'No screen of the lot has dated its return yet: the token names no one.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieu':
    'Rest before the reunited midpoint · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuHint':
    'Keep, among the screens of the rest of the reunited lot, only those that came back before the midpoint of the reunited lot — {n} of {total} screen(s) gone —, each carrying the window that names it, with the day of its last removal, the day of its return and its delay: {detail}. The reference midpoint is the one of the reunited lot, so this token cannot contradict it, and its list is taken from the rest. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuOffHint':
    'The unfolded list shows only the screens of the rest that came back before the midpoint of the reunited lot — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuOn':
    'List narrowed to the rest that came back before the reunited midpoint — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuAucun':
    'no screen of the rest comes back before the midpoint of the reunited lot',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuPlusRapide':
    'The fastest screen of the rest is “{ecran}”, back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuPlusRapideNone':
    'no screen of the rest to name — the lot is empty',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunis':
    'Reunited rest · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisHint':
    'Reunite the two halves of the rest of the reunited lot — the screens back before the midpoint, then those beyond it — to read them at a single glance: {n} of {total} screen(s) gone, each carrying the window that names it, with the day of its last removal, the day of its return and its delay: {detail}. Both halves come from the same rest list, so no screen weighs twice and neither half can contradict the other. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisOffHint':
    'The unfolded list shows both halves of the rest together — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisOn':
    'List narrowed to the reunited rest — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisAucun':
    'no screen of the rest to reunite — the lot is empty',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisFenetreAvant':
    'rest before the midpoint',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisFenetreApres':
    'rest beyond the midpoint',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuReunisItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour} · {jours} day(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusLent':
    'The slowest screen of the rest is “{ecran}”, back on {date} — {n} day(s) after it left.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisRestePlusLentNone':
    'No screen of the rest has dated its return yet: the token names no one.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieu':
    'Rest beyond the reunited midpoint · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuHint':
    'Keep, among the screens of the rest of the reunited lot, only those that came back after the midpoint of the reunited lot — {n} of {total} screen(s) gone —, each carrying the window that names it, with the day of its last removal, the day of its return and its delay: {detail}. The list is taken from the rest, and its counterpart — the rest before the midpoint — already sits beside it, so no screen is lost and neither half can contradict the other. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuOffHint':
    'The unfolded list shows only the screens of the rest that came back after the midpoint of the reunited lot — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuOn':
    'List narrowed to the rest that came back beyond the reunited midpoint — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuAucun':
    'no screen of the rest comes back after the midpoint of the reunited lot',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuPlusLent':
    'The slowest screen of the rest beyond the midpoint is “{ecran}”, back on {date} — {n} day(s) after it left.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunis':
    'Rest before, at and after the midpoint · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisHint':
    'Bring together, in the unfolded list, the three parts of the rest of the reunited lot — those before the midpoint, those falling on it, then those beyond —, {n} of {total} screen(s) gone, each carrying its window, with the day of its last removal, the day of its return and its delay: {detail}. No screen weighs twice. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisOffHint':
    'The unfolded list shows the three parts of the rest — {n} of {total} screen(s) gone: {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisOn':
    'List narrowed to the three parts of the rest — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisAucun':
    'no screen of the rest to gather — the rest of the lot is empty',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisFenetreMilieu':
    'rest at the midpoint of the reunited lot',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisMediane':
    'The midpoint of the reunited lot sits at {m} day(s): {a} screen(s) before, {b} at it, {c} after.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisMedianeNone':
    'The reunited lot carries no midpoint: the three parts do not divide.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisPlusRecent':
    'The screen back exactly at the midpoint of the lot is “{ecran}”, returned on {date} — {n} day(s) after it left.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuReunisPlusRecentNone':
    'No screen of the rest falls exactly on the midpoint: nobody is named.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeul':
    'Rest exactly at the midpoint · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHint':
    'Keep in the unfolded list only the screens of the rest that returned exactly at the midpoint of the reunited lot — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal, the day of its return and its delay: {detail}. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulOffHint':
    'The unfolded list shows only the screens of the rest that returned exactly at the midpoint — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulOn':
    'Unfolded list narrowed to the exact midpoint of the rest — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulAucun':
    'no screen of the rest falls exactly on the midpoint of the reunited lot',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPlusLent':
    'The screen at the exact midpoint that took the longest to come back to it is “{ecran}”, back on {date} — {n} day(s) after it left.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPlusLentNone':
    'no screen at the exact midpoint to name — nothing falls on it',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPhrase':
    'Among them, {n} of {total} came back outside the current month: {detail}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisNone':
    'no screen at the exact midpoint to name outside the month — nothing falls on it',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemaine':
    'Among them, {n} of {total} came back outside the current week: {detail}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemaineAucun':
    'Every screen at the exact midpoint came back within the current week: none returns outside its window.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsSemaineNone':
    'no screen at the exact midpoint to name outside the week — nothing falls on it',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriode':
    'The period covered by the exact midpoint runs from {ancien} to {recent} — {n} day(s) between its oldest return and its most recent.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriodeUnJour':
    'The period covered by the exact midpoint fits in a single day, {ancien}: its oldest and most recent returns fall on the same day.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulPeriodeNone':
    'no period to name — no screen at the exact midpoint carries a dated return',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieu':
    'Rest before and at the midpoint · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuHint':
    'Keep in the unfolded list only the two halves of the rest that come before the midpoint or fall on it — {n} of {total} screen(s) gone, the half beyond left out —, each carrying the window that names it, with the day of its last removal, the day of its return and its delay: {detail}. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuOffHint':
    'The unfolded list shows only the screens of the rest that came back before the midpoint or exactly on it — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuOn':
    'List narrowed to the rest before the midpoint and on it — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuAucun':
    'no screen of the rest comes before the midpoint nor falls on it',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuMediane':
    'The common midpoint of the two reunited halves is {n} day(s) over {k} dated return(s) · the lot midpoint, beside it: {l} day(s) over {m} return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuEtMilieuMedianeNone':
    'Neither reunited half carries a dated return: no midpoint is named, the whole lot is read alone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaine':
    'Rest before the midpoint, back this week · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineHint':
    'Keep in the unfolded list only the screens of the rest that came back before the lot midpoint and whose return falls this week — {n} of {total} screen(s) gone —, each with its window, the day of its last removal, the day of its return and its delay: {detail}. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineOffHint':
    'The unfolded list shows only the screens of the rest that came back before the midpoint this week — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineOn':
    'List narrowed to the rest before the midpoint, back this week — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineAucun':
    'no screen of the rest came back before the midpoint this week',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemainePlusLent':
    'The screen of the rest that came back before the midpoint this week and took longest to return is "{ecran}", back on {date} — {n} day(s) after it left.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemainePlusLentNone':
    'No screen of the rest came back before the midpoint this week: no screen is named.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieu':
    'Rest before this week’s midpoint and at the midpoint · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuHint':
    'Keep in the unfolded list only the screens of the rest that came back before the midpoint this week, then those falling exactly on the lot midpoint — {n} of {total} screen(s) gone —, each with the window that names it, the day of its last removal, the day of its return and its delay: {detail}. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuOffHint':
    'The unfolded list shows only the screens of the rest that came back before the midpoint this week and those of the exact midpoint — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuOn':
    'List narrowed to the rest before the midpoint this week and the exact midpoint — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuAucun':
    'no screen of the rest came back before the midpoint this week, and none falls on the exact midpoint',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuMediane':
    'The common midpoint of the two reunited halves is {n} day(s) over {k} dated return(s) · the lot midpoint, beside it: {l} day(s) over {m} return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteAvantMilieuSemaineEtMilieuMedianeNone':
    'Neither reunited half carries a dated return: no midpoint is named, the whole lot is read alone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaine':
    'Rest at the exact midpoint, back this week · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineHint':
    'Keep in the unfolded list only the screens of the rest falling exactly on the lot midpoint whose return falls this week — {n} of {total} screen(s) gone —, each with the window that names it, the day of its last removal, the day of its return and its delay: {detail}. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineOffHint':
    'The unfolded list shows only the screens of the rest falling exactly on the midpoint, back this week — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineOn':
    'List narrowed to the exact midpoint, back this week — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineAucun':
    'no screen of the rest fell exactly on the midpoint and came back this week',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusLent':
    'The one that took longest to come back is “{ecran}”, back on {date} — {n} day(s) after it left.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusLentNone':
    'No screen of the exact midpoint came back this week: there is no one to name.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusRecent':
    'The one that came back most recently is “{ecran}”, back on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemainePlusRecentNone':
    'No screen of the exact midpoint came back this week: there is no one to name.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtReste':
    'Exact midpoint this week and the rest of the exact midpoint · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteHint':
    'Keep in the unfolded list only the screens of the exact midpoint in the whole lot: those back this week first — {n} of {total} screen(s) —, then those of the exact midpoint left outside the week, each with the window that names it, the day of its last removal, the day of its return and its delay: {detail}. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteOffHint':
    'The unfolded list shows only the exact midpoint of the lot, this week and the rest outside it side by side — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteOn':
    'List narrowed to the exact midpoint, this week and the rest outside it — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteAucun':
    'no screen of the rest falls exactly on the lot midpoint, neither this week nor outside it',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteFenetreSemaine':
    'this week',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteFenetreReste':
    'outside the week',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour} · {jours} day(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteMediane':
    'The common midpoint of the two reunited halves is {n} day(s) over {k} dated return(s) · the exact midpoint, beside it: {l} day(s) over {m} return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtResteMedianeNone':
    'Neither reunited half carries a dated return: no midpoint is named, the exact midpoint is read alone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtRestePlusAncien':
    'The one that came back farthest back among those left outside the week is “{ecran}”, back on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulSemaineEtRestePlusAncienNone':
    'No screen of the exact midpoint stayed outside the week: there is no one to name.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMois':
    'Exact midpoint of the rest, back this month · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisHint':
    'Keep in the unfolded list only the screens of the rest falling exactly on the lot midpoint whose return falls this month — {n} of {total} screen(s) gone —, each with the day of its last removal, the day of its return and its delay: {detail}. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisOffHint':
    'The unfolded list shows only the screens of the exact midpoint that came back this month — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisOn':
    'List narrowed to the exact midpoint, back this month — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisAucun':
    'no screen of the exact midpoint came back this month',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisItem':
    '{ecran} · this month · left on {date} · back on {retour} · {jours} day(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisSemaineMois':
    'The week keeps {n} of the {total} screen(s) of the exact midpoint · the month keeps {m} — the same share, compared from one window to the other.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisSemaineMoisNone':
    'No screen falls exactly on the lot midpoint: the week and the month have nothing to compare.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisPlusTot':
    'The one that came back earliest this month is “{ecran}”, back on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisPlusTotNone':
    'No screen of the exact midpoint came back this month: there is no one to name.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtReste':
    'Exact midpoint this month and the rest of the exact midpoint · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteHint':
    'Keep in the unfolded list only the screens of the exact midpoint in the whole lot: those back this month first — {n} of {total} screen(s) —, then those of the exact midpoint left outside the month, each with the window that names it, the day of its last removal, the day of its return and its delay: {detail}. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteOffHint':
    'The unfolded list shows only the exact midpoint of the lot, this month and the rest outside it side by side — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteOn':
    'List narrowed to the exact midpoint, this month and the rest outside it — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteAucun':
    'no screen of the rest falls exactly on the lot midpoint, neither this month nor outside it',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteFenetreMois':
    'this month',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteFenetreReste':
    'outside the month',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour} · {jours} day(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMediane':
    'The common midpoint of the two reunited halves is {n} day(s) over {k} dated return(s) · the exact midpoint of the month, beside it: {l} day(s) over {m} return(s) · {sens}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianeNone':
    'Neither reunited half carries a dated return: no midpoint is named, the exact midpoint of the month is read alone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianePareil':
    'the two midpoints are equal, the comparison settles nothing',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianePlus':
    'the common midpoint sits above the month’s, so the two reunited halves come back more slowly',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteMedianeMoins':
    'the common midpoint sits below the month’s, so the two reunited halves come back faster',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMois':
    'Exact midpoint back outside the month · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisHint':
    'Keep in the unfolded list only the screens of the exact midpoint of the whole lot whose return falls outside the current month — {n} of {total} screen(s) —, each with the day of its last removal, the day of its return and its delay: {detail}. This is the exact complement of the month’s half, taken from the same exact-midpoint list: no screen is lost, none is counted twice. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisOffHint':
    'The unfolded list shows only the exact midpoint left outside the month — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisOn':
    'List narrowed to the exact midpoint back outside the month — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisAucun':
    'no screen of the exact midpoint stayed outside the current month',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisItem':
    '{ecran} · left on {date} · back on {retour} · {jours} day(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisMediane':
    'The midpoint of the half left outside the month is {n} day(s) over {k} dated return(s) · the month’s half, beside it: {l} day(s) over {m} return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisMedianeNone':
    'Neither side of the exact midpoint carries a dated return: no midpoint is named, both halves are read without a figure.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPlusAncien':
    'The one that came back longest ago outside the month is “{ecran}”, back on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisPlusAncienNone':
    'No screen of the exact midpoint stayed outside the month: there is no one to name.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaine':
    'Exact midpoint of the week and outside the month reunited · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineHint':
    'Gather in the unfolded list the screens of the exact midpoint back this week and those left outside the current month — {n} of {total} screen(s) —, each with the window that names it, the day of its last removal, the day of its return and its delay: {detail}. The three windows then read at a glance: the week, the month, and outside the month. It removes no forgotten visit; a second press brings every screen back.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineOffHint':
    'The unfolded list shows the exact midpoint of the week and the one left outside the month — {n} of {total} screen(s): {detail}. One press brings every screen back, without removing any forgotten visit.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineOn':
    'List narrowed to the exact midpoint of the week and outside the month — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineAucun':
    'no screen of the exact midpoint came back this week or stayed outside the month',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour} · {jours} day(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineFenetreSemaine':
    'week',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineFenetreHorsMois':
    'outside the month',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineParts':
    'week: {a} screen(s), midpoint {b} · left outside the month: {c} screen(s), midpoint {d}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePartMediane':
    '{n} day(s) over {k} return(s)',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePartMedianeNone':
    'no dated return',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMediane':
    'The common midpoint of the two reunited halves is {n} day(s) over {k} dated return(s) · the month\u2019s exact-midpoint half, beside it: {l} day(s) over {m} return(s) · {sens}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianeNone':
    'Neither reunited half carries a dated return: no midpoint is named, the three windows are read without a figure.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianePareil':
    'the two midpoints are equal, the comparison settles nothing',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianePlus':
    'the common midpoint sits above the month\u2019s, so the two reunited halves come back more slowly',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemaineMedianeMoins':
    'the common midpoint sits below the month\u2019s, so the two reunited halves come back faster',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusLent':
    'The one that comes back most slowly among the two reunited halves is “{ecran}”, back on {date}, after {n} day(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusLentNone':
    'Neither reunited half carries a dated return: there is no one to name.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusRapide':
    'The one that comes back fastest among the two reunited halves is “{ecran}”, back on {date}, after {n} day(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulHorsMoisSemainePlusRapideNone':
    'Neither reunited half carries a dated return: no one overtakes the other.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecent':
    'The one that came back most recently among those left outside the month is “{ecran}”, back on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentNone':
    'No screen of the exact midpoint stayed outside the month: there is no one to name.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentMois':
    'The one that came back most recently among the month’s half is “{ecran}”, back on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtRestePlusRecentMoisNone':
    'No screen of the exact midpoint came back this month: there is no one to name on that side.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotes':
    'Both sides overlap on {n} screen(s) of the token: back this week without falling inside the month, they carry the week’s half and the outside half at once — {k} screen(s) in all, each counted only once.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesNone':
    'No screen falls on both sides at once: each half of the token reads on its own.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePart':
    'Of the token’s {k} screen(s), {n} carry only a single half — not the week’s half and the outside half together: {detail}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartNone':
    'Every screen of the token carries both halves at once: none reads from a single side.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartPlusAncien':
    'The one carrying a single half for the longest is “{ecran}”, back on {date} — {n} day(s) already.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteUneSeulePartPlusAncienNone':
    'No screen carries a single half: there is no one to name.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesDelai':
    'The average delay between the two united halves is {n} day(s) over {k} screen(s) — the shortest: “{court}”, {jc} day(s); the longest: “{long}”, {jl} day(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteMilieuSeulMoisEtResteDeuxCotesDelaiNone':
    'The two halves do not overlap on any screen: there is no average delay to read.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisMediane':
    'The midpoint of the fast week is {n} day(s) over {k} return(s) · that of the rest, beside it: {m} day(s) over {j} return(s).',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisMedianeNone':
    'Neither the fast week nor the rest carries a delay: neither midpoint can be read.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeTrimestreSeuleDepasseSemaineRapideReunisResteApresMilieuPlusLentNone':
    'no screen of the rest beyond the midpoint to name — the lot is empty',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierFenetreMoisEnCours':
    'current month',
  'ad.suivi.doorOublisEcransRetoursDatesMoisEnCoursMoisDernierFenetreMoisDernier':
    'last month',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMois':
    'Closed year and month before last · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisHint':
    'Keep only the screens that came back with a date over the closed year or the month before last — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal and that of its return: {detail}. The month before last is already counted inside the closed year, so no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisOffHint':
    'The fold only shows the screens of the closed year and the month before last — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisOn':
    'Fold narrowed to the closed year and the month before last — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisAucun':
    'no dated return over the closed year nor the month before last',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisRepartis':
    'Month before last: {a} screen(s) · closed year: {b} screen(s) — {n} in all, the month before last already counted inside the closed year.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisFenetreAvantDernier':
    'month before last',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisFenetreAnnee':
    'closed year',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAvantDernier':
    'Month before last — shortest « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAvantDernierNone':
    'Month before last — no dated return.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAnnee':
    'Closed year — shortest « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtAnneeNone':
    'Closed year — no dated return.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeFermeeAvantDernierMoisCourtNone':
    'Neither of the two windows holds a dated return: the two batches name no one.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMois':
    'Closed quarter and month before last · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisHint':
    'Keep only the screens that came back with a date over the closed quarter or the month before last — {n} of {total} screen(s) gone —, each carrying its window, with the day of its last removal and that of its return: {detail}. The month before last is already counted inside the closed quarter, so no screen weighs twice. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisOffHint':
    'The fold only shows the screens of the closed quarter and the month before last — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisOn':
    'Fold narrowed to the closed quarter and the month before last — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisAucun':
    'no dated return over the closed quarter nor the month before last',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisEcartes':
    'It sets {n} line(s) aside from the fold, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisItem':
    '{ecran} · {fenetre} · left on {date} · back on {retour}',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisRepartis':
    'Closed quarter: {a} screen(s) · month before last: {b} screen(s) — {n} in all, the month before last already counted inside the closed quarter.',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisFenetreTrimestre':
    'closed quarter',
  'ad.suivi.doorOublisEcransRetoursDatesTrimestreFermeAvantDernierMoisFenetreAvantDernier':
    'month before last',
  'ad.suivi.doorOublisEcransRetoursDatesAnnee': 'Dated returns this year · {n}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeHint':
    'Keep only the screens that came back over the last twelve months with a date — {n} of {total} screen(s) gone —, with the day of their last removal and that of their return: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeOffHint':
    'The list only shows the screens that came back over the last twelve months with a date — {n} of {total} screen(s): {detail}. A press restores every screen, removing no omission.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeOn':
    'List narrowed to the screens that came back over the last twelve months with a date — {n} of {total}',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeAucun':
    'no screen came back with a date over the last twelve months',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeEcartes':
    'It keeps {n} fold line(s) out of view, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneePlusCourt':
    'The shortest delay in the batch is « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneePlusLong':
    'The longest is « {ecran} », back in {n} day(s) on {date}.',
  'ad.suivi.doorOublisEcransRetoursDatesAnneeBoutsNone':
    'No dated return over the last twelve months: the batch names no one.',
  'ad.suivi.doorOublisEcransRepartisHierHint':
    'Keep only the screens that came back to the notebook and left again with their last removal falling yesterday — {n} of {total} screen(s) gone, with the day of that removal: {detail}. It removes no omission; a second press restores every screen.',
  'ad.suivi.doorOublisEcransRepartisHierOffHint':
    'The list only shows the screens that left yesterday — {n} of {total} screen(s): {detail}. A press restores every screen, without removing any omission.',
  'ad.suivi.doorOublisEcransRepartisHierOn':
    'List narrowed to the screens that left yesterday — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisHierAucun': 'no screen left yesterday',
  'ad.suivi.doorOublisEcransRepartisHierEcartes':
    'It leaves {n} line(s) of the list out of view, of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRepartisJour': 'Left today · {n}',
  'ad.suivi.doorOublisEcransRepartisJourHint':
    'Keep only screens that came back to the logbook and left again with their last removal today — {n} of {total} gone screen(s), with the day of that removal: {detail}. It removes no entry; a second press returns every screen.',
  'ad.suivi.doorOublisEcransRepartisJourOffHint':
    'The fold shows only screens that left today — {n} of {total} screen(s): {detail}. One press returns every screen, without removing any entry.',
  'ad.suivi.doorOublisEcransRepartisJourOn':
    'Fold narrowed to screens that left today — {n} of {total}',
  'ad.suivi.doorOublisEcransRepartisJourAucun': 'no screen left today',
  'ad.suivi.doorOublisEcransRepartisJourEcartes':
    'It leaves out {n} line(s) of the fold, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransRepartisVieuxEcartes':
    'It keeps {n} fold line(s) out of view, out of {total} screen(s) gone.',
  'ad.suivi.doorOublisEcransJetonsClear': 'Show every screen',
  'ad.suivi.doorOublisEcransJetonsClearRendues':
    'It will bring {rendues} fold line(s) back into view, out of {total} in the notebook.',
  'ad.suivi.doorOublisEcransJetonsClearRenduesNone':
    'Every fold line is already in view: it will bring none back.',
  'ad.suivi.doorOublisEcransJetonsClearHint':
    'Turns off the {n} token(s) of the fold in one gesture and brings back every screen — {total} in the notebook — without removing a single forgetting: the count, the lines and the notebook tokens stay as they are.',
  'ad.suivi.doorOublisEcransJetonsClearEach':
    'Token by token, what each one keeps: {detail}. The eraser turns them all off at once; a second press on a single token lifts it without touching the others.',
  'ad.suivi.doorOublisEcransJetonsCleared':
    '{jetons} fold token(s) turned off: the {n} notebook screen(s) are back, no forgetting was removed.',
  'ad.suivi.doorOublisCsvRetourMoyenne':
    'Return gaps: {n} day(s) on average, screen by screen, over {k} returned screen(s).',
  'ad.suivi.doorOublisCsvRetourMoyenneOne':
    'Return gaps: a single returned screen, {n} day(s) counted — the average says no more.',
  'ad.suivi.doorOublisCsvRetourMoyenneNone':
    'Return gaps: no dated return on this device, the average cannot be read yet.',
  'ad.suivi.doorOublisCsvRepartisMoyenne':
    'Days spent in the notebook before leaving: {n} day(s) on average, screen by screen, over {k} gone screen(s).',
  'ad.suivi.doorOublisCsvRepartisMoyenneOne':
    'Days spent in the notebook before leaving: a single gone screen, {n} day(s) counted — the average says no more.',
  'ad.suivi.doorOublisCsvRepartisMoyenneNone':
    'Days spent in the notebook before leaving: no dated departure on this device, the average cannot be read yet.',
  'ad.suivi.doorOublisEcranReparti': 'removed again on {date}',
  'ad.suivi.doorOublisCsvRetiresSpan':
    'Screens removed by their name: {n} day(s) separate the first removal, on {ancien}, from the last, on {recent}.',
  'ad.suivi.doorOublisCsvRetiresSpanOne':
    'Screens removed by their name: a single removal is kept, on {date} — no gap of days can be read yet.',
  'ad.suivi.doorOublisCsvRetiresSpanNone':
    'Screens removed by their name: no removal kept on this device, the gap cannot be read yet.',
  'ad.suivi.doorOublisEcranClear': 'Bring back every screen',
  'ad.suivi.doorOublisEcranCleared':
    'Screen “{ecran}” brought back: its gestures return among the notebook’s {n} screen(s), which keeps every gesture.',
  'ad.suivi.doorOublisTriEcranCleared':
    'Newest-first order restored: the {n} screen(s) are no longer grouped, and the notebook keeps every gesture.',
  'ad.suivi.doorOublisSemaineNom': 'This week',
  'ad.suivi.doorOublisJetonsItem': '{nom} · {masques} gesture(s) out of view',
  'ad.suivi.doorOublisJetonsClearHintDetail':
    'Puts out the {n} token(s) set on the notebook in one move and restores the whole list. Each was removing from view: {detail}. No forgetting is removed, the notebook’s count does not move.',
  'ad.suivi.doorOublisLineClear': 'Remove this gesture from the notebook',
  'ad.suivi.doorOublisLineClearHint':
    'Remove the « {ecran} » door forgetting dated {date} from the notebook: the kept visit stays on this device, and so does the plan.',
  'ad.suivi.doorOublisLineCleared':
    '« {ecran} » forgetting removed from the notebook: the kept visit stays on this device, and so does the plan.',
  'ad.suivi.doorOublisParChantierHint':
    'The notebook visits grouped by plan workstream, the heaviest first: where the forgetting has concentrated, read from the same device memory.',
  'ad.suivi.doorOublisParChantierItem': '{nom} · {n}',
  'ad.suivi.doorOublisParChantierAucun': 'no workstream',
  'ad.suivi.doorOublisChantierItem': '{nom} · {n}',
  'ad.suivi.doorOublisChantierAucun': 'no workstream',
  'ad.suivi.doorOublisClear': 'Reset the notebook',
  'ad.suivi.doorOublisClearHint':
    'Resets the forgetting notebook — its {n} visit(s), its last day and its CSV rows — without touching the retained visits: the “already used” marks and the plan stay as they are.',
  'ad.suivi.doorOublisCleared':
    'Forgetting notebook reset: the retained visits stay on this device, and so does the plan.',
  'ad.suivi.chantierVues': '{n} of {total} doors used',
  'ad.suivi.chantierVuesAucune': 'no door used from this device',
  'ad.suivi.chantierVuesHint': 'Doors of this task already used from this device: {detail}',
  'ad.suivi.chantierVuesClear': 'Forget the visits of this task',
  'ad.suivi.chantierVuesClearHint':
    'Clear the {n} visit(s) of the “{chantier}” task doors from this device: their marks go back to “to open”, {autres} visit(s) of other doors stay on this device, and the plan does not move.',
  'ad.suivi.chantierVuesCleared':
    '{n} visit(s) of the “{chantier}” task forgotten on this device: its doors go back to “to open”.',
  'ad.suivi.doorUsed': 'already used',
  'ad.suivi.doorUsedHint': 'This door has already been used from this device, on {date}.',
  'ad.suivi.doorUsedClear': 'Forget the visit',
  'ad.suivi.doorUsedClearHint': 'Clear the visit to the “{ecran}” door from this device: the mark goes back to “to open”, the plan and the other doors stay untouched.',
  'ad.suivi.doorUsedCleared': 'Visit to “{ecran}” forgotten on this device: the door goes back to “to open”.',
  'ad.suivi.doorTodo': 'to open',
  'ad.suivi.doorTodoHint': 'This door has not been used from this device yet: it still has to be opened.',
  'ad.suivi.mailDoorScreen': 'Open the “{ecran}” screen in Settings, straight on its block.',
  'ad.suivi.resteTitle': 'What remains',
  'ad.suivi.resteNote': '{n} point(s) still open',
  'ad.suivi.phasesTitle': 'The development plan',
  'ad.suivi.phase': 'Phase',
  'ad.suivi.etatFait': 'Done',
  'ad.suivi.etatEncours': 'In progress',
  'ad.suivi.etatAvenir': 'Upcoming',
  'ad.suivi.blocagesTitle': 'Blockers',
  'ad.suivi.blocOuvert': 'Open',
  'ad.suivi.blocAttente': 'External action',
  'ad.suivi.blocLeve': 'Lifted',
  'ad.suivi.telecharger': 'Download the plan',
  'ad.suivi.telechargerHint':
    'Downloads the steering file as text, dated with its version, to archive it at every update.',
  'ad.suivi.telecharge': 'Plan downloaded',
  'ad.suivi.lastDownload': 'Last download · {date}',
  'ad.suivi.lastNone': 'Never downloaded',
  'ad.suivi.lastHint':
    'Date of the last download of this archive on this device: it says when the piece last left.',
  'ad.suivi.lastNoneHint': 'No archive has been downloaded from this device yet.',
  'ad.suivi.lastClear': 'Clear memory',
  'ad.suivi.lastClearHint':
    'Clears the download dates kept on this device; files already sent are untouched.',
  'ad.suivi.lastClearConfirm': 'Confirm clearing',
  'ad.suivi.lastClearConfirmHint':
    'A second click clears the download memory. A new download will write it again.',
  'ad.suivi.chantierClear': 'Clear this archive’s date',
  'ad.suivi.chantierClearHint':
    'Last download · {date} — click to clear this single archive’s memory.',
  'ad.suivi.chantierClearConfirm': 'Confirm clearing',
  'ad.suivi.chantierClearConfirmHint':
    'A second click clears this archive’s date; the other archives and the files already sent stay untouched.',
  'ad.suivi.archivesJamais': 'Archives never taken {n} / {total}',
  'ad.suivi.archivesJamaisHint': 'Papers still to attach: {noms}',
  'ad.suivi.archivesJamaisOk':
    'All four archives have already left this device: nothing left to attach.',
  'ad.suivi.archivesJamaisDerniere': 'Last one sent on {date}',
  'ad.suivi.archivesJamaisAucune': 'No archive sent yet',
  'ad.suivi.archivesJamaisListShow':
    'Show the papers still to attach, numbered in the order they go',
  'ad.suivi.archivesJamaisListHide': 'Fold the list of papers to attach',
  'ad.suivi.archivesJamaisItemHint': 'Attach in position {n} — {nom}',
  'ad.suivi.archivesJamaisItemTelecharger':
    'Download the archive for “{nom}” — the paper to attach in position {n}',
  'ad.suivi.archivesJamaisPieceOk':
    'Archive for “{nom}” downloaded — the paper leaves the list of archives to attach.',
  'ad.p.mail.testOld':
    'The last proof is more than a month old: send a test again to refresh it.',
  'ad.p.mail.testAt':
    'Last test received on {date} · {age} — send a test to renew the proof.',
  'ad.p.mail.testOldAt':
    'Last test received on {date} · {age} — more than a month old: send a test again to refresh it.',
  'ad.suivi.note':
    'This panel reads the project steering file: the percentage is the weighted average of the modules, recomputed every time the document changes. The plan itself stays in French — the language of the working document.',
};

export const adminDict: Record<'fr' | 'ar' | 'en', Dict> = { fr, ar, en };