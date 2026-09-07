# Client dashboard orchestrator architecture

- **Production file:** `public/js/client-dashboard/client-dashboard.js`
- **Purpose:** Client dashboard entry point: gates the page through `requireAuth`, loads the client's own bookings, resolves each booking's professional display name from `publicProfiles`, and wires accept/cancel/request-change actions.
- **Imports:** `requireAuth`, `signOutCurrentUser` from `core/auth-guard.js`; Firebase Firestore `collection`, `doc`, `getDoc`, `getDocs`, `query`, `where`; `showNotification` from `shared/notifications.js`; `navbar-client.js`, `client-bookings.js`, `client-profile-settings.js`, `client-request-change.js`; `updateBookingStatus` from `pro-dashboard/booking-actions.js` (reused as-is).
- **Firestore:** Reads `bookings` where `clientId == uid`, reads `publicProfiles/{proId}` for the professional's `displayName` per booking, and updates `bookings/{bookingId}.status` on accept/cancel.
- **Security rules:** `requireAuth({ allowedRoles: ["client", "authenticated"] })` — client accounts have no custom claim yet, so `getUserRole` resolves them to `authenticated`, matching the same fallback `login.html` relies on for `getRoleHomePath`.
- **Mockup references:** Client dashboard bookings and account actions in `docs/requirements/MASTER_SPECIFICATION.md` Part 7.
- **Verification:** No formal Phase 9 entry yet in `docs/verification/VERIFICATION_LOG.md`; tracked in the completed-implementation-slices checklist until a dedicated entry is prepared.
