# Professional dashboard architecture

- **Production file:** `public/pro-dashboard.html`
- **Purpose:** Phase 4 professional dashboard shell with protected navbar, responsive sidebar feed stub, and seven-day schedule grid stub.
- **Imports:** `public/js/pro-dashboard/pro-dashboard.js`, `public/js/pro-dashboard/navbar-pro.js`, `public/js/sidebar/sidebar-feed.js`, `public/js/schedule/schedule-render.js`, `public/js/core/auth-guard.js`, `public/js/core/strings-fr.js`.
- **Settings menu wiring:** `navbar-pro.js` opens `working-hours.js` for the first settings item and `personal-info.js` for the fifth ("Informations personnelles"), matching the fixed order of `UI_STRINGS.proDashboard.navbar.settingsItems`; the remaining items are not yet wired to a module.
- **DOM owner:** The page owns only the top-level roots; each module initializes its own root with explicit setup functions.
- **Firestore/Storage:** No reads or writes in Phase 4 shell. Booking data remains absent until the schedule and sidebar flows are connected to authorized DTOs.
- **Security rules:** Access is gated through Firebase Auth and professional role claims before rendering dashboard controls.
- **Feature flag:** `proBookingOperations`, still off until booking operations are implemented and verified.
- **Mockup references:** Pro schedule and pro sidebar rows in `docs/mockups/IMPLEMENTATION_REFERENCE.md`; responsive order follows Part 6.3 of `docs/requirements/MASTER_SPECIFICATION.md`.
- **Verification:** Phase 4 entry in `docs/verification/VERIFICATION_LOG.md`.