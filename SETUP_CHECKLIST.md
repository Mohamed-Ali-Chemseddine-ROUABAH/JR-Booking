# JR Booking Pro - Setup Checklist / Liste de configuration

*This document tracks the required manual configuration steps. Until every item is checked off `[x]`, the project is in a "Setup Pending" state.*
*Ce document suit les étapes de configuration manuelle requises. Tant que chaque élément n'est pas coché `[x]`, le projet est dans un état "Configuration en attente".*

## Phase 0: Human Environment Setup / Configuration de l'environnement

- [x] **1. Créez un projet Firebase sur console.firebase.google.com et activez l'authentification par e-mail/mot de passe. / 1. Create a Firebase project at console.firebase.google.com and enable email/password authentication.** (Guide: https://firebase.google.com/docs/auth/web/password-auth)
- [x] **2. Activez Cloud Firestore et Firebase Storage dans la console. / 2. Enable Cloud Firestore and Firebase Storage in the console.**
- [x] **3. Activez Firebase Hosting. / 3. Enable Firebase Hosting.**
- [x] **4. Mettez à niveau le projet vers le plan Blaze (paiement à l'usage). / 4. Upgrade the project to the Blaze (pay-as-you-go) plan.** *(Requis pour les fonctions réseau sortantes / Required for outbound network functions).*
- [x] **5. Installez la CLI Firebase localement (`npm install -g firebase-tools`) et connectez-vous (`firebase login`). / 5. Install the Firebase CLI locally and log in.**
- [x] **6. Créez `.env.example` et ce fichier de suivi. / 6. Create `.env.example` and this tracking file.**

## Phase 2: Seeding a Test Professional / Création d'un professionnel de test

- [ ] **7. Créez un compte professionnel de test via la console Firebase (Authentication) pour le développement initial. / 7. Seed one test professional account via the Firebase console (Authentication) for early development.** *(À faire lors de la Phase 2 / To be done during Phase 2).*

## Phase 3: Extensions & OAuth (To be completed later / À compléter plus tard)

- [ ] **8. Installez et configurez l'extension "Trigger Email" avec un compte Gmail d'envoi. / 8. Install and configure the "Trigger Email" extension with a Gmail sending account.**
- [ ] **9. Configurez un client OAuth Google Cloud pour la synchronisation du calendrier. / 9. Set up a Google Cloud OAuth client for Calendar sync.** (Guide: https://developers.google.com/workspace/guides/create-credentials)

## Admin Login Reference / Référence de connexion administrateur
- **Admin Login Token (Filename) / Jeton de connexion administrateur (Nom de fichier):** `admin-<unlisted-token>.html` (À définir lors du déploiement. Renseigné dans `.env` / To be defined at deployment. Recorded in `.env`).

