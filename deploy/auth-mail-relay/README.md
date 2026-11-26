# Relais SMTP Auth (mise en place non terminée)

Ce relais reçoit les messages Auth par SMTP avec STARTTLS et authentification,
puis transmet leur contenu à l'API Brevo. Il ne modifie pas Postfix. Seul
`noreply@paperatlas.net` est accepté comme expéditeur. Les pièces jointes sont
refusées, ainsi que les messages de plus de 256 Kio.

Avant de basculer Supabase, vérifier depuis l'extérieur le port 2525, le
certificat de `paperatlas.net`, l'authentification, les restrictions IP Brevo et
la réception réelle des différents messages Auth. Garder les paramètres SMTP
existants pour pouvoir revenir en arrière. Un délai dépassé après l'envoi à
Brevo est ambigu : un nouvel essai peut produire un doublon.

Sur Windows, `create-secret.ps1` demande la clé API Brevo en saisie masquée,
crée un secret Kubernetes et affiche une seule fois un mot de passe SMTP aléatoire.
Ne pas partager ces valeurs dans le chat. Le secret doit être protégé comme tout
autre secret Kubernetes ; son accès dépend des droits d'administration du cluster.

Tests : `npm ci` puis `npm test` dans ce répertoire.
