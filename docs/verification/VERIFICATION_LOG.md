# Verification Log / Journal de verification

## Rules / Regles

This file is the human verification gate defined in Part 12 of `docs/requirements/MASTER_SPECIFICATION.md`. The AI or developer prepares each entry; the human tester records the final Pass, Fail, or Notes result. A subsequent phase must not begin until the previous required entry is marked Pass by the human.

Ce fichier est le gate de verification humaine defini dans la Partie 12 de `docs/requirements/MASTER_SPECIFICATION.md`. L'IA ou le developpeur prepare chaque entree; le testeur humain inscrit le resultat final Pass, Fail ou Notes. Une phase suivante ne doit pas commencer tant que l'entree requise precedente n'est pas marquee Pass par l'humain.

Before extracting a frontend feature, read `docs/mockups/IMPLEMENTATION_REFERENCE.md`. Each entry must name the matching mockup interaction so visual and behavioral parity can be tested deliberately.

## Entry Template / Modele d'entree

### Phase [number] - [feature] / [fonction]

- **Mockup reference / Reference mockup:** [screen, menu, modal, or interaction]
- **Production owner / Responsable production:** [HTML page and JS/CSS modules]
- **Data and rules / Donnees et regles:** [Firestore/Storage paths, security-rule cases, or `none` for purely visual work]
- **Feature flag / Feature toggle:** [name and initial state]
- **Build check / Auto-verification:** page loads, console clean, relevant unit/emulator tests pass, architecture documentation updated.
- **Human steps / Etapes humaines:**
  1. [French step] / [English step]
  2. [French step] / [English step]
  3. [French expected result] / [English expected result]
- **Responsive check / Verification responsive:** desktop width [value]; mobile width [value].
- **Privacy check / Verification confidentialite:** [anonymous/client/pro/delegate/admin result].
- **Human result / Resultat humain:** `Pending | Pass | Fail | Notes`
- **Date, tester, notes / Date, testeur, notes:**

## Mockup Parity Checklist / Checklist de parite mockup

Use this checklist when a production module replaces a mockup behavior. / Utilisez cette checklist lorsqu'un module de production remplace un comportement du mockup.

- [ ] Public and unrelated-client bookings show only anonymous unavailable time ranges.
- [ ] A client sees only their own booking details and authorized payment data.
- [ ] A professional sees bookings for only the active profile and can use schedule/sidebar actions.
- [ ] A delegate sees only granted booking-management actions.
- [ ] A context menu, modal, dropdown, or mobile navigation control closes cleanly and does not overlap interactive UI.
- [ ] A form has clear validation and autosave/saved feedback.
- [ ] A reversible status or configuration change can be undone where the specification requires it.
- [ ] A destructive flow remains open with a readable error until typed confirmation succeeds.
- [ ] Desktop and mobile layouts have no horizontal overflow and preserve the intended schedule/sidebar order.
- [ ] All production UI copy is loaded from its French string module.

## Preparation Entries / Entrees de preparation

### Mockup Extraction Preparation - Shared UI Foundation / Fondations UI partagees

- **Mockup reference / Reference mockup:** glass panels, dropdowns, responsive mobile navbar, modal, toast, autosave state, undo bar, typed confirmation.
- **Production owner / Responsable production:** `public/assets/css/base.css`, `public/assets/css/glass-theme.css`, `public/js/core/utils.js`, `public/js/core/strings-fr.js`, `public/js/shared/notifications.js`.
- **Data and rules / Donnees et regles:** none initially; no production module imports mock data.
- **Feature flag / Feature toggle:** `sharedUiFoundation`, off until verified.
- **Human steps / Etapes humaines:**
  1. Ouvrez le frontend local sur desktop puis mobile. / Open the local frontend on desktop then mobile.
  2. Ouvrez et fermez un menu, une modale et la navigation mobile. / Open and close a dropdown, modal, and mobile navigation.
  3. Verifiez qu'aucun element ne deborde ou ne masque un controle. / Verify that no element overflows or hides a control.
- **Responsive check / Verification responsive:** 1440 px and 375 px.
- **Privacy check / Verification confidentialite:** none; shared components must not display data themselves.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:**

## Completed Implementation Slices / Tranches d'implementation terminees

- [x] **Shared setup and auth checks:** Java 25 verified, emulator rules smoke check passed, professional Auth emulator seed passed, login/reset/client registration/professional redirect checked locally.
- [x] **Professional dashboard shell:** protected dashboard, responsive sidebar collapse, settings dropdown stacking fix, empty schedule shell, and mobile overflow check.
- [x] **Working-time configuration:** weekday hours, recurring breaks, timezone, one-to-seven-day setting, repeatable absences, date exceptions, Firestore persistence, and local save/read-back.
- [x] **Date-aware schedule:** date headers, previous/today/next navigation, one/three/seven-day views, working-hour availability, break/absence/exception rendering.
- [x] **Professional booking creation:** double-click available slot, pending Firestore booking, client contact fields, time validation, schedule refresh, and booking card rendering.
- [x] **Booking operations:** sidebar cards, schedule selection, accept/reject/done/no-show transitions, French confirmation, undo notification, functional status filters, filter persistence, and booking modification modal.
- [x] **Mockup context interaction:** right-click schedule booking menu with status actions, edit action, viewport clamping, and responsive visual checks.
- [x] **Drag-to-select schedule booking preview:** pointer drag across contiguous available hours in one day column, live preview highlight, overlap handling that stops the range at the first booked or unavailable hour, and multi-hour booking creation prefilled from the drag range.
- [x] **Personal information, categories, experience, and public-profile mirror (Phase 6):** identity fields, dashboard colors with reset, links, CV-style experience entries, up to ten searchable categories, per-field public-visibility toggles, `proProfiles.personalInfo` persistence, and the `publicProfiles` mirror write (also fixed a `firestore.rules` gap that blocked writing the required `owners` field on `publicProfiles`).
- [x] **Client dashboard shell (Phase 9):** `client-dashboard.html`, navbar with account settings dropdown and profile editor, bookings sidebar with pending/accepted/rejected filters, professional-made-booking confirmation marking, accept/cancel/request-change actions. No production flow yet sets a real `clientId` on a booking (professional booking creation is still guest-only and there is no client-facing booking flow), so the sidebar shows its empty state until those land.
- [ ] **Human phase sign-off:** Phase 2, Phase 4, and Phase 5 entries remain `Pending` until a human tester records `Pass`.
- [ ] **Next implementation slice:** Public profile page (`profile.html`, `profile-view.js`) — anonymous read-only schedule view, visible-field rendering from the `publicProfiles` mirror, and the client-facing booking request flow, since that is what will actually populate a real `clientId` on a booking and let the Phase 9 client dashboard show live data.

### Phase 5 - Working-time configuration / Configuration du temps de travail

- **Mockup reference / Reference mockup:** pro settings menu, working-hours popup, weekday selection, recurring break, date exception, and absence period controls.
- **Production owner / Responsable production:** `public/js/pro-dashboard/working-hours.js`, `public/js/pro-dashboard/pro-dashboard.js`, `public/js/schedule/schedule-render.js`, `public/assets/css/pro-dashboard.css`, `public/js/core/strings-fr.js`.
- **Data and rules / Donnees et regles:** `proProfiles/{proId}.workingHours`; owner update/create rule requires the authenticated UID in `owners`.
- **Feature flag / Feature toggle:** `proBookingOperations`, off until the phase is verified.
- **Build check / Auto-verification:** `node --check` passes for changed modules; local Firestore save/read-back passes for weekday hours, day count, timezone, recurring break, absence period, and date exception; schedule renders date headers, navigates previous/today/next weeks, applies date-specific absences and exceptions, marks outside-hours and recurring-break cells `Indisponible`, and switches between one, three, and seven visible days.
- **Human steps / Etapes humaines:**
  1. Ouvrez `pro-dashboard.html` avec le compte professionnel de test. / Open `pro-dashboard.html` with the test professional account.
  2. Ouvrez Reglages puis Horaires et absences; ajoutez une absence et une exception de calendrier. / Open Settings then Working hours and absences; add an absence and a calendar exception.
  3. Enregistrez, fermez puis rouvrez la fenetre; verifiez que les valeurs sont conservees et que le planning affiche le nombre de jours choisi. / Save, close, and reopen the dialog; verify values persist and the schedule shows the selected day count.
- **Responsive check / Verification responsive:** desktop 1440 px; mobile 375 px; confirm the modal fields remain usable and the schedule has no horizontal overflow beyond its intended scroll area.
- **Privacy check / Verification confidentialite:** only the owning professional may read or update `proProfiles/{proId}`; absence reasons remain private until a later authorized public schedule flow is implemented.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-07 - AI browser smoke test passed; human confirmation required.

### Mockup Extraction Preparation - Public Discovery and Anonymous Schedule / Recherche publique et planning anonyme

- **Mockup reference / Reference mockup:** landing search, results, profile public, `Occupé` schedule blocks.
- **Production owner / Responsable production:** `index.html`, `profile.html`, `category.html`, `public/js/search/search-professional.js`, `public/js/search/search-category.js`, `public/js/profile-public/profile-view.js`, `public/js/schedule/schedule-render.js`.
- **Data and rules / Donnees et regles:** `publicProfiles`, `busySlots`; anonymous read permits only public fields and start/end/status.
- **Feature flag / Feature toggle:** `publicSearchAndSchedule`, off until verified.
- **Human steps / Etapes humaines:**
  1. Recherchez un nom et une categorie. / Search for a name and category.
  2. Ouvrez un profil et verifiez les identifiants en cas de noms similaires. / Open a profile and verify IDs when names are similar.
  3. Verifiez que les creneaux pris n'affichent jamais un nom de client. / Verify occupied slots never show a client name.
- **Responsive check / Verification responsive:** 1440 px and 375 px, 1/3/7-day schedule views.
- **Privacy check / Verification confidentialite:** anonymous user reads only `publicProfiles` and `busySlots` safe fields.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:**

### Mockup Extraction Preparation - Professional Booking Operations / Operations de reservation professionnel

- **Mockup reference / Reference mockup:** dashboard, sidebar resize/collapse, booking edit, done/no-show, context menu, batch actions, messages, links and private notes.
- **Production owner / Responsable production:** `pro-dashboard.html`, `schedule/*.js`, `sidebar/*.js`, `pro-dashboard/quick-replies.js`.
- **Data and rules / Donnees et regles:** `bookings`, `proClientRecords`, `waitlistEntries`; pro owner/delegate permission checks and audit-log trigger.
- **Feature flag / Feature toggle:** `proBookingOperations`, off until verified.
- **Human steps / Etapes humaines:**
  1. Ouvrez une reservation depuis la sidebar et le planning. / Open a booking from the sidebar and schedule.
  2. Modifiez date, debut, fin, service et portee de recurrence. / Modify date, start, end, service, and recurrence scope.
  3. Marquez une reservation terminee puis no-show; verifiez l'undo et les statistiques. / Mark a booking done then no-show; verify undo and statistics.
  4. Essayez les actions groupees et le menu contextuel. / Try batch actions and the context menu.
- **Responsive check / Verification responsive:** 1440 px and 375 px with sidebar expanded/collapsed.
- **Privacy check / Verification confidentialite:** active pro sees owned profile data only; delegate sees only permitted actions.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:**

## Roadmap Phase Entries / Entrees des phases roadmap

### Phase 2 - Authentication Core / Noyau d'authentification

- **Mockup reference / Reference mockup:** login role preview, client registration form, password-reset feedback.
- **Production owner / Responsable production:** `public/login.html`, `public/register-client.html`, `public/js/core/auth-guard.js`, `public/js/core/firebase-init.js`, `public/js/core/strings-fr.js`.
- **Data and rules / Donnees et regles:** Firebase Authentication only; no Firestore or Storage writes in this phase.
- **Feature flag / Feature toggle:** `authCore`, off until verified.
- **Build check / Auto-verification:** `node --check` passes for all production JavaScript modules touched in Phase 2.
- **Human steps / Etapes humaines:**
  1. Ouvrez `login.html` et verifiez que les choix Professionnel et Client apparaissent. / Open `login.html` and verify the Professional and Client choices appear.
  2. Creez le compte professionnel de test dans la console Firebase ou lancez `node tests\seed-test-professional.js` avec l'emulateur Auth. / Create the test professional account in the Firebase console or run `node tests\seed-test-professional.js` with the Auth emulator.
  3. Demandez un lien de reinitialisation avec une adresse courriel de test. / Request a reset link with a test email address.
  4. Ouvrez `register-client.html`, creez un compte client avec un mot de passe de 6 caracteres ou plus, puis confirmez que le message de succes apparait. / Open `register-client.html`, create a client account with a password of 6 or more characters, then confirm the success message appears.
  5. Connectez-vous avec le compte professionnel de test cree dans Firebase Authentication. / Sign in with the test professional account created in Firebase Authentication.
- **Responsive check / Verification responsive:** desktop width 1440 px; mobile width 375 px.
- **Privacy check / Verification confidentialite:** anonymous users can only access auth forms; protected dashboard access and professional role claims will use `auth-guard.js` when dashboards are introduced.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:**

### Phase 3 - Security and Infrastructure Plumbing / Securite et infrastructure

- **Mockup reference / Reference mockup:** none for rules; Calendar OAuth remains a scaffold only until Phase 14.
- **Production owner / Responsable production:** `firestore.rules`, `storage.rules`, `functions/index.js`, `functions/package.json`, `docs/database_schema.md`.
- **Data and rules / Donnees et regles:** `publicProfiles`, `busySlots`, `proProfiles`, `clientAccounts`, `bookings`, `mail`, `logs`, `gcalTokens`, `platformConfig`, `creationLinks`, `supportTickets`, `dataRequests`, `professionalRequests` Storage path.
- **Feature flag / Feature toggle:** `platformConfig/settings` is available for later feature toggles; no user-facing Phase 3 toggle.
- **Build check / Auto-verification:** Firestore/Storage rules parse in the Firebase emulator once Java is installed; `node --check functions/index.js` passes.
- **Human steps / Etapes humaines:**
  1. Verifiez que `java -version` fonctionne, puis lancez les emulateurs Firestore, Storage et Functions. / Verify that `java -version` works, then start the Firestore, Storage, and Functions emulators.
  2. Verifiez que les regles se chargent sans erreur. / Verify the rules load without errors.
  3. Appelez `/api/calendar/google/callback` en local et confirmez une reponse `501` claire. / Call `/api/calendar/google/callback` locally and confirm a clear `501` response.
- **Responsive check / Verification responsive:** none; infrastructure only.
- **Privacy check / Verification confidentialite:** anonymous read is limited to `publicProfiles` and anonymous-safe `busySlots`; `logs` and `gcalTokens` deny client writes.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-07 - Firestore/Storage rules loaded successfully, Functions emulator confirmed, Calendar OAuth stub responds with expected 501 error.

### Phase 4 - Professional Dashboard Shell / Structure du tableau professionnel

- **Mockup reference / Reference mockup:** pro dashboard navbar, collapsible sidebar, responsive schedule/sidebar order, empty seven-day schedule grid.
- **Production owner / Responsable production:** `public/pro-dashboard.html`, `public/assets/css/pro-dashboard.css`, `public/js/pro-dashboard/pro-dashboard.js`, `public/js/pro-dashboard/navbar-pro.js`, `public/js/sidebar/sidebar-feed.js`, `public/js/schedule/schedule-render.js`.
- **Data and rules / Donnees et regles:** Firebase Authentication role gate only; optional local Auth emulator connection through `window.JR_BOOKING_EMULATORS`; no Firestore or Storage reads/writes in this shell phase.
- **Feature flag / Feature toggle:** `proBookingOperations`, off until booking data operations are implemented.
- **Build check / Auto-verification:** `node --check` passes for all Phase 4 JavaScript modules; page shell loads after professional authentication.
- **Human steps / Etapes humaines:**
  1. Connectez-vous avec un compte professionnel, puis ouvrez `pro-dashboard.html`. / Sign in with a professional account, then open `pro-dashboard.html`.
  2. Ouvrez le menu Reglages et verifiez les sections attendues. / Open the Settings menu and verify the expected sections.
  3. Repliez puis affichez la sidebar; verifiez que le planning reste visible. / Collapse then expand the sidebar; verify the schedule remains visible.
  4. Verifiez que la grille du planning affiche une vue vide sur sept jours sans donnees de client. / Verify the schedule grid shows an empty seven-day view without client data.
- **Responsive check / Verification responsive:** desktop width 1440 px; mobile width 375 px with schedule first and sidebar below.
- **Privacy check / Verification confidentialite:** anonymous users are redirected to login; the shell renders no private booking, client, payment, or message fields.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:**
