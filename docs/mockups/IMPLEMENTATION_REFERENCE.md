# Mockup Frontend Implementation Reference / Reference d'implementation frontend du mockup

## Purpose / Objectif

`docs/mockups/jr-booking-premium-mockup.html` is the single visual and interaction reference for the product frontend. It is a local prototype only: it uses in-memory mock data, direct DOM rendering, and simulated results. It must never be copied into `public/` as a production page or connected to Firebase as one large file.

`docs/mockups/MASTER_MOCKUP.md` remains the source for the instrument-grade monochrome glass visual system. The current mockup defines the interaction flow. The production website must look and behave like the current mockup for the same role and viewport while replacing its mock data with authorized production data.

`docs/mockups/jr-booking-premium-mockup.html` est l'unique reference visuelle et interactive du frontend. C'est un prototype local : il utilise des donnees fictives en memoire, du rendu DOM direct et des resultats simules. Il ne doit jamais etre copie dans `public/` comme page de production ni connecte a Firebase dans un unique fichier.

`docs/mockups/MASTER_MOCKUP.md` reste la source du systeme visuel monochrome glass instrument-grade. Le mockup actuel definit le parcours interactif. Le site de production doit ressembler et se comporter comme le mockup actuel pour le meme role et la meme taille d'ecran, tout en remplacant ses donnees fictives par des donnees de production autorisees.

## Non-Negotiable Product Contracts / Contrats produit non negociables

- Public visitors and clients can see an unavailable time range but never another client's identity, message, notes, payment, service, or contact details.
- Professionals can see and manage booking details only for their own active profile. Delegates receive only their assigned permissions.
- A client booking created by a professional remains pending until that client accepts or requests a change.
- `done` is the source of truth for reporting and completed-revenue calculations. `no-show` remains separate from cancellation and rejection.
- Destructive actions require a plain-French confirmation; permanent erasure follows the shared 30-day grace-period mechanism.
- Forms save drafts automatically in the UI. Production persistence, validation, authorization, and audit logging are separate responsibilities.
- All user-facing production strings must move to the appropriate `strings-fr` module. Do not preserve mockup inline copy as production literals.

## Current Prototype Coverage / Couverture actuelle du prototype

| Area / Zone | Mockup behavior / Comportement mockup | Production destination / Destination production |
| --- | --- | --- |
| Landing and search / Accueil et recherche | Name/category search, empty results, public profile route | `search/search-professional.js`, `search/search-category.js`, `profile.html`, `category.html` |
| Public profile / Profil public | Visible profile fields, anonymous occupied slots, 1/3/7-day display | `profile-public/profile-view.js`, `schedule/schedule-render.js`, `busySlots` read model |
| Auth / Authentification | Login role preview, registration form, password-reset feedback | `login.html`, `register-client.html`, `core/auth-guard.js`, Firebase Auth |
| Client dashboard / Tableau client | Own bookings, unavailable anonymous slots, payment selection, timezone/profile panels, accept/change request | `client-dashboard.html`, `client-dashboard/navbar-client.js`, `client-bookings.js`, `client-profile-settings.js`, `client-intake-form.js` |
| Client dashboard professional search / Recherche professionnel (tableau client) | Search bar above own bookings, lock one professional's anonymous unavailable slots onto own calendar, unlock, save/remove favorites, one locked schedule visible at a time | `client-dashboard.html`, `client-dashboard/client-professional-search.js` |
| Pro schedule / Planning pro | 1/3/7 days, collapse/resize feed, slots, right-click menu, double-click creation, drag booking preview | `pro-dashboard.html`, `schedule/schedule-render.js`, `schedule-slot-method.js`, `schedule-drag-method.js`, `schedule-recurrence.js`, `schedule-timezone.js` |
| Pro sidebar / Sidebar pro | Pending/accepted/rejected filters, edit, accept/reject, done, no-show, selection/batch preview, messages/notes/links | `sidebar/sidebar-feed.js`, `booking-detail.js`, `booking-actions.js`, `batch-actions.js`, `custom-pricing.js`, `waitlist.js` |
| Pro settings / Reglages pro | Hours, break, absence, payment, work type, movement, service, intake, profile and delegate panels | matching modules under `pro-dashboard/` |
| CRM and reports / CRM et rapports | Client list/history, tags, blocking confirmation, stats and local export preview | `pro-dashboard/client-database.js`, `statistics.js`, `activity-reporting.js`, `shared/export-data.js`, `shared/print-reports.js` |
| Calendar / Calendrier Google | OAuth, ghost/solid mode and sync represented as UI only | `schedule/schedule-gcal-sync.js` plus `functions/index.js` OAuth handlers |
| Professional request / Demande pro | Form, upload selection, pending tracker | `request-professional.html`, `request-professional/request-form.js`, Firebase Storage |
| Admin / Administration | Command center, applications, tickets, creation links, logs, ban confirmation, broadcasts, privacy, flags | matching modules under `admin/` |

## Extraction Rules / Regles d'extraction

1. Extract by page and owner, never by copying arbitrary script blocks. A page shell contains markup only and imports its page entry module.
2. Extract shared UI primitives first: toast, modal manager, dropdown manager, responsive navbar, confirmation dialog, autosave indicator, undo controller, schedule status styles, and export/print helpers.
3. Then extract stateful features into the exact modules listed in Part 2 of `docs/requirements/MASTER_SPECIFICATION.md`.
4. Replace each local mock object with repository test fixtures under `tests/` before replacing it with Firestore. Production modules must not import mock data.
5. A module must own its DOM root through an explicit initializer, for example `initializeSchedule(container, options)`. Do not rely on global selectors or inline `onclick` handlers in production.
6. Preserve behavior before refactoring: add a targeted test or manual verification entry for the mockup interaction before its production equivalent is built.
7. CSS moves to the established files, not a new monolith: base primitives to `base.css`, glass/status primitives to `glass-theme.css`, role/layout rules to `pro-dashboard.css`, `client-dashboard.css`, and `admin.css`.
8. No production module may expose private booking fields on a public or client surface. Render from role-safe DTOs, not from raw Firestore documents.

## Frontend Extraction Order / Ordre d'extraction frontend

1. **Shared foundation**: CSS tokens, `strings-fr.js`, modal/toast/confirmation/undo utilities, responsive navbar, form validation.
2. **Authentication shells**: landing, login, client registration, route guards and role redirects.
3. **Public discovery**: professional/category search, results, profile fields, anonymous `busySlots` schedule.
4. **Professional shell**: navbar, responsive layout, collapsible/resizable sidebar, empty schedule and feed.
5. **Working-time configuration**: hours, recurring breaks, exceptions, absences, day count, timezone, buffer and services.
6. **Schedule creation**: fixed slot and drag methods, activation window, recurrence, conflict display, private booking creation.
7. **Professional booking operations**: detail, accept/reject/modify, done/no-show, messages, links, notes, batch and waitlist.
8. **Client workflow**: own booking schedule, pro-created acceptance/change request, intake, payment context, timezone conversion.
9. **Professional management**: public profile mirror, work type/movement, payment settings, CRM, statistics, reports, quick replies, delegates, direct links.
10. **Admin and external integrations**: admin tools, print/export finalization, Calendar OAuth/sync, extensions/functions.

This order supplements, but does not replace, the phase gates in Part 11 of `docs/requirements/MASTER_SPECIFICATION.md`.

## Required UI Decisions Before Production / Decisions UI obligatoires avant production

| Flow / Flux | Required production decision / Decision requise |
| --- | --- |
| Search / Recherche | Query name and category separately; show `#id` for same-name professionals; render a no-result state. |
| Public/client schedule / Planning public-client | Use only `busySlots` for unknown reservations; label as `Occupé` or `Indisponible`; do not attach click actions. |
| Booking edit / Modification reservation | Require date, start, end, calculated duration, service, recurrence, series scope, custom price, client message, and private prep note where applicable. Reject end times not after start times. |
| Schedule action menu / Menu contextuel | Include done, no-show, accept, reject, pending, modify, messages, links, and private note. Imported ghost Calendar events remain read-only. |
| Payment / Paiement | First select the active reservation when several exist; then show only the payment options authorized for that client/booking. |
| Movement / Deplacement | Exact pro address stays private by default. Render zone, fee, local route and travel estimate only in the authorized booking context. |
| CRM / CRM | Client block is profile-scoped. Platform ban is admin-only. Deletion requires the shared typed-confirmation and 30-day grace flow. |
| Mobile navbar / Navbar mobile | Below the breakpoint, retain the brand and use one accessible menu trigger that contains account, print, notifications, settings and logout. |
| Destructive actions / Actions destructives | Keep the modal open on invalid typed confirmation. Offer immediate undo where an action can safely be reverted. |

## Prototype-Only Boundaries / Limites du prototype

The following are intentionally simulated and must be built against real services in their assigned phase: Firebase Auth, Firestore persistence and security rules, Storage upload, Trigger Email, audit Cloud Function, Google OAuth tokens/webhooks/bidirectional sync, Leaflet/OpenStreetMap routing, external payment navigation, and generated PDF output.

The mockup's local data resets on reload. That is expected and must not be interpreted as product persistence.

## Definition of Done for a Production Extraction / Definition de fini d'une extraction production

- The page imports only its designated modules.
- All French copy comes from the relevant strings module.
- The matching architecture document describes reads, writes, rules and imports.
- Emulator tests cover relevant anonymous, client, professional, delegate and admin permissions.
- The behavior matches the mockup for the same role, viewport and state.
- The feature is behind its configured feature flag until a human marks the matching entry in `docs/verification/VERIFICATION_LOG.md` as passed.