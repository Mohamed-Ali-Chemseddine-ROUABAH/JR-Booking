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

### Planned lifecycle contract - Public professional application / Contrat de cycle de vie planifie

- **Required behavior / Comportement requis:** an anonymous visitor can submit a professional application without an existing login; email verification precedes admin review; approval precedes professional provisioning; password setup follows approval.
- **Forbidden shortcut / Raccourci interdit:** do not redirect a new applicant to login before accepting the initial application.
- **Required states / Etats requis:** `awaiting-email-verification` -> `pending-review` -> `approved-awaiting-password` -> `completed`, with `rejected` and `expired` alternatives.
- **Required privacy / Confidentialite requise:** verification documents, token hashes, review notes, and provisioning metadata remain unavailable to anonymous visitors and applicants except for a safe status response.
- **Required email events / Emails requis:** verification link after submission; approval plus one-time password setup link after admin approval; rejection or expiry notice where policy permits.
- **Email prerequisite / Prerequis email:** Setup Checklist item 10 must be `Pass` before delivery can be marked verified. Before that gate, tests may verify only that a server-side `mail/{messageId}` queue document was created and that the UI reports the message as queued, never delivered.

### Planned communication and email boundary / Limite communication et email planifiee

- **Platform email / Email plateforme:** Trigger Email sends from one administrator-configured sender for verification, approval, password setup, booking, and security messages.
- **Professional-client messages / Messages professionnel-client:** messages are stored in an authorized booking thread; email is an optional notification with a safe link, not a second private Gmail connection.
- **Forbidden design / Conception interdite:** professionals must never paste a Gmail password, SMTP credential, or OAuth code into the website.
- **Required states / Etats requis:** `message saved` -> `email queued` -> `email sent` or `email failed`; a failed email does not erase the message.
- **Human check / Test humain:** verify one platform email and one authorized booking-message notification with the configured sandbox mailbox; verify that unrelated users cannot read either the thread or private delivery data.

### Planned reservation identity and access slice / Liaison identite reservation planifiee

- **Required behavior / Comportement requis:** professionals can add notification emails and explicit roles; verified clients can claim only identified bookings; recurring modifications require an explicit scope; history sharing requires consent from both verified accounts.
- **Forbidden behavior / Comportement interdit:** no automatic account fusion, no access based on an email string alone, no 3- or 4-digit PIN as the sole credential, and no deletion of history when a contact is removed or a relationship is revoked.
- **Data and rules / Donnees et regles:** booking contact array, nullable `clientId`, `serviceRecipientUid`, `seriesId`, `seriesScope`, `clientRelationships`, notification preferences, server claim tokens, and audit events. Contact emails are not authorization fields.
- **Implementation order / Ordre d'implementation:** additional contacts -> verified booking claim -> series-scope modification -> mutual history relationship -> optional email-link sign-in.
- **Human result / Resultat humain:** `Pending`

### Phase 13 - Email-first professional onboarding / Demande professionnelle email-first

- **Mockup reference / Reference mockup:** `Devenir prestataire`, application form, verification-email landing page, admin application review, and password setup after approval.
- **Production owner / Responsable production:** `public/request-professional.html`, `public/js/request-professional/request-form.js`, `public/verify-professional.html`, `public/js/admin/admin-dashboard.js`, `functions/index.js`, `firestore.rules`, `storage.rules`, and Firebase Trigger Email extension.
- **Data and rules / Donnees et regles:** `professionalRequests/{applicationId}`, private application-scoped Storage file, `professionalRequestEvents`, `mail`, Auth claims and `proProfiles/{uid}` after approval. Anonymous submission is handled by the trusted HTTPS endpoint; the browser cannot write application or mail documents directly.
- **Feature flag / Feature toggle:** `emailFirstProfessionalApplication`, off until human verification.
- **Build check / Auto-verification:** deployed submission and verification endpoints respond; Functions and browser syntax checks pass; the Trigger Email extension is active at version `0.2.10`; deployment does not include local environment files.
- **Human steps / Etapes humaines:**
  1. Ouvrez la demande depuis la page d'accueil sans vous connecter, remplissez le formulaire et envoyez un PDF de test. / Open the application from the landing page while signed out, complete the form, and send a test PDF.
  2. Vérifiez le message de confirmation, la réception de l'email de vérification et le passage à `pending-review`. / Verify the confirmation, receipt of the verification email, and transition to `pending-review`.
  3. Connectez-vous comme administrateur, approuvez la demande, puis vérifiez l'email de création du mot de passe et l'accès professionnel. / Sign in as an administrator, approve the request, then verify the password-setup email and professional access.
- **Responsive check / Verification responsive:** desktop 1440 px; mobile 375 px; form and upload status remain readable without horizontal overflow.
- **Privacy check / Verification confidentialite:** anonymous visitors can submit but cannot read applications, files, tokens, mail documents, or admin review data; only the admin sees the verified application.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** Implementation deployed 2026-09-10; Trigger Email active; real mailbox delivery and full approval/password setup remain to be verified.

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
- [x] **Public profile and client booking request slice:** `profile.html` loads visible `publicProfiles` fields and anonymous `busySlots`, landing search results link to profiles, and authenticated clients can create pending bookings with their own `clientId`.
- [x] **Phase 10 payment-info slice:** professional settings now include a private payment popup for RIB details, bank-transfer/Wero toggles, vetted-bank selections, custom payment links, and rate per time unit, persisted under `proProfiles.paymentInfo`.
- [x] **Phase 10 movement-settings slice:** professional settings now include online/movement toggles, a private address, Leaflet map/geocoding action, transportation visibility, and distance-band fee rows persisted under `proProfiles.movementInfo`.
- [x] **Phase 10 client-address prerequisite:** client profile settings now persist a private movement address under `clientAccounts/{clientId}.address`, ready for booking-scoped movement pricing.
- [x] **Phase 10 booking-scoped movement quote:** client-created bookings carry the client's own address, the professional calculates route distance/travel time and the matching zone, and only the resulting `movementQuote` is saved to the booking and displayed to the involved client. AI browser smoke test passed with a 4.3 km route and 5 € surcharge; human confirmation remains required.
- [x] **Client current-week schedule:** the client dashboard now renders a read-only seven-day calendar from the client's authorized bookings; the verified booking appears on its scheduled day and time alongside the sidebar status view.
- [x] **Phase 10 client payment-context implementation:** the client navbar now selects an active booking and renders only its sanitized payment options, balance, duration, and external payment link; payment context is written to the booking by the involved professional.
- [x] **Phase 9b client professional search, lock, and favorites:** a search bar above "Mes réservations" finds professionals by name, locks one professional's `busySlots` onto the client's own calendar (unlocking clears it), and saves/removes professionals from a persistent favorites list on `clientAccounts.savedProfessionals`. AI browser smoke test passed against local emulators; human confirmation remains required.
- [ ] **Human phase sign-off:** Phase 2, Phase 4, and Phase 5 entries remain `Pending` until a human tester records `Pass`.
- [ ] **Next implementation slice:** Authenticated end-to-end movement verification, followed by the remaining Phase 10 client payment-context surface, then human sign-off on the new Phase 9b client professional search/lock/favorites slice.

### Phase 14 - Google Calendar event import / Import des evenements Google Calendar

- **Mockup reference / Reference mockup:** professional schedule, calendar synchronization control, ghost/solid imported-event display.
- **Production owner / Responsable production:** `functions/index.js`, `public/js/schedule/schedule-gcal-sync.js`, `public/js/schedule/schedule-render.js`, `public/js/pro-dashboard/pro-dashboard.js`, `public/assets/css/pro-dashboard.css`.
- **Data and rules / Donnees et regles:** server-only `gcalTokens/{proId}`; `proProfiles/{proId}.calendarSettings`; Google Calendar primary events returned through the authenticated callable only.
- **Feature flag / Feature toggle:** `googleCalendarEventImport`, off until human verification.
- **Build check / Auto-verification:** Functions and browser modules pass `node --check`; callable validates a 1-31 day range, refreshes the token server-side, returns sanitized events, and the current seven-day professional schedule renders imported events as unavailable slots without exposing tokens.
- **Human steps / Etapes humaines:**
  1. Connectez un compte Google de test depuis Synchronisation calendrier. / Connect a sandbox Google account from Calendar synchronization.
  2. Creez un evenement dans le calendrier principal pendant les sept prochains jours, puis rechargez le tableau professionnel. / Create an event in the primary calendar during the next seven days, then reload the professional dashboard.
  3. Verifiez que le creneau est indisponible, que le mode fantome reste en lecture seule et qu'aucun jeton OAuth n'apparait dans le navigateur. / Verify the slot is unavailable, ghost mode remains read-only, and no OAuth token appears in the browser.
- **Responsive check / Verification responsive:** desktop 1440 px; mobile 375 px; imported labels must remain inside schedule cells without horizontal overflow.
- **Privacy check / Verification confidentialite:** only the owning professional can invoke sync; clients and anonymous users never read `gcalTokens` or imported event details.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:**

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

### Phase 9b - Client Professional Search, Lock, and Favorites / Recherche, verrouillage et favoris professionnels cote client

- **Mockup reference / Reference mockup:** none in the original mockup; extends the Phase 9 client dashboard bookings/schedule surface and reuses the anonymous `Occupé` schedule blocks pattern from the public profile view.
- **Production owner / Responsable production:** `public/client-dashboard.html`, `public/js/client-dashboard/client-professional-search.js` (planned), `public/js/client-dashboard/client-dashboard.js`, `public/js/client-dashboard/client-schedule.js`, `public/js/search/search-professional.js`, `public/js/core/strings-fr.js`, `public/assets/css/client-dashboard.css`.
- **Data and rules / Donnees et regles:** reads `publicProfiles` and `busySlots/{proId}/slots` (already anonymous-readable); reads/writes `clientAccounts/{clientId}.savedProfessionals` (already owner-only writable). No `firestore.rules` change.
- **Feature flag / Feature toggle:** none planned yet; reuses the existing authenticated client-dashboard gate.
- **Build check / Auto-verification:** `node --check` passes for all new/changed modules (`client-professional-search.js`, `client-dashboard.js`, `client-schedule.js`, `strings-fr.js`); architecture docs updated.
- **Human steps / Etapes humaines:**
  1. Recherchez un professionnel par son nom au-dessus de "Mes reservations"; survolez son nom pour verifier que son identifiant s'affiche avant toute action. / Search for a professional by name above "Mes reservations"; hover their name to verify their identifier shows before any action.
  2. Selectionnez un resultat pour verrouiller son planning sur le calendrier du client, puis choisissez un autre professionnel pour verifier qu'un seul planning verrouille s'affiche a la fois. / Select a result to lock its schedule onto the client's calendar, then choose a different professional to verify only one locked schedule shows at a time.
  3. Deverrouillez le professionnel et verifiez que ses creneaux disparaissent immediatement. / Unlock the professional and verify their slots disappear immediately.
  4. Cliquez le coeur pour ajouter le professionnel verrouille aux favoris; verifiez que le coeur devient plein et rouge et que le planning reste verrouille sans changement. / Click the heart to favorite the locked professional; verify the heart becomes filled and red and the locked schedule is undisturbed.
  5. Rechargez la page et verifiez que le professionnel favori reste disponible en un clic; cliquez le coeur a nouveau pour le retirer des favoris. / Reload the page and verify the favorited professional remains available in one click; click the heart again to unfavorite it.
- **Responsive check / Verification responsive:** desktop width 1440 px; mobile width 375 px.
- **Privacy check / Verification confidentialite:** the client sees only the same anonymous unavailable time ranges already exposed by the public profile view; no other client's identity or booking detail is exposed.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-09 - Implemented and AI authenticated browser smoke test passed against local emulators (search matched a seeded professional, lock rendered the seeded busy slot as "Indisponible" on the correct day/hour, unlock cleared it immediately, saving/removing a favorite persisted correctly across a page reload). Human confirmation remains required. Fixed a follow-up bug found by the human: locking a professional who was not also saved as a favorite left no way to unlock (only the favorites chip toggled lock state); added a persistent "Planning verrouille" banner with its own "Deverrouiller" button, shown whenever a professional is locked regardless of favorites, and re-verified unlock works from it. Redesigned per human feedback: replaced the banner with a small chip/bubble merged into the favorited-professionals row (lock icon, active color); replaced the favorites list's remove ("x") control with a heart toggle (empty outline vs filled red) fully independent of lock state; added a hover tooltip showing the professional's `idTag` both in search results and in the chip row. Re-verified live: id tooltip shows before any action, heart favorite/unfavorite does not disturb the locked chip's position or lock state, unlock still works by clicking the chip body. Extended smoke test to three seeded professionals (Camille Rousseau, Sofia Martins, Yanis Belkacem) with distinct busy slots on the same day: search returned all three with distinct id tooltips; favorited all three; locking each in turn correctly showed only that professional's own busy slot and lock icon, with no cross-professional overlay or state leakage; unlocking cleared the overlay while leaving the favorites row untouched; all three favorites persisted together across a reload. Fixed a visual bug found by the human via screenshot comparison: the heart icon's custom path rendered as an indistinct blob at 12px (notch between the two lobes not visible), and a CSS specificity bug (`.professional-chip button { color: inherit }` outranking `.professional-chip-heart`'s intended muted color) made the unfavorited heart's color unreliable; replaced the path with a standard symmetric heart glyph at 14px and raised the heart-color rules' specificity so both empty-outline and filled-red states render crisply and reliably; lock icon confirmed to already render only on the actually-locked chip (verified across all three professionals), not "always present".
