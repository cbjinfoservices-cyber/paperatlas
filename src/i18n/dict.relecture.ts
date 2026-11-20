import type { Dict } from './dict';

/**
 * Les libellés du panneau de relecture de la console — arabe et anglais, page
 * par page. Trois langues, comme le reste de la console : l'écran se lit dans
 * la langue de la session, même quand la liste elle-même reste en français,
 * parce qu'elle décrit le document de travail.
 */

const fr: Dict = {
  'ad.suivi.rlTitle': 'La relecture arabe et anglaise, page par page',
  'ad.suivi.rlNote': '{done} page(s) relue(s) des deux côtés sur {n} · gardées sur cet appareil',
  'ad.suivi.rlBoth': '{n} page(s) relue(s) dans les deux langues, sur 30',
  'ad.suivi.rlAr': 'Arabe',
  'ad.suivi.rlEn': 'Anglais',
  'ad.suivi.rlArHint': 'Marquer la relecture arabe de cette page',
  'ad.suivi.rlEnHint': 'Marquer la relecture anglaise de cette page',
  'ad.suivi.rlReset': 'Tout décocher',
  'ad.suivi.rlCsv': 'Exporter en CSV',
  'ad.suivi.rlCsvHint':
    'Le carnet de cet appareil, écran par écran, avec les deux cases et le côté déjà coché — et une colonne « Tournée » qui marque les deux tournées, écrans 1–10 puis 11–20, puis une colonne « Reprise » qui nomme le premier écran encore ouvert de chaque tournée. Une seconde feuille, séparée par une ligne vide, donne la synthèse de chaque tournée — son étendue, ses deux comptes, leur accord, les rangs encore ouverts et sa reprise —, pour un envoi sans filtre à un relecteur. Une troisième feuille, « Geste de tranche », date chaque clic qui a fermé ou rouvert une tranche d’un coup, et dit dans une dernière colonne combien d’écrans sont fermés des deux côtés juste après — le compte atteint, pas seulement le compte touché. Une ligne « Carnet remis à zéro le … » y date chaque oubli des gestes, pour distinguer un carnet vidé d’un carnet qui n’a jamais servi.',
  'ad.suivi.rlCsvOk': 'CSV téléchargé',
  'ad.suivi.rlCopy': 'Copier la liste',
  'ad.suivi.rlCopyHint':
    'Les trente lignes en texte, avec les cases de cet appareil, les comptes des deux tournées, les rangs encore ouverts de chacune et sa reprise — et, en tête, le dernier geste de tranche avec sa date et le compte atteint, puis la ligne du carnet — combien de gestes, du plus ancien au plus récent, et combien de remises à zéro tombent entre eux —, prêtes à coller dans un message.',
  'ad.suivi.rlCopyOk': 'Liste copiée',
  'ad.suivi.rlCopyFail': 'Copie refusée',
  'ad.suivi.rlResetHint':
    'Efface les cases cochées sur cet appareil ; un second clic le confirme.',
  'ad.suivi.rlResetConfirm': 'Confirmer l’effacement',
  'ad.suivi.rlKeep':
    'Les cases restent sur cet appareil : elles ne sont écrites ni en base ni dans le plan, et ne suivent pas d’un navigateur à l’autre.',
  'ad.suivi.rlTermesTitle': 'Les termes figés, à garder d’une page à l’autre',
  'ad.suivi.rlTermesNote':
    'Le vocabulaire du §11.2 du plan : un même mot se lit de la même façon partout.',
  'ad.suivi.rlTermesFr': 'Français',
  'ad.suivi.rlTermesAr': 'Arabe',
  'ad.suivi.rlTermesEn': 'Anglais',
  'ad.suivi.rlOneSide': 'Cochées d’un seul côté',
  'ad.suivi.rlOneSideHint':
    'Isoler les pages où l’arabe et l’anglais ne s’accordent pas — cochées d’un côté seulement.',
  'ad.suivi.rlOneSideNone':
    'Aucune page n’est cochée d’un seul côté : les deux langues s’accordent partout.',
  'ad.suivi.rlOnlyAr': 'Arabe seulement',
  'ad.suivi.rlOnlyEn': 'Anglais seulement',
  'ad.suivi.rlShowAll': 'Rendre les trente pages : le panneau entier revient.',
  'ad.suivi.rlOnlyArNone': 'Tout est coché en arabe : plus rien à relire de ce côté.',
  'ad.suivi.rlOnlyEnNone': 'Tout est coché en anglais : plus rien à relire de ce côté.',
  'ad.suivi.rlShown': '{n} page(s) affichée(s) sur {total}',
  'ad.suivi.rlAll': 'Les {total} pages, dans l’ordre de passage',
  'ad.suivi.rlTournee1': 'Les dix premiers',
  'ad.suivi.rlTournee2': 'Écrans {de} à {a}',
  'ad.suivi.rlTourneeHint':
    'Resserre la liste sur les écrans {de} à {a}, dans l’ordre du plan : l’arabe d’abord, puis les mêmes écrans en anglais. Un second clic rend les trente pages, et l’autre jeton montre l’autre tournée.',
  'ad.suivi.rlFirstTenLine':
    'Tournée {de}–{a}, arabe d’abord : {ar} / {n} en arabe, puis les mêmes en anglais : {en} / {n}.',
  'ad.suivi.rlFirstTenDone': '{n} écran(s) relu(s) des deux côtés',
  'ad.suivi.rlTourneeNone':
    'La tournée des écrans {de} à {a} est relue des deux côtés : la suite du plan attend.',
  'ad.suivi.rlMarkAr': 'Cocher les dix en arabe ({n})',
  'ad.suivi.rlMarkEn': 'Cocher les dix en anglais ({n})',
  'ad.suivi.rlMarkHint':
    'Coche d’un geste les dix écrans de cette tournée dans cette langue — {n} encore à cocher. Le carnet n’est pas écrasé : les rangs déjà cochés restent, et les autres écrans du plan ne bougent pas.',
  'ad.suivi.rlMarkDone': 'Tournée cochée, {done} / {n}',
  'ad.suivi.rlResume': 'Reprendre à l’écran {n}',
  'ad.suivi.rlResumeHint':
    'Ouvre le premier écran de la tournée encore non coché — l’écran {n} — dans un autre onglet : la relecture s’enchaîne sans chercher son rang dans la liste.',
  'ad.suivi.rlOpen': 'Ouvrir cet écran',
  'ad.suivi.rlOpenHint':
    'Ouvre cet écran dans un autre onglet : la liste reste en place, la case se coche au retour.',
  'ad.suivi.rlNext': 'Écran suivant — {n}',
  'ad.suivi.rlNextHint':
    'Ouvre l’écran suivant de la liste — l’écran {n} — dans un autre onglet : la relecture avance d’un cran sans revenir chercher le rang. La porte prend de la couleur dès que cet écran est coché.',
  'ad.suivi.rlNextRest': 'encore {n}',
  'ad.suivi.rlNextRestHint':
    'Il reste {n} écran(s) à cocher dans cette liste après celui-ci : de quoi doser le passage avant de l’entamer.',
  'ad.suivi.rlFriseTitle': 'La frise des trente écrans',
  'ad.suivi.rlFriseNote':
    'Ce qui est fermé des deux côtés, ce qui n’est coché que d’un côté, et ce qui reste ouvert — d’un coup d’œil, tournée par tournée. Un clic sur une marque ferme l’écran des deux côtés, un second le rouvre ; le bouton d’une tranche ferme ou rouvre ses dix écrans d’un coup.',
  'ad.suivi.rlFriseDeux': 'Fermé des deux côtés',
  'ad.suivi.rlFriseUn': 'Coché d’un côté seulement',
  'ad.suivi.rlFriseRien': 'Encore ouvert',
  'ad.suivi.rlFriseBandTournee': 'Tournée {n} · écrans {de}–{a}',
  'ad.suivi.rlFriseBandReste': 'Hors tournée · écrans {de}–{a}',
  'ad.suivi.rlFriseGo': 'un clic ferme l’écran des deux côtés',
  'ad.suivi.rlFriseFermer': 'un clic coche l’arabe et l’anglais d’un geste',
  'ad.suivi.rlFriseRouvrir': 'un clic rouvre les deux cases',
  'ad.suivi.rlFriseBulkClose': 'Fermer les {n} restants',
  'ad.suivi.rlFriseBulkReopen': 'Tout rouvrir',
  'ad.suivi.rlFriseBulkHint':
    'Coche d’un geste, dans les deux langues, les {n} écran(s) encore ouverts de cette tranche : l’arabe et l’anglais ensemble, sans descendre jusqu’aux lignes de la liste.',
  'ad.suivi.rlFriseBulkReopenHint':
    'Rouvre d’un geste les écrans de cette tranche, des deux côtés ; un second clic les referme.',
  'ad.suivi.rlFriseFlashClose': 'Fermé d’un coup : {n} écran(s) des deux côtés',
  'ad.suivi.rlFriseFlashReopen': 'Rouvert d’un coup : {n} écran(s)',
  'ad.suivi.rlFriseLast': 'Dernier geste · {date} · {tranche} · {sens} · {n} écran(s)',
  'ad.suivi.rlFriseLastHors': 'Hors tournée ({de}–{a})',
  'ad.suivi.rlFriseLastClose': 'fermé d’un coup',
  'ad.suivi.rlFriseLastReopen': 'rouvert d’un coup',
  'ad.suivi.rlFriseLastNone': 'Aucun geste de tranche retenu sur cet appareil.',
  'ad.suivi.rlFriseLastSee': 'Retrouver',
  'ad.suivi.rlFriseLastSeeHint':
    'Ouvre la liste resserrée sur la tournée {de}–{a}, celle que ce geste vient de fermer ou de rouvrir d’un trait.',
  'ad.suivi.rlFriseLastCard': 'Carte datée',
  'ad.suivi.rlFriseLastCardHint':
    'Déplie, sous la tranche {de}–{a}, la carte de ses gestes datés déjà rangée sur ce sens-là — celui de ce dernier geste ({sens}) : son clic s’y relit avec sa date, les écrans touchés et le compte atteint.',
  'ad.suivi.rlFriseOuvertes':
    '{n} tranche(s) encore ouverte(s) · dernier geste fermé : {ferme} · rouvert : {rouvert}',
  'ad.suivi.rlFriseOuvertesNone': 'Toutes les tranches sont fermées des deux côtés',
  'ad.suivi.rlFriseOuvertesHint':
    'Les tranches de la frise qui gardent au moins un écran non fermé des deux côtés, comptées par le sens de leur dernier geste : celles qu’une fermeture a laissées en chemin, et celles qu’une réouverture a rendues à moitié faites.',
  'ad.suivi.rlTourneeRestEn': 'Restent en anglais : {list}',
  'ad.suivi.rlTourneeRestEnOne': 'Reste en anglais : {list}',
  'ad.suivi.rlTourneeRestEnNone': 'Anglais complet sur cette tournée',
  'ad.suivi.rlOffsite': 'Hors site : dans les fonctions serveur',
  'ad.par.title': 'L’égalité des clés, fichier par fichier',
  'ad.par.note':
    'Le français sert de référence : chaque clé qu’il nomme doit exister en arabe et en anglais. Une clé absente ne se voit pas à l’écran — le site retombe sur l’anglais sans le dire.',
  'ad.par.showAll': 'Tous les fichiers',
  'ad.par.showAllHint': 'Afficher aussi les fichiers dont les trois langues s’accordent déjà.',
  'ad.par.onlyGaps': 'Fichiers en écart',
  'ad.par.onlyGapsHint': 'Ne garder que les fichiers où une clé manque d’un côté.',
  'ad.par.missAr': 'clé(s) manquante(s) en arabe',
  'ad.par.missEn': 'clé(s) manquante(s) en anglais',
  'ad.par.filesOk': 'fichier(s) d’accord sur {n}',
  'ad.par.none':
    'Les {n} fichiers portent exactement la même liste de clés dans les trois langues. Rien à compléter.',
  'ad.par.fileOk': 'Les trois langues s’accordent : aucune clé ne manque.',
  'ad.par.missArLabel': 'Manquent en arabe',
  'ad.par.missEnLabel': 'Manquent en anglais',
  'ad.par.seulArLabel': 'En arabe seulement',
  'ad.par.seulEnLabel': 'En anglais seulement',
  'ad.par.noneAr': 'aucune',
  'ad.par.noneEn': 'aucune',
  'ad.par.keep':
    'Relevé lu sur les dictionnaires embarqués par le site, à chaque ouverture du panneau : rien n’est enregistré ni envoyé.',
  'ad.par.csv': 'Exporter en CSV',
  'ad.par.csvHint':
    'Une ligne par fichier de textes, avec les noms exacts des clés manquantes dans leurs propres colonnes — pour le confier à un relecteur. Son nom porte le nombre de clés à compléter, comme les classeurs de la console.',
  'ad.par.csvOk': 'CSV téléchargé',
  'ad.par.copy': 'Copier le relevé',
  'ad.par.copyHint':
    'Les fichiers en écart en texte, avec les noms exacts des clés — prêts à coller dans un message.',
  'ad.par.copyOk': 'Relevé copié',
  'ad.par.copyFail': 'Copie refusée',
  'ad.par.import': 'Relevé rempli',
  'ad.par.importHint':
    'Ouvre le CSV que le relecteur a rempli : la console nomme chaque clé rendue, fichier et langue en tête, prête à être recopiée une par une.',
  'ad.par.importErr':
    'Ce fichier n’est pas un relevé de parité : la feuille « À compléter, clé par clé » ne s’y trouve pas.',
  'ad.par.importHead': '{n} clé(s) rendues · {vide} encore vide(s)',
  'ad.par.importBlank': 'à compléter',
  'ad.par.importPosees': '{n} clé(s) déjà posée(s) depuis',
  'ad.par.importPoseesHint':
    'Les clés du relevé que le site porte désormais : elles ne se recopient plus, la console les relit sur ses dictionnaires.',
  'ad.par.importPoseeTag': 'déjà posée',
  'ad.par.importSeePosees': 'Voir les clés posées',
  'ad.par.importSeePoseesHint':
    'Rappelle les clés déjà posées depuis, sorties de la liste pour ne laisser que le travail restant.',
  'ad.par.importHidePosees': 'Masquer les clés posées',
  'ad.par.importHidePoseesHint':
    'Referme les clés déjà posées depuis : le relevé revient à ce qui reste à compléter.',
  'ad.par.importAllPosees':
    'Les {n} clé(s) de ce relevé sont posées depuis : rien ne reste à compléter de ce côté.',
  'ad.par.importCopy': 'Copier le relevé rempli',
  'ad.par.importCopyHint':
    'Les traductions rendues en texte, fichier et langue en tête, clé par clé — prêtes à coller pour compléter les fichiers.',
  'ad.par.importCopyOk': 'Relevé rempli copié',
  'ad.par.importCopyFail': 'Copie refusée',
  'ad.par.importClear': 'Retirer ce relevé',
  'ad.par.importClearHint':
    'Referme le relevé importé : la liste des fichiers reste telle quelle, rien n’est effacé.',
  'ad.par.gomme': 'Gommer cette ligne',
  'ad.par.gommeHint':
    'Efface cette seule traduction déjà recopiée : le reste du relevé importé demeure, et le fichier entier n’est pas retiré.',
  'ad.par.gommeesCount': '{n} ligne(s) gommée(s) pendant la visite',
  'ad.par.gommeesHint':
    'Les traductions effacées depuis l’ouverture de ce relevé. Elles ne sont pas perdues : le geste d’à côté les rappelle.',
  'ad.par.releveCsv': 'Relevé à l’écran ({n})',
  'ad.par.releveCsvPosees': 'Relevé à l’écran ({n}) · {p} posée(s)',
  'ad.par.releveCsvBack': 'Relevé à l’écran ({n}) · {p} posée(s) · {r} rappelée(s)',
  'ad.par.releveCsvOk': 'Relevé téléchargé',
  'ad.par.triPose': 'Trier par date de pose',
  'ad.par.triPoseOn': 'Plus récentes en tête',
  'ad.par.triPoseHint':
    'Range les traductions déjà posées de la plus récente à la plus ancienne, lues sur les jours retenus par cet appareil. Celles dont le jour n’est pas connu ferment la liste.',
  'ad.par.triPoseBackHint':
    'Revient à l’ordre du fichier, tel que le relecteur l’a rendu — fichier et langue groupés.',
  'ad.par.triPoseDateHint':
    'Le jour où la console a vu cette clé posée pour la première fois, retenu sur cet appareil.',
  'ad.par.triAncien': 'À revoir en premier',
  'ad.par.triAncienOn': 'Plus anciennes en tête',
  'ad.par.triAncienAge': 'plus ancienne : {n} j',
  'ad.par.triAncienAgeHint':
    'Le nombre de jours écoulés depuis la plus ancienne pose lue, sur les jours de pose retenus par cet appareil.',
  'ad.par.triAncienHint':
    'Remonte les traductions posées il y a le plus longtemps, lues sur les jours retenus par cet appareil : celles qui attendent une relecture depuis le plus de jours passent devant. Les lignes dont le jour n’est pas connu ferment la liste.',
  'ad.par.triAncienBackHint':
    'Revient à l’ordre du fichier, tel que le relecteur l’a rendu — fichier et langue groupés.',
  'ad.par.triJeune': 'Tri par âge : les plus jeunes',
  'ad.par.triJeuneOn': 'Plus jeunes en tête',
  'ad.par.triJeuneAge': 'plus jeune : {n} j',
  'ad.par.triJeuneAgeHint':
    'Le nombre de jours écoulés depuis la plus jeune pose lue, sur les jours de pose retenus par cet appareil.',
  'ad.par.triJeuneHint':
    'Range les traductions par âge de pose, les plus jeunes d’abord : ce qui vient d’être posé s’ouvre avant les poses anciennes. Les lignes dont le jour n’est pas connu ferment la liste.',
  'ad.par.triJeuneBackHint':
    'Revient à l’ordre du fichier, tel que le relecteur l’a rendu — fichier et langue groupés.',
  'ad.par.triJeuneRow': 'posée il y a {n} j',
  'ad.par.triJeuneRowHint':
    'L’âge de cette pose, en jours : c’est lui qui sert au rangement de la liste.',
  'ad.par.triEcart': 'Tri par clés en écart',
  'ad.par.triEcartOn': 'Les plus creusés en tête',
  'ad.par.triEcartHead': 'plus creusé : {f} — {n}',
  'ad.par.triEcartHeadHint':
    'Le fichier qui ouvre la liste, et son nombre de clés en écart : manquantes d’un côté, ou sans équivalent français.',
  'ad.par.triEcartHint':
    'Range les fichiers par nombre de clés en écart, les plus creusés en tête — comptées sur les clés réellement lues, resserrement et recherche compris. Chaque ligne dit alors son propre écart.',
  'ad.par.triEcartBackHint':
    'Revient à l’ordre du relevé, sans mesure sur les lignes.',
  'ad.par.rowEcart': 'écart {n}',
  'ad.par.triEcartHeadFiles': '{k} fichier(s) en écart · plus creusé : {f} — {n}',
  'ad.par.retourGroup': '{n} clé(s) restante(s) sur {total}',
  'ad.par.retourGroupHint':
    'Les clés de ce fichier qui restent à compléter, sur les lignes que le relevé importé porte pour lui — les clés déjà posées ou déjà traduites ne sont pas comptées.',
  'ad.par.retourSearchPh': 'Chercher un fichier dans le relevé',
  'ad.par.retourSearchHint':
    'Ne garde que les lignes d’un fichier nommé — « legal », « offres »… —, sans traverser les vingt et un fichiers du relevé.',
  'ad.par.retourSearchClear': 'Effacer la recherche du relevé',
  'ad.par.retourSearchCount': '{n} fichier(s) · {l} ligne(s)',
  'ad.par.retourSearchNone':
    'Aucune ligne du relevé ne porte « {q} » : la recherche porte sur le nom du fichier, pas sur la clé ni sur la traduction.',
  'ad.par.releveCsvHint':
    'Télécharge le relevé importé tel qu’il se lit à l’écran, après les gommages : une ligne par clé encore là, avec son état et, dans une colonne « Posée le », le jour où la console a vu chaque traduction posée, et dans la suivante l’âge de cette pose en jours, pour trier la relecture dans un tableur. Son nom porte le nombre de lignes du relevé, celui des traductions déjà posées et celui des lignes rappelées pendant la visite, pour distinguer deux relevés d’une même journée dans un dossier de téléchargements.',
  'ad.par.rappelees':
    '{n} ligne(s) rappelée(s) pendant la visite — leur compte entre dans le nom du relevé téléchargé.',
  'ad.par.gommeesBack': 'Rappeler les gommées',
  'ad.par.gommeesBackHint':
    'Remet en place toutes les lignes gommées pendant cette visite, avec leurs traductions, telles qu’elles étaient avant le premier effacement.',
  'parPose.badge': '{n} traduction(s) encore à poser',
  'parPose.hint':
    'Repère de pose : {n} traduction(s) encore à poser sur les {cles} clé(s) de {fichier}. Il s’efface quand tout est posé.',
  'parPose.open':
    'Un clic ouvre le relevé de parité, déjà resserré sur ce fichier.',
  'ad.par.resteCsv': 'CSV des restantes ({n})',
  'ad.par.resteCsvHint':
    'Un fichier réduit aux seules clés encore vides du relevé importé — ni posées depuis, ni déjà traduites —, à confier pour un second passage. Son nom porte le nombre de clés restantes, comme les classeurs de la console.',
  'ad.par.resteCsvOk': 'Restantes exportées',
  'ad.par.importTraduites': 'Traduites à recopier',
  'ad.par.importTraduitesOn': 'Réduit aux traductions',
  'ad.par.importTraduitesHint':
    'Ne garder que les clés que le relecteur a traduites et que le site ne porte pas encore : la copie ne prend alors que celles-là, d’un trait.',
  'ad.par.importTraduitesExitHint':
    'Un clic rend le relevé entier, avec les clés encore vides et celles déjà posées.',
  'ad.par.importTraduitesNone':
    'Aucune traduction rendue n’attend d’être recopiée : le relecteur n’a rien écrit que le site ne porte déjà.',
  'ad.par.importCopyNarrow': 'Copier ces {n} clé(s)',
  'ad.par.importCopyNarrowHint':
    'Copie les seules clés traduites que la liste laisse voir, fichier et langue en tête, prêtes à compléter une par une.',
  'ad.par.traduitesCsv': 'CSV des traduites ({n})',
  'ad.par.traduitesCsvHint':
    'Un fichier réduit aux seules clés que le relecteur a traduites et que le site ne porte pas encore, avec le texte français en face — à transmettre tel quel, sans passer par la copie de texte.',
  'ad.par.traduitesCsvOk': 'Traduites exportées',
  'ad.par.chipTag': 'Clés',
  'ad.par.chipNoneTag': 'Clés',
  'ad.par.chipCount': '{n} clé(s) en écart',
  'ad.par.chipSplit': 'AR {ar} · EN {en} · dont {orph} sans équivalent français',
  'ad.par.chipNone': 'Les trois langues portent la même liste de clés',
  'ad.par.chipHint':
    'Clés qu’une langue nomme sans l’autre, lues sur les dictionnaires du site ; un clic ouvre le relevé.',
  'ad.par.focusOn': 'Relevé resserré sur {fichier}',
  'ad.par.focusFam': 'clés {fam}',
  'ad.par.focusHint':
    'Ce relevé ne montre que ce fichier, et les clés qui portent la famille demandée ; le reste du travail se lit en retirant le resserrement.',
  'ad.par.focusClear': 'Voir tout le relevé',
  'ad.par.focusReste': '{n} clé(s) restaient',
  'ad.par.focusResteHint':
    'Ce qui restait à poser dans ce fichier au moment où le lien a été copié ; le relevé refait le compte sur les dictionnaires du site.',
  'ad.par.searchPh': 'Chercher un fichier',
  'ad.par.searchHint':
    'Filtre le relevé par nom de fichier — « legal », « offres »… —, pour retrouver un fichier sans passer par une pastille d’écran.',
  'ad.par.searchClear': 'Effacer la recherche',
  'ad.par.searchCount': '{n} fichier(s)',
  'ad.par.searchNone':
    'Aucun fichier ne porte « {q} » : les vingt et un fichiers se nomment dict.…, et le resserrement reste actif tant qu’il n’est pas retiré.',
  'ad.par.focusLink': 'Copier le lien',
  'ad.par.focusLinkHint':
    'Copie l’adresse du relevé resserré sur ce fichier, avec ce qui y restait à poser : un relecteur l’ouvre d’un clic, sans traverser les vingt et un fichiers.',
  'ad.par.focusLinkOk': 'Lien copié',
  'ad.par.focusLinkOkReste': 'Lien copié · {n} clé(s)',
  'ad.par.focusLinkFail': 'Copie refusée',
  'ad.par.rowLink': 'Copier le lien de ce fichier',
  'ad.par.rowLinkHint':
    'Copie l’adresse du relevé resserré sur ce seul fichier, avec le nombre de clés qui y restent — à envoyer au relecteur qui s’en occupe.',
  'ad.relectureChip': '{n} page(s) à relire',
  'ad.relectureChipDone': 'Relecture à jour',
  'ad.relectureChipHint':
    'Pages encore à relire des deux côtés, lues sur le carnet de cet appareil. Un clic ouvre la liste de relecture.',
  'ad.relectureArCount': '{n} page(s) à relire en arabe',
  'ad.relectureEnCount': '{n} page(s) à relire en anglais',
  'ad.relectureArDone': 'Arabe à jour',
  'ad.relectureEnDone': 'Anglais à jour',
  'ad.relectureArHint':
    'Les pages pas encore cochées en arabe sur cet appareil ; un clic ouvre la liste, resserrée sur ces pages.',
  'ad.relectureEnHint':
    'Les pages pas encore cochées en anglais sur cet appareil ; un clic ouvre la liste, resserrée sur ces pages.',
  'ad.relectureEcartTag': 'Écart',
  'ad.relectureEcartNoneTag': 'Accord',
  'ad.relectureEcartCount': '{n} page(s) cochée(s) d’un seul côté',
  'ad.relectureEcartNone': 'Les deux langues s’accordent sur les trente pages',
  'ad.relectureEcartHint':
    'Pages où une langue est cochée sans l’autre ; un clic ouvre la liste resserrée sur ces pages.',
  'ad.relectureTourneeTag': 'Tournée',
  'ad.relectureTourneeCount':
    'Première tournée : {done} / {n} écrans relus des deux côtés · {reste} encore à cocher en arabe',
  'ad.relectureTourneeDone': 'La première tournée est relue des deux côtés',
  'ad.relectureTourneeHint':
    'Les dix écrans de cette tournée, dans l’ordre de passage, l’arabe d’abord. Un clic ouvre la liste resserrée sur elle.',
  'ad.relectureTourneeGo':
    'La ligne de la tournée les coche d’un geste, l’arabe d’abord, puis les mêmes en anglais : la pastille se calme quand les dix sont faits des deux côtés.',
  'ad.relectureTourneeRestAr': 'Restent en arabe : {list}',
  'ad.relectureTourneeRestArOne': 'Reste en arabe : {list}',
  'ad.relectureTourneeRestNone': 'Arabe complet sur cette tournée',
  'ad.relectureTourneeRestHint':
    'Les rangs de cette tournée qu’il reste à cocher en arabe, dans l’ordre du plan : de quoi choisir par où reprendre.',
  'ad.relectureMiniResume': 'Reprise à l’écran {n}',
  'ad.relectureMiniDone': 'Tournée faite des deux côtés',
  'ad.relectureMiniSay': '{n} · {page} — {etat}',
  'ad.relectureMiniSayHint':
    'Survolez une marque : elle dit son écran et son état ; un clic l’ouvre dans un nouvel onglet.',
  'ad.relectureMiniOpen': 'un clic l’ouvre dans un nouvel onglet',
  'ad.relectureMiniClose': 'Fermer les {n} restants',
  'ad.relectureMiniCloseHint':
    'Coche d’un geste, dans les deux langues, les {n} écran(s) encore ouverts de cette tournée — l’arabe et l’anglais ensemble —, sans quitter l’en-tête ni ouvrir le panneau. Les écrans déjà cochés restent, et les autres tournées ne bougent pas.',
  'ad.relectureMiniClosed': 'Fermé d’un coup : {n} écran(s) des deux côtés',
  'ad.relectureTourneeFlash': 'Fermé {n} · {apres}/{total} au total',
  'ad.suivi.rlFriseBandeLast': 'Dernier geste · {date} · {sens}',
  'ad.suivi.rlFriseBandeLastHint':
    'Le dernier geste de cette tranche seule : {date}, {sens} — les écrans {ecrans} touchés, dont {n} réellement changé(s) —, puis {apres}. Ce n’est pas le dernier geste de tout le carnet.',
  'ad.suivi.rlFriseBandeLastApres':
    'le compte atteint après ce geste-là : {apres} écran(s) fermés des deux côtés sur {total}',
  'ad.suivi.rlFriseBandeLastApresNone':
    'compte atteint non noté pour ce geste : il précède le moment où la frise l’a noté',
  'ad.suivi.rlFriseGestesTitle': 'Les gestes de cette tranche, datés',
  'ad.suivi.rlFriseGestesCloseHint':
    'Referme la carte : la date de la tranche reste, seule.',
  'ad.suivi.rlFriseGestesTouched': '{n} écran(s) touchés',
  'ad.suivi.rlFriseGestesTouchedDeja':
    '{n} écran(s) touchés · {deja} / {total} déjà fermés avant ce geste',
  'ad.suivi.rlFriseGestesTouchedDejaNone':
    '{n} écran(s) touchés · déjà fermés avant : non noté',
  'ad.suivi.rlFriseGestesApres': '{apres} / {total} fermés après',
  'ad.suivi.rlFriseGestesAutres':
    'Ce même clic emportait aussi : {tranches}',
  'ad.suivi.rlFriseGestesAutresHint':
    'Les {n} autre(s) tranche(s) notée(s) sous le même instant, nommée(s) comme dans la frise : ce geste n’était pas un clic de tranche solitaire, il en a remué plusieurs d’un coup.',
  'ad.suivi.rlFriseGestesClicTotal':
    'Ce clic a touché {n} écran(s) au total, tranche par tranche : {detail}',
  'ad.suivi.rlFriseGestesClicTotalHint':
    'La somme des écrans que tous les gestes de ce même clic ont touchés — {n} en tout, sur {tranches} tranche(s) —, et ce que chacune y a porté. Le clic se lit d’un coup, sans additionner ses tranches à la main.',
  'ad.suivi.rlFriseGestesSortAll': 'Tous',
  'ad.suivi.rlFriseGestesSortFerme': 'Fermés',
  'ad.suivi.rlFriseGestesSortRouvert': 'Rouverts',
  'ad.suivi.rlFriseGestesSortHint':
    'Range la carte par sens : les fermetures d’un côté, les réouvertures de l’autre, chacune avec son compte. Un second clic sur la pastille tenue rend les deux sens.',
  'ad.suivi.rlFriseGestesSortNone':
    'Aucun geste de ce sens dans cette tranche : la pastille « Tous » rend la liste entière.',
  'ad.suivi.rlFriseSliceCsv': 'CSV de cette tranche',
  'ad.suivi.rlFriseSliceCsvOk': 'Tranche exportée',
  'ad.suivi.rlFriseSliceCsvHint':
    'Télécharge une feuille réduite à la tranche affichée — écrans {de}–{a} : ses écrans et leurs deux cases, puis ses gestes datés avec le compte atteint de chacun, et les remises à zéro tombées entre son plus ancien et son plus récent geste. Les autres tranches ne partent pas avec elle.',
  'ad.suivi.rlFriseReset': 'Carnet remis à zéro le {date}',
  'ad.suivi.rlFriseGestesReel':
    'Ce sens a réellement touché {ecrans} écran(s) au total, en {n} geste(s) de cette tranche.',
  'ad.suivi.rlFriseLastSortHint':
    'Range la ligne du dernier geste par sens : la dernière fermeture seule, ou la dernière réouverture seule, au lieu du dernier clic de tout le carnet. La pastille tenue reste tenue tant qu’on n’en choisit pas une autre.',
  'ad.suivi.rlFriseLastNoneSens':
    'Aucun geste de ce sens dans le carnet : la pastille « Tous » rend le dernier geste de cet appareil.',
  'ad.suivi.rlFriseSliceCsvGestes':
    'Elle emportera {n} geste(s) de cette tranche, le plus ancien du {jour}.',
  'ad.suivi.rlFriseSliceCsvGestesNone':
    'Aucun geste groupé retenu sur cette tranche : la feuille n’emporte que ses écrans et leurs cases.',
  'ad.suivi.rlFriseDelaiInstant': 'à l’instant',
  'ad.suivi.rlFriseDelaiMin': 'il y a {n} min',
  'ad.suivi.rlFriseDelaiH': 'il y a {n} h',
  'ad.suivi.rlFriseDelaiJ': 'il y a {n} j',
  'ad.suivi.rlFriseBandeLastDelaiHint':
    'Le délai écoulé depuis ce geste : {delai}.',
  'ad.suivi.rlFriseLastCardCounts':
    'Cette tranche porte {n} geste(s) daté(s), dont {m} de ce sens-là.',
  'ad.suivi.rlFriseOuvertesCsv': 'CSV des tranches ouvertes ({n})',
  'ad.suivi.rlFriseOuvertesCsvOk': 'Tranches exportées',
  'ad.suivi.rlFriseOuvertesCsvHint':
    'Télécharge un seul fichier pour les {n} tranche(s) qui gardent encore au moins un écran non fermé des deux côtés : leurs {ecrans} écran(s) encore ouvert(s) avec leurs cases, leurs gestes datés — {gestes} — et le compte atteint de chacun. Sa ligne de tête dit l’ordre retenu des tranches ouvertes — ordre du plan ou fin d’abord —, avec le nombre de tranches que ce tri a déplacées, et les tranches s’y rangent de la même façon. Elle nomme aussi les deux tranches qui bornent cet ordre — « l’ordre s’ouvre sur … » et « l’ordre se referme sur … » —, pour que le fichier dise par où son rangement commence et où il s’arrête. Une colonne « Dernière réouverture » y date le passage du geste groupé, et dit combien de tranches ce clic-là a remuées. Une colonne de sous-total, posée à côté des écrans, se remplit sur la ligne qui ferme chaque tranche et dit combien d’écrans elle garde encore ouverts. Une colonne « Position », posée juste après le nom de la tranche, donne son rang dans l’ordre retenu — « 2 / 3 » —, pour relire le rangement ligne par ligne. Une colonne « Écrans fermés », posée juste à côté du sous-total, dit ce que la tranche a déjà fermé des deux côtés. Une colonne « Écrans gardés », posée juste après la position, dit à chaque ligne ce que la tranche garde encore ouvert sur son étendue, et la ligne de total en fait autant pour l’ensemble. Une colonne « Écart au plus chargé », posée juste après, dit pour chaque tranche combien d’écrans la séparent de celle qui en garde le plus — 0 pour la plus chargée elle-même. Une tranche déjà finie des deux côtés n’y entre pas. Sa ligne de total dit combien de tranches gardent encore une position, et l’étendue du rangement, de la position 1 à la dernière, pour refermer le fichier sur son rangement. Sa ligne de total date aussi la tranche qui ferme, en disant depuis combien de temps elle n’a pas bougé, comme le tableau daté. Une ligne de synthèse, posée sous la table, dit ce que chaque tranche ouverte garde encore ouvert, avec le total de l’ensemble devant.',
  'ad.suivi.rlFriseOuvertesCsvGarde':
    'La colonne « Écart au plus chargé » se lit depuis la tranche qui en garde le plus : {tranche} — {n} écran(s) encore ouvert(s) des deux côtés.',
  'ad.suivi.rlFriseOuvertesEcrans': 'Encore {n} écran(s) à fermer',
  'ad.suivi.rlFriseOuvertesEcransHint':
    'Les {n} écran(s) de ces {tranches} tranche(s) qui ne sont pas encore fermés des deux côtés : ce que la porte voisine emporte, et ce que la réouverture rendrait ouverts.',
  'ad.suivi.rlFriseRouvrirOuvertes': 'Rouvrir ces tranches',
  'ad.suivi.rlFriseRouvrirOuvertesConfirm': 'Confirmer la réouverture',
  'ad.suivi.rlFriseRouvrirOuvertesOk': 'Rouvertes · {n} écran(s)',
  'ad.suivi.rlFriseRouvrirOuvertesHint':
    'Un clic demande, un second confirme : rouvre d’un coup, des deux côtés, les {ecrans} écran(s) des {n} tranche(s) qui gardent encore quelque chose à finir. Les tranches déjà fermées des deux côtés ne bougent pas — un travail achevé ne se défait pas ici. Le geste se note, daté, dans chacune de ces tranches : il se relit ensuite dans leurs cartes et dans les feuilles emportées.',
  'ad.suivi.rlFriseOuvertesRangsHint':
    'Les rangs encore à fermer, tranche par tranche : {rangs}.',
  'ad.suivi.rlFriseOuvertesSensChipHint':
    'Ouvre la carte datée de la tranche {de}–{a}, déjà rangée sur ce sens-là ({sens}) : ses gestes s’y relisent par fermetures ou par réouvertures, sans retrouver la tranche plus bas.',
  'ad.suivi.rlFriseOuvertesSensChipAucun':
    'La tranche {de}–{a} n’a aucun geste à dater : la frise l’amène seulement sous les yeux.',
  /* Le poids d'une seule pastille : ce que sa tranche garde encore ouvert,
     à côté de son sens, sans faire additionner les pastilles de la tête. */
  'ad.suivi.rlFriseOuvertesSensChipEcrans':
    'Cette seule tranche garde {n} écran(s) encore ouvert(s) des deux côtés.',
  'ad.suivi.rlFriseRouvrirCases': 'Retirerait {n} case(s) cochée(s)',
  'ad.suivi.rlFriseRouvrirCasesHint':
    'Les cases cochées que ce second clic retirerait d’un coup : {n} case(s) sur les écrans des {tranches} tranche(s) encore ouvertes, l’arabe et l’anglais ensemble. Ce qui y était déjà fermé des deux côtés repart ouvert.',
  'ad.suivi.rlFriseLastTranches': '{n} tranche(s) d’un seul clic',
  'ad.suivi.rlFriseLastTranchesHint':
    'Ce dernier clic a rouvert {n} tranche(s) d’un même geste : le carnet les note une à une, toutes sous le même instant. Le nombre dit l’étendue du clic, et non le nombre de gestes.',
  'ad.suivi.rlFriseLastTranchesDelaiHint':
    'Ce clic groupé a eu lieu {delai} : le délai écoulé depuis son instant, lu à côté du nombre de tranches qu’il a remuées.',
  'ad.suivi.rlFriseRangsCopier': 'Copier les rangs restants',
  'ad.suivi.rlFriseRangsCopies': 'Rangs copiés',
  'ad.suivi.rlFriseRangsCopierHint':
    'Copie la liste des rangs encore à fermer, tranche par tranche — {ecrans} écran(s) sur {n} tranche(s) —, prête à coller dans un message. Son en-tête dit l’ordre retenu des tranches ouvertes, avec le compte des tranches que ce tri a déplacées et l’étendue du rangement — de la position 1 à la dernière — à côté du compte de tranches ouvertes, et les tranches s’y rangent de même : la liste se relit seule. Elle nomme aussi les deux bornes du rangement — {ouvre} pour l’ouverture, {ferme} pour la fermeture —, et son en-tête porte, à côté de ces bornes et du compte de tranches ouvertes, le compte de celles que le tri a déplacées : {deplacees}. Chaque tranche y porte sa position dans l’ordre retenu, à côté de son nom, comme la colonne « Position » du CSV. Une ligne dit aussi la date du dernier geste de la tranche qui ferme le rangement, pour dater la borne de fermeture sans rouvrir le carnet. Une tranche faite écrit « — tranche faite » au lieu de laisser un blanc. Sous la tranche qui ferme le rangement, une ligne dit le nombre d’écrans qu’elle garde encore ouverts des deux côtés. Son en-tête nomme aussi la tranche la plus ancienne encore ouverte, avec la date de son dernier geste et le délai écoulé, et porte sur cette même ligne le compte des tranches que le tri a déplacées. Cette ligne porte aussi le compte des écrans que cette tranche garde encore ouverts des deux côtés, à côté de son délai, et son écart au plus chargé, lu sur les mêmes tranches que le CSV — de combien d’écrans elle se tient de celle qui en garde le plus. Une dernière ligne, « Synthèse des écrans gardés », dit ce que l’ensemble des tranches ouvertes garde encore ouvert, avec le total devant et chaque tranche nommée avec son poids, comme la ligne du CSV. Une ligne la suit pour la tranche la plus légère : son nom, le nombre d’écrans qu’elle garde et son écart à la plus chargée — 0 quand c’est elle.',
  'ad.suivi.rlFriseTableauCopier': 'Copier le tableau',
  'ad.suivi.rlFriseTableauCopies': 'Tableau copié',
  'ad.suivi.rlFriseTableauCopierHint':
    'Copie les {ecrans} écran(s) encore à fermer des {n} tranche(s) ouvertes en tableau — une ligne par écran : son rang, son nom et le côté qui manque —, prête à coller dans un message ou un tableur. Là où la porte voisine écrit des lignes courtes, celle-ci rend des colonnes.',
  'ad.suivi.rlFriseTableauDateCopier': 'Copier le tableau daté',
  'ad.suivi.rlFriseTableauDateCopies': 'Tableau daté copié',
  'ad.suivi.rlFriseTableauDateCopierHint':
    'Copie les {ecrans} écran(s) encore à fermer des {n} tranche(s) ouvertes en tableau à six colonnes — rang, écran, côté manquant, écrans gardés de la tranche, écart au plus chargé, et la date du dernier geste de la tranche de l’écran —, prêt à coller dans un message ou un tableur. Sous chaque tranche, une ligne de sous-total dit combien d’écrans elle garde encore ouverts sur son étendue, combien elle en a déjà fermés des deux côtés, et de quel côté ils manquent le plus souvent — la même symétrie que la feuille des tranches ouvertes. Une colonne « Écrans gardés », posée entre le côté qui manque et la date, redit sur chaque ligne ce que la tranche garde encore ouvert sur son étendue — « 3 / 10 » —, comme la colonne du CSV, et la ligne de total en fait autant pour l’ensemble. Une colonne « Écart au plus chargé », posée juste après, dit ligne par ligne combien d’écrans séparent la tranche de celle qui en garde le plus — 0 pour la plus chargée elle-même —, et la ligne de sous-total le redit avec son poids. La ligne de sous-total de chaque tranche porte aussi sa position dans l’ordre retenu, à côté de son nom — « position 2 / 3 » —, comme la liste et le CSV ; et la ligne de total dit l’étendue du rangement, de la position 1 à la dernière, en plus du compte d’écrans, et nomme la tranche qui ferme ce rangement. Une ligne de compte, posée au-dessus du total, dit combien de tranches restent ouvertes — l’étendue du retard avant le chiffre des écrans. Sa ligne de tête nomme aussi les deux tranches qui bornent l’ordre retenu — l’ouverture et la fermeture —, à côté du nom de l’ordre et de son poids, comme le CSV : une copie datée se relit seule. Une tranche sans geste écrit « — aucun geste » plutôt que de laisser la colonne vide. Sa ligne de total nomme aussi la tranche qui garde le plus d’écrans encore ouverts, comme la pastille de position. Elle ferme enfin le tableau par une ligne de synthèse des écrans gardés, comme le CSV et la liste collée : le total devant, puis chaque tranche ouverte nommée avec son poids. Son survol nomme enfin la tranche la plus légère et son écart à la plus chargée : la ligne de synthèse se lit depuis les deux bords du rangement.',
  'ad.suivi.rlFriseTableauDateGarde':
    'La colonne « Écrans gardés » se lit depuis la tranche qui en garde le plus : {tranche} — {n} écran(s) encore ouvert(s) des deux côtés.',
  'ad.suivi.rlFriseTableauDateLegere':
    'La ligne de synthèse se lit depuis la tranche la plus légère : {tranche} — {n} écran(s) encore ouvert(s) des deux côtés, à {ecart} écran(s) de celle qui en garde le plus.',
  'ad.suivi.rlFriseTableauDateLegereSeule':
    'La ligne de synthèse se lit depuis la tranche la plus légère : {tranche} — {n} écran(s) encore ouvert(s) des deux côtés ; c’est aussi celle qui en garde le plus, et son écart vaut 0.',
  'ad.suivi.rlFriseTableauDateMoyenne':
    'La colonne « Écart au plus chargé » se juge d’un seul regard : l’écart moyen des {n} tranche(s) ouvertes vaut {moyenne} écran(s), pour des écarts étalés de {min} à {max} — de la plus chargée à la plus légère.',
  'ad.suivi.rlFriseOuvertesCsvDispersion':
    'Sa ligne de dispersion, posée sous la ligne de synthèse, dit l’étendue des écarts — du plus petit au plus grand —, l’écart moyen des tranches ouvertes et la tranche la plus légère avec son poids et son écart.',
  'ad.suivi.rlFriseRangsCopierDispersion':
    'Sous la tranche la plus légère, une ligne porte la tranche qui ferme le rangement avec son poids et son écart : les deux bords et la borne se lisent dans un même bloc.',
  'ad.suivi.rlFriseClicCopier': 'Copier ce clic',
  'ad.suivi.rlFriseClicCopies': 'Clic copié',
  'ad.suivi.rlFriseClicCopierHint':
    'Copie ce seul clic — {date}, {sens}, {n} écran(s) au total sur {tranches} tranche(s) — avec ses tranches une à une, sans les autres gestes de la carte ni le reste de la feuille.',
  'ad.suivi.rlFriseAncienne': 'Plus ancienne ouverte · {tranche}',
  'ad.suivi.rlFriseAncienneHint':
    'La tranche encore ouverte dont le dernier geste est le plus ancien du carnet : {tranche}, bougée {delai}. C’est elle qui attend depuis le plus longtemps — elle se ferme d’un clic dans la frise.',
  'ad.suivi.rlFriseAncienneCopier': 'Copier la plus ancienne',
  'ad.suivi.rlFriseAncienneCopies': 'Tranche copiée',
  'ad.suivi.rlFriseAncienneCopierHint':
    'Met dans le presse-papiers la tranche encore ouverte qui attend depuis le plus longtemps — {tranche}, bougée {delai} — avec la date de son dernier geste et ses rangs encore à fermer, côté qui manque compris : prête à être fermée sans rouvrir la frise ni déplier sa carte. Elle dit aussi, à côté de son délai, combien d’écrans elle garde encore ouverts des deux côtés.',
  'ad.suivi.rlFriseAncienneCopierN': 'Copier la plus ancienne ({n})',
  /* Le bouton porte, comme sa voisine, le compte et l'ancienneté dans le
     libellé : les deux portes se lisent d'un même regard, sans survol. */
  'ad.suivi.rlFriseAncienneCopierNDelai': 'Copier la plus ancienne ({n}) · {delai}',
  'ad.suivi.rlFriseAncienneCopierCount':
    'La tranche garde {n} écran(s) encore à fermer des deux côtés.',
  'ad.suivi.rlFriseExtremesCopier': 'Copier les deux extrêmes ({n})',
  /* La porte compte les tranches qu'elle emporte, et non leurs écrans :
     l'étendue du geste se lit en tranches — deux bords, ou un seul quand la
     même tranche est à la fois la plus ancienne et la plus récente. */
  'ad.suivi.rlFriseExtremesCopierTranches':
    'Copier les deux extrêmes ({n} tranche(s))',
  /* Le bouton dit aussi depuis quand la plus ancienne attend : l'attente du
     bord ancien se lit sur la porte elle-même, sans survol. */
  'ad.suivi.rlFriseExtremesCopierTranchesDelai':
    'Copier les deux extrêmes ({n} tranche(s)) · la plus ancienne attend {ecart}',
  'ad.suivi.rlFriseExtremesCopies': 'Deux tranches copiées',
  'ad.suivi.rlFriseExtremesCount':
    'Les deux tranches gardent {n} écran(s) encore à fermer des deux côtés.',
  /* Le survol rappelle le compte de tranches du bouton, puis donne celui des
     écrans : l'étendue du geste et son poids se lisent ensemble. */
  'ad.suivi.rlFriseExtremesTranchesCount':
    'Le bouton emporte {n} tranche(s) ; les écrans encore à fermer se comptent à part :',
  'ad.suivi.rlFriseOuvertesTriPlan': 'Ordre du plan',
  'ad.suivi.rlFriseOuvertesTriFin': 'Fin d’abord',
  'ad.suivi.rlFriseOuvertesTriHint':
    'Range les pastilles des tranches encore ouvertes et les tranches de la frise elle-même : dans l’ordre du plan — de la première tranche à la dernière —, ou la fin d’abord, la tranche la plus avancée dans le plan en tête. Le tableau daté emporte le même ordre et le dit dans sa ligne de tête. La ligne qui dit cet ordre y ajoute combien de tranches le tri a déplacées. Le choix reste sur cet appareil d’une visite à l’autre.',
  /* La petite gomme : elle ramène l’ordre à celui du plan d’un seul clic, et
     ne paraît que lorsque ces deux pastilles ont déjà rangé quelque chose. */
  'ad.suivi.rlFriseOuvertesTriGomme': 'Remettre dans l’ordre du plan',
  'ad.suivi.rlFriseOuvertesTriGommeHint':
    'Efface d’un seul clic l’ordre des tranches ouvertes : les {n} tranche(s) qu’elle vient de remettre dans l’ordre du plan — pastilles, tranches de la frise et ligne de tête du tableau daté ensemble — repartent de la première tranche à la dernière, et le choix revient à « Ordre du plan », comme à la première ouverture.',
  /* La gomme date le geste qu'elle défait : depuis quand la fin tenait. */
  'ad.suivi.rlFriseOuvertesTriGommeDepuis':
    'L’ordre « Fin d’abord » était tenu depuis {depuis} : la gomme date ainsi le geste qu’elle défait.',
  /* Le poids du tri : combien de tranches le rangement a réellement
     déplacées, à côté des deux pastilles. */
  'ad.suivi.rlFriseOuvertesTriPoids': '{n} tranche(s) déplacée(s)',
  'ad.suivi.rlFriseOuvertesTriPoidsNone': 'aucune tranche déplacée',
  'ad.suivi.rlFriseOuvertesTriPoidsHint':
    'Le poids du rangement, lu sur les {tranches} tranche(s) encore ouvertes : {n} d’entre elles ne tombent pas au même rang dans l’ordre du plan et dans l’ordre retenu — « {ordre} ». Le compte se lit à côté des deux pastilles, pour que le tri dise son effet avant même d’ouvrir un fichier.',
  'ad.suivi.rlFriseOuvertesTriPoidsBornes':
    'L’ordre retenu s’ouvre sur {ouvre} et se ferme sur {ferme}.',
  'ad.suivi.rlFriseOuvertesTriPoidsBornesNone':
    'Aucune tranche n’est rangée : l’ordre n’a ni ouverture ni fermeture à nommer.',
  /* Le compte d'écrans encore ouverts, lu avec le rangement : la pastille dit
     ce que ces tranches gardent, pas seulement comment elles sont rangées. */
  'ad.suivi.rlFriseOuvertesTriPoidsEcrans':
    'Ces {tranches} tranche(s) encore ouverte(s) gardent {ecrans} écran(s) non fermés des deux côtés — le compte se lit avec le rangement, sans ouvrir de fichier.',
  /* La tranche rangée qui pèse le plus dans ce qui reste ouvert : le survol de
     la position la nomme à côté du poids du tri et de ses deux bornes. */
  'ad.suivi.rlFriseOuvertesTriPoidsGarde':
    'La tranche qui en garde le plus : {tranche} — {n} écran(s) encore ouvert(s) des deux côtés.',
  /* La tranche que le tri en cours a déplacée le plus récemment : la ligne du
     dernier geste la nomme, avec sa date. */
  'ad.suivi.rlFriseLastDeplacee':
    'Déplacée le plus récemment par le tri · {tranche} · {date}',
  'ad.suivi.rlFriseLastDeplaceeHint':
    'Parmi les {n} tranche(s) que le tri en cours a déplacées, celle dont le dernier geste est le plus récent : {tranche}, bougée le {date}. Une tranche que le rangement laisse en place ne se lit pas ici.',
  'ad.suivi.rlFriseLastDeplaceeNone': 'Aucune tranche déplacée par le tri en cours',
  'ad.suivi.rlFriseLastDeplaceeNoneHint':
    'L’ordre retenu ne déplace aucune tranche : les deux ordres se confondent, et la ligne du dernier geste n’a pas de tranche récemment déplacée à nommer.',
  'ad.suivi.rlFriseExtremesCopierHint':
    'Met dans le presse-papiers les deux tranches extrêmes encore ouvertes — {ancienne}, bougée {delaiAncienne}, et {recente}, bougée {delaiRecente} —, chacune avec la date de son dernier geste et ses rangs encore à fermer : ce qui attend depuis le plus longtemps et ce qui vient de bouger, dans une seule feuille.',
  'ad.suivi.rlFriseRecenteCopierN': 'Copier la plus récente ({n})',
  /* Le bouton dit lui-même depuis quand la tranche a bougé, sans attendre le
     survol : le libellé porte le compte et l'ancienneté ensemble. */
  'ad.suivi.rlFriseRecenteCopierNDelai': 'Copier la plus récente ({n}) · {delai}',
  'ad.suivi.rlFriseRecenteCopies': 'Tranche copiée',
  'ad.suivi.rlFriseRecenteCopierHint':
    'Met dans le presse-papiers la tranche encore ouverte touchée le plus récemment — {tranche}, bougée {delai} — avec la date de son dernier geste et ses rangs encore à fermer, côté qui manque compris : le pendant de la plus ancienne, prêt à être refermé.',
  'ad.suivi.rlFriseRecenteCopierCount':
    'La tranche garde {n} écran(s) encore à fermer des deux côtés.',
  'ad.suivi.rlFriseCopyTriAncienne': 'Plus ancienne d’abord',
  'ad.suivi.rlFriseCopyTriRecente': 'Plus récente d’abord',
  'ad.suivi.rlFriseCopyTriHint':
    'Range les deux portes de copie de la tête : celle de la tranche la plus ancienne encore ouverte d’abord, ou celle de la plus récemment touchée. L’ordre reste sur cet appareil d’une visite à l’autre.',
  'ad.suivi.rlFriseEcartInstant': 'à l’instant',
  'ad.suivi.rlFriseEcartMin': '{n} min',
  'ad.suivi.rlFriseEcartH': '{n} h',
  'ad.suivi.rlFriseEcartJ': '{n} j',
  'ad.suivi.rlFriseBandeReouvertApres': 'Rouverte {delai} après sa fermeture',
  'ad.suivi.rlFriseBandeReouvertApresHint':
    'La tranche a été rouverte après avoir été fermée : ce délai se lit entre la fermeture du {date} et cette réouverture — il dit combien de temps l’état fermé a tenu, et non depuis quand la tranche a bougé.',
  'ad.suivi.rlFriseOuvertesSensFerme': 'fermé',
  'ad.suivi.rlFriseOuvertesSensRouvert': 'rouvert',
  'ad.suivi.rlFriseOuvertesSensAucun': 'aucun geste',
  'ad.suivi.rlFriseOuvertesSensHint':
    'Le sens du dernier geste de chacune des tranches encore ouvertes, nommée une à une : ce qu’une fermeture y a laissé, ou ce qu’une réouverture y a rendu. Une tranche qu’aucun geste n’a touchée le dit.',
  'ad.suivi.rlFriseBandeLastRest':
    'Il a laissé {n} écran(s) encore ouvert(s) dans cette tranche.',
  'ad.suivi.rlFriseBandeLastRestNone':
    'Il n’a laissé aucun écran ouvert dans cette tranche : elle était fermée des deux côtés après lui.',
  'ad.suivi.rlFriseBandeLastRestUnknown':
    'Écrans laissés ouverts : non noté pour ce geste, qui précède ce compte.',
  'ad.suivi.rlFriseBook': 'Carnet · {n} geste(s) retenu(s) · du {jour} au {recent}',
  'ad.suivi.rlFriseBookHint':
    'Ce que « Oublier les gestes » emporterait : {n} geste(s) de tranche de cet appareil, du plus ancien — le {jour} — au plus récent — le {recent}. Les cases cochées, elles, restent.',
  'ad.suivi.rlFriseForget': 'Oublier les gestes',
  'ad.suivi.rlFriseForgetConfirm': 'Confirmer l’oubli',
  'ad.suivi.rlFriseForgetHint':
    'Efface le carnet des gestes de tranche de cet appareil : la feuille CSV repart d’un carnet vierge, et la tête de la frise n’a plus de dernier geste à rappeler. Les cases cochées restent ; un second clic confirme.',
};

const ar: Dict = {
  'ad.suivi.rlTitle': 'مراجعة العربية والإنجليزية، صفحة بصفحة',
  'ad.suivi.rlNote': '{done} صفحة مُراجَعة باللغتين من {n} · محفوظة على هذا الجهاز',
  'ad.suivi.rlBoth': '{n} صفحة مُراجَعة باللغتين، من 30',
  'ad.suivi.rlAr': 'العربية',
  'ad.suivi.rlEn': 'الإنجليزية',
  'ad.suivi.rlArHint': 'تعليم المراجعة العربية لهذه الصفحة',
  'ad.suivi.rlEnHint': 'تعليم المراجعة الإنجليزية لهذه الصفحة',
  'ad.suivi.rlReset': 'إلغاء كل التأشير',
  'ad.suivi.rlCsv': 'تصدير إلى CSV',
  'ad.suivi.rlCsvHint':
    'دفتر هذا الجهاز، شاشة بشاشة، مع الخانتين والجهة المؤشَّرة — وعمود «الدورة» الذي يسم الدورتين، الشاشات ١–١٠ ثم ١١–٢٠، ثم عمود «الاستئناف» الذي يسم أول شاشة ما زالت مفتوحة في كل دورة. وورقة ثانية، يفصلها سطر فارغ، تعطي خلاصة كل دورة — مداها وعدّيها وتوافقهما والأرقام التي ما زالت مفتوحة واستئنافها —، لإرسالها دون تصفية إلى مُراجع. وورقة ثالثة، «إيماءة الشريحة»، تؤرّخ كل نقرة أغلقت شريحة أو أعادت فتحها دفعة واحدة، وتقول في عمود أخير كم شاشة أُغلقت من الجهتين بعدها مباشرة — العدد الذي وصلت إليه المراجعة، لا العدد الذي مسّته النقرة فقط. وسطر «Carnet remis à zéro le …» يؤرّخ كل نسيان للإيماءات، لتمييز دفتر أُفرغ من دفتر لم يُستخدم قط.',
  'ad.suivi.rlCsvOk': 'تم تنزيل الملف',
  'ad.suivi.rlCopy': 'نسخ القائمة',
  'ad.suivi.rlCopyHint':
    'الأسطر الثلاثون نصًّا، مع خانات هذا الجهاز وعددي الدورتين والأرقام التي ما زالت مفتوحة في كل منهما واستئنافها، وفي الرأس آخر إيماءة شريحة مع تاريخها والعدد الذي وصلت إليه، ثم سطر الدفتر — كم إيماءة محفوظة، من أقدمها إلى أحدثها، وكم إفراغًا وقع بينها — جاهزة للصق في رسالة.',
  'ad.suivi.rlCopyOk': 'تم نسخ القائمة',
  'ad.suivi.rlCopyFail': 'تعذّر النسخ',
  'ad.suivi.rlResetHint': 'يمحو الخانات المؤشَّرة على هذا الجهاز؛ ونقرة ثانية تؤكّد.',
  'ad.suivi.rlResetConfirm': 'تأكيد المحو',
  'ad.suivi.rlKeep':
    'تبقى الخانات على هذا الجهاز: لا تُكتب في القاعدة ولا في الخطة، ولا تنتقل من متصفح إلى آخر.',
  'ad.suivi.rlTermesTitle': 'المصطلحات المثبَّتة، تُحفظ من صفحة إلى أخرى',
  'ad.suivi.rlTermesNote': 'مفردات الفقرة ١١٫٢ من الخطة: الكلمة نفسها تُقرأ بالطريقة نفسها في كل مكان.',
  'ad.suivi.rlTermesFr': 'الفرنسية',
  'ad.suivi.rlTermesAr': 'العربية',
  'ad.suivi.rlTermesEn': 'الإنجليزية',
  'ad.suivi.rlOneSide': 'مؤشَّرة من جهة واحدة',
  'ad.suivi.rlOneSideHint':
    'إظهار الصفحات التي لا تتوافق فيها العربية والإنجليزية — مؤشَّرة من جهة واحدة فقط.',
  'ad.suivi.rlOneSideNone': 'لا توجد صفحة مؤشَّرة من جهة واحدة: اللغتان متفقتان في كل مكان.',
  'ad.suivi.rlOnlyAr': 'العربية فقط',
  'ad.suivi.rlOnlyEn': 'الإنجليزية فقط',
  'ad.suivi.rlShowAll': 'إعادة الصفحات الثلاثين: يظهر اللوح كاملًا.',
  'ad.suivi.rlOnlyArNone': 'كل شيء مؤشَّر بالعربية: لا شيء تبقّى من هذا الجانب.',
  'ad.suivi.rlOnlyEnNone': 'كل شيء مؤشَّر بالإنجليزية: لا شيء تبقّى من هذا الجانب.',
  'ad.suivi.rlShown': '{n} صفحة معروضة من {total}',
  'ad.suivi.rlAll': 'الصفحات الثلاثون، بترتيب المرور',
  'ad.suivi.rlTournee1': 'العشر الأولى',
  'ad.suivi.rlTournee2': 'الشاشات {de}–{a}',
  'ad.suivi.rlTourneeHint':
    'يحصر القائمة في الشاشات من {de} إلى {a}، بترتيب الخطة: العربية أولًا، ثم الشاشات نفسها بالإنجليزية. ونقرة ثانية تعيد الصفحات الثلاثين، والمؤشر الآخر يعرض الدورة الأخرى.',
  'ad.suivi.rlFirstTenLine':
    'دورة {de}–{a}، العربية أولًا: {ar} / {n} بالعربية، ثم الشاشات نفسها بالإنجليزية: {en} / {n}.',
  'ad.suivi.rlFirstTenDone': '{n} شاشة مُراجَعة باللغتين',
  'ad.suivi.rlTourneeNone':
    'دورة الشاشات من {de} إلى {a} مُراجَعة باللغتين: بقية الخطة في الانتظار.',
  'ad.suivi.rlMarkAr': 'تأشير العشر بالعربية ({n})',
  'ad.suivi.rlMarkEn': 'تأشير العشر بالإنجليزية ({n})',
  'ad.suivi.rlMarkHint':
    'يؤشّر بنقرة واحدة الشاشات العشر لهذه الدورة بهذه اللغة — {n} ما زالت بحاجة إلى تأشير. لا يُطمس الدفتر: ما أُشّر يبقى، وبقية شاشات الخطة لا تتحرك.',
  'ad.suivi.rlMarkDone': 'الدورة مؤشَّرة، {done} / {n}',
  'ad.suivi.rlResume': 'المتابعة من الشاشة {n}',
  'ad.suivi.rlResumeHint':
    'يفتح أول شاشة في الدورة لم تُؤشَّر بعد — الشاشة {n} — في لسان آخر: تتواصل المراجعة دون البحث عن رقمها في القائمة.',
  'ad.suivi.rlOpen': 'افتح هذه الشاشة',
  'ad.suivi.rlOpenHint':
    'تفتح هذه الشاشة في لسان آخر: تبقى القائمة في مكانها، وتُؤشَّر الخانة عند العودة.',
  'ad.suivi.rlNext': 'الشاشة التالية — {n}',
  'ad.suivi.rlNextHint':
    'تفتح الشاشة التالية في القائمة — الشاشة {n} — في لسان آخر: تتقدم المراجعة درجة دون العودة للبحث عن الرقم. ويأخذ الزر لونه حين تُؤشَّر هذه الشاشة.',
  'ad.suivi.rlNextRest': 'يتبقى {n}',
  'ad.suivi.rlNextRestHint':
    'يتبقى {n} شاشة للتأشير في هذه القائمة بعد هذه: لقياس حجم المرور قبل الشروع فيه.',
  'ad.suivi.rlFriseTitle': 'شريط الشاشات الثلاثين',
  'ad.suivi.rlFriseNote':
    'ما أُغلق من الجهتين، وما أُشّر من جهة واحدة، وما بقي مفتوحًا — بنظرة واحدة، دورة بدورة. نقرة على علامة تغلق الشاشة من الجهتين، ونقرة ثانية تعيد فتحها؛ وزر الشريحة يغلق شاشاتها العشر أو يعيد فتحها دفعة واحدة.',
  'ad.suivi.rlFriseDeux': 'مغلق من الجهتين',
  'ad.suivi.rlFriseUn': 'مؤشَّر من جهة واحدة',
  'ad.suivi.rlFriseRien': 'ما زال مفتوحًا',
  'ad.suivi.rlFriseBandTournee': 'الدورة {n} · الشاشات {de}–{a}',
  'ad.suivi.rlFriseBandReste': 'خارج الدورة · الشاشات {de}–{a}',
  'ad.suivi.rlFriseGo': 'نقرة واحدة تغلق الشاشة من الجهتين',
  'ad.suivi.rlFriseFermer': 'نقرة واحدة تؤشّر العربية والإنجليزية معًا',
  'ad.suivi.rlFriseRouvrir': 'نقرة واحدة تعيد فتح الخانتين',
  'ad.suivi.rlFriseBulkClose': 'إغلاق المتبقي ({n})',
  'ad.suivi.rlFriseBulkReopen': 'إعادة فتح الكل',
  'ad.suivi.rlFriseBulkHint':
    'يؤشّر بنقرة واحدة، باللغتين، الشاشات التي ما زالت مفتوحة في هذه الشريحة — العربية والإنجليزية معًا، دون النزول إلى أسطر القائمة.',
  'ad.suivi.rlFriseBulkReopenHint':
    'يعيد فتح شاشات هذه الشريحة بنقرة واحدة، من الجهتين؛ ونقرة ثانية تغلقها.',
  'ad.suivi.rlFriseFlashClose': 'أُغلقت دفعة واحدة: {n} شاشة من الجهتين',
  'ad.suivi.rlFriseFlashReopen': 'أُعيد فتحها دفعة واحدة: {n} شاشة',
  'ad.suivi.rlFriseLast': 'آخر إيماءة · {date} · {tranche} · {sens} · {n} شاشة',
  'ad.suivi.rlFriseLastHors': 'خارج الدورة ({de}–{a})',
  'ad.suivi.rlFriseLastClose': 'أُغلقت دفعة واحدة',
  'ad.suivi.rlFriseLastReopen': 'أُعيد فتحها دفعة واحدة',
  'ad.suivi.rlFriseLastNone': 'لا إيماءة شريحة محفوظة على هذا الجهاز.',
  'ad.suivi.rlFriseLastSee': 'استعادة',
  'ad.suivi.rlFriseLastSeeHint':
    'يفتح القائمة محصورة في الدورة {de}–{a}، التي أغلقتها هذه الإيماءة أو أعادت فتحها دفعة واحدة.',
  'ad.suivi.rlFriseLastCard': 'البطاقة المؤرَّخة',
  'ad.suivi.rlFriseLastCardHint':
    'يفتح تحت الشريحة {de}—{a} بطاقة إيماءاتها المؤرَّخة، مرتّبة سلفًا على الاتجاه نفسه — اتجاه هذه الإيماءة الأخيرة ({sens}): تُقرأ نقرتها بتاريخها والشاشات الممسوسة والعدد الذي وصلت إليه.',
  'ad.suivi.rlFriseOuvertes':
    '{n} شريحة ما زالت مفتوحة · آخر إيماءة أغلقت: {ferme} · أعادت الفتح: {rouvert}',
  'ad.suivi.rlFriseOuvertesNone': 'كل الشرائح مغلقة من الجهتين',
  'ad.suivi.rlFriseOuvertesHint':
    'شرائح الشريط التي تحفظ شاشة واحدة على الأقل غير مغلقة من الجهتين، محسوبة حسب اتجاه آخر إيماءة فيها: ما تركته إيماءة إغلاق في الطريق، وما أعادته إيماءة فتح نصف منجَز.',
  'ad.suivi.rlTourneeRestEn': 'ما زال بالإنجليزية: {list}',
  'ad.suivi.rlTourneeRestEnOne': 'ما زالت بالإنجليزية: {list}',
  'ad.suivi.rlTourneeRestEnNone': 'الإنجليزية مكتملة في هذه الدورة',
  'ad.suivi.rlOffsite': 'خارج الموقع: في دوال الخادم',
  'ad.par.title': 'تساوي المفاتيح، ملفًا ملفًا',
  'ad.par.note':
    'الفرنسية هي المرجع: كل مفتاح تسمّيه يجب أن يوجد بالعربية والإنجليزية. المفتاح الغائب لا يُرى على الشاشة — يعود الموقع إلى الإنجليزية دون أن يقول.',
  'ad.par.showAll': 'كل الملفات',
  'ad.par.showAllHint': 'إظهار الملفات التي تتوافق فيها اللغات الثلاث أصلًا.',
  'ad.par.onlyGaps': 'ملفات فيها فارق',
  'ad.par.onlyGapsHint': 'لا تُبقى إلا الملفات التي ينقصها مفتاح من جهة.',
  'ad.par.missAr': 'مفتاح ناقص بالعربية',
  'ad.par.missEn': 'مفتاح ناقص بالإنجليزية',
  'ad.par.filesOk': 'ملف متوافق من {n}',
  'ad.par.none':
    'الملفات ({n}) تحمل القائمة نفسها من المفاتيح في اللغات الثلاث. لا شيء يُكمل.',
  'ad.par.fileOk': 'اللغات الثلاث متوافقة: لا مفتاح ناقص.',
  'ad.par.missArLabel': 'ناقصة بالعربية',
  'ad.par.missEnLabel': 'ناقصة بالإنجليزية',
  'ad.par.seulArLabel': 'بالعربية وحدها',
  'ad.par.seulEnLabel': 'بالإنجليزية وحدها',
  'ad.par.noneAr': 'لا شيء',
  'ad.par.noneEn': 'لا شيء',
  'ad.par.keep':
    'البيان مقروء على القواميس التي يحملها الموقع، عند كل فتح للوحة: لا شيء يُحفظ ولا يُرسل.',
  'ad.par.csv': 'تصدير إلى CSV',
  'ad.par.csvHint':
    'سطر لكل ملف نصوص، مع أسماء المفاتيح الناقصة كما هي في أعمدة خاصة — لتسليمه إلى مُراجع. ويحمل اسمه عدد المفاتيح المطلوب استكمالها، كدفاتر لوحة التحكم.',
  'ad.par.csvOk': 'تم تنزيل الملف',
  'ad.par.copy': 'انسخ البيان',
  'ad.par.copyHint':
    'الملفات التي فيها فارق نصًّا، مع أسماء المفاتيح كما هي — جاهزة للصق في رسالة.',
  'ad.par.copyOk': 'تم نسخ البيان',
  'ad.par.copyFail': 'تعذّر النسخ',
  'ad.par.import': 'البيان المملوء',
  'ad.par.importHint':
    'يفتح ملف CSV الذي ملأه المُراجع: تسمّي اللوحة كل مفتاح مُعاد، والملف واللغة في رأس كل مجموعة، جاهزًا للنسخ واحدًا واحدًا.',
  'ad.par.importErr':
    'هذا الملف ليس بيان تساوي المفاتيح: ورقة «À compléter, clé par clé» غير موجودة فيه.',
  'ad.par.importHead': '{n} مفتاحًا مُعادًا · {vide} ما زال فارغًا',
  'ad.par.importBlank': 'بحاجة إلى استكمال',
  'ad.par.importPosees': '{n} مفتاحًا وُضِع منذ ذلك الحين',
  'ad.par.importPoseesHint':
    'المفاتيح التي يحملها الموقع الآن: لا تُنسخ بعد اليوم، فاللوحة تقرأها على قواميسها.',
  'ad.par.importPoseeTag': 'موضوع منذ ذلك الحين',
  'ad.par.importSeePosees': 'إظهار المفاتيح الموضوعة',
  'ad.par.importSeePoseesHint':
    'يستدعي المفاتيح الموضوعة منذ ذلك الحين، وقد خرجت من القائمة لإبقاء العمل المتبقي وحده.',
  'ad.par.importHidePosees': 'إخفاء المفاتيح الموضوعة',
  'ad.par.importHidePoseesHint':
    'يُغلق المفاتيح الموضوعة منذ ذلك الحين: يعود البيان إلى ما تبقّى استكماله.',
  'ad.par.importAllPosees':
    'مفاتيح هذا البيان ({n}) موضوعة منذ ذلك الحين: لا شيء تبقّى من هذا الجانب.',
  'ad.par.importCopy': 'انسخ البيان المملوء',
  'ad.par.importCopyHint':
    'الترجمات المُعادة نصًّا، والملف واللغة في رأس كل مجموعة، مفتاحًا مفتاحًا — جاهزة للصق لاستكمال الملفات.',
  'ad.par.importCopyOk': 'تم نسخ البيان المملوء',
  'ad.par.importCopyFail': 'تعذّر النسخ',
  'ad.par.importClear': 'إزالة هذا البيان',
  'ad.par.importClearHint':
    'يغلق البيان المستورد: تبقى قائمة الملفات كما هي، ولا شيء يُمحى.',
  'ad.par.gomme': 'محو هذا السطر',
  'ad.par.gommeHint':
    'يمحو هذه الترجمة المنسوخة وحدها: يبقى ما تبقّى من البيان المستورد، ولا يُزال الملف كله.',
  'ad.par.gommeesCount': '{n} سطرًا ممحوًا خلال الزيارة',
  'ad.par.gommeesHint':
    'الترجمات الممحات منذ فتح هذا البيان. ليست ضائعة: الزر المجاور يعيدها.',
  'ad.par.releveCsv': 'البيان على الشاشة ({n})',
  'ad.par.releveCsvPosees': 'البيان على الشاشة ({n}) · {p} موضوعة',
  'ad.par.releveCsvBack': 'البيان على الشاشة ({n}) · {p} موضوعة · {r} مستعادة',
  'ad.par.releveCsvOk': 'تم تنزيل البيان',
  'ad.par.triPose': 'ترتيب حسب يوم الوضع',
  'ad.par.triPoseOn': 'الأحدث في المقدمة',
  'ad.par.triPoseHint':
    'يرتّب الترجمات الموضوعة من الأحدث إلى الأقدم، مقروءة على الأيام التي يحفظها هذا الجهاز. أما التي لا يُعرف يومها فتغلق القائمة.',
  'ad.par.triPoseBackHint':
    'يعود إلى ترتيب الملف كما أعاده المُراجع — الملف واللغة مجمّعتان.',
  'ad.par.triPoseDateHint':
    'اليوم الذي رأت فيه اللوحة هذا المفتاح موضوعًا لأول مرة، محفوظًا على هذا الجهاز.',
  'ad.par.triAncien': 'الأقدم للمراجعة أولًا',
  'ad.par.triAncienOn': 'الأقدم في المقدمة',
  'ad.par.triAncienAge': 'الأقدم: {n} يومًا',
  'ad.par.triAncienAgeHint':
    'عدد الأيام المنقضية منذ أقدم وضع مقروء، على أيام الوضع التي يحفظها هذا الجهاز.',
  'ad.par.triAncienHint':
    'يرفع الترجمات الموضوعة منذ أطول مدة، مقروءة على الأيام التي يحفظها هذا الجهاز: والتي تنتظر مراجعة منذ أطول وقت تتقدم. أما التي لا يُعرف يومها فتغلق القائمة.',
  'ad.par.triAncienBackHint':
    'يعود إلى ترتيب الملف كما أعاده المُراجع — الملف واللغة مجمّعتان.',
  'ad.par.triJeune': 'ترتيب حسب العمر: الأصغر أولًا',
  'ad.par.triJeuneOn': 'الأصغر في المقدمة',
  'ad.par.triJeuneAge': 'الأصغر: {n} يومًا',
  'ad.par.triJeuneAgeHint':
    'عدد الأيام المنقضية منذ أصغر وضع مقروء، على أيام الوضع التي يحفظها هذا الجهاز.',
  'ad.par.triJeuneHint':
    'يرتّب الترجمات حسب عمر الوضع، الأصغر أولًا: ما وُضع للتو يتقدم على الأوضاع القديمة. أما التي لا يُعرف يومها فتغلق القائمة.',
  'ad.par.triJeuneBackHint':
    'يعود إلى ترتيب الملف كما أعاده المُراجع — الملف واللغة مجمّعتان.',
  'ad.par.triJeuneRow': 'وُضعت منذ {n} يومًا',
  'ad.par.triJeuneRowHint': 'عمر هذا الوضع بالأيام: هو ما يُرتّب عليه السطر في القائمة.',
  'ad.par.triEcart': 'ترتيب حسب المفاتيح في فارق',
  'ad.par.triEcartOn': 'الأكثر نقصًا في المقدمة',
  'ad.par.triEcartHead': 'الأكثر نقصًا: {f} — {n}',
  'ad.par.triEcartHeadHint':
    'الملف الذي يفتح القائمة، وعدد مفاتيحه في فارق: ناقصة من جهة، أو بلا مقابل فرنسي.',
  'ad.par.triEcartHint':
    'يرتّب الملفات حسب عدد المفاتيح في فارق، الأكثر نقصًا أولًا — محسوبة على المفاتيح المقروءة فعلًا، مع الحصر والبحث. ويقول كل سطر حينها فارقه.',
  'ad.par.triEcartBackHint': 'يعود إلى ترتيب البيان، بلا قياس على الأسطر.',
  'ad.par.rowEcart': 'الفارق {n}',
  'ad.par.triEcartHeadFiles': '{k} ملفًا في فارق · الأكثر نقصًا: {f} — {n}',
  'ad.par.retourGroup': '{n} مفتاحًا متبقًّا من {total}',
  'ad.par.retourGroupHint':
    'مفاتيح هذا الملف التي ما زالت بحاجة إلى استكمال، من الأسطر التي يحملها البيان المستورد له — ولا تُحسب المفاتيح الموضوعة أو المترجمة سابقًا.',
  'ad.par.retourSearchPh': 'ابحث عن ملف في البيان',
  'ad.par.retourSearchHint':
    'لا تُبقي إلا أسطر ملف مسمّى — «legal» أو «offres»… — دون المرور بالملفات الحادية والعشرين في البيان.',
  'ad.par.retourSearchClear': 'محو بحث البيان',
  'ad.par.retourSearchCount': '{n} ملفًا · {l} سطرًا',
  'ad.par.retourSearchNone':
    'لا سطر في البيان يحمل «{q}»: البحث يخصّ اسم الملف، لا المفتاح ولا الترجمة.',
  'ad.par.releveCsvHint':
    'ينزّل البيان المستورد كما يُقرأ على الشاشة، بعد المحو: سطر لكل مفتاح ما زال موجودًا، مع حالته، وفي عمود «Posée le» اليوم الذي رأت فيه اللوحة كل ترجمة موضوعة، وفي العمود التالي عمر الوضع بالأيام، لترتيب المراجعة في جدول. ويحمل اسمه عدد أسطر البيان، وعدد الترجمات الموضوعة، وعدد الأسطر المستعادة خلال الزيارة، لتمييز بيانين في اليوم نفسه داخل مجلد التنزيلات.',
  'ad.par.rappelees':
    '{n} سطرًا استُعيد خلال الزيارة — ويدخل عدده في اسم البيان المنزّل.',
  'ad.par.gommeesBack': 'استعادة الممحات',
  'ad.par.gommeesBackHint':
    'يعيد كل الأسطر الممحات خلال هذه الزيارة، مع ترجماتها، كما كانت قبل أول محو.',
  'parPose.badge': '{n} ترجمة لا تزال بحاجة إلى وضع',
  'parPose.hint':
    'مؤشر الوضع: {n} ترجمة لا تزال بحاجة إلى وضع بين {cles} مفتاحًا في {fichier}. يختفي حين يُوضع كل شيء.',
  'parPose.open': 'نقرة واحدة تفتح بيان الترجمة، محصورًا في هذا الملف.',
  'ad.par.resteCsv': 'CSV للمتبقية ({n})',
  'ad.par.resteCsvHint':
    'ملف مقتصر على المفاتيح التي ما زالت فارغة في البيان المستورد — لا موضوعة ولا مترجمة بعد —، يُسلَّم لمرور ثانٍ. ويحمل اسمه عدد المفاتيح المتبقية، كدفاتر لوحة التحكم.',
  'ad.par.resteCsvOk': 'تم تصدير المتبقية',
  'ad.par.importTraduites': 'مترجمة للنسخ',
  'ad.par.importTraduitesOn': 'محصور في الترجمات',
  'ad.par.importTraduitesHint':
    'لا تُبقي إلا المفاتيح التي ترجمها المُراجع ولم يحملها الموقع بعد: النسخ حينها لا يأخذ إلا هي، دفعة واحدة.',
  'ad.par.importTraduitesExitHint':
    'نقرة تعيد البيان كاملًا، مع المفاتيح الفارغة والموضوعة.',
  'ad.par.importTraduitesNone':
    'لا ترجمة مُعادة تنتظر النسخ: لم يكتب المُراجع ما لا يحمله الموقع أصلًا.',
  'ad.par.importCopyNarrow': 'انسخ هذه المفاتيح ({n})',
  'ad.par.importCopyNarrowHint':
    'ينسخ المفاتيح المترجمة التي تعرضها القائمة وحدها، والملف واللغة في رأس كل مجموعة، جاهزة للاستكمال واحدًا واحدًا.',
  'ad.par.traduitesCsv': 'CSV للمترجمة ({n})',
  'ad.par.traduitesCsvHint':
    'ملف مقتصر على المفاتيح التي ترجمها المُراجع ولم يحملها الموقع بعد، مع النص الفرنسي في المقابل — يُسلَّم كما هو، دون المرور بنسخ النص.',
  'ad.par.traduitesCsvOk': 'تم تصدير المترجمة',
  'ad.par.chipTag': 'مفاتيح',
  'ad.par.chipNoneTag': 'مفاتيح',
  'ad.par.chipCount': '{n} مفتاحًا في فارق',
  'ad.par.chipSplit': 'AR {ar} · EN {en} · منها {orph} بلا مقابل فرنسي',
  'ad.par.chipNone': 'اللغات الثلاث تحمل القائمة نفسها من المفاتيح',
  'ad.par.chipHint':
    'مفاتيح تسمّيها لغة دون الأخرى، مقروءة على قواميس الموقع؛ نقرة واحدة تفتح البيان.',
  'ad.par.focusOn': 'بيان محصور في {fichier}',
  'ad.par.focusFam': 'المفاتيح {fam}',
  'ad.par.focusHint':
    'هذا البيان لا يعرض إلا هذا الملف، والمفاتيح التي تحمل العائلة المطلوبة؛ وبقية العمل تُقرأ بإزالة الحصر.',
  'ad.par.focusClear': 'عرض البيان كله',
  'ad.par.focusReste': '{n} مفتاحًا كان لا يزال ناقصًا',
  'ad.par.focusResteHint':
    'ما كان لا يزال بحاجة إلى وضع في هذا الملف حين نُسخ الرابط؛ والبيان يعيد الحساب على قواميس الموقع.',
  'ad.par.searchPh': 'ابحث عن ملف',
  'ad.par.searchHint':
    'يرشّح البيان حسب اسم الملف — «legal» أو «offres»… — لاستعادة ملف دون المرور بمؤشر شاشة.',
  'ad.par.searchClear': 'محو البحث',
  'ad.par.searchCount': '{n} ملفًا',
  'ad.par.searchNone':
    'لا ملف يحمل «{q}»: الملفات الحادية والعشرون كلها باسم dict.…، ويبقى الحصر فاعلًا ما لم يُرفع.',
  'ad.par.focusLink': 'انسخ الرابط',
  'ad.par.focusLinkHint':
    'ينسخ عنوان البيان المحصور في هذا الملف، مع ما كان لا يزال ناقصًا فيه: يفتحه المُراجع بنقرة واحدة، دون المرور بالملفات الحادية والعشرين.',
  'ad.par.focusLinkOk': 'تم نسخ الرابط',
  'ad.par.focusLinkOkReste': 'تم نسخ الرابط · {n} مفتاحًا',
  'ad.par.focusLinkFail': 'تعذّر النسخ',
  'ad.par.rowLink': 'انسخ رابط هذا الملف',
  'ad.par.rowLinkHint':
    'ينسخ عنوان البيان المحصور في هذا الملف وحده، مع عدد المفاتيح التي لا تزال فيه — ليرسله إلى المُراجع المكلف به.',
  'ad.relectureChip': '{n} صفحة للمراجعة',
  'ad.relectureChipDone': 'المراجعة مكتملة',
  'ad.relectureChipHint':
    'الصفحات التي ما زالت بحاجة إلى مراجعة باللغتين، مقروءة على دفتر هذا الجهاز. نقرة واحدة تفتح قائمة المراجعة.',
  'ad.relectureArCount': '{n} صفحة للمراجعة بالعربية',
  'ad.relectureEnCount': '{n} صفحة للمراجعة بالإنجليزية',
  'ad.relectureArDone': 'العربية مكتملة',
  'ad.relectureEnDone': 'الإنجليزية مكتملة',
  'ad.relectureArHint':
    'الصفحات التي لم تُؤشَّر بعد بالعربية على هذا الجهاز؛ نقرة واحدة تفتح القائمة، مقتصرة على هذه الصفحات.',
  'ad.relectureEnHint':
    'الصفحات التي لم تُؤشَّر بعد بالإنجليزية على هذا الجهاز؛ نقرة واحدة تفتح القائمة، مقتصرة على هذه الصفحات.',
  'ad.relectureEcartTag': 'فارق',
  'ad.relectureEcartNoneTag': 'توافق',
  'ad.relectureEcartCount': '{n} صفحة مؤشَّرة من جهة واحدة',
  'ad.relectureEcartNone': 'اللغتان متفقتان في الصفحات الثلاثين',
  'ad.relectureEcartHint':
    'الصفحات التي أُشّرت فيها لغة دون الأخرى؛ نقرة واحدة تفتح القائمة مقتصرة على هذه الصفحات.',
  'ad.relectureTourneeTag': 'الدورة',
  'ad.relectureTourneeCount':
    'الدورة الأولى: {done} / {n} شاشة مُراجَعة باللغتين · {reste} ما زالت بحاجة إلى تأشير بالعربية',
  'ad.relectureTourneeDone': 'الدورة الأولى مُراجَعة باللغتين',
  'ad.relectureTourneeHint':
    'الشاشات العشر لهذه الدورة، بترتيب المرور، العربية أولًا. نقرة واحدة تفتح القائمة مقتصرة عليها.',
  'ad.relectureTourneeGo':
    'سطر الدورة يؤشّرها بنقرة واحدة، العربية أولًا ثم الشاشات نفسها بالإنجليزية: ويهدأ المؤشر حين تكتمل العشر من الجهتين.',
  'ad.relectureTourneeRestAr': 'ما زال بالعربية: {list}',
  'ad.relectureTourneeRestArOne': 'ما زالت بالعربية: {list}',
  'ad.relectureTourneeRestNone': 'العربية مكتملة في هذه الدورة',
  'ad.relectureTourneeRestHint':
    'أرقام هذه الدورة التي ما زالت بحاجة إلى تأشير بالعربية، بترتيب الخطة: لاختيار من أين تُستأنف.',
  'ad.relectureMiniResume': 'الاستئناف من الشاشة {n}',
  'ad.relectureMiniDone': 'الدورة مكتملة من الجهتين',
  'ad.relectureMiniSay': '{n} · {page} — {etat}',
  'ad.relectureMiniSayHint': 'مرّر فوق علامة: تقول شاشتها وحالتها؛ ونقرة واحدة تفتحها في لسان آخر.',
  'ad.relectureMiniOpen': 'نقرة واحدة تفتحها في لسان آخر',
  'ad.relectureMiniClose': 'إغلاق المتبقي ({n})',
  'ad.relectureMiniCloseHint':
    'يؤشّر بنقرة واحدة، باللغتين، شاشات هذه الدورة التي ما زالت مفتوحة — العربية والإنجليزية معًا — دون مغادرة الترويسة أو فتح اللوح. تبقى الشاشات المؤشَّرة، ولا تتحرك الدورات الأخرى.',
  'ad.relectureMiniClosed': 'أُغلقت دفعة واحدة: {n} شاشة من الجهتين',
  'ad.relectureTourneeFlash': 'أُغلق {n} · {apres}/{total} إجمالًا',
  'ad.suivi.rlFriseBandeLast': 'آخر إيماءة · {date} · {sens}',
  'ad.suivi.rlFriseBandeLastHint':
    'آخر إيماءة في هذه الشريحة وحدها: {date}، {sens} — الشاشات {ecrans} الممسوسة، ومنها {n} تغيّرت فعلًا — ثم {apres}. ليست آخر إيماءة في الدفتر كله.',
  'ad.suivi.rlFriseBandeLastApres':
    'العدد الذي وصلت إليه المراجعة بعد هذه الإيماءة: {apres} شاشة مغلقة من الجهتين من {total}',
  'ad.suivi.rlFriseBandeLastApresNone':
    'العدد الذي وصلت إليه المراجعة غير مسجَّل لهذه الإيماءة: إنها تسبق اللحظة التي صار الشريط يسجّله فيها',
  'ad.suivi.rlFriseGestesTitle': 'إيماءات هذه الشريحة، مؤرَّخة',
  'ad.suivi.rlFriseGestesCloseHint': 'يغلق البطاقة: يبقى تاريخ الشريحة وحده.',
  'ad.suivi.rlFriseGestesTouched': '{n} شاشة ممسوسة',
  'ad.suivi.rlFriseGestesTouchedDeja':
    '{n} شاشة ممسوسة · {deja} / {total} كانت مغلقة من الجهتين قبل هذه الإيماءة',
  'ad.suivi.rlFriseGestesTouchedDejaNone':
    '{n} شاشة ممسوسة · ما كان مغلقًا قبلها غير مسجَّل',
  'ad.suivi.rlFriseGestesApres': '{apres} / {total} مغلقة بعدها',
  'ad.suivi.rlFriseGestesAutres':
    'النقرة نفسها حملت أيضًا: {tranches}',
  'ad.suivi.rlFriseGestesAutresHint':
    'الشرائح الأخرى ({n}) المسجَّلة في اللحظة نفسها، مسمّاة كما في الشريط: لم تكن هذه الإيماءة نقرة شريحة وحيدة، بل حرّكت عدة شرائح دفعة واحدة.',
  'ad.suivi.rlFriseGestesClicTotal':
    'هذه النقرة مسّت {n} شاشة في المجموع، شريحة شريحة: {detail}',
  'ad.suivi.rlFriseGestesClicTotalHint':
    'مجموع الشاشات التي مسّتها كل إيماءات النقرة نفسها — {n} في المجموع، على {tranches} شريحة — وما حملته كل واحدة منها. تُقرأ النقرة دفعة واحدة دون جمع شرائحها يدويًا.',
  'ad.suivi.rlFriseGestesSortAll': 'الكل',
  'ad.suivi.rlFriseGestesSortFerme': 'مغلقة',
  'ad.suivi.rlFriseGestesSortRouvert': 'معاد فتحها',
  'ad.suivi.rlFriseGestesSortHint':
    'يرتّب البطاقة حسب الاتجاه: الإغلاقات من جهة، وإعادات الفتح من جهة، ولكل منهما عدده. ونقرة ثانية على المؤشر الممسوك تعيد الاتجاهين.',
  'ad.suivi.rlFriseGestesSortNone':
    'لا إيماءة من هذا الاتجاه في هذه الشريحة: مؤشر «الكل» يعيد القائمة كاملة.',
  'ad.suivi.rlFriseSliceCsv': 'CSV لهذه الشريحة',
  'ad.suivi.rlFriseSliceCsvOk': 'صُدّرت الشريحة',
  'ad.suivi.rlFriseSliceCsvHint':
    'ينزّل ورقة مقتصرة على الشريحة المعروضة — الشاشات {de}—{a}: شاشاتها وخانتاها، ثم إيماءاتها المؤرَّخة مع العدد الذي وصلت إليه كل واحدة، والإفراغات التي وقعت بين أقدم إيماءة فيها وأحدثها. ولا تخرج الشرائح الأخرى معها.',
  'ad.suivi.rlFriseReset': 'أُفرغ الدفتر في {date}',
  'ad.suivi.rlFriseGestesReel':
    'هذا الاتجاه مسّ فعلًا {ecrans} شاشة في المجموع، عبر {n} إيماءة من هذه الشريحة.',
  'ad.suivi.rlFriseLastSortHint':
    'يرتّب سطر آخر إيماءة حسب الاتجاه: آخر إغلاق وحده، أو آخر إعادة فتح وحدها، بدل آخر نقرة في الدفتر كله. ويبقى المؤشر الممسوك ممسوكًا حتى يُختار غيره.',
  'ad.suivi.rlFriseLastNoneSens':
    'لا إيماءة من هذا الاتجاه في الدفتر: مؤشر «الكل» يعيد آخر إيماءة على هذا الجهاز.',
  'ad.suivi.rlFriseSliceCsvGestes':
    'ستحمل {n} إيماءة من هذه الشريحة، أقدمها من {jour}.',
  'ad.suivi.rlFriseSliceCsvGestesNone':
    'لا إيماءة جماعية محفوظة على هذه الشريحة: الورقة لا تحمل إلا شاشاتها وخاناتها.',
  'ad.suivi.rlFriseDelaiInstant': 'الآن',
  'ad.suivi.rlFriseDelaiMin': 'منذ {n} دقيقة',
  'ad.suivi.rlFriseDelaiH': 'منذ {n} ساعة',
  'ad.suivi.rlFriseDelaiJ': 'منذ {n} يومًا',
  'ad.suivi.rlFriseBandeLastDelaiHint': 'المدة المنقضية منذ هذه الإيماءة: {delai}.',
  'ad.suivi.rlFriseLastCardCounts':
    'هذه الشريحة تحمل {n} إيماءة مؤرَّخة، منها {m} من هذا الاتجاه.',
  'ad.suivi.rlFriseOuvertesCsv': 'CSV للشرائح المفتوحة ({n})',
  'ad.suivi.rlFriseOuvertesCsvOk': 'صُدّرت الشرائح',
  'ad.suivi.rlFriseOuvertesCsvHint':
    'ينزّل ملفًا واحدًا للشرائح التي ما زالت تحفظ شاشة واحدة على الأقل غير مغلقة من الجهتين — {n} شريحة: شاشاتها المفتوحة ({ecrans}) مع خاناتها، وإيماءاتها المؤرَّخة — {gestes} — والعدد الذي وصلت إليه كل واحدة. وسطرها الأول يقول الترتيب المعتمد للشرائح المفتوحة — ترتيب الخطة أو النهاية أولًا —، مع عدد الشرائح التي حرّكها هذا الترتيب، والشرائح تُرتَّب فيه على المنوال نفسه. ويسمّي أيضًا الشريحتين اللتين تحدان هذا الترتيب — «l’ordre s’ouvre sur …» و«l’ordre se referme sur …» —، ليقول الملف من أين يبدأ ترتيبه وأين ينتهي. وعمود «آخر إعادة فتح» يؤرّخ مرور الإيماءة الجماعية، ويقول كم شريحة مسّتها تلك النقرة. وعمود مجموع فرعي، موضوع بجانب الشاشات، يمتلئ في السطر الذي يغلق كل شريحة ويقول كم شاشة ما زالت تحفظها مفتوحة. أما الشريحة المكتملة من الجهتين فلا تدخل فيه. وعمود «آخر إيماءة في الشريحة»، موضوع بجانب المجموع الفرعي، يؤرّخ كل شريحة بنفسها في السطر الذي يغلقها، فيؤرّخ الملف كل شريحة أيضًا. وعمود «Position»، موضوع بعد اسم الشريحة مباشرة، يعطي رتبتها في الترتيب المعتمد — «2 / 3» —، لإعادة قراءة الترتيب سطرًا سطرًا. وعمود «Écrans fermés»، موضوع بجانب المجموع الفرعي، يقول ما أغلقته الشريحة من الجهتين. وعمود «Écrans gardés»، موضوع بعد الرتبة مباشرة، يقول في كل سطر ما تحفظه الشريحة مفتوحًا من مداها، وسطر المجموع يقول الشيء نفسه للمجموع كله. وعمود «Écart au plus chargé»، موضوع بعد ذلك مباشرة، يقول لكل شريحة كم شاشة تفصلها عن الشريحة التي تحفظ أكثر من غيرها — ٠ للأكثر حفظًا نفسها. وسطر المجموع يقول كم شريحة ما زالت تحفظ رتبة، ومدى الترتيب، من الرتبة ١ إلى الأخيرة، ليُغلق الملف على ترتيبه. وسطر مجموعها يؤرّخ أيضًا الشريحة التي تغلق الترتيب، قائلًا منذ متى لم تتحرك، كالجدول المؤرَّخ. وسطر خلاصة، موضوع تحت الجدول، يقول ما تحفظه كل شريحة مفتوحة بعد، والمجموع أمامه.',
  'ad.suivi.rlFriseOuvertesCsvGarde':
    'عمود «Écart au plus chargé» يُقرأ انطلاقًا من الشريحة التي تحفظ أكثر من غيرها: {tranche} — {n} شاشة ما زالت مفتوحة من الجهتين.',
  'ad.suivi.rlFriseOuvertesEcrans': 'ما زال {n} شاشة بحاجة إلى إغلاق',
  'ad.suivi.rlFriseOuvertesEcransHint':
    'الشاشات ({n}) في هذه الشرائح ({tranches}) التي لم تُغلق بعد من الجهتين: ما تحمله البوابة المجاورة، وما ستعيده إعادة الفتح إلى حال مفتوحة.',
  'ad.suivi.rlFriseRouvrirOuvertes': 'إعادة فتح هذه الشرائح',
  'ad.suivi.rlFriseRouvrirOuvertesConfirm': 'تأكيد إعادة الفتح',
  'ad.suivi.rlFriseRouvrirOuvertesOk': 'أُعيد فتحها · {n} شاشة',
  'ad.suivi.rlFriseRouvrirOuvertesHint':
    'نقرة تطلب ونقرة ثانية تؤكّد: تعيد فتح شاشات الشرائح التي ما زالت تحفظ شيئًا غير منجَز — {ecrans} شاشة في {n} شريحة — دفعة واحدة ومن الجهتين. أما الشرائح المغلقة من الجهتين فلا تتحرك: العمل المنجَز لا يُنقض من هنا. وتُسجَّل الإيماءة مؤرَّخة في كل شريحة من هذه الشرائح: تُقرأ بعدها في بطاقاتها وفي الأوراق المصَدَّرة.',
  'ad.suivi.rlFriseOuvertesRangsHint':
    'الأرقام التي ما زالت بحاجة إلى إغلاق، شريحة شريحة: {rangs}.',
  'ad.suivi.rlFriseOuvertesSensChipHint':
    'يفتح البطاقة المؤرَّخة للشريحة {de}—{a}، مرتّبة سلفًا على هذا الاتجاه ({sens}): تُقرأ إيماءاتها إغلاقاتٍ أو إعادات فتح، دون البحث عن الشريحة في الأسفل.',
  'ad.suivi.rlFriseOuvertesSensChipAucun':
    'لا إيماءة تُؤرَّخ في الشريحة {de}—{a}: الشريط يكتفي بجلبها إلى العين.',
  'ad.suivi.rlFriseOuvertesSensChipEcrans':
    'هذه الشريحة وحدها تحفظ {n} شاشة ما زالت مفتوحة من الجهتين.',
  'ad.suivi.rlFriseRouvrirCases': 'سترفع {n} خانة مؤشَّرة',
  'ad.suivi.rlFriseRouvrirCasesHint':
    'الخانات المؤشَّرة التي سترفعها هذه النقرة الثانية دفعة واحدة: {n} خانة على شاشات الشرائح المفتوحة ({tranches})، بالعربية والإنجليزية معًا. وما كان فيها مغلقًا من الجهتين يعود مفتوحًا.',
  'ad.suivi.rlFriseLastTranches': '{n} شريحة بنقرة واحدة',
  'ad.suivi.rlFriseLastTranchesHint':
    'هذه النقرة الأخيرة أعادت فتح {n} شريحة بإيماءة واحدة: يسجّلها الدفتر واحدة واحدة، كلها في اللحظة نفسها. والعدد يقول مدى النقرة، لا عدد الإيماءات.',
  'ad.suivi.rlFriseLastTranchesDelaiHint':
    'هذه النقرة الجماعية وقعت {delai}: المدة المنقضية منذ لحظتها، تُقرأ بجانب عدد الشرائح التي مسّتها.',
  'ad.suivi.rlFriseRangsCopier': 'نسخ الأرقام المتبقية',
  'ad.suivi.rlFriseRangsCopies': 'نُسخت الأرقام',
  'ad.suivi.rlFriseRangsCopierHint':
    'ينسخ قائمة الأرقام التي ما زالت بحاجة إلى إغلاق، شريحة شريحة — {ecrans} شاشة في {n} شريحة —، جاهزة للصق في رسالة. ويقول سطرها الأول الترتيب المعتمد للشرائح المفتوحة، مع عدد الشرائح التي حرّكها هذا الترتيب، ومدى الترتيب — من الرتبة ١ إلى الأخيرة — إلى جانب عدد الشرائح المفتوحة، والشرائح تُرتَّب فيه على المنوال نفسه: تُقرأ القائمة وحدها. وتسمّي أيضًا طرفي الترتيب — {ouvre} للفتح، {ferme} للإغلاق —، ويحمل سطرها الأول، إلى جانب هذين الطرفين وعدد الشرائح المفتوحة، عدد الشرائح التي حرّكها الترتيب: {deplacees}. وتحمل كل شريحة رتبتها في الترتيب المعتمد بجانب اسمها، كعمود «Position» في ملف CSV. ويقول سطر أيضًا تاريخ آخر إيماءة في الشريحة التي ينغلق عليها الترتيب، لتأريخ طرف الإغلاق دون فتح الدفتر. والشريحة المكتملة تكتب «— tranche faite» بدل أن تترك بياضًا. وتحت الشريحة التي ينغلق عليها الترتيب، يقول سطر كم شاشة ما زالت تحفظها مفتوحة من الجهتين. ويسمّي سطرها الأول أيضًا أقدم شريحة ما زالت مفتوحة، مع تاريخ آخر إيماءة فيها والمدة المنقضية، ويحمل في السطر نفسه عدد الشرائح التي حرّكها الترتيب. ويحمل السطر نفسه أيضًا عدد الشاشات التي ما زالت هذه الشريحة تحفظها مفتوحة من الجهتين، بجانب مدتها، وفارقها عن الأكثر حفظًا، مقروءًا على الشرائح نفسها في ملف CSV — بكم شاشة تفترق عن التي تحفظ أكثر من غيرها. وسطر أخير، «خلاصة الشاشات المحفوظة»، يقول ما تحفظه مجموعة الشرائح المفتوحة بعد، والمجموع أمامه، وكل شريحة مسمّاة بثقلها، كسطر ملف CSV. ويليه سطر للشريحة الأخفّ: اسمها وعدد الشاشات التي تحفظها وفارقها عن الأكثر حفظًا — ٠ حين تكون هي.',
  'ad.suivi.rlFriseTableauCopier': 'نسخ الجدول',
  'ad.suivi.rlFriseTableauCopies': 'نُسخ الجدول',
  'ad.suivi.rlFriseTableauCopierHint':
    'ينسخ الشاشات التي ما زالت بحاجة إلى إغلاق ({ecrans}) في الشرائح المفتوحة ({n}) في جدول — سطر لكل شاشة: رقمها واسمها والجهة الناقصة —، جاهزًا للصق في رسالة أو جدول حسابي. وحيث تكتب البوابة المجاورة أسطرًا قصيرة، تعطي هذه أعمدة.',
  'ad.suivi.rlFriseTableauDateCopier': 'نسخ الجدول المؤرَّخ',
  'ad.suivi.rlFriseTableauDateCopies': 'نُسخ الجدول المؤرَّخ',
  'ad.suivi.rlFriseTableauDateCopierHint':
    'ينسخ الشاشات التي ما زالت بحاجة إلى إغلاق ({ecrans}) في الشرائح المفتوحة ({n}) في جدول من ستة أعمدة — الرقم والشاشة والجهة الناقصة والشاشات المحفوظة في الشريحة وفارقها عن الأكثر حفظًا وتاريخ آخر إيماءة في شريحة الشاشة —، جاهزًا للصق في رسالة أو جدول حسابي. وتحت كل شريحة يقول سطر مجموع فرعي كم شاشة ما زالت تحفظها مفتوحة من مداها، وكم شاشة أغلقته بالفعل من الجهتين، وعن أي جهة تنتظر أكثر — بالقدر نفسه الذي في ورقة الشرائح المفتوحة. وعمود «Écrans gardés»، موضوع بين الجهة الناقصة والتاريخ، يعيد في كل سطر ما تحفظه الشريحة مفتوحًا من مداها — «3 / 10» —، كعمود ملف CSV، وسطر المجموع يقول الشيء نفسه للمجموع كله. وعمود «Écart au plus chargé»، موضوع بعده مباشرة، يقول سطرًا سطرًا كم شاشة تفصل الشريحة عن التي تحفظ أكثر من غيرها — ٠ للأكثر حفظًا نفسها —، ويعيده سطر المجموع الفرعي مع ثقله. ويحمل سطر المجموع الفرعي لكل شريحة رتبتها في الترتيب المعتمد بجانب اسمها — «position 2 / 3» —، كالقائمة وملف CSV؛ ويقول سطر المجموع مدى الترتيب، من الرتبة 1 إلى الأخيرة، إلى جانب عدد الشاشات، ويسمّي الشريحة التي ينغلق عليها هذا الترتيب. والشريحة التي بلا إيماءة تكتب «— aucun geste» بدل أن تترك العمود فارغًا. وسطر عدّ، موضوع فوق سطر المجموع، يقول كم شريحة ما زالت مفتوحة — مدى التأخر قبل رقم الشاشات. وسطرها الأول يسمّي أيضًا الشريحتين اللتين تحدان الترتيب المعتمد — الفتح والإغلاق —، إلى جانب اسم الترتيب وثقله، كملف CSV: تُقرأ النسخة المؤرَّخة وحدها. ويسمّي سطر مجموعها أيضًا الشريحة التي تحفظ أكثر الشاشات المفتوحة، كموشر الرتبة. ويُغلق الجدول أخيرًا بسطر خلاصة للشاشات المحفوظة، كملف CSV والقائمة المنسوخة: المجموع أمامه، ثم كل شريحة مفتوحة مسمّاة بثقلها. ويسمّي أخيرًا الشريحة الأخفّ وفارقها عن الأكثر حفظًا: لتُقرأ خلاصة الشاشات المحفوظة من طرفي الترتيب.',
  'ad.suivi.rlFriseTableauDateGarde':
    'عمود «Écrans gardés» يُقرأ انطلاقًا من الشريحة التي تحفظ أكثر من غيرها: {tranche} — {n} شاشة ما زالت مفتوحة من الجهتين.',
  'ad.suivi.rlFriseTableauDateLegere':
    'تُقرأ خلاصة الشاشات المحفوظة انطلاقًا من الشريحة الأخفّ: {tranche} — {n} شاشة ما زالت مفتوحة من الجهتين، على فارق {ecart} شاشة عن التي تحفظ أكثر من غيرها.',
  'ad.suivi.rlFriseTableauDateLegereSeule':
    'تُقرأ خلاصة الشاشات المحفوظة انطلاقًا من الشريحة الأخفّ: {tranche} — {n} شاشة ما زالت مفتوحة من الجهتين؛ وهي أيضًا التي تحفظ أكثر من غيرها، وفارقها ٠.',
  'ad.suivi.rlFriseTableauDateMoyenne':
    'يُحكم عمود «Écart au plus chargé» بنظرة واحدة: الفارق المتوسط للشرائح المفتوحة ({n}) هو {moyenne} شاشة، والفوارق تمتد من {min} إلى {max} — من الأكثر حفظًا إلى الأخفّ.',
  'ad.suivi.rlFriseOuvertesCsvDispersion':
    'سطر التشتّت، الموضوع تحت سطر الخلاصة، يقول مدى الفوارق — من الأصغر إلى الأكبر —، وفارقها المتوسط، والشريحة الأخفّ مع ثقلها وفارقها.',
  'ad.suivi.rlFriseRangsCopierDispersion':
    'وتحت الشريحة الأخفّ، يحمل سطر اسم الشريحة التي ينغلق عليها الترتيب مع ثقلها وفارقها: يُقرأ الطرفان والحدّ في كتلة واحدة.',
  'ad.suivi.rlFriseClicCopier': 'نسخ هذه النقرة',
  'ad.suivi.rlFriseClicCopies': 'نُسخت النقرة',
  'ad.suivi.rlFriseClicCopierHint':
    'ينسخ هذه النقرة وحدها — {date}، {sens}، {n} شاشة في المجموع على {tranches} شريحة — مع شرائحها واحدة واحدة، دون بقية إيماءات البطاقة ولا بقية الورقة.',
  'ad.suivi.rlFriseAncienne': 'أقدم شريحة ما زالت مفتوحة · {tranche}',
  'ad.suivi.rlFriseAncienneHint':
    'الشريحة التي ما زالت مفتوحة وأقدم إيماءة في الدفتر تخصّها: {tranche}، تحرّكت {delai}. إنها الأطول انتظارًا — تُغلق بنقرة واحدة في الشريط.',
  'ad.suivi.rlFriseAncienneCopier': 'نسخ الأقدم',
  'ad.suivi.rlFriseAncienneCopies': 'نُسخت الشريحة',
  'ad.suivi.rlFriseAncienneCopierHint':
    'ينسخ إلى الحافظة الشريحة التي ما زالت مفتوحة وتنتظر منذ أطول مدة — {tranche}، تحرّكت {delai} — مع تاريخ آخر إيماءة فيها وأرقامها التي ما زالت بحاجة إلى إغلاق، بما فيها الجهة الناقصة: جاهزة للإغلاق دون فتح الشريط أو بسط بطاقتها. وتقول أيضًا، بجانب مدتها، كم شاشة ما زالت تحفظها مفتوحة من الجهتين.',
  'ad.suivi.rlFriseAncienneCopierN': 'نسخ الأقدم ({n})',
  'ad.suivi.rlFriseAncienneCopierNDelai': 'نسخ الأقدم ({n}) · {delai}',
  'ad.suivi.rlFriseAncienneCopierCount':
    'تحتفظ الشريحة بـ {n} شاشة ما زالت بحاجة إلى إغلاق من الجهتين.',
  'ad.suivi.rlFriseExtremesCopier': 'نسخ الطرفين ({n})',
  'ad.suivi.rlFriseExtremesCopierTranches': 'نسخ الطرفين ({n} شريحة)',
  'ad.suivi.rlFriseExtremesCopierTranchesDelai':
    'نسخ الطرفين ({n} شريحة) · الأقدم تنتظر {ecart}',
  'ad.suivi.rlFriseExtremesCopies': 'نُسخت الشريحتان',
  'ad.suivi.rlFriseExtremesCount':
    'تحتفظ الشريحتان بـ {n} شاشة ما زالت بحاجة إلى إغلاق من الجهتين.',
  'ad.suivi.rlFriseExtremesTranchesCount':
    'الزر يحمل {n} شريحة؛ والشاشات التي ما زالت بحاجة إلى إغلاق تُحسب على حدة:',
  'ad.suivi.rlFriseOuvertesTriPlan': 'ترتيب الخطة',
  'ad.suivi.rlFriseOuvertesTriFin': 'النهاية أولًا',
  'ad.suivi.rlFriseOuvertesTriHint':
    'يرتّب مؤشرات الشرائح التي ما زالت مفتوحة وشرائح الشريط نفسه: بترتيب الخطة — من الشريحة الأولى إلى الأخيرة —، أو النهاية أولًا، فالشريحة الأكثر تقدمًا في الخطة تتصدر. والجدول المؤرَّخ يحمل الترتيب نفسه ويقوله في سطره الأول، ويضيف إليه كم شريحة حرّكها هذا الترتيب. ويبقى الترتيب على هذا الجهاز من زيارة إلى أخرى.',
  'ad.suivi.rlFriseOuvertesTriGomme': 'إعادة إلى ترتيب الخطة',
  'ad.suivi.rlFriseOuvertesTriGommeHint':
    'يمحو بنقرة واحدة ترتيب الشرائح المفتوحة: الشرائح ({n}) التي أعادها للتوّ إلى ترتيب الخطة — المؤشرات وشرائح الشريط والسطر الأول من الجدول المؤرَّخ معًا — تعود من الشريحة الأولى إلى الأخيرة، ويعود الاختيار إلى «ترتيب الخطة» كما في أول فتح.',
  'ad.suivi.rlFriseOuvertesTriGommeDepuis':
    'كان ترتيب «النهاية أولًا» معتمدًا منذ {depuis}: هكذا تؤرّخ الممحاة الإيماءة التي تلغيها.',
  'ad.suivi.rlFriseOuvertesTriPoids': '{n} شريحة مُنقَّلة',
  'ad.suivi.rlFriseOuvertesTriPoidsNone': 'لا شريحة مُنقَّلة',
  'ad.suivi.rlFriseOuvertesTriPoidsHint':
    'ثقل الترتيب، مقروءًا على الشرائح المفتوحة ({tranches}): {n} منها لا تقع في الرتبة نفسها في ترتيب الخطة وفي الترتيب المعتمد — «{ordre}». ويُقرأ العدد بجانب المؤشرين، ليقول الترتيب أثره قبل فتح أي ملف.',
  'ad.suivi.rlFriseOuvertesTriPoidsBornes':
    'الترتيب المعتمد يفتح على {ouvre} ويغلق على {ferme}.',
  'ad.suivi.rlFriseOuvertesTriPoidsBornesNone':
    'لا شريحة مرتّبة: ليس للترتيب فتح ولا إغلاق ليسمّيهما.',
  'ad.suivi.rlFriseOuvertesTriPoidsEcrans':
    'هذه الشرائح ({tranches}) التي ما زالت مفتوحة تحفظ {ecrans} شاشة غير مغلقة من الجهتين — يُقرأ العدد مع الترتيب، دون فتح أي ملف.',
  'ad.suivi.rlFriseOuvertesTriPoidsGarde':
    'الشريحة التي تحفظ أكثر من غيرها: {tranche} — {n} شاشة ما زالت مفتوحة من الجهتين.',
  'ad.suivi.rlFriseLastDeplacee':
    'نُقلت آخر مرة بفعل الترتيب · {tranche} · {date}',
  'ad.suivi.rlFriseLastDeplaceeHint':
    'بين الشرائح ({n}) التي نقلها الترتيب الحالي، تلك التي آخر إيماءة فيها هي الأحدث: {tranche}، تحرّكت في {date}. أما الشريحة التي يتركها الترتيب في مكانها فلا تُقرأ هنا.',
  'ad.suivi.rlFriseLastDeplaceeNone': 'لا شريحة نقلها الترتيب الحالي',
  'ad.suivi.rlFriseLastDeplaceeNoneHint':
    'الترتيب المعتمد لا ينقل أي شريحة: الترتيبان يتطابقان، وليس لسطر آخر إيماءة شريحةٌ نُقلت حديثًا ليسمّيها.',
  'ad.suivi.rlFriseExtremesCopierHint':
    'ينسخ إلى الحافظة الشريحتين الطرفيتين اللتين ما زالتا مفتوحتين — {ancienne}، تحرّكت {delaiAncienne}، و{recente}، تحرّكت {delaiRecente} —، كل واحدة مع تاريخ آخر إيماءة فيها وأرقامها التي ما زالت بحاجة إلى إغلاق: ما ينتظر منذ أطول مدة وما تحرّك للتو، في ورقة واحدة.',
  'ad.suivi.rlFriseRecenteCopierN': 'نسخ الأحدث ({n})',
  'ad.suivi.rlFriseRecenteCopierNDelai': 'نسخ الأحدث ({n}) · {delai}',
  'ad.suivi.rlFriseRecenteCopies': 'نُسخت الشريحة',
  'ad.suivi.rlFriseRecenteCopierHint':
    'ينسخ إلى الحافظة الشريحة التي ما زالت مفتوحة ومُست آخر إيماءة فيها — {tranche}، تحرّكت {delai} — مع تاريخ آخر إيماءة وأرقامها التي ما زالت بحاجة إلى إغلاق، بما فيها الجهة الناقصة: نظير الأقدم، جاهزة لإعادة إغلاقها.',
  'ad.suivi.rlFriseRecenteCopierCount':
    'تحتفظ الشريحة بـ {n} شاشة ما زالت بحاجة إلى إغلاق من الجهتين.',
  'ad.suivi.rlFriseCopyTriAncienne': 'الأقدم أولًا',
  'ad.suivi.rlFriseCopyTriRecente': 'الأحدث أولًا',
  'ad.suivi.rlFriseCopyTriHint':
    'يرتّب بوابتي النسخ في الرأس: بوابة الشريحة الأقدم التي ما زالت مفتوحة أولًا، أو بوابة الأحدث مسًّا. ويبقى الترتيب على هذا الجهاز من زيارة إلى أخرى.',
  'ad.suivi.rlFriseEcartInstant': 'الآن',
  'ad.suivi.rlFriseEcartMin': '{n} دقيقة',
  'ad.suivi.rlFriseEcartH': '{n} ساعة',
  'ad.suivi.rlFriseEcartJ': '{n} يومًا',
  'ad.suivi.rlFriseBandeReouvertApres': 'أُعيد فتحها بعد {delai} من إغلاقها',
  'ad.suivi.rlFriseBandeReouvertApresHint':
    'أُعيد فتح الشريحة بعد أن كانت مغلقة: تُقرأ هذه المدة بين إغلاق {date} وإعادة الفتح هذه — تقول كم صمدت الحال المغلقة، لا منذ متى تحرّكت الشريحة.',
  'ad.suivi.rlFriseOuvertesSensFerme': 'مغلقة',
  'ad.suivi.rlFriseOuvertesSensRouvert': 'معادة الفتح',
  'ad.suivi.rlFriseOuvertesSensAucun': 'بلا إيماءة',
  'ad.suivi.rlFriseOuvertesSensHint':
    'اتجاه آخر إيماءة في كل شريحة ما زالت مفتوحة، مسمّاة واحدة واحدة: ما تركته فيها إيماءة إغلاق، أو ما أعادته إيماءة فتح. أما الشريحة التي لم تمسّها إيماءة فتقول ذلك.',
  'ad.suivi.rlFriseBandeLastRest':
    'تركت {n} شاشة ما زالت مفتوحة في هذه الشريحة.',
  'ad.suivi.rlFriseBandeLastRestNone':
    'لم تترك أي شاشة مفتوحة في هذه الشريحة: كانت مغلقة من الجهتين بعدها.',
  'ad.suivi.rlFriseBandeLastRestUnknown':
    'الشاشات المتروكة مفتوحة: غير مسجَّلة لهذه الإيماءة، إذ تسبق هذا العدّ.',
  'ad.suivi.rlFriseBook': 'الدفتر · {n} إيماءة محفوظة · من {jour} إلى {recent}',
  'ad.suivi.rlFriseBookHint':
    'ما سيطويه «نسيان الإيماءات»: {n} إيماءة شريحة على هذا الجهاز، من أقدمها — {jour} — إلى أحدثها — {recent}. أما الخانات المؤشَّرة فتبقى.',
  'ad.suivi.rlFriseForget': 'نسيان الإيماءات',
  'ad.suivi.rlFriseForgetConfirm': 'تأكيد النسيان',
  'ad.suivi.rlFriseForgetHint':
    'يمحو دفتر إيماءات الشريحة من هذا الجهاز: يبدأ ملف CSV من دفتر فارغ، ولا يبقى في رأس الشريط آخر إيماءة تذكَّر. تبقى الخانات المؤشَّرة؛ ونقرة ثانية تؤكّد.',
};

const en: Dict = {
  'ad.suivi.rlTitle': 'Arabic and English review, page by page',
  'ad.suivi.rlNote': '{done} page(s) reviewed in both out of {n} · kept on this device',
  'ad.suivi.rlBoth': '{n} page(s) reviewed in both languages, out of 30',
  'ad.suivi.rlAr': 'Arabic',
  'ad.suivi.rlEn': 'English',
  'ad.suivi.rlArHint': 'Mark the Arabic review of this page',
  'ad.suivi.rlEnHint': 'Mark the English review of this page',
  'ad.suivi.rlReset': 'Clear all boxes',
  'ad.suivi.rlCsv': 'Export as CSV',
  'ad.suivi.rlCsvHint':
    'This device’s notebook, screen by screen, with both boxes and the side already ticked — plus a “Pass” column marking both passes, screens 1–10 then 11–20, and a “Resume” column naming the first screen still open in each pass. A second sheet, separated by an empty line, gives each pass’s summary — its span, both counts, their agreement, the ranks still open and its resume — for sending unfiltered to a reviewer. A third sheet, “Slice gesture”, dates each click that closed or reopened a slice in one go, and states in a last column how many screens are closed on both sides just after — the count reached, not only the count touched. A line “Carnet remis à zéro le …” dates each forgetting of the gestures, so an emptied notebook is told apart from one that never served.',
  'ad.suivi.rlCsvOk': 'CSV downloaded',
  'ad.suivi.rlCopy': 'Copy the list',
  'ad.suivi.rlCopyHint':
    'The thirty lines as text, with this device’s boxes, both pass counts, the ranks still open in each and its resume — and, at the head, the last slice gesture with its date and the count reached, then the notebook line — how many gestures are kept, from the oldest to the newest, and how many resets fall between them — ready to paste into a message.',
  'ad.suivi.rlCopyOk': 'List copied',
  'ad.suivi.rlCopyFail': 'Copy refused',
  'ad.suivi.rlResetHint':
    'Clears the boxes ticked on this device; a second click confirms it.',
  'ad.suivi.rlResetConfirm': 'Confirm the erasure',
  'ad.suivi.rlKeep':
    'The boxes stay on this device: they are written neither to the database nor to the plan, and do not follow you to another browser.',
  'ad.suivi.rlTermesTitle': 'The frozen terms, kept the same from page to page',
  'ad.suivi.rlTermesNote':
    'The vocabulary of §11.2 of the plan: one word reads the same way everywhere.',
  'ad.suivi.rlTermesFr': 'French',
  'ad.suivi.rlTermesAr': 'Arabic',
  'ad.suivi.rlTermesEn': 'English',
  'ad.suivi.rlOneSide': 'Ticked one side only',
  'ad.suivi.rlOneSideHint':
    'Isolate the pages where Arabic and English disagree — ticked on one side only.',
  'ad.suivi.rlOneSideNone':
    'No page is ticked on one side only: both languages agree everywhere.',
  'ad.suivi.rlOnlyAr': 'Arabic only',
  'ad.suivi.rlOnlyEn': 'English only',
  'ad.suivi.rlShowAll': 'Bring back all thirty pages.',
  'ad.suivi.rlOnlyArNone': 'Everything is ticked in Arabic: nothing left on that side.',
  'ad.suivi.rlOnlyEnNone': 'Everything is ticked in English: nothing left on that side.',
  'ad.suivi.rlShown': '{n} page(s) shown out of {total}',
  'ad.suivi.rlAll': 'All {total} pages, in reading order',
  'ad.suivi.rlTournee1': 'The first ten',
  'ad.suivi.rlTournee2': 'Screens {de} to {a}',
  'ad.suivi.rlTourneeHint':
    'Narrows the list to screens {de} to {a}, in the plan’s order: Arabic first, then the same screens in English. A second click brings back all thirty pages, and the other marker shows the other pass.',
  'ad.suivi.rlFirstTenLine':
    'Pass {de}–{a}, Arabic first: {ar} / {n} in Arabic, then the same screens in English: {en} / {n}.',
  'ad.suivi.rlFirstTenDone': '{n} screen(s) reviewed in both languages',
  'ad.suivi.rlTourneeNone':
    'The pass over screens {de} to {a} is reviewed in both languages: the rest of the plan is waiting.',
  'ad.suivi.rlMarkAr': 'Tick the ten in Arabic ({n})',
  'ad.suivi.rlMarkEn': 'Tick the ten in English ({n})',
  'ad.suivi.rlMarkHint':
    'Ticks the ten screens of this pass in that language in one gesture — {n} still to tick. The notebook is not overwritten: ranks already ticked stay, and the other screens of the plan do not move.',
  'ad.suivi.rlMarkDone': 'Pass ticked, {done} / {n}',
  'ad.suivi.rlResume': 'Resume at screen {n}',
  'ad.suivi.rlResumeHint':
    'Opens the first screen of the pass still unticked — screen {n} — in another tab: the review carries on without hunting for its rank in the list.',
  'ad.suivi.rlOpen': 'Open this screen',
  'ad.suivi.rlOpenHint':
    'Opens this screen in another tab: the list stays in place, and the box is ticked when you come back.',
  'ad.suivi.rlNext': 'Next screen — {n}',
  'ad.suivi.rlNextHint':
    'Opens the next screen of the list — screen {n} — in another tab: the review moves one notch on without coming back for the rank. The door takes its colour as soon as this screen is ticked.',
  'ad.suivi.rlNextRest': 'still {n}',
  'ad.suivi.rlNextRestHint':
    '{n} screen(s) still to tick after this one in this list — enough to gauge the pass before starting it.',
  'ad.suivi.rlFriseTitle': 'The frise of the thirty screens',
  'ad.suivi.rlFriseNote':
    'What is closed on both sides, what is ticked on one side only, and what is still open — at a glance, pass by pass. One click closes the screen on both sides, a second opens it again; the slice button closes or reopens its ten screens in one go.',
  'ad.suivi.rlFriseDeux': 'Closed on both sides',
  'ad.suivi.rlFriseUn': 'Ticked on one side only',
  'ad.suivi.rlFriseRien': 'Still open',
  'ad.suivi.rlFriseBandTournee': 'Pass {n} · screens {de}–{a}',
  'ad.suivi.rlFriseBandReste': 'Outside the passes · screens {de}–{a}',
  'ad.suivi.rlFriseGo': 'one click closes the screen on both sides',
  'ad.suivi.rlFriseFermer': 'one click ticks Arabic and English in one gesture',
  'ad.suivi.rlFriseRouvrir': 'one click opens both boxes again',
  'ad.suivi.rlFriseBulkClose': 'Close the {n} left',
  'ad.suivi.rlFriseBulkReopen': 'Reopen all',
  'ad.suivi.rlFriseBulkHint':
    'Ticks, in one gesture and in both languages, the {n} screen(s) still open in this slice — Arabic and English together, without going down to the list lines.',
  'ad.suivi.rlFriseBulkReopenHint':
    'Reopens the screens of this slice in one gesture, on both sides; a second click closes them again.',
  'ad.suivi.rlFriseFlashClose': 'Closed in one go: {n} screen(s) on both sides',
  'ad.suivi.rlFriseFlashReopen': 'Reopened in one go: {n} screen(s)',
  'ad.suivi.rlFriseLast': 'Last gesture · {date} · {tranche} · {sens} · {n} screen(s)',
  'ad.suivi.rlFriseLastHors': 'Outside the passes ({de}–{a})',
  'ad.suivi.rlFriseLastClose': 'closed in one go',
  'ad.suivi.rlFriseLastReopen': 'reopened in one go',
  'ad.suivi.rlFriseLastNone': 'No slice gesture kept on this device.',
  'ad.suivi.rlFriseLastSee': 'Find again',
  'ad.suivi.rlFriseLastSeeHint':
    'Opens the list narrowed to pass {de}–{a}, the one this gesture just closed or reopened in one go.',
  'ad.suivi.rlFriseLastCard': 'Dated card',
  'ad.suivi.rlFriseLastCardHint':
    'Unfolds, under slice {de}–{a}, the card of its dated gestures already ordered by that same direction — the one of this last gesture ({sens}): its click reads there with its date, the screens touched and the count reached.',
  'ad.suivi.rlFriseOuvertes':
    '{n} slice(s) still open · last gesture closed: {ferme} · reopened: {rouvert}',
  'ad.suivi.rlFriseOuvertesNone': 'Every slice is closed on both sides',
  'ad.suivi.rlFriseOuvertesHint':
    'The slices of the frise that keep at least one screen not closed on both sides, counted by the direction of their last gesture: those a closing left on the way, and those a reopening left half done.',
  'ad.suivi.rlTourneeRestEn': 'Still in English: {list}',
  'ad.suivi.rlTourneeRestEnOne': 'Still in English: {list}',
  'ad.suivi.rlTourneeRestEnNone': 'English complete on this pass',
  'ad.suivi.rlOffsite': 'Off-site: in the server functions',
  'ad.par.title': 'Key parity, file by file',
  'ad.par.note':
    'French is the reference: every key it names must exist in Arabic and in English. A missing key does not show on screen — the site falls back to English without saying so.',
  'ad.par.showAll': 'All files',
  'ad.par.showAllHint': 'Also show the files where the three languages already agree.',
  'ad.par.onlyGaps': 'Files with a gap',
  'ad.par.onlyGapsHint': 'Keep only the files where a key is missing on one side.',
  'ad.par.missAr': 'key(s) missing in Arabic',
  'ad.par.missEn': 'key(s) missing in English',
  'ad.par.filesOk': 'file(s) in agreement out of {n}',
  'ad.par.none':
    'All {n} files carry exactly the same list of keys in the three languages. Nothing to complete.',
  'ad.par.fileOk': 'The three languages agree: no key is missing.',
  'ad.par.missArLabel': 'Missing in Arabic',
  'ad.par.missEnLabel': 'Missing in English',
  'ad.par.seulArLabel': 'Arabic only',
  'ad.par.seulEnLabel': 'English only',
  'ad.par.noneAr': 'none',
  'ad.par.noneEn': 'none',
  'ad.par.keep':
    'Read on the dictionaries the site ships, each time the panel opens: nothing is stored or sent.',
  'ad.par.csv': 'Export as CSV',
  'ad.par.csvHint':
    'One line per text file, with the exact names of the missing keys in their own columns — to hand over to a reviewer. Its name carries the number of keys to complete, like the console workbooks.',
  'ad.par.csvOk': 'CSV downloaded',
  'ad.par.copy': 'Copy the report',
  'ad.par.copyHint':
    'The files with a gap as text, with the exact key names — ready to paste into a message.',
  'ad.par.copyOk': 'Report copied',
  'ad.par.copyFail': 'Copy refused',
  'ad.par.import': 'Filled report',
  'ad.par.importHint':
    'Opens the CSV the reviewer filled in: the console names every key returned, file and language at the head, ready to be copied one by one.',
  'ad.par.importErr':
    'This file is not a parity report: the “À compléter, clé par clé” sheet is not in it.',
  'ad.par.importHead': '{n} key(s) returned · {vide} still empty',
  'ad.par.importBlank': 'to complete',
  'ad.par.importPosees': '{n} key(s) already placed since',
  'ad.par.importPoseesHint':
    'The keys of the report that the site now carries: they are no longer copied, the console reads them on its dictionaries.',
  'ad.par.importPoseeTag': 'already placed',
  'ad.par.importSeePosees': 'Show the placed keys',
  'ad.par.importSeePoseesHint':
    'Brings back the keys already placed since, taken out of the list to leave only the remaining work.',
  'ad.par.importHidePosees': 'Hide the placed keys',
  'ad.par.importHidePoseesHint':
    'Closes the keys already placed since: the report returns to what is left to complete.',
  'ad.par.importAllPosees':
    'All {n} key(s) of this report are placed since: nothing left to complete on that side.',
  'ad.par.importCopy': 'Copy the filled report',
  'ad.par.importCopyHint':
    'The returned translations as text, file and language at the head, key by key — ready to paste to complete the files.',
  'ad.par.importCopyOk': 'Filled report copied',
  'ad.par.importCopyFail': 'Copy refused',
  'ad.par.importClear': 'Remove this report',
  'ad.par.importClearHint':
    'Closes the imported report: the file list stays as it is, nothing is erased.',
  'ad.par.gomme': 'Erase this line',
  'ad.par.gommeHint':
    'Erases that one translation already copied over: the rest of the imported report stays, and the whole file is not removed.',
  'ad.par.gommeesCount': '{n} line(s) erased during this visit',
  'ad.par.gommeesHint':
    'The translations erased since this report was opened. They are not lost: the gesture next to this brings them back.',
  'ad.par.releveCsv': 'Report on screen ({n})',
  'ad.par.releveCsvPosees': 'Report on screen ({n}) · {p} placed',
  'ad.par.releveCsvBack': 'Report on screen ({n}) · {p} placed · {r} brought back',
  'ad.par.releveCsvOk': 'Report downloaded',
  'ad.par.triPose': 'Sort by placement date',
  'ad.par.triPoseOn': 'Newest first',
  'ad.par.triPoseHint':
    'Orders the translations already placed from newest to oldest, read on the days this device keeps. Those whose day is unknown close the list.',
  'ad.par.triPoseBackHint':
    'Returns to the file order as the reviewer rendered it — file and language grouped.',
  'ad.par.triPoseDateHint':
    'The day the console first saw this key placed, kept on this device.',
  'ad.par.triAncien': 'Due for review first',
  'ad.par.triAncienOn': 'Oldest first',
  'ad.par.triAncienAge': 'oldest: {n} d',
  'ad.par.triAncienAgeHint':
    'The number of days since the oldest placement read, on the placement days this device keeps.',
  'ad.par.triAncienHint':
    'Brings up the translations placed longest ago, read on the days this device keeps: those waiting for a re-read the longest come first. Lines whose day is unknown close the list.',
  'ad.par.triAncienBackHint':
    'Returns to the file order as the reviewer rendered it — file and language grouped.',
  'ad.par.triJeune': 'Sort by age: youngest first',
  'ad.par.triJeuneOn': 'Youngest first',
  'ad.par.triJeuneAge': 'youngest: {n} d',
  'ad.par.triJeuneAgeHint':
    'The number of days since the youngest placement read, on the placement days this device keeps.',
  'ad.par.triJeuneHint':
    'Orders the translations by placement age, youngest first: what was just placed opens the list before the old placements. Lines whose day is unknown close the list.',
  'ad.par.triJeuneBackHint':
    'Returns to the file order as the reviewer rendered it — file and language grouped.',
  'ad.par.triJeuneRow': 'placed {n} d ago',
  'ad.par.triJeuneRowHint':
    'The age of this placement in days: it is what orders the line in the list.',
  'ad.par.triEcart': 'Sort by keys with a gap',
  'ad.par.triEcartOn': 'Hollowest first',
  'ad.par.triEcartHead': 'hollowest: {f} — {n}',
  'ad.par.triEcartHeadHint':
    'The file that opens the list, and how many keys it has with a gap: missing on one side, or with no French equivalent.',
  'ad.par.triEcartHint':
    'Orders the files by number of keys with a gap, the hollowest first — counted on the keys actually read, narrowing and search included. Each line then states its own gap.',
  'ad.par.triEcartBackHint':
    'Returns to the report’s own order, without a measure on the lines.',
  'ad.par.rowEcart': 'gap {n}',
  'ad.par.triEcartHeadFiles': '{k} file(s) with a gap · hollowest: {f} — {n}',
  'ad.par.retourGroup': '{n} key(s) left out of {total}',
  'ad.par.retourGroupHint':
    'The keys of this file still to complete, among the lines the imported report carries for it — keys already placed or already translated are not counted.',
  'ad.par.retourSearchPh': 'Search a file in the report',
  'ad.par.retourSearchHint':
    'Keeps only the lines of a named file — “legal”, “offres”… — without going through the twenty-one files of the report.',
  'ad.par.retourSearchClear': 'Clear the report search',
  'ad.par.retourSearchCount': '{n} file(s) · {l} line(s)',
  'ad.par.retourSearchNone':
    'No line of the report is named “{q}”: the search covers the file name, not the key or the translation.',
  'ad.par.releveCsvHint':
    'Downloads the imported report as it reads on screen, after the erasures: one line per key still there, with its state and, in a “Posée le” column, the day the console saw each translation placed, and in the next one the age of that placement in days, for sorting the re-read in a spreadsheet. Its name carries the number of lines in the report, the number of translations already placed and the number of lines brought back during this visit, so two reports from the same day do not collide in a downloads folder.',
  'ad.par.rappelees':
    '{n} line(s) brought back during this visit — their count enters the name of the downloaded report.',
  'ad.par.gommeesBack': 'Bring the erased back',
  'ad.par.gommeesBackHint':
    'Puts back every line erased during this visit, with its translation, exactly as it was before the first erase.',
  'parPose.badge': '{n} translation(s) still to place',
  'parPose.hint':
    'Placement marker: {n} translation(s) still to place across the {cles} key(s) of {fichier}. It disappears once everything is placed.',
  'parPose.open':
    'One click opens the parity report, already narrowed to this file.',
  'ad.par.resteCsv': 'CSV of the remaining ({n})',
  'ad.par.resteCsvHint':
    'A file reduced to the keys still empty in the imported report — neither placed since nor already translated — to hand over for a second pass. Its name carries the number of remaining keys, like the console workbooks.',
  'ad.par.resteCsvOk': 'Remaining exported',
  'ad.par.importTraduites': 'Translated, to copy',
  'ad.par.importTraduitesOn': 'Narrowed to translations',
  'ad.par.importTraduitesHint':
    'Keep only the keys the reviewer translated and the site does not carry yet: the copy then takes only those, in one go.',
  'ad.par.importTraduitesExitHint':
    'One click brings the whole report back, with the empty and the placed keys.',
  'ad.par.importTraduitesNone':
    'No returned translation is waiting to be copied: the reviewer wrote nothing the site does not already carry.',
  'ad.par.importCopyNarrow': 'Copy these {n} key(s)',
  'ad.par.importCopyNarrowHint':
    'Copies only the translated keys the list shows, file and language at the head, ready to complete one by one.',
  'ad.par.traduitesCsv': 'CSV of the translated ({n})',
  'ad.par.traduitesCsvHint':
    'A file reduced to the keys the reviewer translated and the site does not carry yet, with the French text opposite — to pass on as it is, without going through the text copy.',
  'ad.par.traduitesCsvOk': 'Translated exported',
  'ad.par.chipTag': 'Keys',
  'ad.par.chipNoneTag': 'Keys',
  'ad.par.chipCount': '{n} key(s) with a gap',
  'ad.par.chipSplit': 'AR {ar} · EN {en} · {orph} with no French equivalent',
  'ad.par.chipNone': 'The three languages carry the same list of keys',
  'ad.par.chipHint':
    'Keys one language names without the other, read on the site’s dictionaries; one click opens the report.',
  'ad.par.focusOn': 'Report narrowed to {fichier}',
  'ad.par.focusFam': 'keys {fam}',
  'ad.par.focusHint':
    'This report only shows that file, and the keys carrying the requested family; the rest of the work reads by removing the narrowing.',
  'ad.par.focusClear': 'See the whole report',
  'ad.par.focusReste': '{n} key(s) remained',
  'ad.par.focusResteHint':
    'What remained to be placed in this file when the link was copied; the report recounts it on the site’s dictionaries.',
  'ad.par.searchPh': 'Search a file',
  'ad.par.searchHint':
    'Filters the report by file name — “legal”, “offres”… — to find a file without going through a screen marker.',
  'ad.par.searchClear': 'Clear the search',
  'ad.par.searchCount': '{n} file(s)',
  'ad.par.searchNone':
    'No file is named “{q}”: the twenty-one files are all called dict.…, and the narrowing stays on until it is removed.',
  'ad.par.focusLink': 'Copy the link',
  'ad.par.focusLinkHint':
    'Copies the address of the report narrowed to this file, with what remained to be placed in it: a reviewer opens it in one click, without going through the twenty-one files.',
  'ad.par.focusLinkOk': 'Link copied',
  'ad.par.focusLinkOkReste': 'Link copied · {n} key(s)',
  'ad.par.focusLinkFail': 'Copy refused',
  'ad.par.rowLink': 'Copy the link to this file',
  'ad.par.rowLinkHint':
    'Copies the address of the report narrowed to this file alone, with the number of keys still left in it — to send to the reviewer handling it.',
  'ad.relectureChip': '{n} page(s) to review',
  'ad.relectureChipDone': 'Review up to date',
  'ad.relectureChipHint':
    'Pages still to be reviewed in both languages, read on this device’s notebook. One click opens the review list.',
  'ad.relectureArCount': '{n} page(s) to review in Arabic',
  'ad.relectureEnCount': '{n} page(s) to review in English',
  'ad.relectureArDone': 'Arabic up to date',
  'ad.relectureEnDone': 'English up to date',
  'ad.relectureArHint':
    'Pages not yet ticked in Arabic on this device; one click opens the list, narrowed to those pages.',
  'ad.relectureEnHint':
    'Pages not yet ticked in English on this device; one click opens the list, narrowed to those pages.',
  'ad.relectureEcartTag': 'Gap',
  'ad.relectureEcartNoneTag': 'Agreed',
  'ad.relectureEcartCount': '{n} page(s) ticked on one side only',
  'ad.relectureEcartNone': 'Both languages agree on all thirty pages',
  'ad.relectureEcartHint':
    'Pages where one language is ticked without the other; one click opens the list narrowed to them.',
  'ad.relectureTourneeTag': 'Pass',
  'ad.relectureTourneeCount':
    'First pass: {done} / {n} screens reviewed in both languages · {reste} still to tick in Arabic',
  'ad.relectureTourneeDone': 'The first pass is reviewed in both languages',
  'ad.relectureTourneeHint':
    'The ten screens of this pass, in reading order, Arabic first. One click opens the list narrowed to it.',
  'ad.relectureTourneeGo':
    'The pass line ticks them in one gesture, Arabic first, then the same in English: the marker calms down once the ten are done on both sides.',
  'ad.relectureTourneeRestAr': 'Still in Arabic: {list}',
  'ad.relectureTourneeRestArOne': 'Still in Arabic: {list}',
  'ad.relectureTourneeRestNone': 'Arabic complete on this pass',
  'ad.relectureTourneeRestHint':
    'The ranks of this pass still to tick in Arabic, in the plan’s order: enough to choose where to pick up.',
  'ad.relectureMiniResume': 'Resume at screen {n}',
  'ad.relectureMiniDone': 'Pass done on both sides',
  'ad.relectureMiniSay': '{n} · {page} — {etat}',
  'ad.relectureMiniSayHint':
    'Hover a mark: it names its screen and its state; one click opens it in a new tab.',
  'ad.relectureMiniOpen': 'one click opens it in a new tab',
  'ad.relectureMiniClose': 'Close the {n} left',
  'ad.relectureMiniCloseHint':
    'Ticks, in one gesture and in both languages, the {n} screen(s) still open in this pass — Arabic and English together — without leaving the header or opening the panel. Screens already ticked stay, and the other passes do not move.',
  'ad.relectureMiniClosed': 'Closed in one go: {n} screen(s) on both sides',
  'ad.relectureTourneeFlash': 'Closed {n} · {apres}/{total} in all',
  'ad.suivi.rlFriseBandeLast': 'Last gesture · {date} · {sens}',
  'ad.suivi.rlFriseBandeLastHint':
    'The last gesture on this slice alone: {date}, {sens} — the screens {ecrans} touched, {n} actually changed —, then {apres}. Not the last gesture of the whole notebook.',
  'ad.suivi.rlFriseBandeLastApres':
    'the count reached after that very gesture: {apres} screen(s) closed on both sides out of {total}',
  'ad.suivi.rlFriseBandeLastApresNone':
    'count reached not recorded for this gesture: it predates the moment the frise started noting it',
  'ad.suivi.rlFriseGestesTitle': 'The gestures of this slice, dated',
  'ad.suivi.rlFriseGestesCloseHint':
    'Closes the card: only the slice’s date remains.',
  'ad.suivi.rlFriseGestesTouched': '{n} screen(s) touched',
  'ad.suivi.rlFriseGestesTouchedDeja':
    '{n} screen(s) touched · {deja} / {total} already closed before this gesture',
  'ad.suivi.rlFriseGestesTouchedDejaNone':
    '{n} screen(s) touched · already closed before: not recorded',
  'ad.suivi.rlFriseGestesApres': '{apres} / {total} closed after',
  'ad.suivi.rlFriseGestesAutres':
    'That same click also carried: {tranches}',
  'ad.suivi.rlFriseGestesAutresHint':
    'The {n} other slice(s) noted under the same instant, named as in the frise: this gesture was not a solitary slice click, it moved several in one go.',
  'ad.suivi.rlFriseGestesClicTotal':
    'That click touched {n} screen(s) in all, slice by slice: {detail}',
  'ad.suivi.rlFriseGestesClicTotalHint':
    'The sum of the screens every gesture of that same click touched — {n} in all, across {tranches} slice(s) — and what each one carried. The click reads in one go, without adding its slices by hand.',
  'ad.suivi.rlFriseGestesSortAll': 'All',
  'ad.suivi.rlFriseGestesSortFerme': 'Closed',
  'ad.suivi.rlFriseGestesSortRouvert': 'Reopened',
  'ad.suivi.rlFriseGestesSortHint':
    'Orders the card by direction: the closings on one side, the reopenings on the other, each with its count. A second click on the held marker brings both directions back.',
  'ad.suivi.rlFriseGestesSortNone':
    'No gesture of this direction in this slice: the “All” marker brings the whole list back.',
  'ad.suivi.rlFriseSliceCsv': 'CSV of this slice',
  'ad.suivi.rlFriseSliceCsvOk': 'Slice exported',
  'ad.suivi.rlFriseSliceCsvHint':
    'Downloads a sheet reduced to the displayed slice — screens {de}–{a}: its screens and their two boxes, then its dated gestures with the count each one reached, and the resets that fell between its oldest and its newest gesture. The other slices do not go with it.',
  'ad.suivi.rlFriseReset': 'Notebook reset on {date}',
  'ad.suivi.rlFriseGestesReel':
    'This direction really touched {ecrans} screen(s) in all, across {n} gesture(s) of this slice.',
  'ad.suivi.rlFriseLastSortHint':
    'Orders the last-gesture line by direction: the last closing alone, or the last reopening alone, instead of the last click of the whole notebook. The held marker stays held until another one is chosen.',
  'ad.suivi.rlFriseLastNoneSens':
    'No gesture of this direction in the notebook: the “All” marker brings back the last gesture on this device.',
  'ad.suivi.rlFriseSliceCsvGestes':
    'It will carry {n} gesture(s) of this slice, the oldest from {jour}.',
  'ad.suivi.rlFriseSliceCsvGestesNone':
    'No grouped gesture kept on this slice: the sheet carries only its screens and their boxes.',
  'ad.suivi.rlFriseDelaiInstant': 'just now',
  'ad.suivi.rlFriseDelaiMin': '{n} min ago',
  'ad.suivi.rlFriseDelaiH': '{n} h ago',
  'ad.suivi.rlFriseDelaiJ': '{n} d ago',
  'ad.suivi.rlFriseBandeLastDelaiHint':
    'The time elapsed since that gesture: {delai}.',
  'ad.suivi.rlFriseLastCardCounts':
    'This slice carries {n} dated gesture(s), {m} of them in that direction.',
  'ad.suivi.rlFriseOuvertesCsv': 'CSV of the open slices ({n})',
  'ad.suivi.rlFriseOuvertesCsvOk': 'Slices exported',
  'ad.suivi.rlFriseOuvertesCsvHint':
    'Downloads a single file for the {n} slice(s) still keeping at least one screen not closed on both sides: their {ecrans} screen(s) still open with their boxes, their dated gestures — {gestes} — and the count each one reached. Its head line states the order kept for the open slices — plan order or end first —, with how many slices that order moved, and the slices are ranged the same way. It also names both slices that bound that order — “the order opens on …” and “the order closes on …” —, so the file says where its ordering begins and where it ends. A “Last reopening” column dates the passage of the grouped gesture, and tells how many slices that click moved. A sub-total column, set beside the screens, fills in on the line that closes each slice and says how many screens it still keeps open. A slice already finished on both sides does not enter it. A “Last gesture of the slice” column, set beside the sub-total, dates each slice itself on the line that closes it, so the file dates every slice too. A “Position” column, set right after the slice name, gives its rank in the kept order — “2 / 3” —, to re-read the ordering line by line. An “Écrans fermés” column, set right beside the sub-total, says what the slice has already closed on both sides. An “Écrans gardés” column, set right after the position, says on each line what the slice still keeps open across its span, and the total line does the same for the whole. An “Écart au plus chargé” column, set right after it, says for each slice how many screens separate it from the slice keeping the most — 0 for the heaviest itself. Its total line says how many slices still keep a position, and the reach of the ordering, from position 1 to the last, so the file closes on its ordering. Its total line also dates the closing slice, saying how long it has not moved, like the dated table. A synthesis line, set under the table, says what each open slice still keeps open, with the total of the whole in front.',
  'ad.suivi.rlFriseOuvertesCsvGarde':
    'The “Écart au plus chargé” column reads from the slice keeping the most: {tranche} — {n} screen(s) still open on both sides.',
  'ad.suivi.rlFriseOuvertesEcrans': 'Still {n} screen(s) to close',
  'ad.suivi.rlFriseOuvertesEcransHint':
    'The {n} screen(s) of these {tranches} slice(s) not yet closed on both sides: what the door next to this one carries away, and what reopening would hand back open.',
  'ad.suivi.rlFriseRouvrirOuvertes': 'Reopen these slices',
  'ad.suivi.rlFriseRouvrirOuvertesConfirm': 'Confirm the reopening',
  'ad.suivi.rlFriseRouvrirOuvertesOk': 'Reopened · {n} screen(s)',
  'ad.suivi.rlFriseRouvrirOuvertesHint':
    'One click asks, a second confirms: reopens in one go, on both sides, the {ecrans} screen(s) of the {n} slice(s) still keeping something unfinished. Slices already closed on both sides do not move — finished work is not undone here. The gesture is noted, dated, on each of those slices: it reads afterwards in their cards and in the exported sheets.',
  'ad.suivi.rlFriseOuvertesRangsHint':
    'The ranks still to close, slice by slice: {rangs}.',
  'ad.suivi.rlFriseOuvertesSensChipHint':
    'Opens the dated card of slice {de}–{a}, already ordered by that direction ({sens}): its gestures read there as closings or reopenings, without hunting the slice further down.',
  'ad.suivi.rlFriseOuvertesSensChipAucun':
    'Slice {de}–{a} has no gesture to date: the frise merely brings it into view.',
  'ad.suivi.rlFriseOuvertesSensChipEcrans':
    'This slice alone keeps {n} screen(s) still open on both sides.',
  'ad.suivi.rlFriseRouvrirCases': 'It would remove {n} ticked box(es)',
  'ad.suivi.rlFriseRouvrirCasesHint':
    'The ticked boxes this second click would remove in one go: {n} box(es) on the screens of the {tranches} slice(s) still open, Arabic and English together. Whatever was already closed on both sides there goes back to open.',
  'ad.suivi.rlFriseLastTranches': '{n} slice(s) in one click',
  'ad.suivi.rlFriseLastTranchesHint':
    'This last click reopened {n} slice(s) in one single gesture: the notebook notes them one by one, all under the same instant. The number tells the reach of the click, not the number of gestures.',
  'ad.suivi.rlFriseLastTranchesDelaiHint':
    'This grouped click happened {delai}: the time elapsed since its instant, read next to the number of slices it moved.',
  'ad.suivi.rlFriseRangsCopier': 'Copy the remaining ranks',
  'ad.suivi.rlFriseRangsCopies': 'Ranks copied',
  'ad.suivi.rlFriseRangsCopierHint':
    'Copies the list of ranks still to close, slice by slice — {ecrans} screen(s) across {n} slice(s) —, ready to paste into a message. Its head line states the order kept for the open slices, with the count of slices that order moved and the reach of the ordering — from position 1 to the last — beside the count of open slices, and the slices are ranged the same way: the list reads on its own. It also names both bounds of the ordering — {ouvre} opening, {ferme} closing —, and its head line carries, beside those bounds and the count of open slices, the count of those the sort moved: {deplacees}. Each slice carries its position in the kept order beside its name, like the “Position” column of the CSV. One line also states the date of the last gesture of the slice that closes the ordering, to date the closing bound without reopening the notebook. A finished slice writes “— tranche faite” instead of leaving a blank. Under the slice that closes the ordering, one line says how many screens it still keeps open on both sides. Its head line also names the oldest slice still open, with the date of its last gesture and the time elapsed, and carries on that same line the count of slices the sort moved. That same line also carries the count of screens this slice still keeps open on both sides, next to its delay, and its gap to the heaviest load, read on the same slices as the CSV — how many screens separate it from the one keeping the most. A final line, “Synthesis of kept screens”, says what the whole of the open slices still keeps open, with the total in front and each slice named with its weight, like the CSV line.',
  'ad.suivi.rlFriseTableauCopier': 'Copy the table',
  'ad.suivi.rlFriseTableauCopies': 'Table copied',
  'ad.suivi.rlFriseTableauCopierHint':
    'Copies the {ecrans} screen(s) still to close across the {n} open slice(s) as a table — one line per screen: its rank, its name and the missing side —, ready to paste into a message or a spreadsheet. Where the neighbouring door writes short lines, this one gives columns.',
  'ad.suivi.rlFriseTableauDateCopier': 'Copy the dated table',
  'ad.suivi.rlFriseTableauDateCopies': 'Dated table copied',
  'ad.suivi.rlFriseTableauDateCopierHint':
    'Copies the {ecrans} screen(s) still to close across the {n} open slice(s) as a six-column table — rank, screen, missing side, screens kept by the slice, gap to the heaviest load, and the date of the last gesture of the screen’s slice —, ready to paste into a message or a spreadsheet. Under each slice, a sub-total line says how many screens it still keeps open out of its span, how many it has already closed on both sides, and which side they most often wait on — the same symmetry as the open-slices sheet. An “Écrans gardés” column, set between the missing side and the date, restates on each line what the slice still keeps open across its span — “3 / 10” —, like the CSV column, and the total line does the same for the whole. An “Écart au plus chargé” column, set right after it, says line by line how many screens separate the slice from the one keeping the most — 0 for the heaviest itself —, and the sub-total line restates it with its weight. Each slice’s sub-total line also carries its position in the kept order beside its name — “position 2 / 3” —, like the list and the CSV; and the total line states the reach of the ordering, from position 1 to the last, in addition to the screen count, and names the slice that closes that ordering. A slice with no gesture writes “— aucun geste” instead of leaving the column empty. A count line, set above the total line, says how many slices are still open — the reach of the delay before the screen figure. Its head line also names both slices that bound the kept order — the opening and the closing —, beside the name of the order and its weight, like the CSV: a dated copy reads on its own. Its total line also names the slice keeping the most screens still open, like the position marker. It finally closes the table with a synthesis line of the kept screens, like the CSV and the copied list: the total in front, then each open slice named with its weight. A line follows it for the lightest slice: its name, the screens it keeps and its gap to the heaviest — 0 when it is the heaviest itself. Its hover also names the lightest slice and its gap to the heaviest, so the kept-screens synthesis reads from both ends of the ordering.',
  'ad.suivi.rlFriseTableauDateGarde':
    'The “Écrans gardés” column reads from the slice keeping the most: {tranche} — {n} screen(s) still open on both sides.',
  'ad.suivi.rlFriseTableauDateLegere':
    'The kept-screens synthesis reads from the lightest slice: {tranche} — {n} screen(s) still open on both sides, {ecart} screen(s) away from the one keeping the most.',
  'ad.suivi.rlFriseTableauDateLegereSeule':
    'The kept-screens synthesis reads from the lightest slice: {tranche} — {n} screen(s) still open on both sides; it is also the one keeping the most, and its gap is 0.',
  'ad.suivi.rlFriseTableauDateMoyenne':
    'The “Écart au plus chargé” column is judged at a glance: across the {n} open slice(s) the average gap is {moyenne} screen(s), with gaps spread from {min} to {max} — from the heaviest to the lightest.',
  'ad.suivi.rlFriseOuvertesCsvDispersion':
    'Its dispersion line, set under the synthesis line, states the spread of the gaps — from the smallest to the largest —, the average gap of the open slices, and the lightest slice with its weight and its gap.',
  'ad.suivi.rlFriseRangsCopierDispersion':
    'Under the lightest slice, a line carries the slice that closes the ordering with its weight and its gap: the two edges and the bound read as one block.',
  'ad.suivi.rlFriseClicCopier': 'Copy this click',
  'ad.suivi.rlFriseClicCopies': 'Click copied',
  'ad.suivi.rlFriseClicCopierHint':
    'Copies that one click — {date}, {sens}, {n} screen(s) in all across {tranches} slice(s) — with its slices one by one, without the other gestures of the card or the rest of the sheet.',
  'ad.suivi.rlFriseAncienne': 'Oldest still open · {tranche}',
  'ad.suivi.rlFriseAncienneHint':
    'The slice still open whose last gesture is the oldest in the notebook: {tranche}, moved {delai}. It is the one that has been waiting longest — one click in the frise closes it.',
  'ad.suivi.rlFriseAncienneCopier': 'Copy the oldest',
  'ad.suivi.rlFriseAncienneCopies': 'Slice copied',
  'ad.suivi.rlFriseAncienneCopierHint':
    'Puts into the clipboard the slice still open that has been waiting longest — {tranche}, moved {delai} — with the date of its last gesture and its ranks still to close, missing side included: ready to be closed without reopening the frise or unfolding its card. It also says, next to its delay, how many screens it still keeps open on both sides.',
  'ad.suivi.rlFriseAncienneCopierN': 'Copy the oldest ({n})',
  'ad.suivi.rlFriseAncienneCopierNDelai': 'Copy the oldest ({n}) · {delai}',
  'ad.suivi.rlFriseAncienneCopierCount':
    'The slice keeps {n} screen(s) still to close on both sides.',
  'ad.suivi.rlFriseExtremesCopier': 'Copy both extremes ({n})',
  'ad.suivi.rlFriseExtremesCopierTranches': 'Copy both extremes ({n} slice(s))',
  'ad.suivi.rlFriseExtremesCopierTranchesDelai':
    'Copy both extremes ({n} slice(s)) · the oldest has waited {ecart}',
  'ad.suivi.rlFriseExtremesCopies': 'Two slices copied',
  'ad.suivi.rlFriseExtremesCount':
    'Both slices keep {n} screen(s) still to close on both sides.',
  'ad.suivi.rlFriseExtremesTranchesCount':
    'The button carries {n} slice(s); the screens still to close are counted apart:',
  'ad.suivi.rlFriseOuvertesTriPlan': 'Plan order',
  'ad.suivi.rlFriseOuvertesTriFin': 'End first',
  'ad.suivi.rlFriseOuvertesTriHint':
    'Orders the markers of the slices still open and the slices of the frise itself: in the plan’s order — from the first slice to the last —, or end first, the slice furthest along in the plan at the head. The dated table carries the same order and says so on its head line, with how many slices that order moved. The order stays on this device from one visit to the next.',
  'ad.suivi.rlFriseOuvertesTriGomme': 'Back to plan order',
  'ad.suivi.rlFriseOuvertesTriGommeHint':
    'Clears the open-slice order in one click: the {n} slice(s) it has just put back into the plan’s order — markers, frise slices and the head line of the dated table together — return from the first slice to the last, and the choice starts again from “Plan order”, as on the first opening.',
  'ad.suivi.rlFriseOuvertesTriGommeDepuis':
    'The “End first” order had been held since {depuis}: the eraser thus dates the gesture it undoes.',
  'ad.suivi.rlFriseOuvertesTriPoids': '{n} slice(s) moved',
  'ad.suivi.rlFriseOuvertesTriPoidsNone': 'no slice moved',
  'ad.suivi.rlFriseOuvertesTriPoidsHint':
    'The weight of the ordering, read on the {tranches} slice(s) still open: {n} of them do not fall at the same rank in the plan’s order and in the kept order — “{ordre}”. The count sits beside the two markers, so the sort states its effect before any file is opened.',
  'ad.suivi.rlFriseOuvertesTriPoidsBornes':
    'The kept order opens on {ouvre} and closes on {ferme}.',
  'ad.suivi.rlFriseOuvertesTriPoidsBornesNone':
    'No slice is ranged: the order has no opening or closing to name.',
  'ad.suivi.rlFriseOuvertesTriPoidsEcrans':
    'These {tranches} slice(s) still open keep {ecrans} screen(s) not closed on both sides — the count reads with the ordering, without opening a file.',
  'ad.suivi.rlFriseOuvertesTriPoidsGarde':
    'The slice keeping the most: {tranche} — {n} screen(s) still open on both sides.',
  'ad.suivi.rlFriseLastDeplacee':
    'Moved most recently by the sort · {tranche} · {date}',
  'ad.suivi.rlFriseLastDeplaceeHint':
    'Among the {n} slice(s) the current sort moved, the one whose last gesture is the most recent: {tranche}, moved on {date}. A slice the ordering leaves in place does not read here.',
  'ad.suivi.rlFriseLastDeplaceeNone': 'No slice moved by the current sort',
  'ad.suivi.rlFriseLastDeplaceeNoneHint':
    'The kept order moves no slice: both orders coincide, and the last-gesture line has no recently moved slice to name.',
  'ad.suivi.rlFriseExtremesCopierHint':
    'Puts into the clipboard both extreme slices still open — {ancienne}, moved {delaiAncienne}, and {recente}, moved {delaiRecente} —, each with the date of its last gesture and its ranks still to close: what has been waiting longest and what just moved, in a single sheet.',
  'ad.suivi.rlFriseRecenteCopierN': 'Copy the newest ({n})',
  'ad.suivi.rlFriseRecenteCopierNDelai': 'Copy the newest ({n}) · {delai}',
  'ad.suivi.rlFriseRecenteCopies': 'Slice copied',
  'ad.suivi.rlFriseRecenteCopierHint':
    'Puts into the clipboard the slice still open touched most recently — {tranche}, moved {delai} — with the date of its last gesture and its ranks still to close, missing side included: the counterpart of the oldest, ready to be closed again.',
  'ad.suivi.rlFriseRecenteCopierCount':
    'The slice keeps {n} screen(s) still to close on both sides.',
  'ad.suivi.rlFriseCopyTriAncienne': 'Oldest first',
  'ad.suivi.rlFriseCopyTriRecente': 'Newest first',
  'ad.suivi.rlFriseCopyTriHint':
    'Orders the two copy doors of the head: the slice still open the longest first, or the one touched most recently. The order stays on this device from one visit to the next.',
  'ad.suivi.rlFriseEcartInstant': 'just now',
  'ad.suivi.rlFriseEcartMin': '{n} min',
  'ad.suivi.rlFriseEcartH': '{n} h',
  'ad.suivi.rlFriseEcartJ': '{n} d',
  'ad.suivi.rlFriseBandeReouvertApres': 'Reopened {delai} after its closure',
  'ad.suivi.rlFriseBandeReouvertApresHint':
    'The slice was reopened after being closed: this span reads between the closure of {date} and this reopening — it tells how long the closed state held, not how long ago the slice moved.',
  'ad.suivi.rlFriseOuvertesSensFerme': 'closed',
  'ad.suivi.rlFriseOuvertesSensRouvert': 'reopened',
  'ad.suivi.rlFriseOuvertesSensAucun': 'no gesture',
  'ad.suivi.rlFriseOuvertesSensHint':
    'The direction of the last gesture on each slice still open, named one by one: what a closing left there, or what a reopening handed back. A slice no gesture has touched says so.',
  'ad.suivi.rlFriseBandeLastRest':
    'It left {n} screen(s) still open in this slice.',
  'ad.suivi.rlFriseBandeLastRestNone':
    'It left no screen open in this slice: it was closed on both sides after it.',
  'ad.suivi.rlFriseBandeLastRestUnknown':
    'Screens left open: not recorded for this gesture, which predates this count.',
  'ad.suivi.rlFriseBook': 'Notebook · {n} gesture(s) kept · from {jour} to {recent}',
  'ad.suivi.rlFriseBookHint':
    'What “Forget the gestures” would take away: {n} slice gesture(s) on this device, from the oldest — {jour} — to the newest — {recent}. The ticked boxes themselves stay.',
  'ad.suivi.rlFriseForget': 'Forget the gestures',
  'ad.suivi.rlFriseForgetConfirm': 'Confirm the forget',
  'ad.suivi.rlFriseForgetHint':
    'Clears this device’s slice-gesture notebook: the CSV sheet starts from a blank notebook, and the frise head no longer recalls a last gesture. Ticked boxes stay; a second click confirms.',
};

export const relectureDict = { fr, ar, en };