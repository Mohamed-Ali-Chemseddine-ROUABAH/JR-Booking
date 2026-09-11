# JR Booking Premium - Setup Checklist / Liste de configuration

*This document tracks the required manual configuration steps. Until every item is checked off `[x]`, the project is in a "Setup Pending" state.*
*Ce document suit les Ã©tapes de configuration manuelle requises. Tant que chaque Ã©lÃ©ment n'est pas cochÃ© `[x]`, le projet est dans un Ã©tat "Configuration en attente".*

**AI execution note / Note d'execution IA:** Follow the token-efficient workflow in `MASTER_SPECIFICATION.md`: read only the files needed for the current checklist item, avoid screenshots and browser inspection unless explicitly requested, run the narrowest available validation, and report the direct local browser URL when visual testing is needed.

## Phase 0: Human Environment Setup / Configuration de l'environnement

- [x] **1. CrÃ©ez un projet Firebase sur console.firebase.google.com et activez l'authentification par e-mail/mot de passe. / 1. Create a Firebase project at console.firebase.google.com and enable email/password authentication.** (Guide: https://firebase.google.com/docs/auth/web/password-auth)
- [x] **2. Activez Cloud Firestore et Firebase Storage dans la console. / 2. Enable Cloud Firestore and Firebase Storage in the console.**
- [x] **3. Activez Firebase Hosting. / 3. Enable Firebase Hosting.**
- [x] **4. Mettez Ã  niveau le projet vers le plan Blaze (paiement Ã  l'usage). / 4. Upgrade the project to the Blaze (pay-as-you-go) plan.** *(Requis pour les fonctions rÃ©seau sortantes / Required for outbound network functions).*
- [x] **5. Installez la CLI Firebase localement (`npm install -g firebase-tools`) et connectez-vous (`firebase login`). / 5. Install the Firebase CLI locally and log in.**
- [x] **5b. Installez Java 21 ou plus recent et verifiez `java -version` pour les emulateurs Firestore/Storage. / 5b. Install Java 21 or newer and verify `java -version` for the Firestore/Storage emulators.** (Guide: https://firebase.google.com/docs/emulator-suite/install_and_configure) - Temurin OpenJDK 25.0.4.1 verified on 2026-09-07.
- [x] **6. CrÃ©ez `.env.example` et ce fichier de suivi. / 6. Create `.env.example` and this tracking file.**
- [x] **7. Copiez `.env.example` vers `.env` et remplissez vos secrets locaux. / 7. Copy `.env.example` to `.env` and fill in your local secrets.**
- [x] **8. Liez le projet local Ã  Firebase via `.firebaserc` (ID: `jr-booking-premium`). / 8. Link the local project to Firebase via `.firebaserc` (ID: `jr-booking-premium`).**

## Phase 2: Seeding a Test Professional / CrÃ©ation d'un professionnel de test

- [x] **9. CrÃ©ez un compte professionnel de test via la console Firebase (Authentication) pour le dÃ©veloppement initial. / 9. Seed one test professional account via the Firebase console (Authentication) for early development.** *(Ã€ faire lors de la Phase 2 / To be done during Phase 2).* Local Auth emulator seed verified on 2026-09-07.
	- Local emulator option / Option emulateur local: `$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"; $env:FIREBASE_PROJECT_ID = "jr-booking-premium"; node tests\seed-test-professional.js`

## Mockup-to-Production Preparation / Preparation mockup vers production

*These gates are not Firebase configuration tasks. They are required before a roadmap phase extracts a workflow from the approved prototype. / Ces gates ne sont pas des taches de configuration Firebase. Elles sont requises avant qu'une phase extraie un flux du prototype approuve.*

- [x] **A. Lisez `docs/requirements/MASTER_SPECIFICATION.md`, `docs/mockups/MASTER_MOCKUP.md` et `docs/mockups/IMPLEMENTATION_REFERENCE.md` avant toute modification frontend. / A. Read `docs/requirements/MASTER_SPECIFICATION.md`, `docs/mockups/MASTER_MOCKUP.md`, and `docs/mockups/IMPLEMENTATION_REFERENCE.md` before any frontend change.** Verified before Phase 5 settings work on 2026-09-07.
- [x] **B. Notez dans `docs/verification/VERIFICATION_LOG.md` le flux mockup extrait, les modules cibles, les collections/rÃ¨gles concernÃ©es et les Ã©tapes de test humain. / B. Record the extracted mockup flow, target modules, collections/rules, and human test steps in `docs/verification/VERIFICATION_LOG.md`.** Phase 5 entry added on 2026-09-07; human result remains pending.
- [ ] **C. Confirmez que le flux respecte la visibilitÃ© par rÃ´le : crÃ©neaux anonymes pour les autres clients, dÃ©tails uniquement pour le professionnel propriÃ©taire, droits limitÃ©s des dÃ©lÃ©guÃ©s. / C. Confirm the flow preserves role visibility: anonymous slots for other clients, details only for the owning professional, limited delegate permissions.**
- [ ] **D. Confirmez que les actions destructives ont une confirmation claire, que les changements rÃ©versibles ont un undo, et que les formulaires affichent leur Ã©tat d'enregistrement. / D. Confirm destructive actions have clear confirmation, reversible changes offer undo, and forms display their saved state.**
- [ ] **E. Testez la paritÃ© responsive du flux aux largeurs desktop et mobile avant de le prÃ©senter Ã  un humain. / E. Test responsive parity for the flow at desktop and mobile widths before handing it to a human.**
- [ ] **F. Validez le plan des identitÃ©s de rÃ©servation avant toute implÃ©mentation. / F. Approve the reservation-identity plan before implementation.** Confirm that additional emails are capped notification contacts only, booking claims use a trusted server boundary and verified email, conflicts require review, recurring edits use separate occurrence documents and a selected scope, history sharing is mutual and revocable, unlink actions are distinct, Firestore allow-lists are updated deliberately, email-link recovery is defined, and client authentication does not use a short PIN as the sole credential.

## Phase 3: Extensions & OAuth (To be completed later / Ã€ complÃ©ter plus tard)

- [ ] **10. Installez et configurez l'extension "Trigger Email" avec un compte Gmail d'envoi. / 10. Install and configure the "Trigger Email" extension with a Gmail sending account.**
	- The extension is installed and active as `firebase/firestore-send-email` version `0.2.10`, using the production `mail` collection and Firestore region `europe-west9`. The checkbox remains open until a human confirms delivery to a real test mailbox from a processed `mail/{messageId}` document.
- [ ] **11. Configurez un client OAuth Google Cloud pour la synchronisation du calendrier. / 11. Set up a Google Cloud OAuth client for Calendar sync.** (Guide: https://developers.google.com/workspace/guides/create-credentials)
- [ ] **12. Définissez et publiez la politique de confidentialité avant la validation OAuth. / 12. Define and publish the privacy policy before OAuth verification.** The final public URL, expected to be `https://jr-booking-premium.web.app/privacy-policy.html`, must not be marked complete until the page exists, is publicly reachable, and accurately describes Firebase Auth, Firestore, Storage, Calendar OAuth, payment-link handling, data retention, and user rights.
- [ ] **13. Définissez et publiez les conditions d'utilisation avant la validation OAuth. / 13. Define and publish the terms of service before OAuth verification.** The final public URL, expected to be `https://jr-booking-premium.web.app/terms.html`, must not be marked complete until the page exists, is publicly reachable, and has been reviewed for the professional/client workflows, payments, cancellations, account restrictions, and platform responsibilities.

## Admin Login Reference / RÃ©fÃ©rence de connexion administrateur
- **Admin Login Token (Filename) / Jeton de connexion administrateur (Nom de fichier):** `admin-<unlisted-token>.html` (Ã€ dÃ©finir lors du dÃ©ploiement. RenseignÃ© dans `.env` / To be defined at deployment. Recorded in `.env`).
