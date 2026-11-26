# PaperAtlas mobile

Application Android et iOS indépendante du site, développée avec Expo et React Native.

Depuis ce dossier :

```powershell
npm ci
Copy-Item .env.example .env.local
```

Dans `.env.local`, configurez `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` avec les valeurs publiques du projet Supabase PaperAtlas. Ces valeurs sont intégrées à l’application : n’utilisez jamais une clé `service_role` ou une clé secrète.

```powershell
npm start
npm run type-check
npm test
npm run build
```

Utilisez Expo Go compatible avec le SDK du projet ou un build de développement. `npm run android` ouvre l’émulateur Android s’il est installé. Le simulateur iOS nécessite macOS ; depuis Windows, utilisez un iPhone compatible pour la prévisualisation. `npm run build` valide l’export des bundles, mais ne génère pas d’APK ni d’IPA signé.

L’identifiant du projet Expo existant est configuré dans [app.json](./app.json). Pour vérifier le rattachement depuis ce dossier, connectez le CLI à un compte qui a accès au projet, puis affichez les informations du projet :

```powershell
npx eas-cli@latest login
npx eas-cli@latest project:info
```

L’accueil utilise une version allégée de la cinématique du site, intégrée à l’application. Elle se lance automatiquement, en boucle et sans son. Le bouton **Pause** arrête le mouvement ; l’image fixe reste visible pendant le chargement, en cas d’erreur ou si la réduction des animations est activée sur l’appareil.

L’annuaire affiche uniquement les membres professionnels publics (`paperatlas_membres`). La recherche par nom ou métier et les filtres par pays et région sont communs aux vues **Liste** et **Carte**. Les profils membres ne renseignent pas de type d’établissement.

Les repères de l’annuaire indiquent le centre d’une wilaya algérienne connue, pas l’adresse exacte d’un membre. Les membres sans wilaya reconnue restent visibles dans la liste. La carte nécessite une connexion Internet (Leaflet et OpenStreetMap). Pour synchroniser les pays et les centres de wilaya depuis le site, exécutez `npm run sync-directory` depuis ce dossier.

Les pages **Annonces** et **Emplois** s’ouvrent en vue **Liste**. Le sélecteur **Liste / Carte**, comme dans l’annuaire, permet de changer de vue sans perdre les filtres (rubrique ou contrat, pays et région). Les repères sont approximatifs et les publications sans wilaya reconnue restent visibles dans la liste.

L’application permet de se connecter avec un compte existant, puis de lire et répondre dans ses conversations. Le premier test de messagerie doit être réalisé avec deux comptes de test et une conversation existante.

Les notifications push ne sont pas activées. Il reste à configurer les identifiants Apple et Firebase, à enregistrer les appareils par compte et à ajouter un envoi serveur à la réception d’un message. Avant la diffusion, validez ces parcours sur de vrais appareils et remplacez les visuels Expo provisoires.

## Bundle Android pour Google Play

Avec le JDK et le SDK Android configurés, lancez `npx expo prebuild --platform android --no-install` depuis ce dossier. Si le projet Android a été régénéré, retirez `signingConfig signingConfigs.debug` de `buildTypes.release` dans `android/app/build.gradle` (gardez la signature du bloc `debug`). Lancez ensuite `.\gradlew.bat :app:bundleRelease` depuis `android`. Le bundle non signé est généré dans `android/app/build/outputs/bundle/release/`.

Signez ce bundle avec `jarsigner` et la clé d’import Google Play, puis vérifiez la signature et lancez `bundletool validate` sur le fichier signé. Ne téléversez jamais un bundle signé avec la clé de débogage. Conservez la clé d’import et son mot de passe hors du dépôt, avec une sauvegarde protégée utilisable sur un autre ordinateur. Incrémentez `android.versionCode` dans `app.json` avant chaque nouvelle soumission, puis régénérez le projet Android.
