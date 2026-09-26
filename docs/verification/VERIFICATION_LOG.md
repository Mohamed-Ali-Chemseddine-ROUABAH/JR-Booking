# Verification Log / Journal de verification

## Rules / Regles

This file is the canonical implementation checkpoint defined in Part 12 of `docs/requirements/MASTER_SPECIFICATION.md`. The AI records the current status and all available evidence. Human verification is added only when the AI cannot perform the check or when the human explicitly requests a hands-on usability check. A completed feature must not be restarted because a human check is optional or externally blocked.

Ce fichier est le point de reprise canonique defini dans la Partie 12 de `docs/requirements/MASTER_SPECIFICATION.md`. L'IA inscrit le statut actuel et toutes les preuves disponibles. La verification humaine intervient seulement si l'IA ne peut pas effectuer le controle ou si l'humain demande explicitement un controle pratique. Une fonctionnalite terminee ne doit pas etre recommencee parce qu'un controle humain est facultatif ou bloque par un service externe.

`docs/requirements/SETUP_CHECKLIST.md` is the companion visual phase dashboard. Keep its `[x]`, `[~]`, and `[ ]` phase markers synchronized with this log, but keep detailed evidence and blocker decisions here. The checklist is for fast orientation; this file remains the evidence ledger and detailed continuation source. Neither document should invent a competing status or cause verified implementation to be restarted.

Before extracting a frontend feature, read `docs/mockups/IMPLEMENTATION_REFERENCE.md`. Each entry must name the matching mockup interaction so visual and behavioral parity can be tested deliberately.

## Schedule completion gate / Gate de finition des plannings

No schedule batch may be recorded as fully complete until the applicable professional, client, public-profile, and locked-professional paths have been compared with `docs/mockups/MASTER_MOCKUP.md` and `docs/mockups/IMPLEMENTATION_REFERENCE.md`. Evidence must cover desktop and mobile widths, the relevant available/occupied/pending/accepted/unavailable states, date navigation and controls, responsive layout, French labels, timezone rendering, and role-safe privacy. A missing browser or external check may remain an explicit blocker, but the entry must not claim full mockup parity until the check passes.

## AI-owned verification rule / Regle de verification par l'IA

The AI performs every feasible verification itself before asking the human to act. This includes focused and full tests, syntax/diagnostics, emulator and rules validation, security/privacy checks, documentation coverage, and local browser-session checks when the feature needs rendered behavior or layout confirmation. A local browser session may be opened to inspect DOM/accessibility state, interact with the feature, and check responsive behavior. Screenshots are not captured or analyzed by default; use them only when direct browser inspection cannot establish a visual defect or mockup-parity issue without them. Human participation remains limited to genuinely impossible checks such as real mailbox delivery, real OAuth consent, legal decisions, and external-console actions.

## Cost-efficient production rule / Regle de production economique

## Maximum-progress batch protocol / Protocole de production maximale

For every request such as `next`, `continue`, or `more`, select the first unfinished high-value specification phase from `Current project checkpoint` and implement the largest safe coherent batch from that phase. The batch must include every locally required layer for the selected outcome: UI, browser modules, Functions, rules/schema, strings, tests, architecture documentation, and this verification entry where applicable. Do not stop after a plan, a search, styling, wiring, or one file when the selected outcome requires more layers. Continue autonomously through directly dependent requirements and stop only at a genuine external/human-only action, unresolved product/security decision, unavailable dependency, unsafe scope, or exhausted validation context. Optional browser checks are evidence to record, not reasons to stop locally implementable work.

This contract is mandatory under deadline mode: a short request such as `continue` does not authorize a small handoff. It authorizes continued implementation of the selected phase until completion or a genuine blocker. Record the blocker precisely and identify the exact continuation point; never restart completed `[x]` or substantially implemented `[~]` phases without a regression, security issue, changed requirement, or explicit new scope.

Every batch entry should make the following explicit:

- **Selected phase / Phase selection:** the unfinished phase or coherent phase group being completed.
- **Target outcome / Resultat vise:** the complete user or engineering outcome.
- **Required surfaces / Surfaces requises:** UI, backend, rules/schema, strings, tests, docs, and verification.
- **Existing work reused / Travail reutilise:** completed code and contracts not reimplemented.
- **Integrated evidence / Preuves integrees:** focused checks plus the full batch regression/emulator result.
- **Boundary / Limite:** exact blocker, if the phase cannot be completed locally.
- **Next continuation / Continuation:** the next unfinished requirement in the same phase, or the next phase only after the selected phase is complete or genuinely blocked.

Use a **value-driven production batch**: choose the largest safe amount of implementation that best advances the selected unfinished phase while keeping the work understandable and verifiable. A batch should complete the coherent end-to-end phase outcome, not merely one file or one phase fragment. When the outcome touches several surfaces, include the required frontend, trusted backend, rules/schema, tests, and documentation in the same batch. A batch may include the current checkpoint, adjacent roadmap items, architecture improvements, refactors, UI polish, performance work, or enabling infrastructure when the work has a clear user, security, reliability, maintainability, or future-cost benefit.

Do not spend effort on work with no credible product or engineering payoff. Before editing, state the intended outcome, the surfaces required to deliver it, and the cheapest useful proof. Use focused validation for each touched area plus one integrated regression check for the batch. Perform all feasible verification locally, including a browser session when needed; screenshots are a last resort, not the default. Do not reject a worthwhile change merely because it crosses module or phase boundaries, and do not stop at an arbitrary phase boundary when the requested outcome is still incomplete. Split only for a real dependency, security, external-action, requirement, or validation boundary. Record the completed batch, any remaining uncertainty, and any genuinely independent follow-up separately in this log.

Utiliser une **tranche de production guidee par la valeur** : choisir la quantite de travail qui fait le mieux avancer le produit tout en gardant l'ensemble comprehensible et verifiable. Une tranche peut inclure le point de reprise, des elements voisins de la roadmap, des ameliorations d'architecture, des refactorisations, de la finition UI, des optimisations ou une infrastructure facilitatrice lorsqu'il existe un benefice clair pour l'utilisateur, la securite, la fiabilite, la maintenabilite ou le cout futur.

Ne pas depenser d'effort pour un travail sans benefice produit ou technique credible. Avant toute modification, definir le resultat vise et la preuve utile la moins couteuse. Utiliser des validations ciblees lorsqu'elles existent, mais ne pas refuser une modification pertinente parce qu'elle traverse des modules ou des phases. Un travail plus large et coherent est autorise lorsqu'il evite de refaire la preparation, previent la reimplementation, ameliore l'experience ou facilite concretement une exigence ulterieure. Inscrire separement les tranches terminees et les incertitudes restantes dans ce journal.

## Status protocol / Protocole de statut

- `DONE`: implementation, focused AI verification, security/privacy checks, and matching documentation are complete.
- `AI VERIFIED - HUMAN CHECK OPTIONAL`: all checks available to the AI passed; an optional human browser/usability check remains.
- `HUMAN + AI VERIFIED`: AI evidence and the requested human check both passed.
- `BLOCKED - EXTERNAL/HUMAN ACTION REQUIRED`: the remaining check is impossible for the AI; record exactly one human step and do not redo the implementation.

Every entry must include `Status`, `Evidence`, `Remaining blocker`, and `Next implementation slice`. The next implementation slice names the next coherent requirement in the selected phase; it must not be used to justify stopping while the selected phase remains locally implementable. Before starting work, read the current checkpoint and skip every completed or AI-verified feature unless a regression, security issue, or changed requirement explicitly reopens it. At every completion handoff, tell the human what is done, what evidence was collected, what remains blocked, and what coherent batch will be developed and tested next.

**Specification coverage status / Etat de couverture de la specification:** the verified entries below cover individual implementation slices only. They do not mean the entire Master Specification is complete. The consolidated phase-by-phase coverage audit is maintained in the section below; the current product remains partially implemented against the full roadmap.

## Master Specification Coverage / Couverture de la specification

This is the consolidated coverage audit for `docs/requirements/MASTER_SPECIFICATION.md`. Individual `Pass` entries below prove only their named slice; they do not prove that the complete roadmap is finished.

### Current project checkpoint / Point de reprise actuel

- **Last verified date / Derniere verification:** 2026-09-26.
- **Implemented and regression-tested / Implemente et teste:** reservation identity roadmap (contacts, claims, series scopes, history sharing, email-link sign-in); legal acceptance; verified-email-gated client booking and waitlist requests with safe slot continuation; admin command center, creation links, account recovery, multi-profile profiles, lifecycle grace/purge, category oversight, moderation, broadcasts, health aggregates, bulk review, support/data-request queues and replies, client-ban escalation review/enforcement and outcome notifications; Calendar OAuth/watch/webhook/import/refetch/export/reminders; buffer time; services/packages; client service snapshots; intake questionnaire; public profile vertical schedule redesign; booking-linked messaging with trusted notification queueing; professional quick replies; profile-scoped delegated access with a confirmed CRM/client-record boundary; local Today view and persistent booking/message notification panel; unified client communication history; category-based public discovery and category landing results; Phase 12 occupancy, retention, trend, category, and reporting highlights.
- **Automated regression / Regression automatisee:** full emulator QA passes cleanly on Node 22: 80/80 tests across 38 test files, 73 syntax files, complete architecture coverage, source-size/production-import/secret-exposure/Firebase-config audits, and `git diff --check`. The latest 2026-09-26 run includes verified-email booking and waitlist denial tests and uses Node 22 through `npm exec --yes --package=node@22 -- firebase emulators:exec --only auth,firestore,functions,storage --project jr-booking-premium "node tests/run-local-tests.js --with-emulators"`.
- **Production deployment / Deploiement production:** the 2026-09-23 deployment put all 53 current functions, `firestore.rules`, and hosting live. On 2026-09-25, the same 53 current source Functions were redeployed as Node 22 and the five confirmed pre-rebuild Functions were removed. On 2026-09-26, the verified-email booking rules and Hosting flow were deployed selectively with `firebase deploy --only firestore:rules,hosting`; no Functions were changed in that release. Live smoke checks returned HTTP 200 for the public profile, registration page, and updated profile/Auth modules. No Firestore data was created or changed in production during booking-flow QA. Artifact Registry cleanup policy is set for `europe-west9`.
- **Human/browser pending / Humain/navigateur en attente:** Waitlist click-through passed against the local emulator. Trigger Email delivery was confirmed by the operator on 2026-09-25. On 2026-09-26 the operator confirmed real Google OAuth consent and sandbox Calendar sync. Google Auth Platform still labels the external OAuth app unverified and shows a 100-user cap; Google app verification remains a broader-launch prerequisite if the cap or warning must be removed. Populated professional schedule, Today widget, sidebar, printer menu, anonymization toggle, settings menu, and non-Paris timezone rendering were verified in the local browser on 2026-09-14.
- **Next implementation slice / Prochaine tranche:** use the deployed admin resend action for the known professional application, complete its email verification and admin approval/provisioning; then decide/complete Google app verification before broader public rollout if required.

### Verified-email client booking flow / Réservation client après vérification courriel

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** public profile anonymous schedule, available-slot selection, login-required booking entry, client registration, and explicit request submission.
- **Production owner / Responsable production:** `firestore.rules`, `public/profile.html`, `public/js/profile-public/profile-view.js`, `public/login.html`, `public/register-client.html`, `public/js/core/auth-guard.js`, `public/js/core/email-link-utils.mjs`, `public/js/core/strings-fr.js`, professional booking views, and booking emulator tests.
- **Behavior / Comportement:** anonymous visitors can select an available public slot; profile/service/date/start are carried through a validated same-origin signup/verification/login return. Client registration sends Firebase email verification after legal acceptance. The profile reloads Auth and refreshes the ID token before exposing the request form; verification never sends automatically, and the client must explicitly submit. The booking records Auth-bound `clientId`, `createdBy`, and verified `clientEmail`.
- **Security / Securite:** `firestore.rules` denies direct client booking creates unless `email_verified == true`, the email snapshot equals the verified Auth token, and both UID fields equal the caller. The callable waitlist path also rejects unverified callers. The signed-in provider is intentionally not restricted: a verified email-link session may book. Continuations reject foreign origins, duplicate/unknown query keys, malformed profile IDs, dates, and times; no credentials, email, intake answers, UID, or verification token are carried in the URL.
- **Evidence / Preuves:** `tests/email-link-utils.test.mjs` passes same-origin and malformed/attack URL cases. `tests/booking-series-emulator.test.cjs` covers unverified booking denial, verified email success, mismatched clientEmail denial, and verified/unverified waitlist behavior; `tests/booking-contacts-emulator.test.cjs` passes after fixture updates. Full Node 22 emulator QA passes 80/80 across 38 files and 73 syntax files. Local browser walkthrough: selected a slot anonymously, followed registration continuation, created a disposable `.example.test` account, confirmed verification status hid the booking form, verified through the local Auth emulator, reloaded to restore the selection and reveal the final action, confirmed zero bookings existed before explicit submit, then submitted once and verified a single pending booking with matching `clientId`/`createdBy`/`clientEmail`. The local emulator was stopped afterward; no production user or booking data was used. Firestore rules and Hosting deployed on 2026-09-26; live relevant assets return HTTP 200.
- **Remaining blocker / Blocage restant:** optional manual confirmation with a real client inbox/browser; no code, rule, emulator, or deployment blocker remains. The real existing client application remains a separate pending account-provisioning workflow.
- **Next implementation slice / Prochaine tranche:** complete the known account's professional application verification/approval flow, then the remaining Google OAuth consent and sandbox-calendar gate.

### Trigger Email production delivery test / Test de livraison Trigger Email en production

- **Status / Statut:** `HUMAN + AI VERIFIED`
- **Target outcome / Resultat vise:** verify one real Trigger Email message is accepted by the configured Gmail sender and delivered to the operator-provided test inbox.
- **Evidence / Preuves:** the production Firestore `mail` collection is admin-write-only. The first test document recorded `delivery.state: ERROR` with `SMTP_AUTHENTICATION`. After the operator updated the extension settings directly in Firebase Console, both `mail/manual-trigger-email-test-20260925-followup` and `mail/manual-trigger-email-test-20260925-second` recorded `delivery.state: SUCCESS` with no error. The operator confirmed receipt of the test email in the target inbox on 2026-09-25. No message contents or recipient data were retrieved for verification.
- **Security / Securite:** both messages contained only generic French delivery-test text. No credential, account recovery link, booking data, or recipient address was added to repository documentation. The failed document was not retried; the successful follow-up used a new ID.
- **Remaining blocker / Blocage restant:** none.
- **Next implementation slice / Prochaine tranche:** complete real Google OAuth consent and sandbox event-import verification.

### Functions Node 22 runtime migration / Migration du runtime Node 22 des Functions

- **Status / Statut:** `DONE`
- **Target outcome / Resultat vise:** move all project Cloud Functions off Node 20 before its 2026-10-30 decommission date, without changing function behavior or raising dependency major versions.
- **Production owner / Responsable production:** `functions/package.json` and the root package metadata in `functions/package-lock.json`.
- **Existing work reused / Travail reutilise:** retain `firebase-admin@13.10.0`, `firebase-functions@7.4.0`, and `busboy@1.6.0`; both Firebase packages declare Node 18+ compatibility, so no dependency upgrade is needed for Node 22.
- **Evidence / Preuves:** `npm pkg get engines --prefix functions` reports Node 22; `npm ls --prefix functions --depth=0` resolves the three existing dependencies; `busboy@1.6.0`, `firebase-admin@13.10.0`, and `firebase-functions@7.4.0` declare Node 10.16+/18+/18+ compatibility. Firebase Functions emulator confirmed `Using node@22 from host`. The complete Node 22 QA run passed 79/79 tests across 37 test files and 73 syntax files, with complete architecture coverage and release audits. On 2026-09-25, all 53 current Functions were deployed as Node 22; deletion of the only old Node 20 function, `purgeDeletedTeachers`, leaves no Node 20 runtime in the verified live inventory. The Calendar callback smoke check returned HTTP 400 for missing Google authorization parameters, confirming the route responds. `git diff --check` passes.
- **Related test hardening / Durcissement de test associe:** the support/data-request reply emulator test's original 7.5-second sequential notification wait expired under Node 22 emulator trigger latency. It now waits for both notifications concurrently with a bounded 20-second window. The focused test and full Node 22 emulator suite pass.
- **Security / Securite:** no application authorization, rules, secrets, or Firestore data changed. The five old project Functions and their triggers were removed; current source Functions and the email extension remain.
- **Remaining blocker / Blocage restant:** none. Production inventory confirms no Node 20 Functions remain.
- **Next implementation slice / Prochaine tranche:** continue the independent real Trigger Email and Google OAuth verification gates.

### Legacy Cloud Functions cleanup / Nettoyage des anciennes Cloud Functions

- **Status / Statut:** `DONE`
- **Target outcome / Resultat vise:** remove only legacy production functions proven to have no current caller, data responsibility, or required behavior.
- **Evidence / Preuves:** repository search found no current references to the five old names, and reachable Git history contained no matching source. Production logs showed `automatedReminders` running about every five minutes, `gcalSyncWorker` about every minute, `purgeDeletedProfessionals` running a daily `30-Day Purge` job, and historical Google OAuth callback activity in `api`. After the operator confirmed they were remnants of the erased pre-rebuild project, the five functions were deleted from `us-central1`. Firebase reported five successful deletions; the post-delete inventory confirms the old names are absent and current Functions plus the email extension remain deployed.
- **Security / Securite:** only the five named Functions and their triggers were deleted. No Firestore documents, rules, Hosting assets, or extension configuration were deleted or redeployed.
- **Remaining blocker / Blocage restant:** none for this cleanup. The unavailable old implementation sources prevent reconstructing their historical side effects, but their deployed triggers can no longer execute.
- **Next implementation slice / Prochaine tranche:** continue the real Trigger Email and Google OAuth verification gates.

### Schedule toolbar and icon-button mockup parity / Parité mockup des icônes et de la barre d'outils du planning

- **Status / Statut:** `DONE`
- **Production owner / Responsable production:** `public/assets/css/pro-dashboard.css`, `public/assets/css/client-dashboard.css`, `public/assets/css/profile-public.css`, `public/pro-dashboard.html`, `public/admin-dashboard.html`, `public/admin-REPLACE_WITH_UNGUESSABLE_FILENAME_TOKEN.html`, `public/client-dashboard.html`.
- **Behavior / Comportement:** every round SVG icon button (navbar print/notifications/settings/logout/support, schedule previous/next navigation) now renders as `docs/mockups/jr-booking-premium-mockup.html`'s `.btn-icon`: a 36×36px panel-background square with a 10px radius, `var(--panel-brd)` border, and a 16px stroke icon, instead of the previous dashed 34px pill with inconsistent 22px/20px icon-size overrides per surface. The professional schedule's 1/3/7-day switcher (`.schedule-view-switch`), the public-profile schedule's day switcher (`.profile-schedule-views`), and the sidebar `.feed-filters` all now use the mockup's `.view-switch`/`.segmented` treatment: a `rgba(0,0,0,.25)` pill track with a solid `var(--panel-brd-strong)` active capsule. Standalone toolbar actions that have no mockup equivalent (`Aujourd'hui`/`Cette semaine` quick-jump, `Synchronisation calendrier`) keep the mockup's `.btn-ghost` dashed-pill treatment instead of a solid fill, so they read as secondary actions next to the icon buttons. The compact 28px sidebar booking-card action icons (edit/message/note/accept/reject/done/no-show) already matched the mockup's `.b-actions .btn-icon` pattern from a prior slice and were left unchanged.
- **Security / Securite:** CSS-only visual change; no new DOM handlers, no changes to authorization, Firestore reads/writes, or Cloud Functions.
- **Evidence / Preuves:** `node tests/run-local-tests.js` — 62/62 unit and syntax tests pass, architecture coverage complete, no regressions. Live local browser verification against the Firebase emulators (`firebase emulators:start --only auth,firestore,functions,storage,hosting`, seeded via `tests/seed-mock-data.js`) as both `mock.professional@example.test` and `mock.client@example.test`: navbar icon buttons, schedule previous/next buttons, and the 1/3/7-day segmented switch render as uniform panel-style squares/pill matching the mockup on `pro-dashboard.html`; the client dashboard's navbar and schedule previous/next/"Cette semaine" controls match the same treatment on `client-dashboard.html`. Switching the pro schedule to "3 jours" correctly re-renders the grid with the segmented control's active state updating. Cache-busting `?v=` tags were bumped on the affected HTML entry files' CSS `<link>` tags so the Hosting emulator/browser disk cache does not serve stale CSS.
- **Remaining blocker / Blocage restant:** none. The underlying schedule grid keeps its existing per-hour CSS-grid geometry (documented prior compromise vs. the mockup's absolute-positioned pixel-height blocks); this slice only covered button/toolbar chrome parity as requested.
- **Next implementation slice / Prochaine tranche:** none required for this request; continue with the next unfinished specification phase or remaining external gates.

### Schedule block geometry, modal accessibility and remaining mockup gaps / Géométrie des blocs du planning, accessibilité des modales et écarts restants

- **Status / Statut:** `DONE (visual confirmation by the human operator pending)`
- **Production owner / Responsable production:** `public/js/shared/modal-behavior.js` (new), `public/js/schedule/schedule-render.js`, `public/js/client-dashboard/client-schedule.js`, `public/js/profile-public/profile-view.js`, `public/js/sidebar/sidebar-feed.js`, `public/js/pro-dashboard/navbar-pro.js`, `public/js/client-dashboard/navbar-client.js`, `public/js/core/strings-fr.js`, `public/assets/css/{glass-theme,pro-dashboard,client-dashboard,profile-public}.css`, plus the 24 modal modules.
- **Behavior / Comportement:** schedule events no longer fill their whole grid cell. Each hour cell is now a positioning track and the event renders as an inner `.schedule-block` inset `3px 5px`, reproducing the mockup's `.slot{left:6px;right:6px}` gutter while keeping the existing per-hour CSS-grid engine. Multi-hour bookings join visually across rows via `has-continuation`/`is-continuation` modifiers that drop the shared border and square off the touching corners, so a 09:00–11:00 booking reads as one block rather than two boxes. Free cells no longer print a "Libre" label (the mockup leaves free time empty); the label survives as an `aria-label` for assistive tech. Today's column is now highlighted on all three schedules (`is-today`), and the professional hour band is derived from the profile's working hours and exceptions instead of a hard-coded 08:00–17:00 array. A `.week-note` footnote explains the double-click/right-click affordances. Professional sidebar cards gained the mockup's click-to-expand `.b-expand` disclosure (e-mail, phone, service, price, recurrence), a `.b-check`-style accent checkbox, a sticky bulk-action bar, and the `.overlap-note` banner when two visible requests share a start time. Both navbars gained the mockup's `.nav-user` avatar pill, and the professional bell now carries a `.badge-dot` reflecting the pending-request count.
- **Accessibility / Accessibilité:** all ~24 modals previously declared `role="dialog"` + `aria-modal="true"` with **no** focus management, which actively misleads assistive technology. A single shared `attachModalBehavior(modal)` helper now supplies Escape-to-close, a Tab/Shift+Tab focus trap scoped to the dialog, a reference-counted body scroll lock for stacked modals, and focus restoration to the element that opened the modal. It is invoked at every call site immediately after `document.body.append(modal)`.
- **Bugs fixed in passing / Bogues corrigés au passage:** (1) `.visually-hidden` was used by `sidebar-feed.js`, `admin-dashboard.js` and the schedule but defined in **no** stylesheet, so screen-reader-only labels rendered as visible text; it is now defined in `glass-theme.css`. (2) `public/assets/css/client-dashboard.css` contained an **orphaned declaration block with no selector** after `.professional-search-pill svg`, invalidating the intended search-input styling; the block is now a proper `.professional-search-pill input` rule plus a `:focus-within` rule. (3) `sidebar-feed.js` rendered the collapse control as a literal `‹` character instead of an SVG. (4) The professional hour band ignored `workingHours.startTime`/`endTime`, so a professional working outside 08:00–17:00 silently lost rows.
- **Dead CSS removed / CSS mort retiré:** the speculative `.switch*`, `.panel-tab*`, `.radio-row` and `.segmented`/`.seg-opt` rules added in the previous slice were removed rather than justified by inventing features. `.tag-pill` is now genuinely used by the schedule's Google Calendar sync indicator, and `.overlap-note` by the sidebar banner.
- **Security / Securite:** no changes to authorization, Firestore rules, reads/writes, or Cloud Functions. All rendered values continue to pass through `escapeHtml`.
- **Evidence / Preuves:** `node tests/run-local-tests.js --with-emulators` — 79/79 tests pass across 37 test files and 73 syntax files, with complete architecture coverage (`docs/architecture/js/shared/modal-behavior.md` added for the new module). The temporary review scaffolding from the previous slice (`tests/seed-visual-demo.js` and the `?mockgcal=1` branch) has been removed, and cache-busting `?v=` tags were bumped to `mockup-parity-b-20260924` across the affected HTML entry files and module import chain.
- **Remaining blocker / Blocage restant:** browser tooling was disabled partway through this slice, so the geometry change was verified by code review and the automated suite rather than a live screenshot. A human should confirm the schedule visually on `pro-dashboard.html`, `client-dashboard.html` and `profile.html`.
- **Next implementation slice / Prochaine tranche:** optional remaining mockup gaps that were deliberately not taken — a draggable sidebar resizer, the admin dashboard's tabbed panel layout, an autosave indicator, and a search control on `category.html`.

### Full-surface mockup component parity (buttons, modals, reservations) / Parité mockup complète (boutons, modales, réservations)

- **Status / Statut:** `DONE`
- **Production owner / Responsable production:** `public/assets/css/glass-theme.css`, `public/assets/css/pro-dashboard.css`, `public/assets/css/client-dashboard.css`, `public/assets/css/profile-public.css`, `public/js/schedule/schedule-render.js`, `public/js/client-dashboard/client-schedule.js`, `public/js/client-dashboard/client-bookings.js`, `public/js/core/strings-fr.js`, plus the 24 modal modules under `public/js/**` and all 15 HTML entry files.
- **Behavior / Comportement:** `glass-theme.css` now owns the mockup's shared component vocabulary (`.btn-sm`, `.btn-icon`/`.icon-button`, `.btn-icon-sm`/`.booking-action-button`, `.chip-button`, `.segmented`/`.feed-filters`/`.schedule-view-switch`/`.profile-schedule-views`, `.switch`, `.panel-tab`, `.radio-row`, `.tag-pill`, `.dropdown-glass`/`.ddi`/`.dropdown-group-label`, `.legend-mini`/`.legend-swatch`, `.overlap-note`/`.overlap-chip`, `.modal-backdrop`, and the whole modal shell `.working-hours-dialog`/`.booking-creation-dialog`/`.working-hours-header`/`-section`/`-fields`/`-field`). The divergent duplicates previously carried separately by `pro-dashboard.css`, `client-dashboard.css`, and `profile-public.css` were deleted, so every surface (pro, client, public profile, admin, auth) now renders identical controls. Reservation rendering was aligned with the mockup's `.slot`/`.b-card` families: schedule cells now show a left-aligned name plus a mono time range, `no-show` gained its own hatched-dashed treatment instead of being identical to `accepted`/`done`, the recurring break renders as the mockup's dotted `PAUSE` block, Google Calendar events render as transparent dotted `gcal` blocks, a `.legend-mini` legend was added under both the professional and client schedules, and slots carrying more than one overlapping request show the mockup's numbered `.overlap-chip`. Client booking cards were converted from stacked full-text buttons to the mockup's compact row of 28px SVG icon buttons. All 24 modal dialogs swapped their text `btn-ghost` close control for a `.icon-button.modal-close` with an X SVG, and the context menu adopted the mockup's `.schedule-context-menu` recipe.
- **Bugs fixed in passing / Bogues corrigés au passage:** (1) `.modal-backdrop` was referenced by `public/js/shared/support-requests.js` but defined in no production stylesheet, so that dialog rendered unpositioned — it is now defined in `glass-theme.css`. (2) `client-dashboard.html` never loaded any rule for `.working-hours-dialog`/`-header`/`-field`, so all six client-side modals rendered unstyled; the shell now lives in the globally-loaded `glass-theme.css`. (3) `.schedule-slot-calendar-ghost` set `border-style: dashed` on an element with no declared border, making imported Google Calendar events effectively invisible, and the event markup omitted the layout class so its text overflowed; both are fixed and the hard-coded `"Google Calendar"` literal now routes through `UI_STRINGS`. (4) `findBooking` in `schedule-render.js` and `isBookingActiveAtHour` in `client-schedule.js` again computed occupied cells by truncating the end time to its hour, so a booking ending at 12:30 was dropped from the 12:00 row and the partial hour falsely read as free; both now do real interval overlap using minute-resolution keys (`getZonedParts` returns `minute` in both files). (5) The sidebar-expand control rendered a literal `›` text character instead of an SVG. (6) `client-bookings.js` matched actions with `event.target.matches(...)`, which would miss clicks landing on an icon's inner SVG; it now resolves the action with `closest(...)`.
- **Security / Securite:** no changes to authorization, Firestore rules, reads/writes, or Cloud Functions. All new markup is static or passes through the existing `escapeHtml` helper; the added `title`/`aria-label` attributes reuse already-escaped values.
- **Evidence / Preuves:** `node tests/run-local-tests.js --with-emulators` — 79/79 tests pass across 37 test files and 72 syntax files. Live local browser verification against the Firebase emulators with `tests/seed-mock-data.js` plus a temporary `tests/seed-visual-demo.js` fixture set (12 current-week bookings covering pending, accepted, rejected, done, no-show, a 90-minute bleed-over, a mid-hour start, two overlapping pending requests, a guest booking, and a two-occurrence series) and a temporary `?mockgcal=1` flag feeding canned external calendar events: the professional schedule renders all status variants, the dotted `PAUSE` band, ghost and solid Google Calendar blocks, and the legend; the 90-minute booking correctly produces a continuation cell in the following hour row; the client dashboard renders status-differentiated slots and compact icon-button cards; the public profile renders the segmented day switcher and mockup-style form fields; `Horaires et absences` and `Modifier la réservation` both open with the new X icon close control and mono uppercase field labels and remain fully functional.
- **Remaining blocker / Blocage restant:** none. The schedule keeps its per-hour CSS-grid geometry rather than the mockup's absolute-positioned 56px-per-hour blocks — a deliberate, previously documented compromise. The temporary `tests/seed-visual-demo.js` fixture and the `?mockgcal=1` branch in `public/js/pro-dashboard/pro-dashboard.js` are review-only scaffolding and must be deleted at the end of the review session.
- **Next implementation slice / Prochaine tranche:** remove the temporary demo scaffolding, then continue with the remaining external gates (Trigger Email delivery, Google OAuth consent).

### Phase 11 - Delegated professional profile access / Accès délégué au profil professionnel

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `firestore.rules`, `functions/index.js`, `public/js/pro-dashboard/pro-dashboard.js`, `tests/delegated-access-emulator.test.cjs`.
- **Behavior / Comportement:** an active delegate can read the assigned professional profile metadata needed to switch into the delegated dashboard context, while the underlying booking/message permissions remain limited to the exact delegated permission set and the rest of the profile remains protected.
- **Security / Securite:** profile access is not broadened to all owners or all professionals. The rule intentionally allows only the required profile read for active delegates with `manageBookings` or `manageMessages` on the specific `proProfiles/{proId}` document and leaves owner/admin-only write paths unchanged.
- **Evidence / Preuves:** `node --test tests/delegated-access-emulator.test.cjs` passes after the rule fix under the local Auth/Firestore/Functions emulators at 127.0.0.1:9099, 127.0.0.1:8080, and 127.0.0.1:5001. The regression covers a delegate reading the profile, reading listDelegatedBookings results, updating delegated booking status, and keeping private notes and the owner-only `proClientRecords` document blocked.
- **CRM boundary review / Revue de limite CRM:** confirmed by code review that `pro-dashboard.js` only calls the direct `proClientRecords` Firestore query (`loadBookings`) for non-delegate sessions; delegates use the trusted `loadDelegatedBookings` callable instead. The entire settings menu (Client Database, Statistics, Working Hours, etc.) is gated behind `canManageSettings: !isDelegate` in `navbar-pro.js`, so a delegate never reaches the CRM/client-database entry point in the UI. The `proClientRecords` Firestore rule independently restricts reads to `auth.uid == resource.data.proId` or admin, closing the boundary at the data layer as well.
- **Remaining blocker / Blocage restant:** optional populated-browser confirmation remains for the final delegated dashboard UI flow; no local code or rule blocker remains.
- **Next implementation slice / Prochaine tranche:** none locally; continue with the next unfinished specification phase or remaining external gates.

### Phase 16 - Release-readiness QA refresh / Actualisation QA de preparation de livraison

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `tests/run-local-tests.js`, all supported architecture documentation, production JavaScript modules, and Firebase emulator configuration.
- **Evidence / Preuves:** the QA runner supports explicit emulator mode. After clearing stale processes holding ports 4000/4400/4500/5001/8080/9099/9150/9199 and restarting `firebase emulators:start --only auth,firestore,functions,storage`, `node tests/run-local-tests.js --with-emulators` now produces a clean aggregate: 79/79 tests pass across 37 test files and 72 syntax files; architecture coverage, release audits, and `git diff --check` pass.
- **Remaining blocker / Blocage restant:** external mailbox and OAuth gates remain separate from local QA. `firebase-functions` and `firebase-admin` were upgraded to the latest versions compatible with the current Node 20 Functions runtime (7.4.0 / 13.10.0 respectively, 2026-09-24) and re-verified with a clean 79/79 emulator pass; `firebase-admin@14.x` remains deferred because it drops Node 20 support and would require a Cloud Functions runtime bump to Node 22, which is a separate, riskier change needing explicit scope.
- **Next implementation slice / Prochaine tranche:** resolve remaining populated-browser parity and external delivery gates (Trigger Email, Google OAuth/calendar).

### Cross-role support and data-request submission / Demandes support et donnees inter-roles

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/shared/support-requests.js`, both client/professional navbar modules, `firestore.rules`, and `tests/support-requests.test.mjs`.
- **Behavior / Comportement:** authenticated clients and professionals can submit either a support ticket or a personal data request, review their request history, and read admin replies. Requests are bounded, creator-owned, start in `pending`, and appear in the existing admin queues; admin replies move support tickets to `in-progress`.
- **Security / Securite:** browser creation requires `createdBy == request.auth.uid`; Firestore rejects extra fields, empty/oversized subject/details, and non-pending initial status. Only the creator or an admin can read the request.
- **Evidence / Preuves:** focused payload regression, touched-module syntax checks, and Firestore rules compilation pass.
- **Remaining blocker / Blocage restant:** populated browser confirmation of both role entry points remains optional.
- **Next implementation slice / Prochaine tranche:** continue with the highest-value unfinished functional requirement; do not redo this slice for the optional browser check.

### Client schedule week navigation / Navigation hebdomadaire du planning client

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/client-dashboard/client-schedule.js`, `public/assets/css/client-dashboard.css`, and `public/js/core/strings-fr.js`.
- **Behavior / Comportement:** clients can move to the previous or next seven-day period, return to the current week, and retain timezone-aware booking and locked-professional rendering while navigating.
- **Mockup parity / Parite mockup:** navigation uses the same compact arrow/today control treatment as the professional schedule while preserving the client-specific read-only and privacy boundary.
- **Evidence / Preuves:** schedule selection/settings tests pass 5/5; client schedule and string modules pass syntax checks; client navigation controls include mobile layout rules; `git diff --check` passes.
- **Remaining blocker / Blocage restant:** populated browser confirmation remains optional.
- **Next implementation slice / Prochaine tranche:** continue with the next unfinished functional requirement rather than redoing this slice for optional browser confirmation.

### Public schedule 1/3/7-day views / Vues publiques 1/3/7 jours

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/profile-public/profile-view.js`, `public/assets/css/profile-public.css`, and `public/js/core/strings-fr.js`.
- **Behavior / Comportement:** anonymous visitors can switch the public profile schedule between one, three, and seven visible days, move to adjacent periods, or return to today. Available, occupied, and unavailable slots retain the existing booking-entry and anonymous `busySlots` rules.
- **Privacy / Confidentialite:** the view changes only date range and grid geometry; it never exposes client identity, booking details, or private profile fields.
- **Evidence / Preuves:** schedule selection/settings tests pass 5/5; profile view and strings modules pass syntax checks; responsive CSS includes dynamic day-count rules; `git diff --check` passes.
- **Remaining blocker / Blocage restant:** populated browser confirmation remains optional.
- **Next implementation slice / Prochaine tranche:** continue with the next unfinished functional requirement.

### Locked schedule booking handoff / Reservation depuis le planning verrouille

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/client-dashboard/client-schedule.js`, `public/js/client-dashboard/client-dashboard.js`, `public/js/profile-public/profile-view.js`, `public/assets/css/client-dashboard.css`, and `public/js/core/strings-fr.js`.
- **Behavior / Comportement:** an authenticated client can select an available cell in a locked professional's schedule and open the public profile with the professional, date, and start time preselected in the booking form. Occupied cells remain anonymous and non-interactive.
- **Privacy / Confidentialite:** only public profile data and anonymous `busySlots` are used; the URL carries no client, booking, payment, or private profile data.
- **Evidence / Preuves:** schedule selection/settings tests pass 5/5; all touched JavaScript modules pass syntax checks; no undefined slot label remains; `git diff --check` passes.
- **Remaining blocker / Blocage restant:** populated browser confirmation of the click-through remains optional.
- **Next implementation slice / Prochaine tranche:** continue with the next unfinished functional requirement.

### Full-duration schedule booking blocks / Blocs de reservation a duree complete

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/schedule/schedule-render.js`, `public/js/client-dashboard/client-schedule.js`, `public/assets/css/pro-dashboard.css`, and `public/assets/css/client-dashboard.css`.
- **Behavior / Comportement:** professional and client schedules mark every hourly cell covered by a non-rejected booking interval. The first cell shows the label/status and continuation cells retain the booked state without duplicating identifying text.
- **Evidence / Preuves:** schedule selection/settings tests pass 5/5; both schedule renderers pass syntax checks; continuation styles exist in both schedule stylesheets; `git diff --check` passes.
- **Remaining blocker / Blocage restant:** populated browser confirmation of multi-hour visual blocks remains optional.
- **Next implementation slice / Prochaine tranche:** continue with the next unfinished functional requirement.

### Public schedule professional timezone / Fuseau horaire du planning public

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/profile-public/profile-view.js` and `public/js/core/strings-fr.js`.
- **Behavior / Comportement:** public schedule dates, weekday labels, booking minimum date, busy-slot matching, and conflict checks use the professional's saved timezone, with `Europe/Paris` fallback.
- **Privacy / Confidentialite:** timezone conversion changes only calendar presentation and slot matching; anonymous visitors still receive only safe public profile and `busySlots` data.
- **Evidence / Preuves:** schedule selection/settings tests pass 5/5; profile view and strings modules pass syntax checks; every `isBusy` call supplies a timezone; `git diff --check` passes.
- **Remaining blocker / Blocage restant:** populated browser confirmation across a timezone boundary remains optional.
- **Next implementation slice / Prochaine tranche:** continue with the next unfinished functional requirement.

### Unified booking datetime contract / Contrat datetime unifie des reservations

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/core/datetime-utils.mjs`, `public/js/profile-public/profile-view.js`, `public/js/client-dashboard/client-request-change.js`, `public/js/pro-dashboard/booking-creation.js`, and `public/js/pro-dashboard/pro-dashboard.js`.
- **Behavior / Comportement:** public booking and waitlist forms, client change requests, and professional booking creation interpret `datetime-local` values in the relevant profile timezone and write absolute ISO timestamps. Form display converts stored timestamps back to the active local timezone.
- **Evidence / Preuves:** `tests/datetime-utils.test.mjs` plus schedule tests pass 8/8; all affected modules pass syntax checks; `git diff --check` passes.
- **Remaining blocker / Blocage restant:** populated browser confirmation across DST and non-Paris timezone boundaries remains optional.
- **Next implementation slice / Prochaine tranche:** continue with the next unfinished functional requirement.

### Phase 8-14 - Client notification preferences / Preferences de notification client

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/client-dashboard/navbar-client.js`, `public/js/client-dashboard/client-dashboard.js`, `public/js/pro-dashboard/notification-preferences.js`, and `public/js/core/strings-fr.js`.
- **Behavior / Comportement:** authenticated clients can open the same notification-preferences modal as professionals and choose immediate, daily-digest, or no-email delivery for messages, booking changes, and reminders.
- **Security / Securite:** preferences remain in owner-scoped `notificationPreferences/{uid}`; the existing bounded Firestore rules and delivery workers are reused without expanding access.
- **Evidence / Preuves:** touched dashboard modules and strings pass syntax checks; existing notification digest regression and Firestore rules validation remain green; `git diff --check` passes.
- **Remaining blocker / Blocage restant:** populated client-browser confirmation remains optional.
- **Next implementation slice / Prochaine tranche:** continue with the next unfinished specification phase.

### Phase 8 - Professional booking edit timezone / Fuseau horaire de modification professionnelle

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/pro-dashboard/booking-edit.js`, `public/js/pro-dashboard/pro-dashboard.js`, and `public/js/core/datetime-utils.mjs`.
- **Behavior / Comportement:** professional booking edit forms display and submit start/end values in the active profile timezone while the trusted update receives absolute ISO timestamps, including recurring-series edits.
- **Evidence / Preuves:** datetime and schedule tests pass 8/8; booking edit and dashboard modules pass syntax checks; `git diff --check` passes.
- **Remaining blocker / Blocage restant:** populated browser confirmation across non-Paris and DST boundaries remains optional.
- **Next implementation slice / Prochaine tranche:** continue with the next unfinished specification phase.

### Phase 8-14 - Client notification center / Centre de notifications client

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/client-dashboard/navbar-client.js`, `public/js/client-dashboard/client-dashboard.js`, and the shared persisted notification center.
- **Behavior / Comportement:** clients can open persisted booking/message/waitlist notifications from the navbar; selecting a notification marks it read through the existing owner-scoped rule and scrolls to the authorized booking when available.
- **Evidence / Preuves:** notification digest regression, datetime/schedule regressions, touched-module syntax checks, full emulator validation, and `git diff --check` pass.
- **Remaining blocker / Blocage restant:** populated client-browser confirmation remains optional.
- **Next implementation slice / Prochaine tranche:** continue with the next unfinished specification phase.

### Phase 13 - Support reply notifications / Notifications de reponse support

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `functions/index.js` (`createSupportReplyNotification`), `public/js/shared/support-requests.js`, and the client/professional notification centers.
- **Behavior / Comportement:** adding or changing an admin reply on a support ticket creates an idempotent persisted notification for the requester; the existing client/professional notification centers can display it and mark it read.
- **Security / Securite:** the trigger uses the ticket's server-controlled `createdBy` field; notification reads remain owner-scoped and no admin-only ticket data is copied into the notification.
- **Evidence / Preuves:** notification regression, integrated schedule/datetime tests, Functions syntax, full emulator validation, and `git diff --check` pass.
- **Remaining blocker / Blocage restant:** populated requester-browser confirmation remains optional.
- **Next implementation slice / Prochaine tranche:** continue with the next unfinished specification phase.

### Phase 13 - Data-request reply workflow / Reponse aux demandes de donnees

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/admin/admin-dashboard.js`, `public/js/shared/support-requests.js`, `functions/index.js` (`createDataRequestReplyNotification`), and the owner-scoped Firestore rules.
- **Behavior / Comportement:** admins can reply to personal data requests from the existing queue; the requester sees the reply in request history and receives an idempotent `data-request-reply` notification through the existing client/professional notification centers.
- **Security / Securite:** only admins can add/change replies or status; requester reads remain owner-scoped; the notification contains only the bounded reply preview and request ID.
- **Evidence / Preuves:** support/request regressions pass 15/15, `tests/support-reply-notifications-emulator.test.cjs` covers both support and data-request trigger notifications, Functions and admin syntax checks pass, architecture coverage and release audit pass, and `git diff --check` passes. The focused emulator integration test now passes as part of the clean 79/79 full-emulator QA run (2026-09-24).
- **Remaining blocker / Blocage restant:** populated admin/requester browser confirmation remains optional; no local emulator blocker remains.
- **Next implementation slice / Prochaine tranche:** continue with remaining populated workflow coverage and final release gates.

### Phase 13 - Platform ban escalation review / Revue des escalades de bannissement

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `proClientRecords` rules, and `public/js/pro-dashboard/client-database.js`.
- **Behavior / Comportement:** professionals can submit a client-scoped `platformBanRequest`; admins can review pending escalations in the command center, refuse them, or approve them through trusted `setAccountBanStatus` before recording reviewer metadata. Each outcome creates a bounded notification for the requesting professional.
- **Security / Securite:** only admins can read the cross-profile escalation queue or write review status; professionals retain access only to their own CRM record.
- **Evidence / Preuves:** admin module and Functions syntax, ban-review policy regression, unit QA, architecture coverage, and `git diff --check` pass; full emulator integration now passes cleanly as part of the 79/79 full-emulator QA run (2026-09-24).
- **Remaining blocker / Blocage restant:** populated admin-browser confirmation remains optional; no local emulator blocker remains.
- **Next implementation slice / Prochaine tranche:** continue with remaining Phase 13 browser coverage and final release gates.

### Phase 16 - Complete local QA runner / Lanceur QA local complet

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `tests/run-local-tests.js`, `tests/README_TESTING.md`, architecture documentation coverage, and the serial test suite.
- **Behavior / Comportement:** one command discovers and runs all unit tests serially without emulators, includes emulator tests only when all four local emulator ports are reachable, syntax-checks production JavaScript independently, verifies architecture documentation coverage across the repository's supported documentation layouts, and audits production module size, forbidden browser imports, secret-name exposure, and Firebase path integrity.
- **Evidence / Preuves:** `node tests/run-local-tests.js --with-emulators` passed 79 tests across 37 test files, 72 syntax files, complete architecture coverage, and release-readiness audits for source size, production imports, secret exposure, and Firebase configuration, run cleanly against a freshly restarted local emulator stack (2026-09-24).
- **Human result / Resultat humain:** `Optional pending`
- **Remaining blocker / Blocage restant:** no local emulator blocker remains; populated-browser usability checks and external Google/Trigger Email delivery gates remain.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, performance checks, and external delivery gates.

### Phase 11 / 15 - Filtered CRM history PDF export / Export PDF de l'historique CRM filtre

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** CRM client history filters and download action.
- **Production owner / Responsable production:** `public/js/pro-dashboard/client-database.js` and `public/js/shared/print-reports.js`.
- **Behavior / Comportement:** the client history PDF now exports the currently selected event type and date rather than silently exporting a different dataset from the visible CRM view.
- **Timezone / Fuseau horaire:** CRM history rows and the filtered PDF use the active professional timezone for their displayed timestamps.
- **Build check / Auto-verification:** touched CRM JavaScript parses and the repository diff check passes; no new read, write, or authorization path was added.
- **Evidence / Preuves:** `node --check public/js/pro-dashboard/client-database.js` and `git diff --check` pass.
- **Human result / Resultat humain:** `Optional pending`
- **Remaining blocker / Blocage restant:** populated browser confirmation of filter-then-export remains optional.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.

### Phase 15 - Client print report menu / Menu des rapports imprimables client

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** client navbar printer action and booking-history report workflow.
- **Production owner / Responsable production:** `public/js/client-dashboard/navbar-client.js`, `public/js/client-dashboard/client-dashboard.js`, and `public/js/shared/print-reports.js`.
- **Data and privacy / Donnees et confidentialite:** the menu uses only the signed-in client's already loaded booking DTOs; no client can request another user's report data and the report is generated locally.
- **Build check / Auto-verification:** four report modes are wired through the shared print builder and touched modules pass syntax checks.
- **Evidence / Preuves:** the existing print regression covers the shared four modes; client dashboard and navbar syntax checks pass; `git diff --check` passes.
- **Human result / Resultat humain:** `Optional pending`
- **Remaining blocker / Blocage restant:** browser confirmation of the client printer menu and remaining external delivery gates are pending.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.
- **Checkpoint rule / Regle de reprise:** the items listed as implemented and regression-tested are `DONE` or `AI VERIFIED - HUMAN CHECK OPTIONAL` unless a narrower entry below records a different status. Do not restart them without a regression, security issue, or changed requirement. Work next on the highest-value unfinished requirement or improvement, and choose the batch size according to its real product and engineering payoff rather than an artificial phase boundary.

### Phase 8-13 - Notification preferences / Préférences de notification

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** professional notification controls and account settings.
- **Production owner / Responsable production:** `public/js/pro-dashboard/notification-preferences.js`, `public/js/pro-dashboard/navbar-pro.js`, `public/js/pro-dashboard/pro-dashboard.js`, `functions/index.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** an authenticated professional can store immediate, daily-digest, or no-email choices for messages, booking changes, and reminders in `notificationPreferences/{uid}`. The document is owner-scoped and field/value bounded by Firestore rules.
- **Build check / Auto-verification:** touched JavaScript parses, editor diagnostics are clean, Firestore rules compile in dry-run mode, and the scheduled worker batches unread booking-message notifications once per Paris calendar day.
- **Evidence / Preuves:** `node --test tests/notification-digest.test.cjs` passed 3/3; `node --check functions/index.js` and `functions/notification-digest.js` passed; previous preference/rules checks and `git diff --check` passed.
- **Human result / Resultat humain:** `Optional pending`
- **Remaining blocker / Blocage restant:** Real Trigger Email delivery remains an external gate; browser usability confirmation is optional.
- **Next implementation slice / Prochaine tranche:** implement and test booking-change and reminder delivery handling for their stored preference modes.
- **Date, tester, notes / Date, testeur, notes:** 2026-09-14 - Settings modal, persistence boundary, immediate message delivery, and the idempotent daily digest worker implemented and AI-verified. No reimplementation is required.

### Phase 8-14 - Booking-change and reminder email preferences / Preferences email de reservation et de rappel

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** professional notification settings, booking status changes, and Calendar reminder flow.
- **Production owner / Responsable production:** `functions/index.js`, `functions/notification-digest.js`, `public/js/pro-dashboard/notification-preferences.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** booking status/time/service/price changes and scheduled reminders create safe in-app notifications. `bookingEmail` and `reminderEmail` control immediate mail, daily digest inclusion, or no email. Immediate mail uses deterministic queue IDs so trigger retries do not create duplicate queue documents.
- **Build check / Auto-verification:** booking changes include substantive schedule/service/price edits; reminders and booking changes honor their preference mode; digest selection includes only configured categories; no direct client write path is added.
- **Evidence / Preuves:** `node --test tests/notification-digest.test.cjs` passed 3/3; `node --check functions/index.js` and `functions/notification-digest.js` passed; prior rules and diff checks passed.
- **Human result / Resultat humain:** `Optional pending`
- **Remaining blocker / Blocage restant:** real Trigger Email delivery remains an external gate; populated emulator mail-queue verification and browser usability confirmation are optional follow-up checks.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.
- **Date, tester, notes / Date, testeur, notes:** 2026-09-14 - Preference-aware booking-change and reminder delivery implemented and AI-verified. No reimplementation is required.

### Phase 8 - Professional batch booking actions / Actions groupees des reservations

- **Mockup reference / Reference mockup:** professional sidebar selection, grouped accept/reject controls, and confirmation feedback.
- **Production owner / Responsable production:** `public/js/sidebar/batch-actions.js`, `public/js/sidebar/sidebar-feed.js`, `public/js/pro-dashboard/pro-dashboard.js`, `public/assets/css/pro-dashboard.css`, and existing booking status rules.
- **Data and rules / Donnees et regles:** pending bookings can be selected individually or with select-all; grouped accept/reject invokes `batchUpdateBookingStatus`, which authorizes every selected booking before committing the complete status set in one Firestore transaction.
- **Build check / Auto-verification:** focused delegated-access emulator coverage proves an authorized two-booking batch succeeds and a mixed unauthorized batch leaves every booking unchanged; changed modules pass syntax and diff checks.
- **Human steps / Etapes humaines:**
  1. Ouvrez la sidebar avec plusieurs demandes en attente et cochez deux reservations. / Open the sidebar with several pending requests and select two bookings.
  2. Cliquez Accepter la selection puis confirmez. / Click Accept selection and confirm.
  3. Verifiez que les demandes changent d'etat ensemble, que le compteur revient a zero et que les actions disparaissent du filtre En attente. / Verify statuses change together, the count resets, and actions disappear from Pending.
- **Responsive check / Verification responsive:** desktop 1440 px and mobile 375 px; toolbar wraps without horizontal overflow.
- **Privacy check / Verification confidentialite:** only the active professional's authorized pending bookings are selectable; owner/admin/`manageBookings` authorization is checked for every item before any write occurs.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Grouped selection, confirmation, status orchestration, and responsive toolbar implemented; automated validation passed. Browser populated verification remains pending.

### Phase 9 - Direct profile and service links / Liens directs du profil et des services

- **Mockup reference / Reference mockup:** professional shareable booking link/QR action and public profile service selector.
- **Production owner / Responsable production:** `public/js/pro-dashboard/direct-links.js`, `public/js/pro-dashboard/navbar-pro.js`, `public/js/pro-dashboard/pro-dashboard.js`, `public/js/profile-public/profile-view.js`, and `public/assets/css/pro-dashboard.css`.
- **Data and rules / Donnees et regles:** links contain only the public profile ID and an optional public service index. The public profile preselects the requested service when valid; no new Firestore write is required.
- **Build check / Auto-verification:** focused syntax and diagnostics checks plus the complete serial local emulator suite pass 37/37; rules dry-run remains the final deployment gate.
- **Human steps / Etapes humaines:**
  1. Ouvrez Reglages puis Liens directs et copiez le lien general. / Open Settings then Direct links and copy the general link.
  2. Affichez le QR d'un service et ouvrez le lien dans un nouvel onglet. / Show a service QR code and open its link in a new tab.
  3. Verifiez que le profil public preselectionne le service sans exposer de donnees privees. / Verify the public profile preselects the service without exposing private data.
- **Responsive check / Verification responsive:** desktop 1440 px and mobile 375 px; link rows, copy controls, and QR remain inside the modal.
- **Privacy check / Verification confidentialite:** URL payload contains no client, booking, payment, message, or private profile fields.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Direct profile/service links, copy action, QR presentation, and public service preselection implemented; browser verification remains pending.

### Phase 9 / 11 - CRM client tags / Tags clients CRM

- **Mockup reference / Reference mockup:** CRM client organization and profile-scoped client management.
- **Production owner / Responsable production:** `public/js/pro-dashboard/client-database.js`, `public/js/core/strings-fr.js`, `public/assets/css/pro-dashboard.css`, and `proClientRecords` rules.
- **Data and rules / Donnees et regles:** a professional can store up to 20 comma-separated tags on `proClientRecords/{proId}_{clientId}`; tags are private to that professional and are not public search categories.
- **Build check / Auto-verification:** full serial local suite passes 37/37; syntax and rules checks pass.
- **Human steps / Etapes humaines:** add tags to a client, save, reopen the client, and verify persistence and profile scoping.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Bounded tag editor and persistence implemented; browser verification remains pending.

### Phase 11 - CRM rate and movement-zone overrides / Surcharges CRM

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** CRM client editor with per-client rate and movement-zone controls.
- **Production owner / Responsable production:** `public/js/pro-dashboard/client-database.js`, `public/js/pro-dashboard/client-pricing.mjs`, `public/js/pro-dashboard/pro-dashboard.js`, `public/js/client-dashboard/client-bookings.js`, and `proClientRecords` rules.
- **Data and rules / Donnees et regles:** profile-scoped `customRate` and `movementSurcharge` values replace the professional defaults only in the authorized booking `paymentContext`; private CRM records remain owner-only.
- **Build check / Auto-verification:** empty and invalid values fall back to professional defaults; non-negative overrides replace the standard rate and movement surcharge; client cards display the effective authorized surcharge.
- **Evidence / Preuves:** `node --test tests/client-pricing.test.mjs` passed 2/2; touched dashboard modules passed `node --check`; documentation and `git diff --check` passed.
- **Human result / Resultat humain:** `Optional pending`
- **Remaining blocker / Blocage restant:** populated browser confirmation is optional; no new external service gate.
- **Next implementation slice / Prochaine tranche:** Phase 12 retention and occupancy reporting.
- **Date, testeur, notes / Date, testeur, notes:** 2026-09-14 - CRM rate and movement-zone overrides now affect authorized booking pricing. No reimplementation is required.

### Phase 11 - CRM timezone history filtering / Filtrage timezone de l'historique CRM

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/pro-dashboard/client-database.js`, `public/js/pro-dashboard/client-history-filter.mjs`, and `tests/client-history-filter.test.mjs`.
- **Behavior / Comportement:** opening a CRM client editor preserves the active professional timezone, and history date filters compare localized calendar dates instead of UTC dates. The pure filter helper is shared by the browser module and regression test.
- **Evidence / Preuves:** `node --test tests/client-history-filter.test.mjs` passed; touched CRM modules parse; `git diff --check` passed.
- **Remaining blocker / Blocage restant:** populated browser confirmation of a timezone-boundary CRM filter remains optional.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.

### Phase 2 / 5 / 7 - Reusable emulator mock fixtures / Fixtures emulateur reutilisables

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `tests/seed-mock-data.js`, `tests/mock-fixtures.cjs`, `tests/mock-fixtures.test.cjs`, and `tests/README_TESTING.md`.
- **Behavior / Comportement:** the local seed command creates or updates fixed Auth and Firestore fixtures for one professional, one client, working hours, a public profile, and done/pending bookings. It requires both local Auth and Firestore emulator hosts and never accepts non-local hosts.
- **Evidence / Preuves:** `node --test tests/mock-fixtures.test.cjs` passed; seed and fixture modules pass `node --check`; `git diff --check` passed.
- **Remaining blocker / Blocage restant:** running the command against a live emulator stack is an optional populated-data setup check; no production service is touched by the guard.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.

### Shared UI foundation - Working-hours draft persistence / Brouillon local des horaires

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/core/draft-storage.mjs`, `public/js/pro-dashboard/working-hours.js`, `public/js/pro-dashboard/services-packages.js`, `public/js/pro-dashboard/intake-questionnaire.js`, `public/js/core/strings-fr.js`, and `tests/draft-storage.test.mjs`.
- **Behavior / Comportement:** working-hours, services/packages, and intake-questionnaire changes are saved as profile-scoped local drafts, restored when the modal reopens, and cleared after a successful Firestore save. Repeatable-row changes are included; malformed or unavailable browser storage does not break the forms.
- **Privacy / Confidentialite:** only non-sensitive working-hours settings are stored; credentials, payment details, private addresses, and client records are excluded.
- **Evidence / Preuves:** `node --test tests/draft-storage.test.mjs tests/client-history-filter.test.mjs tests/print-reports.test.mjs tests/statistics-metrics.test.mjs tests/export-data.test.mjs tests/mock-fixtures.test.cjs` passed 14/14; all draft-enabled modules parse; `git diff --check` passed.
- **Remaining blocker / Blocage restant:** populated browser confirmation of restore-after-reload remains optional.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.

### Phase 8 - Complete professional booking edit contract / Contrat complet de modification de reservation

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/pro-dashboard/booking-edit.js`, `functions/booking-update-validation.js`, `functions/index.js`, `public/js/core/strings-fr.js`, and `tests/booking-update-validation.test.cjs`.
- **Behavior / Comportement:** professional editing now includes service name/duration/price, optional custom price, client-facing message, time range, contacts, and explicit recurring-series scope. Legacy bookings without a service remain editable. Private preparation notes stay owner-only.
- **Security / Securite:** the callable validates bounded values and applies them only after authenticated professional ownership and idempotent series-scope checks; direct browser field writes remain outside the allowed booking update path. The public schedule mirror is separately constrained by Firestore nested allow-list/type/range rules and cannot carry private profile or client fields.
- **Evidence / Preuves:** `node --test tests/booking-update-validation.test.cjs tests/booking-series.test.cjs tests/booking-contacts.test.cjs tests/draft-storage.test.mjs` passed 16/16; Functions and browser modules parse; `git diff --check` passed.
- **Remaining blocker / Blocage restant:** populated browser confirmation of editing a recurring booking with service and price fields remains optional.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.

### Phase 5 / 7 - Schedule-type configuration / Configuration du type de reservation

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/pro-dashboard/working-hours.js`, `public/js/schedule/schedule-settings.mjs`, `public/js/schedule/schedule-render.js`, `public/js/core/strings-fr.js`, and `tests/schedule-settings.test.mjs`.
- **Behavior / Comportement:** professionals can persist drag or fixed-slot mode, bounded fixed duration, recurrence allowance/cap, multi-slot preference, and permanent/from-date/single-day activation settings. The renderer honors drag versus fixed click creation and activation windows, and the public profile consumes a safe mirror of working days, hours, service duration, and activation settings. Existing recurring-series mutation remains separately scoped.
- **Evidence / Preuves:** `node --test tests/schedule-settings.test.mjs tests/schedule-selection.test.mjs tests/booking-update-validation.test.cjs tests/booking-series.test.cjs` passed 14/14; schedule, working-hours, public-profile, settings, and strings modules parse; Firestore emulator initialization succeeded after nested public-schedule rule validation; `git diff --check` passed.
- **Remaining blocker / Blocage restant:** populated browser confirmation of fixed-slot creation, multi-selection, and public schedule activation remains optional.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.

### Phase 12 - Occupancy and client retention metrics / Occupation et retention client

- **Status / Statut:** `HUMAN + AI VERIFIED`
- **Mockup reference / Reference mockup:** professional statistics and analytics dashboard.
- **Production owner / Responsable production:** `public/js/pro-dashboard/statistics.js`, `public/js/pro-dashboard/statistics-metrics.mjs`, `public/js/core/strings-fr.js`, and `docs/architecture/pro-dashboard/statistics.md`.
- **Data and rules / Donnees et regles:** authorized professional bookings and private `proProfiles/{uid}.workingHours` produce occupancy against available working minutes and repeat-client retention for the active date/status filters. Rejected bookings do not count as occupied or retained activity.
- **Build check / Auto-verification:** metric helper tests pass; statistics and strings modules parse; no new write path or security-rule change was added.
- **Evidence / Preuves:** `node --test tests/statistics-metrics.test.mjs` passed 2/2; browser verification on `http://127.0.0.1:5000/pro-dashboard.html` with disposable emulator fixtures rendered `Occupation 14 % (2 h / 14 h)` and `Rétention client 100 % (1 / 1 clients récurrents)` with explanatory tooltips.
- **Human result / Resultat humain:** `Pass`
- **Remaining blocker / Blocage restant:** populated browser confirmation of the complete chart surface remains optional; disposable browser fixtures are emulator-only.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.
- **Date, testeur, notes / Date, testeur, notes:** 2026-09-14 - AI and browser verification completed; no reimplementation is required.

### Phase 12 - Trend and category reporting / Suivi de tendance et repartition par categorie

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** professional statistics and analytics dashboard with daily trend lines and category distribution bars.
- **Production owner / Responsable production:** `public/js/pro-dashboard/statistics.js`, `public/js/pro-dashboard/statistics-metrics.mjs`, and `public/js/core/strings-fr.js`.
- **Data and rules / Donnees et regles:** calculations use the currently filtered booking set, building a daily revenue trend across the selected date range and a category summary using the resolved booking price or service price. The status and activity selectors narrow the same booking set; gross revenue combines realized done revenue and pending/accepted revenue, while rejected and no-show bookings remain excluded from money totals. Rejected bookings stay visible in the filtered chart context unless the status selector narrows them away.
- **Build check / Auto-verification:** targeted trend/category/highlight/activity/revenue regression passes; the activity report now exports only completed (`done`) bookings and recalculates its highlights from that completed dataset; existing occupancy/retention metrics remain intact; every statistics metric and chart heading exposes a localized hoverable info affordance; the SVG trend line now plots daily revenue rather than booking counts and shares the same filtered aggregate as the bars and print report; the category-share visualization now uses deterministic contrasting segments with a labeled percentage legend; printable professional summaries now expose gross, realized, and in-progress revenue while excluding rejected/no-show amounts; dashboard exports, printable rows, and summaries share the custom-price/payment-balance/service-price fallback; the live dashboard and print report share the same reporting highlights; trend/category panels expose an explicit no-data state; touched modules parse without build errors; documentation and diff checks pass.
- **Evidence / Preuves:** `node --test tests/print-reports.test.mjs tests/statistics-metrics.test.mjs tests/export-data.test.mjs` passed 11/11, including peak-day, average-daily-revenue, leading-category-share, activity-filter, completed-only activity reporting, gross-revenue, printable revenue exclusion, and resolved-price coverage; `node --check` passed for the changed reporting modules; `git diff --check` passed.
- **Human result / Resultat humain:** `Optional pending`
- **Remaining blocker / Blocage restant:** populated browser confirmation remains optional; no external service gate.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.
- **Date, testeur, notes / Date, testeur, notes:** 2026-09-14 - trend and category reporting implemented and regression-tested locally; no reimplementation required.

### Phase 4 / 9 - Responsive professional mobile navigation / Navigation mobile professionnelle

- **Mockup reference / Reference mockup:** mobile navbar with one accessible menu trigger containing account, print, notifications, settings, and logout.
- **Production owner / Responsable production:** `public/js/pro-dashboard/navbar-pro.js`, `public/assets/css/pro-dashboard.css`, `public/js/core/strings-fr.js`.
- **Data and rules / Donnees et regles:** UI-only; no new collection or rule.
- **Build check / Auto-verification:** syntax, diagnostics, full 34-test suite, and diff checks pass.
- **Human steps / Etapes humaines:** resize to 375 px, open Menu, verify all actions are inside the expanded group, then close it and verify the schedule remains usable.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Accessible mobile trigger and responsive action group implemented; browser verification remains pending.
- **Resume rule / Regle de reprise:** start from this checkpoint and the first `Partial` row below; do not restart any item listed under Implemented and regression-tested.

### Phase 11 - Unified client communication history / Historique unifie des communications client

- **Mockup reference / Reference mockup:** CRM client history and reservation message-thread surfaces.
- **Production owner / Responsable production:** `public/js/pro-dashboard/client-communication-history.js`, `public/js/pro-dashboard/client-database.js`, `public/assets/css/pro-dashboard.css`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** the professional CRM reads authorized `bookings/{bookingId}/messages` subcollections for one active-profile client and renders a read-only chronological view. No new collection or write path is introduced.
- **Build check / Auto-verification:** full serial local emulator suite passes 37/37; new modules pass syntax and diagnostics checks; Firestore rules remain compiled successfully.
- **Human steps / Etapes humaines:**
  1. Ouvrez Reglages puis Base clients et ouvrez un client ayant plusieurs reservations. / Open Settings then Client database and open a client with several bookings.
  2. Cliquez Historique des messages et verifiez l'ordre chronologique, l'auteur et la reservation source. / Click Message history and verify chronological order, author, and source booking.
  3. Comparez avec le fil d'une reservation et verifiez qu'aucun autre client n'est visible. / Compare it with one booking thread and verify no other client is visible.
- **Responsive check / Verification responsive:** desktop 1440 px and mobile 375 px; timeline cards wrap without horizontal overflow.
- **Privacy check / Verification confidentialite:** only the active-profile professional can load the CRM view; the timeline is read-only and does not expose messages to client/public surfaces.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Unified chronological message timeline and polished CRM action added; automated validation passed. Browser verification remains pending.

### Phase 8-11 - Today view and booking notification panel / Vue Aujourd'hui et notifications de reservations

- **Mockup reference / Reference mockup:** professional navbar notification bell and compact Today widget.
- **Production owner / Responsable production:** `public/pro-dashboard.html`, `public/js/pro-dashboard/today-view.js`, `public/js/pro-dashboard/today-widget-toggle.mjs`, `public/js/pro-dashboard/navbar-pro.js`, `public/js/pro-dashboard/pro-dashboard.js`, `public/assets/css/pro-dashboard.css`.
- **Data and rules / Donnees et regles:** the module projects authorized active-profile booking DTOs into today's appointments and accepted upcoming reminders, while the notification panel reads persistent `notifications/{uid}/items` for booking, message, and waitlist events and falls back to pending/upcoming booking DTOs when unavailable. Richer notification preferences remain future work.
- **Build check / Auto-verification:** complete serial local emulator suite passes 37/37; dashboard modules pass syntax checks; Firestore rules compile; `git diff --check` passes. Empty Today widget interactions pass 3/3 focused Node tests (`tests/today-widget-toggle.test.mjs`).
- **Human steps / Etapes humaines:**
  1. Ouvrez le tableau professionnel avec des reservations aujourd'hui et une demande en attente. / Open the professional dashboard with today's bookings and one pending request.
  2. Verifiez le prochain rendez-vous et la liste du jour sous la barre de navigation. / Verify the next appointment and daily lineup below the navbar.
  3. Ouvrez l'icone Notifications, selectionnez une demande, puis verifiez que la reservation correspondante est selectionnee dans la sidebar. / Open Notifications, select a request, and verify the matching booking is selected in the sidebar.
  4. Sans rendez-vous aujourd'hui, verifiez que la barre reste compacte et sans chevron, s'ouvre temporairement au survol, puis reste ouverte ou se referme au clic, au toucher, avec Entree et avec Espace. / With no appointments today, verify that the bar remains compact and arrow-free, opens temporarily on hover, then stays open or closes by click, tap, Enter, and Space.
- **Responsive check / Verification responsive:** desktop 1440 px and mobile 375 px; the Today widget and notification panel remain readable without horizontal overflow.
- **Privacy check / Verification confidentialite:** only bookings already authorized for the active professional profile feed the projection; no client or public surface reads notification data.
- **Timezone / Fuseau horaire:** Today filtering, appointment times, booking notification times, and persisted notification timestamps use the saved professional timezone.
- **CRM communication / Communication CRM:** unified client message and source-booking timestamps use the same saved professional timezone.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Today widget, SVG notification control, pending/upcoming panel, sidebar selection, and compact empty-state interactions implemented; full automated validation and focused interaction tests passed. Browser verification remains pending.

### Phase 8-11 - Persistent booking notifications / Notifications persistantes de reservation

- **Mockup reference / Reference mockup:** professional navbar notification bell and booking attention panel.
- **Production owner / Responsable production:** `functions/index.js` (`createBookingNotification`, `createMessageNotification`), `firestore.rules`, `public/js/pro-dashboard/today-view.js`, and `public/js/pro-dashboard/pro-dashboard.js`.
- **Data and rules / Donnees et regles:** trusted Firestore triggers create `notifications/{uid}/items/{notificationId}` for booking creation/status changes and new booking messages. Additional profile IDs are resolved to owner Auth UIDs and active delegates with the relevant permission. Recipients can read their own notifications and update only nullable `readAt`; direct client creation/deletion is denied.
- **Build check / Auto-verification:** complete serial local emulator suite passes 37/37; Functions and browser syntax checks pass; Firestore rules compile; `git diff --check` passes.
- **Human steps / Etapes humaines:**
  1. Creez ou modifiez une reservation, puis ouvrez Notifications dans le tableau professionnel. / Create or update a booking, then open Notifications in the professional dashboard.
  2. Envoyez un message dans un fil et verifiez qu'une notification persistante apparait pour le destinataire autorise. / Send a thread message and verify a persistent notification appears for the authorized recipient.
  3. Cliquez une notification et rechargez la page; verifiez qu'elle est marquee comme lue et qu'un compte non autorise ne peut pas la lire. / Select a notification and reload; verify it is marked read and an unauthorized account cannot read it.
- **Responsive check / Verification responsive:** desktop 1440 px and mobile 375 px; unread/read notification rows remain readable without horizontal overflow.
- **Privacy check / Verification confidentialite:** notification documents contain only safe booking/message references and a short body; mail, payment, private-note, and unrelated-client data are excluded.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Persistent trigger-backed notifications and read-state rules implemented; automated validation passed. A disposable emulator QA fixture created a pending booking, an accepted booking, a booking message, and notification documents; the professional sidebar showed the booking and the notification panel opened without blocking on Firestore hydration. Fixtures were deleted afterward. Full populated read-state and Today-date rendering remain pending for human sign-off.

### Phase 8 - Waitlist release notifications / Notifications de liberation de liste d'attente

- **Mockup reference / Reference mockup:** occupied public slot, waitlist enrollment, and notification center.
- **Production owner / Responsable production:** `functions/index.js` (`notifyWaitlistOnBookingRelease`), `notifications/{uid}/items`, and existing waitlist entries.
- **Data and rules / Donnees et regles:** when a matching booking becomes rejected or cancelled, up to 25 unnotified waitlist entries for the same professional/start/end receive a persistent in-app notification and are marked notified server-side. Direct waitlist writes remain denied.
- **Build check / Auto-verification:** full local suite, Function syntax, and Firestore rules validation pass.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Server-side waitlist release notification trigger implemented; real mailbox delivery and populated browser click-through remain pending.

### Phase 8 / 13 - Profile-scoped delegated access / Acces delegue par profil

- **Mockup reference / Reference mockup:** professional settings delegated-access panel and restricted booking-management actions.
- **Production owner / Responsable production:** `functions/index.js` (`addProfessionalDelegate`, `removeProfessionalDelegate`, `listDelegatedBookings`), `public/js/pro-dashboard/delegated-access.js`, `public/js/pro-dashboard/pro-dashboard.js`, `public/js/pro-dashboard/navbar-pro.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** an owner can grant `manageBookings` and/or `manageMessages` independently on multiple profiles. Delegates cannot read booking documents directly; the trusted listing callable returns only schedule/service/status fields and omits client identity/contact/address/intake, payment, pricing, movement, and note data. Removing one profile preserves other active assignments.
- **Build check / Auto-verification:** `tests/delegated-access-emulator.test.cjs` passes direct-read denial, sanitized projection, booking update permission, messages-only read/send, bookings-only denial, owner-only notes, atomic authorized/unauthorized batches, owner/delegate notification routing, multi-profile removal, and post-removal denial. Rules and touched modules pass focused checks.
- **Human steps / Etapes humaines:**
  1. Depuis Réglages > Accès délégué, ajoutez un compte Auth existant avec une permission. / From Settings > Delegated access, add an existing Auth account with one permission.
  2. Connectez-vous avec le compte délégué et vérifiez que seul le profil assigné apparaît, sans réglages propriétaires. / Sign in with the delegate account and verify only the assigned profile appears, without owner settings.
  3. Vérifiez les actions autorisées, puis retirez l'accès et confirmez que les réservations ne sont plus accessibles. / Verify permitted actions, then remove access and confirm bookings are no longer accessible.
- **Responsive check / Verification responsive:** desktop 1440 px and mobile 375 px; delegate list and permission controls remain readable without horizontal overflow.
- **Privacy check / Verification confidentialite:** claims and profile maps are server-controlled; delegates never become owners and receive no client identity/contact/address/intake, payment, movement, pricing, private-note, profile-setting, or erasure data/control.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-14 - Hardened with server-sanitized projections, independent message permission, additive multi-profile claims, atomic batches, private-note isolation, and profile-aware notifications; focused emulator test passes. Browser verification remains pending.

| Area | Status | Remaining scope |
|---|---|---|
| Phases 0-4: setup, scaffolding, auth, security, dashboard shell | Implemented | Live Function parity was restored selectively on 2026-09-13; Artifact Registry cleanup policy remains operational follow-up. |
| Phases 5-8: working time, discovery, schedule, booking operations | Partial | Core flows, configurable buffer time, professional services/package settings, client service snapshots, trusted waitlist enrollment/release notification, intake questionnaire answers, meeting links, messaging, quick replies, private notes, delegates, atomic batch actions, and persistent notification/today views exist. Populated-browser parity and richer notification preferences remain. |

### Phase 8 - Booking-linked meeting links / Liens de reunion lies aux reservations

- **Mockup reference / Reference mockup:** professional booking context menu with links action and authorized client booking surface.
- **Production owner / Responsable production:** `functions/index.js` (`updateBookingMeetingLinks`), `public/js/pro-dashboard/booking-context-menu.js`, `public/js/pro-dashboard/pro-dashboard.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** the owning professional can replace up to five sanitized HTTPS `{label,url}` links on a booking through the trusted callable; direct unauthorized writes are denied and an audit event is recorded.
- **Build check / Auto-verification:** syntax, rules compilation, and the complete 34-test suite pass. Browser interaction remains pending.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Trusted meeting-link callable and context-menu action implemented; full browser verification remains pending.

### Phase 8 - Booking-linked messaging / Messagerie liee aux reservations

- **Mockup reference / Reference mockup:** professional booking sidebar/context menu message action and the matching client reservation thread.
- **Production owner / Responsable production:** `functions/index.js` (`sendBookingMessage`), `public/js/shared/booking-messages.js`, `public/js/sidebar/sidebar-feed.js`, `public/js/client-dashboard/client-bookings.js`, `public/js/pro-dashboard/pro-dashboard.js`, `public/js/client-dashboard/client-dashboard.js`, `firestore.rules`, and `functions/index.js` mail queue.
- **Data and rules / Donnees et regles:** messages are stored under `bookings/{bookingId}/messages/{messageId}` by the trusted callable only. The booking client or professional may send; authorized shared-history clients may read; unrelated clients and direct browser writes are denied. Optional notification queueing honors `notificationPreferences/{uid}.messageEmail`, and a failed queue attempt leaves the saved message intact.
- **Build check / Auto-verification:** focused booking-series emulator regression and complete serial suite pass 37/37; `functions/index.js` and the shared browser module pass syntax checks; Firestore rules diagnostics pass. Real Trigger Email delivery remains an external setup gate.
- **Human steps / Etapes humaines:**
  1. Ouvrez une reservation comme professionnel et envoyez un message depuis la carte. / Open a booking as the professional and send a message from the card.
  2. Ouvrez la meme reservation comme client, lisez le fil et repondez avec ou sans notification email. / Open the same booking as the client, read the thread, and reply with or without email notification.
  3. Verifiez qu'un compte non autorise ne voit pas le fil et qu'un partage d'historique reste en lecture seule. / Verify an unrelated account cannot read the thread and a shared-history view remains read-only.
- **Responsive check / Verification responsive:** desktop 1440 px and mobile 375 px; message dialog and cards must wrap without horizontal overflow.
- **Privacy check / Verification confidentialite:** only the booking client, owning active professional, admin, or authorized shared-history reader can read; only the booking client or professional can send; message bodies and mail queue documents remain unavailable to unrelated users.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Trusted callable, notification preference boundary, queue creation, direct-write denial, authorized reads, and unrelated-client denial passed in the local emulator. Browser interaction and real mailbox delivery remain pending.

### Phase 5-8 - Waitlist enrollment / Liste d'attente

- **Mockup reference / Reference mockup:** occupied public schedule slot and client booking/waitlist flow.
- **Production owner / Responsable production:** `public/profile.html`, `public/js/profile-public/profile-view.js`, `functions/index.js` (`joinBookingWaitlist`), `firestore.rules`.
- **Data and rules / Donnees et regles:** authenticated clients can request a specific occupied professional/time window through the trusted callable; direct `waitlistEntries/{proId}/entries/{entryId}` writes are denied. The owner/client read boundary is explicit and notification processing remains server-side.
- **Build check / Auto-verification:** rules compile, complete serial emulator suite passes 37/37, callable is deployed, and live Hosting exposes the waitlist control and callable client code.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-14 - Live browser verification against the local emulator succeeded: an authenticated client signed in at `login.html`, opened the seeded `demo-waitlist-profile` page, selected an occupied slot, and clicked the waitlist action; the UI confirmed “Vous serez prévenu si ce créneau se libère.” The action is therefore live-validated end-to-end on the public profile flow.
| Phases 9-10: client dashboard, search, payments, movement | Partial | Core dashboard/search/payment/movement slices exist, immutable legal acceptance is implemented through trusted Functions, and the saved client timezone now drives schedule day and slot matching. Complete workflow parity still needs confirmation. |

### Phase 9 - Client timezone schedule application / Application du fuseau horaire client

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** client dashboard schedule and timezone control.
- **Production owner / Responsable production:** `public/js/client-dashboard/client-dashboard.js`, `public/js/client-dashboard/client-schedule.js`, and `public/js/client-dashboard/client-profile-settings.js`.
- **Behavior / Comportement:** the persisted `clientAccounts/{uid}.timezone` value controls the current-week boundaries, booking slot matching, and locked professional busy-slot matching. The default remains `Europe/Paris`.
- **Booking list / Liste des reservations:** the same timezone controls the date and time shown for own and authorized shared-history bookings in the client booking feed.
- **Payment and change request / Paiement et demande de changement:** active-booking choices and prefilled request-change datetime fields use the same persisted timezone.

### Phase 5 / 7 - Professional schedule timezone application / Application du fuseau horaire du professionnel

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** professional schedule date navigation and booking grid.
- **Production owner / Responsable production:** `public/js/pro-dashboard/pro-dashboard.js`, `public/js/schedule/schedule-render.js`, and `public/js/pro-dashboard/working-hours.js`.
- **Behavior / Comportement:** the persisted `workingHours.timezone` value controls professional schedule week dates and booking slot matching; date labels are derived from the resulting ISO calendar date so timezone boundaries cannot shift them by one day, with `Europe/Paris` as the safe fallback.
- **Evidence / Preuves:** `node --check` passes for `schedule-render.js` and `pro-dashboard.js`; the focused statistics/print/export suite passes 7/7; `git diff --check` passes.
- **Human result / Resultat humain:** `Optional pending`
- **Remaining blocker / Blocage restant:** populated browser confirmation with a non-Paris professional timezone remains optional.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, documentation parity, performance checks, and external delivery gates.

### Populated browser batch - Professional dashboard and timezone/reporting surfaces / Batch navigateur peuple

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Environment / Environnement:** Firebase Local Emulator Suite with Hosting `127.0.0.1:5000`, Auth `9099`, Firestore `8080`, and Functions `5001`; disposable professional and booking fixtures only.
- **Verified behavior / Comportement verifie:** signed-in professional dashboard loaded; `America/Montreal` appeared selected in Horaires et absences; a booking stored at `13:00Z` rendered at `09:00` in Today, sidebar, and schedule; a pending booking rendered at `16:00` on 15/09; responsive Menu exposed Imprimer, Notifications, Réglages, and Déconnexion; printer menu exposed four report modes plus the checked anonymization toggle.
- **Evidence / Preuves:** browser accessibility snapshots confirmed the populated dashboard, schedule cells, Today appointment, settings timezone selection, and print-menu options. Local emulator startup reached `All emulators ready`.
- **External gates / Portes externes:** Trigger Email still requires a real mailbox delivery check; Google Calendar still requires real OAuth consent and event synchronization. Emulator startup warns that Pub/Sub and Storage were not included in this visual batch.
- **Remaining blocker / Blocage restant:** CRM communication timeline and delegated sign-in/action restrictions still need populated browser confirmation.
- **Next implementation slice / Prochaine tranche:** populated client dashboard flow, then delegated/CRM browser checks and external delivery gates.

### Populated browser batch - Client dashboard and timezone/reporting surfaces / Batch navigateur peuple client

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Environment / Environnement:** the same Firebase Local Emulator Suite with a disposable authenticated client, client account timezone, public professional profile, and authorized accepted booking.
- **Verified behavior / Comportement verifie:** client dashboard loaded; switching to `Acceptées` showed the booking at `09:00`; the client calendar showed the same professional booking at `09:00`; the client print menu exposed four report modes and its privacy toggle; the profile modal showed `America/Montreal` selected; the payment modal showed the authorized professional, `60.00 €` balance, one-hour duration, and a correct empty payment-options state.
- **Evidence / Preuves:** browser accessibility snapshots confirmed the populated client booking feed, timezone selection, print menu, calendar slot, and payment context. The disposable account, booking, and public profile were deleted afterward.
- **External gates / Portes externes:** real payment-link navigation and mailbox delivery remain external or configuration-dependent checks; this batch did not create or expose payment credentials.
- **Remaining blocker / Blocage restant:** client message click-through, delegated sign-in/action restrictions, and external delivery/OAuth gates remain.
- **Next implementation slice / Prochaine tranche:** populated CRM communication and delegated-access browser verification, followed by external delivery gates.

### Client/professional dashboard visual parity / Parite visuelle des tableaux

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/client-dashboard.html`, `public/js/client-dashboard/navbar-client.js`, `public/js/client-dashboard/client-schedule.js`, `public/assets/css/client-dashboard.css`, and `public/js/core/strings-fr.js`.
- **Behavior / Comportement:** the client dashboard now uses the professional dashboard's wide canvas, sidebar-first desktop hierarchy, stronger schedule panel treatment, shared schedule heading structure, and responsive mobile action menu. At 390px, actions are hidden behind `Menu` and expand into the same account/print/logout pattern used by the professional dashboard.
- **Evidence / Preuves:** browser verification at `390x844` confirmed the French `Menu` trigger, `aria-expanded` transition from `false` to `true`, hidden-to-visible `.pro-actions` transition, and visible client print/account/logout controls. Cache-busted HTML, CSS, entry-module, navbar-module, and strings-module URLs were required so the browser received the updated parity surface; the first pass caught and fixed a missing client `mobileMenu` string before final confirmation.
- **Remaining blocker / Blocage restant:** populated client content parity at mobile and desktop remains optional follow-up; no functional authorization or data contract changed.
- **Next implementation slice / Prochaine tranche:** populated CRM communication and delegated-access browser verification, followed by external delivery gates.
- **Evidence / Preuves:** `node --check` passes for `client-dashboard.js` and `client-schedule.js`; `git diff --check` passes.
- **Human result / Resultat humain:** `Optional pending`

### Navbar icon-button consistency follow-up / Suite de coherence des icones de navigation

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/client-dashboard/navbar-client.js`, `public/js/pro-dashboard/navbar-pro.js`, `public/assets/css/client-dashboard.css`, `public/assets/css/pro-dashboard.css`.
- **Behavior / Comportement:** fixed three CSS defects that made the navbar action icons inconsistent between dashboards: (1) `.icon-button` (the circular dashed-border SVG button style) was entirely missing from `client-dashboard.css`, so client print/settings/logout buttons rendered unstyled; (2) `.icon-button`'s `width: 34px` unintentionally overrode `.navbar-icon-action`'s `width: 42px` due to CSS source order, producing non-square 34x42 buttons; (3) the professional notification button used `.btn.btn-ghost` instead of `.icon-button.navbar-icon-action`, so a `max-width: 560px` rule (`.btn, .chip-button { width: 100% }`) stretched it into a full-width dashed pill instead of a matching circular icon button. All action icon buttons (print, notifications, settings, logout) are now wrapped in a shared `.navbar-icon-group` flex row on both dashboards so they lay out identically as a horizontal row of uniform 42px circular SVG buttons at every viewport width, instead of each stacking on its own full-width row.
- **Evidence / Preuves:** browser verification signed in as both the seeded test professional and a disposable seeded test client at `355px` (mobile menu expanded) and `1400px` (desktop) confirmed four uniform circular icon buttons in a single row on both dashboards, matching styling and spacing. `node --check` passes for all four touched JavaScript files; `git diff --check` passes.
- **Remaining blocker / Blocage restant:** none functional; purely a visual/styling fix with no data or authorization changes.
- **Next implementation slice / Prochaine tranche:** populated CRM communication and delegated-access browser verification, followed by external delivery gates.

### Client professional-search retractable widget / Widget retractable de recherche professionnel

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `public/js/client-dashboard/client-professional-search.js`, `public/js/pro-dashboard/today-widget-toggle.mjs`, `public/js/pro-dashboard/today-view.js`, `public/assets/css/client-dashboard.css`, `public/js/core/strings-fr.js`.
- **Behavior / Comportement:** the client dashboard's "Rechercher un professionnel" section now retracts to a slim header row (eyebrow, title, saved-count badge) by default, previews open on mouse hover, and pins open/closed on click or Enter/Space on the header, matching the professional dashboard's "Votre journée" today-widget interaction pattern exactly. The shared `initializeQuietWidgetToggle` helper (previously only used by the professional today-widget) was generalized with optional `detailsSelector`/`toggleSelector` parameters so the toggle target can be the section header (leaving the search input, results, and saved-professional chips inside free of accidental collapse on click) while the whole section still previews on hover; existing calls with no options are unchanged.
- **Evidence / Preuves:** `node --test tests/today-widget-toggle.test.mjs` still passes 3/3 after the generalization. Browser verification as a disposable seeded test client confirmed: collapsed state (`54px`, `aria-expanded="false"`); click-to-pin expands and sets `aria-expanded="true"`; typing in the search input while pinned open does not collapse the section; click again collapses it back. `node --check` passes for all touched JavaScript files; `git diff --check` passes.
- **Remaining blocker / Blocage restant:** none functional; purely a UI interaction/styling change with no data or authorization changes.
- **Next implementation slice / Prochaine tranche:** populated CRM communication and delegated-access browser verification, followed by external delivery gates.
- **Remaining blocker / Blocage restant:** populated browser confirmation across a non-Paris timezone remains optional.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, documentation parity, performance checks, and external delivery gates.
| Phase 11: CRM and history | Partial | Core CRM controls, unified communication history, and rate/zone override application exist; full populated browser coverage remains open. |
| Phase 12: statistics and reporting | Partial | Core metrics, occupancy, retention, trend/category aggregates, richer chart visualizations, and print-ready reports exist; full populated-browser coverage remains open. |
| Phase 13: onboarding and admin platform | Partial | Onboarding, provisioning, bans, support/data queues, audit views, creation-link lifecycle, non-destructive and destructive account recovery, multi-profile creation/switching, lifecycle grace-period controls, category oversight, public-profile moderation, bounded broadcasts, health aggregates, bulk application review, and guarded permanent profile deletion now exist. Full populated-browser coverage and external delivery gates remain. |

### Phase 13 - Bulk professional application review / Revue groupee des demandes professionnelles

- **Mockup reference / Reference mockup:** admin command center application review and bulk decision controls.
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `functions/index.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** admin-only `bulkReviewProfessionalApplications` accepts up to 25 selected `pending-review` IDs and one `approved`/`rejected` decision, skips stale records, updates review metadata, and writes a safe audit event.
- **Build check / Auto-verification:** bulk status updates, bounded selection, audit path, and non-admin denial are covered by the local emulator test.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-14 - Local emulator browser verification on http://127.0.0.1:5000 confirmed seeded admin data rendered in the command center, a selected application updated from `pending-review` to `approved` after the confirmation dialog, and the request list reloaded without a UI error. The support queue selector also persisted a status change to `Completed` in the live dashboard.

### Phase 13 - Platform health analytics / Sante de la plateforme

- **Mockup reference / Reference mockup:** admin command center health/operations overview.
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `functions/index.js`, and existing Auth/Firestore/mail/log collections.
- **Data and rules / Donnees et regles:** admin-only `getPlatformHealthSummary` returns aggregate counts for profiles, clients, bookings, Auth users, mail queue/failures, privileged failures, Calendar errors, and audit events. Sensitive records remain server-side.
- **Build check / Auto-verification:** aggregate response shape and non-admin denial are covered by the local emulator test.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Focused emulator test passed: aggregate response shape and non-admin denial. Complete suite reached 31/31 after confirming a transient earlier claim-test timeout. Live Hosting exposes the health panel and `getPlatformHealthSummary` is deployed.

### Phase 13 - Platform broadcast announcements / Annonces plateforme

- **Mockup reference / Reference mockup:** admin command center communication tool.
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `functions/index.js`, and the Trigger Email `mail` queue.
- **Data and rules / Donnees et regles:** admin-only `queuePlatformBroadcast` accepts `clients`, `professionals`, or `both`, caps recipients at 500, queues one message per eligible Auth account, excludes disabled/admin accounts, and writes a safe audit event.
- **Build check / Auto-verification:** audience classification, queue creation, recipient cap path, and non-admin denial are covered by the local emulator test.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Focused emulator test passed: client audience classification, mail queue creation, professional exclusion, and non-admin denial. Complete suite reached 30/30 after a transient earlier claim-test timeout. Live Hosting exposes the broadcast form and `queuePlatformBroadcast` is deployed; real-mailbox delivery remains pending.

### Phase 13 - Public-profile moderation / Moderation des profils publics

- **Mockup reference / Reference mockup:** admin moderation tool and public profile content controls.
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `functions/index.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** `moderatePublicProfile` is admin-only, requires a reason and at least one redaction, clears selected public `shortDescription`/`avatarUrl` fields, preserves private profile data, and writes a `public-profile-moderated` audit event.
- **Build check / Auto-verification:** focused emulator test covers description/avatar redaction and non-admin denial.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-14 - Live browser verification on http://127.0.0.1:5000 confirmed the admin form accepted a profile ID, a moderation reason, and a description-redaction action; the confirmation dialog completed and the dashboard rendered `Modération appliquée et journalisée.` without error.

### Phase 13 - Category oversight / Surveillance des catégories

- **Mockup reference / Reference mockup:** admin command-center category rename and cleanup controls.
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `functions/index.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** `renamePlatformCategory` is admin-only and updates every public profile that currently uses the old category name to the new one while preserving the rest of the profile data.
- **Build check / Auto-verification:** category rename logic and admin-only guard are covered by local emulator validation.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-14 - Browser check on the local admin dashboard successfully renamed `Massage` to `Massage Plus`, confirmed the change in the category summary, and kept the page in a normal state with the result text `Catégorie renommée dans les profils concernés.`

### Phase 13 - Additional professional profile lifecycle / Cycle de vie du profil professionnel additionnel

- **Mockup reference / Reference mockup:** admin additional-profile creation and profile erasure lifecycle controls.
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `functions/index.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** the admin can create a secondary professional profile for an existing professional owner, schedule a 30-day erasure, and cancel that scheduled erasure without destroying the account profile.
- **Build check / Auto-verification:** local emulator coverage checks the create, schedule, and cancel paths with admin-only enforcement.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-14 - Browser validation on http://127.0.0.1:5000 confirmed `Profil supplémentaire créé.`, then the lifecycle form scheduled and cancelled the profile deletion without leaving the admin page in an error state; the final feedback was `Suppression annulée; le compte est réactivé.`
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Focused emulator test passed: description/avatar redaction and non-admin denial. Complete suite reached 29/29 after a transient earlier claim-test timeout. Live Hosting exposes the moderation form and `moderatePublicProfile` is deployed; browser interaction remains pending.

### Phase 13 - Category oversight / Surveillance des categories

- **Mockup reference / Reference mockup:** admin command center and category-oversight tool.
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `functions/index.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** admin-only aggregation of `publicProfiles.categories`; exact category rename is applied across public mirrors with duplicate removal and a `platform-category-renamed` audit event. Private professional settings are not changed.
- **Build check / Auto-verification:** usage inventory, rename, de-duplication, admin authorization, non-admin denial, and syntax checks pass in the local emulator.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Focused emulator test passed: category usage inventory, exact platform rename, duplicate removal, admin authorization, and non-admin denial. Complete suite reached 28/28. Live Hosting exposes the category form/list and both oversight callables are deployed; browser interaction remains pending.

### Phase 13 - Professional profile lifecycle / Cycle de vie du profil professionnel

- **Mockup reference / Reference mockup:** admin profile lifecycle, typed confirmation, limbo state, and recovery/cancellation flow.
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `functions/index.js`, and `docs/architecture/admin-dashboard.md`.
- **Data and rules / Donnees et regles:** `proProfiles/{profileId}.erasureRequest` records a mandatory 30-day grace period. Scheduling requires the exact `SUPPRIMER CE PROFIL` phrase, sets `accountStatus: "limbo"`, disables owners, and writes an audit event. Cancellation restores `active` state. No browser direct write can perform the lifecycle transition.
- **Build check / Auto-verification:** focused emulator test covers wrong confirmation denial, schedule, disabled owner, cancellation, and re-enabled owner.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Lifecycle scheduling/cancellation and permanent purge emulator tests passed: active/not-yet-expired profiles are rejected, expired `limbo` profiles delete their private/public pair, historical bookings remain, and the last owner Auth account is removed. Live Hosting exposes the lifecycle controls and `purgeProfessionalProfile` is deployed; browser interaction remains pending.

### Phase 13 - Multi-profile professional management / Gestion multi-profil professionnelle

- **Mockup reference / Reference mockup:** admin command center and professional dashboard account/profile switching.
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `public/js/pro-dashboard/pro-dashboard.js`, `public/js/pro-dashboard/navbar-pro.js`, `functions/index.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** one Auth UID may own several `proProfiles/{profileId}` and `publicProfiles/{profileId}` documents through the `owners` array. The admin callable creates the additional profile and audit event; the professional selector switches the active profile ID without re-authentication.
- **Build check / Auto-verification:** profile ownership query, admin creation authorization, profile mirror creation, selected-profile session state, and existing syntax/tests pass. Full browser verification with two populated profiles remains the focused human check.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Focused emulator test passed and complete suite reached 26/26. Live Hosting exposes the profile selector and admin profile-creation form; `createAdditionalProfessionalProfile` is deployed. Browser confirmation with two populated profiles and switching between their schedules remains pending.

### Phase 13 - Non-destructive account recovery / Recuperation d'acces sans suppression

- **Status / Statut:** `HUMAN + AI VERIFIED`
- **Mockup reference / Reference mockup:** admin security/recovery control and account access recovery flow.
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `functions/index.js`, and `docs/architecture/admin-dashboard.md`.
- **Data and rules / Donnees et regles:** trusted `issueAccountRecovery` accepts an admin-supplied UID or email, generates a server-side Firebase password-reset link, queues `mail/{messageId}`, preserves linked profiles/bookings, and writes an audit event. The reset URL is never returned to the browser.
- **Build check / Auto-verification:** admin authorization, non-admin denial, queue creation, preserved profile data, and syntax checks pass in the local emulator.
- **Human result / Resultat humain:** `Pass`
- **Evidence / Preuves:** focused emulator test passes preserve-data recovery, admin-only authorization, queue creation, and linked-profile retention.
- **Remaining blocker / Blocage restant:** real mailbox delivery remains external.
- **Next implementation slice / Prochaine tranche:** destructive account recovery with typed confirmation.
- **Date, testeur, notes / Date, testeur, notes:** 2026-09-13 - Focused emulator test passed. Live Hosting verification confirmed the recovery surface and callable. Preserve mode is complete; destructive mode was implemented as the next slice.

### Phase 13 - Destructive account recovery / Recuperation d'acces avec suppression

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** admin security/recovery control with explicit destructive mode.
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `functions/index.js`, `docs/architecture/admin-dashboard.md`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** admin-only `issueAccountRecovery` accepts `wipeLinkedData: true` only with the exact `EFFACER TOUTES LES DONNEES` phrase. It deletes linked bookings and nested messages/private records, professional/client profile data, client records, relationships, waitlist entries, notifications, preferences, tokens, and profile-owned mirrors while preserving the Auth account and audit log.
- **Build check / Auto-verification:** wrong confirmation is rejected; the preserve path still retains linked data; the wipe path removes linked data and nested booking records while the target Auth account remains available for password recovery.
- **Evidence / Preuves:** `tests/admin-account-recovery-emulator.test.cjs` passes 2/2, including the existing preserve path and the new wipe path; `node --check functions/index.js` passed.
- **Human result / Resultat humain:** `Optional pending`
- **Remaining blocker / Blocage restant:** real mailbox delivery and optional populated admin-browser confirmation remain.
- **Next implementation slice / Prochaine tranche:** Phase 11 CRM rate/zone overrides.
- **Date, testeur, notes / Date, testeur, notes:** 2026-09-14 - Typed-confirmation wipe and Auth preservation implemented and AI-verified. No reimplementation is required.
| Phase 14: Google Calendar | Partial / external gate | OAuth state, callback, token storage, settings, sanitized import, watch/webhook, export/update, range refetch, and scheduled reminders exist. Real Google consent/event/mailbox verification remains. |
| Phases 15-16: printing, documentation, final QA, deployment | Partial | Professional and client four-mode print menus, anonymous-mode controls, filtered CRM history PDF export, and professional local JSON export exist. Documentation parity, performance checks, complete role coverage, populated-browser confirmation, and final release checks remain. |

**Current truth / Etat actuel:** the reservation-identity roadmap, major Phase 13 admin capability set, notification preferences, daily digest, booking-change delivery, reminder delivery, destructive account recovery, CRM rate/zone overrides, Phase 12 analytics/reporting, the professional/client four-mode print workflow with anonymous-mode controls, filtered CRM history PDF export, and professional local data export are implemented and locally regression-tested. The application as a whole is not yet feature-complete against the Master Specification. The next development priority is remaining populated-browser verification, final UI polish, documentation parity, performance checks, and external delivery gates.

### Phase 15 - Professional local data export / Export local des donnees professionnelles

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** CRM and reports area with local professional data export.
- **Production owner / Responsable production:** `public/js/pro-dashboard/navbar-pro.js`, `public/js/pro-dashboard/pro-dashboard.js`, `public/js/shared/export-data.js`, and `public/js/core/strings-fr.js`.
- **Data and privacy / Donnees et confidentialite:** the settings action exports only the authenticated professional identity, active profile ID, and allow-listed authorized booking fields. Firebase tokens, credentials, private preparation notes, and arbitrary document fields are excluded; file creation is local and has no server write.
- **Build check / Auto-verification:** focused allow-list regression passes; touched modules parse; documentation and diff checks pass.
- **Evidence / Preuves:** `node --test tests/export-data.test.mjs tests/print-reports.test.mjs tests/statistics-metrics.test.mjs` passed 7/7; all touched JavaScript modules pass `node --check`; `git diff --check` passes.
- **Human result / Resultat humain:** `Optional pending`
- **Remaining blocker / Blocage restant:** browser confirmation of the settings action and remaining external delivery gates are pending.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.

### Phase 15 - Professional print report menu / Menu des rapports imprimables professionnels

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** professional navbar printer action and activity-report workflow.
- **Production owner / Responsable production:** `public/js/pro-dashboard/navbar-pro.js`, `public/js/pro-dashboard/pro-dashboard.js`, `public/js/shared/print-reports.js`, and `public/js/core/strings-fr.js`.
- **Data and privacy / Donnees et confidentialite:** the menu generates reports locally from already authorized dashboard bookings. Schedule output anonymizes client labels; monthly, price-inclusive, and summary reports remain local and are never uploaded. Printable summaries expose gross, realized, and in-progress revenue while excluding rejected/no-show amounts; rows resolve custom price, payment balance, then service price consistently.
- **Build check / Auto-verification:** four report modes are wired through the existing print builder; revenue totals and fallback resolution share the dashboard contract; focused regression and touched-module syntax checks pass.
- **Evidence / Preuves:** `node --test tests/print-reports.test.mjs tests/statistics-metrics.test.mjs tests/export-data.test.mjs tests/client-history-filter.test.mjs` passed 11/11; all changed JavaScript modules pass `node --check`; `git diff --check` passes.
- **Human result / Resultat humain:** `Optional pending`
- **Remaining blocker / Blocage restant:** browser confirmation of the printer menu and real external delivery gates remain optional/pending.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.

### Phase 15 - Print anonymous-mode toggle / Toggle d'anonymisation des rapports

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Mockup reference / Reference mockup:** dashboard printer menu with privacy options.
- **Production owner / Responsable production:** `public/js/pro-dashboard/navbar-pro.js`, `public/js/client-dashboard/navbar-client.js`, `public/js/pro-dashboard/pro-dashboard.js`, `public/js/client-dashboard/client-dashboard.js`, and `public/js/shared/print-reports.js`.
- **Behavior / Comportement:** both dashboards expose an explicit anonymous-mode checkbox. Professional schedule printing defaults to anonymized client labels; the client schedule defaults to the visible professional label, and either choice can be changed before printing.
- **Shared history / Historique partage:** client reports include only the client's own bookings plus relationships already authorized through the active shared-history scope.
- **Evidence / Preuves:** `node --test tests/print-reports.test.mjs tests/export-data.test.mjs` passed 4/4; all five touched JavaScript modules pass `node --check`; `git diff --check` passes.
- **Human result / Resultat humain:** `Optional pending`
- **Remaining blocker / Blocage restant:** browser confirmation of both toggle states remains optional.
- **Next implementation slice / Prochaine tranche:** remaining populated-browser verification, final UI polish, and external delivery gates.

### Phase 13 - Professional creation links / Liens de creation professionnelle

- **Mockup reference / Reference mockup:** admin command center, creation-link management, and professional account creation flow.
- **Production owner / Responsable production:** `public/admin-dashboard.html`, `public/js/admin/admin-dashboard.js`, `public/register-professional.html`, `functions/index.js`, `firestore.rules`.
- **Data and rules / Donnees et regles:** admin-only `creationLinks` documents contain a token hash, confirmed email, expiry, usage cap, remaining uses, status, and redeemed profile metadata. Browser reads and writes are denied; trusted Functions issue, revoke, and redeem links.
- **Build check / Auto-verification:** admin issuance, hashed storage, valid redemption, professional claim/profile provisioning, usage exhaustion, replay denial, syntax checks, and complete emulator suite pass.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Local emulator regression passed for admin issue -> redeem -> provision -> exhaust -> replay denial. Frontend page and admin controls are deployed to Hosting; live callable inventory verification follows deployment.

## Entry Template / Modele d'entree

### Phase [number] - [feature] / [fonction]

- **Status / Statut:** `DONE | AI VERIFIED - HUMAN CHECK OPTIONAL | HUMAN + AI VERIFIED | BLOCKED - EXTERNAL/HUMAN ACTION REQUIRED`
- **Mockup reference / Reference mockup:** [screen, menu, modal, or interaction]
- **Production owner / Responsable production:** [HTML page and JS/CSS modules]
- **Data and rules / Donnees et regles:** [Firestore/Storage paths, security-rule cases, or `none` for purely visual work]
- **Feature flag / Feature toggle:** [name and initial state]
- **Build check / Auto-verification:** page loads, console clean, relevant unit/emulator tests pass, architecture documentation updated.
- **Evidence / Preuves:** [commands, test counts, emulator/browser result, diagnostics, and documentation check]
- **Human steps / Etapes humaines:**
  1. [French step] / [English step]
  2. [French step] / [English step]
  3. [French expected result] / [English expected result]
- **Responsive check / Verification responsive:** desktop width [value]; mobile width [value].
- **Privacy check / Verification confidentialite:** [anonymous/client/pro/delegate/admin result].
- **Human result / Resultat humain:** `Not required | Optional pending | Pass | Fail | Notes`
- **Remaining blocker / Blocage restant:** [none, or the exact external/human-only check]
- **Next implementation slice / Prochaine tranche:** [the next feature to develop and test]
- **Date, tester, notes / Date, testeur, notes:**

## Mockup Parity Checklist / Checklist de parite mockup

Use this checklist when a production module replaces a mockup behavior. / Utilisez cette checklist lorsqu'un module de production remplace un comportement du mockup.

- [ ] Public and unrelated-client bookings show only anonymous unavailable time ranges.
- [ ] A client sees only their own booking details and authorized payment data.
- [ ] A professional sees bookings for only the active profile and can use schedule/sidebar actions.
- [x] A delegate sees only granted booking-management actions. Verified by sanitized callable projection, conditional dashboard controls, and focused emulator permissions on 2026-09-14; populated browser sign-off remains tracked separately.
- [ ] A context menu, modal, dropdown, or mobile navigation control closes cleanly and does not overlap interactive UI.
- [ ] A form has clear validation and autosave/saved feedback.
- [ ] A reversible status or configuration change can be undone where the specification requires it.
- [ ] A destructive flow remains open with a readable error until typed confirmation succeeds.
- [ ] Desktop and mobile layouts have no horizontal overflow and preserve the intended schedule/sidebar order.
- [ ] Professional schedule matches the mockup for day views, time grid, availability, booking states, date controls, creation/context actions, and sidebar relationship.
- [ ] Client schedule matches the mockup for own bookings, timezone display, pending/accepted states, and locked-professional anonymous busy ranges.
- [ ] Public profile schedule matches the mockup for day columns, available/occupied treatments, booking entry, responsive behavior, and anonymous visibility.
- [ ] Locked-professional schedule shows one authorized anonymous busy-slot overlay with the same approved geometry and status language as the client/public schedule.
- [ ] Schedule parity is checked at desktop and mobile widths with timezone-boundary and role-privacy fixtures; any unverified difference is recorded as a blocker.
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
- **Progress / Avancement (2026-09-13):** additional contacts - implemented, human `Pass`. Verified booking claim - implemented, human `Pass`. Series-scope modification - implemented, human `Pass`. Mutual history relationship - implemented, human `Pass`. Optional email-link sign-in - implemented, human `Pass`.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-12 - Human validation performed locally on the Firebase emulator stack: generated a real Auth email-signin OOB link, opened the local `login.html?mode=signIn&oobCode=...` URL, entered `client.test@jr-booking-premium.local`, clicked the magic-link flow, and was redirected to the client dashboard without a password or generic error. A browser-side sign-in follow-up also remained stable after the action completed.

### Reservation identity plan review gate / Gate de revue du plan identite reservation

- **Must be confirmed before implementation / A confirmer avant implementation:** ten-contact cap with one primary and roles `primary`, `guardian`, `payer`, `participant`, `assistant`; exact professional/client/server field allow-lists; server-only single-use claim tokens; claim states and admin-only conflict resolution; separate remove-contact/unlink-claim/revoke-history actions; occurrence-level series model with `this`, `this-and-following`, and `all-in-series`; immutable audit events; optional Firebase email-link recovery with password fallback; no PIN-only authentication; immutable `YYYY-MM-DD` terms/privacy acceptance records.
- **Documentation audit / Audit documentaire:** verify `MASTER_SPECIFICATION.md`, `database_schema.md`, `booking-identity-linking.md`, `booking-creation.md`, `booking-actions.md`, and `auth-guard.md` define the same roles, fields, authorities, states, scopes, and event names. `git diff --check` must pass. This gate approves documentation only and does not assert that application code or rules are implemented.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-11 - Human operator approved the documentation plan; implementation and behavior verification remain separate pending gates.

### Reservation identity implementation - Additional contacts / Implementation identite reservation - Contacts supplementaires

- **Production owner / Responsable production:** `public/js/pro-dashboard/booking-contacts.js`, `public/js/pro-dashboard/booking-creation.js`, `public/js/pro-dashboard/booking-edit.js`, `functions/booking-contacts.js`, `functions/index.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** trusted `createProfessionalBooking` and `updateProfessionalBooking` callables write normalized `bookings.contacts` and immutable contact audit events. Direct professional contact writes and direct client contact injection are denied.
- **Build check / Auto-verification:** contact unit tests pass; authenticated emulator create/update passes; non-professional callable access is denied; legacy client booking creation remains allowed; direct booking creation with `contacts` is denied.
- **Human steps / Etapes humaines:**
  1. Ouvrez la creation d'une reservation professionnelle et ajoutez plusieurs contacts avec des roles differents. / Open professional booking creation and add multiple contacts with different roles.
  2. Enregistrez, rouvrez Modifier, retirez un contact et modifiez le nom du contact principal. / Save, reopen Edit, remove one contact, and change the primary contact name.
  3. Verifiez que les contacts persistent, qu'un seul contact principal existe et que le planning reste a jour. / Verify contacts persist, exactly one primary remains, and the schedule stays current.
- **Responsive check / Verification responsive:** desktop 1440 px; mobile 375 px; contact rows stack without horizontal overflow.
- **Privacy check / Verification confidentialite:** only an owning professional or administrator can invoke the trusted handlers; contact emails never authorize reads.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-11 - At the human operator's request, Copilot completed the local browser verification at desktop and 375 px mobile widths. Three contacts persisted with normalized email and distinct roles; editing the primary name and removing the payer persisted; cancel/accept removal confirmation behaved correctly; the sidebar and schedule refreshed; no horizontal overflow was detected. Disposable booking and audit records were removed afterward.

### Reservation identity implementation - Verified booking claim / Implementation identite reservation - Liaison verifiee

- **Production owner / Responsable production:** `public/claim-booking.html`, `public/js/client-dashboard/booking-claim.js`, `public/js/client-dashboard/client-bookings.js`, `public/js/pro-dashboard/booking-contacts.js`, `public/js/pro-dashboard/booking-edit.js`, `public/js/admin/admin-dashboard.js`, `functions/booking-claims.js`, `functions/index.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** trusted claim callables own hashed 24-hour single-use tokens, verified-email preview, accept/reject, unlink, conflict review, admin resolution, and immutable audit events. `bookingClaimTokens` denies all browser access; direct writes cannot alter claim or identity fields.
- **Build check / Auto-verification:** Function and browser syntax checks pass; pure claim policy tests pass; the local emulator lifecycle covers issuance, replacement revocation, wrong-email attempts, acceptance, replay denial, unlink, rejection, expiry, conflict, sanitized admin listing, admin resolution, and audit events.
- **Human steps / Etapes humaines:**
  1. Depuis Modifier, envoyez une invitation pour un contact enregistre. / From Edit, send an invitation for a persisted contact.
  2. Ouvrez le lien sans session, connectez-vous avec l'adresse verifiee invitee, puis acceptez. / Open the link while signed out, sign in with the invited verified address, then accept.
  3. Verifiez la reservation dans le tableau client et confirmez que reutiliser le lien est refuse. / Verify the booking in the client dashboard and confirm that reusing the link is denied.
- **Responsive check / Verification responsive:** desktop 1280 px; mobile 375 px; no horizontal overflow and hidden actions remain hidden before successful preview.
- **Privacy check / Verification confidentialite:** preview requires the exact verified Auth email and returns a professional display name instead of an internal UID; raw tokens never enter browser Firestore APIs or logs.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-11 - At the human operator's delegated request, Copilot completed the local browser flow. The professional invitation queued, signed-out handoff returned through login with same-tab session storage, verified preview showed sanitized details, acceptance linked the booking into the client sidebar and schedule, replay was denied, and 375 px width had no horizontal overflow. Client unlink cancellation preserved the link; confirmation removed access while preserving the booking. The admin saw a sanitized conflict without requester identity and denied it through a distinct preservation-specific confirmation. A hidden-state CSS regression discovered during verification was corrected.

### Reservation identity implementation - Recurring booking scope / Implementation identite reservation - Portee des series recurrentes

- **Mockup reference / Reference mockup:** professional schedule booking edit modal and recurring occurrence modification flow.
- **Production owner / Responsable production:** `functions/booking-series.js`, `functions/index.js`, `public/js/pro-dashboard/booking-edit.js`, `firestore.rules`, and `tests/booking-series-emulator.test.cjs`.
- **Data and rules / Donnees et regles:** each occurrence is a separate `bookings/{bookingId}` document sharing `seriesId` and `occurrenceIndex`; the trusted update accepts `this`, `this-and-following`, or `all-in-series`, uses an idempotent request ID, emits `booking-series-modified`, and denies direct series, identity, and mail writes. Client, professional, admin, anonymous, and message-thread boundaries are covered by local emulator tests.
- **Build check / Auto-verification:** recurring policy, contact preservation, deterministic affected sets, retry idempotency, partial-failure reporting, direct-write restrictions, client cancellation rules, professional update allow-lists, and authorized message reads pass in the local emulator suite.
- **Human steps / Etapes humaines:**
  1. Créez trois occurrences d'une même série et ouvrez Modifier sur la deuxième. / Create three occurrences in one series and open Edit on the second.
  2. Testez Cette occurrence, Cette occurrence et les suivantes, puis Toute la série. / Test This occurrence, This occurrence and following, then Entire series.
  3. Vérifiez les dates modifiées, la conservation des contacts, le résultat après nouvelle tentative et l'absence de débordement à 375 px. / Verify changed dates, contact preservation, retry behavior, and no overflow at 375 px.
- **Responsive check / Verification responsive:** desktop 1280 px; mobile 375 px; scope selector and feedback remain readable without horizontal overflow.
- **Privacy check / Verification confidentialite:** anonymous and unrelated clients cannot read bookings or messages; direct series, identity, and mail writes are denied; linked clients, owning professionals, and admins see only their authorized data.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Verified locally on Firebase emulator: seeded pro account with verified custom claims, created multi-occurrence series, edited series scopes (this, this-and-following, all-in-series) via pro dashboard edit modal. Trusted callable `updateProfessionalBooking` executed successfully without 403 authorization errors and schedule grid rendered occurrences cleanly without 375 px overflow.


### Reservation identity implementation - Consent history-sharing relationship / Implementation identite reservation - Partage d'historique consenti

- **Mockup reference / Reference mockup:** none in the original mockup; extends the Phase 9 client dashboard bookings sidebar and navbar settings menu with a new "Partage d'historique" panel.
- **Production owner / Responsable production:** `firestore.rules`, `functions/index.js` (`recordHistoryShareAudit`), `public/js/client-dashboard/client-history-share.js`, `public/js/client-dashboard/client-bookings.js`, `public/js/client-dashboard/client-dashboard.js`, `public/js/client-dashboard/navbar-client.js`, `public/js/core/strings-fr.js`, `public/assets/css/client-dashboard.css`, and `tests/client-relationships-emulator.test.cjs`.
- **Data and rules / Donnees et regles:** `clientRelationships/{deterministicId}` allows the requester to create a `pending` record, the named recipient alone to approve it, and either named party to revoke it (with `revokedBy` required to match the acting UID); all other fields and both UIDs are immutable after creation. `bookings` reads are extended so an `active` relationship grants the counterpart read-only access to the matching `booking`, `professional`, or `all` scope; no relationship state grants any booking write. Direct client writes to `logs` remain denied; a dedicated Firestore trigger emits `history-share-requested`, `history-share-approved`, and `history-share-revoked` audit events.
- **Build check / Auto-verification:** `node --check` passes for all changed/new modules; the local emulator rules test covers pre-consent denial, self-targeting and UID-forging rejection, pending-state denial, recipient-only approval, active-state read access, field-immutability rejection, requester/recipient-only revocation with honest actor attribution, and post-revocation denial.
- **Human steps / Etapes humaines:**
  1. Depuis une reservation avec un contact deja verifie (guardian/payer lie), cliquez "Partager l'historique avec {nom}". / From a booking with an already-verified linked contact (guardian/payer), click "Partager l'historique with {nom}".
  2. Connectez-vous avec le compte du contact invite, ouvrez Mon compte puis "Partage d'historique", et acceptez la demande recue. / Sign in as the invited contact's account, open Mon compte then "Partage d'historique", and accept the incoming request.
  3. Verifiez que la reservation apparait en lecture seule (aucune action d'acceptation/annulation) puis revoquez le partage et verifiez sa disparition immediate. / Verify the booking appears read-only (no accept/cancel action) then revoke the share and verify it disappears immediately.
- **Responsive check / Verification responsive:** desktop 1440 px; mobile 375 px; the history-share panel list wraps without horizontal overflow.
- **Privacy check / Verification confidentialite:** an unrelated third account can neither read nor act on a relationship record; a pending (not yet approved) request grants no booking access; revocation removes future read access while preserving the underlying booking and audit history.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Verified locally on Firebase emulator with two seeded client accounts: history-share request initialized from a booking with a verified guardian contact, recipient panel displayed incoming request, approval granted read-only booking visibility in recipient dashboard, and revocation immediately removed access while emitting required audit events.


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
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Verified locally on Firebase emulator stack: submitted application with PDF on request-professional.html, received confirmation message "Demande reçue. Consultez votre email pour confirmer votre adresse.", document created in Firestore professionalRequests and Storage, verified status transitioned to pending-review, and admin account signed into admin-dashboard.html to review and provision account.
- **Human confirmation / Confirmation humaine:** 2026-09-26 - Operator confirmed professional accounts can be created. This confirms the provisioning capability generally; the separate `jr.booking.premium@gmail.com` application remains `awaiting-email-verification` until its refreshed verification link is opened and an admin approves it.

### Phase 13 - Admin reissue of professional verification email / Renvoi admin du courriel de vérification professionnelle

- **Status / Statut:** `AI VERIFIED - HUMAN CHECK OPTIONAL`
- **Production owner / Responsable production:** `functions/index.js` (`resendProfessionalApplicationVerification`), `public/js/admin/admin-dashboard.js`, `public/js/core/strings-fr.js`, `public/admin-dashboard.html`, and `tests/professional-application-verification-emulator.test.cjs`.
- **Behavior / Comportement:** an admin can reissue a verification link only while the application remains `awaiting-email-verification` and `emailVerificationStatus` is `pending`. The trusted callable rotates the token hash, sets a new 48-hour expiry, queues a new verification message, and writes a safe audit event. It allows at most one resend per minute and five resends total. The admin UI only shows the action for that state; verified applications use the existing review/provision flow.
- **Security / Securite:** the callable rechecks the admin claim, never returns the raw token, and invalidates the previous link by replacing its hash. Token, mail, and audit writes are in one Firestore transaction. The public application submission flow and duplicate suppression remain unchanged.
- **Evidence / Preuves:** focused Node 22 emulator test passed, covering admin authorization, token rotation, 48-hour expiry, one queued email, cooldown, resend limit, and rejection after verification. Full Node 22 QA passed 80/80 tests across 38 files and 73 syntax files. A guarded dry run and selective deployment created `resendProfessionalApplicationVerification` and released Hosting only. Live checks confirmed the callable runs on Node 22, the admin page and cache-busted strings load with HTTP 200, the resend UI marker/label are present, and the existing production application remains pending.
- **Remaining blocker / Blocage restant:** the existing applicant must receive a newly reissued email, open its link within 48 hours, and then an admin must review/approve the application. Production mailbox delivery was separately confirmed on 2026-09-25.
- **Next implementation slice / Prochaine tranche:** in the admin dashboard, use `Renvoyer le lien de vérification` on the existing `awaiting-email-verification` card; then verify the new link, approve after the status becomes `pending-review`, and confirm the existing Auth user is provisioned with a professional profile.


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
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Verified locally on desktop (1440 px) and mobile (375 px) viewports across glass panels, modals, dropdowns, toasts, and navigation controls. No horizontal overflow or layout masking detected.


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
- [x] **Client dashboard shell (Phase 9):** `client-dashboard.html`, navbar with account settings dropdown and profile editor, bookings sidebar with pending/accepted/rejected filters, professional-made-booking confirmation marking, accept/cancel/request-change actions. Client-created bookings now set the authenticated user's `clientId`; professional-created bookings become visible after a verified claim, so the sidebar is no longer limited to an empty guest-only state.
- [x] **Public profile and client booking request slice:** `profile.html` loads visible `publicProfiles` fields and anonymous `busySlots`, landing search results link to profiles, and authenticated clients can create pending bookings with their own `clientId`.
- [x] **Phase 10 payment-info slice:** professional settings now include a private payment popup for RIB details, bank-transfer/Wero toggles, vetted-bank selections, custom payment links, and rate per time unit, persisted under `proProfiles.paymentInfo`.
- [x] **Phase 10 movement-settings slice:** professional settings now include online/movement toggles, a private address, Leaflet map/geocoding action, transportation visibility, and distance-band fee rows persisted under `proProfiles.movementInfo`.
- [x] **Phase 10 client-address prerequisite:** client profile settings now persist a private movement address under `clientAccounts/{clientId}.address`, ready for booking-scoped movement pricing.
- [x] **Phase 10 booking-scoped movement quote:** client-created bookings carry the client's own address, the professional calculates route distance/travel time and the matching zone, and only the resulting `movementQuote` is saved to the booking and displayed to the involved client. AI browser smoke test passed with a 4.3 km route and 5 € surcharge; human confirmation remains required.
- [x] **Client current-week schedule:** the client dashboard now renders a read-only seven-day calendar from the client's authorized bookings; the verified booking appears on its scheduled day and time alongside the sidebar status view.
- [x] **Phase 10 client payment-context implementation:** the client navbar now selects an active booking and renders only its sanitized payment options, balance, duration, and external payment link; payment context is written to the booking by the involved professional.
- [x] **Phase 9b client professional search, lock, and favorites:** a search bar above "Mes réservations" finds professionals by name, locks one professional's `busySlots` onto the client's own calendar (unlocking clears it), and saves/removes professionals from a persistent favorites list on `clientAccounts.savedProfessionals`. AI browser smoke test passed against local emulators; human confirmation remains required.
- [x] **Phase 11 CRM:** profile-scoped block/unblock, pending `platformBanRequest`, typed `eraseRequest` with exact phrase `SUPPRIMER CE CLIENT`, 30-day grace cancellation, fifteen-entry booking/status history with type/date filters, and a print-ready local PDF report export. Booking status changes append ISO events to `bookings.statusHistory`. Booking security was also tightened so client updates are limited to their own pending booking's `status/start/end` and professional updates are limited to operational/context fields. Full browser verification of populated CRM controls remains pending; adversarial role tests remain a later QA task.
- [x] **Phase 12 statistics and print/export:** date/status filters, booking count, completed/in-progress revenue, completion rate, no-show rate, rejected count, status-distribution bars, and print-ready filtered activity/schedule reports, all calculated at read time from authorized bookings. Verified end to end in the browser with a seeded five-booking dataset (17% completion, 17% no-show, correct per-status counts); a `document.write` print/export bug was fixed with populated Blob-backed documents.
- [x] **Phase 13 admin review, provisioning, and lifecycle:** `admin-dashboard.html` protected by the admin claim; pending `professionalRequests` review with Storage verification links; `provisionProfessionalAccount` callable assigns professional claims, creates `proProfiles`/`publicProfiles`, and marks the request provisioned; recent audit-log panel; `setAccountBanStatus` ban/reinstate callable preserves role claims while toggling `banned`; support-ticket and data-request queues with controlled status transitions. Verified end to end against local emulators with Admin SDK state checks; the human phase-gate entry above covers the email-first applicant flow separately.
- [x] **Phase 14 Google Calendar OAuth authorization:** the authenticated `getGoogleCalendarAuthUrl` callable creates short-lived single-use state, the callback validates state and exchanges the Google code server-side, and only the refresh token is stored in server-only `gcalTokens/{uid}`; the browser never receives OAuth secrets or refresh tokens. Deployed successfully with a selective deploy; end-to-end OAuth with a real Google account and the event-import phase above remain pending.
- [x] **Additional booking contacts:** professional create/update callables normalize up to ten contacts with exactly one primary and roles `primary`/`guardian`/`payer`/`participant`/`assistant`, writing immutable audit events; direct contact/identity injection is denied by `firestore.rules`.
- [x] **Human phase sign-off:** Phase 2, Phase 4, Phase 5, Phase 9b, Phase 13, and all reservation identity slices have been verified locally and marked `Pass`.
- [x] **Verified booking claims:** trusted issuance, single-use verified-email preview, acceptance, rejection, unlinking, conflict recovery, admin resolution, audit events, professional invitation control, and authenticated client claim page.
- [x] **Recurring booking occurrences and explicit scope:** trusted occurrence selection, `this`, `this-and-following`, `all-in-series`, idempotent mutation, UI selector, audit event, and adversarial local emulator coverage.
- [x] **Consent history-sharing relationship:** rules-enforced request/approve/revoke lifecycle on `clientRelationships`, derived read-only booking access for an active grant, typed audit events, client-dashboard request/approve/revoke UI, and adversarial local emulator coverage.

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
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Verified locally on emulator and browser: `initializeCalendarSync` modal rendered mode selection (ghost/solid), reminder minutes, and watch registration control; settings persisted to `proProfiles`; missing OAuth credentials produced localized feedback; `syncGoogleCalendar` returned sanitized event arrays without exposing raw tokens; the authenticated watch path stores server-only channel metadata; and the professional booking context menu exposes the server-side Calendar create/update action. Production checks confirmed Trigger Email `0.2.10` is active and `GOOGLE_CLIENT_SECRET` exists in Firebase Secret Manager without exposing its value. Live callback rewrite verified at `https://jr-booking-premium.web.app/api/calendar/google/callback`; the schedule refetches bounded ranges on navigation and 1/3/7-day changes. `calendarWebhook`, `watchGoogleCalendar`, `syncBookingToGoogleCalendar`, and the scheduled idempotent `calendarReminderWorker` are deployed. The worker uses `reminderMinutes`, accepted bookings, the mail queue, and a transactional duplicate guard; real Google consent and real-mailbox reminder delivery remain credential-dependent.

### Phase 14 - Real Google OAuth and sandbox synchronization / Consentement OAuth et synchronisation sandbox

- **Status / Statut:** `HUMAN + AI VERIFIED`
- **Target outcome / Resultat vise:** complete Google OAuth consent for a sandbox account and verify a Calendar sync against the production callback/configuration.
- **Evidence / Preuves:** on 2026-09-26 the operator reported successful OAuth consent and that Google Calendar sync works. The live Functions inventory and callback route were already verified. The consent screen displayed the expected unverified-app warning for an external app and a 100-user cap.
- **Security / Securite:** consent was granted by the operator to JR Booking Premium for the Calendar scope. OAuth refresh tokens remain server-side in `gcalTokens`; the browser receives sanitized event data only.
- **Remaining blocker / Blocage restant:** none for sandbox consent/sync. Google app verification and scope approval remain necessary if the service is opened to broader public use beyond Google's unverified-app limit.
- **Next implementation slice / Prochaine tranche:** proceed with the known client professional-application verification/provisioning; treat Google app verification as a separate public-launch requirement.


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
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Verified locally on Firebase emulator in browser: opened pro-dashboard.html with test professional account, configured working hours and added absence exception, saved settings, verified "Horaires enregistrés." status feedback and persistence across page reloads.


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
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Verified locally on browser and emulator: public search, category navigation, profile view, and anonymous schedule rendering expose only start/end/status with zero client details.

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
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Verified locally on browser and emulator: professional sidebar/schedule interaction, booking editing modal, done/no-show status transitions, batch actions, and responsive layout.


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
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Verified locally on Auth emulator: client registration, login role selection, reset link trigger, magic link flow, and professional dashboard redirect.

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
  3. Repliez puis affichez la sidebar; verifiez que les sept jours du planning restent visibles sans defilement horizontal. / Collapse then expand the sidebar; verify that all seven schedule days remain visible without horizontal scrolling.
  4. Verifiez que la grille du planning affiche une vue vide sur sept jours sans donnees de client. / Verify the schedule grid shows an empty seven-day view without client data.
- **Responsive check / Verification responsive:** desktop width 1440 px with the sidebar open and mobile width 375 px with the schedule first; all selected days fit inside the schedule panel without horizontal dragging and all day/time/slot/booking text is centered in its cell.
- **Privacy check / Verification confidentialite:** anonymous users are redirected to login; the shell renders no private booking, client, payment, or message fields.
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-14 - The schedule's fixed 860 px minimum was removed; focused CSS assertions confirm flexible day tracks and compact mobile sizing. Previous Auth emulator verification covered login, settings, sidebar toggle, responsive breakpoint, and the empty 7-day grid.

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
- **Human result / Resultat humain:** `Pass`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Verified locally on browser and emulator: search matched seeded professionals with id tooltips, schedule locking rendered busy slots as "Indisponible", unlock cleared overlay, favoriting persisted across reloads, and multi-professional locking rendered isolated busy slots without state leakage. - Implemented and AI authenticated browser smoke test passed against local emulators (search matched a seeded professional, lock rendered the seeded busy slot as "Indisponible" on the correct day/hour, unlock cleared it immediately, saving/removing a favorite persisted correctly across a page reload). Human confirmation remains required. Fixed a follow-up bug found by the human: locking a professional who was not also saved as a favorite left no way to unlock (only the favorites chip toggled lock state); added a persistent "Planning verrouille" banner with its own "Deverrouiller" button, shown whenever a professional is locked regardless of favorites, and re-verified unlock works from it. Redesigned per human feedback: replaced the banner with a small chip/bubble merged into the favorited-professionals row (lock icon, active color); replaced the favorites list's remove ("x") control with a heart toggle (empty outline vs filled red) fully independent of lock state; added a hover tooltip showing the professional's `idTag` both in search results and in the chip row. Re-verified live: id tooltip shows before any action, heart favorite/unfavorite does not disturb the locked chip's position or lock state, unlock still works by clicking the chip body. Extended smoke test to three seeded professionals (Camille Rousseau, Sofia Martins, Yanis Belkacem) with distinct busy slots on the same day: search returned all three with distinct id tooltips; favorited all three; locking each in turn correctly showed only that professional's own busy slot and lock icon, with no cross-professional overlay or state leakage; unlocking cleared the overlay while leaving the favorites row untouched; all three favorites persisted together across a reload. Fixed a visual bug found by the human via screenshot comparison: the heart icon's custom path rendered as an indistinct blob at 12px (notch between the two lobes not visible), and a CSS specificity bug (`.professional-chip button { color: inherit }` outranking `.professional-chip-heart`'s intended muted color) made the unfavorited heart's color unreliable; replaced the path with a standard symmetric heart glyph at 14px and raised the heart-color rules' specificity so both empty-outline and filled-red states render crisply and reliably; lock icon confirmed to already render only on the actually-locked chip (verified across all three professionals), not "always present".

### Phase 8 - Private booking preparation notes / Notes privees de preparation

- **Mockup reference / Reference mockup:** professional booking sidebar and context menu private-note action.
- **Production owner / Responsable production:** `public/js/pro-dashboard/booking-prep-notes.js`, `public/js/pro-dashboard/booking-context-menu.js`, `public/js/sidebar/sidebar-feed.js`, `public/js/pro-dashboard/pro-dashboard.js`, `firestore.rules`.
- **Data and rules / Donnees et regles:** `bookings/{bookingId}/private/professional.prepNotes` is capped at 2000 characters and read/written through owner/admin-only callables. The parent booking never contains the note; clients, shared-history readers, and delegates are denied by rules.
- **Build check / Auto-verification:** focused syntax and diff checks pass; `tests/delegated-access-emulator.test.cjs` proves owner read/write and client/delegate direct-read denial. Browser verification remains pending.
- **Human steps / Etapes humaines:**
  1. Ouvrez une reservation depuis la sidebar puis choisissez Note privee. / Open a booking from the sidebar and choose Private note.
  2. Ecrivez une note, enregistrez-la, fermez puis rouvrez l'editeur. / Write a note, save it, close and reopen the editor.
  3. Verifiez que le client et le profil public ne voient jamais cette note. / Verify the client and public profile never see the note.
- **Responsive check / Verification responsive:** desktop 1440 px and mobile 375 px; the note modal remains readable without horizontal overflow.
- **Privacy check / Verification confidentialite:** only the owning professional profile or an administrator can read/update the separate private document; the client and delegate cannot read, write, or receive it through booking projections.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-14 - Private notes moved out of client-readable booking documents into an owner/admin-only subdocument; emulator privacy assertions pass. Browser verification remains pending.

### Phase 8 - Professional quick replies / Reponses rapides professionnelles

- **Mockup reference / Reference mockup:** professional settings menu and booking message composer with reusable message templates.
- **Production owner / Responsable production:** `public/js/pro-dashboard/quick-replies.js`, `public/js/pro-dashboard/navbar-pro.js`, `public/js/pro-dashboard/pro-dashboard.js`, `public/js/shared/booking-messages.js`, `public/js/core/strings-fr.js`, and `firestore.rules`.
- **Data and rules / Donnees et regles:** up to 20 `{label,body}` templates are stored privately in `proProfiles/{profileId}.quickReplies`; only profile owners or administrators can read/update them. Selecting a template only fills the composer; final message creation still uses `sendBookingMessage`.
- **Build check / Auto-verification:** complete serial local emulator suite passes 37/37; focused module syntax checks and editor diagnostics pass; `git diff --check` passes. Browser interaction remains pending.
- **Human steps / Etapes humaines:**
  1. Ouvrez Reglages puis Reponses rapides et creez deux modeles. / Open Settings then Quick replies and create two templates.
  2. Ouvrez un fil de reservation, selectionnez un modele et modifiez le texte avant l'envoi. / Open a booking thread, select a template, and edit the text before sending.
  3. Verifiez qu'un client ne voit ni les modeles ni l'editeur de reglages. / Verify a client sees neither the templates nor the settings editor.
- **Responsive check / Verification responsive:** desktop 1440 px and mobile 375 px; template rows and the composer wrap without horizontal overflow.
- **Privacy check / Verification confidentialite:** templates remain in the owning private professional profile and are never copied into public profile, client, booking, or mail data.
- **Human result / Resultat humain:** `Pending`
- **Date, tester, notes / Date, testeur, notes:** 2026-09-13 - Settings module, active-profile wiring, and composer selection implemented; browser verification remains pending.
