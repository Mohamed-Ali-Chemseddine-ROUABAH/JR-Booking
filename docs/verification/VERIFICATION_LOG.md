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
