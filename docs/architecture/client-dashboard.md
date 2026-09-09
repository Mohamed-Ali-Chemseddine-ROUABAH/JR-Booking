# Client dashboard architecture

- **Production file:** `public/client-dashboard.html`
- **Purpose:** Phase 9 client dashboard: navbar with account settings dropdown, current-week read-only schedule, and a bookings sidebar listing the client's own reservations.
- **Imports:** `public/js/client-dashboard/client-dashboard.js`, `navbar-client.js`, `client-bookings.js`, `client-profile-settings.js`, `client-request-change.js`, `client-professional-search.js`, `public/js/core/auth-guard.js`, `public/js/core/strings-fr.js`, `public/assets/css/client-dashboard.css`.
- **DOM owner:** The page owns only the top-level roots; each module initializes its own root with explicit setup functions, mirroring the professional dashboard shell.
- **Firestore/Storage:** Reads the client's own bookings and client profile data; the schedule module receives the already-authorized booking DTOs from `client-dashboard.js`.
- **Security rules:** Access is gated through `requireAuth({ allowedRoles: ["client", "authenticated"] })` since client accounts carry no custom claim and resolve to the `authenticated` role fallback in `auth-guard.js`.
- **Feature flag:** None yet; reuses the existing authenticated-dashboard gate.
- **Mockup references:** Client dashboard navbar/sidebar in `docs/requirements/MASTER_SPECIFICATION.md` Part 7.
- **Known scope gap:** Client payment-context controls remain pending. The client "accept" / "request a date change" / "cancel" actions and current-week schedule are implemented and Firestore-verified against `firestore.rules`.
- **Planned addition (Phase 9b):** implemented. A professional search bar above the bookings sidebar lets the client lock/unlock one professional's `busySlots` overlay onto the schedule and save professionals to a favorites list on `clientAccounts.savedProfessionals`. See `docs/architecture/js/client-dashboard/client-professional-search.md`.
