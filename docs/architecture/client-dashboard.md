# Client dashboard architecture

- **Production file:** `public/client-dashboard.html`
- **Purpose:** Phase 9 client dashboard shell: navbar with account settings dropdown and a bookings sidebar listing the client's own reservations.
- **Imports:** `public/js/client-dashboard/client-dashboard.js`, `navbar-client.js`, `client-bookings.js`, `client-profile-settings.js`, `client-request-change.js`, `public/js/core/auth-guard.js`, `public/js/core/strings-fr.js`, `public/assets/css/client-dashboard.css`.
- **DOM owner:** The page owns only the top-level roots; each module initializes its own root with explicit setup functions, mirroring the professional dashboard shell.
- **Firestore/Storage:** No schedule surface yet — clients book through a professional's public profile (a later phase); this shell only reads/writes the client's own data.
- **Security rules:** Access is gated through `requireAuth({ allowedRoles: ["client", "authenticated"] })` since client accounts carry no custom claim and resolve to the `authenticated` role fallback in `auth-guard.js`.
- **Feature flag:** None yet; reuses the existing authenticated-dashboard gate.
- **Mockup references:** Client dashboard navbar/sidebar in `docs/requirements/MASTER_SPECIFICATION.md` Part 7.
- **Known scope gap:** No production flow yet links a real `clientId` to a booking (professional-made bookings are still guest-only, and there is no client-facing booking creation flow), so the sidebar renders its empty state until those flows land. The client "accept" / "request a date change" / "cancel" actions are implemented and Firestore-verified against `firestore.rules` for whenever linked bookings exist.
