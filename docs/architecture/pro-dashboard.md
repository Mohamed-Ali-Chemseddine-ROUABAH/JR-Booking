# Professional dashboard architecture

- **Production file:** `public/pro-dashboard.html`
- **Purpose:** Phase 4 professional dashboard shell with protected navbar, responsive sidebar feed stub, and seven-day schedule grid stub.
- **Imports:** `public/js/pro-dashboard/pro-dashboard.js`, `public/js/pro-dashboard/navbar-pro.js`, `public/js/sidebar/sidebar-feed.js`, `public/js/schedule/schedule-render.js`, `public/js/core/auth-guard.js`, `public/js/core/strings-fr.js`.
- **Settings menu wiring:** `navbar-pro.js` opens `working-hours.js` for the first settings item and `personal-info.js` for the fifth ("Informations personnelles"), matching the fixed order of `UI_STRINGS.proDashboard.navbar.settingsItems`; the remaining items are not yet wired to a module.
- **DOM owner:** The page owns only the top-level roots; each module initializes its own root with explicit setup functions.
- **Firestore/Storage:** The dashboard discovers `proProfiles` documents whose `owners` array contains the authenticated professional UID. When more than one profile exists, the navbar selector stores the selected profile ID in same-origin session storage and reloads the dashboard; schedule, booking, settings, CRM, and statistics modules receive the selected profile ID as their profile context while Firebase Auth remains the original owner identity.
- **Multi-profile provisioning:** Administrators create additional owned profile documents through `createAdditionalProfessionalProfile`, which writes the private profile, public mirror, and audit event without creating a second Auth account.
- **Security rules:** Access is gated through Firebase Auth and professional role claims before rendering dashboard controls.
- **Feature flag:** `proBookingOperations`, still off until booking operations are implemented and verified.
- **Mockup references:** Pro schedule and pro sidebar rows in `docs/mockups/IMPLEMENTATION_REFERENCE.md`; responsive order follows Part 6.3 of `docs/requirements/MASTER_SPECIFICATION.md`.
- **Verification:** Phase 4 entry in `docs/verification/VERIFICATION_LOG.md`.